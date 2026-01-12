/**
 * Crypto Module - Barrel Export
 *
 * Zero-knowledge cryptography primitives for CareerPal.
 * All exports are client-side only - encryption happens in the browser.
 *
 * @module lib/crypto
 */

// ============================================
// Key Derivation
// ============================================

export { deriveKeys, hashAuthKey, importMasterKey, clearKey, type DerivedKeys } from "./keys";

// ============================================
// Encryption
// ============================================

export {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  type EncryptedPayload,
} from "./encryption";

// ============================================
// Vault Types
// ============================================

export {
  createEmptyVault,
  touchVault,
  createVaultId,
  type UserVault,
  type VaultProfile,
  type VaultExperience,
  type VaultEducation,
  type VaultApplication,
  type VaultDocument,
  type VaultSettings,
  type ApplicationStatus,
  type DocumentType,
} from "./vault";
