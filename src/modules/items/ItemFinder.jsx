import React, { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import {
  Search, Grid3X3, List, Shirt, Coffee, Cpu, Sword, Heart,
  Crosshair, Shield, MapPin, ChevronDown, ChevronUp,
  Filter, X, AlertTriangle, Package, TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import {
  ITEMS,
  ITEMS_CATEGORIES,
  ITEMS_COUNT_BY_CATEGORY,
} from '../../datasets/itemsData.js';

// ─── Icônes par catégorie ─────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  clothing:   Shirt,
  consumable: Coffee,
  gadget:     Cpu,
  melee:      Sword,
  medical:    Heart,
  'fps-weapon': Crosshair,
  armor:      Shield,
};

const CATEGORY_COLORS = {
  clothing:   'text-cyan-400',
  consumable: 'text-yellow-400',
  gadget:     'text-blue-400',
  melee:      'text-purple-400',
  medical:    'text-green-400',
  'fps-weapon': 'text-red-400',
  armor:      'text-slate-300',
};

const CATEGORY_BG = {
  clothing:   'bg-cyan-500/10',
  consumable: 'bg-yellow-500/10',
  gadget:     'bg-blue-500/10',
  melee:      'bg-purple-500/10',
  medical:    'bg-green-500/10',
  'fps-weapon': 'bg-red-500/10',
  armor:      'bg-slate-500/10',
};

const CATEGORY_BADGE = {
  clothing:   'badge-cyan',
  consumable: 'badge-yellow',
  gadget:     'badge-blue',
  melee:      'badge-purple',
  medical:    'badge-green',
  'fps-weapon': 'badge-red',
  armor:      'badge-slate',
};

const SORT_OPTIONS = [
  { id: 'az',       label: 'A → Z'           },
  { id: 'za',       label: 'Z → A'           },
  { id: 'price-asc',  label: 'Prix croissant'  },
  { id: 'price-desc', label: 'Prix décroissant' },
];

const SYSTEMS = ['Tous', 'Stanton', 'Pyro', 'Nyx'];

// ─── Fuse.js config ───────────────────────────────────────────────────────────

const FUSE_OPTIONS = {
  keys: [
    { name: 'name',        weight: 0.5 },
    { name: 'description', weight: 0.2 },
    { name: 'tags',        weight: 0.2 },
    { name: 'subcategory', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
};

// ─── Composants utilitaires ───────────────────────────────────────────────────

function CategoryIcon({ category, size = 'md' }) {
  const Icon = CATEGORY_ICONS[category] || Package;
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return <Icon className={clsx(sizeClass, CATEGORY_COLORS[category])} />;
}

function ItemAvatar({ item }) {
  return (
    <div className={clsx(
      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
      CATEGORY_BG[item.category],
    )}>
      <CategoryIcon category={item.category} size="md" />
    </div>
  );
}

function PriceBadge({ price }) {
  return (
    <span className="text-sm font-semibold text-warning-400">
      {price.toLocaleString('fr-FR')}
      <span className="text-xs font-normal text-slate-500 ml-1">aUEC</span>
    </span>
  );
}

// ─── Shops Expander ───────────────────────────────────────────────────────────

function ShopsPanel({ item }) {
  if (!item.locations || item.locations.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic px-1">Aucun emplacement connu.</p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {item.locations.map((loc, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2 bg-space-700/40 rounded-lg border border-space-400/15"
        >
          <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{loc.shop}</div>
            <div className="text-xs text-slate-500">{loc.stationId} · {loc.system}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Item Card (vue grille) ───────────────────────────────────────────────────

function ItemCard({ item }) {
  const [showShops, setShowShops] = useState(false);
  const catLabel = ITEMS_CATEGORIES.find(c => c.id === item.category)?.label || item.category;

  return (
    <div className={clsx(
      'card overflow-hidden transition-all flex flex-col',
      !item.legal && 'border-red-500/20',
    )}>
      {/* Header */}
      <div className="p-4 flex-1">
        <div className="flex items-start gap-3">
          <ItemAvatar item={item} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-100 text-sm leading-tight">{item.name}</span>
              {!item.legal && (
                <span className="badge badge-red text-xs flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Illégal
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={clsx('badge text-xs', CATEGORY_BADGE[item.category])}>{catLabel}</span>
              {item.subcategory && (
                <span className="badge badge-slate text-xs capitalize">{item.subcategory}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-2">{item.description}</p>

        {/* Prix + compteur shops */}
        <div className="flex items-center justify-between mt-3">
          <PriceBadge price={item.price} />
          <span className="text-xs text-slate-500">{item.locations.length} shop{item.locations.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Shops Toggle */}
      <div className="border-t border-space-400/15">
        <button
          onClick={() => setShowShops(s => !s)}
          className={clsx(
            'w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium transition-colors',
            showShops
              ? 'text-cyan-400 bg-cyan-500/5'
              : 'text-slate-400 hover:text-cyan-400 hover:bg-space-700/30',
          )}
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Où trouver ?
          </span>
          {showShops ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showShops && (
          <div className="px-4 pb-4 pt-1 border-t border-space-400/10 bg-space-900/40">
            <ShopsPanel item={item} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Item Row (vue liste) ─────────────────────────────────────────────────────

function ItemRow({ item }) {
  const [showShops, setShowShops] = useState(false);
  const catLabel = ITEMS_CATEGORIES.find(c => c.id === item.category)?.label || item.category;

  return (
    <div className={clsx(
      'card overflow-hidden transition-all',
      !item.legal && 'border-red-500/15',
    )}>
      <button
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setShowShops(s => !s)}
      >
        {/* Icône compacte */}
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          CATEGORY_BG[item.category],
        )}>
          <CategoryIcon category={item.category} size="sm" />
        </div>

        {/* Nom */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-200">{item.name}</span>
            {!item.legal && <span className="badge badge-red text-xs">Illégal</span>}
          </div>
          <span className="text-xs text-slate-500 truncate hidden sm:block">{item.description}</span>
        </div>

        {/* Catégorie */}
        <span className={clsx('badge text-xs flex-shrink-0 hidden md:inline-flex', CATEGORY_BADGE[item.category])}>
          {catLabel}
        </span>

        {/* Prix */}
        <div className="flex-shrink-0 hidden sm:block">
          <PriceBadge price={item.price} />
        </div>

        {/* Shops toggle */}
        <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
          <MapPin className="w-3 h-3" />
          <span className="hidden lg:inline">{item.locations.length}</span>
          {showShops ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </div>
      </button>

      {showShops && (
        <div className="border-t border-space-400/10 bg-space-900/40 px-4 py-3">
          <ShopsPanel item={item} />
        </div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ counts, activeCategory, onCategoryClick }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-slate-200">Base de données</span>
        <span className="badge badge-cyan ml-auto">{ITEMS.length} items</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {counts.map(cat => {
          const Icon = CATEGORY_ICONS[cat.id] || Package;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-center',
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'border-space-400/20 hover:border-space-300/30 hover:bg-space-700/30',
              )}
            >
              <Icon className={clsx('w-4 h-4', isActive ? 'text-cyan-400' : CATEGORY_COLORS[cat.id])} />
              <span className={clsx('text-xs font-bold', isActive ? 'text-cyan-400' : 'text-slate-300')}>{cat.count}</span>
              <span className="text-xs text-slate-500 leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ItemFinder() {
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('all');
  const [system, setSystem]           = useState('Tous');
  const [legal, setLegal]             = useState('all');
  const [sort, setSort]               = useState('az');
  const [viewMode, setViewMode]       = useState('grid');

  // Fuse instance memoized
  const fuse = useMemo(() => new Fuse(ITEMS, FUSE_OPTIONS), []);

  // Filtrage + tri
  const filtered = useMemo(() => {
    let results = ITEMS;

    // Recherche floue
    if (search.trim().length >= 2) {
      results = fuse.search(search.trim()).map(r => r.item);
    }

    // Filtre catégorie
    if (category !== 'all') {
      results = results.filter(i => i.category === category);
    }

    // Filtre système
    if (system !== 'Tous') {
      results = results.filter(i =>
        i.locations.some(loc => loc.system === system)
      );
    }

    // Filtre légalité
    if (legal === 'legal') {
      results = results.filter(i => i.legal);
    } else if (legal === 'illegal') {
      results = results.filter(i => !i.legal);
    }

    // Tri
    const sorted = [...results];
    if (sort === 'az')         sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'za')         sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);

    return sorted;
  }, [search, category, system, legal, sort, fuse]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
    setSystem('Tous');
    setLegal('all');
    setSort('az');
  }, []);

  const hasActiveFilters = search || category !== 'all' || system !== 'Tous' || legal !== 'all';

  // Handler catégorie depuis stats bar
  const handleStatsCategoryClick = useCallback((catId) => {
    setCategory(prev => prev === catId ? 'all' : catId);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="page-title">Item Finder</h1>
            <p className="page-subtitle">
              Trouvez n'importe quel item du jeu — vêtements, gadgets, médical, armes et plus.
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar
        counts={ITEMS_COUNT_BY_CATEGORY}
        activeCategory={category}
        onCategoryClick={handleStatsCategoryClick}
      />

      {/* Layout 2 colonnes */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ─── Panneau filtres (gauche) ─── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">

          {/* Recherche */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Filtres</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Effacer
                </button>
              )}
            </div>

            {/* Champ recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                className="input pl-9"
                placeholder="Rechercher un item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Catégories */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Catégorie</p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setCategory('all')}
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                  category === 'all'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/40',
                )}
              >
                <Package className="w-4 h-4" />
                <span>Toutes catégories</span>
                <span className="ml-auto text-xs text-slate-500">{ITEMS.length}</span>
              </button>
              {ITEMS_CATEGORIES.map(cat => {
                const Icon = CATEGORY_ICONS[cat.id] || Package;
                const count = ITEMS.filter(i => i.category === cat.id).length;
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(prev => prev === cat.id ? 'all' : cat.id)}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/40',
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', isActive ? 'text-cyan-400' : CATEGORY_COLORS[cat.id])} />
                    <span>{cat.label}</span>
                    <span className="ml-auto text-xs text-slate-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtres supplémentaires */}
          <div className="card p-4 space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Affiner</p>

            {/* Système */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Système</label>
              <div className="flex flex-wrap gap-1.5">
                {SYSTEMS.map(sys => (
                  <button
                    key={sys}
                    onClick={() => setSystem(sys)}
                    className={clsx(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                      system === sys
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : 'text-slate-400 border-space-400/20 hover:text-slate-200 hover:border-space-300/30',
                    )}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>

            {/* Légalité */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Légalité</label>
              <div className="flex gap-1.5">
                {[
                  { id: 'all',     label: 'Tous'    },
                  { id: 'legal',   label: 'Légal'   },
                  { id: 'illegal', label: 'Illégal' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLegal(opt.id)}
                    className={clsx(
                      'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border',
                      legal === opt.id
                        ? opt.id === 'illegal'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : 'text-slate-400 border-space-400/20 hover:text-slate-200',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tri */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Tri</label>
              <select
                className="select w-full text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* ─── Zone résultats (droite) ─── */}
        <main className="flex-1 min-w-0 space-y-4">

          {/* Barre résultats + toggle vue */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">
                <span className="font-bold text-cyan-400">{filtered.length}</span>
                <span className="text-slate-500 ml-1">item{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</span>
              </span>
              {hasActiveFilters && (
                <span className="badge badge-cyan text-xs">Filtres actifs</span>
              )}
            </div>
            <div className="flex items-center gap-1 p-1 bg-space-800 border border-space-400/20 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'grid' ? 'bg-space-600 text-cyan-400' : 'text-slate-500 hover:text-slate-300',
                )}
                title="Vue grille"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'list' ? 'bg-space-600 text-cyan-400' : 'text-slate-500 hover:text-slate-300',
                )}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Résultats */}
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="card p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-space-700 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-300">Aucun item trouvé</p>
                <p className="text-sm text-slate-500 mt-1">
                  Essayez d'autres mots-clés ou supprimez certains filtres.
                </p>
              </div>
              <button onClick={clearFilters} className="btn-secondary btn-sm">
                <X className="w-3.5 h-3.5" /> Effacer les filtres
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(item => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
