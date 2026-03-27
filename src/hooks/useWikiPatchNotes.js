import { useState, useEffect, useCallback } from 'react';
import { fetchPatchList, fetchPatchDetail, fetchPatchSection } from '../services/WikiPatchNotesService.js';

/**
 * Hook — liste des versions de patches disponibles depuis le wiki.
 * @param {string|null} maxVersion - version live max (ex: '4.7.0'), exclut les versions futures
 * @returns {{ patches: Array<{ title, version }>, loading: boolean, error: string|null }}
 */
export function useWikiPatchList(maxVersion = null) {
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Attendre d'avoir la version live avant de fetch
    if (!maxVersion) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    fetchPatchList(maxVersion)
      .then(list => { if (!cancelled) setPatches(list); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [maxVersion]);

  return { patches, loading, error };
}

/**
 * Hook — contenu détaillé d'un patch spécifique.
 * @param {string|null} pageTitle - ex: "Update:Star_Citizen_Alpha_4.7.0"
 * @returns {{ detail: object|null, loading: boolean, error: string|null }}
 */
export function useWikiPatchDetail(pageTitle) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pageTitle) { setDetail(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPatchDetail(pageTitle)
      .then(d => { if (!cancelled) setDetail(d); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageTitle]);

  return { detail, loading, error };
}

/**
 * Hook — charge une section à la demande.
 * @returns {{ loadSection: (title, idx) => Promise<string>, sectionCache: Map }}
 */
export function useWikiPatchSection() {
  const [cache, setCache] = useState({});

  const loadSection = useCallback(async (pageTitle, sectionIndex) => {
    const key = `${pageTitle}:${sectionIndex}`;
    if (cache[key]) return cache[key];

    const html = await fetchPatchSection(pageTitle, sectionIndex);
    setCache(prev => ({ ...prev, [key]: html }));
    return html;
  }, [cache]);

  return { loadSection, sectionCache: cache };
}
