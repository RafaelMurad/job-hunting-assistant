/**
 * Vault Types
 *
 * Defines the structure of encrypted user data (the "vault").
 * All user career data is stored in a single encrypted blob.
 *
 * The vault structure mirrors the existing StoredProfile/StoredCV/StoredApplication
 * types from lib/storage/interface.ts but is designed for encrypted storage.
 *
 * @module lib/crypto/vault
 */

// ============================================
// Vault Root Type
// ============================================

/**
 * User vault structure - encrypted before server transmission.
 * This represents ALL user data in a single encrypted blob.
 */
export interface UserVault {
  version: 1;
  profile: VaultProfile;
  applications: VaultApplication[];
  documents: VaultDocument[];
  settings: VaultSettings;
  lastModified: string; // ISO timestamp
}

// ============================================
// Profile Types
// ============================================

export interface VaultProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: VaultExperience[];
  education: VaultEducation[];
  image?: string;
}

export interface VaultExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface VaultEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

// ============================================
// Application Types
// ============================================

// Match the existing app's ApplicationStatus from types/database.ts
export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

export interface VaultApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  jobDescription: string;
  jobUrl?: string;
  matchScore?: number;
  analysis?: string;
  coverLetter?: string;
  cvVersionId?: string; // Reference to documents
  notes?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Document Types
// ============================================

export type DocumentType = "cv" | "cover_letter" | "other";

export interface VaultDocument {
  id: string;
  type: DocumentType;
  name: string;
  content: string; // For text-based (LaTeX, markdown)
  binaryData?: string; // Base64 for PDFs
  mimeType: string;
  isActive?: boolean; // For CVs - which one is currently active
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Settings Types
// ============================================

export interface VaultSettings {
  theme?: "light" | "dark" | "system";
  defaultCvId?: string;
  aiProvider?: string;
  // Note: API keys are stored separately in localStorage, not in vault
  // This ensures they're never transmitted to the server
}

// ============================================
// Factory Functions
// ============================================

/**
 * Create an empty vault for new users.
 *
 * @param email - User's email (used for profile initialization)
 * @returns Empty vault with default structure
 */
export function createEmptyVault(email: string): UserVault {
  return {
    version: 1,
    profile: {
      id: generateId(),
      name: "",
      email,
      skills: [],
      experience: [],
      education: [],
    },
    applications: [],
    documents: [],
    settings: {},
    lastModified: new Date().toISOString(),
  };
}

/**
 * Update the lastModified timestamp on a vault.
 *
 * @param vault - Vault to update
 * @returns New vault with updated timestamp
 */
export function touchVault(vault: UserVault): UserVault {
  return {
    ...vault,
    lastModified: new Date().toISOString(),
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID for vault items.
 * Uses crypto.randomUUID when available, falls back to timestamp-based ID.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `vault_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID (exported for use in other modules).
 */
export { generateId as createVaultId };
