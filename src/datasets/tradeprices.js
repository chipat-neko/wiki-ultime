/**
 * Prix des commodités par station — Star Citizen Alpha 4.0
 * Format: 'commodity-id': [prix_achat, prix_vente] en aUEC/SCU
 * buy: 0 = la station ne vend pas cette commodité
 * sell: 0 = la station n'achète pas cette commodité
 * Source : approximations basées sur les données communautaires SC 4.0
 */

export const STATION_PRICES = {

  // ================================================================
  // STANTON — Zones d'Atterrissage Principales
  // ================================================================

  'lorville': {
    // Hurston — TDD + New Deal + marchands industriels
    'quantainium':        [0, 8750],
    'bexalite':           [0, 955],
    'laranite':           [0, 496],
    'agricium':           [0, 3800],
    'taranite':           [0, 875],
    'hadanite':           [0, 3350],
    'hephaestanite':      [0, 3200],
    'aphorite':           [0, 2530],
    'borase':             [0, 658],
    'diamond':            [0, 95],
    'gold':               [0, 68],
    'beryl':              [0, 340],
    'aluminum':           [218, 268],
    'titanium':           [875, 1025],
    'tungsten':           [3900, 4250],
    'copper':             [0, 3],
    'iron':               [0, 1],
    'steel':              [402, 490],
    'cobalt':             [645, 768],
    'construction-materials': [198, 252],
    'medical-supplies':   [4, 0],
    'stims':              [4, 0],
    'processed-food':     [0, 1],
    'agricultural-goods': [108, 154],
    'agricultural-supplies': [1, 0],
    'compboard':          [295, 355],
    'consumer-goods':     [96, 138],
    'hydrogen':           [150, 0],
    'rmc':                [0, 2],
    'scrap':              [0, 88],
    'detatrine':          [1340, 0],
    'diluthermex':        [1755, 0],
    'coal':               [52, 88],
    'wax':                [2425, 0],
    'bioplastic':         [180, 228],
    'fresh-food':         [210, 275],
    'distilled-spirits':  [242, 298],
  },

  'area18': {
    // ArcCorp — TDD + Dumper's Depot + centre commercial
    'quantainium':        [0, 8600],
    'bexalite':           [0, 950],
    'laranite':           [0, 490],
    'agricium':           [0, 3780],
    'taranite':           [0, 868],
    'diamond':            [0, 92],
    'gold':               [0, 65],
    'beryl':              [0, 335],
    'aluminum':           [215, 265],
    'titanium':           [870, 1020],
    'tungsten':           [3890, 4240],
    'copper':             [0, 3],
    'steel':              [398, 485],
    'compboard':          [292, 352],
    'consumer-goods':     [94, 135],
    'moby-glass':         [1510, 1742],
    'medical-supplies':   [4, 0],
    'stims':              [4, 0],
    'processed-food':     [0, 1],
    'fresh-food':         [208, 272],
    'agricultural-goods': [105, 150],
    'distilled-spirits':  [240, 295],
    'hydrogen':           [148, 0],
    'scrap':              [0, 86],
    'rmc':                [0, 2],
    'construction-materials': [195, 248],
    'carbon-silk':        [1195, 1368],
    'neograph':           [1330, 1530],
    'silicon':            [205, 265],
    'bioplastic':         [178, 225],
    'detatrine':          [1335, 0],
  },

  'new-babbage': {
    // MicroTech — TDD + Shubin + tech avancée
    'quantainium':        [0, 8800],
    'bexalite':           [0, 960],
    'laranite':           [0, 500],
    'agricium':           [0, 3820],
    'taranite':           [0, 880],
    'hadanite':           [0, 3360],
    'hephaestanite':      [0, 3210],
    'diamond':            [0, 97],
    'gold':               [0, 70],
    'aluminum':           [220, 270],
    'titanium':           [878, 1028],
    'tungsten':           [3905, 4255],
    'steel':              [405, 492],
    'compboard':          [298, 358],
    'neograph':           [1325, 1525],
    'silicon':            [202, 262],
    'moby-glass':         [1505, 1738],
    'medical-supplies':   [4, 0],
    'stims':              [4, 0],
    'consumer-goods':     [95, 136],
    'processed-food':     [0, 1],
    'fresh-food':         [212, 278],
    'agricultural-goods': [110, 156],
    'distilled-spirits':  [244, 300],
    'hydrogen':           [152, 0],
    'scrap':              [0, 90],
    'rmc':                [0, 2],
    'construction-materials': [200, 255],
    'detatrine':          [1342, 0],
    'diluthermex':        [1758, 0],
    'carbon-silk':        [1198, 1372],
    'titanium-alloy':     [1280, 1455],
    'anti-hydrogen':      [1880, 0],
  },

  'orison': {
    // Crusader — station atmosphérique, moins de commerce minier
    'compboard':          [292, 350],
    'aluminum':           [214, 264],
    'titanium':           [868, 1018],
    'steel':              [398, 488],
    'consumer-goods':     [93, 132],
    'processed-food':     [0, 1],
    'fresh-food':         [205, 268],
    'agricultural-goods': [103, 148],
    'distilled-spirits':  [238, 292],
    'medical-supplies':   [4, 0],
    'stims':              [4, 0],
    'hydrogen':           [146, 0],
    'rmc':                [0, 2],
    'bioplastic':         [176, 222],
    'construction-materials': [192, 244],
    'laranite':           [0, 488],
    'gold':               [0, 64],
    'diamond':            [0, 91],
    'scrap':              [0, 85],
  },

  // ================================================================
  // STANTON — Stations de Lagrange (avec raffineries)
  // ================================================================

  'cru-l1': {
    // Raffinerie Crusader L1 — hub minier important
    'quantainium':        [1200, 8650],
    'bexalite':           [800, 945],
    'laranite':           [380, 488],
    'agricium':           [3595, 3782],
    'taranite':           [750, 865],
    'hadanite':           [0, 3340],
    'hephaestanite':      [2900, 3185],
    'aphorite':           [2280, 2520],
    'borase':             [550, 648],
    'stileron':           [2680, 2962],
    'diamond':            [78, 92],
    'gold':               [52, 66],
    'beryl':              [288, 332],
    'aluminum':           [210, 260],
    'titanium':           [860, 1010],
    'tungsten':           [3880, 4230],
    'steel':              [394, 482],
    'compboard':          [288, 348],
    'consumer-goods':     [91, 130],
    'medical-supplies':   [4, 0],
    'hydrogen':           [143, 0],
    'scrap':              [0, 84],
    'rmc':                [0, 2],
    'construction-materials': [190, 242],
  },

  'hur-l1': {
    // Hurston L1 — raffinerie + commerce
    'quantainium':        [1195, 8640],
    'laranite':           [375, 485],
    'agricium':           [3590, 3775],
    'bexalite':           [795, 940],
    'taranite':           [745, 860],
    'diamond':            [76, 90],
    'gold':               [50, 64],
    'aluminum':           [208, 258],
    'titanium':           [858, 1008],
    'tungsten':           [3875, 4225],
    'steel':              [392, 480],
    'hydrogen':           [141, 0],
    'scrap':              [0, 83],
    'rmc':                [0, 2],
    'compboard':          [285, 345],
    'consumer-goods':     [90, 128],
    'construction-materials': [188, 240],
  },

  'arc-l1': {
    // ArcCorp L1 — raffinerie + électronique
    'quantainium':        [1200, 8620],
    'laranite':           [378, 487],
    'agricium':           [3592, 3778],
    'bexalite':           [797, 942],
    'diamond':            [77, 91],
    'gold':               [51, 65],
    'aluminum':           [212, 262],
    'titanium':           [862, 1012],
    'silicon':            [198, 258],
    'compboard':          [290, 350],
    'neograph':           [1322, 1522],
    'hydrogen':           [144, 0],
    'scrap':              [0, 85],
    'rmc':                [0, 2],
    'construction-materials': [192, 245],
    'consumer-goods':     [92, 131],
  },

  'mic-l1': {
    // MicroTech L1 — raffinerie + tech
    'quantainium':        [1205, 8720],
    'laranite':           [382, 495],
    'agricium':           [3598, 3795],
    'bexalite':           [802, 948],
    'hadanite':           [0, 3345],
    'diamond':            [79, 94],
    'gold':               [53, 68],
    'aluminum':           [216, 265],
    'titanium':           [870, 1020],
    'silicon':            [203, 262],
    'compboard':          [294, 354],
    'neograph':           [1328, 1528],
    'titanium-alloy':     [1275, 1450],
    'hydrogen':           [148, 0],
    'anti-hydrogen':      [1875, 0],
    'scrap':              [0, 87],
    'rmc':                [0, 2],
    'construction-materials': [196, 250],
    'consumer-goods':     [93, 133],
  },

  // ================================================================
  // STANTON — Stations Orbitales
  // ================================================================

  'port-tressler': {
    // MicroTech Orbite — grand hub commercial
    'quantainium':        [0, 8780],
    'bexalite':           [0, 958],
    'laranite':           [0, 498],
    'agricium':           [0, 3815],
    'taranite':           [0, 877],
    'diamond':            [0, 96],
    'gold':               [0, 69],
    'aluminum':           [219, 269],
    'titanium':           [876, 1026],
    'tungsten':           [3902, 4252],
    'steel':              [403, 491],
    'compboard':          [296, 356],
    'neograph':           [1327, 1527],
    'silicon':            [204, 264],
    'moby-glass':         [1508, 1740],
    'medical-supplies':   [4, 0],
    'stims':              [4, 0],
    'consumer-goods':     [95, 135],
    'processed-food':     [0, 1],
    'fresh-food':         [211, 276],
    'hydrogen':           [151, 0],
    'scrap':              [0, 89],
    'rmc':                [0, 2],
    'construction-materials': [199, 253],
  },

  // ================================================================
  // STANTON — GrimHEX / Pyrochem (marché illégal)
  // ================================================================

  'grimhex': {
    // Yela Belt — hub criminel, marché noir
    'widow':              [14000, 16500],
    'slam':               [800, 1100],
    'uncut-slam':         [295, 372],
    'maze':               [1000, 1350],
    'glow':               [885, 1058],
    'altruciatoxin':      [2800, 3600],
    'mala':               [710, 852],
    'thrust':             [1440, 1712],
    'freeze':             [1720, 2052],
    'zip':                [958, 1145],
    'neon-drug':          [1250, 1655],
    'dcsr2':              [398, 485],
    'stims-illegal':      [192, 248],
    'contraband-tech':    [2520, 3180],
    'stolen-medical':     [445, 588],
    'weapons-cache':      [3380, 4280],
    'hydrogen':           [155, 0],
    'scrap':              [0, 92],
    'rmc':                [0, 2],
    'construction-materials': [200, 255],
    'aluminum':           [222, 272],
    'steel':              [406, 494],
    'medical-supplies':   [5, 0],
    'stims':              [5, 0],
  },

  'pyrochem': {
    // Alias GrimHEX — mêmes prix (même station)
    'widow':              [14000, 16500],
    'slam':               [800, 1100],
    'uncut-slam':         [295, 372],
    'maze':               [1000, 1350],
    'glow':               [885, 1058],
    'altruciatoxin':      [2800, 3600],
    'neon-drug':          [1250, 1655],
    'contraband-tech':    [2520, 3180],
    'stolen-medical':     [445, 588],
    'weapons-cache':      [3380, 4280],
    'hydrogen':           [155, 0],
    'scrap':              [0, 92],
    'rmc':                [0, 2],
  },

  // ================================================================
  // NYX — Levski (Delamar)
  // ================================================================

  'levski': {
    // Delamar — avant-poste indépendant, marché gris
    'quantainium':        [1195, 8680],
    'bexalite':           [792, 938],
    'laranite':           [372, 480],
    'agricium':           [3585, 3770],
    'taranite':           [742, 858],
    'hadanite':           [0, 3330],
    'hephaestanite':      [2892, 3175],
    'aphorite':           [2275, 2515],
    'borase':             [545, 642],
    'diamond':            [75, 89],
    'gold':               [49, 62],
    'beryl':              [285, 328],
    'stileron':           [2675, 2955],
    'aluminum':           [206, 255],
    'titanium':           [855, 1005],
    'tungsten':           [3868, 4218],
    'steel':              [390, 478],
    'copper':             [0, 3],
    'compboard':          [284, 343],
    'consumer-goods':     [89, 127],
    'medical-supplies':   [4, 0],
    'stims':              [4, 0],
    'processed-food':     [0, 1],
    'fresh-food':         [202, 264],
    'agricultural-goods': [102, 145],
    'distilled-spirits':  [236, 290],
    'hydrogen':           [140, 0],
    'scrap':              [0, 82],
    'rmc':                [0, 2],
    'construction-materials': [185, 238],
    // Marché gris Levski
    'widow':              [13800, 16200],
    'slam':               [792, 1088],
    'maze':               [992, 1340],
    'altruciatoxin':      [2775, 3570],
    'neon-drug':          [1240, 1640],
    'contraband-tech':    [2495, 3145],
  },

  // ================================================================
  // PYRO — Stations Criminelles (Alpha 4.0)
  // ================================================================

  'ruin-station': {
    // Bloom (Pyro IV) — plus grand hub de Pyro
    'quantainium':        [1180, 8550],
    'bexalite':           [778, 920],
    'laranite':           [360, 465],
    'agricium':           [3560, 3740],
    'taranite':           [728, 840],
    'hephaestanite':      [2870, 3155],
    'volcanic-mineral':   [1165, 1385],
    'pyrite':             [0, 620],
    'pyro-salvage':       [0, 162],
    'stileron':           [2660, 2935],
    'aphorite':           [2260, 2495],
    'diamond':            [72, 85],
    'gold':               [47, 60],
    'aluminum':           [200, 248],
    'titanium':           [845, 995],
    'steel':              [382, 468],
    'scrap':              [0, 80],
    'rmc':                [0, 2],
    'construction-materials': [178, 228],
    'hydrogen':           [160, 0],
    'medical-supplies':   [5, 0],
    'stolen-medical':     [440, 582],
    'widow':              [13600, 16000],
    'slam':               [780, 1075],
    'uncut-slam':         [288, 362],
    'maze':               [982, 1325],
    'neon-drug':          [1230, 1638],
    'glow':               [876, 1045],
    'altruciatoxin':      [2755, 3545],
    'thrust':             [1428, 1698],
    'freeze':             [1706, 2034],
    'zip':                [948, 1132],
    'contraband-tech':    [2478, 3140],
    'weapons-cache':      [3345, 4240],
  },

  'checkmate': {
    // Monox (Pyro II) — hub Pyrotechniians
    'quantainium':        [1175, 8520],
    'bexalite':           [775, 915],
    'laranite':           [358, 462],
    'volcamic-mineral':   [1162, 1382],
    'pyrite':             [0, 615],
    'pyro-salvage':       [0, 158],
    'diamond':            [71, 84],
    'gold':               [46, 59],
    'aluminum':           [198, 245],
    'titanium':           [842, 992],
    'steel':              [380, 465],
    'hydrogen':           [162, 0],
    'scrap':              [0, 79],
    'rmc':                [0, 2],
    'medical-supplies':   [5, 0],
    'stolen-medical':     [438, 578],
    'widow':              [13500, 15900],
    'slam':               [778, 1072],
    'maze':               [980, 1320],
    'neon-drug':          [1228, 1632],
    'glow':               [874, 1042],
    'contraband-tech':    [2472, 3130],
    'weapons-cache':      [3340, 4230],
  },

  'orbituary': {
    // Pyro I orbite — récupérateurs et épaviers
    'quantainium':        [0, 8480],
    'pyro-salvage':       [0, 168],
    'scrap':              [0, 95],
    'rmc':                [0, 2],
    'pyrite':             [0, 605],
    'aluminum':           [195, 242],
    'titanium':           [838, 988],
    'steel':              [376, 460],
    'hydrogen':           [165, 0],
    'construction-materials': [174, 222],
    'weapons-cache':      [3320, 4200],
  },

  'patch-city': {
    // Pyro III orbite — refuge de fugitifs
    'widow':              [13450, 15850],
    'slam':               [775, 1068],
    'maze':               [978, 1315],
    'neon-drug':          [1225, 1628],
    'glow':               [872, 1038],
    'altruciatoxin':      [2742, 3528],
    'weapons-cache':      [3330, 4215],
    'stolen-medical':     [435, 574],
    'hydrogen':           [168, 0],
    'scrap':              [0, 78],
    'rmc':                [0, 2],
    'medical-supplies':   [6, 0],
    'aluminum':           [196, 244],
    'construction-materials': [175, 224],
  },

  'rats-nest': {
    // Ceinture d'astéroïdes Pyro — marché noir actif
    'widow':              [13400, 15800],
    'slam':               [772, 1065],
    'uncut-slam':         [285, 358],
    'maze':               [975, 1310],
    'neon-drug':          [1222, 1622],
    'glow':               [870, 1035],
    'altruciatoxin':      [2738, 3520],
    'dcsr2':              [392, 478],
    'stims-illegal':      [188, 242],
    'contraband-tech':    [2465, 3120],
    'stolen-medical':     [432, 570],
    'weapons-cache':      [3325, 4205],
    'pyro-salvage':       [0, 155],
    'scrap':              [0, 76],
  },

  'endgame': {
    // Pyro V orbite — dernier avant-poste
    'quantainium':        [0, 8440],
    'bexalite':           [0, 898],
    'volcanic-mineral':   [1158, 1375],
    'pyrite':             [0, 598],
    'pyro-salvage':       [0, 152],
    'scrap':              [0, 74],
    'rmc':                [0, 2],
    'hydrogen':           [172, 0],
    'medical-supplies':   [6, 0],
    'weapons-cache':      [3310, 4190],
    'slam':               [770, 1062],
    'aluminum':           [193, 240],
  },

  'dudley-daughters': {
    // Pyro VI (Fuego) — commerce familial neutre
    'volcanic-mineral':   [1155, 1372],
    'pyrite':             [0, 595],
    'pyro-salvage':       [0, 150],
    'scrap':              [0, 73],
    'rmc':                [0, 2],
    'hydrogen':           [170, 0],
    'medical-supplies':   [5, 0],
    'stims':              [5, 0],
    'fresh-food':         [215, 285],
    'processed-food':     [0, 1],
    'agricultural-goods': [112, 158],
    'distilled-spirits':  [248, 308],
    'consumer-goods':     [99, 142],
    'aluminum':           [192, 238],
    'construction-materials': [172, 220],
    'weapons-cache':      [3305, 4182],
    'slam':               [768, 1058],
    'widow':              [13350, 15750],
    'neon-drug':          [1218, 1615],
  },

  'windfall': {
    // Pyro III surface — avant-poste criminel
    'widow':              [13300, 15700],
    'slam':               [765, 1055],
    'maze':               [970, 1302],
    'neon-drug':          [1215, 1608],
    'weapons-cache':      [3298, 4175],
    'stolen-medical':     [428, 565],
    'scrap':              [0, 72],
    'hydrogen':           [175, 0],
    'medical-supplies':   [6, 0],
    'agricultural-goods': [110, 155],
    'fresh-food':         [212, 280],
    'construction-materials': [170, 218],
  },

  'rustville': {
    // Pyro II surface — communauté minière
    'quantainium':        [0, 8400],
    'volcanic-mineral':   [1150, 1365],
    'pyrite':             [0, 585],
    'pyro-salvage':       [0, 148],
    'scrap':              [0, 70],
    'rmc':                [0, 2],
    'aluminum':           [190, 235],
    'titanium':           [832, 982],
    'steel':              [372, 455],
    'hydrogen':           [178, 0],
    'agricultural-goods': [108, 152],
    'fresh-food':         [210, 276],
    'construction-materials': [168, 215],
  },
};

