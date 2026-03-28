import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  FlaskConical, Gem, MapPin, ChevronUp, ChevronDown,
  Clock, TrendingUp, TrendingDown, Coins, Package,
  Star, Award, Zap, Info, BarChart3, Building2, Search, X,
  Wifi, WifiOff, RefreshCw,
} from 'lucide-react';
import { useLiveRefineries } from '../../hooks/useLiveData.js';
import {
  REFINERY_METHODS,
  REFINERY_METHODS_LIST,
  REFINERY_STATIONS,
  MINERALS_REFINERY,
  TIER_STYLES,
  calcRefinery,
  getBestMethod,
  formatDuration,
} from '../../datasets/refineryData.js';

// ─── Formatters ───────────────────────────────────────────────────────────────

function fNum(n) {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-FR').format(n);
}

function fAUEC(n) {
  if (n == null || isNaN(n)) return '—';
  return `${new Intl.NumberFormat('fr-FR').format(n)} aUEC`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MineralIcon({ mineral, size = 'sm' }) {
  const [err, setErr] = React.useState(false);
  const dim = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  return (
    <div className={clsx(
      dim, 'rounded-lg border flex items-center justify-center flex-shrink-0 overflow-hidden',
      mineral.bg, mineral.border
    )}>
      {!err && mineral.imageUrl ? (
        <img
          src={mineral.imageUrl}
          alt={mineral.name}
          onError={() => setErr(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <Gem className={clsx('w-4 h-4', mineral.color)} />
      )}
    </div>
  );
}

function TierBadge({ tier }) {
  const t = TIER_STYLES[tier] ?? TIER_STYLES.common;
  return <span className={t.badge}>{t.label}</span>;
}

function ProfitValue({ profit }) {
  if (profit == null) return <span className="text-slate-400">—</span>;
  const isPos = profit >= 0;
  return (
    <span className={clsx('font-bold', isPos ? 'text-green-400' : 'text-red-400')}>
      {isPos ? '+' : ''}{fAUEC(profit)}
    </span>
  );
}

function RoiBadge({ roi }) {
  if (roi == null) return null;
  const isPos = roi >= 0;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      isPos ? 'bg-green-900/30 text-green-400 border border-green-700/30'
             : 'bg-red-900/30 text-red-400 border border-red-700/30'
    )}>
      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPos ? '+' : ''}{roi}%
    </span>
  );
}

// ─── Section 1: Main Calculator ───────────────────────────────────────────────

