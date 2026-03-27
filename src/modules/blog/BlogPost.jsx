/**
 * BlogPost.jsx — Vue détail d'un article de blog
 * Route : /blog/:id
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowLeft, Heart, Clock, User, Tag, Loader, BookOpen, Trash2,
} from 'lucide-react';
import { supabase, getBlogPost, toggleBlogLike, getUserBlogLikes, deleteBlogPost } from '../../lib/supabase.js';

const CATEGORY_COLORS = {
  guide: 'badge-cyan',
  astuce: 'badge-green',
  histoire: 'badge-purple',
  'actualité': 'badge-gold',
  discussion: 'badge-blue',
  autre: 'badge-slate',
};

const CATEGORY_LABELS = {
  guide: 'Guide',
  astuce: 'Astuce',
  histoire: 'Histoire',
  'actualité': 'Actualité',
  discussion: 'Discussion',
  autre: 'Autre',
};

export default function BlogPostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBlogPost(id);
        setPost(data);
        if (user) {
          const likes = await getUserBlogLikes(user.id);
          setLiked(likes.has(id));
        }
      } catch (e) {
        console.error('Load blog post error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    try {
      const result = await toggleBlogLike(post.id);
      if (result) {
        setLiked(result.liked);
        setPost(prev => ({ ...prev, likes_count: prev.likes_count + (result.liked ? 1 : -1) }));
      }
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await deleteBlogPost(post.id);
      navigate('/blog');
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 text-center text-slate-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Article introuvable.</p>
        <button onClick={() => navigate('/blog')} className="btn btn-secondary btn-sm mt-4">
          <ArrowLeft className="w-4 h-4" />
          Retour au blog
        </button>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/blog')} className="btn btn-secondary btn-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour au blog
      </button>

      {/* Article */}
      <article className="card p-6 space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx('badge', CATEGORY_COLORS[post.category] || 'badge-slate')}>
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(post.created_at)}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <User className="w-3 h-3" />
            {post.profiles?.username || 'Anonyme'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-slate-100">{post.title}</h1>

        {/* Body */}
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
          <button
            onClick={handleLike}
            className={clsx('btn btn-sm', liked ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'btn-secondary')}
            disabled={!user}
          >
            <Heart className={clsx('w-4 h-4', liked && 'fill-current')} />
            {post.likes_count} J'aime
          </button>
          {isOwner && (
            <button onClick={handleDelete} className="btn btn-sm btn-secondary text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
