import { useState, useEffect } from 'react';
import { ErkulApi } from '../api/erkul.js';

/**
 * Récupère les stats live d'un vaisseau depuis Erkul Games.
 * Recherche par nom dans la liste Erkul, puis charge les stats détaillées.
 *
 * @param {string|null} shipName — Nom du vaisseau (ex: "Avenger Titan")
 * @param {boolean} enabled — Active la requête (opt-in)
 * @returns {{ data: object|null, loading: boolean, error: string|null }}
 */
export function useErkulShip(shipName, enabled = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shipName || !enabled) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    const nameLower = shipName.toLowerCase();

    ErkulApi.getShips()
      .then(ships => {
        if (cancelled) return null;
        const arr = Array.isArray(ships) ? ships : (ships?.data ?? []);
        const match = arr.find(s => {
          const sName = (s.name ?? '').toLowerCase();
          return sName.includes(nameLower) || nameLower.includes(sName);
        });
        if (!match) return null;
        return ErkulApi.getShip(match.className ?? match.id ?? match.slug);
      })
      .then(ship => {
        if (cancelled) return;
        if (ship) {
          setData(ErkulApi.normalizeShipStats(ship));
        } else {
          setError('Vaisseau non trouvé sur Erkul');
        }
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || 'Erkul indisponible');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [shipName, enabled]);

  return { data, loading, error };
}
