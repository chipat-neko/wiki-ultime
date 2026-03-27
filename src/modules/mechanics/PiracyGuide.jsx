import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  AlertTriangle, Shield, MapPin, Clock, ChevronDown, ChevronUp,
  Info, Zap, Target, DollarSign, BookOpen, Skull, Radio,
  Package, Eye, Anchor, Navigation, TrendingUp, Users,
  Lock, Star, Crosshair, Rocket, Search, X,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Onglet 1 : Piraterie Spatiale
══════════════════════════════════════════════════════════════ */

const PIRACY_TYPES = [
  {
    id: 'interdiction',
    icon: Navigation,
    color: 'text-danger-400',
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    name: 'Interdiction de Vaisseau',
    description: 'Forcer un vaisseau ennemi à sortir de son trajet de Quantum Travel pour l\'arrêter ou l\'attaquer.',
    method: 'Placer un vaisseau dans le trajet QT de la cible ou utiliser un interdicteur quantique.',
    legalStatus: 'Illégal partout (CS3+ selon zone)',
    loot: 'Cargaison entière si capturé, épave si détruit',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    difficulty: 4,
    profitability: 5,
  },
  {
    id: 'cargo',
    icon: Package,
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    bg: 'bg-warning-500/10',
    name: 'Attaque de Cargo',
    description: 'Cibler spécifiquement les vaisseaux de transport chargés de marchandises pour leur dérober leur cargaison.',
    method: 'Identifier les routes commerciales actives, attendre au point de transit, attaquer en phase de décélération QT.',
    legalStatus: 'Illégal (CS2-CS3)',
    loot: 'Cargaison SCU selon vaisseau : 10-684 SCU',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    difficulty: 3,
    profitability: 5,
  },
  {
    id: 'ambush',
    icon: Eye,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    name: 'Embuscade aux Points de Saut',
    description: 'Se poster à proximité des Jump Points connus pour attaquer les vaisseaux en transition entre systèmes.',
    method: 'Attendre en mode silencieux (moteurs coupés, signature EM réduite) près des JP Pyro/Stanton.',
    legalStatus: 'Illégal en zone UEE, toléré dans Pyro',
    loot: 'Variable selon la cible (souvent vaisseaux chargés en transit)',
    risk: 'Faible à moyen',
    riskBadge: 'badge-green',
    difficulty: 2,
    profitability: 4,
  },
  {
    id: 'trap',
    icon: Anchor,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    name: 'Leurre & Traquenard',
    description: 'Simuler une urgence ou une opportunité commerciale pour attirer des victimes dans une zone de non-droit.',
    method: 'Émettre un faux appel de détresse, se déguiser en négociant ou escorte, puis tendre une embuscade au groupe.',
    legalStatus: 'Illégal (CS2+) — fraude + agression',
    loot: 'Dépend de la cible attirée',
    risk: 'Faible (pour l\'attaquant)',
    riskBadge: 'badge-green',
    difficulty: 2,
    profitability: 3,
  },
  {
    id: 'escort',
    icon: Shield,
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    bg: 'bg-gold-500/10',
    name: 'Escorte Corrompue',
    description: 'S\'engager comme vaisseau d\'escorte pour un marchand puis le trahir au moment opportun.',
    method: 'Répondre aux annonces d\'escorte dans Spectrum/chat, accompagner jusqu\'à une zone isolée, puis attaquer.',
    legalStatus: 'Illégal (CS3 — trahison + agression)',
    loot: 'Cargaison complète + paiement d\'escorte initial',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    difficulty: 3,
    profitability: 4,
  },
];

const CRIME_STAT_TABLE = [
  { action: 'Survol de zone douanière sans scan', cs: 'CS1', notes: 'Avertissement, amende possible' },
  { action: 'Possession de marchandise illégale (petite quantité)', cs: 'CS1', notes: 'Si découvert lors d\'un scan' },
  { action: 'Agression non mortelle d\'un joueur/NPC', cs: 'CS2', notes: 'En zone sécurisée uniquement' },
  { action: 'Vol de vaisseau ou de cargaison', cs: 'CS3', notes: 'Quelle que soit la zone' },
  { action: 'Meurtre d\'un joueur non-combattant', cs: 'CS3', notes: 'Cumulable +CS par kill' },
  { action: 'Destruction d\'un vaisseau de commerce', cs: 'CS3', notes: 'Identification par les balises auto' },
  { action: 'Interdiction quantique illégale', cs: 'CS3', notes: 'Utilisation d\'un interdicteur contre cible innocente' },
  { action: 'Piraterie organisée (plusieurs kills)', cs: 'CS4', notes: 'Après 5+ kills sur session' },
  { action: 'Destruction de vaisseau capitaliste ou civil multiple', cs: 'CS4', notes: 'Crimes de masse' },
  { action: 'Génocide / attaque de station', cs: 'CS5', notes: 'Perpétuel, tout le serveur hostile' },
];

const INTERDICTION_TACTICS = [
  {
    id: 'qt-interdict',
    title: 'Interdiction QT directe',
    difficulty: 4,
    profitability: 5,
    crimestatRisk: 'CS3',
    crimestatBadge: 'badge-red',
    icon: Zap,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    ships: ['Buccaneer (agile, port latéral)', 'Sabre (furtif, QT rapide)', 'Hammerhead (lourd, groupe)', 'Cutlass Black (polyvalent)'],
    idealZones: ['Routes Crusader → stations satellites', 'Transit Hurston ↔ crusader', 'Jump Point Pyro côté Stanton'],
    timing: 'Activer l\'interdicteur 3-5 secondes avant que la cible atteigne le point de transition QT. La fenêtre est courte — timing critique.',
    counters: ['Escorte active (2 chasseurs)', 'Route QT alternative', 'Sprint et re-jump immédiat'],
    tip: 'Positionnez-vous légèrement en avance sur le vecteur QT de la cible. Les routes vers Microtech sont parmi les plus fréquentées.',
  },
  {
    id: 'jp-ambush',
    title: 'Embuscade aux Jump Points',
    difficulty: 2,
    profitability: 4,
    crimestatRisk: 'Minimal (Pyro)',
    crimestatBadge: 'badge-green',
    icon: MapPin,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    ships: ['Sabre (furtif recommandé)', 'Gladius (agile)', 'Eclipse (torpilles)', 'Tout chasseur léger à moyen'],
    idealZones: ['Jump Point Stanton-Pyro (côté Pyro)', 'Jump Point Pyro-Nyx', 'Jump Point internes Pyro'],
    timing: 'Les vaisseaux émergent des JP avec une courte fenêtre d\'invulnérabilité. Attaquez dès que le vaisseau est pleinement materialisé.',
    counters: ['Sortie rapide QT post-JP', 'Appel de soutien sur comms', 'Combat de mêlée immédiat'],
    tip: 'En Pyro, aucune sécurité ne répondra. Coordonnez un groupe de 2-3 pour couvrir les différentes directions de sortie du JP.',
  },
  {
    id: 'decoy',
    title: 'Leurre et Traquenard',
    difficulty: 2,
    profitability: 3,
    crimestatRisk: 'CS2-CS3',
    crimestatBadge: 'badge-yellow',
    icon: Radio,
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    ships: ['Vaisseau médical (Cutlass Red pour crédibilité)', 'Freelancer comme leurre marchand', 'Chasseurs cachés hors détection'],
    idealZones: ['Zones isolées entre lunes', 'Axe Lyria/Wala (faible trafic)', 'Périphérie Pyro Station 3'],
    timing: 'Émettre la fausse urgence puis attendre. Laissez la cible s\'approcher à moins de 5 km avant d\'engager le vaisseau embusqué.',
    counters: ['Vérification comms officielle avant réponse', 'Garder les boucliers actifs à l\'approche', 'Ne jamais couper les moteurs vers l\'inconnu'],
    tip: 'Utilisez un compte secondaire ou un ami de confiance pour jouer le rôle du "naufragé". Soyez en position d\'encerclement avant d\'émettre.',
  },
  {
    id: 'corrupt-escort',
    title: 'Escorte Corrompue',
    difficulty: 3,
    profitability: 4,
    crimestatRisk: 'CS3',
    crimestatBadge: 'badge-red',
    icon: Users,
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    ships: ['Tout chasseur rapide (Gladius, Buccaneer, Arrow)', 'Sabre pour discrétion initiale', 'Pisces / 85X pour air de confiance'],
    idealZones: ['Toute route commerciale Stanton', 'Dès que la cible s\'éloigne des zones haute sécurité', 'Transition vers Pyro — moment idéal'],
    timing: 'Attendez que la cible soit en plein voyage inter-système, loin de tout secours. Attackez au milieu du QT ou dès la sortie.',
    counters: ['Vérifier réputation escorte sur Spectrum', 'Exiger paiement partiel à l\'avance (méfiance si refus)', 'Toujours avoir une escorte de confiance doublée'],
    tip: 'La socialisation préalable est la clé. Plus vous paraissez fiable, plus la proie sera vulnérable. Évitez les cibles avec des amis en ligne.',
  },
];

