/**
 * Service Worker for Portfolio Site
 * Implements caching strategy for static assets and offline support
 */

const CACHE_NAME = 'portfolio-v1';
const RUNTIME_CACHE = 'portfolio-runtime-v1';
const VIDEO_CACHE = 'portfolio-videos-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/robots.txt',
    '/Images/cropped_circle_image.png'
];

// Video files to cache selectively
const VIDEO_ASSETS = [
    '/Videos/galaxy.mp4',

    '/Videos/hero-video.mp4'
];

/**
 * Install Event: Cache static assets
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        }).catch(err => {
            console.warn('Cache installation failed:', err);
        })
    );
    self.skipWaiting();
});

/**
 * Activate Event: Clean up old caches
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== RUNTIME_CACHE && 
                        cacheName !== VIDEO_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

/**
 * Fetch Event: Implement caching strategy
 * - Static assets: Cache first
 * - API calls: Network first
 * - Videos: Cache first with size limit
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests (CDN, APIs)
    if (!url.origin.includes(self.location.origin) && 
        !url.pathname.includes('/Videos/') &&
        !url.pathname.includes('/Images/')) {
        return;
    }

    // Video files: Cache first strategy
    if (url.pathname.endsWith('.mp4') || url.pathname.includes('/Videos/')) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(VIDEO_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                }).catch(() => {
                    return caches.match('/Videos/');
                });
            })
        );
        return;
    }

    // Static assets: Cache first strategy
    if (url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname === '/' ||
        url.pathname.endsWith('.html')) {
        event.respondWith(
            caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                }).catch(() => {
                    // Return offline fallback
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                    return null;
                });
            })
        );
        return;
    }

    // Default: Network first strategy
    event.respondWith(
        fetch(request).then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(request, responseClone);
            });
            return response;
        }).catch(() => {
            return caches.match(request).then(response => {
                return response || new Response('Offline - Content unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});

/**
 * Message Event: Handle messages from clients
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(RUNTIME_CACHE);
        caches.delete(VIDEO_CACHE);
    }
});
