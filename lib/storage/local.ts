/**
 * Local Storage Adapter (Dexie/IndexedDB)
 *
 * Implements StorageAdapter for local-only mode.
 * All data is stored in the browser's IndexedDB via Dexie.
 * No server contact, zero liability, full user privacy.
 *
 * @module lib/storage/local
 */

import Dexie, { type Table } from "dexie";
import type {
  CreateApplicationInput,
  CreateCVInput,
  CreateProfileInput,
  ExportedData,
  StorageAdapter,
  StoredApplication,
  StoredCV,
  StoredFile,
  StoredProfile,
  UpdateApplicationInput,
  UpdateCVInput,
  UpdateProfileInput,
} from "./interface";

// ============================================
// Database Schema
// ============================================

/**
 * CareerPal local database using Dexie (IndexedDB wrapper).
 *
 * Schema versioning: Increment version number when adding/modifying tables.
 * Dexie handles migrations automatically.
 */
class CareerPalDB extends Dexie {
  profiles!: Table<StoredProfile, string>;
  cvs!: Table<StoredCV, string>;
  applications!: Table<StoredApplication, string>;
  files!: Table<StoredFile, string>;

  constructor() {
    super("careerpal");

    // Version 1: Initial schema
    this.version(1).stores({
      // Primary key is 'id', indexed fields after
      profiles: "id, email",
      cvs: "id, isActive, createdAt",
      applications: "id, status, company, createdAt",
      files: "id, name, createdAt",
    });
  }
}

// Singleton database instance
const db = new CareerPalDB();

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique ID (similar to cuid but simpler).
 */
