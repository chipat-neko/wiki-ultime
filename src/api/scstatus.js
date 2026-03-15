/**
 * RSI Server Status — API publique cState v5, aucune clé requise.
 * Endpoint: https://status.robertsspaceindustries.com/index.json
 *
 * Structure cState retournée :
 * {
 *   summaryStatus: 'operational' | 'disrupted' | 'down',
 *   systems: [{ name, status: 'operational'|'disrupted'|'down', unresolvedIssues }],
 *   buildDate, buildTime
 * }
 */

const STATUS_URL = 'https://status.robertsspaceindustries.com/index.json';
const TIMEOUT_MS = 8000;

/**
 * Mappe le statut cState vers un statut simplifié.
 * @param {string} s — 'operational'|'disrupted'|'down'
 * @returns {'operational'|'degraded'|'outage'|'unknown'}
 */
function mapStatus(s) {
  switch (s) {
    case 'operational': return 'operational';
    case 'disrupted':   return 'degraded';
    case 'down':        return 'outage';
    default:            return 'unknown';
  }
}

/**
 * Récupère le statut des serveurs RSI via cState.
 * @returns {Promise<{
 *   status: 'operational'|'degraded'|'outage'|'unknown',
 *   description: string,
 *   components: Array<{name: string, status: string}>,
 *   lastChecked: number
 * }>}
 */
export async function fetchServerStatus() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(STATUS_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(id);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // cState peut retourner du whitespace avant le JSON
    const text = await res.text();
    const json = JSON.parse(text.trim());

    const overall = mapStatus(json?.summaryStatus ?? 'unknown');

    const components = (json?.systems ?? []).map(s => ({
      name: s.name,
      status: mapStatus(s.status),
      rawStatus: s.status,
      issues: s.unresolvedIssues ?? [],
    }));

    const descriptions = {
      operational: 'Tous les services opérationnels',
      degraded:    'Dégradations en cours',
      outage:      'Panne majeure détectée',
      unknown:     'Statut inconnu',
    };

    return {
      status: overall,
      description: descriptions[overall] ?? json?.description ?? 'Statut inconnu',
      components,
      buildDate: json?.buildDate ?? null,
      lastChecked: Date.now(),
    };
  } catch (err) {
    clearTimeout(id);
    return {
      status: 'unknown',
      description: 'Impossible de joindre RSI',
      components: [],
      buildDate: null,
      lastChecked: Date.now(),
      error: err.message,
    };
  }
}
