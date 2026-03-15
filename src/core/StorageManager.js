/**
 * StorageManager - Gestionnaire de stockage local avec support JSON, compression et versionnage
 */

const STORAGE_PREFIX = 'sc_companion_';
const STORAGE_VERSION = '1.0.0';

class StorageManagerClass {
  constructor() {
    this.prefix = STORAGE_PREFIX;
    this.version = STORAGE_VERSION;
    this._checkVersion();
  }

  /**
   * Vérifier et migrer la version du stockage si nécessaire
   */
  _checkVersion() {
    const storedVersion = localStorage.getItem(`${this.prefix}version`);
    if (storedVersion !== this.version) {
      // Migration: conserver uniquement certaines clés importantes
      const keysToKeep = ['theme', 'fleet', 'favorites', 'settings'];
      const savedData = {};
      keysToKeep.forEach(key => {
        const value = this.get(key);
        if (value !== null) savedData[key] = value;
      });

      // Nettoyer l'ancien stockage
      this._clearAll();

      // Restaurer les données importantes
      Object.entries(savedData).forEach(([key, value]) => {
        this.set(key, value);
      });

      localStorage.setItem(`${this.prefix}version`, this.version);
    }
  }

  /**
   * Sauvegarder une valeur
   * @param {string} key - Clé de stockage
   * @param {*} value - Valeur à sauvegarder
   * @param {Object} options - Options (ttl en ms)
   */
  set(key, value, options = {}) {
    try {
      const entry = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl || null,
      };
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('[StorageManager] Quota dépassé, nettoyage des données expirées...');
        this._cleanExpired();
        try {
          localStorage.setItem(`${this.prefix}${key}`, JSON.stringify({ value, timestamp: Date.now(), ttl: options.ttl || null }));
          return true;
        } catch (e) {
          console.error('[StorageManager] Impossible de sauvegarder après nettoyage:', e);
          return false;
        }
      }
      console.error('[StorageManager] Erreur lors de la sauvegarde:', error);
      return false;
    }
  }

  /**
   * Récupérer une valeur
   * @param {string} key - Clé de stockage
   * @param {*} defaultValue - Valeur par défaut si non trouvée
   * @returns {*} Valeur stockée ou valeur par défaut
   */
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(`${this.prefix}${key}`);
      if (raw === null) return defaultValue;

      const entry = JSON.parse(raw);

      // Vérifier l'expiration
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`${this.prefix}${key}`);
        return defaultValue;
      }

      return entry.value !== undefined ? entry.value : defaultValue;
    } catch (error) {
      console.error('[StorageManager] Erreur lors de la récupération:', error);
      return defaultValue;
    }
  }

  /**
   * Supprimer une valeur
   * @param {string} key - Clé à supprimer
   */
  remove(key) {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  /**
   * Vérifier si une clé existe
   * @param {string} key - Clé à vérifier
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(`${this.prefix}${key}`) !== null;
  }

  /**
   * Mettre à jour partiellement un objet stocké
   * @param {string} key - Clé de stockage
   * @param {Object} updates - Mises à jour à appliquer
   */
  update(key, updates) {
    const current = this.get(key, {});
    this.set(key, { ...current, ...updates });
  }

  /**
   * Récupérer toutes les clés de l'application
   * @returns {string[]}
   */
  keys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  /**
   * Nettoyer les entrées expirées
   */
  _cleanExpired() {
    const keys = this.keys();
    keys.forEach(key => {
      this.get(key); // La lecture supprime automatiquement les entrées expirées
    });
  }

  /**
   * Tout effacer
   */
  _clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }

  /**
   * Exporter toutes les données en JSON
   * @returns {Object} Toutes les données de l'application
   */
  exportAll() {
    const data = {};
    this.keys().forEach(key => {
      data[key] = this.get(key);
    });
    return {
      version: this.version,
      exportedAt: new Date().toISOString(),
      data,
    };
  }

  /**
   * Importer des données depuis un JSON exporté
   * @param {Object} exportData - Données exportées
   * @returns {boolean} Succès de l'importation
   */
  importAll(exportData) {
    try {
      if (exportData.data) {
        Object.entries(exportData.data).forEach(([key, value]) => {
          this.set(key, value);
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('[StorageManager] Erreur lors de l\'importation:', error);
      return false;
    }
  }

  /**
   * Obtenir la taille utilisée en localStorage
   * @returns {Object} Taille en bytes et en KB
   */
  getStorageSize() {
    let total = 0;
    this.keys().forEach(key => {
      const raw = localStorage.getItem(`${this.prefix}${key}`);
      if (raw) total += raw.length * 2; // UTF-16
    });
    return {
      bytes: total,
      kb: (total / 1024).toFixed(2),
      mb: (total / 1024 / 1024).toFixed(3),
    };
  }
}

export const StorageManager = new StorageManagerClass();

// Clés de stockage prédéfinies
export const STORAGE_KEYS = {
  THEME: 'theme',
  FLEET: 'fleet',
  FLEET_SETUPS: 'fleet_setups',
  FAVORITES: 'favorites',
  HISTORY: 'history',
  SAVED_ROUTES: 'saved_routes',
  SETTINGS: 'settings',
  SEARCH_HISTORY: 'search_history',
  FILTERS: 'filters',
  LAST_VISITED: 'last_visited',
};

export default StorageManager;
