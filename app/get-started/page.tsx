"use client";

/**
 * Get Started - Mode Selection Page
 *
 * Allows users to choose between:
 * 1. Local Mode - Browser-only, no account needed
 * 2. Zero-Knowledge Mode - Encrypted cloud sync with account
 *
 * This page is shown when users need to select how they want to use the app.
 */

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GetStartedPage(): JSX.Element {
  const router = useRouter();

  const handleLocalMode = (): void => {
    // Set a flag indicating user chose local mode
    localStorage.setItem("careerpal_mode", "local");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How would you like to use CareerPal?
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose the mode that best fits your needs. You can always change this later.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Mode */}
          <Card className="relative overflow-hidden border-2 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl">Local Mode</CardTitle>
              <CardDescription className="text-base">
                100% browser-based, no account needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Feature icon="✓" text="Data stays in your browser" color="emerald" />
              <Feature icon="✓" text="No signup required" color="emerald" />
              <Feature icon="✓" text="Bring your own AI keys" color="emerald" />
              <Feature icon="✓" text="Works offline" color="emerald" />
              <Feature icon="⚠" text="Data lost if browser cleared" color="yellow" />
              <Feature icon="⚠" text="Single device only" color="yellow" />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleLocalMode}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Use Local Mode
              </Button>
            </CardFooter>
          </Card>

          {/* Zero-Knowledge Mode */}
          <Card className="relative overflow-hidden border-2 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            {/* Recommended Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 text-xs font-medium bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded-full">
                Recommended
              </span>
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-cyan-600 dark:text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl">Zero-Knowledge Mode</CardTitle>
              <CardDescription className="text-base">
                Encrypted cloud sync, we can&apos;t read your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Feature icon="✓" text="End-to-end encryption" color="cyan" />
              <Feature icon="✓" text="Sync across devices" color="cyan" />
              <Feature icon="✓" text="We never see your data" color="cyan" />
              <Feature icon="✓" text="Password = encryption key" color="cyan" />
              <Feature icon="✓" text="GDPR compliant" color="cyan" />
              <Feature icon="→" text="Requires account" color="slate" />
            </CardContent>
            <CardFooter>
              <Link href="/auth/zk/register" className="w-full">
                <Button className="w-full">Create Account</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Already have account */}
        <div className="text-center mt-8">
          <p className="text-slate-500 dark:text-slate-400">
            Already have a zero-knowledge account?{" "}
            <Link
              href="/auth/zk/login"
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Privacy Note */}
        <div className="text-center mt-8 max-w-xl mx-auto">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            🔒 Both modes prioritize your privacy. In Local Mode, data never leaves your device. In
            Zero-Knowledge Mode, your data is encrypted before upload — we mathematically cannot
            read it.
          </p>
        </div>
      </div>
    </main>
  );
}

// ============================================
// Helper Components
// ============================================

interface FeatureProps {
  icon: string;
  text: string;
  color: "emerald" | "cyan" | "yellow" | "slate";
}

function Feature({ icon, text, color }: FeatureProps): JSX.Element {
  const colorClasses = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    slate: "text-slate-500 dark:text-slate-400",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${colorClasses[color]}`}>{icon}</span>
      <span className="text-sm text-slate-600 dark:text-slate-300">{text}</span>
    </div>
  );
}
