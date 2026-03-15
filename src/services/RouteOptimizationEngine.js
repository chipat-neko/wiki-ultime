import { findOptimalRoute, calcQTravelTime, calcDistance } from '../utils/calculations.js';
import { STATIONS } from '../datasets/stations.js';
import { COMMODITIES } from '../datasets/commodities.js';

/**
 * Advanced route optimization engine.
 * Combines commodity trade data with station distances to find
 * the most profitable multi-stop trade routes.
 */
class RouteOptimizationEngineClass {
  /**
   * Find the best single trade leg between two stations.
   * @param {string} fromId - Origin station ID
   * @param {string} toId - Destination station ID
   * @param {number} cargoSCU - Available cargo in SCU
   * @param {boolean} includeIllegal - Whether to include illegal commodities
   * @returns {object} Best trade opportunity
   */
  findBestTrade(fromId, toId, cargoSCU = 100, includeIllegal = false) {
    const from = STATIONS.find(s => s.id === fromId);
    const to = STATIONS.find(s => s.id === toId);
    if (!from || !to) return null;

    const candidates = COMMODITIES
      .filter(c => !c.illegal || includeIllegal)
      .map(c => {
        const profitPerScu = c.sellPrice.avg - c.buyPrice.avg;
        const totalProfit = profitPerScu * cargoSCU;
        return { commodity: c, profitPerScu, totalProfit };
      })
      .filter(t => t.profitPerScu > 0)
      .sort((a, b) => b.profitPerScu - a.profitPerScu);

    return candidates[0] || null;
  }

  /**
   * Build a multi-hop trade route optimized for profit per hour.
   * @param {object} params
   * @param {string} params.startId - Starting station ID
   * @param {number} params.cargoSCU - Cargo capacity
   * @param {number} params.maxHops - Max stops (default 4)
   * @param {number} params.maxTimeMin - Time budget in minutes
   * @param {boolean} params.includeIllegal
   * @returns {object} Optimized route result
   */
  optimizeMultiHop({ startId, cargoSCU = 100, maxHops = 4, maxTimeMin = 120, includeIllegal = false }) {
    const start = STATIONS.find(s => s.id === startId);
    if (!start) return null;

    const legalStations = STATIONS.filter(s => includeIllegal || s.legal);
    const visited = new Set([startId]);
    const route = [{ stationId: startId, station: start, action: null, commodity: null, profit: 0, travelTime: 0 }];

    let totalTime = 0;
    let totalProfit = 0;
    let current = start;

    for (let hop = 0; hop < maxHops - 1; hop++) {
      if (totalTime >= maxTimeMin) break;

      let best = null;
      let bestScore = -Infinity;

      for (const station of legalStations) {
        if (visited.has(station.id)) continue;
        const dist = calcDistance(
          current.coords || { x: 0, y: 0, z: 0 },
          station.coords || { x: Math.random() * 200, y: Math.random() * 200, z: 0 }
        );
        const time = Math.max(5, dist * 0.8 + 10);
        if (totalTime + time > maxTimeMin) continue;

        const trade = this.findBestTrade(current.id, station.id, cargoSCU, includeIllegal);
        if (!trade || trade.totalProfit <= 0) continue;

        const score = trade.totalProfit / time;
        if (score > bestScore) {
          bestScore = score;
          best = { station, trade, time };
        }
      }

      if (!best) break;

      visited.add(best.station.id);
      totalTime += best.time;
      totalProfit += best.trade.totalProfit;
      route.push({
        stationId: best.station.id,
        station: best.station,
        action: 'sell',
        commodity: best.trade.commodity,
        profit: Math.round(best.trade.totalProfit),
        travelTime: Math.round(best.time),
      });
      current = best.station;
    }

    const profitPerHour = totalTime > 0 ? (totalProfit / totalTime) * 60 : 0;

    return {
      route,
      totalProfit: Math.round(totalProfit),
      totalTime: Math.round(totalTime),
      profitPerHour: Math.round(profitPerHour),
      hops: route.length,
      efficiency: Math.min(100, (totalTime / maxTimeMin) * 100),
    };
  }

  /**
   * Score a list of waypoints and find the optimal visiting order.
   * Uses nearest-profitable greedy algorithm.
   * @param {Array} waypoints - Array of waypoint objects with coords and profit
   * @param {object} start - Starting waypoint
   * @returns {Array} Ordered waypoints
   */
  orderWaypoints(waypoints, start) {
    return findOptimalRoute(waypoints, start);
  }

  /**
   * Calculate quantum travel time between two stations.
   * @param {string} fromId
   * @param {string} toId
   * @param {number} qtSpeed - QT drive speed in m/s (default 200 Mm/s)
   * @returns {number} Travel time in seconds
   */
  getQTravelTime(fromId, toId, qtSpeed = 200_000_000) {
    const from = STATIONS.find(s => s.id === fromId);
    const to = STATIONS.find(s => s.id === toId);
    if (!from?.coords || !to?.coords) return null;
    const distGm = calcDistance(from.coords, to.coords);
    return calcQTravelTime(distGm, qtSpeed);
  }
}

export const RouteOptimizationEngine = new RouteOptimizationEngineClass();
export default RouteOptimizationEngine;
