import { AuthProvider } from "@/components/auth-provider";
import { CommandPalette } from "@/components/command-palette";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { FeatureFlagProvider } from "@/lib/feature-flags/provider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX, ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Hunt AI - AI-Powered Job Application Assistant",
  description: "Analyze jobs, generate cover letters, and track applications with AI",
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
              <FeatureFlagProvider>
                {/* Navigation */}
                <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                      <div className="flex items-center gap-4">
                        {/* Mobile Menu - Visible only on mobile */}
                        <MobileMenu />

                        <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white">
                          Job Hunt AI
                        </Link>

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
                      {/* Theme Toggle and User Menu */}
                      <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu />
                      </div>
                    </div>
                  </div>
                </nav>

                {/* Main Content */}
                <main>{children}</main>

                {/* Command Palette (⌘K) */}
                <CommandPalette />
              </FeatureFlagProvider>
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
