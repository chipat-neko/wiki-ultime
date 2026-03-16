import React, { useState, useMemo } from 'react';
import {
  Heart, MapPin, Shield, AlertTriangle, Search, Filter,
  ChevronDown, ChevronRight, Info, Star, Package, Wrench,
  Clock, Users, Zap, Lock, CheckCircle, XCircle, Globe,
  Navigation, Activity, Syringe, Pill, Stethoscope,
  HelpCircle, BookOpen, ArrowRight, TriangleAlert,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Données intégrées ────────────────────────────────────────────────────────

const SPAWN_POINTS = [
  // ── Stanton — Villes ────────────────────────────────────────────
  {
    id: 'nbc_general',
    name: 'New Babbage General Hospital',
    type: 'hospital',
    system: 'Stanton',
    body: 'microTech',
    location: 'New Babbage',
    medicalTier: 3,
    services: ['respawn', 'healing', 'armor_repair', 'ship_claim', 'pharmacy'],
    securityLevel: 'high',
    legalStatus: 'legal',
    notes: 'Principal hôpital de New Babbage, accessible depuis l\'Aspire Grand et le Spaceport. Tier 3 complet.',
    landmark: 'Spire médicale centrale, panneau "MedCenter"',
  },
  {
    id: 'orison_medical',
    name: 'Orison Medical Center',
    type: 'hospital',
    system: 'Stanton',
    body: 'Crusader',
    location: 'Orison',
    medicalTier: 3,
    services: ['respawn', 'healing', 'armor_repair', 'ship_claim', 'pharmacy'],
    securityLevel: 'high',
    legalStatus: 'legal',
    notes: 'Centre médical des plateformes aériennes de Crusader. Accès depuis la plateforme Seraphim.',
    landmark: 'Plateforme Seraphim, niveau médical',
  },
  {
    id: 'lorville_central',
    name: 'Lorville Central Medical',
    type: 'hospital',
    system: 'Stanton',
    body: 'Hurston',
    location: 'Lorville',
    medicalTier: 3,
    services: ['respawn', 'healing', 'armor_repair', 'ship_claim', 'pharmacy'],
    securityLevel: 'high',
    legalStatus: 'legal',
    notes: 'Hôpital central de Lorville, géré par Hurston Dynamics. Zone sécurisée, accès facile depuis le transit.',
    landmark: 'District médical, entre Teasa Spaceport et le centre-ville',
  },
  {
    id: 'area18_medcenter',
    name: 'Area18 MedCenter',
    type: 'hospital',
    system: 'Stanton',
    body: 'ArcCorp',
    location: 'Area18',
    medicalTier: 3,
    services: ['respawn', 'healing', 'armor_repair', 'ship_claim', 'pharmacy'],
    securityLevel: 'high',
    legalStatus: 'legal',
    notes: 'Centre médical principal d\'Area18, intégré dans les arcologies corporatives. Ouvert 24/7.',
    landmark: 'Proche du Regal Luxury Hotel, signalisation verte',
  },
  // ── Stanton — Stations Lagrange ──────────────────────────────────
  {
    id: 'hur_l1_clinic',
    name: 'HUR-L1 Brios Breaker Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Point Lagrange',
    location: 'HUR-L1',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Clinique de station Lagrange Hurston-1. Tier 2 : soins intermédiaires, pas de chirurgie lourde.',
    landmark: 'Pont médical, niveau 2',
  },
  {
    id: 'hur_l2_clinic',
    name: 'HUR-L2 Faithful Dream Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Point Lagrange',
    location: 'HUR-L2',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Clinique standard Lagrange. Idéale comme point de respawn intermédiaire entre Hurston et ArcCorp.',
    landmark: 'Décor bleu, salle médicale principale',
  },
  {
    id: 'arc_l1_clinic',
    name: 'ARC-L1 Wide Forest Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Point Lagrange',
    location: 'ARC-L1',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Station Lagrange entre ArcCorp et Crusader. Point de respawn stratégique pour les traders.',
    landmark: 'Salle médicale centrale',
  },
  {
    id: 'cru_l1_clinic',
    name: 'CRU-L1 Ambitious Dream Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Point Lagrange',
    location: 'CRU-L1',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Station Lagrange orbitant Crusader, alternative haut de gamme à Orison.',
    landmark: 'Niveau médical, pont B',
  },
  {
    id: 'mic_l1_clinic',
    name: 'MIC-L1 Shallow Frontier Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Point Lagrange',
    location: 'MIC-L1',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Station Lagrange microTech-1. Bon point de chute si vous revenez de missions deep space.',
    landmark: 'Infirmerie centrale',
  },
  {
    id: 'mic_l5_clinic',
    name: 'MIC-L5 Modern Icebox Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Point Lagrange',
    location: 'MIC-L5',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Point Lagrange isolé de microTech, souvent calme. Idéal pour les explorateurs.',
    landmark: 'Salle médicale, escalier B',
  },
  // ── Stanton — GrimHEX ────────────────────────────────────────────
  {
    id: 'grimhex_medical',
    name: 'GrimHEX Black Market Clinic',
    type: 'clinic',
    system: 'Stanton',
    body: 'Yela',
    location: 'GrimHEX',
    medicalTier: 1,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'none',
    legalStatus: 'outlaw',
    notes: 'Clinique underground dans l\'astéroïde de Yela. Tier 1 seulement : soins basiques. Pas de questions posées.',
    landmark: 'Pièce médicale, niveau inférieur de la station',
  },
  // ── Stanton — Outposts / HDMS ─────────────────────────────────────
  {
    id: 'hdms_pinewood',
    name: 'HDMS-Pinewood Infirmary',
    type: 'spawn_point',
    system: 'Stanton',
    body: 'microTech',
    location: 'Lune Euterpe',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Avant-poste HDMS sur Euterpe. Point de spawn basique avec lit médical Tier 1.',
    landmark: 'Module médical de l\'avant-poste',
  },
  {
    id: 'hdms_ryder',
    name: 'HDMS-Ryder Infirmary',
    type: 'spawn_point',
    system: 'Stanton',
    body: 'microTech',
    location: 'Lune Calliope',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Avant-poste HDMS sur Calliope. Respawn rapide pour les missions sur les lunes de microTech.',
    landmark: 'Salle de soin, rez-de-chaussée',
  },
  {
    id: 'hdms_hahn',
    name: 'HDMS-Hahn Infirmary',
    type: 'spawn_point',
    system: 'Stanton',
    body: 'Hurston',
    location: 'Lune Magda',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Avant-poste sur Magda. Paysage désertique, soins minimaux disponibles.',
    landmark: 'Aile médicale de l\'avant-poste',
  },
  // ── Stanton — Jumptown & bases outlaw ────────────────────────────
  {
    id: 'jumptown',
    name: 'Jumptown (Aid Station)',
    type: 'spawn_point',
    system: 'Stanton',
    body: 'Yela',
    location: 'Surface Yela',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'none',
    legalStatus: 'outlaw',
    notes: 'Laboratoire illicite sur Yela. Kiosque médical Tier 1. Zone de conflit permanente, respawn risqué.',
    landmark: 'Cave souterraine, médic basique',
  },
  {
    id: 'nine_tails_base',
    name: 'Nine Tails Forward Base',
    type: 'spawn_point',
    system: 'Stanton',
    body: 'Hurston',
    location: 'Surface Hurston',
    medicalTier: 1,
    services: ['respawn'],
    securityLevel: 'none',
    legalStatus: 'outlaw',
    notes: 'Bases Nine Tails éparpillées sur Hurston. Respawn disponible si affilié, sinon extrêmement dangereux.',
    landmark: 'Diverses positions sur Hurston',
  },
  // ── Stanton — Prison ──────────────────────────────────────────────
  {
    id: 'klescher_prison',
    name: 'Prison de Klescher',
    type: 'prison',
    system: 'Stanton',
    body: 'Aberdeen',
    location: 'Lune Aberdeen',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'high',
    legalStatus: 'legal',
    notes: 'Prison pour les joueurs avec badge de criminalité niveau 3+. Respawn automatique après mort si incarcéré. Sorties possibles via missions minières ou aide extérieure.',
    landmark: 'Surface d\'Aberdeen, bâtiment principal de la prison',
  },
  // ── Stanton — Arena Commander ─────────────────────────────────────
  {
    id: 'arena_commander',
    name: 'Arena Commander',
    type: 'arena',
    system: 'Stanton',
    body: 'Virtuel',
    location: 'Simulateur',
    medicalTier: 4,
    services: ['respawn'],
    securityLevel: 'high',
    legalStatus: 'legal',
    notes: 'Respawn instantané en simulateur, sans perte d\'équipement. Idéal pour pratiquer le combat sans risque.',
    landmark: 'Via mobiGlas → Arena Commander',
  },
  // ── Stanton — Port Olisar / Everus Harbor ────────────────────────
  {
    id: 'everus_harbor',
    name: 'Everus Harbor Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'Hurston',
    location: 'Everus Harbor',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Station orbitale autour d\'Hurston. Clinique Tier 2, bon point de chute pour les missions Hurston.',
    landmark: 'Pont médical niveau 3',
  },
  {
    id: 'baijini_point',
    name: 'Baijini Point Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'ArcCorp',
    location: 'Baijini Point',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Station orbitale d\'ArcCorp. Clinique Tier 2, accès rapide depuis Area18.',
    landmark: 'Infirmerie principale',
  },
  {
    id: 'port_tressler',
    name: 'Port Tressler Medical',
    type: 'clinic',
    system: 'Stanton',
    body: 'microTech',
    location: 'Port Tressler',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Station orbitale microTech. Tier 2, soins standard. Alternative à New Babbage si les files sont longues.',
    landmark: 'Pont B, salle médicale',
  },
  // ── Pyro — Hubs principaux ────────────────────────────────────────
  {
    id: 'checkmate_medical',
    name: 'Checkmate Medical Bay',
    type: 'hospital',
    system: 'Pyro',
    body: 'Station Checkmate',
    location: 'Pyro IV vicinity',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy', 'ship_claim'],
    securityLevel: 'low',
    legalStatus: 'neutral',
    notes: 'Hub principal de Pyro. Clinique Tier 2, ambiance frontier. Pas de sécurité forte, mais service médical fonctionnel.',
    landmark: 'Deck inférieur de Checkmate',
  },
  {
    id: 'ruin_station_medical',
    name: 'Ruin Station Medbay',
    type: 'clinic',
    system: 'Pyro',
    body: 'Station Ruin',
    location: 'Orbite Pyro III',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'none',
    legalStatus: 'outlaw',
    notes: 'Station pirate Tier 1 dans Pyro. Soins rudimentaires, environnement hostile. Respawn dangereux si ennemi présent.',
    landmark: 'Infirmerie de fortune, niveau cargo',
  },
  {
    id: 'pyro_vt_medical',
    name: 'Pyro Gateway Station Medical',
    type: 'clinic',
    system: 'Pyro',
    body: 'Jump Point Stanton-Pyro',
    location: 'Entrée Pyro',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'low',
    legalStatus: 'neutral',
    notes: 'Station de transit au Jump Point Stanton-Pyro. Clinique Tier 2, utile pour la transition entre les systèmes.',
    landmark: 'Couloir médical, pont principal',
  },
  {
    id: 'gastech_medical',
    name: 'Gastech Station Medical',
    type: 'clinic',
    system: 'Pyro',
    body: 'Pyro I',
    location: 'Orbite Pyro I',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'low',
    legalStatus: 'neutral',
    notes: 'Station minière autour de Pyro I. Infirmerie basique, principalement utilisée par les mineurs d\'astéroïdes.',
    landmark: 'Module médical, dock principal',
  },
  {
    id: 'nuen_waste_medical',
    name: 'Nuen Waste Management Medical',
    type: 'spawn_point',
    system: 'Pyro',
    body: 'Pyro II',
    location: 'Surface Monox',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'low',
    legalStatus: 'neutral',
    notes: 'Avant-poste sur Monox (Pyro II). Point de respawn frontier, équipement médical minimal.',
    landmark: 'Hangar principal de l\'avant-poste',
  },
  {
    id: 'pyrolab_medical',
    name: 'PyroLab Research Medical',
    type: 'clinic',
    system: 'Pyro',
    body: 'Pyro VI',
    location: 'Orbite Adir',
    medicalTier: 2,
    services: ['respawn', 'healing', 'pharmacy'],
    securityLevel: 'medium',
    legalStatus: 'legal',
    notes: 'Installation de recherche UEE en orbite d\'Adir. Clinique Tier 2, accès restreint mais soins de qualité.',
    landmark: 'Module B, laboratoire médical',
  },
  // ── Pyro — Outlaw ─────────────────────────────────────────────────
  {
    id: 'vigil_medical',
    name: 'Vigil Station Medbay',
    type: 'spawn_point',
    system: 'Pyro',
    body: 'Pyro III',
    location: 'Orbite Vuur',
    medicalTier: 1,
    services: ['respawn'],
    securityLevel: 'none',
    legalStatus: 'outlaw',
    notes: 'Station abandonnée reprise par des hors-la-loi. Un lit médical de fortune. Très dangereux.',
    landmark: 'Niveau cargo, cellule médicale',
  },
  {
    id: 'patch_city_medical',
    name: 'Patch City Clinic',
    type: 'clinic',
    system: 'Pyro',
    body: 'Pyro IV',
    location: 'Surface Bloom',
    medicalTier: 1,
    services: ['respawn', 'healing'],
    securityLevel: 'none',
    legalStatus: 'outlaw',
    notes: 'Ville outlaw sur Bloom. Clinique Tier 1 gérée par des indépendants. Pas de sécurité UEE.',
    landmark: 'Rue principale de Patch City',
  },
];

// ─── Données : lieux proches ──────────────────────────────────────────────────

const PLAYER_LOCATIONS = [
  { id: 'new_babbage', label: 'New Babbage (microTech)', system: 'Stanton' },
  { id: 'orison',      label: 'Orison (Crusader)',       system: 'Stanton' },
  { id: 'lorville',    label: 'Lorville (Hurston)',       system: 'Stanton' },
  { id: 'area18',      label: 'Area18 (ArcCorp)',         system: 'Stanton' },
  { id: 'grimhex',     label: 'GrimHEX (Yela)',           system: 'Stanton' },
  { id: 'yela',        label: 'Surface Yela',             system: 'Stanton' },
  { id: 'calliope',    label: 'Lune Calliope',            system: 'Stanton' },
  { id: 'euterpe',     label: 'Lune Euterpe',             system: 'Stanton' },
  { id: 'cellin',      label: 'Lune Cellin (Crusader)',   system: 'Stanton' },
  { id: 'daymar',      label: 'Lune Daymar (Crusader)',   system: 'Stanton' },
  { id: 'aberdeen',    label: 'Lune Aberdeen (Hurston)',  system: 'Stanton' },
  { id: 'magda',       label: 'Lune Magda (Hurston)',     system: 'Stanton' },
  { id: 'arial',       label: 'Lune Arial (Hurston)',     system: 'Stanton' },
  { id: 'wala',        label: 'Lune Wala (ArcCorp)',      system: 'Stanton' },
  { id: 'lyria',       label: 'Lune Lyria (ArcCorp)',     system: 'Stanton' },
  { id: 'hur_l1',      label: 'HUR-L1 (Lagrange)',        system: 'Stanton' },
  { id: 'arc_l1',      label: 'ARC-L1 (Lagrange)',        system: 'Stanton' },
  { id: 'cru_l1',      label: 'CRU-L1 (Lagrange)',        system: 'Stanton' },
  { id: 'mic_l1',      label: 'MIC-L1 (Lagrange)',        system: 'Stanton' },
  { id: 'deep_space',  label: 'Deep Space Stanton',       system: 'Stanton' },
  { id: 'checkmate',   label: 'Checkmate Station (Pyro)',  system: 'Pyro' },
  { id: 'ruin_station',label: 'Ruin Station (Pyro)',       system: 'Pyro' },
  { id: 'pyro_jp',     label: 'Jump Point Stanton-Pyro',  system: 'Pyro' },
  { id: 'bloom',       label: 'Bloom (Pyro IV)',           system: 'Pyro' },
  { id: 'monox',       label: 'Monox (Pyro II)',           system: 'Pyro' },
];

// Table de distances lore-friendly (km quantiques approximatifs, 0 = même lieu)
const PROXIMITY_TABLE = {
  new_babbage: ['nbc_general', 'port_tressler', 'mic_l1_clinic', 'mic_l5_clinic', 'hdms_pinewood'],
  orison:      ['orison_medical', 'cru_l1_clinic', 'baijini_point', 'arc_l1_clinic', 'nbc_general'],
  lorville:    ['lorville_central', 'everus_harbor', 'hdms_hahn', 'hur_l1_clinic', 'hur_l2_clinic'],
  area18:      ['area18_medcenter', 'baijini_point', 'arc_l1_clinic', 'orison_medical', 'cru_l1_clinic'],
  grimhex:     ['grimhex_medical', 'jumptown', 'arc_l1_clinic', 'orison_medical', 'area18_medcenter'],
  yela:        ['grimhex_medical', 'jumptown', 'arc_l1_clinic', 'orison_medical', 'area18_medcenter'],
  calliope:    ['hdms_ryder', 'nbc_general', 'port_tressler', 'mic_l1_clinic', 'hdms_pinewood'],
  euterpe:     ['hdms_pinewood', 'nbc_general', 'port_tressler', 'mic_l1_clinic', 'hdms_ryder'],
  cellin:      ['orison_medical', 'cru_l1_clinic', 'arc_l1_clinic', 'baijini_point', 'area18_medcenter'],
  daymar:      ['orison_medical', 'cru_l1_clinic', 'arc_l1_clinic', 'baijini_point', 'area18_medcenter'],
  aberdeen:    ['klescher_prison', 'everus_harbor', 'lorville_central', 'hur_l1_clinic', 'hdms_hahn'],
  magda:       ['hdms_hahn', 'lorville_central', 'everus_harbor', 'hur_l1_clinic', 'hur_l2_clinic'],
  arial:       ['everus_harbor', 'lorville_central', 'hur_l1_clinic', 'hdms_hahn', 'hur_l2_clinic'],
  wala:        ['baijini_point', 'area18_medcenter', 'arc_l1_clinic', 'orison_medical', 'cru_l1_clinic'],
  lyria:       ['baijini_point', 'area18_medcenter', 'arc_l1_clinic', 'orison_medical', 'cru_l1_clinic'],
  hur_l1:      ['hur_l1_clinic', 'lorville_central', 'everus_harbor', 'hdms_hahn', 'hur_l2_clinic'],
  arc_l1:      ['arc_l1_clinic', 'area18_medcenter', 'baijini_point', 'orison_medical', 'cru_l1_clinic'],
  cru_l1:      ['cru_l1_clinic', 'orison_medical', 'arc_l1_clinic', 'baijini_point', 'area18_medcenter'],
  mic_l1:      ['mic_l1_clinic', 'nbc_general', 'port_tressler', 'hdms_pinewood', 'hdms_ryder'],
  deep_space:  ['mic_l5_clinic', 'mic_l1_clinic', 'arc_l1_clinic', 'cru_l1_clinic', 'hur_l1_clinic'],
  checkmate:   ['checkmate_medical', 'pyrolab_medical', 'nuen_waste_medical', 'pyro_vt_medical', 'ruin_station_medical'],
  ruin_station:['ruin_station_medical', 'checkmate_medical', 'vigil_medical', 'gastech_medical', 'patch_city_medical'],
  pyro_jp:     ['pyro_vt_medical', 'checkmate_medical', 'gastech_medical', 'pyrolab_medical', 'nuen_waste_medical'],
  bloom:       ['patch_city_medical', 'checkmate_medical', 'vigil_medical', 'ruin_station_medical', 'pyrolab_medical'],
  monox:       ['nuen_waste_medical', 'gastech_medical', 'pyro_vt_medical', 'checkmate_medical', 'ruin_station_medical'],
};

const DISTANCE_LABELS = [
  '< 5 min de vol',
  '~10 min de vol',
  '~20 min de vol',
  '~40 min de vol',
  '~1h de vol',
];

// ─── Données : médicaments FPS ────────────────────────────────────────────────

const MEDIKITS = [
  {
    id: 'hemozal_s',
    name: 'Hemozal Bandage (S)',
    category: 'bandage',
    effect: 'Arrête le saignement léger, régénère 15 HP sur 30s',
    duration: '30s',
    buyAt: ['Hospitals T1+', 'Pharmacies en ville', 'GrimHEX'],
    price: '75 aUEC',
    tier: 1,
    notes: 'Item de base, à emporter en permanence.',
  },
  {
    id: 'hemozal_l',
    name: 'Hemozal Bandage (L)',
    category: 'bandage',
    effect: 'Arrête le saignement sévère, régénère 40 HP sur 45s',
    duration: '45s',
    buyAt: ['Hospitals T2+', 'Pharmacies urbaines'],
    price: '150 aUEC',
    tier: 1,
    notes: 'Indispensable pour les missions de combat.',
  },
  {
    id: 'medipen_t1',
    name: 'Medipen Tier 1',
    category: 'medipen',
    effect: 'Soin rapide +25 HP, suppression temporaire de la douleur',
    duration: '5s (effet immédiat)',
    buyAt: ['Tous les hôpitaux et cliniques'],
    price: '200 aUEC',
    tier: 1,
    notes: 'Soin d\'urgence le plus courant, utilisable tout en combattant.',
  },
  {
    id: 'medipen_t2',
    name: 'Medipen Tier 2',
    category: 'medipen',
    effect: 'Soin +60 HP, stabilise fractures mineures',
    duration: '8s',
    buyAt: ['Hospitals T2+', 'Factions alliées'],
    price: '450 aUEC',
    tier: 2,
    notes: 'Upgrade significatif du T1, recommandé pour les zones de conflit.',
  },
  {
    id: 'medipen_t3',
    name: 'Medipen Tier 3',
    category: 'medipen',
    effect: 'Soin +120 HP, traite fractures complexes et empoisonnement',
    duration: '12s',
    buyAt: ['Hospitals T3 uniquement', 'Pharmacies New Babbage / Lorville'],
    price: '900 aUEC',
    tier: 3,
    notes: 'Medipen le plus puissant disponible en jeu pour les joueurs.',
  },
  {
    id: 'detox_inject',
    name: 'Détox Injecteur',
    category: 'antidote',
    effect: 'Neutralise empoisonnement, purge toxines (Pyro environnement)',
    duration: 'Effet instantané',
    buyAt: ['Pharmacies T2+', 'Checkmate Station', 'Pyrolab'],
    price: '380 aUEC',
    tier: 2,
    notes: 'Essentiel pour Pyro et les zones toxiques (Lyria, certaines bases).',
  },
  {
    id: 'stim_inject',
    name: 'Stim Injecteur',
    category: 'stim',
    effect: 'Boost temporaire : vitesse +20%, endurance +30%, douleur supprimée 120s',
    duration: '120s',
    buyAt: ['GrimHEX', 'Marchés noirs', 'Ruin Station'],
    price: '550 aUEC',
    tier: 2,
    notes: 'Illégal en espace UEE. Crash après effet : ralentissement 30s.',
  },
  {
    id: 'oxypen',
    name: 'Oxypen',
    category: 'support',
    effect: 'Recharge réserve O₂ personnelle (+60s d\'autonomie)',
    duration: 'Consommable instantané',
    buyAt: ['Tous les hôpitaux', 'Stations Lagrange', 'Ports spatiaux'],
    price: '120 aUEC',
    tier: 1,
    notes: 'Indispensable pour les sorties EVA prolongées et zones dépressurisées.',
  },
];

// ─── Données : vaisseaux médicaux ─────────────────────────────────────────────

const MEDICAL_SHIPS = [
  {
    id: 'apollo_t4',
    name: 'RSI Apollo Triage',
    manufacturer: 'RSI',
    medTier: 4,
    beds: 4,
    crewMin: 1,
    crewRecommended: 3,
    role: 'Ambulance / Soin avancé',
    buyAt: 'RSI Showroom — Area18',
    rentAt: 'Non disponible à la location',
    price: '4 500 000 aUEC',
    notes: 'Vaisseau médical de référence. Tier 4 : chirurgie complète, respawn, regen totale. Idéal pour les grands groupes.',
    highlight: true,
  },
  {
    id: 'cutlass_red',
    name: 'Drake Cutlass Red',
    manufacturer: 'Drake',
    medTier: 2,
    beds: 2,
    crewMin: 1,
    crewRecommended: 2,
    role: 'Ambulance légère',
    buyAt: 'New Deal — Lorville, Drake Showroom — Area18',
    rentAt: 'Plusieurs stations Lagrange',
    price: '1 800 000 aUEC',
    notes: 'Vaisseau médical accessible. Tier 2 : soins intermédiaires, 2 lits, bon pour le soutien en combat ou opérations de taille moyenne.',
    highlight: false,
  },
  {
    id: 'carrack_medical',
    name: 'Anvil Carrack (Module Médical)',
    manufacturer: 'Anvil',
    medTier: 2,
    beds: 2,
    crewMin: 4,
    crewRecommended: 6,
    role: 'Exploration / Support médical',
    buyAt: 'Crusader Industries Shop — Orison, Anvil Showroom',
    rentAt: 'Non disponible',
    price: '5 500 000 aUEC',
    notes: 'Le module médical du Carrack offre 2 lits Tier 2. Excellent pour les expéditions longues dans Pyro.',
    highlight: false,
  },
  {
    id: 'pisces_rescue',
    name: 'Anvil C8R Pisces Rescue',
    manufacturer: 'Anvil',
    medTier: 1,
    beds: 1,
    crewMin: 1,
    crewRecommended: 1,
    role: 'Navette de secours légère',
    buyAt: 'Anvil Showroom — Orison',
    rentAt: 'Spaceport Hangars — New Babbage',
    price: '750 000 aUEC',
    notes: 'Vaisseau médical Tier 1, un seul lit. Rapide et maniable, idéal pour les sauvetages rapides en solo.',
    highlight: false,
  },
];

// ─── Guides de survie (données) ───────────────────────────────────────────────

const TIER_TABLE = [
  {
    tier: 1,
    label: 'Tier 1 — Soins de Base',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    capacities: ['Bandages et arrêt de saignement', 'Medipen basique (T1)', 'Respawn point'],
    limitations: ['Pas de traitement des fractures', 'Pas de détox', 'Pas de chirurgie'],
    locations: ['Avant-postes (HDMS)', 'GrimHEX', 'Bases outlaw', 'Jumptown'],
  },
  {
    tier: 2,
    label: 'Tier 2 — Soins Intermédiaires',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    capacities: ['Traitement fractures mineures', 'Détoxification', 'Medipen T1-T2', 'Respawn médical'],
    limitations: ['Pas de chirurgie lourde', 'Pas de Medipen T3'],
    locations: ['Stations Lagrange', 'Stations orbitales', 'Checkmate (Pyro)'],
  },
  {
    tier: 3,
    label: 'Tier 3 — Soins Avancés',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    capacities: ['Chirurgie complète', 'Tous les Medipen', 'Regen complète', 'Respawn premium', 'Pharmacy complète'],
    limitations: ['Délai de voyage potentiel', 'Zones légales uniquement'],
    locations: ['New Babbage', 'Lorville', 'Orison', 'Area18'],
  },
  {
    tier: 4,
    label: 'Tier 4 — Médical Militaire',
    color: 'text-gold-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    capacities: ['Chirurgie avancée', 'Régénération organes', 'Respawn instantané', 'Tous soins possibles'],
    limitations: ['Apollo uniquement (vaisseau)', 'Pas de structure fixe T4 disponible pour joueurs'],
    locations: ['Apollo Triage (vaisseau)', 'Arena Commander (simulateur)'],
  },
];

const CRIMESTAT_TABLE = [
  { level: 0, label: 'Aucun', color: 'text-green-400', badge: 'badge-green', desc: 'Citoyen respectueux. Accès partout.' },
  { level: 1, label: 'CrimeStat 1', color: 'text-yellow-400', badge: 'badge-yellow', desc: 'Infraction mineure. Quelques zones bloquées, pas d\'arrestation active.' },
  { level: 2, label: 'CrimeStat 2', color: 'text-orange-400', badge: 'badge-orange', desc: 'Criminel connu. UEE Security vous traque, hôpitaux UEE refusent les soins.' },
  { level: 3, label: 'CrimeStat 3', color: 'text-red-400', badge: 'badge-red', desc: 'Fugitif dangereux. Arrestation automatique sur mort → prison de Klescher.' },
  { level: 4, label: 'CrimeStat 4', color: 'text-red-500', badge: 'badge-red', desc: 'Ennemi de l\'État. Peine prolongée, toutes les forces de sécurité hostiles.' },
  { level: 5, label: 'CrimeStat 5', color: 'text-danger-400', badge: 'badge-red', desc: 'Terroriste. Peine maximale, aucun accès aux zones UEE.' },
];

// ─── Constantes visuelles ─────────────────────────────────────────────────────

const TYPE_CONFIG = {
  hospital:    { label: 'Hôpital',       icon: Heart,         badge: 'badge-green',  bg: 'bg-green-500/15',  color: 'text-green-400' },
  clinic:      { label: 'Clinique',      icon: Stethoscope,   badge: 'badge-cyan',   bg: 'bg-cyan-500/15',   color: 'text-cyan-400' },
  spawn_point: { label: 'Spawn Point',   icon: MapPin,        badge: 'badge-slate',  bg: 'bg-slate-500/15',  color: 'text-slate-400' },
  prison:      { label: 'Prison',        icon: Lock,          badge: 'badge-red',    bg: 'bg-red-500/15',    color: 'text-red-400' },
  arena:       { label: 'Arena',         icon: Zap,           badge: 'badge-purple', bg: 'bg-purple-500/15', color: 'text-purple-400' },
};

const SECURITY_CONFIG = {
  high:   { label: 'Haute',   badge: 'badge-green',  color: 'text-green-400' },
  medium: { label: 'Modérée', badge: 'badge-yellow', color: 'text-yellow-400' },
  low:    { label: 'Faible',  badge: 'badge-orange', color: 'text-orange-400' },
  none:   { label: 'Aucune',  badge: 'badge-red',    color: 'text-red-400' },
};

const LEGAL_CONFIG = {
  legal:   { label: 'Légal',   badge: 'badge-green',  color: 'text-green-400' },
  neutral: { label: 'Neutre',  badge: 'badge-yellow', color: 'text-yellow-400' },
  outlaw:  { label: 'Outlaw',  badge: 'badge-red',    color: 'text-red-400' },
};

const SYSTEM_COLORS = {
  Stanton: 'text-cyan-400',
  Pyro:    'text-orange-400',
};

const SYSTEM_BG = {
  Stanton: 'bg-cyan-500/10 border-cyan-500/20',
  Pyro:    'bg-orange-500/10 border-orange-500/20',
};

const SERVICE_LABELS = {
  respawn:      'Respawn',
  healing:      'Soins',
  armor_repair: 'Réparation armure',
  ship_claim:   'Réclamation vaisseau',
  pharmacy:     'Pharmacie',
};

const SERVICE_BADGES = {
  respawn:      'badge-green',
  healing:      'badge-cyan',
  armor_repair: 'badge-slate',
  ship_claim:   'badge-blue',
  pharmacy:     'badge-purple',
};

const TIER_COLORS = { 1: 'text-slate-400', 2: 'text-cyan-400', 3: 'text-green-400', 4: 'text-yellow-400' };
const TIER_BG     = { 1: 'bg-slate-500/15', 2: 'bg-cyan-500/15', 3: 'bg-green-500/15', 4: 'bg-yellow-500/15' };
const TIER_BADGE  = { 1: 'badge-slate', 2: 'badge-cyan', 3: 'badge-green', 4: 'badge-yellow' };

const MED_CAT_BADGES = {
  bandage:  'badge-green',
  medipen:  'badge-cyan',
  antidote: 'badge-purple',
  stim:     'badge-orange',
  support:  'badge-blue',
};
const MED_CAT_LABELS = {
  bandage:  'Bandage',
  medipen:  'Medipen',
  antidote: 'Antidote',
  stim:     'Stimulant',
  support:  'Support',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TierBadge({ tier }) {
  return (
    <span className={clsx('badge', TIER_BADGE[tier])}>
      T{tier}
    </span>
  );
}

function SecBadge({ level }) {
  const c = SECURITY_CONFIG[level] || SECURITY_CONFIG.none;
  return <span className={clsx('badge', c.badge)}>{c.label}</span>;
}

function LegalBadge({ status }) {
  const c = LEGAL_CONFIG[status] || LEGAL_CONFIG.neutral;
  return <span className={clsx('badge', c.badge)}>{c.label}</span>;
}

function InfoRow({ icon: Icon, label, value, valueClass = 'text-slate-300' }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
      <span className="text-slate-500 w-24 flex-shrink-0">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

// ─── SpawnPointCard ───────────────────────────────────────────────────────────

function SpawnPointCard({ point }) {
  const [expanded, setExpanded] = useState(false);
  const tc = TYPE_CONFIG[point.type] || TYPE_CONFIG.spawn_point;
  const TypeIcon = tc.icon;

  return (
    <div className={clsx(
      'card overflow-hidden transition-all',
      point.legalStatus === 'outlaw' && 'border-red-500/15',
      point.type === 'prison' && 'border-red-500/20',
      point.type === 'arena' && 'border-purple-500/20',
    )}>
      <button
        className="w-full p-4 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start gap-3">
          {/* Icône type */}
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tc.bg)}>
            <TypeIcon className={clsx('w-5 h-5', tc.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-slate-100 text-sm leading-tight">{point.name}</span>
              <span className={clsx('badge', tc.badge)}>{tc.label}</span>
              <TierBadge tier={point.medicalTier} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className={clsx('flex items-center gap-1', SYSTEM_COLORS[point.system])}>
                <Globe className="w-3 h-3" />{point.system}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{point.location}
              </span>
              <span>•</span>
              <SecBadge level={point.securityLevel} />
              <LegalBadge status={point.legalStatus} />
            </div>
          </div>

          <div className="flex-shrink-0 text-slate-500">
            {expanded
              ? <ChevronDown className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/20 p-4 space-y-3 bg-space-900/40">
          {/* Services */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Services disponibles</p>
            <div className="flex flex-wrap gap-1.5">
              {point.services.map(s => (
                <span key={s} className={clsx('badge text-xs', SERVICE_BADGES[s] || 'badge-slate')}>
                  {SERVICE_LABELS[s] || s}
                </span>
              ))}
            </div>
          </div>

          {/* Infos */}
          <div className="space-y-1.5">
            <InfoRow icon={Navigation} label="Corps céleste" value={point.body} />
            <InfoRow icon={MapPin}     label="Repère"        value={point.landmark || '—'} valueClass="text-cyan-300" />
            <InfoRow icon={Shield}     label="Sécurité"      value={SECURITY_CONFIG[point.securityLevel]?.label} />
            <InfoRow icon={Info}       label="Notes"         value={point.notes} valueClass="text-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 1 : Annuaire ─────────────────────────────────────────────────────────

function TabDirectory() {
  const [search, setSearch] = useState('');
  const [filterSystem, setFilterSystem] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [filterSecurity, setFilterSecurity] = useState('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SPAWN_POINTS.filter(p => {
      if (filterSystem !== 'all' && p.system !== filterSystem) return false;
      if (filterType   !== 'all' && p.type !== filterType)     return false;
      if (filterTier   !== 'all' && String(p.medicalTier) !== filterTier) return false;
      if (filterSecurity !== 'all' && p.securityLevel !== filterSecurity) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q) && !p.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filterSystem, filterType, filterTier, filterSecurity]);

  const stanton = filtered.filter(p => p.system === 'Stanton');
  const pyro    = filtered.filter(p => p.system === 'Pyro');

  return (
    <div className="space-y-6">
      {/* Barre de filtres */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="input pl-9 w-full"
            placeholder="Rechercher un lieu, une planète..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Système</label>
            <select className="select w-full text-xs" value={filterSystem} onChange={e => setFilterSystem(e.target.value)}>
              <option value="all">Tous</option>
              <option value="Stanton">Stanton</option>
              <option value="Pyro">Pyro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Type</label>
            <select className="select w-full text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Tier médical</label>
            <select className="select w-full text-xs" value={filterTier} onChange={e => setFilterTier(e.target.value)}>
              <option value="all">Tous</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
              <option value="4">Tier 4</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Sécurité</label>
            <select className="select w-full text-xs" value={filterSecurity} onChange={e => setFilterSecurity(e.target.value)}>
              <option value="all">Toutes</option>
              {Object.entries(SECURITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>{filtered.length} point{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</span>
          {(search || filterSystem !== 'all' || filterType !== 'all' || filterTier !== 'all' || filterSecurity !== 'all') && (
            <button
              className="text-cyan-400 hover:text-cyan-300 underline ml-2"
              onClick={() => { setSearch(''); setFilterSystem('all'); setFilterType('all'); setFilterTier('all'); setFilterSecurity('all'); }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card p-8 text-center text-slate-500">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun point de spawn ne correspond à vos filtres.</p>
        </div>
      )}

      {/* Section Stanton */}
      {stanton.length > 0 && (
        <section>
          <div className={clsx('flex items-center gap-2 mb-4 px-3 py-2 rounded-xl border', SYSTEM_BG.Stanton)}>
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-cyan-400 text-sm">Système Stanton</h2>
            <span className="badge badge-cyan ml-auto">{stanton.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {stanton.map(p => <SpawnPointCard key={p.id} point={p} />)}
          </div>
        </section>
      )}

      {/* Section Pyro */}
      {pyro.length > 0 && (
        <section>
          <div className={clsx('flex items-center gap-2 mb-4 px-3 py-2 rounded-xl border', SYSTEM_BG.Pyro)}>
            <Globe className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-orange-400 text-sm">Système Pyro</h2>
            <span className="badge badge-orange ml-auto">{pyro.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {pyro.map(p => <SpawnPointCard key={p.id} point={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Tab 2 : Guide de Survie ──────────────────────────────────────────────────

function GuideSection({ icon: Icon, title, children, accent = 'cyan' }) {
  const accentMap = {
    cyan:   { border: 'border-cyan-500/20',   icon: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
    green:  { border: 'border-green-500/20',  icon: 'text-green-400',  bg: 'bg-green-500/10' },
    yellow: { border: 'border-yellow-500/20', icon: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    red:    { border: 'border-red-500/20',    icon: 'text-red-400',    bg: 'bg-red-500/10' },
    orange: { border: 'border-orange-500/20', icon: 'text-orange-400', bg: 'bg-orange-500/10' },
  };
  const a = accentMap[accent] || accentMap.cyan;
  return (
    <div className={clsx('card p-5 border', a.border)}>
      <div className="flex items-center gap-2 mb-4">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', a.bg)}>
          <Icon className={clsx('w-4 h-4', a.icon)} />
        </div>
        <h3 className="font-bold text-slate-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items, icon: Icon = ArrowRight, iconClass = 'text-cyan-400' }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <Icon className={clsx('w-3.5 h-3.5 mt-0.5 flex-shrink-0', iconClass)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TabGuide() {
  const t3Hospitals = SPAWN_POINTS.filter(p => p.medicalTier === 3);

  return (
    <div className="space-y-6">

      {/* Comment ça marche */}
      <GuideSection icon={Info} title="Comment fonctionne le système de respawn" accent="cyan">
        <div className="space-y-4">
          <p className="text-sm text-slate-400 leading-relaxed">
            Lorsque votre personnage meurt dans Star Citizen, vous réapparaissez dans le dernier hôpital ou clinique où vous étiez enregistré. Le jeu utilise un système de <span className="text-cyan-400 font-semibold">Nouveau Né</span> (New Spawn) : votre clone est activé dans la salle de respawn la plus proche de votre mort.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Ce qui se PERD à la mort
              </p>
              <BulletList
                items={[
                  'Équipement FPS porté sur vous (armure, armes en main)',
                  'Objets dans votre inventaire sur scène',
                  'Médicaments et consommables équipés',
                  'Votre progression de blessures (réinitialisation)',
                ]}
                icon={XCircle}
                iconClass="text-red-400"
              />
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Ce qui est PRÉSERVÉ
              </p>
              <BulletList
                items={[
                  'Votre solde aUEC',
                  'Vaisseaux assurés (réclamation)',
                  'Données de personnage et progression',
                  'Équipement stocké dans les hangars',
                  'Réputation factions et missions',
                  'Équipement en magasin (achats)',
                ]}
                icon={CheckCircle}
                iconClass="text-green-400"
              />
            </div>
          </div>
        </div>
      </GuideSection>

      {/* Tiers médicaux */}
      <GuideSection icon={Activity} title="Les Tiers Médicaux expliqués" accent="green">
        <div className="space-y-3">
          {TIER_TABLE.map(t => (
            <div key={t.tier} className={clsx('rounded-xl border p-4', t.bg, t.border)}>
              <div className="flex items-center gap-2 mb-3">
                <span className={clsx('badge', TIER_BADGE[t.tier])}>T{t.tier}</span>
                <span className={clsx('font-semibold text-sm', t.color)}>{t.label}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Capacités</p>
                  <ul className="space-y-1">
                    {t.capacities.map((c, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Limitations</p>
                  <ul className="space-y-1">
                    {t.limitations.map((l, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-slate-600 flex-shrink-0" />{l}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Où trouver</p>
                  <ul className="space-y-1">
                    {t.locations.map((loc, i) => (
                      <li key={i} className="text-xs text-cyan-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />{loc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* Planifier son respawn */}
      <GuideSection icon={Star} title="Planifier son point de respawn" accent="yellow">
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> Conseil clé
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Avant une mission dangereuse, rendez-vous dans un <span className="text-green-400 font-semibold">hôpital Tier 3</span> pour vous enregistrer. En cas de mort, vous réapparaîtrez là avec accès à la pharmacie complète et à la réclamation de vaisseau.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 mb-3">Hôpitaux Tier 3 recommandés :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {t3Hospitals.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-space-700/40 border border-space-400/20">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{h.name}</p>
                    <p className={clsx('text-xs', SYSTEM_COLORS[h.system])}>{h.location} — {h.system}</p>
                  </div>
                  <TierBadge tier={h.medicalTier} />
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300">Comment atteindre un T3 :</p>
            <BulletList items={[
              'Atterrissez dans la ville (New Babbage, Lorville, Area18, Orison)',
              'Prenez le transit intérieur vers le district médical',
              'Entrez dans l\'hôpital et interagissez avec le terminal de soin',
              'Le simple fait d\'entrer vous enregistre comme point de respawn',
            ]} />
          </div>
        </div>
      </GuideSection>

      {/* Klescher Prison */}
      <GuideSection icon={Lock} title="Prison de Klescher — Tout savoir" accent="red">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Comment éviter la prison</p>
              <BulletList
                items={[
                  'Ne pas attaquer d\'autres joueurs en zone UEE sans raison',
                  'Éviter les tirs amis sur des civils ou forces de sécurité',
                  'Payer ses amendes rapidement (terminal de paiement en ville)',
                  'Rester en CrimeStat 0-2 pour éviter l\'incarcération automatique',
                ]}
                icon={AlertTriangle}
                iconClass="text-orange-400"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Comment sortir de Klescher</p>
              <BulletList
                items={[
                  'Purger sa peine via les missions minières internes (50-200 tokens requis)',
                  'Collecter des mineaux dans les tunnels de la prison',
                  'Faire appel à un ami équipé (extraction via ships)',
                  'Acheter une clé de sortie sur le marché noir de la prison',
                ]}
                icon={CheckCircle}
                iconClass="text-green-400"
              />
            </div>
          </div>

          {/* Tableau CrimeStat */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Niveaux de CrimeStat</p>
            <div className="space-y-1.5">
              {CRIMESTAT_TABLE.map(cs => (
                <div key={cs.level} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-space-800/50 border border-space-400/10">
                  <span className={clsx('badge flex-shrink-0', cs.badge)}>{cs.label}</span>
                  <span className="text-xs text-slate-400">{cs.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <p className="text-xs text-orange-300 flex items-start gap-2">
              <TriangleAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Si vous mourez avec CrimeStat 3+, vous réapparaissez directement à Klescher. La peine augmente à chaque récidive.</span>
            </p>
          </div>
        </div>
      </GuideSection>

    </div>
  );
}

// ─── Tab 3 : Trouver le plus proche ──────────────────────────────────────────

function TabFindNearest() {
  const [selectedLoc, setSelectedLoc] = useState('');

  const nearestPoints = useMemo(() => {
    if (!selectedLoc) return [];
    const ids = PROXIMITY_TABLE[selectedLoc] || [];
    return ids
      .slice(0, 3)
      .map((id, idx) => ({ point: SPAWN_POINTS.find(p => p.id === id), distLabel: DISTANCE_LABELS[idx] }))
      .filter(({ point }) => !!point);
  }, [selectedLoc]);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold text-slate-100 mb-1">Trouver l'hôpital le plus proche</h3>
        <p className="text-xs text-slate-500 mb-4">Sélectionnez votre position actuelle pour voir les 3 lieux médicaux les plus proches.</p>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Je suis actuellement à...</label>
          <select
            className="select w-full sm:w-80"
            value={selectedLoc}
            onChange={e => setSelectedLoc(e.target.value)}
          >
            <option value="">— Choisir un lieu —</option>
            <optgroup label="Stanton">
              {PLAYER_LOCATIONS.filter(l => l.system === 'Stanton').map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </optgroup>
            <optgroup label="Pyro">
              {PLAYER_LOCATIONS.filter(l => l.system === 'Pyro').map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {selectedLoc && nearestPoints.length === 0 && (
        <div className="card p-8 text-center text-slate-500">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun point de spawn trouvé pour ce lieu.</p>
        </div>
      )}

      {nearestPoints.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-3">
            Points médicaux les plus proches de <span className="text-cyan-400 font-semibold">
              {PLAYER_LOCATIONS.find(l => l.id === selectedLoc)?.label}
            </span> :
          </p>
          <div className="space-y-3">
            {nearestPoints.map(({ point, distLabel }, idx) => {
              const tc = TYPE_CONFIG[point.type] || TYPE_CONFIG.spawn_point;
              const TypeIcon = tc.icon;
              return (
                <div key={point.id} className={clsx(
                  'card p-4 border',
                  idx === 0 && 'border-green-500/30',
                )}>
                  <div className="flex items-start gap-3">
                    {/* Rang */}
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                      idx === 0 ? 'bg-green-500/20 text-green-400' : 'bg-space-700/60 text-slate-400',
                    )}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{point.name}</span>
                        <TierBadge tier={point.medicalTier} />
                        <span className={clsx('badge', tc.badge)}>{tc.label}</span>
                        {idx === 0 && <span className="badge badge-green text-xs">Plus proche</span>}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-cyan-300 font-medium">{distLabel}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3" />{point.location}
                        </span>
                        <SecBadge level={point.securityLevel} />
                        <LegalBadge status={point.legalStatus} />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {point.services.slice(0, 4).map(s => (
                          <span key={s} className={clsx('badge text-xs', SERVICE_BADGES[s] || 'badge-slate')}>
                            {SERVICE_LABELS[s] || s}
                          </span>
                        ))}
                      </div>

                      {point.notes && (
                        <p className="text-xs text-slate-500 leading-relaxed">{point.notes}</p>
                      )}
                    </div>

                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tc.bg)}>
                      <TypeIcon className={clsx('w-5 h-5', tc.color)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-space-800/50 border border-space-400/15">
            <p className="text-xs text-slate-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-600" />
              Les distances sont des estimations lore-friendly basées sur les orbites relatives. Le temps de vol réel dépend de votre vaisseau et de votre route quantique.
            </p>
          </div>
        </div>
      )}

      {/* Guide sélection rapide */}
      {!selectedLoc && (
        <div className="card p-5 border border-space-400/15">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Résumé rapide par planète
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { planet: 'Hurston', best: 'Lorville Central Medical', tier: 3, system: 'Stanton' },
              { planet: 'ArcCorp', best: 'Area18 MedCenter', tier: 3, system: 'Stanton' },
              { planet: 'Crusader', best: 'Orison Medical Center', tier: 3, system: 'Stanton' },
              { planet: 'microTech', best: 'New Babbage General', tier: 3, system: 'Stanton' },
              { planet: 'Pyro (all)', best: 'Checkmate Medical Bay', tier: 2, system: 'Pyro' },
              { planet: 'Deep space', best: 'Station Lagrange MIC-L5', tier: 2, system: 'Stanton' },
            ].map(r => (
              <div key={r.planet} className="flex items-center justify-between px-3 py-2 rounded-lg bg-space-800/50 border border-space-400/10">
                <div>
                  <span className={clsx('text-xs font-semibold', SYSTEM_COLORS[r.system])}>{r.planet}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{r.best}</p>
                </div>
                <TierBadge tier={r.tier} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4 : Équipement médical ───────────────────────────────────────────────

function TabEquipment() {
  const [activeSection, setActiveSection] = useState('meds');

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-space-400/20 pb-0">
        {[
          { id: 'meds', label: 'Médicaments FPS', icon: Pill },
          { id: 'ships', label: 'Vaisseaux Médicaux', icon: Heart },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2',
              activeSection === id
                ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                : 'text-slate-500 border-transparent hover:text-slate-300',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Section médicaments */}
      {activeSection === 'meds' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Médicaments et consommables FPS disponibles in-game. À emporter systématiquement avant une mission.
          </p>
          <div className="overflow-x-auto rounded-xl border border-space-400/20">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-space-700/60 border-b border-space-400/20">
                  <th className="text-left px-3 py-3 text-slate-400 font-semibold">Objet</th>
                  <th className="text-left px-3 py-3 text-slate-400 font-semibold hidden sm:table-cell">Effet</th>
                  <th className="text-left px-3 py-3 text-slate-400 font-semibold hidden md:table-cell">Durée</th>
                  <th className="text-left px-3 py-3 text-slate-400 font-semibold hidden lg:table-cell">Où acheter</th>
                  <th className="text-right px-3 py-3 text-slate-400 font-semibold">Prix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-400/10">
                {MEDIKITS.map(med => (
                  <tr key={med.id} className="hover:bg-space-700/20 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                          med.category === 'medipen' ? 'bg-cyan-500/15' :
                          med.category === 'bandage' ? 'bg-green-500/15' :
                          med.category === 'antidote' ? 'bg-purple-500/15' :
                          med.category === 'stim' ? 'bg-orange-500/15' : 'bg-blue-500/15',
                        )}>
                          <Syringe className={clsx('w-3.5 h-3.5',
                            med.category === 'medipen' ? 'text-cyan-400' :
                            med.category === 'bandage' ? 'text-green-400' :
                            med.category === 'antidote' ? 'text-purple-400' :
                            med.category === 'stim' ? 'text-orange-400' : 'text-blue-400',
                          )} />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200">{med.name}</span>
                          <div className="flex gap-1 mt-0.5">
                            <span className={clsx('badge text-xs', MED_CAT_BADGES[med.category])}>
                              {MED_CAT_LABELS[med.category]}
                            </span>
                            <TierBadge tier={med.tier} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-400 hidden sm:table-cell max-w-xs">
                      <span className="leading-relaxed">{med.effect}</span>
                      {med.notes && <p className="text-slate-600 mt-0.5 italic">{med.notes}</p>}
                    </td>
                    <td className="px-3 py-3 text-slate-300 hidden md:table-cell whitespace-nowrap">{med.duration}</td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        {med.buyAt.map((loc, i) => (
                          <div key={i} className="flex items-center gap-1 text-cyan-300">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-slate-600" />
                            {loc}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-bold text-yellow-400 whitespace-nowrap">{med.price}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section vaisseaux médicaux */}
      {activeSection === 'ships' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Vaisseaux équipés de baies médicales. Permettent de soigner d'autres joueurs in-situ ou de les transporter vers un hôpital.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MEDICAL_SHIPS.map(ship => (
              <div key={ship.id} className={clsx(
                'card p-4',
                ship.highlight && 'border-green-500/25',
              )}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={clsx(
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                    ship.highlight ? 'bg-green-500/20' : 'bg-space-700/60',
                  )}>
                    <Heart className={clsx('w-5 h-5', ship.highlight ? 'text-green-400' : 'text-slate-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-100 text-sm">{ship.name}</span>
                      {ship.highlight && <span className="badge badge-green text-xs">Recommandé</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <TierBadge tier={ship.medTier} />
                      <span className="badge badge-slate text-xs">{ship.manufacturer}</span>
                      <span className="badge badge-purple text-xs">{ship.role}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-space-800/50 rounded-lg px-3 py-2">
                    <span className="text-slate-500">Lits médicaux</span>
                    <p className="font-bold text-cyan-400 text-base">{ship.beds}</p>
                  </div>
                  <div className="bg-space-800/50 rounded-lg px-3 py-2">
                    <span className="text-slate-500">Équipage</span>
                    <p className="font-bold text-slate-200 text-base">{ship.crewMin}–{ship.crewRecommended}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500">Acheter : </span>
                      <span className="text-slate-300">{ship.buyAt}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500">Louer : </span>
                      <span className="text-slate-400">{ship.rentAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span className="text-yellow-400 font-bold">{ship.price}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed border-t border-space-400/15 pt-3">
                  {ship.notes}
                </p>
              </div>
            ))}
          </div>

          <div className="card p-4 border border-cyan-500/20">
            <p className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Comment utiliser un vaisseau médical
            </p>
            <BulletList items={[
              'Approchez le joueur blessé ou inconscient avec votre vaisseau',
              'Ouvrez la rampe de chargement/porte médicale',
              'Faites glisser le joueur blessé sur un lit médical (interaction F)',
              'Dans le menu de soin : choisissez "Stabiliser", "Soigner" ou "Réanimer"',
              'Le Tier du vaisseau détermine les soins possibles (T2 = intermédiaire, T4 = complet)',
            ]} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal SpawnGuide ──────────────────────────────────────────

const TABS = [
  { id: 'directory', label: 'Annuaire',          icon: MapPin },
  { id: 'guide',     label: 'Guide de Survie',   icon: BookOpen },
  { id: 'nearest',  label: 'Le Plus Proche',     icon: Navigation },
  { id: 'equipment',label: 'Équipement Médical', icon: Syringe },
];

export default function SpawnGuide() {
  const [activeTab, setActiveTab] = useState('directory');

  const spawnCount = SPAWN_POINTS.length;
  const t3Count    = SPAWN_POINTS.filter(p => p.medicalTier >= 3).length;
  const pyroCount  = SPAWN_POINTS.filter(p => p.system === 'Pyro').length;

  return (
    <div className="min-h-screen bg-space-900 p-4 sm:p-6 space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="page-title">Points de Spawn &amp; Hôpitaux</h1>
            <p className="text-slate-500 text-sm">Guide complet des lieux de respawn — Alpha 4.6</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Spawn Points',      value: spawnCount, color: 'text-cyan-400',   icon: MapPin },
            { label: 'Hôpitaux Tier 3+',  value: t3Count,    color: 'text-green-400',  icon: Heart },
            { label: 'Points Pyro',        value: pyroCount,  color: 'text-orange-400', icon: Globe },
            { label: 'Médicaments',        value: MEDIKITS.length, color: 'text-purple-400', icon: Pill },
          ].map(s => {
            const SIcon = s.icon;
            return (
              <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
                <SIcon className={clsx('w-5 h-5 flex-shrink-0', s.color)} />
                <div>
                  <p className={clsx('text-xl font-bold leading-none', s.color)}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-space-400/20 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2',
              activeTab === id
                ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                : 'text-slate-500 border-transparent hover:text-slate-300',
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'directory'  && <TabDirectory />}
        {activeTab === 'guide'      && <TabGuide />}
        {activeTab === 'nearest'    && <TabFindNearest />}
        {activeTab === 'equipment'  && <TabEquipment />}
      </div>

    </div>
  );
}
