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
const MissionBrowser    = React.lazy(() => import('./modules/missions/MissionBrowser.jsx'));
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
const ResetPassword = React.lazy(() => import('./modules/auth/ResetPassword.jsx'));
const VerifyEmail = React.lazy(() => import('./modules/auth/VerifyEmail.jsx'));
const Wikelo = React.lazy(() => import('./modules/wikelo/Wikelo.jsx'));
const Crafting = React.lazy(() => import('./modules/crafting/Crafting.jsx'));
const EngineeringModule = React.lazy(() => import('./modules/engineering/Engineering.jsx'));
const LoadoutBuilder = React.lazy(() => import('./modules/loadout/LoadoutBuilder.jsx'));
const ItemFinder = React.lazy(() => import('./modules/items/ItemFinder.jsx'));
const CrimeStat = React.lazy(() => import('./modules/mechanics/CrimeStat.jsx'));
const MedicalMechanics = React.lazy(() => import('./modules/mechanics/MedicalMechanics.jsx'));
const BountyHunting = React.lazy(() => import('./modules/mechanics/BountyHunting.jsx'));
const QTDrives = React.lazy(() => import('./modules/components/QTDrives.jsx'));
const NPCDatabase = React.lazy(() => import('./modules/npcs/NPCDatabase.jsx'));
const RefineryCalculator = React.lazy(() => import('./modules/mining/RefineryCalculator.jsx'));
const ProfitComparator = React.lazy(() => import('./modules/trade/ProfitComparator.jsx'));
const CommodityTracker = React.lazy(() => import('./modules/trade/CommodityTracker.jsx'));
const InsuranceCalculator = React.lazy(() => import('./modules/ships/InsuranceCalculator.jsx'));
const FPSLoadoutBuilder = React.lazy(() => import('./modules/equipment/FPSLoadoutBuilder.jsx'));
const SpawnGuide = React.lazy(() => import('./modules/systems/SpawnGuide.jsx'));
const ArmorComparator = React.lazy(() => import('./modules/equipment/ArmorComparator.jsx'));
const DPSCalculator = React.lazy(() => import('./modules/ships/DPSCalculator.jsx'));
const CharacterTracker = React.lazy(() => import('./modules/community/CharacterTracker.jsx'));
const CommunityGallery = React.lazy(() => import('./modules/community/CommunityGallery.jsx'));
const ShipSystems = React.lazy(() => import('./modules/ships/ShipSystems.jsx'));
const PiracyGuide = React.lazy(() => import('./modules/mechanics/PiracyGuide.jsx'));
const MasterModes = React.lazy(() => import('./modules/mechanics/MasterModes.jsx'));
const PrisonGuide = React.lazy(() => import('./modules/mechanics/PrisonGuide.jsx'));
const Signatures = React.lazy(() => import('./modules/mechanics/Signatures.jsx'));
const MissileGuide = React.lazy(() => import('./modules/mechanics/MissileGuide.jsx'));
const BunkerGuide = React.lazy(() => import('./modules/mechanics/BunkerGuide.jsx'));
const InventoryGuide = React.lazy(() => import('./modules/mechanics/InventoryGuide.jsx'));
const AtmosphericFlight = React.lazy(() => import('./modules/mechanics/AtmosphericFlight.jsx'));
const SmugglingGuide = React.lazy(() => import('./modules/mechanics/SmugglingGuide.jsx'));
const DerelictGuide = React.lazy(() => import('./modules/mechanics/DerelictGuide.jsx'));
const TurretGuide = React.lazy(() => import('./modules/mechanics/TurretGuide.jsx'));
const CaveMining = React.lazy(() => import('./modules/mechanics/CaveMining.jsx'));
const BoardingGuide = React.lazy(() => import('./modules/mechanics/BoardingGuide.jsx'));
const GroupGuide = React.lazy(() => import('./modules/mechanics/GroupGuide.jsx'));
const PowerManagement = React.lazy(() => import('./modules/mechanics/PowerManagement.jsx'));
const HealingGuide = React.lazy(() => import('./modules/mechanics/HealingGuide.jsx'));
const StaminaGuide = React.lazy(() => import('./modules/mechanics/StaminaGuide.jsx'));
const DegradationGuide = React.lazy(() => import('./modules/mechanics/DegradationGuide.jsx'));
const SessionPlanner = React.lazy(() => import('./modules/tools/SessionPlanner.jsx'));
const FuelCalculator = React.lazy(() => import('./modules/tools/FuelCalculator.jsx'));
const Galactapedia = React.lazy(() => import('./modules/lore/Galactapedia.jsx'));
const Patchnotes = React.lazy(() => import('./modules/patchnotes/Patchnotes.jsx'));
const InteractiveMap = React.lazy(() => import('./modules/map/InteractiveMap.jsx'));
const CCUCalculator = React.lazy(() => import('./modules/tools/CCUCalculator.jsx'));
const PriceHistory = React.lazy(() => import('./modules/trade/PriceHistory.jsx'));
const MissionFlowcharts = React.lazy(() => import('./modules/missions/MissionFlowcharts.jsx'));
const MultiStopPlanner = React.lazy(() => import('./modules/route/MultiStopPlanner.jsx'));
const MiningRoutePlanner = React.lazy(() => import('./modules/mining/MiningRoutePlanner.jsx'));
const POIDiscovery = React.lazy(() => import('./modules/exploration/POIDiscovery.jsx'));
const EconomyEvents = React.lazy(() => import('./modules/trade/EconomyEvents.jsx'));
const Tutorial = React.lazy(() => import('./modules/tutorial/Tutorial.jsx'));
const Leaderboard = React.lazy(() => import('./modules/community/Leaderboard.jsx'));
const ShipSizeComparison = React.lazy(() => import('./modules/ships/ShipSizeComparison.jsx'));
const ShipShowcase = React.lazy(() => import('./modules/ships/ShipShowcase.jsx'));
const HardpointVisualizer = React.lazy(() => import('./modules/ships/HardpointVisualizer.jsx'));
const DPSGraphs = React.lazy(() => import('./modules/ships/DPSGraphs.jsx'));
const BaseBuildingPlanner = React.lazy(() => import('./modules/tools/BaseBuildingPlanner.jsx'));
const OverlayMode = React.lazy(() => import('./modules/tools/OverlayMode.jsx'));
const BlogList = React.lazy(() => import('./modules/blog/BlogList.jsx'));
const BlogPostView = React.lazy(() => import('./modules/blog/BlogPost.jsx'));
const SharedBuildsGallery = React.lazy(() => import('./modules/builds/SharedBuildsGallery.jsx'));

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
            <Route path="/missions/base"        element={<MissionBrowser />} />
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
            <Route path="/galerie" element={<CommunityGallery />} />

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

            {/* Artisanat */}
            <Route path="/artisanat" element={<Wikelo />} />
            <Route path="/crafting" element={<Crafting />} />

            {/* Engineering */}
            <Route path="/engineering" element={<EngineeringModule />} />

            {/* Loadout Builder */}
            <Route path="/loadout" element={<LoadoutBuilder />} />

            {/* Objets */}
            <Route path="/items" element={<ItemFinder />} />

            {/* Mécaniques */}
            <Route path="/crimestat" element={<CrimeStat />} />
            <Route path="/medical" element={<MedicalMechanics />} />
            <Route path="/bounty" element={<BountyHunting />} />

            {/* QT Drives */}
            <Route path="/qt-drives" element={<QTDrives />} />

            {/* NPC Database */}
            <Route path="/npcs" element={<NPCDatabase />} />

            {/* Raffinerie */}
            <Route path="/raffinerie" element={<RefineryCalculator />} />

            {/* Profits */}
            <Route path="/profits" element={<ProfitComparator />} />

            {/* Commodités */}
            <Route path="/commodites" element={<CommodityTracker />} />

            {/* Assurance */}
            <Route path="/assurance" element={<InsuranceCalculator />} />

            {/* FPS Loadout */}
            <Route path="/fps-loadout" element={<FPSLoadoutBuilder />} />

            {/* Spawn & Hôpitaux */}
            <Route path="/spawn" element={<SpawnGuide />} />

            {/* Comparateur Armures */}
            <Route path="/armures/comparer" element={<ArmorComparator />} />

            {/* Calculateur DPS */}
            <Route path="/dps-calc" element={<DPSCalculator />} />

            {/* Tracker Personnage */}
            <Route path="/personnage" element={<CharacterTracker />} />

            {/* Systèmes Vaisseau */}
            <Route path="/systemes-vaisseau" element={<ShipSystems />} />

            {/* Piraterie */}
            <Route path="/piraterie" element={<PiracyGuide />} />

            {/* Nouvelles mécaniques */}
            <Route path="/master-modes" element={<MasterModes />} />
            <Route path="/prison" element={<PrisonGuide />} />
            <Route path="/signatures" element={<Signatures />} />
            <Route path="/missiles" element={<MissileGuide />} />
            <Route path="/bunkers" element={<BunkerGuide />} />
            <Route path="/inventaire" element={<InventoryGuide />} />
            <Route path="/vol-atmospherique" element={<AtmosphericFlight />} />
            <Route path="/contrebande" element={<SmugglingGuide />} />
            <Route path="/epaves" element={<DerelictGuide />} />
            <Route path="/tourelles" element={<TurretGuide />} />
            <Route path="/grottes" element={<CaveMining />} />
            <Route path="/abordage" element={<BoardingGuide />} />
            <Route path="/groupe" element={<GroupGuide />} />
            <Route path="/power-management" element={<PowerManagement />} />
            <Route path="/medical-avance" element={<HealingGuide />} />
            <Route path="/stamina" element={<StaminaGuide />} />
            <Route path="/degradation" element={<DegradationGuide />} />

            {/* Outils avancés */}
            <Route path="/checklist" element={<SessionPlanner />} />
            <Route path="/carburant" element={<FuelCalculator />} />

            {/* Galactapédie */}
            <Route path="/lore" element={<Galactapedia />} />

            {/* Carte Interactive */}
            <Route path="/carte" element={<InteractiveMap />} />

            {/* Nouveaux modules Tier 6 */}
            <Route path="/ccu" element={<CCUCalculator />} />
            <Route path="/prix-historique" element={<PriceHistory />} />
            <Route path="/missions/flowcharts" element={<MissionFlowcharts />} />
            <Route path="/routes/multi-stop" element={<MultiStopPlanner />} />
            <Route path="/minage/routes" element={<MiningRoutePlanner />} />
            <Route path="/exploration" element={<POIDiscovery />} />
            <Route path="/economie" element={<EconomyEvents />} />

            {/* Tutoriel & Classement */}
            <Route path="/tutoriel" element={<Tutorial />} />
            <Route path="/classement" element={<Leaderboard />} />

            {/* Tier 8 — Modules avancés */}
            <Route path="/vaisseaux/tailles" element={<ShipSizeComparison />} />
            <Route path="/vaisseaux/showcase" element={<ShipShowcase />} />
            <Route path="/vaisseaux/hardpoints" element={<HardpointVisualizer />} />
            <Route path="/dps-graphs" element={<DPSGraphs />} />
            <Route path="/base-building" element={<BaseBuildingPlanner />} />
            <Route path="/overlay" element={<OverlayMode />} />

            {/* Patchnotes */}
            <Route path="/patchnotes" element={<Patchnotes />} />

            {/* Blog Communautaire */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogPostView />} />

            {/* Builds Communautaires */}
            <Route path="/builds" element={<SharedBuildsGallery />} />

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

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
