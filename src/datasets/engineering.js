/**
 * Dataset Engineering — Dawn of Engineering, Star Citizen Alpha 4.5+
 * Gestion de l'énergie, chaleur, réparations, rôle d'ingénieur.
 */

export const ENGINEERING_SYSTEMS = [
  {
    id: 'power',
    name: 'Gestion de l\'Énergie',
    icon: 'Zap',
    color: '#f59e0b',
    description: 'Distribue l\'énergie du réacteur entre les systèmes : armes, boucliers, propulsion, systèmes.',
    panels: ['MFD Engineering', 'Circuit Breaker Panel'],
    mechanics: [
      'Le réacteur génère un pool d\'énergie fixe (selon sa taille/qualité).',
      'Chaque système consomme de l\'énergie : armes S1=~250kW, boucliers=variable, QT=pic important.',
      'Sur-alimenter un système (+25%/+50%) augmente les perfs mais chauffe plus vite.',
      'Couper l\'alimentation d\'un système non critique préserve l\'énergie pour d\'autres.',
      'Les disjoncteurs (breakers) coupent automatiquement en cas de surcharge.',
    ],
    tips: [
      'Désactivez les systèmes inutilisés au QT pour maximiser l\'énergie des boucliers.',
      'En combat, réduisez la propulsion et augmentez les armes + boucliers.',
      'Surveillez la température du réacteur — une surchauffe entraîne un shutdown temporaire.',
    ],
  },
  {
    id: 'heat',
    name: 'Gestion Thermique',
    icon: 'Thermometer',
    color: '#ef4444',
    description: 'Chaque composant génère de la chaleur. Les refroidisseurs évacuent la chaleur. Une surchauffe endommage les composants.',
    panels: ['MFD Engineering', 'Coolant Panel'],
    mechanics: [
      'Température normale : 20–60°C — composant opérationnel.',
      'Température élevée : 60–85°C — efficacité réduite, bruit de signature IR augmenté.',
      'Surchauffe : >85°C — risque de panne temporaire ou dommage permanent.',
      'Les refroidisseurs (coolers) pompent la chaleur depuis les composants vers les radiateurs.',
      'En environnement chaud (Pyro), les refroidisseurs sont moins efficaces — un équipement haute qualité est recommandé.',
      'La chaleur peut être redirigée manuellement : refroidir les armes aux dépens des moteurs, etc.',
    ],
    tips: [
      'Choisissez des composants avec un faible heat output pour Pyro.',
      'Les refroidisseurs grade A offrent ~40% de capacité supplémentaire.',
      'En stealth, activez le "passive cooling mode" — plus lent mais sans signature IR.',
    ],
  },
  {
    id: 'repairs',
    name: 'Réparations',
    icon: 'Wrench',
    color: '#22c55e',
    description: 'Les ingénieurs peuvent réparer physiquement les composants endommagés depuis la salle des machines.',
    panels: ['Maintenance Panel', 'Fuselage (EVA)'],
    mechanics: [
      'Les composants ont 3 états : Opérationnel / Endommagé / Détruit.',
      'Endommagé (25–75% HP) : remplacement des FUSES (fusibles) via le maintenance panel.',
      'Gravement endommagé (<25% HP) : remplacement physique du composant (stock de pièces détachées).',
      'Détruit (0% HP) : impossible à réparer en jeu — nécessite station spatiale.',
      'Le Multi-Tool avec module de réparation accélère les réparations d\'urgence.',
      'Les pièces de rechange peuvent être stockées dans le vaisseau (cargo ou rack dédié).',
    ],
    tips: [
      'Portez toujours un stock de fusibles — bon marché et sauvent des missions.',
      'Priorisez les réparations : boucliers > réacteur > propulsion > armes.',
      'En combat, un ingénieur dédié peut réparer pendant que le pilote combat.',
    ],
  },
  {
    id: 'malfunctions',
    name: 'Pannes & Incidents',
    icon: 'AlertTriangle',
    color: '#f97316',
    description: 'Les dégâts de combat ou les surcharges peuvent déclencher des pannes critiques nécessitant une intervention immédiate.',
    panels: ['MFD Engineering', 'Damage Control'],
    mechanics: [
      'Incendie à bord : utiliser l\'extincteur (tenu à la main) ou déclencher la suppression automatique.',
      'Dépressurisation : fermer les portes étanches, activer les scellures d\'urgence.',
      'Perte de QT : vérifier le carburant quantique, redémarrer le QT depuis le panel.',
      'Réacteur instable : réduire la charge immédiatement + redémarrage de sécurité (30s).',
      'Pannes en chaîne : une panne non traitée peut se propager aux systèmes adjacents.',
    ],
    tips: [
      'Apprenez l\'emplacement des extincteurs et des portes étanches sur votre vaisseau.',
      'Configurez des alertes MFD pour détecter les anomalies tôt.',
      'Gardez un kit de sécurité (fusibles + extincteur) sur vous en permanence.',
    ],
  },
  {
    id: 'roles',
    name: 'Rôle d\'Ingénieur',
    icon: 'Users',
    color: '#06b6d4',
    description: 'L\'ingénieur est le spécialiste de la survie du vaisseau. Indispensable sur les grands vaisseaux.',
    panels: ['Tous les panels techniques'],
    mechanics: [
      'Petits vaisseaux (1-2 crew) : le pilote gère lui-même l\'engineering via l\'IA ou manuellement.',
      'Moyens (3-6 crew) : 1 ingénieur dédié recommandé pour les missions longues.',
      'Grands vaisseaux (7+ crew) : 2+ ingénieurs — un pour l\'énergie/chaleur, un pour les réparations.',
      'Compétence d\'ingénieur in-game : améliore la vitesse de réparation et de reconfiguration.',
      'Communication vocale essentielle : l\'ingénieur doit informer le pilote en temps réel.',
    ],
    tips: [
      'Créez des présets d\'alimentation pour les scénarios courants (combat, exploration, QT).',
      'Sur un vaisseau multi-crew, assignez clairement les responsabilités avant le décollage.',
      'Pratiquez les réparations en solo pour maîtriser les procédures d\'urgence.',
    ],
  },
];

