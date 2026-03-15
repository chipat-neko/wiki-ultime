/**
 * Formatters - Fonctions de formatage pour l'affichage des données Star Citizen
 */

/**
 * Formater un nombre en aUEC (Alpha Universal Earth Credits)
 * @param {number} amount - Montant
 * @param {boolean} compact - Affichage compact (ex: 1.5M)
 * @returns {string}
 */
export function formatCredits(amount, compact = false) {
  if (amount === null || amount === undefined) return 'N/A';
  const num = Number(amount);
  if (isNaN(num)) return 'N/A';

  if (compact) {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}Md aUEC`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M aUEC`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K aUEC`;
    return `${num.toFixed(0)} aUEC`;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'name',
  })
    .format(num)
    .replace('dollars des États-Unis', 'aUEC')
    .replace('dollar des États-Unis', 'aUEC');
}

/**
 * Formater un nombre simple avec séparateurs
 * @param {number} num - Nombre
 * @param {number} decimals - Décimales
 * @returns {string}
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(num));
}

/**
 * Formater une masse en tonnes ou kg
 * @param {number} mass - Masse en kg
 * @returns {string}
 */
export function formatMass(mass) {
  if (!mass && mass !== 0) return 'N/A';
  if (mass >= 1000) return `${formatNumber(mass / 1000, 1)} t`;
  return `${formatNumber(mass)} kg`;
}

/**
 * Formater une distance
 * @param {number} dist - Distance en Gm
 * @param {string} unit - Unité (Gm, Mm, km)
 * @returns {string}
 */
export function formatDistance(dist, unit = 'Gm') {
  if (!dist && dist !== 0) return 'N/A';
  return `${formatNumber(dist, 2)} ${unit}`;
}

/**
 * Formater une vitesse
 * @param {number} speed - Vitesse en m/s
 * @param {string} unit - Unité
 * @returns {string}
 */
export function formatSpeed(speed, unit = 'm/s') {
  if (!speed && speed !== 0) return 'N/A';
  return `${formatNumber(speed)} ${unit}`;
}

/**
 * Formater une capacité de cargo en SCU
 * @param {number} scu - Unités de cargo standard
 * @returns {string}
 */
export function formatCargo(scu) {
  if (!scu && scu !== 0) return 'N/A';
  if (scu === 0) return 'Aucun';
  return `${formatNumber(scu)} SCU`;
}

/**
 * Formater un pourcentage
 * @param {number} value - Valeur (0-1 ou 0-100)
 * @param {boolean} isDecimal - Si la valeur est entre 0 et 1
 * @returns {string}
 */
export function formatPercent(value, isDecimal = false) {
  if (value === null || value === undefined) return 'N/A';
  const pct = isDecimal ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

/**
 * Formater un temps en heures/minutes/secondes
 * @param {number} seconds - Durée en secondes
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Formater une date relative (il y a X temps)
 * @param {number|Date} date - Timestamp ou objet Date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const ts = date instanceof Date ? date.getTime() : date;
  const diff = now - ts;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return new Intl.DateTimeFormat('fr-FR').format(new Date(ts));
  if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'à l\'instant';
}

/**
 * Formater une date complète
 * @param {number|Date} date - Timestamp ou objet Date
 * @param {Object} options - Options de formatage
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(
    date instanceof Date ? date : new Date(date)
  );
}

/**
 * Formater un rendement commercial (profit/SCU/heure)
 * @param {number} profit - Profit en aUEC
 * @param {number} scu - Quantité en SCU
 * @param {number} timeMinutes - Temps en minutes
 * @returns {Object} Métriques de rendement
 */
export function formatTradeYield(profit, scu, timeMinutes) {
  const profitPerScu = scu > 0 ? profit / scu : 0;
  const profitPerHour = timeMinutes > 0 ? (profit / timeMinutes) * 60 : 0;

  return {
    total: formatCredits(profit, true),
    perScu: formatCredits(profitPerScu, false),
    perHour: formatCredits(profitPerHour, true),
  };
}

/**
 * Formater une puissance DPS
 * @param {number} dps - Dommages par seconde
 * @returns {string}
 */
export function formatDps(dps) {
  if (!dps && dps !== 0) return 'N/A';
  return `${formatNumber(dps, 1)} DPS`;
}

/**
 * Tronquer un texte long
 * @param {string} text - Texte
 * @param {number} maxLength - Longueur maximale
 * @returns {string}
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Formater un nom de vaisseau avec le fabricant
 * @param {Object} ship - Objet vaisseau
 * @returns {string}
 */
export function formatShipName(ship) {
  if (!ship) return 'N/A';
  return `${ship.manufacturer} ${ship.name}`;
}

/**
 * Convertir SCU en volume m³
 * @param {number} scu - Standard Cargo Units
 * @returns {number} Volume en m³
 */
export function scuToM3(scu) {
  return scu * 1.95; // 1 SCU ≈ 1.95 m³
}

/**
 * Formater un booléen en texte français
 * @param {boolean} value
 * @param {string[]} labels - [labelVrai, labelFaux]
 * @returns {string}
 */
export function formatBoolean(value, labels = ['Oui', 'Non']) {
  return value ? labels[0] : labels[1];
}
