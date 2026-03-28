import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Gauge, Rocket, Zap, Shield, ChevronDown, ChevronUp,
  Info, BookOpen, Clock, AlertTriangle, Crosshair, Navigation,
  Fuel, TrendingUp, Target, ArrowRightLeft, Search, X,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ─── Donn\ées ─── */

const MASTER_MODES = [
  {
    id: 'scm',
    name: 'SCM',
    fullName: 'Space Combat Mode',
    badge: 'badge-cyan',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    icon: Crosshair,
    speedRange: '200 \– 300 m/s',
    description: 'Mode de combat spatial principal. Vitesse r\éduite mais acc\ès complet aux armes, boucliers et man\œuvres de combat.',
    features: [
      'Armes actives \— tir libre sur toutes les hardpoints',
      'Boucliers \à pleine puissance (100%)',
      'Man\œuvres compl\ètes : boost, strafe, d\écoupl\é',
      'Contre-mesures et missiles disponibles',
      'Signatures EM/IR mod\ér\ées',
      'Mode par d\éfaut apr\ès spawn',
    ],
  },
  {
    id: 'nav',
    name: 'NAV',
    fullName: 'Navigation Mode',
    badge: 'badge-gold',
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    bg: 'bg-gold-500/10',
    icon: Navigation,
    speedRange: '800 \– 1 200 m/s',
    description: 'Mode de navigation rapide pour les d\éplacements longue distance. Armes d\ésactiv\ées et boucliers r\éduits.',
    features: [
      'Armes d\ésactiv\ées \— aucun tir possible',
      'Boucliers r\éduits (\∼30% capacit\é)',
      'Vitesse max \élev\ée selon classe vaisseau',
      'Transition depuis SCM : \∼3 secondes',
      'Manoeuvrabilit\é r\éduite (inertie \élev\ée)',
      'Signatures EM/IR \élev\ées',
    ],
  },
  {
    id: 'qt',
    name: 'QT',
    fullName: 'Quantum Travel',
    badge: 'badge-purple',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: Rocket,
    speedRange: '0.2c (\∼60 000 km/s)',
    description: 'Voyage quantique pour les trajets inter-plan\étaires. N\écessite un QT Drive fonctionnel et du carburant quantique.',
    features: [
      'Vitesse de 0.2c (20% vitesse lumi\ère)',
      'Spooling obligatoire avant saut (\∼5-15s)',
      'QT Drive requis et fonctionnel',
      'Aucun combat possible pendant le trajet',
      'Consomme du carburant quantique (QT Fuel)',
      'Peut \être interrompu par interdiction quantique',
    ],
  },
];

const TRANSITIONS = [
  { from: 'SCM', to: 'NAV', time: '\∼3s', condition: 'Aucun d\ég\ât re\çu r\écemment, vitesse stable', badge: 'badge-green' },
  { from: 'NAV', to: 'SCM', time: '\∼1.5s', condition: 'Instantan\é si tir ennemi d\étect\é (auto-switch)', badge: 'badge-cyan' },
  { from: 'SCM', to: 'QT', time: '\∼5-15s', condition: 'Spooling complet, cap align\é, pas d\'obstruction', badge: 'badge-yellow' },
  { from: 'QT', to: 'SCM', time: '\∼2s', condition: 'Arriv\ée \à destination ou annulation manuelle', badge: 'badge-cyan' },
  { from: 'NAV', to: 'QT', time: '\∼5-15s', condition: 'Spooling complet, cap align\é', badge: 'badge-yellow' },
  { from: 'QT', to: 'NAV', time: 'N/A', condition: 'Retour en SCM obligatoire, puis transition NAV', badge: 'badge-red' },
];

const SPEED_TABLE = [
  { class: 'Chasseurs (Fighters)', examples: 'Arrow, Gladius, Sabre', scm: 300, nav: 900, color: 'bg-cyan-500', colorLight: 'bg-cyan-500/30' },
  { class: 'Moyens (Medium)', examples: 'Cutlass, Freelancer, Constellation', scm: 220, nav: 800, color: 'bg-gold-500', colorLight: 'bg-gold-500/30' },
  { class: 'Lourds (Large)', examples: 'Hammerhead, Caterpillar, C2', scm: 150, nav: 600, color: 'bg-warning-500', colorLight: 'bg-warning-500/30' },
  { class: 'Capitaux (Capital)', examples: 'Idris, Javelin, Polaris', scm: 80, nav: 400, color: 'bg-danger-500', colorLight: 'bg-danger-500/30' },
];

