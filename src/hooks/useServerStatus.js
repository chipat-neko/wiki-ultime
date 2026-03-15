import { useState, useEffect, useCallback } from 'react';
import { fetchServerStatus } from '../api/scstatus.js';
import { CacheManager, CACHE_KEYS } from '../core/CacheManager.js';

const POLL_INTERVAL = 5 * 60 * 1000;  // 5 min
const CACHE_TTL     = 4 * 60 * 1000;  // 4 min (légèrement < poll pour forcer refresh)

const INITIAL_STATE = {
  status: 'unknown',
  description: '',
  components: [],
  lastChecked: null,
  loading: true,
  error: null,
};

/**
 * Hook React — statut serveurs RSI avec cache et polling automatique.
 *
 * @returns {{
 *   status: 'operational'|'degraded'|'outage'|'unknown',
 *   description: string,
 *   components: Array,
 *   lastChecked: number|null,
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */
export function useServerStatus() {
  const [state, setState] = useState(INITIAL_STATE);

  const load = useCallback(async (force = false) => {
    setState(prev => ({ ...prev, loading: true }));

    // Essayer le cache d'abord (sauf refresh forcé)
    if (!force) {
      const cached = CacheManager.get(CACHE_KEYS.SERVER_STATUS);
      if (cached) {
        setState({ ...cached, loading: false, error: null });
        return;
      }
    }

    const data = await fetchServerStatus();
    CacheManager.set(CACHE_KEYS.SERVER_STATUS, data, CACHE_TTL);
    setState({ ...data, loading: false, error: data.error ?? null });
  }, []);

  // Chargement initial
  useEffect(() => {
    load();
  }, [load]);

  // Polling périodique
  useEffect(() => {
    const id = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  return {
    ...state,
    refresh: () => load(true),
  };
}
