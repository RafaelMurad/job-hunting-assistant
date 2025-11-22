"use client";

import { useAnalytics } from "../hooks/useAnalytics";
import { FunnelChart } from "./FunnelChart";
import { TimelineChart } from "./TimelineChart";

export function AnalyticsDashboard() {
  const { metrics, funnel, timeline, isLoading } = useAnalytics();

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-nordic-neutral-200 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-nordic-neutral-900">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Applications"
          value={metrics.totalApplications}
          color="bg-fjord-100 text-fjord-700"
        />
        <MetricCard
          label="Interview Rate"
          value={`${metrics.interviewRate}%`}
          color="bg-forest-100 text-forest-700"
        />
        <MetricCard
          label="Offer Rate"
          value={`${metrics.offerRate}%`}
          color="bg-amber-100 text-amber-700"
        />
        <MetricCard
          label="Response Rate"
          value={`${metrics.responseRate}%`}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-nordic-neutral-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-nordic-neutral-900">
            Application Funnel
          </h2>
          <FunnelChart data={funnel} />
        </div>

        <div className="rounded-lg border border-nordic-neutral-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-nordic-neutral-900">
            Applications Over Time
          </h2>
          <TimelineChart data={timeline} />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  color: string;
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className={`rounded-lg ${color} p-4`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
