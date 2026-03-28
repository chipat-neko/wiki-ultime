import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Zap, Shield, Rocket, Crosshair, ChevronDown, ChevronUp,
  Gauge, Thermometer, EyeOff, Swords, Monitor, Lightbulb,
  AlertTriangle, Battery, Fan, Navigation, Radio, Settings,
  Power, Flame, BarChart3, Keyboard,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ═══════════════════════════════════════════════════════
   DONNÉES
   ═══════════════════════════════════════════════════════ */

const POWER_POOLS = [
  {
    id: 'weapons',
    label: 'Armes (Weapons)',
    icon: Crosshair,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    barColor: 'bg-red-500',
    badge: 'bg-red-500/20 text-red-300',
    description:
      'Augmenter la puissance allouée aux armes accroît les dégâts par seconde (DPS), la cadence de tir et réduit la surchauffe des armes à énergie. Indispensable en engagement prolongé.',
    effects: [
      '+DPS et cadence de tir effective',
      'Réduction du temps de surchauffe armes énergie',
      'Rechargement plus rapide des armes balistiques',
      'Augmentation de la portée effective (dispersion réduite)',
    ],
  },
  {
    id: 'shields',
    label: 'Boucliers (Shields)',
    icon: Shield,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    barColor: 'bg-cyan-500',
    badge: 'bg-cyan-500/20 text-cyan-300',
    description:
      'Plus de puissance aux boucliers accélère la régénération, augmente la résistance aux dégâts et réduit le temps de rétablissement après une face tombée. Priorité en combat défensif.',
    effects: [
      'Régénération bouclier plus rapide',
      'Résistance accrue aux dégâts entrants',
      'Temps de rétablissement face réduit',
      'Meilleure absorption des dégâts balistiques',
    ],
  },
  {
    id: 'engines',
    label: 'Moteurs (Engines)',
    icon: Rocket,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    barColor: 'bg-yellow-500',
    badge: 'bg-yellow-500/20 text-yellow-300',
    description:
      'Alimenter les moteurs augmente la vitesse maximale, l\'accélération, la capacité de boost et la maniabilité. Essentiel pour le dogfight ou la fuite.',
    effects: [
      'Vitesse SCM et max augmentées',
      'Accélération et décélération plus rapides',
      'Capacité et recharge du boost améliorées',
      'Meilleure maniabilité en virage',
    ],
  },
];

const POWER_STATES = [
  {
    id: 'standby',
    label: 'Standby / Off',
    icon: Power,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-300',
    consumption: '~5-10%',
    performance: 'Composant inactif',
    description:
      'Le composant est éteint ou en veille. Consommation minimale, signature IR et EM quasi nulle. Utilisé pour le mode furtif ou lorsque le composant n\'est pas nécessaire.',
    pros: ['Signature IR/EM minimale', 'Consommation d\'énergie négligeable', 'Aucune usure'],
    cons: ['Composant non fonctionnel', 'Temps de redémarrage nécessaire'],
  },
  {
    id: 'normal',
    label: 'Normal',
    icon: Gauge,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
    consumption: '100%',
    performance: '100% nominal',
    description:
      'Fonctionnement standard du composant. Performances nominales, consommation normale. C\'est le mode par défaut après le démarrage du vaisseau.',
    pros: ['Performances stables et prévisibles', 'Usure normale', 'Bon équilibre énergie/perf'],
    cons: ['Aucun bonus de performance', 'Pas optimisé pour une situation spécifique'],
  },
  {
    id: 'overclock',
    label: 'Overclock',
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300',
    consumption: '~140%',
    performance: '+15 à 30%',
    description:
      'Le composant fonctionne au-delà de ses specs nominales. Gain de performance notable (+15-30%) mais consommation augmentée de ~40%, production de chaleur accrue et usure accélérée.',
    pros: ['Boost de performance +15-30%', 'Avantage tactique en combat'],
    cons: ['Consommation +40%', 'Chaleur générée accrue', 'Usure accélérée (x2)', 'Signature IR/EM augmentée'],
  },
  {
    id: 'max_overclock',
    label: 'Overclock Max',
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-300',
    consumption: '~180%',
    performance: '+30 à 50%',
    description:
      'Poussée maximale absolue du composant. Performances exceptionnelles (+30-50%) mais risque élevé de surchauffe critique et de panne. À utiliser uniquement en dernier recours.',
    pros: ['Boost de performance +30-50%', 'Peut sauver une situation désespérée'],
    cons: ['Risque de surchauffe et panne', 'Consommation +80%', 'Usure x4', 'Signature IR/EM massive'],
  },
];

