/**
 * buyLocations.js — Lieux d'achat des vaisseaux en jeu
 * Source: Star Citizen Alpha 4.x (Stanton + Pyro + Nyx)
 * Mise à jour: Alpha 4.6
 */

// ============================================================
// DÉFINITION DES REVENDEURS
// ============================================================
export const DEALERS = {
  'new-deal': {
    id: 'new-deal',
    name: 'New Deal',
    location: 'Lorville',
    body: 'Hurston',
    system: 'Stanton',
    type: 'Concessionnaire',
    legal: true,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/30',
    border: 'border-cyan-700/40',
  },
  'astro-armada': {
    id: 'astro-armada',
    name: 'Astro Armada',
    location: 'Area18',
    body: 'ArcCorp',
    system: 'Stanton',
    type: 'Concessionnaire',
    legal: true,
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-700/40',
  },
  'cousin-crows': {
    id: 'cousin-crows',
    name: "Cousin Crow's Custom Craft",
    location: 'New Babbage',
    body: 'microTech',
    system: 'Stanton',
    type: 'Concessionnaire',
    legal: true,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-700/40',
  },
  'crusader-showroom': {
    id: 'crusader-showroom',
    name: 'Crusader Industries',
    location: 'Orison',
    body: 'Crusader',
    system: 'Stanton',
    type: 'Showroom Fabricant',
    legal: true,
    color: 'text-orange-400',
    bg: 'bg-orange-900/30',
    border: 'border-orange-700/40',
  },
  'levski': {
    id: 'levski',
    name: 'Marché de Levski',
    location: 'Levski',
    body: 'Delamar',
    system: 'Nyx',
    type: 'Marché Indépendant',
    legal: false,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-700/40',
  },
  'pyrochem': {
    id: 'pyrochem',
    name: 'Pyrochem Industrial',
    location: 'Pyrochem Station',
    body: 'Bloom (Pyro IV)',
    system: 'Pyro',
    type: 'Marché Libre',
    legal: false,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-700/40',
  },
  'checkmate': {
    id: 'checkmate',
    name: 'Checkmate Station',
    location: 'Checkmate',
    body: 'Orbite Pyro V',
    system: 'Pyro',
    type: 'Marché Libre',
    legal: false,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-700/40',
  },
  'ruin-station': {
    id: 'ruin-station',
    name: 'Ruin Station',
    location: 'Ruin Station',
    body: 'Orbite Monox (Pyro VI)',
    system: 'Pyro',
    type: 'Marché Libre',
    legal: false,
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-700/40',
  },
  'seraphim': {
    id: 'seraphim',
    name: 'Seraphim Station',
    location: 'Seraphim Station',
    body: 'Orbite Crusader',
    system: 'Stanton',
    type: 'Station Orbitale',
    legal: true,
    color: 'text-green-400',
    bg: 'bg-green-900/30',
    border: 'border-green-700/40',
  },
};

