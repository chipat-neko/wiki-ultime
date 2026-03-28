import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Package, ChevronDown, ChevronUp, Info, AlertTriangle, Shield,
  Box, Shirt, Crosshair, Apple, Wrench, Gem, Backpack, Ship,
  Skull, Heart, Lightbulb, Coffee, Pill, Flame, BookOpen,
} from 'lucide-react';

/* ─── Donn\ées ─── */

const STORAGE_CAPACITIES = [
  {
    label: 'Armure L\ég\ère',
    icon: Shield,
    slots: '2-4 slots utilitaires',
    desc: 'Capacit\é limit\ée, id\éal pour les missions rapides et l\'exploration l\ég\ère. Privil\égier les objets essentiels uniquement.',
    color: 'border-green-500/40',
    headerBg: 'bg-green-900/30',
    badgeCls: 'badge-green',
  },
  {
    label: 'Armure M\édium',
    icon: Shield,
    slots: '4-6 slots utilitaires',
    desc: 'Bon \équilibre entre protection et capacit\é de stockage. Recommand\ée pour la plupart des activit\és de combat et d\'exploration.',
    color: 'border-cyan-500/40',
    headerBg: 'bg-cyan-900/30',
    badgeCls: 'badge-cyan',
  },
  {
    label: 'Armure Lourde',
    icon: Shield,
    slots: '6-8 slots utilitaires',
    desc: 'Capacit\é maximale sur armure. Parfaite pour les op\érations longues, le pillage et les missions FPS intensives.',
    color: 'border-purple-500/40',
    headerBg: 'bg-purple-900/30',
    badgeCls: 'badge-purple',
  },
  {
    label: 'Backpack / Sac \à dos',
    icon: Backpack,
    slots: '+4-8 slots suppl\émentaires',
    desc: 'Se porte en plus de l\'armure. Indispensable pour le minage FPS, le salvage et le loot intensif. Certains sacs offrent jusqu\'\à 8 slots.',
    color: 'border-yellow-500/40',
    headerBg: 'bg-yellow-900/30',
    badgeCls: 'badge-yellow',
  },
  {
    label: 'Stockage Vaisseau',
    icon: Ship,
    slots: 'Variable (petit \à grand)',
    desc: 'Chaque vaisseau dispose d\'un inventaire local propre. Les gros cargos offrent un espace cons\équent, tandis que les chasseurs sont tr\ès limit\és.',
    color: 'border-blue-500/40',
    headerBg: 'bg-blue-900/30',
    badgeCls: 'badge-blue',
  },
];

const ITEM_CATEGORIES = [
  { category: 'Armes FPS', icon: Crosshair, badge: 'badge-red', items: 'Pistolets, fusils d\'assaut, SMGs, fusils \à pompe, snipers, lance-roquettes', note: 'Chaque arme occupe 1-2 slots selon la taille' },
  { category: 'Armures', icon: Shirt, badge: 'badge-cyan', items: 'Casques, plastrons, bras, jambes, undersuit', note: 'Les pi\èces d\'armure se portent ou se stockent individuellement' },
  { category: 'Consommables', icon: Pill, badge: 'badge-green', items: 'Medipens, oxypens, grenades, bo\îtes de munitions', note: 'Stackables en quantit\é limit\ée par slot' },
  { category: 'Utilitaires', icon: Wrench, badge: 'badge-yellow', items: 'Multitools, tractor beams, scanners portatifs', note: 'Essentiels pour les activit\és sp\écialis\ées' },
  { category: 'Mat\ériaux', icon: Gem, badge: 'badge-purple', items: 'Min\éraux, composants de crafting, data drives', note: 'Issus du minage FPS, salvage et missions d\'investigation' },
  { category: 'Nourriture & Boissons', icon: Apple, badge: 'badge-blue', items: 'Burritos, boissons \énergisantes, alcools, rations', note: 'Fournissent des buffs temporaires non n\égligeables' },
];

