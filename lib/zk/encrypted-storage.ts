/**
 * Encrypted Storage Adapter
 *
 * Implements StorageAdapter interface for zero-knowledge mode.
 * All data is stored in an encrypted vault, synced to server.
 * The server never sees plaintext data.
 *
 * @module lib/zk/encrypted-storage
 */

import type {
  StorageAdapter,
  StoredProfile,
  StoredCV,
  StoredApplication,
  CreateProfileInput,
  UpdateProfileInput,
  CreateCVInput,
  UpdateCVInput,
  CreateApplicationInput,
  UpdateApplicationInput,
  ExportedData,
  UploadCVOptions,
  UploadCVResult,
} from "@/lib/storage/interface";
import {
  createEmptyVault,
  createVaultId,
  touchVault,
  type UserVault,
  type VaultProfile,
  type VaultApplication,
  type VaultDocument,
} from "@/lib/crypto";
import { loadVault, syncVault } from "./vault-sync";

// ============================================
// Types
// ============================================

interface EncryptedStorageConfig {
  token: string;
  masterKey: Uint8Array;
  email: string;
}

// ============================================
// Conversion Helpers
// ============================================

function vaultProfileToStored(profile: VaultProfile): StoredProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location ?? "",
    summary: profile.summary ?? "",
    experience: profile.experience.map((e) => `${e.role} at ${e.company}`).join("\n"),
    skills: profile.skills,
    image: profile.image,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function vaultDocumentToStoredCV(doc: VaultDocument): StoredCV {
  return {
    id: doc.id,
    name: doc.name,
    pdfUrl: null,
    pdfBlob: doc.binaryData ? base64ToBlob(doc.binaryData, doc.mimeType) : null,
    latexUrl: null,
    latexContent: doc.content,
    isActive: doc.isActive ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function vaultApplicationToStored(app: VaultApplication): StoredApplication {
  return {
    id: app.id,
    company: app.company,
    role: app.role,
    jobDescription: app.jobDescription,
    jobUrl: app.jobUrl,
    matchScore: app.matchScore ?? 0,
    analysis: app.analysis ?? "",
    coverLetter: app.coverLetter ?? "",
    status: app.status,
    appliedAt: app.appliedAt,
    notes: app.notes,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

// ============================================
// Utility Functions
// ============================================

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = (): void => {
      const base64 = reader.result as string;
      resolve(base64.split(",")[1] ?? base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function generateId(): string {
  return createVaultId();
}

function now(): string {
  return new Date().toISOString();
}

// ============================================
// Factory Function
// ============================================

/**
 * Create an encrypted storage adapter.
 *
 * The adapter maintains an in-memory copy of the vault and syncs
 * to the server on mutations.
 */
export function createEncryptedStorageAdapter(config: EncryptedStorageConfig): StorageAdapter {
  const { token, masterKey, email } = config;

  // In-memory vault cache
  let vault: UserVault | null = null;
  let isLoaded = false;

  // ----------------------------------------
  // Vault Loading
  // ----------------------------------------

  async function ensureLoaded(): Promise<UserVault> {
    if (!isLoaded || !vault) {
      const result = await loadVault(token, masterKey, email);
      vault = result.vault;
      isLoaded = true;
    }
    return vault;
  }

  async function saveAndSync(): Promise<void> {
    if (!vault) return;
    vault = touchVault(vault);
    await syncVault(token, masterKey, vault);
  }

  // ----------------------------------------
  // Storage Adapter Implementation
  // ----------------------------------------

  const adapter: StorageAdapter = {
    // Profile Operations
    async getProfile(): Promise<StoredProfile | null> {
      const v = await ensureLoaded();
      if (!v.profile.name && !v.profile.email) return null;
      return vaultProfileToStored(v.profile);
    },

    async saveProfile(input: CreateProfileInput | UpdateProfileInput): Promise<StoredProfile> {
      const v = await ensureLoaded();

      // Update profile fields, handling optional properties carefully
      // Convert null to undefined for vault compatibility
      if (input.name !== undefined) v.profile.name = input.name;
      if (input.phone !== undefined && input.phone !== null) v.profile.phone = input.phone;
      if (input.location !== undefined) v.profile.location = input.location;
      if (input.summary !== undefined) v.profile.summary = input.summary;
      if (input.skills !== undefined) v.profile.skills = input.skills;
      if (input.image !== undefined && input.image !== null) v.profile.image = input.image;

      await saveAndSync();
      return vaultProfileToStored(v.profile);
    },

    // CV Operations
    async getCVs(): Promise<StoredCV[]> {
      const v = await ensureLoaded();
      return v.documents.filter((d) => d.type === "cv").map(vaultDocumentToStoredCV);
    },

    async getCV(id: string): Promise<StoredCV | null> {
      const v = await ensureLoaded();
      const doc = v.documents.find((d) => d.id === id && d.type === "cv");
      return doc ? vaultDocumentToStoredCV(doc) : null;
    },

    async getActiveCV(): Promise<StoredCV | null> {
      const v = await ensureLoaded();
      const doc = v.documents.find((d) => d.type === "cv" && d.isActive);
      return doc ? vaultDocumentToStoredCV(doc) : null;
    },

    async createCV(input: CreateCVInput): Promise<StoredCV> {
      const v = await ensureLoaded();
      const timestamp = now();

      // If this is active, deactivate others
      if (input.isActive) {
        v.documents.forEach((d) => {
          if (d.type === "cv") d.isActive = false;
        });
      }

      const doc: VaultDocument = {
        id: generateId(),
        type: "cv",
        name: input.name,
        content: input.latexContent ?? "",
        mimeType: "application/pdf",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      if (input.pdfBlob) {
        doc.binaryData = await blobToBase64(input.pdfBlob);
      }
      if (input.isActive !== undefined) {
        doc.isActive = input.isActive;
      }

      v.documents.push(doc);
      await saveAndSync();
      return vaultDocumentToStoredCV(doc);
    },

    async updateCV(id: string, input: UpdateCVInput): Promise<StoredCV> {
      const v = await ensureLoaded();
      const docIndex = v.documents.findIndex((d) => d.id === id);

      if (docIndex === -1) {
        throw new Error(`CV not found: ${id}`);
      }

      // If setting as active, deactivate others
      if (input.isActive) {
        v.documents.forEach((d) => {
          if (d.type === "cv") d.isActive = false;
        });
      }

      const doc = v.documents[docIndex];
      if (!doc) throw new Error(`CV not found: ${id}`);

      const updatedDoc: VaultDocument = {
        ...doc,
        name: input.name ?? doc.name,
        content: input.latexContent ?? doc.content,
        updatedAt: now(),
      };
      if (input.pdfBlob) {
        updatedDoc.binaryData = await blobToBase64(input.pdfBlob);
      } else if (doc.binaryData) {
        updatedDoc.binaryData = doc.binaryData;
      }
      if (input.isActive !== undefined) {
        updatedDoc.isActive = input.isActive;
      } else if (doc.isActive !== undefined) {
        updatedDoc.isActive = doc.isActive;
      }
      v.documents[docIndex] = updatedDoc;

      await saveAndSync();
      return vaultDocumentToStoredCV(v.documents[docIndex]!);
    },

    async deleteCV(id: string): Promise<void> {
      const v = await ensureLoaded();
      v.documents = v.documents.filter((d) => d.id !== id);
      await saveAndSync();
    },

    async setActiveCV(id: string): Promise<void> {
      const v = await ensureLoaded();
      v.documents.forEach((d) => {
        if (d.type === "cv") {
          d.isActive = d.id === id;
        }
      });
      await saveAndSync();
    },

    async uploadCV(file: File, options?: UploadCVOptions): Promise<UploadCVResult> {
      // Call AI extraction endpoint
      const formData = new FormData();
      formData.append("file", file);
      if (options?.model) formData.append("model", options.model);
      if (options?.template) formData.append("template", options.template);

      const response = await fetch("/api/ai/extract-latex", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? "Failed to extract LaTeX from file");
      }

      const extractionResult = (await response.json()) as {
        latexContent: string;
        modelUsed?: string;
        fallbackUsed?: boolean;
      };

      // Convert to blob
      const arrayBuffer = await file.arrayBuffer();
      const pdfBlob = new Blob([arrayBuffer], { type: file.type });
      const cvName = file.name.replace(/\.[^/.]+$/, "");

      let cv: StoredCV;
      if (options?.cvId) {
        cv = await this.updateCV(options.cvId, {
          name: cvName,
          pdfBlob,
          latexContent: extractionResult.latexContent,
        });
      } else {
        const existingCvs = await this.getCVs();
        cv = await this.createCV({
          name: cvName,
          pdfBlob,
          latexContent: extractionResult.latexContent,
          isActive: existingCvs.length === 0,
        });
      }

      return {
        cv,
        modelUsed: extractionResult.modelUsed,
        fallbackUsed: extractionResult.fallbackUsed,
      };
    },

    // Application Operations
    async getApplications(): Promise<StoredApplication[]> {
      const v = await ensureLoaded();
      return v.applications.map(vaultApplicationToStored);
    },

    async getApplication(id: string): Promise<StoredApplication | null> {
      const v = await ensureLoaded();
      const app = v.applications.find((a) => a.id === id);
      return app ? vaultApplicationToStored(app) : null;
    },

    async createApplication(input: CreateApplicationInput): Promise<StoredApplication> {
      const v = await ensureLoaded();
      const timestamp = now();

      const app: VaultApplication = {
        id: generateId(),
        company: input.company,
        role: input.role,
        status: input.status ?? "saved",
        jobDescription: input.jobDescription,
        matchScore: input.matchScore,
        analysis: input.analysis,
        coverLetter: input.coverLetter,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      if (input.jobUrl) app.jobUrl = input.jobUrl;

      v.applications.push(app);
      await saveAndSync();
      return vaultApplicationToStored(app);
    },

    async updateApplication(id: string, input: UpdateApplicationInput): Promise<StoredApplication> {
      const v = await ensureLoaded();
      const appIndex = v.applications.findIndex((a) => a.id === id);

      if (appIndex === -1) {
        throw new Error(`Application not found: ${id}`);
      }

      const app = v.applications[appIndex];
      if (!app) throw new Error(`Application not found: ${id}`);

      const updatedApp: VaultApplication = {
        ...app,
        status: input.status ?? app.status,
        updatedAt: now(),
      };
      // Handle optional fields explicitly
      if (input.notes !== undefined) updatedApp.notes = input.notes;
      else if (app.notes !== undefined) updatedApp.notes = app.notes;
      if (input.appliedAt !== undefined) updatedApp.appliedAt = input.appliedAt;
      else if (app.appliedAt !== undefined) updatedApp.appliedAt = app.appliedAt;
      if (input.coverLetter !== undefined) updatedApp.coverLetter = input.coverLetter;
      else if (app.coverLetter !== undefined) updatedApp.coverLetter = app.coverLetter;
      v.applications[appIndex] = updatedApp;

      await saveAndSync();
      return vaultApplicationToStored(v.applications[appIndex]!);
    },

    async deleteApplication(id: string): Promise<void> {
      const v = await ensureLoaded();
      v.applications = v.applications.filter((a) => a.id !== id);
      await saveAndSync();
    },

    // File Operations (stored in vault as base64)
    async saveFile(file: Blob, name: string): Promise<string> {
      const v = await ensureLoaded();
      const id = generateId();
      const timestamp = now();

      const doc: VaultDocument = {
        id,
        type: "other",
        name,
        content: "",
        binaryData: await blobToBase64(file),
        mimeType: file.type,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      v.documents.push(doc);
      await saveAndSync();
      return `vault://${id}`;
    },

    async getFile(idOrUrl: string): Promise<Blob | null> {
      const v = await ensureLoaded();
      const id = idOrUrl.replace("vault://", "");
      const doc = v.documents.find((d) => d.id === id);

      if (!doc?.binaryData) return null;
      return base64ToBlob(doc.binaryData, doc.mimeType);
    },

    async deleteFile(idOrUrl: string): Promise<void> {
      const v = await ensureLoaded();
      const id = idOrUrl.replace("vault://", "");
      v.documents = v.documents.filter((d) => d.id !== id);
      await saveAndSync();
    },

    // Data Management
    async exportAll(): Promise<ExportedData> {
      const v = await ensureLoaded();
      const profile = vaultProfileToStored(v.profile);
      const cvs = v.documents.filter((d) => d.type === "cv").map(vaultDocumentToStoredCV);
      const applications = v.applications.map(vaultApplicationToStored);

      return {
        version: "1.0",
        exportedAt: now(),
        profile,
        cvs,
        applications,
        files: v.documents
          .filter((d) => d.binaryData)
          .map((d) => ({
            id: d.id,
            name: d.name,
            mimeType: d.mimeType,
            base64: d.binaryData!,
          })),
      };
    },

    async importAll(data: ExportedData): Promise<void> {
      // Create a new vault from imported data
      vault = createEmptyVault(email);

      // Import profile
      if (data.profile) {
        vault.profile.id = data.profile.id;
        vault.profile.name = data.profile.name;
        vault.profile.email = data.profile.email;
        vault.profile.location = data.profile.location;
        vault.profile.summary = data.profile.summary;
        vault.profile.skills = data.profile.skills;
        if (data.profile.phone) vault.profile.phone = data.profile.phone;
        if (data.profile.image) vault.profile.image = data.profile.image;
      }

      // Import CVs as documents
      for (const cv of data.cvs) {
        const file = data.files.find((f) => f.id === cv.id);
        const doc: VaultDocument = {
          id: cv.id,
          type: "cv",
          name: cv.name,
          content: cv.latexContent ?? "",
          mimeType: "application/pdf",
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt,
        };
        if (file?.base64) doc.binaryData = file.base64;
        if (cv.isActive) doc.isActive = cv.isActive;
        vault.documents.push(doc);
      }

      // Import applications
      for (const app of data.applications) {
        // Map status to vault status type
        const status = app.status as VaultApplication["status"];
        const vaultApp: VaultApplication = {
          id: app.id,
          company: app.company,
          role: app.role,
          status,
          jobDescription: app.jobDescription,
          matchScore: app.matchScore,
          analysis: app.analysis,
          coverLetter: app.coverLetter,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        };
        if (app.jobUrl) vaultApp.jobUrl = app.jobUrl;
        if (app.notes) vaultApp.notes = app.notes;
        if (app.appliedAt) vaultApp.appliedAt = app.appliedAt;
        vault.applications.push(vaultApp);
      }

      await saveAndSync();
    },

    async clearAll(): Promise<void> {
      vault = createEmptyVault(email);
      await saveAndSync();
    },

    async getStorageStats(): Promise<{
      used: number;
      quota: number;
      cvCount: number;
      applicationCount: number;
    }> {
      const v = await ensureLoaded();

      return {
        used: JSON.stringify(v).length, // Rough estimate
        quota: Infinity, // Server-side, no client quota
        cvCount: v.documents.filter((d) => d.type === "cv").length,
        applicationCount: v.applications.length,
      };
    },
  };

  return adapter;
}
