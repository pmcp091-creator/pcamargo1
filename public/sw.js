const CACHE_NAME = 'vocacion-app-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logos/legado.png',
  '/logos/grupo_energia_bogota.png',
  '/logos/acdi.png',
  '/logos/promigas.png',
  '/logos/enlaza.png',
  '/logos/biz_nation.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Estrategia: responder con caché si existe; si no, buscar en la red y guardar copia
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        return networkResponse;
      }).catch(() => {
        // Fallback al index.html si navega sin red
        if (e.request.mode === 'navigate') {
          return caches.match('/') || caches.match('/index.html');
        }
      });
    })
  );
});
