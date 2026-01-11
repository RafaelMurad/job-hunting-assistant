/**
 * Storage Module
 *
 * Unified storage abstraction layer for CareerPal.
 * Provides consistent data access regardless of storage backend.
 *
 * Usage:
 * ```tsx
 * // In layout.tsx - wrap app with provider
 * import { StorageProvider } from "@/lib/storage";
 *
 * // In components - use the hook
 * import { useStorage } from "@/lib/storage";
 * const storage = useStorage();
 * const profile = await storage.getProfile();
 * ```
 *
 * @module lib/storage
 */

// Types
export type {
  StorageAdapter,
  StoredProfile,
  StoredCV,
  StoredApplication,
  StoredFile,
  CreateProfileInput,
  UpdateProfileInput,
  CreateCVInput,
  UpdateCVInput,
  CreateApplicationInput,
  UpdateApplicationInput,
  ExportedData,
} from "./interface";

// Mode detection utilities
export { isLocalMode, isDemoMode } from "./interface";

// React provider and hooks
export { StorageProvider, useStorage, useIsLocalMode, useIsDemoMode } from "./provider";

// Adapters (for direct use in tests or advanced scenarios)
export { localStorageAdapter, localDB } from "./local";
export { serverStorageAdapter } from "./server";
