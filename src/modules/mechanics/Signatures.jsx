import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Radio, Thermometer, Zap, Box, ChevronDown, ChevronUp,
  Eye, EyeOff, Search, Shield, Crosshair, Gauge, Info,
  Lightbulb, Radar, ScanLine, AlertTriangle, Settings,
} from 'lucide-react';

/* ─── Données ─── */

const SIGNATURE_TYPES = [
  {
    id: 'ir',
    name: 'IR (Infrarouge)',
    icon: Thermometer,
    subtitle: 'Émissions thermiques',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    glow: 'shadow-orange-500/10',
    badge: 'bg-orange-500/20 text-orange-300',
    description:
      'La signature infrarouge représente la chaleur émise par votre vaisseau. Les réacteurs, les propulseurs en poussée et les armes en surchauffe augmentent fortement votre signature IR. C\'est souvent la signature la plus élevée en combat.',
    sources: [
      'Propulseurs (thrusters) — surtout en pleine accélération',
      'Power Plant — génère de la chaleur constante',
      'Armes à énergie après plusieurs tirs',
      'Refroidisseurs (coolers) saturés',
      'Boucliers encaissant des dégâts',
    ],
    reduction: [
      'Réduire la puissance des propulseurs (vol plané / drift)',
      'Installer des coolers Stealth grade A',
      'Sous-alimenter (underclock) le power plant',
      'Éviter les tirs prolongés',
    ],
  },
  {
    id: 'em',
    name: 'EM (Électromagnétique)',
    icon: Zap,
    subtitle: 'Émissions électroniques',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-cyan-500/10',
    badge: 'bg-cyan-500/20 text-cyan-300',
    description:
      'La signature EM provient de l\'activité électrique de vos composants. Les boucliers actifs, le power plant et les systèmes d\'armes génèrent un champ électromagnétique détectable. Le spool du Quantum Drive crée un pic EM massif.',
    sources: [
      'Boucliers actifs (shields) — émission constante',
      'Power Plant — proportionnel à la charge',
      'Quantum Drive en spool/charge',
      'Radar actif (ping)',
      'Systèmes d\'armes en mode actif',
    ],
    reduction: [
      'Éteindre les boucliers (risqué mais très efficace)',
      'Installer un power plant Stealth',
      'Sous-alimenter les systèmes non essentiels',
      'Utiliser le radar passif uniquement',
    ],
  },
  {
    id: 'cs',
    name: 'CS (Cross-Section)',
    icon: Box,
    subtitle: 'Section efficace / Taille physique',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    glow: 'shadow-yellow-500/10',
    badge: 'bg-yellow-500/20 text-yellow-300',
    description:
      'La cross-section est déterminée par la taille physique et la forme de votre vaisseau. C\'est une valeur fixe qui ne peut pas être modifiée par les composants. Les petits vaisseaux ont naturellement une cross-section réduite, ce qui les rend plus difficiles à détecter à distance.',
    sources: [
      'Taille du vaisseau (fixe, non modifiable)',
      'Forme du profil (plus fin = moins détectable)',
      'Orientation relative à l\'observateur',
    ],
    reduction: [
      'Choisir un vaisseau de petite taille',
      'Orienter le profil le plus fin vers l\'ennemi',
      'Pas de modification possible via composants',
    ],
  },
];

