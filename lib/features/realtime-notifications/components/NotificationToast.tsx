"use client";

/**
 * Notification Toast Component
 *
 * Shows a toast popup when a new notification arrives.
 *
 * LEARNING EXERCISE: Implement the animation and auto-dismiss logic.
 */

import { useEffect, useState } from "react";
import type { Notification } from "../types";

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
  /** Auto-dismiss after this many milliseconds (default: 5000) */
  duration?: number;
}

export function NotificationToast({
  notification,
  onDismiss,
  duration = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  /**
   * TODO Exercise 3: Implement toast lifecycle
   *
   * 1. On mount: Trigger enter animation (setIsVisible(true))
   * 2. After `duration` ms: Trigger exit animation (setIsLeaving(true))
   * 3. After exit animation: Call onDismiss
   *
   * Hint: Use setTimeout and cleanup with useEffect
   */
  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss timer
    const dismissTimer = setTimeout(() => {
      setIsLeaving(true);
      // Wait for exit animation before calling onDismiss
      setTimeout(onDismiss, 300);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-lg border border-nordic-neutral-200 bg-white shadow-lg transition-all duration-300 ${
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="shrink-0">
            <svg
              className="h-5 w-5 text-fjord-500"
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
          </div>

          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-nordic-neutral-900">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-nordic-neutral-500">
              {notification.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <div className="ml-4 flex shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md text-nordic-neutral-400 hover:text-nordic-neutral-500 focus:outline-none focus:ring-2 focus:ring-fjord-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast Container - renders toasts in a fixed position
 */
interface ToastContainerProps {
  toasts: Array<{ id: string; notification: Notification }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 px-4 py-6 sm:p-6"
    >
      {toasts.map(({ id, notification }) => (
        <NotificationToast
          key={id}
          notification={notification}
          onDismiss={() => onDismiss(id)}
        />
      ))}
    </div>
  );
}
