import React, { useState, useMemo } from 'react';
import { MISSION_TYPES_DATA, MISSION_FACTIONS } from '../../datasets/missions.js';
import { formatCredits } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Calculator, TrendingUp, Clock, Zap, Target,
  Package, Compass, Star, Shield, AlertTriangle,
  Info, ChevronDown, Users, User, UserCheck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------

const CATEGORY_ICONS = {
  combat:      Target,
  transport:   Package,
  industrie:   Star,
  exploration: Compass,
  service:     Shield,
  criminel:    AlertTriangle,
};

const DIFFICULTY_MULT = {
  Facile:           1.0,
  Moyen:            1.25,
  Difficile:        1.5,
  'Très Difficile': 1.8,
  Extrême:          2.2,
};

// Multiplicateurs groupe selon le type de mission
const GROUP_MULT = {
  // Certains types bénéficient peu du groupe (empilement solo)
  'delivery-standard':  { 1: 1.0, 2: 1.4, 4: 1.7 },
  'delivery-priority':  { 1: 1.0, 2: 1.3, 4: 1.6 },
  'delivery-illegal':   { 1: 1.0, 2: 1.3, 4: 1.5 },
  'cargo-hauling':      { 1: 1.0, 2: 1.5, 4: 2.2 },
  'cargo-bulk':         { 1: 1.0, 2: 1.8, 4: 3.0 },
  'vip-transport':      { 1: 1.0, 2: 1.2, 4: 1.5 },
  'bounty-lawful':      { 1: 1.0, 2: 1.6, 4: 2.5 },
  'bounty-illegal':     { 1: 1.0, 2: 1.5, 4: 2.2 },
  'patrol-escort':      { 1: 1.0, 2: 1.8, 4: 3.0 },
  'assassination':      { 1: 1.0, 2: 1.3, 4: 1.8 },
  'defense-outpost':    { 1: 1.0, 2: 1.7, 4: 3.2 },
  'pirate-clearing':    { 1: 1.0, 2: 1.6, 4: 2.8 },
  'mining-mission':     { 1: 1.0, 2: 1.9, 4: 3.5 },
  'mining-hazardous':   { 1: 1.0, 2: 2.0, 4: 4.0 },
  'salvage-mission':    { 1: 1.0, 2: 1.7, 4: 3.0 },
  'salvage-classified': { 1: 1.0, 2: 1.5, 4: 2.5 },
  'fuel-collection':    { 1: 1.0, 2: 1.4, 4: 2.2 },
  'data-run':           { 1: 1.0, 2: 1.3, 4: 1.7 },
  'investigation':      { 1: 1.0, 2: 1.2, 4: 1.5 },
  'survey-mission':     { 1: 1.0, 2: 1.4, 4: 2.0 },
  'jump-point-survey':  { 1: 1.0, 2: 1.3, 4: 1.8 },
  'alien-artifact':     { 1: 1.0, 2: 1.4, 4: 2.0 },
  'search-rescue':      { 1: 1.0, 2: 1.5, 4: 2.8 },
  'medical-evacuation': { 1: 1.0, 2: 1.6, 4: 3.0 },
  'repair-mission':     { 1: 1.0, 2: 1.4, 4: 2.2 },
  'refuel-mission':     { 1: 1.0, 2: 1.3, 4: 2.0 },
  'smuggling':          { 1: 1.0, 2: 1.4, 4: 2.0 },
  'espionage':          { 1: 1.0, 2: 1.2, 4: 1.6 },
  'heist':              { 1: 1.0, 2: 1.5, 4: 2.5 },
};

const DEFAULT_GROUP_MULT = { 1: 1.0, 2: 1.4, 4: 2.0 };

