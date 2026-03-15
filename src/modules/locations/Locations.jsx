import React, { useState, useMemo } from 'react';
import {
  LOCATIONS, LOCATION_TYPES, LOCATION_DIFFICULTIES,
  LOCATIONS_BY_SYSTEM, CAVE_LOCATIONS, COMBAT_LOCATIONS, ILLEGAL_LOCATIONS,
} from '../../datasets/locations.js';
import clsx from 'clsx';
import {
  MapPin, Search, Mountain, Shield, Building2, Anchor, Beaker,
  Layers, Rocket, Home, ChevronDown, ChevronUp, Info,
  AlertTriangle, Star, Users, Package, Flame, SortAsc,
} from 'lucide-react';

const DIFFICULTY_ORDER = { 'Facile': 0, 'Moyen': 1, 'Difficile': 2, 'Extrême': 3 };

const TYPE_ICONS = {
  cave:     Mountain,
  bunker:   Shield,
  outpost:  Building2,
  derelict: Anchor,
  lab:      Beaker,
  ruins:    Layers,
  wreck:    Rocket,
  poi:      MapPin,
};

const SYSTEM_LABELS = {
  stanton: 'Stanton',
  pyro: 'Pyro',
};

function LocationCard({ loc }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[loc.type] || MapPin;
  const typeInfo = LOCATION_TYPES[loc.type];
  const diffInfo = LOCATION_DIFFICULTIES[loc.difficulty];

  return (
    <div className={clsx(
      'card p-4 border transition-all',
      !loc.legal ? 'border-danger-500/20' : 'border-space-400/20',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeInfo?.bg || 'bg-space-700')}>
            <Icon className={clsx('w-5 h-5', typeInfo?.color || 'text-slate-400')} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200 truncate">{loc.name}</span>
              {loc.system === 'pyro' && (
                <span className="badge bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs flex items-center gap-0.5">
                  <Flame className="w-3 h-3" />PYRO
                </span>
              )}
              {!loc.legal && (
                <span className="badge bg-danger-500/15 text-danger-400 border-danger-500/30 text-xs">Illégal</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={clsx('text-xs font-medium', typeInfo?.color)}>{typeInfo?.label || loc.type}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-500 capitalize">{loc.body.replace(/-/g, ' ')}</span>
              <span className="text-slate-600">•</span>
              <span className={clsx('text-xs font-medium', diffInfo?.color)}>{loc.difficulty}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Activités rapides */}
      <div className="mt-2 flex flex-wrap gap-1">
        {loc.activities?.map(a => (
          <span key={a} className="badge badge-slate text-xs">{a}</span>
        ))}
        {loc.enemies?.length > 0 && (
          <span className="badge bg-danger-500/10 text-danger-400 border-danger-500/20 text-xs">
            ⚔ Ennemis
          </span>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-space-400/20 pt-3">
          <p className="text-xs text-slate-400">{loc.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Ressources */}
            {loc.resources?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-amber-400 mb-1 flex items-center gap-1">
                  <Mountain className="w-3 h-3" /> Ressources
                </div>
                <div className="flex flex-wrap gap-1">
                  {loc.resources.map(r => (
                    <span key={r} className="badge bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">{r}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Loot */}
            {loc.loot?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-cyan-400 mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Loot
                </div>
                <div className="flex flex-wrap gap-1">
                  {loc.loot.map(l => (
                    <span key={l} className="badge badge-cyan text-xs">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Ennemis */}
            {loc.enemies?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-danger-400 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Ennemis
                </div>
                <div className="flex flex-wrap gap-1">
                  {loc.enemies.map(e => (
                    <span key={e} className="badge bg-danger-500/10 text-danger-400 border-danger-500/20 text-xs">{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommandé */}
          {loc.recommended && (
            <div className="p-2 rounded-lg bg-space-900/60 space-y-1 text-xs">
              <div className="font-medium text-slate-300 mb-1">Recommandé :</div>
              {loc.recommended.players && <div className="text-slate-400">Joueurs: {loc.recommended.players}</div>}
              {loc.recommended.ships?.length > 0 && <div className="text-slate-400">Vaisseaux: {loc.recommended.ships.join(', ')}</div>}
              {loc.recommended.gear?.length > 0 && <div className="text-slate-400">Équipement: {loc.recommended.gear.join(', ')}</div>}
            </div>
          )}

          {/* Respawn */}
          {loc.respawnTime && (
            <div className="text-xs text-slate-500">
              Respawn: {loc.respawnTime >= 3600 ? `${loc.respawnTime / 3600}h` : `${loc.respawnTime / 60} min`}
            </div>
          )}

          {/* Notes */}
          {loc.notes && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <Info className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-300">{loc.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PYRO_COUNT = LOCATIONS_BY_SYSTEM['pyro']?.length || 0;

export default function Locations() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [legalFilter, setLegalFilter] = useState('all');
  const [sortByDiff, setSortByDiff] = useState(false);
  const [avoidPyro, setAvoidPyro] = useState(false);

  const filtered = useMemo(() => {
    let list = [...LOCATIONS];
    if (typeFilter !== 'all')   list = list.filter(l => l.type === typeFilter);
    if (systemFilter !== 'all') list = list.filter(l => l.system === systemFilter);
    if (diffFilter !== 'all')   list = list.filter(l => l.difficulty === diffFilter);
    if (legalFilter === 'legal')   list = list.filter(l => l.legal);
    if (legalFilter === 'illegal') list = list.filter(l => !l.legal);
    if (avoidPyro) list = list.filter(l => l.system !== 'pyro');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.body.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.activities?.some(a => a.toLowerCase().includes(q)) ||
        l.resources?.some(r => r.toLowerCase().includes(q)) ||
        l.tags?.some(t => t.includes(q))
      );
    }
    if (sortByDiff) {
      list = [...list].sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99));
    }
    return list;
  }, [search, typeFilter, systemFilter, diffFilter, legalFilter, sortByDiff, avoidPyro]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gradient-cyan">Locations & POI</h1>
          <p className="page-subtitle">
            {LOCATIONS.length} points d'intérêt — Cavernes, bunkers, épaves, avant-postes (Stanton + Pyro)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-300 font-medium">{PYRO_COUNT} Pyro</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-700/50 border border-space-400/20">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">{LOCATIONS.length} Total</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Cavernes de Mining', value: CAVE_LOCATIONS.length, color: 'text-amber-400' },
          { label: 'Zones de Combat', value: COMBAT_LOCATIONS.length, color: 'text-red-400' },
          { label: 'Sites Illégaux', value: ILLEGAL_LOCATIONS.length, color: 'text-danger-400' },
          { label: 'Système Pyro', value: PYRO_COUNT, color: 'text-orange-400' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={clsx(
              'card p-3 text-center cursor-pointer transition-all hover:border-cyan-500/30',
              label === 'Système Pyro' && 'border-orange-500/20 bg-orange-500/5',
            )}
            onClick={() => label === 'Système Pyro' ? setSystemFilter(systemFilter === 'pyro' ? 'all' : 'pyro') : null}
            title={label === 'Système Pyro' ? 'Cliquer pour filtrer Pyro' : ''}
          >
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Type quick filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={clsx('btn-sm px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
            typeFilter === 'all' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-space-700/50 border-space-400/20 text-slate-400'
          )}
        >
          Tous ({LOCATIONS.length})
        </button>
        {Object.entries(LOCATION_TYPES).map(([key, info]) => {
          const count = LOCATIONS.filter(l => l.type === key).length;
          if (!count) return null;
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={clsx('btn-sm px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                typeFilter === key ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-space-700/50 border-space-400/20 text-slate-400'
              )}
            >
              <span className={info.color}>{info.label}</span> ({count})
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher (nom, lune, ressources, activités)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={systemFilter} onChange={e => setSystemFilter(e.target.value)} className="input text-sm">
            <option value="all">Tous systèmes</option>
            <option value="stanton">Stanton</option>
            <option value="pyro">Pyro</option>
          </select>
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="input text-sm">
            <option value="all">Toutes difficultés</option>
            {Object.keys(LOCATION_DIFFICULTIES).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={legalFilter} onChange={e => setLegalFilter(e.target.value)} className="input text-sm">
            <option value="all">Légal & Illégal</option>
            <option value="legal">Légal uniquement</option>
            <option value="illegal">Illégal uniquement</option>
          </select>
          <button
            onClick={() => setSortByDiff(!sortByDiff)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              sortByDiff
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-space-700/50 border-space-400/20 text-slate-400',
            )}
            title="Trier par difficulté croissante"
          >
            <SortAsc className="w-3.5 h-3.5" />
            Difficulté
          </button>
          <button
            onClick={() => setAvoidPyro(!avoidPyro)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              avoidPyro
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                : 'bg-space-700/50 border-space-400/20 text-slate-400',
            )}
            title="Masquer les locations Pyro (PvP élevé)"
          >
            <Flame className="w-3.5 h-3.5" />
            Éviter Pyro
          </button>
        </div>
      </div>

      {/* Warning illegal */}
      {legalFilter === 'illegal' && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-danger-500/5 border border-danger-500/20">
          <AlertTriangle className="w-5 h-5 text-danger-400 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-danger-400">Zone criminelle</div>
            <p className="text-xs text-slate-400 mt-0.5">Les activités dans ces locations peuvent générer un CrimeStat. Procédez avec précaution.</p>
          </div>
        </div>
      )}

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucune location trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(loc => (
              <LocationCard key={loc.id} loc={loc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
