/**
 * Integration Tests: Zero-Knowledge API Endpoints
 *
 * Tests the ZK authentication and vault API logic with mocked Prisma.
 */

import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// ============================================
// Mock Data
// ============================================

const mockZkUser = {
  id: "zk-user-123",
  email: "test@example.com",
  authKeyHash: "a".repeat(64), // Valid 64-char hex
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockZkVault = {
  id: "vault-123",
  userId: "zk-user-123",
  encryptedData: JSON.stringify({ v: 1, nonce: "abc", ciphertext: "xyz" }),
  version: 1,
  lastModified: new Date("2024-01-01"),
  serverUpdatedAt: new Date("2024-01-01"),
};

// ============================================
// Simulated Business Logic
// ============================================

// Simulate register logic
async function registerLogic(
  prisma: typeof prismaMock,
  input: { email: string; authKeyHash: string }
): Promise<{ success: boolean; userId?: string; error?: string }> {
  // Check if user exists
  const existing = await prisma.zkUser.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    return { success: false, error: "User with this email already exists" };
  }

  // Validate authKeyHash format
  if (!/^[0-9a-f]{64}$/.test(input.authKeyHash)) {
    return { success: false, error: "Invalid authKeyHash format" };
  }

  // Create user
  const user = await prisma.zkUser.create({
    data: {
      email: input.email,
      authKeyHash: input.authKeyHash,
    },
  });

  return { success: true, userId: user.id };
}

// Simulate login logic
async function loginLogic(
  prisma: typeof prismaMock,
  input: { email: string; authKeyHash: string }
): Promise<{ success: boolean; token?: string; error?: string }> {
  const user = await prisma.zkUser.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }

  // Timing-safe comparison (simplified for test)
  if (user.authKeyHash !== input.authKeyHash) {
    return { success: false, error: "Invalid credentials" };
  }

  // Generate token
  const token = Buffer.from(`${user.id}.${Date.now()}.random`).toString("base64url");

  return { success: true, token };
}

// Simulate vault get logic
async function getVaultLogic(
  prisma: typeof prismaMock,
  userId: string
): Promise<{ vault: typeof mockZkVault | null }> {
  const vault = await prisma.zkVault.findUnique({
    where: { userId },
  });

  return { vault };
}

// Simulate vault save logic
async function saveVaultLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: { encryptedData: string; version?: number; lastModified?: string }
): Promise<{ success: boolean; serverUpdatedAt?: string }> {
  const vault = await prisma.zkVault.upsert({
    where: { userId },
    create: {
      userId,
      encryptedData: input.encryptedData,
      version: input.version ?? 1,
      lastModified: input.lastModified ? new Date(input.lastModified) : new Date(),
    },
    update: {
      encryptedData: input.encryptedData,
      lastModified: input.lastModified ? new Date(input.lastModified) : new Date(),
    },
  });

  return { success: true, serverUpdatedAt: vault.serverUpdatedAt.toISOString() };
}

// Simulate password change logic
async function changePasswordLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: { oldAuthKeyHash: string; newAuthKeyHash: string; encryptedData: string }
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.zkUser.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Verify old password
  if (user.authKeyHash !== input.oldAuthKeyHash) {
    return { success: false, error: "Invalid current password" };
  }

  // Prevent same password
  if (input.oldAuthKeyHash === input.newAuthKeyHash) {
    return { success: false, error: "New password must be different" };
  }

  // Update atomically (simulated)
  await prisma.zkUser.update({
    where: { id: userId },
    data: { authKeyHash: input.newAuthKeyHash },
  });

  await prisma.zkVault.upsert({
    where: { userId },
    create: {
      userId,
      encryptedData: input.encryptedData,
      version: 1,
      lastModified: new Date(),
    },
    update: {
      encryptedData: input.encryptedData,
      lastModified: new Date(),
    },
  });

  return { success: true };
}

// ============================================
// Tests
// ============================================