const COMMUNICATION_SCRIPTS = [
  {
    scenario: 'Arrêt immédiat (cargo)',
    opener: '"Vaisseau non identifié, ici [Callsign]. Vous êtes en zone de contrôle. Coupez vos moteurs et déposez votre cargaison ou nous ouvrons le feu."',
    followup: 'Si aucune réaction dans 10s : "Dernier avertissement. Éjectez les conteneurs maintenant."',
    tone: 'Autoritaire, direct',
    outcome: 'Capitulation rapide ou engagement',
  },
  {
    scenario: 'Négociation (cible précieuse)',
    opener: '"Capitaine, nous n\'avons aucun intérêt à vous tuer. Déposez 50% de votre cargo et vous repartez libre. C\'est une offre raisonnable."',
    followup: 'Laisser le temps de répondre. Accepter une contre-offre partielle si sincère.',
    tone: 'Calme, professionnel, calculé',
    outcome: 'Transaction sans violence, moins de CrimeStat',
  },
  {
    scenario: 'Intimidation psychologique',
    opener: '"J\'ai votre signature de vaisseau. Je sais où vous allez. Faisons ça proprement : cargo déposé, aucun signalement de notre part aux autorités."',
    followup: 'Feindre d\'avoir des contacts aux douanes ou dans les factions locales.',
    tone: 'Menaçant mais calculé',
    outcome: 'Fonctionne sur les joueurs peu sûrs d\'eux',
  },
  {
    scenario: 'Laisser partir la cible',
    opener: '"Vous avez coopéré. Vous pouvez partir. Dites à vos amis que [Org] opère ici."',
    followup: 'Laisser l\'adversaire QT partir sans obstruction.',
    tone: 'Neutre, professionnel',
    outcome: 'Réputation de "pirate respectueux", moins de représailles org',
  },
];

