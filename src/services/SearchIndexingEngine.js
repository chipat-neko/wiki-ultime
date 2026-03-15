import { SearchEngine } from '../core/SearchEngine.js';
import { SHIPS } from '../datasets/ships.js';
import { COMMODITIES } from '../datasets/commodities.js';
import { FACTIONS } from '../datasets/factions.js';
import { GUIDES } from '../datasets/guides.js';
import { STATIONS } from '../datasets/stations.js';
import { STAR_SYSTEMS_DATA as SYSTEMS } from '../datasets/systems.js';

/**
 * Search indexing engine.
 * Builds and maintains search indices for all major data collections.
 */
class SearchIndexingEngineClass {
  constructor() {
    this._initialized = false;
  }

  /**
   * Initialize all indices. Safe to call multiple times (idempotent).
   */
  init() {
    if (this._initialized) return;

    SearchEngine.createIndex('ships', SHIPS, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'manufacturer', weight: 0.3 },
        { name: 'role', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.3,
    });

    SearchEngine.createIndex('commodities', COMMODITIES, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'category', weight: 0.3 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.35,
    });

    SearchEngine.createIndex('factions', FACTIONS, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'type', weight: 0.2 },
        { name: 'alignment', weight: 0.15 },
        { name: 'description', weight: 0.15 },
      ],
      threshold: 0.3,
    });

    SearchEngine.createIndex('guides', GUIDES, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'category', weight: 0.25 },
        { name: 'description', weight: 0.25 },
      ],
      threshold: 0.35,
    });

    SearchEngine.createIndex('stations', STATIONS, {
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'system', weight: 0.3 },
        { name: 'type', weight: 0.2 },
      ],
      threshold: 0.3,
    });

    const allBodies = SYSTEMS.flatMap(sys =>
      (sys.bodies || []).map(b => ({ ...b, systemName: sys.name }))
    );
    SearchEngine.createIndex('systems', allBodies, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'type', weight: 0.2 },
        { name: 'systemName', weight: 0.2 },
      ],
      threshold: 0.3,
    });

    this._initialized = true;
  }

  /**
   * Search across all indices.
   * @param {string} query
   * @returns {object} Results grouped by index name
   */
  searchAll(query) {
    if (!this._initialized) this.init();
    return SearchEngine.searchAll(query);
  }

  /**
   * Search a specific index.
   * @param {string} index - Index name
   * @param {string} query
   * @param {number} limit - Max results
   * @returns {Array}
   */
  search(index, query, limit = 10) {
    if (!this._initialized) this.init();
    return SearchEngine.search(index, query, limit);
  }

  /**
   * Get autocomplete suggestions from all indices.
   * @param {string} query
   * @param {number} limit
   * @returns {Array}
   */
  getSuggestions(query, limit = 5) {
    if (!this._initialized) this.init();
    return SearchEngine.getSuggestions(query, limit);
  }

  /**
   * Rebuild a specific index (e.g., after data update).
   * @param {string} index
   * @param {Array} data
   */
  rebuildIndex(index, data) {
    SearchEngine.updateIndex(index, data);
  }

  get initialized() {
    return this._initialized;
  }
}

export const SearchIndexingEngine = new SearchIndexingEngineClass();
export default SearchIndexingEngine;
