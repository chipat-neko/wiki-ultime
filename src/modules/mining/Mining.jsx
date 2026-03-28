import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Gem, Globe, Filter, ChevronDown, ChevronUp, AlertTriangle, Leaf, Info, ShoppingCart, Wrench, FlaskConical, Zap, Package, Rocket, Calculator, MapPin, Star, Search, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useLiveMining } from '../../hooks/useLiveData.js';
import {
  MINERALS,
  MINING_BODIES,
  HARVESTABLES,
  ORE_BUYERS,
  RARITY_LABELS,
  METHOD_LABELS,
  findMineralLocations,
  getMineralsSorted,
  MINING_LASERS,
  MINING_CONSUMABLES,
  MINING_MODULES,
  MINING_SHIPS,
  MINING_DEPOSITS,
} from '../../datasets/miningData.js';
import { COMMODITIES } from '../../datasets/commodities.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DANGER_STYLES = {
  low:    { label: 'Faible',  color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700/40' },
  medium: { label: 'Moyen',   color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/40' },
  high:   { label: 'Élevé',   color: 'text-red-400',    bg: 'bg-red-900/30',    border: 'border-red-700/40'   },
};

const SYSTEMS = ['Tous', 'Stanton', 'Pyro'];
const METHODS = ['Tous', 'ship', 'roc', 'hand'];
const RARITIES = ['Tous', 'common', 'uncommon', 'rare', 'legendary'];
const VIEWS = [
  { id: 'mineral',   label: 'Par Minéral',         icon: Gem          },
  { id: 'body',      label: 'Par Corps Céleste',    icon: Globe        },
  { id: 'deposits',  label: 'Dépôts',               icon: MapPin       },
  { id: 'harvest',   label: 'Harvestables',         icon: Leaf         },
  { id: 'equipment', label: 'Lasers & Équipement',  icon: Zap          },
  { id: 'ships',     label: 'Vaisseaux Mineurs',    icon: Rocket       },
  { id: 'sell',      label: 'Où Vendre',            icon: ShoppingCart },
  { id: 'refining',  label: 'Raffinage',            icon: FlaskConical },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MineralIcon({ mineral }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className={clsx('w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 overflow-hidden', mineral.bg, mineral.border)}>
      {!imgError && mineral.imageUrl ? (
        <img src={mineral.imageUrl} alt={mineral.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <Gem className={clsx('w-4 h-4', mineral.color)} />
      )}
    </div>
  );
}

function MethodBadge({ method, small }) {
  const m = METHOD_LABELS[method];
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full font-medium',
      small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      m.bg, m.color,
    )}>
      <span>{m.icon}</span>
      <span>{m.short}</span>
    </span>
  );
}

function RarityBadge({ rarity }) {
  const r = RARITY_LABELS[rarity];
  return (
    <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium', r.bg, r.color)}>
      {r.label}
    </span>
  );
}

function DangerBadge({ danger }) {
  const d = DANGER_STYLES[danger];
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium', d.bg, d.color)}>
      <AlertTriangle className="w-3 h-3" />
      {d.label}
    </span>
  );
}

// ─── View: By Mineral ────────────────────────────────────────────────────────

