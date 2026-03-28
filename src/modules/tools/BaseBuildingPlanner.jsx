import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Grid3X3, Package, Shield, Zap, Home, Factory, Wrench,
  Save, Download, Upload, Trash2, RotateCcw, AlertTriangle,
  ChevronRight, ChevronDown, Search, X, Info, Hammer, Coins,
  Battery, BarChart3, List,
} from 'lucide-react';
import clsx from 'clsx';

// ─── DONNÉES MODULES DE BASE ─────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'habitation',  label: 'Habitation',  color: '#38bdf8', icon: 'Home' },
  { id: 'production',  label: 'Production',  color: '#a78bfa', icon: 'Factory' },
  { id: 'stockage',    label: 'Stockage',    color: '#fb923c', icon: 'Package' },
  { id: 'defense',     label: 'Défense',     color: '#f87171', icon: 'Shield' },
  { id: 'energie',     label: 'Énergie',     color: '#4ade80', icon: 'Zap' },
  { id: 'utilitaire',  label: 'Utilitaire',  color: '#facc15', icon: 'Wrench' },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const CAT_COLORS = {
  habitation: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
  production: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  stockage:   'bg-orange-500/20 border-orange-500/40 text-orange-300',
  defense:    'bg-red-500/20 border-red-500/40 text-red-300',
  energie:    'bg-green-500/20 border-green-500/40 text-green-300',
  utilitaire: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
};
const CAT_GRID = {
  habitation: 'bg-sky-500/30 border-sky-400',
  production: 'bg-violet-500/30 border-violet-400',
  stockage:   'bg-orange-500/30 border-orange-400',
  defense:    'bg-red-500/30 border-red-400',
  energie:    'bg-green-500/30 border-green-400',
  utilitaire: 'bg-yellow-500/30 border-yellow-400',
};