const COMPONENT_OVERCLOCK = [
  {
    id: 'powerplant',
    label: 'Power Plant',
    icon: Battery,
    color: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300',
    bonus: '+Output énergie disponible',
    description:
      'Overclocker le power plant augmente la quantité totale d\'énergie disponible pour tous les systèmes. Permet d\'alimenter plus de composants en overclock simultanément.',
    effects: [
      { label: 'Output énergie', value: '+20-40%', positive: true },
      { label: 'Signature IR', value: '+30-50%', positive: false },
      { label: 'Signature EM', value: '+25-40%', positive: false },
      { label: 'Risque de panne', value: 'Modéré à élevé', positive: false },
    ],
    tip: 'Overclocker le power plant en premier si vous avez besoin de puissance pour les autres systèmes. Surveillez la température via le MFD.',
  },
  {
    id: 'shields',
    label: 'Boucliers (Shields)',
    icon: Shield,
    color: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300',
    bonus: '+Vitesse de régénération',
    description:
      'L\'overclock des boucliers accélère significativement la régénération et améliore la résistance. Très utile en combat prolongé pour maintenir la protection.',
    effects: [
      { label: 'Regen speed', value: '+25-40%', positive: true },
      { label: 'Résistance dégâts', value: '+10-15%', positive: true },
      { label: 'Signature EM', value: '+35-50%', positive: false },
      { label: 'Consommation', value: '+30%', positive: false },
    ],
    tip: 'En combat, priorisez l\'overclock des boucliers si vous subissez beaucoup de dégâts. Baissez dès que l\'engagement est terminé.',
  },
  {
    id: 'weapons',
    label: 'Armes (Weapons)',
    icon: Crosshair,
    color: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300',
    bonus: '+Cadence de tir / Dégâts',
    description:
      'Overclocker les armes augmente la cadence de tir et les dégâts, mais génère beaucoup plus de chaleur et consomme les munitions plus vite.',
    effects: [
      { label: 'Fire rate', value: '+15-25%', positive: true },
      { label: 'Dégâts/s', value: '+15-25%', positive: true },
      { label: 'Chaleur générée', value: '+40-60%', positive: false },
      { label: 'Consommation munitions', value: '+15-25%', positive: false },
    ],
    tip: 'Utilisez le tir par rafales (burst fire) pour éviter la surchauffe. Les armes à énergie surchauffent plus vite que les balistiques en overclock.',
  },
  {
    id: 'coolers',
    label: 'Refroidisseurs (Coolers)',
    icon: Fan,
    color: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
    bonus: '+Capacité de refroidissement',
    description:
      'Overclocker les coolers augmente leur capacité à évacuer la chaleur. Compense partiellement l\'overclock des autres composants.',
    effects: [
      { label: 'Cooling capacity', value: '+25-35%', positive: true },
      { label: 'Consommation énergie', value: '+20-30%', positive: false },
      { label: 'Signature IR', value: '+15% (dissipation)', positive: false },
    ],
    tip: 'Overclockez les coolers en premier si vous comptez overclocker d\'autres composants. Ils compensent la chaleur excédentaire.',
  },
  {
    id: 'qtdrive',
    label: 'QT Drive',
    icon: Navigation,
    color: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300',
    bonus: '+Vitesse de spool',
    description:
      'L\'overclock du Quantum Drive réduit le temps de spool (charge) avant le saut. Utile pour les fuites rapides ou les courses de livraison.',
    effects: [
      { label: 'Spool speed', value: '+20-30%', positive: true },
      { label: 'Consommation carburant QT', value: '+15-25%', positive: false },
      { label: 'Signature EM (spool)', value: '+40%', positive: false },
    ],
    tip: 'En situation de fuite, overclocker le QT drive peut faire la différence entre s\'échapper et se faire détruire.',
  },
  {
    id: 'thrusters',
    label: 'Propulseurs (Thrusters)',
    icon: Rocket,
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
    bonus: '+Vitesse / Accélération',
    description:
      'Overclocker les propulseurs augmente la vitesse, l\'accélération et la puissance du boost. Indispensable en dogfight pour garder l\'avantage de manœuvre.',
    effects: [
      { label: 'Vitesse/accélération', value: '+15-25%', positive: true },
      { label: 'Puissance boost', value: '+20-30%', positive: true },
      { label: 'Consommation H2', value: '+30-45%', positive: false },
      { label: 'Signature IR', value: '+35-50%', positive: false },
    ],
    tip: 'Attention à la consommation d\'hydrogène en overclock. En combat prolongé, vous pouvez tomber en panne de carburant.',
  },
];

