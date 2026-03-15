import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUIDES, GUIDE_CATEGORIES } from '../../datasets/guides.js';
import clsx from 'clsx';
import {
  BookOpen, Search, Star, Clock, ChevronRight, TrendingUp,
  Zap, Target, Package, Pickaxe, Shield, Users, Map, Rocket,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Débutant: Star,
  Navigation: Map,
  Commerce: TrendingUp,
  Minage: Pickaxe,
  Combat: Target,
  Récupération: Package,
  Exploration: Map,
  Flotte: Users,
  Vaisseaux: Rocket,
};

const DIFFICULTY_STYLES = {
  Facile: 'badge-green',
  Moyen: 'badge-yellow',
  Difficile: 'badge-red',
  Extrême: 'badge-purple',
  Expert: 'badge-red',
};

function GuideCard({ guide, onClick }) {
  const Icon = CATEGORY_ICONS[guide.category] || BookOpen;

  return (
    <div
      onClick={() => onClick(guide)}
      className="card-glow p-5 cursor-pointer group hover:border-cyan-500/20 transition-all flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-space-700/60 flex-shrink-0 group-hover:bg-cyan-500/10 transition-colors">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors leading-tight">
            {guide.title}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="badge badge-slate">{guide.category}</span>
            {guide.difficulty && (
              <span className={`badge ${DIFFICULTY_STYLES[guide.difficulty] || 'badge-slate'}`}>
                {guide.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 flex-1">{guide.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-space-400/20">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {guide.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.readTime} min
            </span>
          )}
          {guide.helpful !== undefined && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-gold-400" />
              {guide.helpful.toLocaleString('fr-FR')} utiles
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );
}

export default function GameplayGuides() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const difficulties = ['Facile', 'Moyen', 'Difficile', 'Extrême', 'Expert'];

  const filtered = useMemo(() => {
    return GUIDES.filter(g => {
      if (filterCategory && g.category !== filterCategory) return false;
      if (filterDifficulty && g.difficulty !== filterDifficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, filterCategory, filterDifficulty]);

  const featured = useMemo(() =>
    [...GUIDES].sort((a, b) => (b.helpful || 0) - (a.helpful || 0)).slice(0, 3),
    []
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Guides de Jeu</h1>
        <p className="page-subtitle">{GUIDES.length} guides pour maîtriser Star Citizen</p>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-400" />
            Guides Recommandés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map(guide => {
              const Icon = CATEGORY_ICONS[guide.category] || BookOpen;
              return (
                <div
                  key={guide.id}
                  onClick={() => navigate(`/guides/${guide.id}`)}
                  className="card-glow p-4 cursor-pointer group hover:border-gold-500/30 transition-all border-gold-500/10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-gold-400" />
                    <span className="badge badge-slate">{guide.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-200 group-hover:text-gold-400 transition-colors text-sm mb-1">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{guide.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Guides', value: GUIDES.length, color: 'text-cyan-400' },
          { label: 'Catégories', value: GUIDE_CATEGORIES.length, color: 'text-blue-400' },
          { label: 'Pour Débutants', value: GUIDES.filter(g => g.difficulty === 'Facile').length, color: 'text-success-400' },
          { label: 'Guides Avancés', value: GUIDES.filter(g => g.difficulty === 'Difficile' || g.difficulty === 'Extrême' || g.difficulty === 'Expert').length, color: 'text-danger-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un guide..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="select w-auto">
          <option value="">Toutes les catégories</option>
          {GUIDE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} className="select w-auto">
          <option value="">Toutes difficultés</option>
          {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Category tabs */}
      {!filterCategory && !search && !filterDifficulty && (
        <div className="space-y-6">
          {GUIDE_CATEGORIES.map(category => {
            const guides = GUIDES.filter(g => g.category === category);
            if (guides.length === 0) return null;
            const Icon = CATEGORY_ICONS[category] || BookOpen;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="section-title flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {category}
                  </h2>
                  <span className="text-xs text-slate-500">{guides.length} guide{guides.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {guides.map(g => (
                    <GuideCard key={g.id} guide={g} onClick={g => navigate(`/guides/${g.id}`)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtered results */}
      {(filterCategory || search || filterDifficulty) && (
        <div>
          <h2 className="section-title mb-4">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</h2>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
              {filtered.map(g => (
                <GuideCard key={g.id} guide={g} onClick={g => navigate(`/guides/${g.id}`)} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun guide ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
