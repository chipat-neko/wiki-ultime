import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Target, Star, Shield, Zap, Info, ChevronDown, ChevronUp,
  Users, DollarSign, Crosshair, Map, BookOpen, AlertTriangle,
  TrendingUp, Clock, Award,
} from 'lucide-react';

/* ─── Données ─── */

const CERTIFICATIONS = [
  {
    rank: 1,
    name: 'Débutant (Novice)',
    badge: 'badge-green',
    rep: '0 – 999',
    repReq: 'Départ',
    targets: 'Criminels CS1-CS2 locaux uniquement',
    contracts: 'Contrats de base des missions boards',
    payMin: '8 000',
    payMax: '25 000',
    perks: ['Accès aux missions T1', 'Contrats Advocacy basiques', 'Radar ennemi de base'],
  },
  {
    rank: 2,
    name: 'Chasseur Local (Hunter)',
    badge: 'badge-cyan',
    rep: '1 000 – 4 999',
    repReq: '1 000 rep',
    targets: 'CS1-CS3 dans une lune/planète',
    contracts: 'Mission boards régionaux',
    payMin: '20 000',
    payMax: '85 000',
    perks: ['Accès missions T2', 'Bonus 10% sur primes locales', 'Marquage cible amélioré'],
  },
  {
    rank: 3,
    name: 'Chasseur Régional (Veteran)',
    badge: 'badge-yellow',
    rep: '5 000 – 14 999',
    repReq: '5 000 rep',
    targets: 'CS2-CS3+ dans tout un système',
    contracts: 'Advocacy Guild contrats systèmes',
    payMin: '75 000',
    payMax: '350 000',
    perks: ['Accès missions T3', 'Scanner longue portée', 'Bonus 15% primes système'],
  },
  {
    rank: 4,
    name: 'Chasseur Prioritaire (Elite)',
    badge: 'badge-red',
    rep: '15 000 – 49 999',
    repReq: '15 000 rep',
    targets: 'CS3-CS4 prioritaires, groupes criminels',
    contracts: 'Contrats Advocacy Elite',
    payMin: '250 000',
    payMax: '750 000',
    perks: ['Accès missions T4', 'Primes joueurs actives', 'Support logistique Advocacy'],
  },
  {
    rank: 5,
    name: 'Chasseur Expert (Master)',
    badge: 'badge-purple',
    rep: '50 000 – 99 999',
    repReq: '50 000 rep',
    targets: 'CS4-CS5, primes joueurs majeures',
    contracts: 'Contrats exclusifs Master Hunter',
    payMin: '500 000',
    payMax: '2 000 000',
    perks: ['Toutes missions débloquées', 'Intel criminel avancé', 'Bonus 25% toutes primes'],
  },
  {
    rank: 6,
    name: 'Légendaire (Legend)',
    badge: 'badge-gold',
    rep: '100 000+',
    repReq: '100 000 rep',
    targets: 'Criminel les plus recherchés, joueurs CS5',
    contracts: 'Contrats Legend (rare, très payants)',
    payMin: '1 000 000',
    payMax: '5 000 000+',
    perks: ['Réputation maximale', 'Accès bunker Advocacy', 'Bonus 30% + titre Legend'],
  },
];

