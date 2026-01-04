/**
 * Neon Auth Pages
 *
 * Dynamic route handling for Neon Auth UI components:
 * - /auth/sign-in - Sign in with email/password and social providers
 * - /auth/sign-up - New account registration
 * - /auth/sign-out - Sign the user out
 * - /auth/forgot-password - Password reset flow
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { AuthView } from "@neondatabase/auth/react";

// Pre-render only known auth paths
export const dynamicParams = false;

export function generateStaticParams(): { path: string }[] {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "sign-out" },
    { path: "forgot-password" },
    { path: "reset-password" },
  ];
}

interface AuthPageProps {
  params: Promise<{ path: string }>;
}

export default async function AuthPage({ params }: AuthPageProps): Promise<React.ReactElement> {
  const { path } = await params;

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
