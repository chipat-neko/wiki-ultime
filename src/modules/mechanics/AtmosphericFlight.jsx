import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Wind, ChevronDown, ChevronUp, Globe, Flame, Snowflake,
  AlertTriangle, Rocket, Fuel, Plane, Shield, Eye,
  Thermometer, Mountain, Cloudy, Info, Lightbulb,
  Anchor, Crosshair, ArrowUp, Search, X,
} from 'lucide-react';

/* ─── Données ─── */

const GRAVITY_TABLE = [
  {
    id: 'hurston',
    name: 'Hurston',
    type: 'Planète',
    gravity: '1.0g',
    gravityValue: 1.0,
    atmosphere: 'Dense',
    conditions: 'Vent modéré',
    badge: 'badge-gold',
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    bg: 'bg-gold-500/10',
    icon: Globe,
    details: 'Atmosphère épaisse avec une gravité terrestre standard. Le vol est prévisible mais la densité de l\'air augmente la traînée. Les vents peuvent perturber les petits vaisseaux à basse altitude.',
  },
  {
    id: 'crusader',
    name: 'Crusader',
    type: 'Géante gazeuse',
    gravity: '2.5g (surface)',
    gravityValue: 2.5,
    atmosphere: 'Haute atmosphère seulement',
    conditions: 'Surface inaccessible',
    badge: 'badge-purple',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: Cloudy,
    details: 'Géante gazeuse — seule la haute atmosphère est accessible. La gravité extrême en profondeur rend la surface mortelle. Orison flotte dans les couches supérieures.',
  },
  {
    id: 'arccorp',
    name: 'ArcCorp',
    type: 'Planète',
    gravity: '1.0g',
    gravityValue: 1.0,
    atmosphere: 'Dense',
    conditions: 'Zone urbaine, trafic intense',
    badge: 'badge-cyan',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    icon: Globe,
    details: 'Planète entièrement urbanisée. L\'atmosphère est dense et polluée. Le trafic aérien est intense autour d\'Area 18. Zones de vol restreintes (no-fly zones) actives.',
  },
  {
    id: 'microtech',
    name: 'MicroTech',
    type: 'Planète',
    gravity: '0.9g',
    gravityValue: 0.9,
    atmosphere: 'Dense',
    conditions: 'Tempêtes de neige fréquentes, visibilité réduite',
    badge: 'badge-blue',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    icon: Snowflake,
    details: 'Planète glacée avec des blizzards violents. La visibilité peut tomber à quelques dizaines de mètres. Utilisez les instruments et réduisez votre vitesse lors des tempêtes.',
  },
  {
    id: 'daymar',
    name: 'Daymar',
    type: 'Lune',
    gravity: '0.3g',
    gravityValue: 0.3,
    atmosphere: 'Fine',
    conditions: 'Poussière',
    badge: 'badge-yellow',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    icon: Mountain,
    details: 'Lune désertique avec une atmosphère très fine. La faible gravité facilite le décollage mais rend l\'atterrissage délicat — attention à l\'inertie. Tempêtes de poussière possibles.',
  },
  {
    id: 'cellin',
    name: 'Cellin',
    type: 'Lune',
    gravity: '0.28g',
    gravityValue: 0.28,
    atmosphere: 'Aucune',
    conditions: 'Pas d\'atmosphère',
    badge: 'badge-slate',
    color: 'text-slate-400',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    icon: Mountain,
    details: 'Lune volcanique sans atmosphère. Le vol se comporte comme en espace — pas de traînée, pas de portance. La gravité faible simplifie les manœuvres.',
  },
  {
    id: 'yela',
    name: 'Yela',
    type: 'Lune',
    gravity: '0.29g',
    gravityValue: 0.29,
    atmosphere: 'Aucune',
    conditions: 'Pas d\'atmosphère',
    badge: 'badge-slate',
    color: 'text-slate-400',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    icon: Snowflake,
    details: 'Lune glacée sans atmosphère, entourée d\'un anneau d\'astéroïdes. Vol similaire à l\'espace. Terrain accidenté avec des crevasses profondes.',
  },
  {
    id: 'aberdeen',
    name: 'Aberdeen',
    type: 'Lune',
    gravity: '0.34g',
    gravityValue: 0.34,
    atmosphere: 'Toxique',
    conditions: 'Toxique, chaleur',
    badge: 'badge-red',
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: Flame,
    details: 'Atmosphère toxique et très chaude. L\'atmosphère fine ajoute une légère traînée. Température élevée — surveillez la thermique du vaisseau lors de vols prolongés.',
  },
  {
    id: 'arial',
    name: 'Arial',
    type: 'Lune',
    gravity: '0.35g',
    gravityValue: 0.35,
    atmosphere: 'Fine',
    conditions: 'Volcanique',
    badge: 'badge-red',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    icon: Flame,
    details: 'Lune volcanique avec une fine atmosphère. Activité volcanique visible, terrain dangereux. La chaleur résiduelle peut affecter les capteurs IR.',
  },
  {
    id: 'magda',
    name: 'Magda',
    type: 'Lune',
    gravity: '0.32g',
    gravityValue: 0.32,
    atmosphere: 'Fine',
    conditions: 'Fine atmosphère',
    badge: 'badge-yellow',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    icon: Mountain,
    details: 'Lune aride avec une fine atmosphère. Conditions de vol relativement calmes. Terrain montagneux pouvant poser des défis à basse altitude.',
  },
  {
    id: 'clio',
    name: 'Clio',
    type: 'Lune',
    gravity: '0.3g',
    gravityValue: 0.3,
    atmosphere: 'Fine',
    conditions: 'Très froid',
    badge: 'badge-blue',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    icon: Snowflake,
    details: 'Lune extrêmement froide avec une fine atmosphère glaciale. Les basses températures n\'affectent pas directement le vol mais limitent le temps de survie EVA.',
  },
  {
    id: 'calliope',
    name: 'Calliope',
    type: 'Lune',
    gravity: '0.28g',
    gravityValue: 0.28,
    atmosphere: 'Fine',
    conditions: 'Fin atmosphère',
    badge: 'badge-slate',
    color: 'text-slate-300',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    icon: Mountain,
    details: 'Petite lune avec une atmosphère très fine. Conditions de vol proches de l\'espace. Terrain relativement plat, atterrissage facile.',
  },
  {
    id: 'euterpe',
    name: 'Euterpe',
    type: 'Lune',
    gravity: '0.31g',
    gravityValue: 0.31,
    atmosphere: 'Fine',
    conditions: 'Tempêtes',
    badge: 'badge-purple',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: Wind,
    details: 'Lune balayée par des tempêtes fréquentes malgré une atmosphère fine. Les rafales soudaines peuvent déstabiliser les petits vaisseaux. Prudence à l\'atterrissage.',
  },
];

