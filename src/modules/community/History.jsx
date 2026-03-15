import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppActions } from '../../core/StateManager.jsx';
import { formatRelativeTime } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Clock, Trash2, ChevronRight, Search, Rocket, Shield,
  BookOpen, TrendingUp, LayoutDashboard, Map, Users, Route,
  Target, Globe,
} from 'lucide-react';

const ROUTE_ICONS = {
  '/tableau-de-bord': LayoutDashboard,
  '/vaisseaux': Rocket,
  '/flotte': Users,
  '/commerce': TrendingUp,
  '/routes': Route,
  '/missions': Target,
  '/systemes': Globe,
  '/factions': Shield,
  '/guides': BookOpen,
};

function getIcon(path) {
  const base = '/' + path.split('/')[1];
  return ROUTE_ICONS[base] || Clock;
}

function getLabel(path) {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'Tableau de Bord';
  const labels = {
    'tableau-de-bord': 'Tableau de Bord',
    vaisseaux: 'Vaisseaux',
    flotte: 'Flotte',
    commerce: 'Commerce',
    routes: 'Routes',
    missions: 'Missions',
    systemes: 'Systèmes',
    factions: 'Factions',
    guides: 'Guides',
    favoris: 'Favoris',
    historique: 'Historique',
    parametres: 'Paramètres',
  };
  return segments.map(s => labels[s] || s).join(' › ');
}

function groupByDate(history) {
  const groups = {};
  history.forEach(item => {
    const date = new Date(item.visitedAt);
    const key = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export default function History() {
  const navigate = useNavigate();
  const { history } = useAppState();
  const { clearHistory } = useAppActions();

  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return history;
    const q = search.toLowerCase();
    return history.filter(item =>
      item.path.toLowerCase().includes(q) ||
      (item.label || getLabel(item.path)).toLowerCase().includes(q)
    );
  }, [history, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearHistory();
    setConfirmClear(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Historique</h1>
          <p className="page-subtitle">{history.length} pages visitées</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className={clsx(
              'btn gap-2 text-sm',
              confirmClear ? 'btn-danger' : 'btn-ghost text-danger-400 border-danger-500/30 hover:bg-danger-500/10'
            )}
          >
            <Trash2 className="w-4 h-4" />
            {confirmClear ? 'Confirmer la suppression' : 'Effacer l\'historique'}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-400 mb-2">Aucun historique</h2>
          <p className="text-slate-500">Votre historique de navigation apparaîtra ici.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pages Visitées', value: history.length, color: 'text-cyan-400' },
              { label: 'Aujourd\'hui', value: history.filter(h => new Date(h.visitedAt).toDateString() === new Date().toDateString()).length, color: 'text-success-400' },
              { label: 'Sections Uniques', value: new Set(history.map(h => '/' + h.path.split('/')[1])).size, color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrer l'historique..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          {/* Grouped history */}
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="section-title mb-3 capitalize">{date}</h2>
              <div className="card overflow-hidden">
                <div className="divide-y divide-space-400/10">
                  {items.map((item, i) => {
                    const Icon = getIcon(item.path);
                    const label = item.label || getLabel(item.path);
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-4 p-3.5 hover:bg-space-700/30 transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg bg-space-800/60 flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{label}</p>
                          <p className="text-xs text-slate-600 font-mono truncate mt-0.5">{item.path}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-500">
                            {new Date(item.visitedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && search && (
            <div className="card p-8 text-center">
              <p className="text-slate-400">Aucun résultat pour "{search}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
