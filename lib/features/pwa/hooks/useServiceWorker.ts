"use client";

/**
 * Service Worker Registration Hook
 *
 * Handles SW registration, updates, and lifecycle events.
 *
 * LEARNING EXERCISE: Understand the SW lifecycle.
 */

import { useCallback, useEffect, useState } from "react";

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOffline: false,
    updateAvailable: false,
    registration: null,
  });

  /**
   * TODO Exercise 1: Implement Service Worker Registration
   *
   * The Service Worker lifecycle:
   * 1. Register: Browser downloads and parses the SW file
   * 2. Install: SW installs, can cache assets
   * 3. Activate: Old SW replaced, new SW takes control
   * 4. Fetch: SW intercepts network requests
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   */
  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    // ============================================
    // TODO: Register the service worker
    // ============================================

    // Hint: Register SW and handle updates
    // const registerSW = async () => {
    //   try {
    //     const registration = await navigator.serviceWorker.register('/sw.js');
    //
    //     setState(prev => ({
    //       ...prev,
    //       isRegistered: true,
    //       registration,
    //     }));
    //
    //     // Check for updates
    //     registration.addEventListener('updatefound', () => {
    //       const newWorker = registration.installing;
    //       newWorker?.addEventListener('statechange', () => {
    //         if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
    //           setState(prev => ({ ...prev, updateAvailable: true }));
    //         }
    //       });
    //     });
    //   } catch (error) {
    //     console.error('SW registration failed:', error);
    //   }
    // };
    //
    // registerSW();

    console.log("[useServiceWorker] TODO: Implement SW registration");
  }, []);

  /**
   * Skip waiting and activate the new service worker
   */
  const update = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }, [state.registration]);

  /**
   * Unregister the service worker
   */
  const unregister = useCallback(async () => {
    if (state.registration) {
      await state.registration.unregister();
      setState((prev) => ({ ...prev, isRegistered: false, registration: null }));
    }
  }, [state.registration]);

  return {
    ...state,
    update,
    unregister,
  };
}
