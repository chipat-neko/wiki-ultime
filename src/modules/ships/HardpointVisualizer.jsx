/**
 * HardpointVisualizer — Diagramme schématique des hardpoints vaisseaux
 * Vue top-down SVG avec marqueurs cliquables, liste composants, résumés DPS/énergie
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Crosshair, Target, Shield, Zap, Flame, Wrench,
  ChevronDown, ChevronRight, Info, Cpu, Thermometer,
  CircleDot, Search, X, AlertTriangle, BarChart2,
} from 'lucide-react';
import { SHIPS } from '../../datasets/ships.js';

// ─── Schémas des vaisseaux populaires ──────────────────────────────
const SHIP_SCHEMATICS = {
  'aegis-avenger-titan': {
    shape: 'fighter', width: 220, height: 130,
    hardpoints: [
      { type: 'weapon', size: 3, x: 70, y: 28, label: 'Nez S3 gauche' },
      { type: 'weapon', size: 3, x: 150, y: 28, label: 'Nez S3 droit' },
      { type: 'weapon', size: 1, x: 90, y: 55, label: 'Aile S1 gauche' },
      { type: 'weapon', size: 1, x: 130, y: 55, label: 'Aile S1 droit' },
      { type: 'missile', size: 2, x: 80, y: 95, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 140, y: 95, label: 'Rack S2 droit' },
    ],
  },
  'aegis-gladius': {
    shape: 'fighter', width: 220, height: 130,
    hardpoints: [
      { type: 'weapon', size: 3, x: 110, y: 22, label: 'Nez S3 central' },
      { type: 'weapon', size: 3, x: 60, y: 48, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 160, y: 48, label: 'Aile S3 droit' },
      { type: 'missile', size: 2, x: 70, y: 90, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 150, y: 90, label: 'Rack S2 droit' },
    ],
  },
  'aegis-hammerhead': {
    shape: 'capital', width: 300, height: 180,
    hardpoints: [
      { type: 'turret', size: 5, x: 110, y: 20, label: 'Tourelle S5 avant gauche', arc: 270 },
      { type: 'turret', size: 5, x: 190, y: 20, label: 'Tourelle S5 avant droite', arc: 270 },
      { type: 'turret', size: 4, x: 40, y: 60, label: 'Tourelle S4 flanc gauche', arc: 180 },
      { type: 'turret', size: 4, x: 260, y: 60, label: 'Tourelle S4 flanc droit', arc: 180 },
      { type: 'turret', size: 4, x: 40, y: 120, label: 'Tourelle S4 arrière gauche', arc: 180 },
      { type: 'turret', size: 4, x: 260, y: 120, label: 'Tourelle S4 arrière droite', arc: 180 },
    ],
  },
  'aegis-redeemer': {
    shape: 'fighter', width: 260, height: 150,
    hardpoints: [
      { type: 'weapon', size: 5, x: 100, y: 30, label: 'Nez S5 gauche' },
      { type: 'weapon', size: 5, x: 160, y: 30, label: 'Nez S5 droit' },
      { type: 'turret', size: 4, x: 70, y: 70, label: 'Tourelle S4 dorsale', arc: 270 },
      { type: 'turret', size: 4, x: 190, y: 70, label: 'Tourelle S4 ventrale', arc: 270 },
      { type: 'missile', size: 3, x: 90, y: 115, label: 'Rack S3 x4 gauche' },
      { type: 'missile', size: 3, x: 170, y: 115, label: 'Rack S3 x4 droit' },
    ],
  },
  'anvil-hornet-f7c': {
    shape: 'fighter', width: 220, height: 130,
    hardpoints: [
      { type: 'weapon', size: 3, x: 110, y: 20, label: 'Nez S3 central' },
      { type: 'weapon', size: 3, x: 55, y: 50, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 165, y: 50, label: 'Aile S3 droit' },
      { type: 'turret', size: 4, x: 110, y: 60, label: 'Tourelle dorsale S4', arc: 180 },
      { type: 'missile', size: 2, x: 75, y: 95, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 145, y: 95, label: 'Rack S2 droit' },
    ],
  },
  'rsi-aurora-mr': {
    shape: 'fighter', width: 200, height: 120,
    hardpoints: [
      { type: 'weapon', size: 1, x: 70, y: 30, label: 'Nez S1 gauche' },
      { type: 'weapon', size: 1, x: 130, y: 30, label: 'Nez S1 droit' },
      { type: 'missile', size: 1, x: 100, y: 90, label: 'Rack S1 ventral' },
    ],
  },
  'drake-cutlass-black': {
    shape: 'cargo', width: 240, height: 150,
    hardpoints: [
      { type: 'weapon', size: 3, x: 80, y: 25, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 160, y: 25, label: 'Aile S3 droit' },
      { type: 'turret', size: 3, x: 120, y: 70, label: 'Tourelle dorsale S3 x2', arc: 270 },
      { type: 'missile', size: 2, x: 70, y: 110, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 170, y: 110, label: 'Rack S2 droit' },
    ],
  },
  'misc-freelancer': {
    shape: 'cargo', width: 260, height: 140,
    hardpoints: [
      { type: 'weapon', size: 3, x: 90, y: 22, label: 'Nez S3 gauche' },
      { type: 'weapon', size: 3, x: 170, y: 22, label: 'Nez S3 droit' },
      { type: 'weapon', size: 3, x: 90, y: 55, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 170, y: 55, label: 'Aile S3 droit' },
      { type: 'turret', size: 2, x: 130, y: 110, label: 'Tourelle arrière S2 x2', arc: 180 },
      { type: 'missile', size: 2, x: 60, y: 80, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 200, y: 80, label: 'Rack S2 droit' },
    ],
  },
  'rsi-constellation-andromeda': {
    shape: 'capital', width: 280, height: 160,
    hardpoints: [
      { type: 'weapon', size: 4, x: 100, y: 22, label: 'Gimbale S4 avant gauche' },
      { type: 'weapon', size: 4, x: 180, y: 22, label: 'Gimbale S4 avant droit' },
      { type: 'weapon', size: 4, x: 70, y: 60, label: 'Gimbale S4 milieu gauche' },
      { type: 'weapon', size: 4, x: 210, y: 60, label: 'Gimbale S4 milieu droit' },
      { type: 'turret', size: 2, x: 140, y: 45, label: 'Tourelle S2 x2 dorsale', arc: 270 },
      { type: 'turret', size: 2, x: 140, y: 120, label: 'Tourelle S2 x2 ventrale', arc: 270 },
      { type: 'missile', size: 4, x: 60, y: 100, label: 'Rack missiles S4 gauche' },
      { type: 'missile', size: 4, x: 220, y: 100, label: 'Rack missiles S4 droit' },
    ],
  },
  'anvil-carrack': {
    shape: 'capital', width: 320, height: 190,
    hardpoints: [
      { type: 'turret', size: 4, x: 160, y: 22, label: 'Tourelle S4 avant', arc: 270 },
      { type: 'turret', size: 4, x: 60, y: 70, label: 'Tourelle S4 flanc gauche', arc: 180 },
      { type: 'turret', size: 4, x: 260, y: 70, label: 'Tourelle S4 flanc droit', arc: 180 },
      { type: 'turret', size: 3, x: 120, y: 140, label: 'Tourelle S3 arrière gauche', arc: 180 },
      { type: 'turret', size: 3, x: 200, y: 140, label: 'Tourelle S3 arrière droit', arc: 180 },
      { type: 'utility', size: 0, x: 160, y: 95, label: 'Baie utilitaire (scanner)' },
    ],
  },
  'origin-325a': {
    shape: 'fighter', width: 210, height: 125,
    hardpoints: [
      { type: 'weapon', size: 3, x: 105, y: 20, label: 'Nez S3 central' },
      { type: 'weapon', size: 3, x: 60, y: 48, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 150, y: 48, label: 'Aile S3 droit' },
      { type: 'missile', size: 2, x: 75, y: 90, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 135, y: 90, label: 'Rack S2 droit' },
    ],
  },
  'aegis-sabre': {
    shape: 'fighter', width: 240, height: 135,
    hardpoints: [
      { type: 'weapon', size: 3, x: 80, y: 28, label: 'Nez S3 gauche' },
      { type: 'weapon', size: 3, x: 160, y: 28, label: 'Nez S3 droit' },
      { type: 'weapon', size: 3, x: 50, y: 60, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 190, y: 60, label: 'Aile S3 droit' },
      { type: 'missile', size: 2, x: 90, y: 100, label: 'Rack S2 gauche' },
      { type: 'missile', size: 2, x: 150, y: 100, label: 'Rack S2 droit' },
    ],
  },
  'misc-prospector': {
    shape: 'mining', width: 220, height: 140,
    hardpoints: [
      { type: 'utility', size: 1, x: 110, y: 25, label: 'Laser mineur S1' },
      { type: 'weapon', size: 1, x: 70, y: 55, label: 'S1 gauche' },
      { type: 'weapon', size: 1, x: 150, y: 55, label: 'S1 droit' },
      { type: 'missile', size: 1, x: 110, y: 105, label: 'Rack S1 ventral' },
    ],
  },
  'drake-caterpillar': {
    shape: 'cargo', width: 300, height: 160,
    hardpoints: [
      { type: 'turret', size: 2, x: 150, y: 18, label: 'Tourelle S2 avant', arc: 270 },
      { type: 'turret', size: 2, x: 50, y: 60, label: 'Tourelle S2 flanc gauche', arc: 180 },
      { type: 'turret', size: 2, x: 250, y: 60, label: 'Tourelle S2 flanc droit', arc: 180 },
      { type: 'turret', size: 2, x: 100, y: 130, label: 'Tourelle S2 arrière gauche', arc: 180 },
      { type: 'turret', size: 2, x: 200, y: 130, label: 'Tourelle S2 arrière droit', arc: 180 },
    ],
  },
  'rsi-scorpius': {
    shape: 'fighter', width: 250, height: 140,
    hardpoints: [
      { type: 'weapon', size: 3, x: 85, y: 25, label: 'Nez S3 gauche' },
      { type: 'weapon', size: 3, x: 165, y: 25, label: 'Nez S3 droit' },
      { type: 'weapon', size: 3, x: 50, y: 55, label: 'Aile S3 gauche' },
      { type: 'weapon', size: 3, x: 200, y: 55, label: 'Aile S3 droit' },
      { type: 'turret', size: 3, x: 125, y: 65, label: 'Tourelle copilote S3 x2', arc: 360 },
      { type: 'missile', size: 3, x: 80, y: 105, label: 'Rack S3 gauche' },
      { type: 'missile', size: 3, x: 170, y: 105, label: 'Rack S3 droit' },
    ],
  },
};

// ─── DPS & Énergie estimés par taille ──────────────────────────────
const SIZE_STATS = {
  1: { dps: 85, power: 1.2, heat: 1.0, rpm: 625, range: 1800 },
  2: { dps: 170, power: 2.0, heat: 1.8, rpm: 500, range: 2400 },
  3: { dps: 320, power: 3.5, heat: 3.2, rpm: 400, range: 3200 },
  4: { dps: 530, power: 5.0, heat: 5.0, rpm: 300, range: 4000 },
  5: { dps: 800, power: 7.5, heat: 7.5, rpm: 200, range: 5000 },
  6: { dps: 1200, power: 11.0, heat: 10.5, rpm: 120, range: 6200 },
};

const HP_COLORS = {
  weapon: { fill: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  missile: { fill: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  turret: { fill: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  utility: { fill: '#22c55e', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
};

const HP_ICONS = {
  weapon: Crosshair,
  missile: Target,
  turret: Shield,
  utility: Wrench,
};

const HP_LABELS = {
  weapon: 'Arme',
  missile: 'Missile',
  turret: 'Tourelle',
  utility: 'Utilitaire',
};

// ─── SVG ship outlines ────────────────────────────────────────────
function ShipOutline({ shape, width, height }) {
  const cx = width / 2;
  const commonProps = { fill: 'none', stroke: '#22d3ee', strokeWidth: 1.5, opacity: 0.5 };

  switch (shape) {
    case 'fighter': {
      const pts = [
        `${cx},8`,
        `${width - 25},${height * 0.35}`,
        `${width - 15},${height * 0.55}`,
        `${width - 30},${height * 0.7}`,
        `${cx + 20},${height - 15}`,
        `${cx - 20},${height - 15}`,
        `${30},${height * 0.7}`,
        `${15},${height * 0.55}`,
        `${25},${height * 0.35}`,
      ].join(' ');
      return (
        <g>
          <polygon points={pts} {...commonProps} />
          <line x1={cx} y1={12} x2={cx} y2={height - 20} stroke="#22d3ee" strokeWidth={0.5} opacity={0.2} />
          <line x1={30} y1={height * 0.5} x2={width - 30} y2={height * 0.5} stroke="#22d3ee" strokeWidth={0.5} opacity={0.15} />
        </g>
      );
    }
    case 'cargo': {
      const pts = [
        `${cx},12`,
        `${width - 20},${height * 0.2}`,
        `${width - 12},${height * 0.4}`,
        `${width - 12},${height * 0.8}`,
        `${width - 25},${height - 12}`,
        `${25},${height - 12}`,
        `${12},${height * 0.8}`,
        `${12},${height * 0.4}`,
        `${20},${height * 0.2}`,
      ].join(' ');
      return (
        <g>
          <polygon points={pts} {...commonProps} />
          <line x1={cx} y1={16} x2={cx} y2={height - 16} stroke="#22d3ee" strokeWidth={0.5} opacity={0.2} />
          <rect x={width * 0.2} y={height * 0.35} width={width * 0.6} height={height * 0.35}
            stroke="#22d3ee" strokeWidth={0.5} fill="none" opacity={0.15} rx={3} />
        </g>
      );
    }
    case 'capital': {
      const pts = [
        `${cx},8`,
        `${cx + 40},${height * 0.12}`,
        `${width - 18},${height * 0.3}`,
        `${width - 10},${height * 0.5}`,
        `${width - 18},${height * 0.7}`,
        `${cx + 30},${height - 15}`,
        `${cx - 30},${height - 15}`,
        `${18},${height * 0.7}`,
        `${10},${height * 0.5}`,
        `${18},${height * 0.3}`,
        `${cx - 40},${height * 0.12}`,
      ].join(' ');
      return (
        <g>
          <polygon points={pts} {...commonProps} />
          <line x1={cx} y1={12} x2={cx} y2={height - 18} stroke="#22d3ee" strokeWidth={0.5} opacity={0.2} />
          <ellipse cx={cx} cy={height * 0.45} rx={width * 0.25} ry={height * 0.18}
            stroke="#22d3ee" strokeWidth={0.5} fill="none" opacity={0.12} />
        </g>
      );
    }
    case 'mining': {
      const pts = [
        `${cx},12`,
        `${cx + 25},${height * 0.15}`,
        `${width - 20},${height * 0.3}`,
        `${width - 15},${height * 0.6}`,
        `${width - 25},${height * 0.8}`,
        `${cx + 15},${height - 12}`,
        `${cx - 15},${height - 12}`,
        `${25},${height * 0.8}`,
        `${15},${height * 0.6}`,
        `${20},${height * 0.3}`,
        `${cx - 25},${height * 0.15}`,
      ].join(' ');
      return (
        <g>
          <polygon points={pts} {...commonProps} />
          <line x1={cx} y1={16} x2={cx} y2={height - 16} stroke="#22d3ee" strokeWidth={0.5} opacity={0.2} />
          <circle cx={cx} cy={height * 0.5} r={height * 0.18}
            stroke="#22d3ee" strokeWidth={0.5} fill="none" opacity={0.15} />
        </g>
      );
    }
    default:
      return <rect x={10} y={10} width={width - 20} height={height - 20} rx={8} {...commonProps} />;
  }
}

// ─── Marqueur de hardpoint ─────────────────────────────────────────
function HardpointMarker({ hp, index, isSelected, onClick }) {
  const color = HP_COLORS[hp.type];
  const r = 8 + (hp.size || 1);

  return (
    <g
      className="cursor-pointer"
      onClick={() => onClick(index)}
      style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color.fill})` : 'none' }}
    >
      {/* Arc de couverture pour les tourelles */}
      {hp.type === 'turret' && hp.arc && (
        <circle cx={hp.x} cy={hp.y} r={r + 14}
          fill={color.fill} fillOpacity={0.06}
          stroke={color.fill} strokeWidth={0.8} strokeDasharray="3,3" opacity={0.4}
        />
      )}
      {/* Cercle extérieur */}
      <circle cx={hp.x} cy={hp.y} r={r}
        fill={color.fill} fillOpacity={isSelected ? 0.5 : 0.25}
        stroke={color.fill} strokeWidth={isSelected ? 2 : 1.2}
      />
      {/* Label taille */}
      <text x={hp.x} y={hp.y + 1}
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={9} fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {hp.size > 0 ? `S${hp.size}` : 'U'}
      </text>
    </g>
  );
}

