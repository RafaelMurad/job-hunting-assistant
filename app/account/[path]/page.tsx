/**
 * Neon Auth Account Pages
 *
 * Dynamic route handling for account management:
 * - /account/settings - User profile management
 * - /account/security - Password change and active sessions
 * - /account/organizations - Organization management (if enabled)
 *
 * @see https://neon.com/docs/auth/quick-start/nextjs
 */

import { AccountView } from "@neondatabase/auth/react";
import type { ReactElement } from "react";

interface AccountPageProps {
  params: Promise<{ path: string }>;
}

export default async function AccountPage({ params }: AccountPageProps): Promise<ReactElement> {
  const { path } = await params;

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AccountView path={path} />
    </main>
  );
}
