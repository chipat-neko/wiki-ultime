import ApiService from '../services/ApiService.js';
import { CacheManager } from '../core/CacheManager.js';
import { ERKUL } from './endpoints.js';

const TTL_ITEMS = 30 * 60 * 1000;  // 30 min
const TTL_SHIPS = 60 * 60 * 1000;  // 1 hour

/**
 * Erkul DPS Calculator API integration.
 * Provides ship loadout data, weapon stats, and DPS calculations.
 * Docs: https://www.erkul.games
 */
class ErkulApiClass {
  /**
   * Get all ships with base stats.
   */
  async getShips() {
    return CacheManager.getOrFetch(
      'erkul_ships',
      () => ApiService.get(ERKUL.SHIPS),
      TTL_SHIPS
    );
  }

  /**
   * Get detailed stats for a specific ship.
   * @param {string} code - Ship code (e.g., 'AEGS_Avenger_Titan')
   */
  async getShip(code) {
    return CacheManager.getOrFetch(
      `erkul_ship_${code}`,
      () => ApiService.get(ERKUL.SHIP(code)),
      TTL_SHIPS
    );
  }

  /**
   * Get default loadout for a ship.
   * @param {string} code
   */
  async getShipLoadout(code) {
    return CacheManager.getOrFetch(
      `erkul_loadout_${code}`,
      () => ApiService.get(ERKUL.SHIP_LOADOUT(code)),
      TTL_SHIPS
    );
  }

  /**
   * Get item/weapon stats by ID.
   * @param {string} id
   */
  async getItem(id) {
    return CacheManager.getOrFetch(
      `erkul_item_${id}`,
      () => ApiService.get(ERKUL.ITEM(id)),
      TTL_ITEMS
    );
  }

  /**
   * Calculate DPS for a loadout.
   * @param {object} loadout - Loadout configuration
   */
  async calcDPS(loadout) {
    return ApiService.post(ERKUL.DPS_CALC, loadout);
  }

  /**
   * Normalize Erkul ship data to local format.
   * @param {object} erkulShip
   * @returns {object} Normalized ship stats
   */
  normalizeShipStats(erkulShip) {
    return {
      id: erkulShip.className || erkulShip.id,
      name: erkulShip.name,
      manufacturer: erkulShip.manufacturer?.name || 'Unknown',
      shield: erkulShip.shield?.total || 0,
      hull: erkulShip.hull?.total || 0,
      speed: {
        scm: erkulShip.flight?.scm || 0,
        afterburner: erkulShip.flight?.afterburner || 0,
        quantum: erkulShip.quantum?.speed || 0,
      },
      crew: {
        min: erkulShip.crew?.min || 1,
        max: erkulShip.crew?.max || 1,
      },
      source: 'erkul',
    };
  }
}

export const ErkulApi = new ErkulApiClass();
export default ErkulApi;
