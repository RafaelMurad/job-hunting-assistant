/**
 * User Validation Schema
 *
 * WHY: Runtime validation is essential because TypeScript types are erased at runtime.
 * When data comes from an API request, we can't trust it matches our types.
 * Zod validates at runtime AND infers TypeScript types from the schema.
 *
 * WHAT: This schema defines the shape of valid user data.
 * It's used by both the API (to validate input) and the frontend (for form validation).
 *
 * HOW: Zod uses method chaining to build validation rules.
 * - z.string() = must be a string
 * - .min(1) = at least 1 character (required field)
 * - .email() = must be valid email format
 * - .optional() = field can be undefined/missing
 * - .nullable() = field can be null
 */

import { z } from "zod";

/**
 * Schema for creating/updating a user profile.
 *
 * Learning Points:
 * 1. Each field has a validation rule
 * 2. Custom error messages make UX better
 * 3. We export both the schema AND the inferred type
 */
export const userSchema = z.object({
  // Required fields - must be non-empty strings
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),

  location: z
    .string()
    .min(1, { message: "Location is required" })
    .max(200, { message: "Location must be less than 200 characters" }),

  summary: z
    .string()
    .min(1, { message: "Professional summary is required" })
    .max(2000, { message: "Summary must be less than 2000 characters" }),

  experience: z
    .string()
    .min(1, { message: "Work experience is required" })
    .max(10000, { message: "Experience must be less than 10000 characters" }),

  skills: z
    .string()
    .min(1, { message: "Skills are required" })
    .max(1000, { message: "Skills must be less than 1000 characters" }),

  // Optional fields - can be empty or missing
  phone: z
    .string()
    .max(50, { message: "Phone must be less than 50 characters" })
    .optional()
    .nullable(),
});

/**
 * TypeScript type inferred from the Zod schema.
 *
 * This is the magic of Zod - you define validation ONCE
 * and get both runtime validation AND TypeScript types.
 *
 * z.infer<typeof schema> extracts the type from the schema.
 */
export type UserInput = z.infer<typeof userSchema>;

/**
 * Schema for updating a user (includes ID).
 * Uses .extend() to add the id field to the base schema.
 */
export const userUpdateSchema = userSchema.extend({
  id: z.string().min(1, { message: "User ID is required for updates" }),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/**
 * Partial schema for PATCH-style updates (all fields optional).
 * Uses .partial() to make every field optional.
 */
export const userPatchSchema = userSchema.partial().extend({
  id: z.string().min(1, { message: "User ID is required for updates" }),
});

export type UserPatchInput = z.infer<typeof userPatchSchema>;

/**
 * Schema for CV upload via tRPC (base64 encoded).
 * Max file size: 2MB (base64 encoded = ~2.67MB string)
 */
export const cvUploadSchema = z.object({
  filename: z
    .string()
    .min(1, { message: "Filename is required" })
    .refine((name) => name.endsWith(".pdf") || name.endsWith(".docx"), {
      message: "Only PDF and DOCX files are supported",
    }),
  contentBase64: z
    .string()
    .min(1, { message: "File content is required" })
    .max(2800000, { message: "File too large. Maximum size is 2MB." }), // ~2MB base64
  mimeType: z.enum(
    ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    { message: "Invalid file type. Please upload a PDF or DOCX file." }
  ),
});

export type CVUploadInput = z.infer<typeof cvUploadSchema>;
