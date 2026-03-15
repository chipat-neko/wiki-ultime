/**
 * Helpers - Fonctions utilitaires générales
 */

/**
 * Debounce: retarder l'exécution d'une fonction
 * @param {Function} fn - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  const debounced = function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Throttle: limiter la fréquence d'exécution
 * @param {Function} fn - Fonction à throttler
 * @param {number} limit - Limite en ms
 * @returns {Function}
 */
export function throttle(fn, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Cloner profondément un objet
 * @param {*} obj - Objet à cloner
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepClone(v)]));
}

/**
 * Fusionner profondément deux objets
 * @param {Object} target - Objet cible
 * @param {Object} source - Objet source
 * @returns {Object}
 */
export function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Générer un ID unique
 * @param {string} prefix - Préfixe optionnel
 * @returns {string}
 */
export function generateId(prefix = '') {
  const id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Trier un tableau d'objets par une propriété
 * @param {Array} arr - Tableau
 * @param {string} key - Propriété de tri
 * @param {string} direction - 'asc' ou 'desc'
 * @returns {Array}
 */
export function sortBy(arr, key, direction = 'asc') {
  return [...arr].sort((a, b) => {
    const aVal = getNestedValue(a, key);
    const bVal = getNestedValue(b, key);

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' });
      return direction === 'asc' ? cmp : -cmp;
    }

    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

/**
 * Grouper un tableau par une propriété
 * @param {Array} arr - Tableau
 * @param {string} key - Propriété de groupement
 * @returns {Object}
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = getNestedValue(item, key) || 'Autre';
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});
}

/**
 * Obtenir une valeur imbriquée par chemin (ex: 'specs.cargo.scu')
 * @param {Object} obj - Objet
 * @param {string} path - Chemin
 * @param {*} defaultValue - Valeur par défaut
 * @returns {*}
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  if (!obj || !path) return defaultValue;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue;
    current = current[key];
  }
  return current !== undefined ? current : defaultValue;
}

/**
 * Paginer un tableau
 * @param {Array} arr - Tableau complet
 * @param {number} page - Numéro de page (1-based)
 * @param {number} pageSize - Taille de page
 * @returns {Object} { items, total, pages, page, pageSize }
 */
export function paginate(arr, page = 1, pageSize = 25) {
  const total = arr.length;
  const pages = Math.ceil(total / pageSize);
  const currentPage = Math.min(Math.max(1, page), pages || 1);
  const start = (currentPage - 1) * pageSize;
  const items = arr.slice(start, start + pageSize);

  return {
    items,
    total,
    pages,
    page: currentPage,
    pageSize,
    hasNext: currentPage < pages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Filtrer un tableau avec plusieurs critères
 * @param {Array} arr - Tableau
 * @param {Object} filters - Filtres {key: value}
 * @returns {Array}
 */
export function filterBy(arr, filters) {
  return arr.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'all') return true;

      const itemValue = getNestedValue(item, key);

      if (Array.isArray(value)) {
        return value.length === 0 || value.includes(itemValue);
      }

      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }

      if (typeof value === 'object' && value.min !== undefined) {
        const num = Number(itemValue);
        if (value.min !== null && num < value.min) return false;
        if (value.max !== null && num > value.max) return false;
        return true;
      }

      return itemValue === value;
    });
  });
}

/**
 * Calculer des statistiques sur un tableau de nombres
 * @param {number[]} arr - Tableau de nombres
 * @returns {Object} {min, max, avg, sum, median}
 */
export function calcStats(arr) {
  if (!arr || arr.length === 0) return { min: 0, max: 0, avg: 0, sum: 0, median: 0 };

  const nums = arr.filter(n => n !== null && n !== undefined && !isNaN(n));
  if (nums.length === 0) return { min: 0, max: 0, avg: 0, sum: 0, median: 0 };

  const sorted = [...nums].sort((a, b) => a - b);
  const sum = nums.reduce((a, b) => a + b, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / nums.length,
    sum,
    median,
  };
}

/**
 * Convertir un objet en paramètres URL
 * @param {Object} params - Paramètres
 * @returns {string}
 */
export function toQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Parser les paramètres URL
 * @param {string} queryString - Chaîne de requête
 * @returns {Object}
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Télécharger un objet JSON
 * @param {*} data - Données à exporter
 * @param {string} filename - Nom du fichier
 */
export function downloadJson(data, filename = 'export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Lire un fichier JSON importé
 * @param {File} file - Fichier
 * @returns {Promise<*>}
 */
export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch (error) {
        reject(new Error('Fichier JSON invalide'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

/**
 * Créer une plage de nombres
 * @param {number} start - Début
 * @param {number} end - Fin
 * @param {number} step - Pas
 * @returns {number[]}
 */
export function range(start, end, step = 1) {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Capitaliser la première lettre
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Comparer deux tableaux d'IDs
 * @param {string[]} a
 * @param {string[]} b
 * @returns {boolean}
 */
export function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
}

/**
 * Obtenir une couleur aléatoire HSL pour les graphiques
 * @param {number} index - Index pour la cohérence
 * @returns {string}
 */
export function getChartColor(index) {
  const colors = [
    '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
    '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
    '#a855f7', '#0ea5e9', '#d946ef', '#22c55e', '#fb923c',
  ];
  return colors[index % colors.length];
}

/**
 * Attendre un certain délai (Promise)
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
