import React, { useState } from 'react';
import {
  ENGINEERING_SYSTEMS, ENGINEERING_COMPONENTS,
  ENGINEERING_SHIPS, ENGINEERING_GLOSSARY,
} from '../../datasets/engineering.js';
import {
  Zap, Thermometer, Wrench, AlertTriangle, Users,
  ChevronDown, ChevronRight, BookOpen, Cpu, Rocket, Ship,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Icônes dynamiques ────────────────────────────────────────────────────────
const ICON_MAP = { Zap, Thermometer, Wrench, AlertTriangle, Users, Cpu, Rocket, Ship };
function DynIcon({ name, className }) {
  const Icon = ICON_MAP[name] || Zap;
  return <Icon className={className} />;
}

// ─── Badges de complexité ─────────────────────────────────────────────────────
function ComplexityBar({ value }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={clsx('w-3 h-1.5 rounded-full', i < value ? 'bg-cyan-400' : 'bg-space-600')}
        />
      ))}
    </div>
  );
}

// ─── System Card ──────────────────────────────────────────────────────────────
function SystemCard({ system }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card overflow-hidden" style={{ borderColor: `${system.color}20` }}>
      <div
        className="p-4 cursor-pointer hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${system.color}20`, color: system.color }}
            >
              <DynIcon name={system.icon} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{system.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-lg">{system.description}</p>
            </div>
          </div>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
            : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 ml-12">
          {system.panels.map(p => (
            <span key={p} className="badge badge-slate text-xs">{p}</span>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-space-400/20 p-4 space-y-5 bg-space-900/40">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Mécaniques
            </h4>
            <ul className="space-y-1.5">
              {system.mechanics.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: system.color }} />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Conseils pratiques
            </h4>
            <ul className="space-y-1.5">
              {system.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-cyan-400/80">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0 bg-cyan-400" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Components Tab ───────────────────────────────────────────────────────────
function ComponentsTab() {
  return (
    <div className="space-y-4">
      {ENGINEERING_COMPONENTS.map(comp => (
        <div key={comp.id} className="card p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-100">{comp.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{comp.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {comp.grades.map(g => (
              <div key={g.grade} className={clsx(
                'p-3 rounded-lg border',
                g.grade === 'A' ? 'border-cyan-500/30 bg-cyan-500/5' :
                g.grade === 'B' ? 'border-blue-500/20 bg-blue-500/5' :
                'border-space-400/20 bg-space-800/40'
              )}>
                <div className={clsx(
                  'text-lg font-bold font-display mb-1',
                  g.grade === 'A' ? 'text-cyan-400' : g.grade === 'B' ? 'text-blue-400' : 'text-slate-400'
                )}>Grade {g.grade}</div>
                <p className="text-xs text-slate-400">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Stats clés :</span>
            {comp.keyStats.map(s => (
              <span key={s} className="badge badge-slate text-xs">{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Ships Tab ────────────────────────────────────────────────────────────────
function ShipsTab() {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-space-400/20 bg-space-800/50">
            <tr>
              <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-4 py-3">Vaisseau</th>
              <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Équipage</th>
              <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-4 py-3">Complexité</th>
              <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Notes Engineering</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-400/10">
            {ENGINEERING_SHIPS.map(ship => (
              <tr key={ship.id} className="hover:bg-space-700/20 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-200 text-sm">{ship.name}</td>
                <td className="px-4 py-3 text-sm text-slate-400 hidden sm:table-cell">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {ship.crew}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ComplexityBar value={ship.complexity} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell max-w-xs">{ship.engineeringNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Glossary Tab ─────────────────────────────────────────────────────────────
function GlossaryTab() {
  return (
    <div className="card divide-y divide-space-400/10">
      {ENGINEERING_GLOSSARY.map(entry => (
        <div key={entry.term} className="px-5 py-3 flex flex-col sm:flex-row gap-2 sm:gap-6 hover:bg-space-700/20 transition-colors">
          <dt className="text-sm font-bold text-cyan-400 flex-shrink-0 sm:w-44">{entry.term}</dt>
          <dd className="text-sm text-slate-400">{entry.def}</dd>
        </div>
      ))}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Engineering() {
  const [activeTab, setActiveTab] = useState('systems');

  const tabs = [
    { id: 'systems',    label: 'Systèmes',    icon: Zap,      count: ENGINEERING_SYSTEMS.length },
    { id: 'components', label: 'Composants',   icon: Cpu,      count: ENGINEERING_COMPONENTS.length },
    { id: 'ships',      label: 'Vaisseaux',    icon: Rocket,   count: ENGINEERING_SHIPS.length },
    { id: 'glossary',   label: 'Glossaire',    icon: BookOpen, count: ENGINEERING_GLOSSARY.length },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Engineering</h1>
          <p className="page-subtitle">Gestion des systèmes de vaisseau — Dawn of Engineering Alpha 4.5+</p>
        </div>
        <span className="badge badge-cyan">Nouveau 4.5</span>
      </div>

      {/* Bannière */}
      <div className="card p-5 relative overflow-hidden" style={{ borderColor: '#f59e0b30' }}>
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at right, #f59e0b, transparent 70%)' }} />
        <div className="relative flex items-start gap-4">
          <Zap className="w-8 h-8 text-amber-400 flex-shrink-0" />
          <div>
            <h2 className="font-bold text-slate-100 mb-1">Dawn of Engineering — Alpha 4.5</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              La mise à jour <strong className="text-amber-400">Dawn of Engineering</strong> (Alpha 4.5) introduit
              un système complet de gestion des vaisseaux multi-crew. Les ingénieurs peuvent désormais gérer l'énergie,
              la chaleur et effectuer des réparations physiques pendant le vol, transformant les grands vaisseaux en
              véritables expériences de jeu en équipe.
            </p>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Systèmes', value: ENGINEERING_SYSTEMS.length, color: 'text-amber-400' },
          { label: 'Types composants', value: ENGINEERING_COMPONENTS.length, color: 'text-cyan-400' },
          { label: 'Vaisseaux couverts', value: ENGINEERING_SHIPS.length, color: 'text-blue-400' },
          { label: 'Termes glossaire', value: ENGINEERING_GLOSSARY.length, color: 'text-slate-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-space-400/20 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className="text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      {activeTab === 'systems' && (
        <div className="space-y-3">
          {ENGINEERING_SYSTEMS.map(sys => <SystemCard key={sys.id} system={sys} />)}
        </div>
      )}
      {activeTab === 'components' && <ComponentsTab />}
      {activeTab === 'ships'      && <ShipsTab />}
      {activeTab === 'glossary'   && <GlossaryTab />}
    </div>
  );
}
