import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  Fuel, ChevronDown, ChevronUp, Lightbulb, MapPin, Rocket,
  Plus, Trash2, ArrowRight, AlertTriangle,
} from 'lucide-react';

/* ─── Données ─── */

const SHIPS = [
  { id: 'aurora', name: 'Aurora MR', h2: 30000, qt: 2850, size: 'S' },
  { id: 'gladius', name: 'Gladius', h2: 20000, qt: 3100, size: 'S' },
  { id: 'titan', name: 'Avenger Titan', h2: 42000, qt: 3800, size: 'S' },
  { id: 'nomad', name: 'Nomad', h2: 38000, qt: 3500, size: 'S' },
  { id: '300i', name: '300i', h2: 32000, qt: 3200, size: 'S' },
  { id: 'cutlass', name: 'Cutlass Black', h2: 62000, qt: 5000, size: 'M' },
  { id: 'freelancer', name: 'Freelancer', h2: 67500, qt: 6000, size: 'M' },
  { id: 'connie', name: 'Constellation Andromeda', h2: 95000, qt: 9500, size: 'L' },
  { id: 'vanguard', name: 'Vanguard Warden', h2: 50000, qt: 6500, size: 'M' },
  { id: 'msr', name: 'Mercury Star Runner', h2: 75000, qt: 7500, size: 'L' },
  { id: 'prospector', name: 'Prospector', h2: 45000, qt: 4200, size: 'S' },
  { id: 'c2', name: 'Hercules C2', h2: 120000, qt: 12000, size: 'L' },
  { id: 'carrack', name: 'Carrack', h2: 135000, qt: 15000, size: 'L' },
  { id: 'hammerhead', name: 'Hammerhead', h2: 100000, qt: 10000, size: 'L' },
  { id: 'eclipse', name: 'Eclipse', h2: 25000, qt: 3600, size: 'S' },
  { id: 'redeemer', name: 'Redeemer', h2: 55000, qt: 5500, size: 'M' },
];

const QT_DRIVES = [
  { id: 'default', name: 'Par défaut (vaisseau)', speedMult: 1.0, fuelMult: 1.0 },
  { id: 'atlas', name: 'Atlas (L)', speedMult: 0.85, fuelMult: 0.80 },
  { id: 'pontes', name: 'Pontes (L)', speedMult: 1.0, fuelMult: 1.0 },
  { id: 'ts2', name: 'TS-2 (L)', speedMult: 1.10, fuelMult: 1.15 },
  { id: 'vk00', name: 'VK-00 (S)', speedMult: 1.05, fuelMult: 1.05 },
  { id: 'beacon', name: 'Beacon (S)', speedMult: 0.90, fuelMult: 0.85 },
  { id: 'odyssey', name: 'Odyssey (M)', speedMult: 1.0, fuelMult: 0.95 },
  { id: 'hemera', name: 'Hemera (M)', speedMult: 1.08, fuelMult: 1.10 },
];

const LOCATIONS = [
  { id: 'po', name: 'Port Olisar', system: 'Stanton' },
  { id: 'lorville', name: 'Lorville (Hurston)', system: 'Stanton' },
  { id: 'a18', name: 'Area 18 (ArcCorp)', system: 'Stanton' },
  { id: 'nb', name: 'New Babbage (MicroTech)', system: 'Stanton' },
  { id: 'orison', name: 'Orison (Crusader)', system: 'Stanton' },
  { id: 'grimhex', name: 'Grim HEX', system: 'Stanton' },
  { id: 'everus', name: 'Everus Harbor (Hurston)', system: 'Stanton' },
  { id: 'baijini', name: 'Baijini Point (ArcCorp)', system: 'Stanton' },
  { id: 'portT', name: 'Port Tressler (MicroTech)', system: 'Stanton' },
  { id: 'crul1', name: 'CRU-L1', system: 'Stanton' },
  { id: 'hurl1', name: 'HUR-L1', system: 'Stanton' },
  { id: 'hurl2', name: 'HUR-L2', system: 'Stanton' },
  { id: 'arcl1', name: 'ARC-L1', system: 'Stanton' },
  { id: 'micl1', name: 'MIC-L1', system: 'Stanton' },
  { id: 'pyro_gate', name: 'Pyro Jump Point', system: 'Stanton/Pyro' },
  { id: 'ruin', name: 'Ruin Station (Pyro)', system: 'Pyro' },
];

// Distances approximatives en Mm (millions de mètres)
const DISTANCES = {
  'po-lorville': 380, 'po-a18': 420, 'po-nb': 480, 'po-orison': 320,
  'po-grimhex': 180, 'po-everus': 360, 'po-baijini': 400, 'po-portT': 460,
  'po-crul1': 150, 'po-hurl1': 200, 'po-hurl2': 250, 'po-arcl1': 350, 'po-micl1': 400,
  'po-pyro_gate': 550, 'lorville-a18': 500, 'lorville-nb': 600, 'lorville-orison': 450,
  'lorville-grimhex': 300, 'lorville-everus': 50, 'lorville-crul1': 350,
  'a18-nb': 550, 'a18-orison': 480, 'a18-baijini': 60, 'a18-arcl1': 180,
  'nb-orison': 520, 'nb-portT': 55, 'nb-micl1': 200,
  'orison-crul1': 100, 'orison-grimhex': 250,
  'grimhex-crul1': 120, 'pyro_gate-ruin': 300,
  'hurl1-hurl2': 150, 'hurl1-lorville': 180, 'hurl2-lorville': 220,
};

