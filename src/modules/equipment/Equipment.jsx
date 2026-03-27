import React, { useState, useMemo } from 'react';
import {
  FPS_WEAPONS, FPS_ARMOR, FPS_GADGETS, WEAPON_ATTACHMENTS, ARMOR_SETS,
  WEAPON_CATEGORIES, ARMOR_TYPES, AMMO_TYPES, ARMOR_SLOTS, TIERS,
  RESISTANCE_TYPES, MANUFACTURERS_FPS,
} from '../../datasets/equipment.js';
import {
  Shield, Search, Target, ChevronDown, ChevronRight,
  Zap, AlertTriangle, Star, Package, Layers, Crosshair,
  ArrowUpDown, CheckCircle2, Users, Wrench,
} from 'lucide-react';
import clsx from 'clsx';
import PatchBadge from '../../ui/components/PatchBadge.jsx';
import { usePatchCategory } from '../../hooks/usePatchInfo.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const AMMO_COLORS  = { ballistic: 'text-warning-400', energy: 'text-cyan-400', explosive: 'text-danger-400', none: 'text-slate-500' };
const AMMO_LABELS  = { ballistic: 'Balistique', energy: 'Énergie', explosive: 'Explosif', none: 'Aucun' };
const AMMO_BADGES  = { ballistic: 'badge-yellow', energy: 'badge-cyan', explosive: 'badge-red', none: 'badge-slate' };
const TIER_BADGES  = { starter: 'badge-slate', standard: '', premium: 'badge-cyan', elite: 'badge-yellow' };
const TIER_LABELS  = { starter: 'Débutant', standard: 'Standard', premium: 'Premium', elite: 'Élite' };
const ARMOR_COLORS = { light: 'text-success-400', medium: 'text-warning-400', heavy: 'text-danger-400' };
const ARMOR_BADGES = { light: 'badge-green',      medium: 'badge-yellow',     heavy: 'badge-red' };
const ARMOR_LABELS = { light: 'Légère',            medium: 'Moyenne',          heavy: 'Lourde' };
const MOBILITY_COLORS = { high: 'text-success-400', 'medium-high': 'text-cyan-400', medium: 'text-warning-400', low: 'text-danger-400' };
const MOBILITY_LABELS = { high: 'Haute', 'medium-high': 'Élevée', medium: 'Moyenne', low: 'Basse' };
const FIRE_MODE_LABELS = { semi: 'Semi', burst2: 'Rafale ×2', burst3: 'Rafale ×3', auto: 'Auto', melee: 'Corps à Corps', double: 'Double', throw: 'Lancé' };

const CAT_COLORS = {
  pistol: 'text-slate-400',  smg: 'text-warning-400', rifle: 'text-cyan-400',
  shotgun: 'text-orange-400', sniper: 'text-blue-400', heavy: 'text-red-400',
  launcher: 'text-danger-400', melee: 'text-purple-400', tool: 'text-green-400',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ResistanceBar({ label, value, color, bg }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className={color}>{label}</span>
        <span className="text-slate-300 font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 bg-space-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bg}/60 transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight, unit = '' }) {
  return (
    <div className={clsx('flex justify-between text-xs py-0.5', highlight && 'text-warning-400 font-semibold')}>
      <span className="text-slate-500">{label}</span>
      <span className={highlight ? 'text-warning-400' : 'text-slate-300'}>{value}{unit && <span className="text-slate-500 ml-1">{unit}</span>}</span>
    </div>
  );
}

function DamageBar({ label, value, max = 500, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className={clsx('font-bold', color)}>{value}</span>
      </div>
      <div className="h-1 bg-space-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}/70`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
    </div>
  );
}

// ─── Weapon Card ──────────────────────────────────────────────────────────────

function WeaponAvatar({ weapon }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={clsx(
      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden',
      weapon.ammoType === 'energy' ? 'bg-cyan-500/15' :
      weapon.ammoType === 'explosive' ? 'bg-danger-500/15' : 'bg-warning-500/10',
    )}>
      {!imgError && weapon.imageUrl ? (
        <img src={weapon.imageUrl} alt={weapon.name} onError={() => setImgError(true)} className="w-full h-full object-contain p-1" />
      ) : (
        <Target className={clsx('w-5 h-5', AMMO_COLORS[weapon.ammoType])} />
      )}
    </div>
  );
}

