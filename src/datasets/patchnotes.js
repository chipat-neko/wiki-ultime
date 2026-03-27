/**
 * Dataset centralisé des patchnotes Star Citizen
 *
 * Chaque version contient :
 * - version : numéro de version (ex: '4.7')
 * - date    : date de sortie
 * - title   : titre court du patch
 * - summary : résumé du patch
 * - highlights : points marquants (affichés en héro)
 * - changes : tableau de changements groupés par catégorie
 *
 * Chaque change :
 * - category : clé de catégorie ('ships', 'weapons', 'missions', 'locations', etc.)
 * - type     : 'added' | 'changed' | 'fixed' | 'removed'
 * - items    : [{ id, name, description?, link? }]
 *
 * Le hook usePatchInfo() utilise ces données pour afficher des badges "Nouveau X.Y"
 * dans les modules concernés.
 */

// ── Catégories de changements ────────────────────────────────────────────────
export const PATCH_CATEGORIES = {
  ships:       { label: 'Vaisseaux',           icon: 'Rocket',          color: 'cyan'   },
  vehicles:    { label: 'Véhicules',           icon: 'Car',             color: 'green'  },
  weapons:     { label: 'Armes de Vaisseaux',  icon: 'Target',          color: 'red'    },
  fps:         { label: 'Équipement FPS',      icon: 'Crosshair',      color: 'orange' },
  components:  { label: 'Composants',          icon: 'Cpu',             color: 'purple' },
  missions:    { label: 'Missions',            icon: 'ClipboardList',   color: 'yellow' },
  locations:   { label: 'Lieux & Systèmes',    icon: 'Globe',           color: 'blue'   },
  trade:       { label: 'Commerce',            icon: 'TrendingUp',      color: 'emerald'},
  mechanics:   { label: 'Mécaniques de Jeu',   icon: 'Wrench',          color: 'slate'  },
  events:      { label: 'Événements',          icon: 'Bell',            color: 'pink'   },
  factions:    { label: 'Factions',            icon: 'Shield',          color: 'amber'  },
  other:       { label: 'Autres',              icon: 'Star',            color: 'gray'   },
};

