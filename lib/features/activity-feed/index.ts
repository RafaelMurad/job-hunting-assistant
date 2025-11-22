/**
 * Activity Feed Feature (Event Sourcing)
 *
 * Provides an event-sourced activity timeline.
 * Events are immutable records of what happened.
 *
 * @see docs/features/activity-feed/README.md
 */

export { ActivityFeed } from "./components/ActivityFeed";
export { ActivityItem } from "./components/ActivityItem";
export { useActivityFeed } from "./hooks/useActivityFeed";
export { eventStore, type ActivityEvent, type EventType } from "./utils/eventStore";
