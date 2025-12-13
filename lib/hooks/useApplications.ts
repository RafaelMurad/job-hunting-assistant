/**
 * useApplications Hook
 *
 * Abstracted hook for job application CRUD operations.
 * Provides a clean interface for managing applications in the tracker.
 *
 * WHY: Encapsulates tRPC complexity, optimistic updates, and error handling.
 * Pages only need to consume the clean interface.
 */

"use client";

import { trpc } from "@/lib/trpc/client";
import { getErrorMessage } from "@/lib/trpc/errors";
import type {
  Application,
  ApplicationStats,
  ApplicationStatus,
  CreateApplicationInput,
} from "@/types";
import { useMemo } from "react";
import type { ButtonState } from "./useAnalyze";

/**
 * Hook return types and input types come from `@/types`.

/**
 * Return type for useApplications hook.
 */
export interface UseApplicationsReturn {
  // Data
  applications: Application[];
  stats: ApplicationStats;

  // Loading states
  loading: boolean;
  updating: boolean;
  deleting: boolean;

  // Error states
  error: string | null;

  // Actions
  create: (input: CreateApplicationInput) => Promise<boolean>;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  updateNotes: (id: string, notes: string) => void;
  remove: (id: string) => void;
  refetch: () => void;

  // Filter
  filterByStatus: (status: string) => Application[];
}

/**
 * Hook for application management.
 *
 * @example
 * const { applications, loading, updateStatus, remove } = useApplications();
 *
 * const handleStatusChange = (id, status) => {
 *   updateStatus(id, status);
 * };
 */
export function useApplications(): UseApplicationsReturn {
  // tRPC query for listing applications
  const applicationsQuery = trpc.applications.list.useQuery();

  // Transform dates to strings for UI consumption
  const applications: Application[] = useMemo(() => {
    if (!applicationsQuery.data) return [];
    return applicationsQuery.data.map(
      (
        app: { appliedAt: Date | null; createdAt: Date } & Omit<
          Application,
          "appliedAt" | "createdAt"
        >
      ) => ({
        ...app,
        appliedAt: app.appliedAt ? app.appliedAt.toISOString() : null,
        createdAt: app.createdAt.toISOString(),
      })
    );
  }, [applicationsQuery.data]);

  // Calculate statistics
  const stats: ApplicationStats = useMemo(() => {
    if (applications.length === 0) {
      return { total: 0, applied: 0, interviewing: 0, offers: 0, avgMatchScore: 0 };
    }

    const applied = applications.filter((a) => a.status === "applied").length;
    const interviewing = applications.filter((a) => a.status === "interviewing").length;
    const offers = applications.filter((a) => a.status === "offer").length;
    const avgMatchScore = Math.round(
      applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length
    );

    return {
      total: applications.length,
      applied,
      interviewing,
      offers,
      avgMatchScore,
    };
  }, [applications]);

  // tRPC mutation for creating applications
  const createMutation = trpc.applications.create.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
    },
  });

  // tRPC mutation for updating applications
  const updateMutation = trpc.applications.update.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
    },
  });

  // tRPC mutation for deleting applications
  const deleteMutation = trpc.applications.delete.useMutation({
    onSuccess: () => {
      void applicationsQuery.refetch();
    },
  });

  // Create new application
  const create = async (input: CreateApplicationInput): Promise<boolean> => {
    try {
      await createMutation.mutateAsync(input);
      return true;
    } catch (err) {
      console.error(
        "Failed to create application:",
        getErrorMessage(err as Parameters<typeof getErrorMessage>[0])
      );
      return false;
    }
  };

  // Update application status
  const updateStatus = (id: string, status: ApplicationStatus): void => {
    updateMutation.mutate({
      id,
      status,
      ...(status === "applied" && { appliedAt: new Date() }),
    });
  };

  // Update application notes
  const updateNotes = (id: string, notes: string): void => {
    updateMutation.mutate({ id, notes });
  };

  // Delete application
  const remove = (id: string): void => {
    deleteMutation.mutate({ id });
  };

  // Filter applications by status
  const filterByStatus = (status: string): Application[] => {
    if (status === "all") return applications;
    return applications.filter((app) => app.status === status);
  };

  return {
    applications,
    stats,
    loading: applicationsQuery.isLoading,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    error: null, // Errors handled via toast in pages
    create,
    updateStatus,
    updateNotes,
    remove,
    refetch: applicationsQuery.refetch,
    filterByStatus,
  };
}

// Re-export ButtonState for use in pages
export type { ButtonState };
