/**
 * SharedBuildsGallery.jsx — Galerie des builds communautaires
 * Affiche les builds ship + FPS partagés par la communauté
 * Route : /builds
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  Wrench, Search, X, Heart, Clock, TrendingUp, Filter,
  ChevronLeft, ChevronRight, Rocket, Crosshair, User,
  Loader, Layers, Shield,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getSharedBuilds, toggleBuildLike, getUserBuildLikes, deleteSharedBuild } from '../../lib/supabase.js';
import { BUDGET_TIERS, getBudgetTier, formatBudgetPrice } from '../../datasets/loadoutData.js';
import { FPS_BUDGET_TIERS, getFPSBudgetTier } from '../../datasets/fpsLoadoutData.js';
import { SHIPS } from '../../datasets/ships.js';

const PAGE_SIZE = 20;

const TYPE_TABS = [
  { id: null,   label: 'Tous',     icon: Layers },
  { id: 'ship', label: 'Vaisseau', icon: Rocket },
  { id: 'fps',  label: 'FPS',      icon: Crosshair },
];

const SORT_OPTIONS = [
  { id: 'recent',  label: 'Récent',    icon: Clock },
  { id: 'popular', label: 'Populaire', icon: TrendingUp },
];

export default function SharedBuildsGallery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [builds, setBuilds] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [buildType, setBuildType] = useState(searchParams.get('type') || null);
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(new Set());
  const [user, setUser] = useState(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Auth
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Likes
  useEffect(() => {
    if (user) getUserBuildLikes(user.id).then(setLikedIds);
  }, [user]);

  // Load builds
  const loadBuilds = useCallback(async () => {
    setLoading(true);
    try {
      const { builds: data, count } = await getSharedBuilds({ buildType, page, sortBy, search: searchDebounced });
      setBuilds(data);
      setTotalCount(count);
    } catch (e) {
      console.error('Load builds error:', e);
    } finally {
      setLoading(false);
    }
  }, [buildType, page, sortBy, searchDebounced]);

  useEffect(() => { loadBuilds(); }, [loadBuilds]);
  useEffect(() => { setPage(1); }, [buildType, sortBy, searchDebounced]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleLike = async (buildId) => {
    if (!user) return;
    try {
      const result = await toggleBuildLike(buildId);
      if (result) {
        setLikedIds(prev => {
          const next = new Set(prev);
          result.liked ? next.add(buildId) : next.delete(buildId);
          return next;
        });
        setBuilds(prev => prev.map(b => b.id === buildId ? { ...b, likes_count: b.likes_count + (result.liked ? 1 : -1) } : b));
      }
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleDelete = async (buildId) => {
    if (!confirm('Supprimer ce build ?')) return;
    try {
      await deleteSharedBuild(buildId);
      setBuilds(prev => prev.filter(b => b.id !== buildId));
      setTotalCount(prev => prev - 1);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleLoadBuild = (build) => {
    const encoded = btoa(JSON.stringify(build.build_data));
    if (build.build_type === 'ship') {
      navigate(`/loadout?shared=${encoded}&ship=${build.ship_id || ''}`);
    } else {
      navigate(`/fps-loadout?shared=${encoded}`);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const getShipName = (shipId) => {
    if (!shipId) return null;
    const ship = SHIPS.find(s => s.id === shipId);
    return ship ? ship.name : shipId;
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="p-6 text-center text-slate-500">
        <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Les builds communautaires nécessitent une connexion Supabase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Wrench className="w-7 h-7 text-cyan-400" />
          Builds Communautaires
        </h1>
        <p className="text-sm text-slate-500 mt-1">Découvrez et partagez les meilleurs loadouts de la communauté</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un build…"
              className="input pl-9 pr-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={clsx('btn btn-sm', sortBy === opt.id ? 'btn-primary' : 'btn-secondary')}
              >
                <opt.icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.id || 'all'}
              onClick={() => setBuildType(tab.id)}
              className={clsx('badge cursor-pointer transition-all flex items-center gap-1',
                buildType === tab.id ? 'badge-cyan' : 'badge-slate hover:border-slate-500')}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Builds grid */}
      {loading ? (
        <div className="card p-12 text-center">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        </div>
      ) : builds.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucun build trouvé.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {builds.map(build => {
            const liked = likedIds.has(build.id);
            const isOwner = user?.id === build.user_id;
            const tier = build.build_type === 'ship'
              ? getBudgetTier(build.total_price)
              : getFPSBudgetTier(build.total_price);
            const shipName = getShipName(build.ship_id);

            return (
              <div key={build.id} className="card p-4 flex flex-col gap-3 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center gap-2">
                  {build.build_type === 'ship'
                    ? <Rocket className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    : <Crosshair className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-200 truncate">{build.title}</h3>
                    {shipName && <div className="text-[10px] text-slate-500">{shipName}</div>}
                  </div>
                  <span className={clsx('badge text-[10px]', build.build_type === 'ship' ? 'badge-cyan' : 'badge-gold')}>
                    {build.build_type === 'ship' ? 'Vaisseau' : 'FPS'}
                  </span>
                </div>

                {build.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{build.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className={clsx('badge', tier.badge)}>
                    {formatBudgetPrice(build.total_price)} aUEC
                  </span>
                  <span className={clsx('badge', tier.badge)}>{tier.label}</span>
                  <span className="text-slate-600 ml-auto">{formatDate(build.created_at)}</span>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-700/30">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {build.profiles?.username || 'Anonyme'}
                  </span>
                  <button
                    onClick={() => handleLike(build.id)}
                    className={clsx('text-[10px] flex items-center gap-1 ml-auto transition-colors',
                      liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400')}
                    disabled={!user}
                  >
                    <Heart className={clsx('w-3 h-3', liked && 'fill-current')} />
                    {build.likes_count}
                  </button>
                  {isOwner && (
                    <button onClick={() => handleDelete(build.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button onClick={() => handleLoadBuild(build)} className="btn btn-secondary btn-sm w-full">
                  <Shield className="w-3.5 h-3.5" />
                  Charger ce build
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary btn-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
