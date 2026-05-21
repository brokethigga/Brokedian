const CACHE_VERSION = 'v12';
const CACHE_NAME = `brokedian-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const ASSETS = ['./', './index.html', './manifest.json', './styles.css?v=16'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k.startsWith('brokedian-') && k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppAsset = isSameOrigin && ASSETS.some(asset => {
    if (asset === './') return url.pathname === '/' || url.pathname.endsWith('/index.html');
    return url.pathname.endsWith(asset.replace('./', ''));
  });

  if (isAppAsset) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      }))
    );
    return;
  }

  if (!isSameOrigin) {
    e.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        fetch(e.request).then(res => {
          cache.put(e.request, res.clone());
          return res;
        }).catch(() => cache.match(e.request).then(cached => cached || Response.error()))
      )
    );
    return;
  }

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
  }
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Brokedian', body: 'Check your income status' };
  const options = {
    body: data.body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="%23007AFF"/><path d="M96 40c-8 0-14 6-14 14v8H62c-8 0-14 6-14 14v72c0 8 6 14 14 14h68c8 0 14-6 14-14V76c0-8-6-14-14-14h-20v-8c0-8-6-14-14-14z" fill="white" opacity=".9"/><rect x="70" y="78" width="52" height="8" rx="4" fill="%23007AFF"/><rect x="70" y="98" width="36" height="8" rx="4" fill="%23007AFF" opacity=".6"/></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="%23007AFF"/><path d="M96 40c-8 0-14 6-14 14v8H62c-8 0-14 6-14 14v72c0 8 6 14 14 14h68c8 0 14-6 14-14V76c0-8-6-14-14-14h-20v-8c0-8-6-14-14-14z" fill="white" opacity=".9"/></svg>',
    vibrate: [100, 50, 100],
    data: { url: './' }
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});
