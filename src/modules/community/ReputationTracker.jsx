import React, { useState, useEffect, useMemo } from 'react';
import { FACTIONS } from '../../datasets/factions.js';
import { formatCredits } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Users, Star, TrendingUp, TrendingDown, Save, RotateCcw,
  ChevronUp, ChevronDown, Info, Award, Lock, Unlock,
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sc_reputation_tracker';

const REP_LEVELS = [
  { id: 'hostile',   label: 'Hostile',    min: -1000, max: -501, color: 'text-danger-400',  bg: 'bg-danger-500/15',  bar: 'bg-danger-500'  },
  { id: 'unfriendly',label: 'Défavorable',min: -500,  max: -101, color: 'text-red-400',     bg: 'bg-red-500/10',     bar: 'bg-red-500'     },
  { id: 'neutral',   label: 'Neutre',     min: -100,  max: 99,   color: 'text-slate-400',   bg: 'bg-space-700/50',   bar: 'bg-slate-500'   },
  { id: 'friendly',  label: 'Amical',     min: 100,   max: 499,  color: 'text-success-400', bg: 'bg-success-500/10', bar: 'bg-success-500' },
  { id: 'honored',   label: 'Honoré',     min: 500,   max: 799,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    bar: 'bg-cyan-500'    },
  { id: 'exalted',   label: 'Exalté',     min: 800,   max: 1000, color: 'text-gold-400',    bg: 'bg-gold-500/10',    bar: 'bg-gold-500'    },
];

const TRACKED_FACTIONS = [
  { id: 'advocacy',        name: 'Advocacy',              color: '#3b82f6', unlocks: ['Primes T3+', 'Missions Spéciales', 'Équipement UEE Avancé'] },
  { id: 'crusader',        name: 'Crusader Industries',   color: '#06b6d4', unlocks: ['Vaisseaux Crusader -10%', 'Missions Défense', 'Hangar CRU'] },
  { id: 'hurston-dynamics',name: 'Hurston Dynamics',      color: '#ef4444', unlocks: ['Armes HD Exclusives', 'Missions Mines HD', 'Accès HDMS'] },
  { id: 'microtech',       name: 'microTech',             color: '#8b5cf6', unlocks: ['Composants mT Exclusifs', 'Missions Recherche', 'Accès Labs'] },
  { id: 'arccorp',         name: 'ArcCorp',               color: '#f59e0b', unlocks: ['Composants ArcCorp', 'Missions Industrielles', 'Réductions'] },
  { id: 'shubin',          name: 'Shubin Interstellar',   color: '#22c55e', unlocks: ['Missions Minage Avancé', 'Zones Exclusives', 'Véhicules ROC'] },
  { id: 'covalex',         name: 'Covalex Shipping',      color: '#64748b', unlocks: ['Missions Livraison Haute Valeur', 'Entrepôts Accès', 'Bonus +15%'] },
  { id: 'rayari',          name: 'Rayari Inc.',            color: '#a78bfa', unlocks: ['Missions Exploration', 'Équipement Scan', 'Données Secrètes'] },
  { id: 'nine-tails',      name: 'Nine Tails',            color: '#dc2626', unlocks: ['Missions Illégales', 'GrimHEX Services', 'Armement Noir'] },
  { id: 'xenothreat',      name: 'XenoThreat',            color: '#f97316', unlocks: ['Missions XenoThreat', 'Accès Zones Événement'] },
  { id: 'klescher',        name: 'Klescher (Prison)',      color: '#78716c', unlocks: ['Réduction Peine', 'Missions Prison', 'Sortie Anticipée'] },
  { id: 'citizens',        name: 'Citoyens UEE',          color: '#0ea5e9', unlocks: ['Missions Civiques', 'Confiance Accrue', 'Statut Social'] },
];

function getLevel(rep) {
  return REP_LEVELS.find(l => rep >= l.min && rep <= l.max) || REP_LEVELS[2];
}

