import React, { useState, useMemo } from 'react';
import {
  Zap, Shield, AlertTriangle, Clock, Calendar, TrendingUp,
  Bell, BellOff, Activity, Target, ChevronDown, ChevronUp,
  Info, Star, BarChart3, Search, X, History,
  Flame, ShieldAlert, Radio, Crosshair,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Données ─────────────────────────────────────────────────────────────────

const ECONOMY_EVENTS = [
  { id: 'xenothreat', name: 'Xenothreat', type: 'defense', status: 'recurring',
    frequency: 'Mensuel', duration: '~3 jours', location: 'Stanton', icon: 'Shield', color: 'cyan',
    description: 'Incursion Xenothreat — convois de ravitaillement à défendre. Forte demande en fournitures médicales et militaires.',
    impacts: [
      { commodity: 'Medical Supplies', change: +35 }, { commodity: 'Stims', change: +20 },
      { commodity: 'Titanium', change: +15 }, { commodity: 'Hydrogen', change: +10 },
      { commodity: 'Waste', change: -25 },
    ],
    tips: ['Stocker des fournitures médicales avant l\'event', 'Le Titanium monte grâce à la demande militaire', 'Utiliser un vaisseau armé pour les convois (bonus de paiement)'],
    history: [{ date: '2950-02-15', swing: '+32% Medical Supplies', outcome: 'Victoire UEE' }, { date: '2950-09-10', swing: '+28% Stims', outcome: 'Victoire UEE' }],
  },
  { id: 'jumptown', name: 'Jumptown', type: 'illegal', status: 'recurring',
    frequency: 'Bi-mensuel', duration: '~2 jours', location: 'Yela (Stanton)', icon: 'Flame', color: 'purple',
    description: 'Course aux drogues illégales à Jumptown. Les prix de la Maze, du Neon et du Slam explosent.',
    impacts: [
      { commodity: 'Maze', change: +80 }, { commodity: 'Neon', change: +60 },
      { commodity: 'Slam', change: +45 }, { commodity: 'Altruciatoxin', change: +30 },
      { commodity: 'Agricultural Supplies', change: -10 },
    ],
    tips: ['Très risqué — PvP intense autour de Jumptown', 'Prévoir une escorte ou un vaisseau rapide', 'Vendre à GrimHEX pour meilleur prix'],
    history: [{ date: '2950-03-01', swing: '+85% Maze', outcome: 'Chaos PvP' }, { date: '2950-10-20', swing: '+90% Maze', outcome: 'Record de ventes' }],
  },
  { id: 'ninetails-lockdown', name: 'NineTails Lockdown', type: 'blockade', status: 'recurring',
    frequency: 'Hebdomadaire', duration: '~1 jour', location: 'Variable (Stanton)', icon: 'ShieldAlert', color: 'red',
    description: 'Blocus d\'une station par les NineTails. Approvisionnement coupé, prix en hausse dans la zone.',
    impacts: [
      { commodity: 'Medical Supplies', change: +25 }, { commodity: 'Food', change: +20 },
      { commodity: 'Hydrogen', change: +15 }, { commodity: 'Quantanium', change: -30 },
      { commodity: 'Laranite', change: -15 },
    ],
    tips: ['Éviter la zone bloquée sauf avec escorte', 'Les fournitures médicales montent — bon moment pour livrer', 'Participer au déblocage rapporte crédits et réputation'],
    history: [{ date: '2950-01-10', swing: '+22% Medical Supplies', outcome: 'Lockdown levé en 18h' }, { date: '2950-08-05', swing: '-35% Quantanium', outcome: 'Échec défenseurs' }],
  },
  { id: 'ninetails-sabotage', name: 'NineTails Sabotage', type: 'sabotage', status: 'recurring',
    frequency: 'Bi-hebdomadaire', duration: '~12 heures', location: 'Comm Arrays (Stanton)', icon: 'Radio', color: 'orange',
    description: 'Sabotage des Comm Arrays — instabilité des prix, augmentation du crime et difficulté de scan.',
    impacts: [
      { commodity: 'E\'tam', change: +15 }, { commodity: 'Slam', change: +20 },
      { commodity: 'WiDoW', change: +25 }, { commodity: 'Processed Food', change: -10 },
    ],
    tips: ['Le marché noir profite de l\'absence de surveillance', 'Drogues illégales en hausse — opportunité contrebandiers', 'Réparer les Comm Arrays rapporte réputation Advocacy'],
    history: [{ date: '2950-02-28', swing: '+22% WiDoW', outcome: 'Arrays restaurés en 8h' }],
  },
  { id: 'siege-orison', name: 'Siege of Orison', type: 'siege', status: 'recurring',
    frequency: 'Mensuel', duration: '~2 jours', location: 'Orison (Crusader)', icon: 'Crosshair', color: 'amber',
    description: 'Siège d\'Orison par les NineTails. Forte demande médicale et perturbation du commerce Crusader.',
    impacts: [
      { commodity: 'Medical Supplies', change: +40 }, { commodity: 'Oxygen', change: +25 },
      { commodity: 'Food', change: +30 }, { commodity: 'Hydrogen', change: +20 }, { commodity: 'Quantanium', change: -20 },
    ],
    tips: ['Livrer du médical à Orison rapporte gros', 'Le Quantanium de Crusader chute — miner dans ArcCorp', 'Combat FPS intense — apporter armure et médipens'],
    history: [{ date: '2950-03-18', swing: '+45% Medical Supplies', outcome: 'Orison libéré' }],
  },
  { id: 'dynamic-supply', name: 'Dynamic Supply Shift', type: 'market', status: 'passive',
    frequency: 'Continu', duration: 'Variable', location: 'Tout Stanton', icon: 'Activity', color: 'teal',
    description: 'Fluctuations dynamiques de l\'offre et la demande liées à l\'activité des joueurs et aux cycles serveur.',
    impacts: [
      { commodity: 'Laranite', change: +12 }, { commodity: 'Titanium', change: -8 },
      { commodity: 'Agricium', change: +10 }, { commodity: 'Diamond', change: +7 },
    ],
    tips: ['Surveiller les prix en temps réel via les terminaux', 'Les prix se rééquilibrent après ~30 min sans activité', 'Diversifier les commodités pour lisser les variations'],
    history: [{ date: '2950-01-01', swing: '+15% Laranite (pic)', outcome: 'Cycle normal' }],
  },
  { id: 'pyro-gateway', name: 'Pyro Gateway Rush', type: 'exploration', status: 'recurring',
    frequency: 'Après patch', duration: '~1 semaine', location: 'Pyro (Jump Point)', icon: 'Flame', color: 'orange',
    description: 'Afflux de joueurs vers Pyro après chaque mise à jour. Demande en carburant et fournitures explose.',
    impacts: [
      { commodity: 'Hydrogen', change: +40 }, { commodity: 'Quantanium', change: +25 },
      { commodity: 'Medical Supplies', change: +20 }, { commodity: 'Stims', change: +15 },
    ],
    tips: ['Stocker du Hydrogen avant l\'ouverture de Pyro', 'Les Starfarer font fortune en ravitaillement', 'Vendre des fournitures médicales aux avant-postes Pyro'],
    history: [{ date: '2950-04-01', swing: '+45% Hydrogen', outcome: 'Rush massif 5j' }],
  },
  { id: 'invictus-week', name: 'Invictus Launch Week', type: 'commercial', status: 'seasonal',
    frequency: 'Annuel (Mai)', duration: '~10 jours', location: 'Tout Stanton', icon: 'Star', color: 'gold',
    description: 'Semaine Invictus — exposition militaire et ventes de vaisseaux. Afflux de nouveaux joueurs.',
    impacts: [
      { commodity: 'Titanium', change: +20 }, { commodity: 'Hydrogen', change: +15 },
      { commodity: 'Medical Supplies', change: +10 }, { commodity: 'Food', change: +12 },
    ],
    tips: ['Nouveaux joueurs = forte demande de base', 'Le Titanium monte avec les démos militaires', 'Excellent moment pour vendre des ressources stockées'],
    history: [{ date: '2950-05-20', swing: '+18% Titanium', outcome: 'Affluence record' }],
  },
];

const EVENT_COLORS = {
  cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   text: 'text-cyan-400',   dot: 'bg-cyan-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   text: 'text-teal-400',   dot: 'bg-teal-400' },
  gold:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
};

const ICON_MAP = { Shield, Flame, ShieldAlert, Radio, Crosshair, Activity, Star };
const TYPE_LABELS = { defense: 'Défense', illegal: 'Illégal', blockade: 'Blocus', sabotage: 'Sabotage', siege: 'Siège', market: 'Marché', exploration: 'Exploration', commercial: 'Commercial' };
const TABS = [
  { id: 'active', label: 'Événements Actifs', icon: Zap },
  { id: 'matrix', label: "Matrice d'Impact", icon: BarChart3 },
  { id: 'simulator', label: 'Simulateur', icon: TrendingUp },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
];
const ALERTS_KEY = 'sc_economy_alerts';
function loadAlerts() { try { return JSON.parse(localStorage.getItem(ALERTS_KEY)) || []; } catch { return []; } }

// ─── Sous-composants ─────────────────────────────────────────────────────────

function EventCard({ event, alerts, toggleAlert }) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const c = EVENT_COLORS[event.color] || EVENT_COLORS.cyan;
  const Icon = ICON_MAP[event.icon] || Zap;
  const alerted = alerts.includes(event.id);

  return (
    <div className={clsx('card overflow-hidden transition-all', c.border)}>
      <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors" onClick={() => setExpanded(e => !e)}>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
          <Icon size={20} className={c.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-200">{event.name}</h3>
            <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', c.bg, c.text)}>{TYPE_LABELS[event.type]}</span>
            {event.status === 'passive' && <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-500/15 text-teal-400">Passif</span>}
          </div>
          <p className="text-sm text-slate-400 truncate mt-0.5">{event.location} — {event.frequency}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); toggleAlert(event.id); }}
            className={clsx('p-1.5 rounded-lg transition-colors', alerted ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300')}
            title={alerted ? 'Désactiver l\'alerte' : 'Activer l\'alerte'}>
            {alerted ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-space-600/50">
          <p className="text-sm text-slate-300 mt-3">{event.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Clock size={12} /> {event.duration}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {event.frequency}</span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Impact sur les prix</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {event.impacts.map(imp => (
                <div key={imp.commodity} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-space-800/60">
                  <span className="text-sm text-slate-300">{imp.commodity}</span>
                  <span className={clsx('text-sm font-semibold', imp.change > 0 ? 'text-green-400' : 'text-red-400')}>
                    {imp.change > 0 ? '+' : ''}{imp.change}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conseils de trading</h4>
            <ul className="space-y-1">
              {event.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Target size={12} className="text-cyan-500 mt-1 flex-shrink-0" />{tip}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => setShowHistory(h => !h)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            <History size={12} />{showHistory ? 'Masquer l\'historique' : 'Voir l\'historique'}
          </button>
          {showHistory && event.history.length > 0 && (
            <div className="space-y-1.5">
              {event.history.map((h, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-space-800/40 text-xs">
                  <span className="text-slate-500 font-mono">{h.date}</span>
                  <span className="text-green-400 font-medium">{h.swing}</span>
                  <span className="text-slate-400 ml-auto">{h.outcome}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ImpactMatrix() {
  const allCommodities = useMemo(() => {
    const set = new Set();
    ECONOMY_EVENTS.forEach(ev => ev.impacts.forEach(imp => set.add(imp.commodity)));
    return [...set].sort();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-space-600">
            <th className="text-left py-2 px-3 text-slate-400 font-medium sticky left-0 bg-space-900 z-10">Commodité</th>
            {ECONOMY_EVENTS.map(ev => (
              <th key={ev.id} className="py-2 px-2 text-center">
                <span className={clsx('text-xs font-medium', (EVENT_COLORS[ev.color] || EVENT_COLORS.cyan).text)}>{ev.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allCommodities.map(commodity => (
            <tr key={commodity} className="border-b border-space-700/40 hover:bg-space-800/30">
              <td className="py-2 px-3 text-slate-300 font-medium sticky left-0 bg-space-900 z-10">{commodity}</td>
              {ECONOMY_EVENTS.map(ev => {
                const imp = ev.impacts.find(i => i.commodity === commodity);
                if (!imp) return <td key={ev.id} className="py-2 px-2 text-center text-slate-600">—</td>;
                return (
                  <td key={ev.id} className="py-2 px-2 text-center">
                    <span className={clsx('inline-block px-2 py-0.5 rounded text-xs font-bold',
                      imp.change > 20 ? 'bg-green-500/20 text-green-400' : imp.change > 0 ? 'bg-green-500/10 text-green-300' :
                      imp.change < -20 ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-300',
                    )}>{imp.change > 0 ? '+' : ''}{imp.change}%</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Simulator() {
  const [selectedEvent, setSelectedEvent] = useState(ECONOMY_EVENTS[0].id);
  const [basePrice, setBasePrice] = useState(10);
  const event = ECONOMY_EVENTS.find(ev => ev.id === selectedEvent);

  const projections = useMemo(() => {
    if (!event) return [];
    return event.impacts.map(imp => ({
      commodity: imp.commodity, change: imp.change,
      projected: Math.round(basePrice * (1 + imp.change / 100) * 100) / 100,
      delta: Math.round(basePrice * (imp.change / 100) * 100) / 100,
    }));
  }, [event, basePrice]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1.5">Événement</label>
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
            className="w-full bg-space-800 border border-space-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500">
            {ECONOMY_EVENTS.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs text-slate-400 mb-1.5">Prix de base (aUEC/u)</label>
          <input type="number" min={1} value={basePrice} onChange={e => setBasePrice(Math.max(1, Number(e.target.value)))}
            className="w-full bg-space-800 border border-space-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        </div>
      </div>
      {event && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className={(EVENT_COLORS[event.color] || EVENT_COLORS.cyan).text} />
            <h3 className="font-semibold text-slate-200">{event.name}</h3>
            <span className="text-xs text-slate-400">— {event.duration}</span>
          </div>
          <div className="space-y-2">
            {projections.map(p => (
              <div key={p.commodity} className="flex items-center gap-3">
                <span className="w-40 text-sm text-slate-300 truncate flex-shrink-0">{p.commodity}</span>
                <div className="flex-1 h-6 bg-space-700/40 rounded-full overflow-hidden relative">
                  <div className={clsx('h-full rounded-full transition-all', p.change > 0 ? 'bg-green-500/40' : 'bg-red-500/40')}
                    style={{ width: `${Math.min(Math.abs(p.change), 100)}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-200">
                    {p.change > 0 ? '+' : ''}{p.change}%
                  </span>
                </div>
                <div className="w-28 text-right flex-shrink-0">
                  <span className="text-xs text-slate-400">{basePrice.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 mx-1">→</span>
                  <span className={clsx('text-xs font-bold', p.change > 0 ? 'text-green-400' : 'text-red-400')}>{p.projected.toFixed(2)}</span>
                </div>
                <span className={clsx('w-20 text-right text-xs font-medium', p.delta > 0 ? 'text-green-400' : 'text-red-400')}>
                  {p.delta > 0 ? '+' : ''}{p.delta.toFixed(2)}/u
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-space-800/60 border border-space-700/40">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conseils pour cet événement</h4>
            <ul className="space-y-1">
              {event.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <Info size={11} className="text-cyan-500 mt-0.5 flex-shrink-0" />{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCalendar() {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const calendarData = useMemo(() => ECONOMY_EVENTS.map(ev => {
    const c = EVENT_COLORS[ev.color] || EVENT_COLORS.cyan;
    let occ = [];
    if (['Mensuel', 'Hebdomadaire', 'Bi-hebdomadaire', 'Continu'].includes(ev.frequency)) occ = [0,1,2,3,4,5,6,7,8,9,10,11];
    else if (ev.frequency === 'Bi-mensuel') occ = [0,2,4,6,8,10];
    else if (ev.frequency === 'Annuel (Mai)') occ = [4];
    else if (ev.frequency === 'Après patch') occ = [0,3,6,9];
    return { ...ev, occ, c };
  }), []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Fréquence estimée des événements économiques sur l'année. Les occurrences réelles dépendent du serveur.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-space-600">
              <th className="text-left py-2 px-3 text-slate-400 font-medium w-44">Événement</th>
              {months.map(m => <th key={m} className="py-2 px-1.5 text-center text-slate-500 text-xs font-medium">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {calendarData.map(ev => (
              <tr key={ev.id} className="border-b border-space-700/40">
                <td className="py-2 px-3">
                  <span className={clsx('text-sm font-medium', ev.c.text)}>{ev.name}</span>
                  <span className="block text-xs text-slate-500">{ev.frequency}</span>
                </td>
                {months.map((_, idx) => (
                  <td key={idx} className="py-2 px-1.5 text-center">
                    {ev.occ.includes(idx) ? (
                      <div className={clsx('w-5 h-5 rounded-full mx-auto flex items-center justify-center', ev.c.bg)}>
                        <div className={clsx('w-2 h-2 rounded-full', ev.c.dot)} />
                      </div>
                    ) : <div className="w-5 h-5 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function EconomyEvents() {
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [alerts, setAlerts] = useState(loadAlerts);

  const toggleAlert = (eventId) => {
    setAlerts(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      localStorage.setItem(ALERTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const types = useMemo(() => ['all', ...new Set(ECONOMY_EVENTS.map(ev => ev.type))], []);

  const filtered = useMemo(() => ECONOMY_EVENTS.filter(ev => {
    if (typeFilter !== 'all' && ev.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return ev.name.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)
        || ev.impacts.some(imp => imp.commodity.toLowerCase().includes(q));
    }
    return true;
  }), [search, typeFilter]);

  const alertedEvents = ECONOMY_EVENTS.filter(ev => alerts.includes(ev.id));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Activity size={22} className="text-cyan-400" />
          </div>
          Événements Économiques
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm">Suivez les événements dynamiques qui impactent les prix du commerce dans le verse — Alpha 4.6</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: ECONOMY_EVENTS.length, label: 'Événements suivis', color: 'text-cyan-400' },
          { val: ECONOMY_EVENTS.reduce((s, ev) => s + ev.impacts.length, 0), label: 'Impacts répertoriés', color: 'text-green-400' },
          { val: alertedEvents.length, label: 'Alertes actives', color: 'text-purple-400' },
          { val: new Set(ECONOMY_EVENTS.flatMap(ev => ev.impacts.map(i => i.commodity))).size, label: 'Commodités impactées', color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="card p-3 text-center">
            <div className={clsx('text-2xl font-bold', s.color)}>{s.val}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alertes actives */}
      {alertedEvents.length > 0 && (
        <div className="card p-4 border-cyan-500/20">
          <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
            <Bell size={14} /> Vos alertes ({alertedEvents.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {alertedEvents.map(ev => {
              const c = EVENT_COLORS[ev.color] || EVENT_COLORS.cyan;
              return (
                <button key={ev.id} onClick={() => toggleAlert(ev.id)}
                  className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors', c.bg, c.text, 'hover:opacity-80')}>
                  <Bell size={11} /> {ev.name} <X size={11} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-space-800/50 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.id ? 'bg-space-700 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200')}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Filtres (onglet actif) */}
      {tab === 'active' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un événement ou une commodité..."
              className="w-full bg-space-800 border border-space-600 text-slate-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={14} /></button>}
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-space-800 border border-space-600 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500">
            <option value="all">Tous les types</option>
            {types.filter(t => t !== 'all').map(t => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
          </select>
        </div>
      )}

      {/* Contenu */}
      {tab === 'active' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card p-8 text-center">
              <AlertTriangle size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun événement trouvé.</p>
              <button onClick={() => { setSearch(''); setTypeFilter('all'); }} className="text-sm text-cyan-400 hover:underline mt-2">Réinitialiser les filtres</button>
            </div>
          ) : filtered.map(ev => <EventCard key={ev.id} event={ev} alerts={alerts} toggleAlert={toggleAlert} />)}
        </div>
      )}

      {tab === 'matrix' && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-400" /> Matrice d'impact prix par événement
          </h2>
          <ImpactMatrix />
        </div>
      )}

      {tab === 'simulator' && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" /> Simulateur d'impact prix
          </h2>
          <p className="text-sm text-slate-400 mb-4">Sélectionnez un événement et un prix de base pour voir les projections de prix.</p>
          <Simulator />
        </div>
      )}

      {tab === 'calendar' && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-cyan-400" /> Calendrier des événements
          </h2>
          <EventCalendar />
        </div>
      )}
    </div>
  );
}
