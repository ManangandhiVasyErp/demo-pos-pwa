const CACHE_NAME = "POS-Demo";
const urlsToCache = [
  "index.html",
  "/",
  "/static/js/bundle.js",
  "/favicon.ico",
  "/manifest.json",
  "/static/css/main.css",
  "/static/js/main.js"
];

const self = this;

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      let addedCache;
      console.log("Opened cache");

      try {
        addedCache = await cache.addAll(urlsToCache);
      } catch (err) {
        console.error("sw: cache.addAll");
        for (let i of urlsToCache) {
          try {
            addedCache = await cache.add(i);
          } catch (err) {
            console.warn("sw: cache.add", i);
          }
        }
      }

      return addedCache;
    })
  );
  console.log("service worker added");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request)
            .then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => {
              return cache.match(event.request);
            })
        );
      });
    })
  );
});

// Activate the SW
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [];
  cacheWhitelist.push(CACHE_NAME);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
