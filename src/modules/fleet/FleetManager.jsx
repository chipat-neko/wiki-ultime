import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppActions } from '../../core/StateManager.jsx';
import { SHIPS, SHIPS_BY_ID } from '../../datasets/ships.js';
import { formatCredits, formatCargo, formatNumber } from '../../utils/formatters.js';
import { generateId, downloadJson } from '../../utils/helpers.js';
import Modal, { ConfirmModal } from '../../ui/components/Modal.jsx';
import clsx from 'clsx';
import {
  Anchor, Plus, Trash2, Edit, Download, Upload, Zap,
  Package, Users, Shield, BarChart3, Save, FileJson,
  Rocket, Settings, Star,
} from 'lucide-react';

function FleetShipCard({ fleetShip, onRemove, onEdit }) {
  const ship = SHIPS_BY_ID[fleetShip.shipId] || fleetShip;

  return (
    <div className="card p-4 flex items-start gap-3 group hover:border-cyan-500/20">
      <div className="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0">
        <Rocket className="w-5 h-5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">{ship.name}</h3>
            <p className="text-xs text-slate-500">{ship.manufacturer}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(fleetShip)} className="btn-ghost p-1">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onRemove(fleetShip.fleetId)} className="btn-ghost p-1 text-danger-400 hover:text-danger-300">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          <span className="badge badge-slate">{ship.role}</span>
          <span className={clsx('badge', {
            'badge-cyan': ship.size === 'Petit',
            'badge-green': ship.size === 'Moyen',
            'badge-purple': ship.size === 'Grand',
            'badge-slate': ship.size === 'Nain',
          })}>
            {ship.size}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-1.5 rounded bg-space-900/60">
            <div className="text-xs text-slate-500">Cargo</div>
            <div className="text-xs font-medium text-green-400">
              {ship.specs?.cargo > 0 ? `${ship.specs.cargo} SCU` : '—'}
            </div>
          </div>
          <div className="text-center p-1.5 rounded bg-space-900/60">
            <div className="text-xs text-slate-500">Crew</div>
            <div className="text-xs font-medium text-slate-300">
              {ship.crew?.min ?? ship.specs?.crew?.min ?? 1}-{ship.crew?.max ?? ship.specs?.crew?.max ?? 1}
            </div>
          </div>
          <div className="text-center p-1.5 rounded bg-space-900/60">
            <div className="text-xs text-slate-500">Valeur</div>
            <div className="text-xs font-medium text-gold-400">
              {formatCredits(ship.price, true)}
            </div>
          </div>
        </div>

        {fleetShip.note && (
          <p className="text-xs text-slate-500 mt-2 italic">{fleetShip.note}</p>
        )}
      </div>
    </div>
  );
}

