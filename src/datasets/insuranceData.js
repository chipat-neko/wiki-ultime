/**
 * Dataset Assurance & Réclamation — Star Citizen
 * Basé sur les mécaniques en jeu Alpha 4.6
 */

// ============================================================
// TYPES D'ASSURANCE
// ============================================================
export const INSURANCE_TYPES = [
  {
    id: 'standard',
    name: 'Standard Hull Insurance',
    nameFr: 'Assurance Coque Standard',
    cost: 'Inclus pledge',
    costType: 'included',
    coverage: 'Coque uniquement',
    coverageDetails: 'Couvre la destruction ou la perte totale de la coque du vaisseau. Les composants personnalisés ne sont pas couverts.',
    renewMonths: 3,
    renewLabel: 'Renouvellement tous les 3 mois',
    recommended: false,
    pros: ['Gratuit avec tout pledge', 'Facile à obtenir en jeu', 'Couvre les situations de base'],
    cons: ['Ne couvre pas les composants', 'Durée limitée à 3 mois', 'Réclamation plus longue'],
    color: 'cyan',
    icon: 'shield',
  },
  {
    id: 'enhanced',
    name: 'Enhanced Hull Insurance',
    nameFr: 'Assurance Coque Améliorée',
    cost: '5% valeur/mois',
    costType: 'monthly',
    costRate: 0.05,
    coverage: 'Coque + composants de base',
    coverageDetails: 'Couvre la coque + tous les composants d\'équipement de base installés. Les composants personnalisés haut de gamme peuvent avoir une valeur partiellement couverte.',
    renewMonths: 6,
    renewLabel: 'Renouvellement tous les 6 mois',
    recommended: true,
    pros: ['Couvre coque + composants', 'Durée plus longue (6 mois)', 'Bon rapport qualité/prix', 'Temps de réclamation réduit de 10%'],
    cons: ['Coût mensuel variable', 'Ne couvre pas les composants très chers', 'À renouveler régulièrement'],
    color: 'gold',
    icon: 'shield-check',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Hull Insurance',
    nameFr: 'Assurance Vie Entière (LTI)',
    cost: 'Achat unique',
    costType: 'one-time',
    coverage: 'Coque + tous composants',
    coverageDetails: 'Couvre la coque et tous les composants, y compris les équipements personnalisés. Aucun renouvellement requis. Temps de réclamation le plus court.',
    renewMonths: null,
    renewLabel: 'Aucun renouvellement requis',
    recommended: false,
    pros: ['Couverture complète permanente', 'Aucun renouvellement', 'Temps de réclamation réduit de 25%', 'Couvre les composants premium'],
    cons: ['Coût initial très élevé', 'Disponible principalement via pledge', 'Valeur limitée sur les petits vaisseaux'],
    color: 'purple',
    icon: 'shield-star',
  },
];

// ============================================================
// TEMPS DE RÉCLAMATION PAR VAISSEAU (en minutes)
// ============================================================
export const CLAIM_TIMES = {
  // Vaisseaux de départ / petits
  'rsi-aurora-mr': 5,
  'cnou-mustang-alpha': 5,
  'drake-cutter': 6,
  'misc-reliant-kore': 7,
  'aegis-avenger-titan': 8,
  'aegis-avenger-stalker': 8,
  'aegis-gladius': 9,
  'anvil-arrow': 9,
  'origin-300i': 9,
  'origin-m50': 8,
  'aegis-sabre': 10,
  'anvil-f7c-hornet': 10,
  'anvil-f7a-hornet-mk2': 11,
  'drake-buccaneer': 9,
  'drake-herald': 9,
  'mirai-fury-mx': 7,
  'esperia-blade': 10,
  'banu-defender': 11,
  'anvil-terrapin': 12,
  'rsi-mantis': 10,
  'cnou-nomad': 9,

  // Vaisseaux moyens
  'drake-cutlass-black': 12,
  'misc-freelancer': 15,
  'misc-freelancer-max': 16,
  'misc-prospector': 14,
  'drake-vulture': 18,
  'aegis-vulcan': 16,
  'misc-mercury-star-runner': 17,
  'rsi-zeus-mk2-cl': 15,
  'crusader-c1-spirit': 14,
  'crusader-e1-spirit': 15,
  'crusader-a1-spirit': 15,
  'argo-raft': 16,
  'aegis-eclipse': 17,
  'aegis-vanguard-warden': 18,
  'aegis-redeemer': 20,
  'crusader-ares-inferno': 18,
  'anvil-hurricane': 19,
  'origin-400i': 20,
  'rsi-scorpius': 18,
  'esperia-prowler': 19,

  // Vaisseaux grands
  'argo-mole': 22,
  'rsi-constellation-andromeda': 28,
  'rsi-constellation-aquila': 28,
  'rsi-constellation-taurus': 26,
  'drake-corsair': 24,
  'origin-600i': 35,
  'anvil-carrack': 38,
  'aegis-reclaimer': 42,
  'anvil-valkyrie': 25,
  'misc-starfarer': 30,
  'misc-starfarer-gemini': 32,
  'crusader-hercules-c2': 32,
  'crusader-hercules-m2': 35,
  'drake-caterpillar': 28,
  'drake-ironclad': 30,
  'misc-hull-a': 16,
  'misc-hull-c': 38,
  'gatac-railen': 27,
  'origin-890-jump': 40,
  'aegis-hammerhead': 45,
  'aegis-vulcan': 16,

  // Vaisseaux capitaux
  'rsi-polaris': 55,
  'rsi-perseus': 62,
};

