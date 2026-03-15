import React, { useState, useEffect, useRef, useMemo } from 'react';
import { COMMODITIES } from '../../datasets/commodities.js';
import { STATIONS } from '../../datasets/stations.js';
import { SHIPS } from '../../datasets/ships.js';
import { formatCredits } from '../../utils/formatters.js';
import { useServerStatus } from '../../hooks/useServerStatus.js';
import clsx from 'clsx';
import {
  Timer, Calculator, TrendingUp, Package, Zap, RefreshCw,
  Play, Pause, RotateCcw, Clock, Star, AlertTriangle, ChevronDown,
  Server, Cpu, Globe, Wrench, Wifi, WifiOff, CheckCircle,
} from 'lucide-react';

// ─── SERVER RESET TIMER ──────────────────────────────────────────────────────

function getNextReset() {
  // SC servers reset daily around 12:00 UTC
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(12, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime();
}

function StatusDot({ status }) {
  const cfg = {
    operational: { color: 'bg-success-400', pulse: true,  label: 'En ligne',    textColor: 'text-success-400' },
    degraded:    { color: 'bg-warning-400', pulse: true,  label: 'Dégradé',     textColor: 'text-warning-400' },
    outage:      { color: 'bg-danger-400',  pulse: false, label: 'Hors ligne',  textColor: 'text-danger-400'  },
    unknown:     { color: 'bg-slate-500',   pulse: false, label: 'Inconnu',     textColor: 'text-slate-400'   },
  }[status] ?? { color: 'bg-slate-500', pulse: false, label: 'Inconnu', textColor: 'text-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.textColor}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function ServerResetTimer() {
  const [remaining, setRemaining] = useState(0);
  const { status, description, components, lastChecked, loading, refresh } = useServerStatus();

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, getNextReset() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const pct = 100 - (remaining / 86400000) * 100;

  const ageMin = lastChecked ? Math.floor((Date.now() - lastChecked) / 60000) : null;

  return (
    <div className="card p-5 space-y-5">
      {/* Countdown */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="section-title">Reset Serveur Quotidien</h2>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold font-display text-cyan-400 tracking-wider">
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-500 mt-2">jusqu'au prochain reset (12h00 UTC)</div>
          <div className="mt-4 h-2 bg-space-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 mt-1">{pct.toFixed(1)}% de la journée écoulée</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Inventaires respawnent', note: 'Coffres & points de spawn' },
            { label: 'Épaves réinitialisées', note: 'Dérelicts & loot' },
            { label: 'Missions rechargées', note: 'Pool de missions frais' },
          ].map((item) => (
            <div key={item.label} className="p-2 rounded-lg bg-space-900/60">
              <div className="text-xs font-medium text-slate-300">{item.label}</div>
              <div className="text-xs text-slate-600 mt-0.5">{item.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RSI Server Status */}
      <div className="border-t border-space-400/20 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Statut RSI en direct</span>
          </div>
          <div className="flex items-center gap-2">
            {ageMin !== null && (
              <span className="text-xs text-slate-600">
                {ageMin === 0 ? 'à l\'instant' : `il y a ${ageMin} min`}
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-1 rounded hover:bg-space-600/50 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5 text-slate-500', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Statut global */}
        <div className={clsx(
          'flex items-center justify-between p-3 rounded-lg border',
          status === 'operational' && 'bg-success-500/5 border-success-500/20',
          status === 'degraded'    && 'bg-warning-500/5 border-warning-500/20',
          status === 'outage'      && 'bg-danger-500/5  border-danger-500/20',
          status === 'unknown'     && 'bg-space-900/60  border-space-400/20',
        )}>
          <StatusDot status={status} />
          <span className="text-xs text-slate-400 text-right max-w-[60%]">{description}</span>
        </div>

        {/* Composants */}
        {components.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {components.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[70%]">{c.name}</span>
                <StatusDot status={c.status} />
              </div>
            ))}
          </div>
        )}

        {/* Aucun composant / erreur réseau */}
        {components.length === 0 && status === 'unknown' && (
          <p className="text-xs text-slate-600 mt-2 text-center">
            Impossible de joindre le serveur de statut RSI
          </p>
        )}
      </div>
    </div>
  );
}

// ─── STOPWATCH / COUNTDOWN ────────────────────────────────────────────────────

function MultiTimer() {
  const PRESETS = [
    { label: 'QT Court (~5 min)', seconds: 300 },
    { label: 'QT Long (~15 min)', seconds: 900 },
    { label: 'Mission Livraison', seconds: 1200 },
    { label: 'Mission Combat', seconds: 1800 },
    { label: 'Reset Prison', seconds: 1200 },
  ];

  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'countdown'
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdownTarget, setCountdownTarget] = useState(300);
  const [countdownRemaining, setCountdownRemaining] = useState(300);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        const now = Date.now() - startRef.current;
        if (mode === 'stopwatch') {
          setElapsed(now);
        } else {
          const rem = Math.max(0, countdownTarget * 1000 - now);
          setCountdownRemaining(Math.ceil(rem / 1000));
          if (rem === 0) setRunning(false);
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, countdownTarget]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setCountdownRemaining(countdownTarget);
  };

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const cs = Math.floor((ms % 1000) / 10);
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  };

  const displayValue = mode === 'stopwatch' ? formatTime(elapsed) : `${String(Math.floor(countdownRemaining/60)).padStart(2,'0')}:${String(countdownRemaining%60).padStart(2,'0')}`;
  const isFinished = mode === 'countdown' && countdownRemaining === 0;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-4 h-4 text-purple-400" />
        <h2 className="section-title">Chronomètre / Compte à Rebours</h2>
      </div>

      <div className="flex gap-2 mb-4">
        {['stopwatch', 'countdown'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={clsx('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all', mode === m ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-space-700 text-slate-400 hover:text-slate-200')}
          >
            {m === 'stopwatch' ? 'Chronomètre' : 'Compte à rebours'}
          </button>
        ))}
      </div>

      {mode === 'countdown' && (
        <div className="mb-4">
          <label className="text-xs text-slate-500 mb-2 block">Préréglages</label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setCountdownTarget(p.seconds); setCountdownRemaining(p.seconds); setRunning(false); setElapsed(0); }}
                className={clsx('text-xs px-2 py-1 rounded-md transition-all', countdownTarget === p.seconds ? 'bg-purple-500/20 text-purple-400' : 'bg-space-700 text-slate-400 hover:text-slate-300')}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={clsx('text-center py-4', isFinished && 'animate-pulse')}>
        <div className={clsx('text-5xl font-bold font-display tracking-wider', isFinished ? 'text-danger-400' : 'text-purple-400')}>
          {displayValue}
        </div>
        {isFinished && <div className="text-sm text-danger-400 mt-2 font-medium">Temps écoulé !</div>}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={isFinished}
          className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', running ? 'bg-warning-500/20 text-warning-400 hover:bg-warning-500/30' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30')}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? 'Pause' : 'Démarrer'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 bg-space-700 hover:bg-space-600 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

