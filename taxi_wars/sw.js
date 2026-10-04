// Taxi Wars' service worker (upload it next to the game's page; the game registers it, and plays without it too).
// - The page itself comes from the network whenever it can, so a new build shows up at once, and from the cache when there is no
//   network, so the installed app still opens offline.
// - three.js, ez-tree and the fonts come from the cache once they have been fetched.
// - The app's manifest and icons, which the page draws and stores itself (under tw-app/), only ever come from the cache.
const CACHE='tw-v1',APP='tw-app';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE&&k!==APP)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin&&u.pathname.includes('/tw-app/')){e.respondWith(caches.open(APP).then(c=>c.match(r,{ignoreSearch:true})).then(m=>m||fetch(r)));return;}
  if(r.mode==='navigate'||(u.origin===location.origin&&/(\.html?|\/)$/.test(u.pathname))){
    e.respondWith((async()=>{const c=await caches.open(CACHE),key=u.origin+u.pathname;
      try{const n=await fetch(r);if(n&&n.ok)await c.put(key,n.clone());return n;}catch(err){const m=await c.match(key);if(m)return m;throw err;}})());return;}
  if(/(^|\.)cdn\.jsdelivr\.net$|^fonts\.googleapis\.com$|^fonts\.gstatic\.com$/.test(u.hostname)){
    e.respondWith((async()=>{const c=await caches.open(CACHE),m=await c.match(r);if(m)return m;const n=await fetch(r);if(n&&(n.ok||n.type==='opaque'))await c.put(r,n.clone());return n;})());}});
