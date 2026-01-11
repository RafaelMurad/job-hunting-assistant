/**
 * useStorageUser Hook
 *
 * Storage-aware hook for user profile operations.
 * Automatically uses IndexedDB (local) or tRPC (demo) based on mode.
 *
 * @module lib/hooks/useStorageUser
 */

"use client";

import { useStorage, useIsLocalMode } from "@/lib/storage/provider";
import type { StoredProfile } from "@/lib/storage/interface";
import { trpc } from "@/lib/trpc/client";
import { getZodFieldErrors, getErrorMessage, type FieldErrors } from "@/lib/trpc/errors";
import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * User data structure for UI consumption.
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string | null | undefined;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

/**
 * Input for saving user profile.
 */
export interface SaveUserInput {
  name: string;
  email: string;
  phone?: string | undefined;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

/**
 * Return type for useStorageUser hook.
 */
export interface UseStorageUserReturn {
  user: UserData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fieldErrors: FieldErrors | null;
  save: (input: SaveUserInput) => Promise<void>;
  refetch: () => void;
  isProfileComplete: boolean;
}

/**
 * Convert StoredProfile to UserData.
 */
function profileToUser(profile: StoredProfile): UserData {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    summary: profile.summary,
    experience: profile.experience,
    skills: profile.skills.join(", "),
  };
}

/**
 * Hook for user profile operations with automatic storage selection.
 */
export function useStorageUser(): UseStorageUserReturn {
  const isLocal = useIsLocalMode();
  const storage = useStorage();

  // State for local mode
  const [localUser, setLocalUser] = useState<UserData | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localSaving, setLocalSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // tRPC for demo mode
  const userQuery = trpc.user.get.useQuery(undefined, { enabled: !isLocal });
  const upsertMutation = trpc.user.upsert.useMutation({
    onSuccess: () => void userQuery.refetch(),
  });

  // Error state for demo mode
  const [demoFieldErrors, setDemoFieldErrors] = useState<FieldErrors | null>(null);

  // Fetch user from local storage
  const fetchLocalUser = useCallback(async () => {
    if (!isLocal) return;
    setLocalLoading(true);
    try {
      const profile = await storage.getProfile();
      if (profile) {
        setLocalUser(profileToUser(profile));
      } else {
        // Return empty user for new profiles
        setLocalUser({
          id: "",
          name: "",
          email: "",
          phone: "",
          location: "",
          summary: "",
          experience: "",
          skills: "",
        });
      }
      setLocalError(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLocalLoading(false);
    }
  }, [isLocal, storage]);

  // Initial fetch for local mode
  useEffect(() => {
    if (isLocal) {
      void fetchLocalUser();
    }
  }, [isLocal, fetchLocalUser]);

  // Save handler
  const save = useCallback(
    async (input: SaveUserInput): Promise<void> => {
      if (isLocal) {
        setLocalSaving(true);
        setLocalError(null);
        try {
          await storage.saveProfile({
            name: input.name,
            email: input.email,
            phone: input.phone,
            location: input.location,
            summary: input.summary,
            experience: input.experience,
            skills: input.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          });
          await fetchLocalUser();
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "Failed to save profile");
        } finally {
          setLocalSaving(false);
        }
      } else {
        // Demo mode: use tRPC
        try {
          setDemoFieldErrors(null);
          await upsertMutation.mutateAsync(input);
        } catch (err) {
          // Try to extract Zod field errors if this is a tRPC error
          if (err && typeof err === "object" && "data" in err) {
            const zodErrors = getZodFieldErrors(err as Parameters<typeof getZodFieldErrors>[0]);
            if (zodErrors) {
              setDemoFieldErrors(zodErrors);
            }
          }
          throw err;
        }
      }
    },
    [isLocal, storage, fetchLocalUser, upsertMutation]
  );

  // Derive demo user from query
  const demoUser: UserData | null = useMemo(() => {
    if (isLocal || !userQuery.data) return null;
    if (userQuery.data.user) return userQuery.data.user;
    return {
      id: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      experience: "",
      skills: "",
    };
  }, [isLocal, userQuery.data]);

  // Select the right values based on mode
  const user = isLocal ? localUser : demoUser;
  const loading = isLocal ? localLoading : userQuery.isLoading;
  const saving = isLocal ? localSaving : upsertMutation.isPending;
  const error = isLocal
    ? localError
    : upsertMutation.error
      ? getErrorMessage(upsertMutation.error)
      : null;
  const fieldErrors = isLocal ? null : demoFieldErrors;

  const isProfileComplete = Boolean(
    user?.name && user?.email && user?.location && user?.summary && user?.experience && user?.skills
  );

  return {
    user,
    loading,
    saving,
    error,
    fieldErrors,
    save,
    refetch: isLocal ? fetchLocalUser : userQuery.refetch,
    isProfileComplete,
  };
}
