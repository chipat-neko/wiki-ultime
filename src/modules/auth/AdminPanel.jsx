import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/AuthContext.jsx';
import { useAppActions } from '../../core/StateManager.jsx';
import {
  getPendingUsers, approveUser, rejectUser,
  getContributions, acceptContribution, rejectContribution,
} from '../../lib/supabase.js';
import {
  Shield, Users, CheckCircle, XCircle, Clock, AlertCircle,
  FileText, RefreshCw, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import 'dayjs/locale/fr.js';
dayjs.extend(relativeTime);
dayjs.locale('fr');

const PAGE_SIZE = 20;

const CONTRIBUTION_TYPES = {
  ship:      { label: 'Vaisseau',    color: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
  commodity: { label: 'Commodité',   color: 'text-green-400',  bg: 'bg-green-500/10'  },
  guide:     { label: 'Guide',       color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  image:     { label: 'Image',       color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  other:     { label: 'Autre',       color: 'text-slate-400',  bg: 'bg-slate-500/10'  },
};

const CONTRIB_STATUS = {
  pending:  { label: 'En attente', icon: Clock,         color: 'text-yellow-400' },
  accepted: { label: 'Accepté',    icon: CheckCircle,   color: 'text-green-400'  },
  rejected: { label: 'Refusé',     icon: XCircle,       color: 'text-red-400'    },
};

function useAdminData() {
  const [pendingUsers, setPendingUsers]     = useState([]);
  const [contributions, setContributions]  = useState([]);
  const [contribFilter, setContribFilter]  = useState('pending');
  const [loading, setLoading]              = useState(true);
  const [error, setError]                  = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [users, contribs] = await Promise.all([
        getPendingUsers(),
        getContributions(contribFilter === 'all' ? null : contribFilter),
      ]);
      setPendingUsers(users);
      setContributions(contribs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [contribFilter]); // eslint-disable-line

  return { pendingUsers, contributions, contribFilter, setContribFilter, loading, error, reload: load };
}

export default function AdminPanel() {
  const { isAdmin, isMod, loading: authLoading } = useAuth();
  const { notify } = useAppActions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [expandedContrib, setExpandedContrib] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [starsInput, setStarsInput]   = useState(5);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  // I-03: ID de la contribution en attente de confirmation de rejet
  const [pendingRejectId, setPendingRejectId] = useState(null);

  const {
    pendingUsers, contributions, contribFilter, setContribFilter,
    loading, error, reload,
  } = useAdminData();

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [contribFilter]);

  if (authLoading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isMod) {
    navigate('/tableau-de-bord');
    return null;
  }

  // I-01: toutes les erreurs utilisent notify() au lieu de alert()
  async function handleApprove(userId) {
    setActionLoading(true);
    try {
      await approveUser(userId);
      await reload();
      notify('Compte approuvé avec succès.', 'success');
    } catch (e) {
      notify('Erreur approbation : ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(userId) {
    setActionLoading(true);
    try {
      await rejectUser(userId);
      await reload();
      notify('Compte supprimé.', 'success');
    } catch (e) {
      notify('Erreur suppression : ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAcceptContrib(id) {
    setActionLoading(true);
    try {
      await acceptContribution(id, starsInput);
      await reload();
      setExpandedContrib(null);
      notify(`Contribution acceptée (+${starsInput} étoiles octroyées).`, 'success');
    } catch (e) {
      notify('Erreur acceptation : ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // I-03: premier clic → demande confirmation ; second clic → exécute le rejet
  function handleRejectContribRequest(id) {
    if (pendingRejectId === id) {
      // Confirmé — on exécute
      executeRejectContrib(id);
    } else {
      setPendingRejectId(id);
      // Auto-annulation après 5 secondes
      setTimeout(() => setPendingRejectId(prev => prev === id ? null : prev), 5000);
    }
  }

  async function executeRejectContrib(id) {
    setPendingRejectId(null);
    setActionLoading(true);
    try {
      await rejectContribution(id, rejectNote);
      await reload();
      setExpandedContrib(null);
      setRejectNote('');
      notify('Contribution refusée.', 'success');
    } catch (e) {
      notify('Erreur refus : ' + e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  const tabs = [
    { id: 'users',   label: 'Comptes en attente', icon: Users,    badge: pendingUsers.length },
    { id: 'contribs', label: 'Contributions',      icon: FileText, badge: contributions.filter(c => c.status === 'pending').length },
  ];

  // I-02: pagination côté client
  const totalPages = Math.max(1, Math.ceil(contributions.length / PAGE_SIZE));
  const pagedContribs = contributions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Panneau Admin</h1>
            <p className="text-sm text-slate-500">{isAdmin ? 'Administrateur' : 'Modérateur'}</p>
          </div>
        </div>
        <button onClick={reload} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-space-700 text-slate-300 hover:text-white text-sm transition-colors">
          <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-space-400/20">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === t.id
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Comptes en attente ─────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Chargement…</div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-slate-400">Aucun compte en attente</p>
            </div>
          ) : (
            pendingUsers.map(u => (
              <div key={u.id} className="bg-space-800 border border-space-400/20 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-space-700 border border-space-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-slate-300">{u.username?.[0]?.toUpperCase() ?? '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate">{u.username}</div>
                    <div className="text-xs text-slate-500">{u.email} · inscrit {dayjs(u.created_at).fromNow()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(u.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(u.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Contributions ──────────────────────────────────────────────────── */}
      {activeTab === 'contribs' && (
        <div className="space-y-4">
          {/* Filtre statut */}
          <div className="flex gap-2">
            {['pending', 'accepted', 'rejected', 'all'].map(f => (
              <button
                key={f}
                onClick={() => setContribFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  contribFilter === f
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-space-800 text-slate-400 hover:text-slate-200 border border-space-400/20'
                )}
              >
                {f === 'pending' ? 'En attente' : f === 'accepted' ? 'Acceptées' : f === 'rejected' ? 'Refusées' : 'Toutes'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Chargement…</div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Aucune contribution dans cette catégorie</div>
          ) : (
            <>
              {/* I-02: liste paginée */}
              {pagedContribs.map(c => {
                const typeCfg = CONTRIBUTION_TYPES[c.type] ?? CONTRIBUTION_TYPES.other;
                const statusCfg = CONTRIB_STATUS[c.status] ?? CONTRIB_STATUS.pending;
                const StatusIcon = statusCfg.icon;
                const isExpanded = expandedContrib === c.id;
                const awaitingConfirm = pendingRejectId === c.id;

                return (
                  <div key={c.id} className="bg-space-800 border border-space-400/20 rounded-xl overflow-hidden">
                    {/* En-tête contribution */}
                    <div className="flex items-center justify-between p-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium flex-shrink-0', typeCfg.bg, typeCfg.color)}>
                          {typeCfg.label}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">{c.title}</div>
                          <div className="text-xs text-slate-500">
                            par <span className="text-slate-300">{c.profiles?.username ?? 'Inconnu'}</span>
                            {' · '}{dayjs(c.created_at).fromNow()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={clsx('flex items-center gap-1 text-xs', statusCfg.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusCfg.label}
                        </div>
                        <button
                          onClick={() => setExpandedContrib(isExpanded ? null : c.id)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Détail expandable */}
                    {isExpanded && (
                      <div className="border-t border-space-400/20 p-4 space-y-4">
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1">Description</div>
                          <p className="text-sm text-slate-300">{c.description || '—'}</p>
                        </div>
                        {c.content && (
                          <div>
                            <div className="text-xs font-medium text-slate-500 mb-1">Données</div>
                            <pre className="text-xs text-slate-400 bg-space-900 rounded-lg p-3 overflow-x-auto">
                              {JSON.stringify(c.content, null, 2)}
                            </pre>
                          </div>
                        )}

                        {c.status === 'pending' && (
                          <div className="flex items-end gap-3 pt-2 border-t border-space-400/10">
                            <div className="flex-1 space-y-1">
                              <label className="text-xs text-slate-500">Note de refus (optionnel)</label>
                              <input
                                type="text"
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                placeholder="Raison du refus…"
                                className="w-full bg-space-900 border border-space-400/20 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-slate-500">Étoiles à octroyer</label>
                              <input
                                type="number"
                                min={1} max={20}
                                value={starsInput}
                                onChange={e => setStarsInput(Number(e.target.value))}
                                className="w-20 bg-space-900 border border-space-400/20 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/40 text-center"
                              />
                            </div>
                            <button
                              onClick={() => handleAcceptContrib(c.id)}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-sm transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accepter
                            </button>
                            {/* I-03: bouton refus à double confirmation */}
                            <button
                              onClick={() => handleRejectContribRequest(c.id)}
                              disabled={actionLoading}
                              className={clsx(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                                awaitingConfirm
                                  ? 'bg-red-500/30 border border-red-500/60 text-red-300 font-semibold'
                                  : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                              )}
                            >
                              <XCircle className="w-4 h-4" />
                              {awaitingConfirm ? 'Confirmer le refus ?' : 'Refuser'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* I-02: pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    {contributions.length} contribution{contributions.length > 1 ? 's' : ''} · page {page}/{totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg bg-space-800 border border-space-400/20 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pg = page <= 3 ? i + 1 : page + i - 2;
                      if (pg < 1 || pg > totalPages) return null;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={clsx(
                            'w-8 h-8 rounded-lg text-sm transition-colors',
                            pg === page
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-space-800 border border-space-400/20 text-slate-400 hover:text-white'
                          )}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg bg-space-800 border border-space-400/20 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
