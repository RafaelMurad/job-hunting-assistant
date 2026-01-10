/**
 * Neon Auth API Route Handler
 *
 * Handles all Neon Auth API routes:
 * - GET/POST /api/neon-auth/sign-in
 * - GET/POST /api/neon-auth/sign-up
 * - GET/POST /api/neon-auth/sign-out
 * - GET /api/neon-auth/session
 * - etc.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { authApiHandler } from "@neondatabase/auth/next/server";

export const { GET, POST } = authApiHandler();
