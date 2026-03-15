import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FACTIONS, FACTION_TYPES } from '../../datasets/factions.js';
import { filterBy } from '../../utils/helpers.js';
import clsx from 'clsx';
import {
  Shield, Users, AlertTriangle, Globe, ChevronRight,
  Search, Building, Crosshair, Anchor,
} from 'lucide-react';

const ALIGNMENT_STYLES = {
  Légal: { badge: 'badge-green', text: 'text-success-400' },
  Neutre: { badge: 'badge-yellow', text: 'text-warning-400' },
  'Hors-la-loi': { badge: 'badge-red', text: 'text-danger-400' },
};

const TYPE_ICONS = {
  Gouvernement: Shield,
  Corporation: Building,
  Criminel: AlertTriangle,
  Terroriste: AlertTriangle,
  Alien: Globe,
  'Application de la Loi': Shield,
  Militaire: Anchor,
  Guilde: Crosshair,
  Sécurité: Shield,
  Organisation: Users,
};

function FactionAvatar({ faction, size = 'md' }) {
  const [imgError, setImgError] = React.useState(false);
  const Icon = TYPE_ICONS[faction.type] || Users;
  const dim = size === 'lg' ? 'w-20 h-20' : 'w-12 h-12';
  const iconDim = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return (
    <div
      className={clsx(dim, 'rounded-xl flex items-center justify-center flex-shrink-0 border overflow-hidden')}
      style={{ backgroundColor: `${faction.color}15`, borderColor: `${faction.color}30` }}
    >
      {!imgError && faction.imageUrl ? (
        <img src={faction.imageUrl} alt={faction.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <Icon className={iconDim} style={{ color: faction.color }} />
      )}
    </div>
  );
}

function FactionCard({ faction, onClick }) {
  const alignStyle = ALIGNMENT_STYLES[faction.alignment] || ALIGNMENT_STYLES.Neutre;

  return (
    <div
      onClick={() => onClick(faction)}
      className="card-glow p-5 cursor-pointer group hover:border-cyan-500/20 transition-all"
    >
      <div className="flex items-start gap-4 mb-3">
        <FactionAvatar faction={faction} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
            {faction.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="badge badge-slate">{faction.type}</span>
            <span className={`badge ${alignStyle.badge}`}>{faction.alignment}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{faction.description}</p>

      {faction.headquarters && (
        <div className="text-xs text-slate-600 mb-3 flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {faction.headquarters}
        </div>
      )}

      {faction.missions?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {faction.missions.slice(0, 3).map(m => (
            <span key={m} className="badge badge-slate text-xs">{m}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-space-400/20">
        <span className={`text-xs font-medium ${alignStyle.text}`}>{faction.alignment}</span>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
      </div>
    </div>
  );
}

export default function Factions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAlignment, setFilterAlignment] = useState('');

  const filtered = useMemo(() => FACTIONS.filter(f => {
    if (filterType && f.type !== filterType) return false;
    if (filterAlignment && f.alignment !== filterAlignment) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  }), [search, filterType, filterAlignment]);

  const alignments = ['Légal', 'Neutre', 'Hors-la-loi'];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Factions</h1>
        <p className="page-subtitle">{filtered.length} organisations répertoriées dans l'univers de Star Citizen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {alignments.map(a => {
          const count = FACTIONS.filter(f => f.alignment === a).length;
          const style = ALIGNMENT_STYLES[a];
          return (
            <div key={a} className="card p-3 text-center">
              <div className={`text-2xl font-bold font-display ${style.text}`}>{count}</div>
              <div className="text-xs text-slate-500 mt-1">{a}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher une faction..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="select w-auto">
          <option value="">Tous les types</option>
          {FACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-1">
          {alignments.map(a => (
            <button
              key={a}
              onClick={() => setFilterAlignment(filterAlignment === a ? '' : a)}
              className={clsx(
                'badge cursor-pointer transition-all',
                filterAlignment === a ? ALIGNMENT_STYLES[a].badge : 'badge-slate hover:border-slate-400'
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
        {filtered.map(faction => (
          <FactionCard
            key={faction.id}
            faction={faction}
            onClick={(f) => navigate(`/factions/${f.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
