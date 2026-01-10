/**
 * Integration Tests: Applications tRPC Router Logic
 *
 * Tests the applications router business logic with mocked dependencies.
 * Uses a simplified approach that doesn't require the full tRPC server stack.
 *
 * Test Strategy:
 * - Mock Prisma client for database operations
 * - Test CRUD operations (list, create, update, delete)
 * - Verify ownership checks on update/delete
 */

import type { Application, PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// Sample user context for tests
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
};

// Sample application data
const mockApplication: Application = {
  id: "app-456",
  userId: "user-123",
  company: "Acme Corp",
  role: "Senior Engineer",
  jobDescription: "Build great software",
  jobUrl: "https://acme.com/jobs/123",
  matchScore: 85,
  analysis: "Great match for your skills",
  coverLetter: "Dear Hiring Manager...",
  status: "saved",
  notes: null,
  appliedAt: null,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

// =============================================================================
// SIMULATE ROUTER LOGIC
// =============================================================================

// Simulates: applicationsRouter.list
async function listApplicationsLogic(
  prisma: typeof prismaMock,
  userId: string
): Promise<Application[]> {
  return prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// Simulates: applicationsRouter.create
async function createApplicationLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: {
    company: string;
    role: string;
    jobDescription: string;
    jobUrl?: string | null;
    matchScore?: number;
    analysis?: string;
    coverLetter?: string;
    status?: "saved" | "applied" | "interviewing" | "offer" | "rejected";
  }
): Promise<Application> {
  return prisma.application.create({
    data: {
      userId,
      company: input.company,
      role: input.role,
      jobDescription: input.jobDescription,
      jobUrl: input.jobUrl ?? null,
      matchScore: input.matchScore ?? 0,
      analysis: input.analysis ?? "",
      coverLetter: input.coverLetter ?? "",
      status: input.status ?? "saved",
      ...(input.status === "applied" && { appliedAt: new Date() }),
    },
  });
}

// Simulates: applicationsRouter.update
async function updateApplicationLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: {
    id: string;
    status?: "saved" | "applied" | "interviewing" | "offer" | "rejected";
    notes?: string;
  }
): Promise<Application> {
  const { id, status, notes } = input;

  // Verify ownership
  const application = await prisma.application.findFirst({
    where: { id, userId },
  });

  if (!application) {
    throw new Error("Application not found or access denied");
  }

  return prisma.application.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(status === "applied" && { appliedAt: new Date() }),
    },
  });
}

// Simulates: applicationsRouter.delete
async function deleteApplicationLogic(
  prisma: typeof prismaMock,
  userId: string,
  applicationId: string
): Promise<{ success: boolean }> {
  // Verify ownership
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });

  if (!application) {
    throw new Error("Application not found or access denied");
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });

  return { success: true };
}

// =============================================================================
// TESTS
// =============================================================================

