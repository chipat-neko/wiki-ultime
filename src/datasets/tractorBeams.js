/**
 * Tractor Beams Dataset — Star Citizen Wiki Ultime
 * Sources: Star Citizen Alpha 4.6 game data
 */

// Types de tracteur beams
export const TRACTOR_TYPE_CONFIG = {
  Salvage:       { label: 'Salvage',        color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700/40' },
  Cargo:         { label: 'Cargo',          color: 'text-cyan-400',   bg: 'bg-cyan-900/30',   border: 'border-cyan-700/40'   },
  Utility:       { label: 'Utilitaire',     color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700/40'  },
  'Ship-mounted':{ label: 'Vaisseau',       color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-700/40' },
};

export const TRACTOR_BEAMS = [
  // ── Greycat Industrial — Salvage ─────────────────────────────────────────
  {
    id: 'greycat-tractor-s1',
    name: 'Greycat Tractor Beam S1',
    manufacturer: 'Greycat Industrial',
    type: 'Salvage',
    size: 1,
    force: 180000,
    range: 30,
    angle: 20,
    powerDraw: 35,
    price: 5800,
    inGame: true,
    compatible: ['Vulture'],
    description: 'Tracteur léger d\'entrée de gamme de Greycat. Parfait pour le salvage solo sur petits débris et épaves légères. Peu énergivore.',
  },
  {
    id: 'greycat-tractor-s2',
    name: 'Greycat Tractor Beam S2',
    manufacturer: 'Greycat Industrial',
    type: 'Salvage',
    size: 2,
    force: 450000,
    range: 55,
    angle: 22,
    powerDraw: 75,
    price: 18500,
    inGame: true,
    compatible: ['Vulture', 'Reclaimer'],
    description: 'Version intermédiaire du tracteur Greycat. Force doublée, portée augmentée — recommandé pour épaves moyennes et débris de taille 2.',
  },
  {
    id: 'greycat-tractor-s3',
    name: 'Greycat Tractor Beam S3',
    manufacturer: 'Greycat Industrial',
    type: 'Salvage',
    size: 3,
    force: 950000,
    range: 80,
    angle: 25,
    powerDraw: 140,
    price: 42000,
    inGame: true,
    compatible: ['Reclaimer'],
    description: 'Tracteur lourd Greycat pour salvage intensif. Conçu pour les opérations sur épaves capital et les débris de grande taille.',
  },
  {
    id: 'salvage-grip-s1',
    name: 'Salvage Grip S1',
    manufacturer: 'Greycat Industrial',
    type: 'Salvage',
    size: 1,
    force: 400000,
    range: 45,
    angle: 25,
    powerDraw: 45,
    price: 8500,
    inGame: true,
    compatible: ['Vulture', 'Reclaimer'],
    description: 'Le Salvage Grip optimise la prise en main des débris lors des opérations de récupération. Sa portée étendue compense sa force modérée.',
  },

  // ── Argo Astronautics — Cargo ────────────────────────────────────────────
  {
    id: 'argo-cargo-lift-s1',
    name: 'Argo Cargo Lift S1',
    manufacturer: 'Argo Astronautics',
    type: 'Cargo',
    size: 1,
    force: 220000,
    range: 40,
    angle: 30,
    powerDraw: 40,
    price: 6200,
    inGame: true,
    compatible: ['ARGO MPUV Cargo', 'C1 Spirit', 'Cutlass Black'],
    description: 'Tracteur cargo léger d\'Argo. Conçu pour les opérations de chargement/déchargement rapides en station ou sur pad. Angle large pour flexibilité.',
  },
  {
    id: 'argo-cargo-lift-s2',
    name: 'Argo Cargo Lift S2',
    manufacturer: 'Argo Astronautics',
    type: 'Cargo',
    size: 2,
    force: 600000,
    range: 65,
    angle: 32,
    powerDraw: 95,
    price: 24000,
    inGame: true,
    compatible: ['ARGO MPUV Cargo', 'Freelancer MAX', 'Caterpillar'],
    description: 'Tracteur cargo de taille 2. Force substantielle pour déplacer des conteneurs SCU moyens. Angle conique élargi facilite la précision.',
  },
  {
    id: 'argo-cargo-lift-s3',
    name: 'Argo Cargo Lift S3',
    manufacturer: 'Argo Astronautics',
    type: 'Cargo',
    size: 3,
    force: 1200000,
    range: 90,
    angle: 35,
    powerDraw: 180,
    price: 58000,
    inGame: true,
    compatible: ['Hull C', 'Caterpillar', 'Banu Merchantman'],
    description: 'Version lourde du tracteur Argo. Capable de déplacer des conteneurs 32 SCU. Référence du fret spatial pour gros tonnage.',
  },

  // ── MISC — Utility ────────────────────────────────────────────────────────
  {
    id: 'misc-beam-tow-s1',
    name: 'MISC Beam Tow S1',
    manufacturer: 'MISC',
    type: 'Utility',
    size: 1,
    force: 280000,
    range: 50,
    angle: 18,
    powerDraw: 50,
    price: 9800,
    inGame: true,
    compatible: ['Prospector', 'Freelancer', 'Starfarer'],
    description: 'Tracteur utilitaire polyvalent de MISC. Excellent pour le remorquage de petits vaisseaux en détresse et le positionnement de modules.',
  },
  {
    id: 'misc-beam-tow-s2',
    name: 'MISC Beam Tow S2',
    manufacturer: 'MISC',
    type: 'Utility',
    size: 2,
    force: 700000,
    range: 75,
    angle: 20,
    powerDraw: 120,
    price: 31000,
    inGame: true,
    compatible: ['Starfarer Gemini', 'Hull C'],
    description: 'Tracteur de remorquage taille 2 de MISC. Portée supérieure à 75m pour les opérations en orbite haute. Idéal SAR.',
  },

  // ── Drake Interplanetary — Ship-mounted ───────────────────────────────────
  {
    id: 'drake-hold-fast-s1',
    name: 'Hold-Fast S1',
    manufacturer: 'Drake Interplanetary',
    type: 'Ship-mounted',
    size: 1,
    force: 320000,
    range: 38,
    angle: 15,
    powerDraw: 55,
    price: 7400,
    inGame: true,
    compatible: ['Caterpillar', 'Cutlass Black', 'Corsair'],
    description: 'Tracteur vaisseau Drake au style brutalement efficace. Conçu pour l\'immobilisation forcée de petites cibles. Angle réduit pour précision.',
  },
  {
    id: 'drake-hold-fast-s2',
    name: 'Hold-Fast S2',
    manufacturer: 'Drake Interplanetary',
    type: 'Ship-mounted',
    size: 2,
    force: 750000,
    range: 60,
    angle: 18,
    powerDraw: 130,
    price: 28000,
    inGame: true,
    compatible: ['Caterpillar', 'Corsair'],
    description: 'Version renforcée du Hold-Fast. Destiné aux opérations de piraterie défensive ou à l\'assistance forcée des cibles.',
  },

  // ── Consolidated Outland — Cargo ──────────────────────────────────────────
  {
    id: 'co-lift-s1',
    name: 'CO Lift Beam S1',
    manufacturer: 'Consolidated Outland',
    type: 'Cargo',
    size: 1,
    force: 190000,
    range: 35,
    angle: 28,
    powerDraw: 38,
    price: 5200,
    inGame: true,
    compatible: ['Mustang Delta', 'HoverQuad', 'Pioneer'],
    description: 'Tracteur cargo budget de Consolidated Outland. Force limitée mais prix compétitif. Adapté aux opérations de livraison légère.',
  },

  // ── Origin Jumpworks — Utility ────────────────────────────────────────────
  {
    id: 'origin-precision-beam-s1',
    name: 'Origin Precision Beam S1',
    manufacturer: 'Origin Jumpworks',
    type: 'Utility',
    size: 1,
    force: 260000,
    range: 48,
    angle: 22,
    powerDraw: 42,
    price: 14200,
    inGame: true,
    compatible: ['890 Jump', '600i Explorer', '300i'],
    description: 'Tracteur de luxe d\'Origin. Finitions premium, contrôle de précision millimétrique. Pour ceux qui ne font aucun compromis sur la qualité.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const TRACTOR_TYPES_ALL = ['Tous', 'Salvage', 'Cargo', 'Utility', 'Ship-mounted'];
export const TRACTOR_SIZES_ALL = [1, 2, 3, 4];

/** Returns tractor beams sorted by force descending */
export function getTractorBeamsSorted() {
  return [...TRACTOR_BEAMS].sort((a, b) => b.force - a.force);
}

/** Max stats for normalization */
export const TRACTOR_MAX = {
  force: 1200000,
  range: 90,
  angle: 35,
  powerDraw: 180,
};
