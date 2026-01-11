/**
 * Storage Adapter Interface
 *
 * Defines the contract for data persistence across different storage backends.
 * This abstraction enables the dual-mode architecture:
 * - Local mode: Dexie (IndexedDB) - browser storage, zero server contact
 * - Demo mode: tRPC/Prisma - PostgreSQL via server
 *
 * All data operations in the app should go through this interface,
 * never directly to IndexedDB or tRPC.
 *
 * @module lib/storage/interface
 */

import type { ApplicationStatus } from "@/types";

// ============================================
// Core Entity Types (Storage-layer shapes)
// ============================================

/**
 * User profile stored in storage layer.
 * Simplified from Prisma User - only fields needed for app functionality.
 */
export interface StoredProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null | undefined;
  location: string;
  summary: string;
  experience: string;
  skills: string[]; // Parsed from comma-separated in DB
  image: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

/**
 * CV document stored in storage layer.
 */
export interface StoredCV {
  id: string;
  name: string;
  pdfUrl: string | null | undefined;
  pdfBlob: Blob | null | undefined; // For local mode - actual file data
  latexUrl: string | null | undefined;
  latexContent: string | null | undefined;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job application stored in storage layer.
 */
export interface StoredApplication {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  jobUrl: string | null | undefined;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string | null | undefined;
  notes: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

/**
 * File metadata for stored files (PDFs, etc.)
 */
export interface StoredFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: string;
}

// ============================================
// Input Types for Create/Update Operations
// ============================================

export interface CreateProfileInput {
  name: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  experience: string;
  skills: string[];
  image?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: string;
  skills?: string[];
  image?: string;
}

export interface CreateCVInput {
  name: string;
  pdfBlob?: Blob;
  latexContent?: string;
  isActive?: boolean;
}

export interface UpdateCVInput {
  name?: string;
  pdfBlob?: Blob;
  latexContent?: string;
  isActive?: boolean;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  jobDescription: string;
  jobUrl?: string;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status?: ApplicationStatus;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  notes?: string;
  appliedAt?: string;
  coverLetter?: string;
}

// ============================================
// Export/Import Types
// ============================================

/**
 * Complete data export for backup/portability.
 */
export interface ExportedData {
  version: string; // Schema version for future migrations
  exportedAt: string;
  profile: StoredProfile | null;
  cvs: StoredCV[];
  applications: StoredApplication[];
  files: Array<{
    id: string;
    name: string;
    mimeType: string;
    base64: string; // Files encoded as base64 for JSON export
  }>;
}

// ============================================
// Storage Adapter Interface
// ============================================

/**
 * Storage adapter interface - the contract all storage backends must implement.
 *
 * Usage:
 * ```typescript
 * const storage = useStorage();
 * const profile = await storage.getProfile();
 * ```
 */
export interface StorageAdapter {
  // ----------------------------------------
  // Profile Operations
  // ----------------------------------------

  /**
   * Get the current user's profile.
   * In local mode, there's only one profile (the local user).
   * In demo mode, returns the authenticated user's profile.
   */
  getProfile(): Promise<StoredProfile | null>;

  /**
   * Create or update the user's profile.
   * In local mode, always updates the single local profile.
   */
  saveProfile(input: CreateProfileInput | UpdateProfileInput): Promise<StoredProfile>;

  // ----------------------------------------
  // CV Operations
  // ----------------------------------------

  /**
   * Get all CVs for the current user.
   */
  getCVs(): Promise<StoredCV[]>;

  /**
   * Get a specific CV by ID.
   */
  getCV(id: string): Promise<StoredCV | null>;

  /**
   * Get the active CV (used for job analysis).
   */
  getActiveCV(): Promise<StoredCV | null>;

  /**
   * Create a new CV.
   */
  createCV(input: CreateCVInput): Promise<StoredCV>;

  /**
   * Update an existing CV.
   */
  updateCV(id: string, input: UpdateCVInput): Promise<StoredCV>;

  /**
   * Delete a CV.
   */
  deleteCV(id: string): Promise<void>;

  /**
   * Set a CV as the active one (deactivates others).
   */
  setActiveCV(id: string): Promise<void>;

  // ----------------------------------------
  // Application Operations
  // ----------------------------------------

  /**
   * Get all applications for the current user.
   */
  getApplications(): Promise<StoredApplication[]>;

  /**
   * Get a specific application by ID.
   */
  getApplication(id: string): Promise<StoredApplication | null>;

  /**
   * Create a new application.
   */
  createApplication(input: CreateApplicationInput): Promise<StoredApplication>;

  /**
   * Update an existing application.
   */
  updateApplication(id: string, input: UpdateApplicationInput): Promise<StoredApplication>;

  /**
   * Delete an application.
   */
  deleteApplication(id: string): Promise<void>;

  // ----------------------------------------
  // File Operations (for PDFs, etc.)
  // ----------------------------------------

  /**
   * Save a file (e.g., PDF).
   * Returns a URL or ID that can be used to retrieve it.
   * In local mode: saves to IndexedDB, returns blob URL
   * In demo mode: uploads to Vercel Blob, returns URL
   */
  saveFile(file: Blob, name: string): Promise<string>;

  /**
   * Get a file by its ID/URL.
   * In local mode: retrieves from IndexedDB
   * In demo mode: fetches from URL
   */
  getFile(idOrUrl: string): Promise<Blob | null>;

  /**
   * Delete a file.
   */
  deleteFile(idOrUrl: string): Promise<void>;

  // ----------------------------------------
  // Data Management
  // ----------------------------------------

  /**
   * Export all user data for backup.
   * Files are included as base64-encoded strings.
   */
  exportAll(): Promise<ExportedData>;

  /**
   * Import data from a backup.
   * Replaces all existing data.
   */
  importAll(data: ExportedData): Promise<void>;

  /**
   * Clear all stored data.
   * Use with caution - this is destructive!
   */
  clearAll(): Promise<void>;

  /**
   * Get storage usage statistics.
   * Useful for showing users how much space they're using.
   */
  getStorageStats(): Promise<{
    used: number; // bytes
    quota: number; // bytes (estimated, may be Infinity)
    cvCount: number;
    applicationCount: number;
  }>;
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if we're in local mode (browser storage).
 */
export function isLocalMode(): boolean {
  return process.env.NEXT_PUBLIC_MODE === "local";
}

/**
 * Check if we're in demo mode (server storage).
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_MODE === "demo" || !process.env.NEXT_PUBLIC_MODE;
}
