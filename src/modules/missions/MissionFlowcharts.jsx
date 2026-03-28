import React, { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import {
  Target, Package, Gem, Search, Shield, AlertTriangle,
  ChevronDown, ChevronUp, ChevronRight, Lightbulb, Crosshair,
  Anchor, Pickaxe, HelpCircle, Heart, Swords, Info,
  Zap, Clock, Star, ArrowDown, Check,
} from 'lucide-react';

// ── Difficulty helpers ──────────────────────────────────────────────────────
const DIFF_BADGE = {
  Facile:    'badge-green',
  Moyen:     'badge-yellow',
  Difficile: 'badge-red',
  Extrême:   'badge-purple',
};

const RISK_COLORS = {
  Faible: 'text-green-400',
  Modéré: 'text-yellow-400',
  Élevé:  'text-orange-400',
  Critique: 'text-red-400',
};

// ── Mission type tabs ───────────────────────────────────────────────────────
const TABS = [
  { key: 'bounty',       label: 'Bounty',        Icon: Crosshair },
  { key: 'cargo',        label: 'Cargo',          Icon: Package },
  { key: 'mining',       label: 'Mining',         Icon: Pickaxe },
  { key: 'investigation',label: 'Investigation',  Icon: Search },
  { key: 'mercenary',    label: 'Mercenaire',     Icon: Swords },
  { key: 'rescue',       label: 'Sauvetage',      Icon: Heart },
];

// ── Flowchart data ──────────────────────────────────────────────────────────
const FLOWCHARTS = {
  bounty: {
    title: 'Chasse aux Primes',
    difficulty: 'Moyen',
    description: 'Traquez et éliminez des cibles recherchées dans tout Stanton et Pyro.',
    tips: [
      'Équipez toujours un tracker avant de partir en chasse.',
      'Les cibles VHRT fuient souvent en Quantum — interceptez-les tôt.',
      'Gardez un œil sur votre Crimestat : tuer le mauvais PNJ peut coûter cher.',
      'Les ERT nécessitent un vaisseau lourd ou un wingman.',
      'Utilisez les astéroïdes comme couverture contre les tourelles.',
      'Acceptez plusieurs bounties dans la même zone pour maximiser le revenu.',
    ],
    nodes: [
      { id: 1, title: 'Accepter le contrat', description: 'Prenez un contrat de bounty au terminal de mission ou via le MobiGlas.', conditions: 'Aucune condition spéciale', reward: '5 000 - 15 000 aUEC', risk: 'Faible', children: [2, 3] },
      { id: 2, title: 'Scanner la zone cible', description: 'Rendez-vous dans la zone indiquée et utilisez votre radar pour localiser la cible.', conditions: 'Vaisseau avec radar fonctionnel', reward: null, risk: 'Faible', children: [4] },
      { id: 3, title: 'Appeler des renforts', description: 'Recrutez un wingman si la cible est classée VHRT ou ERT.', conditions: 'Groupe de 2+ joueurs', reward: null, risk: 'Faible', children: [4] },
      { id: 4, title: 'Engager la cible', description: 'Approchez et ouvrez le feu. Ciblez d\'abord les boucliers puis les composants.', conditions: 'Armes chargées, missiles prêts', reward: null, risk: 'Élevé', children: [5, 6] },
      { id: 5, title: 'Cible éliminée', description: 'La cible est détruite. Confirmez le kill via le MobiGlas.', conditions: 'Cible confirmée détruite', reward: '15 000 - 90 000 aUEC', risk: 'Faible', children: [8] },
      { id: 6, title: 'La cible fuit en QT', description: 'La cible tente de s\'échapper via Quantum Travel.', conditions: null, reward: null, risk: 'Modéré', children: [7] },
      { id: 7, title: 'Poursuivre et intercepter', description: 'Suivez la signature QT ou attendez au prochain point de passage connu.', conditions: 'QT Drive rapide recommandé', reward: null, risk: 'Modéré', children: [4] },
      { id: 8, title: 'Collecter la récompense', description: 'Retournez en zone sûre pour encaisser la prime et gagner de la réputation.', conditions: 'Pas de Crimestat actif', reward: '+ Réputation faction', risk: 'Faible', children: [] },
      { id: 9, title: 'Bonus : Chaîne de contrats', description: 'Après 5 bounties réussies, des contrats VHRT/ERT se débloquent avec de meilleures récompenses.', conditions: 'Réputation suffisante', reward: '100 000+ aUEC', risk: 'Élevé', children: [] },
    ],
  },
  cargo: {
    title: 'Transport de Fret',
    difficulty: 'Facile',
    description: 'Achetez, transportez et revendez des marchandises entre stations.',
    tips: [
      'Vérifiez toujours les prix live avant d\'investir.',
      'Le Laranite et le Titanium offrent les meilleures marges.',
      'Ne transportez jamais plus de 50% de votre capital total.',
      'Évitez les routes passant par des zones PvP actives.',
      'Les cargos lents sont vulnérables — voyagez avec une escorte.',
      'Utilisez le Trade Planner du wiki pour optimiser vos routes.',
    ],
    nodes: [
      { id: 1, title: 'Choisir une route', description: 'Sélectionnez une route commerciale rentable via le Trade Planner ou les données live.', conditions: 'Capital de départ disponible', reward: null, risk: 'Faible', children: [2] },
      { id: 2, title: 'Acheter la marchandise', description: 'Rendez-vous au terminal de vente et achetez la cargaison souhaitée.', conditions: 'aUEC suffisants, SCU disponibles', reward: null, risk: 'Modéré', children: [3, 4] },
      { id: 3, title: 'Route directe', description: 'Empruntez la route la plus rapide vers la destination de vente.', conditions: 'Pas d\'interdiction en cours', reward: null, risk: 'Modéré', children: [6] },
      { id: 4, title: 'Route sécurisée', description: 'Passez par des waypoints sûrs pour éviter les zones de piraterie.', conditions: 'Temps supplémentaire', reward: null, risk: 'Faible', children: [6] },
      { id: 5, title: 'Embuscade pirate', description: 'Des pirates vous interceptent en route — combat ou fuite.', conditions: null, reward: null, risk: 'Critique', children: [6, 8] },
      { id: 6, title: 'Arrivée à destination', description: 'Atterrissez à la station cible et dirigez-vous vers le terminal de vente.', conditions: 'Pad disponible', reward: null, risk: 'Faible', children: [7] },
      { id: 7, title: 'Vendre la cargaison', description: 'Vendez au meilleur prix. Les terminaux ont un stock limité.', conditions: 'Demande suffisante au terminal', reward: '5 000 - 200 000 aUEC profit', risk: 'Faible', children: [9] },
      { id: 8, title: 'Perte de cargaison', description: 'Votre vaisseau est détruit avec la cargaison. Perte totale de l\'investissement.', conditions: null, reward: 'Perte totale', risk: 'Critique', children: [] },
      { id: 9, title: 'Réinvestir les profits', description: 'Utilisez vos gains pour acheter une plus grande cargaison ou upgrader votre vaisseau.', conditions: 'Profit réalisé', reward: 'Croissance exponentielle', risk: 'Faible', children: [] },
    ],
  },
  mining: {
    title: 'Minage',
    difficulty: 'Moyen',
    description: 'Explorez, scannez et minez des ressources précieuses dans l\'espace ou au sol.',
    tips: [
      'Le Quantanium est très rentable mais explose après 15 minutes.',
      'Utilisez le module Surge pour les roches résistantes.',
      'Les hand-mining tools fonctionnent bien pour le Hadanite en grotte.',
      'Vérifiez la composition avant de miner — visez 15%+ de concentration.',
      'Les ceintures d\'astéroïdes d\'Aaron Halo sont riches en minerai.',
      'Un Prospector avec un laser Lancet MH1 est le meilleur début.',
    ],
    nodes: [
      { id: 1, title: 'Choisir le type de minage', description: 'Décidez entre minage spatial (astéroïdes) ou minage au sol (planètes/lunes).', conditions: 'Vaisseau mineur ou outil FPS', reward: null, risk: 'Faible', children: [2, 3] },
      { id: 2, title: 'Minage spatial', description: 'Dirigez-vous vers une ceinture d\'astéroïdes et scannez les roches.', conditions: 'Prospector, MOLE, ou Orion', reward: null, risk: 'Modéré', children: [4] },
      { id: 3, title: 'Minage FPS au sol', description: 'Atterrissez sur une lune et cherchez des dépôts de surface avec le scanner.', conditions: 'Outil de minage FPS', reward: null, risk: 'Faible', children: [5] },
      { id: 4, title: 'Scanner et analyser', description: 'Utilisez le scan minier pour identifier la composition et la résistance des roches.', conditions: 'Laser minier compatible', reward: null, risk: 'Faible', children: [6, 7] },
      { id: 5, title: 'Extraire les gemmes', description: 'Minez les dépôts de Hadanite, Aphorite ou Dolivine manuellement.', conditions: 'Sac à dos avec espace', reward: '10 000 - 40 000 aUEC', risk: 'Faible', children: [10] },
      { id: 6, title: 'Fracturer la roche', description: 'Appliquez le laser à la bonne puissance pour fracturer sans exploser.', conditions: 'Maîtrise du sweet spot', reward: null, risk: 'Modéré', children: [8] },
      { id: 7, title: 'Roche instable — Quantanium', description: 'Le Quantanium détecté ! Attention : timer de 15 min après extraction.', conditions: 'Rapidité absolue requise', reward: '100 000 - 275 000 aUEC', risk: 'Élevé', children: [8] },
      { id: 8, title: 'Collecter les fragments', description: 'Aspirez les fragments riches en minerai avec le mode extraction.', conditions: 'Sacs de stockage disponibles', reward: null, risk: 'Faible', children: [9] },
      { id: 9, title: 'Raffiner à la station', description: 'Apportez le minerai brut à une raffinerie et lancez un job de raffinage.', conditions: 'Station avec raffinerie', reward: 'Variable selon méthode', risk: 'Faible', children: [10] },
      { id: 10, title: 'Vendre le minerai raffiné', description: 'Récupérez le minerai raffiné et vendez-le au meilleur prix.', conditions: 'Job de raffinage terminé', reward: '50 000 - 300 000 aUEC', risk: 'Faible', children: [] },
    ],
  },
  investigation: {
    title: 'Investigation',
    difficulty: 'Difficile',
    description: 'Enquêtez sur des mystères, récupérez des données et résolvez des énigmes.',
    tips: [
      'Lisez attentivement chaque indice — les détails comptent.',
      'Les épaves peuvent contenir des boîtes noires précieuses.',
      'Emportez un MultiTool avec un tractor beam pour déplacer les objets.',
      'Les missions d\'enquête sont souvent liées aux lore events.',
      'Certains indices ne sont visibles qu\'avec le scanner en mode actif.',
      'Prenez des screenshots des indices pour vous y référer plus tard.',
    ],
    nodes: [
      { id: 1, title: 'Recevoir le briefing', description: 'Acceptez la mission d\'investigation et lisez le dossier complet.', conditions: 'Réputation suffisante', reward: '5 000 aUEC avance', risk: 'Faible', children: [2] },
      { id: 2, title: 'Se rendre sur le site', description: 'Voyagez jusqu\'au lieu de l\'enquête (épave, station, planète).', conditions: 'Coordonnées connues', reward: null, risk: 'Modéré', children: [3, 4] },
      { id: 3, title: 'Explorer l\'épave', description: 'Entrez dans l\'épave, cherchez des terminaux actifs et des boîtes noires.', conditions: 'Lampe torche, armure EVA', reward: null, risk: 'Élevé', children: [5, 6] },
      { id: 4, title: 'Interroger des PNJ', description: 'Parlez aux témoins ou contacts dans les stations proches.', conditions: 'Dialogue disponible', reward: null, risk: 'Faible', children: [5] },
      { id: 5, title: 'Analyser les indices', description: 'Comparez les données récupérées pour identifier un pattern.', conditions: 'Minimum 2 indices trouvés', reward: null, risk: 'Faible', children: [7, 8] },
      { id: 6, title: 'Piège détecté !', description: 'Le site est piégé — des hostiles apparaissent.', conditions: null, reward: null, risk: 'Critique', children: [7] },
      { id: 7, title: 'Piste principale', description: 'Suivez la piste vers le responsable ou le lieu clé.', conditions: 'Indices cohérents', reward: null, risk: 'Modéré', children: [9] },
      { id: 8, title: 'Fausse piste', description: 'L\'indice mène à un cul-de-sac. Retournez chercher plus d\'éléments.', conditions: null, reward: null, risk: 'Faible', children: [3] },
      { id: 9, title: 'Confrontation finale', description: 'Affrontez ou arrêtez le suspect. Choix moral possible.', conditions: 'Preuve suffisante', reward: null, risk: 'Élevé', children: [10, 11] },
      { id: 10, title: 'Rapport complet', description: 'Soumettez toutes les preuves pour la récompense maximale.', conditions: 'Tous les indices collectés', reward: '50 000 - 120 000 aUEC', risk: 'Faible', children: [] },
      { id: 11, title: 'Rapport partiel', description: 'Soumettez un rapport incomplet pour une récompense réduite.', conditions: 'Au moins 1 preuve', reward: '15 000 - 40 000 aUEC', risk: 'Faible', children: [] },
    ],
  },
  mercenary: {
    title: 'Mercenaire',
    difficulty: 'Difficile',
    description: 'Missions de combat au sol : bunkers, stations orbitales, et opérations militaires.',
    tips: [
      'Emportez toujours des medpens et un medigun.',
      'Les bunkers Tier 3+ ont des ennemis lourdement armés.',
      'Vérifiez vos armes FPS avant d\'entrer — les munitions sont limitées.',
      'Les tourelles de défense peuvent vous cibler par erreur.',
      'Travaillez en équipe pour les missions de haute difficulté.',
      'Pillage des corps ennemis = armes et armures gratuites.',
    ],
    nodes: [
      { id: 1, title: 'Accepter le contrat mercenaire', description: 'Choisissez un contrat depuis le MobiGlas — bunker, défense, ou assaut.', conditions: 'Équipement FPS complet', reward: '8 000 - 25 000 aUEC', risk: 'Modéré', children: [2, 3] },
      { id: 2, title: 'Mission Bunker', description: 'Nettoyez un bunker souterrain occupé par des hostiles.', conditions: 'Armure medium+, arme longue', reward: null, risk: 'Élevé', children: [4] },
      { id: 3, title: 'Défense de station', description: 'Protégez une station contre des vagues d\'attaquants.', conditions: 'Groupe recommandé', reward: null, risk: 'Élevé', children: [5] },
      { id: 4, title: 'Infiltrer le bunker', description: 'Descendez prudemment, vérifiez chaque coin. Les ennemis utilisent la couverture.', conditions: 'Lampe + grenades utiles', reward: null, risk: 'Élevé', children: [6, 7] },
      { id: 5, title: 'Tenir la position', description: 'Fortifiez-vous et repoussez les vagues d\'ennemis pendant le timer.', conditions: 'Munitions suffisantes', reward: null, risk: 'Élevé', children: [9] },
      { id: 6, title: 'Zone sécurisée', description: 'Vous avez nettoyé un étage — progressez vers l\'objectif.', conditions: 'Tous hostiles éliminés', reward: null, risk: 'Modéré', children: [8] },
      { id: 7, title: 'Blessé — se soigner', description: 'Vous avez pris des dégâts. Utilisez un medpen ou medigun.', conditions: 'Medpen disponible', reward: null, risk: 'Critique', children: [6] },
      { id: 8, title: 'Objectif atteint', description: 'Activez le terminal ou récupérez l\'objet de la mission.', conditions: 'Terminal accessible', reward: null, risk: 'Faible', children: [9] },
      { id: 9, title: 'Extraction', description: 'Quittez la zone et retournez à votre vaisseau. Attention aux renforts ennemis.', conditions: 'Chemin de retour dégagé', reward: null, risk: 'Modéré', children: [10] },
      { id: 10, title: 'Compléter et looter', description: 'Mission terminée. Pillez les corps pour des armes, armures et composants.', conditions: null, reward: '25 000 - 85 000 aUEC + loot', risk: 'Faible', children: [] },
    ],
  },
  rescue: {
    title: 'Sauvetage',
    difficulty: 'Moyen',
    description: 'Sauvez des pilotes échoués, soignez des blessés et escortez des civils.',
    tips: [
      'Emportez un medigun rechargé et des medpens de secours.',
      'Le Cutlass Red est idéal avec ses lits médicaux.',
      'Les balises de détresse peuvent être des pièges PvP.',
      'Communiquez avec la victime par chat avant d\'approcher.',
      'Les missions Medical Evacuation donnent beaucoup de réputation.',
      'Gardez votre vaisseau moteur allumé pour une extraction rapide.',
    ],
    nodes: [
      { id: 1, title: 'Détecter la balise de détresse', description: 'Repérez un signal de détresse sur votre MobiGlas ou acceptez un contrat de sauvetage.', conditions: 'Vaisseau avec lit médical recommandé', reward: null, risk: 'Faible', children: [2, 3] },
      { id: 2, title: 'Approche prudente', description: 'Scannez la zone avant d\'approcher — vérifiez les menaces potentielles.', conditions: 'Radar actif', reward: null, risk: 'Modéré', children: [4, 5] },
      { id: 3, title: 'Contact radio', description: 'Établissez le contact avec la victime pour évaluer la situation.', conditions: 'Canal de communication', reward: null, risk: 'Faible', children: [4] },
      { id: 4, title: 'Localiser la victime', description: 'Trouvez le joueur ou PNJ dans l\'épave, sur la surface, ou en EVA.', conditions: 'Combinaison EVA si dans l\'espace', reward: null, risk: 'Modéré', children: [6, 7] },
      { id: 5, title: 'C\'est un piège !', description: 'Des hostiles vous attendent — combat ou fuite immédiate.', conditions: null, reward: null, risk: 'Critique', children: [4] },
      { id: 6, title: 'Soins sur place', description: 'Stabilisez la victime avec un medigun ou des medpens.', conditions: 'Medigun + medpens', reward: null, risk: 'Modéré', children: [8] },
      { id: 7, title: 'Victime inconsciente', description: 'La victime est incapacitée — portez-la jusqu\'à votre vaisseau.', conditions: 'Interaction de transport', reward: null, risk: 'Élevé', children: [8] },
      { id: 8, title: 'Évacuation médicale', description: 'Placez la victime dans un lit médical et stabilisez-la pendant le vol.', conditions: 'Lit médical T2+', reward: null, risk: 'Modéré', children: [9] },
      { id: 9, title: 'Livrer à l\'hôpital', description: 'Amenez la victime à la station médicale la plus proche.', conditions: 'Station avec clinique', reward: '20 000 - 60 000 aUEC', risk: 'Faible', children: [10] },
      { id: 10, title: 'Débriefing', description: 'Mission accomplie. Réputation médicale augmentée significativement.', conditions: 'Victime sauvée', reward: '+ Réputation majeure', risk: 'Faible', children: [] },
    ],
  },
};

// ── Helper: build tree structure ────────────────────────────────────────────
function buildTree(nodes) {
  const map = {};
  nodes.forEach(n => { map[n.id] = { ...n }; });
  return { map, root: nodes[0] };
}

// ── FlowNode component ─────────────────────────────────────────────────────
function FlowNode({ node, depth, isLast, selectedId, onSelect, nodesMap, expandedIds, visibleNodes }) {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const children = (node.children || []).map(cid => nodesMap[cid]).filter(Boolean);
  const hasChildren = children.length > 0;
  const isLeaf = !hasChildren;

  return (
    <div className="flex flex-col items-center">
      {/* Connector line from parent */}
      {depth > 0 && (
        <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/60 to-cyan-500/30" />
      )}

      {/* Node card */}
      <button
        onClick={() => onSelect(node.id)}
        className={clsx(
          'relative w-64 sm:w-72 rounded-lg border p-3 text-left transition-all duration-200',
          'hover:shadow-lg hover:shadow-cyan-500/10',
          isSelected
            ? 'border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/20'
            : 'border-space-600 bg-space-800/80 hover:border-cyan-500/40',
          isLeaf && 'border-dashed',
        )}
      >
        {/* Step number */}
        <div className={clsx(
          'absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
          isSelected ? 'bg-cyan-500 text-black' : 'bg-space-600 text-gray-300',
        )}>
          {node.id}
        </div>

        <div className="pl-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className={clsx(
              'text-sm font-semibold',
              isSelected ? 'text-cyan-300' : 'text-gray-200',
            )}>
              {node.title}
            </h4>
            {node.risk && (
              <span className={clsx('text-xs font-medium', RISK_COLORS[node.risk])}>
                {node.risk}
              </span>
            )}
          </div>

          {/* Short description always visible */}
          <p className="text-xs text-gray-400 line-clamp-2">{node.description}</p>

          {/* Expanded details */}
          {isSelected && (
            <div className="mt-2 pt-2 border-t border-space-600 space-y-1.5 animate-fadeIn">
              {node.conditions && (
                <div className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-300">{node.conditions}</span>
                </div>
              )}
              {node.reward && (
                <div className="flex items-start gap-1.5">
                  <Star className="w-3.5 h-3.5 text-gold-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gold-400 font-medium">{node.reward}</span>
                </div>
              )}
              {hasChildren && (
                <div className="flex items-center gap-1 text-xs text-cyan-400/70 mt-1">
                  <ArrowDown className="w-3 h-3" />
                  <span>{children.length} étape{children.length > 1 ? 's' : ''} suivante{children.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </button>

      {/* Children branch */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical line down */}
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/30 to-cyan-500/20" />

          {/* Branch connector for multiple children */}
          {children.length > 1 && (
            <div className="relative flex items-start">
              {/* Horizontal line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-cyan-500/30"
                style={{ width: `${(children.length - 1) * 300}px` }}
              />
            </div>
          )}

          {/* Render children */}
          <div className={clsx(
            'flex gap-4 sm:gap-6',
            children.length === 1 && 'flex-col items-center',
          )}>
            {children.map((child, idx) => (
              <FlowNode
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={idx === children.length - 1}
                selectedId={selectedId}
                onSelect={onSelect}
                nodesMap={nodesMap}
                expandedIds={expandedIds}
                visibleNodes={visibleNodes}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recommended path highlight ──────────────────────────────────────────────
function getRecommendedPath(nodes) {
  // Find the deepest path with best reward-to-risk ratio
  const path = [];
  let current = nodes[0];
  while (current) {
    path.push(current.id);
    const children = (current.children || []).map(cid => nodes.find(n => n.id === cid)).filter(Boolean);
    if (children.length === 0) break;
    // Prefer the first child (main path)
    current = children[0];
  }
  return new Set(path);
}

// ── Tips panel ──────────────────────────────────────────────────────────────
function TipsPanel({ tips, title }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="card-glow rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-space-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold-400" />
          <h3 className="text-sm font-semibold text-gold-300">Conseils — {title}</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-cyan-500 text-xs mt-0.5 flex-shrink-0">▸</span>
              <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Node detail panel ───────────────────────────────────────────────────────
function NodeDetail({ node, isRecommended }) {
  if (!node) return (
    <div className="card-glow p-6 flex flex-col items-center justify-center text-center h-48">
      <Info className="w-8 h-8 text-gray-500 mb-2" />
      <p className="text-sm text-gray-400">Cliquez sur une étape du flowchart pour voir les détails.</p>
    </div>
  );

  return (
    <div className="card-glow p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-300">{node.id}</span>
          </div>
          <h3 className="text-base font-semibold text-white">{node.title}</h3>
        </div>
        {isRecommended && (
          <span className="badge-cyan text-xs px-2 py-0.5 rounded-full">Recommandé</span>
        )}
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">{node.description}</p>

      <div className="grid grid-cols-2 gap-3">
        {node.conditions && (
          <div className="bg-space-800/60 rounded-lg p-2.5">
            <div className="text-xs text-gray-500 mb-1">Conditions</div>
            <div className="text-xs text-gray-200">{node.conditions}</div>
          </div>
        )}
        {node.reward && (
          <div className="bg-space-800/60 rounded-lg p-2.5">
            <div className="text-xs text-gray-500 mb-1">Récompense</div>
            <div className="text-xs text-gold-400 font-medium">{node.reward}</div>
          </div>
        )}
        {node.risk && (
          <div className="bg-space-800/60 rounded-lg p-2.5">
            <div className="text-xs text-gray-500 mb-1">Risque</div>
            <div className={clsx('text-xs font-medium', RISK_COLORS[node.risk])}>{node.risk}</div>
          </div>
        )}
        {node.children && (
          <div className="bg-space-800/60 rounded-lg p-2.5">
            <div className="text-xs text-gray-500 mb-1">Prochaines étapes</div>
            <div className="text-xs text-gray-200">
              {node.children.length === 0 ? 'Fin du parcours' : `${node.children.length} branche${node.children.length > 1 ? 's' : ''}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Flat flowchart view (mobile-friendly alternative) ───────────────────────
function FlatFlowView({ nodes, selectedId, onSelect, recommendedPath }) {
  return (
    <div className="space-y-2">
      {nodes.map((node, idx) => {
        const isSelected = selectedId === node.id;
        const isRec = recommendedPath.has(node.id);
        const isLeaf = !node.children || node.children.length === 0;

        return (
          <button
            key={node.id}
            onClick={() => onSelect(node.id)}
            className={clsx(
              'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
              isSelected
                ? 'border-cyan-400 bg-cyan-500/10'
                : isRec
                  ? 'border-cyan-500/30 bg-space-800/80'
                  : 'border-space-600 bg-space-800/50 hover:border-space-500',
            )}
          >
            {/* Step circle */}
            <div className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
              isSelected ? 'bg-cyan-500 text-black' : isRec ? 'bg-cyan-500/30 text-cyan-300' : 'bg-space-600 text-gray-400',
            )}>
              {node.id}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className={clsx('text-sm font-medium', isSelected ? 'text-cyan-300' : 'text-gray-200')}>
                  {node.title}
                </h4>
                {node.risk && (
                  <span className={clsx('text-xs flex-shrink-0', RISK_COLORS[node.risk])}>{node.risk}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{node.description}</p>

              {/* Branch arrows */}
              {node.children && node.children.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <ChevronRight className="w-3 h-3 text-cyan-500/50" />
                  <span className="text-xs text-gray-500">
                    Vers : {node.children.map(cid => {
                      const child = nodes.find(n => n.id === cid);
                      return child ? `#${cid}` : '';
                    }).join(', ')}
                  </span>
                </div>
              )}

              {/* Expanded details */}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-space-600 space-y-1">
                  {node.conditions && (
                    <div className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-300">{node.conditions}</span>
                    </div>
                  )}
                  {node.reward && (
                    <div className="flex items-start gap-1.5">
                      <Star className="w-3 h-3 text-gold-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gold-400">{node.reward}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isLeaf && (
              <span className="badge-green text-xs px-1.5 py-0.5 rounded flex-shrink-0">Fin</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function MissionFlowcharts() {
  const [activeTab, setActiveTab] = useState('bounty');
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'

  const flowchart = FLOWCHARTS[activeTab];
  const { map: nodesMap, root } = useMemo(() => buildTree(flowchart.nodes), [activeTab]);
  const recommendedPath = useMemo(() => getRecommendedPath(flowchart.nodes), [activeTab]);

  const selectedNodeData = selectedNode ? nodesMap[selectedNode] : null;

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    setSelectedNode(null);
  }, []);

  const handleNodeSelect = useCallback((id) => {
    setSelectedNode(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            Flowcharts de Missions
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Arbres de décision interactifs pour chaque type de mission
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 bg-space-800 border border-space-600 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tree')}
            className={clsx(
              'px-3 py-1.5 rounded text-xs font-medium transition-colors',
              viewMode === 'tree' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-gray-200',
            )}
          >
            Arbre
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'px-3 py-1.5 rounded text-xs font-medium transition-colors',
              viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-gray-200',
            )}
          >
            Liste
          </button>
        </div>
      </div>

      {/* Mission type tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
              activeTab === key
                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'border-space-600 bg-space-800/60 text-gray-400 hover:border-space-500 hover:text-gray-200',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Flowchart header */}
      <div className="card-glow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{flowchart.title}</h2>
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', DIFF_BADGE[flowchart.difficulty])}>
              {flowchart.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{flowchart.description}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{flowchart.nodes.length} étapes</span>
          <span>{flowchart.nodes.filter(n => !n.children || n.children.length === 0).length} fins possibles</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Flowchart area */}
        <div className="xl:col-span-2">
          {viewMode === 'tree' ? (
            <div className="card-glow p-6 overflow-x-auto">
              <div className="min-w-[600px] flex justify-center">
                <FlowNode
                  node={root}
                  depth={0}
                  isLast
                  selectedId={selectedNode}
                  onSelect={handleNodeSelect}
                  nodesMap={nodesMap}
                  expandedIds={recommendedPath}
                  visibleNodes={new Set(flowchart.nodes.map(n => n.id))}
                />
              </div>
            </div>
          ) : (
            <div className="card-glow p-4">
              <FlatFlowView
                nodes={flowchart.nodes}
                selectedId={selectedNode}
                onSelect={handleNodeSelect}
                recommendedPath={recommendedPath}
              />
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-500/50" /> Chemin recommandé
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-dashed border-space-500 bg-space-700" /> Fin de parcours
            </span>
            {Object.entries(RISK_COLORS).map(([label, cls]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={clsx('w-2 h-2 rounded-full', cls.replace('text-', 'bg-'))} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected node detail */}
          <NodeDetail
            node={selectedNodeData}
            isRecommended={selectedNode ? recommendedPath.has(selectedNode) : false}
          />

          {/* Tips */}
          <TipsPanel tips={flowchart.tips} title={flowchart.title} />

          {/* Quick stats */}
          <div className="card-glow p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Résumé rapide</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-space-800/60 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-cyan-400">{flowchart.nodes.length}</div>
                <div className="text-xs text-gray-500">Étapes</div>
              </div>
              <div className="bg-space-800/60 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-gold-400">
                  {flowchart.nodes.filter(n => n.children && n.children.length > 1).length}
                </div>
                <div className="text-xs text-gray-500">Décisions</div>
              </div>
              <div className="bg-space-800/60 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-green-400">
                  {flowchart.nodes.filter(n => !n.children || n.children.length === 0).length}
                </div>
                <div className="text-xs text-gray-500">Fins</div>
              </div>
              <div className="bg-space-800/60 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-red-400">
                  {flowchart.nodes.filter(n => n.risk === 'Critique' || n.risk === 'Élevé').length}
                </div>
                <div className="text-xs text-gray-500">Risqués</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
