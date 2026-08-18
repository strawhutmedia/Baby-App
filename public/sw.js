// Offline support: cache app shell and assets so First Bites works with no connection.
// BASE is derived from the registration scope so the same worker serves the app
// at first100.baby/ and at strawhutmedia.github.io/Baby-App/.
const CACHE = 'first-bites-v2'
const BASE = self.registration.scope

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([BASE])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return

  // Navigations: network first so updates land, cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(BASE, copy))
          return res
        })
        .catch(() => caches.match(BASE)),
    )
    return
  }

  // Hashed assets: cache first (immutable), fill cache on miss.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy))
          return res
        }),
    ),
  )
})
