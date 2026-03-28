import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Wrench, Shield, Zap, Gauge, Thermometer, ChevronDown, ChevronUp,
  AlertTriangle, TrendingDown, Settings, DollarSign, Clock, Heart,
  Battery, Fan, Navigation, Crosshair, BarChart3, CheckCircle,
  XCircle, ArrowRight, Lightbulb, Flame, RefreshCw,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ═══════════════════════════════════════════════════════
   DONNÉES — DÉGRADATION DES COMPOSANTS
   ═══════════════════════════════════════════════════════ */

const COMPONENT_TYPES = [
  {
    id: 'powerplant',
    name: 'Power Plant',
    nameFr: 'Réacteur',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-500/20 text-yellow-300',
    degradeRate: '0.8% / heure',
    maxWear: 100,
    criticalThreshold: 35,
    effects: [
      'Réduction de la puissance maximale générée',
      'Pics de consommation aléatoires',
      'Risque de coupure totale sous 20%',
      'Surchauffe accélérée des autres composants',
    ],
    tips: 'Underclock à 90% pour réduire l\'usure de ~40%. Éviter les surcharges prolongées.',
  },
  {
    id: 'cooler',
    name: 'Cooler',
    nameFr: 'Refroidisseur',
    icon: Fan,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
    degradeRate: '0.5% / heure',
    maxWear: 100,
    criticalThreshold: 30,
    effects: [
      'Capacité de dissipation thermique réduite',
      'Surchauffe plus fréquente du vaisseau',
      'Ralentissement forcé des armes énergie',
      'Shutdown thermique possible en combat',
    ],
    tips: 'Les coolers Grade A durent 2x plus longtemps. Toujours en avoir un de rechange.',
  },
  {
    id: 'shield',
    name: 'Shield Generator',
    nameFr: 'Générateur de bouclier',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300',
    degradeRate: '1.2% / heure de combat',
    maxWear: 100,
    criticalThreshold: 40,
    effects: [
      'HP max du bouclier réduit proportionnellement',
      'Régénération ralentie',
      'Faces tombées plus longues à rétablir',
      'Absorption des dégâts diminuée',
    ],
    tips: 'Les boucliers se dégradent surtout sous feu. Éviter les combats prolongés sans réparation.',
  },
  {
    id: 'qtdrive',
    name: 'Quantum Drive',
    nameFr: 'Moteur quantique',
    icon: Navigation,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300',
    degradeRate: '0.3% / saut',
    maxWear: 100,
    criticalThreshold: 25,
    effects: [
      'Temps de spool augmenté',
      'Consommation de quantum fuel accrue',
      'Risque d\'interdiction spontanée',
      'Échec de calibration possible sous 15%',
    ],
    tips: 'Les QT Grade A supportent ~330 sauts. Grade C seulement ~200.',
  },
  {
    id: 'weapons',
    name: 'Weapons',
    nameFr: 'Armes',
    icon: Crosshair,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-300',
    degradeRate: '1.5% / heure de tir',
    maxWear: 100,
    criticalThreshold: 30,
    effects: [
      'Dispersion accrue (précision réduite)',
      'Cadence de tir instable',
      'Dégâts réduits par projectile',
      'Enrayage possible sous 20%',
    ],
    tips: 'Les balistiques s\'usent plus vite que les energy. Alterner les groupes de feu.',
  },
];

const DEGRADATION_THRESHOLDS = [
  { range: '100% – 76%', label: 'Neuf / Bon', color: 'text-green-400', bg: 'bg-green-500/20', perfLoss: '0 – 5%', description: 'Performance nominale, aucun symptôme visible.' },
  { range: '75% – 51%', label: 'Usé', color: 'text-yellow-400', bg: 'bg-yellow-500/20', perfLoss: '5 – 15%', description: 'Légère perte de performance. Bruits intermittents, indicateurs MFD orange.' },
  { range: '50% – 26%', label: 'Dégradé', color: 'text-orange-400', bg: 'bg-orange-500/20', perfLoss: '15 – 35%', description: 'Perte notable. Pannes intermittentes, surchauffe fréquente, alertes cockpit.' },
  { range: '25% – 1%', label: 'Critique', color: 'text-red-400', bg: 'bg-red-500/20', perfLoss: '35 – 70%', description: 'Composant quasi inutilisable. Pannes régulières, risque de destruction.' },
  { range: '0%', label: 'Détruit', color: 'text-red-500', bg: 'bg-red-500/30', perfLoss: '100%', description: 'Composant hors service. Remplacement obligatoire.' },
];

