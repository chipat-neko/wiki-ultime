import { useState, useEffect } from 'react';
import { FleetyardsApi } from '../api/fleetyards.js';

/**
 * Récupère les données live d'un vaisseau depuis Fleetyards.net.
 * Recherche par nom exact, puis prend le premier résultat.
 *
 * @param {string|null} shipName — Nom du vaisseau (ex: "Aurora MR")
 * @param {boolean} enabled — Active la requête (opt-in)
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useFleetyardsShip(shipName, enabled = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shipName || !enabled) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    FleetyardsApi.searchModel(shipName)
      .then(models => {
        if (cancelled) return;
        if (models.length > 0) {
          setData(FleetyardsApi.normalizeModel(models[0]));
        } else {
          setError('Vaisseau non trouvé sur Fleetyards');
        }
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Erreur API Fleetyards');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [shipName, enabled]);

  return { data, loading, error };
}
