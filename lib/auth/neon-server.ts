/**
 * Neon Auth Server
 *
 * Server-side auth utilities for Neon Auth.
 * Used in Server Components, Server Actions, and API routes.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { createAuthServer } from "@neondatabase/auth/next/server";

export const neonAuthServer = createAuthServer();

// Re-export commonly used functions
export const { getSession: getNeonSession } = neonAuthServer;