// Valeur par défaut selon la taille si pas de données spécifiques
export const DEFAULT_CLAIM_TIME_BY_SIZE = {
  'Nain': 6,
  'Petit': 10,
  'Moyen': 18,
  'Grand': 30,
  'Capital': 55,
};

// Multiplicateurs
export const EXPEDITE_MULTIPLIER = 0.5; // -50% du temps
export const EXPEDITE_COST_PER_MINUTE = 500; // aUEC par minute réduite
export const ENHANCED_TIME_REDUCTION = 0.10; // -10% avec assurance enhanced
export const LTI_TIME_REDUCTION = 0.25; // -25% avec LTI

// ============================================================
// SCÉNARIOS D'ÉVÉNEMENTS D'ASSURANCE
// ============================================================
export const INSURANCE_EVENTS = [
  {
    id: 'destroyed_pve',
    title: 'Détruit par IA',
    description: 'Votre vaisseau a été détruit par des ennemis IA (pirates, Vanduul, etc.)',
    icon: 'cpu',
    claimType: 'standard',
    difficulty: 'Facile',
    color: 'green',
    steps: [
      'Rejoindre la zone de réclamation la plus proche',
      'Accéder au kiosque d\'assurance (ASOP Terminal)',
      'Sélectionner votre vaisseau dans la liste',
      'Confirmer la réclamation et attendre',
      'Récupérer le vaisseau au hangar désigné',
    ],
    tips: 'Aucun rapport supplémentaire requis. Procédure standard la plus simple.',
    timeModifier: 1.0,
  },
  {
    id: 'destroyed_pvp',
    title: 'Détruit par un joueur',
    description: 'Votre vaisseau a été détruit lors d\'un combat PvP en zone légale',
    icon: 'sword',
    claimType: 'standard',
    difficulty: 'Moyen',
    color: 'yellow',
    steps: [
      'Aller au kiosque d\'assurance (ASOP Terminal)',
      'Fichier un rapport de crime si dans une zone légale',
      'Initier la réclamation d\'assurance',
      'Patienter pendant le traitement',
      'Récupérer le vaisseau au hangar',
    ],
    tips: 'Si le joueur attaquant était criminel, vous pouvez déposer une prime. Le temps de réclamation peut être légèrement plus long.',
    timeModifier: 1.1,
  },
  {
    id: 'destroyed_hostile_zone',
    title: 'Détruit en zone hostile',
    description: 'Vaisseau détruit dans une zone sans forces de l\'ordre (Pyro, espace profond)',
    icon: 'alert-triangle',
    claimType: 'standard',
    difficulty: 'Difficile',
    color: 'orange',
    steps: [
      'Respawn au point de réapparition le plus proche',
      'Trouver un transport vers une station avec kiosque ASOP',
      'Accéder au kiosque d\'assurance',
      'Réclamation standard sans rapport de crime',
      'Attendre la livraison du vaisseau de remplacement',
    ],
    tips: 'En zone hostile, prévoyez du temps de voyage. Assurez-vous d\'avoir un spawn point configuré à proximité.',
    timeModifier: 1.2,
  },
  {
    id: 'stolen',
    title: 'Vaisseau volé',
    description: 'Votre vaisseau a été volé par un autre joueur',
    icon: 'user-x',
    claimType: 'enhanced',
    difficulty: 'Difficile',
    color: 'red',
    steps: [
      'Signaler le vol aux forces de l\'ordre (station la plus proche)',
      'Accéder au kiosque ASOP Terminal',
      'Déposer une déclaration de vol',
      'Initier la réclamation d\'assurance (avec frais supplémentaires)',
      'Attendre la décision du traitement',
      'Récupérer le vaisseau de remplacement',
    ],
    tips: 'Un vaisseau volé peut être réclamé mais avec des délais supplémentaires. La réclamation coûte généralement plus cher qu\'une destruction classique.',
    timeModifier: 1.5,
  },
  {
    id: 'abandoned',
    title: 'Vaisseau abandonné',
    description: 'Vaisseau laissé sans surveillance en zone dangereuse ou incontrôlée',
    icon: 'map-pin-off',
    claimType: 'standard',
    difficulty: 'Moyen',
    color: 'yellow',
    steps: [
      'Trouver le vaisseau si encore accessible (via radar)',
      'Retourner au vaisseau ou initier une réclamation',
      'Accéder au kiosque ASOP Terminal',
      'Lancer la récupération d\'urgence',
      'Payer les frais de récupération',
    ],
    tips: 'Si le vaisseau est encore intact et accessible, retournez-y directement. Sinon, la réclamation est standard.',
    timeModifier: 1.0,
  },
  {
    id: 'self_destruct',
    title: 'Autodestruction / Accident',
    description: 'Vaisseau accidentellement détruit ou auto-détruit (erreur de pilotage, crash)',
    icon: 'zap',
    claimType: 'standard',
    difficulty: 'Facile',
    color: 'green',
    steps: [
      'Accéder au kiosque d\'assurance (ASOP Terminal)',
      'Sélectionner le vaisseau sinistré',
      'Confirmer la réclamation',
      'Attendre le délai standard',
      'Récupérer au hangar',
    ],
    tips: 'Les accidents sont traités comme une destruction standard. Pensez à mieux évaluer les risques de vol atmosphérique.',
    timeModifier: 1.0,
  },
  {
    id: 'insurance_fraud',
    title: 'Attention : Fraude',
    description: 'Tenter de réclamer un vaisseau qui n\'est pas réellement détruit',
    icon: 'shield-x',
    claimType: 'none',
    difficulty: 'Interdit',
    color: 'red',
    steps: [
      'Ne JAMAIS tenter de réclamer un vaisseau encore existant',
      'Cela constitue de la fraude à l\'assurance en jeu',
      'Peut entraîner des amendes ou crimstat',
      'Le vaisseau réclamé peut être saisi',
    ],
    tips: 'La fraude à l\'assurance est sanctionnée dans Star Citizen. Les kiosques vérifient l\'état réel du vaisseau avant traitement.',
    timeModifier: null,
  },
  {
    id: 'component_loss',
    title: 'Perte de composants',
    description: 'Le vaisseau est récupéré mais des composants personnalisés ont été perdus',
    icon: 'package-x',
    claimType: 'enhanced',
    difficulty: 'Moyen',
    color: 'yellow',
    steps: [
      'Récupérer le vaisseau via réclamation normale',
      'Inventorier les composants manquants',
      'Déposer une réclamation de composants séparée (si Enhanced/LTI)',
      'Acheter les composants manquants si non couverts',
      'Réinstaller les composants au hangar ou station',
    ],
    tips: 'Avec l\'assurance Enhanced ou LTI, les composants de base sont couverts. Les composants premium (S4+) peuvent nécessiter un remboursement partiel.',
    timeModifier: 1.0,
  },
];

