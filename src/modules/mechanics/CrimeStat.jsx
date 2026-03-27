import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  AlertTriangle, Shield, MapPin, Clock, ChevronDown, ChevronUp,
  Info, Zap, Lock, Eye, Target, DollarSign, BookOpen, Search, X,
} from 'lucide-react';

/* ─── Données ─── */

const CS_LEVELS = [
  {
    level: 'CS1',
    color: 'badge-green',
    glow: 'text-success-400',
    border: 'border-success-500/30',
    bg: 'bg-success-500/10',
    threshold: 'Infractions mineures',
    examples: 'Survol interdit, possession illégale légère, graffiti',
    consequences: 'Arrestation possible, amende automatique',
    duration: '3 jours réels',
    hunters: 'Aucun chasseur envoyé',
  },
  {
    level: 'CS2',
    color: 'badge-yellow',
    glow: 'text-warning-400',
    border: 'border-warning-500/30',
    bg: 'bg-warning-500/10',
    threshold: 'Crimes modérés',
    examples: 'Agression, vol mineur, port d\'armes interdit',
    consequences: 'Tirs à vue en zones haute sécurité, amende majorée',
    duration: '7 jours réels',
    hunters: 'Chasseurs locaux (Tier 1)',
  },
  {
    level: 'CS3',
    color: 'badge-red',
    glow: 'text-danger-400',
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    threshold: 'Crimes graves',
    examples: 'Meurtre, vol de vaisseau, destruction de bien',
    consequences: 'Chasseurs de primes envoyés, accès stations restreint',
    duration: '15 jours réels',
    hunters: 'Chasseurs régionaux (Tier 2-3)',
  },
  {
    level: 'CS4',
    color: 'badge-red',
    glow: 'text-danger-400',
    border: 'border-red-700/40',
    bg: 'bg-red-900/20',
    threshold: 'Crimes multiples / terrorisme',
    examples: 'Destruction de vaisseaux multiples, actes terroristes',
    consequences: 'Escadrons de combat déployés, chasse prioritaire',
    duration: '30 jours réels',
    hunters: 'Escadrons combat (Tier 4)',
  },
  {
    level: 'CS5',
    color: 'badge-purple',
    glow: 'text-purple-400',
    border: 'border-purple-700/40',
    bg: 'bg-purple-900/20',
    threshold: 'Crimes contre l\'humanité',
    examples: 'Génocide, destruction massive, crimes de guerre',
    consequences: 'Tous les joueurs peuvent attaquer légalement, récompense maximale',
    duration: 'Permanente (jusqu\'à purge)',
    hunters: 'Tout le serveur (Tier 5)',
  },
];

const INFRACTIONS = [
  { infraction: 'Survol de zone interdite (speeding)', cs: 'CS1', zone: 'Haute sécurité', amende: '1 000 aUEC' },
  { infraction: 'Port d\'arme illégale', cs: 'CS1', zone: 'Toutes', amende: '2 500 aUEC' },
  { infraction: 'Possession de marchandises illégales légères', cs: 'CS1', zone: 'Contrôle douanier', amende: '5 000 aUEC' },
  { infraction: 'Graffiti / vandalisme mineur', cs: 'CS1', zone: 'Zones habitées', amende: '500 aUEC' },
  { infraction: 'Non-respect d\'un ordre de police', cs: 'CS1', zone: 'Haute sécurité', amende: '1 500 aUEC' },
  { infraction: 'Agression non mortelle', cs: 'CS2', zone: 'Toutes', amende: '15 000 aUEC' },
  { infraction: 'Vol mineur (pickpocket)', cs: 'CS2', zone: 'Stations', amende: '10 000 aUEC' },
  { infraction: 'Contrebande modérée', cs: 'CS2', zone: 'Douanes', amende: '25 000 aUEC' },
  { infraction: 'Possession drogue illégale classe B', cs: 'CS2', zone: 'Toutes', amende: '20 000 aUEC' },
  { infraction: 'Résistance à l\'arrestation', cs: 'CS2', zone: 'Haute sécurité', amende: '8 000 aUEC' },
  { infraction: 'Homicide involontaire', cs: 'CS3', zone: 'Toutes', amende: '50 000 aUEC' },
  { infraction: 'Meurtre prémédité', cs: 'CS3', zone: 'Toutes', amende: '100 000 aUEC' },
  { infraction: 'Vol de vaisseau', cs: 'CS3', zone: 'Toutes', amende: '75 000 aUEC' },
  { infraction: 'Destruction de vaisseau (joueur)', cs: 'CS3', zone: 'Toutes', amende: '80 000 aUEC' },
  { infraction: 'Vol de données classifiées', cs: 'CS3', zone: 'Sites sécurisés', amende: '60 000 aUEC' },
  { infraction: 'Contrebande lourde (drogue classe A)', cs: 'CS3', zone: 'Toutes', amende: '90 000 aUEC' },
  { infraction: 'Destruction de vaisseau civil multiple', cs: 'CS4', zone: 'Toutes', amende: '250 000 aUEC' },
  { infraction: 'Actes terroristes', cs: 'CS4', zone: 'Toutes', amende: '500 000 aUEC' },
  { infraction: 'Crime organisé / grand banditisme', cs: 'CS4', zone: 'Toutes', amende: '350 000 aUEC' },
  { infraction: 'Génocide / massacre', cs: 'CS5', zone: 'Toutes', amende: 'Jugement spécial' },
  { infraction: 'Destruction de station spatiale', cs: 'CS5', zone: 'Toutes', amende: 'Jugement spécial' },
  { infraction: 'Crimes contre l\'humanité', cs: 'CS5', zone: 'Toutes', amende: 'Jugement spécial' },
];

