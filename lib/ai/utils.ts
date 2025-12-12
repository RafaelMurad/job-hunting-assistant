/**
 * AI Module Utilities
 *
 * Shared utility functions for AI providers.
 * This file should not import from providers to avoid circular dependencies.
 */

import { type ZodSchema, type ZodError } from "zod";

// =============================================================================
// TYPE-SAFE JSON PARSING UTILITIES
// =============================================================================

/**
 * Result type for safe JSON parsing operations.
 * Follows the Result pattern for explicit error handling.
 */
export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Safely parse a JSON string with optional Zod schema validation.
 * Returns null on failure - use for optional/fallback scenarios.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Optional Zod schema for validation
 * @returns Parsed and validated data, or null if parsing/validation fails
 *
 * @example
 * // Without schema (returns unknown, cast as needed)
 * const data = safeParseJson('{"name": "John"}');
 *
 * // With schema (returns typed and validated data)
 * const user = safeParseJson('{"name": "John"}', userSchema);
 */
export function safeParseJson<T>(
  jsonString: string,
  schema?: ZodSchema<T>
): T | null {
  try {
    const parsed: unknown = JSON.parse(jsonString);

    if (!schema) {
      return parsed as T;
    }

    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Parse JSON with detailed error reporting.
 * Throws descriptive errors for debugging - use for required data.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Optional Zod schema for validation
 * @param context - Optional context for error messages (e.g., "Claude response")
 * @returns Parsed and validated data
 * @throws Error with detailed message if parsing or validation fails
 *
 * @example
 * try {
 *   const analysis = parseJsonOrThrow(response, jobAnalysisSchema, "Gemini analysis");
 * } catch (error) {
 *   console.error("Failed to parse:", error.message);
 * }
 *
 * Note: The return type T should be the expected output type.
 * When using Zod schemas with .default(), the output type has all
 * fields as required (defaults are applied during parsing).
 */
export function parseJsonOrThrow<T>(
  jsonString: string,
  schema?: ZodSchema,
  context?: string
): T {
  const contextPrefix = context ? `[${context}] ` : "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    const syntaxError = error as SyntaxError;
    throw new Error(
      `${contextPrefix}Invalid JSON: ${syntaxError.message}\n` +
        `Input preview: ${jsonString.substring(0, 200)}...`
    );
  }

  if (!schema) {
    return parsed as T;
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = formatZodError(result.error);
    throw new Error(
      `${contextPrefix}Validation failed: ${issues}\n` +
        `Input preview: ${JSON.stringify(parsed).substring(0, 200)}...`
    );
  }

  // Cast to T - Zod's safeParse applies defaults, so output matches T
  return result.data as T;
}

/**
 * Parse JSON and return a Result type for explicit error handling.
 * Best for cases where you need to handle success/failure explicitly.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Optional Zod schema for validation
 * @returns SafeParseResult with either data or error message
 *
 * @example
 * const result = parseJsonSafe(response, userSchema);
 * if (result.success) {
 *   console.log(result.data.name);
 * } else {
 *   console.error(result.error);
 * }
 */
export function parseJsonSafe<T>(
  jsonString: string,
  schema?: ZodSchema<T>
): SafeParseResult<T> {
  try {
    const parsed: unknown = JSON.parse(jsonString);

    if (!schema) {
      return { success: true, data: parsed as T };
    }

    const result = schema.safeParse(parsed);
    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: formatZodError(result.error) };
  } catch (error) {
    const syntaxError = error as SyntaxError;
    return { success: false, error: `Invalid JSON: ${syntaxError.message}` };
  }
}

/**
 * Format Zod validation errors into a readable string.
 */
export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("; ");
}

// =============================================================================
// LATEX UTILITIES
// =============================================================================

/**
 * Clean and validate LaTeX output from any AI model.
 * Removes markdown code blocks and validates document structure.
 */
export function cleanAndValidateLatex(rawLatex: string): string {
  let latex = rawLatex.trim();

  // Remove any markdown code blocks if present
  latex = latex.replace(/^```(?:latex|tex)?\n?/gi, "").replace(/\n?```$/gi, "");

  // Try to find the documentclass if it's not at the start
  const docClassIndex = latex.indexOf("\\documentclass");
  if (docClassIndex > 0) {
    latex = latex.substring(docClassIndex);
  }

  // Try to find \end{document} and trim anything after
  const endDocIndex = latex.indexOf("\\end{document}");
  if (endDocIndex > 0) {
    latex = latex.substring(0, endDocIndex + "\\end{document}".length);
  }

  // Validate it has required elements
  if (!latex.includes("\\documentclass")) {
    throw new Error(
      "AI did not return valid LaTeX (missing \\documentclass). Please try uploading again."
    );
  }

  if (!latex.includes("\\end{document}")) {
    throw new Error(
      "AI returned incomplete LaTeX (missing \\end{document}). " +
        "Your document may be too long. Try a shorter version."
    );
  }

  return latex;
}

// =============================================================================
// JSON UTILITIES
// =============================================================================

/**
 * Clean JSON response from AI models by removing markdown code blocks.
 */
export function cleanJsonResponse(response: string): string {
  return response
    .replace(/^```(?:json)?\n?/gi, "")
    .replace(/\n?```$/gi, "")
    .trim();
}

/**
 * Extract JSON object from text response.
 * Useful when AI returns JSON embedded in other text.
 */
export function extractJsonFromText(text: string): string | null {
  const match = text.match(/{[\s\S]*}/);
  return match ? match[0] : null;
}

// Note: safeParseJson is now defined at the top of this file with optional Zod schema support

/**
 * Check if a string is valid JSON without throwing.
 */
export function isValidJson(jsonString: string): boolean {
  return safeParseJson(jsonString) !== null;
}
