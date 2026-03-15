import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SHIPS } from '../../datasets/ships.js';
import { useShipImages } from '../../core/ShipImagesContext.jsx';
import { resolveShipImage } from '../../services/ShipImageService.js';
import { formatCredits, formatCargo } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Rocket, X, Plus, ArrowLeftRight, Zap, Shield, Package,
  Users, Star, TrendingUp, ChevronRight, Search,
} from 'lucide-react';

// ─── Ship Avatar ─────────────────────────────────────────────────────────────

function ShipAvatar({ imageUrl, name, className = 'w-full h-full' }) {
  const apiImages = useShipImages();
  const [err, setErr] = useState(false);
  const src = resolveShipImage(name, imageUrl, apiImages);
  if (src && !err) return <img src={src} alt={name} className={`${className} object-cover`} onError={() => setErr(true)} />;
  return <Rocket className="w-10 h-10 text-slate-600" />;
}

// ─── Ship Selector ────────────────────────────────────────────────────────────

function ShipSelector({ value, onChange, exclude = [], index }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() =>
    SHIPS.filter(s =>
      !exclude.includes(s.id) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
       s.manufacturer.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 30),
    [search, exclude]
  );

  const selected = SHIPS.find(s => s.id === value);

  return (
    <div className="relative">
      {selected ? (
        <div className="card p-3 flex items-center gap-3 group cursor-pointer" onClick={() => setOpen(true)}>
          <div className="w-12 h-12 rounded-lg bg-space-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            <ShipAvatar imageUrl={selected.imageUrl} name={selected.name} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-200 truncate">{selected.name}</div>
            <div className="text-xs text-slate-500">{selected.manufacturer} · {selected.role}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onChange(null); }}
            className="p-1 rounded hover:bg-danger-500/20 text-slate-500 hover:text-danger-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full card p-4 border-dashed border-space-400/30 hover:border-cyan-500/30 transition-all flex flex-col items-center justify-center gap-2 min-h-[80px]"
        >
          <Plus className="w-6 h-6 text-slate-600" />
          <span className="text-sm text-slate-500">Vaisseau {index + 1}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-space-900 border border-space-400/20 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-space-400/20">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Rechercher un vaisseau..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-slate-200 outline-none placeholder-slate-500 text-sm"
                />
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-2 scroll-container">
              {filtered.map(ship => (
                <button
                  key={ship.id}
                  onClick={() => { onChange(ship.id); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-space-700/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <ShipAvatar imageUrl={ship.imageUrl} name={ship.name} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{ship.name}</div>
                    <div className="text-xs text-slate-500">{ship.manufacturer} · {ship.size} · {ship.role}</div>
                  </div>
                  <div className="ml-auto text-xs text-success-400 font-medium whitespace-nowrap">
                    {formatCredits(ship.price, true)}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">Aucun résultat</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Comparison Row ───────────────────────────────────────────────────────────

function CompRow({ label, ships, accessor, format = v => v, best = 'max', color = 'text-slate-200', icon: Icon }) {
  const values = ships.map(s => s ? accessor(s) : null);
  const numValues = values.filter(v => v !== null && !isNaN(Number(v)));
  const bestVal = numValues.length > 0 ? (best === 'max' ? Math.max(...numValues) : Math.min(...numValues)) : null;

  return (
    <tr className="border-b border-space-400/10 hover:bg-space-700/20 transition-colors">
      <td className="py-3 px-4 text-xs text-slate-500 font-medium w-36">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
          {label}
        </div>
      </td>
      {ships.map((ship, i) => {
        const val = values[i];
        const numVal = Number(val);
        const isBest = ship && bestVal !== null && !isNaN(numVal) && numVal === bestVal && numValues.length > 1;
        return (
          <td key={i} className="py-3 px-4 text-center">
            {val !== null && val !== undefined ? (
              <span className={clsx('text-sm font-medium', isBest ? 'text-success-400 font-bold' : color)}>
                {format(val)}
                {isBest && <span className="ml-1 text-xs">★</span>}
              </span>
            ) : (
              <span className="text-slate-600 text-sm">—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function SectionHeader({ label }) {
  return (
    <tr className="bg-space-800/60">
      <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</td>
    </tr>
  );
}

// ─── Radar Comparison ─────────────────────────────────────────────────────────

const SHIP_COLORS = ['#06b6d4', '#f59e0b', '#8b5cf6'];

function StatBar({ label, values, max, colors }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="flex gap-2">
          {values.map((v, i) => v !== null && (
            <span key={i} style={{ color: colors[i] }} className="text-xs font-medium">{v}</span>
          ))}
        </div>
      </div>
      <div className="flex gap-1 h-2">
        {values.map((v, i) => (
          <div key={i} className="flex-1 bg-space-600 rounded-full overflow-hidden" style={{ opacity: v === null ? 0.2 : 1 }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (v / max) * 100)}%`, background: colors[i] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MAX_SHIPS = 3;

export default function ShipComparator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // I-09: pré-charger le vaisseau passé via ?a= depuis ShipDetail
  const preloadId = searchParams.get('a') ?? null;
  const [selectedIds, setSelectedIds] = useState([preloadId, null, null]);

  const ships = selectedIds.map(id => SHIPS.find(s => s.id === id) || null);
  const selectedShips = ships.filter(Boolean);

  const updateShip = (index, id) => {
    setSelectedIds(prev => { const n = [...prev]; n[index] = id; return n; });
  };

  const clearAll = () => setSelectedIds([null, null, null]);

  // Suggest similar ships for quick comparison
  const suggestions = useMemo(() => {
    if (selectedShips.length === 0) return [];
    const role = selectedShips[0]?.role;
    return SHIPS.filter(s => s.role === role && !selectedIds.includes(s.id)).slice(0, 6);
  }, [selectedShips, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Comparateur de Vaisseaux</h1>
          <p className="page-subtitle">Comparez jusqu'à 3 vaisseaux côte à côte</p>
        </div>
        <div className="flex gap-2">
          {selectedShips.length > 0 && (
            <button onClick={clearAll} className="btn-secondary gap-2">
              <X className="w-4 h-4" /> Effacer
            </button>
          )}
          <button onClick={() => navigate('/vaisseaux')} className="btn-ghost gap-2">
            <Rocket className="w-4 h-4" /> Base de données
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {selectedIds.map((id, i) => (
          <ShipSelector
            key={i}
            index={i}
            value={id}
            onChange={(newId) => updateShip(i, newId)}
            exclude={selectedIds.filter((_, j) => j !== i).filter(Boolean)}
          />
        ))}
      </div>

      {/* Suggestions */}
      {selectedShips.length === 1 && selectedShips.length < MAX_SHIPS && suggestions.length > 0 && (
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-3">Suggestions — même rôle ({selectedShips[0].role})</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  const nextEmpty = selectedIds.findIndex(id => id === null);
                  if (nextEmpty !== -1) updateShip(nextEmpty, s.id);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 hover:bg-space-700 border border-space-400/20 hover:border-cyan-500/30 transition-all text-sm"
              >
                <span className="text-slate-300">{s.name}</span>
                <span className="text-xs text-slate-500">{s.manufacturer}</span>
                <Plus className="w-3 h-3 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No ships selected */}
      {selectedShips.length === 0 && (
        <div className="card p-10 text-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-slate-300 font-semibold mb-2">Sélectionnez des vaisseaux à comparer</h2>
          <p className="text-slate-500 text-sm mb-4">Cliquez sur les slots ci-dessus pour choisir jusqu'à 3 vaisseaux</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['aurora-mr', 'avenger-titan', 'freelancer', 'caterpillar', 'constellation-andromeda'].map(id => {
              const s = SHIPS.find(sh => sh.id === id);
              if (!s) return null;
              return (
                <button key={id} onClick={() => updateShip(0, id)} className="btn-secondary btn-sm">
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison table */}
      {selectedShips.length >= 2 && (
        <>
          {/* Visual bars */}
          <div className="card p-5">
            <h2 className="section-title mb-4">Aperçu Statistiques</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {[
                  { label: 'Vitesse SCM (m/s)', key: 'scmSpeed', max: 1200 },
                  { label: 'Vitesse Max (m/s)', key: 'maxSpeed', max: 1500 },
                  { label: 'Cargo (SCU)', key: 'cargo', max: 1000 },
                  { label: 'Boucliers (HP)', key: 'shieldHp', max: 6000 },
                ].map(({ label, key, max }) => (
                  <StatBar
                    key={key}
                    label={label}
                    values={ships.map(s => s?.specs?.[key] ?? null)}
                    max={max}
                    colors={SHIP_COLORS}
                  />
                ))}
              </div>
              <div>
                {[
                  { label: 'Prix (aUEC / 1000)', key: 'price', max: 30000000 },
                  { label: 'Crew (max)', key: 'crewMax', max: 20 },
                  { label: 'Accélération (m/s²)', key: 'acceleration', max: 200 },
                  { label: 'Carburant Quantique', key: 'qFuel', max: 5000 },
                ].map(({ label, key, max }) => (
                  <StatBar
                    key={key}
                    label={label}
                    values={ships.map(s => {
                      if (key === 'price') return s?.price ?? null;
                      if (key === 'crewMax') return s?.crew?.max ?? null;
                      return s?.specs?.[key] ?? null;
                    })}
                    max={max}
                    colors={SHIP_COLORS}
                  />
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              {ships.map((s, i) => s && (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: SHIP_COLORS[i] }} />
                  <span className="text-xs text-slate-400">{s.name}</span>
                </div>
              ))}
              <span className="text-xs text-success-400 ml-auto">★ = meilleur</span>
            </div>
          </div>

          {/* Detailed table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-space-400/20">
              <h2 className="section-title">Comparaison Détaillée</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-space-400/20">
                    <th className="py-3 px-4 text-left text-xs text-slate-500 font-medium w-36">Caractéristique</th>
                    {ships.map((s, i) => (
                      <th key={i} className="py-3 px-4 text-center">
                        {s ? (
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{s.name}</div>
                            <div className="text-xs text-slate-500">{s.manufacturer}</div>
                            <div className="w-2 h-2 rounded-full mx-auto mt-1" style={{ background: SHIP_COLORS[i] }} />
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <SectionHeader label="Identité" />
                  <CompRow label="Rôle" ships={ships} accessor={s => s.role} color="text-slate-300" />
                  <CompRow label="Taille" ships={ships} accessor={s => s.size} color="text-slate-300" />
                  <CompRow label="Fabricant" ships={ships} accessor={s => s.manufacturer} color="text-slate-300" />
                  <CompRow label="Statut" ships={ships} accessor={s => s.flyable ? 'Flyable' : 'Concept'} color="text-slate-300" />

                  <SectionHeader label="Équipage" />
                  <CompRow label="Crew Min" ships={ships} accessor={s => s.crew?.min ?? '—'} best="min" />
                  <CompRow label="Crew Max" ships={ships} accessor={s => s.crew?.max ?? '—'} icon={Users} />

                  <SectionHeader label="Combat" />
                  <CompRow label="Boucliers (HP)" ships={ships} accessor={s => s.specs?.shieldHp} format={v => v?.toLocaleString()} icon={Shield} />
                  <CompRow label="Points arme" ships={ships} accessor={s => s.hardpoints?.weapons} icon={Zap} />
                  <CompRow label="Points missile" ships={ships} accessor={s => s.hardpoints?.missiles} />
                  <CompRow label="Tourelles" ships={ships} accessor={s => s.hardpoints?.turrets} />

                  <SectionHeader label="Propulsion" />
                  <CompRow label="Vit. SCM (m/s)" ships={ships} accessor={s => s.specs?.scmSpeed} color="text-cyan-400" />
                  <CompRow label="Vit. Max (m/s)" ships={ships} accessor={s => s.specs?.maxSpeed} color="text-cyan-400" />
                  <CompRow label="Accélération" ships={ships} accessor={s => s.specs?.acceleration} color="text-cyan-400" />
                  <CompRow label="Carburant QT" ships={ships} accessor={s => s.specs?.qFuel} />

                  <SectionHeader label="Cargo & Capacités" />
                  <CompRow label="Cargo (SCU)" ships={ships} accessor={s => s.specs?.cargo} format={v => `${v} SCU`} icon={Package} />
                  <CompRow label="Carburant" ships={ships} accessor={s => s.specs?.fuel} />

                  <SectionHeader label="Prix" />
                  <CompRow label="Prix In-Game" ships={ships} accessor={s => s.price || 0} format={v => v ? formatCredits(v, true) : 'N/A'} best="min" color="text-gold-400" icon={TrendingUp} />
                  <CompRow label="Prix Pledge" ships={ships} accessor={s => s.pledgePrice || 0} format={v => v ? `$${v}` : 'N/A'} best="min" color="text-slate-400" />
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigate to detail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ships.map((s, i) => s && (
              <button
                key={i}
                onClick={() => navigate(`/vaisseaux/${s.id}`)}
                className="card p-3 flex items-center justify-between hover:border-cyan-500/30 transition-all group"
              >
                <div>
                  <div className="text-sm font-medium text-slate-200">{s.name}</div>
                  <div className="text-xs text-slate-500">Voir la fiche complète</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
