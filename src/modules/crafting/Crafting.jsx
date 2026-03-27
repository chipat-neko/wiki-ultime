import React, { useState, useMemo, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import {
  Hammer, Search, X, Filter, ChevronDown, ChevronUp, Clock, Target,
  Shield, Crosshair, Package, Layers, SlidersHorizontal, Award,
  Gem, AlertTriangle, Info, Shirt, Swords,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_LABELS = {
  armor:  { label: 'Armures',    icon: Shield,    color: 'text-cyan-400',   bg: 'bg-cyan-500/20',   border: 'border-cyan-500/30' },
  weapon: { label: 'Armes',      icon: Crosshair, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  ammo:   { label: 'Munitions',  icon: Package,   color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
};

const ARMOR_SUBTYPES = {
  helmet:    'Casque',
  core:      'Torse',
  arms:      'Bras',
  legs:      'Jambes',
  backpack:  'Sac à dos',
  undersuit: 'Sous-combinaison',
  other:     'Autre',
};

const WEAPON_SUBTYPES = {
  ar:       'Fusil d\'assaut',
  lmg:      'Mitrailleuse',
  smg:      'SMG',
  sniper:   'Sniper',
  shotgun:  'Shotgun',
  pistol:   'Pistolet',
  launcher: 'Lanceur',
  other:    'Autre',
};

const PROP_LABELS = {
  Armor_DamageMitigation:    { label: 'Mitigation des dégâts',    unit: '%',     icon: '🛡️', invert: false },
  Armor_RadiationDissipation:{ label: 'Dissipation radiation',    unit: 'mRem/s', icon: '☢️', invert: false },
  Armor_TemperatureMax:      { label: 'Température max',          unit: '°C',    icon: '🔥', invert: false },
  Armor_TemperatureMin:      { label: 'Température min',          unit: '°C',    icon: '❄️', invert: false },
  Weapon_Damage:             { label: 'Dégâts',                   unit: '',      icon: '💥', invert: false },
  Weapon_FireRate:           { label: 'Cadence de tir',           unit: 'RPM',   icon: '⚡', invert: false },
  Weapon_Recoil_Handling:    { label: 'Contrôle du recul',        unit: '',      icon: '🎯', invert: true },
  Weapon_Recoil_Kick:        { label: 'Recul (kick)',             unit: '',      icon: '↗️', invert: true },
  Weapon_Recoil_Smoothness:  { label: 'Fluidité du recul',        unit: '',      icon: '〰️', invert: true },
  Weapon_ReloadSpeed:        { label: 'Vitesse de rechargement',  unit: '',      icon: '🔄', invert: false },
  Weapon_Spread:             { label: 'Dispersion',               unit: '',      icon: '◎', invert: true },
};

const SEARCH_MODES = [
  { id: 'blueprint', label: 'Blueprints',  placeholder: 'Rechercher un blueprint...' },
  { id: 'mission',   label: 'Missions',    placeholder: 'Rechercher une mission...' },
  { id: 'resource',  label: 'Ressources',  placeholder: 'Rechercher une ressource...' },
];

const PAGE_SIZE = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCraftTime(seconds) {
  if (!seconds) return '< 1s';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d) parts.push(`${d}j`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}min`);
  if (s) parts.push(`${s}s`);
  return parts.join(' ') || '< 1s';
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getModValue(mod, quality) {
  const t = Math.max(0, Math.min(1, (quality - mod.qMin) / (mod.qMax - mod.qMin || 1)));
  return lerp(mod.vMin, mod.vMax, t);
}

// ─── Data loader (lazy) ───────────────────────────────────────────────────────

let _cached = null;
async function loadBlueprints() {
  if (_cached) return _cached;
  const res = await fetch('/data/blueprints.json');
  _cached = await res.json();
  return _cached;
}

function useBlueprints() {
  const [data, setData] = useState(_cached);
  const [loading, setLoading] = useState(!_cached);

  useEffect(() => {
    if (_cached) { setData(_cached); return; }
    loadBlueprints().then(d => { setData(d); setLoading(false); });
  }, []);

  return { data, loading };
}

// ─── Quality Simulator ────────────────────────────────────────────────────────

function QualitySimulator({ blueprint }) {
  // Collect all slots that have modifiers
  const modSlots = useMemo(() => {
    return blueprint.slots
      .map((slot, idx) => {
        const option = slot.options[0]; // primary option
        if (!option?.mods?.length) return null;
        return { slot, option, idx, mods: option.mods };
      })
      .filter(Boolean);
  }, [blueprint]);

  const [qualities, setQualities] = useState(() => {
    const init = {};
    modSlots.forEach(ms => { init[ms.idx] = 500; });
    return init;
  });

  // Reset qualities when blueprint changes
  useEffect(() => {
    const init = {};
    modSlots.forEach(ms => { init[ms.idx] = 500; });
    setQualities(init);
  }, [blueprint.id]);

  if (modSlots.length === 0) return null;

  // Calculate combined modifiers
  const combinedMods = {};
  modSlots.forEach(ms => {
    const q = qualities[ms.idx] ?? 500;
    ms.mods.forEach(mod => {
      const val = getModValue(mod, q);
      if (!combinedMods[mod.prop]) combinedMods[mod.prop] = { values: [], prop: mod.prop };
      combinedMods[mod.prop].values.push(val);
    });
  });

  // Multiply all values for each property
  const finalMods = Object.values(combinedMods).map(cm => {
    const combined = cm.values.reduce((acc, v) => acc * v, 1);
    const pct = (combined - 1) * 100;
    return { prop: cm.prop, multiplier: combined, pct };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
        Simulateur de Qualité
      </div>

      {/* Sliders per slot */}
      <div className="space-y-3">
        {modSlots.map(ms => (
          <div key={ms.idx} className="rounded-lg border border-space-400/20 bg-space-700/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-200">{ms.slot.name}</div>
              <div className="text-xs text-cyan-400">{ms.option.resource}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-6">0</span>
              <input
                type="range"
                min={ms.mods[0]?.qMin ?? 0}
                max={ms.mods[0]?.qMax ?? 1000}
                value={qualities[ms.idx] ?? 500}
                onChange={e => setQualities(prev => ({ ...prev, [ms.idx]: Number(e.target.value) }))}
                className="flex-1 accent-cyan-400 h-2"
              />
              <span className="text-xs text-slate-500 w-10">1000</span>
              <input
                type="number"
                min={ms.mods[0]?.qMin ?? 0}
                max={ms.mods[0]?.qMax ?? 1000}
                value={qualities[ms.idx] ?? 500}
                onChange={e => setQualities(prev => ({ ...prev, [ms.idx]: Number(e.target.value) }))}
                className="w-16 px-2 py-1 rounded bg-space-800 border border-space-400/20 text-sm text-center text-slate-200"
              />
            </div>

            {/* Show individual mods for this slot */}
            <div className="flex flex-wrap gap-2 mt-2">
              {ms.mods.map(mod => {
                const val = getModValue(mod, qualities[ms.idx] ?? 500);
                const pct = (val - 1) * 100;
                const info = PROP_LABELS[mod.prop] || { label: mod.prop, icon: '📊' };
                const isGood = info.invert ? pct < 0 : pct > 0;
                return (
                  <span key={mod.prop} className={clsx(
                    'text-xs px-2 py-0.5 rounded-full',
                    isGood ? 'bg-green-900/30 text-green-400' : pct === 0 ? 'bg-slate-800 text-slate-400' : 'bg-red-900/30 text-red-400'
                  )}>
                    {info.icon} {info.label}: {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Combined final modifiers */}
      {finalMods.length > 0 && (
        <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/10 p-4">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-3">
            Modificateurs combinés finaux
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {finalMods.map(fm => {
              const info = PROP_LABELS[fm.prop] || { label: fm.prop, icon: '📊', invert: false };
              const isGood = info.invert ? fm.pct < 0 : fm.pct > 0;
              const baseVal = blueprint.baseStats?.[fm.prop];

              return (
                <div key={fm.prop} className="flex items-center justify-between p-2 rounded-lg bg-space-700/40 border border-space-400/20">
                  <div className="text-sm text-slate-300">
                    <span className="mr-1">{info.icon}</span>
                    {info.label}
                  </div>
                  <div className="text-right">
                    <span className={clsx(
                      'text-sm font-bold',
                      isGood ? 'text-green-400' : fm.pct === 0 ? 'text-slate-400' : 'text-red-400'
                    )}>
                      {fm.pct >= 0 ? '+' : ''}{fm.pct.toFixed(1)}%
                    </span>
                    {baseVal != null && (
                      <div className="text-xs text-slate-500">
                        Base: {baseVal} {info.unit} → {(baseVal * fm.multiplier).toFixed(1)} {info.unit}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Blueprint Detail Panel ───────────────────────────────────────────────────

function BlueprintDetail({ blueprint, onClose }) {
  if (!blueprint) return null;
  const cat = CAT_LABELS[blueprint.cat];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{blueprint.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={clsx('px-2 py-0.5 text-xs rounded-full font-medium', cat.bg, cat.color, cat.border, 'border')}>
                {cat.label}
              </span>
              {blueprint.subtype && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-space-700 text-slate-300 border border-space-400/20">
                  {blueprint.cat === 'armor' ? ARMOR_SUBTYPES[blueprint.subtype] : WEAPON_SUBTYPES[blueprint.subtype]}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {formatCraftTime(blueprint.craftTime)}
              </span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {blueprint.missions && blueprint.missions.length > 0 && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-900/20 border border-amber-700/30">
            <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-300">Obtenable en récompense de mission</span>
          </div>
        )}
      </div>

      {/* Slots / Parts */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Composants ({blueprint.slots.length} slots)
        </div>
        <div className="space-y-2">
          {blueprint.slots.map((slot, i) => (
            <div key={i} className="rounded-lg border border-space-400/20 bg-space-700/40 p-3">
              <div className="text-sm font-medium text-slate-200 mb-1">{slot.name}</div>
              {slot.options.map((opt, j) => (
                <div key={j} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Gem className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-medium">{opt.resource}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{opt.scu.toFixed(2)} SCU</span>
                    {opt.minQuality > 0 && (
                      <span className="text-amber-400">Qualité min: {opt.minQuality}</span>
                    )}
                  </div>
                </div>
              ))}
              {slot.options[0]?.mods?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {slot.options[0].mods.map(mod => {
                    const info = PROP_LABELS[mod.prop] || { label: mod.prop, icon: '📊' };
                    return (
                      <span key={mod.prop} className="text-xs px-1.5 py-0.5 rounded bg-space-600/50 text-slate-400">
                        {info.icon} {info.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quality Simulator */}
      <QualitySimulator blueprint={blueprint} />

      {/* Reward Missions */}
      {blueprint.missions && blueprint.missions.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Missions de récompense ({blueprint.missions.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {blueprint.missions.map((m, i) => (
              <div key={i} className="rounded-lg border border-space-400/20 bg-space-700/40 p-3 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300 line-clamp-2">{m.name}</span>
                <span className={clsx(
                  'text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full',
                  m.chance >= 1 ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'
                )}>
                  {Math.round(m.chance * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resource Summary View ────────────────────────────────────────────────────

function ResourceView({ blueprints, search }) {
  const q = search.toLowerCase();

  const resources = useMemo(() => {
    const map = {};
    blueprints.forEach(bp => {
      bp.slots.forEach(slot => {
        slot.options.forEach(opt => {
          if (!map[opt.resource]) {
            map[opt.resource] = { name: opt.resource, totalScu: 0, blueprintCount: 0, blueprintIds: new Set() };
          }
          if (!map[opt.resource].blueprintIds.has(bp.id)) {
            map[opt.resource].blueprintIds.add(bp.id);
            map[opt.resource].blueprintCount++;
          }
          map[opt.resource].totalScu += opt.scu;
        });
      });
    });
    return Object.values(map)
      .filter(r => !q || r.name.toLowerCase().includes(q))
      .sort((a, b) => b.blueprintCount - a.blueprintCount);
  }, [blueprints, q]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        {resources.length} ressources utilisées dans l'artisanat
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {resources.map(r => (
          <div key={r.name} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gem className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-sm font-semibold text-white">{r.name}</div>
                <div className="text-xs text-slate-500">{r.blueprintCount} blueprint{r.blueprintCount > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-400">{r.totalScu.toFixed(1)}</div>
              <div className="text-xs text-slate-500">SCU total</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mission View ─────────────────────────────────────────────────────────────

function MissionView({ blueprints, search, onSelectBlueprint }) {
  const q = search.toLowerCase();

  const missions = useMemo(() => {
    const map = {};
    blueprints.forEach(bp => {
      (bp.missions || []).forEach(m => {
        if (!map[m.name]) map[m.name] = { name: m.name, rewards: [] };
        map[m.name].rewards.push({ blueprint: bp, chance: m.chance });
      });
    });
    return Object.values(map)
      .filter(m => !q || m.name.toLowerCase().includes(q))
      .sort((a, b) => b.rewards.length - a.rewards.length);
  }, [blueprints, q]);

  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        {missions.length} missions avec récompenses blueprint
      </div>
      {missions.map(m => {
        const isOpen = expanded === m.name;
        return (
          <div key={m.name} className="card overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : m.name)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <Target className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-200">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.rewards.length} blueprint{m.rewards.length > 1 ? 's' : ''} possible{m.rewards.length > 1 ? 's' : ''}</div>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {isOpen && (
              <div className="border-t border-space-400/20 p-3 space-y-1">
                {m.rewards.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectBlueprint(r.blueprint)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-xs text-slate-300">{r.blueprint.name}</span>
                    <span className={clsx(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      r.chance >= 1 ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'
                    )}>
                      {Math.round(r.chance * 100)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {missions.length === 0 && (
        <div className="card p-8 text-center text-slate-400">Aucune mission trouvée.</div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Crafting() {
  const { data, loading } = useBlueprints();
  const [searchMode, setSearchMode] = useState('blueprint');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [subtypeFilter, setSubtypeFilter] = useState('all');
  const [rewardsOnly, setRewardsOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [search, catFilter, subtypeFilter, rewardsOnly, searchMode]);

  const blueprints = data?.blueprints || [];

  // Filtered blueprints
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return blueprints.filter(bp => {
      if (catFilter !== 'all' && bp.cat !== catFilter) return false;
      if (subtypeFilter !== 'all' && bp.subtype !== subtypeFilter) return false;
      if (rewardsOnly && (!bp.missions || bp.missions.length === 0)) return false;
      if (searchMode === 'blueprint' && q) {
        return bp.name.toLowerCase().includes(q) || bp.id.toLowerCase().includes(q);
      }
      if (searchMode === 'resource' && q) {
        return bp.slots.some(s => s.options.some(o => o.resource.toLowerCase().includes(q)));
      }
      if (searchMode === 'mission' && q) {
        return (bp.missions || []).some(m => m.name.toLowerCase().includes(q));
      }
      return true;
    });
  }, [blueprints, search, catFilter, subtypeFilter, rewardsOnly, searchMode]);

  // Stats
  const stats = useMemo(() => {
    if (!blueprints.length) return {};
    return {
      total: blueprints.length,
      armor: blueprints.filter(b => b.cat === 'armor').length,
      weapon: blueprints.filter(b => b.cat === 'weapon').length,
      ammo: blueprints.filter(b => b.cat === 'ammo').length,
      rewards: blueprints.filter(b => b.missions?.length > 0).length,
      resources: new Set(blueprints.flatMap(b => b.slots.flatMap(s => s.options.map(o => o.resource)))).size,
    };
  }, [blueprints]);

  // Subtypes for current cat filter
  const availableSubtypes = useMemo(() => {
    if (catFilter === 'armor') return Object.entries(ARMOR_SUBTYPES);
    if (catFilter === 'weapon') return Object.entries(WEAPON_SUBTYPES);
    return [];
  }, [catFilter]);

  // Paginated list
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSelectBp = useCallback((bp) => {
    setSelected(bp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-400 text-sm">Chargement des blueprints…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Hammer className="w-6 h-6 text-amber-400" />
            Artisanat — Crafting
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {stats.total} blueprints · {stats.resources} ressources · Données Alpha {data?.version?.split('-')[0] || '4.7'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Armures',    value: stats.armor,  color: 'text-cyan-400' },
            { label: 'Armes',      value: stats.weapon, color: 'text-orange-400' },
            { label: 'Munitions',  value: stats.ammo,   color: 'text-yellow-400' },
            { label: 'Récompenses', value: stats.rewards, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="card px-3 py-2 text-center min-w-[70px]">
              <div className={clsx('text-lg font-bold', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="card p-4 border border-amber-700/30 bg-amber-900/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">Système d'Artisanat</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              L'artisanat permet de fabriquer des armures, armes et munitions personnalisées.
              Chaque blueprint nécessite des <strong className="text-white">ressources minées</strong> en quantités SCU précises.
              La <strong className="text-white">qualité</strong> des matériaux influence les statistiques finales de l'objet.
              Les blueprints s'obtiennent via des <strong className="text-white">missions</strong> ou en les trouvant dans le monde.
            </p>
          </div>
        </div>
      </div>

      {/* Detail panel (if selected) */}
      {selected && (
        <div className="card p-5 border-2 border-cyan-500/30">
          <BlueprintDetail blueprint={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-300">Recherche & Filtres</span>
        </div>

        {/* Search mode tabs */}
        <div className="flex gap-1">
          {SEARCH_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setSearchMode(m.id); setSearch(''); }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                searchMode === m.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={SEARCH_MODES.find(m => m.id === searchMode)?.placeholder}
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category + Subtype + Rewards filter (only in blueprint mode) */}
        {searchMode === 'blueprint' && (
          <div className="flex flex-wrap gap-3">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Catégorie</label>
              <div className="flex gap-1 flex-wrap">
                {[['all', 'Tous'], ['armor', 'Armures'], ['weapon', 'Armes'], ['ammo', 'Munitions']].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => { setCatFilter(val); setSubtypeFilter('all'); }}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      catFilter === val
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                    )}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtype (only if armor/weapon selected) */}
            {availableSubtypes.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Type</label>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setSubtypeFilter('all')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      subtypeFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                    )}
                  >
                    Tous
                  </button>
                  {availableSubtypes.map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setSubtypeFilter(val)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        subtypeFilter === val
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                      )}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Source</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setRewardsOnly(false)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    !rewardsOnly
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                  )}
                >
                  Tous
                </button>
                <button
                  onClick={() => setRewardsOnly(true)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    rewardsOnly
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-space-700/50 text-slate-400 hover:text-slate-200 border border-space-400/20'
                  )}
                >
                  <Award className="w-3 h-3 inline mr-1" />
                  Récompenses
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content based on search mode */}
      {searchMode === 'mission' ? (
        <MissionView blueprints={blueprints} search={search} onSelectBlueprint={handleSelectBp} />
      ) : searchMode === 'resource' ? (
        <ResourceView blueprints={blueprints} search={search} />
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              {filtered.length !== blueprints.length && ` sur ${blueprints.length}`}
            </span>
            {pageCount > 1 && (
              <span className="text-xs text-slate-500">Page {page + 1} / {pageCount}</span>
            )}
          </div>

          {/* Blueprint list */}
          <div className="space-y-2">
            {paged.map(bp => {
              const cat = CAT_LABELS[bp.cat];
              const isSelected = selected?.id === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => handleSelectBp(bp)}
                  className={clsx(
                    'w-full card p-3 flex items-center justify-between hover:bg-white/5 transition-all text-left',
                    isSelected && 'ring-1 ring-cyan-500/50 bg-cyan-900/10'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cat.bg, 'border', cat.border)}>
                      {React.createElement(cat.icon, { className: clsx('w-4 h-4', cat.color) })}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{bp.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{bp.cat === 'armor' ? ARMOR_SUBTYPES[bp.subtype] : bp.cat === 'weapon' ? WEAPON_SUBTYPES[bp.subtype] : 'Munition'}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatCraftTime(bp.craftTime)}
                        </span>
                        <span>·</span>
                        <span>{bp.slots.length} composant{bp.slots.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {bp.missions?.length > 0 && (
                      <Award className="w-4 h-4 text-amber-400" />
                    )}
                    {bp.slots.some(s => s.options.some(o => o.mods?.length > 0)) && (
                      <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-space-700/50 text-slate-400 hover:text-white border border-space-400/20 disabled:opacity-40"
              >
                ← Précédent
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
                  let p;
                  if (pageCount <= 7) p = i;
                  else if (page < 4) p = i;
                  else if (page > pageCount - 5) p = pageCount - 7 + i;
                  else p = page - 3 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={clsx(
                        'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                        page === p
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-space-700/50 text-slate-400 hover:text-white border border-space-400/20'
                      )}
                    >
                      {p + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-space-700/50 text-slate-400 hover:text-white border border-space-400/20 disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card p-8 text-center text-slate-400">
              Aucun blueprint trouvé avec ces filtres.
            </div>
          )}
        </>
      )}
    </div>
  );
}
