/**
 * Notification Types
 *
 * Define the shape of notifications in your application.
 */

export type NotificationType =
  | "application_update"    // Job application status changed
  | "interview_reminder"    // Upcoming interview
  | "new_match"            // New job matching your profile
  | "achievement"          // Gamification achievement unlocked
  | "system";              // System notifications

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  /** Optional link to navigate to */
  actionUrl?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * SSE Event types sent from the server
 */
export interface SSEEvent {
  type: "notification" | "heartbeat" | "connected";
  data: Notification | { timestamp: number } | { clientId: string };
}
