import React, { useState, useMemo } from 'react';
import { SHIPS } from '../../datasets/ships.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import clsx from 'clsx';
import {
  Cpu, Zap, Thermometer, Eye, Shield, Calculator,
  ChevronDown, ChevronUp, Info, AlertTriangle, CheckCircle,
  Rocket, TrendingDown, Radio, Crosshair, Search, X,
} from 'lucide-react';

// ============================================================
// DONNEES INTERNES
// ============================================================

const POWER_PLANTS = [
  { id: 'pp1', name: 'A&R Power Core S1',  taille: 'S1', type: 'Standard',  puissance: 145, chaleur: 38,  sigEM: 'Faible',  note: 'Polyvalent, bon rapport qualité/prix' },
  { id: 'pp2', name: 'Juno Starwerk E1',    taille: 'S1', type: 'Civilian',  puissance: 120, chaleur: 28,  sigEM: 'Très Faible', note: 'Silencieux, idéal exploration furtive' },
  { id: 'pp3', name: 'Lightning Power L1',  taille: 'S1', type: 'Military',  puissance: 165, chaleur: 52,  sigEM: 'Élevée',  note: 'Haute puissance pour chasseurs de combat' },
  { id: 'pp4', name: 'Stealth Revenant S1', taille: 'S1', type: 'Stealth',   puissance: 105, chaleur: 14,  sigEM: 'Minimale', note: 'Signature EM quasi nulle — builds furtifs' },
  { id: 'pp5', name: 'A&R Power Core S2',  taille: 'S2', type: 'Standard',  puissance: 285, chaleur: 74,  sigEM: 'Moyenne', note: 'Standard pour vaisseaux médiums' },
  { id: 'pp6', name: 'Juno Starwerk E2',    taille: 'S2', type: 'Civilian',  puissance: 240, chaleur: 55,  sigEM: 'Faible',  note: 'Économique, bon pour cargo / exploration' },
  { id: 'pp7', name: 'Lightning Power L2',  taille: 'S2', type: 'Military',  puissance: 320, chaleur: 98,  sigEM: 'Élevée',  note: 'Alimenter multi-boucliers + armes lourdes' },
  { id: 'pp8', name: 'Stealth Revenant S2', taille: 'S2', type: 'Stealth',   puissance: 200, chaleur: 28,  sigEM: 'Minimale', note: 'Optimal builds furtifs S2 (Eclipse, Sabre)' },
];

const COOLERS = [
  { id: 'c1', name: 'A&R Cryo-Star S1',      taille: 'S1', type: 'Standard',  refroid: 48,  efficacite: 72, sigIR: 'Faible',  note: 'Refroidissement équilibré' },
  { id: 'c2', name: 'Juno Starwerk Ice-Flush', taille: 'S1', type: 'Stealth',   refroid: 35,  efficacite: 90, sigIR: 'Minimale', note: 'Furtif : dissipation lente mais très silencieuse' },
  { id: 'c3', name: 'RubberHead CryoBlast',   taille: 'S1', type: 'Military',  refroid: 62,  efficacite: 65, sigIR: 'Moyenne', note: 'Haute puissance de refroidissement brute' },
  { id: 'c4', name: 'Juno Starwerk Ice-Flush', taille: 'S2', type: 'Stealth',   refroid: 68,  efficacite: 92, sigIR: 'Minimale', note: 'Meilleur cooler stealth S2' },
  { id: 'c5', name: 'A&R Cryo-Star S2',      taille: 'S2', type: 'Standard',  refroid: 95,  efficacite: 70, sigIR: 'Faible',  note: 'Standard pour médiums' },
  { id: 'c6', name: 'RubberHead CryoBlast S2',taille: 'S2', type: 'Military',  refroid: 125, efficacite: 62, sigIR: 'Élevée',  note: 'Maximum de refroidissement, signature élevée' },
  { id: 'c7', name: 'A&R Cryo-Star S3',      taille: 'S3', type: 'Standard',  refroid: 180, efficacite: 68, sigIR: 'Faible',  note: 'Grands vaisseaux multi-composants' },
  { id: 'c8', name: 'Juno Starwerk Ice-Flush S3', taille: 'S3', type: 'Stealth', refroid: 130, efficacite: 94, sigIR: 'Minimale', note: 'Furtif S3 — disponibilité limitée' },
];

const SHIELD_GENERATORS = [
  { id: 'sg1', name: 'Phalanx S1 (A&R)',     taille: 'S1', type: 'Bubble',    hpFace: 420,  regenS: 18,  regenDelay: 3.5, cooldown: 8,  sigEM: 'Faible',  note: 'Équilibré pour petits chasseurs' },
  { id: 'sg2', name: 'ForceWall S1 (Gorgon)', taille: 'S1', type: 'Flat',     hpFace: 510,  regenS: 12,  regenDelay: 4.0, cooldown: 10, sigEM: 'Moyenne', note: 'HP élevés, regen lente' },
  { id: 'sg3', name: 'AllStop S1 (Yorm)',     taille: 'S1', type: 'Staggered', hpFace: 380,  regenS: 22,  regenDelay: 2.8, cooldown: 6,  sigEM: 'Très Faible', note: 'Regen rapide idéal pour style hit-and-run' },
  { id: 'sg4', name: 'Phalanx S2 (A&R)',     taille: 'S2', type: 'Bubble',    hpFace: 920,  regenS: 35,  regenDelay: 4.0, cooldown: 10, sigEM: 'Faible',  note: 'Standard vaisseaux médiums' },
  { id: 'sg5', name: 'ForceWall S2 (Gorgon)', taille: 'S2', type: 'Flat',     hpFace: 1180, regenS: 25,  regenDelay: 5.0, cooldown: 14, sigEM: 'Élevée',  note: 'Tank pur — HP maximum' },
  { id: 'sg6', name: 'AllStop S2 (Yorm)',     taille: 'S2', type: 'Staggered', hpFace: 850,  regenS: 42,  regenDelay: 3.2, cooldown: 8,  sigEM: 'Faible',  note: 'Meilleur regen/delay ratio S2' },
  { id: 'sg7', name: 'Phalanx S3 (A&R)',     taille: 'S3', type: 'Bubble',    hpFace: 2400, regenS: 80,  regenDelay: 5.0, cooldown: 15, sigEM: 'Moyenne', note: 'Grands vaisseaux polyvalent' },
  { id: 'sg8', name: 'ForceWall S4 (Gorgon)', taille: 'S4', type: 'Flat',     hpFace: 5800, regenS: 150, regenDelay: 6.0, cooldown: 20, sigEM: 'Élevée',  note: 'Vaisseaux capitaux — HP absurdes' },
];

