/**
 * LoadoutBuilder.jsx — Constructeur de Loadout de Vaisseau
 * Inspiré d'erkul.games — Star Citizen Wiki Ultime
 * Route : /loadout
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Crosshair, Rocket, Shield, Zap, Flame, Package,
  Copy, Check, RotateCcw, ChevronDown, ChevronUp,
  X, Target, Wind, Gauge, AlertTriangle, Info,
  Star, Compass, Eye, EyeOff, Skull, Share2, Users,
  Download, Upload, GitCompare, Wifi, RefreshCw,
} from 'lucide-react';
import { useLiveComponents } from '../../hooks/useLiveData.js';
import { SHIPS } from '../../datasets/ships.js';
import { supabase } from '../../lib/supabase.js';
import ShareBuildModal from '../builds/ShareBuildModal.jsx';
import LoadoutComparator from './LoadoutComparator.jsx';
import { SHIP_WEAPONS } from '../../datasets/shipweapons.js';
import { POWER_PLANTS, SHIELDS, QUANTUM_DRIVES, COOLERS, MISSILES } from '../../datasets/shipcomponents.js';
import {
  LOADOUT_CONFIGS,
  BUDGET_TIERS,
  getBudgetTier,
  formatBudgetPrice,
  parseWeaponSlots,
  parseMissileSlots,
  getComponentSizes,
  calcTotalDPS,
  calcEnergyBudget,
  calcEMSignature,
  calcShieldRegenTime,
} from '../../datasets/loadoutData.js';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'builder',  label: 'Constructeur', icon: Crosshair },
  { id: 'meta',     label: 'Builds Méta',  icon: Star },
  { id: 'compare',  label: 'Comparer',     icon: GitCompare },
  { id: 'community', label: 'Communauté',  icon: Users },
];

const META_ICONS = {
  Flame:    Flame,
  Crosshair: Crosshair,
  EyeOff:   EyeOff,
  Package:  Package,
  Compass:  Compass,
  Skull:    Skull,
};

const CLASS_COLORS = {
  energy:     'text-cyan-400',
  ballistic:  'text-amber-400',
  distortion: 'text-purple-400',
};
const CLASS_BADGE = {
  energy:     'badge-cyan',
  ballistic:  'badge-yellow',
  distortion: 'badge-purple',
};

// Index rapide
const WEAPONS_BY_SIZE = SHIP_WEAPONS.reduce((acc, w) => {
  const s = w.size;
  if (!acc[s]) acc[s] = [];
  acc[s].push(w);
  return acc;
}, {});

const MISSILES_BY_SIZE = MISSILES.reduce((acc, m) => {
  const s = m.size;
  if (!acc[s]) acc[s] = [];
  acc[s].push(m);
  return acc;
}, {});

const PP_BY_SIZE      = POWER_PLANTS.reduce((a, c) => { if (!a[c.size]) a[c.size] = []; a[c.size].push(c); return a; }, {});
const SHIELDS_BY_SIZE = SHIELDS.reduce((a, c) => { if (!a[c.size]) a[c.size] = []; a[c.size].push(c); return a; }, {});
const COOLERS_BY_SIZE = COOLERS.reduce((a, c) => { if (!a[c.size]) a[c.size] = []; a[c.size].push(c); return a; }, {});
const QT_BY_SIZE      = QUANTUM_DRIVES.reduce((a, c) => { if (!a[c.size]) a[c.size] = []; a[c.size].push(c); return a; }, {});

const ALL_COMPONENTS = {
  weapons:   Object.fromEntries(SHIP_WEAPONS.map(w => [w.id, w])),
  missiles:  Object.fromEntries(MISSILES.map(m => [m.id, m])),
  pp:        Object.fromEntries(POWER_PLANTS.map(p => [p.id, p])),
  shields:   Object.fromEntries(SHIELDS.map(s => [s.id, s])),
  coolers:   Object.fromEntries(COOLERS.map(c => [c.id, c])),
  qt:        Object.fromEntries(QUANTUM_DRIVES.map(q => [q.id, q])),
};

const EMPTY_LOADOUT = { weapons: {}, missiles: {}, systems: { pp: null, shield: null, cooler1: null, cooler2: null, qt: null } };

// ─────────────────────────────────────────────────────────────────────────────
// ENCODE / DECODE URL
// ─────────────────────────────────────────────────────────────────────────────
function encodeBuild(shipId, loadout) {
  const obj = {
    s: shipId,
    w: loadout.weapons,
    m: loadout.missiles,
    sys: loadout.systems,
  };
  try { return btoa(encodeURIComponent(JSON.stringify(obj))); } catch { return null; }
}

function decodeBuild(str) {
  try {
    const obj = JSON.parse(decodeURIComponent(atob(str)));
    return {
      shipId: obj.s,
      loadout: {
        weapons:  obj.w  || {},
        missiles: obj.m  || {},
        systems:  obj.sys || { pp: null, shield: null, cooler1: null, cooler2: null, qt: null },
      },
    };
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

// Barre de progression générique
function StatBar({ value, max, colorClass = 'bg-cyan-500', label, valueLabel }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs text-slate-300 font-mono">{valueLabel ?? value}</span>
        </div>
      )}
      <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-300', colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Avatar vaisseau avec fallback
function ShipAvatar({ ship, className = 'w-full h-28 object-contain' }) {
  const [err, setErr] = useState(false);
  if (!ship) return null;
  if (!err && ship.imageUrl) {
    return (
      <img
        src={ship.imageUrl}
        alt={ship.name}
        className={className}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="flex items-center justify-center w-full h-28 opacity-20">
      <Rocket className="w-14 h-14 text-cyan-400" />
    </div>
  );
}

// Slot d'arme individuel
function WeaponSlot({ slot, selected, onChange, onReset }) {
  const options = WEAPONS_BY_SIZE[slot.size] || [];
  const weapon  = selected ? ALL_COMPONENTS.weapons[selected] : null;

  return (
    <div className="p-3 rounded-lg bg-space-900/60 border border-space-400/10 hover:border-space-400/25 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="badge badge-slate text-xs font-mono">S{slot.size}</span>
        <span className="text-xs text-slate-500">{slot.label}</span>
        {selected && (
          <button onClick={onReset} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors" title="Vider le slot">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <select
        value={selected || ''}
        onChange={e => onChange(e.target.value || null)}
        className="select text-xs w-full"
      >
        <option value="">— Vide —</option>
        {options.map(w => (
          <option key={w.id} value={w.id}>{w.name} ({w.manufacturer}) — {w.stats.dps} DPS</option>
        ))}
      </select>
      {weapon && (
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="p-1.5 rounded bg-space-800/80 text-center">
            <div className={clsx('text-xs font-bold font-mono', CLASS_COLORS[weapon.class] || 'text-slate-200')}>
              {weapon.stats.dps.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">DPS</div>
          </div>
          <div className="p-1.5 rounded bg-space-800/80 text-center">
            <div className="text-xs font-bold font-mono text-slate-200">{weapon.stats.rpm}</div>
            <div className="text-[10px] text-slate-500">RPM</div>
          </div>
          <div className="p-1.5 rounded bg-space-800/80 text-center">
            <div className="text-xs font-bold font-mono text-amber-400">{weapon.stats.powerDraw}</div>
            <div className="text-[10px] text-slate-500">PW</div>
          </div>
          <div className="col-span-3 flex items-center justify-between mt-0.5">
            <span className={clsx('badge text-[10px]', CLASS_BADGE[weapon.class] || 'badge-slate')}>{weapon.class}</span>
            <span className="text-[10px] text-slate-500">{weapon.stats.range}m portée</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Slot de missile
function MissileSlot({ slot, selected, onChange, onReset }) {
  const options = MISSILES_BY_SIZE[slot.size] || [];
  const missile = selected ? ALL_COMPONENTS.missiles[selected] : null;

  return (
    <div className="p-3 rounded-lg bg-space-900/60 border border-space-400/10 hover:border-space-400/25 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="badge badge-red text-xs font-mono">S{slot.size}</span>
        <span className="text-xs text-slate-500">{slot.label}</span>
        {selected && (
          <button onClick={onReset} className="ml-auto text-slate-600 hover:text-slate-300" title="Vider">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <select
        value={selected || ''}
        onChange={e => onChange(e.target.value || null)}
        className="select text-xs w-full"
      >
        <option value="">— Vide —</option>
        {options.map(m => (
          <option key={m.id} value={m.id}>{m.name} ({m.manufacturer}) — {m.stats.damage} DMG</option>
        ))}
      </select>
      {missile && (
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="p-1.5 rounded bg-space-800/80 text-center">
            <div className="text-xs font-bold font-mono text-red-400">{missile.stats.damage.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">DMG</div>
          </div>
          <div className="p-1.5 rounded bg-space-800/80 text-center">
            <div className="text-xs font-bold font-mono text-slate-200">{missile.stats.speed}m/s</div>
            <div className="text-[10px] text-slate-500">Vitesse</div>
          </div>
          <div className="p-1.5 rounded bg-space-800/80 text-center">
            <div className="text-xs font-bold font-mono text-slate-200">{(missile.stats.lockRange / 1000).toFixed(1)}km</div>
            <div className="text-[10px] text-slate-500">Portée</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Slot système (PP, Shield, Cooler, QT)
function SystemSlot({ label, icon: Icon, color, sizeOptions, list, value, onChange }) {
  const comp = value ? list[value] : null;
  return (
    <div className="p-3 rounded-lg bg-space-900/60 border border-space-400/10 hover:border-space-400/25 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={clsx('w-3.5 h-3.5', color)} />
        <span className="text-xs font-medium text-slate-300">{label}</span>
        {sizeOptions.length > 0 && (
          <span className="ml-auto badge badge-slate text-[10px]">S{sizeOptions[0]}</span>
        )}
      </div>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value || null)}
        className="select text-xs w-full"
      >
        <option value="">— Stock —</option>
        {sizeOptions.flatMap(s => (list[s] || []).map(c => (
          <option key={c.id} value={c.id}>{c.name} ({c.manufacturer}) Gr.{c.grade}</option>
        )))}
      </select>
      {comp && (
        <div className="mt-2 flex flex-wrap gap-1">
          {comp.stats?.powerOutput != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-green-400">{comp.stats.powerOutput.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Output</div>
            </div>
          )}
          {comp.stats?.shieldHp != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-cyan-400">{comp.stats.shieldHp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">HP</div>
            </div>
          )}
          {comp.stats?.regenRate != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-blue-400">{comp.stats.regenRate}/s</div>
              <div className="text-[10px] text-slate-500">Regen</div>
            </div>
          )}
          {comp.stats?.coolingRate != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-sky-400">{comp.stats.coolingRate.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Cooling</div>
            </div>
          )}
          {comp.stats?.qtSpeed != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-indigo-400">{(comp.stats.qtSpeed * 100).toFixed(1)}%c</div>
              <div className="text-[10px] text-slate-500">QT Speed</div>
            </div>
          )}
          {comp.stats?.emSignature != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-purple-400">{comp.stats.emSignature}</div>
              <div className="text-[10px] text-slate-500">EM Sig</div>
            </div>
          )}
          {comp.stats?.powerDraw != null && (
            <div className="p-1.5 rounded bg-space-800/80 flex-1 min-w-0 text-center">
              <div className="text-xs font-bold font-mono text-amber-400">{comp.stats.powerDraw}</div>
              <div className="text-[10px] text-slate-500">PW Draw</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PANNEAU DE STATS
// ─────────────────────────────────────────────────────────────────────────────
function StatsPanel({ ship, loadout, resolvedWeapons, resolvedSystems }) {
  const { pp, shield, cooler1, cooler2, qt } = resolvedSystems;
  const { totalDPS, sustainedDPS } = calcTotalDPS(resolvedWeapons);
  const energy   = calcEnergyBudget({ weaponsMap: resolvedWeapons, pp, shield, cooler1, cooler2, qt });
  const emSig    = calcEMSignature({ pp, shield, cooler1, cooler2, qt });
  const regenTime = calcShieldRegenTime(shield);
  const shieldHp = shield?.stats?.shieldHp ?? ship?.specs?.shieldHp ?? 0;

  const energyColor = energy.status === 'ok' ? 'bg-green-500' : 'bg-red-500';
  const energyText  = energy.status === 'ok' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-3">
      {/* DPS */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-slate-200">Puissance de feu</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-space-900/60 text-center">
            <div className="text-lg font-bold font-mono text-red-400">{totalDPS.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">DPS Alpha</div>
          </div>
          <div className="p-2.5 rounded-lg bg-space-900/60 text-center">
            <div className="text-lg font-bold font-mono text-orange-400">{sustainedDPS.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">DPS Soutenu</div>
          </div>
        </div>
        {totalDPS === 0 && (
          <p className="text-[11px] text-slate-600 italic">Aucune arme équipée</p>
        )}
      </div>

      {/* Énergie */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Budget Énergétique</h3>
          {energy.status === 'deficit' && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 ml-auto" />
          )}
        </div>
        <StatBar
          value={energy.powerDraw}
          max={Math.max(energy.powerOutput, energy.powerDraw, 1)}
          colorClass={energyColor}
          label="Consommation"
          valueLabel={`${energy.powerDraw} / ${energy.powerOutput} EU`}
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Balance</span>
          <span className={clsx('font-mono font-semibold', energyText)}>
            {energy.balance >= 0 ? '+' : ''}{energy.balance} EU
          </span>
        </div>
        {energy.status === 'deficit' && (
          <p className="text-[11px] text-red-400 bg-red-500/10 rounded p-1.5">
            Consommation dépasse la sortie du réacteur
          </p>
        )}
      </div>

      {/* Bouclier */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Boucliers</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-space-900/60 text-center">
            <div className="text-lg font-bold font-mono text-cyan-400">{shieldHp.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">HP</div>
          </div>
          <div className="p-2.5 rounded-lg bg-space-900/60 text-center">
            <div className="text-lg font-bold font-mono text-blue-400">
              {regenTime != null ? `${regenTime}s` : '—'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Regen Total</div>
          </div>
        </div>
        {shield?.stats && (
          <div className="space-y-1 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>Regen / sec</span>
              <span className="text-slate-300 font-mono">{shield.stats.regenRate}/s</span>
            </div>
            <div className="flex justify-between">
              <span>Abs. Phys / EM / Dist</span>
              <span className="text-slate-300 font-mono">
                {shield.stats.physAbsorption}% / {shield.stats.energyAbsorption}% / {shield.stats.distortionAbsorption}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Signature EM */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-200">Signature EM</h3>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-900/60">
          <div className={clsx(
            'text-2xl font-bold font-mono',
            emSig === 0 ? 'text-slate-500' :
            emSig < 500 ? 'text-green-400' :
            emSig < 1500 ? 'text-yellow-400' : 'text-red-400'
          )}>
            {emSig === 0 ? '—' : emSig.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Total EM + IR</div>
        </div>
        <StatBar
          value={emSig}
          max={3000}
          colorClass={emSig < 500 ? 'bg-green-500' : emSig < 1500 ? 'bg-yellow-500' : 'bg-red-500'}
        />
        <div className="text-[11px] text-slate-600 italic">
          {emSig === 0 ? 'Équipez des composants pour calculer la signature' :
           emSig < 500 ? 'Très discret — difficilement détectable' :
           emSig < 1000 ? 'Discret' :
           emSig < 2000 ? 'Signature modérée' : 'Signature élevée — cible facile'}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTAGE DE BUILD
// ─────────────────────────────────────────────────────────────────────────────
function SharePanel({ shipId, loadout }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const code = encodeBuild(shipId, loadout);
    if (!code) return;
    const url = `${window.location.origin}/loadout?build=${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [shipId, loadout]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Copy className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200">Partager ce build</h3>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Génère un lien partageable encodé en base64 — restaure exactement ce loadout.
      </p>
      <button
        onClick={handleCopy}
        disabled={!shipId}
        className={clsx('btn w-full', copied ? 'btn-success' : 'btn-secondary')}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Lien copié !' : 'Copier le lien'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET BUILDS MÉTA
// ─────────────────────────────────────────────────────────────────────────────
function MetaBuildsTab({ onLoad }) {
  const [budgetFilter, setBudgetFilter] = useState('all');

  const filtered = useMemo(() => {
    if (budgetFilter === 'all') return LOADOUT_CONFIGS;
    return LOADOUT_CONFIGS.filter(cfg => getBudgetTier(cfg.estimatedPrice).id === budgetFilter);
  }, [budgetFilter]);

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-start gap-3 border-cyan-500/20">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          Ces builds sont des configurations méta recommandées pour différents styles de jeu.
          Cliquez sur un build pour le charger dans le constructeur.
        </p>
      </div>

      {/* Filtres budget */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setBudgetFilter('all')}
          className={clsx('badge cursor-pointer transition-all', budgetFilter === 'all' ? 'badge-cyan' : 'badge-slate hover:border-slate-500')}
        >
          Tous
        </button>
        {BUDGET_TIERS.map(tier => (
          <button
            key={tier.id}
            onClick={() => setBudgetFilter(tier.id)}
            className={clsx('badge cursor-pointer transition-all', budgetFilter === tier.id ? tier.badge : 'badge-slate hover:border-slate-500')}
          >
            {tier.label} {tier.max < Infinity ? `≤${formatBudgetPrice(tier.max)}` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          <p className="text-sm">Aucun build dans cette gamme de budget.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(cfg => {
            const MetaIcon = META_ICONS[cfg.icon] || Star;
            const ship = SHIPS.find(s => s.id === cfg.shipId);
            const tier = getBudgetTier(cfg.estimatedPrice);
            return (
              <div key={cfg.id} className="card p-4 flex flex-col gap-3 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2">
                  <MetaIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">{cfg.name}</h3>
                    {ship && <div className="text-[11px] text-slate-500">{ship.name} — {ship.manufacturer}</div>}
                  </div>
                  <span className={clsx('badge ml-auto', cfg.color)}>{cfg.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed flex-1">{cfg.description}</p>
                <div className="flex flex-wrap gap-1 items-center">
                  {cfg.tags.map(t => <span key={t} className="badge badge-slate text-[10px]">{t}</span>)}
                  <span className={clsx('badge text-[10px] ml-auto', tier.badge)}>
                    ~{formatBudgetPrice(cfg.estimatedPrice)} aUEC
                  </span>
                </div>
                <button
                  onClick={() => onLoad(cfg)}
                  className="btn btn-secondary btn-sm w-full mt-auto"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Charger ce build
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLONNE GAUCHE — Sélecteur de vaisseau
// ─────────────────────────────────────────────────────────────────────────────
function ShipSelector({ selectedShipId, onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return SHIPS;
    const q = query.toLowerCase();
    return SHIPS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.manufacturer.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    );
  }, [query]);

  const ship = SHIPS.find(s => s.id === selectedShipId);

  const weaponCount = useMemo(() => {
    if (!ship) return 0;
    return parseWeaponSlots(ship.hardpoints?.weapons || []).length
         + (ship.hardpoints?.turrets ? parseWeaponSlots(ship.hardpoints.turrets).length : 0);
  }, [ship]);

  return (
    <div className="space-y-3">
      {/* Preview vaisseau */}
      {ship ? (
        <div className="card p-3 space-y-2">
          <ShipAvatar ship={ship} />
          <div className="text-center">
            <div className="font-semibold text-slate-200 text-sm">{ship.name}</div>
            <div className="text-xs text-slate-500">{ship.manufacturer} — {ship.role}</div>
          </div>
          <div className="divider" />
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-1.5 rounded bg-space-900/60 text-center">
              <div className="text-xs font-bold font-mono text-cyan-400">{ship.specs.shieldHp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Shield HP</div>
            </div>
            <div className="p-1.5 rounded bg-space-900/60 text-center">
              <div className="text-xs font-bold font-mono text-slate-200">{ship.specs.scmSpeed}</div>
              <div className="text-[10px] text-slate-500">SCM m/s</div>
            </div>
            <div className="p-1.5 rounded bg-space-900/60 text-center">
              <div className="text-xs font-bold font-mono text-amber-400">{ship.specs.cargo ?? 0}</div>
              <div className="text-[10px] text-slate-500">Cargo SCU</div>
            </div>
            <div className="p-1.5 rounded bg-space-900/60 text-center">
              <div className="text-xs font-bold font-mono text-red-400">{weaponCount}</div>
              <div className="text-[10px] text-slate-500">Slots armes</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            <span className="badge badge-slate text-[10px]">{ship.size}</span>
            <span className="badge badge-cyan text-[10px]">{ship.role}</span>
            {ship.crew && <span className="badge badge-blue text-[10px]">Équipage {ship.crew.min}-{ship.crew.max}</span>}
          </div>
        </div>
      ) : (
        <div className="card p-4 text-center text-slate-600 space-y-2">
          <Rocket className="w-10 h-10 mx-auto opacity-20" />
          <p className="text-xs">Sélectionne un vaisseau</p>
        </div>
      )}

      {/* Recherche + select */}
      <input
        type="search"
        placeholder="Rechercher un vaisseau…"
        className="input text-xs"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <select
        value={selectedShipId || ''}
        onChange={e => onSelect(e.target.value || null)}
        className="select text-xs"
        size={Math.min(filtered.length + 1, 8)}
        style={{ height: 'auto' }}
      >
        <option value="">— Choisir un vaisseau —</option>
        {filtered.map(s => (
          <option key={s.id} value={s.id}>{s.name} ({s.manufacturer})</option>
        ))}
      </select>
      {filtered.length === 0 && (
        <p className="text-xs text-slate-600 italic text-center">Aucun résultat pour "{query}"</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HARDPOINTS PANEL (colonne centrale)
// ─────────────────────────────────────────────────────────────────────────────
function HardpointsPanel({ ship, loadout, onSetWeapon, onSetMissile, onSetSystem }) {
  const [wpOpen, setWpOpen]  = useState(true);
  const [sysOpen, setSysOpen] = useState(true);
  const [misOpen, setMisOpen] = useState(true);

  const weaponSlots  = useMemo(() => parseWeaponSlots(ship?.hardpoints?.weapons  || []), [ship]);
  const missileSlots = useMemo(() => parseMissileSlots(ship?.hardpoints?.missiles || []), [ship]);
  const sizes        = useMemo(() => getComponentSizes(ship), [ship]);

  const ppSizes = [sizes.ppSize];
  const shSizes = [sizes.shieldSize];
  const coSizes = [sizes.coolerSize];
  const qtSizes = [sizes.qtSize];

  if (!ship) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-600 gap-3">
        <Crosshair className="w-12 h-12 opacity-20" />
        <p className="text-sm">Sélectionne un vaisseau pour configurer son loadout</p>
      </div>
    );
  }

  const noHardpoints = weaponSlots.length === 0 && missileSlots.length === 0;

  return (
    <div className="space-y-4">
      {/* ── ARMEMENT ── */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setWpOpen(v => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-space-700/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200 text-sm">Armement</span>
            <span className="badge badge-slate">{weaponSlots.length} slot{weaponSlots.length !== 1 ? 's' : ''}</span>
          </div>
          {wpOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {wpOpen && (
          <div className="px-4 pb-4 space-y-2">
            {weaponSlots.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-2">Aucun slot d'arme fixe sur ce vaisseau</p>
            ) : (
              weaponSlots.map(slot => (
                <WeaponSlot
                  key={slot.id}
                  slot={slot}
                  selected={loadout.weapons[slot.id] || null}
                  onChange={id => onSetWeapon(slot.id, id)}
                  onReset={() => onSetWeapon(slot.id, null)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── SYSTÈMES ── */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setSysOpen(v => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-space-700/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200 text-sm">Systèmes</span>
          </div>
          {sysOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {sysOpen && (
          <div className="px-4 pb-4 grid sm:grid-cols-2 gap-2">
            <SystemSlot
              label="Power Plant"
              icon={Zap}
              color="text-amber-400"
              sizeOptions={ppSizes}
              list={PP_BY_SIZE}
              value={loadout.systems.pp}
              onChange={id => onSetSystem('pp', id)}
            />
            <SystemSlot
              label="Bouclier"
              icon={Shield}
              color="text-cyan-400"
              sizeOptions={shSizes}
              list={SHIELDS_BY_SIZE}
              value={loadout.systems.shield}
              onChange={id => onSetSystem('shield', id)}
            />
            <SystemSlot
              label="Refroidisseur 1"
              icon={Wind}
              color="text-sky-400"
              sizeOptions={coSizes}
              list={COOLERS_BY_SIZE}
              value={loadout.systems.cooler1}
              onChange={id => onSetSystem('cooler1', id)}
            />
            <SystemSlot
              label="Refroidisseur 2"
              icon={Wind}
              color="text-sky-300"
              sizeOptions={coSizes}
              list={COOLERS_BY_SIZE}
              value={loadout.systems.cooler2}
              onChange={id => onSetSystem('cooler2', id)}
            />
            <SystemSlot
              label="QT Drive"
              icon={Gauge}
              color="text-indigo-400"
              sizeOptions={qtSizes}
              list={QT_BY_SIZE}
              value={loadout.systems.qt}
              onChange={id => onSetSystem('qt', id)}
            />
          </div>
        )}
      </div>

      {/* ── MISSILES ── */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setMisOpen(v => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-space-700/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-slate-200 text-sm">Missiles</span>
            <span className="badge badge-slate">{missileSlots.length} rack{missileSlots.length !== 1 ? 's' : ''}</span>
          </div>
          {misOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {misOpen && (
          <div className="px-4 pb-4 space-y-2">
            {missileSlots.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-2">Aucun rack missile sur ce vaisseau</p>
            ) : (
              missileSlots.map(slot => (
                <MissileSlot
                  key={slot.id}
                  slot={slot}
                  selected={loadout.missiles[slot.id] || null}
                  onChange={id => onSetMissile(slot.id, id)}
                  onReset={() => onSetMissile(slot.id, null)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {noHardpoints && (
        <div className="card p-4 flex items-start gap-3 border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/70">
            Ce vaisseau n'a pas de données de hardpoints détaillées. Seuls les systèmes sont configurables.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function LoadoutBuilder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedShipId, setSelectedShipId] = useState(null);
  const [loadout, setLoadout] = useState(EMPTY_LOADOUT);

  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [useLive, setUseLive] = useState(false);
  const { components: liveComponents, isLive, lastUpdated: liveLastUpdated, loading: liveLoading, refresh: liveRefresh } = useLiveComponents();

  // Auth
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setCurrentUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // ── Chargement depuis URL (?build=xxx ou ?shared=xxx) ──────────────────────
  useEffect(() => {
    const buildParam = searchParams.get('build');
    const sharedParam = searchParams.get('shared');
    if (buildParam) {
      const decoded = decodeBuild(buildParam);
      if (decoded) {
        setSelectedShipId(decoded.shipId);
        setLoadout(decoded.loadout);
      }
    } else if (sharedParam) {
      try {
        const data = JSON.parse(atob(sharedParam));
        const shipParam = searchParams.get('ship');
        if (shipParam) setSelectedShipId(shipParam);
        if (data.weapons) setLoadout(data);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Résolution composants ──────────────────────────────────────────────────
  const resolvedWeapons = useMemo(() => {
    const out = {};
    for (const [id, weapId] of Object.entries(loadout.weapons)) {
      if (weapId) out[id] = ALL_COMPONENTS.weapons[weapId] || null;
    }
    return out;
  }, [loadout.weapons]);

  const resolvedSystems = useMemo(() => ({
    pp:      loadout.systems.pp      ? ALL_COMPONENTS.pp[loadout.systems.pp]           : null,
    shield:  loadout.systems.shield  ? ALL_COMPONENTS.shields[loadout.systems.shield]  : null,
    cooler1: loadout.systems.cooler1 ? ALL_COMPONENTS.coolers[loadout.systems.cooler1] : null,
    cooler2: loadout.systems.cooler2 ? ALL_COMPONENTS.coolers[loadout.systems.cooler2] : null,
    qt:      loadout.systems.qt      ? ALL_COMPONENTS.qt[loadout.systems.qt]           : null,
  }), [loadout.systems]);

  const selectedShip = useMemo(() => SHIPS.find(s => s.id === selectedShipId) || null, [selectedShipId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectShip = useCallback((id) => {
    setSelectedShipId(id);
    setLoadout(EMPTY_LOADOUT);
  }, []);

  const handleSetWeapon = useCallback((slotId, weaponId) => {
    setLoadout(prev => ({
      ...prev,
      weapons: { ...prev.weapons, [slotId]: weaponId },
    }));
  }, []);

  const handleSetMissile = useCallback((slotId, missileId) => {
    setLoadout(prev => ({
      ...prev,
      missiles: { ...prev.missiles, [slotId]: missileId },
    }));
  }, []);

  const handleSetSystem = useCallback((key, id) => {
    setLoadout(prev => ({
      ...prev,
      systems: { ...prev.systems, [key]: id },
    }));
  }, []);

  const handleReset = useCallback(() => {
    setLoadout(EMPTY_LOADOUT);
  }, []);

  const handleExportJSON = useCallback(() => {
    const data = {
      type: 'ship',
      shipId: selectedShipId,
      weapons: loadout.weapons,
      missiles: loadout.missiles,
      systems: loadout.systems,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const shipName = SHIPS.find(s => s.id === selectedShipId)?.name || 'loadout';
    a.download = `loadout-${shipName.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedShipId, loadout]);

  const handleImportJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.type !== 'ship' || !data.version) {
          alert('Fichier JSON invalide : format de loadout vaisseau non reconnu.');
          return;
        }
        if (data.shipId) setSelectedShipId(data.shipId);
        setLoadout({
          weapons: data.weapons || {},
          missiles: data.missiles || {},
          systems: {
            pp: data.systems?.pp || null,
            shield: data.systems?.shield || null,
            cooler1: data.systems?.cooler1 || null,
            cooler2: data.systems?.cooler2 || null,
            qt: data.systems?.qt || null,
          },
        });
      } catch {
        alert('Impossible de lire le fichier JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleLoadMeta = useCallback((cfg) => {
    setSelectedShipId(cfg.shipId);
    setLoadout({
      weapons:  cfg.weapons  || {},
      missiles: cfg.missiles || {},
      systems: {
        pp:      cfg.systems?.pp      || null,
        shield:  cfg.systems?.shield  || null,
        cooler1: cfg.systems?.cooler1 || null,
        cooler2: cfg.systems?.cooler2 || null,
        qt:      cfg.systems?.qt      || null,
      },
    });
    setActiveTab('builder');
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Crosshair className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="page-title">Constructeur de Loadout</h1>
            <p className="page-subtitle">Configure les armes, systèmes et missiles de ton vaisseau — inspiré d'erkul.games</p>
          </div>
          {/* Live toggle */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setUseLive(v => !v)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                useLive && isLive
                  ? 'bg-green-500/15 border-green-500/30 text-green-400'
                  : 'bg-space-800 border-space-400/20 text-slate-500 hover:text-slate-300'
              )}
            >
              <Wifi className="w-3.5 h-3.5" />
              {useLive && isLive ? 'LIVE' : 'Live Off'}
            </button>
            {useLive && (
              <button
                onClick={liveRefresh}
                disabled={liveLoading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"
                title="Rafraîchir données UEX"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', liveLoading && 'animate-spin')} />
              </button>
            )}
            {useLive && isLive && liveLastUpdated && (
              <span className="text-[10px] text-slate-600 font-mono">
                {new Date(liveLastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live banner */}
      {useLive && isLive && liveComponents && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <Wifi className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-300">
            Données composants UEX Corp — {Array.isArray(liveComponents) ? liveComponents.length : Object.keys(liveComponents).length} composants disponibles
          </span>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="tabs w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(activeTab === tab.id ? 'tab-active' : 'tab')}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Onglet Builds Méta ── */}
      {activeTab === 'meta' && (
        <MetaBuildsTab onLoad={handleLoadMeta} />
      )}

      {/* ── Onglet Comparer ── */}
      {activeTab === 'compare' && (
        <LoadoutComparator selectedShipId={selectedShipId} />
      )}

      {/* ── Onglet Communauté ── */}
      {activeTab === 'community' && (
        <SharedBuildsEmbed type="ship" />
      )}

      {/* ── Onglet Constructeur ── */}
      {activeTab === 'builder' && (
        <>
          {/* Bouton reset + partage */}
          <div className="flex items-center justify-end gap-2">
            {currentUser && selectedShipId && (
              <button onClick={() => setShowShareModal(true)} className="btn btn-ghost btn-sm gap-1.5 text-cyan-400">
                <Share2 className="w-3.5 h-3.5" />
                Partager
              </button>
            )}
            <button onClick={handleExportJSON} className="btn btn-ghost btn-sm gap-1.5 text-emerald-400">
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
            <label className="btn btn-ghost btn-sm gap-1.5 text-amber-400 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Importer
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button onClick={handleReset} className="btn btn-ghost btn-sm gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          </div>

          {/* Layout 3 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5 items-start">
            {/* ── Colonne gauche : sélecteur vaisseau ── */}
            <div className="space-y-4">
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  Vaisseau
                </h2>
              </div>
              <ShipSelector selectedShipId={selectedShipId} onSelect={handleSelectShip} />
            </div>

            {/* ── Colonne centrale : hardpoints ── */}
            <div>
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  Équipement
                </h2>
                {selectedShip && (
                  <span className="text-xs text-slate-500">{selectedShip.name}</span>
                )}
              </div>
              <HardpointsPanel
                ship={selectedShip}
                loadout={loadout}
                onSetWeapon={handleSetWeapon}
                onSetMissile={handleSetMissile}
                onSetSystem={handleSetSystem}
              />
            </div>

            {/* ── Colonne droite : stats + partage ── */}
            <div className="space-y-4">
              <div className="section-header">
                <h2 className="section-title flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  Stats Live
                </h2>
              </div>
              <StatsPanel
                ship={selectedShip}
                loadout={loadout}
                resolvedWeapons={resolvedWeapons}
                resolvedSystems={resolvedSystems}
              />
              <SharePanel shipId={selectedShipId} loadout={loadout} />
            </div>
          </div>
        </>
      )}

      {/* Share Modal */}
      <ShareBuildModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        buildType="ship"
        shipId={selectedShipId}
        buildData={loadout}
        totalPrice={0}
        userId={currentUser?.id}
      />
    </div>
  );
}

// ── Embed simplifié pour l'onglet communauté ──
function SharedBuildsEmbed({ type }) {
  const navigate = useNavigate();
  return (
    <div className="card p-6 text-center space-y-4">
      <Users className="w-10 h-10 text-cyan-400 mx-auto opacity-50" />
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Builds de la communauté</h3>
        <p className="text-xs text-slate-500 mt-1">Découvrez les builds partagés par les autres joueurs</p>
      </div>
      <button onClick={() => navigate(`/builds?type=${type}`)} className="btn btn-primary btn-sm">
        <Users className="w-4 h-4" />
        Voir tous les builds {type === 'ship' ? 'vaisseau' : 'FPS'}
      </button>
    </div>
  );
}