const FOOD_DRINK_BUFFS = [
  { name: 'Burritos', effect: '+R\ég\én\ération de stamina', duration: '30 min', source: 'Food courts, distributeurs', risk: 'Aucun', badgeCls: 'badge-green' },
  { name: 'Boissons \énergisantes', effect: '+Vitesse de sprint (+5-10%)', duration: '20 min', source: 'Distributeurs, bars', risk: 'Aucun', badgeCls: 'badge-cyan' },
  { name: 'Alcools (bi\ères, whisky)', effect: '-Pr\écision de vis\ée, +R\ésistance aux d\ég\âts (fun)', duration: '15 min', source: 'Bars, tavernes', risk: 'Vision floue, d\émarche instable', badgeCls: 'badge-yellow' },
  { name: 'Medipens / Items m\édicaux', effect: 'R\ég\én\ération HP, soin de blessures', duration: '5-20 min', source: 'Medstores, pharmacies', risk: 'Aucun', badgeCls: 'badge-blue' },
  { name: 'SLAM', effect: '+Dommages m\êl\ée, +R\ésistance, perception alt\ér\ée', duration: '3 min', source: 'March\é noir, Grim HEX', risk: 'Overdose possible, effet de descente', badgeCls: 'badge-red' },
  { name: 'N\éon', effect: '+Perception visuelle, halo lumineux, euphorie', duration: '5 min', source: 'March\é noir, clubs ill\égaux', risk: 'Overdose \à forte dose, d\épendance', badgeCls: 'badge-purple' },
  { name: 'Stims g\én\ériques', effect: 'Effets vari\és (stamina, vitesse, focus)', duration: '3-10 min', source: 'March\é noir, certains avant-postes', risk: 'Effets secondaires, l\égalit\é variable', badgeCls: 'badge-slate' },
];

const MANAGEMENT_TIPS = [
  {
    title: 'O\ù stocker son \équipement',
    icon: Box,
    content: [
      'Privil\égiez les stations principales (Area 18, Lorville, New Babbage, Orison) comme bases de stockage \— elles sont stables et bien desservies.',
      'Les avant-postes et Rest Stops ont un inventaire local, mais risqu\é en cas de bug serveur.',
      'Les inventaires de vaisseaux persistent entre les sessions tant que le vaisseau n\'est pas d\étruit ou r\éclam\é.',
      'Conseil : gardez un "kit de survie" dupliqu\é dans 2-3 stations diff\érentes.',
    ],
  },
  {
    title: 'G\érer la perte de mort',
    icon: Skull,
    content: [
      '\Équipez-vous de mani\ère "jetable" pour les missions risqu\ées \— pas votre meilleur stuff.',
      'Avant une zone PvP, stockez votre \équipement pr\écieux \à la station la plus proche.',
      'Les objets dropp\és \à la mort restent au sol pendant un temps limit\é (environ 15-20 min serveur).',
      'Astuce : un ami peut r\écup\érer votre loot si vous mourrez et lui indiquez la position.',
    ],
  },
  {
    title: 'Transport entre locations',
    icon: Ship,
    content: [
      'Utilisez un vaisseau cargo pour d\éplacer du mat\ériel entre stations (pas de transfert magique).',
      'Chargez manuellement les bo\îtes et objets dans la soute de votre vaisseau via le tractor beam.',
      'Attention : un vaisseau d\étruit en transit = perte de tout le contenu non assur\é.',
      'Les v\éhicules terrestres stock\és dans un vaisseau conservent leur propre inventaire.',
    ],
  },
  {
    title: 'Organiser par activit\é (loadouts)',
    icon: Shirt,
    content: [
      'Loadout PvP : armure m\édium/lourde, arme principale + secondaire, medipens x5, grenades x4.',
      'Loadout Minage FPS : armure l\ég\ère, backpack, multitool + t\êtes de minage, bo\îtes de stockage.',
      'Loadout Trading : undersuit l\éger, pistolet de d\éfense, cr\édit max pour le cargo.',
      'Loadout Exploration : armure m\édium, scanner, nourriture/boissons, medipens, oxypens.',
    ],
  },
];

const DEATH_RECOVERY = [
  { label: 'Drop d\'\équipement', desc: 'Tout l\'\équipement port\é (armes, armure, backpack, consommables) tombe au sol \à l\'endroit exact de votre mort. Seuls les objets dans votre inventaire de station sont pr\éserv\és.', icon: Package, badgeCls: 'badge-red' },
  { label: 'Loot du backpack', desc: 'Votre backpack et son contenu sont lootables par n\'importe quel joueur \à proximit\é. En zone PvP, attendez-vous \à ne rien retrouver.', icon: Backpack, badgeCls: 'badge-yellow' },
  { label: 'Assurance vs objets perdus', desc: 'L\'assurance vaisseau ne couvre PAS l\'\équipement FPS. Seuls le vaisseau et ses composants standards sont remplac\és. Votre stuff personnel est perdu d\éfinitivement.', icon: Shield, badgeCls: 'badge-cyan' },
  { label: 'R\écup\ération de corps', desc: 'Un co-\équipier peut se rendre sur votre lieu de mort pour r\écup\érer votre \équipement. Utilisez un beacon de r\écup\ération ou communiquez vos coordonn\ées.', icon: Heart, badgeCls: 'badge-green' },
];

