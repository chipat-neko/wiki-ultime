/**
 * Calculations - Moteurs de calcul pour Star Citizen
 */

// ============================================================
// CALCULS DE COMMERCE
// ============================================================

/**
 * Calculer le profit d'un trajet commercial
 * @param {number} buyPrice - Prix d'achat par SCU
 * @param {number} sellPrice - Prix de vente par SCU
 * @param {number} quantity - Quantité en SCU
 * @param {number} fees - Frais divers (atterrissage, etc.)
 * @returns {Object} Métriques de profit
 */
export function calcTradeProfit(buyPrice, sellPrice, quantity, fees = 0) {
  const totalCost = buyPrice * quantity;
  const totalRevenue = sellPrice * quantity;
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - fees;
  const margin = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  const profitPerScu = quantity > 0 ? netProfit / quantity : 0;

  return {
    totalCost,
    totalRevenue,
    grossProfit,
    netProfit,
    margin,
    profitPerScu,
    roi: totalCost > 0 ? (netProfit / totalCost) * 100 : 0,
  };
}

/**
 * Calculer le temps de récupération d'un investissement
 * @param {number} investment - Investissement initial
 * @param {number} profitPerRun - Profit par aller-retour
 * @param {number} minutesPerRun - Temps par aller-retour en minutes
 * @returns {Object}
 */
export function calcBreakEven(investment, profitPerRun, minutesPerRun) {
  if (profitPerRun <= 0) return { runs: Infinity, hours: Infinity };
  const runs = Math.ceil(investment / profitPerRun);
  const totalMinutes = runs * minutesPerRun;
  return {
    runs,
    hours: totalMinutes / 60,
    minutes: totalMinutes,
  };
}

/**
 * Optimiser la cargaison pour maximiser le profit
 * @param {Array} commodities - [{id, name, buyPrice, sellPrice, available}]
 * @param {number} maxScu - Capacité max en SCU
 * @param {number} budget - Budget disponible en aUEC
 * @returns {Array} Cargaison optimale
 */
export function optimizeCargo(commodities, maxScu, budget = Infinity) {
  // Trier par profit/SCU décroissant
  const profitable = commodities
    .filter(c => c.sellPrice > c.buyPrice)
    .map(c => ({
      ...c,
      profitPerScu: c.sellPrice - c.buyPrice,
      maxQuantity: Math.min(
        c.available || maxScu,
        budget < Infinity ? Math.floor(budget / c.buyPrice) : maxScu
      ),
    }))
    .sort((a, b) => b.profitPerScu - a.profitPerScu);

  const result = [];
  let remainingScu = maxScu;
  let remainingBudget = budget;

  for (const commodity of profitable) {
    if (remainingScu <= 0 || remainingBudget <= 0) break;

    const maxAffordable = remainingBudget < Infinity
      ? Math.floor(remainingBudget / commodity.buyPrice)
      : commodity.maxQuantity;

    const quantity = Math.min(
      remainingScu,
      commodity.maxQuantity,
      maxAffordable
    );

    if (quantity > 0) {
      result.push({
        ...commodity,
        quantity,
        totalCost: quantity * commodity.buyPrice,
        totalProfit: quantity * commodity.profitPerScu,
      });
      remainingScu -= quantity;
      remainingBudget -= quantity * commodity.buyPrice;
    }
  }

  return result;
}

/**
 * Calculer le profit/heure d'une route
 * @param {number} netProfit - Profit net en aUEC
 * @param {number} travelTimeMinutes - Temps de trajet en minutes
 * @param {number} dockingTimeMinutes - Temps de chargement/déchargement en minutes
 * @returns {number} Profit par heure
 */
export function calcProfitPerHour(netProfit, travelTimeMinutes, dockingTimeMinutes = 10) {
  const totalMinutes = travelTimeMinutes + dockingTimeMinutes;
  if (totalMinutes <= 0) return 0;
  return (netProfit / totalMinutes) * 60;
}

// ============================================================
// CALCULS DE FLOTTE
// ============================================================

