# Recherche Approfondie — Tout ce qui peut enrichir SC Companion

---

## Tier 1 — FAIT (28 mars 2026)
- [x] **Master Modes guide** — `/master-modes` — SCM/NAV/QT, transitions, vitesses, tactiques combat
- [x] **Prison guide** — `/prison` — Klescher, merits, sentences, évasion, économie prison
- [x] **Signatures & Scanning** — `/signatures` — IR/EM/CS, détection, stealth builds, scanning
- [x] **Missiles & Contre-Mesures** — `/missiles` — types, tailles S1-S9, lock-on, countermeasures, torpilles
- [x] **Bunkers & Missions Sol** — `/bunkers` — types, difficulté, loot tables, tactiques, emplacements
- [x] **Inventaire & Équipement** — `/inventaire` — stockage, catégories, buffs nourriture, mort & récup

## Tier 2 — FAIT (28 mars 2026)
- [x] **Commentaires Supabase** — composant `CommentsSection` réutilisable, intégré dans BlogPost
- [x] **Comparaison loadouts côte à côte** — onglet "Comparer" dans LoadoutBuilder, diff coloré
- [x] **Export/Import JSON** — boutons dans LoadoutBuilder + FPSLoadoutBuilder
- [x] **Reputation roadmap** — 6 paliers, grind optimal, récompenses par faction
- [x] **Planificateur de Session** — `/checklist` — checklist par durée, suivi gains, tips du jour
- [x] **Vol Atmosphérique** — `/vol-atmospherique` — gravité 13 corps, tips, vaisseaux recommandés

## Tier 3 — FAIT (28 mars 2026)
- [x] **DPS Damage Profiles** — profils énergie/balistique/distorsion, portée effective, notation
- [x] **Profils utilisateur enrichis** — stats, bio, flotte publique, liens builds
- [x] **Contrebande & Marché Noir** — `/contrebande` — 5 marchandises, routes, évasion scanner
- [x] **Épaves & Derelicts** — `/epaves` — types, loot tables, locations, exploration
- [x] **Guide Tourelles** — `/tourelles` — 3 modes, 8 vaisseaux, tips tireurs/pilotes
- [x] **Calculateur Carburant** — `/carburant` — vaisseau/QT drive, itinéraire multi-étapes

## Tier 4 — FAIT (28 mars 2026)
- [x] **Grottes & Minage FPS** — `/grottes` — types, minéraux, locations, calculateur profit
- [x] **Abordage de Vaisseau** — `/abordage` — méthodes, processus, loadout, contre-abordage
- [x] **Gameplay en Groupe** — `/groupe` — party system, activités, multi-crew, organisations
- [x] **Power Management** — `/power-management` — triangle puissance, overclock, stealth/combat configs
- [x] **Zones d'Armistice** — intégré dans StationsMap — légende, badges par station, filtre toggle
- [x] **Système de Badges** — intégré dans UserProfile — 8 badges, progression, earned/locked

---

## 1. APIs & Sources de Données Non Exploitées

### UEX Corp API (partiellement utilisée)
Actuellement on utilise seulement `/commodities` et `/game_versions`. Il reste **70+ endpoints** :

| Endpoint | Données | Intérêt |
|----------|---------|---------|
| `/vehicles` | Stats complètes vaisseaux (loaner, production status) | Remplacer/enrichir ships.js statique |
| `/vehicles_purchases` | Prix en jeu par location | Où acheter chaque vaisseau |
| `/vehicles_rentals` | Prix de location par station | Guide location vaisseaux |
| `/commodities_prices` | Prix par terminal, offre/demande live | Déjà partiellement utilisé |
| `/commodities_routes` | Routes optimales calculées par UEX | Comparer avec nos routes statiques |
| `/trade_routes` | Routes communautaires validées | Enrichir RouteOptimizer |
| `/refineries` | Jobs raffinerie, yields, temps | Enrichir RefineryCalculator |
| `/mining` | Données minéraux live (prix, locations) | Enrichir Mining.jsx |
| `/items_*` | Armes, armures, composants, attachments | Remplacer datasets statiques |
| `/star_systems`, `/cities`, `/moons` | Données systèmes complètes | Enrichir systems.js |
| `/terminals` | 792 terminaux avec services | Enrichir StationsMap |
| `/vehicle_components` | Composants par vaisseau | Enrichir LoadoutBuilder |
| `/fps_weapons`, `/fps_armors` | Équipement FPS complet | Enrichir Equipment.jsx |
| `/orgs` | Organisations joueurs | Nouvelle page possible |

