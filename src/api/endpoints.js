/**
 * API endpoint constants for all external integrations.
 * Base URLs and path builders for UEX Corp, Erkul, and SC Trade Tools.
 */

export const UEXCORP_BASE = 'https://uexcorp.space/api/2.0';
export const ERKUL_BASE = 'https://www.erkul.games/api';
export const SCTRADETOOLS_BASE = 'https://sc-trade.tools/api';

export const UEXCORP = {
  // Commodities
  COMMODITIES: `${UEXCORP_BASE}/commodities`,
  COMMODITY: (id) => `${UEXCORP_BASE}/commodities/${id}`,
  COMMODITY_PRICES: (id) => `${UEXCORP_BASE}/commodities/${id}/prices`,

  // Terminals (stations/shops)
  TERMINALS: `${UEXCORP_BASE}/terminals`,
  TERMINAL: (id) => `${UEXCORP_BASE}/terminals/${id}`,
  TERMINAL_PRICES: (terminalId, commodityId) =>
    `${UEXCORP_BASE}/terminals/${terminalId}/commodities/${commodityId}`,

  // Trade routes
  TRADE_ROUTES: `${UEXCORP_BASE}/trade_routes`,
  BEST_TRADES: (fromTerminal, toTerminal, scu) =>
    `${UEXCORP_BASE}/trade_routes?id_terminal_origin=${fromTerminal}&id_terminal_destination=${toTerminal}&scu=${scu}`,

  // Planets / systems
  STAR_SYSTEMS: `${UEXCORP_BASE}/star_systems`,
  PLANETS: `${UEXCORP_BASE}/planets`,
  MOONS: `${UEXCORP_BASE}/moons`,
  SPACE_STATIONS: `${UEXCORP_BASE}/space_stations`,

  // Ships
  SHIPS: `${UEXCORP_BASE}/ships`,
  SHIP: (id) => `${UEXCORP_BASE}/ships/${id}`,
};

export const ERKUL = {
  // Ships / loadouts
  SHIPS: `${ERKUL_BASE}/ships`,
  SHIP: (code) => `${ERKUL_BASE}/ships/${code}`,
  SHIP_LOADOUT: (code) => `${ERKUL_BASE}/ships/${code}/loadout`,

  // Items / weapons
  ITEMS: `${ERKUL_BASE}/items`,
  ITEM: (id) => `${ERKUL_BASE}/items/${id}`,
  ITEM_STATS: (id) => `${ERKUL_BASE}/items/${id}/stats`,

  // DPS calculations
  DPS_CALC: `${ERKUL_BASE}/dps`,
};

export const SCTRADETOOLS = {
  // Trade data
  TRADE_DATA: `${SCTRADETOOLS_BASE}/trade`,
  COMMODITY_DATA: (name) => `${SCTRADETOOLS_BASE}/trade?commodity=${encodeURIComponent(name)}`,

  // Station prices
  STATION_PRICES: (stationCode) => `${SCTRADETOOLS_BASE}/prices?station=${stationCode}`,

  // Best routes
  BEST_ROUTES: (from, to, scu, budget) =>
    `${SCTRADETOOLS_BASE}/routes?from=${from}&to=${to}&scu=${scu}&budget=${budget}`,
};

export const FLEETYARDS_BASE = 'https://api.fleetyards.net/v1';

export const FLEETYARDS = {
  MODELS:        `${FLEETYARDS_BASE}/models`,
  MODEL:         (slug) => `${FLEETYARDS_BASE}/models/${slug}`,
  MODEL_SEARCH:  (q)    => `${FLEETYARDS_BASE}/models?q=${encodeURIComponent(q)}&perPage=5`,
  MANUFACTURERS: `${FLEETYARDS_BASE}/manufacturers`,
};
