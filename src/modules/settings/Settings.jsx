import React, { useState } from 'react';
import { useAppActions, useSettings, useTheme } from '../../core/StateManager.jsx';
import { StorageManager } from '../../core/StorageManager.js';
import { downloadJson } from '../../utils/helpers.js';
import clsx from 'clsx';
import {
  Settings as SettingsIcon, Moon, Sun, Download, Upload, Trash2,
  Database, Bell, Globe, Palette, Shield, Info, CheckCircle2,
  AlertTriangle, RefreshCw,
} from 'lucide-react';

function SettingSection({ title, icon: Icon, children }) {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="section-title flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <label className="flex-shrink-0 cursor-pointer">
        <div className="relative">
          <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
          <div className="w-10 h-5 bg-space-500 peer-checked:bg-cyan-600 rounded-full transition-colors border border-space-400/40" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </div>
      </label>
    </div>
  );
}

function SelectRow({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)} className="select w-auto flex-shrink-0">
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const { updateSettings, notify, clearHistory, clearFavorites } = useAppActions();

  const [storageInfo] = useState(() => {
    const size = StorageManager.getStorageSize();
    return { used: parseFloat(size.kb).toFixed(1), keys: Object.keys(localStorage).filter(k => k.startsWith('sc_companion_')).length };
  });
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const data = StorageManager.exportAll();
    downloadJson(data, `sc-companion-backup-${Date.now()}.json`);
    notify('Données exportées avec succès !', 'success');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { readJsonFile } = await import('../../utils/helpers.js');
      const data = await readJsonFile(file);
      StorageManager.importAll(data);
      notify('Données importées. Rechargez la page pour appliquer.', 'success');
    } catch {
      notify('Erreur lors de l\'importation.', 'error');
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    clearHistory();
    clearFavorites();
    notify('Données locales effacées.', 'success');
    setConfirmReset(false);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Personnalisez votre expérience Star Citizen Companion</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <SettingSection title="Apparence" icon={Palette}>
          <ToggleRow
            label="Mode Sombre"
            description="Interface sombre optimisée pour les longues sessions"
            checked={theme === 'dark'}
            onChange={() => toggleTheme()}
          />
          <SelectRow
            label="Langue de l'Interface"
            description="Langue d'affichage de l'application"
            value={settings.language || 'fr'}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
            ]}
            onChange={v => updateSettings({ language: v })}
          />
          <SelectRow
            label="Taille de Police"
            description="Taille du texte dans l'interface"
            value={settings.fontSize || 'normal'}
            options={[
              { value: 'small', label: 'Petite' },
              { value: 'normal', label: 'Normale' },
              { value: 'large', label: 'Grande' },
            ]}
            onChange={v => updateSettings({ fontSize: v })}
          />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications" icon={Bell}>
          <ToggleRow
            label="Notifications Activées"
            description="Affiche les messages de confirmation et d'erreur"
            checked={settings.notifications !== false}
            onChange={v => updateSettings({ notifications: v })}
          />
          <SelectRow
            label="Durée des Notifications"
            description="Temps d'affichage avant disparition automatique"
            value={String(settings.notificationDuration || 4000)}
            options={[
              { value: '2000', label: '2 secondes' },
              { value: '4000', label: '4 secondes' },
              { value: '6000', label: '6 secondes' },
              { value: '0', label: 'Manuel' },
            ]}
            onChange={v => updateSettings({ notificationDuration: Number(v) })}
          />
        </SettingSection>

        {/* Commerce & Trading */}
        <SettingSection title="Commerce" icon={Globe}>
          <ToggleRow
            label="Afficher les Commodités Illégales"
            description="Inclure les marchandises illégales dans les résultats"
            checked={settings.showIllegal !== false}
            onChange={v => updateSettings({ showIllegal: v })}
          />
          <SelectRow
            label="Devise par Défaut"
            description="Unité monétaire affichée dans les calculs"
            value={settings.currency || 'aUEC'}
            options={[
              { value: 'aUEC', label: 'aUEC (alpha)' },
              { value: 'UEC', label: 'UEC' },
            ]}
            onChange={v => updateSettings({ currency: v })}
          />
          <SelectRow
            label="Nombre par Page"
            description="Éléments affichés par défaut dans les tableaux"
            value={String(settings.pageSize || 20)}
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
            ]}
            onChange={v => updateSettings({ pageSize: Number(v) })}
          />
        </SettingSection>

        {/* Performance */}
        <SettingSection title="Performance" icon={RefreshCw}>
          <ToggleRow
            label="Animations Activées"
            description="Transitions et effets visuels (désactiver pour meilleures performances)"
            checked={settings.animations !== false}
            onChange={v => updateSettings({ animations: v })}
          />
          <ToggleRow
            label="Mise en Cache des API"
            description="Mémoriser les données récupérées pour réduire les requêtes"
            checked={settings.cacheEnabled !== false}
            onChange={v => updateSettings({ cacheEnabled: v })}
          />
          <SelectRow
            label="TTL du Cache"
            description="Durée de validité des données en cache"
            value={String(settings.cacheTTL || 300000)}
            options={[
              { value: '60000', label: '1 minute' },
              { value: '300000', label: '5 minutes' },
              { value: '600000', label: '10 minutes' },
              { value: '1800000', label: '30 minutes' },
            ]}
            onChange={v => updateSettings({ cacheTTL: Number(v) })}
          />
        </SettingSection>

        {/* Data management */}
        <SettingSection title="Gestion des Données" icon={Database}>
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-medium text-slate-200">Stockage Utilisé</p>
              <p className="text-xs text-slate-500">{storageInfo.keys} clés • {storageInfo.used} Ko</p>
            </div>
            <div className="text-sm font-bold text-cyan-400">{storageInfo.used} Ko</div>
          </div>

          <div className="border-t border-space-400/20 pt-4 space-y-2">
            <button onClick={handleExport} className="btn-secondary gap-2 w-full text-sm">
              <Download className="w-4 h-4" />
              Exporter mes Données (JSON)
            </button>

            <label className="btn gap-2 w-full text-sm cursor-pointer border border-space-300/20 text-slate-300 hover:bg-space-700/40 transition-colors justify-center">
              <Upload className="w-4 h-4" />
              Importer des Données
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </SettingSection>

        {/* Danger zone */}
        <SettingSection title="Zone Critique" icon={Shield}>
          <div className="p-3 rounded-lg bg-warning-500/5 border border-warning-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Ces actions sont irréversibles. Exportez vos données avant de procéder.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleReset}
              className={clsx(
                'btn gap-2 w-full text-sm transition-all',
                confirmReset
                  ? 'btn-danger'
                  : 'border border-danger-500/30 text-danger-400 hover:bg-danger-500/10'
              )}
            >
              <Trash2 className="w-4 h-4" />
              {confirmReset ? 'Cliquez encore pour confirmer' : 'Effacer Favoris & Historique'}
            </button>
          </div>
        </SettingSection>
      </div>

      {/* App info */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 rounded-xl bg-cyan-500/10">
          <Info className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-200">Star Citizen Companion</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Version 1.0.0 • Données basées sur Star Citizen Alpha 4.7 •
            Non affilié avec Cloud Imperium Games
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-success-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          À jour
        </div>
      </div>
    </div>
  );
}
