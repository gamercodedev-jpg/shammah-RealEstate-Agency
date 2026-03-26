self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Lightweight fetch handler — allows app shell caching if needed
// Removed no-op fetch handler to avoid runtime overhead. If you need request
// interception for caching/offline support, implement a targeted handler here.

// Basic sync-like fallback: when a client posts a message 'flushQueue', attempt to fetch queued reports
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FLUSH_QUEUE') {
    // SW cannot access window localStorage; delegate to client
  }
});
