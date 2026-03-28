import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Users, ChevronDown, ChevronUp, Smartphone, Share2, Mic,
  Shield, Crosshair, Pickaxe, Truck, Skull, Compass, Wrench,
  Ship, Building2, MessageSquare, Lightbulb, Star, Radio,
  Volume2, Navigation, UserPlus, Crown, Award, Rocket,
  Target, Heart, Eye, Zap,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Système de Groupe
══════════════════════════════════════════════════════════════ */

const PARTY_CARDS = [
  {
    id: 'creation',
    icon: Smartphone,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    title: 'Création de groupe',
    description: 'Ouvrez votre MobiGlas → Contacts → sélectionnez un joueur → Inviter au groupe. Le groupe peut contenir jusqu\'à 4 joueurs.',
    details: [
      'Le chef de groupe est celui qui crée l\'invitation initiale',
      'Les membres voient les marqueurs de position des alliés',
      'Le chef peut promouvoir un autre joueur comme leader',
      'Quitter le groupe ne fait pas perdre la progression de mission',
    ],
  },
  {
    id: 'missions',
    icon: Share2,
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    title: 'Partage de missions',
    description: 'Les missions acceptées peuvent être partagées avec les membres du groupe. Tous les participants reçoivent la réputation et une part des récompenses.',
    details: [
      'Le partage se fait via MobiGlas → Mission → Partager',
      'Les récompenses en aUEC sont réparties selon la participation',
      'La réputation est attribuée à chaque membre du groupe',
      'Certaines missions nécessitent un groupe pour être efficaces',
    ],
  },
  {
    id: 'voip',
    icon: Mic,
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    title: 'Communication VOIP',
    description: 'Star Citizen offre un chat vocal de proximité, un canal de groupe et des fréquences radio personnalisables.',
    details: [
      'Proximity chat : portée ~20m, réaliste et directionnel',
      'Group chat : communication instantanée entre membres',
      'Channel frequency : réglable pour communiquer avec d\'autres groupes',
      'Raccourci par défaut : NumPad + pour parler en groupe',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Activités de Groupe
══════════════════════════════════════════════════════════════ */

const GROUP_ACTIVITIES = [
  {
    id: 'bunker',
    icon: Shield,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    title: 'Raids de Bunkers',
    players: '2–4 joueurs',
    description: 'Assauts coordonnés sur des installations au sol avec répartition des rôles tactiques.',
    roles: [
      { name: 'Pointman', desc: 'En tête, ouvre les portes et engage en premier' },
      { name: 'Medic', desc: 'Soigne et réanime les coéquipiers tombés' },
      { name: 'Overwatch', desc: 'Couvre les arrières et surveille les couloirs' },
    ],
    tips: 'Désignez un medic avant d\'entrer. Communiquez chaque contact ennemi avec sa position.',
  },
  {
    id: 'bounty',
    icon: Crosshair,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    title: 'Chasse de primes',
    players: '2–3 joueurs',
    description: 'Un pilote manœuvre pendant que le tourelleur élimine les cibles. Efficace contre les primes de haute difficulté.',
    roles: [
      { name: 'Pilote', desc: 'Manœuvre le vaisseau et gère les boucliers' },
      { name: 'Tourelleur', desc: 'Engage les cibles depuis la tourelle' },
    ],
    tips: 'Le Cutlass Black ou le Constellation sont idéaux. Le pilote doit maintenir un angle stable pour le tourelleur.',
  },
  {
    id: 'mining',
    icon: Pickaxe,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    title: 'Opérations minières',
    players: '3–4 joueurs',
    description: 'La MISC Mole permet à 3-4 opérateurs de miner simultanément avec des lasers indépendants.',
    roles: [
      { name: 'Pilote', desc: 'Positionne le vaisseau et scanne les rochers' },
      { name: 'Opérateur laser 1-2', desc: 'Gère la fracturation et l\'extraction' },
      { name: 'Opérateur laser 3', desc: 'Assistance et gestion du cargo' },
    ],
    tips: 'Coordonnez les lasers sur le même rocher pour les minerais résistants. Utilisez des consommables pour les matériaux rares.',
  },
  {
    id: 'trading',
    icon: Truck,
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    title: 'Convois de commerce',
    players: '3–6 joueurs',
    description: 'Escorte de cargos à travers des zones dangereuses. Les chasseurs protègent les transporteurs.',
    roles: [
      { name: 'Cargo', desc: 'Transporte les marchandises (C2, Caterpillar, Hull)' },
      { name: 'Escorte avant', desc: 'Éclaireur en chasseur léger' },
      { name: 'Escorte arrière', desc: 'Protection rapprochée du cargo' },
    ],
    tips: 'Voyagez en formation serrée dans les zones à risque. Le cargo ne doit jamais quantum seul.',
  },
  {
    id: 'piracy',
    icon: Skull,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    title: 'Piraterie',
    players: '4–8 joueurs',
    description: 'Interception, boarding et pillage de vaisseaux. Nécessite coordination et équipement spécialisé.',
    roles: [
      { name: 'Intercepteur', desc: 'Désactive les moteurs de la cible avec des armes à distorsion' },
      { name: 'Équipe d\'abordage', desc: 'Pénètre le vaisseau et neutralise l\'équipage' },
      { name: 'Pilleur', desc: 'Transfère le cargo vers le vaisseau pirate' },
      { name: 'Guetteur', desc: 'Surveille l\'arrivée de renforts ou de la sécurité' },
    ],
    tips: 'Les armes à distorsion (Distortion) sont essentielles pour désactiver sans détruire. Préparez un CrimeStat.',
  },
  {
    id: 'exploration',
    icon: Compass,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    title: 'Exploration',
    players: '4+ joueurs',
    description: 'Le Carrack est le vaisseau d\'exploration multi-crew par excellence avec ses drones, cartographie et medbay.',
    roles: [
      { name: 'Pilote', desc: 'Navigation et manœuvres' },
      { name: 'Navigateur', desc: 'Gère la cartographie et les routes' },
      { name: 'Opérateur drones', desc: 'Déploie et contrôle les drones de reconnaissance' },
      { name: 'Tourelleur', desc: 'Défense contre les menaces' },
    ],
    tips: 'Explorez Pyro en groupe — les jump points sont dangereux et les secours sont loin.',
  },
  {
    id: 'salvage',
    icon: Wrench,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    title: 'Opérations de Salvage',
    players: '3–4 joueurs',
    description: 'Le Reclaimer permet une récupération industrielle avec une équipe coordonnée.',
    roles: [
      { name: 'Pilote', desc: 'Positionne le vaisseau sur l\'épave' },
      { name: 'Opérateur griffe', desc: 'Contrôle le bras de récupération' },
      { name: 'Trieur', desc: 'Gère le stockage et trie les matériaux' },
    ],
    tips: 'Les épaves de gros vaisseaux (Hammerhead, Caterpillar) rapportent le plus de RMC et matériaux.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Vaisseaux Multi-Crew
══════════════════════════════════════════════════════════════ */

const MULTICREW_SHIPS = [
  { name: 'Cutlass Black', crew: '2', roles: 'Pilote + tourelleur', activity: 'Combat, transport', size: 'Moyen' },
  { name: 'Freelancer', crew: '2', roles: 'Pilote + tourelleur', activity: 'Commerce, combat léger', size: 'Moyen' },
  { name: 'Constellation Andromeda', crew: '3–4', roles: 'Pilote + tourelleur + snub', activity: 'Multi-rôle', size: 'Grand' },
  { name: 'Redeemer', crew: '4', roles: 'Pilote + 2 tourelleurs + ingénieur', activity: 'Combat lourd', size: 'Grand' },
  { name: 'Hammerhead', crew: '7', roles: 'Pilote + 6 tourelleurs', activity: 'Combat capital', size: 'Capital' },
  { name: 'Carrack', crew: '4–6', roles: 'Pilote + navigateur + drones + tourelles', activity: 'Exploration', size: 'Capital' },
  { name: 'Reclaimer', crew: '3–5', roles: 'Pilote + opérateur griffe + trieur', activity: 'Salvage', size: 'Capital' },
  { name: 'MOLE', crew: '3–4', roles: 'Pilote + 2-3 opérateurs laser', activity: 'Minage', size: 'Grand' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Organisations
══════════════════════════════════════════════════════════════ */

const ORG_SECTIONS = [
  {
    id: 'creation',
    title: 'Création d\'une organisation',
    content: 'Rendez-vous sur robertsspaceindustries.com → Community → Organizations → Create. Choisissez un nom, un tag (max 4 caractères), un logo et une description. L\'org est immédiatement active et visible sur le site RSI.',
  },
  {
    id: 'types',
    title: 'Types d\'organisations',
    content: 'Corporation (commerce/industrie), PMC (mercenariat/sécurité), Syndicate (activités illégales/piraterie), Faith (roleplay/lore), Organization (polyvalent). Chaque type offre un archétype différent mais n\'a pas d\'impact mécanique en jeu actuellement.',
  },
  {
    id: 'avantages',
    title: 'Avantages',
    content: 'Base partagée future, fleet pooling (mutualisation des vaisseaux), réputation commune, accès à des missions d\'org exclusives (prévu), communication interne structurée et coordination facilitée pour les opérations de grande envergure.',
  },
  {
    id: 'gestion',
    title: 'Gestion et hiérarchie',
    content: 'Définissez des rangs personnalisés avec permissions (invite, kick, gestion flotte). Recrutez via le Spectrum ou en jeu. Les grandes orgs utilisent souvent Discord pour la coordination hors-jeu. Un système de rangs clair améliore l\'efficacité opérationnelle.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tips Communication
══════════════════════════════════════════════════════════════ */

const COMM_SECTIONS = [
  {
    id: 'voip',
    title: 'Optimisation VOIP',
    content: 'Réglez le seuil de détection vocale dans Options → Audio pour éviter les bruits parasites. Utilisez un casque avec micro dédié. Testez le VOIP en proximity chat avant de partir en mission. Désactivez le FOIP si vous n\'avez pas de webcam pour économiser des ressources.',
  },
  {
    id: 'callouts',
    title: 'Standards de communication',
    content: 'Utilisez les repères de boussole (ex: "Contact Nord-Est, 200m, derrière le rocher"). Pour le combat spatial, référencez la clock position (ex: "Ennemi à 3h haut"). Annoncez vos actions : "Je recharge", "Médic nécessaire", "Zone sécurisée". Bref et précis.',
  },
  {
    id: 'discord',
    title: 'Intégration Discord',
    content: 'Créez des salons vocaux dédiés par activité (mining, combat, trade). Utilisez des bots pour suivre les sessions en cours. Les overlays Discord permettent de voir qui parle sans quitter le jeu. Configurez des raccourcis push-to-talk différents pour Discord et le VOIP en jeu.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Conseils généraux
══════════════════════════════════════════════════════════════ */

const TIPS = [
  { icon: Users, text: 'Commencez à 2-3 joueurs avant de tenter des opérations à grande échelle.' },
  { icon: Heart, text: 'Ayez toujours un joueur avec du matériel médical (MedPen, MedGun) dans le groupe.' },
  { icon: Radio, text: 'Testez votre VOIP avant chaque session — un groupe sans communication est voué à l\'échec.' },
  { icon: Navigation, text: 'Définissez un point de ralliement en cas de séparation ou de mort.' },
  { icon: Shield, text: 'En bunker, n\'ouvrez jamais le feu sur les gardes alliés — le CrimeStat est instantané.' },
  { icon: Star, text: 'Alternez le rôle de chef de groupe pour que chacun progresse en réputation variée.' },
  { icon: Target, text: 'Utilisez les marqueurs QT partagés pour vous retrouver rapidement dans l\'espace.' },
  { icon: Zap, text: 'Prévoyez un vaisseau de secours (médical ou transport) stationné en orbite pour les opérations au sol.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Section extensible
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, color, border, bg, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={clsx('rounded-lg border', border, 'bg-gray-800/60 overflow-hidden')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        {Icon && <Icon size={18} className={color} />}
        <span className="font-semibold text-white flex-1">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-white/5">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function GroupGuide() {
  const [expandedActivity, setExpandedActivity] = useState(null);

  const toggleActivity = (id) => {
    setExpandedActivity(expandedActivity === id ? null : id);
  };

  return (
    <div className="space-y-8 p-4 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Users size={32} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Gameplay en Groupe</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Guide du système de groupe, missions multi-joueurs et organisations
        </p>
      </div>

      {/* ── Party System ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserPlus size={20} className="text-cyan-400" />
          Système de Groupe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PARTY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className={clsx('rounded-lg border p-4 space-y-3', card.border, card.bg)}>
                <div className="flex items-center gap-2">
                  <Icon size={20} className={card.color} />
                  <h3 className="font-semibold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-gray-300">{card.description}</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {card.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className={card.color}>•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Group Activities ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target size={20} className="text-cyan-400" />
          Activités de Groupe
        </h2>
        <div className="space-y-3">
          {GROUP_ACTIVITIES.map((act) => {
            const Icon = act.icon;
            const isOpen = expandedActivity === act.id;
            return (
              <div key={act.id} className={clsx('rounded-lg border overflow-hidden', act.border, 'bg-gray-800/60')}>
                <button
                  onClick={() => toggleActivity(act.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <Icon size={18} className={act.color} />
                  <span className="font-semibold text-white flex-1">{act.title}</span>
                  <span className="text-xs text-gray-400 mr-2">{act.players}</span>
                  {isOpen
                    ? <ChevronUp size={16} className="text-gray-400" />
                    : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/5 space-y-3">
                    <p className="text-sm text-gray-300 mt-3">{act.description}</p>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Rôles</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {act.roles.map((role, i) => (
                          <div key={i} className={clsx('rounded border px-3 py-2', act.border, act.bg)}>
                            <span className={clsx('font-medium text-sm', act.color)}>{role.name}</span>
                            <p className="text-xs text-gray-400">{role.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2">
                      <Lightbulb size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-yellow-200">{act.tips}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Multi-Crew Ships ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Rocket size={20} className="text-cyan-400" />
          Vaisseaux Multi-Crew
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="text-left px-4 py-2 text-gray-400 font-medium">Vaisseau</th>
                <th className="text-center px-4 py-2 text-gray-400 font-medium">Équipage</th>
                <th className="text-left px-4 py-2 text-gray-400 font-medium">Rôles</th>
                <th className="text-left px-4 py-2 text-gray-400 font-medium">Activité</th>
                <th className="text-center px-4 py-2 text-gray-400 font-medium">Taille</th>
              </tr>
            </thead>
            <tbody>
              {MULTICREW_SHIPS.map((ship, i) => (
                <tr key={ship.name} className={clsx('border-t border-gray-700/50', i % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10')}>
                  <td className="px-4 py-2 text-white font-medium">{ship.name}</td>
                  <td className="px-4 py-2 text-center text-cyan-400">{ship.crew}</td>
                  <td className="px-4 py-2 text-gray-300">{ship.roles}</td>
                  <td className="px-4 py-2 text-gray-300">{ship.activity}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={clsx(
                      'badge',
                      ship.size === 'Moyen' && 'badge-blue',
                      ship.size === 'Grand' && 'badge-yellow',
                      ship.size === 'Capital' && 'badge-red',
                    )}>
                      {ship.size}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Organisations ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Crown size={20} className="text-cyan-400" />
          Organisations
        </h2>
        <div className="space-y-3">
          {ORG_SECTIONS.map((s) => (
            <ExpandableSection
              key={s.id}
              title={s.title}
              icon={Building2}
              color="text-purple-400"
              border="border-purple-500/30"
              bg="bg-purple-500/10"
            >
              <p className="text-sm text-gray-300 mt-3">{s.content}</p>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ── Communication Tips ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-cyan-400" />
          Conseils de Communication
        </h2>
        <div className="space-y-3">
          {COMM_SECTIONS.map((s) => (
            <ExpandableSection
              key={s.id}
              title={s.title}
              icon={Volume2}
              color="text-yellow-400"
              border="border-yellow-500/30"
              bg="bg-yellow-500/10"
            >
              <p className="text-sm text-gray-300 mt-3">{s.content}</p>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ── Tips ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award size={20} className="text-cyan-400" />
          Conseils pour le Jeu en Groupe
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-800/40 px-4 py-3">
                <Icon size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="groupe" />
    </div>
  );
}
