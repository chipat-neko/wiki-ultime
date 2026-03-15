import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { uploadContributionImage } from '../../lib/supabase.js';
import { useAuth } from '../../core/AuthContext.jsx';
import clsx from 'clsx';

/**
 * Composant d'upload d'image vers Supabase Storage.
 * @param {string}   value      — URL de l'image uploadée (contrôlé)
 * @param {Function} onChange   — appelé avec la nouvelle URL après upload, ou '' pour supprimer
 * @param {string}   [label]    — libellé du champ
 */
export default function ImageUpload({ value, onChange, label = 'Image (optionnel)' }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadContributionImage(user.id, file);
      onChange(url);
    } catch (e) {
      setError(e.message ?? 'Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input pour permettre re-sélection du même fichier
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    onChange('');
    setError('');
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400">{label}</label>

      {/* Prévisualisation si image uploadée */}
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-space-400/20 bg-space-900">
          <img
            src={value}
            alt="Aperçu"
            className="w-full max-h-48 object-contain"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="px-3 py-2 bg-space-800 border-t border-space-400/20">
            <p className="text-xs text-green-400 truncate">Image uploadée ✓</p>
          </div>
        </div>
      ) : (
        /* Zone de drop */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={clsx(
            'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors py-6',
            dragOver
              ? 'border-cyan-400/60 bg-cyan-500/5'
              : 'border-space-400/30 bg-space-900 hover:border-space-400/50 hover:bg-space-800',
            uploading && 'cursor-not-allowed opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
              <span className="text-xs text-slate-400">Upload en cours…</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-space-700 border border-space-400/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-300">
                  <span className="text-cyan-400 font-medium">Clique</span> ou glisse une image ici
                </p>
                <p className="text-xs text-slate-500 mt-0.5">PNG, JPG, GIF, WEBP — max 8 Mo</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Upload className="w-3 h-3" />
                Upload vers le serveur
              </div>
            </>
          )}
        </div>
      )}

      {/* Input caché */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
