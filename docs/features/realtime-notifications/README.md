# Real-Time Notifications

Push notifications using Server-Sent Events (SSE).

## What You'll Learn

- **Server-Sent Events (SSE)**: One-way server-to-client streaming
- **Event-Driven Architecture**: React to events instead of polling
- **Connection Management**: Reconnection, heartbeats, error handling
- **React Patterns**: Context, hooks, refs for stateful connections

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│     Browser     │◄────────│     Server      │
│                 │   SSE   │                 │
│  EventSource   │◄────────│  /api/stream    │
│       ↓         │         │       ↓         │
│  useNotifications        │  Event Producer │
│       ↓         │         │                 │
│  NotificationBell        │                 │
└─────────────────┘         └─────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `hooks/useNotifications.tsx` | SSE connection + state management |
| `components/NotificationBell.tsx` | UI component with dropdown |
| `components/NotificationToast.tsx` | Popup toast notifications |
| `app/api/notifications/stream/route.ts` | SSE endpoint |

## Quick Start

```tsx
// In your layout or page
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { NotificationProvider, NotificationBell } from "@/lib/features/realtime-notifications";

function Layout({ children }) {
  const isEnabled = useFeatureFlag("realtime_notifications");

  return (
    <>
      {isEnabled && (
        <NotificationProvider>
          <NotificationBell />
        </NotificationProvider>
      )}
      {children}
    </>
  );
}
```

## Official Documentation

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MDN: EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## SSE vs WebSockets

| Feature | SSE | WebSocket |
|---------|-----|-----------|
| Direction | Server → Client | Bidirectional |
| Protocol | HTTP | WS/WSS |
| Reconnection | Automatic | Manual |
| Binary data | No (text only) | Yes |
| Complexity | Simple | More complex |
| Use case | Notifications, feeds | Chat, games |

**Choose SSE when**: You only need server-to-client updates (notifications, live feeds).
