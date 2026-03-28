import React, { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import {
  ArrowRight, ArrowDown, Calculator, Link2, Star, Wallet,
  Trash2, CheckCircle, Plus, DollarSign, Ship, Target,
  ChevronRight, Sparkles, ShoppingCart, TrendingDown, Layers,
  Search, X, Info,
} from 'lucide-react';

// ─── PLEDGE SHIPS DATABASE ────────────────────────────────────────────────────

const PLEDGE_SHIPS = [
  { id: 'aurora-es', name: 'Aurora ES', manufacturer: 'RSI', value: 20, category: 'Starter' },
  { id: 'aurora-mr', name: 'Aurora MR', manufacturer: 'RSI', value: 25, category: 'Starter' },
  { id: 'mustang-alpha', name: 'Mustang Alpha', manufacturer: 'CNOU', value: 30, category: 'Starter' },
  { id: 'aurora-ln', name: 'Aurora LN', manufacturer: 'RSI', value: 35, category: 'Starter' },
  { id: 'mustang-delta', name: 'Mustang Delta', manufacturer: 'CNOU', value: 40, category: 'Starter' },
  { id: 'c8x-pisces', name: 'C8X Pisces', manufacturer: 'Anvil', value: 45, category: 'Starter' },
  { id: 'titan', name: 'Avenger Titan', manufacturer: 'Aegis', value: 55, category: 'Starter' },
  { id: 'nomad', name: 'Nomad', manufacturer: 'CNOU', value: 55, category: 'Starter' },
  { id: '100i', name: '100i', manufacturer: 'Origin', value: 50, category: 'Starter' },
  { id: '125a', name: '125a', manufacturer: 'Origin', value: 55, category: 'Light Fighter' },
  { id: '135c', name: '135c', manufacturer: 'Origin', value: 60, category: 'Light Freight' },
  { id: 'arrow', name: 'Arrow', manufacturer: 'Anvil', value: 75, category: 'Light Fighter' },
  { id: 'avenger-stalker', name: 'Avenger Stalker', manufacturer: 'Aegis', value: 60, category: 'Bounty Hunter' },
  { id: 'avenger-warlock', name: 'Avenger Warlock', manufacturer: 'Aegis', value: 75, category: 'EMP' },
  { id: 'gladius', name: 'Gladius', manufacturer: 'Aegis', value: 90, category: 'Light Fighter' },
  { id: 'reliant-kore', name: 'Reliant Kore', manufacturer: 'MISC', value: 65, category: 'Light Freight' },
  { id: 'reliant-tana', name: 'Reliant Tana', manufacturer: 'MISC', value: 75, category: 'Light Fighter' },
  { id: 'cutlass-black', name: 'Cutlass Black', manufacturer: 'Drake', value: 100, category: 'Multi-rôle' },
  { id: 'cutlass-red', name: 'Cutlass Red', manufacturer: 'Drake', value: 120, category: 'Médical' },
  { id: 'freelancer', name: 'Freelancer', manufacturer: 'MISC', value: 110, category: 'Cargo' },
  { id: 'freelancer-max', name: 'Freelancer MAX', manufacturer: 'MISC', value: 140, category: 'Cargo' },
  { id: 'freelancer-dur', name: 'Freelancer DUR', manufacturer: 'MISC', value: 125, category: 'Exploration' },
  { id: 'hornet-f7c', name: 'Hornet F7C', manufacturer: 'Anvil', value: 110, category: 'Medium Fighter' },
  { id: 'hornet-ghost', name: 'Hornet Ghost', manufacturer: 'Anvil', value: 125, category: 'Stealth Fighter' },
  { id: 'hornet-super', name: 'Super Hornet', manufacturer: 'Anvil', value: 165, category: 'Heavy Fighter' },
  { id: 'sabre', name: 'Sabre', manufacturer: 'Aegis', value: 170, category: 'Stealth Fighter' },
  { id: 'buccaneer', name: 'Buccaneer', manufacturer: 'Drake', value: 110, category: 'Light Fighter' },
  { id: 'defender', name: 'Defender', manufacturer: "Banu", value: 185, category: 'Medium Fighter' },
  { id: '300i', name: '300i', manufacturer: 'Origin', value: 55, category: 'Touring' },
  { id: '315p', name: '315p', manufacturer: 'Origin', value: 65, category: 'Exploration' },
  { id: '325a', name: '325a', manufacturer: 'Origin', value: 70, category: 'Light Fighter' },
  { id: '400i', name: '400i', manufacturer: 'Origin', value: 220, category: 'Exploration' },
  { id: '600i-explorer', name: '600i Explorer', manufacturer: 'Origin', value: 435, category: 'Exploration' },
  { id: 'constellation-taurus', name: 'Constellation Taurus', manufacturer: 'RSI', value: 150, category: 'Cargo' },
  { id: 'constellation-andromeda', name: 'Constellation Andromeda', manufacturer: 'RSI', value: 225, category: 'Multi-rôle' },
  { id: 'constellation-aquila', name: 'Constellation Aquila', manufacturer: 'RSI', value: 275, category: 'Exploration' },
  { id: 'mercury', name: 'Mercury Star Runner', manufacturer: 'Crusader', value: 225, category: 'Data Runner' },
  { id: 'vanguard-warden', name: 'Vanguard Warden', manufacturer: 'Aegis', value: 260, category: 'Heavy Fighter' },
  { id: 'vanguard-sentinel', name: 'Vanguard Sentinel', manufacturer: 'Aegis', value: 275, category: 'EMP Fighter' },
  { id: 'prospector', name: 'Prospector', manufacturer: 'MISC', value: 155, category: 'Minage' },
  { id: 'vulture', name: 'Vulture', manufacturer: 'Drake', value: 140, category: 'Salvage' },
  { id: 'mole', name: 'MOLE', manufacturer: 'Argo', value: 275, category: 'Minage' },
  { id: 'caterpillar', name: 'Caterpillar', manufacturer: 'Drake', value: 295, category: 'Cargo' },
  { id: 'c2-hercules', name: 'C2 Hercules', manufacturer: 'Crusader', value: 360, category: 'Cargo' },
  { id: 'm2-hercules', name: 'M2 Hercules', manufacturer: 'Crusader', value: 450, category: 'Military Transport' },
  { id: 'a2-hercules', name: 'A2 Hercules', manufacturer: 'Crusader', value: 700, category: 'Bomber' },
  { id: 'reclaimer', name: 'Reclaimer', manufacturer: 'Aegis', value: 400, category: 'Salvage' },
  { id: 'carrack', name: 'Carrack', manufacturer: 'Anvil', value: 500, category: 'Exploration' },
  { id: 'hammerhead', name: 'Hammerhead', manufacturer: 'Aegis', value: 650, category: 'Corvette' },
  { id: 'perseus', name: 'Perseus', manufacturer: 'RSI', value: 600, category: 'Corvette' },
  { id: 'polaris', name: 'Polaris', manufacturer: 'RSI', value: 750, category: 'Corvette' },
  { id: 'scorpius', name: 'Scorpius', manufacturer: 'RSI', value: 220, category: 'Heavy Fighter' },
  { id: 'hurricane', name: 'Hurricane', manufacturer: 'Anvil', value: 175, category: 'Heavy Fighter' },
  { id: 'spirit-c1', name: 'Spirit C1', manufacturer: 'Crusader', value: 110, category: 'Cargo' },
  { id: 'spirit-e1', name: 'Spirit E1', manufacturer: 'Crusader', value: 120, category: 'Médical' },
  { id: 'spirit-a1', name: 'Spirit A1', manufacturer: 'Crusader', value: 130, category: 'Bomber' },
  { id: 'razor', name: 'Razor', manufacturer: 'MISC', value: 135, category: 'Racing' },
  { id: 'hull-a', name: 'Hull A', manufacturer: 'MISC', value: 80, category: 'Cargo' },
  { id: 'hull-c', name: 'Hull C', manufacturer: 'MISC', value: 200, category: 'Cargo' },
  { id: 'eclipse', name: 'Eclipse', manufacturer: 'Aegis', value: 275, category: 'Stealth Bomber' },
  { id: 'retaliator', name: 'Retaliator', manufacturer: 'Aegis', value: 150, category: 'Bomber' },
];

// ─── SAMPLE WARBOND CCU DEALS ─────────────────────────────────────────────────

const SAMPLE_WARBOND = [
  { from: 'aurora-mr', to: 'titan', warbondPrice: 20, normalPrice: 30 },
  { from: 'titan', to: 'cutlass-black', warbondPrice: 35, normalPrice: 45 },
  { from: 'cutlass-black', to: 'freelancer-max', warbondPrice: 30, normalPrice: 40 },
  { from: 'freelancer-max', to: 'constellation-taurus', warbondPrice: 5, normalPrice: 10 },
  { from: 'constellation-taurus', to: 'constellation-andromeda', warbondPrice: 60, normalPrice: 75 },
  { from: 'constellation-andromeda', to: 'mercury', warbondPrice: 0, normalPrice: 0 },
  { from: 'cutlass-black', to: 'prospector', warbondPrice: 45, normalPrice: 55 },
  { from: 'constellation-andromeda', to: 'vanguard-warden', warbondPrice: 25, normalPrice: 35 },
  { from: 'constellation-taurus', to: 'hull-c', warbondPrice: 40, normalPrice: 50 },
  { from: 'hull-c', to: 'constellation-andromeda', warbondPrice: 15, normalPrice: 25 },
  { from: 'vanguard-warden', to: 'caterpillar', warbondPrice: 25, normalPrice: 35 },
  { from: 'caterpillar', to: 'c2-hercules', warbondPrice: 50, normalPrice: 65 },
  { from: 'c2-hercules', to: 'reclaimer', warbondPrice: 30, normalPrice: 40 },
  { from: 'reclaimer', to: 'carrack', warbondPrice: 80, normalPrice: 100 },
  { from: 'carrack', to: 'hammerhead', warbondPrice: 120, normalPrice: 150 },
];

const TABS = [
  { key: 'calculator', label: 'Calculateur CCU', icon: Calculator },
  { key: 'chain', label: 'Chaîne Optimale', icon: Link2 },
  { key: 'collection', label: 'Ma Collection', icon: Star },
  { key: 'budget', label: 'Budget', icon: Wallet },
];

const STORAGE_KEY = 'sc_ccu_collection';
const FLEET_STORAGE_KEY = 'sc_ccu_fleet';

function getShip(id) {
  return PLEDGE_SHIPS.find(s => s.id === id);
}

// ─── SHIP SELECTOR COMPONENT ─────────────────────────────────────────────────

function ShipSelector({ value, onChange, label, exclude }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const selected = getShip(value);

  const filtered = useMemo(() => {
    let list = PLEDGE_SHIPS;
    if (exclude) list = list.filter(s => s.id !== exclude);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.manufacturer.toLowerCase().includes(q));
    }
    return list.sort((a, b) => a.value - b.value);
  }, [search, exclude]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 transition text-left"
      >
        {selected ? (
          <span className="text-slate-200">
            {selected.name} <span className="text-cyan-400 text-sm">${selected.value}</span>
          </span>
        ) : (
          <span className="text-slate-500">Sélectionner un vaisseau...</span>
        )}
        <ChevronRight className={clsx('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-slate-700 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
            {search && <X className="w-3.5 h-3.5 text-slate-400 cursor-pointer" onClick={() => setSearch('')} />}
          </div>
          <div className="overflow-y-auto max-h-52">
            {filtered.map(ship => (
              <button
                key={ship.id}
                onClick={() => { onChange(ship.id); setOpen(false); setSearch(''); }}
                className={clsx(
                  'w-full text-left px-3 py-2 text-sm hover:bg-cyan-500/10 transition flex items-center justify-between',
                  value === ship.id && 'bg-cyan-500/20 text-cyan-300',
                )}
              >
                <span>
                  <span className="text-slate-300">{ship.name}</span>
                  <span className="text-slate-500 ml-1.5 text-xs">{ship.manufacturer}</span>
                </span>
                <span className="text-cyan-400 text-xs font-mono">${ship.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHAIN FINDER (BFS + Warbond) ────────────────────────────────────────────

function findCheapestChain(fromId, toId, ownedWarbonds) {
  const fromShip = getShip(fromId);
  const toShip = getShip(toId);
  if (!fromShip || !toShip || fromShip.value >= toShip.value) return null;

  // Build adjacency: direct CCU + warbond options
  const adj = new Map();
  for (const s of PLEDGE_SHIPS) adj.set(s.id, []);

  // Direct upgrade edges (standard price = value difference)
  for (const a of PLEDGE_SHIPS) {
    for (const b of PLEDGE_SHIPS) {
      if (b.value > a.value) {
        const cost = b.value - a.value;
        adj.get(a.id).push({ to: b.id, cost, warbond: false });
      }
    }
  }

  // Warbond edges (cheaper than standard)
  for (const wb of ownedWarbonds) {
    const from = getShip(wb.from);
    const to = getShip(wb.to);
    if (from && to) {
      adj.get(wb.from).push({ to: wb.to, cost: wb.warbondPrice, warbond: true });
    }
  }

  // Dijkstra
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  for (const s of PLEDGE_SHIPS) dist.set(s.id, Infinity);
  dist.set(fromId, 0);

  while (true) {
    let u = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) { best = d; u = id; }
    }
    if (u === null || u === toId) break;
    visited.add(u);
    for (const edge of (adj.get(u) || [])) {
      const alt = dist.get(u) + edge.cost;
      if (alt < dist.get(edge.to)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, { from: u, cost: edge.cost, warbond: edge.warbond });
      }
    }
  }

  if (dist.get(toId) === Infinity) return null;

  // Reconstruct path
  const steps = [];
  let cur = toId;
  while (prev.has(cur)) {
    const p = prev.get(cur);
    steps.unshift({ from: p.from, to: cur, cost: p.cost, warbond: p.warbond });
    cur = p.from;
  }

  return { steps, totalCost: dist.get(toId), directCost: toShip.value - fromShip.value };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CCUCalculator() {
  const [tab, setTab] = useState('calculator');

  // Calculator state
  const [fromShip, setFromShip] = useState('');
  const [toShip, setToShip] = useState('');

  // Chain state
  const [chainFrom, setChainFrom] = useState('');
  const [chainTo, setChainTo] = useState('');

  // Collection (owned warbonds)
  const [ownedCCUs, setOwnedCCUs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  // Fleet (saved ships)
  const [fleet, setFleet] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FLEET_STORAGE_KEY)) || []; }
    catch { return []; }
  });

  // Budget
  const [budgetAmount, setBudgetAmount] = useState(100);
  const [budgetStart, setBudgetStart] = useState('aurora-mr');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ownedCCUs));
  }, [ownedCCUs]);

  useEffect(() => {
    localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(fleet));
  }, [fleet]);

  // ─── Calculator Tab ───────────────────────────────────────────────────

  const ccuResult = useMemo(() => {
    const from = getShip(fromShip);
    const to = getShip(toShip);
    if (!from || !to) return null;
    const diff = to.value - from.value;
    return { from, to, cost: diff, valid: diff > 0 };
  }, [fromShip, toShip]);

  // ─── Chain Tab ────────────────────────────────────────────────────────

  const chainResult = useMemo(() => {
    if (!chainFrom || !chainTo) return null;
    return findCheapestChain(chainFrom, chainTo, ownedCCUs);
  }, [chainFrom, chainTo, ownedCCUs]);

  // ─── Budget Tab ───────────────────────────────────────────────────────

  const budgetTargets = useMemo(() => {
    const start = getShip(budgetStart);
    if (!start) return [];
    return PLEDGE_SHIPS
      .filter(s => s.value > start.value && (s.value - start.value) <= budgetAmount)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [budgetAmount, budgetStart]);

  // ─── Collection Helpers ───────────────────────────────────────────────

  function toggleWarbond(wb) {
    setOwnedCCUs(prev => {
      const key = `${wb.from}->${wb.to}`;
      const exists = prev.some(c => `${c.from}->${c.to}` === key);
      if (exists) return prev.filter(c => `${c.from}->${c.to}` !== key);
      return [...prev, wb];
    });
  }

  function isOwned(wb) {
    return ownedCCUs.some(c => c.from === wb.from && c.to === wb.to);
  }

  function addToFleet(shipId) {
    if (!fleet.includes(shipId)) setFleet(prev => [...prev, shipId]);
  }

  function removeFromFleet(shipId) {
    setFleet(prev => prev.filter(id => id !== shipId));
  }

  const fleetValue = useMemo(() => {
    return fleet.reduce((sum, id) => sum + (getShip(id)?.value || 0), 0);
  }, [fleet]);

  // ─── RENDER ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
          <Layers className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Calculateur CCU</h1>
          <p className="text-sm text-slate-400">Planifiez vos Cross-Chassis Upgrades et optimisez vos dépenses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition',
              tab === t.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40',
            )}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ─── CALCULATOR TAB ──────────────────────────────────────────── */}
      {tab === 'calculator' && (
        <div className="space-y-6">
          <div className="card p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              CCU Simple
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <ShipSelector value={fromShip} onChange={setFromShip} label="Vaisseau actuel" exclude={toShip} />
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-6 h-6 text-cyan-400 hidden md:block" />
                <ArrowDown className="w-6 h-6 text-cyan-400 md:hidden" />
              </div>
              <ShipSelector value={toShip} onChange={setToShip} label="Vaisseau cible" exclude={fromShip} />
            </div>

            {ccuResult && (
              <div className={clsx(
                'mt-6 p-4 rounded-xl border',
                ccuResult.valid
                  ? 'bg-cyan-500/5 border-cyan-500/30'
                  : 'bg-red-500/5 border-red-500/30',
              )}>
                {ccuResult.valid ? (
                  <div className="text-center space-y-2">
                    <p className="text-slate-400 text-sm">Coût du CCU</p>
                    <p className="text-4xl font-bold text-cyan-300">${ccuResult.cost}</p>
                    <p className="text-xs text-slate-500">
                      {ccuResult.from.name} (${ccuResult.from.value}) → {ccuResult.to.name} (${ccuResult.to.value})
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <p className="text-red-400 font-medium">CCU impossible</p>
                    <p className="text-xs text-slate-500">
                      Le vaisseau cible doit avoir une valeur supérieure au vaisseau actuel
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fleet Value */}
          <div className="card p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Ship className="w-4 h-4 text-cyan-400" />
              Mes Pledges
              <span className="text-xs text-cyan-400 font-mono ml-auto">${fleetValue} total</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {fleet.map(id => {
                const ship = getShip(id);
                return ship ? (
                  <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm">
                    <span className="text-slate-200">{ship.name}</span>
                    <span className="text-cyan-400 text-xs">${ship.value}</span>
                    <button onClick={() => removeFromFleet(id)} className="text-slate-500 hover:text-red-400 ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ) : null;
              })}
              {fleet.length === 0 && (
                <p className="text-slate-500 text-sm">
                  Ajoutez des vaisseaux depuis l'onglet Collection
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHAIN TAB ───────────────────────────────────────────────── */}
      {tab === 'chain' && (
        <div className="space-y-6">
          <div className="card p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-cyan-400" />
              Recherche de Chaîne Optimale
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Trouvez le chemin le moins cher en utilisant vos CCU Warbond
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <ShipSelector value={chainFrom} onChange={setChainFrom} label="Départ" exclude={chainTo} />
              <ShipSelector value={chainTo} onChange={setChainTo} label="Objectif" exclude={chainFrom} />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <Info className="w-3.5 h-3.5" />
              <span>{ownedCCUs.length} CCU Warbond dans votre collection</span>
            </div>

            {chainResult && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 text-center">
                    <p className="text-xs text-slate-400 mb-1">Coût direct</p>
                    <p className="text-2xl font-bold text-slate-300">${chainResult.directCost}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/30 text-center">
                    <p className="text-xs text-cyan-400 mb-1">Via chaîne optimale</p>
                    <p className="text-2xl font-bold text-cyan-300">${chainResult.totalCost}</p>
                    {chainResult.totalCost < chainResult.directCost && (
                      <p className="text-xs text-green-400 mt-1 flex items-center justify-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Économie de ${chainResult.directCost - chainResult.totalCost}
                      </p>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Étapes</h3>
                  {chainResult.steps.map((step, i) => {
                    const from = getShip(step.from);
                    const to = getShip(step.to);
                    return (
                      <div
                        key={i}
                        className={clsx(
                          'flex items-center gap-3 p-3 rounded-lg border',
                          step.warbond
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : 'bg-slate-700/20 border-slate-700/50',
                        )}
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300 font-mono">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-300 flex-1">
                          {from?.name} → {to?.name}
                        </span>
                        {step.warbond && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Warbond
                          </span>
                        )}
                        <span className={clsx(
                          'text-sm font-mono font-semibold',
                          step.warbond ? 'text-amber-300' : 'text-cyan-400',
                        )}>
                          ${step.cost}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {chainFrom && chainTo && !chainResult && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/30 text-center">
                <p className="text-red-400 text-sm">
                  Aucun chemin trouvé. Le vaisseau cible doit avoir une valeur supérieure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── COLLECTION TAB ──────────────────────────────────────────── */}
      {tab === 'collection' && (
        <div className="space-y-6">
          {/* Warbond CCUs */}
          <div className="card p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              CCU Warbond Disponibles
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Cochez les CCU que vous possédez pour optimiser vos chaînes
            </p>
            <div className="space-y-2">
              {SAMPLE_WARBOND.map(wb => {
                const from = getShip(wb.from);
                const to = getShip(wb.to);
                const owned = isOwned(wb);
                const savings = wb.normalPrice - wb.warbondPrice;
                return (
                  <button
                    key={`${wb.from}-${wb.to}`}
                    onClick={() => toggleWarbond(wb)}
                    className={clsx(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition text-left',
                      owned
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-700/20 border-slate-700/50 hover:border-slate-600',
                    )}
                  >
                    <div className={clsx(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition',
                      owned ? 'bg-amber-500 border-amber-500' : 'border-slate-600',
                    )}>
                      {owned && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-200">
                        {from?.name} → {to?.name}
                      </span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500">Normal: ${wb.normalPrice}</span>
                        <span className="text-xs text-amber-300 font-medium">Warbond: ${wb.warbondPrice}</span>
                        {savings > 0 && (
                          <span className="text-xs text-green-400">-${savings}</span>
                        )}
                      </div>
                    </div>
                    {owned && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {ownedCCUs.length} / {SAMPLE_WARBOND.length} CCU marqués comme possédés
            </p>
          </div>

          {/* Saved Pledges */}
          <div className="card p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              Mes Vaisseaux Pledge
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {PLEDGE_SHIPS.sort((a, b) => a.value - b.value).map(ship => {
                const inFleet = fleet.includes(ship.id);
                return (
                  <button
                    key={ship.id}
                    onClick={() => inFleet ? removeFromFleet(ship.id) : addToFleet(ship.id)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition',
                      inFleet
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                        : 'bg-slate-700/20 border-slate-700/50 text-slate-400 hover:border-slate-600',
                    )}
                  >
                    {inFleet ? (
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate flex-1">{ship.name}</span>
                    <span className="text-xs font-mono text-cyan-400/70">${ship.value}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <span className="text-sm text-slate-400">{fleet.length} vaisseau(x) enregistré(s)</span>
              <span className="text-lg font-bold text-cyan-300">${fleetValue}</span>
            </div>
            {fleet.length > 0 && (
              <button
                onClick={() => setFleet([])}
                className="mt-2 text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── BUDGET TAB ──────────────────────────────────────────────── */}
      {tab === 'budget' && (
        <div className="space-y-6">
          <div className="card p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Planificateur de Budget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ShipSelector value={budgetStart} onChange={setBudgetStart} label="Vaisseau de départ" />
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Budget maximum (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    value={budgetAmount}
                    onChange={e => setBudgetAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 focus:border-cyan-500/50 focus:outline-none transition"
                  />
                </div>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={5}
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-cyan-500"
                />
              </div>
            </div>

            {budgetTargets.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-300 mb-2">
                  Vaisseaux accessibles avec ${budgetAmount}
                </h3>
                {budgetTargets.map(ship => {
                  const start = getShip(budgetStart);
                  const cost = ship.value - (start?.value || 0);
                  const pct = Math.round((cost / budgetAmount) * 100);
                  return (
                    <div
                      key={ship.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/20 border border-slate-700/50"
                    >
                      <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-200 font-medium">{ship.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                            {ship.category}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono font-semibold text-cyan-300">${cost}</p>
                        <p className="text-xs text-slate-500">valeur ${ship.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-700/20 border border-slate-700/50">
                <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">
                  Aucun vaisseau accessible avec ce budget.
                  {budgetAmount < 30 && ' Essayez d\'augmenter votre budget.'}
                </p>
              </div>
            )}

            {/* Quick stats */}
            {getShip(budgetStart) && (
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-700/50">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Départ</p>
                  <p className="text-sm font-semibold text-slate-300">${getShip(budgetStart).value}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="text-sm font-semibold text-green-400">${budgetAmount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Valeur max</p>
                  <p className="text-sm font-semibold text-cyan-300">
                    ${getShip(budgetStart).value + budgetAmount}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
