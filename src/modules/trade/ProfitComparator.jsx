import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  TrendingUp, Star, Shield, AlertTriangle, Zap, Users, User,
  Package, Pickaxe, Target, Truck, Wrench, ShoppingBag,
  ChevronRight, Calculator, BarChart3, Clock, Crosshair,
  Anchor, Flame, DollarSign, Filter, RotateCcw, Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

// ─────────────────────────────────────────────────────────────
// DONNÉES — activités de jeu
// ─────────────────────────────────────────────────────────────

const SHIPS_LIST = [
  { id: 'any',          label: 'Peu importe' },
  { id: 'aurora',       label: 'RSI Aurora MR' },
  { id: 'avenger',      label: 'Aegis Avenger Titan' },
  { id: 'cutlass',      label: 'Drake Cutlass Black' },
  { id: 'freelancer',   label: 'MISC Freelancer MAX' },
  { id: 'prospector',   label: 'MISC Prospector' },
  { id: 'mole',         label: 'ARGO MOLE' },
  { id: 'vulture',      label: 'Drake Vulture' },
  { id: 'constellation',label: 'RSI Constellation Andromeda' },
  { id: 'caterpillar',  label: 'Drake Caterpillar' },
  { id: 'hull_c',       label: 'MISC Hull C' },
  { id: 'gladius',      label: 'Aegis Gladius' },
  { id: 'arrow',        label: 'Anvil Arrow' },
  { id: 'hammerhead',   label: 'Aegis Hammerhead' },
  { id: 'reclaimer',    label: 'Aegis Reclaimer' },
];