const PURGE_METHODS = [
  {
    id: 'kareah',
    name: 'Security Post Kareah',
    location: 'Moon Cellin, système Stanton',
    csLimit: 'CS1 à CS5',
    difficulty: 'Élevée (défenses actives)',
    steps: [
      'Volez en direction de Cellin (lune de Crusader, Stanton)',
      'Localisez le Security Post Kareah sur la surface de Cellin',
      'Attendrissez-vous sur le pad extérieur sans vous faire détecter',
      'Éliminez ou contournez les gardes Crusader Security à l\'intérieur',
      'Accédez au terminal informatique au niveau supérieur du poste',
      'Interagissez avec le terminal → sélectionnez "Effacer dossier criminel"',
      'Attendez la confirmation de suppression (30 secondes environ)',
      'Quittez rapidement avant que les renforts n\'arrivent',
    ],
    tip: 'Venez en groupe pour couvrir les terminaux. Un vaisseau en orbite basse peut servir d\'extraction rapide.',
    color: 'border-cyan-500/30',
    badgeColor: 'badge-cyan',
  },
  {
    id: 'prisma',
    name: 'Prisma',
    location: 'Moon Lyria, système Stanton',
    csLimit: 'CS1 à CS3',
    difficulty: 'Modérée',
    steps: [
      'Rejoignez Lyria (lune d\'ArcCorp, Stanton)',
      'Localisez l\'installation Prisma sur la surface',
      'Neutralisez les défenses extérieures',
      'Accédez au terminal de purge à l\'intérieur',
      'Exécutez la procédure d\'effacement',
    ],
    tip: 'Alternative moins fréquentée que Kareah, mais limitée au CS3.',
    color: 'border-blue-500/30',
    badgeColor: 'badge-blue',
  },
  {
    id: 'kiosk',
    name: 'Paiement d\'amende via kiosque',
    location: 'Stations légales (Lorville, New Babbage, Area 18)',
    csLimit: 'CS1 et CS2 uniquement',
    difficulty: 'Facile (si accès possible)',
    steps: [
      'Rendez-vous dans une zone légale avec un kiosque de paiement',
      'Approchez le terminal d\'amendes (souvent en zone Customs)',
      'Sélectionnez les infractions à payer',
      'Payez le montant requis en aUEC',
      'Le CrimeStat disparaît instantanément après paiement',
    ],
    tip: 'Méthode la plus rapide pour CS1-CS2. Soyez prudent si les gardes vous sont hostiles en approchant.',
    color: 'border-success-500/30',
    badgeColor: 'badge-green',
  },
  {
    id: 'klescher',
    name: 'Prison de Klescher',
    location: 'Aberdeen (lune de Hurston, Stanton)',
    csLimit: 'Tous niveaux (automatique)',
    difficulty: 'Automatique à la capture',
    steps: [
      'Si vous êtes tué par des forces de sécurité ou arrêté, vous êtes envoyé à Klescher',
      'Durée d\'emprisonnement selon le niveau de CrimeStat',
      'CS1 : 15-30 minutes | CS2 : 30-60 min | CS3 : 1-2h | CS4+ : 2h+',
      'Possible de s\'évader (méthode avancée, coopération groupe)',
      'À la libération, le CrimeStat est effacé (partiellement pour CS4+)',
    ],
    tip: 'L\'évasion est possible mais complexe — nécessite un groupe extérieur pour l\'extraction.',
    color: 'border-warning-500/30',
    badgeColor: 'badge-yellow',
  },
];

