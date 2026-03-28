import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';
import {
  Search, Filter, Globe, MapPin, Building, Navigation,
  Mountain, Satellite, Crosshair, Gem, X, ChevronDown,
  Layers, Eye, EyeOff, Info, ZoomIn, ZoomOut,
} from 'lucide-react';

// ─── Coordonnées relatives CRS.Simple (y, x) ──────────────────────────────
// Layout libre — positions approximatives pour rendu 2D lisible

const STANTON_POIS = [
  // ═══ Étoile ═══
  { id: 'stanton-star', name: 'Stanton (Étoile)', type: 'star', coords: [50, 50], info: 'Étoile principale du système Stanton — Type G, naine jaune' },

  // ═══ Planètes ═══
  { id: 'arccorp', name: 'ArcCorp', type: 'planet', coords: [30, 25], info: 'Planète urbanisée — Siège de la corporation ArcCorp' },
  { id: 'hurston', name: 'Hurston', type: 'planet', coords: [72, 22], info: 'Planète désertique — Siège de Hurston Dynamics' },
  { id: 'crusader', name: 'Crusader', type: 'planet', coords: [35, 70], info: 'Géante gazeuse — Siège de Crusader Industries' },
  { id: 'microtech', name: 'microTech', type: 'planet', coords: [75, 78], info: 'Planète glaciaire — Siège de microTech' },

  // ═══ Villes ═══
  { id: 'area18', name: 'Area18', type: 'city', coords: [28, 23], info: 'Mégalopole sur ArcCorp — Zone commerciale principale, boutiques, hangars' },
  { id: 'lorville', name: 'Lorville', type: 'city', coords: [74, 20], info: 'Capitale de Hurston — CBD, zone industrielle, Teasa Spaceport' },
  { id: 'orison', name: 'Orison', type: 'city', coords: [37, 72], info: 'Cité flottante de Crusader — Plateformes dans les nuages' },
  { id: 'new-babbage', name: 'New Babbage', type: 'city', coords: [77, 80], info: 'Cité high-tech de microTech — Quartier The Commons, métro' },

  // ═══ Lunes de Crusader ═══
  { id: 'cellin', name: 'Cellin', type: 'moon', coords: [30, 65], info: 'Lune volcanique de Crusader — Activité sismique, missions bunker' },
  { id: 'daymar', name: 'Daymar', type: 'moon', coords: [40, 75], info: 'Lune désertique de Crusader — Jumptown, cavernes' },
  { id: 'yela', name: 'Yela', type: 'moon', coords: [32, 78], info: 'Lune glacée de Crusader — Anneau d\'astéroïdes, GrimHEX' },

  // ═══ Lunes de Hurston ═══
  { id: 'arial', name: 'Arial', type: 'moon', coords: [68, 18], info: 'Lune aride de Hurston — Mines et bunkers' },
  { id: 'aberdeen', name: 'Aberdeen', type: 'moon', coords: [76, 16], info: 'Lune toxique de Hurston — Prison Klescher' },
  { id: 'magda', name: 'Magda', type: 'moon', coords: [70, 27], info: 'Lune rocheuse de Hurston — Paysages rougeâtres' },
  { id: 'ita', name: 'Ita', type: 'moon', coords: [78, 25], info: 'Lune de Hurston — Terrain accidenté' },

  // ═══ Lunes d'ArcCorp ═══
  { id: 'lyria', name: 'Lyria', type: 'moon', coords: [26, 30], info: 'Lune glacée d\'ArcCorp — Mining Taranite/Bexalite' },
  { id: 'wala', name: 'Wala', type: 'moon', coords: [34, 22], info: 'Lune aride d\'ArcCorp — Avant-postes miniers' },

  // ═══ Lunes de microTech ═══
  { id: 'calliope', name: 'Calliope', type: 'moon', coords: [72, 83], info: 'Lune glaciale de microTech — Tempêtes de neige' },
  { id: 'clio', name: 'Clio', type: 'moon', coords: [80, 75], info: 'Lune de microTech — Terrain mixte, bunkers cachés' },
  { id: 'euterpe', name: 'Euterpe', type: 'moon', coords: [78, 84], info: 'Plus petite lune de microTech — Ruines Tevarin' },

  // ═══ Stations orbitales ═══
  { id: 'port-olisar', name: 'Port Olisar', type: 'station', coords: [38, 67], info: 'Station orbitale historique de Crusader (legacy) — Ancienne zone de spawn' },
  { id: 'everus-harbor', name: 'Everus Harbor', type: 'station', coords: [69, 24], info: 'Station orbitale de Hurston — Clinique, magasins, hangars' },
  { id: 'baijini-point', name: 'Baijini Point', type: 'station', coords: [27, 27], info: 'Station orbitale d\'ArcCorp — Platforme cargo et commerce' },
  { id: 'seraphim', name: 'Seraphim Station', type: 'station', coords: [33, 68], info: 'Station orbitale de Crusader — Point de ravitaillement' },
  { id: 'port-tressler', name: 'Port Tressler', type: 'station', coords: [73, 76], info: 'Station orbitale de microTech — Commerce haute technologie' },

  // ═══ Points de Lagrange / Stations Rest Stop ═══
  { id: 'cru-l1', name: 'CRU-L1', type: 'station', coords: [42, 62], info: 'Station Lagrange L1 de Crusader — Rest stop, ravitaillement' },
  { id: 'cru-l4', name: 'CRU-L4', type: 'station', coords: [44, 74], info: 'Station Lagrange L4 de Crusader' },
  { id: 'cru-l5', name: 'CRU-L5', type: 'station', coords: [30, 62], info: 'Station Lagrange L5 de Crusader' },
  { id: 'hur-l1', name: 'HUR-L1', type: 'station', coords: [65, 26], info: 'Station Lagrange L1 de Hurston — Rest stop' },
  { id: 'hur-l2', name: 'HUR-L2', type: 'station', coords: [74, 14], info: 'Station Lagrange L2 de Hurston' },
  { id: 'hur-l3', name: 'HUR-L3', type: 'station', coords: [80, 30], info: 'Station Lagrange L3 de Hurston' },
  { id: 'hur-l4', name: 'HUR-L4', type: 'station', coords: [66, 18], info: 'Station Lagrange L4 de Hurston' },
  { id: 'hur-l5', name: 'HUR-L5', type: 'station', coords: [78, 18], info: 'Station Lagrange L5 de Hurston' },
  { id: 'arc-l1', name: 'ARC-L1', type: 'station', coords: [25, 22], info: 'Station Lagrange L1 d\'ArcCorp — Rest stop' },
  { id: 'mic-l1', name: 'MIC-L1', type: 'station', coords: [70, 80], info: 'Station Lagrange L1 de microTech — Rest stop' },
  { id: 'mic-l2', name: 'MIC-L2', type: 'station', coords: [82, 78], info: 'Station Lagrange L2 de microTech' },

  // ═══ Stations spéciales ═══
  { id: 'grimhex', name: 'GrimHEX', type: 'station', coords: [29, 80], info: 'Station pirate dans les astéroïdes de Yela — Marché noir, armes, contrebande' },
  { id: 'delamar', name: 'Delamar / Levski', type: 'station', coords: [22, 40], info: 'Ancien astéroïde indépendant — Base Levski (héritage)' },

  // ═══ Terminaux de commerce ═══
  { id: 'trade-area18', name: 'TDD Area18', type: 'trade', coords: [26, 24], info: 'Terminal de commerce — ArcCorp, Area18 — Large sélection de commodités' },
  { id: 'trade-lorville', name: 'CBD Lorville', type: 'trade', coords: [72, 21], info: 'Terminal de commerce — Hurston, Lorville — Commerce industriel' },
  { id: 'trade-orison', name: 'TDD Orison', type: 'trade', coords: [39, 73], info: 'Terminal de commerce — Orison — Commerce de composants' },
  { id: 'trade-newbabbage', name: 'TDD New Babbage', type: 'trade', coords: [79, 81], info: 'Terminal de commerce — microTech — Haute technologie' },
  { id: 'trade-grimhex', name: 'GrimHEX Market', type: 'trade', coords: [28, 82], info: 'Marché noir — Contrebande, drogues, armes illégales' },

  // ═══ Spots de minage ═══
  { id: 'mine-yela-belt', name: 'Ceinture d\'astéroïdes de Yela', type: 'mining', coords: [35, 82], info: 'Zone de minage riche — Quantainium, Laranite — Danger pirate' },
  { id: 'mine-aaron-halo', name: 'Aaron Halo Belt', type: 'mining', coords: [50, 42], info: 'Ceinture d\'astéroïdes principale — Quantainium abondant, longue distance' },
  { id: 'mine-daymar-surface', name: 'Mines de Daymar', type: 'mining', coords: [42, 77], info: 'Minage au sol — Hadanite (~2400 aUEC/u), ROC recommandé' },
  { id: 'mine-aberdeen-borase', name: 'Gisements Aberdeen', type: 'mining', coords: [77, 14], info: 'Minage de Borase et Ophéum — Atmosphère toxique' },
  { id: 'mine-lyria-bexalite', name: 'Veines Bexalite Lyria', type: 'mining', coords: [24, 32], info: 'Minage de Bexalite (~955 aUEC/u) — Spots rares et précieux' },

  // ═══ Jump Point ═══
  { id: 'jp-stanton-pyro', name: 'Jump Point Stanton → Pyro', type: 'jumppoint', coords: [15, 55], info: 'Point de saut vers le système Pyro — Zone dangereuse, sans loi' },
];

