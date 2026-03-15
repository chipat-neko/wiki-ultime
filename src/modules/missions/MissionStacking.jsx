import React, { useState, useMemo } from 'react';
import { MISSION_TYPES_DATA, SAMPLE_MISSIONS, STACKABLE_MISSIONS } from '../../datasets/missions.js';
import { STATIONS } from '../../datasets/stations.js';
import { calcMissionStack, optimizeMissionGroup } from '../../utils/calculations.js';
import { formatCredits, formatNumber, formatDuration } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Layers, Zap, Clock, TrendingUp, CheckCircle2, AlertTriangle,
  Target, BarChart3, Info,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MissionStacking() {
  const [currentLocation, setCurrentLocation] = useState('lorville');
  const [timeAvailable, setTimeAvailable] = useState(60);
  const [includeIllegal, setIncludeIllegal] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [result, setResult] = useState(null);

  const locations = STATIONS.filter(s => s.legal).map(s => ({ id: s.id, name: s.name }));

  const stackableTypeIds = useMemo(() => new Set(STACKABLE_MISSIONS.map(m => m.id)), []);

  const availableMissions = useMemo(() => {
    return SAMPLE_MISSIONS.filter(m => {
      if (!includeIllegal && !m.legal) return false;
      if (m.expires && m.expires < Date.now()) return false;
      if (m.typeId && !stackableTypeIds.has(m.typeId)) return false;
      return true;
    }).map(m => ({
      ...m,
      estimatedTime: m.estimatedTime || 15,
    }));
  }, [includeIllegal]);

  const handleOptimize = () => {
    const scoredMissions = calcMissionStack(availableMissions, null, currentLocation);
    const optimized = optimizeMissionGroup(scoredMissions, timeAvailable);
    setResult(optimized);
    setIsOptimized(true);
  };

  const chartData = result?.missions?.map(m => ({
    name: m.name.slice(0, 20),
    payout: m.payout,
    time: m.estimatedTime,
  })) || [];

  const allMissionScores = useMemo(() => calcMissionStack(availableMissions, null, currentLocation), [availableMissions, currentLocation]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          IA d'Empilement de Missions
          <span className="badge badge-cyan ml-2">IA</span>
        </h1>
        <p className="page-subtitle">Algorithme d'optimisation pour empiler les missions et maximiser votre profit/heure</p>
      </div>

      {/* How it works */}
      <div className="card p-4 border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-1">Comment fonctionne l'IA d'Empilement ?</h3>
            <p className="text-xs text-slate-400">
              L'algorithme score chaque mission selon sa localisation (bonus si proche de vous), sa rémunération, son temps estimé et son risque.
              Il sélectionne ensuite la combinaison optimale de missions empilables qui maximise votre profit total
              dans le temps disponible, en priorisant les missions dans la même zone géographique.
            </p>
          </div>
        </div>
      </div>

      {/* Config */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Paramètres
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Votre Position</label>
            <select value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} className="select">
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Temps Disponible (min)</label>
            <input
              type="number"
              value={timeAvailable}
              onChange={e => setTimeAvailable(Math.max(5, Number(e.target.value)))}
              className="input"
              min={5}
              max={480}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Options</label>
            <label className="flex items-center gap-2 cursor-pointer h-10">
              <div className="relative">
                <input type="checkbox" checked={includeIllegal} onChange={e => setIncludeIllegal(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-space-500 peer-checked:bg-cyan-600 rounded-full transition-colors border border-space-400/40" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-slate-400">Missions illégales</span>
            </label>
          </div>
        </div>

        <button onClick={handleOptimize} className="btn-primary gap-2 mt-4">
          <Zap className="w-4 h-4" />
          Calculer le Meilleur Empilement
        </button>
      </div>

      {/* Optimized Result */}
      {isOptimized && result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Missions Sélectionnées', value: result.missions.length, color: 'text-cyan-400' },
              { label: 'Profit Total', value: formatCredits(result.totalPayout, true), color: 'text-success-400' },
              { label: 'Durée Estimée', value: `${result.totalTime} min`, color: 'text-blue-400' },
              { label: 'Profit/Heure', value: formatCredits(result.payoutPerHour, true), color: 'text-gold-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Efficiency */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Utilisation du Temps ({result.totalTime}/{timeAvailable} min)</span>
              <span className="text-sm font-semibold text-cyan-400">{result.efficiency.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-space-600 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${result.efficiency}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected missions */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-space-400/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-400" />
                <h2 className="section-title">Missions Optimales</h2>
              </div>
              <div className="divide-y divide-space-400/10">
                {result.missions.map((mission, i) => (
                  <div key={mission.id} className="p-4 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center text-xs font-bold text-success-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate">{mission.name}</span>
                        <span className="text-sm font-bold text-success-400 flex-shrink-0">{formatCredits(mission.payout, true)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mission.estimatedTime} min</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-gold-400" />{formatCredits(mission.payoutPerHour, true)}/h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="card p-4">
              <h2 className="section-title mb-4">Payout par Mission</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" />
                  <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ background: '#0a1020', border: '1px solid rgba(30,46,74,0.6)', borderRadius: '8px', fontSize: '11px' }}
                    formatter={v => [formatCredits(v, true), 'Prime']}
                  />
                  <Bar dataKey="payout" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* All scored missions */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-space-400/20">
          <h2 className="section-title">Toutes les Missions Disponibles (par Score IA)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Type</th>
                <th>Difficulté</th>
                <th className="text-right">Prime</th>
                <th className="text-right">Score IA</th>
                <th className="text-right">Prime/Heure</th>
              </tr>
            </thead>
            <tbody>
              {allMissionScores.map(m => (
                <tr key={m.id}>
                  <td className="font-medium text-slate-200">{m.name}</td>
                  <td><span className="badge badge-slate">{m.legal ? 'Légal' : 'Illégal'}</span></td>
                  <td><span className={`badge ${SAMPLE_MISSIONS.find(sm => sm.id === m.id)?.difficulty === 'Facile' ? 'badge-green' : 'badge-yellow'}`}>{m.difficulty}</span></td>
                  <td className="text-right text-success-400 font-semibold">{formatCredits(m.payout, true)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-space-600 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (m.stackScore / 200) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-cyan-400 w-8 text-right">{Math.round(m.stackScore)}</span>
                    </div>
                  </td>
                  <td className="text-right text-gold-400">{formatCredits(m.payoutPerHour, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
