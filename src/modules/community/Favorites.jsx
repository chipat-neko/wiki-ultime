import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../core/StateManager.jsx';
import { SHIPS } from '../../datasets/ships.js';
import { FACTIONS } from '../../datasets/factions.js';
import { GUIDES } from '../../datasets/guides.js';
import clsx from 'clsx';
import {
  Star, Rocket, Shield, BookOpen, Trash2, ChevronRight,
  Search,
} from 'lucide-react';

// stateKey = clé dans state.favorites (pluriel), type = identifiant interne (singulier)
const TYPE_CONFIG = {
  ship: {
    stateKey: 'ships',
    label: 'Vaisseau',
    icon: Rocket,
    color: 'text-cyan-400',
    badge: 'badge-cyan',
    getItem: id => SHIPS.find(s => s.id === id),
    getTitle: item => item?.name,
    getSubtitle: item => item ? `${item.manufacturer} • ${item.role}` : null,
    route: id => `/vaisseaux/${id}`,
  },
  faction: {
    stateKey: 'factions',
    label: 'Faction',
    icon: Shield,
    color: 'text-purple-400',
    badge: 'badge-slate',
    getItem: id => FACTIONS.find(f => f.id === id),
    getTitle: item => item?.name,
    getSubtitle: item => item ? `${item.type} • ${item.alignment}` : null,
    route: id => `/factions/${id}`,
  },
  guide: {
    stateKey: 'guides',
    label: 'Guide',
    icon: BookOpen,
    color: 'text-gold-400',
    badge: 'badge-slate',
    getItem: id => GUIDES.find(g => g.id === id),
    getTitle: item => item?.title,
    getSubtitle: item => item ? `${item.category}${item.readTime ? ` • ${item.readTime} min` : ''}` : null,
    route: id => `/guides/${id}`,
  },
};

const ALL_TABS = ['Tous', 'Vaisseaux', 'Factions', 'Guides'];
const TAB_TYPES = { Tous: null, Vaisseaux: 'ship', Factions: 'faction', Guides: 'guide' };

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState('Tous');
  const [search, setSearch] = useState('');

  // Aplatit { ships: [], guides: [], ... } en une liste unifiée
  const enriched = useMemo(() => {
    const result = [];
    Object.entries(TYPE_CONFIG).forEach(([type, config]) => {
      const items = favorites[config.stateKey] || [];
      items.forEach(item => {
        const dataItem = config.getItem(item.id);
        result.push({
          ...item,
          type,
          config,
          dataItem,
          title: config.getTitle(dataItem) || item.id,
          subtitle: config.getSubtitle(dataItem),
        });
      });
    });
    return result;
  }, [favorites]);

  const filtered = useMemo(() => {
    const typeFilter = TAB_TYPES[activeTab];
    return enriched.filter(f => {
      if (typeFilter && f.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          (f.subtitle || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enriched, activeTab, search]);

  const counts = useMemo(() => ({
    Tous: enriched.length,
    Vaisseaux: enriched.filter(f => f.type === 'ship').length,
    Factions: enriched.filter(f => f.type === 'faction').length,
    Guides: enriched.filter(f => f.type === 'guide').length,
  }), [enriched]);

  const totalCount = enriched.length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Favoris</h1>
        <p className="page-subtitle">{totalCount} éléments sauvegardés</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.Tous, color: 'text-slate-300' },
          { label: 'Vaisseaux', value: counts.Vaisseaux, color: 'text-cyan-400' },
          { label: 'Factions', value: counts.Factions, color: 'text-purple-400' },
          { label: 'Guides', value: counts.Guides, color: 'text-gold-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {totalCount === 0 ? (
        <div className="card p-12 text-center">
          <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-400 mb-2">Aucun favori</h2>
          <p className="text-slate-500">
            Ajoutez des vaisseaux, factions ou guides en favoris pour les retrouver ici rapidement.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <div className="tabs flex-1">
              {ALL_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx('tab', activeTab === tab && 'tab-active')}
                >
                  {tab}
                  <span className="ml-1.5 text-xs opacity-60">({counts[tab]})</span>
                </button>
              ))}
            </div>
            <div className="relative min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          {/* List */}
          {filtered.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="divide-y divide-space-400/10">
                {filtered.map(fav => {
                  const { config, title, subtitle, type, id } = fav;
                  const Icon = config.icon;
                  return (
                    <div key={`${type}-${id}`} className="flex items-center gap-4 p-4 hover:bg-space-700/30 transition-colors">
                      <div className="p-2 rounded-lg bg-space-700/60 flex-shrink-0">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => navigate(config.route(id))}
                          className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition-colors truncate block text-left"
                        >
                          {title}
                        </button>
                        {subtitle && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`badge ${config.badge}`}>{config.label}</span>
                        <button
                          onClick={() => navigate(config.route(id))}
                          className="btn-ghost p-1.5 text-slate-500 hover:text-slate-300"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFavorite(config.stateKey, { id })}
                          className="btn-ghost p-1.5 text-slate-600 hover:text-danger-400"
                          title="Retirer des favoris"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-slate-400">Aucun favori ne correspond à votre filtre.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
