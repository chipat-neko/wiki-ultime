import { useState, useMemo, useCallback } from 'react';
import {
  Ship, MapPin, Plus, Trash2, ChevronUp, ChevronDown,
  Zap, TrendingUp, Clock, Package, DollarSign, RotateCcw, Sparkles
} from 'lucide-react';
import { SHIPS } from '../../datasets/ships.js';
import { STATION_PRICES, TOP_TRADE_ROUTES, findBestCommodities } from '../../datasets/tradeprices.js';
import { COMMODITIES } from '../../datasets/commodities.js';
import { useLiveRoutes } from '../../hooks/useLiveData.js';

// ── Labels lisibles pour les stations ──────────────────────
const STATION_LABELS = {
  'lorville': 'Lorville (Hurston)',
  'area18': 'Area18 (ArcCorp)',
  'new-babbage': 'New Babbage (MicroTech)',
  'orison': 'Orison (Crusader)',
  'cru-l1': 'CRU-L1',
  'hur-l1': 'HUR-L1',
  'arc-l1': 'ARC-L1',
  'mic-l1': 'MIC-L1',
  'port-tressler': 'Port Tressler',
  'grimhex': 'GrimHEX',
  'pyrochem': 'PyroChem (Pyro)',
  'levski': 'Levski (Nyx)',
  'ruin-station': 'Ruin Station (Pyro IV)',
  'checkmate': 'Checkmate (Pyro II)',
  'orbituary': 'Orbituary (Pyro I)',
  'patch-city': 'Patch City (Pyro III)',
  'rats-nest': "Rat's Nest (Pyro)",
  'endgame': 'Endgame (Pyro V)',
  'dudley-daughters': "Dudley & Daughter's",
  'windfall': 'Windfall (Pyro III)',
  'rustville': 'Rustville (Pyro II)',
};

const STATION_IDS = Object.keys(STATION_PRICES);
const CARGO_SHIPS = SHIPS.filter(s => s.specs?.cargo > 0).sort((a, b) => a.specs.cargo - b.specs.cargo);

const COMMODITY_MAP = {};
COMMODITIES.forEach(c => { COMMODITY_MAP[c.id] = c; });

// Temps estimé entre stations (minutes) — simplifié
function estimateTravelTime(from, to) {
  if (from === to) return 0;
  const pyroStations = ['pyrochem', 'ruin-station', 'checkmate', 'orbituary', 'patch-city', 'rats-nest', 'endgame', 'dudley-daughters', 'windfall', 'rustville'];
  const isPyroA = pyroStations.includes(from);
  const isPyroB = pyroStations.includes(to);
  if (isPyroA && isPyroB) return 6;
  if (isPyroA !== isPyroB) return 18; // inter-système
  // Stanton intra
  const hubs = ['lorville', 'area18', 'new-babbage', 'orison'];
  if (hubs.includes(from) && hubs.includes(to)) return 10;
  return 7;
}