const FLIGHT_TIPS_ENV = [
  {
    id: 'landing',
    name: 'Atterrissage',
    icon: Anchor,
    color: 'text-cyan-400',
    badge: 'badge-cyan',
    tips: [
      'Approchez à un angle de 5-10° maximum pour une descente contrôlée.',
      'Activez le Hover Mode à basse vitesse pour stabiliser le vaisseau près du sol.',
      'Déployez le train d\'atterrissage (N) en avance — il ajoute de la traînée qui ralentit naturellement.',
      'En VTOL, les thrusters consomment plus de H2 — ne restez pas en stationnaire trop longtemps.',
      'Sur les lunes à faible gravité, réduisez la poussée verticale pour éviter de rebondir.',
      'Utilisez le mode découplé pour des atterrissages de précision sur terrain accidenté.',
    ],
  },
  {
    id: 'storms',
    name: 'Tempêtes',
    icon: Cloudy,
    color: 'text-blue-400',
    badge: 'badge-blue',
    tips: [
      'Sur MicroTech, les blizzards réduisent la visibilité à quasi zéro — fiez-vous aux instruments.',
      'Réduisez votre vitesse à 100-150 m/s max en tempête pour garder le contrôle.',
      'Les tempêtes de sable sur Daymar créent de la poussière qui gêne la visibilité sans affecter les systèmes.',
      'Montez en altitude pour sortir des couches météo les plus denses.',
      'Les vents latéraux peuvent pousser votre vaisseau hors trajectoire — compensez avec du strafe.',
      'Évitez d\'atterrir pendant une tempête si possible, orbitez en attendant une accalmie.',
    ],
  },
  {
    id: 'combat',
    name: 'Combat atmosphérique',
    icon: Crosshair,
    color: 'text-red-400',
    badge: 'badge-red',
    tips: [
      'Utilisez la gravité comme alliée — piquez pour accélérer, remontez pour ralentir votre adversaire.',
      'Le terrain offre une couverture naturelle : montagnes, canyons, bâtiments.',
      'Les vaisseaux lourds sont très désavantagés en atmosphère — exploitez leur lenteur.',
      'Le combat à basse altitude est risqué mais rend les missiles moins efficaces (interférence terrain).',
      'Gardez toujours assez de poussée pour remonter — toucher le sol en combat est souvent fatal.',
      'Les vaisseaux avec une bonne poussée verticale (VTOL) dominent en atmosphère.',
    ],
  },
  {
    id: 'takeoff',
    name: 'Décollage',
    icon: ArrowUp,
    color: 'text-gold-400',
    badge: 'badge-gold',
    tips: [
      'Le rapport poussée/poids est crucial : un vaisseau lourd et chargé aura du mal à décoller en haute gravité.',
      'Sur les planètes 1g (Hurston, ArcCorp), le décollage consomme beaucoup plus de H2 que sur les lunes.',
      'Décollez à la verticale puis inclinez progressivement vers votre cap — ne forcez pas un décollage horizontal.',
      'Avec un cargo plein, vérifiez que vos thrusters sont en bon état avant de tenter un décollage en gravité.',
      'En faible gravité (lunes), un simple boost suffit pour atteindre l\'orbite rapidement.',
      'La consommation H2 au décollage peut représenter 5-15% de votre réservoir sur une planète 1g.',
    ],
  },
];

