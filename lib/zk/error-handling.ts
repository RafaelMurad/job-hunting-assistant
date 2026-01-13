/**
 * Zero-Knowledge Error Handling
 *
 * Robust error handling for ZK operations including:
 * - Network failures
 * - Decryption errors
 * - Session expiration
 * - Offline detection
 */

// ============================================
// Error Types
// ============================================

export enum ZkErrorCode {
  // Network errors
  NETWORK_OFFLINE = "NETWORK_OFFLINE",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",

  // Auth errors
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  UNAUTHORIZED = "UNAUTHORIZED",

  // Crypto errors
  DECRYPTION_FAILED = "DECRYPTION_FAILED",
  ENCRYPTION_FAILED = "ENCRYPTION_FAILED",
  KEY_DERIVATION_FAILED = "KEY_DERIVATION_FAILED",
  INVALID_VAULT_FORMAT = "INVALID_VAULT_FORMAT",

  // Sync errors
  SYNC_CONFLICT = "SYNC_CONFLICT",
  VAULT_NOT_FOUND = "VAULT_NOT_FOUND",
  SAVE_FAILED = "SAVE_FAILED",

  // General
  UNKNOWN = "UNKNOWN",
}

export class ZkError extends Error {
  code: ZkErrorCode;
  details?: unknown;
  retryable: boolean;

  constructor(
    code: ZkErrorCode,
    message: string,
    options?: { details?: unknown; retryable?: boolean }
  ) {
    super(message);
    this.name = "ZkError";
    this.code = code;
    this.details = options?.details;
    this.retryable = options?.retryable ?? false;
  }

  static fromResponse(response: Response, body?: { error?: string }): ZkError {
    const message = body?.error || `Request failed with status ${response.status}`;

    switch (response.status) {
      case 401:
        return new ZkError(ZkErrorCode.UNAUTHORIZED, message);
      case 403:
        return new ZkError(ZkErrorCode.SESSION_EXPIRED, "Session expired. Please log in again.");
      case 404:
        return new ZkError(ZkErrorCode.VAULT_NOT_FOUND, "Vault not found");
      case 409:
        return new ZkError(ZkErrorCode.SYNC_CONFLICT, "Sync conflict detected", {
          retryable: true,
        });
      case 500:
      case 502:
      case 503:
        return new ZkError(ZkErrorCode.NETWORK_ERROR, message, { retryable: true });
      default:
        return new ZkError(ZkErrorCode.UNKNOWN, message);
    }
  }

  static isZkError(error: unknown): error is ZkError {
    return error instanceof ZkError;
  }
}

// ============================================
// Offline Detection
// ============================================

export interface OfflineState {
  isOnline: boolean;
  lastOnlineAt: Date | null;
}

/**
 * Check if the browser is online.
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/**
 * Create an offline state manager.
 */
export function createOfflineManager(): {
  getState: () => OfflineState;
  subscribe: (callback: (state: OfflineState) => void) => () => void;
} {
  let state: OfflineState = {
    isOnline: isOnline(),
    lastOnlineAt: isOnline() ? new Date() : null,
  };

  const listeners = new Set<(state: OfflineState) => void>();

  const updateState = (online: boolean): void => {
    state = {
      isOnline: online,
      lastOnlineAt: online ? new Date() : state.lastOnlineAt,
    };
    listeners.forEach((cb) => cb(state));
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => updateState(true));
    window.addEventListener("offline", () => updateState(false));
  }

  return {
    getState: () => state,
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// ============================================
// Retry Logic
// ============================================

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error) => {
    if (ZkError.isZkError(error)) {
      return error.retryable;
    }
    // Retry on network errors
    return error instanceof TypeError && error.message.includes("fetch");
  },
};

/**
 * Execute a function with exponential backoff retry.
 */
export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts || !opts.shouldRetry(error, attempt)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000,
        opts.maxDelayMs
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================
// Safe Fetch Wrapper
// ============================================

export interface SafeFetchOptions extends RequestInit {
  timeout?: number;
  retryOptions?: RetryOptions;
}

/**
 * Fetch wrapper with timeout, retry, and ZkError handling.
 */
export async function safeFetch(url: string, options?: SafeFetchOptions): Promise<Response> {
  const { timeout = 30000, retryOptions, ...fetchOptions } = options || {};

  // Check online status
  if (!isOnline()) {
    throw new ZkError(ZkErrorCode.NETWORK_OFFLINE, "No internet connection", { retryable: true });
  }

  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ZkError(ZkErrorCode.NETWORK_TIMEOUT, "Request timed out", { retryable: true });
      }
      throw new ZkError(ZkErrorCode.NETWORK_ERROR, "Network request failed", {
        details: error,
        retryable: true,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return withRetry(fetchWithTimeout, retryOptions);
}

// ============================================
// Pending Operations Queue
// ============================================

interface PendingOperation {
  id: string;
  timestamp: Date;
  type: "save" | "delete" | "update";
  data: unknown;
}

const PENDING_OPS_KEY = "zk_pending_operations";

/**
 * Queue an operation for later sync when offline.
 */
export function queueOfflineOperation(operation: Omit<PendingOperation, "id" | "timestamp">): void {
  if (typeof localStorage === "undefined") return;

  const pending = getPendingOperations();
  const newOp: PendingOperation = {
    ...operation,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  pending.push(newOp);
  localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pending));
}

/**
 * Get all pending operations.
 */
export function getPendingOperations(): PendingOperation[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const stored = localStorage.getItem(PENDING_OPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear a pending operation after successful sync.
 */
export function clearPendingOperation(id: string): void {
  if (typeof localStorage === "undefined") return;

  const pending = getPendingOperations().filter((op) => op.id !== id);
  localStorage.setItem(PENDING_OPS_KEY, JSON.stringify(pending));
}

/**
 * Clear all pending operations.
 */
export function clearAllPendingOperations(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(PENDING_OPS_KEY);
}

// ============================================
// User-Friendly Error Messages
// ============================================

/**
 * Convert ZkError to user-friendly message.
 */
export function getErrorMessage(error: unknown): string {
  if (ZkError.isZkError(error)) {
    switch (error.code) {
      case ZkErrorCode.NETWORK_OFFLINE:
        return "You're offline. Changes will be saved when you reconnect.";
      case ZkErrorCode.NETWORK_TIMEOUT:
        return "Request timed out. Please try again.";
      case ZkErrorCode.SESSION_EXPIRED:
        return "Your session has expired. Please log in again.";
      case ZkErrorCode.INVALID_CREDENTIALS:
        return "Invalid email or password.";
      case ZkErrorCode.DECRYPTION_FAILED:
        return "Failed to decrypt your data. Please check your password.";
      case ZkErrorCode.SYNC_CONFLICT:
        return "Your data was modified elsewhere. Please refresh and try again.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
