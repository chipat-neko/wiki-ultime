import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Anchor, Shield, ChevronDown, ChevronUp, Crosshair,
  Zap, Users, Target, Swords, Lock, Radio, Eye,
  AlertTriangle, Star, Rocket, Package, Heart,
  Wrench, Move, Bomb, BookOpen, Layers, Info,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Méthodes d'abordage
══════════════════════════════════════════════════════════════ */

const BOARDING_METHODS = [
  {
    id: 'eva',
    icon: Move,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    name: 'Abordage EVA',
    subtitle: 'Sortie extravéhiculaire',
    description:
      'Sortez en EVA depuis votre vaisseau, approchez furtivement dans le vide spatial, puis entrez par un airlock ouvert ou une brèche dans la coque. Méthode silencieuse mais risquée — vous êtes exposé aux tirs et aux débris.',
    pros: ['Approche furtive', 'Pas besoin de docking port', 'Faible signature'],
    cons: ['Vulnérable pendant le transit', 'Lent', 'Nécessite un pilote séparé'],
  },
  {
    id: 'docking',
    icon: Anchor,
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    name: 'Abordage par Docking',
    subtitle: 'Docking forcé',
    description:
      'Amarrez-vous de force au vaisseau cible via un port d\'amarrage. Cette méthode permet un transfert rapide de l\'équipe d\'assaut avec un accès direct à l\'intérieur. Requiert un vaisseau compatible docking.',
    pros: ['Transfert rapide', 'Entrée protégée', 'Toute l\'équipe en même temps'],
    cons: ['Nécessite port compatible', 'Détectable', 'Position fixe après docking'],
  },
  {
    id: 'ram',
    icon: Bomb,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    name: 'Ram & Board',
    subtitle: 'Désactivation + breaching',
    description:
      'Désactivez le vaisseau ennemi avec des armes à distorsion ou un EMP, utilisez un tractor beam pour le stabiliser, puis forcez une entrée par breaching. Méthode agressive et bruyante, mais efficace contre les gros vaisseaux.',
    pros: ['Fonctionne sur tout vaisseau', 'Cible immobilisée', 'Entrée par n\'importe où'],
    cons: ['Bruyant', 'Risque de détruire la cible', 'Équipement spécialisé requis'],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Phases d'abordage
══════════════════════════════════════════════════════════════ */

const BOARDING_PHASES = [
  {
    phase: 1,
    icon: Zap,
    color: 'text-yellow-400',
    title: 'Désactiver le vaisseau cible',
    summary: 'Armes distorsion, EMP, tir sur composants',
    details: [
      'Utilisez des armes à distorsion (Distortion Repeaters/Cannons) pour désactiver les shields et les systèmes.',
      'Un EMP bien placé (Warlock, Sentinel) peut couper temporairement tous les systèmes du vaisseau.',
      'Ciblez en priorité les power plants et les shield generators via le mode de ciblage composants.',
      'Évitez de détruire la coque — un vaisseau explosé ne peut pas être abordé.',
      'Coordonnez avec votre équipe : un pilote maintient la pression, les assaillants se préparent.',
    ],
  },
  {
    phase: 2,
    icon: Move,
    color: 'text-cyan-400',
    title: 'Approche du vaisseau',
    summary: 'EVA, docking, ou approche directe',
    details: [
      'En EVA : éteignez votre lampe, minimisez vos mouvements pour réduire votre signature thermique.',
      'Approchez par l\'angle mort du vaisseau (généralement en dessous ou à l\'arrière).',
      'En docking : alignez-vous avec le port d\'amarrage et initiez la séquence de docking forcé.',
      'Gardez votre vaisseau à proximité pour une extraction rapide si nécessaire.',
      'Communiquez constamment avec votre équipe — timing et coordination sont critiques.',
    ],
  },
  {
    phase: 3,
    icon: Wrench,
    color: 'text-orange-400',
    title: 'Breaching (Entrée forcée)',
    summary: 'Couper les portes, explosifs, multitool',
    details: [
      'Utilisez le multitool avec l\'attachement de coupe pour ouvrir les portes verrouillées.',
      'Les charges explosives (breaching charges) offrent une entrée rapide mais bruyante.',
      'Certains airlocks peuvent être ouverts manuellement depuis l\'extérieur si le vaisseau est hors tension.',
      'Attention à la dépressurisation — portez toujours votre casque et vérifiez l\'oxygène.',
      'Préparez une grenade flashbang avant d\'entrer pour aveugler les défenseurs.',
    ],
  },
  {
    phase: 4,
    icon: Crosshair,
    color: 'text-red-400',
    title: 'Combat intérieur (CQB)',
    summary: 'Room clearing, combat rapproché',
    details: [
      'Passez en arme CQB (SMG ou shotgun) — les couloirs de vaisseaux sont étroits.',
      'Progressez en binôme : un couvre, l\'autre avance. Ne traversez jamais une porte seul.',
      'Vérifiez chaque pièce systématiquement — les défenseurs peuvent se cacher n\'importe où.',
      'Utilisez les grenades flashbang pour neutraliser une pièce avant d\'entrer.',
      'Attention au friendly fire dans les espaces confinés — discipline de tir essentielle.',
      'Les medipens sont vitaux : soignez-vous entre chaque engagement.',
    ],
  },
  {
    phase: 5,
    icon: Star,
    color: 'text-green-400',
    title: 'Prise de contrôle',
    summary: 'Cockpit, systèmes, sécurisation',
    details: [
      'Objectif principal : atteindre et sécuriser le cockpit / bridge du vaisseau.',
      'Éliminez ou neutralisez le pilote et tout membre d\'équipage restant.',
      'Prenez le siège pilote pour prendre le contrôle du vaisseau.',
      'Vérifiez les accès restants — verrouillez les portes derrière vous.',
      'Signalez le contrôle à votre équipe et commencez l\'extraction ou le pilotage vers un lieu sûr.',
      'Inspectez le cargo — un vaisseau abordé peut contenir un butin précieux.',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Loadout recommandé
══════════════════════════════════════════════════════════════ */

const RECOMMENDED_LOADOUT = [
  { item: 'Arme CQB', desc: 'SMG (Custodian, P4-AR) ou shotgun (Ravager-212). Indispensable dans les couloirs étroits.', icon: Crosshair },
  { item: 'Arme secondaire', desc: 'Pistolet (Coda, LH86) en backup. Léger et rapide à dégainer.', icon: Target },
  { item: 'Grenades flashbang ×4', desc: 'Aveuglent et étourdissent les défenseurs. Lancez avant chaque entrée de pièce.', icon: Zap },
  { item: 'Medipens ×5', desc: 'Soins rapides entre les combats. Le CQB cause beaucoup de dégâts — prévoyez large.', icon: Heart },
  { item: 'Armure médium', desc: 'Compromis mobilité/protection. L\'armure lourde ralentit trop en EVA et dans les couloirs.', icon: Shield },
  { item: 'Multitool + coupe', desc: 'Pour ouvrir les portes verrouillées et couper les panneaux d\'accès.', icon: Wrench },
  { item: 'Tractor beam', desc: 'Déplacer des objets bloquants, des corps, ou du loot. Très utile post-combat.', icon: Move },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Vaisseaux pour l'abordage
══════════════════════════════════════════════════════════════ */

const ATTACKER_SHIPS = [
  { name: 'Cutlass Black', role: 'Assaut polyvalent', notes: 'Portes latérales pour EVA rapide, bon armement, cargo pour le loot. Le classique du pirate.', badge: 'badge-cyan' },
  { name: 'Redeemer', role: 'Assaut lourd', notes: 'Tourelles dévastatrices pour désactiver la cible. Équipage de combat intégré.', badge: 'badge-red' },
  { name: 'Valkyrie', role: 'Dropship', notes: 'Conçu pour le déploiement de troupes. Capacité 20 soldats, rampe arrière rapide.', badge: 'badge-yellow' },
  { name: 'Prowler', role: 'Infiltration stealth', notes: 'Approche furtive grâce au mode stealth. Boucliers de gravité pour l\'insertion EVA.', badge: 'badge-purple' },
];

const TARGET_SHIPS = [
  { name: 'Caterpillar', size: 'Large', notes: 'Long vaisseau modulaire avec de multiples points d\'entrée. Modules séparés = combats compartimentés.', entry: '6+ portes' },
  { name: 'Constellation', size: 'Medium', notes: 'Intérieur relativement compact. Accès par l\'arrière ou par le snub fighter bay.', entry: '2-3 accès' },
  { name: '890 Jump', size: 'Capital', notes: 'Immense vaisseau de luxe. Nombreuses pièces, hangars, et ponts — prévoir une grande équipe.', entry: '10+ accès' },
  { name: 'Reclaimer', size: 'Large', notes: 'Intérieur labyrinthique multi-niveaux. Idéal pour les embuscades des deux côtés.', entry: '4-5 accès' },
  { name: 'Carrack', size: 'Large', notes: 'Vaisseau d\'exploration fortifié. Medbay, hangar, drone bay — beaucoup de zones à sécuriser.', entry: '5+ accès' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Contre-abordage
══════════════════════════════════════════════════════════════ */

const COUNTER_BOARDING = [
  { title: 'Verrouillage des portes', icon: Lock, desc: 'Verrouillez toutes les portes intérieures depuis le cockpit. Ralentit considérablement la progression des assaillants et force l\'utilisation du multitool.' },
  { title: 'Pièges intérieurs', icon: AlertTriangle, desc: 'Placez des mines ou des grenades piégées dans les couloirs stratégiques. Les assaillants ne s\'y attendront pas.' },
  { title: 'Tourelles point defense', icon: Target, desc: 'Les tourelles automatiques (point defense) peuvent engager les assaillants en EVA avant qu\'ils n\'atteignent la coque.' },
  { title: 'Communication équipage', icon: Radio, desc: 'Coordonnez votre équipage en temps réel. Assignez des positions défensives et signalez les brèches immédiatement.' },
  { title: 'Escort & couverture', icon: Rocket, desc: 'Un vaisseau escort (fighter) peut intercepter les assaillants en EVA ou détruire leur vaisseau de transport.' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Conseils
══════════════════════════════════════════════════════════════ */

const TIPS = [
  { icon: Users, text: 'L\'abordage est une activité d\'équipe — ne tentez jamais seul. Minimum 3 joueurs recommandés, idéalement 5+.' },
  { icon: Eye, text: 'Scannez toujours le vaisseau cible avant l\'approche pour évaluer le nombre d\'occupants et l\'état des systèmes.' },
  { icon: Radio, text: 'Utilisez un canal vocal dédié pour l\'équipe d\'abordage, séparé du pilote de couverture.' },
  { icon: Shield, text: 'Gardez toujours un joueur en réserve à l\'extérieur pour couvrir l\'extraction en cas d\'échec.' },
  { icon: Package, text: 'Emportez des munitions supplémentaires — le CQB consomme énormément de munitions en peu de temps.' },
  { icon: AlertTriangle, text: 'L\'abordage d\'un vaisseau occupé est considéré comme un acte de piraterie et donne un CrimeStat.' },
  { icon: Layers, text: 'Apprenez le layout intérieur des vaisseaux ciblés à l\'avance — la connaissance des lieux est un avantage majeur.' },
  { icon: Star, text: 'Après la prise de contrôle, changez immédiatement la destination QT pour éviter les renforts ennemis.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANTS — Expandable Section
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className={color || 'text-cyan-400'} />}
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function BoardingGuide() {
  const [expandedPhase, setExpandedPhase] = useState(null);

  const togglePhase = (phase) => setExpandedPhase(expandedPhase === phase ? null : phase);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Swords size={32} className="text-red-400" />
          <h1 className="text-3xl font-bold text-white">Abordage de Vaisseau</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Guide de l'abordage ship-to-ship dans Star Citizen
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="badge-red">PvP / Piraterie</span>
          <span className="badge-yellow">Gameplay de groupe</span>
          <span className="badge-cyan">Alpha 4.6</span>
        </div>
      </div>

      {/* ── Méthodes d'abordage ─────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen size={22} className="text-cyan-400" />
          Méthodes d'abordage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOARDING_METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className={clsx('card p-5 space-y-3', m.border)}>
                <div className="flex items-center gap-3">
                  <div className={clsx('p-2 rounded-lg', m.bg)}>
                    <Icon size={24} className={m.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{m.name}</h3>
                    <span className="text-xs text-gray-400">{m.subtitle}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{m.description}</p>
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-xs font-semibold text-green-400">✓ Avantages</span>
                    <ul className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {m.pros.map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-red-400">✗ Inconvénients</span>
                    <ul className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {m.cons.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Processus étape par étape ───────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Layers size={22} className="text-yellow-400" />
          Processus étape par étape
        </h2>
        <div className="space-y-2">
          {BOARDING_PHASES.map((p) => {
            const Icon = p.icon;
            const isOpen = expandedPhase === p.phase;
            return (
              <div key={p.phase} className="card overflow-hidden">
                <button
                  onClick={() => togglePhase(p.phase)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                    'bg-white/10 border border-white/10'
                  )}>
                    {p.phase}
                  </div>
                  <Icon size={20} className={p.color} />
                  <div className="text-left flex-1">
                    <span className="font-semibold text-white">{p.title}</span>
                    <p className="text-xs text-gray-400">{p.summary}</p>
                  </div>
                  {isOpen
                    ? <ChevronUp size={18} className="text-gray-400" />
                    : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pl-20">
                    <ul className="space-y-2">
                      {p.details.map((d, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">▸</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Loadout recommandé ──────────────────────────────── */}
      <ExpandableSection title="Équipement recommandé" icon={Package} color="text-green-400" defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RECOMMENDED_LOADOUT.map((l, i) => {
            const Icon = l.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Icon size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-white">{l.item}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── Vaisseaux pour l'abordage ───────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Rocket size={22} className="text-purple-400" />
          Vaisseaux pour l'abordage
        </h2>

        {/* Attaquants */}
        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
          Vaisseaux d'assaut
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {ATTACKER_SHIPS.map((s, i) => (
            <div key={i} className="card p-4 flex items-start gap-3">
              <Rocket size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{s.name}</span>
                  <span className={clsx('text-xs', s.badge)}>{s.role}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{s.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cibles */}
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
          Cibles idéales
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="p-3 text-gray-400 font-medium">Vaisseau</th>
                <th className="p-3 text-gray-400 font-medium">Taille</th>
                <th className="p-3 text-gray-400 font-medium">Points d'entrée</th>
                <th className="p-3 text-gray-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {TARGET_SHIPS.map((s, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-semibold text-white">{s.name}</td>
                  <td className="p-3 text-gray-300">{s.size}</td>
                  <td className="p-3 text-cyan-400">{s.entry}</td>
                  <td className="p-3 text-gray-400">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Contre-abordage ─────────────────────────────────── */}
      <ExpandableSection title="Contre-abordage (Défense)" icon={Shield} color="text-yellow-400">
        <div className="space-y-3">
          {COUNTER_BOARDING.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <Icon size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-bold text-white">{c.title}</span>
                  <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── Conseils ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Info size={22} className="text-cyan-400" />
          Conseils pratiques
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPS.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="card p-4 flex items-start gap-3">
                <Icon size={18} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">{t.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <div className="card p-4 border border-red-500/20 bg-red-500/5 flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          <strong className="text-red-400">Attention :</strong> L'abordage de vaisseaux occupés est un acte de piraterie
          dans Star Citizen. Vous recevrez un CrimeStat et serez poursuivi par les forces de l'ordre et les joueurs
          bounty hunters. Pratiquez dans des zones lawless (Pyro) pour minimiser les conséquences.
        </p>
      </div>
    </div>
  );
}