const PYRO_POIS = [
  // ═══ Étoile ═══
  { id: 'pyro-star', name: 'Pyro (Étoile)', type: 'star', coords: [50, 50], info: 'Étoile instable du système Pyro — Naine rouge, éruptions fréquentes' },

  // ═══ Planètes ═══
  { id: 'pyro-i', name: 'Pyro I', type: 'planet', coords: [45, 38], info: 'Planète rocheuse proche de l\'étoile — Températures extrêmes, inhabitable' },
  { id: 'pyro-ii', name: 'Pyro II', type: 'planet', coords: [35, 30], info: 'Planète volcanique — Éruptions constantes, ressources rares' },
  { id: 'pyro-iii', name: 'Pyro III', type: 'planet', coords: [55, 25], info: 'Planète désertique — Avant-postes abandonnés, activité pirate' },
  { id: 'pyro-iv', name: 'Pyro IV', type: 'planet', coords: [65, 55], info: 'Planète gazeuse — Anneaux exploitables, minage spatial' },
  { id: 'pyro-v', name: 'Pyro V', type: 'planet', coords: [30, 70], info: 'Planète lointaine — Peu explorée, mystères' },
  { id: 'pyro-vi', name: 'Pyro VI', type: 'planet', coords: [70, 75], info: 'Planète gelée — Aux confins du système, ressources inconnues' },

  // ═══ Lunes ═══
  { id: 'pyro-ii-a', name: 'Pyro II-a', type: 'moon', coords: [32, 28], info: 'Lune de Pyro II — Surface volcanique, cavernes' },
  { id: 'pyro-iii-a', name: 'Pyro III-a', type: 'moon', coords: [58, 22], info: 'Lune de Pyro III — Terrain accidenté' },
  { id: 'pyro-iii-b', name: 'Pyro III-b', type: 'moon', coords: [53, 20], info: 'Lune de Pyro III — Petite lune désolée' },
  { id: 'pyro-iv-a', name: 'Pyro IV-a', type: 'moon', coords: [68, 58], info: 'Lune de Pyro IV — Station de ravitaillement possible' },

  // ═══ Stations ═══
  { id: 'ruin-station', name: 'Ruin Station', type: 'station', coords: [50, 45], info: 'Station centrale de Pyro — QG pirate, marché noir principal, pas de loi' },
  { id: 'checkmate', name: 'Checkmate Station', type: 'station', coords: [42, 60], info: 'Station indépendante — Commerce de contrebande, réparations' },
  { id: 'igloo', name: 'Igloo Station', type: 'station', coords: [72, 70], info: 'Station glaciale proche de Pyro VI — Avant-poste éloigné' },
  { id: 'pyro-gateway', name: 'Pyro Gateway', type: 'station', coords: [22, 50], info: 'Point d\'entrée du système — Première escale depuis Stanton' },

  // ═══ Spots de minage ═══
  { id: 'pyro-asteroid-field', name: 'Champ d\'astéroïdes Pyro', type: 'mining', coords: [60, 42], info: 'Astéroïdes riches — Ressources rares, raids pirates fréquents' },
  { id: 'pyro-iv-rings', name: 'Anneaux de Pyro IV', type: 'mining', coords: [62, 52], info: 'Minage dans les anneaux — Quantainium et minerais exotiques' },

  // ═══ Terminaux de commerce ═══
  { id: 'trade-ruin', name: 'Marché de Ruin Station', type: 'trade', coords: [48, 44], info: 'Marché noir principal de Pyro — Tout s\'achète, tout se vend' },

  // ═══ Jump Point ═══
  { id: 'jp-pyro-stanton', name: 'Jump Point Pyro → Stanton', type: 'jumppoint', coords: [20, 48], info: 'Point de saut retour vers Stanton — Seule sortie connue du système' },
  { id: 'jp-pyro-nyx', name: 'Jump Point Pyro → Nyx', type: 'jumppoint', coords: [80, 82], info: 'Point de saut vers Nyx — Système prévu, non accessible actuellement' },
];

