import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type JSX } from "react";

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 pb-32">
        {/* Background Pattern - Subtle Nordic-inspired shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-sky-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4">
          <div className="text-center">
            {/* Eyebrow */}
            <p className="text-sky-600 dark:text-sky-400 font-semibold mb-4 tracking-wide uppercase text-sm">
              AI-Powered Job Search
            </p>

            {/* Main Heading */}
            <h1 className="font-bold text-slate-900 dark:text-white mb-6 leading-tight text-4xl md:text-5xl max-w-3xl mx-auto">
              Land Your Dream Job with AI-Powered Applications
            </h1>

            {/* Subheading */}
            <p className="text-slate-600 dark:text-slate-300 mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Analyze job postings, generate tailored cover letters, and track applications—all in
              one place. Built for job seekers who want to work smarter, not harder.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/analyze">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Analyze a Job
                </Button>
              </Link>
            </div>

            {/* Trust Indicator */}
            <p className="text-slate-500 dark:text-slate-400 mt-8 text-sm">
              Free forever. No credit card required. Privacy-first.
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
              <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-sky-600 dark:text-sky-400"
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
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
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
      <section className="py-20 bg-sky-600 dark:bg-sky-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-bold mb-6 text-3xl">Ready to Transform Your Job Search?</h2>
          <p className="mb-8 text-sky-100 dark:text-sky-200 text-lg leading-relaxed">
            Join job seekers using AI to land better opportunities faster.
          </p>
          <Link href="/analyze">
            <Button
              size="lg"
              className="bg-white text-sky-600 hover:bg-sky-50 dark:bg-slate-100 dark:hover:bg-white"
            >
              Start Analyzing Jobs →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
