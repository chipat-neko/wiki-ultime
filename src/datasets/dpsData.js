/**
 * DPS Calculator — Dataset complet
 * Profils d'armes avec stats DPS complètes + hardpoints vaisseaux + helpers
 * Version: Alpha 4.6
 */

import { SHIP_WEAPONS } from './shipweapons.js';

// ─────────────────────────────────────────────────────────────────
// WEAPON_PROFILES — 40+ armes avec stats DPS calculées
// Basé sur SHIP_WEAPONS (shipweapons.js) enrichi de projectileSpeed / ammoCount
// ─────────────────────────────────────────────────────────────────

/**
 * Calcule burstDPS et sustainedDPS à partir des stats brutes.
 *
 * burstDPS   = dégâts par tir × (rpm / 60)          — première seconde, sans cooldown
 * sustainedDPS = burstDPS × (1 - heatRatio)          — facteur de maintien thermique simplifié
 *
 * heatRatio = heatPerShot × (rpm/60) / HEAT_CAPACITY_BY_SIZE
 */
const HEAT_CAPACITY = { 1: 600, 2: 900, 3: 1400, 4: 2200, 5: 3500, 6: 5500, 7: 8500, 8: 13000, 9: 20000 };

function buildProfile(w) {
  const rps = w.stats.rpm / 60;
  const alphaDmg = (w.stats.alphaEm || 0) + (w.stats.alphaPhys || 0) + (w.stats.alphaDist || 0);
  const burstDPS = Math.round(alphaDmg * rps);
  const heatCapacity = HEAT_CAPACITY[w.size] || 600;
  const heatPerSec = w.stats.heatPerShot * rps;
  // Temps avant overheat (secondes)
  const overheatTime = heatPerSec > 0 ? Math.min(60, heatCapacity / heatPerSec) : 60;
  // Cooldown estimé : capacité / (rps * 2) secondes pour refroidir
  const cooldownTime = heatPerSec > 0 ? (heatCapacity / (heatPerSec * 2)) : 0;
  // DPS soutenu 15s : tir jusqu'à overheat puis on repose une fraction
  const fireRatio15 = Math.min(1, overheatTime / 15);
  const sustainedDPS = Math.round(burstDPS * fireRatio15);
  // DPS soutenu 60s
  const cycleTime = overheatTime + cooldownTime;
  const fireRatio60 = cycleTime > 0 ? Math.min(1, overheatTime / cycleTime) : 1;
  const sustainedDPS60 = Math.round(burstDPS * fireRatio60);
  // Alpha (un tir complet = toute la capacité thermique)
  const shotsBeforeOverheat = heatPerSec > 0 ? Math.floor(heatCapacity / w.stats.heatPerShot) : Math.floor(rps * 5);
  const alphaVolley = alphaDmg * shotsBeforeOverheat;

  // Vitesse projectile par défaut selon type
  const PROJ_SPEED = {
    'Laser Cannon': 0, 'Laser Repeater': 0, 'Neutron Cannon': 0,
    'Plasma Cannon': 0, 'Tachyon Cannon': 999999,
    'Ballistic Cannon': 1620, 'Ballistic Repeater': 1450,
    'Ballistic Gatling': 1200, 'Mass Driver': 2400,
    'Distortion Cannon': 0, 'Distortion Repeater': 0,
  };
  const projectileSpeed = PROJ_SPEED[w.type] ?? 0;

  return {
    id: w.id,
    name: w.name,
    size: w.size,
    type: w.type,
    typeKey: w.type.toLowerCase().replace(/\s+/g, '_'),
    manufacturer: w.manufacturer,
    class: w.class,
    grade: w.grade,
    dmgEnergy: w.stats.alphaEm || 0,
    dmgPhysical: w.stats.alphaPhys || 0,
    dmgDistortion: w.stats.alphaDist || 0,
    fireRate: w.stats.rpm,
    projectileSpeed,
    range: w.stats.range,
    energyPerShot: w.stats.powerDraw / (w.stats.rpm / 60),  // kW·s par tir
    heatPerShot: w.stats.heatPerShot,
    overheatTime: Math.round(overheatTime * 10) / 10,
    cooldownTime: Math.round(cooldownTime * 10) / 10,
    burstDPS,
    sustainedDPS,
    sustainedDPS60,
    alphaVolley: Math.round(alphaVolley),
    energyPerSec: Math.round(w.stats.powerDraw * 10) / 10,  // kW
    ammoCount: w.stats.ammoCount || null,
    price: w.price,
    inGame: w.inGame,
    description: w.description,
  };
}