/**
 * Calculer les statistiques agrégées d'une flotte
 * @param {Array} ships - Vaisseaux de la flotte avec leurs specs
 * @returns {Object} Statistiques de la flotte
 */
export function calcFleetStats(ships) {
  if (!ships || ships.length === 0) {
    return {
      totalCargo: 0,
      totalCrew: { min: 0, max: 0 },
      totalValue: 0,
      averageDps: 0,
      roles: {},
      manufacturers: {},
      sizes: {},
      crewRequirement: 0,
    };
  }

  const totalCargo = ships.reduce((sum, s) => sum + (s.specs?.cargo || 0), 0);
  const totalValue = ships.reduce((sum, s) => sum + (s.price || 0), 0);
  const minCrew = ships.reduce((sum, s) => sum + (s.crew?.min || 1), 0);
  const maxCrew = ships.reduce((sum, s) => sum + (s.crew?.max || 1), 0);

  const roles = ships.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  const manufacturers = ships.reduce((acc, s) => {
    acc[s.manufacturer] = (acc[s.manufacturer] || 0) + 1;
    return acc;
  }, {});

  const sizes = ships.reduce((acc, s) => {
    acc[s.size] = (acc[s.size] || 0) + 1;
    return acc;
  }, {});

  return {
    count: ships.length,
    totalCargo,
    totalCrew: { min: minCrew, max: maxCrew },
    totalValue,
    roles,
    manufacturers,
    sizes,
    cargoCapacityRatio: totalCargo > 0 ? (totalCargo / ships.length).toFixed(1) : 0,
  };
}

/**
 * Scorer la composition d'une flotte (0-100)
 * @param {Object} stats - Statistiques de la flotte
 * @returns {Object} Score et recommandations
 */
export function scoreFleetComposition(stats) {
  let score = 0;
  const recommendations = [];

  const roles = stats.roles || {};
  const hasEscort = (roles['Chasseur'] || 0) + (roles['Chasseur Lourd'] || 0) > 0;
  const hasCargo = (roles['Cargo'] || 0) + (roles['Cargo Lourd'] || 0) > 0;
  const hasMedical = (roles['Médical'] || 0) > 0;
  const hasExplorer = (roles['Explorateur'] || 0) > 0;

  if (hasEscort) score += 25;
  else recommendations.push('Ajoutez des vaisseaux d\'escorte pour protéger votre flotte');

  if (hasCargo) score += 25;
  else recommendations.push('Ajoutez de la capacité de cargo pour le commerce');

  if (hasMedical) score += 15;
  else recommendations.push('Un vaisseau médical améliore la survie en opération');

  if (stats.count >= 3) score += 20;
  else recommendations.push('Une flotte de minimum 3 vaisseaux est recommandée');

  if (Object.keys(roles).length >= 3) score += 15;
  else recommendations.push('Diversifiez les rôles de votre flotte');

  return {
    score: Math.min(100, score),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    recommendations,
  };
}

// ============================================================
// CALCULS DE MISSIONS
// ============================================================

/**
 * Calculer le score d'empilement de missions
 * @param {Array} missions - Liste des missions disponibles
 * @param {Object} ship - Vaisseau du joueur
 * @param {string} currentLocation - Position actuelle
 * @returns {Array} Missions optimales classées
 */
export function calcMissionStack(missions, ship, currentLocation) {
  if (!missions || missions.length === 0) return [];

  return missions
    .map(mission => {
      const locationBonus = mission.location === currentLocation ? 100 : 0;
      const payoutScore = (mission.payout / 1000) * 10;
      const timeScore = mission.estimatedTime > 0
        ? (mission.payout / mission.estimatedTime) * 5
        : 0;
      const riskPenalty = {
        Facile: 0,
        Moyen: -5,
        Difficile: -15,
        'Très Difficile': -25,
        Extrême: -35,
      }[mission.difficulty] || 0;

      const stackScore = locationBonus + payoutScore + timeScore + riskPenalty;

      return {
        ...mission,
        stackScore,
        payoutPerHour: mission.estimatedTime > 0
          ? (mission.payout / mission.estimatedTime) * 60
          : mission.payout,
      };
    })
    .sort((a, b) => b.stackScore - a.stackScore);
}

