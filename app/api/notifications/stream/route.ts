/**
 * Server-Sent Events (SSE) API Route
 *
 * This endpoint establishes a persistent connection for push notifications.
 *
 * LEARNING EXERCISE: Understand how SSE works on the server side.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
 */

import { NextRequest } from "next/server";

/**
 * TODO Exercise 4: Implement the SSE endpoint
 *
 * SSE requires specific headers and response format:
 * 1. Content-Type: text/event-stream
 * 2. Cache-Control: no-cache
 * 3. Connection: keep-alive
 *
 * Event format:
 * ```
 * event: notification
 * data: {"type":"notification","data":{...}}
 *
 * ```
 * Note: Each message ends with TWO newlines
 */
export async function GET(request: NextRequest) {
  // Create a TransformStream for streaming response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to send SSE events
  const sendEvent = async (event: string, data: unknown) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Start sending events
  (async () => {
    try {
      // Send initial connection event
      await sendEvent("connected", {
        clientId: crypto.randomUUID(),
        timestamp: Date.now(),
      });

      // ============================================
      // TODO: Implement your notification logic here
      // ============================================
      //
      // In a real application, you would:
      // 1. Subscribe to a message queue (Redis pub/sub, etc.)
      // 2. Listen for database changes
      // 3. Push events when notifications are created
      //
      // For this exercise, we'll send a heartbeat every 30 seconds
      // and some demo notifications

      // Send heartbeat to keep connection alive
      const heartbeatInterval = setInterval(async () => {
        try {
          await sendEvent("heartbeat", { timestamp: Date.now() });
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Demo: Send a welcome notification after 2 seconds
      setTimeout(async () => {
        try {
          await sendEvent("notification", {
            type: "notification",
            data: {
              id: crypto.randomUUID(),
              type: "system",
              title: "Welcome!",
              message: "Real-time notifications are working.",
              timestamp: new Date().toISOString(),
              read: false,
            },
          });
        } catch {
          // Connection closed
        }
      }, 2000);

      // Handle connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        writer.close();
      });

      // Keep the connection open
      await new Promise(() => {});
    } catch (error) {
      console.error("[SSE] Error:", error);
      writer.close();
    }
  })();

  // Return streaming response with SSE headers
  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
