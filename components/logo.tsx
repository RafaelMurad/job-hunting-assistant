"use client";

import Link from "next/link";
import type { JSX } from "react";

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

/**
 * CareerPal Logo Component
 *
 * Renders the CareerPal wordmark with "Career" in slate and "Pal" in cyan.
 * Automatically adapts to dark mode.
 */
export function Logo({ className = "", showLink = true }: LogoProps): JSX.Element {
  const logoContent = (
    <span
      className={`text-xl font-bold tracking-tight leading-none inline-flex items-center ${className}`}
    >
      <span className="text-slate-900 dark:text-slate-100">Career</span>
      <span className="text-cyan-500 dark:text-cyan-400">Pal</span>
    </span>
  );

  if (showLink) {
    return (
      <Link
        href="/"
        className="flex items-center hover:opacity-80 transition-opacity"
        aria-label="CareerPal"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
