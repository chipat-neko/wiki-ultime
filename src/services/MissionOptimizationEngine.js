import { calcMissionStack, optimizeMissionGroup } from '../utils/calculations.js';
import { SAMPLE_MISSIONS, MISSION_TYPES_DATA } from '../datasets/missions.js';

/**
 * Mission optimization engine.
 * Provides AI-driven mission selection and stacking strategies.
 */
class MissionOptimizationEngineClass {
  /**
   * Get the optimal mission stack for a given time budget and location.
   *
   * @param {object} params
   * @param {string} params.location - Current location ID
   * @param {number} params.timeBudget - Available time in minutes
   * @param {boolean} params.includeIllegal - Whether to allow illegal missions
   * @param {Array} params.missions - Override mission pool (default: SAMPLE_MISSIONS)
   * @returns {object} Optimized stack result
   */
  getOptimalStack({ location, timeBudget = 60, includeIllegal = false, missions }) {
    const pool = (missions || SAMPLE_MISSIONS).filter(m => {
      if (!includeIllegal && !m.legal) return false;
      if (m.expires && m.expires < Date.now()) return false;
      return true;
    }).map(m => ({ ...m, estimatedTime: m.estimatedTime || 15 }));

    const scored = calcMissionStack(pool, null, location);
    return optimizeMissionGroup(scored, timeBudget);
  }

  /**
   * Score all available missions and rank them.
   *
   * @param {string} location - Current location ID for proximity bonus
   * @param {boolean} includeIllegal
   * @returns {Array} Scored missions sorted by stackScore desc
   */
  rankMissions(location, includeIllegal = false) {
    const pool = SAMPLE_MISSIONS.filter(m => !m.expires || m.expires >= Date.now());
    return calcMissionStack(
      includeIllegal ? pool : pool.filter(m => m.legal),
      null,
      location
    );
  }

  /**
   * Estimate earnings for a session.
   *
   * @param {number} sessionHours - Duration of session in hours
   * @param {string} location
   * @param {boolean} includeIllegal
   * @returns {object} Estimated session earnings breakdown
   */
  estimateSessionEarnings(sessionHours = 2, location = null, includeIllegal = false) {
    const timeBudget = sessionHours * 60;
    const result = this.getOptimalStack({ location, timeBudget, includeIllegal });

    if (!result) return null;

    const runs = Math.floor(timeBudget / (result.totalTime || timeBudget));
    const estimatedTotal = result.totalPayout * Math.max(1, runs);

    return {
      singleRun: result,
      estimatedRuns: Math.max(1, runs),
      estimatedTotalPayout: estimatedTotal,
      estimatedPayoutPerHour: result.payoutPerHour,
      sessionHours,
    };
  }

  /**
   * Get mission type statistics for analytics display.
   * @returns {Array} Mission type stats
   */
  getMissionTypeStats() {
    return MISSION_TYPES_DATA.map(mt => ({
      ...mt,
      avgPayout: Math.round((mt.payout.min + mt.payout.max) / 2),
      payoutPerMinute: Math.round(((mt.payout.min + mt.payout.max) / 2) / mt.estimatedTime),
    })).sort((a, b) => b.payoutPerMinute - a.payoutPerMinute);
  }

  /**
   * Get missions expiring soon.
   * @param {number} withinMs - Look-ahead window (default: 1 hour)
   * @returns {Array} Expiring missions
   */
  getExpiringMissions(withinMs = 3_600_000) {
    const now = Date.now();
    return SAMPLE_MISSIONS
      .filter(m => m.expires && m.expires > now && m.expires - now <= withinMs)
      .sort((a, b) => a.expires - b.expires);
  }
}

export const MissionOptimizationEngine = new MissionOptimizationEngineClass();
export default MissionOptimizationEngine;
