# Exercises: Progressive Web App

## Exercise 1: Service Worker Registration

**File:** `lib/features/pwa/hooks/useServiceWorker.ts`

**Goal:** Complete the SW registration logic.

**Steps:**

1. Register the service worker:
   ```typescript
   const registration = await navigator.serviceWorker.register('/sw.js');
   ```

2. Handle update detection:
   ```typescript
   registration.addEventListener('updatefound', () => {
     const newWorker = registration.installing;
     newWorker?.addEventListener('statechange', () => {
       if (newWorker.state === 'installed') {
         if (navigator.serviceWorker.controller) {
           // New version available
           setState(prev => ({ ...prev, updateAvailable: true }));
         }
       }
     });
   });
   ```

**Test:** Open DevTools > Application > Service Workers

---

## Exercise 2: IndexedDB CRUD Operations

**File:** `lib/features/pwa/utils/indexedDB.ts`

**Goal:** The basic operations are implemented. Extend with:

1. **Query by index:**
   ```typescript
   export async function getByStatus(status: string) {
     const db = await openDatabase();
     return new Promise((resolve, reject) => {
       const tx = db.transaction('applications', 'readonly');
       const index = tx.objectStore('applications').index('status');
       const request = index.getAll(status);
       request.onsuccess = () => resolve(request.result);
       request.onerror = () => reject(request.error);
     });
   }
   ```

2. **Batch operations:**
   ```typescript
   export async function putMany(storeName: string, records: any[]) {
     const db = await openDatabase();
     const tx = db.transaction(storeName, 'readwrite');
     const store = tx.objectStore(storeName);
     records.forEach(record => store.put(record));
     return tx.complete;
   }
   ```

---

## Exercise 3: Install Prompt

**File:** `lib/features/pwa/components/InstallPrompt.tsx`

The component is implemented. Enhance it:

1. **Remember dismissal:**
   ```typescript
   // Check localStorage before showing
   const dismissed = localStorage.getItem('pwa-install-dismissed');
   if (dismissed) return null;

   // On dismiss
   localStorage.setItem('pwa-install-dismissed', Date.now().toString());
   ```

2. **Show after delay:**
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {
       if (deferredPrompt) setIsVisible(true);
     }, 30000); // Show after 30 seconds
     return () => clearTimeout(timer);
   }, [deferredPrompt]);
   ```

---

## Exercise 4: Caching Strategies

**File:** `public/sw.js`

**Goal:** Implement different strategies for different routes.

```javascript
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Static assets: Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|svg)$/)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // HTML pages: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(event.request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}
```

---

## Bonus Challenges

### Challenge A: Offline Data Sync

Implement automatic sync when coming back online:

```typescript
window.addEventListener('online', async () => {
  const queue = await getSyncQueue();
  for (const op of queue) {
    await syncOperation(op);
  }
  await clearSyncQueue();
});
```

### Challenge B: Push Notifications

Combine with the real-time notifications feature to show push notifications even when the app is closed.

### Challenge C: App Shortcuts

Add dynamic shortcuts based on user data (recent applications, etc.)
