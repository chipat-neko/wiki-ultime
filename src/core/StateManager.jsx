import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { StorageManager, STORAGE_KEYS } from './StorageManager.js';
import { EventBus, EVENTS } from './EventBus.js';

// ============================================================
// ÉTAT INITIAL
// ============================================================

const getInitialState = () => ({
  // Thème
  theme: StorageManager.get(STORAGE_KEYS.THEME, 'dark'),

  // Interface
  ui: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: null,
    notifications: [],
    isLoading: false,
    breadcrumbs: [],
  },

  // Flotte du joueur
  fleet: StorageManager.get(STORAGE_KEYS.FLEET, {
    ships: [],
    name: 'Ma Flotte',
    description: '',
    setups: [],
  }),

  // Favoris
  favorites: StorageManager.get(STORAGE_KEYS.FAVORITES, {
    ships: [],
    routes: [],
    stations: [],
    guides: [],
  }),

  // Historique de navigation
  history: StorageManager.get(STORAGE_KEYS.HISTORY, []),

  // Routes sauvegardées
  savedRoutes: StorageManager.get(STORAGE_KEYS.SAVED_ROUTES, []),

  // Paramètres utilisateur
  settings: StorageManager.get(STORAGE_KEYS.SETTINGS, {
    language: 'fr',
    currency: 'aUEC',
    distanceUnit: 'Gm',
    notifications: true,
    compactMode: false,
    autoRefresh: false,
    refreshInterval: 300,
    defaultSystem: 'Stanton',
  }),

  // Recherche globale
  search: {
    query: '',
    results: {},
    isSearching: false,
    recentSearches: StorageManager.get(STORAGE_KEYS.SEARCH_HISTORY, []),
  },

  // Données en cours de chargement
  data: {
    ships: [],
    commodities: [],
    stations: [],
    systems: [],
    factions: [],
    missions: [],
    isLoaded: false,
    lastUpdated: null,
  },
});

// ============================================================
// REDUCERS
// ============================================================

function themeReducer(state, action) {
  const theme = action.payload;
  StorageManager.set(STORAGE_KEYS.THEME, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  EventBus.emit(EVENTS.THEME_CHANGED, theme);
  return { ...state, theme };
}

function uiReducer(state, action) {
  switch (action.type) {
    case 'UI_SIDEBAR_TOGGLE':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };
    case 'UI_SIDEBAR_COLLAPSE':
      return { ...state, ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } };
    case 'UI_MODAL_OPEN':
      return { ...state, ui: { ...state.ui, activeModal: action.payload } };
    case 'UI_MODAL_CLOSE':
      return { ...state, ui: { ...state.ui, activeModal: null } };
    case 'UI_NOTIFICATION_ADD':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, { ...action.payload, id: Date.now() }],
        },
      };
    case 'UI_NOTIFICATION_REMOVE':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };
    case 'UI_SET_LOADING':
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case 'UI_SET_BREADCRUMBS':
      return { ...state, ui: { ...state.ui, breadcrumbs: action.payload } };
    default:
      return state;
  }
}

function fleetReducer(state, action) {
  let newFleet;
  switch (action.type) {
    case 'FLEET_ADD_SHIP':
      newFleet = {
        ...state.fleet,
        ships: [...state.fleet.ships, { ...action.payload, addedAt: Date.now() }],
      };
      break;
    case 'FLEET_REMOVE_SHIP':
      newFleet = {
        ...state.fleet,
        ships: state.fleet.ships.filter(s => s.fleetId !== action.payload),
      };
      break;
    case 'FLEET_UPDATE_SHIP':
      newFleet = {
        ...state.fleet,
        ships: state.fleet.ships.map(s =>
          s.fleetId === action.payload.fleetId ? { ...s, ...action.payload } : s
        ),
      };
      break;
    case 'FLEET_RENAME':
      newFleet = { ...state.fleet, name: action.payload };
      break;
    case 'FLEET_SAVE_SETUP':
      newFleet = {
        ...state.fleet,
        setups: [...state.fleet.setups, { ...action.payload, savedAt: Date.now() }],
      };
      break;
    case 'FLEET_LOAD_SETUP':
      newFleet = { ...state.fleet, ships: action.payload.ships };
      break;
    case 'FLEET_CLEAR':
      newFleet = { ...state.fleet, ships: [] };
      break;
    default:
      return state;
  }
  StorageManager.set(STORAGE_KEYS.FLEET, newFleet);
  EventBus.emit(EVENTS.FLEET_UPDATED, newFleet);
  return { ...state, fleet: newFleet };
}