export const WEAPON_PROFILES = SHIP_WEAPONS.map(buildProfile);

// ─────────────────────────────────────────────────────────────────
// SHIP_HARDPOINTS — hardpoints structurés pour 20 vaisseaux populaires
// Format: { wings: [{size, count}], nose: [{size, count}], turrets: [{size, count}] }
// ─────────────────────────────────────────────────────────────────

export const SHIP_HARDPOINTS = {
  // Aegis
  'aegis-gladius': {
    label: 'Gladius',
    wings:   [{ size: 3, count: 2 }],
    nose:    [{ size: 3, count: 1 }],
    turrets: [],
  },
  'aegis-avenger-titan': {
    label: 'Avenger Titan',
    wings:   [{ size: 1, count: 2 }],
    nose:    [{ size: 3, count: 2 }],
    turrets: [],
  },
  'aegis-hammerhead': {
    label: 'Hammerhead',
    wings:   [],
    nose:    [],
    turrets: [{ size: 5, count: 2 }, { size: 4, count: 4 }],
  },
  'aegis-redeemer': {
    label: 'Redeemer',
    wings:   [],
    nose:    [{ size: 5, count: 2 }],
    turrets: [{ size: 4, count: 2 }],
  },
  'aegis-vanguard-warden': {
    label: 'Vanguard Warden',
    wings:   [{ size: 3, count: 2 }],
    nose:    [{ size: 5, count: 2 }],
    turrets: [{ size: 2, count: 1 }],
  },
  'aegis-eclipse': {
    label: 'Eclipse',
    wings:   [],
    nose:    [{ size: 3, count: 2 }],
    turrets: [],
  },
  // Anvil
  'anvil-f7c-hornet': {
    label: 'F7C Hornet',
    wings:   [{ size: 2, count: 2 }],
    nose:    [{ size: 4, count: 1 }, { size: 3, count: 2 }],
    turrets: [{ size: 2, count: 1 }],
  },
  'anvil-f7a-hornet-mk2': {
    label: 'F7A Hornet Mk II',
    wings:   [{ size: 2, count: 2 }],
    nose:    [{ size: 4, count: 2 }, { size: 3, count: 2 }],
    turrets: [],
  },
  'anvil-valkyrie': {
    label: 'Valkyrie',
    wings:   [],
    nose:    [{ size: 5, count: 2 }],
    turrets: [{ size: 4, count: 2 }, { size: 3, count: 4 }],
  },
  // Drake
  'drake-cutlass-black': {
    label: 'Cutlass Black',
    wings:   [{ size: 3, count: 2 }],
    nose:    [],
    turrets: [{ size: 3, count: 2 }],
  },
  // MISC
  'misc-freelancer': {
    label: 'Freelancer',
    wings:   [],
    nose:    [{ size: 4, count: 2 }],
    turrets: [{ size: 2, count: 2 }],
  },
  'misc-prospector': {
    label: 'Prospector',
    wings:   [],
    nose:    [{ size: 3, count: 2 }],
    turrets: [],
  },
  // RSI
  'rsi-aurora-mr': {
    label: 'Aurora MR',
    wings:   [],
    nose:    [{ size: 2, count: 2 }],
    turrets: [],
  },
  'rsi-mantis': {
    label: 'Mantis',
    wings:   [],
    nose:    [{ size: 3, count: 2 }],
    turrets: [],
  },
  'rsi-constellation-andromeda': {
    label: 'Constellation Andromeda',
    wings:   [{ size: 4, count: 2 }],
    nose:    [{ size: 5, count: 2 }],
    turrets: [{ size: 4, count: 1 }, { size: 3, count: 1 }],
  },
  // Crusader
  'crusader-ares-inferno': {
    label: 'Ares Inferno',
    wings:   [],
    nose:    [{ size: 7, count: 1 }],
    turrets: [],
  },
  'crusader-hercules-c2': {
    label: 'Hercules C2',
    wings:   [],
    nose:    [],
    turrets: [{ size: 4, count: 2 }, { size: 3, count: 2 }],
  },
  // Origin
  'origin-300i': {
    label: '300i',
    wings:   [],
    nose:    [{ size: 3, count: 2 }],
    turrets: [],
  },
  'origin-890-jump': {
    label: '890 Jump',
    wings:   [],
    nose:    [],
    turrets: [{ size: 4, count: 4 }, { size: 3, count: 4 }],
  },
  // Anvil Carrack
  'anvil-carrack': {
    label: 'Carrack',
    wings:   [],
    nose:    [],
    turrets: [{ size: 4, count: 4 }],
  },
};

