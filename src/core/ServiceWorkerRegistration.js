// ─── Service Worker Registration ───────────────────────────────────────────

const SW_URL = '/sw.js';

export function register() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available — notify user
                console.log('[SW] Nouvelle version disponible.');
                dispatchEvent(
                  new CustomEvent('sw-update-available', { detail: registration })
                );
              } else {
                console.log('[SW] Contenu mis en cache pour utilisation hors-ligne.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\u2019enregistrement :', error);
      });
  });
}

export function unregister() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister();
  });
}
