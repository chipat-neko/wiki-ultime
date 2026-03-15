import { CacheManager } from '../core/CacheManager.js';
import { SCWIKI } from './endpoints.js';

const TTL = 60 * 60 * 1000; // 1 heure

async function apiFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`SC Wiki HTTP ${res.status}`);
  return res.json();
}

/**
 * Star Citizen Wiki API — https://api.star-citizen.wiki
 * API publique, pas d'auth requise, CORS activé.
 */
class SCWikiApiClass {
  /**
   * Recherche un vaisseau/véhicule par nom.
   * Essaie d'abord le slug (nom-avec-tirets), puis filter[name].
   * @param {string} shipName — Nom du vaisseau (ex: "Aurora MR")
   * @returns {object|null} Données brutes du véhicule ou null
   */
  async getVehicle(shipName) {
    const key = `scwiki_vehicle_${shipName.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = CacheManager.get(key);
    if (cached) return cached;

    // Tentative 1 : slug style (Aurora MR → aurora-mr)
    const slug = shipName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      const json = await apiFetch(SCWIKI.VEHICLE(slug));
      const vehicle = json?.data ?? json;
      if (vehicle?.name) {
        CacheManager.set(key, vehicle, TTL);
        return vehicle;
      }
    } catch (_) {
      // Tentative 2 : filter[name]
    }

    try {
      const json = await apiFetch(SCWIKI.VEHICLE_SEARCH(shipName));
      const arr = json?.data ?? [];
      if (!arr.length) return null;
      const vehicle = arr[0];
      CacheManager.set(key, vehicle, TTL);
      return vehicle;
    } catch (err) {
      throw new Error(`SC Wiki indisponible : ${err.message}`);
    }
  }

  /**
   * Normalise un véhicule SC Wiki vers le format local.
   * @param {object} v — Véhicule brut SC Wiki
   * @returns {object} Données normalisées
   */
  normalizeVehicle(v) {
    return {
      id:             v.slug ?? v.name?.toLowerCase().replace(/\s+/g, '-'),
      name:           v.name,
      // Dimensions
      length:         v.sizes?.length ?? null,
      beam:           v.sizes?.beam ?? null,
      height:         v.sizes?.height ?? null,
      mass:           v.mass ?? null,
      // Cargo
      cargo:          v.cargo_capacity ?? null,
      // Équipage
      crew:           { min: v.min_crew ?? 1, max: v.max_crew ?? 1 },
      // Vitesses
      speed: {
        scm:          v.speed?.scm ?? null,
        max:          v.speed?.max ?? null,
        boost:        v.speed?.boost_forward ?? null,
      },
      // Shields
      shield: {
        hp:           v.shield?.hp ?? null,
        regen:        v.shield?.regeneration ?? null,
      },
      // Carburant
      fuel: {
        hydrogen:     v.fuel?.capacity ?? null,
        quantum:      v.quantum?.quantum_fuel_capacity ?? null,
      },
      // Quantum drive
      quantum: {
        speed:        v.quantum?.quantum_speed ?? null,
        range:        v.quantum?.quantum_range ?? null,
      },
      // Émissions
      emission: {
        ir:           v.emission?.ir ?? null,
        emIdle:       v.emission?.em_idle ?? null,
        emFull:       v.emission?.em_full ?? null,
      },
      // Classification
      focus:          v.focus ?? null,
      manufacturer:   v.manufacturer?.name ?? null,
      description:    v.description ?? null,
      updatedAt:      v.updated_at ?? null,
      source:         'scwiki',
    };
  }
}

export const SCWikiApi = new SCWikiApiClass();
export default SCWikiApi;
