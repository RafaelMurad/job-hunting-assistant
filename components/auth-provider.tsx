"use client";

import { SessionProvider } from "next-auth/react";
import type { JSX, ReactNode } from "react";

/**
 * Auth Provider
 *
 * Wraps the application with NextAuth's SessionProvider for client-side
 * session access via useSession() hook.
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
