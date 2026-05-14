const CACHE = 'brokedian-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Cache-first for core assets, network-first for others
  if (ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  } else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
  }
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Brokedian', body: 'Check your income status' };
  const options = {
    body: data.body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="%237c6ef5"/><text x="96" y="130" font-size="100" text-anchor="middle" fill="white">💼</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="%237c6ef5"/><text x="96" y="130" font-size="100" text-anchor="middle" fill="white">💼</text></svg>',
    vibrate: [100, 50, 100],
    data: { url: './' }
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});