export default function FleetManager() {
  const navigate = useNavigate();
  const { fleet } = useAppState();
  const { addShipToFleet, removeShipFromFleet, renameFleet, clearFleet, saveFleetSetup, notify } = useAppActions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveSetup, setShowSaveSetup] = useState(false);
  const [editingFleetName, setEditingFleetName] = useState(false);
  const [fleetNameInput, setFleetNameInput] = useState(fleet.name);
  const [setupName, setSetupName] = useState('');
  const [searchShip, setSearchShip] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const totalCargo = fleet.ships.reduce((sum, fs) => {
    const ship = SHIPS_BY_ID[fs.shipId] || fs;
    return sum + (ship.specs?.cargo || 0);
  }, 0);

  const totalValue = fleet.ships.reduce((sum, fs) => {
    const ship = SHIPS_BY_ID[fs.shipId] || fs;
    return sum + (ship.price || 0);
  }, 0);

  const filteredAvailableShips = SHIPS.filter(s => {
    if (searchShip && !s.name.toLowerCase().includes(searchShip.toLowerCase()) && !s.manufacturer.toLowerCase().includes(searchShip.toLowerCase())) return false;
    if (selectedRole && s.role !== selectedRole) return false;
    return true;
  });

  const handleExportFleet = () => {
    downloadJson({
      name: fleet.name,
      ships: fleet.ships,
      exportedAt: new Date().toISOString(),
    }, `flotte_${fleet.name.replace(/\s+/g, '_')}.json`);
    notify('Flotte exportée en JSON', 'success');
  };

  const handleSaveSetup = () => {
    if (!setupName.trim()) return;
    saveFleetSetup({
      id: generateId('setup'),
      name: setupName,
      ships: [...fleet.ships],
    });
    notify(`Configuration "${setupName}" sauvegardée`, 'success');
    setShowSaveSetup(false);
    setSetupName('');
  };

  const roles = [...new Set(SHIPS.map(s => s.role))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Gestionnaire de Flotte</h1>
          {editingFleetName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                autoFocus
                value={fleetNameInput}
                onChange={e => setFleetNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { renameFleet(fleetNameInput); setEditingFleetName(false); }
                  if (e.key === 'Escape') setEditingFleetName(false);
                }}
                className="input text-sm py-1 h-8 w-48"
              />
              <button onClick={() => { renameFleet(fleetNameInput); setEditingFleetName(false); }} className="btn-primary btn-sm py-1">
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingFleetName(true)} className="text-slate-400 hover:text-cyan-400 text-sm flex items-center gap-1 mt-1 transition-colors">
              {fleet.name} <Edit className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowSaveSetup(true)} className="btn-secondary gap-2" disabled={fleet.ships.length === 0}>
            <Save className="w-4 h-4" />
            Sauvegarder Config
          </button>
          <button onClick={handleExportFleet} className="btn-secondary gap-2" disabled={fleet.ships.length === 0}>
            <Download className="w-4 h-4" />
            Exporter JSON
          </button>
          <button onClick={() => navigate('/flotte/analyse')} className="btn-secondary gap-2">
            <BarChart3 className="w-4 h-4" />
            Analyser
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vaisseaux', value: fleet.ships.length, icon: Rocket, color: 'text-cyan-400' },
          { label: 'Cargo Total', value: formatCargo(totalCargo), icon: Package, color: 'text-green-400' },
          { label: 'Équipage Min', value: formatNumber(fleet.ships.reduce((s, fs) => { const sh = SHIPS_BY_ID[fs.shipId] || fs; return s + (sh.crew?.min || sh.specs?.crew?.min || 1); }, 0)), icon: Users, color: 'text-orange-400' },
          { label: 'Valeur Totale', value: formatCredits(totalValue, true), icon: Star, color: 'text-gold-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-space-700/60">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
              <p className={`text-lg font-bold font-display ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Ships */}
      {fleet.ships.length === 0 ? (
        <div className="card p-12 text-center">
          <Anchor className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-400 mb-2">Flotte Vide</h2>
          <p className="text-slate-500 mb-6">Ajoutez des vaisseaux pour commencer à construire votre flotte.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un Vaisseau
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {fleet.ships.map(fs => (
            <FleetShipCard
              key={fs.fleetId}
              fleetShip={fs}
              onRemove={(id) => {
                removeShipFromFleet(id);
                notify('Vaisseau retiré de la flotte', 'info');
              }}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}

      {fleet.ships.length > 0 && (
        <div className="flex justify-end">
          <button onClick={() => setShowClearConfirm(true)} className="btn-danger gap-2">
            <Trash2 className="w-4 h-4" />
            Vider la Flotte
          </button>
        </div>
      )}

      {/* Add Ship Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un Vaisseau"
        subtitle="Sélectionnez un vaisseau à ajouter à votre flotte"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchShip}
              onChange={e => setSearchShip(e.target.value)}
              className="input flex-1"
            />
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="select w-40">
              <option value="">Tous les rôles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto scroll-container pr-1">
            {filteredAvailableShips.map(ship => (
              <button
                key={ship.id}
                onClick={() => {
                  addShipToFleet({
                    fleetId: generateId('fleet'),
                    shipId: ship.id,
                    name: ship.name,
                    manufacturer: ship.manufacturer,
                    role: ship.role,
                    size: ship.size,
                    specs: ship.specs,
                    price: ship.price,
                  });
                  notify(`${ship.name} ajouté !`, 'success');
                }}
                className="flex items-center gap-3 p-3 rounded-lg bg-space-900/60 hover:bg-space-700/50 border border-space-400/10 hover:border-cyan-500/20 text-left transition-all"
              >
                <div className="w-8 h-8 rounded bg-space-700 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-200 truncate">{ship.name}</div>
                  <div className="text-xs text-slate-500">{ship.manufacturer} • {ship.role}</div>
                </div>
                <Plus className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Save Setup Modal */}
      <Modal
        isOpen={showSaveSetup}
        onClose={() => setShowSaveSetup(false)}
        title="Sauvegarder la Configuration"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowSaveSetup(false)} className="btn-secondary">Annuler</button>
            <button onClick={handleSaveSetup} className="btn-primary" disabled={!setupName.trim()}>
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm text-slate-400">Nom de la configuration</label>
          <input
            autoFocus
            type="text"
            placeholder="Ex: Flotte de Commerce v2"
            value={setupName}
            onChange={e => setSetupName(e.target.value)}
            className="input"
          />
        </div>
      </Modal>

      {/* Clear Confirm */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => { clearFleet(); notify('Flotte vidée', 'info'); }}
        title="Vider la Flotte"
        message={`Êtes-vous sûr de vouloir supprimer tous les ${fleet.ships.length} vaisseaux de votre flotte ? Cette action est irréversible.`}
        confirmLabel="Vider"
        variant="danger"
      />
    </div>
  );
}