const DETECTION_RANGES = [
  {
    method: 'Radar passif',
    icon: Radar,
    range: '10 – 20 km',
    description: 'Détection automatique sans émission. Portée limitée mais ne révèle pas votre position.',
    detail: 'Fonctionne en permanence. Détecte les signatures fortes uniquement.',
    color: 'text-green-400',
  },
  {
    method: 'Radar actif (Ping)',
    icon: Radio,
    range: '30 – 50 km',
    description: 'Émission d\'une impulsion radar. Grande portée mais augmente votre signature EM.',
    detail: 'Le ping peut être détecté par les autres joueurs à proximité. À utiliser avec modération en zone hostile.',
    color: 'text-cyan-400',
  },
  {
    method: 'Scanning détaillé',
    icon: ScanLine,
    range: '5 – 15 km',
    description: 'Analyse complète de la cible (composants, cargo, état). Nécessite un lock prolongé.',
    detail: 'Permet d\'identifier le contenu du cargo, l\'état des composants et les marchandises illégales.',
    color: 'text-purple-400',
  },
  {
    method: 'Détection visuelle',
    icon: Eye,
    range: 'Variable',
    description: 'Repérage à l\'œil nu. Dépend de la taille du vaisseau, de l\'éclairage et du fond spatial.',
    detail: 'Éteindre les lumières extérieures et se positionner devant un fond sombre aide considérablement.',
    color: 'text-yellow-400',
  },
];

const STEALTH_SHIPS = [
  {
    name: 'Aegis Eclipse',
    role: 'Bombardier furtif',
    size: 'Medium',
    ir: 'Très faible',
    em: 'Très faible',
    cs: 'Faible',
    irBar: 15,
    emBar: 12,
    csBar: 35,
    note: 'Conçu pour la furtivité. Torpilles S9 dévastatrices. Faible maniabilité en dogfight.',
  },
  {
    name: 'Aegis Sabre',
    role: 'Chasseur furtif',
    size: 'Medium',
    ir: 'Faible',
    em: 'Faible',
    cs: 'Faible',
    irBar: 25,
    emBar: 22,
    csBar: 30,
    note: 'Excellent chasseur avec profil réduit. Bon compromis puissance/furtivité.',
  },
  {
    name: 'Esperia Prowler',
    role: 'Dropship furtif',
    size: 'Medium',
    ir: 'Faible',
    em: 'Modérée',
    cs: 'Modérée',
    irBar: 28,
    emBar: 40,
    csBar: 50,
    note: 'Technologie Tevarin d\'absorption des signatures. Spécialisé en infiltration de troupes.',
  },
  {
    name: 'MISC Herald',
    role: 'Courrier / Info Runner',
    size: 'Small',
    ir: 'Modérée',
    em: 'Faible',
    cs: 'Très faible',
    irBar: 45,
    emBar: 20,
    csBar: 18,
    note: 'Très petit et très rapide. Idéal pour la fuite et le transport de données.',
  },
];

const STEALTH_TIPS_COMPONENTS = [
  {
    title: 'Gestion de la puissance (Power Management)',
    icon: Gauge,
    items: [
      'Réduisez la puissance du Power Plant au minimum nécessaire via le MFD',
      'Sous-alimentez (underclock) les propulseurs à 50-70% en approche furtive',
      'Coupez les systèmes non essentiels : mining laser, tracteur, lumières',
      'Le mode « Stealth » (touche par défaut : O) réduit automatiquement la puissance',
    ],
  },
  {
    title: 'Composants Stealth recommandés',
    icon: Settings,
    items: [
      'Power Plant : Shimmer (Stealth, grade A) — réduit l\'EM de 30-40%',
      'Coolers : Zero-Rush, Bracer (Stealth) — meilleure dissipation IR',
      'Boucliers : Mirage, Shimmer (Stealth) — EM réduit mais HP plus faibles',
      'QT Drive : Stealth grade A — spool EM réduit, vitesse plus lente',
      'Privilégiez toujours les composants grade A/B Stealth sur les vaisseaux furtifs',
    ],
  },
];

