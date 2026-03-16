/**
 * Dataset du lore Star Citizen — Galactapédie
 * Races, Personnages historiques, Événements, Factions, Lieux
 */

// ─── ARTICLES ─────────────────────────────────────────────────────────────────

export const LORE_ARTICLES = [

  // ══════════════════════════════════════════════════════════════════
  // RACES
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'race-humain',
    title: 'Humains',
    category: 'race',
    subcategory: 'espèce dominante',
    date: 'Antiquité – Présent',
    summary: "L'Humanité s'est étendue depuis la Terre jusqu'aux confins de la galaxie, fondant l'UEE et forgeant des alliances — ou des guerres — avec chaque espèce rencontrée.",
    content: [
      {
        section: 'Origines et expansion',
        text: "Originaires du système Sol, les Humains ont développé les premières technologies de saut quantique au 22ème siècle, ouvrant la voie à une colonisation galopante. De Sol à Stanton, de Terra à Pyro, l'Humanité a planté son empreinte sur des dizaines de systèmes en l'espace de deux siècles.",
      },
      {
        section: "Organisation politique : l'UEE",
        text: "L'Empire Uni de la Terre (UEE) est la principale structure politique humaine, née en 2546 sous Ivar Messer I. Malgré une longue période tyrannique dite l'Ère Messer, les réformes de 2792 ont restauré un semblant de démocratie. L'UEE gouverne depuis Prime dans le système Terra.",
      },
      {
        section: 'Relations interstellaires',
        text: "Les Humains entretiennent des relations commerciales avec les Banu et un traité de paix fragile avec les Xi'an. En revanche, les Vanduul représentent une menace existentielle permanente. Les races Tevarin ont été quasi anéanties lors des Guerres Tevarin et leurs survivants sont aujourd'hui intégrés à la société UEE.",
      },
      {
        section: 'Culture et diversité',
        text: "La société humaine est vaste et hétérogène : citoyens loyaux de l'UEE, colons des marges, marchands Banu, pirates sans foi ni loi. La langue Galactique Standard a largement remplacé les langues ancestrales, bien que des dialectes régionaux persistent.",
      },
    ],
    related: ['uee-histoire', 'guerres-messer', 'premiere-rencontre-vanduul', 'traite-xian-uee'],
    tags: ['humanité', 'uee', 'sol', 'terra', 'expansion', 'politique'],
    importance: 'majeur',
    era: 'Toutes époques',
  },

  {
    id: 'race-banu',
    title: 'Banu',
    category: 'race',
    subcategory: 'espèce alien',
    date: 'Contact : 2438',
    summary: "Les Banu sont la première espèce alien intelligente rencontrée par les Humains. Commerçants nés, leur société est organisée en Protectorats indépendants gouvernés par des guildes marchandes.",
    content: [
      {
        section: 'Premier contact',
        text: "En 2438, le pilote Vernon Tar entre dans le système Davien et tombe sur un vaisseau Banu. Cet événement marque la première rencontre officielle entre l'Humanité et une espèce extraterrestre intelligente. Malgré une tension initiale, le contact se passe pacifiquement.",
      },
      {
        section: 'Société et gouvernance',
        text: "Les Banu vivent en Protectorats, entités semi-indépendantes gouvernées chacune par un Souli (conseil de marchands). Il n'existe pas de gouvernement central Banu : chaque Protectorat négocie ses propres accords commerciaux. Cela rend la diplomatie complexe mais aussi très flexible.",
      },
      {
        section: 'Commerce et culture',
        text: "Les Banu sont avant tout des commerçants. Leurs marchés peuvent proposer des marchandises illégales dans l'UEE sans restrictions, ce qui fait de leurs stations des destinations prisées par les contrebandiers. Leur art, souvent abstrait et coloré, est très apprécié des collectionneurs humains.",
      },
      {
        section: 'Relations avec les Humains',
        text: "Les Banu et les Humains entretiennent un accord commercial de longue date, le Traité Banu-UEE, qui garantit la liberté d'échange entre les deux espèces. Les Banu restent officiellement neutres dans les conflits humains, bien qu'ils vendent parfois du matériel aux deux camps.",
      },
    ],
    related: ['race-humain', 'premier-contact-banu', 'loc-banu-protectorat'],
    tags: ['banu', 'alien', 'commerce', 'protectorat', 'souli', 'davien'],
    importance: 'majeur',
    era: '25ème siècle – Présent',
  },

  {
    id: 'race-xian',
    title: "Xi'an",
    category: 'race',
    subcategory: 'espèce alien',
    date: "Contact hostile : ~2530",
    summary: "Les Xi'an sont une ancienne civilisation alien au tempérament stoïque et à la technologie très avancée. Longtemps ennemis jurés des Humains, ils ont signé un traité de paix en 2789.",
    content: [
      {
        section: 'Civilisation ancienne',
        text: "Les Xi'an possèdent une histoire de plusieurs millénaires, bien plus longue que celle de l'Humanité. Leur société est hiérarchique et fortement ritualisée : chaque geste, chaque parole obéit à un code social précis. Ils considèrent souvent les Humains comme des créatures impulsives et peu fiables.",
      },
      {
        section: 'Technologie',
        text: "La technologie Xi'an dépasse de loin celle de l'UEE dans certains domaines, notamment la propulsion et la furtivité. Leurs vaisseaux sont élégants, anguleux, et intègrent des matériaux inconnus. Quelques technologies Xi'an ont filtré dans le marché humain via des échanges commerciaux limités.",
      },
      {
        section: "Guerre froide et traité de paix",
        text: "Durant l'Ère Messer, les relations entre UEE et Xi'an étaient au bord de la guerre ouverte. Des escarmouches frontalières régulières maintenaient une tension permanente. En 2789, après la chute des Messer, l'UEE et l'Empire Xi'an ont signé le Traité Xi'an-UEE, établissant une paix fragile mais durable.",
      },
      {
        section: 'Territoire',
        text: "L'Empire Xi'an contrôle un vaste territoire en dehors de l'espace UEE. Les systèmes à la frontière Xi'an-UEE sont parmi les mieux défendus de la galaxie. Quelques zones commerciales mixtes existent, où Humains et Xi'an cohabitent sous des règles strictes.",
      },
    ],
    related: ['traite-xian-uee', 'guerres-messer', 'race-humain'],
    tags: ["xi'an", 'alien', 'traité', 'technologie', 'empire', 'frontière'],
    importance: 'majeur',
    era: '26ème siècle – Présent',
  },

  {
    id: 'race-vanduul',
    title: 'Vanduul',
    category: 'race',
    subcategory: 'espèce hostile',
    date: 'Première attaque : 2681',
    summary: "Les Vanduul sont une espèce alien nomade et guerrière, constituant la principale menace militaire de l'UEE. Leurs raids incessants sur les systèmes frontières font des milliers de victimes chaque année.",
    content: [
      {
        section: 'Nature et société',
        text: "Les Vanduul sont organisés en clans nomades, chacun dirigé par un Alpha dominant. Contrairement aux autres races, ils ne construisent pas de colonies permanentes : ils se déplacent constamment, pillant les ressources des systèmes traversés. Leur culture est fondée sur le combat et la domination.",
      },
      {
        section: 'Première rencontre',
        text: "En 2681, une ferme coloniale dans le système Orion est attaquée. C'est la première rencontre connue avec les Vanduul. La brutalité de l'attaque choque l'UEE : aucun survivant, installations entièrement détruites. Depuis, les raids Vanduul n'ont jamais cessé.",
      },
      {
        section: 'Menace militaire',
        text: "Les vaisseaux Vanduul sont parmi les plus redoutés : rapides, agiles et armés de systèmes de coupe au plasma capables de trancher le blindage des vaisseaux UEE. La Scythe et le Blade sont leurs chasseurs les plus répandus. La Marine UEE maintient une ligne de défense permanente le long de la frontière Vanduul.",
      },
      {
        section: 'Communication et diplomatie',
        text: "Toutes les tentatives de communication et de diplomatie avec les Vanduul ont échoué. Leurs motivations restent largement incomprises. Certains xénolinguistes pensent qu'ils perçoivent l'espace colonisé comme leur territoire de chasse ancestral et voient toute installation humaine comme une intrusion.",
      },
    ],
    related: ['premiere-rencontre-vanduul', 'perte-orion', 'race-humain', 'faction-uee'],
    tags: ['vanduul', 'alien', 'guerre', 'raid', 'clan', 'menace'],
    importance: 'majeur',
    era: '27ème siècle – Présent',
  },

  {
    id: 'race-tevarin',
    title: 'Tevarin',
    category: 'race',
    subcategory: 'espèce conquise',
    date: 'Guerres Tevarin : 2541–2603',
    summary: "Les Tevarin étaient une civilisation alien avancée et honorable, anéantie lors de deux guerres dévastatrices contre l'UEE. Leurs quelques survivants ont été intégrés à la société humaine.",
    content: [
      {
        section: 'Civilisation Tevarin',
        text: "Les Tevarin formaient une société guerrière et profondément honorable, régie par un code éthique strict — le Rijora. Leur architecture, leurs arts martiaux et leur philosophie témoignaient d'une culture riche. Ils possédaient une flotte militaire capable de rivaliser avec l'UEE de leur époque.",
      },
      {
        section: 'Première Guerre Tevarin (2541–2546)',
        text: "En 2541, les forces Tevarin attaquent les colonies UEE dans le système Orion. La guerre dure cinq ans et se solde par une victoire UEE difficile. Ivar Messer I, alors commandant militaire, s'impose comme héros de guerre et utilise cette victoire pour s'emparer du pouvoir politique.",
      },
      {
        section: 'Deuxième Guerre Tevarin (2603)',
        text: "En 2603, le général Tevarin Corath'Thal lance une campagne désespérée pour reconquérir le système Elysium. Après une série de victoires initiales, les forces Tevarin sont repoussées. Dans un acte final de sacrifice rituel, Corath'Thal pilote sa flotte dans l'atmosphère de Kaleeth, la planète sacrée Tevarin, transformant ses vaisseaux en météores de feu.",
      },
      {
        section: 'Héritage',
        text: "Les survivants Tevarin ont été intégrés de force dans la société UEE, souvent comme citoyens de seconde zone. Malgré les siècles passés, certains Tevarin maintiennent secrètement leurs traditions du Rijora. Leur culture est aujourd'hui étudiée par des historiens, mais leurs systèmes ancestraux restent sous contrôle UEE.",
      },
    ],
    related: ['guerres-tevarin', 'messer-ivar-i', 'lieu-elysium'],
    tags: ['tevarin', 'alien', 'guerre', 'rijora', 'conquête', 'honneur'],
    importance: 'majeur',
    era: '26ème siècle',
  },

  {
    id: 'race-krthak',
    title: "Kr'Thak",
    category: 'race',
    subcategory: 'espèce alien',
    date: 'Connaissance partielle',
    summary: "Les Kr'Thak sont une espèce alien hostile aux Xi'an, connue des Humains uniquement à travers les récits Xi'an. Leur existence est quasi mythique pour la plupart des citoyens UEE.",
    content: [
      {
        section: 'Ce que l\'on sait',
        text: "Les Kr'Thak sont mentionnés dans les archives Xi'an comme d'anciens ennemis. Ils habitent un espace situé au-delà de l'Empire Xi'an, hors de portée de l'UEE. Les Xi'an partagent peu d'informations sur eux, ce qui génère beaucoup de spéculations.",
      },
      {
        section: 'Relations avec les Xi\'an',
        text: "Les Xi'an et les Kr'Thak se livrent à des conflits intermittents depuis des siècles, voire des millénaires. Certaines théories suggèrent que c'est la menace Kr'Thak qui a poussé les Xi'an à chercher un accord de paix avec l'UEE, pour sécuriser leur frontière côté humain.",
      },
      {
        section: 'Implications pour l\'UEE',
        text: "Si les Kr'Thak venaient à s'étendre vers l'espace humain, ou si les Xi'an étaient affaiblis par ce conflit, l'UEE se retrouverait dans une position extrêmement vulnérable. Certains analystes militaires surveillent de près tout signe d'évolution de cette situation.",
      },
    ],
    related: ['race-xian', 'traite-xian-uee'],
    tags: ["kr'thak", 'alien', 'mystère', "xi'an", 'conflit'],
    importance: 'notable',
    era: 'Inconnue',
  },

  {
    id: 'race-hadesian',
    title: 'Hadesians',
    category: 'race',
    subcategory: 'espèce disparue',
    date: 'Extinction : ~300 000 ans',
    summary: "Les Hadesians sont une espèce disparue dont les ruines ont été découvertes dans le système Hades. Leur extinction soudaine et mystérieuse reste l'une des grandes énigmes de la xénologie moderne.",
    content: [
      {
        section: 'Découverte des ruines',
        text: "Les archéologues de l'UEE ont découvert des ruines dans le système Hades IV, attestant d'une civilisation technologiquement avancée. Les structures suggèrent une culture architecturale élaborée, très différente de tout ce que l'Humanité ou les autres espèces connues ont produit.",
      },
      {
        section: 'La Grande Catastrophe',
        text: "Les preuves archéologiques suggèrent que les Hadesians ont subi une catastrophe d'une violence extrême, vraisemblablement une guerre civile planétaire totale. Les planètes du système Hades montrent des cicatrices d'une destruction à grande échelle. Aucun survivant n'a jamais été retrouvé.",
      },
      {
        section: 'Artefacts et mystères',
        text: "Quelques artefacts Hadesians ont été récupérés, dont certains montrent une technologie de manipulation de l'énergie incompréhensible. Les xénologues débattent encore de savoir si les Hadesians ont volontairement déclenché leur propre destruction ou s'ils ont été victimes d'une menace extérieure inconnue.",
      },
    ],
    related: ['lieu-hades'],
    tags: ['hadesians', 'alien', 'extinct', 'ruines', 'archéologie', 'mystère'],
    importance: 'notable',
    era: 'Préhistoire galactique',
  },

  {
    id: 'race-proto-tevarin',
    title: 'Anciens Tevarin (Proto-Tevarin)',
    category: 'race',
    subcategory: 'culture ancienne',
    date: 'Antiquité Tevarin',
    summary: "Les archives de la civilisation Tevarin précoloniale révèlent une culture spirituelle et guerrière profonde, dont les traces subsistent dans le Rijora pratiqué par leurs descendants.",
    content: [
      {
        section: 'Le Rijora',
        text: "Le Rijora est le code éthique et spirituel des anciens Tevarin. Il régit chaque aspect de la vie : combat, diplomatie, naissance, mort. Les transgressions du Rijora sont considérées comme une honte indélébile. Même après la conquête UEE, de nombreux Tevarin maintiennent secrètement ce code.",
      },
      {
        section: 'Architecture et arts',
        text: "Les bâtiments Tevarin anciens se caractérisent par des formes organiques et des ornements géométriques complexes représentant le cycle de la vie. Plusieurs sites archéologiques dans le système Elysium témoignent de cette esthétique particulière.",
      },
    ],
    related: ['race-tevarin', 'lieu-elysium'],
    tags: ['tevarin', 'culture', 'rijora', 'anciens', 'spiritualité'],
    importance: 'mineur',
    era: 'Antiquité',
  },

  // ══════════════════════════════════════════════════════════════════
  // PERSONNAGES HISTORIQUES
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'nick-croshaw',
    title: 'Nick Croshaw',
    category: 'personnage',
    subcategory: 'explorateur',
    date: '2271',
    summary: "Premier humain à traverser un jump point, Nick Croshaw a ouvert la porte à l'expansion interstellaire de l'Humanité. Le système découvert porte son nom en son honneur.",
    content: [
      {
        section: 'Biographie',
        text: "Nick Croshaw était un pilote de test et explorateur indépendant du 23ème siècle. Passionné de physique des anomalies spatiales, il consacra sa vie à l'étude des perturbations gravitationnelles qui précèdent les points de saut.",
      },
      {
        section: 'La traversée de 2271',
        text: "Le 3 avril 2271, Croshaw manœuvre délibérément son vaisseau dans une anomalie gravitationnelle à la périphérie du système Sol. Contre toutes les prédictions, il traverse sans encombre vers un nouveau système : Croshaw. Il devient ainsi le premier humain à effectuer un saut interstellaire volontaire.",
      },
      {
        section: 'Héritage',
        text: "La découverte de Croshaw bouleverse l'humanité. En l'espace d'une décennie, des dizaines de jump points sont cartographiés depuis Sol. Le système Croshaw, première étape vers les étoiles, est renommé en son honneur par décret de la Terre. Croshaw est universellement considéré comme le père de l'ère interstellaire humaine.",
      },
    ],
    related: ['lieu-croshaw', 'uee-histoire', 'premier-saut'],
    tags: ['explorateur', 'jump-point', 'pionnier', 'croshaw', 'saut', 'découverte'],
    importance: 'majeur',
    era: '23ème siècle',
  },

  {
    id: 'messer-ivar-i',
    title: 'Ivar Messer I',
    category: 'personnage',
    subcategory: 'dirigeant tyrannique',
    date: '2546–2610',
    summary: "Fondateur de l'ère tyrannique Messer, Ivar Messer I transforma la République Terrienne en Empire autoritaire après les Guerres Tevarin. Sa lignée gouverna l'UEE pendant plus de deux cents ans.",
    content: [
      {
        section: 'Ascension au pouvoir',
        text: "Ivar Messer I débuta comme commandant militaire brillant lors de la Première Guerre Tevarin. Ses victoires lui valurent une popularité immense. Utilisant habilement la propagande et la peur de l'ennemi alien, il obtint des pouvoirs d'urgence du Sénat en 2546, qu'il ne rendit jamais.",
      },
      {
        section: "Fondation de l'UEE tyrannique",
        text: "En se proclamant Premier Citoyen en 2546, Messer transforma la structure républicaine terrienne en empire autoritaire. La presse fut muselée, l'opposition écrasée. Les colonies éloignées subirent une exploitation économique intense au profit des systèmes centraux.",
      },
      {
        section: 'Crimes et atrocités',
        text: "Sous Messer I et ses successeurs, l'UEE commit de nombreux crimes : déportations de populations, exploitation des Tevarin vaincus, massacre de civils sur Garron II (2792). Ces actes créèrent un ressentiment profond dans les colonies qui alimenta le mouvement réformiste.",
      },
      {
        section: 'Héritage sombre',
        text: "L'Ère Messer (2546–2792) reste le chapitre le plus sombre de l'histoire humaine. Si les Messer ont effectivement étendu l'espace humain, ce fut au prix de libertés fondamentales. La chute du dernier Messer en 2792 est encore célébrée chaque année dans de nombreux systèmes.",
      },
    ],
    related: ['guerres-messer', 'guerres-tevarin', 'chute-garron-ii', 'uee-histoire'],
    tags: ['messer', 'tyrannie', 'uee', 'empire', 'premier citoyen', 'autoritarisme'],
    importance: 'majeur',
    era: '26ème siècle',
  },

  {
    id: 'vera-santos-chou',
    title: 'Vera Santos-Chou',
    category: 'personnage',
    subcategory: 'révolutionnaire',
    date: '2750–2792',
    summary: "Figure centrale du mouvement réformiste anti-Messer, Vera Santos-Chou organisa la résistance civile dans les colonies périphériques. Son réseau d'information contribua directement à la chute du régime.",
    content: [
      {
        section: 'Origines',
        text: "Née dans une famille de marchands de Ferron, Vera Santos-Chou grandit dans les conditions difficiles imposées par l'administration Messer. Après l'arrestation de son père pour 'sédition commerciale', elle rejoignit les cercles réformistes clandestins dès l'âge de vingt ans.",
      },
      {
        section: 'Le Réseau Santos',
        text: "Santos-Chou bâtit pendant trois décennies un réseau d'information clandestine couvrant huit systèmes. Ce réseau diffusait des nouvelles non censurées et coordonnait les protestations pacifiques. L'Advocacy tenta à plusieurs reprises de le démanteler sans succès.",
      },
      {
        section: 'Rôle dans la Révolution',
        text: "En 2790, le Réseau Santos divulgua des documents prouvant que le massacre de Garron II avait été ordonné directement par Messer XI. Ce scandale accéléra la mobilisation du Sénat et de la Marine UEE contre le régime. En 2792, à la chute des Messer, Santos-Chou fut reçue en héroïne à Prime.",
      },
    ],
    related: ['guerres-messer', 'chute-garron-ii', 'uee-histoire'],
    tags: ['révolution', 'résistance', 'réformiste', 'santos', 'messer', 'liberté'],
    importance: 'notable',
    era: '28ème siècle',
  },

  {
    id: 'laylani-addison-hyx',
    title: 'Laylani Addison-Hyx',
    category: 'personnage',
    subcategory: 'politicienne',
    date: '2785–2820',
    summary: "Sénatrice de Terra et architecte des réformes post-Messer, Laylani Addison-Hyx rédigea la Charte des Droits Fondamentaux de l'UEE réformée et négocia le Traité Xi'an-UEE de 2789.",
    content: [
      {
        section: 'Parcours politique',
        text: "Addison-Hyx entra en politique dans les années 2780, portée par la vague réformiste. Juriste de formation, elle se spécialisa dans le droit interstellaire et les relations xénodiplomatiques, domaines alors quasi inexistants dans la bureaucratie Messer.",
      },
      {
        section: 'Le Traité Xi\'an-UEE',
        text: "En 2789, elle dirigea la délégation UEE dans les négociations avec l'Empire Xi'an. Après dix-huit mois de discussions ardues, elle obtint un accord de non-agression et d'échange commercial limité. Ce traité, toujours en vigueur, est considéré comme son œuvre diplomatique majeure.",
      },
      {
        section: 'Héritage législatif',
        text: "La Charte Addison, adoptée en 2793, garantit pour la première fois les droits fondamentaux à tous les citoyens et résidents de l'UEE, y compris les Tevarin. Bien qu'incomplète selon ses critiques, elle constitue la base légale des libertés civiles dans l'UEE contemporaine.",
      },
    ],
    related: ['traite-xian-uee', 'guerres-messer', 'uee-histoire'],
    tags: ['sénatrice', 'terra', 'réforme', 'traité', "xi'an", 'charte', 'droits'],
    importance: 'notable',
    era: '28ème siècle',
  },

  {
    id: 'high-general-krull',
    title: 'High General Krull',
    category: 'personnage',
    subcategory: 'chef militaire Vanduul',
    date: '~2800–Présent',
    summary: "Krull est le chef de clan Vanduul le plus redouté de l'ère contemporaine. Ses raids ont détruit des dizaines de colonies et son clan est responsable de la chute du système Orion.",
    content: [
      {
        section: 'Identité et clan',
        text: "Dans la société Vanduul, les chefs de clan portent le titre de High General. Krull dirige un super-clan issu de la fusion de plusieurs clans Vanduul, une configuration rare et particulièrement dangereuse. Son clan opère principalement dans les systèmes Vanduul proches de la frontière UEE.",
      },
      {
        section: 'La chute d\'Orion',
        text: "La campagne de Krull dans le système Orion — premier système attaqué par les Vanduul en 2681 — a définitivement chassé l'UEE de cet espace. Des tentatives de reconquête ont toutes échoué. Orion reste un symbole des limites militaires de l'UEE face aux Vanduul.",
      },
      {
        section: 'Tactiques de guerre',
        text: "Krull est connu pour ses stratégies non conventionnelles : il utilise de petites escouades rapides pour harceler les convois avant de lancer une frappe massive concentrée. La Marine UEE a étudié ses tactiques pendant des décennies sans trouver de parade totalement efficace.",
      },
    ],
    related: ['premiere-rencontre-vanduul', 'race-vanduul', 'perte-orion'],
    tags: ['vanduul', 'krull', 'chef', 'clan', 'orion', 'guerre', 'menace'],
    importance: 'notable',
    era: '29ème siècle',
  },

  {
    id: 'kellar-rhee',
    title: 'Kellar Rhee',
    category: 'personnage',
    subcategory: 'pirate légendaire',
    date: '2880–2930 (estimé)',
    summary: "Pirate de légende opérant dans la région de Pyro et Nyx, Kellar Rhee est crédité de la fondation de plusieurs avant-postes criminels encore actifs aujourd'hui. Son code de pirate est encore cité dans les milieux hors-la-loi.",
    content: [
      {
        section: 'Origines',
        text: "Kellar Rhee était un ancien pilote de la Marine UEE reconverti en pirate après une cour martiale controversée. Ses compétences militaires lui permirent de rapidement dominer les couloirs commerciaux entre Stanton et Pyro.",
      },
      {
        section: 'Le Code Rhee',
        text: "Contrairement aux pirates ordinaires, Rhee appliquait un code strict : jamais d'attaque sur des vaisseaux médicaux, partage équitable du butin, liberté pour les prisonniers contre rançon. Ce code lui valut une réputation ambivalente — redouté mais respecté même de ses victimes.",
      },
      {
        section: 'Héritage',
        text: "Rhee aurait fondé plusieurs caches secrètes dans Pyro, dont certaines n'ont jamais été trouvées. Des rumeurs circulent encore sur des dépôts de richesses abandonnés. Son nom est devenu synonyme de flibuste honorable dans les légendes des marges.",
      },
    ],
    related: ['lieu-pyro', 'lieu-nyx', 'faction-nine-tails'],
    tags: ['pirate', 'rhee', 'pyro', 'nyx', 'légende', 'hors-la-loi', 'code'],
    importance: 'notable',
    era: '29ème siècle',
  },

  {
    id: 'corath-thal',
    title: "Corath'Thal",
    category: 'personnage',
    subcategory: 'général Tevarin',
    date: '2603',
    summary: "Général Tevarin qui mena la Deuxième Guerre Tevarin en tentant de reconquérir le système Elysium. Son sacrifice final — piloter sa flotte dans l'atmosphère de Kaleeth — est devenu une légende.",
    content: [
      {
        section: 'La reconquête d\'Elysium',
        text: "En 2603, Corath'Thal lança une offensive surprise remarquablement coordonnée sur le système Elysium, patrie spirituelle des Tevarin. Pendant plusieurs semaines, ses forces semblèrent sur le point de réussir l'impensable reconquête.",
      },
      {
        section: 'La défaite et le sacrifice',
        text: "Repoussé par les renforts UEE, Corath'Thal choisit la mort plutôt que la reddition. Conformément au Rijora, il rassembla sa flotte restante et plongea délibérément dans l'atmosphère de Kaleeth, créant une pluie de météores de feu. Cet acte est considéré comme le moment le plus noble de l'histoire Tevarin.",
      },
    ],
    related: ['guerres-tevarin', 'race-tevarin', 'lieu-elysium'],
    tags: ['tevarin', "corath'thal", 'général', 'elysium', 'sacrifice', 'rijora'],
    importance: 'notable',
    era: '27ème siècle',
  },

  {
    id: 'marshall-tobin',
    title: 'Marshall Tobin',
    category: 'personnage',
    subcategory: 'explorateur',
    date: '2789',
    summary: "Cartographe de la Marine UEE qui découvrit officiellement le système Pyro en 2789. Sa première description de l'étoile mourante de Pyro inspira des générations d'explorateurs.",
    content: [
      {
        section: 'La découverte de Pyro',
        text: "En 2789, Marshall Tobin et son équipe traversèrent un jump point peu cartographié depuis Stanton et découvrirent un système gravitant autour d'une étoile flicker — instable et mourante. Tobin nomma le système 'Pyro' en référence à l'apparence brûlante de son soleil.",
      },
      {
        section: 'Rapports et controverses',
        text: "Les rapports de Tobin décrivirent un système hostile mais potentiellement riche en ressources. L'UEE classa ces rapports confidentiels pendant deux décennies, alimentant les théories selon lesquelles des entreprises privées s'étaient déjà implantées dans Pyro avant la publication officielle.",
      },
    ],
    related: ['lieu-pyro', 'decouverte-pyro'],
    tags: ['tobin', 'explorateur', 'pyro', 'découverte', 'cartographe', 'marine'],
    importance: 'mineur',
    era: '28ème siècle',
  },

  {
    id: 'xiao-yun',
    title: 'Xiao Yun',
    category: 'personnage',
    subcategory: 'scientifique',
    date: '2200–2271',
    summary: "Physicienne théoricienne ayant prédit l'existence des jump points dix ans avant leur première traversée. Ses travaux sur les anomalies gravitationnelles forment la base théorique de la navigation interstellaire.",
    content: [
      {
        section: 'Théorie des anomalies de Yun',
        text: "En 2261, Xiao Yun publia 'Perturbations Gravitationnelles et Topologie Spatiale', démontrant mathématiquement l'existence de points de connexion entre systèmes stellaires. Elle estima même leur position approximative depuis Sol, avec une précision remarquable pour l'époque.",
      },
      {
        section: 'Reconnaissance tardive',
        text: "De son vivant, les théories de Yun furent largement ignorées par l'establishment scientifique. Ce n'est qu'après la traversée de Croshaw en 2271 que son travail fut reconnu. Elle décéda en 2270, un an avant la confirmation de ses théories.",
      },
    ],
    related: ['nick-croshaw', 'lieu-croshaw'],
    tags: ['scientifique', 'physique', 'jump-point', 'théorie', 'pionnière'],
    importance: 'mineur',
    era: '23ème siècle',
  },

  {
    id: 'messer-xi',
    title: 'Messer XI (Linton Messer)',
    category: 'personnage',
    subcategory: 'dirigeant tyrannique',
    date: '2780–2792',
    summary: "Dernier de la lignée Messer, Linton Messer XI fut renversé en 2792 après le scandale du massacre de Garron II. Sa chute mit fin à 246 ans de tyrannie.",
    content: [
      {
        section: 'Le dernier tyran',
        text: "Linton Messer XI hérita d'un régime déjà fragilisé par des décennies de contestation interne. Paranoïaque et imprévisible, il intensifia la répression dans les colonies et autorisa plusieurs opérations militaires contre des civils.",
      },
      {
        section: 'Le massacre de Garron II',
        text: "En 2792, des documents volés par le Réseau Santos prouvèrent que Messer XI avait personnellement ordonné le bombardement de Garron II, une planète en cours de terraformation, tuant des milliers de protestataires. Le Sénat vota sa destitution, et la Marine refusa de le défendre.",
      },
      {
        section: 'Chute et exil',
        text: "Messer XI fut contraint à l'exil plutôt qu'emprisonné, une décision controversée motivée par la volonté d'éviter un bain de sang. Il mourut en exil en 2810. Sa chute est commémorée chaque année comme Jour de la Libération dans plusieurs systèmes.",
      },
    ],
    related: ['guerres-messer', 'chute-garron-ii', 'messer-ivar-i', 'uee-histoire'],
    tags: ['messer', 'tyrannie', 'garron', 'chute', 'libération', 'uee'],
    importance: 'majeur',
    era: '28ème siècle',
  },

  // ══════════════════════════════════════════════════════════════════
  // ÉVÉNEMENTS HISTORIQUES
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'premier-saut',
    title: 'Premier Saut Interstellaire Humain',
    category: 'evenement',
    subcategory: 'exploration',
    date: '2271',
    summary: "Le 3 avril 2271, Nick Croshaw traverse le premier jump point humain, atteignant le système qui portera son nom. Cet événement marque le début de l'ère interstellaire de l'Humanité.",
    content: [
      {
        section: 'Le contexte',
        text: "En 2271, l'Humanité est confinée au système Sol depuis ses origines. Les théories de Xiao Yun sur les jump points circulent depuis une décennie, mais aucun financement institutionnel ne soutient leur exploration. C'est un pilote indépendant, Nick Croshaw, qui prend le risque.",
      },
      {
        section: "Le saut",
        text: "Aux commandes d'un vaisseau de prospection modifié, Croshaw approche délibérément l'anomalie gravitationnelle détectée dans la ceinture externe de Sol. Après quelques secondes de turbulences intenses, son vaisseau émerge dans un nouveau système. Il envoie un signal de confirmation à la Terre.",
      },
      {
        section: "Les conséquences immédiates",
        text: "La nouvelle déclenche une euphorie planétaire. En six mois, la Terre consacre des budgets colossaux à l'exploration des jump points. En dix ans, cinq nouveaux systèmes sont atteints. L'humanité n'est plus seule dans l'univers.",
      },
    ],
    related: ['nick-croshaw', 'lieu-croshaw', 'xiao-yun'],
    tags: ['saut', 'jump-point', 'croshaw', 'exploration', 'premier', '2271'],
    importance: 'majeur',
    era: '23ème siècle',
  },

  {
    id: 'colonisation-stanton',
    title: 'Colonisation du Système Stanton',
    category: 'evenement',
    subcategory: 'colonisation',
    date: '2262',
    summary: "Le système Stanton est découvert et attribué à quatre méga-corporations : Hurston Dynamics, microTech, ArcCorp et Crusader Industries. Cette privatisation totale d'un système est unique dans l'histoire de l'UEE.",
    content: [
      {
        section: 'La privatisation unique',
        text: "Contrairement à tous les autres systèmes colonisés sous gouvernance UEE directe, Stanton fut entièrement cédé à quatre corporations en échange de financements massifs pour l'effort de guerre contre les Tevarin. Chaque corporation reçut une planète entière à développer.",
      },
      {
        section: 'Les quatre corporations',
        text: "Hurston Dynamics obtint Hurston et ses lunes industrielles. Crusader Industries reçut la géante gazeuse Crusader avec ses colonies en atmosphère. ArcCorp terraforma entièrement ArcCorp en une méga-ville planétaire. microTech développa la planète froide microTech en hub technologique.",
      },
      {
        section: 'Stanton aujourd\'hui',
        text: "Stanton est le système le plus actif de l'espace humain, avec une économie florissante et une population de plusieurs milliards. C'est aussi le terrain de jeu des corporations, où les droits des travailleurs sont souvent bafoués au profit des actionnaires.",
      },
    ],
    related: ['uee-histoire', 'guerres-tevarin'],
    tags: ['stanton', 'corporation', 'hurston', 'microtech', 'arccorp', 'crusader', 'colonisation'],
    importance: 'majeur',
    era: '23ème siècle',
  },

  {
    id: 'guerres-tevarin',
    title: 'Guerres Tevarin (2541–2603)',
    category: 'evenement',
    subcategory: 'guerre',
    date: '2541–2603',
    summary: "Deux conflits dévastateurs entre l'UEE et la civilisation Tevarin. La première guerre permit à Ivar Messer de s'emparer du pouvoir. La seconde s'acheva par le sacrifice rituel de la flotte Tevarin dans l'atmosphère de Kaleeth.",
    content: [
      {
        section: 'Première Guerre Tevarin (2541–2546)',
        text: "Les forces Tevarin attaquèrent les colonies UEE dans le système Orion en 2541. Malgré une résistance initiale féroce, la Marine UEE repoussa l'invasion après cinq ans de combats. Le commandant Ivar Messer se distingua et utilisa sa gloire militaire pour s'emparer du pouvoir politique.",
      },
      {
        section: 'L\'entre-deux-guerres',
        text: "Sous domination UEE, les Tevarin furent réduits au statut de citoyens de seconde zone. Leurs systèmes furent colonisés par des Humains. Des décennies de frustration et d'humiliation alimentèrent un désir de revanche.",
      },
      {
        section: 'Deuxième Guerre Tevarin (2603)',
        text: "Le général Corath'Thal lança une offensive surprise sur Elysium, le berceau spirituel Tevarin. Après des victoires initiales spectaculaires, les forces UEE reçurent des renforts massifs. Acculé, Corath'Thal choisit le sacrifice rituel plutôt que la capitulation.",
      },
    ],
    related: ['race-tevarin', 'messer-ivar-i', 'corath-thal', 'lieu-elysium'],
    tags: ['tevarin', 'guerre', 'uee', 'messer', 'orion', 'elysium', '2541', '2603'],
    importance: 'majeur',
    era: '26ème – 27ème siècle',
  },

  {
    id: 'guerres-messer',
    title: "Ère Messer — La Grande Tyrannie (2546–2792)",
    category: 'evenement',
    subcategory: 'ère politique',
    date: '2546–2792',
    summary: "246 ans de régime autoritaire sous onze générations de la famille Messer. Cette période sombre de l'histoire humaine se conclut par le scandale de Garron II et la chute de Messer XI.",
    content: [
      {
        section: 'Établissement du régime',
        text: "Exploitant sa popularité de héros de guerre, Ivar Messer I obtint des pouvoirs d'urgence permanents du Sénat en 2546. Il supprima progressivement l'opposition, musela la presse et transforma l'administration en instrument de contrôle absolu.",
      },
      {
        section: 'Deux siècles de répression',
        text: "Sous les Messer, les colonies périphériques subirent une exploitation économique sévère. Les syndicats furent interdits. Les peuples aliens intégrés à l'UEE — notamment les Tevarin — vécurent dans une discrimination légalisée. Les dissidents disparaissaient régulièrement.",
      },
      {
        section: 'La résistance',
        text: "Malgré la répression, un mouvement de résistance clandestin maintint une pression constante sur le régime. Le Réseau Santos-Chou fut l'un de ses outils les plus efficaces, diffusant informations et coordonnant la résistance pacifique.",
      },
      {
        section: 'La chute',
        text: "Le massacre de Garron II en 2792 — rendu public par le Réseau Santos — déclencha la crise finale. Le Sénat vota la destitution de Messer XI. La Marine refusa de défendre le régime. L'Ère Messer prit fin sans bain de sang supplémentaire.",
      },
    ],
    related: ['messer-ivar-i', 'messer-xi', 'chute-garron-ii', 'vera-santos-chou', 'uee-histoire'],
    tags: ['messer', 'tyrannie', 'uee', 'empire', 'répression', 'histoire', '2546', '2792'],
    importance: 'majeur',
    era: '26ème – 28ème siècle',
  },

  {
    id: 'premiere-rencontre-vanduul',
    title: 'Première Rencontre Vanduul (2681)',
    category: 'evenement',
    subcategory: 'premier contact',
    date: '2681',
    summary: "En 2681, une ferme coloniale dans le système Orion est détruite par une espèce inconnue. Il n'y a aucun survivant. C'est la première rencontre avec les Vanduul, le début d'une guerre sans fin.",
    content: [
      {
        section: 'L\'attaque d\'Orion',
        text: "La ferme coloniale de Caliban dans le système Orion n'envoya plus de signaux un matin de 2681. Une patrouille UEE découvrit les installations entièrement détruites, sans survivants. Les traces d'impacts et les débris de vaisseaux étrangers confirmèrent une attaque extraterrestre.",
      },
      {
        section: 'Identification des Vanduul',
        text: "L'analyse des débris permit d'identifier une nouvelle espèce intelligente — rapidement nommée Vanduul. Contrairement aux Banu ou aux Xi'an, tout contact tenta fut ignoré ou répondu par des attaques. L'UEE comprit très vite qu'elle faisait face à une menace existentielle.",
      },
      {
        section: 'Réponse militaire',
        text: "L'UEE renforça immédiatement sa présence dans les systèmes frontaliers. La Marine reçut des crédits supplémentaires pour développer des vaisseaux anti-Vanduul. Malgré cela, les raids continuèrent, s'intensifièrent et finirent par chasser l'UEE du système Orion.",
      },
    ],
    related: ['race-vanduul', 'high-general-krull', 'perte-orion', 'uee-histoire'],
    tags: ['vanduul', 'premier contact', 'orion', 'attaque', 'guerre', '2681'],
    importance: 'majeur',
    era: '27ème siècle',
  },

  {
    id: 'chute-garron-ii',
    title: 'Massacre de Garron II (2792)',
    category: 'evenement',
    subcategory: 'atrocité',
    date: '2792',
    summary: "Le bombardement orbital de civils protestataires sur Garron II, ordonné par Messer XI, fut le scandale qui précipita la chute de la tyrannie Messer et la réforme de l'UEE.",
    content: [
      {
        section: 'La planète Garron II',
        text: "Garron II était une planète en cours de terraformation dans le système Garron. Sa population, majoritairement composée de travailleurs des chantiers de terraformation, protestait contre les conditions de travail et les taxes excessives imposées par l'administration Messer.",
      },
      {
        section: "Le bombardement",
        text: "En réponse aux protestations, Messer XI ordonna une frappe orbitale d'abord présentée comme ciblée contre des 'meneurs terroristes'. En réalité, des milliers de civils furent tués. L'événement fut initialement étouffé, mais le Réseau Santos-Chou obtint et diffusa les preuves de la réalité.",
      },
      {
        section: 'Conséquences',
        text: "La révélation du massacre déclencha une vague d'indignation planétaire. Pour la première fois, le Sénat et plusieurs amiraux de la Marine prirent ouvertement position contre Messer XI. Sa destitution suivit en quelques semaines. Le Jour de Garron est commémoré chaque année comme symbole de la lutte pour la liberté.",
      },
    ],
    related: ['messer-xi', 'guerres-messer', 'vera-santos-chou', 'uee-histoire'],
    tags: ['garron', 'massacre', 'messer', 'atrocité', 'réforme', 'liberté', '2792'],
    importance: 'majeur',
    era: '28ème siècle',
  },

  {
    id: 'decouverte-pyro',
    title: 'Découverte du Système Pyro (2789)',
    category: 'evenement',
    subcategory: 'exploration',
    date: '2789',
    summary: "Le système Pyro, gravitant autour d'une étoile flicker mourante, est découvert par la Marine UEE en 2789. Longtemps gardé secret et laissé sans gouvernance, il est devenu le far west de l'espace humain.",
    content: [
      {
        section: 'La découverte',
        text: "Le cartographe Marshall Tobin traverse un jump point peu documenté depuis Stanton en 2789 et découvre un système à l'étoile instable. Ses rapports décrivent un environnement hostile mais potentiellement riche en ressources rares liées à l'activité de l'étoile mourante.",
      },
      {
        section: 'Le secret de l\'UEE',
        text: "L'UEE classa les rapports de Tobin pendant vingt ans. Pendant ce temps, des corporations et des individus en possession de fuites ou de cartes pirates s'installèrent discrètement dans Pyro, hors de tout cadre légal. Quand l'UEE rendit le système public, il était déjà colonisé de facto.",
      },
      {
        section: 'Pyro aujourd\'hui',
        text: "Sans gouvernance UEE effective, Pyro est devenu un repaire de pirates, de criminels et de francs-tireurs. Des avant-postes de survie se sont développés autour des vestiges de stations corporatistes abandonnées. C'est un espace dangereux mais libre, attirant ceux qui fuient la loi UEE.",
      },
    ],
    related: ['marshall-tobin', 'lieu-pyro', 'guerres-messer'],
    tags: ['pyro', 'étoile flicker', 'découverte', 'tobin', '2789', 'far west', 'espace'],
    importance: 'majeur',
    era: '28ème siècle',
  },

  {
    id: 'traite-xian-uee',
    title: "Traité Xi'an-UEE (2789)",
    category: 'evenement',
    subcategory: 'diplomatie',
    date: '2789',
    summary: "Le Traité Xi'an-UEE met fin à des siècles de guerre froide et d'escarmouches frontalières. Négocié par Laylani Addison-Hyx, il établit une paix durable et des échanges commerciaux limités entre les deux civilisations.",
    content: [
      {
        section: 'Contexte de la négociation',
        text: "La chute imminente des Messer ouvrit une fenêtre diplomatique. Les Xi'an, pragmatiques, virent dans le bouleversement politique humain une opportunité de sécuriser leur frontière. Les deux parties avaient intérêt à la paix : l'UEE pour se concentrer sur la menace Vanduul, les Xi'an pour gérer les Kr'Thak.",
      },
      {
        section: 'Clauses principales',
        text: "Le traité établit une ligne frontalière précise entre les deux espaces, un protocole de non-agression mutuelle, un accord de commerce limité via des points d'échange désignés, et un canal de communication diplomatique permanent. Il interdit les survols militaires des zones frontières.",
      },
      {
        section: 'Impact sur les relations',
        text: "Malgré la paix officielle, les tensions restent palpables. Les Xi'an ne font pas confiance aux Humains, qu'ils considèrent comme imprévisibles. Des incidents frontaliers mineurs surviennent régulièrement. Mais aucun des deux empires n'a eu d'intérêt à rompre le traité depuis 2789.",
      },
    ],
    related: ['laylani-addison-hyx', 'race-xian', 'guerres-messer', 'uee-histoire'],
    tags: ["xi'an", 'traité', 'diplomatie', 'paix', 'frontière', '2789', 'uee'],
    importance: 'majeur',
    era: '28ème siècle',
  },

  {
    id: 'perte-orion',
    title: 'Perte du Système Orion',
    category: 'evenement',
    subcategory: 'guerre',
    date: '2712',
    summary: "Après des décennies de raids Vanduul, l'UEE est finalement contrainte d'abandonner le système Orion. La chute d'Orion reste le symbole le plus douloureux des limites militaires humaines face aux Vanduul.",
    content: [
      {
        section: 'Les raids incessants',
        text: "Depuis la première attaque de 2681, le système Orion n'a jamais connu la paix. Les raids Vanduul, de plus en plus coordonnés et violents, ont progressivement détruit les infrastructures coloniales. Les renforts UEE arrivaient toujours trop peu, trop tard.",
      },
      {
        section: "L'évacuation",
        text: "En 2712, face à une offensive Vanduul de grande ampleur menée par le clan de Krull, l'UEE ordonna l'évacuation totale d'Orion. Des millions de colons durent abandonner leurs foyers en quelques jours. Des milliers ne purent être évacués à temps.",
      },
      {
        section: 'Symbolique',
        text: "Orion était le premier système attaqué par les Vanduul. Le perdre définitivement représenta un choc psychologique immense pour l'UEE. Des voix se sont élevées pour une contre-offensive, mais aucune n'a abouti. Orion reste une zone Vanduul, un rappel permanent de la vulnérabilité humaine.",
      },
    ],
    related: ['premiere-rencontre-vanduul', 'race-vanduul', 'high-general-krull'],
    tags: ['orion', 'perte', 'vanduul', 'évacuation', 'guerre', '2712'],
    importance: 'majeur',
    era: '28ème siècle',
  },

  // ══════════════════════════════════════════════════════════════════
  // FACTIONS / ORGANISATIONS
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'faction-uee',
    title: 'UEE — Empire Uni de la Terre',
    category: 'faction',
    subcategory: 'gouvernement',
    date: 'Fondée : 2546',
    summary: "L'UEE est l'entité politique dominante de l'espace humain. Née sous la tyrannie des Messer, réformée en 2792, elle gouverne des dizaines de systèmes depuis la capitale Prime dans le système Terra.",
    content: [
      {
        section: 'Structure politique',
        text: "L'UEE est dirigée par un Imperator élu par le Sénat pour un mandat de dix ans. Le Sénat représente les différents systèmes colonisés. L'Advocacy applique la loi fédérale. La Marine et les Marines assurent la défense. La bureaucratie UEE est vaste et souvent perçue comme lente et corrompue.",
      },
      {
        section: 'Géographie politique',
        text: "L'UEE contrôle plusieurs dizaines de systèmes directement, avec une zone d'influence bien plus étendue. Les systèmes frontières comme Stanton ou Pyro (pour lequel l'UEE a abandonné toute prétention effective) témoignent des limites de ce contrôle.",
      },
      {
        section: 'Factions internes',
        text: "L'UEE n'est pas monolithique : le Sénat est divisé entre hawkistes (dépenses militaires, expansion) et dovistes (réformes sociales, diplomatie). Les corporations influencent fortement la politique via des lobbies puissants. Les Forces Défensives Citoyennes (CDF) représentent une milice para-officielle.",
      },
    ],
    related: ['guerres-messer', 'uee-histoire', 'lieu-terra', 'faction-advocacy'],
    tags: ['uee', 'gouvernement', 'imperator', 'sénat', 'empire', 'politique'],
    importance: 'majeur',
    era: '26ème siècle – Présent',
  },

  {
    id: 'faction-advocacy',
    title: "L'Advocacy",
    category: 'faction',
    subcategory: 'forces de l\'ordre',
    date: 'Fondée : 2523',
    summary: "L'Advocacy est l'organisme fédéral de maintien de l'ordre de l'UEE. Ses agents traquent les criminels au-delà des juridictions locales et gèrent les menaces interstellaires.",
    content: [
      {
        section: 'Rôle et pouvoirs',
        text: "L'Advocacy opère à travers tous les systèmes UEE, avec autorité sur les polices locales pour les crimes fédéraux. Ses agents disposent de larges pouvoirs d'arrestation et d'enquête. Ils gèrent également le système de crimstat qui évalue le niveau de dangerosité des individus.",
      },
      {
        section: 'Relations avec les joueurs',
        text: "Dans l'univers du jeu, l'Advocacy est la faction principale contre laquelle les joueurs hors-la-loi s'opposent. Un crimstat élevé attire des agents de plus en plus puissants. Se rendre à une station Advocacy permet d'effacer un casier via des amendes ou des travaux communautaires.",
      },
    ],
    related: ['faction-uee', 'uee-histoire'],
    tags: ['advocacy', 'police', 'fédéral', 'crimstat', 'loi', 'ordre'],
    importance: 'notable',
    era: '26ème siècle – Présent',
  },

  {
    id: 'faction-nine-tails',
    title: 'Nine Tails',
    category: 'faction',
    subcategory: 'organisation criminelle',
    date: 'Fondée : ~2850',
    summary: "Les Nine Tails sont une organisation criminelle majeure opérant principalement dans les systèmes de Stanton et Pyro. Spécialisés dans le sabotage, les prises d'otages et le trafic, ils représentent une menace directe pour les stations et les couloirs commerciaux.",
    content: [
      {
        section: 'Origine et idéologie',
        text: "Les Nine Tails se présentent comme des rebelles anti-corporations, défendant les travailleurs opprimés des méga-corporations de Stanton. Cette rhétorique attire des recrues idéalistes, même si les opérations de la faction sont clairement criminelles : extorsion, terrorisme, trafic.",
      },
      {
        section: 'Opérations',
        text: "Les Nine Tails sont connus pour leurs prises d'otages dans les stations — notamment la station GrimHex dans la ceinture de Crusader. Ils bloquent régulièrement les couloirs commerciaux et s'attaquent aux stations de ravitaillement pour extorquer des entreprises et l'UEE.",
      },
      {
        section: 'Structure',
        text: "L'organisation est décentralisée, avec des cellules autonomes dans différents systèmes. Les commandants locaux jouissent d'une grande indépendance. Un leadership central existe mais reste dans l'ombre. Cette structure les rend difficiles à démanteler complètement.",
      },
    ],
    related: ['faction-uee', 'lieu-stanton', 'lieu-pyro', 'kellar-rhee'],
    tags: ['nine tails', 'criminel', 'stanton', 'pyro', 'terrorisme', 'pirate'],
    importance: 'notable',
    era: '29ème siècle – Présent',
  },

  {
    id: 'faction-xenothreat',
    title: 'XenoThreat',
    category: 'faction',
    subcategory: 'organisation terroriste',
    date: 'Active : ~2945',
    summary: "XenoThreat est un groupe terroriste humain prônant la xénophobie et l'isolationnisme radical. Ils s'opposent violemment à tout contact avec les espèces aliens et ont mené des attaques contre des ambassades et convois diplomatiques.",
    content: [
      {
        section: 'Idéologie',
        text: "XenoThreat prêche la supériorité humaine et la menace existentielle que représenteraient toutes les espèces aliens — y compris les Banu et les Xi'an, pourtant pacifiques. Ils considèrent le Traité Xi'an-UEE comme une trahison. Leur recrutement cible principalement les vétérans traumatisés par les guerres Vanduul.",
      },
      {
        section: 'Attaques notables',
        text: "XenoThreat a conduit plusieurs attaques d'envergure contre des stations UEE perçues comme 'pro-alien'. Dans le jeu, ils ont organisé des raids massifs sur la station Iata dans le système Stanton, nécessitant l'intervention de nombreux joueurs pour les repousser.",
      },
    ],
    related: ['faction-uee', 'race-xian', 'race-banu', 'premiere-rencontre-vanduul'],
    tags: ['xenothreat', 'terrorisme', 'xénophobie', 'alien', 'isolationnisme'],
    importance: 'notable',
    era: '30ème siècle',
  },

  {
    id: 'faction-headhunters',
    title: 'Headhunters',
    category: 'faction',
    subcategory: 'mercenaires criminels',
    date: 'Active : ~2900',
    summary: "Les Headhunters sont un gang de mercenaires hors-la-loi spécialisés dans les enlèvements, les contrats d'assassinat et le trafic dans les régions non-gouvernées de Pyro et au-delà.",
    content: [
      {
        section: 'Activités',
        text: "Les Headhunters acceptent des contrats de toutes natures dans la mesure où le paiement est suffisant. Enlèvements de personnalités, assassinats ciblés, pillage de convois — rien n'est hors de leur portée. Ils sont particulièrement actifs dans les zones où l'Advocacy n'a pas de présence.",
      },
      {
        section: 'Recrutement',
        text: "Le gang recrute parmi les déserteurs de la Marine UEE, les mercenaires sans scrupules et les criminels cherchant une structure. Leur réputation d'efficacité et de loyauté envers leurs employeurs — tant que le contrat est honoré — leur vaut une clientèle régulière dans les milieux criminels.",
      },
    ],
    related: ['lieu-pyro', 'faction-nine-tails', 'kellar-rhee'],
    tags: ['headhunters', 'mercenaires', 'criminel', 'pyro', 'contrat', 'assassinat'],
    importance: 'mineur',
    era: '30ème siècle',
  },

  {
    id: 'faction-cdf',
    title: 'CDF — Forces Défensives Citoyennes',
    category: 'faction',
    subcategory: 'milice para-officielle',
    date: 'Fondée : ~2900',
    summary: "Les Forces Défensives Citoyennes (CDF) sont une milice para-officielle chargée d'assister la Marine UEE dans la défense des systèmes frontières contre les raids Vanduul.",
    content: [
      {
        section: 'Rôle et organisation',
        text: "La CDF est composée de volontaires civils équipant leurs propres vaisseaux pour défendre les zones que la Marine UEE ne peut couvrir seule. Elle reçoit une reconnaissance légale de l'UEE et quelques aides logistiques, mais ses membres ne sont pas des soldats réguliers et ne reçoivent pas de salaire.",
      },
      {
        section: 'Importance tactique',
        text: "Dans les systèmes frontières sous pression Vanduul, la CDF représente souvent la première ligne de défense. Ses pilotes sont aguerris mais souvent mal équipés. Rejoindre la CDF offre aux joueurs des missions de défense et une réputation positive auprès de l'UEE.",
      },
    ],
    related: ['race-vanduul', 'faction-uee', 'premiere-rencontre-vanduul'],
    tags: ['cdf', 'milice', 'défense', 'vanduul', 'volontaire', 'frontière'],
    importance: 'notable',
    era: '30ème siècle',
  },

  {
    id: 'faction-travellers-guild',
    title: 'Travellers Guild',
    category: 'faction',
    subcategory: 'guilde neutre',
    date: 'Fondée : ~2700',
    summary: "La Travellers Guild est une organisation neutre facilitant le partage d'informations entre explorateurs, marchands et voyageurs. Elle maintient des réseaux d'avant-postes dans les zones peu peuplées.",
    content: [
      {
        section: 'Services',
        text: "La Guild propose des bases de données cartographiques, des réseaux de ravitaillement dans les zones reculées et des contrats d'exploration. Elle est l'une des rares organisations acceptant des membres de toutes allégeances — légaux ou non — à condition de respecter le code de conduite de la Guild.",
      },
      {
        section: 'Neutralité',
        text: "La Travellers Guild a toujours maintenu une stricte neutralité dans les conflits politiques. Cette position lui a permis de survivre à l'Ère Messer et de maintenir des relations diplomatiques avec les Banu. Elle est parfois perçue comme un refuge pour ceux qui rejettent les structures de pouvoir habituelles.",
      },
    ],
    related: ['faction-uee', 'race-banu'],
    tags: ['guild', 'explorateurs', 'neutre', 'cartographie', 'voyage'],
    importance: 'mineur',
    era: '28ème siècle – Présent',
  },

  // ══════════════════════════════════════════════════════════════════
  // LIEUX HISTORIQUES
  // ══════════════════════════════════════════════════════════════════

  {
    id: 'lieu-terra',
    title: 'Système Terra — Capitale de l\'UEE',
    category: 'lieu',
    subcategory: 'capitale politique',
    date: 'Capitale depuis : 2600',
    summary: "Terra est le système le plus développé de l'espace humain après Sol. Sa planète principale, Prime, abrite le siège du Sénat UEE et est considérée comme la capitale culturelle et politique de l'humanité.",
    content: [
      {
        section: 'Histoire et statut',
        text: "Terra fut l'un des premiers systèmes colonisés après la découverte des jump points. Sa planète habitable Prime se développa rapidement en rival de la Terre elle-même. Sous les Messer, Terra représenta un centre de résistance culturelle aux diktats de Sol. Après 2792, elle devint officiellement la capitale de l'UEE réformée.",
      },
      {
        section: 'Prime',
        text: "Prime est une planète d'une beauté exceptionnelle, avec de vastes continents verdoyants et des océans profonds. Sa capitale héberge le Parlement UEE, les ambassades de toutes les factions reconnues et les principales institutions culturelles de l'humanité. C'est aussi un centre financier majeur.",
      },
      {
        section: 'Culture Terrienne',
        text: "Les Terriens ont développé une identité distincte, mélange d'aristocratie coloniale et de progressisme cosmopolite. Ils se considèrent souvent comme plus 'civilisés' que les Terriens de Sol, ce qui génère des tensions. L'art, la gastronomie et la mode de Terra sont reconnus dans tout l'espace humain.",
      },
    ],
    related: ['faction-uee', 'uee-histoire', 'guerres-messer'],
    tags: ['terra', 'prime', 'capitale', 'uee', 'sénat', 'politique', 'culture'],
    importance: 'majeur',
    era: '24ème siècle – Présent',
  },

  {
    id: 'lieu-croshaw',
    title: 'Système Croshaw — Premier Pas',
    category: 'lieu',
    subcategory: 'système historique',
    date: 'Découverte : 2271',
    summary: "Premier système atteint par les Humains via jump point, Croshaw porte le nom de son explorateur Nick Croshaw. C'est la porte d'entrée historique vers les étoiles.",
    content: [
      {
        section: 'Géographie',
        text: "Le système Croshaw possède plusieurs planètes dont Angeli, une planète habitable à la végétation rouge-orangée particulièrement appréciée des touristes. C'est un système bien établi avec des infrastructures commerciales et résidentielles solides.",
      },
      {
        section: 'Importance historique',
        text: "Croshaw reste un symbole fort de l'aventure interstellaire humaine. Un musée dédié à Nick Croshaw est installé sur Angeli, et le jump point originel est balisé comme site historique. Chaque année, des pèlerinages d'explorateurs traversent ce même point de saut pour commémorer la traversée de 2271.",
      },
    ],
    related: ['nick-croshaw', 'premier-saut'],
    tags: ['croshaw', 'premier', 'système', 'angeli', 'historique', 'exploration'],
    importance: 'notable',
    era: '23ème siècle – Présent',
  },

  {
    id: 'lieu-stanton',
    title: 'Système Stanton',
    category: 'lieu',
    subcategory: 'hub commercial',
    date: 'Colonisé : 2262',
    summary: "Stanton est le seul système entièrement privé de l'espace humain, divisé entre quatre méga-corporations. C'est aussi la zone de jeu principale de Star Citizen, la plus active économiquement.",
    content: [
      {
        section: 'Les quatre planètes',
        text: "Hurston (industrie lourde et armement), ArcCorp (planète entièrement urbanisée, hub commercial), Crusader (géante gazeuse, colonies aériennes), microTech (planète froide, technologie de pointe). Chaque planète possède une ville principale et de nombreuses lunes habitées.",
      },
      {
        section: 'Économie',
        text: "Stanton est le cœur économique de l'espace humain accessible. Le commerce, le transport de fret, l'extraction minière, le bounty hunting et les missions corporatistes y sont florissants. Les stations comme Port Olisar, Baijini Point, Area 18 ou New Babbage sont des hubs incontournables.",
      },
      {
        section: 'Tensions sociales',
        text: "Malgré sa prospérité apparente, Stanton souffre de profondes inégalités. Les corporations exploitent leurs travailleurs, les criminels comme les Nine Tails recrutent parmi les mécontents. L'Advocacy peine à maintenir l'ordre dans un système où les corporations font leur propre loi.",
      },
    ],
    related: ['colonisation-stanton', 'faction-nine-tails', 'faction-uee'],
    tags: ['stanton', 'hurston', 'arccorp', 'crusader', 'microtech', 'corporation', 'gameplay'],
    importance: 'majeur',
    era: '23ème siècle – Présent',
  },

  {
    id: 'lieu-pyro',
    title: 'Système Pyro',
    category: 'lieu',
    subcategory: 'zone dangereuse',
    date: 'Découverte : 2789',
    summary: "Pyro est un système sauvage gravitant autour d'une étoile instable mourante. Sans gouvernance UEE, il est devenu un repaire de pirates et de hors-la-loi, ainsi que le terrain d'exploration d'aventuriers courageux.",
    content: [
      {
        section: 'L\'étoile flicker',
        text: "L'étoile de Pyro est dite 'flicker' : une étoile mourante dont l'activité irrégulière soumet les planètes orbières à des conditions extrêmes. Cette instabilité rend la terraformation impossible mais crée des gisements de minéraux rares liés à l'activité solaire intense.",
      },
      {
        section: 'Planètes et avant-postes',
        text: "Les planètes de Pyro — Pyro I à VI — vont de roches brûlantes à des géantes gazeuses instables. Des avant-postes survivants subsistent sur Pyro I (Checkmate), Pyro IV (Ruin Station) et d'autres sites. Ces structures abandonées ont été récupérées par des communautés de fortune.",
      },
      {
        section: 'La vie dans Pyro',
        text: "Sans loi effective, Pyro applique la règle du plus fort. Les factions criminelles se partagent les territoires, les commerçants opèrent à leurs risques, et les explorateurs cherchent des ruines ou des ressources rares. C'est un écosystème brutal mais fascinant.",
      },
    ],
    related: ['decouverte-pyro', 'marshall-tobin', 'faction-nine-tails', 'kellar-rhee'],
    tags: ['pyro', 'étoile', 'sauvage', 'criminel', 'exploration', 'libre', 'dangereux'],
    importance: 'majeur',
    era: '28ème siècle – Présent',
  },

  {
    id: 'lieu-nyx',
    title: 'Système Nyx — Le Refuge des Rebelles',
    category: 'lieu',
    subcategory: 'zone non gouvernée',
    date: 'Connu depuis : ~2700',
    summary: "Nyx est un système pauvre aux ressources limitées, ignoré par l'UEE. Cette marginalité en a fait le refuge de dissidents, de fuyards et de communautés autonomes refusant l'autorité UEE.",
    content: [
      {
        section: 'Levski',
        text: "La station Levski, ancrée dans un astéroïde de la ceinture de Nyx, est le principal hub du système. Lieu de rencontre des réfractaires à l'UEE, elle accueille des marchands indépendants, des journalistes dissidents et des activistes de toutes tendances. L'Advocacy y est officiellement absente.",
      },
      {
        section: 'Idéologie dominante',
        text: "Nyx est un espace de liberté radicale. Si tous ne partagent pas les mêmes convictions, le dénominateur commun est le rejet de l'autorité corporatiste et gouvernementale. Des intellectuels, des artistes et des politiques en fuite y trouvent refuge aux côtés de contrebandiers ordinaires.",
      },
    ],
    related: ['faction-uee', 'lieu-stanton', 'kellar-rhee'],
    tags: ['nyx', 'levski', 'rebelles', 'indépendants', 'liberté', 'refuge'],
    importance: 'notable',
    era: '28ème siècle – Présent',
  },

  {
    id: 'lieu-elysium',
    title: 'Système Elysium — Berceau Tevarin',
    category: 'lieu',
    subcategory: 'site historique',
    date: 'Conquis : 2546',
    summary: "Elysium est le berceau spirituel de la civilisation Tevarin. Sa planète Kaleeth, théâtre du sacrifice de Corath'Thal en 2603, est aujourd'hui un site commémoratif visité par des pèlerins Tevarin.",
    content: [
      {
        section: 'Kaleeth et le Rijora',
        text: "Kaleeth est la planète la plus sacrée pour les Tevarin. Ses ruines témoignent d'une architecture caractéristique et d'une culture spirituelle profonde. La chute de météores de feu créée par la flotte de Corath'Thal a laissé des cicatrices visibles depuis l'orbite, transformées en sites de pèlerinage.",
      },
      {
        section: 'Sous domination UEE',
        text: "Depuis 2546, Elysium est sous contrôle UEE. Des colons humains s'y sont installés. Les sites Tevarin sont officiellement protégés, mais des tensions existent entre la population humaine et les Tevarin souhaitant préserver leur héritage.",
      },
    ],
    related: ['race-tevarin', 'guerres-tevarin', 'corath-thal'],
    tags: ['elysium', 'kaleeth', 'tevarin', 'sacré', 'histoire', 'sacrifice', 'pèlerinage'],
    importance: 'notable',
    era: '26ème siècle – Présent',
  },

  {
    id: 'lieu-hades',
    title: 'Système Hades — Les Ruines Mystérieuses',
    category: 'lieu',
    subcategory: 'site archéologique',
    date: 'Découverte des ruines : ~2800',
    summary: "Hades est un système dont les planètes portent les traces d'une catastrophe civilisationnelle ancienne. Les ruines Hadesians restent l'un des mystères les plus profonds de la xénologie.",
    content: [
      {
        section: 'Les ruines',
        text: "Hades IV possède des structures architecturales massives partiellement détruites, dont certaines s'étendent sur plusieurs kilomètres. Les matériaux utilisés ne correspondent à rien de connu dans l'espace humain ou alien. Les xénologues débattent depuis des décennies de leur origine et de leur fonction.",
      },
      {
        section: 'La catastrophe',
        text: "Les preuves suggèrent que les Hadesians ont subi une destruction d'une violence absolue, vraisemblablement auto-infligée lors d'une guerre civile. Les planètes internes montrent des signes de bombardements orbitaux massifs. Aucune trace d'une menace extérieure n'a été trouvée.",
      },
      {
        section: 'Implications',
        text: "La question de savoir si l'Humanité pourrait suivre le même chemin hante les philosophes et les historiens. Certains voient dans Hades un avertissement. L'accès aux sites de fouilles est strictement contrôlé par l'UEE pour des raisons 'de sécurité', ce qui alimente des théories conspirationnistes.",
      },
    ],
    related: ['race-hadesian'],
    tags: ['hades', 'ruines', 'archéologie', 'mystère', 'hadesians', 'extinction'],
    importance: 'notable',
    era: 'Préhistoire galactique / Découverte : 29ème siècle',
  },

  {
    id: 'lieu-virgil',
    title: 'Système Virgil — Champ de Bataille',
    category: 'lieu',
    subcategory: 'zone de conflit',
    date: 'Bataille majeure : ~2700',
    summary: "Le système Virgil a été le théâtre de plusieurs batailles majeures entre l'UEE et les Vanduul. Sa position stratégique en fait un point de passage obligé que les deux camps se disputent depuis des siècles.",
    content: [
      {
        section: 'Position stratégique',
        text: "Virgil est situé à la jonction de plusieurs routes de saut reliant des systèmes UEE à des zones Vanduul. Contrôler Virgil équivaut à contrôler les flux de mouvements entre les deux espaces. Chaque camp a tenté à plusieurs reprises de s'en emparer définitivement.",
      },
      {
        section: 'Les batailles',
        text: "Les batailles de Virgil ont fait des centaines de milliers de morts militaires. Des épaves de vaisseaux de tous types flottent encore dans le système, recyclées par des chasseurs de primes ou des pillards. La bataille de Virgil de 2712 est étudiée dans toutes les académies militaires.",
      },
    ],
    related: ['race-vanduul', 'faction-uee', 'perte-orion'],
    tags: ['virgil', 'bataille', 'vanduul', 'uee', 'stratégique', 'guerre'],
    importance: 'notable',
    era: '28ème siècle',
  },

  {
    id: 'lieu-banshee',
    title: 'Système Banshee — La Zone Maudite',
    category: 'lieu',
    subcategory: 'zone dangereuse',
    date: 'Colonisé partiellement : ~2600',
    summary: "Banshee est un système difficile d'accès, aux conditions environnementales extrêmes et faiblement colonisé. Son isolement en a fait un refuge pour des communautés marginales et des opérations illicites.",
    content: [
      {
        section: 'Conditions extrêmes',
        text: "L'étoile de Banshee émet des radiations irrégulières qui compliquent la navigation et endommagent les systèmes électroniques à la longue. Les planètes habitables sont rares et les conditions de vie difficiles. La terraformation a été tentée mais jamais achevée faute de financement.",
      },
      {
        section: 'Population marginale',
        text: "Ceux qui vivent à Banshee l'ont généralement choisi pour fuir quelque chose : la loi, une dette, un passé. Des communautés de fortune se sont établies autour des quelques ressources exploitables. L'Advocacy n'y patrouille que rarement.",
      },
    ],
    related: ['lieu-pyro', 'lieu-nyx'],
    tags: ['banshee', 'marginal', 'dangereux', 'isolé', 'radiation', 'refuge'],
    importance: 'mineur',
    era: '27ème siècle – Présent',
  },

  {
    id: 'uee-histoire',
    title: "Histoire de l'UEE",
    category: 'evenement',
    subcategory: 'chronologie',
    date: '2546 – Présent',
    summary: "De la tyrannie Messer aux réformes de 2792, en passant par les guerres aliens, l'histoire de l'UEE est celle de l'Humanité dans les étoiles — grandeur et misère mêlées.",
    content: [
      {
        section: 'Les grandes ères',
        text: "La fondation de l'UEE en 2546 marque le début de l'expansion humaine organisée. L'Ère Messer (2546–2792) est la plus sombre, suivie par la Réforme (2792–présent) qui cherche à réconcilier légitimité démocratique et impératifs d'un empire interstellaire.",
      },
      {
        section: 'Défis contemporains',
        text: "L'UEE contemporaine fait face à plusieurs crises simultanées : la menace Vanduul permanente sur les frontières, les tensions avec les Xi'an malgré le traité, la montée des organisations criminelles dans les systèmes périphériques, et les inégalités croissantes entre systèmes centraux et colonies.",
      },
      {
        section: 'L\'Imperator actuel',
        text: "L'Imperator Costigan a inauguré une politique de réforme progressive et de réengagement diplomatique. Mais les conservateurs au Sénat freinent les réformes les plus ambitieuses. L'UEE reste une entité puissante mais fragilisée par ses contradictions internes.",
      },
    ],
    related: ['guerres-messer', 'messer-ivar-i', 'chute-garron-ii', 'traite-xian-uee'],
    tags: ['uee', 'histoire', 'chronologie', 'empire', 'réforme', 'politique'],
    importance: 'majeur',
    era: '26ème siècle – Présent',
  },
];

