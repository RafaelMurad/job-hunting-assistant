/**
 * SOLUTION: SSE Connection Implementation
 *
 * This is the complete implementation of the connect function.
 * Only look at this after attempting Exercise 1!
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
import type { Notification } from "../../types";

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
  endpoint?: string;
}

export function NotificationProviderSolution({
  children,
  endpoint = "/api/notifications/stream",
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * SOLUTION: Complete SSE connection implementation
   */
  const connect = useCallback(() => {
    // Don't connect on server or if already connected
    if (typeof window === "undefined") return;
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

    // Close existing connection
    eventSourceRef.current?.close();

    // Create new EventSource
    const es = new EventSource(endpoint);

    // Handle connection open
    es.onopen = () => {
      console.log("[SSE] Connected");
      setIsConnected(true);
    };

    // Handle incoming messages
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "notification") {
          const notification: Notification = {
            ...data.data,
            timestamp: new Date(data.data.timestamp),
          };
          setNotifications((prev) => [notification, ...prev]);
        } else if (data.type === "heartbeat") {
          console.log("[SSE] Heartbeat received");
        }
      } catch (error) {
        console.error("[SSE] Failed to parse message:", error);
      }
    };

    // Handle named events (alternative to onmessage)
    es.addEventListener("notification", (event) => {
      try {
        const messageEvent = event as MessageEvent;
        const data = JSON.parse(messageEvent.data);
        const notification: Notification = {
          ...data.data,
          timestamp: new Date(data.data.timestamp),
        };
        setNotifications((prev) => [notification, ...prev]);
      } catch (error) {
        console.error("[SSE] Failed to parse notification:", error);
      }
    });

    // Handle errors
    es.onerror = (error) => {
      console.error("[SSE] Error:", error);
      setIsConnected(false);
      es.close();

      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("[SSE] Attempting to reconnect...");
        connect();
      }, 5000);
    };

    eventSourceRef.current = es;
  }, [endpoint]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

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

export function useNotificationsSolution() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
