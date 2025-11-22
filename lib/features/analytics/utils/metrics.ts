/**
 * Analytics Metrics Utilities
 *
 * Aggregate and transform data for visualization.
 */

export interface Application {
  id: string;
  status: string;
  appliedAt: Date;
  company: string;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface TimelineData {
  date: string;
  applications: number;
  interviews: number;
  offers: number;
}

/**
 * Calculate funnel metrics
 */
export function calculateFunnel(applications: Application[]): FunnelData[] {
  const stages = ["applied", "screening", "interview", "offer", "accepted"];
  const total = applications.length || 1;

  return stages.map((stage) => {
    const count = applications.filter((app) => {
      const stageIndex = stages.indexOf(stage);
      const appStageIndex = stages.indexOf(app.status);
      return appStageIndex >= stageIndex;
    }).length;

    return {
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
}

/**
 * Group applications by time period
 */
export function groupByTimePeriod(
  applications: Application[],
  period: "day" | "week" | "month" = "week"
): TimelineData[] {
  const grouped = new Map<string, { applications: number; interviews: number; offers: number }>();

  applications.forEach((app) => {
    const date = new Date(app.appliedAt);
    let key: string;

    if (period === "day") {
      key = date.toISOString().split("T")[0];
    } else if (period === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = grouped.get(key) || { applications: 0, interviews: 0, offers: 0 };
    existing.applications++;
    if (app.status === "interview") existing.interviews++;
    if (app.status === "offer" || app.status === "accepted") existing.offers++;
    grouped.set(key, existing);
  });

  return Array.from(grouped.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate aggregate metrics
 */
export function aggregateMetrics(applications: Application[]) {
  const total = applications.length;
  const byStatus = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const interviews = byStatus["interview"] || 0;
  const offers = byStatus["offer"] || 0 + (byStatus["accepted"] || 0);

  return {
    totalApplications: total,
    interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
    offerRate: interviews > 0 ? Math.round((offers / interviews) * 100) : 0,
    responseRate: total > 0 ? Math.round(((total - (byStatus["applied"] || 0)) / total) * 100) : 0,
    byStatus,
  };
}
