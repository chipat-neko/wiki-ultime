import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RECURRING_EVENTS, SEASONAL_EVENTS, EVENT_TYPES } from '../../datasets/events.js';
import { FACTIONS_BY_ID } from '../../datasets/factions.js';
import {
  Zap, Calendar, Clock, Users, Star, AlertTriangle,
  ChevronDown, ChevronRight, Globe, Target, Gift, Shield,
} from 'lucide-react';
import clsx from 'clsx';
import { formatNumber } from '../../utils/formatters.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calcule le statut d'un événement saisonnier par rapport au mois courant.
 * Retourne { isActive, monthsUntil }
 * - isActive: vrai si le mois courant est entre startMonth et endMonth
 * - monthsUntil: nombre de mois avant le prochain startMonth (0 = ce mois-ci)
 */
function getSeasonalStatus(event) {
  if (!event.startMonth) return { isActive: false, monthsUntil: null };
  const now = new Date();
  const m = now.getUTCMonth() + 1; // 1-12, UTC pour éviter les dépendances de timezone

  // Check if active: handle year-wrap (ex: Luminalia: 12-1)
  let isActive = false;
  if (event.startMonth <= event.endMonth) {
    isActive = m >= event.startMonth && m <= event.endMonth;
  } else {
    // Wraps over year boundary (e.g., Dec-Jan: startMonth=12, endMonth=1)
    isActive = m >= event.startMonth || m <= event.endMonth;
  }

  if (isActive) return { isActive: true, monthsUntil: 0 };

  // Calculate months until next start
  let diff = event.startMonth - m;
  if (diff <= 0) diff += 12;
  return { isActive: false, monthsUntil: diff };
}

// ─── Config ─────────────────────────────────────────────────────────────────

const DIFF_COLORS = {
  'Facile':    'badge-green',
  'Moyen':     'badge-yellow',
  'Difficile': 'badge-red',
  'Extrême':   'badge-purple',
};

const STATUS_CONFIG = {
  active:   { label: 'En cours',  badge: 'badge-green', dot: 'bg-success-400 animate-pulse' },
  inactive: { label: 'Inactif',   badge: 'badge-slate', dot: 'bg-slate-600' },
  seasonal: { label: 'Saisonnier',badge: 'badge-yellow', dot: 'bg-warning-400' },
  annual:   { label: 'Annuel',    badge: 'badge-yellow', dot: 'bg-warning-400' },
};

// ─── Recurring Event Card ────────────────────────────────────────────────────

function RecurringEventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const sc = STATUS_CONFIG[event.status] || STATUS_CONFIG.inactive;

  return (
    <div className={clsx(
      'card overflow-hidden',
      event.status === 'active' && 'border-success-500/20',
      event.systems.includes('Pyro') && 'border-orange-500/10',
    )}>
      <button
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Status dot + icon */}
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          event.status === 'active' ? 'bg-success-500/15' : 'bg-space-700/60',
        )}>
          <Zap className={clsx('w-5 h-5', event.status === 'active' ? 'text-success-400' : 'text-slate-500')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">{event.name}</span>
            <span className={clsx('badge', sc.badge)}>
              <span className={clsx('inline-block w-1.5 h-1.5 rounded-full mr-1', sc.dot)} />
              {sc.label}
            </span>
            <span className={clsx('badge', DIFF_COLORS[event.difficulty] || 'badge-slate')}>
              {event.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{event.frequency}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {event.systems.join(', ')}
            </span>
            {event.recommended.players && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />{event.recommended.players} joueurs
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-warning-400">
              {formatNumber(event.rewards.aUEC.min)}–{formatNumber(event.rewards.aUEC.max)}
            </div>
            <div className="text-xs text-slate-500">aUEC</div>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 p-4 bg-space-900/40 space-y-4">
          {/* Description */}
          <p className="text-sm text-slate-400">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Phases */}
            {event.phases?.length > 0 && (
              <div className="sm:col-span-2">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Target className="w-3 h-3" /> Phases de l'événement
                </div>
                <div className="space-y-2">
                  {event.phases.map((phase, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400 font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm text-slate-300 font-medium">{phase.name}</div>
                        <div className="text-xs text-slate-500">{phase.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {event.tips?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-warning-400" /> Conseils
                </div>
                <ul className="space-y-1">
                  {event.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-400">
                      <span className="text-warning-400 flex-shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Rewards */}
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Gift className="w-3 h-3 text-success-400" /> Récompenses
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-warning-400 font-bold">
                  {formatNumber(event.rewards.aUEC.min)} – {formatNumber(event.rewards.aUEC.max)}
                </span>
                <span className="text-slate-500 text-xs ml-1">aUEC</span>
              </div>
              {event.rewards.reputation && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-1.5 text-sm text-cyan-400">
                  Rép: {event.rewards.reputation}
                </div>
              )}
              {(event.rewards.loot || []).map(l => (
                <span key={l} className="badge badge-purple">{l}</span>
              ))}
            </div>
          </div>

          {/* Factions */}
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-slate-500 mr-1">Factions:</span>
            {event.factions.map(f => {
              const factionEntry = Object.values(FACTIONS_BY_ID).find(faction =>
                faction.name.toLowerCase().includes(f.toLowerCase()) ||
                faction.shortName?.toLowerCase() === f.toLowerCase()
              );
              return factionEntry ? (
                <button key={f} onClick={() => navigate(`/factions/${factionEntry.id}`)}
                  className="badge badge-slate text-xs hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer">
                  {f}
                </button>
              ) : (
                <span key={f} className="badge badge-slate text-xs">{f}</span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Seasonal Event Card ─────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function SeasonalCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const { isActive, monthsUntil } = getSeasonalStatus(event);

  const statusBadge = isActive
    ? { label: 'En cours', cls: 'badge-green', dot: 'bg-success-400 animate-pulse' }
    : monthsUntil === 1
    ? { label: 'Le mois prochain', cls: 'badge-cyan', dot: 'bg-cyan-400' }
    : monthsUntil !== null
    ? { label: `Dans ${monthsUntil} mois`, cls: 'badge-slate', dot: 'bg-slate-500' }
    : { label: 'Annuel', cls: 'badge-yellow', dot: 'bg-warning-400' };

  return (
    <div className={clsx('card overflow-hidden', isActive && 'border-success-500/20')}>
      <button
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          isActive ? 'bg-success-500/15' : 'bg-warning-500/15',
        )}>
          <Calendar className={clsx('w-5 h-5', isActive ? 'text-success-400' : 'text-warning-400')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">{event.name}</span>
            <span className={clsx('badge', statusBadge.cls)}>
              <span className={clsx('inline-block w-1.5 h-1.5 rounded-full mr-1', statusBadge.dot)} />
              {statusBadge.label}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />{event.period}
            {event.startMonth && (
              <span className="ml-2 text-slate-600">
                ({MONTH_NAMES[event.startMonth - 1]}{event.endMonth !== event.startMonth ? `–${MONTH_NAMES[event.endMonth - 1]}` : ''})
              </span>
            )}
          </div>
        </div>

        {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 p-4 bg-space-900/40 space-y-3">
          {isActive && (
            <div className="flex items-center gap-2 text-sm text-success-400 bg-success-500/10 border border-success-500/20 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse flex-shrink-0" />
              Cet événement est <strong className="ml-1">actuellement en cours</strong> dans le 'verse !
            </div>
          )}

          <p className="text-sm text-slate-400">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Points Forts</div>
              <ul className="space-y-1">
                {event.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-400">
                    <Star className="w-3 h-3 text-warning-400 flex-shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Récompenses Spéciales</div>
              <div className="flex flex-wrap gap-1">
                {(event.rewards.special || []).map(r => (
                  <span key={r} className="badge badge-yellow text-xs">{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Events() {
  const [activeTab, setActiveTab] = useState('recurring');
  const [filterSystem, setFilterSystem] = useState('');

  const filteredRecurring = useMemo(() => {
    if (!filterSystem) return RECURRING_EVENTS;
    return RECURRING_EVENTS.filter(e => e.systems.includes(filterSystem));
  }, [filterSystem]);

  const activeCount = RECURRING_EVENTS.filter(e => e.status === 'active').length;
  const seasonalCount = SEASONAL_EVENTS.length;
  const seasonalActiveCount = SEASONAL_EVENTS.filter(e => getSeasonalStatus(e).isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Événements</h1>
        <p className="page-subtitle">Événements dynamiques et saisonniers — Alpha 4.6</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Actifs Maintenant', value: activeCount,                                color: 'text-success-400' },
          { label: 'Événements Totaux', value: RECURRING_EVENTS.length,                   color: 'text-cyan-400' },
          { label: 'Événements Annuels', value: seasonalCount, extra: seasonalActiveCount > 0 ? `${seasonalActiveCount} en cours` : null, color: 'text-warning-400' },
          { label: 'Systèmes Concernés', value: new Set(RECURRING_EVENTS.flatMap(e => e.systems || [])).size, color: 'text-slate-400' },
        ].map(({ label, value, color, extra }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            {extra && <div className="text-xs text-success-400 mt-0.5">{extra}</div>}
          </div>
        ))}
      </div>

      {/* Active events banner */}
      {activeCount > 0 && activeTab === 'recurring' && (
        <div className="card border-success-500/30 p-3 flex items-center gap-3 bg-success-500/5">
          <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse flex-shrink-0" />
          <p className="text-sm text-success-400">
            <strong>{activeCount} événement{activeCount > 1 ? 's' : ''}</strong> en cours actuellement dans le 'verse.
          </p>
        </div>
      )}
      {seasonalActiveCount > 0 && activeTab === 'seasonal' && (
        <div className="card border-success-500/30 p-3 flex items-center gap-3 bg-success-500/5">
          <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse flex-shrink-0" />
          <p className="text-sm text-success-400">
            <strong>{seasonalActiveCount} événement{seasonalActiveCount > 1 ? 's saisonniers' : ' saisonnier'}</strong> en cours ce mois-ci !
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-space-400/20">
        {[
          { id: 'recurring', label: 'Événements Dynamiques', count: RECURRING_EVENTS.length },
          { id: 'seasonal',  label: 'Événements Saisonniers', count: SEASONAL_EVENTS.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {tab.label}
            <span className={clsx('badge text-xs', activeTab === tab.id ? 'badge-cyan' : 'badge-slate')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Recurring filters */}
      {activeTab === 'recurring' && (
        <div className="flex gap-2 flex-wrap">
          {[
            { id: '', label: `Tous (${RECURRING_EVENTS.length})` },
            { id: 'Stanton', label: `Stanton (${RECURRING_EVENTS.filter(e => e.systems.includes('Stanton')).length})` },
            { id: 'Pyro',    label: `Pyro (${RECURRING_EVENTS.filter(e => e.systems.includes('Pyro')).length})` },
          ].map(({ id, label }) => (
            <button
              key={id || 'all'}
              onClick={() => setFilterSystem(id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm transition-all',
                filterSystem === id
                  ? id === 'Pyro' ? 'bg-orange-500/20 text-orange-400' : 'bg-space-600 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'recurring' && (
        <div className="space-y-2">
          {filteredRecurring.map(e => <RecurringEventCard key={e.id} event={e} />)}
        </div>
      )}

      {activeTab === 'seasonal' && (
        <div className="space-y-2">
          {SEASONAL_EVENTS.map(e => <SeasonalCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
