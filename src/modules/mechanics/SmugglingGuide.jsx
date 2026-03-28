import React, { useState } from 'react';
import clsx from 'clsx';
import {
  AlertTriangle, Shield, MapPin, Clock, ChevronDown, ChevronUp,
  Info, Zap, Target, DollarSign, BookOpen, Eye, Package, Navigation,
  TrendingUp, Skull, Lock, Star, Truck, Radio, Search, X,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Marchandises illégales
══════════════════════════════════════════════════════════════ */

const ILLEGAL_COMMODITIES = [
  {
    id: 'slam',
    name: 'SLAM',
    type: 'Drogue stimulante',
    description: 'Stimulant puissant qui augmente temporairement les réflexes et la perception. Très prisé dans les cercles criminels et par certains pilotes de combat cherchant un avantage. Extrêmement addictif.',
    buyLocations: 'Grim HEX, laboratoires clandestins',
    sellPrice: '~25 aUEC/unité',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    color: 'text-danger-400',
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    icon: Zap,
    legalStatus: 'Illégal partout dans l\'UEE',
    detection: 'Détectable par scan standard',
    penalty: 'CS1 (possession), CS2 (quantité importante)',
  },
  {
    id: 'neon',
    name: 'Néon',
    type: 'Drogue hallucinogène',
    description: 'Substance hallucinogène produisant des distorsions visuelles intenses. Populaire dans les soirées underground et les stations hors-la-loi. Moins dangereux que le SLAM mais tout aussi illégal.',
    buyLocations: 'Grim HEX, labs souterrains, avant-postes isolés',
    sellPrice: '~20 aUEC/unité',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: Eye,
    legalStatus: 'Illégal dans tous les systèmes UEE',
    detection: 'Détectable par scan standard',
    penalty: 'CS1 (petite quantité), CS2 (trafic)',
  },
  {
    id: 'widow',
    name: 'WiDoW',
    type: 'Drogue puissante',
    description: 'La drogue la plus dangereuse et la plus rentable du marché noir. Substance noire visqueuse aux effets dévastateurs. Son commerce est sévèrement puni par l\'UEE et même certaines organisations criminelles la considèrent trop risquée.',
    buyLocations: 'Labs clandestins uniquement (JumpTown, grottes)',
    sellPrice: '~30 aUEC/unité',
    risk: 'Très élevé',
    riskBadge: 'badge-red',
    color: 'text-success-400',
    border: 'border-success-500/30',
    bg: 'bg-success-500/10',
    icon: Skull,
    legalStatus: 'Strictement illégal — tolérance zéro',
    detection: 'Détectable même par scan basique',
    penalty: 'CS2 (possession), CS3 (trafic organisé)',
  },
  {
    id: 'maze',
    name: 'Maze',
    type: 'Agent biochimique',
    description: 'Composé biochimique détourné de la recherche militaire. Utilisé comme drogue récréative à faible dose, il provoque une euphorie intense accompagnée de pertes de mémoire. Très recherché pour ses propriétés uniques.',
    buyLocations: 'Labs de recherche détournés, contacts spéciaux',
    sellPrice: '~22 aUEC/unité',
    risk: 'Élevé',
    riskBadge: 'badge-yellow',
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    bg: 'bg-warning-500/10',
    icon: AlertTriangle,
    legalStatus: 'Illégal — classifié substance contrôlée',
    detection: 'Détectable par scan avancé',
    penalty: 'CS1 (possession), CS2 (distribution)',
  },
  {
    id: 'stolen',
    name: 'Objets volés',
    type: 'Marchandise volée',
    description: 'Tout bien dérobé lors d\'un raid, d\'un vol de cargaison ou d\'un pillage d\'épave. Les objets volés sont marqués électroniquement et identifiables par les scanners de sécurité. Seuls les receleurs acceptent ce type de marchandise.',
    buyLocations: 'Sources variées (raids, épaves, vol de cargo)',
    sellPrice: 'Variable (30-70% valeur originale)',
    risk: 'Moyen à élevé',
    riskBadge: 'badge-yellow',
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    bg: 'bg-gold-500/10',
    icon: Package,
    legalStatus: 'Illégal — recel de biens volés',
    detection: 'Marquage électronique traçable',
    penalty: 'CS1-CS3 selon la valeur et l\'origine',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Routes de contrebande
══════════════════════════════════════════════════════════════ */

const SMUGGLING_ROUTES = [
  {
    id: 'grimhex-olisar',
    name: 'Grim HEX → Zone Port Olisar',
    goods: 'SLAM, Néon, Maze',
    buy: 'Grim HEX (Yela orbit)',
    sell: 'Revendeurs proches de Crusader',
    profitEstimate: '5 000 — 15 000 aUEC/voyage',
    time: '10-15 minutes',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    color: 'border-warning-500/30',
    tips: [
      'Évitez l\'approche directe vers les stations légales — vous serez scanné.',
      'Privilégiez les livraisons à des joueurs acheteurs plutôt qu\'aux terminaux.',
      'Le Mercury Star Runner est idéal pour cette route grâce à ses compartiments cachés.',
      'Changez de route régulièrement pour ne pas être repéré par les chasseurs de primes.',
    ],
  },
  {
    id: 'labs-grimhex',
    name: 'Drug Labs → Grim HEX',
    goods: 'WiDoW, SLAM, Néon',
    buy: 'Labs clandestins (Yela, Daymar, Aberdeen)',
    sell: 'Grim HEX',
    profitEstimate: '2 000 — 8 000 aUEC/voyage',
    time: '5-10 minutes',
    risk: 'Faible',
    riskBadge: 'badge-green',
    color: 'border-success-500/30',
    tips: [
      'Route la plus sûre car Grim HEX n\'a pas de scanners légaux.',
      'Les labs sont souvent contestés par d\'autres joueurs — restez vigilant.',
      'Emportez une arme personnelle pour sécuriser le site de collecte.',
      'Faites plusieurs petits voyages plutôt qu\'un seul gros chargement.',
    ],
  },
  {
    id: 'jumptown',
    name: 'JumpTown → N\'importe où',
    goods: 'WiDoW (principalement), SLAM',
    buy: 'JumpTown (Yela)',
    sell: 'Tout receleur acceptant les drogues',
    profitEstimate: '20 000 — 80 000 aUEC/voyage',
    time: '15-30 minutes (hors combat)',
    risk: 'Extrême',
    riskBadge: 'badge-red',
    color: 'border-danger-500/30',
    tips: [
      'JumpTown est LA zone PvP la plus disputée de Stanton — attendez-vous à du combat.',
      'Venez en groupe organisé : 2 chasseurs d\'escorte minimum.',
      'Chargez rapidement et partez — ne restez jamais sur place plus de 5 minutes.',
      'Ayez un plan B : route QT de secours préprogrammée.',
      'Le profit est énorme mais le risque de tout perdre est réel.',
    ],
  },
  {
    id: 'pyro-stanton',
    name: 'Pyro → Stanton (via Jump Point)',
    goods: 'Marchandises rares Pyro, objets volés',
    buy: 'Stations et avant-postes Pyro',
    sell: 'Grim HEX, contacts Stanton',
    profitEstimate: '15 000 — 50 000 aUEC/voyage',
    time: '20-40 minutes (transit JP inclus)',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    color: 'border-danger-500/30',
    tips: [
      'Le Jump Point Pyro-Stanton est surveillé des deux côtés — pirates ET forces de l\'ordre.',
      'Traversez le JP en mode furtif : signature EM minimale, boucliers réduits.',
      'Les marchandises de Pyro ont une valeur premium dans Stanton car rares.',
      'Prévoyez du carburant quantique supplémentaire pour les détours d\'évasion.',
    ],
  },
  {
    id: 'wreck-run',
    name: 'Épaves → Receleurs',
    goods: 'Composants récupérés, objets volés',
    buy: 'Épaves de vaisseaux (événements dynamiques)',
    sell: 'Grim HEX, contacts marché noir',
    profitEstimate: '3 000 — 12 000 aUEC/voyage',
    time: '10-20 minutes',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    color: 'border-warning-500/30',
    tips: [
      'Les épaves apparaissent aléatoirement — surveillez les signaux de détresse.',
      'Certains composants récupérés sont marqués comme volés automatiquement.',
      'Un Cutlass Black offre un bon compromis entre cargo et capacité de combat.',
      'Méfiez-vous des pièges : certains signaux de détresse sont des leurres de pirates.',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Évasion de scanners
══════════════════════════════════════════════════════════════ */

const SCANNER_EVASION = [
  {
    title: 'Fonctionnement des scans de station',
    icon: Search,
    color: 'text-cyan-400',
    content: [
      'Les stations de l\'UEE effectuent des scans automatiques dans un rayon de 10 km.',
      'Le scan analyse la cargaison déclarée vs la cargaison réelle à bord.',
      'Les marchandises illégales sont détectées si le scan est complété (barre de progression).',
      'Les zones d\'atterrissage ont des scans plus fréquents que les hangars orbitaux.',
      'Un scan prend environ 5-10 secondes pour un vaisseau de taille moyenne.',
    ],
  },
  {
    title: 'Vaisseaux avec compartiments cachés',
    icon: Truck,
    color: 'text-gold-400',
    content: [
      'Mercury Star Runner — Compartiment caché intégré, le meilleur choix pour la contrebande.',
      'Herald — Petit et rapide, difficile à scanner grâce à sa vitesse d\'approche.',
      'Cutlass Black — Pas de compartiment caché mais polyvalent et bon rapport cargo/combat.',
      'Freelancer MIS — Bonne défense si intercepté, cargo modéré.',
      'À terme, d\'autres vaisseaux devraient recevoir des modules de contrebande (Gold Standard).',
    ],
  },
  {
    title: 'Techniques de timing et d\'approche',
    icon: Clock,
    color: 'text-purple-400',
    content: [
      'Entrez dans la zone de la station à vitesse maximale — ne restez pas en hovering.',
      'Demandez l\'atterrissage AVANT d\'entrer dans la zone de scan (préparez la requête).',
      'Atterrissez directement sans faire de cercles autour de la station.',
      'Les pads extérieurs sont plus risqués que les hangars intérieurs (exposition plus longue).',
      'Chronométrez votre approche : les scans ont un cooldown entre chaque passage.',
    ],
  },
  {
    title: 'Réduction de signature',
    icon: Eye,
    color: 'text-success-400',
    content: [
      'Désactivez les systèmes non essentiels pour réduire votre signature EM.',
      'Un vaisseau avec une signature basse est scanné moins prioritairement.',
      'Les composants Stealth (boucliers, power plants) réduisent la détectabilité.',
      'Coupez les armes et les tourelles avant l\'approche d\'une station.',
      'Le mode furtif combiné à une approche rapide est la meilleure stratégie.',
    ],
  },
  {
    title: 'Conséquences si attrapé',
    icon: AlertTriangle,
    color: 'text-danger-400',
    content: [
      'CrimeStat immédiat (CS1 à CS3 selon la marchandise et la quantité).',
      'Confiscation totale de la cargaison illégale — perte sèche.',
      'Amende proportionnelle à la valeur de la marchandise saisie.',
      'Interdiction temporaire d\'atterrissage dans certaines stations UEE.',
      'À CS3+, les chasseurs de primes et l\'Advocacy sont envoyés à votre poursuite.',
      'Risque d\'emprisonnement à Klescher si capturé vivant.',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tableau Risque vs Récompense
══════════════════════════════════════════════════════════════ */

const RISK_REWARD_TABLE = [
  { activity: 'Transport SLAM (Grim HEX)', profitH: '8 000 — 15 000', risk: 'Moyen', riskBadge: 'badge-yellow', crimestat: 'CS1-CS2', recommended: 'Débutant contrebandier' },
  { activity: 'Transport Néon (labs)', profitH: '6 000 — 12 000', risk: 'Moyen', riskBadge: 'badge-yellow', crimestat: 'CS1-CS2', recommended: 'Solo, petit vaisseau' },
  { activity: 'Trafic WiDoW (JumpTown)', profitH: '30 000 — 80 000', risk: 'Extrême', riskBadge: 'badge-red', crimestat: 'CS2-CS3', recommended: 'Groupe organisé uniquement' },
  { activity: 'Transit Pyro → Stanton', profitH: '15 000 — 40 000', risk: 'Élevé', riskBadge: 'badge-red', crimestat: 'CS1-CS3', recommended: 'Pilote expérimenté' },
  { activity: 'Recel d\'objets volés', profitH: '5 000 — 20 000', risk: 'Faible', riskBadge: 'badge-green', crimestat: 'CS1', recommended: 'Tout niveau' },
  { activity: 'Pillage d\'épaves', profitH: '4 000 — 15 000', risk: 'Moyen', riskBadge: 'badge-yellow', crimestat: 'CS1-CS2', recommended: 'Solo ou duo' },
  { activity: 'Commerce Maze (labs)', profitH: '7 000 — 14 000', risk: 'Moyen', riskBadge: 'badge-yellow', crimestat: 'CS1-CS2', recommended: 'Intermédiaire' },
  { activity: 'Contrebande inter-système', profitH: '20 000 — 60 000', risk: 'Très élevé', riskBadge: 'badge-red', crimestat: 'CS2-CS3', recommended: 'Vétéran, vaisseau furtif' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Factions du marché noir
══════════════════════════════════════════════════════════════ */

const BLACK_MARKET_FACTIONS = [
  {
    name: 'Grim HEX',
    icon: Skull,
    color: 'text-danger-400',
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    location: 'Orbite de Yela, système Stanton',
    description: 'Station hors-la-loi principale de Stanton. Hub central du marché noir où toutes les marchandises illégales sont acceptées sans questions. Aucun scan à l\'approche.',
    accepts: ['SLAM', 'Néon', 'WiDoW', 'Maze', 'Objets volés', 'Composants illégaux'],
    services: ['Terminal de vente marché noir', 'Réparation & ravitaillement', 'Magasin d\'armes', 'Armistice zone (sécurité relative)'],
    tip: 'Grim HEX est le point de départ idéal pour tout contrebandier. Familiarisez-vous avec ses couloirs et ses accès avant de commencer vos opérations.',
  },
  {
    name: 'Nine Tails',
    icon: Target,
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    bg: 'bg-warning-500/10',
    location: 'Positions variables, système Stanton & Pyro',
    description: 'Organisation pirate majeure qui propose des missions spéciales de contrebande et de sabotage. Leurs opérations incluent des blocus de stations et des raids de convois.',
    accepts: ['Armes illégales', 'Fournitures militaires', 'Drogues (toutes)', 'Intel volé'],
    services: ['Missions de contrebande rémunérées', 'Contrats d\'attaque de convoi', 'Protection temporaire en zone Pyro', 'Accès à des labs exclusifs'],
    tip: 'Augmenter votre réputation Nine Tails débloque des missions plus lucratives. Attention : cela détériore votre réputation UEE.',
  },
  {
    name: 'Locations secrètes',
    icon: MapPin,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    location: 'Dispersées dans Stanton et Pyro',
    description: 'Petits avant-postes, grottes et installations cachées servant de points de vente discrets. Leurs emplacements changent et se découvrent par le bouche-à-oreille ou l\'exploration.',
    accepts: ['Variable selon le contact', 'Souvent spécialisé (drogues OU armes)', 'Objets rares et uniques'],
    services: ['Prix premium sur certaines marchandises', 'Anonymat total', 'Contacts pour missions spéciales', 'Informations sur d\'autres locations'],
    tip: 'Explorez les lunes de Crusader et les grottes de Daymar pour trouver des labs cachés. Les coordonnées se partagent entre contrebandiers de confiance.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tips de contrebande
══════════════════════════════════════════════════════════════ */

const SMUGGLING_TIPS = [
  {
    title: 'Connaissez vos routes',
    text: 'Mémorisez les distances QT entre vos points d\'achat et de vente. Préprogrammez vos destinations pour un départ instantané en cas de danger. Chaque seconde compte quand vous transportez de l\'illégal.',
    icon: Navigation,
  },
  {
    title: 'Investissez dans la furtivité',
    text: 'Les composants Stealth (power plant, boucliers, coolers) réduisent drastiquement votre signature EM et IR. Un vaisseau invisible est un vaisseau qui ne sera jamais scanné.',
    icon: Eye,
  },
  {
    title: 'Ne mettez jamais tous vos œufs dans le même panier',
    text: 'Divisez votre cargaison en plusieurs voyages plutôt qu\'un seul gros chargement. La perte d\'un petit lot est bien moins douloureuse que la perte de tout votre investissement.',
    icon: Package,
  },
  {
    title: 'Variez vos horaires et vos routes',
    text: 'Les chasseurs de primes et les forces de l\'ordre repèrent les patterns. Ne faites jamais la même route au même moment. Alternez entre plusieurs circuits pour rester imprévisible.',
    icon: Clock,
  },
  {
    title: 'Gardez toujours un plan d\'évasion',
    text: 'Ayez une destination QT de secours prête en permanence. Si un scan commence, spoolez immédiatement votre drive quantique. Mieux vaut fuir et revenir que de se faire prendre.',
    icon: Zap,
  },
  {
    title: 'Surveillez le chat et les comms',
    text: 'Les joueurs signalent souvent les checkpoints et les blocus dans le chat global. Restez attentif aux avertissements de la communauté et partagez vos observations (avec prudence).',
    icon: Radio,
  },
  {
    title: 'Gérez votre CrimeStat',
    text: 'Ne laissez jamais votre CrimeStat monter au-delà de CS2 pour de la simple contrebande. Utilisez les terminaux de hack pour réduire votre CS régulièrement. Un CS3+ attire trop d\'attention.',
    icon: Shield,
  },
  {
    title: 'Trouvez des alliés de confiance',
    text: 'Un contrebandier solo est vulnérable. Rejoignez une organisation ou formez un petit groupe de confiance. Un escorteur pendant que vous transportez multiplie vos chances de survie.',
    icon: Star,
  },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANTS INTERNES
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, iconColor, badge, badgeColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card border border-space-400/20">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <Icon className={clsx('w-5 h-5 flex-shrink-0', iconColor)} />
          <span className="font-bold text-slate-200">{title}</span>
          {badge && <span className={clsx('badge', badgeColor)}>{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function DifficultyDots({ level, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={clsx(
            'w-2 h-2 rounded-full',
            i < level ? 'bg-danger-400' : 'bg-space-600',
          )}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function SmugglingGuide() {
  const [expandedCommodity, setExpandedCommodity] = useState(null);
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const match = (/** @type {string[]} */ ...fields) =>
    !q || fields.some(f => f && f.toLowerCase().includes(q));

  const filteredCommodities = ILLEGAL_COMMODITIES.filter(c =>
    match(c.name, c.type, c.description, c.buyLocations, c.sellPrice),
  );
  const filteredRoutes = SMUGGLING_ROUTES.filter(r =>
    match(r.name, r.goods, r.buy, r.sell, ...r.tips),
  );
  const filteredRiskReward = RISK_REWARD_TABLE.filter(r =>
    match(r.activity, r.risk, r.crimestat, r.recommended),
  );
  const filteredFactions = BLACK_MARKET_FACTIONS.filter(f =>
    match(f.name, f.location, f.description, ...f.accepts),
  );
  const filteredTips = SMUGGLING_TIPS.filter(t => match(t.title, t.text));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Package className="w-7 h-7 text-warning-400" />
            Contrebande &amp; Marché Noir
          </h1>
          <span className="badge badge-red">Alpha 4.6</span>
          <span className="badge badge-purple">Illégal</span>
        </div>
        <p className="page-subtitle mt-1">
          Guide complet du commerce illégal dans Star Citizen — marchandises interdites, routes de contrebande, évasion de scanners et factions du marché noir
        </p>
      </div>

      {/* ── STATS RAPIDES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Marchandises illégales', value: String(ILLEGAL_COMMODITIES.length), color: 'text-danger-400', icon: Package },
          { label: 'Routes contrebande', value: String(SMUGGLING_ROUTES.length), color: 'text-warning-400', icon: Navigation },
          { label: 'Factions marché noir', value: String(BLACK_MARKET_FACTIONS.length), color: 'text-purple-400', icon: Skull },
          { label: 'Tips de survie', value: String(SMUGGLING_TIPS.length), color: 'text-gold-400', icon: Star },
        ].map(s => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={clsx('flex-shrink-0', s.color)}>
                <SIcon className="w-6 h-6" />
              </div>
              <div>
                <div className={clsx('text-xl font-bold font-display', s.color)}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AVERTISSEMENT ── */}
      <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/30 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-300">
          <strong className="text-danger-400">Avertissement :</strong> La contrebande et le trafic de marchandises illégales génèrent du CrimeStat dans Star Citizen. Ce guide est purement informatif et couvre les mécaniques de jeu. Les activités décrites entraînent des conséquences in-game sérieuses (poursuites, emprisonnement, perte de marchandise).
        </div>
      </div>

      {/* ── BARRE DE RECHERCHE ── */}
      <div className="card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher une marchandise, route, faction..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-space-800 border border-space-400/20 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
         SECTION 1 — Marchandises illégales
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-danger-400" />
          Marchandises illégales
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommodities.map(commodity => {
            const CIcon = commodity.icon;
            const isExpanded = expandedCommodity === commodity.id;
            return (
              <div
                key={commodity.id}
                className={clsx('card border cursor-pointer transition-all', commodity.border, isExpanded && commodity.bg)}
                onClick={() => setExpandedCommodity(isExpanded ? null : commodity.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CIcon className={clsx('w-5 h-5', commodity.color)} />
                      <h3 className={clsx('font-bold', commodity.color)}>{commodity.name}</h3>
                    </div>
                    <span className={clsx('badge', commodity.riskBadge)}>{commodity.risk}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{commodity.type}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Prix de vente</span>
                    <span className="text-gold-400 font-bold">{commodity.sellPrice}</span>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-space-400/20 space-y-2 animate-fade-in">
                      <p className="text-sm text-slate-300">{commodity.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Achat</span>
                          <p className="text-slate-300">{commodity.buyLocations}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Statut légal</span>
                          <p className="text-slate-300">{commodity.legalStatus}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Détection</span>
                          <p className="text-slate-300">{commodity.detection}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Pénalité</span>
                          <p className="text-slate-300">{commodity.penalty}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredCommodities.length === 0 && (
          <p className="text-center text-slate-500 py-6 text-sm">Aucune marchandise ne correspond à votre recherche.</p>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
         SECTION 2 — Routes de contrebande
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-warning-400" />
          Routes de contrebande
        </h2>
        <div className="space-y-3">
          {filteredRoutes.map(route => (
            <ExpandableSection
              key={route.id}
              title={route.name}
              icon={MapPin}
              iconColor="text-cyan-400"
              badge={route.risk}
              badgeColor={route.riskBadge}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Marchandises</span>
                  <span className="text-slate-200">{route.goods}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Achat</span>
                  <span className="text-slate-200">{route.buy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vente</span>
                  <span className="text-slate-200">{route.sell}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Temps estimé</span>
                  <span className="text-slate-200">{route.time}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-bold text-gold-400">Profit estimé : {route.profitEstimate}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-semibold">Conseils pour cette route :</span>
                {route.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          ))}
        </div>
        {filteredRoutes.length === 0 && (
          <p className="text-center text-slate-500 py-6 text-sm">Aucune route ne correspond à votre recherche.</p>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
         SECTION 3 — Évasion de scanners
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          Évasion de scanners
        </h2>
        <div className="space-y-3">
          {SCANNER_EVASION.map((section, idx) => (
            <ExpandableSection
              key={idx}
              title={section.title}
              icon={section.icon}
              iconColor={section.color}
            >
              <ul className="space-y-2">
                {section.content.map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         SECTION 4 — Risque vs Récompense
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gold-400" />
          Risque vs Récompense
        </h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left p-3 text-slate-400 font-semibold">Activité</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Profit/h</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Risque</th>
                <th className="text-left p-3 text-slate-400 font-semibold">CrimeStat</th>
                <th className="text-left p-3 text-slate-400 font-semibold">Recommandé</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiskReward.map((row, i) => (
                <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/40 transition-colors">
                  <td className="p-3 text-slate-200 font-medium">{row.activity}</td>
                  <td className="p-3 text-gold-400 font-bold whitespace-nowrap">{row.profitH}</td>
                  <td className="p-3">
                    <span className={clsx('badge', row.riskBadge)}>{row.risk}</span>
                  </td>
                  <td className="p-3 text-danger-400 font-mono text-xs">{row.crimestat}</td>
                  <td className="p-3 text-slate-400 text-xs">{row.recommended}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRiskReward.length === 0 && (
            <p className="text-center text-slate-500 py-6 text-sm">Aucun résultat.</p>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         SECTION 5 — Factions du marché noir
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Skull className="w-5 h-5 text-danger-400" />
          Factions du marché noir
        </h2>
        <div className="space-y-3">
          {filteredFactions.map((faction, idx) => {
            const FIcon = faction.icon;
            return (
              <ExpandableSection
                key={idx}
                title={faction.name}
                icon={faction.icon}
                iconColor={faction.color}
                defaultOpen={idx === 0}
              >
                <p className="text-sm text-slate-300">{faction.description}</p>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {faction.location}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Marchandises acceptées</span>
                    <div className="flex flex-wrap gap-1">
                      {faction.accepts.map((item, i) => (
                        <span key={i} className="badge badge-slate text-xs">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Services disponibles</span>
                    <ul className="space-y-1">
                      {faction.services.map((service, i) => (
                        <li key={i} className="flex gap-1.5 text-xs text-slate-300">
                          <span className="text-cyan-400">•</span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2 p-3 rounded-lg bg-space-700/60 border border-space-400/20">
                  <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 italic">{faction.tip}</p>
                </div>
              </ExpandableSection>
            );
          })}
        </div>
        {filteredFactions.length === 0 && (
          <p className="text-center text-slate-500 py-6 text-sm">Aucune faction ne correspond à votre recherche.</p>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
         SECTION 6 — Tips de contrebande
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Conseils du contrebandier
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredTips.map((tip, i) => {
            const TIcon = tip.icon;
            return (
              <div key={i} className="card p-4 border border-space-400/20 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <TIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm mb-1">{tip.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredTips.length === 0 && (
          <p className="text-center text-slate-500 py-6 text-sm">Aucun conseil ne correspond à votre recherche.</p>
        )}
      </section>

      {/* ── FOOTER ── */}
      <div className="card p-4 border border-space-400/20 text-center">
        <p className="text-xs text-slate-500">
          Données basées sur Star Citizen Alpha 4.6 — Les prix, routes et mécaniques peuvent évoluer avec les mises à jour.
          Le commerce illégal comporte des risques in-game significatifs. Bon contrebandage, citoyen !
        </p>
      </div>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="contrebande" />
    </div>
  );
}
