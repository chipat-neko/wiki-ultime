/**
 * ShareBuildModal.jsx — Modal de partage de build
 * Utilisé par LoadoutBuilder et FPSLoadoutBuilder
 */
import React, { useState } from 'react';
import clsx from 'clsx';
import { X, Send, Loader, Share2 } from 'lucide-react';
import { createSharedBuild } from '../../lib/supabase.js';

export default function ShareBuildModal({ isOpen, onClose, buildType, shipId, buildData, totalPrice, userId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createSharedBuild(userId, {
        buildType,
        shipId: shipId || null,
        buildData,
        title: title.trim(),
        description: description.trim(),
        totalPrice: totalPrice || 0,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors du partage.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-space-800 border border-space-600 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-space-600">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            Partager ce build
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Titre du build *</label>
            <input
              type="text"
              className="input text-sm"
              placeholder="Ex: Build PvP agressif Gladius"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description (optionnel)</label>
            <textarea
              className="input text-sm min-h-[80px] resize-y"
              placeholder="Décrivez le playstyle, les forces/faiblesses…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
            <div className="text-[10px] text-slate-600 text-right mt-0.5">{description.length}/500</div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {success ? (
            <div className="text-center py-3 text-green-400 text-sm font-semibold">
              Build partagé avec succès !
            </div>
          ) : (
            <button type="submit" className="btn btn-primary w-full" disabled={submitting || !title.trim()}>
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Partager avec la communauté
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
