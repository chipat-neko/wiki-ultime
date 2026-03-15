/**
 * CacheManager - Cache en mémoire avec TTL, LRU eviction et persistance optionnelle
 */

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 500;

class CacheManagerClass {
  constructor() {
    this.cache = new Map();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    };
  }

  /**
   * Stocker une valeur dans le cache
   * @param {string} key - Clé de cache
   * @param {*} value - Valeur à mettre en cache
   * @param {number} ttl - Durée de vie en ms (défaut: 5min)
   */
  set(key, value, ttl = DEFAULT_TTL) {
    // Éviction LRU si cache plein
    if (this.cache.size >= MAX_ENTRIES && !this.cache.has(key)) {
      this._evictLRU();
    }

    const entry = {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      accessCount: 0,
    };

    this.cache.set(key, entry);
    this._updateAccessOrder(key);
  }

  /**
   * Récupérer une valeur du cache
   * @param {string} key - Clé de cache
   * @returns {*} Valeur ou null si expirée/absente
   */
  get(key) {
    this.stats.totalRequests++;
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this._removeFromAccessOrder(key);
      this.stats.misses++;
      return null;
    }

    entry.accessCount++;
    this._updateAccessOrder(key);
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Vérifier si une clé existe et n'est pas expirée
   * @param {string} key - Clé de cache
   * @returns {boolean}
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Supprimer une entrée
   * @param {string} key - Clé à supprimer
   */
  delete(key) {
    this.cache.delete(key);
    this._removeFromAccessOrder(key);
  }

  /**
   * Invalider toutes les entrées correspondant à un préfixe
   * @param {string} prefix - Préfixe des clés à invalider
   */
  invalidateByPrefix(prefix) {
    const keys = Array.from(this.cache.keys()).filter(k => k.startsWith(prefix));
    keys.forEach(key => this.delete(key));
    return keys.length;
  }

  /**
   * Vider tout le cache
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Nettoyer les entrées expirées
   * @returns {number} Nombre d'entrées supprimées
   */
  cleanup() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this._removeFromAccessOrder(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Cache-aside pattern: récupérer du cache ou exécuter le fetcher
   * @param {string} key - Clé de cache
   * @param {Function} fetcher - Fonction async retournant les données
   * @param {number} ttl - TTL en ms
   * @returns {Promise<*>} Données du cache ou du fetcher
   */
  async getOrFetch(key, fetcher, ttl = DEFAULT_TTL) {
    const cached = this.get(key);
    if (cached !== null) return cached;

    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`[CacheManager] Erreur lors du fetch pour "${key}":`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour le TTL d'une entrée existante
   * @param {string} key - Clé de cache
   * @param {number} ttl - Nouveau TTL en ms
   */
  refresh(key, ttl = DEFAULT_TTL) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttl;
    }
  }

  /**
   * Obtenir les statistiques du cache
   * @returns {Object} Statistiques
   */
  getStats() {
    const hitRate = this.stats.totalRequests > 0
      ? ((this.stats.hits / this.stats.totalRequests) * 100).toFixed(1)
      : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      maxEntries: MAX_ENTRIES,
    };
  }

  /**
   * Lister toutes les clés actives
   * @returns {string[]}
   */
  keys() {
    const now = Date.now();
    return Array.from(this.cache.entries())
      .filter(([, entry]) => now <= entry.expiresAt)
      .map(([key]) => key);
  }

  /**
   * Éviction LRU (Least Recently Used)
   */
  _evictLRU() {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
      this.stats.evictions++;
    }
  }

  /**
   * Mettre à jour l'ordre d'accès
   * @param {string} key - Clé accédée
   */
  _updateAccessOrder(key) {
    this._removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Supprimer de l'ordre d'accès
   * @param {string} key - Clé à supprimer
   */
  _removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

export const CacheManager = new CacheManagerClass();

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  const cleaned = CacheManager.cleanup();
  if (cleaned > 0) {
    console.debug(`[CacheManager] ${cleaned} entrées expirées supprimées`);
  }
}, 10 * 60 * 1000);

// Préfixes de cache prédéfinis
export const CACHE_KEYS = {
  SHIPS: 'ships:',
  SHIP_DETAIL: 'ship:',
  COMMODITIES: 'commodities:',
  COMMODITY_PRICES: 'commodity_prices:',
  TRADE_ROUTES: 'trade_routes:',
  SYSTEMS: 'systems:',
  STATIONS: 'stations:',
  FACTIONS: 'factions:',
  MISSIONS: 'missions:',
  API_UEX: 'api:uex:',
  API_ERKUL: 'api:erkul:',
  SERVER_STATUS: 'server:status',
  SEARCH: 'search:',
};

export default CacheManager;