describe("ZK Register", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("registers a new user", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(null);
    prismaMock.zkUser.create.mockResolvedValue(mockZkUser);

    const result = await registerLogic(prismaMock, {
      email: "new@example.com",
      authKeyHash: "b".repeat(64),
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe(mockZkUser.id);
  });

  it("rejects duplicate email", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(mockZkUser);

    const result = await registerLogic(prismaMock, {
      email: "test@example.com",
      authKeyHash: "b".repeat(64),
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });

  it("rejects invalid authKeyHash", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(null);

    const result = await registerLogic(prismaMock, {
      email: "new@example.com",
      authKeyHash: "invalid",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid");
  });
});

describe("ZK Login", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("logs in with valid credentials", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(mockZkUser);

    const result = await loginLogic(prismaMock, {
      email: "test@example.com",
      authKeyHash: "a".repeat(64),
    });

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  it("rejects unknown email", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(null);

    const result = await loginLogic(prismaMock, {
      email: "unknown@example.com",
      authKeyHash: "a".repeat(64),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid credentials");
  });

  it("rejects wrong authKeyHash", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(mockZkUser);

    const result = await loginLogic(prismaMock, {
      email: "test@example.com",
      authKeyHash: "b".repeat(64), // Wrong hash
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid credentials");
  });
});

describe("ZK Vault", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("gets existing vault", async () => {
    prismaMock.zkVault.findUnique.mockResolvedValue(mockZkVault);

    const result = await getVaultLogic(prismaMock, "zk-user-123");

    expect(result.vault).toBeDefined();
    expect(result.vault?.encryptedData).toBe(mockZkVault.encryptedData);
  });

  it("returns null for non-existent vault", async () => {
    prismaMock.zkVault.findUnique.mockResolvedValue(null);

    const result = await getVaultLogic(prismaMock, "new-user");

    expect(result.vault).toBeNull();
  });

  it("saves vault data", async () => {
    prismaMock.zkVault.upsert.mockResolvedValue(mockZkVault);

    const result = await saveVaultLogic(prismaMock, "zk-user-123", {
      encryptedData: '{"v":1,"nonce":"new","ciphertext":"data"}',
    });

    expect(result.success).toBe(true);
    expect(result.serverUpdatedAt).toBeDefined();
  });
});

describe("ZK Password Change", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("changes password successfully", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(mockZkUser);
    prismaMock.zkUser.update.mockResolvedValue({ ...mockZkUser, authKeyHash: "b".repeat(64) });
    prismaMock.zkVault.upsert.mockResolvedValue(mockZkVault);

    const result = await changePasswordLogic(prismaMock, "zk-user-123", {
      oldAuthKeyHash: "a".repeat(64),
      newAuthKeyHash: "b".repeat(64),
      encryptedData: '{"v":1,"nonce":"new","ciphertext":"reencrypted"}',
    });

    expect(result.success).toBe(true);
  });

  it("rejects wrong old password", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(mockZkUser);

    const result = await changePasswordLogic(prismaMock, "zk-user-123", {
      oldAuthKeyHash: "wrong".padEnd(64, "0"),
      newAuthKeyHash: "b".repeat(64),
      encryptedData: "encrypted",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid current password");
  });

  it("rejects same password", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(mockZkUser);

    const result = await changePasswordLogic(prismaMock, "zk-user-123", {
      oldAuthKeyHash: "a".repeat(64),
      newAuthKeyHash: "a".repeat(64), // Same as old
      encryptedData: "encrypted",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("must be different");
  });

  it("rejects for unknown user", async () => {
    prismaMock.zkUser.findUnique.mockResolvedValue(null);

    const result = await changePasswordLogic(prismaMock, "unknown", {
      oldAuthKeyHash: "a".repeat(64),
      newAuthKeyHash: "b".repeat(64),
      encryptedData: "encrypted",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("User not found");
  });
});
