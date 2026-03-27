import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/tableau-de-bord': 'Tableau de Bord',
  '/vaisseaux': 'Base de Données Vaisseaux — 150+ Ships Star Citizen',
  '/vaisseaux/comparer': 'Comparateur de Vaisseaux',
  '/flotte': 'Gestionnaire de Flotte',
  '/flotte/analyse': 'Analyse de Flotte',
  '/commerce': 'Planificateur Commerce — Routes & Prix Live',
  '/commerce/cargo': 'Optimiseur Cargo',
  '/commerce/calculateur': 'Calculateur Commerce',
  '/routes': 'Optimiseur de Routes',
  '/missions': 'Planificateur de Missions',
  '/missions/base': 'Base de Données Missions',
  '/missions/empilement': 'Empilement de Missions',
  '/missions/tracker': 'Suivi de Missions',
  '/missions/calculateur': 'Calculateur de Missions',
  '/systemes': 'Systèmes Stellaires — Stanton & Pyro',
  '/systemes/planetes': 'Planètes & Lunes',
  '/systemes/stations': 'Carte des Stations',
  '/fabricants': 'Fabricants de Vaisseaux',
  '/factions': 'Factions & Organisations',
  '/guides': 'Guides Gameplay Star Citizen',
  '/favoris': 'Mes Favoris',
  '/historique': 'Historique',
  '/reputation': 'Suivi de Réputation',
  '/equipement': 'Équipement FPS — Armes & Armures',
  '/armes-vaisseaux': 'Armes de Vaisseaux — S1 à S9',
  '/evenements': 'Événements Star Citizen',
  '/outils': 'Outils Gameplay',
  '/vehicules': 'Véhicules Terrestres',
  '/composants': 'Composants Vaisseaux',
  '/locations': 'Points d\'Intérêt',
  '/minage': 'Guide Mining — Lasers, Minéraux, Vaisseaux',
  '/salvage': 'Guide Salvage',
  '/artisanat': 'Artisanat — Wikelo NPC',
  '/crafting': 'Crafting — 1044 Blueprints',
  '/engineering': 'Engineering — Dawn of Engineering',
  '/loadout': 'Loadout Builder Vaisseau',
  '/items': 'Chercheur d\'Objets',
  '/crimestat': 'CrimeStat — Système Criminel',
  '/medical': 'Mécaniques Médicales',
  '/bounty': 'Bounty Hunting — Chasse aux Primes',
  '/qt-drives': 'Quantum Drives — Comparateur',
  '/npcs': 'Base de Données PNJ',
  '/raffinerie': 'Calculateur Raffinerie',
  '/profits': 'Comparateur de Profits',
  '/commodites': 'Suivi des Commodités',
  '/assurance': 'Calculateur Assurance',
  '/fps-loadout': 'FPS Loadout Builder',
  '/spawn': 'Guide des Spawns',
  '/armures/comparer': 'Comparateur d\'Armures',
  '/dps-calc': 'Calculateur DPS',
  '/personnage': 'Suivi de Personnage',
  '/systemes-vaisseau': 'Systèmes Vaisseau — Power & Shields',
  '/piraterie': 'Guide Piraterie',
  '/lore': 'Galactapédie — Lore Star Citizen',
  '/parametres': 'Paramètres',
  '/blog': 'Blog Communautaire',
  '/builds': 'Builds Communautaires — Loadouts Partagés',
};

const BASE_TITLE = 'SC Companion';

export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = PAGE_TITLES[pathname];
    document.title = pageTitle
      ? `${pageTitle} | ${BASE_TITLE}`
      : BASE_TITLE;
  }, [pathname]);
}
