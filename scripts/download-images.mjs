/**
 * Script de téléchargement d'images Star Citizen depuis media.starcitizen.tools
 *
 * Source: https://starcitizen.tools (wiki MediaWiki)
 * CDN:    https://media.starcitizen.tools/HASH/FILENAME.jpg
 *
 * Usage:
 *   node scripts/download-images.mjs ships
 *   node scripts/download-images.mjs ships --limit=10
 *   node scripts/download-images.mjs all
 *
 * Prérequis: ffmpeg dans le PATH (pour PNG→JPG)
 */

import { execSync, exec } from 'child_process';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================
// CONFIGURATION
// ============================================================

const PUBLIC_DIR = new URL('../public/images/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DELAY_MS = 800; // délai entre requêtes pour ne pas surcharger le wiki
const MAX_RETRIES = 3;

// ============================================================
// TABLE DE CORRESPONDANCE : ID dataset → Nom de page wiki
// ============================================================

const SHIPS_MAP = {
  // AEGIS DYNAMICS
  'aegis-avenger-titan':       { wiki: 'Avenger_Titan',         url: 'https://media.starcitizen.tools/4/4b/Avenger_Titan_3.2_sale_Titan_01-Squashed.jpg' },
  'aegis-avenger-stalker':     { wiki: 'Avenger_Stalker',        url: null },
  'aegis-avenger-warlock':     { wiki: 'Avenger_Warlock',        url: null },
  'aegis-gladius':             { wiki: 'Gladius',                url: 'https://media.starcitizen.tools/0/0c/Gladius_-_Flying_away_from_world_through_debris.jpg' },
  'aegis-sabre':               { wiki: 'Sabre',                  url: null },
  'aegis-sabre-comet':         { wiki: 'Sabre_Comet',            url: null },
  'aegis-sabre-raven':         { wiki: 'Sabre_Raven',            url: null },
  'aegis-sabre-firebird':      { wiki: 'Sabre_Firebird',         url: null },
  'aegis-hammerhead':          { wiki: 'Hammerhead',             url: 'https://media.starcitizen.tools/c/c8/Ext_03_03-Min.png' },
  'aegis-redeemer':            { wiki: 'Redeemer',               url: null },
  'aegis-redeemer-gunship':    { wiki: 'Redeemer',               url: null },
  'aegis-vanguard-warden':     { wiki: 'Vanguard_Warden',        url: null },
  'aegis-vanguard-harbinger':  { wiki: 'Vanguard_Harbinger',     url: null },
  'aegis-vanguard-sentinel':   { wiki: 'Vanguard_Sentinel',      url: null },
  'aegis-vanguard-hoplite':    { wiki: 'Vanguard_Hoplite',       url: null },
  'aegis-eclipse':             { wiki: 'Eclipse',                url: null },
  'aegis-reclaimer':           { wiki: 'Reclaimer',              url: null },
  'aegis-vulcan':              { wiki: 'Vulcan',                 url: null },
  'aegis-nautilus':            { wiki: 'Nautilus',               url: null },
  'aegis-retaliator':          { wiki: 'Retaliator_Base',        url: null },
  'aegis-idris-p':             { wiki: 'Idris-P',                url: null },
  'aegis-javelin':             { wiki: 'Javelin',                url: null },

  // ANVIL AEROSPACE
  'anvil-carrack':             { wiki: 'Carrack',                url: 'https://media.starcitizen.tools/9/92/Carrack_over_microTech_3.8.png' },
  'anvil-f7c-hornet':          { wiki: 'F7C_Hornet',            url: null },
  'anvil-f7a-hornet-mk2':      { wiki: 'F7A_Hornet_Mk_II',      url: null },
  'anvil-f7c-m-super-hornet-mk2': { wiki: 'F7C-M_Super_Hornet_Mk_II', url: null },
  'anvil-f8c-lightning':       { wiki: 'F8C_Lightning',          url: null },
  'anvil-hawk':                { wiki: 'Hawk',                   url: null },
  'anvil-arrow':               { wiki: 'Arrow',                  url: null },
  'anvil-hurricane':           { wiki: 'Hurricane',              url: null },
  'anvil-terrapin':            { wiki: 'Terrapin',               url: null },
  'anvil-valkyrie':            { wiki: 'Valkyrie',               url: null },
  'anvil-liberator':           { wiki: 'Liberator',              url: null },
  'anvil-gladiator':           { wiki: 'Gladiator',              url: null },
  'anvil-c8-pisces':           { wiki: 'C8_Pisces',              url: null },
  'anvil-c8x-pisces':          { wiki: 'C8X_Pisces_Expedition',  url: null },
  'anvil-asgard':              { wiki: 'Asgard',                 url: null },
  'anvil-paladin':             { wiki: 'Paladin',                url: null },

  // DRAKE INTERPLANETARY
  'drake-cutlass-black':       { wiki: 'Cutlass_Black',          url: 'https://media.starcitizen.tools/9/96/Cutlass_Black_in_space_-_Port.jpg' },
  'drake-cutlass-blue':        { wiki: 'Cutlass_Blue',           url: null },
  'drake-cutlass-red':         { wiki: 'Cutlass_Red',            url: null },
  'drake-cutlass-steel':       { wiki: 'Cutlass_Steel',          url: null },
  'drake-caterpillar':         { wiki: 'Caterpillar',            url: null },
  'drake-vulture':             { wiki: 'Vulture',                url: null },
  'drake-herald':              { wiki: 'Herald',                 url: null },
  'drake-buccaneer':           { wiki: 'Buccaneer',              url: null },
  'drake-corsair':             { wiki: 'Corsair',                url: null },
  'drake-cutter':              { wiki: 'Cutter',                 url: null },
  'drake-cutter-scout':        { wiki: 'Cutter_Scout',           url: null },
  'drake-dragonfly':           { wiki: 'Dragonfly',              url: null },
  'drake-kraken':              { wiki: 'Kraken',                 url: null },
  'drake-mule':                { wiki: 'Mule',                   url: null },
  'drake-ironclad':            { wiki: 'Ironclad',               url: null },
  'drake-clipper':             { wiki: 'Clipper',                url: null },
  'drake-golem':               { wiki: 'Golem',                  url: null },

  // MISC
  'misc-prospector':           { wiki: 'Prospector',             url: 'https://media.starcitizen.tools/d/dd/Prospector_-_Hovering_mining_on_cliffside_1.jpg' },
  'misc-freelancer':           { wiki: 'Freelancer',             url: null },
  'misc-freelancer-max':       { wiki: 'Freelancer_MAX',         url: null },
  'misc-freelancer-dur':       { wiki: 'Freelancer_DUR',         url: null },
  'misc-freelancer-mis':       { wiki: 'Freelancer_MIS',         url: null },
  'misc-starfarer':            { wiki: 'Starfarer',              url: null },
  'misc-starfarer-gemini':     { wiki: 'Starfarer_Gemini',       url: null },
  'misc-starlancer':           { wiki: 'Starlancer_Base',        url: null },
  'misc-starlancer-max':       { wiki: 'Starlancer_MAX',         url: null },
  'misc-starlancer-tac':       { wiki: 'Starlancer_TAC',         url: null },
  'misc-reliant-kore':         { wiki: 'Reliant_Kore',           url: null },
  'misc-reliant-mako':         { wiki: 'Reliant_Mako',           url: null },
  'misc-reliant-sen':          { wiki: 'Reliant_Sen',            url: null },
  'misc-reliant-tana':         { wiki: 'Reliant_Tana',           url: null },
  'misc-hull-a':               { wiki: 'Hull_A',                 url: null },
  'misc-hull-b':               { wiki: 'Hull_B',                 url: null },
  'misc-hull-c':               { wiki: 'Hull_C',                 url: null },
  'misc-hull-d':               { wiki: 'Hull_D',                 url: null },
  'misc-hull-e':               { wiki: 'Hull_E',                 url: null },
  'misc-mercury-star-runner':  { wiki: 'Mercury_Star_Runner',    url: null },
  'misc-expanse-surveyor':     { wiki: 'Expanse',                url: null },
  'misc-fortune':              { wiki: 'Fortune',                url: null },

  // RSI
  'rsi-aurora-mr':             { wiki: 'Aurora_MR',              url: 'https://media.starcitizen.tools/d/d4/Aurora_MR_flying_above_world_-_Crop.png' },
  'rsi-constellation-andromeda': { wiki: 'Constellation_Andromeda', url: 'https://media.starcitizen.tools/d/d7/Andromeda_flying_from_Station_-_Front_Starboard.jpg' },
  'rsi-constellation-aquila':  { wiki: 'Constellation_Aquila',   url: null },
  'rsi-constellation-taurus':  { wiki: 'Constellation_Taurus',   url: null },
  'rsi-mantis':                { wiki: 'Mantis',                 url: null },
  'rsi-perseus':               { wiki: 'Perseus',                url: null },
  'rsi-polaris':               { wiki: 'Polaris',                url: null },
  'rsi-scorpius':              { wiki: 'Scorpius',               url: null },
  'rsi-zeus-mk2-cl':           { wiki: 'Zeus_Mk_II_CL',          url: null },
  'rsi-meteor':                { wiki: 'Meteor',                 url: null },
  'rsi-salvation':             { wiki: 'Salvation',              url: null },
  'rsi-ursa-medivac':          { wiki: 'Ursa_Medivac',           url: null },
  'rsi-orion-rsi':             { wiki: 'Orion',                  url: null },

  // CRUSADER INDUSTRIES
  'crusader-hercules-c2':      { wiki: 'C2_Hercules',            url: null },
  'crusader-hercules-m2':      { wiki: 'M2_Hercules',            url: null },
  'crusader-hercules-a2':      { wiki: 'A2_Hercules',            url: null },
  'crusader-ares-inferno':     { wiki: 'Ares_Inferno',           url: null },
  'crusader-ares-ion':         { wiki: 'Ares_Ion',               url: null },
  'crusader-c1-spirit':        { wiki: 'C1_Spirit',              url: null },
  'crusader-e1-spirit':        { wiki: 'E1_Spirit',              url: null },
  'crusader-a1-spirit':        { wiki: 'A1_Spirit',              url: null },
  'crusader-genesis-emerald':  { wiki: 'Genesis_Starliner',      url: null },
  'crusader-intrepid':         { wiki: 'Intrepid',               url: null },

  // ORIGIN JUMPWORKS
  'origin-890-jump':           { wiki: '890_Jump',               url: null },
  'origin-300i':               { wiki: '300i',                   url: null },
  'origin-400i':               { wiki: '400i',                   url: null },
  'origin-600i':               { wiki: '600i_Explorer',          url: null },
  'origin-600i-touring':       { wiki: '600i_Touring',           url: null },
  'origin-600i-exploration':   { wiki: '600i_Exploration',       url: null },
  'origin-m50':                { wiki: 'm50_Interceptor',        url: null },

  // ARGO ASTRONAUTICS
  'argo-mole':                 { wiki: 'MOLE',                   url: null },
  'argo-raft':                 { wiki: 'RAFT',                   url: null },
  'argo-moth':                 { wiki: 'Moth',                   url: null },
  'argo-csv':                  { wiki: 'CSV-SM',                 url: null },

  // CONSOLIDATED OUTLAND
  'cnou-mustang-alpha':        { wiki: 'Mustang_Alpha',          url: null },
  'cnou-mustang-beta':         { wiki: 'Mustang_Beta',           url: null },
  'cnou-mustang-gamma':        { wiki: 'Mustang_Gamma',          url: null },
  'cnou-mustang-delta':        { wiki: 'Mustang_Delta',          url: null },
  'cnou-mustang-omega':        { wiki: 'Mustang_Omega',          url: null },
  'cnou-nomad':                { wiki: 'Nomad',                  url: null },

  // TUMBRIL LAND SYSTEMS
  'tumbril-cyclone':           { wiki: 'Cyclone',                url: null },
  'tumbril-cyclone-aa':        { wiki: 'Cyclone-AA',             url: null },
  'tumbril-cyclone-mt':        { wiki: 'Cyclone-MT',             url: null },
  'tumbril-cyclone-rn':        { wiki: 'Cyclone-RN',             url: null },
  'tumbril-cyclone-tr':        { wiki: 'Cyclone-TR',             url: null },
  'tumbril-cyclone-rc':        { wiki: 'Cyclone-RC',             url: null },

  // ESPERIA
  'esperia-blade':             { wiki: 'Blade',                  url: null },
  'esperia-prowler':           { wiki: 'Prowler',                url: null },

  // BANU
  'banu-defender':             { wiki: 'Banu_Defender',          url: null },
  'banu-merchantman':          { wiki: 'Banu_Merchantman',       url: null },
  'banu-merchantman-gold':     { wiki: 'Banu_Merchantman_Gold',  url: null },

  // GATAC MANUFACTURE
  'gatac-railen':              { wiki: 'Railen',                 url: null },

  // AOPOA
  'aopoa-santok-yai':          { wiki: 'Santok.Yāi',            url: null },

  // MIRAI
  'mirai-fury-mx':             { wiki: 'Fury_MX',               url: null },
  'mirai-guardian':            { wiki: 'Guardian',               url: null },
  'mirai-guardian-es':         { wiki: 'Guardian_ES',            url: null },
  'mirai-pulse':               { wiki: 'Pulse',                  url: null },

  // KRUGER INTERGALACTIC
  'kruger-p52-merlin':         { wiki: 'P-52_Merlin',            url: null },
  'kruger-p72-archimedes':     { wiki: 'P-72_Archimedes',        url: null },
  'kruger-wolf':               { wiki: 'Wolf',                   url: null },
  'kruger-alpha-wolf':         { wiki: 'Alpha_Wolf',             url: null },
};

// ============================================================
// VEHICLES MAP : ID dataset → Nom de page wiki
// ============================================================

const VEHICLES_MAP = {
  // TUMBRIL LAND SYSTEMS
  'cyclone':                    { wiki: 'Cyclone',               url: null },
  'cyclone-aa':                 { wiki: 'Cyclone_AA',            url: null },
  'cyclone-rc':                 { wiki: 'Cyclone_RC',            url: null },
  'cyclone-rn':                 { wiki: 'Cyclone_RN',            url: null },
  'cyclone-tr':                 { wiki: 'Cyclone_TR',            url: null },
  'storm':                      { wiki: 'Storm',                 url: null },
  'nova':                       { wiki: 'Nova_Tank',             url: null },
  'ranger-rc':                  { wiki: 'Ranger_RC',             url: null },
  'ranger-cv':                  { wiki: 'Ranger_CV',             url: null },
  'ranger-tr':                  { wiki: 'Ranger_TR',             url: null },
  // GREYCAT INDUSTRIAL
  'ptv':                        { wiki: 'PTV',                   url: null },
  'stv':                        { wiki: 'STV',                   url: null },
  'roc':                        { wiki: 'ROC',                   url: null },
  'roc-ds':                     { wiki: 'ROC-DS',                url: null },
  'ballista':                   { wiki: 'Ballista',              url: null },
  // DRAKE INTERPLANETARY
  'dragonfly':                  { wiki: 'Dragonfly',             url: null },
  'dragonfly-yellowjacket':     { wiki: 'Dragonfly_Yellow_Jacket', url: null },
  'dragonfly-black':            { wiki: 'Dragonfly_Black',       url: null },
  // ORIGIN JUMPWORKS
  'x1':                         { wiki: 'X1',                    url: null },
  'x1-force':                   { wiki: 'X1_Force',              url: null },
  'x1-velocity':                { wiki: 'X1_Velocity',           url: null },
  // AOPOA
  'nox':                        { wiki: 'Nox',                   url: null },
  'nox-kue':                    { wiki: 'Nox_Kue',               url: null },
  // RSI
  'ursa-rover':                 { wiki: 'Ursa_Rover',            url: null },
  'ursa-fortuna':               { wiki: 'Ursa_Rover_Fortuna',    url: null },
  // ARGO ASTRONAUTICS
  'mpuv-cargo':                 { wiki: 'MPUV_Cargo',            url: null },
  'mpuv-personnel':             { wiki: 'MPUV_Personnel',        url: null },
  // CONSOLIDATED OUTLAND
  'hoverquad':                  { wiki: 'HoverQuad',             url: null },
};

// ============================================================
// MANUFACTURERS MAP : ID dataset → Nom de page wiki
// ============================================================

const MANUFACTURERS_MAP = {
  'anvil':                      { wiki: 'Anvil_Aerospace',                url: null },
  'aegis':                      { wiki: 'Aegis_Dynamics',                 url: null },
  'drake':                      { wiki: 'Drake_Interplanetary',           url: null },
  'rsi':                        { wiki: 'Roberts_Space_Industries',       url: null },
  'origin':                     { wiki: 'Origin_Jumpworks',               url: null },
  'crusader':                   { wiki: 'Crusader_Industries',            url: null },
  'misc':                       { wiki: 'Musashi_Industrial_and_Starflight_Concern', url: null },
  'argo':                       { wiki: 'Argo_Astronautics',              url: null },
  'banu':                       { wiki: 'Banu',                           url: null },
  'esperia':                    { wiki: 'Esperia',                        url: null },
  'gatac':                      { wiki: 'Gatac_Manufacture',              url: null },
  'kruger':                     { wiki: 'Kruger_Intergalactic',           url: null },
  'consolidated-outland':       { wiki: 'Consolidated_Outland',           url: null },
  'tumbril':                    { wiki: 'Tumbril_Land_Systems',           url: null },
  'aopoa':                      { wiki: 'Aopoa',                          url: null },
  'mirai':                      { wiki: 'Mirai',                          url: null },
  'greycat':                    { wiki: 'Greycat_Industrial',             url: null },
};

// ============================================================
// FACTIONS MAP : ID dataset → Nom de page wiki
// ============================================================

const FACTIONS_MAP = {
  // Gouvernemental / Militaire UEE
  'uee':                        { wiki: 'United_Empire_of_Earth',         url: null },
  'uee-navy':                   { wiki: 'UEE_Navy',                       url: null },
  'advocacy':                   { wiki: 'Advocacy',                       url: null },
  'bounty-hunters-guild':       { wiki: 'Bounty_Hunters_Guild',           url: null },
  'mercenary-guild':            { wiki: 'Mercenary_Guild',                url: null },
  'klescher':                   { wiki: 'Klescher_Rehabilitation_Facility', url: null },
  // Sécurité corporative
  'hurston-security':           { wiki: 'Hurston_Security',               url: null },
  'crusader-security':          { wiki: 'Crusader_Security',              url: null },
  'mt-protection':              { wiki: 'MicroTech_Protection_Service',   url: null },
  // Corporations
  'hurston-dynamics':           { wiki: 'Hurston_Dynamics',               url: null },
  'arccorp':                    { wiki: 'ArcCorp',                        url: null },
  'crusader-industries':        { wiki: 'Crusader_Industries',            url: null },
  'microtech':                  { wiki: 'microTech',                      url: null },
  'shubin-interstellar':        { wiki: 'Shubin_Interstellar',            url: null },
  'covalex':                    { wiki: 'Covalex',                        url: null },
  'rayari':                     { wiki: 'Rayari',                         url: null },
  'highpoint':                  { wiki: 'Highpoint',                      url: null },
  'reclamation-services':       { wiki: 'Reclamation_and_Disposal',       url: null },
  // Criminel
  'nine-tails':                 { wiki: 'Nine_Tails',                     url: null },
  'xenothreat':                 { wiki: 'XenoThreat',                     url: null },
  'dead-saints':                { wiki: 'Dead_Saints',                    url: null },
  'headhunters':                { wiki: 'Headhunters',                    url: null },
  'dusters':                    { wiki: 'Dusters',                        url: null },
  'rough-ready':                { wiki: 'Rough_and_Ready',                url: null },
  'enos':                       { wiki: 'Enos_Crime_Syndicate',           url: null },
  // Alien
  'vanduul':                    { wiki: 'Vanduul',                        url: null },
  'xian':                       { wiki: "Xi'an",                          url: null },
  'banu':                       { wiki: 'Banu_Protectorate',              url: null },
  // Sécurité privée
  'blacjac-security':           { wiki: 'Blackjack_Security',             url: null },
  'northrock-service-group':    { wiki: 'Northrock_Service_Group',        url: null },
  'eckhart-security':           { wiki: 'Eckhart_Security',               url: null },
  'foxwell-enforcement':        { wiki: 'Foxwell_Enforcement',            url: null },
  'intersec':                   { wiki: 'Intersec',                       url: null },
  // Autres criminels / gangs
  'fire-rats':                  { wiki: 'Fire_Rats',                      url: null },
  '73r-vipers':                 { wiki: '73r_Vipers',                     url: null },
  'otoni-syndicate':            { wiki: 'Otoni_Syndicate',                url: null },
  'ruto':                       { wiki: 'Ruto',                           url: null },
  'peoples-alliance':           { wiki: "People's_Alliance",              url: null },
  'citizens-for-prosperity':    { wiki: 'Citizens_for_Prosperity',        url: null },
  'interstellar-transport-guild': { wiki: 'Interstellar_Transport_Guild', url: null },
  'wildstar-racing':            { wiki: 'Wildstar_Racing',                url: null },
  'empire-syndicate':           { wiki: 'Empire_Syndicate',               url: null },
};

// ============================================================
// MINERALS MAP : ID dataset → Nom de page wiki
// ============================================================

const MINERALS_MAP = {
  // Minéraux Stanton
  'beryl':                      { wiki: 'Beryl',                          url: null },
  'hephaestanite':              { wiki: 'Hephaestanite',                  url: null },
  'borase':                     { wiki: 'Borase',                         url: null },
  'gold':                       { wiki: 'Gold',                           url: null },
  'laranite':                   { wiki: 'Laranite',                       url: null },
  'agricium':                   { wiki: 'Agricium',                       url: null },
  'taranite':                   { wiki: 'Taranite',                       url: null },
  'bexalite':                   { wiki: 'Bexalite',                       url: null },
  'quantanium':                 { wiki: 'Quantanium',                     url: null },
  // Minéraux Pyro
  'hadanite':                   { wiki: 'Hadanite',                       url: null },
  'aphorite':                   { wiki: 'Aphorite',                       url: null },
  'dolivine':                   { wiki: 'Dolivine',                       url: null },
  'janalite':                   { wiki: 'Janalite',                       url: null },
  'stileron':                   { wiki: 'Stileron',                       url: null },
  'riccite':                    { wiki: 'Riccite',                        url: null },
  'tin':                        { wiki: 'Tin',                            url: null },
  'feynmaline':                 { wiki: 'Feynmaline',                     url: null },
  'glacosite':                  { wiki: 'Glacosite',                      url: null },
  'beradon':                    { wiki: 'Beradon',                        url: null },
  'lindinium':                  { wiki: 'Lindinium',                      url: null },
  'savrilium':                  { wiki: 'Savrilium',                      url: null },
  'torite':                     { wiki: 'Torite',                         url: null },
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWikiImageUrl(wikiPageName) {
  /**
   * Récupère l'URL de l'image principale d'une page wiki starcitizen.tools
   * via l'API MediaWiki : action=query&prop=pageimages&piprop=original
   */
  const apiUrl = `https://starcitizen.tools/api.php?action=query&titles=${encodeURIComponent(wikiPageName)}&prop=pageimages&piprop=original&format=json&origin=*`;

  try {
    // Utiliser curl pour éviter les problèmes de redirect JS
    const result = execSync(
      `curl -s -L --max-time 15 --user-agent "Mozilla/5.0 SC-Companion-Bot/1.0" "${apiUrl}"`,
      { encoding: 'utf8', timeout: 20000 }
    );
    const data = JSON.parse(result);
    const pages = data?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    if (page?.original?.source) return page.original.source;
    return null;
  } catch (e) {
    return null;
  }
}

async function downloadImage(url, destPath, retries = MAX_RETRIES) {
  /**
   * Télécharge une image depuis url vers destPath
   * Si c'est un PNG, le convertit en JPG via ffmpeg
   */
  const isMissingJpg = destPath.endsWith('.jpg') || destPath.endsWith('.jpeg');
  const isPng = url.toLowerCase().includes('.png');
  const isWebp = url.toLowerCase().includes('.webp');

  // Destination temporaire si on doit convertir
  let tmpPath = destPath;
  if (isPng && isMissingJpg) {
    tmpPath = destPath.replace(/\.jpe?g$/, '_tmp.png');
  } else if (isWebp && isMissingJpg) {
    tmpPath = destPath.replace(/\.jpe?g$/, '_tmp.webp');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const curlCmd = `curl -s -L --max-time 30 --user-agent "Mozilla/5.0 SC-Companion-Bot/1.0" -o "${tmpPath}" "${url}" -w "%{http_code}"`;
      const httpCode = execSync(curlCmd, { encoding: 'utf8', timeout: 35000 }).trim();

      if (httpCode !== '200') {
        if (attempt < retries) {
          await sleep(2000);
          continue;
        }
        return { success: false, error: `HTTP ${httpCode}` };
      }

      // Conversion PNG/WEBP → JPG si nécessaire
      if (tmpPath !== destPath) {
        try {
          execSync(
            `ffmpeg -i "${tmpPath}" -vf "scale=min(1920\\,iw):-1" -q:v 3 "${destPath}" -y -update 1`,
            { encoding: 'utf8', timeout: 30000, stdio: 'pipe' }
          );
          unlinkSync(tmpPath); // supprimer le fichier temporaire
        } catch (convErr) {
          // Si ffmpeg échoue, garder le PNG sous le bon nom
          try { unlinkSync(tmpPath); } catch {}
          return { success: false, error: `Conversion failed: ${convErr.message}` };
        }
      }

      return { success: true };
    } catch (e) {
      if (attempt < retries) {
        await sleep(2000 * attempt);
      } else {
        return { success: false, error: e.message };
      }
    }
  }
}

// ============================================================
// TÉLÉCHARGEMENT PRINCIPAL
// ============================================================

async function downloadShips(limit = Infinity) {
  const outputDir = join(PUBLIC_DIR, 'ships');
  mkdirSync(outputDir, { recursive: true });

  const entries = Object.entries(SHIPS_MAP).slice(0, limit);
  let downloaded = 0, skipped = 0, failed = 0;
  const failures = [];

  console.log(`\n=== Téléchargement des images de vaisseaux (${entries.length} vaisseaux) ===\n`);

  for (const [shipId, { wiki, url }] of entries) {
    const destPath = join(outputDir, `${shipId}.jpg`);

    // Sauter si déjà présent
    if (existsSync(destPath)) {
      console.log(`  [SKIP] ${shipId} (déjà présent)`);
      skipped++;
      continue;
    }

    // Trouver l'URL à utiliser
    let imageUrl = url;

    if (!imageUrl) {
      // Interroger l'API wiki
      process.stdout.write(`  [FETCH] ${shipId} (wiki: ${wiki}) ... `);
      imageUrl = await fetchWikiImageUrl(wiki);
      if (!imageUrl) {
        console.log(`INTROUVABLE`);
        failures.push({ id: shipId, reason: 'URL introuvable sur wiki' });
        failed++;
        await sleep(DELAY_MS);
        continue;
      }
      console.log(`trouvé: ${imageUrl.split('/').pop()}`);
    } else {
      process.stdout.write(`  [DL]    ${shipId} ... `);
    }

    // Télécharger
    const result = await downloadImage(imageUrl, destPath);
    if (result.success) {
      console.log(`OK`);
      downloaded++;
    } else {
      console.log(`ECHEC: ${result.error}`);
      failures.push({ id: shipId, url: imageUrl, reason: result.error });
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n=== RÉSULTAT ===`);
  console.log(`  Téléchargés : ${downloaded}`);
  console.log(`  Ignorés     : ${skipped} (déjà présents)`);
  console.log(`  Échecs      : ${failed}`);

  if (failures.length > 0) {
    console.log(`\n=== ÉCHECS DÉTAILLÉS ===`);
    failures.forEach(f => console.log(`  - ${f.id}: ${f.reason}`));
  }
}

async function downloadCategory(categoryName, map, subDir, limit = Infinity) {
  const outputDir = join(PUBLIC_DIR, subDir);
  mkdirSync(outputDir, { recursive: true });

  const entries = Object.entries(map).slice(0, limit);
  let downloaded = 0, skipped = 0, failed = 0;
  const failures = [];

  console.log(`\n=== Téléchargement des images "${categoryName}" (${entries.length} éléments) ===\n`);

  for (const [itemId, { wiki, url }] of entries) {
    const destPath = join(outputDir, `${itemId}.jpg`);

    // Sauter si déjà présent
    if (existsSync(destPath)) {
      console.log(`  [SKIP] ${itemId} (déjà présent)`);
      skipped++;
      continue;
    }

    // Trouver l'URL à utiliser
    let imageUrl = url;

    if (!imageUrl) {
      process.stdout.write(`  [FETCH] ${itemId} (wiki: ${wiki}) ... `);
      imageUrl = await fetchWikiImageUrl(wiki);
      if (!imageUrl) {
        console.log(`INTROUVABLE`);
        failures.push({ id: itemId, reason: 'URL introuvable sur wiki' });
        failed++;
        await sleep(DELAY_MS);
        continue;
      }
      console.log(`trouvé: ${imageUrl.split('/').pop()}`);
    } else {
      process.stdout.write(`  [DL]    ${itemId} ... `);
    }

    // Télécharger
    const result = await downloadImage(imageUrl, destPath);
    if (result.success) {
      console.log(`OK`);
      downloaded++;
    } else {
      console.log(`ECHEC: ${result.error}`);
      failures.push({ id: itemId, url: imageUrl, reason: result.error });
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n=== RÉSULTAT "${categoryName}" ===`);
  console.log(`  Téléchargés : ${downloaded}`);
  console.log(`  Ignorés     : ${skipped} (déjà présents)`);
  console.log(`  Échecs      : ${failed}`);

  if (failures.length > 0) {
    console.log(`\n=== ÉCHECS DÉTAILLÉS ===`);
    failures.forEach(f => console.log(`  - ${f.id}: ${f.reason}`));
  }
}

async function downloadVehicles(limit = Infinity) {
  return downloadCategory('Véhicules', VEHICLES_MAP, 'vehicles', limit);
}

async function downloadManufacturers(limit = Infinity) {
  return downloadCategory('Fabricants', MANUFACTURERS_MAP, 'manufacturers', limit);
}

async function downloadFactions(limit = Infinity) {
  return downloadCategory('Factions', FACTIONS_MAP, 'factions', limit);
}

async function downloadMinerals(limit = Infinity) {
  return downloadCategory('Minéraux', MINERALS_MAP, 'minerals', limit);
}

// ============================================================
// MAIN
// ============================================================

const args = process.argv.slice(2);
const category = args[0] || 'ships';
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

switch (category) {
  case 'ships':         await downloadShips(limit); break;
  case 'vehicles':      await downloadVehicles(limit); break;
  case 'manufacturers': await downloadManufacturers(limit); break;
  case 'factions':      await downloadFactions(limit); break;
  case 'minerals':      await downloadMinerals(limit); break;
  case 'all':
    await downloadShips(limit);
    await downloadVehicles(limit);
    await downloadManufacturers(limit);
    await downloadFactions(limit);
    await downloadMinerals(limit);
    break;
  default:
    console.log('Usage: node scripts/download-images.mjs [ships|vehicles|manufacturers|factions|minerals|all] [--limit=N]');
}
