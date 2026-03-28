import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Mountain, Pickaxe, ChevronDown, ChevronUp, Gem,
  AlertTriangle, MapPin, DollarSign, Shield, Package,
  Eye, Skull, Compass, Flashlight, Wind, Thermometer,
  Heart, Star, Info, BookOpen, Calculator, Clock,
  Backpack, Wrench, Snowflake, Flame,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Types de grottes
══════════════════════════════════════════════════════════════ */

const CAVE_TYPES = [
  {
    id: 'mining',
    icon: Pickaxe,
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    name: 'Grottes de Minage',
    description: 'Grottes riches en minéraux FPS (Hadanite, Aphorite, Dolivine). Source principale de revenus pour les mineurs à pied. Les dépôts sont visibles grâce à leur lueur colorée.',
    features: ['Dépôts minéraux lumineux', 'Multitool + tête de minage requis', 'Backpack grande capacité recommandé', 'Sessions de 20-40 min'],
    profitLevel: 'Élevé',
    profitBadge: 'badge-green',
    difficulty: 'Facile',
  },
  {
    id: 'exploration',
    icon: Compass,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    name: 'Grottes d\'Exploration',
    description: 'Grottes labyrinthiques avec du loot dispersé : data drives, armes, armures, consommables. Idéales pour les explorateurs cherchant des objets rares et de la découverte.',
    features: ['Data drives cryptés', 'Armes et armures au sol', 'Caisses de loot', 'Passages cachés'],
    profitLevel: 'Variable',
    profitBadge: 'badge-blue',
    difficulty: 'Moyen',
  },
  {
    id: 'hostile',
    icon: Skull,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    name: 'Grottes Hostiles',
    description: 'Grottes occupées par des PNJ hostiles (pirates, hors-la-loi). Environnement dangereux avec des pièges naturels, des passages effondrés et une visibilité réduite.',
    features: ['PNJ hostiles armés', 'Pièges et effondrements', 'Visibilité très réduite', 'Loot de combat possible'],
    profitLevel: 'Risqué',
    profitBadge: 'badge-red',
    difficulty: 'Difficile',
  },
  {
    id: 'mixed',
    icon: Star,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    name: 'Grottes Mixtes',
    description: 'Combinaison de minage, exploration et présence hostile. Les grottes les plus complètes mais aussi les plus imprévisibles. Récompenses maximales pour les joueurs préparés.',
    features: ['Minerais + loot + ennemis', 'Multi-objectifs possibles', 'Grande taille', 'Préparation essentielle'],
    profitLevel: 'Maximum',
    profitBadge: 'badge-purple',
    difficulty: 'Variable',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Minéraux FPS
══════════════════════════════════════════════════════════════ */

const MINERALS = [
  { name: 'Hadanite', color: 'text-pink-400', colorDot: 'bg-pink-400', description: 'Rose / Violet', price: 275, unit: 'aUEC/unité', locations: 'Aberdeen, Arial, Daymar', rarity: 'Peu commun', tier: 'Premium' },
  { name: 'Aphorite', color: 'text-blue-400', colorDot: 'bg-blue-400', description: 'Bleu lumineux', price: 152, unit: 'aUEC/unité', locations: 'Cellin, Yela, Daymar', rarity: 'Peu commun', tier: 'Intermédiaire' },
  { name: 'Dolivine', color: 'text-lime-400', colorDot: 'bg-lime-400', description: 'Jaune / Vert', price: 130, unit: 'aUEC/unité', locations: 'Aberdeen, Arial', rarity: 'Peu commun', tier: 'Intermédiaire' },
  { name: 'Quartz', color: 'text-slate-300', colorDot: 'bg-slate-300', description: 'Blanc translucide', price: 1.4, unit: 'aUEC/unité', locations: 'Commun partout', rarity: 'Très commun', tier: 'Basique' },
  { name: 'Corundum', color: 'text-red-400', colorDot: 'bg-red-400', description: 'Rouge rubis', price: 2.7, unit: 'aUEC/unité', locations: 'Fréquent partout', rarity: 'Commun', tier: 'Basique' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Équipement requis
══════════════════════════════════════════════════════════════ */

const EQUIPMENT = [
  {
    id: 'multitool',
    icon: Wrench,
    name: 'Multitool + Tête de minage',
    description: 'Indispensable pour extraire les minéraux. Équipez une tête OreBit (standard) ou Hofstede (plus rapide, plus chère). Sans Multitool, impossible de miner.',
    priority: 'Obligatoire',
    badge: 'badge-red',
  },
  {
    id: 'backpack',
    icon: Backpack,
    name: 'Backpack grande capacité',
    description: 'Un sac à dos large (type Pembroke ou MacFlex) maximise le nombre d\'unités transportables. Chaque unité de minerai prend un slot — la capacité de stockage détermine votre profit par run.',
    priority: 'Obligatoire',
    badge: 'badge-red',
  },
  {
    id: 'armor',
    icon: Shield,
    name: 'Armure légère / médium',
    description: 'Privilégiez la mobilité en grotte. L\'armure lourde ralentit dans les passages étroits. L\'armure médium offre un bon compromis si vous craignez des hostiles.',
    priority: 'Recommandé',
    badge: 'badge-yellow',
  },
  {
    id: 'light',
    icon: Flashlight,
    name: 'Lampe torche (casque)',
    description: 'Les grottes sont très sombres. La lampe intégrée au casque (touche T) est essentielle pour repérer les dépôts minéraux et naviguer sans tomber.',
    priority: 'Obligatoire',
    badge: 'badge-red',
  },
  {
    id: 'oxypens',
    icon: Wind,
    name: 'OxyPens x3–5',
    description: 'Certaines zones de grottes n\'ont pas d\'oxygène. Sans OxyPens de rechange, vous risquez l\'asphyxie. Emportez 3 minimum, 5 pour les grottes profondes.',
    priority: 'Obligatoire',
    badge: 'badge-red',
  },
  {
    id: 'medpens',
    icon: Heart,
    name: 'MedPens x3',
    description: 'Les chutes et impacts sont fréquents en grotte. Gardez au moins 3 MedPens pour soigner les blessures. Un ParaMed est un bonus pour les dégâts graves.',
    priority: 'Recommandé',
    badge: 'badge-yellow',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Emplacements de grottes
══════════════════════════════════════════════════════════════ */

const CAVE_LOCATIONS = [
  {
    moon: 'Daymar',
    planet: 'Crusader',
    icon: '🌙',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    caves: '3–4 grottes de minage',
    minerals: ['Hadanite', 'Aphorite'],
    hazards: 'Température modérée, atmosphère respirable en surface',
    notes: 'Meilleur spot pour débuter — grottes accessibles, climat doux.',
  },
  {
    moon: 'Aberdeen',
    planet: 'Hurston',
    icon: '🔥',
    color: 'text-red-400',
    border: 'border-red-500/30',
    caves: '2–3 grottes',
    minerals: ['Hadanite', 'Dolivine'],
    hazards: 'Chaleur extrême en surface ! Courez vers l\'entrée de la grotte.',
    notes: 'Excellent pour l\'Hadanite mais la chaleur de surface est mortelle sans armure adaptée.',
  },
  {
    moon: 'Cellin',
    planet: 'Crusader',
    icon: '❄️',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    caves: '2 grottes',
    minerals: ['Aphorite'],
    hazards: 'Froid — armure thermique recommandée.',
    notes: 'Grottes moins fréquentées, bon pour farmer l\'Aphorite tranquillement.',
  },
  {
    moon: 'Yela',
    planet: 'Crusader',
    icon: '🧊',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    caves: '2 grottes',
    minerals: ['Aphorite'],
    hazards: 'Froid extrême — OxyPens et protection thermique indispensables.',
    notes: 'Anneaux de Yela rendent l\'approche visuellement spectaculaire.',
  },
  {
    moon: 'Arial',
    planet: 'Hurston',
    icon: '🌋',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    caves: '2 grottes',
    minerals: ['Dolivine'],
    hazards: 'Environnement volcanique — chaleur et faible visibilité en surface.',
    notes: 'Dolivine concentrée, moins populaire que Daymar pour le minage.',
  },
  {
    moon: 'Hurston (surface)',
    planet: 'Stanton',
    icon: '🏜️',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    caves: '2–3 grottes exploration',
    minerals: [],
    hazards: 'PNJ hostiles possibles dans certaines grottes.',
    notes: 'Principalement des grottes d\'exploration avec loot, pas de minage majeur.',
  },
  {
    moon: 'Lunes microTech',
    planet: 'microTech',
    icon: '🏔️',
    color: 'text-slate-400',
    border: 'border-slate-500/30',
    caves: 'Grottes rares',
    minerals: [],
    hazards: 'Blizzards, froid intense, navigation difficile.',
    notes: 'Très peu de grottes connues — environnement hostile.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Dangers
══════════════════════════════════════════════════════════════ */

const DANGERS = [
  {
    id: 'fall',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    title: 'Chutes mortelles',
    content: [
      'Les grottes contiennent des passages étroits, des rebords glissants et des trous profonds.',
      'Avancez lentement et utilisez la lampe torche en permanence pour repérer les gouffres.',
      'Accroupissez-vous dans les passages étroits pour éviter de glisser.',
      'Une chute de plus de 10m est généralement fatale — pas de seconde chance.',
    ],
  },
  {
    id: 'oxygen',
    icon: Wind,
    color: 'text-cyan-400',
    title: 'Manque d\'oxygène',
    content: [
      'Certaines sections de grottes sont dépressurisées ou sans atmosphère respirable.',
      'Vérifiez votre jauge O2 régulièrement — elle descend vite dans les zones sans air.',
      'Gardez toujours 1 OxyPen de réserve pour le chemin du retour.',
      'Le temps de réaction entre l\'alerte O2 et l\'asphyxie est très court.',
    ],
  },
  {
    id: 'hostiles',
    icon: Skull,
    color: 'text-red-400',
    title: 'PNJ hostiles',
    content: [
      'Certaines grottes abritent des hors-la-loi ou pirates qui attaquent à vue.',
      'Ils sont souvent embusqués dans des zones sombres — la lampe peut les révéler.',
      'En grotte hostile, gardez une arme prête et avancez prudemment.',
      'Les ennemis peuvent spawner derrière vous si vous progressez trop vite.',
    ],
  },
  {
    id: 'collision',
    icon: Mountain,
    color: 'text-orange-400',
    title: 'Bugs de collision',
    content: [
      'Les rochers et parois peuvent causer des bugs de clipping, vous coinçant dans la géométrie.',
      'Évitez de sauter contre les parois ou de vous faufiler dans des espaces très étroits.',
      'Si vous êtes coincé, essayez de vous accroupir ou de ramper pour vous libérer.',
      'En dernier recours, le /unstuck ou un suicide peut être nécessaire.',
    ],
  },
  {
    id: 'lost',
    icon: Compass,
    color: 'text-purple-400',
    title: 'Perte de chemin',
    content: [
      'Il n\'y a pas de GPS ni de carte en grotte — la navigation est entièrement manuelle.',
      'Mémorisez les embranchements et revenez par le même chemin.',
      'Certaines grottes ont des boucles qui donnent l\'impression de tourner en rond.',
      'Astuce : laissez des objets au sol (lampe, item) comme marqueurs de chemin.',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tips
══════════════════════════════════════════════════════════════ */

const TIPS = [
  { icon: Pickaxe, text: 'La tête de minage Hofstede est plus rapide que l\'OreBit mais coûte plus cher. Investissez-y dès que possible pour accélérer vos sessions.' },
  { icon: Eye, text: 'Les dépôts d\'Hadanite brillent en rose/violet dans le noir — éteignez votre lampe brièvement pour repérer les lueurs au loin.' },
  { icon: MapPin, text: 'Garez votre vaisseau à plat près de l\'entrée de la grotte. Un vaisseau renversé par le vent = mission terminée.' },
  { icon: Clock, text: 'Une session optimale dure 20-40 minutes. Au-delà, le risque de bug ou d\'incident augmente sans gain proportionnel.' },
  { icon: DollarSign, text: 'Vendez vos minéraux à un terminal de raffinage ou de commerce (ex: Lorville, Area18). Comparez les prix entre stations.' },
  { icon: Shield, text: 'En grotte hostile, portez une armure médium et emportez une arme secondaire — les espaces clos favorisent le CQB.' },
  { icon: Backpack, text: 'Videz votre inventaire avant d\'entrer en grotte. Chaque slot compte pour maximiser le profit par run.' },
  { icon: Star, text: 'Les grottes se réinitialisent avec les server meshs. Si une grotte est vide, changez de serveur ou revenez plus tard.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Section Expandable
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, color, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={clsx('rounded-lg border bg-space-800/50 overflow-hidden', open ? 'border-space-400/30' : 'border-space-400/10')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-space-700/40 transition-colors"
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon size={20} className={color || 'text-cyan-400'} />}
          <span className="font-semibold text-slate-200">{title}</span>
        </span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Calculateur de profit
══════════════════════════════════════════════════════════════ */

function ProfitCalculator() {
  const [units, setUnits] = useState(100);

  const profits = MINERALS.filter(m => m.price >= 100).map(m => ({
    name: m.name,
    color: m.color,
    total: Math.round(units * m.price),
  }));

  return (
    <div className="rounded-lg border border-space-400/20 bg-space-800/50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Calculator size={20} className="text-gold-400" />
        <h3 className="text-lg font-bold text-slate-200">Calculateur de Profit</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Nombre d'unités minées</label>
        <input
          type="range"
          min={10}
          max={200}
          step={10}
          value={units}
          onChange={e => setUnits(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <div className="text-center text-xl font-bold text-cyan-400 mt-1">{units} unités</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {profits.map(p => (
          <div key={p.name} className="rounded-lg border border-space-400/10 bg-space-900/50 p-3 text-center">
            <div className={clsx('text-sm font-medium', p.color)}>{p.name}</div>
            <div className="text-lg font-bold text-slate-200 mt-1">{p.total.toLocaleString('fr-FR')} aUEC</div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-space-700/30 border border-space-400/10">
        <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-400">
          Temps moyen par session : <span className="text-slate-300">20–40 min</span> pour{' '}
          <span className="text-slate-300">80–120 unités</span> d'Hadanite ={' '}
          <span className="text-green-400 font-semibold">~22 000 – 33 000 aUEC</span>.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — CaveMining
══════════════════════════════════════════════════════════════ */

export default function CaveMining() {
  const [expandedType, setExpandedType] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">

      {/* ── Header ── */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Mountain size={32} className="text-green-400" />
          <h1 className="text-3xl font-bold text-slate-100">Minage en Grotte & Exploration Souterraine</h1>
        </div>
        <p className="text-slate-400 text-lg">Guide des grottes, minerais FPS et loot dans Star Citizen</p>
      </div>

      {/* ── Types de grottes ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Compass size={22} className="text-cyan-400" />
          Types de Grottes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAVE_TYPES.map(cave => {
            const Icon = cave.icon;
            const isOpen = expandedType === cave.id;
            return (
              <div
                key={cave.id}
                className={clsx(
                  'rounded-lg border p-4 cursor-pointer transition-all',
                  cave.border, cave.bg,
                  isOpen && 'ring-1 ring-space-400/30'
                )}
                onClick={() => setExpandedType(isOpen ? null : cave.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={20} className={cave.color} />
                    <h3 className={clsx('font-bold', cave.color)}>{cave.name}</h3>
                  </div>
                  {isOpen
                    ? <ChevronUp size={16} className="text-slate-400" />
                    : <ChevronDown size={16} className="text-slate-400" />}
                </div>
                <p className="text-sm text-slate-400 mb-2">{cave.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className={cave.profitBadge}>Profit : {cave.profitLevel}</span>
                  <span className="badge-blue">Difficulté : {cave.difficulty}</span>
                </div>
                {isOpen && (
                  <ul className="mt-3 space-y-1 border-t border-space-400/10 pt-3">
                    {cave.features.map((f, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className={clsx('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0', cave.color.replace('text-', 'bg-'))} />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Minéraux FPS ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Gem size={22} className="text-pink-400" />
          Minéraux FPS
        </h2>
        <div className="overflow-x-auto rounded-lg border border-space-400/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-space-800/80 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Minéral</th>
                <th className="px-4 py-3 font-medium">Couleur</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Rareté</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Localisations</th>
              </tr>
            </thead>
            <tbody>
              {MINERALS.map((m, i) => (
                <tr
                  key={m.name}
                  className={clsx(
                    'border-t border-space-400/10 hover:bg-space-700/30 transition-colors',
                    i % 2 === 0 ? 'bg-space-900/30' : 'bg-space-800/20'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={clsx('w-3 h-3 rounded-full', m.colorDot)} />
                      <span className={clsx('font-semibold', m.color)}>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{m.description}</td>
                  <td className="px-4 py-3 text-slate-200 font-mono">{m.price} aUEC</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      m.tier === 'Premium' ? 'badge-green' :
                      m.tier === 'Intermédiaire' ? 'badge-blue' : 'badge-yellow'
                    )}>
                      {m.rarity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{m.locations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Équipement requis ── */}
      <ExpandableSection title="Équipement Requis" icon={Package} color="text-green-400" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EQUIPMENT.map(eq => {
            const Icon = eq.icon;
            return (
              <div key={eq.id} className="rounded-lg border border-space-400/10 bg-space-900/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-cyan-400" />
                    <span className="font-semibold text-slate-200">{eq.name}</span>
                  </div>
                  <span className={eq.badge}>{eq.priority}</span>
                </div>
                <p className="text-sm text-slate-400">{eq.description}</p>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── Localisations ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <MapPin size={22} className="text-orange-400" />
          Localisations des Grottes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAVE_LOCATIONS.map(loc => (
            <div key={loc.moon} className={clsx('rounded-lg border p-4 bg-space-800/50', loc.border)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{loc.icon}</span>
                <h3 className={clsx('font-bold', loc.color)}>{loc.moon}</h3>
                <span className="text-xs text-slate-500">({loc.planet})</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-slate-300"><span className="text-slate-500">Grottes :</span> {loc.caves}</p>
                {loc.minerals.length > 0 && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">Minerais :</span>{' '}
                    {loc.minerals.map((m, i) => {
                      const mineral = MINERALS.find(min => min.name === m);
                      return (
                        <span key={m}>
                          {i > 0 && ', '}
                          <span className={mineral?.color || 'text-slate-300'}>{m}</span>
                        </span>
                      );
                    })}
                  </p>
                )}
                <p className="text-yellow-400/80 text-xs flex items-start gap-1">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  {loc.hazards}
                </p>
                <p className="text-slate-400 text-xs italic mt-1">{loc.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculateur de profit ── */}
      <ProfitCalculator />

      {/* ── Dangers ── */}
      <ExpandableSection title="Dangers & Risques" icon={AlertTriangle} color="text-red-400" defaultOpen={false}>
        <div className="space-y-3">
          {DANGERS.map(d => {
            const Icon = d.icon;
            return (
              <div key={d.id} className="rounded-lg border border-space-400/10 bg-space-900/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={d.color} />
                  <h4 className={clsx('font-semibold', d.color)}>{d.title}</h4>
                </div>
                <ul className="space-y-1">
                  {d.content.map((line, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-slate-600 mt-1">•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── Tips ── */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen size={22} className="text-gold-400" />
          Conseils & Astuces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-space-400/10 bg-space-800/40 p-4">
                <div className="w-8 h-8 rounded-lg bg-space-700/60 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-cyan-400" />
                </div>
                <p className="text-sm text-slate-300">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="grottes" />
    </div>
  );
}
