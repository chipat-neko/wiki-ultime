import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Heart, AlertTriangle, Info, Zap, ChevronDown, ChevronUp,
  Activity, Pill, Ship, MapPin, BookOpen, Shield, Clock, Search, X,
} from 'lucide-react';

/* ─── Données ─── */

const BODY_ZONES = [
  {
    zone: 'Tête',
    icon: '🎭',
    color: 'border-danger-500/40',
    headerBg: 'bg-danger-900/30',
    t1: { effects: 'Saignement actif, vision floue/tremblante', treatment: 'Hemozal Bandage ou Medipen T1' },
    t2: { effects: 'Perte de conscience temporaire, étourdissements sévères', treatment: 'Medipen T2, soins immédiats requis' },
    t3: { effects: 'Mort instantanée', treatment: 'Aucun — éviter à tout prix' },
  },
  {
    zone: 'Thorax',
    icon: '🫁',
    color: 'border-warning-500/40',
    headerBg: 'bg-warning-900/20',
    t1: { effects: 'Saignement interne, essoufflement léger', treatment: 'Hemozal Medipen ou bandage compressif' },
    t2: { effects: 'Défaillance d\'organe partielle, toux sanguinolente, mobilité réduite', treatment: 'Medipen T2, lit médical Tier 2 minimum' },
    t3: { effects: 'Mort rapide par hémorragie interne', treatment: 'Stabilisation d\'urgence + lit T3' },
  },
  {
    zone: 'Bras Gauche',
    icon: '💪',
    color: 'border-blue-500/30',
    headerBg: 'bg-blue-900/20',
    t1: { effects: 'Tremblement de visée (précision -25%)', treatment: 'Hemozal Bandage, Demexatrine anti-douleur' },
    t2: { effects: 'Incapacité à tenir une arme à deux mains', treatment: 'Medipen T1-T2, repos court' },
    t3: { effects: 'Mort par perte de sang massive', treatment: 'Garrots d\'urgence + lit médical' },
  },
  {
    zone: 'Bras Droit',
    icon: '🤜',
    color: 'border-blue-500/30',
    headerBg: 'bg-blue-900/20',
    t1: { effects: 'Tremblement de visée, prise réduite', treatment: 'Hemozal Bandage, Demexatrine' },
    t2: { effects: 'Incapacité à tenir une arme principale', treatment: 'Medipen T1-T2' },
    t3: { effects: 'Mort par perte de sang', treatment: 'Intervention chirurgicale urgente' },
  },
  {
    zone: 'Jambe Gauche',
    icon: '🦵',
    color: 'border-purple-500/30',
    headerBg: 'bg-purple-900/20',
    t1: { effects: 'Boitement (-20% vitesse de déplacement)', treatment: 'Hemozal Bandage, Demexatrine' },
    t2: { effects: 'Impossibilité de courir ou de sauter', treatment: 'Medipen T2, attelle médicale' },
    t3: { effects: 'Mort par choc hémorragique', treatment: 'Garrot + lit médical' },
  },
  {
    zone: 'Jambe Droite',
    icon: '🦵',
    color: 'border-purple-500/30',
    headerBg: 'bg-purple-900/20',
    t1: { effects: 'Boitement, esquive difficile (-20% vitesse)', treatment: 'Hemozal Bandage, Demexatrine' },
    t2: { effects: 'Impossibilité de courir, marche seulement', treatment: 'Medipen T2, attelle médicale' },
    t3: { effects: 'Mort par choc hémorragique', treatment: 'Garrot + lit médical' },
  },
];