function MineralView({ systemFilter, methodFilter, rarityFilter, search, livePriceMap }) {
  const [selected, setSelected] = useState(null);
  const q = search?.toLowerCase() || '';

  const minerals = useMemo(() => {
    return getMineralsSorted().filter(m => {
      if (q && !m.name.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q)) return false;
      if (rarityFilter !== 'Tous' && m.rarity !== rarityFilter) return false;
      if (methodFilter !== 'Tous' || systemFilter !== 'Tous') {
        const locs = findMineralLocations(m.id);
        const filtered = locs.filter(({ body, methods }) => {
          const sysOk = systemFilter === 'Tous' || body.system === systemFilter;
          const methOk = methodFilter === 'Tous' || methods.includes(methodFilter);
          return sysOk && methOk;
        });
        if (filtered.length === 0) return false;
      }
      return true;
    });
  }, [systemFilter, methodFilter, rarityFilter, q]);

  return (
    <div className="space-y-3">
      {minerals.map(mineral => {
        const locs = findMineralLocations(mineral.id).filter(({ body, methods }) => {
          const sysOk = systemFilter === 'Tous' || body.system === systemFilter;
          const methOk = methodFilter === 'Tous' || methods.includes(methodFilter);
          return sysOk && methOk;
        });
        const isOpen = selected === mineral.id;

        return (
          <div key={mineral.id} className={clsx('card overflow-hidden border', mineral.border)}>
            {/* Header */}
            <button
              onClick={() => setSelected(isOpen ? null : mineral.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MineralIcon mineral={mineral} />
                <div className="text-left">
                  <div className={clsx('font-semibold', mineral.color)}>{mineral.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RarityBadge rarity={mineral.rarity} />
                    <span className="text-xs text-slate-500">{locs.length} lieu{locs.length > 1 ? 'x' : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  {livePriceMap && livePriceMap[mineral.id] != null ? (
                    <>
                      <div className="text-sm font-bold text-cyan-400">{livePriceMap[mineral.id].toFixed(2)} aUEC/u</div>
                      <div className="text-xs text-slate-500">Live — <span className="line-through">{mineral.value.toFixed(2)}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-yellow-400">{mineral.value.toFixed(2)} aUEC/u</div>
                      <div className="text-xs text-slate-500">Valeur de base</div>
                    </>
                  )}
                </div>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </div>
            </button>

            {/* Expanded locations */}
            {isOpen && (
              <div className="border-t border-space-400/20 p-4 space-y-2">
                <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">
                  Lieux de minage
                </div>
                {locs.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Aucun lieu disponible avec les filtres actuels.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {locs.map(({ body, methods }) => (
                      <div key={body.id} className="rounded-lg border border-space-400/20 bg-space-700/40 p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-white">{body.name}</span>
                            {body.parent && (
                              <span className="text-xs text-slate-500 ml-1">({body.parent})</span>
                            )}
                          </div>
                          <span className={clsx(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            body.system === 'Pyro' ? 'text-orange-400 bg-orange-900/30' : 'text-cyan-400 bg-cyan-900/30'
                          )}>
                            {body.system}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {methods.map(m => <MethodBadge key={m} method={m} small />)}
                        </div>
                        <DangerBadge danger={body.danger} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {minerals.length === 0 && (
        <div className="card p-8 text-center text-slate-400">Aucun minéral correspondant aux filtres.</div>
      )}
    </div>
  );
}

// ─── View: By Body ────────────────────────────────────────────────────────────

function BodyView({ systemFilter, search }) {
  const [selected, setSelected] = useState(null);
  const q = search?.toLowerCase() || '';

  const bodies = useMemo(() => {
    return MINING_BODIES.filter(b => {
      if (systemFilter !== 'Tous' && b.system !== systemFilter) return false;
      if (q) {
        const nameMatch = b.name.toLowerCase().includes(q) || (b.parent && b.parent.toLowerCase().includes(q));
        const mineralMatch = [...b.ship, ...b.roc, ...b.hand].some(id => {
          const m = MINERALS[id];
          return m && (m.name.toLowerCase().includes(q) || id.toLowerCase().includes(q));
        });
        if (!nameMatch && !mineralMatch) return false;
      }
      return true;
    });
  }, [systemFilter, q]);

  // Group by system
  const grouped = useMemo(() => {
    const groups = {};
    for (const b of bodies) {
      if (!groups[b.system]) groups[b.system] = [];
      groups[b.system].push(b);
    }
    return groups;
  }, [bodies]);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([system, list]) => (
        <div key={system}>
          <h3 className={clsx(
            'text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2',
            system === 'Pyro' ? 'text-orange-400' : 'text-cyan-400'
          )}>
            <Globe className="w-4 h-4" />
            Système {system}
          </h3>
          <div className="space-y-2">
            {list.map(body => {
              const isOpen = selected === body.id;
              const totalMinerals = new Set([...body.ship, ...body.roc, ...body.hand]).size;

              return (
                <div key={body.id} className="card overflow-hidden">
                  <button
                    onClick={() => setSelected(isOpen ? null : body.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0',
                        body.type === 'planet' ? 'bg-blue-900/30 border-blue-700/40' : 'bg-slate-800/30 border-slate-600/40'
                      )}>
                        <Globe className={clsx('w-4 h-4', body.type === 'planet' ? 'text-blue-400' : 'text-slate-400')} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {body.name}
                          <span className="text-xs text-slate-500 font-normal capitalize">{body.type}</span>
                        </div>
                        {body.parent && (
                          <div className="text-xs text-slate-500">Lune de {body.parent}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-white">{totalMinerals} minéral{totalMinerals > 1 ? 'x' : ''}</div>
                        <DangerBadge danger={body.danger} />
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-space-400/20 p-4 space-y-4">
                      <p className="text-sm text-slate-400">{body.description}</p>

                      {/* Methods breakdown */}
                      {[
                        { key: 'ship', minerals: body.ship },
                        { key: 'roc',  minerals: body.roc  },
                        { key: 'hand', minerals: body.hand },
                      ].filter(({ minerals }) => minerals.length > 0).map(({ key, minerals }) => (
                        <div key={key}>
                          <div className="flex items-center gap-2 mb-2">
                            <MethodBadge method={key} />
                          </div>
                          <div className="flex flex-wrap gap-1.5 ml-1">
                            {minerals.map(mId => {
                              const m = MINERALS[mId];
                              if (!m) return null;
                              return (
                                <span key={mId} className={clsx(
                                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                                  m.bg, m.color, m.border
                                )}>
                                  <Gem className="w-3 h-3" />
                                  {m.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Harvestables */}
                      {body.harvestables.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                              <Leaf className="w-3 h-3" />
                              Harvestables
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 ml-1">
                            {body.harvestables.map(hId => {
                              const h = HARVESTABLES[hId];
                              if (!h) return null;
                              return (
                                <span key={hId} className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-700/30">
                                  {h.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {body.notes && (
                        <div className="flex items-start gap-2 text-xs text-slate-400 bg-space-700/40 rounded-lg p-3 border border-space-400/20">
                          <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          {body.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── View: Harvestables ───────────────────────────────────────────────────────

function HarvestView({ systemFilter, search }) {
  const q = search?.toLowerCase() || '';
  const bodies = useMemo(() => {
    return MINING_BODIES.filter(b => {
      if (b.harvestables.length === 0) return false;
      if (systemFilter !== 'Tous' && b.system !== systemFilter) return false;
      if (q) {
        const nameMatch = b.name.toLowerCase().includes(q) || (b.parent && b.parent.toLowerCase().includes(q));
        const harvMatch = b.harvestables.some(hId => {
          const h = HARVESTABLES[hId];
          return h && h.name.toLowerCase().includes(q);
        });
        if (!nameMatch && !harvMatch) return false;
      }
      return true;
    });
  }, [systemFilter, q]);

  // Build per-harvestable data
  const harvestableMap = useMemo(() => {
    const map = {};
    for (const body of bodies) {
      for (const hId of body.harvestables) {
        if (!map[hId]) map[hId] = [];
        map[hId].push(body);
      }
    }
    return map;
  }, [bodies]);

  return (
    <div className="space-y-4">
      <div className="card p-4 border border-green-700/30 bg-green-900/10">
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-300 mb-1">Qu'est-ce qu'un Harvestable ?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Les harvestables sont des ressources récoltables à la main (plantes, champignons, débris organiques)
              sans équipement de minage. Ils sont souvent nécessaires pour des missions de livraison ou des crafting recipes.
              Utilisez le <strong className="text-white">multitool</strong> avec l'attachment de récolte.
            </p>
          </div>
        </div>
      </div>

      {bodies.length === 0 ? (
        <div className="card p-8 text-center text-slate-400">
          Aucun harvestable disponible pour ce système.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bodies.map(body => (
            <div key={body.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-white">{body.name}</span>
                  {body.parent && <span className="text-xs text-slate-500 ml-1">(Lune de {body.parent})</span>}
                </div>
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  body.system === 'Pyro' ? 'text-orange-400 bg-orange-900/30' : 'text-cyan-400 bg-cyan-900/30'
                )}>
                  {body.system}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {body.harvestables.map(hId => {
                  const h = HARVESTABLES[hId];
                  if (!h) return null;
                  return (
                    <span key={hId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-700/30">
                      <Leaf className="w-3 h-3" />
                      {h.name}
                      <span className="text-green-600 ml-0.5 capitalize">({h.type})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View: Sell Locations ─────────────────────────────────────────────────────

function SellView({ systemFilter, search }) {
  const q = search?.toLowerCase() || '';
  const buyers = useMemo(() => {
    return ORE_BUYERS.filter(b => {
      if (systemFilter !== 'Tous' && b.system !== systemFilter) return false;
      if (q && !b.name.toLowerCase().includes(q) && !b.location.toLowerCase().includes(q) && !b.system.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [systemFilter, q]);

  const grouped = useMemo(() => {
    const g = {};
    for (const b of buyers) {
      if (!g[b.system]) g[b.system] = [];
      g[b.system].push(b);
    }
    return g;
  }, [buyers]);

  return (
    <div className="space-y-6">
      <div className="card p-4 border border-yellow-700/30 bg-yellow-900/10">
        <div className="flex items-start gap-3">
          <ShoppingCart className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300 mb-1">Vendre vos minerais</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Après minage, revenez à une station pour vendre votre minerai brut ou le faire <strong className="text-white">raffiner</strong> d&apos;abord
              (stations avec <Wrench className="inline w-3 h-3 text-green-400" /> Raffinerie). Le minerai raffiné se vend plus cher
              mais prend du temps. Le <strong className="text-white">minerai main/ROC</strong> (Hadanite, Aphorite…) se vend directement
              sans raffinage.
            </p>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([system, list]) => (
        <div key={system}>
          <h3 className={clsx(
            'text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2',
            system === 'Pyro' ? 'text-orange-400' : system === 'Nyx' ? 'text-yellow-400' : 'text-cyan-400'
          )}>
            <Globe className="w-4 h-4" />
            {system}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map(buyer => (
              <div key={buyer.id} className={clsx(
                'rounded-xl border p-4 flex flex-col gap-3',
                buyer.bg, buyer.border
              )}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={clsx('font-bold text-sm', buyer.color)}>{buyer.name}</div>
                    <div className="text-xs text-slate-500">{buyer.subtitle}</div>
                  </div>
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                    buyer.legal ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'
                  )}>
                    {buyer.legal ? 'Légal' : 'Illégal'}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {buyer.hasRefinery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700/30">
                      <Wrench className="w-3 h-3" />
                      Raffinerie
                    </span>
                  )}
                  {buyer.buysRaw && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                      Brut ✓
                    </span>
                  )}
                  {buyer.buysRefined && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                      Raffiné ✓
                    </span>
                  )}
                  {buyer.accepts.map(m => (
                    <span key={m} className={clsx(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                      METHOD_LABELS[m].bg, METHOD_LABELS[m].color
                    )}>
                      {METHOD_LABELS[m].icon}
                    </span>
                  ))}
                </div>

                {/* Notes */}
                {buyer.notes && (
                  <p className="text-xs text-slate-400 leading-relaxed">{buyer.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Refining View ────────────────────────────────────────────────────────────

function RefiningView({ search }) {
  const [scuInput, setScuInput] = useState(32);
  const q = search?.toLowerCase() || '';

  const refinableComms = useMemo(() =>
    COMMODITIES.filter(c => c.minable && c.refiningOutput != null)
      .filter(c => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      .sort((a, b) => b.sellPrice.avg - a.sellPrice.avg),
    [q]
  );

  return (
    <div className="space-y-6">
      <div className="card p-4 border border-cyan-700/30 bg-cyan-900/10">
        <div className="flex items-start gap-3">
          <FlaskConical className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cyan-300 mb-1">Comprendre le raffinage</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le <strong className="text-white">minerai brut</strong> extrait doit être raffiné avant d'atteindre son plein potentiel.
              Le <strong className="text-white">rendement</strong> indique le % de minerai brut transformé en minerai raffiné.
              Le raffinage prend du temps — planifiez selon la disponibilité des raffineries.
              Le minerai <strong className="text-white">main/ROC</strong> (Hadanite, Aphorite…) se vend directement sans raffinage.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <label className="text-sm text-slate-400 whitespace-nowrap">Volume brut :</label>
        <input
          type="number"
          min={1}
          max={10000}
          value={scuInput}
          onChange={e => setScuInput(Math.max(1, Number(e.target.value)))}
          className="input w-28 text-center"
        />
        <span className="text-sm text-slate-500">SCU</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {refinableComms.map(comm => {
          const mineral = Object.values(MINERALS).find(m =>
            m.name.toLowerCase() === comm.name.toLowerCase() ||
            m.id === comm.id
          );
          const outputScu   = Math.round(scuInput * (comm.refiningOutput / 100) * 10) / 10;
          const rawValue    = comm.sellPrice.avg * scuInput;
          const refinedValue = comm.sellPrice.avg * outputScu;
          const timeHours   = comm.refiningTime || 24;
          const gain        = refinedValue - rawValue;

          return (
            <div key={comm.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className={clsx('font-bold text-sm', mineral?.color || 'text-slate-200')}>{comm.name}</div>
                  <div className="text-xs text-slate-500">{comm.subcategory}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Prix raffiné/SCU</div>
                  <div className="text-sm font-bold text-success-400">{comm.sellPrice.avg.toLocaleString()} aUEC</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-space-900/60">
                  <div className="text-xs text-slate-500">Rendement</div>
                  <div className={clsx('text-sm font-bold', comm.refiningOutput >= 45 ? 'text-success-400' : comm.refiningOutput >= 35 ? 'text-warning-400' : 'text-danger-400')}>
                    {comm.refiningOutput}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-space-900/60">
                  <div className="text-xs text-slate-500">Sortie ({scuInput} SCU brut)</div>
                  <div className="text-sm font-bold text-cyan-400">{outputScu} SCU</div>
                </div>
                <div className="p-2 rounded-lg bg-space-900/60">
                  <div className="text-xs text-slate-500">Durée</div>
                  <div className="text-sm font-bold text-purple-400">{timeHours}h</div>
                </div>
              </div>

              <div className="border-t border-space-400/10 pt-2 flex justify-between text-xs">
                <span className="text-slate-500">Valeur brute : <span className="text-slate-300">{rawValue.toLocaleString()} aUEC</span></span>
                <span className={clsx(gain >= 0 ? 'text-success-400' : 'text-danger-400')}>
                  {gain >= 0 ? '+' : ''}{gain.toLocaleString()} aUEC raffiné
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── View: Lasers & Equipment ─────────────────────────────────────────────────

const LASER_MOUNT_LABELS = {
  ship: { label: 'Vaisseau', color: 'text-cyan-400',   bg: 'bg-cyan-900/30',   border: 'border-cyan-700/40'   },
  roc:  { label: 'ROC',      color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700/40' },
  hand: { label: 'Main',     color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700/40'  },
};

function StatBar({ value, max, color, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-space-900/60 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

function LaserCard({ laser }) {
  const mount = LASER_MOUNT_LABELS[laser.mountType] || LASER_MOUNT_LABELS.ship;
  const sizeLabel = laser.size === 0 ? 'ROC/Main' : `S${laser.size}`;
  const s = laser.stats;

  return (
    <div className={clsx(
      'card p-4 space-y-3 border relative',
      laser.recommended ? 'border-cyan-500/40' : 'border-space-400/20'
    )}>
      {laser.recommended && (
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-900/40 text-cyan-400 border border-cyan-700/40">
          Recommandé
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-24">
        <div className="w-9 h-9 rounded-lg border border-cyan-700/40 bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="font-semibold text-white text-sm leading-tight">{laser.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{laser.manufacturer}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium border', mount.bg, mount.color, mount.border)}>
              {mount.label}
            </span>
            <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-space-700/60 text-slate-300 border border-space-400/20">
              {sizeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Stat bars */}
      <div className="space-y-1.5">
        <StatBar label="Puissance"    value={s.power}        max={5000}  color="bg-cyan-500"   />
        <StatBar label="Extraction"   value={s.extractionRate * 1000} max={300}   color="bg-green-500"  />
        <StatBar label="Instabilité"  value={s.instability * 100}    max={100}   color="bg-red-500"    />
        <StatBar label="Résistance"   value={s.resistance * 100}     max={100}   color="bg-orange-500" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="flex justify-between rounded bg-space-900/60 px-2 py-1">
          <span className="text-slate-500">Portée opt.</span>
          <span className="text-slate-300">{s.optimalRange}m</span>
        </div>
        <div className="flex justify-between rounded bg-space-900/60 px-2 py-1">
          <span className="text-slate-500">Portée max.</span>
          <span className="text-slate-300">{s.maxRange}m</span>
        </div>
        <div className="flex justify-between rounded bg-space-900/60 px-2 py-1 col-span-2">
          <span className="text-slate-500">Prix</span>
          <span className="text-yellow-400 font-semibold">{laser.price > 0 ? laser.price.toLocaleString() + ' aUEC' : 'Intégré'}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed border-t border-space-400/10 pt-2">{laser.description}</p>
    </div>
  );
}

function ConsumableCard({ cons }) {
  const isActive = cons.type === 'active';
  const effectLabels = {
    boost:     { label: 'Puissance',    color: 'text-red-400',    bg: 'bg-red-900/30'    },
    stabilize: { label: 'Stabilisation', color: 'text-blue-400',  bg: 'bg-blue-900/30'   },
    filter:    { label: 'Filtrage',     color: 'text-purple-400', bg: 'bg-purple-900/30' },
  };
  const eff = effectLabels[cons.effect] || effectLabels.boost;

  return (
    <div className="card p-4 space-y-2 border border-space-400/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-space-400/30 bg-space-700/60 flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{cons.name}</div>
            <div className="text-xs text-slate-500">{cons.manufacturer}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={clsx(
            'inline-block px-2 py-0.5 text-xs rounded-full font-medium',
            isActive ? 'text-red-400 bg-red-900/30 border border-red-700/40' : 'text-blue-400 bg-blue-900/30 border border-blue-700/40'
          )}>
            {isActive ? 'Actif' : 'Passif'}
          </span>
          <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium', eff.bg, eff.color)}>
            {eff.label}
          </span>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-1 text-xs">
        {cons.stats.powerMult && cons.stats.powerMult !== 1.0 && (
          <div className="rounded bg-space-900/60 px-2 py-1 text-center">
            <div className="text-slate-500">Puissance</div>
            <div className="text-red-400 font-bold">×{cons.stats.powerMult.toFixed(2)}</div>
          </div>
        )}
        {cons.stats.instabilityMult && cons.stats.instabilityMult !== 1.0 && (
          <div className="rounded bg-space-900/60 px-2 py-1 text-center">
            <div className="text-slate-500">Instabilité</div>
            <div className={clsx('font-bold', cons.stats.instabilityMult > 1 ? 'text-red-400' : 'text-green-400')}>
              ×{cons.stats.instabilityMult.toFixed(2)}
            </div>
          </div>
        )}
        {cons.stats.filterMult && cons.stats.filterMult !== 1.0 && (
          <div className="rounded bg-space-900/60 px-2 py-1 text-center">
            <div className="text-slate-500">Filtrage</div>
            <div className="text-purple-400 font-bold">×{cons.stats.filterMult.toFixed(2)}</div>
          </div>
        )}
        {cons.stats.duration > 0 && (
          <div className="rounded bg-space-900/60 px-2 py-1 text-center">
            <div className="text-slate-500">Durée</div>
            <div className="text-cyan-400 font-bold">{cons.stats.duration}s</div>
          </div>
        )}
        <div className="rounded bg-space-900/60 px-2 py-1 text-center col-span-1">
          <div className="text-slate-500">Prix</div>
          <div className="text-yellow-400 font-bold">{cons.price} aUEC</div>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{cons.description}</p>
    </div>
  );
}

function ModuleCard({ mod }) {
  return (
    <div className="card p-3 space-y-2 border border-space-400/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded border border-space-400/30 bg-space-700/60 flex items-center justify-center">
            <Wrench className="w-3 h-3 text-slate-400" />
          </div>
          <span className="font-semibold text-white text-sm">{mod.name}</span>
        </div>
        <span className={clsx(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          mod.type === 'passive' ? 'text-blue-400 bg-blue-900/30' : 'text-red-400 bg-red-900/30'
        )}>
          {mod.type === 'passive' ? 'Passif' : 'Actif'}
        </span>
      </div>
      <p className="text-xs text-slate-400">{mod.description}</p>
      <div className="text-xs text-yellow-400 font-semibold">{mod.price.toLocaleString()} aUEC</div>
    </div>
  );
}

function EquipmentView({ search }) {
  const [sizeFilter, setSizeFilter]   = useState('Tous');
  const [mountFilter, setMountFilter] = useState('Tous');
  const [sortBy, setSortBy]           = useState('power');
  const q = search?.toLowerCase() || '';

  const filteredLasers = useMemo(() => {
    let list = [...MINING_LASERS];
    if (q) list = list.filter(l => l.name.toLowerCase().includes(q) || l.manufacturer.toLowerCase().includes(q));
    if (sizeFilter === 'S1')    list = list.filter(l => l.size === 1);
    if (sizeFilter === 'S2')    list = list.filter(l => l.size === 2);
    if (sizeFilter === 'ROC/Main') list = list.filter(l => l.size === 0);
    if (mountFilter !== 'Tous') list = list.filter(l => l.mountType === mountFilter);
    if (sortBy === 'power')      list.sort((a, b) => b.stats.power - a.stats.power);
    if (sortBy === 'extraction') list.sort((a, b) => b.stats.extractionRate - a.stats.extractionRate);
    if (sortBy === 'price')      list.sort((a, b) => a.price - b.price);
    if (sortBy === 'stability')  list.sort((a, b) => a.stats.instability - b.stats.instability);
    return list;
  }, [sizeFilter, mountFilter, sortBy, q]);

  return (
    <div className="space-y-6">
      {/* Lasers section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Lasers de minage</h2>
          <span className="text-xs text-slate-500 ml-1">({filteredLasers.length} résultats)</span>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Taille</label>
            <div className="flex gap-1 flex-wrap">
              {['Tous', 'S1', 'S2', 'ROC/Main'].map(s => (
                <button
                  key={s}
                  onClick={() => setSizeFilter(s)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    sizeFilter === s
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Support</label>
            <div className="flex gap-1">
              {[['Tous','Tous'], ['ship','Vaisseau'], ['roc','ROC'], ['hand','Main']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setMountFilter(val)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    mountFilter === val
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tri</label>
            <div className="flex gap-1 flex-wrap">
              {[['power','Puissance'], ['extraction','Extraction'], ['stability','Stabilité'], ['price','Prix']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    sortBy === val
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLasers.map(laser => <LaserCard key={laser.id} laser={laser} />)}
        </div>
        {filteredLasers.length === 0 && (
          <div className="card p-8 text-center text-slate-400">Aucun laser avec ces filtres.</div>
        )}
      </div>

      {/* Consumables section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Consommables</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {MINING_CONSUMABLES.filter(c => !q || c.name.toLowerCase().includes(q)).map(cons => <ConsumableCard key={cons.id} cons={cons} />)}
        </div>
      </div>

      {/* Modules section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-bold text-white">Modules vaisseau</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {MINING_MODULES.filter(m => !q || m.name.toLowerCase().includes(q)).map(mod => <ModuleCard key={mod.id} mod={mod} />)}
        </div>
      </div>
    </div>
  );
}

// ─── View: Mining Ships ───────────────────────────────────────────────────────

function RoiCalculator({ ship }) {
  const mineralList = useMemo(() => getMineralsSorted(), []);
  const [selectedMineral, setSelectedMineral] = useState(mineralList[0]?.id || 'quantanium');
  const [runsPerHour, setRunsPerHour] = useState(2);

  const roi = useMemo(() => {
    const mineral = mineralList.find(m => m.id === selectedMineral);
    if (!mineral) return null;
    const cargoSCU    = ship.cargoSCU;
    const yield_      = 0.70;   // rendement raffinage approximatif
    const refineryCut = 0.85;   // frais raffinerie -15%
    const auecPerSCU  = mineral.value * 1000; // valeur aUEC/SCU approximatif
    const perRun      = cargoSCU * yield_ * refineryCut * auecPerSCU;
    const perHour     = perRun * runsPerHour;
    return { perRun: Math.round(perRun), perHour: Math.round(perHour), mineral };
  }, [selectedMineral, runsPerHour, ship, mineralList]);

  return (
    <div className="mt-3 border-t border-space-400/15 pt-3 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
        <Calculator className="w-3.5 h-3.5 text-yellow-400" />
        Calculateur ROI estimatif
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Minéral ciblé</label>
          <select
            value={selectedMineral}
            onChange={e => setSelectedMineral(e.target.value)}
            className="input text-xs py-1.5"
          >
            {mineralList.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.value} aUEC/u</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Runs / heure</label>
          <input
            type="number"
            min={1}
            max={10}
            value={runsPerHour}
            onChange={e => setRunsPerHour(Math.max(1, Number(e.target.value)))}
            className="input text-xs py-1.5 text-center"
          />
        </div>
      </div>
      {roi && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-space-900/60 p-2 text-center">
            <div className="text-xs text-slate-500">Par run</div>
            <div className="text-sm font-bold text-cyan-400">{roi.perRun.toLocaleString()} aUEC</div>
          </div>
          <div className="rounded-lg bg-yellow-900/20 border border-yellow-700/30 p-2 text-center">
            <div className="text-xs text-slate-500">Par heure</div>
            <div className="text-sm font-bold text-yellow-400">{roi.perHour.toLocaleString()} aUEC</div>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-600 italic">
        Estimation : cargo × 70% rendement × 85% après frais raffinerie × valeur unitaire × 1 000 aUEC/SCU
      </p>
    </div>
  );
}

function MiningShipCard({ ship }) {
  const [showRoi, setShowRoi] = useState(false);

  return (
    <div className={clsx(
      'card p-4 space-y-3 border relative',
      ship.recommended ? 'border-cyan-500/40' : 'border-space-400/20'
    )}>
      {ship.recommended && (
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-900/40 text-cyan-400 border border-cyan-700/40">
          Recommandé
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-24">
        <div className="w-10 h-10 rounded-lg border border-space-400/30 bg-space-700/60 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="font-bold text-white">{ship.name}</div>
          <div className="text-xs text-slate-500">{ship.manufacturer}</div>
          <div className="flex gap-1.5 mt-1">
            <span className={clsx(
              'inline-block px-2 py-0.5 text-xs rounded-full font-medium',
              ship.type === 'ship' ? 'text-cyan-400 bg-cyan-900/30' : 'text-orange-400 bg-orange-900/30'
            )}>
              {ship.type === 'ship' ? 'Vaisseau' : 'Véhicule'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-space-900/60 p-2 text-center">
          <div className="text-slate-500">Lasers</div>
          <div className="text-white font-bold">{ship.laserSlots}× {ship.laserSizes.join('/')}</div>
        </div>
        <div className="rounded-lg bg-space-900/60 p-2 text-center">
          <div className="text-slate-500">Cargo</div>
          <div className="text-cyan-400 font-bold">{ship.cargoSCU} SCU</div>
        </div>
        <div className="rounded-lg bg-space-900/60 p-2 text-center">
          <div className="text-slate-500">Équipage</div>
          <div className="text-white font-bold">
            {ship.crew.min === ship.crew.max ? ship.crew.min : `${ship.crew.min}–${ship.crew.max}`}
          </div>
        </div>
      </div>

      {/* Modules */}
      {ship.moduleSlots > 0 && (
        <div className="text-xs text-slate-500">
          <Wrench className="inline w-3 h-3 mr-1" />
          {ship.moduleSlots} emplacement{ship.moduleSlots > 1 ? 's' : ''} de module
        </div>
      )}

      <p className="text-xs text-slate-400 leading-relaxed">{ship.description}</p>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs font-semibold text-green-400 mb-1">Avantages</div>
          <ul className="space-y-0.5">
            {ship.strengths.map((s, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                <span className="text-green-500 flex-shrink-0 mt-0.5">+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold text-red-400 mb-1">Inconvénients</div>
          <ul className="space-y-0.5">
            {ship.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                <span className="text-red-500 flex-shrink-0 mt-0.5">−</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between pt-1 border-t border-space-400/10">
        <div className="text-xs text-slate-500">
          Prix <span className="text-yellow-400 font-semibold">{ship.price.toLocaleString()} aUEC</span>
        </div>
        <button
          onClick={() => setShowRoi(v => !v)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            showRoi
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
          )}
        >
          <Calculator className="w-3 h-3" />
          Calculateur ROI
        </button>
      </div>

      {/* ROI Calculator toggle */}
      {showRoi && <RoiCalculator ship={ship} />}
    </div>
  );
}

function ShipsView({ search }) {
  const q = search?.toLowerCase() || '';
  const filteredShips = useMemo(() => {
    if (!q) return MINING_SHIPS;
    return MINING_SHIPS.filter(s => s.name.toLowerCase().includes(q) || s.manufacturer.toLowerCase().includes(q));
  }, [q]);

  return (
    <div className="space-y-6">
      <div className="card p-4 border border-cyan-700/30 bg-cyan-900/10">
        <div className="flex items-start gap-3">
          <Rocket className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cyan-300 mb-1">Choisir son vaisseau mineur</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le <strong className="text-white">Prospector</strong> est idéal pour débuter en solo — un laser S1, 32 SCU.
              Le <strong className="text-white">MOLE</strong> est réservé aux équipages — 3 lasers S2, 96 SCU, ROI maximal à 3-4 joueurs.
              Le <strong className="text-white">ROC</strong> (et ROC-DS) mine les dépôts de surface et les grottes.
              Le calculateur ROI ci-dessous est une estimation basée sur le cargo, le rendement et la valeur du minerai.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredShips.map(ship => (
          <MiningShipCard key={ship.id} ship={ship} />
        ))}
      </div>
    </div>
  );
}

// ─── View: Deposits ───────────────────────────────────────────────────────────

const RISK_STYLES = {
  'Faible':   { color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700/40'  },
  'Modéré':   { color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/40' },
  'Élevé':    { color: 'text-red-400',    bg: 'bg-red-900/30',    border: 'border-red-700/40'    },
  'Extrême':  { color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-700/40' },
};

const DEPOSIT_METHOD_STYLES = {
  'Vaisseau': { color: 'text-cyan-400',   bg: 'bg-cyan-900/30',   border: 'border-cyan-700/40'   },
  'ROC':      { color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700/40' },
  'Main':     { color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700/40'  },
};

function QualityStars({ quality }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={clsx('w-3 h-3', i < quality ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700')}
        />
      ))}
    </span>
  );
}

function DepositCard({ deposit }) {
  const [open, setOpen] = useState(false);
  const risk = RISK_STYLES[deposit.riskLevel] || RISK_STYLES['Faible'];
  const method = DEPOSIT_METHOD_STYLES[deposit.method] || DEPOSIT_METHOD_STYLES['Vaisseau'];
  const topMineral = deposit.minerals.reduce((best, m) => m.concentration > best.concentration ? m : best, deposit.minerals[0]);
  const topMineralData = topMineral ? MINERALS[topMineral.id] : null;

  return (
    <div className={clsx('card overflow-hidden border', topMineralData ? topMineralData.border : 'border-space-400/20')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={clsx('w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0', topMineralData ? topMineralData.bg : 'bg-space-700', topMineralData ? topMineralData.border : 'border-space-400/20')}>
            <MapPin className={clsx('w-4 h-4', topMineralData ? topMineralData.color : 'text-slate-400')} />
          </div>
          <div className="text-left min-w-0">
            <div className="font-semibold text-white text-sm truncate">{deposit.bodyName}</div>
            <div className="text-xs text-slate-500 truncate">{deposit.zone}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Badges */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium border', method.bg, method.color, method.border)}>
              {deposit.method}
            </span>
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium border', risk.bg, risk.color, risk.border)}>
              {deposit.riskLevel}
            </span>
            <span className={clsx(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              deposit.system === 'Pyro' ? 'text-orange-400 bg-orange-900/30' : 'text-cyan-400 bg-cyan-900/30'
            )}>
              {deposit.system}
            </span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-space-400/20 p-4 space-y-4">
          {/* Mobile badges */}
          <div className="flex sm:hidden flex-wrap gap-1.5">
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium border', method.bg, method.color, method.border)}>{deposit.method}</span>
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium border', risk.bg, risk.color, risk.border)}>{deposit.riskLevel}</span>
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', deposit.system === 'Pyro' ? 'text-orange-400 bg-orange-900/30' : 'text-cyan-400 bg-cyan-900/30')}>{deposit.system}</span>
          </div>

          {/* Minerals */}
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Composition minérale</div>
            <div className="space-y-2">
              {deposit.minerals.map(m => {
                const mineralData = MINERALS[m.id];
                if (!mineralData) return null;
                const pct = Math.round(m.concentration * 100);
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={clsx('font-semibold', mineralData.color)}>{mineralData.name}</span>
                        <QualityStars quality={m.quality} />
                      </div>
                      <span className="text-slate-400 font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all', {
                          'bg-cyan-500':   pct >= 45,
                          'bg-blue-500':   pct >= 30 && pct < 45,
                          'bg-yellow-500': pct >= 15 && pct < 30,
                          'bg-slate-500':  pct < 15,
                        })}
                        style={{ width: `${Math.min(100, pct * 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger warning */}
          {deposit.danger && (
            <div className="flex items-start gap-2 text-xs text-red-300 bg-red-900/20 rounded-lg p-3 border border-red-700/30">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              {deposit.danger}
            </div>
          )}

          {/* CrimeStat warning */}
          {deposit.crimeStat && (
            <div className="flex items-center gap-2 text-xs text-orange-300 bg-orange-900/20 rounded-lg px-3 py-2 border border-orange-700/30">
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              Zone à CrimeStat — activité criminelle élevée
            </div>
          )}

          {/* Notes */}
          {deposit.notes && (
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-space-700/40 rounded-lg p-3 border border-space-400/20">
              <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              {deposit.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DepositsView({ systemFilter, search }) {
  const [bodyFilter, setBodyFilter]       = useState('Tous');
  const [mineralFilter, setMineralFilter] = useState('Tous');
  const [methodFilter, setMethodFilter]   = useState('Tous');
  const [riskFilter, setRiskFilter]       = useState('Tous');
  const q = search?.toLowerCase() || '';

  // Options de filtres dynamiques
  const bodies  = useMemo(() => ['Tous', ...new Set(MINING_DEPOSITS.map(d => d.bodyName))], []);
  const minerals = useMemo(() => ['Tous', ...new Set(MINING_DEPOSITS.flatMap(d => d.minerals.map(m => m.id)))], []);
  const methods = ['Tous', 'Vaisseau', 'ROC', 'Main'];
  const risks   = ['Tous', 'Faible', 'Modéré', 'Élevé', 'Extrême'];

  const filtered = useMemo(() => {
    let list = [...MINING_DEPOSITS];
    if (q) list = list.filter(d =>
      d.bodyName.toLowerCase().includes(q) ||
      d.minerals.some(m => m.id.toLowerCase().includes(q) || (MINERALS[m.id] && MINERALS[m.id].name.toLowerCase().includes(q)))
    );
    if (systemFilter !== 'Tous')  list = list.filter(d => d.system === systemFilter);
    if (bodyFilter !== 'Tous')    list = list.filter(d => d.bodyName === bodyFilter);
    if (methodFilter !== 'Tous')  list = list.filter(d => d.method === methodFilter);
    if (riskFilter !== 'Tous')    list = list.filter(d => d.riskLevel === riskFilter);
    if (mineralFilter !== 'Tous') list = list.filter(d => d.minerals.some(m => m.id === mineralFilter));

    // Si filtre minéral, trier par concentration décroissante de ce minéral
    if (mineralFilter !== 'Tous') {
      list.sort((a, b) => {
        const ca = a.minerals.find(m => m.id === mineralFilter)?.concentration || 0;
        const cb = b.minerals.find(m => m.id === mineralFilter)?.concentration || 0;
        return cb - ca;
      });
    }
    return list;
  }, [systemFilter, bodyFilter, mineralFilter, methodFilter, riskFilter, q]);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-300">Filtres Dépôts</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Corps céleste */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Corps céleste</label>
            <select value={bodyFilter} onChange={e => setBodyFilter(e.target.value)} className="input text-xs">
              {bodies.map(b => <option key={b} value={b}>{b === 'Tous' ? 'Tous les corps' : b}</option>)}
            </select>
          </div>
          {/* Minéral principal */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Minéral</label>
            <select value={mineralFilter} onChange={e => setMineralFilter(e.target.value)} className="input text-xs">
              {minerals.map(m => {
                const md = MINERALS[m];
                return <option key={m} value={m}>{m === 'Tous' ? 'Tous les minéraux' : md?.name || m}</option>;
              })}
            </select>
          </div>
          {/* Méthode */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Méthode</label>
            <div className="flex gap-1">
              {methods.map(m => {
                const style = DEPOSIT_METHOD_STYLES[m];
                return (
                  <button key={m} onClick={() => setMethodFilter(m)} className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    methodFilter === m
                      ? style ? `${style.bg} ${style.color} ${style.border}` : 'bg-white/10 text-white border-white/20'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border-space-400/20'
                  )}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Risque */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Risque</label>
            <div className="flex gap-1 flex-wrap">
              {risks.map(r => {
                const style = RISK_STYLES[r];
                return (
                  <button key={r} onClick={() => setRiskFilter(r)} className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    riskFilter === r
                      ? style ? `${style.bg} ${style.color} ${style.border}` : 'bg-white/10 text-white border-white/20'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border-space-400/20'
                  )}>
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Compteur */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {filtered.length} dépôt{filtered.length > 1 ? 's' : ''}
          {mineralFilter !== 'Tous' && (
            <span className="text-slate-600 ml-1">· trié par concentration de {MINERALS[mineralFilter]?.name}</span>
          )}
        </span>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          Aucun dépôt trouvé avec ces filtres.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => <DepositCard key={d.id} deposit={d} />)}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Mining() {
  const [view, setView]           = useState('mineral');
  const [systemFilter, setSystem] = useState('Tous');
  const [methodFilter, setMethod] = useState('Tous');
  const [rarityFilter, setRarity] = useState('Tous');
  const [search, setSearch]       = useState('');
  const [useLive, setUseLive]     = useState(false);

  // ---- Données live UEX Corp ----
  const { mining: liveMining, isLive, lastUpdated, loading: liveLoading, refresh } = useLiveMining();

  // Build a map: mineral id → live price (aUEC/unit)
  const livePriceMap = useMemo(() => {
    if (!useLive || !isLive || !liveMining?.length) return null;
    const map = {};
    for (const item of liveMining) {
      // UEX data uses commodity_name or name; try to match by lowercased id
      const key = (item.commodity_slug || item.slug || item.commodity_name || item.name || '').toLowerCase().replace(/[\s-]+/g, '_');
      const price = parseFloat(item.price_sell_avg || item.price_sell || item.price || 0);
      if (key && price > 0) map[key] = price;
    }
    return Object.keys(map).length > 0 ? map : null;
  }, [useLive, isLive, liveMining]);

  // Stats
  const totalBodies    = MINING_BODIES.length;
  const stantonBodies  = MINING_BODIES.filter(b => b.system === 'Stanton').length;
  const pyroBodies     = MINING_BODIES.filter(b => b.system === 'Pyro').length;
  const totalMinerals  = Object.keys(MINERALS).length;
  const totalRefineries = ORE_BUYERS.filter(b => b.hasRefinery).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Gem className="w-6 h-6 text-cyan-400" />
            Guide de Minage
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Ressources minérales dans Stanton et Pyro — données Alpha 4.0
          </p>
          {/* Live toggle + timestamp */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => {
                if (!useLive) refresh();
                setUseLive(v => !v);
              }}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                useLive && isLive
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : useLive && liveLoading
                    ? 'bg-space-700 border-space-400/30 text-slate-400'
                    : 'bg-space-700/50 border-space-400/20 text-slate-500 hover:border-space-300/40'
              )}
              title={isLive ? 'Prix minage en temps réel depuis UEX Corp' : 'Activer les prix live UEX Corp'}
            >
              {liveLoading && useLive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : useLive && isLive ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              {useLive && isLive ? 'Prix Live' : 'Prix Statiques'}
              {useLive && isLive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold uppercase tracking-wider">
                  Live
                </span>
              )}
            </button>
            {useLive && isLive && lastUpdated && (
              <span className="text-[11px] text-slate-500">
                Dernière MAJ : {new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        {/* Quick stats */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Corps célestes', value: totalBodies },
            { label: 'Stanton',        value: stantonBodies, color: 'text-cyan-400'   },
            { label: 'Pyro',           value: pyroBodies,    color: 'text-orange-400' },
            { label: 'Minéraux',       value: totalMinerals,  color: 'text-yellow-400' },
          { label: 'Raffineries',    value: totalRefineries, color: 'text-green-400'  },
          ].map(s => (
            <div key={s.label} className="card px-3 py-2 text-center min-w-[70px]">
              <div className={clsx('text-lg font-bold', s.color || 'text-white')}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-2 flex-wrap">
        {VIEWS.map(v => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                view === v.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
              )}
            >
              <Icon className="w-4 h-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-300">Filtres</span>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un minéral, lieu, vaisseau, laser..."
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* System */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Système</label>
            <div className="flex gap-1">
              {SYSTEMS.map(s => (
                <button
                  key={s}
                  onClick={() => setSystem(s)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    systemFilter === s
                      ? s === 'Pyro'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : s === 'Stanton'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/10 text-white border border-white/20'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Method (only for mineral + body views) */}
          {view !== 'harvest' && view !== 'deposits' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Méthode</label>
              <div className="flex gap-1">
                {METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      methodFilter === m
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                    )}
                  >
                    {m === 'Tous' ? 'Tous' : METHOD_LABELS[m].short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rarity (only for mineral view) */}
          {view === 'mineral' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Rareté</label>
              <div className="flex gap-1 flex-wrap">
                {RARITIES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRarity(r)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      rarityFilter === r
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                    )}
                  >
                    {r === 'Tous' ? 'Tous' : RARITY_LABELS[r].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {view === 'mineral' && (
        <MineralView
          systemFilter={systemFilter}
          methodFilter={methodFilter}
          rarityFilter={rarityFilter}
          search={search}
          livePriceMap={livePriceMap}
        />
      )}
      {view === 'body' && (
        <BodyView systemFilter={systemFilter} search={search} />
      )}
      {view === 'deposits' && (
        <DepositsView systemFilter={systemFilter} search={search} />
      )}
      {view === 'harvest' && (
        <HarvestView systemFilter={systemFilter} search={search} />
      )}
      {view === 'sell' && (
        <SellView systemFilter={systemFilter} search={search} />
      )}
      {view === 'refining' && (
        <RefiningView search={search} />
      )}
      {view === 'equipment' && (
        <EquipmentView search={search} />
      )}
      {view === 'ships' && (
        <ShipsView search={search} />
      )}
    </div>
  );
}
