import React, { useState, useMemo, useRef } from 'react';
import { SHIPS } from '../../datasets/ships.js';
import { formatCredits } from '../../utils/formatters.js';
import {
  Ruler, Plus, X, Search, ArrowUpDown, ChevronDown,
  Rocket, Package, Users, Gauge, DollarSign, Scale,
  BarChart3, Layers, Info, RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Dimensions réelles (mètres / kg) pour ~30 vaisseaux populaires ─────────
const SHIP_DIMENSIONS = {
  'rsi-aurora-mr':              { length: 18.5,  beam: 8.2,   height: 4.2,   mass: 25172 },
  'aegis-avenger-titan':        { length: 23.0,  beam: 16.5,  height: 5.5,   mass: 36040 },
  'aegis-gladius':              { length: 20.0,  beam: 17.5,  height: 5.5,   mass: 32060 },
  'cnou-mustang-alpha':         { length: 18.0,  beam: 11.0,  height: 5.5,   mass: 21510 },
  'anvil-arrow':                { length: 16.0,  beam: 12.0,  height: 4.0,   mass: 28730 },
  'origin-300i':                { length: 27.0,  beam: 16.0,  height: 8.0,   mass: 42980 },
  'drake-cutlass-black':        { length: 29.0,  beam: 26.0,  height: 10.0,  mass: 74400 },
  'misc-freelancer':            { length: 32.0,  beam: 15.0,  height: 9.5,   mass: 90560 },
  'misc-freelancer-max':        { length: 38.0,  beam: 15.0,  height: 9.5,   mass: 101000 },
  'anvil-f7c-hornet':           { length: 22.5,  beam: 21.5,  height: 6.0,   mass: 51520 },
  'aegis-sabre':                { length: 26.0,  beam: 18.0,  height: 5.0,   mass: 47500 },
  'rsi-constellation-andromeda':{ length: 61.2,  beam: 26.0,  height: 14.0,  mass: 360000 },
  'rsi-constellation-taurus':   { length: 61.2,  beam: 26.0,  height: 14.0,  mass: 380000 },
  'drake-caterpillar':          { length: 110.0, beam: 30.0,  height: 14.0,  mass: 546000 },
  'misc-starfarer':             { length: 102.0, beam: 52.0,  height: 25.0,  mass: 760000 },
  'anvil-carrack':              { length: 126.5, beam: 78.0,  height: 29.0,  mass: 885000 },
  'aegis-hammerhead':           { length: 116.0, beam: 72.0,  height: 18.0,  mass: 980000 },
  'aegis-reclaimer':            { length: 158.0, beam: 74.0,  height: 46.0,  mass: 1200000 },
  'origin-890-jump':            { length: 123.0, beam: 72.4,  height: 26.0,  mass: 1400000 },
  'crusader-hercules-c2':       { length: 89.0,  beam: 69.0,  height: 17.0,  mass: 600000 },
  'crusader-hercules-m2':       { length: 89.0,  beam: 69.0,  height: 17.0,  mass: 650000 },
  'misc-prospector':            { length: 24.0,  beam: 18.0,  height: 9.0,   mass: 67650 },
  'drake-vulture':              { length: 32.0,  beam: 32.0,  height: 11.0,  mass: 85200 },
  'aegis-vanguard-warden':      { length: 38.0,  beam: 30.0,  height: 8.5,   mass: 120000 },
  'aegis-eclipse':              { length: 30.0,  beam: 25.5,  height: 5.5,   mass: 53400 },
  'anvil-valkyrie':             { length: 38.0,  beam: 25.5,  height: 9.5,   mass: 200000 },
  'aegis-redeemer':             { length: 40.0,  beam: 28.5,  height: 10.0,  mass: 224000 },
  'misc-mercury-star-runner':   { length: 56.0,  beam: 40.0,  height: 12.0,  mass: 180000 },
  'drake-corsair':              { length: 52.5,  beam: 48.0,  height: 14.0,  mass: 164000 },
  'crusader-ares-inferno':      { length: 28.5,  beam: 25.0,  height: 7.0,   mass: 95000 },
  'argo-mole':                  { length: 42.0,  beam: 25.0,  height: 18.0,  mass: 310000 },
  'origin-m50':                 { length: 14.0,  beam: 11.5,  height: 3.5,   mass: 16450 },
  'cnou-nomad':                 { length: 21.0,  beam: 14.0,  height: 7.0,   mass: 38600 },
  'mirai-fury-mx':              { length: 10.5,  beam: 6.0,   height: 3.0,   mass: 8500 },
  'drake-cutter':               { length: 12.0,  beam: 7.5,   height: 4.5,   mass: 12800 },
  'rsi-polaris':                { length: 155.0, beam: 82.0,  height: 35.0,  mass: 2600000 },
  'rsi-perseus':                { length: 101.5, beam: 50.0,  height: 20.0,  mass: 1850000 },
  'origin-600i':                { length: 91.5,  beam: 52.0,  height: 18.0,  mass: 530000 },
  'drake-ironclad':             { length: 75.0,  beam: 42.0,  height: 18.0,  mass: 480000 },
};

// ─── Catégories de taille ────────────────────────────────────────────────────
const SIZE_CATEGORIES = [
  { key: 'all',     label: 'Toutes' },
  { key: 'Nain',    label: 'Nain' },
  { key: 'Petit',   label: 'Petit' },
  { key: 'Moyen',   label: 'Moyen' },
  { key: 'Grand',   label: 'Grand' },
  { key: 'Capital', label: 'Capital' },
];

const SORT_OPTIONS = [
  { key: 'length', label: 'Longueur' },
  { key: 'mass',   label: 'Masse' },
  { key: 'cargo',  label: 'Cargo' },
  { key: 'price',  label: 'Prix' },
];

const SIZE_COLORS = {
  Nain:    { bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-400', fill: '#8b5cf6' },
  Petit:   { bg: 'bg-cyan-500/20',   border: 'border-cyan-500/40',   text: 'text-cyan-400',   fill: '#06b6d4' },
  Moyen:   { bg: 'bg-green-500/20',  border: 'border-green-500/40',  text: 'text-green-400',  fill: '#22c55e' },
  Grand:   { bg: 'bg-amber-500/20',  border: 'border-amber-500/40',  text: 'text-amber-400',  fill: '#f59e0b' },
  Capital: { bg: 'bg-red-500/20',    border: 'border-red-500/40',    text: 'text-red-400',    fill: '#ef4444' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtMass(kg) {
  if (!kg) return 'N/A';
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)} kt`;
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)} t`;
  return `${kg.toLocaleString('fr-FR')} kg`;
}

function fmtMeters(m) {
  return m != null ? `${m.toFixed(1)} m` : 'N/A';
}

// ─── Aurora reference for fun facts ──────────────────────────────────────────
const AURORA_LENGTH = 18.5;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function ShipSizeComparison() {
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sizeFilter, setSizeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('length');
  const dropdownRef = useRef(null);

  // Ships that have dimension data
  const shipsWithDimensions = useMemo(() =>
    SHIPS.filter(s => SHIP_DIMENSIONS[s.id]),
    []
  );

  // Enriched selected ships
  const enriched = useMemo(() =>
    selected.map(id => {
      const ship = SHIPS.find(s => s.id === id);
      const dims = SHIP_DIMENSIONS[id];
      return ship && dims ? { ...ship, dims } : null;
    }).filter(Boolean),
    [selected]
  );

  // Sorted enriched ships
  const sorted = useMemo(() => {
    const arr = [...enriched];
    arr.sort((a, b) => {
      switch (sortBy) {
        case 'length': return (b.dims.length || 0) - (a.dims.length || 0);
        case 'mass':   return (b.dims.mass || 0) - (a.dims.mass || 0);
        case 'cargo':  return (b.specs?.cargo || 0) - (a.specs?.cargo || 0);
        case 'price':  return (b.price || 0) - (a.price || 0);
        default: return 0;
      }
    });
    return arr;
  }, [enriched, sortBy]);

  // Max values for scale bars
  const maxVals = useMemo(() => ({
    length: Math.max(...sorted.map(s => s.dims.length || 0), 1),
    beam:   Math.max(...sorted.map(s => s.dims.beam || 0), 1),
    height: Math.max(...sorted.map(s => s.dims.height || 0), 1),
  }), [sorted]);

  // Dropdown list (filtered)
  const filteredList = useMemo(() => {
    let list = shipsWithDimensions;
    if (sizeFilter !== 'all') list = list.filter(s => s.size === sizeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.manufacturer.toLowerCase().includes(q)
      );
    }
    return list.filter(s => !selected.includes(s.id));
  }, [shipsWithDimensions, sizeFilter, searchQuery, selected]);

  // Fun facts
  const funFacts = useMemo(() => {
    if (sorted.length < 1) return [];
    const facts = [];
    if (sorted.length >= 2) {
      const longest = sorted[0];
      const shortest = sorted[sorted.length - 1];
      if (shortest.dims.length > 0) {
        const ratio = (longest.dims.length / shortest.dims.length).toFixed(1);
        facts.push(`Le ${longest.name} est ${ratio}× plus long que le ${shortest.name}`);
      }
    }
    sorted.forEach(s => {
      if (s.dims.length > AURORA_LENGTH * 1.5) {
        const auroras = (s.dims.length / AURORA_LENGTH).toFixed(1);
        facts.push(`Le ${s.name} pourrait contenir ${auroras} Aurora bout à bout`);
      }
    });
    if (sorted.length >= 2) {
      const heaviest = [...sorted].sort((a, b) => b.dims.mass - a.dims.mass)[0];
      const lightest = [...sorted].sort((a, b) => a.dims.mass - b.dims.mass)[0];
      if (lightest.dims.mass > 0 && heaviest.id !== lightest.id) {
        const ratio = Math.round(heaviest.dims.mass / lightest.dims.mass);
        facts.push(`Le ${heaviest.name} pèse ${ratio}× la masse du ${lightest.name}`);
      }
    }
    return facts;
  }, [sorted]);

  const addShip = (id) => {
    if (selected.length >= 5 || selected.includes(id)) return;
    setSelected(prev => [...prev, id]);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const removeShip = (id) => setSelected(prev => prev.filter(x => x !== id));
  const clearAll = () => { setSelected([]); setSearchQuery(''); };

  const colorForShip = (ship) => SIZE_COLORS[ship.size] || SIZE_COLORS.Petit;

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ruler className="w-7 h-7 text-cyan-400" />
            Comparaison de taille
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Comparez visuellement la taille de vos vaisseaux (jusqu'à 5)
          </p>
        </div>
        {selected.length > 0 && (
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 transition-colors">
            <RotateCcw className="w-4 h-4" /> Réinitialiser
          </button>
        )}
      </div>

      {/* ── Ship Selector ──────────────────────────────────────────────────── */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Sélection des vaisseaux ({selected.length}/5)
          </h2>
          {/* Size filter pills */}
          <div className="hidden sm:flex gap-1">
            {SIZE_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setSizeFilter(cat.key)}
                className={clsx('px-2 py-0.5 text-xs rounded-full border transition-colors',
                  sizeFilter === cat.key
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'border-gray-600/50 text-gray-500 hover:text-gray-300')}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-600/50 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={selected.length >= 5 ? 'Maximum 5 vaisseaux atteint' : 'Rechercher un vaisseau...'}
              value={searchQuery}
              disabled={selected.length >= 5}
              onChange={e => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder-gray-500 disabled:opacity-40"
            />
            <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', dropdownOpen && 'rotate-180')} />
          </div>

          {dropdownOpen && selected.length < 5 && (
            <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 border border-gray-600/50 rounded-lg shadow-xl">
              {filteredList.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">Aucun vaisseau trouvé</div>
              ) : filteredList.slice(0, 20).map(ship => {
                const c = colorForShip(ship);
                return (
                  <button key={ship.id} onClick={() => addShip(ship.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700/50 transition-colors text-left">
                    <Rocket className={clsx('w-4 h-4', c.text)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-white">{ship.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{ship.manufacturer}</span>
                    </div>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', c.bg, c.text)}>{ship.size}</span>
                    <span className="text-xs text-gray-500">{fmtMeters(SHIP_DIMENSIONS[ship.id].length)}</span>
                    <Plus className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {enriched.map(ship => {
              const c = colorForShip(ship);
              return (
                <span key={ship.id}
                  className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border', c.bg, c.border, c.text)}>
                  {ship.name}
                  <button onClick={() => removeShip(ship.id)} className="hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {sorted.length === 0 && (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-12 text-center">
          <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Ajoutez des vaisseaux pour comparer leurs tailles</p>
          <p className="text-sm text-gray-500 mt-1">
            {shipsWithDimensions.length} vaisseaux avec données dimensionnelles disponibles
          </p>
        </div>
      )}

      {sorted.length > 0 && (
        <>
          {/* Sort control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 uppercase">Trier par :</span>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => setSortBy(opt.key)}
                className={clsx('px-2.5 py-1 text-xs rounded-lg border transition-colors',
                  sortBy === opt.key
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'border-gray-600/50 text-gray-500 hover:text-gray-300')}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* ── Visual Scale Bars ───────────────────────────────────────────── */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Comparaison à l'échelle
            </h2>

            {['length', 'beam', 'height'].map(dim => {
              const label = dim === 'length' ? 'Longueur' : dim === 'beam' ? 'Largeur' : 'Hauteur';
              return (
                <div key={dim} className="space-y-2">
                  <span className="text-xs text-gray-500 uppercase">{label}</span>
                  {sorted.map(ship => {
                    const val = ship.dims[dim] || 0;
                    const pct = (val / maxVals[dim]) * 100;
                    const c = colorForShip(ship);
                    return (
                      <div key={ship.id} className="flex items-center gap-3">
                        <span className="w-36 text-xs text-gray-400 truncate text-right">{ship.name}</span>
                        <div className="flex-1 h-5 bg-gray-900/60 rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: c.fill }}
                          />
                          <span className="absolute inset-y-0 right-2 flex items-center text-[10px] text-gray-300 font-mono">
                            {fmtMeters(val)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Size Silhouettes ────────────────────────────────────────────── */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Silhouettes proportionnelles (vue de profil)
            </h2>

            <div className="space-y-3">
              {(() => {
                const maxArea = Math.max(...sorted.map(s => s.dims.length || 1));
                return sorted.map(ship => {
                  const scale = (ship.dims.length / maxArea);
                  const widthPx = Math.max(scale * 100, 8);
                  const heightPx = Math.max((ship.dims.height / ship.dims.length) * widthPx * 3, 12);
                  const c = colorForShip(ship);
                  return (
                    <div key={ship.id} className="flex items-end gap-4">
                      <span className="w-36 text-xs text-gray-400 truncate text-right pb-1">{ship.name}</span>
                      <div className="flex-1 flex items-end min-h-[40px]">
                        <div
                          className="rounded-sm border relative group cursor-default"
                          style={{
                            width: `${widthPx}%`,
                            height: `${heightPx}px`,
                            backgroundColor: c.fill + '30',
                            borderColor: c.fill + '60',
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            {fmtMeters(ship.dims.length)} × {fmtMeters(ship.dims.height)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <p className="text-[10px] text-gray-600 italic">
              Les rectangles représentent le profil longueur × hauteur à l'échelle relative.
            </p>
          </div>

          {/* ── Stats Table ─────────────────────────────────────────────────── */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Tableau comparatif
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase">
                    <th className="px-4 py-3 text-left font-medium">Statistique</th>
                    {sorted.map(ship => (
                      <th key={ship.id} className="px-4 py-3 text-center font-medium">
                        <div className={clsx('text-xs', colorForShip(ship).text)}>{ship.name}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{ship.manufacturer}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {[
                    { label: 'Taille',    icon: Layers,     fn: s => s.size },
                    { label: 'Longueur',  icon: Ruler,      fn: s => fmtMeters(s.dims.length) },
                    { label: 'Largeur',   icon: Ruler,      fn: s => fmtMeters(s.dims.beam) },
                    { label: 'Hauteur',   icon: Ruler,      fn: s => fmtMeters(s.dims.height) },
                    { label: 'Masse',     icon: Scale,      fn: s => fmtMass(s.dims.mass) },
                    { label: 'Cargo SCU', icon: Package,    fn: s => s.specs?.cargo != null ? `${s.specs.cargo} SCU` : 'N/A' },
                    { label: 'Équipage',  icon: Users,      fn: s => s.crew ? `${s.crew.min}–${s.crew.max}` : 'N/A' },
                    { label: 'Vitesse max', icon: Gauge,    fn: s => s.specs?.maxSpeed ? `${s.specs.maxSpeed} m/s` : 'N/A' },
                    { label: 'Prix',      icon: DollarSign, fn: s => s.price ? formatCredits(s.price, true) : 'N/A' },
                  ].map(({ label, icon: Icon, fn }) => (
                    <tr key={label} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-2.5 text-gray-400 flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-600" />
                        {label}
                      </td>
                      {sorted.map(ship => {
                        const val = fn(ship);
                        // Highlight max numeric values
                        const isMax = (() => {
                          if (sorted.length < 2) return false;
                          const allVals = sorted.map(fn);
                          const numericVals = allVals.map(v => parseFloat(String(v).replace(/[^\d.]/g, ''))).filter(n => !isNaN(n));
                          const thisNum = parseFloat(String(val).replace(/[^\d.]/g, ''));
                          return !isNaN(thisNum) && thisNum === Math.max(...numericVals) && numericVals.filter(n => n === thisNum).length === 1;
                        })();
                        return (
                          <td key={ship.id} className={clsx('px-4 py-2.5 text-center font-mono text-xs',
                            isMax ? 'text-cyan-400 font-semibold' : 'text-gray-300')}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Fun Facts ───────────────────────────────────────────────────── */}
          {funFacts.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-2">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                Le saviez-vous ?
              </h2>
              <ul className="space-y-1.5">
                {funFacts.map((fact, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-amber-400/60 mt-0.5">▸</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
