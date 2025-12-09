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
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    cost: "Paid",
    description: "Best reasoning (requires billing enabled)",
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro (Preview)",
    provider: "gemini",
    cost: "Paid",
    description: "Best multimodal (requires billing enabled)",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    cost: "~$0.01",
    description: "OpenAI vision model",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "claude",
    cost: "~$0.05",
    description: "Anthropic vision model",
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
    geminiGcp: process.env.GEMINI_GCP_API_KEY, // GCP billed (uses cloud credits)
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  },

  models: {
    gemini: "gemini-2.5-flash", // Free tier: Stable 2.5 Flash model
    geminiPro: "gemini-2.5-pro", // Free tier: Best reasoning
    gemini3Pro: "gemini-3-pro-preview", // Free preview: Best multimodal
    openai: "gpt-4o", // Paid: ~$2.50 per 1M input tokens (vision)
    claude: "claude-sonnet-4-5-20250929", // Paid: $3 per 1M input tokens
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
export function getModelName(modelId: LatexExtractionModel): string {
  switch (modelId) {
    case "gemini-2.5-pro":
      return AI_CONFIG.models.geminiPro;
    case "gemini-3-pro-preview":
      return AI_CONFIG.models.gemini3Pro;
    case "gemini-2.5-flash":
    default:
      return AI_CONFIG.models.gemini;
  }
}
