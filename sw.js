/* Офлайн-режим: оболочка приложения хранится в кэше. Данные пользователя живут в IndexedDB и кэшем не затрагиваются. */
const VERSION = 'slova-v1.5.0';
const SHELL = ['./', './index.html', './styles.css', './manifest.webmanifest', './js/core.js', './js/db.js', './js/app.js', './js/add.js', './js/pics.js', './js/tg.js', './js/train.js', './js/prefs.js', './js/sets.js', './js/extra.js', './js/grammar.js',
  './lib/xlsx.mini.min.js', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'slova-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // шрифты Google — кэшируем при первом открытии, дальше работают без сети
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open('slova-fonts').then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      try { const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; } catch (err) { return new Response('', { status: 504 }); }
    }));
    return;
  }
  if (url.origin !== location.origin) return; // онлайн-подсказки (перевод, картинки) — всегда из сети
  // своё приложение: сначала сеть (чтобы получать обновления), без сети — из кэша
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
