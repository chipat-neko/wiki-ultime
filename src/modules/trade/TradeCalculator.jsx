import React, { useState, useMemo, useEffect } from 'react';
import { COMMODITIES } from '../../datasets/commodities.js';
import { STATIONS_BY_ID } from '../../datasets/stations.js';
import {
  STATION_PRICES,
  COMMODITY_META,
  findBestCommodities,
  getBuyPrice,
  getSellPrice,
} from '../../datasets/tradeprices.js';
import { calcTradeProfit, calcBreakEven } from '../../utils/calculations.js';
import { formatCredits, formatNumber, formatPercent } from '../../utils/formatters.js';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, MapPin, ArrowRight, Package, Zap, Search, X } from 'lucide-react';
import clsx from 'clsx';

// Liste des stations avec prix connus (pour les selects)
const STATION_OPTIONS = Object.keys(STATION_PRICES).map(id => {
  const s = STATIONS_BY_ID[id];
  return { id, name: s?.name ?? id, system: s?.system ?? '?', legal: s?.legal ?? true };
}).sort((a, b) => a.name.localeCompare(b.name));

export default function TradeCalculator() {
  const [commodity, setCommodity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fees, setFees] = useState('');
  const [travelTime, setTravelTime] = useState('20');
  const [investment, setInvestment] = useState('');
  const [search, setSearch] = useState('');

  // Nouvelles options : stations départ/arrivée
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');

  const selectedCommodity = COMMODITIES.find(c => c.id === commodity);
  const fromStationInfo = fromStation ? STATIONS_BY_ID[fromStation] : null;
  const toStationInfo = toStation ? STATIONS_BY_ID[toStation] : null;

  // Auto-remplissage des prix quand station départ + commodité changent
  useEffect(() => {
    if (fromStation && commodity) {
      const price = getBuyPrice(fromStation, commodity);
      if (price > 0) setBuyPrice(String(price));
    }
  }, [fromStation, commodity]);

  // Auto-remplissage prix vente quand station arrivée + commodité changent
  useEffect(() => {
    if (toStation && commodity) {
      const price = getSellPrice(toStation, commodity);
      if (price > 0) setSellPrice(String(price));
    }
  }, [toStation, commodity]);

  // Meilleures commodités entre les deux stations sélectionnées
  const bestCommodities = useMemo(() => {
    if (!fromStation || !toStation) return [];
    return findBestCommodities(fromStation, toStation).slice(0, 8);
  }, [fromStation, toStation]);

  const result = useMemo(() => {
    const buy = Number(buyPrice);
    const sell = Number(sellPrice);
    const qty = Number(quantity);
    if (!buy || !sell || !qty) return null;
    return calcTradeProfit(buy, sell, qty, Number(fees) || 0);
  }, [buyPrice, sellPrice, quantity, fees]);

  const profitPerHour = useMemo(() => {
    if (!result || !travelTime) return null;
    const time = Number(travelTime);
    return time > 0 ? (result.netProfit / time) * 60 : 0;
  }, [result, travelTime]);

  const breakEven = useMemo(() => {
    if (!investment || !result?.netProfit) return null;
    return calcBreakEven(Number(investment), result.netProfit, Number(travelTime) || 20);
  }, [investment, result, travelTime]);

  const handleCommoditySelect = (id) => {
    setCommodity(id);
    const c = COMMODITIES.find(c => c.id === id);
    if (c) {
      // Prix par station en priorité, sinon prix moyen dataset
      const buyVal = fromStation ? getBuyPrice(fromStation, id) : 0;
      const sellVal = toStation ? getSellPrice(toStation, id) : 0;
      setBuyPrice(buyVal > 0 ? String(buyVal) : c.buyPrice.avg > 0 ? String(c.buyPrice.avg) : '');
      setSellPrice(sellVal > 0 ? String(sellVal) : c.sellPrice.avg > 0 ? String(c.sellPrice.avg) : '');
    }
  };

  const handleSelectBestCommodity = (bestComm) => {
    setCommodity(bestComm.commodityId);
    setBuyPrice(String(bestComm.buy));
    setSellPrice(String(bestComm.sell));
  };

  const commodityMeta = commodity ? COMMODITY_META[commodity] : null;

  const filteredCommodities = useMemo(() => {
    if (!search.trim()) return COMMODITIES;
    const q = search.toLowerCase();
    return COMMODITIES.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q));
  }, [search]);

  const filteredStationOptions = useMemo(() => {
    if (!search.trim()) return STATION_OPTIONS;
    const q = search.toLowerCase();
    return STATION_OPTIONS.filter(s => s.name.toLowerCase().includes(q) || s.system.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Calculateur Commercial</h1>
        <p className="page-subtitle">Calculez précisément vos marges — sélectionnez des stations pour un auto-remplissage des prix</p>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commodité ou station…"
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* ---- Sélection des stations ---- */}
      <div className="card p-5">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-cyan-400" />
          Route
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Station Départ</label>
            <select
              value={fromStation}
              onChange={e => setFromStation(e.target.value)}
              className="select"
            >
              <option value="">— Choisir une station —</option>
              {filteredStationOptions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.system}){!s.legal ? ' ⚠️' : ''}
                </option>
              ))}
            </select>
            {fromStationInfo && (
              <p className="text-xs text-slate-500">{fromStationInfo.type} — {fromStationInfo.body}</p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 text-slate-600">
              <ArrowRight className="w-5 h-5 text-cyan-600" />
              <span className="text-xs">vers</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Station Arrivée</label>
            <select
              value={toStation}
              onChange={e => setToStation(e.target.value)}
              className="select"
            >
              <option value="">— Choisir une station —</option>
              {filteredStationOptions.filter(s => s.id !== fromStation).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.system}){!s.legal ? ' ⚠️' : ''}
                </option>
              ))}
            </select>
            {toStationInfo && (
              <p className="text-xs text-slate-500">{toStationInfo.type} — {toStationInfo.body}</p>
            )}
          </div>
        </div>

        {/* Meilleures commodités entre les deux stations */}
        {bestCommodities.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-gold-400" />
              Meilleures Commodités sur cette Route
            </h3>
            <div className="flex flex-wrap gap-2">
              {bestCommodities.map(bc => {
                const comm = COMMODITIES.find(c => c.id === bc.commodityId);
                if (!comm) return null;
                return (
                  <button
                    key={bc.commodityId}
                    onClick={() => handleSelectBestCommodity(bc)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      commodity === bc.commodityId
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-space-800 border-space-600/40 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200',
                      comm.illegal && 'border-danger-500/30 text-danger-400'
                    )}
                  >
                    <span className="font-semibold">{comm.name}</span>
                    <span className="ml-2 text-success-400">+{formatCredits(bc.profitPerSCU)}/SCU</span>
                    {comm.illegal && <span className="ml-1">⚠️</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {fromStation && toStation && bestCommodities.length === 0 && (
          <p className="mt-3 text-xs text-slate-500 italic">
            Aucune commodité commercialisable trouvée entre ces deux stations dans la base de données.
          </p>
        )}
      </div>

      {/* ---- Paramètres de calcul ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            Paramètres
          </h2>

          {/* Sélecteur commodité */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Commodité</label>
            <select value={commodity} onChange={e => handleCommoditySelect(e.target.value)} className="select">
              <option value="">— Choisir une commodité —</option>
              {filteredCommodities.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.illegal ? '⚠️ illégal' : ''}</option>
              ))}
            </select>
            {selectedCommodity && (
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {selectedCommodity.buyPrice.avg > 0 && (
                  <span>Achat moyen: <span className="text-slate-300">{formatCredits(selectedCommodity.buyPrice.avg)}/SCU</span></span>
                )}
                <span>Vente moyenne: <span className="text-slate-300">{formatCredits(selectedCommodity.sellPrice.avg)}/SCU</span></span>
                {commodityMeta && (
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    commodityMeta.legalStatus === 'illegal'
                      ? 'bg-danger-500/20 text-danger-400'
                      : 'bg-success-500/10 text-success-400'
                  )}>
                    {commodityMeta.legalStatus === 'illegal' ? '⚠️ Illégal' : '✓ Légal'}
                  </span>
                )}
              </div>
            )}
            {commodityMeta?.tip && (
              <p className="text-xs text-slate-600 italic">{commodityMeta.tip}</p>
            )}
          </div>

          {/* Prix achat/vente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Prix d'Achat (aUEC/SCU)
                {fromStation && commodity && getBuyPrice(fromStation, commodity) > 0 && (
                  <span className="ml-1 text-cyan-500">★ auto</span>
                )}
              </label>
              <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="0" className="input" min={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Prix de Vente (aUEC/SCU)
                {toStation && commodity && getSellPrice(toStation, commodity) > 0 && (
                  <span className="ml-1 text-cyan-500">★ auto</span>
                )}
              </label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="0" className="input" min={0} />
            </div>
          </div>

          {/* Quantité + frais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Quantité (SCU)</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" className="input" min={1} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Frais Divers (aUEC)</label>
              <input type="number" value={fees} onChange={e => setFees(e.target.value)} placeholder="0" className="input" min={0} />
            </div>
          </div>

          {/* Temps + investissement */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Temps de Trajet (min)</label>
              <input type="number" value={travelTime} onChange={e => setTravelTime(e.target.value)} placeholder="20" className="input" min={1} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 uppercase tracking-wide">Investissement Initial</label>
              <input type="number" value={investment} onChange={e => setInvestment(e.target.value)} placeholder="Pour calcul ROI" className="input" min={0} />
            </div>
          </div>

          {/* Avertissement marchandise illégale */}
          {selectedCommodity?.illegal && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger-300">
                Cette marchandise est <strong>illégale</strong> dans l'UEE. Transport possible uniquement dans des stations non-réglementées. Scan de douane = confiscation + prison.
              </p>
            </div>
          )}
        </div>

        {/* ---- Résultats ---- */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className={clsx(
                'card p-5',
                result.netProfit > 0 ? 'border-success-500/20 bg-success-500/5' : 'border-danger-500/20 bg-danger-500/5'
              )}>
                <div className="flex items-center gap-3 mb-4">
                  {result.netProfit > 0
                    ? <TrendingUp className="w-6 h-6 text-success-400" />
                    : <TrendingDown className="w-6 h-6 text-danger-400" />
                  }
                  <div>
                    <div className={clsx(
                      'text-3xl font-black font-display',
                      result.netProfit > 0 ? 'text-success-400' : 'text-danger-400'
                    )}>
                      {result.netProfit > 0 ? '+' : ''}{formatCredits(result.netProfit, true)}
                    </div>
                    <div className="text-xs text-slate-500">Profit Net</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Coût Total', value: formatCredits(result.totalCost, true), color: 'text-danger-400' },
                    { label: 'Revenus', value: formatCredits(result.totalRevenue, true), color: 'text-success-400' },
                    { label: 'Profit Brut', value: formatCredits(result.grossProfit, true), color: result.grossProfit > 0 ? 'text-success-400' : 'text-danger-400' },
                    { label: 'Marge', value: formatPercent(result.margin), color: result.margin > 10 ? 'text-success-400' : result.margin > 0 ? 'text-warning-400' : 'text-danger-400' },
                    { label: 'ROI', value: formatPercent(result.roi), color: result.roi > 0 ? 'text-success-400' : 'text-danger-400' },
                    { label: 'Par SCU', value: formatCredits(result.grossProfit / (Number(quantity) || 1), false), color: 'text-cyan-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-2.5 rounded-lg bg-space-900/60">
                      <div className={`text-sm font-semibold ${color}`}>{value}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {profitPerHour !== null && (
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Profit / Heure (trajet {travelTime} min)</span>
                    <span className="text-lg font-bold text-gold-400">{formatCredits(profitPerHour, true)}</span>
                  </div>
                  {fromStation && toStation && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span>{STATIONS_BY_ID[fromStation]?.name ?? fromStation}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{STATIONS_BY_ID[toStation]?.name ?? toStation}</span>
                    </div>
                  )}
                </div>
              )}

              {breakEven && (
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Retour sur Investissement</h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded bg-space-900/60">
                      <div className="text-xl font-bold text-cyan-400">{breakEven.runs}</div>
                      <div className="text-xs text-slate-500">Allers-retours</div>
                    </div>
                    <div className="p-2 rounded bg-space-900/60">
                      <div className="text-xl font-bold text-cyan-400">{breakEven.hours.toFixed(1)}h</div>
                      <div className="text-xs text-slate-500">Durée totale</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aperçu par volume */}
              {result.netProfit > 0 && Number(quantity) > 0 && (
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan-400" />
                    Profit par Volume
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: `${Number(quantity)} SCU`, mult: 1 },
                      { label: `${Number(quantity) * 2} SCU`, mult: 2 },
                      { label: `${Number(quantity) * 5} SCU`, mult: 5 },
                    ].map(({ label, mult }) => (
                      <div key={label} className="p-2 rounded bg-space-900/60">
                        <div className="text-sm font-bold text-success-400">
                          {formatCredits(result.netProfit * mult, true)}
                        </div>
                        <div className="text-xs text-slate-600">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-400 mb-2">En Attente de Données</h2>
              <p className="text-slate-500 text-sm">
                Sélectionnez des stations pour un auto-remplissage des prix, ou renseignez les prix manuellement.
              </p>
              {fromStation && toStation && bestCommodities.length > 0 && (
                <p className="text-slate-600 text-xs mt-2">
                  ↑ Cliquez sur une commodité recommandée pour démarrer
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
