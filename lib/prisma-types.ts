/**
 * Local Prisma Type Definitions
 *
 * These types are derived from the Prisma schema to provide type safety
 * when Prisma client generation is unavailable.
 */

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

export enum UxSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum UxEffort {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum UxStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  VALIDATED = "VALIDATED",
  ARCHIVED = "ARCHIVED",
}

export enum SocialProvider {
  GITHUB = "GITHUB",
  LINKEDIN = "LINKEDIN",
}

export enum SyncStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

/**
 * User model type (partial - only common fields)
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
