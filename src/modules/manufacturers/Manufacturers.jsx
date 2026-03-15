import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MANUFACTURERS } from '../../datasets/manufacturers.js';
import { SHIPS } from '../../datasets/ships.js';
import clsx from 'clsx';
import { Factory, Rocket, Search, ChevronRight, Crosshair, Package, Truck } from 'lucide-react';

const ALIGNMENT_STYLES = {
  'Militaire / Civil': { badge: 'badge-blue', color: '#3b82f6' },
  'Militaire': { badge: 'badge-red', color: '#ef4444' },
  'Civil / Exploration': { badge: 'badge-blue', color: '#0369a1' },
  'Civil / Criminel': { badge: 'badge-red', color: '#ef4444' },
  'Luxe / Civil': { badge: 'badge-yellow', color: '#d4af37' },
  'Civil / Militaire': { badge: 'badge-purple', color: '#8b5cf6' },
  'Industriel / Commercial': { badge: 'badge-cyan', color: '#06b6d4' },
  'Utilitaire': { badge: 'badge-slate', color: '#64748b' },
  'Alien / Commerce': { badge: 'badge-yellow', color: '#92400e' },
  'Spécialisé / Reproductions': { badge: 'badge-slate', color: '#6b7280' },
  "Alien (Xi'an)": { badge: 'badge-green', color: '#065f46' },
  'Militaire / Petits Vaisseaux': { badge: 'badge-red', color: '#991b1b' },
  'Militaire / Véhicules Terrestres': { badge: 'badge-red', color: '#713f12' },
  'Civil / Frontier': { badge: 'badge-yellow', color: '#d97706' },
};

