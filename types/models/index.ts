/**
 * Domain Models Barrel Export
 *
 * Central export point for all domain model types.
 *
 * @module types/models
 */

// Application models
export type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStats,
  ApplicationFilters,
  ApplicationStatus,
} from "./application";

// UX Research models
export type {
  UxPersona,
  UxJourney,
  UxJourneyStep,
  UxPainPoint,
  UxPrinciple,
  CreatePersonaInput,
  CreateJourneyInput,
  CreatePainPointInput,
  CreatePrincipleInput,
  UxSeverity,
  UxEffort,
  UxStatus,
} from "./ux";

// User models
export type { UserProfile, UpdateProfileInput, CVUploadResult, UserRole } from "./user";
