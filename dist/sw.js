const CACHE_PREFIX='bridge-offline-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=CACHE_PREFIX+'github-v13-selection-grammar';
const ASSETS=['./','./index.html','./style.css','./app.js','./grammar.js','./compromise.js','./compromise-LICENSE.txt','./logic.js','./questions.js','./choice-practice.js','./learning.js','./library-tools.js','./pwa.js','./cards.json','./offline-translations.json','./practice-sentences.json','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png','./pronunciation-LICENSE.txt'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(CACHE_PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 const asset=ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname);
 if(!asset&&event.request.mode!=='navigate')return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;if(event.request.mode==='navigate'){try{return await fetch(event.request)}catch{return (await cache.match('./index.html'))||Response.error()}}return fetch(event.request)})());
});
self.addEventListener('message',event=>{if(event.data?.type==='OFFLINE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const ready=(await Promise.all(ASSETS.map(path=>cache.match(path)))).every(Boolean);event.ports[0]?.postMessage({ready,version:CACHE})})())});