const MEDICATIONS = [
  {
    name: 'Hemozal Bandage',
    category: 'Premiers secours',
    categoryBadge: 'badge-green',
    usage: 'Application externe sur plaie',
    effect: 'Arrêt du saignement T1, légère régénération',
    duration: '5 min',
    whereGet: 'Medstores, stations médicales',
    note: 'Item le plus basique — toujours en avoir 5+',
  },
  {
    name: 'Hemozal Medipen',
    category: 'Injection T1',
    categoryBadge: 'badge-cyan',
    usage: 'Auto-injection ou sur cible',
    effect: 'Soins rapides T1, régénération HP accélérée',
    duration: '10 min',
    whereGet: 'Medstores, kiosques santé',
    note: 'Polyvalent — pour les combats rapprochés',
  },
  {
    name: 'Demexatrine',
    category: 'Anti-douleur',
    categoryBadge: 'badge-yellow',
    usage: 'Injection ou comprimé oral',
    effect: 'Réduit les pénalités de blessure (mobilité/visée), permet de continuer à combattre',
    duration: '8 min',
    whereGet: 'Pharmacies, avant-postes médicaux',
    note: 'Ne soigne pas — masque la douleur uniquement',
  },
  {
    name: 'Resurgera',
    category: 'Revitalisant',
    categoryBadge: 'badge-blue',
    usage: 'Injection intraveineuse',
    effect: 'Remonte les stats vitales (blood oxygen, pouls), stabilise le personnage en état critique',
    duration: '15 min',
    whereGet: 'Hôpitaux, vaisseaux médicaux',
    note: 'Indispensable pour stabiliser avant transport en lit médical',
  },
  {
    name: 'Sterimag',
    category: 'Antibiotique',
    categoryBadge: 'badge-slate',
    usage: 'Comprimé oral ou injection',
    effect: 'Traite les infections bactériennes et pathogènes (zones Pyro surtout)',
    duration: '30 min',
    whereGet: 'Hôpitaux, pharmacies',
    note: 'Inutile en combat standard — prévoir en explo/Pyro',
  },
  {
    name: 'OTC Medipen (Nerfed)',
    category: 'Version allégée',
    categoryBadge: 'badge-slate',
    usage: 'Auto-injection',
    effect: 'Soins légers, version OTC sans prescription',
    duration: '5 min',
    whereGet: 'Kiosques généraux, Rest Stops',
    note: 'Moins efficace que le Hemozal — usage de dépannage',
  },
  {
    name: 'Quantimed Pen',
    category: 'Soins avancés T2',
    categoryBadge: 'badge-purple',
    usage: 'Injection spécialisée',
    effect: 'Traite blessures T2, restaure fonction organe partielle, soins profonds',
    duration: '20 min',
    whereGet: 'Hôpitaux majeurs, ships médicaux',
    note: 'Nécessite formation médicale — très efficace en équipe',
  },
  {
    name: 'Stims (Stimulants)',
    category: 'Performance',
    categoryBadge: 'badge-red',
    usage: 'Injection rapide',
    effect: 'Boost temporaire vitesse, précision, endurance',
    duration: '3 min',
    whereGet: 'Marché noir, Grim HEX',
    note: 'Légal dans certaines juridictions — effets secondaires après',
  },
];

const MEDICAL_BEDS = [
  {
    tier: 'Tier 1',
    name: 'Triage / Premiers Secours',
    badge: 'badge-green',
    capabilities: ['Soins T1 (saignement, plaies légères)', 'Stabilisation d\'urgence', 'Injection médicaments basiques'],
    ships: ['Apollo Medivac (literie avant)', 'Cutlass Red (baie arrière)', 'Vaisseaux à baie T1 basique'],
    stations: ['Hôpitaux de Rest Stops', 'Avant-postes miniers équipés'],
    note: 'Suffisant pour 90% des combats PvE standard',
  },
  {
    tier: 'Tier 2',
    name: 'Chirurgie de Base',
    badge: 'badge-yellow',
    capabilities: ['Soins T1 + T2', 'Chirurgie légère', 'Traitement blessures membres', 'Oxygénothérapie'],
    ships: ['Cutlass Red (baie complète)', 'Carrack (baie médicale intégrée)', 'Hercules Starlifter (médical)'],
    stations: ['Hôpitaux orbitaux', 'Stations de niveau 2'],
    note: 'Standard pour les équipes d\'opérations longues',
  },
  {
    tier: 'Tier 3',
    name: 'Soins Complets / Résurrection',
    badge: 'badge-red',
    capabilities: ['Soins T1/T2/T3 complets', 'Chirurgie avancée', 'Résurrection complète', 'Traitement intégral'],
    ships: ['Apollo Medivac (bloc opératoire complet)', 'Javelin (hôpital embarqué — futur)'],
    stations: ['Clinique Tamor (Lorville)', 'New Babbage Medical Center', 'Orison Medical Hub', 'Area 18 Medical'],
    note: 'Nécessaire pour les blessures T3 non mortelles et résurrections',
  },
];