describe("Applications Router Logic", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("returns all applications for the user", async () => {
      const applications = [
        mockApplication,
        { ...mockApplication, id: "app-789", company: "TechCo" },
      ];
      prismaMock.application.findMany.mockResolvedValue(applications);

      const result = await listApplicationsLogic(prismaMock, mockUser.id);

      expect(result).toHaveLength(2);
      expect(result[0]!.company).toBe("Acme Corp");
      expect(prismaMock.application.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns empty array when user has no applications", async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      const result = await listApplicationsLogic(prismaMock, mockUser.id);

      expect(result).toHaveLength(0);
    });

    it("only returns applications for the specific user", async () => {
      prismaMock.application.findMany.mockResolvedValue([mockApplication]);

      await listApplicationsLogic(prismaMock, mockUser.id);

      expect(prismaMock.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        })
      );
    });
  });

  describe("create", () => {
    const validInput = {
      company: "New Corp",
      role: "Software Engineer",
      jobDescription: "Write code",
    };

    it("creates a new application with required fields", async () => {
      const newApp = {
        ...mockApplication,
        ...validInput,
        id: "new-app-123",
        matchScore: 0,
        analysis: "",
        coverLetter: "",
        status: "saved" as const,
      };
      prismaMock.application.create.mockResolvedValue(newApp);

      const result = await createApplicationLogic(prismaMock, mockUser.id, validInput);

      expect(result.company).toBe("New Corp");
      expect(prismaMock.application.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          company: "New Corp",
          role: "Software Engineer",
          jobDescription: "Write code",
          jobUrl: null,
          matchScore: 0,
          analysis: "",
          coverLetter: "",
          status: "saved",
        },
      });
    });

    it("creates application with optional fields", async () => {
      const inputWithOptionals = {
        ...validInput,
        jobUrl: "https://example.com/job",
        matchScore: 90,
        analysis: "Great fit!",
        coverLetter: "Dear Team...",
        status: "saved" as const,
      };
      const newApp = { ...mockApplication, ...inputWithOptionals };
      prismaMock.application.create.mockResolvedValue(newApp);

      await createApplicationLogic(prismaMock, mockUser.id, inputWithOptionals);

      expect(prismaMock.application.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobUrl: "https://example.com/job",
          matchScore: 90,
          analysis: "Great fit!",
          coverLetter: "Dear Team...",
        }),
      });
    });

    it("sets appliedAt when status is 'applied'", async () => {
      const inputWithApplied = {
        ...validInput,
        status: "applied" as const,
      };
      const newApp = {
        ...mockApplication,
        ...inputWithApplied,
        appliedAt: new Date(),
      };
      prismaMock.application.create.mockResolvedValue(newApp);

      await createApplicationLogic(prismaMock, mockUser.id, inputWithApplied);

      expect(prismaMock.application.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "applied",
          appliedAt: expect.any(Date),
        }),
      });
    });
  });

  describe("update", () => {
    it("updates status for owned application", async () => {
      const updatedApp = { ...mockApplication, status: "interviewing" as const };
      prismaMock.application.findFirst.mockResolvedValue(mockApplication);
      prismaMock.application.update.mockResolvedValue(updatedApp);

      const result = await updateApplicationLogic(prismaMock, mockUser.id, {
        id: mockApplication.id,
        status: "interviewing",
      });

      expect(result.status).toBe("interviewing");
      expect(prismaMock.application.update).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
        data: { status: "interviewing" },
      });
    });

    it("updates notes for owned application", async () => {
      const updatedApp = { ...mockApplication, notes: "Had initial call" };
      prismaMock.application.findFirst.mockResolvedValue(mockApplication);
      prismaMock.application.update.mockResolvedValue(updatedApp);

      const result = await updateApplicationLogic(prismaMock, mockUser.id, {
        id: mockApplication.id,
        notes: "Had initial call",
      });

      expect(result.notes).toBe("Had initial call");
    });

    it("sets appliedAt when updating status to 'applied'", async () => {
      const updatedApp = { ...mockApplication, status: "applied" as const, appliedAt: new Date() };
      prismaMock.application.findFirst.mockResolvedValue(mockApplication);
      prismaMock.application.update.mockResolvedValue(updatedApp);

      await updateApplicationLogic(prismaMock, mockUser.id, {
        id: mockApplication.id,
        status: "applied",
      });

      expect(prismaMock.application.update).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
        data: expect.objectContaining({
          appliedAt: expect.any(Date),
        }),
      });
    });

    it("throws error when application not found", async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await expect(
        updateApplicationLogic(prismaMock, mockUser.id, {
          id: "non-existent",
          status: "applied",
        })
      ).rejects.toThrow("Application not found or access denied");
    });

    it("throws error when user does not own application", async () => {
      prismaMock.application.findFirst.mockResolvedValue(null); // Ownership check fails

      await expect(
        updateApplicationLogic(prismaMock, "other-user-id", {
          id: mockApplication.id,
          status: "applied",
        })
      ).rejects.toThrow("Application not found or access denied");
    });
  });

  describe("delete", () => {
    it("deletes owned application", async () => {
      prismaMock.application.findFirst.mockResolvedValue(mockApplication);
      prismaMock.application.delete.mockResolvedValue(mockApplication);

      const result = await deleteApplicationLogic(prismaMock, mockUser.id, mockApplication.id);

      expect(result.success).toBe(true);
      expect(prismaMock.application.delete).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
      });
    });

    it("throws error when application not found", async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await expect(deleteApplicationLogic(prismaMock, mockUser.id, "non-existent")).rejects.toThrow(
        "Application not found or access denied"
      );
    });

    it("throws error when user does not own application", async () => {
      prismaMock.application.findFirst.mockResolvedValue(null); // Ownership check fails

      await expect(
        deleteApplicationLogic(prismaMock, "other-user-id", mockApplication.id)
      ).rejects.toThrow("Application not found or access denied");
    });

    it("verifies ownership before deletion", async () => {
      prismaMock.application.findFirst.mockResolvedValue(mockApplication);
      prismaMock.application.delete.mockResolvedValue(mockApplication);

      await deleteApplicationLogic(prismaMock, mockUser.id, mockApplication.id);

      expect(prismaMock.application.findFirst).toHaveBeenCalledWith({
        where: { id: mockApplication.id, userId: mockUser.id },
      });
    });
  });

  describe("database error handling", () => {
    it("propagates database errors on list", async () => {
      prismaMock.application.findMany.mockRejectedValue(new Error("Connection lost"));

      await expect(listApplicationsLogic(prismaMock, mockUser.id)).rejects.toThrow(
        "Connection lost"
      );
    });

    it("propagates database errors on create", async () => {
      prismaMock.application.create.mockRejectedValue(new Error("Unique constraint violation"));

      await expect(
        createApplicationLogic(prismaMock, mockUser.id, {
          company: "Test",
          role: "Dev",
          jobDescription: "Code",
        })
      ).rejects.toThrow("Unique constraint violation");
    });
  });
});