function favoritesReducer(state, action) {
  const { type: itemType, item } = action.payload || {};
  let newFavorites;

  switch (action.type) {
    case 'FAVORITES_ADD':
      newFavorites = {
        ...state.favorites,
        [itemType]: [...(state.favorites[itemType] || []), { ...item, favoritedAt: Date.now() }],
      };
      EventBus.emit(EVENTS.FAVORITE_ADDED, { type: itemType, item });
      break;
    case 'FAVORITES_REMOVE':
      newFavorites = {
        ...state.favorites,
        [itemType]: (state.favorites[itemType] || []).filter(f => f.id !== item.id),
      };
      EventBus.emit(EVENTS.FAVORITE_REMOVED, { type: itemType, item });
      break;
    case 'FAVORITES_CLEAR':
      newFavorites = { ships: [], routes: [], stations: [], guides: [] };
      break;
    default:
      return state;
  }
  StorageManager.set(STORAGE_KEYS.FAVORITES, newFavorites);
  return { ...state, favorites: newFavorites };
}

function historyReducer(state, action) {
  switch (action.type) {
    case 'HISTORY_ADD': {
      const newEntry = { ...action.payload, visitedAt: Date.now() };
      const filtered = state.history.filter(h => h.path !== newEntry.path);
      const newHistory = [newEntry, ...filtered].slice(0, 100);
      StorageManager.set(STORAGE_KEYS.HISTORY, newHistory);
      EventBus.emit(EVENTS.HISTORY_ADDED, newEntry);
      return { ...state, history: newHistory };
    }
    case 'HISTORY_CLEAR':
      StorageManager.set(STORAGE_KEYS.HISTORY, []);
      return { ...state, history: [] };
    default:
      return state;
  }
}

function routesReducer(state, action) {
  switch (action.type) {
    case 'ROUTES_SAVE': {
      const newRoutes = [...state.savedRoutes, { ...action.payload, savedAt: Date.now() }];
      StorageManager.set(STORAGE_KEYS.SAVED_ROUTES, newRoutes);
      return { ...state, savedRoutes: newRoutes };
    }
    case 'ROUTES_REMOVE': {
      const newRoutes = state.savedRoutes.filter(r => r.id !== action.payload);
      StorageManager.set(STORAGE_KEYS.SAVED_ROUTES, newRoutes);
      return { ...state, savedRoutes: newRoutes };
    }
    default:
      return state;
  }
}

function settingsReducer(state, action) {
  const newSettings = { ...state.settings, ...action.payload };
  StorageManager.set(STORAGE_KEYS.SETTINGS, newSettings);
  return { ...state, settings: newSettings };
}

function searchReducer(state, action) {
  switch (action.type) {
    case 'SEARCH_SET_QUERY':
      return { ...state, search: { ...state.search, query: action.payload, isSearching: true } };
    case 'SEARCH_SET_RESULTS':
      return { ...state, search: { ...state.search, results: action.payload, isSearching: false } };
    case 'SEARCH_CLEAR':
      return { ...state, search: { ...state.search, query: '', results: {}, isSearching: false } };
    case 'SEARCH_ADD_HISTORY': {
      const recentSearches = [
        action.payload,
        ...state.search.recentSearches.filter(s => s !== action.payload),
      ].slice(0, 10);
      StorageManager.set(STORAGE_KEYS.SEARCH_HISTORY, recentSearches);
      return { ...state, search: { ...state.search, recentSearches } };
    }
    default:
      return state;
  }
}

function dataReducer(state, action) {
  switch (action.type) {
    case 'DATA_SET':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
          isLoaded: true,
          lastUpdated: Date.now(),
        },
      };
    case 'DATA_RESET':
      return { ...state, data: { ...getInitialState().data } };
    default:
      return state;
  }
}

// Reducer principal
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return themeReducer(state, action);

    case 'UI_SIDEBAR_TOGGLE':
    case 'UI_SIDEBAR_COLLAPSE':
    case 'UI_MODAL_OPEN':
    case 'UI_MODAL_CLOSE':
    case 'UI_NOTIFICATION_ADD':
    case 'UI_NOTIFICATION_REMOVE':
    case 'UI_SET_LOADING':
    case 'UI_SET_BREADCRUMBS':
      return uiReducer(state, action);

    case 'FLEET_ADD_SHIP':
    case 'FLEET_REMOVE_SHIP':
    case 'FLEET_UPDATE_SHIP':
    case 'FLEET_RENAME':
    case 'FLEET_SAVE_SETUP':
    case 'FLEET_LOAD_SETUP':
    case 'FLEET_CLEAR':
      return fleetReducer(state, action);

    case 'FAVORITES_ADD':
    case 'FAVORITES_REMOVE':
    case 'FAVORITES_CLEAR':
      return favoritesReducer(state, action);

    case 'HISTORY_ADD':
    case 'HISTORY_CLEAR':
      return historyReducer(state, action);

    case 'ROUTES_SAVE':
    case 'ROUTES_REMOVE':
      return routesReducer(state, action);

    case 'SETTINGS_UPDATE':
      return settingsReducer(state, action);

    case 'SEARCH_SET_QUERY':
    case 'SEARCH_SET_RESULTS':
    case 'SEARCH_CLEAR':
    case 'SEARCH_ADD_HISTORY':
      return searchReducer(state, action);

    case 'DATA_SET':
    case 'DATA_RESET':
      return dataReducer(state, action);

    default:
      return state;
  }
}

