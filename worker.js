// Versioned cache names
const PRECACHE = 'nit-ai-precache-v2';
const RUNTIME = 'nit-ai-runtime-v1';

// Precache list — include application shell and asset files
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json',
  '/vite.png',
  '/assets/index.css',
  '/assets/index.js',

  // KaTeX fonts and assets (from project tree)
  '/assets/KaTeX_AMS-Regular-BQhdFMY1.woff2',
  '/assets/KaTeX_AMS-Regular-DMm9YOAa.woff',
  '/assets/KaTeX_AMS-Regular-DRggAlZN.ttf',
  '/assets/KaTeX_Caligraphic-Bold-ATXxdsX0.ttf',
  '/assets/KaTeX_Caligraphic-Bold-BEiXGLvX.woff',
  '/assets/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2',
  '/assets/KaTeX_Caligraphic-Regular-CTRA-rTL.woff',
  '/assets/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2',
  '/assets/KaTeX_Caligraphic-Regular-wX97UBjC.ttf',
  '/assets/KaTeX_Fraktur-Bold-BdnERNNW.ttf',
  '/assets/KaTeX_Fraktur-Bold-BsDP51OF.woff',
  '/assets/KaTeX_Fraktur-Bold-CL6g_b3V.woff2',
  '/assets/KaTeX_Fraktur-Regular-CB_wures.ttf',
  '/assets/KaTeX_Fraktur-Regular-CTYiF6lA.woff2',
  '/assets/KaTeX_Fraktur-Regular-Dxdc4cR9.woff',
  '/assets/KaTeX_Main-Bold-Cx986IdX.woff2',
  '/assets/KaTeX_Main-Bold-Jm3AIy58.woff',
  '/assets/KaTeX_Main-Bold-waoOVXN0.ttf',
  '/assets/KaTeX_Main-BoldItalic-DxDJ3AOS.woff2',
  '/assets/KaTeX_Main-BoldItalic-DzxPMmG6.ttf',
  '/assets/KaTeX_Main-BoldItalic-SpSLRI95.woff',
  '/assets/KaTeX_Main-Italic-3WenGoN9.ttf',
  '/assets/KaTeX_Main-Italic-BMLOBm91.woff',
  '/assets/KaTeX_Main-Italic-NWA7e6Wa.woff2',
  '/assets/KaTeX_Main-Regular-B22Nviop.woff2',
  '/assets/KaTeX_Main-Regular-Dr94JaBh.woff',
  '/assets/KaTeX_Main-Regular-ypZvNtVU.ttf',
  '/assets/KaTeX_Math-BoldItalic-B3XSjfu4.ttf',
  '/assets/KaTeX_Math-BoldItalic-CZnvNsCZ.woff2',
  '/assets/KaTeX_Math-BoldItalic-iY-2wyZ7.woff',
  '/assets/KaTeX_Math-Italic-DA0__PXp.woff',
  '/assets/KaTeX_Math-Italic-flOr_0UB.ttf',
  '/assets/KaTeX_Math-Italic-t53AETM-.woff2',
  '/assets/KaTeX_SansSerif-Bold-CFMepnvq.ttf',
  '/assets/KaTeX_SansSerif-Bold-D1sUS0GD.woff2',
  '/assets/KaTeX_SansSerif-Bold-DbIhKOiC.woff',
  '/assets/KaTeX_SansSerif-Italic-C3H0VqGB.woff2',
  '/assets/KaTeX_SansSerif-Italic-DN2j7dab.woff',
  '/assets/KaTeX_SansSerif-Italic-YYjJ1zSn.ttf',
  '/assets/KaTeX_SansSerif-Regular-BNo7hRIc.ttf',
  '/assets/KaTeX_SansSerif-Regular-CS6fqUqJ.woff',
  '/assets/KaTeX_SansSerif-Regular-DDBCnlJ7.woff2',
  '/assets/KaTeX_Script-Regular-C5JkGWo-.ttf',
  '/assets/KaTeX_Script-Regular-D3wIWfF6.woff2',
  '/assets/KaTeX_Script-Regular-D5yQViql.woff',
  '/assets/KaTeX_Size1-Regular-C195tn64.woff',
  '/assets/KaTeX_Size1-Regular-Dbsnue_I.ttf',
  '/assets/KaTeX_Size1-Regular-mCD8mA8B.woff2',
  '/assets/KaTeX_Size2-Regular-B7gKUWhC.ttf',
  '/assets/KaTeX_Size2-Regular-Dy4dx90m.woff2',
  '/assets/KaTeX_Size2-Regular-oD1tc_U0.woff',
  '/assets/KaTeX_Size3-Regular-CTq5MqoE.woff',
  '/assets/KaTeX_Size3-Regular-DgpXs0kz.ttf',
  '/assets/KaTeX_Size4-Regular-BF-4gkZK.woff',
  '/assets/KaTeX_Size4-Regular-DWFBv043.ttf',
  '/assets/KaTeX_Size4-Regular-Dl5lxZxV.woff2',
  '/assets/KaTeX_Typewriter-Regular-C0xS9mPB.woff',
  '/assets/KaTeX_Typewriter-Regular-CO6r4hn1.woff2',
  '/assets/KaTeX_Typewriter-Regular-D3Ib7_Hf.ttf'
];

// Utility: check if request is navigation (SPA) request
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept') &&
      request.headers.get('accept').includes('text/html'));
}

// Install: pre-cache application shell and assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (!currentCaches.includes(k)) {
            return caches.delete(k);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: route requests with sensible caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Navigation requests (SPA) — serve cached index.html, fallback to network
  if (isNavigationRequest(request)) {
    event.respondWith(
      caches.match('/index.html').then(cached => {
        if (cached) {
          // try network in background to update cache
          fetch('/index.html').then(resp => {
            if (resp && resp.ok) {
              caches.open(PRECACHE).then(cache => cache.put('/index.html', resp.clone()));
            }
          }).catch(() => {/* network update failed; ignore */});
          return cached;
        }
        // not in cache — network first
        return fetch(request).then(networkResponse => {
          // cache the navigation response for offline
          if (networkResponse && networkResponse.ok) {
            caches.open(PRECACHE).then(cache => cache.put('/index.html', networkResponse.clone()));
          }
          return networkResponse;
        }).catch(() => {
          // final fallback: respond with a simple offline response if desired
          return new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><body><h1>Offline</h1><p>The application is offline.</p></body>', {
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
    );
    return;
  }

  // Same-origin static assets: cache-first with network update (stale-while-revalidate style)
  const isStaticAsset = url.origin === location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.ico')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchAndCache = fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            caches.open(RUNTIME).then(cache => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        }).catch(() => null);

        // Return cached if present, otherwise wait for network
        return cached || fetchAndCache;
      })
    );
    return;
  }

  // Network-first for API calls (example heuristic: path contains /api/)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        // Put a copy in the runtime cache for offline fallback
        if (response && response.ok) {
          caches.open(RUNTIME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // If no cached API response, return a generic fallback
          return new Response(JSON.stringify({ error: 'offline', message: 'Network unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Default: try cache, otherwise network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});

// Listen for messages from the page (e.g., to trigger skipWaiting)
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
