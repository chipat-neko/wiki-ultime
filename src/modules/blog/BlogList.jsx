/**
 * BlogList.jsx — Blog communautaire
 * Liste paginée des articles avec catégories, recherche, tri et formulaire inline
 * Route : /blog
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  BookOpen, PenTool, Search, X, Heart, Clock, TrendingUp,
  ChevronLeft, ChevronRight, MessageSquare, Tag, User, Loader,
  Send, Trash2, Filter,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getBlogPosts, createBlogPost, deleteBlogPost, toggleBlogLike, getUserBlogLikes } from '../../lib/supabase.js';

const CATEGORIES = [
  { id: 'guide',      label: 'Guide',      color: 'badge-cyan' },
  { id: 'astuce',     label: 'Astuce',     color: 'badge-green' },
  { id: 'histoire',   label: 'Histoire',   color: 'badge-purple' },
  { id: 'actualité',  label: 'Actualité',  color: 'badge-gold' },
  { id: 'discussion', label: 'Discussion', color: 'badge-blue' },
  { id: 'autre',      label: 'Autre',      color: 'badge-slate' },
];

const SORT_OPTIONS = [
  { id: 'recent',  label: 'Récent',    icon: Clock },
  { id: 'popular', label: 'Populaire', icon: TrendingUp },
];

const PAGE_SIZE = 15;

export default function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(new Set());
  const [user, setUser] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState('discussion');
  const [submitting, setSubmitting] = useState(false);

  // Debounce search
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

  // Load likes
  useEffect(() => {
    if (user) getUserBlogLikes(user.id).then(setLikedIds);
  }, [user]);

  // Load posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { posts: data, count } = await getBlogPosts({ category, page, sortBy, search: searchDebounced });
      setPosts(data);
      setTotalCount(count);
    } catch (e) {
      console.error('Blog load error:', e);
    } finally {
      setLoading(false);
    }
  }, [category, page, sortBy, searchDebounced]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [category, sortBy, searchDebounced]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const result = await toggleBlogLike(postId);
      if (result) {
        setLikedIds(prev => {
          const next = new Set(prev);
          result.liked ? next.add(postId) : next.delete(postId);
          return next;
        });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (result.liked ? 1 : -1) } : p));
      }
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formTitle.trim() || !formBody.trim()) return;
    setSubmitting(true);
    try {
      await createBlogPost(user.id, { title: formTitle.trim(), body: formBody.trim(), category: formCategory });
      setFormTitle('');
      setFormBody('');
      setFormCategory('discussion');
      setShowForm(false);
      setPage(1);
      setSortBy('recent');
      setCategory(null);
      await loadPosts();
    } catch (e) {
      console.error('Create blog post error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await deleteBlogPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setTotalCount(prev => prev - 1);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const getCategoryMeta = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[5];

  if (!isSupabaseConfigured) {
    return (
      <div className="p-6 text-center text-slate-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Le blog nécessite une connexion Supabase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-cyan-400" />
            Blog Communautaire
          </h1>
          <p className="text-sm text-slate-500 mt-1">Partagez vos guides, astuces et histoires avec la communauté</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
            <PenTool className="w-4 h-4" />
            {showForm ? 'Annuler' : 'Écrire un article'}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 border-cyan-500/20">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-cyan-400" />
            Nouvel article
          </h2>
          <input
            type="text"
            placeholder="Titre de l'article…"
            className="input text-sm"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            maxLength={200}
            required
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormCategory(cat.id)}
                className={clsx('badge cursor-pointer transition-all', formCategory === cat.id ? cat.color : 'badge-slate hover:border-slate-500')}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Contenu de l'article (Markdown supporté)…"
            className="input text-sm min-h-[200px] resize-y"
            value={formBody}
            onChange={e => setFormBody(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !formTitle.trim() || !formBody.trim()}>
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publier
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un article…"
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
          {/* Sort */}
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
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory(null)}
            className={clsx('badge cursor-pointer transition-all', !category ? 'badge-cyan' : 'badge-slate hover:border-slate-500')}
          >
            <Filter className="w-3 h-3" />
            Toutes
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={clsx('badge cursor-pointer transition-all', category === cat.id ? cat.color : 'badge-slate hover:border-slate-500')}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="card p-12 text-center">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Aucun article trouvé.</p>
          {user && <p className="text-xs mt-1">Soyez le premier à publier !</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const catMeta = getCategoryMeta(post.category);
            const isOwner = user?.id === post.user_id;
            const liked = likedIds.has(post.id);
            return (
              <div key={post.id} className="card p-4 hover:border-cyan-500/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={clsx('badge text-[10px]', catMeta.color)}>{catMeta.label}</span>
                      <span className="text-[10px] text-slate-600">{formatDate(post.created_at)}</span>
                    </div>
                    <h3
                      className="text-sm font-semibold text-slate-200 hover:text-cyan-400 cursor-pointer transition-colors truncate"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {post.body.length > 200 ? post.body.slice(0, 200) + '…' : post.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.profiles?.username || 'Anonyme'}
                      </span>
                      <button
                        onClick={() => handleLike(post.id)}
                        className={clsx('text-[10px] flex items-center gap-1 transition-colors',
                          liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400')}
                        disabled={!user}
                      >
                        <Heart className={clsx('w-3 h-3', liked && 'fill-current')} />
                        {post.likes_count}
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-[10px] text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
