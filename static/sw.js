// Réseau d'abord, cache ensuite : les pages déjà visitées restent lisibles hors ligne.
const CACHE = "static-demo-v3";
const RACINE = new URL("./", self.location).href;
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.add(RACINE)).catch(() => {})); });
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const rep = await fetch(req);
      if (rep.ok) cache.put(req, rep.clone());
      return rep;
    } catch {
      return (await cache.match(req)) || (await cache.match(RACINE)) || Response.error();
    }
  })());
});
