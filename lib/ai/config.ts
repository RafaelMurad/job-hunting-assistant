/**
 * AI Configuration
 *
 * Model configurations, API keys, and availability checking.
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
    id: "nova-2-lite",
    name: "Amazon Nova 2 Lite",
    provider: "openrouter",
    cost: "Free",
    description: "Amazon vision model via OpenRouter",
    openrouterModel: "amazon/nova-2-lite-v1:free",
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
// AI CONFIGURATION
// =============================================================================

export const AI_CONFIG = {
  // Default to Gemini (free tier)
  provider: (process.env.AI_PROVIDER as AIProvider) || "gemini",

  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
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
 * Check if a model is available (has API key configured)
 */
export function isModelAvailable(model: LatexExtractionModel): boolean {
  const modelInfo = LATEX_MODELS.find((m) => m.id === model);
  if (!modelInfo) return false;

  const apiKey = AI_CONFIG.apiKeys[modelInfo.provider];
  return !!apiKey && apiKey.length > 0;
}

/**
 * Get list of available models with availability status
 */
export function getAvailableModels(): Array<ModelInfo & { available: boolean }> {
  return LATEX_MODELS.map((model) => ({
    ...model,
    available: isModelAvailable(model.id),
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
