/**
 * Vault Sync Manager
 *
 * Handles syncing encrypted vault data between client and server.
 * All encryption/decryption happens client-side.
 *
 * @module lib/zk/vault-sync
 */

import {
  encryptObject,
  decryptObject,
  createEmptyVault,
  touchVault,
  type UserVault,
  type EncryptedPayload,
} from "@/lib/crypto";

// ============================================
// Types
// ============================================

export interface VaultSyncResult {
  vault: UserVault;
  source: "local" | "server" | "created";
  serverUpdatedAt?: string;
}

export interface SyncStatus {
  lastSyncAt: string | null;
  isSyncing: boolean;
  error: string | null;
}

// ============================================
// API Client
// ============================================

const API_BASE = "/api/zk";

async function fetchVault(token: string): Promise<{
  vault: {
    encryptedData: string;
    version: number;
    lastModified: string;
    serverUpdatedAt: string;
  } | null;
}> {
  const response = await fetch(`${API_BASE}/vault`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vault");
  }

  return response.json();
}

async function saveVault(
  token: string,
  encryptedData: string,
  lastModified: string
): Promise<{ success: boolean; serverUpdatedAt: string }> {
  const response = await fetch(`${API_BASE}/vault`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ encryptedData, lastModified }),
  });

  if (!response.ok) {
    throw new Error("Failed to save vault");
  }

  return response.json();
}

// ============================================
// Vault Operations
// ============================================

/**
 * Load vault from server, decrypt it, and return.
 * If no vault exists, creates an empty one.
 */
export async function loadVault(
  token: string,
  masterKey: Uint8Array,
  email: string
): Promise<VaultSyncResult> {
  const data = await fetchVault(token);

  if (!data.vault) {
    // No vault on server - create empty vault
    const vault = createEmptyVault(email);
    return { vault, source: "created" };
  }

  // Decrypt the vault
  const encryptedPayload: EncryptedPayload = JSON.parse(data.vault.encryptedData);
  const vault = decryptObject<UserVault>(encryptedPayload, masterKey);

  return {
    vault,
    source: "server",
    serverUpdatedAt: data.vault.serverUpdatedAt,
  };
}

/**
 * Encrypt and save vault to server.
 */
export async function syncVault(
  token: string,
  masterKey: Uint8Array,
  vault: UserVault
): Promise<{ serverUpdatedAt: string }> {
  // Update lastModified timestamp
  const updatedVault = touchVault(vault);

  // Encrypt the vault
  const encryptedPayload = encryptObject(updatedVault, masterKey);
  const encryptedData = JSON.stringify(encryptedPayload);

  // Save to server
  const result = await saveVault(token, encryptedData, updatedVault.lastModified);

  return { serverUpdatedAt: result.serverUpdatedAt };
}

/**
 * Create a vault sync hook state manager.
 * Returns functions to load, save, and track sync status.
 */
export function createVaultSyncManager(
  token: string,
  masterKey: Uint8Array,
  email: string
): {
  load: () => Promise<VaultSyncResult>;
  save: (vault: UserVault) => Promise<{ serverUpdatedAt: string }>;
} {
  return {
    load: () => loadVault(token, masterKey, email),
    save: (vault: UserVault) => syncVault(token, masterKey, vault),
  };
}