const PRO_TIPS = [
  'Gardez toujours 3-5 medipens et 2 oxypens sur vous, quelle que soit la mission.',
  'Dupliquez votre loadout de base dans au moins 2 stations diff\érentes pour r\éduire le temps de r\é\équipement apr\ès une mort.',
  'Utilisez le tractor beam pour organiser les caisses dans votre soute \— empilez-les proprement pour maximiser l\'espace.',
  'Avant de vous d\éconnecter, stockez votre \équipement pr\écieux en station \— les crashes serveur peuvent causer des pertes.',
  'Les bo\îtes de stockage personnelles (personal boxes) sont le meilleur moyen de transporter des objets en vrac entre stations.',
  'En groupe, d\ésignez un "mule" \— un joueur avec armure lourde + backpack d\édi\é au transport du loot.',
  'V\érifiez r\éguli\èrement vos inventaires de station via le MobiGlas \— des objets peuvent s\'y accumuler sans que vous le remarquiez.',
  'Les distributeurs automatiques en station vendent des consommables \à prix r\éduit \— faites le plein avant chaque sortie.',
];

/* ─── Composant section d\épliable ─── */

function ExpandableSection({ title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-space-400/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-space-800/60 hover:bg-space-700/50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-slate-100 font-semibold">
          {Icon && <Icon size={18} className="text-cyan-400" />}
          {title}
        </span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="p-4 bg-space-900/40">{children}</div>}
    </div>
  );
}

/* ─── Composant principal ─── */

