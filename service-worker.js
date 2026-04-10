const CACHE_NAME = "bret-siers-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/profile.jpg",
  "/New Beginning.mp3",
  "/Step Toward Home.mp3",
  "/Day After Day.mp3",
  "/Life Like Easter.mp3",
  "/Stars in the Sky.mp3",
  "/People.mp3",
  "/Hope in the Rain.mp3",
  "/Bucket List.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});