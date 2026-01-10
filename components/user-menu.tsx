"use client";

import { Button } from "@/components/ui/button";
import { neonSignOut, useNeonSession } from "@/lib/auth/neon-client";
import Link from "next/link";
import { type JSX } from "react";

/**
 * User Menu Component
 *
 * Displays login button when unauthenticated, or user avatar with
 * dropdown menu when authenticated.
 */
export function UserMenu(): JSX.Element {
  const { data: session, isPending } = useNeonSession();

  // Loading state
  if (isPending) {
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
    <div className="flex items-center gap-4">
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
        <span className="hidden sm:inline text-sm text-slate-600">
          {session.user.name ?? session.user.email}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void neonSignOut()}
        className="text-slate-500 hover:text-slate-700"
      >
        Sign Out
      </Button>
    </div>
  );
}
