/* ==========================================================================
   Amir Kassim Portfolio - Service Worker for 100% Offline Capability
   ========================================================================== */

const CACHE_NAME = 'amir-kassim-portfolio-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/animation.css',
  '/css/project-detail.css',
  '/js/main.js',
  '/js/carousel.js',
  '/js/project-detail.js',
  '/projects/pharmacy-erp.html',
  '/projects/hotel-it-infrastructure.html',
  '/projects/cctv-installation.html',
  '/projects/technician-marketplace.html',
  '/projects/cctv-marketplace.html',
  '/projects/electro-it-ecommerce.html',
  '/projects/hotel-booking-website.html',
  '/projects/datacenter-infrastructure.html',
  '/projects/hotel-wifi-deployment.html',
  '/projects/cnet-erp-management.html',
  '/images/profile.jpg',
  '/images/projects/datacenter.jpg',
  '/images/projects/cctv.jpg',
  '/images/projects/wifi.jpg',
  '/images/projects/erp.jpg',
  '/images/projects/telephony.jpg',
  '/images/projects/web.jpg',
  '/images/projects/pharmacy_erp.jpg',
  '/images/projects/cctv_listing.jpg',
  '/images/projects/electro_ecommerce.jpg',
  '/images/projects/hotel_bot.jpg',
  '/images/projects/network_topology.jpg',
  '/images/projects/wifi_heatmap.jpg',
  '/images/projects/cctv_zone_map.jpg',
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

// Install Event - Pre-cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Non-fatal asset caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with safe Cache Fallback strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip browser extensions, Vite dev server, HMR, and non-same-origin dev tools
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

  // Network-First strategy: guarantees latest CSS/JS in preview, falls back to cache offline
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
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate' || event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});
