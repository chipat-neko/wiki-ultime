/**
 * Loadout Builder — données supplémentaires
 * Builds méta, helpers de parsing des hardpoints, consommations de référence
 */

// ─────────────────────────────────────────────
// HELPERS — parsing des hardpoints ships.js
// ─────────────────────────────────────────────

/**
 * Analyse un tableau de hardpoints (ex: ['S3', 'S3', 'S1 x2'])
 * et retourne une liste de slots { id, size, label }
 */
export function parseWeaponSlots(hardpointsArray = []) {
  const slots = [];
  let idx = 0;
  for (const entry of hardpointsArray) {
    // Gère "S3 x2", "S3", "S5 x2", "Torpille S9 x3" …
    const multi = entry.match(/x(\d+)$/i);
    const sizeMatch = entry.match(/S(\d+)/i);
    if (!sizeMatch) continue;
    const size = parseInt(sizeMatch[1], 10);
    const count = multi ? parseInt(multi[1], 10) : 1;
    for (let i = 0; i < count; i++) {
      idx++;
      slots.push({ id: `w-${idx}`, size, label: `Arme ${idx} (S${size})` });
    }
  }
  return slots;
}

export function parseMissileSlots(missilesArray = []) {
  const slots = [];
  let idx = 0;
  for (const entry of missilesArray) {
    const multi = entry.match(/x(\d+)$/i);
    const sizeMatch = entry.match(/S(\d+)/i);
    if (!sizeMatch) continue;
    const size = parseInt(sizeMatch[1], 10);
    const count = multi ? parseInt(multi[1], 10) : 1;
    for (let i = 0; i < count; i++) {
      idx++;
      slots.push({ id: `m-${idx}`, size, label: `Rack ${idx} (S${size})` });
    }
  }
  return slots;
}

// ─────────────────────────────────────────────
// POWER CONSUMERS — consommation estimée par catégorie
// ─────────────────────────────────────────────
export const POWER_CONSUMERS = {
  shield:   { s1: 230, s2: 460, s3: 920,  s4: 1840 },
  cooler:   { s1: 90,  s2: 180, s3: 360,  s4: 720  },
  qtDrive:  { s1: 220, s2: 440, s3: 880,  s4: 1760 },
  weapon:   { s1: 15,  s2: 30,  s3: 62,   s4: 118,  s5: 224 },
};

// ─────────────────────────────────────────────
// TAILLE DE COMPOSANT PAR RÔLE VAISSEAU
// Estimation de la taille des composants selon le rôle
// ─────────────────────────────────────────────
export const SHIP_COMPONENT_SIZES = {
  // Format: { ppSize, shieldSize, coolerSize, qtSize }
  'Chasseur':         { ppSize: 1, shieldSize: 1, coolerSize: 1, qtSize: 1 },
  'Chasseur Léger':   { ppSize: 1, shieldSize: 1, coolerSize: 1, qtSize: 1 },
  'Chasseur Lourd':   { ppSize: 2, shieldSize: 2, coolerSize: 2, qtSize: 2 },
  'Multi-Rôle':       { ppSize: 1, shieldSize: 1, coolerSize: 1, qtSize: 1 },
  'Cargo':            { ppSize: 2, shieldSize: 2, coolerSize: 2, qtSize: 2 },
  'Cargo Lourd':      { ppSize: 3, shieldSize: 3, coolerSize: 3, qtSize: 3 },
  'Explorateur':      { ppSize: 2, shieldSize: 2, coolerSize: 2, qtSize: 2 },
  'Bombardier':       { ppSize: 2, shieldSize: 2, coolerSize: 2, qtSize: 2 },
  'Frégate':          { ppSize: 3, shieldSize: 4, coolerSize: 3, qtSize: 3 },
  'Transport':        { ppSize: 2, shieldSize: 2, coolerSize: 2, qtSize: 2 },
  'Récupération':     { ppSize: 2, shieldSize: 2, coolerSize: 2, qtSize: 2 },
  'Minage':           { ppSize: 2, shieldSize: 1, coolerSize: 1, qtSize: 2 },
  'default':          { ppSize: 1, shieldSize: 1, coolerSize: 1, qtSize: 1 },
};

export function getComponentSizes(ship) {
  return SHIP_COMPONENT_SIZES[ship?.role] || SHIP_COMPONENT_SIZES['default'];
}

