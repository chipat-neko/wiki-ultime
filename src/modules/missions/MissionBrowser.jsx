import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  SAMPLE_MISSIONS, MISSION_TYPES_DATA, MISSION_FACTIONS, MISSION_CATEGORIES,
} from '../../datasets/missions.js';
import { formatCredits, formatRelativeTime } from '../../utils/formatters.js';
import { useAppActions } from '../../core/StateManager.jsx';
import { loadStack, saveStack } from './MissionStacking.jsx';
import clsx from 'clsx';
import {
  Search, Filter, X, ChevronDown, ChevronUp,
  Target, Package, Gem, Compass, Shield, AlertTriangle,
  Clock, Globe, Crosshair, Layers, Grid3x3, List, RefreshCw, Zap, Star,
  CheckCircle, XCircle, AlertCircle, Info, Users, MapPin, Banknote,
  Rocket, Swords, Wrench, ChevronRight, ShieldCheck, ShieldOff, Plus,
} from 'lucide-react';

// ── Type metadata (all typeIds in SAMPLE_MISSIONS) ─────────────────────────
const TYPE_META = {
  'delivery-standard':      { label: 'Livraison Standard',        category: 'transport'   },
  'delivery-priority':      { label: 'Livraison Prioritaire',     category: 'transport'   },
  'delivery-illegal':       { label: 'Livraison Illégale',        category: 'criminel'    },
  'cargo-hauling':          { label: 'Transport de Fret',         category: 'transport'   },
  'cargo-bulk':             { label: 'Fret en Vrac',              category: 'transport'   },
  'cargo-run-pyro':         { label: 'Cargo Run Pyro',            category: 'transport'   },
  'agricultural-transport': { label: 'Transport Agricole',        category: 'transport'   },
  'courier-quantum':        { label: 'Courrier Quantique',        category: 'transport'   },
  'vip-transport':          { label: 'Transport VIP',             category: 'service'     },
  'prisoner-transport':     { label: 'Transport Prisonnier',      category: 'service'     },
  'bounty-lawful':          { label: 'Prime Légale',              category: 'combat'      },
  'bounty-illegal':         { label: 'Prime Illégale',            category: 'criminel'    },
  'bounty-t1':              { label: 'Prime T1 — Local',          category: 'combat'      },
  'bounty-t2':              { label: 'Prime T2 — Régional',       category: 'combat'      },
  'bounty-t3':              { label: 'Prime T3 — Système',        category: 'combat'      },
  'bounty-t4':              { label: 'Prime T4 — Priorité',       category: 'combat'      },
  'bounty-t5-player':       { label: 'Prime T5 — Joueur',         category: 'combat'      },
  'bounty-vehicle':         { label: 'Prime Véhicule',            category: 'combat'      },
  'pirate-clearing':        { label: 'Neutralisation Pirates',    category: 'combat'      },
  'patrol-escort':          { label: 'Escorte / Patrouille',      category: 'combat'      },
  'escort-heavy':           { label: 'Escorte Renforcée',         category: 'combat'      },
  'defense-outpost':        { label: "Défense d'Avant-Poste",     category: 'combat'      },
  'assassination':          { label: 'Assassinat',                category: 'criminel'    },
  'mercenary-contract':     { label: 'Contrat Mercenaire',        category: 'combat'      },
  'security-contract':      { label: 'Sécurité',                  category: 'service'     },
  'contested-zone':         { label: 'Zone Contestée',            category: 'combat',    event: true },
  'station-siege':          { label: 'Siège de Station',          category: 'combat',    event: true },
  'ninetails-lockdown':     { label: 'Blocus Nine Tails',         category: 'combat',    event: true },
  'mining-mission':         { label: 'Mission de Minage',         category: 'industrie'   },
  'mining-hazardous':       { label: 'Minage Dangereux',          category: 'industrie'   },
  'surface-mining':         { label: 'Minage en Surface',         category: 'industrie'   },
  'salvage-mission':        { label: "Récupération d'Épave",      category: 'industrie'   },
  'salvage-classified':     { label: 'Récupération Classifiée',   category: 'service'     },
  'hull-scraping':          { label: 'Décapage de Coque',         category: 'industrie'   },
  'fuel-collection':        { label: 'Collecte Carburant',        category: 'industrie'   },
  'survey-mission':         { label: 'Reconnaissance / Scan',     category: 'exploration' },
  'data-run':               { label: 'Extraction de Données',     category: 'exploration' },
  'exploration-pyro':       { label: 'Exploration Pyro',          category: 'exploration' },
  'derelict-exploration':   { label: "Exploration d'Épave",       category: 'exploration' },
  'jump-point-survey':      { label: 'Reconnaissance JP',         category: 'exploration' },
  'probe-deployment':       { label: 'Déploiement Sondes',        category: 'exploration' },
  'xenobiology':            { label: 'Xénobiologie',              category: 'exploration' },
  'alien-artifact':         { label: 'Artefact Alien',            category: 'exploration', event: true },
  'underground-facility':   { label: 'Facilité Souterraine',      category: 'exploration' },
  'repair-mission':         { label: 'Réparation',                category: 'service'     },
  'refuel-mission':         { label: 'Ravitaillement',            category: 'service'     },
  'medical-evacuation':     { label: 'Évacuation Médicale',       category: 'service'     },
  'medical-research':       { label: 'Recherche Médicale',        category: 'service'     },
  'investigation':          { label: 'Investigation',             category: 'service'     },
  'nyx-engineering-repair': { label: 'Réparation Ingénierie',     category: 'service'     },
  'search-rescue':          { label: 'Recherche & Sauvetage',     category: 'service'     },
  'icc-probe-defense':      { label: 'Défense Sonde ICC',         category: 'service',   event: true },
  'distress-signal':        { label: 'Signal de Détresse',        category: 'service'     },
  'smuggling':              { label: 'Contrebande',               category: 'criminel'    },
  'espionage':              { label: 'Espionnage',                category: 'criminel'    },
  'heist':                  { label: 'Braquage',                  category: 'criminel'    },
  'piracy':                 { label: 'Piraterie',                 category: 'criminel'    },
  'prison-break':           { label: 'Évasion de Prison',         category: 'criminel'    },
  'drug-running-slam':      { label: 'Run Slam (Drogue)',          category: 'criminel'    },
  'drug-running-widow':     { label: 'Run Widow (Drogue)',         category: 'criminel'    },
  'cargo-hijacking':        { label: 'Détournement Cargo',        category: 'criminel'    },
  'prisoner-exchange':      { label: 'Échange de Prisonnier',     category: 'criminel'    },
  'nyx-peoples-alliance-contract': { label: 'Alliance Aid (Nyx)', category: 'service'     },
  'xenothreat-event':       { label: 'Événement XenoThreat',      category: 'combat',    event: true },
  // ── typeIds Nyx / Onyx / ASD (manquants — affichaient l'id brut) ──────────
  'nyx-levski-supply':      { label: 'Ravitaillement Levski',       category: 'transport'   },
  'nyx-data-retrieval':     { label: 'Récupération Données Nyx',    category: 'exploration' },
  'nyx-bounty-hunt':        { label: 'Prime — Glaciem Ring',         category: 'combat'      },
  'onyx-investigation':     { label: 'Enquête Onyx Facilities',      category: 'service'     },
  'asd-research-recovery':  { label: 'Récupération ASD Pyro',        category: 'industrie'   },
};

