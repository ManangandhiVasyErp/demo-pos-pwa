const CACHE_NAME = "POS-Demo";
const urlsToCache = ["index.html", "/", "/static/js/bundle.js",];

const self = this;

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");

      return cache.addAll(urlsToCache);
    })
  );
});

// // Listen for requests
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then(() => {
//       return fetch(event.request).catch(() => caches.match("offline.html"));
//     })
//   );
// });

self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              // Update the cache with the new response
              cache.put(response.clone());
              return response;
            })
            .catch(() => {
              // If the network request fails, serve the cached resource
              return cache.match(event.request);
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