const COMBAT_TACTICS = [
  {
    id: 'jousting',
    name: 'Jousting (NAV \→ SCM)',
    icon: TrendingUp,
    color: 'text-gold-400',
    badge: 'badge-gold',
    difficulty: 'Interm\édiaire',
    description: 'Approche \à haute vitesse en mode NAV, transition en SCM au dernier moment pour un engagement furtif et d\évastateur.',
    steps: [
      'Approcher la cible en mode NAV (\à \∼5 km)',
      'Aligner le cap sur la cible en approche frontale',
      'Passer en SCM \à \∼2 km de distance',
      'D\écharger les armes pendant la fen\être de tir',
      'Repasser en NAV pour d\égager si n\écessaire',
    ],
    pros: 'Surprise, d\ég\âts initiaux \élev\és',
    cons: 'Fen\être de tir courte, vuln\érable si rat\é',
  },
  {
    id: 'dogfight',
    name: 'Dogfighting (SCM soutenu)',
    icon: Crosshair,
    color: 'text-cyan-400',
    badge: 'badge-cyan',
    difficulty: 'Avanc\é',
    description: 'Combat rapproch\é classique en mode SCM. Exploitation maximale des man\œuvres, du boost et du d\écoupl\é pour maintenir la pression.',
    steps: [
      'Rester en SCM en permanence pour acc\ès armes',
      'Utiliser le boost pour des man\œuvres brusques',
      'Alterner strafe et d\écoupl\é pour \éviter les tirs',
      'Garder la cible dans le pip en continu',
      'G\érer l\’\énergie (armes vs boucliers vs moteurs)',
    ],
    pros: 'DPS maximal, contr\ôle de l\’engagement',
    cons: 'Consommation H2 \élev\ée, exige du skill',
  },
  {
    id: 'hitrun',
    name: 'Hit & Run (SCM \→ NAV)',
    icon: Zap,
    color: 'text-warning-400',
    badge: 'badge-yellow',
    difficulty: 'D\ébutant',
    description: 'Frapper vite en SCM puis fuir en NAV. Id\éal pour les vaisseaux l\égers face \à des cibles plus lourdes.',
    steps: [
      'Engager en SCM avec un pass rapide',
      'Infliger un maximum de d\ég\âts en une passe',
      'D\égager en ligne droite \à vitesse max SCM',
      'Passer en NAV d\ès que possible (hors port\ée)',
      'Revenir pour une nouvelle passe ou fuir d\éfinitivement',
    ],
    pros: 'Faible risque, excellent contre les gros vaisseaux',
    cons: 'DPS total faible, combat long',
  },
  {
    id: 'ambush',
    name: 'Embuscade (Moteurs coup\és \→ SCM)',
    icon: Target,
    color: 'text-danger-400',
    badge: 'badge-red',
    difficulty: 'Expert',
    description: 'Se positionner moteurs coup\és (signature EM minimale) sur une route fr\équent\ée, puis activer SCM quand la cible arrive \à port\ée.',
    steps: [
      'Se placer sur une route connue (QT lane, Jump Point)',
      'Couper les moteurs pour r\éduire la signature EM',
      'Attendre qu\’une cible passe \à proximit\é',
      'Allumer les moteurs et passer en SCM instantan\ément',
      'Engager imm\édiatement avant que la cible ne r\éagisse',
    ],
    pros: 'Effet de surprise maximal, premier tir garanti',
    cons: 'Temps d\’attente long, risque d\’\être d\étect\é',
  },
];

