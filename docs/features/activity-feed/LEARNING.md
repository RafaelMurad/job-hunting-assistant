# Learning Guide: Event Sourcing

## Core Concepts

### Why Event Sourcing?

**Traditional approach:**
- Store current state
- Lose history of changes
- Hard to debug "what happened?"

**Event sourcing:**
- Store all events
- Derive current state by replay
- Complete audit trail
- Can rebuild state at any point

### Event Structure

```typescript
interface Event {
  id: string;           // Unique event ID
  type: string;         // What happened
  timestamp: Date;      // When it happened
  aggregateId: string;  // What entity it affected
  payload: object;      // Event data
  metadata: object;     // Context (user, version)
}
```

### State Reconstruction

```typescript
function reconstructState(events, reducer, initial) {
  return events.reduce(reducer, initial);
}

// Example reducer
function applicationReducer(state, event) {
  switch (event.type) {
    case 'APPLICATION_CREATED':
      return { ...event.payload, status: 'applied' };
    case 'STATUS_CHANGED':
      return { ...state, status: event.payload.to };
    default:
      return state;
  }
}
```

### CQRS Pattern

**Command** (write side):
- Validate commands
- Emit events
- Don't return state

**Query** (read side):
- Build read models from events
- Optimized for queries
- Can have multiple projections

## Benefits

1. **Audit Trail**: Know exactly what happened and when
2. **Debugging**: Replay events to reproduce bugs
3. **Time Travel**: See state at any point in history
4. **Event Replay**: Rebuild read models from scratch
5. **Integration**: Events make great integration points

## Challenges

1. **Event Schema Evolution**: Versioning events
2. **Storage Growth**: Many events accumulate
3. **Complexity**: More concepts to understand
4. **Eventual Consistency**: Read models may lag
