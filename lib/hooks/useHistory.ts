/**
 * useHistory Hook
 *
 * Provides multi-level undo/redo functionality for text content.
 * Used by the CV editor to track LaTeX changes across AI modifications,
 * template switches, and manual edits.
 *
 * Features:
 * - 20-entry history limit (oldest dropped when exceeded)
 * - Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
 * - Debounced manual edit tracking (2s)
 */

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY_SIZE = 20;
const DEBOUNCE_MS = 2000;

export interface UseHistoryOptions {
  /** Initial content to populate history with */
  initialContent?: string;
  /** Enable keyboard shortcuts (Cmd+Z, Cmd+Shift+Z) */
  enableKeyboardShortcuts?: boolean;
}

export interface UseHistoryReturn {
  /** Current content value */
  content: string;
  /** Previous content (for diff view), null if at start of history */
  previousContent: string | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Current position in history (for display) */
  historyPosition: number;
  /** Total history entries */
  historyLength: number;
  /** Set content directly (for controlled input) - debounced history push */
  setContent: (content: string) => void;
  /** Push content to history immediately (for discrete actions like AI modify) */
  pushToHistory: (content: string) => void;
  /** Undo to previous state */
  undo: () => void;
  /** Redo to next state */
  redo: () => void;
  /** Clear all history and reset to given content */
  reset: (content: string) => void;
}

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { initialContent = "", enableKeyboardShortcuts = true } = options;

  // History stack - array of content snapshots
  const [history, setHistory] = useState<string[]>([initialContent]);
  // Current position in history (0 = oldest, length-1 = newest)
  const [historyIndex, setHistoryIndex] = useState(0);

  // Debounce timer ref for manual edits
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track if we're in the middle of an undo/redo to prevent debounce push
  const isUndoRedoRef = useRef(false);

  // Current content is whatever is at the current history index
  const content = history[historyIndex] ?? "";

  // Previous content for diff view
  const previousContent = historyIndex > 0 ? (history[historyIndex - 1] ?? null) : null;

  // Can undo if we're not at the start of history
  const canUndo = historyIndex > 0;

  // Can redo if we're not at the end of history
  const canRedo = historyIndex < history.length - 1;

  /**
   * Push new content to history, trimming future states if we're mid-history
   * and enforcing max size limit.
   */
  const pushToHistoryInternal = useCallback(
    (newContent: string) => {
      setHistory((prev) => {
        // If content is same as current, don't push
        if (prev[historyIndex] === newContent) {
          return prev;
        }

        // Trim any "future" states if we're mid-history
        const newHistory = prev.slice(0, historyIndex + 1);

        // Add new content
        newHistory.push(newContent);

        // Enforce max size - drop oldest if over limit
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
          // Don't increment index since we removed from the front
          return newHistory;
        }

        return newHistory;
      });

      setHistoryIndex((prev) => {
        // If we're at max and would overflow, stay at max-1
        // Otherwise increment
        return Math.min(prev + 1, MAX_HISTORY_SIZE - 1);
      });
    },
    [historyIndex]
  );

  /**
   * Public method to push content immediately (for discrete actions)
   */
  const pushToHistory = useCallback(
    (newContent: string) => {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      pushToHistoryInternal(newContent);
    },
    [pushToHistoryInternal]
  );

  /**
   * Set content with debounced history push (for manual typing)
   */
  const setContent = useCallback(
    (newContent: string) => {
      // If this is from an undo/redo, don't debounce-push
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }

      // Update current history entry in-place for immediate feedback
      setHistory((prev) => {
        const updated = [...prev];
        updated[historyIndex] = newContent;
        return updated;
      });

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer to push to history
      debounceTimerRef.current = setTimeout(() => {
        pushToHistoryInternal(newContent);
        debounceTimerRef.current = null;
      }, DEBOUNCE_MS);
    },
    [historyIndex, pushToHistoryInternal]
  );

  /**
   * Undo to previous state
   */
  const undo = useCallback(() => {
    if (!canUndo) return;

    // Clear any pending debounce to avoid pushing stale content
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    isUndoRedoRef.current = true;
    setHistoryIndex((prev) => prev - 1);
  }, [canUndo]);

  /**
   * Redo to next state
   */
  const redo = useCallback(() => {
    if (!canRedo) return;

    isUndoRedoRef.current = true;
    setHistoryIndex((prev) => prev + 1);
  }, [canRedo]);

  /**
   * Reset history to a single entry
   */
  const reset = useCallback((newContent: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setHistory([newContent]);
    setHistoryIndex(0);
  }, []);

  /**
   * Keyboard shortcuts handler
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      // Cmd+Z or Ctrl+Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd+Shift+Z or Ctrl+Shift+Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Cmd+Y or Ctrl+Y for redo (alternative)
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    content,
    previousContent,
    canUndo,
    canRedo,
    historyPosition: historyIndex + 1,
    historyLength: history.length,
    setContent,
    pushToHistory,
    undo,
    redo,
    reset,
  };
}
