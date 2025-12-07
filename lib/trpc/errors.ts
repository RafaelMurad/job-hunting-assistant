/**
 * tRPC Error Utilities
 *
 * Type-safe helpers for handling tRPC errors, especially Zod validation errors.
 * Eliminates the need for `as` type assertions in components.
 */

import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "./router";

/**
 * Field errors map from Zod validation.
 * Maps field names to their first error message.
 */
export interface FieldErrors {
  [key: string]: string;
}

/**
 * Structure of Zod errors attached to tRPC error data.
 */
interface ZodErrorData {
  zodError?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

/**
 * Extract field-level errors from a tRPC error.
 *
 * tRPC attaches Zod validation errors to error.data.zodError,
 * but this isn't exposed in the type definitions. This helper
 * safely extracts and transforms them.
 *
 * @param error - The tRPC client error
 * @returns FieldErrors map or null if no Zod errors
 *
 * @example
 * const mutation = trpc.user.upsert.useMutation({
 *   onError: (error) => {
 *     const fieldErrors = getZodFieldErrors(error);
 *     if (fieldErrors) {
 *       setFieldErrors(fieldErrors);
 *     }
 *   },
 * });
 */
export function getZodFieldErrors(error: TRPCClientErrorLike<AppRouter>): FieldErrors | null {
  // Safely cast error.data to access zodError
  const errorData = error.data as ZodErrorData | undefined;

  if (!errorData?.zodError?.fieldErrors) {
    return null;
  }

  const fieldErrors: FieldErrors = {};

  for (const [field, messages] of Object.entries(errorData.zodError.fieldErrors)) {
    if (messages && messages.length > 0 && messages[0]) {
      fieldErrors[field] = messages[0];
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}

/**
 * Get a user-friendly error message from a tRPC error.
 *
 * @param error - The tRPC client error
 * @param fallback - Fallback message if error.message is empty
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: TRPCClientErrorLike<AppRouter>,
  fallback = "An unexpected error occurred"
): string {
  return error.message || fallback;
}
