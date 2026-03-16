/**
 * Dataset des items universels Star Citizen — Item Finder
 * Couvre : vêtements, consommables, gadgets, mêlée, médical, armes FPS (résumé), armures (résumé)
 */

export const ITEMS_CATEGORIES = [
  { id: 'clothing',   label: 'Vêtements',       icon: 'Shirt',      color: 'cyan',   badgeClass: 'badge-cyan'   },
  { id: 'consumable', label: 'Consommables',     icon: 'Coffee',     color: 'yellow', badgeClass: 'badge-yellow' },
  { id: 'gadget',     label: 'Gadgets',          icon: 'Cpu',        color: 'blue',   badgeClass: 'badge-blue'   },
  { id: 'melee',      label: 'Armes de mêlée',  icon: 'Sword',      color: 'purple', badgeClass: 'badge-purple' },
  { id: 'medical',    label: 'Médical',          icon: 'Heart',      color: 'green',  badgeClass: 'badge-green'  },
  { id: 'fps-weapon', label: 'Armes FPS',        icon: 'Crosshair',  color: 'red',    badgeClass: 'badge-red'    },
  { id: 'armor',      label: 'Armures',          icon: 'Shield',     color: 'slate',  badgeClass: 'badge-slate'  },
];

export const ITEMS = [
  // ============================================================
  // VÊTEMENTS — Casques / Têtes (5)
  // ============================================================
  {
    id: 'novikov-helmet',
    name: 'Novikov Helmet',
    category: 'clothing',
    subcategory: 'helmet',
    description: 'Casque de travail robuste, très populaire dans les colonies minières de Hurston. Visière renforcée contre les débris.',
    price: 3200,
    legal: true,
    locations: [
      { stationId: 'lorville',   shop: "Tammany & Sons",      system: 'Stanton' },
      { stationId: 'area18',     shop: 'CasabaOutlet',        system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'casque', 'tête', 'novikov', 'minier'],
  },
  {
    id: 'bacchus-helmet',
    name: 'Bacchus Helmet',
    category: 'clothing',
    subcategory: 'helmet',
    description: 'Casque de style militaire reconverti pour usage civil. Offre une bonne protection balistique passive.',
    price: 4800,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',          system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'casque', 'tête', 'bacchus', 'militaire'],
  },
  {
    id: 'rsi-constellation-hat',
    name: 'RSI Constellation Hat',
    category: 'clothing',
    subcategory: 'hat',
    description: 'Casquette officielle RSI édition Constellation. Collector très recherché parmi les fans de la marque.',
    price: 1500,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'casquette', 'tête', 'rsi', 'collector'],
  },
  {
    id: 'hurston-mining-cap',
    name: 'Hurston Mining Cap',
    category: 'clothing',
    subcategory: 'hat',
    description: 'Casquette standard émise aux employés des mines HD. Anti-poussière et légère.',
    price: 850,
    legal: true,
    locations: [
      { stationId: 'lorville', shop: "Tammany & Sons",        system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'casquette', 'tête', 'hurston', 'minier'],
  },
  {
    id: 'flight-deck-helmet',
    name: 'Flight Deck Helmet',
    category: 'clothing',
    subcategory: 'helmet',
    description: 'Casque de pont de vol, conçu pour les équipes au sol des hangars. Protège des turbulences de décollage.',
    price: 2700,
    legal: true,
    locations: [
      { stationId: 'orison',    shop: 'CasabaOutlet',         system: 'Stanton' },
      { stationId: 'area18',    shop: 'CasabaOutlet',         system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'casque', 'tête', 'pont de vol', 'hangar'],
  },

  // ============================================================
  // VÊTEMENTS — Vestes / Hauts (6)
  // ============================================================
  {
    id: 'novikov-jacket',
    name: 'Novikov Jacket',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Veste en cuir synthétique populaire dans les colonies minières. Résistante à la chaleur et aux projections.',
    price: 2400,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'veste', 'novikov', 'urban'],
  },
  {
    id: 'dead-broke-jacket',
    name: 'Dead Broke Jacket',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Veste de style délabrée portée par les sans-abri et les indépendants fauchés. Parfaite pour se fondre dans la masse à GrimHEX.',
    price: 600,
    legal: true,
    locations: [
      { stationId: 'grimhex',  shop: 'Skutters',              system: 'Stanton' },
      { stationId: 'levski',   shop: 'Cordrys',               system: 'Nyx'     },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'veste', 'lowlife', 'urban'],
  },
  {
    id: 'cormorant-jacket',
    name: 'Cormorant Jacket',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Veste haut de gamme taillée pour les executives d\'ArcCorp. Tissu nanotextile thermorégulé.',
    price: 6500,
    legal: true,
    locations: [
      { stationId: 'area18',     shop: 'CasabaOutlet',        system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'veste', 'cormorant', 'luxe'],
  },
  {
    id: 'arc-light-jacket',
    name: 'Arc Light Jacket',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Veste à panneaux lumineux intégrés, emblématique de la culture néon d\'Area18.',
    price: 3800,
    legal: true,
    locations: [
      { stationId: 'area18', shop: 'CasabaOutlet',            system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'veste', 'néon', 'arccorp'],
  },
  {
    id: 'morozov-jacket',
    name: 'Morozov Jacket',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Veste thermique conçue pour les températures extrêmes de MicroTech. Doublure chauffante intégrée.',
    price: 4200,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'veste', 'morozov', 'froid', 'microtech'],
  },
  {
    id: 'engineer-coverall',
    name: 'Engineer Coverall',
    category: 'clothing',
    subcategory: 'suit',
    description: 'Combinaison de travail pour ingénieurs de vaisseau. Poches multiples et manchettes anti-statiques.',
    price: 3100,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Magpie Store",       system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'combinaison', 'haut', 'ingénieur', 'travail'],
  },

  // ============================================================
  // VÊTEMENTS — Bas / Pantalons (4)
  // ============================================================
  {
    id: 'aves-pants',
    name: 'Aves Pants',
    category: 'clothing',
    subcategory: 'pants',
    description: 'Pantalon modulaire de la gamme Aves, avec ceinture réglable et renforts aux genoux.',
    price: 1800,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'area18',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'bas', 'pantalon', 'aves'],
  },
  {
    id: 'cormorant-trousers',
    name: 'Cormorant Trousers',
    category: 'clothing',
    subcategory: 'pants',
    description: 'Pantalon élégant en tissu stretch imperméable. Complète la veste Cormorant pour un look business.',
    price: 4800,
    legal: true,
    locations: [
      { stationId: 'area18',      shop: 'CasabaOutlet',       system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'bas', 'pantalon', 'cormorant', 'luxe'],
  },
  {
    id: 'flight-deck-pants',
    name: 'Flight Deck Pants',
    category: 'clothing',
    subcategory: 'pants',
    description: 'Pantalon de pont de vol avec fixations magnétiques aux chevilles pour zones à faible gravité.',
    price: 2200,
    legal: true,
    locations: [
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'bas', 'pantalon', 'vol', 'zéro-g'],
  },
  {
    id: 'worker-pants',
    name: 'Worker Pants',
    category: 'clothing',
    subcategory: 'pants',
    description: 'Pantalon de travail résistant, avec genouillères intégrées et poches cargo latérales.',
    price: 1100,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'levski',      shop: "Dumper's Depot",     system: 'Nyx'     },
    ],
    image: null,
    tags: ['vêtement', 'bas', 'pantalon', 'travail'],
  },

  // ============================================================
  // VÊTEMENTS — Chaussures (4)
  // ============================================================
  {
    id: 'aves-boots',
    name: 'Aves Boots',
    category: 'clothing',
    subcategory: 'boots',
    description: 'Bottines de la gamme Aves. Confortables pour les longues marches dans les stations.',
    price: 1600,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'area18',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'chaussures', 'bottes', 'aves'],
  },
  {
    id: 'cormorant-shoes',
    name: 'Cormorant Shoes',
    category: 'clothing',
    subcategory: 'shoes',
    description: 'Chaussures de ville en synthcuir premium. Style executive, semelle magnétique optionnelle.',
    price: 3500,
    legal: true,
    locations: [
      { stationId: 'area18',      shop: 'CasabaOutlet',       system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'chaussures', 'cormorant', 'luxe'],
  },
  {
    id: 'safety-boots',
    name: 'Safety Boots',
    category: 'clothing',
    subcategory: 'boots',
    description: 'Bottes de sécurité industrielle avec embouts renforcés en carbure. Norme HD-7.',
    price: 1950,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Magpie Store",       system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'chaussures', 'bottes', 'sécurité', 'industriel'],
  },
  {
    id: 'space-boots',
    name: 'Space Boots',
    category: 'clothing',
    subcategory: 'boots',
    description: 'Bottes conçues pour les sorties EVA. Semelles magnétiques haute puissance.',
    price: 5200,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',          system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'chaussures', 'bottes', 'EVA', 'espace', 'magnétique'],
  },

  // ============================================================
  // VÊTEMENTS — Gants (3)
  // ============================================================
  {
    id: 'aves-gloves',
    name: 'Aves Gloves',
    category: 'clothing',
    subcategory: 'gloves',
    description: 'Gants tactiles de la gamme Aves. Compatibles avec les interfaces holo.',
    price: 950,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'area18',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'gants', 'aves', 'tactile'],
  },
  {
    id: 'mining-gloves',
    name: 'Mining Gloves',
    category: 'clothing',
    subcategory: 'gloves',
    description: 'Gants de minage renforcés. Protection thermique niveau 3 et paume anti-vibration.',
    price: 1400,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Magpie Store",       system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'gants', 'minage', 'protection'],
  },
  {
    id: 'combat-gloves',
    name: 'Combat Gloves',
    category: 'clothing',
    subcategory: 'gloves',
    description: 'Gants tactiques en Kevlar composite. Articulations renforcées pour le combat rapproché.',
    price: 2100,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',          system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',        system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'gants', 'combat', 'tactique'],
  },

  // ============================================================
  // VÊTEMENTS — Combinaisons / Sous-vêtements spatiaux (3)
  // ============================================================
  {
    id: 'stalker-undersuit',
    name: 'Stalker Undersuit',
    category: 'clothing',
    subcategory: 'undersuit',
    description: 'Sous-vêtement spatial haute performance avec régulation thermique et monitoring biométrique.',
    price: 7800,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',          system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',        system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'combinaison', 'undersuit', 'spatial', 'thermique'],
  },
  {
    id: 'novikov-flight-suit',
    name: 'Novikov Flight Suit',
    category: 'clothing',
    subcategory: 'suit',
    description: 'Combinaison de vol Novikov Industries. Usage polyvalent : pilotage, travail en station, EVA légère.',
    price: 5600,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['vêtement', 'combinaison', 'vol', 'novikov', 'pilote'],
  },

  // ============================================================
  // CONSOMMABLES — Nourriture (10)
  // ============================================================
  {
    id: 'slipstream-sandwich',
    name: 'Slipstream Bar Sandwich',
    category: 'consumable',
    subcategory: 'food',
    description: 'Sandwich signature du Slipstream Bar & Grill, populaire dans les lounges de New Babbage.',
    price: 45,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Slipstream Bar & Grill', system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'sandwich', 'slipstream'],
  },
  {
    id: 'novikov-protein-bar',
    name: 'Novikov Protein Bar',
    category: 'consumable',
    subcategory: 'food',
    description: 'Barre protéinée haute densité pour les travailleurs en mission longue. Goût vanille synthétique.',
    price: 25,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'barre', 'protéine', 'ration'],
  },
  {
    id: 'crusader-ration-pack',
    name: 'Crusader Ration Pack',
    category: 'consumable',
    subcategory: 'food',
    description: 'Pack de rations Crusader Industries. 3 jours de nourriture complète en format compact.',
    price: 180,
    legal: true,
    locations: [
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
      { stationId: 'cru-l1',      shop: 'Station Store',      system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'ration', 'crusader', 'survie'],
  },
  {
    id: 'dragon-fruit',
    name: 'Dragon Fruit',
    category: 'consumable',
    subcategory: 'food',
    description: 'Fruit exotique cultivé dans les serres de MicroTech. Rafraîchissant et riche en vitamines spatiales.',
    price: 18,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Slipstream Bar & Grill', system: 'Stanton' },
      { stationId: 'orison',      shop: 'Cloud 9 Café',       system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'fruit', 'frais'],
  },
  {
    id: 'noodle-bowl',
    name: 'Station Noodle Bowl',
    category: 'consumable',
    subcategory: 'food',
    description: 'Plat de nouilles lyophilisées ultra-rapide, incontournable des stations orbitales.',
    price: 30,
    legal: true,
    locations: [
      { stationId: 'arc-l1',      shop: 'Station Cantina',    system: 'Stanton' },
      { stationId: 'mic-l1',      shop: 'Station Cantina',    system: 'Stanton' },
      { stationId: 'hurston',     shop: "Tammany & Sons",     system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'nouilles', 'rapide'],
  },
  {
    id: 'energy-bar',
    name: 'Energy Bar',
    category: 'consumable',
    subcategory: 'food',
    description: 'Barre énergétique standard UEE. Restaure rapidement la stamina.',
    price: 20,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',        system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Aparelli',           system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',       system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'barre', 'énergie', 'stamina'],
  },
  {
    id: 'readi-meal-curry',
    name: "Readi-Meal Curry",
    category: 'consumable',
    subcategory: 'food',
    description: 'Repas curry auto-chauffant en sachet. Inventé pour les pilotes solitaires. Avis mitigés sur le goût.',
    price: 55,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",     system: 'Stanton' },
      { stationId: 'levski',      shop: "Dumper's Depot",     system: 'Nyx'     },
      { stationId: 'grimhex',     shop: 'Skutters',           system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'nourriture', 'repas', 'curry', 'auto-chauffant'],
  },

  // ============================================================
  // CONSOMMABLES — Boissons (8)
  // ============================================================
  {
    id: 'aguamiel',
    name: 'Aguamiel',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Boisson à base d\'agave fermenté, brassée par des colons de Hurston. Populaire dans les bars louches.',
    price: 35,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Tammany & Sons",       system: 'Stanton' },
      { stationId: 'grimhex',   shop: "Skutters Bar",         system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'alcool', 'aguamiel'],
  },
  {
    id: 'buzz-juice',
    name: 'Buzz Juice',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Boisson énergisante très populaire sur ArcCorp. Contient des stimulants légaux certifiés UEE.',
    price: 28,
    legal: true,
    locations: [
      { stationId: 'area18',    shop: 'CasabaOutlet',         system: 'Stanton' },
      { stationId: 'arc-l1',    shop: 'Station Cantina',      system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'énergie', 'stimulant', 'buzz'],
  },
  {
    id: 'drake-draft',
    name: 'Drake Draft',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Bière brune ambrée sponsorisée par Drake Interplanetary. Goût de malt et de carbone.',
    price: 42,
    legal: true,
    locations: [
      { stationId: 'grimhex',   shop: "Skutters Bar",         system: 'Stanton' },
      { stationId: 'levski',    shop: "The Pit",              system: 'Nyx'     },
      { stationId: 'area18',    shop: 'Traveler Rentals Bar', system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'bière', 'alcool', 'drake'],
  },
  {
    id: 'stellar-brew-coffee',
    name: 'Stellar Brew Coffee',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Café de spécialité torréfié sur Crusader. Arômes intenses et caféine renforcée pour les longues gardes.',
    price: 22,
    legal: true,
    locations: [
      { stationId: 'orison',    shop: 'Cloud 9 Café',         system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Slipstream Bar & Grill', system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'café', 'caféine'],
  },
  {
    id: 'pale-rider-whiskey',
    name: 'Pale Rider Whiskey',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Whisky de contrebande distillé dans les astéroïdes de Nyx. Très fort, très illégal hors Nyx.',
    price: 380,
    legal: false,
    locations: [
      { stationId: 'levski',    shop: "The Pit",              system: 'Nyx'     },
      { stationId: 'grimhex',   shop: 'Nine Tails Locker',   system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'alcool', 'whisky', 'contrebande', 'illégal'],
  },
  {
    id: 'steel-reserve-whiskey',
    name: 'Steel Reserve Whiskey',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Whisky de qualité standard, embouteillé à Lorville. Populaire parmi les ouvriers HD.',
    price: 95,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Tammany & Sons",       system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'alcool', 'whisky'],
  },
  {
    id: 'stims-xenothreat',
    name: 'XenoThreat Stims',
    category: 'consumable',
    subcategory: 'stim',
    description: 'Stimulant combat développé par XenoThreat. Améliore temporairement les réflexes et réduit la douleur.',
    price: 1200,
    legal: false,
    locations: [
      { stationId: 'ruin-station', shop: 'Ruin Black Market',  system: 'Pyro'    },
      { stationId: 'grimhex',      shop: 'Nine Tails Locker',  system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'stim', 'combat', 'illégal', 'xenothreat'],
  },
  {
    id: 'stims-red-widow',
    name: 'Red Widow Stims',
    category: 'consumable',
    subcategory: 'stim',
    description: 'Cocktail psychotrope de la faction Red Widow. Améliore la précision au prix d\'effets secondaires sévères.',
    price: 950,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Nine Tails Locker',    system: 'Stanton' },
      { stationId: 'checkmate', shop: 'Black Market',         system: 'Pyro'    },
    ],
    image: null,
    tags: ['consommable', 'stim', 'illégal', 'red widow'],
  },

  // ============================================================
  // MÉDICAL (7)
  // ============================================================
  {
    id: 'hemozal-bandage',
    name: 'Hemozal Bandage',
    category: 'medical',
    subcategory: 'bandage',
    description: 'Bandage à base de Hemozal pour stopper les hémorragies mineures. Essentiel dans tout kit de survie.',
    price: 120,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: 'Hospital Lobby Shop', system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',         system: 'Stanton' },
    ],
    image: null,
    tags: ['médical', 'bandage', 'hemozal', 'soin', 'hémorragie'],
  },
  {
    id: 'hemozal-medipen',
    name: 'Hemozal MediPen',
    category: 'medical',
    subcategory: 'medipen',
    description: 'Stylo injecteur automatique de Hemozal. Stoppette les hémorragies internes légères.',
    price: 350,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: 'Hospital Lobby Shop', system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',        system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',         system: 'Stanton' },
    ],
    image: null,
    tags: ['médical', 'medipen', 'hemozal', 'soin', 'injecteur'],
  },
  {
    id: 'demexatrine-pack',
    name: 'Demexatrine Pack',
    category: 'medical',
    subcategory: 'medipack',
    description: 'Pack de Demexatrine pour le traitement d\'urgence des fractures et traumatismes osseux.',
    price: 680,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: 'Hospital Lobby Shop', system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
    ],
    image: null,
    tags: ['médical', 'demexatrine', 'fracture', 'trauma', 'soin'],
  },
  {
    id: 'resurgera',
    name: 'Resurgera',
    category: 'medical',
    subcategory: 'medipen',
    description: 'Médicament de pointe pour la régénération tissulaire accélérée. Réduit le temps de récupération de 60%.',
    price: 1400,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
      { stationId: 'orison',      shop: 'Crusader Med Center', system: 'Stanton' },
    ],
    image: null,
    tags: ['médical', 'resurgera', 'régénération', 'soin', 'avancé'],
  },
  {
    id: 'sterimag-kit',
    name: 'Sterimag Kit',
    category: 'medical',
    subcategory: 'kit',
    description: 'Kit de stérilisation magnétique pour soins sur le terrain. Prévient les infections dans les environnements hostiles.',
    price: 450,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: 'Hospital Lobby Shop', system: 'Stanton' },
      { stationId: 'levski',      shop: "Dumper's Depot",      system: 'Nyx'     },
    ],
    image: null,
    tags: ['médical', 'sterimag', 'stérilisation', 'infection', 'terrain'],
  },
  {
    id: 'nerfed-medipen',
    name: 'Nerfed MediPen',
    category: 'medical',
    subcategory: 'medipen',
    description: 'Version modifiée illégalement du MediPen standard. Dosage triplé — efficace mais dangereux.',
    price: 2200,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Nine Tails Locker',    system: 'Stanton' },
      { stationId: 'ruin-station', shop: 'Ruin Black Market', system: 'Pyro'    },
    ],
    image: null,
    tags: ['médical', 'medipen', 'modifié', 'illégal', 'surdosage'],
  },
  {
    id: 'trauma-kit',
    name: 'Trauma Kit',
    category: 'medical',
    subcategory: 'kit',
    description: 'Kit complet de soins traumatologiques. Inclus bandages, seringues, défibrillateur portable.',
    price: 3200,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: 'Hospital Lobby Shop', system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',         system: 'Stanton' },
      { stationId: 'orison',      shop: 'Crusader Med Center', system: 'Stanton' },
    ],
    image: null,
    tags: ['médical', 'trauma', 'kit', 'complet', 'défibrillateur'],
  },

  // ============================================================
  // GADGETS (10)
  // ============================================================
  {
    id: 'picopackage-s1',
    name: 'Picopackage S1',
    category: 'gadget',
    subcategory: 'hack-tool',
    description: 'Outil de piratage compact niveau 1. Utilisé pour débloquer les terminaux sécurisés de base.',
    price: 3500,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Technotic',            system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects', system: 'Nyx'    },
    ],
    image: null,
    tags: ['gadget', 'piratage', 'hack', 'picopackage', 'illégal'],
  },
  {
    id: 'picopackage-s2',
    name: 'Picopackage S2',
    category: 'gadget',
    subcategory: 'hack-tool',
    description: 'Outil de piratage niveau 2. Capable de contourner les systèmes de sécurité intermédiaires.',
    price: 7800,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Technotic',            system: 'Stanton' },
      { stationId: 'checkmate', shop: 'Black Market',         system: 'Pyro'    },
    ],
    image: null,
    tags: ['gadget', 'piratage', 'hack', 'picopackage', 'illégal'],
  },
  {
    id: 'picopackage-s3',
    name: 'Picopackage S3',
    category: 'gadget',
    subcategory: 'hack-tool',
    description: 'Outil de piratage niveau 3. Craque les systèmes gouvernementaux et militaires de haut rang.',
    price: 18500,
    legal: false,
    locations: [
      { stationId: 'ruin-station', shop: 'Ruin Black Market', system: 'Pyro'   },
      { stationId: 'rats-nest',    shop: 'Underground Shop',  system: 'Pyro'   },
    ],
    image: null,
    tags: ['gadget', 'piratage', 'hack', 'picopackage', 'illégal', 'avancé'],
  },
  {
    id: 'ghost-multitool',
    name: 'Ghost Multitool',
    category: 'gadget',
    subcategory: 'multitool',
    description: 'Multitool furtif Ghost avec mode piratage intégré. Aucune signature électromagnétique détectable.',
    price: 12000,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Technotic',            system: 'Stanton' },
    ],
    image: null,
    tags: ['gadget', 'multitool', 'furtif', 'ghost', 'piratage', 'illégal'],
  },
  {
    id: 'klein-s1-multitool',
    name: 'Klein S1 Multitool',
    category: 'gadget',
    subcategory: 'multitool',
    description: 'Multitool polyvalent Klein Industries. Creuse, répare, soude. Standard chez les ingénieurs de vaisseau.',
    price: 4200,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Magpie Store",        system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Shubin Interstellar', system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['gadget', 'multitool', 'klein', 'réparation', 'ingénieur'],
  },
  {
    id: 'arc-flash-torch',
    name: 'Arc Flash Torch',
    category: 'gadget',
    subcategory: 'light',
    description: 'Lampe torche haute intensité avec mode strobe désorientation. Imperméable et résistant aux chocs.',
    price: 1800,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Magpie Store",         system: 'Stanton' },
      { stationId: 'area18',    shop: "Dumper's Depot",       system: 'Stanton' },
    ],
    image: null,
    tags: ['gadget', 'lampe', 'torche', 'arc flash', 'lumière'],
  },
  {
    id: 'frontier-handlamp',
    name: 'Frontier Handlamp',
    category: 'gadget',
    subcategory: 'light',
    description: 'Lampe à main Frontier pour travaux en espaces confinés. Tête articulée 270°.',
    price: 1200,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Magpie Store",        system: 'Stanton' },
      { stationId: 'levski',      shop: "Dumper's Depot",      system: 'Nyx'     },
    ],
    image: null,
    tags: ['gadget', 'lampe', 'frontier', 'lumière', 'travail'],
  },
  {
    id: 'emergency-beacon',
    name: 'Emergency Beacon',
    category: 'gadget',
    subcategory: 'beacon',
    description: 'Balise de détresse omni-directionnelle. Signal sur 15 fréquences UEE. Durée batterie : 72h.',
    price: 2600,
    legal: true,
    locations: [
      { stationId: 'orison',      shop: 'CasabaOutlet',        system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
    ],
    image: null,
    tags: ['gadget', 'balise', 'détresse', 'urgence', 'survie'],
  },
  {
    id: 'flare-pack',
    name: 'Flare Pack (x5)',
    category: 'gadget',
    subcategory: 'flare',
    description: 'Pack de 5 fusées éclairantes. Brûle 90 secondes, visible à 8 km. Usage tactique ou survie.',
    price: 750,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Magpie Store",         system: 'Stanton' },
      { stationId: 'area18',    shop: 'Cubby Blast',          system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects', system: 'Nyx'    },
    ],
    image: null,
    tags: ['gadget', 'fusée', 'éclairante', 'flare', 'signal', 'survie'],
  },
  {
    id: 'mining-scanner',
    name: 'Mining Scanner Pro',
    category: 'gadget',
    subcategory: 'scanner',
    description: 'Scanner de terrain pour l\'analyse minéralogique des roches. Portée 50m, 12 types de minerais détectés.',
    price: 8900,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Magpie Store",        system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Shubin Interstellar', system: 'Stanton' },
    ],
    image: null,
    tags: ['gadget', 'scanner', 'minage', 'minerais', 'analyse'],
  },

  // ============================================================
  // ARMES DE MÊLÉE (6)
  // ============================================================
  {
    id: 'combat-knife',
    name: 'Combat Knife',
    category: 'melee',
    subcategory: 'knife',
    description: 'Couteau de combat standard avec lame en alliage titane-carbone. Équilibre parfait.',
    price: 1800,
    legal: true,
    locations: [
      { stationId: 'area18',    shop: 'Cubby Blast',          system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects', system: 'Nyx'    },
    ],
    image: null,
    tags: ['mêlée', 'couteau', 'combat', 'lame'],
  },
  {
    id: 'tac-knife',
    name: 'Tac Knife',
    category: 'melee',
    subcategory: 'knife',
    description: 'Couteau tactique militaire avec lame crantée, étui de jambe inclus. Version civile d\'un modèle Forces Spéciales UEE.',
    price: 3200,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',           system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',         system: 'Stanton' },
    ],
    image: null,
    tags: ['mêlée', 'couteau', 'tactique', 'militaire', 'lame'],
  },
  {
    id: 'crowbar',
    name: 'Crowbar',
    category: 'melee',
    subcategory: 'blunt',
    description: 'Pied-de-biche en acier renforcé. Outil polyvalent : forcer des portes ou se défendre en dernier recours.',
    price: 450,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Magpie Store",         system: 'Stanton' },
      { stationId: 'levski',    shop: "Dumper's Depot",       system: 'Nyx'     },
      { stationId: 'grimhex',   shop: "Dumper's Depot",       system: 'Stanton' },
    ],
    image: null,
    tags: ['mêlée', 'pied-de-biche', 'outil', 'contondant'],
  },
  {
    id: 'baton',
    name: 'Security Baton',
    category: 'melee',
    subcategory: 'blunt',
    description: 'Matraque rétractable pour agents de sécurité. Électrifiée sur option (illégale sans licence).',
    price: 2400,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Tammany & Sons",       system: 'Stanton' },
      { stationId: 'area18',    shop: 'Center Mass',          system: 'Stanton' },
    ],
    image: null,
    tags: ['mêlée', 'matraque', 'baton', 'sécurité', 'contondant'],
  },
  {
    id: 'energy-blade',
    name: 'Energy Blade',
    category: 'melee',
    subcategory: 'energy',
    description: 'Lame à plasma magnétiquement confinée. Technologie Banu adaptée pour le marché UEE. Illégale dans plusieurs systèmes.',
    price: 28000,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Nine Tails Locker',   system: 'Stanton' },
      { stationId: 'ruin-station', shop: 'Ruin Black Market', system: 'Pyro'   },
    ],
    image: null,
    tags: ['mêlée', 'lame énergie', 'plasma', 'banu', 'illégal', 'rare'],
  },
  {
    id: 'riot-shield',
    name: 'Riot Shield',
    category: 'melee',
    subcategory: 'shield',
    description: 'Bouclier anti-émeute en polycarbonate balistique. Usage défensif, peut assommer à courte portée.',
    price: 5500,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Tammany & Sons",       system: 'Stanton' },
    ],
    image: null,
    tags: ['mêlée', 'bouclier', 'défense', 'anti-émeute'],
  },

  // ============================================================
  // ARMES FPS (5 — exemples représentatifs)
  // ============================================================
  {
    id: 'fps-p4-ar',
    name: 'P4-AR Rifle',
    category: 'fps-weapon',
    subcategory: 'rifle',
    description: 'Fusil d\'assaut Kastak Arms P4-AR. Fiable, précis, excellent rapport qualité-prix pour les beginners.',
    price: 5000,
    legal: true,
    locations: [
      { stationId: 'area18',    shop: 'Cubby Blast',          system: 'Stanton' },
      { stationId: 'lorville',  shop: "Magpie Store",         system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects', system: 'Nyx'    },
    ],
    image: null,
    tags: ['arme', 'fps', 'rifle', 'p4-ar', 'kastak', 'assaut'],
  },
  {
    id: 'fps-s71',
    name: 'S71 Rifle',
    category: 'fps-weapon',
    subcategory: 'rifle',
    description: 'Fusil balistique S71 de Gemini. Semi-auto haute précision pour engagement à longue portée.',
    price: 9500,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Center Mass',         system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',         system: 'Stanton' },
    ],
    image: null,
    tags: ['arme', 'fps', 'rifle', 's71', 'gemini', 'précision'],
  },
  {
    id: 'fps-rfl-45',
    name: 'RFL-45 Revenant',
    category: 'fps-weapon',
    subcategory: 'heavy',
    description: 'Fusil lourd anti-matériel RFL-45. Capable de percer l\'armure lourde et les blindages légers.',
    price: 32000,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Skutters',             system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects', system: 'Nyx'    },
    ],
    image: null,
    tags: ['arme', 'fps', 'heavy', 'rfl-45', 'revenant', 'anti-matériel', 'illégal'],
  },
  {
    id: 'fps-lightfire-200',
    name: 'Lightfire 200 SMG',
    category: 'fps-weapon',
    subcategory: 'smg',
    description: 'Pistolet-mitrailleur énergie Lightfire 200. Léger, compact, idéal pour les combats en intérieur.',
    price: 7200,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Center Mass',         system: 'Stanton' },
      { stationId: 'orison',      shop: 'CasabaOutlet',        system: 'Stanton' },
    ],
    image: null,
    tags: ['arme', 'fps', 'smg', 'lightfire', 'énergie', 'compact'],
  },
  {
    id: 'fps-devastator',
    name: 'Devastator Shotgun',
    category: 'fps-weapon',
    subcategory: 'shotgun',
    description: 'Fusil à pompe Devastator. Dévastateur en combat rapproché, peu précis à distance.',
    price: 6800,
    legal: true,
    locations: [
      { stationId: 'area18',    shop: 'Cubby Blast',          system: 'Stanton' },
      { stationId: 'grimhex',   shop: 'Skutters',             system: 'Stanton' },
    ],
    image: null,
    tags: ['arme', 'fps', 'shotgun', 'devastator', 'pompe'],
  },

  // ============================================================
  // ARMURES (5 — exemples représentatifs)
  // ============================================================
  {
    id: 'armor-ruto',
    name: 'Ruto Medium Armor',
    category: 'armor',
    subcategory: 'medium',
    description: 'Armure intermédiaire Kastak Arms série Ruto. Bon équilibre protection / mobilité, prisée des mercenaires.',
    price: 14500,
    legal: true,
    locations: [
      { stationId: 'area18',    shop: 'Cubby Blast',          system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',          system: 'Stanton' },
    ],
    image: null,
    tags: ['armure', 'medium', 'ruto', 'kastak', 'mercenaire'],
  },
  {
    id: 'armor-titan',
    name: 'Titan Light Armor',
    category: 'armor',
    subcategory: 'light',
    description: 'Armure légère Titan. Mobilité maximale, protection minimale. Choix des éclaireurs et infiltrateurs.',
    price: 9200,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Magpie Store",         system: 'Stanton' },
      { stationId: 'area18',    shop: 'Cubby Blast',          system: 'Stanton' },
    ],
    image: null,
    tags: ['armure', 'light', 'titan', 'légère', 'infiltration', 'éclaireur'],
  },
  {
    id: 'armor-heavy-duty',
    name: 'Heavy Duty Armor',
    category: 'armor',
    subcategory: 'heavy',
    description: 'Armure lourde industrielle. Protection maximale, mobilité réduite. Usage assaut ou opérations à fort risque.',
    price: 28000,
    legal: true,
    locations: [
      { stationId: 'new-babbage', shop: 'Omega Pro',          system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',        system: 'Stanton' },
    ],
    image: null,
    tags: ['armure', 'heavy', 'lourde', 'industrielle', 'assaut'],
  },
  {
    id: 'armor-novikov-medium',
    name: 'Novikov Medium Armor',
    category: 'armor',
    subcategory: 'medium',
    description: 'Armure de travail Novikov avec plaques balistiques intégrées. Très portée par les mineurs de Hurston.',
    price: 11800,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Magpie Store",         system: 'Stanton' },
    ],
    image: null,
    tags: ['armure', 'medium', 'novikov', 'hurston', 'minier'],
  },
  {
    id: 'armor-black-widow',
    name: 'Black Widow Light Armor',
    category: 'armor',
    subcategory: 'light',
    description: 'Armure légère Black Widow, ex-équipement des agents Nine Tails reconverti en usage semi-légal.',
    price: 22000,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Nine Tails Locker',   system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects', system: 'Nyx'    },
    ],
    image: null,
    tags: ['armure', 'light', 'black widow', 'nine tails', 'illégal'],
  },

  // ============================================================
  // ITEMS SUPPLÉMENTAIRES — pour atteindre 80+
  // ============================================================

  // Vêtements additionnels
  {
    id: 'pyro-survivor-vest',
    name: 'Pyro Survivor Vest',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Veste de survie improvisée portée par les résidents de Pyro. Plaques de récup cousues dans la doublure.',
    price: 1800,
    legal: true,
    locations: [
      { stationId: 'ruin-station', shop: 'Ruin Market',       system: 'Pyro'    },
      { stationId: 'checkmate',    shop: 'Checkmate Gear',    system: 'Pyro'    },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'veste', 'pyro', 'survie'],
  },
  {
    id: 'nyx-outlaw-coat',
    name: 'Nyx Outlaw Coat',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Long manteau de banni porté par les résistants de Levski. Symbole de rébellion contre l\'UEE.',
    price: 4100,
    legal: true,
    locations: [
      { stationId: 'levski',    shop: 'Cordrys',               system: 'Nyx'     },
    ],
    image: null,
    tags: ['vêtement', 'haut', 'manteau', 'nyx', 'résistant', 'levski'],
  },

  // Consommables additionnels
  {
    id: 'jumptown-neon',
    name: 'Jumptown Neon',
    category: 'consumable',
    subcategory: 'drug',
    description: 'Drogue de synthèse produite à Jumptown. Effets hallucinogènes puissants. Très illégale dans l\'UEE.',
    price: 4500,
    legal: false,
    locations: [
      { stationId: 'grimhex',      shop: 'Nine Tails Locker',  system: 'Stanton' },
      { stationId: 'ruin-station', shop: 'Ruin Black Market',  system: 'Pyro'    },
    ],
    image: null,
    tags: ['consommable', 'drogue', 'neon', 'jumptown', 'illégal'],
  },
  {
    id: 'terra-mills-hydrovac',
    name: 'Terra Mills HydroVac',
    category: 'consumable',
    subcategory: 'drink',
    description: 'Eau purifiée sous vide de Terra Mills. Goût neutre garanti, recommandée pour les longues missions.',
    price: 12,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: "Tammany & Sons",      system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Slipstream Bar & Grill', system: 'Stanton' },
      { stationId: 'area18',      shop: 'CasabaOutlet',        system: 'Stanton' },
      { stationId: 'orison',      shop: 'Cloud 9 Café',        system: 'Stanton' },
    ],
    image: null,
    tags: ['consommable', 'boisson', 'eau', 'hydratation', 'terra mills'],
  },

  // Gadgets additionnels
  {
    id: 'tether-gun',
    name: 'Tether Gun',
    category: 'gadget',
    subcategory: 'tool',
    description: 'Pistolet de lestage EVA. Tire un câble magnétique jusqu\'à 30m. Essentiel pour les opérations hors-vaisseau.',
    price: 5600,
    legal: true,
    locations: [
      { stationId: 'port-tressler', shop: 'Shubin Outfitters', system: 'Stanton' },
      { stationId: 'new-babbage',   shop: 'Omega Pro',         system: 'Stanton' },
    ],
    image: null,
    tags: ['gadget', 'outil', 'tether', 'eva', 'câble', 'magnétique'],
  },
  {
    id: 'decoy-emitter',
    name: 'Decoy Emitter',
    category: 'gadget',
    subcategory: 'tactical',
    description: 'Émetteur de leurre électronique. Simule une signature radar humaine pour détourner les drones ennemis.',
    price: 9200,
    legal: false,
    locations: [
      { stationId: 'grimhex',   shop: 'Technotic',             system: 'Stanton' },
      { stationId: 'levski',    shop: 'Conscientious Objects',  system: 'Nyx'     },
    ],
    image: null,
    tags: ['gadget', 'leurre', 'electronique', 'tactique', 'illégal'],
  },

  // Médical additionnel
  {
    id: 'jump-stims',
    name: 'Jump Stims',
    category: 'medical',
    subcategory: 'stim',
    description: 'Stimulant médical légal à base de caféine synthétique amplifiée. Élimine la fatigue pendant 4 heures.',
    price: 550,
    legal: true,
    locations: [
      { stationId: 'lorville',    shop: 'Hospital Lobby Shop',  system: 'Stanton' },
      { stationId: 'new-babbage', shop: 'Omega Pro',            system: 'Stanton' },
      { stationId: 'area18',      shop: 'Cubby Blast',          system: 'Stanton' },
    ],
    image: null,
    tags: ['médical', 'stim', 'stimulant', 'fatigue', 'légal'],
  },

  // Arme mêlée additionnelle
  {
    id: 'plasma-cutter-melee',
    name: 'Plasma Cutter (usage défensif)',
    category: 'melee',
    subcategory: 'tool-weapon',
    description: 'Coupe-plasma industriel détourné en arme de fortune. Dommages thermiques importants, portée très courte.',
    price: 3800,
    legal: true,
    locations: [
      { stationId: 'lorville',  shop: "Magpie Store",           system: 'Stanton' },
      { stationId: 'levski',    shop: "Dumper's Depot",         system: 'Nyx'     },
    ],
    image: null,
    tags: ['mêlée', 'plasma', 'outil', 'thermique', 'industriel'],
  },
];

// ─── Index et helpers ─────────────────────────────────────────────────────────

export const ITEMS_BY_ID = ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const ITEMS_BY_CATEGORY = ITEMS.reduce((acc, item) => {
  acc[item.category] = acc[item.category] || [];
  acc[item.category].push(item);
  return acc;
}, {});

export const ITEMS_COUNT_BY_CATEGORY = ITEMS_CATEGORIES.map(cat => ({
  ...cat,
  count: ITEMS.filter(i => i.category === cat.id).length,
}));

/** Retourne les items d'une station donnée */
export function getItemsByStation(stationId) {
  return ITEMS.filter(item =>
    item.locations.some(loc => loc.stationId === stationId)
  );
}

/** Retourne tous les shops distincts d'un item */
export function getItemShops(item) {
  return item.locations;
}

export default ITEMS;
