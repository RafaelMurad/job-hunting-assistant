/**
 * Neon Auth Pages
 *
 * Dynamic route handling for Neon Auth UI components:
 * - /auth/sign-in - Sign in with email/password and social providers
 * - /auth/sign-up - New account registration
 * - /auth/sign-out - Sign the user out
 * - /auth/forgot-password - Password reset flow
 *
 * In local mode, auth is not needed - redirects to dashboard.
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { isLocalMode } from "@/lib/storage/interface";
import { AuthView } from "@neondatabase/auth/react";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

interface AuthPageProps {
  params: Promise<{ path: string }>;
}

export default async function AuthPage({ params }: AuthPageProps): Promise<ReactElement> {
  // In local mode, auth is not needed - redirect to dashboard
  if (isLocalMode()) {
    redirect("/dashboard");
  }

  const { path } = await params;

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
