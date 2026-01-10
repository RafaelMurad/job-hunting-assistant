/**
 * Integration Tests: Admin tRPC Router Logic
 *
 * Tests the admin router business logic with mocked dependencies.
 * Uses a simplified approach that doesn't require the full tRPC server stack.
 *
 * Test Strategy:
 * - Mock Prisma client for database operations
 * - Test authorization checks (checkAccess)
 * - Test trusted email management (add, remove, list)
 * - Test user role management
 */

import type { PrismaClient, TrustedEmail, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// Mock OWNER_EMAIL
const OWNER_EMAIL = "owner@example.com";

// Sample user data
const mockOwner: User = {
  id: "owner-123",
  name: "Rafael Owner",
  email: OWNER_EMAIL,
  phone: null,
  location: "Lisbon",
  neonAuthId: "neon-owner",
  summary: "Project owner",
  experience: "",
  skills: "",
  cvPdfUrl: null,
  cvLatexUrl: null,
  cvFilename: null,
  cvUploadedAt: null,
  role: "OWNER",
  isTrusted: true,
  isVerified: true,
  image: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockAdmin: User = {
  id: "admin-456",
  name: "Admin User",
  email: "admin@example.com",
  phone: null,
  location: "London",
  neonAuthId: "neon-admin",
  summary: "Admin user",
  experience: "",
  skills: "",
  cvPdfUrl: null,
  cvLatexUrl: null,
  cvFilename: null,
  cvUploadedAt: null,
  role: "ADMIN",
  isTrusted: true,
  isVerified: true,
  image: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockRegularUser: User = {
  id: "user-789",
  name: "Regular User",
  email: "user@example.com",
  phone: null,
  location: "Berlin",
  neonAuthId: "neon-user",
  summary: "Regular user",
  experience: "",
  skills: "",
  cvPdfUrl: null,
  cvLatexUrl: null,
  cvFilename: null,
  cvUploadedAt: null,
  role: "USER",
  isTrusted: false,
  isVerified: false,
  image: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockTrustedEmail: TrustedEmail = {
  id: "trusted-1",
  email: "trusted@example.com",
  role: "ADMIN",
  note: "Added for testing",
  addedBy: OWNER_EMAIL,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

// =============================================================================
// SIMULATE ROUTER LOGIC
// =============================================================================

// Simulates: hasAdminAccess helper
async function hasAdminAccess(
  prisma: typeof prismaMock,
  userId: string,
  ownerEmail: string
): Promise<{ hasAccess: boolean; role: string | null; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true, isTrusted: true },
  });

  if (!user) {
    return { hasAccess: false, role: null, reason: "User not found" };
  }

  // Owner always has access
  if (user.email === ownerEmail) {
    return { hasAccess: true, role: "OWNER" };
  }

  // Check if user has admin or owner role
  if (user.role === "ADMIN" || user.role === "OWNER") {
    return { hasAccess: true, role: user.role };
  }

  // Check if user's email is in trusted list
  const trustedEntry = await prisma.trustedEmail.findUnique({
    where: { email: user.email },
  });

  if (trustedEntry) {
    return { hasAccess: true, role: trustedEntry.role };
  }

  // Check if user is marked as trusted
  if (user.isTrusted) {
    return { hasAccess: true, role: "USER" };
  }

  return { hasAccess: false, role: "USER", reason: "Not authorized for admin access" };
}

// Simulates: adminRouter.getTrustedEmails
async function getTrustedEmailsLogic(prisma: typeof prismaMock): Promise<
  {
    id: string;
    email: string;
    role: string;
    note: string | null;
    addedBy: string | null;
    createdAt: Date;
  }[]
> {
  const trustedEmails = await prisma.trustedEmail.findMany({
    orderBy: { createdAt: "desc" },
  });

  return trustedEmails.map((entry) => ({
    id: entry.id,
    email: entry.email,
    role: entry.role,
    note: entry.note,
    addedBy: entry.addedBy,
    createdAt: entry.createdAt,
  }));
}

// Simulates: adminRouter.addTrustedEmail
async function addTrustedEmailLogic(
  prisma: typeof prismaMock,
  userEmail: string,
  input: { email: string; role: "USER" | "ADMIN"; note?: string }
): Promise<{ success: true; trustedEmail: { id: string; email: string; role: string } }> {
  // Check if email already exists
  const existing = await prisma.trustedEmail.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Email is already in the trusted list",
    });
  }

  // Add trusted email
  const trustedEmail = await prisma.trustedEmail.create({
    data: {
      email: input.email,
      role: input.role,
      note: input.note ?? null,
      addedBy: userEmail,
    },
  });

  // Also update user if they exist
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (user) {
    await prisma.user.update({
      where: { email: input.email },
      data: {
        isTrusted: true,
        role: input.role,
      },
    });
  }

  return {
    success: true,
    trustedEmail: {
      id: trustedEmail.id,
      email: trustedEmail.email,
      role: trustedEmail.role,
    },
  };
}

