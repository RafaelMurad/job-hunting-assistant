"use client";

/**
 * Feature Flags React Hooks
 *
 * Provides convenient hooks for checking and managing feature flags.
 *
 * @example
 * ```tsx
 * import { useFeatureFlag, useFeatureFlags } from '@/lib/feature-flags/hooks';
 *
 * function MyComponent() {
 *   // Check a single flag
 *   const showNewFeature = useFeatureFlag('my_feature');
 *
 *   // Get full context for admin panel
 *   const { flags, toggle, resetAll } = useFeatureFlags();
 *
 *   return showNewFeature ? <NewFeature /> : <OldFeature />;
 * }
 * ```
 */

import { useContext } from "react";
import { FeatureFlagContext, type FeatureFlagContextValue } from "./provider";
import type { FeatureFlagKey } from "./flags.config";

/**
 * Get the full feature flag context
 * Useful for admin panels or components that need to manage flags
 *
 * @throws Error if used outside FeatureFlagProvider
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagProvider. " +
        "Make sure to wrap your app with <FeatureFlagProvider>."
    );
  }

  return context;
}

/**
 * Check if a specific feature flag is enabled
 * This is the primary hook for conditional rendering
 *
 * @param key - The feature flag key to check
 * @returns boolean - Whether the flag is enabled
 *
 * @example
 * ```tsx
 * function FeatureComponent() {
 *   const isEnabled = useFeatureFlag('new_dashboard');
 *
 *   if (!isEnabled) {
 *     return null; // or return old component
 *   }
 *
 *   return <NewDashboard />;
 * }
 * ```
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    // Fail gracefully in case provider is missing
    // Return false to hide experimental features by default
    console.warn(
      `useFeatureFlag("${key}") called outside FeatureFlagProvider. ` +
        "Returning false as fallback."
    );
    return false;
  }

  return context.isEnabled(key);
}

/**
 * Get hydration status
 * Useful for avoiding flash of content during SSR hydration
 *
 * @example
 * ```tsx
 * function FeatureComponent() {
 *   const isHydrated = useFeatureFlagHydrated();
 *   const isEnabled = useFeatureFlag('new_feature');
 *
 *   // Don't render until hydrated to avoid flash
 *   if (!isHydrated) return null;
 *
 *   return isEnabled ? <New /> : <Old />;
 * }
 * ```
 */
export function useFeatureFlagHydrated(): boolean {
  const context = useContext(FeatureFlagContext);
  return context?.isHydrated ?? false;
}
