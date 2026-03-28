import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppActions } from '../../core/StateManager.jsx';
import { useShipImages } from '../../core/ShipImagesContext.jsx';
import { resolveShipImage } from '../../services/ShipImageService.js';
import { SHIPS } from '../../datasets/ships.js';
import { formatCredits } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  Search, Rocket, Shield, Zap, Package, Users, Target,
  Gauge, GitCompare, Plus, Eye, ArrowLeft, ChevronRight,
  Crosshair, Wind, Anchor, X,
} from 'lucide-react';

// ─── Constantes ──────────────────────────────────────────────────────────────

const ROLE_ANALYSIS = {
  'Chasseur':      { desc: 'Conçu pour le combat rapproché et les dogfights. Excelle en agilité et puissance de feu.', activities: ['Bounty Hunting', 'Patrouille', 'Escorte', 'Combat PvP'] },
  'Bombardier':    { desc: 'Spécialisé dans les frappes lourdes contre des cibles de grande taille.', activities: ['Assaut Capital Ships', 'Bombardement', 'Missions militaires'] },
  'Cargo':         { desc: 'Optimisé pour le transport de marchandises à travers les systèmes.', activities: ['Commerce', 'Transport', 'Livraisons', 'Contrebande'] },
  'Multi-Rôle':    { desc: 'Polyvalent et adaptable, capable de remplir plusieurs fonctions.', activities: ['Missions variées', 'Exploration', 'Commerce léger', 'Combat léger'] },
  'Exploration':   { desc: 'Équipé pour les longues distances et la découverte de nouveaux territoires.', activities: ['Exploration', 'Cartographie', 'Recherche', 'Voyages longue distance'] },
  'Mineur':        { desc: 'Outillé pour l\'extraction de minerais et le raffinage.', activities: ['Mining', 'Raffinage', 'Vente de minerais'] },
  'Médical':       { desc: 'Vaisseau-hôpital capable de soigner et réanimer les joueurs.', activities: ['Support médical', 'Recherche & Sauvetage', 'Opérations de groupe'] },
  'Récupération':  { desc: 'Spécialisé dans le salvage et la récupération d\'épaves.', activities: ['Salvage', 'Récupération', 'Démontage', 'Commerce de composants'] },
  'Course':        { desc: 'Ultra-rapide et maniable, taillé pour la compétition.', activities: ['Courses', 'Interception', 'Éclaireur'] },
  'Transport':     { desc: 'Conçu pour déplacer des passagers ou du fret efficacement.', activities: ['Transport passagers', 'Logistique', 'Navettes'] },
  'Ravitailleur':  { desc: 'Assure le ravitaillement en carburant des flottes.', activities: ['Ravitaillement', 'Support flotte', 'Commerce de carburant'] },
};

const DEFAULT_ANALYSIS = { desc: 'Un vaisseau aux capacités variées dans l\'univers de Star Citizen.', activities: ['Exploration', 'Missions', 'Combat'] };

// ─── Calcul des scores normalisés (0-100) ────────────────────────────────────

function computeScores(ship) {
  const allShips = SHIPS.filter(s => s.flyable);
  const maxSpeed = Math.max(...allShips.map(s => s.specs?.maxSpeed || 0));
  const maxCargo = Math.max(...allShips.map(s => s.specs?.cargo || 0));
  const maxShield = Math.max(...allShips.map(s => s.specs?.shieldHp || 0));
  const maxAccel = Math.max(...allShips.map(s => s.specs?.acceleration || 0));

  const weaponScore = (ship.hardpoints?.weapons?.length || 0) * 15 +
    (ship.hardpoints?.missiles?.length || 0) * 10 +
    (ship.hardpoints?.turrets?.length || 0) * 12;
  const maxWeapon = Math.max(...allShips.map(s =>
    (s.hardpoints?.weapons?.length || 0) * 15 +
    (s.hardpoints?.missiles?.length || 0) * 10 +
    (s.hardpoints?.turrets?.length || 0) * 12
  ));

  const speed = maxSpeed > 0 ? Math.round(((ship.specs?.maxSpeed || 0) / maxSpeed) * 100) : 0;
  const firepower = maxWeapon > 0 ? Math.round((weaponScore / maxWeapon) * 100) : 0;
  const cargo = maxCargo > 0 ? Math.round(((ship.specs?.cargo || 0) / maxCargo) * 100) : 0;
  const durability = maxShield > 0 ? Math.round(((ship.specs?.shieldHp || 0) / maxShield) * 100) : 0;
  const maneuverability = maxAccel > 0 ? Math.round(((ship.specs?.acceleration || 0) / maxAccel) * 100) : 0;
  const versatility = Math.round((speed * 0.15 + firepower * 0.2 + cargo * 0.2 + durability * 0.2 + maneuverability * 0.25));

  return { speed, firepower, cargo, durability, maneuverability, versatility };
}

