/**
 * Shared Types
 *
 * Type definitions used by both web and mobile apps.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  jobUrl?: string;
  notes?: string;
  appliedAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected";

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt: Date;
}

export interface AnalysisResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}
