import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MISSION_TYPES_DATA, MISSION_FACTIONS, SAMPLE_MISSIONS } from '../../datasets/missions.js';
import { formatCredits, formatRelativeTime } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Plus, CheckCircle2, Clock, XCircle, AlertTriangle,
  Target, Trash2, TrendingUp, Filter, BarChart3,
  Package, Compass, Star, Shield, Layers,
} from 'lucide-react';

const STATUS_CONFIG = {
  active:    { label: 'En Cours',   color: 'badge-cyan',    icon: Clock,         dot: 'bg-cyan-400'    },
  completed: { label: 'Complétée',  color: 'badge-green',   icon: CheckCircle2,  dot: 'bg-success-400' },
  failed:    { label: 'Échouée',    color: 'badge-red',     icon: XCircle,       dot: 'bg-danger-400'  },
  abandoned: { label: 'Abandonnée', color: 'badge-yellow',  icon: AlertTriangle, dot: 'bg-warning-400' },
};

const CATEGORY_ICONS = {
  combat:      Target,
  transport:   Package,
  industrie:   Star,
  exploration: Compass,
  service:     Shield,
  criminel:    AlertTriangle,
};

const DIFFICULTY_COLORS = {
  Facile:           'badge-green',
  Moyen:            'badge-yellow',
  Difficile:        'badge-red',
  'Très Difficile': 'badge-red',
  Extrême:          'badge-red',
};