const RECOMMENDED_SHIPS = [
  {
    category: 'Meilleurs chasseurs en atmosphère',
    badge: 'badge-green',
    icon: Crosshair,
    color: 'text-green-400',
    ships: [
      { name: 'Gladius', note: 'Excellent rapport poussée/poids, très maniable en atmosphère.' },
      { name: 'Arrow', note: 'Léger et agile, accélération verticale supérieure.' },
      { name: 'Blade', note: 'Aérodynamique alien, profil de vol unique en atmosphère.' },
    ],
  },
  {
    category: 'Meilleurs cargos en atmosphère',
    badge: 'badge-cyan',
    icon: Plane,
    color: 'text-cyan-400',
    ships: [
      { name: 'Freelancer', note: 'Bonne poussée VTOL, atterrissage stable même chargé.' },
      { name: 'Cutlass Black', note: 'Polyvalent, thrusters VTOL puissants pour sa taille.' },
      { name: 'C2 Hercules', note: 'Malgré sa taille, conçu pour le transport planétaire.' },
    ],
  },
  {
    category: 'Pires vaisseaux en atmosphère',
    badge: 'badge-red',
    icon: AlertTriangle,
    color: 'text-red-400',
    ships: [
      { name: 'Reclaimer', note: 'Masse énorme, thrusters insuffisants — décollage laborieux.' },
      { name: '890 Jump', note: 'Yacht de luxe massif, très lent à manœuvrer en gravité.' },
      { name: 'Hull C', note: 'Conçu pour l\'espace — en atmosphère avec cargaison, quasi impossible.' },
    ],
  },
];