// ─── SVG Radar Chart (hexagone 6 axes) ───────────────────────────────────────

const RADAR_LABELS = [
  { key: 'speed', label: 'Vitesse', icon: Gauge },
  { key: 'firepower', label: 'Puissance', icon: Crosshair },
  { key: 'cargo', label: 'Cargo', icon: Package },
  { key: 'durability', label: 'Résistance', icon: Shield },
  { key: 'maneuverability', label: 'Agilité', icon: Wind },
  { key: 'versatility', label: 'Polyvalence', icon: Anchor },
];

function RadarChart({ scores, size = 240 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = 6;

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto drop-shadow-lg">
      {/* Grille hexagonale */}
      {gridLevels.map(level => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, level));
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={level} d={d} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />;
      })}

      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(148,163,184,0.15)" strokeWidth="1" />;
      })}

      {/* Zone remplie */}
      {(() => {
        const pts = RADAR_LABELS.map((l, i) => getPoint(i, scores[l.key] || 0));
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return (
          <>
            <path d={d} fill="url(#radarGrad)" stroke="rgba(6,182,212,0.8)" strokeWidth="2" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#06b6d4" stroke="#0e1726" strokeWidth="2" />
            ))}
          </>
        );
      })()}

      {/* Labels */}
      {RADAR_LABELS.map((l, i) => {
        const p = getPoint(i, 118);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-slate-400 text-[10px] font-medium select-none">
            {l.label}
          </text>
        );
      })}

      {/* Gradient */}
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(6,182,212,0.35)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0.08)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─── Barre de stat animée ────────────────────────────────────────────────────

