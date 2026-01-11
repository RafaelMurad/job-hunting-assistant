/**
 * useStorageApplications Hook
 *
 * Storage-aware hook for job application operations.
 * Automatically uses IndexedDB (local) or tRPC (demo) based on mode.
 *
 * @module lib/hooks/useStorageApplications
 */

"use client";

import { useStorage, useIsLocalMode } from "@/lib/storage/provider";
import type {
  StoredApplication,
  CreateApplicationInput as StorageCreateInput,
  UpdateApplicationInput as StorageUpdateInput,
} from "@/lib/storage/interface";
import type { ApplicationStatus } from "@/types";
import { trpc } from "@/lib/trpc/client";
import { getErrorMessage } from "@/lib/trpc/errors";
import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Application data structure for UI consumption.
 */
export interface ApplicationData {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  jobUrl: string | null;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating an application.
 */
export interface CreateAppInput {
  company: string;
  role: string;
  jobDescription: string;
  jobUrl?: string;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status?: ApplicationStatus;
}

/**
 * Stats structure matching the types module.
 */
export interface AppStats {
  total: number;
  applied: number;
  interviewing: number;
  offers: number;
  avgMatchScore: number;
}

/**
 * Return type for useStorageApplications hook.
 */
export interface UseStorageApplicationsReturn {
  applications: ApplicationData[];
  stats: AppStats;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  create: (input: CreateAppInput) => Promise<ApplicationData | null>;
  updateStatus: (id: string, status: ApplicationStatus) => Promise<boolean>;
  updateNotes: (id: string, notes: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refetch: () => void;
}

/**
 * Convert StoredApplication to ApplicationData.
 */
function storedAppToData(app: StoredApplication): ApplicationData {
  return {
    id: app.id,
    company: app.company,
    role: app.role,
    jobDescription: app.jobDescription,
    jobUrl: app.jobUrl ?? null,
    matchScore: app.matchScore,
    analysis: app.analysis,
    coverLetter: app.coverLetter,
    status: app.status,
    appliedAt: app.appliedAt ?? null,
    notes: app.notes ?? null,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

/**
 * Calculate stats from applications.
 */
function calculateStats(apps: ApplicationData[]): AppStats {
  return {
    total: apps.length,
    applied: apps.filter((a) => a.status === "applied").length,
    interviewing: apps.filter((a) => a.status === "interviewing").length,
    offers: apps.filter((a) => a.status === "offer").length,
    avgMatchScore:
      apps.length > 0
        ? Math.round(apps.reduce((sum, a) => sum + a.matchScore, 0) / apps.length)
        : 0,
  };
}

/**
 * Hook for application operations with automatic storage selection.
 */
export function useStorageApplications(): UseStorageApplicationsReturn {
  const isLocal = useIsLocalMode();
  const storage = useStorage();

  // State for local mode
  const [localApps, setLocalApps] = useState<ApplicationData[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localCreating, setLocalCreating] = useState(false);
  const [localUpdating, setLocalUpdating] = useState(false);
  const [localDeleting, setLocalDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // tRPC for demo mode
  const appsQuery = trpc.applications.list.useQuery(undefined, { enabled: !isLocal });
  const createMutation = trpc.applications.create.useMutation({
    onSuccess: () => void appsQuery.refetch(),
  });
  const updateMutation = trpc.applications.update.useMutation({
    onSuccess: () => void appsQuery.refetch(),
  });
  const deleteMutation = trpc.applications.delete.useMutation({
    onSuccess: () => void appsQuery.refetch(),
  });

  // Fetch applications from local storage
  const fetchLocalApps = useCallback(async () => {
    if (!isLocal) return;
    setLocalLoading(true);
    try {
      const apps = await storage.getApplications();
      setLocalApps(apps.map(storedAppToData));
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLocalLoading(false);
    }
  }, [isLocal, storage]);

  // Initial fetch for local mode
  useEffect(() => {
    if (isLocal) {
      void fetchLocalApps();
    }
  }, [isLocal, fetchLocalApps]);

  // Create application
  const create = useCallback(
    async (input: CreateAppInput): Promise<ApplicationData | null> => {
      if (isLocal) {
        setLocalCreating(true);
        setLocalError(null);
        try {
          const storageInput: StorageCreateInput = {
            company: input.company,
            role: input.role,
            jobDescription: input.jobDescription,
            jobUrl: input.jobUrl,
            matchScore: input.matchScore,
            analysis: input.analysis,
            coverLetter: input.coverLetter,
            status: input.status,
          };
          const newApp = await storage.createApplication(storageInput);
          await fetchLocalApps();
          return storedAppToData(newApp);
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to create application");
          return null;
        } finally {
          setLocalCreating(false);
        }
      } else {
        try {
          // tRPC uses different input format
          const result = await createMutation.mutateAsync({
            company: input.company,
            role: input.role,
            jobDescription: input.jobDescription,
            matchScore: input.matchScore,
            analysis: input.analysis,
            coverLetter: input.coverLetter,
            status: input.status ?? "saved",
          });
          return {
            id: result.id,
            company: result.company,
            role: result.role,
            jobDescription: result.jobDescription,
            jobUrl: result.jobUrl,
            matchScore: result.matchScore,
            analysis: result.analysis,
            coverLetter: result.coverLetter,
            status: result.status as ApplicationStatus,
            appliedAt: result.appliedAt?.toISOString() ?? null,
            notes: result.notes,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          };
        } catch {
          return null;
        }
      }
    },
    [isLocal, storage, fetchLocalApps, createMutation]
  );

  // Update status
  const updateStatus = useCallback(
    async (id: string, status: ApplicationStatus): Promise<boolean> => {
      if (isLocal) {
        setLocalUpdating(true);
        try {
          const updateInput: StorageUpdateInput = {
            status,
            appliedAt: status === "applied" ? new Date().toISOString() : undefined,
          };
          await storage.updateApplication(id, updateInput);
          await fetchLocalApps();
          return true;
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to update status");
          return false;
        } finally {
          setLocalUpdating(false);
        }
      } else {
        try {
          await updateMutation.mutateAsync({ id, status });
          return true;
        } catch {
          return false;
        }
      }
    },
    [isLocal, storage, fetchLocalApps, updateMutation]
  );

  // Update notes
  const updateNotes = useCallback(
    async (id: string, notes: string): Promise<boolean> => {
      if (isLocal) {
        setLocalUpdating(true);
        try {
          const updateInput: StorageUpdateInput = { notes };
          await storage.updateApplication(id, updateInput);
          await fetchLocalApps();
          return true;
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to update notes");
          return false;
        } finally {
          setLocalUpdating(false);
        }
      } else {
        try {
          await updateMutation.mutateAsync({ id, notes });
          return true;
        } catch {
          return false;
        }
      }
    },
    [isLocal, storage, fetchLocalApps, updateMutation]
  );

  // Delete application
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (isLocal) {
        setLocalDeleting(true);
        try {
          await storage.deleteApplication(id);
          await fetchLocalApps();
          return true;
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to delete application");
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
    [isLocal, storage, fetchLocalApps, deleteMutation]
  );

  // Derive demo applications from query
  const demoApps: ApplicationData[] = useMemo(() => {
    if (isLocal || !appsQuery.data) return [];
    return appsQuery.data.map((app) => ({
      id: app.id,
      company: app.company,
      role: app.role,
      jobDescription: app.jobDescription,
      jobUrl: app.jobUrl,
      matchScore: app.matchScore,
      analysis: app.analysis,
      coverLetter: app.coverLetter,
      status: app.status as ApplicationStatus,
      appliedAt: app.appliedAt?.toISOString() ?? null,
      notes: app.notes,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));
  }, [isLocal, appsQuery.data]);

  // Select the right values based on mode
  const applications = isLocal ? localApps : demoApps;
  const stats = calculateStats(applications);
  const loading = isLocal ? localLoading : appsQuery.isLoading;
  const creating = isLocal ? localCreating : createMutation.isPending;
  const updating = isLocal ? localUpdating : updateMutation.isPending;
  const deleting = isLocal ? localDeleting : deleteMutation.isPending;

  // Get error message, handling null case
  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const error = isLocal ? localError : mutationError ? getErrorMessage(mutationError) : null;

  return {
    applications,
    stats,
    loading,
    creating,
    updating,
    deleting,
    error,
    create,
    updateStatus,
    updateNotes,
    remove,
    refetch: isLocal ? fetchLocalApps : appsQuery.refetch,
  };
}
