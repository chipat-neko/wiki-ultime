import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppActions } from '../../core/StateManager.jsx';
import {
  VEHICLES, VEHICLE_TYPES, VEHICLE_MANUFACTURERS, VEHICLE_CATEGORIES,
} from '../../datasets/vehicles.js';
import { formatCredits } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Car, Search, Filter, Star, ChevronDown, ChevronUp, Info,
  Zap, Users, Package, Gauge, Shield, Crosshair, Fuel,
} from 'lucide-react';

const IN_GAME_VEHICLES = VEHICLES.filter(v => v.inGame);

const TYPE_COLORS = {
  'Combat':      'text-red-400',
  'Mining':      'text-amber-400',
  'Racing':      'text-cyan-400',
  'Exploration': 'text-blue-400',
  'Transport':   'text-green-400',
  'Défense':     'text-purple-400',
  'Utilitaire':  'text-slate-400',
  'Multi-Rôle':  'text-orange-400',
};

function VehicleAvatar({ vehicle }) {
  const [imgError, setImgError] = React.useState(false);
  if (!imgError && vehicle.imageUrl) {
    return (
      <img
        src={vehicle.imageUrl}
        alt={vehicle.name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  return <Car className="w-5 h-5 text-slate-400" />;
}

function VehicleCard({ vehicle, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useAppActions();
  const fav = isFavorite('vehicles', vehicle.id);

  return (
    <div className={clsx(
      'card p-4 border transition-all',
      vehicle.inGame ? 'border-space-400/20' : 'border-space-400/10 opacity-70'
    )}>
      <div className="flex items-start justify-between gap-3">
        {/* Icon + nom */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <VehicleAvatar vehicle={vehicle} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200 truncate">{vehicle.name}</span>
              {!vehicle.inGame && (
                <span className="badge badge-slate text-xs">Pledge</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`text-xs font-medium ${TYPE_COLORS[vehicle.type] || 'text-slate-400'}`}>{vehicle.type}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-500">{vehicle.manufacturer.split(' ')[0]}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-500">{vehicle.category}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => fav ? removeFavorite('vehicles', { id: vehicle.id }) : addFavorite('vehicles', { id: vehicle.id, name: vehicle.name, manufacturer: vehicle.manufacturer })}
            className={clsx('p-1.5 rounded-lg transition-colors', fav ? 'text-gold-400' : 'text-slate-600 hover:text-slate-400')}
          >
            <Star className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-xs text-slate-500">Équipage</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">
            {vehicle.crew.min === vehicle.crew.max ? vehicle.crew.min : `${vehicle.crew.min}-${vehicle.crew.max}`}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-xs text-slate-500">Cargo</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">{vehicle.cargo} SCU</div>
        </div>
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-xs text-slate-500">Vitesse max</div>
          <div className="text-sm font-semibold text-cyan-400 mt-0.5">{vehicle.specs.maxSpeed} m/s</div>
        </div>
        <div className="p-2 rounded-lg bg-space-900/60">
          <div className="text-xs text-slate-500">Prix</div>
          <div className="text-sm font-semibold text-gold-400 mt-0.5">{formatCredits(vehicle.price)}</div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-space-400/20 pt-3">
          <p className="text-xs text-slate-400">{vehicle.description}</p>

          {/* Specs détaillées */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span>Boost: {vehicle.specs.boostSpeed} m/s</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>Blindage: {vehicle.specs.armor}</span>
            </div>
            {vehicle.specs.shieldHp > 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Bouclier: {vehicle.specs.shieldHp.toLocaleString()} HP</span>
              </div>
            )}
            {vehicle.specs.mass && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Package className="w-3 h-3 text-slate-400" />
                <span>Masse: {(vehicle.specs.mass / 1000).toFixed(1)} t</span>
              </div>
            )}
          </div>

          {/* Armes */}
          {vehicle.specs.weaponMounts?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-red-400" />
                Armement
              </div>
              <div className="flex flex-wrap gap-1">
                {vehicle.specs.weaponMounts.map((m, i) => (
                  <span key={i} className="badge badge-slate text-xs">
                    {m.count}× S{m.size} {m.position}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rôles */}
          <div className="flex flex-wrap gap-1">
            {vehicle.roles?.map((r) => (
              <span key={r} className="badge badge-cyan text-xs">{r}</span>
            ))}
          </div>

          {/* Fits in */}
          {vehicle.fits_in?.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Se loge dans :</div>
              <p className="text-xs text-slate-400">{vehicle.fits_in.join(', ')}</p>
            </div>
          )}

          {/* Notes */}
          {vehicle.notes && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <Info className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-300">{vehicle.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VehiclesDatabase() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [catFilter, setCatFilter] = useState('Toutes');
  const [inGameOnly, setInGameOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const filtered = useMemo(() => {
    let list = [...VEHICLES];
    if (inGameOnly) list = list.filter(v => v.inGame);
    if (typeFilter !== 'Tous') list = list.filter(v => v.type === typeFilter);
    if (catFilter !== 'Toutes') list = list.filter(v => v.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.manufacturer.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags?.some(t => t.includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'name')    return a.name.localeCompare(b.name);
      if (sortBy === 'price')   return a.price - b.price;
      if (sortBy === 'speed')   return b.specs.maxSpeed - a.specs.maxSpeed;
      if (sortBy === 'cargo')   return b.cargo - a.cargo;
      return 0;
    });
    return list;
  }, [search, typeFilter, catFilter, inGameOnly, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gradient-cyan">Véhicules Terrestres</h1>
          <p className="page-subtitle">
            {IN_GAME_VEHICLES.length} véhicules disponibles in-game — {VEHICLES.length} total
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-700/50 border border-space-400/20">
          <Car className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-slate-300">{VEHICLES.length} Véhicules</span>
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input text-sm">
            <option value="Tous">Tous les types</option>
            {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {/* Category filter */}
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input text-sm">
            <option value="Toutes">Toutes catégories</option>
            {VEHICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input text-sm">
            <option value="name">Trier: Nom</option>
            <option value="price">Trier: Prix</option>
            <option value="speed">Trier: Vitesse</option>
            <option value="cargo">Trier: Cargo</option>
          </select>
          {/* In-game toggle */}
          <button
            onClick={() => setInGameOnly(!inGameOnly)}
            className={clsx('btn-sm px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              inGameOnly
                ? 'bg-success-500/15 border-success-500/30 text-success-400'
                : 'bg-space-700/50 border-space-400/20 text-slate-400 hover:border-space-300/30'
            )}
          >
            In-Game seulement
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Véhicules Terrestres', value: VEHICLES.filter(v => v.category.includes('Terrestre') || v.category.includes('Moto')).length, color: 'text-amber-400' },
          { label: 'Hover Bikes', value: VEHICLES.filter(v => v.category === 'Hover Bike').length, color: 'text-cyan-400' },
          { label: 'Véhicules Miniers', value: VEHICLES.filter(v => v.type === 'Mining').length, color: 'text-yellow-400' },
          { label: 'Combat / Défense', value: VEHICLES.filter(v => v.type === 'Combat' || v.type === 'Défense').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Car className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucun véhicule trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
