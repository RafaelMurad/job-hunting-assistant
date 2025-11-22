/**
 * PWA / Offline-First Feature
 *
 * Provides service worker registration, offline caching, and sync capabilities.
 *
 * @see docs/features/pwa/README.md
 */

export { useServiceWorker } from "./hooks/useServiceWorker";
export { useOnlineStatus } from "./hooks/useOnlineStatus";
export { OfflineIndicator } from "./components/OfflineIndicator";
export { InstallPrompt } from "./components/InstallPrompt";
export * from "./utils/indexedDB";