function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp.
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Convert a Blob to base64 string for JSON export.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      resolve(base64.split(",")[1] || base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert base64 string back to Blob.
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// ============================================
// Local Storage Adapter Implementation
// ============================================

/**
 * Local storage adapter using Dexie/IndexedDB.
 * Implements the StorageAdapter interface for browser-only storage.
 */
export const localStorageAdapter: StorageAdapter = {
  // ----------------------------------------
  // Profile Operations
  // ----------------------------------------

  async getProfile(): Promise<StoredProfile | null> {
    // In local mode, there's only one profile (id: "local")
    const profile = await db.profiles.get("local");
    return profile ?? null;
  },

  async saveProfile(input: CreateProfileInput | UpdateProfileInput): Promise<StoredProfile> {
    const existing = await db.profiles.get("local");
    const timestamp = now();

    if (existing) {
      // Update existing profile
      const updated: StoredProfile = {
        ...existing,
        ...input,
        skills: input.skills ?? existing.skills,
        updatedAt: timestamp,
      };
      await db.profiles.put(updated);
      return updated;
    }
    // Create new profile
    const createInput = input as CreateProfileInput;
    const profile: StoredProfile = {
      id: "local",
      name: createInput.name,
      email: createInput.email,
      phone: createInput.phone ?? null,
      location: createInput.location,
      summary: createInput.summary,
      experience: createInput.experience,
      skills: createInput.skills,
      image: createInput.image ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.profiles.add(profile);
    return profile;
  },

  // ----------------------------------------
  // CV Operations
  // ----------------------------------------

  async getCVs(): Promise<StoredCV[]> {
    return await db.cvs.orderBy("createdAt").reverse().toArray();
  },

  async getCV(id: string): Promise<StoredCV | null> {
    const cv = await db.cvs.get(id);
    return cv ?? null;
  },

  async getActiveCV(): Promise<StoredCV | null> {
    // Use filter instead of indexed query for boolean fields
    const cv = await db.cvs.filter((cv) => cv.isActive === true).first();
    return cv ?? null;
  },

  async createCV(input: CreateCVInput): Promise<StoredCV> {
    const id = generateId();
    const timestamp = now();

    // If this is set as active, deactivate others
    if (input.isActive) {
      const activeCvs = await db.cvs.filter((cv) => cv.isActive === true).toArray();
      for (const cv of activeCvs) {
        await db.cvs.update(cv.id, { isActive: false });
      }
    }

    // Handle PDF blob - save to files table and reference
    let pdfUrl: string | null = null;
    if (input.pdfBlob) {
      pdfUrl = await this.saveFile(input.pdfBlob, `${input.name}.pdf`);
    }

    const cv: StoredCV = {
      id,
      name: input.name,
      pdfUrl,
      pdfBlob: input.pdfBlob ?? null,
      latexUrl: null,
      latexContent: input.latexContent ?? null,
      isActive: input.isActive ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.cvs.add(cv);
    return cv;
  },

  async updateCV(id: string, input: UpdateCVInput): Promise<StoredCV> {
    const existing = await db.cvs.get(id);
    if (!existing) {
      throw new Error(`CV not found: ${id}`);
    }

    // If setting as active, deactivate others
    if (input.isActive) {
      const activeCvs = await db.cvs.filter((cv) => cv.isActive === true).toArray();
      for (const cv of activeCvs) {
        await db.cvs.update(cv.id, { isActive: false });
      }
    }

    // Handle PDF blob update
    let pdfUrl = existing.pdfUrl;
    let pdfBlob = existing.pdfBlob;
    if (input.pdfBlob) {
      // Delete old file if exists
      if (existing.pdfUrl) {
        await this.deleteFile(existing.pdfUrl);
      }
      pdfUrl = await this.saveFile(input.pdfBlob, `${input.name ?? existing.name}.pdf`);
      pdfBlob = input.pdfBlob;
    }

    const updated: StoredCV = {
      ...existing,
      name: input.name ?? existing.name,
      pdfUrl,
      pdfBlob,
      latexContent: input.latexContent ?? existing.latexContent,
      isActive: input.isActive ?? existing.isActive,
      updatedAt: now(),
    };

    await db.cvs.put(updated);
    return updated;
  },

  async deleteCV(id: string): Promise<void> {
    const cv = await db.cvs.get(id);
    if (cv?.pdfUrl) {
      await this.deleteFile(cv.pdfUrl);
    }
    await db.cvs.delete(id);
  },

  async setActiveCV(id: string): Promise<void> {
    // Deactivate all CVs
    const activeCvs = await db.cvs.filter((cv) => cv.isActive === true).toArray();
    for (const cv of activeCvs) {
      await db.cvs.update(cv.id, { isActive: false });
    }
    // Activate the specified CV
    await db.cvs.update(id, { isActive: true, updatedAt: now() });
  },

  // ----------------------------------------
  // Application Operations
  // ----------------------------------------

  async getApplications(): Promise<StoredApplication[]> {
    return await db.applications.orderBy("createdAt").reverse().toArray();
  },

  async getApplication(id: string): Promise<StoredApplication | null> {
    const app = await db.applications.get(id);
    return app ?? null;
  },

  async createApplication(input: CreateApplicationInput): Promise<StoredApplication> {
    const id = generateId();
    const timestamp = now();

    const application: StoredApplication = {
      id,
      company: input.company,
      role: input.role,
      jobDescription: input.jobDescription,
      jobUrl: input.jobUrl ?? null,
      matchScore: input.matchScore,
      analysis: input.analysis,
      coverLetter: input.coverLetter,
      status: input.status ?? "saved",
      appliedAt: null,
      notes: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.applications.add(application);
    return application;
  },

  async updateApplication(id: string, input: UpdateApplicationInput): Promise<StoredApplication> {
    const existing = await db.applications.get(id);
    if (!existing) {
      throw new Error(`Application not found: ${id}`);
    }

    const updated: StoredApplication = {
      ...existing,
      status: input.status ?? existing.status,
      notes: input.notes ?? existing.notes,
      appliedAt: input.appliedAt ?? existing.appliedAt,
      coverLetter: input.coverLetter ?? existing.coverLetter,
      updatedAt: now(),
    };

    await db.applications.put(updated);
    return updated;
  },

  async deleteApplication(id: string): Promise<void> {
    await db.applications.delete(id);
  },

  // ----------------------------------------
  // File Operations
  // ----------------------------------------

  async saveFile(file: Blob, name: string): Promise<string> {
    const id = generateId();
    const timestamp = now();

    const storedFile: StoredFile = {
      id,
      name,
      mimeType: file.type,
      size: file.size,
      blob: file,
      createdAt: timestamp,
    };

    await db.files.add(storedFile);

    // Return the ID as the "URL" for local storage
    return `local://${id}`;
  },

  async getFile(idOrUrl: string): Promise<Blob | null> {
    // Extract ID from local:// URL
    const id = idOrUrl.replace("local://", "");
    const file = await db.files.get(id);
    return file?.blob ?? null;
  },

  async deleteFile(idOrUrl: string): Promise<void> {
    const id = idOrUrl.replace("local://", "");
    await db.files.delete(id);
  },

  // ----------------------------------------
  // Data Management
  // ----------------------------------------

  async exportAll(): Promise<ExportedData> {
    const [profile, cvs, applications, files] = await Promise.all([
      this.getProfile(),
      this.getCVs(),
      this.getApplications(),
      db.files.toArray(),
    ]);

    // Convert file blobs to base64 for JSON export
    const filesWithBase64 = await Promise.all(
      files.map(async (file) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        base64: await blobToBase64(file.blob),
      }))
    );

    // Remove pdfBlob from CVs (already in files)
    const cvsWithoutBlobs = cvs.map(({ pdfBlob: _pdfBlob, ...cv }) => cv) as StoredCV[];

    return {
      version: "1.0",
      exportedAt: now(),
      profile,
      cvs: cvsWithoutBlobs,
      applications,
      files: filesWithBase64,
    };
  },

  async importAll(data: ExportedData): Promise<void> {
    // Clear existing data first
    await this.clearAll();

    // Import profile
    if (data.profile) {
      await db.profiles.add(data.profile);
    }

    // Import files (convert base64 back to Blob)
    for (const file of data.files) {
      const blob = base64ToBlob(file.base64, file.mimeType);
      await db.files.add({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: blob.size,
        blob,
        createdAt: now(),
      });
    }

    // Import CVs
    for (const cv of data.cvs) {
      await db.cvs.add(cv);
    }

    // Import applications
    for (const app of data.applications) {
      await db.applications.add(app);
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      db.profiles.clear(),
      db.cvs.clear(),
      db.applications.clear(),
      db.files.clear(),
    ]);
  },

  async getStorageStats(): Promise<{
    used: number;
    quota: number;
    cvCount: number;
    applicationCount: number;
  }> {
    const [cvCount, applicationCount] = await Promise.all([
      db.cvs.count(),
      db.applications.count(),
    ]);

    // Try to get storage estimate (modern browsers)
    let used = 0;
    let quota = Infinity;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        used = estimate.usage ?? 0;
        quota = estimate.quota ?? Infinity;
      } catch {
        // Storage estimate not available
      }
    }

    return { used, quota, cvCount, applicationCount };
  },
};

// Export the database instance for advanced use cases (testing, debugging)
export { db as localDB };