const SECURITY_ZONES = [
  { zone: 'Haute Sécurité', color: 'badge-cyan', description: 'Réponse immédiate', reaction: 'Patrouilles constantes, tirs à vue CS2+', examples: 'Lorville, New Babbage, Area 18, Orison, stations majeures' },
  { zone: 'Modérée', color: 'badge-yellow', description: 'Réponse sous 2-3 min', reaction: 'Gardes patrouillant, arrestation CS1+', examples: 'Stations de transit, GrimHEX (anarchique), Levski' },
  { zone: 'Faible', color: 'badge-red', description: 'Réponse lente ou absente', reaction: 'Peu de gardes, crimes tolérés', examples: 'Sites d\'extraction, lunes non habitées, avant-postes' },
  { zone: 'Aucune', color: 'badge-purple', description: 'Zone de non-droit', reaction: 'Aucune réponse légale', examples: 'Pyro (entier), certains avant-postes abandon' },
];

const TIPS = [
  { icon: DollarSign, color: 'text-success-400', title: 'CS1 : Payez rapidement', text: 'Un CS1 non traité peut aggraver la situation. Payez l\'amende dès que possible via un kiosque légal — moins de 5 000 aUEC dans la plupart des cas.' },
  { icon: MapPin, color: 'text-cyan-400', title: 'CS2-CS3 : Grim HEX / Levski', text: 'Ces stations acceptent les criminels. Patientez-y le temps que votre CrimeStat expire, ou préparez une mission vers Kareah en groupe.' },
  { icon: Target, color: 'text-warning-400', title: 'CS3+ : Pyro comme refuge', text: 'Le système Pyro est une zone de non-droit. Aucune force de sécurité UEE ne peut vous y poursuivre officiellement. Idéal pour attendre l\'expiration.' },
  { icon: Eye, color: 'text-danger-400', title: 'Évitez les zones surveillées', text: 'En CS2+, évitez absolument les zones haute sécurité. Vous serez abattu à vue par les Crusader/Hurston/microTech Security.' },
  { icon: Shield, color: 'text-blue-400', title: 'Kareah en groupe', text: 'La purge via Kareah est bien plus sûre à 2-4 joueurs. Désignez un terminal opérateur et des couvertures pour les entrées.' },
  { icon: Clock, color: 'text-purple-400', title: 'Prescription CS1', text: 'Un CS1 expire après environ 123 jours in-game (~3 jours réels) sans nouvelle infraction. Parfois, simplement attendre est suffisant.' },
];

const CS_BADGE_STYLES = {
  CS1: 'badge-green',
  CS2: 'badge-yellow',
  CS3: 'badge-red',
  CS4: 'badge-red',
  CS5: 'badge-purple',
};

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

