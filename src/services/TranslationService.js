/**
 * Service de traduction EN → FR via l'API Google Translate (client gtx, gratuit).
 *
 * On traduit par segments de ~4500 caractères max.
 * Les résultats sont cachés en mémoire pour éviter les appels redondants.
 */

const API_URL = 'https://translate.googleapis.com/translate_a/single';
const MAX_CHUNK = 4500;
const cache = new Map();

/**
 * Traduit un texte EN → FR via Google Translate.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function translateChunk(text) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (cache.has(trimmed)) return cache.get(trimmed);

  const url = new URL(API_URL);
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', 'fr');
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', trimmed);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return text;

    const json = await res.json();
    // Réponse : [[["traduction","original",null,null,x],...],...]
    const translated = (json?.[0] || [])
      .map(segment => segment?.[0] || '')
      .join('');

    const result = translated || text;
    cache.set(trimmed, result);
    return result;
  } catch {
    return text;
  }
}

/**
 * Découpe un texte en segments (coupe aux phrases).
 */
function splitIntoChunks(text) {
  if (text.length <= MAX_CHUNK) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > MAX_CHUNK) {
    let cutAt = remaining.lastIndexOf('. ', MAX_CHUNK);
    if (cutAt < MAX_CHUNK * 0.3) cutAt = remaining.lastIndexOf(', ', MAX_CHUNK);
    if (cutAt < MAX_CHUNK * 0.3) cutAt = remaining.lastIndexOf(' ', MAX_CHUNK);
    if (cutAt < MAX_CHUNK * 0.3) cutAt = MAX_CHUNK;

    chunks.push(remaining.slice(0, cutAt + 1));
    remaining = remaining.slice(cutAt + 1);
  }
  if (remaining.trim()) chunks.push(remaining);
  return chunks;
}

/**
 * Traduit du HTML en préservant les balises.
 *
 * @param {string} html - contenu HTML en anglais
 * @returns {Promise<string>} HTML traduit en français
 */
export async function translateHtml(html) {
  if (!html) return html;

  // Extraire les segments de texte (hors balises)
  const parts = [];
  const regex = /(<[^>]+>)|([^<]+)/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      parts.push({ type: 'tag', value: match[1] });
    } else if (match[2]) {
      parts.push({ type: 'text', value: match[2] });
    }
  }

  // Collecter les textes à traduire (ignorer whitespace pur)
  const textsToTranslate = parts
    .filter(p => p.type === 'text' && p.value.trim().length > 1)
    .map(p => p.value.trim());

  if (textsToTranslate.length === 0) return html;

  // Regrouper en batches avec séparateur " || " pour pouvoir re-séparer après
  const SEP = ' || ';
  const batches = [];
  let currentBatch = [];
  let currentLen = 0;

  for (const text of textsToTranslate) {
    if (currentLen + text.length + SEP.length > MAX_CHUNK && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [];
      currentLen = 0;
    }
    currentBatch.push(text);
    currentLen += text.length + SEP.length;
  }
  if (currentBatch.length > 0) batches.push(currentBatch);

  // Traduire chaque batch (max 3 en parallèle pour ne pas flood)
  const translationMap = new Map();
  const PARALLEL = 3;

  for (let i = 0; i < batches.length; i += PARALLEL) {
    const slice = batches.slice(i, i + PARALLEL);
    const results = await Promise.all(
      slice.map(async (batch) => {
        const joined = batch.join(SEP);
        const chunks = splitIntoChunks(joined);
        const translated = await Promise.all(chunks.map(c => translateChunk(c)));
        return { batch, result: translated.join('') };
      })
    );

    for (const { batch, result } of results) {
      // Re-séparer par " || " ou "||" (Google peut modifier les espaces)
      const translatedParts = result.split(/\s*\|\|\s*/);
      batch.forEach((original, idx) => {
        translationMap.set(original, translatedParts[idx]?.trim() || original);
      });
    }
  }

  // Reconstruire le HTML avec les traductions
  return parts.map(p => {
    if (p.type === 'tag') return p.value;
    const trimmed = p.value.trim();
    if (trimmed.length <= 1) return p.value;
    const translated = translationMap.get(trimmed);
    if (!translated) return p.value;
    const leadingSpace = p.value.match(/^\s*/)[0];
    const trailingSpace = p.value.match(/\s*$/)[0];
    return leadingSpace + translated + trailingSpace;
  }).join('');
}
