import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getLevelInfo, LEVELS } from '../../core/AuthContext.jsx';
import { useAppState } from '../../core/StateManager.jsx';
import { updateProfile } from '../../lib/supabase.js';
import {
  User, Star, Award, LogOut, Edit2, Check, X,
  Shield, Feather, TrendingUp, Clock, PlusCircle,
  BarChart3, Rocket, Eye, EyeOff, MessageSquare,
  BookOpen, Calendar, ExternalLink, Save,
  Globe, Wrench, PenTool, Target, Crosshair, Lock,
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

/* ─── Statistiques ─── */
function ProfileStats({ profile }) {
  const [stats, setStats] = useState({ builds: 0, comments: 0, articles: 0 });

  useEffect(() => {
    try {
      const builds = JSON.parse(localStorage.getItem('sc_shared_builds') || '[]');
      const comments = JSON.parse(localStorage.getItem('sc_user_comments') || '[]');
      const articles = JSON.parse(localStorage.getItem('sc_user_articles') || '[]');
      setStats({
        builds: Array.isArray(builds) ? builds.length : 0,
        comments: Array.isArray(comments) ? comments.length : 0,
        articles: Array.isArray(articles) ? articles.length : 0,
      });
    } catch { /* ignore */ }
  }, []);

  const statItems = [
    { label: 'Builds partagés', value: stats.builds, icon: Rocket, color: 'text-cyan-400' },
    { label: 'Commentaires', value: stats.comments, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Articles blog', value: stats.articles, icon: BookOpen, color: 'text-purple-400' },
  ];

  return (
    <div className="bg-space-900 border border-space-400/20 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-cyan-400" />
        Statistiques
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statItems.map(s => (
          <div key={s.label} className="bg-space-800 rounded-xl p-3 text-center border border-space-400/10">
            <s.icon className={clsx('w-5 h-5 mx-auto mb-1.5', s.color)} />
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
        <div className="bg-space-800 rounded-xl p-3 text-center border border-space-400/10">
          <Calendar className="w-5 h-5 mx-auto mb-1.5 text-yellow-400" />
          <div className="text-sm font-bold text-white">
            {profile.created_at ? dayjs(profile.created_at).format('DD/MM/YYYY') : '—'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Inscription</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Badges & Succès ─── */
const BADGES_CONFIG = [
  {
    id: 'explorateur',
    name: 'Explorateur',
    description: 'Visiter 10 pages différentes',
    icon: Globe,
    color: 'cyan',
    threshold: 10,
    getProgress: () => {
      try {
        const history = JSON.parse(localStorage.getItem('app_history') || '[]');
        const unique = new Set(history.map(h => h.path ?? h.id ?? h.name)).size;
        return unique;
      } catch { return 0; }
    },
  },
  {
    id: 'contributeur',
    name: 'Contributeur',
    description: 'Partager au moins 1 build',
    icon: Wrench,
    color: 'green',
    threshold: 1,
    getProgress: () => {
      try {
        const count = parseInt(localStorage.getItem('sc_shared_builds_count') || '0', 10);
        if (count > 0) return count;
        const builds = JSON.parse(localStorage.getItem('sc_shared_builds') || '[]');
        return Array.isArray(builds) ? builds.length : 0;
      } catch { return 0; }
    },
  },
  {
    id: 'commentateur',
    name: 'Commentateur',
    description: 'Poster 3 commentaires ou plus',
    icon: MessageSquare,
    color: 'blue',
    threshold: 3,
    getProgress: () => {
      try {
        const comments = JSON.parse(localStorage.getItem('sc_user_comments') || '[]');
        return Array.isArray(comments) ? comments.length : 0;
      } catch { return 0; }
    },
  },
  {
    id: 'blogueur',
    name: 'Blogueur',
    description: 'Écrire au moins 1 article de blog',
    icon: PenTool,
    color: 'purple',
    threshold: 1,
    getProgress: () => {
      try {
        const articles = JSON.parse(localStorage.getItem('sc_user_articles') || '[]');
        return Array.isArray(articles) ? articles.length : 0;
      } catch { return 0; }
    },
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Avoir un compte depuis 30 jours',
    icon: Shield,
    color: 'gold',
    threshold: 30,
    getProgress: (_fleet, profile) => {
      if (!profile?.created_at) return 0;
      const diff = dayjs().diff(dayjs(profile.created_at), 'day');
      return diff;
    },
  },
  {
    id: 'collectionneur',
    name: 'Collectionneur',
    description: 'Avoir 5 vaisseaux dans sa flotte',
    icon: Rocket,
    color: 'orange',
    threshold: 5,
    getProgress: (fleet) => {
      return fleet?.ships?.length ?? 0;
    },
  },
  {
    id: 'stratege',
    name: 'Stratège',
    description: 'Utiliser le planificateur de session',
    icon: Target,
    color: 'red',
    threshold: 1,
    getProgress: () => {
      return localStorage.getItem('sc_session_planner_used') ? 1 : 0;
    },
  },
  {
    id: 'pilote',
    name: 'Pilote',
    description: 'Exporter au moins 1 loadout',
    icon: Crosshair,
    color: 'yellow',
    threshold: 1,
    getProgress: () => {
      return localStorage.getItem('sc_loadout_exported') ? 1 : 0;
    },
  },
];

const BADGE_COLORS = {
  cyan:   { bg: 'bg-cyan-500/20',   border: 'border-cyan-500/40',   text: 'text-cyan-400',   glow: 'shadow-cyan-500/25' },
  green:  { bg: 'bg-green-500/20',  border: 'border-green-500/40',  text: 'text-green-400',  glow: 'shadow-green-500/25' },
  blue:   { bg: 'bg-blue-500/20',   border: 'border-blue-500/40',   text: 'text-blue-400',   glow: 'shadow-blue-500/25' },
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', glow: 'shadow-purple-500/25' },
  gold:   { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', glow: 'shadow-yellow-500/25' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-orange-500/25' },
  red:    { bg: 'bg-red-500/20',    border: 'border-red-500/40',    text: 'text-red-400',    glow: 'shadow-red-500/25' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', glow: 'shadow-yellow-500/25' },
};

function ProfileBadges({ profile }) {
  const { fleet } = useAppState();
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const computed = BADGES_CONFIG.map(b => {
      const progress = b.getProgress(fleet, profile);
      const earned = progress >= b.threshold;
      return { ...b, progress, earned };
    });
    setBadges(computed);
  }, [fleet, profile]);

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="bg-space-900 border border-space-400/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Badges & Succès
        </h3>
        <span className="text-xs text-slate-500">
          {earnedCount}/{badges.length} débloqués
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map(badge => {
          const colors = BADGE_COLORS[badge.color] ?? BADGE_COLORS.cyan;
          const Icon = badge.icon;
          const progressText = badge.threshold > 1
            ? `${Math.min(badge.progress, badge.threshold)}/${badge.threshold}`
            : null;

          return (
            <div
              key={badge.id}
              className={clsx(
                'relative rounded-xl p-3 border text-center transition-all duration-300',
                badge.earned
                  ? clsx(colors.bg, colors.border, 'shadow-lg', colors.glow)
                  : 'bg-space-800/50 border-space-400/10 opacity-50'
              )}
            >
              {!badge.earned && (
                <Lock className="absolute top-2 right-2 w-3 h-3 text-slate-600" />
              )}
              <div className={clsx(
                'w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2',
                badge.earned ? clsx(colors.bg, colors.border, 'border') : 'bg-space-700 border border-space-400/10'
              )}>
                <Icon className={clsx('w-5 h-5', badge.earned ? colors.text : 'text-slate-600')} />
              </div>
              <div className={clsx(
                'text-xs font-semibold',
                badge.earned ? 'text-white' : 'text-slate-500'
              )}>
                {badge.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {badge.description}
              </div>
              {progressText && (
                <div className={clsx(
                  'text-[10px] font-medium mt-1.5 px-2 py-0.5 rounded-full inline-block',
                  badge.earned
                    ? clsx(colors.bg, colors.text)
                    : 'bg-space-700 text-slate-500'
                )}>
                  {progressText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Bio publique (localStorage) ─── */
function ProfileBio() {
  const [publicBio, setPublicBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sc_user_bio') || '';
    setPublicBio(saved);
    setDraft(saved);
  }, []);

  function handleSaveBio() {
    const trimmed = draft.trim().slice(0, 300);
    localStorage.setItem('sc_user_bio', trimmed);
    setPublicBio(trimmed);
    setEditingBio(false);
  }

  return (
    <div className="bg-space-900 border border-space-400/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Feather className="w-4 h-4 text-cyan-400" />
          Bio publique
        </h3>
        {!editingBio ? (
          <button
            onClick={() => { setDraft(publicBio); setEditingBio(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-700 text-slate-400 hover:text-white text-xs transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Modifier
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveBio}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs transition-colors"
            >
              <Save className="w-3 h-3" />
              Sauvegarder
            </button>
            <button
              onClick={() => setEditingBio(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-space-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {editingBio ? (
        <div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Décris-toi en quelques mots pour les autres joueurs…"
            rows={3}
            maxLength={300}
            className="w-full bg-space-800 border border-space-400/30 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
          <div className="text-xs text-slate-600 text-right mt-1">{draft.length}/300</div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          {publicBio || <span className="italic text-slate-600">Aucune bio publique définie</span>}
        </p>
      )}
    </div>
  );
}

/* ─── Flotte publique ─── */
function ProfileFleet() {
  const { fleet } = useAppState();
  const [isPublic, setIsPublic] = useState(() => {
    return localStorage.getItem('sc_fleet_public') === 'true';
  });

  function togglePublic() {
    const next = !isPublic;
    setIsPublic(next);
    localStorage.setItem('sc_fleet_public', String(next));
  }

  const ships = fleet?.ships ?? [];

  const ROLE_COLORS = {
    Combat: 'text-red-400',
    Transport: 'text-amber-400',
    Exploration: 'text-emerald-400',
    Minage: 'text-orange-400',
    Soutien: 'text-blue-400',
    Multi: 'text-purple-400',
  };

  return (
    <div className="bg-space-900 border border-space-400/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Rocket className="w-4 h-4 text-cyan-400" />
          Ma Flotte Publique
        </h3>
        <button
          onClick={togglePublic}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
            isPublic
              ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
              : 'bg-space-700 border-space-400/20 text-slate-400 hover:text-slate-200'
          )}
        >
          {isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {isPublic ? 'Publique' : 'Privée'}
        </button>
      </div>

      {ships.length === 0 ? (
        <div className="text-center py-6">
          <Rocket className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Aucun vaisseau dans ta flotte.</p>
          <Link
            to="/flotte"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Gérer ma flotte
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {ships.map((ship, i) => (
            <div
              key={ship.fleetId ?? i}
              className="flex items-center gap-3 p-3 bg-space-800 rounded-xl border border-space-400/10 hover:border-space-400/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{ship.name}</div>
                <div className="text-xs text-slate-500">{ship.manufacturer}</div>
              </div>
              <span className={clsx(
                'text-xs font-medium px-2 py-0.5 rounded-full bg-space-700',
                ROLE_COLORS[ship.role] ?? 'text-slate-400'
              )}>
                {ship.role ?? '—'}
              </span>
            </div>
          ))}
          <div className="text-xs text-slate-600 text-right pt-1">
            {ships.length} vaisseau{ships.length > 1 ? 'x' : ''} dans la flotte
          </div>
        </div>
      )}
    </div>
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

      {/* Statistiques */}
      <ProfileStats profile={profile} />

      {/* Badges & Succès */}
      <ProfileBadges profile={profile} />

      {/* Bio publique */}
      <ProfileBio />

      {/* Ma Flotte Publique */}
      <ProfileFleet />

      {/* Builds Partagés */}
      <div className="bg-space-900 border border-space-400/20 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-cyan-400" />
          Builds Partagés
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Retrouve tous tes builds de vaisseaux partagés avec la communauté.
        </p>
        <Link
          to={`/builds?user=${profile.username ?? ''}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Voir mes builds
        </Link>
      </div>
    </div>
  );
}