// Profils joueur
const PLAYER_PROFILES = [
  {
    id: 'debutant',
    label: 'Débutant',
    icon: User,
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/5',
    description: '< 1M aUEC',
    missions: [
      { id: 'delivery-standard', reason: 'Pas besoin de vaisseau cargo, missions simples.' },
      { id: 'survey-mission', reason: 'Exploration légale, réputation rapide.' },
      { id: 'pirate-clearing', reason: 'Bonne introduction au combat spatial.' },
    ],
  },
  {
    id: 'intermediaire',
    label: 'Intermédiaire',
    icon: UserCheck,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/5',
    description: '1M – 10M aUEC',
    missions: [
      { id: 'bounty-lawful', reason: 'Bons revenus avec un chasseur léger.' },
      { id: 'cargo-hauling', reason: 'Commerce efficace avec un Freelancer ou Cutlass.' },
      { id: 'salvage-mission', reason: 'Bon profit avec un Vulture en solo.' },
    ],
  },
  {
    id: 'avance',
    label: 'Avancé',
    icon: Users,
    color: 'text-gold-400',
    borderColor: 'border-gold-500/30',
    bgColor: 'bg-gold-500/5',
    description: '> 10M aUEC',
    missions: [
      { id: 'mining-hazardous', reason: 'Top revenus avec Mole en équipe.' },
      { id: 'assassination', reason: 'Hautes primes, peu de concurrents.' },
      { id: 'jump-point-survey', reason: 'Missions rares très lucratives (Pyro 4.0).' },
    ],
  },
];

// ----------------------------------------------------------------
// Fonctions de calcul
// ----------------------------------------------------------------

function calcEarnings(mission, params, groupSize) {
  if (!mission) return null;
  const basePayout = Math.round((mission.payout.min + mission.payout.max) / 2);
  const repBonus   = 1 + (params.repBonus / 100);
  const diffMult   = DIFFICULTY_MULT[mission.difficulty] || 1;
  const grpMults   = GROUP_MULT[mission.id] || DEFAULT_GROUP_MULT;
  const grpMult    = grpMults[groupSize] || 1;

  const totalPayout      = Math.round(basePayout * repBonus * diffMult * grpMult);
  const payoutPerPlayer  = Math.round(totalPayout / groupSize);

  const travelTime       = params.travelMinutes;
  const prepTime         = params.prepMinutes;
  const totalTimePerRun  = mission.estimatedTime + travelTime + prepTime;

  const runsPerHour      = 60 / totalTimePerRun;
  const payoutPerHour    = Math.round(payoutPerPlayer * runsPerHour);
  const payoutPerDay     = Math.round(payoutPerHour * params.hoursPerDay);
  const payoutPerWeek    = payoutPerDay * 7;
  const payoutPerMonth   = Math.round(payoutPerDay * 30.5);

  const runsToMillion    = payoutPerPlayer > 0 ? Math.ceil(1_000_000 / payoutPerPlayer) : 0;
  const timeToMillion    = runsToMillion * totalTimePerRun;

  return {
    basePayout,
    totalPayout,
    payoutPerPlayer,
    diffMult,
    repBonus,
    grpMult,
    totalTimePerRun,
    runsPerHour: runsPerHour.toFixed(2),
    payoutPerHour,
    payoutPerDay,
    payoutPerWeek,
    payoutPerMonth,
    runsToMillion,
    timeToMillion,
  };
}

// ----------------------------------------------------------------
// Composants UI
// ----------------------------------------------------------------

