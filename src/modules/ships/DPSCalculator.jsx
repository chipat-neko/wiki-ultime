/**
 * Calculateur DPS Vaisseaux — style erkul.games
 * Onglets : Builder DPS / Comparateur / Classement des Armes
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  Zap, Flame, Target, Timer, ChevronDown, RotateCcw,
  TrendingUp, Crosshair, Shield, Thermometer, Radio,
  ArrowRight, Info, Star, BarChart2, List,
} from 'lucide-react';
import {
  WEAPON_PROFILES,
  SHIP_HARDPOINTS,
  DPS_SCENARIOS,
  TARGET_SHIPS,
  calcWeaponDPS,
  calcLoadoutDPS,
  calcHeatGeneration,
  getShieldBreakTime,
  calcDPSCurve,
  getBestWeaponForSlot,
  formatDPS,
} from '../../datasets/dpsData.js';
import { SHIPS } from '../../datasets/ships.js';

// ─────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────

const QUICK_SHIPS = [
  'aegis-gladius', 'aegis-avenger-titan', 'anvil-f7c-hornet',
  'anvil-f7a-hornet-mk2', 'drake-cutlass-black', 'misc-freelancer',
  'rsi-mantis', 'aegis-hammerhead', 'aegis-redeemer',
  'anvil-valkyrie', 'rsi-constellation-andromeda', 'crusader-ares-inferno',
];

const SCENARIO_ICONS = { burst: Zap, sustained_15s: Flame, sustained_60s: Timer, alpha: Target };

const TYPE_COLORS = {
  laser_cannon: '#06b6d4',     // cyan
  laser_repeater: '#22d3ee',   // cyan clair
  neutron_cannon: '#a78bfa',   // violet
  plasma_cannon: '#f97316',    // orange
  ballistic_cannon: '#94a3b8', // gris
  ballistic_repeater: '#cbd5e1',
  ballistic_gatling: '#e2e8f0',
  distortion_cannon: '#818cf8',
  distortion_repeater: '#6366f1',
  tachyon_cannon: '#fbbf24',   // or
  mass_driver: '#f87171',      // rouge
};

const typeLabel = (t) => t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—';

// ─────────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────────

function SizeBadge({ size }) {
  const colors = ['', 'bg-green-900 text-green-300', 'bg-cyan-900 text-cyan-300',
    'bg-blue-900 text-blue-300', 'bg-purple-900 text-purple-300',
    'bg-yellow-900 text-yellow-300', 'bg-orange-900 text-orange-300',
    'bg-red-900 text-red-300', 'bg-pink-900 text-pink-300', 'bg-white text-black'];
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${colors[size] || 'bg-space-600 text-white'}`}>
      S{size}
    </span>
  );
}

function DPSBar({ value, max, color = 'bg-cyan-500' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-space-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-space-300 w-14 text-right font-mono">{formatDPS(value)}</span>
    </div>
  );
}

function HeatBar({ heatPct }) {
  const color = heatPct > 80 ? 'bg-red-500' : heatPct > 50 ? 'bg-orange-500' : 'bg-green-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-space-400 mb-1">
        <span>Chaleur</span>
        <span className={heatPct > 80 ? 'text-red-400' : 'text-space-300'}>{Math.round(heatPct)}%</span>
      </div>
      <div className="h-2 bg-space-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(100, heatPct)}%` }}
        />
      </div>
    </div>
  );
}

function WeaponSelect({ slotSize, slotLabel, value, onChange }) {
  const options = WEAPON_PROFILES.filter(w => w.size === slotSize);
  return (
    <div className="flex items-center gap-2">
      <Sizebadge2 size={slotSize} />
      <div className="flex-1">
        <label className="text-xs text-space-400 block mb-0.5">{slotLabel}</label>
        <select
          className="select w-full text-sm"
          value={value || ''}
          onChange={e => onChange(e.target.value || null)}
        >
          <option value="">— Vide —</option>
          {options.map(w => (
            <option key={w.id} value={w.id}>
              {w.name} ({formatDPS(w.burstDPS)} burst)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Sizebadge2({ size }) {
  const colors = ['', 'bg-green-900/60 text-green-300', 'bg-cyan-900/60 text-cyan-300',
    'bg-blue-900/60 text-blue-300', 'bg-purple-900/60 text-purple-300',
    'bg-yellow-900/60 text-yellow-300', 'bg-orange-900/60 text-orange-300',
    'bg-red-900/60 text-red-300', 'bg-pink-900/60 text-pink-300'];
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors[size] || 'bg-space-700 text-white'}`}>
      S{size}
    </span>
  );
}

// Tooltip recharts customisé
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-2 text-xs">
      <div className="text-space-300 mb-1">t = {label}s</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white font-mono">{formatDPS(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Onglet 1 : Builder DPS
// ─────────────────────────────────────────────────────────────────

function BuilderTab() {
  const [shipId, setShipId]     = useState('aegis-gladius');
  const [slots, setSlots]       = useState({});         // { slotKey: weaponId }
  const [scenario, setScenario] = useState('sustained_15s');
  const [targetId, setTargetId] = useState('hornet');
  const [autoFill, setAutoFill] = useState(false);

  const hardpoints = SHIP_HARDPOINTS[shipId];
  const ship = SHIPS.find(s => s.id === shipId);

  // Génère la liste de slots à partir des hardpoints
  const allSlots = useMemo(() => {
    if (!hardpoints) return [];
    const list = [];
    let idx = 0;
    const addGroup = (group, zone) => {
      for (const g of group) {
        for (let i = 0; i < g.count; i++) {
          idx++;
          list.push({ key: `${zone}-${idx}`, size: g.size, zone, label: `${zone === 'wings' ? 'Aile' : zone === 'nose' ? 'Nez' : 'Tourelle'} ${idx} (S${g.size})` });
        }
      }
    };
    addGroup(hardpoints.wings || [], 'wings');
    addGroup(hardpoints.nose || [], 'nose');
    addGroup(hardpoints.turrets || [], 'turrets');
    return list;
  }, [hardpoints]);

  // Auto-fill : remplit chaque slot avec la meilleure arme de sa taille
  const handleAutoFill = useCallback(() => {
    const newSlots = {};
    for (const slot of allSlots) {
      const best = getBestWeaponForSlot(slot.size);
      if (best) newSlots[slot.key] = best.id;
    }
    setSlots(newSlots);
  }, [allSlots]);

  // Réinitialiser quand on change de vaisseau
  const handleShipChange = (id) => {
    setShipId(id);
    setSlots({});
  };

  // Résoudre les armes sélectionnées
  const selectedWeapons = useMemo(() =>
    allSlots.map(s => WEAPON_PROFILES.find(w => w.id === slots[s.key]) || null),
    [allSlots, slots]
  );

  // Stats totales
  const stats = useMemo(() => calcLoadoutDPS(selectedWeapons, scenario), [selectedWeapons, scenario]);
  const heatGen = useMemo(() => calcHeatGeneration(selectedWeapons, 15), [selectedWeapons]);
  const energyPerSec = useMemo(() =>
    selectedWeapons.filter(Boolean).reduce((s, w) => s + w.energyPerSec, 0),
    [selectedWeapons]
  );
  const minRange = useMemo(() => {
    const valid = selectedWeapons.filter(Boolean);
    if (!valid.length) return null;
    return Math.min(...valid.map(w => w.range));
  }, [selectedWeapons]);
  const heatCapMax = useMemo(() =>
    allSlots.reduce((s, sl) => {
      const cap = { 1: 600, 2: 900, 3: 1400, 4: 2200, 5: 3500, 6: 5500, 7: 8500 };
      return s + (cap[sl.size] || 600);
    }, 0),
    [allSlots]
  );
  const heatPct = heatCapMax > 0 ? (heatGen / heatCapMax) * 100 : 0;
  const overheatMin = useMemo(() => {
    const valid = selectedWeapons.filter(Boolean);
    if (!valid.length) return null;
    return Math.min(...valid.map(w => w.overheatTime));
  }, [selectedWeapons]);

  // Temps avant surchauffe (bouclier)
  const target = TARGET_SHIPS.find(t => t.id === targetId);
  const shieldTime = target && stats.energy > 0
    ? getShieldBreakTime(stats.energy, target.shieldHp, target.shieldRegen)
    : null;

  // Courbe DPS
  const curve = useMemo(() => calcDPSCurve(selectedWeapons, 25), [selectedWeapons]);

  const scenarioObj = DPS_SCENARIOS.find(s => s.id === scenario);
  const SIcon = SCENARIO_ICONS[scenario] || Zap;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Colonne Gauche : Sélecteur + Slots ── */}
      <div className="space-y-4">
        {/* Sélecteur vaisseau */}
        <div className="card p-4">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <Crosshair size={16} className="text-cyan-400" />
            Sélection du vaisseau
          </h3>
          <select
            className="select w-full mb-3"
            value={shipId}
            onChange={e => handleShipChange(e.target.value)}
          >
            {Object.entries(SHIP_HARDPOINTS).map(([id, hp]) => (
              <option key={id} value={id}>{hp.label}</option>
            ))}
          </select>

          {/* Boutons rapides */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SHIPS.map(id => {
              const hp = SHIP_HARDPOINTS[id];
              if (!hp) return null;
              return (
                <button
                  key={id}
                  onClick={() => handleShipChange(id)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    id === shipId
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-space-700 border-space-600 text-space-300 hover:border-cyan-600'
                  }`}
                >
                  {hp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info vaisseau */}
        {hardpoints && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title flex items-center gap-2">
                <BarChart2 size={16} className="text-cyan-400" />
                Points d'armes
              </h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-space-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFill}
                    onChange={e => { setAutoFill(e.target.checked); if (e.target.checked) handleAutoFill(); }}
                    className="rounded"
                  />
                  Meilleure config auto
                </label>
                <button onClick={() => setSlots({})} className="btn-ghost text-xs p-1" title="Vider">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Résumé hardpoints */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[...hardpoints.wings, ...hardpoints.nose, ...hardpoints.turrets].map((g, i) => (
                <span key={i} className="badge badge-blue text-xs">
                  {g.count}× S{g.size}
                </span>
              ))}
              {allSlots.length === 0 && (
                <span className="text-space-400 text-sm">Aucun point d'arme disponible</span>
              )}
            </div>

            {/* Slots d'armes */}
            <div className="space-y-3">
              {allSlots.length > 0 ? (
                <>
                  {/* Wings */}
                  {allSlots.filter(s => s.zone === 'wings').length > 0 && (
                    <div>
                      <div className="text-xs text-space-400 font-medium mb-1.5 uppercase tracking-wide">Ailes</div>
                      <div className="space-y-2">
                        {allSlots.filter(s => s.zone === 'wings').map(slot => (
                          <WeaponSelect
                            key={slot.key}
                            slotSize={slot.size}
                            slotLabel={slot.label}
                            value={slots[slot.key]}
                            onChange={val => setSlots(prev => ({ ...prev, [slot.key]: val }))}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Nose */}
                  {allSlots.filter(s => s.zone === 'nose').length > 0 && (
                    <div>
                      <div className="text-xs text-space-400 font-medium mb-1.5 uppercase tracking-wide">Nez</div>
                      <div className="space-y-2">
                        {allSlots.filter(s => s.zone === 'nose').map(slot => (
                          <WeaponSelect
                            key={slot.key}
                            slotSize={slot.size}
                            slotLabel={slot.label}
                            value={slots[slot.key]}
                            onChange={val => setSlots(prev => ({ ...prev, [slot.key]: val }))}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Turrets */}
                  {allSlots.filter(s => s.zone === 'turrets').length > 0 && (
                    <div>
                      <div className="text-xs text-space-400 font-medium mb-1.5 uppercase tracking-wide">Tourelles</div>
                      <div className="space-y-2">
                        {allSlots.filter(s => s.zone === 'turrets').map(slot => (
                          <WeaponSelect
                            key={slot.key}
                            slotSize={slot.size}
                            slotLabel={slot.label}
                            value={slots[slot.key]}
                            onChange={val => setSlots(prev => ({ ...prev, [slot.key]: val }))}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-space-400 text-sm">Aucun slot configuré pour ce vaisseau.</p>
              )}
            </div>
          </div>
        )}

        {/* Sélecteur scénario */}
        <div className="card p-4">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <SIcon size={16} className="text-cyan-400" />
            Scénario DPS
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {DPS_SCENARIOS.map(sc => {
              const Icon = SCENARIO_ICONS[sc.id] || Zap;
              return (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    scenario === sc.id
                      ? 'bg-cyan-900/40 border-cyan-600 text-white'
                      : 'bg-space-700 border-space-600 text-space-300 hover:border-space-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon size={13} className={scenario === sc.id ? 'text-cyan-400' : 'text-space-400'} />
                    <span className="text-xs font-semibold">{sc.label}</span>
                  </div>
                  <p className="text-[10px] text-space-400 leading-tight">{sc.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Colonne Droite : Stats live ── */}
      <div className="space-y-4">
        {/* DPS Total */}
        <div className="card p-5 border border-cyan-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-space-300 text-sm font-medium flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              DPS Total — {scenarioObj?.label}
            </span>
            <span className="badge badge-cyan text-xs">{ship?.name || '—'}</span>
          </div>
          <div className="text-5xl font-black text-cyan-400 font-mono tracking-tight mb-1">
            {formatDPS(stats.total)}
          </div>
          <div className="text-space-400 text-xs mb-4">dps</div>

          {/* Breakdown EM / Phys / Dist */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Énergie', val: stats.energy, color: 'text-cyan-400', bar: 'bg-cyan-500' },
              { label: 'Physique', val: stats.physical, color: 'text-slate-300', bar: 'bg-slate-400' },
              { label: 'Distorsion', val: stats.distortion, color: 'text-purple-400', bar: 'bg-purple-500' },
            ].map(({ label, val, color, bar }) => (
              <div key={label} className="text-center p-2 rounded-lg bg-space-700/60">
                <div className={`text-lg font-bold font-mono ${color}`}>{formatDPS(val)}</div>
                <div className="text-[10px] text-space-400">{label}</div>
                <div className="mt-1 h-1 bg-space-600 rounded-full overflow-hidden">
                  <div className={`h-full ${bar}`} style={{ width: stats.total > 0 ? `${(val / stats.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métriques thermiques / énergie */}
        <div className="card p-4">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <Thermometer size={16} className="text-orange-400" />
            Métriques de tir
          </h3>
          <div className="space-y-3">
            <HeatBar heatPct={heatPct} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 rounded-lg bg-space-700/60">
                <div className="text-space-400 text-xs mb-0.5">Avant surchauffe</div>
                <div className="font-mono text-orange-300 font-semibold">
                  {overheatMin != null ? `${overheatMin}s` : '—'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-space-700/60">
                <div className="text-space-400 text-xs mb-0.5">Énergie / sec</div>
                <div className="font-mono text-yellow-300 font-semibold">
                  {energyPerSec > 0 ? `${energyPerSec.toFixed(0)} kW` : '—'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-space-700/60">
                <div className="text-space-400 text-xs mb-0.5">Portée effective</div>
                <div className="font-mono text-green-300 font-semibold">
                  {minRange != null ? `${minRange.toLocaleString()} m` : '—'}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-space-700/60">
                <div className="text-space-400 text-xs mb-0.5">Armes actives</div>
                <div className="font-mono text-cyan-300 font-semibold">
                  {selectedWeapons.filter(Boolean).length} / {allSlots.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Temps de bris de bouclier */}
        <div className="card p-4">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            Temps pour briser les boucliers
          </h3>
          <div className="flex gap-2 mb-3">
            <select
              className="select flex-1 text-sm"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
            >
              {TARGET_SHIPS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.shieldHp.toLocaleString()} HP)
                </option>
              ))}
            </select>
          </div>
          {target && (
            <div className="p-3 rounded-lg bg-space-700/60 text-center">
              {shieldTime !== null ? (
                <>
                  <div className="text-3xl font-black font-mono text-blue-300">{shieldTime}s</div>
                  <div className="text-xs text-space-400 mt-1">
                    {target.label} — {target.shieldHp.toLocaleString()} HP / {target.shieldRegen} HP/s regen
                  </div>
                </>
              ) : (
                <div className="text-space-400 text-sm">
                  {stats.energy === 0
                    ? 'Aucun dégât EM — les balistiques ignorent les boucliers'
                    : 'DPS EM insuffisant pour briser la régénération'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Graphique DPS(t) */}
        <div className="card p-4">
          <h3 className="section-title mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            DPS en fonction du temps (60s)
          </h3>
          {selectedWeapons.filter(Boolean).length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={curve} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="t"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={v => `${v}s`}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={v => formatDPS(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="stepAfter"
                  dataKey="dps"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="DPS total"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-space-400 text-sm">
              Sélectionnez des armes pour voir le graphique
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Onglet 2 : Comparateur A vs B
// ─────────────────────────────────────────────────────────────────

function LoadoutPanel({ label, color }) {
  const [shipId, setShipId] = useState(label === 'A' ? 'aegis-gladius' : 'anvil-f7c-hornet');
  const [slots, setSlots]   = useState({});

  const hardpoints = SHIP_HARDPOINTS[shipId];
  const allSlots = useMemo(() => {
    if (!hardpoints) return [];
    const list = [];
    let idx = 0;
    const add = (group, zone) => {
      for (const g of group) {
        for (let i = 0; i < g.count; i++) {
          idx++;
          list.push({ key: `${zone}-${idx}`, size: g.size, zone });
        }
      }
    };
    add(hardpoints.wings || [], 'wings');
    add(hardpoints.nose || [], 'nose');
    add(hardpoints.turrets || [], 'turrets');
    return list;
  }, [hardpoints]);

  const selectedWeapons = useMemo(() =>
    allSlots.map(s => WEAPON_PROFILES.find(w => w.id === slots[s.key]) || null),
    [allSlots, slots]
  );

  const stats = {
    burst:   calcLoadoutDPS(selectedWeapons, 'burst'),
    s15:     calcLoadoutDPS(selectedWeapons, 'sustained_15s'),
    s60:     calcLoadoutDPS(selectedWeapons, 'sustained_60s'),
    alpha:   calcLoadoutDPS(selectedWeapons, 'alpha'),
  };
  const heatGen = calcHeatGeneration(selectedWeapons, 15);
  const energy  = selectedWeapons.filter(Boolean).reduce((s, w) => s + w.energyPerSec, 0);
  const minRange = selectedWeapons.filter(Boolean).length
    ? Math.min(...selectedWeapons.filter(Boolean).map(w => w.range))
    : null;

  return {
    shipId, setShipId, slots, setSlots,
    allSlots, selectedWeapons, stats, heatGen, energy, minRange,
    label, color,
  };
}

function ComparatorTab() {
  const [shipA, setShipA] = useState('aegis-gladius');
  const [shipB, setShipB] = useState('anvil-f7c-hornet');
  const [slotsA, setSlotsA] = useState({});
  const [slotsB, setSlotsB] = useState({});

  const buildSlots = (shipId) => {
    const hp = SHIP_HARDPOINTS[shipId];
    if (!hp) return [];
    const list = [];
    let idx = 0;
    const add = (group, zone) => {
      for (const g of group) {
        for (let i = 0; i < g.count; i++) {
          idx++;
          list.push({ key: `${zone}-${idx}`, size: g.size, zone });
        }
      }
    };
    add(hp.wings || [], 'wings');
    add(hp.nose || [], 'nose');
    add(hp.turrets || [], 'turrets');
    return list;
  };

  const slotsListA = useMemo(() => buildSlots(shipA), [shipA]);
  const slotsListB = useMemo(() => buildSlots(shipB), [shipB]);

  const weaponsA = useMemo(() => slotsListA.map(s => WEAPON_PROFILES.find(w => w.id === slotsA[s.key]) || null), [slotsListA, slotsA]);
  const weaponsB = useMemo(() => slotsListB.map(s => WEAPON_PROFILES.find(w => w.id === slotsB[s.key]) || null), [slotsListB, slotsB]);

  const statsA = {
    burst: calcLoadoutDPS(weaponsA, 'burst').total,
    s15:   calcLoadoutDPS(weaponsA, 'sustained_15s').total,
    s60:   calcLoadoutDPS(weaponsA, 'sustained_60s').total,
    alpha: calcLoadoutDPS(weaponsA, 'alpha').total,
    heat:  Math.round(calcHeatGeneration(weaponsA, 15)),
    energy: Math.round(weaponsA.filter(Boolean).reduce((s, w) => s + w.energyPerSec, 0)),
    range:  weaponsA.filter(Boolean).length ? Math.min(...weaponsA.filter(Boolean).map(w => w.range)) : 0,
  };
  const statsB = {
    burst: calcLoadoutDPS(weaponsB, 'burst').total,
    s15:   calcLoadoutDPS(weaponsB, 'sustained_15s').total,
    s60:   calcLoadoutDPS(weaponsB, 'sustained_60s').total,
    alpha: calcLoadoutDPS(weaponsB, 'alpha').total,
    heat:  Math.round(calcHeatGeneration(weaponsB, 15)),
    energy: Math.round(weaponsB.filter(Boolean).reduce((s, w) => s + w.energyPerSec, 0)),
    range:  weaponsB.filter(Boolean).length ? Math.min(...weaponsB.filter(Boolean).map(w => w.range)) : 0,
  };

  const rows = [
    { key: 'burst',  label: 'DPS Burst',     unit: 'dps', bigger: 'higher' },
    { key: 's15',    label: 'DPS Soutenu 15s', unit: 'dps', bigger: 'higher' },
    { key: 's60',    label: 'DPS Soutenu 60s', unit: 'dps', bigger: 'higher' },
    { key: 'alpha',  label: 'Alpha (volée)',   unit: 'dmg', bigger: 'higher' },
    { key: 'heat',   label: 'Chaleur / 15s',  unit: '',    bigger: 'lower' },
    { key: 'energy', label: 'Énergie / sec',  unit: 'kW',  bigger: 'lower' },
    { key: 'range',  label: 'Portée eff.',    unit: 'm',   bigger: 'higher' },
  ];

  const barData = [
    { name: 'Burst',   A: statsA.burst,  B: statsB.burst },
    { name: '15s',     A: statsA.s15,    B: statsB.s15 },
    { name: '60s',     A: statsA.s60,    B: statsB.s60 },
  ];

  // Verdict
  const verdict = useMemo(() => {
    const msgs = [];
    if (statsA.burst > statsB.burst) {
      const diff = Math.round(((statsA.burst - statsB.burst) / Math.max(1, statsB.burst)) * 100);
      msgs.push(`Loadout A supérieur en burst (+${diff}%)`);
    } else if (statsB.burst > statsA.burst) {
      const diff = Math.round(((statsB.burst - statsA.burst) / Math.max(1, statsA.burst)) * 100);
      msgs.push(`Loadout B supérieur en burst (+${diff}%)`);
    }
    if (statsA.s60 > statsB.s60) {
      const diff = Math.round(((statsA.s60 - statsB.s60) / Math.max(1, statsB.s60)) * 100);
      msgs.push(`Loadout A meilleur en soutenu 60s (+${diff}%)`);
    } else if (statsB.s60 > statsA.s60) {
      const diff = Math.round(((statsB.s60 - statsA.s60) / Math.max(1, statsA.s60)) * 100);
      msgs.push(`Loadout B meilleur en soutenu 60s (+${diff}%)`);
    }
    if (statsA.heat < statsB.heat && statsA.heat > 0) msgs.push('Loadout A génère moins de chaleur');
    else if (statsB.heat < statsA.heat && statsB.heat > 0) msgs.push('Loadout B génère moins de chaleur');
    return msgs;
  }, [statsA, statsB]);

  const renderLoadoutPanel = (shipId, setShipId, slotsList, slots, setSlots, label, color) => (
    <div className="card p-4">
      <div className={`text-sm font-bold mb-3 px-2 py-1 rounded inline-block ${color}`}>
        Loadout {label}
      </div>
      <select
        className="select w-full mb-3 text-sm"
        value={shipId}
        onChange={e => { setShipId(e.target.value); if (label === 'A') setSlotsA({}); else setSlotsB({}); }}
      >
        {Object.entries(SHIP_HARDPOINTS).map(([id, hp]) => (
          <option key={id} value={id}>{hp.label}</option>
        ))}
      </select>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {slotsList.map(slot => (
          <WeaponSelect
            key={slot.key}
            slotSize={slot.size}
            slotLabel={`${slot.zone === 'wings' ? 'Aile' : slot.zone === 'nose' ? 'Nez' : 'Tourelle'} S${slot.size}`}
            value={slots[slot.key]}
            onChange={val => {
              if (label === 'A') setSlotsA(prev => ({ ...prev, [slot.key]: val }));
              else setSlotsB(prev => ({ ...prev, [slot.key]: val }));
            }}
          />
        ))}
        {slotsList.length === 0 && <p className="text-space-400 text-sm">Aucun slot pour ce vaisseau</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Panneaux loadout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderLoadoutPanel(shipA, setShipA, slotsListA, slotsA, setSlotsA, 'A', 'bg-cyan-900/60 text-cyan-300')}
        {renderLoadoutPanel(shipB, setShipB, slotsListB, slotsB, setSlotsB, 'B', 'bg-purple-900/60 text-purple-300')}
      </div>

      {/* Tableau comparatif */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-space-700">
              <th className="text-left p-3 text-space-400 font-medium">Métrique</th>
              <th className="text-center p-3 text-cyan-400 font-medium">Loadout A</th>
              <th className="text-center p-3 text-space-400 font-medium">vs</th>
              <th className="text-center p-3 text-purple-400 font-medium">Loadout B</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const a = statsA[row.key];
              const b = statsB[row.key];
              const aWins = row.bigger === 'higher' ? a > b : a < b;
              const bWins = row.bigger === 'higher' ? b > a : b < a;
              return (
                <tr key={row.key} className="border-b border-space-800 hover:bg-space-700/30">
                  <td className="p-3 text-space-300">{row.label}</td>
                  <td className={`p-3 text-center font-mono font-semibold ${aWins ? 'text-cyan-300' : 'text-space-300'}`}>
                    {aWins && <span className="text-xs mr-1">★</span>}
                    {row.unit === 'dps' || row.unit === 'dmg' ? formatDPS(a) : a.toLocaleString()}
                    {row.unit !== 'dps' && row.unit !== 'dmg' && row.unit !== '' && <span className="text-space-400 text-xs ml-1">{row.unit}</span>}
                  </td>
                  <td className="p-3 text-center">
                    {a > 0 && b > 0 && (
                      <span className="text-xs text-space-500">
                        {a > b
                          ? <ArrowRight size={12} className="rotate-180 text-cyan-500 inline" />
                          : a < b
                          ? <ArrowRight size={12} className="text-purple-500 inline" />
                          : '='}
                      </span>
                    )}
                  </td>
                  <td className={`p-3 text-center font-mono font-semibold ${bWins ? 'text-purple-300' : 'text-space-300'}`}>
                    {bWins && <span className="text-xs mr-1">★</span>}
                    {row.unit === 'dps' || row.unit === 'dmg' ? formatDPS(b) : b.toLocaleString()}
                    {row.unit !== 'dps' && row.unit !== 'dmg' && row.unit !== '' && <span className="text-space-400 text-xs ml-1">{row.unit}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BarChart côte à côte */}
      <div className="card p-4">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <BarChart2 size={16} className="text-cyan-400" />
          Comparaison DPS par scénario
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={formatDPS} />
            <Tooltip
              formatter={(value, name) => [formatDPS(value), `Loadout ${name}`]}
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend formatter={(v) => `Loadout ${v}`} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="A" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="B" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Verdict */}
      {verdict.length > 0 && (
        <div className="card p-4 border border-yellow-800/40">
          <h3 className="section-title mb-2 flex items-center gap-2">
            <Star size={15} className="text-yellow-400" />
            Verdict
          </h3>
          <ul className="space-y-1.5">
            {verdict.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-space-300">
                <ArrowRight size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Onglet 3 : Classement des Armes
// ─────────────────────────────────────────────────────────────────

const RANKING_COLS = [
  { key: 'name',       label: 'Nom',          sortable: true,  type: 'text' },
  { key: 'size',       label: 'Taille',        sortable: true,  type: 'size' },
  { key: 'type',       label: 'Type',          sortable: false, type: 'type' },
  { key: 'burstDPS',   label: 'Burst',         sortable: true,  type: 'dps' },
  { key: 'sustainedDPS', label: '15s',         sortable: true,  type: 'dps' },
  { key: 'sustainedDPS60', label: '60s',       sortable: true,  type: 'dps' },
  { key: 'heatPerShot', label: 'Chaleur/tir',  sortable: true,  type: 'num' },
  { key: 'energyPerSec', label: 'kW/s',        sortable: true,  type: 'num' },
  { key: 'range',      label: 'Portée',        sortable: true,  type: 'range' },
  { key: 'price',      label: 'Prix',          sortable: true,  type: 'price' },
];

function RankingTab() {
  const [sortKey, setSortKey]     = useState('sustainedDPS');
  const [sortDir, setSortDir]     = useState('desc');
  const [filterSize, setFilterSize]   = useState('all');
  const [filterType, setFilterType]   = useState('all');
  const [filterMfr,  setFilterMfr]    = useState('all');
  const [filterInGame, setFilterInGame] = useState(false);

  const sizes = useMemo(() => [...new Set(WEAPON_PROFILES.map(w => w.size))].sort((a, b) => a - b), []);
  const types = useMemo(() => [...new Set(WEAPON_PROFILES.map(w => w.type))].sort(), []);
  const manufacturers = useMemo(() => [...new Set(WEAPON_PROFILES.map(w => w.manufacturer))].sort(), []);

  const filtered = useMemo(() => {
    let list = [...WEAPON_PROFILES];
    if (filterSize !== 'all') list = list.filter(w => w.size === Number(filterSize));
    if (filterType !== 'all') list = list.filter(w => w.type === filterType);
    if (filterMfr  !== 'all') list = list.filter(w => w.manufacturer === filterMfr);
    if (filterInGame)         list = list.filter(w => w.inGame);
    return list.sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filterSize, filterType, filterMfr, filterInGame, sortKey, sortDir]);

  const maxDPS = useMemo(() => Math.max(...filtered.map(w => w.sustainedDPS), 1), [filtered]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // Meilleure arme par taille (DPS soutenu 15s) pour highlighting
  const bestBySize = useMemo(() => {
    const map = {};
    for (const w of WEAPON_PROFILES) {
      if (!map[w.size] || w.sustainedDPS > map[w.size].sustainedDPS) map[w.size] = w;
    }
    return map;
  }, []);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-xs text-space-400 block mb-1">Taille</label>
            <select className="select text-sm" value={filterSize} onChange={e => setFilterSize(e.target.value)}>
              <option value="all">Toutes</option>
              {sizes.map(s => <option key={s} value={s}>S{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-space-400 block mb-1">Type</label>
            <select className="select text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-space-400 block mb-1">Fabricant</label>
            <select className="select text-sm" value={filterMfr} onChange={e => setFilterMfr(e.target.value)}>
              <option value="all">Tous</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-space-300 cursor-pointer mt-4">
            <input type="checkbox" checked={filterInGame} onChange={e => setFilterInGame(e.target.checked)} />
            En jeu uniquement
          </label>
          <div className="ml-auto text-xs text-space-400">{filtered.length} arme{filtered.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-space-700">
              {RANKING_COLS.map(col => (
                <th
                  key={col.key}
                  className={`text-left p-3 text-space-400 font-medium whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-white' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-cyan-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const isBest = bestBySize[w.size]?.id === w.id;
              return (
                <tr
                  key={w.id}
                  className={`border-b border-space-800 hover:bg-space-700/30 transition-colors ${isBest ? 'bg-cyan-900/10' : ''}`}
                >
                  {/* Nom */}
                  <td className="p-3 font-medium text-white">
                    <div className="flex items-center gap-2">
                      {isBest && <Star size={12} className="text-yellow-400 shrink-0" title="Meilleure arme de cette taille" />}
                      <div>
                        <div>{w.name}</div>
                        <div className="text-xs text-space-400">{w.manufacturer}</div>
                      </div>
                    </div>
                  </td>
                  {/* Taille */}
                  <td className="p-3"><SizeBadge size={w.size} /></td>
                  {/* Type */}
                  <td className="p-3">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: (TYPE_COLORS[w.typeKey] || '#334155') + '22',
                        color: TYPE_COLORS[w.typeKey] || '#94a3b8',
                        border: `1px solid ${(TYPE_COLORS[w.typeKey] || '#334155')}44`,
                      }}
                    >
                      {w.type}
                    </span>
                  </td>
                  {/* DPS Burst */}
                  <td className="p-3 min-w-[100px]">
                    <DPSBar value={w.burstDPS} max={Math.max(...filtered.map(x => x.burstDPS), 1)} color="bg-red-500" />
                  </td>
                  {/* DPS 15s */}
                  <td className="p-3 min-w-[100px]">
                    <DPSBar value={w.sustainedDPS} max={maxDPS} color="bg-orange-500" />
                  </td>
                  {/* DPS 60s */}
                  <td className="p-3 min-w-[100px]">
                    <DPSBar value={w.sustainedDPS60} max={Math.max(...filtered.map(x => x.sustainedDPS60), 1)} color="bg-cyan-500" />
                  </td>
                  {/* Chaleur / tir */}
                  <td className="p-3 text-orange-300 font-mono text-xs">
                    {w.heatPerShot.toFixed(1)}
                  </td>
                  {/* Énergie / sec */}
                  <td className="p-3 text-yellow-300 font-mono text-xs">
                    {w.energyPerSec > 0 ? w.energyPerSec.toFixed(1) : '—'}
                  </td>
                  {/* Portée */}
                  <td className="p-3 font-mono text-xs text-green-300">
                    {w.range >= 999990 ? '∞' : w.range.toLocaleString() + 'm'}
                  </td>
                  {/* Prix */}
                  <td className="p-3 text-gold-400 font-mono text-xs">
                    {w.price > 0 ? w.price.toLocaleString() + ' aUEC' : '—'}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={RANKING_COLS.length} className="text-center py-12 text-space-400">
                  Aucune arme ne correspond aux filtres
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'builder',    label: 'Builder DPS',       icon: Zap },
  { id: 'comparator', label: 'Comparateur',        icon: BarChart2 },
  { id: 'ranking',    label: 'Classement Armes',   icon: List },
];

export default function DPSCalculator() {
  const [tab, setTab] = useState('builder');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Zap size={28} className="text-cyan-400" />
            Calculateur DPS
            <span className="badge badge-cyan text-xs ml-1">Alpha 4.6</span>
          </h1>
          <p className="text-space-400 mt-1 text-sm">
            Optimisez vos configurations d'armes — analyse burst, soutenu, thermique et temps de bris de bouclier
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-space-400">
          <Info size={13} />
          <span>{WEAPON_PROFILES.length} armes • {Object.keys(SHIP_HARDPOINTS).length} vaisseaux</span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-space-800 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-space-400 hover:text-white hover:bg-space-700'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      {tab === 'builder'    && <BuilderTab />}
      {tab === 'comparator' && <ComparatorTab />}
      {tab === 'ranking'    && <RankingTab />}
    </div>
  );
}