const STEALTH_CONFIG = {
  title: 'Configuration Furtive (Stealth)',
  icon: EyeOff,
  color: 'text-green-400',
  bg: 'bg-green-500/5',
  border: 'border-green-500/20',
  result: { ir: '-70%', em: '-80%' },
  settings: [
    { component: 'Armes', state: 'OFF ou minimum', icon: Crosshair, note: 'Aucun tir possible' },
    { component: 'Boucliers', state: 'OFF ou bouclier stealth', icon: Shield, note: 'Vulnérable sans protection' },
    { component: 'Moteurs', state: 'Minimum (drift/coast)', icon: Rocket, note: 'Vol en dérive, pas de manœuvres brusques' },
    { component: 'Power Plant', state: 'Underclock', icon: Battery, note: 'Juste assez pour les systèmes vitaux' },
    { component: 'Coolers', state: 'Normal ou underclock', icon: Fan, note: 'Faible charge thermique' },
    { component: 'Radar', state: 'Passif uniquement', icon: Radio, note: 'Pas de ping actif' },
  ],
};

const COMBAT_CONFIG = {
  title: 'Configuration Combat',
  icon: Swords,
  color: 'text-red-400',
  bg: 'bg-red-500/5',
  border: 'border-red-500/20',
  settings: [
    { component: 'Armes', state: 'Overclock', icon: Crosshair, note: 'Tir par rafales pour gérer la chaleur' },
    { component: 'Boucliers', state: 'Overclock', icon: Shield, note: 'Regen maximale, résistance accrue' },
    { component: 'Moteurs', state: 'Équilibré / Normal', icon: Rocket, note: 'Overclock ponctuel pour manœuvres' },
    { component: 'Coolers', state: 'Overclock', icon: Fan, note: 'Compense la chaleur armes + boucliers' },
    { component: 'Power Plant', state: 'Overclock si nécessaire', icon: Battery, note: 'Selon demande totale' },
  ],
};

const MFD_SECTIONS = [
  {
    title: 'Où trouver les contrôles de puissance',
    icon: Monitor,
    content:
      'Le panneau de gestion d\'énergie se trouve dans le MFD (Multi-Function Display) de votre cockpit. Accédez-y via la touche F5 (Power) ou en naviguant dans les écrans MFD avec les touches fléchées.',
  },
  {
    title: 'Comment redistribuer la puissance',
    icon: BarChart3,
    content:
      'Utilisez les sliders du triangle de puissance pour répartir l\'énergie entre Armes, Boucliers et Moteurs. Le total reste toujours à 100%. Glissez vers un pôle pour augmenter sa puissance au détriment des autres.',
  },
  {
    title: 'Raccourcis clavier',
    icon: Keyboard,
    content:
      'F5 : Ouvrir le panneau Power • Numpad 4/6 : Puissance Armes -/+ • Numpad 8/2 : Puissance Boucliers -/+ • Numpad 7/9 : Puissance Moteurs -/+ • Numpad 5 : Reset équilibré (33/33/33) • I : Allumer/éteindre moteurs',
  },
  {
    title: 'Presets rapides',
    icon: Settings,
    content:
      'Vous pouvez créer des presets via le MFD pour basculer rapidement entre configurations. Exemple : preset "Combat" (armes 50%, boucliers 35%, moteurs 15%), preset "Fuite" (moteurs 60%, boucliers 30%, armes 10%), preset "Stealth" (tout au minimum).',
  },
];

