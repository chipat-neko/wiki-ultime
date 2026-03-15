/**
 * Dataset des guides de gameplay Star Citizen
 */

export const GUIDES = [
  {
    id: 'guide-beginners',
    title: 'Guide du Débutant - Premiers Pas',
    category: 'Débutant',
    difficulty: 'Facile',
    readTime: 15,
    description: 'Tout ce que vous devez savoir pour bien démarrer dans Star Citizen.',
    tags: ['débutant', 'tutorial', 'premier pas', 'starter'],
    content: [
      {
        section: 'Créer votre personnage',
        text: 'Commencez par personnaliser votre personnage dans la PU (Persistent Universe). Choisissez votre lieu de naissance, votre apparence et votre nom. Ces choix définissent votre point de départ et votre vaisseau de départ selon votre package.',
      },
      {
        section: 'Votre premier vaisseau',
        text: 'Selon votre package, vous disposez d\'un vaisseau de départ. L\'Aurora MR et le Mustang Alpha sont les plus courants. Ces vaisseaux sont idéaux pour apprendre les bases du vol.',
      },
      {
        section: 'Les premières missions',
        text: 'Rendez-vous à un kiosque de mission dans n\'importe quelle ville (Lorville, Area18, New Babbage ou Orison). Acceptez des missions de livraison de Niveau 1 pour commencer à gagner des aUEC.',
      },
      {
        section: 'Les commandes essentielles',
        text: 'F - Entrer/Sortir du vaisseau. Y - Saut Quantique (maintenir pour sélectionner). Alt+1/2/3 - Gestion des boucliers. Tab - Verrouillage de cible. F1 - MobiFlex (interface personnage).',
      },
      {
        section: 'Économiser des aUEC',
        text: 'Ne dépensez pas tout de suite dans un nouveau vaisseau. Construisez d\'abord une réserve d\'au moins 500 000 aUEC pour pouvoir vous remettre de pertes éventuelles.',
      },
    ],
    author: 'Star Citizen Companion Team',
    lastUpdated: '2024-01-15',
    version: '4.0',
    helpful: 1247,
  },
  {
    id: 'guide-quantum-travel',
    title: 'Maîtriser le Voyage Quantique',
    category: 'Navigation',
    difficulty: 'Facile',
    readTime: 8,
    description: 'Comment naviguer efficacement entre les systèmes et planètes.',
    tags: ['navigation', 'quantique', 'voyage', 'saut'],
    content: [
      {
        section: 'Principe du saut quantique',
        text: 'Le voyage quantique (QT) vous permet de parcourir de grandes distances rapidement. Maintenez Y pour ouvrir la carte de navigation quantique, sélectionnez votre destination et appuyez sur B pour initier le saut.',
      },
      {
        section: 'Le carburant quantique',
        text: 'Chaque saut consomme du carburant quantique (hydrogen). Surveillez votre jauge et faites le plein dans les stations. Un saut Crusader-MicroTech consomme environ 40% du réservoir d\'un Aurora.',
      },
      {
        section: 'Contourner les obstacles',
        text: 'Si votre saut est bloqué par un obstacle céleste, ajustez votre position. Montez de quelques km au-dessus ou en-dessous de l\'écliptique pour obtenir un chemin dégagé.',
      },
      {
        section: 'Interférence et interdiction',
        text: 'Certains obstacles naturels ou la technologie d\'interdiction quantique (ex: Mantis) peuvent bloquer vos sauts. En cas d\'interdiction, manœuvrez pour briser le verrou ou défendez-vous.',
      },
    ],
    author: 'Star Citizen Companion Team',
    lastUpdated: '2024-01-15',
    version: '4.0',
    helpful: 892,
  },
  {
    id: 'guide-trading',
    title: 'Guide du Commerce - Devenir Riche Commerçant',
    category: 'Commerce',
    difficulty: 'Moyen',
    readTime: 20,
    description: 'Stratégies avancées pour maximiser vos profits commerciaux.',
    tags: ['commerce', 'trading', 'argent', 'cargo', 'profit'],
    content: [
      {
        section: 'Les bases du commerce',
        text: 'Achetez des commodités là où elles sont bon marché et vendez-les là où elles valent plus cher. Consultez les terminaux dans les villes pour voir les prix d\'achat et de vente.',
      },
      {
        section: 'Meilleures routes commerciales',
        text: 'Quelques routes classiques : (1) Agricium : Acheter à HDMS-Anderson, vendre à ARC-L1. (2) Laranite : Acheter à Lorville, vendre à New Babbage. (3) Médicaux : Acheter à Orison, vendre partout.',
      },
      {
        section: 'Choisir le bon vaisseau',
        text: 'Pour débuter : Cutlass Black (46 SCU) ou Freelancer (66 SCU). Pour un commerce sérieux : Constellation Taurus (174 SCU), Caterpillar (576 SCU) ou Hercules C2 (696 SCU).',
      },
      {
        section: 'Optimiser sa cargaison',
        text: 'Utilisez le Calculateur de Cargo de cette application pour trouver la combinaison de marchandises maximisant votre profit par trajet. Variez les commodités si les prix d\'une seule sont insuffisants.',
      },
      {
        section: 'Éviter les pirates',
        text: 'Voyagez avec une escorte pour les gros cargos. Évitez les zones à forte présence criminelle comme la ceinture d\'astéroïdes de Yela. Activez vos décoys (leurres) en cas d\'attaque.',
      },
      {
        section: 'Gestion du risque',
        text: 'Ne mettez pas tous vos aUEC dans un seul chargement. En cas de perte, l\'assurance couvre le vaisseau mais pas la cargaison. Gardez toujours une réserve de sécurité.',
      },
    ],
    author: 'TradeExpert_SC',
    lastUpdated: '2024-02-20',
    version: '4.0',
    helpful: 2156,
  },
  {
    id: 'guide-mining',
    title: 'Guide Complet du Minage',
    category: 'Minage',
    difficulty: 'Moyen',
    readTime: 25,
    description: 'Maîtrisez l\'art de l\'extraction minière en solo et en équipe.',
    tags: ['minage', 'mining', 'Prospector', 'MOLE', 'ressources'],
    content: [
      {
        section: 'Équipement nécessaire',
        text: 'Vous avez besoin d\'un vaisseau équipé d\'un laser de minage : le MISC Prospector pour le solo, l\'Argo MOLE pour les équipes. L\'Orion de MISC est pour le minage à grande échelle.',
      },
      {
        section: 'Trouver des roches',
        text: 'Utilisez le mode de scan (V) pour détecter les roches. Les roches vertes sont riches en minerais précieux. Consultez la composition pour identifier les minerais avant de fraiser.',
      },
      {
        section: 'Technique de fracturation',
        text: 'La fracturation demande de la précision. Maintenez la pression du laser dans la zone verte de la jauge. Trop fort = explosion. Trop faible = pas de fracturation. Variez la puissance en temps réel.',
      },
      {
        section: 'Les meilleurs minerais',
        text: 'Ordre de valeur décroissant : Diamant > Or > Bexalite > Agricium > Laranite > Borase > Titanium > Aluminium. Concentrez-vous sur les minerais précieux pour maximiser le profit.',
      },
      {
        section: 'Où miner',
        text: 'Meilleures lunes pour le minage : Daymar (Bexalite, Titanium), Lyria (Quartz, Laranite), Arial (Agricium, Gold), Wala (Minerais variés), Calliope (Diamonds, Gold).',
      },
      {
        section: 'Vendre ses minerais',
        text: 'Vendez bruts ou raffinez d\'abord pour plus de valeur (mais délai de raffinage). Stations de raffinage : HUR-L1, ARC-L1, MIC-L1, CRU-L1. Les raffineries prélèvent une commission.',
      },
    ],
    author: 'MinerVeteran',
    lastUpdated: '2024-01-30',
    version: '4.0',
    helpful: 1834,
  },
  {
    id: 'guide-combat',
    title: 'Guide de Combat - Techniques et Stratégies',
    category: 'Combat',
    difficulty: 'Difficile',
    readTime: 30,
    description: 'Techniques avancées de combat spatial pour survivre et dominer.',
    tags: ['combat', 'dogfight', 'PvP', 'chasseur', 'armes'],
    content: [
      {
        section: 'Modes de vol',
        text: 'SCM (Space Combat Manoeuvring) : mode combat avec vitesse limitée pour plus de contrôle. QT : saut quantique. Découpled : vol découplé pour des manœuvres avancées.',
      },
      {
        section: 'Gestion des boucliers',
        text: 'Alt+1/2/3 redirige la puissance des boucliers. Avant combat : renforcez les boucliers frontaux. En fuite : renforcez les boucliers arrière. Gérez votre énergie entre armes, boucliers et propulseurs.',
      },
      {
        section: 'Techniques de combat',
        text: 'Jouez sur votre vitesse pour contrôler l\'engagement. Les combattants agiles préfèrent les duels rapprochés. Les vaisseaux lourds préfèrent maintenir de la distance. Utilisez les missiles pour ouvrir le combat.',
      },
      {
        section: 'Contre-mesures',
        text: 'Les leurres (decoys) attirent les missiles à ciblage thermique. Les paillettes (noise) contrent les missiles radar. Utilisez-les dès qu\'un missile est lancé vers vous.',
      },
      {
        section: 'Chasse à la prime (PvE)',
        text: 'Les PNJ criminels réagissent agressivement mais de manière prévisible. Engagez un par un. Visez les propulseurs pour immobiliser la cible. Gardez votre distance dans les combats multi-ennemis.',
      },
    ],
    author: 'CombatPilot_UEE',
    lastUpdated: '2024-02-10',
    version: '4.0',
    helpful: 1678,
  },
  {
    id: 'guide-salvage',
    title: 'Guide de Récupération (Salvage)',
    category: 'Récupération',
    difficulty: 'Facile',
    readTime: 12,
    description: 'Gagnez des aUEC en récupérant les débris des épaves spatiales.',
    tags: ['sauvetage', 'récupération', 'salvage', 'Vulture', 'épaves'],
    content: [
      {
        section: 'Introduction au Salvage',
        text: 'La récupération consiste à démanteler des épaves pour en extraire des matériaux (RMC, CS). Le Drake Vulture est le vaisseau solo idéal, tandis que le Reclaimer gère les épaves massives.',
      },
      {
        section: 'Trouver des épaves',
        text: 'Les épaves apparaissent aléatoirement dans l\'espace, autour des planètes et dans les ceintures d\'astéroïdes. Les missions de récupération vous guident vers des épaves spécifiques.',
      },
      {
        section: 'Technique de démantèlement',
        text: 'Pointez le laser de sauvetage sur la coque et maintenez le feu. La barre de progression indique l\'avancement. Collectez les matériaux dans votre soute et vendez à des stations de recyclage.',
      },
      {
        section: 'Les meilleurs matériaux',
        text: 'RMC (Matériaux de Construction Recyclés) et CS (Construction Supplies) sont les plus courants. Les épaves de vaisseaux de guerre contiennent plus de matériaux de qualité.',
      },
    ],
    author: 'SalvageKing',
    lastUpdated: '2024-03-05',
    version: '4.0',
    helpful: 956,
  },
  {
    id: 'guide-pyro',
    title: 'Survivre dans le Système Pyro',
    category: 'Exploration',
    difficulty: 'Extrême',
    readTime: 18,
    description: 'Comment naviguer et survivre dans le dangereux système Pyro.',
    tags: ['pyro', 'danger', 'pirate', 'exploration', 'survie'],
    content: [
      {
        section: 'Qu\'est-ce que Pyro ?',
        text: 'Pyro est un système non contrôlé par l\'UEE, abandonné après l\'instabilité de son étoile. Sans forces de l\'ordre, c\'est la loi de la jungle. La seule règle : survivre.',
      },
      {
        section: 'Comment y accéder',
        text: 'Utilisez le point de saut entre Stanton et Pyro. Préparez-vous avant de traverser : fuel plein, armure, armes, médicaments. Le retour n\'est pas garanti.',
      },
      {
        section: 'Menaces principales',
        text: 'Joueurs pirates omniprésents, organisations criminelles hostiles (Ninetails dans Pyro), éruptions solaires de l\'étoile Pyro, stations instables, manque de ressources légales.',
      },
      {
        section: 'Stratégies de survie',
        text: 'Voyagez en groupe, évitez les zones bondées si non armé, gardez une route de sortie planifiée, communiquez peu sur le canal global, méfiez-vous des offres de "paix".',
      },
      {
        section: 'Opportunités économiques',
        text: 'Pyro offre des récompenses plus élevées pour les missions à risque. Certains minerais rares se trouvent uniquement dans ce système. La contrebande y est plus facile sans contrôles.',
      },
    ],
    author: 'ExplorerVeteran',
    lastUpdated: '2024-04-01',
    version: '4.0',
    helpful: 2345,
  },
  {
    id: 'guide-bounty-hunting',
    title: 'Guide de la Chasse à la Prime',
    category: 'Combat',
    difficulty: 'Moyen',
    readTime: 16,
    description: 'Maîtrisez la chasse à la prime et progressez dans les rangs de la Guilde.',
    tags: ['prime', 'bounty', 'combat', 'guilde', 'criminel'],
    content: [
      {
        section: 'La Guilde des Chasseurs de Primes',
        text: 'La Bounty Hunters Guild (BHG) est l\'organisation officielle des chasseurs de primes légaux dans l\'UEE. Rejoignez-la via les terminaux de mission ou les kiosques BHG dans les grandes villes. Votre rang détermine le niveau des contrats accessibles.',
      },
      {
        section: 'Types de primes',
        text: 'Primes Légales (UEE) : cibler des criminels avec casier. Primes Illégales (organisations criminelles) : cibler des joueurs ou NPC légaux — augmente votre CrimeStat. Commencez toujours par les primes légales.',
      },
      {
        section: 'Équipement recommandé',
        text: 'Un chasseur léger comme l\'Arrow, le Gladius ou le Hornet est idéal. Pour capturer vivant, équipez-vous de missiles de traction (tractor missiles) et un vaisseau avec espace passager. Pour éliminer : missiles S3+ et canons de précision.',
      },
      {
        section: 'Trouver et traquer la cible',
        text: 'Acceptez la prime depuis un terminal. La cible a une zone de recherche (rayon en km). Utilisez votre scanner (V long press) pour détecter des signatures. Les primes avancées nécessitent des outils de traque au sol.',
      },
      {
        section: 'Capture vs Élimination',
        text: 'Capturer vivant rapporte 50-100% de plus qu\'éliminer. Pour capturer : abattez le vaisseau (sans le détruire), EVA vers l\'épave, neutralisez le pilote au sol avec un pistolet à impulsion, ramenez-le à une station Advocacy.',
      },
      {
        section: 'Contres et précautions',
        text: 'Les cibles de haut niveau ont souvent des acolytes. Vérifiez la valeur de la prime vs risque. Certains joueurs avec CrimeStat poseront une contre-prime sur vous. Gardez une route de fuite.',
      },
    ],
    author: 'BountyHunter_Pro',
    lastUpdated: '2024-05-10',
    version: '4.0',
    helpful: 1589,
  },
  {
    id: 'guide-quantainium',
    title: 'Minage de Quantainium — Guide Expert',
    category: 'Minage',
    difficulty: 'Difficile',
    readTime: 20,
    description: 'Exploitez le minerai le plus précieux et le plus dangereux de l\'univers.',
    tags: ['quantainium', 'minage', 'précieux', 'Prospector', 'instable'],
    content: [
      {
        section: 'Qu\'est-ce que le Quantainium ?',
        text: 'Le Quantainium est le minerai le plus précieux du jeu (~3 800 aUEC/SCU en vente). C\'est aussi le plus dangereux : il est instable et peut exploser dans votre soute si vous tardez à le vendre. Plus vous en transportez, plus le risque augmente.',
      },
      {
        section: 'Où le trouver',
        text: 'Le Quantainium se trouve principalement dans la ceinture d\'astéroïdes d\'Aberdeen (Hurston), autour de Daymar (Crusader) et dans les ceintures de Pyro. Les roches Q-rich apparaissent avec une signature magnétique distinctive au scanner.',
      },
      {
        section: 'Technique de fracturation',
        text: 'Le Quantainium explose si vous dépassez la pression critique lors de la fracturation. Utilisez une puissance de laser faible (Arbor MH1 recommandé). Fractionnez en petits morceaux plutôt qu\'une grande fracturation. Utilisez des charges de fracturation (Helix) pour les grosses roches.',
      },
      {
        section: 'Gestion du timer d\'instabilité',
        text: 'Une fois en soute, vous avez ~8-15 minutes avant explosion selon la quantité. Planifiez votre route de vente AVANT de miner. ARC-L1, HUR-L1 et MIC-L1 sont les meilleures stations de vente proche des zones de minage.',
      },
      {
        section: 'Optimisation des profits',
        text: 'Route optimale solo (Prospector) : Ceinture d\'Aberdeen → HUR-L1 → Lorville (si plein). Profit moyen : 300 000-500 000 aUEC/heure avec 32 SCU. En équipe avec un MOLE : 1-2M aUEC/heure possible.',
      },
      {
        section: 'Autres minerais précieux',
        text: 'Après le Quantainium, les plus rentables : Taranite (2 500 aUEC/SCU, Pyro), Hephaestanite (2 200 aUEC/SCU, lunes de Stanton), Hadanite (gemme 1 900 aUEC/SCU). Le Bexalite (4 125 aUEC/SCU achat/vente) est stable et très rentable.',
      },
    ],
    author: 'QuantMiner_Elite',
    lastUpdated: '2024-06-01',
    version: '4.0',
    helpful: 2012,
  },
  {
    id: 'guide-fleet',
    title: 'Composer sa Flotte Idéale',
    category: 'Flotte',
    difficulty: 'Moyen',
    readTime: 22,
    description: 'Conseils pour composer une flotte équilibrée selon vos objectifs.',
    tags: ['flotte', 'organisation', 'groupe', 'vaisseaux', 'composition'],
    content: [
      {
        section: 'Pourquoi une flotte ?',
        text: 'Une flotte bien composée multiplie l\'efficacité. Les différents rôles (combat, cargo, médical, minage) se complètent pour former une organisation auto-suffisante.',
      },
      {
        section: 'Flotte de Combat',
        text: 'Nécessite : 2-3 chasseurs légers (escorte), 1 chasseur lourd (frappe), éventuellement 1 vaisseau de commandement (Hammerhead, Polaris). Un vaisseau médical est fortement recommandé.',
      },
      {
        section: 'Flotte Commerciale',
        text: 'Nécessite : 1-2 grands cargos (C2, Caterpillar, Starfarer), 2-3 escorteurs (Cutlass, Hornet), 1 vaisseau médical. La rentabilité est maximisée avec de la coordination.',
      },
      {
        section: 'Flotte Mixte (Recommandé)',
        text: 'La combinaison idéale : 1 grand cargo + 2 chasseurs + 1 mineur + 1 vaisseau médical. Cette composition permet de s\'adapter à toutes les situations.',
      },
      {
        section: 'Communication',
        text: 'Une flotte efficace nécessite une bonne communication. Utilisez Discord ou les canaux voix de Star Citizen. Désignez un commandant de flotte et un plan de contingence en cas d\'attaque.',
      },
    ],
    author: 'OrgLeader_SC',
    lastUpdated: '2024-02-28',
    version: '4.0',
    helpful: 1456,
  },
  {
    id: 'guide-crimestat',
    title: 'CrimeStat & Réhabilitation — Effacer son Casier',
    category: 'Débutant',
    difficulty: 'Facile',
    readTime: 12,
    description: 'Comprendre le système de criminalité et comment retrouver une ardoise propre.',
    tags: ['crimestat', 'criminel', 'klescher', 'prison', 'casier', 'légal'],
    content: [
      {
        section: 'Qu\'est-ce que le CrimeStat ?',
        text: 'Le CrimeStat (CS) mesure votre niveau de criminalité de CS1 à CS5. CS1 : infraction mineure, amende possible. CS2-3 : primes actives sur vous, accès à certaines zones bloqué. CS4-5 : intervention UEE active, tiré à vue dans les zones UEE.',
      },
      {
        section: 'Comment obtenir du CrimeStat',
        text: 'Attaquer des joueurs ou NPC légaux, transporter des marchandises illégales détectées au scan, tuer un officier UEE, détruire des vaisseaux légaux. Certains crimes sont détectés uniquement si un témoin vous signale (joueur ou NPC ayant un terminal de communication).',
      },
      {
        section: 'Méthodes d\'effacement',
        text: '(1) Self-surrender — se rendre à un poste de l\'Advocacy et payer une amende (CS1-2 seulement). (2) Terminal d\'effacement criminel — stations illégales comme Pyrochem/Rat\'s Nest permettent l\'effacement payant. (3) Purger en prison à Klescher.',
      },
      {
        section: 'La Prison de Klescher',
        text: 'Klescher Rehabilitation Facility est la prison d\'Aberdeen (lune de Hurston). La peine se purge en minutes réelles selon le CrimeStat. Activités disponibles : minage de gemmes (Hadanite, Dolivine), courses de données, fabrication. Un tunnel secret permet l\'évasion (risqué).',
      },
      {
        section: 'Conseils pour éviter le CrimeStat',
        text: 'Désactivez vos armes en zone civile (F pour le mode sécurité). Vérifiez votre cargaison avant les scanners aux check-points. Évitez de tirer en premier en zone UEE — même en self-defense, les NPC peuvent vous signaler.',
      },
      {
        section: 'Jouer le rôle de Hors-la-loi',
        text: 'Un CrimeStat élevé ouvre des missions exclusives dans les stations criminelles (Nine Tails, Dusters). L\'effacement coûte cher, planifiez votre budget. Avec CS4+, Pyro est un refuge pratique hors portée UEE avec 10 stations accessibles.',
      },
    ],
    author: 'LegacyBounty_SC',
    lastUpdated: '2024-07-15',
    version: '4.0',
    helpful: 1723,
  },
  {
    id: 'guide-ship-components',
    title: 'Composants de Vaisseau — Guide Complet',
    category: 'Vaisseaux',
    difficulty: 'Moyen',
    readTime: 25,
    description: 'Maîtrisez l\'équipement de votre vaisseau pour optimiser combat, exploration et commerce.',
    tags: ['composants', 'boucliers', 'moteurs', 'armes', 'refroidissement', 'loadout'],
    content: [
      {
        section: 'Les catégories de composants',
        text: 'Un vaisseau possède : Armes (fixes, cardans, tourelles), Missiles/Roquettes, Boucliers, Propulseurs (manœuvre + principale), Générateur de puissance (Power Plant), Refroidisseur (Cooler), Ordinateur de combat (QIG), Calculateur de saut quantique (QDrive).',
      },
      {
        section: 'Tailles et grades',
        text: 'Les composants vont de S1 à S8 (taille), et de Grade A à D (qualité). Grade A = meilleure performance, moins durables. Grade C = standard équilibré. Grade D = entrée de gamme. Les composants militaires sont robustes et performants mais coûteux.',
      },
      {
        section: 'Le générateur de puissance',
        text: 'Il alimente tout le vaisseau. Un générateur insuffisant force des arbitrages entre armes, boucliers et propulsion. Priorités recommandées : (1) Boucliers en combat, (2) Propulseurs en fuite, (3) Armes. Gérez avec le triangle de puissance (Alt+1/2/3).',
      },
      {
        section: 'Refroidissement (Cooler)',
        text: 'Un mauvais refroidissement cause la surchauffe puis un shutdown forcé. Important aussi pour la furtivité (signature infrarouge basse). Les coolers "Stealth" permettent de rester sous les radars. Coordonnez refroidisseur et générateur pour les builds silencieux.',
      },
      {
        section: 'Boucliers',
        text: 'Les boucliers absorbent les dégâts selon leur face. Quelques boucliers importants : Phalanx (équilibré), Mirage (léger/furtif), Bracer (lourd), INK Nova (meilleur S3). Redistribuez avec Alt+1/2/3 selon la direction de l\'attaque.',
      },
      {
        section: 'Drives Quantiques (QDrive)',
        text: 'Le QDrive détermine vitesse et distance de saut quantique. Drives "Stealth" (Yeager, Drift) ont des signatures IR basses, utiles en exploration et contrebande. Drives "Expedition" (Beacon, Crossfield) optimisés pour l\'autonomie et la longue distance.',
      },
    ],
    author: 'TechPilot_UEE',
    lastUpdated: '2024-08-01',
    version: '4.0',
    helpful: 1941,
  },
  {
    id: 'guide-exploration',
    title: 'Guide de l\'Exploration et du Scanning',
    category: 'Exploration',
    difficulty: 'Moyen',
    readTime: 18,
    description: 'Explorez l\'univers, scannez des ressources et gagnez de l\'aUEC avec l\'exploration.',
    tags: ['exploration', 'scanning', 'radar', 'Terrapin', 'Carrack', 'dérelict', 'ping'],
    content: [
      {
        section: 'Vaisseaux d\'exploration',
        text: 'Le MISC Terrapin est le meilleur explorateur solo blindé. Le Drake Herald est optimal pour les courses de données et le scanning rapide. Pour l\'exploration longue distance : le Anvil Carrack (autonome, crew 6) et le MISC Endeavor. L\'Origin 600i est luxueux et polyvalent.',
      },
      {
        section: 'Le système de scan (Ping)',
        text: 'Appuyez V (scan passif) ou maintenez V (ping actif). Le ping envoie une impulsion radar et détecte signatures dans un rayon selon votre scanner équipé. Attention : un ping actif révèle VOTRE position aux autres scanners passifs dans la zone.',
      },
      {
        section: 'Types de signatures',
        text: '(1) EM (Electromagnétique) — vaisseaux allumés, générateurs actifs. (2) IR (Infrarouge) — chaleur émise, moteurs actifs. (3) CS (Cross-Section) — taille physique. Coupez générateur et moteurs pour devenir quasi-invisible (mode "silencieux" ou "cold run").',
      },
      {
        section: 'Scanner des ressources minières',
        text: 'En mode scan, les roches apparaissent avec leur composition. Une roche vert vif = haute concentration de minerais précieux. Le pourcentage indique la richesse. Les roches avec Quantainium pulsent d\'une teinte orangée distinctive — approchez prudemment.',
      },
      {
        section: 'Dérelicts et Points d\'Intérêt',
        text: 'Les épaves dérelictes générées procéduralement contiennent du loot (composants, armes, boîtes de données). Approchez lentement et scannez avant d\'aborder. Les bunkers en surface des planètes contiennent également du matériel précieux mais sont défendus par des gardes PNJ.',
      },
      {
        section: 'Exploration de Pyro',
        text: 'Pyro offre des points d\'intérêt uniques : stations abandonnées UEE, épaves de guerre, zones de déchets radioactifs. Les éruptions solaires de l\'étoile Pyro brouillent les signaux. 10 stations illégales disponibles pour se ravitailler dont Orbituary, Checkmate et Ruin Station.',
      },
    ],
    author: 'ExplorerPro',
    lastUpdated: '2024-09-10',
    version: '4.0',
    helpful: 1356,
  },
  {
    id: 'guide-gas-mining',
    title: 'Minage de Gaz — Guide du Starfarer',
    category: 'Minage',
    difficulty: 'Moyen',
    readTime: 14,
    description: 'Exploitez les géantes gazeuses de Stanton et Pyro pour des profits stables.',
    tags: ['gaz', 'minage', 'Starfarer', 'hydrogène', 'Crusader', 'Fuego', 'carburant'],
    content: [
      {
        section: 'Introduction au minage de gaz',
        text: 'Le minage de gaz se pratique dans les géantes gazeuses (Crusader dans Stanton, Fuego dans Pyro). Contrairement au minage de roches, il nécessite des vaisseaux équipés de têtes d\'extraction gazeuses. Gaz vendables : Hydrogène, Oxygène, Hélium, Argon, Anti-Hydrogène (très rare).',
      },
      {
        section: 'Vaisseaux et équipement',
        text: 'Le MISC Starfarer et le Starfarer Gemini sont les vaisseaux de minage/transport de gaz officiels. Ils aspirent directement les gaz des géantes. Des modules de ravitaillement permettent de vendre le carburant à d\'autres joueurs en espace ouvert.',
      },
      {
        section: 'Les gaz les plus rentables',
        text: 'Anti-Hydrogène (~2 800 aUEC/SCU, extrêmement rare, zones profondes). Tritium (~1 800 aUEC/SCU, zones denses). Hélium-3 (~350 aUEC/SCU, commun mais haut volume). L\'Hydrogène ordinaire est bas prix mais utile pour le ravitaillement de joueurs contre paiement direct.',
      },
      {
        section: 'Zones d\'extraction optimales',
        text: 'Crusader (Stanton) : zones nuageuses denses entre 2000-8000 km d\'altitude. Fuego (Pyro VI) : plus de richesse en gaz rares mais dangereux — aucune sécurité UEE. Les "tempêtes électriques" de Fuego concentrent plus d\'Anti-Hydrogène.',
      },
      {
        section: 'Économie du gaz',
        text: 'Vendre aux stations proches (CRU-L1, Orison) les gaz communs. Transporter les gaz précieux vers Area18 ou New Babbage pour de meilleurs prix. Le service de ravitaillement inter-joueur (refueling) est une niche lucrative : rechargez les vaisseaux directement en espace ouvert.',
      },
    ],
    author: 'GasMiner_Pro',
    lastUpdated: '2024-09-25',
    version: '4.0',
    helpful: 987,
  },
  // ============================================================
  // GUIDES ALPHA 4.0+ (Pyro, Zones Contestées, Engineering)
  // ============================================================
  {
    id: 'guide-pyro-trading',
    title: 'Commerce dans Pyro — Routes Rentables',
    category: 'Commerce',
    difficulty: 'Difficile',
    readTime: 18,
    description: 'Maîtrisez le commerce risqué mais lucratif dans le système Pyro pour des profits de 100k–450k aUEC par trajet.',
    tags: ['pyro', 'commerce', 'cargo', 'route', 'risque', 'profit'],
    content: [
      {
        section: 'Pourquoi trader dans Pyro',
        text: 'Le système Pyro offre des marges commerciales supérieures à Stanton en raison de l\'absence de régulation UEE. Des stations comme Checkmate et Ruin Station achètent et vendent à des prix que les stations légales refusent. Un run optimisé rapporte facilement 200k–450k aUEC avec un Caterpillar ou un Hull C.',
      },
      {
        section: 'Routes recommandées',
        text: 'Lorville (Hurston) → Checkmate (Pyro II) : Composants électroniques → retour Altruciatoxine brute. New Babbage → Ruin Station (Pyro IV) : Matériel médical → retour Néon ou WiDoW. Stanton (ARC-L1) → Pyro (Terminus) : Carburant/Gaz → retour Épaves récupérées. Attention : Pyro est une zone de non-droit, les intercepteurs PvP sont fréquents.',
      },
      {
        section: 'Commodités les plus rentables',
        text: 'WiDoW (illégal) : 11k–13k aUEC/SCU — le jackpot si vous réussissez à traverser. Néon-Drogue (illégal) : 1.3k–1.7k/SCU, plus accessible. Beryl (légal) : ~340 aUEC/SCU, faible risque mais solide. Technologie de Contrebande : 2.4k–3.3k aUEC/SCU. Cache d\'Armes : 3.2k–4.5k aUEC/SCU.',
      },
      {
        section: 'Sécurité et survie',
        text: 'Volez toujours avec un wingman en Pyro. Activez le mode cargo sécurisé (verrouillage des soutes). Évitez les routes prédictibles. Les stations de Pyro offrent un hangar sécurisé moyennant 10 000 aUEC de frais d\'amarrage automatisé. Gardez au moins 50 000 aUEC de réserve pour les réparations et assurances.',
      },
      {
        section: 'Le Jump Point Stanton–Pyro',
        text: 'Le Jump Point entre les deux systèmes est une zone très fréquentée et potentiellement dangereuse. Plusieurs joueurs y tendent des embuscades. Approchez à vitesse réduite, scannez les environs et n\'hésitez pas à rebrousser chemin si vous détectez des signatures suspectes.',
      },
    ],
    author: 'PyroTrader_FR',
    lastUpdated: '2025-03-15',
    version: '4.0',
    helpful: 1842,
  },
  {
    id: 'guide-contested-zones',
    title: 'Zones Contestées — Missions et Stratégies',
    category: 'Combat',
    difficulty: 'Difficile',
    readTime: 16,
    description: 'Exploitez les zones contestées de Stanton et Pyro pour des missions ultra-rentables avec des primes jusqu\'à 500k aUEC.',
    tags: ['zones contestées', 'combat', 'pyro', 'missions', 'mercenaire', 'primes'],
    content: [
      {
        section: 'Qu\'est-ce qu\'une zone contestée',
        text: 'Les Zones Contestées (Contested Zones) sont des emplacements instables en conflit entre plusieurs factions. Elles apparaissent dans Stanton (avant-postes Hurston, lunes) et massivement dans Pyro. Y entrer sans mission signifie un Crimestat immédiat depuis 4.0 dans les zones UEE.',
      },
      {
        section: 'Types de missions en zones contestées',
        text: 'Élimination : Nettoyer un avant-poste de ses défenseurs ennemis (50k–120k aUEC). Escorte : Protéger un convoi traversant une zone contestée. Récupération : Extraire des données ou du matériel derrière les lignes. Sabotage : Détruire des installations ennemies. Défense : Tenir une position sous assaut ennemi.',
      },
      {
        section: 'Stratégie d\'approche',
        text: 'Jamais seul dans une zone Tier 3+. Idéal : équipe de 3–4 joueurs avec rôles définis (pilote, assaut sol, sniper, médic). Utilisez un vaisseau furtif pour l\'insertion initiale (Eclipse, Stalker). Scannez l\'avant-poste avant l\'approche pour compter les défenseurs et tourelles.',
      },
      {
        section: 'Vaisseaux recommandés',
        text: 'Insertion : Esperia Talon, MISC Fortune (discret). Combat spatial : Gladius, Arrow, Guardian. Support : Pisces Medic, Carrack (commandement). Ne jamais apporter un gros cargo en zone contestée — cible prioritaire pour les pirates.',
      },
      {
        section: 'Butin et récompenses',
        text: 'En plus de la prime de mission, les défenseurs droppent du matériel récupérable (armures, armes, composants). Les caisses de butin dans les avant-postes peuvent contenir des items rares. Les données récupérées se revendent à des factions spécifiques pour des bonus de réputation.',
      },
    ],
    author: 'MercenaryGuild_SC',
    lastUpdated: '2025-06-20',
    version: '4.0',
    helpful: 2156,
  },
  {
    id: 'guide-server-meshing',
    title: 'Server Meshing — Comprendre la Technologie',
    category: 'Technique',
    difficulty: 'Moyen',
    readTime: 10,
    description: 'Comment fonctionne le Server Meshing de Star Citizen 4.0 et comment l\'exploiter.',
    tags: ['server meshing', 'technique', 'performance', 'lag', 'alpha 4.0'],
    content: [
      {
        section: 'Qu\'est-ce que le Server Meshing',
        text: 'Le Server Meshing (Maillage de Serveurs) est la technologie phare d\'Alpha 4.0 qui permet à plusieurs serveurs de gérer différentes zones d\'un même univers. Avant 4.0, un seul serveur gérait tout — limité à ~50 joueurs. Avec le meshing, chaque zone du système a son propre serveur dédié.',
      },
      {
        section: 'Impact sur le gameplay',
        text: 'Jusqu\'à 500+ joueurs par instance de système. Les transitions entre zones (Jump Points, entrées planétaires) entraînent un transfert de votre session vers un autre serveur. Si une zone est saturée, le serveur peut créer un "shard" supplémentaire. Réduction majeure du lag lors des grandes batailles.',
      },
      {
        section: 'Shard et persistance',
        text: 'Votre vaisseau et vos biens sont persistants entre shards grâce à la base de données globale. Vous pouvez vous connecter n\'importe quand et retrouver vos vaisseaux et crédits intacts. Les objets posés dans l\'espace (caisses de butin) persistent pendant 30 minutes.',
      },
      {
        section: 'Problèmes connus (4.0)',
        text: 'Le meshing entraîne parfois des "déconnexions inter-serveurs" lors du passage entre zones. Évitez de déclencher un QT pendant une transition de zone — risque de vous retrouver dans le vide. Les batailles massives peuvent encore causer du lag dans la zone de transition.',
      },
      {
        section: 'Conseils pratiques',
        text: 'Attendez 10–15 secondes après un Jump Point avant de relancer votre QT (stabilisation du serveur). Si vous êtes "coincé" entre deux zones, se déconnecter et reconnecter résout généralement le problème. Vérifiez la charge du shard dans les paramètres réseau (F12).',
      },
    ],
    author: 'TechPilot_FR',
    lastUpdated: '2025-01-10',
    version: '4.0',
    helpful: 1654,
  },
  {
    id: 'guide-interdiction',
    title: 'Interdiction Quantique — Défense et Attaque',
    category: 'Combat',
    difficulty: 'Difficile',
    readTime: 12,
    description: 'Maîtrisez l\'interdiction QT pour tendre des embuscades ou échapper aux intercepteurs.',
    tags: ['interdiction', 'quantum', 'embuscade', 'pirate', 'fuite', 'guardian-qi'],
    content: [
      {
        section: 'Principe de l\'interdiction quantique',
        text: 'Depuis Alpha 4.0, certains vaisseaux peuvent interrompre le saut quantique d\'un autre vaisseau. Le Mirai Guardian QI est l\'exemple le plus connu avec son module Captor QD. Lorsqu\'un vaisseau entre dans le rayon d\'un inhibiteur QD, il ne peut plus initier de QT.',
      },
      {
        section: 'Vaisseaux dotés d\'interdiction',
        text: 'Guardian QI (Mirai) : Interdicteur principal, portable. Idris (RSI) : Inhibiteur QD de portée très large. Certains vaisseaux militaires UEE peuvent aussi interrompre votre QT lors des checkpoints. Les "Scramble Bands" en jeu sont aussi des items d\'interdiction personnelle.',
      },
      {
        section: 'Stratégie d\'attaque (pirate)',
        text: 'Positionnez votre Guardian QI sur une route commerciale fréquentée. Activez le Captor QD et attendez un vaisseau cargo. Dès qu\'il passe dans votre rayon, son QT s\'interrompt. Approchez rapidement et exigez la reddition ou ouvrez le feu. Attention : agir ainsi dans l\'espace UEE génère un Crimestat élevé.',
      },
      {
        section: 'Contre-mesures (proie)',
        text: 'ECM (Electronic Countermeasures) : réduisent le rayon d\'interdiction. Vitesse maximale : tentez de sortir du rayon en vol normal. Wingman de sécurité : un chasseur d\'escorte peut neutraliser l\'interdicteur. Dans Pyro, volez toujours avec un escort quand vous transportez des marchandises.',
      },
      {
        section: 'Utilisation légale',
        text: 'Les organisations joueurs peuvent utiliser l\'interdiction pour des entraînements ou des scénarios PvP consentis. Certaines missions de bounty-hunting autorisent l\'interdiction des cibles recherchées. Vérifiez votre statut légal avant d\'activer — l\'interdiction est criminelle dans les zones UEE sans autorisation.',
      },
    ],
    author: 'Interdictor_Prime',
    lastUpdated: '2025-04-08',
    version: '4.0',
    helpful: 1389,
  },
  {
    id: 'guide-engineering',
    title: 'Engineering 4.5 — Gérer les Systèmes de Votre Vaisseau',
    category: 'Technique',
    difficulty: 'Difficile',
    readTime: 20,
    description: 'Le système d\'Engineering d\'Alpha 4.5 vous permet de réparer, gérer et optimiser les systèmes de votre vaisseau en temps réel.',
    tags: ['engineering', 'réparation', 'systèmes', 'alpha 4.5', 'équipage', 'multiplay'],
    content: [
      {
        section: 'Introduction à l\'Engineering',
        text: 'Alpha 4.5 (Dawn of Engineering) introduit un système de gestion des composants navals en temps réel. Un ingénieur à bord peut surveiller la température des réacteurs, réparer les dégâts de combat et optimiser la distribution d\'énergie entre les systèmes.',
      },
      {
        section: 'Poste d\'ingénieur',
        text: 'Sur les vaisseaux moyens et grands, un siège "Engineer" est disponible. Depuis ce poste, accédez au panneau de contrôle des systèmes (MFD Engineering). Vous voyez en temps réel : état des réacteurs, boucliers, propulseurs, armes. Chaque composant a une jauge de santé et de température.',
      },
      {
        section: 'Réparation en combat',
        text: 'Quand un composant est endommagé, son efficacité baisse progressivement. L\'ingénieur peut intervenir physiquement sur le composant (interaction FPS dans la salle des machines) pour le réparer avec des kits de réparation. Une réparation complète d\'un bouclier prend 15–30 secondes selon la taille.',
      },
      {
        section: 'Gestion de la chaleur',
        text: 'Les composants surchauffés réduisent leurs performances ou s\'éteignent automatiquement. L\'ingénieur peut augmenter le flux de refroidissement via les panneaux dédiés. En combat intense, priorisez le refroidissement des armes et des boucliers. En exploration, optimisez pour les moteurs QT.',
      },
      {
        section: 'Travail en équipe',
        text: 'L\'engineering est conçu pour le multi-joueurs : pilote + ingénieur = équipage optimal. L\'ingénieur communique via le système de voice intégré. Sur un Carrack : 1 pilote, 1 ingénieur, 1 médic, 2 gunners = équipe complète. Les rôles d\'engineering sont essentiels pour les incursions dans Pyro.',
      },
      {
        section: 'Nouveau en 4.6 — Diagnostics avancés',
        text: 'Alpha 4.6 ajoute un panneau de diagnostics détaillé accessible depuis le MFD Engineering. Vous pouvez désormais anticiper les pannes (indicateur d\'usure prédictive) et sauvegarder jusqu\'à 5 présets de distribution d\'énergie. Le système de notifications alerte automatiquement l\'ingénieur si un composant atteint 70% de température.',
      },
    ],
    author: 'EngineerCorps_SC',
    lastUpdated: '2026-03-01',
    version: '4.6',
    helpful: 2341,
  },
  // ============================================================
  // GUIDES GAMEPLAY AVANCÉS — BATCH 2
  // ============================================================
  {
    id: 'guide-combat-dogfight',
    title: 'Guide du Combat Spatial — Dogfight',
    category: 'Combat',
    difficulty: 'Difficile',
    readTime: 20,
    description: 'Maîtrisez les techniques de dogfight pour dominer dans les combats PvP et PvE.',
    tags: ['dogfight', 'combat', 'PvP', 'manoeuvre', 'découpling', 'missiles'],
    content: [
      {
        section: 'Fondamentaux du combat',
        text: 'En Star Citizen, la maîtrise du triangle de puissance (armes / boucliers / propulseurs) est la clé du combat. Redistribuez l\'énergie selon la situation : davantage aux propulseurs pour fuir ou pour un burst de vitesse, davantage aux armes lors d\'un engagement offensif. Le mode SCM (Space Combat Manoeuvring) limite votre vitesse pour offrir un meilleur contrôle directionnel lors des duels.',
      },
      {
        section: 'Types d\'armements',
        text: 'Les canons laser (laser cannons) offrent une cadence élevée et sont idéaux contre les boucliers. Les canons balistiques ignorent les boucliers mais consomment des munitions. Les canons de distorsion (distortion cannons) surchauffent l\'électronique ennemie et désactivent ses systèmes. Combinez balistique + laser pour une pénétration maximale.',
      },
      {
        section: 'Tactiques de virage',
        text: 'Le "turn-fighting" consiste à maintenir l\'ennemi dans votre cône de tir en virant plus serré. Les vaisseaux légers comme l\'Arrow ou le Gladius excellent à cela. Pour contrer un chasseur plus agile, montez en vitesse et imposez une distance qui avantage vos armes longue portée. L\'utilisation des post-brûleurs (afterburner) doit être courte et précise — une surchauffe vous laisse vulnérable.',
      },
      {
        section: 'L\'art du découpling',
        text: 'Le mode découplé (G par défaut) coupe l\'assistance au vol et vous permet de viser dans une direction tout en vous déplaçant dans une autre. C\'est la technique avancée la plus efficace : rétrofusez en faisant face à votre poursuivant et continuez à tirer pendant qu\'il vous dépasse. Maîtriser le découplage prend des dizaines d\'heures d\'entraînement, mais est décisif en PvP.',
      },
      {
        section: 'Missiles vs canons',
        text: 'Les missiles sont décisifs pour initier un engagement (premier tir) ou pour finir une cible affaiblie. Ils sont contrecarrés par les leurres (decoys thermiques) et les paillettes (noise). Les canons sont plus fiables à courte portée sur cible lente. Portez toujours une combinaison : missiles S3 pour l\'ouverture de combat et canons pour le duel prolongé.',
      },
      {
        section: 'Vaisseaux recommandés',
        text: 'Débutant dogfight : Gladius (maniable, économique à assurer), Arrow (ultra-agile, léger). Niveau intermédiaire : Hornet F7C-M (solide, polyvalent), Sabre (furtif, excellentes armes). Niveau expert : Eclipse (strike bomber furtif), Hammerhead (tourelles multi-équipages). Pour le PvP compétitif, le Gladius reste le référence de l\'équilibre maniabilité/puissance de feu.',
      },
    ],
    author: 'DogfightPro_SC',
    lastUpdated: '2025-09-01',
    version: '4.0',
    helpful: 2478,
  },
  {
    id: 'guide-fps-combat',
    title: 'Combat FPS — Techniques et Armement',
    category: 'Combat',
    difficulty: 'Moyen',
    readTime: 18,
    description: 'Dominez les combats à pied dans les bunkers, stations et épaves de Star Citizen.',
    tags: ['FPS', 'combat sol', 'armure', 'armes', 'bunker', 'grenades'],
    content: [
      {
        section: 'Armures et santé',
        text: 'Le système de santé FPS distingue la santé globale et la santé par membre. Une jambe brisée ralentit considérablement votre personnage. Portez toujours un medpen (médicament auto-injecté) pour récupérer de l\'état "incapacité" avant que quelqu\'un vous exécute. L\'armure lourde (Heavy Armor) réduit la mobilité mais absorbe considérablement plus de dégâts.',
      },
      {
        section: 'Armes recommandées',
        text: 'Pour les bunkers (combat rapproché) : Bulldog (pistolet à répétition), Devastator-12 (shotgun), ou le P4-AR (assault rifle polyvalent). Pour les zones ouvertes et longue distance : Klaus & Werner MP5 (SMG précis), Arrowhead (sniper électromagnétique). L\'arme de départ Aurora tient bien jusqu\'à 30 000 aUEC d\'équipement débloqué.',
      },
      {
        section: 'Grenades et gadgets',
        text: 'Les grenades à fragmentation (frag) sont redoutables en intérieur — attention aux ricochets sur les murs métalliques. Les grenades EMP désactivent les armures et visors ennemis temporairement, idéales pour neutraliser des cibles lourdement équipées. Le Multi-Tool avec l\'embout tractor est essentiel pour ouvrir des caisses verrouillées et récupérer du loot distant.',
      },
      {
        section: 'Techniques de bunker',
        text: 'Les bunkers NPC ont un schéma prévisible : gardes à l\'entrée, civils dans les couloirs, officiers en salle de commande. Progressez angle par angle, utilisez le peek (lean) pour éviter l\'exposition. Les générateurs de bunker peuvent être coupés pour éteindre les lumières et les tourelles automatiques. Avancez toujours en ayant un coéquipier couvrant vos arrières.',
      },
      {
        section: 'CrimeStat et conséquences',
        text: 'Tuer un garde NPC dans une zone UEE génère du CrimeStat, même dans le cadre d\'une mission — vérifiez toujours que vos cibles sont légitimes. Les missions de bunker légales vous donnent une autorisation temporaire. Si vous obtenez CS2 ou plus en plein combat FPS, des joueurs chasseurs de primes peuvent vous localiser et vous attaquer. Gardez un medpen Hemozal et une route de fuite planifiée.',
      },
    ],
    author: 'GroundForce_SC',
    lastUpdated: '2025-09-10',
    version: '4.0',
    helpful: 1876,
  },
  {
    id: 'guide-mining-advanced',
    title: 'Guide Minage Avancé — ROI et Optimisation',
    category: 'Industrie',
    difficulty: 'Difficile',
    readTime: 25,
    description: 'Maximisez votre retour sur investissement minier avec des stratégies d\'expert.',
    tags: ['minage', 'ROI', 'Prospector', 'MOLE', 'raffinerie', 'quantainium', 'optimisation'],
    content: [
      {
        section: 'Choisir son minéral',
        text: 'Le choix du minéral cible est la décision la plus importante. Bexalite (4 125 aUEC/SCU) et Quantainium (3 800 aUEC/SCU) sont les plus rentables mais aussi les plus rares. Laranite (1 500 aUEC/SCU) et Agricium (1 250 aUEC/SCU) sont plus communs et constituent une base stable. Évitez de perdre du temps sur l\'aluminium ou le titanium purs sauf en début de partie.',
      },
      {
        section: 'Zones de minage optimal',
        text: 'Pour le Bexalite : lune Lyria (Crusader) et ceintures de Pyro. Pour le Quantainium : ceinture d\'Aberdeen (Hurston) et lune Daymar. Pour l\'Agricium : lune Arial (Crusader). Les zones de ceinture d\'astéroïdes donnent généralement des roches plus riches que les surfaces planétaires, mais sont aussi plus fréquentées par les pirates.',
      },
      {
        section: 'Quantainium — risque et récompense',
        text: 'Le Quantainium offre le meilleur retour financier mais impose une pression temporelle : il explose dans votre soute en 8 à 15 minutes selon la quantité. Planifiez votre route de vente avant de commencer à miner. Vendez à HUR-L1 ou ARC-L1 sans détour. Une erreur de jugement peut vous coûter le vaisseau et 400 000 aUEC de cargaison.',
      },
      {
        section: 'Fracturation avancée',
        text: 'La technique de fracturation en "sous-roches" consiste à casser une grande roche riche en plusieurs morceaux, puis à miner les fragments les plus riches en laissant les pauvres. Utilisez des charges de fracturation (Helix, Pyro) pour les roches > 3 000 SCU. Le laser Arbor MH1 est le meilleur pour le contrôle de précision sur les roches instables.',
      },
      {
        section: 'Raffinerie vs revente directe',
        text: 'La raffinerie transforme votre minerai brut en minerai pur, augmentant sa valeur de 15 à 30%. Toutefois, le processus prend 30 minutes à 4 heures selon la quantité. Vente directe = liquidités immédiates, idéal pour le Quantainium ou si vous manquez de temps. Raffinez toujours les gros volumes de minerais stables (Bexalite, Laranite) pour maximiser le profit global.',
      },
      {
        section: 'ROC vs Prospector vs MOLE',
        text: 'ROC (rover de minage au sol) : 100% gratuit avec SQ42 ou très bon marché, parfait pour le minage de surface. Prospector : vaisseau solo rentabilisé en 10-15h de jeu, 32 SCU de cargaison. MOLE (3 joueurs) : triple la production, nécessite une organisation mais génère 1-2M aUEC/heure avec une bonne équipe. L\'Orion (5+ joueurs) est le vaisseau de minage industriel de haut niveau mais rarement vu en jeu régulier.',
      },
    ],
    author: 'MiningExpert_SC',
    lastUpdated: '2025-07-15',
    version: '4.0',
    helpful: 2134,
  },
  {
    id: 'guide-salvage-advanced',
    title: 'Guide Récupération d\'Épaves (Salvage) Avancé',
    category: 'Industrie',
    difficulty: 'Moyen',
    readTime: 20,
    description: 'Techniques avancées pour maximiser vos revenus de récupération d\'épaves.',
    tags: ['salvage', 'récupération', 'épaves', 'Vulture', 'Reclaimer', 'RMC'],
    content: [
      {
        section: 'Vulture vs Reclaimer',
        text: 'Le Drake Vulture est le choix optimal en solo : maniable, autonome, 16 SCU de cargaison et 2 bras de récupération. Le Reclaimer de Aegis est un colosse multi-équipage (5-6 joueurs) capable de démanteler des épaves entières de vaisseaux capitaux. Pour un rendement optimal solo, le Vulture rapporte 150 000 à 250 000 aUEC par heure avec de bonnes épaves.',
      },
      {
        section: 'Trouver les épaves',
        text: 'Les épaves générées par les missions de récupération sont les plus rentables et les plus fiables. En dehors des missions, scannez les zones de combat spatial (autour des zones contestées) — les restes de combats récents contiennent souvent des épaves fraîches encore riches. Les ceintures d\'astéroïdes de Yela et de l\'Anneau de Delamar ont une forte densité d\'épaves historiques.',
      },
      {
        section: 'Décapage de coque',
        text: 'Le décapage consiste à projeter le faisceau de récupération sur la coque et à maintenir une pression régulière. La jauge de récupération doit rester dans la zone verte — trop forte pression endommage inutilement les fragments et réduit le rendement en RMC. Les coques de vaisseaux militaires (Hornet, Gladiator) donnent des RMC de haute qualité et en plus grande quantité.',
      },
      {
        section: 'Intérieur d\'épave',
        text: 'Les épaves de moyen et grand gabarit peuvent être explorées en EVA. L\'intérieur contient du loot individuel : composants encore fonctionnels, armes, armures, caisses de données. Ces composants récupérés peuvent valoir bien plus que le simple RMC de la coque. Attention aux zones irradiées ou aux espaces non pressurisés — portez une combinaison complète.',
      },
      {
        section: 'Vendre le RMC',
        text: 'Le RMC (Recycled Material Composite) se vend entre 90 et 135 aUEC/SCU selon la station. Les meilleures stations d\'achat sont Orison (CRU-L5), Port Tressler (MIC-L1) et Baijini Point (ARC-L1). Les CS (Construction Supplies) valent environ 105 aUEC/SCU. Remplissez toujours complètement votre soute avant de rejoindre une station — chaque trajet représente un coût fixe de carburant.',
      },
    ],
    author: 'SalvagePro_FR',
    lastUpdated: '2025-08-20',
    version: '4.0',
    helpful: 1542,
  },
  {
    id: 'guide-trading-advanced',
    title: 'Commerce Avancé — Maximiser les Profits',
    category: 'Commerce',
    difficulty: 'Difficile',
    readTime: 22,
    description: 'Stratégies de commerce expert pour atteindre des profits de 500k+ aUEC par heure.',
    tags: ['commerce', 'trading', 'route', 'profit', 'cargo', 'inter-systèmes'],
    content: [
      {
        section: 'Lire les prix en temps réel',
        text: 'Les prix des marchandises fluctuent dynamiquement selon l\'offre et la demande des joueurs. Consultez les terminaux de trading dans chaque station avant d\'acheter — un prix peut changer de 20% en quelques minutes après un rush de joueurs. Des outils communautaires comme sc-trade.tools ou UEX Corporation référencent les prix actualisés en temps réel par les joueurs.',
      },
      {
        section: 'Meilleures routes Alpha 4.0',
        text: 'Route rentable 1 : Acheter de l\'Agricium à Arial (Crusader) → vendre à Baijini Point (ARC-L1), marge ~800 aUEC/SCU. Route 2 : WiDoW à Port Olisar illégal → vendre à Grim HEX, ~11 000 aUEC/SCU (risque élevé). Route 3 : Laranite de Lorville → New Babbage, ~600 aUEC/SCU stables. Pour un Hull C (6 000+ SCU) sur WiDoW, un seul trajet représente 60M+ aUEC.',
      },
      {
        section: 'Commerce inter-systèmes Pyro',
        text: 'Le commerce Stanton-Pyro est la frontière ultime du profit. Les marchandises légales manquantes à Pyro (matériaux médicaux, nourriture, carburant) se vendent 2-3x leur prix normal dans Pyro. En retour, les minerais de Pyro (Taranite, Hephaestanite) valent bien plus dans Stanton. Comptez 30 à 45 minutes par cycle aller-retour avec un Caterpillar.',
      },
      {
        section: 'Pyramiding cargo',
        text: 'Le pyramiding consiste à commencer avec un petit vaisseau (Aurora, Mustang), à capitaliser les profits dans un vaisseau plus grand, et ainsi de suite. Départ : Aurora MR (6 SCU) → 200k aUEC → Cutlass Black (46 SCU) → 1.5M → Freelancer MAX (66 SCU) → 5M → Constellation Taurus (174 SCU) → 20M → Hull C (6 000+ SCU). Ce cycle prend 3 à 4 semaines de jeu régulier.',
      },
      {
        section: 'Éviter la détection',
        text: 'Transporter des marchandises illégales expose à des scans aux check-points (zones UEE). Pour passer : désactivez votre transpondeur (donne CS1 mais réduit les scans), volez via des routes non surveillées (astéroïdes, zones basses), ou achetez un "laissez-passer" (pot-de-vin) auprès des factions Nine Tails pour 50 000 aUEC. À Pyro, aucun contrôle n\'existe mais les pirates sont omnipresents.',
      },
    ],
    author: 'TraderElite_SC',
    lastUpdated: '2025-10-01',
    version: '4.0',
    helpful: 2891,
  },
  {
    id: 'guide-pyro-survival',
    title: 'Survivre dans Pyro — Guide Complet',
    category: 'Survie',
    difficulty: 'Extrême',
    readTime: 30,
    description: 'Guide exhaustif pour naviguer et prospérer dans le système Pyro sans perdre vaisseau ni vie.',
    tags: ['pyro', 'survie', 'pirate', 'factions', 'stations', 'danger', 'jump point'],
    content: [
      {
        section: 'Pourquoi Pyro est dangereux',
        text: 'Pyro est le premier système sans contrôle UEE de Star Citizen. Aucune patrouille de sécurité, aucune zone de protection, et aucun frein à l\'agression PvP. En pratique, tout joueur rencontré est une menace potentielle. L\'étoile de Pyro est en phase de naine rouge instable et émet des éruptions solaires périodiques qui peuvent désactiver vos systèmes électroniques temporairement.',
      },
      {
        section: 'Vaisseaux recommandés pour Pyro',
        text: 'Évitez les vaisseaux cargo volumineux sans escorte — vous serez une cible prioritaire. Idéal pour la survie : Cutlass Black (bon équilibre cargo/combat), Drake Buccaneer (agressif, rapide), ou Constellation Andromeda (polyvalent). Si vous devez absolument transporter un gros cargo, un Caterpillar avec 2 chasseurs d\'escorte est le minimum raisonnable.',
      },
      {
        section: 'Les factions de Pyro',
        text: 'Trois factions majeures dominent Pyro : les Nine Tails (station Checkmate, Pyro II), les Dusters (Pyro III), et les Enos Pirates (ceintures de Pyro IV-V). Chaque faction contrôle des stations et des routes. Monter votre réputation avec une faction peut vous offrir une protection partielle dans leurs zones d\'influence, mais vous rendra ennemi des factions rivales.',
      },
      {
        section: 'Stations sûres vs dangereuses',
        text: 'Relativement sûres : Checkmate (Nine Tails, Pyro II — si réputation positive), Ruin Station (Pyro IV, neutre), Orbituary (Pyro I, souvent calme). Dangereuses : toute station sans faction établie, zones de transit proches du Jump Point, et les stations ouvertes dans les ceintures. Verrouillez toujours votre hangar quand vous stationnez.',
      },
      {
        section: 'Traverser le point de saut',
        text: 'Le Jump Point Stanton-Pyro est une zone d\'embuscade classique. Des joueurs y attendent en mode silencieux (moteurs coupés) pour interdire les voyageurs. Traversez rapidement, n\'attendez pas, et relancez votre QT immédiatement à la sortie. Privilégiez les traversées à faible trafic (nuit serveur, heures creuses de votre région).',
      },
      {
        section: 'Pirates et piraterie',
        text: 'Face à une interdiction en Pyro, vous avez trois options : combattre, fuir, ou négocier. Fuir est souvent la meilleure option si vous transportez de la valeur — la plupart des pirates cherchent du cargo, pas votre mort. Si vous négociez, proposez de "payer un péage" (50 000-100 000 aUEC). Les pirates sérieux préféreront ce profit rapide à un combat risqué. Ne donnez jamais votre position exacte en discutant.',
      },
    ],
    author: 'PyrroSurvivor_SC',
    lastUpdated: '2025-11-05',
    version: '4.0',
    helpful: 3241,
  },
  {
    id: 'guide-bounty-hunting-pro',
    title: 'Chasse à la Prime — Guide Professionnel',
    category: 'Combat',
    difficulty: 'Difficile',
    readTime: 22,
    description: 'Devenez un chasseur de primes professionnel et montez les rangs de la Guilde.',
    tags: ['prime', 'bounty hunting', 'chasse', 'interdiction', 'capture', 'primes joueurs'],
    content: [
      {
        section: 'Construire votre chasseur',
        text: 'Un bon chasseur de primes nécessite un vaisseau rapide avec capacité d\'interdiction QT. Le Guardian QI de Mirai est spécialement conçu pour ce rôle. Pour les primes terrestres, un Cutlass Black modifié avec espace passager permet de ramener des cibles vivantes. Budget recommandé avant de se lancer sérieusement : 2M aUEC pour vaisseau + équipement.',
      },
      {
        section: 'Primes légales T1-T5',
        text: 'Les primes légales (UEE) sont classées T1 à T5 selon la dangerosité et la valeur. T1-T2 : PNJ seuls, 15 000-50 000 aUEC, chasseur solo suffisant. T3 : PNJ avec acolytes, 50 000-150 000 aUEC, vaisseau robuste requis. T4-T5 : cibles de haut rang, parfois avec flotte, 150 000-500 000 aUEC, équipe recommandée. Montez dans les rangs progressivement — sauter les niveaux est une erreur fatale.',
      },
      {
        section: 'Primes joueurs',
        text: 'Les primes sur joueurs (joueurs avec CrimeStat élevé) sont les plus lucratives et les plus imprévisibles. Contrairement aux PNJ, les joueurs utilisent des tactiques réelles, se cachent, bluffent et appellent des renforts. Approchez les primes joueurs avec au moins un coéquipier. Avant d\'engager, vérifiez que la cible n\'est pas membre d\'une grande organisation qui pourrait contre-attaquer en force.',
      },
      {
        section: 'Équipement d\'interdiction QT',
        text: 'L\'interdiction quantique requiert soit le Guardian QI, soit un vaisseau équipé d\'un module d\'inhibition QD. Positionnez-vous sur la route quantique probable de la cible (entre deux points populaires). Activez l\'inhibiteur dès que la cible entre en portée. Vous avez 30 à 60 secondes pour l\'engager avant qu\'elle ne s\'échappe en vol normal.',
      },
      {
        section: 'La capture vs élimination',
        text: 'Capturer vivant rapporte 50 à 100% de prime supplémentaire. Technique de capture : abattez les propulseurs de la cible (pas le réacteur), approchez en EVA, utilisez un multi-tool avec embout tractor ou grenades flashbang pour immobiliser, puis enchaînez et ramenez à une station Advocacy. L\'élimination est plus simple mais moins rentable — reservez-la aux cibles T5 trop dangereuses à capturer.',
      },
      {
        section: 'Gérer les acolytes',
        text: 'Les primes T3 et supérieures viennent avec des escortes PNJ ou joueurs. Traitez les acolytes en priorité avant la cible principale — l\'ignorer entraîne des tirs croisés fatals. Utilisez des missiles pour ouvrir l\'engagement sur les acolytes et des canons de précision sur la cible principale. Si les acolytes sont trop nombreux, décrochez et attendez que la cible se sépare de son escorte.',
      },
    ],
    author: 'BountyMaster_Pro',
    lastUpdated: '2025-09-25',
    version: '4.0',
    helpful: 1987,
  },
  {
    id: 'guide-hauling',
    title: 'Transport de Cargo — Guide Complet',
    category: 'Commerce',
    difficulty: 'Moyen',
    readTime: 20,
    description: 'Maîtrisez le transport de cargo pour des revenus stables et progressifs.',
    tags: ['cargo', 'hauling', 'transport', 'Hull Series', 'sécurité', 'routes'],
    content: [
      {
        section: 'Choisir son vaisseau cargo',
        text: 'Pour débuter le hauling : Aurora CL (6 SCU, gratuit/inclus), Freelancer (66 SCU, excellent ratio coût/capacité). Niveau intermédiaire : Constellation Taurus (174 SCU), Caterpillar (576 SCU). Niveau avancé : Hull C (4 608 SCU), Hercules C2 (696 SCU). Notez que les Hull Series nécessitent de charger en station (pas de chargement manuel) et sont vulnérables en transit — leur cargaison est visible depuis l\'extérieur.',
      },
      {
        section: 'Routes populaires 4.0',
        text: 'Route débutant : Lorville (Hurston) → Port Tressler (MicroTech), charge de médicaux ou composants, ~450 aUEC/SCU de marge. Route intermédiaire : ARC-L1 → Grim HEX (illégal), alcool et Neon, ~800 aUEC/SCU. Route avancée : Orison → Pyro (Checkmate), matériaux médicaux premium, ~1 200 aUEC/SCU mais risque de piraterie élevé.',
      },
      {
        section: 'Sécuriser sa cargaison',
        text: 'L\'assurance vaisseau ne couvre pas la cargaison en cas de destruction — une perte sur un Hull C plein peut représenter 50M aUEC perdus. Pour les gros transports, volez toujours avec une escorte. Dans les zones Stanton, les pirates PNJ sont prévisibles ; dans Pyro, préparez-vous à des interdictions joueurs. Variez vos routes pour ne pas être prévisible.',
      },
      {
        section: 'Hull Series — guide spécifique',
        text: 'Les vaisseaux Hull (Hull A à Hull E) de MISC sont des spécialistes du transport volumineux. Le Hull C (4 608 SCU) est le plus populaire. Particularité : la cargaison est fixée sur des bras extérieurs, rendant le vaisseau plus lent et vulnérable. Chargez uniquement dans des stations équipées (pas de villes planétaires). En transit, évitez absolument les zones de combat — un Hull C lourdement chargé ne peut pas manoeuvrer.',
      },
      {
        section: 'Escorte ou solo',
        text: 'Solo sous 200 SCU dans Stanton : risque gérable avec quelques contre-mesures et un QT rapide. Au-delà de 200 SCU ou dans Pyro : une escorte de 2 chasseurs minimum est fortement recommandée. L\'escorte peut être rémunérée (10-15% de la valeur du chargement) ou réciproque avec des amis. Les grandes organisations offrent souvent des services d\'escorte en échange d\'une part des profits.',
      },
    ],
    author: 'CargoKing_SC',
    lastUpdated: '2025-08-30',
    version: '4.0',
    helpful: 1654,
  },
  {
    id: 'guide-medical',
    title: 'Guide Gameplay Médical — Médecin de Combat',
    category: 'Service',
    difficulty: 'Moyen',
    readTime: 15,
    description: 'Jouez le rôle vital de médecin de combat et gagnez des aUEC en sauvant des vies.',
    tags: ['médecine', 'médecin', 'vaisseau médical', 'medpen', 'sauvetage', 'combat'],
    content: [
      {
        section: 'Rôle du médecin',
        text: 'Le médecin de combat est l\'un des rôles les plus demandés en multi-joueurs. Votre mission : stabiliser les joueurs abattus avant qu\'ils ne meurent définitivement (perma-death de personnage), les transporter vers une installation médicale et assurer le suivi post-combat. En échange, les joueurs sauvés paient une rémunération ou votre organisation vous rétribue.',
      },
      {
        section: 'Vaisseaux médicaux',
        text: 'Le Cutlass Red est le vaisseau médical d\'entrée de gamme, accessible et maniable. L\'Argo MOLE Medical est compact pour les équipes réduites. Pour les opérations de plus grande envergure : le RSI Constellation Phoenix dispose d\'une suite médicale complète. L\'Ajax Medical et le Carrack Medical sont les options premium pour les équipes organisées.',
      },
      {
        section: 'Medpens et équipement',
        text: 'Portez toujours ces trois medpens : Hemozal (saignement critique), Stims (remonte la résistance), et Demexatrine (réanime un personnage inconscient). Le Medgun (outil médical à distance) permet de soigner sans s\'exposer au feu ennemi. Un kit de défibrillateur est obligatoire pour ranimer — sans lui, le joueur abattu meurt et doit respawn.',
      },
      {
        section: 'Sauvetage en zone de combat',
        text: 'En zone de combat, attendez un accalmie avant d\'approcher un joueur abattu — les ennemis ciblent souvent le médecin en priorité. Approchez en courant, injectez Hemozal (stabilise), puis Demexatrine (réanime). Si l\'extraction est impossible, appelez votre vaisseau médical pour atterrir à proximité. Chaque seconde compte — une victime non traitée en 5 minutes décède définitivement.',
      },
      {
        section: 'Gagner de l\'aUEC en médecine',
        text: 'Les contrats de sauvetage médical générés par le jeu rapportent 15 000 à 45 000 aUEC par sauvetage réussi. Les organisations paient souvent leurs médecins en pourcentage des gains de la mission (typiquement 10-20%). En Pyro, la demande de médecins est si élevée que certains joueurs paient 50 000 à 100 000 aUEC pour un sauvetage d\'urgence. C\'est un rôle de niche mais extrêmement valorisé.',
      },
      {
        section: 'Nouveau en 4.5-4.6 — Réanimation et rôles',
        text: 'Depuis Alpha 4.5, le rôle de médecin est intégré au système d\'Engineering multi-crew. Un médic dédié peut gérer la baie médicale du vaisseau pendant que l\'équipe combat. En 4.6, les missions de sauvetage médical en Pyro paient jusqu\'à 120 000 aUEC pour un sauvetage critique hors station. L\'Ajax Medical (4.5) est désormais le vaisseau médical recommandé pour les équipes de 2-3 personnes.',
      },
    ],
    author: 'MedCorps_SC',
    lastUpdated: '2026-02-15',
    version: '4.6',
    helpful: 1423,
  },
  {
    id: 'guide-engineering-systems',
    title: 'Ingénierie de Vaisseau — Alpha 4.6',
    category: 'Technique',
    difficulty: 'Difficile',
    readTime: 25,
    description: 'Maîtrisez les systèmes d\'ingénierie pour maintenir votre vaisseau en parfait état de combat. Mis à jour pour Alpha 4.6.',
    tags: ['engineering', 'ingénierie', 'systèmes', 'réparation', 'puissance', 'composants'],
    content: [
      {
        section: 'Système d\'ingénierie',
        text: 'Alpha 4.0 introduit une gestion avancée des systèmes de vaisseau via le panneau MFD Engineering. Chaque composant (moteurs, boucliers, armes, refroidisseurs) a une santé, une température et un niveau d\'efficacité en temps réel. L\'ingénieur doit surveiller ces paramètres et intervenir physiquement dans la salle des machines pour des réparations manuelles.',
      },
      {
        section: 'Gestion de puissance',
        text: 'Le générateur de puissance alimente tous les systèmes. Un overdraft (trop de consommation) force un shutdown de certains composants. Priorités recommandées : 1. Propulsion (survie), 2. Boucliers (défense), 3. Armes (attaque), 4. Systèmes secondaires. Gérez via le triangle de puissance (Alt+1/2/3) et le panneau dédié dans la salle des machines.',
      },
      {
        section: 'Réparer en vol',
        text: 'Lors d\'une réparation en vol, l\'ingénieur se déplace physiquement dans le vaisseau jusqu\'au composant endommagé. Utilisez un Repair Kit (consommable) pour restaurer les dégâts physiques. Une réparation de bouclier S3 prend environ 20 secondes, un moteur principal 40-60 secondes selon la sévérité des dégâts. Communiquez avec le pilote en permanence pour qu\'il évite les manœuvres brutales pendant votre intervention.',
      },
      {
        section: 'Composants critiques',
        text: 'Les trois composants les plus importants à prioriser en réparation : (1) Power Plant — si endommagé, tout le vaisseau devient inopérant rapidement. (2) Main Thrusters — perdre les propulseurs principaux en combat signifie la mort. (3) Shields — un bouclier à 0% expose directement la coque. Les armes peuvent attendre — un vaisseau vivant sans tirer vaut mieux qu\'un vaisseau détruit en tirant.',
      },
      {
        section: 'Travailler en équipe',
        text: 'Sur les vaisseaux moyens à grands (Constellation, Caterpillar, Carrack), l\'équipage idéal inclut au moins un ingénieur dédié. L\'ingénieur annonce les dégâts critiques via voice chat, le pilote adapte ses manœuvres, les gunners gèrent leur propre chaleur d\'armes. En Pyro avec un grand vaisseau, un ingénieur compétent multiplie par deux la survie de l\'équipage lors d\'embuscades.',
      },
    ],
    author: 'ChiefEngineer_SC',
    lastUpdated: '2026-03-01',
    version: '4.6',
    helpful: 1789,
  },
  {
    id: 'guide-stealth',
    title: 'Vols Furtifs et Contrebande',
    category: 'Criminel',
    difficulty: 'Difficile',
    readTime: 18,
    description: 'Maîtrisez la furtivité pour passer les checkpoints et livrer votre contrebande sans encombre.',
    tags: ['furtivité', 'stealth', 'contrebande', 'transpondeur', 'scan', 'illégal'],
    content: [
      {
        section: 'Vaisseaux à faible signature',
        text: 'Les vaisseaux furtifs réduisent leur émission électromagnétique (EM) et infrarouge (IR) pour éviter la détection radar. Le Drake Cutlass Stealth et la variante Sabre Raven sont les plus populaires. La clé : des coolers "Stealth" (Inktblot, Shadow), un QDrive Drift ou Expedition, et un Power Plant minimal. Un vaisseau furtif correctement équipé peut s\'approcher à 2 km d\'une patrouille sans être détecté.',
      },
      {
        section: 'Désactiver le transpondeur',
        text: 'Désactiver votre transpondeur (menu vaisseau, onglet systems) vous rend non identifiable sur les radars UEE. Inconvénient : cette action elle-même est illégale (CS1 instantané) dans les zones UEE. Avantage : sans transpondeur actif, les scans automatiques des check-points ne peuvent pas identifier votre cargaison. C\'est le premier geste de tout contrebandier sérieux avant d\'entrer en Pyro.',
      },
      {
        section: 'Routes non surveillées',
        text: 'Les routes non surveillées évitent les check-points automatiques. En pratique : volez en dessous ou au-dessus de l\'écliptique, utilisez les ceintures d\'astéroïdes comme couverture radar, et transitez via des lunes peu fréquentées. La route Hurston → Pyro via Daymar et la ceinture d\'Aberdeen est une route de contrebande classique avec très peu de patrouilles.',
      },
      {
        section: 'Passer les scans',
        text: 'Si vous êtes scanné et portez de la contrebande, trois options : (1) Fuir immédiatement — provoque une poursuite mais souvent récupérable dans un vaisseau rapide. (2) Jeter la cargaison illégale dans l\'espace (F > cargo > jeter) avant que le scan ne complète. (3) Accepter le scan et espérer — les scanners NPC ont un taux de détection de 70-85% sur les marchandises illégales standard.',
      },
      {
        section: 'Revendre illégalement',
        text: 'Les marchandises illégales (drogues, armes non déclarées, données volées) ne se vendent que dans des stations criminelles. Dans Stanton : GrimHEX (Yela), stations illégales de la ceinture. Dans Pyro : Checkmate, Ruin Station, Orbituary. Les prix fluctuent selon l\'offre locale — un marché saturé paye 30-50% moins. Attendez plusieurs heures entre les livraisons pour maximiser le prix.',
      },
    ],
    author: 'ShadowRunner_SC',
    lastUpdated: '2025-09-15',
    version: '4.0',
    helpful: 2156,
  },
  {
    id: 'guide-exploration-poi',
    title: 'Exploration Spatiale — Points d\'Intérêt',
    category: 'Exploration',
    difficulty: 'Moyen',
    readTime: 20,
    description: 'Découvrez les secrets de l\'univers et exploitez les points d\'intérêt pour profit et aventure.',
    tags: ['exploration', 'points d\'intérêt', 'épaves', 'artefacts', 'jump point', 'scanner'],
    content: [
      {
        section: 'Scanner efficacement',
        text: 'Le scan actif (maintien de V) envoie une impulsion sphérique qui révèle toutes les signatures dans votre rayon. Chaque vaisseau d\'exploration a un équipement de scan différent — le Terrapin excelle en scan défensif, le Herald en scan offensif rapide. Alternez scan passif (détection silencieuse) et actif (portée étendue) pour ne pas révéler votre position inutilement.',
      },
      {
        section: 'Épaves dérelictes',
        text: 'Les épaves dérelictes procédurales contiennent du loot aléatoire : composants de vaisseau, armes et armures FPS, caisses de données commerciales. Les épaves de grands vaisseaux (croiseurs, frégattes) ont les meilleurs loots mais sont aussi plus défendues par des bots de sécurité autonomes. Approchez en EVA silencieux, déactivez votre EM avant d\'entrer dans une épave gardée.',
      },
      {
        section: 'Points de saut',
        text: 'Les Jump Points (points de saut inter-systèmes) sont des phénomènes physiques naturels exploitables pour voyager entre systèmes. Actuellement opérationnel : Stanton-Pyro. D\'autres points de saut vers Nyx, Magnus, et Terra sont dans les données de jeu mais non encore accessibles au public. Les explorateurs qui découvriront ces points en jeu recevront des récompenses de découverte uniques.',
      },
      {
        section: 'Jump Point Pyro — navigation interne',
        text: 'Le Jump Point Stanton-Pyro n\'est pas un simple portail instantané — c\'est un tunnel spatial qui dure 2 à 5 minutes de traversée. Des "obstacles de densité" à l\'intérieur peuvent endommager votre vaisseau si vous les heurtez. Volez au centre du tunnel, réduisez la vitesse à 50 m/s et évitez les zones rouges indiquées sur le HUD. Un Terrapin ou un Prospector bien blindé traverse sans dommage.',
      },
      {
        section: 'Trouver des artefacts',
        text: 'Les artefacts et données de civilisations anciennes (Vanduul, Xi\'an, anciens humains) constituent l\'objectif ultime des explorateurs. Ces items n\'ont pas de marqueur — ils nécessitent un scan à moins de 500m pour être détectés. Les zones archéologiques sont indiquées par des patterns de signature EM inhabituels. Les artefacts se vendent aux factions scientifiques pour des sommes importantes et des bonus de réputation.',
      },
    ],
    author: 'Pathfinder_SC',
    lastUpdated: '2025-08-10',
    version: '4.0',
    helpful: 1367,
  },
  {
    id: 'guide-multicrew',
    title: 'Jouer en Équipe — Guide Multi-Crew',
    category: 'Stratégie',
    difficulty: 'Moyen',
    readTime: 18,
    description: 'Optimisez votre expérience multi-équipage pour décupler l\'efficacité de votre groupe.',
    tags: ['multi-crew', 'équipe', 'rôles', 'organisation', 'grands vaisseaux', 'communication'],
    content: [
      {
        section: 'Rôles à bord',
        text: 'Un équipage efficace distribue clairement les rôles : Pilote (navigation et maniabilité), Gunners (tourelles et missiles), Ingénieur (systèmes et réparations), Médecin (soin de l\'équipage), Opérateur radar (scan et information). Sur un Caterpillar, l\'équipage idéal est de 4 : 1 pilote, 2 gunners, 1 ingénieur. Sur un Hammerhead, comptez 7 : 1 pilote, 5 gunners, 1 commandant.',
      },
      {
        section: 'Communication',
        text: 'La communication est la compétence la plus importante en multi-crew. Utilisez des appels courts et clairs : "Missile entrant 3h", "Bouclier arrière à 20%", "Moteur bâbord en feu". Désignez un commandant de combat qui coordonne les priorités. Discord en voice chat ou le système VOIP intégré de Star Citizen sont tous deux efficaces — les équipages expérimentés utilisent les deux.',
      },
      {
        section: 'Grands vaisseaux recommandés',
        text: 'Entrée multi-crew : Constellation Andromeda (4 joueurs), Cutlass Black (2-3 joueurs), Freelancer MIS (2 joueurs). Niveau intermédiaire : Caterpillar cargo (4-6), Carrack exploration (6), Retaliator bomber (4). Niveau avancé : Hammerhead combat (7), Idris (20+), Bengal (50+, org de haut niveau seulement). Commencez par le Caterpillar ou le Carrack pour bâtir vos habitudes d\'équipage.',
      },
      {
        section: 'Synergies de rôles',
        text: 'Synergies puissantes : Pilote furtif + Gunners précis = frappe chirurgicale. Ingénieur expérimenté + Pilote agressif = combat prolongé possible. Médecin mobile + Équipe de sol = survie maximale en zones contestées. Opérateur radar + Interdicteur = embuscades sur routes commerciales. La synergie la plus sous-estimée : l\'ingénieur actif, qui peut doubler la durée de vie du vaisseau en combat.',
      },
      {
        section: 'Où trouver un équipage',
        text: 'Les meilleures sources : Star Citizen Discord officiel (canal LFG), Spectrum (forums officiels RSI), Reddit r/starcitizen LFG, et les sous-canaux de votre serveur national. Les organisations (Orgs) sont la solution à long terme : rejoindre une org active vous garantit des partenaires réguliers, des opérations coordonnées et souvent un accès à des flottes que vous ne pourriez pas vous offrir seul.',
      },
    ],
    author: 'CrewCommander_SC',
    lastUpdated: '2025-09-05',
    version: '4.0',
    helpful: 1732,
  },
  {
    id: 'guide-economy',
    title: 'Économie de Star Citizen — Tout Comprendre',
    category: 'Commerce',
    difficulty: 'Débutant',
    readTime: 15,
    description: 'Comprenez le système économique de Star Citizen pour prendre les meilleures décisions financières.',
    tags: ['économie', 'aUEC', 'UEC', 'prix', 'inflation', 'taxes', 'crédits'],
    content: [
      {
        section: 'aUEC vs UEC',
        text: 'L\'aUEC (alpha United Earth Credits) est la monnaie de jeu pendant la phase alpha. Elle se reset périodiquement lors des grandes mises à jour. L\'UEC (non-alpha) sera la monnaie permanente au lancement officiel du jeu. Les crédits achetés en argent réel (Star Citizen Store) ne sont pas la même chose — ils servent uniquement à acheter des vaisseaux et cosmétiques, pas à acheter en jeu.',
      },
      {
        section: 'Gagner ses premiers crédits',
        text: 'Les missions de livraison de colis (boîtes) sont le moyen le plus sûr pour débuter : 5 000 à 15 000 aUEC par mission, sans risque de perte. Le minage ROC en surface (rover gratuit au sol) donne 50 000 à 100 000 aUEC/heure pour un débutant. Les missions de bounty T1 rapportent 15 000 à 25 000 aUEC chacune avec un vaisseau de départ. Visez 500 000 aUEC avant d\'investir dans du matériel.',
      },
      {
        section: 'Inflation et prix dynamiques',
        text: 'Les prix en jeu sont partiellement dynamiques — si tous les joueurs achètent le même minerai à la même station, le prix baisse. Star Citizen vise à terme un marché entièrement piloté par l\'offre et la demande. Actuellement, certains prix sont "plafonnés" par le système pour éviter l\'effondrement économique. Les prix des marchandises illégales fluctuent plus fortement que les légales.',
      },
      {
        section: 'Taxes et frais',
        text: 'Chaque transaction commerciale inclut des frais : taxe de vente (2-5% selon la zone), frais d\'amarrage (hangar : 1 000-10 000 aUEC/session selon la taille du vaisseau), frais de raffinage (10-15% de la valeur du minerai). Les organisations ont accès à des réductions fiscales. Les zones illégales (GrimHEX, Pyro) ont des frais d\'amarrage plus élevés mais pas de taxe de vente.',
      },
      {
        section: 'Investir dans sa flotte',
        text: 'Règle d\'or : n\'achetez un vaisseau que si vous avez 2x son prix en réserve (pour vous remettre d\'une perte éventuelle). Progression recommandée : Aurora → Cutlass Black (1M aUEC) → Constellation Taurus (4M) → Caterpillar (8M) → Hull C (15M). Chaque vaisseau multiplie votre capacité de gain. Un Hull C bien utilisé peut générer ses frais d\'achat en 10-15 heures de commerce actif.',
      },
    ],
    author: 'EcoAnalyst_SC',
    lastUpdated: '2025-06-10',
    version: '4.0',
    helpful: 2043,
  },
  {
    id: 'guide-klescher',
    title: 'Klescher — Guide Prison et Évasion',
    category: 'Criminel',
    difficulty: 'Difficile',
    readTime: 20,
    description: 'Survivez à la prison de Klescher et découvrez comment purger votre peine ou vous évader.',
    tags: ['klescher', 'prison', 'évasion', 'CrimeStat', 'Aberdeen', 'hadanite', 'missions prison'],
    content: [
      {
        section: 'Comment atterrir en prison',
        text: 'Vous êtes envoyé à Klescher Rehabilitation Facility (lune Aberdeen, Hurston) quand votre CrimeStat atteint CS3 et que vous êtes capturé vivant par les forces UEE ou un chasseur de primes. La capture peut survenir lors d\'un combat perdu ou d\'une reddition volontaire (self-surrender). La durée de peine varie de 15 minutes (CS3) à plus d\'une heure (CS5).',
      },
      {
        section: 'La vie à Klescher',
        text: 'Klescher est une installation minière carcérale sur Aberdeen. Les détenus portent une combinaison orange distinctive et n\'ont accès qu\'au matériel de prison. Des gardes NPC patrouillent en permanence — attaquer un garde allonge considérablement votre peine. Une cantine, une zone de repos et des terminaux de mission internes sont accessibles.',
      },
      {
        section: 'Missions de prison',
        text: 'Deux types de missions en prison : (1) Minage de gemmes — collectez Hadanite ou Dolivine avec le ROC fourni dans les tunnels souterrains. Ces gemmes se revendent après libération. (2) Courses de données — ramenez des cartouches de données d\'un point A à un point B dans l\'installation. Les deux rapportent des "prison credits" échangeables en équipement utile.',
      },
      {
        section: 'Purger sa peine vs s\'évader',
        text: 'Purger honnêtement : faites des missions, passez le temps, votre CrimeStat est effacé à la libération. Simple et sans risque. S\'évader : un tunnel secret caché dans les niveaux inférieurs des mines mène à un point d\'extraction à la surface. L\'évasion nécessite un complice en orbite avec un vaisseau. Si vous êtes repris pendant l\'évasion, votre peine est multipliée par 3.',
      },
      {
        section: 'Effacer son CrimeStat',
        text: 'Klescher n\'est qu\'une méthode parmi d\'autres pour effacer son CrimeStat. Alternatives : terminals d\'effacement criminel dans les stations illégales (GrimHEX : 250 000 aUEC pour CS3, Pyro : moins cher), amende légale à l\'Advocacy (CS1-2 seulement, 50 000-150 000 aUEC). Après effacement, votre CrimeStat redémarre à 0 — évitez de vous faire reprendre rapidement.',
      },
    ],
    author: 'JailbreakPro_SC',
    lastUpdated: '2025-10-20',
    version: '4.0',
    helpful: 1843,
  },
  {
    id: 'guide-racing',
    title: 'Courses Spatiales et Courses au Sol',
    category: 'Sport',
    difficulty: 'Facile',
    readTime: 12,
    description: 'Participez aux courses de Star Citizen pour gagner des crédits et des titres de gloire.',
    tags: ['course', 'racing', 'Razor', 'Murray Cup', 'circuits', 'vitesse', 'sport'],
    content: [
      {
        section: 'Vaisseaux de course',
        text: 'Les vaisseaux de course spécialisés surpassent tous les autres en vitesse pure. Le Origin 350R est la référence en course légère avec 1 275 m/s en sprint. Le MISC Razor est le roi de la vitesse de pointe grâce à sa conception aérodynamique unique. Pour les débutants : le Mustang Alpha ou l\'Aurora MR permettent d\'apprendre les circuits avant d\'investir dans un racer dédié.',
      },
      {
        section: 'Circuits disponibles',
        text: 'Les circuits officiels de Star Citizen : Murray Cup (Daymar, vitesse pure), Rikkord Memorial Race (Yela, obstacles et précision), Defford Circuit (ArcCorp, course en environnement urbain). Des courses informelles se tiennent aussi dans les tunnels de GrimHEX et les couloirs des grandes stations pour les amateurs de courses illégales à prix non officiels.',
      },
      {
        section: 'Prix et récompenses',
        text: 'Les courses officielles rapportent entre 25 000 et 150 000 aUEC pour une victoire selon la difficulté et le niveau du tournoi. En plus des crédits, les vainqueurs reçoivent des titres cosmétiques, des livrées de vaisseau exclusives et des points de réputation avec les sponsors (fabricants de vaisseaux). Les paris entre joueurs en courses libres peuvent atteindre des millions d\'aUEC.',
      },
      {
        section: 'Optimiser ses performances',
        text: 'L\'optimisation d\'un racer passe par : des propulseurs de manœuvre de Grade A améliorés pour les virages, un Power Plant haute performance pour maintenir les post-brûleurs plus longtemps, et un refroidisseur Stealth pour éviter la surchauffe en sprint. Apprenez chaque circuit par cœur — les derniers dixièmes de seconde se gagnent en mémorisant les trajectoires optimales de chaque virage.',
      },
    ],
    author: 'RacingPilot_SC',
    lastUpdated: '2025-05-25',
    version: '4.0',
    helpful: 1289,
  },
  {
    id: 'guide-ship-components-optimization',
    title: 'Composants de Vaisseau — Guide d\'Optimisation',
    category: 'Technique',
    difficulty: 'Difficile',
    readTime: 28,
    description: 'Optimisez chaque composant de votre vaisseau pour une performance maximale en combat et exploration.',
    tags: ['composants', 'optimisation', 'boucliers', 'propulseurs', 'armes', 'refroidissement', 'loadout'],
    content: [
      {
        section: 'Boucliers',
        text: 'Les boucliers sont le premier rempart contre les dégâts. Classement par usage : Combat intense → INK Nova S3 (meilleur rapport absorption/recharge), Combat polyvalent → Phalanx S2 (équilibré), Furtivité → Mirage S1 (signature IR basse). La résistance selon les types de dégâts (énergie vs balistique) varie — le Bracer absorbe 60% mieux les dégâts balistiques que le Mirage.',
      },
      {
        section: 'Propulseurs',
        text: 'Les propulseurs principaux déterminent votre vitesse de croisière, les propulseurs de manœuvre votre agilité en combat. Pour le combat : Voyage Boosted (vitesse SCM élevée), pour l\'exploration : Quantum Fuel Efficient (consommation réduite). Le TR grade A (thruster rating) le plus élevé possible est prioritaire pour les rôles de combat — même une amélioration TR2 → TR3 augmente l\'agilité de 20-30%.',
      },
      {
        section: 'Armes',
        text: 'Chaque type d\'arme cible une faiblesse différente : Laser Cannons → boucliers, Distortion Cannons → électronique, Ballistic Cannons → coques non blindées, Neutron Cannons → coques et boucliers combiné. Le meilleur loadout combat général est un mix 50% laser / 50% balistique pour s\'adapter à tout type d\'ennemi. Les armes de plus grande taille font exponentiellement plus de dégâts — passez en S3 dès que votre vaisseau le permet.',
      },
      {
        section: 'Refroidissement',
        text: 'Un refroidisseur insuffisant cause la surchauffe, puis le shutdown forcé de vos composants en plein combat. Pour les builds combat : Brazen Cooler (performance maximale). Pour les builds furtifs : Inktblot ou Shadow (signature IR minimale). Un seul cooler de qualité inférieure peut limiter toute la performance de votre vaisseau — c\'est souvent le composant le plus négligé.',
      },
      {
        section: 'Où acheter les meilleurs composants',
        text: 'Composants militaires haut de gamme : Dumper\'s Depot (Area18, Lorville), HUR-L2 Black Market (composants illégaux). Composants de performance : Admin Office de l\'Advocacy, Skutters (Area18). Composants furtifs : illégaux, disponibles à GrimHEX ou Ruin Station (Pyro). Pour les composants les plus rares (Grade A militaire), les missions de zones contestées droppent parfois des pièces impossibles à trouver en magasin.',
      },
    ],
    author: 'ComponentsGuru_SC',
    lastUpdated: '2025-11-10',
    version: '4.0',
    helpful: 2287,
  },
  {
    id: 'guide-lorville',
    title: 'Lorville et Hurston — Guide Local',
    category: 'Découverte',
    difficulty: 'Facile',
    readTime: 12,
    description: 'Explorez Lorville et la planète Hurston pour tirer le meilleur de cette zone industrielle.',
    tags: ['Lorville', 'Hurston', 'débutant', 'guide local', 'missions', 'HDMS', 'atmosphère'],
    content: [
      {
        section: 'Naviguer dans Lorville',
        text: 'Lorville est la grande cité industrielle de Hurston Dynamics, accessible depuis l\'espace par les pads d\'atterrissage extérieurs. En ville, le monorail HDAR relie les districts (Gate District, Labor District, Teasa Spaceport). Le personal transport (taxi automatisé) est disponible pour se déplacer rapidement. Les zones résidentielles et commerciales sont séparées des zones industrielles restreintes.',
      },
      {
        section: 'Commerces et services',
        text: 'Lorville offre tout ce dont un joueur a besoin : Dumper\'s Depot (équipements et composants), Casaba Outlet (vêtements et cosmétiques), Central Medical (médecins et soins), Klescher Armory (armes et munitions), Cousin Crows (armes personnelles). Le terminal de commodity au Teasa Spaceport liste tous les prix d\'achat et de vente de Hurston et des lunes environnantes.',
      },
      {
        section: 'Missions Hurston',
        text: 'Hurston Dynamics propose des missions industrielles et de sécurité. Les missions de protection d\'avant-postes sont bien rémunérées (25 000-80 000 aUEC) et accessibles même aux débutants. Les contrats de récupération de données dans les installations criminelles de Hurston rapportent 15 000-40 000 aUEC. Montez votre réputation avec Hurston Dynamics pour débloquer des missions VIP et des équipements exclusifs.',
      },
      {
        section: 'HDMS — avant-postes Hurston',
        text: 'Les HDMS (Hurston Dynamics Mining Stations) sont des avant-postes dispersés sur les lunes de Hurston. Chacun offre des services de base (carburant, armes légères, ravitaillement). Ils sont aussi des points de mission fréquents — delivery runs entre HDMS, missions de protection et de collecte de données. Les HDMS sur Arial et Aberdeen sont les plus fréquentés en raison des ressources minières environnantes.',
      },
      {
        section: 'Atmosphère toxique',
        text: 'Hurston possède une atmosphère polluée et partiellement toxique à sa surface en dehors des zones pressurisées. Sans combinaison adaptée ou vaisseau étanche, votre personnage subit des dégâts progressifs à l\'extérieur. Portez toujours un casque ou une combinaison complète en EVA sur Hurston. Les HDMS ont des sas de décompression — attendez la pressurisation complète avant de retirer votre équipement.',
      },
    ],
    author: 'LorvilleLocal_SC',
    lastUpdated: '2025-04-15',
    version: '4.0',
    helpful: 1234,
  },
  {
    id: 'guide-new-player-money',
    title: 'Gagner ses Premiers Millions aUEC',
    category: 'Commerce',
    difficulty: 'Débutant',
    readTime: 15,
    description: 'Guide de progression financière optimisé pour les nouveaux joueurs jusqu\'à 1M aUEC.',
    tags: ['débutant', 'argent', 'aUEC', 'livraisons', 'minage', 'bounty', 'progression'],
    content: [
      {
        section: 'Objectif 1M aUEC',
        text: 'Un million d\'aUEC est le seuil de confort pour un nouveau joueur : il permet d\'acheter un bon vaisseau de travail (Cutlass Black ou Prospector) et d\'avoir suffisamment de réserves pour absorber une perte. Avec les méthodes ci-dessous, ce million est atteignable en 8 à 15 heures de jeu selon votre efficacité.',
      },
      {
        section: 'Livraisons empilées',
        text: 'Les missions de livraison de colis se "stackent" — acceptez 3 à 5 missions simultanément qui partagent la même destination ou des destinations proches. Un run de 5 livraisons peut rapporter 50 000 à 75 000 aUEC en 20-30 minutes. Partez depuis Lorville vers New Babbage ou Area18 avec plusieurs boîtes empilées dans votre vaisseau.',
      },
      {
        section: 'Minage solo Prospector',
        text: 'Une fois à 1.5M aUEC, louez ou achetez un Prospector. Le minage de Quantainium sur Daymar ou Aberdeen rapporte 300 000 à 500 000 aUEC par heure. Commencez par le Bexalite (stable, pas de timer d\'explosion) pour apprendre les bases. La progression est rapide : 5 heures de minage Prospector rentabilisent l\'achat du vaisseau.',
      },
      {
        section: 'Missions de bounty T1-T2',
        text: 'Les missions bounty tier 1 (PNJ solitaires, chasseur léger) sont idéales pour les débutants avec un Aurora ou Mustang. Elles rapportent 15 000 à 30 000 aUEC chacune, soit 100 000 à 150 000 aUEC par heure avec un peu d\'efficacité. Montez progressivement vers T2 (40 000-80 000 aUEC) dès que vous maîtrisez le combat de base.',
      },
      {
        section: 'Progression naturelle',
        text: 'Progression optimale : Jours 1-2 → livraisons (0-500k aUEC). Jours 3-5 → bounty T1-T2 (500k-2M). Semaine 2 → minage Prospector (2M-10M). Semaine 3+ → trading cargo (10M+). Ne brûlez pas les étapes — chaque phase développe des compétences essentielles pour la suivante. Les joueurs qui sautent directement au gros cargo sans expérience perdent souvent tout à leur premier voyage.',
      },
    ],
    author: 'StarterGuide_SC',
    lastUpdated: '2025-07-01',
    version: '4.0',
    helpful: 3124,
  },
  {
    id: 'guide-weapon-loadout',
    title: 'Équipement FPS Optimal — Chaque Situation',
    category: 'Combat',
    difficulty: 'Moyen',
    readTime: 20,
    description: 'Les meilleurs loadouts FPS pour chaque type de combat dans Star Citizen.',
    tags: ['FPS', 'loadout', 'armes', 'armure', 'CQC', 'longue distance', 'médical'],
    content: [
      {
        section: 'Armes de départ recommandées',
        text: 'Pour commencer sans budget : le Gemini L86 LMG (accessible, polyvalent) ou le Klaus & Werner Lumin V (pistolet précis en longue distance). Ces deux armes coûtent moins de 10 000 aUEC ensemble et couvrent la majorité des situations. Le P4-AR (assault rifle) est la meilleure arme polyvalente mid-budget, idéale pour les bunkers et les combats à mi-portée.',
      },
      {
        section: 'Loadout CQC (combat rapproché)',
        text: 'Combat intérieur (bunkers, stations, épaves) : shotgun Devastator-12 (premier coup létal), SMG Klaus & Werner MP5 (mobilité haute), ou le Gemini AXL (full auto rapide). En armure légère ou moyenne pour la mobilité. Les grenades à fragmentation et flash sont essentielles — gardez-en 2 de chaque. Le pistolet Arclight comme secours rapide.',
      },
      {
        section: 'Loadout longue distance',
        text: 'Combat extérieur (surface planétaire, zones ouvertes) : le Arrowhead sniper (haute pénétration, semi-auto) ou le Atzkav (électromagnétique, neutralise les armures). Portez une arme secondaire de CQC car la distance peut se réduire brusquement. Armure moyenne recommandée — l\'armure lourde ralentit trop les mouvements pour la mobilité nécessaire en extérieur.',
      },
      {
        section: 'Armures légères vs lourdes',
        text: 'Armure légère (ex : Light UEE) : haute mobilité, idéale pour les approches furtives et les espaces confinés. Perd ~40% des dégâts absorbés vs lourde. Armure lourde (ex : Devastator HVY) : absorbe 2-3x plus de dégâts mais réduit votre vitesse de déplacement de 25% et votre consommation d\'oxygène augmente. Choix standard professionnel : armure moyenne (Pyro Resistance, Novikov) — meilleur équilibre.',
      },
      {
        section: 'Équipement médical indispensable',
        text: 'Quelle que soit votre build, portez toujours ces items médicaux : Hemozal medpen (stoppe l\'hémorragie critique, obligatoire), Stims medpen (boost temporaire d\'endurance en combat), et au moins un bandage basique. Si vous êtes en solo et dans une zone isolée, un kit de défibrillateur de secours peut vous ranimer après une incapacité légère. Sans Hemozal, une blessure grave signifie la mort lente assurée.',
      },
    ],
    author: 'TacticalOps_SC',
    lastUpdated: '2025-10-30',
    version: '4.0',
    helpful: 2198,
  },
  // ============================================================
  {
    id: 'guide-reputation',
    title: 'Réputation des Factions — Guide Complet',
    category: 'Progression',
    difficulty: 'Moyen',
    readTime: 14,
    description: 'Montez votre réputation avec les factions UEE et criminelles pour débloquer des missions et équipements exclusifs.',
    tags: ['réputation', 'faction', 'progression', 'missions', 'rang', 'uee', 'nine-tails'],
    content: [
      {
        section: 'Système de réputation',
        text: 'Chaque faction a une jauge de réputation de -100 à +100. Les actions positives (missions complètes, contrats respectés, assistance aux membres) font monter votre rang. Les actions négatives (trahison, attaque de membres) font baisser votre réputation de façon permanente avec cette faction.',
      },
      {
        section: 'Factions légales (Stanton)',
        text: 'Crusader Industries : Missions de transport et escorte. Sécurité des zones Orison. ArcCorp Security : Patrouilles et bounty-hunting. Accès aux équipements de sécurité premium. Hurston Dynamics : Missions industrielles. Accès à Lorville VIP. MicroTech : Exploration et données. Équipements technologiques de pointe.',
      },
      {
        section: 'Factions criminelles (Pyro)',
        text: 'Nine Tails : Contrôlent Checkmate Station. Réputation > 20 requis pour les missions T2. Enos Pirates : Missions d\'attaque dans les zones contestées. XenoThreat : Organisation criminelle organisée, requiert Rép > 30. Attention : monter la réputation criminelle fait baisser la réputation UEE.',
      },
      {
        section: 'Moyens de gagner de la réputation',
        text: 'Missions principales de la faction (+5 à +15 par mission). Contrats de commerce exclusifs (+3 à +8). Aider des membres attaqués (+2 à +5). Événements spéciaux saisonniers (bonus x2). Les missions "signature" (difficiles, uniques) donnent +20 à +40 mais ne se font qu\'une fois.',
      },
      {
        section: 'Récompenses de réputation',
        text: 'Rang 20 : Accès aux missions Tier 2 (2-3x plus lucratives). Rang 40 : Équipements exclusifs faction dans les boutiques. Rang 60 : Missions de commandement, vaisseau loaner premium. Rang 80 : Titres cosmétiques, décorations de vaisseau exclusives. Rang 100 : Accès au QG faction et missions d\'élite (500k+ aUEC).',
      },
    ],
    author: 'FactionMaster_FR',
    lastUpdated: '2025-08-12',
    version: '4.0',
    helpful: 1923,
  },
];

// Catégories de guides
export const GUIDE_CATEGORIES = [...new Set(GUIDES.map(g => g.category))].sort();

// Index par ID
export const GUIDES_BY_ID = GUIDES.reduce((acc, g) => {
  acc[g.id] = g;
  return acc;
}, {});

// Guides populaires (triés par helpful)
export const POPULAR_GUIDES = [...GUIDES].sort((a, b) => b.helpful - a.helpful).slice(0, 5);

// Guides pour débutants
export const BEGINNER_GUIDES = GUIDES.filter(g =>
  g.difficulty === 'Facile' || g.category === 'Débutant'
);

export default GUIDES;