const MEDICAL_SHIPS = [
  {
    name: 'Apollo Medivac',
    manufacturer: 'RSI',
    badge: 'badge-cyan',
    bedTier: 'Tier 3 (complet)',
    crew: '2-4',
    role: 'Vaisseau médical dédié principal',
    strengths: ['Bloc opératoire T3 complet', '4 lits médicaux', 'Capacité résurrection', 'Médic cockpit avancé'],
    weaknesses: ['Lent et peu armé', 'Cible prioritaire en combat', 'Coût élevé'],
    bestFor: 'Operations de grande envergure, soutien de raid, PvP organisé',
  },
  {
    name: 'Cutlass Red',
    manufacturer: 'Drake Interplanetary',
    badge: 'badge-red',
    bedTier: 'Tier 2',
    crew: '1-2',
    role: 'Extraction et soins basiques',
    strengths: ['Agile et rapide', 'Économique', 'Facile à piloter seul', 'Bon pour extraction rapide'],
    weaknesses: ['Soins limités T2 max', 'Peu de lits (2)', 'Pas de résurrection T3'],
    bestFor: 'Extraction rapide en zone de combat, solo médic, missions courtes',
  },
  {
    name: 'Carrack',
    manufacturer: 'Anvil Aerospace',
    badge: 'badge-blue',
    bedTier: 'Tier 2',
    crew: '4-6',
    role: 'Exploration avec capacité médicale embarquée',
    strengths: ['Polyvalent', 'Autonome longue durée', 'Armé', 'Bay médicale intégrée'],
    weaknesses: ['Baie médicale non spécialisée', 'Prix très élevé', 'Grand crew requis'],
    bestFor: 'Expéditions longue distance avec support médical de base',
  },
];

const MEDICAL_STATIONS = [
  { name: 'Clinique Tamor', location: 'Lorville, Hurston', tier: 'T3', badge: 'badge-cyan' },
  { name: 'New Babbage Medical Center', location: 'New Babbage, microTech', tier: 'T3', badge: 'badge-cyan' },
  { name: 'Area 18 Medical Hub', location: 'Area 18, ArcCorp', tier: 'T3', badge: 'badge-cyan' },
  { name: 'Orison Medical Center', location: 'Orison, Crusader', tier: 'T3', badge: 'badge-cyan' },
  { name: 'GrimHEX Infirmary', location: 'Yela Asteroid Belt', tier: 'T1', badge: 'badge-green' },
  { name: 'Rest Stop Medical', location: 'Points de repos Stanton', tier: 'T1', badge: 'badge-green' },
  { name: 'Levski Medical Bay', location: 'Delamar, Nyx', tier: 'T2', badge: 'badge-yellow' },
];

const TIPS_MED = [
  { icon: Heart, color: 'text-danger-400', title: 'Toujours avoir des medpens', text: 'Minimum 3 Hemozal Bandages + 2 Hemozal Medipens sur soi en permanence. Le coût est négligeable comparé au risque de mort.' },
  { icon: Activity, color: 'text-success-400', title: 'Surveiller l\'indicateur HUD', text: 'L\'icône de santé dans le HUD montre quelle zone est blessée et son niveau. T1 = jaune, T2 = orange, T3 = rouge clignotant.' },
  { icon: Shield, color: 'text-cyan-400', title: 'Rôle médic en groupe', text: 'Dans un groupe de 4+, désignez un joueur "médic" avec Quantimed Pen + Resurgera. Il peut soigner les coéquipiers en combat.' },
  { icon: Ship, color: 'text-blue-400', title: 'Extraction priority', text: 'Si un coéquipier est en état critique (T3 imminent), l\'extraction vers un lit médical est prioritaire sur continuer le combat.' },
  { icon: Pill, color: 'text-warning-400', title: 'Demexatrine = push final', text: 'Si blessé mais objectif proche : injectez Demexatrine pour masquer les pénalités et finir la mission avant de soigner.' },
  { icon: MapPin, color: 'text-purple-400', title: 'Pyro : Sterimag obligatoire', text: 'Le système Pyro comporte des zones avec pathogènes. Emportez au minimum 4 Sterimag pour une expédition de 2+ heures.' },
];

/* ─── Composants ─── */

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

