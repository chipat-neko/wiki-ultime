/**
 * EventBus - Système de publication/abonnement pour la communication inter-modules
 * Implémente le pattern Observer pour un couplage faible entre les composants
 */
class EventBusClass {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * S'abonner à un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   * @returns {Function} Fonction de désabonnement
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Retourner une fonction de nettoyage
    return () => this.off(event, callback);
  }

  /**
   * S'abonner à un événement une seule fois
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   */
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Se désabonner d'un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Émettre un événement
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données à transmettre
   */
  emit(event, data) {
    const entry = { event, data, timestamp: Date.now() };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Erreur dans le gestionnaire pour "${event}":`, error);
        }
      });
    }
  }

  /**
   * Supprimer tous les abonnements pour un événement
   * @param {string} event - Nom de l'événement
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Obtenir l'historique des événements
   * @returns {Array} Historique des événements
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Liste des événements enregistrés
   * @returns {string[]} Noms des événements
   */
  getRegisteredEvents() {
    return Array.from(this.listeners.keys());
  }
}

// Singleton global
export const EventBus = new EventBusClass();

// Constantes des événements de l'application
export const EVENTS = {
  // Navigation
  NAVIGATE: 'app:navigate',
  ROUTE_CHANGED: 'app:route_changed',

  // Theme
  THEME_CHANGED: 'app:theme_changed',

  // Recherche
  SEARCH_QUERY: 'search:query',
  SEARCH_RESULTS: 'search:results',
  SEARCH_CLEAR: 'search:clear',

  // Vaisseaux
  SHIP_SELECTED: 'ships:selected',
  SHIP_ADDED_TO_FLEET: 'ships:added_to_fleet',
  SHIP_FAVORITED: 'ships:favorited',
  SHIPS_FILTER_CHANGED: 'ships:filter_changed',

  // Flotte
  FLEET_UPDATED: 'fleet:updated',
  FLEET_SHIP_ADDED: 'fleet:ship_added',
  FLEET_SHIP_REMOVED: 'fleet:ship_removed',
  FLEET_ANALYSIS_COMPLETE: 'fleet:analysis_complete',

  // Commerce
  TRADE_ROUTE_CALCULATED: 'trade:route_calculated',
  CARGO_OPTIMIZED: 'trade:cargo_optimized',
  COMMODITY_SELECTED: 'trade:commodity_selected',

  // Missions
  MISSION_ADDED: 'missions:added',
  MISSION_REMOVED: 'missions:removed',
  MISSION_STACK_OPTIMIZED: 'missions:stack_optimized',

  // Systemes
  SYSTEM_SELECTED: 'systems:selected',
  LOCATION_SELECTED: 'systems:location_selected',

  // Cache
  CACHE_INVALIDATED: 'cache:invalidated',
  DATA_LOADED: 'cache:data_loaded',

  // UI
  MODAL_OPEN: 'ui:modal_open',
  MODAL_CLOSE: 'ui:modal_close',
  NOTIFICATION: 'ui:notification',
  SIDEBAR_TOGGLE: 'ui:sidebar_toggle',

  // Communaute
  FAVORITE_ADDED: 'community:favorite_added',
  FAVORITE_REMOVED: 'community:favorite_removed',
  HISTORY_ADDED: 'community:history_added',
};

export default EventBus;