### star-citizen.wiki API (MediaWiki)
- Articles lore complets (texte + images)
- Historique des patchnotes officiel
- Galerie d'images HD (déjà utilisé pour download-images.mjs)
- Données véhicules/vaisseaux structurées via templates

### Fleetyards.net API
- `/v1/models` — 200+ vaisseaux avec specs détaillées
- `/v1/components` — Base composants complète
- `/v1/manufacturers` — Fabricants avec logos
- `/v1/celestial_objects` — Objets célestes
- Images HD sans restriction de licence

### starcitizen-api.com
- Stats organisations (membres, activité)
- Profils joueurs publics (handle → stats)
- Roadmap RSI parsée

### SCUnpacked (GitHub)
- Données extraites directement des fichiers du jeu (p3d/XML)
- Stats exactes des armes, composants, vaisseaux
- Données les plus fiables car extraites du client

### Erkul DPS Calculator (données publiques)
- Données DPS précises par arme
- Loadouts optimaux par vaisseau
- Stats composants à jour

### RSI Status API (cState)
- Déjà utilisé — mais on pourrait ajouter l'historique des incidents

---

## 2. Mécaniques de Jeu Non Couvertes

### Navigation & Voyage
- ~~**Master Modes** (SCM/NAV/QT)~~ ✅ FAIT
- **Quantum Travel détaillé** — fuel consumption par drive, calcul temps réel
- **Points de saut Stanton↔Pyro** — procédure, risques, temps
- ~~**Atmospheric flight**~~ ✅ FAIT (`/vol-atmospherique`)

### Combat Avancé
- ~~**Gestion des signatures** (IR/EM/CS)~~ ✅ FAIT
- ~~**Countermeasures**~~ ✅ FAIT (inclus dans Missiles)
- ~~**Missile gameplay**~~ ✅ FAIT
- ~~**Ship-to-ship boarding**~~ ✅ FAIT (`/abordage`)
- ~~**Tourelles**~~ ✅ FAIT (`/tourelles`)
- ~~**Armistice zones**~~ ✅ FAIT (intégré dans StationsMap)

### Économie & Commerce
- ~~**Illegal commodities**~~ ✅ FAIT (`/contrebande`)
- **Dynamic economy events** — impacts sur les prix
- **Cargo insurance** — coûts, conditions
- ~~**Smuggling routes**~~ ✅ FAIT (inclus dans `/contrebande`)

### Exploration
- ~~**Scanning gameplay**~~ ✅ FAIT (inclus dans Signatures)
- **Cartographie** — POI discovery, partage de données
- ~~**Cave mining/exploration**~~ ✅ FAIT (`/grottes`)
- ~~**Derelict ships**~~ ✅ FAIT (`/epaves`)
- ~~**Bunker missions détaillées**~~ ✅ FAIT
- ~~**Atmospheric flight**~~ ✅ FAIT

### Systèmes de Personnage
- ~~**Inventory management**~~ ✅ FAIT
- ~~**Healing/revive détaillé**~~ ✅ FAIT (`/medical-avance`)
- ~~**Stamina/oxygen**~~ ✅ FAIT (`/stamina`)
- ~~**Food/drink**~~ ✅ FAIT (inclus dans Inventaire)

### Systèmes Véhicule Avancés
- ~~**Overclock/underclock**~~ ✅ FAIT (`/power-management`)
- ~~**Component degradation**~~ ✅ FAIT (`/degradation`)
- ~~**Fuel management**~~ ✅ FAIT (`/carburant`)
- **Self-destruct** — timer, rayon, dégâts

### Gameplay Social
- ~~**Party system**~~ ✅ FAIT (`/groupe`)
- ~~**Org gameplay**~~ ✅ FAIT (inclus dans `/groupe`)
- ~~**Reputation system détaillé**~~ ✅ FAIT (roadmap ajoutée à ReputationTracker)
- ~~**Prison gameplay**~~ ✅ FAIT

---

## 3. Fonctionnalités Inspirées des Outils Communautaires

### Depuis Erkul (DPS Calculator)
- **Loadout 3D preview** — visualisation du vaisseau équipé
- **DPS graphs temps réel** — courbes DPS vs distance/temps
- ~~**Comparaison loadouts côte à côte**~~ ✅ FAIT
- ~~**Export/import loadouts**~~ ✅ FAIT