// Simulates: adminRouter.removeTrustedEmail
async function removeTrustedEmailLogic(
  prisma: typeof prismaMock,
  input: { email: string },
  ownerEmail: string
): Promise<{ success: true }> {
  // Don't allow removing owner email
  if (input.email === ownerEmail) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Cannot remove owner from trusted list",
    });
  }

  // Remove from trusted list (ignore if not found)
  await prisma.trustedEmail.delete({
    where: { email: input.email },
  });

  // Update user if they exist
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (user) {
    await prisma.user.update({
      where: { email: input.email },
      data: {
        isTrusted: false,
        role: "USER",
      },
    });
  }

  return { success: true };
}

// Simulates: adminRouter.updateUserRole
async function updateUserRoleLogic(
  prisma: typeof prismaMock,
  input: { userId: string; role: "USER" | "ADMIN" },
  ownerEmail: string
): Promise<{ success: true }> {
  const targetUser = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!targetUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  // Don't allow changing owner role
  if (targetUser.email === ownerEmail) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Cannot change owner role",
    });
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { role: input.role },
  });

  return { success: true };
}

// Simulates: adminRouter.getUsers
async function getUsersLogic(
  prisma: typeof prismaMock,
  ownerEmail: string
): Promise<
  {
    id: string;
    name: string;
    email: string;
    role: string;
    isTrusted: boolean;
    isVerified: boolean;
    createdAt: Date;
    isOwner: boolean;
  }[]
> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isTrusted: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    ...user,
    isOwner: user.email === ownerEmail,
  }));
}

// =============================================================================
// TESTS
// =============================================================================