function ManufacturerLogo({ manufacturer, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-lg';
  return (
    <div
      className={clsx(dim, 'rounded-xl flex items-center justify-center flex-shrink-0 border font-black overflow-hidden')}
      style={{ backgroundColor: `${manufacturer.color}15`, borderColor: `${manufacturer.color}30`, color: manufacturer.color }}
    >
      {!imgError && manufacturer.imageUrl ? (
        <img src={manufacturer.imageUrl} alt={manufacturer.name} onError={() => setImgError(true)} className="w-full h-full object-contain p-1" />
      ) : (
        manufacturer.code.slice(0, 3)
      )}
    </div>
  );
}

function ManufacturerCard({ manufacturer, shipCount, onClick }) {
  const style = ALIGNMENT_STYLES[manufacturer.alignment] || { badge: 'badge-slate', color: '#64748b' };

  return (
    <div
      onClick={() => onClick(manufacturer)}
      className="card-glow p-5 cursor-pointer group hover:border-cyan-500/20 transition-all"
      style={{ borderColor: `${manufacturer.color}15` }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        <ManufacturerLogo manufacturer={manufacturer} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-tight">
            {manufacturer.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{manufacturer.specialty}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className={`badge ${style.badge}`}>{manufacturer.alignment}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">
        {manufacturer.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-space-400/20">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Rocket className="w-3.5 h-3.5" />
          <span className="font-medium" style={{ color: manufacturer.color }}>{shipCount}</span>
          <span>vaisseau{shipCount > 1 ? 'x' : ''}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );
}

function ManufacturerDetail({ manufacturer, ships, onClose }) {
  const style = ALIGNMENT_STYLES[manufacturer.alignment] || { badge: 'badge-slate', color: '#64748b' };
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onClose} className="btn-ghost gap-2 text-slate-400 hover:text-slate-200 flex items-center">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Retour aux Fabricants
      </button>

      {/* Hero */}
      <div
        className="card-glow p-6 relative overflow-hidden"
        style={{ borderColor: `${manufacturer.color}25` }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at top right, ${manufacturer.color}, transparent 70%)` }}
        />
        <div className="relative flex flex-col sm:flex-row items-start gap-5">
          <ManufacturerLogo manufacturer={manufacturer} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black font-display text-slate-100">{manufacturer.name}</h1>
              <span className="badge badge-slate font-mono text-xs">{manufacturer.code}</span>
              <span className={`badge ${style.badge}`}>{manufacturer.alignment}</span>
            </div>
            <p className="text-slate-500 text-sm mb-2">{manufacturer.specialty}</p>
            <p className="text-slate-400 leading-relaxed text-sm">{manufacturer.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ships list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              Vaisseaux Notables ({ships.length})
            </h2>
            {ships.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ships.map(ship => (
                  <button
                    key={ship.id}
                    onClick={() => navigate(`/vaisseaux/${ship.id}`)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-space-900/60 border border-space-400/10 hover:border-cyan-500/30 hover:bg-space-700/30 transition-all text-left group"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: manufacturer.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors font-medium truncate">
                        {ship.name}
                      </div>
                      <div className="text-xs text-slate-600">{ship.role} · {ship.size}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun vaisseau référencé dans la base de données.</p>
            )}
          </div>

          {manufacturer.lore && (
            <div className="card p-5">
              <h2 className="section-title mb-3">Histoire & Contexte</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{manufacturer.lore}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="section-title mb-4">Informations</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-space-400/10">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Code</span>
                <span className="text-xs font-mono font-bold text-slate-200">{manufacturer.code}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-space-400/10 gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Spécialité</span>
                <span className="text-xs text-slate-300 text-right">{manufacturer.specialty}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-space-400/10 gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Alignement</span>
                <span className={`badge ${style.badge} text-xs`}>{manufacturer.alignment}</span>
              </div>
              {manufacturer.headquarters && (
                <div className="flex justify-between items-start py-2 border-b border-space-400/10 gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Base</span>
                  <span className="text-xs text-slate-300 text-right">{manufacturer.headquarters}</span>
                </div>
              )}
              {manufacturer.founded && (
                <div className="flex justify-between items-center py-2 border-b border-space-400/10">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Fondé</span>
                  <span className="text-xs text-slate-300">{manufacturer.founded}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Vaisseaux</span>
                <span className="text-xs font-bold" style={{ color: manufacturer.color }}>{ships.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Manufacturers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const shipsByManufacturer = useMemo(() => {
    return MANUFACTURERS.reduce((acc, mfr) => {
      const mfrShort = mfr.shortName.toLowerCase();
      const mfrFull  = mfr.name.toLowerCase();
      acc[mfr.id] = SHIPS.filter(s => {
        const sm = s.manufacturer.toLowerCase();
        return (
          sm === mfrShort ||
          sm === mfrFull ||
          // I-17: correspondance partielle robuste (évite le bug du premier mot uniquement)
          mfrFull.startsWith(sm) ||
          sm.startsWith(mfrShort)
        );
      });
      return acc;
    }, {});
  }, []);

  const filtered = useMemo(() => {
    if (!search) return MANUFACTURERS;
    const q = search.toLowerCase();
    return MANUFACTURERS.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.specialty.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (selected) {
    return (
      <ManufacturerDetail
        manufacturer={selected}
        ships={shipsByManufacturer[selected.id] || []}
        onClose={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Fabricants</h1>
        <p className="page-subtitle">{MANUFACTURERS.length} constructeurs navals répertoriés</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Militaire', icon: Crosshair, count: MANUFACTURERS.filter(m => m.alignment.includes('Militaire')).length, color: 'text-danger-400' },
          { label: 'Civil', icon: Rocket, count: MANUFACTURERS.filter(m => m.alignment.includes('Civil')).length, color: 'text-success-400' },
          { label: 'Industriel', icon: Package, count: MANUFACTURERS.filter(m => m.alignment.includes('Industriel')).length, color: 'text-cyan-400' },
          { label: 'Alien', icon: Factory, count: MANUFACTURERS.filter(m => m.alignment.includes('Alien')).length, color: 'text-warning-400' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <stat.icon className={`w-6 h-6 ${stat.color} flex-shrink-0`} />
            <div>
              <div className={`text-2xl font-bold font-display ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher un fabricant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 w-full"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
        {filtered.map(mfr => (
          <ManufacturerCard
            key={mfr.id}
            manufacturer={mfr}
            shipCount={shipsByManufacturer[mfr.id]?.length || 0}
            onClick={setSelected}
          />
        ))}
      </div>
    </div>
  );
}
