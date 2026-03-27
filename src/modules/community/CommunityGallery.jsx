import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../core/AuthContext.jsx';
import { useAppActions } from '../../core/StateManager.jsx';
import {
  getCommunityPosts, getUserLikes, togglePostLike,
  createCommunityPost, deleteCommunityPost, uploadCommunityImage,
  isSupabaseConfigured,
} from '../../lib/supabase.js';
import {
  Image, Camera, Rocket, Swords, Compass, ShoppingCart, Star,
  Heart, MessageCircle, Plus, X, Send, Loader2, Filter,
  TrendingUp, Clock, ChevronLeft, ChevronRight, Trash2,
  Upload, AlertCircle, Users, Maximize2, Calendar,
} from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/fr.js';
dayjs.extend(relativeTime);
dayjs.locale('fr');

// ── Catégories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'screenshot',   label: 'Screenshot',   icon: Camera,       color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
  { id: 'aventure',     label: 'Aventure',     icon: Compass,      color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { id: 'flotte',       label: 'Flotte',       icon: Rocket,       color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  { id: 'combat',       label: 'Combat',       icon: Swords,       color: 'text-red-400',     bg: 'bg-red-500/15' },
  { id: 'exploration',  label: 'Exploration',  icon: Star,         color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  { id: 'commerce',     label: 'Commerce',     icon: ShoppingCart,  color: 'text-green-400',   bg: 'bg-green-500/15' },
  { id: 'autre',        label: 'Autre',        icon: MessageCircle, color: 'text-purple-400',  bg: 'bg-purple-500/15' },
];

const CATEGORIES_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// ── Page principale ──────────────────────────────────────────────────────────
export default function CommunityGallery() {
  const { user, isActive } = useAuth();
  const { notify } = useAppActions();
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLikes, setUserLikes] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const totalPages = Math.ceil(totalCount / 20);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { posts: data, count } = await getCommunityPosts({ category: filter, page, sortBy });
      setPosts(data);
      setTotalCount(count);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, page, sortBy]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    if (user?.id) getUserLikes(user.id).then(setUserLikes);
  }, [user?.id]);

  const handleLike = useCallback(async (postId) => {
    if (!user) { notify('Connectez-vous pour liker', 'warning'); return; }
    try {
      const result = await togglePostLike(postId);
      if (!result) return;
      setUserLikes(prev => {
        const next = new Set(prev);
        result.liked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes_count: result.count } : p
      ));
    } catch {
      notify('Erreur lors du like', 'error');
    }
  }, [user, notify]);

  const handleDelete = useCallback(async (postId) => {
    if (!confirm('Supprimer ce post ?')) return;
    try {
      await deleteCommunityPost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setTotalCount(c => c - 1);
      notify('Post supprimé', 'success');
    } catch {
      notify('Erreur lors de la suppression', 'error');
    }
  }, [notify]);

  const handlePostCreated = useCallback(() => {
    setShowForm(false);
    setPage(1);
    setFilter(null);
    setSortBy('recent');
    loadPosts();
  }, [loadPosts]);

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-space-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg">La galerie communautaire nécessite une connexion au serveur.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-space-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            Galerie Communautaire
          </h1>
          <p className="text-sm text-space-400 mt-1">
            Partagez vos aventures, screenshots et moments épiques dans le 'verse
          </p>
        </div>
        {isActive && (
          <button
            onClick={() => setShowForm(s => !s)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
              showForm
                ? 'bg-space-700 text-space-300'
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 ring-1 ring-cyan-500/30'
            )}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Annuler' : 'Nouveau post'}
          </button>
        )}
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <CreatePostForm
          userId={user.id}
          onCreated={handlePostCreated}
          onCancel={() => setShowForm(false)}
          notify={notify}
        />
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-space-500" />
          <button
            onClick={() => { setFilter(null); setPage(1); }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              !filter ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30' : 'bg-space-800 text-space-400 hover:text-space-200'
            )}
          >
            Tout
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setFilter(cat.id); setPage(1); }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                filter === cat.id
                  ? `${cat.bg} ${cat.color} ring-1 ring-current/30`
                  : 'bg-space-800 text-space-400 hover:text-space-200'
              )}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => { setSortBy('recent'); setPage(1); }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all',
              sortBy === 'recent' ? 'bg-space-600 text-space-100' : 'text-space-400 hover:text-space-200'
            )}
          >
            <Clock className="w-3 h-3" /> Récent
          </button>
          <button
            onClick={() => { setSortBy('popular'); setPage(1); }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all',
              sortBy === 'popular' ? 'bg-space-600 text-space-100' : 'text-space-400 hover:text-space-200'
            )}
          >
            <TrendingUp className="w-3 h-3" /> Populaire
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Grille de posts */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-space-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Chargement...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-space-500">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Aucun post pour le moment</p>
          <p className="text-sm mt-1">Soyez le premier à partager !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              liked={userLikes.has(post.id)}
              onLike={handleLike}
              onDelete={handleDelete}
              onOpen={setSelectedPost}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-space-800 text-space-400 hover:text-space-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-space-400">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-space-800 text-space-400 hover:text-space-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Info compte */}
      {!user && (
        <p className="text-center text-sm text-space-500 py-4">
          Connectez-vous pour publier et liker des posts.
        </p>
      )}

      {/* Modale détail */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          liked={userLikes.has(selectedPost.id)}
          onLike={handleLike}
          onDelete={(id) => { handleDelete(id); setSelectedPost(null); }}
          onClose={() => setSelectedPost(null)}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

// ── Carte de post ────────────────────────────────────────────────────────────
function PostCard({ post, liked, onLike, onDelete, onOpen, currentUserId }) {
  const cat = CATEGORIES_MAP[post.category] || CATEGORIES_MAP.autre;
  const CatIcon = cat.icon;
  const profile = post.profiles;
  const isOwner = currentUserId === post.user_id;

  return (
    <div
      className="card-dark rounded-xl overflow-hidden group transition-all hover:ring-1 hover:ring-white/10 cursor-pointer"
      onClick={() => onOpen(post)}
    >
      {/* Image */}
      {post.image_url && (
        <div className="relative aspect-video overflow-hidden bg-space-900">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className={clsx('absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm', cat.bg, cat.color)}>
            <CatIcon className="w-3 h-3" />
            {cat.label}
          </div>
          <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Catégorie sans image */}
        {!post.image_url && (
          <div className={clsx('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium', cat.bg, cat.color)}>
            <CatIcon className="w-3 h-3" />
            {cat.label}
          </div>
        )}

        {/* Titre */}
        <h3 className="font-semibold text-space-100 leading-snug">{post.title}</h3>

        {/* Description */}
        {post.description && (
          <p className="text-sm text-space-400 leading-relaxed line-clamp-3">{post.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-space-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-space-700 flex items-center justify-center text-xs font-bold text-space-300 flex-shrink-0">
              {profile?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs text-space-400 truncate">{profile?.username || 'Anonyme'}</span>
            <span className="text-xs text-space-600">·</span>
            <span className="text-xs text-space-500">{dayjs(post.created_at).fromNow()}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
              className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all',
                liked
                  ? 'text-red-400 bg-red-500/15'
                  : 'text-space-500 hover:text-red-400 hover:bg-red-500/10'
              )}
            >
              <Heart className={clsx('w-3.5 h-3.5', liked && 'fill-current')} />
              {post.likes_count > 0 && <span>{post.likes_count}</span>}
            </button>

            {/* Delete (owner only) */}
            {isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                className="p-1 rounded text-space-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modale détail ────────────────────────────────────────────────────────────
function PostModal({ post, liked, onLike, onDelete, onClose, currentUserId }) {
  const cat = CATEGORIES_MAP[post.category] || CATEGORIES_MAP.autre;
  const CatIcon = cat.icon;
  const profile = post.profiles;
  const isOwner = currentUserId === post.user_id;

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Contenu */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-space-900 rounded-2xl ring-1 ring-white/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image en grand */}
        {post.image_url && (
          <div className="relative bg-black flex items-center justify-center max-h-[60vh]">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full max-h-[60vh] object-contain"
            />
          </div>
        )}

        {/* Infos */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Catégorie + date */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', cat.bg, cat.color)}>
              <CatIcon className="w-3.5 h-3.5" />
              {cat.label}
            </div>
            <span className="text-xs text-space-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dayjs(post.created_at).format('DD MMM YYYY [à] HH:mm')}
            </span>
          </div>

          {/* Titre */}
          <h2 className="text-xl font-bold text-space-100">{post.title}</h2>

          {/* Description complète */}
          {post.description && (
            <p className="text-sm text-space-300 leading-relaxed whitespace-pre-line">{post.description}</p>
          )}

          {/* Footer : auteur + actions */}
          <div className="flex items-center justify-between pt-4 border-t border-space-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-space-700 flex items-center justify-center text-sm font-bold text-space-300">
                {profile?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-space-200">{profile?.username || 'Anonyme'}</p>
                <p className="text-xs text-space-500">{dayjs(post.created_at).fromNow()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onLike(post.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  liked
                    ? 'text-red-400 bg-red-500/15 ring-1 ring-red-500/30'
                    : 'text-space-400 bg-space-800 hover:text-red-400 hover:bg-red-500/10'
                )}
              >
                <Heart className={clsx('w-4 h-4', liked && 'fill-current')} />
                {post.likes_count > 0 ? post.likes_count : 'J\'aime'}
              </button>

              {isOwner && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-space-500 bg-space-800 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire de création ───────────────────────────────────────────────────
function CreatePostForm({ userId, onCreated, onCancel, notify }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('screenshot');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      notify('Le titre doit contenir au moins 3 caractères', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadCommunityImage(userId, file);
      }
      await createCommunityPost(userId, {
        category,
        title: title.trim(),
        description: description.trim(),
        imageUrl,
      });
      notify('Post publié !', 'success');
      onCreated();
    } catch (err) {
      notify(err.message || 'Erreur lors de la publication', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-dark rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-space-100 flex items-center gap-2">
        <Send className="w-5 h-5 text-cyan-400" />
        Nouveau post
      </h2>

      {/* Catégorie */}
      <div>
        <label className="text-xs text-space-400 font-medium uppercase tracking-wider mb-2 block">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                category === cat.id
                  ? `${cat.bg} ${cat.color} ring-1 ring-current/30`
                  : 'bg-space-800 text-space-400 hover:text-space-200'
              )}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Titre */}
      <div>
        <label className="text-xs text-space-400 font-medium uppercase tracking-wider mb-1.5 block">
          Titre <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Mon premier combat PvP à Pyro..."
          className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-space-100 text-sm placeholder-space-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        />
        <p className="text-xs text-space-600 mt-1 text-right">{title.length}/120</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-space-400 font-medium uppercase tracking-wider mb-1.5 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Racontez votre histoire, décrivez la scène..."
          className="w-full px-3 py-2 bg-space-800 border border-space-700 rounded-lg text-space-100 text-sm placeholder-space-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
        />
        <p className="text-xs text-space-600 mt-1 text-right">{description.length}/2000</p>
      </div>

      {/* Image */}
      <div>
        <label className="text-xs text-space-400 font-medium uppercase tracking-wider mb-1.5 block">Image</label>
        {preview ? (
          <div className="relative rounded-lg overflow-hidden">
            <img src={preview} alt="Aperçu" className="w-full max-h-64 object-cover rounded-lg" />
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-space-700 rounded-lg text-space-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm">Cliquez pour ajouter une image</span>
            <span className="text-xs text-space-600">JPG, PNG, GIF, WEBP — max 8 Mo</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-space-400 hover:text-space-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
            submitting || !title.trim()
              ? 'bg-space-700 text-space-500 cursor-not-allowed'
              : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 ring-1 ring-cyan-500/30'
          )}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  );
}
