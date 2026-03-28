import React, { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import {
  Clock, Zap, Coffee, Rocket, Trophy,
  CheckSquare, Square, BarChart3, Trash2,
  Lightbulb, TrendingUp, Target, RotateCcw,
  PlusCircle, Star, FileText, Flame,
  CalendarCheck,
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const DURATIONS = [
  { id: '30min',  label: '30 minutes', sub: 'Express',  icon: Zap,    color: 'text-yellow-400', border: 'border-yellow-400/40', bg: 'bg-yellow-400/10' },
  { id: '1h',     label: '1 heure',    sub: 'Standard', icon: Clock,  color: 'text-cyan-400',   border: 'border-cyan-400/40',   bg: 'bg-cyan-400/10' },
  { id: '2h',     label: '2 heures',   sub: 'Étendue',  icon: Coffee, color: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10' },
  { id: '3h+',    label: '3h+',        sub: 'Marathon', icon: Rocket, color: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-400/10' },
];

const ACTIVITIES = {
  '30min': [
    { id: 'exp-1', label: 'Livraison rapide (delivery mission)', reward: '8-15K aUEC' },
    { id: 'exp-2', label: 'Bunker Tier 1', reward: '15K aUEC' },
    { id: 'exp-3', label: 'Achat/vente rapide (1 commodity run)', reward: '10-20K aUEC' },
    { id: 'exp-4', label: 'Minage orbital rapide (1-2 roches)', reward: '10-30K aUEC' },
    { id: 'exp-5', label: 'Bounty simple (1 cible ERT)', reward: '25K aUEC' },
    { id: 'exp-6', label: 'Collecte de loot en station (vente surplus)', reward: '5-10K aUEC' },
    { id: 'exp-7', label: 'Course de livraison urgente', reward: '12-20K aUEC' },
  ],
  '1h': [
    { id: 'std-1', label: '2-3 bunker missions (Tier 1-2)', reward: '30-60K aUEC' },
    { id: 'std-2', label: 'Route commerce aller-retour', reward: '20-50K aUEC' },
    { id: 'std-3', label: 'Session minage complète', reward: '50-100K aUEC' },
    { id: 'std-4', label: 'Bounty hunting (3-5 cibles)', reward: '40-75K aUEC' },
    { id: 'std-5', label: 'Exploration (1 système, scanner POIs)', reward: 'variable' },
    { id: 'std-6', label: 'Salvage run (1-2 épaves)', reward: '40-80K aUEC' },
    { id: 'std-7', label: 'Mission investigation (delivery data)', reward: '20-35K aUEC' },
    { id: 'std-8', label: 'Contrebande run rapide (Grim HEX)', reward: '30-60K aUEC' },
    { id: 'std-9', label: 'Crafting session (farming matériaux)', reward: 'variable' },
  ],
  '2h': [
    { id: 'ext-1', label: 'Chaîne de bunkers Tier 2-3', reward: '90-150K aUEC' },
    { id: 'ext-2', label: 'Circuit commerce multi-stop', reward: '80-200K aUEC' },
    { id: 'ext-3', label: 'Minage + raffinerie cycle complet', reward: '150-300K aUEC' },
    { id: 'ext-4', label: 'Bounty chain (certifications)', reward: '100-200K aUEC' },
    { id: 'ext-5', label: 'Mission narrative complète', reward: '30-60K + rep' },
    { id: 'ext-6', label: 'Salvage session', reward: '80-150K aUEC' },
    { id: 'ext-7', label: 'Prison break (si CS actif, escape + rebuild)', reward: '0 aUEC mais nécessaire' },
    { id: 'ext-8', label: 'Exploration grottes (Hadanite mining FPS)', reward: '50-100K aUEC' },
    { id: 'ext-9', label: 'Org event / groupe PvP', reward: 'variable + rep' },
    { id: 'ext-10', label: 'Multi-crew bounty (avec tourelleur)', reward: '150-250K aUEC' },
  ],
  '3h+': [
    { id: 'mar-1', label: 'Tout ce qui précède + objectifs long terme', reward: '' },
    { id: 'mar-2', label: 'Grind réputation faction', reward: 'rank up' },
    { id: 'mar-3', label: 'Exploration Pyro (jump point + découverte)', reward: 'variable' },
    { id: 'mar-4', label: 'Event participation', reward: 'variable' },
    { id: 'mar-5', label: 'Org operations / groupe', reward: 'variable' },
    { id: 'mar-6', label: 'Fleet management & loadout optimization', reward: '0 aUEC mais productif' },
    { id: 'mar-7', label: 'Full Pyro exploration (jump + découverte + survie)', reward: 'variable' },
    { id: 'mar-8', label: 'Grind Certification Bounty (LRT→ERT)', reward: '200-400K aUEC' },
    { id: 'mar-9', label: 'Commerce multi-système (Stanton + Pyro)', reward: '300-500K aUEC' },
    { id: 'mar-10', label: 'Base building / homestead', reward: '0 aUEC mais progression' },
  ],
};

const DAILY_TIPS = [
  [
    'Vérifiez toujours le statut serveur avant de planifier une session commerce.',
    'Les bunkers Tier 1 sont parfaits pour s\'échauffer en début de session.',
    'Pensez à vider votre inventaire local avant de partir en mission longue.',
    'Le claim de vaisseau prend du temps — préparez votre ship avant de vous connecter.',
    'Les serveurs sont souvent plus stables en milieu de semaine.',
  ],
  [
    'Faites un run de livraison rapide pour financer votre session.',
    'Les bounties VHRT offrent le meilleur ratio temps/gains une fois certifié.',
    'Gardez toujours un medpen et un multi-tool sur vous.',
    'Le minage de Quantanium est risqué mais très lucratif — prévoyez un plan B.',
    'Rejoindre un groupe multiplie les gains et réduit les risques.',
  ],
  [
    'Les routes commerce Stanton sont plus sûres que Pyro pour les débutants.',
    'Vérifiez les prix sur les terminaux avant d\'acheter en gros.',
    'Un bon loadout fait la différence en bunker — investissez dans votre armure.',
    'La raffinerie prend du temps réel — lancez-la en début de session.',
    'Sauvegardez vos routes préférées dans le planificateur de routes.',
  ],
  [
    'Les missions de réputation débloquent des contrats mieux payés.',
    'Explorez les POIs peu visités pour trouver du loot rare.',
    'En groupe, désignez un pilote et un tireur pour les bounties.',
    'Le salvage est sous-estimé — les marges sont excellentes.',
    'Faites attention au crimestat : une erreur peut ruiner votre session.',
  ],
  [
    'Le week-end, les serveurs sont plus peuplés — attention aux griefers.',
    'Planifiez vos objectifs avant de vous connecter pour gagner du temps.',
    'Les événements saisonniers offrent des récompenses exclusives.',
    'Un vaisseau bien équipé vaut mieux qu\'un vaisseau cher.',
    'N\'oubliez pas de réclamer vos récompenses de réputation quotidiennes.',
  ],
  [
    'Alternez entre combat et commerce pour varier votre session.',
    'Les jump points vers Pyro sont dangereux — préparez-vous bien.',
    'Utilisez le scanner régulièrement pour repérer les menaces.',
    'Le bed logout permet de reprendre exactement où vous étiez.',
    'Investissez dans un bon quantum drive pour réduire vos temps de trajet.',
  ],
  [
    'Dimanche est idéal pour les longues sessions d\'exploration.',
    'Profitez du calme pour faire du minage en zone contestée.',
    'Organisez votre inventaire et vendez le surplus accumulé.',
    'Testez de nouveaux vaisseaux en location avant d\'acheter.',
    'Revoyez vos objectifs de la semaine et planifiez la suivante.',
  ],
];

const STORAGE_KEY = 'sc_session_planner';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { checked: {}, earnings: [], selectedDuration: null };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ─── WEEKLY GOALS ─────────────────────────────────────────────────────────────

const WEEKLY_GOALS_KEY = 'sc_weekly_goals';
const SESSION_NOTES_KEY = 'sc_session_notes';

const WEEKLY_GOALS = [
  { id: 'wg-1', label: 'Gagner 500K+ aUEC total' },
  { id: 'wg-2', label: 'Compléter 10+ missions' },
  { id: 'wg-3', label: 'Visiter un nouveau système/planète' },
  { id: 'wg-4', label: 'Partager un build ou article' },
  { id: 'wg-5', label: 'Jouer en groupe au moins 1 fois' },
];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function loadWeeklyGoals() {
  try {
    const raw = localStorage.getItem(WEEKLY_GOALS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const currentWeek = getMonday(new Date());
      if (data.week === currentWeek) return data;
    }
  } catch { /* ignore */ }
  return { week: getMonday(new Date()), checked: {} };
}

function saveWeeklyGoals(state) {
  try {
    localStorage.setItem(WEEKLY_GOALS_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function loadSessionNotes() {
  try {
    const raw = localStorage.getItem(SESSION_NOTES_KEY);
    if (raw) return raw;
  } catch { /* ignore */ }
  return '';
}

function saveSessionNotes(text) {
  try {
    localStorage.setItem(SESSION_NOTES_KEY, text);
  } catch { /* ignore */ }
}

function calcStreak(earnings) {
  if (!earnings || earnings.length === 0) return 0;

  // Collect unique dates (YYYY-MM-DD) from earnings
  const dateSet = new Set();
  earnings.forEach((e) => {
    const d = new Date(e.date);
    dateSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  });

  const sortedDates = [...dateSet].sort().reverse();
  if (sortedDates.length === 0) return 0;

  // Check if today or yesterday is in the set (to allow ongoing streak)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const curr = new Date(sortedDates[i]);
    const prev = new Date(sortedDates[i + 1]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function SessionPlanner() {
  const [persisted, setPersisted] = useState(loadState);
  const [selectedDuration, setSelectedDuration] = useState(persisted.selectedDuration);
  const [checked, setChecked] = useState(persisted.checked || {});
  const [earnings, setEarnings] = useState(persisted.earnings || []);
  const [earningInput, setEarningInput] = useState('');
  const [sessionNotes, setSessionNotes] = useState(loadSessionNotes);
  const [weeklyGoals, setWeeklyGoals] = useState(loadWeeklyGoals);

  // Persist on change
  useEffect(() => {
    saveState({ checked, earnings, selectedDuration });
  }, [checked, earnings, selectedDuration]);

  // Persist session notes
  useEffect(() => {
    saveSessionNotes(sessionNotes);
  }, [sessionNotes]);

  // Persist weekly goals
  useEffect(() => {
    saveWeeklyGoals(weeklyGoals);
  }, [weeklyGoals]);

  // Streak counter
  const streak = useMemo(() => calcStreak(earnings), [earnings]);

  // Weekly goals toggle
  const toggleWeeklyGoal = useCallback((id) => {
    setWeeklyGoals((prev) => ({
      ...prev,
      checked: { ...prev.checked, [id]: !prev.checked[id] },
    }));
  }, []);

  const weeklyGoalsDone = useMemo(
    () => WEEKLY_GOALS.filter((g) => weeklyGoals.checked[g.id]).length,
    [weeklyGoals]
  );

  // Toggle checkbox
  const toggle = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Earnings
  const addEarning = () => {
    const val = parseInt(earningInput, 10);
    if (!val || val <= 0) return;
    const entry = { amount: val, date: new Date().toISOString() };
    setEarnings((prev) => [...prev.slice(-6), entry]); // keep last 7
    setEarningInput('');
  };

  const resetEarnings = () => setEarnings([]);

  const totalEarnings = useMemo(() => earnings.reduce((s, e) => s + e.amount, 0), [earnings]);
  const maxEarning = useMemo(() => Math.max(...earnings.map((e) => e.amount), 1), [earnings]);

  // Progress
  const currentActivities = selectedDuration ? ACTIVITIES[selectedDuration] : [];
  const checkedCount = currentActivities.filter((a) => checked[a.id]).length;
  const progressPct = currentActivities.length > 0
    ? Math.round((checkedCount / currentActivities.length) * 100)
    : 0;

  // Daily tip
  const dayOfWeek = new Date().getDay();
  const todayTips = DAILY_TIPS[dayOfWeek];

  // All activities for total progress
  const allActivities = Object.values(ACTIVITIES).flat();
  const allChecked = allActivities.filter((a) => checked[a.id]).length;
  const allPct = allActivities.length > 0
    ? Math.round((allChecked / allActivities.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Target className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Planificateur de Session</h1>
          <p className="text-slate-400 text-sm">
            Optimisez votre temps de jeu avec des activités adaptées à votre durée de session
          </p>
        </div>
      </div>

      {/* Duration Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DURATIONS.map((d) => {
          const Icon = d.icon;
          const active = selectedDuration === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDuration(active ? null : d.id)}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all text-left',
                active
                  ? `${d.border} ${d.bg} ring-1 ring-white/10`
                  : 'border-space-400/20 bg-space-800/50 hover:border-space-400/40'
              )}
            >
              <Icon className={clsx('w-6 h-6 mb-2', active ? d.color : 'text-slate-500')} />
              <div className={clsx('font-semibold', active ? 'text-white' : 'text-slate-300')}>
                {d.label}
              </div>
              <div className={clsx('text-xs', active ? d.color : 'text-slate-500')}>
                {d.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* Activities Checklist */}
      {selectedDuration && (
        <div className="bg-space-800/50 border border-space-400/20 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              Activités recommandées
              <span className="text-sm font-normal text-slate-400">
                — {DURATIONS.find((d) => d.id === selectedDuration)?.label}
              </span>
            </h2>
            <span className={clsx(
              'text-sm font-medium px-2 py-0.5 rounded',
              progressPct === 100 ? 'bg-success-400/20 text-success-400' : 'bg-space-700 text-slate-400'
            )}>
              {checkedCount}/{currentActivities.length}
            </span>
          </div>

          <div className="space-y-2">
            {currentActivities.map((activity) => {
              const isChecked = !!checked[activity.id];
              return (
                <button
                  key={activity.id}
                  onClick={() => toggle(activity.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    isChecked
                      ? 'border-success-400/30 bg-success-400/5'
                      : 'border-space-400/10 bg-space-900/30 hover:border-space-400/30'
                  )}
                >
                  {isChecked
                    ? <CheckSquare className="w-5 h-5 text-success-400 shrink-0" />
                    : <Square className="w-5 h-5 text-slate-600 shrink-0" />
                  }
                  <span className={clsx(
                    'flex-1 text-sm',
                    isChecked ? 'text-slate-400 line-through' : 'text-slate-200'
                  )}>
                    {activity.label}
                  </span>
                  {activity.reward && (
                    <span className={clsx(
                      'text-xs font-mono shrink-0',
                      isChecked ? 'text-slate-600' : 'text-yellow-400/80'
                    )}>
                      {activity.reward}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-4 border-t border-space-400/10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Progression de la session</span>
              <span className={clsx(
                'font-semibold',
                progressPct === 100 ? 'text-success-400' : 'text-cyan-400'
              )}>
                {progressPct}%
              </span>
            </div>
            <div className="h-2 bg-space-900 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  progressPct === 100 ? 'bg-success-400' : 'bg-cyan-500'
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Daily Tips */}
      <div className="bg-space-800/50 border border-space-400/20 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Conseils du jour
        </h2>
        <div className="space-y-3">
          {todayTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-space-900/40 border border-space-400/10">
              <Star className="w-4 h-4 text-yellow-400/60 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Tracker */}
      <div className="bg-space-800/50 border border-space-400/20 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Suivi des gains
          </h2>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
              <Flame className="w-4 h-4" />
              Série : {streak} jour{streak > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder="Gains de la session (aUEC)"
            value={earningInput}
            onChange={(e) => setEarningInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEarning()}
            className="flex-1 px-3 py-2 rounded-lg bg-space-900 border border-space-400/20 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={addEarning}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter
          </button>
          <button
            onClick={resetEarnings}
            className="px-3 py-2 rounded-lg bg-space-700 hover:bg-space-600 text-slate-400 hover:text-white text-sm transition-colors"
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-slate-400 text-sm">Total cumulé</span>
          <span className="text-lg font-bold text-green-400">
            {totalEarnings.toLocaleString('fr-FR')} aUEC
          </span>
        </div>

        {/* Mini bar chart */}
        {earnings.length > 0 ? (
          <div className="flex items-end gap-2 h-28 px-1">
            {earnings.map((entry, i) => {
              const pct = Math.max(5, (entry.amount / maxEarning) * 100);
              const date = new Date(entry.date);
              const label = `${date.getDate()}/${date.getMonth() + 1}`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {entry.amount >= 1000
                      ? `${Math.round(entry.amount / 1000)}K`
                      : entry.amount}
                  </span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-300"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[10px] text-slate-600">{label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-600 text-sm">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Aucune session enregistrée
          </div>
        )}
      </div>

      {/* Session Notes */}
      <div className="bg-space-800/50 border border-space-400/20 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-400" />
          Résumé de la Session
        </h2>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Notez vos observations : activités réalisées, bugs rencontrés, objectifs atteints, idées pour la prochaine session..."
          rows={5}
          className="w-full px-4 py-3 rounded-lg bg-space-900 border border-space-400/20 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-y"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-600">
            Sauvegardé automatiquement en local
          </span>
          {sessionNotes.length > 0 && (
            <button
              onClick={() => setSessionNotes('')}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="bg-space-800/50 border border-space-400/20 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-purple-400" />
            Objectifs Hebdomadaires
          </h2>
          <span className={clsx(
            'text-sm font-medium px-2 py-0.5 rounded',
            weeklyGoalsDone === WEEKLY_GOALS.length
              ? 'bg-success-400/20 text-success-400'
              : 'bg-space-700 text-slate-400'
          )}>
            {weeklyGoalsDone}/{WEEKLY_GOALS.length}
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Réinitialisation automatique chaque lundi. Semaine du {new Date(weeklyGoals.week).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.
        </p>

        <div className="space-y-2">
          {WEEKLY_GOALS.map((goal) => {
            const isChecked = !!weeklyGoals.checked[goal.id];
            return (
              <button
                key={goal.id}
                onClick={() => toggleWeeklyGoal(goal.id)}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                  isChecked
                    ? 'border-purple-400/30 bg-purple-400/5'
                    : 'border-space-400/10 bg-space-900/30 hover:border-space-400/30'
                )}
              >
                {isChecked
                  ? <CheckSquare className="w-5 h-5 text-purple-400 shrink-0" />
                  : <Square className="w-5 h-5 text-slate-600 shrink-0" />
                }
                <span className={clsx(
                  'text-sm',
                  isChecked ? 'text-slate-400 line-through' : 'text-slate-200'
                )}>
                  {goal.label}
                </span>
              </button>
            );
          })}
        </div>

        {weeklyGoalsDone === WEEKLY_GOALS.length && (
          <p className="text-center text-purple-400 text-sm mt-4 font-medium">
            Tous les objectifs de la semaine sont atteints ! Bravo !
          </p>
        )}
      </div>

      {/* Global Progress */}
      <div className="bg-space-800/50 border border-space-400/20 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Progression globale
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {DURATIONS.map((d) => {
            const acts = ACTIVITIES[d.id];
            const done = acts.filter((a) => checked[a.id]).length;
            const pct = Math.round((done / acts.length) * 100);
            const Icon = d.icon;
            return (
              <div key={d.id} className="bg-space-900/50 rounded-lg p-3 border border-space-400/10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={clsx('w-4 h-4', d.color)} />
                  <span className="text-xs text-slate-400">{d.sub}</span>
                </div>
                <div className="text-lg font-bold text-white">{done}/{acts.length}</div>
                <div className="h-1.5 bg-space-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      pct === 100 ? 'bg-success-400' : 'bg-cyan-500/70'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Complétion totale</span>
          <span className={clsx(
            'font-bold text-lg',
            allPct === 100 ? 'text-success-400' : 'text-cyan-400'
          )}>
            {allPct}%
          </span>
        </div>
        <div className="h-3 bg-space-900 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              allPct === 100
                ? 'bg-gradient-to-r from-yellow-400 to-success-400'
                : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
            )}
            style={{ width: `${allPct}%` }}
          />
        </div>
        {allPct === 100 && (
          <p className="text-center text-yellow-400 text-sm mt-3 font-medium">
            Toutes les activités sont complétées ! Session parfaite !
          </p>
        )}
      </div>
    </div>
  );
}
