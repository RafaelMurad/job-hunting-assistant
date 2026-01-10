"use client";

import { neonAuthClient } from "@/lib/auth/neon-client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import type { JSX, ReactNode } from "react";

/**
 * Auth Provider
 *
 * Wraps the application with Neon Auth's NeonAuthUIProvider
 * for client-side session access and auth UI components.
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  return (
    <NeonAuthUIProvider authClient={neonAuthClient} redirectTo="/dashboard">
      {children}
    </NeonAuthUIProvider>
  );
}
