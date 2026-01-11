/**
 * API Key Manager (BYOK - Bring Your Own Key)
 *
 * Manages user-provided API keys for local mode.
 * Keys are stored in localStorage and used for client-side AI calls.
 *
 * SECURITY NOTE: Browser-stored keys are visible in DevTools.
 * This is acceptable for local mode because:
 * 1. It's the user's own key
 * 2. Only they access their browser
 * 3. We clearly document this tradeoff
 *
 * @module lib/ai/key-manager
 */

import { isLocalMode } from "@/lib/storage/interface";
import type { AIProvider } from "./types";

// ============================================
// Constants
// ============================================

const STORAGE_PREFIX = "careerpal_api_key_";
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
    placeholder: string;
  }
> = {
  gemini: {
    name: "Google Gemini",
    description: "Primary AI provider. Fast and free for most use cases.",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIza...",
  },
  openrouter: {
    name: "OpenRouter",
    description: "Fallback provider with access to multiple models.",
    getKeyUrl: "https://openrouter.ai/keys",
    placeholder: "sk-or-v1-...",
  },
};

// ============================================
// Key Storage Functions
// ============================================

/**
 * Get stored API key for a provider.
 * Returns null if not in local mode or key not set.
 */
export function getAPIKey(provider: AIProvider): string | null {
  if (typeof window === "undefined") {
    // Server-side: use environment variables
    return getServerAPIKey(provider);
  }

  if (!isLocalMode()) {
    // Demo mode: keys come from server
    return null;
  }

  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
  } catch {
    // localStorage not available (private browsing, etc.)
    return null;
  }
}

/**
 * Get API key from server environment variables.
 * Used in demo mode or server-side rendering.
 */
function getServerAPIKey(provider: AIProvider): string | null {
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
 * Store an API key for a provider.
 * Only works in local mode and browser environment.
 */
export function setAPIKey(provider: AIProvider, key: string): void {
  if (typeof window === "undefined") {
    throw new Error("Cannot store API keys on the server");
  }

  if (!isLocalMode()) {
    throw new Error("API keys can only be stored in local mode");
  }

  if (!VALID_PROVIDERS.includes(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  try {
    if (key.trim() === "") {
      localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
    } else {
      localStorage.setItem(`${STORAGE_PREFIX}${provider}`, key.trim());
    }
  } catch {
    throw new Error("Failed to store API key. localStorage may not be available.");
  }
}

/**
 * Remove a stored API key.
 */
export function removeAPIKey(provider: AIProvider): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
  } catch {
    // Ignore errors
  }
}

/**
 * Remove all stored API keys.
 */
export function clearAllAPIKeys(): void {
  if (typeof window === "undefined") return;

  for (const provider of VALID_PROVIDERS) {
    removeAPIKey(provider);
  }
}

// ============================================
// Key Validation Functions
// ============================================

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
 * Check if a provider has a valid API key configured.
 */
export function hasAPIKey(provider: AIProvider): boolean {
  const key = getAPIKey(provider);
  return key !== null && key.length > 0;
}

/**
 * Get status of all API keys.
 */
export function getAPIKeyStatus(): Record<AIProvider, { hasKey: boolean; isValid: boolean }> {
  return VALID_PROVIDERS.reduce(
    (acc, provider) => {
      const key = getAPIKey(provider);
      acc[provider] = {
        hasKey: key !== null && key.length > 0,
        isValid: key !== null && validateKeyFormat(provider, key),
      };
      return acc;
    },
    {} as Record<AIProvider, { hasKey: boolean; isValid: boolean }>
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
  if (!validateKeyFormat(provider, key)) {
    return { valid: false, error: "Invalid key format" };
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
