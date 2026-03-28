import React, { useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import NotificationStack from '../components/NotificationStack.jsx';
import { useAppActions } from '../../core/StateManager.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { SearchEngine, SEARCH_INDICES, INDEX_CONFIGS } from '../../core/SearchEngine.js';
import { SHIPS, SHIPS_BY_ID } from '../../datasets/ships.js';
import { COMMODITIES } from '../../datasets/commodities.js';
import { STATIONS } from '../../datasets/stations.js';
import { STAR_SYSTEMS_DATA } from '../../datasets/systems.js';
import { FACTIONS } from '../../datasets/factions.js';
import { GUIDES, GUIDES_BY_ID } from '../../datasets/guides.js';
import { MISSION_TYPES_DATA } from '../../datasets/missions.js';
import { WIKELO_BLUEPRINTS } from '../../datasets/wikelo.js';

// ─── Labels de toutes les routes (utilisé pour le fil d'Ariane + historique) ──
const ROUTE_LABELS = {
  '/tableau-de-bord':       'Tableau de Bord',
  '/vaisseaux':             'Base de Vaisseaux',
  '/vaisseaux/comparer':    'Comparateur de Vaisseaux',
  '/flotte':                'Gestionnaire de Flotte',
  '/flotte/analyse':        'Analyse de Flotte',
  '/commerce':              'Commerce',
  '/commerce/cargo':        'Optimiseur Cargo',
  '/commerce/calculateur':  'Calculateur Commercial',
  '/routes':                'Optimiseur de Routes',
  '/missions':              'Missions',
  '/missions/empilement':   "IA d'Empilement",
  '/missions/tracker':      'Suivi de Missions',
  '/missions/calculateur':  'Calculateur de Missions',
  '/systemes':              'Systèmes Stellaires',
  '/systemes/planetes':     'Planètes & Lunes',
  '/systemes/stations':     'Stations & Villes',
  '/factions':              'Factions',
  '/guides':                'Guides de Jeu',
  '/favoris':               'Favoris',
  '/historique':            'Historique',
  '/reputation':            'Réputation',
  '/equipement':            'Équipement FPS',
  '/vehicules':             'Véhicules',
  '/composants':            'Composants',
  '/fabricants':            'Fabricants',
  '/minage':                'Minage',
  '/locations':             'Locations & POI',
  '/evenements':            'Événements',
  '/artisanat':             'Artisanat',
  '/crafting':              'Crafting',
  '/engineering':           'Engineering',
  '/salvage':               'Salvage',
  '/armes-vaisseaux':       'Armes de Vaisseaux',
  '/outils':                'Outils',
  '/parametres':            'Paramètres',
  '/blog':                  'Blog Communautaire',
  '/builds':                'Builds Communautaires',
  '/master-modes':          'Master Modes',
  '/prison':                'Prison & Klescher',
  '/signatures':            'Signatures & Scanning',
  '/missiles':              'Missiles & Contre-Mesures',
  '/bunkers':               'Bunkers & Missions',
  '/inventaire':            'Inventaire & Équipement',
  '/vol-atmospherique':     'Vol Atmosphérique',
  '/checklist':             'Planificateur de Session',
  '/contrebande':           'Contrebande & Marché Noir',
  '/epaves':                'Épaves & Vaisseaux Abandonnés',
  '/tourelles':             'Guide Tourelles',
  '/carburant':             'Calculateur Carburant',
  '/grottes':               'Grottes & Minage FPS',
  '/abordage':              'Abordage de Vaisseau',
  '/groupe':                'Gameplay en Groupe',
  '/power-management':      'Power Management',
};

export default function MainLayout({ children }) {
  const location = useLocation();
  const { addToHistory } = useAppActions();
  usePageTitle();

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

  // ─── Résolution du label de la page courante (dynamique pour vaisseaux, etc.) ─
  const resolveLabel = (path) => {
    if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
    const shipMatch   = path.match(/^\/vaisseaux\/(.+)$/);
    const guideMatch  = path.match(/^\/guides\/(.+)$/);
    const factionMatch = path.match(/^\/factions\/(.+)$/);
    const missionMatch = path.match(/^\/missions\/(.+)$/);
    if (shipMatch)   { const s = SHIPS_BY_ID[shipMatch[1]];   return s?.name ?? shipMatch[1]; }
    if (guideMatch)  { const g = GUIDES_BY_ID[guideMatch[1]]; return g?.title ?? guideMatch[1]; }
    if (factionMatch){ const f = FACTIONS.find(f => f.id === factionMatch[1]); return f?.name ?? factionMatch[1]; }
    if (missionMatch && !['empilement','tracker','calculateur'].includes(missionMatch[1])) {
      const m = MISSION_TYPES_DATA.find(m => m.id === missionMatch[1]);
      return m?.name ?? missionMatch[1];
    }
    return path;
  };

  // ─── Fil d'Ariane — segments calculés depuis le chemin courant ────────────
  const breadcrumbs = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/tableau-de-bord') return [];

    const segments = [];
    const parts = path.split('/').filter(Boolean); // ['vaisseaux', 'aurora-mr']

    let accumulated = '';
    for (let i = 0; i < parts.length; i++) {
      accumulated += '/' + parts[i];
      const isLast = i === parts.length - 1;
      const label = resolveLabel(accumulated);
      segments.push({ path: accumulated, label, isLast });
    }
    return segments;
  }, [location.pathname]);

  // ─── Historique navigation ────────────────────────────────────────────────
  useEffect(() => {
    const label = resolveLabel(location.pathname);
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
        <main className="flex-1 overflow-y-auto scroll-container">
          {/* ── Fil d'Ariane ──────────────────────────────────────────────────── */}
          {breadcrumbs.length > 0 && (
            <nav className="px-6 pt-4 pb-0" aria-label="Fil d'Ariane">
              <ol className="flex items-center gap-1 flex-wrap text-xs text-slate-600">
                <li>
                  <Link
                    to="/tableau-de-bord"
                    className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  >
                    <Home className="w-3 h-3" />
                    <span>Accueil</span>
                  </Link>
                </li>
                {breadcrumbs.map((crumb) => (
                  <li key={crumb.path} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />
                    {crumb.isLast ? (
                      <span className="text-slate-400 font-medium truncate max-w-[200px]">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="hover:text-cyan-400 transition-colors truncate max-w-[160px]"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="p-6 max-w-screen-2xl mx-auto animate-fade-in">
            {children}
          </div>

          {/* ── Footer ────────────────────────────────────────────────────────── */}
          <footer className="border-t border-space-700/40 mt-6">

            {/* Navigation rapide */}
            <div className="px-6 py-6 border-b border-space-700/30">
              <div className="max-w-screen-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vaisseaux</h3>
                  <ul className="space-y-1.5">
                    <li><Link to="/vaisseaux" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Base de données</Link></li>
                    <li><Link to="/vaisseaux/comparer" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Comparateur</Link></li>
                    <li><Link to="/flotte" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Ma Flotte</Link></li>
                    <li><Link to="/composants" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Composants</Link></li>
                    <li><Link to="/armes-vaisseaux" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Armement</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Commerce</h3>
                  <ul className="space-y-1.5">
                    <li><Link to="/commerce" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Vue d'ensemble</Link></li>
                    <li><Link to="/commerce/cargo" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Optimiseur Cargo</Link></li>
                    <li><Link to="/commerce/calculateur" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Calculateur</Link></li>
                    <li><Link to="/routes" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Routes Optimales</Link></li>
                    <li><Link to="/minage" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Minage</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Missions</h3>
                  <ul className="space-y-1.5">
                    <li><Link to="/missions" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Catalogue</Link></li>
                    <li><Link to="/missions/tracker" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Suivi</Link></li>
                    <li><Link to="/missions/empilement" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">IA d'Empilement</Link></li>
                    <li><Link to="/missions/calculateur" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Calculateur</Link></li>
                    <li><Link to="/reputation" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Réputation</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Exploration</h3>
                  <ul className="space-y-1.5">
                    <li><Link to="/systemes" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Systèmes Stellaires</Link></li>
                    <li><Link to="/systemes/planetes" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Planètes & Lunes</Link></li>
                    <li><Link to="/systemes/stations" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Stations</Link></li>
                    <li><Link to="/locations" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Lieux & POI</Link></li>
                    <li><Link to="/factions" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Factions</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">FPS & Véhicules</h3>
                  <ul className="space-y-1.5">
                    <li><Link to="/equipement" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Équipement FPS</Link></li>
                    <li><Link to="/vehicules" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Véhicules Sol</Link></li>
                    <li><Link to="/salvage" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Salvage</Link></li>
                    <li><Link to="/artisanat" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Artisanat</Link></li>
                    <li><Link to="/crafting" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Crafting</Link></li>
                    <li><Link to="/engineering" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Engineering</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ressources</h3>
                  <ul className="space-y-1.5">
                    <li><Link to="/guides" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Guides de Jeu</Link></li>
                    <li><Link to="/evenements" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Événements</Link></li>
                    <li><Link to="/outils" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Outils</Link></li>
                    <li><Link to="/fabricants" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Fabricants</Link></li>
                    <li><Link to="/parametres" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Paramètres</Link></li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Disclaimer légal RSI (obligatoire pour tout fan site) */}
            <div className="px-6 py-5">
            <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">

              {/* Logo Made by the Community */}
              <a
                href="https://robertsspaceindustries.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
                title="Roberts Space Industries — Site officiel"
              >
                <img
                  src="/images/fankit/made-by-community-white.png"
                  alt="Made by the Community"
                  className="h-8 w-auto"
                  style={{ opacity: 0.55 }}
                />
              </a>

              {/* Texte disclaimer */}
              <div className="space-y-1 min-w-0">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ceci est un site de fans Star Citizen non officiel, non affilié aux sociétés du groupe Cloud Imperium.
                  Tout le contenu présent sur ce site qui n'est pas l'œuvre de son propriétaire ou de ses utilisateurs est la propriété de leurs détenteurs respectifs.{' '}
                  <a
                    href="https://robertsspaceindustries.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-cyan-400 underline underline-offset-2 transition-colors"
                  >
                    robertsspaceindustries.com
                  </a>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  This is an unofficial Star Citizen fan site, not affiliated with the Cloud Imperium group of companies.
                  All content on this site not authored by its host or users are property of their respective owners.
                </p>
                <p className="text-xs text-slate-700">
                  Star Citizen®, Roberts Space Industries® and Cloud Imperium® are registered trademarks of Cloud Imperium Rights LLC.
                </p>
              </div>

              {/* Ko-fi support */}
              <a
                href="https://ko-fi.com/chipat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 ml-auto mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-[#FF5E5B]/10 border border-[#FF5E5B]/30 hover:bg-[#FF5E5B]/20 transition-all group"
              >
                <span className="text-xs font-medium text-[#FF5E5B] group-hover:text-white transition-colors">
                  ☕ Offrez-moi un café
                </span>
              </a>
            </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Notifications */}
      <NotificationStack />
    </div>
  );
}
