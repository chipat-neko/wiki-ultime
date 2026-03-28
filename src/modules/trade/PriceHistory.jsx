import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Search, Bell, BellOff,
  BarChart3, Activity, Package, AlertTriangle,
  ChevronDown, ArrowUpRight, ArrowDownRight, X,
} from 'lucide-react';
import clsx from 'clsx';
import { COMMODITIES } from '../../datasets/commodities.js';
import { STATION_PRICES } from '../../datasets/tradeprices.js';
import { useLiveCommodities } from '../../hooks/useLiveData.js';
import { formatCredits } from '../../utils/formatters.js';

const ALERTS_KEY = 'sc_price_alerts';
const TIME_RANGES = [
  { key: '24h', label: '24h', days: 1 },
  { key: '7j', label: '7j', days: 7 },
  { key: '30j', label: '30j', days: 30 },
  { key: 'all', label: 'Tout', days: 90 },
];

const STATION_LABELS = {
  'lorville': 'Lorville', 'area18': 'Area18', 'new-babbage': 'New Babbage',
  'orison': 'Orison', 'cru-l1': 'CRU-L1', 'hur-l1': 'HUR-L1',
  'arc-l1': 'ARC-L1', 'mic-l1': 'MIC-L1', 'port-tressler': 'Port Tressler',
  'grimhex': 'GrimHEX', 'pyrochem': 'PyroChem', 'levski': 'Levski',
  'ruin-station': 'Ruin Station', 'checkmate': 'Checkmate', 'orbituary': 'Orbituary',
  'patch-city': 'Patch City', 'rats-nest': "Rat's Nest", 'endgame': 'Endgame',
  'dudley-daughters': 'Dudley & Daughters', 'windfall': 'Windfall', 'rustville': 'Rustville',
};

// Générateur pseudo-aléatoire déterministe (seed)
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function generatePriceHistory(basePrice, days, seed = 42) {
  if (!basePrice || basePrice <= 0) return [];
  const rand = seededRandom(seed);
  const points = Math.min(days * 24, 720);
  const step = (days * 24 * 3600000) / points;
  const startTime = Date.now() - days * 24 * 3600000;
  const data = [];
  let drift = 0;
  for (let i = 0; i <= points; i++) {
    const t = startTime + i * step;
    drift += (rand() - 0.5) * 0.004;
    drift = Math.max(-0.12, Math.min(0.12, drift));
    const factor = 1 + drift + (rand() - 0.5) * 0.06 + Math.sin(i / (points / 6)) * 0.03;
    const date = new Date(t);
    data.push({
      time: t,
      label: days <= 1
        ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      price: Math.max(1, Math.round(basePrice * factor)),
    });
  }
  return data;
}

function computeStats(data) {
  if (!data.length) return null;
  const prices = data.map(d => d.price);
  const n = prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / n);
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) { sumX += i; sumY += prices[i]; sumXY += i * prices[i]; sumX2 += i * i; }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trendPercent = avg > 0 ? ((slope * n) / avg) * 100 : 0;
  const variance = prices.reduce((s, p) => s + (p - avg) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const volatility = avg > 0 ? (stdDev / avg) * 100 : 0;
  return { min, max, avg, slope, trendPercent, volatility, stdDev };
}

function StatCard({ icon: Icon, label, value, sub, color = 'cyan' }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className={clsx('p-2 rounded-lg', `bg-${color}-500/10`)}>
        <Icon size={18} className={`text-${color}-400`} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

function TrendBadge({ trendPercent }) {
  if (Math.abs(trendPercent) < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full">
        <Minus size={12} /> Stable
      </span>
    );
  }
  const up = trendPercent > 0;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
      up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10',
    )}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {up ? '+' : ''}{trendPercent.toFixed(1)}%
    </span>
  );
}

