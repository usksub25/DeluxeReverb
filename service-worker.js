const CACHE_NAME = 'fender-amp-finder-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/judge.js',
  './js/storage.js',
  './data/amp_models.json',
  './data/price_rules.json',
  './data/buying_checklist.json',
  './data/knowledge/deluxe_reverb.md',
  './data/knowledge/princeton_reverb.md',
  './data/knowledge/bassman.md',
  './data/knowledge/blackface_vs_silverface.md',
  './data/knowledge/drri_guide.md',
  './data/knowledge/speaker_guide.md',
  './data/knowledge/transformer_guide.md',
  './data/knowledge/resale_guide.md',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
