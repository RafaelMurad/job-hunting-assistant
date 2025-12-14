/**
 * Centralized Logging Utility
 *
 * Provides consistent, structured logging across the application.
 * Follows industry-standard log levels and formatting.
 *
 * Usage:
 * ```ts
 * import { logger } from "@/lib/logger";
 *
 * logger.error("CVStore", "Failed to process upload", error);
 * logger.warn("Auth", "Session expired, redirecting to login");
 * logger.info("AI", "Extraction completed", { model: "gemini-2.5-pro", duration: 1234 });
 * logger.debug("TokenManager", "Decrypting token for user", { userId });
 * ```
 *
 * @module lib/logger
 */

// =============================================================================
// TYPES
// =============================================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Log levels enabled by environment.
 * - Production: warn, error only (minimal logging)
 * - Development: all levels
 * - Test: error only
 */
function getEnabledLevels(): Set<LogLevel> {
  const env = process.env.NODE_ENV;

  if (env === "production") {
    return new Set(["warn", "error"]);
  }

  if (env === "test") {
    return new Set(["error"]);
  }

  // Development - all levels
  return new Set(["debug", "info", "warn", "error"]);
}

const enabledLevels = getEnabledLevels();

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format log prefix consistently.
 * Format: [ModuleName] or [ModuleName:METHOD]
 */
function formatPrefix(module: string, method?: string): string {
  return method ? `[${module}:${method}]` : `[${module}]`;
}

/**
 * Format error for logging.
 * Extracts useful information from Error objects.
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Format context data for logging.
 */
function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) {
    return "";
  }
  try {
    return ` ${JSON.stringify(context)}`;
  } catch {
    return "";
  }
}

// =============================================================================
// LOGGER IMPLEMENTATION
// =============================================================================

/**
 * Log an error message.
 * Always logged regardless of environment.
 *
 * @param module - Module/component name (e.g., "CVStore", "Auth", "AI")
 * @param message - Error description
 * @param error - Optional error object or additional context
 * @param context - Optional structured context data
 */
function error(module: string, message: string, error?: unknown, context?: LogContext): void {
  if (!enabledLevels.has("error")) return;

  const prefix = formatPrefix(module);
  const errorStr = error ? ` ${formatError(error)}` : "";
  const contextStr = formatContext(context);

  console.error(`${prefix} ${message}${errorStr}${contextStr}`);
}

/**
 * Log a warning message.
 * Logged in development and production.
 *
 * @param module - Module/component name
 * @param message - Warning description
 * @param context - Optional structured context data
 */
function warn(module: string, message: string, context?: LogContext): void {
  if (!enabledLevels.has("warn")) return;

  const prefix = formatPrefix(module);
  const contextStr = formatContext(context);

  console.warn(`${prefix} ${message}${contextStr}`);
}

/**
 * Log an informational message.
 * Only logged in development.
 *
 * @param module - Module/component name
 * @param message - Info description
 * @param context - Optional structured context data
 */
function info(module: string, message: string, context?: LogContext): void {
  if (!enabledLevels.has("info")) return;

  const prefix = formatPrefix(module);
  const contextStr = formatContext(context);

  // eslint-disable-next-line no-console
  console.info(`${prefix} ${message}${contextStr}`);
}

/**
 * Log a debug message.
 * Only logged in development.
 *
 * @param module - Module/component name
 * @param message - Debug description
 * @param context - Optional structured context data
 */
function debug(module: string, message: string, context?: LogContext): void {
  if (!enabledLevels.has("debug")) return;

  const prefix = formatPrefix(module);
  const contextStr = formatContext(context);

  // eslint-disable-next-line no-console
  console.debug(`${prefix} ${message}${contextStr}`);
}

/**
 * Create a scoped logger for a specific module.
 * Useful for files with many log statements.
 *
 * @example
 * const log = logger.scope("CVStore");
 * log.error("Failed to process", error);
 * log.info("Upload completed", { size: 1024 });
 */
function scope(module: string): {
  error: (message: string, err?: unknown, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
} {
  return {
    error: (message: string, err?: unknown, context?: LogContext) =>
      error(module, message, err, context),
    warn: (message: string, context?: LogContext) => warn(module, message, context),
    info: (message: string, context?: LogContext) => info(module, message, context),
    debug: (message: string, context?: LogContext) => debug(module, message, context),
  };
}

/**
 * Create a scoped logger for API routes with HTTP method.
 *
 * @example
 * const log = logger.api("CVStore", "POST");
 * log.error("Failed to process", error);
 * // Output: [CVStore:POST] Failed to process Error: ...
 */
function api(
  route: string,
  method: string
): {
  error: (message: string, err?: unknown, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
} {
  const prefix = formatPrefix(route, method);
  return {
    error: (message: string, err?: unknown, context?: LogContext) => {
      if (!enabledLevels.has("error")) return;
      const errorStr = err ? ` ${formatError(err)}` : "";
      const contextStr = formatContext(context);
      console.error(`${prefix} ${message}${errorStr}${contextStr}`);
    },
    warn: (message: string, context?: LogContext) => {
      if (!enabledLevels.has("warn")) return;
      const contextStr = formatContext(context);
      console.warn(`${prefix} ${message}${contextStr}`);
    },
    info: (message: string, context?: LogContext) => {
      if (!enabledLevels.has("info")) return;
      const contextStr = formatContext(context);
      // eslint-disable-next-line no-console
      console.info(`${prefix} ${message}${contextStr}`);
    },
    debug: (message: string, context?: LogContext) => {
      if (!enabledLevels.has("debug")) return;
      const contextStr = formatContext(context);
      // eslint-disable-next-line no-console
      console.debug(`${prefix} ${message}${contextStr}`);
    },
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const logger = {
  error,
  warn,
  info,
  debug,
  scope,
  api,
};

// Re-export for convenience
export type { LogLevel, LogContext };
