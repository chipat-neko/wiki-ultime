import { useState, useEffect, useCallback } from 'react';
import { COMMODITIES as LOCAL_COMMODITIES } from '../datasets/commodities.js';
import { CacheManager } from '../core/CacheManager.js';

const UEX_BASE = 'https://uexcorp.space/api/2.0';
const UEX_COMMODITIES_URL = `${UEX_BASE}/commodities`;
const UEX_TERMINALS_URL   = `${UEX_BASE}/terminals`;
const UEX_VEHICLES_URL    = `${UEX_BASE}/vehicles`;
const UEX_PURCHASES_URL   = `${UEX_BASE}/vehicles_purchases`;
const UEX_RENTALS_URL     = `${UEX_BASE}/vehicles_rentals`;
const UEX_COMPONENTS_URL  = `${UEX_BASE}/vehicle_components`;
const UEX_MINING_URL      = `${UEX_BASE}/mining`;
const UEX_REFINERIES_URL  = `${UEX_BASE}/refineries`;
const UEX_ROUTES_URL      = `${UEX_BASE}/commodities_routes`;

const CACHE_KEY_COMM   = 'uex:commodities:live';
const CACHE_KEY_TERM   = 'uex:terminals:live';
const CACHE_KEY_VEHI   = 'uex:vehicles:live';
const CACHE_KEY_PURCH  = 'uex:purchases:live';
const CACHE_KEY_RENT   = 'uex:rentals:live';
const CACHE_KEY_COMP   = 'uex:components:live';
const CACHE_KEY_MINE   = 'uex:mining:live';
const CACHE_KEY_REFI   = 'uex:refineries:live';
const CACHE_KEY_ROUTES = 'uex:routes:live';

const TTL_PRICES = 5 * 60 * 1000;   // 5 min
const TTL_STATIC = 60 * 60 * 1000;  // 1 h

/**
 * Normalise une commodité UEX Corp vers le format compatible avec commodities.js.
 * Format statique attendu : buyPrice: { min, avg, max }, sellPrice: { min, avg, max }
 * @param {object} u — commodité brute UEX Corp
 */
function normalizeCommodity(u) {
  return {
    id: String(u.id),
    name: u.name,
    code: u.code ?? '',
    category: u.kind ?? 'Divers',
    illegal: Boolean(u.is_illegal ?? 0),
    buyPrice: {
      min: u.price_buy_min ?? u.price_buy ?? 0,
      avg: u.price_buy ?? 0,
      max: u.price_buy_max ?? u.price_buy ?? 0,
    },
    sellPrice: {
      min: u.price_sell_min ?? u.price_sell ?? 0,
      avg: u.price_sell ?? 0,
      max: u.price_sell_max ?? u.price_sell ?? 0,
    },
    isMineral: Boolean(u.is_mineral ?? 0),
    isRaw: Boolean(u.is_raw ?? 0),
    isRefined: Boolean(u.is_refined ?? 0),
    available: Boolean(u.is_available_live ?? u.is_available ?? 1),
    source: 'uexcorp',
    _uex: u,
  };
}

/**
 * Normalise un terminal UEX Corp.
 * @param {object} t — terminal brut UEX Corp
 */
function normalizeTerminal(t) {
  return {
    id: String(t.id),
    name: t.name ?? t.displayname ?? '',
    displayName: t.displayname ?? t.name ?? '',
    nickname: t.nickname ?? '',
    code: t.code ?? '',
    system: t.id_star_system === 68 ? 'Stanton' : t.id_star_system === 69 ? 'Pyro' : 'Inconnu',
    source: 'uexcorp',
  };
}

// ─────────────────────────────────────────────────────────────
// Hook — commodités avec données live UEX Corp + fallback local
// ─────────────────────────────────────────────────────────────

