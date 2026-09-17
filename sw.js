/* DSD 뷰어 오프라인 캐시.
   뷰어는 외부 통신이 없는 단일 HTML이라, 한 번 받아 두면 인터넷 없이도 완전히 동작한다.
   버전을 올리면 옛 캐시를 버리고 새로 받는다. */
const CACHE = 'dsd-viewer-v1';
const ASSETS = [
  '.', 'index.html', 'manifest.webmanifest',
  'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 네트워크 우선, 실패하면 캐시. 오프라인에서도 열리고 갱신도 반영된다. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
