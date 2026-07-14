const CACHE_NAME = 'chamados-ti-shell-v2';
const APP_SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Dados autenticados nunca podem ir para o cache compartilhado do navegador.
  // No desenvolvimento, a API é exposta pelo proxy em /backend; em produção,
  // pode ser acessada diretamente por /api.
  const isApiRequest =
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/backend' ||
    url.pathname.startsWith('/backend/');

  if (request.method !== 'GET' || isApiRequest) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })),
    );
  }
});
