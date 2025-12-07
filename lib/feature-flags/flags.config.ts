/**
 * Feature Flags Configuration
 *
 * This file defines all available feature flags in the application.
 * Each flag has a unique key, description, and default state.
 *
 * @see docs/feature-flags/ADDING_FLAGS.md for how to add new flags
 */

export interface FeatureFlag {
  /** Unique identifier for the flag */
  key: string;
  /** Human-readable name */
  name: string;
  /** Description of what this flag controls */
  description: string;
  /** Default enabled state */
  defaultEnabled: boolean;
  /** Category for grouping in admin UI */
  category: "core" | "experimental" | "beta" | "deprecated";
}

/**
 * All feature flags in the application
 *
 * To add a new flag:
 * 1. Add it to this array
 * 2. The flag will automatically appear in the admin panel
 * 3. Use the useFeatureFlag hook to check if it's enabled
 */
export const FEATURE_FLAGS: FeatureFlag[] = [
  // ===================
  // CORE FLAGS
  // ===================
  {
    key: "gamification",
    name: "Gamification System",
    description: "Points, streaks, achievements, and level progression",
    defaultEnabled: false,
    category: "core",
  },

  // ===================
  // EXPERIMENTAL FLAGS
  // ===================
  {
    key: "realtime_notifications",
    name: "Real-Time Notifications",
    description: "Push notifications via Server-Sent Events",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "ai_resume_analyzer",
    name: "AI Resume Analyzer",
    description: "AI-powered resume feedback with streaming responses",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "offline_mode",
    name: "Offline Mode (PWA)",
    description: "Service worker caching and offline functionality",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "activity_feed",
    name: "Activity Feed",
    description: "Timeline of job hunting activities with event sourcing",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "smart_recommendations",
    name: "Smart Job Recommendations",
    description: "AI-powered job matching based on skills and preferences",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "analytics_dashboard",
    name: "Analytics Dashboard",
    description: "Visual charts and metrics for job search progress",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "integrations",
    name: "Integration Hub",
    description: "OAuth connections to LinkedIn, Indeed, etc.",
    defaultEnabled: false,
    category: "experimental",
  },
  {
    key: "background_jobs",
    name: "Background Jobs",
    description: "Scheduled reminders and batch processing",
    defaultEnabled: false,
    category: "experimental",
  },

  // ===================
  // BETA FLAGS
  // ===================

  // ===================
  // DEPRECATED FLAGS
  // ===================
];

/**
 * Get a flag definition by key
 */
export function getFlagDefinition(key: string): FeatureFlag | undefined {
  return FEATURE_FLAGS.find((flag) => flag.key === key);
}

/**
 * Get all flags in a category
 */
export function getFlagsByCategory(category: FeatureFlag["category"]): FeatureFlag[] {
  return FEATURE_FLAGS.filter((flag) => flag.category === category);
}

/**
 * Type-safe flag keys
 */
export type FeatureFlagKey = (typeof FEATURE_FLAGS)[number]["key"];
