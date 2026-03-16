// Refinery data for Star Citizen Alpha 4.6
// Sources: UEX Corp, Star Citizen Wiki, in-game observation

// ─── REFINERY METHODS ────────────────────────────────────────────────────────
// yieldBonus   : bonus de rendement (en fraction, ex: 0.25 = +25% de matière)
// timeMulti    : multiplicateur de durée de base (1.0 = normal)
// costPercent  : % de la valeur brute facturé pour le raffinage
export const REFINERY_METHODS = {
  dinyx: {
    id: 'dinyx',
    name: 'Dinyx Solventation',
    yieldBonus: 0.25,
    timeMulti: 1.0,
    costPercent: 0.10,
    description: 'Méthode équilibrée, bon compromis rendement/temps/coût.',
    badge: 'badge-cyan',
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-700/40',
  },
  cormack: {
    id: 'cormack',
    name: 'Cormack Method',
    yieldBonus: 0.35,
    timeMulti: 2.0,
    costPercent: 0.15,
    description: 'Haut rendement mais processus lent et coûteux.',
    badge: 'badge-green',
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-700/40',
  },
  electronal: {
    id: 'electronal',
    name: 'Electronal Process',
    yieldBonus: 0.20,
    timeMulti: 0.8,
    costPercent: 0.08,
    description: 'Processus rapide et bon marché, rendement plus faible.',
    badge: 'badge-yellow',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-700/40',
  },
  ferron: {
    id: 'ferron',
    name: 'Ferron Exchange',
    yieldBonus: 0.28,
    timeMulti: 1.2,
    costPercent: 0.12,
    description: 'Bon compromis entre rendement et durée.',
    badge: 'badge-blue',
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-700/40',
  },
  gconv: {
    id: 'gconv',
    name: 'Gaseous Conversion',
    yieldBonus: 0.15,
    timeMulti: 0.5,
    costPercent: 0.06,
    description: 'Très rapide et économique, mais rendement minimal.',
    badge: 'badge-purple',
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-700/40',
  },
  xcr: {
    id: 'xcr',
    name: 'XCR Reaction',
    yieldBonus: 0.40,
    timeMulti: 3.0,
    costPercent: 0.20,
    description: 'Rendement maximum, processus très long et très coûteux.',
    badge: 'badge-gold',
    color: 'text-yellow-300',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-600/40',
  },
};

export const REFINERY_METHODS_LIST = Object.values(REFINERY_METHODS);

// ─── REFINERY STATIONS ───────────────────────────────────────────────────────
// modules : nombre de modules de raffinage disponibles simultanément
export const REFINERY_STATIONS = [
  {
    id: 'humboldt',
    name: 'Humboldt Mines',
    location: 'Lyria',
    planet: 'ArcCorp',
    system: 'Stanton',
    modules: 4,
    travelMinFromOlisar: 12,
    description: 'Station minière sur Lyria, lune d\'ArcCorp.',
  },
  {
    id: 'loveridge',
    name: 'Loveridge Mineral Reserve',
    location: 'Lyria',
    planet: 'ArcCorp',
    system: 'Stanton',
    modules: 4,
    travelMinFromOlisar: 14,
    description: 'Réserve minérale sur Lyria, spécialisée en minerais rares.',
  },
  {
    id: 'arc-l1',
    name: 'ARC-L1 Wide Forest Station',
    location: 'Lagrange L1',
    planet: 'ArcCorp',
    system: 'Stanton',
    modules: 6,
    travelMinFromOlisar: 20,
    description: 'Station de point Lagrange, grande capacité de raffinage.',
  },
  {
    id: 'cru-l1',
    name: 'CRU-L1 Ambitious Dream Station',
    location: 'Lagrange L1',
    planet: 'Crusader',
    system: 'Stanton',
    modules: 6,
    travelMinFromOlisar: 18,
    description: 'Station Lagrange près de Crusader.',
  },
  {
    id: 'mic-l1',
    name: 'MIC-L1 Shallow Fields Station',
    location: 'Lagrange L1',
    planet: 'microTech',
    system: 'Stanton',
    modules: 5,
    travelMinFromOlisar: 25,
    description: 'Station Lagrange dans la zone de microTech.',
  },
  {
    id: 'hur-l1',
    name: 'HUR-L1 Green Glade Station',
    location: 'Lagrange L1',
    planet: 'Hurston',
    system: 'Stanton',
    modules: 5,
    travelMinFromOlisar: 22,
    description: 'Station Lagrange dans la zone de Hurston.',
  },
  {
    id: 'checkmate',
    name: 'Checkmate',
    location: 'Monox',
    planet: 'Monox',
    system: 'Pyro',
    modules: 3,
    travelMinFromOlisar: 45,
    description: 'Station frontière dans le système Pyro, accès par Jump Point.',
  },
  {
    id: 'ruin',
    name: 'Ruin Station',
    location: 'Fuego',
    planet: 'Fuego',
    system: 'Pyro',
    modules: 3,
    travelMinFromOlisar: 50,
    description: 'Station dans le système Pyro, zone de haute activité.',
  },
];

