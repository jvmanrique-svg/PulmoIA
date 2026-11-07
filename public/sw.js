/**
 * Service Worker para PulmoIA - Soporte Offline PWA
 */
const CACHE_NAME = 'pulmoia-v1-cache';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Instalación: cachear archivos fundamentales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Algunos recursos no se pudieron precachear en sw install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación: purgar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estrategia Network-First para navegación, Stale-While-Revalidate para assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // No interceptar peticiones de extensiones de navegador ni APIs externas no cacheables
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Peticiones de la misma app (HTML / JS / CSS / assets)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Si la red falla y no hay en caché, devolver index.html si es navegación
            if (req.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Peticiones de librerías CDN / Fuentes
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || url.hostname.includes('unpkg.com')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});
