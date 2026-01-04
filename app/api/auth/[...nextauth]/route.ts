/**
 * NextAuth.js API Route Handler (Legacy)
 *
 * Handles all authentication routes:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET/POST /api/auth/callback/:provider
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * - GET /api/auth/providers
 *
 * NOTE: This is the legacy auth system. New auth uses Neon Auth at /api/neon-auth/*
 */

import { handlers } from "@/lib/auth-legacy";

export const { GET, POST } = handlers;
