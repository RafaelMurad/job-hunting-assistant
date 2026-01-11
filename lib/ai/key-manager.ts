/**
 * API Key Manager
 *
 * Simple key management: checks if API keys are configured via environment variables.
 * Users add keys to .env.local before running the dev server.
 *
 * @module lib/ai/key-manager
 */

import type { AIProvider } from "./types";

// ============================================
// Constants
// ============================================

const VALID_PROVIDERS: AIProvider[] = ["gemini", "openrouter"];

// Key format patterns for basic validation
const KEY_PATTERNS: Record<AIProvider, RegExp> = {
  gemini: /^AIza[A-Za-z0-9_-]{35}$/, // Google API key format
  openrouter: /^sk-or-v1-[a-f0-9]{64}$/, // OpenRouter format
};

// Provider metadata for UI
export const PROVIDER_INFO: Record<
  AIProvider,
  {
    name: string;
    description: string;
    getKeyUrl: string;
    envVar: string;
    placeholder: string;
  }
> = {
  gemini: {
    name: "Google Gemini",
    description: "Primary AI provider. Fast and free for most use cases.",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    envVar: "GEMINI_API_KEY",
    placeholder: "AIza...",
  },
  openrouter: {
    name: "OpenRouter",
    description: "Fallback provider with access to multiple models.",
    getKeyUrl: "https://openrouter.ai/keys",
    envVar: "OPENROUTER_API_KEY",
    placeholder: "sk-or-v1-...",
  },
};

// ============================================
// Key Access Functions
// ============================================

/**
 * Get API key for a provider from environment variables.
 * Keys should be set in .env.local
 */
export function getAPIKey(provider: AIProvider): string | null {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_API_KEY ?? null;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY ?? null;
    default:
      return null;
  }
}

/**
 * Check if a provider has an API key configured.
 */
export function hasAPIKey(provider: AIProvider): boolean {
  const key = getAPIKey(provider);
  return key !== null && key.length > 0;
}

/**
 * Validate API key format (basic pattern matching).
 * Note: This does NOT verify the key works, just that it looks valid.
 */
export function validateKeyFormat(provider: AIProvider, key: string): boolean {
  const pattern = KEY_PATTERNS[provider];
  if (!pattern) return false;
  return pattern.test(key.trim());
}

/**
 * Get status of all API keys.
 */
export function getAPIKeyStatus(): Record<
  AIProvider,
  { hasKey: boolean; isValid: boolean; envVar: string }
> {
  return VALID_PROVIDERS.reduce(
    (acc, provider) => {
      const key = getAPIKey(provider);
      acc[provider] = {
        hasKey: key !== null && key.length > 0,
        isValid: key !== null && validateKeyFormat(provider, key),
        envVar: PROVIDER_INFO[provider].envVar,
      };
      return acc;
    },
    {} as Record<AIProvider, { hasKey: boolean; isValid: boolean; envVar: string }>
  );
}

// ============================================
// Key Testing Functions
// ============================================

/**
 * Test if an API key works by making a minimal API call.
 * Returns true if the key is valid and the API is accessible.
 */
export async function testAPIKey(
  provider: AIProvider,
  key: string
): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!key || key.length === 0) {
    return { valid: false, error: "No key provided" };
  }

  try {
    switch (provider) {
      case "gemini":
        return await testGeminiKey(key);
      case "openrouter":
        return await testOpenRouterKey(key);
      default:
        return { valid: false, error: "Unknown provider" };
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Failed to test key",
    };
  }
}

/**
 * Test Gemini API key by listing models.
 */
async function testGeminiKey(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { method: "GET" }
    );

    if (response.ok) {
      return { valid: true };
    }

    const data = await response.json();
    return {
      valid: false,
      error: data.error?.message || `API returned ${response.status}`,
    };
  } catch {
    return {
      valid: false,
      error: "Network error - could not reach Gemini API",
    };
  }
}

/**
 * Test OpenRouter API key by checking auth.
 */
async function testOpenRouterKey(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    const data = await response.json();
    return {
      valid: false,
      error: data.error?.message || `API returned ${response.status}`,
    };
  } catch {
    return {
      valid: false,
      error: "Network error - could not reach OpenRouter API",
    };
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get the first available provider with a valid API key.
 * Useful for fallback logic.
 */
export function getFirstAvailableProvider(): AIProvider | null {
  for (const provider of VALID_PROVIDERS) {
    if (hasAPIKey(provider)) {
      return provider;
    }
  }
  return null;
}

/**
 * Check if any API key is configured.
 */
export function hasAnyAPIKey(): boolean {
  return VALID_PROVIDERS.some(hasAPIKey);
}

/**
 * Mask an API key for display (show first/last 4 chars).
 */
export function maskAPIKey(key: string): string {
  if (key.length < 12) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
