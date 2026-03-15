import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  STAR_SYSTEMS_DATA, DANGER_LEVELS,
} from '../../datasets/systems.js';
import clsx from 'clsx';
import {
  Globe, MapPin, Building, Navigation, Lock, Unlock,
  ChevronRight, ChevronDown, ChevronUp, Shield, Zap,
  AlertTriangle, Star, Search, Filter, Users, Package,
  Pickaxe, Info, ExternalLink, X,
} from 'lucide-react';

// ─── Constantes visuelles ─────────────────────────────────────
const STATUS_STYLES = {
  'Accessible': 'bg-green-500/15 border-green-500/30 text-green-400',
  'Non Accessible (Prévu)': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
};

const SECURITY_COLORS = {
  'Maximale (UEE)':          'text-green-400',
  'Haute':                   'text-green-400',
  'Haute (Armée Privée)':    'text-green-400',
  'Haute (Sécurité Corporative)': 'text-cyan-400',
  'Modérée (UEE)':           'text-cyan-400',
  'Modérée (Corporative)':   'text-cyan-400',
  'Faible (Milice Locale)':  'text-yellow-400',
  'Faible':                  'text-yellow-400',
  'Aucune (Espace Pirate)':  'text-red-400',
  'Aucune':                  'text-red-400',
  'Maximale (Militaire UEE)': 'text-green-400',
  'Faible (Expéditions Scientifiques)': 'text-yellow-400',
};

const MINABLE_COLORS = ['', 'text-slate-500', 'text-yellow-600', 'text-yellow-500', 'text-amber-400', 'text-green-400'];

// ─── DangerDots ──────────────────────────────────────────────
function DangerDots({ level }) {
  const info = DANGER_LEVELS[level] || DANGER_LEVELS[1];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={clsx(
            'w-2 h-2 rounded-full',
            i <= level ? info.bg : 'bg-space-600'
          )}
        />
      ))}
      <span className={clsx('text-xs ml-1', info.color)}>{info.label}</span>
    </div>
  );
}

// ─── StarDot ─────────────────────────────────────────────────
function StarDot({ color, size = 10 }) {
  return (
    <div
      className="rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 1.5}px ${color}80`,
      }}
    />
  );
}

// ─── MinableBar ──────────────────────────────────────────────
function MinableBar({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={clsx(
            'w-3 h-1.5 rounded-full',
            i <= rating ? 'bg-amber-400' : 'bg-space-600'
          )}
        />
      ))}
    </div>
  );
}