// ─────────────────────────────────────────────
// BUILDS MÉTA — configs prédéfinies
// ─────────────────────────────────────────────
export const LOADOUT_CONFIGS = [
  {
    id: 'meta-max-dps',
    name: 'Max DPS',
    description: 'Armement full énergie haute cadence — DPS brut maximal. Fragile mais dévastateur.',
    icon: 'Flame',
    color: 'badge-red',
    shipId: 'anvil-f7a-hornet-mk2',
    weapons: {
      'w-1': 'kw-cf557',   // CF-557 S3 Repeater
      'w-2': 'kw-cf557',
      'w-3': 'kw-cf337',   // CF-337 S2 Repeater
      'w-4': 'kw-cf337',
      'w-5': 'kw-cf227',   // CF-227 S1 Repeater
      'w-6': 'kw-cf227',
    },
    systems: {
      pp:      'regulus-s2',
      shield:  'shimmer-s2',
      cooler1: 'wc-ueen-s2',
      cooler2: 'bracer-cool-s2',
      qt:      'rush-s2',
    },
    missiles: {
      'm-1': 'marksman-s2',
      'm-2': 'marksman-s2',
      'm-3': 'marksman-s2',
      'm-4': 'marksman-s2',
      'm-5': 'marksman-s2',
      'm-6': 'marksman-s2',
      'm-7': 'marksman-s2',
      'm-8': 'marksman-s2',
    },
    tags: ['DPS', 'Agressif', 'Combat PvP'],
  },
  {
    id: 'meta-balanced',
    name: 'Balanced',
    description: 'Mélange canons laser et répéteurs — excellente polyvalence en PvP et PvE.',
    icon: 'Crosshair',
    color: 'badge-cyan',
    shipId: 'aegis-gladius',
    weapons: {
      'w-1': 'behring-m8a',  // M8A S3 Cannon
      'w-2': 'behring-m8a',
      'w-3': 'kw-cf557',     // S3 Repeater
    },
    systems: {
      pp:      'regulus-s1',
      shield:  'shimmer-s1',
      cooler1: 'wc-ueen-s1',
      cooler2: 'bracer-cool-s1',
      qt:      'rush-s1',
    },
    missiles: {
      'm-1': 'marksman-s2',
      'm-2': 'marksman-s2',
      'm-3': 'marksman-s2',
      'm-4': 'marksman-s2',
    },
    tags: ['Polyvalent', 'PvP', 'Recommandé'],
  },
  {
    id: 'meta-stealth',
    name: 'Stealth',
    description: 'Balistique faible powerDraw + composants signature EM réduite — détection minimale.',
    icon: 'EyeOff',
    color: 'badge-purple',
    shipId: 'anvil-f7c-hornet',
    weapons: {
      'w-1': 'apocalypse-destroyer-s3',  // Ballistic S3
      'w-2': 'apocalypse-destroyer-s3',
      'w-3': 'apocalypse-immolator',     // Ballistic S2
      'w-4': 'apocalypse-immolator',
      'w-5': 'apocalypse-scorch',        // Ballistic S1
    },
    systems: {
      pp:      'allstop-s1',
      shield:  'fr76-s2',
      cooler1: 'coldflow-s1',
      cooler2: 'coldflow-s1',
      qt:      'goliath-s1',
    },
    missiles: {
      'm-1': 'pioneer-s1',
      'm-2': 'pioneer-s1',
      'm-3': 'pioneer-s1',
      'm-4': 'pioneer-s1',
    },
    tags: ['Furtif', 'Balistique', 'PvP Surprise'],
  },
  {
    id: 'meta-trader',
    name: 'Trader',
    description: 'Priorité survie et autonomie — boucliers solides, QT longue portée. Pour les marchands armés.',
    icon: 'Package',
    color: 'badge-gold',
    shipId: 'misc-freelancer',
    weapons: {
      'w-1': 'behring-m7a',  // S3 cannon
      'w-2': 'behring-m7a',
      'w-3': 'behring-m5a',  // S2 cannon
      'w-4': 'behring-m5a',
    },
    systems: {
      pp:      'regulus-s2',
      shield:  'mirage-s2',
      cooler1: 'bracer-cool-s2',
      cooler2: 'bracer-cool-s2',
      qt:      'voyage-s2',
    },
    missiles: {
      'm-1': 'marksman-s2',
      'm-2': 'marksman-s2',
      'm-3': 'marksman-s2',
      'm-4': 'marksman-s2',
    },
    tags: ['Survivabilité', 'Commerce', 'PvE'],
  },
  {
    id: 'meta-explorer',
    name: 'Explorateur',
    description: 'QT ultra longue portée, refroidisseurs discrets, armement défensif léger.',
    icon: 'Compass',
    color: 'badge-blue',
    shipId: 'anvil-carrack',
    weapons: {
      'w-1': 'behring-m7c',  // S4 cannon (turrets)
      'w-2': 'behring-m7c',
    },
    systems: {
      pp:      'guardian-s3',
      shield:  'fr76-s3',
      cooler1: 'coldflow-s3',
      cooler2: 'coldflow-s3',
      qt:      'goliath-s3',
    },
    missiles: {},
    tags: ['Exploration', 'Discrétion', 'Longue portée'],
  },
  {
    id: 'meta-pirate',
    name: 'Pirate',
    description: 'Distorsion + ballistics pour désactiver puis capturer — build pirate complet.',
    icon: 'Skull',
    color: 'badge-red',
    shipId: 'aegis-vanguard-warden',
    weapons: {
      'w-1': 'preacher-disarray-s3',   // Distortion S3
      'w-2': 'preacher-disarray-s3',
      'w-3': 'apocalypse-destroyer-s3', // Ballistic S3
      'w-4': 'apocalypse-destroyer-s3',
    },
    systems: {
      pp:      'regulus-s2',
      shield:  'srom-s2',
      cooler1: 'wc-ueen-s2',
      cooler2: 'bracer-cool-s2',
      qt:      'rush-s2',
    },
    missiles: {
      'm-1': 'spark-s2',
      'm-2': 'spark-s2',
      'm-3': 'spark-s2',
      'm-4': 'spark-s2',
    },
    tags: ['Piraterie', 'Distorsion', 'Capture'],
  },
];