function WeaponCard({ weapon, patchInfo }) {
  const [expanded, setExpanded] = useState(false);
  const dps = weapon.stats.dps || Math.round(weapon.stats.dmgBody * weapon.stats.rpm / 60);
  const dmgMax = weapon.category === 'sniper' ? 500 : weapon.category === 'shotgun' ? 250 : 100;

  return (
    <div className={clsx(
      'card overflow-hidden transition-all',
      expanded && 'border-cyan-500/20',
      !weapon.legal && 'border-danger-500/10',
    )}>
      <button
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <WeaponAvatar weapon={weapon} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-200">{weapon.name}</span>
            {patchInfo && <PatchBadge type={patchInfo.type} version={patchInfo.version} />}
            <span className={clsx('badge text-xs', TIER_BADGES[weapon.tier] || '')}>{TIER_LABELS[weapon.tier]}</span>
            <span className={clsx('badge text-xs', AMMO_BADGES[weapon.ammoType])}>{AMMO_LABELS[weapon.ammoType]}</span>
            {!weapon.legal && <span className="badge badge-red text-xs">Illégal</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
            <span className={CAT_COLORS[weapon.category]}>
              {WEAPON_CATEGORIES.find(c => c.id === weapon.category)?.label || weapon.category}
            </span>
            <span>•</span><span>{weapon.manufacturer}</span>
            <span>•</span><span>T{weapon.size}</span>
            {weapon.fireModes && (
              <><span>•</span><span>{weapon.fireModes.map(m => FIRE_MODE_LABELS[m] || m).join(' / ')}</span></>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <div className="text-sm font-bold text-danger-400">{weapon.stats.dmgBody}</div>
            <div className="text-xs text-slate-600">dmg</div>
          </div>
          <div className="text-center hidden md:block">
            <div className="text-sm font-bold text-warning-400">{weapon.stats.rpm}</div>
            <div className="text-xs text-slate-600">tpm</div>
          </div>
          <div className="text-center hidden lg:block">
            <div className="text-sm font-bold text-success-400">{dps}</div>
            <div className="text-xs text-slate-600">dps</div>
          </div>
          <div className="text-sm font-semibold text-warning-400 hidden lg:block">
            {weapon.price.toLocaleString()} <span className="text-xs font-normal text-slate-500">aUEC</span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 bg-space-900/50">
          {/* Description + notes */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-sm text-slate-400">{weapon.description}</p>
            {weapon.notes && (
              <div className="mt-2 flex gap-2 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <Star className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-cyan-300">{weapon.notes}</p>
              </div>
            )}
          </div>

          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Dommages */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-danger-400" /> Dommages par tir
              </div>
              <div className="space-y-2">
                <DamageBar label="Tête" value={weapon.stats.dmgHead} max={dmgMax} color="text-red-400" />
                <DamageBar label="Corps" value={weapon.stats.dmgBody} max={dmgMax} color="text-orange-400" />
                <DamageBar label="Membres" value={weapon.stats.dmgLimb} max={dmgMax} color="text-yellow-400" />
                {weapon.stats.dmgBlast && (
                  <DamageBar label="Explosion" value={weapon.stats.dmgBlast} max={dmgMax} color="text-danger-400" />
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-space-600">
                <StatRow label="DPS (corps)" value={dps} highlight />
              </div>
            </div>

            {/* Performance */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-warning-400" /> Performance
              </div>
              <div className="space-y-1">
                <StatRow label="Cadence" value={`${weapon.stats.rpm}`} unit="tpm" />
                <StatRow label="Chargeur" value={weapon.stats.magSize} unit="balles" />
                <StatRow label="Munitions total" value={weapon.stats.totalAmmo} />
                <StatRow label="Recharg. tactique" value={`${weapon.stats.reloadTactical}s`} />
                <StatRow label="Recharg. complet" value={`${weapon.stats.reloadFull}s`} />
                <StatRow label="Temps ADS" value={`${weapon.stats.adsTime}s`} />
                {weapon.stats.pellets && <StatRow label="Projectiles/tir" value={weapon.stats.pellets} />}
                {weapon.stats.blastRadius && <StatRow label="Rayon explosion" value={`${weapon.stats.blastRadius}m`} />}
              </div>
            </div>

            {/* Précision & Recul */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-cyan-400" /> Précision & Recul
              </div>
              <div className="space-y-1">
                <StatRow label="Spread min" value={`${weapon.stats.spreadMin}°`} />
                <StatRow label="Spread max" value={`${weapon.stats.spreadMax}°`} />
                <StatRow label="Recul vertical" value={weapon.stats.recoilV} />
                <StatRow label="Recul horizontal" value={weapon.stats.recoilH} />
                <StatRow label="Portée effective" value={`${weapon.stats.effectiveRange}m`} highlight />
                <StatRow label="Portée maximale" value={`${weapon.stats.maxRange}m`} />
              </div>
              {/* Fire modes */}
              <div className="mt-2 pt-2 border-t border-space-600 flex flex-wrap gap-1">
                {weapon.fireModes?.map(m => (
                  <span key={m} className="badge badge-blue" style={{ fontSize: '10px' }}>
                    {FIRE_MODE_LABELS[m] || m}
                  </span>
                ))}
              </div>
            </div>

            {/* Dispo + Attachements */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Achat & Équipement
              </div>
              <div className="text-xl font-bold text-warning-400 mb-2">
                {weapon.price.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">aUEC</span>
              </div>
              <div className="text-xs text-slate-500 mb-1">Disponible :</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {weapon.availableAt.map(loc => (
                  <span key={loc} className="badge badge-slate" style={{ fontSize: '10px' }}>{loc}</span>
                ))}
              </div>
              {weapon.attachments?.length > 0 && (
                <>
                  <div className="text-xs text-slate-500 mb-1">Attachements :</div>
                  <div className="flex flex-wrap gap-1">
                    {weapon.attachments.map(a => (
                      <span key={a} className="badge badge-blue" style={{ fontSize: '10px' }}>{a}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Armor Card ───────────────────────────────────────────────────────────────

function ArmorAvatar({ armor }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={clsx(
      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden',
      armor.armorType === 'heavy' ? 'bg-danger-500/15' :
      armor.armorType === 'medium' ? 'bg-warning-500/10' : 'bg-success-500/10',
    )}>
      {!imgError && armor.imageUrl ? (
        <img src={armor.imageUrl} alt={armor.name} onError={() => setImgError(true)} className="w-full h-full object-contain p-1" />
      ) : (
        <Shield className={clsx('w-5 h-5', ARMOR_COLORS[armor.armorType])} />
      )}
    </div>
  );
}

function ArmorCard({ armor, patchInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={clsx(
      'card overflow-hidden',
      expanded && 'border-cyan-500/20',
      !armor.legal && 'border-danger-500/10',
    )}>
      <button
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <ArmorAvatar armor={armor} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-200">{armor.name}</span>
            {patchInfo && <PatchBadge type={patchInfo.type} version={patchInfo.version} />}
            <span className={clsx('badge text-xs', TIER_BADGES[armor.tier] || '')}>{TIER_LABELS[armor.tier]}</span>
            <span className={clsx('badge text-xs', ARMOR_BADGES[armor.armorType])}>{ARMOR_LABELS[armor.armorType]}</span>
            {!armor.legal && <span className="badge badge-red text-xs">Illégal</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
            <span>{ARMOR_SLOTS.find(s => s.id === armor.slot)?.label || armor.slot}</span>
            <span>•</span><span>{armor.manufacturer}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className={clsx('text-sm font-bold', ARMOR_COLORS[armor.armorType])}>
              {armor.stats.resistance.physical}%
            </div>
            <div className="text-xs text-slate-600">physique</div>
          </div>
          {armor.stats.o2Duration && (
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-cyan-400">{armor.stats.o2Duration}<span className="text-xs">min</span></div>
              <div className="text-xs text-slate-600">O2</div>
            </div>
          )}
          <div className="text-sm font-semibold text-warning-400 hidden lg:block">
            {armor.price.toLocaleString()} <span className="text-xs font-normal text-slate-500">aUEC</span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 bg-space-900/50">
          <div className="px-4 pt-3 pb-1">
            <p className="text-sm text-slate-400">{armor.description}</p>
            {armor.notes && (
              <div className="mt-2 flex gap-2 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <Star className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-cyan-300">{armor.notes}</p>
              </div>
            )}
          </div>

          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">

            {/* Résistances */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Résistances
              </div>
              <div className="space-y-2">
                {RESISTANCE_TYPES.map(rt => (
                  <ResistanceBar
                    key={rt.id}
                    label={rt.label}
                    value={armor.stats.resistance[rt.id] || 0}
                    color={rt.color}
                    bg={rt.bg}
                  />
                ))}
              </div>
            </div>

            {/* Stats spéciales */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" /> Caractéristiques
              </div>
              <div className="space-y-1">
                {armor.stats.mobility && (
                  <StatRow label="Mobilité" value={
                    <span className={MOBILITY_COLORS[armor.stats.mobility]}>{MOBILITY_LABELS[armor.stats.mobility]}</span>
                  } />
                )}
                {armor.stats.weight && <StatRow label="Poids" value={`${armor.stats.weight} kg`} />}
                {armor.stats.carry !== undefined && <StatRow label="Capacité transport" value={`${armor.stats.carry} unités`} />}
                {armor.stats.o2Duration && <StatRow label="Autonomie O2" value={`${armor.stats.o2Duration} min`} highlight />}
                {armor.stats.o2Storage && <StatRow label="Réserve O2" value={`${armor.stats.o2Storage} unités`} highlight />}
                {armor.stats.temperature && (
                  <StatRow label="Plage thermique" value={`${armor.stats.temperature.min}°C / ${armor.stats.temperature.max}°C`} />
                )}
                {armor.stats.thermalSignature && (
                  <StatRow label="Signature thermique" value={
                    armor.stats.thermalSignature === 'reduced' ? <span className="text-success-400">Réduite</span> :
                    armor.stats.thermalSignature === 'minimal' ? <span className="text-success-400">Minimale</span> :
                    armor.stats.thermalSignature === 'high'    ? <span className="text-danger-400">Élevée</span> :
                    <span className="text-slate-400">Normale</span>
                  } />
                )}
                {armor.stats.thermalVision !== undefined && (
                  <StatRow label="Vision thermique" value={
                    armor.stats.thermalVision ? <span className="text-success-400">✓ Oui</span> : <span className="text-slate-600">✗ Non</span>
                  } />
                )}
                {armor.stats.nightVision !== undefined && (
                  <StatRow label="Vision nocturne" value={
                    armor.stats.nightVision ? <span className="text-success-400">✓ Oui</span> : <span className="text-slate-600">✗ Non</span>
                  } />
                )}
              </div>
            </div>

            {/* Achat */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Achat
              </div>
              <div className="text-xl font-bold text-warning-400 mb-2">
                {armor.price.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">aUEC</span>
              </div>
              <div className="text-xs text-slate-500 mb-1">Disponible :</div>
              <div className="flex flex-wrap gap-1">
                {armor.availableAt.map(loc => (
                  <span key={loc} className="badge badge-slate" style={{ fontSize: '10px' }}>{loc}</span>
                ))}
              </div>
              {armor.setId && (
                <div className="mt-3 text-xs text-cyan-400 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Set: <span className="font-semibold">{armor.setId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Set Card ─────────────────────────────────────────────────────────────────

function SetCard({ set }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={clsx('card overflow-hidden', set.illegal && 'border-danger-500/10')}>
      <button
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          set.armorType === 'heavy' ? 'bg-danger-500/15' :
          set.armorType === 'medium' ? 'bg-warning-500/10' : 'bg-success-500/10',
        )}>
          <Layers className={clsx('w-5 h-5', ARMOR_COLORS[set.armorType])} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-200">{set.name}</span>
            <span className={clsx('badge text-xs', TIER_BADGES[set.tier] || '')}>{TIER_LABELS[set.tier]}</span>
            <span className={clsx('badge text-xs', ARMOR_BADGES[set.armorType])}>{ARMOR_LABELS[set.armorType]}</span>
            {set.illegal && <span className="badge badge-red text-xs">Illégal</span>}
            {set.bonus && <span className="badge badge-cyan text-xs">{set.bonus}</span>}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{set.playstyle}</div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-sm font-semibold text-warning-400 hidden sm:block">
            {set.priceTotal.toLocaleString()} <span className="text-xs font-normal text-slate-500">aUEC</span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 p-4 bg-space-900/50 space-y-4">
          <p className="text-sm text-slate-400">{set.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Résistances totales */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Résistances Totales (Set Complet)</div>
              <div className="space-y-2">
                {RESISTANCE_TYPES.map(rt => (
                  <ResistanceBar
                    key={rt.id}
                    label={rt.label}
                    value={set.totalResistance[rt.id] || 0}
                    color={rt.color}
                    bg={rt.bg}
                  />
                ))}
              </div>
            </div>

            {/* Pièces du set */}
            <div className="bg-space-800/40 rounded-xl p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Pièces Incluses</div>
              <div className="space-y-1.5">
                {set.slots.map(slotId => {
                  const piece = FPS_ARMOR.find(a => a.id === slotId);
                  return piece ? (
                    <div key={slotId} className="flex justify-between text-xs">
                      <span className="text-slate-300">{piece.name}</span>
                      <span className="text-warning-400">{piece.price.toLocaleString()} aUEC</span>
                    </div>
                  ) : null;
                })}
                <div className="pt-1 mt-1 border-t border-space-600 flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total</span>
                  <span className="text-warning-400">{set.priceTotal.toLocaleString()} aUEC</span>
                </div>
              </div>
              {set.bonus && (
                <div className="mt-3 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-xs text-cyan-300">
                  <Star className="w-3 h-3 inline mr-1 text-cyan-400" />
                  Bonus: {set.bonus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gadget Card ──────────────────────────────────────────────────────────────

function GadgetCard({ gadget }) {
  const catIcon = gadget.category === 'medical' ? '🩺' : gadget.category === 'explosive' ? '💥' : gadget.category === 'electronic' ? '⚡' : gadget.category === 'tactical' ? '💨' : '🛡️';
  return (
    <div className="card p-3 flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0 text-sm">{catIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-200">{gadget.name}</span>
          <span className="text-xs text-warning-400 flex-shrink-0">{gadget.price.toLocaleString()} aUEC</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{gadget.effect}</div>
        {gadget.useTime && (
          <div className="text-xs text-slate-600 mt-0.5">Utilisation: {gadget.useTime}s • Pile ×{gadget.stackSize}</div>
        )}
      </div>
    </div>
  );
}

// ─── Attachment Card ─────────────────────────────────────────────────────────

function AttachmentCard({ att }) {
  const slotColors = { optics: 'text-cyan-400', barrel: 'text-warning-400', underbarrel: 'text-green-400', stock: 'text-purple-400' };
  return (
    <div className="card p-3 flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0">
        <Crosshair className={clsx('w-4 h-4', slotColors[att.slot] || 'text-slate-400')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-200">{att.name}</span>
          <span className="text-xs text-warning-400 flex-shrink-0">{att.price ? `${att.price.toLocaleString()} aUEC` : 'Inclus'}</span>
        </div>
        {att.zoom && <span className="badge badge-cyan text-xs mr-1">{att.zoom}</span>}
        <div className="text-xs text-slate-500 mt-0.5">{att.desc}</div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Equipment() {
  const fpsPatches = usePatchCategory('fps');
  const [activeTab, setActiveTab] = useState('weapons');
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterAmmo, setFilterAmmo] = useState('');
  const [filterMfg, setFilterMfg] = useState('');
  const [filterSlot, setFilterSlot] = useState('');
  const [filterArmor, setFilterArmor] = useState('');
  const [filterLegal, setFilterLegal] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const q = search.toLowerCase();

  const filteredWeapons = useMemo(() => {
    let list = [...FPS_WEAPONS];
    if (filterCat)   list = list.filter(w => w.category === filterCat);
    if (filterAmmo)  list = list.filter(w => w.ammoType === filterAmmo);
    if (filterMfg)   list = list.filter(w => w.manufacturerId === filterMfg);
    if (filterLegal === 'legal')   list = list.filter(w => w.legal);
    if (filterLegal === 'illegal') list = list.filter(w => !w.legal);
    if (q) list = list.filter(w => w.name.toLowerCase().includes(q) || w.manufacturer.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    if (sortBy === 'price') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'dmg')   list.sort((a, b) => b.stats.dmgBody - a.stats.dmgBody);
    else if (sortBy === 'dps')   list.sort((a, b) => (b.stats.dps || 0) - (a.stats.dps || 0));
    else if (sortBy === 'range') list.sort((a, b) => b.stats.effectiveRange - a.stats.effectiveRange);
    else if (sortBy === 'rpm')   list.sort((a, b) => b.stats.rpm - a.stats.rpm);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filterCat, filterAmmo, filterMfg, filterLegal, q, sortBy]);

  const filteredArmor = useMemo(() => {
    let list = [...FPS_ARMOR];
    if (filterSlot)  list = list.filter(a => a.slot === filterSlot);
    if (filterArmor) list = list.filter(a => a.armorType === filterArmor);
    if (filterMfg)   list = list.filter(a => a.manufacturerId === filterMfg);
    if (filterLegal === 'legal')   list = list.filter(a => a.legal);
    if (filterLegal === 'illegal') list = list.filter(a => !a.legal);
    if (q) list = list.filter(a => a.name.toLowerCase().includes(q) || a.manufacturer.toLowerCase().includes(q));
    if (sortBy === 'price') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'dmg') list.sort((a, b) => b.stats.resistance.physical - a.stats.resistance.physical);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filterSlot, filterArmor, filterMfg, filterLegal, q, sortBy]);

  const weaponMfgs = useMemo(() => [...new Set(FPS_WEAPONS.map(w => w.manufacturerId))].map(id => MANUFACTURERS_FPS.find(m => m.id === id)).filter(Boolean), []);
  const armorMfgs  = useMemo(() => [...new Set(FPS_ARMOR.map(a => a.manufacturerId))].map(id => MANUFACTURERS_FPS.find(m => m.id === id)).filter(Boolean), []);

  const stats = useMemo(() => ({
    weapons: FPS_WEAPONS.length,
    legalW: FPS_WEAPONS.filter(w => w.legal).length,
    armor: FPS_ARMOR.length,
    sets: ARMOR_SETS.length,
    gadgets: FPS_GADGETS.length,
    attachments: WEAPON_ATTACHMENTS.length,
    illegal: [...FPS_WEAPONS, ...FPS_ARMOR].filter(i => !i.legal).length,
  }), []);

  const resetFilters = () => { setFilterCat(''); setFilterAmmo(''); setFilterMfg(''); setFilterSlot(''); setFilterArmor(''); setFilterLegal('all'); setSearch(''); };

  const TABS = [
    { id: 'weapons',     label: 'Armes',       count: stats.weapons },
    { id: 'armor',       label: 'Armures',      count: stats.armor },
    { id: 'sets',        label: 'Sets Complets',count: stats.sets },
    { id: 'gadgets',     label: 'Gadgets',      count: stats.gadgets },
    { id: 'attachments', label: 'Attachements', count: stats.attachments },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Équipement FPS</h1>
        <p className="page-subtitle">Base de données complète — Armes, Armures, Gadgets, Attachements — Alpha 4.6</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Armes',        value: stats.weapons,     color: 'text-warning-400' },
          { label: 'Armes Légales',value: stats.legalW,      color: 'text-success-400' },
          { label: 'Pièces Armure',value: stats.armor,       color: 'text-cyan-400' },
          { label: 'Sets Complets',value: stats.sets,        color: 'text-purple-400' },
          { label: 'Gadgets',      value: stats.gadgets,     color: 'text-blue-400' },
          { label: 'Illégaux',     value: stats.illegal,     color: 'text-danger-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-space-400/20 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); resetFilters(); }}
            className={clsx(
              'px-3 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0',
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {tab.label}
            <span className={clsx('badge text-xs', activeTab === tab.id ? 'badge-cyan' : 'badge-slate')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters (weapons + armor only) */}
      {(activeTab === 'weapons' || activeTab === 'armor') && (
        <div className="card p-3 flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 w-40 h-8 text-sm"
            />
          </div>

          {activeTab === 'weapons' && <>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="">Toutes catégories</option>
              {WEAPON_CATEGORIES.map(c => {
                const n = FPS_WEAPONS.filter(w => w.category === c.id).length;
                return n > 0 ? <option key={c.id} value={c.id}>{c.label} ({n})</option> : null;
              })}
            </select>
            <select value={filterAmmo} onChange={e => setFilterAmmo(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="">Tout type</option>
              {AMMO_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <select value={filterMfg} onChange={e => setFilterMfg(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="">Tous fabricants</option>
              {weaponMfgs.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="name">Nom</option>
              <option value="price">Prix ↑</option>
              <option value="dmg">Dommages ↓</option>
              <option value="dps">DPS ↓</option>
              <option value="range">Portée ↓</option>
              <option value="rpm">Cadence ↓</option>
            </select>
          </>}

          {activeTab === 'armor' && <>
            <select value={filterSlot} onChange={e => setFilterSlot(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="">Tous emplacements</option>
              {ARMOR_SLOTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={filterArmor} onChange={e => setFilterArmor(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="">Toute armure</option>
              {ARMOR_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select value={filterMfg} onChange={e => setFilterMfg(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="">Tous fabricants</option>
              {armorMfgs.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="select h-8 text-sm w-auto">
              <option value="name">Nom</option>
              <option value="price">Prix ↑</option>
              <option value="dmg">Protection ↓</option>
            </select>
          </>}

          <select value={filterLegal} onChange={e => setFilterLegal(e.target.value)} className="select h-8 text-sm w-auto">
            <option value="all">Légal & Illégal</option>
            <option value="legal">Légal seulement</option>
            <option value="illegal">Illégal seulement</option>
          </select>

          <span className="text-xs text-slate-600 ml-auto">
            {activeTab === 'weapons' ? filteredWeapons.length : filteredArmor.length} résultats
          </span>
        </div>
      )}

      {/* Category quick-filters */}
      {activeTab === 'weapons' && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCat('')} className={clsx('px-2.5 py-1 rounded-lg text-xs transition-all', !filterCat ? 'bg-space-600 text-slate-200' : 'text-slate-500 hover:text-slate-300')}>
            Tout ({FPS_WEAPONS.length})
          </button>
          {WEAPON_CATEGORIES.map(cat => {
            const count = FPS_WEAPONS.filter(w => w.category === cat.id).length;
            if (!count) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCat(filterCat === cat.id ? '' : cat.id)}
                className={clsx('px-2.5 py-1 rounded-lg text-xs transition-all', filterCat === cat.id ? `bg-space-600 ${CAT_COLORS[cat.id]}` : 'text-slate-500 hover:text-slate-300')}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {activeTab === 'armor' && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterSlot('')} className={clsx('px-2.5 py-1 rounded-lg text-xs transition-all', !filterSlot ? 'bg-space-600 text-slate-200' : 'text-slate-500 hover:text-slate-300')}>
            Tout ({FPS_ARMOR.length})
          </button>
          {ARMOR_SLOTS.map(slot => {
            const count = FPS_ARMOR.filter(a => a.slot === slot.id).length;
            if (!count) return null;
            return (
              <button key={slot.id} onClick={() => setFilterSlot(filterSlot === slot.id ? '' : slot.id)}
                className={clsx('px-2.5 py-1 rounded-lg text-xs transition-all', filterSlot === slot.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300')}>
                {slot.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {activeTab === 'weapons' && (
        filteredWeapons.length === 0
          ? <div className="card p-12 text-center"><Target className="w-10 h-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Aucune arme ne correspond</p></div>
          : <div className="space-y-2">{filteredWeapons.map(w => <WeaponCard key={w.id} weapon={w} patchInfo={fpsPatches[w.id]} />)}</div>
      )}

      {activeTab === 'armor' && (
        filteredArmor.length === 0
          ? <div className="card p-12 text-center"><Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Aucune armure ne correspond</p></div>
          : <div className="space-y-2">{filteredArmor.map(a => <ArmorCard key={a.id} armor={a} patchInfo={fpsPatches[a.id]} />)}</div>
      )}

      {activeTab === 'sets' && (
        <div className="space-y-2">
          {ARMOR_SETS.map(s => <SetCard key={s.id} set={s} />)}
        </div>
      )}

      {activeTab === 'gadgets' && (
        <div className="space-y-3">
          {['medical', 'explosive', 'electronic', 'tactical', 'less-lethal', 'defensive', 'rescue'].map(cat => {
            const items = FPS_GADGETS.filter(g => g.category === cat);
            if (!items.length) return null;
            const catLabels = { medical: 'Médical', explosive: 'Explosifs', electronic: 'Électronique', tactical: 'Tactique', 'less-lethal': 'Moins-Létal', defensive: 'Défensif', rescue: 'Sauvetage' };
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{catLabels[cat]}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map(g => <GadgetCard key={g.id} gadget={g} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="space-y-3">
          {['optics', 'barrel', 'underbarrel', 'stock'].map(slot => {
            const items = WEAPON_ATTACHMENTS.filter(a => a.slot === slot);
            const slotLabels = { optics: 'Optiques / Viseurs', barrel: 'Modifications Canon', underbarrel: 'Sous-Canon', stock: 'Crosses' };
            return (
              <div key={slot}>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{slotLabels[slot]}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map(a => <AttachmentCard key={a.id} att={a} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
