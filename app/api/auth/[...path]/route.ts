/**
 * Neon Auth API Route Handler
 *
 * Handles all Neon Auth API routes:
 * - GET/POST /api/auth/sign-in
 * - GET/POST /api/auth/sign-up
 * - GET/POST /api/auth/sign-out
 * - GET /api/auth/session
 * - etc.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { authApiHandler } from "@neondatabase/auth/next/server";

export const { GET, POST } = authApiHandler();
