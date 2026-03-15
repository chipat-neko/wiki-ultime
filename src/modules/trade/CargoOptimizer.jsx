import React, { useState, useMemo } from 'react';
import { useAppActions } from '../../core/StateManager.jsx';
import { STATION_PRICES, TOP_TRADE_ROUTES, COMMODITY_META, findBestCommodities } from '../../datasets/tradeprices.js';
import { SHIPS } from '../../datasets/ships.js';
import { formatCredits } from '../../utils/formatters.js';
import {
  Package, Zap, Calculator, TrendingUp, CheckCircle2,
  AlertCircle, AlertTriangle, ChevronDown, ChevronUp, Info, Ship,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import clsx from 'clsx';

// ----------------------------------------------------------------
// Constantes
// ----------------------------------------------------------------

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

const ILLEGAL_COMMODITIES = new Set(
  Object.entries(COMMODITY_META)
    .filter(([, m]) => m.legalStatus === 'illegal')
    .map(([id]) => id)
);

// Noms affichables pour les stations
const STATION_LABELS = {
  'lorville':        'Lorville (Hurston)',
  'area18':          'Area18 (ArcCorp)',
  'new-babbage':     'New Babbage (MicroTech)',
  'orison':          'Orison (Crusader)',
  'cru-l1':          'CRU-L1 (Crusader L1)',
  'hur-l1':          'HUR-L1 (Hurston L1)',
  'arc-l1':          'ARC-L1 (ArcCorp L1)',
  'mic-l1':          'MIC-L1 (MicroTech L1)',
  'port-tressler':   'Port Tressler (MicroTech Orbite)',
  'grimhex':         'GrimHEX (Yela)',
  'pyrochem':        'Pyrochem (GrimHEX alt.)',
  'levski':          'Levski (Delamar / Nyx)',
  'ruin-station':    'Ruin Station (Pyro IV)',
  'checkmate':       'Checkmate (Pyro II)',
  'orbituary':       'Orbituary (Pyro I)',
  'patch-city':      'Patch City (Pyro III)',
  'rats-nest':       "Rat's Nest (Ceinture Pyro)",
  'endgame':         'Endgame (Pyro V)',
  'dudley-daughters':"Dudley & Daughters (Pyro VI)",
  'windfall':        'Windfall (Pyro III surface)',
  'rustville':       'Rustville (Pyro II surface)',
};

// Commodity ids → noms affichables (depuis COMMODITY_META + clés manuelles)
const COMMODITY_NAMES = {
  'quantainium': 'Quantainium', 'bexalite': 'Bexalite', 'laranite': 'Laranite',
  'agricium': 'Agricium', 'taranite': 'Taranite', 'hadanite': 'Hadanite',
  'hephaestanite': 'Hephaestanite', 'aphorite': 'Aphorite', 'borase': 'Borase',
  'stileron': 'Stileron', 'diamond': 'Diamant', 'gold': 'Or', 'beryl': 'Béryl',
  'aluminum': 'Aluminium', 'titanium': 'Titane', 'tungsten': 'Tungstène',
  'copper': 'Cuivre', 'iron': 'Fer', 'steel': 'Acier', 'cobalt': 'Cobalt',
  'compboard': 'Compboard', 'neograph': 'Néograph', 'silicon': 'Silicium',
  'moby-glass': 'Moby Glass', 'carbon-silk': 'Carbon Silk',
  'titanium-alloy': 'Alliage Titane', 'anti-hydrogen': 'Anti-hydrogène',
  'consumer-goods': 'Biens de Consommation', 'fresh-food': 'Nourriture Fraîche',
  'processed-food': 'Nourriture Transformée', 'agricultural-goods': 'Produits Agricoles',
  'agricultural-supplies': 'Fournitures Agricoles', 'distilled-spirits': 'Spiritueux',
  'bioplastic': 'Bioplastique', 'medical-supplies': 'Fournitures Médicales',
  'stims': 'Stimulants', 'construction-materials': 'Matériaux Construction',
  'hydrogen': 'Hydrogène', 'rmc': 'RMC', 'scrap': 'Ferraille',
  'coal': 'Charbon', 'wax': 'Cire', 'detatrine': 'Détratrine',
  'diluthermex': 'Diluthermex',
  'volcanic-mineral': 'Minéral Volcanique', 'pyrite': 'Pyrite',
  'pyro-salvage': 'Épave Pyro',
  // Illégaux
  'widow': 'WiDoW', 'slam': 'SLAM', 'uncut-slam': 'SLAM Brut',
  'maze': 'Maze', 'glow': 'Glow', 'neon-drug': 'Néon (Drogue)',
  'altruciatoxin': 'Altruciatoxine', 'mala': 'Mala', 'thrust': 'Thrust',
  'freeze': 'Freeze', 'zip': 'Zip', 'dcsr2': 'DCSR-2',
  'stims-illegal': 'Stimulants Illégaux', 'contraband-tech': 'Tech Contrebande',
  'stolen-medical': 'Médical Volé', 'weapons-cache': 'Cache Armes',
  'volcamic-mineral': 'Minéral Volcanique',
};

const stationList = Object.keys(STATION_PRICES).map(id => ({
  id,
  label: STATION_LABELS[id] || id,
  hasIllegal: Object.keys(STATION_PRICES[id]).some(c => ILLEGAL_COMMODITIES.has(c)),
}));

// Vaisseaux cargo disponibles
const CARGO_SHIPS = SHIPS
  .filter(s => s.specs?.cargo > 0 && s.inGame)
  .sort((a, b) => a.specs.cargo - b.specs.cargo)
  .map(s => ({
    id: s.id,
    label: `${s.name} (${s.manufacturer})`,
    name: s.name,
    manufacturer: s.manufacturer,
    scu: s.specs.cargo,
    price: s.price || 0,
  }));

// ----------------------------------------------------------------
// Algorithme d'optimisation cargo
// ----------------------------------------------------------------

function optimizeCargoLoad(commodities, totalScu, budget) {
  // Trie par profit/SCU décroissant, remplit le cargo greedy
  const sorted = [...commodities].sort((a, b) => b.profitPerSCU - a.profitPerSCU);
  const result = [];
  let remainingScu = totalScu;
  let remainingBudget = budget;

  for (const c of sorted) {
    if (remainingScu <= 0) break;
    if (c.buy <= 0 || c.profitPerSCU <= 0) continue;
    const maxByScu = remainingScu;
    const maxByBudget = remainingBudget < Infinity ? Math.floor(remainingBudget / c.buy) : Infinity;
    const quantity = Math.min(maxByScu, maxByBudget);
    if (quantity <= 0) continue;
    const totalCost = quantity * c.buy;
    const totalRevenue = quantity * c.sell;
    const totalProfit = quantity * c.profitPerSCU;
    result.push({
      commodityId: c.commodityId,
      name: COMMODITY_NAMES[c.commodityId] || c.commodityId,
      quantity,
      buy: c.buy,
      sell: c.sell,
      profitPerSCU: c.profitPerSCU,
      margin: c.margin,
      legal: c.legal,
      totalCost,
      totalRevenue,
      totalProfit,
    });
    remainingScu -= quantity;
    if (remainingBudget < Infinity) remainingBudget -= totalCost;
  }
  return result;
}

// ----------------------------------------------------------------
// Composant principal
// ----------------------------------------------------------------

export default function CargoOptimizer() {
  const { notify } = useAppActions();

  const [selectedShipId, setSelectedShipId] = useState('');
  const [customScu, setCustomScu] = useState(100);
  const [fromStation, setFromStation] = useState('cru-l1');
  const [toStation, setToStation] = useState('lorville');
  const [budget, setBudget] = useState('');
  const [includeIllegal, setIncludeIllegal] = useState(false);
  const [minProfitPerScu, setMinProfitPerScu] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizedCargo, setOptimizedCargo] = useState([]);
  const [showTopRoutes, setShowTopRoutes] = useState(true);

  // Vaisseau sélectionné ou custom
  const selectedShip = CARGO_SHIPS.find(s => s.id === selectedShipId) || null;
  const cargoScu = selectedShip ? selectedShip.scu : customScu;

  // Commodités disponibles entre les deux stations
  const availableCommodities = useMemo(() => {
    const raw = findBestCommodities(fromStation, toStation, !includeIllegal);
    return raw.filter(c => c.profitPerSCU >= minProfitPerScu);
  }, [fromStation, toStation, includeIllegal, minProfitPerScu]);

  const handleOptimize = () => {
    const budgetVal = budget ? Number(budget) : Infinity;
    const result = optimizeCargoLoad(availableCommodities, cargoScu, budgetVal);
    setOptimizedCargo(result);
    setIsOptimized(true);
    if (result.length === 0) {
      notify('Aucune commodité rentable trouvée entre ces deux stations.', 'warning');
    } else {
      notify(`Cargo optimisé : ${result.length} commodité${result.length > 1 ? 's' : ''}`, 'success');
    }
  };

  // Métriques résultat
  const totalScu = optimizedCargo.reduce((s, c) => s + c.quantity, 0);
  const totalCost = optimizedCargo.reduce((s, c) => s + c.totalCost, 0);
  const totalRevenue = optimizedCargo.reduce((s, c) => s + c.totalRevenue, 0);
  const totalProfit = optimizedCargo.reduce((s, c) => s + c.totalProfit, 0);
  const utilizationPct = cargoScu > 0 ? Math.min(100, (totalScu / cargoScu) * 100) : 0;
  const avgProfitPerScu = totalScu > 0 ? Math.round(totalProfit / totalScu) : 0;

  const pieData = optimizedCargo.map((c, i) => ({
    name: c.name,
    value: c.quantity,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Top routes filtrées selon le cargo du vaisseau
  const filteredTopRoutes = useMemo(() => {
    if (!cargoScu) return TOP_TRADE_ROUTES;
    // Petits vaisseaux < 10 SCU : toutes les routes, mais signaler les grandes routes
    return TOP_TRADE_ROUTES.filter(r => includeIllegal || r.legal);
  }, [cargoScu, includeIllegal]);

  const riskColor = (risk) => {
    if (!risk) return 'text-slate-400';
    if (risk.includes('Très élevé') || risk.includes('Très Élevé')) return 'text-red-400';
    if (risk.includes('Élevé') || risk.includes('élevé')) return 'text-orange-400';
    if (risk.includes('Faible') || risk.includes('faible') || risk.includes('Très faible')) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="page-header">
        <h1 className="page-title">
          Optimiseur de Cargo <span className="badge badge-cyan ml-2">IA</span>
        </h1>
        <p className="page-subtitle">
          Maximisez votre profit en choisissant un vaisseau, une route et laissez l'algorithme optimiser votre cargaison.
        </p>
      </div>

      {/* === CONFIGURATION === */}
      <div className="card p-5 space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          Configuration
        </h2>

        {/* Sélection vaisseau */}
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide block mb-2">
            Vaisseau Cargo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
            {CARGO_SHIPS.map(ship => (
              <button
                key={ship.id}
                onClick={() => setSelectedShipId(ship.id)}
                className={clsx(
                  'text-left p-3 rounded-lg border transition-all',
                  selectedShipId === ship.id
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-space-400/30 hover:border-space-400/60 text-slate-300'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{ship.name}</span>
                  <span className="badge badge-cyan text-xs flex-shrink-0">{ship.scu} SCU</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">{ship.manufacturer}</span>
                  {ship.price > 0 && (
                    <span className="text-xs text-slate-500">{formatCredits(ship.price, true)}</span>
                  )}
                </div>
              </button>
            ))}
            {/* Option personnalisée */}
            <button
              onClick={() => setSelectedShipId('')}
              className={clsx(
                'text-left p-3 rounded-lg border transition-all',
                selectedShipId === ''
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                  : 'border-space-400/30 hover:border-space-400/60 text-slate-300'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Personnalisé</span>
                <span className="badge badge-slate text-xs">{customScu} SCU</span>
              </div>
              <span className="text-xs text-slate-500">Saisir manuellement</span>
            </button>
          </div>
          {selectedShipId === '' && (
            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Capacité Personnalisée (SCU)</label>
              <input
                type="number"
                value={customScu}
                onChange={e => setCustomScu(Math.max(1, Number(e.target.value)))}
                className="input"
                min={1}
              />
            </div>
          )}
        </div>

        {/* Route */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Station de Départ</label>
            <select
              value={fromStation}
              onChange={e => { setFromStation(e.target.value); setIsOptimized(false); }}
              className="select"
            >
              {stationList.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Station d'Arrivée</label>
            <select
              value={toStation}
              onChange={e => { setToStation(e.target.value); setIsOptimized(false); }}
              className="select"
            >
              {stationList.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Paramètres avancés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Budget (aUEC)</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="Illimité"
              className="input"
              min={0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Profit Min/SCU</label>
            <input
              type="number"
              value={minProfitPerScu}
              onChange={e => setMinProfitPerScu(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="input"
              min={0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Options</label>
            <label className="flex items-center gap-2 cursor-pointer h-10">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeIllegal}
                  onChange={e => { setIncludeIllegal(e.target.checked); setIsOptimized(false); }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-space-500 peer-checked:bg-red-600 rounded-full transition-colors border border-space-400/40" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-slate-400">Inclure illégal</span>
            </label>
          </div>
        </div>

        {/* Aperçu commodités disponibles */}
        {availableCommodities.length > 0 && (
          <div className="rounded-lg bg-space-700/40 border border-space-400/20 p-3">
            <p className="text-xs text-slate-500 mb-2">
              {availableCommodities.length} commodité{availableCommodities.length > 1 ? 's' : ''} disponible{availableCommodities.length > 1 ? 's' : ''} sur cette route :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableCommodities.slice(0, 12).map(c => (
                <span
                  key={c.commodityId}
                  className={clsx(
                    'badge text-xs',
                    !c.legal ? 'badge-red' : 'badge-slate'
                  )}
                >
                  {COMMODITY_NAMES[c.commodityId] || c.commodityId} +{c.profitPerSCU} aUEC/SCU
                </span>
              ))}
              {availableCommodities.length > 12 && (
                <span className="badge badge-slate text-xs">+{availableCommodities.length - 12} autres</span>
              )}
            </div>
          </div>
        )}

        {availableCommodities.length === 0 && fromStation && toStation && (
          <div className="flex items-center gap-2 text-sm text-warning-400 p-3 rounded-lg bg-warning-500/10 border border-warning-500/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Aucun échange rentable trouvé entre ces deux stations avec les filtres actuels.
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={availableCommodities.length === 0}
          className="btn-primary gap-2 mt-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" />
          Optimiser le Cargo ({cargoScu} SCU)
        </button>
      </div>

      {/* === RÉSULTATS === */}
      {isOptimized && (
        <>
          {/* Métriques */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Commodités', value: optimizedCargo.length, icon: Package, color: 'text-cyan-400' },
              { label: 'Cargo Utilisé', value: `${totalScu}/${cargoScu} SCU`, icon: Ship, color: 'text-blue-400' },
              { label: 'Investissement', value: formatCredits(totalCost, true), icon: Calculator, color: 'text-warning-400' },
              { label: 'Revenus', value: formatCredits(totalRevenue, true), icon: TrendingUp, color: 'text-purple-400' },
              { label: 'Profit Net', value: formatCredits(totalProfit, true), icon: CheckCircle2, color: 'text-success-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-space-700/60">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-lg font-bold font-display ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Barre utilisation + profit/SCU */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-400">Utilisation du Cargo</span>
                <span className="text-xs text-slate-500 ml-2">
                  • Profit moyen : <span className="text-cyan-400 font-semibold">{formatCredits(avgProfitPerScu, false)}/SCU</span>
                </span>
              </div>
              <span className={clsx(
                'text-sm font-semibold',
                utilizationPct > 90 ? 'text-success-400' : utilizationPct > 60 ? 'text-cyan-400' : 'text-warning-400'
              )}>
                {utilizationPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-space-600 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all',
                  utilizationPct > 90 ? 'bg-success-500' : utilizationPct > 60 ? 'bg-cyan-500' : 'bg-warning-500'
                )}
                style={{ width: `${utilizationPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tableau de chargement */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-space-400/20">
                <h2 className="section-title">Cargaison Optimale</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {STATION_LABELS[fromStation]} → {STATION_LABELS[toStation]}
                </p>
              </div>
              {optimizedCargo.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-warning-400 mx-auto mb-2" />
                  <p className="text-slate-400">Aucune cargaison rentable trouvée avec ces paramètres.</p>
                </div>
              ) : (
                <div className="divide-y divide-space-400/10">
                  {/* En-têtes */}
                  <div className="px-4 py-2 grid grid-cols-12 gap-2 text-xs text-slate-500 uppercase tracking-wide">
                    <div className="col-span-4">Commodité</div>
                    <div className="col-span-2 text-right">SCU</div>
                    <div className="col-span-2 text-right">Coût</div>
                    <div className="col-span-2 text-right">Revenus</div>
                    <div className="col-span-2 text-right">Profit</div>
                  </div>
                  {optimizedCargo.map((item, idx) => (
                    <div key={item.commodityId} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-space-700/30">
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-slate-200 truncate block">{item.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {!item.legal && (
                              <span className="badge badge-red text-xs py-0">Illégal</span>
                            )}
                            <span className="text-xs text-slate-500">+{item.profitPerSCU}/SCU</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right text-sm text-slate-300">{item.quantity}</div>
                      <div className="col-span-2 text-right text-xs text-warning-400">{formatCredits(item.totalCost, true)}</div>
                      <div className="col-span-2 text-right text-xs text-blue-400">{formatCredits(item.totalRevenue, true)}</div>
                      <div className="col-span-2 text-right text-xs text-success-400 font-semibold">+{formatCredits(item.totalProfit, true)}</div>
                    </div>
                  ))}
                  {/* Totaux */}
                  <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center bg-space-700/20">
                    <div className="col-span-4 text-xs text-slate-500 uppercase font-semibold">Total</div>
                    <div className="col-span-2 text-right text-sm font-bold text-slate-200">{totalScu}</div>
                    <div className="col-span-2 text-right text-xs text-warning-400 font-bold">{formatCredits(totalCost, true)}</div>
                    <div className="col-span-2 text-right text-xs text-blue-400 font-bold">{formatCredits(totalRevenue, true)}</div>
                    <div className="col-span-2 text-right text-sm text-success-400 font-bold">+{formatCredits(totalProfit, true)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Camembert */}
            <div className="card p-4">
              <h2 className="section-title mb-1">Répartition du Cargo</h2>
              <p className="text-xs text-slate-500 mb-3">par commodité (en SCU)</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      outerRadius={88}
                      dataKey="value"
                      label={({ name, percent }) =>
                        percent > 0.07 ? `${(percent * 100).toFixed(0)}%` : ''
                      }
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0a1020',
                        border: '1px solid rgba(30,46,74,0.6)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(v, name) => [`${v} SCU`, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={v => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-600">
                  Aucune donnée à afficher
                </div>
              )}
            </div>
          </div>

          {/* Avertissement illégal */}
          {optimizedCargo.some(c => !c.legal) && (
            <div className="card p-4 flex items-start gap-3 border-red-500/20 bg-red-500/5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <span className="text-red-400 font-semibold">Attention — Cargaison illégale détectée.</span>{' '}
                Le scan de douane de l'UEE entraîne une amende et une augmentation du CrimeStat. Désactivez votre transpondeur et évitez les checkpoints.
              </div>
            </div>
          )}
        </>
      )}

      {!isOptimized && (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-400 mb-2">Prêt à Optimiser</h2>
          <p className="text-slate-500">
            Sélectionnez un vaisseau, choisissez vos stations de départ et d'arrivée, puis cliquez sur "Optimiser".
          </p>
        </div>
      )}

      {/* === TOP ROUTES === */}
      <div className="card overflow-hidden">
        <button
          className="w-full p-4 border-b border-space-400/20 flex items-center justify-between"
          onClick={() => setShowTopRoutes(v => !v)}
        >
          <div>
            <h2 className="section-title text-left">Top Routes Recommandées</h2>
            <p className="text-xs text-slate-500 mt-0.5 text-left">
              {cargoScu < 10 ? 'Routes adaptées aux petits cargos' : 'Toutes routes commerciales Alpha 4.0'}
            </p>
          </div>
          {showTopRoutes
            ? <ChevronUp className="w-4 h-4 text-slate-500" />
            : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showTopRoutes && (
          <div className="divide-y divide-space-400/10">
            {filteredTopRoutes.map(route => {
              const profitForCargo = Math.round(route.profitPerSCU * cargoScu);
              return (
                <div key={route.id} className="p-4 hover:bg-space-700/20 transition-colors">
                  <div className="flex flex-wrap items-start gap-3 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-slate-200">
                          {route.fromName} → {route.toName}
                        </span>
                        {!route.legal && (
                          <span className="badge badge-red text-xs">Illégal</span>
                        )}
                        <span className={clsx('text-xs font-medium', riskColor(route.risk))}>
                          Risque : {route.risk}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Commodité : <span className="text-slate-300">{route.commodityName}</span></span>
                        <span>Achat : <span className="text-warning-400">{route.buyPrice.toLocaleString()} aUEC/SCU</span></span>
                        <span>Vente : <span className="text-blue-400">{route.sellPrice.toLocaleString()} aUEC/SCU</span></span>
                        <span>Distance : {route.distance}</span>
                      </div>
                      {route.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">{route.notes}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-success-400 font-bold text-sm">
                        +{route.profitPerSCU.toLocaleString()} aUEC/SCU
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Avec {cargoScu} SCU :{' '}
                        <span className="text-success-400 font-semibold">
                          {formatCredits(profitForCargo, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
