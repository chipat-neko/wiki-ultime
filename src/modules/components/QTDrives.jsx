import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Zap, ChevronUp, ChevronDown, Filter, Calculator, RotateCcw } from 'lucide-react';
import {
  QT_DRIVES_EXTENDED,
  QT_ROUTES,
  QT_SIZES,
  QT_GRADES,
  QT_CLASSIFICATIONS,
  calcQTTime,
  calcQTFuel,
} from '../../datasets/qtDrivesExtended.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(sec) {
  if (sec < 60) return `${sec.toFixed(0)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

// ─── Badge classification ──────────────────────────────────────────────────────
const CLASS_COLORS = {
  Civile: 'badge-cyan',
  Compétition: 'badge-yellow',
  Militaire: 'badge-red',
  Furtif: 'badge-purple',
  Industrielle: 'badge-slate',
};

// ─── Colonnes du tableau ───────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name',             label: 'Moteur',          sortable: false,  render: d => (
    <div>
      <div className="font-semibold text-slate-100 text-sm">{d.name}</div>
      <div className="text-xs text-slate-500">{d.manufacturer}</div>
    </div>
  )},
  { key: 'size',             label: 'Taille',          sortable: true,   render: d => (
    <span className="badge badge-slate">S{d.size}</span>
  )},
  { key: 'grade',            label: 'Grade',           sortable: true,   render: d => (
    <span className={clsx('badge', {
      'badge-cyan':  d.grade === 'A',
      'badge-green': d.grade === 'B',
      'badge-slate': d.grade === 'C',
    })}>{d.grade}</span>
  )},
  { key: 'classification',   label: 'Classification',  sortable: true,   render: d => (
    <span className={clsx('badge', CLASS_COLORS[d.classification] || 'badge-slate')}>
      {d.classification}
    </span>
  )},
  { key: 'stats.qtSpeed',    label: 'Vitesse (Gm/s)',  sortable: true,   render: (d, best, worst) => (
    <span className={clsx('font-mono text-sm font-semibold', {
      'text-green-400': d.stats.qtSpeed === best.qtSpeed,
      'text-red-400':   d.stats.qtSpeed === worst.qtSpeed,
      'text-slate-200': d.stats.qtSpeed !== best.qtSpeed && d.stats.qtSpeed !== worst.qtSpeed,
    })}>
      {d.stats.qtSpeed.toFixed(3)}
    </span>
  )},
  { key: 'stats.spoolTime',  label: 'Spool (s)',       sortable: true,   render: (d, best, worst) => (
    <span className={clsx('font-mono text-sm font-semibold', {
      'text-green-400': d.stats.spoolTime === best.spoolTime,
      'text-red-400':   d.stats.spoolTime === worst.spoolTime,
      'text-slate-200': d.stats.spoolTime !== best.spoolTime && d.stats.spoolTime !== worst.spoolTime,
    })}>
      {d.stats.spoolTime.toFixed(1)}s
    </span>
  )},
  { key: 'stats.fuelConsumption', label: 'Consomm. (L/Mkm)', sortable: true, render: (d, best, worst) => (
    <span className={clsx('font-mono text-sm font-semibold', {
      'text-green-400': d.stats.fuelConsumption === best.fuelConsumption,
      'text-red-400':   d.stats.fuelConsumption === worst.fuelConsumption,
      'text-slate-200': d.stats.fuelConsumption !== best.fuelConsumption && d.stats.fuelConsumption !== worst.fuelConsumption,
    })}>
      {d.stats.fuelConsumption}
    </span>
  )},
  { key: 'stats.range',      label: 'Portée (Gm)',     sortable: true,   render: (d, best, worst) => (
    <span className={clsx('font-mono text-sm font-semibold', {
      'text-green-400': d.stats.range === best.range,
      'text-red-400':   d.stats.range === worst.range,
      'text-slate-200': d.stats.range !== best.range && d.stats.range !== worst.range,
    })}>
      {d.stats.range.toFixed(1)}
    </span>
  )},
  { key: 'stats.disconnectRange', label: 'Déconnexion (km)', sortable: true, render: (d, best, worst) => (
    <span className={clsx('font-mono text-sm', {
      'text-green-400': d.stats.disconnectRange === best.disconnectRange,
      'text-red-400':   d.stats.disconnectRange === worst.disconnectRange,
      'text-slate-300': d.stats.disconnectRange !== best.disconnectRange && d.stats.disconnectRange !== worst.disconnectRange,
    })}>
      {d.stats.disconnectRange} km
    </span>
  )},
  { key: 'stats.distortionHP', label: 'Distorsion HP',  sortable: true, render: (d, best, worst) => (
    <span className={clsx('font-mono text-sm', {
      'text-green-400': d.stats.distortionHP === best.distortionHP,
      'text-red-400':   d.stats.distortionHP === worst.distortionHP,
      'text-slate-300': d.stats.distortionHP !== best.distortionHP && d.stats.distortionHP !== worst.distortionHP,
    })}>
      {d.stats.distortionHP}
    </span>
  )},
  { key: 'price',            label: 'Prix (aUEC)',      sortable: true,   render: d => (
    <span className="text-gold-400 font-mono text-sm">
      {d.price > 0 ? d.price.toLocaleString('fr-FR') : '—'}
    </span>
  )},
];

// ─── Calculateur QT ───────────────────────────────────────────────────────────
function QTCalculator({ drives }) {
  const [selectedDrive, setSelectedDrive] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(QT_ROUTES[0].id);
  const [customDistance, setCustomDistance] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const drive = drives.find(d => d.id === selectedDrive);
  const route = QT_ROUTES.find(r => r.id === selectedRoute);
  const distance = useCustom ? parseFloat(customDistance) || 0 : (route?.distance || 0);

  const result = drive && distance > 0
    ? {
        ...calcQTTime(distance, drive.stats.qtSpeed, drive.stats.spoolTime),
        fuel: calcQTFuel(distance, drive.stats.fuelConsumption),
      }
    : null;

  return (
    <div className="card p-5">
      <h2 className="section-title mb-5 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-cyan-400" />
        Calculateur de Trajet QT
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Sélection moteur */}
        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Moteur QT</label>
          <select
            value={selectedDrive}
            onChange={e => setSelectedDrive(e.target.value)}
            className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- Choisir un moteur --</option>
            {[1, 2, 3].map(size => (
              <optgroup key={size} label={`Taille ${size}`}>
                {drives.filter(d => d.size === size).map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {d.manufacturer}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Sélection route ou distance custom */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Distance</label>
            <button
              onClick={() => setUseCustom(v => !v)}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              {useCustom ? 'Routes connues' : 'Personnalisé'}
            </button>
          </div>
          {useCustom ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                value={customDistance}
                onChange={e => setCustomDistance(e.target.value)}
                placeholder="Distance en Gm"
                className="flex-1 bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-500">Gm</span>
            </div>
          ) : (
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {QT_ROUTES.map(r => (
                <option key={r.id} value={r.id}>{r.label} ({r.distance} Gm)</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Résultat */}
      {result ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-space-900/60 border border-cyan-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-cyan-400">{formatTime(result.totalSec)}</div>
            <div className="text-xs text-slate-500 mt-1">Temps total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-slate-300">{formatTime(drive.stats.spoolTime)}</div>
            <div className="text-xs text-slate-500 mt-1">Spool</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-slate-300">{formatTime(result.travelSec)}</div>
            <div className="text-xs text-slate-500 mt-1">Voyage</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-gold-400">{result.fuel.toFixed(0)} L</div>
            <div className="text-xs text-slate-500 mt-1">Carburant QT</div>
          </div>
          <div className="col-span-2 sm:col-span-4 text-center text-xs text-slate-500">
            Distance : {distance} Gm · Vitesse : {drive.stats.qtSpeed} Gm/s · {drive.name} ({drive.manufacturer})
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-space-900/60 border border-space-600/30 text-center text-slate-500 text-sm">
          Sélectionnez un moteur et une distance pour calculer le trajet.
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function QTDrives() {
  const [filterSize, setFilterSize] = useState(null);
  const [filterGrade, setFilterGrade] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [sortKey, setSortKey] = useState('stats.qtSpeed');
  const [sortDir, setSortDir] = useState('desc');

  // Fonction de tri
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Valeur d'une stat par clé (supporte "stats.xxx")
  const getValue = (item, key) => {
    if (key.startsWith('stats.')) {
      const statKey = key.replace('stats.', '');
      return item.stats[statKey];
    }
    return item[key];
  };

  // Filtres + tri
  const filtered = useMemo(() => {
    let data = [...QT_DRIVES_EXTENDED];
    if (filterSize !== null) data = data.filter(d => d.size === filterSize);
    if (filterGrade !== null) data = data.filter(d => d.grade === filterGrade);
    if (filterClass !== null) data = data.filter(d => d.classification === filterClass);
    data.sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return data;
  }, [filterSize, filterGrade, filterClass, sortKey, sortDir]);

  // Meilleure/pire valeur pour chaque stat (sur l'ensemble des données filtrées)
  const extremes = useMemo(() => {
    const statKeys = ['qtSpeed', 'spoolTime', 'fuelConsumption', 'range', 'disconnectRange', 'distortionHP'];
    const best = {};
    const worst = {};
    statKeys.forEach(k => {
      const vals = filtered.map(d => d.stats[k]).filter(v => v != null);
      if (k === 'spoolTime' || k === 'fuelConsumption') {
        // Plus bas = meilleur
        best[k] = Math.min(...vals);
        worst[k] = Math.max(...vals);
      } else {
        // Plus haut = meilleur
        best[k] = Math.max(...vals);
        worst[k] = Math.min(...vals);
      }
    });
    return { best, worst };
  }, [filtered]);

  const resetFilters = () => {
    setFilterSize(null);
    setFilterGrade(null);
    setFilterClass(null);
  };

  const hasFilters = filterSize !== null || filterGrade !== null || filterClass !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold font-display text-white">Quantum Drives</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Comparatif complet des moteurs quantiques disponibles dans Star Citizen.
              Filtrez par taille, grade ou classification, triez par n'importe quelle stat.
              Les valeurs en{' '}
              <span className="text-green-400 font-semibold">vert</span> sont les meilleures,
              en <span className="text-red-400 font-semibold">rouge</span> les moins bonnes de la sélection.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold font-display text-cyan-400">{filtered.length}</div>
            <div className="text-xs text-slate-500">moteur{filtered.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
            <Filter className="w-3.5 h-3.5" />
            Filtres
          </div>

          {/* Taille */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600 mr-1">Taille</span>
            {QT_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setFilterSize(filterSize === s ? null : s)}
                className={clsx('px-2.5 py-1 rounded text-xs font-medium transition-all', {
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40': filterSize === s,
                  'bg-space-700 text-slate-400 border border-space-600 hover:border-slate-500': filterSize !== s,
                })}
              >
                S{s}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-space-600" />

          {/* Grade */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600 mr-1">Grade</span>
            {QT_GRADES.map(g => (
              <button
                key={g}
                onClick={() => setFilterGrade(filterGrade === g ? null : g)}
                className={clsx('px-2.5 py-1 rounded text-xs font-medium transition-all', {
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40': filterGrade === g,
                  'bg-space-700 text-slate-400 border border-space-600 hover:border-slate-500': filterGrade !== g,
                })}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-space-600" />

          {/* Classification */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-slate-600 mr-1">Type</span>
            {QT_CLASSIFICATIONS.map(c => (
              <button
                key={c}
                onClick={() => setFilterClass(filterClass === c ? null : c)}
                className={clsx('px-2.5 py-1 rounded text-xs font-medium transition-all', {
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40': filterClass === c,
                  'bg-space-700 text-slate-400 border border-space-600 hover:border-slate-500': filterClass !== c,
                })}
              >
                {c}
              </button>
            ))}
          </div>

          {hasFilters && (
            <>
              <div className="w-px h-4 bg-space-600" />
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </button>
            </>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500/40 border border-green-500/60" />
          <span className="text-slate-500">Meilleure valeur dans la sélection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500/60" />
          <span className="text-slate-500">Moins bonne valeur dans la sélection</span>
        </div>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-600/50">
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    className={clsx(
                      'text-left text-xs uppercase tracking-wide text-slate-500 px-4 py-3 whitespace-nowrap',
                      col.sortable && 'cursor-pointer hover:text-slate-300 transition-colors select-none'
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <span className="text-slate-600">
                          {sortKey === col.key
                            ? sortDir === 'asc'
                              ? <ChevronUp className="w-3 h-3 text-cyan-400" />
                              : <ChevronDown className="w-3 h-3 text-cyan-400" />
                            : <ChevronDown className="w-3 h-3 opacity-30" />
                          }
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="text-center py-12 text-slate-500">
                    Aucun moteur correspondant aux filtres sélectionnés.
                  </td>
                </tr>
              )}
              {filtered.map((drive, idx) => (
                <tr
                  key={drive.id}
                  className={clsx(
                    'border-b border-space-700/30 hover:bg-space-800/40 transition-colors',
                    idx % 2 === 0 ? 'bg-transparent' : 'bg-space-900/20'
                  )}
                >
                  {COLUMNS.map(col => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render(drive, extremes.best, extremes.worst)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculateur */}
      <QTCalculator drives={QT_DRIVES_EXTENDED} />

      {/* Info sur les stats */}
      <div className="card p-4">
        <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          Glossaire des Stats
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Vitesse (Gm/s)', desc: 'Gigamètres parcourus par seconde en voyage quantique.' },
            { label: 'Spool (s)', desc: 'Temps avant le déclenchement du saut. Plus court = mieux en combat.' },
            { label: 'Consomm. (L/Mkm)', desc: 'Litres de carburant QT consommés par mégamètre. Plus bas = mieux.' },
            { label: 'Portée (Gm)', desc: 'Distance maximale atteignable avec un plein de carburant QT.' },
            { label: 'Déconnexion (km)', desc: 'Distance à laquelle d\'autres joueurs peuvent vous sortir du QT. Plus grand = plus dur à interdire.' },
            { label: 'Distorsion HP', desc: 'Points de vie contre les dommages de distorsion (armes EMP/QT).' },
          ].map(stat => (
            <div key={stat.label} className="p-3 rounded-lg bg-space-900/60 border border-space-600/30">
              <div className="text-xs font-semibold text-slate-300 mb-1">{stat.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