const ALLOC_PRESETS = [
  { role: 'Combat Offensif',   armes: 70, boucliers: 20, propulseurs: 10, couleur: 'text-red-400',    desc: 'Maximum DPS — fragile, agile impossible' },
  { role: 'Combat Défensif',   armes: 30, boucliers: 60, propulseurs: 10, couleur: 'text-cyan-400',   desc: 'Tanker les dégâts, regen bouclier prioritaire' },
  { role: 'Fuite / Évasion',   armes: 10, boucliers: 20, propulseurs: 70, couleur: 'text-green-400',  desc: 'Vitesse et manoeuvrabilité maximales' },
  { role: 'Équilibré',         armes: 33, boucliers: 34, propulseurs: 33, couleur: 'text-yellow-400', desc: 'Polyvalent — bon dans tout, excellent en rien' },
  { role: 'Exploration',       armes:  0, boucliers: 50, propulseurs: 50, couleur: 'text-blue-400',   desc: 'Discrétion + autonomie — pas de combat' },
  { role: 'Furtif (Stealth)',  armes: 20, boucliers: 30, propulseurs: 50, couleur: 'text-purple-400', desc: 'Minimum d\'émissions EM — mode ECLIPSE' },
];

const SIG_DETECTION = [
  { niveau: 'Minimale',  distance: '< 2 km',  lockMissile: '< 1 km',  furtivite: 'Excellente', badge: 'badge-green', desc: 'Stealth build parfait — quasi indétectable' },
  { niveau: 'Faible',   distance: '2–5 km',  lockMissile: '1–3 km',  furtivite: 'Bonne',      badge: 'badge-cyan',  desc: 'Petits chasseurs standard / builds civils' },
  { niveau: 'Moyenne',  distance: '5–12 km', lockMissile: '3–7 km',  furtivite: 'Correcte',   badge: 'badge-yellow',desc: 'Vaisseaux médiums sans modification' },
  { niveau: 'Élevée',   distance: '12–25 km',lockMissile: '7–15 km', furtivite: 'Mauvaise',   badge: 'badge-red',   desc: 'Grands vaisseaux, power plants military' },
  { niveau: 'Extrême',  distance: '> 25 km', lockMissile: '> 15 km', furtivite: 'Nulle',      badge: 'badge-red',   desc: 'Vaisseaux capitaux / surcharge système' },
];

const STEALTH_SHIPS = [
  { name: 'Eclipse (Aegis)',      ir: 'Minimale', em: 'Minimale', cs: 'Faible',  note: 'Meilleur vaisseau furtif du jeu' },
  { name: 'Sabre (Aegis)',        ir: 'Faible',   em: 'Faible',   cs: 'Faible',  note: 'Bon compromis furtivité / combat' },
  { name: 'Gladius (Aegis)',      ir: 'Faible',   em: 'Faible',   cs: 'Faible',  note: 'Petit, rapide, discret' },
  { name: '315p (Origin)',        ir: 'Faible',   em: 'Très Faible',cs:'Faible', note: 'Explorer furtif par excellence' },
  { name: 'Avenger Titan (Aegis)',ir: 'Moyenne',  em: 'Moyenne',  cs: 'Faible',  note: 'Polyvalent, signature standard' },
  { name: '600i (Origin)',        ir: 'Élevée',   em: 'Élevée',   cs: 'Élevée',  note: 'Grand luxueux — très visible' },
  { name: 'Hammerhead (Aegis)',   ir: 'Très Élevée',em:'Très Élevée',cs:'Très Élevée',note:'Frégate — détectable de très loin' },
  { name: 'Hull C (MISC)',        ir: 'Élevée',   em: 'Élevée',   cs: 'Très Élevée',note:'Cargo lourd — cible facile' },
];