function BedTierCard({ bed }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs',
            bed.tier === 'Tier 1' ? 'bg-success-500/20 text-success-400' :
            bed.tier === 'Tier 2' ? 'bg-warning-500/20 text-warning-400' :
            'bg-danger-500/20 text-danger-400'
          )}>
            {bed.tier}
          </div>
          <div>
            <div className="font-bold text-slate-200">{bed.name}</div>
            <span className={`badge ${bed.badge} mt-0.5`}>{bed.tier}</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 space-y-4 animate-fade-in">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Capacités</div>
            <ul className="space-y-1">
              {bed.capabilities.map((cap, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Vaisseaux disponibles</div>
              <ul className="space-y-1">
                {bed.ships.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Ship className="w-3 h-3 text-blue-400" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Stations disponibles</div>
              <ul className="space-y-1">
                {bed.stations.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-cyan-400" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-700/60 border border-space-400/20 flex gap-2">
            <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 italic">{bed.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ShipCard({ ship }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-slate-200">{ship.name}</h3>
          <div className="text-xs text-slate-500 mt-0.5">{ship.manufacturer}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`badge ${ship.badge}`}>{ship.bedTier}</span>
          <span className="badge badge-slate text-xs">Crew {ship.crew}</span>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-3">{ship.role}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Points forts</div>
          <ul className="space-y-1">
            {ship.strengths.map((s, i) => (
              <li key={i} className="text-xs text-success-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-success-400 flex-shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Limites</div>
          <ul className="space-y-1">
            {ship.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-danger-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-danger-400 flex-shrink-0" /> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-space-400/20">
        <span className="text-xs text-slate-500">Meilleur pour : </span>
        <span className="text-xs text-slate-300">{ship.bestFor}</span>
      </div>
    </div>
  );
}

/* ─── Page principale ─── */

export default function MedicalMechanics() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const match = (/** @type {string[]} */ ...fields) => !q || fields.some(f => f && f.toLowerCase().includes(q));

  const filteredZones = BODY_ZONES.filter(z => match(z.zone, z.t1.effects, z.t1.treatment, z.t2.effects, z.t2.treatment, z.t3.effects, z.t3.treatment));
  const filteredMeds = MEDICATIONS.filter(m => match(m.name, m.category, m.effect, m.usage, m.whereGet, m.note));
  const filteredBeds = MEDICAL_BEDS.filter(b => match(b.tier, b.name, b.note, ...b.capabilities, ...b.ships, ...b.stations));
  const filteredShips = MEDICAL_SHIPS.filter(s => match(s.name, s.manufacturer, s.role, s.bestFor, ...s.strengths, ...s.weaknesses));
  const filteredStations = MEDICAL_STATIONS.filter(s => match(s.name, s.location, s.tier));
  const filteredTips = TIPS_MED.filter(t => match(t.title, t.text));

  const NAV_ITEMS = [
    { id: 'intro', label: 'Introduction' },
    { id: 'blessures', label: 'Blessures' },
    { id: 'medicaments', label: 'Médicaments' },
    { id: 'lits', label: 'Lits Médicaux' },
    { id: 'vaisseaux', label: 'Vaisseaux' },
    { id: 'astuces', label: 'Astuces' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Heart className="w-7 h-7 text-danger-400" />
            Mécanique Médicale
          </h1>
          <span className="badge badge-red">Alpha 4.6</span>
          <span className="badge badge-green">Soins & Survie</span>
        </div>
        <p className="page-subtitle mt-1">
          Guide complet du système médical — blessures par zone, médicaments, lits médicaux Tier 1-3, vaisseaux et stations
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
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une zone, un médicament, un vaisseau médical..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* Section 1 : Introduction */}
      <SectionAnchor id="intro" />
      <div className="card-glow p-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-cyan-400" />
          Introduction au Système Médical
        </h2>
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            Star Citizen intègre l'un des systèmes médicaux les plus détaillés du genre. Chaque partie du corps peut être blessée indépendamment, avec des conséquences différentes sur le gameplay. Contrairement à d'autres jeux, <strong className="text-cyan-400">mourir n'est pas toujours la fin</strong> — un coéquipier médic peut vous sauver avant que votre état se dégrade au-delà du seuil de récupération.
          </p>
          <p>
            Le système repose sur trois piliers : les <strong className="text-warning-400">blessures par zone</strong> (6 zones corporelles avec 3 tiers chacune), les <strong className="text-success-400">médicaments</strong> (bandages, medpens, spécialités), et les <strong className="text-danger-400">lits médicaux</strong> (Tier 1 à Tier 3 selon le vaisseau ou la station).
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Zones corporelles', value: '6', color: 'text-danger-400' },
            { label: 'Tiers de blessure', value: '3', color: 'text-warning-400' },
            { label: 'Médicaments', value: '8', color: 'text-success-400' },
            { label: 'Tiers de lit', value: '3', color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="bg-space-700/50 rounded-lg p-3 text-center">
              <div className={clsx('text-2xl font-bold font-display', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 : Blessures */}
      <SectionAnchor id="blessures" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-danger-400" />
          Système de Blessures par Zone
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Chaque zone peut être blessée indépendamment. Les tiers (T1/T2/T3) représentent la gravité — T3 entraîne la mort si non traité immédiatement.
        </p>

        {/* Légende des tiers */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-yellow">T1 — Blessure légère</span>
          <span className="badge badge-red">T2 — Blessure grave</span>
          <span className="badge badge-purple">T3 — Critique / Mortel</span>
        </div>

        {/* Tableau synthèse */}
        <div className="card overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>T1 — Effets</th>
                  <th>T2 — Effets</th>
                  <th>T3 — Effets</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{zone.icon}</span>
                        <span className="font-medium text-slate-200">{zone.zone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-warning-300">{zone.t1.effects}</div>
                      <div className="text-xs text-slate-500 mt-0.5">→ {zone.t1.treatment}</div>
                    </td>
                    <td>
                      <div className="text-xs text-danger-300">{zone.t2.effects}</div>
                      <div className="text-xs text-slate-500 mt-0.5">→ {zone.t2.treatment}</div>
                    </td>
                    <td>
                      <div className="text-xs text-purple-300 font-medium">{zone.t3.effects}</div>
                      <div className="text-xs text-slate-500 mt-0.5">→ {zone.t3.treatment}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note */}
        <div className="p-4 rounded-lg bg-space-700/40 border border-danger-500/20 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            <strong className="text-danger-400">Blessures T3 :</strong> Une blessure T3 n'est pas forcément immédiatement mortelle — vous avez une fenêtre de survie très courte (quelques secondes à quelques minutes selon la zone). Un coéquipier avec Resurgera peut vous stabiliser pour vous transporter vers un lit médical.
          </p>
        </div>
      </div>

      {/* Section 3 : Médicaments */}
      <SectionAnchor id="medicaments" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-success-400" />
          Médicaments et Traitements
        </h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Médicament</th>
                  <th>Catégorie</th>
                  <th>Utilisation</th>
                  <th>Effets</th>
                  <th>Durée</th>
                  <th>Obtention</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((med, i) => (
                  <tr key={i}>
                    <td>
                      <div className="font-medium text-slate-200">{med.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 italic">{med.note}</div>
                    </td>
                    <td>
                      <span className={`badge ${med.categoryBadge}`}>{med.category}</span>
                    </td>
                    <td className="text-xs text-slate-400">{med.usage}</td>
                    <td className="text-xs text-slate-300 max-w-xs">{med.effect}</td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" /> {med.duration}
                      </div>
                    </td>
                    <td className="text-xs text-slate-400">{med.whereGet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 4 : Lits médicaux */}
      <SectionAnchor id="lits" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gold-400" />
          Lits Médicaux — Tiers 1, 2 et 3
        </h2>
        <div className="space-y-3">
          {filteredBeds.map((bed, i) => (
            <BedTierCard key={i} bed={bed} />
          ))}
        </div>
      </div>

      {/* Section 5 : Vaisseaux médicaux */}
      <SectionAnchor id="vaisseaux" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Ship className="w-5 h-5 text-blue-400" />
          Vaisseaux Médicaux
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {filteredShips.map((ship, i) => (
            <ShipCard key={i} ship={ship} />
          ))}
        </div>

        {/* Stations */}
        <h3 className="text-base font-semibold text-slate-300 flex items-center gap-2 mb-3 mt-6">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Stations avec Hôpital
        </h3>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hôpital / Clinique</th>
                  <th>Localisation</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map((s, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-200">{s.name}</td>
                    <td className="text-slate-400 text-xs">{s.location}</td>
                    <td><span className={`badge ${s.badge}`}>{s.tier}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 6 : Astuces */}
      <SectionAnchor id="astuces" />
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-gold-400" />
          Astuces & Conseils
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
          <button onClick={() => navigate('/crimestat')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            CrimeStat
          </button>
          <button onClick={() => navigate('/bounty-hunting')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Chasse aux Primes
          </button>
          <button onClick={() => navigate('/guides')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Tous les Guides
          </button>
        </div>
      </div>
    </div>
  );
}