function repBarWidth(rep) {
  // -1000 → 0%,  0 → 50%,  1000 → 100%
  return Math.min(100, Math.max(0, ((rep + 1000) / 2000) * 100));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReputationTracker() {
  const [reps, setReps] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return Object.fromEntries(TRACKED_FACTIONS.map(f => [f.id, 0]));
  });

  const [filter, setFilter] = useState('all'); // 'all' | 'positive' | 'negative'
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reps));
  }, [reps]);

  const adjust = (id, delta) => {
    setReps(prev => ({ ...prev, [id]: Math.min(1000, Math.max(-1000, (prev[id] || 0) + delta)) }));
  };

  const setDirect = (id, val) => {
    const n = Math.min(1000, Math.max(-1000, Number(val)));
    if (!isNaN(n)) setReps(prev => ({ ...prev, [id]: n }));
  };

  const resetAll = () => {
    if (window.confirm('Réinitialiser toutes les réputations ?')) {
      setReps(Object.fromEntries(TRACKED_FACTIONS.map(f => [f.id, 0])));
    }
  };

  const saveConfirm = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = useMemo(() => TRACKED_FACTIONS.filter(f => {
    if (filter === 'positive') return (reps[f.id] || 0) > 0;
    if (filter === 'negative') return (reps[f.id] || 0) < 0;
    return true;
  }), [filter, reps]);

  const overallStats = useMemo(() => {
    const vals = Object.values(reps);
    const positive = vals.filter(v => v > 0).length;
    const negative = vals.filter(v => v < 0).length;
    const exalted = vals.filter(v => v >= 800).length;
    const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
    return { positive, negative, exalted, avg };
  }, [reps]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Suivi de Réputation</h1>
          <p className="page-subtitle">Gérez votre standing avec toutes les factions de Stanton et Pyro</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className="btn-secondary gap-2">
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button onClick={saveConfirm} className={clsx('gap-2', saved ? 'btn-primary' : 'btn-secondary')}>
            <Save className="w-4 h-4" />
            {saved ? 'Sauvegardé !' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Relations Positives', value: overallStats.positive, color: 'text-success-400', icon: TrendingUp },
          { label: 'Relations Négatives', value: overallStats.negative, color: 'text-danger-400', icon: TrendingDown },
          { label: 'Rang Exalté', value: overallStats.exalted, color: 'text-gold-400', icon: Star },
          { label: 'Réputation Moy.', value: overallStats.avg, color: overallStats.avg >= 0 ? 'text-success-400' : 'text-danger-400', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['all', 'Toutes'], ['positive', 'Positives'], ['negative', 'Négatives']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm transition-all', filter === val ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/50')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reputation cards */}
      <div className="space-y-3">
        {filtered.map(faction => {
          const rep = reps[faction.id] || 0;
          const level = getLevel(rep);
          const isEditing = editing === faction.id;

          return (
            <div key={faction.id} className={clsx('card p-4', level.bg)}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Faction info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${faction.color}20`, border: `1px solid ${faction.color}40` }}>
                    <Users className="w-5 h-5" style={{ color: faction.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{faction.name}</div>
                    <span className={clsx('text-xs font-medium', level.color)}>{level.label}</span>
                  </div>
                </div>

                {/* Rep bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">−1000</span>
                    <span className={clsx('font-bold', level.color)}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => { setDirect(faction.id, editVal); setEditing(null); }}
                          onKeyDown={e => { if (e.key === 'Enter') { setDirect(faction.id, editVal); setEditing(null); } }}
                          className="w-20 text-center bg-space-700 border border-space-400/30 rounded px-1 py-0.5 text-xs"
                          autoFocus
                          min={-1000}
                          max={1000}
                        />
                      ) : (
                        <button onClick={() => { setEditing(faction.id); setEditVal(String(rep)); }}>
                          {rep > 0 ? '+' : ''}{rep}
                        </button>
                      )}
                    </span>
                    <span className="text-slate-600">+1000</span>
                  </div>
                  <div className="h-3 bg-space-600 rounded-full overflow-hidden relative">
                    {/* Center marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-space-400/50" />
                    <div
                      className={clsx('h-full rounded-full transition-all duration-300', level.bar)}
                      style={{ width: `${repBarWidth(rep)}%` }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[-50, -10, -1].map(d => (
                    <button key={d} onClick={() => adjust(faction.id, d)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 text-xs font-bold transition-all">
                      {d}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-space-400/20 mx-1" />
                  {[1, 10, 50].map(d => (
                    <button key={d} onClick={() => adjust(faction.id, d)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-success-500/10 hover:bg-success-500/20 text-success-400 text-xs font-bold transition-all">
                      +{d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unlocks */}
              {rep >= 100 && faction.unlocks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-space-400/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Unlock className="w-3 h-3 text-success-400" />
                    <span className="text-xs text-slate-500">Débloqué avec ce standing :</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {faction.unlocks
                      .filter((_, i) => {
                        if (rep >= 800) return true;
                        if (rep >= 500) return i < 2;
                        return i < 1;
                      })
                      .map(u => (
                        <span key={u} className="text-xs px-2 py-0.5 rounded bg-success-500/10 text-success-400">
                          {u}
                        </span>
                      ))}
                    {rep < 800 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-space-700 text-slate-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> +{faction.unlocks.length - (rep >= 500 ? 2 : 1)} à débloquer
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Levels legend */}
      <div className="card p-4">
        <h2 className="section-title mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-gold-400" />
          Niveaux de Réputation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {REP_LEVELS.map(l => (
            <div key={l.id} className={clsx('p-3 rounded-lg text-center', l.bg)}>
              <div className={clsx('font-bold text-sm', l.color)}>{l.label}</div>
              <div className="text-xs text-slate-600 mt-0.5">{l.min} à {l.max}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          Les valeurs de réputation sont approximatives. Le système en jeu utilise des niveaux internes différents.
          Cet outil vous aide à suivre votre progression personnelle.
        </p>
      </div>
    </div>
  );
}
