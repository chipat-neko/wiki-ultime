import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../core/StateManager.jsx';
import InfoCard from '../../ui/components/InfoCard.jsx';
import { formatCredits, formatCargo, formatNumber } from '../../utils/formatters.js';
import { calcFleetStats, scoreFleetComposition } from '../../utils/calculations.js';
import { SHIPS } from '../../datasets/ships.js';
import { POPULAR_GUIDES } from '../../datasets/guides.js';
import { MISSION_TYPES_DATA, SAMPLE_MISSIONS } from '../../datasets/missions.js';
import { STATIONS } from '../../datasets/stations.js';
import { FPS_WEAPONS, FPS_ARMOR } from '../../datasets/equipment.js';
import { RECURRING_EVENTS } from '../../datasets/events.js';
import { FACTIONS } from '../../datasets/factions.js';
import { SHIP_WEAPONS } from '../../datasets/shipweapons.js';
import { POWER_PLANTS, SHIELDS, QUANTUM_DRIVES, COOLERS, MISSILES } from '../../datasets/shipcomponents.js';
import { MINING_LASERS } from '../../datasets/miningData.js';
import { TOP_TRADE_ROUTES } from '../../datasets/tradeprices.js';
import { useServerStatus } from '../../hooks/useServerStatus.js';
import { useGameVersion } from '../../hooks/useGameVersion.js';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Rocket, Anchor, TrendingUp, BookOpen, Star, Clock, ChevronRight,
  Globe, Users, Package, Zap, AlertTriangle, Target, Award, ArrowRight, Factory, Wrench, Crosshair, Bell,
  RefreshCw, Gem, Cpu, Shield, Recycle, Map, Navigation, BarChart2, Layers, Compass,
  ShoppingCart, Calculator, Truck, Clipboard, Brain, ListChecks, MapPin, Swords, Car,
  Settings, Heart, History, SlidersHorizontal,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Données de démo pour les graphiques ─────────────────────────────────────
const DEMO_PROFIT_DATA = [
  { day: 'Lun', profit: 45000 },
  { day: 'Mar', profit: 82000 },
  { day: 'Mer', profit: 63000 },
  { day: 'Jeu', profit: 118000 },
  { day: 'Ven', profit: 97000 },
  { day: 'Sam', profit: 145000 },
  { day: 'Dim', profit: 132000 },
];

// ─── Couleurs rôles flotte ────────────────────────────────────────────────────
const ROLE_COLORS = {
  'Chasseur': '#ef4444',
  'Multi-Rôle': '#06b6d4',
  'Cargo': '#22c55e',
  'Mineur': '#f59e0b',
  'Explorateur': '#3b82f6',
  'Frégate': '#8b5cf6',
  'Autre': '#64748b',
};