// Niveau de risque 0-3 : 0=faible, 1=modéré, 2=élevé, 3=très élevé
const ACTIVITIES = [
  {
    id: 'roc_mining',
    name: 'Minage à la Main (ROC)',
    icon: Pickaxe,
    baseAuecPerHour: 35000,
    risk: 0,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton'],
    requiredShips: ['any', 'cutlass', 'freelancer', 'constellation', 'caterpillar'],
    category: 'industrie',
    description: 'Minage terrestre avec le ROC. Idéal pour débuter, risque minimal.',
    guidePath: '/mining',
    pyroBonus: 0,
    tip: 'Empiler plusieurs sessions consécutives. Rechercher des gisements de Quantainium.',
  },
  {
    id: 'ship_mining_solo',
    name: 'Minage Vaisseau Solo',
    icon: Pickaxe,
    baseAuecPerHour: 80000,
    risk: 1,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['prospector'],
    category: 'industrie',
    description: 'Minage spatial avec le Prospector. Bonne rentabilité en solo.',
    guidePath: '/mining',
    pyroBonus: 0.20,
    tip: 'Viser le Quantainium dans les ceintures d\'astéroïdes. Vendre à Port Olisar ou Lorville.',
  },
  {
    id: 'ship_mining_team',
    name: 'Minage Vaisseau Équipe',
    icon: Pickaxe,
    baseAuecPerHour: 120000,
    risk: 1,
    solo: false,
    legal: true,
    minCrew: 2,
    maxCrew: 4,
    systems: ['stanton', 'pyro'],
    requiredShips: ['mole'],
    category: 'industrie',
    description: 'Minage avec le MOLE, nécessite un équipage. Rentabilité supérieure.',
    guidePath: '/mining',
    pyroBonus: 0.25,
    tip: 'Rôles : pilote + 2-3 opérateurs laser. Communication essentielle pour éviter les explosions.',
  },
  {
    id: 'salvage_solo',
    name: 'Salvage Solo (Vulture)',
    icon: Wrench,
    baseAuecPerHour: 60000,
    risk: 0,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['vulture'],
    category: 'industrie',
    description: 'Récupération d\'épaves avec le Vulture. Risque faible, revenus stables.',
    guidePath: '/salvage',
    pyroBonus: 0.15,
    tip: 'Les épaves de gros vaisseaux (Reclaimer, Hammerhead) donnent les meilleurs rendements.',
  },
  {
    id: 'trade_cargo_small',
    name: 'Commerce Cargo Moyen',
    icon: Package,
    baseAuecPerHour: 70000,
    risk: 0,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['freelancer', 'cutlass', 'constellation'],
    category: 'commerce',
    description: 'Routes commerciales légales avec un vaisseau cargo moyen.',
    guidePath: '/commerce',
    pyroBonus: 0.10,
    tip: 'Top route : Agricium depuis Lyria, vendre à Port Olisar. ~25 SCU/rotation.',
  },
  {
    id: 'trade_cargo_large',
    name: 'Commerce Gros Cargo',
    icon: Truck,
    baseAuecPerHour: 150000,
    risk: 1,
    solo: false,
    legal: true,
    minCrew: 1,
    maxCrew: 3,
    systems: ['stanton'],
    requiredShips: ['hull_c', 'caterpillar'],
    category: 'commerce',
    description: 'Routes commerciales avec Hull C ou Caterpillar. Très rentable mais gestion logistique complexe.',
    guidePath: '/commerce',
    pyroBonus: 0,
    tip: 'Nécessite une planification des routes. Éviter les zones à pirates. Assurez-vous d\'avoir un escorteur.',
  },
  {
    id: 'delivery_missions',
    name: 'Missions de Livraison',
    icon: ShoppingBag,
    baseAuecPerHour: 25000,
    risk: 0,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['any'],
    category: 'missions',
    description: 'Missions de livraison de colis depuis les terminaux de mission. Facile et accessible.',
    guidePath: '/missions',
    pyroBonus: 0.05,
    tip: 'Empiler 3-5 livraisons dans la même zone. Les missions prioritaires paient mieux.',
  },
  {
    id: 'combat_missions',
    name: 'Missions Combat Solo (CS1-CS2)',
    icon: Target,
    baseAuecPerHour: 55000,
    risk: 1,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['gladius', 'arrow', 'cutlass', 'constellation', 'avenger'],
    category: 'combat',
    description: 'Missions de chasse aux criminels légères à modérées. Bon compromis risque/récompense.',
    guidePath: '/missions',
    pyroBonus: 0.15,
    tip: 'Commencer par CS1 pour l\'équipement, puis monter en CS2. Emporter des munitions de rechange.',
  },
  {
    id: 'bounty_hunting',
    name: 'Bounty Hunting (CS3-CS5)',
    icon: Crosshair,
    baseAuecPerHour: 100000,
    risk: 2,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['gladius', 'arrow', 'cutlass', 'constellation', 'hammerhead'],
    category: 'combat',
    description: 'Chasse aux primes de haute valeur. Très lucratif mais danger élevé.',
    guidePath: '/missions',
    pyroBonus: 0.30,
    tip: 'Investir dans un vaisseau de chasse bien équipé. Missions CS4-CS5 nécessitent de l\'expérience.',
  },
  {
    id: 'wikelo_crafting',
    name: 'Artisanat Wikelo',
    icon: Zap,
    baseAuecPerHour: 45000,
    risk: 0,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton'],
    requiredShips: ['any'],
    category: 'industrie',
    description: 'Artisanat via les blueprints NPC (Wikelo). Revenus passifs et stables.',
    guidePath: '/artisanat',
    pyroBonus: 0,
    tip: 'Créer des composants demandés et les vendre en surplus. Combiner avec d\'autres activités.',
  },
  {
    id: 'escort_missions',
    name: "Missions d'Escorte",
    icon: Shield,
    baseAuecPerHour: 40000,
    risk: 1,
    solo: true,
    legal: true,
    minCrew: 1,
    maxCrew: 1,
    systems: ['stanton', 'pyro'],
    requiredShips: ['gladius', 'arrow', 'cutlass', 'constellation'],
    category: 'combat',
    description: 'Protéger des convois ou personnages importants. Missions variées et intéressantes.',
    guidePath: '/missions',
    pyroBonus: 0.10,
    tip: 'Vérifier la distance de la mission avant d\'accepter. Emporter du carburant QT suffisant.',
  },
  {
    id: 'piracy',
    name: 'Piraterie Cargo',
    icon: Flame,
    baseAuecPerHour: 130000,
    risk: 3,
    solo: false,
    legal: false,
    minCrew: 1,
    maxCrew: 4,
    systems: ['stanton', 'pyro'],
    requiredShips: ['cutlass', 'caterpillar', 'constellation', 'hammerhead'],
    category: 'criminel',
    description: 'Attaque de vaisseaux cargo pour récupérer leurs marchandises. ILLÉGAL — crime stat élevé.',
    guidePath: null,
    pyroBonus: 0.20,
    tip: 'Risque élevé : crime stat, réponse UEE, représailles. Nécessite un équipage coordonné.',
  },
];