const PIRACY_ZONES = [
  {
    zone: 'Route Hurston → Microtech',
    security: 'Modérée',
    secBadge: 'badge-yellow',
    cargos: 'Laranite, SLAM, Agriculture, Métaux',
    advocacy: 'Modéré (Hurston/MT Security)',
    tip: 'Zone la plus fréquentée de Stanton. Risque de chasseurs de primes elevé mais proies abondantes.',
  },
  {
    zone: 'Périphérie Crusader (Iceboxes)',
    security: 'Faible',
    secBadge: 'badge-red',
    cargos: 'Medical supplies, Hydrogène, Matériaux bruts',
    advocacy: 'Faible (très peu de patrouilles)',
    tip: 'Les iceboxes sont isolés. Les joueurs solo y sont très vulnérables, proies fréquentes.',
  },
  {
    zone: 'Jump Point Stanton-Pyro',
    security: 'Aucune (côté Pyro)',
    secBadge: 'badge-purple',
    cargos: 'Tout (transit haute valeur)',
    advocacy: 'Nul en Pyro',
    tip: 'Le meilleur point d\'embuscade stratégique. Les vaisseaux sortant de Stanton sont souvent chargés.',
  },
  {
    zone: 'Systeme Pyro (entier)',
    security: 'Aucune',
    secBadge: 'badge-purple',
    cargos: 'Contrebande, Matières premières, Équipements militaires',
    advocacy: 'Absent — Nine Tails et Dusters patrouillent',
    tip: 'Zone de non-droit absolue. Aucun CrimeStat UEE généré. Mais méfiez-vous des factions rivales.',
  },
  {
    zone: 'Lune Lyria (ArcCorp)',
    security: 'Faible',
    secBadge: 'badge-red',
    cargos: 'Minéraux rares, Agri',
    advocacy: 'Rare (patrouilles ArcCorp Security)',
    tip: 'Les mineurs solos en ROC/MOLE sont des proies faciles. Coordonnez 2 chasseurs minimum.',
  },
  {
    zone: 'Station GrimHEX (Yela)',
    security: 'Anarchique',
    secBadge: 'badge-purple',
    cargos: 'N/A (base de retraite)',
    advocacy: 'Aucune (territoire neutre)',
    tip: 'Refuge idéal post-raid pour se réapprovisionner et attendre l\'expiration du CrimeStat.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Onglet 2 : Bases & Refuges Outlaw
══════════════════════════════════════════════════════════════ */

const OUTLAW_BASES = [
  {
    id: 'grimhex',
    name: 'GrimHEX',
    location: 'Orbite de Yela (lune de Crusader, Stanton)',
    faction: 'Neutre / anarchique',
    factionBadge: 'badge-slate',
    security: 'Faible (loi du plus fort)',
    population: 'Élevée',
    icon: Anchor,
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    services: { medical: true, hangar: true, trade: true, repair: true, ammo: true, missions: true },
    description: 'Ancienne station minière reconvertie en refuge pour criminels et outlaws. La plus accessible depuis Stanton, avec accès aux missions Nine Tails et contrebande.',
    tip: 'Point de départ idéal pour la carrière outlaw. Commerce illégal disponible, mais méfiez-vous des règlements de comptes entre joueurs.',
  },
  {
    id: 'levski',
    name: 'Levski',
    location: 'Astéroïde Delamar (bord extérieur Stanton)',
    faction: 'Xenothreat sympathisants / indépendants',
    factionBadge: 'badge-red',
    security: 'Modérée (milice locale)',
    population: 'Modérée',
    icon: Shield,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    services: { medical: true, hangar: true, trade: true, repair: true, ammo: true, missions: true },
    description: 'Station creusée dans un astéroïde, fief des rebelles anti-UEE. Bien équipée, relativement sûre à l\'intérieur, hostile envers les forces de l\'ordre.',
    tip: 'Excellent repaire pour les outlaws avec CS3+. Missions spéciales anti-UEE disponibles. Accès discret via QT depuis zone éloignée.',
  },
  {
    id: 'nine-tails-outpost',
    name: 'Avant-postes Nine Tails',
    location: 'Lunes Stanton (mobiles, rotatifs)',
    faction: 'Nine Tails',
    factionBadge: 'badge-red',
    security: 'Élevée (Nine Tails guards)',
    population: 'Faible à modérée',
    icon: Skull,
    color: 'text-danger-400',
    border: 'border-danger-500/30',
    services: { medical: false, hangar: true, trade: true, repair: false, ammo: true, missions: true },
    description: 'Camps temporaires établis par les Nine Tails sur des lunes peu surveillées. Accès aux missions de piraterie organisées et à l\'équipement militaire Nine Tails.',
    tip: 'Nécessite une réputation Nine Tails positive. Parfait pour missions haute rémunération de piraterie coordonnée.',
  },
  {
    id: 'checkmate',
    name: 'Checkmate Station',
    location: 'Système Pyro (Pyro IV)',
    faction: 'Eclipsed Suns / indépendants',
    factionBadge: 'badge-purple',
    security: 'Modérée (règle de respect mutuel)',
    population: 'Modérée',
    icon: Lock,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    services: { medical: true, hangar: true, trade: true, repair: true, ammo: true, missions: true },
    description: 'Station principale de Pyro accessible aux outlaws. Hub commercial illégal majeur du système, services complets et factions Pyro présentes.',
    tip: 'Meilleur ravitaillement en Pyro. Commerce de marchandises illégales sans risque d\'arrestation UEE.',
  },
  {
    id: 'ruin-station',
    name: 'Ruin Station',
    location: 'Système Pyro (Pyro III)',
    faction: 'Rough & Ready',
    factionBadge: 'badge-yellow',
    security: 'Faible',
    population: 'Faible',
    icon: Star,
    color: 'text-gold-400',
    border: 'border-gold-500/30',
    services: { medical: false, hangar: true, trade: true, repair: true, ammo: false, missions: true },
    description: 'Avant-poste industriel reconverti en refuge outlaw. Moins connue, donc moins ciblée par chasseurs de primes amateurs.',
    tip: 'Bon refuge secondaire si Checkmate est trop risqué. Réparations disponibles à tarif réduit.',
  },
  {
    id: 'rappel',
    name: 'Rappel',
    location: 'Lune de Pyro V',
    faction: 'Dusters',
    factionBadge: 'badge-yellow',
    security: 'Territoire Dusters',
    population: 'Élevée (faction)',
    icon: MapPin,
    color: 'text-warning-400',
    border: 'border-warning-500/30',
    services: { medical: true, hangar: true, trade: false, repair: true, ammo: true, missions: true },
    description: 'Fief principal des Dusters. Accès aux missions de faction Dusters, spécialisées dans le contrôle territorial de Pyro.',
    tip: 'Utile pour les outlaws ayant une bonne réputation Dusters. Missions de défense territoriale très rentables.',
  },
  {
    id: 'brio-workshop',
    name: "Brio's Breaker Yard",
    location: 'Orbite de Pyro IV',
    faction: 'Salvageurs indépendants',
    factionBadge: 'badge-slate',
    security: 'Très faible',
    population: 'Faible',
    icon: Package,
    color: 'text-slate-400',
    border: 'border-slate-500/30',
    services: { medical: false, hangar: true, trade: true, repair: true, ammo: false, missions: false },
    description: 'Chantier de récupération indépendant. Achat de pièces et épaves de vaisseaux volés. Pratique pour écouler le butin sans questions.',
    tip: 'Vendez vos composants de vaisseaux volés ici sans risque. Prix légèrement inférieurs au marché mais discrétion totale.',
  },
  {
    id: 'klescher',
    name: 'Prison de Klescher (Fuite)',
    location: 'Aberdeen (lune de Hurston, Stanton)',
    faction: 'Occupation forcée / Prisonniers',
    factionBadge: 'badge-slate',
    security: 'Maximale (gardes armés)',
    population: 'Variable',
    icon: Lock,
    color: 'text-slate-400',
    border: 'border-slate-500/30',
    services: { medical: false, hangar: false, trade: false, repair: false, ammo: false, missions: false },
    description: 'Pas un refuge choisi, mais un lieu que tout outlaw connaîtra. L\'évasion est possible avec aide extérieure. À connaître si vous êtes capturé.',
    tip: 'Coordonnez avec un ami extérieur avant une mission risquée pour organiser votre extraction si vous êtes arrêté.',
  },
  {
    id: 'outpost-hidden',
    name: 'Avant-postes Abandonnés (Cachés)',
    location: 'Lunes isolées Stanton et Pyro',
    faction: 'Aucune',
    factionBadge: 'badge-slate',
    security: 'Variable',
    population: 'Aucune (fantômes)',
    icon: Eye,
    color: 'text-slate-500',
    border: 'border-slate-600/30',
    services: { medical: false, hangar: false, trade: false, repair: false, ammo: false, missions: false },
    description: 'Points de rendez-vous discrets ou de stockage temporaire. Aucun service mais totalement hors radar.',
    tip: 'Utilisez les avant-postes abandonnés comme point d\'attente entre missions. Déposez du cargo temporairement dans les boîtes locales.',
  },
  {
    id: 'nyx-levski-ext',
    name: 'Systeme Nyx (Avant-postes)',
    location: 'Système Nyx (hors UEE)',
    faction: 'Multiples factions indépendantes',
    factionBadge: 'badge-purple',
    security: 'Variable',
    population: 'Modérée',
    icon: Navigation,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    services: { medical: true, hangar: true, trade: true, repair: true, ammo: true, missions: true },
    description: 'Système en dehors de la juridiction UEE. Factions diverses, commerce illégal généralisé, missions variées pour outlaws.',
    tip: 'Accès via Jump Point Pyro. Idéal pour diversifier les routes de contrebande hors Stanton.',
  },
];

const OUTLAW_SURVIVAL_TIPS = [
  {
    icon: Clock,
    color: 'text-cyan-400',
    title: 'Gérer le CrimeStat élevé',
    text: 'Avec CS3+, évitez Stanton zones haute sécurité. Refugiez-vous à GrimHEX ou en Pyro. Le CS expire avec le temps si vous ne cumulez pas de nouvelles infractions. CS1-CS2 : attendez tranquillement à GrimHEX.',
  },
  {
    icon: Package,
    color: 'text-warning-400',
    title: 'Ravitaillement sans zone légale',
    text: 'GrimHEX, Levski et Checkmate offrent carburant, munitions et réparations. En Pyro, planifiez vos routes pour passer par une station outlaw toutes les 2-3 missions. Ne dépendez jamais d\'une seule base.',
  },
  {
    icon: Users,
    color: 'text-purple-400',
    title: 'Réseau de contacts',
    text: 'Rejoignez une organisation outlaw (Nine Tails sympathisants, Eclipsed Suns, etc.). Les contacts offrent intel sur les patrouilles, les cargaisons en transit et les points de vente discrets.',
  },
  {
    icon: Eye,
    color: 'text-danger-400',
    title: 'Contre les chasseurs de primes',
    text: 'CS4-CS5 : attendez-vous à être traqué. Voyagez en groupe, variez vos routes QT, n\'utilisez pas toujours le même vaisseau. Les chasseurs Elite traquent via les signaux EM — coupez les non-essentiels.',
  },
  {
    icon: DollarSign,
    color: 'text-gold-400',
    title: 'Économie Outlaw',
    text: 'Vendez votre butin dans les refuges outlaw. Prix inférieurs au marché légal (-15 à -30%) mais aucun risque d\'arrestation. Trouvez des acheteurs spécialisés via les missions boards de GrimHEX/Checkmate.',
  },
  {
    icon: Shield,
    color: 'text-success-400',
    title: 'Profil bas stratégique',
    text: 'Entre deux raids, adoptez un comportement neutre. Transportez du cargo légal, évitez les attaques gratuites. Un CrimeStat qui expire vaut plus qu\'une cible de plus à court terme.',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Onglet 3 : Contrebande
══════════════════════════════════════════════════════════════ */

const CONTRABAND_GOODS = [
  {
    name: 'WiDoW',
    type: 'Narcotique',
    risk: 'Très Élevé',
    riskBadge: 'badge-red',
    riskColor: 'text-danger-400',
    buyLocations: 'GrimHEX, Levski, avant-postes Nine Tails',
    sellLocations: 'Encore Ridge (Pyro), avant-postes Dusters',
    profitVsLegal: '+180%',
    profitColor: 'text-gold-400',
    detectScore: 9,
    notes: 'Le narcotique premium de Stanton. Détection quasi-certaine en scan standard.',
  },
  {
    name: 'Slam',
    type: 'Narcotique',
    risk: 'Très Élevé',
    riskBadge: 'badge-red',
    riskColor: 'text-danger-400',
    buyLocations: 'GrimHEX, avant-postes criminels',
    sellLocations: 'Levski, Checkmate (Pyro)',
    profitVsLegal: '+160%',
    profitColor: 'text-gold-400',
    detectScore: 9,
    notes: 'Drogue de rue très répandue. Volume important nécessaire pour profit maximal.',
  },
  {
    name: 'Maze',
    type: 'Narcotique',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    riskColor: 'text-danger-400',
    buyLocations: 'GrimHEX Night District, Levski sous-niveaux',
    sellLocations: 'Pyro Station 3, avant-postes Rough & Ready',
    profitVsLegal: '+140%',
    profitColor: 'text-gold-400',
    detectScore: 8,
    notes: 'Hallucinogène populaire. Légèrement moins détectable que WiDoW ou Slam.',
  },
  {
    name: 'Neon',
    type: 'Narcotique synthétique',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    riskColor: 'text-warning-400',
    buyLocations: 'GrimHEX, revendeurs ambulants Levski',
    sellLocations: 'Stations Pyro, Nyx outposts',
    profitVsLegal: '+95%',
    profitColor: 'text-success-400',
    detectScore: 6,
    notes: 'Stimulant léger. Moins risqué à transporter, marges correctes.',
  },
  {
    name: 'C-788 Gelatin',
    type: 'Explosif illégal',
    risk: 'Extrême',
    riskBadge: 'badge-purple',
    riskColor: 'text-purple-400',
    buyLocations: 'Contacts Nine Tails exclusivement',
    sellLocations: 'Acheteurs Xenothreat, factions militantes',
    profitVsLegal: '+300%',
    profitColor: 'text-gold-400',
    detectScore: 10,
    notes: 'Explosif militaire de contrebande. Profit exceptionnel mais risque maximal — CS5 direct si détecté.',
  },
  {
    name: 'Death Sticks',
    type: 'Narcotique',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    riskColor: 'text-warning-400',
    buyLocations: 'GrimHEX, Levski',
    sellLocations: 'Pyro stations, Nyx',
    profitVsLegal: '+70%',
    profitColor: 'text-success-400',
    detectScore: 5,
    notes: 'Facile à dissimuler en petites quantités. Bon pour débuter la contrebande.',
  },
  {
    name: 'Armes non déclarées (S1-S3)',
    type: 'Armement',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    riskColor: 'text-danger-400',
    buyLocations: 'Avant-postes militaires abandonnés, revendeurs GrimHEX',
    sellLocations: 'Factions rebelles, Checkmate (Pyro)',
    profitVsLegal: '+120%',
    profitColor: 'text-gold-400',
    detectScore: 7,
    notes: 'Transport d\'armes sans licence. Profit variable selon la qualité des armes.',
  },
  {
    name: 'Kopion Pelts',
    type: 'Faune protégée',
    risk: 'Faible',
    riskBadge: 'badge-green',
    riskColor: 'text-success-400',
    buyLocations: 'Chasseurs illégaux (Hurston wilderness)',
    sellLocations: 'Marchés noirs Lorville',
    profitVsLegal: '+40%',
    profitColor: 'text-slate-300',
    detectScore: 2,
    notes: 'Contrebande douce. Faible risque mais profit limité. Bon pour débuter.',
  },
  {
    name: 'Données volées (data drives)',
    type: 'Propriété intellectuelle',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    riskColor: 'text-warning-400',
    buyLocations: 'Missions de hacking (bunkers, relais)',
    sellLocations: 'Factions rivales des corporations, espions',
    profitVsLegal: '+200%',
    profitColor: 'text-gold-400',
    detectScore: 4,
    notes: 'Indétectable par scan standard. Très profitable si les bonnes données sont ciblées.',
  },
  {
    name: 'Carburant enrichi illégal',
    type: 'Ressource réglementée',
    risk: 'Faible',
    riskBadge: 'badge-green',
    riskColor: 'text-success-400',
    buyLocations: 'Raffineries pirates Pyro',
    sellLocations: 'Vaisseaux privés, avant-postes isolés',
    profitVsLegal: '+30%',
    profitColor: 'text-slate-300',
    detectScore: 3,
    notes: 'Détection difficile. Volume nécessaire élevé mais risque faible. Transit discret.',
  },
  {
    name: 'Composants militaires volés',
    type: 'Matériel militaire',
    risk: 'Très Élevé',
    riskBadge: 'badge-red',
    riskColor: 'text-danger-400',
    buyLocations: 'Épaves militaires, vaisseaux vaincus',
    sellLocations: 'Factions armées Pyro, revendeurs GrimHEX',
    profitVsLegal: '+250%',
    profitColor: 'text-gold-400',
    detectScore: 9,
    notes: 'Composants de vaisseaux militaires. Signature EM détectable. Très lucratif si bien conduit.',
  },
  {
    name: 'Médicaments non homologués',
    type: 'Pharmacologie',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    riskColor: 'text-warning-400',
    buyLocations: 'Labo Nine Tails (missions spéciales)',
    sellLocations: 'Avant-postes isolés, camps Pyro',
    profitVsLegal: '+80%',
    profitColor: 'text-success-400',
    detectScore: 5,
    notes: 'Médicaments de combat non déclarés. Usage personnel ou revente aux combattants.',
  },
];

const SMUGGLING_SHIPS = [
  {
    ship: 'MISC Mercury Star Runner',
    cargo: '96 SCU',
    hiddenCargo: '+ 12 SCU cachés',
    hiddenDesc: 'Soutes secrètes dans les cloisons latérales — non détectables lors d\'un scan standard',
    badge: 'badge-gold',
    emSignature: 'Modérée',
    tip: 'Le meilleur vaisseau de contrebande de Stanton. Soutes cachées + vitesse QT élevée.',
  },
  {
    ship: 'Drake Cutlass Black',
    cargo: '46 SCU',
    hiddenCargo: '~8 SCU dissimulables',
    hiddenDesc: 'Compartiments sous le plancher de chargement, accessibles par panneau de maintenance',
    badge: 'badge-cyan',
    emSignature: 'Élevée',
    tip: 'Polyvalent. Bon compromis entre capacité de combat et discrétion si moteurs réduits.',
  },
  {
    ship: 'MISC Freelancer MAX',
    cargo: '120 SCU',
    hiddenCargo: '~15 SCU dans les cloisons',
    hiddenDesc: 'Panneaux amovibles dans la soute principale, difficiles à repérer sans inspection physique',
    badge: 'badge-yellow',
    emSignature: 'Faible',
    tip: 'Grande capacité + faible signature EM. Idéal pour grosses livraisons discrètes.',
  },
  {
    ship: 'Origin 600i',
    cargo: '40 SCU (explorateur)',
    hiddenCargo: '~20 SCU fond faux',
    hiddenDesc: 'Faux fond luxueux dissimulant un espace de stockage entier derrière les cabines',
    badge: 'badge-purple',
    emSignature: 'Faible',
    tip: 'L\'apparence luxueuse trompe les douaniers moins rigoureux. Signature UEE basse.',
  },
  {
    ship: 'Aegis Avenger Titan',
    cargo: '8 SCU',
    hiddenCargo: 'Petites quantités (2-3 SCU)',
    hiddenDesc: 'Espace technique sous le cockpit, accessible en mode maintenance',
    badge: 'badge-slate',
    emSignature: 'Très faible',
    tip: 'Pour les débuts. Discret, rapide. Idéal pour petites quantités de drogues ou données.',
  },
];

const SMUGGLING_ROUTES = [
  {
    id: 1,
    name: 'Route WiDoW : GrimHEX → Encore Ridge',
    goods: 'WiDoW (narcotique premium)',
    buy: 'GrimHEX (Yela, Stanton)',
    sell: 'Encore Ridge (Pyro IV)',
    buyPrice: '~850 aUEC/unité',
    sellPrice: '~2 400 aUEC/unité',
    profitUnit: '+1 550 aUEC/unité',
    profitColor: 'text-gold-400',
    risk: 'Très Élevé',
    riskBadge: 'badge-red',
    distance: 'Stanton → Pyro (JP)',
    notes: 'Route la plus rentable. Traversée du JP Stanton-Pyro = risque d\'embuscade à l\'entrée de Pyro.',
    ship: 'Mercury Star Runner recommandé',
  },
  {
    id: 2,
    name: 'Route Armes : Avant-poste NT → Checkmate',
    goods: 'Armes non déclarées',
    buy: 'Avant-postes Nine Tails (Stanton)',
    sell: 'Checkmate Station (Pyro IV)',
    buyPrice: '~1 200 aUEC/unité',
    sellPrice: '~2 900 aUEC/unité',
    profitUnit: '+1 700 aUEC/unité',
    profitColor: 'text-gold-400',
    risk: 'Élevé',
    riskBadge: 'badge-red',
    distance: 'Stanton → Pyro (JP)',
    notes: 'Nécessite réputation Nine Tails pour l\'achat. Volume limité disponible par session.',
    ship: 'Freelancer MAX ou Cutlass Black',
  },
  {
    id: 3,
    name: 'Route Neon : Levski → Ruin Station',
    goods: 'Neon + Death Sticks',
    buy: 'Levski (Delamar, Stanton)',
    sell: 'Ruin Station (Pyro III)',
    buyPrice: '~400 aUEC/unité',
    sellPrice: '~780 aUEC/unité',
    profitUnit: '+380 aUEC/unité',
    profitColor: 'text-success-400',
    risk: 'Moyen',
    riskBadge: 'badge-yellow',
    distance: 'Stanton → Pyro (JP)',
    notes: 'Meileur ratio risque/profit pour débutants. Faible détectabilité, bonne marge.',
    ship: 'Cutlass Black ou Avenger Titan',
  },
  {
    id: 4,
    name: 'Route Données : Bunkers → Factions',
    goods: 'Data drives volés',
    buy: 'Missions de hacking (bunkers Stanton)',
    sell: 'Levski ou contacts faction (variable)',
    buyPrice: 'Coût mission ~0 (loot)',
    sellPrice: '~50 000 aUEC/drive',
    profitUnit: '+50 000 aUEC/drive',
    profitColor: 'text-gold-400',
    risk: 'Moyen (scan minimal)',
    riskBadge: 'badge-yellow',
    distance: 'Local Stanton',
    notes: 'Données ne déclenchent pas les scanners douaniers. Très discret, profit excellent par unité.',
    ship: 'N\'importe quel vaisseau discret',
  },
  {
    id: 5,
    name: 'Route Composants : Épaves → GrimHEX',
    goods: 'Composants militaires récupérés',
    buy: 'Épaves de combat (combat zones)',
    sell: 'GrimHEX (marché noir)',
    buyPrice: 'Coût récupération (temps)',
    sellPrice: '~15 000 – 80 000 aUEC/composant',
    profitUnit: '+15K–80K aUEC/composant',
    profitColor: 'text-gold-400',
    risk: 'Variable (selon composant)',
    riskBadge: 'badge-yellow',
    distance: 'Local Stanton + QT court',
    notes: 'Requiert vaisseau de salvage ou accès aux combat zones. Profit très variable selon le butin.',
    ship: 'Vulture, Reclaimer, ou tout vaisseau utilitaire',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Onglet 4 : Défense contre la Piraterie
══════════════════════════════════════════════════════════════ */

const PIRACY_SIGNS = [
  'Un vaisseau de combat inconnu vous "tail" (suit) à moins de 5 km depuis plus de 2 minutes',
  'Votre trajet QT est interrompu soudainement sans raison apparente',
  'Vous recevez des hails répétés d\'un vaisseau non identifié en zone peu sécurisée',
  'Plusieurs vaisseaux se positionnent en formation autour de vous',
  'Un vaisseau coupe vos axes de fuite QT en se positionnant devant vos destinations',
  'Votre signal EM est soudainement ciblé par plusieurs radars actifs simultanément',
  'Communications bizarres ou trop "aimables" d\'inconnus en zone isolée',
];

const COUNTERMEASURES = [
  {
    icon: Zap,
    color: 'text-cyan-400',
    title: 'Re-jump immédiat',
    text: 'Si vous êtes sorti de QT, re-jump immédiatement vers votre destination ou vers la zone de sécurité la plus proche. Ne restez jamais stationnaire plus de 5 secondes en zone hostile.',
  },
  {
    icon: Shield,
    color: 'text-success-400',
    title: 'Boucliers et contre-mesures',
    text: 'Activez boucliers à 100% et déployez des contre-mesures (chaff/flares) dès détection. Les missiles IA peuvent être bloqués par des contre-mesures bien timées.',
  },
  {
    icon: Navigation,
    color: 'text-warning-400',
    title: 'Vitesse maximale et manœuvre',
    text: 'En afterburner, gardez votre vitesse SCM maximale et évitez les trajectoires droites. Les pirates comptent sur votre immobilité — bougez constamment.',
  },
  {
    icon: Radio,
    color: 'text-purple-400',
    title: 'Appel de détresse',
    text: 'Utilisez les comms in-game (F11) pour appeler une escorte ou signaler la position du pirate. Certains groupes patrouillent et répondent aux appels de détresse.',
  },
  {
    icon: Target,
    color: 'text-danger-400',
    title: 'Zone de sécurité la plus proche',
    text: 'En Stanton, gardez toujours une route QT vers une zone haute sécurité prête (Lorville, New Babbage, Area 18, Orison). Les pirates hésitent à vous suivre en zone UEE.',
  },
  {
    icon: Eye,
    color: 'text-gold-400',
    title: 'Profil bas préventif',
    text: 'Réduisez votre signature EM (diminuez la puissance des armes, radiateurs ouverts). Un vaisseau peu visible sur radar est moins ciblé. Évitez les routes trop prévisibles.',
  },
];

const ANTI_PIRACY_SHIPS = [
  {
    ship: 'Aegis Avenger Titan',
    role: 'Cargo léger discret',
    strength: 'Vitesse, faible signature EM',
    weakness: 'Cargo limité (8 SCU)',
    badge: 'badge-green',
    tip: 'Difficile à intercepter grâce à sa vitesse. Idéal pour petits cargos précieux.',
  },
  {
    ship: 'Anvil Carrack',
    role: 'Explorateur / cargo long-range',
    strength: 'Autonomie QT, réservoir énorme',
    weakness: 'Lent en combat, coûteux',
    badge: 'badge-cyan',
    tip: 'Routes alternatives hors des axes standards. Quasi impossible à traquer en mode silence.',
  },
  {
    ship: 'Drake Cutlass Black',
    role: 'Cargo polyvalent défensif',
    strength: 'Armement suffisant pour repousser solo',
    weakness: 'Signature EM élevée',
    badge: 'badge-yellow',
    tip: 'Bon équilibre cargo/combat. Peut engager les pirates solo ou fuir en mode agile.',
  },
  {
    ship: 'Freelancer DUR',
    role: 'Cargo long-range',
    strength: 'QT drives supplémentaires, discret',
    weakness: 'Combat limité',
    badge: 'badge-yellow',
    tip: 'Optimal pour éviter les zones de piraterie grâce aux re-jumps fréquents.',
  },
  {
    ship: 'Aegis Hammerhead (escorte)',
    role: 'Escorteur / vaisseau anti-pirate',
    strength: 'Énorme puissance de feu, 6 tourelles',
    weakness: 'Requiert équipage complet',
    badge: 'badge-red',
    tip: 'Dissuasion maximale. Très peu de pirates attaqueront un convoi sous escorte Hammerhead.',
  },
  {
    ship: 'MISC Hull C/D (escorté)',
    role: 'Transport massive de cargo',
    strength: 'Capacité énorme (2 000+ SCU)',
    weakness: 'Très lent, cible évidente',
    badge: 'badge-purple',
    tip: 'Ne jamais voler solo. Toujours escorte minimale de 2 chasseurs pour les Hull C/D.',
  },
];

const INTERCEPTED_STEPS = [
  { step: 'Restez calme', detail: 'Paniquer mène à de mauvaises décisions. Évaluez : le pirate est seul ou en groupe ? Votre cargo vaut-il le risque d\'un combat ?' },
  { step: 'Répondez aux hails', detail: 'Répondre montre que vous êtes humain et ouvert à la négociation. Gagnez du temps pour évaluer la situation et préparer votre fuite ou défense.' },
  { step: 'Négociez si possible', detail: 'Si le pirate propose de laisser partir en échange de cargo, calculez : le cargo vaut-il plus que votre temps de respawn + pertes d\'équipement ?' },
  { step: 'Préparez la fuite', detail: 'Pendant la négociation, préparez votre QT vers la zone de sécurité la plus proche. Dès que la conversation se termine, partez immédiatement.' },
  { step: 'Documentez le pirate', detail: 'Notez le callsign/vaisseau. Signalez-le aux guildes anti-pirate. Certaines orgs paient pour l\'intel sur les pirates actifs.' },
  { step: 'Si combat inévitable', detail: 'Engagez à courte portée pour réduire l\'avantage missiles. Ciblez les systèmes de propulsion ennemis (moteurs) pour l\'immobiliser.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANTS HELPERS
══════════════════════════════════════════════════════════════ */

function SectionAnchor({ id }) {
  return <div id={id} className="scroll-mt-20" />;
}

function TipBox({ icon: Icon, color, title, text }) {
  return (
    <div className="card p-4 flex gap-3">
      <div className={clsx('flex-shrink-0 mt-0.5', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-slate-200 text-sm mb-1">{title}</div>
        <div className="text-xs text-slate-400 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}

function DifficultyDots({ value, max = 5, color = 'bg-danger-400' }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={clsx('w-2 h-2 rounded-full', i < value ? color : 'bg-space-500')}
        />
      ))}
    </div>
  );
}

function TacticCard({ tactic }) {
  const [open, setOpen] = useState(false);
  const Icon = tactic.icon;
  return (
    <div className={clsx('card border', tactic.border)}>
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-space-700/80', tactic.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">{tactic.title}</div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Difficulté :</span>
                <DifficultyDots value={tactic.difficulty} color="bg-warning-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Profit :</span>
                <DifficultyDots value={tactic.profitability} color="bg-success-400" />
              </div>
              <span className={`badge ${tactic.crimestatBadge} text-xs`}>CS: {tactic.crimestatRisk}</span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Vaisseaux recommandés</div>
              <ul className="space-y-1">
                {tactic.ships.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Rocket className="w-3 h-3 text-cyan-400 flex-shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Zones idéales</div>
              <ul className="space-y-1">
                {tactic.idealZones.map((z, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gold-400 flex-shrink-0" /> {z}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Timing & Technique</div>
            <p className="text-sm text-slate-300">{tactic.timing}</p>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Contre-mesures du défenseur</div>
            <div className="flex flex-wrap gap-1.5">
              {tactic.counters.map((c, i) => (
                <span key={i} className="badge badge-slate text-xs">{c}</span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-700/60 border border-space-400/20 flex gap-2">
            <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 italic">{tactic.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BaseCard({ base }) {
  const [open, setOpen] = useState(false);
  const Icon = base.icon;
  const serviceIcons = [
    { key: 'medical', label: 'Médical', icon: '🏥' },
    { key: 'hangar', label: 'Hangar', icon: '🚀' },
    { key: 'trade', label: 'Commerce', icon: '💱' },
    { key: 'repair', label: 'Réparation', icon: '🔧' },
    { key: 'ammo', label: 'Munitions', icon: '🔫' },
    { key: 'missions', label: 'Missions', icon: '📋' },
  ];
  return (
    <div className={clsx('card border', base.border)}>
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-space-700/80', base.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">{base.name}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`badge ${base.factionBadge} text-xs`}>{base.faction}</span>
              <span className="text-xs text-slate-500">{base.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-1">
            {serviceIcons.filter(s => base.services[s.key]).slice(0, 3).map(s => (
              <span key={s.key} className="text-xs" title={s.label}>{s.icon}</span>
            ))}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-space-400/20 pt-4 space-y-4 animate-fade-in">
          <p className="text-sm text-slate-300">{base.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Services disponibles</div>
              <div className="flex flex-wrap gap-1.5">
                {serviceIcons.map(s => (
                  <span
                    key={s.key}
                    className={clsx('badge text-xs', base.services[s.key] ? 'badge-green' : 'badge-slate opacity-40')}
                  >
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Sécurité interne</div>
              <p className="text-sm text-slate-300">{base.security}</p>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Population</div>
              <p className="text-sm text-slate-300">{base.population}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-700/60 border border-space-400/20 flex gap-2">
            <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 italic">{base.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteCard({ route }) {
  const [qty, setQty] = useState(10);
  const profitPerUnit = parseInt(route.profitUnit.replace(/[^0-9]/g, '')) || 0;
  const totalProfit = profitPerUnit * qty;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="font-bold text-slate-200 text-sm">{route.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{route.goods}</div>
        </div>
        <span className={`badge ${route.riskBadge} text-xs flex-shrink-0`}>{route.risk}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <div className="text-slate-500 mb-0.5">Achat</div>
          <div className="text-slate-300">{route.buy}</div>
          <div className="text-success-400 font-mono mt-0.5">{route.buyPrice}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">Vente</div>
          <div className="text-slate-300">{route.sell}</div>
          <div className="text-gold-400 font-mono mt-0.5">{route.sellPrice}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">Profit/unité</div>
          <div className={clsx('font-mono font-bold', route.profitColor)}>{route.profitUnit}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">Distance</div>
          <div className="text-slate-300">{route.distance}</div>
        </div>
      </div>
      {/* Mini calculateur */}
      <div className="p-3 rounded-lg bg-space-700/50 border border-space-400/20">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-slate-400">Calculateur rapide :</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input w-20 text-xs h-7 px-2"
              value={qty}
              min={1}
              max={9999}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <span className="text-xs text-slate-400">unités =</span>
            <span className={clsx('font-mono text-sm font-bold', route.profitColor)}>
              {totalProfit > 0 ? `~${totalProfit.toLocaleString('fr-FR')} aUEC` : '—'}
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-2 italic">{route.notes}</div>
      </div>
      <div className="text-xs text-slate-500">Vaisseau conseillé : <span className="text-slate-300">{route.ship}</span></div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'piraterie', label: 'Piraterie Spatiale', icon: Skull },
  { id: 'refuges', label: 'Bases & Refuges', icon: Anchor },
  { id: 'contrebande', label: 'Contrebande', icon: Package },
  { id: 'defense', label: 'Défense', icon: Shield },
];

const CS_BADGE_STYLES = {
  CS1: 'badge-green',
  CS2: 'badge-yellow',
  CS3: 'badge-red',
  CS4: 'badge-red',
  CS5: 'badge-purple',
};

export default function PiracyGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('piraterie');
  const [expandedType, setExpandedType] = useState(null);
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const match = (/** @type {string[]} */ ...fields) => !q || fields.some(f => f && f.toLowerCase().includes(q));

  // Tab 1 filters
  const filteredPiracyTypes = PIRACY_TYPES.filter(t => match(t.name, t.description, t.method, t.legalStatus, t.loot));
  const filteredCrimeTable = CRIME_STAT_TABLE.filter(r => match(r.action, r.cs, r.notes));
  const filteredTactics = INTERDICTION_TACTICS.filter(t => match(t.title, t.crimestatRisk, t.timing, t.tip, ...t.ships, ...t.idealZones));
  const filteredScripts = COMMUNICATION_SCRIPTS.filter(s => match(s.scenario, s.opener, s.tone, s.outcome));
  const filteredPiracyZones = PIRACY_ZONES.filter(z => match(z.zone, z.security, z.cargos, z.advocacy, z.tip));
  // Tab 2 filters
  const filteredBases = OUTLAW_BASES.filter(b => match(b.name, b.location, b.faction, b.description, b.tip));
  const filteredSurvivalTips = OUTLAW_SURVIVAL_TIPS.filter(t => match(t.title, t.text));
  // Tab 3 filters
  const filteredGoods = CONTRABAND_GOODS.filter(g => match(g.name, g.type, g.buyLocations, g.sellLocations, g.notes));
  const filteredSmugShips = SMUGGLING_SHIPS.filter(s => match(s.ship, s.hiddenDesc, s.tip));
  const filteredRoutes = SMUGGLING_ROUTES.filter(r => match(r.name, r.goods, r.buy, r.sell, r.notes, r.ship));
  // Tab 4 filters
  const filteredSigns = PIRACY_SIGNS.filter(s => match(s));
  const filteredCountermeasures = COUNTERMEASURES.filter(c => match(c.title, c.text));
  const filteredAntiShips = ANTI_PIRACY_SHIPS.filter(s => match(s.ship, s.role, s.strength, s.weakness, s.tip));
  const filteredSteps = INTERCEPTED_STEPS.filter(s => match(s.step, s.detail));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── HEADER ── */}
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="page-title flex items-center gap-2">
            <Skull className="w-7 h-7 text-danger-400" />
            Piraterie &amp; Gameplay Outlaw
          </h1>
          <span className="badge badge-red">Alpha 4.6</span>
          <span className="badge badge-purple">Outlaw</span>
        </div>
        <p className="page-subtitle mt-1">
          Guide complet de la piraterie spatiale — tactiques d'interdiction, refuges outlaw, contrebande rentable et défense contre les pirates
        </p>
      </div>

      {/* ── STATS RAPIDES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tactiques piraterie', value: '4', color: 'text-danger-400', icon: Skull },
          { label: 'Refuges outlaw', value: '10+', color: 'text-purple-400', icon: Anchor },
          { label: 'Marchandises illégales', value: '12', color: 'text-warning-400', icon: Package },
          { label: 'Routes contrebande', value: '5', color: 'text-gold-400', icon: TrendingUp },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={clsx('flex-shrink-0', s.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className={clsx('text-xl font-bold font-display', s.color)}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AVERTISSEMENT ── */}
      <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/30 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-300">
          <strong className="text-danger-400">Avertissement :</strong> La piraterie et la contrebande sont des activités illégales dans Star Citizen générant du CrimeStat. Ce guide est informatif et couvre toutes les perspectives — y compris la défense contre les pirates. Jouez en respectant les règles de la communauté et les conditions d'utilisation de CIG.
        </div>
      </div>

      {/* ── ONGLETS ── */}
      <div className="card p-1.5 flex flex-wrap gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-danger-500/20 text-danger-300 border border-danger-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-600/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une tactique, une base, une marchandise, un vaisseau..."
          className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
        {search && (<button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><X className="w-4 h-4" /></button>)}
      </div>

      {/* ══════════════════════════════════════════════════════
          ONGLET 1 : PIRATERIE SPATIALE
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'piraterie' && (
        <div className="space-y-8">

          {/* Section : Comprendre la Piraterie */}
          <SectionAnchor id="comprendre" />
          <div className="card-glow p-6">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-cyan-400" />
              Comprendre la Piraterie dans Star Citizen
            </h2>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed mb-6">
              <p>
                La piraterie est l'un des gameplays les plus riches et dangereux de Star Citizen. Elle englobe toutes les activités criminelles liées à l'attaque ou l'exploitation de vaisseaux et de cargaisons appartenant à d'autres joueurs ou NPC.
              </p>
              <p>
                Contrairement aux autres MMO, SC punit la piraterie via le <strong className="text-danger-400">CrimeStat</strong> — un niveau de criminalité qui attire chasseurs de primes et forces de sécurité sur vous. La clé est de comprendre <strong className="text-gold-400">où, quand et comment</strong> pratiquer la piraterie pour maximiser le profit tout en minimisant les risques.
              </p>
              <p>
                La règle fondamentale : <strong className="text-cyan-400">capturer vaut toujours plus que détruire</strong>. Un vaisseau détruit perd sa cargaison dans l'espace et génère plus de CrimeStat qu'une reddition négociée.
              </p>
            </div>

            {/* Types de piraterie - cartes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPiracyTypes.map(type => {
                const Icon = type.icon;
                const isOpen = expandedType === type.id;
                return (
                  <div key={type.id} className={clsx('card border transition-all', type.border)}>
                    <button
                      className="w-full text-left p-4"
                      onClick={() => setExpandedType(isOpen ? null : type.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={clsx('flex items-center gap-2', type.color)}>
                          <Icon className="w-4 h-4" />
                          <span className="font-bold text-sm text-slate-200">{type.name}</span>
                        </div>
                        {isOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                      </div>
                      <p className="text-xs text-slate-400">{type.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Diff :</span>
                          <DifficultyDots value={type.difficulty} color="bg-warning-400" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Profit :</span>
                          <DifficultyDots value={type.profitability} color="bg-success-400" />
                        </div>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-space-400/20 pt-3 space-y-2 animate-fade-in">
                        <div className="text-xs"><span className="text-slate-500">Méthode : </span><span className="text-slate-300">{type.method}</span></div>
                        <div className="text-xs"><span className="text-slate-500">Statut légal : </span><span className="text-danger-400">{type.legalStatus}</span></div>
                        <div className="text-xs"><span className="text-slate-500">Loot : </span><span className="text-gold-400">{type.loot}</span></div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Risque :</span>
                          <span className={`badge ${type.riskBadge} text-xs`}>{type.risk}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section : Tableau CrimeStat */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-danger-400" />
              CrimeStat Généré par les Actions de Piraterie
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Action commise</th>
                      <th>Niveau CS</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCrimeTable.map((row, i) => (
                      <tr key={i}>
                        <td className="text-slate-200 font-medium">{row.action}</td>
                        <td><span className={`badge ${CS_BADGE_STYLES[row.cs]}`}>{row.cs}</span></td>
                        <td className="text-xs text-slate-400">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-space-700/40 border border-gold-500/20 flex gap-2">
              <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                <strong className="text-gold-400">Loot vs Destruction :</strong> Capturer un vaisseau et récupérer son cargo manuellement génère un CS inférieur à sa destruction. De plus, vous récupérez 100% du cargo intact. Négocier une reddition est toujours plus rentable que de détruire.
              </p>
            </div>
          </div>

          {/* Section : Tactiques d'Interdiction */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-warning-400" />
              Tactiques d'Interdiction Détaillées
            </h2>
            <p className="text-sm text-slate-400 mb-4">Cliquez sur une tactique pour afficher les détails, vaisseaux recommandés et contre-mesures.</p>
            <div className="space-y-3">
              {filteredTactics.map(tactic => (
                <TacticCard key={tactic.id} tactic={tactic} />
              ))}
            </div>
          </div>

          {/* Section : Communication */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-cyan-400" />
              Communication avec la Cible
            </h2>
            <p className="text-sm text-slate-400 mb-4">Scripts de communication recommandés selon le scénario. Une communication bien menée peut éviter un combat coûteux.</p>
            <div className="space-y-3">
              {filteredScripts.map((script, i) => (
                <div key={i} className="card p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-bold text-slate-200 text-sm">{script.scenario}</div>
                    <span className="badge badge-slate text-xs">{script.tone}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-space-700/60 border-l-2 border-cyan-500">
                    <p className="text-xs text-cyan-300 italic">{script.opener}</p>
                  </div>
                  {script.followup && (
                    <p className="text-xs text-slate-400"><strong className="text-slate-300">Suivi :</strong> {script.followup}</p>
                  )}
                  <p className="text-xs text-success-400"><strong>Résultat attendu :</strong> {script.outcome}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section : Zones favorables */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-gold-400" />
              Zones Favorables à la Piraterie
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Sécurité</th>
                      <th>Cargos attendus</th>
                      <th>Risque Advocacy</th>
                      <th>Conseil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPiracyZones.map((zone, i) => (
                      <tr key={i}>
                        <td className="font-medium text-slate-200">{zone.zone}</td>
                        <td><span className={`badge ${zone.secBadge}`}>{zone.security}</span></td>
                        <td className="text-xs text-slate-300">{zone.cargos}</td>
                        <td className="text-xs text-slate-400">{zone.advocacy}</td>
                        <td className="text-xs text-slate-400 italic">{zone.tip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ONGLET 2 : BASES & REFUGES OUTLAW
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'refuges' && (
        <div className="space-y-8">

          {/* Section : Refuges connus */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-2">
              <Anchor className="w-5 h-5 text-purple-400" />
              Refuges &amp; Bases Outlaw Répertoriés
            </h2>
            <p className="text-sm text-slate-400 mb-4">Cliquez sur une base pour afficher les services disponibles, la faction, et les conseils pratiques.</p>
            <div className="space-y-3">
              {filteredBases.map(base => (
                <BaseCard key={base.id} base={base} />
              ))}
            </div>
          </div>

          {/* Section : Services dans les refuges */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-gold-400" />
              Services dans les Refuges Outlaw
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Rocket,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10 border-cyan-500/30',
                  title: 'Réparation & Restock',
                  desc: 'Les refuges outlaw offrent réparation de vaisseaux, rechargement de missiles et munitions sans déclencher de réclamation d\'assurance. Aucun signalement aux autorités UEE.',
                  stations: ['GrimHEX', 'Levski', 'Checkmate (Pyro)', 'Ruin Station'],
                },
                {
                  icon: DollarSign,
                  color: 'text-gold-400',
                  bg: 'bg-gold-500/10 border-gold-500/30',
                  title: 'Commerce Illégal',
                  desc: 'Vente et achat de marchandises illégales (drogues, armes, composants volés) sans scan douanier. Prix inférieurs au marché légal mais transaction sécurisée.',
                  stations: ['GrimHEX (marché noir)', 'Levski', 'Checkmate', 'Brio\'s Breaker Yard'],
                },
                {
                  icon: Package,
                  color: 'text-warning-400',
                  bg: 'bg-warning-500/10 border-warning-500/30',
                  title: 'Missions de Contrebande',
                  desc: 'Les mission boards des refuges proposent des missions de transport illégal, escort de convois pirates, et récupération de cargaisons volées. Paiement en crypto ou aUEC non traçable.',
                  stations: ['GrimHEX mission board', 'Levski missions', 'Avant-postes Nine Tails'],
                },
                {
                  icon: Eye,
                  color: 'text-danger-400',
                  bg: 'bg-danger-500/10 border-danger-500/30',
                  title: 'Renseignement sur Patrouilles',
                  desc: 'Les contacts locaux dans les refuges peuvent fournir l\'intel sur les patrouilles Advocacy actives, les routes commerciales récentes et les cargaisons de valeur en transit.',
                  stations: ['GrimHEX contacts', 'Levski info vendors', 'Checkmate intel board'],
                },
                {
                  icon: Shield,
                  color: 'text-success-400',
                  bg: 'bg-success-500/10 border-success-500/30',
                  title: 'Protection & Neutralité',
                  desc: 'Dans les refuges outlaw, les joueurs bénéficient de zones de neutralité temporaire. Attaquer un joueur dans GrimHEX vous rend hostile à la faction locale.',
                  stations: ['GrimHEX (neutralité relative)', 'Levski (milice locale)'],
                },
                {
                  icon: Users,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10 border-purple-500/30',
                  title: 'Recrutement & Orgs',
                  desc: 'Les refuges sont des points de rencontre pour les organisations outlaws. Rejoignez des guildes de pirates, recrutez des co-pirates ou trouvez des acheteurs pour votre butin.',
                  stations: ['GrimHEX (hub principal)', 'Levski (organisations rebelles)', 'Checkmate (factions Pyro)'],
                },
              ].map((service, i) => {
                const Icon = service.icon;
                return (
                  <div key={i} className={clsx('card border p-4', service.bg)}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={clsx('w-4 h-4', service.color)} />
                      <span className="font-bold text-slate-200 text-sm">{service.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{service.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {service.stations.map((s, j) => (
                        <span key={j} className="badge badge-slate text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section : Vivre Hors-la-Loi */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Skull className="w-5 h-5 text-danger-400" />
              Vivre Hors-la-Loi
            </h2>
            <p className="text-sm text-slate-400 mb-4">Conseils pratiques pour survivre et prospérer avec un CrimeStat élevé.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSurvivalTips.map((tip, i) => (
                <TipBox key={i} {...tip} />
              ))}
            </div>
            {/* Comparaison Stanton vs Pyro */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-4 border border-warning-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-warning-400" />
                  <span className="font-bold text-slate-200">Stanton — Piraterie Risquée</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-danger-400 mt-0.5 flex-shrink-0" /> CrimeStat UEE actif — chasseurs de primes</li>
                  <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-danger-400 mt-0.5 flex-shrink-0" /> Zones haute sécurité = mort quasi-certaine CS2+</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Proies plus riches (routes commerciales Stanton)</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> GrimHEX/Levski accessibles comme refuges</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Purge CS possible via Kareah</li>
                </ul>
              </div>
              <div className="card p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Skull className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-slate-200">Pyro — Paradis des Pirates</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Aucune juridiction UEE — CrimeStat non appliqué</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Checkmate + Ruin Station services complets</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Commerce illégal généralisé, aucun risque douanier</li>
                  <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-danger-400 mt-0.5 flex-shrink-0" /> Factions rivales hostiles (Dusters, Nine Tails, etc.)</li>
                  <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-danger-400 mt-0.5 flex-shrink-0" /> Tout le monde est un ennemi potentiel — PvP constant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ONGLET 3 : CONTREBANDE
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'contrebande' && (
        <div className="space-y-8">

          {/* Section : Types de contrebande */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-warning-400" />
              Marchandises Illégales &amp; Contrebande
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Marchandise</th>
                      <th>Type</th>
                      <th>Risque détection</th>
                      <th>Profit vs légal</th>
                      <th>Achat</th>
                      <th>Vente</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGoods.map((good, i) => (
                      <tr key={i}>
                        <td className="font-bold text-slate-200">{good.name}</td>
                        <td className="text-xs text-slate-400">{good.type}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${good.riskBadge} text-xs`}>{good.risk}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 10 }).map((_, j) => (
                                <div key={j} className={clsx('w-1.5 h-3 rounded-sm', j < good.detectScore ? 'bg-danger-400' : 'bg-space-500')} />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className={clsx('font-mono font-bold text-sm', good.profitColor)}>{good.profitVsLegal}</td>
                        <td className="text-xs text-slate-400">{good.buyLocations}</td>
                        <td className="text-xs text-slate-400">{good.sellLocations}</td>
                        <td className="text-xs text-slate-500 italic">{good.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section : Mécaniques de Détection */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-cyan-400" />
              Mécaniques de Détection Douanière
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Crosshair className="w-4 h-4 text-danger-400" />
                  <span className="font-bold text-slate-200 text-sm">Comment fonctionne le scan douanier</span>
                </div>
                <p className="text-xs text-slate-400">Les douaniers (NPC ou joueurs) émettent un scan actif sur votre vaisseau. Ce scan compare votre manifeste de cargo déclaré à ce que le scanner détecte dans vos soutes.</p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-warning-400 mt-0.5 flex-shrink-0" /> Scan standard : détecte cargaisons non masquées</li>
                  <li className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-danger-400 mt-0.5 flex-shrink-0" /> Scan approfondi : inspecte les soutes cachées</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Soutes cachées : non visibles en scan standard</li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-success-400 mt-0.5 flex-shrink-0" /> Réduire signature EM = scan moins efficace</li>
                </ul>
              </div>
              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-success-400" />
                  <span className="font-bold text-slate-200 text-sm">Passer un scan avec succès</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" /><span><strong className="text-cyan-400">Signature EM basse :</strong> Éteignez les armes, réduisez les boucliers, coupez les non-essentiels</span></li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" /><span><strong className="text-cyan-400">Vitesse réduite :</strong> Approchez lentement des checkpoints douaniers</span></li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" /><span><strong className="text-cyan-400">Répondre aux hails :</strong> Ne pas répondre = scan obligatoire renforcé</span></li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" /><span><strong className="text-cyan-400">Soutes cachées :</strong> Certains vaisseaux ont des espaces non déclarés</span></li>
                  <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" /><span><strong className="text-cyan-400">Éviter routes surveillées :</strong> Contournez les checkpoints connus</span></li>
                </ul>
              </div>
            </div>

            {/* Vaisseaux avec soutes cachées */}
            <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-gold-400" />
              Vaisseaux avec Compartiments de Contrebande
            </h3>
            <div className="space-y-3">
              {filteredSmugShips.map((ship, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Rocket className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-200">{ship.ship}</div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-slate-400">Cargo déclaré : <span className="text-slate-300 font-mono">{ship.cargo}</span></span>
                          <span className={`badge ${ship.badge} text-xs`}>{ship.hiddenCargo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">Signature EM : <span className="text-slate-300">{ship.emSignature}</span></div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-lg bg-space-700/50 border border-space-400/20">
                    <p className="text-xs text-slate-400"><strong className="text-gold-400">Soute cachée :</strong> {ship.hiddenDesc}</p>
                  </div>
                  <p className="text-xs text-cyan-400 mt-2 italic">{ship.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section : Routes de Contrebande */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-gold-400" />
              Routes de Contrebande Rentables
            </h2>
            <p className="text-sm text-slate-400 mb-4">Chaque route inclut un calculateur de profit rapide. Entrez votre quantité pour estimer le gain total.</p>
            <div className="space-y-4">
              {filteredRoutes.map(route => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
            <div className="mt-4 p-4 rounded-lg bg-space-700/40 border border-gold-500/20 flex gap-2">
              <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                <strong className="text-gold-400">Conseil général :</strong> Les données volées (route 4) offrent le meilleur ratio risque/profit pour débutants. Presque indétectables, très rentables par unité. Pour les vétérans, la route WiDoW Stanton→Pyro reste la plus lucrative mais aussi la plus dangereuse.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ONGLET 4 : DÉFENSE CONTRE LA PIRATERIE
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'defense' && (
        <div className="space-y-8">

          {/* Section : Signes d'alerte */}
          <div className="card-glow p-6">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-warning-400" />
              Signes d'une Interdiction Imminente
            </h2>
            <p className="text-sm text-slate-400 mb-4">Reconnaître les signaux d'alarme avant qu'il soit trop tard peut vous sauver la mise.</p>
            <div className="space-y-2">
              {filteredSigns.map((sign, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-space-700/40 border border-warning-500/20">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-warning-500/20 text-warning-400 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</div>
                  <p className="text-sm text-slate-300">{sign}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section : Contre-mesures */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-success-400" />
              Contre-mesures Anti-Piraterie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCountermeasures.map((cm, i) => (
                <TipBox key={i} {...cm} />
              ))}
            </div>
          </div>

          {/* Section : Vaisseaux anti-pirate */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Rocket className="w-5 h-5 text-cyan-400" />
              Vaisseaux Recommandés pour Éviter la Piraterie
            </h2>
            <div className="space-y-3">
              {filteredAntiShips.map((ship, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-slate-200">{ship.ship}</span>
                        <span className={`badge ${ship.badge} text-xs`}>{ship.role}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div>
                          <span className="text-xs text-success-400">Forces : </span>
                          <span className="text-xs text-slate-300">{ship.strength}</span>
                        </div>
                        <div>
                          <span className="text-xs text-danger-400">Faiblesses : </span>
                          <span className="text-xs text-slate-300">{ship.weakness}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 p-2.5 rounded-lg bg-space-700/50 border border-space-400/20">
                    <p className="text-xs text-gold-400 italic">{ship.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section : Si votre vaisseau est intercepté */}
          <div>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-danger-400" />
              Que Faire si Votre Vaisseau est Intercepté
            </h2>
            <p className="text-sm text-slate-400 mb-4">Protocole d'urgence étape par étape en cas d'interception pirate.</p>
            <div className="space-y-2">
              {filteredSteps.map((step, i) => (
                <div key={i} className="card p-4 flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-danger-500/20 text-danger-400 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{step.step}</div>
                    <p className="text-xs text-slate-400 mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-space-700/40 border border-cyan-500/20 flex gap-3">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong className="text-cyan-400">Appel de détresse PvP :</strong> Utilisez Spectrum (le forum officiel en jeu) et les canaux Discord de votre organisation pour signaler une attaque en cours. Certaines orgs comme la Citizen Defense Force (CDF) ou l'UEE Navy patrouillent et répondent activement.</p>
                <p className="mt-1"><strong className="text-gold-400">Règle d'or :</strong> Votre vaisseau est remplaçable, vos composants aussi. Ne prenez pas de risques démesurés pour défendre un cargo de 50K aUEC contre un groupe de 3 pirates bien équipés.</p>
              </div>
            </div>
          </div>

          {/* Récapitulatif rapide */}
          <div className="card p-5 border border-success-500/20">
            <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-success-400" />
              Récapitulatif : Les 5 Règles de Survie du Marchand
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { num: '1', text: 'Voyagez hors des heures de pointe (serveur peu peuplé)', color: 'text-success-400' },
                { num: '2', text: 'Évitez les routes prévisibles répétitives', color: 'text-cyan-400' },
                { num: '3', text: 'Gardez une route QT sécurité prête en permanence', color: 'text-warning-400' },
                { num: '4', text: 'Répondez toujours aux hails — le silence aggrave la situation', color: 'text-gold-400' },
                { num: '5', text: 'Escorte payée = investissement, pas une dépense', color: 'text-purple-400' },
              ].map(r => (
                <div key={r.num} className="flex items-start gap-2">
                  <div className={clsx('text-lg font-bold font-display flex-shrink-0', r.color)}>{r.num}</div>
                  <p className="text-xs text-slate-400">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER LIENS ── */}
      <div className="card p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Guides connexes :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/crimestat')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Système CrimeStat
          </button>
          <button onClick={() => navigate('/bounty-hunting')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Chasse aux Primes
          </button>
          <button onClick={() => navigate('/factions')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Factions
          </button>
          <button onClick={() => navigate('/trade')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Commerce
          </button>
          <button onClick={() => navigate('/reputation')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Réputation
          </button>
          <button onClick={() => navigate('/guides')} className="badge badge-slate hover:badge-cyan transition-colors cursor-pointer">
            Tous les Guides
          </button>
        </div>
      </div>
    </div>
  );
}