const TIPS = [
  {
    icon: Lightbulb,
    text: 'Le triangle de puissance a un impact majeur en combat. Avant un engagement, passez armes et boucliers en priorité. En fuite, basculez tout sur les moteurs.',
  },
  {
    icon: AlertTriangle,
    text: 'L\'overclock max est dangereux : un composant qui surchauffe peut tomber en panne et nécessiter une réparation. Utilisez-le uniquement en situation critique.',
  },
  {
    icon: Thermometer,
    text: 'Surveillez toujours la température de vos composants sur le MFD. Au-dessus de 80%, le risque de panne augmente exponentiellement.',
  },
  {
    icon: Battery,
    text: 'Un power plant de qualité A Military ou Stealth permet d\'overclocker plus de composants simultanément sans risque de surcharge.',
  },
  {
    icon: Fan,
    text: 'Installez toujours les meilleurs coolers possibles. Ce sont eux qui déterminent combien de composants vous pouvez overclocker en même temps.',
  },
  {
    icon: EyeOff,
    text: 'Pour le gameplay furtif, sous-alimentez (underclock) le power plant et éteignez les boucliers. Votre signature EM chute drastiquement.',
  },
  {
    icon: Swords,
    text: 'En combat, utilisez le tir par rafales (burst fire) avec les armes en overclock. Cela maximise les dégâts tout en évitant la surchauffe.',
  },
  {
    icon: Gauge,
    text: 'Après un combat, pensez à remettre tous les composants en mode Normal pour réduire l\'usure. Les réparations de composants endommagés coûtent cher.',
  },
];

/* ═══════════════════════════════════════════════════════
   COMPOSANTS UTILITAIRES
   ═══════════════════════════════════════════════════════ */

function SectionTitle({ icon: Icon, title, color = 'text-cyan-400' }) {
  return (
    <h2 className={clsx('flex items-center gap-3 text-xl font-bold mb-4', color)}>
      <Icon size={22} />
      {title}
    </h2>
  );
}