function PurgeCard({ method }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx('card border', method.color)}>
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-slate-200">{method.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">{method.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${method.badgeColor}`}>{method.csLimit}</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 space-y-3 animate-fade-in">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge badge-slate">Difficulté : {method.difficulty}</span>
          </div>
          <ol className="space-y-1.5">
            {method.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex gap-2 p-3 rounded-lg bg-space-700/60 border border-space-400/20">
            <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 italic">{method.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page principale ─── */

export default function CrimeStat() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const match = (/** @type {string[]} */ ...fields) => !q || fields.some(f => f && f.toLowerCase().includes(q));

  const filteredLevels = CS_LEVELS.filter(cs => match(cs.level, cs.threshold, cs.examples, cs.consequences, cs.hunters));
  const filteredInfractions = INFRACTIONS.filter(r => match(r.infraction, r.cs, r.zone, r.amende));
  const filteredPurge = PURGE_METHODS.filter(m => match(m.name, m.location, m.csLimit, m.difficulty, m.tip));
  const filteredZones = SECURITY_ZONES.filter(z => match(z.zone, z.description, z.reaction, z.examples));
  const filteredTips = TIPS.filter(t => match(t.title, t.text));

  const NAV_ITEMS = [
    { id: 'intro', label: 'Présentation' },
    { id: 'niveaux', label: 'Niveaux CS1-CS5' },
    { id: 'infractions', label: 'Infractions' },
    { id: 'purge', label: 'Purge' },
    { id: 'zones', label: 'Zones Sécurité' },
    { id: 'astuces', label: 'Astuces' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-danger-400" />
            Système CrimeStat
          </h1>
          <span className="badge badge-red">Alpha 4.6</span>
          <span className="badge badge-slate">Mécanique avancée</span>
        </div>
        <p className="page-subtitle mt-1">
          Guide complet du système de crimes et conséquences — niveaux CS1 à CS5, infractions, purge et stratégies de survie
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
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un niveau, une infraction, une méthode de purge..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* Section 1 : Introduction */}
      <SectionAnchor id="intro" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-cyan-400" />
          Qu'est-ce que le CrimeStat ?
        </h2>
        <div className="prose-custom space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            Le <strong className="text-cyan-400">CrimeStat</strong> (Criminal Status) est le système de réputation criminelle de Star Citizen. Il quantifie le niveau de dangerosité d'un citoyen aux yeux des autorités de l'UEE (United Empire of Earth) et des organisations de sécurité privées.
          </p>
          <p>
            Chaque infraction commise ajoute des points criminels à votre profil. Ces points sont cumulatifs et peuvent faire monter votre CrimeStat de <strong className="text-success-400">CS1</strong> (mineur) à <strong className="text-purple-400">CS5</strong> (crimes contre l'humanité). Plus votre niveau est élevé, plus les conséquences sont sévères et les chasseurs de primes déterminés à vous capturer.
          </p>
          <p>
            Le CrimeStat est lié à votre personnage, pas à votre vaisseau. Changer de vaisseau ne vous protège pas. La seule solution permanente est la <strong className="text-gold-400">purge</strong> via des terminaux de nettoyage (légaux ou illégaux).
          </p>
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Niveaux', value: '5', color: 'text-cyan-400' },
            { label: 'Infractions listées', value: '22+', color: 'text-warning-400' },
            { label: 'Méthodes de purge', value: '4', color: 'text-success-400' },
            { label: 'Zones sécurité', value: '4', color: 'text-danger-400' },
          ].map(s => (
            <div key={s.label} className="bg-space-700/50 rounded-lg p-3 text-center">
              <div className={clsx('text-2xl font-bold font-display', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 : Niveaux CS */}
      <SectionAnchor id="niveaux" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gold-400" />
          Niveaux CrimeStat — CS1 à CS5
        </h2>
        <div className="space-y-3">
          {filteredLevels.map(cs => (
            <div key={cs.level} className={clsx('card border p-5', cs.border)}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className={clsx('flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-display font-black text-xl', cs.bg, cs.glow)}>
                  {cs.level}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Seuil</div>
                    <div className="text-sm text-slate-200 font-medium">{cs.threshold}</div>
                    <div className="text-xs text-slate-400 mt-1">{cs.examples}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Conséquences</div>
                    <div className="text-sm text-slate-300">{cs.consequences}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Durée</div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm text-slate-300">{cs.duration}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Chasseurs</div>
                    <span className={`badge ${cs.color}`}>{cs.hunters}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 : Infractions */}
      <SectionAnchor id="infractions" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-danger-400" />
          Tableau des Infractions
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Infraction</th>
                  <th>Niveau CS</th>
                  <th>Zone concernée</th>
                  <th>Amende estimée</th>
                </tr>
              </thead>
              <tbody>
                {filteredInfractions.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-200">{row.infraction}</td>
                    <td>
                      <span className={`badge ${CS_BADGE_STYLES[row.cs]}`}>{row.cs}</span>
                    </td>
                    <td className="text-slate-400 text-xs">{row.zone}</td>
                    <td className="font-mono text-xs text-gold-400">{row.amende}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 4 : Purge */}
      <SectionAnchor id="purge" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-success-400" />
          Comment Purger son CrimeStat ?
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Cliquez sur une méthode pour afficher les étapes détaillées.
        </p>
        <div className="space-y-3">
          {filteredPurge.map(method => (
            <PurgeCard key={method.id} method={method} />
          ))}
        </div>
      </div>

      {/* Section 5 : Zones de sécurité */}
      <SectionAnchor id="zones" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-400" />
          Zones de Sécurité
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Niveau de Sécurité</th>
                  <th>Temps de Réponse</th>
                  <th>Réaction aux Crimes</th>
                  <th>Exemples de Lieux</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${zone.color}`}>{zone.zone}</span>
                    </td>
                    <td className="text-slate-300 text-sm">{zone.description}</td>
                    <td className="text-slate-400 text-xs">{zone.reaction}</td>
                    <td className="text-slate-400 text-xs">{zone.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-space-700/40 border border-space-400/20 flex gap-3">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            <strong className="text-cyan-400">Note :</strong> Les zones de sécurité varient selon les systèmes. Stanton est géré par l'UEE et les corps de sécurité privés (Crusader Security, Hurston Dynamics Security, microTech Security). Pyro est entièrement en dehors de la juridiction UEE.
          </p>
        </div>
      </div>

      {/* Section 6 : Astuces */}
      <SectionAnchor id="astuces" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gold-400" />
          Astuces et Méta-Stratégies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTips.map((tip, i) => (
            <TipBox key={i} {...tip} />
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
          <button onClick={() => navigate('/bounty-hunting')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Chasse aux Primes
          </button>
          <button onClick={() => navigate('/guides')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Tous les Guides
          </button>
          <button onClick={() => navigate('/reputation')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Réputation Factions
          </button>
        </div>
      </div>
    </div>
  );
}
