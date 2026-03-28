import React, { useState, useMemo } from 'react';
import { useAppActions } from '../../core/StateManager.jsx';
import { STATIONS, LEGAL_STATIONS, STATIONS_BY_ID } from '../../datasets/stations.js';
import { COMMODITIES, LEGAL_COMMODITIES } from '../../datasets/commodities.js';
import { STAR_SYSTEMS_DATA } from '../../datasets/systems.js';
import {
  TOP_TRADE_ROUTES,
  STATION_PRICES,
  COMMODITY_META,
  getBuyPrice,
  getSellPrice,
} from '../../datasets/tradeprices.js';
import { findOptimalRoute, calcQTravelTime } from '../../utils/calculations.js';
import { formatCredits, formatNumber, formatDuration } from '../../utils/formatters.js';
import { generateId } from '../../utils/helpers.js';
import { useLiveRoutes } from '../../hooks/useLiveData.js';
import clsx from 'clsx';
import {
  Route, ArrowRight, Plus, Trash2, Save, Zap, Clock, Package,
  TrendingUp, AlertTriangle, Globe, Flame, Shield, ChevronDown, ChevronUp,
  Navigation, Star, Filter, MapPin, Search, RefreshCw, Wifi,
} from 'lucide-react';

// ─── Données Jump Points & Distances inter-système ─────────────────────────

const JUMP_POINTS = [
  {
    id: 'jp-stanton-pyro',
    from: 'Stanton',
    to: 'Pyro',
    name: 'Jump Point Stanton ↔ Pyro',
    qtTime: 22,          // minutes depuis le centre du système
    risk: 'Élevé',
    pvp: true,
    legal: true,
    notes: 'Passage le plus fréquenté. Embuscades fréquentes côté Pyro. Patrouilles UEE côté Stanton.',
  },
  {
    id: 'jp-stanton-nyx',
    from: 'Stanton',
    to: 'Nyx',
    name: 'Jump Point Stanton ↔ Nyx',
    qtTime: 18,
    risk: 'Faible',
    pvp: false,
    legal: true,
    notes: 'Passage relativement calme. Levski est la destination principale dans Nyx.',
  },
  {
    id: 'jp-stanton-magnus',
    from: 'Stanton',
    to: 'Magnus',
    name: 'Jump Point Stanton ↔ Magnus',
    qtTime: 25,
    risk: 'Faible',
    pvp: false,
    legal: true,
    notes: 'Magnus est peu peuplé. Passage tranquille sans grande activité commerciale.',
  },
];

const SYSTEM_DISTANCES = [
  { from: 'Stanton', to: 'Stanton', qtMinutes: 0,  label: 'Intra-système', color: 'text-cyan-400' },
  { from: 'Stanton', to: 'Pyro',    qtMinutes: 22, label: 'Inter-système (via JP)', color: 'text-orange-400' },
  { from: 'Stanton', to: 'Nyx',     qtMinutes: 18, label: 'Inter-système (via JP)', color: 'text-yellow-400' },
  { from: 'Pyro',    to: 'Stanton', qtMinutes: 22, label: 'Inter-système (via JP)', color: 'text-orange-400' },
  { from: 'Pyro',    to: 'Pyro',    qtMinutes: 0,  label: 'Intra-système', color: 'text-orange-400' },
];

const RISK_COLORS = {
  'Très faible': 'text-success-400',
  'Faible':      'text-success-400',
  'Élevé':       'text-warning-400',
  'Très élevé':  'text-danger-400',
};

// ─── Helper ROI badge ────────────────────────────────────────────────────────

function RoiBadge({ roi }) {
  if (!roi || roi <= 0) return null;
  const color = roi >= 50
    ? 'bg-success-500/15 text-success-400 border-success-500/30'
    : roi >= 20
      ? 'bg-warning-500/15 text-warning-400 border-warning-500/30'
      : 'bg-danger-500/15 text-danger-400 border-danger-500/30';
  return (
    <span className={clsx('px-1.5 py-0.5 rounded text-xs font-medium border', color)}>
      ROI {roi.toFixed(1)}%
    </span>
  );
}

// ─── Composants ─────────────────────────────────────────────────────────────

