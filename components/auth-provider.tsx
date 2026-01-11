"use client";

import { neonAuthClient } from "@/lib/auth/neon-client";
import { isLocalMode } from "@/lib/storage/interface";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JSX, ReactNode } from "react";

/**
 * Auth Provider
 *
 * Wraps the application with Neon Auth's NeonAuthUIProvider
 * for client-side session access and auth UI components.
 *
 * In local mode, skips the NeonAuthUIProvider entirely since
 * there's no server-side authentication - users work directly
 * with browser storage.
 *
 * Uses next-themes ThemeProvider to control the theme for Neon Auth UI.
 * disableTransitionOnChange prevents CSS flicker during theme hydration.
 *
 * Passes Next.js Link and navigate for proper App Router navigation.
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();

  // Local mode - skip Neon Auth entirely (no server auth needed)
  // Still wrap with ThemeProvider for consistent theming
  if (isLocalMode()) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    );
  }

  // Demo mode - full Neon Auth provider
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <NeonAuthUIProvider
        authClient={neonAuthClient}
        redirectTo="/dashboard"
        navigate={(href) => router.push(href)}
        Link={Link}
        localization={{
          EMAIL_PLACEHOLDER: "you@example.com",
        }}
      >
        {children}
      </NeonAuthUIProvider>
    </ThemeProvider>
  );
}
