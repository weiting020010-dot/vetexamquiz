const CACHE = 'vetquiz-v45';
const PRECACHE = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const HTML_FILES = ['index.html','pathology.html','chuanran.html','yaoli.html','putongbing.html','gongwei.html','shizhen.html',''];
const FIREBASE_HOST = 'www.gstatic.com';

// 安裝：預先快取靜態資源（不包含大型 HTML 題庫）
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(()=>{}))
  );
  self.skipWaiting();
});

// 啟動：刪除舊版快取，立即接管所有頁面
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 攔截請求
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isFirebase = url.hostname === FIREBASE_HOST;
  if(url.origin !== self.location.origin && !isFirebase) return;

  // Firebase CDN: cache-first（載入一次後離線可用）
  if(isFirebase){
    e.respondWith(
      caches.open(CACHE).then(cache=>
        cache.match(e.request).then(cached=>{
          if(cached)return cached;
          return fetch(e.request).then(res=>{if(res.ok)cache.put(e.request,res.clone());return res;}).catch(()=>null);
        })
      )
    );
    return;
  }

  const path = url.pathname.split('/').pop();
  const isHTML = path === '' || HTML_FILES.includes(path);

  if(isHTML) {
    // HTML 檔案：網路優先，確保永遠拿到最新版
    // 離線時才 fallback 快取
    e.respondWith(
      fetch(e.request).then(res => {
        if(res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 靜態資源（圖示、manifest）：快取優先，快速載入
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if(cached) return cached;
          return fetch(e.request).then(res => {
            if(res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => null);
        })
      )
    );
  }
});
