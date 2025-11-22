"use client";

/**
 * Online Status Hook
 *
 * Tracks browser online/offline status.
 */

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Subscribe to online/offline events
 */
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online during SSR
}

/**
 * Hook that returns current online status
 *
 * Uses useSyncExternalStore for safe concurrent rendering
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Alternative implementation with useState/useEffect
 * (for learning purposes - useSyncExternalStore is preferred)
 */
export function useOnlineStatusLegacy(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
