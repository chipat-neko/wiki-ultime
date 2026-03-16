import React, { useState, useMemo } from 'react';
import { STATIONS } from '../../datasets/stations.js';
import {
  Building, MapPin, Shield, ShoppingBag, Wrench, Filter, AlertTriangle,
  ChevronDown, ChevronRight, Anchor, Zap, Package, RefreshCw, Star,
  Search, Globe, Lock, BarChart3, CheckCircle, XCircle, Users,
  Crosshair, Heart, Fuel, Sword,
} from 'lucide-react';
import clsx from 'clsx';

const TYPE_ICONS = {
  'Ville': Building, 'Station Atmosphérique': Building,
  'Station de Lagrange': Anchor, 'Station Criminelle': AlertTriangle,
  'Avant-poste Illégal': AlertTriangle, 'Station de Service': RefreshCw,
  'Station Commerciale': ShoppingBag, 'Avant-poste': MapPin,
};
const SYSTEM_COLORS = { Stanton: 'text-cyan-400', Pyro: 'text-orange-400', Nyx: 'text-purple-400' };
const SYSTEM_BG = { Stanton: 'bg-cyan-500/10 border-cyan-500/20', Pyro: 'bg-orange-500/10 border-orange-500/20', Nyx: 'bg-purple-500/10 border-purple-500/20' };
const SECURITY_COLOR = {
  'Haute': 'text-success-400', 'Modérée': 'text-warning-400',
  'Faible': 'text-danger-400', 'Aucune': 'text-danger-400', 'Maximum': 'text-success-400',
};
const SECURITY_BADGE = {
  'Haute': 'badge-green', 'Modérée': 'badge-yellow',
  'Faible': 'badge-red', 'Aucune': 'badge-red', 'Maximum': 'badge-green',
};
const SERVICE_COLORS = {
  'Commerce': 'badge-cyan', 'Réparation': 'badge-slate', 'Ravitaillement': 'badge-slate',
  'Missions': 'badge-purple', 'Raffinerie': 'badge-yellow', 'Spawn': 'badge-green',
  'Hôpital': 'badge-green', 'Commerce Illégal': 'badge-red', 'Missions Criminelles': 'badge-red',
  'Armurerie': 'badge-orange', 'Effacement de Casier': 'badge-red', 'Distillation': 'badge-slate',
};

// ─── Définition des services à trouver ────────────────────────────────────────
const SERVICE_TYPES = [
  {
    id: 'hospital',
    label: 'Médecin / Hôpital',
    icon: Heart,
    color: 'text-success-400',
    badge: 'badge-green',
    description: 'Soins médicaux, respawn médical',
    match: s => s.services?.includes('Hôpital'),
  },
  {
    id: 'refinery',
    label: 'Raffinerie',
    icon: RefreshCw,
    color: 'text-warning-400',
    badge: 'badge-yellow',
    description: 'Traitement des minerais bruts',
    match: s => s.hasRefinery,
  },
  {
    id: 'weapons',
    label: "Commerce d'Armes",
    icon: Sword,
    color: 'text-danger-400',
    badge: 'badge-red',
    description: 'Armurerie, vente d\'armes FPS et navales',
    match: s => s.services?.includes('Armurerie') ||
                s.shops?.some(sh => sh.type?.toLowerCase().includes('arme') || sh.name?.toLowerCase().includes('blast') || sh.name?.toLowerCase().includes('mass')),
  },
  {
    id: 'repair',
    label: 'Réparation Vaisseau',
    icon: Wrench,
    color: 'text-slate-400',
    badge: 'badge-slate',
    description: 'Réparation de la coque et des composants',
    match: s => s.services?.includes('Réparation'),
  },
  {
    id: 'fuel',
    label: 'Ravitaillement (H₂/QT)',
    icon: Fuel,
    color: 'text-blue-400',
    badge: 'badge-blue',
    description: 'Carburant hydrogène et quantique',
    match: s => s.services?.includes('Ravitaillement'),
  },
  {
    id: 'illegal',
    label: 'Commerce Illégal',
    icon: AlertTriangle,
    color: 'text-danger-400',
    badge: 'badge-red',
    description: 'Marché noir, biens illégaux',
    match: s => s.illegalGoods || s.services?.includes('Commerce Illégal'),
  },
  {
    id: 'spawn',
    label: 'Point de Spawn',
    icon: Crosshair,
    color: 'text-cyan-400',
    badge: 'badge-cyan',
    description: 'Point de respawn vaisseau et personnage',
    match: s => s.hasSpawnPoint,
  },
  {
    id: 'missions',
    label: 'Missions',
    icon: Package,
    color: 'text-purple-400',
    badge: 'badge-purple',
    description: 'Bureau de missions, contrats',
    match: s => s.services?.includes('Missions'),
  },
];