function MainCalculator() {
  const [mineralId, setMineralId] = useState('quantanium');
  const [rawAmount, setRawAmount] = useState(100);
  const [inputValue, setInputValue] = useState('100');
  const [methodId, setMethodId] = useState('dinyx');
  const [modules, setModules] = useState(1);
  const [stationId, setStationId] = useState('arc-l1');

  const mineral = MINERALS_REFINERY.find(m => m.id === mineralId) ?? MINERALS_REFINERY[0];
  const method  = REFINERY_METHODS[methodId] ?? REFINERY_METHODS.dinyx;

  const result = useMemo(
    () => calcRefinery({ mineral, rawAmount, method, modules }),
    [mineral, rawAmount, method, modules]
  );

  function handleAmountInput(val) {
    setInputValue(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setRawAmount(Math.min(n, 10000));
  }

  function handleSlider(val) {
    const n = parseInt(val, 10);
    setRawAmount(n);
    setInputValue(String(n));
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Mineral + quantity row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mineral selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Minéral
          </label>
          <select
            className="select"
            value={mineralId}
            onChange={e => setMineralId(e.target.value)}
          >
            {MINERALS_REFINERY.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} — {fAUEC(m.rawValue)}/SCU brut
              </option>
            ))}
          </select>
        </div>

        {/* Station selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Station de raffinage
          </label>
          <select
            className="select"
            value={stationId}
            onChange={e => setStationId(e.target.value)}
          >
            {REFINERY_STATIONS.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.system})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantity slider + input */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Quantité brute — <span className="text-cyan-400 font-bold">{fNum(rawAmount)} SCU</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={1000}
            step={1}
            value={Math.min(rawAmount, 1000)}
            onChange={e => handleSlider(e.target.value)}
            className="flex-1 accent-cyan-500 cursor-pointer"
          />
          <input
            type="number"
            min={1}
            max={10000}
            value={inputValue}
            onChange={e => handleAmountInput(e.target.value)}
            className="input w-28 text-right font-mono"
          />
          <span className="text-slate-400 text-sm flex-shrink-0">SCU</span>
        </div>
      </div>

      {/* Method cards */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Méthode de raffinage
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {REFINERY_METHODS_LIST.map(m => (
            <button
              key={m.id}
              onClick={() => setMethodId(m.id)}
              className={clsx(
                'rounded-lg border p-3 text-left transition-all',
                methodId === m.id
                  ? clsx('border-cyan-500/60 bg-cyan-900/20 ring-1 ring-cyan-500/30')
                  : 'border-space-400/30 bg-space-900/40 hover:border-slate-500/50 hover:bg-space-800/60'
              )}
            >
              <div className={clsx('text-sm font-semibold mb-1', methodId === m.id ? 'text-cyan-300' : 'text-slate-200')}>
                {m.name}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', m.bg, m.color)}>
                  +{Math.round(m.yieldBonus * 100)}% rendem.
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-slate-800/60 text-slate-400">
                  ×{m.timeMulti} temps
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-slate-800/60 text-slate-400">
                  {Math.round(m.costPercent * 100)}% coût
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modules selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Modules actifs
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => setModules(n)}
              className={clsx(
                'w-12 h-10 rounded-lg border font-semibold text-sm transition-all',
                modules === n
                  ? 'border-cyan-500/60 bg-cyan-900/25 text-cyan-300'
                  : 'border-space-400/30 bg-space-900/40 text-slate-400 hover:border-slate-500/50 hover:text-slate-200'
              )}
            >
              {n}
            </button>
          ))}
          <span className="self-center text-xs text-slate-500 ml-1">module(s) utilisé(s)</span>
        </div>
      </div>

      {/* Results */}
      <div className="border-t border-space-400/20 pt-5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Résultats
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {/* Yield amount */}
          <div className="bg-space-900/60 border border-space-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Quantité raffinée</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {fNum(result.yieldAmount)} <span className="text-sm font-normal text-slate-400">SCU</span>
            </div>
          </div>

          {/* Raw value */}
          <div className="bg-space-900/60 border border-space-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gem className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Valeur brute</span>
            </div>
            <div className="text-lg font-bold text-slate-300 font-mono">
              {fAUEC(result.rawTotalValue)}
            </div>
          </div>

          {/* Refined value */}
          <div className="bg-space-900/60 border border-space-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Valeur raffinée</span>
            </div>
            <div className="text-lg font-bold text-yellow-300 font-mono">
              {fAUEC(result.yieldValue)}
            </div>
          </div>

          {/* Cost */}
          <div className="bg-space-900/60 border border-space-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-400">Coût de raffinage</span>
            </div>
            <div className="text-lg font-bold text-red-400 font-mono">
              -{fAUEC(result.cost)}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-space-900/60 border border-space-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Durée estimée</span>
            </div>
            <div className="text-lg font-bold text-blue-300 font-mono">
              {formatDuration(result.duration_minutes)}
            </div>
          </div>

          {/* ROI */}
          <div className="bg-space-900/60 border border-space-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">ROI</span>
            </div>
            <div className="text-lg font-mono">
              <RoiBadge roi={result.roi} />
            </div>
          </div>
        </div>

        {/* Profit net — hero */}
        <div className={clsx(
          'rounded-xl border p-5 text-center',
          result.profit >= 0
            ? 'bg-green-900/15 border-green-700/30'
            : 'bg-red-900/15 border-red-700/30'
        )}>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Profit net
          </div>
          <div className={clsx(
            'text-4xl font-bold font-display',
            result.profit >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {result.profit >= 0 ? '+' : ''}{fAUEC(result.profit)}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Valeur raffinée − valeur brute − coût de raffinage
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Method Comparison Table ───────────────────────────────────────

function MethodComparisonTable() {
  const [mineralId, setMineralId] = useState('quantanium');
  const [rawAmount, setRawAmount] = useState(100);
  const [inputValue, setInputValue] = useState('100');

  const mineral = MINERALS_REFINERY.find(m => m.id === mineralId) ?? MINERALS_REFINERY[0];

  const rows = useMemo(() => {
    return REFINERY_METHODS_LIST.map(method => ({
      method,
      result: calcRefinery({ mineral, rawAmount, method, modules: 1 }),
    }));
  }, [mineral, rawAmount]);

  const bestProfit = Math.max(...rows.map(r => r.result.profit));

  function handleAmount(val) {
    setInputValue(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setRawAmount(Math.min(n, 10000));
  }

  return (
    <div className="card p-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Minéral
          </label>
          <select
            className="select"
            value={mineralId}
            onChange={e => setMineralId(e.target.value)}
          >
            {MINERALS_REFINERY.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quantité (SCU)
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            value={inputValue}
            onChange={e => handleAmount(e.target.value)}
            className="input font-mono"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Méthode</th>
              <th className="text-right">Rendement</th>
              <th className="text-right">Durée</th>
              <th className="text-right">Coût</th>
              <th className="text-right">Profit Net</th>
              <th className="text-right">ROI</th>
              <th className="text-center">Recommandé</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ method, result }) => {
              const isBest = result.profit === bestProfit;
              return (
                <tr
                  key={method.id}
                  className={clsx(isBest && 'bg-green-900/10')}
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', method.color.replace('text-', 'bg-'))} />
                      <span className={clsx('font-medium', isBest ? 'text-green-300' : 'text-slate-200')}>
                        {method.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className={clsx('font-semibold', method.color)}>
                      +{Math.round(method.yieldBonus * 100)}%
                    </span>
                  </td>
                  <td className="text-right font-mono text-slate-300">
                    {formatDuration(result.duration_minutes)}
                  </td>
                  <td className="text-right font-mono text-red-400">
                    -{fAUEC(result.cost)}
                  </td>
                  <td className="text-right">
                    <ProfitValue profit={result.profit} />
                  </td>
                  <td className="text-right">
                    <RoiBadge roi={result.roi} />
                  </td>
                  <td className="text-center">
                    {isBest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-700/30">
                        <Star className="w-3 h-3" />
                        Optimal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        Comparaison calculée avec 1 module actif. Augmenter le nombre de modules réduit proportionnellement la durée.
      </p>
    </div>
  );
}

// ─── Section 3: Mineral Cards Grid ────────────────────────────────────────────

function MineralCardsGrid({ search = '' }) {
  const [sortKey, setSortKey] = useState('baseValue');

  const sorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = MINERALS_REFINERY;
    if (q) list = list.filter(m => m.name.toLowerCase().includes(q));
    return [...list].sort((a, b) => b[sortKey] - a[sortKey]);
  }, [sortKey, search]);

  return (
    <div className="space-y-4">
      {/* Sort control */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trier par :</span>
        {[
          { key: 'baseValue', label: 'Valeur raffinée' },
          { key: 'rawValue',  label: 'Valeur brute'    },
          { key: 'refineRatio', label: 'Ratio'         },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              sortKey === key
                ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-300'
                : 'bg-space-900/40 border-space-400/30 text-slate-400 hover:text-slate-200 hover:border-slate-500/50'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((mineral, idx) => {
          const best = getBestMethod(mineral, 100, 1);
          const bestResult = best?.result;
          return (
            <div
              key={mineral.id}
              className={clsx(
                'card p-4 hover:border-cyan-500/20 space-y-3 transition-all',
                mineral.border.replace('border-', 'hover:border-').replace('/40', '/30')
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <MineralIcon mineral={mineral} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200 text-sm truncate">{mineral.name}</div>
                  <TierBadge tier={mineral.tier} />
                </div>
                {idx === 0 && (
                  <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" title="Minerai le plus rentable" />
                )}
              </div>

              {/* Stats */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Brut</span>
                  <span className="font-mono text-slate-300">{fAUEC(mineral.rawValue)}/SCU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Raffiné</span>
                  <span className={clsx('font-mono font-semibold', mineral.color)}>{fAUEC(mineral.baseValue)}/SCU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ratio récup.</span>
                  <span className="font-mono text-slate-300">{Math.round(mineral.refineRatio * 100)}%</span>
                </div>
              </div>

              {/* Best method hint */}
              {best && (
                <div className="border-t border-space-400/20 pt-2 text-xs text-slate-500">
                  <span className="text-slate-400">Meilleure méthode : </span>
                  <span className={clsx('font-medium', best.method.color)}>
                    {best.method.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section 4: Station Guide ─────────────────────────────────────────────────

function StationGuide() {
  const stanton = REFINERY_STATIONS.filter(s => s.system === 'Stanton');
  const pyro    = REFINERY_STATIONS.filter(s => s.system === 'Pyro');

  function StationCard({ station }) {
    return (
      <div className="card p-4 flex items-start gap-4 hover:border-cyan-500/20 transition-all">
        <div className="w-10 h-10 rounded-xl bg-cyan-900/20 border border-cyan-700/30 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="font-semibold text-slate-200 text-sm">{station.name}</div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {station.location}
                {station.planet && station.planet !== station.location && ` · ${station.planet}`}
              </div>
            </div>
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
              station.system === 'Pyro'
                ? 'bg-orange-900/30 text-orange-400 border border-orange-700/30'
                : 'bg-cyan-900/20 text-cyan-400 border border-cyan-700/20'
            )}>
              {station.system}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="font-semibold text-yellow-300">{station.modules}</span> modules
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-blue-400" />
              ~{station.travelMinFromOlisar} min depuis Port Olisar
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1.5">{station.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stanton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="section-title">Stanton</h3>
          <span className="badge-cyan ml-1">{stanton.length} stations</span>
        </div>
        {stanton.map(s => <StationCard key={s.id} station={s} />)}
      </div>

      {/* Pyro */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <h3 className="section-title">Pyro</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/20 ml-1">
            {pyro.length} stations
          </span>
        </div>
        {pyro.map(s => <StationCard key={s.id} station={s} />)}
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Accès via Jump Point depuis Stanton. Zone potentiellement hostile.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RefineryCalculator() {
  const [activeSection, setActiveSection] = useState('calculator');
  const [search, setSearch] = useState('');
  const [useLive, setUseLive] = useState(false);
  const { refineries: liveRefineries, isLive, lastUpdated, loading: liveLoading, error: liveError, refresh } = useLiveRefineries();

  const NAV = [
    { id: 'calculator',  label: 'Calculateur',         icon: FlaskConical },
    { id: 'compare',     label: 'Comparer méthodes',   icon: BarChart3    },
    { id: 'minerals',    label: 'Minéraux',             icon: Gem          },
    { id: 'stations',    label: 'Stations',             icon: Building2    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="page-title">Calculateur de Raffinerie</h1>
            <p className="page-subtitle">
              Optimisez vos profits de minage — méthodes, durées, coûts en temps réel
            </p>
          </div>
        </div>

        {/* Toggle Prix Live */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              if (!useLive) refresh();
              setUseLive(v => !v);
            }}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
              useLive && isLive
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : useLive && liveLoading
                  ? 'bg-space-700 border-space-400/30 text-slate-400'
                  : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:border-space-300/40'
            )}
            title={isLive ? 'Données raffinerie en temps réel depuis UEX Corp' : 'Activer les données live UEX Corp'}
          >
            {liveLoading && useLive ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : useLive && isLive ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            {useLive && isLive ? 'Prix Live' : 'Prix Statiques'}
            {useLive && isLive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider">
                LIVE
              </span>
            )}
          </button>

          {useLive && isLive && lastUpdated && (
            <span className="text-[11px] text-slate-500">
              Dernière MAJ : {new Date(lastUpdated).toLocaleTimeString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      {/* Alerte erreur live */}
      {useLive && liveError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <Info className="w-4 h-4 flex-shrink-0" />
          Impossible de charger les données live UEX Corp — fallback sur les données statiques.
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un minerai ou une commodite par nom..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* Navigation tabs */}
      <div className="tabs">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={clsx(
              'flex items-center gap-2',
              activeSection === id ? 'tab-active' : 'tab'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Section: Calculator */}
      {activeSection === 'calculator' && (
        <div className="space-y-2">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              Calculateur principal
            </h2>
          </div>
          <MainCalculator />
        </div>
      )}

      {/* Section: Method comparison */}
      {activeSection === 'compare' && (
        <div className="space-y-2">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Comparaison des 6 méthodes
            </h2>
          </div>
          <MethodComparisonTable />
        </div>
      )}

      {/* Section: Minerals */}
      {activeSection === 'minerals' && (
        <div className="space-y-2">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Gem className="w-4 h-4 text-cyan-400" />
              Comparaison des 12 minéraux
            </h2>
          </div>
          <MineralCardsGrid search={search} />
        </div>
      )}

      {/* Section: Stations */}
      {activeSection === 'stations' && (
        <div className="space-y-2">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Guide des stations de raffinage
            </h2>
          </div>
          <StationGuide />
        </div>
      )}
    </div>
  );
}
