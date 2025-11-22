# Learning Guide: Server-Sent Events

## Core Concepts

### 1. What is SSE?

Server-Sent Events is a web technology for servers to push data to clients over HTTP.

**Key characteristics:**
- One-way: Server → Client only
- Built on HTTP: Works through proxies and firewalls
- Text-based: UTF-8 encoded data
- Auto-reconnect: Browser handles reconnection

### 2. SSE Message Format

```
event: notification
data: {"title": "Hello"}
id: 123
retry: 5000

```

- `event`: Event type (optional, default is "message")
- `data`: The payload (can span multiple lines)
- `id`: Event ID for reconnection
- `retry`: Reconnection delay in ms
- Empty line (`\n\n`) ends the message

### 3. Client-Side: EventSource API

```javascript
const es = new EventSource('/api/stream');

// Connection opened
es.onopen = () => console.log('Connected');

// Default message event
es.onmessage = (e) => console.log(e.data);

// Named event
es.addEventListener('notification', (e) => {
  const data = JSON.parse(e.data);
  console.log(data);
});

// Error handling
es.onerror = () => {
  if (es.readyState === EventSource.CLOSED) {
    console.log('Connection closed');
  }
};

// Clean up
es.close();
```

### 4. Server-Side: Streaming Response

```typescript
// Next.js App Router
export async function GET() {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: string) => {
    writer.write(encoder.encode(`data: ${data}\n\n`));
  };

  // Send events...
  send('hello');

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Common Patterns

### Heartbeat / Keep-Alive

Prevent connection timeout:

```typescript
setInterval(() => {
  send({ type: 'heartbeat', timestamp: Date.now() });
}, 30000);
```

### Reconnection with Last-Event-ID

```typescript
// Server sends ID
writer.write(`id: ${eventId}\ndata: ${data}\n\n`);

// On reconnect, browser sends Last-Event-ID header
const lastId = request.headers.get('Last-Event-ID');
```

### Graceful Shutdown

```typescript
request.signal.addEventListener('abort', () => {
  // Client disconnected, clean up
  clearInterval(heartbeat);
  writer.close();
});
```

## Exercise Checklist

Complete these in order:

1. [ ] **Exercise 1**: Implement SSE connection in `useNotifications.tsx`
2. [ ] **Exercise 2**: Add type-based styling in `NotificationBell.tsx`
3. [ ] **Exercise 3**: Implement toast animations in `NotificationToast.tsx`
4. [ ] **Exercise 4**: Enhance the SSE endpoint in `route.ts`

## Further Reading

1. [HTML Living Standard: SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html)
2. [MDN: Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
3. [Vercel: Streaming with Edge Functions](https://vercel.com/docs/functions/streaming)

## Common Pitfalls

1. **Nginx buffering**: Add `X-Accel-Buffering: no` header
2. **CORS**: SSE follows same-origin policy
3. **Max connections**: Browsers limit ~6 connections per domain
4. **Memory leaks**: Always clean up intervals and close writers