const TIPS = [
  {
    icon: AlertTriangle,
    color: 'text-warning-400',
    title: 'Ne jamais combattre en NAV',
    text: 'En mode NAV, vos armes sont d\ésactiv\ées et vos boucliers r\éduits \à 30%. Si vous \êtes attaqu\é, le vaisseau repassera automatiquement en SCM mais le d\élai peut \être fatal.',
  },
  {
    icon: Clock,
    color: 'text-cyan-400',
    title: 'Conna\ître les temps de transition',
    text: 'La transition SCM \→ NAV prend \∼3s. Pendant ce temps vous \êtes vuln\érable. Assurez-vous d\’\être hors de port\ée effective avant de switcher.',
  },
  {
    icon: Gauge,
    color: 'text-gold-400',
    title: 'Adapter le mode \à la situation',
    text: 'Utilisez NAV pour couvrir les distances rapidement, SCM uniquement quand un combat est imminent. Le swap constant entre modes est la cl\é de la survie.',
  },
  {
    icon: Shield,
    color: 'text-success-400',
    title: 'Boucliers en NAV \— le pi\ège',
    text: 'Beaucoup de pilotes oublient que les boucliers sont \à 30% en NAV. Un seul tir deSize 5+ peut p\én\étrer et toucher la coque directement.',
  },
  {
    icon: Fuel,
    color: 'text-purple-400',
    title: 'G\érer le carburant H2',
    text: 'Le mode NAV consomme \∼2x plus de H2 que le SCM. Les boosters en SCM consomment encore plus. Gardez toujours une r\éserve de 15-20% pour l\’urgence.',
  },
  {
    icon: Rocket,
    color: 'text-danger-400',
    title: 'Spooling pr\éventif',
    text: 'En zone dangereuse, commencez le spooling QT m\ême sans destination. Un spool partiel acc\él\ère la fuite si un ennemi appara\ît soudainement.',
  },
  {
    icon: Navigation,
    color: 'text-blue-400',
    title: 'Le d\écoupl\é en SCM',
    text: 'Le mode d\écoupl\é (decoupled) en SCM permet de tourner le vaisseau sans changer de trajectoire. Parfait pour tirer sur un poursuivant en fuyant.',
  },
  {
    icon: ArrowRightLeft,
    color: 'text-gold-400',
    title: 'Auto-switch intelligent',
    text: 'Si vous \êtes en NAV et recevez des tirs, le vaisseau repasse en SCM automatiquement. Mais la d\éc\él\ération prend du temps \— pr\évoyez la man\œuvre.',
  },
];

const FUEL_DATA = [
  { mode: 'SCM (vol normal)', h2: 'Faible', qt: 'Aucune', badge: 'badge-green', detail: 'Consommation de base, adapt\ée au combat prolong\é' },
  { mode: 'SCM (boost actif)', h2: '\Élev\ée', qt: 'Aucune', badge: 'badge-yellow', detail: 'Le boost draine rapidement le H2 \— utiliser avec parcimonie' },
  { mode: 'NAV (croisi\ère)', h2: 'Mod\ér\ée \à \élev\ée', qt: 'Aucune', badge: 'badge-yellow', detail: '\∼2x la consommation SCM, varie selon la masse du vaisseau' },
  { mode: 'QT (Quantum Travel)', h2: 'Aucune', qt: '\Élev\ée', badge: 'badge-purple', detail: 'QT Fuel d\édi\é, capacit\é d\épend du QT Drive install\é' },
  { mode: 'Moteurs coup\és', h2: 'Nulle', qt: 'Nulle', badge: 'badge-cyan', detail: 'Aucune consommation, mais aucune man\œuvrabilit\é' },
];

const NAV_ITEMS = [
  { id: 'modes', label: 'Master Modes' },
  { id: 'transitions', label: 'Transitions' },
  { id: 'vitesses', label: 'Vitesses' },
  { id: 'tactiques', label: 'Tactiques Combat' },
  { id: 'tips', label: 'Tips & Astuces' },
  { id: 'fuel', label: 'Carburant' },
];

/* ─── Helpers ─── */

function SectionAnchor({ id }) {
  return <div id={id} className="scroll-mt-24" />;
}

function ExpandableSection({ title, icon: Icon, iconColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={clsx('w-5 h-5', iconColor)} />}
          <span className="font-semibold text-slate-200">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-space-400/20">{children}</div>}
    </div>
  );
}

/* ─── Composant principal ─── */

