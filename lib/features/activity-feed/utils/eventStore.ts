/**
 * Event Store - Event Sourcing Implementation
 *
 * Event sourcing stores events (facts) instead of current state.
 * The current state is derived by replaying events.
 *
 * LEARNING EXERCISE: Understand event sourcing patterns.
 *
 * @see https://martinfowler.com/eaaDev/EventSourcing.html
 */

export type EventType =
  | "APPLICATION_CREATED"
  | "APPLICATION_UPDATED"
  | "APPLICATION_STATUS_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "OFFER_RECEIVED"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "NOTE_ADDED"
  | "DOCUMENT_UPLOADED"
  | "PROFILE_UPDATED"
  | "SKILL_ADDED"
  | "ACHIEVEMENT_UNLOCKED";

export interface ActivityEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  aggregateId: string; // e.g., applicationId
  aggregateType: string; // e.g., "application"
  payload: Record<string, unknown>;
  metadata: {
    userId: string;
    version: number;
    correlationId?: string;
  };
}

/**
 * In-memory event store (replace with database in production)
 */
class EventStore {
  private events: ActivityEvent[] = [];
  private subscribers: Set<(event: ActivityEvent) => void> = new Set();

  /**
   * TODO Exercise 1: Implement Event Append
   *
   * Events must be:
   * 1. Immutable (never modified after creation)
   * 2. Ordered (by timestamp or sequence number)
   * 3. Complete (contain all information needed)
   */
  append(event: Omit<ActivityEvent, "id" | "timestamp">): ActivityEvent {
    const fullEvent: ActivityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    this.events.push(fullEvent);
    this.notifySubscribers(fullEvent);

    return fullEvent;
  }

  /**
   * Get all events
   */
  getAll(): ActivityEvent[] {
    return [...this.events];
  }

  /**
   * Get events for a specific aggregate
   */
  getByAggregate(aggregateType: string, aggregateId: string): ActivityEvent[] {
    return this.events.filter(
      (e) => e.aggregateType === aggregateType && e.aggregateId === aggregateId
    );
  }

  /**
   * Get events by type
   */
  getByType(type: EventType): ActivityEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get recent events with pagination
   */
  getRecent(limit: number = 20, offset: number = 0): ActivityEvent[] {
    return [...this.events]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * Subscribe to new events
   */
  subscribe(callback: (event: ActivityEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(event: ActivityEvent) {
    this.subscribers.forEach((callback) => callback(event));
  }

  /**
   * TODO Exercise 2: Implement State Reconstruction
   *
   * Reconstruct the current state of an aggregate by replaying events.
   * This is the core concept of event sourcing.
   */
  reconstructState<T>(
    aggregateType: string,
    aggregateId: string,
    reducer: (state: T | null, event: ActivityEvent) => T,
    initialState: T | null = null
  ): T | null {
    const events = this.getByAggregate(aggregateType, aggregateId);
    return events.reduce(reducer, initialState);
  }

  /**
   * Clear all events (for testing)
   */
  clear() {
    this.events = [];
  }

  /**
   * Seed with sample events (for demo)
   */
  seed(userId: string) {
    const sampleEvents: Array<Omit<ActivityEvent, "id" | "timestamp">> = [
      {
        type: "APPLICATION_CREATED",
        aggregateId: "app-1",
        aggregateType: "application",
        payload: { company: "Google", position: "Software Engineer" },
        metadata: { userId, version: 1 },
      },
      {
        type: "APPLICATION_STATUS_CHANGED",
        aggregateId: "app-1",
        aggregateType: "application",
        payload: { from: "applied", to: "screening" },
        metadata: { userId, version: 2 },
      },
      {
        type: "INTERVIEW_SCHEDULED",
        aggregateId: "app-1",
        aggregateType: "application",
        payload: { date: "2024-01-15", type: "phone" },
        metadata: { userId, version: 3 },
      },
    ];

    sampleEvents.forEach((e) => this.append(e));
  }
}

// Singleton instance
export const eventStore = new EventStore();
