/**
 * Feature Flags Core Module
 *
 * This module provides the core functionality for feature flags:
 * - Storage in localStorage (client-side)
 * - Environment variable overrides (server-side)
 * - Type-safe flag checking
 *
 * @example
 * ```tsx
 * // In a component
 * import { useFeatureFlag } from '@/lib/feature-flags';
 *
 * function MyComponent() {
 *   const isEnabled = useFeatureFlag('my_feature');
 *   if (!isEnabled) return null;
 *   return <NewFeature />;
 * }
 * ```
 */

import { FEATURE_FLAGS, type FeatureFlagKey } from "./flags.config";
import { flagStateSchema, type FlagState } from "@/lib/ai/schemas";

const STORAGE_KEY = "job-hunter-feature-flags";

// Re-export the type for backward compatibility
export type { FlagState };

/**
 * Get the initial state of all flags based on defaults and environment
 */
export function getInitialFlagState(): FlagState {
  const state: FlagState = {};

  for (const flag of FEATURE_FLAGS) {
    // Check environment variable override first (NEXT_PUBLIC_FF_FLAG_NAME)
    const envKey = `NEXT_PUBLIC_FF_${flag.key.toUpperCase()}`;
    const envValue = process.env[envKey];

    if (envValue !== undefined) {
      state[flag.key] = envValue === "true" || envValue === "1";
    } else {
      state[flag.key] = flag.defaultEnabled;
    }
  }

  return state;
}

/**
 * Load flag state from localStorage (client-side only)
 * Uses Zod validation to ensure type safety from untrusted localStorage data.
 */
export function loadFlagState(): FlagState {
  if (typeof window === "undefined") {
    return getInitialFlagState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Validate localStorage data with Zod schema
      const parseResult = flagStateSchema.safeParse(JSON.parse(stored));
      if (parseResult.success) {
        // Merge with defaults to handle new flags
        const defaults = getInitialFlagState();
        return { ...defaults, ...parseResult.data };
      }
      // Invalid data format, fall through to defaults
      console.warn("[Feature Flags] Invalid localStorage data, using defaults");
    }
  } catch {
    // Ignore parsing errors, return defaults
  }

  return getInitialFlagState();
}

/**
 * Save flag state to localStorage (client-side only)
 */
export function saveFlagState(state: FlagState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

/**
 * Check if a specific flag is enabled
 * Use this for server-side checks or one-off checks
 * For React components, prefer useFeatureFlag hook
 */
export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  const state = loadFlagState();
  return state[key] ?? false;
}

/**
 * Reset all flags to their default values
 */
export function resetAllFlags(): FlagState {
  const defaults = getInitialFlagState();
  saveFlagState(defaults);
  return defaults;
}

/**
 * Enable a specific flag
 */
export function enableFlag(key: FeatureFlagKey): void {
  const state = loadFlagState();
  state[key] = true;
  saveFlagState(state);
}

/**
 * Disable a specific flag
 */
export function disableFlag(key: FeatureFlagKey): void {
  const state = loadFlagState();
  state[key] = false;
  saveFlagState(state);
}

/**
 * Toggle a specific flag
 */
export function toggleFlag(key: FeatureFlagKey): boolean {
  const state = loadFlagState();
  state[key] = !state[key];
  saveFlagState(state);
  return state[key];
}

// Re-export types and config
export { FEATURE_FLAGS, getFlagDefinition, getFlagsByCategory } from "./flags.config";
export type { FeatureFlag, FeatureFlagKey } from "./flags.config";