function MetricCard({ label, value, color = 'text-cyan-400', icon: Icon, sub }) {
  return (
    <div className="card p-4 text-center">
      {Icon && <Icon className={`w-4 h-4 ${color} mx-auto mb-2`} />}
      <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

// ----------------------------------------------------------------
// Composant principal
// ----------------------------------------------------------------

export default function MissionCalculator() {
  const [selectedId, setSelectedId]     = useState(MISSION_TYPES_DATA[0]?.id || '');
  const [groupSize, setGroupSize]       = useState(1);
  const [showTop, setShowTop]           = useState(true);
  const [showProfiles, setShowProfiles] = useState(true);
  // Calculateur sprint
  const [sprintGoal, setSprintGoal]     = useState('1000000');
  const [sprintHours, setSprintHours]   = useState('4');

  const [params, setParams] = useState({
    repBonus:       0,
    travelMinutes:  5,
    prepMinutes:    2,
    hoursPerDay:    2,
  });

  const mission = MISSION_TYPES_DATA.find(m => m.id === selectedId);
  const result  = useMemo(
    () => calcEarnings(mission, params, groupSize),
    [mission, params, groupSize]
  );

  const topMissions = useMemo(() => {
    return MISSION_TYPES_DATA
      .map(m => {
        const r = calcEarnings(m, params, groupSize);
        return { ...m, payoutPerHour: r?.payoutPerHour || 0 };
      })
      .sort((a, b) => b.payoutPerHour - a.payoutPerHour)
      .slice(0, 12);
  }, [params, groupSize]);

  const chartData = topMissions.map(m => ({
    name: m.name.length > 18 ? m.name.slice(0, 18) + '…' : m.name,
    perHour: m.payoutPerHour,
    selected: m.id === selectedId,
  }));

  const radarData = mission ? [
    { subject: 'Prime',          value: Math.min(100, Math.round((result.payoutPerPlayer / 200000) * 100)) },
    { subject: 'Vitesse',        value: Math.max(0, 100 - mission.estimatedTime * 2) },
    { subject: 'Légalité',       value: mission.legal ? 80 : 30 },
    { subject: 'Empilement',     value: mission.stackable ? 90 : 20 },
    { subject: 'Accessibilité',  value: mission.reputation > 20 ? 30 : mission.reputation > 0 ? 60 : 100 },
  ] : [];

  // Calculateur sprint
  const sprintResults = useMemo(() => {
    const goal = Math.max(1000, Number(sprintGoal) || 1000000);
    const hours = Math.max(0.5, Number(sprintHours) || 4);
    return MISSION_TYPES_DATA
      .map(m => {
        const r = calcEarnings(m, params, groupSize);
        if (!r || r.payoutPerHour <= 0) return null;
        const totalEarnings = r.payoutPerHour * hours;
        const runs = Math.ceil(goal / r.payoutPerPlayer);
        const timeNeeded = runs * r.totalTimePerRun;
        const feasible = totalEarnings >= goal;
        return { mission: m, payoutPerHour: r.payoutPerHour, runs, timeNeeded, feasible, totalEarnings };
      })
      .filter(Boolean)
      .sort((a, b) => b.payoutPerHour - a.payoutPerHour);
  }, [params, groupSize, sprintGoal, sprintHours]);

  const bestSprint = sprintResults[0] || null;

  const updateParam = (key, val) => setParams(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="page-title">Calculateur de Missions</h1>
        <p className="page-subtitle">Estimez vos revenus horaires selon le type de mission, la taille du groupe et vos paramètres.</p>
      </div>

      {/* === CONFIGURATION === */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          Paramètres
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mission select */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Type de Mission</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="select"
            >
              {MISSION_TYPES_DATA.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.difficulty} — {formatCredits(Math.round((m.payout.min + m.payout.max) / 2), true)}
                </option>
              ))}
            </select>
          </div>

          {/* Taille groupe */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Taille du Groupe</label>
            <div className="flex gap-2">
              {[
                { size: 1, label: 'Solo', icon: User },
                { size: 2, label: '2 joueurs', icon: Users },
                { size: 4, label: '4 joueurs', icon: Users },
              ].map(({ size, label, icon: Icon }) => (
                <button
                  key={size}
                  onClick={() => setGroupSize(size)}
                  className={clsx(
                    'flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
                    groupSize === size
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                      : 'border-space-400/30 hover:border-space-400/60 text-slate-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Bonus Réputation (%)</label>
            <input
              type="number"
              value={params.repBonus}
              onChange={e => updateParam('repBonus', Math.max(0, Math.min(50, Number(e.target.value))))}
              className="input"
              min={0} max={50}
            />
            <span className="text-xs text-slate-600">0–50% selon votre rang</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Temps de Trajet (min)</label>
            <input
              type="number"
              value={params.travelMinutes}
              onChange={e => updateParam('travelMinutes', Math.max(0, Number(e.target.value)))}
              className="input"
              min={0} max={60}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Préparation (min)</label>
            <input
              type="number"
              value={params.prepMinutes}
              onChange={e => updateParam('prepMinutes', Math.max(0, Number(e.target.value)))}
              className="input"
              min={0} max={30}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Heures de Jeu / Jour</label>
            <input
              type="number"
              value={params.hoursPerDay}
              onChange={e => updateParam('hoursPerDay', Math.max(0.5, Math.min(24, Number(e.target.value))))}
              className="input"
              min={0.5} max={24} step={0.5}
            />
          </div>
        </div>
      </div>

      {mission && result && (
        <>
          {/* Bannière mission */}
          <div className="card p-4 flex flex-wrap items-center gap-4 border-cyan-500/15 bg-cyan-500/5">
            {(() => { const Icon = CATEGORY_ICONS[mission.category] || Target; return <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />; })()}
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-200">{mission.name}</span>
              <span className="text-slate-500 text-sm ml-2">{mission.type}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={clsx('badge', mission.legal ? 'badge-green' : 'badge-red')}>
                {mission.legal ? 'Légal' : 'Illégal'}
              </span>
              {mission.stackable && <span className="badge badge-cyan">Empilement</span>}
              {groupSize > 1 && (
                <span className="badge badge-purple">×{(GROUP_MULT[mission.id] || DEFAULT_GROUP_MULT)[groupSize] || 1} groupe</span>
              )}
            </div>
          </div>

          {/* Métriques clés */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              icon={TrendingUp} label={groupSize > 1 ? 'Prime / Joueur' : 'Prime Moyenne'}
              value={formatCredits(result.payoutPerPlayer, true)}
              color="text-success-400"
              sub={groupSize > 1 ? `Total : ${formatCredits(result.totalPayout, true)}` : undefined}
            />
            <MetricCard icon={Clock}      label="Temps/Mission"  value={`${result.totalTimePerRun} min`}           color="text-cyan-400"   />
            <MetricCard icon={Zap}        label="aUEC / Heure"   value={formatCredits(result.payoutPerHour, true)}  color="text-gold-400"   />
            <MetricCard icon={Target}     label="aUEC / Jour"    value={formatCredits(result.payoutPerDay, true)}   color="text-purple-400" sub={`${params.hoursPerDay}h de jeu`} />
            <MetricCard icon={Calculator} label="aUEC / Semaine" value={formatCredits(result.payoutPerWeek, true)}  color="text-blue-400"   />
            <MetricCard icon={TrendingUp} label="aUEC / Mois"    value={formatCredits(result.payoutPerMonth, true)} color="text-orange-400" />
          </div>

          {/* Objectif 1M aUEC */}
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-gold-500/15">
            <div className="flex-1">
              <h3 className="font-semibold text-gold-400 mb-1">Objectif 1 000 000 aUEC</h3>
              <p className="text-sm text-slate-400">
                Il vous faudra{' '}
                <span className="text-gold-400 font-bold">{result.runsToMillion.toLocaleString()} missions</span>{' '}
                soit environ{' '}
                <span className="text-cyan-400 font-bold">
                  {result.timeToMillion >= 60
                    ? `${Math.floor(result.timeToMillion / 60)}h${Math.round(result.timeToMillion % 60)}min`
                    : `${result.timeToMillion} min`}
                </span>{' '}
                de jeu continu{groupSize > 1 ? ` (${groupSize} joueurs, calcul par joueur)` : ''}.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-3xl font-bold font-display text-gold-400">1M</div>
              <div className="text-xs text-slate-500 text-center">aUEC</div>
            </div>
          </div>

          {/* Bonus réputation */}
          {params.repBonus > 0 && (
            <div className="card p-4 flex items-start gap-3 border-purple-500/15 bg-purple-500/5">
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                Avec <span className="text-purple-400 font-semibold">{params.repBonus}% de bonus réputation</span>,
                votre prime de base <span className="text-slate-400">{formatCredits(result.basePayout, true)}</span> passe à{' '}
                <span className="text-success-400 font-bold">{formatCredits(result.payoutPerPlayer, true)}</span> par joueur.
              </div>
            </div>
          )}

          {/* Radar + projection mensuelle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="section-title mb-4">Profil de la Mission</h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e2e4a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar dataKey="value" fill="#06b6d4" fillOpacity={0.25} stroke="#06b6d4" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h2 className="section-title mb-1">Projection Mensuelle</h2>
              <p className="text-xs text-slate-500 mb-4">{params.hoursPerDay}h/jour × 30 jours</p>
              <div className="space-y-3">
                {[
                  { label: 'Semaine 1', mult: 7,  color: 'bg-cyan-500' },
                  { label: 'Semaine 2', mult: 14, color: 'bg-blue-500' },
                  { label: 'Semaine 3', mult: 21, color: 'bg-purple-500' },
                  { label: 'Semaine 4', mult: 28, color: 'bg-gold-500' },
                ].map(({ label, mult, color }) => {
                  const val = result.payoutPerDay * mult;
                  const pct = Math.min(100, (val / result.payoutPerMonth) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{label}</span>
                        <span className="text-slate-300 font-medium">{formatCredits(val, true)}</span>
                      </div>
                      <div className="h-2 bg-space-600 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Solo vs Groupe */}
          {groupSize > 1 && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Comparaison Solo vs Groupe
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 4].map(size => {
                  const r = calcEarnings(mission, params, size);
                  if (!r) return null;
                  const grpMults = GROUP_MULT[mission.id] || DEFAULT_GROUP_MULT;
                  const mult = grpMults[size] || 1;
                  return (
                    <div
                      key={size}
                      className={clsx(
                        'p-4 rounded-lg border',
                        size === groupSize
                          ? 'border-cyan-500/40 bg-cyan-500/10'
                          : 'border-space-400/20 bg-space-700/20'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {size === 1 ? <User className="w-4 h-4 text-slate-400" /> : <Users className="w-4 h-4 text-cyan-400" />}
                        <span className="font-semibold text-slate-200">{size === 1 ? 'Solo' : `${size} joueurs`}</span>
                        <span className="text-xs text-slate-500">×{mult.toFixed(1)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prime / joueur</span>
                          <span className="text-success-400 font-medium">{formatCredits(r.payoutPerPlayer, true)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">aUEC / heure</span>
                          <span className="text-cyan-400 font-medium">{formatCredits(r.payoutPerHour, true)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prime totale</span>
                          <span className="text-purple-400 font-medium">{formatCredits(r.totalPayout, true)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-600 mt-3">
                * Les multiplicateurs varient selon le type de mission. Le minage et le combat multicrew bénéficient le plus du groupe.
              </p>
            </div>
          )}
        </>
      )}

      {/* === CALCULATEUR DE SPRINT === */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-gold-400" />
          Calculateur de Sprint
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Objectif (aUEC)</label>
            <input
              type="number"
              value={sprintGoal}
              onChange={e => setSprintGoal(e.target.value)}
              className="input"
              min={1000}
              step={100000}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Temps disponible (heures)</label>
            <input
              type="number"
              value={sprintHours}
              onChange={e => setSprintHours(e.target.value)}
              className="input"
              min={0.5}
              step={0.5}
            />
          </div>
        </div>

        {bestSprint && (
          <div className="space-y-3">
            {/* Meilleure mission recommandée */}
            <div className="rounded-lg border border-gold-500/30 bg-gold-500/5 p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gold-400 mb-1">
                    Meilleure option : {bestSprint.mission.name}
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="text-cyan-400 font-bold">{bestSprint.runs.toLocaleString()} runs</span>{' '}
                    pour atteindre{' '}
                    <span className="text-gold-400 font-bold">{Number(sprintGoal).toLocaleString()} aUEC</span>.
                    Temps estimé :{' '}
                    <span className="text-cyan-400 font-bold">
                      {bestSprint.timeNeeded >= 60
                        ? `${Math.floor(bestSprint.timeNeeded / 60)}h${Math.round(bestSprint.timeNeeded % 60)}min`
                        : `${Math.round(bestSprint.timeNeeded)} min`}
                    </span>
                    {bestSprint.feasible
                      ? <span className="text-success-400 ml-2">— Réalisable dans le temps imparti ✓</span>
                      : <span className="text-warning-400 ml-2">— Nécessite plus de {sprintHours}h</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatCredits(bestSprint.payoutPerHour, true)}/h • En {sprintHours}h : {formatCredits(bestSprint.totalEarnings, true)} potentiels
                  </p>
                </div>
              </div>
            </div>

            {/* Top 5 alternatives */}
            <div className="space-y-2">
              {sprintResults.slice(0, 5).map((r, idx) => (
                <div
                  key={r.mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-space-700/20 border border-space-400/15"
                >
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200">{r.mission.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{r.runs} runs</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={clsx('text-xs font-semibold', r.feasible ? 'text-success-400' : 'text-warning-400')}>
                      {formatCredits(r.payoutPerHour, true)}/h
                    </div>
                    <div className="text-xs text-slate-500">
                      {r.timeNeeded >= 60
                        ? `${Math.floor(r.timeNeeded / 60)}h${Math.round(r.timeNeeded % 60)}min`
                        : `${Math.round(r.timeNeeded)}min`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* === MEILLEURES MISSIONS PAR PROFIL === */}
      <div className="card overflow-hidden">
        <button
          className="w-full p-4 border-b border-space-400/20 flex items-center justify-between"
          onClick={() => setShowProfiles(v => !v)}
        >
          <h2 className="section-title">Meilleures Missions par Profil</h2>
          <ChevronDown className={clsx('w-4 h-4 text-slate-500 transition-transform', !showProfiles && '-rotate-90')} />
        </button>
        {showProfiles && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLAYER_PROFILES.map(profile => {
              const ProfileIcon = profile.icon;
              return (
                <div
                  key={profile.id}
                  className={clsx('rounded-lg border p-4', profile.borderColor, profile.bgColor)}
                >
                  <div className={clsx('flex items-center gap-2 mb-3', profile.color)}>
                    <ProfileIcon className="w-5 h-5" />
                    <span className="font-semibold">{profile.label}</span>
                    <span className="text-xs text-slate-500 ml-auto">{profile.description}</span>
                  </div>
                  <div className="space-y-2">
                    {profile.missions.map(({ id, reason }) => {
                      const m = MISSION_TYPES_DATA.find(x => x.id === id);
                      if (!m) return null;
                      const r = calcEarnings(m, params, groupSize);
                      return (
                        <div
                          key={id}
                          className="p-2.5 rounded bg-space-700/40 cursor-pointer hover:bg-space-700/60 transition-colors"
                          onClick={() => setSelectedId(id)}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-medium text-slate-200">{m.name}</span>
                            {r && <span className={clsx('text-xs font-semibold', profile.color)}>{formatCredits(r.payoutPerHour, true)}/h</span>}
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">{reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* === TOP MISSIONS COMPARATIF === */}
      <div className="card overflow-hidden">
        <button
          className="w-full p-4 border-b border-space-400/20 flex items-center justify-between"
          onClick={() => setShowTop(p => !p)}
        >
          <h2 className="section-title">
            Top 12 — Revenus/Heure Comparés
            {groupSize > 1 && <span className="text-xs text-slate-500 ml-2">({groupSize} joueurs, par joueur)</span>}
          </h2>
          <ChevronDown className={clsx('w-4 h-4 text-slate-500 transition-transform', !showTop && '-rotate-90')} />
        </button>
        {showTop && (
          <div className="p-4">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  width={135}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0a1020',
                    border: '1px solid rgba(30,46,74,0.6)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={v => [formatCredits(v, true), 'aUEC/h / joueur']}
                />
                <Bar
                  dataKey="perHour"
                  radius={[0, 4, 4, 0]}
                  fill="#22c55e"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-600 mt-2 text-center">
              Calculé avec vos paramètres (trajet {params.travelMinutes}min, prépa {params.prepMinutes}min, bonus rép. {params.repBonus}%
              {groupSize > 1 ? `, groupe de ${groupSize}` : ''})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
