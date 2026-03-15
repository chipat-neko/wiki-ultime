import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FACTIONS } from '../../datasets/factions.js';
import { useFavorites } from '../../core/StateManager.jsx';
import clsx from 'clsx';
import {
  Shield, Users, AlertTriangle, Globe, ArrowLeft,
  MapPin, Target, Star, ChevronRight, Crosshair,
  Building, Sword, Lock, Anchor,
} from 'lucide-react';

const ALIGNMENT_STYLES = {
  Légal: { badge: 'badge-green', text: 'text-success-400', bg: 'bg-success-500/10 border-success-500/20' },
  Neutre: { badge: 'badge-yellow', text: 'text-warning-400', bg: 'bg-warning-500/10 border-warning-500/20' },
  'Hors-la-loi': { badge: 'badge-red', text: 'text-danger-400', bg: 'bg-danger-500/10 border-danger-500/20' },
};

const TYPE_ICONS = {
  Gouvernement: Shield,
  Corporation: Building,
  Criminel: AlertTriangle,
  Terroriste: AlertTriangle,
  Alien: Globe,
  'Application de la Loi': Shield,
  Militaire: Anchor,
  Guilde: Crosshair,
  Sécurité: Shield,
  Organisation: Users,
};

function FactionAvatar({ faction, Icon }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center border flex-shrink-0 overflow-hidden"
      style={{ backgroundColor: `${faction.color}15`, borderColor: `${faction.color}30` }}
    >
      {!imgError && faction.imageUrl ? (
        <img src={faction.imageUrl} alt={faction.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <Icon className="w-10 h-10" style={{ color: faction.color }} />
      )}
    </div>
  );
}

function RelatedFactionAvatar({ faction }) {
  const [imgError, setImgError] = useState(false);
  const TYPE_ICONS_LOCAL = { Gouvernement: Shield, Corporation: Building, Criminel: AlertTriangle, Terroriste: AlertTriangle, Alien: Globe, 'Application de la Loi': Shield, Militaire: Anchor, Guilde: Crosshair, Sécurité: Shield, Organisation: Users };
  const Icon = TYPE_ICONS_LOCAL[faction.type] || Users;
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: `${faction.color}15` }}>
      {!imgError && faction.imageUrl ? (
        <img src={faction.imageUrl} alt={faction.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <Icon className="w-4 h-4" style={{ color: faction.color }} />
      )}
    </div>
  );
}

