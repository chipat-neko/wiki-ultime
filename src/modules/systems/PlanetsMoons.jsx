import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { STAR_SYSTEMS_DATA } from '../../datasets/systems.js';
import { MINING_BODIES, MINERALS, METHOD_LABELS } from '../../datasets/miningData.js';
import {
  Navigation, Star, MapPin, Filter, Gem, Globe, ChevronDown, ChevronRight,
  Thermometer, Shield, Search, AlertTriangle, Layers, ExternalLink,
  Clock, Fuel, Rocket, Calculator, Info,
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

// ─── Distances approximatives en Gm entre corps principaux (lore SC-friendly) ──
// Organisées par système. Les distances sont des valeurs médianes approximatives.
const BODY_DISTANCES_GM = {
  // Stanton — distances en Gm depuis l'étoile
  hurston:   { orbitGm: 130,  system: 'Stanton', name: 'Hurston' },
  arial:     { orbitGm: 133,  system: 'Stanton', name: 'Arial (lune Hurston)' },
  aberdeen:  { orbitGm: 134,  system: 'Stanton', name: 'Aberdeen (lune Hurston)' },
  magda:     { orbitGm: 136,  system: 'Stanton', name: 'Magda (lune Hurston)' },
  ita:       { orbitGm: 138,  system: 'Stanton', name: 'Ita (lune Hurston)' },
  crusader:  { orbitGm: 210,  system: 'Stanton', name: 'Crusader' },
  cellin:    { orbitGm: 213,  system: 'Stanton', name: 'Cellin (lune Crusader)' },
  daymar:    { orbitGm: 215,  system: 'Stanton', name: 'Daymar (lune Crusader)' },
  yela:      { orbitGm: 218,  system: 'Stanton', name: 'Yela (lune Crusader)' },
  arccorp:   { orbitGm: 315,  system: 'Stanton', name: 'ArcCorp' },
  lyria:     { orbitGm: 317,  system: 'Stanton', name: 'Lyria (lune ArcCorp)' },
  wala:      { orbitGm: 319,  system: 'Stanton', name: 'Wala (lune ArcCorp)' },
  microtech: { orbitGm: 475,  system: 'Stanton', name: 'microTech' },
  calliope:  { orbitGm: 477,  system: 'Stanton', name: 'Calliope (lune microTech)' },
  clio:      { orbitGm: 479,  system: 'Stanton', name: 'Clio (lune microTech)' },
  euterpe:   { orbitGm: 481,  system: 'Stanton', name: 'Euterpe (lune microTech)' },
  // Pyro — distances en Gm depuis l'étoile Pyro
  pyro1:     { orbitGm: 80,   system: 'Pyro', name: 'Monox (Pyro I)' },
  monox:     { orbitGm: 80,   system: 'Pyro', name: 'Monox (Pyro I)' },
  pyro2:     { orbitGm: 155,  system: 'Pyro', name: 'Ignis (Pyro II)' },
  ignis:     { orbitGm: 155,  system: 'Pyro', name: 'Ignis (Pyro II)' },
  pyro3:     { orbitGm: 240,  system: 'Pyro', name: 'Vuur (Pyro III)' },
  vuur:      { orbitGm: 240,  system: 'Pyro', name: 'Vuur (Pyro III)' },
  pyro4:     { orbitGm: 345,  system: 'Pyro', name: 'Bloom (Pyro IV)' },
  bloom:     { orbitGm: 345,  system: 'Pyro', name: 'Bloom (Pyro IV)' },
  pyro5:     { orbitGm: 440,  system: 'Pyro', name: 'Fuego (Pyro V)' },
  fuego:     { orbitGm: 440,  system: 'Pyro', name: 'Fuego (Pyro V)' },
  pyro6:     { orbitGm: 580,  system: 'Pyro', name: 'Adir (Pyro VI)' },
  adir:      { orbitGm: 580,  system: 'Pyro', name: 'Adir (Pyro VI)' },
};

// JP Stanton→Pyro : ~50 min de voyage + transit
const JP_TIME_MIN = 50;

function distanceGm(a, b) {
  // Retourne { distGm, crossSystem }
  if (!a || !b) return { distGm: 0, crossSystem: false };
  if (a.system !== b.system) {
    // Distance inter-système = traversée du JP ~distance arbitraire 1500 Gm symbolique
    return { distGm: Math.abs(a.orbitGm - b.orbitGm) + 1200, crossSystem: true };
  }
  return { distGm: Math.abs(a.orbitGm - b.orbitGm), crossSystem: false };
}

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

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

            {body.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-slate-400">{body.description}</p>
              </div>
            )}

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

