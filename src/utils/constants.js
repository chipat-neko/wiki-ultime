// ============================================================
// CONSTANTES DE L'APPLICATION
// ============================================================

export const APP_NAME = 'Star Citizen Companion';
export const APP_VERSION = '1.0.0';

// ============================================================
// CATEGORIES DE VAISSEAUX
// ============================================================

export const SHIP_ROLES = {
  FIGHTER: 'Chasseur',
  HEAVY_FIGHTER: 'Chasseur Lourd',
  INTERCEPTOR: 'Intercepteur',
  BOMBER: 'Bombardier',
  FRIGATE: 'Frégate',
  CAPITAL: 'Capital',
  EXPLORER: 'Explorateur',
  FREIGHTER: 'Cargo',
  HEAVY_FREIGHTER: 'Cargo Lourd',
  MINING: 'Mineur',
  SALVAGE: 'Sauvetage',
  MEDICAL: 'Médical',
  REFUEL: 'Ravitailleur',
  MULTI_ROLE: 'Multi-Rôle',
  SUPPORT: 'Support',
  RACING: 'Course',
  STEALTH: 'Furtif',
  INDUSTRIAL: 'Industriel',
  LUXURY: 'Luxe',
  STARTER: 'Débutant',
};

export const SHIP_SIZES = {
  SNUB: 'Nain',
  SMALL: 'Petit',
  MEDIUM: 'Moyen',
  LARGE: 'Grand',
  CAPITAL: 'Capital',
};

export const SHIP_MANUFACTURERS = {
  RSI: 'Roberts Space Industries',
  AEGIS: 'Aegis Dynamics',
  DRAKE: 'Drake Interplanetary',
  MISC: 'Musashi Industrial & Starflight Concern',
  ORIGIN: 'Origin Jumpworks',
  CRUSADER: 'Crusader Industries',
  ANVIL: 'Anvil Aerospace',
  BANU: 'Banu',
  ESPERIA: 'Esperia',
  ARGO: 'Argo Astronautics',
  TUMBRIL: 'Tumbril Land Systems',
  CONSOLIDATED: 'Consolidated Outland',
  CNOU: 'Consolidated Outland',
  GATAC: 'Gatac Manufacture',
  MIRAI: 'Mirai',
  KRUGER: 'Kruger Intergalactic',
  AOPOA: "Aopoa (Xi'an)",
};

// ============================================================
// SYSTEMES STELLAIRES
// ============================================================

export const STAR_SYSTEMS = {
  STANTON: 'Stanton',
  PYRO: 'Pyro',
  TERRA: 'Terra',
  SOL: 'Sol',
  MAGNUS: 'Magnus',
  NYX: 'Nyx',
  ODIN: 'Odin',
  BANSHEE: 'Banshee',
  CASTRA: 'Castra',
  NEXUS: 'Nexus',
  CROSHAW: 'Croshaw',
  TANGAROA: 'Tangaroa',
};

export const LOCATION_TYPES = {
  PLANET: 'Planète',
  MOON: 'Lune',
  STATION: 'Station',
  CITY: 'Ville',
  OUTPOST: 'Avant-poste',
  ASTEROID: 'Astéroïde',
  LAGRANGE: 'Point de Lagrange',
  JUMP_POINT: 'Point de Saut',
};

// ============================================================
// COMMODITES
// ============================================================

export const COMMODITY_CATEGORIES = {
  AGRICULTURAL: 'Agricole',
  MEDICAL: 'Médical',
  METAL: 'Métal',
  MINERAL: 'Minéral',
  VICE: 'Vice',
  INDUSTRIAL: 'Industriel',
  ELECTRONIC: 'Électronique',
  FOOD: 'Alimentaire',
  FUEL: 'Carburant',
  ILLEGAL: 'Illégal',
  LUXURY: 'Luxe',
  WASTE: 'Déchet',
  QUANTUM_FUEL: 'Carburant Quantique',
  RAW: 'Brut',
};

// ============================================================
// MISSIONS
// ============================================================

