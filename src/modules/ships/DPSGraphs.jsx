import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Crosshair, Plus, X, Target, Clock, BarChart3, Zap, Shield } from 'lucide-react';
import { SHIP_WEAPONS } from '../../datasets/shipweapons.js';
import { SHIPS } from '../../datasets/ships.js';

// === Couleurs pour les 4 armes comparées ===
const WEAPON_COLORS = ['#06b6d4', '#f59e0b', '#ef4444', '#a855f7'];
const DAMAGE_COLORS = { energy: '#06b6d4', ballistic: '#f59e0b', distortion: '#a855f7' };

const TABS = [
  { id: 'distance', label: 'DPS vs Distance', icon: Target },
  { id: 'time', label: 'DPS vs Temps', icon: Clock },
  { id: 'comparison', label: 'Comparaison', icon: BarChart3 },
];

// === Helpers DPS ===
function calcAlphaDamage(w) {
  return w.stats.alphaEm + w.stats.alphaPhys + w.stats.alphaDist;
}

function calcDPS(w) {
  return (calcAlphaDamage(w) * w.stats.rpm) / 60;
}

function calcDPSAtDistance(w, distance) {
  const range = w.stats.range || 1500;
  if (distance <= range * 0.5) return calcDPS(w);
  if (distance >= range) return 0;
  const falloff = 1 - ((distance - range * 0.5) / (range * 0.5));
  return calcDPS(w) * falloff;
}

function calcSustainedDPS(w, timeSeconds) {
  const dps = calcDPS(w);
  const alpha = calcAlphaDamage(w);
  const rpm = w.stats.rpm;
  const shotsPerSec = rpm / 60;
  const isBallistic = w.class === 'ballistic';
  const ammo = w.stats.ammoCount || Infinity;
  const reloadTime = isBallistic ? 3 : 0;
  const overheatThreshold = 8;
  const overheatPenalty = 0.7;
  const cooldownTime = 2;

  let totalDamage = 0;
  let shotsFired = 0;
  let t = 0;
  let burstTime = 0;
  let cooling = false;
  let coolTimer = 0;

  while (t < timeSeconds) {
    const dt = 0.1;
    if (cooling) {
      coolTimer += dt;
      if (coolTimer >= cooldownTime) {
        cooling = false;
        coolTimer = 0;
        burstTime = 0;
      }
    } else {
      if (isBallistic && shotsFired >= ammo) {
        // Reloading
        t += reloadTime;
        shotsFired = 0;
        burstTime = 0;
        continue;
      }
      const shotsThisTick = shotsPerSec * dt;
      let effectiveDmg = alpha * shotsThisTick;
      burstTime += dt;
      if (burstTime > overheatThreshold) {
        effectiveDmg *= overheatPenalty;
      }
      if (burstTime > overheatThreshold + 4) {
        cooling = true;
        coolTimer = 0;
        t += dt;
        continue;
      }
      totalDamage += effectiveDmg;
      shotsFired += shotsThisTick;
    }
    t += dt;
  }
  return timeSeconds > 0 ? totalDamage / timeSeconds : dps;
}