// ─── MINING ROI CALCULATOR ─────────────────────────────────────────────────────

const MINERALS = [
  { id: 'quantainium', name: 'Quantainium',   price: 1350, danger: 'Explosive', rarity: 'Rare',    color: 'text-gold-400'    },
  { id: 'taranite',    name: 'Taranite',       price: 875,  danger: 'Stable',    rarity: 'Rare',    color: 'text-purple-400'  },
  { id: 'bexalite',    name: 'Bexalite',       price: 955,  danger: 'Stable',    rarity: 'Rare',    color: 'text-cyan-400'    },
  { id: 'borase',      name: 'Borase',         price: 658,  danger: 'Instable',  rarity: 'Peu Com', color: 'text-blue-400'    },
  { id: 'laranite',    name: 'Laranite',        price: 496,  danger: 'Stable',    rarity: 'Peu Com', color: 'text-orange-400'  },
  { id: 'agricium',   name: 'Agricium',        price: 398,  danger: 'Stable',    rarity: 'Commun',  color: 'text-green-400'   },
  { id: 'titanium',   name: 'Titanium',        price: 285,  danger: 'Stable',    rarity: 'Commun',  color: 'text-slate-300'   },
  { id: 'inertite',   name: 'Inertite',        price: 210,  danger: 'Stable',    rarity: 'Commun',  color: 'text-slate-400'   },
  { id: 'aluminium',  name: 'Aluminium',       price: 55,   danger: 'Stable',    rarity: 'Abond.',  color: 'text-slate-500'   },
];

