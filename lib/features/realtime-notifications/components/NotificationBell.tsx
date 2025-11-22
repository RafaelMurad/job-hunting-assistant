"use client";

/**
 * Notification Bell Component
 *
 * A bell icon that shows unread notification count and opens a dropdown.
 *
 * LEARNING EXERCISE: Complete the TODO sections to build the UI.
 */

import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification } from "../types";

export function NotificationBell() {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-nordic-neutral-600 hover:bg-nordic-neutral-100 hover:text-nordic-neutral-900 transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        {/* Bell Icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-clay-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <span
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
            isConnected ? "bg-forest-500" : "bg-nordic-neutral-400"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-nordic-neutral-200 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-nordic-neutral-200 px-4 py-3">
              <h3 className="font-semibold text-nordic-neutral-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-fjord-600 hover:text-fjord-700"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-nordic-neutral-500">
                  No notifications yet
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => markAsRead(notification.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * TODO Exercise 2: Style the notification item based on type
 *
 * Different notification types should have different visual indicators:
 * - application_update: Blue (fjord)
 * - interview_reminder: Amber
 * - new_match: Green (forest)
 * - achievement: Purple
 * - system: Gray (neutral)
 */
interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { title, message, timestamp, read, type } = notification;

  // TODO: Implement getTypeStyles function
  // const typeStyles = getTypeStyles(type);

  return (
    <li
      className={`border-b border-nordic-neutral-100 px-4 py-3 last:border-0 ${
        read ? "bg-white" : "bg-fjord-50"
      }`}
    >
      <button
        onClick={onRead}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          {/* TODO: Add type-specific icon/color indicator here */}
          <div
            className="mt-1 h-2 w-2 rounded-full bg-fjord-500"
            title={type}
          />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-nordic-neutral-900 truncate">
              {title}
            </p>
            <p className="text-sm text-nordic-neutral-600 line-clamp-2">
              {message}
            </p>
            <p className="mt-1 text-xs text-nordic-neutral-400">
              {formatTimestamp(timestamp)}
            </p>
          </div>

          {!read && (
            <span className="h-2 w-2 rounded-full bg-fjord-500" />
          )}
        </div>
      </button>
    </li>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