// === Composant principal ===
export default function DPSGraphs() {
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('distance');
  const [targetShipId, setTargetShipId] = useState('');
  const [sizeFilter, setSizeFilter] = useState(0);

  // Filtrage armes pour le sélecteur
  const filteredWeapons = useMemo(() => {
    return SHIP_WEAPONS.filter(w => {
      if (selectedWeapons.find(s => s.id === w.id)) return false;
      if (sizeFilter > 0 && w.size !== sizeFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return w.name.toLowerCase().includes(q) ||
        w.manufacturer.toLowerCase().includes(q) ||
        w.type.toLowerCase().includes(q);
    });
  }, [searchQuery, selectedWeapons, sizeFilter]);

  const addWeapon = useCallback((weapon) => {
    if (selectedWeapons.length >= 4) return;
    setSelectedWeapons(prev => [...prev, weapon]);
    setShowSelector(false);
    setSearchQuery('');
  }, [selectedWeapons.length]);

  const removeWeapon = useCallback((id) => {
    setSelectedWeapons(prev => prev.filter(w => w.id !== id));
  }, []);

  // === Données DPS vs Distance (0-2000m, pas de 50m) ===
  const distanceData = useMemo(() => {
    if (selectedWeapons.length === 0) return [];
    const points = [];
    for (let d = 0; d <= 2000; d += 50) {
      const point = { distance: d };
      selectedWeapons.forEach((w, i) => {
        point[`dps_${i}`] = Math.round(calcDPSAtDistance(w, d));
      });
      points.push(point);
    }
    return points;
  }, [selectedWeapons]);

  // === Données DPS vs Temps (0-60s, pas de 1s) ===
  const timeData = useMemo(() => {
    if (selectedWeapons.length === 0) return [];
    const points = [];
    for (let t = 1; t <= 60; t += 1) {
      const point = { time: t };
      selectedWeapons.forEach((w, i) => {
        point[`dps_${i}`] = Math.round(calcSustainedDPS(w, t));
      });
      points.push(point);
    }
    return points;
  }, [selectedWeapons]);

  // === Données breakdown type de dommages ===
  const damageBreakdown = useMemo(() => {
    return selectedWeapons.map((w, i) => ({
      name: w.name,
      energy: Math.round((w.stats.alphaEm * w.stats.rpm) / 60),
      ballistic: Math.round((w.stats.alphaPhys * w.stats.rpm) / 60),
      distortion: Math.round((w.stats.alphaDist * w.stats.rpm) / 60),
    }));
  }, [selectedWeapons]);

  // === TTK Calculator ===
  const targetShip = useMemo(() => SHIPS.find(s => s.id === targetShipId), [targetShipId]);

  const ttkResults = useMemo(() => {
    if (!targetShip || selectedWeapons.length === 0) return [];
    const hp = targetShip.specs.shieldHp || 1000;
    // Estimation : HP total = shield + hull (hull ≈ shield * 1.5)
    const totalHp = hp + hp * 1.5;
    return selectedWeapons.map((w) => {
      const dps = calcDPS(w);
      const sustained = calcSustainedDPS(w, 30);
      return {
        weapon: w.name,
        dps: Math.round(dps),
        sustained: Math.round(sustained),
        ttkInstant: dps > 0 ? (totalHp / dps).toFixed(1) : '∞',
        ttkSustained: sustained > 0 ? (totalHp / sustained).toFixed(1) : '∞',
        shieldOnly: dps > 0 ? (hp / dps).toFixed(1) : '∞',
      };
    });
  }, [targetShip, selectedWeapons]);

  // Vaisseaux triés pour le sélecteur TTK
  const sortedShips = useMemo(() =>
    [...SHIPS].filter(s => s.flyable).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crosshair className="w-7 h-7 text-cyan-400" />
            Graphiques DPS — Armes Vaisseaux
          </h1>
          <p className="text-space-300 mt-1">
            Comparez jusqu'à 4 armes : DPS, portée, soutenu, TTK
          </p>
        </div>
      </div>

      {/* Sélection des armes */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Armes sélectionnées</h2>
          {selectedWeapons.length < 4 && (
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>

        {/* Chips armes sélectionnées */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedWeapons.length === 0 && (
            <p className="text-space-400 text-sm italic">
              Aucune arme sélectionnée — cliquez sur Ajouter pour commencer
            </p>
          )}
          {selectedWeapons.map((w, i) => (
            <div
              key={w.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ borderColor: WEAPON_COLORS[i], backgroundColor: WEAPON_COLORS[i] + '15' }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: WEAPON_COLORS[i] }}
              />
              <span className="text-sm text-white font-medium">{w.name}</span>
              <span className="text-xs text-space-400">S{w.size}</span>
              <button
                onClick={() => removeWeapon(w.id)}
                className="ml-1 text-space-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Panneau de sélection */}
        {showSelector && (
          <div className="border border-space-600 rounded-lg p-3 bg-space-800/50 mt-2">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Rechercher une arme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input flex-1 text-sm"
                autoFocus
              />
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(Number(e.target.value))}
                className="input w-24 text-sm"
              >
                <option value={0}>Toutes</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                  <option key={s} value={s}>S{s}</option>
                ))}
              </select>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredWeapons.slice(0, 20).map(w => (
                <button
                  key={w.id}
                  onClick={() => addWeapon(w)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-space-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-white text-sm">{w.name}</span>
                    <span className="text-space-400 text-xs ml-2">
                      S{w.size} · {w.type} · {w.manufacturer}
                    </span>
                  </div>
                  <span className="text-cyan-400 text-xs font-mono">
                    {Math.round(calcDPS(w))} DPS
                  </span>
                </button>
              ))}
              {filteredWeapons.length === 0 && (
                <p className="text-space-500 text-sm text-center py-4">Aucun résultat</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      {selectedWeapons.length > 0 && (
        <>
          <div className="flex gap-1 border-b border-space-700">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-space-400 hover:text-space-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* === Tab: DPS vs Distance === */}
          {activeTab === 'distance' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                DPS selon la distance (0 – 2 000 m)
              </h3>
              <p className="text-space-400 text-sm">
                Chute linéaire à partir de 50 % de la portée max. Le DPS atteint 0 à portée maximale.
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={distanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="distance"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(v) => `${v}m`}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                      }}
                      labelFormatter={(v) => `Distance : ${v}m`}
                    />
                    <Legend />
                    {selectedWeapons.map((w, i) => (
                      <Line
                        key={w.id}
                        type="monotone"
                        dataKey={`dps_${i}`}
                        name={w.name}
                        stroke={WEAPON_COLORS[i]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* === Tab: DPS vs Temps === */}
          {activeTab === 'time' && (
            <div className="space-y-5">
              <div className="card p-5 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  DPS soutenu dans le temps (0 – 60 s)
                </h3>
                <p className="text-space-400 text-sm">
                  Prend en compte la surchauffe (–30 % après 8 s), le refroidissement (2 s),
                  et le rechargement des munitions balistiques (3 s).
                </p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(v) => `${v}s`}
                      />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0',
                        }}
                        labelFormatter={(v) => `Temps : ${v}s`}
                      />
                      <Legend />
                      {selectedWeapons.map((w, i) => (
                        <Line
                          key={w.id}
                          type="monotone"
                          dataKey={`dps_${i}`}
                          name={w.name}
                          stroke={WEAPON_COLORS[i]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown type de dommages */}
              <div className="card p-5 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Répartition par type de dommages
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={damageBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#e2e8f0',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="energy" name="Énergie" fill={DAMAGE_COLORS.energy} stackId="a" />
                      <Bar dataKey="ballistic" name="Balistique" fill={DAMAGE_COLORS.ballistic} stackId="a" />
                      <Bar dataKey="distortion" name="Distorsion" fill={DAMAGE_COLORS.distortion} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* === Tab: Comparaison === */}
          {activeTab === 'comparison' && (
            <div className="space-y-5">
              {/* Table de stats */}
              <div className="card p-5 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Tableau comparatif
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-space-600">
                        <th className="text-left text-space-400 py-2 pr-4">Statistique</th>
                        {selectedWeapons.map((w, i) => (
                          <th key={w.id} className="text-right py-2 px-3" style={{ color: WEAPON_COLORS[i] }}>
                            {w.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-space-200">
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Taille</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono">S{w.size}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Type</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3">{w.type}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Classe</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 capitalize">{w.class}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Alpha Damage</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono text-white">
                            {calcAlphaDamage(w)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">DPS (burst)</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono text-cyan-400 font-bold">
                            {Math.round(calcDPS(w))}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">DPS soutenu (30s)</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono text-amber-400">
                            {Math.round(calcSustainedDPS(w, 30))}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Cadence (RPM)</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono">{w.stats.rpm}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Portée (m)</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono">{w.stats.range}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Munitions</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono">
                            {w.stats.ammoCount > 0 ? w.stats.ammoCount : '∞'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-space-700/50">
                        <td className="py-2 pr-4 text-space-400">Conso énergie</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono">{w.stats.powerDraw}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-space-400">Chaleur / tir</td>
                        {selectedWeapons.map(w => (
                          <td key={w.id} className="text-right py-2 px-3 font-mono">{w.stats.heatPerShot}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TTK Calculator */}
              <div className="card p-5 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Temps pour détruire (TTK)
                </h3>
                <p className="text-space-400 text-sm">
                  Estimation basée sur les HP bouclier + coque (coque ≈ 1.5× bouclier).
                  Ne prend pas en compte les résistances.
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-space-300 text-sm">Vaisseau cible :</label>
                  <select
                    value={targetShipId}
                    onChange={(e) => setTargetShipId(e.target.value)}
                    className="input w-72 text-sm"
                  >
                    <option value="">— Sélectionner un vaisseau —</option>
                    {sortedShips.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.manufacturer}) — {s.specs.shieldHp} HP bouclier
                      </option>
                    ))}
                  </select>
                </div>

                {targetShip && ttkResults.length > 0 && (
                  <div className="overflow-x-auto mt-3">
                    <div className="mb-3 px-3 py-2 bg-space-700/40 rounded-lg text-sm text-space-300">
                      <span className="text-white font-medium">{targetShip.name}</span>
                      {' — '}Bouclier : {targetShip.specs.shieldHp} HP · Coque estimée : {Math.round(targetShip.specs.shieldHp * 1.5)} HP
                      · Total : {Math.round(targetShip.specs.shieldHp * 2.5)} HP
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-space-600">
                          <th className="text-left text-space-400 py-2">Arme</th>
                          <th className="text-right text-space-400 py-2 px-3">DPS burst</th>
                          <th className="text-right text-space-400 py-2 px-3">DPS soutenu</th>
                          <th className="text-right text-space-400 py-2 px-3">TTK bouclier</th>
                          <th className="text-right text-space-400 py-2 px-3">TTK burst</th>
                          <th className="text-right text-space-400 py-2 px-3">TTK soutenu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ttkResults.map((r, i) => (
                          <tr key={i} className="border-b border-space-700/50">
                            <td className="py-2 font-medium" style={{ color: WEAPON_COLORS[i] }}>
                              {r.weapon}
                            </td>
                            <td className="text-right py-2 px-3 font-mono text-space-200">{r.dps}</td>
                            <td className="text-right py-2 px-3 font-mono text-space-200">{r.sustained}</td>
                            <td className="text-right py-2 px-3 font-mono text-cyan-400">{r.shieldOnly}s</td>
                            <td className="text-right py-2 px-3 font-mono text-amber-400">{r.ttkInstant}s</td>
                            <td className="text-right py-2 px-3 font-mono text-red-400">{r.ttkSustained}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!targetShip && (
                  <p className="text-space-500 text-sm italic mt-2">
                    Sélectionnez un vaisseau cible pour voir les estimations TTK.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* État vide */}
      {selectedWeapons.length === 0 && (
        <div className="card p-12 text-center">
          <Crosshair className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-space-300 mb-2">
            Sélectionnez des armes à comparer
          </h3>
          <p className="text-space-500 max-w-md mx-auto">
            Ajoutez entre 1 et 4 armes de vaisseau pour visualiser leurs courbes DPS,
            la répartition des dommages et estimer le temps de destruction.
          </p>
        </div>
      )}
    </div>
  );
}
