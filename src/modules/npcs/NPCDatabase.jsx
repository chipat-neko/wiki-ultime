import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  Users, Search, Filter, X, LayoutGrid, List,
  MapPin, Shield, Skull, HelpCircle, Star,
  ChevronDown, ChevronUp, Briefcase, Globe,
} from 'lucide-react';
import {
  NPCS, NPC_IMPORTANCE, NPC_STATUS, NPC_SPECIES,
  getNPCFactions, getNPCSystems,
} from '../../datasets/npcs.js';
import { FACTIONS } from '../../datasets/factions.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FACTION_BY_ID = FACTIONS.reduce((acc, f) => {
  acc[f.id] = f;
  return acc;
}, {});

function getFactionLabel(factionId) {
  if (factionId === 'citizen') return 'Indépendant';
  if (factionId === 'unknown') return 'Inconnu';
  return FACTION_BY_ID[factionId]?.shortName || FACTION_BY_ID[factionId]?.name || factionId;
}

function getFactionColor(factionId) {
  if (factionId === 'citizen') return 'text-slate-400';
  if (factionId === 'unknown') return 'text-slate-500';
  const f = FACTION_BY_ID[factionId];
  if (!f) return 'text-slate-400';
  const align = f.alignment;
  if (align === 'Légal')    return 'text-cyan-400';
  if (align === 'Criminel') return 'text-red-400';
  if (align === 'Neutre')   return 'text-yellow-400';
  return 'text-slate-300';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImportanceBadge({ importance }) {
  const cfg = NPC_IMPORTANCE[importance] || NPC_IMPORTANCE.Mineur;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium border', cfg.bg, cfg.color, cfg.border)}>
      <Star className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = NPC_STATUS[status] || NPC_STATUS.Inconnu;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full font-medium', cfg.bg, cfg.color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function SpeciesBadge({ species }) {
  const cfg = NPC_SPECIES[species] || { label: species, color: 'text-slate-400' };
  return (
    <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-space-700 border border-space-400/20', cfg.color)}>
      {cfg.label}
    </span>
  );
}

// ─── NPC Card (grille) ────────────────────────────────────────────────────────

function NPCCard({ npc, onSelect }) {
  const factionLabel = getFactionLabel(npc.faction);
  const factionColor = getFactionColor(npc.faction);

  return (
    <button
      onClick={() => onSelect(npc)}
      className="card p-4 border border-space-400/20 hover:border-space-300/40 text-left transition-all hover:shadow-lg group w-full"
    >
      {/* Avatar + nom */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-space-700 border border-space-400/20 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">
            {npc.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{npc.role}</p>
        </div>
        <ImportanceBadge importance={npc.importance} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <StatusBadge status={npc.status} />
        <SpeciesBadge species={npc.species} />
        <span className={clsx('inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-space-700 border border-space-400/20', factionColor)}>
          {factionLabel}
        </span>
      </div>

      {/* Localisation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
        <MapPin className="w-3 h-3 text-cyan-500 flex-shrink-0" />
        <span className="truncate">{npc.location}</span>
        <span className={clsx(
          'ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs font-medium',
          npc.system === 'Pyro' ? 'text-orange-400 bg-orange-900/30' : 'text-cyan-400 bg-cyan-900/30'
        )}>
          {npc.system}
        </span>
      </div>

      {/* Description courte */}
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {npc.description}
      </p>

      {/* Services */}
      {npc.services.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-space-400/10">
          {npc.services.slice(0, 2).map(s => (
            <span key={s} className="inline-block px-1.5 py-0.5 text-xs bg-space-700/60 text-slate-400 rounded border border-space-400/10">
              {s}
            </span>
          ))}
          {npc.services.length > 2 && (
            <span className="text-xs text-slate-600 self-center">+{npc.services.length - 2}</span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── NPC Row (tableau) ────────────────────────────────────────────────────────

function NPCRow({ npc, onSelect }) {
  const factionLabel = getFactionLabel(npc.faction);
  const factionColor = getFactionColor(npc.faction);
  return (
    <tr
      className="border-b border-space-400/10 hover:bg-space-700/30 cursor-pointer transition-colors"
      onClick={() => onSelect(npc)}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-space-700 border border-space-400/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{npc.name}</p>
            <p className="text-xs text-slate-500">{npc.role}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className={clsx('text-xs font-medium', factionColor)}>{factionLabel}</span>
      </td>
      <td className="px-3 py-2.5">
        <SpeciesBadge species={npc.species} />
      </td>
      <td className="px-3 py-2.5">
        <StatusBadge status={npc.status} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="w-3 h-3 text-cyan-500 flex-shrink-0" />
          <span className="truncate max-w-[150px]">{npc.location}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className={clsx(
          'text-xs px-1.5 py-0.5 rounded-full font-medium',
          npc.system === 'Pyro' ? 'text-orange-400 bg-orange-900/30' : 'text-cyan-400 bg-cyan-900/30'
        )}>
          {npc.system}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <ImportanceBadge importance={npc.importance} />
      </td>
    </tr>
  );
}

// ─── Panneau détail NPC ────────────────────────────────────────────────────────

function NPCDetail({ npc, onClose }) {
  if (!npc) return null;
  const factionLabel = getFactionLabel(npc.faction);
  const factionColor = getFactionColor(npc.faction);
  const factionData = FACTION_BY_ID[npc.faction];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-space-900 border-l border-space-400/20 h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-space-900 border-b border-space-400/20 p-4 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-space-700 border border-space-400/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 leading-tight">{npc.name}</h2>
              <p className="text-xs text-slate-500">{npc.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-space-700 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Badges principaux */}
          <div className="flex flex-wrap gap-2">
            <ImportanceBadge importance={npc.importance} />
            <StatusBadge status={npc.status} />
            <SpeciesBadge species={npc.species} />
            <span className={clsx('inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-space-700 border border-space-400/20', factionColor)}>
              {factionLabel}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed">{npc.description}</p>

          {/* Localisation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Localisation</h3>
            <div className="bg-space-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-sm text-slate-200">{npc.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className={clsx(
                  'text-sm font-medium',
                  npc.system === 'Pyro' ? 'text-orange-400' : 'text-cyan-400'
                )}>
                  Système {npc.system}
                </span>
              </div>
            </div>
          </div>

          {/* Faction */}
          {factionData && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faction</h3>
              <div className="bg-space-800 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={clsx('text-sm font-semibold', factionColor)}>{factionData.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{factionData.type} · {factionData.alignment}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services */}
          {npc.services.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Services</h3>
              <div className="flex flex-wrap gap-2">
                {npc.services.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-900/20 text-cyan-300 border border-cyan-700/30">
                    <Briefcase className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {npc.notes && (
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-space-700/40 rounded-xl p-3 border border-space-400/20">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              {npc.notes}
            </div>
          )}

          {/* Ère */}
          {npc.era && (
            <div className="text-xs text-slate-600 text-right">
              Époque : {npc.era}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function NPCDatabase() {
  const [search, setSearch]               = useState('');
  const [factionFilter, setFactionFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [systemFilter, setSystemFilter]   = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [viewMode, setViewMode]           = useState('grid');
  const [selectedNPC, setSelectedNPC]     = useState(null);
  const [showFilters, setShowFilters]     = useState(false);

  // Valeurs disponibles pour les filtres
  const allFactions = useMemo(() => {
    const ids = [...new Set(NPCS.map(n => n.faction))].sort();
    return ids.map(id => ({ id, label: getFactionLabel(id) }));
  }, []);

  const allSystems = useMemo(() => [...new Set(NPCS.map(n => n.system))].sort(), []);
  const allSpecies = useMemo(() => [...new Set(NPCS.map(n => n.species))].sort(), []);

  // Filtrage
  const filtered = useMemo(() => {
    let list = [...NPCS];
    if (factionFilter !== 'all')    list = list.filter(n => n.faction === factionFilter);
    if (speciesFilter !== 'all')    list = list.filter(n => n.species === speciesFilter);
    if (statusFilter !== 'all')     list = list.filter(n => n.status === statusFilter);
    if (systemFilter !== 'all')     list = list.filter(n => n.system === systemFilter);
    if (importanceFilter !== 'all') list = list.filter(n => n.importance === importanceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.role.toLowerCase().includes(q) ||
        n.location.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        getFactionLabel(n.faction).toLowerCase().includes(q)
      );
    }
    // Tri : Majeur > Historique > Mineur, puis alphabétique
    list.sort((a, b) => {
      const order = { Majeur: 0, Historique: 1, Mineur: 2 };
      const diff = (order[a.importance] ?? 3) - (order[b.importance] ?? 3);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, 'fr');
    });
    return list;
  }, [search, factionFilter, speciesFilter, statusFilter, systemFilter, importanceFilter]);

  const activeFiltersCount = [
    factionFilter !== 'all',
    speciesFilter !== 'all',
    statusFilter !== 'all',
    systemFilter !== 'all',
    importanceFilter !== 'all',
    search.trim() !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFactionFilter('all');
    setSpeciesFilter('all');
    setStatusFilter('all');
    setSystemFilter('all');
    setImportanceFilter('all');
    setSearch('');
  };

  // Stats
  const stats = useMemo(() => ({
    total: NPCS.length,
    vivants: NPCS.filter(n => n.status === 'Vivant').length,
    majeurs: NPCS.filter(n => n.importance === 'Majeur').length,
    historiques: NPCS.filter(n => n.importance === 'Historique').length,
  }), []);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="page-title text-gradient-cyan">Base de données NPC</h1>
          <p className="page-subtitle">Personnages notables de l'univers Star Citizen — Alpha 4.6</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">{stats.total} PNJ</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">{stats.majeurs} Majeurs</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-700/50 border border-space-400/20">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">{stats.vivants} Vivants</span>
          </div>
        </div>
      </div>

      {/* ── Barre de recherche et contrôles ─────────────────────────────── */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un PNJ par nom, rôle, faction, lieu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input w-full pl-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              showFilters || activeFiltersCount > 0
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-space-700 border-space-400/20 text-slate-400 hover:border-space-300/30'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {/* Toggle vue */}
          <div className="flex rounded-lg overflow-hidden border border-space-400/20">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-slate-500 hover:text-slate-300')}
              title="Vue grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx('p-2 transition-colors', viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-slate-500 hover:text-slate-300')}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtres dépliables */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-space-400/10">
            {/* Faction */}
            <select
              value={factionFilter}
              onChange={e => setFactionFilter(e.target.value)}
              className="input text-sm min-w-[160px]"
            >
              <option value="all">Toutes factions</option>
              {allFactions.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            {/* Espèce */}
            <select
              value={speciesFilter}
              onChange={e => setSpeciesFilter(e.target.value)}
              className="input text-sm min-w-[140px]"
            >
              <option value="all">Toutes espèces</option>
              {allSpecies.map(s => (
                <option key={s} value={s}>{NPC_SPECIES[s]?.label || s}</option>
              ))}
            </select>
            {/* Statut */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input text-sm min-w-[130px]"
            >
              <option value="all">Tous statuts</option>
              <option value="Vivant">Vivant</option>
              <option value="Décédé">Décédé</option>
              <option value="Inconnu">Inconnu</option>
            </select>
            {/* Système */}
            <select
              value={systemFilter}
              onChange={e => setSystemFilter(e.target.value)}
              className="input text-sm min-w-[140px]"
            >
              <option value="all">Tous systèmes</option>
              {allSystems.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {/* Importance */}
            <select
              value={importanceFilter}
              onChange={e => setImportanceFilter(e.target.value)}
              className="input text-sm min-w-[150px]"
            >
              <option value="all">Toutes importances</option>
              <option value="Majeur">Majeur</option>
              <option value="Mineur">Mineur</option>
              <option value="Historique">Historique</option>
            </select>
            {/* Reset */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Effacer tout
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Résultats ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">
            {filtered.length} PNJ{filtered.length > 1 ? 's' : ''}
            {activeFiltersCount > 0 && (
              <span className="text-slate-600 ml-1">(sur {NPCS.length})</span>
            )}
          </span>
          {/* Légende importance */}
          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(NPC_IMPORTANCE).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1">
                <Star className={clsx('w-3 h-3', cfg.color)} />
                <span className={clsx('text-xs font-medium', cfg.color)}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Aucun PNJ trouvé</p>
            <p className="text-slate-600 text-sm mt-1">Modifiez vos filtres ou votre recherche</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(npc => (
              <NPCCard key={npc.id} npc={npc} onSelect={setSelectedNPC} />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-space-400/20 bg-space-800/50">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PNJ</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Faction</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Espèce</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Localisation</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Système</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(npc => (
                    <NPCRow key={npc.id} npc={npc} onSelect={setSelectedNPC} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Panneau détail ───────────────────────────────────────────────── */}
      {selectedNPC && (
        <NPCDetail npc={selectedNPC} onClose={() => setSelectedNPC(null)} />
      )}
    </div>
  );
}
