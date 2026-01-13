/**
 * Zero-Knowledge Password Change
 *
 * Client-side logic for changing password:
 * 1. Derive keys from old password
 * 2. Fetch and decrypt current vault
 * 3. Derive keys from new password
 * 4. Re-encrypt vault with new masterKey
 * 5. Send new authKeyHash + encrypted vault to server
 *
 * All cryptographic operations happen client-side.
 * Server only sees the new authKeyHash and encrypted blob.
 */

import { decryptObject, encryptObject, type EncryptedPayload } from "@/lib/crypto/encryption";
import { clearKey, deriveKeys, hashAuthKey } from "@/lib/crypto/keys";
import type { UserVault } from "@/lib/crypto/vault";

// ============================================
// Types
// ============================================

export interface ChangePasswordParams {
  email: string;
  oldPassword: string;
  newPassword: string;
  sessionToken: string;
}

export interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

// ============================================
// Password Change Function
// ============================================

/**
 * Change user password with vault re-encryption.
 *
 * This function:
 * 1. Derives keys from both old and new passwords
 * 2. Fetches the encrypted vault from server
 * 3. Decrypts with old masterKey
 * 4. Re-encrypts with new masterKey
 * 5. Atomically updates authKeyHash and vault on server
 *
 * @throws Error if any step fails
 */
export async function changePassword(params: ChangePasswordParams): Promise<ChangePasswordResult> {
  const { email, oldPassword, newPassword, sessionToken } = params;

  // Validate inputs
  if (oldPassword === newPassword) {
    return { success: false, error: "New password must be different from current password" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters" };
  }

  let oldKeys: Awaited<ReturnType<typeof deriveKeys>> | null = null;
  let newKeys: Awaited<ReturnType<typeof deriveKeys>> | null = null;

  try {
    // Step 1: Derive keys from old password
    oldKeys = await deriveKeys(oldPassword, email);
    const oldAuthKeyHash = hashAuthKey(oldKeys.authKey);

    // Step 2: Derive keys from new password
    newKeys = await deriveKeys(newPassword, email);
    const newAuthKeyHash = hashAuthKey(newKeys.authKey);

    // Step 3: Fetch current vault
    const vaultResponse = await fetch("/api/zk/vault", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!vaultResponse.ok) {
      return { success: false, error: "Failed to fetch current vault" };
    }

    const vaultData = await vaultResponse.json();

    // Step 4: Decrypt vault with old masterKey
    let vault: UserVault;
    if (vaultData.vault?.encryptedData) {
      const payload = JSON.parse(vaultData.vault.encryptedData) as EncryptedPayload;
      vault = decryptObject<UserVault>(payload, oldKeys.masterKey);
    } else {
      return { success: false, error: "No vault found to migrate" };
    }

    // Step 5: Re-encrypt vault with new masterKey
    const newEncrypted = encryptObject(vault, newKeys.masterKey);

    // Step 6: Send to server
    const changeResponse = await fetch("/api/zk/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        oldAuthKeyHash,
        newAuthKeyHash,
        encryptedData: JSON.stringify(newEncrypted),
        lastModified: new Date().toISOString(),
      }),
    });

    const changeResult = await changeResponse.json();

    if (!changeResponse.ok) {
      return { success: false, error: changeResult.error || "Failed to change password" };
    }

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password change failed",
    };
  } finally {
    // Clear sensitive key material
    if (oldKeys) {
      clearKey(oldKeys.masterKey);
      clearKey(oldKeys.authKey);
    }
    if (newKeys) {
      clearKey(newKeys.masterKey);
      clearKey(newKeys.authKey);
    }
  }
}

// ============================================
// Password Validation
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
}

/**
 * Basic password strength checker.
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push("Mix uppercase and lowercase");

  if (/\d/.test(password)) score++;
  else feedback.push("Add numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Add special characters");

  const strengthLabels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const;
  const clampedScore = Math.min(score, 4);

  return {
    score: clampedScore,
    feedback:
      feedback.length > 0 ? feedback.join(". ") : (strengthLabels[clampedScore] ?? "Unknown"),
  };
}