// ─── SystemCard ──────────────────────────────────────────────
function SystemCard({ system, selected, onClick }) {
  const planets = (system.bodies || []).filter(b => b.type !== 'Étoile' && b.type !== 'Étoile Mourante' && b.type !== 'Naine Blanche');
  const totalMoons = planets.reduce((n, p) => n + (p.moons?.length || 0), 0);
  const landingZones = [
    ...(system.stations || []).filter(s => s.landingZone),
    ...(system.bodies || []).flatMap(b => [
      ...(b.locations || []).filter(l => l.landingZone),
      ...(b.moons || []).flatMap(m => (m.locations || []).filter(l => l.landingZone)),
    ]),
  ].length;

  return (
    <div
      onClick={() => onClick(system)}
      className={clsx(
        'card p-5 cursor-pointer group transition-all border',
        selected
          ? 'border-cyan-500/50 bg-cyan-500/5'
          : 'border-space-400/20 hover:border-space-300/40',
        !system.accessible && 'opacity-70'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative',
            system.accessible ? 'bg-space-700 border border-space-400/30' : 'bg-space-800 border border-space-500/20'
          )}>
            <StarDot color={system.starColor || '#888'} size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white group-hover:text-cyan-400 transition-colors leading-tight">
              {system.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{system.starType}</p>
          </div>
        </div>
        <span className={clsx('badge text-xs flex items-center gap-1 flex-shrink-0', STATUS_STYLES[system.status] || 'badge-slate')}>
          {system.accessible ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
          {system.accessible ? 'Accessible' : 'Prévu'}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{system.description}</p>

      {/* Danger */}
      <div className="mb-3">
        <DangerDots level={system.dangerLevel} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Planètes', value: planets.length, icon: Globe },
          { label: 'Lunes', value: totalMoons, icon: Star },
          { label: 'Zones Att.', value: landingZones, icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="text-center p-2 rounded-lg bg-space-900/50">
            <div className="text-sm font-bold text-slate-200">{value}</div>
            <div className="text-xs text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Economy tags */}
      {system.economy?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {system.economy.slice(0, 3).map(e => (
            <span key={e} className="badge badge-slate text-xs">{e}</span>
          ))}
          {system.economy.length > 3 && (
            <span className="badge badge-slate text-xs">+{system.economy.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-space-400/15">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-slate-600" />
          <span className={clsx('text-xs', SECURITY_COLORS[system.security] || 'text-slate-400')}>
            {system.security}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <span>{system.jumpPoints?.length || 0} points de saut</span>
          <ChevronRight className={clsx('w-3 h-3 transition-transform', selected && 'rotate-90 text-cyan-400')} />
        </div>
      </div>
    </div>
  );
}

// ─── Tabs pour le panneau détail ─────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Aperçu' },
  { id: 'bodies',    label: 'Planètes & Lunes' },
  { id: 'stations',  label: 'Stations' },
  { id: 'factions',  label: 'Factions & Éco.' },
];

// ─── BodyTree ────────────────────────────────────────────────
function BodyTree({ body }) {
  const [open, setOpen] = useState(false);
  const isSpecial = body.type === 'Astéroïde Majeur';

  return (
    <div className="border border-space-400/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-space-700/30 transition-colors text-left"
      >
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isSpecial ? 'bg-amber-500/15 border border-amber-500/20' : 'bg-space-700'
        )}>
          <Globe className={clsx('w-4 h-4', isSpecial ? 'text-amber-400' : 'text-slate-500')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-200 text-sm">{body.name}</span>
            <span className="badge badge-slate text-xs">{body.type}</span>
            {body.orbitalPosition !== null && body.orbitalPosition > 0 && (
              <span className="text-xs text-slate-600">Pos. {body.orbitalPosition}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            {body.atmosphere && <span>{body.atmosphere}</span>}
            {body.diameter && <span>{body.diameter?.toLocaleString()} km</span>}
            {body.gravity && body.gravity < 100 && <span>{body.gravity}G</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 flex-shrink-0">
          {body.locations?.length > 0 && <span>{body.locations.length} lieu{body.locations.length > 1 ? 'x' : ''}</span>}
          {body.moons?.length > 0 && <span>{body.moons.length} lune{body.moons.length > 1 ? 's' : ''}</span>}
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-space-400/15 pt-3">
          {/* Description */}
          {body.description && (
            <p className="text-xs text-slate-400">{body.description}</p>
          )}

          {/* Stats physiques */}
          {(body.temperature || body.dayLength) && (
            <div className="grid grid-cols-2 gap-2">
              {body.temperature?.min !== undefined && (
                <div className="p-2 rounded bg-space-900/50">
                  <div className="text-xs text-slate-600 mb-0.5">Température</div>
                  <div className="text-xs text-slate-300">{body.temperature.min}°C → {body.temperature.max}°C</div>
                </div>
              )}
              {body.dayLength && (
                <div className="p-2 rounded bg-space-900/50">
                  <div className="text-xs text-slate-600 mb-0.5">Durée du jour</div>
                  <div className="text-xs text-slate-300">{body.dayLength}h</div>
                </div>
              )}
            </div>
          )}

          {/* Ressources */}
          {body.resources?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs text-amber-400 font-medium">Ressources</span>
                {body.minableRating > 0 && <MinableBar rating={body.minableRating} />}
              </div>
              <div className="flex flex-wrap gap-1">
                {body.resources.map(r => (
                  <span key={r} className="badge bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Activités */}
          {body.activities?.length > 0 && (
            <div>
              <div className="text-xs text-cyan-400 font-medium mb-1.5">Activités</div>
              <div className="flex flex-wrap gap-1">
                {body.activities.map(a => (
                  <span key={a} className="badge badge-cyan text-xs">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Factions */}
          {body.factions?.length > 0 && (
            <div>
              <div className="text-xs text-purple-400 font-medium mb-1.5">Factions présentes</div>
              <div className="flex flex-wrap gap-1">
                {body.factions.map(f => (
                  <span key={f} className="badge bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Locations */}
          {body.locations?.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Emplacements</div>
              <div className="space-y-1">
                {body.locations.map(loc => (
                  <div key={loc.id} className="flex items-center gap-2 p-2 rounded bg-space-900/40">
                    <MapPin className="w-3 h-3 text-slate-600 flex-shrink-0" />
                    <span className="text-xs text-slate-300 flex-1">{loc.name}</span>
                    <span className="badge badge-slate text-xs">{loc.type}</span>
                    {loc.landingZone && <span className="badge bg-green-500/15 border-green-500/30 text-green-400 text-xs">ZA</span>}
                    {loc.legal === false && <span className="badge bg-red-500/10 border-red-500/20 text-red-400 text-xs">Illégal</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lunes */}
          {body.moons?.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Lunes ({body.moons.length})</div>
              <div className="space-y-2">
                {body.moons.map(moon => (
                  <div key={moon.id} className="p-2 rounded border border-space-400/10 bg-space-900/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-slate-600" />
                        <span className="text-xs font-medium text-slate-300">{moon.name}</span>
                        <span className="badge badge-slate text-xs">{moon.type}</span>
                      </div>
                      {moon.minableRating > 0 && <MinableBar rating={moon.minableRating} />}
                    </div>
                    <p className="text-xs text-slate-500 pl-5">{moon.atmosphere} • {moon.description}</p>
                    {moon.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 pl-5">
                        {moon.resources.map(r => (
                          <span key={r} className="badge bg-amber-500/10 text-amber-400 border-amber-500/20" style={{ fontSize: '9px', padding: '1px 5px' }}>{r}</span>
                        ))}
                      </div>
                    )}
                    {moon.locations?.length > 0 && (
                      <div className="mt-1.5 pl-5 space-y-0.5">
                        {moon.locations.map(loc => (
                          <div key={loc.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{loc.name}</span>
                            {loc.landingZone && <span className="badge bg-green-500/15 border-green-500/30 text-green-400" style={{ fontSize: '9px', padding: '1px 4px' }}>ZA</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SystemDetail ────────────────────────────────────────────
function SystemDetail({ system, onClose }) {
  const [tab, setTab] = useState('overview');

  const planets = (system.bodies || []).filter(b =>
    b.type !== 'Étoile' && b.type !== 'Étoile Mourante' && b.type !== 'Naine Blanche'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <StarDot color={system.starColor || '#888'} size={22} />
          <div>
            <h2 className="text-xl font-bold font-display text-white leading-tight">{system.name}</h2>
            <p className="text-xs text-slate-500">{system.type} • {system.starType}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost btn-sm p-1.5 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Danger */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={clsx('badge', STATUS_STYLES[system.status] || 'badge-slate')}>
          {system.accessible ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
          {system.status}
        </span>
        <DangerDots level={system.dangerLevel} />
        <span className={clsx('text-xs font-medium', SECURITY_COLORS[system.security] || 'text-slate-400')}>
          <Shield className="w-3 h-3 inline mr-1" />
          {system.security}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-space-400/20 pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
              tab === t.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Aperçu */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{system.description}</p>
          {system.lore && (
            <div className="p-3 rounded-lg bg-space-900/60 border border-space-400/15">
              <div className="text-xs font-medium text-cyan-400 mb-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Contexte & Lore
              </div>
              <p className="text-xs text-slate-400 italic">{system.lore}</p>
            </div>
          )}

          {system.notableFeatures?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Points Notables</div>
              <div className="space-y-1">
                {system.notableFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-cyan-500 mt-0.5">▸</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {system.jumpPoints?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Points de Saut ({system.jumpPoints.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {system.jumpPoints.map((jp, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
                    <Navigation className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs text-slate-300">{jp.system}</span>
                    {jp.difficulty && jp.difficulty !== 'Standard' && (
                      <span className="text-xs text-orange-400">— {jp.difficulty}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Planètes & Lunes */}
      {tab === 'bodies' && (
        <div className="space-y-2">
          {planets.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-6">Données non disponibles pour ce système.</p>
          ) : (
            planets.map(body => <BodyTree key={body.id} body={body} />)
          )}
        </div>
      )}

      {/* Tab: Stations */}
      {tab === 'stations' && (
        <div>
          {system.stations?.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-6">Aucune station répertoriée.</p>
          ) : (
            <div className="space-y-2">
              {(system.stations || []).map(station => (
                <div key={station.id} className={clsx(
                  'p-3 rounded-lg border',
                  station.legal === false
                    ? 'bg-red-500/5 border-red-500/15'
                    : 'bg-space-900/50 border-space-400/15'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium text-slate-300">{station.name}</span>
                          {station.legal === false && (
                            <span className="badge bg-red-500/10 border-red-500/20 text-red-400 text-xs">Illégal</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{station.type} • {station.body}</div>
                      </div>
                    </div>
                    {station.landingZone && (
                      <span className="badge bg-green-500/15 border-green-500/30 text-green-400 text-xs flex-shrink-0">Zone Att.</span>
                    )}
                  </div>
                  {station.services?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pl-5">
                      {station.services.map(s => (
                        <span key={s} className="badge badge-slate text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  {station.description && (
                    <p className="text-xs text-slate-500 mt-1.5 pl-5 italic">{station.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Factions & Économie */}
      {tab === 'factions' && (
        <div className="space-y-4">
          {system.dominantFactions?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Factions Dominantes</div>
              <div className="flex flex-wrap gap-2">
                {system.dominantFactions.map(f => (
                  <div key={f} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Users className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {system.economy?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Économie</div>
              <div className="flex flex-wrap gap-2">
                {system.economy.map(e => (
                  <div key={e} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Package className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs text-cyan-300">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!system.ueeControlled && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-red-400">Hors juridiction UEE</div>
                <p className="text-xs text-slate-400 mt-0.5">Ce système n\'est pas sous contrôle UEE. Les crimes commis ici ne génèrent pas de CrimeStat et les assurances peuvent ne pas couvrir certains sinistres.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────
export default function StarSystems() {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(true);

  const filtered = useMemo(() => {
    let list = showAll ? STAR_SYSTEMS_DATA : STAR_SYSTEMS_DATA.filter(s => s.accessible);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.economy?.some(e => e.toLowerCase().includes(q)) ||
        s.dominantFactions?.some(f => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, showAll]);

  const accessibleCount = STAR_SYSTEMS_DATA.filter(s => s.accessible).length;

  const handleSelect = (system) => {
    setSelectedSystem(prev => prev?.id === system.id ? null : system);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="page-title text-gradient-cyan">Systèmes Stellaires</h1>
          <p className="page-subtitle">
            {STAR_SYSTEMS_DATA.length} systèmes répertoriés •{' '}
            <span className="text-green-400 font-medium">{accessibleCount} accessibles</span>{' '}
            en Alpha 4.0
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/systemes/planetes')} className="btn-secondary btn-sm gap-1.5">
            <Navigation className="w-3.5 h-3.5" /> Planètes
          </button>
          <button onClick={() => navigate('/systemes/stations')} className="btn-secondary btn-sm gap-1.5">
            <Building className="w-3.5 h-3.5" /> Stations
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Systèmes Accessibles', value: accessibleCount, color: 'text-green-400', bg: 'border-green-500/20' },
          { label: 'Systèmes Prévus', value: STAR_SYSTEMS_DATA.length - accessibleCount, color: 'text-yellow-400', bg: 'border-yellow-500/20' },
          { label: 'Corps Célestes', value: STAR_SYSTEMS_DATA.flatMap(s => s.bodies || []).filter(b => b.type !== 'Étoile' && b.type !== 'Étoile Mourante' && b.type !== 'Naine Blanche').length, color: 'text-cyan-400', bg: 'border-cyan-500/20' },
          { label: 'Zones d\'Atterrissage', value: STAR_SYSTEMS_DATA.filter(s => s.accessible).flatMap(s => [
            ...(s.stations || []).filter(st => st.landingZone),
            ...(s.bodies || []).flatMap(b => [
              ...(b.locations || []).filter(l => l.landingZone),
              ...(b.moons || []).flatMap(m => (m.locations || []).filter(l => l.landingZone)),
            ]),
          ]).length, color: 'text-purple-400', bg: 'border-purple-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={clsx('card p-3 text-center border', bg)}>
            <div className={clsx('text-2xl font-bold font-display', color)}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un système, faction, économie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-space-700/50 border border-space-400/20">
          <button
            onClick={() => setShowAll(false)}
            className={clsx('px-3 py-1.5 rounded text-xs font-medium transition-colors',
              !showAll ? 'bg-green-500/20 text-green-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            Accessibles
          </button>
          <button
            onClick={() => setShowAll(true)}
            className={clsx('px-3 py-1.5 rounded text-xs font-medium transition-colors',
              showAll ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            Tous
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grille systèmes */}
        <div className={clsx(selectedSystem ? 'lg:col-span-2' : 'lg:col-span-3')}>
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun système trouvé</p>
            </div>
          ) : (
            <div className={clsx(
              'grid gap-4',
              selectedSystem ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
            )}>
              {filtered.map(system => (
                <SystemCard
                  key={system.id}
                  system={system}
                  selected={selectedSystem?.id === system.id}
                  onClick={handleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panneau détail */}
        {selectedSystem && (
          <div className="card p-5 overflow-y-auto max-h-[85vh] scroll-container">
            <SystemDetail
              system={selectedSystem}
              onClose={() => setSelectedSystem(null)}
            />
          </div>
        )}
      </div>

      {/* Avertissement systèmes en développement */}
      <div className="card p-4 border-yellow-500/15 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-400">Systèmes en Développement</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Terra, Magnus, Hades, Castra et les autres systèmes de l'UEE sont en développement actif. Les données présentées sont préliminaires et basées sur le lore officiel de Star Citizen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