function VolatilityBar({ volatility }) {
  const level = volatility < 2 ? 'Faible' : volatility < 5 ? 'Modérée' : 'Élevée';
  const color = volatility < 2 ? 'bg-green-500' : volatility < 5 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Volatilité</span>
        <span className="text-gray-300">{level} ({volatility.toFixed(1)}%)</span>
      </div>
      <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(100, volatility * 10)}%` }} />
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-space-800 border border-space-400/20 rounded-lg p-2 text-xs shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCredits(p.value)}
        </p>
      ))}
    </div>
  );
}

// ============================================================
export default function PriceHistory() {
  const { data: liveCommodities } = useLiveCommodities();

  const commodityList = useMemo(() => {
    const src = liveCommodities?.length ? liveCommodities : COMMODITIES;
    return src.map(c => ({
      id: c.id ?? c.code ?? c.name,
      name: c.name,
      category: c.category ?? 'Divers',
      buyPrice: c.buyPrice ?? { min: 0, avg: 0, max: 0 },
      sellPrice: c.sellPrice ?? { min: 0, avg: 0, max: 0 },
    }));
  }, [liveCommodities]);

  const [selectedId, setSelectedId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('7j');
  const [showDropdown, setShowDropdown] = useState(false);
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ALERTS_KEY)) || []; } catch { return []; }
  });
  const [alertThreshold, setAlertThreshold] = useState('');
  const [alertType, setAlertType] = useState('above');

  useEffect(() => { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts)); }, [alerts]);

  const selected = useMemo(() => commodityList.find(c => c.id === selectedId) || null, [commodityList, selectedId]);

  useEffect(() => {
    if (!selectedId && commodityList.length) setSelectedId(commodityList[0].id);
  }, [selectedId, commodityList]);

  const filteredCommodities = useMemo(() => {
    if (!searchQuery.trim()) return commodityList;
    const q = searchQuery.toLowerCase();
    return commodityList.filter(c => c.name.toLowerCase().includes(q));
  }, [commodityList, searchQuery]);

  const days = useMemo(() => TIME_RANGES.find(r => r.key === timeRange)?.days ?? 7, [timeRange]);

  const buyHistory = useMemo(() => {
    if (!selected) return [];
    return generatePriceHistory(selected.buyPrice?.avg || 0, days, hashCode(selected.id + '_buy'));
  }, [selected, days]);

  const sellHistory = useMemo(() => {
    if (!selected) return [];
    return generatePriceHistory(selected.sellPrice?.avg || 0, days, hashCode(selected.id + '_sell'));
  }, [selected, days]);

  const chartData = useMemo(() => {
    if (!buyHistory.length && !sellHistory.length) return [];
    const maxLen = Math.max(buyHistory.length, sellHistory.length);
    const merged = [];
    for (let i = 0; i < maxLen; i++) {
      merged.push({
        label: buyHistory[i]?.label || sellHistory[i]?.label || '',
        achat: buyHistory[i]?.price || null,
        vente: sellHistory[i]?.price || null,
      });
    }
    if (merged.length > 120) {
      const step = Math.ceil(merged.length / 120);
      return merged.filter((_, i) => i % step === 0);
    }
    return merged;
  }, [buyHistory, sellHistory]);

  const sellStats = useMemo(() => computeStats(sellHistory), [sellHistory]);

  const stationData = useMemo(() => {
    if (!selected) return [];
    const data = [];
    for (const [sid, prices] of Object.entries(STATION_PRICES)) {
      const cp = prices[selected.id];
      if (!cp) continue;
      const [buy, sell] = cp;
      if (buy > 0 || sell > 0) data.push({ station: STATION_LABELS[sid] || sid, achat: buy || 0, vente: sell || 0 });
    }
    return data.sort((a, b) => b.vente - a.vente);
  }, [selected]);

  const triggeredAlerts = useMemo(() => {
    if (!selected || !alerts.length) return [];
    const sell = selected.sellPrice?.avg || 0;
    const buy = selected.buyPrice?.avg || 0;
    return alerts.filter(a => {
      if (a.commodityId !== selected.id) return false;
      const price = a.priceType === 'buy' ? buy : sell;
      return a.type === 'above' ? price >= a.threshold : price <= a.threshold;
    });
  }, [alerts, selected]);

  const handleSelectCommodity = useCallback((id) => {
    setSelectedId(id); setShowDropdown(false); setSearchQuery('');
  }, []);

  const handleAddAlert = useCallback(() => {
    const threshold = parseFloat(alertThreshold);
    if (!threshold || !selected) return;
    setAlerts(prev => [...prev, {
      id: Date.now(), commodityId: selected.id, commodityName: selected.name,
      type: alertType, threshold, priceType: 'sell', createdAt: new Date().toISOString(),
    }]);
    setAlertThreshold('');
  }, [alertThreshold, alertType, selected]);

  const handleRemoveAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity size={24} className="text-cyan-400" />
            Historique des Prix
          </h1>
          <p className="text-gray-400 text-sm mt-1">Suivi et analyse des tendances de prix des commodités</p>
        </div>
        <div className="flex items-center gap-1 bg-space-800 border border-space-400/20 rounded-lg p-1">
          {TIME_RANGES.map(r => (
            <button key={r.key} onClick={() => setTimeRange(r.key)} className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              timeRange === r.key ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-space-700',
            )}>{r.label}</button>
          ))}
        </div>
      </div>

      {/* Sélecteur de commodité */}
      <div className="card p-4">
        <div className="relative">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-cyan-400" />
            <span className="text-sm text-gray-400">Commodité :</span>
          </div>
          <div className="relative mt-2">
            <button onClick={() => setShowDropdown(v => !v)}
              className="w-full flex items-center justify-between bg-space-700 border border-space-400/20 rounded-lg px-4 py-2.5 text-left hover:border-cyan-500/30 transition-colors">
              <span className="text-white font-medium">{selected?.name || 'Sélectionner une commodité'}</span>
              <ChevronDown size={16} className={clsx('text-gray-400 transition-transform', showDropdown && 'rotate-180')} />
            </button>
            {showDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-space-800 border border-space-400/20 rounded-lg shadow-xl max-h-72 overflow-hidden">
                <div className="p-2 border-b border-space-400/10">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..." autoFocus
                      className="w-full bg-space-700 border border-space-400/20 rounded-md pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40" />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-56">
                  {filteredCommodities.map(c => (
                    <button key={c.id} onClick={() => handleSelectCommodity(c.id)}
                      className={clsx('w-full text-left px-4 py-2 text-sm hover:bg-space-700 transition-colors flex items-center justify-between',
                        c.id === selectedId ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300')}>
                      <span>{c.name}</span>
                      <span className="text-xs text-gray-500">{c.category}</span>
                    </button>
                  ))}
                  {!filteredCommodities.length && <p className="text-center text-gray-500 text-sm py-4">Aucun résultat</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <>
          {/* Alertes déclenchées */}
          {triggeredAlerts.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                {triggeredAlerts.map(a => (
                  <p key={a.id} className="text-sm text-yellow-300">
                    <strong>{a.commodityName}</strong> — prix {a.type === 'above' ? 'au-dessus' : 'en-dessous'} de {formatCredits(a.threshold)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Panneau statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={TrendingDown} label="Prix min (vente)" value={sellStats ? formatCredits(sellStats.min) : '—'} color="blue" />
            <StatCard icon={TrendingUp} label="Prix max (vente)" value={sellStats ? formatCredits(sellStats.max) : '—'} color="green" />
            <StatCard icon={BarChart3} label="Prix moyen" value={sellStats ? formatCredits(sellStats.avg) : '—'}
              sub={sellStats ? <TrendBadge trendPercent={sellStats.trendPercent} /> : null} color="cyan" />
            <StatCard icon={Activity} label="Écart-type" value={sellStats ? formatCredits(Math.round(sellStats.stdDev)) : '—'}
              sub={sellStats ? `±${sellStats.volatility.toFixed(1)}%` : null} color="purple" />
          </div>

          {/* Volatilité */}
          {sellStats && <div className="card p-4"><VolatilityBar volatility={sellStats.volatility} /></div>}

          {/* Graphique historique */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" />
              Évolution des prix — {selected.name}
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,120,140,0.15)" />
                  <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} interval="preserveStartEnd" tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} width={55} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={val => <span className="text-gray-300 text-xs">{val}</span>} />
                  {chartData.some(d => d.achat) && (
                    <Line type="monotone" dataKey="achat" name="Achat" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#60a5fa' }} />
                  )}
                  {chartData.some(d => d.vente) && (
                    <Line type="monotone" dataKey="vente" name="Vente" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#34d399' }} />
                  )}
                  {sellStats && (
                    <ReferenceLine y={sellStats.avg} stroke="#facc15" strokeDasharray="5 5" strokeWidth={1}
                      label={{ value: 'Moy.', fill: '#facc15', fontSize: 10, position: 'right' }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Aucune donnée disponible pour cette commodité</div>
            )}
            <p className="text-xs text-gray-500 mt-2 italic">* Données simulées basées sur les prix statiques avec variance aléatoire</p>
          </div>

          {/* Comparaison stations */}
          {stationData.length > 0 && (
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-cyan-400" />
                Comparaison par station
              </h2>
              <ResponsiveContainer width="100%" height={Math.max(250, stationData.length * 36)}>
                <BarChart data={stationData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,120,140,0.15)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} tickLine={false} />
                  <YAxis type="category" dataKey="station" tick={{ fill: '#d1d5db', fontSize: 11 }} width={120} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={val => <span className="text-gray-300 text-xs">{val}</span>} />
                  <Bar dataKey="achat" name="Achat" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={14} />
                  <Bar dataKey="vente" name="Vente" fill="#34d399" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Alertes de prix */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={18} className="text-cyan-400" />
              Alertes de prix
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
              <select value={alertType} onChange={e => setAlertType(e.target.value)}
                className="bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                <option value="above">Au-dessus de</option>
                <option value="below">En-dessous de</option>
              </select>
              <input type="number" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)}
                placeholder="Seuil (aUEC)" min="1"
                className="flex-1 bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40" />
              <button onClick={handleAddAlert} disabled={!alertThreshold}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                Ajouter
              </button>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <BellOff size={24} className="mx-auto mb-2 opacity-50" />
                Aucune alerte configurée
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map(a => {
                  const isTriggered = triggeredAlerts.some(t => t.id === a.id);
                  return (
                    <div key={a.id} className={clsx(
                      'flex items-center justify-between px-3 py-2 rounded-lg border transition-colors',
                      isTriggered ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-space-700/50 border-space-400/10',
                    )}>
                      <div className="flex items-center gap-2">
                        {isTriggered
                          ? <AlertTriangle size={14} className="text-yellow-400" />
                          : <Bell size={14} className="text-gray-500" />}
                        <span className="text-sm text-gray-300">
                          <strong className="text-white">{a.commodityName}</strong>
                          {' '}{a.type === 'above' ? '≥' : '≤'} {formatCredits(a.threshold)}
                        </span>
                        {isTriggered && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Déclenché</span>
                        )}
                      </div>
                      <button onClick={() => handleRemoveAlert(a.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1" title="Supprimer">
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
    </div>
  );
}
