/**
 * Comparateur d'Armures FPS — Star Citizen Alpha 4.6
 * Compare 3 sets d'armures côte à côte avec radar chart et recommandations
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield, RotateCcw, Search, X, ChevronDown,
  Star, DollarSign, MapPin, Zap, Heart,
  Award, Target, Compass, Swords,
} from 'lucide-react';
import clsx from 'clsx';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { LOADOUT_ARMOR_SETS } from '../../datasets/fpsLoadoutData.js';
import { useSearchParams } from 'react-router-dom';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const SLOT_COLORS = {
  A: { line: '#06b6d4', fill: '#06b6d426', text: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400' },
  B: { line: '#eab308', fill: '#eab30826', text: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  C: { line: '#a855f7', fill: '#a855f726', text: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', dot: 'bg-purple-400' },
};

const CLASS_BADGE = {
  light:  { label: 'Légère',  cls: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  medium: { label: 'Moyenne', cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  heavy:  { label: 'Lourde',  cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
};

const TIER_BADGE = {
  starter:  { label: 'Starter',  cls: 'bg-slate-500/20 text-slate-400' },
  standard: { label: 'Standard', cls: 'bg-blue-500/20 text-blue-400' },
  premium:  { label: 'Premium',  cls: 'bg-purple-500/20 text-purple-400' },
  elite:    { label: 'Élite',    cls: 'bg-orange-500/20 text-orange-400' },
};

// Stats affichées dans le tableau, dans l'ordre
const STAT_ROWS = [
  { key: 'class',       label: 'Classe',              icon: Shield,      type: 'badge',   higher: null },
  { key: 'weight',      label: 'Poids (kg)',           icon: Zap,         type: 'number',  higher: false },
  { key: 'physicalRes', label: 'Résistance physique',  icon: Shield,      type: 'percent', higher: true  },
  { key: 'energyRes',   label: 'Résistance énergie',   icon: Zap,         type: 'percent', higher: true  },
  { key: 'thermalRes',  label: 'Résistance thermique', icon: Heart,       type: 'percent', higher: true  },
  { key: 'biochemRes',  label: 'Résistance biochim.',  icon: Award,       type: 'percent', higher: true  },
  { key: 'healthBonus', label: 'Bonus HP',             icon: Heart,       type: 'percent', higher: true  },
  { key: 'mobility',    label: 'Mobilité',             icon: Compass,     type: 'stars',   higher: true  },
  { key: 'price',       label: 'Prix (aUEC)',          icon: DollarSign,  type: 'price',   higher: false },
  { key: 'location',    label: 'Localisation',         icon: MapPin,      type: 'text',    higher: null  },
];

// Recommandation par usage
const USE_CASES = [
  {
    id: 'pvp',
    label: 'Pour le PvP',
    icon: Target,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    primaryStat: 'physicalRes',
    secondaryStat: 'energyRes',
    description: (armor) => armor
      ? `${armor.name} offre la meilleure protection contre les dégâts en combat joueur-contre-joueur. Sa résistance physique (${armor.stats.physicalRes}%) et énergie (${armor.stats.energyRes}%) la rendent supérieure.`
      : 'Sélectionnez des armures pour obtenir une recommandation PvP.',
    tip: 'Priorité : résistance physique + énergie élevées. La mobilité est secondaire si vous comptez tenir des positions.',
  },
  {
    id: 'exploration',
    label: 'Pour l\'exploration',
    icon: Compass,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    primaryStat: 'biochemRes',
    secondaryStat: 'mobility',
    description: (armor) => armor
      ? `${armor.name} est le choix idéal pour l'exploration grâce à sa résistance biochimique (${armor.stats.biochemRes}%) et sa mobilité (${armor.mobility}/10) pour naviguer rapidement en terrain hostile.`
      : 'Sélectionnez des armures pour obtenir une recommandation exploration.',
    tip: 'Priorité : résistance biochimique (atmosphères toxiques) + mobilité. Hurston et zones acides requièrent biochemRes élevée.',
  },
  {
    id: 'pve',
    label: 'Pour le farming PvE',
    icon: Swords,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    primaryStat: 'healthBonus',
    secondaryStat: 'physicalRes',
    description: (armor) => armor
      ? `${armor.name} est recommandée pour le farming PvE grâce à son bonus HP (${armor.stats.healthBonus}%) et sa résistance physique (${armor.stats.physicalRes}%), ce qui augmente votre survie face aux vagues d'ennemis IA.`
      : 'Sélectionnez des armures pour obtenir une recommandation PvE.',
    tip: 'Priorité : bonus HP + résistance physique. Les ennemis IA utilisent principalement des dégâts physiques et balistiques.',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmtPrice(n) {
  if (!n) return '—';
  if (n >= 1000000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(0) + 'k';
  return String(n);
}

function getStatValue(armor, key) {
  if (!armor) return null;
  switch (key) {
    case 'class':       return armor.class;
    case 'weight':      return armor.weight;
    case 'physicalRes': return armor.stats.physicalRes;
    case 'energyRes':   return armor.stats.energyRes;
    case 'thermalRes':  return armor.stats.thermalRes;
    case 'biochemRes':  return armor.stats.biochemRes;
    case 'healthBonus': return armor.stats.healthBonus;
    case 'mobility':    return armor.mobility;
    case 'price':       return armor.price;
    case 'location':    return armor.location;
    default:            return null;
  }
}

function getNumericValue(armor, key) {
  const v = getStatValue(armor, key);
  return typeof v === 'number' ? v : null;
}

function getBestWorst(armors, key, higher) {
  if (higher === null) return { best: null, worst: null };
  const vals = armors.map((a, i) => ({ i, v: getNumericValue(a, key) })).filter(x => x.v !== null);
  if (vals.length < 2) return { best: null, worst: null };
  vals.sort((a, b) => a.v - b.v);
  return higher
    ? { best: vals[vals.length - 1].i, worst: vals[0].i }
    : { best: vals[0].i, worst: vals[vals.length - 1].i };
}

function getMax(armors, key) {
  const vals = armors.map(a => getNumericValue(a, key)).filter(v => v !== null);
  return vals.length ? Math.max(...vals) : 1;
}

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────

function ArmorImage({ armor, slot }) {
  const [err, setErr] = useState(false);
  const color = SLOT_COLORS[slot];
  if (!armor) return null;
  return (
    <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-lg overflow-hidden bg-space-700 border border-space-600">
      {!err && armor.imageUrl
        ? <img
            src={armor.imageUrl}
            alt={armor.name}
            className="w-full h-full object-cover"
            onError={() => setErr(true)}
          />
        : <Shield className={clsx('w-10 h-10', color.text)} />
      }
    </div>
  );
}

function StarRating({ value, max = 10 }) {
  const stars = Math.round((value / max) * 5);
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={clsx('w-3 h-3', i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-space-600')}
        />
      ))}
    </span>
  );
}

function StatBar({ value, max, colorClass }) {
  if (value === null || max === 0) return null;
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mt-1 h-1 w-full bg-space-700 rounded-full overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-500', colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ArmorSelector({ slot, armor, onSelect, onClear, allArmors }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const color = SLOT_COLORS[slot];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allArmors;
    return allArmors.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.manufacturer.toLowerCase().includes(q) ||
      a.class.toLowerCase().includes(q)
    );
  }, [query, allArmors]);

  const handleSelect = useCallback((a) => {
    onSelect(a);
    setOpen(false);
    setQuery('');
  }, [onSelect]);

  return (
    <div className="relative">
      {armor ? (
        <div className={clsx('card p-3 border-2', color.border)}>
          <ArmorImage armor={armor} slot={slot} />
          <div className="mt-2 text-center">
            <div className={clsx('font-bold text-sm', color.text)}>{armor.name}</div>
            <div className="text-xs text-space-400">{armor.manufacturer}</div>
            <div className="flex justify-center gap-1 mt-1 flex-wrap">
              <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', CLASS_BADGE[armor.class]?.cls)}>
                {CLASS_BADGE[armor.class]?.label}
              </span>
              {armor.tier && (
                <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', TIER_BADGE[armor.tier]?.cls)}>
                  {TIER_BADGE[armor.tier]?.label}
                </span>
              )}
              {armor.illegal && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Illégal</span>
              )}
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setOpen(true)}
              className="flex-1 text-xs py-1 rounded bg-space-600 hover:bg-space-500 text-space-200 transition-colors"
            >
              Changer
            </button>
            <button
              onClick={onClear}
              className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={clsx(
            'w-full card p-4 border-2 border-dashed flex flex-col items-center gap-2',
            'hover:border-opacity-80 transition-all cursor-pointer',
            color.border,
          )}
        >
          <Shield className={clsx('w-8 h-8 opacity-40', color.text)} />
          <span className="text-sm text-space-400">Sélectionner</span>
          <span className={clsx('text-xs font-bold', color.text)}>Armure {slot}</span>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 card border border-space-500 shadow-2xl min-w-[260px]">
          <div className="p-2 border-b border-space-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-space-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher..."
                className="input w-full pl-7 text-xs py-1.5"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="text-center text-space-500 text-xs py-4">Aucun résultat</div>
            )}
            {filtered.map(a => (
              <button
                key={a.id}
                onClick={() => handleSelect(a)}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-space-700 transition-colors text-left"
              >
                <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0', CLASS_BADGE[a.class]?.cls)}>
                  {CLASS_BADGE[a.class]?.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-space-100 truncate">{a.name}</div>
                  <div className="text-xs text-space-500 truncate">{a.manufacturer}</div>
                </div>
                <div className="text-xs text-space-400 shrink-0">{fmtPrice(a.price)} aUEC</div>
              </button>
            ))}
          </div>
          <div className="p-1 border-t border-space-700">
            <button
              onClick={() => { setOpen(false); setQuery(''); }}
              className="w-full text-xs text-space-400 hover:text-space-200 py-1 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({ armor, stat, isBest, isWorst, slotIdx, allArmors }) {
  const color = SLOT_COLORS[['A', 'B', 'C'][slotIdx]];
  const barColors = ['bg-cyan-500', 'bg-yellow-500', 'bg-purple-500'];

  if (!armor) {
    return <td className="px-3 py-3 text-center text-space-600 text-sm">—</td>;
  }

  const val = getStatValue(armor, stat.key);

  let content = null;
  let barVal = null;
  const maxVal = getMax(allArmors.filter(Boolean), stat.key);

  switch (stat.type) {
    case 'badge': {
      const badgeInfo = CLASS_BADGE[val] || { label: val, cls: 'bg-space-600 text-space-300' };
      content = <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', badgeInfo.cls)}>{badgeInfo.label}</span>;
      break;
    }
    case 'percent': {
      barVal = val;
      content = (
        <span className={clsx('font-bold text-sm', isBest ? 'text-green-400' : isWorst ? 'text-red-400' : 'text-space-100')}>
          {val ?? '—'}{val !== null ? '%' : ''}
        </span>
      );
      break;
    }
    case 'number': {
      barVal = val;
      content = (
        <span className={clsx('font-bold text-sm', isBest ? 'text-green-400' : isWorst ? 'text-red-400' : 'text-space-100')}>
          {val ?? '—'}{val !== null ? ' kg' : ''}
        </span>
      );
      break;
    }
    case 'stars': {
      barVal = val;
      content = (
        <div className={clsx('flex flex-col items-center gap-0.5', isBest ? 'text-green-400' : isWorst ? 'text-red-400' : '')}>
          <span className={clsx('font-bold text-sm', isBest ? 'text-green-400' : isWorst ? 'text-red-400' : 'text-space-100')}>{val}/10</span>
          <StarRating value={val} />
        </div>
      );
      break;
    }
    case 'price': {
      barVal = val;
      content = (
        <span className={clsx('font-bold text-sm', isBest ? 'text-green-400' : isWorst ? 'text-red-400' : 'text-space-100')}>
          {fmtPrice(val)}
        </span>
      );
      break;
    }
    case 'text': {
      content = <span className="text-xs text-space-300 leading-tight">{val || '—'}</span>;
      break;
    }
    default:
      content = <span className="text-sm text-space-200">{String(val ?? '—')}</span>;
  }

  return (
    <td className={clsx(
      'px-3 py-3 text-center align-middle',
      isBest && stat.higher !== null && 'bg-green-500/5',
      isWorst && stat.higher !== null && 'bg-red-500/5',
    )}>
      <div className="flex flex-col items-center gap-1">
        {content}
        {barVal !== null && maxVal > 0 && stat.type !== 'text' && stat.type !== 'badge' && (
          <StatBar value={barVal} max={maxVal} colorClass={barColors[slotIdx]} />
        )}
      </div>
    </td>
  );
}

// ─── RADAR CHART ─────────────────────────────────────────────────────────────

const RADAR_AXES = [
  { key: 'physicalRes', label: 'Physique' },
  { key: 'energyRes',   label: 'Énergie'  },
  { key: 'thermalRes',  label: 'Thermique' },
  { key: 'biochemRes',  label: 'Biochim.' },
  { key: 'mobility',    label: 'Mobilité' },
];

function buildRadarData(armors) {
  // Normalise chaque axe sur 100 (ratio relatif au max global du dataset + 15% marge)
  const maxima = {};
  RADAR_AXES.forEach(ax => {
    const vals = armors.filter(Boolean).map(a => getNumericValue(a, ax.key) ?? 0);
    maxima[ax.key] = Math.max(...vals, 1);
  });

  return RADAR_AXES.map(ax => {
    const entry = { axis: ax.label };
    armors.forEach((armor, i) => {
      const slot = ['A', 'B', 'C'][i];
      entry[slot] = armor ? Math.round(((getNumericValue(armor, ax.key) ?? 0) / maxima[ax.key]) * 100) : 0;
    });
    return entry;
  });
}

// ─── ANALYSE TEXTUELLE ────────────────────────────────────────────────────────

function buildAnalysis(armors) {
  const filled = armors.filter(Boolean);
  if (filled.length < 2) return null;

  const results = {};

  STAT_ROWS.filter(s => s.higher !== null && s.type !== 'text' && s.type !== 'badge').forEach(stat => {
    const vals = armors.map((a, i) => ({ i, slot: ['A', 'B', 'C'][i], armor: a, v: getNumericValue(a, stat.key) })).filter(x => x.armor && x.v !== null);
    if (vals.length < 2) return;
    vals.sort((a, b) => stat.higher ? b.v - a.v : a.v - b.v);
    results[stat.key] = { best: vals[0], label: stat.label };
  });

  return results;
}

function AnalysisSection({ armors }) {
  const analysis = buildAnalysis(armors);
  if (!analysis) {
    return (
      <div className="text-center text-space-500 py-8 text-sm">
        Sélectionnez au moins 2 armures pour voir l'analyse.
      </div>
    );
  }

  const grouped = {};
  Object.entries(analysis).forEach(([, { best, label }]) => {
    const key = best.slot;
    if (!grouped[key]) grouped[key] = { slot: best.slot, armor: best.armor, wins: [] };
    grouped[key].wins.push(label);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['A', 'B', 'C'].map(slot => {
        const armor = armors[['A', 'B', 'C'].indexOf(slot)];
        const group = grouped[slot];
        const color = SLOT_COLORS[slot];
        if (!armor) return null;
        return (
          <div key={slot} className={clsx('card p-4 border', color.border, color.bg)}>
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', color.dot, 'text-space-900')}>
                {slot}
              </span>
              <span className={clsx('font-bold text-sm', color.text)}>{armor.name}</span>
            </div>
            {group?.wins.length > 0 ? (
              <>
                <p className="text-xs text-space-300 mb-2">Meilleure pour :</p>
                <ul className="space-y-1">
                  {group.wins.map(w => (
                    <li key={w} className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-space-500">Pas de stat dominante dans cette sélection.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── RECOMMANDATIONS ─────────────────────────────────────────────────────────

function RecommendationCard({ useCase, armors }) {
  const slots = ['A', 'B', 'C'];

  const best = useMemo(() => {
    const candidates = armors.map((a, i) => ({ slot: slots[i], armor: a })).filter(x => x.armor);
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      const va = (getNumericValue(a.armor, useCase.primaryStat) ?? 0) * 2
               + (getNumericValue(a.armor, useCase.secondaryStat) ?? 0);
      const vb = (getNumericValue(b.armor, useCase.primaryStat) ?? 0) * 2
               + (getNumericValue(b.armor, useCase.secondaryStat) ?? 0);
      return vb - va;
    });
    return candidates[0];
  }, [armors, useCase]);

  const Icon = useCase.icon;
  const slotColor = best ? SLOT_COLORS[best.slot] : null;

  return (
    <div className={clsx('card p-5 border', useCase.bgColor)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={clsx('w-5 h-5', useCase.color)} />
        <h3 className={clsx('font-bold text-sm', useCase.color)}>{useCase.label}</h3>
      </div>
      {best ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            {slotColor && (
              <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0', slotColor.dot, 'text-space-900')}>
                {best.slot}
              </span>
            )}
            <span className="font-bold text-space-100">{best.armor.name}</span>
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium ml-auto shrink-0', CLASS_BADGE[best.armor.class]?.cls)}>
              {CLASS_BADGE[best.armor.class]?.label}
            </span>
          </div>
          <p className="text-xs text-space-300 leading-relaxed mb-3">
            {useCase.description(best.armor)}
          </p>
          <div className="bg-space-800/50 rounded-lg p-2 border border-space-700/50">
            <p className="text-xs text-space-400 leading-relaxed">
              <span className="text-space-300 font-medium">Conseil : </span>
              {useCase.tip}
            </p>
          </div>
        </>
      ) : (
        <p className="text-xs text-space-500">{useCase.description(null)}</p>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function ArmorComparator() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Slots : A (idx 0), B (idx 1), C (idx 2)
  const [slots, setSlots] = useState([null, null, null]);

  // Pré-chargement depuis URL
  useEffect(() => {
    const ids = ['a', 'b', 'c'].map(k => searchParams.get(k));
    const loaded = ids.map(id => id ? (LOADOUT_ARMOR_SETS.find(a => a.id === id) ?? null) : null);
    if (loaded.some(Boolean)) setSlots(loaded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour URL quand les slots changent
  useEffect(() => {
    const params = {};
    ['a', 'b', 'c'].forEach((k, i) => { if (slots[i]) params[k] = slots[i].id; });
    setSearchParams(params, { replace: true });
  }, [slots, setSearchParams]);

  const handleSelect = useCallback((idx, armor) => {
    setSlots(prev => { const next = [...prev]; next[idx] = armor; return next; });
  }, []);

  const handleClear = useCallback((idx) => {
    setSlots(prev => { const next = [...prev]; next[idx] = null; return next; });
  }, []);

  const handleReset = useCallback(() => {
    setSlots([null, null, null]);
  }, []);

  // Boutons rapides — meilleure de chaque classe selon physicalRes
  const quickFill = useCallback((classFilter) => {
    const byClass = LOADOUT_ARMOR_SETS.filter(a => a.class === classFilter);
    byClass.sort((a, b) => (b.stats.physicalRes ?? 0) - (a.stats.physicalRes ?? 0));
    const picks = byClass.slice(0, 3);
    setSlots([picks[0] ?? null, picks[1] ?? null, picks[2] ?? null]);
  }, []);

  const handleQuickLight  = useCallback(() => quickFill('light'),  [quickFill]);
  const handleQuickMedium = useCallback(() => quickFill('medium'), [quickFill]);
  const handleQuickHeavy  = useCallback(() => quickFill('heavy'),  [quickFill]);

  const radarData   = useMemo(() => buildRadarData(slots), [slots]);
  const hasAny      = slots.some(Boolean);
  const hasTwoPlus  = slots.filter(Boolean).length >= 2;

  // Calcul best/worst par stat
  const highlights = useMemo(() => {
    const result = {};
    STAT_ROWS.forEach(stat => {
      result[stat.key] = getBestWorst(slots, stat.key, stat.higher);
    });
    return result;
  }, [slots]);

  return (
    <div className="min-h-screen bg-space-900 p-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" />
            Comparateur d'Armures
          </h1>
          <p className="text-space-400 text-sm mt-1">
            Comparez jusqu'à 3 sets d'armures FPS côte à côte — stats, barres et radar chart.
          </p>
        </div>
        <button onClick={handleReset} className="btn-secondary flex items-center gap-2 self-start sm:self-auto">
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      {/* ── Boutons rapides ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-space-400 self-center mr-1">Pré-remplir :</span>
        <button onClick={handleQuickLight} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
          <span className={clsx('w-2 h-2 rounded-full', CLASS_BADGE.light.cls.includes('green') ? 'bg-green-400' : 'bg-green-400')} />
          Armures légères
        </button>
        <button onClick={handleQuickMedium} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Armures moyennes
        </button>
        <button onClick={handleQuickHeavy} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Armures lourdes
        </button>
      </div>

      {/* ── Sélecteurs (3 colonnes) ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['A', 'B', 'C'].map((slot, i) => (
          <ArmorSelector
            key={slot}
            slot={slot}
            armor={slots[i]}
            onSelect={(a) => handleSelect(i, a)}
            onClear={() => handleClear(i)}
            allArmors={LOADOUT_ARMOR_SETS}
          />
        ))}
      </div>

      {/* ── Tableau de comparaison ── */}
      {hasAny && (
        <div className="card mb-6 overflow-x-auto">
          <div className="p-4 border-b border-space-700">
            <h2 className="section-title flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Comparaison des statistiques
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-space-700 bg-space-800/50">
                {/* Colonne labels */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-space-400 uppercase tracking-wide w-40">
                  Statistique
                </th>
                {['A', 'B', 'C'].map((slot, i) => {
                  const color = SLOT_COLORS[slot];
                  return (
                    <th key={slot} className={clsx('px-3 py-3 text-center text-sm font-bold', color.text)}>
                      {slots[i] ? slots[i].name : `Armure ${slot}`}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {STAT_ROWS.map((stat, rowIdx) => {
                const { best, worst } = highlights[stat.key] || {};
                const Icon = stat.icon;
                return (
                  <tr
                    key={stat.key}
                    className={clsx(
                      'border-b border-space-800 transition-colors',
                      rowIdx % 2 === 0 ? 'bg-space-900/30' : 'bg-space-800/20',
                      'hover:bg-space-700/20',
                    )}
                  >
                    {/* Label */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-space-300 font-medium">
                        <Icon className="w-4 h-4 text-space-500 shrink-0" />
                        {stat.label}
                      </div>
                    </td>
                    {/* Valeurs A, B, C */}
                    {[0, 1, 2].map(i => (
                      <StatCell
                        key={i}
                        armor={slots[i]}
                        stat={stat}
                        isBest={best === i}
                        isWorst={worst === i}
                        slotIdx={i}
                        allArmors={slots}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Légende best/worst */}
          <div className="px-4 py-3 border-t border-space-700 flex flex-wrap gap-4 text-xs text-space-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500/50" />
              Meilleure valeur
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500/50" />
              Valeur la plus faible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-10 h-1 rounded-full bg-gradient-to-r from-space-600 to-cyan-500" />
              Barre proportionnelle au max
            </span>
          </div>
        </div>
      )}

      {/* ── Radar Chart ── */}
      {hasTwoPlus && (
        <div className="card mb-6 p-6">
          <h2 className="section-title flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-cyan-400" />
            Profil radar
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                {['A', 'B', 'C'].map((slot, i) => {
                  if (!slots[i]) return null;
                  const color = SLOT_COLORS[slot];
                  return (
                    <Radar
                      key={slot}
                      name={slots[i].name}
                      dataKey={slot}
                      stroke={color.line}
                      fill={color.fill}
                      strokeWidth={2}
                    />
                  );
                })}
                <Legend
                  formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: 12 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-space-500 text-center mt-2">
            Valeurs normalisées (100% = maximum dans la sélection). Plus la surface est grande, plus l'armure est polyvalente.
          </p>
        </div>
      )}

      {/* ── Analyse textuelle ── */}
      {hasAny && (
        <div className="card mb-6 p-6">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-cyan-400" />
            Analyse
          </h2>
          <AnalysisSection armors={slots} />
        </div>
      )}

      {/* ── Recommandations ── */}
      <div className="mb-6">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-cyan-400" />
          Recommandations par usage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {USE_CASES.map(uc => (
            <RecommendationCard key={uc.id} useCase={uc} armors={slots} />
          ))}
        </div>
      </div>

      {/* ── État vide ── */}
      {!hasAny && (
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <h3 className="text-space-300 font-bold text-lg mb-2">Sélectionnez des armures</h3>
          <p className="text-space-500 text-sm mb-6 max-w-sm mx-auto">
            Choisissez jusqu'à 3 sets d'armures dans les slots ci-dessus pour comparer leurs statistiques.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={handleQuickLight}  className="btn-primary text-sm py-2 px-4">Top Légères</button>
            <button onClick={handleQuickMedium} className="btn-secondary text-sm py-2 px-4">Top Moyennes</button>
            <button onClick={handleQuickHeavy}  className="btn-secondary text-sm py-2 px-4">Top Lourdes</button>
          </div>
        </div>
      )}
    </div>
  );
}
