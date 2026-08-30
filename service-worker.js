const CACHE_VERSION = "aitana-pwa-v14";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const NETWORK_CACHE = `${CACHE_VERSION}-network`;

const ESSENTIAL_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/revision-auth.js",
  "/supabase-config.js",
  "/manifest.webmanifest",
  "/img/logo%20de%20aitana.jpeg",
  "/img/apple-touch-icon.png",
  "/img/icon-192.png",
  "/img/icon-512.png",
  "/img/icon-maskable-512.png",
  "/img/entregas-01-rostro-difuminado.png",
  "/img/entregas-02-rostro-difuminado.png",
  "/img/entregas-03-rostro-difuminado.png"
];

const ICON_ASSETS = new Set([
  "/img/logo%20de%20aitana.jpeg",
  "/img/apple-touch-icon.png",
  "/img/icon-192.png",
  "/img/icon-512.png",
  "/img/icon-maskable-512.png"
]);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(ESSENTIAL_FILES))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("aitana-pwa-") && ![STATIC_CACHE, NETWORK_CACHE].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function networkFirst(request) {
  const cache = await caches.open(NETWORK_CACHE);

  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    const staticCache = await caches.open(STATIC_CACHE);
    const staticFallback = request.mode === "navigate"
      ? await staticCache.match("/index.html")
      : await staticCache.match(request);

    if (staticFallback) return staticFallback;
    throw error;
  }
}

async function cacheFirstIcon(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || ["style", "script"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (ICON_ASSETS.has(url.pathname)) {
    event.respondWith(cacheFirstIcon(request));
  }
});