export default function MasterModes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedTactics, setExpandedTactics] = useState({});

  const q = search.toLowerCase();
  const match = (/** @type {string[]} */ ...fields) => !q || fields.some(f => f && f.toLowerCase().includes(q));

  const toggleTactic = (id) => setExpandedTactics(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredModes = MASTER_MODES.filter(m => match(m.name, m.fullName, m.description, ...m.features));
  const filteredTransitions = TRANSITIONS.filter(t => match(t.from, t.to, t.condition));
  const filteredSpeeds = SPEED_TABLE.filter(s => match(s.class, s.examples));
  const filteredTactics = COMBAT_TACTICS.filter(t => match(t.name, t.description, t.difficulty, ...t.steps));
  const filteredTips = TIPS.filter(t => match(t.title, t.text));
  const filteredFuel = FUEL_DATA.filter(f => match(f.mode, f.detail, f.h2, f.qt));

  const maxNav = Math.max(...SPEED_TABLE.map(s => s.nav));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Gauge className="w-7 h-7 text-gold-400" />
            Master Modes &mdash; Syst\ème de Vol
          </h1>
          <span className="badge badge-cyan">Alpha 4.6</span>
          <span className="badge badge-gold">Flight Model</span>
        </div>
        <p className="page-subtitle mt-1">
          Comprendre les modes de vol SCM, NAV et Quantum Travel dans Star Citizen Alpha 4.6
        </p>
      </div>

      {/* Navigation interne */}
      <div className="card p-3 flex flex-wrap gap-2">
        {NAV_ITEMS.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer text-xs px-3 py-1"
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un mode, une tactique, un conseil..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Section 1 : Introduction */}
      <SectionAnchor id="modes" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-cyan-400" />
          Les trois Master Modes
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          Le syst\ème <strong className="text-gold-400">Master Modes</strong> est le mod\èle de vol fondamental de Star Citizen depuis l'Alpha 3.23.
          Il divise le vol spatial en trois modes distincts, chacun avec ses capacit\és et restrictions.
          Comprendre quand et comment basculer entre ces modes est <strong className="text-cyan-400">essentiel \à la survie</strong> en combat comme en exploration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredModes.map(mode => {
            const Icon = mode.icon;
            return (
              <div key={mode.id} className={clsx('rounded-xl border p-5', mode.border, mode.bg)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={clsx('p-2 rounded-lg bg-space-800/60')}>
                    <Icon className={clsx('w-6 h-6', mode.color)} />
                  </div>
                  <div>
                    <h3 className={clsx('font-bold text-lg', mode.color)}>{mode.name}</h3>
                    <span className="text-xs text-slate-400">{mode.fullName}</span>
                  </div>
                  <span className={clsx('badge ml-auto', mode.badge)}>{mode.speedRange}</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{mode.description}</p>
                <ul className="space-y-1.5">
                  {mode.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <Zap className={clsx('w-3 h-3 mt-0.5 flex-shrink-0', mode.color)} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Stats r\ésum\é */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Modes de vol', value: '3', color: 'text-gold-400' },
            { label: 'Vitesse max SCM', value: '~300 m/s', color: 'text-cyan-400' },
            { label: 'Vitesse max NAV', value: '~1 200 m/s', color: 'text-warning-400' },
            { label: 'Vitesse QT', value: '0.2c', color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-space-700/50 rounded-lg p-3 text-center">
              <div className={clsx('text-2xl font-bold font-display', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 : Transitions */}
      <SectionAnchor id="transitions" />
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <ArrowRightLeft className="w-5 h-5 text-gold-400" />
          Matrice de Transitions
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Temps et conditions pour basculer entre les diff\érents Master Modes. Ces d\élais sont critiques en combat.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">De</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Vers</th>
                <th className="text-center py-2 px-3 text-slate-400 font-medium">Temps</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransitions.map((t, i) => (
                <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">{t.from}</td>
                  <td className="py-2.5 px-3 font-semibold text-gold-400">{t.to}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={clsx('badge', t.badge)}>{t.time}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{t.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-space-700/60 border border-space-400/20 flex gap-2">
          <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 italic">
            La transition QT \→ NAV directe n'existe pas. Vous devez d'abord revenir en SCM apr\ès un saut quantique, puis basculer en NAV.
          </p>
        </div>
      </div>

      {/* Section 3 : Vitesses par classe */}
      <SectionAnchor id="vitesses" />
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-cyan-400" />
          Vitesses par Classe de Vaisseau
        </h2>
        <p className="text-slate-400 text-sm mb-5">
          Vitesses typiques en mode SCM et NAV selon la cat\égorie du vaisseau. Les valeurs exactes varient selon le mod\èle.
        </p>
        <div className="space-y-4">
          {filteredSpeeds.map((s, i) => (
            <div key={i} className="bg-space-700/40 rounded-xl p-4 border border-space-400/10">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="font-semibold text-slate-200">{s.class}</h4>
                  <span className="text-xs text-slate-500">{s.examples}</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-cyan-400 font-mono font-bold">{s.scm} m/s <span className="text-xs font-normal text-slate-500">SCM</span></span>
                  <span className="text-gold-400 font-mono font-bold">{s.nav} m/s <span className="text-xs font-normal text-slate-500">NAV</span></span>
                </div>
              </div>
              {/* Barres visuelles */}
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8">SCM</span>
                  <div className="flex-1 bg-space-800/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', s.color)}
                      style={{ width: `${(s.scm / maxNav) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8">NAV</span>
                  <div className="flex-1 bg-space-800/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', s.colorLight)}
                      style={{ width: `${(s.nav / maxNav) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 : Tactiques de combat */}
      <SectionAnchor id="tactiques" />
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-danger-400" />
          Tactiques de Combat
        </h2>
        <p className="text-slate-400 text-sm mb-2">
          Quatre strat\égies cl\és exploitant les transitions entre Master Modes pour prendre l'avantage en combat.
        </p>
        {filteredTactics.map(tactic => {
          const Icon = tactic.icon;
          const isOpen = expandedTactics[tactic.id];
          return (
            <div key={tactic.id} className="card overflow-hidden">
              <button
                onClick={() => toggleTactic(tactic.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={clsx('w-5 h-5', tactic.color)} />
                  <div className="text-left">
                    <span className="font-semibold text-slate-200">{tactic.name}</span>
                    <span className={clsx('badge ml-2', tactic.badge)}>{tactic.difficulty}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-space-400/20 space-y-3 pt-3">
                  <p className="text-sm text-slate-300">{tactic.description}</p>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">\Étapes</h4>
                    <ol className="space-y-1.5">
                      {tactic.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={clsx('flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-space-700 border border-space-400/30', tactic.color)}>
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-2.5 rounded-lg bg-success-500/10 border border-success-500/20">
                      <span className="text-xs font-semibold text-success-400">Avantages</span>
                      <p className="text-xs text-slate-300 mt-1">{tactic.pros}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-danger-500/10 border border-danger-500/20">
                      <span className="text-xs font-semibold text-danger-400">Inconv\énients</span>
                      <p className="text-xs text-slate-300 mt-1">{tactic.cons}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section 5 : Tips & Astuces */}
      <SectionAnchor id="tips" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning-400" />
          Tips &amp; Astuces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-space-700/40 rounded-lg p-4 border border-space-400/10 flex gap-3">
                <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', tip.color)} />
                <div>
                  <h4 className="font-semibold text-sm text-slate-200 mb-1">{tip.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6 : Gestion du carburant */}
      <SectionAnchor id="fuel" />
      <ExpandableSection
        title="Gestion du Carburant par Mode"
        icon={Fuel}
        iconColor="text-purple-400"
        defaultOpen
      >
        <p className="text-slate-400 text-sm mb-4 mt-3">
          Chaque mode a un impact diff\érent sur la consommation de carburant H2 (hydrog\ène) et QT (quantique).
          G\érer votre fuel est aussi important que g\érer vos boucliers.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Mode</th>
                <th className="text-center py-2 px-3 text-slate-400 font-medium">Conso H2</th>
                <th className="text-center py-2 px-3 text-slate-400 font-medium">Conso QT</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">D\étails</th>
              </tr>
            </thead>
            <tbody>
              {filteredFuel.map((f, i) => (
                <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{f.mode}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={clsx('badge', f.badge)}>{f.h2}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={clsx('badge', f.h2 === 'Aucune' && f.qt !== 'Aucune' ? 'badge-purple' : f.qt === 'Aucune' ? 'badge-green' : 'badge-yellow')}>
                      {f.qt}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs">{f.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-space-700/60 border border-space-400/20 flex gap-2">
          <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 italic">
            Le ravitaillement en H2 se fait automatiquement en atterrissant sur un pad. Le QT Fuel n\écessite un passage en station ou un ravitailleur (Starfarer).
          </p>
        </div>
      </ExpandableSection>

      {/* Footer liens */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Guides connexes :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/bounty-hunting')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Chasse aux Primes
          </button>
          <button onClick={() => navigate('/piraterie')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Piraterie
          </button>
          <button onClick={() => navigate('/crimestat')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            CrimeStat
          </button>
          <button onClick={() => navigate('/vaisseaux')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Base de Vaisseaux
          </button>
          <button onClick={() => navigate('/guides')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Tous les Guides
          </button>
        </div>
      </div>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="master-modes" />
    </div>
  );
}
