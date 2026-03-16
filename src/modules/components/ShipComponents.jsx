import React, { useState, useMemo } from 'react';
import {
  POWER_PLANTS, SHIELDS, QUANTUM_DRIVES, COOLERS, MISSILES,
  COMPONENT_CATEGORIES, GRADE_CONFIG, MISSILE_TYPE_CONFIG, SHIELD_TYPE_CONFIG,
} from '../../datasets/shipcomponents.js';
import {
  TRACTOR_BEAMS, TRACTOR_TYPE_CONFIG, TRACTOR_SIZES_ALL,
} from '../../datasets/tractorBeams.js';
import { formatCredits } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Search, Zap, Shield, Navigation, Thermometer, Target,
  ChevronDown, ChevronUp, X, SlidersHorizontal, LayoutGrid, List,
  TrendingUp, Package, Factory, Magnet, AlertTriangle, Info,
} from 'lucide-react';

// ─── Icône par catégorie ───────────────────────────────────────────────────
const CAT_ICONS = {
  power:   Zap,
  shields: Shield,
  quantum: Navigation,
  coolers: Thermometer,
  missiles: Target,
};

// ─── Barre de progression ─────────────────────────────────────────────────
function StatBar({ label, value, max, color = 'bg-cyan-500', unit = '', decimals = 0 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const display = decimals > 0 ? value.toFixed(decimals) : value.toLocaleString('fr-FR');
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-0.5">
        <span>{label}</span>
        <span className="text-slate-300">{display}{unit}</span>
      </div>
      <div className="h-1.5 bg-space-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Panneau latéral détail ────────────────────────────────────────────────
function DetailPanel({ item, category, onClose }) {
  if (!item || !category) return null;
  const grade = GRADE_CONFIG[item.grade] || {};
  const Icon = CAT_ICONS[category.id] || Zap;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-space-900 border-l border-space-400/20 h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-space-900 border-b border-space-400/20 p-4 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', grade?.bg)}>
              <Icon className={clsx('w-5 h-5', category.color)} />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 leading-tight">{item.name}</h2>
              <p className="text-xs text-slate-500">{item.manufacturer}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-space-700 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={clsx('px-2.5 py-1 rounded-full text-xs font-bold border', grade?.bg, grade?.color, grade?.border)}>
              {grade?.label}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-space-700 border border-space-400/20 text-slate-300">
              Taille {item.size}
            </span>
            {item.type && category.id === 'missiles' && (
              <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium border', MISSILE_TYPE_CONFIG[item.type]?.bg, MISSILE_TYPE_CONFIG[item.type]?.color, 'border-current/20')}>
                {MISSILE_TYPE_CONFIG[item.type]?.label}
              </span>
            )}
            {item.type && category.id === 'shields' && (
              <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium border', SHIELD_TYPE_CONFIG[item.type]?.bg, SHIELD_TYPE_CONFIG[item.type]?.color, 'border-current/20')}>
                {SHIELD_TYPE_CONFIG[item.type]?.label}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold-900/20 border border-gold-500/20 text-gold-400">
              {formatCredits(item.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>

          {/* Stats détaillées */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statistiques</h3>

            {/* Power Plants */}
            {category.id === 'power' && (
              <div className="space-y-2.5">
                <StatBar label="Puissance max" value={item.stats.powerOutput} max={6000} color="bg-yellow-500" unit=" EU/s" />
                <StatBar label="Consommation propre" value={item.stats.powerDraw} max={600} color="bg-orange-500" unit=" EU/s" />
                <StatBar label="Signature EM" value={item.stats.emSignature} max={350} color="bg-purple-500" />
                <StatBar label="Chaleur générée" value={item.stats.heatGeneration} max={650} color="bg-red-500" />
                <StatBar label="Durabilité" value={item.stats.durability} max={5000} color="bg-green-500" unit=" HP" />
              </div>
            )}

            {/* Shields */}
            {category.id === 'shields' && (
              <div className="space-y-2.5">
                <StatBar label="Points de bouclier" value={item.stats.shieldHp} max={20000} color="bg-cyan-500" unit=" HP" />
                <StatBar label="Régénération" value={item.stats.regenRate} max={2000} color="bg-blue-500" unit=" HP/s" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Délai regen</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.regenDelay}s</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Puissance requise</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.powerDraw} EU/s</p>
                  </div>
                </div>
                <div className="bg-space-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-slate-400 mb-2">Absorption des dégâts</p>
                  <StatBar label="Physique" value={item.stats.physAbsorption} max={60} color="bg-slate-500" unit="%" />
                  <StatBar label="Énergie" value={item.stats.energyAbsorption} max={60} color="bg-yellow-500" unit="%" />
                  <StatBar label="Distorsion" value={item.stats.distortionAbsorption} max={70} color="bg-purple-500" unit="%" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Signature EM : <span className="text-slate-300">{item.stats.emSignature}</span></span>
                </div>
              </div>
            )}

            {/* Quantum Drives */}
            {category.id === 'quantum' && (
              <div className="space-y-2.5">
                <StatBar label="Vitesse QT" value={item.stats.qtSpeed} max={0.26} color="bg-blue-500" unit=" Gm/s" decimals={3} />
                <StatBar label="Portée max" value={item.stats.qtRange} max={230} color="bg-cyan-500" unit=" Gm" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Temps spool</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.spoolTime}s</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Conso carburant</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.fuelConsumption} %/Gm</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Puissance requise</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.powerDraw} EU/s</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Signature EM</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.emSignature}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Coolers */}
            {category.id === 'coolers' && (
              <div className="space-y-2.5">
                <StatBar label="Taux de refroidissement" value={item.stats.coolingRate} max={9000} color="bg-sky-500" unit=" /s" />
                <StatBar label="Absorption max" value={item.stats.maxHeatAbsorption} max={36000} color="bg-teal-500" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Signature IR</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.irSignature.toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Puissance requise</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.powerDraw} EU/s</p>
                  </div>
                </div>
              </div>
            )}

            {/* Missiles */}
            {category.id === 'missiles' && (
              <div className="space-y-2.5">
                <StatBar label="Dégâts" value={item.stats.damage} max={130000} color="bg-red-500" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Rayon de souffle</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.blastRadius} m</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Vitesse</p>
                    <p className="text-sm font-semibold text-slate-200">{item.stats.speed} m/s</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Portée verrouillage</p>
                    <p className="text-sm font-semibold text-slate-200">{(item.stats.lockRange / 1000).toFixed(1)} km</p>
                  </div>
                  <div className="bg-space-800 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">Guidage</p>
                    <p className={clsx('text-sm font-semibold', MISSILE_TYPE_CONFIG[item.stats.signalType]?.color)}>
                      {MISSILE_TYPE_CONFIG[item.stats.signalType]?.label}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Carte composant ──────────────────────────────────────────────────────
function ComponentCard({ item, category, onSelect }) {
  const grade = GRADE_CONFIG[item.grade];
  const Icon = CAT_ICONS[category.id] || Zap;
  const mainStatValue = item.stats?.[category.mainStat] ?? 0;
  const mainStatPct = Math.min(100, Math.round((mainStatValue / category.mainStatMax) * 100));
  const displayMain = category.id === 'quantum'
    ? mainStatValue.toFixed(3)
    : mainStatValue.toLocaleString('fr-FR');

  return (
    <button
      onClick={() => onSelect(item)}
      className="card p-4 border border-space-400/20 hover:border-space-300/40 text-left transition-all hover:shadow-lg group w-full"
    >
      {/* Header de la carte */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', grade?.bg)}>
            <Icon className={clsx('w-4 h-4', category.color)} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">
              {item.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{item.manufacturer}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded border', grade?.color, grade?.bg, grade?.border)}>
            {item.grade}
          </span>
          <span className="text-xs text-slate-500 bg-space-700 px-1.5 py-0.5 rounded">S{item.size}</span>
        </div>
      </div>

      {/* Badges type (missiles / shields) */}
      {item.type && category.id === 'missiles' && (
        <div className="mb-2">
          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', MISSILE_TYPE_CONFIG[item.type]?.bg, MISSILE_TYPE_CONFIG[item.type]?.color)}>
            {MISSILE_TYPE_CONFIG[item.type]?.label}
          </span>
        </div>
      )}
      {item.type && category.id === 'shields' && (
        <div className="mb-2">
          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', SHIELD_TYPE_CONFIG[item.type]?.bg, SHIELD_TYPE_CONFIG[item.type]?.color)}>
            {SHIELD_TYPE_CONFIG[item.type]?.label}
          </span>
        </div>
      )}

      {/* Stat principale avec barre */}
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">{category.mainStatLabel}</span>
          <span className={clsx('font-semibold', category.color)}>
            {displayMain} {category.mainStatUnit}
          </span>
        </div>
        <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', {
              'bg-cyan-500':   category.id === 'shields',
              'bg-yellow-500': category.id === 'power',
              'bg-blue-500':   category.id === 'quantum',
              'bg-sky-500':    category.id === 'coolers',
              'bg-red-500':    category.id === 'missiles',
            })}
            style={{ width: `${mainStatPct}%` }}
          />
        </div>
      </div>

      {/* Prix */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-space-400/10">
        <span className="text-xs text-slate-600">{formatCredits(item.price)}</span>
        <span className="text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Détails →
        </span>
      </div>
    </button>
  );
}

// ─── Ligne de tableau ─────────────────────────────────────────────────────
function TableRow({ item, category, onSelect }) {
  const grade = GRADE_CONFIG[item.grade];
  const mainStatValue = item.stats?.[category.mainStat] ?? 0;
  const displayMain = category.id === 'quantum'
    ? mainStatValue.toFixed(3) + ' ' + category.mainStatUnit
    : mainStatValue.toLocaleString('fr-FR') + (category.mainStatUnit ? ' ' + category.mainStatUnit : '');

  return (
    <tr
      className="border-b border-space-400/10 hover:bg-space-700/30 cursor-pointer transition-colors"
      onClick={() => onSelect(item)}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', grade?.dot)} />
          <span className="text-sm font-medium text-slate-200">{item.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-xs text-slate-500">{item.manufacturer}</span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className="text-xs bg-space-700 text-slate-300 px-1.5 py-0.5 rounded">S{item.size}</span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <span className={clsx('text-xs font-bold', grade?.color)}>{item.grade}</span>
      </td>
      <td className="px-3 py-2.5">
        <span className={clsx('text-sm font-semibold', category.color)}>{displayMain}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-xs text-slate-500">{formatCredits(item.price)}</span>
      </td>
    </tr>
  );
}

// ─── Tracteur Beams View ──────────────────────────────────────────────────

function StatBarSimple({ label, value, max, color = 'bg-cyan-500', unit = '', fmt }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const display = fmt ? fmt(value) : value.toLocaleString('fr-FR');
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-0.5">
        <span>{label}</span>
        <span className="text-slate-300">{display}{unit}</span>
      </div>
      <div className="h-1.5 bg-space-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TractorTypeTag({ type }) {
  const cfg = TRACTOR_TYPE_CONFIG[type] || { label: type, color: 'text-slate-400', bg: 'bg-slate-800/30', border: 'border-slate-600/40' };
  return (
    <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium border', cfg.bg, cfg.color, cfg.border)}>
      {cfg.label}
    </span>
  );
}

function TractorCard({ tb, onSelect }) {
  const typeConfig = TRACTOR_TYPE_CONFIG[tb.type] || {};
  const forceKN = Math.round(tb.force / 1000);
  return (
    <button
      onClick={() => onSelect(tb)}
      className="card p-4 border border-space-400/20 hover:border-space-300/40 text-left transition-all hover:shadow-lg group w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', typeConfig.bg || 'bg-space-700')}>
            <Magnet className={clsx('w-4 h-4', typeConfig.color || 'text-slate-400')} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">{tb.name}</p>
            <p className="text-xs text-slate-500 truncate">{tb.manufacturer}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <TractorTypeTag type={tb.type} />
          <span className="text-xs text-slate-500 bg-space-700 px-1.5 py-0.5 rounded">S{tb.size}</span>
        </div>
      </div>

      {/* Stats principales */}
      <div className="space-y-1.5 mt-2">
        <StatBarSimple
          label="Force"
          value={tb.force}
          max={1200000}
          color="bg-orange-500"
          fmt={v => `${Math.round(v / 1000)} kN`}
        />
        <StatBarSimple
          label="Portée"
          value={tb.range}
          max={90}
          color="bg-cyan-500"
          unit=" m"
        />
      </div>

      {/* Prix */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-space-400/10">
        <span className="text-xs text-slate-600">{formatCredits(tb.price)}</span>
        <span className="text-xs text-slate-500">Angle {tb.angle}° · {tb.powerDraw} EU/s</span>
      </div>
    </button>
  );
}

function TractorDetailPanel({ tb, onClose }) {
  if (!tb) return null;
  const typeConfig = TRACTOR_TYPE_CONFIG[tb.type] || {};
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-space-900 border-l border-space-400/20 h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-space-900 border-b border-space-400/20 p-4 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeConfig.bg || 'bg-space-700')}>
              <Magnet className={clsx('w-5 h-5', typeConfig.color || 'text-slate-400')} />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 leading-tight">{tb.name}</h2>
              <p className="text-xs text-slate-500">{tb.manufacturer}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-space-700 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-5">
          <div className="flex flex-wrap gap-2">
            <TractorTypeTag type={tb.type} />
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-space-700 border border-space-400/20 text-slate-300">Taille {tb.size}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold-900/20 border border-gold-500/20 text-gold-400">{formatCredits(tb.price)}</span>
            {tb.inGame && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/20 border border-green-700/30 text-green-400">In-Game</span>
            )}
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{tb.description}</p>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statistiques</h3>
            <div className="space-y-2.5">
              <StatBarSimple label="Force" value={tb.force} max={1200000} color="bg-orange-500" fmt={v => `${Math.round(v / 1000)} kN`} />
              <StatBarSimple label="Portée" value={tb.range} max={90} color="bg-cyan-500" unit=" m" />
              <StatBarSimple label="Angle cône" value={tb.angle} max={35} color="bg-blue-500" unit="°" />
              <StatBarSimple label="Conso. puissance" value={tb.powerDraw} max={180} color="bg-red-500" unit=" EU/s" />
            </div>
          </div>

          {tb.compatible && tb.compatible.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vaisseaux compatibles</h3>
              <div className="flex flex-wrap gap-1.5">
                {tb.compatible.map(ship => (
                  <span key={ship} className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-space-700 text-slate-300 border border-space-400/20">{ship}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TractorBeamsView() {
  const [typeFilter, setTypeFilter]   = useState('Tous');
  const [sizeFilter, setSizeFilter]   = useState('all');
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('force');
  const [viewMode, setViewMode]       = useState('grid');
  const [selectedTB, setSelectedTB]   = useState(null);

  const filtered = useMemo(() => {
    let list = [...TRACTOR_BEAMS];
    if (typeFilter !== 'Tous')    list = list.filter(t => t.type === typeFilter);
    if (sizeFilter !== 'all')     list = list.filter(t => t.size === parseInt(sizeFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.manufacturer.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'force')      return b.force - a.force;
      if (sortBy === 'range')      return b.range - a.range;
      if (sortBy === 'price')      return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'size')       return a.size - b.size;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [typeFilter, sizeFilter, search, sortBy]);

  const types = ['Tous', 'Salvage', 'Cargo', 'Utility', 'Ship-mounted'];

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="p-3 rounded-xl border border-orange-500/20 bg-orange-900/10">
        <div className="flex items-start gap-2">
          <Magnet className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-300">
            <strong>Tracteur Beams</strong> — Faisceaux tracteurs pour salvage, cargo et utilitaires.
            La force (kN) détermine la taille des objets déplaçables, la portée la distance maximale d'action.
          </p>
        </div>
      </div>

      {/* Contrôles */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input w-full pl-9"
            />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input text-sm min-w-[140px]">
            {types.map(t => <option key={t} value={t}>{t === 'Tous' ? 'Tous types' : TRACTOR_TYPE_CONFIG[t]?.label || t}</option>)}
          </select>
          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="input text-sm min-w-[120px]">
            <option value="all">Toutes tailles</option>
            {[1, 2, 3].map(s => <option key={s} value={s}>Taille {s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input text-sm min-w-[160px]">
            <option value="force">Trier : Force ↓</option>
            <option value="range">Trier : Portée ↓</option>
            <option value="size">Trier : Taille</option>
            <option value="price">Trier : Prix ↑</option>
            <option value="price-desc">Trier : Prix ↓</option>
          </select>
          <div className="flex rounded-lg overflow-hidden border border-space-400/20">
            <button onClick={() => setViewMode('grid')} className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-slate-500 hover:text-slate-300')} title="Vue grille"><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={clsx('p-2 transition-colors', viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-slate-500 hover:text-slate-300')} title="Vue tableau"><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{filtered.length} tracteur beam{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <Magnet className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun tracteur beam trouvé</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(tb => <TractorCard key={tb.id} tb={tb} onSelect={setSelectedTB} />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20 bg-space-800/50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fabricant</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Taille</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Force (kN)</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Portée (m)</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Angle (°)</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tb => {
                  const typeConfig = TRACTOR_TYPE_CONFIG[tb.type] || {};
                  return (
                    <tr key={tb.id} className="border-b border-space-400/10 hover:bg-space-700/30 cursor-pointer transition-colors" onClick={() => setSelectedTB(tb)}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Magnet className={clsx('w-3.5 h-3.5 flex-shrink-0', typeConfig.color || 'text-slate-400')} />
                          <span className="text-sm font-medium text-slate-200">{tb.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><span className="text-xs text-slate-500">{tb.manufacturer}</span></td>
                      <td className="px-3 py-2.5 text-center"><TractorTypeTag type={tb.type} /></td>
                      <td className="px-3 py-2.5 text-center"><span className="text-xs bg-space-700 text-slate-300 px-1.5 py-0.5 rounded">S{tb.size}</span></td>
                      <td className="px-3 py-2.5 text-right"><span className="text-sm font-semibold text-orange-400">{Math.round(tb.force / 1000)}</span></td>
                      <td className="px-3 py-2.5 text-right"><span className="text-sm font-semibold text-cyan-400">{tb.range}</span></td>
                      <td className="px-3 py-2.5 text-right"><span className="text-sm text-slate-300">{tb.angle}</span></td>
                      <td className="px-3 py-2.5 text-right"><span className="text-xs text-slate-500">{formatCredits(tb.price)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panneau détail */}
      {selectedTB && <TractorDetailPanel tb={selectedTB} onClose={() => setSelectedTB(null)} />}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────
export default function ShipComponents() {
  const [activeCatId, setActiveCatId]     = useState('power');
  const [search, setSearch]               = useState('');
  const [sizeFilter, setSizeFilter]       = useState('all');
  const [gradeFilter, setGradeFilter]     = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [typeFilter, setTypeFilter]       = useState('all');
  const [sortBy, setSortBy]               = useState('grade');
  const [viewMode, setViewMode]           = useState('grid'); // 'grid' | 'table'
  const [selectedItem, setSelectedItem]   = useState(null);
  const [showFilters, setShowFilters]     = useState(false);

  const isTractorTab = activeCatId === 'tractor';

  const activeCategory = useMemo(
    () => isTractorTab ? null : COMPONENT_CATEGORIES.find(c => c.id === activeCatId),
    [activeCatId, isTractorTab]
  );

  // Fabricants disponibles pour la catégorie active
  const availableManufacturers = useMemo(() => {
    if (isTractorTab || !activeCategory) return [];
    const mfrs = [...new Set(activeCategory.data.map(i => i.manufacturer))].sort();
    return mfrs;
  }, [activeCategory, isTractorTab]);

  // Types disponibles (missiles / shields)
  const availableTypes = useMemo(() => {
    if (isTractorTab) return [];
    if (activeCatId === 'missiles') return ['IR', 'EM', 'CS'];
    if (activeCatId === 'shields')  return ['FR', 'EM', 'CV', 'MT'];
    return [];
  }, [activeCatId, isTractorTab]);

  // Reset filters on category change
  const handleCategoryChange = (catId) => {
    setActiveCatId(catId);
    setSearch('');
    setSizeFilter('all');
    setGradeFilter('all');
    setManufacturerFilter('all');
    setTypeFilter('all');
    setSortBy('grade');
    setSelectedItem(null);
  };

  const filtered = useMemo(() => {
    if (isTractorTab || !activeCategory) return [];
    let list = [...activeCategory.data];

    if (sizeFilter !== 'all')         list = list.filter(i => i.size === parseInt(sizeFilter));
    if (gradeFilter !== 'all')        list = list.filter(i => i.grade === gradeFilter);
    if (manufacturerFilter !== 'all') list = list.filter(i => i.manufacturer === manufacturerFilter);
    if (typeFilter !== 'all' && (activeCatId === 'missiles' || activeCatId === 'shields')) {
      list = list.filter(i => i.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.manufacturer.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'name')      return a.name.localeCompare(b.name);
      if (sortBy === 'price')     return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'size')      return a.size - b.size;
      if (sortBy === 'grade')     return a.grade.localeCompare(b.grade);
      if (sortBy === 'mainstat')  return (b.stats?.[activeCategory.mainStat] ?? 0) - (a.stats?.[activeCategory.mainStat] ?? 0);
      return 0;
    });

    return list;
  }, [activeCategory, sizeFilter, gradeFilter, manufacturerFilter, typeFilter, search, sortBy, activeCatId]);

  // Stats globales
  const totalComponents = COMPONENT_CATEGORIES.reduce((sum, c) => sum + c.data.length, 0);
  const totalManufacturers = new Set(
    COMPONENT_CATEGORIES.flatMap(c => c.data.map(i => i.manufacturer))
  ).size;

  const activeFiltersCount = isTractorTab ? 0 : [
    sizeFilter !== 'all',
    gradeFilter !== 'all',
    manufacturerFilter !== 'all',
    typeFilter !== 'all',
    search.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gradient-cyan">Composants Vaisseaux</h1>
          <p className="page-subtitle">Base de données des composants équipables — Alpha 4.6</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">{totalComponents} composants</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
            <Factory className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-slate-300">{totalManufacturers} fabricants</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">{COMPONENT_CATEGORIES.length} catégories</span>
          </div>
        </div>
      </div>

      {/* ── Tabs catégories ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {COMPONENT_CATEGORIES.map((cat) => {
          const Icon = CAT_ICONS[cat.id] || Zap;
          const isActive = activeCatId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                isActive
                  ? `${cat.bgColor} ${cat.borderColor} ${cat.color}`
                  : 'bg-space-700/50 border-space-400/20 text-slate-400 hover:border-space-300/30 hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span className={clsx(
                'text-xs px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/10' : 'bg-space-600'
              )}>
                {cat.data.length}
              </span>
            </button>
          );
        })}
        {/* Onglet Tracteur Beams */}
        <button
          onClick={() => handleCategoryChange('tractor')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
            isTractorTab
              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
              : 'bg-space-700/50 border-space-400/20 text-slate-400 hover:border-space-300/30 hover:text-slate-200'
          )}
        >
          <Magnet className="w-4 h-4" />
          <span>Tracteur Beams</span>
          <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', isTractorTab ? 'bg-white/10' : 'bg-space-600')}>
            {TRACTOR_BEAMS.length}
          </span>
        </button>
      </div>

      {/* ── Description catégorie ────────────────────────────────────── */}
      {!isTractorTab && activeCategory && (
        <div className={clsx('p-3 rounded-xl border', activeCategory.bgColor, activeCategory.borderColor)}>
          <p className={clsx('text-sm font-medium', activeCategory.color)}>
            {activeCategory.label} — {activeCategory.description}
          </p>
        </div>
      )}

      {/* ── Tracteur Beams Tab ──────────────────────────────────────── */}
      {isTractorTab && <TractorBeamsView />}

      {/* ── Barre de contrôles (composants standards) ───────────────── */}
      {!isTractorTab && activeCategory && <div className="card p-4 space-y-3" key="controls-bar">
        {/* Recherche + boutons */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Rechercher dans ${activeCategory.label}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input w-full pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              showFilters || activeFiltersCount > 0
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-space-700 border-space-400/20 text-slate-400 hover:border-space-300/30'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {/* Toggle vue grille/tableau */}
          <div className="flex rounded-lg overflow-hidden border border-space-400/20">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-slate-500 hover:text-slate-300')}
              title="Vue grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={clsx('p-2 transition-colors', viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-slate-500 hover:text-slate-300')}
              title="Vue tableau"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtres dépliables */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-space-400/10">
            {/* Taille */}
            <select
              value={sizeFilter}
              onChange={e => setSizeFilter(e.target.value)}
              className="input text-sm min-w-[130px]"
            >
              <option value="all">Toutes tailles</option>
              {[1, 2, 3, 4, 5].map(s => (
                <option key={s} value={s}>Taille {s}</option>
              ))}
            </select>

            {/* Grade */}
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="input text-sm min-w-[130px]"
            >
              <option value="all">Tous grades</option>
              {Object.entries(GRADE_CONFIG).map(([g, info]) => (
                <option key={g} value={g}>{info.label}</option>
              ))}
            </select>

            {/* Fabricant */}
            <select
              value={manufacturerFilter}
              onChange={e => setManufacturerFilter(e.target.value)}
              className="input text-sm min-w-[180px]"
            >
              <option value="all">Tous fabricants</option>
              {availableManufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Type (missiles / shields) */}
            {availableTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="input text-sm min-w-[150px]"
              >
                <option value="all">Tous types</option>
                {availableTypes.map(t => {
                  const cfg = activeCatId === 'missiles' ? MISSILE_TYPE_CONFIG[t] : SHIELD_TYPE_CONFIG[t];
                  return <option key={t} value={t}>{cfg?.label || t}</option>;
                })}
              </select>
            )}

            {/* Tri */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input text-sm min-w-[180px]"
            >
              <option value="grade">Trier : Grade (A→D)</option>
              <option value="mainstat">Trier : {activeCategory.mainStatLabel} ↓</option>
              <option value="name">Trier : Nom A→Z</option>
              <option value="size">Trier : Taille</option>
              <option value="price">Trier : Prix ↑</option>
              <option value="price-desc">Trier : Prix ↓</option>
            </select>

            {/* Reset */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSizeFilter('all');
                  setGradeFilter('all');
                  setManufacturerFilter('all');
                  setTypeFilter('all');
                  setSearch('');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Effacer tout
              </button>
            )}
          </div>
        )}
      </div>}

      {/* ── Résultats ───────────────────────────────────────────────── */}
      {!isTractorTab && activeCategory && <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && (
              <span className="text-slate-600 ml-1">
                (sur {activeCategory.data.length})
              </span>
            )}
          </span>
          {/* Légende grades */}
          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(GRADE_CONFIG).map(([g, cfg]) => (
              <div key={g} className="flex items-center gap-1">
                <span className={clsx('w-2 h-2 rounded-full', cfg.dot)} />
                <span className={clsx('text-xs font-medium', cfg.color)}>{g}</span>
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Aucun composant trouvé</p>
            <p className="text-slate-600 text-sm mt-1">Modifiez vos filtres ou votre recherche</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(item => (
              <ComponentCard
                key={item.id}
                item={item}
                category={activeCategory}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-space-400/20 bg-space-800/50">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fabricant</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Taille</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {activeCategory.mainStatLabel}
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <TableRow
                      key={item.id}
                      item={item}
                      category={activeCategory}
                      onSelect={setSelectedItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>}

      {/* ── Panneau latéral détail ───────────────────────────────────── */}
      {!isTractorTab && selectedItem && (
        <DetailPanel
          item={selectedItem}
          category={activeCategory}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
