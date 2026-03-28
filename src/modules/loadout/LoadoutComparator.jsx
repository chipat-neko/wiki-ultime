/**
 * LoadoutComparator.jsx — Comparaison côte à côte de 2 builds méta
 * Route : intégré dans LoadoutBuilder via onglet "Comparer"
 */
import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  GitCompare, Crosshair, Shield, Zap, Wind, Gauge,
  Target, Flame, Info, ChevronRight, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import { SHIPS } from '../../datasets/ships.js';
import { SHIP_WEAPONS } from '../../datasets/shipweapons.js';
import { POWER_PLANTS, SHIELDS, QUANTUM_DRIVES, COOLERS, MISSILES } from '../../datasets/shipcomponents.js';
import {
  LOADOUT_CONFIGS,
  BUDGET_TIERS,
  getBudgetTier,
  formatBudgetPrice,
  calcTotalDPS,
  calcEnergyBudget,
  calcEMSignature,
  calcShieldRegenTime,
} from '../../datasets/loadoutData.js';

// ── Index rapide des composants ──
const COMP_INDEX = {
  weapons:  Object.fromEntries(SHIP_WEAPONS.map(w => [w.id, w])),
  missiles: Object.fromEntries(MISSILES.map(m => [m.id, m])),
  pp:       Object.fromEntries(POWER_PLANTS.map(p => [p.id, p])),
  shields:  Object.fromEntries(SHIELDS.map(s => [s.id, s])),
  coolers:  Object.fromEntries(COOLERS.map(c => [c.id, c])),
  qt:       Object.fromEntries(QUANTUM_DRIVES.map(q => [q.id, q])),
};

// ── Résoudre un build complet ──
function resolveBuild(cfg) {
  if (!cfg) return null;
  const ship = SHIPS.find(s => s.id === cfg.shipId) || null;

  const weapons = {};
  for (const [slotId, wId] of Object.entries(cfg.weapons || {})) {
    if (wId) weapons[slotId] = COMP_INDEX.weapons[wId] || null;
  }

  const missiles = {};
  for (const [slotId, mId] of Object.entries(cfg.missiles || {})) {
    if (mId) missiles[slotId] = COMP_INDEX.missiles[mId] || null;
  }

  const sys = cfg.systems || {};
  const pp      = sys.pp      ? COMP_INDEX.pp[sys.pp]           : null;
  const shield  = sys.shield  ? COMP_INDEX.shields[sys.shield]  : null;
  const cooler1 = sys.cooler1 ? COMP_INDEX.coolers[sys.cooler1] : null;
  const cooler2 = sys.cooler2 ? COMP_INDEX.coolers[sys.cooler2] : null;
  const qt      = sys.qt      ? COMP_INDEX.qt[sys.qt]           : null;

  const { totalDPS, sustainedDPS } = calcTotalDPS(weapons);
  const energy    = calcEnergyBudget({ weaponsMap: weapons, pp, shield, cooler1, cooler2, qt });
  const emSig     = calcEMSignature({ pp, shield, cooler1, cooler2, qt });
  const regenTime = calcShieldRegenTime(shield);
  const shieldHp  = shield?.stats?.shieldHp ?? ship?.specs?.shieldHp ?? 0;
  const tier      = getBudgetTier(cfg.estimatedPrice);

  return {
    cfg, ship, weapons, missiles,
    pp, shield, cooler1, cooler2, qt,
    totalDPS, sustainedDPS,
    energy, emSig, regenTime, shieldHp, tier,
  };
}

// ── Icône de comparaison (flèche haut/bas/neutre) ──
function CompareIcon({ a, b, higherIsBetter = true }) {
  if (a == null || b == null || a === b) return <Minus className="w-3 h-3 text-slate-600" />;
  const aWins = higherIsBetter ? a > b : a < b;
  if (aWins) return <ArrowUpRight className="w-3 h-3 text-green-400" />;
  return <ArrowDownRight className="w-3 h-3 text-red-400" />;
}

// ── Couleur de valeur comparée ──
function cmpColor(val, other, higherIsBetter = true) {
  if (val == null || other == null || val === other) return 'text-slate-300';
  const wins = higherIsBetter ? val > other : val < other;
  return wins ? 'text-green-400' : 'text-red-400';
}

