/**
 * Utility Type Definitions
 *
 * Reusable utility types for common patterns.
 *
 * @module types/utils
 */

/**
 * Makes specific properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specific properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Converts Date fields to string (for JSON serialization)
 */
export type WithStringDates<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K];
};

/**
 * Converts string fields back to Date
 */
export type WithDateObjects<T> = {
  [K in keyof T]: T[K] extends string ? Date : T[K] extends string | null ? Date | null : T[K];
};

/**
 * Extracts the element type from an array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Makes all properties deeply optional
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Extracts keys of T that are of type U
 */
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

/**
 * Promise unwrapper - extracts the resolved type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Nullable version of T
 */
export type Nullable<T> = T | null;

/**
 * Non-nullable version of T (removes null and undefined)
 */
export type NonNullable<T> = Exclude<T, null | undefined>;
