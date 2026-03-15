import { CacheManager } from '../core/CacheManager.js';

/**
 * SC Trade Tools — endpoints gratuits (pas de token requis).
 * Swagger: https://sc-trade.tools/swagger-ui/index.html
 *
 * CORS bloqué → on passe par le proxy :
 *   Dev  : Vite proxy /api/sc-trade → sc-trade.tools
 *   Prod : Vercel serverless function api/sc-trade.js
 */

const PROXY = '/api/sc-trade';

const TTL_LISTINGS = 5 * 60 * 1000;   // 5 min (données crowd)
const TTL_STATIC   = 60 * 60 * 1000;  // 1h (locations, items)

async function proxyFetch(path, page) {
  let url = `${PROXY}?path=${encodeURIComponent(path)}`;
  if (page !== undefined) url += `&page=${page}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`SC Trade Tools HTTP ${res.status}`);
  return res.json();
}

class ScTradeToolsApiClass {
  /**
   * Récupère les listings crowdsourcés (prix d'achat/vente par station).
   * 100 entrées par page, ~97 pages au total.
   * @param {number} page — numéro de page (0-based)
   */
  async getCommodityListings(page = 0) {
    const key = `sct_listings_p${page}`;
    const cached = CacheManager.get(key);
    if (cached) return cached;
    const data = await proxyFetch('crowdsource/commodity-listings', page);
    const arr = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
    CacheManager.set(key, arr, TTL_LISTINGS);
    return arr;
  }

  /**
   * Récupère les N premières pages de listings et les fusionne.
   * @param {number} pages — nombre de pages à charger (défaut: 3 = 300 entrées)
   */
  async getListingsMultiPage(pages = 3) {
    const key = `sct_listings_multi_${pages}`;
    const cached = CacheManager.get(key);
    if (cached) return cached;
    const results = await Promise.all(
      Array.from({ length: pages }, (_, i) =>
        this.getCommodityListings(i).catch(() => [])
      )
    );
    const merged = results.flat();
    CacheManager.set(key, merged, TTL_LISTINGS);
    return merged;
  }

  /**
   * Récupère la liste de toutes les locations SC Trade Tools.
   */
  async getLocations() {
    const key = 'sct_locations';
    const cached = CacheManager.get(key);
    if (cached) return cached;
    const data = await proxyFetch('locations');
    const arr = Array.isArray(data) ? data : [];
    CacheManager.set(key, arr, TTL_STATIC);
    return arr;
  }

  /**
   * Récupère la liste des commodités.
   */
  async getItems() {
    const key = 'sct_items';
    const cached = CacheManager.get(key);
    if (cached) return cached;
    const data = await proxyFetch('items');
    const arr = Array.isArray(data) ? data : [];
    CacheManager.set(key, arr, TTL_STATIC);
    return arr;
  }

  /**
   * Version SC actuelle selon SC Trade Tools.
   */
  async getSCVersion() {
    try {
      const data = await proxyFetch('system/sc-version');
      return typeof data === 'string' ? data : (data?.version ?? null);
    } catch {
      return null;
    }
  }

  /**
   * Calcule les meilleures routes à partir des listings crowdsourcés.
   * Logique : acheter (SELLS = station vend au joueur) au prix le plus bas,
   *           vendre (BUYS = station achète au joueur) au prix le plus haut.
   *
   * @param {Array} listings — résultat de getListingsMultiPage()
   * @param {object} options
   * @param {number} options.minProfit — profit min par SCU (défaut: 500 aUEC)
   * @param {number} options.maxRoutes — nombre de routes max (défaut: 20)
   * @returns {Array<{commodity, buyAt, sellAt, buyPrice, sellPrice, profitPerScu, age}>}
   */
  computeRoutes(listings, { minProfit = 500, maxRoutes = 20 } = {}) {
    // Séparer SELLS (joueur achète) et BUYS (joueur vend)
    const buyOpps  = {};  // commodity → [{location, price, timestamp}]
    const sellOpps = {};

    for (const entry of listings) {
      if (!entry.commodity || !entry.location || !entry.price) continue;
      const price = this._normalizePrice(entry.price);
      if (price <= 0) continue;
      const commodity = entry.commodity.toLowerCase();
      const loc = this._formatLocation(entry.location);
      const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;

      if (entry.transaction === 'SELLS') {
        // Station sells → joueur peut acheter ici
        if (!buyOpps[commodity]) buyOpps[commodity] = [];
        buyOpps[commodity].push({ location: loc, price, timestamp: ts });
      } else if (entry.transaction === 'BUYS') {
        // Station buys → joueur peut vendre ici
        if (!sellOpps[commodity]) sellOpps[commodity] = [];
        sellOpps[commodity].push({ location: loc, price, timestamp: ts });
      }
    }

    const routes = [];

    for (const commodity of Object.keys(buyOpps)) {
      if (!sellOpps[commodity]) continue;
      // Meilleur prix d'achat = le plus bas
      const bestBuy  = buyOpps[commodity].reduce((a, b) => a.price < b.price ? a : b);
      // Meilleur prix de vente = le plus haut
      const bestSell = sellOpps[commodity].reduce((a, b) => a.price > b.price ? a : b);

      const profitPerScu = bestSell.price - bestBuy.price;
      if (profitPerScu < minProfit) continue;
      if (bestBuy.location === bestSell.location) continue;

      routes.push({
        commodity: this._capitalize(commodity),
        buyAt:     bestBuy.location,
        sellAt:    bestSell.location,
        buyPrice:  bestBuy.price,
        sellPrice: bestSell.price,
        profitPerScu,
        // Âge de la donnée la plus ancienne impliquée
        age: Math.min(bestBuy.timestamp, bestSell.timestamp),
        source: 'sct_crowd',
      });
    }

    // Trier par profit décroissant
    routes.sort((a, b) => b.profitPerScu - a.profitPerScu);
    return routes.slice(0, maxRoutes);
  }

  // ── Helpers privés ────────────────────────────────────────────────────────

  /**
   * Le prix dans l'API est en micro-aUEC (× 10^-6 pour avoir aUEC/SCU).
   * 2_300_000_000 → 2 300 aUEC/SCU (plausible pour Processed Food)
   */
  _normalizePrice(raw) {
    return Math.round(raw / 1_000_000);
  }

  /** "stanton > cru l4 > cru-l4 shallow fields station" → "CRU-L4 Shallow Fields" */
  _formatLocation(raw) {
    const parts = raw.split('>').map(s => s.trim());
    const last = parts[parts.length - 1] ?? raw;
    return last
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  _capitalize(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }
}

export const ScTradeToolsApi = new ScTradeToolsApiClass();
export default ScTradeToolsApi;
