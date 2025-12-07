/**
 * useUser Hook
 *
 * Abstracted hook for user profile operations.
 * Provides a clean interface for fetching and updating user data.
 *
 * WHY: Encapsulates tRPC complexity, error handling, and state management.
 * Pages only need to consume the clean interface.
 */

"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { getZodFieldErrors, getErrorMessage, type FieldErrors } from "@/lib/trpc/errors";

/**
 * User data structure.
 * Matches the Prisma User model with optional fields.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

/**
 * Input for saving user profile.
 * All required fields for upsert.
 */
export interface SaveUserInput {
  name: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

/**
 * Input for CV upload via tRPC (base64).
 */
export interface UploadCVInput {
  filename: string;
  contentBase64: string;
  mimeType:
    | "application/pdf"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

/**
 * Extracted CV data from AI parsing.
 */
export interface ExtractedCVData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: string;
  skills?: string;
}

/**
 * Return type for useUser hook.
 * Provides abstracted interface for user operations.
 */
export interface UseUserReturn {
  // Data
  user: User | null;

  // Loading states
  loading: boolean;
  saving: boolean;
  uploadingCV: boolean;

  // Error states
  error: string | null;
  fieldErrors: FieldErrors | null;

  // Actions
  save: (input: SaveUserInput) => void;
  uploadCV: (input: UploadCVInput) => Promise<ExtractedCVData | null>;
  refetch: () => void;

  // Computed
  isProfileComplete: boolean;
}

/**
 * Hook for user profile operations.
 *
 * @example
 * const { user, loading, save, saving, fieldErrors } = useUser();
 *
 * const handleSubmit = () => {
 *   save({ name, email, ... });
 * };
 */
export function useUser(): UseUserReturn {
  // Error state for mutations
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);

  // tRPC query for fetching user
  const userQuery = trpc.user.get.useQuery();

  // Derive user from query data (avoids cascading renders from useEffect + setState)
  const user: User | null = useMemo(() => {
    if (!userQuery.data) return null;
    if (userQuery.data.user) return userQuery.data.user;
    // No user exists - return empty user for form
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
  }, [userQuery.data]);

  // tRPC mutation for saving user
  const upsertMutation = trpc.user.upsert.useMutation({
    onSuccess: () => {
      // Refetch to get updated data
      void userQuery.refetch();
      setError(null);
      setFieldErrors(null);
    },
    onError: (err) => {
      const zodErrors = getZodFieldErrors(err);
      if (zodErrors) {
        setFieldErrors(zodErrors);
        setError("Please fix the errors below.");
      } else {
        setError(getErrorMessage(err, "Failed to save profile"));
        setFieldErrors(null);
      }
    },
  });

  // tRPC mutation for CV upload (base64)
  const uploadCVMutation = trpc.user.uploadCV.useMutation();

  // Save user profile
  const save = (input: SaveUserInput): void => {
    setError(null);
    setFieldErrors(null);
    upsertMutation.mutate(input);
  };

  // Upload CV and extract data
  const uploadCV = async (input: UploadCVInput): Promise<ExtractedCVData | null> => {
    try {
      const result = await uploadCVMutation.mutateAsync(input);
      return result.extractedData;
    } catch (err) {
      const trpcError = err as { message?: string };
      setError(trpcError.message || "Failed to upload CV");
      return null;
    }
  };

  // Computed: is profile complete?
  const isProfileComplete = Boolean(
    user?.name && user?.email && user?.location && user?.summary && user?.experience && user?.skills
  );

  return {
    user,
    loading: userQuery.isLoading,
    saving: upsertMutation.isPending,
    uploadingCV: uploadCVMutation.isPending,
    error,
    fieldErrors,
    save,
    uploadCV,
    refetch: userQuery.refetch,
    isProfileComplete,
  };
}
