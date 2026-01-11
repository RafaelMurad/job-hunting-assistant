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
  phone?: string | null | undefined;
  location: string;
  summary: string;
  experience: string;
  skills: string[];
  image?: string | null | undefined;
}

export interface UpdateProfileInput {
  name?: string | undefined;
  phone?: string | undefined;
  location?: string | undefined;
  summary?: string | undefined;
  experience?: string | undefined;
  skills?: string[] | undefined;
  image?: string | undefined;
}

export interface CreateCVInput {
  name: string;
  pdfBlob?: Blob | undefined;
  latexContent?: string | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateCVInput {
  name?: string | undefined;
  pdfBlob?: Blob | undefined;
  latexContent?: string | undefined;
  isActive?: boolean | undefined;
}

export interface UploadCVOptions {
  /**
   * Optional AI model to use for LaTeX extraction.
   */
  model?: string | undefined;
  /**
   * Optional template to apply during extraction.
   */
  template?: string | undefined;
  /**
   * If provided, updates this CV instead of creating new.
   */
  cvId?: string | undefined;
}

export interface UploadCVResult {
  cv: StoredCV;
  modelUsed?: string | undefined;
  fallbackUsed?: boolean | undefined;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  jobDescription: string;
  jobUrl?: string | undefined;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status?: ApplicationStatus | undefined;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus | undefined;
  notes?: string | undefined;
  appliedAt?: string | undefined;
  coverLetter?: string | undefined;
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

  /**
   * Upload a CV file (PDF/DOCX/TEX), extract LaTeX, and store.
   * This is the primary method for adding CVs from files.
   *
   * In local mode:
   * - Stores PDF in IndexedDB
   * - Calls /api/ai/extract-latex for AI extraction
   * - Stores LaTeX in IndexedDB
   *
   * In demo mode:
   * - Calls /api/cv/store (full server-side flow)
   */
  uploadCV(file: File, options?: UploadCVOptions): Promise<UploadCVResult>;

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
 *
 * Detection logic (in order of priority):
 * 1. Explicit NEXT_PUBLIC_MODE=local → local mode
 * 2. Explicit NEXT_PUBLIC_MODE=demo → demo mode
 * 3. Running on Vercel (VERCEL env var) → demo mode
 * 4. Hostname is localhost/127.0.0.1 → local mode
 * 5. Hostname contains "demo." → demo mode
 * 6. Default → local mode (privacy-first default)
 */
export function isLocalMode(): boolean {
  // Explicit mode takes priority
  const explicitMode = process.env.NEXT_PUBLIC_MODE;
  if (explicitMode === "local") return true;
  if (explicitMode === "demo") return false;

  // Server-side: check for Vercel environment
  if (typeof window === "undefined") {
    // VERCEL env var is set on Vercel deployments
    if (process.env.VERCEL === "1") return false;
    // NODE_ENV production without explicit mode = likely Vercel
    if (process.env.NODE_ENV === "production") return false;
    // Development = local
    return true;
  }

  // Client-side: check hostname
  const hostname = window.location.hostname;

  // Localhost = local mode
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  // Demo subdomain = demo mode
  if (hostname.startsWith("demo.")) {
    return false;
  }

  // Vercel preview URLs = demo mode
  if (hostname.includes(".vercel.app")) {
    return false;
  }

  // Default: local mode (privacy-first)
  return true;
}

/**
 * Check if we're in demo mode (server storage).
 */
export function isDemoMode(): boolean {
  return !isLocalMode();
}
