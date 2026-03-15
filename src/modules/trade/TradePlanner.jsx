import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppActions } from '../../core/StateManager.jsx';
import { COMMODITIES, LEGAL_COMMODITIES, COMMODITY_CATEGORIES } from '../../datasets/commodities.js';
import { STATIONS, LEGAL_STATIONS, STATIONS_BY_ID } from '../../datasets/stations.js';
import { useLiveCommodities } from '../../hooks/useLiveData.js';
import {
  STATION_PRICES,
  TOP_TRADE_ROUTES,
  COMMODITY_META,
  findBestCommodities,
  getBuyPrice,
  getSellPrice,
} from '../../datasets/tradeprices.js';
import { calcTradeProfit, calcProfitPerHour } from '../../utils/calculations.js';
import { formatCredits, formatCargo, formatNumber, formatPercent } from '../../utils/formatters.js';
import { sortBy } from '../../utils/helpers.js';
import clsx from 'clsx';
import {
  TrendingUp, ArrowRight, Package, Calculator, Route,
  Star, Filter, RefreshCw, BarChart3, Shield, AlertTriangle,
  MapPin, Zap, ChevronDown, ChevronUp, Wifi, WifiOff,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ----------------------------------------------------------------
// Liste des stations avec prix connus
// ----------------------------------------------------------------
const PRICED_STATIONS = Object.keys(STATION_PRICES).map(id => {
  const station = STATIONS_BY_ID[id];
  return {
    id,
    name: station?.name ?? id,
    system: station?.system ?? 'Inconnu',
    legal: station?.legal ?? true,
  };
});

// ----------------------------------------------------------------
// Composant : carte d'une route commerciale calculée
// ----------------------------------------------------------------
function TradeRouteCard({ route, onSave }) {
  const { commodity, buyStation, sellStation, quantity, profit, profitPerScu, margin, profitPerHour, travelMin } = route;

  return (
    <div className="card p-4 hover:border-cyan-500/20 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-200">{commodity.name}</h3>
            {commodity.illegal && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-danger-500/20 text-danger-400 border border-danger-500/30">
                ILLÉGAL
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 flex-wrap">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium text-slate-400">{buyStation.name}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium text-slate-400">{sellStation.name}</span>
            {travelMin && (
              <span className="text-slate-600">• ~{travelMin} min</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-success-400">{formatCredits(profit, true)}</div>
          <div className="text-xs text-slate-500">profit total</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Par SCU', value: formatCredits(profitPerScu, false), color: 'text-cyan-400' },
          { label: 'Marge', value: formatPercent(margin), color: margin > 10 ? 'text-success-400' : 'text-warning-400' },
          { label: 'Quantité', value: `${quantity} SCU`, color: 'text-slate-300' },
          { label: '/Heure', value: formatCredits(profitPerHour, true), color: 'text-gold-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-2 rounded-lg bg-space-900/60">
            <div className={`text-sm font-semibold ${color}`}>{value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onSave(route)} className="btn-ghost btn-sm gap-1">
          <Star className="w-3.5 h-3.5" /> Sauvegarder
        </button>
        <button className="btn-primary btn-sm gap-2 ml-auto">
          <Route className="w-3.5 h-3.5" /> Planifier Route
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Composant : carte d'une Top Route pré-établie
// ----------------------------------------------------------------
function TopRouteCard({ route, cargoSCU, onSave }) {
  const profit = route.profitPerSCU * cargoSCU;

  return (
    <div className={clsx(
      'card p-4 hover:border-cyan-500/20 transition-all',
      !route.legal && 'border-danger-500/10 bg-danger-500/5'
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">{route.commodityName}</span>
            {!route.legal && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-danger-500/20 text-danger-400 border border-danger-500/30">
                ILLÉGAL
              </span>
            )}
            <span className={clsx(
              'px-1.5 py-0.5 rounded text-xs border',
              route.risk === 'Très faible' && 'bg-success-500/10 text-success-400 border-success-500/20',
              route.risk === 'Faible' && 'bg-success-500/10 text-success-400 border-success-500/20',
              route.risk === 'Élevé' && 'bg-warning-500/10 text-warning-400 border-warning-500/20',
              route.risk === 'Très élevé' && 'bg-danger-500/10 text-danger-400 border-danger-500/20',
            )}>
              {route.risk}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 flex-wrap">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-slate-400">{route.fromName}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-slate-400">{route.toName}</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">{route.distance}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-success-400">{formatCredits(profit, true)}</div>
          <div className="text-xs text-slate-500">{cargoSCU} SCU</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-sm font-semibold text-cyan-400">{formatCredits(route.buyPrice)}</div>
          <div className="text-xs text-slate-600">Achat/SCU</div>
        </div>
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-sm font-semibold text-success-400">{formatCredits(route.sellPrice)}</div>
          <div className="text-xs text-slate-600">Vente/SCU</div>
        </div>
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-sm font-semibold text-gold-400">+{formatCredits(route.profitPerSCU)}</div>
          <div className="text-xs text-slate-600">Profit/SCU</div>
        </div>
      </div>

      {route.notes && (
        <p className="text-xs text-slate-500 italic border-t border-space-600/30 pt-2">{route.notes}</p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Composant principal : TradePlanner
// ----------------------------------------------------------------
export default function TradePlanner() {
  const navigate = useNavigate();
  const { saveRoute, notify } = useAppActions();

  const [cargoCapacity, setCargoCapacity] = useState(100);
  const [budget, setBudget] = useState('');
  const [fromSystem, setFromSystem] = useState('Stanton');
  const [showIllegal, setShowIllegal] = useState(false);
  const [legalOnly, setLegalOnly] = useState(true);
  const [sortField, setSortField] = useState('profit');
  const [travelTime, setTravelTime] = useState(20);
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'top' | 'chart'
  const [useLivePrices, setUseLivePrices] = useState(false);

  // ---- Données live UEX Corp ----
  const { commodities: liveCommodities, isLive, loading: liveLoading, error: liveError, refresh: refreshLive } = useLiveCommodities();

  // ---- Calcul des routes avec données STATION_PRICES ----
  const tradeRoutes = useMemo(() => {
    // Sélection de la source dans le useMemo pour que les dépendances soient correctes
    const sourceCommodities = useLivePrices && isLive ? liveCommodities : COMMODITIES;
    const sourceLegal = useLivePrices && isLive
      ? liveCommodities.filter(c => !c.illegal)
      : LEGAL_COMMODITIES;

    let availableCommodities = (showIllegal && !legalOnly) ? sourceCommodities : sourceLegal;
    if (filterCategory) availableCommodities = availableCommodities.filter(c => c.category === filterCategory);

    // Stations légales du système sélectionné, avec des prix connus
    const tradeable = LEGAL_STATIONS.filter(s =>
      s.tradeable &&
      s.system === (fromSystem || 'Stanton') &&
      STATION_PRICES[s.id]
    );
    if (tradeable.length < 2) {
      // Fallback : utiliser toutes les stations légales du système même sans prix spécifiques
      const fallback = LEGAL_STATIONS.filter(s => s.tradeable && s.system === (fromSystem || 'Stanton'));
      if (fallback.length < 2) return [];
    }

    const routes = [];
    let idx = 0;

    availableCommodities.forEach(commodity => {
      if (commodity.sellPrice.avg <= commodity.buyPrice.avg) return;

      const stationsWithPrices = tradeable.filter(s => STATION_PRICES[s.id]);
      const fallbackStations = tradeable;
      const stationPool = stationsWithPrices.length >= 2 ? stationsWithPrices : fallbackStations;

      const buyStation = stationPool[idx % stationPool.length];
      const sellStation = stationPool[(idx + 1 + Math.floor(idx / stationPool.length)) % stationPool.length]
        || stationPool[(idx + 1) % stationPool.length];
      idx++;

      if (!buyStation || !sellStation || buyStation.id === sellStation.id) return;

      // Utiliser les prix réels si disponibles, sinon les prix moyens du dataset commodities
      const stationBuyPrice = getBuyPrice(buyStation.id, commodity.id) || commodity.buyPrice.avg;
      const stationSellPrice = getSellPrice(sellStation.id, commodity.id) || commodity.sellPrice.avg;

      if (stationSellPrice <= stationBuyPrice) return;

      const quantity = Math.min(
        cargoCapacity,
        999,
        budget ? Math.floor(Number(budget) / stationBuyPrice) : cargoCapacity
      );
      if (quantity <= 0) return;

      const { grossProfit, margin } = calcTradeProfit(stationBuyPrice, stationSellPrice, quantity);
      const travelKey = `from_${buyStation.id.replace(/-/g, '_')}`;
      const estimatedTravel = sellStation.travelTime?.[travelKey] ?? travelTime;
      const profitPerScu = grossProfit / quantity;
      const profitPerHour = calcProfitPerHour(grossProfit, estimatedTravel);

      routes.push({
        id: `${commodity.id}_${buyStation.id}_${sellStation.id}`,
        commodity,
        buyStation,
        sellStation,
        quantity,
        totalCost: stationBuyPrice * quantity,
        profit: grossProfit,
        profitPerScu,
        margin,
        profitPerHour,
        travelMin: estimatedTravel,
        buyPrice: stationBuyPrice,
        sellPrice: stationSellPrice,
      });
    });

    const sortMap = {
      profit: 'profit',
      profitPerScu: 'profitPerScu',
      profitPerHour: 'profitPerHour',
      margin: 'margin',
    };

    return sortBy(routes, sortMap[sortField] || 'profit', 'desc').slice(0, 20);
  }, [cargoCapacity, budget, showIllegal, legalOnly, sortField, travelTime, fromSystem, filterCategory, useLivePrices, isLive, liveCommodities]);

  // ---- Top routes filtrées ----
  const filteredTopRoutes = useMemo(() => {
    return TOP_TRADE_ROUTES.filter(r => legalOnly ? r.legal : true);
  }, [legalOnly]);

  // ---- Graphique top 8 ----
  const chartData = tradeRoutes.slice(0, 8).map(r => ({
    name: r.commodity.name.slice(0, 12),
    profit: Math.round(r.profitPerScu),
    achat: Math.round(r.buyPrice),
    vente: Math.round(r.sellPrice),
  }));

  const handleSaveRoute = (route) => {
    saveRoute({
      id: route.id,
      name: `${route.commodity.name}: ${route.buyStation.name} → ${route.sellStation.name}`,
      ...route,
    });
    notify('Route commerciale sauvegardée !', 'success');
  };

  const systems = [...new Set(LEGAL_STATIONS.map(s => s.system))].sort();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Planificateur Commercial</h1>
          <p className="page-subtitle">Trouvez les meilleures routes commerciales selon votre capacité de cargo</p>
        </div>
        {/* Badge Live UEX Corp */}
        <button
          onClick={() => {
            if (!useLivePrices) refreshLive();
            setUseLivePrices(v => !v);
          }}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
            useLivePrices && isLive
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              : useLivePrices && liveLoading
                ? 'bg-space-700 border-space-400/30 text-slate-400'
                : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:border-space-300/40'
          )}
          title={isLive ? 'Prix en temps réel depuis UEX Corp (189 commodités)' : 'Activer les prix live UEX Corp'}
        >
          {liveLoading && useLivePrices ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : useLivePrices && isLive ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          {useLivePrices && isLive ? 'Prix Live (UEX Corp)' : 'Prix Statiques'}
          {useLivePrices && isLive && (
            <span className="px-1 py-0.5 rounded text-xs bg-cyan-500/20 font-mono">
              {liveCommodities.length}
            </span>
          )}
        </button>
      </div>

      {/* Alerte live error */}
      {useLivePrices && liveError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Impossible de charger les prix live — utilisation des données statiques. ({liveError})
        </div>
      )}

      {/* ---- Paramètres ---- */}
      <div className="card p-4">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          Paramètres du Voyage
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Capacité Cargo (SCU)</label>
            <input
              type="number"
              value={cargoCapacity}
              onChange={e => setCargoCapacity(Math.max(1, Number(e.target.value)))}
              className="input"
              min={1}
              max={10000}
            />
          </div>
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
            <label className="text-xs text-slate-500 uppercase tracking-wide">Système</label>
            <select value={fromSystem} onChange={e => setFromSystem(e.target.value)} className="select">
              {systems.map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Catégorie</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="select">
              <option value="">Toutes</option>
              {COMMODITY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Trier Par</label>
            <select value={sortField} onChange={e => setSortField(e.target.value)} className="select">
              <option value="profit">Profit Total</option>
              <option value="profitPerScu">Profit/SCU</option>
              <option value="profitPerHour">Profit/Heure</option>
              <option value="margin">Marge</option>
            </select>
          </div>
        </div>

        {/* Options filtres légaux */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={legalOnly}
              onChange={e => setLegalOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-space-500 peer-checked:bg-success-600 rounded-full transition-colors border border-space-400/40 relative">
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <Shield className="w-3.5 h-3.5 text-success-400" />
            <span className="text-sm text-slate-400">Légal seulement</span>
          </label>
          {!legalOnly && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showIllegal}
                onChange={e => setShowIllegal(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-space-500 peer-checked:bg-danger-600 rounded-full transition-colors border border-space-400/40 relative">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <AlertTriangle className="w-3.5 h-3.5 text-danger-400" />
              <span className="text-sm text-slate-400">Inclure marchandises illégales</span>
            </label>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => navigate('/commerce/calculateur')} className="btn-secondary btn-sm gap-2">
              <Calculator className="w-3.5 h-3.5" />
              Calculateur Avancé
            </button>
            <button onClick={() => navigate('/commerce/cargo')} className="btn-primary btn-sm gap-2">
              <Package className="w-3.5 h-3.5" />
              Optimiser Cargo
            </button>
          </div>
        </div>
      </div>

      {/* ---- Onglets ---- */}
      <div className="flex items-center gap-1 border-b border-space-600/40">
        {[
          { id: 'routes', label: 'Routes Calculées', icon: BarChart3 },
          { id: 'top', label: `Top ${filteredTopRoutes.length} Routes`, icon: TrendingUp },
          { id: 'chart', label: 'Graphique', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- Onglet : Routes Calculées ---- */}
      {activeTab === 'routes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{tradeRoutes.length} Routes Calculées</h2>
            <span className="text-xs text-slate-500">
              Cargo: {cargoCapacity} SCU{budget ? ` • Budget: ${formatCredits(Number(budget), true)}` : ''}
              {legalOnly && <span className="ml-2 text-success-500">• Légal seulement</span>}
            </span>
          </div>
          {tradeRoutes.length === 0 ? (
            <div className="card p-10 text-center">
              <TrendingUp className="w-14 h-14 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Aucune route trouvée</p>
              <p className="text-slate-500 text-sm mt-1">
                Essayez d'ajuster les filtres ou de changer de système
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
              {tradeRoutes.map(route => (
                <TradeRouteCard key={route.id} route={route} onSave={handleSaveRoute} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Onglet : Top Routes Manuelles ---- */}
      {activeTab === 'top' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              Meilleures Routes Connues — Alpha 4.0
            </h2>
            <span className="text-xs text-slate-500">
              Cargo de référence : {cargoCapacity} SCU
            </span>
          </div>
          {!legalOnly && (
            <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger-300">
                Routes illégales visibles. Transport de marchandises illégales entraîne une peine de prison et la perte du cargo en cas de scan UEE.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
            {filteredTopRoutes.map(route => (
              <TopRouteCard key={route.id} route={route} cargoSCU={cargoCapacity} />
            ))}
          </div>
        </div>
      )}

      {/* ---- Onglet : Graphique ---- */}
      {activeTab === 'chart' && (
        <div className="card p-4">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Top 8 Commodités (Profit/SCU)
          </h2>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,74,0.5)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(1)}K`} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ background: '#0a1020', border: '1px solid rgba(30,46,74,0.6)', borderRadius: '8px', fontSize: '11px' }}
                    formatter={v => [`${formatNumber(v)} aUEC/SCU`, 'Profit']}
                  />
                  <Bar dataKey="profit" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Tableau récapitulatif */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-space-600/40">
                      <th className="text-left py-2 px-3 text-slate-500 font-medium">Commodité</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">Achat/SCU</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">Vente/SCU</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">Profit/SCU</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">Profit ({cargoCapacity} SCU)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeRoutes.slice(0, 10).map((r, i) => (
                      <tr key={r.id} className={clsx('border-b border-space-700/20', i % 2 === 0 ? 'bg-space-900/20' : '')}>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300">{r.commodity.name}</span>
                            {r.commodity.illegal && <span className="text-danger-400 text-[10px]">⚠️</span>}
                          </div>
                          <div className="text-slate-600 text-[10px]">{r.buyStation.name} → {r.sellStation.name}</div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">{formatCredits(r.buyPrice)}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{formatCredits(r.sellPrice)}</td>
                        <td className="py-2 px-3 text-right text-cyan-400 font-semibold">+{formatCredits(r.profitPerScu)}</td>
                        <td className="py-2 px-3 text-right text-success-400 font-semibold">{formatCredits(r.profit, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-slate-500">
              Aucune donnée à afficher — ajustez les paramètres
            </div>
          )}
        </div>
      )}
    </div>
  );
}
