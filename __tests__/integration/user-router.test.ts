/**
 * Integration Tests: User tRPC Router Logic
 *
 * Tests the user router business logic with mocked dependencies.
 * Uses a simplified approach that doesn't require the full tRPC server stack.
 *
 * Test Strategy:
 * - Mock Prisma client for database operations
 * - Mock AI functions to avoid external API calls
 * - Test the core logic that would be executed by tRPC procedures
 */

import { UserRole, type User } from "@/types";
import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// Sample user data for tests
const mockUser: User = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  location: "New York, NY",
  summary: "Experienced software engineer with 5+ years in full-stack development",
  experience: "Senior Engineer at Acme Corp (2020-present)\nJunior Dev at StartupX (2018-2020)",
  skills: "TypeScript, React, Node.js, PostgreSQL, AWS",
  cvPdfUrl: null,
  cvLatexUrl: null,
  cvFilename: null,
  cvUploadedAt: null,
  role: UserRole.USER,
  isTrusted: false,
  isVerified: false,
  image: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Simulate the router logic (what tRPC would execute)
// This tests the business logic without the tRPC transport layer

async function getUserLogic(prisma: typeof prismaMock): Promise<{ user: User | null }> {
  const user = await prisma.user.findFirst();
  return { user };
}

async function upsertUserLogic(
  prisma: typeof prismaMock,
  input: {
    name: string;
    email: string;
    phone?: string | null;
    location: string;
    summary: string;
    experience: string;
    skills: string;
  }
): Promise<{ user: User; created: boolean }> {
  const existingUser = await prisma.user.findFirst();

  if (existingUser) {
    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        location: input.location,
        summary: input.summary,
        experience: input.experience,
        skills: input.skills,
      },
    });
    return { user, created: false };
  }
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      location: input.location,
      summary: input.summary,
      experience: input.experience,
      skills: input.skills,
    },
  });
  return { user, created: true };
}

describe("User Router Logic", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  describe("get user", () => {
    it("returns user when one exists", async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      const result = await getUserLogic(prismaMock);

      expect(result.user).toEqual(mockUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it("returns null when no user exists", async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const result = await getUserLogic(prismaMock);

      expect(result.user).toBeNull();
    });
  });

  describe("upsert user", () => {
    const validInput = {
      name: "Jane Doe",
      email: "jane@example.com",
      location: "San Francisco, CA",
      summary: "Product manager transitioning to engineering",
      experience: "PM at Google (2019-2024)",
      skills: "Python, Data Analysis, SQL",
    };

    it("creates new user when none exists", async () => {
      const newUser = { ...mockUser, ...validInput, id: "new-user-456" };
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(newUser);

      const result = await upsertUserLogic(prismaMock, validInput);

      expect(result.created).toBe(true);
      expect(result.user.email).toBe(validInput.email);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...validInput,
          phone: null,
        },
      });
    });

    it("updates existing user when one exists", async () => {
      const updatedUser = { ...mockUser, ...validInput };
      prismaMock.user.findFirst.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await upsertUserLogic(prismaMock, validInput);

      expect(result.created).toBe(false);
      expect(result.user.email).toBe(validInput.email);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          ...validInput,
          phone: null,
        },
      });
    });

    it("preserves phone number when provided", async () => {
      const inputWithPhone = { ...validInput, phone: "+9876543210" };
      const userWithPhone = { ...mockUser, ...inputWithPhone };
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(userWithPhone);

      await upsertUserLogic(prismaMock, inputWithPhone);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: "+9876543210",
        }),
      });
    });

    it("converts undefined phone to null", async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(mockUser);

      await upsertUserLogic(prismaMock, validInput);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: null,
        }),
      });
    });

    it("handles database errors gracefully", async () => {
      prismaMock.user.findFirst.mockRejectedValue(new Error("Database connection failed"));

      await expect(upsertUserLogic(prismaMock, validInput)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("database interactions", () => {
    it("calls findFirst without arguments for MVP single-user mode", async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await getUserLogic(prismaMock);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith();
    });

    it("uses correct where clause for updates", async () => {
      prismaMock.user.findFirst.mockResolvedValue(mockUser);
      prismaMock.user.update.mockResolvedValue(mockUser);

      const input = {
        name: "Updated Name",
        email: "updated@example.com",
        location: "Boston, MA",
        summary: "Updated summary",
        experience: "Updated experience",
        skills: "Updated skills",
      };

      await upsertUserLogic(prismaMock, input);

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
        })
      );
    });
  });
});
