/**
 * API Utilities Module
 *
 * Centralized exports for API route helpers.
 */

export {
  // Authentication wrappers
  withAuth,
  withAdminAuth,
  // Response helpers
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  rateLimitExceeded,
  success,
  // Logging
  logPrefix,
  // Types
  type AuthenticatedContext,
  type AuthenticatedHandler,
  type APIErrorResponse,
  type APISuccessResponse,
} from "./middleware";
