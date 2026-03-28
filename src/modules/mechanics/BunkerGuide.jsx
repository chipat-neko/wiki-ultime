import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Shield, AlertTriangle, MapPin, ChevronDown, ChevronUp,
  Target, DollarSign, Skull, Package, Users, Crosshair,
  Star, Zap, Heart, Eye, Lock, Flame, Award, Info,
  BookOpen, Layers, Box, Compass,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Types de Bunkers
══════════════════════════════════════════════════════════════ */

const BUNKER_TYPES = [
  {
    id: 'security',
    icon: Shield,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    name: 'Bunkers de Sécurité',
    description: 'Installations militaires ou de sécurité avec des missions légales (défense, nettoyage). Difficulté variable selon le tier de mission.',
    missions: ['Defend Bunker', 'Clear All Hostiles', 'Secure Area', 'Retrieve Data'],
    legalStatus: 'Légal',
    legalBadge: 'badge-green',
    enemyTypes: ['Pirates', 'Nine Tails', 'Criminels divers'],
    tips: 'Attention aux gardes alliés — le tir allié donne un CrimeStat immédiat.',
  },
  {
    id: 'druglab',
    icon: Flame,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    name: 'Laboratoires de Drogue',
    description: 'Installations clandestines de production de drogues. Excellent loot mais entièrement illégal. Gardes hostiles dès l\'entrée.',
    missions: ['Raid Drug Lab', 'Destroy Supplies', 'Eliminate Guards'],
    legalStatus: 'Illégal (CS2+)',
    legalBadge: 'badge-red',
    enemyTypes: ['Gardes armés', 'Dealers', 'Sentinelles'],
    tips: 'Le loot de drogue (SLAM, Neon, WiDoW) rapporte gros mais nécessite un vendeur illégal.',
  },
  {
    id: 'underground',
    icon: Layers,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    name: 'Installations Souterraines',
    description: 'Complexes souterrains multi-niveaux avec missions spéciales. Possibilité de boss et d\'objectifs secondaires.',
    missions: ['Infiltration', 'Assassinat ciblé', 'Récupération d\'objet', 'Mission spéciale faction'],
    legalStatus: 'Variable',
    legalBadge: 'badge-yellow',
    enemyTypes: ['Milices', 'Mercenaires', 'Boss blindés'],
    tips: 'Niveaux multiples — préparez assez de munitions et de soins pour une mission longue.',
  },
  {
    id: 'derelict',
    icon: Compass,
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    name: 'Épaves & Derelicts',
    description: 'Épaves de Reclaimer ou installations abandonnées. Exploration pure avec loot et peu ou pas d\'hostiles.',
    missions: ['Exploration libre', 'Scavenge & Loot', 'Scan de données'],
    legalStatus: 'Légal',
    legalBadge: 'badge-green',
    enemyTypes: ['Aucun ou très peu', 'Parfois des squatteurs'],
    tips: 'Apportez une lampe torche et un scanner — les objets de valeur sont souvent cachés.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tiers de difficulté
══════════════════════════════════════════════════════════════ */

const DIFFICULTY_TIERS = [
  { tier: 1, label: 'Facile', enemies: '3–5', weapons: 'Armes légères (pistolets, SMG)', reward: '15 000', repRequired: 'Aucune', badge: 'badge-green' },
  { tier: 2, label: 'Moyen', enemies: '6–10', weapons: 'Armes moyennes (AR, shotguns)', reward: '30 000', repRequired: 'Basse', badge: 'badge-blue' },
  { tier: 3, label: 'Difficile', enemies: '10–15', weapons: 'Armes lourdes + armures moyennes', reward: '60 000', repRequired: 'Moyenne', badge: 'badge-yellow' },
  { tier: 4, label: 'Très Difficile', enemies: '15–20', weapons: 'Armes lourdes, boss blindé', reward: '90 000+', repRequired: 'Haute', badge: 'badge-red' },
  { tier: 5, label: 'Extrême', enemies: '20+', weapons: 'Spawns multiples, boss, snipers', reward: '120 000+', repRequired: 'Maximale', badge: 'badge-purple' },
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
      { name: 'Custodian SMG', rarity: 'Commun', value: '~800 aUEC' },
      { name: 'Gallant Energy Rifle', rarity: 'Peu commun', value: '~2 200 aUEC' },
      { name: 'Scalpel Sniper Rifle', rarity: 'Rare', value: '~4 500 aUEC' },
      { name: 'FS-9 LMG', rarity: 'Rare', value: '~3 800 aUEC' },
      { name: 'Coda Pistol', rarity: 'Commun', value: '~600 aUEC' },
    ],
  },
  {
    id: 'armor',
    icon: Shield,
    color: 'text-purple-400',
    name: 'Armures',
    items: [
      { name: 'TrueDef Armor Set (léger)', rarity: 'Commun', value: '~3 000 aUEC' },
      { name: 'Calico Armor Set (moyen)', rarity: 'Peu commun', value: '~5 500 aUEC' },
      { name: 'Arden Armor Set (lourd)', rarity: 'Rare', value: '~9 000 aUEC' },
      { name: 'ORC-mkX Armor Set', rarity: 'Rare', value: '~8 500 aUEC' },
      { name: 'Casques variés', rarity: 'Variable', value: '500–4 000 aUEC' },
    ],
  },
  {
    id: 'consumables',
    icon: Heart,
    color: 'text-green-400',
    name: 'Consommables',
    items: [
      { name: 'MedPen', rarity: 'Très commun', value: '~100 aUEC' },
      { name: 'OxyPen', rarity: 'Commun', value: '~150 aUEC' },
      { name: 'Grenade Frag', rarity: 'Peu commun', value: '~350 aUEC' },
      { name: 'Grenade Flash', rarity: 'Peu commun', value: '~300 aUEC' },
      { name: 'ParaMed', rarity: 'Rare', value: '~500 aUEC' },
      { name: 'Munitions variées', rarity: 'Très commun', value: '~50 aUEC' },
    ],
  },
  {
    id: 'valuables',
    icon: Star,
    color: 'text-gold-400',
    name: 'Objets de Valeur',
    items: [
      { name: 'Data Drive (crypté)', rarity: 'Rare', value: '~8 000 aUEC' },
      { name: 'Gemmes (Hadanite, etc.)', rarity: 'Très rare', value: '5 000–15 000 aUEC' },
      { name: 'Composants électroniques', rarity: 'Peu commun', value: '~1 500 aUEC' },
      { name: 'Puce mémoire', rarity: 'Rare', value: '~3 000 aUEC' },
    ],
  },
  {
    id: 'drugs',
    icon: AlertTriangle,
    color: 'text-red-400',
    name: 'Drogues (Drug Labs uniquement)',
    items: [
      { name: 'SLAM', rarity: 'Commun (drug labs)', value: '~12 aUEC/unité' },
      { name: 'Neon', rarity: 'Commun (drug labs)', value: '~10 aUEC/unité' },
      { name: 'WiDoW', rarity: 'Peu commun', value: '~25 aUEC/unité' },
      { name: 'E\'tam', rarity: 'Rare', value: '~18 aUEC/unité' },
      { name: 'Maze', rarity: 'Rare', value: '~20 aUEC/unité' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tactiques & Stratégies
══════════════════════════════════════════════════════════════ */

const TACTICS = [
  {
    id: 'entry',
    icon: Eye,
    title: 'Approche & Entrée',
    content: [
      'Scannez le bunker depuis l\'extérieur avant de descendre — votre vaisseau détecte parfois les signatures de vie.',
      'Descendez l\'ascenseur en position accroupie et prêt à tirer — les ennemis peuvent spawner dans le hall d\'entrée.',
      'Attendez 2-3 secondes après l\'ouverture des portes de l\'ascenseur avant d\'avancer.',
      'En groupe : un joueur descend, les autres attendent le "clear" vocal avant de suivre.',
    ],
  },
  {
    id: 'clearing',
    icon: Target,
    title: 'Nettoyage de Salles',
    content: [
      '"Pie the corners" — vérifiez chaque angle en vous déplaçant progressivement dans l\'encadrement de porte.',
      'Utilisez les grenades flash avant d\'entrer dans les grandes salles — les ennemis seront désorientés 3-4 secondes.',
      'Ne restez jamais statique au centre d\'une salle — utilisez les couvertures (bureaux, caisses, murs).',
      'Vérifiez les étages supérieurs et les passerelles — les snipers ennemis s\'y positionnent souvent.',
    ],
  },
  {
    id: 'friendlyfire',
    icon: AlertTriangle,
    title: 'Tir Allié & CrimeStat',
    content: [
      'Les bunkers de sécurité ont des gardes ALLIÉS — ils portent une armure bleue/verte et ne tirent PAS sur vous.',
      'Tuer un garde allié = CrimeStat immédiat (CS2 minimum). Tous les gardes deviennent hostiles.',
      'En cas de CrimeStat accidentel : rangez votre arme, quittez immédiatement, payez l\'amende au terminal.',
      'Astuce : attendez que les gardes engagent les ennemis avant de tirer pour éviter les balles perdues.',
      'Les Drug Labs n\'ont PAS de gardes alliés — tout le monde est hostile.',
    ],
  },
  {
    id: 'loadout',
    icon: Crosshair,
    title: 'Équipement Recommandé',
    content: [
      'Arme principale : Assault Rifle (P4-AR ou Gallant) pour la polyvalence intérieur/extérieur.',
      'Arme secondaire : SMG (Custodian) ou Shotgun pour le CQB dans les couloirs étroits.',
      'Armure : moyenne (type Calico) pour le bon compromis protection/mobilité.',
      'Consommables : 3-5 MedPens, 2 OxyPens, 2-4 grenades (mix flash + frag).',
      'Accessoires : lampe torche obligatoire, scanner recommandé pour le loot.',
    ],
  },
  {
    id: 'groupsolo',
    icon: Users,
    title: 'Solo vs Groupe',
    content: [
      'Solo (Tier 1-2) : tout à fait viable. Jouez prudemment, utilisez les couvertures.',
      'Solo (Tier 3+) : faisable mais risqué. Prévoyez beaucoup de soins et munitions.',
      'Groupe (2-3 joueurs) : idéal pour les Tiers 3-4. Désignez un point man et un medic.',
      'Groupe (4+) : recommandé pour Tier 5. Attention au friendly fire entre joueurs !',
      'En groupe : partagez le loot équitablement ou désignez un "looteur" qui redistribue après.',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Emplacements connus
══════════════════════════════════════════════════════════════ */

const BUNKER_LOCATIONS = [
  {
    planet: 'Hurston',
    icon: '🏜️',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bunkers: [
      { name: 'HDMS-Breckinridge', type: 'Sécurité', tier: '1–3' },
      { name: 'HDMS-Norgaard', type: 'Sécurité', tier: '1–3' },
      { name: 'HDMS-Anderson', type: 'Sécurité', tier: '2–4' },
      { name: 'HDMS-Hahn', type: 'Drug Lab', tier: '2–3' },
      { name: 'HDMS-Oparei', type: 'Sécurité', tier: '1–2' },
    ],
  },
  {
    planet: 'Crusader (Lunes)',
    icon: '🌙',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bunkers: [
      { name: 'Bunker Yela (NT)', type: 'Sécurité', tier: '1–3' },
      { name: 'Bunker Cellin (CS)', type: 'Sécurité', tier: '2–4' },
      { name: 'Bunker Daymar', type: 'Sécurité', tier: '1–3' },
      { name: 'Drug Lab Yela', type: 'Drug Lab', tier: '2–3' },
    ],
  },
  {
    planet: 'ArcCorp (Lunes)',
    icon: '🏙️',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bunkers: [
      { name: 'Bunker Wala', type: 'Sécurité', tier: '1–3' },
      { name: 'Bunker Lyria', type: 'Sécurité', tier: '2–4' },
      { name: 'Drug Lab Lyria', type: 'Drug Lab', tier: '2–3' },
    ],
  },
  {
    planet: 'microTech (Lunes)',
    icon: '❄️',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bunkers: [
      { name: 'Bunker Calliope', type: 'Sécurité', tier: '1–3' },
      { name: 'Bunker Clio', type: 'Sécurité', tier: '2–4' },
      { name: 'Bunker Euterpe', type: 'Sécurité', tier: '1–2' },
      { name: 'Drug Lab Clio', type: 'Drug Lab', tier: '2–3' },
    ],
  },
  {
    planet: 'Pyro',
    icon: '🔥',
    color: 'text-red-400',
    border: 'border-red-500/30',
    bunkers: [
      { name: 'Drug Lab Pyro I', type: 'Drug Lab', tier: '3–5' },
      { name: 'Drug Lab Pyro II', type: 'Drug Lab', tier: '3–5' },
      { name: 'Installation abandonnée', type: 'Derelict', tier: '2–3' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Récompenses & Réputation
══════════════════════════════════════════════════════════════ */

const REPUTATION_FACTIONS = [
  { name: 'Crusader Security', missions: 'Bunkers Crusader', repGain: '+50 à +200 par mission', unlocks: 'Tier 2 à Tier 4 progressif', color: 'text-cyan-400' },
  { name: 'Hurston Security', missions: 'Bunkers Hurston', repGain: '+50 à +200 par mission', unlocks: 'Tier 2 à Tier 4 progressif', color: 'text-yellow-400' },
  { name: 'microTech Security', missions: 'Bunkers microTech', repGain: '+50 à +200 par mission', unlocks: 'Tier 2 à Tier 4 progressif', color: 'text-blue-400' },
  { name: 'ArcCorp Security', missions: 'Bunkers ArcCorp', repGain: '+50 à +200 par mission', unlocks: 'Tier 2 à Tier 4 progressif', color: 'text-orange-400' },
  { name: 'Vaughn & Nine Tails', missions: 'Missions illégales / Drug Labs', repGain: '+30 à +150 par mission', unlocks: 'Accès drug labs & contrats spéciaux', color: 'text-red-400' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tips pratiques
══════════════════════════════════════════════════════════════ */

const TIPS = [
  { icon: Eye, text: 'Garez votre vaisseau à 200–300m du bunker pour éviter qu\'il soit détruit par des ennemis extérieurs ou des joueurs hostiles.' },
  { icon: Lock, text: 'Verrouillez toujours votre vaisseau avant de descendre — les autres joueurs peuvent le voler.' },
  { icon: Heart, text: 'Emportez toujours au moins 3 MedPens — les ennemis Tier 3+ font beaucoup de dégâts.' },
  { icon: Crosshair, text: 'Visez la tête : les ennemis en armure lourde meurent en 2-3 headshots au lieu de 10+ body shots.' },
  { icon: AlertTriangle, text: 'Ne lootez PAS en combat — attendez que la zone soit complètement nettoyée avant de ramasser le butin.' },
  { icon: Package, text: 'Utilisez un sac à dos (backpack) pour transporter plus de loot — le Pembroke ou le MacFlex sont idéaux.' },
  { icon: Shield, text: 'Après la mort, vous avez 15 minutes pour récupérer votre corps et votre équipement. Notez la position GPS.' },
  { icon: Zap, text: 'Les ennemis respawnent parfois après 5-10 minutes — ne traînez pas dans un bunker nettoyé.' },
  { icon: DollarSign, text: 'Pour maximiser les gains : enchaînez 3-4 bunkers Tier 2 plutôt qu\'un seul Tier 4 risqué.' },
  { icon: Info, text: 'Bug connu : les gardes alliés peuvent parfois devenir hostiles sans raison. Quittez le bunker si cela arrive.' },
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
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function BunkerGuide() {
  const [expandedType, setExpandedType] = useState(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Target className="w-8 h-8 text-cyan-400" />
          Bunkers & Missions au Sol
        </h1>
        <p className="text-slate-400 mt-2">
          Guide complet des missions en bunker dans Star Citizen
        </p>
      </div>

      {/* ── Types de Bunkers ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          Types de Bunkers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUNKER_TYPES.map((bt) => {
            const Icon = bt.icon;
            const isOpen = expandedType === bt.id;
            return (
              <div
                key={bt.id}
                className={clsx(
                  'bg-space-800/50 border rounded-lg overflow-hidden transition-all',
                  bt.border
                )}
              >
                <button
                  onClick={() => setExpandedType(isOpen ? null : bt.id)}
                  className="w-full text-left px-4 py-3 hover:bg-space-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={clsx('w-5 h-5', bt.color)} />
                      <span className="font-bold text-slate-200">{bt.name}</span>
                      <span className={clsx('badge text-xs', bt.legalBadge)}>{bt.legalStatus}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{bt.description}</p>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-space-400/20 pt-3 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Missions disponibles</div>
                      <div className="flex flex-wrap gap-1.5">
                        {bt.missions.map((m, i) => (
                          <span key={i} className="badge badge-blue text-xs">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Types d'ennemis</div>
                      <ul className="space-y-1">
                        {bt.enemyTypes.map((e, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                            <Skull className="w-3 h-3 text-red-400 flex-shrink-0" /> {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-space-900/50 rounded p-2.5 border border-space-400/10">
                      <div className="text-xs text-slate-300 flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-gold-400 flex-shrink-0" />
                        <span>{bt.tips}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Tiers de Difficulté ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-gold-400" />
          Tiers de Difficulté
        </h2>
        <div className="bg-space-800/50 border border-space-400/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Tier</th>
                  <th className="px-4 py-3 text-left">Difficulté</th>
                  <th className="px-4 py-3 text-left">Ennemis</th>
                  <th className="px-4 py-3 text-left">Armement ennemi</th>
                  <th className="px-4 py-3 text-right">Récompense</th>
                  <th className="px-4 py-3 text-left">Rep. requise</th>
                </tr>
              </thead>
              <tbody>
                {DIFFICULTY_TIERS.map((t) => (
                  <tr key={t.tier} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">T{t.tier}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge text-xs', t.badge)}>{t.label}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{t.enemies}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{t.weapons}</td>
                    <td className="px-4 py-3 text-right text-gold-400 font-medium">{t.reward} aUEC</td>
                    <td className="px-4 py-3 text-slate-300">{t.repRequired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                    <tr className="border-b border-space-400/20 text-slate-500 text-xs uppercase tracking-wide">
                      <th className="py-2 text-left">Objet</th>
                      <th className="py-2 text-left">Rareté</th>
                      <th className="py-2 text-right">Valeur estimée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lt.items.map((item, i) => (
                      <tr key={i} className="border-b border-space-400/10">
                        <td className="py-2 text-slate-200">{item.name}</td>
                        <td className="py-2 text-slate-400 text-xs">{item.rarity}</td>
                        <td className="py-2 text-right text-gold-400 text-xs">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ── Tactiques & Stratégies ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Tactiques & Stratégies
        </h2>
        <div className="space-y-3">
          {TACTICS.map((tactic) => (
            <ExpandableSection key={tactic.id} title={tactic.title} icon={tactic.icon} iconColor={tactic.id === 'friendlyfire' ? 'text-red-400' : 'text-cyan-400'}>
              <ul className="space-y-2.5">
                {tactic.content.map((line, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-500 mt-1 flex-shrink-0">&#x2022;</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ── Emplacements Connus ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gold-400" />
          Emplacements Connus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUNKER_LOCATIONS.map((loc) => (
            <div key={loc.planet} className={clsx('bg-space-800/50 border rounded-lg p-4', loc.border)}>
              <h3 className={clsx('font-bold mb-3 flex items-center gap-2', loc.color)}>
                <span>{loc.icon}</span> {loc.planet}
              </h3>
              <ul className="space-y-2">
                {loc.bunkers.map((b, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300">{b.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'text-xs',
                        b.type === 'Drug Lab' ? 'text-red-400' : b.type === 'Derelict' ? 'text-yellow-400' : 'text-cyan-400'
                      )}>
                        {b.type}
                      </span>
                      <span className="text-xs text-slate-500">T{b.tier}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Récompenses & Réputation ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gold-400" />
          Récompenses & Réputation
        </h2>
        <div className="bg-space-800/50 border border-space-400/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Faction</th>
                  <th className="px-4 py-3 text-left">Missions</th>
                  <th className="px-4 py-3 text-left">Gain de réputation</th>
                  <th className="px-4 py-3 text-left">Déblocages</th>
                </tr>
              </thead>
              <tbody>
                {REPUTATION_FACTIONS.map((f, i) => (
                  <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                    <td className={clsx('px-4 py-3 font-medium', f.color)}>{f.name}</td>
                    <td className="px-4 py-3 text-slate-300">{f.missions}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{f.repGain}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{f.unlocks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 bg-space-900/50 border border-space-400/10 rounded-lg p-3">
          <p className="text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              La réputation augmente avec chaque mission complétée et diminue si vous échouez ou tuez des alliés.
              Monter en réputation débloque des missions de tier supérieur avec de meilleures récompenses.
              La progression est indépendante par faction.
            </span>
          </p>
        </div>
      </section>

      {/* ── Tips Pratiques ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-gold-400" />
          Conseils Pratiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const TipIcon = tip.icon;
            return (
              <div
                key={i}
                className="bg-space-800/50 border border-space-400/20 rounded-lg p-3 flex items-start gap-3 hover:bg-space-700/30 transition-colors"
              >
                <div className="bg-space-700/50 rounded p-1.5 flex-shrink-0">
                  <TipIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-sm text-slate-300">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
