/**
 * QuickMatchBadge Component
 *
 * Displays an instant match score between a CV and job description
 * using local AI (Transformers.js). Shows a loading shimmer while
 * computing, then displays the percentage match.
 *
 * @module components/ui/quick-match-badge
 */

"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState, type JSX } from "react";
import { useLocalAIContext } from "@/lib/hooks/useLocalAI";

// =============================================================================
// TYPES
// =============================================================================

export interface QuickMatchBadgeProps {
  /** The CV text content to match against */
  cvText: string;
  /** The job description to match */
  jobDescription: string;
  /** Optional: Pre-computed score to display (skips local AI calculation) */
  fallbackScore?: number;
  /** Optional: Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional: Additional CSS classes */
  className?: string;
  /** Optional: Whether to show "~" prefix for local AI scores */
  showApproximate?: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get background color class based on match score.
 */
function getMatchBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/50";
  if (score >= 60) return "bg-blue-100 dark:bg-blue-900/50";
  if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/50";
  return "bg-red-100 dark:bg-red-900/50";
}

/**
 * Get text color class based on match score.
 */
function getMatchTextColor(score: number): string {
  if (score >= 80) return "text-green-800 dark:text-green-200";
  if (score >= 60) return "text-blue-800 dark:text-blue-200";
  if (score >= 40) return "text-yellow-800 dark:text-yellow-200";
  return "text-red-800 dark:text-red-200";
}

/**
 * Get size classes.
 */
function getSizeClasses(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "h-8 w-8 text-xs";
    case "lg":
      return "h-14 w-14 text-base";
    default:
      return "h-12 w-12 text-sm";
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Badge showing instant CV-to-job match score.
 *
 * Uses local AI when available for fast, free calculations.
 * Falls back to the provided fallbackScore if local AI is unavailable.
 *
 * @example
 * ```tsx
 * <QuickMatchBadge
 *   cvText={activeCV.latexContent}
 *   jobDescription={application.jobDescription}
 *   fallbackScore={application.matchScore}
 * />
 * ```
 */
export function QuickMatchBadge({
  cvText,
  jobDescription,
  fallbackScore,
  size = "md",
  className,
  showApproximate = true,
}: QuickMatchBadgeProps): JSX.Element {
  const { isReady, calculateMatchScore } = useLocalAIContext();
  const [score, setScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLocalScore, setIsLocalScore] = useState(false);

  const calculateScore = useCallback(async () => {
    if (!isReady || !cvText || !jobDescription) {
      // Use fallback if available
      if (fallbackScore !== undefined) {
        setScore(fallbackScore);
        setIsLocalScore(false);
      }
      return;
    }

    setIsCalculating(true);
    try {
      const result = await calculateMatchScore(cvText, jobDescription);
      if (result !== null) {
        setScore(result);
        setIsLocalScore(true);
      } else if (fallbackScore !== undefined) {
        setScore(fallbackScore);
        setIsLocalScore(false);
      }
    } catch {
      // Fallback on error
      if (fallbackScore !== undefined) {
        setScore(fallbackScore);
        setIsLocalScore(false);
      }
    } finally {
      setIsCalculating(false);
    }
  }, [isReady, cvText, jobDescription, fallbackScore, calculateMatchScore]);

  useEffect(() => {
    void calculateScore();
  }, [calculateScore]);

  // Show shimmer while calculating
  if (isCalculating || score === null) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          "bg-slate-100 dark:bg-slate-700",
          "animate-pulse",
          getSizeClasses(size),
          className
        )}
      >
        <span className="text-slate-400 dark:text-slate-500">--</span>
      </div>
    );
  }

  const displayScore = showApproximate && isLocalScore ? `~${score}` : `${score}`;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg transition-colors",
        getMatchBgColor(score),
        getSizeClasses(size),
        className
      )}
      title={isLocalScore ? "Instant match score (local AI)" : "Match score from analysis"}
    >
      <span className={cn("font-bold", getMatchTextColor(score))}>{displayScore}%</span>
    </div>
  );
}

// =============================================================================
// INLINE VARIANT
// =============================================================================

/**
 * Inline text variant of the match badge.
 * Shows as a small inline badge suitable for lists.
 */
export function QuickMatchInline({
  cvText,
  jobDescription,
  fallbackScore,
  className,
}: Omit<QuickMatchBadgeProps, "size">): JSX.Element {
  const { isReady, calculateMatchScore } = useLocalAIContext();
  const [score, setScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculate = async (): Promise<void> => {
      if (!isReady || !cvText || !jobDescription) {
        if (fallbackScore !== undefined) {
          setScore(fallbackScore);
        }
        return;
      }

      setIsCalculating(true);
      try {
        const result = await calculateMatchScore(cvText, jobDescription);
        setScore(result ?? fallbackScore ?? null);
      } catch {
        setScore(fallbackScore ?? null);
      } finally {
        setIsCalculating(false);
      }
    };

    void calculate();
  }, [isReady, cvText, jobDescription, fallbackScore, calculateMatchScore]);

  if (isCalculating) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5",
          "bg-slate-100 dark:bg-slate-700 animate-pulse",
          "text-xs font-medium text-slate-400",
          className
        )}
      >
        ...
      </span>
    );
  }

  if (score === null) {
    return <span className={cn("text-xs text-slate-400", className)}>N/A</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        "text-xs font-semibold",
        getMatchBgColor(score),
        getMatchTextColor(score),
        className
      )}
    >
      {score}%
    </span>
  );
}
