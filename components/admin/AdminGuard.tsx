"use client";

import { type JSX, type ReactNode } from "react";
import { trpc } from "@/lib/trpc/client";

interface AdminGuardProps {
  userId: string;
  children: ReactNode;
  fallback?: ReactNode;
  requireOwner?: boolean;
}

/**
 * AdminGuard Component
 *
 * Protects admin-only content by checking user authorization.
 * Shows fallback content if user doesn't have required access.
 */
export function AdminGuard({
  userId,
  children,
  fallback,
  requireOwner = false,
}: AdminGuardProps): JSX.Element {
  const { data: access, isLoading } = trpc.admin.checkAccess.useQuery(
    { userId },
    { enabled: !!userId }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-fjord-200 border-t-fjord-600" />
          <p className="text-sm text-nordic-neutral-500">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!access?.hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-nordic-neutral-900">
              Access Denied
            </h2>
            <p className="text-nordic-neutral-600">
              {access?.reason || "You don't have permission to access this page."}
            </p>
          </div>
        </div>
    );
  }

  if (requireOwner && access.role !== "OWNER") {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex min-h-[400px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
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
            </div>
            <h2 className="mb-2 text-xl font-semibold text-nordic-neutral-900">
              Owner Access Required
            </h2>
            <p className="text-nordic-neutral-600">
              This action requires owner-level permissions.
            </p>
          </div>
        </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check admin access
 */
export function useAdminAccess(userId: string): {
  hasAccess: boolean;
  role: string | null;
  isOwner: boolean;
  isLoading: boolean;
} {
  const { data, isLoading } = trpc.admin.checkAccess.useQuery(
    { userId },
    { enabled: !!userId }
  );

  return {
    hasAccess: data?.hasAccess ?? false,
    role: data?.role ?? null,
    isOwner: data?.role === "OWNER",
    isLoading,
  };
}
