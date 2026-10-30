// Cache public application assets only. Never cache API, documents, audio or identity data.
const VERSION = 'aksara-shell-v2';
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(VERSION).then(c => c.addAll(['/','/aksara.svg','/manifest.webmanifest','/icon-192.png','/icon-512.png','/atmosphere/smoke.webp']))); });
self.addEventListener('activate', event => event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k))))])));
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if(event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
 if(!['/','/aksara.svg','/manifest.webmanifest','/icon-192.png','/icon-512.png','/atmosphere/smoke.webp'].includes(url.pathname) && !url.pathname.startsWith('/assets/')) return;
 event.respondWith(fetch(event.request).then(response => {if(response.ok){const clone=response.clone();caches.open(VERSION).then(c=>c.put(event.request,clone));}return response;}).catch(()=>caches.match(event.request).then(r=>r || Response.error())));
});