function ExpandableCard({ title, icon: Icon, badge, badgeClass, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={color} />
          <span className="font-semibold text-white">{title}</span>
          {badge && (
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', badgeClass)}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-700/30">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════ */

export default function PowerManagement() {
  const [activePool, setActivePool] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center gap-3">
          <Zap size={32} className="text-yellow-400" />
          Power Management & Overclock
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Guide de la gestion d'énergie et de l'overclocking des composants vaisseaux
        </p>
      </div>

      {/* ── 1. Triangle de puissance ── */}
      <section>
        <SectionTitle icon={BarChart3} title="Triangle de Puissance" color="text-yellow-400" />
        <p className="text-gray-400 text-sm mb-4">
          L'énergie de votre vaisseau est répartie entre trois pools. Le total fait toujours 100% — augmenter un pool réduit les autres proportionnellement.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {POWER_POOLS.map((pool) => {
            const Icon = pool.icon;
            const isActive = activePool === pool.id;
            return (
              <div
                key={pool.id}
                onClick={() => setActivePool(isActive ? null : pool.id)}
                className={clsx(
                  'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                  pool.bg, pool.border,
                  isActive && 'ring-1 ring-offset-0',
                  isActive && pool.id === 'weapons' && 'ring-red-500/50',
                  isActive && pool.id === 'shields' && 'ring-cyan-500/50',
                  isActive && pool.id === 'engines' && 'ring-yellow-500/50',
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={clsx('p-2 rounded-lg', pool.bg)}>
                    <Icon size={20} className={pool.color} />
                  </div>
                  <div>
                    <h3 className={clsx('font-bold', pool.color)}>{pool.label}</h3>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full', pool.badge)}>33% par défaut</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{pool.description}</p>
                {isActive && (
                  <ul className="space-y-1 mt-2">
                    {pool.effects.map((e, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className={pool.color}>▸</span> {e}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div className={clsx('h-full rounded-full transition-all', pool.barColor)} style={{ width: '33%' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. Power States ── */}
      <section>
        <SectionTitle icon={Gauge} title="États de Puissance des Composants" color="text-orange-400" />
        <div className="grid md:grid-cols-2 gap-4">
          {POWER_STATES.map((state) => {
            const Icon = state.icon;
            return (
              <div key={state.id} className={clsx('p-4 rounded-xl border', state.bg, state.border)}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} className={state.color} />
                  <h3 className={clsx('font-bold', state.color)}>{state.label}</h3>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', state.badge)}>
                    {state.performance}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{state.description}</p>
                <div className="flex items-center gap-4 text-xs mb-3">
                  <span className="text-gray-500">Consommation :</span>
                  <span className={state.color}>{state.consumption}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-green-400 font-medium text-xs mb-1">Avantages</p>
                    {state.pros.map((p, i) => (
                      <p key={i} className="text-gray-300 text-xs flex items-start gap-1">
                        <span className="text-green-400 mt-0.5">✓</span> {p}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-red-400 font-medium text-xs mb-1">Inconvénients</p>
                    {state.cons.map((c, i) => (
                      <p key={i} className="text-gray-300 text-xs flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">✗</span> {c}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Component Overclocking ── */}
      <section>
        <SectionTitle icon={Zap} title="Overclock par Composant" color="text-red-400" />
        <p className="text-gray-400 text-sm mb-4">
          Chaque composant peut être overclocké individuellement. Cliquez pour voir les effets détaillés.
        </p>
        <div className="space-y-3">
          {COMPONENT_OVERCLOCK.map((comp) => (
            <ExpandableCard
              key={comp.id}
              title={comp.label}
              icon={comp.icon}
              badge={comp.bonus}
              badgeClass={comp.badge}
              color={comp.color}
            >
              <p className="text-gray-400 text-sm mt-3 mb-3">{comp.description}</p>
              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                {comp.effects.map((eff, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-center justify-between p-2 rounded-lg text-sm',
                      eff.positive ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20',
                    )}
                  >
                    <span className="text-gray-300">{eff.label}</span>
                    <span className={eff.positive ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                      {eff.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <Lightbulb size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-200/80">{comp.tip}</p>
              </div>
            </ExpandableCard>
          ))}
        </div>
      </section>

      {/* ── 4. Stealth Configuration ── */}
      <section>
        <SectionTitle icon={EyeOff} title={STEALTH_CONFIG.title} color="text-green-400" />
        <div className={clsx('p-5 rounded-xl border', STEALTH_CONFIG.bg, STEALTH_CONFIG.border)}>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-medium">
              Signature IR : {STEALTH_CONFIG.result.ir}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-medium">
              Signature EM : {STEALTH_CONFIG.result.em}
            </span>
          </div>
          <div className="space-y-2">
            {STEALTH_CONFIG.settings.map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <SIcon size={16} className="text-green-400 shrink-0" />
                  <span className="text-white font-medium text-sm w-28 shrink-0">{s.component}</span>
                  <span className="text-green-300 text-sm font-medium w-44 shrink-0">{s.state}</span>
                  <span className="text-gray-500 text-xs">{s.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Combat Configuration ── */}
      <section>
        <SectionTitle icon={Swords} title={COMBAT_CONFIG.title} color="text-red-400" />
        <div className={clsx('p-5 rounded-xl border', COMBAT_CONFIG.bg, COMBAT_CONFIG.border)}>
          <p className="text-gray-400 text-sm mb-4">
            Configuration optimisée pour les engagements. Priorisez armes et boucliers, gérez la chaleur avec le tir par rafales.
          </p>
          <div className="space-y-2">
            {COMBAT_CONFIG.settings.map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <SIcon size={16} className="text-red-400 shrink-0" />
                  <span className="text-white font-medium text-sm w-28 shrink-0">{s.component}</span>
                  <span className="text-orange-300 text-sm font-medium w-44 shrink-0">{s.state}</span>
                  <span className="text-gray-500 text-xs">{s.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. MFD Power Management ── */}
      <section>
        <SectionTitle icon={Monitor} title="MFD — Gestion d'Énergie In-Game" color="text-purple-400" />
        <div className="grid md:grid-cols-2 gap-4">
          {MFD_SECTIONS.map((sec, i) => {
            const SIcon = sec.icon;
            return (
              <div key={i} className="p-4 bg-gray-800/50 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <SIcon size={18} className="text-purple-400" />
                  <h3 className="font-semibold text-purple-300 text-sm">{sec.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{sec.content}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 7. Tips ── */}
      <section>
        <SectionTitle icon={Lightbulb} title="Conseils de Power Management" color="text-yellow-400" />
        <div className="grid md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const TIcon = tip.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-800/40 border border-gray-700/40 rounded-xl">
                <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                  <TIcon size={16} className="text-yellow-400" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="power-management" />
    </div>
  );
}