// ─── Onglet 2 : Calculateur de Voyage ─────────────────────────────────────────

// Construire la liste complète des corps pour les sélecteurs
function buildAllBodiesForCalc() {
  const bodies = [];
  STAR_SYSTEMS_DATA.forEach(system => {
    if (!system.accessible) return;
    (system.bodies || []).forEach(body => {
      if (body.type === 'Étoile') return;
      bodies.push({ id: body.id, name: body.name, system: system.name, type: body.type });
      (body.moons || []).forEach(moon => {
        bodies.push({ id: moon.id, name: moon.name, system: system.name, type: 'Lune', parent: body.name });
      });
    });
  });
  return bodies;
}

const CALC_BODIES = buildAllBodiesForCalc();

// Recommandations de vaisseau par distance
const SHIP_RECOMMENDATIONS = [
  { maxGm: 100,  ship: 'N\'importe quel vaisseau', reason: 'Courte distance — trajet local rapide.' },
  { maxGm: 300,  ship: 'Vaisseau standard', reason: 'Distance moyenne — réservoir de QT standard suffisant.' },
  { maxGm: 600,  ship: 'Hull C / Mercury Star Runner', reason: 'Grande distance — bon réservoir QT recommandé.' },
  { maxGm: 99999, ship: 'Corsair / Carrack / 600i', reason: 'Très grande distance — vaisseau avec réservoir QT maximal conseillé.' },
];

