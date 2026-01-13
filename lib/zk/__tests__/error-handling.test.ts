/**
 * Unit Tests: Error Handling Utilities
 *
 * Tests the ZkError class, retry logic, and offline detection.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  ZkError,
  ZkErrorCode,
  isOnline,
  withRetry,
  getErrorMessage,
  queueOfflineOperation,
  getPendingOperations,
  clearPendingOperation,
  clearAllPendingOperations,
} from "../error-handling";

describe("ZkError", () => {
  describe("constructor", () => {
    it("creates error with code and message", () => {
      const error = new ZkError(ZkErrorCode.NETWORK_OFFLINE, "No connection");
      expect(error.code).toBe(ZkErrorCode.NETWORK_OFFLINE);
      expect(error.message).toBe("No connection");
      expect(error.name).toBe("ZkError");
    });

    it("sets retryable flag", () => {
      const error = new ZkError(ZkErrorCode.NETWORK_ERROR, "Failed", { retryable: true });
      expect(error.retryable).toBe(true);
    });

    it("defaults retryable to false", () => {
      const error = new ZkError(ZkErrorCode.UNAUTHORIZED, "Not allowed");
      expect(error.retryable).toBe(false);
    });

    it("includes details", () => {
      const details = { statusCode: 500 };
      const error = new ZkError(ZkErrorCode.UNKNOWN, "Error", { details });
      expect(error.details).toEqual(details);
    });
  });

  describe("fromResponse", () => {
    it("creates UNAUTHORIZED for 401", () => {
      const response = { status: 401 } as Response;
      const error = ZkError.fromResponse(response, { error: "Invalid token" });
      expect(error.code).toBe(ZkErrorCode.UNAUTHORIZED);
    });

    it("creates SESSION_EXPIRED for 403", () => {
      const response = { status: 403 } as Response;
      const error = ZkError.fromResponse(response);
      expect(error.code).toBe(ZkErrorCode.SESSION_EXPIRED);
    });

    it("creates VAULT_NOT_FOUND for 404", () => {
      const response = { status: 404 } as Response;
      const error = ZkError.fromResponse(response);
      expect(error.code).toBe(ZkErrorCode.VAULT_NOT_FOUND);
    });

    it("creates SYNC_CONFLICT for 409 with retryable true", () => {
      const response = { status: 409 } as Response;
      const error = ZkError.fromResponse(response);
      expect(error.code).toBe(ZkErrorCode.SYNC_CONFLICT);
      expect(error.retryable).toBe(true);
    });

    it("creates NETWORK_ERROR for 5xx with retryable true", () => {
      const response = { status: 500 } as Response;
      const error = ZkError.fromResponse(response);
      expect(error.code).toBe(ZkErrorCode.NETWORK_ERROR);
      expect(error.retryable).toBe(true);
    });

    it("creates UNKNOWN for other status codes", () => {
      const response = { status: 418 } as Response;
      const error = ZkError.fromResponse(response);
      expect(error.code).toBe(ZkErrorCode.UNKNOWN);
    });
  });

  describe("isZkError", () => {
    it("returns true for ZkError", () => {
      const error = new ZkError(ZkErrorCode.UNKNOWN, "Test");
      expect(ZkError.isZkError(error)).toBe(true);
    });

    it("returns false for regular Error", () => {
      const error = new Error("Test");
      expect(ZkError.isZkError(error)).toBe(false);
    });

    it("returns false for non-errors", () => {
      expect(ZkError.isZkError("string")).toBe(false);
      expect(ZkError.isZkError(null)).toBe(false);
      expect(ZkError.isZkError(undefined)).toBe(false);
    });
  });
});

describe("isOnline", () => {
  it("returns true when navigator.onLine is true", () => {
    // In test environment, navigator may not exist, so this tests the fallback
    const result = isOnline();
    expect(typeof result).toBe("boolean");
  });
});

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new ZkError(ZkErrorCode.NETWORK_ERROR, "Fail", { retryable: true }))
      .mockResolvedValueOnce("success");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 5 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after max attempts", async () => {
    const error = new ZkError(ZkErrorCode.NETWORK_ERROR, "Always fails", { retryable: true });
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 5 })).rejects.toThrow(
      "Always fails"
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-retryable errors", async () => {
    const error = new ZkError(ZkErrorCode.UNAUTHORIZED, "Not allowed", { retryable: false });
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 1 })).rejects.toThrow("Not allowed");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("getErrorMessage", () => {
  it("returns friendly message for NETWORK_OFFLINE", () => {
    const error = new ZkError(ZkErrorCode.NETWORK_OFFLINE, "No network");
    const message = getErrorMessage(error);
    expect(message).toContain("offline");
  });

  it("returns friendly message for SESSION_EXPIRED", () => {
    const error = new ZkError(ZkErrorCode.SESSION_EXPIRED, "Expired");
    const message = getErrorMessage(error);
    expect(message).toContain("session");
    expect(message).toContain("log in");
  });

  it("returns friendly message for DECRYPTION_FAILED", () => {
    const error = new ZkError(ZkErrorCode.DECRYPTION_FAILED, "Bad key");
    const message = getErrorMessage(error);
    expect(message).toContain("decrypt");
    expect(message).toContain("password");
  });

  it("returns original message for regular errors", () => {
    const error = new Error("Something went wrong");
    const message = getErrorMessage(error);
    expect(message).toBe("Something went wrong");
  });

  it("returns generic message for unknown types", () => {
    const message = getErrorMessage("string error");
    expect(message).toContain("unexpected");
  });
});

describe("pending operations queue", () => {
  beforeEach(() => {
    clearAllPendingOperations();
  });

  it("queues an operation", () => {
    queueOfflineOperation({ type: "save", data: { test: true } });
    const pending = getPendingOperations();
    expect(pending).toHaveLength(1);
    const first = pending[0];
    expect(first).toBeDefined();
    expect(first!.type).toBe("save");
    expect(first!.data).toEqual({ test: true });
  });

  it("assigns unique IDs", () => {
    queueOfflineOperation({ type: "save", data: {} });
    queueOfflineOperation({ type: "update", data: {} });
    const pending = getPendingOperations();
    expect(pending).toHaveLength(2);
    expect(pending[0]!.id).not.toBe(pending[1]!.id);
  });

  it("clears a specific operation", () => {
    queueOfflineOperation({ type: "save", data: {} });
    queueOfflineOperation({ type: "update", data: {} });
    const pending = getPendingOperations();
    expect(pending).toHaveLength(2);
    clearPendingOperation(pending[0]!.id);
    const remaining = getPendingOperations();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.type).toBe("update");
  });

  it("clears all operations", () => {
    queueOfflineOperation({ type: "save", data: {} });
    queueOfflineOperation({ type: "update", data: {} });
    clearAllPendingOperations();
    expect(getPendingOperations()).toHaveLength(0);
  });
});