const POWER_TIPS = [
  {
    title: 'Allocation manuelle (touches V + 1-5)',
    content: [
      'Appuyer V ouvre le menu d\'allocation d\'énergie en cockpit.',
      'Les touches 1, 2, 3 sélectionnent le système (Armes / Boucliers / Propulseurs).',
      'Les touches 4 et 5 augmentent ou diminuent l\'allocation du système sélectionné.',
      'En combat : boost Armes → 3 pips, Boucliers → 2 pips, Propulseurs → 1 pip.',
      'En fuite : Propulseurs → max, Armes → 0, Boucliers → le reste.',
    ],
  },
  {
    title: 'Gérer la surcharge (Overcharge)',
    content: [
      'Un composant en surcharge génère 150% de chaleur normale.',
      'Si la chaleur dépasse 100%, les composants peuvent s\'endommager ou s\'éteindre.',
      'Couper l\'alimentation d\'un composant non essentiel libère de la capacité pour les autres.',
      'Les Coolers dissipent la chaleur — vérifier qu\'ils sont bien alimentés.',
      'En cas de surchauffe critique : couper le Power Plant (P) puis le rallumer après refroidissement.',
    ],
  },
  {
    title: 'Mode ECLIPSE (Stealth Power)',
    content: [
      'Le mode ECLIPSE réduit la signature EM en abaissant la puissance totale du vaisseau.',
      'Accessible via le MFD Power Management en cockpit ou raccourci clavier.',
      'Incompatible avec le bouclier actif — les boucliers se coupent automatiquement.',
      'Idéal pour l\'approche furtive : couper Quantum Drive + boucliers + systèmes non critiques.',
      'Associer à un Stealth Power Plant (ex: Revenant) pour réduire encore la signature EM.',
    ],
  },
  {
    title: 'Vaisseaux avec meilleurs Power Plants stock',
    content: [
      'Eclipse (Aegis) : Stealth PP stock — signature EM minimale dès la sortie du hangar.',
      'Sabre (Aegis) : PP efficace, faible signature de base.',
      '315p (Origin) : PP silencieux par design — exploration furtive naturelle.',
      'Gladius (Aegis) : PP léger bien adapté à sa taille.',
      'Avenger Titan : PP standard correct — peut être upgradé facilement.',
    ],
  },
];

const HEAT_THRESHOLDS = [
  { label: 'Normal',     pct: 40,  color: 'bg-green-500',  textColor: 'text-green-400',  desc: '0–40% — Fonctionnement optimal' },
  { label: 'Chaud',      pct: 30,  color: 'bg-yellow-500', textColor: 'text-yellow-400', desc: '40–70% — Performance légèrement réduite' },
  { label: 'Surchauffe', pct: 20,  color: 'bg-orange-500', textColor: 'text-orange-400', desc: '70–90% — Risque de shutdown, performance dégradée' },
  { label: 'Critique',   pct: 10,  color: 'bg-red-500',    textColor: 'text-red-400',    desc: '90–100% — Shutdown imminent, dégâts possibles' },
];

const WEAPON_HEAT = [
  { arme: 'Laser Canons (energy)',  chaleur: 'Très élevée',  impactIR: '+++ IR',    categorie: 'Énergie' },
  { arme: 'Laser Repeaters',        chaleur: 'Élevée',        impactIR: '++ IR',     categorie: 'Énergie' },
  { arme: 'Plasma Cannons',         chaleur: 'Extrême',       impactIR: '++++ IR',   categorie: 'Énergie' },
  { arme: 'Ballistic Gatlings',     chaleur: 'Moyenne',       impactIR: '+ IR',      categorie: 'Balistique' },
  { arme: 'Ballistic Cannons',      chaleur: 'Faible',        impactIR: '~ IR',      categorie: 'Balistique' },
  { arme: 'Distortion Cannons',     chaleur: 'Faible',        impactIR: '~ IR',      categorie: 'Distorsion' },
  { arme: 'Neutron Cannons',        chaleur: 'Très élevée',   impactIR: '+++ IR',    categorie: 'Énergie' },
  { arme: 'Missiles (propulsion)',  chaleur: 'Nulle',         impactIR: '- IR',      categorie: 'Missile' },
];

// ============================================================
// COMPOSANTS UTILITAIRES
// ============================================================

function SigBadge({ value }) {
  const cfg = {
    'Minimale':      'badge-green',
    'Très Faible':   'badge-green',
    'Faible':        'badge-cyan',
    'Moyenne':       'badge-yellow',
    'Élevée':        'badge-red',
    'Très Élevée':   'badge-red',
    'Extrême':       'badge-red',
  };
  return <span className={clsx('badge', cfg[value] ?? 'badge-slate')}>{value}</span>;
}

function TypeBadge({ type }) {
  const cfg = {
    Standard:  'badge-cyan',
    Military:  'badge-red',
    Civilian:  'badge-blue',
    Stealth:   'badge-purple',
    Bubble:    'badge-cyan',
    Flat:      'badge-yellow',
    Staggered: 'badge-green',
  };
  return <span className={clsx('badge', cfg[type] ?? 'badge-slate')}>{type}</span>;
}

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-space-700/30 transition-colors"
      >
        <span className="font-semibold text-slate-200">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20">
          {children}
        </div>
      )}
    </div>
  );
}

function AllocBar({ label, pct, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-space-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-300 w-10 text-right">{pct}%</span>
    </div>
  );
}

