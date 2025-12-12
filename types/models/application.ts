/**
 * Application Domain Model Types
 *
 * Type definitions for job application tracking functionality.
 * Separates database entities from UI-friendly representations.
 *
 * @module types/models/application
 */

import type { ApplicationStatus } from "../database";

/**
 * Application data for UI consumption (with string dates)
 */
export interface Application {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  status: string;
  appliedAt: string | null;
  createdAt: string;
  notes: string | null;
}

/**
 * Input for creating a new application
 */
export interface CreateApplicationInput {
  company: string;
  role: string;
  jobDescription: string;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status: ApplicationStatus;
}

/**
 * Input for updating an existing application
 */
export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  notes?: string;
  appliedAt?: Date;
}

/**
 * Application statistics for dashboard
 */
export interface ApplicationStats {
  total: number;
  applied: number;
  interviewing: number;
  offers: number;
  avgMatchScore: number;
}

/**
 * Filter options for application list
 */
export interface ApplicationFilters {
  status?: ApplicationStatus;
  search?: string;
  sortBy?: "recent" | "company" | "matchScore";
}

export type { ApplicationStatus };