const FUEL_DATA = [
  { context: 'Espace (0g)', h2: 'Base', multiplier: '×1', badge: 'badge-green', detail: 'Consommation de référence, aucune résistance.' },
  { context: 'Atmosphère fine (lunes)', h2: 'Légèrement élevée', multiplier: '×1.2 – ×1.5', badge: 'badge-cyan', detail: 'Faible gravité + atmosphère fine = surcoût modéré.' },
  { context: 'Atmosphère dense (planètes 1g)', h2: 'Élevée', multiplier: '×2 – ×3', badge: 'badge-yellow', detail: 'Traînée + gravité standard = consommation doublée à triplée.' },
  { context: 'Hover stationnaire (1g)', h2: 'Très élevée', multiplier: '×3 – ×4', badge: 'badge-red', detail: 'Maintien en vol stationnaire — thrusters à puissance continue.' },
  { context: 'Décollage haute gravité', h2: 'Maximale', multiplier: '×4 – ×6', badge: 'badge-red', detail: 'Phase la plus gourmande — pleine poussée contre la gravité.' },
  { context: 'Crusader (haute atmo)', h2: 'Extrême', multiplier: '×5 – ×8', badge: 'badge-purple', detail: 'Gravité de 2.5g combinée à une atmosphère dense — réservé aux gros vaisseaux.' },
];

const TIPS = [
  {
    icon: Eye,
    color: 'text-blue-400',
    title: 'Surveillez votre altimètre',
    text: 'En atmosphère, l\'altimètre est votre meilleur ami. Gardez un œil sur votre altitude AGL (Above Ground Level) pour éviter les collisions avec le terrain.',
  },
  {
    icon: Fuel,
    color: 'text-gold-400',
    title: 'Planifiez votre carburant H2',
    text: 'Le vol atmosphérique consomme 2 à 4 fois plus de H2 qu\'en espace. Prévoyez toujours 20-30% de réserve avant d\'entrer en atmosphère, surtout sur les planètes 1g.',
  },
  {
    icon: Wind,
    color: 'text-cyan-400',
    title: 'Respectez la météo',
    text: 'Les tempêtes ne sont pas qu\'un effet visuel. Sur MicroTech et Euterpe, elles peuvent réellement pousser votre vaisseau et réduire la visibilité à zéro.',
  },
  {
    icon: Shield,
    color: 'text-green-400',
    title: 'Boucliers contre le terrain',
    text: 'Vos boucliers absorbent les impacts légers avec le sol. Mais un crash à haute vitesse les traversera — ne comptez pas sur eux pour un atterrissage raté.',
  },
  {
    icon: Thermometer,
    color: 'text-red-400',
    title: 'Gestion thermique',
    text: 'Sur les corps chauds comme Aberdeen, la chaleur ambiante réduit l\'efficacité du refroidissement. Vos composants surchauffent plus vite — évitez les combats prolongés.',
  },
  {
    icon: Rocket,
    color: 'text-purple-400',
    title: 'Vitesse d\'évasion',
    text: 'Chaque corps a une gravité différente. Sur une lune à 0.3g, quelques secondes de poussée suffisent pour atteindre l\'orbite. Sur Hurston, prévoyez une longue montée.',
  },
  {
    icon: AlertTriangle,
    color: 'text-warning-400',
    title: 'Attention aux no-fly zones',
    text: 'ArcCorp et certaines zones de Hurston ont des restrictions de vol. Voler dans une no-fly zone active les tourelles automatiques — dégâts garantis.',
  },
  {
    icon: Lightbulb,
    color: 'text-gold-400',
    title: 'Utilisez la troisième personne',
    text: 'La vue externe (F4) aide à évaluer votre proximité au sol lors des atterrissages délicats. Alternez entre vue cockpit et vue externe pour plus de conscience spatiale.',
  },
];

const NAV_ITEMS = [
  { id: 'gravity', label: 'Gravité' },
  { id: 'environment', label: 'Environnement' },
  { id: 'ships', label: 'Vaisseaux' },
  { id: 'fuel', label: 'Carburant' },
  { id: 'tips', label: 'Conseils' },
];