function AnimatedBar({ label, value, icon: Icon, color }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
      </div>
      <div className="h-2.5 bg-space-800 rounded-full overflow-hidden border border-space-600/50">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color.includes('cyan') ? '#0891b2' : color.includes('red') ? '#dc2626' : color.includes('green') ? '#16a34a' : color.includes('amber') ? '#d97706' : color.includes('blue') ? '#2563eb' : '#8b5cf6'}, ${color.includes('cyan') ? '#06b6d4' : color.includes('red') ? '#ef4444' : color.includes('green') ? '#22c55e' : color.includes('amber') ? '#f59e0b' : color.includes('blue') ? '#3b82f6' : '#a78bfa'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

// ─── Carte spec ──────────────────────────────────────────────────────────────

function SpecCard({ icon: Icon, label, value, unit, accent = 'text-cyan-400' }) {
  return (
    <div className="bg-space-800/60 border border-space-600/40 rounded-xl p-4 hover:border-cyan-500/30
      hover:bg-space-700/40 transition-all duration-300 group">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg bg-space-900/80 ${accent} group-hover:scale-110 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-100">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Carte vaisseau similaire ────────────────────────────────────────────────

function SimilarShipCard({ ship, apiImages, onClick }) {
  const src = resolveShipImage(ship.name, ship.imageUrl, apiImages);
  const [imgErr, setImgErr] = useState(false);

  return (
    <button onClick={onClick}
      className="card p-0 overflow-hidden hover:border-cyan-500/40 transition-all duration-300
        hover:shadow-lg hover:shadow-cyan-500/10 group text-left w-full">
      <div className="relative h-32 bg-space-900 overflow-hidden">
        {!imgErr && src ? (
          <img src={src} alt={ship.name} onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket className="w-10 h-10 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent" />
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
          {ship.name}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{ship.manufacturer} · {ship.role}</div>
        <div className="text-xs text-cyan-400 mt-1">{formatCredits(ship.price)}</div>
      </div>
    </button>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function ShipShowcase() {
  const navigate = useNavigate();
  const { addShipToFleet, notify } = useAppActions();
  const apiImages = useShipImages();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [imgError, setImgError] = useState(false);

  const flyableShips = useMemo(() => SHIPS.filter(s => s.flyable), []);

  const filteredShips = useMemo(() => {
    if (!search.trim()) return flyableShips;
    const q = search.toLowerCase();
    return flyableShips.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.manufacturer.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    );
  }, [search, flyableShips]);

  const ship = useMemo(() => {
    if (!selectedId) return null;
    return SHIPS.find(s => s.id === selectedId) || null;
  }, [selectedId]);

  const scores = useMemo(() => ship ? computeScores(ship) : null, [ship]);

  const heroImage = useMemo(() => {
    if (!ship) return null;
    return resolveShipImage(ship.name, ship.imageUrl, apiImages);
  }, [ship, apiImages]);

  const similarShips = useMemo(() => {
    if (!ship) return [];
    return flyableShips
      .filter(s => s.id !== ship.id && (s.role === ship.role || s.size === ship.size))
      .sort((a, b) => {
        const aMatch = (a.role === ship.role ? 2 : 0) + (a.size === ship.size ? 1 : 0);
        const bMatch = (b.role === ship.role ? 2 : 0) + (b.size === ship.size ? 1 : 0);
        return bMatch - aMatch;
      })
      .slice(0, 3);
  }, [ship, flyableShips]);

  const roleInfo = useMemo(() => {
    if (!ship) return DEFAULT_ANALYSIS;
    return ROLE_ANALYSIS[ship.role] || DEFAULT_ANALYSIS;
  }, [ship]);

  const handleAddToFleet = useCallback(() => {
    if (!ship) return;
    addShipToFleet({
      shipId: ship.id, name: ship.name, manufacturer: ship.manufacturer,
      role: ship.role, size: ship.size, specs: ship.specs, price: ship.price,
    });
    notify(`${ship.name} ajouté à la flotte`, 'success');
  }, [ship, addShipToFleet, notify]);

  const handleSelectShip = useCallback((id) => {
    setSelectedId(id);
    setImgError(false);
  }, []);

  // ─── Vue sélection ────────────────────────────────────────────────────────

  if (!ship) {
    return (
      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Showcase Vaisseaux
          </h1>
          <p className="text-slate-400 mt-2">
            Explorez les vaisseaux de Star Citizen dans une vue premium
          </p>
        </div>

        {/* Recherche */}
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un vaisseau, fabricant ou rôle…"
            className="input pl-11 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grille de vaisseaux */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredShips.map(s => {
            const src = resolveShipImage(s.name, s.imageUrl, apiImages);
            return (
              <ShipGridCard key={s.id} ship={s} src={src} onClick={() => handleSelectShip(s.id)} />
            );
          })}
        </div>

        {filteredShips.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun vaisseau trouvé pour « {search} »</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Vue showcase ──────────────────────────────────────────────────────────

  const weaponCount = (ship.hardpoints?.weapons?.length || 0) +
    (ship.hardpoints?.turrets?.length || 0);
  const missileCount = ship.hardpoints?.missiles?.length || 0;

  return (
    <div className="space-y-6">
      {/* Retour */}
      <button onClick={() => setSelectedId(null)}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Retour à la sélection
      </button>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-space-600/40 bg-space-900">
        <div className="relative h-72 sm:h-80 md:h-96">
          {!imgError && heroImage ? (
            <img src={heroImage} alt={ship.name} onError={() => setImgError(true)}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-space-800 to-space-900">
              <Rocket className="w-24 h-24 text-slate-700/50" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-space-900/60 via-transparent to-transparent" />

          {/* Infos hero */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium tracking-widest uppercase text-cyan-400/80 mb-1">
                  {ship.manufacturer}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  {ship.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="badge-cyan">{ship.role}</span>
                  <span className="badge-blue">{ship.size}</span>
                  {ship.price > 0 && (
                    <span className="text-sm text-gold-400 font-semibold">{formatCredits(ship.price)}</span>
                  )}
                </div>
              </div>

              {/* Score global */}
              <div className="hidden sm:flex flex-col items-center bg-space-900/80 backdrop-blur-sm
                rounded-xl border border-cyan-500/20 px-5 py-3">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-500">
                  {scores.versatility}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate(`/vaisseaux/comparer?a=${ship.id}`)}
          className="btn-secondary gap-2">
          <GitCompare className="w-4 h-4" /> Comparer
        </button>
        <button onClick={handleAddToFleet} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Ajouter à la flotte
        </button>
        <button onClick={() => navigate(`/vaisseaux/${ship.id}`)}
          className="btn-secondary gap-2">
          <Eye className="w-4 h-4" /> Voir le détail
        </button>
      </div>

      {/* ── Barres de stats + Radar ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barres animées */}
        <div className="card p-6 space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Profil de performance
          </h2>
          <AnimatedBar label="Vitesse" value={scores.speed} icon={Gauge} color="text-cyan-400" />
          <AnimatedBar label="Puissance de feu" value={scores.firepower} icon={Crosshair} color="text-red-400" />
          <AnimatedBar label="Capacité cargo" value={scores.cargo} icon={Package} color="text-green-400" />
          <AnimatedBar label="Résistance" value={scores.durability} icon={Shield} color="text-blue-400" />
          <AnimatedBar label="Maniabilité" value={scores.maneuverability} icon={Wind} color="text-amber-400" />
          <AnimatedBar label="Polyvalence" value={scores.versatility} icon={Anchor} color="text-purple-400" />
        </div>

        {/* Radar chart */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h2 className="section-title flex items-center gap-2 mb-4 self-start">
            <Target className="w-4 h-4 text-cyan-400" />
            Diagramme radar
          </h2>
          <RadarChart scores={scores} />
          <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-4 w-full max-w-xs">
            {RADAR_LABELS.map(l => (
              <div key={l.key} className="flex items-center gap-1.5 text-xs text-slate-400">
                <l.icon className="w-3 h-3 text-cyan-500/60" />
                <span>{scores[l.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8 Spec Cards ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-cyan-400" />
          Spécifications détaillées
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SpecCard icon={Users} label="Équipage" value={`${ship.crew?.min || 1}–${ship.crew?.max || 1}`} />
          <SpecCard icon={Package} label="Cargo" value={ship.specs?.cargo ?? '—'} unit="SCU" accent="text-green-400" />
          <SpecCard icon={Gauge} label="Vitesse max" value={ship.specs?.maxSpeed ?? '—'} unit="m/s" accent="text-cyan-400" />
          <SpecCard icon={Gauge} label="SCM" value={ship.specs?.scmSpeed ?? '—'} unit="m/s" accent="text-blue-400" />
          <SpecCard icon={Shield} label="Boucliers" value={ship.specs?.shieldHp ? ship.specs.shieldHp.toLocaleString() : '—'} unit="HP" accent="text-blue-400" />
          <SpecCard icon={Crosshair} label="Armes" value={weaponCount} unit={`+ ${missileCount} missiles`} accent="text-red-400" />
          <SpecCard icon={Zap} label="Accélération" value={ship.specs?.acceleration ?? '—'} unit="m/s²" accent="text-amber-400" />
          <SpecCard icon={Rocket} label="Carburant Q" value={ship.specs?.qFuel ?? '—'} unit="L" accent="text-purple-400" />
        </div>
      </div>

      {/* ── Analyse du rôle ──────────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="section-title flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-cyan-400" />
          Analyse du rôle — {ship.role}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">{roleInfo.desc}</p>
        {ship.description && (
          <p className="text-slate-400 text-sm leading-relaxed mb-4 italic border-l-2 border-cyan-500/30 pl-3">
            {ship.description}
          </p>
        )}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Activités recommandées</h3>
          <div className="flex flex-wrap gap-2">
            {roleInfo.activities.map(a => (
              <span key={a} className="px-3 py-1 rounded-full text-xs font-medium
                bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hardpoints détail ─────────────────────────────────────────────── */}
      {(ship.hardpoints?.weapons?.length > 0 || ship.hardpoints?.missiles?.length > 0 || ship.hardpoints?.turrets?.length > 0) && (
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-3">
            <Crosshair className="w-4 h-4 text-red-400" />
            Armement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ship.hardpoints.weapons?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Armes</h3>
                <div className="flex flex-wrap gap-1.5">
                  {ship.hardpoints.weapons.map((w, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-mono
                      bg-red-500/10 border border-red-500/20 text-red-300">{w}</span>
                  ))}
                </div>
              </div>
            )}
            {ship.hardpoints.missiles?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Missiles</h3>
                <div className="flex flex-wrap gap-1.5">
                  {ship.hardpoints.missiles.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-mono
                      bg-amber-500/10 border border-amber-500/20 text-amber-300">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {ship.hardpoints.turrets?.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Tourelles</h3>
                <div className="flex flex-wrap gap-1.5">
                  {ship.hardpoints.turrets.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-mono
                      bg-blue-500/10 border border-blue-500/20 text-blue-300">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Vaisseaux similaires ──────────────────────────────────────────── */}
      {similarShips.length > 0 && (
        <div>
          <h2 className="section-title flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-cyan-400" />
            Vaisseaux similaires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarShips.map(s => (
              <SimilarShipCard key={s.id} ship={s} apiImages={apiImages}
                onClick={() => handleSelectShip(s.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Carte grille sélection ──────────────────────────────────────────────────

function ShipGridCard({ ship, src, onClick }) {
  const [err, setErr] = useState(false);
  return (
    <button onClick={onClick}
      className="group card p-0 overflow-hidden hover:border-cyan-500/40 transition-all duration-300
        hover:shadow-lg hover:shadow-cyan-500/10 text-left w-full">
      <div className="relative h-28 bg-space-900 overflow-hidden">
        {!err && src ? (
          <img src={src} alt={ship.name} onError={() => setErr(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket className="w-8 h-8 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/20 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-xs font-bold text-white truncate drop-shadow-lg">{ship.name}</div>
        </div>
      </div>
      <div className="px-2.5 py-2">
        <div className="text-[10px] text-slate-500 truncate">{ship.manufacturer} · {ship.role}</div>
      </div>
    </button>
  );
}