// Trouver les commodités achetables à une station
function getCommoditiesAt(stationId, type) {
  const prices = STATION_PRICES[stationId];
  if (!prices) return [];
  return Object.entries(prices)
    .filter(([, [buy, sell]]) => type === 'buy' ? buy > 0 : sell > 0)
    .map(([id, [buy, sell]]) => ({
      id,
      name: COMMODITY_MAP[id]?.name || id,
      price: type === 'buy' ? buy : sell,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function createEmptyStop(order) {
  return { id: crypto.randomUUID(), order, station: '', commodity: '', action: 'buy', qty: 0 };
}

// ── Auto-optimisation : trouver la meilleure route multi-stops ──
function findBestMultiRoute(cargo, stopCount) {
  const results = [];
  const stations = STATION_IDS;

  for (const r of TOP_TRADE_ROUTES) {
    if (!r.legal) continue;
    const buyPrice = STATION_PRICES[r.from]?.[r.commodity]?.[0];
    const sellPrice = STATION_PRICES[r.to]?.[r.commodity]?.[1];
    if (!buyPrice || !sellPrice || buyPrice >= sellPrice) continue;

    const qty = Math.min(cargo, 200);
    const profit = (sellPrice - buyPrice) * qty;
    results.push({
      stops: [
        { station: r.from, commodity: r.commodity, action: 'buy', qty },
        { station: r.to, commodity: r.commodity, action: 'sell', qty },
      ],
      totalProfit: profit,
    });
  }

  // Essayer des routes 3-stops : A→buy→B→sell+buy→C→sell
  if (stopCount >= 3) {
    for (const r1 of TOP_TRADE_ROUTES.slice(0, 8)) {
      if (!r1.legal) continue;
      const buy1 = STATION_PRICES[r1.from]?.[r1.commodity]?.[0];
      const sell1 = STATION_PRICES[r1.to]?.[r1.commodity]?.[1];
      if (!buy1 || !sell1 || buy1 >= sell1) continue;

      // Depuis r1.to, chercher le meilleur achat pour aller vers une 3e station
      for (const r2 of TOP_TRADE_ROUTES.slice(0, 8)) {
        if (!r2.legal || r2.from !== r1.to) continue;
        const buy2 = STATION_PRICES[r2.from]?.[r2.commodity]?.[0];
        const sell2 = STATION_PRICES[r2.to]?.[r2.commodity]?.[1];
        if (!buy2 || !sell2 || buy2 >= sell2) continue;

        const qty = Math.min(cargo, 200);
        const profit = ((sell1 - buy1) + (sell2 - buy2)) * qty;
        results.push({
          stops: [
            { station: r1.from, commodity: r1.commodity, action: 'buy', qty },
            { station: r1.to, commodity: r1.commodity, action: 'sell', qty },
            { station: r2.from, commodity: r2.commodity, action: 'buy', qty },
            { station: r2.to, commodity: r2.commodity, action: 'sell', qty },
          ],
          totalProfit: profit,
        });
      }
    }
  }

  results.sort((a, b) => b.totalProfit - a.totalProfit);
  return results[0] || null;
}

export default function MultiStopPlanner() {
  const { data: liveRoutes } = useLiveRoutes();

  const [selectedShip, setSelectedShip] = useState('');
  const [stops, setStops] = useState([createEmptyStop(0), createEmptyStop(1)]);
  const [budget, setBudget] = useState(100000);

  const ship = useMemo(() => SHIPS.find(s => s.id === selectedShip), [selectedShip]);
  const cargo = ship?.specs?.cargo || 0;

  // ── Stop management ──────────────────────────────────────
  const updateStop = useCallback((id, field, value) => {
    setStops(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      // Reset commodity quand la station change
      if (field === 'station') updated.commodity = '';
      return updated;
    }));
  }, []);

  const addStop = useCallback(() => {
    setStops(prev => {
      if (prev.length >= 6) return prev;
      return [...prev, createEmptyStop(prev.length)];
    });
  }, []);

  const removeStop = useCallback((id) => {
    setStops(prev => {
      if (prev.length <= 2) return prev;
      return prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const moveStop = useCallback((id, dir) => {
    setStops(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const resetStops = useCallback(() => {
    setStops([createEmptyStop(0), createEmptyStop(1)]);
    setSelectedShip('');
    setBudget(100000);
  }, []);

  // ── Calcul des legs (segments) ───────────────────────────
  const legs = useMemo(() => {
    const result = [];
    let currentCargo = 0;
    let totalInvested = 0;

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      if (!stop.station || !stop.commodity) continue;

      const prices = STATION_PRICES[stop.station];
      if (!prices || !prices[stop.commodity]) continue;

      const [buyP, sellP] = prices[stop.commodity];
      const qty = stop.qty || 0;

      if (stop.action === 'buy' && buyP > 0) {
        const cost = buyP * qty;
        currentCargo += qty;
        totalInvested += cost;
        result.push({
          stopIndex: i,
          station: stop.station,
          commodity: stop.commodity,
          action: 'buy',
          qty,
          unitPrice: buyP,
          total: -cost,
          cargoAfter: currentCargo,
        });
      } else if (stop.action === 'sell' && sellP > 0) {
        const revenue = sellP * qty;
        currentCargo = Math.max(0, currentCargo - qty);
        result.push({
          stopIndex: i,
          station: stop.station,
          commodity: stop.commodity,
          action: 'sell',
          qty,
          unitPrice: sellP,
          total: revenue,
          cargoAfter: currentCargo,
        });
      }
    }
    return result;
  }, [stops]);

  // ── Résumé des profits ───────────────────────────────────
  const summary = useMemo(() => {
    const totalRevenue = legs.filter(l => l.action === 'sell').reduce((s, l) => s + l.total, 0);
    const totalCost = legs.filter(l => l.action === 'buy').reduce((s, l) => s + Math.abs(l.total), 0);
    const profit = totalRevenue - totalCost;
    const totalSCU = legs.filter(l => l.action === 'sell').reduce((s, l) => s + l.qty, 0);
    const profitPerSCU = totalSCU > 0 ? Math.round(profit / totalSCU) : 0;

    // Temps estimé
    let totalTime = 0;
    for (let i = 1; i < stops.length; i++) {
      if (stops[i].station && stops[i - 1].station) {
        totalTime += estimateTravelTime(stops[i - 1].station, stops[i].station);
      }
    }
    // + 3 min par arrêt (atterrissage, dock, trade)
    totalTime += stops.filter(s => s.station).length * 3;

    const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : '0.0';

    return { profit, totalCost, totalRevenue, profitPerSCU, totalTime, roi, totalSCU };
  }, [legs, stops]);

  // ── Auto-optimise ────────────────────────────────────────
  const autoOptimize = useCallback(() => {
    if (!cargo) return;
    const best = findBestMultiRoute(cargo, 3);
    if (!best) return;

    // Convertir en stops
    const newStops = best.stops.map((s, i) => ({
      id: crypto.randomUUID(),
      order: i,
      station: s.station,
      commodity: s.commodity,
      action: s.action,
      qty: Math.min(s.qty, cargo),
    }));

    // Dédupliquer les stops consécutifs sur la même station (sell+buy)
    const merged = [];
    for (const s of newStops) {
      const last = merged[merged.length - 1];
      if (last && last.station === s.station && last.action === 'sell' && s.action === 'buy') {
        // Garder les deux mais c'est normal d'avoir sell+buy à la même station
        merged.push(s);
      } else {
        merged.push(s);
      }
    }

    setStops(merged.map((s, i) => ({ ...s, order: i })));
  }, [cargo]);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MapPin className="text-cyan-400" size={28} />
            Planificateur Multi-Étapes
          </h1>
          <p className="text-space-300 mt-1">
            Optimisez vos routes cargo avec plusieurs arrêts d'achat et de vente
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={autoOptimize}
            disabled={!cargo}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-40"
          >
            <Sparkles size={16} /> Auto-optimiser
          </button>
          <button
            onClick={resetStops}
            className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <RotateCcw size={16} /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Ship selector + Budget */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-space-300 mb-1">Vaisseau</label>
          <select
            value={selectedShip}
            onChange={e => setSelectedShip(e.target.value)}
            className="input w-full"
          >
            <option value="">— Choisir un vaisseau —</option>
            {CARGO_SHIPS.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.manufacturer}) — {s.specs.cargo} SCU
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-space-300 mb-1">Capacité cargo</label>
          <div className="flex items-center gap-2 h-10 px-3 bg-space-800/50 border border-space-600 rounded-lg">
            <Package size={16} className="text-cyan-400" />
            <span className="text-white font-mono text-lg">{cargo} SCU</span>
          </div>
        </div>
        <div>
          <label className="block text-sm text-space-300 mb-1">Budget (aUEC)</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="input w-full"
            min={0}
            step={10000}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne gauche : Stop Builder ────────────── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Étapes ({stops.length}/6)</h2>
            <button
              onClick={addStop}
              disabled={stops.length >= 6}
              className="btn-ghost text-sm flex items-center gap-1 px-3 py-1.5 rounded-lg disabled:opacity-40"
            >
              <Plus size={14} /> Ajouter un arrêt
            </button>
          </div>

          {stops.map((stop, idx) => {
            const commodities = stop.station
              ? getCommoditiesAt(stop.station, stop.action)
              : [];

            return (
              <div key={stop.id} className="card p-4 relative border-l-4 border-cyan-500/60">
                {/* Numéro + réorder */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => moveStop(stop.id, -1)}
                      disabled={idx === 0}
                      className="text-space-400 hover:text-cyan-400 disabled:opacity-20 transition"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => moveStop(stop.id, 1)}
                      disabled={idx === stops.length - 1}
                      className="text-space-400 hover:text-cyan-400 disabled:opacity-20 transition"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Champs */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-space-400 mb-1">Station</label>
                      <select
                        value={stop.station}
                        onChange={e => updateStop(stop.id, 'station', e.target.value)}
                        className="input w-full text-sm"
                      >
                        <option value="">— Station —</option>
                        {STATION_IDS.map(sid => (
                          <option key={sid} value={sid}>{STATION_LABELS[sid] || sid}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-space-400 mb-1">Action</label>
                      <select
                        value={stop.action}
                        onChange={e => updateStop(stop.id, 'action', e.target.value)}
                        className="input w-full text-sm"
                      >
                        <option value="buy">Acheter</option>
                        <option value="sell">Vendre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-space-400 mb-1">Commodité</label>
                      <select
                        value={stop.commodity}
                        onChange={e => updateStop(stop.id, 'commodity', e.target.value)}
                        className="input w-full text-sm"
                        disabled={!stop.station}
                      >
                        <option value="">— Commodité —</option>
                        {commodities.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.price.toLocaleString()} aUEC)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-space-400 mb-1">Quantité (SCU)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={stop.qty || ''}
                          onChange={e => updateStop(stop.id, 'qty', Math.max(0, Number(e.target.value)))}
                          className="input w-full text-sm"
                          min={0}
                          max={cargo || 9999}
                          placeholder="0"
                        />
                        {cargo > 0 && (
                          <button
                            onClick={() => updateStop(stop.id, 'qty', cargo)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap px-2"
                            title="Remplir au maximum"
                          >
                            MAX
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={() => removeStop(stop.id)}
                    disabled={stops.length <= 2}
                    className="text-space-500 hover:text-red-400 disabled:opacity-20 transition mt-4"
                    title="Supprimer cet arrêt"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Ligne de connexion */}
                {idx < stops.length - 1 && (
                  <div className="absolute -bottom-3 left-[1.85rem] w-0.5 h-3 bg-cyan-500/30" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Colonne droite : Timeline + Résumé ──────── */}
        <div className="space-y-4">
          {/* Résumé profit */}
          <div className="card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-space-300 uppercase tracking-wide">Résumé du trajet</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-space-800/60 rounded-lg p-3 text-center">
                <DollarSign size={18} className="mx-auto text-yellow-400 mb-1" />
                <p className="text-xs text-space-400">Profit total</p>
                <p className={`text-lg font-bold ${summary.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.profit.toLocaleString()} aUEC
                </p>
              </div>
              <div className="bg-space-800/60 rounded-lg p-3 text-center">
                <TrendingUp size={18} className="mx-auto text-cyan-400 mb-1" />
                <p className="text-xs text-space-400">Profit/SCU</p>
                <p className="text-lg font-bold text-white">
                  {summary.profitPerSCU.toLocaleString()} aUEC
                </p>
              </div>
              <div className="bg-space-800/60 rounded-lg p-3 text-center">
                <Clock size={18} className="mx-auto text-purple-400 mb-1" />
                <p className="text-xs text-space-400">Temps estimé</p>
                <p className="text-lg font-bold text-white">{summary.totalTime} min</p>
              </div>
              <div className="bg-space-800/60 rounded-lg p-3 text-center">
                <Zap size={18} className="mx-auto text-orange-400 mb-1" />
                <p className="text-xs text-space-400">ROI</p>
                <p className="text-lg font-bold text-white">{summary.roi}%</p>
              </div>
            </div>

            <div className="text-xs text-space-500 border-t border-space-700 pt-2 space-y-1">
              <p>Investissement : <span className="text-space-300">{summary.totalCost.toLocaleString()} aUEC</span></p>
              <p>Revenus : <span className="text-space-300">{summary.totalRevenue.toLocaleString()} aUEC</span></p>
              <p>SCU transportés : <span className="text-space-300">{summary.totalSCU}</span></p>
              {summary.totalCost > budget && (
                <p className="text-red-400 font-medium mt-1">
                  Attention : investissement supérieur au budget !
                </p>
              )}
            </div>
          </div>

          {/* Timeline visuelle */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-space-300 uppercase tracking-wide mb-3">
              Itinéraire
            </h3>

            {legs.length === 0 ? (
              <p className="text-space-500 text-sm text-center py-6">
                Configurez vos étapes pour voir l'itinéraire
              </p>
            ) : (
              <div className="relative pl-6 space-y-4">
                {/* Ligne verticale */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-green-500 opacity-40" />

                {legs.map((leg, i) => {
                  const isBuy = leg.action === 'buy';
                  const commName = COMMODITY_MAP[leg.commodity]?.name || leg.commodity;
                  const stationName = STATION_LABELS[leg.station] || leg.station;

                  return (
                    <div key={i} className="relative">
                      {/* Dot */}
                      <div className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                        isBuy ? 'bg-red-500/20 border-red-400' : 'bg-green-500/20 border-green-400'
                      }`} />

                      <div className="bg-space-800/40 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-space-400">{stationName}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isBuy
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {isBuy ? 'ACHAT' : 'VENTE'}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium">
                          {commName} × {leg.qty} SCU
                        </p>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-space-400">
                            {leg.unitPrice.toLocaleString()} aUEC/SCU
                          </span>
                          <span className={`font-mono font-bold ${
                            leg.total >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {leg.total >= 0 ? '+' : ''}{leg.total.toLocaleString()} aUEC
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-space-500">
                          Cargo : {leg.cargoAfter}/{cargo || '?'} SCU
                        </div>
                      </div>

                      {/* Temps entre étapes */}
                      {i < legs.length - 1 && legs[i + 1] && (
                        <div className="text-center text-xs text-space-500 py-1">
                          ↓ ~{estimateTravelTime(leg.station, legs[i + 1].station)} min
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Données live */}
          {liveRoutes && liveRoutes.length > 0 && (
            <div className="card p-3">
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Prix live UEX Corp actifs — {liveRoutes.length} routes disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
