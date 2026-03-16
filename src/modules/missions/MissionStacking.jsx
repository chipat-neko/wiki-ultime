import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MISSION_TYPES_DATA } from '../../datasets/missions.js';
import { STATIONS } from '../../datasets/stations.js';
import { calcMissionStack, optimizeMissionGroup } from '../../utils/calculations.js';
import { formatCredits } from '../../utils/formatters.js';
import { useAppActions } from '../../core/StateManager.jsx';
import clsx from 'clsx';
import {
  Layers, Zap, Clock, TrendingUp, CheckCircle2, Info,
  BookOpen, Plus, Check, Trash2, X, Target, Package, Gem,
  Compass, Shield, AlertTriangle, Search, Filter,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── localStorage helpers ────────────────────────────────────────────────────
const LS_KEY = 'sc_mission_stack';

export function loadStack() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveStack(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  combat:      Target,
  transport:   Package,
  industrie:   Gem,
  exploration: Compass,
  service:     Shield,
  criminel:    AlertTriangle,
};

const CATEGORY_LABELS = {
  combat:      'Combat',
  transport:   'Transport',
  industrie:   'Industrie',
  exploration: 'Exploration',
  service:     'Service',
  criminel:    'Criminel',
};

const CAT_BADGE = {
  combat:      'badge-red',
  transport:   'badge-cyan',
  industrie:   'badge-yellow',
  exploration: 'badge-purple',
  service:     'badge-blue',
  criminel:    'badge-slate',
};

const DIFF_COLORS = {
  Facile:    'badge-green',
  Moyen:     'badge-yellow',
  Difficile: 'badge-red',
  Extrême:   'badge-red',
};

// mid-range payout helper
function midPayout(mission) {
  if (mission.payout?.min !== undefined) {
    return Math.round((mission.payout.min + mission.payout.max) / 2);
  }
  return mission.payout || 50000;
}

// ── Onglet Catalogue ─────────────────────────────────────────────────────────
function CatalogTab({ stack, onAdd }) {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [legality, setLegality] = useState(''); // '' | 'legal' | 'illegal'

  // Inline payout input state: { [missionId]: number }
  const [payouts, setPayouts] = useState(() =>
    Object.fromEntries(MISSION_TYPES_DATA.map(m => [m.id, midPayout(m)]))
  );

  const stackCounts = useMemo(() => {
    const counts = {};
    stack.forEach(item => {
      counts[item.id] = (counts[item.id] || 0) + 1;
    });
    return counts;
  }, [stack]);

  const filtered = useMemo(() => {
    let list = MISSION_TYPES_DATA;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        CATEGORY_LABELS[m.category]?.toLowerCase().includes(q)
      );
    }
    if (category) list = list.filter(m => m.category === category);
    if (legality === 'legal')   list = list.filter(m => m.legal);
    if (legality === 'illegal') list = list.filter(m => !m.legal);
    return list;
  }, [search, category, legality]);

  const handleAdd = useCallback((mission) => {
    const payout = payouts[mission.id] || midPayout(mission);
    onAdd(mission, payout);
  }, [payouts, onAdd]);

  return (
    <div className="space-y-4">
      {/* Filter strip */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm w-full h-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Legality */}
          <div className="flex gap-1.5 flex-shrink-0">
            {[
              { v: '',        l: 'Tous'    },
              { v: 'legal',   l: 'Légal'   },
              { v: 'illegal', l: 'Illégal' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setLegality(v)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  legality === v
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory('')}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              category === ''
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
            )}
          >
            <Filter className="w-3 h-3 inline mr-1" />Toutes
          </button>
          {Object.entries(CATEGORY_LABELS).map(([id, label]) => {
            const Icon = CATEGORY_ICONS[id];
            return (
              <button
                key={id}
                onClick={() => setCategory(category === id ? '' : id)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                  category === id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
                )}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-slate-500">
        <span className="text-slate-300 font-semibold">{filtered.length}</span> types de missions
        {stack.length > 0 && (
          <span className="ml-3 text-cyan-400 font-semibold">
            <Layers className="w-3 h-3 inline mr-1" />{stack.length} dans l'empileur
          </span>
        )}
      </div>

      {/* Mission cards grid */}
      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Aucun type de mission trouvé</p>
          <p className="text-sm text-slate-600 mt-1">Modifiez vos filtres.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(mission => {
          const Icon    = CATEGORY_ICONS[mission.category] || Target;
          const count   = stackCounts[mission.id] || 0;
          const payout  = payouts[mission.id] ?? midPayout(mission);
          const min     = mission.payout?.min ?? 5000;
          const max     = mission.payout?.max ?? 500000;

          return (
            <div
              key={mission.id}
              className={clsx(
                'card p-4 flex flex-col gap-3 transition-all duration-150',
                count > 0 && 'border-cyan-500/30 bg-cyan-500/3'
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'p-2 rounded-lg flex-shrink-0',
                  mission.legal ? 'bg-space-700/60' : 'bg-red-500/10'
                )}>
                  <Icon className={clsx('w-4 h-4', mission.legal ? 'text-cyan-400' : 'text-red-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-200 leading-tight">{mission.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{mission.description}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className={clsx('badge', CAT_BADGE[mission.category] || 'badge-slate')}>
                  {CATEGORY_LABELS[mission.category]}
                </span>
                <span className={clsx('badge', DIFF_COLORS[mission.difficulty] || 'badge-slate')}>
                  {mission.difficulty}
                </span>
                {!mission.legal && <span className="badge badge-red">Illégal</span>}
                {mission.stackable && (
                  <span className="badge badge-cyan">
                    <Layers className="w-2.5 h-2.5 mr-0.5 inline" />Empilable
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mission.estimatedTime} min
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">
                  {formatCredits(min, true)} – {formatCredits(max, true)}
                </span>
              </div>

              {/* Payout input + Add button */}
              <div className="flex items-center gap-2 pt-1 border-t border-space-400/10">
                <div className="flex-1">
                  <label className="text-xs text-slate-600 mb-1 block">Prime (aUEC)</label>
                  <input
                    type="number"
                    value={payout}
                    min={min}
                    max={max}
                    step={1000}
                    onChange={e => setPayouts(prev => ({
                      ...prev,
                      [mission.id]: Math.max(min, Math.min(max, Number(e.target.value))),
                    }))}
                    className="input text-xs h-8 py-0 w-full"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
                <button
                  onClick={() => handleAdd(mission)}
                  className={clsx(
                    'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mt-4',
                    count > 0
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25'
                      : 'bg-success-500/15 text-success-400 border border-success-500/30 hover:bg-success-500/25'
                  )}
                >
                  {count > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Ajouté
                      <span className="bg-cyan-500/20 text-cyan-300 rounded px-1 font-bold">×{count}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Onglet Mon Empilement ────────────────────────────────────────────────────
function StackTab({ stack, onRemove, onClear, onUpdateItem, onSwitchToCatalog }) {
  const { notify } = useAppActions();
  const locations  = useMemo(() => STATIONS.filter(s => s.legal).map(s => ({ id: s.id, name: s.name })), []);

  const [currentLocation, setCurrentLocation] = useState('lorville');
  const [timeAvailable,   setTimeAvailable]   = useState(60);
  const [isOptimized,     setIsOptimized]     = useState(false);
  const [result,          setResult]          = useState(null);

  // Reset optimization when stack changes
  useEffect(() => {
    setIsOptimized(false);
    setResult(null);
  }, [stack]);

  const handleOptimize = useCallback(() => {
    if (stack.length === 0) {
      notify({ type: 'warning', message: 'Ajoutez des missions à l\'empileur d\'abord.' });
      return;
    }

    // Convert stack items to missions format for calcMissionStack
    const missions = stack.map(item => ({
      id:            item.stackId,  // use unique stackId so duplicates are handled
      name:          item.name,
      payout:        item.payout,
      estimatedTime: item.estimatedTime,
      difficulty:    item.difficulty,
      legal:         item.legal,
      location:      currentLocation,
    }));

    const scored   = calcMissionStack(missions, null, currentLocation);
    const optimized = optimizeMissionGroup(scored, timeAvailable);

    setResult({
      ...optimized,
      missions: optimized.missions.map(sm => {
        // Find original stack item by stackId
        const orig = stack.find(s => s.stackId === sm.id);
        return orig ? { ...sm, name: orig.name } : sm;
      }),
    });
    setIsOptimized(true);
  }, [stack, currentLocation, timeAvailable, notify]);

  const chartData = useMemo(() =>
    result?.missions?.map(m => ({
      name:   m.name.slice(0, 18) + (m.name.length > 18 ? '…' : ''),
      payout: m.payout,
      time:   m.estimatedTime,
    })) || [],
  [result]);

  // Empty state
  if (stack.length === 0) {
    return (
      <div className="card p-16 text-center">
        <Layers className="w-14 h-14 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Votre empileur est vide</h3>
        <p className="text-sm text-slate-500 mb-6">
          Parcourez le catalogue et ajoutez des missions avec le bouton&nbsp;
          <strong className="text-success-400">+&nbsp;Ajouter</strong>.
        </p>
        <button
          onClick={onSwitchToCatalog}
          className="btn-primary gap-2 mx-auto"
        >
          <BookOpen className="w-4 h-4" />
          Parcourir le Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Config strip */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Paramètres d'optimisation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Votre Position</label>
            <select
              value={currentLocation}
              onChange={e => setCurrentLocation(e.target.value)}
              className="select"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Temps Disponible (min)</label>
            <input
              type="number"
              value={timeAvailable}
              onChange={e => setTimeAvailable(Math.max(5, Number(e.target.value)))}
              className="input"
              min={5}
              max={480}
            />
          </div>
        </div>
      </div>

      {/* Stack list */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-space-400/20 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Missions sélectionnées
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded px-1.5 py-0.5">
              {stack.length}
            </span>
          </h2>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-danger-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vider
          </button>
        </div>
        <div className="divide-y divide-space-400/10">
          {stack.map((item, idx) => (
            <div key={item.stackId} className="p-3 flex items-center gap-3 group hover:bg-space-700/30 transition-colors">
              <div className="w-5 h-5 rounded-full bg-space-600/60 flex items-center justify-center text-xs text-slate-500 flex-shrink-0 font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-slate-200 truncate">{item.name}</span>
                  <span className={clsx('badge flex-shrink-0', item.legal ? 'badge-green' : 'badge-red')}>
                    {item.legal ? 'Légal' : 'Illégal'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {/* Editable payout */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600">Prime :</span>
                    <input
                      type="number"
                      value={item.payout}
                      min={1000}
                      step={1000}
                      onChange={e => onUpdateItem(item.stackId, { payout: Math.max(1000, Number(e.target.value)) })}
                      className="input text-xs h-6 py-0 w-24"
                    />
                    <span className="text-xs text-slate-600">aUEC</span>
                  </div>
                  {/* Editable time */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <input
                      type="number"
                      value={item.estimatedTime}
                      min={1}
                      max={240}
                      onChange={e => onUpdateItem(item.stackId, { estimatedTime: Math.max(1, Number(e.target.value)) })}
                      className="input text-xs h-6 py-0 w-14"
                    />
                    <span className="text-xs text-slate-600">min</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(item.stackId)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-danger-400 hover:bg-danger-500/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optimize button */}
      <button onClick={handleOptimize} className="btn-primary gap-2 w-full justify-center">
        <Zap className="w-4 h-4" />
        Optimiser l'Empilement ({stack.length} mission{stack.length > 1 ? 's' : ''})
      </button>

      {/* Results */}
      {isOptimized && result && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Missions Sélectionnées', value: result.missions.length,                       color: 'text-cyan-400'    },
              { label: 'Profit Total',           value: formatCredits(result.totalPayout, true),      color: 'text-success-400' },
              { label: 'Durée Estimée',          value: `${result.totalTime} min`,                    color: 'text-blue-400'    },
              { label: 'Profit/Heure',           value: formatCredits(result.payoutPerHour, true),    color: 'text-gold-400'    },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <div className={clsx('text-xl font-bold font-display', color)}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Efficiency bar */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">
                Utilisation du Temps ({result.totalTime}/{timeAvailable} min)
              </span>
              <span className="text-sm font-semibold text-cyan-400">{result.efficiency.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-space-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, result.efficiency)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected missions */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-space-400/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-400" />
                <h2 className="section-title">Missions Optimales</h2>
              </div>
              <div className="divide-y divide-space-400/10">
                {result.missions.map((mission, i) => (
                  <div key={`${mission.id}-${i}`} className="p-4 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center text-xs font-bold text-success-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate">{mission.name}</span>
                        <span className="text-sm font-bold text-success-400 flex-shrink-0">
                          {formatCredits(mission.payout, true)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{mission.estimatedTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-gold-400" />
                          {formatCredits(mission.payoutPerHour, true)}/h
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="card p-4">
              <h2 className="section-title mb-4">Payout par Mission</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 24, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0a1020',
                      border: '1px solid rgba(30,46,74,0.6)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={v => [formatCredits(v, true), 'Prime']}
                  />
                  <Bar dataKey="payout" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MissionStacking() {
  const { notify }       = useAppActions();
  const navigate         = useNavigate();
  const [tab,   setTab]  = useState('catalog'); // 'catalog' | 'stack'
  const [stack, setStack] = useState(() => loadStack());

  // Sync stack to localStorage whenever it changes
  useEffect(() => {
    saveStack(stack);
  }, [stack]);

  const handleAdd = useCallback((mission, payout) => {
    const item = {
      stackId:       Date.now() + Math.random(),
      id:            mission.id,
      name:          mission.name,
      category:      mission.category,
      payout:        payout,
      estimatedTime: mission.estimatedTime || 15,
      legal:         mission.legal,
      difficulty:    mission.difficulty,
    };
    setStack(prev => {
      const next = [...prev, item];
      return next;
    });
    notify({ type: 'success', message: `"${mission.name}" ajouté à l'empileur !` });
  }, [notify]);

  const handleRemove = useCallback((stackId) => {
    setStack(prev => prev.filter(i => i.stackId !== stackId));
  }, []);

  const handleClear = useCallback(() => {
    setStack([]);
    notify({ type: 'info', message: 'Empileur vidé.' });
  }, [notify]);

  const handleUpdateItem = useCallback((stackId, changes) => {
    setStack(prev => prev.map(item =>
      item.stackId === stackId ? { ...item, ...changes } : item
    ));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">
              Empilement de Missions
              <span className="badge badge-cyan ml-2">IA</span>
            </h1>
            <p className="page-subtitle">
              Sélectionnez vos missions, personnalisez les primes et optimisez votre profit/heure
            </p>
          </div>
          {/* Stack counter badge */}
          {stack.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-xl px-4 py-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400">{stack.length}</span>
              <span className="text-xs text-slate-500">mission{stack.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="card p-4 border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-cyan-400">Comment ça marche :</strong> Parcourez le catalogue,
            ajoutez vos missions avec un prime personnalisable, puis laissez l'IA sélectionner
            la combinaison optimale pour maximiser votre profit/heure dans le temps disponible.
            Vous pouvez aussi ajouter des missions directement depuis la{' '}
            <button
              onClick={() => navigate('/missions/browser')}
              className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
            >
              Base de Données
            </button>
            .
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-space-700/40 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('catalog')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
            tab === 'catalog'
              ? 'bg-space-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Catalogue
          <span className="text-xs text-slate-500">({MISSION_TYPES_DATA.length})</span>
        </button>
        <button
          onClick={() => setTab('stack')}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
            tab === 'stack'
              ? 'bg-space-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Layers className="w-4 h-4" />
          Mon Empilement
          {stack.length > 0 && (
            <span className="bg-cyan-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {stack.length > 99 ? '99+' : stack.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {tab === 'catalog' && (
        <CatalogTab
          stack={stack}
          onAdd={handleAdd}
        />
      )}
      {tab === 'stack' && (
        <StackTab
          stack={stack}
          onRemove={handleRemove}
          onClear={handleClear}
          onUpdateItem={handleUpdateItem}
          onSwitchToCatalog={() => setTab('catalog')}
        />
      )}
    </div>
  );
}