// ─── MINERALS REFINERY ───────────────────────────────────────────────────────
// baseValue    : valeur en aUEC par unité raffinée (SCU)
// rawValue     : valeur en aUEC par unité brute (SCU)
// refineRatio  : fraction de matière récupérée après raffinage (ex: 0.65 = 65%)
// baseTimeMin  : durée de base en minutes pour raffiner 1 SCU brut (méthode Dinyx x1.0)
// tier         : 'rare' | 'uncommon' | 'common'
export const MINERALS_REFINERY = [
  {
    id: 'quantanium',
    name: 'Quantanium',
    baseValue: 800,
    rawValue: 120,
    refineRatio: 0.55,
    baseTimeMin: 60,
    tier: 'rare',
    color: 'text-cyan-300',
    bg: 'bg-cyan-900/30',
    border: 'border-cyan-500/50',
    imageUrl: '/images/minerals/quantanium.jpg',
  },
  {
    id: 'bexalite',
    name: 'Bexalite',
    baseValue: 520,
    rawValue: 90,
    refineRatio: 0.60,
    baseTimeMin: 48,
    tier: 'rare',
    color: 'text-rose-400',
    bg: 'bg-rose-900/30',
    border: 'border-rose-700/40',
    imageUrl: '/images/minerals/bexalite.jpg',
  },
  {
    id: 'taranite',
    name: 'Taranite',
    baseValue: 480,
    rawValue: 80,
    refineRatio: 0.62,
    baseTimeMin: 45,
    tier: 'rare',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-700/40',
    imageUrl: '/images/minerals/taranite.jpg',
  },
  {
    id: 'laranite',
    name: 'Laranite',
    baseValue: 450,
    rawValue: 75,
    refineRatio: 0.63,
    baseTimeMin: 42,
    tier: 'uncommon',
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-700/40',
    imageUrl: '/images/minerals/laranite.jpg',
  },
  {
    id: 'agricium',
    name: 'Agricium',
    baseValue: 390,
    rawValue: 65,
    refineRatio: 0.65,
    baseTimeMin: 38,
    tier: 'uncommon',
    color: 'text-lime-400',
    bg: 'bg-lime-900/30',
    border: 'border-lime-700/40',
    imageUrl: '/images/minerals/agricium.jpg',
  },
  {
    id: 'gold',
    name: 'Or',
    baseValue: 350,
    rawValue: 55,
    refineRatio: 0.68,
    baseTimeMin: 35,
    tier: 'uncommon',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-700/40',
    imageUrl: '/images/minerals/gold.jpg',
  },
  {
    id: 'titanium',
    name: 'Titanium',
    baseValue: 280,
    rawValue: 45,
    refineRatio: 0.70,
    baseTimeMin: 30,
    tier: 'common',
    color: 'text-slate-300',
    bg: 'bg-slate-800/30',
    border: 'border-slate-600/40',
    imageUrl: '/images/minerals/titanium.jpg',
  },
  {
    id: 'hephaestanite',
    name: 'Hephaestanite',
    baseValue: 250,
    rawValue: 40,
    refineRatio: 0.72,
    baseTimeMin: 28,
    tier: 'common',
    color: 'text-slate-400',
    bg: 'bg-slate-800/30',
    border: 'border-slate-600/40',
    imageUrl: '/images/minerals/hephaestanite.jpg',
  },
  {
    id: 'borase',
    name: 'Borase',
    baseValue: 220,
    rawValue: 35,
    refineRatio: 0.73,
    baseTimeMin: 26,
    tier: 'common',
    color: 'text-amber-300',
    bg: 'bg-amber-900/30',
    border: 'border-amber-700/40',
    imageUrl: '/images/minerals/borase.jpg',
  },
  {
    id: 'diamond',
    name: 'Diamant',
    baseValue: 200,
    rawValue: 32,
    refineRatio: 0.75,
    baseTimeMin: 24,
    tier: 'common',
    color: 'text-sky-300',
    bg: 'bg-sky-900/30',
    border: 'border-sky-700/40',
    imageUrl: '/images/minerals/diamond.jpg',
  },
  {
    id: 'tungsten',
    name: 'Tungstène',
    baseValue: 180,
    rawValue: 28,
    refineRatio: 0.78,
    baseTimeMin: 20,
    tier: 'common',
    color: 'text-slate-400',
    bg: 'bg-slate-700/30',
    border: 'border-slate-500/40',
    imageUrl: '/images/minerals/tungsten.jpg',
  },
  {
    id: 'iron',
    name: 'Fer',
    baseValue: 120,
    rawValue: 18,
    refineRatio: 0.80,
    baseTimeMin: 15,
    tier: 'common',
    color: 'text-orange-300',
    bg: 'bg-orange-900/30',
    border: 'border-orange-700/40',
    imageUrl: '/images/minerals/iron.jpg',
  },
];

