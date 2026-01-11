"use client";

/**
 * Mode Banner Component
 *
 * Displays mode-specific information banner to inform users
 * about their current operating mode (local vs demo).
 *
 * @module components/mode-banner
 */

import { cn } from "@/lib/utils";
import { useIsLocalMode } from "@/lib/storage/provider";
import Link from "next/link";
import { useState, useSyncExternalStore, type JSX } from "react";

// ============================================
// Types
// ============================================

interface ModeBannerProps {
  /**
   * Banner display variant
   * - 'inline': For page headers, integrates into layout flow
   * - 'floating': Persistent banner, fixed positioning
   */
  variant?: "inline" | "floating";
  /**
   * Allow user to dismiss the banner
   * Dismissal is stored in localStorage
   */
  showDismiss?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================
// Icons
// ============================================

function ShieldIcon({ className }: { className?: string }): JSX.Element {
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
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }): JSX.Element {
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
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ============================================
// Constants
// ============================================

const DISMISS_KEY = "careerpal-mode-banner-dismissed";

// ============================================
// Hydration helpers
// ============================================

const emptySubscribe = (): (() => void) => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function getDismissedState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DISMISS_KEY) === "true";
}

// ============================================
// Component
// ============================================

/**
 * Mode Banner
 *
 * Displays contextual information about the current app mode:
 * - Local mode: Privacy-focused messaging (green/emerald)
 * - Demo mode: Demo limitations messaging (amber/yellow)
 */
export function ModeBanner({
  variant = "inline",
  showDismiss = false,
  className,
}: ModeBannerProps): JSX.Element | null {
  const isLocalMode = useIsLocalMode();
  const isClient = useIsClient();
  const [isDismissed, setIsDismissed] = useState(() => getDismissedState());

  // Don't render during SSR to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  const handleDismiss = (): void => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  // Mode-specific content
  const content = isLocalMode
    ? {
        icon: <ShieldIcon className="h-5 w-5 shrink-0" />,
        title: "Privacy Mode",
        description: "Your data stays in your browser",
        linkText: "Configure AI Keys",
        linkHref: "/settings",
        bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
        textClass: "text-emerald-800 dark:text-emerald-200",
        iconClass: "text-emerald-600 dark:text-emerald-400",
        linkClass:
          "text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline underline-offset-2",
      }
    : {
        icon: <InfoIcon className="h-5 w-5 shrink-0" />,
        title: "Demo Mode",
        description: "Data resets daily. Sign up to save your work.",
        linkText: "Sign Up",
        linkHref: "/auth/sign-up",
        bgClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        textClass: "text-amber-800 dark:text-amber-200",
        iconClass: "text-amber-600 dark:text-amber-400",
        linkClass:
          "text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline underline-offset-2",
      };

  const baseClasses = cn(
    "flex items-center gap-3 px-4 py-2 border rounded-lg",
    content.bgClass,
    content.textClass,
    variant === "floating" && "fixed top-20 left-1/2 -translate-x-1/2 z-50 shadow-lg",
    className
  );

  return (
    <div className={baseClasses} role="status" aria-live="polite">
      <span className={content.iconClass}>{content.icon}</span>
      <div className="flex flex-1 items-center gap-2 text-sm">
        <span className="font-medium">{content.title}</span>
        <span className="hidden sm:inline">—</span>
        <span className="hidden sm:inline">{content.description}</span>
        <Link href={content.linkHref} className={cn("ml-2", content.linkClass)}>
          {content.linkText}
        </Link>
      </div>
      {showDismiss && (
        <button
          onClick={handleDismiss}
          className={cn(
            "p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
            content.iconClass
          )}
          aria-label="Dismiss banner"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
