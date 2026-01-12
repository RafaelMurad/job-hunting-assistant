/**
 * Server Storage Adapter (tRPC/Prisma)
 *
 * Implements StorageAdapter for demo mode.
 * Wraps existing tRPC procedures to match the storage interface.
 * All data is stored in PostgreSQL via Prisma.
 *
 * NOTE: This adapter uses fetch to call tRPC endpoints.
 * For use in React components, prefer using tRPC hooks directly
 * or the storage provider which handles both modes.
 *
 * @module lib/storage/server
 */

import type {
  CreateApplicationInput,
  CreateCVInput,
  CreateProfileInput,
  ExportedData,
  StorageAdapter,
  StoredApplication,
  StoredCV,
  StoredProfile,
  UpdateApplicationInput,
  UpdateCVInput,
  UpdateProfileInput,
  UploadCVOptions,
  UploadCVResult,
} from "./interface";

// ============================================
// tRPC Fetch Helper
// ============================================

/**
 * Call a tRPC procedure via fetch.
 * This allows the storage adapter to work outside React components.
 */
async function callTRPC<T>(
  procedure: string,
  input?: unknown,
  method: "query" | "mutation" = "query"
): Promise<T> {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/api/trpc/${procedure}`;

  const options: RequestInit = {
    method: method === "mutation" ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for auth
  };

  if (method === "mutation" && input !== undefined) {
    options.body = JSON.stringify({ json: input });
  } else if (method === "query" && input !== undefined) {
    const params = new URLSearchParams({
      input: JSON.stringify({ json: input }),
    });
    const response = await fetch(`${url}?${params}`, options);
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || "tRPC query failed");
    }
    return data.result?.data?.json ?? data.result?.data;
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "tRPC call failed");
  }

  return data.result?.data?.json ?? data.result?.data;
}

// ============================================
// Type Converters
// ============================================

/**
 * Convert Prisma User to StoredProfile.
 */
function toStoredProfile(user: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location: string;
  summary: string;
  experience: string;
  skills: string;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}): StoredProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    summary: user.summary,
    experience: user.experience,
    skills: user.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    image: user.image,
    createdAt: typeof user.createdAt === "string" ? user.createdAt : user.createdAt.toISOString(),
    updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : user.updatedAt.toISOString(),
  };
}

/**
 * Convert Prisma CV to StoredCV.
 */
function toStoredCV(cv: {
  id: string;
  name: string;
  pdfUrl?: string | null;
  latexUrl?: string | null;
  latexContent?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}): StoredCV {
  return {
    id: cv.id,
    name: cv.name,
    pdfUrl: cv.pdfUrl,
    pdfBlob: null, // Server mode uses URLs, not blobs
    latexUrl: cv.latexUrl,
    latexContent: cv.latexContent,
    isActive: cv.isActive,
    createdAt: typeof cv.createdAt === "string" ? cv.createdAt : cv.createdAt.toISOString(),
    updatedAt: typeof cv.updatedAt === "string" ? cv.updatedAt : cv.updatedAt.toISOString(),
  };
}

/**
 * Convert Prisma Application to StoredApplication.
 */
function toStoredApplication(app: {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  jobUrl?: string | null;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status: string;
  appliedAt?: string | Date | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}): StoredApplication {
  return {
    id: app.id,
    company: app.company,
    role: app.role,
    jobDescription: app.jobDescription,
    jobUrl: app.jobUrl,
    matchScore: app.matchScore,
    analysis: app.analysis,
    coverLetter: app.coverLetter,
    status: app.status as StoredApplication["status"],
    appliedAt: app.appliedAt
      ? typeof app.appliedAt === "string"
        ? app.appliedAt
        : app.appliedAt.toISOString()
      : null,
    notes: app.notes,
    createdAt: typeof app.createdAt === "string" ? app.createdAt : app.createdAt.toISOString(),
    updatedAt: typeof app.updatedAt === "string" ? app.updatedAt : app.updatedAt.toISOString(),
  };
}

// ============================================
// Server Storage Adapter Implementation
// ============================================

/**
 * Server storage adapter using tRPC/Prisma.
 * Implements the StorageAdapter interface for demo mode.
 */
export const serverStorageAdapter: StorageAdapter = {
  // ----------------------------------------
  // Profile Operations
  // ----------------------------------------

  async getProfile(): Promise<StoredProfile | null> {
    try {
      const result = await callTRPC<{ user: unknown }>("user.get");
      if (!result?.user) return null;
      return toStoredProfile(result.user as Parameters<typeof toStoredProfile>[0]);
    } catch {
      return null;
    }
  },

  async saveProfile(input: CreateProfileInput | UpdateProfileInput): Promise<StoredProfile> {
    // For server mode, we need email for upsert
    const profileInput = {
      name: input.name ?? "",
      email: (input as CreateProfileInput).email ?? "",
      phone: input.phone,
      location: input.location ?? "",
      summary: input.summary ?? "",
      experience: input.experience ?? "",
      skills: input.skills?.join(", ") ?? "",
    };

    const result = await callTRPC<{ user: unknown }>("user.upsert", profileInput, "mutation");
    return toStoredProfile(result.user as Parameters<typeof toStoredProfile>[0]);
  },

  // ----------------------------------------
  // CV Operations
  // ----------------------------------------

  async getCVs(): Promise<StoredCV[]> {
    const cvs = await callTRPC<unknown[]>("cv.list");
    return cvs.map((cv) => toStoredCV(cv as Parameters<typeof toStoredCV>[0]));
  },

  async getCV(id: string): Promise<StoredCV | null> {
    try {
      const cv = await callTRPC<unknown>("cv.get", { id });
      if (!cv) return null;
      return toStoredCV(cv as Parameters<typeof toStoredCV>[0]);
    } catch {
      return null;
    }
  },

  async getActiveCV(): Promise<StoredCV | null> {
    try {
      const cv = await callTRPC<unknown>("cv.getActive");
      if (!cv) return null;
      return toStoredCV(cv as Parameters<typeof toStoredCV>[0]);
    } catch {
      return null;
    }
  },

  async createCV(input: CreateCVInput): Promise<StoredCV> {
    // For server mode, we need to upload the PDF blob to Vercel Blob first
    let pdfUrl: string | undefined;

    if (input.pdfBlob) {
      pdfUrl = await this.saveFile(input.pdfBlob, `${input.name}.pdf`);
    }

    const cv = await callTRPC<unknown>(
      "cv.create",
      {
        name: input.name,
        pdfUrl,
        latexContent: input.latexContent,
        isActive: input.isActive,
      },
      "mutation"
    );

    return toStoredCV(cv as Parameters<typeof toStoredCV>[0]);
  },

  async updateCV(id: string, input: UpdateCVInput): Promise<StoredCV> {
    // Handle PDF blob update
    let pdfUrl: string | undefined;
    if (input.pdfBlob) {
      pdfUrl = await this.saveFile(input.pdfBlob, `${input.name ?? "cv"}.pdf`);
    }

    const cv = await callTRPC<unknown>(
      "cv.update",
      {
        id,
        name: input.name,
        pdfUrl,
        latexContent: input.latexContent,
      },
      "mutation"
    );

    return toStoredCV(cv as Parameters<typeof toStoredCV>[0]);
  },

  async deleteCV(id: string): Promise<void> {
    await callTRPC<unknown>("cv.delete", { id }, "mutation");
  },

  async setActiveCV(id: string): Promise<void> {
    await callTRPC<unknown>("cv.setActive", { id }, "mutation");
  },

  async uploadCV(file: File, options?: UploadCVOptions): Promise<UploadCVResult> {
    // Server mode: call the existing /api/cv/store endpoint
    const formData = new FormData();
    formData.append("file", file);
    if (options?.model) {
      formData.append("model", options.model);
    }
    if (options?.template) {
      formData.append("template", options.template);
    }
    if (options?.cvId) {
      formData.append("cvId", options.cvId);
    }

    const response = await fetch("/api/cv/store", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorData.error ?? "Failed to upload CV");
    }

    const data = (await response.json()) as {
      id: string;
      name: string;
      pdfUrl?: string | null;
      latexUrl?: string | null;
      latexContent?: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      modelUsed?: string;
      fallbackUsed?: boolean;
    };

    return {
      cv: toStoredCV(data),
      modelUsed: data.modelUsed,
      fallbackUsed: data.fallbackUsed,
    };
  },

  // ----------------------------------------
  // Application Operations
  // ----------------------------------------

  async getApplications(): Promise<StoredApplication[]> {
    const apps = await callTRPC<unknown[]>("applications.list");
    return apps.map((app) => toStoredApplication(app as Parameters<typeof toStoredApplication>[0]));
  },

  async getApplication(id: string): Promise<StoredApplication | null> {
    // The applications router doesn't have a get single, use list and filter
    const apps = await this.getApplications();
    return apps.find((app) => app.id === id) ?? null;
  },

  async createApplication(input: CreateApplicationInput): Promise<StoredApplication> {
    const app = await callTRPC<unknown>(
      "applications.create",
      {
        company: input.company,
        role: input.role,
        jobDescription: input.jobDescription,
        jobUrl: input.jobUrl,
        matchScore: input.matchScore,
        analysis: input.analysis,
        coverLetter: input.coverLetter,
        status: input.status,
      },
      "mutation"
    );

    return toStoredApplication(app as Parameters<typeof toStoredApplication>[0]);
  },

  async updateApplication(id: string, input: UpdateApplicationInput): Promise<StoredApplication> {
    const app = await callTRPC<unknown>(
      "applications.update",
      {
        id,
        status: input.status,
        notes: input.notes,
      },
      "mutation"
    );

    return toStoredApplication(app as Parameters<typeof toStoredApplication>[0]);
  },

  async deleteApplication(id: string): Promise<void> {
    await callTRPC<unknown>("applications.delete", { id }, "mutation");
  },

  // ----------------------------------------
  // File Operations (Vercel Blob)
  // ----------------------------------------

  async saveFile(file: Blob, name: string): Promise<string> {
    // Upload to our CV store endpoint
    const formData = new FormData();
    formData.append("file", file, name);

    const response = await fetch("/api/cv/upload-file", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const data = await response.json();
    return data.url;
  },

  async getFile(idOrUrl: string): Promise<Blob | null> {
    // For server mode, URLs are direct Vercel Blob URLs
    // Just fetch the URL
    try {
      const response = await fetch(idOrUrl);
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  },

  async deleteFile(_idOrUrl: string): Promise<void> {
    // Vercel Blob deletion would require server-side call
    // For now, files are cleaned up when CVs are deleted
    // TODO: Implement Vercel Blob deletion via API route
  },

  // ----------------------------------------
  // Data Management
  // ----------------------------------------

  async exportAll(): Promise<ExportedData> {
    const [profile, cvs, applications] = await Promise.all([
      this.getProfile(),
      this.getCVs(),
      this.getApplications(),
    ]);

    // For server mode, we don't include file blobs in export
    // Users can download their PDFs separately
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      profile,
      cvs,
      applications,
      files: [], // Files are stored in Vercel Blob, URLs in CV records
    };
  },

  async importAll(_data: ExportedData): Promise<void> {
    // Import is more complex for server mode
    // Would need to upload files to Vercel Blob, create records, etc.
    // For now, this is a stub - demo mode doesn't support full import
    throw new Error(
      "Import is not supported in demo mode. Use local mode for full data portability."
    );
  },

  async clearAll(): Promise<void> {
    // Delete all user data
    // This would need a dedicated API endpoint
    // For now, throw an error
    throw new Error("Clear all is not supported in demo mode for safety. Contact admin.");
  },

  async getStorageStats(): Promise<{
    used: number;
    quota: number;
    cvCount: number;
    applicationCount: number;
  }> {
    const [cvs, applications] = await Promise.all([this.getCVs(), this.getApplications()]);

    return {
      used: 0, // Server-side storage, not tracked client-side
      quota: Infinity,
      cvCount: cvs.length,
      applicationCount: applications.length,
    };
  },

  // ----------------------------------------
  // Embedding Operations (Local AI only)
  // ----------------------------------------
  // Embeddings are only stored locally - demo mode doesn't support them

  async getEmbedding(): Promise<null> {
    return null; // Demo mode doesn't store embeddings
  },

  async saveEmbedding(): Promise<never> {
    throw new Error("Embeddings are only supported in local mode.");
  },

  async deleteEmbedding(): Promise<void> {
    // No-op in demo mode
  },

  async getAllEmbeddings(): Promise<[]> {
    return []; // Demo mode doesn't store embeddings
  },

  async clearEmbeddings(): Promise<void> {
    // No-op in demo mode
  },
};
