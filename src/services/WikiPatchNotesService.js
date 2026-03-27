/**
 * Service — récupère les patchnotes Star Citizen depuis l'API MediaWiki de starcitizen.tools
 *
 * Endpoints utilisés :
 *   - prefixsearch : lister les pages Update:Star_Citizen_Alpha_X.Y.Z
 *   - action=parse  : récupérer le HTML structuré de chaque patch
 *
 * Cache : localStorage avec TTL de 6h pour éviter de surcharger le wiki.
 */

import { CacheManager } from '../core/CacheManager.js';

const WIKI_API = 'https://starcitizen.tools/api.php';
const CACHE_KEY_LIST = 'wiki:patchnotes:list';
const CACHE_KEY_DETAIL = 'wiki:patchnotes:detail:';
const CACHE_TTL_LIST = 6 * 60 * 60 * 1000;    // 6h
const CACHE_TTL_DETAIL = 24 * 60 * 60 * 1000;  // 24h

function buildUrl(params) {
  const url = new URL(WIKI_API);
  // origin=* active les headers CORS sur l'API MediaWiki
  url.searchParams.set('origin', '*');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

/**
 * Liste toutes les versions de patches disponibles (Alpha 3.x + 4.x).
 * @param {string|null} maxVersion - version live max (ex: '4.7.0'), exclut les versions futures
 * @returns {Promise<Array<{ title: string, version: string }>>}
 */
export async function fetchPatchList(maxVersion = null) {
  const cacheKey = maxVersion ? `${CACHE_KEY_LIST}:${maxVersion}` : CACHE_KEY_LIST;
  const cached = CacheManager.get(cacheKey);
  if (cached) return cached;

  const results = [];

  // Fetch Alpha 4.x et 3.x en parallèle
  const prefixes = ['Update:Star_Citizen_Alpha_4', 'Update:Star_Citizen_Alpha_3.2'];
  const fetches = prefixes.map(async (prefix) => {
    const url = buildUrl({
      action: 'query',
      list: 'prefixsearch',
      pssearch: prefix,
      pslimit: '50',
      format: 'json',
    });
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.query?.prefixsearch || [];
    } catch {
      return [];
    }
  });

  const responses = await Promise.all(fetches);
  for (const items of responses) {
    for (const item of items) {
      const match = item.title.match(/Alpha\s+([\d.]+)/);
      if (match) {
        results.push({ title: item.title, version: match[1] });
      }
    }
  }

  // Trier par version décroissante
  results.sort((a, b) => compareVersions(b.version, a.version));

  // Filtrer les versions futures si une version max est fournie
  const filtered = maxVersion
    ? results.filter(p => compareVersions(p.version, maxVersion) <= 0)
    : results;

  CacheManager.set(cacheKey, filtered, CACHE_TTL_LIST);
  return filtered;
}

/**
 * Récupère le contenu HTML d'un patch spécifique.
 * @param {string} pageTitle - ex: "Update:Star_Citizen_Alpha_4.7.0"
 * @returns {Promise<{ title: string, version: string, sections: Array<{ heading: string, html: string }> } | null>}
 */
export async function fetchPatchDetail(pageTitle) {
  const cacheKey = CACHE_KEY_DETAIL + pageTitle;
  const cached = CacheManager.get(cacheKey);
  if (cached) return cached;

  try {
    // D'abord récupérer la liste des sections
    const sectionsUrl = buildUrl({
      action: 'parse',
      page: pageTitle,
      prop: 'sections',
      format: 'json',
    });
    const sectionsRes = await fetch(sectionsUrl, { signal: AbortSignal.timeout(10000) });
    if (!sectionsRes.ok) return null;
    const sectionsJson = await sectionsRes.json();

    if (sectionsJson.error) return null;

    const sections = sectionsJson.parse?.sections || [];
    const match = pageTitle.match(/Alpha\s+([\d.]+)/);
    const version = match?.[1] || pageTitle;

    // Récupérer la section 0 (intro) + section 1 (abridged patch notes)
    const sectionIndices = [0, 1];
    const sectionFetches = sectionIndices.map(async (idx) => {
      const url = buildUrl({
        action: 'parse',
        page: pageTitle,
        prop: 'text',
        section: String(idx),
        format: 'json',
      });
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return null;
        const json = await res.json();
        return {
          index: idx,
          heading: idx === 0 ? 'Introduction' : (sections.find(s => s.index === String(idx))?.line || 'Patch Notes'),
          html: json.parse?.text?.['*'] || '',
        };
      } catch {
        return null;
      }
    });

    const sectionResults = (await Promise.all(sectionFetches)).filter(Boolean);

    const result = {
      title: sectionsJson.parse?.title || pageTitle,
      version,
      sections: sectionResults,
      allSections: sections.map(s => ({
        index: s.index,
        heading: s.line?.replace(/<[^>]*>/g, '') || '',
        level: parseInt(s.level, 10),
      })),
    };

    CacheManager.set(cacheKey, result, CACHE_TTL_DETAIL);
    return result;
  } catch {
    return null;
  }
}

/**
 * Récupère une section spécifique d'un patch
 * @param {string} pageTitle
 * @param {number} sectionIndex
 * @returns {Promise<string>} HTML content
 */
export async function fetchPatchSection(pageTitle, sectionIndex) {
  const cacheKey = `${CACHE_KEY_DETAIL}${pageTitle}:s${sectionIndex}`;
  const cached = CacheManager.get(cacheKey);
  if (cached) return cached;

  try {
    const url = buildUrl({
      action: 'parse',
      page: pageTitle,
      prop: 'text',
      section: String(sectionIndex),
      format: 'json',
    });
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return '';
    const json = await res.json();
    const html = json.parse?.text?.['*'] || '';
    CacheManager.set(cacheKey, html, CACHE_TTL_DETAIL);
    return html;
  } catch {
    return '';
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}
