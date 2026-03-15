/**
 * Service de récupération des images de vaisseaux via l'API MediaWiki de starcitizen.tools.
 * Cache les résultats dans localStorage pour 7 jours.
 *
 * Endpoint : https://starcitizen.tools/api.php
 * Méthode  : prop=pageimages pour récupérer le thumbnail principal de chaque page vaisseau.
 */

import { SHIPS } from '../datasets/ships.js';

const CACHE_KEY = 'sc_ship_images_v2';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours
const WIKI_API  = 'https://starcitizen.tools/api.php';
const THUMB_SIZE = 400;
const BATCH_SIZE = 15; // MediaWiki supporte plusieurs titres en une requête

/**
 * Correspondances entre nos noms et les titres de page sur le wiki.
 * Uniquement pour les cas où les noms diffèrent.
 */
const WIKI_OVERRIDES = {
  'Hercules C2':                 'C2 Hercules Starlifter',
  'Hercules M2':                 'M2 Hercules Starlifter',
  'MOLE':                        'Argo MOLE',
  'RAFT':                        'Argo RAFT',
  'F7C Hornet':                  'F7C Hornet',
  'F7A Hornet Mk II':            'F7A Hornet Mk II',
  'Fury MX':                     'Fury MX',
  'Zeus Mk II CL':               'Zeus Mk II CL',
  'Mercury Star Runner':         'Mercury Star Runner',
  'Constellation Andromeda':     'Constellation Andromeda',
  'Constellation Aquila':        'Constellation Aquila',
  'Constellation Taurus':        'Constellation Taurus',
  '890 Jump':                    '890 Jump',
  'Ironclad':                    'Ironclad',
  'C1 Spirit':                   'C1 Spirit',
  'E1 Spirit':                   'E1 Spirit',
  'A1 Spirit':                   'A1 Spirit',
  'Freelancer MAX':              'Freelancer MAX',
  'Starfarer Gemini':            'Starfarer Gemini',
  'Hull A':                      'Hull A',
  'Hull C':                      'Hull C',
  'Reliant Kore':                'Reliant Kore',
};

// Reverse map : titre wiki → notre nom
const REVERSE_MAP = {};
for (const [ourName, wikiName] of Object.entries(WIKI_OVERRIDES)) {
  REVERSE_MAP[wikiName] = ourName;
}

function toWikiTitle(name) {
  return (WIKI_OVERRIDES[name] || name).replace(/ /g, '_');
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch {}
  return null;
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

/**
 * Interroge le wiki pour un batch de noms de vaisseaux.
 * @param {string[]} names
 * @returns {Promise<Object>} map ourName → imageUrl
 */
async function fetchBatch(names) {
  const titles = names.map(toWikiTitle).join('|');
  const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=${THUMB_SIZE}&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const result = {};
  for (const page of Object.values(json.query?.pages || {})) {
    if (!page.thumbnail?.source) continue;
    // Convertir le titre wiki → notre nom
    const wikiTitle = page.title;
    const ourName = REVERSE_MAP[wikiTitle]          // override connu
                 || REVERSE_MAP[wikiTitle.replace(/_/g, ' ')]
                 || wikiTitle;                      // même nom
    result[ourName] = page.thumbnail.source;
  }
  return result;
}

/**
 * Récupère toutes les images de vaisseaux depuis le wiki.
 * Utilise le cache localStorage si disponible et valide.
 * @returns {Promise<Object>} map nom_vaisseau → url_image
 */
export async function fetchShipImages() {
  const cached = loadCache();
  if (cached) return cached;

  try {
    const shipNames = SHIPS.map(s => s.name);
    const map = {};

    for (let i = 0; i < shipNames.length; i += BATCH_SIZE) {
      const batch = shipNames.slice(i, i + BATCH_SIZE);
      const batchResult = await fetchBatch(batch);
      Object.assign(map, batchResult);
    }

    saveCache(map);
    return map;
  } catch {
    return {};
  }
}

/**
 * Résout l'URL d'image d'un vaisseau.
 * Priorité : image wiki > fallback local > null
 * @param {string}      shipName   Nom du vaisseau
 * @param {string|null} fallback   URL locale de fallback
 * @param {Object|null} apiImages  Map retourné par fetchShipImages()
 * @returns {string|null}
 */
export function resolveShipImage(shipName, fallback, apiImages) {
  if (!apiImages) return fallback || null;
  return apiImages[shipName] || fallback || null;
}