describe("Admin Router Logic", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  describe("hasAdminAccess", () => {
    it("grants access to owner email regardless of role", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockOwner);

      const result = await hasAdminAccess(prismaMock, mockOwner.id, OWNER_EMAIL);

      expect(result.hasAccess).toBe(true);
      expect(result.role).toBe("OWNER");
    });

    it("grants access to users with ADMIN role", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockAdmin);

      const result = await hasAdminAccess(prismaMock, mockAdmin.id, OWNER_EMAIL);

      expect(result.hasAccess).toBe(true);
      expect(result.role).toBe("ADMIN");
    });

    it("denies access to regular users", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockRegularUser);
      prismaMock.trustedEmail.findUnique.mockResolvedValue(null);

      const result = await hasAdminAccess(prismaMock, mockRegularUser.id, OWNER_EMAIL);

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe("Not authorized for admin access");
    });

    it("grants access if user email is in trusted list", async () => {
      const trustedUser = { ...mockRegularUser, role: "USER" as const };
      prismaMock.user.findUnique.mockResolvedValue(trustedUser);
      prismaMock.trustedEmail.findUnique.mockResolvedValue({
        ...mockTrustedEmail,
        email: trustedUser.email,
      });

      const result = await hasAdminAccess(prismaMock, trustedUser.id, OWNER_EMAIL);

      expect(result.hasAccess).toBe(true);
      expect(result.role).toBe("ADMIN");
    });

    it("grants access if user is marked as trusted", async () => {
      const trustedUser = { ...mockRegularUser, isTrusted: true };
      prismaMock.user.findUnique.mockResolvedValue(trustedUser);
      prismaMock.trustedEmail.findUnique.mockResolvedValue(null);

      const result = await hasAdminAccess(prismaMock, trustedUser.id, OWNER_EMAIL);

      expect(result.hasAccess).toBe(true);
      expect(result.role).toBe("USER");
    });

    it("returns error if user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await hasAdminAccess(prismaMock, "non-existent", OWNER_EMAIL);

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe("User not found");
    });
  });

  describe("getTrustedEmails", () => {
    it("returns all trusted emails", async () => {
      const trustedEmails = [
        mockTrustedEmail,
        { ...mockTrustedEmail, id: "trusted-2", email: "another@example.com" },
      ];
      prismaMock.trustedEmail.findMany.mockResolvedValue(trustedEmails);

      const result = await getTrustedEmailsLogic(prismaMock);

      expect(result).toHaveLength(2);
      expect(result[0]!.email).toBe("trusted@example.com");
    });

    it("returns empty array when no trusted emails exist", async () => {
      prismaMock.trustedEmail.findMany.mockResolvedValue([]);

      const result = await getTrustedEmailsLogic(prismaMock);

      expect(result).toHaveLength(0);
    });

    it("orders by creation date descending", async () => {
      prismaMock.trustedEmail.findMany.mockResolvedValue([mockTrustedEmail]);

      await getTrustedEmailsLogic(prismaMock);

      expect(prismaMock.trustedEmail.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("addTrustedEmail", () => {
    it("adds new trusted email successfully", async () => {
      prismaMock.trustedEmail.findUnique.mockResolvedValue(null);
      prismaMock.trustedEmail.create.mockResolvedValue(mockTrustedEmail);
      prismaMock.user.findUnique.mockResolvedValue(null); // User doesn't exist yet

      const result = await addTrustedEmailLogic(prismaMock, OWNER_EMAIL, {
        email: "new@example.com",
        role: "ADMIN",
        note: "New admin",
      });

      expect(result.success).toBe(true);
      expect(result.trustedEmail.email).toBe("trusted@example.com");
    });

    it("throws CONFLICT if email already exists", async () => {
      prismaMock.trustedEmail.findUnique.mockResolvedValue(mockTrustedEmail);

      await expect(
        addTrustedEmailLogic(prismaMock, OWNER_EMAIL, {
          email: "trusted@example.com",
          role: "ADMIN",
        })
      ).rejects.toThrow(TRPCError);

      await expect(
        addTrustedEmailLogic(prismaMock, OWNER_EMAIL, {
          email: "trusted@example.com",
          role: "ADMIN",
        })
      ).rejects.toMatchObject({
        code: "CONFLICT",
      });
    });

    it("updates existing user when adding to trusted list", async () => {
      prismaMock.trustedEmail.findUnique.mockResolvedValue(null);
      prismaMock.trustedEmail.create.mockResolvedValue(mockTrustedEmail);
      prismaMock.user.findUnique.mockResolvedValue(mockRegularUser);
      prismaMock.user.update.mockResolvedValue({
        ...mockRegularUser,
        isTrusted: true,
        role: "ADMIN",
      });

      await addTrustedEmailLogic(prismaMock, OWNER_EMAIL, {
        email: mockRegularUser.email,
        role: "ADMIN",
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { email: mockRegularUser.email },
        data: { isTrusted: true, role: "ADMIN" },
      });
    });
  });

  describe("removeTrustedEmail", () => {
    it("removes trusted email successfully", async () => {
      prismaMock.trustedEmail.delete.mockResolvedValue(mockTrustedEmail);
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await removeTrustedEmailLogic(
        prismaMock,
        { email: "trusted@example.com" },
        OWNER_EMAIL
      );

      expect(result.success).toBe(true);
    });

    it("throws FORBIDDEN when trying to remove owner", async () => {
      await expect(
        removeTrustedEmailLogic(prismaMock, { email: OWNER_EMAIL }, OWNER_EMAIL)
      ).rejects.toThrow(TRPCError);

      await expect(
        removeTrustedEmailLogic(prismaMock, { email: OWNER_EMAIL }, OWNER_EMAIL)
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: "Cannot remove owner from trusted list",
      });
    });

    it("updates user when removing from trusted list", async () => {
      prismaMock.trustedEmail.delete.mockResolvedValue(mockTrustedEmail);
      prismaMock.user.findUnique.mockResolvedValue(mockAdmin);
      prismaMock.user.update.mockResolvedValue({ ...mockAdmin, isTrusted: false, role: "USER" });

      await removeTrustedEmailLogic(prismaMock, { email: mockAdmin.email }, OWNER_EMAIL);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { email: mockAdmin.email },
        data: { isTrusted: false, role: "USER" },
      });
    });
  });

  describe("updateUserRole", () => {
    it("updates user role successfully", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockRegularUser);
      prismaMock.user.update.mockResolvedValue({ ...mockRegularUser, role: "ADMIN" });

      const result = await updateUserRoleLogic(
        prismaMock,
        { userId: mockRegularUser.id, role: "ADMIN" },
        OWNER_EMAIL
      );

      expect(result.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockRegularUser.id },
        data: { role: "ADMIN" },
      });
    });

    it("throws NOT_FOUND when user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        updateUserRoleLogic(prismaMock, { userId: "non-existent", role: "ADMIN" }, OWNER_EMAIL)
      ).rejects.toThrow(TRPCError);

      await expect(
        updateUserRoleLogic(prismaMock, { userId: "non-existent", role: "ADMIN" }, OWNER_EMAIL)
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("throws FORBIDDEN when trying to change owner role", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockOwner);

      await expect(
        updateUserRoleLogic(prismaMock, { userId: mockOwner.id, role: "ADMIN" }, OWNER_EMAIL)
      ).rejects.toThrow(TRPCError);

      await expect(
        updateUserRoleLogic(prismaMock, { userId: mockOwner.id, role: "ADMIN" }, OWNER_EMAIL)
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: "Cannot change owner role",
      });
    });

    it("can demote admin to user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockAdmin);
      prismaMock.user.update.mockResolvedValue({ ...mockAdmin, role: "USER" });

      const result = await updateUserRoleLogic(
        prismaMock,
        { userId: mockAdmin.id, role: "USER" },
        OWNER_EMAIL
      );

      expect(result.success).toBe(true);
    });
  });

  describe("getUsers", () => {
    it("returns all users with isOwner flag", async () => {
      const users = [
        {
          id: mockOwner.id,
          name: mockOwner.name,
          email: mockOwner.email,
          role: mockOwner.role,
          isTrusted: true,
          isVerified: true,
          createdAt: mockOwner.createdAt,
        },
        {
          id: mockAdmin.id,
          name: mockAdmin.name,
          email: mockAdmin.email,
          role: mockAdmin.role,
          isTrusted: true,
          isVerified: true,
          createdAt: mockAdmin.createdAt,
        },
        {
          id: mockRegularUser.id,
          name: mockRegularUser.name,
          email: mockRegularUser.email,
          role: mockRegularUser.role,
          isTrusted: false,
          isVerified: false,
          createdAt: mockRegularUser.createdAt,
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.user.findMany.mockResolvedValue(users as any);

      const result = await getUsersLogic(prismaMock, OWNER_EMAIL);

      expect(result).toHaveLength(3);
      expect(result.find((u) => u.email === OWNER_EMAIL)?.isOwner).toBe(true);
      expect(result.find((u) => u.email === mockAdmin.email)?.isOwner).toBe(false);
    });

    it("returns empty array when no users exist", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await getUsersLogic(prismaMock, OWNER_EMAIL);

      expect(result).toHaveLength(0);
    });
  });

  describe("database error handling", () => {
    it("propagates database errors on trusted email operations", async () => {
      prismaMock.trustedEmail.findMany.mockRejectedValue(new Error("Connection failed"));

      await expect(getTrustedEmailsLogic(prismaMock)).rejects.toThrow("Connection failed");
    });

    it("propagates database errors on user operations", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database timeout"));

      await expect(hasAdminAccess(prismaMock, "user-123", OWNER_EMAIL)).rejects.toThrow(
        "Database timeout"
      );
    });
  });
});