// ─── Catégories & couleurs ──────────────────────────────────────────────────

const POI_TYPES = {
  star:      { label: 'Étoiles',           color: '#fbbf24', icon: Globe,      radius: 12 },
  planet:    { label: 'Planètes',          color: '#3b82f6', icon: Globe,      radius: 10 },
  moon:      { label: 'Lunes',             color: '#22c55e', icon: Mountain,   radius: 7 },
  station:   { label: 'Stations',          color: '#06b6d4', icon: Satellite,  radius: 6 },
  city:      { label: 'Villes',            color: '#f59e0b', icon: Building,   radius: 7 },
  jumppoint: { label: 'Jump Points',       color: '#ef4444', icon: Navigation, radius: 8 },
  trade:     { label: 'Terminaux commerce', color: '#a78bfa', icon: MapPin,    radius: 5 },
  mining:    { label: 'Spots de minage',   color: '#f97316', icon: Gem,        radius: 5 },
};

const FILTER_CATEGORIES = ['planet', 'moon', 'station', 'city', 'jumppoint', 'trade', 'mining'];

// ─── Composant de recentrage de la carte ────────────────────────────────────

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.5 });
  }, [center, zoom, map]);
  return null;
}

// ─── Composant de fond sombre ───────────────────────────────────────────────

