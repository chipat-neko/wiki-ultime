import { useState, useCallback } from 'react';
import { ScTradeToolsApi } from '../api/sctradetools.js';
import { CacheManager } from '../core/CacheManager.js';

const CACHE_KEY = 'sct:trade_data:live';
const TTL = 5 * 60 * 1000; // 5 min

/**
 * Récupère les routes commerciales depuis SC Trade Tools.
 * L'appel est déclenché manuellement via fetch().
 *
 * @returns {{
 *   routes: Array,
 *   isLive: boolean,
 *   loading: boolean,
 *   error: string|null,
 *   fetch: () => void,
 * }}
 */
export function useSCTradeData() {
  const [state, setState] = useState({
    routes: [],
    isLive: false,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const cached = CacheManager.get(CACHE_KEY);
    if (cached) {
      setState({ routes: cached, isLive: true, loading: false, error: null });
      return;
    }

    try {
      const data = await ScTradeToolsApi.getTradeData();
      const arr = Array.isArray(data) ? data : (data?.data ?? data?.routes ?? []);
      const normalized = arr.map(r => ScTradeToolsApi.normalizeRoute(r));
      CacheManager.set(CACHE_KEY, normalized, TTL);
      setState({ routes: normalized, isLive: true, loading: false, error: null });
    } catch (err) {
      setState({
        routes: [],
        isLive: false,
        loading: false,
        error: err.message || 'SC Trade Tools indisponible',
      });
    }
  }, []);

  return { ...state, fetch: load };
}
