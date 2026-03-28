import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationManager from '../../core/NotificationManager.js';
import clsx from 'clsx';
import {
  X,
  Bell,
  TrendingUp,
  Calendar,
  FileText,
  CheckCheck,
  Trash2,
  BellOff,
} from 'lucide-react';

const TYPE_CONFIG = {
  price_alert: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  event_alert: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  patchnote:   { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', dot: 'bg-purple-400' },
  system:      { icon: Bell, color: 'text-cyan-400', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400' },
};

/** Groupe les notifications par date : Aujourd'hui, Hier, Plus ancien */
function groupByDate(notifications) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const groups = { today: [], yesterday: [], older: [] };

  notifications.forEach(n => {
    if (n.timestamp >= todayStart) groups.today.push(n);
    else if (n.timestamp >= yesterdayStart) groups.yesterday.push(n);
    else groups.older.push(n);
  });

  const result = [];
  if (groups.today.length)     result.push({ label: "Aujourd'hui", items: groups.today });
  if (groups.yesterday.length) result.push({ label: 'Hier', items: groups.yesterday });
  if (groups.older.length)     result.push({ label: 'Plus ancien', items: groups.older });
  return result;
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function NotificationPanel({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Charge les notifications et souscrit aux changements
  useEffect(() => {
    const load = () => setNotifications(notificationManager.getAll());
    load();
    const unsub = notificationManager.subscribe(load);
    return unsub;
  }, []);

  // Ferme si clic en dehors du panel
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Délai pour éviter que le clic d'ouverture ne ferme immédiatement
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  // Escape ferme le panel
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleClick = (notif) => {
    notificationManager.markRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    notificationManager.markAllRead();
  };

  const handleClear = () => {
    notificationManager.clear();
  };

  const groups = groupByDate(notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Slide-out panel */}
      <div
        ref={panelRef}
        className={clsx(
          'fixed top-0 right-0 h-full w-full sm:w-96 bg-space-900 border-l border-space-400/20 shadow-2xl z-50',
          'flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-space-400/20">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-200">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-lg hover:bg-space-700"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-space-400/10">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                unreadCount > 0
                  ? 'text-cyan-400 hover:bg-cyan-500/10'
                  : 'text-slate-600 cursor-not-allowed'
              )}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tout marquer comme lu
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Effacer tout
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-space-800 flex items-center justify-center mb-4">
                <BellOff className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium mb-1">Aucune notification</p>
              <p className="text-slate-600 text-sm">
                Les alertes de prix, événements et mises à jour apparaîtront ici.
              </p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.label}>
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-space-800/50 sticky top-0">
                  {group.label}
                </div>
                {group.items.map(notif => {
                  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleClick(notif)}
                      className={clsx(
                        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-space-400/10',
                        notif.read
                          ? 'hover:bg-space-800/50'
                          : 'bg-space-800/30 hover:bg-space-700/50'
                      )}
                    >
                      {/* Icon */}
                      <div className={clsx('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5', cfg.bg)}>
                        <Icon className={clsx('w-4 h-4', cfg.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                          )}
                          <span className={clsx(
                            'text-sm font-medium truncate',
                            notif.read ? 'text-slate-400' : 'text-slate-200'
                          )}>
                            {notif.title}
                          </span>
                        </div>
                        <p className={clsx(
                          'text-xs mt-0.5 line-clamp-2',
                          notif.read ? 'text-slate-600' : 'text-slate-400'
                        )}>
                          {notif.message}
                        </p>
                        <span className="text-xs text-slate-600 mt-1 block">
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
