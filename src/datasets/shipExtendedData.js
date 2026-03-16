/**
 * Données étendues des vaisseaux — Star Citizen Wiki Ultime
 * Dimensions, stats de vol, temps de réclamation, vaisseau loaner
 * Source: Star Citizen Wiki / Roberts Space Industries / Fleetyards
 */

// Format :
// {
//   pledgeCurrency: 'USD',
//   loanerShip: 'rsi-aurora-mr',   // id du vaisseau loaner (ou null)
//   dimensions: { length, width, height, mass },
//   flightStats: { rollRate, pitchRate, yawRate, vtolEnabled },
//   claimTime: 180,       // secondes
//   expediteTime: 45,     // secondes avec expédition
//   expediteCost: 22000,  // aUEC
// }

export const SHIP_EXTENDED = {

  // ── RSI Aurora MR ─────────────────────────────────────────────
  'rsi-aurora-mr': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 18.5, width: 14.0, height: 4.5, mass: 62400 },
    flightStats: { rollRate: 90, pitchRate: 62, yawRate: 50, vtolEnabled: false },
    claimTime: 180,
    expediteTime: 45,
    expediteCost: 22000,
  },

  // ── RSI Aurora LN ─────────────────────────────────────────────
  'rsi-aurora-ln': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 18.5, width: 14.0, height: 4.5, mass: 63100 },
    flightStats: { rollRate: 88, pitchRate: 60, yawRate: 48, vtolEnabled: false },
    claimTime: 180,
    expediteTime: 45,
    expediteCost: 22000,
  },

  // ── RSI Aurora CL ─────────────────────────────────────────────
  'rsi-aurora-cl': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 18.5, width: 14.0, height: 4.5, mass: 65800 },
    flightStats: { rollRate: 85, pitchRate: 58, yawRate: 46, vtolEnabled: false },
    claimTime: 180,
    expediteTime: 45,
    expediteCost: 22000,
  },

  // ── Aegis Avenger Titan ────────────────────────────────────────
  'aegis-avenger-titan': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-mr',
    dimensions: { length: 21.5, width: 21.0, height: 7.0, mass: 76200 },
    flightStats: { rollRate: 100, pitchRate: 70, yawRate: 58, vtolEnabled: false },
    claimTime: 210,
    expediteTime: 52,
    expediteCost: 28000,
  },

  // ── Aegis Avenger Stalker ──────────────────────────────────────
  'aegis-avenger-stalker': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-mr',
    dimensions: { length: 21.5, width: 21.0, height: 7.0, mass: 74800 },
    flightStats: { rollRate: 98, pitchRate: 68, yawRate: 56, vtolEnabled: false },
    claimTime: 210,
    expediteTime: 52,
    expediteCost: 28000,
  },

  // ── Aegis Gladius ─────────────────────────────────────────────
  'aegis-gladius': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-ln',
    dimensions: { length: 21.0, width: 21.5, height: 6.5, mass: 72400 },
    flightStats: { rollRate: 120, pitchRate: 85, yawRate: 72, vtolEnabled: false },
    claimTime: 195,
    expediteTime: 48,
    expediteCost: 25000,
  },

  // ── Drake Cutlass Black ────────────────────────────────────────
  'drake-cutlass-black': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 29.0, width: 26.5, height: 9.5, mass: 148000 },
    flightStats: { rollRate: 80, pitchRate: 55, yawRate: 45, vtolEnabled: false },
    claimTime: 270,
    expediteTime: 68,
    expediteCost: 38000,
  },

  // ── Drake Cutlass Red ──────────────────────────────────────────
  'drake-cutlass-red': {
    pledgeCurrency: 'USD',
    loanerShip: 'drake-cutlass-black',
    dimensions: { length: 29.0, width: 26.5, height: 9.5, mass: 151000 },
    flightStats: { rollRate: 78, pitchRate: 53, yawRate: 43, vtolEnabled: false },
    claimTime: 270,
    expediteTime: 68,
    expediteCost: 38000,
  },

  // ── Drake Cutlass Blue ─────────────────────────────────────────
  'drake-cutlass-blue': {
    pledgeCurrency: 'USD',
    loanerShip: 'drake-cutlass-black',
    dimensions: { length: 29.0, width: 26.5, height: 9.5, mass: 149500 },
    flightStats: { rollRate: 80, pitchRate: 54, yawRate: 44, vtolEnabled: false },
    claimTime: 270,
    expediteTime: 68,
    expediteCost: 38000,
  },

  // ── MISC Freelancer ────────────────────────────────────────────
  'misc-freelancer': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 37.0, width: 22.5, height: 10.0, mass: 178400 },
    flightStats: { rollRate: 75, pitchRate: 50, yawRate: 42, vtolEnabled: false },
    claimTime: 300,
    expediteTime: 75,
    expediteCost: 42000,
  },

  // ── RSI Constellation Andromeda ───────────────────────────────
  'rsi-constellation-andromeda': {
    pledgeCurrency: 'USD',
    loanerShip: 'misc-freelancer',
    dimensions: { length: 61.0, width: 26.5, height: 14.0, mass: 428600 },
    flightStats: { rollRate: 52, pitchRate: 38, yawRate: 32, vtolEnabled: false },
    claimTime: 480,
    expediteTime: 120,
    expediteCost: 72000,
  },

  // ── Anvil F7C Hornet ──────────────────────────────────────────
  'anvil-f7c-hornet': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-ln',
    dimensions: { length: 22.5, width: 19.0, height: 6.5, mass: 85200 },
    flightStats: { rollRate: 108, pitchRate: 76, yawRate: 62, vtolEnabled: false },
    claimTime: 225,
    expediteTime: 56,
    expediteCost: 32000,
  },

  // ── Anvil F7A Hornet Mk II ────────────────────────────────────
  'anvil-f7a-hornet-mk2': {
    pledgeCurrency: 'USD',
    loanerShip: 'anvil-f7c-hornet',
    dimensions: { length: 23.0, width: 19.5, height: 6.8, mass: 92400 },
    flightStats: { rollRate: 115, pitchRate: 82, yawRate: 68, vtolEnabled: false },
    claimTime: 240,
    expediteTime: 60,
    expediteCost: 36000,
  },

  // ── Anvil Arrow ────────────────────────────────────────────────
  'anvil-arrow': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-mr',
    dimensions: { length: 15.5, width: 11.0, height: 4.5, mass: 52800 },
    flightStats: { rollRate: 140, pitchRate: 100, yawRate: 85, vtolEnabled: false },
    claimTime: 180,
    expediteTime: 45,
    expediteCost: 22000,
  },

  // ── Aegis Hammerhead ──────────────────────────────────────────
  'aegis-hammerhead': {
    pledgeCurrency: 'USD',
    loanerShip: 'aegis-vanguard-warden',
    dimensions: { length: 124.0, width: 84.0, height: 28.5, mass: 2850000 },
    flightStats: { rollRate: 28, pitchRate: 20, yawRate: 18, vtolEnabled: false },
    claimTime: 900,
    expediteTime: 225,
    expediteCost: 180000,
  },

  // ── Anvil Carrack ─────────────────────────────────────────────
  'anvil-carrack': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-constellation-andromeda',
    dimensions: { length: 126.0, width: 76.0, height: 32.0, mass: 4200000 },
    flightStats: { rollRate: 22, pitchRate: 16, yawRate: 14, vtolEnabled: false },
    claimTime: 900,
    expediteTime: 225,
    expediteCost: 210000,
  },

  // ── Origin 300i ───────────────────────────────────────────────
  'origin-300i': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-mr',
    dimensions: { length: 21.5, width: 14.5, height: 6.0, mass: 74600 },
    flightStats: { rollRate: 110, pitchRate: 78, yawRate: 65, vtolEnabled: false },
    claimTime: 210,
    expediteTime: 52,
    expediteCost: 28000,
  },

  // ── Origin 315p ───────────────────────────────────────────────
  'origin-315p': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-mr',
    dimensions: { length: 21.5, width: 14.5, height: 6.0, mass: 76200 },
    flightStats: { rollRate: 106, pitchRate: 74, yawRate: 62, vtolEnabled: false },
    claimTime: 210,
    expediteTime: 52,
    expediteCost: 28000,
  },

  // ── Origin 325a ───────────────────────────────────────────────
  'origin-325a': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-ln',
    dimensions: { length: 21.5, width: 14.5, height: 6.0, mass: 77800 },
    flightStats: { rollRate: 108, pitchRate: 76, yawRate: 63, vtolEnabled: false },
    claimTime: 210,
    expediteTime: 52,
    expediteCost: 28000,
  },

  // ── MISC Prospector ───────────────────────────────────────────
  'misc-prospector': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 25.5, width: 21.5, height: 7.5, mass: 108400 },
    flightStats: { rollRate: 72, pitchRate: 48, yawRate: 40, vtolEnabled: false },
    claimTime: 270,
    expediteTime: 68,
    expediteCost: 38000,
  },

  // ── Argo MOLE ─────────────────────────────────────────────────
  'argo-mole': {
    pledgeCurrency: 'USD',
    loanerShip: 'misc-prospector',
    dimensions: { length: 53.5, width: 39.5, height: 14.5, mass: 486000 },
    flightStats: { rollRate: 42, pitchRate: 30, yawRate: 26, vtolEnabled: false },
    claimTime: 540,
    expediteTime: 135,
    expediteCost: 88000,
  },

  // ── Drake Vulture ─────────────────────────────────────────────
  'drake-vulture': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 26.5, width: 18.0, height: 7.5, mass: 96800 },
    flightStats: { rollRate: 78, pitchRate: 54, yawRate: 44, vtolEnabled: false },
    claimTime: 270,
    expediteTime: 68,
    expediteCost: 38000,
  },

  // ── Crusader C2 Hercules ──────────────────────────────────────
  'crusader-hercules-c2': {
    pledgeCurrency: 'USD',
    loanerShip: 'drake-caterpillar',
    dimensions: { length: 96.0, width: 78.0, height: 30.0, mass: 2240000 },
    flightStats: { rollRate: 30, pitchRate: 22, yawRate: 18, vtolEnabled: true },
    claimTime: 780,
    expediteTime: 195,
    expediteCost: 148000,
  },

  // ── MISC Mercury Star Runner ───────────────────────────────────
  'misc-mercury-star-runner': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 51.5, width: 33.5, height: 14.0, mass: 348000 },
    flightStats: { rollRate: 60, pitchRate: 44, yawRate: 36, vtolEnabled: false },
    claimTime: 420,
    expediteTime: 105,
    expediteCost: 64000,
  },

  // ── RSI Scorpius ──────────────────────────────────────────────
  'rsi-scorpius': {
    pledgeCurrency: 'USD',
    loanerShip: 'anvil-f7c-hornet',
    dimensions: { length: 31.5, width: 28.0, height: 9.0, mass: 184000 },
    flightStats: { rollRate: 88, pitchRate: 62, yawRate: 52, vtolEnabled: false },
    claimTime: 300,
    expediteTime: 75,
    expediteCost: 46000,
  },

  // ── RSI Zeus Mk II CL ─────────────────────────────────────────
  'rsi-zeus-mk2-cl': {
    pledgeCurrency: 'USD',
    loanerShip: 'misc-freelancer',
    dimensions: { length: 44.0, width: 30.5, height: 12.0, mass: 280000 },
    flightStats: { rollRate: 65, pitchRate: 46, yawRate: 38, vtolEnabled: false },
    claimTime: 360,
    expediteTime: 90,
    expediteCost: 52000,
  },

  // ── Anvil Terrapin ────────────────────────────────────────────
  'anvil-terrapin': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 29.0, width: 21.5, height: 9.0, mass: 136000 },
    flightStats: { rollRate: 68, pitchRate: 46, yawRate: 38, vtolEnabled: false },
    claimTime: 300,
    expediteTime: 75,
    expediteCost: 46000,
  },

  // ── Aegis Vanguard Warden ─────────────────────────────────────
  'aegis-vanguard-warden': {
    pledgeCurrency: 'USD',
    loanerShip: 'aegis-gladius',
    dimensions: { length: 38.0, width: 36.0, height: 10.5, mass: 256000 },
    flightStats: { rollRate: 70, pitchRate: 50, yawRate: 42, vtolEnabled: false },
    claimTime: 360,
    expediteTime: 90,
    expediteCost: 54000,
  },

  // ── Drake Buccaneer ───────────────────────────────────────────
  'drake-buccaneer': {
    pledgeCurrency: 'USD',
    loanerShip: 'rsi-aurora-mr',
    dimensions: { length: 18.0, width: 14.0, height: 5.5, mass: 58400 },
    flightStats: { rollRate: 125, pitchRate: 88, yawRate: 74, vtolEnabled: false },
    claimTime: 195,
    expediteTime: 48,
    expediteCost: 26000,
  },

  // ── Aegis Sabre ───────────────────────────────────────────────
  'aegis-sabre': {
    pledgeCurrency: 'USD',
    loanerShip: 'aegis-gladius',
    dimensions: { length: 24.5, width: 21.5, height: 6.5, mass: 98200 },
    flightStats: { rollRate: 115, pitchRate: 80, yawRate: 66, vtolEnabled: false },
    claimTime: 240,
    expediteTime: 60,
    expediteCost: 36000,
  },

  // ── Aegis Eclipse ─────────────────────────────────────────────
  'aegis-eclipse': {
    pledgeCurrency: 'USD',
    loanerShip: 'aegis-gladius',
    dimensions: { length: 26.0, width: 22.0, height: 7.0, mass: 118000 },
    flightStats: { rollRate: 95, pitchRate: 66, yawRate: 56, vtolEnabled: false },
    claimTime: 270,
    expediteTime: 68,
    expediteCost: 42000,
  },

  // ── Aegis Redeemer ────────────────────────────────────────────
  'aegis-redeemer': {
    pledgeCurrency: 'USD',
    loanerShip: 'anvil-valkyrie',
    dimensions: { length: 48.0, width: 42.5, height: 14.0, mass: 524000 },
    flightStats: { rollRate: 50, pitchRate: 36, yawRate: 30, vtolEnabled: false },
    claimTime: 480,
    expediteTime: 120,
    expediteCost: 76000,
  },

  // ── Anvil Valkyrie ────────────────────────────────────────────
  'anvil-valkyrie': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 48.0, width: 42.5, height: 14.0, mass: 498000 },
    flightStats: { rollRate: 46, pitchRate: 32, yawRate: 28, vtolEnabled: true },
    claimTime: 480,
    expediteTime: 120,
    expediteCost: 76000,
  },

  // ── Drake Caterpillar ─────────────────────────────────────────
  'drake-caterpillar': {
    pledgeCurrency: 'USD',
    loanerShip: 'misc-freelancer',
    dimensions: { length: 75.0, width: 56.0, height: 22.5, mass: 968000 },
    flightStats: { rollRate: 32, pitchRate: 24, yawRate: 20, vtolEnabled: false },
    claimTime: 660,
    expediteTime: 165,
    expediteCost: 108000,
  },

  // ── MISC Hull C ───────────────────────────────────────────────
  'misc-hull-c': {
    pledgeCurrency: 'USD',
    loanerShip: 'drake-caterpillar',
    dimensions: { length: 180.0, width: 42.0, height: 42.0, mass: 5800000 },
    flightStats: { rollRate: 18, pitchRate: 12, yawRate: 10, vtolEnabled: false },
    claimTime: 1200,
    expediteTime: 300,
    expediteCost: 280000,
  },

  // ── Origin 400i ───────────────────────────────────────────────
  'origin-400i': {
    pledgeCurrency: 'USD',
    loanerShip: 'misc-freelancer',
    dimensions: { length: 49.5, width: 32.5, height: 13.5, mass: 356000 },
    flightStats: { rollRate: 62, pitchRate: 44, yawRate: 36, vtolEnabled: false },
    claimTime: 420,
    expediteTime: 105,
    expediteCost: 64000,
  },

  // ── Mirai Fury MX ─────────────────────────────────────────────
  'mirai-fury-mx': {
    pledgeCurrency: 'USD',
    loanerShip: null,
    dimensions: { length: 11.5, width: 9.5, height: 3.0, mass: 28400 },
    flightStats: { rollRate: 155, pitchRate: 112, yawRate: 95, vtolEnabled: false },
    claimTime: 150,
    expediteTime: 38,
    expediteCost: 16000,
  },

  // ── Drake Ironclad ────────────────────────────────────────────
  'drake-ironclad': {
    pledgeCurrency: 'USD',
    loanerShip: 'drake-caterpillar',
    dimensions: { length: 144.0, width: 62.0, height: 28.0, mass: 3840000 },
    flightStats: { rollRate: 22, pitchRate: 16, yawRate: 14, vtolEnabled: false },
    claimTime: 960,
    expediteTime: 240,
    expediteCost: 196000,
  },
};

/**
 * Obtenir les données étendues d'un vaisseau par son ID
 * @param {string} shipId
 * @returns {object|null}
 */
export function getShipExtended(shipId) {
  return SHIP_EXTENDED[shipId] || null;
}
