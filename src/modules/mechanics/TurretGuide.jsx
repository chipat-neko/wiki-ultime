import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Crosshair, Shield, Cpu, Target, ChevronDown, ChevronUp,
  Info, Lightbulb, Users, Eye, Radio, Gauge, Navigation,
  AlertTriangle, Star, Zap, Move, RotateCw,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Modes de tourelle
══════════════════════════════════════════════════════════════ */

const TURRET_MODES = [
  {
    id: 'gyro',
    name: 'Gyro-stabilisé',
    icon: RotateCw,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    subtitle: 'Mode par défaut',
    description:
      'La caméra du tireur reste fixe dans l\'espace tandis que la tourelle suit automatiquement la direction visée. Le vaisseau peut manœuvrer librement sans affecter la visée du tireur. C\'est le mode le plus intuitif et recommandé pour les débutants.',
    pros: [
      'Visée stable même pendant les manœuvres du pilote',
      'Intuitif — la tourelle suit le réticule naturellement',
      'Idéal pour le suivi de cibles en mouvement',
    ],
    cons: [
      'Limité par les angles de rotation de la tourelle',
      'Peut perdre la cible si le pilote tourne trop brusquement',
      'Légère latence de suivi sur certaines tourelles',
    ],
  },
  {
    id: 'fixed',
    name: 'Fixed / Verrouillé',
    icon: Crosshair,
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    subtitle: 'Contrôle manuel total',
    description:
      'La tourelle est verrouillée dans une position fixe et c\'est au tireur de viser manuellement en déplaçant la tourelle. Ce mode offre un contrôle précis mais demande plus de coordination avec le pilote. Utile pour les tireurs expérimentés qui préfèrent un contrôle direct.',
    pros: [
      'Contrôle total sur la position de la tourelle',
      'Précision maximale pour les tirs à longue distance',
      'Prévisible — pas de mouvement automatique inattendu',
    ],
    cons: [
      'Nécessite une coordination étroite avec le pilote',
      'Difficile de suivre des cibles rapides',
      'Courbe d\'apprentissage élevée',
    ],
  },
  {
    id: 'auto',
    name: 'Auto / Point Defense',
    icon: Cpu,
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    subtitle: 'IA contrôlée — requiert blade',
    description:
      'La tourelle est contrôlée par une IA (blade informatique installé dans le vaisseau). Elle détecte et engage automatiquement les menaces proches, y compris les missiles entrants. Nécessite l\'installation d\'un computer blade de type "turret" dans le système avionique du vaisseau.',
    pros: [
      'Fonctionne sans équipage humain — idéal en solo',
      'Réaction rapide contre les missiles (point defense)',
      'Couverture défensive permanente à 360°',
    ],
    cons: [
      'Précision inférieure à un tireur humain expérimenté',
      'Nécessite un blade spécifique (coût et slot avionique)',
      'DPS effectif réduit contre des cibles évasives',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Vaisseaux avec tourelles
══════════════════════════════════════════════════════════════ */

const TURRET_SHIPS = [
  { ship: 'Cutlass Black',            manufacturer: 'Drake',         turrets: '1 tourelle manned',  weapons: 'S3 x2', notes: 'Tourelle dorsale arrière, bon angle de couverture' },
  { ship: 'Freelancer',               manufacturer: 'MISC',          turrets: '1 tourelle manned',  weapons: 'S3 x2', notes: 'Tourelle dorsale, angles limités vers l\'avant' },
  { ship: 'Constellation Andromeda',   manufacturer: 'RSI',           turrets: '2 tourelles manned', weapons: 'S2 x2', notes: 'Tourelles supérieure et inférieure' },
  { ship: 'Redeemer',                 manufacturer: 'Aegis',         turrets: '2 tourelles manned + 1 pilote', weapons: 'S5 x2', notes: 'Tourelles latérales dévastatrices, gunship dédié' },
  { ship: 'Hammerhead',               manufacturer: 'Aegis',         turrets: '6 tourelles manned', weapons: 'S4 x2', notes: 'Couverture 360°, anti-chasseur par excellence' },
  { ship: 'Retaliator',               manufacturer: 'Aegis',         turrets: '2 tourelles manned + torpilles', weapons: 'S2 x2', notes: 'Tourelles défensives, rôle principal : bombardier' },
  { ship: 'Scorpius',                 manufacturer: 'RSI',           turrets: '1 tourelle manned',  weapons: 'S3 x2', notes: 'Tourelle arrière, chasseur biplace' },
  { ship: 'Vanguard',                 manufacturer: 'Aegis',         turrets: '1 tourelle remote',  weapons: 'S2 x2', notes: 'Tourelle contrôlable à distance ou par blade' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Efficacité selon la cible
══════════════════════════════════════════════════════════════ */

const EFFECTIVENESS = [
  {
    id: 'fighters',
    target: 'Vs Chasseurs (fighters)',
    icon: Zap,
    color: 'text-red-400',
    rating: 'Difficile',
    ratingColor: 'text-red-400',
    detail:
      'Les chasseurs sont rapides et agiles, rendant le suivi très difficile pour un tourelleur. La communication constante avec le pilote est indispensable : le pilote doit stabiliser le vaisseau et orienter la tourelle vers la menace. Les tourelles gyro-stabilisées aident, mais les cibles à haute vélocité restent un défi majeur.',
    tips: [
      'Demander au pilote de ralentir ou de maintenir un cap stable',
      'Viser légèrement en avance (lead indicator)',
      'Privilégier les armes à cadence élevée (repeaters)',
    ],
  },
  {
    id: 'medium',
    target: 'Vs Vaisseaux moyens',
    icon: Target,
    color: 'text-yellow-400',
    rating: 'Efficace',
    ratingColor: 'text-yellow-400',
    detail:
      'Les vaisseaux de taille moyenne (Cutlass, Freelancer, Constellation) sont suffisamment gros pour être suivis facilement mais assez mobiles pour nécessiter une bonne anticipation. En combat rapproché, les tourelles sont très efficaces et peuvent infliger des dégâts significatifs sur les boucliers et la coque.',
    tips: [
      'Cibler les moteurs pour limiter leur mobilité',
      'Alterner les faces de bouclier visées',
      'Combiner le feu de la tourelle avec les armes pilote',
    ],
  },
  {
    id: 'large',
    target: 'Vs Vaisseaux lourds / capitaux',
    icon: Shield,
    color: 'text-green-400',
    rating: 'Très efficace',
    ratingColor: 'text-green-400',
    detail:
      'Les cibles larges et capitales sont idéales pour les tourelles. Leur taille rend le suivi trivial et permet un DPS soutenu sur une longue durée. Les tourelles lourdes (S4-S5) peuvent infliger des dégâts conséquents même sur des vaisseaux bien blindés. Coordonner le feu de plusieurs tourelles sur un même sous-système maximise l\'efficacité.',
    tips: [
      'Concentrer le feu sur un même face de bouclier',
      'Viser les sous-systèmes critiques (moteurs, power plant)',
      'Maintenir un feu continu — le DPS soutenu est votre atout',
    ],
  },
  {
    id: 'ground',
    target: 'Vs Cibles au sol',
    icon: Navigation,
    color: 'text-cyan-400',
    rating: 'Excellent',
    ratingColor: 'text-cyan-400',
    detail:
      'Les tourelles excellents contre les cibles terrestres à condition que le vaisseau soit stable. En vol stationnaire ou en passes lentes, le tourelleur peut viser précisément véhicules, tourelles AA et infanterie. Le Redeemer et le Hammerhead sont particulièrement redoutables en support aérien.',
    tips: [
      'Demander au pilote un vol stationnaire stable',
      'Zoomer pour identifier les menaces au sol',
      'Attention aux tourelles AA — communiquer leur position au pilote',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Conseils pour tourelleurs
══════════════════════════════════════════════════════════════ */

const GUNNER_TIPS = [
  {
    icon: Eye,
    color: 'text-cyan-400',
    title: 'Utiliser le lead indicator',
    text: 'Le PIP (Predicted Impact Point) indique où tirer pour toucher une cible en mouvement. Placez toujours votre réticule sur le PIP, pas directement sur le vaisseau ennemi.',
  },
  {
    icon: Radio,
    color: 'text-green-400',
    title: 'Communication constante',
    text: 'Annoncez la direction des menaces au pilote (haut, bas, gauche, droite, arrière). Utilisez l\'horloge : "contact à 6h bas" est plus clair que "derrière nous".',
  },
  {
    icon: Gauge,
    color: 'text-yellow-400',
    title: 'Gérer la surchauffe',
    text: 'Les tourelles surchauffent vite en tir continu. Tirez par rafales de 3-5 secondes puis relâchez. Une tourelle en surchauffe est une tourelle inutile pendant de longues secondes.',
  },
  {
    icon: Target,
    color: 'text-red-400',
    title: 'Prioriser les cibles',
    text: 'Engagez d\'abord les menaces les plus proches et les plus dangereuses. Un missile entrant ou un chasseur en passe d\'attaque sont prioritaires sur une cible éloignée.',
  },
  {
    icon: Move,
    color: 'text-purple-400',
    title: 'Connaître ses angles morts',
    text: 'Chaque tourelle a des zones qu\'elle ne peut pas couvrir. Apprenez les limites de rotation de votre tourelle et informez le pilote quand une cible entre dans un angle mort.',
  },
  {
    icon: Crosshair,
    color: 'text-orange-400',
    title: 'Adapter le type d\'arme',
    text: 'Les repeaters (cadence élevée) sont meilleurs contre les chasseurs. Les cannons (dégâts par coup) sont plus adaptés aux cibles lentes et volumineuses. Configurez vos armes selon la mission.',
  },
  {
    icon: Star,
    color: 'text-gold-400',
    title: 'S\'entraîner en mode Arena Commander',
    text: 'Le mode Pirate Swarm en Arena Commander est excellent pour pratiquer la tourelle. Vous affrontez des vagues de difficulté croissante sans risquer votre équipement.',
  },
  {
    icon: AlertTriangle,
    color: 'text-red-400',
    title: 'Éviter le friendly fire',
    text: 'En combat multi-équipage, vérifiez toujours votre cible avant de tirer. Un tir allié peut détruire un coéquipier ou déclencher un CrimeStat. Cessez le feu quand un allié passe dans votre arc.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Conseils pour pilotes
══════════════════════════════════════════════════════════════ */

const PILOT_TIPS = [
  {
    icon: Navigation,
    color: 'text-cyan-400',
    title: 'Stabiliser le vaisseau',
    text: 'Les manœuvres brusques rendent la visée impossible pour vos tourelleurs. En combat, privilégiez des virages amples et prévisibles plutôt que des esquives erratiques.',
  },
  {
    icon: Radio,
    color: 'text-green-400',
    title: 'Annoncer les manœuvres',
    text: 'Prévenez votre équipage avant un virage serré ou un changement de cap brutal. "Virage à droite dans 3 secondes" permet aux tourelleurs de se préparer.',
  },
  {
    icon: Eye,
    color: 'text-yellow-400',
    title: 'Exposer les cibles',
    text: 'Orientez le vaisseau pour que vos tourelles aient un angle de tir clair sur l\'ennemi. Chaque tourelle a une couverture optimale — apprenez-les pour maximiser le feu combiné.',
  },
  {
    icon: Shield,
    color: 'text-purple-400',
    title: 'Gérer les boucliers',
    text: 'Renforcez la face de bouclier exposée à l\'ennemi. Communiquez l\'état des boucliers à l\'équipage pour qu\'ils sachent quand la situation devient critique.',
  },
  {
    icon: Gauge,
    color: 'text-orange-400',
    title: 'Adapter la vitesse',
    text: 'En combat rapproché, réduisez la vitesse pour donner plus de temps de visée aux tourelleurs. Contre des cibles lentes, maintenez une distance moyenne stable.',
  },
  {
    icon: Users,
    color: 'text-gold-400',
    title: 'Coordonner le feu',
    text: 'Désignez les cibles prioritaires pour concentrer le feu de toutes les tourelles. "Focus le Cutlass à 2h" unifie les dégâts et élimine les menaces plus vite.',
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
   COMPOSANT PRINCIPAL — TurretGuide
══════════════════════════════════════════════════════════════ */

export default function TurretGuide() {
  const [activeModeId, setActiveModeId] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Crosshair size={32} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-slate-100">Tourelles — Guide Complet</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Maîtriser les tourelles dans Star Citizen Alpha 4.6
        </p>
      </div>

      {/* ── 1. Modes de tourelle ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <RotateCw size={22} className="text-cyan-400" />
          Modes de Tourelle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TURRET_MODES.map((m) => {
            const Icon = m.icon;
            const expanded = activeModeId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setActiveModeId(expanded ? null : m.id)}
                className={clsx(
                  'cursor-pointer rounded-lg border p-4 transition-all',
                  m.border,
                  m.bg,
                  expanded && 'ring-1 ring-offset-0',
                  expanded && m.id === 'gyro' && 'ring-cyan-400',
                  expanded && m.id === 'fixed' && 'ring-yellow-400',
                  expanded && m.id === 'auto' && 'ring-green-400',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={20} className={m.color} />
                  <h3 className={clsx('font-bold text-lg', m.color)}>{m.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-2">{m.subtitle}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{m.description}</p>
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-space-400/20 space-y-3 text-sm">
                    <div>
                      <p className="text-green-400 font-semibold mb-1">Avantages :</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {m.pros.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-400 font-semibold mb-1">Inconvénients :</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {m.cons.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. Vaisseaux avec tourelles ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Users size={22} className="text-cyan-400" />
          Vaisseaux avec Tourelles
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-space-400/30 text-slate-400">
                <th className="py-2 px-3">Vaisseau</th>
                <th className="py-2 px-3">Fabricant</th>
                <th className="py-2 px-3">Tourelles</th>
                <th className="py-2 px-3">Armes</th>
                <th className="py-2 px-3 hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {TURRET_SHIPS.map((s) => (
                <tr key={s.ship} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-100">{s.ship}</td>
                  <td className="py-2.5 px-3 text-cyan-400">{s.manufacturer}</td>
                  <td className="py-2.5 px-3 text-slate-300">{s.turrets}</td>
                  <td className="py-2.5 px-3 text-yellow-400 font-mono">{s.weapons}</td>
                  <td className="py-2.5 px-3 text-slate-400 hidden md:table-cell">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Efficacité selon la cible ── */}
      <ExpandableSection title="Efficacité des Tourelles selon la Cible" icon={Target} defaultOpen>
        <div className="space-y-4 mt-3">
          {EFFECTIVENESS.map((e) => {
            const Icon = e.icon;
            return (
              <div
                key={e.id}
                className="bg-space-700/30 border border-space-400/15 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={e.color} />
                    <h4 className="font-semibold text-slate-200">{e.target}</h4>
                  </div>
                  <span className={clsx('text-sm font-bold', e.ratingColor)}>{e.rating}</span>
                </div>
                <p className="text-sm text-slate-400 mb-3 leading-relaxed">{e.detail}</p>
                <ul className="space-y-1">
                  {e.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-cyan-400 mt-0.5">&#8226;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── 4. Conseils pour tourelleurs ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Lightbulb size={22} className="text-gold-400" />
          Conseils pour Tourelleurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GUNNER_TIPS.map((tip, i) => {
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

      {/* ── 5. Conseils pour pilotes ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Navigation size={22} className="text-cyan-400" />
          Conseils pour Pilotes avec Équipage Tourelle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PILOT_TIPS.map((tip, i) => {
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
          Les informations sur les tourelles peuvent varier selon les mises à jour de Star Citizen. Guide basé sur Alpha 4.6.
        </p>
      </div>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="tourelles" />
    </div>
  );
}