function DarkBackground() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.background = '#0a0e1a';
    // Désactiver l'attribution Leaflet
    map.attributionControl.setPrefix('');
  }, [map]);
  return null;
}

// ─── Composant principal ────────────────────────────────────────────────────

export default function InteractiveMap() {
  const [activeSystem, setActiveSystem] = useState('stanton');
  const [filters, setFilters] = useState(() => {
    const init = {};
    FILTER_CATEGORIES.forEach(cat => { init[cat] = true; });
    return init;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [selectedPoi, setSelectedPoi] = useState(null);

  const pois = activeSystem === 'stanton' ? STANTON_POIS : PYRO_POIS;

  // Filtrage par catégorie + recherche
  const filteredPois = useMemo(() => {
    let result = pois.filter(poi => {
      if (poi.type === 'star') return true; // toujours visible
      return filters[poi.type] !== false;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(poi =>
        poi.name.toLowerCase().includes(q) ||
        poi.info.toLowerCase().includes(q)
      );
    }
    return result;
  }, [pois, filters, searchQuery]);

  // Résultats de recherche pour le dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return pois.filter(poi =>
      poi.name.toLowerCase().includes(q) ||
      poi.info.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [pois, searchQuery]);

  const toggleFilter = (cat) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const enableAll = () => {
    const all = {};
    FILTER_CATEGORIES.forEach(cat => { all[cat] = true; });
    setFilters(all);
  };

  const disableAll = () => {
    const none = {};
    FILTER_CATEGORIES.forEach(cat => { none[cat] = false; });
    setFilters(none);
  };

  // CRS Simple bounds
  const bounds = [[0, 0], [100, 100]];
  const center = [50, 50];

  return (
    <div className="space-y-4">
      {/* ─── En-tête ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-7 h-7 text-cyan-400" />
            Carte Interactive
          </h1>
          <p className="text-sm text-space-400 mt-1">
            Exploration 2D des systèmes Stanton et Pyro — Alpha 4.6
          </p>
        </div>

        {/* Onglets système */}
        <div className="flex bg-space-800/60 rounded-lg p-1 border border-space-700/50">
          <button
            onClick={() => { setActiveSystem('stanton'); setSearchQuery(''); setSelectedPoi(null); }}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeSystem === 'stanton'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-space-400 hover:text-white hover:bg-space-700/50'
            )}
          >
            Stanton
          </button>
          <button
            onClick={() => { setActiveSystem('pyro'); setSearchQuery(''); setSelectedPoi(null); }}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeSystem === 'pyro'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-space-400 hover:text-white hover:bg-space-700/50'
            )}
          >
            Pyro
          </button>
        </div>
      </div>

      {/* ─── Barre d'outils ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
          <input
            type="text"
            placeholder="Rechercher un lieu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-space-800/60 border border-space-700/50 rounded-lg
                       text-sm text-white placeholder-space-500 focus:outline-none focus:border-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedPoi(null); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-space-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Dropdown résultats */}
          {searchResults.length > 0 && searchQuery.trim() && (
            <div className="absolute z-[1000] top-full mt-1 left-0 right-0 bg-space-800 border border-space-700
                            rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map(poi => {
                const meta = POI_TYPES[poi.type];
                return (
                  <button
                    key={poi.id}
                    onClick={() => {
                      setSelectedPoi(poi);
                      setSearchQuery(poi.name);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-space-700/60 text-left transition-colors"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta?.color || '#888' }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-white truncate">{poi.name}</div>
                      <div className="text-xs text-space-500 truncate">{meta?.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
            showFilters
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
              : 'bg-space-800/60 border-space-700/50 text-space-400 hover:text-white'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtres
          <ChevronDown className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
        </button>

        {/* Toggle légende */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
            showLegend
              ? 'bg-space-700/60 border-space-600/50 text-white'
              : 'bg-space-800/60 border-space-700/50 text-space-400 hover:text-white'
          )}
        >
          <Layers className="w-4 h-4" />
          Légende
        </button>

        {/* Compteur */}
        <div className="text-sm text-space-500">
          {filteredPois.length} / {pois.length} lieux
        </div>
      </div>

      {/* ─── Panneau de filtres ─── */}
      {showFilters && (
        <div className="bg-space-800/60 border border-space-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Catégories visibles</span>
            <div className="flex gap-2">
              <button onClick={enableAll} className="text-xs text-cyan-400 hover:text-cyan-300">
                Tout afficher
              </button>
              <span className="text-space-600">|</span>
              <button onClick={disableAll} className="text-xs text-red-400 hover:text-red-300">
                Tout masquer
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_CATEGORIES.map(cat => {
              const meta = POI_TYPES[cat];
              const Icon = meta.icon;
              const active = filters[cat];
              return (
                <button
                  key={cat}
                  onClick={() => toggleFilter(cat)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    active
                      ? 'border-current/30 bg-current/10'
                      : 'border-space-700 bg-space-800/40 text-space-600'
                  )}
                  style={active ? { color: meta.color, borderColor: `${meta.color}40`, backgroundColor: `${meta.color}15` } : {}}
                >
                  {active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Carte ─── */}
      <div className="relative rounded-xl overflow-hidden border border-space-700/50 shadow-2xl">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          maxBounds={[[-10, -10], [110, 110]]}
          maxBoundsViscosity={0.8}
          zoom={2}
          minZoom={1}
          maxZoom={6}
          zoomControl={false}
          attributionControl={true}
          style={{ height: '70vh', width: '100%' }}
          className="leaflet-dark-map"
        >
          <DarkBackground />
          <MapController
            center={selectedPoi ? selectedPoi.coords : center}
            zoom={selectedPoi ? 4 : 2}
          />

          {/* Rendu des POIs */}
          {filteredPois.map(poi => {
            const meta = POI_TYPES[poi.type];
            if (!meta) return null;

            const isSelected = selectedPoi?.id === poi.id;

            return (
              <CircleMarker
                key={poi.id}
                center={poi.coords}
                radius={isSelected ? meta.radius + 4 : meta.radius}
                pathOptions={{
                  color: meta.color,
                  fillColor: meta.color,
                  fillOpacity: isSelected ? 0.9 : (poi.type === 'star' ? 0.8 : 0.6),
                  weight: isSelected ? 3 : 1.5,
                  opacity: isSelected ? 1 : 0.8,
                }}
                eventHandlers={{
                  click: () => setSelectedPoi(poi),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -meta.radius]}
                  className="leaflet-tooltip-dark"
                >
                  <span className="text-xs font-medium">{poi.name}</span>
                </Tooltip>
                <Popup className="leaflet-popup-dark">
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="font-bold text-sm">{poi.name}</span>
                    </div>
                    <div className="text-xs mb-1" style={{ color: meta.color }}>
                      {meta.label}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {poi.info}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* ─── Légende ─── */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 z-[500] bg-space-900/90 backdrop-blur-sm border border-space-700/60
                          rounded-lg p-3 shadow-xl">
            <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-cyan-400" />
              Légende
            </div>
            <div className="space-y-1.5">
              {Object.entries(POI_TYPES).map(([key, meta]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs text-space-300">{meta.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Info système ─── */}
        <div className="absolute top-4 right-4 z-[500] bg-space-900/90 backdrop-blur-sm border border-space-700/60
                        rounded-lg px-3 py-2 shadow-xl">
          <div className="text-xs text-space-400">Système actif</div>
          <div className={clsx(
            'text-sm font-bold',
            activeSystem === 'stanton' ? 'text-cyan-400' : 'text-red-400'
          )}>
            {activeSystem === 'stanton' ? 'Stanton' : 'Pyro'}
          </div>
          <div className="text-xs text-space-500 mt-0.5">
            {filteredPois.length} point{filteredPois.length > 1 ? 's' : ''} affichés
          </div>
        </div>
      </div>

      {/* ─── Détail du POI sélectionné ─── */}
      {selectedPoi && (
        <div className="bg-space-800/60 border border-space-700/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: POI_TYPES[selectedPoi.type]?.color }}
              />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPoi.name}</h3>
                <span className="text-xs font-medium" style={{ color: POI_TYPES[selectedPoi.type]?.color }}>
                  {POI_TYPES[selectedPoi.type]?.label}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPoi(null)}
              className="text-space-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-space-300 mt-3 leading-relaxed">
            {selectedPoi.info}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-space-500">
            <span>Système : <span className="text-white">{activeSystem === 'stanton' ? 'Stanton' : 'Pyro'}</span></span>
            <span>Coordonnées : <span className="text-white">[{selectedPoi.coords[0]}, {selectedPoi.coords[1]}]</span></span>
          </div>
        </div>
      )}

      {/* ─── Style Leaflet personnalisé ─── */}
      <style>{`
        .leaflet-dark-map {
          background: #0a0e1a !important;
        }
        .leaflet-dark-map .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.9) !important;
          color: #94a3b8 !important;
          border-color: rgba(51, 65, 85, 0.5) !important;
        }
        .leaflet-dark-map .leaflet-control-zoom a:hover {
          background: rgba(30, 41, 59, 0.95) !important;
          color: #e2e8f0 !important;
        }
        .leaflet-tooltip-dark {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
          color: #e2e8f0 !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
        }
        .leaflet-tooltip-dark::before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-popup-dark .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(51, 65, 85, 0.5) !important;
          color: #e2e8f0 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-dark .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-popup-dark .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        .leaflet-popup-dark .leaflet-popup-close-button:hover {
          color: #e2e8f0 !important;
        }
        .leaflet-container {
          background: #0a0e1a !important;
          font-family: inherit !important;
        }
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.7) !important;
          color: #475569 !important;
          font-size: 10px !important;
        }
      `}</style>
    </div>
  );
}
