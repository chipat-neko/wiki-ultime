import React, { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import {
  Map, Gem, Rocket, Timer, TrendingUp, Trash2, Plus, ArrowRight,
  ChevronDown, AlertTriangle, DollarSign, Clock, Package, Columns,
  History, BarChart3, X, Save, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { useLiveMining } from '../../hooks/useLiveData.js';
import {
  MINERALS,
  MINING_BODIES,
  ORE_BUYERS,
  RARITY_LABELS,
  METHOD_LABELS,
  findMineralLocations,
  getMineralsSorted,
  MINING_LASERS,
  MINING_SHIPS,
} from '../../datasets/miningData.js';

// ─── Constants ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'planner',    label: 'Planificateur', icon: Map },
  { id: 'compare',    label: 'Comparaison',   icon: Columns },
  { id: 'history',    label: 'Historique',     icon: History },
];

const REFINERY_METHODS = [
  { id: 'cormack',    name: 'Cormack',    speed: 1.0, efficiency: 1.0,  costMult: 1.0  },
  { id: 'dinyx',      name: 'Dinyx Solventation', speed: 0.7, efficiency: 0.85, costMult: 0.6 },
  { id: 'electrostarolysis', name: 'Electrostarolysis', speed: 0.85, efficiency: 0.95, costMult: 0.8 },
  { id: 'ferron',     name: 'Ferron Exchange', speed: 1.2, efficiency: 1.0,  costMult: 1.3 },
  { id: 'gaskin',     name: 'Gaskin Process', speed: 0.5, efficiency: 0.80, costMult: 0.4 },
  { id: 'kazen',      name: 'Kazen Winnowing', speed: 1.5, efficiency: 0.90, costMult: 1.5 },
  { id: 'xcr',        name: 'XCR Reaction',   speed: 0.6, efficiency: 0.92, costMult: 0.5 },
];

const STORAGE_KEY = 'mining-route-sessions';

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 200)));
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function estimateProfit(mineral, ship, laser, refineryMethod, fillPercent = 0.8) {
  if (!mineral || !ship) return null;
  const cargoFilled = ship.cargoSCU * fillPercent;
  const valuePerSCU = mineral.value * 100;
  const rawRevenue = cargoFilled * valuePerSCU;
  const extractionRate = laser ? laser.stats.extractionRate : 0.08;
  const miningTimeMin = cargoFilled / (extractionRate * 60);
  const method = refineryMethod || REFINERY_METHODS[0];
  const refineryTimeMin = cargoFilled * 0.5 * method.speed;
  const refineryCost = rawRevenue * 0.08 * method.costMult;
  const refinedRevenue = rawRevenue * method.efficiency;
  const netProfit = refinedRevenue - refineryCost;
  const travelTimeMin = 12;
  const totalTimeMin = miningTimeMin + refineryTimeMin + travelTimeMin;
  const profitPerHour = totalTimeMin > 0 ? (netProfit / totalTimeMin) * 60 : 0;

  return {
    cargoFilled: Math.round(cargoFilled),
    rawRevenue: Math.round(rawRevenue),
    refinedRevenue: Math.round(refinedRevenue),
    refineryCost: Math.round(refineryCost),
    netProfit: Math.round(netProfit),
    miningTimeMin: Math.round(miningTimeMin),
    refineryTimeMin: Math.round(refineryTimeMin),
    travelTimeMin,
    totalTimeMin: Math.round(totalTimeMin),
    profitPerHour: Math.round(profitPerHour),
  };
}

function formatAUEC(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return String(val);
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function MineralBadge({ mineral }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border', mineral.bg, mineral.color, mineral.border)}>
      <Gem className="w-3 h-3" />
      {mineral.name}
    </span>
  );
}

