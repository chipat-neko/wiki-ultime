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

  // Ships / Vehicles
  SHIPS: `${UEXCORP_BASE}/ships`,
  SHIP: (id) => `${UEXCORP_BASE}/ships/${id}`,
  VEHICLES: `${UEXCORP_BASE}/vehicles`,
  VEHICLE: (id) => `${UEXCORP_BASE}/vehicles/${id}`,
  VEHICLES_PURCHASES: `${UEXCORP_BASE}/vehicles_purchases`,
  VEHICLES_RENTALS: `${UEXCORP_BASE}/vehicles_rentals`,

  // Vehicle components
  VEHICLE_COMPONENTS: `${UEXCORP_BASE}/vehicle_components`,

  // Items (FPS weapons, armors, attachments)
  ITEMS: `${UEXCORP_BASE}/items`,
  ITEMS_WEAPONS: `${UEXCORP_BASE}/items_weapons`,
  ITEMS_ARMORS: `${UEXCORP_BASE}/items_armors`,
  ITEMS_ATTACHMENTS: `${UEXCORP_BASE}/items_attachments`,

  // Mining
  MINING: `${UEXCORP_BASE}/mining`,

  // Refineries
  REFINERIES: `${UEXCORP_BASE}/refineries`,

  // Commodity routes
  COMMODITIES_ROUTES: `${UEXCORP_BASE}/commodities_routes`,
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

export const SCWIKI_BASE = 'https://api.star-citizen.wiki/api/v2';

export const SCWIKI = {
  // Recherche par nom exact (retourne 1 résultat)
  VEHICLE_SEARCH: (name) =>
    `${SCWIKI_BASE}/vehicles?filter[name]=${encodeURIComponent(name)}&limit=1&locale=en_EN`,
  // Accès direct par slug (ex: "aurora-mr")
  VEHICLE: (slug) =>
    `${SCWIKI_BASE}/vehicles/${encodeURIComponent(slug)}?locale=en_EN`,
};