/**
 * Retourne les commodités : live depuis UEX Corp si disponible,
 * sinon fallback vers données locales (commodities.js).
 *
 * @returns {{
 *   commodities: Array,
 *   isLive: boolean,
 *   lastUpdated: number|null,
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */
export function useLiveCommodities() {
  const [state, setState] = useState({
    commodities: LOCAL_COMMODITIES,
    isLive: false,
    lastUpdated: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    // Cache hit
    const cached = CacheManager.get(CACHE_KEY_COMM);
    if (cached) {
      setState({ commodities: cached, isLive: true, lastUpdated: Date.now(), loading: false, error: null });
      return;
    }

    try {
      const res = await fetch(UEX_COMMODITIES_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data ?? []);
      const normalized = arr.map(normalizeCommodity);

      CacheManager.set(CACHE_KEY_COMM, normalized, TTL_PRICES);
      setState({ commodities: normalized, isLive: true, lastUpdated: Date.now(), loading: false, error: null });
    } catch (err) {
      // Fallback silencieux vers données locales
      setState({
        commodities: LOCAL_COMMODITIES,
        isLive: false,
        lastUpdated: Date.now(),
        loading: false,
        error: err.message,
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}

// ─────────────────────────────────────────────────────────────
// Hook — terminaux de trading depuis UEX Corp
// ─────────────────────────────────────────────────────────────

/**
 * Retourne les terminaux de trading depuis UEX Corp.
 *
 * @returns {{
 *   terminals: Array,
 *   isLive: boolean,
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */
export function useLiveTerminals() {
  const [state, setState] = useState({
    terminals: [],
    isLive: false,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    const cached = CacheManager.get(CACHE_KEY_TERM);
    if (cached) {
      setState({ terminals: cached, isLive: true, loading: false, error: null });
      return;
    }

    try {
      const res = await fetch(UEX_TERMINALS_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data ?? []);
      const normalized = arr.map(normalizeTerminal);

      CacheManager.set(CACHE_KEY_TERM, normalized, TTL_STATIC);
      setState({ terminals: normalized, isLive: true, loading: false, error: null });
    } catch (err) {
      setState({ terminals: [], isLive: false, loading: false, error: err.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}

// ─────────────────────────────────────────────────────────────
// Helper générique pour hooks UEX
// ─────────────────────────────────────────────────────────────

function useUexData(url, cacheKey, ttl, dataKey, fallback = []) {
  const [state, setState] = useState({
    [dataKey]: fallback,
    isLive: false,
    lastUpdated: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    const cached = CacheManager.get(cacheKey);
    if (cached) {
      setState({ [dataKey]: cached, isLive: true, lastUpdated: Date.now(), loading: false, error: null });
      return;
    }

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.data ?? []);

      CacheManager.set(cacheKey, arr, ttl);
      setState({ [dataKey]: arr, isLive: true, lastUpdated: Date.now(), loading: false, error: null });
    } catch (err) {
      setState({ [dataKey]: fallback, isLive: false, lastUpdated: Date.now(), loading: false, error: err.message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, cacheKey, ttl, dataKey]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refresh: load };
}

// ─────────────────────────────────────────────────────────────
// Hook — véhicules/vaisseaux live depuis UEX Corp
// ─────────────────────────────────────────────────────────────

export function useLiveVehicles() {
  return useUexData(UEX_VEHICLES_URL, CACHE_KEY_VEHI, TTL_STATIC, 'vehicles');
}

// ─────────────────────────────────────────────────────────────
// Hook — prix d'achat vaisseaux par location
// ─────────────────────────────────────────────────────────────

export function useLivePurchases() {
  return useUexData(UEX_PURCHASES_URL, CACHE_KEY_PURCH, TTL_STATIC, 'purchases');
}

// ─────────────────────────────────────────────────────────────
// Hook — prix de location vaisseaux par station
// ─────────────────────────────────────────────────────────────

export function useLiveRentals() {
  return useUexData(UEX_RENTALS_URL, CACHE_KEY_RENT, TTL_STATIC, 'rentals');
}

// ─────────────────────────────────────────────────────────────
// Hook — composants vaisseaux live depuis UEX Corp
// ─────────────────────────────────────────────────────────────

export function useLiveComponents() {
  return useUexData(UEX_COMPONENTS_URL, CACHE_KEY_COMP, TTL_STATIC, 'components');
}

// ─────────────────────────────────────────────────────────────
// Hook — données minage live depuis UEX Corp
// ─────────────────────────────────────────────────────────────

export function useLiveMining() {
  return useUexData(UEX_MINING_URL, CACHE_KEY_MINE, TTL_PRICES, 'mining');
}

// ─────────────────────────────────────────────────────────────
// Hook — données raffinerie live depuis UEX Corp
// ─────────────────────────────────────────────────────────────

export function useLiveRefineries() {
  return useUexData(UEX_REFINERIES_URL, CACHE_KEY_REFI, TTL_PRICES, 'refineries');
}

// ─────────────────────────────────────────────────────────────
// Hook — routes commerciales UEX Corp
// ─────────────────────────────────────────────────────────────

export function useLiveRoutes() {
  return useUexData(UEX_ROUTES_URL, CACHE_KEY_ROUTES, TTL_PRICES, 'routes');
}
