import React, { useState, useMemo } from 'react';
import { SALVAGE_SHIPS, SALVAGE_MATERIALS, SALVAGE_MECHANICS, SALVAGE_TOOLS, SALVAGE_BUYOUTS } from '../../datasets/salvage.js';
import clsx from 'clsx';
import {
  Layers, Wrench, Package, Cpu, Rocket, Star,
  AlertTriangle, CheckCircle, MapPin, DollarSign, Users,
  ChevronDown, ChevronUp, ArrowRight, Recycle, Search, X,
} from 'lucide-react';

const MECHANIC_ICONS = { Layers, Wrench, Package, Cpu };

const DIFFICULTY_STYLES = {
  'Facile': { badge: 'badge-green', text: 'text-success-400' },
  'Intermédiaire': { badge: 'badge-yellow', text: 'text-warning-400' },
  'Avancé': { badge: 'badge-red', text: 'text-danger-400' },
};

const TABS = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'mechanics', label: 'Mécaniques' },
  { id: 'ships', label: 'Vaisseaux' },
  { id: 'materials', label: 'Matériaux' },
  { id: 'tools', label: 'Outils' },
];

function ShipCard({ ship }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="card-glow p-5">
      <div className="flex items-start gap-4 mb-3">
        <div className="w-16 h-16 rounded-xl bg-space-700/50 border border-space-400/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {!imgError && ship.imageUrl ? (
            <img src={ship.imageUrl} alt={ship.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
          ) : (
            <Rocket className="w-8 h-8 text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-100">{ship.name}</h3>
            <span className="badge badge-slate text-xs">{ship.type}</span>
            {!ship.inGame && <span className="badge badge-yellow text-xs">Bientôt</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ship.crew.min}-{ship.crew.max}</span>
            <span className="flex items-center gap-1"><Package className="w-3 h-3" />{ship.cargoSCU} SCU</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{(ship.price / 1000000).toFixed(1)}M aUEC</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{ship.description}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs font-medium text-success-400 mb-1">Points forts</div>
          {ship.strength.map((s, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-slate-400">
              <CheckCircle className="w-3 h-3 text-success-500 flex-shrink-0" /> {s}
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs font-medium text-danger-400 mb-1">Limites</div>
          {ship.weakness.map((w, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-slate-400">
              <AlertTriangle className="w-3 h-3 text-danger-500 flex-shrink-0" /> {w}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MechanicCard({ mechanic }) {
  const [open, setOpen] = useState(false);
  const Icon = MECHANIC_ICONS[mechanic.icon] || Wrench;
  const diffStyle = DIFFICULTY_STYLES[mechanic.difficulty] || { badge: 'badge-slate', text: 'text-slate-400' };

  return (
    <div className="card-glow overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center gap-4 hover:bg-space-700/20 transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-space-700/50 border border-space-400/20 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-6 h-6 ${mechanic.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-100">{mechanic.name}</h3>
            <span className={`badge ${diffStyle.badge}`}>{mechanic.difficulty}</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{mechanic.description}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-space-400/10">
          <p className="text-sm text-slate-300 mt-4 leading-relaxed">{mechanic.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">Étapes</h4>
              <div className="space-y-1.5">
                {mechanic.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-cyan-500 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <span className="text-xs text-slate-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-warning-400 uppercase tracking-wide mb-2">Conseils</h4>
              <div className="space-y-1.5">
                {mechanic.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Star className="w-3 h-3 text-warning-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-400">{tip}</span>
                  </div>
                ))}
              </div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 mt-4">Outils requis</h4>
              <div className="flex flex-wrap gap-1">
                {mechanic.tools.map((t, i) => <span key={i} className="badge badge-slate text-xs">{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Salvage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  const filteredShips = useMemo(() => {
    if (!search) return SALVAGE_SHIPS;
    const q = search.toLowerCase();
    return SALVAGE_SHIPS.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [search]);

  const filteredMaterials = useMemo(() => {
    if (!search) return SALVAGE_MATERIALS;
    const q = search.toLowerCase();
    return SALVAGE_MATERIALS.filter(m => m.name.toLowerCase().includes(q) || m.fullName?.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }, [search]);

  const filteredMechanics = useMemo(() => {
    if (!search) return SALVAGE_MECHANICS;
    const q = search.toLowerCase();
    return SALVAGE_MECHANICS.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }, [search]);

  const filteredTools = useMemo(() => {
    if (!search) return SALVAGE_TOOLS;
    const q = search.toLowerCase();
    return SALVAGE_TOOLS.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Salvage & Récupération</h1>
        <p className="page-subtitle">Guide complet de récupération d'épaves dans Star Citizen</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Vaisseaux', value: SALVAGE_SHIPS.length, color: 'text-cyan-400', icon: Rocket },
          { label: 'Matériaux', value: SALVAGE_MATERIALS.length, color: 'text-orange-400', icon: Layers },
          { label: 'Mécaniques', value: SALVAGE_MECHANICS.length, color: 'text-warning-400', icon: Wrench },
          { label: 'Points de Vente', value: SALVAGE_BUYOUTS.length, color: 'text-success-400', icon: MapPin },
        ].map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <stat.icon className={`w-6 h-6 ${stat.color} flex-shrink-0`} />
            <div>
              <div className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-1 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/40'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'overview' && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un vaisseau, matériau, outil..."
            className="w-full pl-10 pr-9 py-2 rounded-lg bg-space-700/60 border border-space-400/20 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card-glow p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at top right, #f97316, transparent 70%)' }} />
            <div className="relative">
              <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Recycle className="w-5 h-5 text-orange-400" />
                Qu'est-ce que le Salvage ?
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Le Salvage (récupération d'épaves) est une carrière de gameplay permettant de collecter des ressources depuis des épaves de vaisseaux, des stations abandonnées et des débris orbitaux. C'est l'une des activités les plus lucratives pour un joueur solo ou en petit groupe.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Grattage de Coque', desc: 'Récolter le RMC en surface des épaves avec un faisceau spécialisé', icon: Layers, color: 'text-green-400' },
                  { title: 'Démantèlement', desc: 'Découper des sections entières pour maximiser la récupération', icon: Wrench, color: 'text-yellow-400' },
                  { title: 'Extraction', desc: 'Récupérer composants et cargo encore intacts dans les épaves', icon: Cpu, color: 'text-cyan-400' },
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-lg bg-space-900/60 border border-space-400/10">
                    <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                    <div className="font-medium text-slate-200 text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
              Démarrage Rapide
            </h2>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Acquérir un vaisseau de salvage', desc: 'Le Drake Vulture est idéal pour débuter en solo. Disponible en jeu pour ~3.5M aUEC.' },
                { step: '2', title: 'Trouver des épaves', desc: 'Les épaves apparaissent dans l\'espace ouvert, autour des zones de combat récentes, ou via des missions de salvage.' },
                { step: '3', title: 'Activer le mode Salvage', desc: 'Appuyez sur [F] en vol pour passer en mode Salvage. Utilisez le faisceau Abrade pour gratter les surfaces.' },
                { step: '4', title: 'Vendre les matériaux', desc: 'Apportez votre RMC aux points de vente. Reclamation & Disposal sur Hurston est le revendeur principal.' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-4 p-3 rounded-lg bg-space-900/40 border border-space-400/10">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-cyan-400">{item.step}</span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-200 text-sm">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Points de Revente
            </h2>
            <div className="space-y-2">
              {SALVAGE_BUYOUTS.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-space-900/40 border border-space-400/10">
                  <div>
                    <div className="text-sm text-slate-200 font-medium">{b.location}</div>
                    <div className="text-xs text-slate-500">{b.planet} · {b.system}</div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {b.buysRMC && <span className="badge badge-slate text-xs">RMC</span>}
                    {b.buysComponents && <span className="badge badge-cyan text-xs">Composants</span>}
                    {b.buysConstruction && <span className="badge badge-slate text-xs">Construction</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mechanics' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Développez chaque mécanique pour voir les étapes détaillées et les conseils.</p>
          {filteredMechanics.map(mechanic => (
            <MechanicCard key={mechanic.id} mechanic={mechanic} />
          ))}
        </div>
      )}

      {activeTab === 'ships' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredShips.map(ship => (
            <ShipCard key={ship.id} ship={ship} />
          ))}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMaterials.map(mat => (
            <div key={mat.id} className={`card p-5 border ${mat.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-bold ${mat.color}`}>{mat.name}</h3>
                  <p className="text-xs text-slate-500">{mat.fullName}</p>
                  <span className="badge badge-slate text-xs mt-1">{mat.category}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold font-display ${mat.color}`}>{mat.value} aUEC</div>
                  <div className="text-xs text-slate-500">par {mat.unit}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{mat.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Utilisations</div>
                  {mat.uses.map((u, i) => <div key={i} className="text-xs text-slate-400">• {u}</div>)}
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase mb-1">Sources</div>
                  {mat.sources.map((s, i) => <div key={i} className="text-xs text-slate-400">• {s}</div>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map(tool => (
            <div key={tool.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-100">{tool.name}</h3>
                  <p className="text-xs text-slate-500">{tool.type}</p>
                </div>
                {!tool.inGame && <span className="badge badge-yellow text-xs">Bientôt</span>}
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">{tool.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{tool.manufacturer}</span>
                <span className="text-sm font-bold text-cyan-400">{tool.price.toLocaleString()} aUEC</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
