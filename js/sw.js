/* ==========================================================================
   Amir Kassim Portfolio - Service Worker for Offline Functionality
   ========================================================================== */

const CACHE_NAME = 'amir-kassim-portfolio-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/animation.css',
  '/js/main.js',
  '/images/profile.jpg',
  '/images/projects/datacenter.jpg',
  '/images/projects/cctv.jpg',
  '/images/projects/wifi.jpg',
  '/images/projects/erp.jpg',
  '/images/projects/telephony.jpg',
  '/images/projects/web.jpg',
  '/projects/projects.json',
  '/files/Amir_Kassim_Resume.html',
  '/files/amir_kassim_contact.vcf',
  '/icons/network.svg',
  '/icons/server.svg',
  '/icons/cctv.svg',
  '/icons/phone.svg',
  '/icons/security.svg',
  '/icons/code.svg',
  '/icons/mail.svg',
  '/icons/linkedin.svg',
  '/icons/download.svg',
  '/icons/check.svg',
  '/icons/award.svg',
  '/icons/briefcase.svg',
  '/icons/graduation-cap.svg',
  '/icons/map-pin.svg',
  '/icons/wifi.svg',
  '/icons/database.svg',
  '/icons/moon.svg',
  '/icons/sun.svg',
  '/icons/external-link.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Caching assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip dev server internals and browser extensions
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules') ||
    url.pathname.includes('vite') ||
    url.pathname.includes('hot-update') ||
    url.protocol === 'chrome-extension:' ||
    url.protocol === 'moz-extension:'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate' || event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return caches.match(event.request);
        });
      })
  );
});