const MODULES = [
  // Habitation
  { id: 'hab-basic',     name: 'Quartier Basique',       cat: 'habitation',  cost: 25000,   power: -5,   size: '1x1', storage: 0,  desc: 'Hébergement 2 personnes, lit et rangement minimal.', materials: ['Acier renforcé x4', 'Polymère x2'] },
  { id: 'hab-comfort',   name: 'Quartier Confort',       cat: 'habitation',  cost: 75000,   power: -10,  size: '2x1', storage: 0,  desc: 'Suite pour 4 personnes avec cuisine et sanitaires.', materials: ['Acier renforcé x8', 'Polymère x4', 'Composant électronique x2'] },
  { id: 'hab-command',   name: 'Centre de Commande',     cat: 'habitation',  cost: 150000,  power: -20,  size: '2x2', storage: 0,  desc: 'Poste central avec écrans tactiques et comms longue portée.', materials: ['Acier renforcé x12', 'Composant électronique x8', 'Fibre optique x4'] },
  // Production
  { id: 'prod-refinery', name: 'Raffinerie Compacte',    cat: 'production',  cost: 200000,  power: -30,  size: '2x2', storage: 0,  desc: 'Raffinage de minerais bruts en matériaux exploitables.', materials: ['Titane x10', 'Composant électronique x6', 'Catalyseur x4'] },
  { id: 'prod-farm',     name: 'Ferme Hydroponique',     cat: 'production',  cost: 60000,   power: -15,  size: '2x1', storage: 0,  desc: 'Production de nourriture et oxygène recyclé.', materials: ['Polymère x6', 'Fibre optique x2', 'Substrat bio x4'] },
  { id: 'prod-workshop', name: 'Atelier de Fabrication', cat: 'production',  cost: 120000,  power: -25,  size: '2x1', storage: 0,  desc: 'Fabrication de composants et réparations avancées.', materials: ['Acier renforcé x8', 'Titane x4', 'Composant électronique x6'] },
  // Stockage
  { id: 'stk-small',     name: 'Conteneur 16 SCU',      cat: 'stockage',    cost: 15000,   power: -2,   size: '1x1', storage: 16,  desc: 'Stockage sécurisé de petit volume.', materials: ['Acier renforcé x4'] },
  { id: 'stk-medium',    name: 'Entrepôt 64 SCU',       cat: 'stockage',    cost: 50000,   power: -5,   size: '2x1', storage: 64,  desc: 'Entrepôt moyen avec système de tri automatique.', materials: ['Acier renforcé x8', 'Composant électronique x2'] },
  { id: 'stk-large',     name: 'Hangar Cargo 192 SCU',  cat: 'stockage',    cost: 150000,  power: -10,  size: '2x2', storage: 192, desc: 'Grand hangar cargo avec accès véhicule.', materials: ['Acier renforcé x16', 'Titane x6', 'Composant électronique x4'] },
  // Défense
  { id: 'def-turret',    name: 'Tourelle Automatique',   cat: 'defense',     cost: 80000,   power: -15,  size: '1x1', storage: 0,  desc: 'Tourelle S4 avec détection 2 km. Cible hostiles automatiquement.', materials: ['Acier renforcé x6', 'Composant électronique x4', 'Module balistique x2'] },
  { id: 'def-shield',    name: 'Générateur Bouclier',    cat: 'defense',     cost: 120000,  power: -25,  size: '1x1', storage: 0,  desc: 'Bouclier énergétique couvrant un rayon de 50 m.', materials: ['Titane x6', 'Cristal quantique x4', 'Composant électronique x4'] },
  { id: 'def-wall',      name: 'Mur Fortifié',          cat: 'defense',     cost: 20000,   power: 0,    size: '1x1', storage: 0,  desc: 'Barricade lourde en titane. Aucune consommation.', materials: ['Titane x8', 'Acier renforcé x4'] },
  { id: 'def-radar',     name: 'Station Radar',          cat: 'defense',     cost: 95000,   power: -20,  size: '1x1', storage: 0,  desc: 'Détection longue portée (10 km) des signatures.', materials: ['Composant électronique x8', 'Fibre optique x6'] },
  // Énergie
  { id: 'nrg-solar',     name: 'Panneau Solaire',        cat: 'energie',     cost: 30000,   power: 20,   size: '1x1', storage: 0,  desc: 'Production solaire, rendement variable selon la planète.', materials: ['Polymère x4', 'Cristal quantique x2'] },
  { id: 'nrg-generator', name: 'Générateur Fusion',      cat: 'energie',     cost: 180000,  power: 60,   size: '2x1', storage: 0,  desc: 'Générateur haute capacité au deutérium.', materials: ['Titane x10', 'Cristal quantique x6', 'Composant électronique x6'] },
  { id: 'nrg-battery',   name: 'Banque de Batteries',    cat: 'energie',     cost: 45000,   power: 15,   size: '1x1', storage: 0,  desc: 'Stockage tampon. Compense les pics de consommation.', materials: ['Polymère x4', 'Composant électronique x4', 'Lithium x6'] },
  // Utilitaire
  { id: 'utl-medbay',    name: 'Infirmerie',             cat: 'utilitaire',  cost: 90000,   power: -10,  size: '2x1', storage: 0,  desc: 'Soins, régénération T1. Point de respawn basique.', materials: ['Polymère x6', 'Composant électronique x6', 'Substrat bio x2'] },
  { id: 'utl-landing',   name: 'Pad d\'Atterrissage',   cat: 'utilitaire',  cost: 100000,  power: -8,   size: '2x2', storage: 0,  desc: 'Plateforme pour vaisseaux taille Small/Medium.', materials: ['Acier renforcé x16', 'Titane x8'] },
  { id: 'utl-recycler',  name: 'Recycleur Atmosphère',   cat: 'utilitaire',  cost: 40000,   power: -12,  size: '1x1', storage: 0,  desc: 'Filtre CO₂ et régénère l\'oxygène ambiant.', materials: ['Polymère x4', 'Fibre optique x2', 'Substrat bio x2'] },
  { id: 'utl-comms',     name: 'Relais de Communication',cat: 'utilitaire',  cost: 55000,   power: -8,   size: '1x1', storage: 0,  desc: 'Antenne QT-Comm pour MobiGlas étendu et appels longue portée.', materials: ['Composant électronique x6', 'Fibre optique x4'] },
];