/**
 * Optimiser un groupe de missions pour maximiser le temps/profit
 * @param {Array} missions - Missions scorées
 * @param {number} maxTime - Temps disponible en minutes
 * @returns {Object} Missions sélectionnées et métriques
 */
export function optimizeMissionGroup(missions, maxTime = 60) {
  const sorted = [...missions].sort((a, b) => b.payoutPerHour - a.payoutPerHour);
  const selected = [];
  let totalTime = 0;
  let totalPayout = 0;

  for (const mission of sorted) {
    const estimatedTime = mission.estimatedTime || 15;
    if (totalTime + estimatedTime <= maxTime) {
      selected.push(mission);
      totalTime += estimatedTime;
      totalPayout += mission.payout;
    }
  }

  return {
    missions: selected,
    totalTime,
    totalPayout,
    payoutPerHour: totalTime > 0 ? (totalPayout / totalTime) * 60 : 0,
    efficiency: maxTime > 0 ? (totalTime / maxTime) * 100 : 0,
  };
}

// ============================================================
// CALCULS DE ROUTES
// ============================================================

/**
 * Calculer la distance approximative entre deux points
 * (Simplifié pour Star Citizen - distance en UA/Gm)
 * @param {Object} from - {x, y, z}
 * @param {Object} to - {x, y, z}
 * @returns {number} Distance en Gm
 */
export function calcDistance(from, to) {
  if (!from || !to) return 0;
  const dx = (to.x || 0) - (from.x || 0);
  const dy = (to.y || 0) - (from.y || 0);
  const dz = (to.z || 0) - (from.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Estimer le temps de voyage en saut quantique
 * @param {number} distanceGm - Distance en Gm
 * @param {number} qSpeed - Vitesse quantique en Mm/s (défaut: 0.02 Gm/s)
 * @returns {number} Temps en secondes
 */
export function calcQTravelTime(distanceGm, qSpeed = 0.02) {
  if (distanceGm <= 0 || qSpeed <= 0) return 0;
  return distanceGm / qSpeed;
}

/**
 * Trouver la route optimale entre plusieurs points (algorithme glouton)
 * @param {Array} waypoints - Points de passage [{id, coords, profit}]
 * @param {Object} start - Point de départ
 * @returns {Array} Ordre optimal des waypoints
 */
export function findOptimalRoute(waypoints, start) {
  if (!waypoints || waypoints.length === 0) return [];
  if (waypoints.length === 1) return waypoints;

  const unvisited = [...waypoints];
  const route = [];
  let current = start;

  while (unvisited.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    unvisited.forEach((wp, idx) => {
      const dist = calcDistance(current.coords || current, wp.coords || wp);
      const travelTime = calcQTravelTime(dist);
      const score = wp.profit > 0 && travelTime > 0
        ? wp.profit / (travelTime / 60)
        : -dist;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    const next = unvisited.splice(bestIdx, 1)[0];
    route.push(next);
    current = next;
  }

  return route;
}

// ============================================================
// CALCULS DE MINAGE
// ============================================================

/**
 * Calculer le rendement de minage
 * @param {number} yield_scu - Rendement en SCU
 * @param {number} sellPrice - Prix de vente par SCU
 * @param {number} miningTimeMinutes - Temps de minage en minutes
 * @param {number} fuelCost - Coût en carburant
 * @returns {Object}
 */
export function calcMiningYield(yield_scu, sellPrice, miningTimeMinutes, fuelCost = 0) {
  const grossRevenue = yield_scu * sellPrice;
  const netRevenue = grossRevenue - fuelCost;
  const perHour = miningTimeMinutes > 0 ? (netRevenue / miningTimeMinutes) * 60 : 0;

  return {
    grossRevenue,
    netRevenue,
    perHour,
    perScu: yield_scu > 0 ? netRevenue / yield_scu : 0,
  };
}
