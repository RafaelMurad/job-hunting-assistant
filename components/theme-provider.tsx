"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

/**
 * Theme provider wrapper for next-themes
 * Enables dark mode support across the application
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "job-hunting-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps): ReactNode {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
