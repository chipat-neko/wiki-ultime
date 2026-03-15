import Fuse from 'fuse.js';
import { CacheManager, CACHE_KEYS } from './CacheManager.js';
import { EventBus, EVENTS } from './EventBus.js';

/**
 * SearchEngine - Moteur de recherche full-text avec indexation et suggestions
 */
class SearchEngineClass {
  constructor() {
    this.indices = new Map();
    this.history = [];
    this.maxHistory = 50;
  }

  /**
   * Créer un index de recherche pour un type de données
   * @param {string} name - Nom de l'index
   * @param {Array} data - Données à indexer
   * @param {Object} options - Options Fuse.js
   */
  createIndex(name, data, options = {}) {
    const defaultOptions = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      minMatchCharLength: 2,
      keys: options.keys || ['name'],
    };

    const fuseOptions = { ...defaultOptions, ...options };
    const index = new Fuse(data, fuseOptions);

    this.indices.set(name, {
      fuse: index,
      data,
      options: fuseOptions,
      createdAt: Date.now(),
    });

    console.debug(`[SearchEngine] Index "${name}" créé avec ${data.length} entrées`);
    return index;
  }

  /**
   * Mettre à jour un index existant
   * @param {string} name - Nom de l'index
   * @param {Array} data - Nouvelles données
   */
  updateIndex(name, data) {
    if (this.indices.has(name)) {
      const existing = this.indices.get(name);
      const newIndex = new Fuse(data, existing.options);
      existing.fuse = newIndex;
      existing.data = data;
      existing.updatedAt = Date.now();
    } else {
      this.createIndex(name, data);
    }
  }

  /**
   * Effectuer une recherche dans un index
   * @param {string} indexName - Nom de l'index
   * @param {string} query - Requête de recherche
   * @param {Object} options - Options de recherche
   * @returns {Array} Résultats triés par pertinence
   */
  search(indexName, query, options = {}) {
    if (!query || query.trim().length < 1) return [];
    if (query.length > 200) query = query.slice(0, 200);

    const cacheKey = `${CACHE_KEYS.SEARCH}${indexName}:${query}`;
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;

    const indexData = this.indices.get(indexName);
    if (!indexData) {
      console.warn(`[SearchEngine] Index "${indexName}" non trouvé`);
      return [];
    }

    const limit = options.limit || 20;
    const results = indexData.fuse.search(query, { limit });

    const formatted = results.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches,
      relevance: 1 - (result.score || 0),
    }));

    CacheManager.set(cacheKey, formatted, 30 * 1000); // Cache 30s
    this._addToHistory(query, indexName, formatted.length);

    return formatted;
  }

  /**
   * Recherche globale dans tous les indices
   * @param {string} query - Requête de recherche
   * @param {Object} options - Options
   * @returns {Object} Résultats groupés par type
   */
  searchAll(query, options = {}) {
    if (!query || query.trim().length < 1) return {};
    if (query.length > 200) query = query.slice(0, 200);

    const results = {};
    const limit = options.limitPerIndex || 5;

    for (const [name] of this.indices) {
      const indexResults = this.search(name, query, { limit });
      if (indexResults.length > 0) {
        results[name] = indexResults;
      }
    }

    EventBus.emit(EVENTS.SEARCH_RESULTS, { query, results });
    return results;
  }

  /**
   * Obtenir des suggestions basées sur la requête partielle
   * @param {string} indexName - Nom de l'index
   * @param {string} partial - Requête partielle
   * @param {number} limit - Nombre maximum de suggestions
   * @returns {Array} Suggestions
   */
  getSuggestions(indexName, partial, limit = 5) {
    if (!partial || partial.length < 1) {
      return this.getPopularSearches(indexName, limit);
    }

    const results = this.search(indexName, partial, { limit });
    return results.map(r => r.item);
  }

  /**
   * Obtenir les recherches populaires pour un index
   * @param {string} indexName - Nom de l'index
   * @param {number} limit - Nombre de résultats
   * @returns {Array} Recherches populaires
   */
  getPopularSearches(indexName, limit = 5) {
    const relevant = this.history
      .filter(h => h.indexName === indexName)
      .reduce((acc, h) => {
        acc[h.query] = (acc[h.query] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(relevant)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * Vider un index
   * @param {string} name - Nom de l'index
   */
  clearIndex(name) {
    this.indices.delete(name);
    CacheManager.invalidateByPrefix(`${CACHE_KEYS.SEARCH}${name}:`);
  }

  /**
   * Ajouter à l'historique de recherche
   * @param {string} query - Requête
   * @param {string} indexName - Index utilisé
   * @param {number} resultsCount - Nombre de résultats
   */
  _addToHistory(query, indexName, resultsCount) {
    this.history.push({
      query,
      indexName,
      resultsCount,
      timestamp: Date.now(),
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Obtenir les statistiques du moteur de recherche
   */
  getStats() {
    return {
      indices: this.indices.size,
      indexNames: Array.from(this.indices.keys()),
      historySize: this.history.length,
      totalDocuments: Array.from(this.indices.values())
        .reduce((sum, idx) => sum + idx.data.length, 0),
    };
  }
}

export const SearchEngine = new SearchEngineClass();

// Noms des indices prédéfinis
export const SEARCH_INDICES = {
  SHIPS: 'ships',
  COMMODITIES: 'commodities',
  STATIONS: 'stations',
  SYSTEMS: 'systems',
  FACTIONS: 'factions',
  GUIDES: 'guides',
  MISSIONS: 'missions',
  WIKELO: 'wikelo',
  GLOBAL: 'global',
};

// Configuration des index par défaut
export const INDEX_CONFIGS = {
  ships: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'manufacturer', weight: 1.5 },
      { name: 'role', weight: 1 },
      { name: 'description', weight: 0.5 },
    ],
    threshold: 0.3,
  },
  commodities: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'category', weight: 1 },
      { name: 'description', weight: 0.5 },
    ],
    threshold: 0.3,
  },
  stations: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'system', weight: 1.5 },
      { name: 'type', weight: 1 },
    ],
    threshold: 0.35,
  },
  systems: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'type', weight: 1 },
      { name: 'status', weight: 1 },
    ],
    threshold: 0.3,
  },
  factions: {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'type', weight: 1 },
      { name: 'description', weight: 0.5 },
    ],
    threshold: 0.35,
  },
};

export default SearchEngine;
