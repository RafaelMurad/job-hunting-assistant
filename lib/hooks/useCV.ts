/**
 * useCV Hook
 *
 * Abstracted hook for CV CRUD operations.
 * Provides a clean interface for managing CVs in the profile and editor pages.
 *
 * WHY: Encapsulates tRPC complexity, optimistic updates, and error handling.
 * Pages only need to consume the clean interface.
 */

"use client";

import { trpc } from "@/lib/trpc/client";
import { getErrorMessage } from "@/lib/trpc/errors";
import type { CV } from "@prisma/client";
import { useMemo } from "react";

/**
 * CV entity with string dates for UI consumption.
 */
export interface CVItem {
  id: string;
  userId: string;
  name: string;
  pdfUrl: string | null;
  latexUrl: string | null;
  latexContent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new CV.
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
 * Return type for useCV hook.
 */
export interface UseCVReturn {
  // Data
  cvs: CVItem[];
  activeCV: CVItem | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  // Error states
  error: string | null;

  // Actions
  create: (input: CreateCVInput) => Promise<CVItem | null>;
  update: (input: UpdateCVInput) => Promise<CVItem | null>;
  remove: (id: string) => Promise<boolean>;
  setActive: (id: string) => Promise<boolean>;
  refetch: () => void;

  // Utilities
  canAddMore: boolean;
  maxCVs: number;
}

const MAX_CVS = 5;

/**
 * Transform Prisma CV to UI-friendly CVItem with string dates.
 */
function transformCV(cv: CV): CVItem {
  return {
    ...cv,
    createdAt: cv.createdAt.toISOString(),
    updatedAt: cv.updatedAt.toISOString(),
  };
}

/**
 * Hook for CV management.
 *
 * @example
 * const { cvs, activeCV, create, setActive, canAddMore } = useCV();
 *
 * const handleUpload = async (name: string, pdfUrl: string) => {
 *   await create({ name, pdfUrl, isActive: true });
 * };
 */
export function useCV(): UseCVReturn {
  // tRPC query for listing CVs
  const cvsQuery = trpc.cv.list.useQuery();

  // Transform dates to strings for UI consumption
  const cvs: CVItem[] = useMemo(() => {
    if (!cvsQuery.data) return [];
    return cvsQuery.data.map(transformCV);
  }, [cvsQuery.data]);

  // Get active CV from list
  const activeCV: CVItem | null = useMemo(() => {
    return cvs.find((cv) => cv.isActive) ?? null;
  }, [cvs]);

  // tRPC mutation for creating CVs
  const createMutation = trpc.cv.create.useMutation({
    onSuccess: () => {
      void cvsQuery.refetch();
    },
  });

  // tRPC mutation for updating CVs
  const updateMutation = trpc.cv.update.useMutation({
    onSuccess: () => {
      void cvsQuery.refetch();
    },
  });

  // tRPC mutation for deleting CVs
  const deleteMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      void cvsQuery.refetch();
    },
  });

  // tRPC mutation for setting active CV
  const setActiveMutation = trpc.cv.setActive.useMutation({
    onSuccess: () => {
      void cvsQuery.refetch();
    },
  });

  // Create new CV
  const create = async (input: CreateCVInput): Promise<CVItem | null> => {
    try {
      const result = await createMutation.mutateAsync(input);
      return transformCV(result);
    } catch (err) {
      console.error(
        "Failed to create CV:",
        getErrorMessage(err as Parameters<typeof getErrorMessage>[0])
      );
      return null;
    }
  };

  // Update CV
  const update = async (input: UpdateCVInput): Promise<CVItem | null> => {
    try {
      const result = await updateMutation.mutateAsync(input);
      return transformCV(result);
    } catch (err) {
      console.error(
        "Failed to update CV:",
        getErrorMessage(err as Parameters<typeof getErrorMessage>[0])
      );
      return null;
    }
  };

  // Delete CV
  const remove = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync({ id });
      return true;
    } catch (err) {
      console.error(
        "Failed to delete CV:",
        getErrorMessage(err as Parameters<typeof getErrorMessage>[0])
      );
      return false;
    }
  };

  // Set CV as active
  const setActive = async (id: string): Promise<boolean> => {
    try {
      await setActiveMutation.mutateAsync({ id });
      return true;
    } catch (err) {
      console.error(
        "Failed to set active CV:",
        getErrorMessage(err as Parameters<typeof getErrorMessage>[0])
      );
      return false;
    }
  };

  return {
    cvs,
    activeCV,
    loading: cvsQuery.isLoading,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    error: null, // Errors handled via console/toast in pages
    create,
    update,
    remove,
    setActive,
    refetch: cvsQuery.refetch,
    canAddMore: cvs.length < MAX_CVS,
    maxCVs: MAX_CVS,
  };
}
