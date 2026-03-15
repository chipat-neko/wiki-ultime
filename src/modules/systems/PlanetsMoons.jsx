import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { STAR_SYSTEMS_DATA } from '../../datasets/systems.js';
import { MINING_BODIES, MINERALS, METHOD_LABELS } from '../../datasets/miningData.js';
import {
  Navigation, Star, MapPin, Filter, Gem, Globe, ChevronDown, ChevronRight,
  Thermometer, Shield, Search, AlertTriangle, Layers, ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

// Build lookup: body.id → miningData body (with aliases for systems.js IDs)
const _base = Object.fromEntries(MINING_BODIES.map(b => [b.id, b]));
const MINING_BY_ID = {
  ..._base,
  monox:    _base.pyro1,
  ignis:    _base.pyro2,
  vuur:     _base.pyro3,
  'vuur-un':_base.pyro3,
  bloom:    _base.pyro4,
  fuego:    _base.pyro5,
  adir:     _base.pyro6,
};

// ─── Config ────────────────────────────────────────────────────────────────────

const SYSTEM_COLORS = { Stanton: 'text-cyan-400', Pyro: 'text-orange-400' };
const SYSTEM_BG = {
  Stanton: 'bg-cyan-500/10 border-cyan-500/20',
  Pyro: 'bg-orange-500/10 border-orange-500/20',
};

const ATMO_COLORS = {
  'Toxique':       'text-danger-400',
  'Glaciale':      'text-blue-400',
  'Dense (Gaz)':   'text-purple-400',
  'Dense':         'text-purple-400',
  'Dense/Toxique': 'text-danger-400',
  'Froide/Oxygène':'text-blue-300',
  'Thin':          'text-slate-300',
  'Modifiée':      'text-cyan-400',
  'Aucune':        'text-slate-600',
  'Volcanique':    'text-orange-400',
};

const TYPE_ICONS = {
  'Étoile':        Star,
  'Planète':       Navigation,
  'Géante Gazeuse':Globe,
  'Lune':          Star,
};

function StarRating({ value, max = 5 }) {
  return (
    <span className="text-warning-400 text-xs">
      {'★'.repeat(value)}{'☆'.repeat(max - value)}
    </span>
  );
}

// ─── Body Card ────────────────────────────────────────────────────────────────

function BodyCard({ body }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const Icon = TYPE_ICONS[body.type] || Navigation;
  const atmoColor = ATMO_COLORS[body.atmosphere] || 'text-slate-400';
  const hasMoons = body.moons?.length > 0;
  const hasResources = body.resources?.length > 0;
  const hasLocations = body.locations?.length > 0;
  const isIllegal = body.type === 'Lune' && body.systemName === 'Pyro';

  // Detailed mining data from miningData.js
  const miningDetail = MINING_BY_ID[body.id?.toLowerCase()] || null;

  return (
    <div className={clsx(
      'card overflow-hidden transition-all',
      body.type === 'Étoile' && 'border-warning-500/20',
      body.systemName === 'Pyro' && body.type !== 'Étoile' && 'border-orange-500/10',
    )}>
      <button
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Icon */}
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          body.type === 'Étoile'        ? 'bg-warning-500/15' :
          body.type === 'Géante Gazeuse'? 'bg-purple-500/15' :
          body.type === 'Lune'          ? 'bg-space-600' :
          'bg-space-700',
        )}>
          <Icon className={clsx(
            'w-5 h-5',
            body.type === 'Étoile'         ? 'text-warning-400' :
            body.type === 'Géante Gazeuse' ? 'text-purple-400' :
            body.type === 'Lune'           ? 'text-slate-500' :
            'text-cyan-400',
          )} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200 truncate">{body.name}</span>
            <span className="badge badge-slate text-xs">{body.type}</span>
            {hasResources && (
              <span className="badge badge-yellow text-xs flex items-center gap-0.5">
                <Gem className="w-2.5 h-2.5" /> Minable
              </span>
            )}
            {body.parentBody && (
              <span className="text-xs text-slate-600">Lune de {body.parentBody}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
            <span className={SYSTEM_COLORS[body.systemName]}>{body.systemName}</span>
            {body.atmosphere && (
              <>
                <span>•</span>
                <span className={atmoColor}>{body.atmosphere}</span>
              </>
            )}
            {body.controller && (
              <>
                <span>•</span>
                <span>{body.controller}</span>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {hasResources && body.minableRating && (
            <StarRating value={body.minableRating} />
          )}
          {hasLocations && (
            <span className="text-xs text-slate-500 hidden sm:block">
              <MapPin className="w-3 h-3 inline mr-0.5" />{body.locations.length}
            </span>
          )}
          {expanded
            ? <ChevronDown className="w-4 h-4 text-slate-500" />
            : <ChevronRight className="w-4 h-4 text-slate-500" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 p-4 bg-space-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Description */}
            {body.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-slate-400">{body.description}</p>
              </div>
            )}

            {/* Physical stats */}
            {(body.diameter || body.gravity) && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Layers className="w-3 h-3" /> Physique
                </div>
                <div className="space-y-1">
                  {body.diameter && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Diamètre</span>
                      <span className="text-slate-300">{body.diameter.toLocaleString()} km</span>
                    </div>
                  )}
                  {body.gravity && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Gravité</span>
                      <span className={clsx('font-medium', body.gravity > 1.5 ? 'text-danger-400' : body.gravity < 0.5 ? 'text-warning-400' : 'text-success-400')}>
                        {body.gravity}g
                      </span>
                    </div>
                  )}
                  {body.atmosphere && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Atmosphère</span>
                      <span className={atmoColor}>{body.atmosphere}</span>
                    </div>
                  )}
                  {body.orbitalPosition && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Position orbitale</span>
                      <span className="text-slate-300">#{body.orbitalPosition}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resources — détaillées depuis miningData si disponible */}
            {(hasResources || miningDetail) && (
              <div className="sm:col-span-2">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Gem className="w-3 h-3 text-warning-400" />
                  Ressources Minables
                  {body.minableRating && (
                    <span className="ml-1">
                      <StarRating value={body.minableRating} />
                    </span>
                  )}
                  {miningDetail && (
                    <button
                      onClick={() => navigate('/minage')}
                      className="ml-auto flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Guide complet
                    </button>
                  )}
                </div>
                {miningDetail ? (
                  <div className="space-y-2">
                    {[
                      { key: 'ship', minerals: miningDetail.ship },
                      { key: 'roc',  minerals: miningDetail.roc  },
                      { key: 'hand', minerals: miningDetail.hand },
                    ].filter(({ minerals }) => minerals.length > 0).map(({ key, minerals }) => {
                      const m = METHOD_LABELS[key];
                      return (
                        <div key={key} className="flex items-start gap-2">
                          <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5', m.bg, m.color)}>
                            <span>{m.icon}</span>
                            <span>{m.short}</span>
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {minerals.map(mId => {
                              const min = MINERALS[mId];
                              if (!min) return null;
                              return (
                                <span key={mId} className={clsx('text-xs px-2 py-0.5 rounded-full border', min.bg, min.color, min.border)}>
                                  {min.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {miningDetail.harvestables?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5 bg-green-900/30 text-green-400">
                          🌿 Récolte
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {miningDetail.harvestables.map(hId => (
                            <span key={hId} className="text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-300 border border-green-700/30">
                              {hId.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {body.resources.map(r => (
                      <span key={r} className="badge badge-yellow" style={{ fontSize: '10px' }}>{r}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Locations */}
            {hasLocations && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Emplacements ({body.locations.length})
                </div>
                <div className="space-y-1">
                  {body.locations.map(loc => (
                    <div key={loc.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{loc.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">{loc.type}</span>
                        {loc.landingZone && (
                          <span className="badge badge-green" style={{ fontSize: '9px', padding: '1px 4px' }}>ATT</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controller */}
            {body.controller && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Contrôle
                </div>
                <div className="text-sm text-slate-300">{body.controller}</div>
                {body.security && (
                  <div className="text-xs text-slate-500 mt-1">{body.security}</div>
                )}
              </div>
            )}

            {/* Moons list */}
            {hasMoons && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> Lunes ({body.moons.length})
                </div>
                <div className="space-y-1">
                  {body.moons.map(moon => (
                    <div key={moon.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{moon.name}</span>
                      <div className="flex items-center gap-1.5">
                        {moon.resources?.length > 0 && (
                          <Gem className="w-2.5 h-2.5 text-warning-400" />
                        )}
                        {moon.atmosphere && (
                          <span className={clsx('text-xs', ATMO_COLORS[moon.atmosphere] || 'text-slate-600')}>
                            {moon.atmosphere}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function PlanetsMoons() {
  const [filterSystem, setFilterSystem] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMinable, setFilterMinable] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grouped'

  const allBodies = useMemo(() => {
    const bodies = [];
    STAR_SYSTEMS_DATA.forEach(system => {
      (system.bodies || []).forEach(body => {
        if (body.type === 'Étoile') return; // skip stars
        bodies.push({ ...body, systemName: system.name, systemId: system.id });
        (body.moons || []).forEach(moon => {
          bodies.push({
            ...moon,
            systemName: system.name,
            systemId: system.id,
            parentBody: body.name,
            type: 'Lune',
          });
        });
      });
    });
    return bodies;
  }, []);

  const filtered = useMemo(() => allBodies.filter(b => {
    if (filterSystem && b.systemId !== filterSystem) return false;
    if (filterType && b.type !== filterType) return false;
    if (filterMinable && !b.resources?.length) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [allBodies, filterSystem, filterType, filterMinable, search]);

  const accessibleSystems = STAR_SYSTEMS_DATA.filter(s => s.accessible);
  const types = [...new Set(allBodies.map(b => b.type))];
  const systems = [...new Set(allBodies.map(b => b.systemId))];

  const grouped = useMemo(() => systems.reduce((acc, sysId) => {
    acc[sysId] = filtered.filter(b => b.systemId === sysId);
    return acc;
  }, {}), [filtered, systems]);

  // Stats
  const stats = useMemo(() => ({
    total:    allBodies.length,
    planetes: allBodies.filter(b => b.type === 'Planète' || b.type === 'Géante Gazeuse').length,
    lunes:    allBodies.filter(b => b.type === 'Lune').length,
    minables: allBodies.filter(b => b.resources?.length > 0).length,
  }), [allBodies]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Planètes & Lunes</h1>
        <p className="page-subtitle">{filtered.length} / {allBodies.length} corps célestes — Stanton & Pyro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Corps Célestes', value: stats.total,    color: 'text-cyan-400' },
          { label: 'Planètes',       value: stats.planetes, color: 'text-blue-400' },
          { label: 'Lunes',          value: stats.lunes,    color: 'text-slate-400' },
          { label: 'Minables',       value: stats.minables, color: 'text-warning-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-8 w-44"
          />
        </div>
        <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)} className="select w-auto">
          <option value="">Tous les systèmes</option>
          {accessibleSystems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="select w-auto">
          <option value="">Tous les types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
          <input
            type="checkbox"
            checked={filterMinable}
            onChange={e => setFilterMinable(e.target.checked)}
            className="accent-warning-500"
          />
          <Gem className="w-3.5 h-3.5 text-warning-400" />
          Minables seulement
        </label>
        <div className="ml-auto flex gap-1">
          {[['list', 'Liste'], ['grouped', 'Par Système']].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs transition-all',
                viewMode === m ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 bg-space-700/50',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* System quick filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterSystem('')}
          className={clsx('px-3 py-1.5 rounded-lg text-sm transition-all', !filterSystem ? 'bg-space-600 text-slate-200' : 'text-slate-500 hover:text-slate-300')}
        >
          Tous ({allBodies.length})
        </button>
        {accessibleSystems.map(sys => (
          <button
            key={sys.id}
            onClick={() => setFilterSystem(filterSystem === sys.id ? '' : sys.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border',
              filterSystem === sys.id
                ? SYSTEM_BG[sys.name] + ' ' + SYSTEM_COLORS[sys.name]
                : 'text-slate-500 hover:text-slate-300 border-transparent',
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            {sys.name} ({allBodies.filter(b => b.systemId === sys.id).length})
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Navigation className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun corps céleste ne correspond aux filtres</p>
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([sysId, bodies]) => {
            if (!bodies.length) return null;
            const sys = STAR_SYSTEMS_DATA.find(s => s.id === sysId);
            return (
              <div key={sysId}>
                <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg mb-3 border', SYSTEM_BG[sys?.name] || 'bg-space-700 border-space-400/20')}>
                  <Globe className={clsx('w-4 h-4', SYSTEM_COLORS[sys?.name] || 'text-slate-400')} />
                  <span className={clsx('font-semibold', SYSTEM_COLORS[sys?.name] || 'text-slate-300')}>{sys?.name}</span>
                  <span className="text-slate-500 text-sm">— {bodies.length} corps céleste{bodies.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  {bodies.map(b => <BodyCard key={`${b.systemId}-${b.id}`} body={b} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => <BodyCard key={`${b.systemId}-${b.id}`} body={b} />)}
        </div>
      )}
    </div>
  );
}
