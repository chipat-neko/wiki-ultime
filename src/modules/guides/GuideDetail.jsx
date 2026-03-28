import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GUIDES } from '../../datasets/guides.js';
import { useFavorites } from '../../core/StateManager.jsx';
import CommentsSection from '../../ui/components/CommentsSection.jsx';
import clsx from 'clsx';
import {
  ArrowLeft, BookOpen, Clock, Star, ChevronRight,
  CheckCircle2, Lightbulb, TrendingUp,
} from 'lucide-react';

const DIFFICULTY_STYLES = {
  Facile: 'badge-green',
  Moyen: 'badge-yellow',
  Difficile: 'badge-red',
  'Très Difficile': 'badge-red',
  Expert: 'badge-red',
};

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const guide = useMemo(() => GUIDES.find(g => g.id === id), [id]);
  const isFavorite = (favorites.guides || []).some(f => f.id === id);

  const relatedGuides = useMemo(() => {
    if (!guide) return [];
    return GUIDES.filter(g => g.id !== guide.id && g.category === guide.category).slice(0, 3);
  }, [guide]);

  if (!guide) {
    return (
      <div className="card p-12 text-center">
        <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-400 mb-2">Guide introuvable</h2>
        <p className="text-slate-500 mb-4">Le guide "{id}" n'existe pas dans notre base de données.</p>
        <button onClick={() => navigate('/guides')} className="btn-primary gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour aux Guides
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/guides')}
        className="btn-ghost gap-2 text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux Guides
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-slate">{guide.category}</span>
              {guide.difficulty && (
                <span className={`badge ${DIFFICULTY_STYLES[guide.difficulty] || 'badge-slate'}`}>
                  {guide.difficulty}
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-black font-display text-slate-100">{guide.title}</h1>
              <button
                onClick={() => isFavorite
                  ? removeFavorite('guides', { id: guide.id })
                  : addFavorite('guides', { id: guide.id, title: guide.title, category: guide.category })
                }
                className={clsx('btn-ghost p-2 rounded-lg flex-shrink-0 transition-colors', isFavorite ? 'text-gold-400' : 'text-slate-500 hover:text-gold-400')}
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">{guide.description}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-space-400/20 text-xs text-slate-500">
              {guide.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {guide.readTime} min de lecture
                </span>
              )}
              {guide.helpful !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-gold-400" />
                  {guide.helpful.toLocaleString('fr-FR')} votes utiles
                </span>
              )}
              {guide.author && (
                <span>Par <span className="text-slate-300">{guide.author}</span></span>
              )}
            </div>
          </div>

          {/* Content sections — format: [{section, text}] */}
          {Array.isArray(guide.content) && guide.content.length > 0 && (
            <div className="space-y-4">
              {guide.content.map((block, i) => (
                <div key={i} className="card p-5">
                  {block.section && (
                    <h2 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      {block.section}
                    </h2>
                  )}
                  <p className="text-sm text-slate-300 leading-relaxed">{block.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {guide.tags?.length > 0 && (
            <div className="card p-4 flex flex-wrap gap-2">
              {guide.tags.map(tag => (
                <span key={tag} className="badge badge-slate text-xs">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick info */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Résumé</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-space-400/10">
                <span className="text-slate-500">Catégorie</span>
                <span className="text-slate-300">{guide.category}</span>
              </div>
              {guide.difficulty && (
                <div className="flex justify-between py-2 border-b border-space-400/10">
                  <span className="text-slate-500">Difficulté</span>
                  <span className={`badge ${DIFFICULTY_STYLES[guide.difficulty] || 'badge-slate'}`}>
                    {guide.difficulty}
                  </span>
                </div>
              )}
              {guide.readTime && (
                <div className="flex justify-between py-2 border-b border-space-400/10">
                  <span className="text-slate-500">Lecture</span>
                  <span className="text-slate-300">{guide.readTime} min</span>
                </div>
              )}
              {(guide.lastUpdated || guide.updatedAt) && (
                <div className="flex justify-between py-2 border-b border-space-400/10">
                  <span className="text-slate-500">Mis à jour</span>
                  <span className="text-slate-300">{guide.lastUpdated || guide.updatedAt}</span>
                </div>
              )}
              {guide.version && (
                <div className="flex justify-between py-2 border-b border-space-400/10">
                  <span className="text-slate-500">Version SC</span>
                  <span className="text-slate-300">{guide.version}</span>
                </div>
              )}
              {guide.helpful !== undefined && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Votes utiles</span>
                  <span className="text-gold-400 font-semibold">{guide.helpful.toLocaleString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tip block */}
          <div className="card p-4 border-cyan-500/15 bg-cyan-500/5">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-cyan-400 mb-1">Conseil</p>
                <p className="text-xs text-slate-400">
                  Utilisez les outils de calcul intégrés (Commerce, Minage, Missions) pour appliquer
                  les stratégies de ce guide directement à votre situation.
                </p>
              </div>
            </div>
          </div>

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-space-400/20">
                <h2 className="section-title">Guides Similaires</h2>
              </div>
              <div className="divide-y divide-space-400/10">
                {relatedGuides.map(g => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/guides/${g.id}`)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-space-700/40 transition-colors text-left"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{g.title}</p>
                      {g.readTime && (
                        <p className="text-xs text-slate-500">{g.readTime} min</p>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Commentaires */}
      <CommentsSection targetType="guide" targetId={guide.id} />
    </div>
  );
}