// ── Ligne de stat comparée ──
function StatRow({ label, icon: Icon, iconColor, valA, valB, unit = '', higherIsBetter = true, format }) {
  const fmtA = format ? format(valA) : (valA != null ? valA.toLocaleString() : '—');
  const fmtB = format ? format(valB) : (valB != null ? valB.toLocaleString() : '—');
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-1.5 border-b border-space-700/50 last:border-0">
      <div className={clsx('text-right font-mono text-sm font-semibold', cmpColor(valA, valB, higherIsBetter))}>
        {fmtA}{unit && <span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>}
      </div>
      <div className="flex items-center gap-1.5 justify-center min-w-[120px]">
        {Icon && <Icon className={clsx('w-3.5 h-3.5', iconColor || 'text-slate-500')} />}
        <span className="text-[11px] text-slate-400 whitespace-nowrap">{label}</span>
      </div>
      <div className={clsx('font-mono text-sm font-semibold', cmpColor(valB, valA, higherIsBetter))}>
        {fmtB}{unit && <span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

// ── Liste d'armes/missiles ──
function EquipList({ items, emptyLabel }) {
  const entries = Object.values(items).filter(Boolean);
  if (entries.length === 0) return <p className="text-[11px] text-slate-600 italic">{emptyLabel}</p>;

  // Compter les doublons
  const counts = {};
  for (const item of entries) {
    counts[item.id] = (counts[item.id] || { item, count: 0 });
    counts[item.id].count++;
  }

  return (
    <div className="space-y-1">
      {Object.values(counts).map(({ item, count }) => (
        <div key={item.id} className="flex items-center gap-1.5 text-xs">
          <span className="badge badge-slate text-[10px] font-mono">S{item.size}</span>
          <span className="text-slate-300 truncate">{count > 1 ? `${count}x ` : ''}{item.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Composant système ──
function SystemInfo({ label, comp }) {
  if (!comp) return <p className="text-[11px] text-slate-600 italic">Stock</p>;
  return (
    <div className="text-xs">
      <div className="text-slate-300 font-medium truncate">{comp.name}</div>
      <div className="text-[10px] text-slate-500">{comp.manufacturer} — Gr.{comp.grade}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function LoadoutComparator({ selectedShipId }) {
  const [buildIdA, setBuildIdA] = useState('');
  const [buildIdB, setBuildIdB] = useState('');

  // Filtrer les builds par vaisseau si un vaisseau est sélectionné
  const availableBuilds = useMemo(() => {
    if (!selectedShipId) return LOADOUT_CONFIGS;
    return LOADOUT_CONFIGS.filter(c => c.shipId === selectedShipId);
  }, [selectedShipId]);

  // Tous les builds (pour le second sélecteur, pas forcément filtré)
  const allBuilds = LOADOUT_CONFIGS;

  const buildA = useMemo(() => resolveBuild(LOADOUT_CONFIGS.find(c => c.id === buildIdA)), [buildIdA]);
  const buildB = useMemo(() => resolveBuild(LOADOUT_CONFIGS.find(c => c.id === buildIdB)), [buildIdB]);

  const bothSelected = buildA && buildB;

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="card p-4 flex items-start gap-3 border-cyan-500/20">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          Comparez deux builds méta côte à côte. Les valeurs sont colorées en{' '}
          <span className="text-green-400 font-semibold">vert</span> (meilleur) et{' '}
          <span className="text-red-400 font-semibold">rouge</span> (moins bon) pour faciliter la lecture.
          {selectedShipId && (
            <span className="block mt-1 text-slate-500">
              Filtré par le vaisseau sélectionné. Changez de vaisseau dans l'onglet Constructeur pour comparer d'autres builds.
            </span>
          )}
        </p>
      </div>

      {/* Sélecteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Build A */}
        <div className="card p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Build A</label>
          <select
            value={buildIdA}
            onChange={e => setBuildIdA(e.target.value)}
            className="select text-xs w-full"
          >
            <option value="">— Choisir un build —</option>
            {(selectedShipId ? availableBuilds : allBuilds).map(cfg => {
              const ship = SHIPS.find(s => s.id === cfg.shipId);
              const tier = getBudgetTier(cfg.estimatedPrice);
              return (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.name} — {ship?.name || '?'} (~{formatBudgetPrice(cfg.estimatedPrice)})
                </option>
              );
            })}
          </select>
          {buildA && (
            <div className="flex items-center gap-2 pt-1">
              <span className={clsx('badge', buildA.cfg.color)}>{buildA.cfg.name}</span>
              <span className={clsx('badge text-[10px]', buildA.tier.badge)}>
                ~{formatBudgetPrice(buildA.cfg.estimatedPrice)} aUEC
              </span>
            </div>
          )}
        </div>

        {/* Build B */}
        <div className="card p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Build B</label>
          <select
            value={buildIdB}
            onChange={e => setBuildIdB(e.target.value)}
            className="select text-xs w-full"
          >
            <option value="">— Choisir un build —</option>
            {(selectedShipId ? availableBuilds : allBuilds).map(cfg => {
              const ship = SHIPS.find(s => s.id === cfg.shipId);
              const tier = getBudgetTier(cfg.estimatedPrice);
              return (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.name} — {ship?.name || '?'} (~{formatBudgetPrice(cfg.estimatedPrice)})
                </option>
              );
            })}
          </select>
          {buildB && (
            <div className="flex items-center gap-2 pt-1">
              <span className={clsx('badge', buildB.cfg.color)}>{buildB.cfg.name}</span>
              <span className={clsx('badge text-[10px]', buildB.tier.badge)}>
                ~{formatBudgetPrice(buildB.cfg.estimatedPrice)} aUEC
              </span>
            </div>
          )}
        </div>
      </div>

      {/* État vide */}
      {!bothSelected && (
        <div className="card p-8 text-center space-y-3">
          <GitCompare className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500">
            Sélectionnez deux builds pour afficher la comparaison.
          </p>
        </div>
      )}

      {/* Comparaison */}
      {bothSelected && (
        <div className="space-y-4">
          {/* En-têtes colonnes */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <div className="text-center">
              <div className="font-semibold text-slate-200 text-sm">{buildA.cfg.name}</div>
              {buildA.ship && <div className="text-[11px] text-slate-500">{buildA.ship.name}</div>}
            </div>
            <div className="flex items-center justify-center w-[120px]">
              <GitCompare className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-200 text-sm">{buildB.cfg.name}</div>
              {buildB.ship && <div className="text-[11px] text-slate-500">{buildB.ship.name}</div>}
            </div>
          </div>

          {/* Stats de combat */}
          <div className="card p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-slate-200">Puissance de feu</h3>
            </div>
            <StatRow
              label="DPS Alpha"
              icon={Crosshair}
              iconColor="text-red-400"
              valA={buildA.totalDPS}
              valB={buildB.totalDPS}
              higherIsBetter
            />
            <StatRow
              label="DPS Soutenu"
              icon={Crosshair}
              iconColor="text-orange-400"
              valA={buildA.sustainedDPS}
              valB={buildB.sustainedDPS}
              higherIsBetter
            />
          </div>

          {/* Défenses */}
          <div className="card p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Défenses</h3>
            </div>
            <StatRow
              label="Bouclier HP"
              icon={Shield}
              iconColor="text-cyan-400"
              valA={buildA.shieldHp}
              valB={buildB.shieldHp}
              higherIsBetter
            />
            <StatRow
              label="Regen total"
              icon={Shield}
              iconColor="text-blue-400"
              valA={buildA.regenTime}
              valB={buildB.regenTime}
              unit="s"
              higherIsBetter={false}
            />
            {buildA.shield?.stats?.regenRate != null && buildB.shield?.stats?.regenRate != null && (
              <StatRow
                label="Regen / sec"
                icon={Shield}
                iconColor="text-blue-300"
                valA={buildA.shield.stats.regenRate}
                valB={buildB.shield.stats.regenRate}
                unit="/s"
                higherIsBetter
              />
            )}
          </div>

          {/* Énergie */}
          <div className="card p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Énergie</h3>
            </div>
            <StatRow
              label="Sortie réacteur"
              icon={Zap}
              iconColor="text-green-400"
              valA={buildA.energy.powerOutput}
              valB={buildB.energy.powerOutput}
              unit=" EU"
              higherIsBetter
            />
            <StatRow
              label="Consommation"
              icon={Zap}
              iconColor="text-amber-400"
              valA={buildA.energy.powerDraw}
              valB={buildB.energy.powerDraw}
              unit=" EU"
              higherIsBetter={false}
            />
            <StatRow
              label="Balance"
              icon={Zap}
              iconColor="text-cyan-400"
              valA={buildA.energy.balance}
              valB={buildB.energy.balance}
              unit=" EU"
              higherIsBetter
              format={v => (v >= 0 ? `+${v}` : String(v))}
            />
          </div>

          {/* Signature */}
          <div className="card p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-200">Furtivité</h3>
            </div>
            <StatRow
              label="Signature EM+IR"
              icon={Gauge}
              iconColor="text-purple-400"
              valA={buildA.emSig}
              valB={buildB.emSig}
              higherIsBetter={false}
            />
          </div>

          {/* Équipement détaillé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Build A détails */}
            <div className="card p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {buildA.cfg.name} — Détails
              </h3>

              {/* Armes */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Armes</span>
                </div>
                <EquipList items={buildA.weapons} emptyLabel="Aucune arme" />
              </div>

              {/* Missiles */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Missiles</span>
                </div>
                <EquipList items={buildA.missiles} emptyLabel="Aucun missile" />
              </div>

              {/* Systèmes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Systèmes</span>
                </div>
                <div className="grid gap-2">
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">Power Plant</div>
                    <SystemInfo label="PP" comp={buildA.pp} />
                  </div>
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">Bouclier</div>
                    <SystemInfo label="Shield" comp={buildA.shield} />
                  </div>
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">Refroidisseurs</div>
                    <SystemInfo label="Cooler" comp={buildA.cooler1} />
                    {buildA.cooler2 && <div className="mt-1"><SystemInfo label="Cooler 2" comp={buildA.cooler2} /></div>}
                  </div>
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">QT Drive</div>
                    <SystemInfo label="QT" comp={buildA.qt} />
                  </div>
                </div>
              </div>
            </div>

            {/* Build B détails */}
            <div className="card p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {buildB.cfg.name} — Détails
              </h3>

              {/* Armes */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Armes</span>
                </div>
                <EquipList items={buildB.weapons} emptyLabel="Aucune arme" />
              </div>

              {/* Missiles */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Missiles</span>
                </div>
                <EquipList items={buildB.missiles} emptyLabel="Aucun missile" />
              </div>

              {/* Systèmes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold text-slate-300">Systèmes</span>
                </div>
                <div className="grid gap-2">
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">Power Plant</div>
                    <SystemInfo label="PP" comp={buildB.pp} />
                  </div>
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">Bouclier</div>
                    <SystemInfo label="Shield" comp={buildB.shield} />
                  </div>
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">Refroidisseurs</div>
                    <SystemInfo label="Cooler" comp={buildB.cooler1} />
                    {buildB.cooler2 && <div className="mt-1"><SystemInfo label="Cooler 2" comp={buildB.cooler2} /></div>}
                  </div>
                  <div className="p-2 rounded bg-space-900/60">
                    <div className="text-[10px] text-slate-500 mb-0.5">QT Drive</div>
                    <SystemInfo label="QT" comp={buildB.qt} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé prix */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Résumé des coûts</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={clsx('p-3 rounded-lg text-center', buildA.tier.bg, 'border', buildA.tier.border)}>
                <div className={clsx('text-lg font-bold font-mono', buildA.tier.color)}>
                  ~{formatBudgetPrice(buildA.cfg.estimatedPrice)} aUEC
                </div>
                <span className={clsx('badge mt-1', buildA.tier.badge)}>{buildA.tier.label}</span>
              </div>
              <div className={clsx('p-3 rounded-lg text-center', buildB.tier.bg, 'border', buildB.tier.border)}>
                <div className={clsx('text-lg font-bold font-mono', buildB.tier.color)}>
                  ~{formatBudgetPrice(buildB.cfg.estimatedPrice)} aUEC
                </div>
                <span className={clsx('badge mt-1', buildB.tier.badge)}>{buildB.tier.label}</span>
              </div>
            </div>
            {buildA.cfg.estimatedPrice !== buildB.cfg.estimatedPrice && (
              <div className="mt-3 text-center text-xs text-slate-500">
                Différence :{' '}
                <span className="font-mono font-semibold text-slate-300">
                  {formatBudgetPrice(Math.abs(buildA.cfg.estimatedPrice - buildB.cfg.estimatedPrice))} aUEC
                </span>
                {' '}en faveur du build{' '}
                <span className="text-cyan-400">
                  {buildA.cfg.estimatedPrice < buildB.cfg.estimatedPrice ? 'A' : 'B'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
