"use client";

import { useCallback, useEffect, useState } from "react";
import { eventStore, type ActivityEvent } from "../utils/eventStore";

export function useActivityFeed(limit: number = 20) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial events
    setEvents(eventStore.getRecent(limit));
    setIsLoading(false);

    // Subscribe to new events
    const unsubscribe = eventStore.subscribe((event) => {
      setEvents((prev) => [event, ...prev].slice(0, limit));
    });

    return unsubscribe;
  }, [limit]);

  const refresh = useCallback(() => {
    setEvents(eventStore.getRecent(limit));
  }, [limit]);

  return { events, isLoading, refresh };
}
