import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Heart, ChevronDown, ChevronUp, AlertTriangle, Pill, Activity,
  Shield, MapPin, Clock, Zap, Syringe, Cross, Thermometer,
  Users, BookOpen, Info, Star, Eye, Skull, HeartPulse,
} from 'lucide-react';
import CommentsSection from '../../ui/components/CommentsSection.jsx';

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Tiers médicaux
══════════════════════════════════════════════════════════════ */

const MEDICAL_TIERS = [
  {
    tier: 1,
    name: 'Soins Basiques',
    icon: Heart,
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    description: 'Premiers secours sur le terrain. Accessible à tout joueur via MedPens et bandages.',
    capabilities: ['Stopper un saignement léger', 'Restaurer 30–50% de santé', 'Stabiliser temporairement un blessé', 'Applicable en mouvement'],
    limits: ['Ne soigne pas les fractures', 'Ne réanime pas un joueur incapacité', 'Effets temporaires uniquement'],
    tools: 'MedPen T1, Hemozal Bandage, ParaMed basique',
  },
  {
    tier: 2,
    name: 'Soins Avancés',
    icon: Activity,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    description: 'Soins intermédiaires nécessitant un MedGun ou un lit médical T2. Présent dans certains vaisseaux.',
    capabilities: ['Réanimer un joueur incapacité', 'Soigner fractures et blessures internes', 'Restaurer 75–100% de santé', 'Diagnostic avancé des blessures'],
    limits: ['Ne régénère pas un membre perdu', 'Temps de soin plus long (5–10s)', 'Nécessite équipement spécialisé'],
    tools: 'MedGun CureLife, MedPen T2, Lit médical T2 (Cutlass Red, Carrack)',
  },
  {
    tier: 3,
    name: 'Hôpital / Régénération',
    icon: Cross,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    description: 'Soins complets en installation médicale. Seul moyen de régénérer un clone après la mort.',
    capabilities: ['Régénération complète du corps', 'Point de respawn après la mort', 'Soins de toutes blessures sans exception', 'Réinitialisation complète des effets de drogues'],
    limits: ['Uniquement dans les hôpitaux et cliniques', 'Coût de régénération (500–5 000 aUEC)', 'File d\'attente possible en zone peuplée'],
    tools: 'Lit de régénération T3, Cliniques spatiales, Hôpitaux planétaires',
  },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Médicaments & Drogues
══════════════════════════════════════════════════════════════ */

const MEDICATIONS = [
  { name: 'MedPen T1 (Hemozal)', type: 'Médical', badge: 'badge-green', effect: 'Stoppe saignement, +30% HP sur 10s', sideEffect: 'Aucun', overdose: 'Non', price: '100 aUEC', notes: 'Consommable de base, toujours en avoir 3–5.' },
  { name: 'MedPen T2 (Demexatrine)', type: 'Médical', badge: 'badge-blue', effect: 'Soigne fractures, +50% HP, anti-douleur', sideEffect: 'Légère somnolence (-5% vitesse)', overdose: 'Rare', price: '350 aUEC', notes: 'Indispensable pour les missions Tier 3+.' },
  { name: 'ParaMed', type: 'Médical', badge: 'badge-cyan', effect: 'Stabilisation d\'urgence, empêche la mort pendant 30s', sideEffect: 'Vision légèrement floue', overdose: 'Non', price: '500 aUEC', notes: 'Utiliser sur un allié incapacité pour gagner du temps.' },
  { name: 'OxyPen', type: 'Médical', badge: 'badge-green', effect: 'Restaure l\'oxygène (+25% O2), anti-asphyxie', sideEffect: 'Aucun', overdose: 'Non', price: '150 aUEC', notes: 'Vital en environnement sans atmosphère.' },
  { name: 'SLAM', type: 'Drogue', badge: 'badge-red', effect: '+20% résistance aux dégâts, +15% vitesse de mêlée', sideEffect: 'Tremblements, vision rouge, +dégâts reçus après effet', overdose: 'Oui (3+ doses)', price: '850 aUEC', notes: 'Populaire en combat rapproché. Très addictif.' },
  { name: 'Neon', type: 'Drogue', badge: 'badge-purple', effect: 'Vision améliorée (night-vision), +10% précision', sideEffect: 'Sensibilité à la lumière, nausées', overdose: 'Oui (4+ doses)', price: '600 aUEC', notes: 'Utile en bunker sombre. Durée ~5 minutes.' },
  { name: 'WiDoW', type: 'Drogue', badge: 'badge-red', effect: '+25% régénération passive, euphorie, réduction douleur', sideEffect: 'Ralentissement marqué, vision trouble, dépendance', overdose: 'Oui (2+ doses)', price: '1 200 aUEC', notes: 'Drogue la plus dangereuse. Overdose souvent fatale.' },
  { name: 'Alesta', type: 'Drogue', badge: 'badge-yellow', effect: '+10% vitesse de déplacement, réflexes améliorés', sideEffect: 'Palpitations, anxiété, tremblement léger', overdose: 'Oui (3+ doses)', price: '750 aUEC', notes: 'Stimulant militaire détourné. Effets modérés.' },
  { name: 'E\'tam', type: 'Drogue', badge: 'badge-yellow', effect: '+15% vitesse de minage, concentration accrue', sideEffect: 'Fatigue post-effet, migraines', overdose: 'Oui (4+ doses)', price: '500 aUEC', notes: 'Drogue de travail. Populaire chez les mineurs.' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Équipement médical
══════════════════════════════════════════════════════════════ */

const MEDICAL_EQUIPMENT = [
  { name: 'MedGun CureLife', icon: Syringe, type: 'Outil', tier: 'T2', color: 'text-cyan-400', description: 'Pistolet médical multi-fonction. Soigne, réanime et diagnostique à distance (3m). Mode soin continu ou injection ciblée.', location: 'Magasins médicaux, loot bunker' },
  { name: 'MedBed T2', icon: Cross, type: 'Lit médical', tier: 'T2', color: 'text-blue-400', description: 'Lit de soins avancés embarqué. Soigne fractures et blessures graves. Présent dans Cutlass Red, Carrack, 890 Jump.', location: 'Vaisseaux médicaux' },
  { name: 'MedBed T3', icon: Cross, type: 'Lit régénération', tier: 'T3', color: 'text-purple-400', description: 'Lit de régénération complète. Point de respawn. Uniquement dans les hôpitaux et cliniques stationnaires.', location: 'Hôpitaux, cliniques spatiales' },
  { name: 'ParaMed Device', icon: HeartPulse, type: 'Outil', tier: 'T1–T2', color: 'text-green-400', description: 'Injecteur d\'urgence stabilisateur. Empêche un joueur incapacité de mourir pendant 30s, laissant le temps de le soigner.', location: 'Magasins médicaux, pharmacies' },
  { name: 'Hemozal Bandage', icon: Shield, type: 'Consommable', tier: 'T1', color: 'text-yellow-400', description: 'Bandage compressif hémostatique. Stoppe le saignement externe et restaure lentement la santé (+2% HP/s pendant 15s).', location: 'Partout (magasins, loot)' },
  { name: 'Scanner Médical', icon: Eye, type: 'Outil', tier: 'T2', color: 'text-teal-400', description: 'Mode scan du MedGun : affiche les blessures, zones touchées, niveau de santé et effets actifs d\'un joueur ciblé.', location: 'Intégré au MedGun' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Triage & Priorités
══════════════════════════════════════════════════════════════ */

const TRIAGE_PRIORITIES = [
  { priority: 1, label: 'Critique', badge: 'badge-red', color: 'text-red-400', condition: 'Incapacité / Timer de mort actif', action: 'ParaMed immédiat → MedGun réanimation → MedPen T2', timer: '~60s avant mort définitive', notes: 'Priorité absolue. Sans intervention, le joueur meurt et respawn à l\'hôpital.' },
  { priority: 2, label: 'Grave', badge: 'badge-yellow', color: 'text-yellow-400', condition: 'Saignement actif + blessure T2 (fracture, organe)', action: 'Hemozal Bandage → MedPen T2 → Repos ou lit T2', timer: '~2–3min avant incapacité', notes: 'Le saignement draine la vie rapidement. Stopper le flux en premier.' },
  { priority: 3, label: 'Modéré', badge: 'badge-blue', color: 'text-blue-400', condition: 'Fracture sans saignement / Membre endommagé', action: 'MedPen T1 ou T2 selon gravité', timer: 'Pas de timer, mobilité réduite', notes: 'Le joueur peut combattre mais avec des pénalités (visée, vitesse).' },
  { priority: 4, label: 'Léger', badge: 'badge-green', color: 'text-green-400', condition: 'HP bas sans blessure spécifique', action: 'MedPen T1 ou régénération naturelle', timer: 'Aucun danger immédiat', notes: 'Traiter après le combat. La régénération passive existe hors combat.' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Réanimation
══════════════════════════════════════════════════════════════ */

const REVIVE_STEPS = [
  { step: 1, icon: Eye, title: 'Identifier le joueur incapacité', detail: 'Le joueur est au sol avec une icône de crâne/coeur clignotant. Un timer de 60 secondes commence.' },
  { step: 2, icon: Shield, title: 'Sécuriser la zone', detail: 'Éliminez les menaces proches avant de soigner. Un médecin mort ne sauve personne.' },
  { step: 3, icon: HeartPulse, title: 'Stabiliser avec ParaMed', detail: 'Si disponible, injectez un ParaMed pour suspendre le timer de mort (+30s de sursis).' },
  { step: 4, icon: Syringe, title: 'Réanimer au MedGun', detail: 'Visez le joueur avec le MedGun CureLife et maintenez le tir pendant 5–8 secondes. Le joueur se relève à ~25% HP.' },
  { step: 5, icon: Heart, title: 'Soigner post-réanimation', detail: 'Appliquez un MedPen T2 pour restaurer la santé complète et soigner les blessures résiduelles.' },
  { step: 6, icon: Info, title: 'Vérifier les effets', detail: 'Scannez le joueur réanimé — des fractures ou saignements internes peuvent persister après la réanimation.' },
];

const RESPAWN_RULES = [
  { rule: 'Mort sans lit T3 à proximité', result: 'Respawn au dernier hôpital/clinique visité', cost: '500–5 000 aUEC (régénération)' },
  { rule: 'Mort avec lit T3 vaisseau (Carrack, etc.)', result: 'Respawn dans le vaisseau si actif et à portée', cost: 'Gratuit (consomme des fournitures médicales vaisseau)' },
  { rule: 'Mort en zone de guerre (Jumptown, etc.)', result: 'Respawn au dernier hôpital — inventaire perdu sur le corps', cost: '500–2 000 aUEC + perte d\'inventaire' },
  { rule: 'Mort par overdose', result: 'Respawn hôpital, effets de drogue réinitialisés', cost: '1 000 aUEC' },
  { rule: 'Mort en prison (Klescher)', result: 'Respawn à l\'infirmerie de la prison', cost: 'Gratuit mais temps de peine conservé' },
];

/* ══════════════════════════════════════════════════════════════
   DONNÉES — Hôpitaux & Cliniques
══════════════════════════════════════════════════════════════ */

const HOSPITALS = [
  { name: 'Hôpital Maria Pure of Heart', location: 'Lorville, Hurston', type: 'Hôpital', tier: 'T3', badge: 'badge-purple', services: 'Régénération, soins complets, pharmacie, respawn', notes: 'Le plus grand hôpital de Stanton.' },
  { name: 'Clinique August Dunlow', location: 'Area18, ArcCorp', type: 'Clinique', tier: 'T3', badge: 'badge-purple', services: 'Régénération, soins avancés, pharmacie', notes: 'Accès rapide depuis le spaceport.' },
  { name: 'Hôpital Brentworth Care Center', location: 'Orison, Crusader', type: 'Hôpital', tier: 'T3', badge: 'badge-purple', services: 'Régénération, soins complets, pharmacie', notes: 'Vue magnifique depuis les plateformes.' },
  { name: 'Clinique de New Babbage', location: 'New Babbage, microTech', type: 'Clinique', tier: 'T3', badge: 'badge-purple', services: 'Régénération, soins complets, pharmacie', notes: 'Proche du Commons shopping center.' },
  { name: 'Infirmerie GrimHEX', location: 'GrimHEX, Yela', type: 'Clinique', tier: 'T2–T3', badge: 'badge-yellow', services: 'Régénération, soins basiques, pas de pharmacie officielle', notes: 'Seul point médical pour criminels. Pas de questions posées.' },
  { name: 'Stations Spatiales (Port Olisar, Everus, etc.)', location: 'Orbite, Stanton', type: 'Clinique', tier: 'T2–T3', badge: 'badge-blue', services: 'Régénération, soins avancés', notes: 'Chaque station orbitale a une clinique. Respawn par défaut.' },
  { name: 'Cutlass Red (MedBed)', location: 'Vaisseau joueur', type: 'Vaisseau médical', tier: 'T2', badge: 'badge-cyan', services: 'Soins avancés, réanimation, pas de régénération', notes: 'Vaisseau ambulance. Pas de respawn mais soins T2 mobiles.' },
  { name: 'Carrack (MedBay)', location: 'Vaisseau joueur', type: 'Vaisseau médical', tier: 'T2–T3', badge: 'badge-cyan', services: 'Soins complets, respawn possible (T3)', notes: 'Meilleur vaisseau médical mobile. Respawn d\'équipage.' },
  { name: 'Infirmerie Klescher', location: 'Prison Klescher, Aberdeen', type: 'Infirmerie', tier: 'T2', badge: 'badge-red', services: 'Soins basiques, respawn prison', notes: 'Soins limités. Pas de pharmacie.' },
];

/* ══════════════════════════════════════════════════════════════
   COMPOSANT — Section Extensible
══════════════════════════════════════════════════════════════ */

function ExpandableSection({ title, icon: Icon, children, defaultOpen = false, count }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-space-800 rounded-xl border border-space-400/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-space-700/50 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          {count != null && <span className="text-xs bg-space-700 text-slate-400 px-2 py-0.5 rounded-full">{count}</span>}
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

export default function HealingGuide() {
  const [drugFilter, setDrugFilter] = useState('all');

  const filteredMeds = drugFilter === 'all'
    ? MEDICATIONS
    : MEDICATIONS.filter(m => m.type === (drugFilter === 'medical' ? 'Médical' : 'Drogue'));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-red-500/10 via-space-800 to-space-800 rounded-xl p-6 border border-red-500/20">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-400" />
          Système Médical & Réanimation
        </h1>
        <p className="text-slate-400 mt-2">
          Tiers médicaux, médicaments, drogues, triage et procédures de réanimation — Alpha 4.6
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-green-400"><Shield className="w-4 h-4" /> 3 tiers de soin</span>
          <span className="flex items-center gap-1.5 text-cyan-400"><Pill className="w-4 h-4" /> {MEDICATIONS.length} substances</span>
          <span className="flex items-center gap-1.5 text-purple-400"><MapPin className="w-4 h-4" /> {HOSPITALS.length} lieux médicaux</span>
        </div>
      </div>

      {/* ── Section 1 : Tiers Médicaux ── */}
      <ExpandableSection title="Système Médical — 3 Tiers" icon={Activity} defaultOpen count={3}>
        <div className="grid gap-4 mt-3">
          {MEDICAL_TIERS.map(t => (
            <div key={t.tier} className={clsx('rounded-lg border p-4', t.border, t.bg)}>
              <div className="flex items-center gap-3 mb-3">
                <t.icon className={clsx('w-6 h-6', t.color)} />
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Tier {t.tier} — {t.name}</h3>
                  <p className="text-sm text-slate-400">{t.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">Capacités</p>
                  <ul className="space-y-1">
                    {t.capabilities.map((c, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1">Limites</p>
                  <ul className="space-y-1">
                    {t.limits.map((l, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">✗</span>{l}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 mt-2"><span className="text-slate-400 font-medium">Outils :</span> {t.tools}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* ── Section 2 : Médicaments & Drogues ── */}
      <ExpandableSection title="Médicaments & Drogues" icon={Pill} count={MEDICATIONS.length}>
        <div className="mt-3 space-y-4">
          {/* Filtre */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'medical', label: 'Médicaux' },
              { key: 'drug', label: 'Drogues' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setDrugFilter(f.key)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  drugFilter === f.key
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-space-700/50 text-slate-400 border border-space-400/20 hover:bg-space-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-space-400/20">
                  <th className="pb-2 pr-3">Substance</th>
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2 pr-3">Effet</th>
                  <th className="pb-2 pr-3">Effets secondaires</th>
                  <th className="pb-2 pr-3">Overdose</th>
                  <th className="pb-2">Prix</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((m, i) => (
                  <tr key={i} className="border-b border-space-400/10 hover:bg-space-700/30">
                    <td className="py-2.5 pr-3 font-medium text-slate-200">{m.name}</td>
                    <td className="py-2.5 pr-3"><span className={m.badge}>{m.type}</span></td>
                    <td className="py-2.5 pr-3 text-slate-300">{m.effect}</td>
                    <td className="py-2.5 pr-3 text-slate-400">{m.sideEffect}</td>
                    <td className="py-2.5 pr-3">
                      <span className={m.overdose === 'Non' ? 'text-green-400' : 'text-red-400'}>{m.overdose}</span>
                    </td>
                    <td className="py-2.5 text-gold-400">{m.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Avertissement overdose */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-red-400 font-medium">Système d'overdose</p>
              <p className="text-slate-300 mt-1">
                Chaque drogue a un seuil de doses consécutives. Le dépasser provoque des effets graves :
                vision noire, perte de contrôle, incapacitation voire mort instantanée.
                Les effets de drogue persistent ~5–10 minutes. Attendre la fin avant de reprendre une dose.
              </p>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 3 : Équipement Médical ── */}
      <ExpandableSection title="Équipement Médical" icon={Syringe} count={MEDICAL_EQUIPMENT.length}>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {MEDICAL_EQUIPMENT.map((eq, i) => (
            <div key={i} className="bg-space-900/60 rounded-lg border border-space-400/15 p-4">
              <div className="flex items-center gap-3 mb-2">
                <eq.icon className={clsx('w-5 h-5', eq.color)} />
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{eq.name}</h4>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs bg-space-700 text-slate-400 px-1.5 py-0.5 rounded">{eq.type}</span>
                    <span className="text-xs bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded">{eq.tier}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{eq.description}</p>
              <p className="text-xs text-slate-500 mt-2">
                <span className="text-slate-400">Où trouver :</span> {eq.location}
              </p>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* ── Section 4 : Triage & Priorités ── */}
      <ExpandableSection title="Triage & Priorités de Soin" icon={AlertTriangle} count={4}>
        <div className="space-y-3 mt-3">
          {TRIAGE_PRIORITIES.map(t => (
            <div key={t.priority} className="bg-space-900/60 rounded-lg border border-space-400/15 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={clsx('text-2xl font-bold', t.color)}>P{t.priority}</span>
                <div>
                  <span className={t.badge}>{t.label}</span>
                  <p className="text-sm text-slate-300 mt-1">{t.condition}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Action recommandée</p>
                  <p className="text-slate-200">{t.action}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Timer</p>
                  <p className={t.color}>{t.timer}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-slate-400">{t.notes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* ── Section 5 : Réanimation ── */}
      <ExpandableSection title="Procédure de Réanimation" icon={HeartPulse}>
        <div className="mt-3 space-y-6">
          {/* Étapes */}
          <div className="space-y-3">
            {REVIVE_STEPS.map(s => (
              <div key={s.step} className="flex items-start gap-4 bg-space-900/60 rounded-lg border border-space-400/15 p-3">
                <div className="flex flex-col items-center shrink-0">
                  <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">{s.step}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <s.icon className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-slate-100">{s.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Règles de respawn */}
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-400" />
              Règles de Respawn (Mort Définitive)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-space-400/20">
                    <th className="pb-2 pr-3">Situation</th>
                    <th className="pb-2 pr-3">Résultat</th>
                    <th className="pb-2">Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {RESPAWN_RULES.map((r, i) => (
                    <tr key={i} className="border-b border-space-400/10">
                      <td className="py-2.5 pr-3 text-slate-200">{r.rule}</td>
                      <td className="py-2.5 pr-3 text-slate-300">{r.result}</td>
                      <td className="py-2.5 text-gold-400">{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ── Section 6 : Hôpitaux & Cliniques ── */}
      <ExpandableSection title="Hôpitaux & Cliniques" icon={MapPin} count={HOSPITALS.length}>
        <div className="space-y-3 mt-3">
          {HOSPITALS.map((h, i) => (
            <div key={i} className="bg-space-900/60 rounded-lg border border-space-400/15 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-slate-100">{h.name}</h4>
                  <span className={h.badge}>{h.type}</span>
                  <span className="text-xs bg-space-700 text-slate-400 px-1.5 py-0.5 rounded">{h.tier}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1"><MapPin className="w-3 h-3 inline mr-1" />{h.location}</p>
                <p className="text-sm text-slate-300 mt-1">{h.services}</p>
              </div>
              <p className="text-xs text-slate-500 sm:text-right sm:max-w-[200px]">{h.notes}</p>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* ── Conseils Médic ── */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-space-800 to-space-800 rounded-xl p-5 border border-cyan-500/20">
        <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5" />
          Conseils du Médic Vétéran
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2"><Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />Gardez toujours 3 MedPens T1 et 1 ParaMed dans votre inventaire — même pour des missions "faciles".</li>
          <li className="flex items-start gap-2"><Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />En groupe, désignez un médic dédié avec MedGun + MedPens T2. Un médic actif double la survie du groupe.</li>
          <li className="flex items-start gap-2"><Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />Ne réanimez jamais sous le feu — sécurisez d'abord, soignez ensuite. Un médic mort = tout le groupe en danger.</li>
          <li className="flex items-start gap-2"><Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />La Cutlass Red est le meilleur investissement pour un joueur médic solo (lit T2 + cargo pour le loot).</li>
          <li className="flex items-start gap-2"><Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />Après une réanimation, le joueur a souvent des blessures résiduelles — scannez-le systématiquement.</li>
          <li className="flex items-start gap-2"><Star className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />Les drogues peuvent sauver une situation désespérée, mais l'overdose tue plus de joueurs que les ennemis.</li>
        </ul>
      </div>

      {/* Commentaires */}
      <CommentsSection targetType="mechanic" targetId="healing" />
    </div>
  );
}
