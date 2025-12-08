import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Parse AI API errors and return user-friendly messages
 */
export function parseAIError(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Rate limit / quota errors
  if (
    errorMessage.includes("429") ||
    errorMessage.includes("Too Many Requests") ||
    errorMessage.includes("quota")
  ) {
    if (errorMessage.includes("gemini-2.5-pro") || errorMessage.includes("gemini-3")) {
      return "This model requires a paid Google Cloud account. Please select Gemini 2.5 Flash (free) or add billing to your account.";
    }
    return "Rate limit exceeded. Please wait a moment and try again.";
  }

  // Authentication errors
  if (
    errorMessage.includes("401") ||
    errorMessage.includes("403") ||
    errorMessage.includes("API key") ||
    errorMessage.includes("authentication")
  ) {
    return "API key is invalid or missing. Please check your configuration.";
  }

  // Model not found
  if (errorMessage.includes("404") || errorMessage.includes("not found")) {
    return "Selected AI model is not available. Please try a different model.";
  }

  // Content/safety filters
  if (
    errorMessage.includes("safety") ||
    errorMessage.includes("blocked") ||
    errorMessage.includes("content")
  ) {
    return "The document couldn't be processed due to content restrictions. Please try a different file.";
  }

  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
    return "Request timed out. Please try again with a smaller file.";
  }

  // Network errors
  if (
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("network") ||
    errorMessage.includes("fetch")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // LaTeX-specific errors
  if (errorMessage.includes("\\documentclass")) {
    return "Could not extract valid LaTeX from your document. Please try a different file or model.";
  }

  if (errorMessage.includes("\\end{document}")) {
    return "AI returned incomplete LaTeX. Your document may be too complex. Try Gemini 2.5 Flash or a simpler CV format.";
  }

  // OpenAI specific
  if (errorMessage.includes("OpenAI")) {
    if (errorMessage.includes("billing") || errorMessage.includes("exceeded")) {
      return "OpenAI billing issue. Please check your OpenAI account.";
    }
    return "OpenAI error. Please try a Gemini model instead.";
  }

  // Claude specific
  if (errorMessage.includes("Anthropic") || errorMessage.includes("Claude")) {
    return "Claude API error. Please try a Gemini model instead.";
  }

  // Generic fallback - truncate long messages
  if (errorMessage.length > 100) {
    return "An error occurred processing your CV. Please try again or select a different model.";
  }

  return errorMessage;
}
