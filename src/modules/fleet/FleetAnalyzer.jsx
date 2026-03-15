import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../core/StateManager.jsx';
import { SHIPS_BY_ID, SHIPS } from '../../datasets/ships.js';
import { calcFleetStats, scoreFleetComposition } from '../../utils/calculations.js';
import { formatCredits, formatCargo, formatNumber } from '../../utils/formatters.js';
import { getChartColor } from '../../utils/helpers.js';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, AlertTriangle, CheckCircle2, Info, Plus, Zap } from 'lucide-react';

const SCORE_COLOR = (score) => score >= 80 ? 'text-success-400' : score >= 60 ? 'text-cyan-400' : score >= 40 ? 'text-warning-400' : 'text-danger-400';
const GRADE_BG = (grade) => ({
  A: 'bg-success-500/20 border-success-500/30 text-success-400',
  B: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
  C: 'bg-warning-500/20 border-warning-500/30 text-warning-400',
  D: 'bg-danger-500/20 border-danger-500/30 text-danger-400',
})[grade] || 'bg-slate-500/20 border-slate-500/30 text-slate-400';

export default function FleetAnalyzer() {
  const navigate = useNavigate();
  const { fleet } = useAppState();

  const fleetShips = useMemo(() =>
    fleet.ships.map(fs => SHIPS_BY_ID[fs.shipId] || fs),
    [fleet.ships]
  );

  const stats = useMemo(() => calcFleetStats(fleetShips), [fleetShips]);
  const score = useMemo(() => scoreFleetComposition(stats), [stats]);

  // Données pour les graphiques
  const roleData = Object.entries(stats.roles || {}).map(([role, count], i) => ({
    name: role,
    value: count,
    color: getChartColor(i),
  }));

  const manufacturerData = Object.entries(stats.manufacturers || {}).map(([mfr, count]) => ({
    name: mfr,
    count,
  })).sort((a, b) => b.count - a.count);

  const sizeData = Object.entries(stats.sizes || {}).map(([size, count], i) => ({
    name: size,
    count,
    color: getChartColor(i + 5),
  }));

  // Radar des capacités de la flotte (normalisé 0-100)
  const radarData = [
    { subject: 'Combat', value: Math.min(100, ((stats.roles?.['Chasseur'] || 0) + (stats.roles?.['Chasseur Lourd'] || 0) + (stats.roles?.['Bombardier'] || 0)) * 25) },
    { subject: 'Cargo', value: Math.min(100, (stats.totalCargo / 200) * 100) },
    { subject: 'Exploration', value: Math.min(100, (stats.roles?.['Explorateur'] || 0) * 33) },
    { subject: 'Minage', value: Math.min(100, (stats.roles?.['Mineur'] || 0) * 50) },
    { subject: 'Soutien', value: Math.min(100, ((stats.roles?.['Médical'] || 0) + (stats.roles?.['Ravitailleur'] || 0)) * 50) },
    { subject: 'Polyvalence', value: Math.min(100, (Object.keys(stats.roles || {}).length / 6) * 100) },
  ];

  if (fleet.ships.length === 0) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/flotte')} className="btn-ghost btn-sm gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à la Flotte
        </button>
        <div className="card p-12 text-center">
          <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-400 mb-2">Flotte Vide</h2>
          <p className="text-slate-500 mb-6">Ajoutez des vaisseaux à votre flotte pour obtenir une analyse.</p>
          <button onClick={() => navigate('/flotte')} className="btn-primary gap-2">
            <Plus className="w-4 h-4" /> Gérer la Flotte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/flotte')} className="btn-ghost btn-sm gap-2">
        <ArrowLeft className="w-4 h-4" /> Retour à la Flotte
      </button>

      <div className="page-header">
        <h1 className="page-title">Analyse de Flotte</h1>
        <p className="page-subtitle">Évaluation de la composition et des capacités de {fleet.name}</p>
      </div>

      {/* Score global */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="text-center">
            <div className={`text-6xl font-black font-display ${SCORE_COLOR(score.score)}`}>
              {score.score}
            </div>
            <div className="text-slate-500 text-sm mt-1">Score Global</div>
          </div>
          <div className={`px-6 py-4 rounded-xl border text-center ${GRADE_BG(score.grade)}`}>
            <div className="text-4xl font-black font-display">{score.grade}</div>
            <div className="text-xs mt-1 opacity-80">Grade</div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Score de composition</span>
              <span className={`text-sm font-semibold ${SCORE_COLOR(score.score)}`}>{score.score}/100</span>
            </div>
            <div className="h-2 bg-space-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${score.score >= 80 ? 'bg-success-500' : score.score >= 60 ? 'bg-cyan-500' : score.score >= 40 ? 'bg-warning-500' : 'bg-danger-500'}`}
                style={{ width: `${score.score}%` }}
              />
            </div>

            {/* Recommandations */}
            {score.recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                {score.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="card p-4">
          <h2 className="section-title mb-4">Capacités Stratégiques</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(30,46,74,0.6)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              <Radar
                dataKey="value"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Roles Pie */}
        <div className="card p-4">
          <h2 className="section-title mb-4">Répartition par Rôle</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                outerRadius={72}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {roleData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a1020', border: '1px solid rgba(30,46,74,0.6)', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Manufacturers Bar */}
        <div className="card p-4">
          <h2 className="section-title mb-4">Fabricants</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={manufacturerData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={50} />
              <Tooltip contentStyle={{ background: '#0a1020', border: '1px solid rgba(30,46,74,0.6)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vaisseaux', value: formatNumber(stats.count || 0) },
          { label: 'Cargo Total', value: formatCargo(stats.totalCargo) },
          { label: 'Équipage Min', value: formatNumber(stats.totalCrew?.min || 0) },
          { label: 'Équipage Max', value: formatNumber(stats.totalCrew?.max || 0) },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-2xl font-bold font-display text-cyan-400">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
