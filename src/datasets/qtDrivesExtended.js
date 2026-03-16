/**
 * QT Drives Extended Dataset — Star Citizen Wiki Ultime
 * Moteurs quantiques enrichis : vitesse, consommation, portée, spool, disconnectRange
 * Source: Star Citizen Wiki / Erkul / Fleetyards
 */

// Routes Stanton classiques pour le calculateur (distance en Gm)
export const QT_ROUTES = [
  { id: 'stanton-1-to-2', label: 'Stanton I → Stanton II (ArcCorp)', distance: 2.0 },
  { id: 'stanton-2-to-3', label: 'Stanton II → Stanton III (Crusader)', distance: 2.8 },
  { id: 'stanton-3-to-4', label: 'Stanton III → Stanton IV (MicroTech)', distance: 4.6 },
  { id: 'stanton-1-to-3', label: 'Stanton I → Stanton III (Crusader)', distance: 4.2 },
  { id: 'stanton-1-to-4', label: 'Stanton I → MicroTech', distance: 5.8 },
  { id: 'stanton-2-to-4', label: 'ArcCorp → MicroTech', distance: 3.9 },
  { id: 'pyro-1-to-2', label: 'Pyro I → Pyro II', distance: 3.5 },
  { id: 'pyro-2-to-5', label: 'Pyro II → Pyro V (Ignis)', distance: 5.2 },
  { id: 'stanton-jump-pyro', label: 'Stanton → Pyro (Jump Point)', distance: 8.4 },
];

