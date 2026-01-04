import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FeatureFlagProvider } from "@/lib/feature-flags/provider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AuthProvider } from "@/components/auth-provider";
import { UserMenu } from "@/components/user-menu";
import { MobileMenu } from "@/components/mobile-menu";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50`}>
        <AuthProvider>
          <TRPCProvider>
            <FeatureFlagProvider>
              {/* Navigation */}
              <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-4">
                      {/* Mobile Menu - Visible only on mobile */}
                      <MobileMenu />

                      <Link href="/" className="text-xl font-bold text-slate-900">
                        Job Hunt AI
                      </Link>

                      {/* Desktop Navigation - Hidden on mobile */}
                      <div className="hidden md:flex gap-6 ml-8">
                        <Link
                          href="/dashboard"
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/cv"
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          CV Editor
                        </Link>
                        <Link
                          href="/analyze"
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Analyze Job
                        </Link>
                        <Link
                          href="/tracker"
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Tracker
                        </Link>
                        <Link
                          href="/settings"
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          Settings
                        </Link>
                      </div>
                    </div>
                    {/* User Menu */}
                    <UserMenu />
                  </div>
                </div>
              </nav>

              {/* Main Content */}
              <main>{children}</main>
            </FeatureFlagProvider>
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
