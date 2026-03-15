/**
 * Vercel Serverless Function — Proxy SC Trade Tools (endpoints gratuits).
 *
 * Résout le blocage CORS : le client appelle /api/sc-trade?path=...
 * ce handler relaie vers https://sc-trade.tools/api/...
 *
 * Endpoints proxifiés (gratuits, pas de token) :
 *   /api/sc-trade?path=crowdsource/commodity-listings&page=0
 *   /api/sc-trade?path=locations
 *   /api/sc-trade?path=items
 *   /api/sc-trade?path=shops
 *   /api/sc-trade?path=factions
 *   /api/sc-trade?path=system/sc-version
 */

const BASE = 'https://sc-trade.tools/api';

// Endpoints autorisés (whitelist — pas d'endpoints tokenisés)
const ALLOWED_PATHS = [
  'crowdsource/commodity-listings',
  'locations',
  'items',
  'shops',
  'factions',
  'securityLevels',
  'locationTypes',
  'itemTypes',
  'system/sc-version',
  'system/alert',
  'crowdsource/leaderboards/current',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { path, page } = req.query;

  if (!path) {
    res.status(400).json({ error: 'Paramètre path manquant' });
    return;
  }

  // Sécurité : vérifier que le path est dans la whitelist
  const isAllowed = ALLOWED_PATHS.some(allowed => path.startsWith(allowed));
  if (!isAllowed) {
    res.status(403).json({ error: 'Endpoint non autorisé' });
    return;
  }

  // Construction de l'URL upstream
  let upstreamUrl = `${BASE}/${path}`;
  const params = new URLSearchParams();
  if (page !== undefined) params.set('page', page);
  const qs = params.toString();
  if (qs) upstreamUrl += `?${qs}`;

  // Cache CDN : commodity-listings change souvent (1h côté SC Trade), on met 5min
  const cacheTtl = path.startsWith('crowdsource') ? 300 : 3600;
  res.setHeader('Cache-Control', `s-maxage=${cacheTtl}, stale-while-revalidate=60`);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'StarCitizenWiki/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `SC Trade Tools upstream HTTP ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'upstream_error', message: err.message });
  }
}