// ─── Accès Rapide — structure par catégorie ───────────────────────────────────
const QUICK_ACCESS_CATEGORIES = [
  {
    label: 'Vaisseaux & Flotte',
    color: 'cyan',
    borderColor: 'border-cyan-500/30',
    headerColor: 'text-cyan-400',
    bgHover: 'hover:bg-cyan-500/10',
    links: [
      { label: 'Base de Vaisseaux', path: '/vaisseaux', icon: Rocket },
      { label: 'Comparateur', path: '/vaisseaux/comparer', icon: SlidersHorizontal },
      { label: 'Fabricants', path: '/fabricants', icon: Factory },
      { label: 'Gestionnaire de Flotte', path: '/flotte', icon: Anchor },
      { label: 'Analyse de Flotte', path: '/flotte/analyse', icon: BarChart2 },
    ],
  },
  {
    label: 'Commerce',
    color: 'green',
    borderColor: 'border-green-500/30',
    headerColor: 'text-green-400',
    bgHover: 'hover:bg-green-500/10',
    links: [
      { label: 'Planificateur', path: '/commerce', icon: ShoppingCart },
      { label: 'Optimiseur Cargo', path: '/commerce/cargo', icon: Package },
      { label: 'Calculateur', path: '/commerce/calculateur', icon: Calculator },
      { label: 'Optimiseur de Routes', path: '/routes', icon: Navigation },
    ],
  },
  {
    label: 'Missions',
    color: 'orange',
    borderColor: 'border-orange-500/30',
    headerColor: 'text-orange-400',
    bgHover: 'hover:bg-orange-500/10',
    links: [
      { label: 'Planificateur', path: '/missions', icon: Clipboard },
      { label: 'IA d\'Empilement', path: '/missions/empilement', icon: Brain },
      { label: 'Suivi Missions', path: '/missions/tracker', icon: ListChecks },
      { label: 'Calculateur', path: '/missions/calculateur', icon: Calculator },
    ],
  },
  {
    label: 'Univers',
    color: 'blue',
    borderColor: 'border-blue-500/30',
    headerColor: 'text-blue-400',
    bgHover: 'hover:bg-blue-500/10',
    links: [
      { label: 'Systèmes Stellaires', path: '/systemes', icon: Globe },
      { label: 'Planètes & Lunes', path: '/systemes/planetes', icon: Compass },
      { label: 'Stations & Villes', path: '/systemes/stations', icon: Anchor },
      { label: 'Locations & POI', path: '/locations', icon: MapPin },
      { label: 'Factions', path: '/factions', icon: Users },
    ],
  },
  {
    label: 'Équipement',
    color: 'purple',
    borderColor: 'border-purple-500/30',
    headerColor: 'text-purple-400',
    bgHover: 'hover:bg-purple-500/10',
    links: [
      { label: 'Armes & Armures FPS', path: '/equipement', icon: Crosshair },
      { label: 'Véhicules Terrestres', path: '/vehicules', icon: Car },
      { label: 'Composants Vaisseaux', path: '/composants', icon: Cpu },
      { label: 'Armes de Vaisseaux', path: '/armes-vaisseaux', icon: Target },
    ],
  },
  {
    label: 'Guides & Activités',
    color: 'yellow',
    borderColor: 'border-yellow-500/30',
    headerColor: 'text-yellow-400',
    bgHover: 'hover:bg-yellow-500/10',
    links: [
      { label: 'Guides de Jeu', path: '/guides', icon: BookOpen },
      { label: 'Guide de Minage', path: '/minage', icon: Gem },
      { label: 'Guide Salvage', path: '/salvage', icon: Recycle },
    ],
  },
  {
    label: 'Communauté',
    color: 'pink',
    borderColor: 'border-pink-500/30',
    headerColor: 'text-pink-400',
    bgHover: 'hover:bg-pink-500/10',
    links: [
      { label: 'Favoris', path: '/favoris', icon: Heart },
      { label: 'Réputation', path: '/reputation', icon: Award },
      { label: 'Historique', path: '/historique', icon: History },
      { label: 'Paramètres', path: '/parametres', icon: Settings },
    ],
  },
];