const BOUNTY_TYPES = [
  {
    type: 'Bounty T1 — Local',
    tier: 'T1',
    tierBadge: 'badge-green',
    target: 'Criminel CS1-CS2 local (NPC)',
    payMin: '8 000',
    payMax: '25 000',
    difficulty: 'Facile',
    diffBadge: 'badge-green',
    location: 'Lune / Planète spécifique',
    notes: 'Idéal pour débuter, cibles NPC légères en armure légère',
  },
  {
    type: 'Bounty T2 — Régional',
    tier: 'T2',
    tierBadge: 'badge-cyan',
    target: 'CS2-CS3 NPC + petits groupes',
    payMin: '20 000',
    payMax: '85 000',
    difficulty: 'Moyen',
    diffBadge: 'badge-yellow',
    location: 'Région système (plusieurs lunes)',
    notes: 'Cibles en armure moyenne, parfois 2-3 gardes',
  },
  {
    type: 'Bounty T3 — Système',
    tier: 'T3',
    tierBadge: 'badge-yellow',
    target: 'CS3+ NPC, lieutenants criminels',
    payMin: '75 000',
    payMax: '350 000',
    difficulty: 'Difficile',
    diffBadge: 'badge-red',
    location: 'Tout le système Stanton/Pyro',
    notes: 'Cibles élites avec escorte (4-8 NPC), vaisseaux engagés',
  },
  {
    type: 'Bounty T4 — Prioritaire',
    tier: 'T4',
    tierBadge: 'badge-red',
    target: 'CS4 NPC prioritaire, boss organisé',
    payMin: '250 000',
    payMax: '750 000',
    difficulty: 'Très Difficile',
    diffBadge: 'badge-red',
    location: 'Multi-systèmes (Stanton + Pyro)',
    notes: 'Escouades d\'élite, vaisseaux de combat, base défendue',
  },
  {
    type: 'Bounty T5 — Joueur CS5',
    tier: 'T5',
    tierBadge: 'badge-purple',
    target: 'Joueur avec CrimeStat CS5',
    payMin: '500 000',
    payMax: '2 000 000',
    difficulty: 'Extrême',
    diffBadge: 'badge-purple',
    location: 'Système entier (suivi live)',
    notes: 'Cible humaine imprévisible — prévoir groupe, Intel nécessaire',
  },
];

const EQUIPMENT_TIERS = [
  {
    tier: 'T1 — Débutant',
    badge: 'badge-green',
    weapons: ['Arme de poing (P4-AR ou Arclight)', 'Fusil semi-auto (Kastak Arms Custodian)'],
    armor: ['Armure légère (sous-couche basique)', 'Casque ouvert (visibilité)'],
    ship: 'Avenger Stalker (cage), Mustang Beta',
    extras: ['3× Hemozal Bandage', '2× Hemozal Medipen', 'Chargeurs de rechange'],
    tip: 'L\'Avenger Stalker dispose de cages pour capturer les cibles vivantes — bonus de paiement.',
  },
  {
    tier: 'T2 — Intermédiaire',
    badge: 'badge-yellow',
    weapons: ['Fusil d\'assaut (Behring P8-AR)', 'Fusil de sniper (Kastak Arms Karna)'],
    armor: ['Armure medium (RRS Rust Society)', 'Casque fermé (protection totale)'],
    ship: 'Bounty Hunter Pack (Avenger Stalker upgradé), Gladius',
    extras: ['Demexatrine ×3', 'Stims de combat', 'Grenades flash'],
    tip: 'Le Gladius peut pistiner les cibles en orbite — essentiel pour les bounties spatiaux.',
  },
  {
    tier: 'T3 — Expert',
    badge: 'badge-red',
    weapons: ['Sniper heavy (Atzkav Electron Repeater)', 'SMG backup (Klaus & Werner Lumin V)', 'Grenades EMP'],
    armor: ['Armure lourde (Calva MK.2)', 'Exo-suit renforcé', 'Bouclier personnel'],
    ship: 'Eclipse (furtif), Buccaneer, F7C-M Super Hornet',
    extras: ['Quantimed Pen', 'Resurgera', 'Balisage ennemi longue portée', 'Multi-tool scan'],
    tip: 'L\'Eclipse permet d\'approcher les cibles joueurs sans être détecté. Idéal pour CS4-CS5.',
  },
  {
    tier: 'T4-T5 — Légendaire',
    badge: 'badge-purple',
    weapons: ['Arsenal complet (sniper + fusil + backup + grenades)', 'Armes EMP anti-vaisseau', 'Torpilles de neutralisation'],
    armor: ['Armure maximale ou stealth suit', 'Bouclier personnel niveau 3'],
    ship: 'Gladiator (missile), Eclipse, Sabre Comet, groupe coordonné recommandé',
    extras: ['Kit médical complet T2', 'Multitool EMP', 'Balises de traque', 'Véhicule terrestre (ROC / STV)'],
    tip: 'À ce niveau, la coordination en groupe de 3-5 joueurs est quasi-obligatoire pour les primes CS5.',
  },
];

