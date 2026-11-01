/**
 * sw.js - Service Worker for "אוֹתִיּוֹת וְקַסְמִים"
 * Enables offline play and Progressive Web App (PWA) store readiness.
 */

const CACHE_NAME = 'hebrew-reading-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './reading-data.js',
  './sound-effects.js',
  './app.js',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache external fonts if fetched
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});
