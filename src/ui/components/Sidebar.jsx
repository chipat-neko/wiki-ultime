import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAppState, useAppActions } from '../../core/StateManager.jsx';
import { useAuth, getLevelInfo } from '../../core/AuthContext.jsx';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Rocket,
  Anchor,
  TrendingUp,
  Package,
  Factory,
  Calculator,
  Route,
  Target,
  Layers,
  Globe,
  MapPin,
  Building,
  Users,
  BookOpen,
  Star,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Navigation,
  Server,
  ClipboardList,
  Wrench,
  ArrowLeftRight,
  Award,
  Crosshair,
  Bell,
  Car,
  Cpu,
  Mountain,
  Gem,
  Recycle,
  Hammer,
  User,
  LogIn,
  PlusCircle,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { path: '/tableau-de-bord', label: 'Tableau de Bord', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Vaisseaux & Flotte',
    items: [
      { path: '/vaisseaux', label: 'Base de Vaisseaux', icon: Rocket },
      { path: '/vaisseaux/comparer', label: 'Comparateur', icon: ArrowLeftRight },
      { path: '/fabricants', label: 'Fabricants', icon: Factory },
      { path: '/flotte', label: 'Gestionnaire de Flotte', icon: Anchor },
      { path: '/flotte/analyse', label: 'Analyse de Flotte', icon: Zap },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { path: '/commerce', label: 'Planificateur', icon: TrendingUp },
      { path: '/commerce/cargo', label: 'Optimiseur Cargo', icon: Package },
      { path: '/commerce/calculateur', label: 'Calculateur', icon: Calculator },
    ],
  },
  {
    title: 'Navigation',
    items: [
      { path: '/routes', label: 'Optimiseur de Routes', icon: Route },
    ],
  },
  {
    title: 'Missions',
    items: [
      { path: '/missions',             label: 'Planificateur',   icon: Target        },
      { path: '/missions/empilement',  label: "IA d'Empilement", icon: Layers        },
      { path: '/missions/tracker',     label: 'Suivi Missions',  icon: ClipboardList },
      { path: '/missions/calculateur', label: 'Calculateur',     icon: Calculator    },
    ],
  },
  {
    title: 'Univers',
    items: [
      { path: '/systemes',          label: 'Systèmes Stellaires', icon: Globe       },
      { path: '/systemes/planetes', label: 'Planètes & Lunes',    icon: Navigation  },
      { path: '/systemes/stations', label: 'Stations & Villes',   icon: Building    },
      { path: '/locations',         label: 'Locations & POI',      icon: Mountain    },
      { path: '/factions',          label: 'Factions',             icon: Shield      },
    ],
  },
  {
    title: 'Guides',
    items: [
      { path: '/guides', label: 'Guides de Jeu', icon: BookOpen },
      { path: '/minage', label: 'Guide de Minage', icon: Gem },
      { path: '/salvage', label: 'Guide Salvage', icon: Recycle },
      { path: '/artisanat', label: 'Artisanat (Wikelo)', icon: Hammer },
      { path: '/engineering', label: 'Engineering', icon: Zap },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { path: '/favoris', label: 'Favoris', icon: Star },
      { path: '/reputation', label: 'Réputation', icon: Award },
      { path: '/historique', label: 'Historique', icon: Clock },
    ],
  },
  {
    title: 'Équipement',
    items: [
      { path: '/equipement',     label: 'Armes & Armures FPS',  icon: Crosshair },
      { path: '/armes-vaisseaux', label: 'Armes de Vaisseaux',   icon: Target    },
      { path: '/vehicules',      label: 'Véhicules Terrestres',  icon: Car       },
      { path: '/composants',     label: 'Composants Vaisseaux',  icon: Cpu       },
    ],
  },
  {
    title: 'Événements',
    items: [
      { path: '/evenements', label: 'Événements In-Game', icon: Bell },
    ],
  },
  {
    title: 'Outils',
    items: [
      { path: '/outils', label: 'Outils de Jeu', icon: Wrench },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { path: '/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
];

function UserWidget({ isCollapsed }) {
  const { user, profile, isAdmin, isMod } = useAuth();
  const levelInfo = getLevelInfo(profile?.stars ?? 0);

  if (!user) {
    return (
      <div className={clsx('border-t border-space-400/20 p-2', isCollapsed && 'flex justify-center')}>
        <Link
          to="/connexion"
          title={isCollapsed ? 'Connexion' : undefined}
          className={clsx(
            'flex items-center gap-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-space-700/50 transition-all text-sm',
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
          )}
        >
          <LogIn className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Se connecter</span>}
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-space-400/20 p-2">
      <Link
        to="/profil"
        title={isCollapsed ? profile?.username : undefined}
        className={clsx(
          'flex items-center gap-2 rounded-lg hover:bg-space-700/50 transition-all group',
          isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
        )}
      >
        <div className={clsx(
          'flex-shrink-0 rounded-full flex items-center justify-center font-bold text-xs border',
          isCollapsed ? 'w-7 h-7' : 'w-6 h-6',
          levelInfo.bg, levelInfo.color, 'border-current/20'
        )}>
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{profile?.username}</div>
            <div className={clsx('text-xs truncate', levelInfo.color)}>{levelInfo.name} · {profile?.stars ?? 0}★</div>
          </div>
        )}
        {!isCollapsed && isMod && (
          <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
        )}
      </Link>
      {!isCollapsed && (
        <Link
          to="/contribuer"
          className="flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all text-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Contribuer
        </Link>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { ui } = useAppState();
  const { toggleSidebar, collapseSidebar } = useAppActions();
  const [expandedSections, setExpandedSections] = useState(
    NAV_SECTIONS.reduce((acc, s) => ({ ...acc, [s.title]: true }), {})
  );
  const location = useLocation();
  const isCollapsed = ui.sidebarCollapsed;

  const toggleSection = (title) => {
    if (!isCollapsed) {
      setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {ui.sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 bottom-0 z-30 flex flex-col transition-all duration-300',
          'bg-space-900 border-r border-space-400/20',
          'lg:relative lg:z-auto',
          isCollapsed ? 'w-16' : 'w-64',
          ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={clsx(
          'flex items-center gap-3 px-4 h-16 border-b border-space-400/20 flex-shrink-0',
          isCollapsed && 'justify-center px-2'
        )}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold font-display text-white leading-tight truncate">
                SC COMPANION
              </div>
              <div className="text-xs text-slate-500">v1.0.0 • Alpha 4.6</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 scroll-container">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              {/* Section header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
                >
                  {section.title}
                </button>
              )}

              {/* Nav items */}
              {(isCollapsed || expandedSections[section.title]) && (
                <ul className={clsx('space-y-0.5', !isCollapsed && 'px-2')}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/tableau-de-bord' && location.pathname.startsWith(item.path));

                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                          title={isCollapsed ? item.label : undefined}
                          className={clsx(
                            'flex items-center gap-3 rounded-lg transition-all duration-150 group',
                            isCollapsed ? 'justify-center p-2.5 mx-1' : 'px-3 py-2',
                            isActive
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-space-700/50'
                          )}
                        >
                          <Icon
                            className={clsx(
                              'flex-shrink-0 transition-colors',
                              isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                              isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}
                          />
                          {!isCollapsed && (
                            <span className="text-sm font-medium truncate">{item.label}</span>
                          )}
                          {isActive && !isCollapsed && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Separator between sections */}
              {!isCollapsed && <div className="mx-4 mt-2 border-t border-space-400/10" />}
            </div>
          ))}
        </nav>

        {/* User widget */}
        <UserWidget isCollapsed={isCollapsed} />

        {/* Collapse button */}
        <div className="border-t border-space-400/20 p-2">
          <button
            onClick={collapseSidebar}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-space-700/50 transition-all text-sm',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Déplier la barre' : 'Replier la barre'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Replier</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
