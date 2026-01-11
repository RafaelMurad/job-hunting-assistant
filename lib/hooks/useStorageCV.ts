/**
 * useStorageCV Hook
 *
 * Storage-aware hook for CV operations.
 * Automatically uses IndexedDB (local) or tRPC (demo) based on mode.
 *
 * @module lib/hooks/useStorageCV
 */

"use client";

import type {
  CreateCVInput as StorageCreateCVInput,
  UpdateCVInput as StorageUpdateCVInput,
  StoredCV,
  UploadCVOptions,
} from "@/lib/storage/interface";
import { useIsLocalMode, useStorage } from "@/lib/storage/provider";
import { trpc } from "@/lib/trpc/client";
import { getErrorMessage } from "@/lib/trpc/errors";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * CV data structure for UI consumption.
 */
export interface CVData {
  id: string;
  name: string;
  pdfUrl: string | null;
  latexUrl: string | null;
  latexContent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a CV.
 */
export interface CreateCVInput {
  name: string;
  pdfUrl?: string;
  latexUrl?: string;
  latexContent?: string;
  isActive?: boolean;
}

/**
 * Input for updating a CV.
 */
export interface UpdateCVInput {
  id: string;
  name?: string;
  pdfUrl?: string | null;
  latexUrl?: string | null;
  latexContent?: string | null;
}

/**
 * Result from uploading a CV file.
 */
export interface UploadCVResult {
  cv: CVData;
  modelUsed?: string | undefined;
  fallbackUsed?: boolean | undefined;
}

/**
 * Return type for useStorageCV hook.
 */
export interface UseStorageCVReturn {
  cvs: CVData[];
  activeCV: CVData | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  uploading: boolean;
  error: string | null;
  create: (input: CreateCVInput) => Promise<CVData | null>;
  update: (input: UpdateCVInput) => Promise<CVData | null>;
  remove: (id: string) => Promise<boolean>;
  setActive: (id: string) => Promise<boolean>;
  upload: (file: File, options?: UploadCVOptions) => Promise<UploadCVResult | null>;
  refetch: () => void;
  canAddMore: boolean;
  maxCVs: number;
}

const MAX_CVS = 5;

/**
 * Convert StoredCV to CVData.
 * Ensures empty strings are converted to null for URL fields.
 */
function storedCVToData(cv: StoredCV): CVData {
  return {
    id: cv.id,
    name: cv.name,
    pdfUrl: cv.pdfUrl && cv.pdfUrl.length > 0 ? cv.pdfUrl : null,
    latexUrl: cv.latexUrl && cv.latexUrl.length > 0 ? cv.latexUrl : null,
    latexContent: cv.latexContent ?? null,
    isActive: cv.isActive,
    createdAt: cv.createdAt,
    updatedAt: cv.updatedAt,
  };
}

/**
 * Hook for CV operations with automatic storage selection.
 */
export function useStorageCV(): UseStorageCVReturn {
  const isLocal = useIsLocalMode();
  const storage = useStorage();

  // State for local mode
  const [localCVs, setLocalCVs] = useState<CVData[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localCreating, setLocalCreating] = useState(false);
  const [localUpdating, setLocalUpdating] = useState(false);
  const [localDeleting, setLocalDeleting] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // State for demo mode uploading (not tRPC, uses fetch)
  const [demoUploading, setDemoUploading] = useState(false);

  // tRPC for demo mode
  const cvsQuery = trpc.cv.list.useQuery(undefined, { enabled: !isLocal });
  const createMutation = trpc.cv.create.useMutation({
    onSuccess: () => void cvsQuery.refetch(),
  });
  const updateMutation = trpc.cv.update.useMutation({
    onSuccess: () => void cvsQuery.refetch(),
  });
  const deleteMutation = trpc.cv.delete.useMutation({
    onSuccess: () => void cvsQuery.refetch(),
  });
  const setActiveMutation = trpc.cv.setActive.useMutation({
    onSuccess: () => void cvsQuery.refetch(),
  });

  // Fetch CVs from local storage
  const fetchLocalCVs = useCallback(async () => {
    if (!isLocal) return;
    setLocalLoading(true);
    try {
      const cvs = await storage.getCVs();
      setLocalCVs(cvs.map(storedCVToData));
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to load CVs");
    } finally {
      setLocalLoading(false);
    }
  }, [isLocal, storage]);

  // Initial fetch for local mode
  useEffect(() => {
    if (isLocal) {
      void fetchLocalCVs();
    }
  }, [isLocal, fetchLocalCVs]);

  // Create CV
  const create = useCallback(
    async (input: CreateCVInput): Promise<CVData | null> => {
      if (isLocal) {
        setLocalCreating(true);
        setLocalError(null);
        try {
          const storageInput: StorageCreateCVInput = {
            name: input.name,
            ...(input.latexContent !== undefined && { latexContent: input.latexContent }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
          };
          const newCV = await storage.createCV(storageInput);
          await fetchLocalCVs();
          return storedCVToData(newCV);
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to create CV");
          return null;
        } finally {
          setLocalCreating(false);
        }
      } else {
        try {
          const result = await createMutation.mutateAsync(input);
          return {
            id: result.id,
            name: result.name,
            pdfUrl: result.pdfUrl,
            latexUrl: result.latexUrl,
            latexContent: result.latexContent,
            isActive: result.isActive,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          };
        } catch {
          return null;
        }
      }
    },
    [isLocal, storage, fetchLocalCVs, createMutation]
  );

  // Update CV
  const update = useCallback(
    async (input: UpdateCVInput): Promise<CVData | null> => {
      if (isLocal) {
        setLocalUpdating(true);
        setLocalError(null);
        try {
          const storageInput: StorageUpdateCVInput = {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.latexContent !== undefined &&
              input.latexContent !== null && { latexContent: input.latexContent }),
          };
          const updated = await storage.updateCV(input.id, storageInput);
          await fetchLocalCVs();
          return storedCVToData(updated);
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to update CV");
          return null;
        } finally {
          setLocalUpdating(false);
        }
      } else {
        try {
          const result = await updateMutation.mutateAsync(input);
          return {
            id: result.id,
            name: result.name,
            pdfUrl: result.pdfUrl,
            latexUrl: result.latexUrl,
            latexContent: result.latexContent,
            isActive: result.isActive,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          };
        } catch {
          return null;
        }
      }
    },
    [isLocal, storage, fetchLocalCVs, updateMutation]
  );

  // Delete CV
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (isLocal) {
        setLocalDeleting(true);
        setLocalError(null);
        try {
          await storage.deleteCV(id);
          await fetchLocalCVs();
          return true;
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to delete CV");
          return false;
        } finally {
          setLocalDeleting(false);
        }
      } else {
        try {
          await deleteMutation.mutateAsync({ id });
          return true;
        } catch {
          return false;
        }
      }
    },
    [isLocal, storage, fetchLocalCVs, deleteMutation]
  );

  // Set active CV
  const setActive = useCallback(
    async (id: string): Promise<boolean> => {
      if (isLocal) {
        setLocalUpdating(true);
        try {
          await storage.setActiveCV(id);
          await fetchLocalCVs();
          return true;
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to set active CV");
          return false;
        } finally {
          setLocalUpdating(false);
        }
      } else {
        try {
          await setActiveMutation.mutateAsync({ id });
          return true;
        } catch {
          return false;
        }
      }
    },
    [isLocal, storage, fetchLocalCVs, setActiveMutation]
  );

  // Upload CV file (PDF/DOCX/TEX)
  const upload = useCallback(
    async (file: File, options?: UploadCVOptions): Promise<UploadCVResult | null> => {
      if (isLocal) {
        setLocalUploading(true);
        setLocalError(null);
        try {
          const result = await storage.uploadCV(file, options);
          await fetchLocalCVs();
          return {
            cv: storedCVToData(result.cv),
            modelUsed: result.modelUsed,
            fallbackUsed: result.fallbackUsed,
          };
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to upload CV");
          return null;
        } finally {
          setLocalUploading(false);
        }
      } else {
        setDemoUploading(true);
        try {
          const result = await storage.uploadCV(file, options);
          void cvsQuery.refetch();
          return {
            cv: storedCVToData(result.cv),
            modelUsed: result.modelUsed,
            fallbackUsed: result.fallbackUsed,
          };
        } catch (err) {
          // Re-throw for caller to handle
          throw err;
        } finally {
          setDemoUploading(false);
        }
      }
    },
    [isLocal, storage, fetchLocalCVs, cvsQuery]
  );

  // Derive demo CVs from query
  const demoCVs: CVData[] = useMemo(() => {
    if (isLocal || !cvsQuery.data) return [];
    return cvsQuery.data.map((cv) => ({
      id: cv.id,
      name: cv.name,
      pdfUrl: cv.pdfUrl && cv.pdfUrl.length > 0 ? cv.pdfUrl : null,
      latexUrl: cv.latexUrl && cv.latexUrl.length > 0 ? cv.latexUrl : null,
      latexContent: cv.latexContent,
      isActive: cv.isActive,
      createdAt: cv.createdAt.toISOString(),
      updatedAt: cv.updatedAt.toISOString(),
    }));
  }, [isLocal, cvsQuery.data]);

  // Select the right values based on mode
  const cvs = isLocal ? localCVs : demoCVs;
  const activeCV = cvs.find((cv) => cv.isActive) ?? null;
  const loading = isLocal ? localLoading : cvsQuery.isLoading;
  const creating = isLocal ? localCreating : createMutation.isPending;
  const updating = isLocal
    ? localUpdating
    : updateMutation.isPending || setActiveMutation.isPending;
  const deleting = isLocal ? localDeleting : deleteMutation.isPending;
  const uploading = isLocal ? localUploading : demoUploading;

  // Get error message, handling null case
  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const error = isLocal ? localError : mutationError ? getErrorMessage(mutationError) : null;

  return {
    cvs,
    activeCV,
    loading,
    creating,
    updating,
    deleting,
    uploading,
    error,
    create,
    update,
    remove,
    setActive,
    upload,
    refetch: isLocal ? fetchLocalCVs : cvsQuery.refetch,
    canAddMore: cvs.length < MAX_CVS,
    maxCVs: MAX_CVS,
  };
}
