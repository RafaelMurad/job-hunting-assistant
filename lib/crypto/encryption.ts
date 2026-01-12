/**
 * Encryption Module
 *
 * Implements AES-256-GCM authenticated encryption for zero-knowledge storage.
 * All user data is encrypted client-side before transmission to server.
 *
 * Security features:
 * - Random 12-byte nonce per encryption (never reused)
 * - AES-GCM provides integrity + confidentiality
 * - Version field enables future algorithm upgrades
 *
 * @module lib/crypto/encryption
 */

import { gcm } from "@noble/ciphers/aes.js";
import { randomBytes } from "@noble/ciphers/utils.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

// ============================================
// Types
// ============================================

/**
 * Encrypted payload structure.
 * Version field enables future algorithm upgrades.
 */
export interface EncryptedPayload {
  v: 1; // Version for future-proofing
  nonce: string; // 12 bytes, hex encoded
  ciphertext: string; // Encrypted data, hex encoded
}

// ============================================
// Core Encryption Functions
// ============================================

/**
 * Encrypt a string using AES-256-GCM.
 *
 * @param plaintext - String to encrypt
 * @param masterKey - 32-byte encryption key from deriveKeys()
 * @returns Encrypted payload with version, nonce, and ciphertext
 * @throws Error if masterKey is not 32 bytes
 */
export function encrypt(plaintext: string, masterKey: Uint8Array): EncryptedPayload {
  if (masterKey.length !== 32) {
    throw new Error("masterKey must be 32 bytes");
  }

  const nonce = randomBytes(12); // 96-bit nonce for AES-GCM
  const cipher = gcm(masterKey, nonce);
  const ciphertext = cipher.encrypt(utf8ToBytes(plaintext));

  return {
    v: 1,
    nonce: bytesToHex(nonce),
    ciphertext: bytesToHex(ciphertext),
  };
}

/**
 * Decrypt an encrypted payload using AES-256-GCM.
 *
 * @param payload - Encrypted payload from encrypt()
 * @param masterKey - 32-byte encryption key (same as used for encryption)
 * @returns Original plaintext string
 * @throws Error if decryption fails (wrong key, corrupted data, tampering)
 */
export function decrypt(payload: EncryptedPayload, masterKey: Uint8Array): string {
  if (payload.v !== 1) {
    throw new Error(`Unsupported encryption version: ${payload.v}`);
  }

  if (masterKey.length !== 32) {
    throw new Error("masterKey must be 32 bytes");
  }

  const nonce = hexToBytes(payload.nonce);
  const ciphertext = hexToBytes(payload.ciphertext);

  const cipher = gcm(masterKey, nonce);
  const plaintext = cipher.decrypt(ciphertext);

  return bytesToUtf8(plaintext);
}

// ============================================
// Object Encryption Helpers
// ============================================

/**
 * Encrypt a JavaScript object as JSON.
 *
 * @param data - Object to encrypt
 * @param masterKey - 32-byte encryption key
 * @returns Encrypted payload
 */
export function encryptObject<T>(data: T, masterKey: Uint8Array): EncryptedPayload {
  return encrypt(JSON.stringify(data), masterKey);
}

/**
 * Decrypt an encrypted payload back to a JavaScript object.
 *
 * @param payload - Encrypted payload from encryptObject()
 * @param masterKey - 32-byte encryption key
 * @returns Decrypted object
 */
export function decryptObject<T>(payload: EncryptedPayload, masterKey: Uint8Array): T {
  return JSON.parse(decrypt(payload, masterKey)) as T;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Convert Uint8Array to UTF-8 string.
 * Handles multi-byte characters correctly.
 */
function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