export const ENGINEERING_COMPONENTS = [
  // Power Plants
  {
    id: 'reactor-overview',
    name: 'Réacteurs (Power Plants)',
    category: 'power',
    description: 'Génèrent l\'énergie totale du vaisseau. Taille 1 à 3 pour la majorité des vaisseaux.',
    grades: [
      { grade: 'C', desc: 'Économique, faible output, génère plus de chaleur' },
      { grade: 'B', desc: 'Bon équilibre — recommandé pour usage général' },
      { grade: 'A', desc: 'Haute performance, coûteux, idéal combat/exploration longue' },
    ],
    keyStats: ['Power Output (kW)', 'Heat Generation', 'EM Signature', 'Efficiency'],
  },
  {
    id: 'cooler-overview',
    name: 'Refroidisseurs (Coolers)',
    category: 'heat',
    description: 'Évacuent la chaleur des composants. Essentiel en environnement chaud ou en combat prolongé.',
    grades: [
      { grade: 'C', desc: 'Capacité limitée — suffisant pour les vaisseaux légers' },
      { grade: 'B', desc: 'Standard — adapté à la majorité des configurations' },
      { grade: 'A', desc: 'Haute capacité thermique — recommandé pour Pyro' },
    ],
    keyStats: ['Cooling Rate (kW/s)', 'Max Temperature', 'IR Signature', 'Power Draw'],
  },
  {
    id: 'shield-overview',
    name: 'Boucliers (Shield Generators)',
    category: 'power',
    description: 'Protègent le vaisseau. Consomment beaucoup d\'énergie — calibrez avec le réacteur.',
    grades: [
      { grade: 'C', desc: 'Protection de base' },
      { grade: 'B', desc: 'Bon temps de rechargement' },
      { grade: 'A', desc: 'HP élevés + rechargement rapide' },
    ],
    keyStats: ['Shield HP', 'Regen Rate', 'Regen Delay', 'Power Draw'],
  },
];

export const ENGINEERING_SHIPS = [
  { id: 'aurora-mr', name: 'Aurora MR', crew: 1, complexity: 1, engineeringNote: 'Monoplace — pilote gère tout automatiquement.' },
  { id: 'cutlass-black', name: 'Cutlass Black', crew: 2, complexity: 2, engineeringNote: 'Le 2e membre peut gérer l\'engineering pendant le combat.' },
  { id: 'constellation-andromeda', name: 'Constellation Andromeda', crew: 4, complexity: 3, engineeringNote: '1 ingénieur dédié recommandé pour les opérations soutenues.' },
  { id: 'hammerhead', name: 'Hammerhead', crew: 9, complexity: 5, engineeringNote: '2 ingénieurs minimum — gestion complexe de l\'énergie pour les 7 tourelles.' },
  { id: 'hercules-c2', name: 'Hercules C2', crew: 3, complexity: 3, engineeringNote: 'Réacteur puissant pour les rampes de cargo — surveiller la chaleur.' },
  { id: 'carrack', name: 'Carrack', crew: 6, complexity: 4, engineeringNote: 'Vaisseau d\'exploration longue portée — engineering critique pour les QT répétés.' },
  { id: 'polaris', name: 'Polaris', crew: 14, complexity: 5, engineeringNote: 'Corvette militaire — équipe d\'ingénieurs dédiée obligatoire en combat.' },
  { id: '890-jump', name: '890 Jump', crew: 5, complexity: 3, engineeringNote: 'Yacht de luxe — systèmes redondants facilitent l\'engineering.' },
];

export const ENGINEERING_GLOSSARY = [
  { term: 'MFD Engineering', def: 'Multi-Function Display Engineering — panel numérique de contrôle des systèmes du vaisseau.' },
  { term: 'Circuit Breaker', def: 'Disjoncteur physique. Coupe automatiquement l\'alimentation d\'un circuit en surcharge. À réarmer manuellement.' },
  { term: 'FUSE', def: 'Fusible remplaçable. Élément consommable qui protège les composants. Coût faible, critique en urgence.' },
  { term: 'Power Triangle', def: 'Système de distribution d\'énergie entre 3 catégories : Armes, Boucliers, Propulsion. Ajustable via MFD.' },
  { term: 'IR Signature', def: 'Signature infrarouge — chaleur émise détectable par les scanners ennemis. Refroidisseurs la réduisent.' },
  { term: 'EM Signature', def: 'Signature électromagnétique — émise par le réacteur. Composants grade A ont une EM plus faible.' },
  { term: 'Heat Threshold', def: 'Seuil de température au-delà duquel un composant déclenche une alerte puis une panne.' },
  { term: 'Passive Cooling', def: 'Mode de refroidissement silencieux — réduit la signature IR mais moins efficace que le refroidissement actif.' },
  { term: 'Power Preset', def: 'Configuration d\'alimentation sauvegardable — permet de basculer rapidement entre profils (combat, voyage, stealth).' },
];