// Format complet des QT Drives
export const QT_DRIVES_EXTENDED = [

  // ══════════════════════════════════════════
  // TAILLE 1
  // ══════════════════════════════════════════

  // ── Grade A / Civile ──────────────────────
  {
    id: 'atlas-s1',
    name: 'ATLAS S1',
    manufacturer: 'Landstal Drive Works',
    size: 1,
    grade: 'A',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.242,
      fuelConsumption: 38,
      disconnectRange: 12,
      spoolTime: 10.0,
      distortionHP: 240,
      range: 26.2,
    },
    price: 18500,
    inGame: true,
    description: "L'ATLAS de Landstal Drive Works allie vitesse respectable et bonne portée dans un package compact pour les petits vaisseaux civils.",
  },
  {
    id: 'spectre-s1',
    name: 'SPECTRE S1',
    manufacturer: 'Tarsus Electronics',
    size: 1,
    grade: 'A',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.221,
      fuelConsumption: 35,
      disconnectRange: 15,
      spoolTime: 11.0,
      distortionHP: 220,
      range: 24.5,
    },
    price: 15200,
    inGame: true,
    description: "Le SPECTRE de Tarsus Electronics est le moteur quantique de référence pour les petits vaisseaux. Vitesse élevée et portée respectable.",
  },
  {
    id: 'rush-s1',
    name: 'RUSH S1',
    manufacturer: 'Wei-Tek',
    size: 1,
    grade: 'A',
    classification: 'Compétition',
    stats: {
      qtSpeed: 0.254,
      fuelConsumption: 52,
      disconnectRange: 8,
      spoolTime: 6.8,
      distortionHP: 180,
      range: 18.2,
    },
    price: 17800,
    inGame: true,
    description: "Le RUSH de Wei-Tek est le moteur quantique le plus rapide de taille 1. Son temps de spool ultra-court le rend idéal pour les fuites rapides en combat.",
  },

  // ── Grade B ───────────────────────────────
  {
    id: 'voyage-s1',
    name: 'VOYAGE S1',
    manufacturer: 'MISC',
    size: 1,
    grade: 'B',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.189,
      fuelConsumption: 28,
      disconnectRange: 18,
      spoolTime: 12.5,
      distortionHP: 195,
      range: 30.8,
    },
    price: 10500,
    inGame: true,
    description: "Le VOYAGE de MISC privilégie la portée et l'efficacité carburant. Parfait pour les voyages longue distance entre systèmes.",
  },
  {
    id: 'sl28-s1',
    name: 'SL-28 S1',
    manufacturer: 'Wei-Tek',
    size: 1,
    grade: 'B',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.208,
      fuelConsumption: 32,
      disconnectRange: 14,
      spoolTime: 10.8,
      distortionHP: 205,
      range: 22.4,
    },
    price: 13000,
    inGame: true,
    description: "Le SL-28 offre un excellent compromis entre vitesse et consommation pour les petits vaisseaux polyvalents.",
  },

  // ── Grade C ───────────────────────────────
  {
    id: 'goliath-s1',
    name: 'GOLIATH S1',
    manufacturer: 'Landstal Drive Works',
    size: 1,
    grade: 'C',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.155,
      fuelConsumption: 18,
      disconnectRange: 22,
      spoolTime: 14.5,
      distortionHP: 165,
      range: 38.5,
    },
    price: 7200,
    inGame: true,
    description: "Le GOLIATH est le champion de l'efficacité carburant. Sa consommation ultra-basse et sa portée record le rendent indispensable aux explorateurs.",
  },

  // ── Grade A / Militaire ───────────────────
  {
    id: 'siren-s1',
    name: 'SIREN S1',
    manufacturer: 'Siren Drive Corp',
    size: 1,
    grade: 'A',
    classification: 'Militaire',
    stats: {
      qtSpeed: 0.235,
      fuelConsumption: 40,
      disconnectRange: 10,
      spoolTime: 9.2,
      distortionHP: 280,
      range: 22.0,
    },
    price: 24000,
    inGame: true,
    description: "Le SIREN de Siren Drive Corp est un moteur militaire robuste avec une résistance aux dommages de distorsion supérieure à la moyenne.",
  },

  // ── Furtif ────────────────────────────────
  {
    id: 'whisper-s1',
    name: 'WHISPER S1',
    manufacturer: 'Klaus & Werner',
    size: 1,
    grade: 'A',
    classification: 'Furtif',
    stats: {
      qtSpeed: 0.195,
      fuelConsumption: 30,
      disconnectRange: 16,
      spoolTime: 11.8,
      distortionHP: 190,
      range: 25.5,
    },
    price: 21000,
    inGame: true,
    description: "Le WHISPER est le moteur quantique furtif de K&W. Ses émissions réduites lors du spool le rendent quasi-indétectable sur les scanners ennemis.",
  },

  // ── Industrielle ──────────────────────────
  {
    id: 'crossfield-s1',
    name: 'CROSSFIELD S1',
    manufacturer: 'Siren Drive Corp',
    size: 1,
    grade: 'C',
    classification: 'Industrielle',
    stats: {
      qtSpeed: 0.128,
      fuelConsumption: 22,
      disconnectRange: 24,
      spoolTime: 16.0,
      distortionHP: 155,
      range: 42.0,
    },
    price: 3900,
    inGame: true,
    description: "Le CROSSFIELD est le moteur quantique d'entrée de gamme de Siren Drive Corp. Peu performant mais très abordable, idéal pour les mineurs sur budget.",
  },

  // ══════════════════════════════════════════
  // TAILLE 2
  // ══════════════════════════════════════════

  // ── Grade A ───────────────────────────────
  {
    id: 'titan-s2',
    name: 'TITAN S2',
    manufacturer: 'Tarsus Electronics',
    size: 2,
    grade: 'A',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.235,
      fuelConsumption: 42,
      disconnectRange: 15,
      spoolTime: 10.5,
      distortionHP: 480,
      range: 25.8,
    },
    price: 38000,
    inGame: true,
    description: "Le TITAN S2 de Tarsus est le moteur haut de gamme pour les vaisseaux moyens. Vitesse supérieure au Spectre avec une bonne portée.",
  },
  {
    id: 'spectre-s2',
    name: 'SPECTRE S2',
    manufacturer: 'Tarsus Electronics',
    size: 2,
    grade: 'A',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.221,
      fuelConsumption: 38,
      disconnectRange: 16,
      spoolTime: 11.0,
      distortionHP: 440,
      range: 24.5,
    },
    price: 30400,
    inGame: true,
    description: "Le SPECTRE S2 étend les performances de la série Spectre aux vaisseaux de taille moyenne.",
  },
  {
    id: 'rush-s2',
    name: 'RUSH S2',
    manufacturer: 'Wei-Tek',
    size: 2,
    grade: 'A',
    classification: 'Compétition',
    stats: {
      qtSpeed: 0.254,
      fuelConsumption: 56,
      disconnectRange: 8,
      spoolTime: 6.8,
      distortionHP: 360,
      range: 18.2,
    },
    price: 35600,
    inGame: true,
    description: "Le RUSH S2 apporte la rapidité légendaire de la gamme Rush aux vaisseaux de combat moyens. Temps de spool record.",
  },

  // ── Grade B ───────────────────────────────
  {
    id: 'voyage-s2',
    name: 'VOYAGE S2',
    manufacturer: 'MISC',
    size: 2,
    grade: 'B',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.189,
      fuelConsumption: 30,
      disconnectRange: 18,
      spoolTime: 12.5,
      distortionHP: 390,
      range: 30.8,
    },
    price: 21000,
    inGame: true,
    description: "Le VOYAGE S2 est le compagnon des cargos moyens pour les voyages longue distance, avec une excellente économie de carburant.",
  },
  {
    id: 'sl28-s2',
    name: 'SL-28 S2',
    manufacturer: 'Wei-Tek',
    size: 2,
    grade: 'B',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.208,
      fuelConsumption: 35,
      disconnectRange: 14,
      spoolTime: 10.8,
      distortionHP: 410,
      range: 22.4,
    },
    price: 26000,
    inGame: true,
    description: "Le SL-28 S2 est l'option équilibrée pour les vaisseaux de taille 2 qui cherchent un bon compromis global.",
  },

  // ── Grade C ───────────────────────────────
  {
    id: 'goliath-s2',
    name: 'GOLIATH S2',
    manufacturer: 'Landstal Drive Works',
    size: 2,
    grade: 'C',
    classification: 'Industrielle',
    stats: {
      qtSpeed: 0.155,
      fuelConsumption: 20,
      disconnectRange: 22,
      spoolTime: 14.5,
      distortionHP: 330,
      range: 38.5,
    },
    price: 14400,
    inGame: true,
    description: "Le GOLIATH S2 préserve l'efficacité carburant exceptionnelle de la gamme pour les vaisseaux moyens et les cargos longue distance.",
  },

  // ── Militaire ─────────────────────────────
  {
    id: 'siren-s2',
    name: 'SIREN S2',
    manufacturer: 'Siren Drive Corp',
    size: 2,
    grade: 'A',
    classification: 'Militaire',
    stats: {
      qtSpeed: 0.228,
      fuelConsumption: 44,
      disconnectRange: 10,
      spoolTime: 9.5,
      distortionHP: 560,
      range: 21.8,
    },
    price: 48000,
    inGame: true,
    description: "Le SIREN S2 est le moteur militaire standard pour les frégates et chasseurs lourds. Sa résistance aux distorsions est remarquable.",
  },

  // ══════════════════════════════════════════
  // TAILLE 3
  // ══════════════════════════════════════════

  // ── Grade A ───────────────────────────────
  {
    id: 'atlas-s3',
    name: 'ATLAS S3',
    manufacturer: 'Landstal Drive Works',
    size: 3,
    grade: 'A',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.238,
      fuelConsumption: 40,
      disconnectRange: 15,
      spoolTime: 10.2,
      distortionHP: 920,
      range: 27.4,
    },
    price: 78000,
    inGame: true,
    description: "L'ATLAS S3 de Landstal combine grande portée et vitesse de classe A pour les grands vaisseaux. La référence premium toutes catégories.",
  },
  {
    id: 'spectre-s3',
    name: 'SPECTRE S3',
    manufacturer: 'Tarsus Electronics',
    size: 3,
    grade: 'A',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.221,
      fuelConsumption: 38,
      disconnectRange: 16,
      spoolTime: 11.0,
      distortionHP: 880,
      range: 24.5,
    },
    price: 60800,
    inGame: true,
    description: "Le SPECTRE S3 est la solution premium pour les grands vaisseaux nécessitant vitesse et portée en voyage quantique.",
  },
  {
    id: 'rush-s3',
    name: 'RUSH S3',
    manufacturer: 'Wei-Tek',
    size: 3,
    grade: 'A',
    classification: 'Compétition',
    stats: {
      qtSpeed: 0.254,
      fuelConsumption: 58,
      disconnectRange: 8,
      spoolTime: 6.8,
      distortionHP: 720,
      range: 18.2,
    },
    price: 71200,
    inGame: true,
    description: "Le RUSH S3 est le moteur QT le plus rapide pour les grandes plateformes. Idéal pour les frégates de combat qui doivent fuir rapidement.",
  },

  // ── Grade B ───────────────────────────────
  {
    id: 'voyage-s3',
    name: 'VOYAGE S3',
    manufacturer: 'MISC',
    size: 3,
    grade: 'B',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.189,
      fuelConsumption: 32,
      disconnectRange: 18,
      spoolTime: 12.5,
      distortionHP: 740,
      range: 30.8,
    },
    price: 42000,
    inGame: true,
    description: "Le VOYAGE S3 est le compagnon des grands cargos et explorateurs pour les expéditions inter-systèmes longue durée.",
  },
  {
    id: 'sl28-s3',
    name: 'SL-28 S3',
    manufacturer: 'Wei-Tek',
    size: 3,
    grade: 'B',
    classification: 'Civile',
    stats: {
      qtSpeed: 0.208,
      fuelConsumption: 36,
      disconnectRange: 14,
      spoolTime: 10.8,
      distortionHP: 820,
      range: 22.4,
    },
    price: 52000,
    inGame: true,
    description: "Le SL-28 S3 est l'option équilibrée par excellence pour les grands vaisseaux qui ne veulent pas sacrifier la vitesse à l'économie.",
  },

  // ── Grade C ───────────────────────────────
  {
    id: 'goliath-s3',
    name: 'GOLIATH S3',
    manufacturer: 'Landstal Drive Works',
    size: 3,
    grade: 'C',
    classification: 'Industrielle',
    stats: {
      qtSpeed: 0.155,
      fuelConsumption: 20,
      disconnectRange: 22,
      spoolTime: 14.5,
      distortionHP: 620,
      range: 38.5,
    },
    price: 28800,
    inGame: true,
    description: "Le GOLIATH S3 est le maître de l'efficacité carburant pour les grandes plateformes. Sa portée de 38 Gm est inégalée dans sa classe.",
  },

  // ── Militaire S3 ─────────────────────────
  {
    id: 'siren-s3',
    name: 'SIREN S3',
    manufacturer: 'Siren Drive Corp',
    size: 3,
    grade: 'A',
    classification: 'Militaire',
    stats: {
      qtSpeed: 0.230,
      fuelConsumption: 46,
      disconnectRange: 10,
      spoolTime: 9.5,
      distortionHP: 1120,
      range: 21.6,
    },
    price: 96000,
    inGame: true,
    description: "Le SIREN S3 est le moteur militaire de référence pour les corvettes et frégates. Conçu pour encaisser les tirs de distorsion ennemis.",
  },
];

