/**
 * Authentication Validation Schemas
 *
 * Zod schemas for email/password authentication forms.
 */

import { z } from "zod";

/**
 * Sign Up Schema
 *
 * Validates new user registration with email and password.
 */
export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Sign In Schema
 *
 * Validates email/password login.
 */
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;
