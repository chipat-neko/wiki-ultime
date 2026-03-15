import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../core/StateManager.jsx';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NOTIFICATION_STYLES = {
  success: {
    border: 'border-success-500/30',
    bg: 'bg-success-500/10',
    icon: CheckCircle2,
    iconColor: 'text-success-400',
  },
  error: {
    border: 'border-danger-500/30',
    bg: 'bg-danger-500/10',
    icon: AlertCircle,
    iconColor: 'text-danger-400',
  },
  warning: {
    border: 'border-warning-500/30',
    bg: 'bg-warning-500/10',
    icon: AlertTriangle,
    iconColor: 'text-warning-400',
  },
  info: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    icon: Info,
    iconColor: 'text-cyan-400',
  },
};

export default function NotificationStack() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        const style = NOTIFICATION_STYLES[notif.type] || NOTIFICATION_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={notif.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-card-hover backdrop-blur-sm animate-slide-in-right',
              style.bg,
              style.border,
              'bg-space-800/90'
            )}
          >
            <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />
            <p className="flex-1 text-sm text-slate-200">{notif.message}</p>
            <button
              onClick={() => removeNotification(notif.id)}
              className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