export default function FactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const faction = useMemo(() => FACTIONS.find(f => f.id === id), [id]);
  const isFavorite = (favorites.factions || []).some(f => f.id === id);

  if (!faction) {
    return (
      <div className="card p-12 text-center">
        <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-400 mb-2">Faction introuvable</h2>
        <p className="text-slate-500 mb-4">L'identifiant "{id}" ne correspond à aucune faction répertoriée.</p>
        <button onClick={() => navigate('/factions')} className="btn-primary gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour aux Factions
        </button>
      </div>
    );
  }

  const Icon = TYPE_ICONS[faction.type] || Users;
  const alignStyle = ALIGNMENT_STYLES[faction.alignment] || ALIGNMENT_STYLES.Neutre;

  const relatedFactions = FACTIONS.filter(f =>
    f.id !== faction.id && (f.type === faction.type || f.alignment === faction.alignment)
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/factions')}
        className="btn-ghost gap-2 text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux Factions
      </button>

      {/* Hero */}
      <div
        className="card-glow p-6 relative overflow-hidden"
        style={{ borderColor: `${faction.color}20` }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at top right, ${faction.color}, transparent 70%)` }}
        />
        <div className="relative flex flex-col sm:flex-row items-start gap-5">
          <FactionAvatar faction={faction} Icon={Icon} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-black font-display text-slate-100">{faction.name}</h1>
              <span className="badge badge-slate">{faction.type}</span>
              <span className={`badge ${alignStyle.badge}`}>{faction.alignment}</span>
              <button
                onClick={() => isFavorite
                  ? removeFavorite('factions', { id: faction.id })
                  : addFavorite('factions', { id: faction.id, name: faction.name, type: faction.type })
                }
                className={clsx('btn-ghost p-1.5 rounded-lg transition-colors ml-auto sm:ml-0', isFavorite ? 'text-gold-400' : 'text-slate-500 hover:text-gold-400')}
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">{faction.description}</p>
            {faction.headquarters && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4" style={{ color: faction.color }} />
                <span>Quartier général : <span className="text-slate-300">{faction.headquarters}</span></span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Missions */}
          {faction.missions?.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Objectifs & Missions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {faction.missions.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-lg bg-space-900/60 border border-space-400/10"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: faction.color }}
                    />
                    <span className="text-sm text-slate-300">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Territories / Operating Areas */}
          {((faction.territories?.length > 0) || (faction.operatingAreas?.length > 0)) && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Territoires & Zones d'Opération
              </h2>
              <div className="flex flex-wrap gap-2">
                {(faction.territories || faction.operatingAreas || []).map((t, i) => (
                  <span key={i} className="badge badge-slate">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Long Description */}
          {faction.longDescription && (
            <div className="card p-5">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Description Détaillée
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">{faction.longDescription}</p>
            </div>
          )}

          {/* Relations */}
          {faction.relations && Object.keys(faction.relations).length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Sword className="w-4 h-4 text-cyan-400" />
                Relations avec d'autres Factions
              </h2>
              <div className="space-y-2">
                {Object.entries(faction.relations).map(([fid, rel]) => {
                  const related = FACTIONS.find(f => f.id === fid);
                  const relLower = rel.toLowerCase();
                  const relColor = relLower.includes('ennemi') || relLower.includes('guerre') ? 'text-danger-400 bg-danger-500/10'
                    : relLower.includes('rival') ? 'text-warning-400 bg-warning-500/10'
                    : relLower.includes('allié') || relLower.includes('partenaire') || relLower.includes('branche') ? 'text-success-400 bg-success-500/10'
                    : 'text-slate-400 bg-space-700/50';
                  return (
                    <div key={fid} className="flex items-center justify-between p-2 rounded-lg bg-space-900/40 border border-space-400/10">
                      <span className="text-sm text-slate-300">{related?.name || fid}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${relColor}`}>{rel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lore */}
          {faction.lore && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Histoire & Contexte</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{faction.lore}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Informations</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-space-400/10">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Type</span>
                <span className="badge badge-slate">{faction.type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-space-400/10">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Alignement</span>
                <span className={`badge ${alignStyle.badge}`}>{faction.alignment}</span>
              </div>
              {faction.headquarters && (
                <div className="flex justify-between items-start py-2 border-b border-space-400/10 gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">QG</span>
                  <span className="text-xs text-slate-300 text-right">{faction.headquarters}</span>
                </div>
              )}
              {faction.focus && (
                <div className="flex justify-between items-start py-2 border-b border-space-400/10 gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Activité</span>
                  <span className="text-xs text-slate-300 text-right">{faction.focus}</span>
                </div>
              )}
              {(faction.leadership || faction.leader) && (
                <div className="flex justify-between items-start py-2 border-b border-space-400/10 gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Direction</span>
                  <span className="text-xs text-slate-300 text-right">{faction.leadership || faction.leader}</span>
                </div>
              )}
              {faction.founded && (
                <div className="flex justify-between items-center py-2 border-b border-space-400/10">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Fondée</span>
                  <span className="text-xs text-slate-300">{faction.founded}</span>
                </div>
              )}
              {faction.missions && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Missions</span>
                  <span className="text-xs font-bold" style={{ color: faction.color }}>{faction.missions.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rewards */}
          {faction.rewards?.length > 0 && (
            <div className="card p-4">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-400" />
                Récompenses
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {faction.rewards.map((r, i) => (
                  <span key={i} className="badge badge-yellow text-xs">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Ships (alien factions) */}
          {faction.ships?.length > 0 && (
            <div className="card p-4">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Anchor className="w-4 h-4 text-cyan-400" />
                Vaisseaux Associés
              </h2>
              <div className="space-y-1">
                {faction.ships.map((ship, i) => (
                  <div key={i} className="text-sm text-slate-300 px-2 py-1 rounded bg-space-900/40 border border-space-400/10">
                    {ship}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alignment block */}
          <div className={`card p-4 border ${alignStyle.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Star className={`w-4 h-4 ${alignStyle.text}`} />
              <span className={`text-sm font-semibold ${alignStyle.text}`}>Statut : {faction.alignment}</span>
            </div>
            <p className="text-xs text-slate-400">
              {faction.alignment === 'Légal' && 'Cette faction opère dans le cadre des lois de l\'UEE. Les interactions sont généralement sans risque légal.'}
              {faction.alignment === 'Neutre' && 'Cette faction n\'est ni alignée avec l\'UEE ni ouvertement hostile. Les interactions requièrent de la prudence.'}
              {faction.alignment === 'Hors-la-loi' && 'Cette faction opère en dehors de la loi. Toute interaction peut entraîner une hausse de votre niveau de criminalité.'}
            </p>
          </div>

          {/* Related factions */}
          {relatedFactions.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-space-400/20">
                <h2 className="section-title">Factions Similaires</h2>
              </div>
              <div className="divide-y divide-space-400/10">
                {relatedFactions.map(f => {
                  const FIcon = TYPE_ICONS[f.type] || Users;
                  return (
                    <button
                      key={f.id}
                      onClick={() => navigate(`/factions/${f.id}`)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-space-700/40 transition-colors text-left"
                    >
                        <RelatedFactionAvatar faction={f} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{f.name}</div>
                        <div className="text-xs text-slate-500">{f.type}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
