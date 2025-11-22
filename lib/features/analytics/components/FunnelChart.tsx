"use client";

/**
 * Funnel Chart Component
 *
 * Pure CSS implementation (no external libraries).
 *
 * LEARNING EXERCISE: Create charts with SVG or Canvas API.
 */

import type { FunnelData } from "../utils/metrics";

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.stage} className="flex items-center gap-3">
          <div className="w-20 text-sm text-nordic-neutral-600">
            {item.stage}
          </div>
          <div className="flex-1">
            <div
              className="h-8 rounded transition-all duration-500"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: getColor(index),
              }}
            >
              <div className="flex h-full items-center justify-end px-2">
                <span className="text-sm font-medium text-white">
                  {item.count}
                </span>
              </div>
            </div>
          </div>
          <div className="w-12 text-right text-sm text-nordic-neutral-500">
            {item.percentage}%
          </div>
        </div>
      ))}
    </div>
  );
}

function getColor(index: number): string {
  const colors = ["#0284c7", "#0369a1", "#075985", "#0c4a6e", "#164e63"];
  return colors[index % colors.length];
}
