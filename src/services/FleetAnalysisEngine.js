import { calcFleetStats, scoreFleetComposition } from '../utils/calculations.js';
import { SHIPS } from '../datasets/ships.js';

/**
 * Fleet analysis engine.
 * Provides composition analysis, role coverage, and strategic recommendations.
 */
class FleetAnalysisEngineClass {
  /**
   * Perform a full analysis of a fleet.
   * @param {Array} fleetShips - Array of {shipId, role?, quantity?}
   * @returns {object} Complete fleet analysis
   */
  analyze(fleetShips) {
    if (!fleetShips || fleetShips.length === 0) {
      return { ships: [], stats: null, score: null, recommendations: [] };
    }

    const ships = fleetShips
      .map(entry => {
        const ship = SHIPS.find(s => s.id === entry.shipId || s.id === entry.id);
        return ship ? { ...ship, quantity: entry.quantity || 1 } : null;
      })
      .filter(Boolean);

    const stats = calcFleetStats(ships);
    const scoreResult = scoreFleetComposition(ships);

    const strengths = this._identifyStrengths(ships, stats);
    const weaknesses = this._identifyWeaknesses(ships, stats);
    const synergies = this._findSynergies(ships);

    return {
      ships,
      stats,
      score: scoreResult,
      strengths,
      weaknesses,
      synergies,
      totalValue: ships.reduce((s, ship) => s + (ship.price || 0) * ship.quantity, 0),
      totalCargo: ships.reduce((s, ship) => s + (ship.cargo || 0) * ship.quantity, 0),
      crewRequired: ships.reduce((s, ship) => s + (ship.crew?.max || 1) * ship.quantity, 0),
    };
  }

  /**
   * Get capability radar chart data (0-100 per axis).
   * @param {Array} ships
   * @returns {Array} Recharts-compatible radar data
   */
  getCapabilityRadar(ships) {
    if (!ships?.length) return [];

    const metrics = {
      'Combat': this._rateCombat(ships),
      'Commerce': this._rateTrade(ships),
      'Exploration': this._rateExploration(ships),
      'Minage': this._rateMining(ships),
      'Support': this._rateSupport(ships),
      'Polyvalence': this._rateVersatility(ships),
    };

    return Object.entries(metrics).map(([subject, value]) => ({ subject, value, fullMark: 100 }));
  }

  _rateCombat(ships) {
    const combatRoles = ['Chasseur', 'Bombardier', 'Canonnière', 'Combat'];
    const combatShips = ships.filter(s => combatRoles.some(r => s.role?.includes(r)));
    return Math.min(100, (combatShips.length / ships.length) * 100 + (combatShips.length > 0 ? 20 : 0));
  }

  _rateTrade(ships) {
    const tradeShips = ships.filter(s => (s.cargo || 0) > 50);
    const totalCargo = ships.reduce((sum, s) => sum + (s.cargo || 0), 0);
    return Math.min(100, (tradeShips.length / ships.length) * 60 + Math.min(40, totalCargo / 100));
  }

  _rateExploration(ships) {
    const explorerRoles = ['Exploration', 'Éclaireur', 'Polyvalent'];
    const explorers = ships.filter(s => explorerRoles.some(r => s.role?.includes(r)));
    return Math.min(100, (explorers.length / ships.length) * 100 + (explorers.length > 0 ? 10 : 0));
  }

  _rateMining(ships) {
    const miners = ships.filter(s => s.role?.toLowerCase().includes('min'));
    return Math.min(100, (miners.length / ships.length) * 120);
  }

  _rateSupport(ships) {
    const supportRoles = ['Médical', 'Transport', 'Ravitaillement', 'Réparation'];
    const support = ships.filter(s => supportRoles.some(r => s.role?.includes(r)));
    return Math.min(100, (support.length / ships.length) * 100 + (support.length > 0 ? 15 : 0));
  }

  _rateVersatility(ships) {
    const roles = new Set(ships.map(s => s.role).filter(Boolean));
    return Math.min(100, roles.size * 15);
  }

  _identifyStrengths(ships, stats) {
    const strengths = [];
    if (stats.byRole['Combat']?.length >= 2 || stats.byRole['Chasseur']?.length >= 2) {
      strengths.push('Bonne couverture de combat');
    }
    const totalCargo = ships.reduce((s, ship) => s + (ship.cargo || 0), 0);
    if (totalCargo > 200) strengths.push(`Forte capacité marchande (${totalCargo} SCU)`);
    if (new Set(ships.map(s => s.manufacturer)).size >= 3) {
      strengths.push('Diversité des fabricants');
    }
    return strengths;
  }

  _identifyWeaknesses(ships, stats) {
    const weaknesses = [];
    const hasCombat = ships.some(s => ['Combat', 'Chasseur', 'Bombardier'].some(r => s.role?.includes(r)));
    if (!hasCombat) weaknesses.push('Pas de vaisseau de combat');
    const hasCargo = ships.some(s => (s.cargo || 0) > 50);
    if (!hasCargo) weaknesses.push('Capacité cargo limitée');
    if (ships.length < 2) weaknesses.push('Flotte trop petite');
    return weaknesses;
  }

  _findSynergies(ships) {
    const synergies = [];
    const hasFighter = ships.some(s => s.role?.includes('Chasseur') || s.role?.includes('Combat'));
    const hasCargo = ships.some(s => (s.cargo || 0) > 100);
    if (hasFighter && hasCargo) {
      synergies.push({ type: 'Escorte Commerciale', description: 'Votre chasseur peut escorter vos transports de marchandises.' });
    }
    const hasMiner = ships.some(s => s.role?.toLowerCase().includes('min'));
    const hasRefinery = ships.some(s => s.role?.includes('Ravitaillement') || (s.cargo || 0) > 200);
    if (hasMiner && hasRefinery) {
      synergies.push({ type: 'Opération de Minage', description: 'Configuration idéale pour extraire et transporter des minerais.' });
    }
    return synergies;
  }
}

export const FleetAnalysisEngine = new FleetAnalysisEngineClass();
export default FleetAnalysisEngine;