// ── Shareable types (missions partageable en groupe) ───────────────────────
const SHAREABLE_IDS = new Set([
  ...MISSION_TYPES_DATA.filter(m => m.stackable).map(m => m.id),
  'delivery-standard', 'delivery-priority', 'bounty-lawful',
  'bounty-t1', 'bounty-t2', 'bounty-t3', 'pirate-clearing',
  'patrol-escort', 'salvage-mission', 'repair-mission',
  'refuel-mission', 'survey-mission', 'mining-mission', 'cargo-run-pyro',
  'medical-evacuation', 'search-rescue', 'distress-signal',
]);

// ── System detection from location ────────────────────────────────────────
const PYRO_KW = ['pyro', 'ruin-station', 'checkmate', 'nuen', 'bloom', 'adir', 'orinth', 'vigil'];
const NYX_KW  = ['nyx', 'levski', 'onyx', 'glaciem', 'nyx-'];

function getSystem(m) {
  const loc = (m.location || m.from || '').toLowerCase();
  if (PYRO_KW.some(k => loc === k || loc.startsWith(k + '-') || loc.includes(k))) return 'Pyro';
  if (NYX_KW.some(k => loc === k || loc.startsWith(k) || loc.includes(k))) return 'Nyx';
  return 'Stanton';
}

// ── UI constants ───────────────────────────────────────────────────────────
const PAYOUT_RANGES = [
  { label: 'Tous',          min: 0,      max: Infinity },
  { label: '< 25 000 UEC', min: 0,      max: 25000    },
  { label: '25K – 100K',   min: 25000,  max: 100000   },
  { label: '100K – 500K',  min: 100000, max: 500000   },
  { label: '500K+',        min: 500000, max: Infinity  },
];

const SORT_OPTIONS = [
  { value: 'payout-desc', label: 'Récompense ↓' },
  { value: 'payout-asc',  label: 'Récompense ↑' },
  { value: 'diff-desc',   label: 'Difficulté ↓' },
  { value: 'time-asc',    label: 'Durée ↑'       },
  { value: 'name-asc',    label: 'Nom A→Z'       },
];

const DIFF_ORDER  = { Facile: 1, Moyen: 2, Difficile: 3, Extrême: 4 };
const DIFF_COLORS = { Facile: 'badge-green', Moyen: 'badge-yellow', Difficile: 'badge-red', Extrême: 'badge-red' };

const SYS_COLORS  = { Stanton: 'text-blue-400', Pyro: 'text-orange-400', Nyx: 'text-purple-400' };
const SYS_BG      = { Stanton: 'bg-blue-500/10 text-blue-400', Pyro: 'bg-orange-500/10 text-orange-400', Nyx: 'bg-purple-500/10 text-purple-400' };

const CATEGORY_ICONS = {
  combat:      Target,
  transport:   Package,
  industrie:   Gem,
  exploration: Compass,
  service:     Shield,
  criminel:    AlertTriangle,
};

const PAGE_SIZE = 24;

// ── Enrich all missions once at module load ────────────────────────────────
const ENRICHED = SAMPLE_MISSIONS.map(m => {
  const meta = TYPE_META[m.typeId] || { label: m.typeId || 'Inconnu', category: 'transport' };
  return {
    ...m,
    _system:    getSystem(m),
    _category:  meta.category,
    _typeLabel: meta.label,
    _isEvent:   Boolean(meta.event),
    _shareable: SHAREABLE_IDS.has(m.typeId),
    _available: !m.expires || m.expires > Date.now(),
  };
});

