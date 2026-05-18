const CACHE = 'vetquiz-v18';
const PRECACHE = ['./','./index.html','./pathology.html','./chuanran.html','./manifest.json','./icon-192.png','./icon-512.png'];

// 安裝：預先快取核心檔案
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(()=>{}))
  );
  self.skipWaiting();
});

// 啟動：刪除舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 攔截請求：快取優先，背景更新
self.addEventListener('fetch', e => {
  // 只處理 GET 且來自同源的請求（不攔截 Firebase API）
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fetchAndUpdate = fetch(e.request).then(res => {
          if(res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => null);
        // 有快取：直接回傳，同時在背景更新
        if(cached){ fetchAndUpdate; return cached; }
        // 無快取：等待網路
        return fetchAndUpdate;
      })
    )
  );
});
