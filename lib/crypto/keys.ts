/**
 * Key Derivation Module
 *
 * Implements Argon2id key derivation for zero-knowledge authentication.
 * Password → Argon2id → 512-bit output split into:
 *   - masterKey (first 256 bits): For AES-256-GCM encryption, NEVER leaves browser
 *   - authKey (second 256 bits): Hashed and sent to server for authentication
 *
 * @module lib/crypto/keys
 */

import { argon2id } from "@noble/hashes/argon2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

// ============================================
// Types
// ============================================

export interface DerivedKeys {
  masterKey: Uint8Array; // 32 bytes - for encryption
  authKey: Uint8Array; // 32 bytes - for authentication
  exportedMasterKey: string; // hex - for session storage
}

// ============================================
// Key Derivation
// ============================================

/**
 * Derive masterKey and authKey from password using Argon2id.
 *
 * SECURITY:
 * - masterKey never leaves the browser
 * - authKey is hashed before server transmission
 * - Salt is deterministic (email-based) to enable login without server round-trip
 *
 * Argon2id parameters tuned for ~1 second on modern devices:
 * - t=3 (iterations)
 * - m=65536 (64MB memory cost)
 * - p=4 (parallelism)
 *
 * @param password - User's password
 * @param email - User's email (used as salt component for deterministic derivation)
 */
export async function deriveKeys(password: string, email: string): Promise<DerivedKeys> {
  // Deterministic salt from email (lowercase, trimmed)
  const salt = utf8ToBytes(`careerpal:${email.toLowerCase().trim()}`);
  const passwordBytes = utf8ToBytes(password);

  // Argon2id: memory-hard, resistant to GPU/ASIC attacks
  // Note: argon2id is synchronous but CPU-intensive
  // For UI responsiveness, call from a setTimeout or Web Worker
  const derived = argon2id(passwordBytes, salt, {
    t: 3, // iterations (time cost)
    m: 65536, // 64MB memory cost
    p: 4, // parallelism
    dkLen: 64, // 512 bits output (split into two 256-bit keys)
  });

  return {
    masterKey: derived.slice(0, 32), // First 256 bits
    authKey: derived.slice(32, 64), // Second 256 bits
    exportedMasterKey: bytesToHex(derived.slice(0, 32)),
  };
}

// ============================================
// Auth Key Hashing
// ============================================

/**
 * Hash authKey before sending to server.
 * Server stores this hash, never the raw authKey.
 *
 * @param authKey - Raw authKey from deriveKeys()
 * @returns SHA-256 hash as hex string (64 characters)
 */
export function hashAuthKey(authKey: Uint8Array): string {
  return bytesToHex(sha256(authKey));
}

// ============================================
// Key Import/Export
// ============================================

/**
 * Import masterKey from hex string (for session restoration).
 *
 * @param hex - Hex-encoded masterKey from exportedMasterKey
 * @returns Uint8Array masterKey
 */
export function importMasterKey(hex: string): Uint8Array {
  return hexToBytes(hex);
}

// ============================================
// Security Utilities
// ============================================

/**
 * Securely clear sensitive data from memory.
 *
 * Note: This is best-effort in JavaScript due to GC.
 * The array contents are zeroed, but copies may exist
 * in memory until garbage collected.
 *
 * @param key - Uint8Array to clear
 */
export function clearKey(key: Uint8Array): void {
  key.fill(0);
}
