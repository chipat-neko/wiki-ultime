import React, { useState, useMemo } from 'react';
import { WIKELO_BLUEPRINTS, CRAFT_CATEGORIES, CRAFT_MATERIALS, WIKELO_LOCATIONS, WIKELO_TIERS } from '../../datasets/wikelo.js';
import { Search, Hammer, Package, Filter, ChevronRight, ChevronDown, MapPin, Clock, Coins } from 'lucide-react';
import clsx from 'clsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TIER_COLORS = { 1: 'badge-green', 2: 'badge-blue', 3: 'badge-purple' };
const TIER_TEXT   = { 1: 'text-green-400', 2: 'text-blue-400', 3: 'text-purple-400' };

function formatCraftTime(mins) {
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim();
}

function formatCost(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M aUEC`;
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}K aUEC`;
  return `${n} aUEC`;
}

// ─── Blueprint Card ───────────────────────────────────────────────────────────
function BlueprintCard({ bp }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CRAFT_CATEGORIES.find(c => c.id === bp.category);

  return (
    <div className="card overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-100 text-sm">{bp.name}</h3>
              <span className={`badge ${TIER_COLORS[bp.tier]} text-xs`}>T{bp.tier}</span>
              <span className="badge badge-slate text-xs">v{bp.patch}</span>
            </div>
            <p className="text-xs text-slate-500">{cat?.label}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-sm font-bold ${TIER_TEXT[bp.tier]}`}>{formatCost(bp.cost)}</span>
            {expanded
              ? <ChevronDown className="w-4 h-4 text-slate-500" />
              : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatCraftTime(bp.craftTime)}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {bp.materials.length} matériaux
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {bp.location.length === 4 ? 'Tous les hubs' : bp.location.map(l =>
              WIKELO_LOCATIONS.find(loc => loc.id === l)?.name.split(' — ')[0]
            ).join(', ')}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-space-400/20 p-4 space-y-4 bg-space-900/40">
          <p className="text-xs text-slate-400 leading-relaxed">{bp.description}</p>

          {/* Matériaux */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Matériaux requis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {bp.materials.map((mat, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-space-800/60 border border-space-400/10">
                  <span className="text-xs text-slate-300">{mat.name}</span>
                  <span className="text-xs font-bold text-cyan-400">{mat.qty} {mat.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emplacements */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Disponible chez Wikelo à
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {bp.location.map(locId => {
                const loc = WIKELO_LOCATIONS.find(l => l.id === locId);
                return loc ? (
                  <span key={locId} className="badge badge-cyan text-xs">
                    <MapPin className="w-2.5 h-2.5 mr-1 inline" />
                    {loc.name.split(' — ')[0]}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Materials Tab ────────────────────────────────────────────────────────────
function MaterialsTab() {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-cyan-400" />
          Matériaux d'artisanat
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left text-xs text-slate-400 uppercase tracking-wide pb-2 pr-4">Matériau</th>
                <th className="text-left text-xs text-slate-400 uppercase tracking-wide pb-2 pr-4">Type</th>
                <th className="text-left text-xs text-slate-400 uppercase tracking-wide pb-2 pr-4">Rareté</th>
                <th className="text-left text-xs text-slate-400 uppercase tracking-wide pb-2">Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-400/10">
              {CRAFT_MATERIALS.map(mat => (
                <tr key={mat.id} className="hover:bg-space-700/20 transition-colors">
                  <td className="py-2 pr-4 text-sm font-medium text-slate-200">{mat.name}</td>
                  <td className="py-2 pr-4 text-xs text-slate-400">{mat.type}</td>
                  <td className="py-2 pr-4">
                    <span className={clsx('badge text-xs', {
                      'badge-green':  mat.rarity === 'Très commun',
                      'badge-slate':  mat.rarity === 'Commun',
                      'badge-yellow': mat.rarity === 'Peu commun',
                      'badge-red':    mat.rarity === 'Rare',
                    })}>{mat.rarity}</span>
                  </td>
                  <td className="py-2 text-xs text-slate-400">
                    {mat.sources.join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Locations Tab ────────────────────────────────────────────────────────────
function LocationsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {WIKELO_LOCATIONS.map(loc => (
        <div key={loc.id} className="card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <h3 className="font-bold text-slate-100 text-sm">{loc.name}</h3>
          </div>
          <p className="text-xs text-slate-400">{loc.description}</p>
          <div className="flex gap-2">
            <span className="badge badge-slate text-xs">{loc.system}</span>
            <span className="badge badge-cyan text-xs">{loc.body}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Wikelo() {
  const [activeTab, setActiveTab] = useState('blueprints');
  const [search, setSearch]       = useState('');
  const [selCategory, setSelCategory] = useState('');
  const [selTier, setSelTier]     = useState('');

  const filtered = useMemo(() => {
    let list = WIKELO_BLUEPRINTS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(bp =>
        bp.name.toLowerCase().includes(q) ||
        bp.description.toLowerCase().includes(q) ||
        bp.materials.some(m => m.name.toLowerCase().includes(q))
      );
    }
    if (selCategory) list = list.filter(bp => bp.category === selCategory);
    if (selTier)     list = list.filter(bp => bp.tier === Number(selTier));
    return list;
  }, [search, selCategory, selTier]);

  const tabs = [
    { id: 'blueprints', label: 'Plans (Blueprints)', count: WIKELO_BLUEPRINTS.length },
    { id: 'materials',  label: 'Matériaux',          count: CRAFT_MATERIALS.length },
    { id: 'locations',  label: 'Emplacements',        count: WIKELO_LOCATIONS.length },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Wikelo — Artisanat</h1>
          <p className="page-subtitle">NPC marchand de plans de fabrication — Alpha 4.1+</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-700/50 border border-space-400/20">
          <Hammer className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-slate-300">{WIKELO_BLUEPRINTS.length} plans disponibles</span>
        </div>
      </div>

      {/* Info banner */}
      <div className="card p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Hammer className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <strong className="text-amber-400">Wikelo</strong> est le NPC artisan introduit en <strong>Alpha 4.1</strong>.
            Il vend des plans de fabrication (blueprints) dans les 4 grands hubs de Stanton.
            L'artisanat nécessite des matériaux récoltés par minage ou achetés, et un temps de fabrication variable.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WIKELO_TIERS.map(tier => {
          const count = WIKELO_BLUEPRINTS.filter(bp => bp.tier === tier.id).length;
          return (
            <div key={tier.id} className="card p-3 text-center">
              <div className={`text-2xl font-bold font-display ${TIER_TEXT[tier.id]}`}>{count}</div>
              <div className="text-xs text-slate-500 mt-0.5">{tier.label}</div>
            </div>
          );
        })}
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold font-display text-slate-300">{WIKELO_BLUEPRINTS.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-space-400/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Contenu onglet Blueprints */}
      {activeTab === 'blueprints' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Nom, description, matériau..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input w-full pl-9"
              />
            </div>
            <select
              value={selCategory}
              onChange={e => setSelCategory(e.target.value)}
              className="input text-sm"
            >
              <option value="">Toutes catégories</option>
              {CRAFT_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <select
              value={selTier}
              onChange={e => setSelTier(e.target.value)}
              className="input text-sm"
            >
              <option value="">Tous les tiers</option>
              {WIKELO_TIERS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            {filtered.length} plan{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="card p-8 text-center">
                <Hammer className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Aucun plan ne correspond à la recherche.</p>
              </div>
            ) : (
              filtered.map(bp => <BlueprintCard key={bp.id} bp={bp} />)
            )}
          </div>
        </div>
      )}

      {activeTab === 'materials' && <MaterialsTab />}
      {activeTab === 'locations' && <LocationsTab />}
    </div>
  );
}
