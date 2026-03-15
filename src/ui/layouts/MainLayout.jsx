import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import NotificationStack from '../components/NotificationStack.jsx';
import { useAppActions } from '../../core/StateManager.jsx';
import { SearchEngine, SEARCH_INDICES, INDEX_CONFIGS } from '../../core/SearchEngine.js';
import { SHIPS, SHIPS_BY_ID } from '../../datasets/ships.js';
import { COMMODITIES } from '../../datasets/commodities.js';
import { STATIONS } from '../../datasets/stations.js';
import { STAR_SYSTEMS_DATA } from '../../datasets/systems.js';
import { FACTIONS } from '../../datasets/factions.js';
import { GUIDES, GUIDES_BY_ID } from '../../datasets/guides.js';
import { MISSION_TYPES_DATA } from '../../datasets/missions.js';
import { WIKELO_BLUEPRINTS } from '../../datasets/wikelo.js';

export default function MainLayout({ children }) {
  const location = useLocation();
  const { addToHistory } = useAppActions();

  // Initialize search indices on mount
  useEffect(() => {
    SearchEngine.createIndex(SEARCH_INDICES.SHIPS, SHIPS, INDEX_CONFIGS.ships);
    SearchEngine.createIndex(SEARCH_INDICES.COMMODITIES, COMMODITIES, INDEX_CONFIGS.commodities);
    SearchEngine.createIndex(SEARCH_INDICES.STATIONS, STATIONS, INDEX_CONFIGS.stations);
    SearchEngine.createIndex(SEARCH_INDICES.SYSTEMS, STAR_SYSTEMS_DATA, INDEX_CONFIGS.systems);
    SearchEngine.createIndex(SEARCH_INDICES.FACTIONS, FACTIONS, INDEX_CONFIGS.factions);
    SearchEngine.createIndex(SEARCH_INDICES.GUIDES, GUIDES, {
      keys: [{ name: 'title', weight: 2 }, { name: 'category', weight: 1 }, { name: 'description', weight: 0.5 }],
      threshold: 0.3,
    });
    SearchEngine.createIndex('wikelo', WIKELO_BLUEPRINTS, {
      keys: [{ name: 'name', weight: 2 }, { name: 'description', weight: 1 }, { name: 'category', weight: 0.5 }],
      threshold: 0.3,
    });
  }, []);

  // Track navigation history
  useEffect(() => {
    const routeLabels = {
      '/tableau-de-bord': 'Tableau de Bord',
      '/vaisseaux': 'Base de Vaisseaux',
      '/vaisseaux/comparer': 'Comparateur de Vaisseaux',
      '/flotte': 'Gestionnaire de Flotte',
      '/flotte/analyse': 'Analyse de Flotte',
      '/commerce': 'Planificateur Commercial',
      '/commerce/cargo': 'Optimiseur Cargo',
      '/commerce/calculateur': 'Calculateur Commercial',
      '/routes': 'Optimiseur de Routes',
      '/missions':             'Planificateur de Missions',
      '/missions/empilement':  "IA d'Empilement",
      '/missions/tracker':     'Suivi de Missions',
      '/missions/calculateur': 'Calculateur de Missions',
      '/systemes': 'Systèmes Stellaires',
      '/systemes/planetes': 'Planètes & Lunes',
      '/systemes/stations': 'Stations & Villes',
      '/factions': 'Factions',
      '/guides': 'Guides de Jeu',
      '/favoris': 'Favoris',
      '/historique': 'Historique',
      '/reputation': 'Suivi de Réputation',
      '/equipement': 'Équipement FPS',
      '/vehicules': 'Véhicules Terrestres',
      '/composants': 'Composants Vaisseaux',
      '/fabricants': 'Fabricants',
      '/minage': 'Guide de Minage',
      '/locations': 'Locations & POI',
      '/evenements': 'Événements In-Game',
      '/artisanat': 'Artisanat (Wikelo)',
      '/engineering': 'Engineering',
      '/salvage': 'Récupération (Salvage)',
      '/armes-vaisseaux': 'Armes de Vaisseaux',
      '/outils': 'Outils de Jeu',
      '/parametres': 'Paramètres',
    };

    // Resolve dynamic route labels (e.g. /vaisseaux/cutlass-black → "Cutlass Black")
    let label = routeLabels[location.pathname];
    if (!label) {
      const path = location.pathname;
      const shipMatch = path.match(/^\/vaisseaux\/(.+)$/);
      const guideMatch = path.match(/^\/guides\/(.+)$/);
      const factionMatch = path.match(/^\/factions\/(.+)$/);
      const missionMatch = path.match(/^\/missions\/(.+)$/);
      if (shipMatch) {
        const ship = SHIPS_BY_ID[shipMatch[1]];
        label = ship ? `Vaisseau — ${ship.name}` : path;
      } else if (guideMatch) {
        const guide = GUIDES_BY_ID[guideMatch[1]];
        label = guide ? `Guide — ${guide.title}` : path;
      } else if (factionMatch) {
        const faction = FACTIONS.find(f => f.id === factionMatch[1]);
        label = faction ? `Faction — ${faction.name}` : path;
      } else if (missionMatch && !['empilement', 'tracker', 'calculateur'].includes(missionMatch[1])) {
        const mission = MISSION_TYPES_DATA.find(m => m.id === missionMatch[1]);
        label = mission ? `Mission — ${mission.name}` : path;
      } else {
        label = path;
      }
    }
    addToHistory({ path: location.pathname, label });
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-space-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-container">
          <div className="max-w-screen-2xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationStack />
    </div>
  );
}
