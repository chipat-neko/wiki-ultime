import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOP_TRADE_ROUTES } from '../../datasets/tradeprices.js';
import { formatCredits } from '../../utils/formatters.js';
import { useServerStatus } from '../../hooks/useServerStatus.js';
import clsx from 'clsx';
import {
  Clock, Server, TrendingUp, CheckSquare, Timer, Calculator,
  Keyboard, StickyNote, ExternalLink, Plus, Trash2, Play, Pause,
  RotateCcw, Check, X, Minus, ChevronDown, ChevronUp,
  Ship, Map, Crosshair, Package, Wrench, BookOpen,
} from 'lucide-react';

// ── LocalStorage keys ────────────────────────────────────────────────────────
const LS_NOTES     = 'sc_overlay_notes';
const LS_KEYBINDS  = 'sc_overlay_keybinds';
const LS_FONT_SIZE = 'sc_overlay_fontsize';
const LS_MISSIONS  = 'sc_mission_stack';

const DEFAULT_KEYBINDS = [
  { key: 'F', label: 'Interaction' },
  { key: 'N', label: 'Mode scan' },
  { key: 'B', label: 'Quantum Travel' },
  { key: 'Y', label: 'Éjecter / Sortir' },
  { key: 'L Alt + N', label: 'Scan minier' },
  { key: 'R Alt + K', label: 'Découpler' },
  { key: 'Tab', label: 'MobiGlas' },
  { key: 'F11', label: 'Starmap' },
];

const FONT_SIZES = {
  small:  { label: 'Petit',  class: 'text-[11px]' },
  medium: { label: 'Moyen',  class: 'text-xs' },
  large:  { label: 'Grand',  class: 'text-sm' },
};

const QUICK_LINKS = [
  { to: '/vaisseaux',     icon: Ship,      label: 'Vaisseaux' },
  { to: '/systemes',      icon: Map,       label: 'Systèmes' },
  { to: '/armes-vaisseaux', icon: Crosshair, label: 'Armes' },
  { to: '/commerce',      icon: Package,   label: 'Commerce' },
  { to: '/outils',        icon: Wrench,    label: 'Outils' },
  { to: '/guides',        icon: BookOpen,  label: 'Guides' },
];

// ── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const cfg = {
    operational: { color: 'bg-green-500',  pulse: true,  label: 'OK' },
    degraded:    { color: 'bg-yellow-500', pulse: true,  label: 'Dégradé' },
    outage:      { color: 'bg-red-500',    pulse: false, label: 'HS' },
    unknown:     { color: 'bg-slate-500',  pulse: false, label: '?' },
  }[status] ?? { color: 'bg-slate-500', pulse: false, label: '?' };

  return (
    <span className="inline-flex items-center gap-1">
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.color, cfg.pulse && 'animate-pulse')} />
      <span className="text-slate-500 text-[10px]">{cfg.label}</span>
    </span>
  );
}

// ── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return <span className="font-mono text-cyan-400">{hh}:{mm}:{ss}</span>;
}

