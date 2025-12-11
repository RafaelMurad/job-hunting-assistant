/**
 * Hooks Barrel Export
 *
 * Central export for all custom hooks.
 * Import from '@/lib/hooks' for clean imports.
 */

export { useUser } from "./useUser";
export type { User, SaveUserInput, UploadCVInput, ExtractedCVData, UseUserReturn } from "./useUser";

export { useAnalyze } from "./useAnalyze";
export type { JobAnalysisResult, ButtonState, UseAnalyzeReturn } from "./useAnalyze";

export { useApplications } from "./useApplications";
export type { UseApplicationsReturn } from "./useApplications";

// Re-export application types from centralized types for convenience
export type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  ApplicationStats,
} from "@/types";