function InfoNote({ children, type = 'info' }) {
  const cfg = {
    info:    { bg: 'bg-cyan-500/10 border-cyan-500/20',   icon: <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> },
    warning: { bg: 'bg-warning-500/10 border-warning-500/20', icon: <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" /> },
    success: { bg: 'bg-green-500/10 border-green-500/20', icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> },
  };
  const { bg, icon } = cfg[type] ?? cfg.info;
  return (
    <div className={clsx('flex gap-2 p-3 rounded-lg border text-sm text-slate-300', bg)}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

// ============================================================
// ONGLET 1 — GESTION DE L'ÉNERGIE
// ============================================================

function TabEnergy({ search = '' }) {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const preset = ALLOC_PRESETS[selectedPreset];
  const filteredPP = useMemo(() => {
    if (!search) return POWER_PLANTS;
    const q = search.toLowerCase();
    return POWER_PLANTS.filter(pp => pp.name.toLowerCase().includes(q) || pp.type.toLowerCase().includes(q) || pp.taille.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-8">

      {/* Triangle de puissance */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Comprendre le Triangle de Puissance
        </h2>
        <p className="text-sm text-slate-400">
          Star Citizen utilise un système de gestion d'énergie à trois pôles interdépendants.
          L'énergie totale du vaisseau est fixe — allouer plus à un système en prive les deux autres.
        </p>

        {/* Schéma CSS triangle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
          {/* Armes */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
            <div className="w-16 h-16 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center">
              <Crosshair className="w-8 h-8 text-red-400" />
            </div>
            <span className="text-sm font-semibold text-red-400">Armes</span>
            <span className="text-xs text-slate-500 text-center">DPS, cadence de tir,<br/>capacité de feu</span>
          </div>
          {/* Connecteurs */}
          <div className="flex flex-col items-center gap-1 text-slate-600 text-xs font-mono">
            <span>⟷</span>
            <span className="text-slate-500 text-center text-[11px]">Interdépendant</span>
          </div>
          {/* Boucliers */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
            <div className="w-16 h-16 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-cyan-400">Boucliers</span>
            <span className="text-xs text-slate-500 text-center">HP, regen rate,<br/>résistances</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-600 text-xs font-mono">
            <span>⟷</span>
          </div>
          {/* Propulseurs */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
            <div className="w-16 h-16 rounded-xl bg-green-500/15 border border-green-500/40 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-green-400" />
            </div>
            <span className="text-sm font-semibold text-green-400">Propulseurs</span>
            <span className="text-xs text-slate-500 text-center">Vitesse, boost,<br/>manoeuvrabilité</span>
          </div>
        </div>

        <InfoNote type="info">
          Le Power Plant alimente tous les systèmes. Monter en puissance un système = baisser les deux autres.
          La gestion en temps réel différencie les pilotes experts des novices.
        </InfoNote>
      </div>

      {/* Allocations recommandées */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Allocations Recommandées par Rôle</h2>
        <p className="text-sm text-slate-400">Sélectionne un profil pour voir la répartition optimale.</p>

        {/* Sélecteur de profils */}
        <div className="flex flex-wrap gap-2">
          {ALLOC_PRESETS.map((p, i) => (
            <button
              key={p.role}
              onClick={() => setSelectedPreset(i)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                selectedPreset === i
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-space-700 border-space-500/30 text-slate-400 hover:text-slate-200 hover:border-space-400/50'
              )}
            >
              {p.role}
            </button>
          ))}
        </div>

        {/* Barres d'allocation */}
        <div className="space-y-3 py-2">
          <AllocBar label="Armes" pct={preset.armes} color="bg-red-500" />
          <AllocBar label="Boucliers" pct={preset.boucliers} color="bg-cyan-500" />
          <AllocBar label="Propulseurs" pct={preset.propulseurs} color="bg-green-500" />
        </div>

        <div className={clsx('text-sm font-medium', preset.couleur)}>
          {preset.desc}
        </div>
      </div>

      {/* Tableau Power Plants */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-space-400/20">
          <h2 className="section-title flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Power Plants Populaires — Comparatif
          </h2>
          <p className="text-sm text-slate-500 mt-1">Les meilleurs power plants S1 et S2 disponibles en jeu.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Composant</th>
                <th>Taille</th>
                <th>Type</th>
                <th>Puissance</th>
                <th>Chaleur</th>
                <th>Signature EM</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredPP.map(pp => (
                <tr key={pp.id}>
                  <td className="font-medium text-slate-200">{pp.name}</td>
                  <td><span className="badge badge-slate">{pp.taille}</span></td>
                  <td><TypeBadge type={pp.type} /></td>
                  <td className="text-cyan-400 font-mono">{pp.puissance}</td>
                  <td className="text-orange-400 font-mono">{pp.chaleur}</td>
                  <td><SigBadge value={pp.sigEM} /></td>
                  <td className="text-slate-500 text-xs">{pp.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide pratique accordéon */}
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Guide Pratique
        </h2>
        {POWER_TIPS.map((tip, i) => (
          <AccordionItem key={tip.title} title={tip.title} defaultOpen={i === 0}>
            <ul className="mt-3 space-y-2">
              {tip.content.map((line, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-500 flex-shrink-0 mt-0.5">›</span>
                  {line}
                </li>
              ))}
            </ul>
          </AccordionItem>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 2 — GESTION DE LA CHALEUR
// ============================================================

function TabHeat({ search = '' }) {
  const filteredCoolers = useMemo(() => {
    if (!search) return COOLERS;
    const q = search.toLowerCase();
    return COOLERS.filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.taille.toLowerCase().includes(q));
  }, [search]);
  const filteredWeaponHeat = useMemo(() => {
    if (!search) return WEAPON_HEAT;
    const q = search.toLowerCase();
    return WEAPON_HEAT.filter(w => w.arme.toLowerCase().includes(q) || w.categorie.toLowerCase().includes(q));
  }, [search]);
  return (
    <div className="space-y-8">

      {/* Mécanisme de chaleur */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-400" />
          Mécanisme de Chaleur
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="text-sm font-semibold text-red-400">Sources de Chaleur</div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>› Armes énergie (surtout laser)</li>
              <li>› Power Plant (continu)</li>
              <li>› Propulseurs sous charge</li>
              <li>› Composants en surcharge</li>
              <li>› Environnement (étoile proche)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
            <div className="text-sm font-semibold text-blue-400">Dissipation</div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>› Coolers (dissipation active)</li>
              <li>› Espace vide (passif, lent)</li>
              <li>› Couper les composants</li>
              <li>› Mode ECLIPSE (réduit prod.)</li>
              <li>› Réduire puissance Power Plant</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-2">
            <div className="text-sm font-semibold text-cyan-400">Conséquences</div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>› Signature IR augmente</li>
              <li>› Performance dégradée</li>
              <li>› Shutdown automatique</li>
              <li>› Dégâts composants</li>
              <li>› Détection missiles IR</li>
            </ul>
          </div>
        </div>

        {/* Barre de paliers */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-300">Seuils de chaleur</div>
          <div className="w-full h-4 rounded-full overflow-hidden flex">
            {HEAT_THRESHOLDS.map(t => (
              <div
                key={t.label}
                className={clsx('h-full flex items-center justify-center text-[10px] font-bold text-white', t.color)}
                style={{ width: `${t.pct}%` }}
              >
                {t.pct >= 20 ? t.label : ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {HEAT_THRESHOLDS.map(t => (
              <div key={t.label} className="text-xs text-slate-400">
                <span className={clsx('font-semibold', t.textColor)}>{t.label} </span>
                — {t.desc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coolers */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-space-400/20">
          <h2 className="section-title flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-blue-400" />
            Coolers — Comparatif
          </h2>
          <p className="text-sm text-slate-500 mt-1">Les coolers déterminent à quelle vitesse votre vaisseau dissipe la chaleur et impactent directement votre signature IR.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Composant</th>
                <th>Taille</th>
                <th>Type</th>
                <th>Refroidissement</th>
                <th>Efficacité %</th>
                <th>Signature IR</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoolers.map(c => (
                <tr key={c.id}>
                  <td className="font-medium text-slate-200">{c.name}</td>
                  <td><span className="badge badge-slate">{c.taille}</span></td>
                  <td><TypeBadge type={c.type} /></td>
                  <td className="text-blue-400 font-mono">{c.refroid}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-space-600 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.efficacite}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{c.efficacite}%</span>
                    </div>
                  </td>
                  <td><SigBadge value={c.sigIR} /></td>
                  <td className="text-slate-500 text-xs">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature IR */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title flex items-center gap-2">
          <Eye className="w-4 h-4 text-orange-400" />
          Signature IR et Armes
        </h2>
        <p className="text-sm text-slate-400">
          La chaleur produite par vos armes se traduit directement en signature infrarouge. Plus votre IR est élevée, plus les missiles à tête chercheuse peuvent vous locker à distance.
        </p>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Arme</th>
                <th>Catégorie</th>
                <th>Chaleur produite</th>
                <th>Impact IR</th>
              </tr>
            </thead>
            <tbody>
              {filteredWeaponHeat.map(w => (
                <tr key={w.arme}>
                  <td className="font-medium text-slate-200">{w.arme}</td>
                  <td>
                    <span className={clsx('badge',
                      w.categorie === 'Énergie' ? 'badge-red' :
                      w.categorie === 'Balistique' ? 'badge-yellow' :
                      w.categorie === 'Distorsion' ? 'badge-purple' : 'badge-slate'
                    )}>{w.categorie}</span>
                  </td>
                  <td className="text-slate-300">{w.chaleur}</td>
                  <td className={clsx('font-mono font-bold text-sm',
                    w.impactIR.startsWith('++++') ? 'text-red-500' :
                    w.impactIR.startsWith('+++') ? 'text-orange-400' :
                    w.impactIR.startsWith('++') ? 'text-yellow-400' :
                    w.impactIR.startsWith('+') ? 'text-green-400' : 'text-slate-500'
                  )}>{w.impactIR}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoNote type="success">
            Les armes balistiques produisent très peu de chaleur — parfait pour maintenir une IR basse en combat furtif.
          </InfoNote>
          <InfoNote type="warning">
            Tirer en rafale avec des Laser Cannons peut doubler votre IR en quelques secondes — rendant les missiles IR très efficaces contre vous.
          </InfoNote>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 3 — SIGNATURES
// ============================================================

function TabSignatures({ search = '' }) {
  const filteredStealthShips = useMemo(() => {
    if (!search) return STEALTH_SHIPS;
    const q = search.toLowerCase();
    return STEALTH_SHIPS.filter(s => s.name.toLowerCase().includes(q));
  }, [search]);
  return (
    <div className="space-y-8">

      {/* Explication des 3 types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="font-semibold text-orange-400">IR — Infrarouge</div>
              <div className="text-xs text-slate-500">Chaleur thermique</div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Générée par la chaleur du vaisseau. Les missiles IR se lock à partir d'un certain seuil d'IR.
            Réduite par les <strong className="text-slate-300">coolers stealth</strong> et les armes balistiques.
          </p>
          <div className="space-y-1 text-xs text-slate-500">
            <div>› Affecte : portée de lock missiles IR</div>
            <div>› Réduit par : coolers / armes balistiques</div>
            <div>› Augmente avec : tir d'armes énergie</div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold text-cyan-400">EM — Électromagnétique</div>
              <div className="text-xs text-slate-500">Activité électrique</div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Générée par l'activité électrique du vaisseau (Power Plant, shields, QT). Les scanners détectent l'EM à grande distance.
            Réduite par les <strong className="text-slate-300">stealth power plants</strong>.
          </p>
          <div className="space-y-1 text-xs text-slate-500">
            <div>› Affecte : détection radar longue portée</div>
            <div>› Réduit par : stealth PP / mode ECLIPSE</div>
            <div>› Augmente avec : Power Plant / boucliers actifs</div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="font-semibold text-yellow-400">CS — Cross Section</div>
              <div className="text-xs text-slate-500">Taille physique</div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Correspond à la taille physique du vaisseau vue de face. Très difficile à réduire — inhérente au design du vaisseau.
            Les gros vaisseaux ont toujours un CS élevé.
          </p>
          <div className="space-y-1 text-xs text-slate-500">
            <div>› Affecte : détection visuelle / radar</div>
            <div>› Quasi immodifiable</div>
            <div>› Dépend du chassis du vaisseau</div>
          </div>
        </div>
      </div>

      {/* Tableau de détection */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-space-400/20">
          <h2 className="section-title flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Tableau de Détection par Niveau de Signature
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Niveau Signature</th>
                <th>Distance Détection</th>
                <th>Lock Missiles</th>
                <th>Furtivité</th>
                <th>Profil</th>
              </tr>
            </thead>
            <tbody>
              {SIG_DETECTION.map(s => (
                <tr key={s.niveau}>
                  <td>
                    <span className={clsx('badge', s.badge)}>{s.niveau}</span>
                  </td>
                  <td className="font-mono text-slate-300">{s.distance}</td>
                  <td className="font-mono text-slate-300">{s.lockMissile}</td>
                  <td className="text-slate-300">{s.furtivite}</td>
                  <td className="text-slate-500 text-xs">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profils de signature vaisseaux */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-space-400/20">
          <h2 className="section-title">Profils de Signature — Vaisseaux Exemples</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vaisseau</th>
                <th>IR</th>
                <th>EM</th>
                <th>CS</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredStealthShips.map(s => (
                <tr key={s.name}>
                  <td className="font-medium text-slate-200">{s.name}</td>
                  <td><SigBadge value={s.ir} /></td>
                  <td><SigBadge value={s.em} /></td>
                  <td><SigBadge value={s.cs} /></td>
                  <td className="text-slate-500 text-xs">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Build Stealth */}
      <div className="card p-6 space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          Guide Build Furtif Complet
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-purple-400">Composants Stealth Recommandés</div>
            <div className="space-y-2">
              {[
                { composant: 'Power Plant', reco: 'Juno Starwerk Stealth / Revenant', impact: 'EM minimale' },
                { composant: 'Coolers',     reco: 'Juno Starwerk Ice-Flush',          impact: 'IR minimale' },
                { composant: 'Armes',       reco: 'Balistiques (éviter laser)',        impact: 'IR réduite' },
                { composant: 'Boucliers',   reco: 'Couper en approche',               impact: 'EM réduite' },
                { composant: 'Quantum Drive',reco:'Couper QD après saut',             impact: 'EM réduite' },
              ].map(r => (
                <div key={r.composant} className="flex items-start gap-2 text-xs">
                  <span className="text-purple-400 flex-shrink-0 font-semibold w-24">{r.composant}</span>
                  <span className="text-slate-300 flex-1">{r.reco}</span>
                  <span className="badge badge-purple flex-shrink-0">{r.impact}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-purple-400">Vaisseaux à Capacité Stealth Native</div>
            <div className="space-y-2">
              {[
                { name: 'Eclipse (Aegis)',   desc: 'Bombardier furtif — meilleur stealth du jeu' },
                { name: 'Sabre (Aegis)',     desc: 'Chasseur — composants stealth de série' },
                { name: '315p (Origin)',     desc: 'Exploration — conception discrète' },
                { name: 'Mustang Beta (CR)', desc: 'Compact — petite CS naturelle' },
                { name: 'Razor (MISC)',      desc: 'Racer — profil très fin' },
              ].map(v => (
                <div key={v.name} className="flex items-start gap-2 text-xs">
                  <Rocket className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 font-medium">{v.name}</span>
                    <span className="text-slate-500 ml-1">— {v.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <InfoNote type="info">
          L'approche stealth optimale combine : Mode ECLIPSE + Stealth PP + Stealth Coolers + armes balistiques + boucliers coupés.
          Activer les boucliers fait exploser la signature EM — ne les activer qu'au dernier moment avant le combat.
        </InfoNote>
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 4 — BOUCLIERS
// ============================================================

function TabShields({ search = '' }) {
  const filteredShields = useMemo(() => {
    if (!search) return SHIELD_GENERATORS;
    const q = search.toLowerCase();
    return SHIELD_GENERATORS.filter(sg => sg.name.toLowerCase().includes(q) || sg.type.toLowerCase().includes(q) || sg.taille.toLowerCase().includes(q));
  }, [search]);
  return (
    <div className="space-y-8">

      {/* Mécaniques boucliers */}
      <div className="card p-6 space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Mécaniques de Boucliers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-2">
            <div className="text-sm font-semibold text-cyan-400">Face Bubbles</div>
            <p className="text-xs text-slate-400">
              Les boucliers sont divisés en 4 à 6 faces (avant, arrière, gauche, droite, haut, bas).
              Orienter le vaisseau pour présenter la face la plus intacte à l'ennemi.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-2">
            <div className="text-sm font-semibold text-green-400">Régénération</div>
            <p className="text-xs text-slate-400">
              La régénération se déclenche après un délai sans dégâts (<strong className="text-slate-300">regen delay</strong>).
              Seule la face endommagée se régénère. La surcharge (<strong className="text-slate-300">overcharge</strong>) accélère la regen mais augmente la signature EM.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-2">
            <div className="text-sm font-semibold text-purple-400">Bypass Distorsion</div>
            <p className="text-xs text-slate-400">
              Les armes de distorsion <strong className="text-slate-300">contournent les boucliers</strong> et s'attaquent directement aux composants électroniques.
              Un vaisseau distorsion peut couper vos systèmes même avec boucliers complets.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-300">Mécanique de Face Tanking</div>
          <div className="flex items-center gap-3 flex-wrap">
            {['Avant', 'Arrière', 'Gauche', 'Droite', 'Haut', 'Bas'].map((face, i) => (
              <div key={face} className="flex flex-col items-center gap-1">
                <div className={clsx(
                  'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold',
                  i === 0
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-space-700 border-space-500/40 text-slate-500'
                )}>
                  {face === 'Avant' ? '100%' : i === 1 ? '85%' : i === 2 ? '70%' : i === 3 ? '65%' : '90%'}
                </div>
                <span className="text-[10px] text-slate-500">{face}</span>
              </div>
            ))}
            <div className="text-xs text-slate-500 ml-2">← Exemple de répartition HP par face</div>
          </div>
        </div>
      </div>

      {/* Tableau Shield Generators */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-space-400/20">
          <h2 className="section-title flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Shield Generators — Comparatif
          </h2>
          <p className="text-sm text-slate-500 mt-1">HP face = HP d'une seule face du bouclier. Regen = HP régénérés par seconde par face.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Générateur</th>
                <th>Taille</th>
                <th>Type</th>
                <th>HP / Face</th>
                <th>Regen/s</th>
                <th>Délai Regen</th>
                <th>Cooldown</th>
                <th>Signature EM</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredShields.map(sg => (
                <tr key={sg.id}>
                  <td className="font-medium text-slate-200">{sg.name}</td>
                  <td><span className="badge badge-slate">{sg.taille}</span></td>
                  <td><TypeBadge type={sg.type} /></td>
                  <td className="text-cyan-400 font-mono">{sg.hpFace.toLocaleString()}</td>
                  <td className="text-green-400 font-mono">{sg.regenS}</td>
                  <td className="text-yellow-400 font-mono">{sg.regenDelay}s</td>
                  <td className="text-orange-400 font-mono">{sg.cooldown}s</td>
                  <td><SigBadge value={sg.sigEM} /></td>
                  <td className="text-slate-500 text-xs">{sg.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stratégies */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title">Stratégies de Combat avec Boucliers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AccordionItem title="Face Tanking" defaultOpen>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>Présenter toujours la même face au tir ennemi pour concentrer les dégâts sur une seule bulle.</p>
              <p>La face avant est généralement la plus solide. Voler vers l'ennemi en le gardant dans l'axe avant.</p>
              <p className="text-cyan-400 text-xs">Idéal pour : boucliers HP élevés (Flat), combat frontal, vaisseau lent.</p>
            </div>
          </AccordionItem>
          <AccordionItem title="Regen Sniping">
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>Tirer par rafales courtes puis se mettre à couvert pour laisser se régénérer une face avant de reprendre l'engagement.</p>
              <p>Exploiter le <strong className="text-slate-300">regen delay</strong> court des générateurs Staggered.</p>
              <p className="text-green-400 text-xs">Idéal pour : petits chasseurs agiles, hit-and-run, dogfight.</p>
            </div>
          </AccordionItem>
          <AccordionItem title="Bypass Distorsion">
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>Les armes de distorsion passent à travers les boucliers. Pour contrer : réduire la signature EM (moins d'EM = moins de dégâts distorsion).</p>
              <p>Un EMP ou rayon distorsion peut couper votre Power Plant — <strong className="text-slate-300">avoir un backup power</strong>.</p>
              <p className="text-purple-400 text-xs">Contre : réduire EM + blindage électronique + fuir la portée.</p>
            </div>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 5 — CALCULATEUR DE SURVIE
// ============================================================

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#0a1020',
  border: '1px solid #1e2e4a',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
};

function TabCalculator() {
  const [selectedShipId, setSelectedShipId] = useState('');
  const [dps, setDps] = useState(200);
  const [faceCount, setFaceCount] = useState(4);
  const [distributeEvenly, setDistributeEvenly] = useState(false);

  const ship = useMemo(() => SHIPS.find(s => s.id === selectedShipId), [selectedShipId]);

  // Paramètres du bouclier basés sur les données du vaisseau
  const shieldHp = ship?.specs?.shieldHp ?? 0;

  // On dérive des estimations réalistes depuis shieldHp
  const hpPerFace = useMemo(() => {
    if (!shieldHp) return 0;
    return Math.round(shieldHp / faceCount);
  }, [shieldHp, faceCount]);

  // Estimation regen/s basée sur le HP total (~3% du total / face / s = estimation réaliste)
  const regenPerSecond = useMemo(() => {
    if (!shieldHp) return 0;
    return Math.round((shieldHp * 0.03) / faceCount);
  }, [shieldHp, faceCount]);

  // Calcul du temps de survie
  const calcData = useMemo(() => {
    if (!shieldHp || dps <= 0) return [];

    const effectiveDps = distributeEvenly ? dps / faceCount : dps;
    const effectiveHp = distributeEvenly ? shieldHp : hpPerFace;
    const effectiveRegen = distributeEvenly ? regenPerSecond * faceCount : regenPerSecond;

    const netDps = effectiveDps - effectiveRegen;
    const maxTime = netDps > 0 ? Math.ceil(effectiveHp / netDps) + 5 : 30;

    const points = [];
    let hpCurrent = effectiveHp;
    let hpNoRegen = effectiveHp;

    for (let t = 0; t <= Math.min(maxTime, 60); t++) {
      hpCurrent = Math.max(0, hpCurrent - effectiveDps + effectiveRegen);
      hpNoRegen = Math.max(0, hpNoRegen - effectiveDps);
      points.push({
        temps: t,
        'Avec regen': hpCurrent,
        'Sans regen': hpNoRegen,
      });
      if (hpNoRegen <= 0 && hpCurrent <= 0) break;
    }
    return points;
  }, [shieldHp, dps, faceCount, distributeEvenly, hpPerFace, regenPerSecond]);

  const survieAvecRegen = useMemo(() => {
    const idx = calcData.findIndex(p => p['Avec regen'] <= 0);
    return idx === -1 ? '> 60s' : `${idx}s`;
  }, [calcData]);

  const vieSansRegen = useMemo(() => {
    const idx = calcData.findIndex(p => p['Sans regen'] <= 0);
    return idx === -1 ? '> 60s' : `${idx}s`;
  }, [calcData]);

  return (
    <div className="space-y-6">

      <div className="card p-5 space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          Calculateur de Survie Bouclier
        </h2>
        <p className="text-sm text-slate-400">
          Sélectionne un vaisseau et saisis le DPS ennemi pour visualiser combien de temps tes boucliers tiennent.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sélecteur vaisseau */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Vaisseau</label>
            <select
              className="select"
              value={selectedShipId}
              onChange={e => setSelectedShipId(e.target.value)}
            >
              <option value="">-- Choisir un vaisseau --</option>
              {SHIPS.filter(s => s.flyable && s.specs?.shieldHp > 0).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.manufacturer})</option>
              ))}
            </select>
          </div>

          {/* DPS entrant */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">DPS entrant (HP/s)</label>
            <input
              type="number"
              className="input"
              value={dps}
              min={10}
              max={5000}
              step={10}
              onChange={e => setDps(Number(e.target.value))}
            />
          </div>

          {/* Nombre de faces */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Nombre de faces</label>
            <select
              className="select"
              value={faceCount}
              onChange={e => setFaceCount(Number(e.target.value))}
            >
              <option value={2}>2 faces</option>
              <option value={4}>4 faces (standard)</option>
              <option value={6}>6 faces</option>
            </select>
          </div>

          {/* Mode distribution */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Distribution dégâts</label>
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={!distributeEvenly}
                  onChange={() => setDistributeEvenly(false)}
                  className="accent-cyan-500"
                />
                Face unique (face tanking)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={distributeEvenly}
                  onChange={() => setDistributeEvenly(true)}
                  className="accent-cyan-500"
                />
                Distribuée (toutes faces)
              </label>
            </div>
          </div>
        </div>

        {/* Stats bouclier du vaisseau sélectionné */}
        {ship && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="stat-card">
              <div className="stat-label">HP Bouclier Total</div>
              <div className="stat-value">{shieldHp.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">HP / Face</div>
              <div className="stat-value text-cyan-300">{hpPerFace.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Regen estimée / face / s</div>
              <div className="stat-value text-green-400">{regenPerSecond}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Taille</div>
              <div className="stat-value text-slate-300">{ship.size}</div>
            </div>
          </div>
        )}
      </div>

      {/* Résultats et graphique */}
      {ship && calcData.length > 0 && (
        <div className="card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="section-title">Résultats — {ship.name}</h3>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Survie avec regen</div>
                <div className="text-xl font-bold font-display text-green-400">{survieAvecRegen}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Survie sans regen</div>
                <div className="text-xl font-bold font-display text-red-400">{vieSansRegen}</div>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calcData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2e4a" />
                <XAxis
                  dataKey="temps"
                  label={{ value: 'Temps (s)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                />
                <Tooltip
                  contentStyle={CUSTOM_TOOLTIP_STYLE}
                  formatter={(value, name) => [value.toLocaleString() + ' HP', name]}
                  labelFormatter={label => `t = ${label}s`}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="Avec regen"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22c55e' }}
                />
                <Line
                  type="monotone"
                  dataKey="Sans regen"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 3"
                  activeDot={{ r: 4, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoNote type={survieAvecRegen === '> 60s' ? 'success' : 'warning'}>
              {survieAvecRegen === '> 60s'
                ? 'Avec regen active, le bouclier tient plus de 60 secondes face à ce DPS.'
                : `Le bouclier s'effondre en ${survieAvecRegen} même avec régénération — DPS trop élevé.`
              }
            </InfoNote>
            <InfoNote type="info">
              Estimation regen = ~3% HP total / face / s (valeur typique S1-S2). Varie selon le générateur équipé.
            </InfoNote>
          </div>
        </div>
      )}

      {!ship && (
        <div className="card p-10 flex flex-col items-center justify-center gap-3 text-center">
          <Shield className="w-12 h-12 text-slate-600" />
          <p className="text-slate-500">Sélectionne un vaisseau pour lancer le calculateur.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const TABS = [
  { key: 'energy',     label: 'Énergie',   icon: Zap,         shortLabel: 'Énergie' },
  { key: 'heat',       label: 'Chaleur',   icon: Thermometer, shortLabel: 'Chaleur' },
  { key: 'signatures', label: 'Signatures', icon: Eye,        shortLabel: 'Sig.' },
  { key: 'shields',    label: 'Boucliers', icon: Shield,      shortLabel: 'Boucliers' },
  { key: 'calculator', label: 'Calculateur', icon: Calculator, shortLabel: 'Calc.' },
];

export default function ShipSystems() {
  const [activeTab, setActiveTab] = useState('energy');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="page-title">Systèmes Vaisseau</h1>
            <p className="page-subtitle">Gestion de l'énergie, chaleur et signatures IR/EM/CS — Alpha 4.6</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un composant, type, taille..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* Onglets */}
      <div className="tabs overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'tab flex items-center gap-1.5 whitespace-nowrap',
                activeTab === tab.key ? 'tab-active' : ''
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      <div>
        {activeTab === 'energy'     && <TabEnergy search={search} />}
        {activeTab === 'heat'       && <TabHeat search={search} />}
        {activeTab === 'signatures' && <TabSignatures search={search} />}
        {activeTab === 'shields'    && <TabShields search={search} />}
        {activeTab === 'calculator' && <TabCalculator />}
      </div>
    </div>
  );
}
