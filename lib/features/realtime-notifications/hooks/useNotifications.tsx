"use client";

/**
 * Notifications Hook and Provider
 *
 * This module manages the SSE connection and notification state.
 *
 * LEARNING EXERCISE: Key parts are marked with TODO comments.
 * Complete them to understand how SSE connections work.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Notification } from "../types";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  /** API endpoint for SSE stream */
  endpoint?: string;
}

export function NotificationProvider({
  children,
  endpoint = "/api/notifications/stream",
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * TODO Exercise 1: Implement the SSE connection
   *
   * Server-Sent Events (SSE) provide a persistent connection from server to client.
   * Unlike WebSockets, SSE is:
   * - One-way (server to client only)
   * - Built on HTTP (works through proxies)
   * - Automatically reconnects
   *
   * Steps:
   * 1. Create an EventSource instance with the endpoint
   * 2. Handle 'open' event (connection established)
   * 3. Handle 'message' event (new notification)
   * 4. Handle 'error' event (connection lost)
   * 5. Parse incoming JSON and update state
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventSource
   */
  const connect = useCallback(() => {
    // Don't connect if already connected or on server
    if (typeof window === "undefined") return;
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    // Close existing connection
    eventSourceRef.current?.close();

    // ============================================
    // TODO: Create EventSource and handle events
    // ============================================

    // Hint: Create the EventSource
    // const es = new EventSource(endpoint);

    // Hint: Handle connection open
    // es.onopen = () => { setIsConnected(true); };

    // Hint: Handle incoming messages
    // es.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'notification') {
    //     setNotifications(prev => [data.data, ...prev]);
    //   }
    // };

    // Hint: Handle errors and reconnection
    // es.onerror = () => {
    //   setIsConnected(false);
    //   es.close();
    //   // Reconnect after delay
    //   reconnectTimeoutRef.current = setTimeout(connect, 5000);
    // };

    // eventSourceRef.current = es;

    // PLACEHOLDER: Remove this console.log when you implement
    console.log("[NotificationProvider] TODO: Implement SSE connection to", endpoint);
  }, [endpoint]);

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsConnected(false);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
