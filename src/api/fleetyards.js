import { CacheManager } from '../core/CacheManager.js';
import { FLEETYARDS } from './endpoints.js';

const TTL = 60 * 60 * 1000; // 1 heure

async function apiFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Fleetyards HTTP ${res.status}`);
  return res.json();
}

/**
 * Fleetyards.net API — base de données de vaisseaux Star Citizen.
 * API publique : https://api.fleetyards.net/v1
 */
class FleetyardsApiClass {
  /**
   * Recherche un vaisseau par nom.
   * @param {string} name — Nom du vaisseau (ex: "Aurora MR")
   * @returns {Array} Liste de modèles correspondants
   */
  async searchModel(name) {
    const key = `fy_search_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = CacheManager.get(key);
    if (cached) return cached;

    const json = await apiFetch(FLEETYARDS.MODEL_SEARCH(name));
    const models = Array.isArray(json) ? json : (json.data ?? []);
    CacheManager.set(key, models, TTL);
    return models;
  }

  /**
   * Récupère un modèle par son slug Fleetyards.
   * @param {string} slug — Slug (ex: "aurora-mr", "carrack")
   * @returns {object} Données du modèle
   */
  async getModel(slug) {
    const key = `fy_model_${slug}`;
    const cached = CacheManager.get(key);
    if (cached) return cached;

    const json = await apiFetch(FLEETYARDS.MODEL(slug));
    CacheManager.set(key, json, TTL);
    return json;
  }

  /**
   * Normalise un modèle Fleetyards vers le format local.
   * @param {object} m — Modèle brut Fleetyards
   * @returns {object} Données normalisées
   */
  normalizeModel(m) {
    return {
      id:          m.slug,
      name:        m.name,
      description: m.description ?? null,
      focus:       m.focus ?? null,
      size:        m.size ?? null,
      mass:        m.mass ?? null,
      cargo:       m.cargo ?? null,
      crew: {
        min: m.minCrew ?? 1,
        max: m.maxCrew ?? 1,
      },
      speed: {
        scm:          m.speed?.scm ?? null,
        afterburner:  m.speed?.afterburner ?? null,
        quantum:      m.speed?.quantum ?? null,
      },
      storeImage:      m.storeImage ?? null,
      fleetchartImage: m.fleetchartImage ?? null,
      manufacturer:    m.manufacturer?.name ?? null,
      updatedAt:       m.updatedAt ?? null,
      source:          'fleetyards',
    };
  }
}

export const FleetyardsApi = new FleetyardsApiClass();
export default FleetyardsApi;