// ── Widget wrapper ───────────────────────────────────────────────────────────
function Widget({ title, icon: Icon, children, collapsible = true }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-md overflow-hidden">
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        className={clsx(
          'w-full flex items-center gap-1.5 px-2 py-1.5 text-left',
          'text-slate-300 hover:bg-slate-800/60 transition-colors',
          !collapsible && 'cursor-default'
        )}
      >
        <Icon size={13} className="text-cyan-500 shrink-0" />
        <span className="font-semibold tracking-wide uppercase flex-1">{title}</span>
        {collapsible && (open ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  );
}

// ── Trade widget ─────────────────────────────────────────────────────────────
function TradeWidget() {
  const top3 = useMemo(() =>
    [...TOP_TRADE_ROUTES]
      .filter(r => r.legal)
      .sort((a, b) => b.profitPerSCU - a.profitPerSCU)
      .slice(0, 3),
    []
  );

  return (
    <Widget title="Top Routes" icon={TrendingUp}>
      <div className="space-y-1.5">
        {top3.map((r, i) => (
          <div key={r.id} className="bg-black/40 rounded px-2 py-1">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">#{i + 1}</span>
              <span className="text-slate-400 truncate">{r.commodityName}</span>
              <span className="ml-auto text-green-400 font-mono">
                +{r.profitPerSCU.toLocaleString('fr-FR')} /SCU
              </span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {r.fromName} → {r.toName}
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
}

// ── Missions widget ──────────────────────────────────────────────────────────
function MissionsWidget() {
  const [missions, setMissions] = useState([]);

  const reload = useCallback(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_MISSIONS) || '[]');
      setMissions(Array.isArray(raw) ? raw : []);
    } catch { setMissions([]); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const toggleDone = (idx) => {
    setMissions(prev => {
      const next = prev.map((m, i) => i === idx ? { ...m, done: !m.done } : m);
      localStorage.setItem(LS_MISSIONS, JSON.stringify(next));
      return next;
    });
  };

  const active = missions.filter(m => !m.done);
  const done   = missions.filter(m => m.done);

  return (
    <Widget title="Missions" icon={CheckSquare}>
      {missions.length === 0 ? (
        <p className="text-slate-600 text-center py-2 italic">
          Aucune mission empilée
        </p>
      ) : (
        <div className="space-y-1">
          {active.map((m, i) => {
            const realIdx = missions.indexOf(m);
            return (
              <button key={i} onClick={() => toggleDone(realIdx)}
                className="w-full flex items-center gap-1.5 text-left bg-black/40 rounded px-2 py-1 hover:bg-slate-800/60">
                <span className="w-3.5 h-3.5 rounded border border-slate-600 shrink-0" />
                <span className="truncate">{m.name || m.title || `Mission #${realIdx + 1}`}</span>
              </button>
            );
          })}
          {done.length > 0 && (
            <div className="text-[10px] text-slate-600 pt-1">
              {done.length} terminée{done.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </Widget>
  );
}

// ── Timer widget ─────────────────────────────────────────────────────────────
function TimerWidget() {
  const [totalSec, setTotalSec] = useState(15 * 60);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { setRunning(false); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  const start = () => { setRemaining(totalSec); setRunning(true); };
  const toggle = () => setRunning(r => !r);
  const reset = () => { setRunning(false); setRemaining(0); };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const presets = [
    { label: '5m',  val: 5 * 60 },
    { label: '15m', val: 15 * 60 },
    { label: '30m', val: 30 * 60 },
    { label: '1h',  val: 60 * 60 },
  ];

  return (
    <Widget title="Minuteur" icon={Timer}>
      <div className="text-center">
        <div className={clsx(
          'font-mono text-2xl tracking-wider mb-1.5',
          remaining === 0 ? 'text-slate-600' : remaining <= 60 ? 'text-red-400 animate-pulse' : 'text-cyan-300'
        )}>
          {mm}:{ss}
        </div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {presets.map(p => (
            <button key={p.val} onClick={() => { setTotalSec(p.val); if (!running) setRemaining(p.val); }}
              className={clsx(
                'px-2 py-0.5 rounded text-[10px] border transition-colors',
                totalSec === p.val
                  ? 'border-cyan-600 bg-cyan-900/40 text-cyan-300'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600'
              )}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-1.5">
          {remaining === 0 ? (
            <button onClick={start}
              className="flex items-center gap-1 px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[11px]">
              <Play size={11} /> Lancer
            </button>
          ) : (
            <>
              <button onClick={toggle}
                className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px]">
                {running ? <Pause size={11} /> : <Play size={11} />}
                {running ? 'Pause' : 'Reprendre'}
              </button>
              <button onClick={reset}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[11px]">
                <RotateCcw size={11} /> Reset
              </button>
            </>
          )}
        </div>
      </div>
    </Widget>
  );
}

// ── Quick calc widget ────────────────────────────────────────────────────────
function CalcWidget() {
  const [buyPrice, setBuyPrice]   = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [qty, setQty]             = useState('');

  const buy  = parseFloat(buyPrice)  || 0;
  const sell = parseFloat(sellPrice) || 0;
  const q    = parseInt(qty, 10)     || 0;
  const cost   = buy * q;
  const revenue = sell * q;
  const profit = revenue - cost;

  return (
    <Widget title="Calculateur" icon={Calculator}>
      <div className="space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          <input type="number" placeholder="Achat/u" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
            className="bg-black/60 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 placeholder-slate-600 focus:border-cyan-600 outline-none" />
          <input type="number" placeholder="Vente/u" value={sellPrice} onChange={e => setSellPrice(e.target.value)}
            className="bg-black/60 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 placeholder-slate-600 focus:border-cyan-600 outline-none" />
          <input type="number" placeholder="Qté SCU" value={qty} onChange={e => setQty(e.target.value)}
            className="bg-black/60 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 placeholder-slate-600 focus:border-cyan-600 outline-none" />
        </div>
        {q > 0 && (
          <div className="bg-black/40 rounded px-2 py-1.5 grid grid-cols-3 gap-1 text-center">
            <div>
              <div className="text-[9px] text-slate-600 uppercase">Coût</div>
              <div className="text-red-400 font-mono text-[11px]">{cost.toLocaleString('fr-FR')}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase">Revenu</div>
              <div className="text-slate-300 font-mono text-[11px]">{revenue.toLocaleString('fr-FR')}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-600 uppercase">Profit</div>
              <div className={clsx('font-mono text-[11px] font-bold', profit >= 0 ? 'text-green-400' : 'text-red-400')}>
                {profit >= 0 ? '+' : ''}{profit.toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        )}
      </div>
    </Widget>
  );
}

// ── Keybinds widget ──────────────────────────────────────────────────────────
function KeybindsWidget() {
  const [binds, setBinds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYBINDS)) || DEFAULT_KEYBINDS;
    } catch { return DEFAULT_KEYBINDS; }
  });
  const [editing, setEditing] = useState(false);

  const save = (next) => {
    setBinds(next);
    localStorage.setItem(LS_KEYBINDS, JSON.stringify(next));
  };

  const addBind = () => save([...binds, { key: '?', label: 'Nouvelle touche' }]);
  const removeBind = (i) => save(binds.filter((_, idx) => idx !== i));
  const updateBind = (i, field, val) => {
    const next = binds.map((b, idx) => idx === i ? { ...b, [field]: val } : b);
    save(next);
  };

  return (
    <Widget title="Raccourcis" icon={Keyboard}>
      <div className="space-y-0.5">
        {binds.map((b, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {editing ? (
              <>
                <input value={b.key} onChange={e => updateBind(i, 'key', e.target.value)}
                  className="w-16 bg-black/60 border border-slate-700 rounded px-1 py-0.5 text-cyan-300 font-mono text-[10px] outline-none" />
                <input value={b.label} onChange={e => updateBind(i, 'label', e.target.value)}
                  className="flex-1 bg-black/60 border border-slate-700 rounded px-1 py-0.5 text-slate-300 text-[10px] outline-none" />
                <button onClick={() => removeBind(i)} className="text-red-500 hover:text-red-400">
                  <Trash2 size={10} />
                </button>
              </>
            ) : (
              <>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-cyan-300 font-mono min-w-[44px] text-center">
                  {b.key}
                </kbd>
                <span className="text-slate-400 text-[11px]">{b.label}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <button onClick={() => setEditing(e => !e)}
          className="text-[10px] text-cyan-500 hover:text-cyan-400 underline">
          {editing ? 'Terminé' : 'Modifier'}
        </button>
        {editing && (
          <button onClick={addBind} className="text-[10px] text-slate-500 hover:text-slate-400 flex items-center gap-0.5">
            <Plus size={10} /> Ajouter
          </button>
        )}
      </div>
    </Widget>
  );
}

// ── Notes widget ─────────────────────────────────────────────────────────────
function NotesWidget() {
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem(LS_NOTES) || ''; }
    catch { return ''; }
  });

  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(LS_NOTES, val);
  };

  return (
    <Widget title="Notes rapides" icon={StickyNote}>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Écrivez vos notes ici..."
        rows={4}
        className="w-full bg-black/60 border border-slate-700 rounded px-2 py-1.5 text-slate-300 placeholder-slate-600 resize-y outline-none focus:border-cyan-600 text-[11px] leading-relaxed"
      />
    </Widget>
  );
}

// ── Main overlay component ───────────────────────────────────────────────────
export default function OverlayMode() {
  const { status } = useServerStatus();
  const [fontSize, setFontSize] = useState(() => {
    try { return localStorage.getItem(LS_FONT_SIZE) || 'small'; }
    catch { return 'small'; }
  });

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem(LS_FONT_SIZE, size);
  };

  const sizeClass = FONT_SIZES[fontSize]?.class || FONT_SIZES.small.class;

  return (
    <div className={clsx('min-h-screen bg-black text-slate-300 p-2 select-none', sizeClass)}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-2 py-1.5 mb-2 bg-slate-900/60 border border-slate-800 rounded-md">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold tracking-wider text-sm">SC Companion</span>
          <StatusDot status={status} />
        </div>
        <div className="flex items-center gap-3">
          {/* Font size controls */}
          <div className="flex items-center gap-0.5">
            {Object.entries(FONT_SIZES).map(([key, { label }]) => (
              <button key={key} onClick={() => changeFontSize(key)}
                className={clsx(
                  'px-1.5 py-0.5 rounded text-[9px] border transition-colors',
                  fontSize === key
                    ? 'border-cyan-600 bg-cyan-900/40 text-cyan-300'
                    : 'border-slate-800 text-slate-600 hover:text-slate-400'
                )}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={12} />
            <LiveClock />
          </div>
        </div>
      </header>

      {/* ── Widget grid (2 cols) ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <TradeWidget />
        <MissionsWidget />
        <TimerWidget />
        <CalcWidget />
        <KeybindsWidget />
        <NotesWidget />
      </div>

      {/* ── Quick links ───────────────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-md px-2 py-1.5 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600 uppercase tracking-wider">Accès rapide</span>
          <div className="flex items-center gap-1">
            {QUICK_LINKS.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} target="_blank" rel="noopener noreferrer"
                title={label}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-700 transition-colors">
                <Icon size={12} />
                <span className="text-[10px] hidden sm:inline">{label}</span>
                <ExternalLink size={8} className="opacity-40" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Always-on-top hint ────────────────────────────────────────── */}
      <div className="text-center text-[9px] text-slate-700 leading-relaxed">
        <p>
          Astuce : utilisez l'option «&nbsp;Toujours au premier plan&nbsp;» de votre navigateur
          pour garder cette fenêtre visible pendant le jeu.
        </p>
        <p className="mt-0.5">
          Chrome : clic droit sur l'onglet → «&nbsp;Ouvrir dans une fenêtre Picture-in-Picture&nbsp;» &nbsp;|&nbsp;
          Edge : Alt+F puis «&nbsp;Lancer le mode Picture in Picture&nbsp;»
        </p>
      </div>
    </div>
  );
}
