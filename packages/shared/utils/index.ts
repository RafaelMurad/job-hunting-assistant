/**
 * Shared Utilities
 *
 * Helper functions used by both web and mobile apps.
 */

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return then.toLocaleDateString();
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get status color
 */
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  bgRgb: string;
} {
  const colors: Record<string, { bg: string; text: string; bgRgb: string }> = {
    applied: { bg: "#dbeafe", text: "#1d4ed8", bgRgb: "219, 234, 254" },
    screening: { bg: "#fef3c7", text: "#d97706", bgRgb: "254, 243, 199" },
    interview: { bg: "#d1fae5", text: "#059669", bgRgb: "209, 250, 229" },
    offer: { bg: "#ede9fe", text: "#7c3aed", bgRgb: "237, 233, 254" },
    accepted: { bg: "#dcfce7", text: "#16a34a", bgRgb: "220, 252, 231" },
    rejected: { bg: "#fee2e2", text: "#dc2626", bgRgb: "254, 226, 226" },
  };
  return colors[status] || colors.applied;
}

/**
 * Calculate match percentage
 */
export function calculateMatchPercentage(
  userSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;

  const normalizedUser = userSkills.map((s) => s.toLowerCase());
  const matches = requiredSkills.filter((skill) =>
    normalizedUser.includes(skill.toLowerCase())
  );

  return Math.round((matches.length / requiredSkills.length) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
