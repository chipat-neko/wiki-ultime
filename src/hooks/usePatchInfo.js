import { useMemo } from 'react';
import { buildPatchIndex, getLatestVersion, PATCH_NOTES } from '../datasets/patchnotes.js';

// Index construit une seule fois au chargement du module
const PATCH_INDEX = buildPatchIndex();
const LATEST_VERSION = getLatestVersion();

/**
 * Hook — vérifie si un item est nouveau/modifié dans le dernier patch.
 *
 * @param {string} category - clé de catégorie ('ships', 'fps', 'missions', etc.)
 * @param {string} itemId   - identifiant de l'item
 * @returns {{ isNew: boolean, isChanged: boolean, version: string|null, type: string|null }}
 */
export function usePatchStatus(category, itemId) {
  return useMemo(() => {
    const entry = PATCH_INDEX[category]?.[itemId];
    if (!entry) return { isNew: false, isChanged: false, version: null, type: null };

    const isLatest = entry.version === LATEST_VERSION;
    return {
      isNew: isLatest && entry.type === 'added',
      isChanged: isLatest && (entry.type === 'changed' || entry.type === 'fixed'),
      version: entry.version,
      type: entry.type,
    };
  }, [category, itemId]);
}

/**
 * Hook — renvoie toutes les infos de patch pour une catégorie entière.
 * Utile pour afficher des badges dans une liste/table.
 *
 * @param {string} category - clé de catégorie
 * @returns {Record<string, { version: string, type: string, isNew: boolean, isChanged: boolean }>}
 */
export function usePatchCategory(category) {
  return useMemo(() => {
    const catIndex = PATCH_INDEX[category];
    if (!catIndex) return {};

    const result = {};
    for (const [id, entry] of Object.entries(catIndex)) {
      const isLatest = entry.version === LATEST_VERSION;
      result[id] = {
        ...entry,
        isNew: isLatest && entry.type === 'added',
        isChanged: isLatest && (entry.type === 'changed' || entry.type === 'fixed'),
      };
    }
    return result;
  }, [category]);
}

/**
 * Hook — renvoie la version courante et la liste des versions disponibles.
 */
export function usePatchVersions() {
  return useMemo(() => ({
    latest: LATEST_VERSION,
    versions: PATCH_NOTES.map(p => ({ version: p.version, date: p.date, title: p.title })),
  }), []);
}