/**
 * Obtenir les tailles uniques disponibles
 */
export const QT_SIZES = [1, 2, 3];

/**
 * Obtenir les grades uniques disponibles
 */
export const QT_GRADES = ['A', 'B', 'C'];

/**
 * Obtenir les classifications uniques disponibles
 */
export const QT_CLASSIFICATIONS = ['Civile', 'Compétition', 'Militaire', 'Furtif', 'Industrielle'];

/**
 * Calculer le temps de trajet QT en secondes
 * @param {number} distanceGm - distance en gigamètres
 * @param {number} qtSpeedGmPerS - vitesse QT en Gm/s
 * @param {number} spoolTimeSec - temps de spool en secondes
 * @returns {{ travelSec: number, totalSec: number }}
 */
export function calcQTTime(distanceGm, qtSpeedGmPerS, spoolTimeSec) {
  const travelSec = distanceGm / qtSpeedGmPerS;
  const totalSec = spoolTimeSec + travelSec;
  return { travelSec, totalSec };
}

/**
 * Calculer la consommation de carburant QT
 * @param {number} distanceGm - distance en gigamètres
 * @param {number} fuelConsumptionLPerMkm - consommation en L/Mkm
 * @returns {number} litres consommés
 */
export function calcQTFuel(distanceGm, fuelConsumptionLPerMkm) {
  // 1 Gm = 1000 Mkm
  const distanceMkm = distanceGm * 1000;
  return distanceMkm * fuelConsumptionLPerMkm;
}
