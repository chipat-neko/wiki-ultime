/**
 * FPS Loadout Builder — Star Citizen Alpha 4.6
 * Constructeur d'équipement FPS avec stats live, builds méta, partage URL
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Target, Zap, Heart, Anchor, Crosshair,
  ChevronDown, ChevronUp, Copy, Check, RefreshCw,
  Search, Filter, Star, TrendingUp, Activity,
  Radio, Wrench, AlertCircle, Wifi, Share2, Users,
} from 'lucide-react';
import clsx from 'clsx';
import {
  LOADOUT_WEAPONS,
  LOADOUT_ARMOR_SETS,
  LOADOUT_GADGETS,
  FPS_META_BUILDS,
  FPS_BUDGET_TIERS,
  getFPSBudgetTier,
  calcLoadoutStats,
  getLoadoutScore,
  WEAPON_TYPE_LABELS,
  ARMOR_CLASS_LABELS,
  AMMO_TYPE_COLORS,
  ARMOR_PEN_LABELS,
} from '../../datasets/fpsLoadoutData.js';
import { supabase } from '../../lib/supabase.js';
import ShareBuildModal from '../builds/ShareBuildModal.jsx';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function encodeLoadout(loadout) {
  try {
    return btoa(JSON.stringify(loadout));
  } catch {
    return '';
  }
}

function decodeLoadout(str) {
  try {
    return JSON.parse(atob(str));
  } catch {
    return null;
  }
}

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return String(n);
}

const GADGET_ICON_MAP = {
  wrench: Wrench,
  heart: Heart,
  activity: Activity,
  zap: Zap,
  'alert-circle': AlertCircle,
  'trending-up': TrendingUp,
  radio: Radio,
  shield: Shield,
  wifi: Wifi,
  anchor: Anchor,
};

function GadgetIcon({ icon, className }) {
  const Comp = GADGET_ICON_MAP[icon] || Zap;
  return <Comp className={className} />;
}

const META_ICON_MAP = {
  crosshair: Crosshair,
  shield: Shield,
  anchor: Anchor,
  heart: Heart,
  zap: Zap,
  target: Target,
};

function MetaIcon({ icon, className }) {
  const Comp = META_ICON_MAP[icon] || Shield;
  return <Comp className={className} />;
}

const SCORE_COLOR = (score) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-cyan-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

// ─── BARRE DE STAT ───────────────────────────────────────────────────────────

function StatBar({ label, value, max = 10, color = 'bg-cyan-500', unit = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-bold text-white">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function WeightBar({ weight }) {
  const maxWeight = 32;
  const pct = Math.min(100, Math.round((weight / maxWeight) * 100));
  const color = pct < 40 ? 'bg-green-500' : pct < 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">Poids total</span>
        <span className={clsx('text-xs font-bold', pct < 40 ? 'text-green-400' : pct < 70 ? 'text-yellow-400' : 'text-red-400')}>
          {weight} kg
        </span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── SILHOUETTE LOADOUT ──────────────────────────────────────────────────────

function LoadoutSilhouette({ weaponId, armorId, gadgetIds }) {
  const weapon = LOADOUT_WEAPONS.find(w => w.id === weaponId);
  const armor = LOADOUT_ARMOR_SETS.find(a => a.id === armorId);
  const armorClass = armor?.class;

  const zoneColors = {
    undersuit: 'bg-gray-600/60',
    light: 'bg-cyan-600/40 border-cyan-500/50',
    medium: 'bg-blue-600/40 border-blue-500/50',
    heavy: 'bg-red-800/50 border-red-500/60',
  };

  const zoneColor = zoneColors[armorClass] || zoneColors.undersuit;

  return (
    <div className="flex flex-col items-center py-4 select-none">
      {/* Tête */}
      <div className={clsx(
        'relative w-16 h-16 rounded-full border-2 flex items-center justify-center mb-1',
        armorId ? zoneColor : 'bg-gray-700/40 border-gray-600/50'
      )}>
        <span className="text-2xl">🪖</span>
        {armor && (
          <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-500 mb-3">Tête</span>

      {/* Corps */}
      <div className={clsx(
        'relative w-24 h-28 rounded-lg border-2 flex flex-col items-center justify-center mb-1',
        armorId ? zoneColor : 'bg-gray-700/40 border-gray-600/50'
      )}>
        <Shield className={clsx('w-8 h-8', armorId ? 'text-cyan-400' : 'text-gray-600')} />
        {armor && (
          <span className="text-[9px] text-center text-gray-300 mt-1 px-1 leading-tight">
            {armor.name.replace('Set ', '')}
          </span>
        )}
        {armor && (
          <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-500 mb-3">Corps</span>

      {/* Bras + Arme */}
      <div className="flex gap-2 mb-1">
        <div className={clsx(
          'w-10 h-20 rounded-lg border-2 flex items-center justify-center',
          armorId ? zoneColor : 'bg-gray-700/40 border-gray-600/50'
        )}>
          <span className="text-sm">💪</span>
        </div>
        {/* Arme au milieu */}
        <div className={clsx(
          'w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center',
          weaponId ? 'bg-yellow-900/30 border-yellow-500/50' : 'bg-gray-700/40 border-gray-600/50'
        )}>
          {weapon ? (
            <>
              <span className="text-xl">🔫</span>
              <span className="text-[8px] text-yellow-300 text-center mt-1 px-1 leading-tight">
                {weapon.name}
              </span>
            </>
          ) : (
            <span className="text-gray-600 text-xs">Arme</span>
          )}
        </div>
        <div className={clsx(
          'w-10 h-20 rounded-lg border-2 flex items-center justify-center',
          armorId ? zoneColor : 'bg-gray-700/40 border-gray-600/50'
        )}>
          <span className="text-sm">💪</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-500 mb-3">Bras</span>

      {/* Jambes */}
      <div className="flex gap-2 mb-1">
        <div className={clsx(
          'w-10 h-24 rounded-lg border-2 flex items-center justify-center',
          armorId ? zoneColor : 'bg-gray-700/40 border-gray-600/50'
        )}>
          <span className="text-sm">🦵</span>
        </div>
        <div className={clsx(
          'w-10 h-24 rounded-lg border-2 flex items-center justify-center',
          armorId ? zoneColor : 'bg-gray-700/40 border-gray-600/50'
        )}>
          <span className="text-sm">🦵</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-500 mb-3">Jambes</span>

      {/* Gadgets */}
      {gadgetIds.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {gadgetIds.map(gid => {
            const g = LOADOUT_GADGETS.find(x => x.id === gid);
            if (!g) return null;
            return (
              <div key={gid} className="w-10 h-10 rounded-lg bg-purple-900/40 border border-purple-500/40 flex items-center justify-center" title={g.name}>
                <GadgetIcon icon={g.icon} className="w-5 h-5 text-purple-300" />
              </div>
            );
          })}
        </div>
      )}
      {gadgetIds.length > 0 && (
        <span className="text-[10px] text-gray-500 mt-1">Gadgets</span>
      )}
    </div>
  );
}

// ─── CARTE ARME ──────────────────────────────────────────────────────────────

function WeaponCard({ weapon, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(weapon.id)}
      className={clsx(
        'w-full text-left p-2.5 rounded-lg border transition-all duration-150',
        selected
          ? 'bg-yellow-900/40 border-yellow-500/60 shadow-md shadow-yellow-500/10'
          : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-500/60 hover:bg-gray-700/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm text-white truncate">{weapon.name}</span>
            {selected && <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
          </div>
          <div className="text-[11px] text-gray-400">{weapon.manufacturer}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={clsx('text-xs font-bold', AMMO_TYPE_COLORS[weapon.ammoType])}>
            {weapon.ammoType === 'ballistic' ? 'BALL' : weapon.ammoType === 'energy' ? 'NRJ' : 'EXP'}
          </div>
          <div className="text-[10px] text-gray-500">{weapon.range}m</div>
        </div>
      </div>
      <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
        <span className="text-yellow-300 font-semibold">{weapon.dps} DPS</span>
        <span>{weapon.rof} RPM</span>
        <span>Mag {weapon.magSize}</span>
        <span>{weapon.weight}kg</span>
      </div>
    </button>
  );
}

// ─── CARTE ARMURE ─────────────────────────────────────────────────────────────

function ArmorCard({ armor, selected, onClick }) {
  const classColors = {
    light: 'text-cyan-400',
    medium: 'text-blue-400',
    heavy: 'text-red-400',
  };
  return (
    <button
      onClick={() => onClick(armor.id)}
      className={clsx(
        'w-full text-left p-2.5 rounded-lg border transition-all duration-150',
        selected
          ? 'bg-blue-900/40 border-blue-500/60 shadow-md shadow-blue-500/10'
          : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-500/60 hover:bg-gray-700/40'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm text-white truncate">{armor.name}</span>
            {selected && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
          </div>
          <div className="text-[11px] text-gray-400">{armor.manufacturer}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={clsx('text-xs font-bold', classColors[armor.class])}>
            {ARMOR_CLASS_LABELS[armor.class]}
          </div>
          <div className="text-[10px] text-gray-500">Mob {armor.mobility}/10</div>
        </div>
      </div>
      <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
        <span className="text-green-300 font-semibold">Phys {armor.totalResistance.physical}</span>
        <span>NRJ {armor.totalResistance.energy}</span>
        <span>{armor.weight}kg</span>
        {armor.illegal && <span className="text-red-400">⚠ Illégal</span>}
      </div>
    </button>
  );
}

// ─── CARTE GADGET ─────────────────────────────────────────────────────────────

function GadgetCard({ gadget, selected, disabled, onClick }) {
  return (
    <button
      onClick={() => onClick(gadget.id)}
      disabled={disabled && !selected}
      className={clsx(
        'w-full text-left p-2.5 rounded-lg border transition-all duration-150',
        selected
          ? 'bg-purple-900/40 border-purple-500/60 shadow-md shadow-purple-500/10'
          : disabled
            ? 'bg-gray-800/30 border-gray-700/30 opacity-50 cursor-not-allowed'
            : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-500/60 hover:bg-gray-700/40'
      )}
    >
      <div className="flex items-center gap-2">
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          selected ? 'bg-purple-800/60' : 'bg-gray-700/60'
        )}>
          <GadgetIcon icon={gadget.icon} className={clsx('w-4 h-4', selected ? 'text-purple-300' : 'text-gray-400')} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-white truncate">{gadget.name}</span>
            {selected && <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />}
          </div>
          <div className="text-[10px] text-gray-400 truncate">{gadget.effect.slice(0, 55)}…</div>
        </div>
        <div className="text-[10px] text-gray-500 flex-shrink-0">{gadget.weight}kg</div>
      </div>
    </button>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function FPSLoadoutBuilder() {
  // État du loadout
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [selectedArmor, setSelectedArmor] = useState(null);
  const [selectedGadgets, setSelectedGadgets] = useState([]);

  // Filtres colonne gauche
  const [activeTab, setActiveTab] = useState('weapon'); // 'weapon' | 'armor' | 'gadget'
  const [weaponTypeFilter, setWeaponTypeFilter] = useState('all');
  const [armorClassFilter, setArmorClassFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI states
  const [copied, setCopied] = useState(false);
  const [expandedMeta, setExpandedMeta] = useState(null);
  const [fpsBudgetFilter, setFpsBudgetFilter] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [fpsUser, setFpsUser] = useState(null);
  const navigate = useNavigate();

  // Auth
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setFpsUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setFpsUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Lire loadout depuis URL au montage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('loadout');
    const sharedParam = params.get('shared');
    if (encoded) {
      const data = decodeLoadout(encoded);
      if (data) {
        if (data.weaponId) setSelectedWeapon(data.weaponId);
        if (data.armorId) setSelectedArmor(data.armorId);
        if (Array.isArray(data.gadgets)) setSelectedGadgets(data.gadgets);
      }
    } else if (sharedParam) {
      try {
        const data = JSON.parse(atob(sharedParam));
        if (data.weaponId) setSelectedWeapon(data.weaponId);
        if (data.armorId) setSelectedArmor(data.armorId);
        if (Array.isArray(data.gadgets)) setSelectedGadgets(data.gadgets);
      } catch {}
    }
  }, []);

  // Écrire loadout dans URL quand ça change
  useEffect(() => {
    const loadout = { weaponId: selectedWeapon, armorId: selectedArmor, gadgets: selectedGadgets };
    const encoded = encodeLoadout(loadout);
    const url = new URL(window.location.href);
    if (selectedWeapon || selectedArmor || selectedGadgets.length > 0) {
      url.searchParams.set('loadout', encoded);
    } else {
      url.searchParams.delete('loadout');
    }
    window.history.replaceState(null, '', url.toString());
  }, [selectedWeapon, selectedArmor, selectedGadgets]);

  // Stats calculées
  const stats = useMemo(
    () => calcLoadoutStats(selectedWeapon, selectedArmor, selectedGadgets),
    [selectedWeapon, selectedArmor, selectedGadgets]
  );
  const score = useMemo(() => getLoadoutScore(stats), [stats]);

  // Filtrage des armes
  const filteredWeapons = useMemo(() => {
    let list = LOADOUT_WEAPONS;
    if (weaponTypeFilter !== 'all') list = list.filter(w => w.type === weaponTypeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.manufacturer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [weaponTypeFilter, searchQuery]);

  // Filtrage des armures
  const filteredArmors = useMemo(() => {
    let list = LOADOUT_ARMOR_SETS;
    if (armorClassFilter !== 'all') list = list.filter(a => a.class === armorClassFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.manufacturer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [armorClassFilter, searchQuery]);

  // Gadgets filtrés
  const filteredGadgets = useMemo(() => {
    if (!searchQuery) return LOADOUT_GADGETS;
    const q = searchQuery.toLowerCase();
    return LOADOUT_GADGETS.filter(g => g.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleWeaponClick = useCallback((id) => {
    setSelectedWeapon(prev => prev === id ? null : id);
  }, []);

  const handleArmorClick = useCallback((id) => {
    setSelectedArmor(prev => prev === id ? null : id);
  }, []);

  const handleGadgetClick = useCallback((id) => {
    setSelectedGadgets(prev => {
      if (prev.includes(id)) return prev.filter(g => g !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const loadMetaBuild = useCallback((build) => {
    setSelectedWeapon(build.weaponId);
    setSelectedArmor(build.armorId);
    setSelectedGadgets(build.gadgets);
    setExpandedMeta(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearLoadout = useCallback(() => {
    setSelectedWeapon(null);
    setSelectedArmor(null);
    setSelectedGadgets([]);
  }, []);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const currentWeapon = LOADOUT_WEAPONS.find(w => w.id === selectedWeapon);
  const currentArmor = LOADOUT_ARMOR_SETS.find(a => a.id === selectedArmor);
  const currentGadgets = selectedGadgets.map(id => LOADOUT_GADGETS.find(g => g.id === id)).filter(Boolean);

  const WEAPON_TYPES = ['all', 'pistol', 'smg', 'rifle', 'shotgun', 'sniper', 'heavy', 'launcher'];
  const ARMOR_CLASSES = ['all', 'light', 'medium', 'heavy'];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/80 border-b border-gray-800/60 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400" />
              Builder Équipement FPS
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Construisez votre loadout optimal — Alpha 4.6
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLoadout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/60 border border-cyan-700/60 text-sm text-cyan-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier URL'}
            </button>
            {fpsUser && selectedWeapon && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800/60 border border-purple-700/60 text-sm text-purple-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Partager Build
              </button>
            )}
            <button
              onClick={() => navigate('/builds?type=fps')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 transition-colors"
            >
              <Users className="w-4 h-4" />
              Communauté
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Layout 3 colonnes */}
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_300px] gap-6">

          {/* ── COLONNE GAUCHE : Sélection ── */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 flex flex-col overflow-hidden">
            {/* Onglets */}
            <div className="flex border-b border-gray-800/60">
              {[
                { key: 'weapon', label: 'Arme', icon: Target },
                { key: 'armor', label: 'Armure', icon: Shield },
                { key: 'gadget', label: 'Gadgets', icon: Zap },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setSearchQuery(''); }}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors',
                    activeTab === key
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10'
                      : 'text-gray-400 hover:text-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="p-3 border-b border-gray-800/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Filtres */}
            {activeTab === 'weapon' && (
              <div className="px-3 py-2 border-b border-gray-800/60 flex flex-wrap gap-1">
                {WEAPON_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setWeaponTypeFilter(type)}
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors',
                      weaponTypeFilter === type
                        ? 'bg-cyan-700/60 text-cyan-200 border border-cyan-600/50'
                        : 'bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:text-gray-200'
                    )}
                  >
                    {type === 'all' ? 'Tous' : WEAPON_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'armor' && (
              <div className="px-3 py-2 border-b border-gray-800/60 flex gap-1">
                {ARMOR_CLASSES.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setArmorClassFilter(cls)}
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors',
                      armorClassFilter === cls
                        ? 'bg-blue-700/60 text-blue-200 border border-blue-600/50'
                        : 'bg-gray-800/60 text-gray-400 border border-gray-700/40 hover:text-gray-200'
                    )}
                  >
                    {cls === 'all' ? 'Toutes' : ARMOR_CLASS_LABELS[cls]}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'gadget' && (
              <div className="px-3 py-2 border-b border-gray-800/40">
                <p className="text-[11px] text-gray-500">
                  {selectedGadgets.length}/3 gadgets sélectionnés
                </p>
              </div>
            )}

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[calc(100vh-320px)]">
              {activeTab === 'weapon' && filteredWeapons.map(w => (
                <WeaponCard
                  key={w.id}
                  weapon={w}
                  selected={selectedWeapon === w.id}
                  onClick={handleWeaponClick}
                />
              ))}
              {activeTab === 'weapon' && filteredWeapons.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Aucune arme trouvée</p>
              )}

              {activeTab === 'armor' && filteredArmors.map(a => (
                <ArmorCard
                  key={a.id}
                  armor={a}
                  selected={selectedArmor === a.id}
                  onClick={handleArmorClick}
                />
              ))}
              {activeTab === 'armor' && filteredArmors.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Aucune armure trouvée</p>
              )}

              {activeTab === 'gadget' && filteredGadgets.map(g => (
                <GadgetCard
                  key={g.id}
                  gadget={g}
                  selected={selectedGadgets.includes(g.id)}
                  disabled={selectedGadgets.length >= 3}
                  onClick={handleGadgetClick}
                />
              ))}
            </div>
          </div>

          {/* ── COLONNE CENTRALE : Aperçu Loadout ── */}
          <div className="space-y-4">
            {/* Silhouette + info sélectionnée */}
            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Aperçu du Loadout
              </h2>
              <div className="flex gap-4">
                {/* Silhouette */}
                <div className="flex-shrink-0">
                  <LoadoutSilhouette
                    weaponId={selectedWeapon}
                    armorId={selectedArmor}
                    gadgetIds={selectedGadgets}
                  />
                </div>

                {/* Détails équipement sélectionné */}
                <div className="flex-1 space-y-3">
                  {/* Arme */}
                  <div className={clsx(
                    'rounded-lg p-3 border',
                    currentWeapon
                      ? 'bg-yellow-900/20 border-yellow-700/40'
                      : 'bg-gray-800/40 border-gray-700/40'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-300">Arme principale</span>
                    </div>
                    {currentWeapon ? (
                      <>
                        <p className="text-sm font-bold text-white">{currentWeapon.name}</p>
                        <p className="text-xs text-gray-400">{currentWeapon.manufacturer} · {WEAPON_TYPE_LABELS[currentWeapon.type]}</p>
                        <div className="flex gap-3 mt-1.5 text-xs">
                          <span className="text-yellow-300">{currentWeapon.dps} DPS</span>
                          <span className="text-gray-400">{currentWeapon.rof} RPM</span>
                          <span className="text-gray-400">Portée {currentWeapon.range}m</span>
                          <span className={AMMO_TYPE_COLORS[currentWeapon.ammoType]}>
                            {currentWeapon.ammoType}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{currentWeapon.description}</p>
                        <div className="text-[11px] text-gray-400 mt-1">
                          📍 {currentWeapon.location}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Aucune arme sélectionnée</p>
                    )}
                  </div>

                  {/* Armure */}
                  <div className={clsx(
                    'rounded-lg p-3 border',
                    currentArmor
                      ? 'bg-blue-900/20 border-blue-700/40'
                      : 'bg-gray-800/40 border-gray-700/40'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-300">Armure</span>
                    </div>
                    {currentArmor ? (
                      <>
                        <p className="text-sm font-bold text-white">{currentArmor.name}</p>
                        <p className="text-xs text-gray-400">{currentArmor.manufacturer} · {ARMOR_CLASS_LABELS[currentArmor.class]}</p>
                        <div className="flex gap-3 mt-1.5 text-xs">
                          <span className="text-green-300">Phys {currentArmor.totalResistance.physical}</span>
                          <span className="text-cyan-300">NRJ {currentArmor.totalResistance.energy}</span>
                          <span className="text-gray-400">Mob {currentArmor.mobility}/10</span>
                          {currentArmor.illegal && <span className="text-red-400">Illégal</span>}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{currentArmor.description}</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Aucune armure sélectionnée</p>
                    )}
                  </div>

                  {/* Gadgets sélectionnés */}
                  {currentGadgets.length > 0 && (
                    <div className="rounded-lg p-3 border bg-purple-900/20 border-purple-700/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-purple-300">Gadgets ({currentGadgets.length}/3)</span>
                      </div>
                      <div className="space-y-1">
                        {currentGadgets.map(g => (
                          <div key={g.id} className="flex items-start gap-1.5">
                            <GadgetIcon icon={g.icon} className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs text-white">{g.name}</span>
                              <p className="text-[10px] text-gray-500">{g.effect.slice(0, 70)}…</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Builds Méta */}
            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Builds Méta recommandés
              </h2>

              {/* Filtres budget */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setFpsBudgetFilter('all')}
                  className={clsx('text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer',
                    fpsBudgetFilter === 'all' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'border-gray-700 text-gray-500 hover:border-gray-500')}
                >
                  Tous
                </button>
                {FPS_BUDGET_TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setFpsBudgetFilter(tier.id)}
                    className={clsx('text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer',
                      fpsBudgetFilter === tier.id ? `${tier.bg} ${tier.border} ${tier.color}` : 'border-gray-700 text-gray-500 hover:border-gray-500')}
                  >
                    {tier.label} {tier.max < Infinity ? `≤${tier.max >= 1000 ? Math.round(tier.max/1000)+'K' : tier.max}` : ''}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {FPS_META_BUILDS.filter(build => {
                  if (fpsBudgetFilter === 'all') return true;
                  const buildStats = calcLoadoutStats(build.weaponId, build.armorId, build.gadgets);
                  return getFPSBudgetTier(buildStats.price).id === fpsBudgetFilter;
                }).map(build => (
                  <div
                    key={build.id}
                    className={clsx(
                      'rounded-lg border p-3 transition-all',
                      build.bgColor,
                      build.borderColor
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MetaIcon icon={build.icon} className={clsx('w-4 h-4', build.color)} />
                        <span className={clsx('text-sm font-bold', build.color)}>{build.name}</span>
                      </div>
                      <button
                        onClick={() => setExpandedMeta(expandedMeta === build.id ? null : build.id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {expandedMeta === build.id
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-400 mb-2">{build.description}</p>

                    {/* Barres stats rapides */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 w-12">Puissance</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${build.stats.firepower * 10}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 w-12">Survie</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${build.stats.survivability * 10}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 w-12">Mobilité</span>
                        <div className="flex-1 h-1 bg-gray-700 rounded-full">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${build.stats.mobility * 10}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Badge prix */}
                    {(() => {
                      const bStats = calcLoadoutStats(build.weaponId, build.armorId, build.gadgets);
                      const bTier = getFPSBudgetTier(bStats.price);
                      return (
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className={clsx(bTier.color)}>~{bStats.price >= 1000 ? Math.round(bStats.price/1000)+'K' : bStats.price} aUEC</span>
                          <span className={clsx('px-1.5 py-0.5 rounded', bTier.bg, bTier.border, bTier.color, 'border')}>{bTier.label}</span>
                        </div>
                      );
                    })()}

                    {expandedMeta === build.id && (
                      <div className="border-t border-gray-700/50 pt-2 mt-2">
                        <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{build.playstyle}</p>
                        <div className="text-[10px] space-y-0.5 mb-2">
                          {build.strengths.map((s, i) => (
                            <div key={i} className="text-green-400">+ {s}</div>
                          ))}
                          {build.weaknesses.map((w, i) => (
                            <div key={i} className="text-red-400">- {w}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => loadMetaBuild(build)}
                      className={clsx(
                        'w-full py-1 rounded-md text-[11px] font-semibold transition-colors mt-1',
                        'bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 text-gray-300'
                      )}
                    >
                      Charger ce build
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── COLONNE DROITE : Stats Live ── */}
          <div className="space-y-4">
            {/* Score global */}
            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Score Global</p>
              <div className={clsx('text-6xl font-black mb-1', SCORE_COLOR(score))}>
                {score}
              </div>
              <p className="text-xs text-gray-500">/ 100</p>
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-700',
                    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-cyan-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            {/* Stats de combat */}
            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
              <h3 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Stats de Combat
              </h3>
              <div className="space-y-1">
                <StatBar
                  label="DPS (dommages/sec)"
                  value={stats.dps}
                  max={500}
                  color="bg-red-500"
                  unit=""
                />
                <WeightBar weight={stats.totalWeight} />
                <StatBar
                  label="Mobilité"
                  value={stats.mobility}
                  max={10}
                  color="bg-yellow-500"
                  unit="/10"
                />
                <StatBar
                  label="Survivabilité"
                  value={stats.survivability}
                  max={10}
                  color="bg-green-500"
                  unit="/10"
                />
              </div>
            </div>

            {/* Résistances */}
            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
              <h3 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Résistances Armure
              </h3>
              <div className="space-y-1">
                <StatBar
                  label="Physique"
                  value={stats.resistances.physical || 0}
                  max={300}
                  color="bg-orange-500"
                />
                <StatBar
                  label="Énergie"
                  value={stats.resistances.energy || 0}
                  max={250}
                  color="bg-cyan-500"
                />
                <StatBar
                  label="Distorsion"
                  value={stats.resistances.distortion || 0}
                  max={150}
                  color="bg-purple-500"
                />
                <StatBar
                  label="Biochimique"
                  value={stats.resistances.biochemical || 0}
                  max={150}
                  color="bg-green-500"
                />
                <StatBar
                  label="Stun"
                  value={stats.resistances.stun || 0}
                  max={120}
                  color="bg-yellow-500"
                />
              </div>
            </div>

            {/* Prix total */}
            <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
              <h3 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                Budget Estimé
              </h3>
              <div className="space-y-2">
                {currentWeapon && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{currentWeapon.name}</span>
                    <span className="text-yellow-300">{fmt(currentWeapon.price)} aUEC</span>
                  </div>
                )}
                {currentArmor && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{currentArmor.name}</span>
                    <span className="text-yellow-300">{fmt(currentArmor.price)} aUEC</span>
                  </div>
                )}
                {currentGadgets.map(g => (
                  <div key={g.id} className="flex justify-between text-xs">
                    <span className="text-gray-400">{g.name}</span>
                    <span className="text-yellow-300">{fmt(g.price)} aUEC</span>
                  </div>
                ))}
                {(currentWeapon || currentArmor || currentGadgets.length > 0) && (
                  <div className="border-t border-gray-700/60 pt-2 flex justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-sm font-bold text-yellow-400">{fmt(stats.price)} aUEC</span>
                  </div>
                )}
                {!currentWeapon && !currentArmor && currentGadgets.length === 0 && (
                  <p className="text-xs text-gray-500 italic text-center py-2">Sélectionnez de l'équipement</p>
                )}
              </div>
            </div>

            {/* Infos arme détaillées */}
            {currentWeapon && (
              <div className="bg-gray-900/60 rounded-xl border border-gray-800/60 p-4">
                <h3 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-400" />
                  Détail Arme
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chargeur</span>
                    <span className="text-white">{currentWeapon.magSize} balles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rechargement</span>
                    <span className="text-white">{currentWeapon.reloadTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Portée effective</span>
                    <span className="text-white">{currentWeapon.range}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pénétration</span>
                    <span className="text-white">{ARMOR_PEN_LABELS[currentWeapon.armorPen]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Munitions</span>
                    <span className={AMMO_TYPE_COLORS[currentWeapon.ammoType]}>
                      {currentWeapon.ammoType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tier</span>
                    <span className={clsx(
                      'capitalize',
                      currentWeapon.tier === 'elite' ? 'text-purple-400' :
                        currentWeapon.tier === 'premium' ? 'text-yellow-400' :
                          currentWeapon.tier === 'starter' ? 'text-gray-300' : 'text-white'
                    )}>{currentWeapon.tier}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareBuildModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        buildType="fps"
        shipId={null}
        buildData={{ weaponId: selectedWeapon, armorId: selectedArmor, gadgets: selectedGadgets }}
        totalPrice={stats.price}
        userId={fpsUser?.id}
      />
    </div>
  );
}
