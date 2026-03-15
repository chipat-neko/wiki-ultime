import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getLevelInfo, LEVELS } from '../../core/AuthContext.jsx';
import { updateProfile } from '../../lib/supabase.js';
import {
  User, Star, Award, LogOut, Edit2, Check, X,
  Shield, Feather, TrendingUp, Clock, PlusCircle,
} from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/fr.js';
dayjs.extend(relativeTime);
dayjs.locale('fr');

function StarBar({ stars, nextStars, progress }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{stars} étoiles</span>
        {nextStars && <span>Prochain niveau : {nextStars} étoiles</span>}
      </div>
      <div className="h-2 bg-space-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function LevelBadge({ levelInfo, size = 'md' }) {
  const sizes = { sm: 'text-xs px-1.5 py-0.5', md: 'text-sm px-2.5 py-1' };
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-semibold border',
      levelInfo.bg, levelInfo.color,
      size === 'md' ? 'border-current/20 px-2.5 py-1 text-sm' : 'border-current/20 px-1.5 py-0.5 text-xs',
    )}>
      <Award className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {levelInfo.name}
    </span>
  );
}

export default function UserProfile() {
  const { user, profile, role, isAdmin, isMod, isActive, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing]   = useState(false);
  const [bio, setBio]           = useState(profile?.bio ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <User className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">Tu dois être connecté pour voir ton profil.</p>
        <Link to="/connexion" className="px-4 py-2 rounded-lg bg-cyan-500 text-space-950 font-semibold text-sm hover:bg-cyan-400 transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  const levelInfo = getLevelInfo(profile.stars ?? 0);
  const nextLevel = levelInfo.next;

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      await updateProfile(user.id, { username: username.trim(), bio: bio.trim() });
      await refreshProfile();
      setEditing(false);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/connexion');
  }

  const roleLabel = { admin: 'Administrateur', moderator: 'Modérateur', user: 'Contributeur' }[role] ?? 'Membre';
  const roleColor = { admin: 'text-purple-400', moderator: 'text-blue-400', user: 'text-slate-400' }[role] ?? 'text-slate-400';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Carte profil principale */}
      <div className="bg-space-900 border border-space-400/20 rounded-2xl overflow-hidden">
        {/* Bandeau de niveau */}
        <div className={clsx('h-2 w-full bg-gradient-to-r', {
          'from-slate-600 to-slate-500':   levelInfo.level === 0,
          'from-green-600 to-green-400':   levelInfo.level === 1,
          'from-blue-600 to-blue-400':     levelInfo.level === 2,
          'from-purple-600 to-purple-400': levelInfo.level === 3,
          'from-yellow-600 to-yellow-400': levelInfo.level === 4,
          'from-cyan-600 to-cyan-400':     levelInfo.level >= 5,
        })} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Avatar + infos */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-space-700 border border-space-400/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-slate-200">
                  {profile.username?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                {editing ? (
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    maxLength={30}
                    className="bg-space-800 border border-space-400/30 rounded px-2 py-1 text-white text-lg font-bold focus:outline-none focus:border-cyan-500/50 w-48"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white">{profile.username}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <LevelBadge levelInfo={levelInfo} />
                  <span className={clsx('text-xs font-medium', roleColor)}>
                    {isMod && <Shield className="inline w-3 h-3 mr-0.5" />}
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!editing ? (
                <button
                  onClick={() => { setEditing(true); setBio(profile.bio ?? ''); setUsername(profile.username ?? ''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-700 text-slate-300 hover:text-white text-sm transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {saving ? 'Enregistrement…' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editing ? (
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Parle-toi en quelques mots…"
                rows={2}
                maxLength={500}
                className="w-full bg-space-800 border border-space-400/30 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            ) : (
              <p className="text-sm text-slate-400">{profile.bio || <span className="italic text-slate-600">Aucune bio</span>}</p>
            )}
            {saveError && <p className="text-xs text-red-400 mt-1">{saveError}</p>}
          </div>

          <p className="text-xs text-slate-600 mt-2">Membre depuis {dayjs(profile.created_at).fromNow()}</p>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-space-900 border border-space-400/20 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          Progression & Étoiles
        </h3>

        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{profile.stars ?? 0}</div>
            <div className="text-xs text-slate-500 mt-0.5">Étoiles</div>
          </div>
          <div className="flex-1">
            <StarBar
              stars={profile.stars ?? 0}
              nextStars={nextLevel?.minStars}
              progress={levelInfo.progress}
            />
            {nextLevel && (
              <p className="text-xs text-slate-500 mt-1.5">
                Encore <strong className="text-slate-300">{nextLevel.minStars - (profile.stars ?? 0)}</strong> étoiles pour devenir <strong className={nextLevel.color}>{nextLevel.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Tous les niveaux */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {LEVELS.map(l => (
            <div
              key={l.level}
              className={clsx(
                'rounded-lg p-2 border text-center transition-all',
                levelInfo.level === l.level
                  ? clsx(l.bg, 'border-current/30 ring-1 ring-current/20')
                  : (profile.stars ?? 0) >= l.minStars
                  ? 'bg-space-800 border-space-400/20 opacity-80'
                  : 'bg-space-800/50 border-space-400/10 opacity-40'
              )}
            >
              <div className={clsx('text-sm font-semibold', l.color)}>{l.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{l.minStars} étoiles</div>
            </div>
          ))}
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-2 gap-3">
        {isActive && (
          <Link
            to="/contribuer"
            className="flex items-center gap-3 p-4 bg-space-900 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-colors group"
          >
            <PlusCircle className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-sm font-medium text-white">Contribuer</div>
              <div className="text-xs text-slate-500">Ajouter au wiki</div>
            </div>
          </Link>
        )}
        {isMod && (
          <Link
            to="/admin"
            className="flex items-center gap-3 p-4 bg-space-900 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-colors group"
          >
            <Shield className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-sm font-medium text-white">Panneau Admin</div>
              <div className="text-xs text-slate-500">Gérer la communauté</div>
            </div>
          </Link>
        )}
        {!isActive && !isAdmin && (
          <div className="col-span-2 flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-yellow-300">Compte en attente</div>
              <div className="text-xs text-yellow-500/70">Un admin doit valider ton compte avant que tu puisses contribuer.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