export const MISSION_TYPES = {
  DELIVERY: 'Livraison',
  BOUNTY: 'Chasse à la Prime',
  MINING: 'Extraction',
  SALVAGE: 'Sauvetage/Récupération',
  ESCORT: 'Escorte',
  PATROL: 'Patrouille',
  ASSASSINATION: 'Assassinat',
  SEARCH_RESCUE: 'Recherche & Sauvetage',
  CARGO_HAULING: 'Transport de Cargo',
  DATA_RUN: 'Course de Données',
  PIRACY: 'Piraterie',
  INVESTIGATION: 'Investigation',
  ILLEGAL_DELIVERY: 'Livraison Illégale',
};

export const MISSION_DIFFICULTIES = {
  EASY: 'Facile',
  MEDIUM: 'Moyen',
  HARD: 'Difficile',
  VERY_HARD: 'Très Difficile',
  EXTREME: 'Extrême',
};

// ============================================================
// FACTIONS
// ============================================================

export const FACTION_TYPES = {
  GOVERNMENT: 'Gouvernement',
  CORPORATION: 'Corporation',
  CRIMINAL: 'Criminel',
  ALIEN: 'Alien',
  MILITARY: 'Militaire',
  MERCENARY: 'Mercenaire',
  CIVILIAN: 'Civil',
  PIRATE: 'Pirate',
};

export const FACTION_ALIGNMENTS = {
  LAWFUL: 'Légal',
  NEUTRAL: 'Neutre',
  UNLAWFUL: 'Hors-la-loi',
};

// ============================================================
// STATUTS
// ============================================================

export const STATUSES = {
  ONLINE: { label: 'En ligne', color: 'success' },
  OFFLINE: { label: 'Hors ligne', color: 'danger' },
  MAINTENANCE: { label: 'Maintenance', color: 'warning' },
  ACTIVE: { label: 'Actif', color: 'success' },
  INACTIVE: { label: 'Inactif', color: 'danger' },
  AVAILABLE: { label: 'Disponible', color: 'success' },
  OCCUPIED: { label: 'Occupé', color: 'warning' },
};

// ============================================================
// PAGINATION
// ============================================================

export const PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

// ============================================================
// DELAIS (ms)
// ============================================================

export const DEBOUNCE_SEARCH = 300;
export const DEBOUNCE_FILTER = 200;
export const API_TIMEOUT = 10000;
export const CACHE_TTL_SHORT = 60 * 1000;       // 1 minute
export const CACHE_TTL_MEDIUM = 5 * 60 * 1000;  // 5 minutes
export const CACHE_TTL_LONG = 30 * 60 * 1000;   // 30 minutes
export const CACHE_TTL_DAY = 24 * 60 * 60 * 1000; // 24 heures

// ============================================================
// COULEURS PAR TYPE
// ============================================================

export const ROLE_COLORS = {
  'Chasseur': 'text-danger-400',
  'Chasseur Lourd': 'text-danger-400',
  'Intercepteur': 'text-orange-400',
  'Bombardier': 'text-red-500',
  'Frégate': 'text-purple-400',
  'Capital': 'text-purple-500',
  'Explorateur': 'text-blue-400',
  'Cargo': 'text-green-400',
  'Cargo Lourd': 'text-green-500',
  'Mineur': 'text-yellow-400',
  'Sauvetage': 'text-orange-300',
  'Médical': 'text-cyan-400',
  'Ravitailleur': 'text-teal-400',
  'Multi-Rôle': 'text-slate-300',
  'Support': 'text-blue-300',
  'Course': 'text-yellow-300',
  'Furtif': 'text-gray-300',
  'Industriel': 'text-amber-400',
  'Luxe': 'text-gold-400',
  'Débutant': 'text-slate-400',
};

export const SIZE_BADGES = {
  'Nain': 'bg-slate-700 text-slate-200',
  'Petit': 'bg-blue-900/50 text-blue-300',
  'Moyen': 'bg-cyan-900/50 text-cyan-300',
  'Grand': 'bg-purple-900/50 text-purple-300',
  'Capital': 'bg-red-900/50 text-red-300',
};

export const FACTION_COLORS = {
  Légal: 'text-success-400',
  Neutre: 'text-warning-400',
  'Hors-la-loi': 'text-danger-400',
};
