const CACHE_NAME = "bret-siers-v17";
const BASE = "/bretsiers.github.io/";
const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "profile.jpg",
  BASE + "New Beginning.mp3",
  BASE + "Step Toward Home.mp3",
  BASE + "Day After Day.mp3",
  BASE + "Life Like Easter.mp3",
  BASE + "Stars in the Sky.mp3",
  BASE + "People.mp3",
  BASE + "Hope in the Rain.mp3",
  BASE + "Bucket List.mp3",
  BASE + "privacy.html",
  BASE + "crew.html",
  BASE + "crew-group.html",
  BASE + "login.html",
  BASE + "profile.html",
  BASE + "feed.html",
  BASE + "auth.js",
  BASE + "firebase-config.js"
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