function MiningCalculator() {
  const [mineral, setMineral] = useState('quantainium');
  const [scu, setScu] = useState(32);
  const [travelTime, setTravelTime] = useState(20);

  const selected = MINERALS.find(m => m.id === mineral);
  const rawValue = selected ? selected.price * scu * 100 : 0; // ~100 units per SCU approx
  const effectiveValue = Math.round(rawValue * 0.92); // ~8% refinery fee
  const valuePerHour = travelTime > 0 ? Math.round(effectiveValue / (travelTime / 60)) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-gold-400" />
        <h2 className="section-title">Calculateur de Minage</h2>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">Minéral</label>
          <select value={mineral} onChange={e => setMineral(e.target.value)} className="select">
            {MINERALS.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.price} aUEC/u — {m.rarity}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">SCU Extraits</label>
            <input type="number" value={scu} onChange={e => setScu(Math.max(1, Number(e.target.value)))} className="input" min={1} max={576} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Temps Total (min)</label>
            <input type="number" value={travelTime} onChange={e => setTravelTime(Math.max(1, Number(e.target.value)))} className="input" min={1} />
          </div>
        </div>

        {selected && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-space-900/60">
              <span className={`text-xs font-medium ${selected.color}`}>{selected.name}</span>
              <span className={clsx('badge text-xs', selected.danger === 'Explosive' ? 'badge-red' : selected.danger === 'Instable' ? 'badge-yellow' : 'badge-green')}>
                {selected.danger}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-space-900/60">
                <div className="text-base font-bold text-slate-300">{formatCredits(rawValue, true)}</div>
                <div className="text-xs text-slate-600">Brut</div>
              </div>
              <div className="p-3 rounded-lg bg-space-900/60">
                <div className="text-base font-bold text-success-400">{formatCredits(effectiveValue, true)}</div>
                <div className="text-xs text-slate-600">Net (−8% raffinerie)</div>
              </div>
              <div className="p-3 rounded-lg bg-space-900/60">
                <div className="text-base font-bold text-gold-400">{formatCredits(valuePerHour, true)}</div>
                <div className="text-xs text-slate-600">aUEC / heure</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── QUICK TRADE PROFIT ────────────────────────────────────────────────────────

function TradeProfitCalc() {
  const [buyPrice, setBuyPrice] = useState(100);
  const [sellPrice, setSellPrice] = useState(150);
  const [scu, setScu] = useState(100);
  const [travelMin, setTravelMin] = useState(15);

  const profit = (sellPrice - buyPrice) * scu * 100;
  const profitPerHour = travelMin > 0 ? Math.round(profit / (travelMin / 60)) : 0;
  const roi = buyPrice > 0 ? (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(1) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-success-400" />
        <h2 className="section-title">Calculateur de Profit Commercial</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">Prix d'achat (aUEC/u)</label>
          <input type="number" value={buyPrice} onChange={e => setBuyPrice(Math.max(0, Number(e.target.value)))} className="input" min={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">Prix de vente (aUEC/u)</label>
          <input type="number" value={sellPrice} onChange={e => setSellPrice(Math.max(0, Number(e.target.value)))} className="input" min={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">SCU à transporter</label>
          <input type="number" value={scu} onChange={e => setScu(Math.max(1, Number(e.target.value)))} className="input" min={1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">Temps de trajet (min)</label>
          <input type="number" value={travelMin} onChange={e => setTravelMin(Math.max(1, Number(e.target.value)))} className="input" min={1} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className={clsx('p-3 rounded-lg', profit > 0 ? 'bg-success-500/10' : 'bg-danger-500/10')}>
          <div className={clsx('text-lg font-bold font-display', profit > 0 ? 'text-success-400' : 'text-danger-400')}>
            {profit > 0 ? '+' : ''}{formatCredits(profit, true)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Profit Total</div>
        </div>
        <div className="p-3 rounded-lg bg-space-900/60">
          <div className={clsx('text-lg font-bold font-display', parseFloat(roi) > 0 ? 'text-gold-400' : 'text-danger-400')}>
            {roi}%
          </div>
          <div className="text-xs text-slate-500 mt-1">ROI</div>
        </div>
        <div className="p-3 rounded-lg bg-space-900/60">
          <div className="text-lg font-bold font-display text-cyan-400">{formatCredits(profitPerHour, true)}</div>
          <div className="text-xs text-slate-500 mt-1">aUEC / heure</div>
        </div>
      </div>

      {profit > 0 && (
        <div className="mt-3 text-xs text-slate-500 text-center">
          Marge : {formatCredits(sellPrice - buyPrice, true)} aUEC/u •
          Investissement : {formatCredits(buyPrice * scu * 100, true)} aUEC
        </div>
      )}
    </div>
  );
}

// ─── SCU CONVERTER ──────────────────────────────────────────────────────────

function ScuConverter() {
  const [mode, setMode] = useState('scu'); // 'scu' | 'units'
  const [value, setValue] = useState(32);

  const SCU_TO_UNITS = 100;
  const converted = mode === 'scu' ? value * SCU_TO_UNITS : Math.round(value / SCU_TO_UNITS * 100) / 100;

  const SHIP_CAPACITIES = SHIPS
    .filter(s => s.specs?.cargo > 0)
    .sort((a, b) => (a.specs?.cargo ?? 0) - (b.specs?.cargo ?? 0))
    .map(s => ({ name: s.name, scu: s.specs.cargo }));

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-blue-400" />
        <h2 className="section-title">Convertisseur SCU / Unités</h2>
      </div>
      <div className="flex gap-2 mb-4">
        {[['scu', 'SCU → Unités'], ['units', 'Unités → SCU']].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} className={clsx('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all', mode === m ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-space-700 text-slate-400 hover:text-slate-200')}>
            {l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">{mode === 'scu' ? 'SCU' : 'Unités'}</label>
          <input type="number" value={value} onChange={e => setValue(Math.max(0, Number(e.target.value)))} className="input w-full" min={0} />
        </div>
        <div className="text-slate-500 mt-4">→</div>
        <div className="flex-1">
          <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">{mode === 'scu' ? 'Unités' : 'SCU'}</label>
          <div className="input bg-space-700/50 text-cyan-400 font-bold">{converted.toLocaleString('fr-FR')}</div>
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-2">Référence capacités vaisseaux</div>
        <div className="grid grid-cols-2 gap-1.5">
          {SHIP_CAPACITIES.map(s => (
            <button
              key={s.name}
              onClick={() => { setMode('scu'); setValue(s.scu); }}
              className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-space-900/60 hover:bg-space-700/50 transition-colors text-xs"
            >
              <span className="text-slate-400">{s.name}</span>
              <span className="text-blue-400 font-medium">{s.scu} SCU</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── QUANTUM TRAVEL ESTIMATOR ─────────────────────────────────────────────────

const QT_DESTINATIONS = [
  { from: 'Stanton (général)', to: 'Hurston',    dist: 14.5, label: 'Stanton → Hurston' },
  { from: 'Stanton',           to: 'Crusader',   dist: 18.9, label: 'Stanton → Crusader' },
  { from: 'Stanton',           to: 'ArcCorp',    dist: 22.5, label: 'Stanton → ArcCorp' },
  { from: 'Stanton',           to: 'MicroTech',  dist: 37.2, label: 'Stanton → MicroTech' },
  { from: 'Hurston',           to: 'ArcCorp',    dist: 25.1, label: 'Hurston → ArcCorp' },
  { from: 'Hurston',           to: 'Crusader',   dist: 21.0, label: 'Hurston → Crusader' },
  { from: 'Crusader',          to: 'MicroTech',  dist: 32.5, label: 'Crusader → MicroTech' },
  { from: 'ArcCorp',           to: 'MicroTech',  dist: 16.4, label: 'ArcCorp → MicroTech' },
  { from: 'Stanton',           to: 'Pyro (JP)',  dist: 95.0, label: 'Stanton → Point de Saut Pyro' },
];

const QT_SPEEDS = [
  { label: 'Origin 890 Jump (250 Mm/s)',   speed: 250 },
  { label: 'Constellation (166 Mm/s)',     speed: 166 },
  { label: 'Caterpillar (134 Mm/s)',       speed: 134 },
  { label: 'Freelancer (140 Mm/s)',        speed: 140 },
  { label: 'Avenger (143 Mm/s)',           speed: 143 },
  { label: 'Hull-C (92 Mm/s)',             speed: 92  },
];

function QtEstimator() {
  const [routeIdx, setRouteIdx] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);

  const route = QT_DESTINATIONS[routeIdx];
  const speed = QT_SPEEDS[speedIdx];
  const timeSeconds = route && speed ? Math.round((route.dist * 1e6) / (speed.speed * 1e6) * 1000) : 0;
  const timeMin = Math.floor(timeSeconds / 60);
  const timeSec = timeSeconds % 60;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-warning-400" />
        <h2 className="section-title">Estimateur de Voyage Quantique</h2>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">Route</label>
          <select value={routeIdx} onChange={e => setRouteIdx(Number(e.target.value))} className="select">
            {QT_DESTINATIONS.map((r, i) => (
              <option key={i} value={i}>{r.label} ({r.dist} Gm)</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">Vaisseau / Vitesse QT</label>
          <select value={speedIdx} onChange={e => setSpeedIdx(Number(e.target.value))} className="select">
            {QT_SPEEDS.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="text-center p-4 rounded-xl bg-space-900/60">
        <div className="text-3xl font-bold font-display text-warning-400">
          {timeMin > 0 ? `${timeMin}m ` : ''}{timeSec}s
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {route?.dist} Gm à {speed?.speed} Mm/s
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-600 text-center">
        ⚠️ Les temps sont approximatifs et varient selon la position orbitale des corps célestes.
      </div>
    </div>
  );
}

// ─── CRIMESTAT REFERENCE ──────────────────────────────────────────────────────

const CRIMESTAT_LEVELS = [
  { level: 1, label: 'Niveau 1',   desc: 'Infraction mineure. Amende automatique.',           color: 'text-warning-400', bg: 'bg-warning-500/10', consequence: 'Scan obligatoire si arrêté.' },
  { level: 2, label: 'Niveau 2',   desc: 'Multiples infractions. Bounty modéré.',             color: 'text-orange-400',  bg: 'bg-orange-500/10',  consequence: 'Chasseurs de primes vous pistent.' },
  { level: 3, label: 'Niveau 3',   desc: 'Criminel actif. Prime de 50-100K aUEC.',            color: 'text-red-400',     bg: 'bg-red-500/10',     consequence: 'Tir à vue dans les zones de haute sécurité.' },
  { level: 4, label: 'Niveau 4',   desc: 'Fugitif dangereux. Prime de 100-250K aUEC.',        color: 'text-danger-400',  bg: 'bg-danger-500/10',  consequence: 'Toutes les forces de l\'ordre actives.' },
  { level: 5, label: 'Niveau 5',   desc: 'Ennemi public n°1. Prime de 250K+ aUEC.',           color: 'text-danger-400',  bg: 'bg-danger-500/15',  consequence: 'Toutes zones fermées. Klescher si capturé.' },
];

function CrimestatGuide() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-danger-400" />
        <h2 className="section-title">Guide CrimeStat</h2>
      </div>
      <div className="space-y-2">
        {CRIMESTAT_LEVELS.map(c => (
          <div key={c.level} className={clsx('p-3 rounded-lg', c.bg)}>
            <div className="flex items-center justify-between mb-1">
              <span className={clsx('font-semibold text-sm', c.color)}>{c.label}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={clsx('w-2.5 h-2.5 rounded-full', i < c.level ? c.bg.replace('bg-','border-').replace('/10','') + ' border-2' : 'bg-space-600')}
                    style={{ background: i < c.level ? undefined : undefined }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400">{c.desc}</p>
            <p className="text-xs text-slate-500 mt-0.5 italic">{c.consequence}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
        <p className="text-xs text-slate-400">
          <span className="text-cyan-400 font-medium">Pour effacer son CrimeStat :</span>{' '}
          Se rendre à GrimHEX/PyroGrimHEX, les stations de lavage dans les zones criminelles de Pyro, ou purger sa peine à Klescher.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'timers',    label: 'Minuteries',     icon: Timer,      color: 'text-purple-400' },
  { id: 'server',    label: 'Reset Serveur',  icon: Server,     color: 'text-cyan-400'   },
  { id: 'mining',    label: 'Minage',         icon: Star,       color: 'text-gold-400'   },
  { id: 'trade',     label: 'Commerce',       icon: TrendingUp, color: 'text-success-400'},
  { id: 'scu',       label: 'SCU',            icon: Package,    color: 'text-blue-400'   },
  { id: 'qt',        label: 'Voyage QT',      icon: Zap,        color: 'text-warning-400'},
  { id: 'crimestat', label: 'CrimeStat',      icon: AlertTriangle, color: 'text-danger-400' },
];

export default function Tools() {
  const [activeSection, setActiveSection] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Outils de Jeu</h1>
        <p className="page-subtitle">Calculateurs, minuteries et références rapides pour Star Citizen</p>
      </div>

      {/* Nav */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSection('all')}
          className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all', activeSection === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/50')}
        >
          <Wrench className="w-3.5 h-3.5" />
          Tous les outils
        </button>
        {TOOLS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all', activeSection === t.id ? `bg-space-700 ${t.color} border border-space-400/30` : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/50')}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(activeSection === 'all' || activeSection === 'server')    && <ServerResetTimer />}
        {(activeSection === 'all' || activeSection === 'timers')    && <MultiTimer />}
        {(activeSection === 'all' || activeSection === 'mining')    && <MiningCalculator />}
        {(activeSection === 'all' || activeSection === 'trade')     && <TradeProfitCalc />}
        {(activeSection === 'all' || activeSection === 'scu')       && <ScuConverter />}
        {(activeSection === 'all' || activeSection === 'qt')        && <QtEstimator />}
        {(activeSection === 'all' || activeSection === 'crimestat') && <CrimestatGuide />}
      </div>
    </div>
  );
}
