import React, { useState, useMemo, useCallback } from 'react';
import {
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart2,
  ArrowUpDown,
  Rocket,
  Star,
  TrendingDown,
} from 'lucide-react';
import clsx from 'clsx';
import { SHIPS } from '../../datasets/ships.js';
import {
  INSURANCE_TYPES,
  CLAIM_TIMES,
  DEFAULT_CLAIM_TIME_BY_SIZE,
  EXPEDITE_MULTIPLIER,
  EXPEDITE_COST_PER_MINUTE,
  INSURANCE_EVENTS,
  INSURANCE_GUIDE_SECTIONS,
  POPULAR_SHIPS_IDS,
  TOP20_SHIPS_IDS,
  calcClaimTime,
  calcExpediteCost,
  calcInsuranceCost,
  getInsuranceAdvice,
  getClaimTier,
} from '../../datasets/insuranceData.js';

// ============================================================
// SHIP AVATAR
// ============================================================
function ShipAvatar({ ship, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';

  if (ship?.imageUrl && !imgError) {
    return (
      <img
        src={ship.imageUrl}
        alt={ship.name}
        className={clsx(sizeClass, 'object-cover rounded-lg')}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={clsx(sizeClass, 'rounded-lg bg-space-700 flex items-center justify-center')}>
      <Rocket className={clsx('text-cyan-400', size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-9 h-9' : 'w-6 h-6')} />
    </div>
  );
}

// ============================================================
// BARRE DE PROGRESSION DU TEMPS
// ============================================================
function ClaimTimeBar({ minutes, maxMinutes = 90 }) {
  const percent = Math.min(100, (minutes / maxMinutes) * 100);
  const tier = getClaimTier(minutes);

  const barColor =
    minutes < 10 ? 'bg-emerald-500' :
    minutes < 15 ? 'bg-green-500' :
    minutes < 25 ? 'bg-yellow-500' :
    minutes < 40 ? 'bg-orange-500' :
    'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className={clsx('text-xs font-medium', tier.color)}>{tier.label}</span>
        <span className="text-xs text-space-400">{minutes} min</span>
      </div>
      <div className="w-full h-2 bg-space-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// CARD VAISSEAU POPULAIRE
// ============================================================
function PopularShipCard({ ship, selected, onClick }) {
  const claimTime = CLAIM_TIMES[ship.id] ?? DEFAULT_CLAIM_TIME_BY_SIZE[ship.size] ?? 15;
  const tier = getClaimTier(claimTime);

  return (
    <button
      onClick={() => onClick(ship)}
      className={clsx(
        'card text-left transition-all duration-200 hover:border-cyan-500/60 cursor-pointer p-3',
        selected ? 'border-cyan-500 ring-1 ring-cyan-500/40 bg-cyan-500/5' : 'border-space-600'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <ShipAvatar ship={ship} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-space-100 truncate">{ship.name}</p>
          <p className="text-xs text-space-400 truncate">{ship.manufacturer}</p>
        </div>
        {selected && <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
      </div>
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs font-bold', tier.color)}>{claimTime} min</span>
        <span className={clsx('badge text-xs', tier.tier === 'ultra-rapide' || tier.tier === 'rapide' ? 'badge-green' : tier.tier === 'moyen' ? 'badge-yellow' : 'badge-red')}>
          {tier.label}
        </span>
      </div>
    </button>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function InsuranceCalculator() {
  const [selectedShip, setSelectedShip] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expedite, setExpedite] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState('standard');
  const [lossesPerWeek, setLossesPerWeek] = useState(1);
  const [alwaysExpedite, setAlwaysExpedite] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [sortColumn, setSortColumn] = useState('claimTime');
  const [sortDir, setSortDir] = useState('asc');

  // Vaisseaux populaires
  const popularShips = useMemo(
    () => POPULAR_SHIPS_IDS.map(id => SHIPS.find(s => s.id === id)).filter(Boolean),
    []
  );

  // Top 20 pour le tableau
  const top20Ships = useMemo(
    () => TOP20_SHIPS_IDS.map(id => SHIPS.find(s => s.id === id)).filter(Boolean),
    []
  );

  // Filtrage de la recherche
  const filteredShips = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SHIPS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.manufacturer.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  // Données calculées pour le vaisseau sélectionné
  const claimData = useMemo(() => {
    if (!selectedShip) return null;
    const base = calcClaimTime(selectedShip.id, false, selectedInsurance, selectedShip.size);
    const withExpedite = calcClaimTime(selectedShip.id, true, selectedInsurance, selectedShip.size);
    const expediteCost = calcExpediteCost(selectedShip.id, selectedInsurance, selectedShip.size);
    const advice = getInsuranceAdvice(selectedShip);
    return { base, withExpedite, expediteCost, advice };
  }, [selectedShip, selectedInsurance]);

  // Simulateur de pertes
  const lossSimulation = useMemo(() => {
    if (!selectedShip || !claimData) return null;
    const claimTime = alwaysExpedite ? claimData.withExpedite : claimData.base;
    const totalTime = claimTime * lossesPerWeek;
    const expediteCostTotal = alwaysExpedite ? claimData.expediteCost * lossesPerWeek : 0;
    const insuranceMonthlyCost = calcInsuranceCost(selectedShip.price ?? 0, selectedInsurance, 1);
    const weeklyInsuranceCost = Math.round(insuranceMonthlyCost / 4);
    const totalWeeklyCost = expediteCostTotal + weeklyInsuranceCost;
    return { claimTime, totalTime, expediteCostTotal, weeklyInsuranceCost, totalWeeklyCost };
  }, [selectedShip, claimData, lossesPerWeek, alwaysExpedite, selectedInsurance]);

  // Tableau tri
  const sortedTop20 = useMemo(() => {
    const rows = top20Ships.map(ship => {
      const base = calcClaimTime(ship.id, false, 'standard', ship.size);
      const exp = calcClaimTime(ship.id, true, 'standard', ship.size);
      const expCost = calcExpediteCost(ship.id, 'standard', ship.size);
      return { ship, base, exp, expCost, tier: getClaimTier(base) };
    });

    return [...rows].sort((a, b) => {
      let va, vb;
      if (sortColumn === 'name') { va = a.ship.name; vb = b.ship.name; }
      else if (sortColumn === 'claimTime') { va = a.base; vb = b.base; }
      else if (sortColumn === 'expedite') { va = a.exp; vb = b.exp; }
      else if (sortColumn === 'cost') { va = a.expCost; vb = b.expCost; }
      else { va = a.base; vb = b.base; }

      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [top20Ships, sortColumn, sortDir]);

  const handleSort = useCallback((col) => {
    if (sortColumn === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(col); setSortDir('asc'); }
  }, [sortColumn]);

  const toggleSection = useCallback((id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSelectShip = useCallback((ship) => {
    setSelectedShip(ship);
    setSearchQuery('');
  }, []);

  // Affichage du temps courant selon le toggle expédition
  const displayTime = claimData ? (expedite ? claimData.withExpedite : claimData.base) : null;

  const formatAuec = (n) => n >= 1000000
    ? `${(n / 1000000).toFixed(1)}M aUEC`
    : n >= 1000 ? `${(n / 1000).toFixed(0)}K aUEC`
    : `${n} aUEC`;

  const SortIcon = ({ col }) => (
    <ArrowUpDown className={clsx('inline w-3 h-3 ml-1 transition-colors', sortColumn === col ? 'text-cyan-400' : 'text-space-500')} />
  );

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="page-title">Calculateur d'Assurance & Réclamation</h1>
          <p className="text-space-400 mt-1">
            Estimez les temps de réclamation, coûts d'expédition et choisissez la meilleure assurance pour votre vaisseau.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1 — SÉLECTEUR DE VAISSEAU */}
      {/* ============================================================ */}
      <section className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" />
          Sélectionner un vaisseau
        </h2>

        {/* Recherche */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un vaisseau par nom, fabricant ou rôle..."
            className="input w-full pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-space-400 hover:text-space-200"
            >
              ×
            </button>
          )}
          {filteredShips.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-space-800 border border-space-600 rounded-lg shadow-xl overflow-hidden">
              {filteredShips.map(ship => (
                <button
                  key={ship.id}
                  onClick={() => handleSelectShip(ship)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-space-700 transition-colors"
                >
                  <ShipAvatar ship={ship} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-space-100">{ship.name}</p>
                    <p className="text-xs text-space-400">{ship.manufacturer} — {ship.role}</p>
                  </div>
                  <span className="ml-auto text-xs text-space-400">{ship.size}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grille vaisseaux populaires */}
        <div>
          <p className="text-xs text-space-400 mb-3 flex items-center gap-1.5">
            <Star className="w-3 h-3 text-gold-400" />
            Vaisseaux populaires — cliquez pour sélectionner
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {popularShips.map(ship => (
              <PopularShipCard
                key={ship.id}
                ship={ship}
                selected={selectedShip?.id === ship.id}
                onClick={handleSelectShip}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — TEMPS DE RÉCLAMATION */}
      {/* ============================================================ */}
      {selectedShip && claimData ? (
        <section className="card border-cyan-500/20">
          <div className="flex items-center gap-3 mb-6">
            <ShipAvatar ship={selectedShip} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-space-100">{selectedShip.name}</h2>
              <p className="text-space-400 text-sm">{selectedShip.manufacturer} — {selectedShip.role} — {selectedShip.size}</p>
              <p className="text-xs text-space-500 mt-0.5">
                Valeur : {selectedShip.price ? formatAuec(selectedShip.price) : 'N/A'}
                {selectedShip.pledgePrice ? ` · Pledge : $${selectedShip.pledgePrice}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Affichage principal du temps */}
            <div className="bg-space-800/60 rounded-xl p-5 border border-space-600">
              <h3 className="section-title mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Temps de réclamation
              </h3>

              <div className="text-center mb-4">
                <div className={clsx(
                  'text-6xl font-bold tabular-nums transition-all duration-300',
                  displayTime < 10 ? 'text-emerald-400' :
                  displayTime < 15 ? 'text-green-400' :
                  displayTime < 25 ? 'text-yellow-400' :
                  displayTime < 40 ? 'text-orange-400' : 'text-red-400'
                )}>
                  {displayTime}
                </div>
                <div className="text-space-400 text-sm mt-1">minutes</div>
                {expedite && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-cyan-400">
                    <Zap className="w-3 h-3" />
                    Expédition activée — coût : {formatAuec(claimData.expediteCost)}
                  </div>
                )}
              </div>

              <ClaimTimeBar minutes={displayTime} />

              {/* Comparaison avant/après */}
              {expedite && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-space-700/50 rounded-lg p-2">
                    <p className="text-xs text-space-400">Sans expédition</p>
                    <p className="text-lg font-bold text-space-300">{claimData.base} min</p>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2">
                    <p className="text-xs text-cyan-400">Avec expédition</p>
                    <p className="text-lg font-bold text-cyan-300">{claimData.withExpedite} min</p>
                  </div>
                </div>
              )}

              {/* Toggle expédition */}
              <button
                onClick={() => setExpedite(e => !e)}
                className={clsx(
                  'mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 font-medium text-sm transition-all duration-200',
                  expedite
                    ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-space-700 border border-space-600 text-space-300 hover:border-cyan-500/40'
                )}
              >
                <Zap className="w-4 h-4" />
                {expedite ? 'Désactiver l\'expédition' : 'Activer l\'expédition (×0.5)'}
              </button>
            </div>

            {/* Conseil assurance */}
            <div className="bg-space-800/60 rounded-xl p-5 border border-space-600 space-y-3">
              <h3 className="section-title flex items-center gap-2">
                <Info className="w-4 h-4 text-gold-400" />
                Analyse & Conseils
              </h3>
              {claimData.advice.advice.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-space-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
              {claimData.advice.warnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-space-300">
                  <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-space-600">
                <p className="text-xs text-space-400 mb-1">Assurance recommandée :</p>
                <p className="text-sm font-semibold text-cyan-300">
                  {INSURANCE_TYPES.find(t => t.id === claimData.advice.recommendedType)?.nameFr ?? 'Standard'}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="card border-dashed border-space-600 text-center py-12">
          <Shield className="w-12 h-12 text-space-600 mx-auto mb-3" />
          <p className="text-space-400">Sélectionnez un vaisseau ci-dessus pour calculer son temps de réclamation</p>
        </section>
      )}

      {/* ============================================================ */}
      {/* SECTION 3 — TYPES D'ASSURANCE */}
      {/* ============================================================ */}
      <section>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Types d'assurance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INSURANCE_TYPES.map(type => {
            const isSelected = selectedInsurance === type.id;
            const isRecommended = selectedShip && claimData?.advice.recommendedType === type.id;
            const monthlyCost = selectedShip
              ? calcInsuranceCost(selectedShip.price ?? 0, type.id, 1)
              : null;

            return (
              <div
                key={type.id}
                className={clsx(
                  'card relative transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'border-cyan-500 ring-1 ring-cyan-500/30 bg-cyan-500/5'
                    : 'border-space-600 hover:border-space-500'
                )}
                onClick={() => setSelectedInsurance(type.id)}
              >
                {isRecommended && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="badge badge-gold text-xs px-2 py-0.5 whitespace-nowrap">
                      Recommandé
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className={clsx('w-5 h-5', type.id === 'standard' ? 'text-cyan-400' : type.id === 'enhanced' ? 'text-gold-400' : 'text-purple-400')} />
                    <h3 className="font-semibold text-space-100 text-sm">{type.nameFr}</h3>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-space-400">Coût :</span>
                    <span className="text-space-200 font-medium">
                      {monthlyCost !== null && monthlyCost > 0 ? formatAuec(monthlyCost) + '/mois' : type.cost}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-space-400">Couverture :</span>
                    <span className="text-space-200">{type.coverage}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-space-400">Durée :</span>
                    <span className="text-space-200">{type.renewLabel}</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {type.pros.slice(0, 3).map((pro, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-green-400">
                      <span className="mt-0.5">+</span>
                      <span>{pro}</span>
                    </div>
                  ))}
                  {type.cons.slice(0, 2).map((con, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-space-400">
                      <span className="mt-0.5">−</span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={clsx(
                    'w-full py-2 rounded-lg text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-space-700 text-space-300 border border-space-600 hover:border-space-500'
                  )}
                >
                  {isSelected ? 'Sélectionné' : 'Choisir'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — SIMULATEUR DE PERTES */}
      {/* ============================================================ */}
      {selectedShip && lossSimulation && (
        <section className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            Simulateur de pertes — {selectedShip.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-space-300 mb-2 block">Destructions par semaine : <span className="text-cyan-400 font-bold">{lossesPerWeek}</span></label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={lossesPerWeek}
                  onChange={e => setLossesPerWeek(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-space-500 mt-1">
                  <span>0 (jamais)</span>
                  <span>5 (régulier)</span>
                  <span>10 (combat intensif)</span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setAlwaysExpedite(v => !v)}
                  className={clsx(
                    'w-10 h-5 rounded-full transition-colors relative flex-shrink-0',
                    alwaysExpedite ? 'bg-cyan-500' : 'bg-space-600'
                  )}
                >
                  <span className={clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform', alwaysExpedite ? 'translate-x-5' : 'translate-x-0.5')} />
                </div>
                <span className="text-sm text-space-300">Expédier à chaque réclamation</span>
              </label>

              <div className="bg-space-800 rounded-lg p-3 text-xs text-space-400 border border-space-600">
                <p className="font-medium text-space-300 mb-1">Configuration actuelle :</p>
                <p>• Assurance : {INSURANCE_TYPES.find(t => t.id === selectedInsurance)?.nameFr}</p>
                <p>• Temps par réclamation : {lossSimulation.claimTime} min{alwaysExpedite ? ' (avec expédition)' : ''}</p>
              </div>
            </div>

            {/* Résultats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-space-800 rounded-xl p-4 border border-space-600 text-center">
                <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-space-100">{lossSimulation.totalTime}</p>
                <p className="text-xs text-space-400 mt-1">min/semaine en claims</p>
              </div>

              <div className="bg-space-800 rounded-xl p-4 border border-space-600 text-center">
                <Zap className="w-6 h-6 text-gold-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-space-100">{formatAuec(lossSimulation.expediteCostTotal)}</p>
                <p className="text-xs text-space-400 mt-1">coût expédition/semaine</p>
              </div>

              <div className="bg-space-800 rounded-xl p-4 border border-space-600 text-center">
                <Shield className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-space-100">{formatAuec(lossSimulation.weeklyInsuranceCost)}</p>
                <p className="text-xs text-space-400 mt-1">assurance/semaine</p>
              </div>

              <div className={clsx(
                'rounded-xl p-4 border text-center',
                lossSimulation.totalWeeklyCost > 1000000 ? 'bg-red-500/10 border-red-500/30' :
                lossSimulation.totalWeeklyCost > 200000 ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-green-500/10 border-green-500/30'
              )}>
                <BarChart2 className={clsx('w-6 h-6 mx-auto mb-1',
                  lossSimulation.totalWeeklyCost > 1000000 ? 'text-red-400' :
                  lossSimulation.totalWeeklyCost > 200000 ? 'text-orange-400' : 'text-green-400'
                )} />
                <p className={clsx('text-lg font-bold',
                  lossSimulation.totalWeeklyCost > 1000000 ? 'text-red-300' :
                  lossSimulation.totalWeeklyCost > 200000 ? 'text-orange-300' : 'text-green-300'
                )}>{formatAuec(lossSimulation.totalWeeklyCost)}</p>
                <p className="text-xs text-space-400 mt-1">coût total/semaine</p>
              </div>

              {lossesPerWeek > 0 && (
                <div className="col-span-2 bg-space-700/50 rounded-lg p-3 text-xs text-space-300">
                  {lossSimulation.totalTime > 60
                    ? `⚠ Plus d'une heure de réclamations par semaine. Envisagez de réduire la prise de risque ou d'utiliser un vaisseau moins cher.`
                    : lossSimulation.totalWeeklyCost > 500000
                    ? `💡 Coût hebdomadaire élevé. La LTI pourrait s'amortir en ${Math.round(calcInsuranceCost(selectedShip.price, 'lifetime') / lossSimulation.totalWeeklyCost)} semaines.`
                    : `✓ Profil de risque raisonnable pour votre activité.`}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* SECTION 5 — GUIDE PRATIQUE (ACCORDION) */}
      {/* ============================================================ */}
      <section>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          Guide pratique d'assurance
        </h2>
        <div className="space-y-2">
          {INSURANCE_GUIDE_SECTIONS.map(section => {
            const isOpen = openSections[section.id];
            return (
              <div key={section.id} className="card overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between py-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Info className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="font-medium text-space-100">{section.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-space-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-space-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-space-700 space-y-2">
                    {section.content.map(item => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-cyan-400">{item.step}</span>
                        </div>
                        <p className="text-sm text-space-300">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — TABLEAU COMPARATIF */}
      {/* ============================================================ */}
      <section>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cyan-400" />
          Tableau comparatif — Top 20 vaisseaux
        </h2>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-700 bg-space-800/80">
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('name')} className="text-xs font-semibold text-space-400 hover:text-space-200 uppercase tracking-wide">
                      Vaisseau <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort('claimTime')} className="text-xs font-semibold text-space-400 hover:text-space-200 uppercase tracking-wide">
                      Temps claim <SortIcon col="claimTime" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 hidden sm:table-cell">
                    <button onClick={() => handleSort('expedite')} className="text-xs font-semibold text-space-400 hover:text-space-200 uppercase tracking-wide">
                      Avec expédition <SortIcon col="expedite" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 hidden md:table-cell">
                    <button onClick={() => handleSort('cost')} className="text-xs font-semibold text-space-400 hover:text-space-200 uppercase tracking-wide">
                      Coût expédition <SortIcon col="cost" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <span className="text-xs font-semibold text-space-400 uppercase tracking-wide">Tier</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTop20.map(({ ship, base, exp, expCost, tier }, idx) => {
                  const isHighlighted = selectedShip?.id === ship.id;
                  return (
                    <tr
                      key={ship.id}
                      className={clsx(
                        'border-b border-space-700/50 transition-colors cursor-pointer',
                        isHighlighted
                          ? 'bg-cyan-500/10 hover:bg-cyan-500/15'
                          : idx % 2 === 0 ? 'bg-space-800/20 hover:bg-space-700/30' : 'hover:bg-space-700/30'
                      )}
                      onClick={() => handleSelectShip(ship)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ShipAvatar ship={ship} size="sm" />
                          <div>
                            <p className={clsx('font-medium', isHighlighted ? 'text-cyan-300' : 'text-space-200')}>{ship.name}</p>
                            <p className="text-xs text-space-500">{ship.manufacturer}</p>
                          </div>
                          {isHighlighted && <span className="badge badge-cyan text-xs ml-1">Sélectionné</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={clsx('font-bold tabular-nums', tier.color)}>{base} min</span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-space-300 tabular-nums">{exp} min</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-space-400 text-xs">{formatAuec(expCost)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={clsx(
                          'badge text-xs',
                          tier.tier === 'ultra-rapide' ? 'badge-green' :
                          tier.tier === 'rapide' ? 'badge-green' :
                          tier.tier === 'moyen' ? 'badge-yellow' :
                          tier.tier === 'lent' ? 'badge-orange' :
                          'badge-red'
                        )}>
                          {tier.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-space-800/40 border-t border-space-700 text-xs text-space-500">
            Cliquez sur une ligne pour sélectionner le vaisseau. Temps calculés avec assurance Standard sans expédition.
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SCÉNARIOS D'ÉVÉNEMENTS */}
      {/* ============================================================ */}
      <section>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Scénarios de sinistre courants
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INSURANCE_EVENTS.filter(e => e.id !== 'insurance_fraud').map(event => (
            <div key={event.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-space-200 text-sm">{event.title}</h3>
                <span className={clsx(
                  'badge text-xs flex-shrink-0 ml-2',
                  event.color === 'green' ? 'badge-green' :
                  event.color === 'yellow' ? 'badge-yellow' :
                  event.color === 'orange' ? 'badge-orange' :
                  event.color === 'red' ? 'badge-red' : 'badge-blue'
                )}>
                  {event.difficulty}
                </span>
              </div>
              <p className="text-xs text-space-400 mb-3">{event.description}</p>
              <div className="space-y-1.5">
                {event.steps.slice(0, 3).map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-space-400">
                    <span className="text-cyan-500 flex-shrink-0 font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
                {event.steps.length > 3 && (
                  <p className="text-xs text-space-500 pl-4">+{event.steps.length - 3} étapes...</p>
                )}
              </div>
              {event.tips && (
                <div className="mt-3 pt-3 border-t border-space-700">
                  <p className="text-xs text-gold-400 italic">{event.tips}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