const TACTICS = [
  {
    icon: Target,
    color: 'text-cyan-400',
    title: 'Scanner avant d\'agir',
    text: 'Toujours scanner la zone avant d\'approcher. Le multi-tool en mode scan révèle les ennemis cachés et les cibles derrière les obstacles. Gagnez en Intel avant l\'engagement.',
  },
  {
    icon: Map,
    color: 'text-blue-400',
    title: 'Utiliser les marqueurs de mission',
    text: 'Les missions bounty fournissent des marqueurs précis. Suivez-les scrupuleusement — une cible qui quitte la zone fait échouer le contrat. Priorité : neutraliser, puis fouiller la zone.',
  },
  {
    icon: Crosshair,
    color: 'text-warning-400',
    title: 'Capturer vivant = bonus de paiement',
    text: 'Certains contrats offrent un bonus de 25-50% si la cible est livrée vivante. Utilisez des armes non-létales (Atzkav mode stun) et le vaisseau Avenger Stalker avec ses cages.',
  },
  {
    icon: Shield,
    color: 'text-success-400',
    title: 'Gérer les primes PvP avec soin',
    text: 'Pour les primes sur joueurs (T5), rassemblez d\'abord des informations : système actuel, dernier vaisseau utilisé. Préparez un plan d\'extraction si le joueur est en groupe.',
  },
  {
    icon: Users,
    color: 'text-purple-400',
    title: 'Groupe pour T3+',
    text: 'À partir du Tier 3, les contrats impliquent des escouades NPC. Un duo (pilote + tireur) est idéal — l\'un engage au sol, l\'autre couvre depuis les airs.',
  },
  {
    icon: DollarSign,
    color: 'text-gold-400',
    title: 'Optimiser les routes de farm',
    text: 'T2 est souvent le meilleur ratio temps/aUEC. Chaînez les missions T2 dans la même zone pour minimiser les déplacements. 4-6 missions T2/heure = 120K-400K aUEC/heure.',
  },
  {
    icon: AlertTriangle,
    color: 'text-danger-400',
    title: 'Attention au CrimeStat ami',
    text: 'Tuer un criminel sur lequel vous n\'avez pas de contrat actif peut déclencher un CS2 si son CrimeStat est trop bas. Vérifiez toujours les missions actives avant d\'engager.',
  },
  {
    icon: Clock,
    color: 'text-slate-400',
    title: 'Délai d\'expiration contrats',
    text: 'Les contrats bounty expirent après 24h réelles. Si vous acceptez mais ne terminez pas, vous perdez la réputation et payez une pénalité. N\'acceptez que ce que vous pouvez finir.',
  },
];

const REP_SOURCES = [
  { source: 'Compléter bounty T1', rep: '+50 à +100', notes: 'Répétable illimité' },
  { source: 'Compléter bounty T2', rep: '+150 à +300', notes: 'Répétable illimité' },
  { source: 'Compléter bounty T3', rep: '+500 à +1 000', notes: 'Répétable' },
  { source: 'Compléter bounty T4', rep: '+2 000 à +5 000', notes: 'Cooldown 24h' },
  { source: 'Bounty joueur CS5', rep: '+5 000 à +15 000', notes: 'Rare, très payant' },
  { source: 'Livraison vivant (bonus)', rep: '+25% bonus rep', notes: 'Si spécifié au contrat' },
  { source: 'Contrat échoué', rep: '-100 à -500', notes: 'Pénalité sévère T4+' },
  { source: 'Tuer civil lors opération', rep: '-200 à -1 000', notes: 'Déclenche aussi CS2' },
];

/* ─── Composants helpers ─── */

function SectionAnchor({ id }) {
  return <div id={id} className="scroll-mt-20" />;
}

