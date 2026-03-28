import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Wind, Activity, Droplets, Shield, ChevronDown, ChevronUp,
  Globe, Thermometer, Zap, Heart, AlertTriangle, Info,
  TrendingUp, Gauge, Mountain, Snowflake, Flame, Feather, Weight, Footprints,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Activités & consommation de stamina
══════════════════════════════════════════════════════════════ */

const STAMINA_ACTIVITIES = [
  { activity: 'Marche',           drain: '0 %/s',   recovery: '3 %/s',  icon: Footprints, color: 'text-green-400' },
  { activity: 'Jogging',          drain: '2 %/s',   recovery: '3 %/s',  icon: Activity,   color: 'text-cyan-400' },
  { activity: 'Sprint',           drain: '8 %/s',   recovery: '3 %/s',  icon: Zap,        color: 'text-yellow-400' },
  { activity: 'Saut',             drain: '12 % /saut', recovery: '—',   icon: TrendingUp,  color: 'text-orange-400' },
  { activity: 'Escalade',         drain: '5 %/s',   recovery: '2 %/s',  icon: Mountain,    color: 'text-purple-400' },
  { activity: 'Nage',             drain: '6 %/s',   recovery: '2 %/s',  icon: Droplets,    color: 'text-blue-400' },
  { activity: 'Combat mêlée',    drain: '10 %/s',  recovery: '2 %/s',  icon: Zap,         color: 'text-red-400' },
  { activity: 'Accroupi (sneak)', drain: '1 %/s',   recovery: '3.5 %/s', icon: Feather,   color: 'text-emerald-400' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Consommation d'oxygène
══════════════════════════════════════════════════════════════ */

const OXYGEN_ACTIVITIES = [
  { activity: 'Repos / marche',       consumption: '0.5 %/min',  duration: '~200 min', color: 'text-green-400' },
  { activity: 'Jogging',              consumption: '1.0 %/min',  duration: '~100 min', color: 'text-cyan-400' },
  { activity: 'Sprint',               consumption: '2.5 %/min',  duration: '~40 min',  color: 'text-yellow-400' },
  { activity: 'Sprint + gravité forte', consumption: '4.0 %/min', duration: '~25 min', color: 'text-orange-400' },
  { activity: 'Combat intense',       consumption: '3.0 %/min',  duration: '~33 min',  color: 'text-red-400' },
  { activity: 'Environnement sans O2', consumption: '1.5 %/min', duration: '~66 min',  color: 'text-purple-400' },
];

const OXYGEN_PHASES = [
  { phase: '100 % → 50 %', effect: 'Aucun effet notable', badge: 'badge-green' },
  { phase: '50 % → 25 %',  effect: 'Respiration audible, avertissement HUD', badge: 'badge-yellow' },
  { phase: '25 % → 10 %',  effect: 'Vision floue, halètement, stamina réduite de 50 %', badge: 'badge-orange' },
  { phase: '10 % → 0 %',   effect: 'Perte de conscience imminente, vision noire', badge: 'badge-red' },
  { phase: '0 %',           effect: 'Mort par asphyxie en ~15 secondes', badge: 'badge-red' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Impact des armures
══════════════════════════════════════════════════════════════ */

const ARMOR_IMPACTS = [
  { type: 'Aucune armure / sous-combinaison', icon: Feather, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10',
    staminaDrain: '×1.0', speedPenalty: '0 %', o2Reserve: 'Aucune (combi pressurisée requise)', recovery: '100 %', ideal: 'Exploration zone sûre, stations' },
  { type: 'Armure légère', icon: Shield, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10',
    staminaDrain: '×1.15', speedPenalty: '−5 %', o2Reserve: '100 % (standard)', recovery: '90 %', ideal: 'Recon, exploration, missions furtives' },
  { type: 'Armure moyenne', icon: Shield, color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10',
    staminaDrain: '×1.35', speedPenalty: '−12 %', o2Reserve: '100 % (standard)', recovery: '75 %', ideal: 'Combat général, bunkers, FPS polyvalent' },
  { type: 'Armure lourde', icon: Weight, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10',
    staminaDrain: '×1.60', speedPenalty: '−20 %', o2Reserve: '100 % (standard)', recovery: '55 %', ideal: 'Assaut frontal, défense de position, bunkers T5' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Gravité par corps céleste
══════════════════════════════════════════════════════════════ */

const GRAVITY_BODIES = [
  { body: 'Espace (EVA)',  gravity: '0.00g', drainMult: '×0.3',  note: 'Propulsion EVA uniquement', zone: 'Aucune', color: 'text-slate-400' },
  { body: 'Delamar',       gravity: '0.19g', drainMult: '×0.5',  note: 'Sauts très hauts, chutes lentes', zone: 'Stanton', color: 'text-emerald-400' },
  { body: 'Yela',          gravity: '0.23g', drainMult: '×0.55', note: 'Glace, grottes, faible gravité', zone: 'Stanton', color: 'text-cyan-400' },
  { body: 'Daymar',        gravity: '0.33g', drainMult: '×0.65', note: 'Désert, bunkers fréquents', zone: 'Stanton', color: 'text-yellow-400' },
  { body: 'Arial',         gravity: '0.38g', drainMult: '×0.7',  note: 'Volcanique, chaleur extrême', zone: 'Stanton', color: 'text-red-300' },
  { body: 'Lyria',         gravity: '0.42g', drainMult: '×0.7',  note: 'Glaciale, bases criminelles', zone: 'Stanton', color: 'text-sky-300' },
  { body: 'Euterpe',       gravity: '0.46g', drainMult: '×0.75', note: 'Tempêtes, lune de microTech', zone: 'Stanton', color: 'text-indigo-300' },
  { body: 'Hurston',       gravity: '0.98g', drainMult: '×1.0',  note: 'Référence ~terrestre, pollué', zone: 'Stanton', color: 'text-amber-400' },
  { body: 'ArcCorp',       gravity: '1.00g', drainMult: '×1.0',  note: 'Ecumenopolis, gravité standard', zone: 'Stanton', color: 'text-blue-400' },
  { body: 'microTech',     gravity: '1.00g', drainMult: '×1.0',  note: 'Arctique, tempêtes de neige', zone: 'Stanton', color: 'text-teal-400' },
  { body: 'Crusader',      gravity: '1.04g', drainMult: '×1.05', note: 'Orison uniquement, géante gazeuse', zone: 'Stanton', color: 'text-pink-300' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Gestion thermique
══════════════════════════════════════════════════════════════ */

const THERMAL_ZONES = [
  { zone: 'Froid extrême', range: '< −80 °C', icon: Snowflake, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10',
    effects: 'Hypothermie rapide, stamina −40 %, vision tremblante, mort en ~3 min sans protection',
    locations: 'microTech (tempêtes), Yela (nuit), Lyria', protection: 'Sous-combinaison thermique + armure isolante' },
  { zone: 'Froid modéré', range: '−80 °C à −20 °C', icon: Snowflake, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10',
    effects: 'Stamina −15 %, récupération ralentie, frissons visuels',
    locations: 'microTech (surface), Euterpe, Yela (jour)', protection: 'Sous-combinaison standard suffisante' },
  { zone: 'Tempéré', range: '−20 °C à 40 °C', icon: Thermometer, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10',
    effects: 'Aucun malus, performances optimales',
    locations: 'Hurston, ArcCorp, intérieurs, stations', protection: 'Aucune protection spéciale nécessaire' },
  { zone: 'Chaud modéré', range: '40 °C à 100 °C', icon: Flame, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10',
    effects: 'Stamina −20 %, consommation O2 +25 %, déshydratation',
    locations: 'Daymar (jour), Aberdeen, zones industrielles', protection: 'Sous-combinaison thermique recommandée' },
  { zone: 'Chaleur extrême', range: '> 100 °C', icon: Flame, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10',
    effects: 'Hyperthermie rapide, stamina −50 %, dégâts HP continus, mort en ~2 min',
    locations: 'Arial (jour), zones volcaniques, proximité de lave', protection: 'Armure Pembroke / Novikov obligatoire' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Builds recommandés
══════════════════════════════════════════════════════════════ */

const BUILDS = [
  { name: 'Scout / Éclaireur', icon: Feather, color: 'text-emerald-400', border: 'border-emerald-500/30',
    armor: 'Légère intégrale (TrueDef, Arden)', weapon: 'Pistolet + SMG compact',
    stamina: 'Excellente — sprints longs, récupération rapide', ideal: 'Recon, livraisons, exploration, missions furtives',
    tips: 'Privilégiez la mobilité. Évitez le combat prolongé. Fuyez et repositionnez-vous.' },
  { name: 'Polyvalent / Mercenaire', icon: Shield, color: 'text-cyan-400', border: 'border-cyan-500/30',
    armor: 'Moyenne (Lynx, Paladin, Morozov)', weapon: 'AR + Shotgun ou Sniper',
    stamina: 'Correcte — sprints de 8-10 s, récupération modérée', ideal: 'Bunkers T1-T3, bounty, combat général',
    tips: 'Bon équilibre protection/mobilité. Gérez votre stamina entre les engagements.' },
  { name: 'Assaut lourd', icon: Weight, color: 'text-red-400', border: 'border-red-500/30',
    armor: 'Lourde (Citadel, ORC-mkX, Inquisitor)', weapon: 'LMG + Railgun ou Lance-grenades',
    stamina: 'Faible — sprints courts (5-6 s), récupération lente', ideal: 'Bunkers T4-T5, défense de position, escorte',
    tips: 'Ne sprintez pas inutilement. Progressez de couverture en couverture. Ayez un médic.' },
  { name: 'Survie extrême', icon: Thermometer, color: 'text-yellow-400', border: 'border-yellow-500/30',
    armor: 'Pembroke (froid) / Novikov (chaud)', weapon: 'Arme compacte uniquement',
    stamina: 'Variable — dépend de l\'environnement et de la température', ideal: 'Exploration extrême, minage surface, cave mining',
    tips: 'Emportez des MedPens supplémentaires. Surveillez la jauge thermique en permanence.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Section extensible
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-space-800 rounded-xl border border-space-400/20 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-space-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <div className="p-4 pt-0 border-t border-space-400/10">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */

export default function StaminaGuide() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-space-800 to-space-800 rounded-xl p-6 border border-emerald-500/20">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Wind className="w-8 h-8 text-emerald-400" />
          Stamina & Oxygène
        </h1>
        <p className="text-slate-400 mt-2">
          Guide complet de la gestion de l'endurance, de l'oxygène, de la gravité et de la survie thermique — Alpha 4.6
        </p>
      </div>

      {/* ── Résumé rapide ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Récupération stamina', value: '~3 %/s', sub: 'Au repos, gravité 1g', icon: Heart, color: 'text-green-400' },
          { label: 'Réserve O2 standard', value: '~200 min', sub: 'Marche, combi pressurisée', icon: Droplets, color: 'text-cyan-400' },
          { label: 'Sprint max (léger)', value: '~12 s', sub: 'Armure légère, 1g', icon: Zap, color: 'text-yellow-400' },
          { label: 'Sprint max (lourd)', value: '~6 s', sub: 'Armure lourde, 1g', icon: Weight, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="bg-space-800 rounded-xl p-4 border border-space-400/20 text-center">
            <s.icon className={clsx('w-6 h-6 mx-auto mb-2', s.color)} />
            <p className="text-2xl font-bold text-slate-100">{s.value}</p>
            <p className="text-sm text-slate-300">{s.label}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ══════ Section 1 — Système de Stamina ══════ */}
      <ExpandableSection title="Système de Stamina" icon={Activity} defaultOpen>
        <div className="space-y-4 mt-4">
          <div className="bg-space-900/60 rounded-lg p-4 border border-space-400/10">
            <h3 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Fonctionnement général
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              La barre de stamina représente l'endurance physique de votre personnage. Elle se vide lors d'efforts
              (sprint, saut, escalade, combat) et se régénère automatiquement au repos. Quand la stamina atteint 0 %,
              votre personnage est forcé de marcher, ne peut plus sauter et sa visée devient instable. La récupération
              commence après ~1 seconde d'inactivité physique.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left p-3 text-slate-400 font-medium">Activité</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Drain</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Récupération</th>
                </tr>
              </thead>
              <tbody>
                {STAMINA_ACTIVITIES.map((a) => (
                  <tr key={a.activity} className="border-b border-space-400/10 hover:bg-space-700/30">
                    <td className="p-3 flex items-center gap-2">
                      <a.icon className={clsx('w-4 h-4', a.color)} />
                      <span className="text-slate-200">{a.activity}</span>
                    </td>
                    <td className="p-3 text-center text-slate-300">{a.drain}</td>
                    <td className="p-3 text-center text-slate-300">{a.recovery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              <strong>Astuce :</strong> La récupération de stamina est plus rapide en position accroupie (+15 %)
              et encore plus rapide en position allongée (prone, +25 %). Utilisez ces positions entre deux sprints
              pour récupérer plus vite en situation de combat.
            </p>
          </div>
        </div>
      </ExpandableSection>

      {/* ══════ Section 2 — Oxygène ══════ */}
      <ExpandableSection title="Oxygène & Asphyxie" icon={Droplets}>
        <div className="space-y-4 mt-4">
          <div className="bg-space-900/60 rounded-lg p-4 border border-space-400/10">
            <h3 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Réserves d'oxygène
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Votre combinaison pressurisée dispose d'une réserve d'O2 finie. La consommation dépend de votre
              niveau d'activité physique et de l'environnement. En zone pressurisée (stations, vaisseaux, villes),
              l'O2 se recharge automatiquement. En EVA ou sur une lune sans atmosphère, votre réserve est votre
              seule source de vie.
            </p>
          </div>

          <h3 className="text-slate-200 font-medium mt-2">Consommation par activité</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left p-3 text-slate-400 font-medium">Activité</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Consommation</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Autonomie</th>
                </tr>
              </thead>
              <tbody>
                {OXYGEN_ACTIVITIES.map((a) => (
                  <tr key={a.activity} className="border-b border-space-400/10 hover:bg-space-700/30">
                    <td className={clsx('p-3', a.color)}>{a.activity}</td>
                    <td className="p-3 text-center text-slate-300">{a.consumption}</td>
                    <td className="p-3 text-center text-slate-300">{a.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-slate-200 font-medium mt-2">Phases d'asphyxie</h3>
          <div className="space-y-2">
            {OXYGEN_PHASES.map((p) => (
              <div key={p.phase} className="flex items-start gap-3 bg-space-900/40 rounded-lg p-3 border border-space-400/10">
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5', p.badge)}>{p.phase}</span>
                <span className="text-sm text-slate-300">{p.effect}</span>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>

      {/* ══════ Section 3 — Impact des armures ══════ */}
      <ExpandableSection title="Impact des armures" icon={Shield}>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-slate-400">
            Le poids de votre armure affecte directement votre drain de stamina, votre vitesse de déplacement
            et votre taux de récupération. Plus l'armure est lourde, plus elle protège mais plus elle pénalise
            votre mobilité.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARMOR_IMPACTS.map((a) => (
              <div key={a.type} className={clsx('rounded-xl p-4 border', a.border, a.bg)}>
                <div className="flex items-center gap-2 mb-3">
                  <a.icon className={clsx('w-5 h-5', a.color)} />
                  <h3 className="font-semibold text-slate-100">{a.type}</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Drain stamina :</span> {a.staminaDrain}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Pénalité vitesse :</span> {a.speedPenalty}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Récupération :</span> {a.recovery}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Réserve O2 :</span> {a.o2Reserve}</p>
                  <p className="text-slate-300 mt-2"><span className="text-slate-500">Idéal pour :</span> {a.ideal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>

      {/* ══════ Section 4 — Gravité ══════ */}
      <ExpandableSection title="Gravité par corps céleste" icon={Globe}>
        <div className="space-y-4 mt-4">
          <div className="bg-space-900/60 rounded-lg p-4 border border-space-400/10">
            <h3 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Multiplicateur de drain
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              La gravité locale multiplie directement le drain de stamina. Sur une lune à faible gravité (0.2g),
              vous consommez environ moitié moins d'endurance en sprintant. À l'inverse, une gravité supérieure
              à 1g augmente le drain. Le saut est également affecté : hauteur de saut plus grande en faible gravité
              mais même coût en stamina.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-400/20">
                  <th className="text-left p-3 text-slate-400 font-medium">Corps céleste</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Gravité</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Mult. drain</th>
                  <th className="text-center p-3 text-slate-400 font-medium">Système</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {GRAVITY_BODIES.map((b) => (
                  <tr key={b.body} className="border-b border-space-400/10 hover:bg-space-700/30">
                    <td className={clsx('p-3 font-medium', b.color)}>{b.body}</td>
                    <td className="p-3 text-center text-slate-300">{b.gravity}</td>
                    <td className="p-3 text-center text-slate-200 font-mono">{b.drainMult}</td>
                    <td className="p-3 text-center text-slate-400">{b.zone}</td>
                    <td className="p-3 text-slate-400 text-xs">{b.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ExpandableSection>

      {/* ══════ Section 5 — Gestion thermique ══════ */}
      <ExpandableSection title="Gestion thermique" icon={Thermometer}>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-slate-400">
            La température ambiante affecte votre stamina, votre consommation d'O2 et peut causer des dégâts
            directs. Les armures spécialisées (Pembroke pour le froid, Novikov pour la chaleur) sont indispensables
            dans les environnements extrêmes.
          </p>
          <div className="space-y-3">
            {THERMAL_ZONES.map((z) => (
              <div key={z.zone} className={clsx('rounded-xl p-4 border', z.border, z.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <z.icon className={clsx('w-5 h-5', z.color)} />
                  <h3 className="font-semibold text-slate-100">{z.zone}</h3>
                  <span className="text-xs text-slate-500 ml-auto">{z.range}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Effets :</span> {z.effects}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Lieux :</span> {z.locations}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Protection :</span> {z.protection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExpandableSection>

      {/* ══════ Section 6 — Builds recommandés ══════ */}
      <ExpandableSection title="Optimisation & Builds recommandés" icon={Gauge}>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-slate-400">
            Choisir le bon équipement selon la mission est crucial. Voici quatre profils types avec
            leurs compromis stamina/protection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUILDS.map((b) => (
              <div key={b.name} className={clsx('rounded-xl p-4 border', b.border, 'bg-space-900/60')}>
                <div className="flex items-center gap-2 mb-3">
                  <b.icon className={clsx('w-5 h-5', b.color)} />
                  <h3 className="font-semibold text-slate-100">{b.name}</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Armure :</span> {b.armor}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Armes :</span> {b.weapon}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Stamina :</span> {b.stamina}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Idéal :</span> {b.ideal}</p>
                  <div className="mt-2 bg-space-800/80 rounded-lg p-2 border border-space-400/10">
                    <p className="text-xs text-cyan-300 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {b.tips}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex gap-3 mt-4">
            <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-200">
              <strong>Conseil de survie :</strong> Emportez toujours au moins 2 MedPens et 1 OxyPen lors de missions
              longues. L'OxyPen restaure 25 % d'O2 instantanément et peut sauver votre vie en cas de brèche de
              combinaison ou de mauvais calcul d'autonomie.
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="stamina" />
    </div>
  );
}