const MOD_MAP = Object.fromEntries(MODULES.map(m => [m.id, m]));

const SIZE_CELLS = { '1x1': [[0, 0]], '2x1': [[0, 0], [1, 0]], '2x2': [[0, 0], [1, 0], [0, 1], [1, 1]] };

const GRID_SIZE = 6;
const STORAGE_KEY = 'bb-planner-saves';

// ─── PRESETS ──────────────────────────────────────────────────────────────────

const PRESETS = [
  {
    id: 'mining',
    name: 'Avant-Poste Minier',
    desc: 'Base d\'extraction avec raffinerie, stockage et défense minimale.',
    modules: [
      { id: 'nrg-generator', r: 0, c: 0 },
      { id: 'nrg-solar',     r: 0, c: 2 },
      { id: 'prod-refinery', r: 0, c: 3 },
      { id: 'stk-medium',    r: 2, c: 0 },
      { id: 'hab-basic',     r: 2, c: 2 },
      { id: 'def-turret',    r: 2, c: 3 },
      { id: 'stk-small',     r: 3, c: 3 },
      { id: 'utl-recycler',  r: 3, c: 2 },
    ],
  },
  {
    id: 'trading',
    name: 'Hub Commercial',
    desc: 'Grand stockage, pad d\'atterrissage et centre de commande.',
    modules: [
      { id: 'nrg-generator', r: 0, c: 0 },
      { id: 'nrg-battery',   r: 0, c: 2 },
      { id: 'hab-command',   r: 0, c: 3 },
      { id: 'stk-large',     r: 2, c: 0 },
      { id: 'stk-medium',    r: 2, c: 2 },
      { id: 'utl-landing',   r: 2, c: 4 },
      { id: 'utl-comms',     r: 4, c: 0 },
      { id: 'def-turret',    r: 4, c: 1 },
    ],
  },
  {
    id: 'defense',
    name: 'Base de Défense',
    desc: 'Fortifications, tourelles multiples et bouclier.',
    modules: [
      { id: 'nrg-generator', r: 0, c: 0 },
      { id: 'nrg-generator', r: 0, c: 2 },
      { id: 'def-shield',    r: 0, c: 4 },
      { id: 'def-turret',    r: 0, c: 5 },
      { id: 'def-radar',     r: 2, c: 0 },
      { id: 'def-turret',    r: 2, c: 5 },
      { id: 'def-wall',      r: 3, c: 0 },
      { id: 'hab-basic',     r: 3, c: 1 },
      { id: 'utl-medbay',    r: 3, c: 2 },
      { id: 'def-wall',      r: 3, c: 4 },
      { id: 'def-turret',    r: 4, c: 5 },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatCost(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M aUEC`;
  if (n >= 1000)      return `${Math.round(n / 1000)}K aUEC`;
  return `${n} aUEC`;
}

const ICON_MAP = { Home, Factory, Package, Shield, Zap, Wrench };
function CatIcon({ catId, className }) {
  const cat = CAT_MAP[catId];
  const Icon = ICON_MAP[cat?.icon] || Package;
  return <Icon className={className} />;
}

function canPlace(grid, modId, startR, startC) {
  const mod = MOD_MAP[modId];
  if (!mod) return false;
  const cells = SIZE_CELLS[mod.size] || SIZE_CELLS['1x1'];
  for (const [dc, dr] of cells) {
    const r = startR + dr, c = startC + dc;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    if (grid[r][c] !== null) return false;
  }
  return true;
}

function placeModule(grid, modId, startR, startC, uid) {
  const mod = MOD_MAP[modId];
  const cells = SIZE_CELLS[mod.size] || SIZE_CELLS['1x1'];
  const newGrid = grid.map(row => [...row]);
  for (const [dc, dr] of cells) {
    newGrid[startR + dr][startC + dc] = { modId, uid, isOrigin: dr === 0 && dc === 0 };
  }
  return newGrid;
}

function removeByUid(grid, uid) {
  return grid.map(row => row.map(cell => (cell && cell.uid === uid ? null : cell)));
}

function emptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function gridToPlaced(grid) {
  const seen = new Set();
  const list = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (cell && !seen.has(cell.uid)) {
        seen.add(cell.uid);
        list.push({ id: cell.modId, r, c, uid: cell.uid });
      }
    }
  }
  return list;
}

function buildGridFromList(list) {
  let g = emptyGrid();
  let uid = 1;
  for (const item of list) {
    if (canPlace(g, item.id, item.r, item.c)) {
      g = placeModule(g, item.id, item.r, item.c, uid++);
    }
  }
  return { grid: g, nextUid: uid };
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function BaseBuildingPlanner() {
  const [tab, setTab] = useState('planner');
  const [grid, setGrid] = useState(emptyGrid);
  const [nextUid, setNextUid] = useState(1);
  const [selectedMod, setSelectedMod] = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [saves, setSaves] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [saveName, setSaveName] = useState('');
  const [hoverCell, setHoverCell] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  }, [saves]);

  // Stats
  const stats = useMemo(() => {
    const placed = gridToPlaced(grid);
    let totalCost = 0, totalPower = 0, totalStorage = 0, genPower = 0, consPower = 0;
    const matMap = {};
    const catCount = {};
    for (const p of placed) {
      const mod = MOD_MAP[p.id];
      if (!mod) continue;
      totalCost += mod.cost;
      totalPower += mod.power;
      totalStorage += mod.storage;
      if (mod.power > 0) genPower += mod.power;
      else consPower += Math.abs(mod.power);
      catCount[mod.cat] = (catCount[mod.cat] || 0) + 1;
      for (const mat of mod.materials) {
        const [name, qty] = mat.split(' x');
        matMap[name] = (matMap[name] || 0) + parseInt(qty, 10);
      }
    }
    const materials = Object.entries(matMap).sort((a, b) => b[1] - a[1]).map(([name, qty]) => ({ name, qty }));
    return { count: placed.length, totalCost, totalPower, totalStorage, genPower, consPower, catCount, materials };
  }, [grid]);

  const warnings = useMemo(() => {
    const w = [];
    if (stats.totalPower < 0) w.push('Déficit énergétique ! Ajoutez des modules Énergie.');
    if (stats.count === 0) return w;
    if (!stats.catCount.habitation) w.push('Aucun quartier d\'habitation. La base ne sera pas habitable.');
    if (!stats.catCount.energie) w.push('Aucune source d\'énergie. La base ne fonctionnera pas.');
    if (stats.consPower > 0 && stats.genPower / stats.consPower < 1.2 && stats.totalPower >= 0) {
      w.push('Marge énergétique faible (< 20%). Prévoyez une réserve.');
    }
    return w;
  }, [stats]);

  // Filtered catalog
  const filteredModules = useMemo(() => {
    let list = MODULES;
    if (catFilter !== 'all') list = list.filter(m => m.cat === catFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(s) || m.desc.toLowerCase().includes(s));
    }
    return list;
  }, [catFilter, search]);

  // Grid actions
  const handleCellClick = useCallback((r, c) => {
    const cell = grid[r][c];
    if (cell) {
      setGrid(prev => removeByUid(prev, cell.uid));
      return;
    }
    if (!selectedMod) return;
    if (!canPlace(grid, selectedMod, r, c)) return;
    setGrid(prev => placeModule(prev, selectedMod, r, c, nextUid));
    setNextUid(u => u + 1);
  }, [grid, selectedMod, nextUid]);

  const clearGrid = () => { setGrid(emptyGrid()); setNextUid(1); };

  const loadPreset = (preset) => {
    const { grid: g, nextUid: u } = buildGridFromList(preset.modules);
    setGrid(g);
    setNextUid(u);
    setTab('planner');
  };

  const saveLayout = () => {
    if (!saveName.trim()) return;
    const entry = { name: saveName.trim(), date: new Date().toISOString(), modules: gridToPlaced(grid).map(({ id, r, c }) => ({ id, r, c })) };
    setSaves(prev => [entry, ...prev].slice(0, 10));
    setSaveName('');
  };

  const loadLayout = (save) => {
    const { grid: g, nextUid: u } = buildGridFromList(save.modules);
    setGrid(g);
    setNextUid(u);
  };

  const deleteSave = (idx) => setSaves(prev => prev.filter((_, i) => i !== idx));

  const TABS = [
    { id: 'planner',  label: 'Planificateur', icon: Grid3X3 },
    { id: 'catalog',  label: 'Catalogue',     icon: List },
    { id: 'presets',  label: 'Préréglages',   icon: Download },
  ];

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Hammer className="w-6 h-6 text-cyan-400" />
          Base Building Planner
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Planifiez votre base Cornerstone / Pioneer — Alpha 4.6
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-space-800/50 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/40'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB : PLANIFICATEUR ═══ */}
      {tab === 'planner' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Module Selector + Grid */}
          <div className="xl:col-span-2 space-y-4">
            {/* Module selector bar */}
            <div className="card p-3">
              <p className="text-xs text-slate-500 mb-2">Sélectionnez un module puis cliquez sur la grille pour le placer. Cliquez un module placé pour le retirer.</p>
              <div className="flex flex-wrap gap-1.5">
                {MODULES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMod(selectedMod === m.id ? null : m.id)}
                    className={clsx(
                      'px-2 py-1 rounded text-xs font-medium border transition-all',
                      selectedMod === m.id
                        ? `${CAT_COLORS[m.cat]} border-current ring-1 ring-current`
                        : 'border-space-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    )}
                    title={`${m.name} (${m.size}) — ${formatCost(m.cost)} — ${m.power > 0 ? '+' : ''}${m.power} kW`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              {selectedMod && (
                <div className={clsx('mt-2 p-2 rounded-lg border text-xs', CAT_COLORS[MOD_MAP[selectedMod].cat])}>
                  <span className="font-bold">{MOD_MAP[selectedMod].name}</span>
                  <span className="ml-2 opacity-75">{MOD_MAP[selectedMod].size} — {formatCost(MOD_MAP[selectedMod].cost)} — {MOD_MAP[selectedMod].power > 0 ? '+' : ''}{MOD_MAP[selectedMod].power} kW</span>
                </div>
              )}
            </div>

            {/* Grid */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-200">Grille de construction ({GRID_SIZE}×{GRID_SIZE})</h2>
                <button onClick={clearGrid} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors">
                  <RotateCcw className="w-3 h-3" /> Réinitialiser
                </button>
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const mod = cell ? MOD_MAP[cell.modId] : null;
                    const canDrop = !cell && selectedMod && canPlace(grid, selectedMod, r, c);
                    const isHover = hoverCell && hoverCell.r === r && hoverCell.c === c;
                    return (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        onMouseEnter={() => setHoverCell({ r, c })}
                        onMouseLeave={() => setHoverCell(null)}
                        className={clsx(
                          'aspect-square rounded-md border flex items-center justify-center cursor-pointer transition-all text-[10px] font-medium leading-tight text-center p-0.5',
                          cell
                            ? `${CAT_GRID[mod.cat]} border hover:brightness-125`
                            : canDrop
                              ? 'border-dashed border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20'
                              : 'border-space-600 bg-space-800/40 hover:bg-space-700/40',
                          isHover && !cell && selectedMod && !canDrop && 'border-red-500/40 bg-red-500/10'
                        )}
                        title={cell ? `${mod.name} — Cliquer pour retirer` : canDrop ? 'Cliquer pour placer' : ''}
                      >
                        {cell && cell.isOrigin && (
                          <span className="truncate">{mod.name.split(' ')[0]}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-3">
                {CATEGORIES.map(cat => (
                  <span key={cat.id} className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className={`w-2.5 h-2.5 rounded-sm ${CAT_GRID[cat.id].split(' ')[0]}`} />
                    {cat.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Save/Load */}
            <div className="card p-4">
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Save className="w-4 h-4 text-cyan-400" /> Sauvegardes
              </h2>
              <div className="flex gap-2 mb-3">
                <input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="Nom de la base..."
                  className="flex-1 bg-space-800 border border-space-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  maxLength={40}
                />
                <button
                  onClick={saveLayout}
                  disabled={!saveName.trim() || stats.count === 0}
                  className="btn-primary text-xs px-3 disabled:opacity-40"
                >
                  Sauvegarder
                </button>
              </div>
              {saves.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Aucune sauvegarde.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {saves.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-space-800/50 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-sm text-slate-200 font-medium">{s.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{s.modules.length} modules — {new Date(s.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => loadLayout(s)} className="text-xs text-cyan-400 hover:text-cyan-300" title="Charger">
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteSave(i)} className="text-xs text-red-400 hover:text-red-300" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="card p-3 border-yellow-500/30 bg-yellow-500/5">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-yellow-300 mb-1 last:mb-0">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="card p-4">
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Résumé
              </h2>
              <div className="space-y-2.5">
                <StatRow label="Modules placés" value={`${stats.count} / 36`} />
                <StatRow label="Coût total" value={formatCost(stats.totalCost)} accent />
                <StatRow label="Stockage total" value={`${stats.totalStorage} SCU`} />
                {CATEGORIES.map(cat => stats.catCount[cat.id] ? (
                  <StatRow key={cat.id} label={cat.label} value={`×${stats.catCount[cat.id]}`} color={cat.color} />
                ) : null)}
              </div>
            </div>

            {/* Power balance */}
            <div className="card p-4">
              <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-400" /> Bilan Énergétique
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">Production : {stats.genPower} kW</span>
                  <span className="text-red-400">Conso : {stats.consPower} kW</span>
                </div>
                <div className="h-3 bg-space-700 rounded-full overflow-hidden flex">
                  {stats.genPower > 0 && (
                    <div
                      className="h-full bg-green-500/70 transition-all"
                      style={{ width: `${Math.min(100, (stats.genPower / Math.max(stats.genPower, stats.consPower)) * 100)}%` }}
                    />
                  )}
                  {stats.consPower > 0 && (
                    <div
                      className="h-full bg-red-500/70 transition-all"
                      style={{ width: `${Math.min(100, (stats.consPower / Math.max(stats.genPower, stats.consPower)) * 100)}%` }}
                    />
                  )}
                </div>
                <div className={clsx('text-xs font-bold text-center', stats.totalPower >= 0 ? 'text-green-400' : 'text-red-400')}>
                  Bilan : {stats.totalPower > 0 ? '+' : ''}{stats.totalPower} kW
                  {stats.totalPower >= 0 ? ' ✓' : ' — DÉFICIT'}
                </div>
              </div>
            </div>

            {/* Materials */}
            {stats.materials.length > 0 && (
              <div className="card p-4">
                <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-orange-400" /> Matériaux requis
                </h2>
                <div className="space-y-1.5">
                  {stats.materials.map(m => (
                    <div key={m.name} className="flex justify-between text-xs">
                      <span className="text-slate-300">{m.name}</span>
                      <span className="text-slate-400 font-mono">×{m.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB : CATALOGUE ═══ */}
      {tab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-3 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un module..."
                className="w-full bg-space-800 border border-space-600 rounded-lg pl-8 pr-8 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCatFilter('all')}
                className={clsx('px-2 py-1 rounded text-xs font-medium transition-colors', catFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200')}
              >
                Tous
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCatFilter(catFilter === cat.id ? 'all' : cat.id)}
                  className={clsx('px-2 py-1 rounded text-xs font-medium transition-colors', catFilter === cat.id ? CAT_COLORS[cat.id] : 'text-slate-400 hover:text-slate-200')}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">{filteredModules.length} module{filteredModules.length > 1 ? 's' : ''}</p>

          {/* Module cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredModules.map(mod => (
              <ModuleCard key={mod.id} mod={mod} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ TAB : PRÉRÉGLAGES ═══ */}
      {tab === 'presets' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Chargez un agencement prédéfini comme point de départ, puis personnalisez-le dans le Planificateur.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRESETS.map(preset => {
              const mods = preset.modules.map(m => MOD_MAP[m.id]).filter(Boolean);
              const cost = mods.reduce((s, m) => s + m.cost, 0);
              const power = mods.reduce((s, m) => s + m.power, 0);
              const storage = mods.reduce((s, m) => s + m.storage, 0);
              return (
                <div key={preset.id} className="card p-4 hover:border-cyan-500/30 transition-colors">
                  <h3 className="font-bold text-slate-100 text-sm mb-1">{preset.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{preset.desc}</p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Modules</span>
                      <span className="text-slate-200 font-medium">{preset.modules.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Coût</span>
                      <span className="text-gold-400 font-medium">{formatCost(cost)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Énergie</span>
                      <span className={clsx('font-medium', power >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {power > 0 ? '+' : ''}{power} kW
                      </span>
                    </div>
                    {storage > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Stockage</span>
                        <span className="text-orange-400 font-medium">{storage} SCU</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mods.map((m, i) => (
                      <span key={i} className={clsx('text-[10px] px-1.5 py-0.5 rounded', CAT_COLORS[m.cat])}>{m.name}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => loadPreset(preset)}
                    className="btn-primary w-full text-xs py-1.5"
                  >
                    Charger ce préréglage
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({ label, value, accent, color }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-400 flex items-center gap-1.5">
        {color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
        {label}
      </span>
      <span className={clsx('font-medium', accent ? 'text-gold-400' : 'text-slate-200')}>{value}</span>
    </div>
  );
}

function ModuleCard({ mod }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CAT_MAP[mod.cat];
  return (
    <div className="card overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-space-700/20 transition-colors" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', CAT_COLORS[mod.cat])}>
              <CatIcon catId={mod.cat} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-100 text-sm">{mod.name}</h3>
              <p className="text-xs text-slate-500">{cat.label} — {mod.size}</p>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 ml-[42px]">
          <span className="badge badge-slate text-[10px]"><Coins className="w-2.5 h-2.5 mr-0.5 inline" />{formatCost(mod.cost)}</span>
          <span className={clsx('badge text-[10px]', mod.power > 0 ? 'badge-green' : mod.power < 0 ? 'badge-red' : 'badge-slate')}>
            <Zap className="w-2.5 h-2.5 mr-0.5 inline" />{mod.power > 0 ? '+' : ''}{mod.power} kW
          </span>
          {mod.storage > 0 && <span className="badge badge-orange text-[10px]"><Package className="w-2.5 h-2.5 mr-0.5 inline" />{mod.storage} SCU</span>}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-space-700 pt-3 space-y-2">
          <p className="text-xs text-slate-400">{mod.desc}</p>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold mb-1">MATÉRIAUX :</p>
            <div className="flex flex-wrap gap-1">
              {mod.materials.map((m, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-space-700/50 rounded text-slate-300">{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
