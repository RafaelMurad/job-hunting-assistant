# Activity Feed (Event Sourcing)

Event-sourced activity timeline.

## What You'll Learn

- **Event Sourcing**: Store events, derive state
- **CQRS**: Command Query Responsibility Segregation
- **Immutability**: Events never change
- **Audit Trail**: Complete history of changes

## Key Concepts

```
Traditional: Store current state
┌─────────┐    ┌─────────┐
│ UPDATE  │───>│ State=B │
└─────────┘    └─────────┘

Event Sourcing: Store events
┌─────────┐    ┌─────────────────────┐
│ Event A │───>│ Event A │ Event B │ ─> State = f(A,B)
└─────────┘    └─────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `utils/eventStore.ts` | Event storage and replay |
| `hooks/useActivityFeed.ts` | React hook for events |
| `components/ActivityFeed.tsx` | Timeline UI |
| `components/ActivityItem.tsx` | Single event card |

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { ActivityFeed, eventStore } from "@/lib/features/activity-feed";

// Record an event
eventStore.append({
  type: "APPLICATION_CREATED",
  aggregateId: "app-123",
  aggregateType: "application",
  payload: { company: "Google", position: "SWE" },
  metadata: { userId: "user-1", version: 1 },
});

// Display feed
function Timeline() {
  const isEnabled = useFeatureFlag("activity_feed");
  if (!isEnabled) return null;
  return <ActivityFeed />;
}
```

## Official Documentation

- [Martin Fowler: Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Microsoft: Event Sourcing Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
