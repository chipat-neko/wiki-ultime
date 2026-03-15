import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/AuthContext.jsx';
import { submitContribution } from '../../lib/supabase.js';
import ImageUpload from '../../ui/components/ImageUpload.jsx';
import {
  PlusCircle, Rocket, Package, BookOpen, Image, Wrench,
  AlertCircle, CheckCircle, ChevronRight, Star,
} from 'lucide-react';
import clsx from 'clsx';

const CONTRIBUTION_TYPES = [
  {
    id: 'ship',
    label: 'Vaisseau / Véhicule',
    icon: Rocket,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    description: "Ajouter ou corriger les données d'un vaisseau (specs, prix, hardpoints\u2026)",
    stars: 5,
    fields: [
      { key: 'name',         label: 'Nom du vaisseau',     type: 'text',     required: true },
      { key: 'manufacturer', label: 'Fabricant',            type: 'text',     required: true },
      { key: 'changes',      label: 'Modifications / données à ajouter', type: 'textarea', required: true },
      { key: 'source',       label: 'Source (lien)',        type: 'url',      required: false },
    ],
  },
  {
    id: 'commodity',
    label: 'Commodité / Prix',
    icon: Package,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    description: 'Corriger un prix de commodité ou ajouter un nouveau point de vente/achat.',
    stars: 3,
    fields: [
      { key: 'commodity', label: 'Nom de la commodité', type: 'text',     required: true },
      { key: 'station',   label: 'Station / Terminal',  type: 'text',     required: true },
      { key: 'buyPrice',  label: "Prix d'achat (aUEC)", type: 'number',   required: false },
      { key: 'sellPrice', label: 'Prix de vente (aUEC)', type: 'number',   required: false },
      { key: 'source',    label: 'Source (lien)',        type: 'url',      required: false },
    ],
  },
  {
    id: 'guide',
    label: 'Guide de jeu',
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    description: 'Proposer un nouveau guide ou mettre à jour un guide existant.',
    stars: 8,
    fields: [
      { key: 'title',    label: 'Titre du guide',        type: 'text',     required: true },
      { key: 'category', label: 'Catégorie',             type: 'text',     required: true },
      { key: 'content',  label: 'Contenu du guide',      type: 'textarea', required: true },
      { key: 'version',  label: 'Version du jeu visée',  type: 'text',     required: false },
    ],
  },
  {
    id: 'image',
    label: 'Image',
    icon: Image,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    description: 'Proposer une image (vaisseau, faction, lieu) pour compléter le wiki.',
    stars: 2,
    fields: [
      { key: 'subject', label: 'Sujet (vaisseau, faction…)', type: 'text', required: true },
      { key: 'source',  label: 'Source / crédits',           type: 'text', required: true },
    ],
  },
  {
    id: 'other',
    label: 'Autre',
    icon: Wrench,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    description: 'Signaler une erreur, proposer une amélioration ou toute autre contribution.',
    stars: 2,
    fields: [
      { key: 'details', label: 'Détails de la contribution', type: 'textarea', required: true },
      { key: 'source',  label: 'Source (lien)',              type: 'url',      required: false },
    ],
  },
];

const FIELD_CLASS = 'w-full bg-space-800 border border-space-400/30 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors';

export default function Contribute() {
  const { user, isActive } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields]     = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <PlusCircle className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">Tu dois être connecté pour contribuer.</p>
        <Link to="/connexion" className="px-4 py-2 rounded-lg bg-cyan-500 text-space-950 font-semibold text-sm hover:bg-cyan-400 transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500" />
        <p className="text-slate-300 font-medium">Compte en attente de validation</p>
        <p className="text-slate-500 text-sm max-w-sm">Un administrateur doit approuver ton compte avant que tu puisses contribuer au wiki.</p>
        <Link to="/profil" className="text-sm text-cyan-400 hover:underline">Voir mon profil</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Contribution envoyée !</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Ta contribution est en cours d'examen par un modérateur. Tu recevras des étoiles si elle est acceptée.
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => { setSuccess(false); setSelectedType(null); setTitle(''); setDescription(''); setFields({}); setImageUrl(''); }}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-space-950 font-semibold text-sm hover:bg-cyan-400 transition-colors"
          >
            Nouvelle contribution
          </button>
          <Link to="/profil" className="px-4 py-2 rounded-lg bg-space-800 border border-space-400/20 text-slate-300 text-sm hover:text-white transition-colors">
            Mon profil
          </Link>
        </div>
      </div>
    );
  }

  const typeCfg = CONTRIBUTION_TYPES.find(t => t.id === selectedType);

  function setField(key, value) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    // I-06 : pour le type "image", une image doit obligatoirement être jointe
    if (selectedType === 'image' && !imageUrl) {
      setError("Une image est obligatoire pour ce type de contribution. Veuillez en uploader une.");
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitContribution(user.id, {
        type: selectedType,
        title: title.trim(),
        description: description.trim(),
        content: { ...fields, ...(imageUrl ? { imageUrl } : {}) },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message ?? "Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Contribuer au Wiki</h1>
          <p className="text-sm text-slate-500">Gagne des étoiles en aidant la communauté</p>
        </div>
      </div>

      {/* Sélection du type */}
      {!selectedType ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Que souhaites-tu contribuer ?</p>
          {CONTRIBUTION_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={clsx(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                  'bg-space-900 border-space-400/20 hover:border-cyan-500/30 hover:bg-space-800 group'
                )}
              >
                <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', t.bg, t.border, 'border')}>
                  <Icon className={clsx('w-5 h-5', t.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{t.label}</span>
                    <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                      <Star className="w-3 h-3" />+{t.stars} étoiles
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      ) : (
        /* Formulaire */
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => { setSelectedType(null); setError(''); }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Changer de type
          </button>

          <div className={clsx('flex items-center gap-3 p-3 rounded-xl border', typeCfg.bg, typeCfg.border)}>
            <typeCfg.icon className={clsx('w-5 h-5 flex-shrink-0', typeCfg.color)} />
            <div>
              <span className="text-sm font-medium text-white">{typeCfg.label}</span>
              <span className="ml-2 text-xs text-yellow-400 flex items-center gap-0.5 inline-flex">
                <Star className="w-3 h-3" />+{typeCfg.stars} étoiles si accepté
              </span>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Titre <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Résumé de ta contribution"
              required
              maxLength={200}
              className={FIELD_CLASS}
            />
          </div>

          {/* Description courte */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explique en quelques mots ce que tu proposes…"
              rows={2}
              maxLength={2000}
              className={clsx(FIELD_CLASS, 'resize-none')}
            />
          </div>

          {/* Champs spécifiques au type */}
          {typeCfg.fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={fields[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  required={f.required}
                  rows={4}
                  className={clsx(FIELD_CLASS, 'resize-none')}
                />
              ) : (
                <input
                  type={f.type}
                  value={fields[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  required={f.required}
                  className={FIELD_CLASS}
                />
              )}
            </div>
          ))}

          {/* Upload image — disponible pour tous les types */}
          <div className="border-t border-space-400/10 pt-4">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label={selectedType === 'image' ? 'Image à soumettre *' : 'Ajouter une image (optionnel)'}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-space-950 font-semibold text-sm transition-colors"
          >
            {submitting ? 'Envoi en cours…' : 'Soumettre la contribution'}
          </button>
        </form>
      )}
    </div>
  );
}
