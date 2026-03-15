import React, { useState, useMemo } from 'react';
import { STATIONS } from '../../datasets/stations.js';
import {
  Building, MapPin, Shield, ShoppingBag, Wrench, Filter, AlertTriangle,
  ChevronDown, ChevronRight, Anchor, Zap, Package, RefreshCw, Star,
  Search, Globe, Lock,
} from 'lucide-react';
import clsx from 'clsx';

const TYPE_ICONS = {
  'Ville': Building, 'Station Atmosphérique': Building,
  'Station de Lagrange': Anchor, 'Station Criminelle': AlertTriangle,
  'Avant-poste Illégal': AlertTriangle, 'Station de Service': RefreshCw,
  'Station Commerciale': ShoppingBag, 'Avant-poste': MapPin,
};
const SYSTEM_COLORS = { Stanton: 'text-cyan-400', Pyro: 'text-orange-400', Nyx: 'text-purple-400' };
const SYSTEM_BG = { Stanton: 'bg-cyan-500/10 border-cyan-500/20', Pyro: 'bg-orange-500/10 border-orange-500/20', Nyx: 'bg-purple-500/10 border-purple-500/20' };
const SECURITY_COLOR = {
  'Haute': 'text-success-400', 'Modérée': 'text-warning-400',
  'Faible': 'text-danger-400', 'Aucune': 'text-danger-400',
};
const SERVICE_COLORS = {
  'Commerce': 'badge-cyan', 'Réparation': 'badge-slate', 'Ravitaillement': 'badge-slate',
  'Missions': 'badge-purple', 'Raffinerie': 'badge-yellow', 'Spawn': 'badge-green',
  'Hôpital': 'badge-green', 'Commerce Illégal': 'badge-red', 'Missions Criminelles': 'badge-red',
};

