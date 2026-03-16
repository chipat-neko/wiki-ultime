import React, { useState, useEffect } from 'react';
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
  Heart,
  AlertTriangle,
  FlaskConical,
} from 'lucide-react';

const SIDEBAR_SECTIONS_KEY = 'sc_sidebar_sections';
const MISSION_STACK_KEY = 'sc_mission_stack';

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
      { path: '/vaisseaux',         label: 'Base de Vaisseaux',      icon: Rocket        },
      { path: '/vaisseaux/comparer', label: 'Comparateur',           icon: ArrowLeftRight },
      { path: '/flotte',            label: 'Gestionnaire de Flotte', icon: Anchor        },
      { path: '/flotte/analyse',    label: 'Analyse de Flotte',      icon: Zap           },
      { path: '/fabricants',        label: 'Fabricants',             icon: Factory       },
      { path: '/composants',        label: 'Composants Vaisseaux',   icon: Cpu           },
      { path: '/armes-vaisseaux',   label: 'Armes de Vaisseaux',     icon: Target        },
      { path: '/loadout',           label: 'Constructeur de Loadout', icon: Crosshair, isNew: true },
      { path: '/qt-drives',         label: 'Propulseurs QT',          icon: Zap,        isNew: true },
      { path: '/assurance',         label: 'Assurance & Réclamation', icon: Shield,     isNew: true },
      { path: '/dps-calc',          label: 'Calculateur DPS',         icon: Zap,        isNew: true },
      { path: '/systemes-vaisseau', label: 'Systèmes Vaisseau',        icon: Cpu,        isNew: true },
    ],
  },
  {
    title: 'Missions',
    items: [
      { path: '/missions/base',        label: 'Catalogue de Missions', icon: Server        },
      { path: '/missions',             label: 'Planificateur',         icon: Target        },
      { path: '/missions/empilement',  label: "IA d'Empilement",       icon: Layers,       stackBadge: true },
      { path: '/missions/tracker',     label: 'Suivi Missions',        icon: ClipboardList },
      { path: '/missions/calculateur', label: 'Calculateur',           icon: Calculator    },
    ],
  },
  {
    title: 'Commerce & Trade',
    items: [
      { path: '/commerce',            label: 'Planificateur',      icon: TrendingUp },
      { path: '/commerce/cargo',      label: 'Optimiseur Cargo',   icon: Package    },
      { path: '/commerce/calculateur', label: 'Calculateur',       icon: Calculator },
      { path: '/routes',              label: 'Optimiseur de Routes',    icon: Route      },
      { path: '/profits',             label: 'Comparateur Rentabilité', icon: TrendingUp, isNew: true },
      { path: '/commodites',          label: 'Suivi des Commodités',    icon: Package,    isNew: true },
    ],
  },
  {
    title: 'Exploration & Univers',
    items: [
      { path: '/systemes',          label: 'Systèmes Stellaires', icon: Globe      },
      { path: '/systemes/planetes', label: 'Planètes & Lunes',    icon: Navigation },
      { path: '/systemes/stations', label: 'Stations & Villes',   icon: Building   },
      { path: '/locations',         label: 'Locations & POI',     icon: Mountain   },
      { path: '/factions',          label: 'Factions',            icon: Shield     },
      { path: '/npcs',              label: 'PNJ & Marchands',     icon: Users,      isNew: true },
    ],
  },
  {
    title: 'Activités',
    items: [
      { path: '/minage',      label: 'Minage',              icon: Gem     },
      { path: '/salvage',     label: 'Salvage',             icon: Recycle },
      { path: '/artisanat',   label: 'Artisanat',           icon: Hammer, isNew: true },
      { path: '/engineering', label: 'Engineering',         icon: Wrench, isNew: true },
      { path: '/vehicules',   label: 'Véhicules Terrestres', icon: Car         },
      { path: '/raffinerie',  label: 'Calculateur Raffinerie', icon: FlaskConical, isNew: true },
    ],
  },
  {
    title: 'Équipement FPS',
    items: [
      { path: '/equipement',  label: 'Armes & Armures',       icon: Crosshair },
      { path: '/items',       label: 'Trouveur d\'Objets',    icon: Package,  isNew: true },
      { path: '/fps-loadout',     label: 'Builder Équipement FPS', icon: Shield,  isNew: true },
      { path: '/armures/comparer', label: 'Comparateur Armures',    icon: Shield,  isNew: true },
    ],
  },
  {
    title: 'Mécaniques de Jeu',
    items: [
      { path: '/crimestat', label: 'CrimeStat',         icon: AlertTriangle, isNew: true },
      { path: '/medical',   label: 'Médical & Santé',  icon: Heart,         isNew: true },
      { path: '/bounty',    label: 'Chasse à la Prime', icon: Crosshair,    isNew: true },
      { path: '/spawn',     label: 'Spawn & Hôpitaux',  icon: Heart,        isNew: true },
      { path: '/piraterie', label: 'Piraterie & Outlaw', icon: AlertTriangle, isNew: true },
    ],
  },
  {
    title: 'Guides & Ressources',
    items: [
      { path: '/guides', label: 'Guides de Jeu',  icon: BookOpen },
      { path: '/outils', label: 'Outils de Jeu',  icon: Wrench   },
      { path: '/lore',   label: 'Galactapédie',   icon: BookOpen, isNew: true },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { path: '/favoris',    label: 'Favoris',           icon: Star        },
      { path: '/reputation', label: 'Réputation',        icon: Award       },
      { path: '/historique', label: 'Historique',        icon: Clock       },
      { path: '/evenements', label: 'Événements In-Game', icon: Bell       },
      { path: '/personnage', label: 'Tracker Personnage', icon: User,       isNew: true },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { path: '/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
];

function getDefaultSections() {
  return NAV_SECTIONS.reduce((acc, s) => ({ ...acc, [s.title]: true }), {});
}

function loadSavedSections() {
  try {
    const raw = localStorage.getItem(SIDEBAR_SECTIONS_KEY);
    if (!raw) return getDefaultSections();
    const parsed = JSON.parse(raw);
    // Merge avec les defaults pour ne pas perdre de nouvelles sections
    return { ...getDefaultSections(), ...parsed };
  } catch {
    return getDefaultSections();
  }
}

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
  const [expandedSections, setExpandedSections] = useState(loadSavedSections);
  const [missionStackCount, setMissionStackCount] = useState(0);
  const location = useLocation();
  const isCollapsed = ui.sidebarCollapsed;

  // Lire le count de missions dans le stack depuis localStorage
  useEffect(() => {
    function readStackCount() {
      try {
        const stack = JSON.parse(localStorage.getItem(MISSION_STACK_KEY) || '[]');
        setMissionStackCount(Array.isArray(stack) ? stack.length : 0);
      } catch {
        setMissionStackCount(0);
      }
    }
    readStackCount();
    // Polling léger pour détecter les changements depuis d'autres composants
    const interval = setInterval(readStackCount, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (title) => {
    if (!isCollapsed) {
      setExpandedSections(prev => {
        const next = { ...prev, [title]: !prev[title] };
        try {
          localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
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
              <div className="text-xs text-slate-500">v1.0.0 • Alpha 4.7</div>
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
                  <span>{section.title}</span>
                  <ChevronRight
                    className={clsx(
                      'w-3 h-3 transition-transform duration-200',
                      expandedSections[section.title] && 'rotate-90'
                    )}
                  />
                </button>
              )}

              {/* Nav items */}
              {(isCollapsed || expandedSections[section.title]) && (
                <ul className={clsx('space-y-0.5', !isCollapsed && 'px-2')}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/tableau-de-bord' && location.pathname.startsWith(item.path));
                    const showStackBadge = item.stackBadge && missionStackCount > 0;

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
                            <>
                              <span className="text-sm font-medium truncate flex-1">{item.label}</span>
                              {/* Badge NEW */}
                              {item.isNew && (
                                <span className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 leading-none">
                                  NEW
                                </span>
                              )}
                              {/* Badge stack missions */}
                              {showStackBadge && (
                                <span className="flex-shrink-0 min-w-[18px] text-center text-xs font-bold px-1 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 leading-none">
                                  {missionStackCount}
                                </span>
                              )}
                            </>
                          )}
                          {/* Badge stack missions en mode collapsed */}
                          {isCollapsed && showStackBadge && (
                            <span className="absolute top-0.5 right-0.5 min-w-[14px] text-center text-xs font-bold px-0.5 rounded-full bg-orange-500 text-white leading-none text-[10px]">
                              {missionStackCount}
                            </span>
                          )}
                          {isActive && !isCollapsed && !item.isNew && !showStackBadge && (
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
