const CACHE_NAME = 'portfolio-v1';
const STATIC_ASSETS = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'Images/cropped_circle_image.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) return caches.delete(key);
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Navigation requests: try network first, fall back to cached index.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          // update cache in background
          caches.open(CACHE_NAME).then((cache) => cache.put('index.html', res.clone()));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // For other requests use stale-while-revalidate: respond with cache if available,
  // then fetch and update cache in background.
  // Don't aggressively cache large media (videos)
  const url = new URL(req.url);
  if (url.pathname.endsWith('.mp4') || url.pathname.includes('/Videos/')) {
    // For videos, prefer network but do not cache large responses here
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // Cache-first for unpkg.com (external assets)
  if (url.hostname && url.hostname.includes('unpkg.com')) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if (res && res.status === 200 && req.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => null))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          // Only cache successful GET responses smaller than 5MB
          if (res && res.status === 200 && req.method === 'GET') {
            const contentLength = res.headers.get('content-length');
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (contentLength && Number(contentLength) < maxSize) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
            }
          }
          return res;
        })
        .catch(() => null);

      return cached || networkFetch;
    })
  );
});