function StationCard({ station }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[station.type] || Building;
  const secKey = Object.keys(SECURITY_COLOR).find(k => station.security?.startsWith(k));

  return (
    <div className={clsx('card overflow-hidden transition-all', !station.legal && 'border-danger-500/15')}>
      <button
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', station.legal ? 'bg-space-700' : 'bg-danger-500/15')}>
          <Icon className={clsx('w-5 h-5', station.legal ? 'text-slate-400' : 'text-danger-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200 truncate">{station.name}</span>
            {station.hasSpawnPoint && <span className="badge badge-green text-xs">Spawn</span>}
            {station.hasRefinery && <span className="badge badge-yellow text-xs">Raffinerie</span>}
            {station.illegalGoods && <span className="badge badge-red text-xs">Marché Noir</span>}
            {!station.legal && <span className="badge badge-red text-xs">Zone Criminelle</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className={SYSTEM_COLORS[station.system]}>{station.system}</span>
            <span>•</span><span>{station.body}</span>
            <span>•</span><span>{station.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {station.security && (
            <span className={clsx('text-xs font-medium hidden sm:block', SECURITY_COLOR[secKey] || 'text-slate-400')}>
              {station.security}
            </span>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 p-4 bg-space-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {station.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-slate-400">{station.description}</p>
                {station.note && <p className="text-xs text-warning-400 mt-1 italic">{station.note}</p>}
              </div>
            )}
            {station.services && station.services.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" /> Services
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {station.services.map(s => (
                    <span key={s} className={clsx('badge text-xs', SERVICE_COLORS[s] || 'badge-slate')}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {station.shops?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3 text-cyan-400" /> Boutiques ({station.shops.length})
                </div>
                <div className="space-y-1">
                  {station.shops.map(shop => (
                    <div key={shop.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{shop.icon} {shop.name}</span>
                      <span className="text-slate-500">{shop.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {station.commodities?.buys?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Package className="w-3 h-3" /> Achète
                </div>
                <div className="flex flex-wrap gap-1">
                  {station.commodities.buys.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded bg-success-500/10 text-success-400">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {station.commodities?.sells?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3" /> Vend
                </div>
                <div className="flex flex-wrap gap-1">
                  {station.commodities.sells.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {station.travelTime && Object.keys(station.travelTime).length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Temps de trajet (min)
                </div>
                {Object.entries(station.travelTime).map(([from, mins]) => (
                  <div key={from} className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{from.replace('from_', '').replace(/_/g, ' ')}</span>
                    <span className="text-cyan-400 font-medium">{mins} min</span>
                  </div>
                ))}
              </div>
            )}
            {station.controller && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Contrôle
                </div>
                <div className="text-sm text-slate-300">{station.controller}</div>
                <div className={clsx('text-xs mt-1', station.legal ? 'text-success-400' : 'text-danger-400')}>
                  {station.legal ? '✓ Zone Légale' : '✗ Zone Criminelle'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StationsMap() {
  const [filterSystem, setFilterSystem] = useState('');
  const [filterLegal, setFilterLegal] = useState('');
  const [filterSpawn, setFilterSpawn] = useState(false);
  const [filterRefinery, setFilterRefinery] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  const filtered = useMemo(() => STATIONS.filter(s => {
    if (filterSystem && s.system !== filterSystem) return false;
    if (filterLegal === 'legal' && !s.legal) return false;
    if (filterLegal === 'illegal' && s.legal) return false;
    if (filterSpawn && !s.hasSpawnPoint) return false;
    if (filterRefinery && !s.hasRefinery) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.body?.toLowerCase().includes(q) && !s.type?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filterSystem, filterLegal, filterSpawn, filterRefinery, search]);

  const systems = [...new Set(STATIONS.map(s => s.system))];
  const grouped = useMemo(() => systems.reduce((acc, sys) => {
    acc[sys] = filtered.filter(s => s.system === sys);
    return acc;
  }, {}), [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Stations & Villes</h1>
        <p className="page-subtitle">{filtered.length} / {STATIONS.length} emplacements — Stanton & Pyro</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: STATIONS.length, color: 'text-cyan-400' },
          { label: 'Points de Spawn', value: STATIONS.filter(s => s.hasSpawnPoint).length, color: 'text-success-400' },
          { label: 'Raffineries', value: STATIONS.filter(s => s.hasRefinery).length, color: 'text-warning-400' },
          { label: 'Zones Criminelles', value: STATIONS.filter(s => !s.legal).length, color: 'text-danger-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-8 w-44" />
        </div>
        <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)} className="select w-auto">
          <option value="">Tous les systèmes</option>
          {systems.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterLegal} onChange={e => setFilterLegal(e.target.value)} className="select w-auto">
          <option value="">Légalité</option>
          <option value="legal">Légal seulement</option>
          <option value="illegal">Illégal seulement</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
          <input type="checkbox" checked={filterSpawn} onChange={e => setFilterSpawn(e.target.checked)} className="accent-cyan-500" />
          Spawn uniquement
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
          <input type="checkbox" checked={filterRefinery} onChange={e => setFilterRefinery(e.target.checked)} className="accent-cyan-500" />
          Raffinerie
        </label>
        <div className="ml-auto flex gap-1">
          {[['cards', 'Cartes'], ['grouped', 'Par Système']].map(([m, l]) => (
            <button key={m} onClick={() => setViewMode(m)} className={clsx('px-3 py-1.5 rounded-lg text-xs transition-all', viewMode === m ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 bg-space-700/50')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterSystem('')} className={clsx('px-3 py-1.5 rounded-lg text-sm transition-all', !filterSystem ? 'bg-space-600 text-slate-200' : 'text-slate-500 hover:text-slate-300')}>
          Tous ({STATIONS.length})
        </button>
        {systems.map(sys => (
          <button key={sys} onClick={() => setFilterSystem(filterSystem === sys ? '' : sys)}
            className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border', filterSystem === sys ? SYSTEM_BG[sys] + ' ' + SYSTEM_COLORS[sys] : 'text-slate-500 hover:text-slate-300 border-transparent')}>
            <Globe className="w-3.5 h-3.5" />
            {sys} ({STATIONS.filter(s => s.system === sys).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune station ne correspond aux filtres</p>
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([sys, stations]) => stations.length > 0 && (
            <div key={sys}>
              <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg mb-3 border', SYSTEM_BG[sys])}>
                <Globe className={clsx('w-4 h-4', SYSTEM_COLORS[sys])} />
                <span className={clsx('font-semibold', SYSTEM_COLORS[sys])}>{sys}</span>
                <span className="text-slate-500 text-sm">— {stations.length} emplacement{stations.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">{stations.map(s => <StationCard key={s.id} station={s} />)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">{filtered.map(s => <StationCard key={s.id} station={s} />)}</div>
      )}
    </div>
  );
}
