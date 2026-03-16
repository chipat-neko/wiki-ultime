import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Fuse from 'fuse.js';
import {
  BookOpen, Search, Star, ChevronRight, ChevronLeft,
  Globe, Users, Sword, Shield, MapPin, Clock,
  X, BookMarked, Calendar, Tag, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import {
  LORE_ARTICLES,
  LORE_CATEGORIES,
  IMPORTANCE_CONFIG,
  FEATURED_ARTICLES,
} from '../../datasets/loreData.js';

// ─── Constantes ───────────────────────────────────────────────────────────────

const LS_KEY = 'sc_lore_favorites';

const CATEGORY_ICONS = {
  race:       Globe,
  personnage: Users,
  evenement:  Zap,
  faction:    Shield,
  lieu:       MapPin,
};

const CATEGORY_LABELS = {
  race:       'Race',
  personnage: 'Personnage',
  evenement:  'Événement',
  faction:    'Faction',
  lieu:       'Lieu',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFavorites() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(favs));
  } catch { /* noop */ }
}

function getCategoryColor(categoryId) {
  return LORE_CATEGORIES.find(c => c.id === categoryId)?.color ?? '#64748b';
}

// ─── Fuse.js setup ────────────────────────────────────────────────────────────

const fuse = new Fuse(LORE_ARTICLES, {
  keys: ['title', 'summary', 'tags', 'subcategory'],
  threshold: 0.35,
  includeScore: true,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImportanceBadge({ importance }) {
  const cfg = IMPORTANCE_CONFIG[importance] ?? IMPORTANCE_CONFIG.mineur;
  return <span className={`badge ${cfg.badge} text-xs`}>{cfg.label}</span>;
}

function CategoryBadge({ category }) {
  const color = getCategoryColor(category);
  const label = CATEGORY_LABELS[category] ?? category;
  return (
    <span
      className="badge text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}

function ArticleListItem({ article, isSelected, onClick }) {
  const cfg = IMPORTANCE_CONFIG[article.importance] ?? IMPORTANCE_CONFIG.mineur;
  return (
    <button
      onClick={() => onClick(article)}
      className={clsx(
        'w-full text-left px-3 py-2.5 rounded-lg transition-all group',
        isSelected
          ? 'bg-cyan-500/15 border border-cyan-500/30'
          : 'hover:bg-space-700/40 border border-transparent',
      )}
    >
      <div className="flex items-start gap-2">
        <div className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', cfg.dot)} />
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-sm font-medium leading-tight truncate',
            isSelected ? 'text-cyan-300' : 'text-slate-300 group-hover:text-slate-100',
          )}>
            {article.title}
          </p>
          {article.era && (
            <p className="text-xs text-slate-600 mt-0.5 truncate">{article.era}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function CategoryCard({ category, count, onClick }) {
  const Icon = CATEGORY_ICONS[category.id] ?? BookOpen;
  return (
    <button
      onClick={() => onClick(category.id)}
      className="card-glow p-5 cursor-pointer group hover:border-cyan-500/20 transition-all text-left w-full"
      style={{ borderColor: `${category.color}20` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: category.color }} />
      </div>
      <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
        {category.label}
      </h3>
      <p className="text-xs text-slate-500 mt-1">{category.description}</p>
      <p className="text-xs font-bold mt-3" style={{ color: category.color }}>
        {count} articles
      </p>
    </button>
  );
}

function FeaturedCard({ article, onClick }) {
  const Icon = CATEGORY_ICONS[article.category] ?? BookOpen;
  const color = getCategoryColor(article.category);
  return (
    <button
      onClick={() => onClick(article)}
      className="card p-4 cursor-pointer group hover:border-cyan-500/20 transition-all text-left w-full"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
            {article.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{article.summary}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-500 flex-shrink-0 mt-0.5" />
      </div>
    </button>
  );
}

function RelatedCard({ article, onClick }) {
  const color = getCategoryColor(article.category);
  return (
    <button
      onClick={() => onClick(article)}
      className="card p-3 cursor-pointer group hover:border-cyan-500/20 transition-all text-left w-full"
    >
      <p className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors truncate">
        {article.title}
      </p>
      <p className="text-xs mt-0.5" style={{ color }}>
        {CATEGORY_LABELS[article.category] ?? article.category}
      </p>
    </button>
  );
}

// ─── Timeline View ────────────────────────────────────────────────────────────

function TimelineView({ onSelectArticle, filterCat }) {
  const [catFilter, setCatFilter] = useState(filterCat ?? 'all');

  // Extract articles with a numeric-ish date and sort
  const timedArticles = useMemo(() => {
    const articles = catFilter === 'all'
      ? LORE_ARTICLES
      : LORE_ARTICLES.filter(a => a.category === catFilter);

    return [...articles]
      .filter(a => /\d{4}/.test(a.date))
      .sort((a, b) => {
        const yearA = parseInt(a.date.match(/\d{4}/)?.[0] ?? '0', 10);
        const yearB = parseInt(b.date.match(/\d{4}/)?.[0] ?? '0', 10);
        return yearA - yearB;
      });
  }, [catFilter]);

  return (
    <div className="space-y-4">
      {/* Filtres catégorie */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCatFilter('all')}
          className={clsx('btn-ghost text-xs px-3 py-1.5', catFilter === 'all' && 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30')}
        >
          Tous
        </button>
        {LORE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCatFilter(cat.id)}
            className={clsx('btn-ghost text-xs px-3 py-1.5', catFilter === cat.id && 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30')}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline items */}
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-[88px] top-0 bottom-0 w-px bg-space-400/30" />

        <div className="space-y-3">
          {timedArticles.map(article => {
            const color = getCategoryColor(article.category);
            const year = article.date.match(/\d{4}/)?.[0] ?? '';
            const Icon = CATEGORY_ICONS[article.category] ?? BookOpen;
            const cfg = IMPORTANCE_CONFIG[article.importance] ?? IMPORTANCE_CONFIG.mineur;

            return (
              <button
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="w-full text-left group flex items-start gap-4"
              >
                {/* Date */}
                <div className="w-20 flex-shrink-0 text-right pt-1">
                  <span className="text-xs font-bold text-slate-400">{year}</span>
                </div>

                {/* Point sur la timeline */}
                <div className="relative flex-shrink-0 mt-1">
                  <div
                    className="w-4 h-4 rounded-full border-2 z-10 relative"
                    style={{
                      backgroundColor: `${color}30`,
                      borderColor: color,
                    }}
                  />
                </div>

                {/* Contenu */}
                <div className="flex-1 card p-3 group-hover:border-cyan-500/20 transition-all">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {article.title}
                        </span>
                        <span className={clsx('badge text-xs', cfg.badge)}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{article.summary}</p>
                    </div>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                  </div>
                  {article.era && (
                    <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.era}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {timedArticles.length === 0 && (
        <div className="card p-8 text-center">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aucun événement daté pour ce filtre.</p>
        </div>
      )}
    </div>
  );
}

// ─── Article Detail ───────────────────────────────────────────────────────────

function ArticleDetail({ article, allArticles, onSelectArticle, favorites, onToggleFavorite }) {
  const isFav = favorites.includes(article.id);

  const relatedArticles = useMemo(() => {
    if (!article.related?.length) return [];
    return article.related
      .map(id => allArticles.find(a => a.id === id))
      .filter(Boolean);
  }, [article, allArticles]);

  const { prevArticle, nextArticle } = useMemo(() => {
    const idx = allArticles.findIndex(a => a.id === article.id);
    return {
      prevArticle: idx > 0 ? allArticles[idx - 1] : null,
      nextArticle: idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
    };
  }, [article, allArticles]);

  const color = getCategoryColor(article.category);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-6" style={{ borderColor: `${color}20` }}>
        <div className="flex flex-wrap gap-2 mb-3">
          <CategoryBadge category={article.category} />
          {article.subcategory && (
            <span className="badge badge-slate text-xs">{article.subcategory}</span>
          )}
          <ImportanceBadge importance={article.importance} />
        </div>

        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl font-black font-display text-slate-100 leading-tight">
            {article.title}
          </h1>
          <button
            onClick={() => onToggleFavorite(article.id)}
            className={clsx(
              'btn-ghost p-2 rounded-lg flex-shrink-0 transition-colors',
              isFav ? 'text-gold-400' : 'text-slate-500 hover:text-gold-400',
            )}
            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
          {article.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.date}
            </span>
          )}
          {article.era && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.era}
            </span>
          )}
        </div>

        {/* Summary (lead) */}
        <p className="text-base text-slate-300 leading-relaxed italic border-l-2 pl-4"
          style={{ borderColor: color }}>
          {article.summary}
        </p>
      </div>

      {/* Contenu : sections */}
      {article.content?.length > 0 && (
        <div className="card p-6 space-y-6">
          {article.content.map((block, i) => (
            <div key={i}>
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-2"
                style={{ color }}
              >
                {block.section}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{block.text}</p>
              {i < article.content.length - 1 && (
                <div className="mt-6 border-t border-space-400/15" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Tag className="w-3.5 h-3.5 text-slate-600" />
          {article.tags.map(tag => (
            <span key={tag} className="badge badge-slate text-xs">#{tag}</span>
          ))}
        </div>
      )}

      {/* Articles liés */}
      {relatedArticles.length > 0 && (
        <div>
          <h2 className="section-title mb-3 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-cyan-400" />
            Articles liés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedArticles.map(rel => (
              <RelatedCard key={rel.id} article={rel} onClick={onSelectArticle} />
            ))}
          </div>
        </div>
      )}

      {/* Navigation prev/next */}
      <div className="flex items-center justify-between pt-2">
        {prevArticle ? (
          <button
            onClick={() => onSelectArticle(prevArticle)}
            className="btn-ghost gap-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline truncate max-w-[180px]">{prevArticle.title}</span>
            <span className="sm:hidden">Précédent</span>
          </button>
        ) : <div />}
        {nextArticle ? (
          <button
            onClick={() => onSelectArticle(nextArticle)}
            className="btn-ghost gap-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            <span className="hidden sm:inline truncate max-w-[180px]">{nextArticle.title}</span>
            <span className="sm:hidden">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

// ─── Empty State (accueil) ────────────────────────────────────────────────────

function HomeView({ onSelectCategory, onSelectArticle }) {
  const categoryCounts = useMemo(() => {
    const map = {};
    LORE_ARTICLES.forEach(a => { map[a.category] = (map[a.category] ?? 0) + 1; });
    return map;
  }, []);

  const featuredArticles = useMemo(
    () => FEATURED_ARTICLES.map(id => LORE_ARTICLES.find(a => a.id === id)).filter(Boolean),
    [],
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(139,92,246,0.05))' }}>
        <BookOpen className="w-14 h-14 text-cyan-400 mx-auto mb-4" />
        <h2 className="text-3xl font-black font-display text-slate-100 mb-2">Galactapédie</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          L'encyclopédie du lore de Star Citizen. Explorez les races, les personnages légendaires, les événements historiques, les factions et les lieux qui façonnent l'univers.
        </p>
        <p className="text-xs text-slate-600 mt-3">{LORE_ARTICLES.length} articles • Lore officiel SC</p>
      </div>

      {/* Catégories */}
      <div>
        <h2 className="section-title mb-4">Explorer par catégorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LORE_CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              count={categoryCounts[cat.id] ?? 0}
              onClick={onSelectCategory}
            />
          ))}
        </div>
      </div>

      {/* Articles en vedette */}
      <div>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-gold-400" fill="currentColor" />
          Articles en vedette
        </h2>
        <div className="space-y-2">
          {featuredArticles.map(article => (
            <FeaturedCard key={article.id} article={article} onClick={onSelectArticle} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Galactapedia() {
  const [query, setQuery]             = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // null = tous
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab]     = useState('articles'); // 'articles' | 'timeline'
  const [favorites, setFavorites]     = useState(loadFavorites);

  // Persist favorites
  useEffect(() => { saveFavorites(favorites); }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );
  }, []);

  // Filtrage + recherche
  const filteredArticles = useMemo(() => {
    let base = activeCategory
      ? LORE_ARTICLES.filter(a => a.category === activeCategory)
      : LORE_ARTICLES;

    if (query.trim().length < 2) return base;

    const fuseInstance = new Fuse(base, {
      keys: ['title', 'summary', 'tags', 'subcategory'],
      threshold: 0.35,
    });
    return fuseInstance.search(query.trim()).map(r => r.item);
  }, [query, activeCategory]);

  // Compteurs par catégorie
  const categoryCounts = useMemo(() => {
    const map = {};
    LORE_ARTICLES.forEach(a => { map[a.category] = (map[a.category] ?? 0) + 1; });
    return map;
  }, []);

  const handleSelectArticle = useCallback((article) => {
    setSelectedArticle(article);
    setActiveTab('articles');
  }, []);

  const handleSelectCategory = useCallback((catId) => {
    setActiveCategory(catId);
    setSelectedArticle(null);
    setActiveTab('articles');
  }, []);

  const handleClearCategory = useCallback(() => {
    setActiveCategory(null);
    setSelectedArticle(null);
  }, []);

  // Articles visibles dans la sidebar (tous ou filtrés par catégorie + importance pour trier)
  const sidebarArticles = useMemo(() => {
    const order = { majeur: 0, notable: 1, mineur: 2 };
    return [...filteredArticles].sort((a, b) =>
      (order[a.importance] ?? 2) - (order[b.importance] ?? 2),
    );
  }, [filteredArticles]);

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] min-h-0">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-space-400/20 pr-0 overflow-hidden">
        <div className="p-4 border-b border-space-400/20 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Galactapédie
          </h2>

          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input w-full pl-8 pr-8 py-2 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Onglets */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('articles')}
              className={clsx(
                'flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors',
                activeTab === 'articles'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              Articles
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={clsx(
                'flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors',
                activeTab === 'timeline'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Navigation catégories */}
        <div className="px-3 py-3 border-b border-space-400/20 space-y-0.5">
          <button
            onClick={handleClearCategory}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors',
              !activeCategory
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/40',
            )}
          >
            <span>Tous les articles</span>
            <span className="text-slate-600 text-xs">{LORE_ARTICLES.length}</span>
          </button>
          {LORE_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat.id] ?? BookOpen;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/40',
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? undefined : cat.color }} />
                <span className="flex-1">{cat.label}</span>
                <span className="text-slate-600 text-xs">{categoryCounts[cat.id] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* Liste articles sidebar */}
        {activeTab === 'articles' && (
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sidebarArticles.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">Aucun résultat</p>
            ) : (
              sidebarArticles.map(article => (
                <ArticleListItem
                  key={article.id}
                  article={article}
                  isSelected={selectedArticle?.id === article.id}
                  onClick={handleSelectArticle}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs text-slate-600 text-center py-4">
              Voir la timeline dans la zone principale →
            </p>
          </div>
        )}
      </aside>

      {/* ── Zone principale ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pl-6">
        {/* Header page */}
        <div className="sticky top-0 z-10 bg-space-900/90 backdrop-blur-sm pb-3 pt-1 mb-4 border-b border-space-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h1 className="page-title text-lg">
                {activeTab === 'timeline'
                  ? 'Timeline Historique'
                  : selectedArticle
                    ? selectedArticle.title
                    : activeCategory
                      ? LORE_CATEGORIES.find(c => c.id === activeCategory)?.label
                      : 'Galactapédie'}
              </h1>
            </div>

            {/* Bouton accueil si article sélectionné */}
            {(selectedArticle || activeCategory) && activeTab === 'articles' && (
              <button
                onClick={() => { setSelectedArticle(null); setActiveCategory(null); }}
                className="btn-ghost text-xs gap-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
                Accueil
              </button>
            )}
          </div>

          {/* Fil d'Ariane */}
          {(activeCategory || selectedArticle) && activeTab === 'articles' && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
              <button onClick={() => { setSelectedArticle(null); setActiveCategory(null); }} className="hover:text-slate-400">
                Galactapédie
              </button>
              {activeCategory && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <button onClick={() => setSelectedArticle(null)} className="hover:text-slate-400">
                    {LORE_CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </button>
                </>
              )}
              {selectedArticle && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-400">{selectedArticle.title}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Contenu principal */}
        {activeTab === 'timeline' ? (
          <TimelineView
            onSelectArticle={(art) => { handleSelectArticle(art); }}
            filterCat={activeCategory}
          />
        ) : selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            allArticles={sidebarArticles.length > 0 ? sidebarArticles : LORE_ARTICLES}
            onSelectArticle={handleSelectArticle}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ) : activeCategory ? (
          /* Grille d'articles de la catégorie */
          <div className="space-y-6">
            {/* En-tête catégorie */}
            {(() => {
              const cat = LORE_CATEGORIES.find(c => c.id === activeCategory);
              const Icon = CATEGORY_ICONS[activeCategory] ?? BookOpen;
              if (!cat) return null;
              return (
                <div className="card p-6 flex items-center gap-4" style={{ borderColor: `${cat.color}25` }}>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-100">{cat.label}</h2>
                    <p className="text-sm text-slate-500">{cat.description}</p>
                    <p className="text-xs mt-1" style={{ color: cat.color }}>
                      {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Liste articles catégorie */}
            <div className="space-y-2">
              {filteredArticles.map(article => {
                const color = getCategoryColor(article.category);
                return (
                  <button
                    key={article.id}
                    onClick={() => handleSelectArticle(article)}
                    className="card w-full text-left p-4 group hover:border-cyan-500/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                            {article.title}
                          </h3>
                          <ImportanceBadge importance={article.importance} />
                          {article.subcategory && (
                            <span className="badge badge-slate text-xs">{article.subcategory}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{article.summary}</p>
                        {article.date && (
                          <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {article.date}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-500 flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <HomeView onSelectCategory={handleSelectCategory} onSelectArticle={handleSelectArticle} />
        )}
      </main>
    </div>
  );
}
