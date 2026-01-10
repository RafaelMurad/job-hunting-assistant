"use client";

/**
 * Neon Auth Client
 *
 * Client-side auth utilities for Neon Auth.
 * Used in React components for session management and auth UI.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { createAuthClient } from "@neondatabase/auth/next";

export const neonAuthClient = createAuthClient();

// Re-export commonly used hooks and components
export const {
  useSession: useNeonSession,
  signIn: neonSignIn,
  signOut: neonSignOut,
  signUp: neonSignUp,
} = neonAuthClient;
