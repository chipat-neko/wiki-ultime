import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppActions, useFavorites } from '../../core/StateManager.jsx';
import { useShipImages } from '../../core/ShipImagesContext.jsx';
import { resolveShipImage } from '../../services/ShipImageService.js';
import { SHIPS, SHIP_MANUFACTURERS, SIZES } from '../../datasets/ships.js';
import { formatCredits } from '../../utils/formatters.js';
import { useLiveVehicles, useLivePurchases, useLiveRentals } from '../../hooks/useLiveData.js';
import clsx from 'clsx';
import {
  Rocket, Star, Plus, Eye, Search, Grid3X3, List,
  Users, Package, Shield, Zap, ArrowLeftRight,
  ChevronDown, ChevronUp, X, RotateCcw, ArrowUpDown,
  Wifi, WifiOff, RefreshCw,
} from 'lucide-react';
import PatchBadge from '../../ui/components/PatchBadge.jsx';
import { usePatchCategory } from '../../hooks/usePatchInfo.js';

// ─── Pagination ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 24;

// ─── Persistance filtres (sessionStorage) ─────────────────────────────────────
const FILTER_KEY = 'ships_filters_v1';
function loadSavedFilters() {
  try {
    const raw = sessionStorage.getItem(FILTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Catégories de rôles ─────────────────────────────────────────────────────
const ROLE_CATEGORIES = [
  { key: 'Combat',      label: 'Combat',      activeCls: 'bg-red-500/20 border-red-500/40 text-red-400'    },
  { key: 'Cargo',       label: 'Cargo',       activeCls: 'bg-green-500/20 border-green-500/40 text-green-400' },
  { key: 'Mining',      label: 'Mining',      activeCls: 'bg-amber-500/20 border-amber-500/40 text-amber-400' },
  { key: 'Exploration', label: 'Exploration', activeCls: 'bg-blue-500/20 border-blue-500/40 text-blue-400'  },
  { key: 'Support',     label: 'Support',     activeCls: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'  },
  { key: 'Luxe',        label: 'Luxe',        activeCls: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' },
  { key: 'Racing',      label: 'Racing',      activeCls: 'bg-purple-500/20 border-purple-500/40 text-purple-400' },
  { key: 'Terrestre',   label: 'Terrestre',   activeCls: 'bg-orange-500/20 border-orange-500/40 text-orange-400' },
];

function getRoleCategory(role) {
  const r = (role || '').toLowerCase();
  if (r.includes('chasseur') || r.includes('bombardier') || r.includes('corvette') ||
      r.includes('frégate') || r.includes('destroyer') || r.includes('canonnière') ||
      r.includes('combat') || r.includes('intercepteur') || r.includes('primes') ||
      r.includes('militaire') || r.includes('interdiction') || r.includes('anti-') ||
      r.includes('vanduul') || r.includes('mouilleur') || r.includes('défense anti'))
    return 'Combat';
  if (r.includes('cargo') || r.includes('transport') || r.includes('commerce') ||
      r.includes('super-cargo') || r.includes('liner') || r.includes('passagers') ||
      r.includes('données') || r.includes('contrebande') || r.includes('troupes') ||
      r.includes('messagerie'))
    return 'Cargo';
  if (r.includes('mineur') || r.includes('minage') || r.includes('récupération') ||
      r.includes('mining') || r.includes('salvage') || r.includes('véhicule minier') ||
      r.includes('remorqueur'))
    return 'Mining';
  if (r.includes('explor') || r.includes('éclaireur') || r.includes('scout') ||
      r.includes('recherche') || r.includes('scientifique') || r.includes('journalisme') ||
      r.includes('inspection') || r.includes('émissions'))
    return 'Exploration';
  if (r.includes('médical') || r.includes('ravitailleur') || r.includes('guerre électronique') ||
      r.includes('navette') || r.includes('ambulance') || r.includes('support') ||
      r.includes('sauvetage') || r.includes('porte-vaisseaux') || r.includes('construction'))
    return 'Support';
  if (r.includes('yacht') || r.includes('luxe') || r.includes('starter de luxe') ||
      r.includes('super yacht') || r.includes('exécutif'))
    return 'Luxe';
  if (r.includes('racer') || r.includes('course') || r.includes('hoverbike') ||
      r.includes('moto') || r.includes('racing'))
    return 'Racing';
  if (r.includes('buggy') || r.includes('rover') || r.includes('tank') ||
      r.includes('terrestre') || r.includes('véhicule') || r.includes('défense') ||
      r.includes('starter'))
    return 'Terrestre';
  return 'Combat';
}

// ─── Badge de taille ──────────────────────────────────────────────────────────
const SIZE_BADGE = {
  Nain:    'badge-slate',
  Petit:   'badge-cyan',
  Moyen:   'badge-green',
  Grand:   'badge-purple',
  Capital: 'badge-red',
};

// ─── ShipAvatar ───────────────────────────────────────────────────────────────
function ShipAvatar({ imageUrl, name, className = 'w-8 h-8', iconClass = 'w-4 h-4' }) {
  const apiImages = useShipImages();
  const [error, setError] = useState(false);
  const src = resolveShipImage(name, imageUrl, apiImages);
  return (
    <div className={`${className} rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
      {src && !error ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        <Rocket className={`${iconClass} text-slate-500`} />
      )}
    </div>
  );
}

// ─── ShipImageBanner ──────────────────────────────────────────────────────────
function ShipImageBanner({ imageUrl, name, inGame }) {
  const apiImages = useShipImages();
  const [error, setError] = useState(false);
  const src = resolveShipImage(name, imageUrl, apiImages);
  return (
    <div className="relative h-36 bg-gradient-to-br from-space-800 via-space-700 to-space-900 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-hero-pattern opacity-20" />
      {src && !error ? (
        <img
          src={src} alt={name}
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          onError={() => setError(true)}
        />
      ) : (
        <Rocket className="w-12 h-12 text-space-600 relative z-10" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-space-900/90 via-transparent to-transparent z-10" />
      {/* Badge Made by the Community */}
      {src && !error && (
        <img
          src="/images/fankit/made-by-community-white.png"
          alt="Made by the Community"
          className="absolute bottom-1.5 left-2 h-4 w-auto z-20 pointer-events-none"
          style={{ opacity: 0.5 }}
        />
      )}
      <div className="absolute top-2 right-2 z-20">
        <span className={`badge text-xs ${inGame ? 'badge-green' : 'badge-yellow'}`}>
          {inGame ? 'En Jeu' : 'Pledge'}
        </span>
      </div>
    </div>
  );
}

// ─── ShipCard (vue grille) ────────────────────────────────────────────────────
function ShipCard({ ship, onView, onAddToFleet, isFav, onToggleFav, patchInfo, liveData }) {
  const cat = ROLE_CATEGORIES.find(c => c.key === ship.roleCategory);
  return (
    <div
      className="card-glow flex flex-col hover:border-cyan-500/40 transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={() => onView(ship)}
    >
      <ShipImageBanner imageUrl={ship.imageUrl} name={ship.name} inGame={ship.inGame} />
      <div className="p-3 flex flex-col gap-2.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm leading-tight flex items-center gap-1.5">
              <span className="truncate">{ship.name}</span>
              {patchInfo && <PatchBadge type={patchInfo.type} version={patchInfo.version} />}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{ship.manufacturer}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onToggleFav(ship); }}
            className={clsx('p-1 rounded-lg transition-colors flex-shrink-0',
              isFav ? 'text-gold-400' : 'text-slate-600 hover:text-gold-400')}
          >
            <Star className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className={clsx('badge text-xs border', cat?.activeCls || 'badge-slate')}>
            {ship.role.length > 22 ? ship.role.slice(0, 20) + '…' : ship.role}
          </span>
          <span className={clsx('badge text-xs', SIZE_BADGE[ship.size])}>{ship.size}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span>
              {ship.crew?.min === ship.crew?.max
                ? `${ship.crew?.min ?? 1}`
                : `${ship.crew?.min ?? 1}–${ship.crew?.max ?? 1}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className={ship.specs?.cargo > 0 ? 'text-green-400' : 'text-slate-600'}>
              {ship.specs?.cargo > 0 ? `${ship.specs.cargo} SCU` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span>{ship.specs?.scmSpeed ? `${ship.specs.scmSpeed} m/s` : '—'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span>{ship.specs?.shieldHp ? `${(ship.specs.shieldHp / 1000).toFixed(0)}K` : '—'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-2 mt-auto border-t border-space-400/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-400">{formatCredits(ship.price, true)}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); onAddToFleet(ship); }}
                title="Ajouter à la flotte"
                className="btn-secondary btn-sm py-0.5 px-1.5 text-xs"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onView(ship); }}
                title="Voir les détails"
                className="btn-primary btn-sm py-0.5 px-1.5 text-xs"
              >
                <Eye className="w-3 h-3" />
              </button>
            </div>
          </div>
          {liveData && (liveData.purchases.length > 0 || liveData.rentals.length > 0) && (
            <div className="space-y-0.5 text-[10px] leading-tight">
              {liveData.purchases.length > 0 && (() => {
                const best = liveData.purchases.reduce((a, b) => a.price < b.price ? a : b);
                return (
                  <div className="flex items-center gap-1 text-green-400">
                    <Wifi className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">Achat in-game : {formatCredits(best.price, true)} @ {best.location}</span>
                  </div>
                );
              })()}
              {liveData.rentals.length > 0 && (() => {
                const best = liveData.rentals.reduce((a, b) => a.price < b.price ? a : b);
                return (
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Wifi className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">Location : {formatCredits(best.price, true)}/jour @ {best.location}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TableRow (vue tableau) ───────────────────────────────────────────────────
function TableRow({ ship, onView, onAddToFleet, isFav, onToggleFav, liveData }) {
  const cat = ROLE_CATEGORIES.find(c => c.key === ship.roleCategory);
  return (
    <tr
      className="border-b border-space-400/10 hover:bg-space-700/30 cursor-pointer transition-colors"
      onClick={() => onView(ship)}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <ShipAvatar imageUrl={ship.imageUrl} name={ship.name} className="w-8 h-8" />
          <div className="min-w-0">
            <div className="font-medium text-slate-200 text-sm truncate">{ship.name}</div>
            <div className="text-xs text-slate-500 truncate">{ship.manufacturer}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 hidden md:table-cell max-w-[180px]">
        <span className={clsx('badge text-xs border whitespace-nowrap', cat?.activeCls || 'badge-slate')}>
          {ship.role.length > 24 ? ship.role.slice(0, 22) + '…' : ship.role}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className={clsx('badge text-xs', SIZE_BADGE[ship.size])}>{ship.size}</span>
      </td>
      <td className="px-3 py-2.5 text-sm text-slate-400 hidden sm:table-cell">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {ship.crew?.min === ship.crew?.max ? ship.crew?.min : `${ship.crew?.min}–${ship.crew?.max}`}
        </div>
      </td>
      <td className="px-3 py-2.5 hidden lg:table-cell">
        {ship.specs?.cargo > 0
          ? <span className="text-sm text-green-400">{ship.specs.cargo} SCU</span>
          : <span className="text-sm text-slate-600">—</span>}
      </td>
      <td className="px-3 py-2.5 text-sm text-slate-400 hidden lg:table-cell">
        {ship.specs?.scmSpeed ? `${ship.specs.scmSpeed} m/s` : '—'}
      </td>
      <td className="px-3 py-2.5 hidden xl:table-cell">
        {ship.specs?.shieldHp
          ? <span className="text-sm text-cyan-400">{(ship.specs.shieldHp / 1000).toFixed(0)}K HP</span>
          : <span className="text-sm text-slate-600">—</span>}
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-sm font-medium text-gold-400">{formatCredits(ship.price, true)}</span>
        {liveData && (liveData.purchases.length > 0 || liveData.rentals.length > 0) && (
          <div className="space-y-0.5 mt-0.5">
            {liveData.purchases.length > 0 && (() => {
              const best = liveData.purchases.reduce((a, b) => a.price < b.price ? a : b);
              return (
                <div className="text-[10px] text-green-400 whitespace-nowrap">
                  {formatCredits(best.price, true)} @ {best.location}
                </div>
              );
            })()}
            {liveData.rentals.length > 0 && (() => {
              const best = liveData.rentals.reduce((a, b) => a.price < b.price ? a : b);
              return (
                <div className="text-[10px] text-cyan-400 whitespace-nowrap">
                  Loc. {formatCredits(best.price, true)}/j @ {best.location}
                </div>
              );
            })()}
          </div>
        )}
      </td>
      <td className="px-3 py-2.5">
        <span className={`badge text-xs ${ship.inGame ? 'badge-green' : 'badge-yellow'}`}>
          {ship.inGame ? 'En Jeu' : 'Pledge'}
        </span>
      </td>
      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onToggleFav(ship)}
            className={clsx('p-1 rounded transition-colors', isFav ? 'text-gold-400' : 'text-slate-600 hover:text-gold-400')}
          >
            <Star className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onAddToFleet(ship)}
            className="p-1 rounded text-slate-600 hover:text-cyan-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── En-tête de colonne triable ───────────────────────────────────────────────
function SortHeader({ label, field, sortBy, sortDir, onSort, className = '' }) {
  const active = sortBy === field;
  return (
    <th
      className={`px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-200 select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active
          ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
          : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </div>
    </th>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ShipsDatabase() {
  const navigate      = useNavigate();
  const { addShipToFleet, notify } = useAppActions();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const shipPatches = usePatchCategory('ships');

  // ── Données live UEX ──────────────────────────────────────────────────────
  const [useLive, setUseLive] = useState(false);
  const { vehicles: liveVehicles, loading: loadingVehicles } = useLiveVehicles();
  const { purchases: livePurchases, loading: loadingPurchases } = useLivePurchases();
  const { rentals: liveRentals, loading: loadingRentals, refresh: refreshRentals, lastUpdated: liveLastUpdated } = useLiveRentals();

  const liveLoading = loadingVehicles || loadingPurchases || loadingRentals;

  const refreshAllLive = useCallback(() => {
    // refreshRentals clears cache & refetches; we only expose one refresh button
    refreshRentals();
  }, [refreshRentals]);

  // Map: ship name (lowercase) → { purchases: [...], rentals: [...] }
  const liveDataMap = useMemo(() => {
    if (!useLive) return {};
    const map = {};

    // Purchases: array of { vehicle_name, price_calculated, location_name, ... }
    if (Array.isArray(livePurchases)) {
      for (const p of livePurchases) {
        const key = (p.vehicle_name || p.name || '').toLowerCase();
        if (!key) continue;
        if (!map[key]) map[key] = { purchases: [], rentals: [] };
        map[key].purchases.push({
          price: p.price_calculated ?? p.price ?? 0,
          location: p.location_name ?? p.terminal_name ?? '?',
        });
      }
    }

    // Rentals: array of { vehicle_name, price_calculated, location_name, ... }
    if (Array.isArray(liveRentals)) {
      for (const r of liveRentals) {
        const key = (r.vehicle_name || r.name || '').toLowerCase();
        if (!key) continue;
        if (!map[key]) map[key] = { purchases: [], rentals: [] };
        map[key].rentals.push({
          price: r.price_calculated ?? r.price ?? 0,
          location: r.location_name ?? r.terminal_name ?? '?',
        });
      }
    }

    return map;
  }, [useLive, livePurchases, liveRentals]);

  // Vue
  const [viewMode, setViewMode]       = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Filtres (chargés depuis sessionStorage si disponible) — appelé une seule fois grâce aux lazy useState inits
  const _saved = loadSavedFilters();
  const [search, setSearch]                     = useState(() => _saved?.search || '');
  const [selCategories, setSelCategories]       = useState(() => _saved?.selCategories || []);
  const [selManufacturers, setSelManufacturers] = useState(() => _saved?.selManufacturers || []);
  const [selSizes, setSelSizes]                 = useState(() => _saved?.selSizes || []);
  const [statusFilter, setStatusFilter]         = useState(() => _saved?.statusFilter || 'all');
  const [cargoMin, setCargoMin]                 = useState(() => _saved?.cargoMin || '');
  const [cargoMax, setCargoMax]                 = useState(() => _saved?.cargoMax || '');
  const [priceMax, setPriceMax]                 = useState(() => _saved?.priceMax || '');
  const [crewMin, setCrewMin]                   = useState(() => _saved?.crewMin || '');
  const [speedMin, setSpeedMin]                 = useState(() => _saved?.speedMin || '');

  // Tri
  const [sortField, setSortField] = useState(() => _saved?.sortField || 'name');
  const [sortDir,   setSortDir]   = useState(() => _saved?.sortDir || 'asc');

  // Pagination
  const [page, setPage] = useState(1);

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field; }
      setSortDir('asc');
      return field;
    });
  }, []);

  // Vaisseaux normalisés (ajout champs calculés)
  const normalizedShips = useMemo(() =>
    SHIPS.map(ship => ({
      ...ship,
      cargoSCU:     ship.specs?.cargo    ?? 0,
      speedSCM:     ship.specs?.scmSpeed ?? 0,
      shieldsHP:    ship.specs?.shieldHp ?? 0,
      crewMinN:     ship.crew?.min       ?? 1,
      roleCategory: getRoleCategory(ship.role),
    }))
  , []);

  // Filtrage + tri
  const filtered = useMemo(() => {
    let list = normalizedShips;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.manufacturer.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selCategories.length > 0)    list = list.filter(s => selCategories.includes(s.roleCategory));
    if (selManufacturers.length > 0) list = list.filter(s => selManufacturers.includes(s.manufacturer));
    if (selSizes.length > 0)         list = list.filter(s => selSizes.includes(s.size));
    if (statusFilter === 'ingame')   list = list.filter(s => s.inGame);
    if (statusFilter === 'pledge')   list = list.filter(s => !s.inGame);
    if (cargoMin !== '')  list = list.filter(s => s.cargoSCU >= Number(cargoMin));
    if (cargoMax !== '')  list = list.filter(s => s.cargoSCU <= Number(cargoMax));
    if (priceMax !== '')  list = list.filter(s => s.price > 0 && s.price <= Number(priceMax));
    if (crewMin  !== '')  list = list.filter(s => s.crewMinN >= Number(crewMin));
    if (speedMin !== '')  list = list.filter(s => s.speedSCM >= Number(speedMin));

    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':    cmp = a.name.localeCompare(b.name, 'fr'); break;
        case 'price':   cmp = a.price - b.price; break;
        case 'speed':   cmp = a.speedSCM - b.speedSCM; break;
        case 'cargo':   cmp = a.cargoSCU - b.cargoSCU; break;
        case 'shields': cmp = a.shieldsHP - b.shieldsHP; break;
        case 'crew':    cmp = a.crewMinN - b.crewMinN; break;
        case 'size':    cmp = SIZES.indexOf(a.size) - SIZES.indexOf(b.size); break;
        default: break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [normalizedShips, search, selCategories, selManufacturers, selSizes,
      statusFilter, cargoMin, cargoMax, priceMax, crewMin, speedMin, sortField, sortDir]);

  // Nombre de filtres actifs
  const activeFilters = [
    search.trim() !== '',
    selCategories.length > 0,
    selManufacturers.length > 0,
    selSizes.length > 0,
    statusFilter !== 'all',
    cargoMin !== '', cargoMax !== '',
    priceMax !== '',
    crewMin  !== '',
    speedMin !== '',
  ].filter(Boolean).length;

  const resetFilters = useCallback(() => {
    setSearch(''); setSelCategories([]); setSelManufacturers([]); setSelSizes([]);
    setStatusFilter('all'); setCargoMin(''); setCargoMax('');
    setPriceMax(''); setCrewMin(''); setSpeedMin('');
    setPage(1);
  }, []);

  // Toggle d'un élément dans un tableau de sélection
  const toggle = setter => val =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  // Persistance des filtres dans sessionStorage
  React.useEffect(() => {
    try {
      sessionStorage.setItem(FILTER_KEY, JSON.stringify({
        search, selCategories, selManufacturers, selSizes,
        statusFilter, cargoMin, cargoMax, priceMax, crewMin, speedMin,
        sortField, sortDir,
      }));
    } catch {}
  }, [search, selCategories, selManufacturers, selSizes, statusFilter,
      cargoMin, cargoMax, priceMax, crewMin, speedMin, sortField, sortDir]);

  // Reset page quand les filtres changent
  React.useEffect(() => { setPage(1); }, [
    search, selCategories, selManufacturers, selSizes,
    statusFilter, cargoMin, cargoMax, priceMax, crewMin, speedMin,
  ]);

  // Vaisseaux paginés
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Flotte
  const handleAddToFleet = useCallback((ship) => {
    addShipToFleet({
      fleetId: `fleet_${ship.id}_${Date.now()}`, shipId: ship.id,
      name: ship.name, manufacturer: ship.manufacturer, role: ship.role,
      size: ship.size, specs: ship.specs, price: ship.price,
    });
    notify(`${ship.name} ajouté à la flotte`, 'success');
  }, [addShipToFleet, notify]);

  const isFav = useCallback((ship) =>
    (favorites.ships || []).some(f => f.id === ship.id)
  , [favorites]);

  const handleToggleFav = useCallback((ship) => {
    if (isFav(ship)) {
      removeFavorite('ships', { id: ship.id });
      notify(`${ship.name} retiré des favoris`, 'info');
    } else {
      addFavorite('ships', { id: ship.id, name: ship.name, manufacturer: ship.manufacturer });
      notify(`${ship.name} ajouté aux favoris`, 'success');
    }
  }, [isFav, addFavorite, removeFavorite, notify]);

  // Stats globales
  const stats = useMemo(() => ({
    total:     SHIPS.length,
    inGame:    SHIPS.filter(s => s.inGame).length,
    pledge:    SHIPS.filter(s => !s.inGame).length,
    withCargo: SHIPS.filter(s => (s.specs?.cargo ?? 0) > 0).length,
  }), []);

  return (
    <div className="space-y-5">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Base de Données des Vaisseaux</h1>
          <p className="page-subtitle">
            {stats.inGame} en jeu · {stats.pledge} pledge only · {stats.total} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => navigate('/vaisseaux/comparer')} className="btn-secondary gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            Comparer
          </button>

          {/* Toggle UEX Live */}
          <button
            onClick={() => setUseLive(v => !v)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
              useLive
                ? 'bg-green-500/15 border-green-500/40 text-green-400'
                : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:text-slate-300 hover:border-space-300/30'
            )}
            title={useLive ? 'Données live UEX Corp actives' : 'Activer les prix live UEX Corp'}
          >
            {useLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {useLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            <span className="hidden sm:inline">{useLive ? 'LIVE' : 'UEX'}</span>
          </button>

          {useLive && (
            <button
              onClick={refreshAllLive}
              className="p-2 rounded-lg bg-space-700/50 border border-space-400/20 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Rafraichir les donnees UEX"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', liveLoading && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>

      {/* ── Bandeau UEX Live info ────────────────────────────────────────────── */}
      {useLive && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
          <Wifi className="w-3 h-3 flex-shrink-0" />
          <span>Donnees UEX Corp actives</span>
          {liveLoading && <span className="text-slate-500">Chargement...</span>}
          {!liveLoading && liveLastUpdated && (
            <span className="text-slate-500 ml-auto">
              MAJ {new Date(liveLastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {/* ── Cartes de stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: stats.total,     color: 'text-slate-300' },
          { label: 'En Jeu',     value: stats.inGame,    color: 'text-green-400' },
          { label: 'Pledge',     value: stats.pledge,    color: 'text-yellow-400' },
          { label: 'Avec Cargo', value: stats.withCargo, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Barre Recherche + Tri + Vue ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Nom, fabricant, rôle, tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={sortField}
            onChange={e => { setSortField(e.target.value); setSortDir('asc'); }}
            className="input text-sm"
          >
            <option value="name">Nom</option>
            <option value="price">Prix</option>
            <option value="speed">Vitesse SCM</option>
            <option value="cargo">Cargo (SCU)</option>
            <option value="shields">Boucliers</option>
            <option value="crew">Équipage</option>
            <option value="size">Taille</option>
          </select>
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary p-2"
            title={sortDir === 'asc' ? 'Croissant → Décroissant' : 'Décroissant → Croissant'}
          >
            {sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className="flex rounded-lg border border-space-400/20 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 transition-colors', viewMode === 'grid'
                ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700/50 text-slate-500 hover:text-slate-300')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={clsx('p-2 transition-colors', viewMode === 'table'
                ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700/50 text-slate-500 hover:text-slate-300')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Panneau de filtres ───────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-space-700/30 transition-colors"
          onClick={() => setFiltersOpen(v => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">Filtres</span>
            {activeFilters > 0 && (
              <span className="badge badge-cyan text-xs">{activeFilters} actif{activeFilters > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilters > 0 && (
              <button
                onClick={e => { e.stopPropagation(); resetFilters(); }}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Tout effacer
              </button>
            )}
            {filtersOpen
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>

        {filtersOpen && (
          <div className="border-t border-space-400/20 p-4 space-y-5">

            {/* Catégorie de rôle */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">
                Catégorie de rôle
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_CATEGORIES.map(cat => {
                  const active = selCategories.includes(cat.key);
                  const count = normalizedShips.filter(s => s.roleCategory === cat.key).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => toggle(setSelCategories)(cat.key)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        active ? cat.activeCls
                          : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:text-slate-300 hover:border-space-300/30'
                      )}
                    >
                      {cat.label} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Taille */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Taille</label>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map(size => {
                  const active = selSizes.includes(size);
                  const count = normalizedShips.filter(s => s.size === size).length;
                  return (
                    <button
                      key={size}
                      onClick={() => toggle(setSelSizes)(size)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        active
                          ? `${SIZE_BADGE[size]} border`
                          : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:text-slate-300 hover:border-space-300/30'
                      )}
                    >
                      {size} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabricant */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">
                Fabricant
                {selManufacturers.length > 0 && (
                  <span className="ml-2 text-cyan-400 normal-case font-normal">
                    {selManufacturers.length} sélectionné{selManufacturers.length > 1 ? 's' : ''}
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SHIP_MANUFACTURERS.map(m => {
                  const active = selManufacturers.includes(m);
                  const count = normalizedShips.filter(s => s.manufacturer === m).length;
                  return (
                    <button
                      key={m}
                      onClick={() => toggle(setSelManufacturers)(m)}
                      className={clsx(
                        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                        active
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                          : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:text-slate-300 hover:border-space-300/30'
                      )}
                    >
                      {m} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtres numériques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Statut */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Statut</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-full">
                  <option value="all">Tous</option>
                  <option value="ingame">En jeu uniquement</option>
                  <option value="pledge">Pledge uniquement</option>
                </select>
              </div>
              {/* Cargo */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Cargo (SCU)</label>
                <div className="flex items-center gap-1.5">
                  <input type="number" placeholder="Min" value={cargoMin} onChange={e => setCargoMin(e.target.value)}
                    className="input text-sm w-full" min="0" />
                  <span className="text-slate-500 text-xs flex-shrink-0">–</span>
                  <input type="number" placeholder="Max" value={cargoMax} onChange={e => setCargoMax(e.target.value)}
                    className="input text-sm w-full" min="0" />
                </div>
              </div>
              {/* Prix */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Prix max (aUEC)</label>
                <input type="number" placeholder="ex : 5 000 000" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                  className="input text-sm w-full" min="0" step="100000" />
              </div>
              {/* Vitesse */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Vitesse SCM min (m/s)</label>
                <input type="number" placeholder="ex : 200" value={speedMin} onChange={e => setSpeedMin(e.target.value)}
                  className="input text-sm w-full" min="0" />
              </div>
              {/* Crew */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Équipage min</label>
                <input type="number" placeholder="ex : 2" value={crewMin} onChange={e => setCrewMin(e.target.value)}
                  className="input text-sm w-full" min="1" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Ligne de résultats ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">{filtered.length}</span> vaisseau{filtered.length !== 1 ? 'x' : ''}
          {activeFilters > 0 && <span className="text-slate-500"> sur {stats.total}</span>}
          {totalPages > 1 && (
            <span className="text-slate-500"> · page {page}/{totalPages}</span>
          )}
        </span>
        {activeFilters > 0 && (
          <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
            <RotateCcw className="w-3 h-3" /> Effacer les filtres
          </button>
        )}
      </div>

      {/* ── Contenu ──────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Rocket className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-3">Aucun vaisseau ne correspond aux filtres</p>
          <button onClick={resetFilters} className="btn-secondary btn-sm gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser les filtres
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map(ship => (
            <ShipCard
              key={ship.id}
              ship={ship}
              onView={s => navigate(`/vaisseaux/${s.id}`)}
              onAddToFleet={handleAddToFleet}
              isFav={isFav(ship)}
              onToggleFav={handleToggleFav}
              patchInfo={shipPatches[ship.id]}
              liveData={useLive ? liveDataMap[ship.name.toLowerCase()] : null}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-space-400/20 bg-space-800/50">
                <tr>
                  <SortHeader label="Vaisseau"    field="name"    sortBy={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Rôle</th>
                  <SortHeader label="Taille"      field="size"    sortBy={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Crew"        field="crew"    sortBy={sortField} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                  <SortHeader label="Cargo"       field="cargo"   sortBy={sortField} sortDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortHeader label="SCM"         field="speed"   sortBy={sortField} sortDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                  <SortHeader label="Boucliers"   field="shields" sortBy={sortField} sortDir={sortDir} onSort={handleSort} className="hidden xl:table-cell" />
                  <SortHeader label="Prix aUEC"   field="price"   sortBy={sortField} sortDir={sortDir} onSort={handleSort} className="text-right" />
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                  <th className="px-3 py-2.5 w-16" />
                </tr>
              </thead>
              <tbody>
                {paged.map(ship => (
                  <TableRow
                    key={ship.id}
                    ship={ship}
                    onView={s => navigate(`/vaisseaux/${s.id}`)}
                    onAddToFleet={handleAddToFleet}
                    isFav={isFav(ship)}
                    onToggleFav={handleToggleFav}
                    liveData={useLive ? liveDataMap[ship.name.toLowerCase()] : null}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary btn-sm px-3 disabled:opacity-30"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
            .reduce((acc, n, idx, arr) => {
              if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
              acc.push(n);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '…' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-500 text-sm">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={clsx(
                    'btn-sm px-3 min-w-[2rem]',
                    item === page ? 'btn-primary' : 'btn-secondary'
                  )}
                >
                  {item}
                </button>
              )
            )}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary btn-sm px-3 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
