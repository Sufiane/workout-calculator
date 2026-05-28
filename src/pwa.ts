export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#4f8cff" />
  <g fill="#ffffff">
    <rect x="96" y="216" width="40" height="80" rx="12" />
    <rect x="136" y="186" width="40" height="140" rx="12" />
    <rect x="336" y="186" width="40" height="140" rx="12" />
    <rect x="376" y="216" width="40" height="80" rx="12" />
    <rect x="176" y="240" width="160" height="32" rx="8" />
  </g>
</svg>`;

export const MANIFEST = JSON.stringify({
    name: 'Workout Calculator',
    short_name: 'Workout',
    description: 'Compute your full bench program from any one input and track progress.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f1115',
    theme_color: '#0f1115',
    icons: [
        {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
        },
    ],
});

export const SERVICE_WORKER = `const CACHE = 'workout-v1';
const SHELL = ['/', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') {
    return;
  }

  // API responses are user/session specific — always go to network.
  if (url.pathname.indexOf('/api/') === 0) {
    return;
  }

  // App shell: network first, fall back to cached page when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match('/');
      })
    );
    return;
  }

  // Static assets: cache first.
  event.respondWith(
    caches.match(event.request).then(function (hit) {
      return hit || fetch(event.request);
    })
  );
});
`;
