import { useState, useEffect, useCallback } from 'react';
import { COMMODITIES as LOCAL_COMMODITIES } from '../datasets/commodities.js';
import { CacheManager } from '../core/CacheManager.js';

const UEX_COMMODITIES_URL = 'https://uexcorp.space/api/2.0/commodities';
const UEX_TERMINALS_URL   = 'https://uexcorp.space/api/2.0/terminals';
const CACHE_KEY_COMM = 'uex:commodities:live';
const CACHE_KEY_TERM = 'uex:terminals:live';
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
