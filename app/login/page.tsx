"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type JSX } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * OAuth Provider Button
 */
function OAuthButton({
  label,
  icon,
  loading,
  onClick,
}: {
  label: string;
  icon: JSX.Element;
  loading: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-3 h-12"
      onClick={onClick}
      disabled={loading}
    >
      {icon}
      <span>{loading ? "Connecting..." : label}</span>
    </Button>
  );
}

/**
 * GitHub Icon
 */
function GitHubIcon(): JSX.Element {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/**
 * Error Banner
 */
function ErrorBanner({ error }: { error: string | null }): JSX.Element | null {
  if (!error) return null;

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error starting the OAuth sign in flow.",
    OAuthCallback: "Error during OAuth callback.",
    OAuthCreateAccount: "Error creating OAuth account.",
    EmailCreateAccount: "Error creating email account.",
    Callback: "Error in callback handler.",
    OAuthAccountNotLinked:
      "This email is already associated with another account. Please sign in with your original provider.",
    EmailSignin: "Error sending sign in email.",
    CredentialsSignin: "Sign in failed. Check your credentials.",
    SessionRequired: "Please sign in to access this page.",
    Default: "An error occurred during sign in.",
  };

  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5 shrink-0 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <span className="text-sm font-medium text-red-800">{message}</span>
      </div>
    </div>
  );
}

/**
 * Login Page Content - uses searchParams
 */
function LoginContent(): JSX.Element {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = (provider: string): void => {
    setLoadingProvider(provider);
    void signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to continue to Job Hunt AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBanner error={error} />

          <div className="space-y-3">
            <OAuthButton
              label="Continue with GitHub"
              icon={<GitHubIcon />}
              loading={loadingProvider === "github"}
              onClick={() => handleSignIn("github")}
            />
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading Skeleton for login page
 */
function LoginLoadingSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-5 w-64 bg-slate-200 rounded animate-pulse mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-12 bg-slate-100 rounded animate-pulse" />
            <div className="h-12 bg-slate-100 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Login Page
 *
 * Provides OAuth sign-in options for users.
 * Wrapped in Suspense for SSR compatibility with useSearchParams.
 */
export default function LoginPage(): JSX.Element {
  return (
    <Suspense fallback={<LoginLoadingSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
