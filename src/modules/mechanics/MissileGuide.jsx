import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Rocket, Target, Shield, Flame, Zap, Radio,
  ChevronDown, ChevronUp, Info, AlertTriangle,
  Crosshair, Clock, Eye, Gauge, Bomb, Star,
  Lightbulb, Volume2, CircleDot, Layers,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   DONNEES — Types de missiles
══════════════════════════════════════════════════════════════ */

const MISSILE_TYPES = [
  {
    id: 'ir',
    name: 'IR (Infrarouge)',
    icon: Flame,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    badge: 'badge-red',
    tracking: 'Signature thermique (IR)',
    lockTime: 'Rapide (~2-3s)',
    countermeasure: 'Flares',
    strengths: [
      'Verrouillage le plus rapide de tous les types',
      'Excellente poursuite sur cibles avec moteurs actifs',
      'Idéal pour le dogfight rapproché',
    ],
    weaknesses: [
      'Sensible aux flares (contre-mesure la plus courante)',
      'Perd le lock si la cible coupe ses moteurs',
      'Moins efficace contre vaisseaux en mode furtif thermique',
    ],
    description:
      'Les missiles IR traquent la signature thermique de la cible. Ils sont les plus rapides a verrouiller mais aussi les plus faciles a contrer avec des flares. Privilegiez-les en dogfight rapproche ou le temps de lock est critique.',
  },
  {
    id: 'em',
    name: 'EM (Electromagnetique)',
    icon: Zap,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    badge: 'badge-blue',
    tracking: 'Signature electromagnetique (EM)',
    lockTime: 'Moyen (~4-5s)',
    countermeasure: 'Chaff',
    strengths: [
      'Bon equilibre entre temps de lock et fiabilite',
      'Efficace contre vaisseaux avec boucliers actifs',
      'Moins facilement contre par les pilotes debutants',
    ],
    weaknesses: [
      'Contre par le chaff (nuage metallique)',
      'Lock perdu si la cible reduit sa signature EM',
      'Temps de verrouillage intermediaire',
    ],
    description:
      'Les missiles EM suivent la signature electromagnetique generee par les composants actifs du vaisseau (boucliers, power plant, etc.). Un bon compromis entre vitesse de lock et resistance aux contre-mesures.',
  },
  {
    id: 'cs',
    name: 'CS (Cross-Section)',
    icon: CircleDot,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    badge: 'badge-purple',
    tracking: 'Section transversale (taille physique)',
    lockTime: 'Lent (~6-8s)',
    countermeasure: 'Noise (peu efficace)',
    strengths: [
      'Tres difficile a contrer — ni flares ni chaff ne fonctionnent',
      'Verrouillage fiable sur grandes cibles',
      'Ideal contre vaisseaux lourds et capitaux',
    ],
    weaknesses: [
      'Temps de verrouillage le plus long',
      'Moins precis contre petits chasseurs agiles',
      'Necessite de maintenir le lock plus longtemps (exposition)',
    ],
    description:
      'Les missiles CS se basent sur la taille physique de la cible. Quasi impossibles a leurrer avec des contre-mesures classiques, ils sont redoutables contre les gros vaisseaux mais necessitent un long temps de verrouillage.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNEES — Tailles de missiles
══════════════════════════════════════════════════════════════ */

const MISSILE_SIZES = [
  { size: 'S1', damage: '~1 000',   range: '~3 km',  category: 'Chasseur leger',     badge: 'badge-green',  note: 'Missiles standards pour dogfight' },
  { size: 'S2', damage: '~2 500',   range: '~5 km',  category: 'Chasseur',            badge: 'badge-green',  note: 'Le calibre le plus courant en combat' },
  { size: 'S3', damage: '~6 000',   range: '~8 km',  category: 'Moyen',               badge: 'badge-blue',   note: 'Efficace contre chasseurs et moyens' },
  { size: 'S4', damage: '~12 000',  range: '~12 km', category: 'Moyen / Lourd',       badge: 'badge-blue',   note: 'Degats significatifs, menace reelle' },
  { size: 'S5', damage: '~25 000',  range: '~15 km', category: 'Lourd',               badge: 'badge-yellow', note: 'Torpilles legeres, danger capital' },
  { size: 'S7', damage: '~80 000',  range: '~20 km', category: 'Torpille (Eclipse, Retaliator)', badge: 'badge-red', note: 'Torpilles lourdes, destructions massives' },
  { size: 'S9', damage: '~200 000+', range: '~25 km', category: 'Torpille capitale',  badge: 'badge-red',    note: 'Anti-capital, degats devastateurs' },
];

/* ══════════════════════════════════════════════════════════════
   DONNEES — Contre-mesures
══════════════════════════════════════════════════════════════ */

const COUNTERMEASURES = [
  {
    id: 'flares',
    name: 'Flares',
    icon: Flame,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    counters: 'Missiles IR',
    stock: '~20 par defaut',
    effectiveness: 'Elevee contre IR',
    description:
      'Leurres thermiques ejectes pour detourner les missiles IR. Deploiement rapide, stock limite. Activez-les juste avant l\'impact pour un effet maximal.',
    tips: [
      'Deployer 1-2 flares puis changer de direction immediatement',
      'Ne pas gaspiller — attendez que le missile soit proche',
      'Rechargez a chaque station visitee',
    ],
  },
  {
    id: 'chaff',
    name: 'Chaff',
    icon: Radio,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    counters: 'Missiles EM',
    stock: '~20 par defaut',
    effectiveness: 'Elevee contre EM',
    description:
      'Nuage de particules metalliques qui brouille les capteurs EM. Cree une fausse signature pour detourner les missiles electromagnetiques.',
    tips: [
      'Deployer le chaff puis couper brievement les systemes non-essentiels',
      'Combiner avec un changement de cap brusque',
      'Plus efficace si deploye tot dans la trajectoire du missile',
    ],
  },
  {
    id: 'noise',
    name: 'Noise (Brouillage)',
    icon: Volume2,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    counters: 'Missiles CS (efficacite limitee)',
    stock: 'Actif (consomme energie)',
    effectiveness: 'Faible a moyenne',
    description:
      'Systeme de brouillage electronique actif qui tente de perturber le guidage CS. Moins fiable que les autres contre-mesures car la section transversale ne peut pas etre "simulee" facilement.',
    tips: [
      'Utiliser en combinaison avec des manoeuvres evasives',
      'Passer derriere un asteroidde ou une structure pour couper le lock',
      'Contre les CS, l\'evasion physique reste la meilleure defense',
    ],
  },
  {
    id: 'evasion',
    name: 'Manoeuvres Evasives',
    icon: Eye,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    counters: 'Tous types (complementaire)',
    stock: 'Illimite (skill pilote)',
    effectiveness: 'Variable selon le pilote',
    description:
      'Techniques de pilotage pour echapper aux missiles : coupure de moteurs (going cold), utilisation d\'obstacles, virages brusques et timing precis.',
    tips: [
      'Couper les moteurs reduit drastiquement la signature IR',
      'Voler pres des asteroiddes ou structures pour forcer le missile a percuter un obstacle',
      'Les missiles ont un rayon de braquage limite — virages serres a haute vitesse',
      'Combiner contre-mesures + evasion pour maximiser la survie',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNEES — Torpedo gameplay
══════════════════════════════════════════════════════════════ */

const TORPEDO_DATA = [
  {
    id: 'eclipse',
    name: 'Eclipse — Attaque Torpille Furtive',
    icon: Eye,
    color: 'text-cyan-400',
    description:
      'L\'Aegis Eclipse est le bombardier furtif par excellence. Approche en mode silencieux, lance ses torpilles S9 a distance, et s\'enfuit avant detection. Technique : reduire toutes les emissions, s\'approcher a 20 km, lancer, et fuir immediatement.',
    keyPoints: [
      'Capacite : 3x torpilles S9',
      'Approche furtive obligatoire — signature IR et EM minimales',
      'Lancer a distance maximale pour eviter la riposte',
      'Un seul S9 peut detruire un vaisseau moyen',
    ],
  },
  {
    id: 'retaliator',
    name: 'Retaliator — Bombardement Lourd',
    icon: Bomb,
    color: 'text-red-400',
    description:
      'L\'Aegis Retaliator est un bombardier lourd multi-equipage. Avec ses soutes a torpilles modulaires, il peut emporter un arsenal devastateur. Necessite un equipage pour une efficacite maximale (pilote + tourelles + operateur torpilles).',
    keyPoints: [
      'Capacite : jusqu\'a 6x torpilles S9',
      'Necessite un equipage de 2-5 joueurs',
      'Tourelles defensives pour proteger des intercepteurs',
      'Approche en groupe avec escorte recommandee',
    ],
  },
  {
    id: 'defense',
    name: 'Defense Anti-Torpille',
    icon: Shield,
    color: 'text-green-400',
    description:
      'Se defendre contre les torpilles est critique pour les gros vaisseaux. Les options incluent la defense ponctuelle (point defense), le tir direct sur les torpilles, et les manoeuvres evasives coordonnees.',
    keyPoints: [
      'Point Defense : tourelles automatiques qui ciblent les torpilles entrantes',
      'Tir direct : les torpilles S5+ sont assez grosses pour etre ciblees manuellement',
      'Manoeuvres : meme un gros vaisseau peut esquiver si la torpille est detectee tot',
      'Escorte de chasseurs pour intercepter le bombardier avant le lancement',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNEES — Loadouts par type de vaisseau
══════════════════════════════════════════════════════════════ */

const LOADOUT_CATEGORIES = [
  {
    type: 'Chasseur leger',
    icon: Rocket,
    color: 'text-green-400',
    missiles: '4-8',
    sizes: 'S1-S2',
    examples: 'Arrow, Gladius, Mustang Delta',
    strategy: 'Utiliser les missiles pour finir un adversaire affaibli ou forcer une manoeuvre evasive. Stock limite, chaque tir doit compter.',
  },
  {
    type: 'Chasseur moyen',
    icon: Target,
    color: 'text-blue-400',
    missiles: '8-16',
    sizes: 'S2-S3',
    examples: 'Hornet, Sabre, Scorpius, Vanguard',
    strategy: 'Arsenal missile plus consequent. Mixer IR et EM pour forcer l\'adversaire a epuiser ses deux types de contre-mesures.',
  },
  {
    type: 'Chasseur lourd',
    icon: Shield,
    color: 'text-yellow-400',
    missiles: '16-24',
    sizes: 'S3-S4',
    examples: 'Hurricane, Ares, Constellation (tourelles)',
    strategy: 'Tirs en salve de 2-4 missiles simultanement. Les S3-S4 infligent des degats lourds meme sur des cibles bien protegees.',
  },
  {
    type: 'Bombardier',
    icon: Bomb,
    color: 'text-red-400',
    missiles: '3-6',
    sizes: 'S5-S9',
    examples: 'Eclipse, Retaliator, Harbinger',
    strategy: 'Torpilles a usage unique — chaque tir est un investissement majeur. Prioriser les cibles a haute valeur (Hammerhead, Idris, cargo charge).',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNEES — Conseils pratiques
══════════════════════════════════════════════════════════════ */

const TIPS = [
  {
    icon: Target,
    color: 'text-cyan-400',
    title: 'Mixer les types de missiles',
    text: 'Equipez un mix IR et EM pour forcer l\'ennemi a depenser flares ET chaff. Une fois ses reserves epuisees, vos missiles suivants toucheront presque a coup sur.',
  },
  {
    icon: Clock,
    color: 'text-yellow-400',
    title: 'Timing des contre-mesures',
    text: 'Deployer les CM trop tot est inutile — le missile reacquiert le lock. Attendez que le missile soit a ~1-2 km avant de lacher vos flares/chaff, puis changez immediatement de direction.',
  },
  {
    icon: Gauge,
    color: 'text-red-400',
    title: 'Gestion du stock',
    text: 'Vous avez environ 20 flares et 20 chaff. En combat prolonge, rationnez : ne deployez pas systematiquement. Parfois une manoeuvre evasive seule suffit contre un missile mal angle.',
  },
  {
    icon: Eye,
    color: 'text-purple-400',
    title: 'Going Cold contre les IR',
    text: 'Couper vos moteurs et systemes reduit votre signature IR. Les missiles IR perdent leur lock. Technique risquee en combat mais salvatrice si vous etes a court de flares.',
  },
  {
    icon: Crosshair,
    color: 'text-green-400',
    title: 'Tir en salve',
    text: 'Lancer 2-3 missiles simultanement (de types differents si possible) submerge les contre-mesures de la cible. Un seul deploiement de CM ne peut contrer qu\'un type de missile a la fois.',
  },
  {
    icon: AlertTriangle,
    color: 'text-orange-400',
    title: 'Attention aux torpilles',
    text: 'Les torpilles S5+ sont detectables au radar. Si vous voyez un contact lent et gros approcher, vous avez quelques secondes pour reagir. Changez de cap brutalement et deployez toutes vos CM.',
  },
  {
    icon: Star,
    color: 'text-gold-400',
    title: 'Missiles CS en fin de combat',
    text: 'Gardez vos missiles CS pour la fin du combat quand l\'ennemi a epuise ses contre-mesures. Leur temps de lock est long mais ils sont quasi impossibles a contrer autrement.',
  },
  {
    icon: Lightbulb,
    color: 'text-blue-400',
    title: 'Rechargement en mission',
    text: 'Chaque retour en station est une opportunite de recharger vos missiles et CM. Planifiez vos missions avec des escales regulieres plutot que d\'enchainer les combats a stock vide.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNEES — Lock-on Mechanics
══════════════════════════════════════════════════════════════ */

const LOCKON_MECHANICS = [
  {
    title: 'Temps de verrouillage par type',
    icon: Clock,
    color: 'text-cyan-400',
    content:
      'Le temps de lock depend du type de missile : IR ~2-3 secondes (le plus rapide), EM ~4-5 secondes (intermediaire), CS ~6-8 secondes (le plus lent). Ces temps varient selon la taille du missile et la distance a la cible. Un missile plus gros (S5+) met generalement un peu plus de temps a locker.',
  },
  {
    title: 'Portee de lock vs signature',
    icon: Gauge,
    color: 'text-yellow-400',
    content:
      'La portee de verrouillage effective depend de la signature de la cible. Un vaisseau avec une forte emission IR sera lockable de plus loin par un missile IR. Reduire sa signature (mode furtif, coupure de systemes) diminue la portee a laquelle l\'ennemi peut vous verrouiller. Les gros vaisseaux sont lockables de bien plus loin que les chasseurs legers.',
  },
  {
    title: 'Casser le verrouillage',
    icon: Shield,
    color: 'text-green-400',
    content:
      'Plusieurs methodes pour casser un lock en cours : passer derriere un obstacle physique (asteroide, station), couper ses moteurs et systemes pour reduire toutes les signatures ("going cold"), s\'eloigner au-dela de la portee de lock, ou effectuer des manoeuvres erratiques rapides. Un lock casse force l\'attaquant a recommencer le processus complet.',
  },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Section expansible
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-space-800/50 border border-space-400/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          {Icon && <Icon size={20} className="text-cyan-400" />}
          {title}
        </span>
        {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {open && <div className="p-4 pt-0 border-t border-space-400/10">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — MissileGuide
══════════════════════════════════════════════════════════════ */

export default function MissileGuide() {
  const [activeTypeId, setActiveTypeId] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Rocket size={32} className="text-red-400" />
          <h1 className="text-3xl font-bold text-slate-100">Missiles &amp; Contre-Mesures</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Guide complet du gameplay missile dans Star Citizen
        </p>
      </div>

      {/* ── 1. Types de missiles ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Target size={22} className="text-red-400" />
          Types de Missiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MISSILE_TYPES.map((t) => {
            const Icon = t.icon;
            const expanded = activeTypeId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setActiveTypeId(expanded ? null : t.id)}
                className={clsx(
                  'cursor-pointer rounded-lg border p-4 transition-all',
                  t.border,
                  t.bg,
                  expanded && 'ring-1 ring-offset-0',
                  expanded && t.id === 'ir' && 'ring-red-400',
                  expanded && t.id === 'em' && 'ring-blue-400',
                  expanded && t.id === 'cs' && 'ring-purple-400',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={20} className={t.color} />
                  <h3 className={clsx('font-bold text-lg', t.color)}>{t.name}</h3>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <p><span className="text-slate-400">Tracking :</span> {t.tracking}</p>
                  <p><span className="text-slate-400">Lock :</span> {t.lockTime}</p>
                  <p><span className="text-slate-400">Contre :</span> {t.countermeasure}</p>
                </div>
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-space-400/20 space-y-3 text-sm">
                    <p className="text-slate-300">{t.description}</p>
                    <div>
                      <p className="text-green-400 font-semibold mb-1">Forces :</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {t.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-400 font-semibold mb-1">Faiblesses :</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {t.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. Tailles de missiles ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Layers size={22} className="text-cyan-400" />
          Tailles de Missiles (S1 - S9)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-space-400/30 text-slate-400">
                <th className="py-2 px-3">Taille</th>
                <th className="py-2 px-3">Degats</th>
                <th className="py-2 px-3">Portee</th>
                <th className="py-2 px-3">Categorie</th>
                <th className="py-2 px-3 hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {MISSILE_SIZES.map((m) => (
                <tr key={m.size} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-100">{m.size}</td>
                  <td className="py-2.5 px-3 text-red-400 font-mono">{m.damage}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{m.range}</td>
                  <td className="py-2.5 px-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full', m.badge)}>{m.category}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 hidden md:table-cell">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Mecaniques de verrouillage ── */}
      <ExpandableSection title="Mecaniques de Verrouillage (Lock-On)" icon={Crosshair}>
        <div className="space-y-4 mt-3">
          {LOCKON_MECHANICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon size={18} className={m.color} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">{m.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{m.content}</p>
                </div>
              </div>
            );
          })}
          <div className="mt-3 p-3 rounded-lg bg-space-700/40 border border-space-400/15">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info size={14} className="text-cyan-400 flex-shrink-0" />
              Les valeurs exactes de lock time et portee dependent de la version du jeu et peuvent varier entre les patches.
            </p>
          </div>
        </div>
      </ExpandableSection>

      {/* ── 4. Contre-mesures ── */}
      <ExpandableSection title="Contre-Mesures" icon={Shield} defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {COUNTERMEASURES.map((cm) => {
            const Icon = cm.icon;
            return (
              <div
                key={cm.id}
                className={clsx('rounded-lg border p-4', cm.border, cm.bg)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={cm.color} />
                  <h4 className={clsx('font-bold', cm.color)}>{cm.name}</h4>
                </div>
                <div className="space-y-1 text-sm text-slate-300 mb-3">
                  <p><span className="text-slate-400">Contre :</span> {cm.counters}</p>
                  <p><span className="text-slate-400">Stock :</span> {cm.stock}</p>
                  <p><span className="text-slate-400">Efficacite :</span> {cm.effectiveness}</p>
                </div>
                <p className="text-sm text-slate-400 mb-3">{cm.description}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-1">Conseils :</p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                    {cm.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── 5. Gameplay Torpille ── */}
      <ExpandableSection title="Gameplay Torpille" icon={Bomb}>
        <div className="space-y-4 mt-3">
          {TORPEDO_DATA.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="bg-space-700/30 border border-space-400/15 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={t.color} />
                  <h4 className="font-semibold text-slate-200">{t.name}</h4>
                </div>
                <p className="text-sm text-slate-400 mb-3">{t.description}</p>
                <ul className="space-y-1">
                  {t.keyPoints.map((kp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-cyan-400 mt-0.5">&#8226;</span>
                      {kp}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── 6. Missile Racks & Loadouts ── */}
      <ExpandableSection title="Missile Racks &amp; Loadouts" icon={Layers}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {LOADOUT_CATEGORIES.map((lc) => {
            const Icon = lc.icon;
            return (
              <div
                key={lc.type}
                className="bg-space-700/30 border border-space-400/15 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={18} className={lc.color} />
                  <h4 className={clsx('font-bold', lc.color)}>{lc.type}</h4>
                </div>
                <div className="space-y-1 text-sm mb-2">
                  <p className="text-slate-300">
                    <span className="text-slate-400">Missiles :</span> {lc.missiles} x {lc.sizes}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">Exemples :</span> {lc.examples}
                  </p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{lc.strategy}</p>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── 7. Conseils pratiques ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Lightbulb size={22} className="text-gold-400" />
          Conseils Pratiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div
                key={i}
                className="bg-space-800/50 border border-space-400/20 rounded-lg p-4 flex gap-3"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon size={18} className={tip.color} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer note ── */}
      <div className="p-3 rounded-lg bg-space-800/40 border border-space-400/15 text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Info size={14} className="text-cyan-400" />
          Les valeurs de degats et portees sont approximatives et peuvent varier selon les mises a jour de Star Citizen.
        </p>
      </div>
    </div>
  );
}
