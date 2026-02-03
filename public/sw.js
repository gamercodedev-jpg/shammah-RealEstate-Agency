const CACHE_NAME = 'shamah-pwa-v2';
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json', '/icons/icon-192.svg', '/icons/icon-512.svg'];

// Install: pre-cache important resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Take over immediately to reduce stale-first-load issues after deploys.
  self.skipWaiting();
});

// Activate: clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Respond with cached resources, and use stale-while-revalidate for images and static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // App shell / navigation requests: serve index.html from cache first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For image requests, use stale-while-revalidate caching for faster loads
  if (url.pathname.startsWith('/icons') || event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request).then((res) => {
            try {
              cache.put(event.request, res.clone());
            } catch (err) {}
            return res;
          }).catch(() => cached);
          return cached || networkFetch;
        }),
      )
    );
    return;
  }

  // For other requests (css/js), try cache first then network and update cache
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        try {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
        } catch (err) {}
        return res;
      }).catch(() => cached);
    })
  );
});

// Allow the page to ask the SW to skip waiting and activate
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
