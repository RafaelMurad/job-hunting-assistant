import { AuthProvider } from "@/components/auth-provider";
import { CommandPalette } from "@/components/command-palette";
import { Logo } from "@/components/logo";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ModeBanner } from "@/components/mode-banner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SkipLink } from "@/components/ui/skip-link";
import { UserMenu } from "@/components/user-menu";
import { FeatureFlagProvider } from "@/lib/feature-flags/provider";
import { LocalAIProvider } from "@/lib/hooks/useLocalAI";
import { StorageProvider } from "@/lib/storage/provider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX, ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerPal - Your AI Job Search Companion",
  description:
    "Your friendly AI companion for job hunting. Analyze jobs, generate cover letters, and track applications with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-slate-50 dark:bg-slate-900`}
      >
        <ThemeProvider>
          <AuthProvider>
            <TRPCProvider>
              <StorageProvider>
                <FeatureFlagProvider>
                  <LocalAIProvider>
                    {/* Skip Link - Accessibility for keyboard users */}
                    <SkipLink />

                    {/* Navigation */}
                    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="relative flex justify-between h-14 sm:h-16 items-center">
                          {/* Left section - Logo + Nav */}
                          <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-none">
                            {/* Logo - Always on the left */}
                            <Logo />

                            {/* Desktop Navigation - Hidden on mobile */}
                            <div className="hidden md:flex gap-6 ml-8">
                              <Link
                                href="/dashboard"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                Dashboard
                              </Link>
                              <Link
                                href="/profile"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                Profile
                              </Link>
                              <Link
                                href="/cv"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                CV Editor
                              </Link>
                              <Link
                                href="/analyze"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                Analyze Job
                              </Link>
                              <Link
                                href="/tracker"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                Tracker
                              </Link>
                              <Link
                                href="/settings"
                                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                Settings
                              </Link>
                            </div>
                          </div>

                          {/* Right section - Theme Toggle and User Menu/Settings */}
                          <div className="flex items-center gap-1 sm:gap-2 flex-1 md:flex-none justify-end">
                            <ThemeToggle />
                            {/* Settings icon on mobile, UserMenu on desktop */}
                            <Link
                              href="/settings"
                              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              aria-label="Settings"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </Link>
                            <div className="hidden md:block">
                              <UserMenu />
                            </div>
                          </div>
                        </div>
                      </div>
                    </nav>

                    {/* Mode Banner - Shows current mode (local vs demo) */}
                    <ModeBanner variant="inline" showDismiss />

                    {/* Main Content - pb-20 adds space for mobile bottom nav */}
                    <main id="main-content" className="pb-20 md:pb-0">
                      {children}
                    </main>

                    {/* Mobile Bottom Navigation */}
                    <MobileBottomNav />

                    {/* Command Palette (⌘K) */}
                    <CommandPalette />
                  </LocalAIProvider>
                </FeatureFlagProvider>
              </StorageProvider>
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
