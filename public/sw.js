// خدمة العمل دون اتصال: نخزّن ملفات الموقع عند الزيارة ثم نخدمها فوراً (وتتحدّث بالخلفية).
const CACHE = 'jdt-v3';
const SHELL = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        // دون اتصال: صفحة غير محفوظة تعود إلى الصفحة الرئيسية المحفوظة (التطبيق يفتح الصفحة المطلوبة بنفسه)
        .catch(() => hit || (req.mode === 'navigate' ? caches.match('./') : undefined));
      return hit || network;
    }),
  );
});
