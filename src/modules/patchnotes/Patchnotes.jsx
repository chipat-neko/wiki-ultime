import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { useGameVersion } from '../../hooks/useGameVersion.js';
import { useWikiPatchList, useWikiPatchDetail } from '../../hooks/useWikiPatchNotes.js';
import { PATCH_NOTES, PATCH_CATEGORIES } from '../../datasets/patchnotes.js';
import { translateHtml } from '../../services/TranslationService.js';
import {
  FileText, Rocket, Car, Target, Crosshair, Cpu, ClipboardList,
  Globe, TrendingUp, Wrench, Bell, Shield, Star, ChevronDown,
  ChevronUp, ExternalLink, Plus, RefreshCw, Bug, Trash2, ArrowRight,
  Sparkles, Calendar, Tag, Loader2, BookOpen, Layers, AlertCircle,
  Languages,
} from 'lucide-react';
import clsx from 'clsx';

// ── Constantes ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'official', label: 'Patchnotes Officiels', icon: BookOpen },
  { key: 'wiki',     label: 'Nouveautés Wiki',      icon: Layers   },
];

const ICON_MAP = {
  Rocket, Car, Target, Crosshair, Cpu, ClipboardList,
  Globe, TrendingUp, Wrench, Bell, Shield, Star,
};

const TYPE_CONFIG = {
  added:   { label: 'Ajouté',   icon: Plus,     color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  changed: { label: 'Modifié',  icon: RefreshCw, color: 'text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/20'   },
  fixed:   { label: 'Corrigé',  icon: Bug,       color: 'text-blue-400',    bg: 'bg-blue-500/10',    ring: 'ring-blue-500/20'    },
  removed: { label: 'Retiré',   icon: Trash2,    color: 'text-red-400',     bg: 'bg-red-500/10',     ring: 'ring-red-500/20'     },
};

// ── Composants partagés ──────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.changed;
  const Icon = cfg.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1', cfg.bg, cfg.color, cfg.ring)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ChangeItem({ item, navigate }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-space-100">{item.name}</span>
          {item.link && (
            <button
              onClick={() => navigate(item.link)}
              className="text-cyan-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Voir la page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-space-400 mt-0.5">{item.description}</p>
        )}
      </div>
    </div>
  );
}

