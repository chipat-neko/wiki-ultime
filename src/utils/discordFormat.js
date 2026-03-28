/**
 * Discord Format — Helpers pour formater et envoyer du contenu vers Discord
 */

const SITE_NAME = 'SC Companion Wiki';
const SITE_URL = 'https://sc-companion.vercel.app';

/**
 * Formater un build (loadout) en embed Discord markdown
 */
export function formatBuildEmbed(build) {
  const lines = [];
  lines.push(`**🔧 ${build.title || build.name || 'Build sans nom'}**`);
  if (build.ship) lines.push(`Vaisseau : **${build.ship}**`);
  if (build.tier) lines.push(`Tier : ${build.tier}`);

  if (build.components && build.components.length > 0) {
    lines.push('');
    lines.push('__Composants :__');
    build.components.forEach((c) => {
      const label = c.name || c.label || c;
      const slot = c.slot ? `[${c.slot}] ` : '';
      lines.push(`> ${slot}${label}`);
    });
  }

  if (build.budget) lines.push(`\nBudget : **${build.budget.toLocaleString('fr-FR')} aUEC**`);
  if (build.author) lines.push(`Par : ${build.author}`);

  lines.push('');
  lines.push(`_Partagé via ${SITE_NAME}_`);
  return lines.join('\n');
}

/**
 * Formater une route commerciale en embed Discord markdown
 */
export function formatRouteEmbed(route) {
  const lines = [];
  const from = route.from || route.origin || '?';
  const to = route.to || route.destination || '?';

  lines.push(`**📦 Route commerciale : ${from} → ${to}**`);

  if (route.commodity) lines.push(`Marchandise : **${route.commodity}**`);
  if (route.scu) lines.push(`SCU : **${route.scu}**`);
  if (route.profit != null) {
    lines.push(`Profit estimé : **${Number(route.profit).toLocaleString('fr-FR')} aUEC**`);
  }
  if (route.profitPerUnit != null) {
    lines.push(`Profit/unité : ${Number(route.profitPerUnit).toLocaleString('fr-FR')} aUEC`);
  }
  if (route.distance) lines.push(`Distance : ${route.distance}`);

  lines.push('');
  lines.push(`_Partagé via ${SITE_NAME}_`);
  return lines.join('\n');
}

/**
 * Formater un article / guide en embed Discord markdown
 */
export function formatArticleEmbed(article) {
  const lines = [];
  lines.push(`**📖 ${article.title || 'Article'}**`);

  if (article.category) lines.push(`Catégorie : ${article.category}`);
  if (article.excerpt || article.description) {
    const text = (article.excerpt || article.description).slice(0, 200);
    lines.push(`\n> ${text}${text.length >= 200 ? '…' : ''}`);
  }
  if (article.author) lines.push(`\nAuteur : ${article.author}`);
  if (article.date) lines.push(`Date : ${article.date}`);
  if (article.version) lines.push(`Version : ${article.version}`);

  lines.push('');
  lines.push(`_Partagé via ${SITE_NAME}_`);
  return lines.join('\n');
}

/**
 * Formater un vaisseau en embed Discord markdown
 */
export function formatShipEmbed(ship) {
  const lines = [];
  lines.push(`**🚀 ${ship.name}**`);

  if (ship.manufacturer) lines.push(`Fabricant : ${ship.manufacturer}`);
  if (ship.role) lines.push(`Rôle : ${ship.role}`);
  if (ship.size) lines.push(`Taille : ${ship.size}`);

  const specs = ship.specs || {};
  const statLines = [];
  if (specs.cargo != null) statLines.push(`Cargo : ${specs.cargo} SCU`);
  if (specs.maxSpeed) statLines.push(`Vitesse max : ${specs.maxSpeed} m/s`);
  if (specs.shieldHp) statLines.push(`Bouclier : ${specs.shieldHp.toLocaleString('fr-FR')} HP`);
  if (ship.crew) {
    const crew = typeof ship.crew === 'object' ? `${ship.crew.min}–${ship.crew.max}` : ship.crew;
    statLines.push(`Équipage : ${crew}`);
  }
  if (ship.price) statLines.push(`Prix : ${Number(ship.price).toLocaleString('fr-FR')} aUEC`);

  if (statLines.length) {
    lines.push('');
    lines.push('__Spécifications :__');
    statLines.forEach((s) => lines.push(`> ${s}`));
  }

  lines.push('');
  lines.push(`_Partagé via ${SITE_NAME}_`);
  return lines.join('\n');
}

/**
 * Envoyer un message via un webhook Discord
 * @param {string} webhookUrl - URL du webhook Discord
 * @param {string} content - Contenu du message
 * @returns {Promise<{ok: boolean, status?: number, error?: string}>}
 */
export async function sendWebhook(webhookUrl, content) {
  if (!webhookUrl || !content) {
    return { ok: false, error: 'URL du webhook ou contenu manquant' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      return { ok: false, status: res.status, error: `Erreur Discord (${res.status})` };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message || 'Erreur réseau' };
  }
}

/** Map type → formatter */
export const FORMATTERS = {
  build: formatBuildEmbed,
  route: formatRouteEmbed,
  article: formatArticleEmbed,
  ship: formatShipEmbed,
};
