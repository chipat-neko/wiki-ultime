import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { useAuth } from '../../core/AuthContext.jsx';
import {
  Trophy, Medal, Crown, Search, Calendar, User, Star,
  TrendingUp, Heart, FileText, Wrench, Loader2, AlertCircle,
  ChevronUp, ChevronDown, Award,
} from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
dayjs.locale('fr');

// ── Constantes ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'contributors', label: 'Contributeurs',      icon: Wrench,    badge: 'Top Contributeur' },
  { id: 'builds',       label: 'Builds Populaires',  icon: Star,      badge: 'Builder Star' },
  { id: 'articles',     label: 'Articles Populaires', icon: FileText,  badge: 'Auteur Populaire' },
];

const TIME_FILTERS = [
  { id: 'all',   label: 'Tout' },
  { id: 'month', label: 'Ce mois' },
  { id: 'week',  label: 'Cette semaine' },
];

const PODIUM_STYLES = [
  { ring: 'ring-yellow-400', bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Crown,  label: '1er' },
  { ring: 'ring-slate-300',  bg: 'bg-slate-400/20',  text: 'text-slate-300',  icon: Medal,  label: '2e' },
  { ring: 'ring-amber-600',  bg: 'bg-amber-700/20',  text: 'text-amber-500',  icon: Medal,  label: '3e' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeRange(filterId) {
  if (filterId === 'month') return dayjs().startOf('month').toISOString();
  if (filterId === 'week')  return dayjs().startOf('week').toISOString();
  return null;
}

function Avatar({ url, username, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-lg' };
  if (url) {
    return (
      <img
        src={url}
        alt={username}
        className={clsx(sizes[size], 'rounded-full object-cover')}
      />
    );
  }
  return (
    <div className={clsx(
      sizes[size],
      'rounded-full bg-space-700 flex items-center justify-center font-bold text-cyan-400'
    )}>
      {(username || '?')[0].toUpperCase()}
    </div>
  );
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchContributors(since) {
  let query = supabase
    .from('contributions')
    .select('user_id, created_at, profiles!inner(username, avatar_url)')
    .eq('status', 'accepted');

  if (since) query = query.gte('created_at', since);

  const { data, error } = await query;
  if (error) throw error;

  const map = {};
  for (const row of data || []) {
    const uid = row.user_id;
    if (!map[uid]) {
      map[uid] = {
        user_id: uid,
        username: row.profiles.username,
        avatar_url: row.profiles.avatar_url,
        score: 0,
        latest: row.created_at,
      };
    }
    map[uid].score += 1;
    if (row.created_at > map[uid].latest) map[uid].latest = row.created_at;
  }

  return Object.values(map).sort((a, b) => b.score - a.score);
}

async function fetchBuilds(since) {
  let query = supabase
    .from('shared_builds')
    .select('*, profiles!user_id(username, avatar_url)')
    .order('likes_count', { ascending: false })
    .limit(50);

  if (since) query = query.gte('created_at', since);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(row => ({
    user_id: row.user_id,
    username: row.profiles?.username ?? 'Inconnu',
    avatar_url: row.profiles?.avatar_url,
    score: row.likes_count ?? 0,
    title: row.title ?? row.name ?? 'Build sans nom',
    latest: row.created_at,
  }));
}

async function fetchArticles(since) {
  let query = supabase
    .from('blog_posts')
    .select('*, profiles!user_id(username, avatar_url)')
    .order('likes_count', { ascending: false })
    .limit(50);

  if (since) query = query.gte('created_at', since);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(row => ({
    user_id: row.user_id,
    username: row.profiles?.username ?? 'Inconnu',
    avatar_url: row.profiles?.avatar_url,
    score: row.likes_count ?? 0,
    title: row.title ?? 'Article sans titre',
    latest: row.created_at,
  }));
}

const FETCHERS = {
  contributors: fetchContributors,
  builds: fetchBuilds,
  articles: fetchArticles,
};

// ── Composant Podium ──────────────────────────────────────────────────────────

function PodiumCard({ entry, rank, badgeLabel, tab }) {
  const style = PODIUM_STYLES[rank];
  const Icon = style.icon;
  const isFirst = rank === 0;

  return (
    <div className={clsx(
      'relative flex flex-col items-center p-5 rounded-xl border transition-all',
      'bg-space-800/60 border-space-700/50 hover:border-space-600',
      isFirst && 'md:-mt-4 md:scale-105 shadow-lg shadow-yellow-500/10',
    )}>
      {/* Badge #1 */}
      {isFirst && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 whitespace-nowrap">
          {badgeLabel}
        </span>
      )}

      {/* Rank icon */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center mb-3',
        style.bg,
      )}>
        <Icon className={clsx('w-4 h-4', style.text)} />
      </div>

      {/* Avatar */}
      <div className={clsx('ring-2 rounded-full mb-2', style.ring)}>
        <Avatar
          url={entry.avatar_url}
          username={entry.username}
          size={isFirst ? 'lg' : 'md'}
        />
      </div>

      {/* Username */}
      <p className="font-semibold text-white text-sm truncate max-w-[140px]">
        {entry.username}
      </p>

      {/* Title (builds/articles) */}
      {entry.title && (
        <p className="text-xs text-slate-400 truncate max-w-[140px] mt-0.5">
          {entry.title}
        </p>
      )}

      {/* Score */}
      <div className={clsx('mt-2 flex items-center gap-1.5 font-bold text-lg', style.text)}>
        {tab === 'contributors' ? (
          <><TrendingUp className="w-4 h-4" /> {entry.score}</>
        ) : (
          <><Heart className="w-4 h-4" /> {entry.score}</>
        )}
      </div>

      {/* Rank label */}
      <span className="text-xs text-slate-500 mt-1">{style.label}</span>
    </div>
  );
}

// ── Composant Table ───────────────────────────────────────────────────────────

function LeaderboardTable({ entries, startRank, tab }) {
  if (entries.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-space-700/50 bg-space-800/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-space-700/50 text-slate-400">
            <th className="px-4 py-3 text-left w-16">#</th>
            <th className="px-4 py-3 text-left">Utilisateur</th>
            {tab !== 'contributors' && (
              <th className="px-4 py-3 text-left hidden sm:table-cell">Titre</th>
            )}
            <th className="px-4 py-3 text-right w-24">Score</th>
            <th className="px-4 py-3 text-right w-28 hidden md:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const rank = startRank + i;
            return (
              <tr
                key={entry.user_id + '-' + i}
                className="border-b border-space-700/30 hover:bg-space-700/20 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-slate-500">{rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar url={entry.avatar_url} username={entry.username} size="sm" />
                    <span className="text-white font-medium truncate max-w-[160px]">
                      {entry.username}
                    </span>
                  </div>
                </td>
                {tab !== 'contributors' && (
                  <td className="px-4 py-3 text-slate-400 truncate max-w-[200px] hidden sm:table-cell">
                    {entry.title || '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold">
                    {tab === 'contributors' ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <Heart className="w-3.5 h-3.5" />
                    )}
                    {entry.score}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500 hidden md:table-cell">
                  {entry.latest ? dayjs(entry.latest).format('DD/MM/YY') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Carte "Votre rang" ───────────────────────────────────────────────────────

function YourRankCard({ entries, userId, tab }) {
  if (!userId || entries.length === 0) return null;

  const idx = entries.findIndex(e => e.user_id === userId);
  if (idx === -1) return null;

  const entry = entries[idx];
  const rank = idx + 1;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20">
        <User className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400">Votre position</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">#{rank}</span>
          <span className="text-slate-300 truncate">{entry.username}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">
          {tab === 'contributors' ? 'Contributions' : 'Likes'}
        </p>
        <p className="text-lg font-bold text-cyan-400">{entry.score}</p>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function Leaderboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('contributors');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const since = getTimeRange(timeFilter);
        const result = await FETCHERS[activeTab](since);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab, timeFilter]);

  // Filtered data by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(e =>
      e.username?.toLowerCase().includes(q) ||
      e.title?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const currentBadge = TABS.find(t => t.id === activeTab)?.badge ?? '';

  // ── Not configured ──
  if (!isSupabaseConfigured) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Classement indisponible</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            La connexion à Supabase n'est pas configurée. Configurez les variables
            d'environnement <code className="text-cyan-400">VITE_SUPABASE_URL</code> et{' '}
            <code className="text-cyan-400">VITE_SUPABASE_ANON_KEY</code> pour activer
            le classement communautaire.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Classement</h1>
            <p className="text-sm text-slate-400">Les meilleurs membres de la communauté</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-space-800/60 text-slate-400 border border-space-700/50 hover:text-white hover:border-space-600',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Time filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Time filters */}
        <div className="flex items-center gap-1 bg-space-800/60 rounded-lg p-1 border border-space-700/50">
          {TIME_FILTERS.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeFilter(tf.id)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                timeFilter === tf.id
                  ? 'bg-space-600 text-white'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-space-800/60 border border-space-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Your rank */}
      {user && !loading && (
        <YourRankCard entries={data} userId={user.id} tab={activeTab} />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="ml-3 text-slate-400">Chargement du classement...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            {searchQuery
              ? 'Aucun résultat pour cette recherche.'
              : 'Aucune donnée pour cette période.'}
          </p>
        </div>
      )}

      {/* Podium */}
      {!loading && !error && podium.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* On desktop: silver - gold - bronze order */}
          {podium.length >= 2 && (
            <div className="hidden md:block">
              <PodiumCard entry={podium[1]} rank={1} badgeLabel={currentBadge} tab={activeTab} />
            </div>
          )}
          <div className={clsx(podium.length < 2 && 'md:col-start-2')}>
            <PodiumCard entry={podium[0]} rank={0} badgeLabel={currentBadge} tab={activeTab} />
          </div>
          {podium.length >= 3 && (
            <div className="hidden md:block">
              <PodiumCard entry={podium[2]} rank={2} badgeLabel={currentBadge} tab={activeTab} />
            </div>
          )}

          {/* Mobile: show 2nd and 3rd normally */}
          {podium.length >= 2 && (
            <div className="md:hidden">
              <PodiumCard entry={podium[1]} rank={1} badgeLabel={currentBadge} tab={activeTab} />
            </div>
          )}
          {podium.length >= 3 && (
            <div className="md:hidden">
              <PodiumCard entry={podium[2]} rank={2} badgeLabel={currentBadge} tab={activeTab} />
            </div>
          )}
        </div>
      )}

      {/* Table for rank 4+ */}
      {!loading && !error && rest.length > 0 && (
        <LeaderboardTable entries={rest} startRank={4} tab={activeTab} />
      )}

      {/* Stats footer */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>{filtered.length} participant{filtered.length > 1 ? 's' : ''} classé{filtered.length > 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Mis à jour {dayjs().format('DD/MM/YYYY à HH:mm')}
          </span>
        </div>
      )}
    </div>
  );
}