export const MINERALS_REFINERY_BY_ID = Object.fromEntries(
  MINERALS_REFINERY.map(m => [m.id, m])
);

// Tier styles for badges
export const TIER_STYLES = {
  rare:     { label: 'Rare',     badge: 'badge-blue',   color: 'text-blue-400'   },
  uncommon: { label: 'Peu commun', badge: 'badge-cyan', color: 'text-cyan-400'   },
  common:   { label: 'Commun',   badge: 'badge-slate',  color: 'text-slate-400'  },
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Calcule les résultats de raffinage pour une combinaison donnée.
 *
 * @param {object} params
 * @param {object} params.mineral       - objet minéral depuis MINERALS_REFINERY
 * @param {number} params.rawAmount     - quantité brute en SCU
 * @param {object} params.method        - objet méthode depuis REFINERY_METHODS
 * @param {number} [params.modules=1]   - nombre de modules actifs (1-4)
 *
 * @returns {{ yieldAmount, yieldValue, rawTotalValue, cost, duration_minutes, profit, roi }}
 */
export function calcRefinery({ mineral, rawAmount, method, modules = 1 }) {
  if (!mineral || !method || !rawAmount || rawAmount <= 0) {
    return { yieldAmount: 0, yieldValue: 0, rawTotalValue: 0, cost: 0, duration_minutes: 0, profit: 0, roi: 0 };
  }

  // Quantité raffinée = rawAmount × refineRatio × (1 + yieldBonus)
  const yieldAmount = rawAmount * mineral.refineRatio * (1 + method.yieldBonus);

  // Valeur du minerai raffiné
  const yieldValue = yieldAmount * mineral.baseValue;

  // Valeur brute totale (pour comparaison)
  const rawTotalValue = rawAmount * mineral.rawValue;

  // Coût de raffinage = % de la valeur brute totale
  const cost = rawTotalValue * method.costPercent;

  // Durée en minutes = (durée de base × quantité × multiplicateur temps) / nb modules
  const duration_minutes = Math.ceil(
    (mineral.baseTimeMin * rawAmount * method.timeMulti) / modules
  );

  // Profit net = valeur raffinée − valeur brute − coût
  const profit = yieldValue - rawTotalValue - cost;

  // ROI = profit / (valeur brute + coût) × 100
  const roi = rawTotalValue + cost > 0
    ? (profit / (rawTotalValue + cost)) * 100
    : 0;

  return {
    yieldAmount: Math.round(yieldAmount * 100) / 100,
    yieldValue: Math.round(yieldValue),
    rawTotalValue: Math.round(rawTotalValue),
    cost: Math.round(cost),
    duration_minutes,
    profit: Math.round(profit),
    roi: Math.round(roi * 10) / 10,
  };
}

/**
 * Retourne la méthode offrant le meilleur profit net pour un minéral et une quantité donnés.
 *
 * @param {object} mineral     - objet minéral depuis MINERALS_REFINERY
 * @param {number} rawAmount   - quantité brute en SCU
 * @param {number} [modules=1] - nombre de modules
 *
 * @returns {{ method, result }} — la méthode et son résultat de calcul
 */
export function getBestMethod(mineral, rawAmount, modules = 1) {
  let best = null;
  let bestProfit = -Infinity;

  for (const method of REFINERY_METHODS_LIST) {
    const result = calcRefinery({ mineral, rawAmount, method, modules });
    if (result.profit > bestProfit) {
      bestProfit = result.profit;
      best = { method, result };
    }
  }

  return best;
}

/**
 * Formate une durée en minutes en chaîne lisible.
 * Ex: 90 → "1h 30min"
 */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