const REPAIR_STATIONS = [
  { location: 'Port Olisar', system: 'Stanton', cost: 'Bas', speed: 'Rapide', fullRepair: true },
  { location: 'Lorville (Teasa)', system: 'Stanton', cost: 'Moyen', speed: 'Rapide', fullRepair: true },
  { location: 'Area 18 (Riker)', system: 'Stanton', cost: 'Moyen', speed: 'Rapide', fullRepair: true },
  { location: 'New Babbage (Commons)', system: 'Stanton', cost: 'Élevé', speed: 'Rapide', fullRepair: true },
  { location: 'Grim HEX', system: 'Stanton', cost: 'Élevé', speed: 'Moyen', fullRepair: true },
  { location: 'CRU-L1', system: 'Stanton', cost: 'Bas', speed: 'Moyen', fullRepair: false },
  { location: 'HUR-L1 / L2', system: 'Stanton', cost: 'Bas', speed: 'Moyen', fullRepair: false },
  { location: 'Pyro Gateway', system: 'Pyro', cost: 'Très élevé', speed: 'Lent', fullRepair: false },
  { location: 'Ruin Station', system: 'Pyro', cost: 'Très élevé', speed: 'Lent', fullRepair: true },
];

const REPAIR_COSTS = [
  { component: 'Power Plant', gradeA: '1 200 – 3 500 aUEC', gradeB: '600 – 1 800 aUEC', gradeC: '250 – 800 aUEC' },
  { component: 'Cooler', gradeA: '800 – 2 200 aUEC', gradeB: '400 – 1 200 aUEC', gradeC: '200 – 600 aUEC' },
  { component: 'Shield Gen.', gradeA: '1 500 – 4 000 aUEC', gradeB: '700 – 2 000 aUEC', gradeC: '300 – 900 aUEC' },
  { component: 'QT Drive', gradeA: '2 000 – 5 000 aUEC', gradeB: '1 000 – 2 800 aUEC', gradeC: '400 – 1 200 aUEC' },
  { component: 'Armes (S3)', gradeA: '500 – 1 500 aUEC', gradeB: '250 – 800 aUEC', gradeC: '100 – 400 aUEC' },
];

const GRADE_DURABILITY = [
  { grade: 'Grade A', durability: '100%', lifespan: '~120h gameplay', cost: 'Élevé', note: 'Meilleure longévité, idéal combat/explo' },
  { grade: 'Grade B', durability: '70%', lifespan: '~85h gameplay', cost: 'Moyen', note: 'Bon compromis prix/durabilité' },
  { grade: 'Grade C', durability: '45%', lifespan: '~55h gameplay', cost: 'Bas', note: 'Budget, remplacement fréquent' },
  { grade: 'Grade D (stock)', durability: '30%', lifespan: '~35h gameplay', cost: 'Inclus', note: 'Composant d\'usine, à remplacer rapidement' },
];

const MAINTENANCE_TIPS = [
  {
    title: 'Underclock les composants',
    icon: Settings,
    description: 'Réduire la puissance à 90% sur le power plant diminue l\'usure de ~40% sans impact notable sur les performances. Applicable aussi aux coolers et boucliers hors combat.',
  },
  {
    title: 'Réparer régulièrement',
    icon: Wrench,
    description: 'Ne pas attendre le seuil critique. Réparer au-dessus de 60% coûte 2-3x moins cher qu\'une réparation d\'urgence sous 25%.',
  },
  {
    title: 'Alterner les groupes de feu',
    icon: Crosshair,
    description: 'Répartir le tir entre plusieurs groupes d\'armes réduit l\'usure individuelle. Les armes énergie s\'usent moins vite que les balistiques.',
  },
  {
    title: 'Éviter les surcharges thermiques',
    icon: Thermometer,
    description: 'Un vaisseau en surchauffe accélère la dégradation de TOUS les composants. Couper les systèmes non essentiels en cas de pic thermique.',
  },
  {
    title: 'Investir en Grade A',
    icon: TrendingDown,
    description: 'Le coût initial est 3x plus élevé mais la durée de vie est 3.5x celle du Grade D. Rentabilisé après ~30h de gameplay.',
  },
  {
    title: 'Builds durables',
    icon: Heart,
    description: 'Pour l\'exploration longue durée : Power Plant Grade A underclocké + Cooler Grade A + Shield Grade B. Réduit la fréquence de maintenance de 60%.',
  },
];

