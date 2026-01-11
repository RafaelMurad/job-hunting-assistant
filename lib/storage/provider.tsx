"use client";

/**
 * Storage Provider
 *
 * React context provider that supplies the correct storage adapter
 * based on the app mode (local vs demo).
 *
 * Usage:
 * ```tsx
 * // In layout.tsx
 * <StorageProvider>
 *   {children}
 * </StorageProvider>
 *
 * // In components
 * const storage = useStorage();
 * const profile = await storage.getProfile();
 * ```
 *
 * @module lib/storage/provider
 */

import { createContext, useContext, useMemo, type ReactNode, type JSX } from "react";
import type { StorageAdapter } from "./interface";
import { isLocalMode } from "./interface";
import { localStorageAdapter } from "./local";
import { serverStorageAdapter } from "./server";

// ============================================
// Context
// ============================================

const StorageContext = createContext<StorageAdapter | null>(null);

// ============================================
// Provider Component
// ============================================

interface StorageProviderProps {
  children: ReactNode;
  /**
   * Force a specific mode for testing.
   * If not provided, uses NEXT_PUBLIC_MODE environment variable.
   */
  forceMode?: "local" | "demo";
}

/**
 * Storage provider component.
 *
 * Wraps children with the storage context, providing the appropriate
 * adapter based on app mode.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <StorageProvider>
 *           {children}
 *         </StorageProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function StorageProvider({ children, forceMode }: StorageProviderProps): JSX.Element {
  const adapter = useMemo(() => {
    const useLocalMode = forceMode === "local" || (forceMode === undefined && isLocalMode());
    return useLocalMode ? localStorageAdapter : serverStorageAdapter;
  }, [forceMode]);

  return <StorageContext.Provider value={adapter}>{children}</StorageContext.Provider>;
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access the storage adapter.
 *
 * Must be used within a StorageProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const storage = useStorage();
 *
 *   useEffect(() => {
 *     storage.getProfile().then(setProfile);
 *   }, [storage]);
 *
 *   // ...
 * }
 * ```
 */
export function useStorage(): StorageAdapter {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error(
      "useStorage must be used within a StorageProvider. " +
        "Make sure to wrap your app with <StorageProvider> in layout.tsx."
    );
  }

  return context;
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Hook to check if we're in local mode.
 * Useful for conditionally rendering UI elements.
 */
export function useIsLocalMode(): boolean {
  // This could use the provider's forceMode in the future
  return isLocalMode();
}

/**
 * Hook to check if we're in demo mode.
 */
export function useIsDemoMode(): boolean {
  return !isLocalMode();
}
