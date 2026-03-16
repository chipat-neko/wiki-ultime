import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppActions } from '../../core/StateManager.jsx';
import clsx from 'clsx';
import {
  User, Heart, Droplets, Moon, Activity,
  Play, Pause, RotateCcw, Target, TrendingUp,
  Plus, Trash2, CheckSquare, Square, MapPin,
  BookOpen, Bell, BellOff, Eye, EyeOff,
  Clock, Save, AlertTriangle, ChevronDown, ChevronUp,
  Rocket, DollarSign, Sword, Search, Package,
  Crosshair, Zap,
} from 'lucide-react';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sc_character_tracker';

const CELESTIAL_BODIES = [
  'Stanton', 'Crusader', 'Daymar', 'Cellin', 'Yela',
  'Hurston', 'Aberdeen', 'Arial', 'Ita', 'Magda',
  'MicroTech', 'Calliope', 'Clio', 'Euterpe',
  'ArcCorp', 'Wala', 'Lyria',
  'Pyro', 'Pyro I', 'Pyro II', 'Pyro III', 'Pyro IV', 'Pyro V', 'Pyro VI',
  'Autre',
];

const OM_OPTIONS = [
  'OM-1', 'OM-2', 'OM-3', 'OM-4', 'OM-5', 'OM-6',
  'Coordonnées libres',
];

const TASK_CATEGORIES = [
  { id: 'ship',        label: 'Vaisseau',    emoji: '🚀', color: 'text-cyan-400',    badge: 'badge-cyan'   },
  { id: 'trade',       label: 'Commerce',    emoji: '💰', color: 'text-gold-400',    badge: 'badge-gold'   },
  { id: 'combat',      label: 'Combat',      emoji: '⚔️', color: 'text-danger-400',  badge: 'badge-red'    },
  { id: 'exploration', label: 'Exploration', emoji: '🔬', color: 'text-purple-400',  badge: 'badge-purple' },
  { id: 'delivery',    label: 'Livraison',   emoji: '📦', color: 'text-success-400', badge: 'badge-green'  },
];

const ACTIVITIES = [
  { id: 'mining',      label: 'Minage'        },
  { id: 'trade',       label: 'Commerce'      },
  { id: 'missions',    label: 'Missions'      },
  { id: 'bounty',      label: 'Bounty Hunter' },
  { id: 'salvage',     label: 'Salvage'       },
  { id: 'exploration', label: 'Exploration'   },
  { id: 'social',      label: 'Social'        },
];

const MAX_TASKS     = 20;
const MAX_LOCATIONS = 15;

// ─── État initial ─────────────────────────────────────────────────────────────

