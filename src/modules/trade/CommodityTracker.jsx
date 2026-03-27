import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Plus, X, Package, AlertTriangle,
  ShoppingCart, DollarSign, BarChart2, Filter, Search, ChevronDown,
  ChevronUp, Star, Calculator, ArrowRight,
} from 'lucide-react';
import { COMMODITIES } from '../../datasets/commodities.js';
import {
  STATION_PRICES, COMMODITY_META, getStationsSelling, getStationsBuying,
} from '../../datasets/tradeprices.js';

// ============================================================
// CONSTANTES
// ============================================================

const WATCHLIST_KEY = 'sc_commodity_watchlist';
const MAX_WATCHLIST = 20;

const CARGO_SIZES = [8, 32, 96, 576];

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
  'pyrochem': 'PyroChemi',
  'levski': 'Levski (Delamar)',
  'ruin-station': 'Ruin Station',
  'checkmate': 'Checkmate',
  'orbituary': 'Orbituary',
  'patch-city': 'Patch City',
  'rats-nest': 'Rat\'s Nest',
  'endgame': 'Endgame',
  'dudley-daughters': 'Dudley & Daughters',
  'windfall': 'Windfall',
  'rustville': 'Rustville',
};

const CATEGORY_LABELS = {
  all: 'Toutes catégories',
  'Minéral': 'Minéral',
  'Métal': 'Métal',
  'Carburant': 'Carburant',
  'Gaz': 'Gaz',
  'Industriel': 'Industriel',
  'Électronique': 'Électronique',
  'Agricole': 'Agricole',
  'Alimentaire': 'Alimentaire',
  'Médical': 'Médical',
  'Médicament': 'Médicament',
  'Vice': 'Vice (Drogues/Alcool)',
  'Commerce': 'Commerce',
  'Militaire': 'Militaire',
};

// ============================================================
// UTILITAIRES
// ============================================================

function getBestBuyPrice(commodityId) {
  let best = Infinity;
  for (const [, prices] of Object.entries(STATION_PRICES)) {
    const p = prices[commodityId]?.[0];
    if (p && p > 0 && p < best) best = p;
  }
  return best === Infinity ? 0 : best;
}

function getBestSellPrice(commodityId) {
  let best = 0;
  for (const [, prices] of Object.entries(STATION_PRICES)) {
    const p = prices[commodityId]?.[1];
    if (p && p > best) best = p;
  }
  return best;
}

function getBestBuyStation(commodityId) {
  let best = Infinity;
  let station = '';
  for (const [sid, prices] of Object.entries(STATION_PRICES)) {
    const p = prices[commodityId]?.[0];
    if (p && p > 0 && p < best) { best = p; station = sid; }
  }
  return { station, price: best === Infinity ? 0 : best };
}

function getBestSellStation(commodityId) {
  let best = 0;
  let station = '';
  for (const [sid, prices] of Object.entries(STATION_PRICES)) {
    const p = prices[commodityId]?.[1];
    if (p && p > best) { best = p; station = sid; }
  }
  return { station, price: best };
}

/**
 * Génère une courbe de prix simulée stable basée sur la seed du nom.
 * Utilise Math.sin avec offset dérivé du nom pour éviter les régénérations aléatoires.
 */
function generatePriceHistory(basePrice, commodityName) {
  if (!basePrice || basePrice <= 0) return [];
  const seed = commodityName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array.from({ length: 7 }, (_, i) => {
    const variation = Math.sin((seed + i * 1.5) * 0.8) * 0.04 + Math.sin((seed * 0.3 + i) * 1.2) * 0.02;
    const price = Math.round(basePrice * (1 + variation));
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      price,
    };
  });
}

function formatPrice(n) {
  if (!n || n === 0) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(n < 10 ? 2 : 0);
}

function formatPriceFull(n) {
  if (!n || n === 0) return '—';
  return n.toLocaleString('fr-FR') + ' aUEC';
}

// ============================================================
// CALCUL DES OPPORTUNITÉS
// ============================================================