// ─────────────────────────────────────────────────────────────────
// DPS_SCENARIOS — 4 scénarios de combat
// ─────────────────────────────────────────────────────────────────

export const DPS_SCENARIOS = [
  {
    id: 'burst',
    label: 'Burst (1s)',
    description: 'DPS maximal sur la première seconde — aucun cooldown, tir pleine puissance',
    icon: 'Zap',
    color: 'text-red-400',
  },
  {
    id: 'sustained_15s',
    label: 'Soutenu 15s',
    description: 'DPS moyen sur 15 secondes en combat rapproché — tient compte de l\'overheat',
    icon: 'Flame',
    color: 'text-orange-400',
  },
  {
    id: 'sustained_60s',
    label: 'Soutenu 60s',
    description: 'DPS moyen sur 60 secondes — inclut cycles overheat + cooldown complets',
    icon: 'Timer',
    color: 'text-yellow-400',
  },
  {
    id: 'alpha',
    label: 'Alpha (volée)',
    description: 'Dégâts totaux d\'une volée complète avant surchauffe — punch instantané',
    icon: 'Target',
    color: 'text-cyan-400',
  },
];

// ─────────────────────────────────────────────────────────────────
// HELPERS — Calculs DPS
// ─────────────────────────────────────────────────────────────────

/**
 * Calcule le DPS d'une arme selon un scénario.
 * @param {object} weapon  — profil issu de WEAPON_PROFILES
 * @param {string} scenario — 'burst' | 'sustained_15s' | 'sustained_60s' | 'alpha'
 * @returns {number} valeur DPS (ou dégâts alpha)
 */
export function calcWeaponDPS(weapon, scenario = 'sustained_15s') {
  if (!weapon) return 0;
  switch (scenario) {
    case 'burst':        return weapon.burstDPS;
    case 'sustained_15s': return weapon.sustainedDPS;
    case 'sustained_60s': return weapon.sustainedDPS60;
    case 'alpha':        return weapon.alphaVolley;
    default:             return weapon.sustainedDPS;
  }
}

/**
 * Calcule le DPS total d'un loadout (tableau de profils d'armes).
 * @param {object[]} weapons  — tableau de WEAPON_PROFILES (peut contenir null/undefined = slot vide)
 * @param {string}   scenario
 * @returns {{ total, energy, physical, distortion }}
 */
export function calcLoadoutDPS(weapons, scenario = 'sustained_15s') {
  let energy = 0, physical = 0, distortion = 0;
  const validWeapons = (weapons || []).filter(Boolean);
  for (const w of validWeapons) {
    const rps = w.fireRate / 60;
    let ratio = 1;
    if (scenario === 'sustained_15s') {
      ratio = Math.min(1, w.overheatTime / 15);
    } else if (scenario === 'sustained_60s') {
      const cycle = w.overheatTime + w.cooldownTime;
      ratio = cycle > 0 ? Math.min(1, w.overheatTime / cycle) : 1;
    } else if (scenario === 'alpha') {
      // Pour alpha, on somme les alphaVolley directs
      energy     += Math.round(w.dmgEnergy * (w.ammoCount != null
        ? Math.min(Math.floor(HEAT_CAPACITY[w.size] / w.heatPerShot), w.ammoCount)
        : Math.floor(HEAT_CAPACITY[w.size] / w.heatPerShot)));
      physical   += Math.round(w.dmgPhysical * (w.ammoCount != null
        ? Math.min(Math.floor(HEAT_CAPACITY[w.size] / w.heatPerShot), w.ammoCount)
        : Math.floor(HEAT_CAPACITY[w.size] / w.heatPerShot)));
      distortion += Math.round(w.dmgDistortion * (w.ammoCount != null
        ? Math.min(Math.floor(HEAT_CAPACITY[w.size] / w.heatPerShot), w.ammoCount)
        : Math.floor(HEAT_CAPACITY[w.size] / w.heatPerShot)));
      continue;
    }
    energy     += Math.round(w.dmgEnergy * rps * ratio);
    physical   += Math.round(w.dmgPhysical * rps * ratio);
    distortion += Math.round(w.dmgDistortion * rps * ratio);
  }
  return { total: energy + physical + distortion, energy, physical, distortion };
}

