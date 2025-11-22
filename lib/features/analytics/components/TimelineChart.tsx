"use client";

/**
 * Timeline Chart Component
 *
 * Pure CSS bar chart implementation.
 *
 * TODO Exercise: Replace with Recharts or Visx for advanced features.
 * @see https://recharts.org/
 * @see https://airbnb.io/visx/
 */

import type { TimelineData } from "../utils/metrics";

interface TimelineChartProps {
  data: TimelineData[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.applications), 1);

  return (
    <div className="h-48">
      <div className="flex h-full items-end gap-2">
        {data.map((item) => (
          <div key={item.date} className="flex-1 flex flex-col items-center">
            {/* Bar */}
            <div className="w-full flex flex-col gap-0.5">
              <div
                className="w-full rounded-t bg-fjord-500 transition-all duration-300"
                style={{
                  height: `${(item.applications / maxValue) * 120}px`,
                }}
                title={`${item.applications} applications`}
              />
            </div>
            {/* Label */}
            <div className="mt-2 text-xs text-nordic-neutral-500 -rotate-45 origin-top-left w-16">
              {formatDate(item.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
