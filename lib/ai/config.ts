/**
 * AI Configuration
 *
 * Model configurations, API keys, and availability checking.
 * Supports both server-side (env vars) and client-side (localStorage) API keys.
 */

import type { AIProvider, LatexExtractionModel, ModelInfo } from "./types";

// =============================================================================
// MODEL CONFIGURATIONS
// =============================================================================

/**
 * Available models with metadata for UI display
 */
export const LATEX_MODELS: ModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    cost: "Free",
    description: "Fast, good for most CVs",
  },
  {
    id: "gemini-2.0-flash-or",
    name: "Gemini 2.0 Flash (OpenRouter)",
    provider: "openrouter",
    cost: "Free",
    description: "Gemini 2.0 via OpenRouter - different rate limits",
    openrouterModel: "google/gemini-2.0-flash-exp:free",
  },
  {
    id: "qwen-2.5-vl",
    name: "Qwen 2.5 VL 72B",
    provider: "openrouter",
    cost: "Free",
    description: "Alibaba vision-language model via OpenRouter",
    openrouterModel: "qwen/qwen2.5-vl-72b-instruct:free",
  },
  {
    id: "mistral-small-3.1",
    name: "Mistral Small 3.1",
    provider: "openrouter",
    cost: "Free",
    description: "Mistral 24B vision model via OpenRouter",
    openrouterModel: "mistralai/mistral-small-3.1-24b-instruct:free",
  },
  {
    id: "gemma-3-27b",
    name: "Google Gemma 3 27B",
    provider: "openrouter",
    cost: "Free",
    description: "Google's open Gemma model via OpenRouter",
    openrouterModel: "google/gemma-3-27b-it:free",
  },
];

// =============================================================================
// API KEY RESOLUTION
// =============================================================================

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Get API key from localStorage (client-side only)
 */
function getClientAPIKey(provider: AIProvider): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(`careerpal-ai-key-${provider}`);
  } catch {
    return null;
  }
}

/**
 * Get API key for a provider
 * Priority: 1) Explicit key passed, 2) Client localStorage, 3) Server env vars
 */
export function getAPIKeyForProvider(provider: AIProvider, explicitKey?: string): string | null {
  // 1. Explicit key takes priority (for testing or overrides)
  if (explicitKey) return explicitKey;

  // 2. Try client-side localStorage (BYOK)
  const clientKey = getClientAPIKey(provider);
  if (clientKey) return clientKey;

  // 3. Fall back to server env vars
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_API_KEY ?? null;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY ?? null;
    default:
      return null;
  }
}

// =============================================================================
// AI CONFIGURATION
// =============================================================================

/**
 * Static AI configuration
 * For API keys, use getAPIKeyForProvider() instead of accessing apiKeys directly
 */
export const AI_CONFIG = {
  // Default to Gemini (free tier)
  provider: (process.env.AI_PROVIDER as AIProvider) || "gemini",

  // Legacy: Direct env var access (use getAPIKeyForProvider for BYOK support)
  apiKeys: {
    get gemini(): string | undefined {
      return getAPIKeyForProvider("gemini") ?? undefined;
    },
    get openrouter(): string | undefined {
      return getAPIKeyForProvider("openrouter") ?? undefined;
    },
  },

  models: {
    gemini: "gemini-2.5-flash", // Free tier: Stable 2.5 Flash model
  },

  // Default model for LaTeX extraction
  defaultLatexModel: "gemini-2.5-flash" as LatexExtractionModel,
} as const;

// =============================================================================
// AVAILABILITY CHECKING
// =============================================================================

/**
 * Options for availability checking
 */
export interface AvailabilityOptions {
  geminiKey?: string | undefined;
  openrouterKey?: string | undefined;
}

/**
 * Check if a model is available (has API key configured)
 */
export function isModelAvailable(
  model: LatexExtractionModel,
  options?: AvailabilityOptions
): boolean {
  const modelInfo = LATEX_MODELS.find((m) => m.id === model);
  if (!modelInfo) return false;

  const explicitKey = modelInfo.provider === "gemini" ? options?.geminiKey : options?.openrouterKey;
  const apiKey = getAPIKeyForProvider(modelInfo.provider, explicitKey);

  return !!apiKey && apiKey.length > 0;
}

/**
 * Get list of available models with availability status
 */
export function getAvailableModels(
  options?: AvailabilityOptions
): Array<ModelInfo & { available: boolean }> {
  return LATEX_MODELS.map((model) => ({
    ...model,
    available: isModelAvailable(model.id, options),
  }));
}

/**
 * Get model info by ID
 */
export function getModelInfo(model: LatexExtractionModel): ModelInfo | undefined {
  return LATEX_MODELS.find((m) => m.id === model);
}

/**
 * Get the actual model name for a given model ID
 */
export function getModelName(_modelId: LatexExtractionModel): string {
  return AI_CONFIG.models.gemini;
}

// =============================================================================
// CLIENT-SIDE HELPERS
// =============================================================================

/**
 * Check if BYOK (Bring Your Own Key) is configured for a provider
 */
export function hasBYOK(provider: AIProvider): boolean {
  if (!isBrowser()) return false;
  const key = getClientAPIKey(provider);
  return !!key && key.length > 0;
}

/**
 * Check if any AI provider is available (either BYOK or server keys)
 */
export function hasAnyAIAvailable(options?: AvailabilityOptions): boolean {
  return (
    isModelAvailable("gemini-2.5-flash", options) ||
    LATEX_MODELS.filter((m) => m.provider === "openrouter").some((m) =>
      isModelAvailable(m.id as LatexExtractionModel, options)
    )
  );
}