function getDefaultState() {
  return {
    // Section 1 – Statut vital
    vitals: {
      hunger:   0,
      thirst:   0,
      fatigue:  0,
      injured:  false,
      injuryZones: [],
      updatedAt: null,
    },
    // Section 2 – Session
    session: {
      running:     false,
      startedAt:   null,
      elapsed:     0,
      goal:        '',
      auecStart:   '',
      auecCurrent: '',
      activity:    'missions',
      history:     [], // max 5
    },
    // Section 3 – Tâches
    tasks: [],
    // Section 4 – Coordonnées
    locations: [],
    // Section 5 – Journal
    journal: {
      text:      '',
      savedAt:   null,
    },
    // Section 6 – Alarmes
    alarms: {
      eatDrink:    false,
      hospital:    false,
      focusMode:   false,
      lastEatDrink: null,
      lastHospital: null,
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Deep merge avec valeurs par défaut
      const def = getDefaultState();
      return {
        ...def,
        ...parsed,
        vitals:    { ...def.vitals,    ...parsed.vitals    },
        session:   { ...def.session,   ...parsed.session   },
        alarms:    { ...def.alarms,    ...parsed.alarms    },
        journal:   { ...def.journal,   ...parsed.journal   },
      };
    }
  } catch {}
  return getDefaultState();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatAgo(ts) {
  if (!ts) return null;
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  return `il y a ${Math.floor(diff / 3600)}h`;
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatProfit(n) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const sign = n >= 0 ? '+' : '-';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M aUEC`;
  if (abs >= 1_000)     return `${sign}${(abs / 1_000).toFixed(1)}k aUEC`;
  return `${sign}${abs} aUEC`;
}

function vitalColor(val) {
  if (val < 40) return 'bg-success-500';
  if (val < 70) return 'bg-warning-500';
  return 'bg-danger-500';
}

function vitalTextColor(val) {
  if (val < 40) return 'text-success-400';
  if (val < 70) return 'text-warning-400';
  return 'text-danger-400';
}

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CharacterTracker() {
  const { notify } = useAppActions();
  const [state, setState] = useState(loadState);

  // Timer de session
  const timerRef = useRef(null);

  // Debounce journal
  const journalDebounceRef = useRef(null);

  // Alarmes intervals
  const alarmEatRef      = useRef(null);
  const alarmHospitalRef = useRef(null);

  // ── Persistance ──────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ── Timer de session ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.session.running) {
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          session: {
            ...prev.session,
            elapsed: prev.session.elapsed + 1000,
          },
        }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state.session.running]);

  // ── Alarmes ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(alarmEatRef.current);
    if (state.alarms.eatDrink) {
      alarmEatRef.current = setInterval(() => {
        console.log('[SC Tracker] Rappel : penser à manger/boire !');
        notify('Rappel : penser à manger et boire votre personnage !', 'warning');
      }, 30 * 60 * 1000);
    }
    return () => clearInterval(alarmEatRef.current);
  }, [state.alarms.eatDrink, notify]);

  useEffect(() => {
    clearInterval(alarmHospitalRef.current);
    if (state.alarms.hospital) {
      alarmHospitalRef.current = setInterval(() => {
        console.log('[SC Tracker] Rappel : sauvegarder dans un hôpital !');
        notify('Rappel : sauvegarder votre personnage dans un hôpital !', 'warning');
      }, 60 * 60 * 1000);
    }
    return () => clearInterval(alarmHospitalRef.current);
  }, [state.alarms.hospital, notify]);

  // ── Helpers de mise à jour d'état ────────────────────────────────────────────

  const updateVitals = useCallback((patch) => {
    setState(prev => ({
      ...prev,
      vitals: { ...prev.vitals, ...patch, updatedAt: Date.now() },
    }));
  }, []);

  const updateSession = useCallback((patch) => {
    setState(prev => ({
      ...prev,
      session: { ...prev.session, ...patch },
    }));
  }, []);

  const updateAlarms = useCallback((patch) => {
    setState(prev => ({
      ...prev,
      alarms: { ...prev.alarms, ...patch },
    }));
  }, []);

  // ─── Section 1 helpers ───────────────────────────────────────────────────────

  const resetVitals = () => {
    updateVitals({ hunger: 0, thirst: 0, fatigue: 0, injured: false, injuryZones: [] });
    notify('Statut vital réinitialisé — personnage fresh spawn', 'success');
  };

  const toggleInjuryZone = (zone) => {
    setState(prev => {
      const zones = prev.vitals.injuryZones.includes(zone)
        ? prev.vitals.injuryZones.filter(z => z !== zone)
        : [...prev.vitals.injuryZones, zone];
      return { ...prev, vitals: { ...prev.vitals, injuryZones: zones, updatedAt: Date.now() } };
    });
  };

  // ─── Section 2 helpers ───────────────────────────────────────────────────────

  const startSession = () => {
    updateSession({ running: true, startedAt: Date.now(), elapsed: 0 });
    notify('Session de jeu démarrée', 'success');
  };

  const stopSession = () => {
    const { elapsed, auecStart, auecCurrent, activity, goal } = state.session;
    const profit = (Number(auecCurrent) || 0) - (Number(auecStart) || 0);
    const entry = {
      date:     Date.now(),
      duration: elapsed,
      profit,
      activity,
      goal: goal || '—',
    };
    setState(prev => ({
      ...prev,
      session: {
        ...prev.session,
        running:  false,
        elapsed:  0,
        history:  [entry, ...prev.session.history].slice(0, 5),
      },
    }));
    notify(`Session terminée — Durée : ${formatElapsed(elapsed)}`, 'info');
  };

  const sessionProfit = useMemo(() => {
    const s = Number(state.session.auecStart)   || 0;
    const c = Number(state.session.auecCurrent) || 0;
    return c - s;
  }, [state.session.auecStart, state.session.auecCurrent]);

  const sessionProfitPerHour = useMemo(() => {
    const elapsedH = state.session.elapsed / 3_600_000;
    if (elapsedH < 0.01) return null;
    return Math.round(sessionProfit / elapsedH);
  }, [sessionProfit, state.session.elapsed]);

  const goalPct = useMemo(() => {
    if (!state.session.goal) return null;
    const goalVal = Number(state.session.goal.replace(/\D/g, ''));
    if (!goalVal) return null;
    const current = Number(state.session.auecCurrent) || 0;
    return Math.min(100, Math.max(0, Math.round((current / goalVal) * 100)));
  }, [state.session.goal, state.session.auecCurrent]);

  // ─── Section 3 helpers ───────────────────────────────────────────────────────

  const [newTask, setNewTask] = useState({ text: '', category: 'ship' });
  const [taskSort, setTaskSort] = useState('order'); // 'order' | 'category'

  const addTask = () => {
    if (!newTask.text.trim()) return;
    if (state.tasks.length >= MAX_TASKS) {
      notify(`Limite de ${MAX_TASKS} tâches atteinte`, 'warning');
      return;
    }
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now(), text: newTask.text.trim(), category: newTask.category, done: false, createdAt: Date.now() }],
    }));
    setNewTask(t => ({ ...t, text: '' }));
  };

  const toggleTask = (id) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t),
    }));
  };

  const deleteTask = (id) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const sortedTasks = useMemo(() => {
    if (taskSort === 'category') {
      return [...state.tasks].sort((a, b) => a.category.localeCompare(b.category));
    }
    return state.tasks;
  }, [state.tasks, taskSort]);

  // ─── Section 4 helpers ───────────────────────────────────────────────────────

  const [showLocForm, setShowLocForm] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', body: 'Stanton', om: 'OM-1', coords: '', notes: '' });

  const addLocation = () => {
    if (!newLoc.name.trim()) return;
    if (state.locations.length >= MAX_LOCATIONS) {
      notify(`Limite de ${MAX_LOCATIONS} locations atteinte`, 'warning');
      return;
    }
    setState(prev => ({
      ...prev,
      locations: [...prev.locations, { id: Date.now(), ...newLoc, name: newLoc.name.trim(), createdAt: Date.now() }],
    }));
    setNewLoc({ name: '', body: 'Stanton', om: 'OM-1', coords: '', notes: '' });
    setShowLocForm(false);
  };

  const deleteLocation = (id) => {
    setState(prev => ({ ...prev, locations: prev.locations.filter(l => l.id !== id) }));
  };

  // ─── Section 5 helpers ───────────────────────────────────────────────────────

  const handleJournalChange = (text) => {
    setState(prev => ({ ...prev, journal: { ...prev.journal, text } }));
    clearTimeout(journalDebounceRef.current);
    journalDebounceRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, journal: { ...prev.journal, savedAt: Date.now() } }));
    }, 1000);
  };

  const clearJournal = () => {
    if (!window.confirm('Effacer le journal de bord ?')) return;
    setState(prev => ({ ...prev, journal: { text: '', savedAt: null } }));
    notify('Journal effacé', 'info');
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <User className="w-7 h-7 text-cyan-400" />
            Tracker Personnage
          </h1>
          <p className="page-subtitle">Gérez les besoins de votre personnage et votre session de jeu</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode focus toggle */}
          <button
            onClick={() => updateAlarms({ focusMode: !state.alarms.focusMode })}
            className={clsx('btn-secondary btn-sm gap-1.5', state.alarms.focusMode && 'border-cyan-500/50 text-cyan-400')}
            title="Mode focus : masque les stats vitales"
          >
            {state.alarms.focusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {state.alarms.focusMode ? 'Focus ON' : 'Focus OFF'}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — STATUT VITAL
      ═══════════════════════════════════════════════════ */}
      {!state.alarms.focusMode && (
        <section className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <Heart className="w-5 h-5 text-danger-400" />
              Statut Vital
            </h2>
            <div className="flex items-center gap-3">
              {state.vitals.updatedAt && (
                <span className="text-xs text-slate-500">
                  Mis à jour {formatAgo(state.vitals.updatedAt)}
                </span>
              )}
              <button onClick={resetVitals} className="btn-secondary btn-sm gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Fresh spawn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Faim */}
            <VitalSlider
              icon={<Activity className="w-4 h-4 text-warning-400" />}
              label="Faim"
              value={state.vitals.hunger}
              onChange={v => updateVitals({ hunger: v })}
              tip="Manger quelque chose à Cubby Blast ou dans une station"
            />

            {/* Soif */}
            <VitalSlider
              icon={<Droplets className="w-4 h-4 text-cyan-400" />}
              label="Soif"
              value={state.vitals.thirst}
              onChange={v => updateVitals({ thirst: v })}
              tip="Boire de l'eau ou une boisson dans un distributeur"
            />

            {/* Fatigue */}
            <VitalSlider
              icon={<Moon className="w-4 h-4 text-purple-400" />}
              label="Fatigue"
              value={state.vitals.fatigue}
              onChange={v => updateVitals({ fatigue: v })}
              tip="Se reposer dans une station médicale ou un lit de vaisseau"
            />

            {/* Blessures */}
            <div className="card p-4 space-y-3 bg-space-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger-400" />
                  <span className="text-sm font-medium text-slate-300">Blessures actives</span>
                </div>
                <button
                  onClick={() => updateVitals({ injured: !state.vitals.injured, injuryZones: state.vitals.injured ? [] : state.vitals.injuryZones })}
                  className={clsx(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    state.vitals.injured ? 'bg-danger-600' : 'bg-space-500'
                  )}
                >
                  <span className={clsx('inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform', state.vitals.injured ? 'translate-x-4' : 'translate-x-1')} />
                </button>
              </div>

              {state.vitals.injured && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Zone(s) blessée(s) :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Tête', 'Bras G', 'Bras D', 'Jambe G', 'Jambe D', 'Thorax'].map(zone => (
                      <button
                        key={zone}
                        onClick={() => toggleInjuryZone(zone)}
                        className={clsx(
                          'px-2 py-0.5 rounded text-xs font-medium transition-all border',
                          state.vitals.injuryZones.includes(zone)
                            ? 'bg-danger-500/20 text-danger-400 border-danger-500/40'
                            : 'text-slate-500 border-space-400/30 hover:text-slate-300'
                        )}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-warning-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Utiliser un Medipen ou consulter une station médicale
                  </p>
                </div>
              )}
              {!state.vitals.injured && (
                <p className="text-xs text-success-400">Aucune blessure active</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Focus mode: affiche juste un rappel discret */}
      {state.alarms.focusMode && (
        <div className="card p-3 flex items-center gap-2 bg-cyan-500/5 border-cyan-500/20">
          <EyeOff className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs text-cyan-300">Mode focus actif — statut vital masqué</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — SESSION DE JEU
      ═══════════════════════════════════════════════════ */}
      <section className="card p-5 space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Session de Jeu
        </h2>

        {/* Timer + contrôles */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-4xl font-bold text-cyan-400 tracking-widest">
              {formatElapsed(state.session.elapsed)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {state.session.running ? 'Session en cours' : 'Session arrêtée'}
            </p>
          </div>
          <div className="flex gap-2">
            {!state.session.running ? (
              <button onClick={startSession} className="btn-primary gap-2">
                <Play className="w-4 h-4" />
                Démarrer
              </button>
            ) : (
              <button onClick={stopSession} className="btn-danger gap-2">
                <Pause className="w-4 h-4" />
                Terminer
              </button>
            )}
          </div>
        </div>

        {/* Paramètres de session */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Objectif de session</label>
            <input
              className="input"
              placeholder="Ex: Farmer 500k pour le Constellation"
              value={state.session.goal}
              onChange={e => updateSession({ goal: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">aUEC de départ</label>
            <input
              className="input"
              type="number"
              placeholder="100000"
              value={state.session.auecStart}
              onChange={e => updateSession({ auecStart: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">aUEC actuel</label>
            <input
              className="input"
              type="number"
              placeholder="150000"
              value={state.session.auecCurrent}
              onChange={e => updateSession({ auecCurrent: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Activité principale</label>
            <select
              className="select"
              value={state.session.activity}
              onChange={e => updateSession({ activity: e.target.value })}
            >
              {ACTIVITIES.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Profit stats */}
          <div className="card p-3 bg-space-900/40 flex flex-col justify-center">
            <div className="text-xs text-slate-500 mb-0.5">Profit de session</div>
            <div className={clsx('font-bold text-lg', sessionProfit >= 0 ? 'text-success-400' : 'text-danger-400')}>
              {formatProfit(sessionProfit)}
            </div>
            {sessionProfitPerHour !== null && (
              <div className="text-xs text-slate-500">
                ≈ {formatProfit(sessionProfitPerHour)}/h
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression vers l'objectif */}
        {goalPct !== null && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Progression vers l'objectif
              </span>
              <span className="font-medium text-cyan-400">{goalPct}%</span>
            </div>
            <div className="h-2.5 bg-space-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Historique des sessions */}
        {state.session.history.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Dernières sessions
            </h3>
            <div className="space-y-1.5">
              {state.session.history.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-space-900/40 rounded-lg border border-space-400/20">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(entry.date)}</span>
                    <span className="badge-slate badge">{ACTIVITIES.find(a => a.id === entry.activity)?.label ?? entry.activity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{formatElapsed(entry.duration)}</span>
                    <span className={clsx('font-medium', entry.profit >= 0 ? 'text-success-400' : 'text-danger-400')}>
                      {formatProfit(entry.profit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — TÂCHES
      ═══════════════════════════════════════════════════ */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-success-400" />
            Tâches In-Game
          </h2>
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs font-mono', state.tasks.length >= MAX_TASKS ? 'text-danger-400' : 'text-slate-400')}>
              {state.tasks.length}/{MAX_TASKS}
            </span>
            <button
              onClick={() => setTaskSort(s => s === 'order' ? 'category' : 'order')}
              className="btn-secondary btn-sm gap-1"
              title="Changer le tri"
            >
              <ChevronDown className="w-3 h-3" />
              {taskSort === 'order' ? 'Par ordre' : 'Par catégorie'}
            </button>
          </div>
        </div>

        {/* Ajout tâche */}
        <div className="flex gap-2">
          <select
            className="select w-auto min-w-[130px]"
            value={newTask.category}
            onChange={e => setNewTask(t => ({ ...t, category: e.target.value }))}
          >
            {TASK_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <input
            className="input flex-1"
            placeholder="Ajouter une tâche… (Ex: Vendre minerai à ARC-L1)"
            value={newTask.text}
            onChange={e => setNewTask(t => ({ ...t, text: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            maxLength={120}
          />
          <button
            onClick={addTask}
            disabled={!newTask.text.trim() || state.tasks.length >= MAX_TASKS}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Liste de tâches */}
        {sortedTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            Aucune tâche — ajoutez vos objectifs de session
          </div>
        ) : (
          <ul className="space-y-1.5">
            {sortedTasks.map(task => {
              const cat = TASK_CATEGORIES.find(c => c.id === task.category);
              return (
                <li
                  key={task.id}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
                    task.done
                      ? 'bg-space-900/20 border-space-400/10 opacity-50'
                      : 'bg-space-900/40 border-space-400/20 hover:border-space-400/40'
                  )}
                >
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                    {task.done
                      ? <CheckSquare className="w-4 h-4 text-success-400" />
                      : <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    }
                  </button>
                  <span className={clsx('flex-1 text-sm', task.done ? 'line-through text-slate-500' : 'text-slate-200')}>
                    {task.text}
                  </span>
                  {cat && (
                    <span className={clsx('badge text-xs flex-shrink-0', cat.badge)}>
                      {cat.emoji} {cat.label}
                    </span>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-slate-600 hover:text-danger-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4 — COORDONNÉES
      ═══════════════════════════════════════════════════ */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold-400" />
            Notes de Coordonnées
          </h2>
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs font-mono', state.locations.length >= MAX_LOCATIONS ? 'text-danger-400' : 'text-slate-400')}>
              {state.locations.length}/{MAX_LOCATIONS}
            </span>
            <button
              onClick={() => setShowLocForm(f => !f)}
              disabled={state.locations.length >= MAX_LOCATIONS}
              className="btn-primary btn-sm gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Formulaire ajout */}
        {showLocForm && (
          <div className="card p-4 space-y-3 bg-space-900/40 border-cyan-500/20">
            <h3 className="text-sm font-semibold text-cyan-400">Nouveau point d'intérêt</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nom du point</label>
                <input
                  className="input"
                  placeholder="Ex: Mine abandonnée, Cache secrète..."
                  value={newLoc.name}
                  onChange={e => setNewLoc(l => ({ ...l, name: e.target.value }))}
                  maxLength={60}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Corps céleste</label>
                <select
                  className="select"
                  value={newLoc.body}
                  onChange={e => setNewLoc(l => ({ ...l, body: e.target.value }))}
                >
                  {CELESTIAL_BODIES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Repère OM</label>
                <select
                  className="select"
                  value={newLoc.om}
                  onChange={e => setNewLoc(l => ({ ...l, om: e.target.value }))}
                >
                  {OM_OPTIONS.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Coordonnées / description</label>
                <input
                  className="input"
                  placeholder="Ex: 12°N 45°E ou description libre"
                  value={newLoc.coords}
                  onChange={e => setNewLoc(l => ({ ...l, coords: e.target.value }))}
                  maxLength={80}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Notes</label>
                <input
                  className="input"
                  placeholder="Notes supplémentaires..."
                  value={newLoc.notes}
                  onChange={e => setNewLoc(l => ({ ...l, notes: e.target.value }))}
                  maxLength={120}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLocForm(false)} className="btn-secondary btn-sm">Annuler</button>
              <button
                onClick={addLocation}
                disabled={!newLoc.name.trim()}
                className="btn-primary btn-sm"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* Liste des locations */}
        {state.locations.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            Aucun point d'intérêt sauvegardé
          </div>
        ) : (
          <div className="space-y-2">
            {state.locations.map(loc => (
              <div
                key={loc.id}
                className="flex items-start gap-3 px-3 py-3 bg-space-900/40 rounded-lg border border-space-400/20 hover:border-space-400/40 transition-all"
              >
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm text-slate-200">{loc.name}</span>
                    <span className="badge badge-gold">{loc.body}</span>
                    <span className="badge badge-cyan">{loc.om}</span>
                  </div>
                  {loc.coords && (
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{loc.coords}</p>
                  )}
                  {loc.notes && (
                    <p className="text-xs text-slate-500 mt-0.5">{loc.notes}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">{formatDate(loc.createdAt)}</p>
                </div>
                <button
                  onClick={() => deleteLocation(loc.id)}
                  className="flex-shrink-0 text-slate-600 hover:text-danger-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 5 — JOURNAL DE BORD
      ═══════════════════════════════════════════════════ */}
      <section className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Journal de Bord
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {wordCount(state.journal.text)} mot{wordCount(state.journal.text) !== 1 ? 's' : ''}
            </span>
            {state.journal.savedAt && (
              <span className="text-xs text-success-500 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Sauvegardé {formatAgo(state.journal.savedAt)}
              </span>
            )}
            <button onClick={clearJournal} className="btn-danger btn-sm gap-1">
              <Trash2 className="w-3 h-3" />
              Effacer
            </button>
          </div>
        </div>

        <textarea
          className="input min-h-[160px] resize-y font-mono text-xs leading-relaxed"
          placeholder="Notes de session, idées, observations, coordonnées importantes…"
          value={state.journal.text}
          onChange={e => handleJournalChange(e.target.value)}
        />
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 6 — ALARMES
      ═══════════════════════════════════════════════════ */}
      <section className="card p-5 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Bell className="w-5 h-5 text-warning-400" />
          Alarmes de Session
        </h2>

        <div className="space-y-3">
          {/* Manger/Boire */}
          <AlarmRow
            enabled={state.alarms.eatDrink}
            onToggle={v => {
              updateAlarms({ eatDrink: v });
              notify(v ? 'Rappel manger/boire activé (toutes les 30min)' : 'Rappel manger/boire désactivé', v ? 'success' : 'info');
            }}
            icon={<Droplets className="w-4 h-4 text-cyan-400" />}
            label="Rappel manger/boire"
            description="Notification toutes les 30 minutes pour maintenir les besoins vitaux"
            badge="30 min"
            badgeColor="badge-cyan"
          />

          {/* Sauvegarde hôpital */}
          <AlarmRow
            enabled={state.alarms.hospital}
            onToggle={v => {
              updateAlarms({ hospital: v });
              notify(v ? 'Rappel sauvegarde hôpital activé (toutes les heures)' : 'Rappel sauvegarde désactivé', v ? 'success' : 'info');
            }}
            icon={<Activity className="w-4 h-4 text-success-400" />}
            label="Rappel sauvegarde hôpital"
            description="Notification toutes les heures pour sauvegarder dans un hôpital ou clinique"
            badge="1 heure"
            badgeColor="badge-green"
          />

          {/* Mode focus */}
          <AlarmRow
            enabled={state.alarms.focusMode}
            onToggle={v => updateAlarms({ focusMode: v })}
            icon={<EyeOff className="w-4 h-4 text-slate-400" />}
            label="Mode focus"
            description="Masque la section Statut Vital pour réduire les distractions pendant le jeu"
            badge="Interface"
            badgeColor="badge-slate"
          />
        </div>

        <p className="text-xs text-slate-600 italic">
          Les notifications utilisent le système de toasts de l'application. Gardez l'onglet actif pour les recevoir.
        </p>
      </section>

    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function VitalSlider({ icon, label, value, onChange, tip }) {
  return (
    <div className="card p-4 space-y-2 bg-space-900/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className={clsx('text-sm font-bold tabular-nums', vitalTextColor(value))}>
          {value}%
        </span>
      </div>

      {/* Barre */}
      <div className="h-2.5 bg-space-600 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-300', vitalColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 accent-cyan-500 cursor-pointer"
      />

      {/* Conseil si niveau élevé */}
      {value >= 60 && (
        <p className="text-xs text-warning-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {tip}
        </p>
      )}
    </div>
  );
}

function AlarmRow({ enabled, onToggle, icon, label, description, badge, badgeColor }) {
  return (
    <div className={clsx(
      'flex items-center gap-4 p-3 rounded-lg border transition-all',
      enabled ? 'bg-space-700/40 border-space-300/30' : 'bg-space-900/30 border-space-400/20'
    )}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-200">{label}</span>
          <span className={clsx('badge', badgeColor)}>{badge}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={clsx(
          'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
          enabled ? 'bg-cyan-600' : 'bg-space-500'
        )}
      >
        <span className={clsx('inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform', enabled ? 'translate-x-4' : 'translate-x-1')} />
      </button>
    </div>
  );
}
