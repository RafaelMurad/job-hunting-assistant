/**
 * Real-Time Notifications Feature
 *
 * This feature provides push notifications using Server-Sent Events (SSE).
 * SSE is a simpler alternative to WebSockets for one-way server-to-client communication.
 *
 * @see docs/features/realtime-notifications/README.md
 */

export { NotificationProvider, useNotifications } from "./hooks/useNotifications";
export { NotificationBell } from "./components/NotificationBell";
export { NotificationToast } from "./components/NotificationToast";
export type { Notification, NotificationType } from "./types";
