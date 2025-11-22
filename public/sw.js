/**
 * Service Worker
 *
 * Handles offline caching and background sync.
 *
 * LEARNING EXERCISE: Complete the caching strategies.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

const CACHE_NAME = "job-hunter-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/profile",
  "/tracker",
  "/analyze",
  "/offline.html",
];

/**
 * TODO Exercise 4: Implement Caching Strategies
 *
 * Common strategies:
 * 1. Cache First: Check cache, fallback to network
 * 2. Network First: Try network, fallback to cache
 * 3. Stale While Revalidate: Return cache, update in background
 *
 * @see https://web.dev/offline-cookbook/
 */

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Install complete");
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log("[SW] Claiming clients");
        return self.clients.claim();
      })
  );
});

// Fetch event - intercept network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // ============================================
  // TODO: Implement caching strategy
  // ============================================

  // For now, use Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response to cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // No cache, return offline page for navigation
          if (request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          // Return empty response for other requests
          return new Response("", { status: 503 });
        });
      })
  );
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Background Sync (when supported)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-applications") {
    event.waitUntil(syncApplications());
  }
});

async function syncApplications() {
  // TODO: Implement background sync logic
  // 1. Get pending operations from IndexedDB
  // 2. Send to server
  // 3. Clear sync queue
  console.log("[SW] Syncing applications...");
}