// ================================================================
// TOP ROUTES COMMERCIALES RECOMMANDÉES
// ================================================================

export const TOP_TRADE_ROUTES = [
  {
    id: 'route-01',
    from: 'levski',
    fromName: 'Levski (Delamar)',
    to: 'lorville',
    toName: 'Lorville (Hurston)',
    commodity: 'agricium',
    commodityName: 'Agricium',
    buyPrice: 3585,
    sellPrice: 3800,
    profitPerSCU: 215,
    profitPerRun: 21500,
    cargoRef: 100,
    distance: 'Stanton — Nyx (inter-système)',
    risk: 'Faible',
    legal: true,
    notes: 'Route classique très stable. PvP rare, profit fiable.',
  },
  {
    id: 'route-02',
    from: 'cru-l1',
    fromName: 'CRU-L1 (Crusader L1)',
    to: 'lorville',
    toName: 'Lorville (Hurston)',
    commodity: 'quantainium',
    commodityName: 'Quantainium',
    buyPrice: 1200,
    sellPrice: 8750,
    profitPerSCU: 7550,
    profitPerRun: 755000,
    cargoRef: 100,
    distance: 'Stanton intra-système',
    risk: 'Élevé',
    legal: true,
    notes: 'Profit énorme mais Quantainium instable — risque d\'explosion. Vaisseaux blindés recommandés.',
  },
  {
    id: 'route-03',
    from: 'cru-l1',
    fromName: 'CRU-L1 (Crusader L1)',
    to: 'new-babbage',
    toName: 'New Babbage (MicroTech)',
    commodity: 'laranite',
    commodityName: 'Laranite',
    buyPrice: 380,
    sellPrice: 500,
    profitPerSCU: 120,
    profitPerRun: 12000,
    cargoRef: 100,
    distance: 'Stanton intra-système',
    risk: 'Faible',
    legal: true,
    notes: 'Route de débutant idéale. Stable, légale, rentable en volume.',
  },
  {
    id: 'route-04',
    from: 'grimhex',
    fromName: 'GrimHEX (Yela)',
    to: 'levski',
    toName: 'Levski (Delamar)',
    commodity: 'widow',
    commodityName: 'WiDoW',
    buyPrice: 14000,
    sellPrice: 16200,
    profitPerSCU: 2200,
    profitPerRun: 110000,
    cargoRef: 50,
    distance: 'Stanton — Nyx (inter-système)',
    risk: 'Très élevé',
    legal: false,
    notes: 'Route contrebande haute valeur. Scan de douane fatal. Cargo petit format recommandé.',
  },
  {
    id: 'route-05',
    from: 'levski',
    fromName: 'Levski (Delamar)',
    to: 'new-babbage',
    toName: 'New Babbage (MicroTech)',
    commodity: 'bexalite',
    commodityName: 'Bexalite',
    buyPrice: 792,
    sellPrice: 960,
    profitPerSCU: 168,
    profitPerRun: 16800,
    cargoRef: 100,
    distance: 'Nyx — Stanton (inter-système)',
    risk: 'Faible',
    legal: true,
    notes: 'Bonne route retour après livraison dans Nyx.',
  },
  {
    id: 'route-06',
    from: 'arc-l1',
    fromName: 'ARC-L1 (ArcCorp L1)',
    to: 'area18',
    toName: 'Area18 (ArcCorp)',
    commodity: 'tungsten',
    commodityName: 'Tungstène',
    buyPrice: 3880,
    sellPrice: 4240,
    profitPerSCU: 360,
    profitPerRun: 36000,
    cargoRef: 100,
    distance: 'Stanton intra-système (court)',
    risk: 'Très faible',
    legal: true,
    notes: 'Trajet très court, profit/heure excellent pour un cargo moyen.',
  },
  {
    id: 'route-07',
    from: 'ruin-station',
    fromName: 'Ruin Station (Pyro IV)',
    to: 'grimhex',
    toName: 'GrimHEX (Stanton)',
    commodity: 'neon-drug',
    commodityName: 'Néon (Drogue)',
    buyPrice: 1230,
    sellPrice: 1655,
    profitPerSCU: 425,
    profitPerRun: 42500,
    cargoRef: 100,
    distance: 'Pyro — Stanton (inter-système)',
    risk: 'Très élevé',
    legal: false,
    notes: 'Export de Pyro risqué. Passage de saut surveillé. Gros profits pour les audacieux.',
  },
  {
    id: 'route-08',
    from: 'lorville',
    fromName: 'Lorville (Hurston)',
    to: 'ruin-station',
    toName: 'Ruin Station (Pyro IV)',
    commodity: 'medical-supplies',
    commodityName: 'Fournitures Médicales',
    buyPrice: 4,
    sellPrice: 5,
    profitPerSCU: 1,
    profitPerRun: 1000,
    cargoRef: 1000,
    distance: 'Stanton — Pyro (inter-système)',
    risk: 'Élevé',
    legal: true,
    notes: 'Faible marge mais médicaments très demandés à Pyro. Compenser par gros volume (500-1000 SCU).',
  },
  {
    id: 'route-09',
    from: 'mic-l1',
    fromName: 'MIC-L1 (MicroTech L1)',
    to: 'port-tressler',
    toName: 'Port Tressler (MicroTech Orbite)',
    commodity: 'hadanite',
    commodityName: 'Hadanite',
    buyPrice: 0,
    sellPrice: 3360,
    profitPerSCU: 3360,
    profitPerRun: 33600,
    cargoRef: 10,
    distance: 'Stanton intra-système (très court)',
    risk: 'Faible',
    legal: true,
    notes: 'Hadanite uniquement minable — pas d\'achat. Vente après minage dans les lunes de MicroTech.',
  },
  {
    id: 'route-10',
    from: 'levski',
    fromName: 'Levski (Delamar)',
    to: 'area18',
    toName: 'Area18 (ArcCorp)',
    commodity: 'taranite',
    commodityName: 'Taranite',
    buyPrice: 742,
    sellPrice: 868,
    profitPerSCU: 126,
    profitPerRun: 12600,
    cargoRef: 100,
    distance: 'Nyx — Stanton (inter-système)',
    risk: 'Faible',
    legal: true,
    notes: 'Complément à la route Levski → Lorville, en passant par ArcCorp.',
  },
  {
    id: 'route-11',
    from: 'cru-l1',
    fromName: 'CRU-L1 (Crusader L1)',
    to: 'lorville',
    toName: 'Lorville (Hurston)',
    commodity: 'titanium',
    commodityName: 'Titane',
    buyPrice: 860,
    sellPrice: 1025,
    profitPerSCU: 165,
    profitPerRun: 16500,
    cargoRef: 100,
    distance: 'Stanton intra-système',
    risk: 'Très faible',
    legal: true,
    notes: 'Route industrielle fiable, bon profit/heure avec gros cargo.',
  },
  {
    id: 'route-12',
    from: 'grimhex',
    fromName: 'GrimHEX (Yela)',
    to: 'ruin-station',
    toName: 'Ruin Station (Pyro IV)',
    commodity: 'slam',
    commodityName: 'SLAM',
    buyPrice: 800,
    sellPrice: 1075,
    profitPerSCU: 275,
    profitPerRun: 27500,
    cargoRef: 100,
    distance: 'Stanton — Pyro (inter-système)',
    risk: 'Très élevé',
    legal: false,
    notes: 'Approvisionnement de Pyro depuis Stanton. Passage de saut très risqué.',
  },
  {
    id: 'route-13',
    from: 'arc-l1',
    fromName: 'ARC-L1 (ArcCorp L1)',
    to: 'port-tressler',
    toName: 'Port Tressler (MicroTech Orbite)',
    commodity: 'agricium',
    commodityName: 'Agricium',
    buyPrice: 3592,
    sellPrice: 3815,
    profitPerSCU: 223,
    profitPerRun: 22300,
    cargoRef: 100,
    distance: 'Stanton intra-système',
    risk: 'Faible',
    legal: true,
    notes: 'Route inter-planétaire confortable avec bon retour sur investissement.',
  },
  {
    id: 'route-14',
    from: 'levski',
    fromName: 'Levski (Delamar)',
    to: 'grimhex',
    toName: 'GrimHEX (Stanton)',
    commodity: 'altruciatoxin',
    commodityName: 'Altruciatoxine',
    buyPrice: 2775,
    sellPrice: 3600,
    profitPerSCU: 825,
    profitPerRun: 41250,
    cargoRef: 50,
    distance: 'Nyx — Stanton (inter-système)',
    risk: 'Élevé',
    legal: false,
    notes: 'Drogue rare à haute valeur. Peu de concurrents sur cette route.',
  },
];

