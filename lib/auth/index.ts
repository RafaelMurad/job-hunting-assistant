/**
 * Auth Module Index
 *
 * Re-exports both NextAuth (legacy) and Neon Auth (new) utilities.
 * This allows gradual migration while keeping both systems working.
 */

// Legacy NextAuth exports (keep for backward compatibility)
export { auth, handlers, signIn, signOut } from "../auth-legacy";

// Neon Auth client exports
export { neonAuthClient, neonSignIn, neonSignOut, neonSignUp, useNeonSession } from "./neon-client";

// Neon Auth server exports
export { getNeonSession, neonAuthServer } from "./neon-server";
