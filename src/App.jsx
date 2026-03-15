import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './core/StateManager.jsx';
import { ShipImagesProvider } from './core/ShipImagesContext.jsx';
import { AuthProvider } from './core/AuthContext.jsx';
import MainLayout from './ui/layouts/MainLayout.jsx';
import ErrorBoundary from './ui/components/ErrorBoundary.jsx';
import ProtectedRoute from './ui/components/ProtectedRoute.jsx';

// Lazy-loaded modules for performance
const Dashboard = React.lazy(() => import('./modules/dashboard/Dashboard.jsx'));
const ShipsDatabase = React.lazy(() => import('./modules/ships/ShipsDatabase.jsx'));
const ShipDetail = React.lazy(() => import('./modules/ships/ShipDetail.jsx'));
const ShipComparator = React.lazy(() => import('./modules/ships/ShipComparator.jsx'));
const FleetManager = React.lazy(() => import('./modules/fleet/FleetManager.jsx'));
const FleetAnalyzer = React.lazy(() => import('./modules/fleet/FleetAnalyzer.jsx'));
const TradePlanner = React.lazy(() => import('./modules/trade/TradePlanner.jsx'));
const CargoOptimizer = React.lazy(() => import('./modules/trade/CargoOptimizer.jsx'));
const TradeCalculator = React.lazy(() => import('./modules/trade/TradeCalculator.jsx'));
const RouteOptimizer = React.lazy(() => import('./modules/route/RouteOptimizer.jsx'));
const MissionPlanner    = React.lazy(() => import('./modules/missions/MissionPlanner.jsx'));
const MissionStacking   = React.lazy(() => import('./modules/missions/MissionStacking.jsx'));
const MissionDetail     = React.lazy(() => import('./modules/missions/MissionDetail.jsx'));
const MissionTracker    = React.lazy(() => import('./modules/missions/MissionTracker.jsx'));
const MissionCalculator = React.lazy(() => import('./modules/missions/MissionCalculator.jsx'));
const StarSystems = React.lazy(() => import('./modules/systems/StarSystems.jsx'));
const PlanetsMoons = React.lazy(() => import('./modules/systems/PlanetsMoons.jsx'));
const StationsMap = React.lazy(() => import('./modules/systems/StationsMap.jsx'));
const Manufacturers = React.lazy(() => import('./modules/manufacturers/Manufacturers.jsx'));
const Factions = React.lazy(() => import('./modules/factions/Factions.jsx'));
const FactionDetail = React.lazy(() => import('./modules/factions/FactionDetail.jsx'));
const GameplayGuides = React.lazy(() => import('./modules/guides/GameplayGuides.jsx'));
const GuideDetail = React.lazy(() => import('./modules/guides/GuideDetail.jsx'));
const Favorites = React.lazy(() => import('./modules/community/Favorites.jsx'));
const History = React.lazy(() => import('./modules/community/History.jsx'));
const ReputationTracker = React.lazy(() => import('./modules/community/ReputationTracker.jsx'));
const Settings = React.lazy(() => import('./modules/settings/Settings.jsx'));
const Tools = React.lazy(() => import('./modules/tools/Tools.jsx'));
const Equipment = React.lazy(() => import('./modules/equipment/Equipment.jsx'));
const Events = React.lazy(() => import('./modules/events/Events.jsx'));
const VehiclesDatabase = React.lazy(() => import('./modules/vehicles/VehiclesDatabase.jsx'));
const ShipComponents = React.lazy(() => import('./modules/components/ShipComponents.jsx'));
const Locations = React.lazy(() => import('./modules/locations/Locations.jsx'));
const Mining = React.lazy(() => import('./modules/mining/Mining.jsx'));
const Salvage = React.lazy(() => import('./modules/salvage/Salvage.jsx'));
const ShipWeapons = React.lazy(() => import('./modules/shipweapons/ShipWeapons.jsx'));
const NotFound = React.lazy(() => import('./ui/components/NotFound.jsx'));
const Login = React.lazy(() => import('./modules/auth/Login.jsx'));
const UserProfile = React.lazy(() => import('./modules/auth/UserProfile.jsx'));
const AdminPanel = React.lazy(() => import('./modules/auth/AdminPanel.jsx'));
const Contribute = React.lazy(() => import('./modules/auth/Contribute.jsx'));

import LoadingSpinner from './ui/components/LoadingSpinner.jsx';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
        <ShipImagesProvider>
        <MainLayout>
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<Navigate to="/tableau-de-bord" replace />} />
            <Route path="/tableau-de-bord" element={<Dashboard />} />

            {/* Vaisseaux */}
            <Route path="/vaisseaux" element={<ShipsDatabase />} />
            <Route path="/vaisseaux/comparer" element={<ShipComparator />} />
            <Route path="/vaisseaux/:id" element={<ShipDetail />} />

            {/* Flotte */}
            <Route path="/flotte" element={<FleetManager />} />
            <Route path="/flotte/analyse" element={<FleetAnalyzer />} />

            {/* Commerce */}
            <Route path="/commerce" element={<TradePlanner />} />
            <Route path="/commerce/cargo" element={<CargoOptimizer />} />
            <Route path="/commerce/calculateur" element={<TradeCalculator />} />

            {/* Routes */}
            <Route path="/routes" element={<RouteOptimizer />} />

            {/* Missions */}
            <Route path="/missions"             element={<MissionPlanner />} />
            <Route path="/missions/empilement"  element={<MissionStacking />} />
            <Route path="/missions/tracker"     element={<MissionTracker />} />
            <Route path="/missions/calculateur" element={<MissionCalculator />} />
            <Route path="/missions/:id"         element={<MissionDetail />} />

            {/* Systemes */}
            <Route path="/systemes" element={<StarSystems />} />
            <Route path="/systemes/planetes" element={<PlanetsMoons />} />
            <Route path="/systemes/stations" element={<StationsMap />} />

            {/* Fabricants */}
            <Route path="/fabricants" element={<Manufacturers />} />

            {/* Factions */}
            <Route path="/factions" element={<Factions />} />
            <Route path="/factions/:id" element={<FactionDetail />} />

            {/* Guides */}
            <Route path="/guides" element={<GameplayGuides />} />
            <Route path="/guides/:id" element={<GuideDetail />} />

            {/* Communaute */}
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/historique" element={<History />} />
            <Route path="/reputation" element={<ReputationTracker />} />

            {/* Équipement */}
            <Route path="/equipement" element={<Equipment />} />
            <Route path="/armes-vaisseaux" element={<ShipWeapons />} />

            {/* Événements */}
            <Route path="/evenements" element={<Events />} />

            {/* Outils */}
            <Route path="/outils" element={<Tools />} />

            {/* Véhicules */}
            <Route path="/vehicules" element={<VehiclesDatabase />} />

            {/* Composants */}
            <Route path="/composants" element={<ShipComponents />} />

            {/* Locations / POI */}
            <Route path="/locations" element={<Locations />} />

            {/* Minage */}
            <Route path="/minage" element={<Mining />} />

            {/* Salvage */}
            <Route path="/salvage" element={<Salvage />} />

            {/* Parametres */}
            <Route path="/parametres" element={<Settings />} />

            {/* Auth */}
            <Route path="/connexion" element={<Login />} />
            <Route path="/profil" element={<UserProfile />} />
            <Route path="/contribuer" element={
              <ProtectedRoute require="active"><Contribute /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute require="mod"><AdminPanel /></ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </MainLayout>
        </ShipImagesProvider>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