// ============================================================
// MAPPING SHIP ID → DEALER IDs
// ============================================================
// [] = pas encore en jeu / pledge uniquement
// Ordre: Stanton légal, Stanton illégal, Nyx, Pyro
export const SHIP_BUY_LOCATIONS = {

  // ---- AEGIS DYNAMICS ----
  'aegis-avenger-titan':        ['new-deal', 'astro-armada'],
  'aegis-avenger-stalker':      ['new-deal', 'astro-armada'],
  'aegis-avenger-warlock':      ['new-deal', 'astro-armada'],
  'aegis-gladius':              ['new-deal', 'astro-armada'],
  'aegis-gladius-valiant':      ['astro-armada'],
  'aegis-sabre':                ['new-deal', 'astro-armada'],
  'aegis-sabre-comet':          ['astro-armada'],
  'aegis-sabre-raven':          [], // pledge uniquement
  'aegis-sabre-firebird':       ['new-deal', 'astro-armada'],
  'aegis-eclipse':              ['new-deal', 'astro-armada'],
  'aegis-redeemer':             ['new-deal', 'astro-armada'],
  'aegis-redeemer-gunship':     ['astro-armada'],
  'aegis-vanguard-warden':      ['new-deal', 'astro-armada'],
  'aegis-vanguard-harbinger':   ['new-deal', 'astro-armada'],
  'aegis-vanguard-sentinel':    ['new-deal', 'astro-armada'],
  'aegis-vanguard-hoplite':     ['new-deal', 'astro-armada'],
  'aegis-reclaimer':            ['new-deal', 'astro-armada'],
  'aegis-vulcan':               ['new-deal', 'astro-armada'],
  'aegis-hammerhead':           ['astro-armada'],
  'aegis-hammerhead-best-in-show': [],
  'aegis-retaliator':           ['new-deal', 'astro-armada'],
  'aegis-retaliator-bomber':    ['astro-armada'],
  'aegis-nautilus':             [], // pas encore en jeu
  'aegis-nautilus-solstice':    [],
  'aegis-idris-p':              [], // pas encore en jeu
  'aegis-idris-m':              [],
  'aegis-javelin':              [], // pledge uniquement
  'aegis-eclipse-stealth':      [],

  // ---- ANVIL AEROSPACE ----
  'anvil-carrack':              ['new-deal', 'astro-armada'],
  'anvil-f7c-hornet':           ['new-deal', 'astro-armada'],
  'anvil-f7a-hornet-mk2':       ['astro-armada'], // nécessite réputation UEE
  'anvil-f7c-hornet-wildfire':  [],
  'anvil-f8c-lightning':        ['astro-armada'], // très rare
  'anvil-f7c-m-super-hornet-mk2': ['astro-armada'],
  'anvil-super-hornet-heartseeker': [],
  'anvil-valkyrie':             ['new-deal', 'astro-armada'],
  'anvil-valkyrie-liberator':   [],
  'anvil-arrow':                ['new-deal', 'astro-armada'],
  'anvil-hurricane':            ['new-deal', 'astro-armada'],
  'anvil-terrapin':             ['new-deal', 'astro-armada'],
  'anvil-gladiator':            ['new-deal', 'astro-armada'],
  'anvil-hawk':                 ['new-deal', 'astro-armada'],
  'anvil-c8-pisces':            ['new-deal', 'astro-armada'],
  'anvil-c8x-pisces':           ['new-deal', 'astro-armada'],
  'anvil-c8r-pisces':           ['astro-armada'],
  'anvil-liberator':            [], // pas encore en jeu
  'anvil-ballista':             ['new-deal'],
  'anvil-centurion':            ['new-deal'],
  'anvil-gladius-valiant':      ['astro-armada'],
  'anvil-stv':                  ['new-deal'],

  // ---- DRAKE INTERPLANETARY ----
  'drake-cutlass-black':        ['new-deal', 'astro-armada', 'levski', 'pyrochem'],
  'drake-cutlass-blue':         ['new-deal', 'astro-armada'],
  'drake-cutlass-red':          ['new-deal', 'astro-armada'],
  'drake-cutlass-steel':        ['new-deal', 'astro-armada'],
  'drake-caterpillar':          ['new-deal', 'astro-armada', 'levski'],
  'drake-vulture':              ['new-deal', 'astro-armada'],
  'drake-herald':               ['new-deal', 'astro-armada', 'levski'],
  'drake-herald-black':         [],
  'drake-buccaneer':            ['new-deal', 'astro-armada', 'levski', 'pyrochem'],
  'drake-corsair':              ['new-deal', 'astro-armada', 'pyrochem', 'checkmate'],
  'drake-ironclad':             ['new-deal', 'astro-armada'],
  'drake-ironclad-assault':     ['astro-armada'],
  'drake-cutter':               ['new-deal', 'astro-armada', 'levski', 'pyrochem'],
  'drake-cutter-scout':         ['new-deal', 'astro-armada', 'levski'],
  'drake-cutter-rampart':       ['new-deal', 'astro-armada'],
  'drake-dragonfly':            ['new-deal', 'levski', 'pyrochem'],
  'drake-dragonfly-yellowjacket': ['new-deal'],
  'drake-kraken':               [], // pas encore en jeu
  'drake-kraken-privateer':     [],
  'drake-mule':                 ['new-deal', 'levski'],

  // ---- MISC (Musashi Industrial & Starflight Concern) ----
  'misc-prospector':            ['cousin-crows', 'astro-armada', 'new-deal'],
  'misc-freelancer':            ['cousin-crows', 'astro-armada', 'new-deal'],
  'misc-freelancer-max':        ['cousin-crows', 'astro-armada'],
  'misc-freelancer-dur':        ['cousin-crows', 'astro-armada'],
  'misc-freelancer-mis':        ['cousin-crows'],
  'misc-starfarer':             ['cousin-crows'],
  'misc-starfarer-gemini':      ['cousin-crows'],
  'misc-mercury-star-runner':   ['cousin-crows', 'astro-armada'],
  'misc-hull-a':                ['cousin-crows', 'astro-armada'],
  'misc-hull-a-expanded':       ['cousin-crows'],
  'misc-hull-b':                ['cousin-crows'],
  'misc-hull-c':                ['cousin-crows'],
  'misc-hull-d':                ['cousin-crows'],
  'misc-hull-e':                [], // pas encore en jeu
  'misc-reliant-kore':          ['cousin-crows', 'new-deal'],
  'misc-reliant-mako':          ['cousin-crows'],
  'misc-reliant-sen':           ['cousin-crows'],
  'misc-reliant-tana':          ['cousin-crows', 'new-deal'],
  'misc-razor-ex':              ['cousin-crows'],
  'misc-razor-lx':              ['cousin-crows'],
  'misc-endeavor':              [], // pas encore en jeu
  'misc-fortune':               ['cousin-crows'],
  'misc-expanse-surveyor':      [],
  'misc-odyssey-explorer':      [],

  // ---- RSI (Roberts Space Industries) ----
  'rsi-aurora-mr':              ['new-deal', 'cousin-crows', 'astro-armada', 'levski'],
  'rsi-aurora-cl':              ['new-deal', 'cousin-crows', 'astro-armada'],
  'rsi-aurora-es':              ['new-deal', 'cousin-crows', 'astro-armada'],
  'rsi-aurora-ln':              ['new-deal', 'cousin-crows', 'astro-armada'],
  'rsi-aurora-lx':              ['cousin-crows'],
  'rsi-constellation-andromeda': ['cousin-crows', 'astro-armada'],
  'rsi-constellation-aquila':   ['cousin-crows', 'astro-armada'],
  'rsi-constellation-taurus':   ['cousin-crows', 'astro-armada'],
  'rsi-constellation-phoenix':  ['cousin-crows'],
  'rsi-constellation-phoenix-emerald': [],
  'rsi-mantis':                 ['new-deal', 'astro-armada'],
  'rsi-scorpius':               ['new-deal', 'astro-armada'],
  'rsi-scorpius-antares':       ['astro-armada'],
  'rsi-zeus-mk2-cl':            ['cousin-crows', 'astro-armada'],
  'rsi-polaris':                ['astro-armada'],
  'rsi-perseus':                [], // pas encore en jeu
  'rsi-perseus-capital':        [],
  'rsi-apollo-medivac':         ['new-deal', 'astro-armada'],
  'rsi-apollo-triage':          ['new-deal', 'astro-armada'],
  'rsi-galaxy':                 ['cousin-crows'],
  'rsi-bengal':                 [], // carrier UEE, pas en jeu
  'rsi-lynx':                   ['new-deal'],
  'rsi-orion-mining':           [],
  'rsi-orion-rsi':              [],
  'rsi-ursa':                   ['new-deal', 'cousin-crows'],
  'rsi-ursa-fortuna':           [],
  'rsi-ursa-medivac':           ['new-deal'],

  // ---- CRUSADER INDUSTRIES ----
  'crusader-hercules-c2':       ['crusader-showroom', 'astro-armada'],
  'crusader-hercules-m2':       ['crusader-showroom'],
  'crusader-hercules-a2':       ['crusader-showroom'],
  'crusader-ares-inferno':      ['crusader-showroom', 'astro-armada'],
  'crusader-ares-ion':          ['crusader-showroom', 'astro-armada'],
  'crusader-c1-spirit':         ['crusader-showroom', 'astro-armada'],
  'crusader-e1-spirit':         ['crusader-showroom', 'astro-armada'],
  'crusader-a1-spirit':         ['crusader-showroom', 'astro-armada'],
  'crusader-spirit-c1':         ['crusader-showroom', 'astro-armada'],
  'crusader-spirit-e1':         ['crusader-showroom', 'astro-armada'],
  'crusader-spirit-a1':         ['crusader-showroom', 'astro-armada'],
  'crusader-mercury-black-market': ['levski', 'pyrochem'],
  'crusader-genesis-emerald':   [],

  // ---- ORIGIN JUMPWORKS ----
  'origin-100i':                ['cousin-crows', 'astro-armada'],
  'origin-125a':                ['cousin-crows', 'astro-armada'],
  'origin-135c':                ['cousin-crows', 'astro-armada'],
  'origin-300i':                ['cousin-crows', 'astro-armada'],
  'origin-315p':                ['cousin-crows', 'astro-armada'],
  'origin-325a':                ['cousin-crows', 'astro-armada'],
  'origin-350r':                ['cousin-crows'],
  'origin-400i':                ['cousin-crows'],
  'origin-600i':                ['cousin-crows'],
  'origin-600i-executive':      [],
  'origin-600i-touring':        ['cousin-crows'],
  'origin-600i-exploration':    ['cousin-crows'],
  'origin-890-jump':            ['cousin-crows'],
  'origin-890-jump-executive':  [],
  'origin-m50':                 ['cousin-crows', 'astro-armada'],
  'origin-85x':                 ['cousin-crows'],
  'origin-x1':                  ['cousin-crows'],
  'origin-x1-force':            ['cousin-crows'],
  'origin-x1-velocity':         ['cousin-crows'],

  // ---- ARGO ASTRONAUTICS ----
  'argo-mole':                  ['cousin-crows', 'astro-armada'],
  'argo-mole-carbon':           ['cousin-crows'],
  'argo-raft':                  ['cousin-crows', 'astro-armada'],
  'argo-mpuv-cargo':            ['cousin-crows', 'new-deal'],
  'argo-mpuv-personnel':        ['cousin-crows', 'new-deal'],
  'argo-srv':                   ['cousin-crows'],
  'argo-intrepid':              ['cousin-crows'],

  // ---- CONSOLIDATED OUTLAND (CNOU) ----
  'cnou-mustang-alpha':         ['new-deal', 'astro-armada'],
  'cnou-mustang-beta':          ['new-deal'],
  'cnou-mustang-gamma':         ['new-deal'],
  'cnou-mustang-delta':         ['new-deal'],
  'cnou-mustang-omega':         [], // édition AMD exclusive
  'cnou-nomad':                 ['new-deal', 'cousin-crows'],
  'cnou-pioneer':               [], // pas encore en jeu

  // ---- TUMBRIL LAND SYSTEMS ----
  'tumbril-cyclone':            ['new-deal'],
  'tumbril-cyclone-aa':         ['new-deal'],
  'tumbril-cyclone-mt':         ['new-deal'],
  'tumbril-cyclone-rn':         ['new-deal'],
  'tumbril-cyclone-tr':         ['new-deal'],
  'tumbril-cyclone-rc':         ['new-deal'],
  'tumbril-storm':              ['new-deal'],
  'tumbril-storm-aa':           ['new-deal'],
  'tumbril-nova':               ['new-deal'],
  'tumbril-ranger':             ['new-deal'],
  'tumbril-ranger-rc':          ['new-deal'],
  'tumbril-ranger-tr':          ['new-deal'],

  // ---- GREYCAT INDUSTRIAL ----
  'greycat-roc':                ['new-deal', 'cousin-crows'],
  'greycat-roc-ds':             ['new-deal'],
  'greycat-ptv':                ['new-deal', 'levski'],
  'greycat-golem':              ['new-deal'],
  'greycat-stv':                ['new-deal'],

  // ---- ESPERIA ----
  'esperia-blade':              ['astro-armada'], // disponibilité limitée
  'esperia-prowler':            ['astro-armada'],
  'esperia-talon':              ['astro-armada'],
  'esperia-talon-shrike':       ['astro-armada'],
  'esperia-vanduul-glaive':     [], // très rare / pledge

  // ---- MIRAI ----
  'mirai-fury-mx':              ['cousin-crows', 'astro-armada'],
  'mirai-fury':                 ['cousin-crows', 'astro-armada'],
  'mirai-fury-lx':              [],
  'mirai-guardian':             ['cousin-crows', 'astro-armada'],
  'mirai-guardian-qi':          ['cousin-crows', 'astro-armada'],
  'mirai-guardian-es':          ['cousin-crows'],
  'mirai-pulse':                ['cousin-crows'],
  'mirai-pulse-lx':             ['cousin-crows'],

  // ---- BANU SOULI ----
  'banu-defender':              ['astro-armada', 'levski'],
  'banu-defender-solo':         [],
  'banu-merchantman-gold':      [], // pas encore en jeu

  // ---- GATAC MANUFACTURE ----
  'gatac-railen':               ['cousin-crows', 'astro-armada'],
  'gatac-syulen':               ['cousin-crows'],

  // ---- AOPOA (Xi'An) ----
  'aopoa-nox':                  ['cousin-crows', 'astro-armada'],
  'aopoa-nox-kue':              [],

  // ---- VANDUUL (capturés) ----
  'vanduul-scythe':             [], // extrêmement rare / pledge
  'vanduul-cleaver':            [],

  // ---- RSI (variations spéciales) ----
  'anvil-f7c-m-super-hornet':   ['new-deal', 'astro-armada'],

  // ---- MISC (EXPANSE) ----
};

/**
 * Retourne les infos des lieux d'achat pour un vaisseau donné
 * @param {string} shipId
 * @returns {{ dealer: object, notes?: string }[]}
 */
export function getBuyLocations(shipId) {
  const dealerIds = SHIP_BUY_LOCATIONS[shipId];
  if (!dealerIds || dealerIds.length === 0) return [];
  return dealerIds.map(id => DEALERS[id]).filter(Boolean);
}

/**
 * Retourne si un vaisseau est pledge-only (pas de lieu in-game)
 * @param {string} shipId
 * @returns {boolean}
 */
export function isPledgeOnly(shipId) {
  const dealerIds = SHIP_BUY_LOCATIONS[shipId];
  return dealerIds !== undefined && dealerIds.length === 0;
}
