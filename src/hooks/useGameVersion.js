import { useState, useEffect, useCallback } from 'react';
import { CacheManager } from '../core/CacheManager.js';

const UEX_GAME_VERSIONS_URL = 'https://uexcorp.space/api/2.0/game_versions';
const CACHE_KEY = 'uex:game_versions';
const CACHE_TTL = 30 * 60 * 1000;  // 30 min — version ne change pas souvent

/**
 * Hook React — version du jeu Star Citizen depuis UEX Corp.
 *
 * @returns {{
 *   live: string|null,       // ex: '4.6.0'
 *   ptu: string|null,        // ex: '4.7'
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */
export function useGameVersion() {
  const [state, setState] = useState({
    live: null,
    ptu: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Essayer le cache
    const cached = CacheManager.get(CACHE_KEY);
    if (cached) {
      setState({ ...cached, loading: false, error: null });
      return;
    }

    try {
      const res = await fetch(UEX_GAME_VERSIONS_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = {
        live: json?.data?.live ?? null,
        ptu: json?.data?.ptu ?? null,
      };

      CacheManager.set(CACHE_KEY, data, CACHE_TTL);
      setState({ ...data, loading: false, error: null });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