// ── Patchnotes par version (du plus récent au plus ancien) ───────────────────
export const PATCH_NOTES = [
  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  ALPHA 4.7 — Dernière mise à jour                                       ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  {
    version: '4.7',
    date: '2026-03-25',
    title: 'Alpha 4.7 — Frontier Expansion',
    summary: 'Nouveau système Nyx accessible, introduction du tractor beam multi-joueur, nouveaux vaisseaux et armes, refonte des missions de livraison.',
    highlights: [
      'Système Nyx entièrement jouable',
      'Tractor Beam coopératif multi-joueur',
      'RSI Apollo medic ship pilotable',
      'Refonte complète des missions de livraison',
    ],
    changes: [
      {
        category: 'ships',
        type: 'added',
        items: [
          { id: 'rsi-apollo-triage',  name: 'RSI Apollo Triage',    description: 'Vaisseau médical de terrain, 2 lits médicaux T2', link: '/vaisseaux/rsi-apollo-triage' },
          { id: 'rsi-apollo-medivac', name: 'RSI Apollo Medivac',   description: 'Version évacuation médicale, 1 lit T1 + 1 lit T3', link: '/vaisseaux/rsi-apollo-medivac' },
          { id: 'aegis-sabre-raven',  name: 'Aegis Sabre Raven',    description: 'Variante furtive du Sabre, EMP intégré', link: '/vaisseaux/aegis-sabre-raven' },
        ],
      },
      {
        category: 'ships',
        type: 'changed',
        items: [
          { id: 'drake-cutlass-black', name: 'Drake Cutlass Black', description: 'Nouveau modèle intérieur, cockpit reworké' },
          { id: 'misc-freelancer',     name: 'MISC Freelancer',     description: 'Rework complet du cockpit et de la soute' },
        ],
      },
      {
        category: 'locations',
        type: 'added',
        items: [
          { id: 'nyx',          name: 'Système Nyx',        description: 'Nouveau système stellaire complet avec 3 planètes', link: '/systemes' },
          { id: 'levski',       name: 'Levski',             description: "Station d'atterrissage dans l'astéroïde Delamar (Nyx)", link: '/systemes/stations' },
          { id: 'nyx-asteroid', name: 'Ceinture d\'Astéroïdes Nyx', description: 'Zone de minage et de piraterie', link: '/locations' },
        ],
      },
      {
        category: 'missions',
        type: 'added',
        items: [
          { id: 'delivery-nyx',    name: 'Livraisons Nyx',           description: 'Nouvelles missions de livraison vers/depuis Levski' },
          { id: 'bounty-nyx',      name: 'Primes Nyx',               description: 'Contrats de primes dans le système Nyx' },
          { id: 'investigation-4', name: 'Investigation Delamar',     description: 'Nouvelle chaîne d\'enquête sur Delamar' },
        ],
      },
      {
        category: 'missions',
        type: 'changed',
        items: [
          { id: 'delivery-standard', name: 'Livraison Standard', description: 'Refonte complète : multi-colis, tracking, pénalités de retard' },
          { id: 'delivery-express',  name: 'Livraison Express',  description: 'Timer plus serré, récompenses doublées' },
        ],
      },
      {
        category: 'mechanics',
        type: 'added',
        items: [
          { id: 'tractor-beam-mp', name: 'Tractor Beam Multi-Joueur', description: 'Utilisation coopérative du tractor beam pour déplacer de gros objets', link: '/outils' },
          { id: 'cargo-refactor',  name: 'Cargo Refactor v2',         description: 'Chargement physique des caisses amélioré, empilage automatique' },
        ],
      },
      {
        category: 'fps',
        type: 'added',
        items: [
          { id: 'br-2-ballistic', name: 'BR-2 Ballistic Shotgun',   description: 'Nouveau shotgun Behring, dégâts massifs courte portée', link: '/equipement' },
          { id: 'electron-smg',   name: 'Electron SMG',              description: 'SMG energy de Klaus & Werner, haute cadence', link: '/equipement' },
        ],
      },
      {
        category: 'weapons',
        type: 'changed',
        items: [
          { id: 'cf-227-panther', name: 'CF-227 Panther Repeater', description: 'Dégâts augmentés de 8%, surchauffe réduite' },
          { id: 'mv-atavism',     name: 'Atavism NDB',             description: 'Portée effective augmentée à 2800m' },
        ],
      },
      {
        category: 'trade',
        type: 'changed',
        items: [
          { id: 'trade-terminals', name: 'Terminaux de Commerce', description: 'Nouveaux terminaux à Levski, prix dynamiques Nyx' },
          { id: 'commodity-gold',  name: 'Or (Gold)',             description: 'Nouvel ajout à Nyx, prix élevé, haute demande' },
        ],
      },
      {
        category: 'events',
        type: 'added',
        items: [
          { id: 'nyx-liberation', name: 'Libération de Nyx', description: 'Événement dynamique : conflit territorial à Nyx', link: '/evenements' },
        ],
      },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  ALPHA 4.6                                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  {
    version: '4.6',
    date: '2026-01-15',
    title: 'Alpha 4.6 — Dawn of Engineering',
    summary: "Introduction du système d'engineering, artisanat NPC via Wikelo, nouveaux composants et vaisseaux.",
    highlights: [
      "Système d'Engineering (Dawn of Engineering)",
      'Artisanat NPC Wikelo avec blueprints',
      'Nouveaux composants et propulseurs QT',
      'Missions ASD Research & Onyx Facilities',
    ],
    changes: [
      {
        category: 'mechanics',
        type: 'added',
        items: [
          { id: 'engineering',   name: 'Système Engineering',      description: 'Gestion des systèmes vaisseau en temps réel', link: '/engineering' },
          { id: 'wikelo-craft',  name: 'Artisanat Wikelo',         description: 'Fabrication d\'items via NPC avec blueprints', link: '/artisanat' },
        ],
      },
      {
        category: 'missions',
        type: 'added',
        items: [
          { id: 'asd-research',       name: 'ASD Research Missions', description: 'Missions scientifiques haute réputation' },
          { id: 'onyx-facilities',     name: 'Onyx Facilities',      description: 'Nouvelles installations à explorer' },
          { id: 'nyx-levski-delivery', name: 'Livraisons Nyx/Levski', description: 'Premières missions de livraison vers Nyx' },
        ],
      },
      {
        category: 'components',
        type: 'added',
        items: [
          { id: 'qt-atlas',     name: 'Atlas QT Drive',     description: 'Nouveau propulseur QT grande vitesse', link: '/qt-drives' },
        ],
      },
      {
        category: 'fps',
        type: 'changed',
        items: [
          { id: 'p4-ar',    name: 'P4-AR',    description: 'Recul réduit, meilleure précision ADS' },
          { id: 'gallant',  name: 'Gallant',   description: 'Dégâts de base augmentés de 5%' },
        ],
      },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  ALPHA 4.5                                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  {
    version: '4.5',
    date: '2025-10-10',
    title: 'Alpha 4.5 — Pyro Frontier',
    summary: 'Ouverture du système Pyro via jump point depuis Stanton, nouvelles missions pirates, salvage amélioré.',
    highlights: [
      'Système Pyro accessible',
      'Jump Point Stanton ↔ Pyro',
      'Salvage v2 avec outils améliorés',
      'Nouveau vaisseau Drake Ironclad',
    ],
    changes: [
      {
        category: 'locations',
        type: 'added',
        items: [
          { id: 'pyro',       name: 'Système Pyro',    description: 'Premier nouveau système accessible', link: '/systemes' },
          { id: 'jump-point', name: 'Jump Point',       description: 'Point de saut Stanton ↔ Pyro', link: '/routes' },
        ],
      },
      {
        category: 'ships',
        type: 'added',
        items: [
          { id: 'drake-ironclad', name: 'Drake Ironclad',    description: 'Cargo lourd 684 SCU', link: '/vaisseaux/drake-ironclad' },
          { id: 'mirai-fury-mx',  name: 'Mirai Fury MX',     description: 'Ultra-léger parasite', link: '/vaisseaux/mirai-fury-mx' },
        ],
      },
      {
        category: 'mechanics',
        type: 'changed',
        items: [
          { id: 'salvage-v2', name: 'Salvage v2', description: 'Outils améliorés, nouveaux matériaux récupérables', link: '/salvage' },
        ],
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Renvoie la dernière version disponible */
export function getLatestVersion() {
  return PATCH_NOTES[0]?.version ?? null;
}

/** Renvoie les patchnotes d'une version donnée */
export function getPatchByVersion(version) {
  return PATCH_NOTES.find(p => p.version === version) ?? null;
}

/**
 * Construit un index rapide { category → { itemId → { version, type } } }
 * pour lookup O(1) dans les modules.
 */
export function buildPatchIndex() {
  const index = {};
  for (const patch of PATCH_NOTES) {
    for (const change of patch.changes) {
      if (!index[change.category]) index[change.category] = {};
      for (const item of change.items) {
        // On garde la version la plus récente si un item apparaît dans plusieurs patches
        if (!index[change.category][item.id] || patch.version > index[change.category][item.id].version) {
          index[change.category][item.id] = {
            version: patch.version,
            type: change.type,
            name: item.name,
            description: item.description,
          };
        }
      }
    }
  }
  return index;
}

/**
 * Renvoie tous les items modifiés/ajoutés dans les N dernières versions
 * @param {number} count - nombre de versions à inclure (défaut: 1 = dernière uniquement)
 */
export function getRecentChanges(count = 1) {
  return PATCH_NOTES.slice(0, count);
}
