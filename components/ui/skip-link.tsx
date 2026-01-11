"use client";

/**
 * Skip Link Component
 *
 * Accessibility feature that allows keyboard users to skip navigation
 * and jump directly to the main content. Hidden by default, becomes
 * visible when focused via Tab key.
 *
 * Usage:
 * 1. Add <SkipLink /> at the top of your layout (before navigation)
 * 2. Add id="main-content" to your main content wrapper
 *
 * @example
 * // In layout.tsx
 * <body>
 *   <SkipLink />
 *   <nav>...</nav>
 *   <main id="main-content">...</main>
 * </body>
 */

interface SkipLinkProps {
  /** Target element ID to skip to (default: "main-content") */
  targetId?: string;
  /** Link text (default: "Skip to main content") */
  children?: React.ReactNode;
}

export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
}: SkipLinkProps): React.JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-50
        focus:px-4 focus:py-2
        focus:bg-slate-900 focus:text-white
        focus:rounded-md focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
        dark:focus:bg-slate-100 dark:focus:text-slate-900
        dark:focus:ring-offset-slate-900
        transition-none
      "
    >
      {children}
    </a>
  );
}
