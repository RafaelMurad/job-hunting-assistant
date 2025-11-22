# Learning Guide: Progressive Web Apps

## Core Concepts

### 1. Service Worker Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Register │───>│ Install  │───>│ Activate │
└──────────┘    └──────────┘    └──────────┘
                    │                 │
                    v                 v
               Cache assets     Handle fetches
```

**States:**
- **Installing**: Downloading and caching
- **Installed/Waiting**: Ready but waiting for old SW to stop
- **Activating**: Taking control
- **Activated**: Handling fetch events

### 2. Caching Strategies

**Cache First (offline-first)**
```javascript
event.respondWith(
  caches.match(request).then(cached => {
    return cached || fetch(request);
  })
);
```

**Network First (fresh data)**
```javascript
event.respondWith(
  fetch(request).catch(() => caches.match(request))
);
```

**Stale While Revalidate (balance)**
```javascript
event.respondWith(
  caches.match(request).then(cached => {
    const fetchPromise = fetch(request).then(response => {
      caches.open('cache').then(cache => cache.put(request, response.clone()));
      return response;
    });
    return cached || fetchPromise;
  })
);
```

### 3. IndexedDB Basics

```javascript
// Open database
const request = indexedDB.open('mydb', 1);

// Create store on upgrade
request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore('items', { keyPath: 'id' });
};

// Add data
const tx = db.transaction('items', 'readwrite');
tx.objectStore('items').add({ id: 1, name: 'Item' });

// Read data
const tx = db.transaction('items', 'readonly');
const request = tx.objectStore('items').get(1);
request.onsuccess = () => console.log(request.result);
```

### 4. Background Sync

```javascript
// Request sync
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-data');
});

// Handle in service worker
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

## PWA Checklist

- [ ] HTTPS (required for SW)
- [ ] Web app manifest
- [ ] Service worker registered
- [ ] Offline fallback page
- [ ] App icons (192x192, 512x512)
- [ ] Responsive design
- [ ] Fast loading (<3s on 3G)

## Debugging

**Chrome DevTools:**
- Application > Service Workers
- Application > Cache Storage
- Application > IndexedDB
- Lighthouse audit

**Useful commands:**
```javascript
// Unregister all SWs
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```