// ================================================================
// MÉTADONNÉES COMMODITÉS ENRICHIES
// ================================================================

export const COMMODITY_META = {
  'quantainium': {
    maxBuyPrice: 1205,
    maxSellPrice: 8800,
    bestBuyAt: ['cru-l1', 'hur-l1', 'arc-l1', 'mic-l1'],
    bestSellAt: ['new-babbage', 'lorville', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'very-high',
    category: 'mineral',
    icon: '💎',
    tip: 'Instable — risque d\'explosion en cas de dommages de coque',
  },
  'agricium': {
    maxBuyPrice: 3598,
    maxSellPrice: 3820,
    bestBuyAt: ['cru-l1', 'levski', 'arc-l1', 'mic-l1'],
    bestSellAt: ['new-babbage', 'lorville', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'mineral',
    icon: '🟢',
    tip: 'Métal stable, route de choix pour débutants',
  },
  'bexalite': {
    maxBuyPrice: 802,
    maxSellPrice: 960,
    bestBuyAt: ['cru-l1', 'hur-l1', 'levski'],
    bestSellAt: ['new-babbage', 'area18', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'mineral',
    icon: '🔵',
    tip: 'Bon minerai de transition, marché stable',
  },
  'laranite': {
    maxBuyPrice: 382,
    maxSellPrice: 500,
    bestBuyAt: ['cru-l1', 'hur-l1', 'levski'],
    bestSellAt: ['new-babbage', 'orison', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'mineral',
    icon: '🟡',
    tip: 'Excellent ratio profit/risque pour les débutants',
  },
  'taranite': {
    maxBuyPrice: 750,
    maxSellPrice: 880,
    bestBuyAt: ['cru-l1', 'levski'],
    bestSellAt: ['new-babbage', 'lorville'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'mineral',
    icon: '🟠',
    tip: 'Minable ou acheté en raffinerie',
  },
  'hadanite': {
    maxBuyPrice: 0,
    maxSellPrice: 3360,
    bestBuyAt: [],
    bestSellAt: ['new-babbage', 'lorville', 'mic-l1'],
    legalStatus: 'legal',
    volatility: 'medium',
    category: 'mineral',
    icon: '🔴',
    tip: 'Uniquement minable — non disponible à l\'achat',
  },
  'hephaestanite': {
    maxBuyPrice: 2900,
    maxSellPrice: 3210,
    bestBuyAt: ['cru-l1', 'levski'],
    bestSellAt: ['new-babbage', 'lorville', 'ruin-station'],
    legalStatus: 'legal',
    volatility: 'medium',
    category: 'mineral',
    icon: '🟤',
    tip: 'Très demandé dans les chantiers navals',
  },
  'tungsten': {
    maxBuyPrice: 3905,
    maxSellPrice: 4255,
    bestBuyAt: ['cru-l1', 'arc-l1', 'lorville'],
    bestSellAt: ['area18', 'new-babbage', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'metal',
    icon: '⬜',
    tip: 'Métal industriel lourd, bon profit en volume',
  },
  'titanium': {
    maxBuyPrice: 878,
    maxSellPrice: 1028,
    bestBuyAt: ['cru-l1', 'levski'],
    bestSellAt: ['lorville', 'new-babbage', 'area18'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'metal',
    icon: '⚪',
    tip: 'Route industrielle classique, stable',
  },
  'widow': {
    maxBuyPrice: 14000,
    maxSellPrice: 16500,
    bestBuyAt: ['grimhex', 'pyrochem', 'ruin-station'],
    bestSellAt: ['levski', 'grimhex', 'rats-nest'],
    legalStatus: 'illegal',
    volatility: 'high',
    category: 'drug',
    icon: '☠️',
    tip: 'Narcotique illégal — scan de douane = prison assurée',
  },
  'slam': {
    maxBuyPrice: 800,
    maxSellPrice: 1100,
    bestBuyAt: ['grimhex', 'levski'],
    bestSellAt: ['ruin-station', 'checkmate', 'patch-city'],
    legalStatus: 'illegal',
    volatility: 'medium',
    category: 'drug',
    icon: '⚠️',
    tip: 'Drogue de combat populaire dans Pyro',
  },
  'maze': {
    maxBuyPrice: 1000,
    maxSellPrice: 1350,
    bestBuyAt: ['grimhex', 'levski'],
    bestSellAt: ['ruin-station', 'rats-nest', 'patch-city'],
    legalStatus: 'illegal',
    volatility: 'medium',
    category: 'drug',
    icon: '⚠️',
    tip: 'Hallucinogène — forte demande dans les stations illégales',
  },
  'neon-drug': {
    maxBuyPrice: 1250,
    maxSellPrice: 1655,
    bestBuyAt: ['ruin-station', 'checkmate'],
    bestSellAt: ['grimhex', 'levski', 'rats-nest'],
    legalStatus: 'illegal',
    volatility: 'high',
    category: 'drug',
    icon: '🟣',
    tip: 'Produit typique de Pyro, très demandé dans Stanton',
  },
  'altruciatoxin': {
    maxBuyPrice: 2800,
    maxSellPrice: 3600,
    bestBuyAt: ['grimhex', 'levski'],
    bestSellAt: ['ruin-station', 'grimhex', 'dudley-daughters'],
    legalStatus: 'illegal',
    volatility: 'medium',
    category: 'drug',
    icon: '🔮',
    tip: 'Drogue rare à haute valeur unitaire',
  },
  'medical-supplies': {
    maxBuyPrice: 6,
    maxSellPrice: 6,
    bestBuyAt: ['lorville', 'area18', 'new-babbage'],
    bestSellAt: ['ruin-station', 'checkmate', 'endgame'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'medical',
    icon: '🏥',
    tip: 'Très demandé dans Pyro — compenser la faible marge par le volume',
  },
  'steel': {
    maxBuyPrice: 406,
    maxSellPrice: 494,
    bestBuyAt: ['cru-l1', 'levski', 'lorville'],
    bestSellAt: ['area18', 'new-babbage', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'metal',
    icon: '🔩',
    tip: 'Métal de base universel, présent partout',
  },
  'aluminum': {
    maxBuyPrice: 222,
    maxSellPrice: 272,
    bestBuyAt: ['levski', 'cru-l1'],
    bestSellAt: ['grimhex', 'lorville', 'area18'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'metal',
    icon: '🥈',
    tip: 'Métal commun, utile pour remplir un cargo à faible coût',
  },
  'compboard': {
    maxBuyPrice: 298,
    maxSellPrice: 358,
    bestBuyAt: ['levski', 'cru-l1'],
    bestSellAt: ['area18', 'new-babbage', 'port-tressler'],
    legalStatus: 'legal',
    volatility: 'low',
    category: 'electronic',
    icon: '💡',
    tip: 'Composant électronique demandé dans les grandes villes',
  },
};

// ================================================================
// FONCTIONS UTILITAIRES
// ================================================================

/**
 * Retourne le prix d'achat d'une commodité dans une station
 * @param {string} stationId
 * @param {string} commodityId
 * @returns {number} 0 si non disponible
 */
export function getBuyPrice(stationId, commodityId) {
  return STATION_PRICES[stationId]?.[commodityId]?.[0] ?? 0;
}

/**
 * Retourne le prix de vente d'une commodité dans une station
 * @param {string} stationId
 * @param {string} commodityId
 * @returns {number} 0 si la station n'achète pas
 */
export function getSellPrice(stationId, commodityId) {
  return STATION_PRICES[stationId]?.[commodityId]?.[1] ?? 0;
}

/**
 * Calcule le profit par SCU entre deux stations pour une commodité
 */
export function calcStationProfit(fromStationId, toStationId, commodityId) {
  const buy = getBuyPrice(fromStationId, commodityId);
  const sell = getSellPrice(toStationId, commodityId);
  if (!buy || !sell) return null;
  return { buy, sell, profitPerSCU: sell - buy, margin: ((sell - buy) / buy) * 100 };
}

/**
 * Trouve les meilleures commodités à commercer entre deux stations
 */
export function findBestCommodities(fromStationId, toStationId, legalOnly = false) {
  const fromPrices = STATION_PRICES[fromStationId];
  const toPrices = STATION_PRICES[toStationId];
  if (!fromPrices || !toPrices) return [];

  const results = [];
  for (const commodityId of Object.keys(fromPrices)) {
    const buy = fromPrices[commodityId]?.[0];
    const sell = toPrices[commodityId]?.[1];
    if (!buy || !sell || buy === 0 || sell === 0) continue;
    const meta = COMMODITY_META[commodityId];
    if (legalOnly && meta?.legalStatus === 'illegal') continue;
    const profitPerSCU = sell - buy;
    if (profitPerSCU <= 0) continue;
    results.push({
      commodityId,
      buy,
      sell,
      profitPerSCU,
      margin: ((sell - buy) / buy) * 100,
      legal: meta?.legalStatus !== 'illegal',
    });
  }
  return results.sort((a, b) => b.profitPerSCU - a.profitPerSCU);
}

/**
 * Liste toutes les stations qui vendent une commodité
 */
export function getStationsSelling(commodityId) {
  return Object.entries(STATION_PRICES)
    .filter(([, prices]) => prices[commodityId]?.[0] > 0)
    .map(([stationId, prices]) => ({ stationId, price: prices[commodityId][0] }))
    .sort((a, b) => a.price - b.price);
}

/**
 * Liste toutes les stations qui achètent une commodité
 */
export function getStationsBuying(commodityId) {
  return Object.entries(STATION_PRICES)
    .filter(([, prices]) => prices[commodityId]?.[1] > 0)
    .map(([stationId, prices]) => ({ stationId, price: prices[commodityId][1] }))
    .sort((a, b) => b.price - a.price);
}

export default STATION_PRICES;