function StatBox({ icon: Icon, label, value, sub, accent = 'text-cyan-400' }) {
  return (
    <div className="bg-space-800/50 border border-space-700/50 rounded-lg p-3 text-center">
      <Icon className={clsx('w-4 h-4 mx-auto mb-1', accent)} />
      <div className={clsx('text-lg font-bold', accent)}>{value}</div>
      <div className="text-xs text-space-400">{label}</div>
      {sub && <div className="text-[10px] text-space-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-space-400 mb-1 font-medium">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-space-800 border border-space-600/50 rounded-lg px-3 py-2 text-sm text-space-100 appearance-none pr-8 focus:outline-none focus:border-cyan-500/60"
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-space-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Planner Tab ────────────────────────────────────────────────────────────────

function PlannerTab() {
  const [mineralId, setMineralId] = useState('');
  const [shipId, setShipId] = useState('prospector');
  const [laserId, setLaserId] = useState('helix-i');
  const [refineryId, setRefineryId] = useState('cormack');
  const [fillPct, setFillPct] = useState(80);

  const mineral = MINERALS[mineralId] || null;
  const ship = MINING_SHIPS.find(s => s.id === shipId) || null;
  const laser = MINING_LASERS.find(l => l.id === laserId) || null;
  const refineryMethod = REFINERY_METHODS.find(r => r.id === refineryId) || REFINERY_METHODS[0];

  const sortedMinerals = useMemo(() => getMineralsSorted(), []);
  const locations = useMemo(() => mineralId ? findMineralLocations(mineralId) : [], [mineralId]);

  const refineries = useMemo(() => ORE_BUYERS.filter(b => b.hasRefinery), []);
  const sellers = useMemo(() => ORE_BUYERS.filter(b => b.buysRefined || b.buysRaw), []);

  const shipLasers = useMemo(() => {
    if (!ship) return MINING_LASERS.filter(l => l.mountType === 'ship');
    if (ship.type === 'vehicle') return MINING_LASERS.filter(l => l.mountType === 'roc' || l.mountType === 'hand');
    return MINING_LASERS.filter(l => l.mountType === 'ship');
  }, [ship]);

  const profit = useMemo(
    () => estimateProfit(mineral, ship, laser, refineryMethod, fillPct / 100),
    [mineral, ship, laser, refineryMethod, fillPct]
  );

  const bestLocation = useMemo(() => {
    if (!locations.length) return null;
    const scored = locations.map(loc => {
      let score = 0;
      if (loc.body.danger === 'low') score += 3;
      else if (loc.body.danger === 'medium') score += 1;
      if (loc.body.system === 'Stanton') score += 2;
      if (loc.methods.includes('ship')) score += 1;
      return { ...loc, score };
    });
    return scored.sort((a, b) => b.score - a.score)[0];
  }, [locations]);

  const nearestRefinery = useMemo(() => {
    if (!bestLocation) return refineries[0] || null;
    const sys = bestLocation.body.system;
    return refineries.find(r => r.system === sys) || refineries[0] || null;
  }, [bestLocation, refineries]);

  const bestSeller = useMemo(() => {
    if (!nearestRefinery) return sellers[0] || null;
    const sys = nearestRefinery.system;
    return sellers.find(s => s.system === sys && !s.hasRefinery) || sellers[0] || null;
  }, [nearestRefinery, sellers]);

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SelectField
          label="Minerai cible"
          value={mineralId}
          onChange={setMineralId}
          placeholder="Choisir un minerai..."
          options={sortedMinerals.map(m => ({ value: m.id, label: `${m.name} — ${m.value} aUEC/u` }))}
        />
        <SelectField
          label="Vaisseau / Véhicule"
          value={shipId}
          onChange={setShipId}
          placeholder="Choisir..."
          options={MINING_SHIPS.map(s => ({ value: s.id, label: `${s.name} (${s.cargoSCU} SCU)` }))}
        />
        <SelectField
          label="Laser de minage"
          value={laserId}
          onChange={v => setLaserId(v)}
          placeholder="Choisir..."
          options={shipLasers.map(l => ({ value: l.id, label: `${l.name} (S${l.size})` }))}
        />
        <SelectField
          label="Méthode de raffinage"
          value={refineryId}
          onChange={setRefineryId}
          placeholder="Choisir..."
          options={REFINERY_METHODS.map(r => ({ value: r.id, label: `${r.name} (×${r.speed})` }))}
        />
      </div>

      {/* Fill slider */}
      <div className="bg-space-800/40 border border-space-700/40 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-space-300">Taux de remplissage cargo</span>
          <span className="text-sm font-bold text-cyan-400">{fillPct}%</span>
        </div>
        <input
          type="range" min={10} max={100} step={5} value={fillPct}
          onChange={e => setFillPct(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
      </div>

      {/* Known locations */}
      {mineral && locations.length > 0 && (
        <div className="bg-space-800/40 border border-space-700/40 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-space-200 mb-3 flex items-center gap-2">
            <Map className="w-4 h-4 text-cyan-400" />
            Localisations connues — <MineralBadge mineral={mineral} />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {locations.map(loc => {
              const danger = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' };
              return (
                <div key={loc.body.id} className={clsx(
                  'flex items-center justify-between px-3 py-2 rounded-lg border text-sm',
                  bestLocation?.body.id === loc.body.id ? 'bg-cyan-900/20 border-cyan-700/50' : 'bg-space-900/30 border-space-700/30'
                )}>
                  <div>
                    <span className="text-space-100 font-medium">{loc.body.name}</span>
                    <span className="text-space-500 text-xs ml-1">({loc.body.system})</span>
                    {bestLocation?.body.id === loc.body.id && (
                      <span className="ml-2 text-[10px] bg-cyan-900/40 text-cyan-300 px-1.5 py-0.5 rounded">Recommandé</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {loc.methods.map(m => (
                      <span key={m} className={clsx('text-xs px-1.5 py-0.5 rounded', METHOD_LABELS[m]?.bg, METHOD_LABELS[m]?.color)}>
                        {METHOD_LABELS[m]?.short}
                      </span>
                    ))}
                    <span className={clsx('text-xs', danger[loc.body.danger] || 'text-space-400')}>
                      {loc.body.danger === 'high' && <AlertTriangle className="w-3 h-3 inline" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended route */}
      {mineral && bestLocation && nearestRefinery && bestSeller && (
        <div className="bg-gradient-to-r from-space-800/60 to-space-900/40 border border-cyan-700/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Route recommandée
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="bg-space-800 border border-space-600/50 rounded-lg px-3 py-2">
              <div className="text-[10px] text-space-500 uppercase">Minage</div>
              <div className="text-space-100 font-medium">{bestLocation.body.name}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-space-500" />
            <div className="bg-space-800 border border-green-700/40 rounded-lg px-3 py-2">
              <div className="text-[10px] text-green-400 uppercase">Raffinerie</div>
              <div className="text-space-100 font-medium">{nearestRefinery.name}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-space-500" />
            <div className="bg-space-800 border border-yellow-700/40 rounded-lg px-3 py-2">
              <div className="text-[10px] text-yellow-400 uppercase">Vente</div>
              <div className="text-space-100 font-medium">{bestSeller.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Profit estimator */}
      {profit && (
        <div>
          <h3 className="text-sm font-semibold text-space-200 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" /> Estimation de profit
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatBox icon={Package} label="Cargo rempli" value={`${profit.cargoFilled} SCU`} accent="text-cyan-400" />
            <StatBox icon={Clock} label="Temps minage" value={`${profit.miningTimeMin} min`} accent="text-blue-400" />
            <StatBox icon={Timer} label="Temps raffinage" value={`${profit.refineryTimeMin} min`} accent="text-purple-400" />
            <StatBox icon={DollarSign} label="Revenu raffiné" value={formatAUEC(profit.refinedRevenue)} sub="aUEC" accent="text-yellow-400" />
            <StatBox icon={TrendingUp} label="Profit net" value={formatAUEC(profit.netProfit)} sub="aUEC" accent="text-green-400" />
            <StatBox icon={BarChart3} label="Profit / heure" value={formatAUEC(profit.profitPerHour)} sub="aUEC/h" accent="text-emerald-400" />
          </div>
          <div className="mt-2 text-xs text-space-500 text-center">
            Temps total estimé : {profit.totalTimeMin} min (minage {profit.miningTimeMin} + raffinage {profit.refineryTimeMin} + trajet ~{profit.travelTimeMin} min)
          </div>
        </div>
      )}

      {!mineralId && (
        <div className="text-center py-12 text-space-500">
          <Gem className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Sélectionnez un minerai pour planifier votre route de minage.</p>
        </div>
      )}
    </div>
  );
}

// ─── Compare Tab ────────────────────────────────────────────────────────────────

function CompareTab() {
  const [slots, setSlots] = useState([
    { mineralId: 'quantanium', shipId: 'prospector' },
    { mineralId: 'bexalite', shipId: 'prospector' },
    { mineralId: '', shipId: 'mole' },
  ]);

  const updateSlot = useCallback((idx, field, value) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }, []);

  const sortedMinerals = useMemo(() => getMineralsSorted(), []);

  const results = useMemo(() => slots.map(slot => {
    const mineral = MINERALS[slot.mineralId] || null;
    const ship = MINING_SHIPS.find(s => s.id === slot.shipId) || null;
    const laser = MINING_LASERS.find(l => l.recommended && l.mountType === 'ship') || MINING_LASERS[0];
    const profit = estimateProfit(mineral, ship, laser, REFINERY_METHODS[0], 0.8);
    const locations = slot.mineralId ? findMineralLocations(slot.mineralId) : [];
    return { mineral, ship, laser, profit, locations };
  }), [slots]);

  const bestIdx = useMemo(() => {
    let best = -1, bestVal = 0;
    results.forEach((r, i) => {
      if (r.profit && r.profit.profitPerHour > bestVal) {
        bestVal = r.profit.profitPerHour;
        best = i;
      }
    });
    return best;
  }, [results]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-space-400">
        Comparez jusqu'à 3 routes de minage pour trouver la plus rentable.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {slots.map((slot, idx) => {
          const res = results[idx];
          const isBest = idx === bestIdx && res.profit;
          return (
            <div key={idx} className={clsx(
              'bg-space-800/50 border rounded-lg p-4 space-y-3',
              isBest ? 'border-green-500/60 ring-1 ring-green-500/20' : 'border-space-700/50'
            )}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-space-200">Route {idx + 1}</h4>
                {isBest && (
                  <span className="text-[10px] bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full font-medium">
                    Meilleure
                  </span>
                )}
              </div>

              <SelectField
                label="Minerai"
                value={slot.mineralId}
                onChange={v => updateSlot(idx, 'mineralId', v)}
                placeholder="Choisir..."
                options={sortedMinerals.map(m => ({ value: m.id, label: m.name }))}
              />
              <SelectField
                label="Vaisseau"
                value={slot.shipId}
                onChange={v => updateSlot(idx, 'shipId', v)}
                placeholder="Choisir..."
                options={MINING_SHIPS.map(s => ({ value: s.id, label: `${s.name} (${s.cargoSCU} SCU)` }))}
              />

              {res.mineral && (
                <div className="text-xs text-space-400">
                  <span className={clsx('font-medium', RARITY_LABELS[res.mineral.rarity]?.color)}>
                    {RARITY_LABELS[res.mineral.rarity]?.label}
                  </span>
                  {' · '}{res.locations.length} localisation{res.locations.length > 1 ? 's' : ''}
                </div>
              )}

              {res.profit ? (
                <div className="space-y-2 pt-2 border-t border-space-700/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-space-400">Cargo</span>
                    <span className="text-space-200">{res.profit.cargoFilled} SCU</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-space-400">Temps total</span>
                    <span className="text-space-200">{res.profit.totalTimeMin} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-space-400">Profit net</span>
                    <span className="text-green-400 font-medium">{formatAUEC(res.profit.netProfit)} aUEC</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-space-300">Profit / heure</span>
                    <span className={clsx(isBest ? 'text-green-300' : 'text-cyan-400')}>
                      {formatAUEC(res.profit.profitPerHour)} aUEC/h
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-space-500 text-center py-4">Sélectionnez un minerai</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── History Tab ────────────────────────────────────────────────────────────────

function HistoryTab() {
  const [sessions, setSessions] = useState(loadSessions);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mineralId: '', shipId: 'prospector', yieldSCU: '', sellPrice: '', notes: '' });

  const sortedMinerals = useMemo(() => getMineralsSorted(), []);

  const addSession = useCallback(() => {
    if (!form.mineralId || !form.yieldSCU) return;
    const mineral = MINERALS[form.mineralId];
    const ship = MINING_SHIPS.find(s => s.id === form.shipId);
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mineralId: form.mineralId,
      mineralName: mineral?.name || form.mineralId,
      shipId: form.shipId,
      shipName: ship?.name || form.shipId,
      yieldSCU: Number(form.yieldSCU),
      sellPrice: Number(form.sellPrice) || 0,
      revenue: Number(form.yieldSCU) * (Number(form.sellPrice) || (mineral?.value || 0) * 100),
      notes: form.notes,
    };
    const updated = [entry, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    setForm({ mineralId: '', shipId: 'prospector', yieldSCU: '', sellPrice: '', notes: '' });
    setShowForm(false);
  }, [form, sessions]);

  const removeSession = useCallback((id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
  }, [sessions]);

  const clearAll = useCallback(() => {
    setSessions([]);
    saveSessions([]);
  }, []);

  const stats = useMemo(() => {
    if (!sessions.length) return null;
    const totalRevenue = sessions.reduce((s, e) => s + e.revenue, 0);
    const totalSCU = sessions.reduce((s, e) => s + e.yieldSCU, 0);
    const avgRevenue = totalRevenue / sessions.length;
    return { totalRevenue, totalSCU, avgRevenue, count: sessions.length };
  }, [sessions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-space-400">Enregistrez vos sessions de minage pour suivre vos revenus.</p>
        <div className="flex gap-2">
          {sessions.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Tout effacer
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" /> Nouvelle session
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-space-800/60 border border-cyan-700/30 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectField
              label="Minerai"
              value={form.mineralId}
              onChange={v => setForm(f => ({ ...f, mineralId: v }))}
              placeholder="Choisir..."
              options={sortedMinerals.map(m => ({ value: m.id, label: m.name }))}
            />
            <SelectField
              label="Vaisseau"
              value={form.shipId}
              onChange={v => setForm(f => ({ ...f, shipId: v }))}
              placeholder="Choisir..."
              options={MINING_SHIPS.map(s => ({ value: s.id, label: s.name }))}
            />
            <div>
              <label className="block text-xs text-space-400 mb-1 font-medium">Rendement (SCU)</label>
              <input
                type="number" min={0} max={999}
                value={form.yieldSCU}
                onChange={e => setForm(f => ({ ...f, yieldSCU: e.target.value }))}
                className="w-full bg-space-800 border border-space-600/50 rounded-lg px-3 py-2 text-sm text-space-100 focus:outline-none focus:border-cyan-500/60"
                placeholder="ex: 28"
              />
            </div>
            <div>
              <label className="block text-xs text-space-400 mb-1 font-medium">Prix vente (aUEC/SCU)</label>
              <input
                type="number" min={0}
                value={form.sellPrice}
                onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))}
                className="w-full bg-space-800 border border-space-600/50 rounded-lg px-3 py-2 text-sm text-space-100 focus:outline-none focus:border-cyan-500/60"
                placeholder="auto si vide"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-space-400 mb-1 font-medium">Notes (optionnel)</label>
            <input
              type="text" maxLength={120}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-space-800 border border-space-600/50 rounded-lg px-3 py-2 text-sm text-space-100 focus:outline-none focus:border-cyan-500/60"
              placeholder="Spot, durée, remarques..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-xs text-space-400 hover:text-space-200 px-3 py-1.5">
              Annuler
            </button>
            <button
              onClick={addSession}
              disabled={!form.mineralId || !form.yieldSCU}
              className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Save className="w-3 h-3" /> Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox icon={History} label="Sessions" value={stats.count} accent="text-cyan-400" />
          <StatBox icon={Package} label="Total miné" value={`${stats.totalSCU} SCU`} accent="text-blue-400" />
          <StatBox icon={DollarSign} label="Revenu total" value={formatAUEC(stats.totalRevenue)} sub="aUEC" accent="text-green-400" />
          <StatBox icon={TrendingUp} label="Revenu moyen" value={formatAUEC(Math.round(stats.avgRevenue))} sub="aUEC/session" accent="text-yellow-400" />
        </div>
      )}

      {/* Session list */}
      {sessions.length > 0 ? (
        <div className="space-y-2">
          {sessions.map(s => {
            const mineral = MINERALS[s.mineralId];
            return (
              <div key={s.id} className="flex items-center justify-between bg-space-800/40 border border-space-700/30 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {mineral && <MineralBadge mineral={mineral} />}
                  <div className="min-w-0">
                    <div className="text-sm text-space-200">
                      <span className="font-medium">{s.yieldSCU} SCU</span>
                      <span className="text-space-500 mx-1">·</span>
                      <span className="text-space-400">{s.shipName}</span>
                    </div>
                    <div className="text-xs text-space-500 truncate">
                      {new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {s.notes && <span className="ml-2 text-space-400">— {s.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-green-400">{formatAUEC(s.revenue)} aUEC</span>
                  <button onClick={() => removeSession(s.id)} className="text-space-600 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-space-500">
          <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Aucune session enregistrée.</p>
          <p className="text-xs mt-1">Cliquez sur "Nouvelle session" pour commencer le suivi.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function MiningRoutePlanner() {
  const [activeTab, setActiveTab] = useState('planner');
  const { data: liveData, loading, error } = useLiveMining();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-space-100 flex items-center gap-2">
            <Map className="w-6 h-6 text-cyan-400" />
            Planificateur de Routes Minières
          </h1>
          <p className="text-sm text-space-400 mt-1">
            Optimisez vos sessions de minage : minerai, route, profit estimé.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-space-500">
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
          ) : liveData ? (
            <span className="flex items-center gap-1 text-green-400"><Wifi className="w-3 h-3" /> Live UEX</span>
          ) : (
            <span className="flex items-center gap-1 text-space-500"><WifiOff className="w-3 h-3" /> Données locales</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-space-800/40 rounded-lg p-1 border border-space-700/30">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-space-400 hover:text-space-200 hover:bg-space-700/30 border border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'planner' && <PlannerTab />}
      {activeTab === 'compare' && <CompareTab />}
      {activeTab === 'history' && <HistoryTab />}
    </div>
  );
}
