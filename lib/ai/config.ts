/**
 * AI Configuration
 *
 * Model configurations, API keys, and availability checking.
 * API keys are loaded from environment variables (.env.local).
 */

import { getAPIKey, hasAPIKey } from "./key-manager";
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
 * Get API key for a provider.
 * Priority: 1) Explicit key passed, 2) Environment variables
 */
export function getAPIKeyForProvider(provider: AIProvider, explicitKey?: string): string | null {
  // Explicit key takes priority (for testing or overrides)
  if (explicitKey) return explicitKey;

  // Use key-manager which reads from environment variables
  return getAPIKey(provider);
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
 * Check if an API key is configured for a provider.
 * Keys are loaded from environment variables.
 */
export function hasBYOK(provider: AIProvider): boolean {
  return hasAPIKey(provider);
}

/**
 * Check if any AI provider is available.
 */
export function hasAnyAIAvailable(options?: AvailabilityOptions): boolean {
  return (
    isModelAvailable("gemini-2.5-flash", options) ||
    LATEX_MODELS.filter((m) => m.provider === "openrouter").some((m) =>
      isModelAvailable(m.id as LatexExtractionModel, options)
    )
  );
}