function getDistance(a, b) {
  if (a === b) return 0;
  return DISTANCES[`${a}-${b}`] || DISTANCES[`${b}-${a}`] || 400;
}

const BASE_QT_SPEED = 0.2; // fraction of c → ~60,000 km/s
const QT_FUEL_PER_MM = 1.2; // base fuel per Mm (rough estimate)
const H2_PER_MINUTE_SCM = 150; // base H2 burn per minute in SCM
const REFUEL_COST_PER_UNIT = 0.5; // aUEC per fuel unit

const TIPS = [
  'Coupez vos moteurs en vol balistique pour économiser du H2 — votre vaisseau glisse sans consommer.',
  'Les QT drives « économiques » (Atlas, Beacon) consomment moins mais sont plus lents. Idéal pour les longs trajets cargo.',
  'Surveillez votre jauge H2 en atmosphère — la consommation est 2-3x plus élevée qu\'en espace.',
  'Ravitaillez toujours avant un jump vers Pyro — les stations y sont rares et espacées.',
  'En combat, le boost et les manœuvres brusques consomment beaucoup de H2. Gérez votre throttle.',
  'Les vaisseaux légers ont peu de réserves QT — planifiez vos arrêts ravitaillement sur les routes longues.',
];

/* ─── Composant principal ─── */

