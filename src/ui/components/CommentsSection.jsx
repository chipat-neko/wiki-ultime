import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Trash2, ChevronDown, User } from 'lucide-react';
import clsx from 'clsx';
import { getComments, createComment, deleteComment, COMMENTS_PAGE_SIZE, supabase } from '../../lib/supabase.js';

export default function CommentsSection({ targetType, targetId }) {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user ?? null));
  }, []);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const { data, total: t } = await getComments(targetType, targetId, p);
      setComments(prev => p === 0 ? data : [...prev, ...data]);
      setTotal(t);
      setPage(p);
    } catch { /* ignore */ }
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => { load(0); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const newComment = await createComment(targetType, targetId, body.trim());
      setComments(prev => [...prev, newComment]);
      setTotal(t => t + 1);
      setBody('');
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      setTotal(t => t - 1);
    } catch { /* ignore */ }
  };

  const hasMore = comments.length < total;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border border-space-400/20 rounded-lg bg-space-800/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-space-800/60 border-b border-space-400/20">
        <MessageSquare size={16} className="text-cyan-400" />
        <span className="text-slate-100 font-semibold text-sm">Commentaires</span>
        <span className="text-xs text-slate-500">({total})</span>
      </div>

      {/* Comments list */}
      <div className="divide-y divide-space-400/10 max-h-96 overflow-y-auto scroll-container">
        {comments.length === 0 && !loading && (
          <p className="text-slate-500 text-sm text-center py-6">Aucun commentaire pour le moment. Soyez le premier !</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="px-4 py-3 hover:bg-space-700/20 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <User size={12} className="text-cyan-400" />
                </div>
                <span className="text-sm font-medium text-cyan-300">{c.profiles?.username ?? 'Anonyme'}</span>
                <span className="text-xs text-slate-600">{formatDate(c.created_at)}</span>
              </div>
              {currentUser?.id === c.user_id && (
                <button onClick={() => handleDelete(c.id)} className="text-slate-600 hover:text-red-400 transition-colors" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-8 whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
        {loading && <p className="text-slate-500 text-xs text-center py-3">Chargement...</p>}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={() => load(page + 1)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-cyan-400 hover:bg-space-700/30 transition-colors border-t border-space-400/10"
        >
          <ChevronDown size={14} />
          Voir plus de commentaires
        </button>
      )}

      {/* Input form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-space-400/20 bg-space-900/40">
          <input
            type="text"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Écrire un commentaire..."
            maxLength={500}
            className="flex-1 bg-space-800/60 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              body.trim() && !sending ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'text-slate-600 cursor-not-allowed'
            )}
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="px-4 py-3 border-t border-space-400/20 bg-space-900/40">
          <p className="text-slate-500 text-sm text-center">Connectez-vous pour commenter</p>
        </div>
      )}
    </div>
  );
}
