/**
 * Tests for useHistory hook
 *
 * Tests multi-level undo/redo functionality for the CV editor.
 */

import { useHistory } from "@/lib/hooks/useHistory";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useHistory", () => {
  describe("initialization", () => {
    it("should initialize with empty content by default", () => {
      const { result } = renderHook(() => useHistory());

      expect(result.current.content).toBe("");
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
      expect(result.current.historyPosition).toBe(1);
      expect(result.current.historyLength).toBe(1);
    });

    it("should initialize with provided content", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "initial content" }));

      expect(result.current.content).toBe("initial content");
      expect(result.current.historyLength).toBe(1);
    });
  });

  describe("pushToHistory", () => {
    it("should add new content to history", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v2");
      });

      expect(result.current.content).toBe("v2");
      expect(result.current.historyLength).toBe(2);
      expect(result.current.historyPosition).toBe(2);
      expect(result.current.canUndo).toBe(true);
    });

    it("should not duplicate same content", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v1"); // Same as initial
      });

      expect(result.current.historyLength).toBe(1);
    });

    it("should limit history to 20 entries", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v0" }));

      // Add 25 entries
      for (let i = 1; i <= 25; i++) {
        act(() => {
          result.current.pushToHistory(`v${i}`);
        });
      }

      expect(result.current.historyLength).toBe(20);
      expect(result.current.content).toBe("v25");
    });
  });

  describe("undo/redo", () => {
    it("should undo to previous state", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v2");
      });
      act(() => {
        result.current.pushToHistory("v3");
      });

      expect(result.current.content).toBe("v3");

      act(() => {
        result.current.undo();
      });

      expect(result.current.content).toBe("v2");
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);
    });

    it("should redo to next state", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v2");
      });
      act(() => {
        result.current.undo();
      });

      expect(result.current.content).toBe("v1");

      act(() => {
        result.current.redo();
      });

      expect(result.current.content).toBe("v2");
      expect(result.current.canRedo).toBe(false);
    });

    it("should not undo past the beginning", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.undo();
      });

      expect(result.current.content).toBe("v1");
      expect(result.current.canUndo).toBe(false);
    });

    it("should not redo past the end", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.redo();
      });

      expect(result.current.content).toBe("v1");
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("previousContent", () => {
    it("should be null at start of history", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      expect(result.current.previousContent).toBe(null);
    });

    it("should return previous entry after push", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v2");
      });

      expect(result.current.previousContent).toBe("v1");
    });

    it("should update after undo", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v2");
      });
      act(() => {
        result.current.pushToHistory("v3");
      });
      act(() => {
        result.current.undo();
      });

      expect(result.current.content).toBe("v2");
      expect(result.current.previousContent).toBe("v1");
    });
  });

  describe("reset", () => {
    it("should clear history and set new content", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.pushToHistory("v2");
      });
      act(() => {
        result.current.pushToHistory("v3");
      });
      act(() => {
        result.current.reset("fresh start");
      });

      expect(result.current.content).toBe("fresh start");
      expect(result.current.historyLength).toBe(1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe("setContent (debounced)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should update content immediately for display", () => {
      const { result } = renderHook(() => useHistory({ initialContent: "v1" }));

      act(() => {
        result.current.setContent("typing...");
      });

      expect(result.current.content).toBe("typing...");
    });
  });
});
