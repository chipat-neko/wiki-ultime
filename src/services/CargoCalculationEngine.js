import { optimizeCargo, calcTradeProfit, calcProfitPerHour } from '../utils/calculations.js';
import { COMMODITIES } from '../datasets/commodities.js';
import { SHIPS } from '../datasets/ships.js';

/**
 * Cargo calculation engine.
 * Provides advanced cargo loading optimization and trade analysis.
 */
class CargoCalculationEngineClass {
  /**
   * Get optimal cargo mix for a ship traveling between two price points.
   * Uses a greedy knapsack approach sorted by profit-per-SCU.
   *
   * @param {object} params
   * @param {string} params.shipId - Ship ID for capacity lookup
   * @param {number} params.capacitySCU - Manual override capacity
   * @param {boolean} params.includeIllegal
   * @param {number} params.budget - Max investment in aUEC (optional)
   * @returns {object} Optimized cargo manifest
   */
  optimizeForShip({ shipId, capacitySCU, includeIllegal = false, budget = Infinity }) {
    const ship = shipId ? SHIPS.find(s => s.id === shipId) : null;
    const capacity = capacitySCU || ship?.cargo || 100;

    const available = COMMODITIES
      .filter(c => !c.illegal || includeIllegal)
      .map(c => ({
        ...c,
        profitPerScu: c.sellPrice.avg - c.buyPrice.avg,
        buyTotal: c.buyPrice.avg * capacity,
      }))
      .filter(c => c.profitPerScu > 0);

    return optimizeCargo(available, capacity, budget);
  }

  /**
   * Calculate profit for a given cargo manifest.
   * @param {Array} items - [{commodity, quantity, buyPrice, sellPrice}]
   * @param {number} fees - Additional fees in aUEC
   * @returns {object} Profit breakdown
   */
  calcManifestProfit(items, fees = 0) {
    let totalCost = 0;
    let totalRevenue = 0;

    items.forEach(({ quantity, buyPrice, sellPrice }) => {
      totalCost += buyPrice * quantity;
      totalRevenue += sellPrice * quantity;
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - fees;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    return { totalCost, totalRevenue, grossProfit, netProfit, margin, roi };
  }

  /**
   * Find the most profitable commodity for a given budget and SCU.
   * @param {number} budget - aUEC available
   * @param {boolean} includeIllegal
   * @returns {Array} Ranked commodity opportunities
   */
  rankOpportunities(budget = Infinity, includeIllegal = false) {
    return COMMODITIES
      .filter(c => !c.illegal || includeIllegal)
      .map(c => {
        const profitPerScu = c.sellPrice.avg - c.buyPrice.avg;
        const maxSCU = budget < Infinity
          ? Math.floor(budget / c.buyPrice.avg)
          : 1000;
        const totalProfit = profitPerScu * maxSCU;
        const roi = c.buyPrice.avg > 0 ? (profitPerScu / c.buyPrice.avg) * 100 : 0;
        return {
          ...c,
          profitPerScu,
          totalProfit,
          roi,
          maxSCU,
          rank: profitPerScu * (roi / 100 + 1),
        };
      })
      .filter(c => c.profitPerScu > 0)
      .sort((a, b) => b.rank - a.rank);
  }

  /**
   * Compare multiple trade routes by profit/hour.
   * @param {Array} routes - [{name, profit, travelTimeMin}]
   * @returns {Array} Routes with profitPerHour, sorted best first
   */
  compareRoutes(routes) {
    return routes
      .map(r => ({
        ...r,
        profitPerHour: calcProfitPerHour(r.profit, r.travelTimeMin),
      }))
      .sort((a, b) => b.profitPerHour - a.profitPerHour);
  }

  /**
   * Suggest the best ship size for a given trade scenario.
   * @param {number} profitPerScu - Profit margin per SCU
   * @param {number} budget - Available capital
   * @returns {object} Recommendations per ship size
   */
  suggestShipSize(profitPerScu, budget) {
    const sizes = [
      { label: 'Petit (< 50 SCU)', scu: 20, example: 'Cutlass Black, Freelancer' },
      { label: 'Moyen (50-150 SCU)', scu: 96, example: 'Constellation Andromeda' },
      { label: 'Grand (> 150 SCU)', scu: 576, example: 'Caterpillar, Starfarer' },
    ];

    return sizes.map(size => {
      const totalProfit = profitPerScu * size.scu;
      const investmentRequired = budget ? Math.min(budget, size.scu * 1000) : size.scu * 1000;
      const roi = investmentRequired > 0 ? (totalProfit / investmentRequired) * 100 : 0;
      return { ...size, totalProfit, roi, viable: budget >= investmentRequired };
    });
  }
}

export const CargoCalculationEngine = new CargoCalculationEngineClass();
export default CargoCalculationEngine;