### Depuis SC Trade Tools
- **Carte interactive** — Stanton/Pyro avec routes commerciales
- **Alertes prix** — notification quand un prix dépasse un seuil
- **Historique des prix** — graphiques tendance par commodité
- **Route multi-stop** — optimisation cargo sur 3+ arrêts

### Depuis CCU Game
- **CCU Chain Calculator** — chaînes d'upgrades pour minimiser le coût pledge
- **Buyback calculator** — valeur des tokens
- **Fleet value tracker** — valeur totale pledge + in-game

### Depuis Hardpoint.io
- **Ship hardpoint visualizer** — schéma du vaisseau avec emplacements
- **Damage profile calculator** — DPS par type (energy/ballistic/distortion)
- **Range finder** — portée effective par loadout

### Depuis SPViewer
- **Ship 3D viewer** — modèle 3D interactif
- **Size comparison** — vaisseaux côte à côte à l'échelle
- **Interior layout** — plan des intérieurs

### Depuis CStone (Cornerstone)
- **Base building planner** — placement modules, coûts
- **Pioneer/homestead guide** — crafting de structures

### Depuis Mining Ops
- **Rock scanner simulator** — estimation profits par type de roche
- **Mining route planner** — routes optimales par minéral
- **Yield calculator avancé** — avec consommables et gadgets

### Depuis VerseGuide
- **Mission flowcharts** — arbres de décision par type de mission
- ~~**Reputation roadmap**~~ ✅ FAIT
- ~~**Daily checklist**~~ ✅ FAIT (`/checklist`)

---

## 4. Fonctionnalités Manquantes (Audit Interne)

### Pages/Modules absents
| Feature | Description | Priorité |
|---------|-------------|----------|
| **Carte Interactive** | Map 2D/3D Stanton+Pyro avec POI, routes, filtres | Haute |
| **CCU Calculator** | Calcul chaînes upgrade pledge | Haute |
| **Profil Joueur Public** | Page profil avec fleet, builds, contributions | Moyenne |
| **Tutoriel Interactif** | Onboarding nouveaux joueurs | Moyenne |
| **Notifications** | Alertes prix, events, patchnotes | Moyenne |
| **Mode Hors-Ligne** | Service Worker + cache datasets | Moyenne |
| **Classement/Leaderboard** | Top contributeurs, meilleurs builds | Basse |
| **Overlay In-Game** | Version compacte pour 2e écran | Basse |
| **API Publique** | Endpoints pour intégrations tierces | Basse |
| **App Mobile** | PWA responsive optimisée mobile | Moyenne |

### Améliorations datasets existants
- `ships.js` — manque loaner info, production status, cargo grid details
- `equipment.js` — manque attachments (sights, barrels, underbarrels)
- `missions.js` — manque reward tables détaillées, reputation gains exacts
- `systems.js` — manque coordonnées 3D, distances inter-locations
- `factions.js` — manque arbres de réputation, récompenses par palier
- `commodities.js` — manque catégories illégales, supply/demand dynamics

### Fonctionnalités sociales manquantes
- ~~**Commentaires**~~ ✅ FAIT (CommentsSection réutilisable, intégré dans BlogPost)
- **Système de vote** sur les guides/builds (qualité)
- ~~**Profils utilisateur enrichis**~~ ✅ FAIT (stats, bio, fleet, badges dans UserProfile)
- **Partage sur Discord** (webhooks, embeds riches)
- ~~**Système de badges/achievements**~~ ✅ FAIT (8 badges dans UserProfile)

---

## 5. Sources de Données Complémentaires

| Source | Type | Contenu |
|--------|------|---------|
| **RSI Roadmap** | Web scraping | Features à venir, progression |
| **RSI Spectrum** | API non-officielle | Posts communautaires, devtracker |
| **RSI Ship Matrix** | Scraping | Données vaisseaux officielles |
| **Galactapedia RSI** | Scraping | Lore officiel structuré |
| **YouTube RSI** | API YouTube | Vidéos officielles (ISC, SCL) |
| **Reddit r/starcitizen** | API Reddit | Discussions, PSA, guides communautaires |
| **Issue Council RSI** | Scraping | Bugs connus, workarounds |
| **Telemetry RSI** | Page publique | FPS moyen par vaisseau/config PC |

---

## 6. Prochaine Vague — Par priorité

