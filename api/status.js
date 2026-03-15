/**
 * Vercel Serverless Function — Proxy statut serveurs RSI.
 *
 * Résout le blocage CORS du navigateur : le client appelle /api/status
 * (même origine), ce handler récupère https://status.robertsspaceindustries.com/index.json
 * côté serveur et retourne les données avec les bons headers.
 *
 * Cache 60 s côté CDN Vercel (stale-while-revalidate 30 s supplémentaires).
 */

const RSI_STATUS_URL = 'https://status.robertsspaceindustries.com/index.json';

export default async function handler(req, res) {
  // CORS — autoriser toutes les origines (données publiques)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Cache CDN Vercel : 60 s frais, jusqu'à 90 s stale
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  try {
    const upstream = await fetch(RSI_STATUS_URL, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `RSI upstream HTTP ${upstream.status}` });
      return;
    }

    const text = await upstream.text();
    const data = JSON.parse(text.trim());

    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'upstream_error', message: err.message });
  }
}
