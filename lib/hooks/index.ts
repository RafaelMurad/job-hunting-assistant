/**
 * Hooks Barrel Export
 *
 * Central export for all custom hooks.
 * Import from '@/lib/hooks' for clean imports.
 */

// Legacy hooks (tRPC-only)
export { useUser } from "./useUser";
export type { ExtractedCVData, SaveUserInput, UploadCVInput, UseUserReturn, User } from "./useUser";

export { useAnalyze } from "./useAnalyze";
export type { ButtonState, JobAnalysisResult, UseAnalyzeReturn } from "./useAnalyze";

export { useApplications } from "./useApplications";
export type { UseApplicationsReturn } from "./useApplications";

// Storage-aware hooks (dual-mode: IndexedDB or tRPC)
export { useStorageUser } from "./useStorageUser";
export type { UseStorageUserReturn, UserData } from "./useStorageUser";

export { useStorageCV } from "./useStorageCV";
export type { CVData, CreateCVInput, UpdateCVInput, UseStorageCVReturn } from "./useStorageCV";

export { useStorageApplications } from "./useStorageApplications";
export type { ApplicationData, UseStorageApplicationsReturn } from "./useStorageApplications";

// Local AI hooks (Transformers.js)
export { LocalAIProvider, useLocalAI, useLocalAIContext } from "./useLocalAI";
export type { UseLocalAIReturn } from "./useLocalAI";

// Re-export application types from centralized types for convenience
export type {
  Application,
  ApplicationStats,
  ApplicationStatus,
  CreateApplicationInput,
} from "@/types";