const SCANNING_SECTIONS = [
  {
    id: 'ship-scan',
    title: 'Scanning vaisseau (radar)',
    icon: Radar,
    content: [
      { subtitle: 'Radar passif', text: 'Actif en permanence. Détecte les contacts dans un rayon limité sans émettre de signal. Idéal en approche furtive.' },
      { subtitle: 'Ping actif (TAB)', text: 'Envoie une impulsion radar qui révèle les contacts dans un rayon étendu (30-50km). Attention : le ping augmente votre signature EM et peut être détecté par les cibles.' },
      { subtitle: 'Modes radar', text: 'Passez entre les modes via le MFD : mode combat (focus avant), mode scanning (360°), mode mining. Chaque mode ajuste la sensibilité et la portée.' },
      { subtitle: 'Lock & Scan', text: 'Verrouillez une cible (T) puis maintenez la touche scan pour obtenir des informations détaillées : composants, cargo, niveau de menace.' },
    ],
  },
  {
    id: 'fps-scan',
    title: 'Scanning FPS (scanner à main)',
    icon: Search,
    content: [
      { subtitle: 'Utilisation', text: 'Équipez le scanner à main (outil multifonction). Maintenez clic gauche pour scanner l\'environnement. Les éléments interactifs sont mis en surbrillance.' },
      { subtitle: 'Détection de corps', text: 'Le scanner FPS détecte les corps de joueurs et PNJ à travers les murs dans un rayon limité (~50m).' },
      { subtitle: 'Mode médical', text: 'En mode médical, le scanner affiche l\'état de santé du joueur ciblé : blessures, saignements, drogues actives.' },
    ],
  },
  {
    id: 'mining-scan',
    title: 'Scanning minier (composition)',
    icon: ScanLine,
    content: [
      { subtitle: 'Ping minier', text: 'En mode mining, le ping révèle les rochers exploitables dans un rayon de ~15km. Les rochers sont colorés selon leur valeur.' },
      { subtitle: 'Analyse de composition', text: 'Scannez un rocher pour voir sa composition : pourcentage de chaque minerai, masse, résistance, instabilité.' },
      { subtitle: 'Sous-rochers', text: 'Après fracturation, scannez les fragments pour identifier les morceaux les plus rentables avant extraction.' },
    ],
  },
  {
    id: 'contraband-scan',
    title: 'Scanning de contrebande',
    icon: AlertTriangle,
    content: [
      { subtitle: 'Scan automatique en station', text: 'Les stations sécurisées scannent automatiquement votre cargo à l\'approche. Si des marchandises illégales sont détectées → CrimeStat.' },
      { subtitle: 'Vaisseaux de sécurité', text: 'Les patrouilles UEE/Crusader Security peuvent vous scanner en vol. Ils émettent un avertissement audio avant le scan.' },
      { subtitle: 'Contre-mesures', text: 'Les conteneurs blindés (shielded cargo boxes) réduisent les chances de détection. Certains vaisseaux comme le Mercury Star Runner ont des compartiments cachés.' },
      { subtitle: 'Zones sûres', text: 'Les stations hors-la-loi (GrimHEX, Pyro) ne scannent pas la contrebande. Idéales pour le commerce illégal.' },
    ],
  },
];

const COMPONENT_IMPACT = [
  { component: 'Power Plant', icon: Zap, ir: '++', em: '+++', irVal: 60, emVal: 90, note: 'Émissions constantes. Plus la charge est élevée, plus les signatures montent.' },
  { component: 'Boucliers (Shields)', icon: Shield, ir: '+', em: '++', irVal: 30, emVal: 70, note: 'Les boucliers actifs émettent un champ EM permanent. Absorption de dégâts = pic IR.' },
  { component: 'Armes (en tir)', icon: Crosshair, ir: '+++', em: '++', irVal: 95, emVal: 65, note: 'Les armes energy chauffent énormément. Les balistiques ont moins d\'impact EM.' },
  { component: 'Propulseurs (Thrusters)', icon: Gauge, ir: '+++', em: '+', irVal: 90, emVal: 25, note: 'Principale source de chaleur. Le drift réduit drastiquement l\'IR.' },
  { component: 'QT Drive (spool)', icon: Radio, ir: '+', em: '+++', irVal: 20, emVal: 95, note: 'Le spool génère un pic EM massif détectable à très longue portée.' },
  { component: 'Coolers', icon: Thermometer, ir: '−', em: '+', irVal: -20, emVal: 15, note: 'Réduisent l\'IR mais consomment de l\'énergie (léger EM). Stealth coolers = optimal.' },
];