function TipBox({ icon: Icon, color, title, text }) {
  return (
    <div className="card p-4 flex gap-3">
      <div className={clsx('flex-shrink-0 mt-0.5', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-slate-200 text-sm mb-1">{title}</div>
        <div className="text-xs text-slate-400 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}

function RankCard({ cert }) {
  const [open, setOpen] = useState(false);
  const rankColors = {
    1: 'bg-success-500/20 text-success-400',
    2: 'bg-cyan-500/20 text-cyan-400',
    3: 'bg-warning-500/20 text-warning-400',
    4: 'bg-danger-500/20 text-danger-400',
    5: 'bg-purple-500/20 text-purple-400',
    6: 'bg-gold-500/20 text-gold-400',
  };
  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center font-bold font-display text-lg flex-shrink-0', rankColors[cert.rank])}>
            {cert.rank}
          </div>
          <div>
            <div className="font-bold text-slate-200">{cert.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`badge ${cert.badge} text-xs`}>{cert.repReq}</span>
              <span className="text-xs text-slate-500">Paiement : {cert.payMin} – {cert.payMax} aUEC</span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Cibles débloquées</div>
            <p className="text-sm text-slate-300">{cert.targets}</p>
            <div className="text-xs text-slate-500 mt-2">{cert.contracts}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Avantages</div>
            <ul className="space-y-1">
              {cert.perks.map((perk, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-gold-400 flex-shrink-0" /> {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function EquipmentCard({ tier }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-bold text-slate-200">{tier.tier}</div>
            <div className="text-xs text-slate-400 mt-0.5">Vaisseau : {tier.ship.split(',')[0]}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${tier.badge}`}>{tier.tier.split('—')[0].trim()}</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Armes</div>
              <ul className="space-y-1">
                {tier.weapons.map((w, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3 text-danger-400 flex-shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Armure & Protection</div>
              <ul className="space-y-1">
                {tier.armor.map((a, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-blue-400 flex-shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Vaisseaux recommandés</div>
            <p className="text-xs text-slate-300">{tier.ship}</p>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Extras conseillés</div>
            <div className="flex flex-wrap gap-1.5">
              {tier.extras.map((e, i) => (
                <span key={i} className="badge badge-slate text-xs">{e}</span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-700/60 border border-space-400/20 flex gap-2">
            <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 italic">{tier.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page principale ─── */

export default function BountyHunting() {
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { id: 'intro', label: 'Introduction' },
    { id: 'certifications', label: 'Rangs & Certifications' },
    { id: 'types', label: 'Types de Primes' },
    { id: 'equipment', label: 'Équipement' },
    { id: 'reputation', label: 'Réputation' },
    { id: 'tactiques', label: 'Tactiques' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Target className="w-7 h-7 text-gold-400" />
            Chasse aux Primes
          </h1>
          <span className="badge badge-red">Alpha 4.6</span>
          <span className="badge badge-gold">Bounty Hunting</span>
        </div>
        <p className="page-subtitle mt-1">
          Guide complet du bounty hunting — certifications, types de primes T1 à T5, équipement recommandé, réputation et tactiques
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

      {/* Section 1 : Introduction */}
      <SectionAnchor id="intro" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-cyan-400" />
          Introduction à la Chasse aux Primes
        </h2>
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            La chasse aux primes est l'un des <strong className="text-gold-400">métiers les plus profitables et dynamiques</strong> de Star Citizen. Les bounty hunters (chasseurs de primes) traquent des criminels — qu'ils soient NPC ou joueurs — pour le compte de l'Advocacy (équivalent du FBI de l'UEE) ou de corporations privées.
          </p>
          <p>
            Le système distingue deux grandes catégories : les <strong className="text-cyan-400">primes NPC</strong> (générées dynamiquement selon le CrimeStat du système) et les <strong className="text-danger-400">primes joueurs</strong> (déclenchées quand un joueur atteint CS3+). Les premières sont plus prévisibles, les secondes bien plus lucratives mais dangereuses.
          </p>
          <p>
            La progression se fait via un système de <strong className="text-success-400">réputation et de certifications</strong> à 6 niveaux, chaque rang débloquant des contrats plus lucratifs et des cibles plus difficiles.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Niveaux de rang', value: '6', color: 'text-gold-400' },
            { label: 'Types de primes', value: '5', color: 'text-cyan-400' },
            { label: 'Payout max T5', value: '2M aUEC', color: 'text-danger-400' },
            { label: 'Tiers équipement', value: '4', color: 'text-success-400' },
          ].map(s => (
            <div key={s.label} className="bg-space-700/50 rounded-lg p-3 text-center">
              <div className={clsx('text-2xl font-bold font-display', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 : Certifications et Rangs */}
      <SectionAnchor id="certifications" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-gold-400" />
          Certifications et Rangs
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Cliquez sur un rang pour afficher les détails, cibles disponibles et avantages.
        </p>
        <div className="space-y-3">
          {CERTIFICATIONS.map(cert => (
            <RankCard key={cert.rank} cert={cert} />
          ))}
        </div>
      </div>

      {/* Section 3 : Types de primes */}
      <SectionAnchor id="types" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Crosshair className="w-5 h-5 text-danger-400" />
          Types de Primes — Tableau Détaillé
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type de Prime</th>
                  <th>Tier</th>
                  <th>Cible</th>
                  <th>Payout Min</th>
                  <th>Payout Max</th>
                  <th>Difficulté</th>
                  <th>Zone</th>
                </tr>
              </thead>
              <tbody>
                {BOUNTY_TYPES.map((b, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-200">
                      <div>{b.type}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{b.notes}</div>
                    </td>
                    <td><span className={`badge ${b.tierBadge}`}>{b.tier}</span></td>
                    <td className="text-xs text-slate-300">{b.target}</td>
                    <td className="font-mono text-xs text-success-400">{b.payMin}</td>
                    <td className="font-mono text-xs text-gold-400">{b.payMax}</td>
                    <td><span className={`badge ${b.diffBadge}`}>{b.difficulty}</span></td>
                    <td className="text-xs text-slate-400">{b.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown visuel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="card p-4 border border-success-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success-400" />
              <span className="text-sm font-semibold text-slate-200">Débutant (T1-T2)</span>
            </div>
            <p className="text-xs text-slate-400">Farm idéal : 4-6 missions T2/heure. Revenus stables de 80K–200K aUEC/heure. Risque faible, bon pour progresser rapidement en réputation.</p>
          </div>
          <div className="card p-4 border border-warning-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-warning-400" />
              <span className="text-sm font-semibold text-slate-200">Intermédiaire (T3)</span>
            </div>
            <p className="text-xs text-slate-400">Le sweet spot économique. Missions longues mais payantes. 2-3 missions T3/heure = 150K–700K aUEC. Recommande un duo.</p>
          </div>
          <div className="card p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-slate-200">Élite (T4-T5)</span>
            </div>
            <p className="text-xs text-slate-400">Gains massifs mais risque élevé. T5 joueur = potentiel 2M+ aUEC par kill. Nécessite coordination parfaite et équipement maximal.</p>
          </div>
        </div>
      </div>

      {/* Section 4 : Équipement */}
      <SectionAnchor id="equipment" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          Équipement Recommandé par Tier
        </h2>
        <div className="space-y-3">
          {EQUIPMENT_TIERS.map((tier, i) => (
            <EquipmentCard key={i} tier={tier} />
          ))}
        </div>
      </div>

      {/* Section 5 : Réputation */}
      <SectionAnchor id="reputation" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-gold-400" />
          Système de Réputation
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          La réputation auprès de l'Advocacy et des guildes de chasseurs détermine votre accès aux contrats et vos bonus.
        </p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source de Réputation</th>
                  <th>Points Gagnés</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {REP_SOURCES.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-200">{row.source}</td>
                    <td>
                      <span className={clsx('font-mono text-xs font-bold',
                        row.rep.startsWith('-') ? 'text-danger-400' : 'text-success-400'
                      )}>{row.rep}</span>
                    </td>
                    <td className="text-xs text-slate-400">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-space-700/40 border border-gold-500/20 flex gap-3">
          <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            <strong className="text-gold-400">Conseil :</strong> La réputation bounty hunting est distincte de la réputation générale des factions. Elle est gérée par l'Advocacy et la Bounty Hunters Guild. Un chasseur peut avoir une réputation criminelle basse dans d'autres factions et rester un chasseur de primes légal.
          </p>
        </div>
      </div>

      {/* Section 6 : Tactiques */}
      <SectionAnchor id="tactiques" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gold-400" />
          Tactiques et Conseils
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TACTICS.map((tactic, i) => (
            <TipBox key={i} {...tactic} />
          ))}
        </div>
      </div>

      {/* Footer liens */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Guides connexes :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/crimestat')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            CrimeStat
          </button>
          <button onClick={() => navigate('/medical')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Mécanique Médicale
          </button>
          <button onClick={() => navigate('/reputation')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Réputation Factions
          </button>
          <button onClick={() => navigate('/guides')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Tous les Guides
          </button>
        </div>
      </div>
    </div>
  );
}
