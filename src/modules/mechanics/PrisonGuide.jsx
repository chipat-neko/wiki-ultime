import React, { useState } from 'react';
import clsx from 'clsx';
import {
  AlertTriangle, Shield, Clock, ChevronDown, ChevronUp,
  Info, Zap, Lock, Eye, Target, DollarSign, BookOpen,
  Pickaxe, Swords, Timer, Wind, Mountain, Map,
  Heart, Package, Star, Users, Skull, Flame,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Système Carcéral de Klescher
══════════════════════════════════════════════════════════════ */

const HOW_YOU_GET_IN = [
  {
    trigger: 'CrimeStat 2+',
    icon: AlertTriangle,
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    bg: 'bg-warning-500/10',
    description: 'À partir de CS2, si vous êtes tué par les forces de l\'ordre ou un chasseur de primes, vous serez envoyé à Klescher au lieu de respawn normalement.',
  },
  {
    trigger: 'Arrestation',
    icon: Lock,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    description: 'Un joueur chasseur de primes peut vous incapaciter et appeler un transport de la sécurité pour vous faire arrêter officiellement.',
  },
  {
    trigger: 'Mort en zone sécurisée',
    icon: Shield,
    color: 'text-danger-400',
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    description: 'Être tué par la sécurité dans une Armistice Zone ou Green Zone avec un CrimeStat actif entraîne un transfert direct vers Klescher.',
  },
  {
    trigger: 'Suicide en CS',
    icon: Skull,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    description: 'Se suicider (Backspace) avec un CrimeStat actif vous envoie directement en prison. Pas moyen d\'esquiver.',
  },
];

const MERIT_SOURCES = [
  {
    id: 'mining',
    icon: Pickaxe,
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    bg: 'bg-gold-500/10',
    name: 'Minage',
    rate: '~1 500 merits/h',
    description: 'Casser des roches dans les mines de Klescher avec le multi-tool fourni. Les dépôts de Hadanite rapportent le plus. Déposez les minerais aux terminaux de collecte pour convertir en merits.',
    tips: [
      'Cherchez les veines bleu-violet (Hadanite) pour un meilleur ratio',
      'Restez dans les tunnels principaux pour éviter les embuscades',
      'Le multi-tool se décharge — rechargez-le aux stations murales',
    ],
  },
  {
    id: 'missions',
    icon: BookOpen,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    name: 'Missions internes',
    rate: '~2 000 merits/h',
    description: 'Tâches de nettoyage, livraison de colis entre zones de la prison, maintenance des systèmes. Accessibles depuis les terminaux oranges dans le hub principal.',
    tips: [
      'Les missions de livraison sont les plus rapides et les plus sûres',
      'Les missions de nettoyage donnent plus de merits mais prennent plus de temps',
      'Vérifiez les terminaux régulièrement — les missions ont un cooldown',
    ],
  },
  {
    id: 'combat',
    icon: Swords,
    color: 'text-danger-400',
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    name: 'Combat PvP',
    rate: 'Variable',
    description: 'Combattre et éliminer d\'autres détenus peut rapporter des merits via le système de réputation interne. Attention — mourir en prison rallonge votre peine.',
    tips: [
      'Fabriquez un couteau au préalable via les matériaux trouvés',
      'Les zones profondes des mines sont propices aux embuscades',
      'Mourir en prison ajoute du temps — évaluez le risque avant de combattre',
    ],
  },
  {
    id: 'passive',
    icon: Timer,
    color: 'text-slate-400',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    name: 'Temps passé (passif)',
    rate: '~200 merits/h',
    description: 'Rester connecté en prison réduit passivement votre peine. C\'est la méthode la plus lente, mais elle fonctionne même si vous êtes AFK (tant que vous ne vous déconnectez pas).',
    tips: [
      'Combinez avec le minage pour maximiser la réduction',
      'Ne vous déconnectez pas — le timer s\'arrête en offline',
      'Trouvez un coin sûr si vous comptez AFK',
    ],
  },
];

const SENTENCES = [
  { cs: 'CS1', duration: '~6 min', merits: 5000, color: 'badge-green', glow: 'text-success-400', description: 'Infractions mineures — peine légère, sortie rapide avec un peu de minage.' },
  { cs: 'CS2', duration: '~12 min', merits: 10000, color: 'badge-yellow', glow: 'text-warning-400', description: 'Crimes modérés — agression, vol mineur. Une session de minage suffit.' },
  { cs: 'CS3', duration: '~30 min', merits: 25000, color: 'badge-red', glow: 'text-danger-400', description: 'Crimes graves — meurtre, destruction. Prévoir plusieurs cycles de missions.' },
  { cs: 'CS4', duration: '~60 min', merits: 50000, color: 'badge-red', glow: 'text-danger-400', description: 'Crimes multiples — terrorisme. Longue peine, l\'évasion devient tentante.' },
  { cs: 'CS5', duration: '~120 min+', merits: 100000, color: 'badge-purple', glow: 'text-purple-400', description: 'Criminel recherché — meurtres en série. L\'évasion est souvent la seule option viable.' },
];

const ESCAPE_ROUTES = [
  {
    id: 'vents',
    icon: Wind,
    name: 'Route des Ventilations',
    difficulty: 'Moyen',
    diffBadge: 'badge-yellow',
    equipment: ['Oxypens (x2 minimum)', 'Medpen', 'Couteau (optionnel)'],
    description: 'Empruntez les conduits de ventilation accessibles depuis les niveaux inférieurs de la prison. Les grilles peuvent être retirées à certains endroits spécifiques.',
    steps: [
      'Descendez au niveau -2 des mines',
      'Cherchez la grille de ventilation déverrouillée (mur est, repérable par la vapeur)',
      'Rampez dans les conduits — attention aux zones sans oxygène',
      'Évitez les gardes aux intersections (patrouille toutes les 90 secondes)',
      'Sortez par le sas d\'évacuation vers la surface de Aberdeen',
    ],
    warning: 'Les gardes ont des patterns de patrouille. Chronométrez leur passage avant de vous engager.',
  },
  {
    id: 'exterior',
    icon: Mountain,
    name: 'Route Extérieure',
    difficulty: 'Difficile',
    diffBadge: 'badge-red',
    equipment: ['Combinaison spatiale complète', 'Oxypens (x4+)', 'Medpens (x2)'],
    description: 'Trouvez une sortie vers la surface d\'Aberdeen. L\'atmosphère est toxique et les températures extrêmes — votre O2 est très limité.',
    steps: [
      'Localisez la brèche dans le mur extérieur (zone de minage profonde)',
      'Équipez votre combinaison AVANT de sortir',
      'Sprintez vers les coordonnées de récupération',
      'Appelez un ami ou attendez qu\'un vaisseau passe',
      'L\'O2 dure environ 3-4 minutes — ne traînez pas',
    ],
    warning: 'Sans vaisseau de récupération prêt, vous mourrez sur la surface. Coordonnez-vous avec un allié AVANT de tenter cette route.',
  },
  {
    id: 'underground',
    icon: Map,
    name: 'Route Souterraine',
    difficulty: 'Expert',
    diffBadge: 'badge-purple',
    equipment: ['Oxypens (x3)', 'Medpens (x3)', 'Couteau', 'Lampe frontale'],
    description: 'Les mines profondes de Klescher cachent des passages secrets menant à des grottes naturelles sous la surface d\'Aberdeen, avec un accès vers l\'extérieur.',
    steps: [
      'Minez jusqu\'au niveau le plus profond accessible',
      'Cherchez le passage caché derrière les gros dépôts de minerai',
      'Suivez les marquages discrets sur les murs (traces de peinture)',
      'Traversez la caverne inondée (oxygène limité)',
      'Remontez par le puits naturel vers la surface',
      'Rejoignez le point d\'extraction à ~800m de la sortie',
    ],
    warning: 'Route la plus longue et la plus dangereuse. Des PNJ hostiles patrouillent dans les grottes profondes. Partez en groupe si possible.',
  },
];

const PRISON_ITEMS = [
  { name: 'Oxypens', icon: Wind, color: 'text-cyan-400', description: 'Recharge d\'oxygène portable. Essentiel pour l\'évasion ou les zones profondes des mines.', source: 'Distributeurs muraux, butin sur détenus', price: '200 merits' },
  { name: 'Medpens', icon: Heart, color: 'text-success-400', description: 'Soigne les blessures et restaure la santé. Indispensable après un combat ou une chute.', source: 'Distributeurs muraux, missions', price: '300 merits' },
  { name: 'Couteau improvise', icon: Swords, color: 'text-danger-400', description: 'Arme de mêlée craftable. Faible dégâts mais seule option offensive en prison.', source: 'Craft avec matériaux de mine', price: 'Gratuit (craft)' },
  { name: 'Lampe frontale', icon: Eye, color: 'text-gold-400', description: 'Éclairage portable pour les zones non-éclairées des mines profondes.', source: 'Terminal d\'équipement', price: '100 merits' },
  { name: 'Combinaison EVA', icon: Shield, color: 'text-purple-400', description: 'Combinaison spatiale basique protégeant de l\'environnement hostile d\'Aberdeen. Nécessaire pour l\'évasion extérieure.', source: 'Trouvée dans les mines profondes (rare)', price: 'Non achetable' },
  { name: 'Ration alimentaire', icon: Package, color: 'text-warning-400', description: 'Nourriture de prison. Restaure un peu de stamina et réduit les effets de faim.', source: 'Cafétéria, distributeurs', price: '50 merits' },
];

const TIPS = [
  { icon: Pickaxe, color: 'text-gold-400', title: 'Minez malin, pas longtemps', text: 'Concentrez-vous sur les veines de Hadanite (bleu-violet). Elles valent 3x plus que les roches standard. Un cycle ciblé de 15 min peut valoir 45 min de minage aléatoire.' },
  { icon: Users, color: 'text-cyan-400', title: 'Formez un groupe', text: 'Les détenus en groupe minent plus vite et se protègent mutuellement. La prison est un lieu PvP — les joueurs hostiles sont fréquents dans les mines.' },
  { icon: Clock, color: 'text-slate-400', title: 'Ne vous déconnectez pas', text: 'La réduction passive de peine ne fonctionne que quand vous êtes connecté. Si vous devez AFK, trouvez un coin sûr au hub principal plutôt que dans les mines.' },
  { icon: AlertTriangle, color: 'text-danger-400', title: 'Mourir rallonge la peine', text: 'Chaque mort en prison ajoute du temps à votre sentence. Évitez les combats inutiles et soyez prudent dans les zones profondes.' },
  { icon: Shield, color: 'text-purple-400', title: 'Préparez votre évasion', text: 'Stockez des Oxypens et Medpens AVANT de tenter une évasion. Coordonnez avec un allié dehors pour qu\'il vienne vous chercher sur Aberdeen.' },
  { icon: Target, color: 'text-warning-400', title: 'Surveillez les autres détenus', text: 'Certains joueurs campent les routes d\'évasion pour tuer les évadés. Observez les mouvements avant de vous lancer dans un tunnel.' },
  { icon: DollarSign, color: 'text-success-400', title: 'Missions > Minage pour CS3+', text: 'Pour les longues peines (CS3+), les missions internes rapportent plus de merits/heure que le minage. Alternez entre les deux pour éviter l\'ennui.' },
  { icon: Star, color: 'text-gold-400', title: 'L\'évasion ne supprime pas le CS', text: 'S\'évader de prison vous libère mais votre CrimeStat reste actif. Vous devrez quand même hacker un terminal de sécurité ou visiter Grim HEX pour le supprimer.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Expandable Section
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, iconColor, badge, badgeClass, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={clsx('w-5 h-5', iconColor)} />}
          <span className="font-semibold text-slate-200">{title}</span>
          {badge && <span className={clsx('badge', badgeClass)}>{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <div className="border-t border-space-400/20 p-4">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — PrisonGuide
══════════════════════════════════════════════════════════════ */

export default function PrisonGuide() {
  const [expandedRoute, setExpandedRoute] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Lock className="w-7 h-7 text-warning-400" />
            Prison — Klescher Rehabilitation Facility
          </h1>
          <span className="badge badge-red">Alpha 4.6</span>
          <span className="badge badge-yellow">Aberdeen, Stanton</span>
        </div>
        <p className="page-subtitle mt-1">
          Guide complet du systeme carceral de Star Citizen — comment y entrer, en sortir, et survivre entre les deux
        </p>
      </div>

      {/* ── STATS RAPIDES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Niveaux CrimeStat', value: '5', color: 'text-danger-400', icon: AlertTriangle },
          { label: 'Routes d\'evasion', value: '3', color: 'text-cyan-400', icon: Map },
          { label: 'Sources de merits', value: '4', color: 'text-gold-400', icon: Pickaxe },
          { label: 'Items disponibles', value: '6', color: 'text-purple-400', icon: Package },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={clsx('flex-shrink-0', s.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className={clsx('text-xl font-bold font-display', s.color)}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AVERTISSEMENT ── */}
      <div className="p-4 rounded-xl bg-warning-500/10 border border-warning-500/30 flex gap-3">
        <Info className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-300">
          <strong className="text-warning-400">Note :</strong> Klescher Rehabilitation Facility est situee sur Aberdeen, lune de Hurston dans le systeme Stanton. Les durees de peine et les taux de merits sont approximatifs et peuvent varier selon les patchs.
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
         SECTION 1 — Comment on finit en prison
      ══════════════════════════════════════════════════════════ */}
      <ExpandableSection
        title="Comment on finit en prison"
        icon={Lock}
        iconColor="text-danger-400"
        defaultOpen
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {HOW_YOU_GET_IN.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.trigger} className={clsx('p-4 rounded-xl border', item.border, item.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={clsx('w-5 h-5', item.color)} />
                  <h4 className={clsx('font-semibold', item.color)}>{item.trigger}</h4>
                </div>
                <p className="text-sm text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ══════════════════════════════════════════════════════════
         SECTION 2 — Systeme de Merits
      ══════════════════════════════════════════════════════════ */}
      <ExpandableSection
        title="Systeme de Merits"
        icon={Star}
        iconColor="text-gold-400"
        badge="4 sources"
        badgeClass="badge-yellow"
        defaultOpen
      >
        <p className="text-sm text-slate-400 mb-4">
          Les merits sont la monnaie interne de Klescher. Accumulez-en suffisamment pour purger votre peine et etre libere. Voici les differentes methodes pour en gagner.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {MERIT_SOURCES.map(source => {
            const Icon = source.icon;
            return (
              <div key={source.id} className={clsx('p-4 rounded-xl border', source.border, source.bg)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={clsx('w-5 h-5', source.color)} />
                    <h4 className={clsx('font-semibold', source.color)}>{source.name}</h4>
                  </div>
                  <span className="badge badge-blue">{source.rate}</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{source.description}</p>
                <ul className="space-y-1">
                  {source.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <Zap className="w-3 h-3 text-gold-400 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ══════════════════════════════════════════════════════════
         SECTION 3 — Durees de Peine
      ══════════════════════════════════════════════════════════ */}
      <ExpandableSection
        title="Durees de Peine par CrimeStat"
        icon={Clock}
        iconColor="text-warning-400"
        defaultOpen
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Niveau</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Duree estimee</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Merits requis</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium hidden sm:table-cell">Description</th>
              </tr>
            </thead>
            <tbody>
              {SENTENCES.map(s => (
                <tr key={s.cs} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                  <td className="py-3 px-3">
                    <span className={clsx('badge', s.color)}>{s.cs}</span>
                  </td>
                  <td className={clsx('py-3 px-3 font-semibold', s.glow)}>{s.duration}</td>
                  <td className="py-3 px-3 text-slate-300">{s.merits.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400 hidden sm:table-cell">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-space-700/40 border border-space-400/10">
          <p className="text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            Les durees sont basees sur la reduction passive uniquement. En combinant minage + missions, vous pouvez diviser ces temps par 3 a 5.
          </p>
        </div>
      </ExpandableSection>

      {/* ══════════════════════════════════════════════════════════
         SECTION 4 — Routes d'Evasion
      ══════════════════════════════════════════════════════════ */}
      <ExpandableSection
        title="Routes d'Evasion"
        icon={Flame}
        iconColor="text-danger-400"
        badge="3 routes"
        badgeClass="badge-red"
      >
        <p className="text-sm text-slate-400 mb-4">
          S'evader de Klescher est risque mais possible. Trois routes principales existent — chacune avec ses propres defis. L'evasion ne supprime pas votre CrimeStat.
        </p>
        <div className="space-y-3">
          {ESCAPE_ROUTES.map(route => {
            const Icon = route.icon;
            const isOpen = expandedRoute === route.id;
            return (
              <div key={route.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedRoute(isOpen ? null : route.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold text-slate-200">{route.name}</span>
                    <span className={clsx('badge', route.diffBadge)}>{route.difficulty}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="border-t border-space-400/20 p-4 space-y-4">
                    <p className="text-sm text-slate-300">{route.description}</p>

                    {/* Equipement requis */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Equipement requis</h5>
                      <div className="flex flex-wrap gap-2">
                        {route.equipment.map((eq, i) => (
                          <span key={i} className="badge badge-blue">{eq}</span>
                        ))}
                      </div>
                    </div>

                    {/* Etapes */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Etapes</h5>
                      <ol className="space-y-2">
                        {route.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-space-600 border border-space-400/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Avertissement */}
                    <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/30 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300">{route.warning}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ══════════════════════════════════════════════════════════
         SECTION 5 — Economie de la Prison
      ══════════════════════════════════════════════════════════ */}
      <ExpandableSection
        title="Economie de la Prison"
        icon={DollarSign}
        iconColor="text-gold-400"
        badge="6 items"
        badgeClass="badge-yellow"
      >
        <p className="text-sm text-slate-400 mb-4">
          Klescher dispose de sa propre economie basee sur les merits. Voici les items disponibles et comment les obtenir.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRISON_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={clsx('w-5 h-5', item.color)} />
                  <h4 className="font-semibold text-slate-200">{item.name}</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source</span>
                    <span className="text-slate-300">{item.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix</span>
                    <span className="text-gold-400 font-semibold">{item.price}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ══════════════════════════════════════════════════════════
         SECTION 6 — Tips & Astuces
      ══════════════════════════════════════════════════════════ */}
      <ExpandableSection
        title="Tips & Astuces"
        icon={Zap}
        iconColor="text-cyan-400"
        badge="8 tips"
        badgeClass="badge-green"
        defaultOpen
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="p-4 rounded-xl bg-space-700/40 border border-space-400/10 hover:border-space-400/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={clsx('w-4 h-4', tip.color)} />
                  <h4 className="font-semibold text-sm text-slate-200">{tip.title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── FOOTER ── */}
      <div className="p-4 rounded-xl bg-space-700/40 border border-space-400/10 text-center">
        <p className="text-xs text-slate-500">
          Donnees basees sur Star Citizen Alpha 4.6 — Les mecaniques de prison evoluent regulierement. Consultez les patch notes pour les changements recents.
        </p>
      </div>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="prison" />
    </div>
  );
}
