# Offline-First PWA

Progressive Web App with offline capabilities.

## What You'll Learn

- **Service Workers**: Intercept network requests, cache assets
- **IndexedDB**: Store structured data offline
- **Background Sync**: Sync data when back online
- **Web App Manifest**: Make your app installable

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│     Browser     │    │  Service Worker │
│                 │    │                 │
│    App Code    ─┼───>│  Cache Storage  │
│        │        │    │                 │
│        v        │    │  IndexedDB      │
│   useOnlineStatus    │  (structured)   │
│   useServiceWorker   │                 │
└─────────────────┘    └─────────────────┘
                              │
                              v
                       ┌─────────────────┐
                       │     Server      │
                       │  (when online)  │
                       └─────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `public/sw.js` | Service worker (caching, sync) |
| `public/manifest.json` | PWA manifest |
| `hooks/useServiceWorker.ts` | SW registration hook |
| `hooks/useOnlineStatus.ts` | Online/offline detection |
| `utils/indexedDB.ts` | IndexedDB wrapper |
| `components/OfflineIndicator.tsx` | Offline banner |
| `components/InstallPrompt.tsx` | Install prompt |

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import {
  OfflineIndicator,
  InstallPrompt,
  useServiceWorker,
} from "@/lib/features/pwa";

function App() {
  const isEnabled = useFeatureFlag("offline_mode");
  const { isRegistered, updateAvailable, update } = useServiceWorker();

  if (!isEnabled) return null;

  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      {updateAvailable && (
        <button onClick={update}>Update available</button>
      )}
    </>
  );
}
```

## Official Documentation

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [web.dev: Offline Cookbook](https://web.dev/offline-cookbook/)
