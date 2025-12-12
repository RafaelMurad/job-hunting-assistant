/**
 * API Type Definitions
 *
 * Types for API requests, responses, and errors.
 *
 * @module types/api
 */

/**
 * Standard API error response
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API success response
 */
export interface APIResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Standard API error response wrapper
 */
export interface APIErrorResponse {
  success: false;
  error: APIError;
}

/**
 * Combined API response type
 */
export type APIResult<T> = APIResponse<T> | APIErrorResponse;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Generic sort parameters
 */
export interface SortParams<T extends string = string> {
  field: T;
  order: SortOrder;
}

/**
 * File upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Button/action state for UI feedback
 */
export type ButtonState = "idle" | "loading" | "success" | "error";
