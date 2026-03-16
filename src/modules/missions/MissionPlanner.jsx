import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MISSION_TYPES_DATA, MISSION_CATEGORIES, MISSION_FACTIONS, SAMPLE_MISSIONS } from '../../datasets/missions.js';
import { formatCredits, formatRelativeTime } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Target, Clock, AlertTriangle, CheckCircle2,
  Layers, Filter, ChevronRight, Star, Shield, Package, Compass,
  ClipboardList, Calculator,
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  Facile: 'badge-green',
  Moyen: 'badge-yellow',
  Difficile: 'badge-red',
  'Très Difficile': 'badge-red',
  Extrême: 'badge-red',
};

const CATEGORY_ICONS = {
  combat:      Target,
  transport:   Package,
  industrie:   Star,
  exploration: Compass,
  service:     Shield,
  criminel:    AlertTriangle,
};

function MissionTypeCard({ mission }) {
  const Icon = CATEGORY_ICONS[mission.category] || Target;
  const avgPayout = Math.round((mission.payout.min + mission.payout.max) / 2);
  const factionObjs = (mission.factions || [])
    .map(fid => MISSION_FACTIONS.find(f => f.id === fid))
    .filter(Boolean);

  return (
    <Link to={`/missions/${mission.id}`} className="card-glow p-4 hover:border-cyan-500/30 transition-all block group">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-space-700/60 flex-shrink-0">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-200 text-sm">{mission.name}</h3>
            <span className={`badge ${DIFFICULTY_COLORS[mission.difficulty]} flex-shrink-0`}>
              {mission.difficulty}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="badge badge-slate">{mission.type}</span>
            {!mission.legal && <span className="badge badge-red">Illégal</span>}
            {mission.stackable && <span className="badge badge-cyan">Empilement</span>}
            {mission.reputation > 0 && (
              <span className="badge badge-purple">Rép. {mission.reputation}+</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{mission.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-space-900/60">
          <div className="text-sm font-bold text-success-400">{formatCredits(avgPayout, true)}</div>
          <div className="text-xs text-slate-600">Prime Moy.</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-space-900/60">
          <div className="text-sm font-bold text-cyan-400">{mission.estimatedTime} min</div>
          <div className="text-xs text-slate-600">Durée Est.</div>
        </div>
      </div>

      {factionObjs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {factionObjs.slice(0, 3).map(f => (
            <span
              key={f.id}
              className={`text-xs px-1.5 py-0.5 rounded ${f.legal ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}
            >
              {f.label}
            </span>
          ))}
          {factionObjs.length > 3 && (
            <span className="text-xs text-slate-500">+{factionObjs.length - 3}</span>
          )}
        </div>
      )}

      {mission.tips && (
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <CheckCircle2 className="w-3 h-3 text-success-400 flex-shrink-0 mt-0.5" />
          {mission.tips}
        </div>
      )}
      <div className="flex items-center justify-end mt-2">
        <span className="text-xs text-slate-600 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
          Voir le détail <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function ActiveMissionCard({ mission }) {
  const isExpired = mission.expires && mission.expires < Date.now();
  const faction = MISSION_FACTIONS.find(f => f.id === mission.faction);

  return (
    <div className={clsx(
      'card p-4 flex items-start gap-3',
      isExpired && 'opacity-50 border-danger-500/20'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-200 text-sm">{mission.name}</h3>
          <span className={`badge ${mission.legal ? 'badge-green' : 'badge-red'} flex-shrink-0`}>
            {mission.legal ? 'Légal' : 'Illégal'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 truncate">{mission.description}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-bold text-success-400">{formatCredits(mission.payout, true)}</span>
          <span className="badge badge-slate">{mission.difficulty}</span>
          {faction && (
            <span className={`text-xs ${faction.legal ? 'text-blue-400' : 'text-red-400'}`}>
              {faction.label}
            </span>
          )}
        </div>
        {mission.expires && (
          <div className={clsx('text-xs flex items-center gap-1 mt-1', isExpired ? 'text-danger-400' : 'text-slate-500')}>
            <Clock className="w-3 h-3" />
            {isExpired ? 'Expirée' : formatRelativeTime(mission.expires)}
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />
    </div>
  );
}

export default function MissionPlanner() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory]     = useState('');
  const [selectedFaction, setSelectedFaction]       = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showIllegal, setShowIllegal]               = useState(false);

  const filteredTypes = useMemo(() => {
    return MISSION_TYPES_DATA.filter(m => {
      if (selectedCategory  && m.category !== selectedCategory) return false;
      if (selectedFaction   && !(m.factions || []).includes(selectedFaction)) return false;
      if (selectedDifficulty && m.difficulty !== selectedDifficulty) return false;
      if (!showIllegal && !m.legal) return false;
      return true;
    });
  }, [selectedCategory, selectedFaction, selectedDifficulty, showIllegal]);

  const activeMissions = useMemo(() => {
    const shuffled = [...SAMPLE_MISSIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 12);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDifficulties = ['Facile', 'Moyen', 'Difficile', 'Très Difficile', 'Extrême'];
  const avgPayout = SAMPLE_MISSIONS.reduce((s, m) => s + m.payout, 0) / SAMPLE_MISSIONS.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Planificateur de Missions</h1>
          <p className="page-subtitle">Découvrez tous les types de missions disponibles dans Star Citizen</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/missions/tracker')} className="btn-secondary gap-2">
            <ClipboardList className="w-4 h-4" />
            Suivi
          </button>
          <button onClick={() => navigate('/missions/calculateur')} className="btn-secondary gap-2">
            <Calculator className="w-4 h-4" />
            Calculateur
          </button>
          <button onClick={() => navigate('/missions/empilement')} className="btn-primary gap-2">
            <Layers className="w-4 h-4" />
            IA d'Empilement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Types de Missions',    value: MISSION_TYPES_DATA.length,                          color: 'text-cyan-400'    },
          { label: 'Missions Légales',     value: MISSION_TYPES_DATA.filter(m => m.legal).length,     color: 'text-success-400' },
          { label: 'Missions Empilab.',    value: MISSION_TYPES_DATA.filter(m => m.stackable).length, color: 'text-purple-400'  },
          { label: 'Prime Moy. (Actives)', value: formatCredits(avgPayout, true),                     color: 'text-gold-400'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            selectedCategory === ''
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
          )}
        >
          Toutes
        </button>
        {MISSION_CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICONS[cat.id] || Target;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-500" />
        <select value={selectedFaction} onChange={e => setSelectedFaction(e.target.value)} className="select w-auto">
          <option value="">Toutes les factions</option>
          {MISSION_FACTIONS.map(f => (
            <option key={f.id} value={f.id}>
              {f.label}{f.minReputation > 0 ? ` (Rép. ${f.minReputation}+)` : ''}
            </option>
          ))}
        </select>
        <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} className="select w-auto">
          <option value="">Toutes difficultés</option>
          {allDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <div className="relative">
            <input type="checkbox" checked={showIllegal} onChange={e => setShowIllegal(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-space-500 peer-checked:bg-cyan-600 rounded-full transition-colors border border-space-400/40" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-slate-400">Illégal</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Types */}
        <div className="lg:col-span-2">
          <h2 className="section-title mb-4">{filteredTypes.length} Types de Missions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {filteredTypes.map(mission => (
              <MissionTypeCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>

        {/* Active Missions */}
        <div>
          <h2 className="section-title mb-4">Missions Actives</h2>
          <div className="space-y-3 stagger-children">
            {activeMissions.map(mission => (
              <ActiveMissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
