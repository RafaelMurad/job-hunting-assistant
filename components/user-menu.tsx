"use client";

import { Button } from "@/components/ui/button";
import { neonSignOut, useNeonSession } from "@/lib/auth/neon-client";
import { useIsLocalMode } from "@/lib/storage/provider";
import Link from "next/link";
import { useSyncExternalStore, type JSX } from "react";

/**
 * Subscribe to nothing - just used to detect client mount
 */
const emptySubscribe = (): (() => void) => () => {};

/**
 * User icon for local mode
 */
function UserIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

/**
 * User Menu for Local Mode
 */
function LocalUserMenu(): JSX.Element {
  return (
    <Link href="/settings" className="flex items-center gap-2 group">
      <div className="h-8 w-8 sm:h-8 sm:w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
        <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <span className="hidden md:inline text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
        Local User
      </span>
    </Link>
  );
}

/**
 * User Menu for Demo Mode (with auth)
 * Only rendered when NeonAuthUIProvider is present
 */
function DemoUserMenu(): JSX.Element {
  const { data: session, isPending } = useNeonSession();

  // Detect client mount
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Show placeholder until client-side
  if (!isClient || isPending) {
    return <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />;
  }

  // Unauthenticated - show login button
  if (!session?.user) {
    return (
      <Link href="/auth/sign-in">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  // Authenticated - show user info and sign out
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-2">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-medium text-slate-600">
            {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        )}
        <span className="hidden md:inline text-sm text-slate-600">
          {session.user.name ?? session.user.email}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void neonSignOut()}
        className="hidden sm:inline-flex text-slate-500 hover:text-slate-700"
      >
        Sign Out
      </Button>
    </div>
  );
}

/**
 * User Menu Component
 *
 * Displays login button when unauthenticated, or user avatar with
 * dropdown menu when authenticated. In local mode, shows a simple
 * "Local User" indicator since no auth is needed.
 */
export function UserMenu(): JSX.Element {
  const isLocalMode = useIsLocalMode();

  // Detect client mount without causing cascading renders
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Show placeholder until client-side to prevent hydration mismatch
  if (!isClient) {
    return <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />;
  }

  // Local mode - simple user indicator, no auth needed
  if (isLocalMode) {
    return <LocalUserMenu />;
  }

  // Demo mode - full auth UI (useNeonSession is safe because AuthProvider wraps app)
  return <DemoUserMenu />;
}
