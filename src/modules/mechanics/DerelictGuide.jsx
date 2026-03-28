import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Anchor, AlertTriangle, MapPin, ChevronDown, ChevronUp,
  Search, Package, Skull, Ship, Compass, Star, Zap,
  Eye, Shield, Crosshair, Info, BookOpen, Layers,
  Wrench, Wind, Flashlight, Database, Gem, HardDrive,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Types d'épaves
══════════════════════════════════════════════════════════════ */

const WRECK_TYPES = [
  {
    id: 'static',
    icon: Anchor,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    name: 'Épaves Statiques',
    description: 'Points d\'intérêt fixes sur les planètes et lunes. Toujours présentes au même endroit, le loot respawn périodiquement après un certain temps.',
    features: ['Position fixe sur la carte', 'Loot respawn toutes les ~30 min', 'Pas d\'hostiles (en général)', 'Idéal pour les débutants'],
    danger: 'Faible',
    dangerBadge: 'badge-green',
    tips: 'Marquez ces positions en favori — elles sont fiables pour farmer du loot régulièrement.',
  },
  {
    id: 'dynamic',
    icon: Zap,
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    name: 'Épaves Dynamiques',
    description: 'Générées par des événements en jeu : batailles spatiales, embuscades, crashes aléatoires. Temporaires et disparaissent après un certain temps.',
    features: ['Apparaissent après des événements', 'Durée limitée (~15–45 min)', 'Loot souvent meilleur', 'Possibilité de hostiles à proximité'],
    danger: 'Moyen',
    dangerBadge: 'badge-yellow',
    tips: 'Surveillez les comm arrays et les alertes scanner — les événements génèrent souvent des épaves exploitables.',
  },
  {
    id: 'abandoned',
    icon: Ship,
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    name: 'Vaisseaux Abandonnés',
    description: 'Vaisseaux NPC désactivés flottant dans l\'espace ou posés en surface. Certains peuvent être récupérés et pilotés temporairement.',
    features: ['Récupérables (certains)', 'Cargo parfois intact', 'Composants détachables', 'Peuvent contenir des data drives'],
    danger: 'Variable',
    dangerBadge: 'badge-blue',
    tips: 'Approchez avec prudence — certains vaisseaux "abandonnés" sont en réalité des pièges avec des hostiles à bord.',
  },
  {
    id: 'reclaimer',
    icon: Wrench,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    name: 'Épaves Industrielles (Reclaimer)',
    description: 'Gigantesques carcasses de vaisseaux capitaux ou industriels. Environnements complexes multi-niveaux, idéaux pour le salvage avec Vulture ou Reclaimer.',
    features: ['Structures massives multi-niveaux', 'Énorme potentiel de salvage', 'Exploration longue (30+ min)', 'Meilleur loot du jeu'],
    danger: 'Élevé',
    dangerBadge: 'badge-red',
    tips: 'Prévoyez beaucoup d\'oxygène et de soins — ces épaves sont grandes et sans atmosphère.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tables de loot
══════════════════════════════════════════════════════════════ */

const LOOT_TABLES = [
  {
    id: 'weapons',
    icon: Crosshair,
    color: 'text-cyan-400',
    name: 'Armes FPS',
    items: [
      { name: 'P4-AR (Assault Rifle)', rarity: 'Commun', value: '~1 200 aUEC' },
      { name: 'Demeco LMG', rarity: 'Peu commun', value: '~2 800 aUEC' },
      { name: 'Scalpel Sniper Rifle', rarity: 'Rare', value: '~4 500 aUEC' },
      { name: 'Atzkav Sniper (énergie)', rarity: 'Très rare', value: '~6 000 aUEC' },
      { name: 'FS-9 LMG', rarity: 'Rare', value: '~3 800 aUEC' },
      { name: 'Lumin V SMG', rarity: 'Peu commun', value: '~1 800 aUEC' },
    ],
  },
  {
    id: 'armor',
    icon: Shield,
    color: 'text-purple-400',
    name: 'Armures',
    items: [
      { name: 'Sets Subscriber (exclusifs)', rarity: 'Très rare', value: '~15 000 aUEC' },
      { name: 'Arden Armor Set (lourd)', rarity: 'Rare', value: '~9 000 aUEC' },
      { name: 'ORC-mkX Armor Set', rarity: 'Rare', value: '~8 500 aUEC' },
      { name: 'Odyssey II Flight Suit', rarity: 'Peu commun', value: '~4 000 aUEC' },
      { name: 'Casques rares (Calva, Dust Up)', rarity: 'Rare', value: '3 000–7 000 aUEC' },
    ],
  },
  {
    id: 'components',
    icon: HardDrive,
    color: 'text-green-400',
    name: 'Composants Vaisseaux',
    items: [
      { name: 'Power Plants (Grade A)', rarity: 'Rare', value: '~12 000 aUEC' },
      { name: 'Shield Generators (Grade A)', rarity: 'Rare', value: '~10 000 aUEC' },
      { name: 'Quantum Drives (Grade B+)', rarity: 'Peu commun', value: '~8 000 aUEC' },
      { name: 'Coolers industriels', rarity: 'Peu commun', value: '~5 000 aUEC' },
      { name: 'Armes de vaisseau (S1-S3)', rarity: 'Peu commun', value: '2 000–6 000 aUEC' },
    ],
  },
  {
    id: 'datadrives',
    icon: Database,
    color: 'text-yellow-400',
    name: 'Data Drives',
    items: [
      { name: 'Data Drive (crypté)', rarity: 'Rare', value: '~8 000 aUEC' },
      { name: 'Data Drive (mission)', rarity: 'Peu commun', value: '~3 000 aUEC' },
      { name: 'Data Drive (livraison spéciale)', rarity: 'Rare', value: '~5 000 aUEC' },
      { name: 'Black Box (boîte noire)', rarity: 'Très rare', value: '~12 000 aUEC' },
    ],
  },
  {
    id: 'valuables',
    icon: Gem,
    color: 'text-gold-400',
    name: 'Objets de Valeur',
    items: [
      { name: 'Gemmes (Hadanite brut)', rarity: 'Rare', value: '5 000–15 000 aUEC' },
      { name: 'Antiquités alien', rarity: 'Très rare', value: '10 000–25 000 aUEC' },
      { name: 'Composants rares (reliques)', rarity: 'Très rare', value: '8 000–20 000 aUEC' },
      { name: 'Puces mémoire cryptées', rarity: 'Rare', value: '~4 000 aUEC' },
      { name: 'Matériaux de contrebande', rarity: 'Peu commun', value: '1 000–5 000 aUEC' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Localisations connues
══════════════════════════════════════════════════════════════ */

const WRECK_LOCATIONS = [
  {
    system: 'Stanton',
    icon: '⭐',
    locations: [
      {
        planet: 'Daymar',
        color: 'text-yellow-400',
        border: 'border-yellow-500/30',
        wrecks: [
          { name: 'Épaves de grottes (Cave Wrecks)', type: 'Statique', description: 'Débris de vaisseaux dans les réseaux de grottes. Loot FPS et data drives.' },
          { name: 'Javelin Wreck', type: 'Statique', description: 'Carcasse d\'un Javelin destroyer. Exploration massive, excellent loot.' },
          { name: 'Camps de fortune', type: 'Statique', description: 'Petits campements abandonnés avec caisses de loot.' },
        ],
      },
      {
        planet: 'Yela',
        color: 'text-cyan-400',
        border: 'border-cyan-500/30',
        wrecks: [
          { name: 'Drug Lab Wrecks', type: 'Statique', description: 'Épaves autour des labos clandestins. Risque de hostiles et de contrebande.' },
          { name: 'Astéroïdes — débris', type: 'Dynamique', description: 'Fragments de vaisseaux dans la ceinture d\'astéroïdes de Yela.' },
          { name: 'Stations abandonnées Yela', type: 'Statique', description: 'Petites structures désaffectées en surface avec loot variable.' },
        ],
      },
      {
        planet: 'Hurston',
        color: 'text-orange-400',
        border: 'border-orange-500/30',
        wrecks: [
          { name: 'Surface Wrecks (plaines)', type: 'Statique', description: 'Vaisseaux écrasés dans les plaines. Faciles d\'accès, loot moyen.' },
          { name: 'HDMS Wrecks', type: 'Statique', description: 'Débris industriels autour des installations HDMS.' },
          { name: 'Épaves de Caterpillar', type: 'Dynamique', description: 'Carcasses de Caterpillar suite à des embuscades de sécurité.' },
        ],
      },
    ],
  },
  {
    system: 'Crusader (Espace)',
    icon: '🌌',
    locations: [
      {
        planet: 'Orbite & Points de saut',
        color: 'text-blue-400',
        border: 'border-blue-500/30',
        wrecks: [
          { name: 'Champs de débris orbitaux', type: 'Statique', description: 'Vastes zones de débris en orbite. Excellent pour le salvage.' },
          { name: 'Stations détruites (Comm Arrays)', type: 'Dynamique', description: 'Comm Arrays désactivés entourés de débris exploitables.' },
          { name: 'Épaves de batailles PvE', type: 'Dynamique', description: 'Restes de combats entre NPC. Loot et composants récupérables.' },
        ],
      },
    ],
  },
  {
    system: 'Pyro',
    icon: '🔥',
    locations: [
      {
        planet: 'Pyro (Général)',
        color: 'text-red-400',
        border: 'border-red-500/30',
        wrecks: [
          { name: 'Wreck Fields (champs d\'épaves)', type: 'Statique', description: 'Zones massives de vaisseaux détruits. Loot rare mais environnement hostile.' },
          { name: 'Avant-postes abandonnés', type: 'Statique', description: 'Bases désertées par les factions. Data drives et équipement militaire.' },
          { name: 'Convois détruits', type: 'Dynamique', description: 'Restes de convois marchands attaqués par les pirates de Pyro.' },
          { name: 'Épaves de Ruin Station', type: 'Statique', description: 'Débris flottants autour de Ruin Station. Danger extrême mais loot premium.' },
        ],
      },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Conseils d'exploration
══════════════════════════════════════════════════════════════ */

const EXPLORATION_TIPS = [
  {
    id: 'scanner',
    icon: Search,
    title: 'Utilisation du Scanner',
    content: [
      'Activez le scanner longue portée (TAB) pour détecter les signatures de vaisseaux à distance.',
      'Les épaves émettent une signature IR résiduelle — elles apparaissent comme des contacts faibles sur le scanner.',
      'Utilisez le ping actif pour révéler les épaves cachées dans les champs d\'astéroïdes.',
      'Le scanner de minage peut aussi détecter des matériaux récupérables sur les épaves.',
      'Affinez le scan en vous rapprochant — les détails apparaissent sous 2 000 m.',
    ],
  },
  {
    id: 'eva',
    icon: Wind,
    title: 'Navigation EVA dans les Épaves',
    content: [
      'Passez en EVA (mode zéro-G) pour explorer l\'intérieur des épaves sans atmosphère.',
      'Utilisez les propulseurs doucement — les collisions en EVA peuvent être fatales.',
      'La lampe torche (T) est indispensable dans les épaves sombres.',
      'Repérez votre point d\'entrée avant d\'explorer — il est facile de se perdre dans une grande épave.',
      'Surveillez votre jauge d\'oxygène — les épaves n\'ont pas de renouvellement d\'air.',
    ],
  },
  {
    id: 'dangers',
    icon: AlertTriangle,
    title: 'Dangers & Précautions',
    content: [
      'Manque d\'oxygène : emportez au moins 2 OxyPens pour les explorations prolongées.',
      'Hostiles : certaines épaves sont occupées par des pirates ou des squatteurs NPC.',
      'Pièges : des mines et charges explosives peuvent être placées aux entrées.',
      'Autres joueurs : les épaves attirent aussi les pillards PvP — restez vigilant.',
      'Dépressurisation : les brèches dans la coque peuvent éjecter votre personnage dans le vide.',
      'Radiation : certaines épaves à Pyro émettent des radiations — portez une armure adaptée.',
    ],
  },
  {
    id: 'salvage',
    icon: Wrench,
    title: 'Intégration Salvage',
    content: [
      'Le Vulture (Drake) est le vaisseau solo idéal pour récupérer les matériaux des épaves.',
      'Le Reclaimer (Aegis) permet de traiter des épaves entières mais nécessite un équipage.',
      'Utilisez le Multitool avec le module de réparation/salvage pour extraire les composants manuellement.',
      'Le RMC (Recycled Material Composite) est la ressource principale du salvage — revendez-le aux stations.',
      'Priorisez les coques intactes : plus la structure est grande, plus le RMC récupéré est important.',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Vaisseaux recommandés
══════════════════════════════════════════════════════════════ */

const RECOMMENDED_SHIPS = [
  {
    category: 'Solo (Exploration + Combat)',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    ships: [
      { name: 'Cutlass Black', manufacturer: 'Drake', why: 'Polyvalent : cargo 46 SCU, bon armement, rampe arrière pratique pour le loot.' },
      { name: 'Freelancer', manufacturer: 'MISC', why: 'Cargo 66 SCU, tourelle, autonomie élevée. Parfait pour les runs loot longue distance.' },
      { name: 'Constellation Taurus', manufacturer: 'RSI', why: 'Cargo massif (174 SCU), bonne défense. Pour rapporter beaucoup de butin.' },
    ],
  },
  {
    category: 'Salvage (Spécialisé)',
    color: 'text-green-400',
    border: 'border-green-500/30',
    ships: [
      { name: 'Vulture', manufacturer: 'Drake', why: 'Vaisseau salvage solo. Compact, efficace, idéal pour démanteler les petites épaves.' },
      { name: 'Reclaimer', manufacturer: 'Aegis', why: 'Capital salvage (multi-équipage). Peut avaler des épaves entières. Le roi du salvage.' },
    ],
  },
  {
    category: 'Exploration (Détection)',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    ships: [
      { name: 'Carrack', manufacturer: 'Anvil', why: 'Le meilleur explorateur : medbay, drones, scanner avancé, navette embarquée.' },
      { name: '315p', manufacturer: 'Origin', why: 'Explorateur léger et rapide. Scanner amélioré, faible coût d\'opération.' },
      { name: 'Terrapin', manufacturer: 'Anvil', why: 'Blindage exceptionnel et scanner longue portée. Parfait pour les zones dangereuses.' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tips pratiques
══════════════════════════════════════════════════════════════ */

const TIPS = [
  { icon: Eye, text: 'Scannez toujours une épave depuis votre vaisseau avant d\'y pénétrer — vérifiez la présence de signatures hostiles.' },
  { icon: Flashlight, text: 'La lampe torche (T) est indispensable. Les épaves sont souvent plongées dans le noir total.' },
  { icon: Wind, text: 'Vérifiez votre niveau d\'oxygène AVANT d\'entrer en EVA. Emportez au moins 2 OxyPens de secours.' },
  { icon: MapPin, text: 'Marquez l\'emplacement des épaves rentables avec un waypoint — elles respawnent leur loot après ~30 minutes.' },
  { icon: Package, text: 'Utilisez un sac à dos grande capacité (Pembroke, MacFlex) pour maximiser le loot transportable.' },
  { icon: Skull, text: 'Méfiez-vous des épaves "trop faciles" — les pirates PvP utilisent parfois les épaves comme appât.' },
  { icon: Wrench, text: 'Le Multitool avec module salvage permet d\'extraire des composants même sans vaisseau de salvage dédié.' },
  { icon: Star, text: 'Les épaves de Pyro ont le meilleur loot du jeu mais aussi le plus de danger — préparez-vous en conséquence.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Section dépliable
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, defaultOpen = false, children, iconColor = 'text-cyan-400' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-space-800/50 border border-space-400/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-space-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={clsx('w-5 h-5', iconColor)} />
          <span className="font-semibold text-slate-200">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Rarity Badge
══════════════════════════════════════════════════════════════ */

const RARITY_BADGE = {
  'Commun': 'badge-green',
  'Peu commun': 'badge-blue',
  'Rare': 'badge-yellow',
  'Très rare': 'badge-red',
  'Variable': 'badge-purple',
};

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function DerelictGuide() {
  const [expandedType, setExpandedType] = useState(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Anchor className="w-8 h-8 text-cyan-400" />
          Épaves & Vaisseaux Abandonnés
        </h1>
        <p className="text-slate-400 mt-2">
          Guide d'exploration des épaves dans Star Citizen
        </p>
      </div>

      {/* ── Types d'épaves ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          Types d'Épaves
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WRECK_TYPES.map((wt) => {
            const Icon = wt.icon;
            const isOpen = expandedType === wt.id;
            return (
              <div
                key={wt.id}
                className={clsx(
                  'bg-space-800/50 border rounded-lg overflow-hidden transition-all',
                  wt.border
                )}
              >
                <button
                  onClick={() => setExpandedType(isOpen ? null : wt.id)}
                  className="w-full text-left px-4 py-3 hover:bg-space-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={clsx('w-5 h-5', wt.color)} />
                      <span className="font-bold text-slate-200">{wt.name}</span>
                      <span className={clsx('badge text-xs', wt.dangerBadge)}>{wt.danger}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{wt.description}</p>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-space-400/20 pt-3 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Caractéristiques</div>
                      <ul className="space-y-1">
                        {wt.features.map((f, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-gold-400 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-space-900/50 rounded p-2.5 border border-space-400/10">
                      <div className="text-xs text-slate-300 flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-gold-400 flex-shrink-0" />
                        <span>{wt.tips}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Tables de Loot ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-green-400" />
          Tables de Loot
        </h2>
        <div className="space-y-3">
          {LOOT_TABLES.map((lt) => (
            <ExpandableSection key={lt.id} title={lt.name} icon={lt.icon} iconColor={lt.color}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-space-400/20 text-slate-400 text-xs uppercase tracking-wide">
                      <th className="px-3 py-2 text-left">Objet</th>
                      <th className="px-3 py-2 text-left">Rareté</th>
                      <th className="px-3 py-2 text-right">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lt.items.map((item, i) => (
                      <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                        <td className="px-3 py-2 text-slate-200">{item.name}</td>
                        <td className="px-3 py-2">
                          <span className={clsx('badge text-xs', RARITY_BADGE[item.rarity] || 'badge-blue')}>{item.rarity}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-gold-400 font-medium">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ── Localisations Connues ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-400" />
          Localisations Connues
        </h2>
        <div className="space-y-6">
          {WRECK_LOCATIONS.map((sys) => (
            <div key={sys.system}>
              <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <span>{sys.icon}</span> {sys.system}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sys.locations.map((loc) => (
                  <div key={loc.planet} className={clsx('bg-space-800/50 border rounded-lg p-4', loc.border)}>
                    <h4 className={clsx('font-bold mb-3', loc.color)}>{loc.planet}</h4>
                    <div className="space-y-2.5">
                      {loc.wrecks.map((w, i) => (
                        <div key={i} className="bg-space-900/50 rounded p-2.5 border border-space-400/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-200">{w.name}</span>
                            <span className={clsx('badge text-xs', w.type === 'Statique' ? 'badge-green' : 'badge-yellow')}>
                              {w.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{w.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Conseils d'Exploration ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-gold-400" />
          Conseils d'Exploration
        </h2>
        <div className="space-y-3">
          {EXPLORATION_TIPS.map((tip) => (
            <ExpandableSection key={tip.id} title={tip.title} icon={tip.icon} iconColor="text-cyan-400">
              <ul className="space-y-2">
                {tip.content.map((line, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <Star className="w-3 h-3 text-gold-400 flex-shrink-0 mt-1" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ── Vaisseaux Recommandés ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Ship className="w-5 h-5 text-cyan-400" />
          Vaisseaux Recommandés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDED_SHIPS.map((cat) => (
            <div key={cat.category} className={clsx('bg-space-800/50 border rounded-lg p-4', cat.border)}>
              <h3 className={clsx('font-bold mb-3 text-sm uppercase tracking-wide', cat.color)}>
                {cat.category}
              </h3>
              <div className="space-y-3">
                {cat.ships.map((s) => (
                  <div key={s.name} className="bg-space-900/50 rounded p-2.5 border border-space-400/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-200">{s.name}</span>
                      <span className="text-xs text-slate-500">{s.manufacturer}</span>
                    </div>
                    <p className="text-xs text-slate-400">{s.why}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tips Pratiques ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-400" />
          Tips Pratiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div
                key={i}
                className="bg-space-800/50 border border-space-400/20 rounded-lg p-3 flex items-start gap-3 hover:bg-space-700/30 transition-colors"
              >
                <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="epaves" />
    </div>
  );
}
