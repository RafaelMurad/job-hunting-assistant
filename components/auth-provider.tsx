"use client";

import { neonAuthClient } from "@/lib/auth/neon-client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { SessionProvider } from "next-auth/react";
import type { JSX, ReactNode } from "react";

/**
 * Auth Provider (Dual Mode)
 *
 * Wraps the application with both:
 * - NextAuth's SessionProvider (legacy, for existing /login flow)
 * - Neon Auth's NeonAuthUIProvider (new, for /auth/* flow)
 *
 * This allows gradual migration while keeping both systems working.
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  return (
    <SessionProvider>
      <NeonAuthUIProvider authClient={neonAuthClient} redirectTo="/dashboard">
        {children}
      </NeonAuthUIProvider>
    </SessionProvider>
  );
}