/* ─── Helpers ─── */

function SectionAnchor({ id }) {
  return <div id={id} className="scroll-mt-24" />;
}

function ExpandableCard({ title, subtitle, icon: Icon, iconColor, badge, badgeClass, border, bg, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={clsx('rounded-xl border overflow-hidden transition-all', border, bg)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={clsx('w-5 h-5', iconColor)} />}
          <div className="text-left">
            <span className="font-semibold text-slate-200">{title}</span>
            {subtitle && <span className="text-xs text-slate-500 ml-2">{subtitle}</span>}
          </div>
          {badge && <span className={clsx('badge text-xs', badgeClass)}>{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-space-400/20">{children}</div>}
    </div>
  );
}

/* ─── Composant principal ─── */

export default function AtmosphericFlight() {
  const [search, setSearch] = useState('');
  const [expandedBodies, setExpandedBodies] = useState({});

  const q = search.toLowerCase();
  const match = (/** @type {string[]} */ ...fields) => !q || fields.some(f => f && f.toLowerCase().includes(q));

  const toggleBody = (id) => setExpandedBodies(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredBodies = GRAVITY_TABLE.filter(b => match(b.name, b.type, b.atmosphere, b.conditions, b.details));
  const filteredEnvTips = FLIGHT_TIPS_ENV.filter(e => match(e.name, ...e.tips));
  const filteredShips = RECOMMENDED_SHIPS.filter(c => match(c.category, ...c.ships.map(s => s.name + ' ' + s.note)));
  const filteredFuel = FUEL_DATA.filter(f => match(f.context, f.detail, f.h2));
  const filteredTips = TIPS.filter(t => match(t.title, t.text));

  const maxGravity = Math.max(...GRAVITY_TABLE.map(b => b.gravityValue));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Wind className="w-7 h-7 text-cyan-400" />
            Vol Atmosphérique
          </h1>
          <span className="badge badge-cyan">Alpha 4.6</span>
          <span className="badge badge-gold">Flight Model</span>
        </div>
        <p className="page-subtitle mt-1">
          Maîtriser le vol dans les atmosphères de Star Citizen
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
          placeholder="Rechercher un corps, un conseil, un vaisseau..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Section 1 : Gravité par corps */}
      <SectionAnchor id="gravity" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gold-400" />
          Gravité &amp; Atmosphère par corps céleste
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          Chaque planète et lune du système Stanton possède une gravité et une atmosphère uniques
          qui affectent directement le comportement de votre vaisseau. Cliquez sur un corps pour plus de détails.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBodies.map(body => {
            const Icon = body.icon;
            const isOpen = expandedBodies[body.id];
            return (
              <div key={body.id} className={clsx('rounded-xl border overflow-hidden transition-all', body.border, body.bg)}>
                <button
                  onClick={() => toggleBody(body.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-space-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={clsx('w-5 h-5', body.color)} />
                    <div className="text-left">
                      <span className={clsx('font-semibold', body.color)}>{body.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{body.type}</span>
                    </div>
                    <span className={clsx('badge text-xs', body.badge)}>{body.gravity}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-space-400/20 space-y-3">
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-space-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-500">Atmosphère</div>
                        <div className="text-sm text-slate-200 font-medium">{body.atmosphere}</div>
                      </div>
                      <div className="bg-space-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-500">Conditions</div>
                        <div className="text-sm text-slate-200 font-medium">{body.conditions}</div>
                      </div>
                    </div>
                    {/* Barre de gravité */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Gravité relative</div>
                      <div className="w-full bg-space-800/60 rounded-full h-2">
                        <div
                          className={clsx('h-2 rounded-full transition-all', body.gravityValue >= 1.0 ? 'bg-red-500' : body.gravityValue >= 0.5 ? 'bg-gold-500' : 'bg-cyan-500')}
                          style={{ width: `${Math.min((body.gravityValue / maxGravity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">{body.details}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Résumé stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Corps célestes', value: '13', color: 'text-gold-400' },
            { label: 'Avec atmosphère', value: '10', color: 'text-cyan-400' },
            { label: 'Gravité max', value: '2.5g', color: 'text-red-400' },
            { label: 'Gravité min', value: '0.28g', color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-space-700/50 rounded-lg p-3 text-center">
              <div className={clsx('text-2xl font-bold font-display', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 : Conseils par environnement */}
      <SectionAnchor id="environment" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-cyan-400" />
          Conseils par environnement
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          Chaque situation de vol en atmosphère demande des techniques spécifiques.
          Développez chaque section pour les conseils détaillés.
        </p>

        <div className="space-y-3">
          {filteredEnvTips.map(env => (
            <ExpandableCard
              key={env.id}
              title={env.name}
              icon={env.icon}
              iconColor={env.color}
              badge={env.badge}
              badgeClass={env.badge}
              border="border-space-400/20"
              bg="bg-space-800/30"
            >
              <ul className="space-y-2 mt-3">
                {env.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={clsx('mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0', env.color.replace('text-', 'bg-'))} />
                    {tip}
                  </li>
                ))}
              </ul>
            </ExpandableCard>
          ))}
        </div>
      </div>

      {/* Section 3 : Vaisseaux recommandés */}
      <SectionAnchor id="ships" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-gold-400" />
          Vaisseaux recommandés en atmosphère
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          Tous les vaisseaux ne se valent pas en atmosphère. Le rapport poussée/poids,
          l'aérodynamisme et la puissance des thrusters VTOL font la différence.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filteredShips.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="rounded-xl border border-space-400/20 bg-space-800/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={clsx('w-5 h-5', cat.color)} />
                  <h3 className="font-semibold text-slate-200 text-sm">{cat.category}</h3>
                  <span className={clsx('badge text-xs ml-auto', cat.badge)}>
                    {cat.badge === 'badge-green' ? 'Top' : cat.badge === 'badge-cyan' ? 'Bon' : 'Éviter'}
                  </span>
                </div>
                <div className="space-y-2">
                  {cat.ships.map(ship => (
                    <div key={ship.name} className="bg-space-700/50 rounded-lg p-3">
                      <div className={clsx('font-medium text-sm', cat.color)}>{ship.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ship.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4 : Consommation carburant */}
      <SectionAnchor id="fuel" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Fuel className="w-5 h-5 text-warning-400" />
          Consommation de carburant H2
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          L'atmosphère et la gravité augmentent drastiquement la consommation de carburant hydrogène (H2).
          Les thrusters doivent lutter en permanence contre la gravité et la traînée atmosphérique.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Contexte</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Conso H2</th>
                <th className="text-center py-2 px-3 text-slate-400 font-medium">Multiplicateur</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium hidden sm:table-cell">Détail</th>
              </tr>
            </thead>
            <tbody>
              {filteredFuel.map((row, i) => (
                <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-200 font-medium">{row.context}</td>
                  <td className="py-2.5 px-3">
                    <span className={clsx('badge text-xs', row.badge)}>{row.h2}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-gold-400">{row.multiplier}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs hidden sm:table-cell">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-warning-500/10 border border-warning-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-300">
            <strong className="text-warning-400">Important :</strong> Un vaisseau cargo plein en atmosphère dense (Hurston, ArcCorp) peut consommer
            jusqu'à 6 fois plus de H2 qu'en espace. Refaites toujours le plein avant un vol planétaire prolongé.
          </p>
        </div>
      </div>

      {/* Section 5 : Tips pratiques */}
      <SectionAnchor id="tips" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-gold-400" />
          Conseils pratiques
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-space-800/40 border border-space-400/15 rounded-xl p-4 hover:border-space-400/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={clsx('w-4 h-4', tip.color)} />
                  <h3 className="font-semibold text-sm text-slate-200">{tip.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