// ─────────────────────────────────────────────────────────────
// CONSTANTES UI
// ─────────────────────────────────────────────────────────────

const RISK_CONFIG = {
  0: { label: 'Faible',      color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: '#10b981' },
  1: { label: 'Modéré',      color: 'text-yellow-400',  bg: 'bg-yellow-500/15',  border: 'border-yellow-500/30',  bar: '#eab308' },
  2: { label: 'Élevé',       color: 'text-orange-400',  bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  bar: '#f97316' },
  3: { label: 'Très Élevé',  color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/30',     bar: '#ef4444' },
};

const MAX_AUEC_PER_HOUR = Math.max(...ACTIVITIES.map(a => a.baseAuecPerHour));

// Objectifs vaisseau pour le simulateur
const SHIP_GOALS = [
  { id: 'cutlass',      label: 'Drake Cutlass Black',      price: 1_000_000 },
  { id: 'prospector',   label: 'MISC Prospector',          price: 2_061_000 },
  { id: 'freelancer',   label: 'MISC Freelancer MAX',      price: 2_800_000 },
  { id: 'vulture',      label: 'Drake Vulture',            price: 2_800_000 },
  { id: 'constellation',label: 'RSI Constellation Andromeda', price: 5_000_000 },
  { id: 'mole',         label: 'ARGO MOLE',                price: 5_130_000 },
  { id: 'caterpillar',  label: 'Drake Caterpillar',        price: 6_800_000 },
  { id: 'reclaimer',    label: 'Aegis Reclaimer',          price: 11_200_000 },
  { id: 'hull_c',       label: 'MISC Hull C',              price: 12_000_000 },
  { id: 'hammerhead',   label: 'Aegis Hammerhead',         price: 16_500_000 },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatAuec(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
}

function formatAuecFull(value) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value)) + ' aUEC';
}

function calcScore(activity, params) {
  const { ship, riskTolerance, system, soloOnly } = params;

  // Filtres éliminatoires
  if (soloOnly && !activity.solo) return null;
  if (riskTolerance === 'faible' && activity.risk > 0) return null;
  if (riskTolerance === 'moderee' && activity.risk > 2) return null;
  if (system !== 'les_deux' && !activity.systems.includes(system)) return null;

  // Calcul revenus de base
  let auecPerHour = activity.baseAuecPerHour;

  // Bonus Pyro
  if (system === 'pyro') auecPerHour *= (1 + activity.pyroBonus);

  // Compatibilité vaisseau → bonus si compatible
  const shipCompatible = ship === 'any' || activity.requiredShips.includes(ship) || activity.requiredShips.includes('any');
  const shipBonus = shipCompatible && ship !== 'any' ? 1.10 : 1;
  auecPerHour *= shipBonus;

  return Math.round(auecPerHour);
}