function TravelCalculator() {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [qtSpeed, setQtSpeed] = useState(130000);
  const [scmSpeed, setScmSpeed] = useState(1200);

  const result = useMemo(() => {
    if (!departure || !destination || departure === destination) return null;
    const depData = BODY_DISTANCES_GM[departure];
    const dstData = BODY_DISTANCES_GM[destination];
    if (!depData || !dstData) return null;

    const { distGm, crossSystem } = distanceGm(depData, dstData);
    const distKm = distGm * 1_000_000; // 1 Gm = 1,000,000 km
    const qtTimeS = distKm / qtSpeed;
    const jpTimeS = crossSystem ? JP_TIME_MIN * 60 : 0;
    const totalTimeS = qtTimeS + jpTimeS;

    // Carburant QT estimé : ~0.6% par segment, +1% si cross-system
    const fuelPct = crossSystem
      ? parseFloat((distGm / 1000 * 1.5).toFixed(1))
      : parseFloat((distGm / 1000 * 0.8).toFixed(1));

    const rec = SHIP_RECOMMENDATIONS.find(r => distGm <= r.maxGm) || SHIP_RECOMMENDATIONS[SHIP_RECOMMENDATIONS.length - 1];

    return { distGm, distKm, qtTimeS, jpTimeS, totalTimeS, fuelPct, crossSystem, rec };
  }, [departure, destination, qtSpeed]);

  const depInfo = departure ? BODY_DISTANCES_GM[departure] : null;
  const dstInfo = destination ? BODY_DISTANCES_GM[destination] : null;

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          Calculateur de Voyage QT
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Départ */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Corps de Départ</label>
            <select value={departure} onChange={e => setDeparture(e.target.value)} className="select w-full">
              <option value="">— Sélectionner —</option>
              {['Stanton', 'Pyro'].map(sys => (
                <optgroup key={sys} label={`Système ${sys}`}>
                  {CALC_BODIES.filter(b => b.system === sys).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}{b.parent ? ` (lune de ${b.parent})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {/* Destination */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Corps de Destination</label>
            <select value={destination} onChange={e => setDestination(e.target.value)} className="select w-full">
              <option value="">— Sélectionner —</option>
              {['Stanton', 'Pyro'].map(sys => (
                <optgroup key={sys} label={`Système ${sys}`}>
                  {CALC_BODIES.filter(b => b.system === sys && b.id !== departure).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}{b.parent ? ` (lune de ${b.parent})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {/* Vitesse QT */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Vitesse QT (km/s) — standard : 130 000
            </label>
            <input
              type="number"
              value={qtSpeed}
              onChange={e => setQtSpeed(Math.max(10000, Number(e.target.value)))}
              className="input w-full"
              min={10000}
              max={500000}
              step={5000}
            />
          </div>
          {/* Vitesse SCM */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Vitesse SCM (m/s) — standard : 1 200
            </label>
            <input
              type="number"
              value={scmSpeed}
              onChange={e => setScmSpeed(Math.max(100, Number(e.target.value)))}
              className="input w-full"
              min={100}
              max={5000}
              step={100}
            />
          </div>
        </div>
      </div>

      {/* Résultats */}
      {result ? (
        <div className="space-y-4">
          {/* Route header */}
          <div className="card p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">{depInfo?.name}</span>
                <span className={clsx('text-xs', SYSTEM_COLORS[depInfo?.system] || 'text-slate-500')}>{depInfo?.system}</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-1 text-slate-600 text-xs">
                <div className="flex-1 border-t border-dashed border-space-400/30" />
                <Navigation className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 border-t border-dashed border-space-400/30" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-200">{dstInfo?.name}</span>
                <span className={clsx('text-xs', SYSTEM_COLORS[dstInfo?.system] || 'text-slate-500')}>{dstInfo?.system}</span>
              </div>
            </div>
            {result.crossSystem && (
              <span className="badge badge-orange text-xs">Traversée inter-système via Jump Point</span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="text-xl font-bold text-cyan-400 font-display">
                {result.distGm < 10 ? result.distGm.toFixed(1) : Math.round(result.distGm)} Gm
              </div>
              <div className="text-xs text-slate-500 mt-1">Distance estimée</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xl font-bold text-warning-400 font-display">
                {formatDuration(result.totalTimeS)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Durée totale</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xl font-bold text-blue-400 font-display">
                {formatDuration(result.qtTimeS)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Temps QT pur</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xl font-bold text-success-400 font-display">
                ~{result.fuelPct}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Carburant QT estimé</div>
            </div>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.crossSystem && (
              <div className="card p-4 border border-orange-500/20">
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-orange-400" /> Traversée Jump Point
                </div>
                <p className="text-sm text-slate-300">
                  Ce trajet nécessite de traverser le Jump Point <span className="text-orange-400 font-medium">Stanton ↔ Pyro</span>.
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  Temps supplémentaire estimé : <span className="text-orange-400">{JP_TIME_MIN} minutes</span> (approche JP + transit).
                </p>
              </div>
            )}
            <div className="card p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Rocket className="w-3 h-3 text-cyan-400" /> Recommandation vaisseau
              </div>
              <p className="text-sm font-medium text-cyan-400">{result.rec.ship}</p>
              <p className="text-xs text-slate-500 mt-1">{result.rec.reason}</p>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Informations
              </div>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Distance en km</span>
                  <span className="text-slate-300">{(result.distKm / 1_000_000).toFixed(2)} millions km</span>
                </div>
                <div className="flex justify-between">
                  <span>Vitesse QT utilisée</span>
                  <span className="text-slate-300">{qtSpeed.toLocaleString()} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Vitesse SCM</span>
                  <span className="text-slate-300">{scmSpeed.toLocaleString()} m/s</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 italic">
                * Distances basées sur les valeurs orbitales lore SC. Les temps réels peuvent varier.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <Calculator className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Sélectionnez un départ et une destination pour calculer le trajet</p>
          <p className="text-xs text-slate-600 mt-1">Les distances sont approximatives basées sur les orbites lore de Star Citizen</p>
        </div>
      )}

      {/* Tableau de référence des distances */}
      <div className="card p-4">
        <h3 className="section-title mb-3 text-sm flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" /> Distances de référence (Stanton)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left py-2 pr-4 text-slate-500 font-medium">Corps</th>
                <th className="text-right py-2 px-2 text-slate-500 font-medium">Orbite (Gm)</th>
                <th className="text-right py-2 px-2 text-slate-500 font-medium hidden sm:table-cell">~Lorville</th>
                <th className="text-right py-2 pl-2 text-slate-500 font-medium hidden sm:table-cell">~New Babbage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-400/10">
              {[
                { id: 'hurston', label: 'Hurston' },
                { id: 'crusader', label: 'Crusader' },
                { id: 'arccorp', label: 'ArcCorp' },
                { id: 'microtech', label: 'microTech' },
                { id: 'daymar', label: 'Daymar' },
                { id: 'lyria', label: 'Lyria' },
                { id: 'clio', label: 'Clio' },
              ].map(({ id, label }) => {
                const d = BODY_DISTANCES_GM[id];
                const hurston = BODY_DISTANCES_GM['hurston'];
                const microtech = BODY_DISTANCES_GM['microtech'];
                if (!d) return null;
                return (
                  <tr key={id} className="hover:bg-space-700/10">
                    <td className="py-2 pr-4 text-slate-300">{label}</td>
                    <td className="py-2 px-2 text-right text-cyan-400 font-mono">{d.orbitGm}</td>
                    <td className="py-2 px-2 text-right text-slate-400 font-mono hidden sm:table-cell">
                      {Math.abs(d.orbitGm - hurston.orbitGm)} Gm
                    </td>
                    <td className="py-2 pl-2 text-right text-slate-400 font-mono hidden sm:table-cell">
                      {Math.abs(d.orbitGm - microtech.orbitGm)} Gm
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet 3 : Ressources par Corps ──────────────────────────────────────────

const DANGER_LABELS = {
  low:    { label: 'Faible',  color: 'text-success-400', badge: 'badge-green' },
  medium: { label: 'Moyen',   color: 'text-warning-400', badge: 'badge-yellow' },
  high:   { label: 'Élevé',   color: 'text-danger-400',  badge: 'badge-red' },
};

function ResourceFinder() {
  const [query, setQuery] = useState('');
  const [safeOnly, setSafeOnly] = useState(false);
  const [methodFilter, setMethodFilter] = useState(''); // 'ship' | 'roc' | 'hand' | ''

  // Construire index minéral → corps
  const mineralIndex = useMemo(() => {
    const index = {}; // mineralId → [{ body, methods: [] }]
    MINING_BODIES.forEach(body => {
      const methods = [
        body.ship?.length ? 'ship' : null,
        body.roc?.length  ? 'roc'  : null,
        body.hand?.length ? 'hand' : null,
      ].filter(Boolean);

      const allMinerals = [
        ...body.ship.map(m => ({ id: m, method: 'ship' })),
        ...body.roc.map(m =>  ({ id: m, method: 'roc'  })),
        ...body.hand.map(m => ({ id: m, method: 'hand' })),
      ];

      allMinerals.forEach(({ id: mId, method }) => {
        if (!index[mId]) index[mId] = [];
        const existing = index[mId].find(e => e.body.id === body.id);
        if (existing) {
          if (!existing.methods.includes(method)) existing.methods.push(method);
        } else {
          index[mId].push({ body, methods: [method] });
        }
      });
    });
    return index;
  }, []);

  // Liste de tous les minéraux avec nom pour la recherche
  const allMinerals = useMemo(() =>
    Object.values(MINERALS).map(m => ({ ...m })),
  []);

  const matchedMinerals = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allMinerals.filter(m =>
      m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    );
  }, [query, allMinerals]);

  const results = useMemo(() => {
    if (matchedMinerals.length === 0) return [];
    return matchedMinerals.map(mineral => {
      let bodies = mineralIndex[mineral.id] || [];
      if (safeOnly) bodies = bodies.filter(e => e.body.danger === 'low');
      if (methodFilter) bodies = bodies.filter(e => e.methods.includes(methodFilter));
      // Sort: low danger first, then by system
      bodies = [...bodies].sort((a, b) => {
        const dOrder = { low: 0, medium: 1, high: 2 };
        return (dOrder[a.body.danger] || 1) - (dOrder[b.body.danger] || 1);
      });
      return { mineral, bodies };
    });
  }, [matchedMinerals, mineralIndex, safeOnly, methodFilter]);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Gem className="w-4 h-4 text-warning-400" />
          Trouveur de Ressources
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Nom d'un minéral (ex: Quantanium, Agricium, Bexalite…)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input pl-8 w-full"
              autoFocus
            />
          </div>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="select w-auto">
            <option value="">Toutes méthodes</option>
            <option value="ship">Vaisseau mineur</option>
            <option value="roc">ROC (véhicule)</option>
            <option value="hand">Main (multitool)</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
            <input
              type="checkbox"
              checked={safeOnly}
              onChange={e => setSafeOnly(e.target.checked)}
              className="accent-success-500"
            />
            <Shield className="w-3.5 h-3.5 text-success-400" />
            Zones sûres uniquement
          </label>
        </div>

        {/* Suggestions de recherche */}
        {!query && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-600">Populaires :</span>
            {['Quantanium', 'Bexalite', 'Agricium', 'Laranite', 'Taranite', 'Hadanite', 'Stileron'].map(name => (
              <button
                key={name}
                onClick={() => setQuery(name)}
                className="text-xs px-2 py-0.5 rounded-full bg-space-700 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Résultats */}
      {query && results.length === 0 && (
        <div className="card p-10 text-center">
          <Gem className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun minéral trouvé pour « {query} »</p>
          <p className="text-xs text-slate-600 mt-1">Essayez avec un nom partiel (ex: "quant" pour Quantanium)</p>
        </div>
      )}

      {results.map(({ mineral, bodies }) => (
        <div key={mineral.id} className="card overflow-hidden">
          {/* Mineral header */}
          <div className={clsx('p-4 border-b border-space-400/15 flex items-center gap-3', mineral.bg)}>
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', mineral.bg)}>
              <Gem className={clsx('w-4 h-4', mineral.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={clsx('font-bold', mineral.color)}>{mineral.name}</span>
                <span className={clsx(
                  'badge text-xs',
                  mineral.rarity === 'legendary' ? 'badge-yellow' :
                  mineral.rarity === 'rare'      ? 'badge-blue' :
                  mineral.rarity === 'uncommon'  ? 'badge-green' : 'badge-slate'
                )}>
                  {mineral.rarity === 'legendary' ? 'Légendaire' :
                   mineral.rarity === 'rare'      ? 'Rare' :
                   mineral.rarity === 'uncommon'  ? 'Peu commun' : 'Commun'}
                </span>
                <span className="text-xs text-slate-500">
                  {mineral.value} aUEC/unité
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {bodies.length} corps trouvé{bodies.length > 1 ? 's' : ''}
                {safeOnly ? ' (zones sûres)' : ''}
                {methodFilter ? ` — méthode ${METHOD_LABELS[methodFilter]?.short}` : ''}
              </div>
            </div>
          </div>

          {/* Body list */}
          {bodies.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Aucun corps ne correspond aux filtres actifs.
              {safeOnly && <span className="block text-xs mt-1">Essayez sans le filtre "zones sûres".</span>}
            </div>
          ) : (
            <div className="divide-y divide-space-400/10">
              {bodies.map(({ body, methods }) => {
                const dInfo = DANGER_LABELS[body.danger] || DANGER_LABELS.medium;
                return (
                  <div key={body.id} className="p-3 flex items-center gap-3 hover:bg-space-700/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-200">{body.name}</span>
                        <span className={clsx('badge text-xs', body.system === 'Pyro' ? 'badge-orange' : 'badge-cyan')}>
                          {body.system}
                        </span>
                        {body.parent && (
                          <span className="text-xs text-slate-600">lune de {body.parent}</span>
                        )}
                      </div>
                      {body.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{body.notes}</p>
                      )}
                    </div>
                    {/* Méthodes disponibles */}
                    <div className="flex flex-wrap gap-1 justify-end">
                      {methods.map(m => {
                        const ml = METHOD_LABELS[m];
                        return (
                          <span key={m} className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', ml.bg, ml.color)}>
                            {ml.icon} {ml.short}
                          </span>
                        );
                      })}
                    </div>
                    {/* Danger */}
                    <span className={clsx('badge text-xs flex-shrink-0', dInfo.badge)}>
                      {dInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Guide de référence minéraux */}
      {!query && (
        <div className="card p-4">
          <h3 className="section-title mb-3 text-sm flex items-center gap-2">
            <Gem className="w-3.5 h-3.5 text-warning-400" /> Tous les Minéraux (référence)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.values(MINERALS).sort((a, b) => b.value - a.value).map(mineral => (
              <button
                key={mineral.id}
                onClick={() => setQuery(mineral.name)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-space-700/30 transition-colors text-left group"
              >
                <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', mineral.bg, 'border', mineral.border)} />
                <span className={clsx('text-xs font-medium group-hover:text-slate-200 transition-colors', mineral.color)}>{mineral.name}</span>
                <span className="text-xs text-slate-600 ml-auto">{mineral.value} aUEC</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'exploration', label: 'Exploration',          icon: Globe },
  { id: 'travel',     label: 'Calculateur de Voyage', icon: Navigation },
  { id: 'resources',  label: 'Ressources par Corps',  icon: Gem },
];

export default function PlanetsMoons() {
  const [activeTab, setActiveTab] = useState('exploration');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMinable, setFilterMinable] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const allBodies = useMemo(() => {
    const bodies = [];
    STAR_SYSTEMS_DATA.forEach(system => {
      (system.bodies || []).forEach(body => {
        if (body.type === 'Étoile') return;
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
        <p className="page-subtitle">
          {activeTab === 'exploration'
            ? `${filtered.length} / ${allBodies.length} corps célestes — Stanton & Pyro`
            : activeTab === 'travel'
            ? 'Calculez le temps de trajet entre corps célestes'
            : 'Trouvez où miner vos ressources'
          }
        </p>
      </div>

      {/* Stats (exploration seulement) */}
      {activeTab === 'exploration' && (
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
      )}

      {/* Onglets */}
      <div className="flex gap-1 border-b border-space-400/20 pb-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300',
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu selon onglet */}
      {activeTab === 'exploration' && (
        <>
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
        </>
      )}

      {activeTab === 'travel' && <TravelCalculator />}
      {activeTab === 'resources' && <ResourceFinder />}
    </div>
  );
}