// ============================================================
// STATIONS AVEC KIOSQUES D'ASSURANCE
// ============================================================
export const INSURANCE_STATIONS = [
  { name: 'Port Olisar', system: 'Stanton', type: 'Station orbitale', available: false, note: 'Remplacé par Seraphim Station' },
  { name: 'Seraphim Station', system: 'Stanton', type: 'Station orbitale', available: true, note: 'Crusader orbit' },
  { name: 'Area18 (ArcCorp)', system: 'Stanton', type: 'Ville', available: true, note: 'Grand centre commercial' },
  { name: 'Lorville (Hurston)', system: 'Stanton', type: 'Ville', available: true, note: 'Grande ville industrielle' },
  { name: 'New Babbage (MicroTech)', system: 'Stanton', type: 'Ville', available: true, note: 'Centre technologique' },
  { name: 'Port Tressler', system: 'Stanton', type: 'Station orbitale', available: true, note: 'MicroTech orbit' },
  { name: 'Baijini Point', system: 'Stanton', type: 'Station orbitale', available: true, note: 'ArcCorp orbit' },
  { name: 'Everus Harbor', system: 'Stanton', type: 'Station orbitale', available: true, note: 'Hurston orbit' },
  { name: 'CRU-L1 (Lagrange)', system: 'Stanton', type: 'Station Lagrange', available: true, note: 'Crusader L1' },
  { name: 'Pyro Station Prime', system: 'Pyro', type: 'Station orbitale', available: true, note: 'Alpha 4.0+' },
  { name: 'Ruin Station', system: 'Pyro', type: 'Station', available: true, note: 'Alpha 4.0+' },
  { name: 'Checkmate Station', system: 'Pyro', type: 'Station', available: true, note: 'Alpha 4.0+' },
];

