import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppActions, useTheme } from '../../core/StateManager.jsx';
import { SearchEngine, SEARCH_INDICES } from '../../core/SearchEngine.js';
import { debounce } from '../../utils/helpers.js';
import { DEBOUNCE_SEARCH } from '../../utils/constants.js';
import { useServerStatus } from '../../hooks/useServerStatus.js';
import clsx from 'clsx';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  X,
  Rocket,
  TrendingUp,
  MapPin,
  BookOpen,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const RESULT_ICONS = {
  ships: Rocket,
  commodities: TrendingUp,
  stations: MapPin,
  guides: BookOpen,
  factions: null,
  systems: null,
};

const RESULT_LABELS = {
  ships: 'Vaisseaux',
  commodities: 'Commodités',
  stations: 'Stations',
  guides: 'Guides',
  factions: 'Factions',
  systems: 'Systèmes',
};

const RESULT_PATHS = {
  ships: '/vaisseaux',
  commodities: '/commerce',
  stations: '/systemes/stations',
  guides: '/guides',
  factions: '/factions',
  systems: '/systemes',
};

const STATUS_CONFIG = {
  operational: {
    label: 'En ligne',
    dot: 'bg-success-400 animate-pulse',
    badge: 'bg-success-500/10 border-success-500/20 text-success-400',
  },
  degraded: {
    label: 'Dégradé',
    dot: 'bg-yellow-400 animate-pulse',
    badge: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  },
  outage: {
    label: 'Panne',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
  unknown: {
    label: '?',
    dot: 'bg-slate-400',
    badge: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  },
};

/** Mini widget statut serveur RSI avec tooltip sur hover */
function ServerStatusBadge() {
  const { status, description, components, loading, refresh } = useServerStatus();
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={refresh}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
          cfg.badge,
          loading && 'opacity-60'
        )}
        title="Cliquer pour rafraîchir"
      >
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <div className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
        )}
        {cfg.label}
      </button>

      {/* Tooltip serveurs */}
      {showTooltip && !loading && components.length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-space-800 border border-space-400/30 rounded-xl shadow-card-hover z-50 p-3 animate-fade-in">
          <p className="text-xs font-semibold text-slate-300 mb-2">Serveurs RSI</p>
          {components.map(c => {
            const cCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.unknown;
            return (
              <div key={c.name} className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-400">{c.name}</span>
                <span className={clsx('flex items-center gap-1 text-xs', cCfg.badge.split(' ').pop())}>
                  <div className={clsx('w-1.5 h-1.5 rounded-full', cCfg.dot)} />
                  {cCfg.label}
                </span>
              </div>
            );
          })}
          <p className="text-xs text-slate-600 mt-2 border-t border-space-400/20 pt-2">{description}</p>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { ui } = useAppState();
  const { toggleSidebar, notify } = useAppActions();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query) => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const results = SearchEngine.searchAll(query, { limitPerIndex: 4 });
        setSearchResults(results);
        setIsLoading(false);
      } else {
        setSearchResults({});
      }
    }, DEBOUNCE_SEARCH)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleResultClick = (type, item) => {
    const path = RESULT_PATHS[type];
    if (type === 'ships') navigate(`/vaisseaux/${item.id}`);
    else if (type === 'guides') navigate(`/guides/${item.id}`);
    else if (type === 'factions') navigate(`/factions/${item.id}`);
    else if (path) navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const hasResults = Object.values(searchResults).some(r => r.length > 0);
  const totalResults = Object.values(searchResults).reduce((sum, r) => sum + r.length, 0);

  return (
    <header className="h-16 border-b border-space-400/20 bg-space-900/80 backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="btn-ghost p-2 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div ref={searchRef} className="flex-1 max-w-xl relative">
        <div
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
            isSearchOpen
              ? 'bg-space-800 border-cyan-500/50 shadow-glow-sm'
              : 'bg-space-800/50 border-space-400/30 hover:border-space-300/40'
          )}
        >
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Rechercher vaisseaux, commodités, stations..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults({}); }}
              className="text-slate-500 hover:text-slate-300 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono bg-space-700 text-slate-500 border border-space-400/30">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Search dropdown */}
        {isSearchOpen && (searchQuery.length >= 2 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-space-800 border border-space-400/30 rounded-xl shadow-card-hover z-50 overflow-hidden animate-fade-in">
            {isLoading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Recherche en cours...</div>
            ) : hasResults ? (
              <div className="max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-slate-500 border-b border-space-400/20">
                  {totalResults} résultat{totalResults > 1 ? 's' : ''} pour "{searchQuery}"
                </div>
                {Object.entries(searchResults).map(([type, results]) => {
                  if (!results.length) return null;
                  const Icon = RESULT_ICONS[type];
                  return (
                    <div key={type}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-space-900/40">
                        {RESULT_LABELS[type]}
                      </div>
                      {results.map(({ item }) => (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(type, item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-space-700/50 transition-colors text-left"
                        >
                          {Icon && <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-slate-200 truncate">{item.name}</div>
                            {item.manufacturer && (
                              <div className="text-xs text-slate-500">{item.manufacturer} • {item.role}</div>
                            )}
                            {item.system && (
                              <div className="text-xs text-slate-500">{item.type} • {item.system}</div>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Aucun résultat pour "{searchQuery}"</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <button
          className="relative btn-ghost p-2"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {ui.notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>

        {/* Server status — live depuis RSI API */}
        <ServerStatusBadge />
      </div>
    </header>
  );
}
