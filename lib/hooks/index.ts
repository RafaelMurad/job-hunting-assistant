/**
 * Hooks Barrel Export
 *
 * Central export for all custom hooks.
 * Import from '@/lib/hooks' for clean imports.
 */

// Legacy hooks (tRPC-only)
export { useUser } from "./useUser";
export type { User, SaveUserInput, UploadCVInput, ExtractedCVData, UseUserReturn } from "./useUser";

export { useAnalyze } from "./useAnalyze";
export type { JobAnalysisResult, ButtonState, UseAnalyzeReturn } from "./useAnalyze";

export { useApplications } from "./useApplications";
export type { UseApplicationsReturn } from "./useApplications";

// Storage-aware hooks (dual-mode: IndexedDB or tRPC)
export { useStorageUser } from "./useStorageUser";
export type { UserData, UseStorageUserReturn } from "./useStorageUser";

export { useStorageCV } from "./useStorageCV";
export type { CVData, CreateCVInput, UpdateCVInput, UseStorageCVReturn } from "./useStorageCV";

export { useStorageApplications } from "./useStorageApplications";
export type { ApplicationData, UseStorageApplicationsReturn } from "./useStorageApplications";

// Re-export application types from centralized types for convenience
export type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  ApplicationStats,
} from "@/types";