function WaypointCard({ waypoint, index, onRemove }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-space-900/50 border border-space-400/10">
      <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200">{waypoint.stationName}</div>
        <div className="text-xs text-slate-500">{waypoint.type} • {waypoint.system}</div>
        {waypoint.commodity && (
          <div className="text-xs text-green-400 mt-0.5">
            Commerce: {waypoint.commodity} ({waypoint.action === 'buy' ? 'Achat' : 'Vente'})
          </div>
        )}
      </div>
      <button onClick={() => onRemove(index)} className="btn-ghost p-1 text-danger-400 flex-shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function JumpPointCard({ jp }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-3 rounded-lg bg-space-900/50 border border-space-400/10 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-slate-200">{jp.name}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />~{jp.qtTime} min QT
              </span>
              <span className={clsx('text-xs font-medium', RISK_COLORS[jp.risk] || 'text-slate-400')}>
                Risque: {jp.risk}
              </span>
              {jp.pvp && (
                <span className="badge bg-danger-500/15 text-danger-400 border-danger-500/20 text-xs">PvP</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      {expanded && (
        <p className="mt-2 text-xs text-slate-400 border-t border-space-400/20 pt-2">{jp.notes}</p>
      )}
    </div>
  );
}

function TradeRouteCard({ route, cargoSCU, capital }) {
  const [expanded, setExpanded] = useState(false);
  const riskColor = RISK_COLORS[route.risk] || 'text-slate-400';
  const roi = route.buyPrice > 0 ? ((route.sellPrice - route.buyPrice) / route.buyPrice) * 100 : 0;
  const budgetNum = Number(capital) || 0;
  const nbLoops = (budgetNum > 0 && route.buyPrice > 0 && cargoSCU > 0)
    ? Math.max(1, Math.floor(budgetNum / (route.buyPrice * cargoSCU)))
    : null;
  const totalEstimated = nbLoops ? route.profitPerSCU * cargoSCU * nbLoops : null;

  return (
    <div className={clsx(
      'p-3 rounded-lg border transition-all',
      !route.legal ? 'border-danger-500/20 bg-danger-500/5' : 'border-space-400/10 bg-space-900/50',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200">{route.commodityName}</span>
            {!route.legal && (
              <span className="badge bg-danger-500/15 text-danger-400 border-danger-500/20 text-xs">Illégal</span>
            )}
            <RoiBadge roi={roi} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
            <span className="truncate">{route.fromName}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{route.toName}</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 text-success-400 font-medium">
          <TrendingUp className="w-3 h-3" />
          +{formatCredits(route.profitPerSCU, true)}/SCU
        </span>
        <span className="text-slate-500">({formatCredits(route.profitPerRun, true)} / {route.cargoRef} SCU)</span>
        <span className={clsx('font-medium', riskColor)}>Risque: {route.risk}</span>
      </div>

      {/* Stats boucles si capital renseigné */}
      {nbLoops !== null && (
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-400">
          <span>
            <span className="text-slate-300 font-medium">{nbLoops}</span> boucle{nbLoops > 1 ? 's' : ''} ({cargoSCU} SCU)
          </span>
          <span className="text-gold-400 font-semibold">
            Total : {formatCredits(totalEstimated, true)}
          </span>
        </div>
      )}

      {expanded && (
        <div className="mt-2 pt-2 border-t border-space-400/20 space-y-1 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Achat: <span className="text-slate-300">{formatCredits(route.buyPrice, true)}/SCU</span></span>
            <span>Vente: <span className="text-slate-300">{formatCredits(route.sellPrice, true)}/SCU</span></span>
          </div>
          <div className="text-slate-500">{route.distance}</div>
          {route.notes && (
            <p className="text-cyan-300 italic">{route.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function RouteOptimizer() {
  const { saveRoute, notify } = useAppActions();

  // Builder state
  const [waypoints, setWaypoints] = useState([]);
  const [addStationId, setAddStationId] = useState('');
  const [addCommodityId, setAddCommodityId] = useState('');
  const [addAction, setAddAction] = useState('buy');
  const [cargoCapacity, setCargoCapacity] = useState(100);
  const [filterSystem, setFilterSystem] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [routeName, setRouteName] = useState('');

  // Trade routes filters
  const [tradeTab, setTradeTab] = useState('builder'); // 'builder' | 'known-routes' | 'en-route' | 'jump-points'
  const [legalOnlyFilter, setLegalOnlyFilter] = useState(false);
  const [avoidPyroFilter, setAvoidPyroFilter] = useState(false);

  // Live UEX routes
  const { routes: liveRoutes, isLive: liveAvailable, lastUpdated: liveUpdatedAt, loading: liveLoading, error: liveError, refresh: refreshLive } = useLiveRoutes();
  const [useLive, setUseLive] = useState(false);
  const showLive = useLive && liveAvailable && liveRoutes.length > 0;

  // ---- État onglet En Route ----
  const [enRouteFrom, setEnRouteFrom] = useState('');
  const [enRouteTo, setEnRouteTo] = useState('');
  const [enRouteCargo, setEnRouteCargo] = useState(100);
  const [enRouteCapital, setEnRouteCapital] = useState(100000);
  const [enRouteLegal, setEnRouteLegal] = useState(true);
  const [enRouteResults, setEnRouteResults] = useState(null);

  // ---- Stations avec prix connus ----
  const pricedStations = useMemo(() => Object.keys(STATION_PRICES).map(id => {
    const st = STATIONS_BY_ID?.[id] || STATIONS.find(s => s.id === id);
    return { id, name: st?.name ?? id, system: st?.system ?? 'Inconnu' };
  }), []);

  // ---- Calcul En Route ----
  const handleEnRoute = () => {
    if (!enRouteFrom || !enRouteTo) return;
    const cargo = Math.max(1, Number(enRouteCargo));
    const capital = Math.max(0, Number(enRouteCapital));

    const fromPrices = STATION_PRICES[enRouteFrom] || {};
    const results = Object.entries(fromPrices)
      .filter(([, arr]) => arr[0] > 0)
      .map(([cId, arr]) => {
        const buyPrice = arr[0];
        const sellPrice = getSellPrice(enRouteTo, cId);
        const meta = COMMODITY_META[cId];
        const isIllegal = meta?.legalStatus === 'illegal';
        if (enRouteLegal && isIllegal) return null;
        const profitPerSCU = sellPrice - buyPrice;
        const roi = buyPrice > 0 ? (profitPerSCU / buyPrice) * 100 : 0;
        const qty = (capital > 0 && buyPrice > 0)
          ? Math.min(cargo, Math.floor(capital / buyPrice))
          : cargo;
        const totalProfit = profitPerSCU * qty;
        const nbLoops = (capital > 0 && buyPrice > 0)
          ? Math.max(1, Math.floor(capital / (buyPrice * cargo)))
          : null;
        const totalLoopsProfit = nbLoops ? profitPerSCU * cargo * nbLoops : null;
        const commodity = COMMODITIES.find(c => c.id === cId);
        return {
          commodityId: cId,
          commodityName: commodity?.name ?? cId,
          buyPrice,
          sellPrice,
          profitPerSCU,
          roi,
          qty,
          totalProfit,
          nbLoops,
          totalLoopsProfit,
          isIllegal,
        };
      })
      .filter(r => r !== null && r.profitPerSCU > 0)
      .sort((a, b) => b.profitPerSCU - a.profitPerSCU);

    setEnRouteResults(results);
  };

  const systems = useMemo(() => [...new Set(LEGAL_STATIONS.map(s => s.system))].sort(), []);
  const availableStations = useMemo(
    () => filterSystem ? LEGAL_STATIONS.filter(s => s.system === filterSystem) : LEGAL_STATIONS,
    [filterSystem],
  );

  // Normalize live UEX routes to match TradeRouteCard format
  const normalizedLiveRoutes = useMemo(() => {
    if (!liveRoutes || liveRoutes.length === 0) return [];
    return liveRoutes.map((r, i) => ({
      id: `live-${r.id ?? i}`,
      commodityName: r.commodity_name ?? r.name ?? 'Inconnu',
      fromName: r.terminal_buy_name ?? r.origin_name ?? r.from ?? 'Inconnu',
      toName: r.terminal_sell_name ?? r.destination_name ?? r.to ?? 'Inconnu',
      buyPrice: r.price_buy ?? r.buy_price ?? 0,
      sellPrice: r.price_sell ?? r.sell_price ?? 0,
      profitPerSCU: (r.price_sell ?? r.sell_price ?? 0) - (r.price_buy ?? r.buy_price ?? 0),
      profitPerRun: ((r.price_sell ?? r.sell_price ?? 0) - (r.price_buy ?? r.buy_price ?? 0)) * (r.scu ?? 100),
      cargoRef: r.scu ?? 100,
      risk: r.risk ?? 'Inconnu',
      legal: r.is_illegal ? false : true,
      distance: r.distance ?? '',
      notes: r.notes ?? null,
      _live: true,
    }));
  }, [liveRoutes]);

  const filteredTradeRoutes = useMemo(() => {
    let routes = showLive ? [...normalizedLiveRoutes] : [...TOP_TRADE_ROUTES];
    if (legalOnlyFilter) routes = routes.filter(r => r.legal);
    if (avoidPyroFilter) routes = routes.filter(r =>
      !r.distance?.toLowerCase().includes('pyro')
    );
    // Sort live routes by profit/SCU descending
    if (showLive) routes.sort((a, b) => b.profitPerSCU - a.profitPerSCU);
    return routes;
  }, [legalOnlyFilter, avoidPyroFilter, showLive, normalizedLiveRoutes]);

  const addWaypoint = () => {
    if (!addStationId) return;
    const station = STATIONS.find(s => s.id === addStationId);
    if (!station) return;

    const commodity = addCommodityId ? COMMODITIES.find(c => c.id === addCommodityId) : null;

    setWaypoints(prev => [...prev, {
      id: generateId('wp'),
      stationId: station.id,
      stationName: station.name,
      type: station.type,
      system: station.system,
      commodity: commodity?.name || null,
      commodityId: addCommodityId || null,
      action: addAction,
      coords: station.coords || { x: Math.random() * 100, y: Math.random() * 100, z: 0 },
    }]);
    setAddStationId('');
    setAddCommodityId('');
  };

  const removeWaypoint = (index) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
    setOptimizedRoute(null);
  };

  const optimizeRoute = () => {
    if (waypoints.length < 2) return;

    const optimized = findOptimalRoute(
      waypoints.map(wp => {
        const commodity = wp.commodityId ? COMMODITIES.find(c => c.id === wp.commodityId) : null;
        let profit = 0;
        if (commodity) {
          const margin = (commodity.sellPrice?.avg || 0) - (commodity.buyPrice?.avg || 0);
          profit = Math.max(0, margin * cargoCapacity);
        }
        return { ...wp, profit };
      }),
      waypoints[0]
    );

    // Calculer en tenant compte des sauts inter-systèmes
    let totalTime = 0;
    let totalProfit = 0;
    const segments = [];

    for (let i = 0; i < optimized.length; i++) {
      const from = i === 0 ? optimized[0] : optimized[i - 1];
      const to = optimized[i];

      // Base distance locale
      const dist = Math.sqrt(
        Math.pow((to.coords?.x || 0) - (from.coords?.x || 0), 2) +
        Math.pow((to.coords?.y || 0) - (from.coords?.y || 0), 2)
      );
      let time = Math.max(5, dist * 0.8 + 10);

      // Bonus temps si changement de système
      if (from.system && to.system && from.system !== to.system) {
        const jpEntry = SYSTEM_DISTANCES.find(
          d => d.from === from.system && d.to === to.system
        );
        time += jpEntry ? jpEntry.qtMinutes : 25;
      }

      totalTime += time;
      totalProfit += to.profit || 0;
      if (i > 0) {
        segments.push({
          from: from.stationName,
          fromSystem: from.system,
          to: to.stationName,
          toSystem: to.system,
          time: Math.round(time),
          profit: Math.round(to.profit || 0),
          interSystem: from.system !== to.system,
        });
      }
    }

    setOptimizedRoute({ route: optimized, segments, totalTime: Math.round(totalTime), totalProfit: Math.round(totalProfit) });
    notify('Route optimisée avec succès !', 'success');
  };

  const handleSaveRoute = () => {
    if (!optimizedRoute) return;
    saveRoute({
      id: generateId('route'),
      name: routeName || `Route (${waypoints.length} étapes)`,
      waypoints,
      optimized: optimizedRoute,
      savedAt: Date.now(),
    });
    notify('Route sauvegardée !', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Optimiseur de Routes</h1>
        <p className="page-subtitle">Planifiez vos trajets, consultez les routes connues et les jump points</p>
      </div>

      {/* Onglets principaux */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'builder',      label: 'Constructeur',  icon: Route },
          { key: 'known-routes', label: 'Routes Connues', icon: TrendingUp },
          { key: 'en-route',     label: 'En Route',       icon: MapPin },
          { key: 'jump-points',  label: 'Jump Points',    icon: Navigation },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTradeTab(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
              tradeTab === key
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-space-700/50 border-space-400/20 text-slate-400 hover:text-slate-300',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══ Onglet Constructeur ═══ */}
      {tradeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Builder */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="section-title mb-4">Construire la Route</h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wide">Système</label>
                    <select value={filterSystem} onChange={e => { setFilterSystem(e.target.value); setAddStationId(''); }} className="select">
                      <option value="">Tous</option>
                      {systems.map(sys => (
                        <option key={sys} value={sys}>{sys}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wide">Cargo (SCU)</label>
                    <input
                      type="number"
                      value={cargoCapacity}
                      onChange={e => setCargoCapacity(Math.max(1, Number(e.target.value)))}
                      className="input"
                      min={1}
                      max={10000}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-500 uppercase tracking-wide">Station</label>
                  <select value={addStationId} onChange={e => setAddStationId(e.target.value)} className="select">
                    <option value="">— Sélectionner une station —</option>
                    {availableStations.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{!filterSystem ? ` (${s.system})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wide">Commodité (opt.)</label>
                    <select value={addCommodityId} onChange={e => setAddCommodityId(e.target.value)} className="select">
                      <option value="">Aucune</option>
                      {LEGAL_COMMODITIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500 uppercase tracking-wide">Action</label>
                    <select value={addAction} onChange={e => setAddAction(e.target.value)} className="select">
                      <option value="buy">Acheter</option>
                      <option value="sell">Vendre</option>
                    </select>
                  </div>
                </div>

                <button onClick={addWaypoint} disabled={!addStationId} className="btn-primary gap-2 w-full">
                  <Plus className="w-4 h-4" />
                  Ajouter Étape
                </button>
              </div>
            </div>

            {/* Waypoints */}
            {waypoints.length > 0 && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-space-400/20 flex items-center justify-between">
                  <h2 className="section-title">{waypoints.length} Étape{waypoints.length > 1 ? 's' : ''}</h2>
                  <button onClick={() => setWaypoints([])} className="btn-ghost btn-sm text-danger-400">
                    Effacer tout
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {waypoints.map((wp, i) => (
                    <WaypointCard key={wp.id} waypoint={wp} index={i} onRemove={removeWaypoint} />
                  ))}
                </div>
                <div className="p-4 border-t border-space-400/20">
                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-xs text-slate-500">Nom de la route (opt.)</label>
                    <input
                      type="text"
                      value={routeName}
                      onChange={e => setRouteName(e.target.value)}
                      placeholder="Ma Route Commerciale"
                      className="input text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={optimizeRoute}
                      disabled={waypoints.length < 2}
                      className="btn-primary gap-2 flex-1"
                    >
                      <Zap className="w-4 h-4" />
                      Optimiser
                    </button>
                    {optimizedRoute && (
                      <button onClick={handleSaveRoute} className="btn-secondary gap-2">
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optimized Result */}
          <div>
            {optimizedRoute ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Durée Est.', value: `${optimizedRoute.totalTime} min`, icon: Clock, color: 'text-cyan-400' },
                    { label: 'Étapes', value: optimizedRoute.route.length, icon: Route, color: 'text-blue-400' },
                    { label: 'Profit Est.', value: formatCredits(optimizedRoute.totalProfit, true), icon: TrendingUp, color: 'text-success-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card p-3 text-center">
                      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                      <div className={`text-base font-bold font-display ${color}`}>{value}</div>
                      <div className="text-xs text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Route Steps */}
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-space-400/20">
                    <h2 className="section-title">Route Optimisée</h2>
                  </div>
                  <div className="divide-y divide-space-400/10">
                    {optimizedRoute.segments.map((seg, i) => (
                      <div key={i} className="p-3 flex items-center gap-3">
                        <div className="text-xs font-bold text-cyan-400 w-5">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm flex-wrap">
                            <span className="text-slate-400 truncate">{seg.from}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            <span className="text-slate-200 truncate">{seg.to}</span>
                            {seg.interSystem && (
                              <span className="badge bg-orange-500/15 text-orange-400 border-orange-500/20 text-xs">
                                Jump Point
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{seg.time} min</span>
                            <span className="flex items-center gap-1 text-success-400"><TrendingUp className="w-3 h-3" />+{formatCredits(seg.profit, true)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-400 mb-2">Créez votre Route</h2>
                <p className="text-slate-500 mb-4">Ajoutez au moins 2 étapes et cliquez sur "Optimiser" pour calculer la meilleure route.</p>
                <button
                  onClick={() => setTradeTab('known-routes')}
                  className="btn-secondary gap-2 mx-auto"
                >
                  <TrendingUp className="w-4 h-4" />
                  Voir les routes connues
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Onglet Routes Connues ═══ */}
      {tradeTab === 'known-routes' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
              <Filter className="w-4 h-4" /> Filtres :
            </span>
            <button
              onClick={() => setLegalOnlyFilter(!legalOnlyFilter)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                legalOnlyFilter
                  ? 'bg-success-500/15 border-success-500/30 text-success-400'
                  : 'bg-space-700/50 border-space-400/20 text-slate-400',
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              Légal seulement
            </button>
            <button
              onClick={() => setAvoidPyroFilter(!avoidPyroFilter)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                avoidPyroFilter
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                  : 'bg-space-700/50 border-space-400/20 text-slate-400',
              )}
            >
              <Flame className="w-3.5 h-3.5" />
              Éviter Pyro
            </button>

            {/* Toggle Routes Live UEX */}
            <button
              onClick={() => setUseLive(!useLive)}
              disabled={liveLoading}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                useLive && liveAvailable
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-space-700/50 border-space-400/20 text-slate-400',
              )}
            >
              <Wifi className="w-3.5 h-3.5" />
              {liveLoading ? 'Chargement...' : 'Routes Live'}
              {showLive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  LIVE
                </span>
              )}
            </button>
            {showLive && (
              <button
                onClick={refreshLive}
                className="p-1.5 rounded-lg border border-space-400/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                title="Rafraichir les données live"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', liveLoading && 'animate-spin')} />
              </button>
            )}

            <span className="text-xs text-slate-500 ml-auto flex items-center gap-2">
              {showLive && liveUpdatedAt && (
                <span className="text-emerald-400/70">
                  Derniere MAJ: {new Date(liveUpdatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {filteredTradeRoutes.length} route{filteredTradeRoutes.length !== 1 ? 's' : ''}
              {showLive && <span className="text-emerald-400">(UEX Corp)</span>}
            </span>
          </div>

          {/* Live error notice */}
          {useLive && liveError && !liveAvailable && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-500/5 border border-warning-500/20">
              <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0" />
              <p className="text-xs text-warning-300">
                Impossible de charger les routes live UEX Corp ({liveError}). Affichage des routes statiques.
              </p>
            </div>
          )}

          {/* Warning Pyro */}
          {!avoidPyroFilter && filteredTradeRoutes.some(r => r.distance?.toLowerCase().includes('pyro')) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-300">
                Certaines routes impliquent Pyro — zone à PvP élevé. Activez "Éviter Pyro" pour les masquer.
              </p>
            </div>
          )}

          {/* Liste routes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredTradeRoutes.map(route => (
              <TradeRouteCard key={route.id} route={route} cargoSCU={cargoCapacity} capital={enRouteCapital} />
            ))}
          </div>

          {filteredTradeRoutes.length === 0 && (
            <div className="card p-10 text-center">
              <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucune route correspond aux filtres actifs.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Onglet En Route ═══ */}
      {tradeTab === 'en-route' && (
        <div className="space-y-5">
          {/* Formulaire */}
          <div className="card p-5">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Optimisation En Route
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Trouvez la meilleure commodité à acheter à votre station de départ pour la revendre à destination.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wide">Départ</label>
                <select value={enRouteFrom} onChange={e => { setEnRouteFrom(e.target.value); setEnRouteResults(null); }} className="select">
                  <option value="">— Station de départ —</option>
                  {pricedStations.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.system})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wide">Destination finale</label>
                <select value={enRouteTo} onChange={e => { setEnRouteTo(e.target.value); setEnRouteResults(null); }} className="select">
                  <option value="">— Station d'arrivée —</option>
                  {pricedStations.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.system})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wide">Capacité Cargo (SCU)</label>
                <input
                  type="number"
                  value={enRouteCargo}
                  onChange={e => setEnRouteCargo(Math.max(1, Number(e.target.value)))}
                  className="input"
                  min={1}
                  max={10000}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wide">Capital (aUEC)</label>
                <input
                  type="number"
                  value={enRouteCapital}
                  onChange={e => setEnRouteCapital(Math.max(0, Number(e.target.value)))}
                  placeholder="100000"
                  className="input"
                  min={0}
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-1">
                  <input
                    type="checkbox"
                    checked={enRouteLegal}
                    onChange={e => setEnRouteLegal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-space-500 peer-checked:bg-success-600 rounded-full transition-colors border border-space-400/40 relative">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <Shield className="w-3.5 h-3.5 text-success-400" />
                  <span className="text-sm text-slate-400">Légal seulement</span>
                </label>
                <button
                  onClick={handleEnRoute}
                  disabled={!enRouteFrom || !enRouteTo}
                  className="btn-primary gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Optimiser
                </button>
              </div>
            </div>
          </div>

          {/* État initial */}
          {enRouteResults === null && (
            <div className="card p-10 text-center">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Sélectionnez un départ et une destination, puis cliquez sur "Optimiser".</p>
            </div>
          )}

          {/* Aucun résultat */}
          {enRouteResults !== null && enRouteResults.length === 0 && (
            <div className="space-y-3">
              <div className="card p-6 text-center border-warning-500/20">
                <AlertTriangle className="w-10 h-10 text-warning-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">Aucune route profitable directement</p>
                <p className="text-slate-500 text-sm mt-1">
                  Il n'y a pas de commodité achetable à{' '}
                  <span className="text-slate-300">{pricedStations.find(s => s.id === enRouteFrom)?.name}</span>{' '}
                  et vendable à{' '}
                  <span className="text-slate-300">{pricedStations.find(s => s.id === enRouteTo)?.name}</span> avec profit.
                </p>
              </div>
              <div className="card p-4 border-cyan-500/20 bg-cyan-500/5">
                <p className="text-xs text-cyan-400 font-semibold mb-2">Suggestion — Meilleures Routes Alternatives</p>
                <p className="text-xs text-slate-400">
                  Consultez l'onglet "Routes Connues" pour trouver des routes rentables au départ de stations proches.
                </p>
              </div>
            </div>
          )}

          {/* Résultats */}
          {enRouteResults !== null && enRouteResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-500">
                  {enRouteResults.length} commodité{enRouteResults.length > 1 ? 's' : ''} profitable{enRouteResults.length > 1 ? 's' : ''} —{' '}
                  <span className="text-slate-400">{pricedStations.find(s => s.id === enRouteFrom)?.name}</span>
                  {' '}<ArrowRight className="inline w-3 h-3" />{' '}
                  <span className="text-slate-400">{pricedStations.find(s => s.id === enRouteTo)?.name}</span>
                </p>
                <span className="text-xs text-slate-500">{enRouteCargo} SCU</span>
              </div>

              {enRouteResults.map((r, i) => {
                const isTop = i === 0;
                return (
                  <div key={r.commodityId} className={clsx(
                    'card p-4 transition-all',
                    isTop ? 'border-cyan-400/40 bg-cyan-500/5 hover:border-cyan-400/60' : 'hover:border-cyan-500/20',
                  )}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-200">{r.commodityName}</span>
                          {isTop && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              MEILLEURE OPTION
                            </span>
                          )}
                          {r.isIllegal && (
                            <span className="badge bg-danger-500/15 text-danger-400 border-danger-500/20 text-xs">Illégal</span>
                          )}
                          <RoiBadge roi={r.roi} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{pricedStations.find(s => s.id === enRouteFrom)?.name}</span>
                          <ArrowRight className="w-3 h-3 flex-shrink-0" />
                          <span>{pricedStations.find(s => s.id === enRouteTo)?.name}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={clsx('text-xl font-bold', isTop ? 'text-cyan-400' : 'text-success-400')}>
                          +{formatCredits(r.profitPerSCU)}/SCU
                        </div>
                        <div className="text-sm text-slate-300 font-semibold">
                          {formatCredits(r.totalProfit, true)}
                        </div>
                        <div className="text-xs text-slate-500">{r.qty} SCU</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                      <div className="p-2 rounded-lg bg-space-900/60">
                        <div className="text-sm font-semibold text-cyan-400">{formatCredits(r.buyPrice)}</div>
                        <div className="text-xs text-slate-600">Achat/SCU</div>
                      </div>
                      <div className="p-2 rounded-lg bg-space-900/60">
                        <div className="text-sm font-semibold text-success-400">{formatCredits(r.sellPrice)}</div>
                        <div className="text-xs text-slate-600">Vente/SCU</div>
                      </div>
                      <div className="p-2 rounded-lg bg-space-900/60">
                        <div className="text-sm font-semibold text-gold-400">+{formatCredits(r.profitPerSCU)}</div>
                        <div className="text-xs text-slate-600">Profit/SCU</div>
                      </div>
                    </div>

                    {r.nbLoops !== null && (
                      <div className="flex flex-wrap gap-3 text-xs text-slate-400 border-t border-space-600/20 pt-2">
                        <span>
                          <span className="text-slate-300 font-medium">{r.nbLoops}</span> boucle{r.nbLoops > 1 ? 's' : ''} avec capital
                        </span>
                        <span className="text-gold-400 font-semibold">
                          Profit total : {formatCredits(r.totalLoopsProfit, true)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ Onglet Jump Points ═══ */}
      {tradeTab === 'jump-points' && (
        <div className="space-y-4">
          {/* Info générale */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <Navigation className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-cyan-400">Jump Points — Voyages Inter-Systèmes</div>
              <p className="text-xs text-slate-400 mt-1">
                Les jump points permettent de voyager entre les systèmes stellaires. Le temps affiché est approximatif depuis le centre du système.
                Le temps de transit intra-système (QT) peut varier de 5 à 35 min selon la position de départ.
              </p>
            </div>
          </div>

          {/* Distances estimées */}
          <div className="card p-5">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Temps de Voyage Estimés
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Stanton → Stanton (intra)', time: '5–35 min', type: 'QT', color: 'text-cyan-400' },
                { label: 'Stanton → Pyro (via JP)', time: '22–45 min', type: 'QT + Saut', color: 'text-orange-400' },
                { label: 'Stanton → Nyx (via JP)', time: '18–40 min', type: 'QT + Saut', color: 'text-yellow-400' },
                { label: 'Pyro → Pyro (intra)', time: '5–30 min', type: 'QT', color: 'text-orange-400' },
                { label: 'Pyro → Stanton (retour)', time: '22–45 min', type: 'QT + Saut', color: 'text-orange-400' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between p-2 rounded-lg bg-space-900/50">
                  <span className="text-sm text-slate-300">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{row.type}</span>
                    <span className={clsx('text-sm font-bold font-display', row.color)}>{row.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cartes Jump Points */}
          <div>
            <h3 className="section-title mb-3">Jump Points Connus</h3>
            <div className="space-y-2">
              {JUMP_POINTS.map(jp => (
                <JumpPointCard key={jp.id} jp={jp} />
              ))}
            </div>
          </div>

          {/* Conseil Pyro */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-danger-500/5 border border-danger-500/20">
            <AlertTriangle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-danger-400">Attention — Jump Point Stanton-Pyro</div>
              <ul className="mt-1 space-y-0.5 text-xs text-slate-400 list-disc list-inside">
                <li>Embuscades très fréquentes à la sortie côté Pyro</li>
                <li>Activez le QT immédiatement après la sortie du saut</li>
                <li>Évitez de vous arrêter dans la zone d'arrivée</li>
                <li>Patrouilles UEE côté Stanton — cargo illégal risqué</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