function isRecommended(activity, params) {
  const { ship, riskTolerance, system, soloOnly } = params;
  if (soloOnly && !activity.solo) return false;
  if (riskTolerance === 'faible' && activity.risk > 1) return false;
  if (riskTolerance === 'moderee' && activity.risk > 2) return false;
  const shipMatch = ship === 'any' || activity.requiredShips.includes(ship) || activity.requiredShips.includes('any');
  const systemMatch = system === 'les_deux' || activity.systems.includes(system);
  return shipMatch && systemMatch;
}

// ─────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────

function RiskBadge({ risk }) {
  const cfg = RISK_CONFIG[risk];
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cfg.bg, cfg.color, cfg.border)}>
      {risk >= 2 && <AlertTriangle size={10} />}
      {risk === 0 && <Shield size={10} />}
      {cfg.label}
    </span>
  );
}

function TagBadge({ children, variant = 'default' }) {
  const variants = {
    default:  'bg-slate-700/50 text-slate-400 border-slate-600/40',
    illegal:  'bg-red-500/15 text-red-400 border-red-500/30',
    multi:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
    solo:     'bg-slate-600/30 text-slate-400 border-slate-500/30',
    legal:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border', variants[variant] ?? variants.default)}>
      {children}
    </span>
  );
}

function ProfitBar({ value, max }) {
  const pct = Math.round((value / max) * 100);
  const color =
    pct >= 80 ? 'bg-emerald-500' :
    pct >= 55 ? 'bg-cyan-500' :
    pct >= 35 ? 'bg-yellow-500' :
    'bg-slate-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-12 text-right">{pct}%</span>
    </div>
  );
}

