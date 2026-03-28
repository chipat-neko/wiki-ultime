/**
 * NotificationManager — Gestionnaire de notifications in-app
 * Stocke dans localStorage (sc_notifications), max 100 entrées FIFO.
 */

const STORAGE_KEY = 'sc_notifications';
const MAX_NOTIFICATIONS = 100;

class NotificationManager {
  constructor() {
    this._listeners = new Set();
  }

  /** Récupère toutes les notifications depuis localStorage */
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Persiste les notifications */
  _save(notifications) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // localStorage plein — on ignore silencieusement
    }
    this._notify();
  }

  /** Ajoute une notification. Types: price_alert, event_alert, patchnote, system */
  add({ type, title, message, link }) {
    const notifications = this.getAll();
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: type || 'system',
      title,
      message,
      timestamp: Date.now(),
      read: false,
      ...(link ? { link } : {}),
    };
    notifications.unshift(notification);
    // FIFO : garder max 100
    if (notifications.length > MAX_NOTIFICATIONS) {
      notifications.length = MAX_NOTIFICATIONS;
    }
    this._save(notifications);
    return notification;
  }

  /** Marque une notification comme lue */
  markRead(id) {
    const notifications = this.getAll();
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this._save(notifications);
    }
  }

  /** Marque toutes les notifications comme lues */
  markAllRead() {
    const notifications = this.getAll();
    notifications.forEach(n => { n.read = true; });
    this._save(notifications);
  }

  /** Retourne les notifications non lues */
  getUnread() {
    return this.getAll().filter(n => !n.read);
  }

  /** Nombre de notifications non lues */
  getUnreadCount() {
    return this.getUnread().length;
  }

  /** Efface toutes les notifications */
  clear() {
    this._save([]);
  }

  /** Souscrit aux changements */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /** Notifie les listeners */
  _notify() {
    this._listeners.forEach(fn => fn());
  }
}

/** Singleton exporté */
const notificationManager = new NotificationManager();
export default notificationManager;