// ── Faction lookup ─────────────────────────────────────────────────────────
const FACTION_MAP = Object.fromEntries(MISSION_FACTIONS.map(f => [f.id, f]));

// ── Type data lookup (objectives, risks, tips, requiredShip…) ─────────────
const TYPE_DATA_MAP = Object.fromEntries(MISSION_TYPES_DATA.map(t => [t.id, t]));

// ── Unique type options (sorted) ───────────────────────────────────────────
const TYPE_OPTIONS = Object.entries(TYPE_META)
  .sort((a, b) => a[1].label.localeCompare(b[1].label, 'fr'));

// ── Helpers ────────────────────────────────────────────────────────────────
function locLabel(m) {
  if (m.from && m.to) return `${m.from} → ${m.to}`;
  if (m.location)     return m.location;
  return '—';
}

function shipReqs(req) {
  if (!req) return null;
  const parts = [];
  if (req.minCargo)  parts.push(`Cargo ≥ ${req.minCargo} SCU`);
  if (req.minCrew && req.minCrew > 1) parts.push(`Équipage ≥ ${req.minCrew}`);
  if (req.maxCrew === 1) parts.push('Solo possible');
  if (req.combat)    parts.push('Combat requis');
  if (req.salvage)   parts.push('Équipement Salvage');
  if (req.medical)   parts.push('Vaisseau médical');
  return parts.length ? parts : null;
}

// ── Per-category theme config (full hardcoded classes for Tailwind) ─────────
const CAT_THEME = {
  combat:      { text: 'text-red-400',    heroBg: 'bg-gradient-to-br from-red-950/80 via-space-900 to-space-900',    iconBg: 'bg-red-500/15 border-red-500/25',    strip: 'bg-red-500/8',   accent: 'text-red-400',    label: 'Combat'      },
  transport:   { text: 'text-cyan-400',   heroBg: 'bg-gradient-to-br from-cyan-950/80 via-space-900 to-space-900',   iconBg: 'bg-cyan-500/15 border-cyan-500/25',   strip: 'bg-cyan-500/8',  accent: 'text-cyan-400',   label: 'Transport'   },
  industrie:   { text: 'text-amber-400',  heroBg: 'bg-gradient-to-br from-amber-950/80 via-space-900 to-space-900',  iconBg: 'bg-amber-500/15 border-amber-500/25', strip: 'bg-amber-500/8', accent: 'text-amber-400',  label: 'Industrie'   },
  exploration: { text: 'text-purple-400', heroBg: 'bg-gradient-to-br from-purple-950/80 via-space-900 to-space-900', iconBg: 'bg-purple-500/15 border-purple-500/25',strip: 'bg-purple-500/8',accent: 'text-purple-400', label: 'Exploration' },
  service:     { text: 'text-blue-400',   heroBg: 'bg-gradient-to-br from-blue-950/80 via-space-900 to-space-900',   iconBg: 'bg-blue-500/15 border-blue-500/25',   strip: 'bg-blue-500/8',  accent: 'text-blue-400',   label: 'Service'     },
  criminel:    { text: 'text-orange-400', heroBg: 'bg-gradient-to-br from-orange-950/80 via-space-900 to-space-900', iconBg: 'bg-orange-500/15 border-orange-500/25',strip: 'bg-orange-500/8',accent: 'text-orange-400', label: 'Criminel'    },
};

// ── Stack helpers (shared with MissionStacking) ────────────────────────────
function getMidPayout(mission) {
  const td = TYPE_DATA_MAP[mission.typeId];
  if (td?.payout?.min !== undefined) {
    return Math.round((td.payout.min + td.payout.max) / 2);
  }
  return mission.payout || 50000;
}

