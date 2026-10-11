const CACHE_VERSION = "aitana-pwa-v28";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const NETWORK_CACHE = `${CACHE_VERSION}-network`;

const ESSENTIAL_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/halloween.css",
  "/halloween.js",
  "/halloween-sounds.js",
  "/audio/halloween-welcome.wav",
  "/audio/haunted-beauty.wav",
  "/assets/halloween/haunted-scene.webp",
  "/assets/halloween/haunted-pink-mobile.webp",
  "/assets/halloween/haunted-desktop.webp",
  "/script.js",
  "/revision-auth.js",
  "/supabase-config.js",
  "/manifest.webmanifest",
  "/img/logo-aitana-192.webp",
  "/img/apple-touch-icon.png",
  "/img/icon-192.png",
  "/img/icon-512.png",
  "/img/icon-maskable-512.png"
];

const ICON_ASSETS = new Set([
  "/img/logo-aitana-192.webp",
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

async function halloweenAudio(request) {
  const path = new URL(request.url).pathname;
  const cache = await caches.open(STATIC_CACHE);
  let response = await cache.match(path);
  if (!response) {
    response = await fetch(path);
    if (response.ok) { try { await cache.put(path, response.clone()); } catch {} }
  }
  const range = request.headers.get("range");
  if (!range || !response.ok) return response;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return response;
  const bytes = await response.arrayBuffer();
  const size = bytes.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": "audio/wav", "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1)
    }
  });
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === "/audio/haunted-beauty.wav" ||
      /^\/audio\/halloween-(welcome|search|favorite|consult|navigate)\.wav$/.test(url.pathname)) {
    // Safari solicita rangos también cuando el audio viene de la caché offline.
    event.respondWith(halloweenAudio(request));
    return;
  }

  if (request.mode === "navigate" || ["style", "script"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (ICON_ASSETS.has(url.pathname) || [
    "/assets/halloween/haunted-scene.webp",
    "/assets/halloween/haunted-pink-mobile.webp",
    "/assets/halloween/haunted-desktop.webp"
  ].includes(url.pathname)) {
    event.respondWith(cacheFirstIcon(request));
  }
});