function ChangeGroup({ change, navigate }) {
  const cat = PATCH_CATEGORIES[change.category] || PATCH_CATEGORIES.other;
  const Icon = ICON_MAP[cat.icon] || Star;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-space-100">{cat.label}</span>
        </div>
        <TypeBadge type={change.type} />
        <span className="text-xs text-space-500">({change.items.length})</span>
      </div>
      <div className="ml-6 space-y-0.5">
        {change.items.map((item, i) => (
          <ChangeItem key={item.id || i} item={item} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET 1 — Patchnotes Officiels (depuis starcitizen.tools)
// ══════════════════════════════════════════════════════════════════════════════

// ── Icônes par catégorie de patchnote ────────────────────────────────────────
const SECTION_ICONS = {
  'gameplay':            { icon: Wrench,    color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  'ships':               { icon: Rocket,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  'ships & vehicles':    { icon: Rocket,    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  'characters':          { icon: Star,      color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  'characters & ai':     { icon: Star,      color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  'locations':           { icon: Globe,     color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'weapons':             { icon: Target,    color: 'text-red-400',     bg: 'bg-red-500/10' },
  'weapons & items':     { icon: Target,    color: 'text-red-400',     bg: 'bg-red-500/10' },
  'core tech':           { icon: Cpu,       color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  'core tech & audio':   { icon: Cpu,       color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  'bug fixes':           { icon: Bug,       color: 'text-orange-400',  bg: 'bg-orange-500/10' },
  'bug fixes and technical updates': { icon: Bug, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

function getSectionStyle(title) {
  const key = title.toLowerCase().trim();
  for (const [k, v] of Object.entries(SECTION_ICONS)) {
    if (key.includes(k)) return v;
  }
  return { icon: Star, color: 'text-space-300', bg: 'bg-space-700/50' };
}

/**
 * Parse le HTML wiki en structure : [{ title, items: [{ label, subItems }] }]
 */
function parseWikiHtml(html) {
  if (!html) return [];

  // Créer un DOM temporaire pour parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const groups = [];
  let currentGroup = null;

  // Parcourir les enfants du body
  for (const node of doc.body.querySelectorAll('.mw-parser-output > *')) {
    // Ignorer les éléments cachés
    if (node.classList.contains('mw-editsection') ||
        node.classList.contains('mw-references-wrap') ||
        node.classList.contains('mw-heading') ||
        node.tagName === 'STYLE') continue;

    // <p><b>Title</b></p> → nouveau groupe
    if (node.tagName === 'P') {
      const bold = node.querySelector('b');
      if (bold && bold.textContent.trim().length > 2) {
        currentGroup = { title: bold.textContent.trim(), items: [] };
        groups.push(currentGroup);
        continue;
      }
    }

    // <ul> → items du groupe courant
    if (node.tagName === 'UL' && currentGroup) {
      for (const li of node.children) {
        if (li.tagName !== 'LI') continue;

        // Si le li contient un <b> → sous-catégorie avec sous-items
        const bold = li.querySelector(':scope > b');
        const subUl = li.querySelector(':scope > ul');

        if (bold && subUl) {
          const subItems = [];
          for (const subLi of subUl.children) {
            if (subLi.tagName === 'LI') {
              subItems.push(cleanText(subLi));
            }
          }
          currentGroup.items.push({ label: bold.textContent.trim(), subItems });
        } else {
          // Item simple
          const subItems = [];
          if (subUl) {
            for (const subLi of subUl.children) {
              if (subLi.tagName === 'LI') subItems.push(cleanText(subLi));
            }
          }
          const text = cleanText(li, true);
          if (text) currentGroup.items.push({ label: text, subItems });
        }
      }
    }

    // <ul> sans groupe → créer un groupe générique
    if (node.tagName === 'UL' && !currentGroup) {
      currentGroup = { title: 'Notes', items: [] };
      groups.push(currentGroup);
      for (const li of node.children) {
        if (li.tagName === 'LI') {
          const subUl = li.querySelector(':scope > ul');
          const subItems = [];
          if (subUl) {
            for (const subLi of subUl.children) {
              if (subLi.tagName === 'LI') subItems.push(cleanText(subLi));
            }
          }
          currentGroup.items.push({ label: cleanText(li, true), subItems });
        }
      }
    }
  }

  return groups;
}

/** Extrait le texte propre d'un élément, sans les sous-listes */
function cleanText(el, excludeSubLists = false) {
  const clone = el.cloneNode(true);
  // Retirer les sous-listes pour n'avoir que le texte du li lui-même
  if (excludeSubLists) {
    clone.querySelectorAll('ul, ol').forEach(n => n.remove());
  }
  // Retirer les éléments cachés
  clone.querySelectorAll('.mw-editsection, sup, .reference').forEach(n => n.remove());
  return clone.textContent.trim();
}

/** Rendu d'un groupe parsé (catégorie de patchnote) */
function PatchGroup({ group }) {
  const style = getSectionStyle(group.title);
  const Icon = style.icon;

  return (
    <div className="rounded-xl bg-space-800/40 ring-1 ring-white/5 overflow-hidden">
      {/* Header du groupe */}
      <div className={clsx('flex items-center gap-3 px-4 py-3 border-b border-white/5', style.bg)}>
        <Icon className={clsx('w-4.5 h-4.5', style.color)} />
        <h3 className="font-semibold text-space-100 text-sm">{group.title}</h3>
        <span className="text-xs text-space-500 ml-auto">{countItems(group)} éléments</span>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {group.items.map((item, i) => (
          <div key={i}>
            {item.subItems?.length > 0 ? (
              // Sous-catégorie avec enfants
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-space-200 flex items-center gap-2">
                  <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', style.color.replace('text-', 'bg-'))} />
                  {item.label}
                </p>
                <div className="ml-4 pl-3 border-l border-space-700 space-y-1">
                  {item.subItems.map((sub, j) => (
                    <p key={j} className="text-sm text-space-400 leading-relaxed">{sub}</p>
                  ))}
                </div>
              </div>
            ) : (
              // Item simple
              <p className="text-sm text-space-300 leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-space-500 flex-shrink-0 mt-1.5" />
                {item.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function countItems(group) {
  let c = 0;
  for (const item of group.items) {
    c += 1 + (item.subItems?.length || 0);
  }
  return c;
}

/** Fallback pour le HTML non parsable */
const WIKI_FALLBACK_CLASSES = `wiki-patch-content prose prose-invert prose-sm max-w-none
  [&_ul]:space-y-1.5 [&_ul]:list-none [&_ul]:pl-4
  [&_li]:text-space-300 [&_li]:text-sm [&_li]:leading-relaxed
  [&_b]:text-space-100 [&_b]:font-semibold
  [&_a]:text-cyan-400 [&_a]:no-underline hover:[&_a]:text-cyan-300
  [&_p]:text-space-300 [&_p]:text-sm [&_p]:mb-3 [&_p]:leading-relaxed
  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-space-100 [&_h2]:mt-5 [&_h2]:mb-3
  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-space-200 [&_h3]:mt-4 [&_h3]:mb-2
  [&_.mw-editsection]:hidden [&_.reference]:hidden [&_.mw-references-wrap]:hidden
  [&_.mw-heading]:hidden [&_sup]:hidden`;

function OfficialPatchCard({ patch, isLatest, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [translatedSections, setTranslatedSections] = useState({});
  const [translating, setTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const pageTitle = `Update:Star_Citizen_Alpha_${patch.version}`;
  const { detail, loading } = useWikiPatchDetail(open ? pageTitle : null);

  const handleTranslate = useCallback(async () => {
    if (Object.keys(translatedSections).length > 0) {
      // Déjà traduit — toggle l'affichage
      setShowTranslated(s => !s);
      return;
    }

    setTranslating(true);
    try {
      const results = {};
      for (const section of detail.sections) {
        results[section.index] = await translateHtml(section.html);
      }
      setTranslatedSections(results);
      setShowTranslated(true);
    } catch {
      // Fallback silencieux
    } finally {
      setTranslating(false);
    }
  }, [detail, translatedSections]);

  return (
    <div className={clsx(
      'card-dark rounded-xl overflow-hidden transition-all',
      isLatest && 'ring-1 ring-cyan-500/30',
    )}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className={clsx(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
          isLatest ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-space-400',
        )}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-space-100">Star Citizen Alpha {patch.version}</h2>
            {isLatest && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Dernière version
              </span>
            )}
          </div>
          <p className="text-sm text-space-400 mt-0.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            v{patch.version}
          </p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-space-400" /> : <ChevronDown className="w-5 h-5 text-space-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-space-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement des patchnotes...</span>
            </div>
          )}

          {!loading && detail && (
            <div className="space-y-4">
              {/* Actions : lien RSI + bouton traduction */}
              <div className="flex items-center gap-4 flex-wrap">
                <a
                  href={`https://robertsspaceindustries.com/en/patch-notes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir sur robertsspaceindustries.com
                </a>
                <button
                  onClick={handleTranslate}
                  disabled={translating}
                  className={clsx(
                    'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all',
                    showTranslated
                      ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                      : 'bg-space-700 text-space-300 hover:bg-space-600 hover:text-space-100',
                    translating && 'opacity-60 cursor-wait',
                  )}
                >
                  {translating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Traduction...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3.5 h-3.5" />
                      {showTranslated ? 'Voir l\'original' : 'Traduire en français'}
                    </>
                  )}
                </button>
              </div>

              {/* Contenu parsé du wiki */}
              {detail.sections.map((section, i) => {
                const html = showTranslated && translatedSections[section.index]
                  ? translatedSections[section.index]
                  : section.html;
                const groups = parseWikiHtml(html);

                return (
                  <div key={i}>
                    {section.index > 0 && (
                      <h3 className="text-base font-semibold text-space-200 mb-3">
                        {section.heading.replace(/<[^>]*>/g, '')}
                      </h3>
                    )}
                    {groups.length > 0 ? (
                      <div className="grid gap-3">
                        {groups.map((group, gi) => (
                          <PatchGroup key={gi} group={group} />
                        ))}
                      </div>
                    ) : (
                      <div
                        className={WIKI_FALLBACK_CLASSES}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Sections supplémentaires disponibles */}
              {detail.allSections.length > 2 && (
                <OfficialExtraSections pageTitle={pageTitle} sections={detail.allSections.slice(2)} />
              )}
            </div>
          )}

          {!loading && !detail && (
            <div className="flex items-center gap-2 py-6 text-space-500">
              <AlertCircle className="w-5 h-5" />
              <span>Impossible de charger les patchnotes pour cette version.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OfficialExtraSections({ pageTitle, sections }) {
  const [expanded, setExpanded] = useState({});
  const { loadSection, sectionCache } = useLazySections();

  const handleToggle = useCallback(async (idx) => {
    if (!expanded[idx]) {
      await loadSection(pageTitle, idx);
    }
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, [expanded, pageTitle, loadSection]);

  return (
    <div className="space-y-2 mt-4 border-t border-space-700 pt-4">
      <p className="text-xs text-space-500 uppercase tracking-wider font-medium mb-2">Sections supplémentaires</p>
      {sections.filter(s => s.heading).map(section => (
        <div key={section.index} className="rounded-lg bg-space-800/50">
          <button
            onClick={() => handleToggle(section.index)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-space-300 hover:text-space-100 transition-colors"
          >
            <span>{section.heading}</span>
            {expanded[section.index]
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded[section.index] && (
            <div className="px-3 pb-3">
              {sectionCache[`${pageTitle}:${section.index}`] ? (
                (() => {
                  const groups = parseWikiHtml(sectionCache[`${pageTitle}:${section.index}`]);
                  return groups.length > 0 ? (
                    <div className="grid gap-3">
                      {groups.map((g, gi) => <PatchGroup key={gi} group={g} />)}
                    </div>
                  ) : (
                    <div
                      className={WIKI_FALLBACK_CLASSES}
                      dangerouslySetInnerHTML={{ __html: sectionCache[`${pageTitle}:${section.index}`] }}
                    />
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 py-3 text-space-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function useLazySections() {
  const [cache, setCache] = useState({});

  const loadSection = useCallback(async (pageTitle, sectionIndex) => {
    const key = `${pageTitle}:${sectionIndex}`;
    if (cache[key]) return;

    const { fetchPatchSection } = await import('../../services/WikiPatchNotesService.js');
    const html = await fetchPatchSection(pageTitle, sectionIndex);
    setCache(prev => ({ ...prev, [key]: html }));
  }, [cache]);

  return { loadSection, sectionCache: cache };
}

const FALLBACK_VERSION = '4.7.0'; // fallback si l'API UEX ne répond pas

function OfficialTab({ liveVersion, versionLoading }) {
  const effectiveVersion = liveVersion || (versionLoading ? null : FALLBACK_VERSION);
  const { patches, loading, error } = useWikiPatchList(effectiveVersion);

  if (loading || versionLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-space-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{versionLoading ? 'Récupération de la version live...' : 'Chargement des versions...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-space-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Impossible de charger la liste des patches.</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-space-400 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Source : starcitizen.tools — {patches.length} versions disponibles
      </p>
      {patches.map((patch, i) => (
        <OfficialPatchCard
          key={patch.version}
          patch={patch}
          isLatest={i === 0}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ONGLET 2 — Nouveautés Wiki (dataset local)
// ══════════════════════════════════════════════════════════════════════════════

function WikiPatchCard({ patch, isLatest, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const navigate = useNavigate();

  const totalItems = useMemo(
    () => patch.changes.reduce((sum, c) => sum + c.items.length, 0),
    [patch.changes]
  );

  const stats = useMemo(() => {
    const s = { added: 0, changed: 0, fixed: 0, removed: 0 };
    for (const c of patch.changes) {
      s[c.type] = (s[c.type] || 0) + c.items.length;
    }
    return s;
  }, [patch.changes]);

  return (
    <div className={clsx(
      'card-dark rounded-xl overflow-hidden transition-all',
      isLatest && 'ring-1 ring-cyan-500/30',
    )}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className={clsx(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
          isLatest ? 'bg-cyan-500/20 text-cyan-400' : 'bg-space-700 text-space-400',
        )}>
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-space-100">{patch.title}</h2>
            {isLatest && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Dernière MAJ
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-space-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(patch.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              v{patch.version}
            </span>
            <span>{totalItems} changements</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 mr-2">
          {stats.added > 0 && <span className="text-xs text-emerald-400 font-medium">+{stats.added}</span>}
          {stats.changed > 0 && <span className="text-xs text-amber-400 font-medium">~{stats.changed}</span>}
          {stats.fixed > 0 && <span className="text-xs text-blue-400 font-medium">{stats.fixed} fix</span>}
          {stats.removed > 0 && <span className="text-xs text-red-400 font-medium">-{stats.removed}</span>}
        </div>

        {open ? <ChevronUp className="w-5 h-5 text-space-400" /> : <ChevronDown className="w-5 h-5 text-space-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-6">
          <p className="text-space-300 text-sm border-l-2 border-cyan-500/40 pl-3">
            {patch.summary}
          </p>

          {patch.highlights?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patch.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/5 ring-1 ring-cyan-500/10">
                  <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-sm text-space-200">{h}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-space-700" />

          <div className="space-y-5">
            {patch.changes.map((change, i) => (
              <ChangeGroup key={`${change.category}-${change.type}-${i}`} change={change} navigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WikiTab() {
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set();
    for (const patch of PATCH_NOTES) {
      for (const change of patch.changes) cats.add(change.category);
    }
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredPatches = useMemo(() => {
    if (filter === 'all') return PATCH_NOTES;
    return PATCH_NOTES.map(patch => ({
      ...patch,
      changes: patch.changes.filter(c => c.category === filter),
    })).filter(patch => patch.changes.length > 0);
  }, [filter]);

  return (
    <div className="space-y-4">
      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const cfg = cat === 'all' ? { label: 'Tout' } : (PATCH_CATEGORIES[cat] || { label: cat });
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === cat
                  ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                  : 'bg-space-800 text-space-400 hover:bg-space-700 hover:text-space-200',
              )}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Patch list */}
      <div className="space-y-4">
        {filteredPatches.map((patch, i) => (
          <WikiPatchCard
            key={patch.version}
            patch={patch}
            isLatest={i === 0}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {filteredPatches.length === 0 && (
        <div className="text-center py-16 text-space-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Aucun changement trouvé pour cette catégorie.</p>
          <button onClick={() => setFilter('all')} className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm">
            Réinitialiser le filtre
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════

export default function Patchnotes() {
  usePageTitle('Patchnotes');
  const { live, loading: versionLoading } = useGameVersion();
  const [activeTab, setActiveTab] = useState('official');

  const totalChanges = useMemo(
    () => PATCH_NOTES.reduce((sum, p) => sum + p.changes.reduce((s, c) => s + c.items.length, 0), 0),
    []
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-space-100 flex items-center gap-3">
            <FileText className="w-7 h-7 text-cyan-400" />
            Patchnotes & Nouveautés
          </h1>
          <p className="text-space-400 mt-1">
            Suivez les changements de Star Citizen version par version
            {live && <span className="ml-2 text-cyan-400 font-medium">— Live: {live}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-space-400">
          <span>{PATCH_NOTES.length} versions wiki</span>
          <span className="text-space-600">•</span>
          <span>{totalChanges} changements suivis</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-space-800/60 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-space-700 text-cyan-400 shadow-sm'
                  : 'text-space-400 hover:text-space-200 hover:bg-space-700/50',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'official' ? <OfficialTab liveVersion={live} versionLoading={versionLoading} /> : <WikiTab />}
    </div>
  );
}
