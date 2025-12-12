/**
 * User Domain Model Types
 *
 * Type definitions for user-related functionality.
 *
 * @module types/models/user
 */

import type { UserRole } from "../database";

/**
 * User profile data for UI
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location: string;
  summary: string;
  experience: string;
  skills: string[];
  cvPdfUrl?: string | null;
  cvLatexUrl?: string | null;
  cvFilename?: string | null;
  cvUploadedAt?: string | null;
  role: UserRole;
  isTrusted: boolean;
  isVerified: boolean;
  image?: string | null;
}

/**
 * Input for updating user profile
 */
export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: string;
  skills?: string;
}

/**
 * CV upload result
 */
export interface CVUploadResult {
  pdfUrl: string;
  latexUrl?: string;
  filename: string;
  extractedText?: string;
}

export type { UserRole };
