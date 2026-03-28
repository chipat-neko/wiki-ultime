import React, { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import {
  Anchor, Mountain, Building2, Sparkles, Landmark, Shield,
  Search, X, Grid3X3, List, ChevronDown, ChevronUp,
  MapPin, AlertTriangle, Star, Trophy, Eye, EyeOff,
  CheckCircle, Target, Compass, Filter, BarChart3,
} from 'lucide-react';

// ─── Data Constants ─────────────────────────────────────────────────────────

const POI_TYPES = [
  { id: 'wreck',    label: 'Épave',    icon: 'Anchor',    color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  { id: 'cave',     label: 'Grotte',   icon: 'Mountain',  color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { id: 'outpost',  label: 'Avant-poste', icon: 'Building2', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  { id: 'anomaly',  label: 'Anomalie', icon: 'Sparkles',  color: 'text-purple-400',  bg: 'bg-purple-500/15' },
  { id: 'landmark', label: 'Repère',   icon: 'Landmark',  color: 'text-cyan-400',    bg: 'bg-cyan-500/15' },
  { id: 'base',     label: 'Base',     icon: 'Shield',    color: 'text-red-400',     bg: 'bg-red-500/15' },
];

const TYPE_MAP = Object.fromEntries(POI_TYPES.map(t => [t.id, t]));

const ICON_MAP = { Anchor, Mountain, Building2, Sparkles, Landmark, Shield };

const DIFFICULTIES = ['Facile', 'Moyen', 'Difficile'];
const DIFF_STYLES = {
  Facile:    'badge-green',
  Moyen:     'badge-yellow',
  Difficile: 'badge-red',
};

const LOOT_TIERS = ['Aucun', 'Basique', 'Intermédiaire', 'Avancé', 'Rare'];
const LOOT_COLORS = {
  Aucun:         'text-slate-500',
  Basique:       'text-slate-300',
  Intermédiaire: 'text-blue-400',
  Avancé:        'text-purple-400',
  Rare:          'text-amber-400',
};

const DANGER_LEVELS = ['Sûr', 'Faible', 'Modéré', 'Élevé', 'Extrême'];
const DANGER_COLORS = {
  Sûr:     'text-success-400',
  Faible:  'text-emerald-400',
  Modéré:  'text-warning-400',
  Élevé:   'text-orange-400',
  Extrême: 'text-danger-400',
};

const SYSTEMS = ['Stanton', 'Pyro'];

const POIS = [
  // ── Stanton — Daymar ──
  { id: 'javelin-wreck-daymar', name: 'Épave du Javelin', type: 'wreck', system: 'Stanton', body: 'Daymar', coords: 'OM-1: 324km, OM-3: 275km', difficulty: 'Facile', loot: 'Intermédiaire', danger: 'Faible', description: 'Imposante carcasse de destroyer Javelin écrasé dans le désert. Plusieurs étages explorables avec du loot militaire.', tips: 'Approchez par le nord pour éviter le terrain accidenté. Lampe torche indispensable à l\'intérieur.', related: ['caterpillar-wreck-daymar', 'drug-lab-daymar'] },
  { id: 'caterpillar-wreck-daymar', name: 'Épave du Caterpillar', type: 'wreck', system: 'Stanton', body: 'Daymar', coords: 'OM-1: 198km, OM-6: 340km', difficulty: 'Facile', loot: 'Basique', danger: 'Faible', description: 'Cargo Drake Caterpillar écrasé, partiellement enfoui dans le sable.', tips: 'Bon spot pour débutants, peu de danger.', related: ['javelin-wreck-daymar'] },
  { id: 'drug-lab-daymar', name: 'Labo de drogues de Daymar', type: 'base', system: 'Stanton', body: 'Daymar', coords: 'OM-2: 156km, OM-4: 289km', difficulty: 'Moyen', loot: 'Avancé', danger: 'Élevé', description: 'Installation clandestine de production de substances illicites. Gardes armés sur place.', tips: 'Venir équipé pour le combat. Les gardes respawn régulièrement.', related: ['javelin-wreck-daymar'] },
  { id: 'cave-daymar-01', name: 'Grotte de Daymar Nord', type: 'cave', system: 'Stanton', body: 'Daymar', coords: 'OM-1: 112km, OM-5: 305km', difficulty: 'Facile', loot: 'Basique', danger: 'Sûr', description: 'Grotte minière accessible avec quelques filons de hadanite.', tips: 'Apportez un outil de minage FPS pour extraire les minéraux.', related: ['cave-daymar-02'] },
  { id: 'cave-daymar-02', name: 'Grotte de Daymar Sud', type: 'cave', system: 'Stanton', body: 'Daymar', coords: 'OM-3: 98km, OM-6: 278km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Réseau de grottes plus profond avec des cristaux et du loot caché.', tips: 'Suivez les balises lumineuses pour ne pas vous perdre.', related: ['cave-daymar-01'] },
  // ── Stanton — Cellin ──
  { id: 'bunker-cellin-alpha', name: 'Bunker Cellin Alpha', type: 'base', system: 'Stanton', body: 'Cellin', coords: 'OM-1: 145km, OM-2: 267km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Modéré', description: 'Bunker souterrain avec opposition NPC modérée et coffres de loot.', tips: 'Amenez des grenades pour les couloirs étroits.', related: ['bunker-cellin-bravo'] },
  { id: 'bunker-cellin-bravo', name: 'Bunker Cellin Bravo', type: 'base', system: 'Stanton', body: 'Cellin', coords: 'OM-4: 189km, OM-6: 201km', difficulty: 'Difficile', loot: 'Avancé', danger: 'Élevé', description: 'Installation fortifiée avec de nombreux gardes. Loot de haute qualité.', tips: 'Équipe recommandée. Nettoyez étage par étage.', related: ['bunker-cellin-alpha'] },
  { id: 'wreck-starfarer-cellin', name: 'Épave du Starfarer', type: 'wreck', system: 'Stanton', body: 'Cellin', coords: 'OM-2: 203km, OM-5: 312km', difficulty: 'Facile', loot: 'Basique', danger: 'Sûr', description: 'Starfarer Gemini échoué sur la surface glacée de Cellin.', tips: 'Accessible facilement, bon pour la photo.', related: [] },
  // ── Stanton — Yela ──
  { id: 'benny-henge', name: 'Benny Henge', type: 'landmark', system: 'Stanton', body: 'Yela', coords: 'OM-1: 265km, OM-3: 133km', difficulty: 'Moyen', loot: 'Aucun', danger: 'Sûr', description: 'Monument mystérieux composé de canettes Benny\'s géantes disposées en cercle. Easter egg iconique.', tips: 'Coordonnées précises nécessaires. Utilisez un Pisces pour l\'approche.', related: ['yela-asteroid-belt'] },
  { id: 'yela-asteroid-belt', name: 'Ceinture d\'astéroïdes de Yela', type: 'anomaly', system: 'Stanton', body: 'Yela', coords: 'Orbite de Yela', difficulty: 'Facile', loot: 'Basique', danger: 'Faible', description: 'Dense ceinture d\'astéroïdes autour de Yela, idéale pour le minage.', tips: 'Attention aux collisions. Un Prospector est recommandé.', related: ['benny-henge'] },
  { id: 'cave-yela-01', name: 'Grotte de glace de Yela', type: 'cave', system: 'Stanton', body: 'Yela', coords: 'OM-2: 178km, OM-4: 245km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Magnifique grotte de glace avec formations cristallines et minéraux.', tips: 'Température basse, prévoyez une armure thermique.', related: [] },
  // ── Stanton — Hurston ──
  { id: 'reclaimer-wreck-hurston', name: 'Épave du Reclaimer', type: 'wreck', system: 'Stanton', body: 'Hurston', coords: 'OM-1: 445km, OM-4: 389km', difficulty: 'Moyen', loot: 'Avancé', danger: 'Modéré', description: 'Énorme Reclaimer crashé dans les plaines toxiques. Multiples niveaux à explorer.', tips: 'Attention à l\'atmosphère toxique de Hurston. Casque obligatoire.', related: ['hurston-cave-network'] },
  { id: 'hurston-cave-network', name: 'Réseau de grottes d\'Aberdeen', type: 'cave', system: 'Stanton', body: 'Aberdeen', coords: 'OM-3: 87km, OM-5: 201km', difficulty: 'Difficile', loot: 'Rare', danger: 'Modéré', description: 'Vaste réseau souterrain avec des poches de gaz et des minéraux rares.', tips: 'Risque de désorientation élevé. Marquez votre chemin.', related: ['reclaimer-wreck-hurston'] },
  { id: 'drug-lab-hurston', name: 'Labo abandonné d\'Arial', type: 'base', system: 'Stanton', body: 'Arial', coords: 'OM-2: 134km, OM-6: 267km', difficulty: 'Difficile', loot: 'Avancé', danger: 'Élevé', description: 'Ancien laboratoire sur Arial, maintenant occupé par des hors-la-loi.', tips: 'Approche furtive recommandée. Sniping possible depuis les collines.', related: [] },
  // ── Stanton — microTech ──
  { id: 'microtech-ice-caves', name: 'Grottes de glace de microTech', type: 'cave', system: 'Stanton', body: 'microTech', coords: 'OM-1: 567km, OM-2: 423km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Spectaculaires cavernes de glace sous la surface enneigée de microTech.', tips: 'Les reflets de glace sont magnifiques pour les screenshots.', related: ['microtech-outpost-ridge'] },
  { id: 'microtech-outpost-ridge', name: 'Avant-poste Ridge de microTech', type: 'outpost', system: 'Stanton', body: 'microTech', coords: 'OM-3: 389km, OM-5: 512km', difficulty: 'Facile', loot: 'Basique', danger: 'Sûr', description: 'Petit avant-poste scientifique perché sur une crête enneigée.', tips: 'Point de ravitaillement utile lors d\'expéditions longues.', related: ['microtech-ice-caves'] },
  { id: 'calhoun-pass', name: 'Col de Calhoun', type: 'landmark', system: 'Stanton', body: 'microTech', coords: 'OM-4: 234km, OM-6: 445km', difficulty: 'Facile', loot: 'Aucun', danger: 'Sûr', description: 'Passage montagneux offrant une vue panoramique spectaculaire sur les plaines gelées.', tips: 'Meilleur spot photo de microTech au lever du soleil.', related: [] },
  { id: 'wreck-freelancer-calliope', name: 'Épave Freelancer de Calliope', type: 'wreck', system: 'Stanton', body: 'Calliope', coords: 'OM-1: 67km, OM-3: 145km', difficulty: 'Facile', loot: 'Basique', danger: 'Sûr', description: 'Freelancer crashé dans les plaines de Calliope. Facile d\'accès.', tips: 'Bon POI d\'initiation pour les nouveaux explorateurs.', related: [] },
  { id: 'clio-thermal-vents', name: 'Évents thermiques de Clio', type: 'anomaly', system: 'Stanton', body: 'Clio', coords: 'OM-2: 134km, OM-4: 198km', difficulty: 'Moyen', loot: 'Aucun', danger: 'Modéré', description: 'Zone géothermique active avec des geysers et des évents de vapeur.', tips: 'Ne vous posez pas trop près, les geysers peuvent endommager votre vaisseau.', related: [] },
  // ── Stanton — Crusader area ──
  { id: 'orison-platform-secret', name: 'Plateforme cachée d\'Orison', type: 'landmark', system: 'Stanton', body: 'Crusader', coords: 'Sous Orison, Alt: -2500m', difficulty: 'Difficile', loot: 'Aucun', danger: 'Modéré', description: 'Plateforme abandonnée sous les nuages d\'Orison. Vue imprenable sur l\'atmosphère de Crusader.', tips: 'Descendez lentement sous Orison. Risque de crash si trop rapide.', related: [] },
  { id: 'kareah-security-post', name: 'Security Post Kareah', type: 'base', system: 'Stanton', body: 'Cellin (orbite)', coords: 'Orbite de Cellin', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Élevé', description: 'Station de sécurité en orbite. Zone PvP fréquente, terminal de hack crimestat.', tips: 'Zone PvP très active. Venez armé ou en groupe.', related: [] },
  { id: 'grim-hex', name: 'GrimHEX', type: 'base', system: 'Stanton', body: 'Yela (astéroïde)', coords: 'Astéroïde en orbite de Yela', difficulty: 'Facile', loot: 'Intermédiaire', danger: 'Modéré', description: 'Station pirate cachée dans un astéroïde. Hub des hors-la-loi de Stanton.', tips: 'Accessible sans crimestat mais ambiance hostile. Bon commerce de contrebande.', related: [] },
  // ── Stanton — ArcCorp ──
  { id: 'arccorp-skyline-view', name: 'Panorama ArcCorp', type: 'landmark', system: 'Stanton', body: 'ArcCorp', coords: 'Area18, Secteur nord', difficulty: 'Facile', loot: 'Aucun', danger: 'Sûr', description: 'Point de vue offrant une vue spectaculaire sur l\'horizon urbain infini d\'ArcCorp.', tips: 'Accessible depuis Area18. Idéal pour les screenshots au coucher de soleil.', related: [] },
  { id: 'wala-caves', name: 'Grottes de Wala', type: 'cave', system: 'Stanton', body: 'Wala', coords: 'OM-1: 45km, OM-3: 89km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Grottes minières de la lune Wala avec des dépôts de dolivine.', tips: 'Petite lune, les grottes sont faciles à trouver avec un scan.', related: [] },
  { id: 'lyria-drug-lab', name: 'Laboratoire de Lyria', type: 'base', system: 'Stanton', body: 'Lyria', coords: 'OM-2: 67km, OM-5: 123km', difficulty: 'Difficile', loot: 'Avancé', danger: 'Élevé', description: 'Installation de production de drogues sur Lyria. Fortement gardée.', tips: 'Forte résistance NPC. Bon loot mais risqué en solo.', related: [] },
  // ── Stanton — Divers ──
  { id: 'derelict-station-stanton', name: 'Station délabrée de Stanton', type: 'wreck', system: 'Stanton', body: 'Espace profond', coords: 'QT random encounter', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Modéré', description: 'Station abandonnée rencontrée aléatoirement lors de voyages en quantum.', tips: 'Gardez votre quantum drive prêt pour fuir si nécessaire.', related: [] },
  { id: 'comet-fragment-stanton', name: 'Fragment de comète', type: 'anomaly', system: 'Stanton', body: 'Espace profond', coords: 'Variable, scan longue portée', difficulty: 'Difficile', loot: 'Rare', danger: 'Modéré', description: 'Fragment de comète dérivant dans le système. Minéraux exotiques à bord.', tips: 'Utilisez le scan longue portée pour détecter les signatures inhabituelles.', related: [] },
  { id: 'delamar-cave-system', name: 'Grottes de Delamar', type: 'cave', system: 'Stanton', body: 'Delamar', coords: 'OM-1: 23km, OM-3: 56km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Réseau de grottes sous la surface de Delamar, riche en minéraux.', tips: 'Delamar est petit, les grottes sont proches de la surface.', related: [] },
  // ── Pyro ──
  { id: 'pyro-derelict-carrier', name: 'Porte-nef abandonné', type: 'wreck', system: 'Pyro', body: 'Pyro I', coords: 'OM-1: 890km, OM-2: 1023km', difficulty: 'Difficile', loot: 'Rare', danger: 'Extrême', description: 'Immense porte-nef militaire UEE abandonné dans le système Pyro. Loot exceptionnel mais extrêmement dangereux.', tips: 'Uniquement en groupe organisé. PvP constant dans la zone.', related: ['pyro-pirate-hideout', 'pyro-fuel-depot'] },
  { id: 'pyro-pirate-hideout', name: 'Repaire pirate de Pyro II', type: 'base', system: 'Pyro', body: 'Pyro II', coords: 'OM-3: 567km, OM-4: 712km', difficulty: 'Difficile', loot: 'Avancé', danger: 'Extrême', description: 'Base pirate fortifiée dans les roches de Pyro II. Territoire hostile.', tips: 'Zone no-man\'s-land. Pas de sécurité UEE à proximité.', related: ['pyro-derelict-carrier'] },
  { id: 'pyro-fuel-depot', name: 'Dépôt de carburant Pyro III', type: 'outpost', system: 'Pyro', body: 'Pyro III', coords: 'OM-1: 234km, OM-5: 456km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Élevé', description: 'Dépôt de ravitaillement isolé. Point de passage crucial dans Pyro.', tips: 'Ravitaillez-vous ici mais restez vigilant. Embuscades fréquentes.', related: ['pyro-derelict-carrier'] },
  { id: 'pyro-lava-caves', name: 'Grottes de lave de Pyro IV', type: 'cave', system: 'Pyro', body: 'Pyro IV', coords: 'OM-2: 123km, OM-6: 345km', difficulty: 'Difficile', loot: 'Rare', danger: 'Élevé', description: 'Grottes volcaniques avec des coulées de lave et des minéraux rares.', tips: 'Armure résistante à la chaleur obligatoire. Attention aux zones instables.', related: ['pyro-thermal-anomaly'] },
  { id: 'pyro-thermal-anomaly', name: 'Anomalie thermique de Pyro V', type: 'anomaly', system: 'Pyro', body: 'Pyro V', coords: 'OM-1: 678km, OM-3: 890km', difficulty: 'Difficile', loot: 'Aucun', danger: 'Extrême', description: 'Zone d\'activité thermique intense. Phénomène scientifique inexpliqué.', tips: 'Ne vous approchez pas trop. Dégâts thermiques même avec boucliers.', related: ['pyro-lava-caves'] },
  { id: 'pyro-outpost-ruin', name: 'Ruines de l\'avant-poste Pyro VI', type: 'outpost', system: 'Pyro', body: 'Pyro VI', coords: 'OM-4: 345km, OM-5: 567km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Modéré', description: 'Ancien avant-poste de recherche abandonné. Données scientifiques récupérables.', tips: 'Moins dangereux que les autres POI Pyro. Bon point d\'entrée.', related: [] },
  { id: 'pyro-asteroid-graveyard', name: 'Cimetière d\'astéroïdes', type: 'anomaly', system: 'Pyro', body: 'Espace profond', coords: 'Entre Pyro III et IV', difficulty: 'Moyen', loot: 'Basique', danger: 'Modéré', description: 'Dense champ d\'astéroïdes avec des débris de vaisseaux. Zone de minage dangereuse.', tips: 'Riche en quantanium mais navigation périlleuse.', related: [] },
  { id: 'pyro-smuggler-cache', name: 'Cache de contrebandiers', type: 'base', system: 'Pyro', body: 'Pyro III', coords: 'OM-3: 89km, OM-6: 201km', difficulty: 'Difficile', loot: 'Rare', danger: 'Élevé', description: 'Planque secrète de contrebandiers dans une crevasse. Marchandises illicites.', tips: 'Entrée camouflée. Cherchez les marques sur les rochers.', related: ['pyro-fuel-depot'] },
  // ── Stanton — More POIs ──
  { id: 'daymar-racetrack', name: 'Circuit de Daymar', type: 'landmark', system: 'Stanton', body: 'Daymar', coords: 'OM-3: 156km, OM-5: 234km', difficulty: 'Facile', loot: 'Aucun', danger: 'Sûr', description: 'Parcours naturel dans les canyons de Daymar. Idéal pour les courses de gravlev.', tips: 'Amenez un Nox ou un Dragonfly pour un maximum de fun.', related: [] },
  { id: 'cellin-frozen-lake', name: 'Lac gelé de Cellin', type: 'landmark', system: 'Stanton', body: 'Cellin', coords: 'OM-3: 178km, OM-5: 289km', difficulty: 'Facile', loot: 'Aucun', danger: 'Sûr', description: 'Vaste étendue de glace parfaitement plate. Paysage lunaire saisissant.', tips: 'Surface glissante mais idéale pour poser de gros vaisseaux.', related: [] },
  { id: 'hurston-toxic-valley', name: 'Vallée toxique de Hurston', type: 'anomaly', system: 'Stanton', body: 'Hurston', coords: 'OM-5: 356km, OM-6: 478km', difficulty: 'Moyen', loot: 'Aucun', danger: 'Modéré', description: 'Vallée profonde remplie de brume toxique jaune. Atmosphère irrespirable.', tips: 'Ne sortez jamais sans casque ici. Visibilité quasi nulle au fond.', related: [] },
  { id: 'aberdeen-sulfur-pits', name: 'Fosses de soufre d\'Aberdeen', type: 'anomaly', system: 'Stanton', body: 'Aberdeen', coords: 'OM-1: 98km, OM-4: 167km', difficulty: 'Moyen', loot: 'Basique', danger: 'Modéré', description: 'Formations géologiques de soufre avec des émanations toxiques.', tips: 'Photos spectaculaires mais dangereux. Restez en hauteur.', related: [] },
  { id: 'magda-mining-complex', name: 'Complexe minier de Magda', type: 'outpost', system: 'Stanton', body: 'Magda', coords: 'OM-2: 45km, OM-5: 78km', difficulty: 'Facile', loot: 'Basique', danger: 'Sûr', description: 'Installation minière automatisée sur la petite lune Magda.', tips: 'Bon point de minage FPS à proximité.', related: [] },
  { id: 'euterpe-research-lab', name: 'Labo de recherche d\'Euterpe', type: 'outpost', system: 'Stanton', body: 'Euterpe', coords: 'OM-1: 34km, OM-3: 67km', difficulty: 'Facile', loot: 'Basique', danger: 'Sûr', description: 'Station de recherche biologique sur la lune Euterpe de microTech.', tips: 'Atmosphère calme. Idéal pour explorer tranquillement.', related: [] },
  { id: 'ita-crash-site', name: 'Site de crash d\'Ita', type: 'wreck', system: 'Stanton', body: 'Ita', coords: 'OM-2: 56km, OM-4: 89km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Multiples épaves de petits vaisseaux sur la surface d\'Ita.', tips: 'Zone dispersée, explorez méthodiquement.', related: [] },
  { id: 'arial-comm-tower', name: 'Tour de comm d\'Arial', type: 'outpost', system: 'Stanton', body: 'Arial', coords: 'OM-1: 112km, OM-6: 198km', difficulty: 'Facile', loot: 'Aucun', danger: 'Sûr', description: 'Tour de communication avec vue dégagée sur les plaines d\'Arial.', tips: 'Peut être désactivée pour des missions de hack.', related: [] },
  { id: 'jump-point-stanton-pyro', name: 'Jump Point Stanton-Pyro', type: 'anomaly', system: 'Stanton', body: 'Espace profond', coords: 'Nav point depuis carte stellaire', difficulty: 'Facile', loot: 'Aucun', danger: 'Modéré', description: 'Point de saut reliant Stanton à Pyro. Traversée impressionnante.', tips: 'Assurez-vous d\'avoir assez de quantum fuel pour le retour depuis Pyro.', related: ['pyro-derelict-carrier'] },
  { id: 'reclaimer-wreck-daymar', name: 'Deuxième Reclaimer de Daymar', type: 'wreck', system: 'Stanton', body: 'Daymar', coords: 'OM-4: 289km, OM-6: 178km', difficulty: 'Moyen', loot: 'Intermédiaire', danger: 'Faible', description: 'Second site de crash d\'un Reclaimer sur Daymar, moins connu que celui de Hurston.', tips: 'Moins visité, donc plus de loot disponible en général.', related: ['javelin-wreck-daymar'] },
  { id: 'comm-array-relay', name: 'Relais CommArray 275', type: 'outpost', system: 'Stanton', body: 'Espace profond', coords: 'Orbite haute Crusader', difficulty: 'Facile', loot: 'Basique', danger: 'Modéré', description: 'Relais de communication pouvant être activé ou désactivé. Impact sur la surveillance.', tips: 'Désactiver le comm array rend la zone invisible aux forces de l\'ordre.', related: [] },
  { id: 'hidden-outpost-yela', name: 'Avant-poste caché de Yela', type: 'outpost', system: 'Stanton', body: 'Yela', coords: 'OM-5: 167km, OM-6: 234km', difficulty: 'Difficile', loot: 'Avancé', danger: 'Modéré', description: 'Petit avant-poste dissimulé dans les crevasses de Yela. Activités suspectes.', tips: 'Difficile à trouver sans coordonnées précises. Scan nécessaire.', related: ['benny-henge'] },
  { id: 'pyro-derelict-890', name: 'Épave du 890 Jump', type: 'wreck', system: 'Pyro', body: 'Pyro II', coords: 'OM-1: 456km, OM-4: 678km', difficulty: 'Difficile', loot: 'Rare', danger: 'Élevé', description: 'Luxueux 890 Jump échoué et pillé. Encore du loot dans les compartiments secrets.', tips: 'Cherchez les panneaux muraux amovibles pour le loot caché.', related: ['pyro-pirate-hideout'] },
  { id: 'pyro-beacon-signal', name: 'Signal balise inconnue', type: 'anomaly', system: 'Pyro', body: 'Espace profond', coords: 'Signal intermittent, scan requis', difficulty: 'Difficile', loot: 'Rare', danger: 'Élevé', description: 'Signal radio mystérieux détectable par scan. Source inconnue.', tips: 'Possiblement un piège pirate. Approchez avec extrême prudence.', related: [] },
];

const BODIES = [...new Set(POIS.map(p => p.body))].sort();

const STORAGE_KEY = 'sc-poi-visited';

function loadVisited() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveVisited(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

// ─── Badge Components ───────────────────────────────────────────────────────

function TypeBadge({ typeId }) {
  const t = TYPE_MAP[typeId];
  if (!t) return null;
  const Icon = ICON_MAP[t.icon];
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', t.bg, t.color)}>
      {Icon && <Icon className="w-3 h-3" />} {t.label}
    </span>
  );
}

// ─── POI Card ───────────────────────────────────────────────────────────────

function POICard({ poi, visited, onToggleVisit, gridMode }) {
  const [expanded, setExpanded] = useState(false);
  const t = TYPE_MAP[poi.type] || POI_TYPES[0];

  return (
    <div className={clsx(
      'card overflow-hidden transition-all',
      visited && 'border-success-500/25 bg-success-500/5',
      gridMode ? '' : 'flex flex-col',
    )}>
      <button
        className="w-full p-4 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', t.bg)}>
            {React.createElement(ICON_MAP[t.icon] || MapPin, { className: clsx('w-5 h-5', t.color) })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-slate-100 text-sm">{poi.name}</h3>
              {visited && <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-2">
              <TypeBadge typeId={poi.type} />
              <span className={clsx('badge', DIFF_STYLES[poi.difficulty])}>{poi.difficulty}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{poi.body}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{poi.description}</p>
          </div>
          <div className="flex-shrink-0 ml-2">
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-space-400/10 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">Système</div>
              <div className="text-sm font-medium text-slate-200">{poi.system}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Coordonnées</div>
              <div className="text-xs font-mono text-cyan-400">{poi.coords}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Loot</div>
              <div className={clsx('text-sm font-medium', LOOT_COLORS[poi.loot])}>{poi.loot}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Danger</div>
              <div className={clsx('text-sm font-medium', DANGER_COLORS[poi.danger])}>{poi.danger}</div>
            </div>
          </div>

          {poi.tips && (
            <div className="bg-space-700/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3" /> Conseils
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{poi.tips}</p>
            </div>
          )}

          {poi.related.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">POI liés</div>
              <div className="flex flex-wrap gap-1">
                {poi.related.map(rid => {
                  const rp = POIS.find(p => p.id === rid);
                  return rp ? (
                    <span key={rid} className="badge badge-slate text-xs">{rp.name}</span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisit(poi.id); }}
            className={clsx(
              'w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2',
              visited
                ? 'bg-success-500/15 text-success-400 hover:bg-success-500/25'
                : 'bg-space-600/50 text-slate-400 hover:bg-space-600/80 hover:text-slate-200',
            )}
          >
            {visited ? <><EyeOff className="w-3.5 h-3.5" /> Marquer non visité</> : <><Eye className="w-3.5 h-3.5" /> Marquer comme visité</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Stats Panel ────────────────────────────────────────────────────────────

function StatsPanel({ visited, total }) {
  const pct = total > 0 ? Math.round((visited.length / total) * 100) : 0;

  const byType = useMemo(() => POI_TYPES.map(t => {
    const all = POIS.filter(p => p.type === t.id).length;
    const done = POIS.filter(p => p.type === t.id && visited.includes(p.id)).length;
    return { ...t, all, done };
  }), [visited]);

  const badges = useMemo(() => {
    const b = [];
    if (visited.length >= 1)  b.push({ label: 'Premier pas', icon: Star, color: 'text-cyan-400' });
    if (visited.length >= 10) b.push({ label: 'Explorateur', icon: Compass, color: 'text-emerald-400' });
    if (visited.length >= 25) b.push({ label: 'Vétéran', icon: Target, color: 'text-purple-400' });
    if (visited.length >= 40) b.push({ label: 'Légende', icon: Trophy, color: 'text-amber-400' });
    if (pct === 100)          b.push({ label: 'Complétionniste', icon: Trophy, color: 'text-red-400' });
    return b;
  }, [visited.length, pct]);

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="font-bold text-slate-100">Progression de l'explorateur</h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-3xl font-black text-cyan-400">{pct}%</div>
        <div className="flex-1">
          <div className="text-xs text-slate-400 mb-1">{visited.length} / {total} POI visités</div>
          <div className="h-2 bg-space-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {byType.map(t => {
          const Icon = ICON_MAP[t.icon];
          return (
            <div key={t.id} className="text-center p-2 bg-space-700/30 rounded-lg">
              {Icon && <Icon className={clsx('w-4 h-4 mx-auto mb-1', t.color)} />}
              <div className="text-xs font-bold text-slate-200">{t.done}/{t.all}</div>
              <div className="text-[10px] text-slate-500">{t.label}</div>
            </div>
          );
        })}
      </div>

      {badges.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-2">Badges débloqués</div>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <span key={b.label} className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-space-700/50 border border-space-400/20', b.color)}>
                <b.icon className="w-3.5 h-3.5" /> {b.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function POIDiscovery() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterBody, setFilterBody] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterLoot, setFilterLoot] = useState('');
  const [gridMode, setGridMode] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [visited, setVisited] = useState(loadVisited);

  const toggleVisit = useCallback((id) => {
    setVisited(prev => {
      const next = prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id];
      saveVisited(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let list = POIS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
    }
    if (filterType)   list = list.filter(p => p.type === filterType);
    if (filterSystem) list = list.filter(p => p.system === filterSystem);
    if (filterBody)   list = list.filter(p => p.body === filterBody);
    if (filterDiff)   list = list.filter(p => p.difficulty === filterDiff);
    if (filterLoot)   list = list.filter(p => p.loot === filterLoot);
    return list;
  }, [search, filterType, filterSystem, filterBody, filterDiff, filterLoot]);

  const activeFilters = [filterType, filterSystem, filterBody, filterDiff, filterLoot].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterSystem('');
    setFilterBody('');
    setFilterDiff('');
    setFilterLoot('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
          Points d'intérêt
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Découvrez et suivez {POIS.length} POI à travers Stanton et Pyro — Alpha 4.6
        </p>
      </div>

      {/* Stats */}
      <StatsPanel visited={visited} total={POIS.length} />

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un POI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-space-800 border border-space-400/20 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border',
              showFilters ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' : 'bg-space-800 border-space-400/20 text-slate-400 hover:text-slate-200',
            )}
          >
            <Filter className="w-4 h-4" /> Filtres
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-[10px] font-bold text-white flex items-center justify-center">{activeFilters}</span>
            )}
          </button>

          <div className="flex bg-space-800 border border-space-400/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setGridMode(true)}
              className={clsx('p-2.5 transition-colors', gridMode ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridMode(false)}
              className={clsx('p-2.5 transition-colors', !gridMode ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-500 hover:text-slate-300')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="">Tous les types</option>
            {POI_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={filterSystem} onChange={e => { setFilterSystem(e.target.value); setFilterBody(''); }} className="bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="">Tous les systèmes</option>
            {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterBody} onChange={e => setFilterBody(e.target.value)} className="bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="">Tous les lieux</option>
            {BODIES.filter(b => !filterSystem || POIS.some(p => p.system === filterSystem && p.body === b)).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} className="bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="">Toutes difficultés</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterLoot} onChange={e => setFilterLoot(e.target.value)} className="bg-space-700 border border-space-400/20 rounded-lg px-3 py-2 text-sm text-slate-200">
            <option value="">Tout loot</option>
            {LOOT_TIERS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="col-span-2 sm:col-span-5 text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1">
              <X className="w-3 h-3" /> Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} POI trouvé{filtered.length > 1 ? 's' : ''}</span>
        <span>{visited.length} visité{visited.length > 1 ? 's' : ''} au total</span>
      </div>

      {/* POI Grid/List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Aucun POI trouvé</p>
          <p className="text-slate-500 text-sm mt-1">Essayez de modifier vos filtres</p>
          <button onClick={clearFilters} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className={clsx(
          gridMode
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'space-y-3',
        )}>
          {filtered.map(poi => (
            <POICard
              key={poi.id}
              poi={poi}
              visited={visited.includes(poi.id)}
              onToggleVisit={toggleVisit}
              gridMode={gridMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