// ============================================================
// CONTEXTE
// ============================================================

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);

  // Appliquer le thème au chargement
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.classList.toggle('light', state.theme === 'light');
  }, []);

  // isFavorite extrait au niveau du composant (interdit dans useMemo)
  const isFavorite = useCallback((type, id) => {
    return (state.favorites[type] || []).some(f => f.id === id);
  }, [state.favorites]);

  // Actions mémorisées
  const actions = useMemo(() => ({
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    toggleTheme: () => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' }),

    toggleSidebar: () => dispatch({ type: 'UI_SIDEBAR_TOGGLE' }),
    collapseSidebar: () => dispatch({ type: 'UI_SIDEBAR_COLLAPSE' }),
    openModal: (modal) => dispatch({ type: 'UI_MODAL_OPEN', payload: modal }),
    closeModal: () => dispatch({ type: 'UI_MODAL_CLOSE' }),
    addNotification: (notification) => dispatch({ type: 'UI_NOTIFICATION_ADD', payload: notification }),
    removeNotification: (id) => dispatch({ type: 'UI_NOTIFICATION_REMOVE', payload: id }),
    setLoading: (isLoading) => dispatch({ type: 'UI_SET_LOADING', payload: isLoading }),
    setBreadcrumbs: (crumbs) => dispatch({ type: 'UI_SET_BREADCRUMBS', payload: crumbs }),

    addShipToFleet: (ship) => dispatch({ type: 'FLEET_ADD_SHIP', payload: ship }),
    removeShipFromFleet: (fleetId) => dispatch({ type: 'FLEET_REMOVE_SHIP', payload: fleetId }),
    updateFleetShip: (ship) => dispatch({ type: 'FLEET_UPDATE_SHIP', payload: ship }),
    renameFleet: (name) => dispatch({ type: 'FLEET_RENAME', payload: name }),
    saveFleetSetup: (setup) => dispatch({ type: 'FLEET_SAVE_SETUP', payload: setup }),
    loadFleetSetup: (setup) => dispatch({ type: 'FLEET_LOAD_SETUP', payload: setup }),
    clearFleet: () => dispatch({ type: 'FLEET_CLEAR' }),

    addFavorite: (type, item) => dispatch({ type: 'FAVORITES_ADD', payload: { type, item } }),
    removeFavorite: (type, item) => dispatch({ type: 'FAVORITES_REMOVE', payload: { type, item } }),
    clearFavorites: () => dispatch({ type: 'FAVORITES_CLEAR' }),
    isFavorite,

    addToHistory: (entry) => dispatch({ type: 'HISTORY_ADD', payload: entry }),
    clearHistory: () => dispatch({ type: 'HISTORY_CLEAR' }),

    saveRoute: (route) => dispatch({ type: 'ROUTES_SAVE', payload: route }),
    removeRoute: (id) => dispatch({ type: 'ROUTES_REMOVE', payload: id }),

    updateSettings: (settings) => dispatch({ type: 'SETTINGS_UPDATE', payload: settings }),

    setSearchQuery: (query) => dispatch({ type: 'SEARCH_SET_QUERY', payload: query }),
    setSearchResults: (results) => dispatch({ type: 'SEARCH_SET_RESULTS', payload: results }),
    clearSearch: () => dispatch({ type: 'SEARCH_CLEAR' }),
    addSearchHistory: (query) => dispatch({ type: 'SEARCH_ADD_HISTORY', payload: query }),

    setData: (data) => dispatch({ type: 'DATA_SET', payload: data }),

    notify: (message, type = 'info', duration = 4000) => {
      const id = Date.now();
      dispatch({ type: 'UI_NOTIFICATION_ADD', payload: { message, type, duration, id } });
      if (duration > 0) {
        setTimeout(() => dispatch({ type: 'UI_NOTIFICATION_REMOVE', payload: id }), duration);
      }
    },
  }), [state.favorites, state.theme, isFavorite]);

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================
// HOOKS
// ============================================================

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState doit être utilisé dans AppProvider');
  return context.state;
}

export function useAppActions() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppActions doit être utilisé dans AppProvider');
  return context.actions;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext doit être utilisé dans AppProvider');
  return context;
}

export function useTheme() {
  const { state, actions } = useAppContext();
  return { theme: state.theme, setTheme: actions.setTheme, toggleTheme: actions.toggleTheme };
}

export function useFleet() {
  const { state, actions } = useAppContext();
  return { fleet: state.fleet, ...actions };
}

export function useFavorites() {
  const { state, actions } = useAppContext();
  return { favorites: state.favorites, ...actions };
}

export function useNotifications() {
  const { state, actions } = useAppContext();
  return { notifications: state.ui.notifications, notify: actions.notify, removeNotification: actions.removeNotification };
}

export function useSettings() {
  const { state, actions } = useAppContext();
  return { settings: state.settings, updateSettings: actions.updateSettings };
}

export default AppContext;
