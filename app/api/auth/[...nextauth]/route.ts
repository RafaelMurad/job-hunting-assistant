/**
 * NextAuth.js API Route Handler
 *
 * Handles all authentication routes:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET/POST /api/auth/callback/:provider
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * - GET /api/auth/providers
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