// ─── Score d'utilité pour comparaison ─────────────────────────────────────────
const SECURITY_SCORE = { 'Haute': 4, 'Maximum': 4, 'Modérée': 2, 'Faible': 1, 'Aucune': 0 };
function utilityScore(station) {
  const secScore = SECURITY_SCORE[Object.keys(SECURITY_SCORE).find(k => station.security?.startsWith(k))] ?? 0;
  const serviceCount = station.services?.length ?? 0;
  const bonuses =
    (station.hasRefinery    ? 3 : 0) +
    (station.hasSpawnPoint  ? 2 : 0) +
    (station.illegalGoods   ? 1 : 0);
  return serviceCount * 2 + bonuses + secScore;
}

// ─── Station Card ─────────────────────────────────────────────────────────────

function StationCard({ station }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[station.type] || Building;
  const secKey = Object.keys(SECURITY_COLOR).find(k => station.security?.startsWith(k));

  return (
    <div className={clsx('card overflow-hidden transition-all', !station.legal && 'border-danger-500/15')}>
      <button
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-space-700/20 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', station.legal ? 'bg-space-700' : 'bg-danger-500/15')}>
          <Icon className={clsx('w-5 h-5', station.legal ? 'text-slate-400' : 'text-danger-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200 truncate">{station.name}</span>
            {station.hasSpawnPoint && <span className="badge badge-green text-xs">Spawn</span>}
            {station.hasRefinery && <span className="badge badge-yellow text-xs">Raffinerie</span>}
            {station.illegalGoods && <span className="badge badge-red text-xs">Marché Noir</span>}
            {!station.legal && <span className="badge badge-red text-xs">Zone Criminelle</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className={SYSTEM_COLORS[station.system]}>{station.system}</span>
            <span>•</span><span>{station.body}</span>
            <span>•</span><span>{station.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {station.security && (
            <span className={clsx('text-xs font-medium hidden sm:block', SECURITY_COLOR[secKey] || 'text-slate-400')}>
              {station.security}
            </span>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-space-400/15 p-4 bg-space-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {station.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-slate-400">{station.description}</p>
                {station.note && <p className="text-xs text-warning-400 mt-1 italic">{station.note}</p>}
              </div>
            )}
            {station.services && station.services.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" /> Services
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {station.services.map(s => (
                    <span key={s} className={clsx('badge text-xs', SERVICE_COLORS[s] || 'badge-slate')}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {station.shops?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3 text-cyan-400" /> Boutiques ({station.shops.length})
                </div>
                <div className="space-y-1">
                  {station.shops.map(shop => (
                    <div key={shop.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{shop.icon} {shop.name}</span>
                      <span className="text-slate-500">{shop.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {station.commodities?.buys?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Package className="w-3 h-3" /> Achète
                </div>
                <div className="flex flex-wrap gap-1">
                  {station.commodities.buys.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded bg-success-500/10 text-success-400">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {station.commodities?.sells?.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3" /> Vend
                </div>
                <div className="flex flex-wrap gap-1">
                  {station.commodities.sells.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {station.travelTime && Object.keys(station.travelTime).length > 0 && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Temps de trajet (min)
                </div>
                {Object.entries(station.travelTime).map(([from, mins]) => (
                  <div key={from} className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{from.replace('from_', '').replace(/_/g, ' ')}</span>
                    <span className="text-cyan-400 font-medium">{mins} min</span>
                  </div>
                ))}
              </div>
            )}
            {station.controller && (
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Contrôle
                </div>
                <div className="text-sm text-slate-300">{station.controller}</div>
                <div className={clsx('text-xs mt-1', station.legal ? 'text-success-400' : 'text-danger-400')}>
                  {station.legal ? '✓ Zone Légale' : '✗ Zone Criminelle'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Onglet 2 : Trouveur de Services ─────────────────────────────────────────

function ServiceFinder() {
  const [serviceId, setServiceId] = useState('');
  const [systemFilter, setSystemFilter] = useState('');

  const systems = [...new Set(STATIONS.map(s => s.system))];

  const selectedService = SERVICE_TYPES.find(s => s.id === serviceId);

  const results = useMemo(() => {
    if (!selectedService) return [];
    return STATIONS
      .filter(s => selectedService.match(s))
      .filter(s => !systemFilter || s.system === systemFilter)
      .sort((a, b) => {
        // Trier : légal d'abord, puis sécurité haute, puis par nom
        if (a.legal !== b.legal) return a.legal ? -1 : 1;
        const sa = SECURITY_SCORE[Object.keys(SECURITY_SCORE).find(k => a.security?.startsWith(k))] ?? 0;
        const sb = SECURITY_SCORE[Object.keys(SECURITY_SCORE).find(k => b.security?.startsWith(k))] ?? 0;
        return sb - sa;
      });
  }, [selectedService, systemFilter]);

  return (
    <div className="space-y-6">
      {/* Sélecteur de service */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          Je cherche…
        </h2>
        {/* Boutons services */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {SERVICE_TYPES.map(st => {
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                onClick={() => setServiceId(serviceId === st.id ? '' : st.id)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center',
                  serviceId === st.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    : 'bg-space-700/30 border-space-400/20 text-slate-400 hover:text-slate-200 hover:border-space-400/40',
                )}
              >
                <Icon className={clsx('w-5 h-5', serviceId === st.id ? 'text-cyan-400' : st.color)} />
                <span className="text-xs font-medium leading-tight">{st.label}</span>
              </button>
            );
          })}
        </div>
        {/* Filtre système */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-slate-500">Système :</span>
          {['', ...systems].map(sys => (
            <button
              key={sys || 'all'}
              onClick={() => setSystemFilter(sys)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm transition-all border',
                systemFilter === sys
                  ? sys ? SYSTEM_BG[sys] + ' ' + SYSTEM_COLORS[sys] : 'bg-space-600 text-slate-200 border-space-400/40'
                  : 'text-slate-500 hover:text-slate-300 border-transparent',
              )}
            >
              {sys || `Tous (${STATIONS.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Description du service sélectionné */}
      {selectedService && (
        <div className={clsx('card p-4 border', `border-space-400/30`)}>
          <div className="flex items-center gap-2 mb-1">
            <selectedService.icon className={clsx('w-4 h-4', selectedService.color)} />
            <span className="font-semibold text-slate-200">{selectedService.label}</span>
            <span className="badge badge-slate text-xs">{results.length} station{results.length > 1 ? 's' : ''}</span>
          </div>
          <p className="text-sm text-slate-500">{selectedService.description}</p>
        </div>
      )}

      {/* Résultats */}
      {serviceId && results.length === 0 && (
        <div className="card p-10 text-center">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune station ne propose ce service dans ce système</p>
        </div>
      )}

      {serviceId && results.length > 0 && (
        <div className="space-y-2">
          {results.map(station => {
            const secKey = Object.keys(SECURITY_COLOR).find(k => station.security?.startsWith(k));
            const Icon = TYPE_ICONS[station.type] || Building;
            return (
              <div
                key={station.id}
                className={clsx(
                  'card p-4 flex items-start gap-4 transition-all',
                  !station.legal && 'border-danger-500/15',
                  station.legal && station.security?.startsWith('Haute') && 'border-success-500/10',
                )}
              >
                <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', station.legal ? 'bg-space-700' : 'bg-danger-500/10')}>
                  <Icon className={clsx('w-4 h-4', station.legal ? 'text-slate-400' : 'text-danger-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{station.name}</span>
                    {station.hasSpawnPoint && <span className="badge badge-green text-xs">Spawn</span>}
                    {station.hasRefinery && <span className="badge badge-yellow text-xs">Raffinerie</span>}
                    {!station.legal && <span className="badge badge-red text-xs">Criminel</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className={SYSTEM_COLORS[station.system]}>{station.system}</span>
                    <span>•</span>
                    <span>{station.body}</span>
                    <span>•</span>
                    <span>{station.type}</span>
                  </div>
                  {/* Services disponibles */}
                  {station.services?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {station.services.map(sv => (
                        <span key={sv} className={clsx('text-xs px-1.5 py-0.5 rounded', SERVICE_COLORS[sv] ? 'badge ' + SERVICE_COLORS[sv] : 'badge badge-slate')}>{sv}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Sécurité */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {station.security && (
                    <span className={clsx('badge text-xs', SECURITY_BADGE[secKey] || 'badge-slate')}>
                      {station.security}
                    </span>
                  )}
                  <span className={clsx('text-xs', station.legal ? 'text-success-400' : 'text-danger-400')}>
                    {station.legal ? '✓ Légal' : '✗ Criminel'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!serviceId && (
        <div className="card p-10 text-center">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Sélectionnez un service pour trouver les stations correspondantes</p>
        </div>
      )}
    </div>
  );
}

// ─── Onglet 3 : Comparatif de Stations ────────────────────────────────────────

const COMPARE_FEATURES = [
  { key: 'system',        label: 'Système',    render: s => s.system },
  { key: 'body',          label: 'Corps orbital', render: s => s.body },
  { key: 'type',          label: 'Type',       render: s => s.type },
  { key: 'security',      label: 'Sécurité',   render: s => s.security || '—' },
  { key: 'legal',         label: 'Légalité',   render: s => s.legal ? '✓ Légal' : '✗ Criminel', colorFn: s => s.legal ? 'text-success-400' : 'text-danger-400' },
  { key: 'hasSpawnPoint', label: 'Spawn',      render: s => s.hasSpawnPoint ? '✓ Oui' : '✗ Non', colorFn: s => s.hasSpawnPoint ? 'text-success-400' : 'text-slate-500' },
  { key: 'hasRefinery',   label: 'Raffinerie', render: s => s.hasRefinery ? '✓ Oui' : '✗ Non', colorFn: s => s.hasRefinery ? 'text-warning-400' : 'text-slate-500' },
  { key: 'illegalGoods',  label: 'Marché Noir', render: s => s.illegalGoods ? '⚠ Oui' : '— Non', colorFn: s => s.illegalGoods ? 'text-danger-400' : 'text-slate-500' },
];

function StationComparator() {
  const [stationA, setStationA] = useState('');
  const [stationB, setStationB] = useState('');

  const sA = STATIONS.find(s => s.id === stationA);
  const sB = STATIONS.find(s => s.id === stationB);

  const scoreA = sA ? utilityScore(sA) : 0;
  const scoreB = sB ? utilityScore(sB) : 0;

  // Calcul des services en commun et exclusifs
  const servicesOnlyA = useMemo(() => {
    if (!sA || !sB) return [];
    return (sA.services || []).filter(sv => !(sB.services || []).includes(sv));
  }, [sA, sB]);
  const servicesOnlyB = useMemo(() => {
    if (!sA || !sB) return [];
    return (sB.services || []).filter(sv => !(sA.services || []).includes(sv));
  }, [sA, sB]);
  const servicesCommon = useMemo(() => {
    if (!sA || !sB) return [];
    return (sA.services || []).filter(sv => (sB.services || []).includes(sv));
  }, [sA, sB]);

  // Recommandations
  const recommendations = useMemo(() => {
    if (!sA || !sB) return [];
    const recs = [];
    if (sA.hasRefinery && !sB.hasRefinery) recs.push(`${sA.name} est meilleure pour le minage (raffinerie disponible).`);
    if (sB.hasRefinery && !sA.hasRefinery) recs.push(`${sB.name} est meilleure pour le minage (raffinerie disponible).`);
    if (sA.hasSpawnPoint && !sB.hasSpawnPoint) recs.push(`${sA.name} est meilleure comme base principale (point de spawn).`);
    if (sB.hasSpawnPoint && !sA.hasSpawnPoint) recs.push(`${sB.name} est meilleure comme base principale (point de spawn).`);
    if (sA.legal && !sB.legal) recs.push(`${sA.name} est plus sûre — zone légale, patrouilles UEE.`);
    if (sB.legal && !sA.legal) recs.push(`${sB.name} est plus sûre — zone légale, patrouilles UEE.`);
    if (sA.illegalGoods && !sB.illegalGoods) recs.push(`${sA.name} est meilleure pour les activités hors-la-loi (marché noir).`);
    if (sB.illegalGoods && !sA.illegalGoods) recs.push(`${sB.name} est meilleure pour les activités hors-la-loi (marché noir).`);
    if ((sA.services?.length ?? 0) > (sB.services?.length ?? 0)) recs.push(`${sA.name} offre plus de services (${sA.services?.length} vs ${sB.services?.length}).`);
    if ((sB.services?.length ?? 0) > (sA.services?.length ?? 0)) recs.push(`${sB.name} offre plus de services (${sB.services?.length} vs ${sA.services?.length}).`);
    if (recs.length === 0) recs.push('Ces deux stations ont des profils très similaires.');
    return recs;
  }, [sA, sB]);

  return (
    <div className="space-y-6">
      {/* Sélecteurs */}
      <div className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Comparer deux stations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Station A</label>
            <select value={stationA} onChange={e => setStationA(e.target.value)} className="select w-full">
              <option value="">— Sélectionner —</option>
              {[...new Set(STATIONS.map(s => s.system))].map(sys => (
                <optgroup key={sys} label={`Système ${sys}`}>
                  {STATIONS.filter(s => s.system === sys && s.id !== stationB).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Station B</label>
            <select value={stationB} onChange={e => setStationB(e.target.value)} className="select w-full">
              <option value="">— Sélectionner —</option>
              {[...new Set(STATIONS.map(s => s.system))].map(sys => (
                <optgroup key={sys} label={`Système ${sys}`}>
                  {STATIONS.filter(s => s.system === sys && s.id !== stationA).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparaison */}
      {sA && sB ? (
        <div className="space-y-4">
          {/* En-têtes stations */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1" />
            {[sA, sB].map((station, i) => {
              const secKey = Object.keys(SECURITY_COLOR).find(k => station.security?.startsWith(k));
              const score = i === 0 ? scoreA : scoreB;
              const isWinner = i === 0 ? scoreA > scoreB : scoreB > scoreA;
              return (
                <div key={station.id} className={clsx('card p-4 text-center', isWinner && 'border-cyan-500/30')}>
                  {isWinner && (
                    <div className="text-xs text-cyan-400 font-medium mb-1.5 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3" /> Score supérieur
                    </div>
                  )}
                  <div className="font-bold text-slate-200 text-sm leading-tight">{station.name}</div>
                  <div className={clsx('text-xs mt-1', SYSTEM_COLORS[station.system])}>{station.system}</div>
                  <div className="mt-2">
                    <span className={clsx(
                      'text-2xl font-bold font-display',
                      isWinner ? 'text-cyan-400' : 'text-slate-400',
                    )}>
                      {score}
                    </span>
                    <div className="text-xs text-slate-600">pts utilité</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tableau comparatif */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2 bg-space-700/30 border-b border-space-400/15 text-xs text-slate-500 uppercase tracking-wide font-medium">
              Comparaison détaillée
            </div>
            <div className="divide-y divide-space-400/10">
              {COMPARE_FEATURES.map(feature => (
                <div key={feature.key} className="grid grid-cols-3 gap-0 divide-x divide-space-400/10">
                  <div className="px-4 py-2.5 flex items-center">
                    <span className="text-xs text-slate-500 font-medium">{feature.label}</span>
                  </div>
                  {[sA, sB].map((station, i) => {
                    const value = feature.render(station);
                    const colorClass = feature.colorFn ? feature.colorFn(station) : 'text-slate-300';
                    return (
                      <div key={i} className="px-4 py-2.5 flex items-center">
                        <span className={clsx('text-xs', colorClass)}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Services */}
              <div className="grid grid-cols-3 gap-0 divide-x divide-space-400/10 items-start">
                <div className="px-4 py-2.5">
                  <span className="text-xs text-slate-500 font-medium">Services</span>
                </div>
                {[sA, sB].map((station, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {(station.services || []).map(sv => (
                        <span key={sv} className={clsx('text-xs px-1.5 py-0.5 rounded', SERVICE_COLORS[sv] ? 'badge ' + SERVICE_COLORS[sv] : 'badge badge-slate')}>{sv}</span>
                      ))}
                      {(!station.services || station.services.length === 0) && (
                        <span className="text-xs text-slate-600">Aucun</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Score */}
              <div className="grid grid-cols-3 gap-0 divide-x divide-space-400/10 bg-space-700/10">
                <div className="px-4 py-3 flex items-center">
                  <span className="text-xs text-slate-400 font-semibold">Score utilité</span>
                </div>
                {[sA, sB].map((station, i) => {
                  const score = i === 0 ? scoreA : scoreB;
                  const isWinner = i === 0 ? scoreA >= scoreB : scoreB >= scoreA;
                  return (
                    <div key={i} className="px-4 py-3 flex items-center gap-2">
                      <span className={clsx('text-lg font-bold font-display', isWinner ? 'text-cyan-400' : 'text-slate-500')}>
                        {score}
                      </span>
                      {isWinner && scoreA !== scoreB && (
                        <span className="badge badge-cyan text-xs">Meilleure</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Services exclusifs */}
          {(servicesOnlyA.length > 0 || servicesOnlyB.length > 0 || servicesCommon.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {servicesOnlyA.length > 0 && (
                <div className="card p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Exclusifs à {sA.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {servicesOnlyA.map(sv => (
                      <span key={sv} className={clsx('badge text-xs', SERVICE_COLORS[sv] || 'badge-slate')}>{sv}</span>
                    ))}
                  </div>
                </div>
              )}
              {servicesCommon.length > 0 && (
                <div className="card p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">En commun</div>
                  <div className="flex flex-wrap gap-1">
                    {servicesCommon.map(sv => (
                      <span key={sv} className="badge badge-slate text-xs">{sv}</span>
                    ))}
                  </div>
                </div>
              )}
              {servicesOnlyB.length > 0 && (
                <div className="card p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Exclusifs à {sB.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {servicesOnlyB.map(sv => (
                      <span key={sv} className={clsx('badge text-xs', SERVICE_COLORS[sv] || 'badge-slate')}>{sv}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommandations */}
          <div className="card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-warning-400" /> Recommandations
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Sélectionnez deux stations pour les comparer</p>
          <p className="text-xs text-slate-600 mt-1">Le score d'utilité est calculé selon les services, la sécurité et les fonctionnalités spéciales.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'directory',  label: 'Annuaire',             icon: Building },
  { id: 'finder',     label: 'Trouveur de Services', icon: Search },
  { id: 'comparator', label: 'Comparatif',           icon: BarChart3 },
];

export default function StationsMap() {
  const [activeTab, setActiveTab] = useState('directory');
  const [filterSystem, setFilterSystem] = useState('');
  const [filterLegal, setFilterLegal] = useState('');
  const [filterSpawn, setFilterSpawn] = useState(false);
  const [filterRefinery, setFilterRefinery] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  const filtered = useMemo(() => STATIONS.filter(s => {
    if (filterSystem && s.system !== filterSystem) return false;
    if (filterLegal === 'legal' && !s.legal) return false;
    if (filterLegal === 'illegal' && s.legal) return false;
    if (filterSpawn && !s.hasSpawnPoint) return false;
    if (filterRefinery && !s.hasRefinery) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.body?.toLowerCase().includes(q) && !s.type?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filterSystem, filterLegal, filterSpawn, filterRefinery, search]);

  const systems = [...new Set(STATIONS.map(s => s.system))];
  const grouped = useMemo(() => systems.reduce((acc, sys) => {
    acc[sys] = filtered.filter(s => s.system === sys);
    return acc;
  }, {}), [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Stations & Villes</h1>
        <p className="page-subtitle">
          {activeTab === 'directory'
            ? `${filtered.length} / ${STATIONS.length} emplacements — Stanton & Pyro`
            : activeTab === 'finder'
            ? 'Trouvez les stations selon vos besoins'
            : 'Comparez deux stations côte à côte'
          }
        </p>
      </div>

      {/* Stats (directory seulement) */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: STATIONS.length, color: 'text-cyan-400' },
            { label: 'Points de Spawn', value: STATIONS.filter(s => s.hasSpawnPoint).length, color: 'text-success-400' },
            { label: 'Raffineries', value: STATIONS.filter(s => s.hasRefinery).length, color: 'text-warning-400' },
            { label: 'Zones Criminelles', value: STATIONS.filter(s => !s.legal).length, color: 'text-danger-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-3 text-center">
              <div className={`text-2xl font-bold font-display ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 border-b border-space-400/20 pb-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300',
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu selon onglet */}
      {activeTab === 'directory' && (
        <>
          <div className="card p-4 flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-8 w-44" />
            </div>
            <select value={filterSystem} onChange={e => setFilterSystem(e.target.value)} className="select w-auto">
              <option value="">Tous les systèmes</option>
              {systems.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterLegal} onChange={e => setFilterLegal(e.target.value)} className="select w-auto">
              <option value="">Légalité</option>
              <option value="legal">Légal seulement</option>
              <option value="illegal">Illégal seulement</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
              <input type="checkbox" checked={filterSpawn} onChange={e => setFilterSpawn(e.target.checked)} className="accent-cyan-500" />
              Spawn uniquement
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
              <input type="checkbox" checked={filterRefinery} onChange={e => setFilterRefinery(e.target.checked)} className="accent-cyan-500" />
              Raffinerie
            </label>
            <div className="ml-auto flex gap-1">
              {[['cards', 'Cartes'], ['grouped', 'Par Système']].map(([m, l]) => (
                <button key={m} onClick={() => setViewMode(m)} className={clsx('px-3 py-1.5 rounded-lg text-xs transition-all', viewMode === m ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 bg-space-700/50')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterSystem('')} className={clsx('px-3 py-1.5 rounded-lg text-sm transition-all', !filterSystem ? 'bg-space-600 text-slate-200' : 'text-slate-500 hover:text-slate-300')}>
              Tous ({STATIONS.length})
            </button>
            {systems.map(sys => (
              <button key={sys} onClick={() => setFilterSystem(filterSystem === sys ? '' : sys)}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border', filterSystem === sys ? SYSTEM_BG[sys] + ' ' + SYSTEM_COLORS[sys] : 'text-slate-500 hover:text-slate-300 border-transparent')}>
                <Globe className="w-3.5 h-3.5" />
                {sys} ({STATIONS.filter(s => s.system === sys).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucune station ne correspond aux filtres</p>
            </div>
          ) : viewMode === 'grouped' ? (
            <div className="space-y-6">
              {Object.entries(grouped).map(([sys, stations]) => stations.length > 0 && (
                <div key={sys}>
                  <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg mb-3 border', SYSTEM_BG[sys])}>
                    <Globe className={clsx('w-4 h-4', SYSTEM_COLORS[sys])} />
                    <span className={clsx('font-semibold', SYSTEM_COLORS[sys])}>{sys}</span>
                    <span className="text-slate-500 text-sm">— {stations.length} emplacement{stations.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">{stations.map(s => <StationCard key={s.id} station={s} />)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">{filtered.map(s => <StationCard key={s.id} station={s} />)}</div>
          )}
        </>
      )}

      {activeTab === 'finder' && <ServiceFinder />}
      {activeTab === 'comparator' && <StationComparator />}
    </div>
  );
}