// ─── MÉTADONNÉES ──────────────────────────────────────────────────────────────

export const LORE_CATEGORIES = [
  { id: 'race',       label: 'Races',        color: '#8b5cf6', description: 'Espèces intelligentes de la galaxie' },
  { id: 'personnage', label: 'Personnages',   color: '#f59e0b', description: 'Figures historiques marquantes' },
  { id: 'evenement',  label: 'Événements',    color: '#ef4444', description: 'Moments clés de l\'histoire' },
  { id: 'faction',    label: 'Factions',      color: '#3b82f6', description: 'Organisations et groupes' },
  { id: 'lieu',       label: 'Lieux',         color: '#10b981', description: 'Systèmes et lieux historiques' },
];

export const IMPORTANCE_CONFIG = {
  majeur:  { label: 'Majeur',  badge: 'badge-red',    dot: 'bg-danger-400' },
  notable: { label: 'Notable', badge: 'badge-yellow',  dot: 'bg-warning-400' },
  mineur:  { label: 'Mineur',  badge: 'badge-slate',   dot: 'bg-slate-500' },
};

export const LORE_ERAS = [
  'Antiquité',
  '23ème siècle',
  '24ème siècle',
  '25ème siècle',
  '26ème siècle',
  '27ème siècle',
  '28ème siècle',
  '29ème siècle',
  '30ème siècle',
  'Toutes époques',
];

// Articles en vedette (pour la page d'accueil de la Galactapédie)
export const FEATURED_ARTICLES = [
  'nick-croshaw',
  'race-vanduul',
  'guerres-messer',
  'lieu-pyro',
  'traite-xian-uee',
];