// ─────────────────────────────────────────────
// CALCULS DPS
// ─────────────────────────────────────────────

/**
 * Calcule le DPS total et soutenu depuis un objet { slotId → weapon }
 */
export function calcTotalDPS(weaponsMap) {
  let total = 0;
  for (const weapon of Object.values(weaponsMap)) {
    if (!weapon) continue;
    // dps est déjà calculé dans shipweapons.js (alpha × rpm/60)
    total += weapon.stats?.dps ?? 0;
  }
  return {
    totalDPS: Math.round(total),
    sustainedDPS: Math.round(total * 0.6),
  };
}

/**
 * Calcule la consommation d'énergie totale (armes + systèmes)
 */
export function calcEnergyBudget({ weaponsMap = {}, pp = null, shield = null, cooler1 = null, cooler2 = null, qt = null }) {
  let draw = 0;
  for (const w of Object.values(weaponsMap)) {
    if (w) draw += w.stats?.powerDraw ?? 0;
  }
  if (shield)  draw += shield.stats?.powerDraw ?? 0;
  if (cooler1) draw += cooler1.stats?.powerDraw ?? 0;
  if (cooler2) draw += cooler2.stats?.powerDraw ?? 0;
  if (qt)      draw += qt.stats?.powerDraw ?? 0;

  const output = pp?.stats?.powerOutput ?? 0;
  const balance = output - draw;
  const pct = output > 0 ? Math.min((draw / output) * 100, 100) : 100;

  return {
    powerDraw: Math.round(draw),
    powerOutput: Math.round(output),
    balance: Math.round(balance),
    pct: Math.round(pct),
    status: balance >= 0 ? 'ok' : 'deficit',
  };
}

/**
 * Calcule la signature EM totale (pp + shield + coolers + qt)
 */
export function calcEMSignature({ pp, shield, cooler1, cooler2, qt }) {
  let em = 0;
  if (pp)      em += pp.stats?.emSignature ?? 0;
  if (shield)  em += shield.stats?.emSignature ?? 0;
  if (cooler1) em += cooler1.stats?.irSignature ?? 0;
  if (cooler2) em += cooler2.stats?.irSignature ?? 0;
  if (qt)      em += qt.stats?.emSignature ?? 0;
  return Math.round(em);
}

/**
 * Temps de regen bouclier (secondes pour regen complet depuis 0)
 */
export function calcShieldRegenTime(shield) {
  if (!shield) return null;
  const { shieldHp, regenRate } = shield.stats ?? {};
  if (!shieldHp || !regenRate) return null;
  return Math.round(shieldHp / regenRate);
}
