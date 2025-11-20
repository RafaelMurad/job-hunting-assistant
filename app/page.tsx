import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-nordic-neutral-50">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "var(--spacing-24)",
          paddingBottom: "var(--spacing-32)",
        }}
      >
        {/* Background Pattern - Subtle Nordic-inspired shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-fjord-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-forest-500 rounded-full blur-3xl"></div>
        </div>

        <div
          className="relative max-w-7xl mx-auto px-4"
          style={{
            maxWidth: "var(--container-xl)",
          }}
        >
          <div className="text-center">
            {/* Eyebrow */}
            <p
              className="text-fjord-600 font-semibold mb-4 tracking-wide uppercase"
              style={{
                fontSize: "var(--text-small)",
                letterSpacing: "0.1em",
              }}
            >
              AI-Powered Job Search
            </p>

            {/* Main Heading */}
            <h1
              className="font-bold text-nordic-neutral-900 mb-6 leading-tight"
              style={{
                fontSize: "var(--text-heading-xl)",
                lineHeight: "var(--leading-heading)",
                maxWidth: "var(--container-md)",
                margin: "0 auto",
                marginBottom: "var(--spacing-6)",
              }}
            >
              Land Your Dream Job with AI-Powered Applications
            </h1>

            {/* Subheading */}
            <p
              className="text-nordic-neutral-600 mb-10"
              style={{
                fontSize: "var(--text-heading-sm)",
                lineHeight: "var(--leading-relaxed)",
                maxWidth: "var(--container-sm)",
                margin: "0 auto",
                marginBottom: "var(--spacing-10)",
              }}
            >
              Analyze job postings, generate tailored cover letters, and track applications—all in
              one place. Built for job seekers who want to work smarter, not harder.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              style={{
                gap: "var(--spacing-4)",
              }}
            >
              <Link href="/analyze">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/tracker">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Tracker
                </Button>
              </Link>
            </div>

            {/* Trust Indicator */}
            <p
              className="text-nordic-neutral-500 mt-8"
              style={{
                fontSize: "var(--text-small)",
                marginTop: "var(--spacing-8)",
              }}
            >
              Free forever. No credit card required. Privacy-first.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 bg-white"
        style={{
          paddingTop: "var(--spacing-20)",
          paddingBottom: "var(--spacing-20)",
        }}
      >
        <div
          className="max-w-7xl mx-auto px-4"
          style={{
            maxWidth: "var(--container-xl)",
          }}
        >
          <h2
            className="text-center font-bold text-nordic-neutral-900 mb-16"
            style={{
              fontSize: "var(--text-heading-lg)",
              marginBottom: "var(--spacing-16)",
            }}
          >
            Everything You Need to Succeed
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div
                className="w-16 h-16 bg-fjord-100 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  borderRadius: "var(--radius-full)",
                  marginBottom: "var(--spacing-6)",
                }}
              >
                <svg
                  className="w-8 h-8 text-fjord-600"
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
              <h3
                className="font-semibold text-nordic-neutral-900 mb-3"
                style={{
                  fontSize: "var(--text-heading-sm)",
                  marginBottom: "var(--spacing-3)",
                }}
              >
                AI Job Analysis
              </h3>
              <p
                className="text-nordic-neutral-600"
                style={{
                  fontSize: "var(--text-body)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                Paste any job description and get instant AI-powered analysis of requirements,
                skills match, and your fit score.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div
                className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  borderRadius: "var(--radius-full)",
                  marginBottom: "var(--spacing-6)",
                }}
              >
                <svg
                  className="w-8 h-8 text-forest-600"
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
              <h3
                className="font-semibold text-nordic-neutral-900 mb-3"
                style={{
                  fontSize: "var(--text-heading-sm)",
                  marginBottom: "var(--spacing-3)",
                }}
              >
                Custom Cover Letters
              </h3>
              <p
                className="text-nordic-neutral-600"
                style={{
                  fontSize: "var(--text-body)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                Generate personalized cover letters that highlight your relevant experience and
                match the company&apos;s tone.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div
                className="w-16 h-16 bg-clay-100 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  borderRadius: "var(--radius-full)",
                  marginBottom: "var(--spacing-6)",
                }}
              >
                <svg
                  className="w-8 h-8 text-clay-600"
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
              <h3
                className="font-semibold text-nordic-neutral-900 mb-3"
                style={{
                  fontSize: "var(--text-heading-sm)",
                  marginBottom: "var(--spacing-3)",
                }}
              >
                Application Tracker
              </h3>
              <p
                className="text-nordic-neutral-600"
                style={{
                  fontSize: "var(--text-body)",
                  lineHeight: "var(--leading-relaxed)",
                }}
              >
                Keep all your applications organized in one place. Track statuses, match scores, and
                application dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 bg-fjord-600 text-white"
        style={{
          paddingTop: "var(--spacing-20)",
          paddingBottom: "var(--spacing-20)",
        }}
      >
        <div
          className="max-w-4xl mx-auto px-4 text-center"
          style={{
            maxWidth: "var(--container-lg)",
          }}
        >
          <h2
            className="font-bold mb-6"
            style={{
              fontSize: "var(--text-heading-lg)",
              marginBottom: "var(--spacing-6)",
            }}
          >
            Ready to Transform Your Job Search?
          </h2>
          <p
            className="mb-8 text-fjord-100"
            style={{
              fontSize: "var(--text-heading-sm)",
              lineHeight: "var(--leading-relaxed)",
              marginBottom: "var(--spacing-8)",
            }}
          >
            Join job seekers using AI to land better opportunities faster.
          </p>
          <Link href="/analyze">
            <Button size="lg" className="bg-white text-fjord-600 hover:bg-fjord-50">
              Start Analyzing Jobs →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
