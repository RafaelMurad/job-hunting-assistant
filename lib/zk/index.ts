/**
 * Zero-Knowledge Module - Barrel Export
 *
 * Client-side zero-knowledge authentication and storage.
 *
 * @module lib/zk
 */

// Auth context and hooks
export {
  ZkAuthProvider,
  useZkAuth,
  useZkSessionToken,
  type ZkUser,
  type ZkAuthState,
  type ZkAuthActions,
  type ZkAuthContextValue,
} from "./auth-context";

// Vault sync utilities
export {
  loadVault,
  syncVault,
  createVaultSyncManager,
  type VaultSyncResult,
  type SyncStatus,
} from "./vault-sync";

// Encrypted storage adapter
export { createEncryptedStorageAdapter } from "./encrypted-storage";
