"use client";

import { useActivityFeed } from "../hooks/useActivityFeed";
import { ActivityItem } from "./ActivityItem";

export function ActivityFeed() {
  const { events, isLoading } = useActivityFeed();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-nordic-neutral-200" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-nordic-neutral-200 bg-white p-8 text-center">
        <p className="text-nordic-neutral-500">No activity yet</p>
        <p className="mt-1 text-sm text-nordic-neutral-400">
          Your job hunting activities will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="mb-4 text-lg font-semibold text-nordic-neutral-900">
        Activity Feed
      </h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-nordic-neutral-200" />

        {/* Events */}
        <div className="space-y-4">
          {events.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
