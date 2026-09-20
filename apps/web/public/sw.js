/* WhisperLag service worker — offline-first shell for installable PWA. */
const CACHE = "whisperlag-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App shell / navigation / next chunks: network-first so live code stays fresh.
  if (request.mode === "navigate" || url.pathname.startsWith("/_next/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || (request.mode === "navigate" ? caches.match("/") : undefined))),
    );
    return;
  }

  // Same-origin API GETs: network-first with a stale-cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Other static assets (images, fonts, manifest)
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        }),
    ),
  );
});