/* ═══════════════════════════════════════════════════════
   COMPOSANT EXPANDABLE SECTION
   ═══════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-space-800 rounded-xl border border-space-400/20 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="p-4 pt-0 border-t border-space-400/10">{children}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ═══════════════════════════════════════════════════════ */

export default function DegradationGuide() {
  const [selectedComponent, setSelectedComponent] = useState(null);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-amber-500/10 via-space-800 to-space-800 rounded-xl p-6 border border-amber-500/20">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Wrench className="w-8 h-8 text-amber-400" />
          Dégradation & Maintenance
        </h1>
        <p className="text-slate-400 mt-2">
          Comprendre l'usure des composants, les seuils de performance, la réparation et les stratégies de maintenance préventive — Alpha 4.6
        </p>
      </div>

      {/* ── Section 1 : Système de dégradation ── */}
      <ExpandableSection title="Système de dégradation" icon={TrendingDown} defaultOpen>
        <div className="space-y-4 mt-4">
          <p className="text-slate-300 leading-relaxed">
            Chaque composant de vaisseau possède un indicateur de condition (0-100%). L'utilisation normale,
            les dégâts subis et les surcharges réduisent progressivement cet indicateur. Plus un composant
            est dégradé, moins il est performant — jusqu'à la panne totale.
          </p>

          <div className="bg-space-900/60 rounded-lg p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium">Facteurs d'usure accélérée</span>
            </div>
            <ul className="text-slate-300 space-y-1 text-sm list-disc list-inside">
              <li>Overclock d'un composant (+60% d'usure)</li>
              <li>Dégâts directs sur la coque (usure de zone x2)</li>
              <li>Surchauffe prolongée du vaisseau (+30% sur tous les composants)</li>
              <li>Utilisation en atmosphère dense (+15% sur les moteurs et coolers)</li>
              <li>Composant Grade C ou D (durabilité inférieure de base)</li>
            </ul>
          </div>

          {/* Tableau des seuils */}
          <h3 className="text-base font-semibold text-slate-200 mt-4">Seuils de performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Condition</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">État</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Perte perf.</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {DEGRADATION_THRESHOLDS.map((t, i) => (
                  <tr key={i} className="border-b border-space-400/10">
                    <td className="py-2 px-3 font-mono text-slate-200">{t.range}</td>
                    <td className="py-2 px-3">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', t.bg, t.color)}>
                        {t.label}
                      </span>
                    </td>
                    <td className={clsx('py-2 px-3 font-medium', t.color)}>{t.perfLoss}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 2 : Types de composants ── */}
      <ExpandableSection title="Dégradation par type de composant" icon={Settings}>
        <div className="space-y-4 mt-4">
          <p className="text-slate-300 text-sm">
            Sélectionnez un composant pour voir ses caractéristiques d'usure et conseils associés.
          </p>

          {/* Sélecteur */}
          <div className="flex flex-wrap gap-2">
            {COMPONENT_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedComponent(selectedComponent === c.id ? null : c.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  selectedComponent === c.id
                    ? [c.bg, c.border, c.color]
                    : 'border-space-400/20 text-slate-400 hover:text-slate-200 hover:border-space-400/40'
                )}
              >
                <c.icon className="w-4 h-4" />
                {c.nameFr}
              </button>
            ))}
          </div>

          {/* Détails du composant sélectionné */}
          {selectedComponent && (() => {
            const comp = COMPONENT_TYPES.find((c) => c.id === selectedComponent);
            return (
              <div className={clsx('rounded-lg p-4 border', comp.bg, comp.border)}>
                <div className="flex items-center gap-3 mb-3">
                  <comp.icon className={clsx('w-6 h-6', comp.color)} />
                  <div>
                    <h3 className="text-slate-100 font-semibold">{comp.nameFr} ({comp.name})</h3>
                    <span className={clsx('text-xs font-mono', comp.color)}>
                      Taux d'usure : {comp.degradeRate} — Seuil critique : {comp.criticalThreshold}%
                    </span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Effets de la dégradation</h4>
                    <ul className="space-y-1">
                      {comp.effects.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-space-900/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Conseil
                    </h4>
                    <p className="text-sm text-slate-400">{comp.tips}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tableau récapitulatif */}
          <h3 className="text-base font-semibold text-slate-200 mt-4">Récapitulatif des taux d'usure</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Composant</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Taux d'usure</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Seuil critique</th>
                </tr>
              </thead>
              <tbody>
                {COMPONENT_TYPES.map((c) => (
                  <tr key={c.id} className="border-b border-space-400/10">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <c.icon className={clsx('w-4 h-4', c.color)} />
                        <span className="text-slate-200">{c.nameFr}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-mono text-xs">{c.degradeRate}</td>
                    <td className="py-2 px-3">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', c.badge)}>
                        {c.criticalThreshold}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 3 : Impact sur les performances ── */}
      <ExpandableSection title="Impact sur les performances" icon={BarChart3}>
        <div className="space-y-4 mt-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            La dégradation affecte les performances de manière non linéaire. Les premiers 25% de perte
            sont peu visibles, mais en dessous de 50% la chute s'accélère drastiquement.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-space-900/60 rounded-lg p-4 border border-red-500/20">
              <Flame className="w-6 h-6 text-red-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Surchauffe</h4>
              <p className="text-xs text-slate-400 mt-1">
                Un cooler à 40% génère des pics thermiques toutes les 2-3 min. Les armes énergie sont
                les premières touchées, suivies du power plant.
              </p>
            </div>
            <div className="bg-space-900/60 rounded-lg p-4 border border-orange-500/20">
              <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Pannes aléatoires</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sous 30%, chaque composant a une chance de panne temporaire (2-8 sec). Cumulé sur
                plusieurs composants dégradés, le risque devient critique.
              </p>
            </div>
            <div className="bg-space-900/60 rounded-lg p-4 border border-yellow-500/20">
              <Battery className="w-6 h-6 text-yellow-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Surconsommation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Un composant dégradé consomme jusqu'à 25% de puissance supplémentaire pour maintenir
                un rendement inférieur. Impact direct sur le power budget.
              </p>
            </div>
          </div>

          <div className="bg-space-900/60 rounded-lg p-4 border border-space-400/20">
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Cascade de pannes</h4>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">Cooler dégradé</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-300">Surchauffe vaisseau</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-2 py-1 rounded bg-red-500/20 text-red-300">Power Plant stressé</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-2 py-1 rounded bg-red-500/30 text-red-400">Panne boucliers</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="px-2 py-1 rounded bg-red-500/40 text-red-500 font-bold">Destruction</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Un seul composant critique peut entraîner une réaction en chaîne. La maintenance préventive est essentielle.
            </p>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 4 : Réparation ── */}
      <ExpandableSection title="Réparation" icon={Wrench}>
        <div className="space-y-4 mt-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            La réparation restaure la condition d'un composant mais ne peut pas dépasser un plafond qui
            diminue avec le temps. Un composant réparé 5+ fois ne pourra plus remonter au-dessus de ~85%.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-space-900/60 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">Réparation en station</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>Restaure jusqu'au plafond de condition</li>
                <li>Coût basé sur le grade et l'état actuel</li>
                <li>Instantanée dans les stations principales</li>
                <li>Répare tous les composants simultanément</li>
              </ul>
            </div>
            <div className="bg-space-900/60 rounded-lg p-3 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Auto-repair (multitool)</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>Limité à +15% de condition max</li>
                <li>Nécessite un multitool + attachement repair</li>
                <li>Ne fonctionne pas sur les composants détruits (0%)</li>
                <li>Consomme des charges (3-5 par composant)</li>
              </ul>
            </div>
          </div>

          {/* Stations de réparation */}
          <h3 className="text-base font-semibold text-slate-200">Stations de réparation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Station</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Système</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Coût</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Vitesse</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Réparation complète</th>
                </tr>
              </thead>
              <tbody>
                {REPAIR_STATIONS.map((s, i) => (
                  <tr key={i} className="border-b border-space-400/10">
                    <td className="py-2 px-3 text-slate-200">{s.location}</td>
                    <td className="py-2 px-3 text-slate-400">{s.system}</td>
                    <td className="py-2 px-3">
                      <span className={clsx('text-xs font-medium', {
                        'text-green-400': s.cost === 'Bas',
                        'text-yellow-400': s.cost === 'Moyen',
                        'text-orange-400': s.cost === 'Élevé',
                        'text-red-400': s.cost === 'Très élevé',
                      })}>
                        {s.cost}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 text-xs">{s.speed}</td>
                    <td className="py-2 px-3">
                      {s.fullRepair
                        ? <CheckCircle className="w-4 h-4 text-green-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Coûts de réparation */}
          <h3 className="text-base font-semibold text-slate-200 mt-4">Coûts de réparation estimés (50% → 100%)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Composant</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Grade A</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Grade B</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Grade C</th>
                </tr>
              </thead>
              <tbody>
                {REPAIR_COSTS.map((r, i) => (
                  <tr key={i} className="border-b border-space-400/10">
                    <td className="py-2 px-3 text-slate-200 font-medium">{r.component}</td>
                    <td className="py-2 px-3 text-amber-300 font-mono text-xs">{r.gradeA}</td>
                    <td className="py-2 px-3 text-slate-300 font-mono text-xs">{r.gradeB}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-xs">{r.gradeC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 5 : Remplacement vs Réparation ── */}
      <ExpandableSection title="Remplacement vs Réparation" icon={RefreshCw}>
        <div className="space-y-4 mt-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Après plusieurs cycles de réparation, le plafond de condition diminue. Il devient alors plus
            rentable de remplacer le composant. Le seuil de rentabilité dépend du grade.
          </p>

          <div className="bg-space-900/60 rounded-lg p-4 border border-cyan-500/20 mb-4">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Règle générale</h4>
            <p className="text-sm text-slate-400">
              Si le plafond de réparation tombe sous <span className="text-amber-300 font-medium">70%</span>,
              le remplacement est presque toujours plus économique à moyen terme.
              Pour les composants Grade A, ce seuil est atteint après environ <span className="text-amber-300 font-medium">8-10 réparations</span>.
            </p>
          </div>

          {/* Durabilité par grade */}
          <h3 className="text-base font-semibold text-slate-200">Durabilité par grade</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Grade</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Durabilité</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Durée de vie</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Coût</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_DURABILITY.map((g, i) => (
                  <tr key={i} className="border-b border-space-400/10">
                    <td className="py-2 px-3">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-bold', {
                        'bg-amber-500/20 text-amber-300': g.grade.includes('A'),
                        'bg-blue-500/20 text-blue-300': g.grade.includes('B'),
                        'bg-slate-500/20 text-slate-300': g.grade.includes('C'),
                        'bg-red-500/20 text-red-300': g.grade.includes('D'),
                      })}>
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-200 font-mono">{g.durability}</td>
                    <td className="py-2 px-3 text-slate-300 text-xs">{g.lifespan}</td>
                    <td className="py-2 px-3 text-slate-300 text-xs">{g.cost}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{g.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 6 : Maintenance préventive ── */}
      <ExpandableSection title="Maintenance préventive" icon={Heart}>
        <div className="space-y-4 mt-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Les bonnes pratiques de maintenance permettent de réduire considérablement les coûts
            d'entretien et d'éviter les pannes en mission.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {MAINTENANCE_TIPS.map((tip, i) => (
              <div
                key={i}
                className="bg-space-900/60 rounded-lg p-4 border border-space-400/20 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <tip.icon className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-semibold text-slate-200">{tip.title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-space-900/60 rounded-lg p-4 border border-cyan-500/20 mt-4">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Build recommandé : Explorateur longue durée
            </h4>
            <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div>
                <span className="text-slate-200 font-medium block">Power Plant</span>
                Grade A, underclock 90% — usure réduite de 40%
              </div>
              <div>
                <span className="text-slate-200 font-medium block">Cooler</span>
                Grade A x2 si possible — dissipation optimale, longévité max
              </div>
              <div>
                <span className="text-slate-200 font-medium block">Bouclier</span>
                Grade B suffit — économie de 35% pour 30% de durabilité en moins
              </div>
            </div>
            <p className="text-xs text-cyan-400/70 mt-3">
              Ce build réduit la fréquence de maintenance de ~60% par rapport à un loadout full Grade D stock.
            </p>
          </div>
        </div>
      </ExpandableSection>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="degradation" />
    </div>
  );
}
