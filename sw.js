// sw.js — HeliTimer v1.30
const CACHE_NAME = 'heli-v1.30';

const ASSETS = [
    './index.html',
    './manifest.json',
    './sw.js',
    './timer.png'
];

// Install: cache all assets, then activate immediately
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[SW] Pre-caching assets');
                return cache.addAll(ASSETS);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// Activate: delete old caches, take control immediately
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys
                    .filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch: cache-first, fallback to network
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;
            return fetch(event.request).then(function(response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            });
        })
    );
});
