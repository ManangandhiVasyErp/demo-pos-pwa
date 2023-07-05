const CACHE_NAME = "POS-Demo";
const urlsToCache = [
  "index.html",
  "/",
  "/static/js/bundle.js",
  "/static/css/main.b1aff12a.css",
  "/static/js/main.d599a805.js",
  "/static/js/main.126086b7.js",
  "/favicon.ico",
  "/manifest.json"
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
        console.error('sw: cache.addAll');
        for (let i of urlsToCache) {
          try {
            addedCache = await cache.add(i);
          } catch (err) {
            console.warn('sw: cache.add',i);
          }
        }
      }
  
      return addedCache;
    })
  );
  console.log("service worker added")
});

// // Listen for requests
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then(() => {
//       return fetch(event.request).catch(() => caches.match("offline.html"));
//     })
//   );
// });

// self.addEventListener("fetch", (event) => {
//     event.respondWith(
//       caches.open(CACHE_NAME)
//         .then((cache) => {
//           return fetch(event.request)
//             .then((response) => {
//               // Update the cache with the new response
//               cache.put(response.clone());
//               return response;
//             })
//             .catch(() => {
//               // If the network request fails, serve the cached resource
//               return cache.match(event.request);
//             });
//         })
//     );
//   });

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