// ============================================================
// GUIDE PRATIQUE (ACCORDION)
// ============================================================
export const INSURANCE_GUIDE_SECTIONS = [
  {
    id: 'how-to-claim',
    title: 'Comment réclamer votre vaisseau',
    icon: 'clipboard-list',
    content: [
      { step: 1, text: 'Trouvez un kiosque ASOP Terminal dans une station, une ville ou un spatioport.' },
      { step: 2, text: 'Interagissez avec le terminal (touche F par défaut).' },
      { step: 3, text: 'Sélectionnez l\'onglet "Réclamation" dans l\'interface.' },
      { step: 4, text: 'Choisissez le vaisseau sinistré dans la liste.' },
      { step: 5, text: 'Sélectionnez le hangar de livraison souhaité.' },
      { step: 6, text: 'Optionnellement, activez l\'expédition (coût en aUEC pour réduire le temps).' },
      { step: 7, text: 'Confirmez la réclamation et attendez la notification de livraison.' },
      { step: 8, text: 'Rendez-vous au hangar indiqué pour récupérer votre vaisseau.' },
    ],
  },
  {
    id: 'where-to-claim',
    title: 'Où trouver les kiosques d\'assurance',
    icon: 'map-pin',
    content: [
      { step: 1, text: 'Toutes les grandes stations orbitales (Seraphim, Baijini Point, Port Tressler, Everus Harbor).' },
      { step: 2, text: 'Les grandes villes : Lorville, Area18, New Babbage.' },
      { step: 3, text: 'Les stations Lagrange (L1-L5) de chaque planète dans Stanton.' },
      { step: 4, text: 'Dans le système Pyro : Pyro Station Prime, Ruin Station, Checkmate Station.' },
      { step: 5, text: 'Les kiosques ASOP se trouvent généralement dans les zones de hangar ou d\'amarrage.' },
    ],
  },
  {
    id: 'insurance-types-diff',
    title: 'Différences Standard / Enhanced / LTI',
    icon: 'layers',
    content: [
      { step: 1, text: 'Standard : incluse avec tout achat. Couvre uniquement la coque. Durée 3 mois.' },
      { step: 2, text: 'Enhanced : 5% de la valeur du vaisseau par mois. Couvre coque + composants de base. Durée 6 mois.' },
      { step: 3, text: 'LTI (Lifetime) : coût unique élevé. Couvre tout, y compris les composants premium. Permanente.' },
      { step: 4, text: 'L\'assurance Enhanced réduit le temps de réclamation de 10%.' },
      { step: 5, text: 'La LTI réduit le temps de réclamation de 25%.' },
      { step: 6, text: 'Pour les vaisseaux de valeur élevée (> 10M aUEC), la LTI ou Enhanced est fortement recommandée.' },
    ],
  },
  {
    id: 'minimize-claim-time',
    title: 'Conseils pour minimiser les temps de réclamation',
    icon: 'clock',
    content: [
      { step: 1, text: 'Utilisez l\'expédition (Expedite) : réduit le temps de 50% pour un coût en aUEC.' },
      { step: 2, text: 'Souscrivez à l\'assurance Enhanced ou LTI pour des réductions passives.' },
      { step: 3, text: 'Réclamez depuis les grandes stations (meilleure infrastructure).' },
      { step: 4, text: 'Évitez les rush hours de serveur (moins de files d\'attente).' },
      { step: 5, text: 'Configurez votre spawn point près de vos zones de vol habituelles.' },
      { step: 6, text: 'Préférez les vaisseaux légers pour les activités à haut risque (temps de réclamation plus courts).' },
    ],
  },
  {
    id: 'hostile-zone',
    title: 'Que faire si le vaisseau est détruit en zone hostile',
    icon: 'alert-triangle',
    content: [
      { step: 1, text: 'Vous respawnez au dernier point de réapparition enregistré.' },
      { step: 2, text: 'Si en zone hostile (Pyro, espace profond) : trouvez d\'abord un transport sécurisé.' },
      { step: 3, text: 'Rejoignez la station la plus proche avec un kiosque ASOP.' },
      { step: 4, text: 'Réclamez votre vaisseau normalement depuis cette station.' },
      { step: 5, text: 'Si vous n\'avez pas d\'aUEC pour l\'expédition, attendez le temps standard.' },
      { step: 6, text: 'Conseil : gardez toujours un spawn point configuré dans Stanton comme sauvegarde.' },
    ],
  },
];

