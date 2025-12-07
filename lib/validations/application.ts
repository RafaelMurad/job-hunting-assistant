/**
 * Application Validation Schemas
 *
 * Zod schemas for job application data.
 * Used by tRPC for input validation and type inference.
 */

import { z } from "zod";

/**
 * Valid application statuses.
 */
export const applicationStatusSchema = z.enum([
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

/**
 * Schema for creating a new application.
 */
export const applicationCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  jobUrl: z.string().url().optional().nullable(),
  matchScore: z.number().min(0).max(100).optional().default(0),
  analysis: z.string().optional().default(""),
  coverLetter: z.string().optional().default(""),
  status: applicationStatusSchema.optional().default("saved"),
});

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;

/**
 * Schema for updating an application.
 */
export const applicationUpdateSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  status: applicationStatusSchema.optional(),
  notes: z.string().optional(),
});

export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

/**
 * Schema for listing applications.
 */
export const applicationListSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type ApplicationListInput = z.infer<typeof applicationListSchema>;

/**
 * Schema for deleting an application.
 */
export const applicationDeleteSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
});

export type ApplicationDeleteInput = z.infer<typeof applicationDeleteSchema>;
