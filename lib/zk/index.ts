/**
 * Zero-Knowledge Module - Barrel Export
 *
 * Client-side zero-knowledge authentication and storage.
 *
 * @module lib/zk
 */

// Auth context and hooks
export {
  useZkAuth,
  useZkSessionToken,
  ZkAuthProvider,
  type ZkAuthActions,
  type ZkAuthContextValue,
  type ZkAuthState,
  type ZkUser,
} from "./auth-context";

// Vault sync utilities
export {
  createVaultSyncManager,
  loadVault,
  syncVault,
  type SyncStatus,
  type VaultSyncResult,
} from "./vault-sync";

// Encrypted storage adapter
export { createEncryptedStorageAdapter } from "./encrypted-storage";

// Password change
export {
  changePassword,
  checkPasswordStrength,
  type ChangePasswordParams,
  type ChangePasswordResult,
  type PasswordStrength,
} from "./password-change";

// Error handling and offline support
export {
  clearAllPendingOperations,
  clearPendingOperation,
  createOfflineManager,
  getErrorMessage,
  getPendingOperations,
  isOnline,
  queueOfflineOperation,
  safeFetch,
  withRetry,
  ZkError,
  ZkErrorCode,
  type OfflineState,
  type RetryOptions,
  type SafeFetchOptions,
} from "./error-handling";