const STEALTH_TIPS = [
  { tip: 'Activez le mode Stealth (O) avant d\'entrer dans une zone hostile. Il réduit automatiquement la puissance de tous les systèmes.', icon: EyeOff },
  { tip: 'Coupez vos boucliers en approche furtive. Votre signature EM chute drastiquement. Réactivez-les juste avant l\'engagement.', icon: Shield },
  { tip: 'Utilisez le drift (coupure moteurs + inertie) pour vous déplacer sans signature IR. Idéal pour les approches longue distance.', icon: Gauge },
  { tip: 'Évitez le ping radar en zone ennemie. Préférez le radar passif et la détection visuelle pour rester invisible.', icon: Radar },
  { tip: 'Les armes balistiques génèrent moins de signature EM que les armes energy. Privilégiez-les pour un build furtif.', icon: Crosshair },
  { tip: 'Positionnez-vous devant un astéroïde ou une planète sombre pour réduire votre visibilité optique.', icon: Eye },
  { tip: 'Le QT spool est votre plus grande trahison EM. Gardez votre QT Drive éteint tant que vous n\'êtes pas prêt à fuir.', icon: Radio },
  { tip: 'En groupe, désignez un éclaireur furtif (Eclipse/Sabre) qui repère les cibles sans ping, puis transmettez les coordonnées au reste de la flotte.', icon: Lightbulb },
];

/* ─── Composant Section Extensible ─── */

function ExpandableSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-dark rounded-xl border border-space-400/20 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-cyan-400" />}
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
        {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-space-400/10">{children}</div>}
    </div>
  );
}

/* ─── Barre de signature visuelle ─── */

