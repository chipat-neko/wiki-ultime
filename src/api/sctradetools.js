import ApiService from '../services/ApiService.js';
import { CacheManager } from '../core/CacheManager.js';
import { SCTRADETOOLS } from './endpoints.js';

const TTL_TRADE = 5 * 60 * 1000;    // 5 min
const TTL_ROUTES = 10 * 60 * 1000;  // 10 min

/**
 * SC Trade Tools API integration.
 * Provides trade route optimization and station price data.
 * Docs: https://sc-trade.tools
 */
class ScTradeToolsApiClass {
  /**
   * Get current trade data (all commodities at all stations).
   */
  async getTradeData() {
    return CacheManager.getOrFetch(
      'sct_trade_data',
      () => ApiService.get(SCTRADETOOLS.TRADE_DATA),
      TTL_TRADE
    );
  }

  /**
   * Get trade data for a specific commodity.
   * @param {string} commodityName
   */
  async getCommodityData(commodityName) {
    return CacheManager.getOrFetch(
      `sct_commodity_${commodityName}`,
      () => ApiService.get(SCTRADETOOLS.COMMODITY_DATA(commodityName)),
      TTL_TRADE
    );
  }

  /**
   * Get prices at a specific station.
   * @param {string} stationCode
   */
  async getStationPrices(stationCode) {
    return CacheManager.getOrFetch(
      `sct_station_${stationCode}`,
      () => ApiService.get(SCTRADETOOLS.STATION_PRICES(stationCode)),
      TTL_TRADE
    );
  }

  /**
   * Find best trade routes between two locations.
   * @param {string} from - Origin station code
   * @param {string} to - Destination station code
   * @param {number} scu - Cargo capacity
   * @param {number} budget - Available aUEC
   */
  async getBestRoutes(from, to, scu = 100, budget = 1_000_000) {
    const key = `sct_routes_${from}_${to}_${scu}_${budget}`;
    return CacheManager.getOrFetch(
      key,
      () => ApiService.get(SCTRADETOOLS.BEST_ROUTES(from, to, scu, budget)),
      TTL_ROUTES
    );
  }

  /**
   * Normalize SC Trade Tools route data to local format.
   * @param {object} route - Raw route from SC Trade Tools
   * @returns {object} Normalized route
   */
  normalizeRoute(route) {
    return {
      from: route.origin?.name || route.from,
      to: route.destination?.name || route.to,
      commodity: route.commodity?.name || route.commodity,
      buyPrice: route.buy_price || 0,
      sellPrice: route.sell_price || 0,
      profitPerScu: (route.sell_price || 0) - (route.buy_price || 0),
      travelTimeMin: route.travel_time_minutes || 0,
      source: 'sctradetools',
    };
  }
}

export const ScTradeToolsApi = new ScTradeToolsApiClass();
export default ScTradeToolsApi;
