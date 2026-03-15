import { useState, useCallback } from 'react';
import { ScTradeToolsApi } from '../api/sctradetools.js';

/**
 * Récupère et calcule les meilleures routes depuis SC Trade Tools.
 * Utilise les listings crowdsourcés (endpoint public, pas de token requis).
 * Déclenchement manuel via fetch().
 *
 * @returns {{
 *   routes: Array,
 *   listings: Array,
 *   scVersion: string|null,
 *   isLive: boolean,
 *   loading: boolean,
 *   error: string|null,
 *   fetch: () => void,
 * }}
 */
export function useSCTradeData() {
  const [state, setState] = useState({
    routes: [],
    listings: [],
    scVersion: null,
    isLive: false,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch en parallèle : listings (3 pages = 300 entrées) + version SC
      const [listings, scVersion] = await Promise.all([
        ScTradeToolsApi.getListingsMultiPage(3),
        ScTradeToolsApi.getSCVersion(),
      ]);

      const routes = ScTradeToolsApi.computeRoutes(listings, {
        minProfit: 300,
        maxRoutes: 25,
      });

      setState({
        routes,
        listings,
        scVersion,
        isLive: true,
        loading: false,
        error: listings.length === 0
          ? 'Aucune donnée reçue depuis SC Trade Tools'
          : null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLive: false,
        loading: false,
        error: err.message || 'SC Trade Tools indisponible',
      }));
    }
  }, []);

  return { ...state, fetch: load };
}
