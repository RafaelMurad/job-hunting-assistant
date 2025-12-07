"use client";

/**
 * Feature Flags React Context Provider
 *
 * Provides feature flag state to the entire application via React Context.
 * Handles hydration from localStorage and provides methods to update flags.
 *
 * @example
 * ```tsx
 * // In your root layout
 * import { FeatureFlagProvider } from '@/lib/feature-flags/provider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FeatureFlagProvider>
 *           {children}
 *         </FeatureFlagProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { type FlagState, getInitialFlagState, loadFlagState, saveFlagState } from "./index";
import type { FeatureFlagKey } from "./flags.config";

export interface FeatureFlagContextValue {
  /** Current state of all flags */
  flags: FlagState;
  /** Whether flags have been hydrated from storage */
  isHydrated: boolean;
  /** Check if a specific flag is enabled */
  isEnabled: (key: FeatureFlagKey) => boolean;
  /** Toggle a flag on/off */
  toggle: (key: FeatureFlagKey) => void;
  /** Set a flag to a specific value */
  setFlag: (key: FeatureFlagKey, enabled: boolean) => void;
  /** Reset all flags to defaults */
  resetAll: () => void;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
  /** Optional initial overrides (useful for testing) */
  initialOverrides?: FlagState;
}

/**
 * Merge base state with overrides, filtering out undefined values
 */
function mergeFlags(base: FlagState, overrides?: FlagState): FlagState {
  if (!overrides) return base;
  const result: FlagState = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === "boolean") {
      result[key] = value;
    }
  }
  return result;
}

export function FeatureFlagProvider({
  children,
  initialOverrides,
}: FeatureFlagProviderProps): React.JSX.Element {
  // Start with defaults for SSR
  const [flags, setFlags] = useState<FlagState>(() => {
    const initial = getInitialFlagState();
    return mergeFlags(initial, initialOverrides);
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  // This is intentional hydration that must happen in useEffect (client-side only)
  useEffect(() => {
    const stored = loadFlagState();
    const merged = mergeFlags(stored, initialOverrides);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional hydration from localStorage
    setFlags(merged);
    setIsHydrated(true);
  }, [initialOverrides]);

  // Persist changes to localStorage
  useEffect(() => {
    if (isHydrated) {
      saveFlagState(flags);
    }
  }, [flags, isHydrated]);

  const isEnabled = useCallback(
    (key: FeatureFlagKey): boolean => {
      return flags[key] ?? false;
    },
    [flags]
  );

  const toggle = useCallback((key: FeatureFlagKey) => {
    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const setFlag = useCallback((key: FeatureFlagKey, enabled: boolean) => {
    setFlags((prev) => ({
      ...prev,
      [key]: enabled,
    }));
  }, []);

  const resetAll = useCallback(() => {
    const defaults = getInitialFlagState();
    setFlags(mergeFlags(defaults, initialOverrides));
  }, [initialOverrides]);

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        isHydrated,
        isEnabled,
        toggle,
        setFlag,
        resetAll,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}
