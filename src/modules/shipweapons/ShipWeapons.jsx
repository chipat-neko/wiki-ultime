import React, { useState, useMemo } from 'react';
import { SHIP_WEAPONS, WEAPON_TYPES, MANUFACTURERS } from '../../datasets/shipweapons.js';
import {
  Zap,
  Target,
  Shield,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  TrendingUp,
  Crosshair,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Constantes ──────────────────────────────────────────────────────────────

const CLASS_STYLES = {
  energy: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    bar: 'bg-cyan-400',
    icon: Zap,
  },
  ballistic: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    bar: 'bg-orange-400',
    icon: Target,
  },
  distortion: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    bar: 'bg-purple-400',
    icon: Radio,
  },
};

const SORT_OPTIONS = [
  { value: 'dps-desc', label: 'DPS décroissant' },
  { value: 'dps-asc', label: 'DPS croissant' },
  { value: 'size-asc', label: 'Taille croissante' },
  { value: 'size-desc', label: 'Taille décroissante' },
  { value: 'range-desc', label: 'Portée décroissante' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDps(dps) {
  if (dps >= 1000000) return `${(dps / 1000000).toFixed(1)}M`;
  if (dps >= 1000) return `${(dps / 1000).toFixed(1)}k`;
  return dps.toString();
}

function formatRange(range) {
  if (range >= 999000) return '∞';
  if (range >= 1000) return `${(range / 1000).toFixed(1)}km`;
  return `${range}m`;
}

function formatPrice(price) {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
  return price.toString();
}

function getAlphaPrimary(w) {
  if (w.class === 'distortion') return w.stats.alphaDist;
  if (w.class === 'ballistic') return w.stats.alphaPhys;
  return w.stats.alphaEm;
}

// ─── Composant StatBar ────────────────────────────────────────────────────────

function StatBar({ value, max, colorClass, label, formatted }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={colorClass}>{formatted || value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', colorClass.replace('text-', 'bg-'))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Composant WeaponCard ─────────────────────────────────────────────────────

function WeaponCard({ weapon, isExpanded, onToggle, maxDps }) {
  const cs = CLASS_STYLES[weapon.class];
  const ClassIcon = cs.icon;
  const alpha = getAlphaPrimary(weapon);

  return (
    <div
      className={clsx(
        'rounded-xl border transition-all duration-200',
        cs.bg,
        cs.border,
        isExpanded && 'ring-1 ring-offset-0',
        isExpanded && cs.border
      )}
    >
      {/* Header card */}
      <button
        className="w-full text-left p-4"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cs.bg, 'border', cs.border)}>
              <ClassIcon className={clsx('w-4 h-4', cs.text)} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white text-sm truncate">{weapon.name}</div>
              <div className="text-xs text-slate-400">{weapon.manufacturer}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!weapon.inGame && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                Prévu
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className={clsx('px-2 py-0.5 rounded text-xs font-mono font-bold', cs.badge)}>
            S{weapon.size}
          </span>
          <span className={clsx('px-2 py-0.5 rounded text-xs', cs.badge)}>
            {weapon.type}
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-space-700 text-slate-300 border border-space-400/20">
            Grade {weapon.grade}
          </span>
        </div>

        {/* Stats résumé */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center">
            <div className={clsx('text-base font-bold font-mono', cs.text)}>{formatDps(weapon.stats.dps)}</div>
            <div className="text-xs text-slate-500">DPS</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold font-mono text-slate-200">{formatRange(weapon.stats.range)}</div>
            <div className="text-xs text-slate-500">Portée</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold font-mono text-slate-200">{weapon.stats.rpm}</div>
            <div className="text-xs text-slate-500">RPM</div>
          </div>
        </div>
      </button>

      {/* Détails expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-space-400/10 pt-4 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">{weapon.description}</p>

          {/* Barre DPS comparée */}
          <div>
            <StatBar
              value={weapon.stats.dps}
              max={maxDps}
              colorClass={cs.text}
              label="DPS (vs max catégorie)"
              formatted={formatDps(weapon.stats.dps)}
            />
          </div>

          {/* Stats détaillées */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Alpha</span>
              <span className={cs.text}>{alpha.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">RPM</span>
              <span className="text-slate-200">{weapon.stats.rpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Portée</span>
              <span className="text-slate-200">{formatRange(weapon.stats.range)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Énergie/s</span>
              <span className="text-yellow-400">{weapon.stats.powerDraw} EU/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Chaleur/tir</span>
              <span className="text-orange-400">{weapon.stats.heatPerShot}</span>
            </div>
            {weapon.stats.ammoCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Munitions</span>
                <span className="text-slate-200">{weapon.stats.ammoCount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Prix</span>
              <span className="text-gold-400 text-yellow-400">{formatPrice(weapon.price)} aUEC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Classe</span>
              <span className={cs.text}>{weapon.class}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant TableRow ───────────────────────────────────────────────────────

function TableRow({ weapon, isExpanded, onToggle, maxDps }) {
  const cs = CLASS_STYLES[weapon.class];
  const ClassIcon = cs.icon;
  const alpha = getAlphaPrimary(weapon);

  return (
    <>
      <tr
        className={clsx(
          'border-b border-space-400/10 transition-colors cursor-pointer',
          isExpanded ? clsx(cs.bg) : 'hover:bg-space-800/50'
        )}
        onClick={onToggle}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <ClassIcon className={clsx('w-3.5 h-3.5 flex-shrink-0', cs.text)} />
            <span className="text-sm text-white font-medium">{weapon.name}</span>
            {!weapon.inGame && (
              <span className="px-1 py-0 rounded text-xs bg-yellow-500/15 text-yellow-400">Prévu</span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-400">{weapon.manufacturer}</td>
        <td className="px-3 py-2.5">
          <span className={clsx('px-1.5 py-0.5 rounded text-xs font-mono font-bold', cs.badge)}>
            S{weapon.size}
          </span>
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-300">{weapon.type}</td>
        <td className={clsx('px-3 py-2.5 text-sm font-mono font-bold', cs.text)}>
          {formatDps(weapon.stats.dps)}
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-300">{formatRange(weapon.stats.range)}</td>
        <td className="px-3 py-2.5 text-xs text-slate-300">{weapon.stats.rpm}</td>
        <td className="px-3 py-2.5 text-xs text-yellow-400">{formatPrice(weapon.price)} aUEC</td>
        <td className="px-3 py-2.5">
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className={clsx('border-b border-space-400/10', cs.bg)}>
          <td colSpan={9} className="px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Description</div>
                <p className="text-xs text-slate-300 leading-relaxed">{weapon.description}</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Alpha</span>
                  <span className={cs.text}>{alpha.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Énergie/s</span>
                  <span className="text-yellow-400">{weapon.stats.powerDraw} EU/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chaleur/tir</span>
                  <span className="text-orange-400">{weapon.stats.heatPerShot}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                {weapon.stats.ammoCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Munitions</span>
                    <span className="text-slate-200">{weapon.stats.ammoCount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade</span>
                  <span className="text-slate-200">{weapon.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classe</span>
                  <span className={cs.text}>{weapon.class}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">DPS relatif</div>
                <div className="h-2 bg-space-700 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full', cs.bar)}
                    style={{ width: `${Math.min(100, (weapon.stats.dps / maxDps) * 100)}%` }}
                  />
                </div>
                <div className={clsx('text-xs mt-1 font-mono', cs.text)}>
                  {((weapon.stats.dps / maxDps) * 100).toFixed(1)}% du max
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ShipWeapons() {
  const [search, setSearch] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [sortBy, setSortBy] = useState('dps-desc');
  const [view, setView] = useState('grid'); // 'grid' | 'table'
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  // Tailles disponibles
  const availableSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Filtrage + tri
  const filtered = useMemo(() => {
    let list = [...SHIP_WEAPONS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        w =>
          w.name.toLowerCase().includes(q) ||
          w.manufacturer.toLowerCase().includes(q) ||
          w.type.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q)
      );
    }

    if (selectedSizes.length > 0) {
      list = list.filter(w => selectedSizes.includes(w.size));
    }

    if (selectedType) {
      list = list.filter(w => w.type === selectedType);
    }

    if (selectedClass) {
      list = list.filter(w => w.class === selectedClass);
    }

    if (selectedManufacturer) {
      list = list.filter(w => w.manufacturer === selectedManufacturer);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'dps-desc': return b.stats.dps - a.stats.dps;
        case 'dps-asc': return a.stats.dps - b.stats.dps;
        case 'size-asc': return a.size - b.size;
        case 'size-desc': return b.size - a.size;
        case 'range-desc': return b.stats.range - a.stats.range;
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

    return list;
  }, [search, selectedSizes, selectedType, selectedClass, selectedManufacturer, sortBy]);

  const maxDps = useMemo(
    () => Math.max(...SHIP_WEAPONS.map(w => w.stats.dps)),
    []
  );

  // Stats globales
  const totalEnergy = SHIP_WEAPONS.filter(w => w.class === 'energy').length;
  const totalBallistic = SHIP_WEAPONS.filter(w => w.class === 'ballistic').length;
  const totalDistortion = SHIP_WEAPONS.filter(w => w.class === 'distortion').length;
  const inGameCount = SHIP_WEAPONS.filter(w => w.inGame).length;

  // Toggle taille
  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Fabricants uniques
  const uniqueManufacturers = [...new Set(SHIP_WEAPONS.map(w => w.manufacturer))].sort();

  // Types uniques
  const uniqueTypes = [...new Set(SHIP_WEAPONS.map(w => w.type))].sort();

  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSizes([]);
    setSelectedType('');
    setSelectedClass('');
    setSelectedManufacturer('');
    setSortBy('dps-desc');
  };

  const hasActiveFilters =
    search || selectedSizes.length > 0 || selectedType || selectedClass || selectedManufacturer;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Crosshair className="w-7 h-7 text-cyan-400" />
            Armes de Vaisseaux
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Base de données complète des armements vaisseau — S1 à S9, toutes classes
          </p>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-space-800 border border-space-400/20 text-xs">
            <span className="text-slate-400">Total </span>
            <span className="text-white font-bold">{SHIP_WEAPONS.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-xs">
            <Zap className="w-3 h-3 inline mr-1 text-cyan-400" />
            <span className="text-cyan-300 font-bold">{totalEnergy}</span>
            <span className="text-slate-400"> énergie</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/25 text-xs">
            <Target className="w-3 h-3 inline mr-1 text-orange-400" />
            <span className="text-orange-300 font-bold">{totalBallistic}</span>
            <span className="text-slate-400"> balist.</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-xs">
            <Radio className="w-3 h-3 inline mr-1 text-purple-400" />
            <span className="text-purple-300 font-bold">{totalDistortion}</span>
            <span className="text-slate-400"> distor.</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-xs">
            <span className="text-green-400 font-bold">{inGameCount}</span>
            <span className="text-slate-400"> in-game</span>
          </div>
        </div>
      </div>

      {/* ── Barre de contrôles ── */}
      <div className="bg-space-800 rounded-xl border border-space-400/20 p-4 space-y-4">
        {/* Ligne 1 : recherche + toggle filtres + vues */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une arme, fabricant, type..."
              className="w-full pl-9 pr-4 py-2 bg-space-700 border border-space-400/25 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(f => !f)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
                showFilters
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                  : 'bg-space-700 border-space-400/25 text-slate-400 hover:text-slate-200'
              )}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 ml-0.5" />
              )}
            </button>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-space-700 border border-space-400/25 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Vues */}
            <div className="flex rounded-lg overflow-hidden border border-space-400/25">
              <button
                onClick={() => setView('grid')}
                className={clsx(
                  'px-3 py-2 transition-colors',
                  view === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-space-700 text-slate-400 hover:text-slate-200'
                )}
                title="Vue grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={clsx(
                  'px-3 py-2 transition-colors border-l border-space-400/25',
                  view === 'table'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-space-700 text-slate-400 hover:text-slate-200'
                )}
                title="Vue tableau"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Ligne 2 : filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-space-400/10">
            {/* Tailles */}
            <div>
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Taille</div>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-xs font-mono font-bold border transition-colors',
                      selectedSizes.includes(size)
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-space-700 border-space-400/20 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Type</div>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-3 py-1.5 bg-space-700 border border-space-400/25 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Tous les types</option>
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Classe */}
            <div>
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Classe</div>
              <div className="flex gap-2">
                {[
                  { value: '', label: 'Toutes' },
                  { value: 'energy', label: 'Energy', cs: CLASS_STYLES.energy },
                  { value: 'ballistic', label: 'Ballistic', cs: CLASS_STYLES.ballistic },
                  { value: 'distortion', label: 'Distortion', cs: CLASS_STYLES.distortion },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedClass(opt.value)}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      selectedClass === opt.value
                        ? opt.cs
                          ? clsx(opt.cs.bg, opt.cs.border, opt.cs.text)
                          : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                        : 'bg-space-700 border-space-400/20 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabricant */}
            <div>
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Fabricant</div>
              <select
                value={selectedManufacturer}
                onChange={e => setSelectedManufacturer(e.target.value)}
                className="w-full px-3 py-1.5 bg-space-700 border border-space-400/25 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Tous les fabricants</option>
                {uniqueManufacturers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Résultats + reset */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            <span className="text-slate-300 font-medium">{filtered.length}</span> arme{filtered.length !== 1 ? 's' : ''} affichée{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== SHIP_WEAPONS.length && (
              <span className="text-slate-500"> / {SHIP_WEAPONS.length} total</span>
            )}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* ── Légende classes ── */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CLASS_STYLES).map(([cls, cs]) => {
          const Icon = cs.icon;
          return (
            <div key={cls} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs', cs.bg, cs.border)}>
              <Icon className={clsx('w-3.5 h-3.5', cs.text)} />
              <span className={cs.text}>{cls.charAt(0).toUpperCase() + cls.slice(1)}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs bg-yellow-500/10 border-yellow-500/25">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-300">Prévu = pas encore in-game</span>
        </div>
      </div>

      {/* ── Contenu ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Crosshair className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <div className="text-lg font-medium text-slate-400 mb-2">Aucune arme trouvée</div>
          <div className="text-sm">Essayez de modifier vos filtres ou votre recherche.</div>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-cyan-500/15 border border-cyan-500/25 rounded-lg text-cyan-300 text-sm hover:bg-cyan-500/20 transition-colors"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : view === 'grid' ? (
        /* ── Vue grille ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(weapon => (
            <WeaponCard
              key={weapon.id}
              weapon={weapon}
              isExpanded={expandedId === weapon.id}
              onToggle={() => handleToggleExpand(weapon.id)}
              maxDps={maxDps}
            />
          ))}
        </div>
      ) : (
        /* ── Vue tableau ── */
        <div className="bg-space-800 rounded-xl border border-space-400/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20 bg-space-900/50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Fabricant</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Taille</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">DPS</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Portée</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">RPM</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Prix</th>
                  <th className="px-3 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(weapon => (
                  <TableRow
                    key={weapon.id}
                    weapon={weapon}
                    isExpanded={expandedId === weapon.id}
                    onToggle={() => handleToggleExpand(weapon.id)}
                    maxDps={maxDps}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Section fabricants ── */}
      <div className="bg-space-800 rounded-xl border border-space-400/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Fabricants d'Armes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MANUFACTURERS.map(mfr => {
            const count = SHIP_WEAPONS.filter(w => w.manufacturer === mfr.name).length;
            return (
              <button
                key={mfr.id}
                onClick={() => setSelectedManufacturer(mfr.name === selectedManufacturer ? '' : mfr.name)}
                className={clsx(
                  'text-left p-3 rounded-lg border transition-colors',
                  selectedManufacturer === mfr.name
                    ? 'bg-cyan-500/15 border-cyan-500/30'
                    : 'bg-space-700/50 border-space-400/15 hover:border-space-400/30'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{mfr.name}</span>
                  <span className="text-xs text-slate-500">{count} arme{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="text-xs text-slate-400">{mfr.specialty}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section types d'armes ── */}
      <div className="bg-space-800 rounded-xl border border-space-400/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Types d'Armes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {WEAPON_TYPES.map(wt => {
            const cs = CLASS_STYLES[wt.class];
            const count = SHIP_WEAPONS.filter(w => w.type === wt.label).length;
            return (
              <button
                key={wt.id}
                onClick={() => setSelectedType(wt.label === selectedType ? '' : wt.label)}
                className={clsx(
                  'text-left p-3 rounded-lg border transition-colors',
                  selectedType === wt.label
                    ? clsx(cs.bg, cs.border)
                    : 'bg-space-700/50 border-space-400/15 hover:border-space-400/30'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('text-sm font-medium', selectedType === wt.label ? cs.text : 'text-white')}>
                    {wt.label}
                  </span>
                  <span className="text-xs text-slate-500">{count}</span>
                </div>
                <div className="text-xs text-slate-400">{wt.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
