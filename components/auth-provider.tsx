"use client";

import { neonAuthClient } from "@/lib/auth/neon-client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { ThemeProvider } from "next-themes";
import type { JSX, ReactNode } from "react";

/**
 * Auth Provider
 *
 * Wraps the application with Neon Auth's NeonAuthUIProvider
 * for client-side session access and auth UI components.
 *
 * Uses next-themes ThemeProvider to control the theme for Neon Auth UI.
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <NeonAuthUIProvider authClient={neonAuthClient} redirectTo="/dashboard">
        {children}
      </NeonAuthUIProvider>
    </ThemeProvider>
  );
}
