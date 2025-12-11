/**
 * Database Type Definitions
 *
 * Provides type-safe definitions for database entities.
 * These types are derived from the Prisma schema and serve as
 * a fallback when Prisma client generation is unavailable.
 *
 * @module types/database
 */

/**
 * User role enumeration
 */
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

/**
 * UX research severity levels
 */
export enum UxSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * UX research effort estimation
 */
export enum UxEffort {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

/**
 * UX research item status
 */
export enum UxStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  VALIDATED = "VALIDATED",
  ARCHIVED = "ARCHIVED",
}

/**
 * Social media provider types
 */
export enum SocialProvider {
  GITHUB = "GITHUB",
  LINKEDIN = "LINKEDIN",
}

/**
 * Sync operation status
 */
export enum SyncStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

/**
 * User entity from database
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location: string;
  summary: string;
  experience: string;
  skills: string;
  cvPdfUrl?: string | null;
  cvLatexUrl?: string | null;
  cvFilename?: string | null;
  cvUploadedAt?: Date | null;
  role: UserRole;
  isTrusted: boolean;
  isVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Application status enumeration
 */
export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

/**
 * Job application entity from database (with Date objects)
 */
export interface ApplicationEntity {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobDescription: string;
  jobUrl: string | null;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status: string;
  appliedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
