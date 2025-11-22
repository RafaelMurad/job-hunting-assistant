"use client";

import { useCallback, useState } from "react";
import { aggregateMetrics, calculateFunnel, groupByTimePeriod, type Application } from "../utils/metrics";

// Mock data for demonstration
const MOCK_APPLICATIONS: Application[] = [
  { id: "1", status: "applied", appliedAt: new Date("2024-01-01"), company: "Google" },
  { id: "2", status: "screening", appliedAt: new Date("2024-01-03"), company: "Meta" },
  { id: "3", status: "interview", appliedAt: new Date("2024-01-05"), company: "Amazon" },
  { id: "4", status: "applied", appliedAt: new Date("2024-01-08"), company: "Netflix" },
  { id: "5", status: "offer", appliedAt: new Date("2024-01-10"), company: "Apple" },
  { id: "6", status: "applied", appliedAt: new Date("2024-01-12"), company: "Microsoft" },
  { id: "7", status: "screening", appliedAt: new Date("2024-01-15"), company: "Stripe" },
  { id: "8", status: "interview", appliedAt: new Date("2024-01-18"), company: "Airbnb" },
  { id: "9", status: "accepted", appliedAt: new Date("2024-01-20"), company: "Spotify" },
  { id: "10", status: "applied", appliedAt: new Date("2024-01-22"), company: "Uber" },
];

export function useAnalytics() {
  const [applications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [isLoading] = useState(false);

  const metrics = aggregateMetrics(applications);
  const funnel = calculateFunnel(applications);
  const timeline = groupByTimePeriod(applications, "week");

  const refresh = useCallback(() => {
    // In production, fetch from API
  }, []);

  return {
    applications,
    metrics,
    funnel,
    timeline,
    isLoading,
    refresh,
  };
}