function computeTopOpportunities(legalOnly) {
  const opportunities = [];

  for (const commodity of COMMODITIES) {
    if (legalOnly && commodity.illegal) continue;
    const { station: buyStation, price: buyPrice } = getBestBuyStation(commodity.id);
    const { station: sellStation, price: sellPrice } = getBestSellStation(commodity.id);
    if (!buyPrice || !sellPrice || buyStation === sellStation) continue;
    const profit = sellPrice - buyPrice;
    if (profit <= 0) continue;
    const margin = ((profit / buyPrice) * 100).toFixed(1);
    opportunities.push({
      id: commodity.id,
      name: commodity.name,
      illegal: commodity.illegal,
      buyStation,
      buyStationLabel: STATION_LABELS[buyStation] || buyStation,
      sellStation,
      sellStationLabel: STATION_LABELS[sellStation] || sellStation,
      buyPrice,
      sellPrice,
      profitPerSCU: profit,
      margin: parseFloat(margin),
    });
  }

  return opportunities
    .sort((a, b) => b.profitPerSCU - a.profitPerSCU)
    .slice(0, 10);
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================

function LegalBadge({ illegal }) {
  if (illegal) {
    return (
      <span className="badge badge-red text-xs flex items-center gap-1">
        <AlertTriangle size={10} /> Illégal
      </span>
    );
  }
  return (
    <span className="badge badge-green text-xs">Légal</span>
  );
}

function TrendArrow({ profit }) {
  if (!profit || profit === 0) return <Minus size={14} className="text-gray-400" />;
  if (profit > 0) return <TrendingUp size={14} className="text-green-400" />;
  return <TrendingDown size={14} className="text-red-400" />;
}

function WatchlistCard({ commodity, onRemove }) {
  const buyPrice = useMemo(() => getBestBuyPrice(commodity.id), [commodity.id]);
  const sellPrice = useMemo(() => getBestSellPrice(commodity.id), [commodity.id]);
  const spread = sellPrice - buyPrice;

  return (
    <div className="card p-4 flex flex-col gap-2 relative group">
      <button
        onClick={() => onRemove(commodity.id)}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Retirer de la watchlist"
      >
        <X size={14} />
      </button>

      <div className="flex items-start justify-between pr-4">
        <div>
          <p className="font-semibold text-white text-sm leading-tight">{commodity.name}</p>
          <p className="text-xs text-gray-400">{commodity.category}</p>
        </div>
        <LegalBadge illegal={commodity.illegal} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-space-800/50 rounded p-2">
          <p className="text-gray-400 mb-0.5">Achat min.</p>
          <p className="text-cyan-400 font-mono font-semibold">
            {buyPrice > 0 ? formatPriceFull(buyPrice) : '— (minable)'}
          </p>
        </div>
        <div className="bg-space-800/50 rounded p-2">
          <p className="text-gray-400 mb-0.5">Vente max.</p>
          <p className="text-green-400 font-mono font-semibold">
            {formatPriceFull(sellPrice)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Spread</span>
        <span className={`font-mono font-semibold flex items-center gap-1 ${spread > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
          <TrendArrow profit={spread} />
          {spread > 0 ? formatPriceFull(spread) : '—'}
        </span>
      </div>
    </div>
  );
}

function CatalogCard({ commodity, onAdd, isWatched, watchlistFull }) {
  const buyPrice = useMemo(() => getBestBuyPrice(commodity.id), [commodity.id]);
  const sellPrice = useMemo(() => getBestSellPrice(commodity.id), [commodity.id]);
  const spread = sellPrice - buyPrice;

  return (
    <div className={`card p-3 flex flex-col gap-2 border transition-colors ${isWatched ? 'border-cyan-500/40' : 'border-transparent'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{commodity.name}</p>
          <p className="text-xs text-gray-500">{commodity.category} · {commodity.subcategory}</p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <LegalBadge illegal={commodity.illegal} />
          <button
            onClick={() => onAdd(commodity.id)}
            disabled={isWatched || watchlistFull}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors text-sm font-bold
              ${isWatched
                ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
                : watchlistFull
                  ? 'bg-space-700 text-gray-600 cursor-not-allowed'
                  : 'bg-space-700 hover:bg-cyan-500/30 text-gray-400 hover:text-cyan-400'
              }`}
            title={isWatched ? 'Déjà dans la watchlist' : watchlistFull ? 'Watchlist pleine (20 max)' : 'Ajouter à la watchlist'}
          >
            {isWatched ? <Star size={12} fill="currentColor" /> : <Plus size={12} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs">
        <div>
          <span className="text-gray-500">Achat</span>
          <p className="text-cyan-400 font-mono">
            {buyPrice > 0 ? formatPrice(buyPrice) : '—'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Vente</span>
          <p className="text-green-400 font-mono">{formatPrice(sellPrice)}</p>
        </div>
        <div>
          <span className="text-gray-500">Spread</span>
          <p className={`font-mono font-semibold ${spread > 100 ? 'text-yellow-400' : spread > 0 ? 'text-gray-300' : 'text-gray-600'}`}>
            {spread > 0 ? `+${formatPrice(spread)}` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function CommodityTracker() {
  // ---- State ----
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogLegal, setCatalogLegal] = useState('all'); // 'all' | 'legal' | 'illegal'
  const [catalogPage, setCatalogPage] = useState(1);
  const CATALOG_PAGE_SIZE = 24;

  const [legalOnly, setLegalOnly] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const [selectedCommodityChart, setSelectedCommodityChart] = useState('');

  // Calculateur
  const [calcCommodity, setCalcCommodity] = useState('');
  const [calcQty, setCalcQty] = useState(32);
  const [calcBuyStation, setCalcBuyStation] = useState('');
  const [calcSellStation, setCalcSellStation] = useState('');

  // ---- Persistence watchlist ----
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  // ---- Watchlist actions ----
  const addToWatchlist = useCallback((commodityId) => {
    setWatchlist(prev => {
      if (prev.includes(commodityId) || prev.length >= MAX_WATCHLIST) return prev;
      return [...prev, commodityId];
    });
  }, []);

  const removeFromWatchlist = useCallback((commodityId) => {
    setWatchlist(prev => prev.filter(id => id !== commodityId));
  }, []);

  // ---- Données watchlist ----
  const watchedCommodities = useMemo(
    () => COMMODITIES.filter(c => watchlist.includes(c.id)),
    [watchlist],
  );

  // ---- Catalogue filtré ----
  const filteredCatalog = useMemo(() => {
    let list = COMMODITIES;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q));
    }
    if (catalogCategory !== 'all') {
      list = list.filter(c => c.category === catalogCategory);
    }
    if (catalogLegal === 'legal') list = list.filter(c => !c.illegal);
    if (catalogLegal === 'illegal') list = list.filter(c => c.illegal);
    return list;
  }, [catalogSearch, catalogCategory, catalogLegal]);

  const totalPages = Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE);
  const catalogPage_ = Math.min(catalogPage, Math.max(1, totalPages));
  const paginatedCatalog = filteredCatalog.slice(
    (catalogPage_ - 1) * CATALOG_PAGE_SIZE,
    catalogPage_ * CATALOG_PAGE_SIZE,
  );

  // Reset page quand les filtres changent
  useEffect(() => { setCatalogPage(1); }, [catalogSearch, catalogCategory, catalogLegal]);

  // ---- Top opportunités ----
  const topOpportunities = useMemo(() => computeTopOpportunities(legalOnly), [legalOnly]);

  // ---- Filtre global (watchlist + opportunités) ----
  const searchLower = search.toLowerCase();
  const filteredWatchedCommodities = search
    ? watchedCommodities.filter(c => c.name.toLowerCase().includes(searchLower) || c.category?.toLowerCase().includes(searchLower))
    : watchedCommodities;
  const filteredTopOpportunities = search
    ? topOpportunities.filter(o => o.name.toLowerCase().includes(searchLower) || o.buyStationLabel.toLowerCase().includes(searchLower) || o.sellStationLabel.toLowerCase().includes(searchLower))
    : topOpportunities;

  // ---- Graphique prix ----
  const chartCommodity = useMemo(() => {
    const id = selectedCommodityChart || watchlist[0] || COMMODITIES[0]?.id;
    return COMMODITIES.find(c => c.id === id) || COMMODITIES[0];
  }, [selectedCommodityChart, watchlist]);

  const chartData = useMemo(() => {
    if (!chartCommodity) return [];
    const basePrice = getBestSellPrice(chartCommodity.id) || chartCommodity.sellPrice?.avg || 0;
    return generatePriceHistory(basePrice, chartCommodity.name);
  }, [chartCommodity]);

  // ---- Calculateur ----
  const calcResult = useMemo(() => {
    if (!calcCommodity || !calcBuyStation || !calcSellStation || calcQty <= 0) return null;
    const buy = STATION_PRICES[calcBuyStation]?.[calcCommodity]?.[0];
    const sell = STATION_PRICES[calcSellStation]?.[calcCommodity]?.[1];
    if (!buy || !sell) return null;
    const profitPerSCU = sell - buy;
    const totalProfit = profitPerSCU * calcQty;
    const investment = buy * calcQty;
    const roi = investment > 0 ? ((totalProfit / investment) * 100).toFixed(1) : 0;
    return { buy, sell, profitPerSCU, totalProfit, investment, roi };
  }, [calcCommodity, calcBuyStation, calcSellStation, calcQty]);

  // Stations disponibles pour le calculateur
  const calcAvailableStations = useMemo(() => {
    if (!calcCommodity) return Object.keys(STATION_PRICES);
    return Object.keys(STATION_PRICES).filter(
      sid => STATION_PRICES[sid][calcCommodity],
    );
  }, [calcCommodity]);

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* En-tête */}
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Package className="text-cyan-400" size={28} />
          Suivi des Commodités
        </h1>
        <p className="text-gray-400 mt-1">Surveillez les prix et optimisez vos trades</p>
      </div>

      {/* Barre de recherche globale */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commodité, station ou opportunité…"
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* ============ SECTION 1 — WATCHLIST ============ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="section-title flex items-center gap-2">
              <Star size={18} className="text-yellow-400" />
              Ma Watchlist
            </h2>
            <span className={`badge text-xs ${watchlist.length >= MAX_WATCHLIST ? 'badge-red' : 'badge-blue'}`}>
              {watchlist.length}/{MAX_WATCHLIST}
            </span>
          </div>
          <button
            onClick={() => setShowCatalog(v => !v)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={14} />
            Ajouter une commodité
          </button>
        </div>

        {filteredWatchedCommodities.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-lg mb-1">Aucune commodité suivie</p>
            <p className="text-sm mb-4">Ajoutez des commodités depuis le catalogue ci-dessous pour les surveiller.</p>
            <button
              onClick={() => setShowCatalog(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Search size={14} />
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredWatchedCommodities.map(c => (
              <WatchlistCard
                key={c.id}
                commodity={c}
                onRemove={removeFromWatchlist}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ SECTION 2 — CATALOGUE ============ */}
      <section>
        <button
          onClick={() => setShowCatalog(v => !v)}
          className="flex items-center gap-2 section-title hover:text-cyan-300 transition-colors w-full text-left mb-4"
        >
          <ShoppingCart size={18} />
          Catalogue de Commodités
          <span className="badge badge-blue text-xs ml-2">{COMMODITIES.length}</span>
          <span className="ml-auto text-gray-400">
            {showCatalog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {showCatalog && (
          <>
            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  placeholder="Rechercher une commodité..."
                  className="input pl-9 w-full text-sm"
                />
              </div>
              <select
                value={catalogCategory}
                onChange={e => setCatalogCategory(e.target.value)}
                className="select text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <select
                value={catalogLegal}
                onChange={e => setCatalogLegal(e.target.value)}
                className="select text-sm"
              >
                <option value="all">Toutes légalités</option>
                <option value="legal">Légal uniquement</option>
                <option value="illegal">Illégal uniquement</option>
              </select>
            </div>

            {/* Résultats */}
            <p className="text-xs text-gray-500 mb-3">
              {filteredCatalog.length} commodité{filteredCatalog.length !== 1 ? 's' : ''} • page {catalogPage_}/{Math.max(1, totalPages)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {paginatedCatalog.map(c => (
                <CatalogCard
                  key={c.id}
                  commodity={c}
                  onAdd={addToWatchlist}
                  isWatched={watchlist.includes(c.id)}
                  watchlistFull={watchlist.length >= MAX_WATCHLIST}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                  disabled={catalogPage_ === 1}
                  className="btn-secondary text-sm px-3 py-1 disabled:opacity-40"
                >
                  ← Préc.
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCatalogPage(page)}
                      className={`w-8 h-8 rounded text-sm font-mono transition-colors
                        ${catalogPage_ === page ? 'bg-cyan-500 text-black' : 'bg-space-700 text-gray-300 hover:bg-space-600'}`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCatalogPage(p => Math.min(totalPages, p + 1))}
                  disabled={catalogPage_ === totalPages}
                  className="btn-secondary text-sm px-3 py-1 disabled:opacity-40"
                >
                  Suiv. →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ============ SECTION 3 — TOP OPPORTUNITÉS ============ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp size={18} className="text-green-400" />
            Top 10 Opportunités
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={legalOnly}
              onChange={e => setLegalOnly(e.target.checked)}
              className="w-4 h-4 accent-cyan-500"
            />
            Légal seulement
          </label>
        </div>

        <div className="space-y-2">
          {filteredTopOpportunities.map((opp, idx) => (
            <div
              key={opp.id}
              className="card p-4 flex flex-wrap gap-3 items-center"
            >
              {/* Rang */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-yellow-700 text-black' : 'bg-space-700 text-gray-400'}`}>
                {idx + 1}
              </div>

              {/* Infos commodité */}
              <div className="flex-1 min-w-[140px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{opp.name}</span>
                  <LegalBadge illegal={opp.illegal} />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <span className="text-cyan-400">{opp.buyStationLabel}</span>
                  <ArrowRight size={10} />
                  <span className="text-green-400">{opp.sellStationLabel}</span>
                </div>
              </div>

              {/* Prix */}
              <div className="text-xs text-center min-w-[60px]">
                <p className="text-gray-400">Achat</p>
                <p className="text-cyan-400 font-mono">{formatPrice(opp.buyPrice)}</p>
              </div>
              <div className="text-xs text-center min-w-[60px]">
                <p className="text-gray-400">Vente</p>
                <p className="text-green-400 font-mono">{formatPrice(opp.sellPrice)}</p>
              </div>
              <div className="text-xs text-center min-w-[70px]">
                <p className="text-gray-400">Profit/SCU</p>
                <p className="text-yellow-400 font-mono font-bold">+{formatPrice(opp.profitPerSCU)}</p>
              </div>
              <div className="text-xs text-center min-w-[50px]">
                <p className="text-gray-400">Marge</p>
                <p className={`font-mono font-bold ${opp.margin > 50 ? 'text-green-400' : opp.margin > 15 ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {opp.margin}%
                </p>
              </div>

              {/* Profits par taille cargo */}
              <div className="flex gap-2 flex-wrap">
                {CARGO_SIZES.map(size => (
                  <div key={size} className="bg-space-800/60 rounded px-2 py-1 text-center min-w-[52px]">
                    <p className="text-[10px] text-gray-500">{size} SCU</p>
                    <p className="text-xs text-green-400 font-mono">
                      {formatPrice(opp.profitPerSCU * size)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bouton ajouter */}
              {!watchlist.includes(opp.id) && watchlist.length < MAX_WATCHLIST && (
                <button
                  onClick={() => addToWatchlist(opp.id)}
                  className="text-xs text-gray-500 hover:text-cyan-400 transition-colors shrink-0"
                  title="Ajouter à la watchlist"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          ))}

          {filteredTopOpportunities.length === 0 && (
            <div className="card p-6 text-center text-gray-400">
              Aucune opportunité trouvée avec les filtres actuels.
            </div>
          )}
        </div>
      </section>

      {/* ============ SECTION 4 — GRAPHIQUE PRIX SIMULÉ ============ */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="section-title flex items-center gap-2">
            <BarChart2 size={18} className="text-cyan-400" />
            Historique de Prix (7 jours simulés)
          </h2>
          <select
            value={selectedCommodityChart || chartCommodity?.id || ''}
            onChange={e => setSelectedCommodityChart(e.target.value)}
            className="select text-sm"
          >
            {COMMODITIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-semibold text-white">{chartCommodity?.name}</span>
            <LegalBadge illegal={chartCommodity?.illegal} />
            <span className="text-xs text-gray-500 ml-auto italic">
              * Données simulées — variation ±5% autour du prix de référence
            </span>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={v => formatPrice(v)}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: '#0d1526', border: '1px solid #1e3a5f', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  formatter={(v) => [`${v.toLocaleString('fr-FR')} aUEC`, 'Prix de vente']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
              Pas de données de prix disponibles pour cette commodité.
            </div>
          )}
        </div>
      </section>

      {/* ============ SECTION 5 — CALCULATEUR CARGO ============ */}
      <section>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Calculator size={18} className="text-yellow-400" />
          Calculateur de Cargo
        </h2>

        <div className="card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Commodité */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Commodité</label>
              <select
                value={calcCommodity}
                onChange={e => {
                  setCalcCommodity(e.target.value);
                  setCalcBuyStation('');
                  setCalcSellStation('');
                }}
                className="select w-full text-sm"
              >
                <option value="">— Sélectionner —</option>
                {COMMODITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Quantité */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Quantité (SCU)</label>
              <input
                type="number"
                value={calcQty}
                onChange={e => setCalcQty(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="input w-full text-sm"
                placeholder="ex: 32"
              />
            </div>

            {/* Station achat */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Acheter à</label>
              <select
                value={calcBuyStation}
                onChange={e => setCalcBuyStation(e.target.value)}
                className="select w-full text-sm"
                disabled={!calcCommodity}
              >
                <option value="">— Station d'achat —</option>
                {calcAvailableStations
                  .filter(sid => STATION_PRICES[sid][calcCommodity]?.[0] > 0)
                  .map(sid => (
                    <option key={sid} value={sid}>
                      {STATION_LABELS[sid] || sid} ({STATION_PRICES[sid][calcCommodity][0]} aUEC)
                    </option>
                  ))}
              </select>
            </div>

            {/* Station vente */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Vendre à</label>
              <select
                value={calcSellStation}
                onChange={e => setCalcSellStation(e.target.value)}
                className="select w-full text-sm"
                disabled={!calcCommodity}
              >
                <option value="">— Station de vente —</option>
                {calcAvailableStations
                  .filter(sid => STATION_PRICES[sid][calcCommodity]?.[1] > 0)
                  .map(sid => (
                    <option key={sid} value={sid}>
                      {STATION_LABELS[sid] || sid} ({STATION_PRICES[sid][calcCommodity][1]} aUEC)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Résultat */}
          {calcResult ? (
            <div className={`rounded-xl p-4 border ${calcResult.profitPerSCU > 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Investissement</p>
                  <p className="text-white font-mono font-bold">
                    {calcResult.investment.toLocaleString('fr-FR')} aUEC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Profit/SCU</p>
                  <p className={`font-mono font-bold ${calcResult.profitPerSCU > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {calcResult.profitPerSCU > 0 ? '+' : ''}{calcResult.profitPerSCU.toLocaleString('fr-FR')} aUEC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Profit Total</p>
                  <p className={`font-mono font-bold text-lg ${calcResult.totalProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {calcResult.totalProfit > 0 ? '+' : ''}{calcResult.totalProfit.toLocaleString('fr-FR')} aUEC
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">ROI</p>
                  <p className={`font-mono font-bold ${calcResult.roi > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {calcResult.roi}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 border border-space-600 bg-space-800/30 text-center text-gray-500 text-sm">
              Sélectionnez une commodité, une quantité et deux stations pour voir le résultat.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