// ============================================================
// FONCTIONS HELPER
// ============================================================

/**
 * Calcule le temps de réclamation pour un vaisseau
 * @param {string} shipId - ID du vaisseau
 * @param {boolean} expedite - Si l'expédition est activée
 * @param {string} insuranceType - Type d'assurance ('standard', 'enhanced', 'lifetime')
 * @param {string} shipSize - Taille du vaisseau (fallback si pas de données)
 * @returns {number} Temps en minutes
 */
export function calcClaimTime(shipId, expedite = false, insuranceType = 'standard', shipSize = 'Moyen') {
  let baseTime = CLAIM_TIMES[shipId] ?? DEFAULT_CLAIM_TIME_BY_SIZE[shipSize] ?? 15;

  // Réduction selon le type d'assurance
  if (insuranceType === 'enhanced') {
    baseTime = Math.round(baseTime * (1 - ENHANCED_TIME_REDUCTION));
  } else if (insuranceType === 'lifetime') {
    baseTime = Math.round(baseTime * (1 - LTI_TIME_REDUCTION));
  }

  if (expedite) {
    baseTime = Math.ceil(baseTime * EXPEDITE_MULTIPLIER);
  }

  return Math.max(1, baseTime);
}

/**
 * Calcule le coût d'expédition pour un vaisseau
 * @param {string} shipId - ID du vaisseau
 * @param {string} insuranceType - Type d'assurance
 * @param {string} shipSize - Taille du vaisseau (fallback)
 * @returns {number} Coût en aUEC
 */
export function calcExpediteCost(shipId, insuranceType = 'standard', shipSize = 'Moyen') {
  const normalTime = calcClaimTime(shipId, false, insuranceType, shipSize);
  const expeditedTime = calcClaimTime(shipId, true, insuranceType, shipSize);
  const minutesSaved = normalTime - expeditedTime;
  return minutesSaved * EXPEDITE_COST_PER_MINUTE;
}

/**
 * Calcule le coût mensuel de l'assurance enhanced pour un vaisseau
 * @param {number} shipPrice - Prix du vaisseau en aUEC
 * @param {string} type - Type d'assurance
 * @param {number} months - Nombre de mois
 * @returns {number} Coût total en aUEC
 */
export function calcInsuranceCost(shipPrice, type, months = 1) {
  if (type === 'standard') return 0;
  if (type === 'lifetime') {
    // Estimation : environ 20% de la valeur du vaisseau (achat unique)
    return Math.round(shipPrice * 0.20);
  }
  if (type === 'enhanced') {
    const insuranceType = INSURANCE_TYPES.find(t => t.id === 'enhanced');
    return Math.round(shipPrice * (insuranceType?.costRate ?? 0.05) * months);
  }
  return 0;
}

/**
 * Retourne des conseils d'assurance selon le vaisseau
 * @param {object} ship - Objet vaisseau complet
 * @returns {object} { recommendedType, advice, warnings }
 */