function ActivityCard({ activity, auecPerHour, timeHours, recommended, navigate }) {
  const Icon = activity.icon;
  const profitForSession = Math.round(auecPerHour * timeHours);
  const cfg = RISK_CONFIG[activity.risk];

  return (
    <div className={clsx(
      'card p-4 transition-all duration-200 hover:border-cyan-500/25 relative group',
      recommended && 'border-cyan-500/30 bg-cyan-500/5',
    )}>
      {recommended && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-900 text-xs font-bold shadow-lg shadow-cyan-500/25">
          <Star size={10} fill="currentColor" />
          Recommandé
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={clsx('p-1.5 rounded-lg flex-shrink-0', cfg.bg, cfg.border, 'border')}>
            <Icon size={16} className={cfg.color} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-200 text-sm leading-tight truncate">{activity.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-cyan-400">{formatAuec(auecPerHour)}</div>
          <div className="text-xs text-slate-500">aUEC/h</div>
        </div>
      </div>

      {/* Barre de rentabilité */}
      <ProfitBar value={auecPerHour} max={MAX_AUEC_PER_HOUR} />

      {/* Profit pour la session */}
      <div className="mt-2 mb-3 flex items-center gap-1.5 text-sm">
        <Clock size={12} className="text-slate-500 flex-shrink-0" />
        <span className="text-slate-400">Session {timeHours}h :</span>
        <span className="font-semibold text-emerald-400 ml-auto">{formatAuecFull(profitForSession)}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <RiskBadge risk={activity.risk} />
        {activity.solo
          ? <TagBadge variant="solo"><User size={10} /> Solo</TagBadge>
          : <TagBadge variant="multi"><Users size={10} /> Équipe</TagBadge>
        }
        {activity.legal
          ? <TagBadge variant="legal"><Shield size={10} /> Légal</TagBadge>
          : <TagBadge variant="illegal"><AlertTriangle size={10} /> Illégal</TagBadge>
        }
      </div>

      {/* Tip */}
      <div className="text-xs text-slate-500 italic border-t border-slate-700/50 pt-2 mb-3 leading-relaxed">
        {activity.tip}
      </div>

      {/* Action */}
      {activity.guidePath && (
        <button
          onClick={() => navigate(activity.guidePath)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 hover:bg-cyan-500/15 border border-slate-600/50 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all"
        >
          Voir le guide <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// Tooltip personnalisé Recharts
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-sm max-w-48">
      <p className="font-semibold text-slate-200 mb-1 leading-tight">{d.name}</p>
      <p className="text-cyan-400 font-bold">{formatAuecFull(d.auecPerHour)}/h</p>
      <p className="text-slate-400 text-xs mt-0.5">{RISK_CONFIG[d.risk].label} risque</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function ProfitComparator() {
  const navigate = useNavigate();

  // ── Paramètres joueur ──
  const [ship, setShip]               = useState('any');
  const [timeHours, setTimeHours]     = useState(2);
  const [riskTolerance, setRisk]      = useState('moderee');
  const [system, setSystem]           = useState('stanton');
  const [soloOnly, setSoloOnly]       = useState(false);

  // ── Simulateur ──
  const [simActivity, setSimActivity] = useState('bounty_hunting');
  const [simSessions, setSimSessions] = useState(5);
  const [simDuration, setSimDuration] = useState(2);
  const [simGoal, setSimGoal]         = useState('constellation');

  // ── Filtre catégorie graphique ──
  const [chartFilter, setChartFilter] = useState('all');

  // ── Calcul des activités filtrées + scorées ──
  const params = useMemo(() => ({ ship, riskTolerance, system, soloOnly }), [ship, riskTolerance, system, soloOnly]);

  const scoredActivities = useMemo(() => {
    return ACTIVITIES.map(act => {
      const auecPerHour = calcScore(act, params);
      const recommended = auecPerHour !== null && isRecommended(act, params);
      return { ...act, auecPerHour, recommended };
    })
      .filter(a => a.auecPerHour !== null)
      .sort((a, b) => b.auecPerHour - a.auecPerHour);
  }, [params]);

  const filteredForChart = useMemo(() => {
    const list = chartFilter === 'all'
      ? scoredActivities
      : scoredActivities.filter(a => a.category === chartFilter);
    return list.map(a => ({
      id: a.id,
      name: a.name.length > 22 ? a.name.slice(0, 22) + '…' : a.name,
      fullName: a.name,
      auecPerHour: a.auecPerHour,
      risk: a.risk,
    }));
  }, [scoredActivities, chartFilter]);

  // ── Simulateur ──
  const simResult = useMemo(() => {
    const act = ACTIVITIES.find(a => a.id === simActivity);
    if (!act) return null;
    const auecPerHour = act.baseAuecPerHour;
    const perSession  = auecPerHour * simDuration;
    const perWeek     = perSession * simSessions;
    const perMonth    = perWeek * 4;
    const goal        = SHIP_GOALS.find(g => g.id === simGoal);
    const weeksNeeded = goal ? Math.ceil(goal.price / perWeek) : null;
    return { act, auecPerHour, perSession, perWeek, perMonth, goal, weeksNeeded };
  }, [simActivity, simSessions, simDuration, simGoal]);

  const handleReset = useCallback(() => {
    setShip('any');
    setTimeHours(2);
    setRisk('moderee');
    setSystem('stanton');
    setSoloOnly(false);
  }, []);

  const CHART_CATEGORIES = [
    { id: 'all',       label: 'Tout' },
    { id: 'commerce',  label: 'Commerce' },
    { id: 'industrie', label: 'Industrie' },
    { id: 'combat',    label: 'Combat' },
    { id: 'missions',  label: 'Missions' },
    { id: 'criminel',  label: 'Criminel' },
  ];

  return (
    <div className="space-y-8">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <TrendingUp className="text-cyan-400" size={28} />
            Comparateur de Rentabilité
          </h1>
          <p className="text-slate-400 mt-1">
            Trouvez l'activité la plus lucrative pour votre profil
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Info size={14} className="text-cyan-500/70" />
          <span>Valeurs moyennes estimées — Alpha 4.6</span>
        </div>
      </div>

      {/* ── Section 1 : Paramètres ── */}
      <section>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Filter size={18} className="text-cyan-400" />
          Paramètres du Joueur
        </h2>
        <div className="card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Vaisseau */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Vaisseau principal
              </label>
              <select
                value={ship}
                onChange={e => setShip(e.target.value)}
                className="select w-full"
              >
                {SHIPS_LIST.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Système */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Système préféré
              </label>
              <select
                value={system}
                onChange={e => setSystem(e.target.value)}
                className="select w-full"
              >
                <option value="stanton">Stanton</option>
                <option value="pyro">Pyro</option>
                <option value="les_deux">Les deux</option>
              </select>
            </div>

            {/* Temps disponible */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Temps disponible :
                <span className="ml-2 text-cyan-400 font-bold">
                  {timeHours < 1 ? `${timeHours * 60} min` : `${timeHours}h`}
                </span>
              </label>
              <input
                type="range"
                min={0.5}
                max={8}
                step={0.5}
                value={timeHours}
                onChange={e => setTimeHours(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>30 min</span>
                <span>8h</span>
              </div>
            </div>

            {/* Tolérance risque */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tolérance au risque
              </label>
              <div className="flex gap-2">
                {[
                  { val: 'faible',   label: 'Faible',   color: 'emerald' },
                  { val: 'moderee',  label: 'Modérée',  color: 'yellow' },
                  { val: 'elevee',   label: 'Élevée',   color: 'red' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setRisk(opt.val)}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      riskTolerance === opt.val
                        ? opt.color === 'emerald' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : opt.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                          : 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-slate-700/40 border-slate-600/50 text-slate-400 hover:border-slate-500/70',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Solo uniquement */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setSoloOnly(v => !v)}
                  className={clsx(
                    'relative w-10 h-5 rounded-full transition-colors border cursor-pointer',
                    soloOnly
                      ? 'bg-cyan-500/30 border-cyan-500/50'
                      : 'bg-slate-700/60 border-slate-600/50',
                  )}
                >
                  <div className={clsx(
                    'absolute top-0.5 w-4 h-4 rounded-full transition-all shadow',
                    soloOnly ? 'left-5 bg-cyan-400' : 'left-0.5 bg-slate-400',
                  )} />
                </div>
                <span className="text-sm font-medium text-slate-300">
                  Jeu solo uniquement
                </span>
              </label>
            </div>

            {/* Reset */}
            <div className="flex flex-col justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-slate-400 hover:text-slate-200 transition-all"
              >
                <RotateCcw size={14} />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2 : Classement ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2 mb-0">
            <BarChart3 size={18} className="text-cyan-400" />
            Classement des Activités
          </h2>
          <span className="text-sm text-slate-500">
            {scoredActivities.length} activité{scoredActivities.length !== 1 ? 's' : ''} affichée{scoredActivities.length !== 1 ? 's' : ''}
          </span>
        </div>

        {scoredActivities.length === 0 ? (
          <div className="card p-8 text-center">
            <AlertTriangle size={40} className="mx-auto mb-3 text-yellow-500/60" />
            <p className="text-slate-400 font-medium">Aucune activité ne correspond à vos critères.</p>
            <p className="text-slate-500 text-sm mt-1">Essayez d'assouplir la tolérance au risque ou d'autoriser le jeu en équipe.</p>
            <button onClick={handleReset} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <RotateCcw size={14} /> Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scoredActivities.map((act, idx) => (
              <div key={act.id} className="relative">
                {idx === 0 && (
                  <div className="absolute -top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 text-xs font-bold shadow-lg">
                    <DollarSign size={10} /> #1 Meilleur revenu
                  </div>
                )}
                <ActivityCard
                  activity={act}
                  auecPerHour={act.auecPerHour}
                  timeHours={timeHours}
                  recommended={act.recommended}
                  navigate={navigate}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3 : Graphique comparatif ── */}
      <section>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-cyan-400" />
          Comparaison Graphique
        </h2>
        <div className="card p-5">
          {/* Filtre catégorie */}
          <div className="flex flex-wrap gap-2 mb-5">
            {CHART_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setChartFilter(cat.id)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                  chartFilter === cat.id
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-700/40 border-slate-600/50 text-slate-400 hover:border-slate-500',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredForChart.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">Aucune activité dans cette catégorie avec les filtres actuels.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(280, filteredForChart.length * 44)}>
              <BarChart
                data={filteredForChart}
                layout="vertical"
                margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => `${formatAuec(v)}`}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  label={{ value: 'aUEC/h', position: 'insideRight', fill: '#64748b', fontSize: 11, offset: -4 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                <Bar dataKey="auecPerHour" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {filteredForChart.map(entry => (
                    <Cell key={entry.id} fill={RISK_CONFIG[entry.risk].bar} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Légende couleurs */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700/50 justify-center">
            {Object.entries(RISK_CONFIG).map(([k, cfg]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cfg.bar }} />
                {cfg.label} risque
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 : Simulateur de revenus ── */}
      <section>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-cyan-400" />
          Simulateur de Revenus
        </h2>
        <div className="card p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Activité</label>
                <select
                  value={simActivity}
                  onChange={e => setSimActivity(e.target.value)}
                  className="select w-full"
                >
                  {ACTIVITIES.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Sessions / semaine
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={simSessions}
                    onChange={e => setSimSessions(Math.max(1, Math.min(7, Number(e.target.value))))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Durée / session (h)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={8}
                    step={0.5}
                    value={simDuration}
                    onChange={e => setSimDuration(Math.max(0.5, Math.min(8, Number(e.target.value))))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Objectif vaisseau
                </label>
                <select
                  value={simGoal}
                  onChange={e => setSimGoal(e.target.value)}
                  className="select w-full"
                >
                  {SHIP_GOALS.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.label} — {formatAuecFull(g.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Résultats */}
            {simResult && (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/40">
                  <div className="text-xs text-slate-500 mb-1">Revenu par session</div>
                  <div className="text-xl font-bold text-cyan-400">{formatAuecFull(simResult.perSession)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/40">
                  <div className="text-xs text-slate-500 mb-1">Revenu par semaine</div>
                  <div className="text-xl font-bold text-emerald-400">{formatAuecFull(simResult.perWeek)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{simSessions} session{simSessions > 1 ? 's' : ''} × {simDuration}h</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-700/30 border border-slate-600/40">
                  <div className="text-xs text-slate-500 mb-1">Revenu par mois (×4)</div>
                  <div className="text-xl font-bold text-purple-400">{formatAuecFull(simResult.perMonth)}</div>
                </div>

                {simResult.goal && simResult.weeksNeeded !== null && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Anchor size={14} className="text-cyan-400" />
                      <span className="text-sm font-semibold text-cyan-300">Objectif {simResult.goal.label}</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Prix : <span className="text-slate-200 font-medium">{formatAuecFull(simResult.goal.price)}</span>
                    </div>
                    {simResult.weeksNeeded <= 0 ? (
                      <div className="text-emerald-400 font-bold mt-1">Vous avez déjà les fonds !</div>
                    ) : (
                      <div className="text-slate-300 mt-1">
                        Atteint dans{' '}
                        <span className="text-yellow-400 font-bold text-lg">{simResult.weeksNeeded}</span>
                        {' '}semaine{simResult.weeksNeeded > 1 ? 's' : ''}
                        <span className="text-slate-500 text-xs ml-1">
                          (~{Math.ceil(simResult.weeksNeeded / 4)} mois)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Note de bas de page ── */}
      <div className="flex items-start gap-2 text-xs text-slate-600 px-1">
        <Info size={13} className="flex-shrink-0 mt-0.5" />
        <span>
          Les revenus indiqués sont des estimations moyennes basées sur les données de la communauté SC (Alpha 4.6).
          Les valeurs réelles varient selon l'équipement, la compétence du joueur, l'état des serveurs et les fluctuations de prix.
          Le bonus Pyro reflète la difficulté accrue et la valeur des minerais et loot exclusifs au système.
        </span>
      </div>
    </div>
  );
}
