import ApiService from '../services/ApiService.js';
import { CacheManager, CACHE_KEYS } from '../core/CacheManager.js';
import { UEXCORP } from './endpoints.js';

const TTL_PRICES = 5 * 60 * 1000;    // 5 min — prices change frequently
const TTL_STATIC = 60 * 60 * 1000;   // 1 hour — ships, systems rarely change

/**
 * UEX Corp API integration.
 * Provides live trade data, commodity prices, and terminal information.
 * Docs: https://uexcorp.space/api/docs
 */
class UexCorpApiClass {
  /**
   * Fetch all commodities with current market data.
   * @returns {Promise<Array>} Commodity list
   */
  async getCommodities() {
    return CacheManager.getOrFetch(
      CACHE_KEYS.COMMODITY_PRICES,
      () => ApiService.get(UEXCORP.COMMODITIES),
      TTL_PRICES
    );
  }

  /**
   * Fetch a single commodity with price history.
   * @param {string|number} id
   */
  async getCommodity(id) {
    return CacheManager.getOrFetch(
      `commodity_${id}`,
      () => ApiService.get(UEXCORP.COMMODITY(id)),
      TTL_PRICES
    );
  }

  /**
   * Get current prices for a commodity at all terminals.
   * @param {string|number} commodityId
   */
  async getCommodityPrices(commodityId) {
    return CacheManager.getOrFetch(
      `commodity_prices_${commodityId}`,
      () => ApiService.get(UEXCORP.COMMODITY_PRICES(commodityId)),
      TTL_PRICES
    );
  }

  /**
   * Fetch all trading terminals (stations/outposts with commodity trading).
   */
  async getTerminals() {
    return CacheManager.getOrFetch(
      'uex_terminals',
      () => ApiService.get(UEXCORP.TERMINALS),
      TTL_STATIC
    );
  }

  /**
   * Get terminal details including available commodities.
   * @param {string|number} id
   */
  async getTerminal(id) {
    return CacheManager.getOrFetch(
      `uex_terminal_${id}`,
      () => ApiService.get(UEXCORP.TERMINAL(id)),
      TTL_STATIC
    );
  }

  /**
   * Find the best trade routes between two terminals.
   * @param {string|number} fromTerminal
   * @param {string|number} toTerminal
   * @param {number} scu - Cargo capacity in SCU
   */
  async getBestTrades(fromTerminal, toTerminal, scu = 100) {
    const key = `trades_${fromTerminal}_${toTerminal}_${scu}`;
    return CacheManager.getOrFetch(
      key,
      () => ApiService.get(UEXCORP.BEST_TRADES(fromTerminal, toTerminal, scu)),
      TTL_PRICES
    );
  }

  /**
   * Get all star systems.
   */
  async getStarSystems() {
    return CacheManager.getOrFetch(
      'uex_star_systems',
      () => ApiService.get(UEXCORP.STAR_SYSTEMS),
      TTL_STATIC
    );
  }

  /**
   * Get all ships from UEX Corp database.
   */
  async getShips() {
    return CacheManager.getOrFetch(
      'uex_ships',
      () => ApiService.get(UEXCORP.SHIPS),
      TTL_STATIC
    );
  }

  /**
   * Get all vehicles with full specs from UEX Corp.
   */
  async getVehicles() {
    return CacheManager.getOrFetch(
      'uex_vehicles',
      () => ApiService.get(UEXCORP.VEHICLES),
      TTL_STATIC
    );
  }

  /**
   * Get vehicle purchase locations and prices.
   */
  async getVehiclePurchases() {
    return CacheManager.getOrFetch(
      'uex_vehicles_purchases',
      () => ApiService.get(UEXCORP.VEHICLES_PURCHASES),
      TTL_STATIC
    );
  }

  /**
   * Get vehicle rental locations and prices.
   */
  async getVehicleRentals() {
    return CacheManager.getOrFetch(
      'uex_vehicles_rentals',
      () => ApiService.get(UEXCORP.VEHICLES_RENTALS),
      TTL_STATIC
    );
  }

  /**
   * Get vehicle components data.
   */
  async getVehicleComponents() {
    return CacheManager.getOrFetch(
      'uex_vehicle_components',
      () => ApiService.get(UEXCORP.VEHICLE_COMPONENTS),
      TTL_STATIC
    );
  }

  /**
   * Get mining data (minerals, locations, prices).
   */
  async getMining() {
    return CacheManager.getOrFetch(
      'uex_mining',
      () => ApiService.get(UEXCORP.MINING),
      TTL_PRICES
    );
  }

  /**
   * Get refinery data (jobs, yields, times).
   */
  async getRefineries() {
    return CacheManager.getOrFetch(
      'uex_refineries',
      () => ApiService.get(UEXCORP.REFINERIES),
      TTL_PRICES
    );
  }

  /**
   * Get commodity trade routes.
   */
  async getCommodityRoutes() {
    return CacheManager.getOrFetch(
      'uex_commodity_routes',
      () => ApiService.get(UEXCORP.COMMODITIES_ROUTES),
      TTL_PRICES
    );
  }

  /**
   * Normalize UEX Corp commodity data to local format.
   * @param {object} uexCommodity - Raw UEX Corp commodity
   * @returns {object} Normalized commodity
   */
  normalizeComodity(uexCommodity) {
    return {
      id: String(uexCommodity.id),
      name: uexCommodity.name,
      category: uexCommodity.category || 'Divers',
      illegal: Boolean(uexCommodity.is_illegal),
      buyPrice: {
        min: uexCommodity.price_buy_min || 0,
        avg: uexCommodity.price_buy || 0,
        max: uexCommodity.price_buy_max || 0,
      },
      sellPrice: {
        min: uexCommodity.price_sell_min || 0,
        avg: uexCommodity.price_sell || 0,
        max: uexCommodity.price_sell_max || 0,
      },
      source: 'uexcorp',
    };
  }
}

export const UexCorpApi = new UexCorpApiClass();
export default UexCorpApi;
