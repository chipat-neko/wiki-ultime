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
// BUDGET TIERS
// ─────────────────────────────────────────────
export const BUDGET_TIERS = [
  { id: 'starter',   label: 'Starter',    max: 100_000,       color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-500/40', badge: 'badge-green' },
  { id: 'midrange',  label: 'Mid-Range',  max: 500_000,       color: 'text-blue-400',   bg: 'bg-blue-900/30',   border: 'border-blue-500/40',  badge: 'badge-blue' },
  { id: 'highend',   label: 'High-End',   max: 2_000_000,     color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500/40', badge: 'badge-purple' },
  { id: 'endgame',   label: 'Endgame',    max: Infinity,      color: 'text-amber-400',  bg: 'bg-amber-900/30',  border: 'border-amber-500/40', badge: 'badge-gold' },
];

/** Retourne le tier de budget correspondant à un prix */
export function getBudgetTier(price) {
  if (!price || price <= 0) return BUDGET_TIERS[0];
  return BUDGET_TIERS.find(t => price <= t.max) || BUDGET_TIERS[BUDGET_TIERS.length - 1];
}

/** Formate un prix aUEC en texte lisible */
export function formatBudgetPrice(price) {
  if (!price || price <= 0) return 'N/A';
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}K`;
  return String(price);
}

// ─────────────────────────────────────────────
// BUILDS MÉTA — configs prédéfinies
// ─────────────────────────────────────────────
export const LOADOUT_CONFIGS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // AURORA MR — Débutant (S2 x2, Missiles S1 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'aurora-lowcost', name: 'Aurora — Économique', description: 'Config budget pour débuter. Composants D-grade, armes de base.',
    icon: 'Flame', color: 'badge-green', shipId: 'rsi-aurora-mr',
    weapons: { 'w-1': 'kw-cf117', 'w-2': 'kw-cf117' },
    systems: { pp: 'bracer-pp-s1', shield: 'echo-s1', cooler1: 'arctic-s1', cooler2: null, qt: 'crossfield-s1' },
    missiles: { 'm-1': 'rattler-s1', 'm-2': 'rattler-s1', 'm-3': 'rattler-s1', 'm-4': 'rattler-s1' },
    tags: ['Débutant', 'Budget', 'PvE'], estimatedPrice: 28_000,
  },
  {
    id: 'aurora-mid', name: 'Aurora — Intermédiaire', description: 'Upgrade B-grade, répéteurs énergie améliorés.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'rsi-aurora-mr',
    weapons: { 'w-1': 'kw-cf337', 'w-2': 'kw-cf337' },
    systems: { pp: 'ink-s1', shield: 'mirage-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: { 'm-1': 'rattler-s1', 'm-2': 'rattler-s1', 'm-3': 'rattler-s1', 'm-4': 'rattler-s1' },
    tags: ['Polyvalent', 'PvE'], estimatedPrice: 62_000,
  },
  {
    id: 'aurora-max', name: 'Aurora — Illimité', description: 'Full A-grade, neutrons S2 pour DPS max. L\'Aurora qui mord.',
    icon: 'Flame', color: 'badge-gold', shipId: 'rsi-aurora-mr',
    weapons: { 'w-1': 'maxox-nn23', 'w-2': 'maxox-nn23' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'tempest-s1', 'm-2': 'tempest-s1', 'm-3': 'tempest-s1', 'm-4': 'tempest-s1' },
    tags: ['DPS Max', 'A-Grade', 'Surprise'], estimatedPrice: 95_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSTANG ALPHA — Débutant (S2 x2, Missiles S1 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mustang-lowcost', name: 'Mustang — Économique', description: 'Budget minimum pour le Mustang. Armes balistiques pas chères.',
    icon: 'Flame', color: 'badge-green', shipId: 'cnou-mustang-alpha',
    weapons: { 'w-1': 'apocalypse-scorch', 'w-2': 'apocalypse-scorch' },
    systems: { pp: 'bracer-pp-s1', shield: 'echo-s1', cooler1: 'arctic-s1', cooler2: null, qt: 'crossfield-s1' },
    missiles: { 'm-1': 'rattler-s1', 'm-2': 'rattler-s1', 'm-3': 'rattler-s1', 'm-4': 'rattler-s1' },
    tags: ['Débutant', 'Balistique', 'Budget'], estimatedPrice: 22_000,
  },
  {
    id: 'mustang-mid', name: 'Mustang — Intermédiaire', description: 'Répéteurs énergie + bouclier B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'cnou-mustang-alpha',
    weapons: { 'w-1': 'kw-cf337', 'w-2': 'kw-cf337' },
    systems: { pp: 'ink-s1', shield: 'mirage-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: { 'm-1': 'pioneer-s1', 'm-2': 'pioneer-s1', 'm-3': 'pioneer-s1', 'm-4': 'pioneer-s1' },
    tags: ['Polyvalent', 'Énergie'], estimatedPrice: 58_000,
  },
  {
    id: 'mustang-max', name: 'Mustang — Illimité', description: 'Neutrons S2 + full A-grade. Le Mustang ultime.',
    icon: 'Flame', color: 'badge-gold', shipId: 'cnou-mustang-alpha',
    weapons: { 'w-1': 'maxox-nn23', 'w-2': 'maxox-nn23' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'tempest-s1', 'm-2': 'tempest-s1', 'm-3': 'tempest-s1', 'm-4': 'tempest-s1' },
    tags: ['DPS Max', 'A-Grade'], estimatedPrice: 92_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GLADIUS — Chasseur (S3 x3, Missiles S2 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gladius-lowcost', name: 'Gladius — Économique', description: 'Répéteurs de base et composants C/D-grade. Fonctionnel pour du PvE.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'aegis-gladius',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557', 'w-3': 'kw-cf557' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: 'arctic-s1', qt: 'goliath-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Chasseur', 'Budget', 'PvE'], estimatedPrice: 95_000,
  },
  {
    id: 'gladius-mid', name: 'Gladius — Intermédiaire', description: 'Mix canons + répéteurs B-grade. Solide en PvP.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'aegis-gladius',
    weapons: { 'w-1': 'behring-m7a', 'w-2': 'behring-m7a', 'w-3': 'kw-cf557' },
    systems: { pp: 'ink-s1', shield: 'mirage-s1', cooler1: 'bracer-cool-s1', cooler2: 'bracer-cool-s1', qt: 'voyage-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'crossfire-s2', 'm-4': 'crossfire-s2' },
    tags: ['Polyvalent', 'PvP', 'Recommandé'], estimatedPrice: 155_000,
  },
  {
    id: 'gladius-max', name: 'Gladius — Illimité', description: 'Full A-grade, neutrons S3 — DPS absolu sur un châssis agile.',
    icon: 'Flame', color: 'badge-gold', shipId: 'aegis-gladius',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33', 'w-3': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: 'wc-ueen-s1', qt: 'rush-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['DPS Max', 'A-Grade', 'PvP Meta'], estimatedPrice: 185_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AVENGER TITAN — Multi-Rôle (S3 x2, S1 x2, Missiles S2 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'titan-lowcost', name: 'Avenger Titan — Économique', description: 'Config cargo/combat basique. Armes de stock améliorées.',
    icon: 'Package', color: 'badge-green', shipId: 'aegis-avenger-titan',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557', 'w-3': 'kw-cf117', 'w-4': 'kw-cf117' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: 'arctic-s1', qt: 'goliath-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Multi-Rôle', 'Cargo', 'Budget'], estimatedPrice: 85_000,
  },
  {
    id: 'titan-mid', name: 'Avenger Titan — Intermédiaire', description: 'Canons laser S3 + bouclier B-grade. Bon équilibre combat/cargo.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'aegis-avenger-titan',
    weapons: { 'w-1': 'behring-m7a', 'w-2': 'behring-m7a', 'w-3': 'kw-cf227', 'w-4': 'kw-cf227' },
    systems: { pp: 'ink-s1', shield: 'srom-s1', cooler1: 'bracer-cool-s1', cooler2: 'bracer-cool-s1', qt: 'voyage-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'crossfire-s2', 'm-4': 'crossfire-s2' },
    tags: ['Polyvalent', 'PvE/PvP'], estimatedPrice: 148_000,
  },
  {
    id: 'titan-max', name: 'Avenger Titan — Illimité', description: 'Neutrons + full A-grade. Le Titan devenu machine de guerre.',
    icon: 'Flame', color: 'badge-gold', shipId: 'aegis-avenger-titan',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33', 'w-3': 'maxox-nn13', 'w-4': 'maxox-nn13' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: 'wc-ueen-s1', qt: 'rush-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['DPS Max', 'A-Grade'], estimatedPrice: 190_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // F7C HORNET — Chasseur (S4, S3 x2, S2 x2, Missiles S3 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'hornet-lowcost', name: 'F7C Hornet — Économique', description: 'Le Hornet en budget. Répéteurs énergie basiques.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'anvil-f7c-hornet',
    weapons: { 'w-1': 'kw-cf667', 'w-2': 'kw-cf557', 'w-3': 'kw-cf557', 'w-4': 'kw-cf337', 'w-5': 'kw-cf337' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: 'coldflow-s1', qt: 'goliath-s1' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Chasseur', 'Budget'], estimatedPrice: 98_000,
  },
  {
    id: 'hornet-mid', name: 'F7C Hornet — Intermédiaire', description: 'Mix canons/répéteurs B-grade. Puissance de feu sérieuse.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'anvil-f7c-hornet',
    weapons: { 'w-1': 'behring-m7c', 'w-2': 'behring-m7a', 'w-3': 'behring-m7a', 'w-4': 'kw-cf337', 'w-5': 'kw-cf337' },
    systems: { pp: 'ink-s1', shield: 'srom-s1', cooler1: 'bracer-cool-s1', cooler2: 'bracer-cool-s1', qt: 'voyage-s1' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'dominator-s3', 'm-4': 'dominator-s3' },
    tags: ['Combat', 'PvP'], estimatedPrice: 175_000,
  },
  {
    id: 'hornet-max', name: 'F7C Hornet — Illimité', description: 'Full neutrons + A-grade. Puissance de feu dévastatrice.',
    icon: 'Flame', color: 'badge-gold', shipId: 'anvil-f7c-hornet',
    weapons: { 'w-1': 'maxox-nn43', 'w-2': 'maxox-nn33', 'w-3': 'maxox-nn33', 'w-4': 'maxox-nn23', 'w-5': 'maxox-nn23' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: 'wc-ueen-s1', qt: 'rush-s1' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade', 'Meta'], estimatedPrice: 210_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // F7A HORNET MK II — Chasseur (S4 x2, S3 x2, S2 x2, Missiles S3 x8) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'hornet-mk2-lowcost', name: 'F7A Mk II — Économique', description: 'Le Mk II en budget. Répéteurs énergie sur tous les slots.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'anvil-f7a-hornet-mk2',
    weapons: { 'w-1': 'kw-cf667', 'w-2': 'kw-cf667', 'w-3': 'kw-cf557', 'w-4': 'kw-cf557', 'w-5': 'kw-cf337', 'w-6': 'kw-cf337' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['Chasseur', 'Budget', 'Polyvalent'], estimatedPrice: 185_000,
  },
  {
    id: 'hornet-mk2-mid', name: 'F7A Mk II — Intermédiaire', description: 'Canons laser S4 + répéteurs S3. B-grade partout.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'anvil-f7a-hornet-mk2',
    weapons: { 'w-1': 'behring-m7c', 'w-2': 'behring-m7c', 'w-3': 'kw-cf787', 'w-4': 'kw-cf787', 'w-5': 'kw-cf447', 'w-6': 'kw-cf447' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: 'bracer-cool-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'dominator-s3', 'm-6': 'dominator-s3', 'm-7': 'dominator-s3', 'm-8': 'dominator-s3' },
    tags: ['Combat PvP', 'Recommandé'], estimatedPrice: 320_000,
  },
  {
    id: 'hornet-mk2-max', name: 'F7A Mk II — Illimité', description: 'Full neutrons + A-grade. Machine de guerre ultime.',
    icon: 'Flame', color: 'badge-gold', shipId: 'anvil-f7a-hornet-mk2',
    weapons: { 'w-1': 'maxox-nn43', 'w-2': 'maxox-nn43', 'w-3': 'maxox-nn33', 'w-4': 'maxox-nn33', 'w-5': 'maxox-nn23', 'w-6': 'maxox-nn23' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade', 'PvP Meta'], estimatedPrice: 480_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 300i — Multi-Rôle (S3 x2, Missiles S2 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: '300i-lowcost', name: '300i — Économique', description: 'Config économique pour le touring ship d\'Origin.',
    icon: 'Compass', color: 'badge-green', shipId: 'origin-300i',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: null, qt: 'goliath-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Multi-Rôle', 'Budget'], estimatedPrice: 72_000,
  },
  {
    id: '300i-mid', name: '300i — Intermédiaire', description: 'Canons laser S3 + composants B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'origin-300i',
    weapons: { 'w-1': 'behring-m7a', 'w-2': 'behring-m7a' },
    systems: { pp: 'ink-s1', shield: 'srom-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: { 'm-1': 'crossfire-s2', 'm-2': 'crossfire-s2', 'm-3': 'crossfire-s2', 'm-4': 'crossfire-s2' },
    tags: ['Polyvalent', 'Touring'], estimatedPrice: 120_000,
  },
  {
    id: '300i-max', name: '300i — Illimité', description: 'Neutrons S3 + full A-grade. Le luxe ET la puissance.',
    icon: 'Flame', color: 'badge-gold', shipId: 'origin-300i',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['DPS Max', 'Luxe'], estimatedPrice: 155_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOMAD — Multi-Rôle (S3 x2, Missiles S2 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'nomad-lowcost', name: 'Nomad — Économique', description: 'Le Nomad en budget. Armes balistiques pas chères.',
    icon: 'Package', color: 'badge-green', shipId: 'cnou-nomad',
    weapons: { 'w-1': 'apocalypse-destroyer-s3', 'w-2': 'apocalypse-destroyer-s3' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: null, qt: 'crossfield-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Cargo', 'Budget'], estimatedPrice: 68_000,
  },
  {
    id: 'nomad-mid', name: 'Nomad — Intermédiaire', description: 'Répéteurs énergie S3 + bouclier B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'cnou-nomad',
    weapons: { 'w-1': 'kw-cf787', 'w-2': 'kw-cf787' },
    systems: { pp: 'ink-s1', shield: 'mirage-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: { 'm-1': 'crossfire-s2', 'm-2': 'crossfire-s2', 'm-3': 'crossfire-s2', 'm-4': 'crossfire-s2' },
    tags: ['Polyvalent', 'Cargo'], estimatedPrice: 108_000,
  },
  {
    id: 'nomad-max', name: 'Nomad — Illimité', description: 'Neutrons S3 + full A-grade. Le Nomad offensif.',
    icon: 'Flame', color: 'badge-gold', shipId: 'cnou-nomad',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['DPS Max', 'A-Grade'], estimatedPrice: 152_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BLADE — Chasseur Alien (S3 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'blade-lowcost', name: 'Blade — Économique', description: '4x répéteurs S3 budget. Puissance brute à moindre coût.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'esperia-blade',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557', 'w-3': 'kw-cf557', 'w-4': 'kw-cf557' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: 'coldflow-s1', qt: 'goliath-s1' },
    missiles: {},
    tags: ['Chasseur', 'Budget', 'Alien'], estimatedPrice: 92_000,
  },
  {
    id: 'blade-mid', name: 'Blade — Intermédiaire', description: '2x canons + 2x répéteurs S3. Composants B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'esperia-blade',
    weapons: { 'w-1': 'behring-m8a', 'w-2': 'behring-m8a', 'w-3': 'kw-cf787', 'w-4': 'kw-cf787' },
    systems: { pp: 'ink-s1', shield: 'srom-s1', cooler1: 'bracer-cool-s1', cooler2: 'bracer-cool-s1', qt: 'voyage-s1' },
    missiles: {},
    tags: ['Combat', 'PvP'], estimatedPrice: 165_000,
  },
  {
    id: 'blade-max', name: 'Blade — Illimité', description: '4x Neutrons S3 + full A-grade. Le meilleur DPS sans missiles.',
    icon: 'Flame', color: 'badge-gold', shipId: 'esperia-blade',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33', 'w-3': 'maxox-nn33', 'w-4': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: 'wc-ueen-s1', qt: 'rush-s1' },
    missiles: {},
    tags: ['DPS Max', 'A-Grade', 'No Missile'], estimatedPrice: 205_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CUTLASS BLACK — Multi-Rôle (S3 x2, Missiles S3 x8, Turrets S3 x2) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cutlass-lowcost', name: 'Cutlass Black — Économique', description: 'Le Cutlass pirate en budget. Balistique pas cher + missiles.',
    icon: 'Skull', color: 'badge-green', shipId: 'drake-cutlass-black',
    weapons: { 'w-1': 'apocalypse-destroyer-s3', 'w-2': 'apocalypse-destroyer-s3' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['Multi-Rôle', 'Budget', 'Pirate'], estimatedPrice: 145_000,
  },
  {
    id: 'cutlass-mid', name: 'Cutlass Black — Intermédiaire', description: 'Répéteurs énergie S3 + composants B-grade. Le Cutlass classique.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'drake-cutlass-black',
    weapons: { 'w-1': 'kw-cf787', 'w-2': 'kw-cf787' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: 'bracer-cool-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'dominator-s3', 'm-6': 'dominator-s3', 'm-7': 'dominator-s3', 'm-8': 'dominator-s3' },
    tags: ['Polyvalent', 'PvP/PvE'], estimatedPrice: 260_000,
  },
  {
    id: 'cutlass-max', name: 'Cutlass Black — Illimité', description: 'Neutrons S3 + full A-grade. Le Black devenu féroce.',
    icon: 'Flame', color: 'badge-gold', shipId: 'drake-cutlass-black',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade'], estimatedPrice: 385_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FREELANCER — Multi-Rôle (S4 x2, Missiles S3 x4, Turrets S2 x2) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'freelancer-lowcost', name: 'Freelancer — Économique', description: 'Config marchande : défense budget pour protéger le cargo.',
    icon: 'Package', color: 'badge-green', shipId: 'misc-freelancer',
    weapons: { 'w-1': 'kw-cf667', 'w-2': 'kw-cf667' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Commerce', 'Budget', 'Défensif'], estimatedPrice: 165_000,
  },
  {
    id: 'freelancer-mid', name: 'Freelancer — Intermédiaire', description: 'Canons S4 + QT longue portée. Le marchand bien équipé.',
    icon: 'Package', color: 'badge-blue', shipId: 'misc-freelancer',
    weapons: { 'w-1': 'behring-m7c', 'w-2': 'behring-m7c' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: 'bracer-cool-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'dominator-s3', 'm-4': 'dominator-s3' },
    tags: ['Commerce', 'Survivabilité', 'PvE'], estimatedPrice: 310_000,
  },
  {
    id: 'freelancer-max', name: 'Freelancer — Illimité', description: 'Neutrons S4 + full A-grade. Le marchand qui riposte violemment.',
    icon: 'Flame', color: 'badge-gold', shipId: 'misc-freelancer',
    weapons: { 'w-1': 'maxox-nn43', 'w-2': 'maxox-nn43' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade', 'Commerce'], estimatedPrice: 420_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VANGUARD WARDEN — Chasseur Lourd (S5 x2, S3 x2, Missiles S3 x4) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'vanguard-lowcost', name: 'Vanguard Warden — Économique', description: 'Chasseur lourd en budget. Répéteurs énergie sur tous les slots.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'aegis-vanguard-warden',
    weapons: { 'w-1': 'kw-cfe55', 'w-2': 'kw-cfe55', 'w-3': 'kw-cf557', 'w-4': 'kw-cf557' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Chasseur Lourd', 'Budget'], estimatedPrice: 365_000,
  },
  {
    id: 'vanguard-mid', name: 'Vanguard Warden — Intermédiaire', description: 'Canons laser S5 + distorsion S3. Config pirate ou bounty.',
    icon: 'Skull', color: 'badge-blue', shipId: 'aegis-vanguard-warden',
    weapons: { 'w-1': 'behring-m9a-s5', 'w-2': 'behring-m9a-s5', 'w-3': 'preacher-disarray-s3', 'w-4': 'preacher-disarray-s3' },
    systems: { pp: 'powerbell-s2', shield: 'srom-s2', cooler1: 'bracer-cool-s2', cooler2: 'bracer-cool-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'nn13-s3', 'm-2': 'nn13-s3', 'm-3': 'nn13-s3', 'm-4': 'nn13-s3' },
    tags: ['Piraterie', 'Distorsion', 'Bounty'], estimatedPrice: 480_000,
  },
  {
    id: 'vanguard-max', name: 'Vanguard Warden — Illimité', description: 'Neutrons S5 + full A-grade. Un tank volant avec un DPS massif.',
    icon: 'Flame', color: 'badge-gold', shipId: 'aegis-vanguard-warden',
    weapons: { 'w-1': 'maxox-nn53', 'w-2': 'maxox-nn53', 'w-3': 'maxox-nn33', 'w-4': 'maxox-nn33' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade', 'Tank'], estimatedPrice: 680_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCORPIUS — Chasseur Lourd Biplace (S4 x2, S3 x2, Missiles S3 x8) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'scorpius-lowcost', name: 'Scorpius — Économique', description: 'Budget biplace. Répéteurs énergie sur tous les slots.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'rsi-scorpius',
    weapons: { 'w-1': 'kw-cf667', 'w-2': 'kw-cf667', 'w-3': 'kw-cf557', 'w-4': 'kw-cf557' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['Chasseur Lourd', 'Budget', 'Biplace'], estimatedPrice: 210_000,
  },
  {
    id: 'scorpius-mid', name: 'Scorpius — Intermédiaire', description: 'Canons S4 + répéteurs S3. Composants B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'rsi-scorpius',
    weapons: { 'w-1': 'behring-m7c', 'w-2': 'behring-m7c', 'w-3': 'kw-cf787', 'w-4': 'kw-cf787' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: 'bracer-cool-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'dominator-s3', 'm-6': 'dominator-s3', 'm-7': 'dominator-s3', 'm-8': 'dominator-s3' },
    tags: ['Combat', 'PvP', 'Biplace'], estimatedPrice: 380_000,
  },
  {
    id: 'scorpius-max', name: 'Scorpius — Illimité', description: 'Neutrons S4/S3 + full A-grade. Puissance de feu écrasante.',
    icon: 'Flame', color: 'badge-gold', shipId: 'rsi-scorpius',
    weapons: { 'w-1': 'maxox-nn43', 'w-2': 'maxox-nn43', 'w-3': 'maxox-nn33', 'w-4': 'maxox-nn33' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade', 'Biplace'], estimatedPrice: 560_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ECLIPSE — Bombardier Torpilles (S3 x2, Torpilles S9 x3) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'eclipse-lowcost', name: 'Eclipse — Économique', description: 'Le bombardier furtif en budget. L\'essentiel pour les torpilles.',
    icon: 'EyeOff', color: 'badge-green', shipId: 'aegis-eclipse',
    weapons: { 'w-1': 'apocalypse-destroyer-s3', 'w-2': 'apocalypse-destroyer-s3' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: null, qt: 'goliath-s2' },
    missiles: {},
    tags: ['Bombardier', 'Budget', 'Furtif'], estimatedPrice: 110_000,
  },
  {
    id: 'eclipse-mid', name: 'Eclipse — Intermédiaire', description: 'Composants furtifs B-grade. Signature EM réduite.',
    icon: 'EyeOff', color: 'badge-blue', shipId: 'aegis-eclipse',
    weapons: { 'w-1': 'apocalypse-havoc-s3', 'w-2': 'apocalypse-havoc-s3' },
    systems: { pp: 'ink-s2', shield: 'srom-s2', cooler1: 'coldflow-s2', cooler2: null, qt: 'voyage-s2' },
    missiles: {},
    tags: ['Bombardier', 'Furtif', 'EM Réduite'], estimatedPrice: 195_000,
  },
  {
    id: 'eclipse-max', name: 'Eclipse — Illimité', description: 'Full A-grade stealth optimisé. Le fantôme parfait.',
    icon: 'EyeOff', color: 'badge-gold', shipId: 'aegis-eclipse',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'guardian-s2', shield: 'fr76-s2', cooler1: 'wc-ueen-s2', cooler2: null, qt: 'rush-s2' },
    missiles: {},
    tags: ['Bombardier', 'A-Grade', 'Furtif Max'], estimatedPrice: 350_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REDEEMER — Chasseur Lourd (S5 x2, Missiles S3 x8, Turrets S4 x2) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'redeemer-lowcost', name: 'Redeemer — Économique', description: 'Gunship en budget. Répéteurs énergie S5 + composants C-grade.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'aegis-redeemer',
    weapons: { 'w-1': 'kw-cfe55', 'w-2': 'kw-cfe55' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['Gunship', 'Budget'], estimatedPrice: 370_000,
  },
  {
    id: 'redeemer-mid', name: 'Redeemer — Intermédiaire', description: 'Canons laser S5 + B-grade. Puissance de feu sérieuse.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'aegis-redeemer',
    weapons: { 'w-1': 'behring-m9a-s5', 'w-2': 'behring-m9a-s5' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: 'bracer-cool-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'dominator-s3', 'm-6': 'dominator-s3', 'm-7': 'dominator-s3', 'm-8': 'dominator-s3' },
    tags: ['Gunship', 'PvP', 'Multi-équipage'], estimatedPrice: 510_000,
  },
  {
    id: 'redeemer-max', name: 'Redeemer — Illimité', description: 'Neutrons S5 + full A-grade. Un forteresse volante.',
    icon: 'Flame', color: 'badge-gold', shipId: 'aegis-redeemer',
    weapons: { 'w-1': 'maxox-nn53', 'w-2': 'maxox-nn53' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3', 'm-5': 'striker-s3', 'm-6': 'striker-s3', 'm-7': 'striker-s3', 'm-8': 'striker-s3' },
    tags: ['DPS Max', 'A-Grade', 'Forteresse'], estimatedPrice: 720_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTELLATION ANDROMEDA — Multi-Rôle Grand (S5 x2, S4 x2, Missiles S3+S4) — Composants S3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'connie-lowcost', name: 'Constellation — Économique', description: 'Le Connie polyvalent en budget. Répéteurs sur tous les slots.',
    icon: 'Package', color: 'badge-green', shipId: 'rsi-constellation-andromeda',
    weapons: { 'w-1': 'kw-cfe55', 'w-2': 'kw-cfe55', 'w-3': 'kw-cf667', 'w-4': 'kw-cf667' },
    systems: { pp: 'allstop-s3', shield: 'aspis-s3', cooler1: 'coldflow-s3', cooler2: 'coldflow-s3', qt: 'goliath-s3' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Multi-Rôle', 'Budget', 'Grand'], estimatedPrice: 380_000,
  },
  {
    id: 'connie-mid', name: 'Constellation — Intermédiaire', description: 'Canons S5 + S4, composants B-grade. Le vaisseau familial armé.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'rsi-constellation-andromeda',
    weapons: { 'w-1': 'behring-m9a-s5', 'w-2': 'behring-m9a-s5', 'w-3': 'behring-m7c', 'w-4': 'behring-m7c' },
    systems: { pp: 'powerbell-s3', shield: 'mirage-s3', cooler1: 'bracer-cool-s3', cooler2: 'bracer-cool-s3', qt: 'voyage-s3' },
    missiles: { 'm-1': 'vandal-s4', 'm-2': 'vandal-s4', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Polyvalent', 'PvE', 'Famille'], estimatedPrice: 650_000,
  },
  {
    id: 'connie-max', name: 'Constellation — Illimité', description: 'Neutrons S5/S4 + full A-grade + torpilles S4. Puissance capitale.',
    icon: 'Flame', color: 'badge-gold', shipId: 'rsi-constellation-andromeda',
    weapons: { 'w-1': 'maxox-nn53', 'w-2': 'maxox-nn53', 'w-3': 'maxox-nn43', 'w-4': 'maxox-nn43' },
    systems: { pp: 'regulus-s3', shield: 'shimmer-s3', cooler1: 'wc-ueen-s3', cooler2: 'wc-ueen-s3', qt: 'rush-s3' },
    missiles: { 'm-1': 'vandal-s4', 'm-2': 'vandal-s4', 'm-3': 'vandal-s4', 'm-4': 'vandal-s4' },
    tags: ['DPS Max', 'A-Grade', 'Capital Light'], estimatedPrice: 1_250_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CARRACK — Explorateur Grand (Turrets S4 x4) — Composants S3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'carrack-lowcost', name: 'Carrack — Économique', description: 'L\'explorateur en budget. QT longue portée, défense minimale.',
    icon: 'Compass', color: 'badge-green', shipId: 'anvil-carrack',
    weapons: {},
    systems: { pp: 'allstop-s3', shield: 'aspis-s3', cooler1: 'coldflow-s3', cooler2: 'coldflow-s3', qt: 'goliath-s3' },
    missiles: {},
    tags: ['Exploration', 'Budget', 'Longue portée'], estimatedPrice: 145_000,
  },
  {
    id: 'carrack-mid', name: 'Carrack — Intermédiaire', description: 'Boucliers solides B-grade + QT rapide. Exploration sûre.',
    icon: 'Compass', color: 'badge-blue', shipId: 'anvil-carrack',
    weapons: {},
    systems: { pp: 'powerbell-s3', shield: 'mirage-s3', cooler1: 'bracer-cool-s3', cooler2: 'bracer-cool-s3', qt: 'sl28-s3' },
    missiles: {},
    tags: ['Exploration', 'Survivabilité'], estimatedPrice: 320_000,
  },
  {
    id: 'carrack-max', name: 'Carrack — Illimité', description: 'Full A-grade, bouclier FR-76 + QT Atlas. L\'explorateur ultime.',
    icon: 'Compass', color: 'badge-gold', shipId: 'anvil-carrack',
    weapons: {},
    systems: { pp: 'guardian-s3', shield: 'fr76-s3', cooler1: 'wc-ueen-s3', cooler2: 'wc-ueen-s3', qt: 'atlas-qd-s3' },
    missiles: {},
    tags: ['Exploration', 'A-Grade', 'Ultime'], estimatedPrice: 580_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARES INFERNO — Chasseur S7 (S7 x1, Missiles S3 x4) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ares-lowcost', name: 'Ares Inferno — Économique', description: 'Le gatling S7 en budget. Composants C-grade.',
    icon: 'Flame', color: 'badge-green', shipId: 'crusader-ares-inferno',
    weapons: { 'w-1': 'gallenson-bg700' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: 'coldflow-s2', qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Anti-Capital', 'Budget'], estimatedPrice: 870_000,
  },
  {
    id: 'ares-mid', name: 'Ares Inferno — Intermédiaire', description: 'Gatling S7 + B-grade. L\'anti-capital efficace.',
    icon: 'Flame', color: 'badge-blue', shipId: 'crusader-ares-inferno',
    weapons: { 'w-1': 'gallenson-bg700' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: 'frosty-s2', qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'dominator-s3', 'm-4': 'dominator-s3' },
    tags: ['Anti-Capital', 'PvP'], estimatedPrice: 920_000,
  },
  {
    id: 'ares-max', name: 'Ares Inferno — Illimité', description: 'Gatling S7 + full A-grade. Le briseur de vaisseaux lourds.',
    icon: 'Flame', color: 'badge-gold', shipId: 'crusader-ares-inferno',
    weapons: { 'w-1': 'gallenson-bg700' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: 'wc-ueen-s2', qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Anti-Capital', 'A-Grade', 'DPS Max'], estimatedPrice: 1_050_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MERCURY STAR RUNNER — Transport (S3 x2, Missiles S2 x4) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mercury-lowcost', name: 'Mercury — Économique', description: 'Le contrebandier en budget. Défense minimale, QT rapide.',
    icon: 'Package', color: 'badge-green', shipId: 'misc-mercury-star-runner',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: null, qt: 'goliath-s2' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Transport', 'Budget', 'Contrebande'], estimatedPrice: 120_000,
  },
  {
    id: 'mercury-mid', name: 'Mercury — Intermédiaire', description: 'Boucliers solides + QT longue portée. Le runner efficace.',
    icon: 'Package', color: 'badge-blue', shipId: 'misc-mercury-star-runner',
    weapons: { 'w-1': 'kw-cf787', 'w-2': 'kw-cf787' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: null, qt: 'voyage-s2' },
    missiles: { 'm-1': 'crossfire-s2', 'm-2': 'crossfire-s2', 'm-3': 'crossfire-s2', 'm-4': 'crossfire-s2' },
    tags: ['Transport', 'Survivabilité'], estimatedPrice: 225_000,
  },
  {
    id: 'mercury-max', name: 'Mercury — Illimité', description: 'Full A-grade + Neutrons. Le Star Runner premium.',
    icon: 'Flame', color: 'badge-gold', shipId: 'misc-mercury-star-runner',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: null, qt: 'rush-s2' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Transport', 'A-Grade'], estimatedPrice: 345_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 400i — Explorateur Moyen (S3 x2, Missiles S2 x4) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: '400i-lowcost', name: '400i — Économique', description: 'L\'explorateur Origin en budget. QT longue portée prioritaire.',
    icon: 'Compass', color: 'badge-green', shipId: 'origin-400i',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: null, qt: 'goliath-s2' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Exploration', 'Budget', 'Luxe'], estimatedPrice: 115_000,
  },
  {
    id: '400i-mid', name: '400i — Intermédiaire', description: 'Boucliers solides + QT voyage. Exploration confortable.',
    icon: 'Compass', color: 'badge-blue', shipId: 'origin-400i',
    weapons: { 'w-1': 'behring-m7a', 'w-2': 'behring-m7a' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: null, qt: 'voyage-s2' },
    missiles: { 'm-1': 'crossfire-s2', 'm-2': 'crossfire-s2', 'm-3': 'crossfire-s2', 'm-4': 'crossfire-s2' },
    tags: ['Exploration', 'Survie'], estimatedPrice: 210_000,
  },
  {
    id: '400i-max', name: '400i — Illimité', description: 'Full A-grade exploration premium. Le luxe absolu.',
    icon: 'Compass', color: 'badge-gold', shipId: 'origin-400i',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'guardian-s2', shield: 'fr76-s2', cooler1: 'wc-ueen-s2', cooler2: null, qt: 'rush-s2' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Exploration', 'A-Grade', 'Premium'], estimatedPrice: 355_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZEUS MK II CL — Multi-Rôle (S3 x2, Missiles S3 x4) — Composants S2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'zeus-lowcost', name: 'Zeus Mk II — Économique', description: 'Le cargo armé RSI en budget.',
    icon: 'Package', color: 'badge-green', shipId: 'rsi-zeus-mk2-cl',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557' },
    systems: { pp: 'allstop-s2', shield: 'aspis-s2', cooler1: 'coldflow-s2', cooler2: null, qt: 'goliath-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Cargo', 'Budget'], estimatedPrice: 128_000,
  },
  {
    id: 'zeus-mid', name: 'Zeus Mk II — Intermédiaire', description: 'Canons S3 + QT voyage + boucliers B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'rsi-zeus-mk2-cl',
    weapons: { 'w-1': 'behring-m7a', 'w-2': 'behring-m7a' },
    systems: { pp: 'powerbell-s2', shield: 'mirage-s2', cooler1: 'bracer-cool-s2', cooler2: null, qt: 'voyage-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'dominator-s3', 'm-4': 'dominator-s3' },
    tags: ['Cargo', 'Défensif'], estimatedPrice: 235_000,
  },
  {
    id: 'zeus-max', name: 'Zeus Mk II — Illimité', description: 'Full A-grade. Le cargo qui ne craint personne.',
    icon: 'Flame', color: 'badge-gold', shipId: 'rsi-zeus-mk2-cl',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s2', shield: 'shimmer-s2', cooler1: 'wc-ueen-s2', cooler2: null, qt: 'rush-s2' },
    missiles: { 'm-1': 'striker-s3', 'm-2': 'striker-s3', 'm-3': 'striker-s3', 'm-4': 'striker-s3' },
    tags: ['Cargo', 'A-Grade', 'DPS'], estimatedPrice: 360_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROSPECTOR — Mineur (S3 x2) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'prospector-lowcost', name: 'Prospector — Économique', description: 'Défense minimale pour le mineur. QT longue portée pour les champs.',
    icon: 'Compass', color: 'badge-green', shipId: 'misc-prospector',
    weapons: { 'w-1': 'apocalypse-destroyer-s3', 'w-2': 'apocalypse-destroyer-s3' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: null, qt: 'goliath-s1' },
    missiles: {},
    tags: ['Minage', 'Budget', 'Longue portée'], estimatedPrice: 58_000,
  },
  {
    id: 'prospector-mid', name: 'Prospector — Intermédiaire', description: 'Bouclier B-grade + QT rapide. Minage sécurisé.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'misc-prospector',
    weapons: { 'w-1': 'kw-cf787', 'w-2': 'kw-cf787' },
    systems: { pp: 'ink-s1', shield: 'mirage-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: {},
    tags: ['Minage', 'Survie'], estimatedPrice: 95_000,
  },
  {
    id: 'prospector-max', name: 'Prospector — Illimité', description: 'Full A-grade. Le Prospector blindé pour Pyro.',
    icon: 'Flame', color: 'badge-gold', shipId: 'misc-prospector',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: {},
    tags: ['Minage', 'A-Grade', 'Pyro Ready'], estimatedPrice: 148_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VULTURE — Sauvetage (S3 x2) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'vulture-lowcost', name: 'Vulture — Économique', description: 'Salvage en budget. Armes balistiques pour autodéfense.',
    icon: 'Package', color: 'badge-green', shipId: 'drake-vulture',
    weapons: { 'w-1': 'apocalypse-destroyer-s3', 'w-2': 'apocalypse-destroyer-s3' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: null, qt: 'goliath-s1' },
    missiles: {},
    tags: ['Salvage', 'Budget'], estimatedPrice: 55_000,
  },
  {
    id: 'vulture-mid', name: 'Vulture — Intermédiaire', description: 'Répéteurs énergie + bouclier B-grade.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'drake-vulture',
    weapons: { 'w-1': 'kw-cf787', 'w-2': 'kw-cf787' },
    systems: { pp: 'ink-s1', shield: 'mirage-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: {},
    tags: ['Salvage', 'Survie'], estimatedPrice: 92_000,
  },
  {
    id: 'vulture-max', name: 'Vulture — Illimité', description: 'Full A-grade. Le charognard blindé.',
    icon: 'Flame', color: 'badge-gold', shipId: 'drake-vulture',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: {},
    tags: ['Salvage', 'A-Grade'], estimatedPrice: 145_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HERALD — Data Runner (S3 x2, Missiles S2 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'herald-lowcost', name: 'Herald — Économique', description: 'Le data runner en budget. QT prioritaire, armes secondaires.',
    icon: 'EyeOff', color: 'badge-green', shipId: 'drake-herald',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: null, qt: 'goliath-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Data Runner', 'Budget'], estimatedPrice: 70_000,
  },
  {
    id: 'herald-mid', name: 'Herald — Intermédiaire', description: 'QT rapide + bouclier B-grade. Fuite assurée.',
    icon: 'EyeOff', color: 'badge-blue', shipId: 'drake-herald',
    weapons: { 'w-1': 'kw-cf787', 'w-2': 'kw-cf787' },
    systems: { pp: 'ink-s1', shield: 'srom-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'spark-s2', 'm-2': 'spark-s2', 'm-3': 'spark-s2', 'm-4': 'spark-s2' },
    tags: ['Data Runner', 'Fuite'], estimatedPrice: 118_000,
  },
  {
    id: 'herald-max', name: 'Herald — Illimité', description: 'Full A-grade stealth. Le fantôme de l\'info.',
    icon: 'EyeOff', color: 'badge-gold', shipId: 'drake-herald',
    weapons: { 'w-1': 'maxox-nn33', 'w-2': 'maxox-nn33' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'spark-s2', 'm-2': 'spark-s2', 'm-3': 'spark-s2', 'm-4': 'spark-s2' },
    tags: ['Data Runner', 'A-Grade', 'Furtif'], estimatedPrice: 158_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MANTIS — Intercepteur QT (S3 x2, Missiles S2 x4) — Composants S1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mantis-lowcost', name: 'Mantis — Économique', description: 'L\'intercepteur QT en budget. Armes de base.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'rsi-mantis',
    weapons: { 'w-1': 'kw-cf557', 'w-2': 'kw-cf557' },
    systems: { pp: 'allstop-s1', shield: 'aspis-s1', cooler1: 'coldflow-s1', cooler2: null, qt: 'crossfield-s1' },
    missiles: { 'm-1': 'marksman-s2', 'm-2': 'marksman-s2', 'm-3': 'marksman-s2', 'm-4': 'marksman-s2' },
    tags: ['Intercepteur', 'Budget', 'QT Interdict'], estimatedPrice: 65_000,
  },
  {
    id: 'mantis-mid', name: 'Mantis — Intermédiaire', description: 'Distorsion + EM missiles. Config de piège QT.',
    icon: 'Skull', color: 'badge-blue', shipId: 'rsi-mantis',
    weapons: { 'w-1': 'preacher-disarray-s3', 'w-2': 'preacher-disarray-s3' },
    systems: { pp: 'ink-s1', shield: 'srom-s1', cooler1: 'bracer-cool-s1', cooler2: null, qt: 'voyage-s1' },
    missiles: { 'm-1': 'spark-s2', 'm-2': 'spark-s2', 'm-3': 'spark-s2', 'm-4': 'spark-s2' },
    tags: ['Intercepteur', 'Distorsion', 'Piège'], estimatedPrice: 125_000,
  },
  {
    id: 'mantis-max', name: 'Mantis — Illimité', description: 'Full A-grade + distorsion. Le piège mortel.',
    icon: 'Skull', color: 'badge-gold', shipId: 'rsi-mantis',
    weapons: { 'w-1': 'preacher-disarray-s3', 'w-2': 'preacher-disarray-s3' },
    systems: { pp: 'regulus-s1', shield: 'shimmer-s1', cooler1: 'wc-ueen-s1', cooler2: null, qt: 'rush-s1' },
    missiles: { 'm-1': 'spark-s2', 'm-2': 'spark-s2', 'm-3': 'spark-s2', 'm-4': 'spark-s2' },
    tags: ['Intercepteur', 'A-Grade', 'Pirate'], estimatedPrice: 168_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HERCULES C2 — Cargo Lourd (Turrets S4 x2, S3 x2) — Composants S3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'hercules-lowcost', name: 'Hercules C2 — Économique', description: 'Le mastodonte cargo en budget. Défense tourelles C-grade.',
    icon: 'Package', color: 'badge-green', shipId: 'crusader-hercules-c2',
    weapons: {},
    systems: { pp: 'allstop-s3', shield: 'aspis-s3', cooler1: 'coldflow-s3', cooler2: 'coldflow-s3', qt: 'goliath-s3' },
    missiles: {},
    tags: ['Cargo Lourd', 'Budget'], estimatedPrice: 155_000,
  },
  {
    id: 'hercules-mid', name: 'Hercules C2 — Intermédiaire', description: 'Boucliers B-grade + QT voyage. Transport sécurisé.',
    icon: 'Package', color: 'badge-blue', shipId: 'crusader-hercules-c2',
    weapons: {},
    systems: { pp: 'powerbell-s3', shield: 'mirage-s3', cooler1: 'bracer-cool-s3', cooler2: 'bracer-cool-s3', qt: 'voyage-s3' },
    missiles: {},
    tags: ['Cargo Lourd', 'Survivabilité'], estimatedPrice: 340_000,
  },
  {
    id: 'hercules-max', name: 'Hercules C2 — Illimité', description: 'Full A-grade + FR-76. Le transport blindé.',
    icon: 'Package', color: 'badge-gold', shipId: 'crusader-hercules-c2',
    weapons: {},
    systems: { pp: 'guardian-s3', shield: 'fr76-s3', cooler1: 'wc-ueen-s3', cooler2: 'wc-ueen-s3', qt: 'rush-s3' },
    missiles: {},
    tags: ['Cargo Lourd', 'A-Grade', 'Blindé'], estimatedPrice: 590_000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAMMERHEAD — Frégate (Turrets S5 x2, S4 x4) — Composants S3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'hammerhead-lowcost', name: 'Hammerhead — Économique', description: 'La frégate anti-chasseurs en budget.',
    icon: 'Crosshair', color: 'badge-green', shipId: 'aegis-hammerhead',
    weapons: {},
    systems: { pp: 'allstop-s3', shield: 'aspis-s3', cooler1: 'coldflow-s3', cooler2: 'coldflow-s3', qt: 'goliath-s3' },
    missiles: {},
    tags: ['Frégate', 'Budget', 'Anti-Chasseur'], estimatedPrice: 165_000,
  },
  {
    id: 'hammerhead-mid', name: 'Hammerhead — Intermédiaire', description: 'Boucliers B-grade solides. Le mur de tourelles.',
    icon: 'Crosshair', color: 'badge-blue', shipId: 'aegis-hammerhead',
    weapons: {},
    systems: { pp: 'powerbell-s3', shield: 'mirage-s3', cooler1: 'bracer-cool-s3', cooler2: 'frosty-s3', qt: 'sl28-s3' },
    missiles: {},
    tags: ['Frégate', 'Survivabilité'], estimatedPrice: 390_000,
  },
  {
    id: 'hammerhead-max', name: 'Hammerhead — Illimité', description: 'Full A-grade + FR-76. La frégate invincible.',
    icon: 'Flame', color: 'badge-gold', shipId: 'aegis-hammerhead',
    weapons: {},
    systems: { pp: 'guardian-s3', shield: 'fr76-s3', cooler1: 'wc-ueen-s3', cooler2: 'wc-ueen-s3', qt: 'rush-s3' },
    missiles: {},
    tags: ['Frégate', 'A-Grade', 'Invincible'], estimatedPrice: 620_000,
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