### ~~Tiers 1-4~~ ✅ TOUT FAIT — voir ci-dessus

---

### Tier 5 — FAIT (28 mars 2026)
- [x] **Données vaisseaux live UEX** — toggle "LIVE" dans ShipsDatabase, prix achat/location par station via `/vehicles` + `/vehicles_purchases` + `/vehicles_rentals`
- [x] **Données composants live UEX** — toggle "LIVE" dans LoadoutBuilder, `/vehicle_components` UEX Corp
- [x] **Données minéraux live UEX** — toggle "Prix Live" dans Mining.jsx, prix temps réel via `/mining`
- [x] **Routes commerce UEX** — toggle "Routes Live" dans RouteOptimizer, routes normalisées depuis `/commodities_routes`
- [x] **Données raffinerie UEX** — toggle "Prix Live" dans RefineryCalculator via `/refineries`
- [x] **Commentaires sur guides** — CommentsSection ajouté à GuideDetail + 17 pages mécaniques
- [x] **Système de vote builds** — déjà implémenté (toggleBuildLike + tri populaire dans SharedBuildsGallery)
- [x] **Healing/Revive détaillé** — `/medical-avance` — 3 tiers médicaux, 9 substances, équipement, triage, réanimation, hôpitaux
- [x] **Stamina & Oxygène** — `/stamina` — endurance, O2, 4 tiers armure, 11 corps célestes, gestion thermique
- [x] **Component degradation** — `/degradation` — usure 5 types composants, réparation, grades A-D, maintenance préventive

### Tier 6 — FAIT (28 mars 2026)
- [x] **Carte interactive Leaflet** — `/carte` — Map 2D Stanton (45 POI) + Pyro (20 POI), filtres, recherche, légende
- [x] **CCU Calculator** — `/ccu` — 61 vaisseaux, chaîne Dijkstra, collection Warbond, budget planner
- [x] **Historique des prix** — `/prix-historique` — Recharts LineChart/BarChart, alertes localStorage, stats
- [x] **Mission flowcharts** — `/missions/flowcharts` — 6 types, arbres CSS, 8-12 nœuds chacun, chemin recommandé
- [x] **Route multi-stop** — `/routes/multi-stop` — 2-6 stops, auto-optimisation, timeline, profit/SCU
- [x] **Mining route planner** — `/minage/routes` — sélecteur minéral, route recommandée, comparaison, historique
- [x] **Cartographie & POI** — `/exploration` — 51 POI, checklist explorateur, badges, filtres
- [x] **Dynamic economy events** — `/economie` — 8 événements, matrice d'impact, simulateur, calendrier

### Tier 7 — FAIT (28 mars 2026)
- [x] **PWA + Service Worker** — `sw.js` cache-first/network-first, OfflineBanner, manifest enrichi, ServiceWorkerRegistration
- [x] **Notifications in-app** — NotificationManager (localStorage, 100 max), NotificationPanel slide-out, badge cloche Header
- [x] **Partage Discord** — DiscordShareModal + discordFormat.js, 4 types embed, copier/webhook, aperçu style Discord
- [x] **Tutoriel interactif** — `/tutoriel` — 8 chapitres, quiz, progression localStorage, badge complétion
- [x] **Classement/Leaderboard** — `/classement` — 3 onglets Supabase, podium, filtres temps, recherche, badges
- [ ] ~~**API Publique**~~ — reporté (nécessite un backend dédié, hors scope frontend)

### Tier 8 — FAIT (28 mars 2026)
- [x] **Ship Showcase** — `/vaisseaux/showcase` — vue premium, radar SVG hexagonal, barres animées, analyse rôle
- [x] **Size Comparison** — `/vaisseaux/tailles` — comparaison jusqu'à 5 vaisseaux, barres échelle, silhouettes, fun facts
- [x] **Base Building Planner** — `/base-building` — grille 6×6, 20 modules, power balance, préréglages, save/load
- [x] **DPS Graphs temps réel** — `/dps-graphs` — Recharts DPS vs distance/temps, comparaison 4 armes, TTK calculator
- [x] **Overlay In-Game** — `/overlay` — mode compact 2e écran, 6 widgets, timer, notes, keybinds, fond noir
- [x] **Hardpoint Visualizer** — `/vaisseaux/hardpoints` — schéma SVG top-down, 15 vaisseaux, hardpoints cliquables, DPS summary
