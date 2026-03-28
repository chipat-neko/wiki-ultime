import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  Rocket, Navigation, Crosshair, Pickaxe, Users, ShoppingCart,
  Coins, BookOpen, ChevronLeft, ChevronRight, CheckCircle2,
  RotateCcw, Lightbulb, Trophy, Keyboard, HelpCircle, Star,
  ArrowRight, Shield, Compass,
} from 'lucide-react';

const STORAGE_KEY = 'sc_tutorial_progress';

const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentChapter: 0, completedChapters: [], quizScores: {} };
    return JSON.parse(raw);
  } catch { return { currentChapter: 0, completedChapters: [], quizScores: {} }; }
};

const saveProgress = (progress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

const CHAPTERS = [
  {
    id: 'welcome',
    title: 'Bienvenue dans le Verse',
    icon: Star,
    color: 'text-yellow-400',
    steps: [
      { title: 'Lancer le jeu', desc: 'Ouvrez le RSI Launcher, connectez-vous et lancez Star Citizen. Le chargement initial peut prendre plusieurs minutes.' },
      { title: 'Choisir un point de départ', desc: 'Lors de votre première connexion, choisissez une ville de départ : Lorville, Area 18, New Babbage ou Orison. Chacune a ses avantages.' },
      { title: 'Comprendre le HUD', desc: 'Votre HUD affiche la santé, le bouclier, la vitesse et le mode actif. Les marqueurs de mission apparaissent en bleu, les dangers en rouge.' },
      { title: 'Contrôles de base', desc: 'WASD pour se déplacer, Espace pour sauter, C pour s\'accroupir. Maintenez Shift pour sprinter. F pour interagir avec les objets.' },
      { title: 'Le mobiGlas', desc: 'Appuyez sur F1 pour ouvrir le mobiGlas : votre outil principal pour les missions, la carte, l\'inventaire et les communications.' },
    ],
    keybindings: [
      { key: 'F1', action: 'Ouvrir le mobiGlas' },
      { key: 'F2', action: 'Carte étoilaire' },
      { key: 'F4', action: 'Caméra 3ème personne' },
      { key: 'Tab', action: 'Scanner' },
    ],
    tip: 'Prenez le temps d\'explorer votre ville de départ. Familiarisez-vous avec les terminaux, les ascenseurs et les transports en commun avant de partir en mission.',
    quiz: [
      { q: 'Quelle touche ouvre le mobiGlas ?', options: ['F1', 'F2', 'Tab', 'M'], answer: 0 },
      { q: 'Combien de villes de départ sont disponibles ?', options: ['2', '3', '4', '6'], answer: 2 },
      { q: 'Quelle touche permet d\'interagir avec les objets ?', options: ['E', 'F', 'R', 'G'], answer: 1 },
    ],
    links: [{ label: 'Guide des contrôles', path: '/guides' }, { label: 'Systèmes stellaires', path: '/systemes' }],
  },
  {
    id: 'first-ship',
    title: 'Votre premier vaisseau',
    icon: Rocket,
    color: 'text-cyan-400',
    steps: [
      { title: 'Trouver un terminal de spawn', desc: 'Rendez-vous au spatioport de votre ville. Cherchez les terminaux ASOP (écrans bleus) pour récupérer votre vaisseau.' },
      { title: 'Réclamer votre vaisseau', desc: 'Sélectionnez votre vaisseau dans la liste et cliquez sur "Retrieve". Un pad d\'atterrissage vous sera assigné.' },
      { title: 'Monter à bord', desc: 'Approchez votre vaisseau et maintenez F pour voir les points d\'interaction. Entrez par la rampe ou l\'échelle selon le modèle.' },
      { title: 'Décollage', desc: 'Asseyez-vous au siège pilote, allumez les moteurs (I), activez les propulseurs (N) et décollez. Utilisez Espace pour monter.' },
      { title: 'Atterrissage', desc: 'Approchez lentement du pad, déployez le train d\'atterrissage (N) et descendez doucement. La vitesse doit être très faible pour éviter les dégâts.' },
    ],
    keybindings: [
      { key: 'I', action: 'Allumer/éteindre les moteurs' },
      { key: 'N', action: 'Train d\'atterrissage / VTOL' },
      { key: 'Espace', action: 'Monter (strafe up)' },
      { key: 'Ctrl', action: 'Descendre (strafe down)' },
    ],
    tip: 'Si votre vaisseau est détruit ou perdu, vous pouvez le réclamer à nouveau au terminal ASOP. L\'assurance couvre la récupération moyennant un délai et parfois un coût.',
    quiz: [
      { q: 'Quelle touche allume les moteurs du vaisseau ?', options: ['N', 'I', 'P', 'O'], answer: 1 },
      { q: 'Comment s\'appellent les terminaux de spawn ?', options: ['ASOP', 'MOBI', 'KIOSK', 'SHIP'], answer: 0 },
      { q: 'Que faut-il faire avant d\'atterrir ?', options: ['Éteindre les armes', 'Déployer le train d\'atterrissage', 'Couper les boucliers', 'Activer le scanner'], answer: 1 },
    ],
    links: [{ label: 'Base de vaisseaux', path: '/vaisseaux' }, { label: 'Gestionnaire de flotte', path: '/flotte' }],
  },
  {
    id: 'navigation',
    title: 'Navigation & Quantum Travel',
    icon: Navigation,
    color: 'text-blue-400',
    steps: [
      { title: 'Ouvrir la carte stellaire', desc: 'Appuyez sur F2 pour afficher la carte. Vous pouvez zoomer, dézoomer et naviguer entre les systèmes Stanton et Pyro.' },
      { title: 'Définir une destination', desc: 'Cliquez sur une destination (station, planète, lune) et sélectionnez "Set Route". Un marqueur QT apparaîtra sur votre HUD.' },
      { title: 'Activer le Quantum Drive', desc: 'Alignez votre vaisseau avec le marqueur QT (point bleu), maintenez B pour spooler puis relâchez pour sauter.' },
      { title: 'Gérer le carburant', desc: 'Le Quantum Fuel est limité. Vérifiez votre jauge avant chaque saut. Les vaisseaux légers consomment moins mais ont un réservoir plus petit.' },
      { title: 'Points de saut (Jump Points)', desc: 'Pour voyager entre systèmes (ex: Stanton → Pyro), utilisez les Jump Points. Ils nécessitent un alignement précis.' },
    ],
    keybindings: [
      { key: 'B', action: 'Quantum Travel (maintenir)' },
      { key: 'F2', action: 'Carte stellaire' },
      { key: 'Scroll', action: 'Zoom carte' },
      { key: 'B (tap)', action: 'Annuler le QT' },
    ],
    tip: 'Les temps de trajet en Quantum varient selon le QT Drive installé. Un Size 2 est plus rapide qu\'un Size 1. Consultez la page composants pour comparer.',
    quiz: [
      { q: 'Quelle touche active le Quantum Travel ?', options: ['Q', 'B', 'V', 'J'], answer: 1 },
      { q: 'Comment voyager entre Stanton et Pyro ?', options: ['QT direct', 'Jump Point', 'Trou de ver', 'Téléportation'], answer: 1 },
      { q: 'Que se passe-t-il si le carburant QT est vide ?', options: ['Le vaisseau explose', 'Impossible de sauter', 'Saut gratuit', 'Retour automatique'], answer: 1 },
    ],
    links: [{ label: 'Systèmes stellaires', path: '/systemes' }, { label: 'Optimiseur de route', path: '/routes' }],
  },
  {
    id: 'missions',
    title: 'Missions & aUEC',
    icon: Coins,
    color: 'text-yellow-300',
    steps: [
      { title: 'Ouvrir le journal de missions', desc: 'Via le mobiGlas (F1), allez dans l\'onglet Missions. Les contrats disponibles sont classés par catégorie et difficulté.' },
      { title: 'Types de missions', desc: 'Livraison, bounty hunting, investigation, minage sous contrat, sauvetage... Chaque type demande des compétences différentes.' },
      { title: 'Accepter une mission', desc: 'Lisez le briefing, vérifiez la récompense et la localisation, puis acceptez. La mission apparaîtra dans vos marqueurs HUD.' },
      { title: 'Compléter et être payé', desc: 'Suivez les objectifs marqués. Une fois terminé, les aUEC sont crédités automatiquement sur votre compte.' },
      { title: 'Réputation', desc: 'Compléter des missions augmente votre réputation auprès des donneurs d\'ordres, débloquant des missions mieux payées.' },
    ],
    keybindings: [
      { key: 'F1', action: 'mobiGlas → onglet Missions' },
      { key: '1-4', action: 'Marqueurs de mission' },
    ],
    tip: 'Les missions de livraison sont idéales pour débuter : faible risque, bonne paye, et vous apprenez à naviguer. Commencez par les missions à 1 étoile.',
    quiz: [
      { q: 'Comment accéder aux missions disponibles ?', options: ['Terminal ASOP', 'mobiGlas (F1)', 'Chat global', 'Menu pause'], answer: 1 },
      { q: 'Qu\'est-ce que les aUEC ?', options: ['Points d\'XP', 'Monnaie du jeu', 'Crédits réels', 'Score de réputation'], answer: 1 },
      { q: 'Quel type de mission est recommandé pour les débutants ?', options: ['Bounty S5', 'Livraison', 'Piraterie', 'Minage de Quantanium'], answer: 1 },
    ],
    links: [{ label: 'Missions', path: '/missions' }, { label: 'Réputation', path: '/reputation' }],
  },
  {
    id: 'trade',
    title: 'Commerce de base',
    icon: ShoppingCart,
    color: 'text-green-400',
    steps: [
      { title: 'Trouver un terminal de commerce', desc: 'Les stations et avant-postes ont des terminaux de commerce (Admin Office ou Trade terminals). Approchez et interagissez avec F.' },
      { title: 'Comprendre les prix', desc: 'Les prix d\'achat et de vente varient selon la station. Achetez là où c\'est pas cher, vendez là où c\'est plus cher.' },
      { title: 'Capacité cargo', desc: 'Votre vaisseau a une capacité cargo en SCU. Ne dépassez pas la limite. Les vaisseaux de commerce ont les plus grosses soutes.' },
      { title: 'Effectuer un trade run', desc: 'Achetez une commodité, voyagez vers la station de vente, et revendez. Le profit dépend du volume et de la marge.' },
      { title: 'Risques et illégalité', desc: 'Certaines marchandises sont illégales (SLAM, Neon, WiDoW). Leur transport est risqué mais lucratif. Attention aux scans de sécurité !' },
    ],
    keybindings: [
      { key: 'F', action: 'Interagir avec le terminal' },
      { key: 'F1 → Map', action: 'Localiser les stations' },
    ],
    tip: 'Commencez avec des commodités légales comme le Laranite ou le Titanium. Consultez le Trade Planner du wiki pour trouver les meilleures routes.',
    quiz: [
      { q: 'Que signifie SCU ?', options: ['Star Citizen Units', 'Standard Cargo Unit', 'Space Container Utility', 'Ship Cargo Upgrade'], answer: 1 },
      { q: 'Quel est le principe du commerce ?', options: ['Acheter cher, vendre pas cher', 'Acheter pas cher, vendre cher', 'Tout vendre au même prix', 'Ne vendre que de l\'illégal'], answer: 1 },
      { q: 'Quel risque existe avec les marchandises illégales ?', options: ['Perte de réputation uniquement', 'Amende et crime stat', 'Aucun risque', 'Ban du serveur'], answer: 1 },
    ],
    links: [{ label: 'Trade Planner', path: '/commerce' }, { label: 'Cargo Optimizer', path: '/cargo' }],
  },
  {
    id: 'combat',
    title: 'Combat 101',
    icon: Crosshair,
    color: 'text-red-400',
    steps: [
      { title: 'Les Master Modes', desc: 'Star Citizen utilise les Master Modes : NAV (voyage rapide, pas d\'armes) et SCM (combat, vitesse réduite). Basculez avec B.' },
      { title: 'Armes et groupes de tir', desc: 'Vos armes sont assignées à des groupes de tir. Bouton gauche pour le groupe 1, bouton droit pour le groupe 2. Personnalisez dans le menu armes.' },
      { title: 'Boucliers', desc: 'Vos boucliers absorbent les dégâts. Ils se rechargent automatiquement après un délai. Certains vaisseaux ont des boucliers directionnels.' },
      { title: 'Manœuvres évasives', desc: 'Utilisez les strafes (A/D/Espace/Ctrl) pour esquiver. Variez votre trajectoire. Un vaisseau prévisible est un vaisseau mort.' },
      { title: 'Contremesures', desc: 'Contre les missiles, utilisez les chaff (H) ou flares (G). Surveillez les alertes de verrouillage sur votre HUD.' },
    ],
    keybindings: [
      { key: 'LMB', action: 'Tir groupe 1' },
      { key: 'RMB', action: 'Tir groupe 2' },
      { key: 'G', action: 'Lancer un missile' },
      { key: 'H', action: 'Contremesures (chaff)' },
      { key: 'B', action: 'Basculer Master Mode' },
    ],
    tip: 'En combat, gérez votre énergie. Les armes energy ne consomment pas de munitions mais surchauffent. Les ballistic ont des munitions limitées mais percent mieux les boucliers.',
    quiz: [
      { q: 'Quel mode permet de combattre ?', options: ['NAV', 'SCM', 'QT', 'EVA'], answer: 1 },
      { q: 'À quoi servent les contremesures ?', options: ['Réparer les boucliers', 'Éviter les missiles', 'Booster la vitesse', 'Scanner les ennemis'], answer: 1 },
      { q: 'Quel est l\'avantage des armes ballistic ?', options: ['Pas de surchauffe', 'Meilleure pénétration bouclier', 'Tir infini', 'Portée illimitée'], answer: 1 },
    ],
    links: [{ label: 'Armes vaisseaux', path: '/armes-vaisseaux' }, { label: 'Composants', path: '/composants' }],
  },
  {
    id: 'mining',
    title: 'Minage & Crafting',
    icon: Pickaxe,
    color: 'text-orange-400',
    steps: [
      { title: 'Scanner les ressources', desc: 'En mode scanning (Tab), cherchez les dépôts minéraux. Les roches affichent leur composition et leur masse.' },
      { title: 'Choisir un vaisseau mineur', desc: 'Le Prospector (solo) ou le MOLE (multi-crew) sont les vaisseaux mineurs principaux. Le ROC est un véhicule mineur terrestre.' },
      { title: 'Extraire les minerais', desc: 'Visez la roche avec le laser mineur, maintenez la puissance dans la zone verte. Trop haut = explosion. Trop bas = rien ne se passe.' },
      { title: 'Raffinage', desc: 'Apportez vos minerais bruts à une station de raffinage (ex: CRU-L1). Choisissez une méthode et attendez le résultat.' },
      { title: 'Artisanat (Wikelo)', desc: 'Depuis l\'Alpha 4.5, le système Wikelo permet de crafter des composants avec des matériaux récoltés. Consultez les blueprints disponibles.' },
    ],
    keybindings: [
      { key: 'Tab', action: 'Mode scanning' },
      { key: 'LMB', action: 'Activer le laser mineur' },
      { key: 'Scroll', action: 'Ajuster la puissance du laser' },
    ],
    tip: 'Le Quantanium est le minerai le plus rentable mais il est instable — il explose si vous ne le vendez pas rapidement après extraction. Commencez par l\'Agricium ou le Laranite.',
    quiz: [
      { q: 'Quel vaisseau est idéal pour le minage solo ?', options: ['Aurora', 'Prospector', 'Freelancer', 'Cutlass'], answer: 1 },
      { q: 'Que se passe-t-il si le laser est trop puissant ?', options: ['Extraction rapide', 'La roche explose', 'Rien', 'Le vaisseau accélère'], answer: 1 },
      { q: 'Où raffine-t-on les minerais bruts ?', options: ['En vol', 'Station de raffinage', 'Au sol', 'Terminal ASOP'], answer: 1 },
    ],
    links: [{ label: 'Guide minage', path: '/minage' }, { label: 'Artisanat Wikelo', path: '/artisanat' }],
  },
  {
    id: 'group-play',
    title: 'Jouer en groupe',
    icon: Users,
    color: 'text-purple-400',
    steps: [
      { title: 'Créer un groupe (Party)', desc: 'Ouvrez le mobiGlas (F1) → Comms → invitez des joueurs par leur pseudo. Le groupe partage les marqueurs de mission.' },
      { title: 'Multi-crew', desc: 'Plusieurs joueurs peuvent occuper un même vaisseau : pilote, copilote, tourelles, ingénieur. Communiquez avec le VOIP (Num+).' },
      { title: 'Partage de missions', desc: 'Le leader du groupe peut partager ses missions. Les récompenses sont réparties entre les membres selon leur participation.' },
      { title: 'Organisations (Orgs)', desc: 'Rejoignez une organisation sur le site RSI pour trouver des joueurs réguliers. Les orgs organisent des événements et opérations.' },
      { title: 'Conseils de communication', desc: 'Utilisez le chat proximal (Enter) pour parler aux joueurs proches. Le VOIP intégré fonctionne par proximité et canal de fréquence.' },
    ],
    keybindings: [
      { key: 'Num+', action: 'Activer VOIP' },
      { key: 'Enter', action: 'Chat textuel' },
      { key: 'F11', action: 'Liste d\'amis / Contacts' },
      { key: 'F1 → Comms', action: 'Inviter au groupe' },
    ],
    tip: 'Le jeu en groupe rend les missions plus faciles et bien plus fun. N\'hésitez pas à demander de l\'aide dans le chat global — la communauté Star Citizen est généralement accueillante.',
    quiz: [
      { q: 'Comment inviter quelqu\'un dans votre groupe ?', options: ['Chat /invite', 'mobiGlas → Comms', 'Terminal ASOP', 'F11 direct'], answer: 1 },
      { q: 'Que permet le multi-crew ?', options: ['Piloter 2 vaisseaux', 'Occuper différents postes', 'Doubler la vitesse', 'Dupliquer le cargo'], answer: 1 },
      { q: 'Comment trouver une organisation ?', options: ['En jeu uniquement', 'Site RSI', 'Discord officiel', 'Terminal missions'], answer: 1 },
    ],
    links: [{ label: 'Communauté', path: '/communaute' }, { label: 'Factions', path: '/factions' }],
  },
];

const CHAPTER_COUNT = CHAPTERS.length;

function StepBar({ current, completed, onSelect }) {
  return (
    <div className="flex items-center gap-1 w-full overflow-x-auto pb-2">
      {CHAPTERS.map((ch, i) => {
        const Icon = ch.icon;
        const done = completed.includes(i);
        const active = i === current;
        return (
          <React.Fragment key={ch.id}>
            {i > 0 && (
              <div className={clsx('h-0.5 flex-1 min-w-[12px] transition-colors', done || completed.includes(i - 1) ? 'bg-cyan-500/60' : 'bg-space-600')} />
            )}
            <button
              onClick={() => onSelect(i)}
              title={ch.title}
              className={clsx(
                'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all border-2',
                active && 'border-cyan-400 bg-cyan-500/20 scale-110',
                done && !active && 'border-green-500/60 bg-green-500/10',
                !active && !done && 'border-space-500 bg-space-700/50 hover:border-space-400',
              )}
            >
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Icon className={clsx('w-4 h-4', active ? ch.color : 'text-slate-500')} />
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function QuizSection({ quiz, chapterIndex, quizScores, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const savedScore = quizScores[chapterIndex];
  const alreadyDone = savedScore !== undefined;

  const handleSelect = (qIdx, optIdx) => {
    if (submitted || alreadyDone) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < quiz.length) return;
    const score = quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    setSubmitted(true);
    onComplete(chapterIndex, score);
  };

  const displayAnswers = alreadyDone ? quiz.reduce((acc, q, i) => ({ ...acc, [i]: q.answer }), {}) : answers;
  const showResults = submitted || alreadyDone;

  return (
    <div className="mt-6 p-5 rounded-xl bg-space-800/80 border border-space-400/20">
      <h4 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-cyan-400" />
        Quiz — Testez vos connaissances
        {alreadyDone && (
          <span className="ml-auto text-sm font-normal text-green-400">
            {savedScore}/{quiz.length} correct{savedScore > 1 ? 's' : ''}
          </span>
        )}
      </h4>
      <div className="space-y-4">
        {quiz.map((q, qIdx) => (
          <div key={qIdx}>
            <p className="text-slate-300 font-medium mb-2">{qIdx + 1}. {q.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => {
                const selected = displayAnswers[qIdx] === oIdx;
                const isCorrect = q.answer === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    className={clsx(
                      'text-left px-3 py-2 rounded-lg border transition-all text-sm',
                      !showResults && selected && 'border-cyan-400 bg-cyan-500/10 text-cyan-300',
                      !showResults && !selected && 'border-space-500 bg-space-700/40 text-slate-400 hover:border-space-400',
                      showResults && isCorrect && 'border-green-500/60 bg-green-500/10 text-green-300',
                      showResults && selected && !isCorrect && 'border-red-500/60 bg-red-500/10 text-red-300',
                      showResults && !selected && !isCorrect && 'border-space-600 bg-space-700/30 text-slate-500',
                    )}
                    disabled={showResults}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!alreadyDone && !submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < quiz.length}
          className={clsx(
            'mt-4 px-5 py-2 rounded-lg font-medium transition-all',
            Object.keys(answers).length < quiz.length
              ? 'bg-space-600 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white',
          )}
        >
          Valider les réponses
        </button>
      )}
    </div>
  );
}

function ChapterContent({ chapter, chapterIndex, quizScores, onQuizComplete }) {
  const navigate = useNavigate();
  const Icon = chapter.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={clsx('p-3 rounded-xl bg-space-700/60', chapter.color)}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Chapitre {chapterIndex + 1} / {CHAPTER_COUNT}</p>
          <h2 className="text-2xl font-bold text-slate-100">{chapter.title}</h2>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {chapter.steps.map((step, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl bg-space-800/60 border border-space-400/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-space-600 flex items-center justify-center text-sm font-bold text-cyan-400">
              {i + 1}
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">{step.title}</h4>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Key Bindings */}
      {chapter.keybindings && (
        <div className="p-4 rounded-xl bg-space-800/60 border border-space-400/10">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            Raccourcis clavier
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chapter.keybindings.map((kb, i) => (
              <div key={i} className="flex items-center gap-3">
                <kbd className="px-2 py-1 rounded bg-space-600 border border-space-500 text-xs font-mono text-cyan-300 min-w-[60px] text-center">
                  {kb.key}
                </kbd>
                <span className="text-sm text-slate-400">{kb.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      {chapter.tip && (
        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300 mb-1">Conseil</p>
            <p className="text-sm text-slate-400 leading-relaxed">{chapter.tip}</p>
          </div>
        </div>
      )}

      {/* Links */}
      {chapter.links && (
        <div className="flex flex-wrap gap-2">
          {chapter.links.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-700/60 border border-space-500 text-sm text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Quiz */}
      <QuizSection
        quiz={chapter.quiz}
        chapterIndex={chapterIndex}
        quizScores={quizScores}
        onComplete={onQuizComplete}
      />
    </div>
  );
}

export default function Tutorial() {
  const [progress, setProgress] = useState(loadProgress);

  const { currentChapter, completedChapters, quizScores } = progress;

  const updateProgress = (updates) => {
    setProgress(prev => {
      const next = { ...prev, ...updates };
      saveProgress(next);
      return next;
    });
  };

  const goTo = (idx) => updateProgress({ currentChapter: idx });

  const goNext = () => {
    const next = Math.min(currentChapter + 1, CHAPTER_COUNT - 1);
    const completed = completedChapters.includes(currentChapter)
      ? completedChapters
      : [...completedChapters, currentChapter];
    updateProgress({ currentChapter: next, completedChapters: completed });
  };

  const goPrev = () => updateProgress({ currentChapter: Math.max(currentChapter - 1, 0) });

  const handleQuizComplete = (chIdx, score) => {
    const newScores = { ...quizScores, [chIdx]: score };
    const completed = completedChapters.includes(chIdx)
      ? completedChapters
      : [...completedChapters, chIdx];
    updateProgress({ quizScores: newScores, completedChapters: completed });
  };

  const resetAll = () => {
    const fresh = { currentChapter: 0, completedChapters: [], quizScores: {} };
    saveProgress(fresh);
    setProgress(fresh);
  };

  const allDone = completedChapters.length === CHAPTER_COUNT;
  const totalQuizScore = Object.values(quizScores).reduce((a, b) => a + b, 0);
  const maxQuizScore = CHAPTER_COUNT * 3;

  const chapter = CHAPTERS[currentChapter];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-space-700/60">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Tutoriel du nouveau citoyen</h1>
            <p className="text-sm text-slate-500">Guide interactif pour bien débuter dans Star Citizen</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {completedChapters.length}/{CHAPTER_COUNT} chapitres
          </span>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-700/60 border border-space-500 text-xs text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Réinitialiser la progression"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Completion badge */}
      {allDone && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-yellow-500/10 via-cyan-500/10 to-purple-500/10 border border-yellow-500/30 flex items-center gap-4">
          <Trophy className="w-10 h-10 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-yellow-300">Félicitations, Citoyen !</h3>
            <p className="text-sm text-slate-400">
              Vous avez complété les {CHAPTER_COUNT} chapitres du tutoriel avec un score de {totalQuizScore}/{maxQuizScore} aux quiz.
              Vous êtes prêt à explorer le Verse !
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="card-glow p-4">
        <StepBar current={currentChapter} completed={completedChapters} onSelect={goTo} />
      </div>

      {/* Chapter content */}
      <div className="card-glow p-6">
        <ChapterContent
          key={currentChapter}
          chapter={chapter}
          chapterIndex={currentChapter}
          quizScores={quizScores}
          onQuizComplete={handleQuizComplete}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentChapter === 0}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            currentChapter === 0
              ? 'bg-space-700/30 text-slate-600 cursor-not-allowed'
              : 'bg-space-700/60 border border-space-500 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400',
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>
        <span className="text-sm text-slate-500">
          {currentChapter + 1} / {CHAPTER_COUNT}
        </span>
        <button
          onClick={goNext}
          disabled={currentChapter === CHAPTER_COUNT - 1}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            currentChapter === CHAPTER_COUNT - 1
              ? 'bg-space-700/30 text-slate-600 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white',
          )}
        >
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