// ══════════════════════════════════════════════════════════════════════════
// ── MissionDetailModal ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
function MissionDetailModal({ mission, clickY, onClose, onAddToStack }) {
  const theme    = CAT_THEME[mission._category] || CAT_THEME.transport;

  // Position modal at the click Y, clamped so it never overflows
  const vh         = typeof window !== 'undefined' ? window.innerHeight : 800;
  const MARGIN     = 12;
  const desiredTop = Math.max(MARGIN, clickY - 8);  // 8px au-dessus du clic
  const maxH       = vh - desiredTop - MARGIN;
  // Si trop peu d'espace en dessous, faire remonter la modale
  const MIN_H      = 400;
  const topPos     = maxH < MIN_H ? Math.max(MARGIN, vh - MIN_H - MARGIN) : desiredTop;
  const modalMaxH  = vh - topPos - MARGIN;
  const Icon     = CATEGORY_ICONS[mission._category] || Target;
  const faction  = FACTION_MAP[mission.faction];
  const typeData = TYPE_DATA_MAP[mission.typeId];
  const reqs     = shipReqs(typeData?.requiredShip);

  return createPortal(
    <>
      {/* Backdrop — element fixed indépendant */}
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modale — fixed directement sur la viewport, au niveau Y du clic */}
      <div
        style={{
          position: 'fixed',
          top: topPos,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '48rem',
          maxHeight: modalMaxH,
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
        className="bg-space-900 rounded-2xl border border-space-400/20 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div className={clsx('relative px-7 pt-7 pb-6 flex-shrink-0', theme.heroBg)}>
          {/* Subtle top border accent */}
          <div className={clsx('absolute inset-x-0 top-0 h-0.5', {
            'bg-gradient-to-r from-transparent via-red-500/60 to-transparent':    mission._category === 'combat',
            'bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent':   mission._category === 'transport',
            'bg-gradient-to-r from-transparent via-amber-500/60 to-transparent':  mission._category === 'industrie',
            'bg-gradient-to-r from-transparent via-purple-500/60 to-transparent': mission._category === 'exploration',
            'bg-gradient-to-r from-transparent via-blue-500/60 to-transparent':   mission._category === 'service',
            'bg-gradient-to-r from-transparent via-orange-500/60 to-transparent': mission._category === 'criminel',
          })} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-space-700/60 hover:bg-space-600/80 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-5 pr-10">
            {/* Category icon */}
            <div className={clsx('p-4 rounded-2xl border flex-shrink-0', theme.iconBg)}>
              <Icon className={clsx('w-7 h-7', theme.text)} />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={clsx('text-xs font-bold uppercase tracking-widest', theme.text)}>
                  {theme.label}
                </span>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-500 truncate">{mission._typeLabel}</span>
                {typeData?.patch && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-600">Alpha {typeData.patch}</span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{mission.name}</h2>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className={clsx('px-2.5 py-0.5 rounded-md text-xs font-semibold', SYS_BG[mission._system])}>
                  <Globe className="w-3 h-3 inline mr-1 -mt-px" />{mission._system}
                </span>
                <span className={clsx('badge', DIFF_COLORS[mission.difficulty] || 'badge-slate')}>
                  {mission.difficulty}
                </span>
                {mission.legal
                  ? <span className="badge badge-green"><ShieldCheck className="w-3 h-3 inline mr-1 -mt-px" />Légal</span>
                  : <span className="badge badge-red"><ShieldOff className="w-3 h-3 inline mr-1 -mt-px" />Illégal</span>
                }
                {mission._shareable && (
                  <span className="badge badge-cyan"><Layers className="w-3 h-3 inline mr-1 -mt-px" />Partageable</span>
                )}
                {mission._isEvent && (
                  <span className="badge badge-purple"><Star className="w-3 h-3 inline mr-1 -mt-px" />Événement</span>
                )}
                {typeData?.stackable && (
                  <span className="badge badge-slate">Cumulable</span>
                )}
                {!mission._available && (
                  <span className="badge badge-red"><XCircle className="w-3 h-3 inline mr-1 -mt-px" />Expirée</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ───────────────────────────────────────────────── */}
        <div className={clsx('grid grid-cols-4 border-y border-space-400/20 divide-x divide-space-400/15 flex-shrink-0', theme.strip)}>
          {[
            {
              icon: Banknote,
              label: 'Récompense',
              value: formatCredits(mission.payout, true),
              sub: typeData?.payout ? `${formatCredits(typeData.payout.min, true)} – ${formatCredits(typeData.payout.max, true)}` : null,
              valueClass: 'text-success-400 text-lg font-bold font-display',
            },
            {
              icon: Clock,
              label: 'Durée',
              value: `${mission.estimatedTime || '?'} min`,
              sub: mission.timeLimit ? `⚠ Limite : ${mission.timeLimit} min` : null,
              valueClass: 'text-slate-200 text-lg font-bold font-display',
            },
            {
              icon: Star,
              label: 'Réputation',
              value: typeData?.reputation ?? 0,
              sub: (typeData?.reputation > 0) ? 'rang requis' : 'Aucune',
              valueClass: 'text-slate-200 text-lg font-bold font-display',
            },
            {
              icon: Users,
              label: 'Faction',
              value: faction?.label || '—',
              sub: (faction?.minReputation > 0) ? `rép. ≥ ${faction.minReputation}` : (faction?.legal ? 'Légale' : 'Illégale'),
              valueClass: clsx('text-base font-semibold truncate', faction?.legal ? 'text-blue-400' : 'text-red-400'),
            },
          ].map(({ icon: StatIcon, label, value, sub, valueClass }) => (
            <div key={label} className="px-3 py-3 text-center min-w-0">
              <div className="flex items-center justify-center gap-1 mb-1">
                <StatIcon className="w-3 h-3 text-slate-600" />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
              <div className={clsx(valueClass, 'leading-tight')}>{value}</div>
              {sub && <div className="text-xs text-slate-600 mt-0.5 truncate">{sub}</div>}
            </div>
          ))}
        </div>

        {/* ── SCROLLABLE BODY ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-space-400/15">

            {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
            <div className="p-6 space-y-5">

              {/* Description */}
              <div>
                <SectionTitle icon={Info} label="Description" />
                <p className="text-sm text-slate-300 leading-relaxed">{mission.description}</p>
                {typeData?.description && typeData.description !== mission.description && (
                  <p className="text-sm text-slate-500 leading-relaxed mt-2 border-l-2 border-space-400/30 pl-3 italic">
                    {typeData.description}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 rounded-xl bg-space-800/50 border border-space-400/15 p-4">
                {mission.giver && (
                  <InfoRow icon={Crosshair} label="Donneur" value={mission.giver} />
                )}
                {(mission.from || mission.to || mission.location) && (
                  <InfoRow icon={MapPin} label="Lieu"
                    value={<span className="font-mono text-xs bg-space-700/60 px-2 py-0.5 rounded">{locLabel(mission)}</span>}
                  />
                )}
                {mission.expires && (
                  <InfoRow icon={Clock} label="Expiration"
                    value={
                      <span className={mission._available ? 'text-slate-400' : 'text-danger-400'}>
                        {mission._available ? formatRelativeTime(mission.expires) : 'Expirée'}
                      </span>
                    }
                  />
                )}
                {typeData?.factions?.length > 0 && (
                  <InfoRow icon={Swords} label="Factions"
                    value={
                      <div className="flex flex-wrap gap-1">
                        {typeData.factions.slice(0, 4).map(fid => {
                          const f = FACTION_MAP[fid];
                          return (
                            <span key={fid} className={clsx(
                              'text-xs px-1.5 py-0.5 rounded',
                              f?.legal ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'
                            )}>
                              {f?.label || fid}
                            </span>
                          );
                        })}
                        {typeData.factions.length > 4 && (
                          <span className="text-xs text-slate-600">+{typeData.factions.length - 4}</span>
                        )}
                      </div>
                    }
                  />
                )}
                {typeData?.givers?.length > 0 && (
                  <InfoRow icon={Users} label="Sources"
                    value={
                      <span className="text-slate-400 text-xs">{typeData.givers.join(' · ')}</span>
                    }
                  />
                )}
              </div>

              {/* Required ship */}
              {reqs && (
                <div>
                  <SectionTitle icon={Rocket} label="Vaisseau requis" />
                  <div className="flex flex-wrap gap-2">
                    {reqs.map(r => (
                      <span key={r} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-space-800 text-slate-300 border border-space-400/20 font-medium">
                        <Rocket className="w-3 h-3 text-slate-500" />{r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
            <div className="p-6 space-y-5">

              {/* Objectives */}
              {typeData?.objectives?.length > 0 && (
                <div>
                  <SectionTitle icon={CheckCircle} label="Objectifs" iconClass="text-success-400" />
                  <ol className="space-y-2">
                    {typeData.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-success-500/15 border border-success-500/25 text-success-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-300 leading-snug">{obj}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Risks */}
              {typeData?.risks?.length > 0 && (
                <div>
                  <SectionTitle icon={AlertCircle} label="Risques" iconClass="text-amber-400" />
                  <ul className="space-y-2">
                    {typeData.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                        </div>
                        <span className="text-sm text-slate-400 leading-snug">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tip */}
              {typeData?.tips && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Info className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Conseil du pilote</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{typeData.tips}"</p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-space-400/20 bg-space-900/80 backdrop-blur px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-600 truncate">
            ID : <span className="font-mono">{mission.id}</span>
          </span>
          <div className="flex items-center gap-2">
            {onAddToStack && (
              <button
                onClick={() => { onAddToStack(mission); onClose(); }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-success-500/15 text-success-400 border border-success-500/30 hover:bg-success-500/25 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                Ajouter à l'empileur
              </button>
            )}
            <button onClick={onClose} className="btn-secondary text-sm px-6">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Section title helper ───────────────────────────────────────────────────
function SectionTitle({ icon: Icon, label, iconClass = 'text-slate-500' }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
      <Icon className={clsx('w-3.5 h-3.5', iconClass)} />
      {label}
    </h3>
  );
}

// ── Info row helper ────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 text-sm min-w-0">
      <Icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
      <span className="text-slate-600 flex-shrink-0 w-16">{label}</span>
      <div className="flex-1 min-w-0 text-slate-300">{value}</div>
    </div>
  );
}

// ── MissionCard ────────────────────────────────────────────────────────────
function MissionCard({ mission, onSelect, onAddToStack }) {
  const Icon    = CATEGORY_ICONS[mission._category] || Target;
  const faction = FACTION_MAP[mission.faction];

  return (
    <div
      onClick={(e) => onSelect(mission, e.clientY)}
      className={clsx(
        'card p-4 flex flex-col gap-2.5 cursor-pointer',
        'hover:border-cyan-500/40 hover:bg-space-700/60 hover:shadow-lg hover:shadow-cyan-500/5',
        'transition-all duration-150 group',
        !mission._available && 'opacity-55'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={clsx(
          'p-2 rounded-lg flex-shrink-0 mt-0.5 transition-colors',
          mission.legal ? 'bg-space-700/60 group-hover:bg-cyan-500/10' : 'bg-red-500/10'
        )}>
          <Icon className={clsx('w-4 h-4', mission.legal ? 'text-cyan-400' : 'text-red-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">{mission.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{mission._typeLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {mission._isEvent && (
            <span className="badge badge-purple text-xs">Évt</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 line-clamp-2">{mission.description}</p>

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', SYS_BG[mission._system])}>
          {mission._system}
        </span>
        <span className={clsx('badge', DIFF_COLORS[mission.difficulty] || 'badge-slate')}>
          {mission.difficulty}
        </span>
        {!mission.legal && <span className="badge badge-red">Illégal</span>}
        {mission._shareable && (
          <span className="badge badge-cyan" title="Partageable en groupe">
            <Layers className="w-2.5 h-2.5 mr-0.5 inline" />Partage
          </span>
        )}
      </div>

      {/* Payout + Time + Stack button */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-space-400/10">
        <span className="text-base font-bold text-success-400">{formatCredits(mission.payout, true)}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {mission.estimatedTime || '?'} min
          </div>
          {onAddToStack && (
            <button
              onClick={e => { e.stopPropagation(); onAddToStack(mission); }}
              title="Ajouter à l'empileur"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
            >
              <Layers className="w-3 h-3" />
              <Plus className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Faction / Giver */}
      {(faction || mission.giver) && (
        <div className="text-xs truncate">
          {faction && (
            <span className={faction.legal ? 'text-blue-400/70' : 'text-red-400/70'}>
              {faction.label}
            </span>
          )}
          {mission.giver && (
            <span className="text-slate-600"> · {mission.giver}</span>
          )}
        </div>
      )}

      {/* Expiry */}
      {mission.expires && (
        <div className={clsx(
          'text-xs flex items-center gap-1',
          mission._available ? 'text-slate-600' : 'text-danger-400'
        )}>
          <Clock className="w-3 h-3" />
          {mission._available ? formatRelativeTime(mission.expires) : 'Expirée'}
        </div>
      )}
    </div>
  );
}

// ── MissionRow (list view) ─────────────────────────────────────────────────
function MissionRow({ mission, onSelect, onAddToStack }) {
  const Icon    = CATEGORY_ICONS[mission._category] || Target;
  const faction = FACTION_MAP[mission.faction];

  return (
    <tr
      onClick={(e) => onSelect(mission, e.clientY)}
      className={clsx(
        'cursor-pointer hover:bg-cyan-500/5 transition-colors',
        !mission._available && 'opacity-50'
      )}
    >
      <td className="font-medium text-slate-200 max-w-xs">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-cyan-400/60 flex-shrink-0" />
          <span className="truncate">{mission.name}</span>
          {mission._isEvent && <span className="badge badge-purple ml-1">Évt</span>}
        </div>
      </td>
      <td className="text-xs text-slate-400 max-w-[140px] truncate">{mission._typeLabel}</td>
      <td>
        <span className={clsx('text-xs font-medium', SYS_COLORS[mission._system])}>
          {mission._system}
        </span>
      </td>
      <td className="text-xs">
        {faction && (
          <span className={faction.legal ? 'text-blue-400' : 'text-red-400'}>{faction.label}</span>
        )}
      </td>
      <td className="text-right font-bold text-success-400">{formatCredits(mission.payout, true)}</td>
      <td>
        <span className={clsx('badge', DIFF_COLORS[mission.difficulty] || 'badge-slate')}>
          {mission.difficulty}
        </span>
      </td>
      <td className="text-right text-slate-400 text-sm">{mission.estimatedTime || '?'} min</td>
      <td>
        {mission.legal
          ? <span className="badge badge-green">Légal</span>
          : <span className="badge badge-red">Illégal</span>
        }
      </td>
      <td>
        {mission._shareable && <span className="badge badge-cyan">Oui</span>}
      </td>
      <td onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {onAddToStack && (
            <button
              onClick={e => { e.stopPropagation(); onAddToStack(mission); }}
              title="Ajouter à l'empileur"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
            >
              <Layers className="w-3 h-3" />
              <Plus className="w-2.5 h-2.5" />
            </button>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </td>
    </tr>
  );
}

// ── Toggle chip button ─────────────────────────────────────────────────────
function Chip({ active, onClick, children, danger }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
        active
          ? danger
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
      )}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MissionBrowser() {
  const { notify }         = useAppActions();
  const navigate           = useNavigate();
  const [search,       setSearch]       = useState('');
  const [system,       setSystem]       = useState('');
  const [category,     setCategory]     = useState('');
  const [typeId,       setTypeId]       = useState('');
  const [faction,      setFaction]      = useState('');
  const [legality,     setLegality]     = useState('');   // '' | 'legal' | 'illegal'
  const [difficulty,   setDifficulty]   = useState('');
  const [payoutIdx,    setPayoutIdx]    = useState(0);
  const [shareable,    setShareable]    = useState('');   // '' | 'yes' | 'no'
  const [availability, setAvailability] = useState('');   // '' | 'available' | 'expired'
  const [eventOnly,    setEventOnly]    = useState(false);
  const [sort,         setSort]         = useState('payout-desc');
  const [view,         setView]         = useState('grid');
  const [page,         setPage]         = useState(1);
  const [showFilters,  setShowFilters]  = useState(true);
  const [selected,     setSelected]     = useState(null); // { mission, clickY }
  const [stackCount,   setStackCount]   = useState(() => loadStack().length);

  // Add a mission to the stack from this page
  const handleAddToStack = useCallback((mission) => {
    const current = loadStack();
    const payout  = getMidPayout(mission);
    const item = {
      stackId:       Date.now() + Math.random(),
      id:            mission.typeId || mission.id,
      name:          mission.name,
      category:      mission._category || 'transport',
      payout,
      estimatedTime: mission.estimatedTime || 15,
      legal:         mission.legal,
      difficulty:    mission.difficulty,
    };
    const next = [...current, item];
    saveStack(next);
    setStackCount(next.length);
    notify({ type: 'success', message: `"${mission.name}" ajouté à l'empileur !` });
  }, [notify]);

  const resetPage = () => setPage(1);

  // Count active filters for the badge
  const activeCount = [
    system, category, typeId, faction, legality, difficulty,
    payoutIdx > 0 ? 'p' : '', shareable, availability, eventOnly ? 'e' : '',
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch(''); setSystem(''); setCategory(''); setTypeId('');
    setFaction(''); setLegality(''); setDifficulty(''); setPayoutIdx(0);
    setShareable(''); setAvailability(''); setEventOnly(false); setPage(1);
  };

  // ── Filtered + sorted list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = ENRICHED;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.giver || '').toLowerCase().includes(q) ||
        m._typeLabel.toLowerCase().includes(q)
      );
    }

    if (system)             list = list.filter(m => m._system === system);
    if (category)           list = list.filter(m => m._category === category);
    if (typeId)             list = list.filter(m => m.typeId === typeId);
    if (faction)            list = list.filter(m => m.faction === faction);
    if (legality === 'legal')   list = list.filter(m => m.legal);
    if (legality === 'illegal') list = list.filter(m => !m.legal);
    if (difficulty)         list = list.filter(m => m.difficulty === difficulty);

    const range = PAYOUT_RANGES[payoutIdx];
    if (payoutIdx > 0)      list = list.filter(m => m.payout >= range.min && m.payout < range.max);

    if (shareable === 'yes') list = list.filter(m => m._shareable);
    if (shareable === 'no')  list = list.filter(m => !m._shareable);
    if (availability === 'available') list = list.filter(m => m._available);
    if (availability === 'expired')   list = list.filter(m => !m._available);
    if (eventOnly)          list = list.filter(m => m._isEvent);

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'payout-asc':  return a.payout - b.payout;
        case 'payout-desc': return b.payout - a.payout;
        case 'diff-desc':   return (DIFF_ORDER[b.difficulty] || 0) - (DIFF_ORDER[a.difficulty] || 0);
        case 'time-asc':    return (a.estimatedTime || 0) - (b.estimatedTime || 0);
        case 'name-asc':    return a.name.localeCompare(b.name, 'fr');
        default:            return b.payout - a.payout;
      }
    });
  }, [search, system, category, typeId, faction, legality, difficulty, payoutIdx, shareable, availability, eventOnly, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats (computed once) ──────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   ENRICHED.length,
    stanton: ENRICHED.filter(m => m._system === 'Stanton').length,
    pyro:    ENRICHED.filter(m => m._system === 'Pyro').length,
    nyx:     ENRICHED.filter(m => m._system === 'Nyx').length,
    legal:   ENRICHED.filter(m => m.legal).length,
    events:  ENRICHED.filter(m => m._isEvent).length,
  }), []);

  // ── Pagination helper ──────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }, [page, totalPages]);

  return (
    <div className="space-y-5">

      {/* ── Mission Detail Modal ────────────────────────────────────────── */}
      {selected && (
        <MissionDetailModal
          mission={selected.mission}
          clickY={selected.clickY}
          onClose={() => setSelected(null)}
          onAddToStack={handleAddToStack}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="page-title">
            Base de Données des Missions
            <span className="badge badge-cyan ml-2">SCMDB 4.7</span>
          </h1>
          <p className="page-subtitle">
            Toutes les missions Star Citizen · Données live Alpha 4.7 · Cliquez sur une mission pour les détails
          </p>
        </div>
        {/* Stack badge */}
        <button
          onClick={() => navigate('/missions/empilement')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0',
            stackCount > 0
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              : 'bg-space-700/40 border-space-400/20 text-slate-500 hover:text-slate-300'
          )}
        >
          <Layers className="w-4 h-4" />
          <span className="text-sm font-medium">Empileur</span>
          {stackCount > 0 && (
            <span className="bg-cyan-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {stackCount > 99 ? '99+' : stackCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total',   value: stats.total,   color: 'text-cyan-400'    },
          { label: 'Stanton', value: stats.stanton, color: 'text-blue-400'    },
          { label: 'Pyro',    value: stats.pyro,    color: 'text-orange-400'  },
          { label: 'Nyx',     value: stats.nyx,     color: 'text-purple-400'  },
          { label: 'Légales', value: stats.legal,   color: 'text-success-400' },
          { label: 'Événements', value: stats.events, color: 'text-yellow-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-lg font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher par nom, type, faction, donneur..."
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage(); }}
          className="input pl-12 pr-10 h-12 text-sm w-full"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); resetPage(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowFilters(f => !f)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filtres</span>
            {activeCount > 0 && (
              <span className="bg-cyan-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </div>
          {showFilters ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showFilters && (
          <div className="px-5 pb-5 space-y-5 border-t border-space-400/20">

            {/* Row 1 — Système + Catégorie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Système Stellaire
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { v: '',        l: 'Tous',    cnt: stats.total   },
                    { v: 'Stanton', l: 'Stanton', cnt: stats.stanton },
                    { v: 'Pyro',    l: 'Pyro',    cnt: stats.pyro    },
                    { v: 'Nyx',     l: 'Nyx',     cnt: stats.nyx     },
                  ].map(({ v, l, cnt }) => (
                    <button
                      key={v}
                      onClick={() => { setSystem(v); resetPage(); }}
                      className={clsx(
                        'px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                        system === v
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
                      )}
                    >
                      <Globe className="w-3 h-3" />
                      {l}
                      <span className="text-slate-500 text-xs">({cnt})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={category === ''} onClick={() => { setCategory(''); resetPage(); }}>Toutes</Chip>
                  {MISSION_CATEGORIES.map(cat => {
                    const CatIcon = CATEGORY_ICONS[cat.id] || Target;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setCategory(cat.id === category ? '' : cat.id); resetPage(); }}
                        className={clsx(
                          'px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                          category === cat.id
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
                        )}
                      >
                        <CatIcon className="w-3 h-3" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2 — Type de Mission + Faction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Type de Mission
                </label>
                <select
                  value={typeId}
                  onChange={e => { setTypeId(e.target.value); resetPage(); }}
                  className="select w-full"
                >
                  <option value="">Tous les types ({TYPE_OPTIONS.length})</option>
                  {TYPE_OPTIONS.map(([id, meta]) => (
                    <option key={id} value={id}>{meta.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Faction
                </label>
                <select
                  value={faction}
                  onChange={e => { setFaction(e.target.value); resetPage(); }}
                  className="select w-full"
                >
                  <option value="">Toutes les factions</option>
                  {MISSION_FACTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 — Légalité + Difficulté + Récompense */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Légalité
                </label>
                <div className="flex gap-2">
                  <Chip active={legality === ''} onClick={() => { setLegality(''); resetPage(); }}>Tous</Chip>
                  <Chip active={legality === 'legal'} onClick={() => { setLegality('legal'); resetPage(); }}>Légal</Chip>
                  <Chip active={legality === 'illegal'} danger onClick={() => { setLegality('illegal'); resetPage(); }}>Illégal</Chip>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Difficulté
                </label>
                <select
                  value={difficulty}
                  onChange={e => { setDifficulty(e.target.value); resetPage(); }}
                  className="select w-full"
                >
                  <option value="">Toutes</option>
                  {['Facile', 'Moyen', 'Difficile', 'Extrême'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Récompense
                </label>
                <select
                  value={payoutIdx}
                  onChange={e => { setPayoutIdx(Number(e.target.value)); resetPage(); }}
                  className="select w-full"
                >
                  {PAYOUT_RANGES.map((r, i) => (
                    <option key={i} value={i}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4 — Partageable + Disponibilité + Événement + Clear */}
            <div className="flex flex-wrap items-end gap-5">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Partageable
                </label>
                <div className="flex gap-2">
                  <Chip active={shareable === ''} onClick={() => { setShareable(''); resetPage(); }}>Tous</Chip>
                  <Chip active={shareable === 'yes'} onClick={() => { setShareable('yes'); resetPage(); }}>
                    <Layers className="w-3 h-3 inline mr-1" />Oui
                  </Chip>
                  <Chip active={shareable === 'no'} onClick={() => { setShareable('no'); resetPage(); }}>Non</Chip>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Disponibilité
                </label>
                <div className="flex gap-2">
                  <Chip active={availability === ''} onClick={() => { setAvailability(''); resetPage(); }}>Toutes</Chip>
                  <Chip active={availability === 'available'} onClick={() => { setAvailability('available'); resetPage(); }}>
                    <Zap className="w-3 h-3 inline mr-1" />Active
                  </Chip>
                  <Chip active={availability === 'expired'} onClick={() => { setAvailability('expired'); resetPage(); }}>Expirée</Chip>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
                  Événement
                </label>
                <button
                  onClick={() => { setEventOnly(e => !e); resetPage(); }}
                  className={clsx(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                    eventOnly
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-space-700/40 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Star className="w-3 h-3" />
                  Seulement événements
                </button>
              </div>

              {activeCount > 0 && (
                <button
                  onClick={clearAll}
                  className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-danger-400 transition-colors pb-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Effacer les filtres ({activeCount})
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Results bar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">{filtered.length}</span> missions
          {filtered.length !== ENRICHED.length && (
            <span className="text-slate-500"> sur {ENRICHED.length}</span>
          )}
          {page > 1 && totalPages > 1 && (
            <span className="text-slate-600"> · page {page}/{totalPages}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); resetPage(); }}
            className="select text-xs py-1.5"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="flex gap-1 bg-space-700/40 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={clsx('p-1.5 rounded transition-colors', view === 'grid' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300')}
              title="Vue grille"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={clsx('p-1.5 rounded transition-colors', view === 'list' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300')}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {paginated.length === 0 && (
        <div className="card p-14 text-center">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-1">Aucune mission correspondante</p>
          <p className="text-sm text-slate-600 mb-4">Modifiez ou réinitialisez vos filtres.</p>
          <button onClick={clearAll} className="btn-secondary gap-2 mx-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* ── Grid view ───────────────────────────────────────────────────── */}
      {paginated.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
          {paginated.map(m => (
            <MissionCard key={m.id} mission={m} onSelect={(m, y) => setSelected({ mission: m, clickY: y })} onAddToStack={handleAddToStack} />
          ))}
        </div>
      )}

      {/* ── List view ───────────────────────────────────────────────────── */}
      {paginated.length > 0 && view === 'list' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Type</th>
                  <th>Système</th>
                  <th>Faction</th>
                  <th className="text-right">Prime</th>
                  <th>Difficulté</th>
                  <th className="text-right">Durée</th>
                  <th>Légal</th>
                  <th>Partage</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(m => (
                  <MissionRow key={m.id} mission={m} onSelect={(m, y) => setSelected({ mission: m, clickY: y })} onAddToStack={handleAddToStack} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          >
            ‹ Précédent
          </button>

          {pageNumbers.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-500 text-sm">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx(
                  'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                  page === p
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/50'
                )}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Suivant ›
          </button>
        </div>
      )}
    </div>
  );
}