/**
 * Calcule la chaleur générée par le loadout sur une durée.
 * @param {object[]} weapons
 * @param {number}   duration  — en secondes
 * @returns {number} chaleur totale accumulée
 */
export function calcHeatGeneration(weapons, duration = 15) {
  return (weapons || []).filter(Boolean).reduce((sum, w) => {
    const rps = w.fireRate / 60;
    return sum + w.heatPerShot * rps * Math.min(duration, w.overheatTime);
  }, 0);
}

/**
 * Estime le temps pour briser les boucliers d'un vaisseau cible.
 * @param {number} dps       — DPS effectif en dégâts EM
 * @param {number} shieldHp  — HP bouclier cible
 * @param {number} shieldRegen — Régén bouclier par seconde (défaut 0)
 * @returns {number|null} secondes (null si impossible)
 */
export function getShieldBreakTime(dps, shieldHp, shieldRegen = 0) {
  const netDPS = dps - shieldRegen;
  if (netDPS <= 0) return null;  // impossible de briser
  return Math.round((shieldHp / netDPS) * 10) / 10;
}

/**
 * Génère les points du graphique DPS(t) sur [0..60s], en tenant compte de l'overheat.
 * @param {object[]} weapons
 * @param {number}   points   — nombre de points
 * @returns {{ t, dps }[]}
 */
export function calcDPSCurve(weapons, points = 31) {
  const validWeapons = (weapons || []).filter(Boolean);
  const result = [];
  for (let i = 0; i < points; i++) {
    const t = (60 / (points - 1)) * i;
    let dps = 0;
    for (const w of validWeapons) {
      const rps = w.fireRate / 60;
      const cycle = w.overheatTime + w.cooldownTime;
      let ratio;
      if (w.overheatTime >= 60) {
        ratio = 1;
      } else if (cycle <= 0) {
        ratio = 1;
      } else {
        // Dans chaque cycle: tirer overheatTime, cooldown cooldownTime
        const tInCycle = t % cycle;
        ratio = tInCycle < w.overheatTime ? 1 : 0;
      }
      const alpha = w.dmgEnergy + w.dmgPhysical + w.dmgDistortion;
      dps += Math.round(alpha * rps * ratio);
    }
    result.push({ t: Math.round(t * 10) / 10, dps });
  }
  return result;
}

/**
 * Retourne la meilleure arme (burstDPS max) pour une taille donnée, par type.
 */
export function getBestWeaponForSlot(size, preferredType = null) {
  const candidates = WEAPON_PROFILES.filter(w => w.size === size);
  if (!candidates.length) return null;
  if (preferredType) {
    const typed = candidates.filter(w => w.typeKey === preferredType);
    if (typed.length) return typed.reduce((a, b) => b.burstDPS > a.burstDPS ? b : a);
  }
  return candidates.reduce((a, b) => b.burstDPS > a.burstDPS ? b : a);
}

/**
 * Retourne le label DPS pour affichage : abréviation K si > 1000
 */
export function formatDPS(val) {
  if (!val && val !== 0) return '—';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000)    return (val / 1000).toFixed(1) + 'K';
  return String(val);
}

// Vaisseaux cibles pour le calcul "temps pour briser les boucliers"
export const TARGET_SHIPS = [
  { id: 'aurora-mr',    label: 'Aurora MR',         shieldHp: 650,   shieldRegen: 32 },
  { id: 'gladius',      label: 'Gladius',            shieldHp: 950,   shieldRegen: 42 },
  { id: 'avenger',      label: 'Avenger Titan',      shieldHp: 1250,  shieldRegen: 56 },
  { id: 'hornet',       label: 'F7C Hornet',         shieldHp: 1600,  shieldRegen: 68 },
  { id: 'cutlass',      label: 'Cutlass Black',      shieldHp: 3800,  shieldRegen: 95 },
  { id: 'freelancer',   label: 'Freelancer',         shieldHp: 4200,  shieldRegen: 108 },
  { id: 'vanguard',     label: 'Vanguard Warden',    shieldHp: 5600,  shieldRegen: 124 },
  { id: 'redeemer',     label: 'Redeemer',           shieldHp: 7800,  shieldRegen: 158 },
  { id: 'constellation',label: 'Constellation',      shieldHp: 10200, shieldRegen: 186 },
  { id: 'carrack',      label: 'Carrack',            shieldHp: 16200, shieldRegen: 240 },
  { id: 'hammerhead',   label: 'Hammerhead',         shieldHp: 28600, shieldRegen: 380 },
];
