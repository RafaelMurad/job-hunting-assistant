/**
 * Token Manager
 *
 * Handles encryption/decryption of OAuth tokens for secure storage.
 * Uses AES-256-GCM for authenticated encryption.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { SOCIAL_CONFIG } from "./config";

// =============================================================================
// ENCRYPTION CONFIGURATION
// =============================================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

// =============================================================================
// KEY MANAGEMENT
// =============================================================================

/**
 * Get or derive encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = SOCIAL_CONFIG.encryptionKey;

  if (!key) {
    // In development, use a deterministic key (NOT for production!)
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[TokenManager] Warning: Using development encryption key. Set SOCIAL_ENCRYPTION_KEY for production."
      );
      return Buffer.alloc(KEY_LENGTH, "dev-key-do-not-use-in-production!");
    }
    throw new Error("SOCIAL_ENCRYPTION_KEY environment variable is not set");
  }

  // If key is hex-encoded (64 chars for 32 bytes)
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, "hex");
  }

  // If key is base64-encoded
  if (key.length === 44 && /^[A-Za-z0-9+/]+=*$/.test(key)) {
    const decoded = Buffer.from(key, "base64");
    if (decoded.length === KEY_LENGTH) {
      return decoded;
    }
  }

  // Use key directly if correct length, or pad/truncate
  const keyBuffer = Buffer.from(key, "utf-8");
  if (keyBuffer.length === KEY_LENGTH) {
    return keyBuffer;
  }

  // Derive a key of correct length using simple padding (use PBKDF2 in production)
  const paddedKey = Buffer.alloc(KEY_LENGTH);
  keyBuffer.copy(paddedKey, 0, 0, Math.min(keyBuffer.length, KEY_LENGTH));
  return paddedKey;
}

// =============================================================================
// ENCRYPTION FUNCTIONS
// =============================================================================

/**
 * Encrypt a string value for secure storage
 * Returns base64-encoded string: IV + AuthTag + Ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine: IV (16) + AuthTag (16) + Ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Decrypt an encrypted token
 * Expects base64-encoded string: IV + AuthTag + Ciphertext
 */
export function decryptToken(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, "base64");

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

// =============================================================================
// TOKEN VALIDATION
// =============================================================================

/**
 * Check if a string appears to be an encrypted token
 */
export function isEncryptedToken(value: string): boolean {
  try {
    const decoded = Buffer.from(value, "base64");
    // Minimum length: IV + AuthTag + at least 1 byte of ciphertext
    return decoded.length > IV_LENGTH + AUTH_TAG_LENGTH;
  } catch {
    return false;
  }
}

/**
 * Safely decrypt a token, returning null if decryption fails
 */
export function safeDecryptToken(encryptedBase64: string): string | null {
  try {
    return decryptToken(encryptedBase64);
  } catch (error) {
    console.error("[TokenManager] Failed to decrypt token:", error);
    return null;
  }
}

// =============================================================================
// TOKEN EXPIRY HELPERS
// =============================================================================

/**
 * Check if a token is expired or about to expire
 */
export function isTokenExpired(expiresAt: Date | null | undefined, bufferMs = 0): boolean {
  if (!expiresAt) {
    return false; // No expiry = never expires (like GitHub tokens)
  }
  return new Date().getTime() > expiresAt.getTime() - bufferMs;
}

/**
 * Calculate token expiry date from expires_in seconds
 */
export function calculateTokenExpiry(expiresInSeconds: number): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

// =============================================================================
// UTILITY: GENERATE ENCRYPTION KEY
// =============================================================================

/**
 * Generate a new random encryption key (for setup)
 * Run: npx ts-node -e "import { generateEncryptionKey } from './lib/social/token-manager'; console.log(generateEncryptionKey())"
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString("hex");
}