function SignatureBar({ value, color }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-space-700/50 overflow-hidden">
      <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${w}%` }} />
    </div>
  );
}

/* ─── Composant Principal ─── */

export default function Signatures() {
  const [expandedScan, setExpandedScan] = useState(null);

  return (
    <div className="min-h-screen bg-space-900 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Radio size={32} className="text-cyan-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100">
            Signatures &amp; Scanning
          </h1>
        </div>
        <p className="text-lg text-cyan-400 font-medium">Guide Furtivité</p>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Maîtriser les signatures IR, EM et Cross-Section dans Star Citizen
        </p>
      </div>

      {/* ── 3 Types de signatures ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Info size={20} className="text-cyan-400" />
          Les trois signatures
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SIGNATURE_TYPES.map((sig) => {
            const Icon = sig.icon;
            return (
              <div
                key={sig.id}
                className={clsx(
                  'card-dark rounded-xl border p-5 space-y-4',
                  sig.border,
                  sig.glow
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx('p-2 rounded-lg', sig.bg)}>
                    <Icon size={24} className={sig.color} />
                  </div>
                  <div>
                    <h3 className={clsx('font-bold text-lg', sig.color)}>{sig.name}</h3>
                    <p className="text-xs text-slate-400">{sig.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{sig.description}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Sources</p>
                  <ul className="space-y-1">
                    {sig.sources.map((s, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className={clsx('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0', sig.bg, sig.color.replace('text-', 'bg-'))} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Réduction</p>
                  <ul className="space-y-1">
                    {sig.reduction.map((r, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-green-500" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Portées de détection ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Radar size={20} className="text-cyan-400" />
          Portées de détection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DETECTION_RANGES.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.method} className="card-dark rounded-xl border border-space-400/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={d.color} />
                    <span className="font-semibold text-slate-100">{d.method}</span>
                  </div>
                  <span className={clsx('text-sm font-mono font-bold', d.color)}>{d.range}</span>
                </div>
                <p className="text-sm text-slate-300">{d.description}</p>
                <p className="text-xs text-slate-500 italic">{d.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stealth Builds ── */}
      <ExpandableSection title="Builds Furtifs" icon={EyeOff} defaultOpen>
        <div className="space-y-6 mt-4">
          {/* Composants & Power management */}
          {STEALTH_TIPS_COMPONENTS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wide">
                  <Icon size={16} />
                  {section.title}
                </h4>
                <ul className="grid grid-cols-1 gap-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2 bg-space-800/40 rounded-lg px-3 py-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Vaisseaux furtifs recommandés */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-wide">
              <Crosshair size={16} />
              Vaisseaux furtifs recommandés
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STEALTH_SHIPS.map((ship) => (
                <div key={ship.name} className="card-dark rounded-lg border border-space-400/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-100">{ship.name}</p>
                      <p className="text-xs text-slate-400">{ship.role} — {ship.size}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-orange-400 font-bold">IR</span>
                      <SignatureBar value={ship.irBar} color="bg-orange-500" />
                      <span className="text-slate-400 w-20 text-right">{ship.ir}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-cyan-400 font-bold">EM</span>
                      <SignatureBar value={ship.emBar} color="bg-cyan-500" />
                      <span className="text-slate-400 w-20 text-right">{ship.em}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-yellow-400 font-bold">CS</span>
                      <SignatureBar value={ship.csBar} color="bg-yellow-500" />
                      <span className="text-slate-400 w-20 text-right">{ship.cs}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">{ship.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Scanning Gameplay ── */}
      <ExpandableSection title="Gameplay du Scanning" icon={Search} defaultOpen={false}>
        <div className="space-y-4 mt-4">
          {SCANNING_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isOpen = expandedScan === section.id;
            return (
              <div key={section.id} className="border border-space-400/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedScan(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-space-700/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-cyan-400" />
                    <span className="font-medium text-slate-200">{section.title}</span>
                  </div>
                  {isOpen
                    ? <ChevronUp size={16} className="text-slate-400" />
                    : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-3 border-t border-space-400/10">
                    {section.content.map((c, i) => (
                      <div key={i} className="mt-2">
                        <p className="text-sm font-semibold text-slate-200">{c.subtitle}</p>
                        <p className="text-sm text-slate-400 mt-1">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* ── Impact des composants ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings size={20} className="text-cyan-400" />
          Impact des composants sur les signatures
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-space-400/20">
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Composant</th>
                <th className="text-center py-3 px-3 text-orange-400 font-medium">IR</th>
                <th className="text-center py-3 px-3 text-cyan-400 font-medium">EM</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_IMPACT.map((c) => {
                const Icon = c.icon;
                return (
                  <tr key={c.component} className="border-b border-space-400/10 hover:bg-space-700/20 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-slate-400" />
                        <span className="text-slate-200 font-medium">{c.component}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={clsx(
                        'font-mono font-bold text-sm',
                        c.irVal > 60 ? 'text-orange-400' : c.irVal > 0 ? 'text-orange-300/60' : 'text-green-400'
                      )}>
                        {c.ir}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={clsx(
                        'font-mono font-bold text-sm',
                        c.emVal > 60 ? 'text-cyan-400' : c.emVal > 0 ? 'text-cyan-300/60' : 'text-green-400'
                      )}>
                        {c.em}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs hidden md:table-cell">{c.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Mobile notes */}
        <div className="md:hidden space-y-2">
          {COMPONENT_IMPACT.map((c) => (
            <p key={c.component} className="text-xs text-slate-500">
              <span className="text-slate-300 font-medium">{c.component} :</span> {c.note}
            </p>
          ))}
        </div>
      </section>

      {/* ── Tips furtivité ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-400" />
          Conseils de furtivité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STEALTH_TIPS.map((t, i) => {
            const Icon = t.icon;
            return (
              <div
                key={i}
                className="card-dark rounded-lg border border-space-400/20 p-4 flex items-start gap-3 hover:border-cyan-500/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 flex-shrink-0">
                  <Icon size={16} className="text-cyan-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase">Tip #{i + 1}</span>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{t.tip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="text-center text-xs text-slate-600 pt-4 border-t border-space-400/10">
        Données basées sur Star Citizen Alpha 4.6 — Les valeurs peuvent varier selon les mises à jour
      </div>
    </div>
  );
}
