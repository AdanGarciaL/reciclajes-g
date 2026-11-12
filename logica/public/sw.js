const CACHE_NAME = 'ecologica-garcia-ic-v23';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/apple-touch-icon-q66XNoox.png',
  './assets/icon-192--oFsYMjq.png',
  './assets/icon-DBmVwXEj.svg',
  './assets/index-D_d893Iv.js',
  './assets/manifest-i-u5wQwz.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes('custom-chips.json') ||
    event.request.url.includes('restful-api.dev') ||
    event.request.url.includes('ntfy.sh')
  ) {
    return;
  }
  const isDocRequest =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.url.endsWith('/') ||
    event.request.url.endsWith('/index.html');

  event.respondWith(
    fetch(event.request, isDocRequest ? { cache: 'no-cache' } : undefined)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