export default function FuelCalculator() {
  const [shipId, setShipId] = useState('titan');
  const [driveId, setDriveId] = useState('default');
  const [legs, setLegs] = useState([{ from: 'po', to: 'lorville' }]);

  const ship = SHIPS.find(s => s.id === shipId) || SHIPS[0];
  const drive = QT_DRIVES.find(d => d.id === driveId) || QT_DRIVES[0];

  const results = useMemo(() => {
    let totalDist = 0;
    let totalQtFuel = 0;
    let totalTime = 0;
    const legResults = legs.map(leg => {
      const dist = getDistance(leg.from, leg.to);
      const qtFuel = dist * QT_FUEL_PER_MM * drive.fuelMult * (ship.size === 'L' ? 1.5 : ship.size === 'M' ? 1.2 : 1.0);
      const time = dist / (BASE_QT_SPEED * drive.speedMult * 60000); // minutes
      totalDist += dist;
      totalQtFuel += qtFuel;
      totalTime += time;
      return { dist, qtFuel, time, fromName: LOCATIONS.find(l => l.id === leg.from)?.name, toName: LOCATIONS.find(l => l.id === leg.to)?.name };
    });
    const qtPercent = Math.min((totalQtFuel / ship.qt) * 100, 100);
    const h2ScmEstimate = totalTime * H2_PER_MINUTE_SCM * (ship.size === 'L' ? 2.0 : ship.size === 'M' ? 1.4 : 1.0);
    const h2Percent = Math.min((h2ScmEstimate / ship.h2) * 100, 100);
    const jumpsBeforeRefuel = totalQtFuel > 0 ? Math.floor(ship.qt / (totalQtFuel / legs.length)) : 0;
    const refuelCost = Math.round((totalQtFuel + h2ScmEstimate) * REFUEL_COST_PER_UNIT);
    return { legResults, totalDist, totalQtFuel, totalTime, qtPercent, h2ScmEstimate, h2Percent, jumpsBeforeRefuel, refuelCost };
  }, [legs, ship, drive]);

  const addLeg = () => {
    const lastTo = legs[legs.length - 1]?.to || 'po';
    setLegs(prev => [...prev, { from: lastTo, to: 'po' }]);
  };
  const removeLeg = (i) => setLegs(prev => prev.filter((_, idx) => idx !== i));
  const updateLeg = (i, field, val) => setLegs(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const fuelBarColor = (pct) => pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
          <Fuel size={32} className="text-cyan-400" />
          Calculateur de Carburant
        </h1>
        <p className="text-slate-400 text-lg">Estimez la consommation H2 et Quantum pour vos trajets</p>
        <span className="inline-block badge-cyan text-xs mt-1">Alpha 4.6</span>
      </div>

      {/* Sélection vaisseau + drive */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Vaisseau</label>
          <select
            value={shipId}
            onChange={e => setShipId(e.target.value)}
            className="w-full bg-space-800 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            {SHIPS.map(s => (
              <option key={s.id} value={s.id}>{s.name} — H2: {s.h2.toLocaleString()} / QT: {s.qt.toLocaleString()}</option>
            ))}
          </select>
          <div className="flex gap-3 text-xs text-slate-500">
            <span>H2: <span className="text-cyan-400">{ship.h2.toLocaleString()}</span></span>
            <span>QT: <span className="text-purple-400">{ship.qt.toLocaleString()}</span></span>
            <span>Taille: <span className="text-yellow-400">{ship.size}</span></span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">QT Drive</label>
          <select
            value={driveId}
            onChange={e => setDriveId(e.target.value)}
            className="w-full bg-space-800 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            {QT_DRIVES.map(d => (
              <option key={d.id} value={d.id}>{d.name} — vitesse ×{d.speedMult} / conso ×{d.fuelMult}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legs / étapes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <MapPin size={18} className="text-cyan-400" />
            Itinéraire ({legs.length} étape{legs.length > 1 ? 's' : ''})
          </h2>
          <button
            onClick={addLeg}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={14} /> Ajouter une étape
          </button>
        </div>

        {legs.map((leg, i) => (
          <div key={i} className="flex items-center gap-2 border border-space-400/20 rounded-lg p-3 bg-space-800/40">
            <span className="text-xs text-slate-500 font-bold w-6">#{i + 1}</span>
            <select
              value={leg.from}
              onChange={e => updateLeg(i, 'from', e.target.value)}
              className="flex-1 bg-space-800 border border-space-400/20 rounded px-2 py-1.5 text-sm text-slate-200"
            >
              {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <ArrowRight size={16} className="text-slate-500 shrink-0" />
            <select
              value={leg.to}
              onChange={e => updateLeg(i, 'to', e.target.value)}
              className="flex-1 bg-space-800 border border-space-400/20 rounded px-2 py-1.5 text-sm text-slate-200"
            >
              {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <span className="text-xs text-slate-500 w-16 text-right">{getDistance(leg.from, leg.to)} Mm</span>
            {legs.length > 1 && (
              <button onClick={() => removeLeg(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Résultats */}
      <div className="border border-cyan-500/30 rounded-lg bg-space-800/50 p-5 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Rocket size={18} className="text-cyan-400" />
          Résultats
        </h2>

        {/* Détails par étape */}
        {results.legResults.length > 1 && (
          <div className="space-y-1">
            {results.legResults.map((lr, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-400">
                <span className="text-slate-500 w-6">#{i + 1}</span>
                <span className="flex-1">{lr.fromName} → {lr.toName}</span>
                <span>{lr.dist} Mm</span>
                <span className="text-purple-400">{Math.round(lr.qtFuel)} QT</span>
                <span className="text-cyan-400">{lr.time.toFixed(1)} min</span>
              </div>
            ))}
            <div className="border-t border-space-400/20 mt-2 pt-2" />
          </div>
        )}

        {/* Totaux */}
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="text-center p-3 border border-space-400/20 rounded-lg bg-space-900/40">
            <p className="text-2xl font-bold text-slate-100">{results.totalDist} <span className="text-sm text-slate-500">Mm</span></p>
            <p className="text-xs text-slate-500">Distance totale</p>
          </div>
          <div className="text-center p-3 border border-space-400/20 rounded-lg bg-space-900/40">
            <p className="text-2xl font-bold text-cyan-400">{results.totalTime.toFixed(1)} <span className="text-sm text-slate-500">min</span></p>
            <p className="text-xs text-slate-500">Temps QT estimé</p>
          </div>
          <div className="text-center p-3 border border-space-400/20 rounded-lg bg-space-900/40">
            <p className="text-2xl font-bold text-yellow-400">{results.jumpsBeforeRefuel}</p>
            <p className="text-xs text-slate-500">Sauts avant ravitaillement</p>
          </div>
          <div className="text-center p-3 border border-space-400/20 rounded-lg bg-space-900/40">
            <p className="text-2xl font-bold text-green-400">{results.refuelCost.toLocaleString()} <span className="text-sm text-slate-500">aUEC</span></p>
            <p className="text-xs text-slate-500">Coût ravitaillement estimé</p>
          </div>
        </div>

        {/* Barres de carburant */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-400 font-semibold">Quantum Fuel</span>
              <span className="text-slate-400">{Math.round(results.totalQtFuel)} / {ship.qt} ({results.qtPercent.toFixed(1)}%)</span>
            </div>
            <div className="w-full h-4 bg-space-900/60 rounded-full overflow-hidden border border-space-400/20">
              <div className={clsx('h-full rounded-full transition-all', fuelBarColor(results.qtPercent))} style={{ width: `${Math.min(results.qtPercent, 100)}%` }} />
            </div>
            {results.qtPercent > 90 && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertTriangle size={12} /> Attention : carburant QT insuffisant pour ce trajet !
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-cyan-400 font-semibold">Hydrogène (H2)</span>
              <span className="text-slate-400">{Math.round(results.h2ScmEstimate)} / {ship.h2} ({results.h2Percent.toFixed(1)}%)</span>
            </div>
            <div className="w-full h-4 bg-space-900/60 rounded-full overflow-hidden border border-space-400/20">
              <div className={clsx('h-full rounded-full transition-all', fuelBarColor(results.h2Percent))} style={{ width: `${Math.min(results.h2Percent, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Lightbulb size={18} className="text-yellow-400" />
          Conseils carburant
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 border border-space-400/20 rounded-lg p-3 bg-space-800/40">
              <span className="text-yellow-400 font-bold text-sm mt-0.5 shrink-0">#{i + 1}</span>
              <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