function useTrackerState() {
  const [tracked, setTracked] = useState(() => {
    try {
      const saved = localStorage.getItem('sc_mission_tracker');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const save = setTracked;

  useEffect(() => {
    try { localStorage.setItem('sc_mission_tracker', JSON.stringify(tracked)); } catch {}
  }, [tracked]);

  const addMission = useCallback((mission) => {
    save(prev => [
      ...prev,
      {
        ...mission,
        trackId: `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: 'active',
        addedAt: Date.now(),
        completedAt: null,
        earnedPayout: mission.payout,
      },
    ]);
  }, []);

  const setStatus = useCallback((trackId, status) => {
    save(prev => prev.map(m =>
      m.trackId === trackId
        ? { ...m, status, completedAt: status === 'completed' ? Date.now() : m.completedAt }
        : m
    ));
  }, []);

  const updatePayout = useCallback((trackId, payout) => {
    save(prev => prev.map(m => m.trackId === trackId ? { ...m, earnedPayout: payout } : m));
  }, []);

  const remove = useCallback((trackId) => {
    save(prev => prev.filter(m => m.trackId !== trackId));
  }, []);

  const clearCompleted = useCallback(() => {
    save(prev => prev.filter(m => m.status !== 'completed'));
  }, []);

  return { tracked, addMission, setStatus, updatePayout, remove, clearCompleted };
}

function AddMissionModal({ onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('types');

  const filteredTypes = MISSION_TYPES_DATA.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSamples = SAMPLE_MISSIONS.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAddType = (missionType) => {
    const avg = Math.round((missionType.payout.min + missionType.payout.max) / 2);
    onAdd({
      id: missionType.id,
      typeId: missionType.id,
      name: missionType.name,
      category: missionType.category,
      difficulty: missionType.difficulty,
      legal: missionType.legal,
      payout: avg,
      estimatedTime: missionType.estimatedTime,
      faction: missionType.factions?.[0] || null,
      location: null,
    });
    onClose();
  };

  const handleAddSample = (sample) => {
    onAdd(sample);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-space-400/20 flex items-center justify-between">
          <h2 className="font-semibold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Ajouter une Mission
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-space-400/20 space-y-3">
          <input
            className="input w-full"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            {['types', 'actives'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  tab === t
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
                )}
              >
                {t === 'types' ? 'Types de mission' : 'Missions actives'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {tab === 'types' ? (
            <ul className="space-y-1">
              {filteredTypes.map(m => {
                const Icon = CATEGORY_ICONS[m.category] || Target;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => handleAddType(m)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-space-700/50 transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-space-700/60 flex-shrink-0">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{m.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className={`badge ${DIFFICULTY_COLORS[m.difficulty]}`}>{m.difficulty}</span>
                          <span className="text-success-400">{formatCredits(Math.round((m.payout.min + m.payout.max) / 2), true)}</span>
                          <span>{m.estimatedTime} min</span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="space-y-1">
              {filteredSamples.map(m => (
                <li key={m.id}>
                  <button
                    onClick={() => handleAddSample(m)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-space-700/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{m.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="text-success-400">{formatCredits(m.payout, true)}</span>
                        {m.location && <span className="truncate">{m.location}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackedMissionRow({ mission, onStatusChange, onPayoutEdit, onRemove }) {
  const [editingPayout, setEditingPayout] = useState(false);
  const [payoutInput, setPayoutInput] = useState(String(mission.earnedPayout));
  const statusCfg = STATUS_CONFIG[mission.status];
  const StatusIcon = statusCfg.icon;
  const Icon = CATEGORY_ICONS[mission.category] || Target;
  const faction = mission.faction
    ? MISSION_FACTIONS.find(f => f.id === mission.faction)
    : null;

  const handlePayoutSave = () => {
    const val = parseInt(payoutInput, 10);
    if (!isNaN(val) && val >= 0) onPayoutEdit(mission.trackId, val);
    setEditingPayout(false);
  };

  return (
    <div className={clsx(
      'card p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all',
      mission.status === 'completed' && 'opacity-60',
      mission.status === 'failed' && 'opacity-50 border-danger-500/20'
    )}>
      {/* Icon */}
      <div className="p-2 rounded-lg bg-space-700/60 flex-shrink-0 self-start">
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-200">{mission.name}</span>
          <span className={`badge ${DIFFICULTY_COLORS[mission.difficulty] || 'badge-slate'}`}>
            {mission.difficulty}
          </span>
          <span className={`badge ${mission.legal ? 'badge-green' : 'badge-red'} text-xs`}>
            {mission.legal ? 'Légal' : 'Illégal'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{mission.estimatedTime} min
          </span>
          {faction && (
            <span className={faction.legal ? 'text-blue-400' : 'text-red-400'}>{faction.label}</span>
          )}
          {mission.location && <span className="truncate max-w-[140px]">{mission.location}</span>}
          <span className="text-slate-600">
            {formatRelativeTime ? formatRelativeTime(mission.addedAt) : 'récemment'}
          </span>
        </div>
      </div>

      {/* Payout */}
      <div className="flex-shrink-0">
        {editingPayout ? (
          <div className="flex items-center gap-1">
            <input
              className="input w-28 text-right text-sm py-1"
              value={payoutInput}
              onChange={e => setPayoutInput(e.target.value)}
              onBlur={handlePayoutSave}
              onKeyDown={e => e.key === 'Enter' && handlePayoutSave()}
              autoFocus
            />
            <span className="text-xs text-slate-500">aUEC</span>
          </div>
        ) : (
          <button
            onClick={() => { setEditingPayout(true); setPayoutInput(String(mission.earnedPayout)); }}
            className="text-success-400 font-bold text-sm hover:text-success-300 transition-colors"
            title="Cliquer pour modifier"
          >
            {formatCredits(mission.earnedPayout, true)}
          </button>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <select
          value={mission.status}
          onChange={e => onStatusChange(mission.trackId, e.target.value)}
          className={clsx('select py-1 text-xs', mission.status === 'active' && 'border-cyan-500/30')}
        >
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <button
          onClick={() => onRemove(mission.trackId)}
          className="p-1.5 rounded text-slate-600 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function MissionTracker() {
  const { tracked, addMission, setStatus, updatePayout, remove, clearCompleted } = useTrackerState();
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const stats = useMemo(() => {
    const active    = tracked.filter(m => m.status === 'active');
    const completed = tracked.filter(m => m.status === 'completed');
    const failed    = tracked.filter(m => m.status === 'failed' || m.status === 'abandoned');
    const earned    = completed.reduce((s, m) => s + (m.earnedPayout || 0), 0);
    const pending   = active.reduce((s, m) => s + (m.earnedPayout || 0), 0);
    return { active: active.length, completed: completed.length, failed: failed.length, earned, pending };
  }, [tracked]);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return tracked;
    return tracked.filter(m => m.status === filterStatus);
  }, [tracked, filterStatus]);

  const sortedFiltered = [...filtered].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Suivi de Missions</h1>
          <p className="page-subtitle">Gérez vos missions actives, suivez vos gains et votre progression</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une Mission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'En Cours',    value: stats.active,                          color: 'text-cyan-400',    icon: Clock        },
          { label: 'Complétées',  value: stats.completed,                       color: 'text-success-400', icon: CheckCircle2 },
          { label: 'Échouées',    value: stats.failed,                          color: 'text-danger-400',  icon: XCircle      },
          { label: 'Gains Totaux',value: formatCredits(stats.earned, true),     color: 'text-gold-400',    icon: TrendingUp   },
          { label: 'En Attente',  value: formatCredits(stats.pending, true),    color: 'text-purple-400',  icon: BarChart3    },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <div className={`text-lg font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Clear */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-500" />
        <div className="flex gap-2 flex-wrap">
          {[['all', 'Toutes', 'bg-space-700/60 text-slate-300'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label, ''])].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={clsx(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                filterStatus === key
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {stats.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="ml-auto text-xs text-slate-500 hover:text-danger-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Effacer les complétées
          </button>
        )}
      </div>

      {/* Mission list */}
      {sortedFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
          <Target className="w-10 h-10 text-slate-700" />
          {tracked.length === 0 ? (
            <>
              <p className="text-sm">Aucune mission suivie.</p>
              <button onClick={() => setShowModal(true)} className="btn-primary gap-2 text-sm">
                <Plus className="w-4 h-4" />Ajouter une Mission
              </button>
            </>
          ) : (
            <p className="text-sm">Aucune mission dans ce statut.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFiltered.map(m => (
            <TrackedMissionRow
              key={m.trackId}
              mission={m}
              onStatusChange={setStatus}
              onPayoutEdit={updatePayout}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      {/* Progress summary for active missions */}
      {stats.active > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Résumé des Missions Actives
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-display text-cyan-400">{stats.active}</div>
              <div className="text-xs text-slate-500 mt-1">Missions en cours</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-gold-400">
                {formatCredits(stats.pending, true)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Prime potentielle</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-success-400">
                {formatCredits(stats.earned, true)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Déjà encaissé</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddMissionModal
          onAdd={addMission}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