// ─── Couleur de badge de risque ───────────────────────────────────────────────
function RiskBadge({ risk }) {
  const cfg = {
    'Faible':  { cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'Modéré':  { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    'Élevé':   { cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  }[risk] ?? { cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs border font-medium ${cfg.cls}`}>
      {risk}
    </span>
  );
}

// ─── ServerStatusBadge ────────────────────────────────────────────────────────
function ServerStatusBadge({ status, loading }) {
  if (loading) return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <RefreshCw className="w-3 h-3 animate-spin" /> Vérification…
    </span>
  );
  const cfg = {
    operational: { dot: 'bg-success-400 animate-pulse', text: 'text-success-400', label: 'Serveurs actifs' },
    degraded:    { dot: 'bg-warning-400 animate-pulse', text: 'text-warning-400', label: 'Performances dégradées' },
    outage:      { dot: 'bg-danger-400',                text: 'text-danger-400',  label: 'Hors ligne' },
    unknown:     { dot: 'bg-slate-500',                 text: 'text-slate-400',   label: 'Statut inconnu' },
  }[status] ?? { dot: 'bg-slate-500', text: 'text-slate-400', label: 'Statut inconnu' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { fleet, favorites, history } = useAppState();
  const navigate = useNavigate();
  const { status: srvStatus, description: srvDesc, components: srvComponents, lastChecked, loading: srvLoading, refresh: srvRefresh } = useServerStatus();
  const { live: liveVersion, ptu: ptuVersion, loading: verLoading } = useGameVersion();

  // Version affichée : live si disponible, sinon fallback "4.0"
  const displayVersion = liveVersion ? `Alpha ${liveVersion}` : 'Alpha 4.0';

  // Stats de flotte
  const fleetStats = useMemo(() => calcFleetStats(
    fleet.ships.map(fs => SHIPS.find(s => s.id === fs.shipId) || fs)
  ), [fleet.ships]);

  const fleetScore = useMemo(() => scoreFleetComposition(fleetStats), [fleetStats]);

  // Distribution des rôles pour le graphique
  const roleData = useMemo(() => {
    return Object.entries(fleetStats.roles || {}).map(([role, count]) => ({
      name: role,
      value: count,
      color: ROLE_COLORS[role] || ROLE_COLORS['Autre'],
    }));
  }, [fleetStats.roles]);

  const totalFavorites = Object.values(favorites).reduce((sum, arr) => sum + arr.length, 0);
  const recentHistory = history.slice(0, 5);

  // Stats du wiki (valeurs réelles)
  const wikiStats = useMemo(() => [
    {
      label: 'Vaisseaux',
      value: SHIPS.length,
      icon: Rocket,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      path: '/vaisseaux',
    },
    {
      label: 'Armes de Vaisseaux',
      value: SHIP_WEAPONS.length,
      icon: Target,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      path: '/armes-vaisseaux',
    },
    {
      label: 'Composants',
      value: POWER_PLANTS.length + SHIELDS.length + QUANTUM_DRIVES.length + COOLERS.length + MISSILES.length,
      icon: Cpu,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      path: '/composants',
    },
    {
      label: 'Équipement FPS',
      value: FPS_WEAPONS.length + FPS_ARMOR.length,
      icon: Shield,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      path: '/equipement',
      sub: `${FPS_WEAPONS.length} armes · ${FPS_ARMOR.length} armures`,
    },
    {
      label: 'Factions',
      value: FACTIONS.length,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      path: '/factions',
    },
    {
      label: 'Lasers de Minage',
      value: MINING_LASERS.length,
      icon: Gem,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      path: '/minage',
    },
    {
      label: 'Routes de Commerce',
      value: TOP_TRADE_ROUTES.length,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      path: '/commerce',
    },
    {
      label: 'Stations Répertoriées',
      value: STATIONS.length,
      icon: Anchor,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      path: '/systemes/stations',
    },
  ], []);

  // Top 5 routes de commerce par profitPerSCU
  const topRoutes = useMemo(() => {
    return [...TOP_TRADE_ROUTES]
      .sort((a, b) => b.profitPerSCU - a.profitPerSCU)
      .slice(0, 5);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gradient-cyan">Tableau de Bord</h1>
          <p className="page-subtitle">Bienvenue dans Star Citizen Companion — Votre hub de commandement</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-700/50 border border-space-400/20">
          <span className="text-sm text-slate-300 font-mono">
            {verLoading ? '...' : displayVersion}
          </span>
          {ptuVersion && !verLoading && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-yellow-400/80 font-mono">PTU {ptuVersion}</span>
            </>
          )}
          <span className="text-slate-600">•</span>
          <ServerStatusBadge status={srvStatus} loading={srvLoading} />
        </div>
      </div>

      {/* ── Stats Flotte ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <InfoCard
          title="Vaisseaux en Flotte"
          value={formatNumber(fleet.ships.length)}
          subtitle={fleet.name}
          icon={Anchor}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          badge={fleetScore.grade}
          badgeVariant="cyan"
          onClick={() => navigate('/flotte')}
        />
        <InfoCard
          title="Capacité de Cargo"
          value={formatCargo(fleetStats.totalCargo)}
          subtitle="Total de la flotte"
          icon={Package}
          iconColor="text-green-400"
          iconBg="bg-green-500/10"
          onClick={() => navigate('/flotte/analyse')}
        />
        <InfoCard
          title="Favoris Sauvegardés"
          value={formatNumber(totalFavorites)}
          subtitle="Vaisseaux, routes, guides"
          icon={Star}
          iconColor="text-gold-400"
          iconBg="bg-gold-500/10"
          onClick={() => navigate('/favoris')}
        />
        <InfoCard
          title="Vaisseaux Répertoriés"
          value={formatNumber(SHIPS.length)}
          subtitle="Base de données complète"
          icon={Rocket}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          onClick={() => navigate('/vaisseaux')}
        />
      </div>

      {/* ── Server Status ──────────────────────────────────────────────────── */}
      <div className={clsx(
        'card p-4 border transition-colors',
        srvStatus === 'operational' && 'border-success-500/20 bg-success-500/5',
        srvStatus === 'degraded'    && 'border-warning-500/20 bg-warning-500/5',
        srvStatus === 'outage'      && 'border-danger-500/20  bg-danger-500/5',
        srvStatus === 'unknown'     && 'border-space-400/20',
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className={clsx(
              'w-5 h-5 flex-shrink-0',
              srvStatus === 'operational' ? 'text-success-400' :
              srvStatus === 'degraded'    ? 'text-warning-400' :
              srvStatus === 'outage'      ? 'text-danger-400'  : 'text-slate-500'
            )} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">Statut Serveurs RSI</span>
                <ServerStatusBadge status={srvStatus} loading={srvLoading} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{srvDesc || 'Statut des serveurs en temps réel'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {lastChecked && (
              <span className="text-xs text-slate-600">
                {Math.floor((Date.now() - lastChecked) / 60000) === 0 ? 'à l\'instant' : `il y a ${Math.floor((Date.now() - lastChecked) / 60000)} min`}
              </span>
            )}
            <button onClick={srvRefresh} disabled={srvLoading} className="p-1.5 rounded-lg hover:bg-space-600/50 transition-colors" title="Actualiser le statut">
              <RefreshCw className={clsx('w-3.5 h-3.5 text-slate-500', srvLoading && 'animate-spin')} />
            </button>
          </div>
        </div>
        {srvComponents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
            {srvComponents.slice(0, 8).map((c) => {
              const dotCls =
                c.status === 'operational' ? 'bg-success-400 animate-pulse' :
                c.status === 'degraded'    ? 'bg-yellow-400 animate-pulse' :
                c.status === 'outage'      ? 'bg-red-400'   : 'bg-slate-500';
              const textCls =
                c.status === 'operational' ? 'text-slate-300' :
                c.status === 'degraded'    ? 'text-yellow-400' :
                c.status === 'outage'      ? 'text-red-400'   : 'text-slate-500';
              return (
                <span key={c.name} className={`flex items-center gap-1.5 text-xs ${textCls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                  {c.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── NOUVEAU : Statistiques du Wiki ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Statistiques du Wiki</h2>
          <span className="text-xs text-slate-500">Données réelles — {verLoading ? 'Alpha 4.0' : displayVersion}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {wikiStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.label}
                onClick={() => navigate(stat.path)}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-space-800 border border-space-400/20 hover:border-space-300/30 hover:bg-space-700/60 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4.5 h-4.5 ${stat.color}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div className={`text-2xl font-bold font-display ${stat.color} leading-none`}>{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1 leading-tight">{stat.label}</div>
                {stat.sub && <div className="text-xs text-slate-600 mt-0.5 leading-tight">{stat.sub}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Graphiques ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Graph */}
        <div className="lg:col-span-2 card p-4">
          <div className="section-header mb-4">
            <div>
              <h2 className="section-title">Activité Commerciale</h2>
              <p className="text-xs text-slate-500 mt-0.5">Profit estimé des 7 derniers jours</p>
            </div>
            <button onClick={() => navigate('/commerce')} className="btn-ghost btn-sm">
              Voir les routes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DEMO_PROFIT_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis
                tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{ background: '#0a1020', border: '1px solid rgba(30,46,74,0.6)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v) => [`${(v/1000).toFixed(1)}K aUEC`, 'Profit']}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Composition */}
        <div className="card p-4">
          <div className="section-header mb-4">
            <h2 className="section-title">Composition de Flotte</h2>
            <button onClick={() => navigate('/flotte/analyse')} className="btn-ghost btn-sm">
              Analyser
            </button>
          </div>
          {fleet.ships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Anchor className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">Votre flotte est vide</p>
              <button onClick={() => navigate('/vaisseaux')} className="btn-primary btn-sm mt-3">
                Ajouter des vaisseaux
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={roleData.length > 0 ? roleData : [{ name: 'Flotte', value: 1, color: '#1e2e4a' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(roleData.length > 0 ? roleData : [{ color: '#1e2e4a' }]).map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0a1020', border: '1px solid rgba(30,46,74,0.6)', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-space-900/60">
                <span className="text-xs text-slate-400">Score de Flotte</span>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-lg font-bold font-display ${
                      fleetScore.grade === 'A' ? 'text-success-400' :
                      fleetScore.grade === 'B' ? 'text-cyan-400' :
                      fleetScore.grade === 'C' ? 'text-warning-400' : 'text-danger-400'
                    }`}>
                      {fleetScore.grade}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">({fleetScore.score}/100)</span>
                  </div>
                </div>
              </div>
              {fleetScore.recommendations.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {fleetScore.recommendations.slice(0, 2).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <AlertTriangle className="w-3 h-3 text-warning-400 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── NOUVEAU : Widget Top Routes Commerce ──────────────────────────── */}
      <div className="card p-4">
        <div className="section-header mb-4">
          <div>
            <h2 className="section-title">Top Routes de Commerce</h2>
            <p className="text-xs text-slate-500 mt-0.5">Meilleures routes par profit/SCU — {displayVersion}</p>
          </div>
          <button onClick={() => navigate('/commerce')} className="btn-ghost btn-sm">
            Toutes les routes <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {topRoutes.map((route, idx) => (
            <button
              key={route.id}
              onClick={() => navigate('/commerce')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-space-900/50 hover:bg-space-700/50 border border-space-400/10 hover:border-space-300/20 transition-all text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-green-400">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-200 truncate">{route.commodityName}</span>
                  <RiskBadge risk={route.risk} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {route.fromName} → {route.toName}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-green-400">
                  +{route.profitPerSCU.toLocaleString('fr-FR')} aUEC
                </div>
                <div className="text-xs text-slate-600">par SCU</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── NOUVEAU : Accès Rapide — grille complète par catégorie ─────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Accès Rapides</h2>
          <span className="text-xs text-slate-500">{QUICK_ACCESS_CATEGORIES.reduce((n, c) => n + c.links.length, 0)} modules disponibles</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {QUICK_ACCESS_CATEGORIES.map((cat) => (
            <div key={cat.label} className={`card p-4 border ${cat.borderColor}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${cat.headerColor} mb-3`}>
                {cat.label}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {cat.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg bg-space-900/60 ${cat.bgHover} border border-space-400/10 hover:border-space-300/20 transition-all text-left group`}
                    >
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cat.headerColor} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors leading-tight">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission Stats Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Types de Missions', value: MISSION_TYPES_DATA.length, color: 'text-purple-400', path: '/missions', sub: 'dans la base' },
          { label: 'Missions Légales', value: MISSION_TYPES_DATA.filter(m => m.legal).length, color: 'text-success-400', path: '/missions', sub: 'disponibles' },
          { label: 'Exemples Actifs', value: SAMPLE_MISSIONS.length, color: 'text-cyan-400', path: '/missions', sub: 'générés' },
          { label: 'Stations Répertoriées', value: STATIONS.length, color: 'text-blue-400', path: '/systemes/stations', sub: 'Stanton, Pyro & Nyx' },
        ].map(({ label, value, color, path, sub }) => (
          <button key={label} onClick={() => navigate(path)} className="card p-4 text-center hover:border-space-300/20 transition-all group">
            <div className={`text-2xl font-bold font-display ${color} group-hover:scale-105 transition-transform`}>{value}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
            <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      {/* ── Activité Récente + Guides Populaires ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-4">
          <div className="section-header mb-4">
            <h2 className="section-title">Activité Récente</h2>
            <button onClick={() => navigate('/historique')} className="btn-ghost btn-sm">
              Tout voir
            </button>
          </div>
          {recentHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm">Aucune activité récente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-space-700/50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300 truncate">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.path}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Guides */}
        <div className="card p-4">
          <div className="section-header mb-4">
            <h2 className="section-title">Guides Populaires</h2>
            <button onClick={() => navigate('/guides')} className="btn-ghost btn-sm">
              Tous les guides
            </button>
          </div>
          <div className="space-y-2">
            {POPULAR_GUIDES.slice(0, 4).map((guide, idx) => (
              <button
                key={guide.id}
                onClick={() => navigate(`/guides/${guide.id}`)}
                className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-space-700/50 transition-colors text-left group"
              >
                <div className="w-7 h-7 rounded bg-space-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                  #{idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-300 truncate">{guide.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="badge badge-slate">{guide.category}</span>
                    <span className="text-xs text-slate-500">{guide.readTime} min</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── NOUVEAU : Bannière Modules Récents ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Nouveaux Modules</h2>
          <span className="badge badge-cyan">Récemment ajoutés</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Armes de Vaisseaux',
              desc: '63 armes S1–S9, toutes tailles et fabricants. Laser, balistique, missiles.',
              icon: Target,
              path: '/armes-vaisseaux',
              stat: `${SHIP_WEAPONS.length} armes répertoriées`,
              color: 'text-red-400',
              bg: 'bg-red-500/10',
              border: 'border-red-500/20',
            },
            {
              title: 'Composants Vaisseaux',
              desc: 'Power Plants, Shields, Quantum Drives, Coolers et Missiles. Toutes les grades.',
              icon: Cpu,
              path: '/composants',
              stat: `${POWER_PLANTS.length + SHIELDS.length + QUANTUM_DRIVES.length + COOLERS.length + MISSILES.length} composants`,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/20',
            },
            {
              title: 'Guide Salvage',
              desc: 'Vaisseaux, mécaniques de récupération, outils et optimisation de profit.',
              icon: Recycle,
              path: '/salvage',
              stat: `Guide complet ${displayVersion}`,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20',
            },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.title}
                onClick={() => navigate(mod.path)}
                className={`card p-4 border ${mod.border} hover:border-opacity-60 text-left group transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${mod.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <span className="badge badge-cyan text-xs font-bold tracking-wide">NEW</span>
                </div>
                <h3 className={`text-sm font-semibold ${mod.color} mb-1`}>{mod.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{mod.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-600">{mod.stat}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bannière version live ──────────────────────────────────────────── */}
      <div className="card p-4 border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-cyan-400">{displayVersion} — Server Meshing & Pyro pleinement opérationnel</div>
            <p className="text-sm text-slate-400 mt-0.5">
              Depuis {displayVersion}, le server meshing est actif et Pyro est pleinement accessible. Six planètes, 10 stations (Orbituary, Checkmate, Ruin Station, Starlight Service Station, Patch City, Gaslight, Rod's Fuel 'N Supplies, Rat's Nest, Endgame, Dudley & Daughters) — aucune présence UEE. Zone de non-droit totale, préparez-vous.
            </p>
          </div>
          <button onClick={() => navigate('/systemes')} className="btn-primary btn-sm flex-shrink-0">
            Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