export default function InventoryGuide() {
  const [expandedCapacity, setExpandedCapacity] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">

      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
          <Package size={32} className="text-cyan-400" />
          Inventaire & Gestion d'\Équipement
        </h1>
        <p className="text-slate-400 text-lg">Comprendre le syst\ème d'inventaire local de Star Citizen</p>
        <span className="inline-block badge-cyan text-xs mt-1">Alpha 4.6</span>
      </div>

      {/* ── Syst\ème d'inventaire local ── */}
      <div className="border border-cyan-500/30 rounded-lg bg-space-800/50 p-5 space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Info size={20} className="text-cyan-400" />
          Syst\ème d'inventaire local
        </h2>
        <p className="text-slate-300 leading-relaxed">
          Dans Star Citizen, l'inventaire est <span className="text-cyan-300 font-semibold">physique et localis\é</span>.
          Il n'y a pas de stockage magique ou d'acc\ès universel \à vos objets. Chaque lieu (station, ville, avant-poste, vaisseau)
          poss\ède son propre inventaire ind\épendant.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {[
            { icon: Box, title: 'Inventaire physique', text: 'Les objets existent physiquement dans le monde. Vous devez les transporter manuellement d\'un lieu \à un autre.' },
            { icon: Package, title: 'Stockage par location', text: 'Chaque station, ville et vaisseau dispose de son propre espace de stockage. Rien n\'est partag\é automatiquement.' },
            { icon: Skull, title: 'Mort = perte totale', text: 'En mourant, tout l\'\équipement port\é tombe au sol. Seuls les objets en station restent en s\écurit\é.' },
          ].map((item, i) => (
            <div key={i} className="border border-space-400/20 rounded-lg p-3 bg-space-900/40">
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={16} className="text-cyan-400" />
                <span className="text-slate-100 font-semibold text-sm">{item.title}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Capacit\és de stockage ── */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Box size={20} className="text-cyan-400" />
          Capacit\és de stockage
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STORAGE_CAPACITIES.map((cap, i) => {
            const Icon = cap.icon;
            const isOpen = expandedCapacity === i;
            return (
              <div
                key={i}
                className={clsx('border rounded-lg overflow-hidden cursor-pointer transition-all', cap.color, isOpen && 'ring-1 ring-cyan-400/30')}
                onClick={() => setExpandedCapacity(isOpen ? null : i)}
              >
                <div className={clsx('flex items-center justify-between px-4 py-3', cap.headerBg)}>
                  <span className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
                    <Icon size={16} />
                    {cap.label}
                  </span>
                  <span className={clsx('text-xs', cap.badgeCls)}>{cap.slots}</span>
                </div>
                {isOpen && (
                  <div className="p-3 bg-space-900/40">
                    <p className="text-slate-400 text-sm leading-relaxed">{cap.desc}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Cat\égories d'objets ── */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen size={20} className="text-cyan-400" />
          Cat\égories d'objets
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-space-800/60 text-slate-300 text-left">
                <th className="px-4 py-2 font-semibold">Cat\égorie</th>
                <th className="px-4 py-2 font-semibold">Objets inclus</th>
                <th className="px-4 py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {ITEM_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <tr key={i} className="border-t border-space-400/10 hover:bg-space-800/30">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Icon size={14} className="text-cyan-400" />
                        <span className={clsx('text-xs', cat.badge)}>{cat.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{cat.items}</td>
                    <td className="px-4 py-3 text-slate-500 italic">{cat.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Buffs Nourriture & Boissons ── */}
      <ExpandableSection title="Buffs Nourriture & Boissons" icon={Coffee} defaultOpen={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-space-800/60 text-slate-300 text-left">
                <th className="px-3 py-2 font-semibold">Consommable</th>
                <th className="px-3 py-2 font-semibold">Effet</th>
                <th className="px-3 py-2 font-semibold">Dur\ée</th>
                <th className="px-3 py-2 font-semibold">O\ù trouver</th>
                <th className="px-3 py-2 font-semibold">Risque</th>
              </tr>
            </thead>
            <tbody>
              {FOOD_DRINK_BUFFS.map((item, i) => (
                <tr key={i} className="border-t border-space-400/10 hover:bg-space-800/30">
                  <td className="px-3 py-2">
                    <span className={clsx('text-xs', item.badgeCls)}>{item.name}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-300">{item.effect}</td>
                  <td className="px-3 py-2 text-slate-400">{item.duration}</td>
                  <td className="px-3 py-2 text-slate-400">{item.source}</td>
                  <td className="px-3 py-2 text-slate-500 italic">{item.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-start gap-2 p-3 border border-yellow-500/30 rounded-lg bg-yellow-900/10">
          <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-slate-400 text-sm">
            <span className="text-yellow-300 font-semibold">Attention :</span> les stims ill\égaux (SLAM, N\éon) peuvent provoquer une overdose
            en cas de consommation excessive. L'effet de descente r\éduit temporairement vos stats en dessous de la normale.
          </p>
        </div>
      </ExpandableSection>

      {/* ── Gestion de l'inventaire ── */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Wrench size={20} className="text-cyan-400" />
          Gestion de l'inventaire \— conseils
        </h2>
        <div className="space-y-3">
          {MANAGEMENT_TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <ExpandableSection key={i} title={tip.title} icon={Icon}>
                <ul className="space-y-2">
                  {tip.content.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                      <span className="text-cyan-400 mt-1 shrink-0">{'\•'}</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </ExpandableSection>
            );
          })}
        </div>
      </section>

      {/* ── Mort & R\écup\ération ── */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Skull size={20} className="text-red-400" />
          Mort & R\écup\ération
        </h2>
        <p className="text-slate-400 text-sm">
          La mort dans Star Citizen a des cons\équences r\éelles sur votre inventaire. Voici ce qui se passe et comment limiter les pertes.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {DEATH_RECOVERY.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="border border-space-400/20 rounded-lg p-4 bg-space-800/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-cyan-400" />
                  <span className={clsx('text-xs font-semibold', item.badgeCls)}>{item.label}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-start gap-2 p-3 border border-red-500/30 rounded-lg bg-red-900/10 mt-2">
          <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-slate-400 text-sm">
            <span className="text-red-300 font-semibold">Important :</span> en Alpha 4.6, les objets dropp\és au sol persistent
            environ 15-20 minutes avant de dispara\ître. Agissez vite pour r\écup\érer votre \équipement ou demandez de l'aide.
          </p>
        </div>
      </section>

      {/* ── Tips pratiques ── */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Lightbulb size={20} className="text-yellow-400" />
          Astuces pratiques
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PRO_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 border border-space-400/20 rounded-lg p-3 bg-space-800/40">
              <span className="text-yellow-400 font-bold text-sm mt-0.5 shrink-0">#{i + 1}</span>
              <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
