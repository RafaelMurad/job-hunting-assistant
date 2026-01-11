"use client";

import { cn } from "@/lib/utils";
import type { JSX } from "react";

interface ProgressRingProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Size of the ring in pixels */
  size?: number;
  /** Stroke width of the ring */
  strokeWidth?: number;
  /** Whether to show the percentage text */
  showText?: boolean;
  /** Additional class names */
  className?: string;
  /** Label below the percentage */
  label?: string;
}

/**
 * Circular Progress Ring Component
 *
 * Displays a circular progress indicator with:
 * - Animated fill based on progress percentage
 * - Center text showing percentage
 * - Optional label
 * - Responsive to dark mode
 */
export function ProgressRing({
  progress,
  size = 120,
  strokeWidth,
  showText = true,
  className,
  label = "Complete",
}: ProgressRingProps): JSX.Element {
  // Clamp progress to 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Scale stroke width based on size if not provided
  const effectiveStrokeWidth = strokeWidth ?? Math.max(6, Math.round(size / 12));

  // Calculate SVG circle properties
  const radius = (size - effectiveStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Color based on progress
  const getProgressColor = (): string => {
    if (clampedProgress >= 100) return "stroke-emerald-500";
    if (clampedProgress >= 75) return "stroke-cyan-500";
    if (clampedProgress >= 50) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  // Scale font size based on ring size
  const fontSize = size < 100 ? "text-lg" : "text-2xl";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={effectiveStrokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={effectiveStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-500 ease-out", getProgressColor())}
        />
      </svg>

      {/* Center text */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(fontSize, "font-bold text-slate-900 dark:text-slate-100")}>
            {Math.round(clampedProgress)}%
          </span>
          {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
        </div>
      )}
    </div>
  );
}

interface ProfileCompletionProps {
  /** Object containing profile field completion status */
  fields: {
    name: boolean;
    email: boolean;
    location: boolean;
    summary: boolean;
    experience: boolean;
    skills: boolean;
  };
  /** Size of the ring */
  size?: number;
  /** Additional class names */
  className?: string;
  /** Compact mode - hide checklist */
  compact?: boolean;
}

/**
 * Profile Completion Component
 *
 * Shows progress ring with optional compact mode.
 */
export function ProfileCompletion({
  fields,
  size = 100,
  className,
  compact = false,
}: ProfileCompletionProps): JSX.Element {
  const fieldList = [
    { key: "name", label: "Name", completed: fields.name },
    { key: "email", label: "Email", completed: fields.email },
    { key: "location", label: "Location", completed: fields.location },
    { key: "summary", label: "Summary", completed: fields.summary },
    { key: "experience", label: "Experience", completed: fields.experience },
    { key: "skills", label: "Skills", completed: fields.skills },
  ];

  const completedCount = fieldList.filter((f) => f.completed).length;
  const progress = (completedCount / fieldList.length) * 100;
  const missingFields = fieldList.filter((f) => !f.completed);

  // Compact mode: just show the ring
  if (compact) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <ProgressRing progress={progress} size={size} label="Complete" />
        {progress < 100 && missingFields.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            {missingFields.length} field{missingFields.length > 1 ? "s" : ""} remaining
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <ProgressRing progress={progress} size={size} label="Profile" />

      {/* Checklist */}
      {progress < 100 && (
        <div className="text-sm space-y-1">
          <p className="text-slate-500 dark:text-slate-400 text-center mb-2">Missing fields:</p>
          <ul className="space-y-1">
            {missingFields.map((field) => (
              <li
                key={field.key}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
              >
                <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                {field.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress === 100 && (
        <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          Profile complete! 🎉
        </p>
      )}
    </div>
  );
}
