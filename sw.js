const CACHE='clearbudget-pwa-v1';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const CHART='https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(LOCAL);
    try { await cache.add(CHART); } catch(e) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached) return cached;
    try {
      const res=await fetch(event.request);
      const cache=await caches.open(CACHE);
      cache.put(event.request,res.clone()).catch(()=>{});
      return res;
    } catch(e) {
      if(event.request.mode==='navigate') return caches.match('./index.html');
      throw e;
    }
  })());
});