export function getInsuranceAdvice(ship) {
  if (!ship) return { recommendedType: 'standard', advice: [], warnings: [] };

  const price = ship.price ?? 0;
  const pledgePrice = ship.pledgePrice ?? 0;
  const size = ship.size ?? 'Moyen';
  const role = ship.role ?? '';
  const claimTime = CLAIM_TIMES[ship.id] ?? DEFAULT_CLAIM_TIME_BY_SIZE[size] ?? 15;

  const advice = [];
  const warnings = [];
  let recommendedType = 'standard';

  // Logique de recommandation selon le prix
  if (price >= 50000000 || pledgePrice >= 500) {
    recommendedType = 'lifetime';
    advice.push('Vaisseau de haute valeur : la LTI est fortement recommandée pour protéger votre investissement.');
    advice.push('Le coût de la LTI est rentabilisé après seulement quelques destructions.');
  } else if (price >= 10000000 || pledgePrice >= 200) {
    recommendedType = 'enhanced';
    advice.push('Vaisseau de valeur significative : l\'assurance Enhanced offre le meilleur rapport couverture/coût.');
    advice.push('Les composants personnalisés sont couverts, ce qui protège vos upgrades.');
  } else {
    recommendedType = 'standard';
    advice.push('Vaisseau abordable : l\'assurance Standard est suffisante.');
    advice.push('Considérez l\'Enhanced si vous personnalisez beaucoup ce vaisseau.');
  }

  // Conseils selon le rôle
  if (role.toLowerCase().includes('combat') || role.toLowerCase().includes('chasseur')) {
    advice.push('Vaisseau de combat : anticipez des réclamations fréquentes. Activez souvent l\'expédition.');
    warnings.push('Les vaisseaux de combat sont détruits plus fréquemment — prévoyez un budget d\'expédition.');
  }

  if (role.toLowerCase().includes('cargo') || role.toLowerCase().includes('transport')) {
    advice.push('Vaisseau cargo : évitez les zones hostiles pour minimiser les pertes de chargement non couvertes.');
  }

  if (role.toLowerCase().includes('mineur') || role === 'Mineur') {
    advice.push('Vaisseau minier : les zones d\'astéroïdes sont risquées, gardez suffisamment d\'aUEC pour l\'expédition.');
  }

  // Avertissements selon le temps de réclamation
  if (claimTime >= 40) {
    warnings.push(`Temps de réclamation long (${claimTime} min) : l'expédition ou la LTI peuvent économiser beaucoup de temps.`);
  }

  if (size === 'Capital') {
    warnings.push('Vaisseau capital : le temps de réclamation est très long. La LTI + expédition sont quasi-indispensables.');
  }

  return {
    recommendedType,
    advice,
    warnings,
  };
}

/**
 * Retourne le tier de vitesse de réclamation
 * @param {number} claimTime - Temps en minutes
 * @returns {object} { tier, label, color }
 */
export function getClaimTier(claimTime) {
  if (claimTime < 10) return { tier: 'ultra-rapide', label: 'Ultra-rapide', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  if (claimTime < 15) return { tier: 'rapide', label: 'Rapide', color: 'text-green-400', bg: 'bg-green-500' };
  if (claimTime < 25) return { tier: 'moyen', label: 'Moyen', color: 'text-yellow-400', bg: 'bg-yellow-500' };
  if (claimTime < 40) return { tier: 'lent', label: 'Lent', color: 'text-orange-400', bg: 'bg-orange-500' };
  return { tier: 'tres-lent', label: 'Très lent', color: 'text-red-400', bg: 'bg-red-500' };
}

// Vaisseaux populaires pour la grille de sélection rapide
export const POPULAR_SHIPS_IDS = [
  'rsi-aurora-mr',
  'cnou-mustang-alpha',
  'drake-cutlass-black',
  'misc-freelancer',
  'misc-prospector',
  'argo-mole',
  'rsi-constellation-andromeda',
  'anvil-carrack',
  'aegis-reclaimer',
  'aegis-hammerhead',
  'rsi-polaris',
  'origin-600i',
];

// Top 20 vaisseaux pour le tableau comparatif
export const TOP20_SHIPS_IDS = [
  'rsi-aurora-mr',
  'cnou-mustang-alpha',
  'drake-cutter',
  'aegis-avenger-titan',
  'drake-cutlass-black',
  'misc-freelancer',
  'misc-prospector',
  'drake-vulture',
  'argo-mole',
  'misc-mercury-star-runner',
  'rsi-scorpius',
  'rsi-constellation-andromeda',
  'drake-corsair',
  'anvil-carrack',
  'origin-600i',
  'aegis-reclaimer',
  'crusader-hercules-c2',
  'aegis-hammerhead',
  'rsi-polaris',
  'origin-890-jump',
];