// ─── Composant principal ───────────────────────────────────────────
export default function HardpointVisualizer() {
  const [selectedShipId, setSelectedShipId] = useState('aegis-gladius');
  const [selectedHP, setSelectedHP] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showListAll, setShowListAll] = useState(true);

  // Vaisseaux avec schémas disponibles
  const availableShips = useMemo(() => {
    const schemaIds = new Set(Object.keys(SHIP_SCHEMATICS));
    return SHIPS.filter(s => schemaIds.has(s.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filtrer par recherche
  const filteredShips = useMemo(() => {
    if (!searchTerm) return availableShips;
    const term = searchTerm.toLowerCase();
    return availableShips.filter(s =>
      s.name.toLowerCase().includes(term) || s.manufacturer.toLowerCase().includes(term)
    );
  }, [availableShips, searchTerm]);

  const shipData = useMemo(() => SHIPS.find(s => s.id === selectedShipId), [selectedShipId]);
  const schematic = SHIP_SCHEMATICS[selectedShipId];

  // Calculs DPS & énergie
  const stats = useMemo(() => {
    if (!schematic) return null;
    let totalDPS = 0, totalPower = 0, totalHeat = 0;
    const byType = { weapon: 0, missile: 0, turret: 0, utility: 0 };
    const byDamageType = { énergie: 0, balistique: 0, distorsion: 0 };

    schematic.hardpoints.forEach(hp => {
      const s = SIZE_STATS[hp.size] || { dps: 0, power: 0, heat: 0 };
      const dps = hp.type === 'utility' ? 0 : s.dps;
      totalDPS += dps;
      totalPower += s.power;
      totalHeat += s.heat;
      byType[hp.type] = (byType[hp.type] || 0) + dps;

      // Répartition simulée des types de dégâts
      if (hp.type === 'weapon') {
        byDamageType.énergie += dps * 0.5;
        byDamageType.balistique += dps * 0.35;
        byDamageType.distorsion += dps * 0.15;
      } else if (hp.type === 'turret') {
        byDamageType.énergie += dps * 0.4;
        byDamageType.balistique += dps * 0.45;
        byDamageType.distorsion += dps * 0.15;
      } else if (hp.type === 'missile') {
        byDamageType.balistique += dps * 0.8;
        byDamageType.énergie += dps * 0.2;
      }
    });

    return { totalDPS, totalPower, totalHeat, byType, byDamageType };
  }, [schematic]);

  const handleHPClick = useCallback((idx) => {
    setSelectedHP(prev => prev === idx ? null : idx);
  }, []);

  const handleShipChange = useCallback((id) => {
    setSelectedShipId(id);
    setSelectedHP(null);
  }, []);

  if (!schematic || !shipData) return null;

  const selectedHPData = selectedHP !== null ? schematic.hardpoints[selectedHP] : null;
  const selectedHPStats = selectedHPData ? SIZE_STATS[selectedHPData.size] : null;

  return (
    <div className="min-h-screen bg-space-dark p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 flex items-center gap-3">
          <CircleDot className="w-7 h-7" />
          Visualiseur de Hardpoints
        </h1>
        <p className="text-gray-400 mt-1">Diagramme schématique des points d'emport — Alpha 4.6</p>
      </div>

      {/* Ship Selector */}
      <div className="bg-space-800 border border-space-600 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Vaisseau</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher un vaisseau..."
                className="w-full bg-space-900 border border-space-600 rounded-lg pl-9 pr-8 py-2 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 bg-space-900 border border-space-600 rounded-lg max-h-48 overflow-y-auto">
                {filteredShips.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">Aucun vaisseau trouvé</div>
                ) : (
                  filteredShips.map(s => (
                    <button key={s.id}
                      onClick={() => { handleShipChange(s.id); setSearchTerm(''); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-space-700 transition-colors ${
                        s.id === selectedShipId ? 'text-cyan-400 bg-space-700' : 'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 mr-2">{s.manufacturer}</span>
                      {s.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Ship chips */}
          <div className="flex flex-wrap gap-2">
            {availableShips.map(s => (
              <button key={s.id}
                onClick={() => handleShipChange(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  s.id === selectedShipId
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-space-700 text-gray-400 border border-space-600 hover:border-gray-500'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ship info bar */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="text-gray-400">
            <span className="text-gray-600">Fabricant :</span>{' '}
            <span className="text-white">{shipData.manufacturer}</span>
          </span>
          <span className="text-gray-400">
            <span className="text-gray-600">Rôle :</span>{' '}
            <span className="text-white">{shipData.role}</span>
          </span>
          <span className="text-gray-400">
            <span className="text-gray-600">Taille :</span>{' '}
            <span className="text-white">{shipData.size}</span>
          </span>
          <span className="text-gray-400">
            <span className="text-gray-600">Équipage :</span>{' '}
            <span className="text-white">{shipData.crew.min}–{shipData.crew.max}</span>
          </span>
        </div>
      </div>

      {/* Main content: Diagram + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Diagram */}
        <div className="lg:col-span-2 bg-space-800 border border-space-600 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Schéma — Vue de dessus
          </h2>

          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${schematic.width} ${schematic.height}`}
              className="w-full max-w-lg"
              style={{ aspectRatio: `${schematic.width}/${schematic.height}` }}
            >
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth={0.5} />
                </pattern>
              </defs>
              <rect width={schematic.width} height={schematic.height} fill="url(#grid)" opacity={0.5} />

              {/* Ship outline */}
              <ShipOutline shape={schematic.shape} width={schematic.width} height={schematic.height} />

              {/* Direction arrow */}
              <polygon
                points={`${schematic.width / 2 - 4},6 ${schematic.width / 2 + 4},6 ${schematic.width / 2},1`}
                fill="#22d3ee" opacity={0.4}
              />

              {/* Hardpoint markers */}
              {schematic.hardpoints.map((hp, i) => (
                <HardpointMarker key={i} hp={hp} index={i}
                  isSelected={selectedHP === i} onClick={handleHPClick} />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {Object.entries(HP_COLORS).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.fill, opacity: 0.7 }} />
                <span className="text-gray-400">{HP_LABELS[type]}</span>
              </div>
            ))}
          </div>

          {/* Selected hardpoint detail */}
          {selectedHPData && selectedHPStats && (
            <div className={`mt-4 p-4 rounded-lg border ${HP_COLORS[selectedHPData.type].bg} ${HP_COLORS[selectedHPData.type].border}`}>
              <div className="flex items-center gap-2 mb-3">
                {React.createElement(HP_ICONS[selectedHPData.type], {
                  className: `w-5 h-5 ${HP_COLORS[selectedHPData.type].text}`
                })}
                <span className={`font-bold ${HP_COLORS[selectedHPData.type].text}`}>
                  {selectedHPData.label}
                </span>
                <span className="ml-auto text-xs bg-space-900/50 px-2 py-0.5 rounded text-gray-400">
                  Taille {selectedHPData.size > 0 ? `S${selectedHPData.size}` : 'Utilitaire'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">DPS estimé</span>
                  <div className="text-white font-mono">{selectedHPData.type === 'utility' ? '—' : `${selectedHPStats.dps}`}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Consommation</span>
                  <div className="text-white font-mono">{selectedHPStats.power} pwr/s</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Chaleur</span>
                  <div className="text-white font-mono">{selectedHPStats.heat} heat/s</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Portée</span>
                  <div className="text-white font-mono">{selectedHPStats.range} m</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Cadence</span>
                  <div className="text-white font-mono">{selectedHPStats.rpm} rpm</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Type</span>
                  <div className="text-white font-mono capitalize">{HP_LABELS[selectedHPData.type]}</div>
                </div>
                {selectedHPData.arc && (
                  <div>
                    <span className="text-gray-500 text-xs">Arc couverture</span>
                    <div className="text-white font-mono">{selectedHPData.arc}°</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Component List + Summaries */}
        <div className="space-y-4">
          {/* Component list */}
          <div className="bg-space-800 border border-space-600 rounded-xl p-4">
            <button
              onClick={() => setShowListAll(!showListAll)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Liste des hardpoints ({schematic.hardpoints.length})
              </span>
              {showListAll ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {showListAll && (
              <div className="space-y-2">
                {schematic.hardpoints.map((hp, i) => {
                  const Icon = HP_ICONS[hp.type];
                  const colors = HP_COLORS[hp.type];
                  const isActive = selectedHP === i;
                  return (
                    <button key={i}
                      onClick={() => handleHPClick(i)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm border ${
                        isActive
                          ? `${colors.bg} ${colors.border}`
                          : 'bg-space-900/50 border-transparent hover:border-space-500'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`truncate ${isActive ? colors.text : 'text-gray-300'}`}>
                          {hp.label}
                        </div>
                        <div className="text-xs text-gray-600">
                          {HP_LABELS[hp.type]} • {hp.size > 0 ? `Taille ${hp.size}` : 'Utilitaire'}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gray-500">
                        {hp.size > 0 ? `S${hp.size}` : 'U'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Power / Cooling summary */}
          {stats && (
            <div className="bg-space-800 border border-space-600 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Énergie & Refroidissement
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Consommation totale</span>
                    <span className="text-yellow-400 font-mono">{stats.totalPower.toFixed(1)} pwr/s</span>
                  </div>
                  <div className="h-2 bg-space-900 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500/60 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalPower / 50) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Génération de chaleur</span>
                    <span className="text-orange-400 font-mono">{stats.totalHeat.toFixed(1)} heat/s</span>
                  </div>
                  <div className="h-2 bg-space-900 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500/60 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.totalHeat / 50) * 100)}%` }} />
                  </div>
                </div>

                {/* Jauge thermique */}
                <div className="mt-2 p-3 bg-space-900/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Thermometer className="w-3 h-3" />
                    Ratio chaleur / énergie
                  </div>
                  <div className="text-lg font-mono text-white">
                    {stats.totalPower > 0
                      ? (stats.totalHeat / stats.totalPower).toFixed(2)
                      : '—'
                    }
                    <span className="text-xs text-gray-500 ml-1">heat/pwr</span>
                  </div>
                  {stats.totalHeat / stats.totalPower > 0.9 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-orange-400">
                      <AlertTriangle className="w-3 h-3" />
                      Ratio élevé — refroidissement recommandé
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DPS Summary */}
          {stats && (
            <div className="bg-space-800 border border-space-600 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-red-400" />
                Résumé DPS
              </h3>

              {/* Total DPS */}
              <div className="text-center mb-4 p-3 bg-space-900/50 rounded-lg">
                <div className="text-3xl font-bold text-white font-mono">
                  {stats.totalDPS.toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-gray-500 mt-1">DPS total estimé</div>
              </div>

              {/* By hardpoint type */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Par type de hardpoint</div>
                <div className="space-y-2">
                  {Object.entries(stats.byType).filter(([, v]) => v > 0).map(([type, dps]) => (
                    <div key={type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={HP_COLORS[type]?.text || 'text-gray-400'}>{HP_LABELS[type] || type}</span>
                        <span className="text-gray-300 font-mono">{dps.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="h-1.5 bg-space-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${(dps / stats.totalDPS) * 100}%`,
                            backgroundColor: HP_COLORS[type]?.fill || '#666'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By damage type */}
              <div>
                <div className="text-xs text-gray-500 mb-2">Par type de dégâts</div>
                <div className="space-y-2">
                  {[
                    { key: 'énergie', color: '#3b82f6', label: 'Énergie' },
                    { key: 'balistique', color: '#f59e0b', label: 'Balistique' },
                    { key: 'distorsion', color: '#a855f7', label: 'Distorsion' },
                  ].map(({ key, color, label }) => {
                    const val = stats.byDamageType[key] || 0;
                    if (val <= 0) return null;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color }}>{label}</span>
                          <span className="text-gray-300 font-mono">{Math.round(val).toLocaleString('fr-FR')}</span>
                        </div>
                        <div className="h-1.5 bg-space-900 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(val / stats.totalDPS) * 100}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info note */}
              <div className="mt-4 p-2 bg-space-900/30 rounded-lg flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-600">
                  Valeurs estimées basées sur les tailles d'emport. Le DPS réel dépend
                  des armes installées et du type de munitions.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
