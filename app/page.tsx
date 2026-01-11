"use client";

import { Button } from "@/components/ui/button";
import { useNeonSession } from "@/lib/auth/neon-client";
import { useIsLocalMode } from "@/lib/storage/provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type JSX } from "react";

// ============================================
// Mode-Specific Content
// ============================================

const LOCAL_MODE_CONTENT = {
  eyebrow: "Privacy-First Job Search Assistant",
  heading: (
    <>
      Meet <span className="text-emerald-500">CareerPal</span> — 100% Private Job Hunt Helper
    </>
  ),
  subheading:
    "Your data never leaves your browser. Bring your own AI keys for complete control. Job hunting with zero compromises on privacy.",
  trustIndicator: "100% private. Zero server storage. Your keys, your data.",
  primaryCTA: { text: "Start Using CareerPal", href: "/dashboard" },
  secondaryCTA: { text: "Configure AI Keys", href: "/settings" },
  bottomCTA: {
    heading: "Ready to Take Control of Your Job Search?",
    subheading:
      "Your data stays on your device. Configure your AI keys and start crafting the perfect applications.",
    buttonText: "Get Started Now →",
    href: "/dashboard",
  },
} as const;

const DEMO_MODE_CONTENT = {
  eyebrow: "Your AI Job Search Companion",
  heading: (
    <>
      Meet <span className="text-cyan-500">CareerPal</span> — Your Friendly Job Hunt Helper
    </>
  ),
  subheading:
    "Let your AI pal analyze job postings, craft perfect cover letters, and keep your applications organized. Job hunting just got a whole lot friendlier.",
  trustIndicator: "Free to try. Sign up to save your progress.",
  primaryCTA: { text: "Get Started Free", href: "/dashboard" },
  secondaryCTA: { text: "Analyze a Job", href: "/analyze" },
  bottomCTA: {
    heading: "Ready to Meet Your New Career Pal?",
    subheading:
      "Join job seekers who've found their friendly AI companion for landing great opportunities.",
    buttonText: "Try CareerPal Free →",
    href: "/analyze",
  },
} as const;

// ============================================
// Landing Page Component
// ============================================

export default function LandingPage(): JSX.Element {
  const router = useRouter();
  const isLocal = useIsLocalMode();
  const { data: session, isPending } = useNeonSession();
  const content = isLocal ? LOCAL_MODE_CONTENT : DEMO_MODE_CONTENT;

  // Redirect logged-in users to dashboard
  useEffect(() => {
    // In local mode, users are always "logged in" - redirect to dashboard
    if (isLocal) {
      router.replace("/dashboard");
      return;
    }

    // In demo mode, redirect authenticated users to dashboard
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [isLocal, session, isPending, router]);

  // Show loading state while checking auth or redirecting
  if (isLocal || (!isPending && session?.user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 pb-32">
        {/* Background Pattern - Friendly gradient shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-10">
          {isLocal ? (
            <>
              <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
            </>
          ) : (
            <>
              <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          <div className="text-center">
            {/* Eyebrow */}
            <p
              className={
                isLocal
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold mb-4 tracking-wide uppercase text-sm"
                  : "text-cyan-600 dark:text-cyan-400 font-semibold mb-4 tracking-wide uppercase text-sm"
              }
            >
              {content.eyebrow}
            </p>

            {/* Main Heading */}
            <h1 className="font-bold text-slate-900 dark:text-white mb-6 leading-tight text-4xl md:text-5xl max-w-3xl mx-auto">
              {content.heading}
            </h1>

            {/* Subheading */}
            <p className="text-slate-600 dark:text-slate-300 mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {content.subheading}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={content.primaryCTA.href}>
                <Button
                  size="lg"
                  className={
                    isLocal
                      ? "w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                      : "w-full sm:w-auto"
                  }
                >
                  {content.primaryCTA.text}
                </Button>
              </Link>
              <Link href={content.secondaryCTA.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {content.secondaryCTA.text}
                </Button>
              </Link>
            </div>

            {/* Trust Indicator */}
            <p className="text-slate-500 dark:text-slate-400 mt-8 text-sm">
              {content.trustIndicator}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-center font-bold text-slate-900 dark:text-white mb-16 text-3xl">
            Everything You Need to Succeed
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div
                className={
                  isLocal
                    ? "w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    : "w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                }
              >
                <svg
                  className={
                    isLocal
                      ? "w-8 h-8 text-emerald-600 dark:text-emerald-400"
                      : "w-8 h-8 text-cyan-600 dark:text-cyan-400"
                  }
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-xl">
                AI Job Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Paste any job description and get instant AI-powered analysis of requirements,
                skills match, and your fit score.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-xl">
                Custom Cover Letters
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate personalized cover letters that highlight your relevant experience and
                match the company&apos;s tone.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div
                className={
                  isLocal
                    ? "w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    : "w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                }
              >
                <svg
                  className={
                    isLocal
                      ? "w-8 h-8 text-teal-600 dark:text-teal-400"
                      : "w-8 h-8 text-red-600 dark:text-red-400"
                  }
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-xl">
                Application Tracker
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Keep all your applications organized in one place. Track statuses, match scores, and
                application dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={
          isLocal
            ? "py-20 bg-emerald-600 dark:bg-emerald-700 text-white"
            : "py-20 bg-cyan-600 dark:bg-cyan-700 text-white"
        }
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-bold mb-6 text-3xl">{content.bottomCTA.heading}</h2>
          <p
            className={
              isLocal
                ? "mb-8 text-emerald-100 dark:text-emerald-200 text-lg leading-relaxed"
                : "mb-8 text-cyan-100 dark:text-cyan-200 text-lg leading-relaxed"
            }
          >
            {content.bottomCTA.subheading}
          </p>
          <Link href={content.bottomCTA.href}>
            <Button
              size="lg"
              className={
                isLocal
                  ? "bg-white text-emerald-600 hover:bg-emerald-50 dark:bg-slate-100 dark:hover:bg-white"
                  : "bg-white text-cyan-600 hover:bg-cyan-50 dark:bg-slate-100 dark:hover:bg-white"
              }
            >
              {content.bottomCTA.buttonText}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
