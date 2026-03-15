import { useState, useEffect } from 'react';
import { SCWikiApi } from '../api/scwiki.js';

/**
 * Récupère les stats live d'un vaisseau depuis la SC Wiki API.
 * Retourne vitesses, shields, masse, carburant, émissions.
 *
 * @param {string|null} shipName — Nom du vaisseau (ex: "Aurora MR")
 * @param {boolean} enabled — Active la requête (opt-in)
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useSCWikiShip(shipName, enabled = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shipName || !enabled) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    SCWikiApi.getVehicle(shipName)
      .then(vehicle => {
        if (cancelled) return;
        if (vehicle) {
          setData(SCWikiApi.normalizeVehicle(vehicle));
        } else {
          setError('Vaisseau non trouvé sur SC Wiki');
        }
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'SC Wiki indisponible');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [shipName, enabled]);

  return { data, loading, error };
}
