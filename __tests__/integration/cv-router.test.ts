/**
 * Integration Tests: CV tRPC Router Logic
 *
 * Tests the CV router business logic with mocked dependencies.
 * Uses a simplified approach that doesn't require the full tRPC server stack.
 *
 * Test Strategy:
 * - Mock Prisma client for database operations
 * - Test the core logic that would be executed by tRPC procedures
 * - Verify business rules (max 5 CVs, active CV logic, ownership)
 */

import type { CV, PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// Sample CV data for tests
const mockUserId = "user-123";
const mockCV: CV = {
  id: "cv-1",
  userId: mockUserId,
  name: "Software Engineer CV",
  pdfUrl: "https://example.com/cv.pdf",
  latexUrl: null,
  latexContent: "\\documentclass{article}...",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockCVInactive: CV = {
  id: "cv-2",
  userId: mockUserId,
  name: "Data Scientist CV",
  pdfUrl: "https://example.com/cv2.pdf",
  latexUrl: null,
  latexContent: null,
  isActive: false,
  createdAt: new Date("2024-01-02"),
  updatedAt: new Date("2024-01-02"),
};

// Simulate the router logic (what tRPC would execute)
// This tests the business logic without the tRPC transport layer

const MAX_CVS_PER_USER = 5;

interface CVCreateInput {
  name: string;
  pdfUrl?: string;
  latexUrl?: string;
  latexContent?: string;
  isActive?: boolean;
}

interface CVUpdateInput {
  id: string;
  name?: string;
  pdfUrl?: string | null;
  latexUrl?: string | null;
  latexContent?: string | null;
}

async function listCVsLogic(prisma: typeof prismaMock, userId: string): Promise<CV[]> {
  return prisma.cV.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });
}

async function getCVLogic(
  prisma: typeof prismaMock,
  userId: string,
  cvId: string
): Promise<CV | null> {
  const cv = await prisma.cV.findFirst({
    where: { id: cvId, userId },
  });
  return cv;
}

async function getActiveCVLogic(prisma: typeof prismaMock, userId: string): Promise<CV | null> {
  return prisma.cV.findFirst({
    where: { userId, isActive: true },
  });
}

async function createCVLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: CVCreateInput
): Promise<CV> {
  // Check CV count limit
  const existingCount = await prisma.cV.count({
    where: { userId },
  });

  if (existingCount >= MAX_CVS_PER_USER) {
    throw new Error(`Maximum of ${MAX_CVS_PER_USER} CVs allowed`);
  }

  // If this is the first CV or isActive is true, set as active
  const shouldBeActive = existingCount === 0 || input.isActive;

  // If setting as active, unset any existing active CV
  if (shouldBeActive) {
    await prisma.cV.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  return prisma.cV.create({
    data: {
      userId,
      name: input.name,
      pdfUrl: input.pdfUrl ?? null,
      latexUrl: input.latexUrl ?? null,
      latexContent: input.latexContent ?? null,
      isActive: shouldBeActive ?? false,
    },
  });
}

async function updateCVLogic(
  prisma: typeof prismaMock,
  userId: string,
  input: CVUpdateInput
): Promise<CV | null> {
  const { id, ...data } = input;

  // Verify ownership
  const cv = await prisma.cV.findFirst({
    where: { id, userId },
  });

  if (!cv) {
    return null; // Not found or access denied
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;
  if (data.latexUrl !== undefined) updateData.latexUrl = data.latexUrl;
  if (data.latexContent !== undefined) updateData.latexContent = data.latexContent;

  return prisma.cV.update({
    where: { id },
    data: updateData,
  });
}

async function setActiveCVLogic(
  prisma: typeof prismaMock,
  userId: string,
  cvId: string
): Promise<CV | null> {
  // Verify ownership
  const cv = await prisma.cV.findFirst({
    where: { id: cvId, userId },
  });

  if (!cv) {
    return null;
  }

  // Unset all other active CVs
  await prisma.cV.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  // Set selected CV as active
  return prisma.cV.update({
    where: { id: cvId },
    data: { isActive: true },
  });
}

async function deleteCVLogic(
  prisma: typeof prismaMock,
  userId: string,
  cvId: string
): Promise<{ success: boolean; promoted?: string }> {
  // Verify ownership
  const cv = await prisma.cV.findFirst({
    where: { id: cvId, userId },
  });

  if (!cv) {
    throw new Error("CV not found or access denied");
  }

  const wasActive = cv.isActive;

  // Delete the CV
  await prisma.cV.delete({
    where: { id: cvId },
  });

  // If we deleted the active CV, promote the most recent remaining one
  if (wasActive) {
    const remainingCV = await prisma.cV.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (remainingCV) {
      await prisma.cV.update({
        where: { id: remainingCV.id },
        data: { isActive: true },
      });
      return { success: true, promoted: remainingCV.id };
    }
  }

  return { success: true };
}

describe("CV Router Logic", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("returns empty array when user has no CVs", async () => {
      prismaMock.cV.findMany.mockResolvedValue([]);

      const result = await listCVsLogic(prismaMock, mockUserId);

      expect(result).toEqual([]);
      expect(prismaMock.cV.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      });
    });

    it("returns all CVs for user ordered by active then updatedAt", async () => {
      prismaMock.cV.findMany.mockResolvedValue([mockCV, mockCVInactive]);

      const result = await listCVsLogic(prismaMock, mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0]?.isActive).toBe(true);
      expect(result[1]?.isActive).toBe(false);
    });
  });

  describe("get", () => {
    it("returns CV when found and owned by user", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(mockCV);

      const result = await getCVLogic(prismaMock, mockUserId, mockCV.id);

      expect(result).toEqual(mockCV);
      expect(prismaMock.cV.findFirst).toHaveBeenCalledWith({
        where: { id: mockCV.id, userId: mockUserId },
      });
    });

    it("returns null when CV not found", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await getCVLogic(prismaMock, mockUserId, "non-existent");

      expect(result).toBeNull();
    });

    it("returns null when CV belongs to different user", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await getCVLogic(prismaMock, "other-user", mockCV.id);

      expect(result).toBeNull();
    });
  });

  describe("getActive", () => {
    it("returns active CV when exists", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(mockCV);

      const result = await getActiveCVLogic(prismaMock, mockUserId);

      expect(result).toEqual(mockCV);
      expect(prismaMock.cV.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, isActive: true },
      });
    });

    it("returns null when no active CV", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await getActiveCVLogic(prismaMock, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("creates first CV as active automatically", async () => {
      prismaMock.cV.count.mockResolvedValue(0);
      prismaMock.cV.create.mockResolvedValue({ ...mockCV, isActive: true });

      const result = await createCVLogic(prismaMock, mockUserId, {
        name: "My First CV",
        pdfUrl: "https://example.com/cv.pdf",
      });

      expect(result.isActive).toBe(true);
      expect(prismaMock.cV.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserId,
          name: "My First CV",
          isActive: true,
        }),
      });
    });

    it("creates subsequent CV as inactive by default", async () => {
      prismaMock.cV.count.mockResolvedValue(2);
      prismaMock.cV.create.mockResolvedValue({ ...mockCVInactive });

      await createCVLogic(prismaMock, mockUserId, {
        name: "Another CV",
      });

      // When existingCount > 0 and isActive not provided, shouldBeActive is false/undefined
      // The key assertion is that updateMany is NOT called (no active CV being unset)
      expect(prismaMock.cV.updateMany).not.toHaveBeenCalled();
    });

    it("sets CV as active when isActive=true is passed", async () => {
      prismaMock.cV.count.mockResolvedValue(2);
      prismaMock.cV.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.cV.create.mockResolvedValue({ ...mockCV, isActive: true });

      await createCVLogic(prismaMock, mockUserId, {
        name: "New Active CV",
        isActive: true,
      });

      // Should unset existing active CVs
      expect(prismaMock.cV.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isActive: true },
        data: { isActive: false },
      });

      expect(prismaMock.cV.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: true,
        }),
      });
    });

    it("throws error when user has maximum CVs", async () => {
      prismaMock.cV.count.mockResolvedValue(5);

      await expect(createCVLogic(prismaMock, mockUserId, { name: "One Too Many" })).rejects.toThrow(
        "Maximum of 5 CVs allowed"
      );
    });

    it("stores all optional fields correctly", async () => {
      prismaMock.cV.count.mockResolvedValue(0);
      prismaMock.cV.create.mockResolvedValue(mockCV);

      await createCVLogic(prismaMock, mockUserId, {
        name: "Full CV",
        pdfUrl: "https://example.com/cv.pdf",
        latexUrl: "https://example.com/cv.tex",
        latexContent: "\\documentclass{article}...",
        isActive: true,
      });

      expect(prismaMock.cV.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: "Full CV",
          pdfUrl: "https://example.com/cv.pdf",
          latexUrl: "https://example.com/cv.tex",
          latexContent: "\\documentclass{article}...",
          isActive: true,
        },
      });
    });
  });

  describe("update", () => {
    it("updates CV name when owned by user", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(mockCV);
      const updatedCV = { ...mockCV, name: "Updated Name" };
      prismaMock.cV.update.mockResolvedValue(updatedCV);

      const result = await updateCVLogic(prismaMock, mockUserId, {
        id: mockCV.id,
        name: "Updated Name",
      });

      expect(result?.name).toBe("Updated Name");
      expect(prismaMock.cV.update).toHaveBeenCalledWith({
        where: { id: mockCV.id },
        data: { name: "Updated Name" },
      });
    });

    it("updates multiple fields at once", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(mockCV);
      prismaMock.cV.update.mockResolvedValue({
        ...mockCV,
        name: "New Name",
        pdfUrl: "https://new.pdf",
        latexContent: "new content",
      });

      await updateCVLogic(prismaMock, mockUserId, {
        id: mockCV.id,
        name: "New Name",
        pdfUrl: "https://new.pdf",
        latexContent: "new content",
      });

      expect(prismaMock.cV.update).toHaveBeenCalledWith({
        where: { id: mockCV.id },
        data: {
          name: "New Name",
          pdfUrl: "https://new.pdf",
          latexContent: "new content",
        },
      });
    });

    it("allows setting fields to null", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(mockCV);
      prismaMock.cV.update.mockResolvedValue({ ...mockCV, pdfUrl: null });

      await updateCVLogic(prismaMock, mockUserId, {
        id: mockCV.id,
        pdfUrl: null,
      });

      expect(prismaMock.cV.update).toHaveBeenCalledWith({
        where: { id: mockCV.id },
        data: { pdfUrl: null },
      });
    });

    it("returns null when CV not found", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await updateCVLogic(prismaMock, mockUserId, {
        id: "non-existent",
        name: "New Name",
      });

      expect(result).toBeNull();
      expect(prismaMock.cV.update).not.toHaveBeenCalled();
    });

    it("returns null when CV belongs to different user", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await updateCVLogic(prismaMock, "other-user", {
        id: mockCV.id,
        name: "Hacker Name",
      });

      expect(result).toBeNull();
    });
  });

  describe("setActive", () => {
    it("sets CV as active and unsets others", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(mockCVInactive);
      prismaMock.cV.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.cV.update.mockResolvedValue({ ...mockCVInactive, isActive: true });

      const result = await setActiveCVLogic(prismaMock, mockUserId, mockCVInactive.id);

      expect(result?.isActive).toBe(true);

      // Should unset all other active CVs first
      expect(prismaMock.cV.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isActive: true },
        data: { isActive: false },
      });

      // Then set the selected one as active
      expect(prismaMock.cV.update).toHaveBeenCalledWith({
        where: { id: mockCVInactive.id },
        data: { isActive: true },
      });
    });

    it("returns null when CV not found", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await setActiveCVLogic(prismaMock, mockUserId, "non-existent");

      expect(result).toBeNull();
      expect(prismaMock.cV.updateMany).not.toHaveBeenCalled();
    });

    it("returns null when CV belongs to different user", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      const result = await setActiveCVLogic(prismaMock, "other-user", mockCV.id);

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes CV when owned by user", async () => {
      prismaMock.cV.findFirst
        .mockResolvedValueOnce(mockCVInactive) // For ownership check
        .mockResolvedValueOnce(null); // No remaining CVs to promote
      prismaMock.cV.delete.mockResolvedValue(mockCVInactive);

      const result = await deleteCVLogic(prismaMock, mockUserId, mockCVInactive.id);

      expect(result.success).toBe(true);
      expect(prismaMock.cV.delete).toHaveBeenCalledWith({
        where: { id: mockCVInactive.id },
      });
    });

    it("promotes another CV when deleting active CV", async () => {
      const remainingCV = { ...mockCVInactive, id: "cv-remaining" };

      prismaMock.cV.findFirst
        .mockResolvedValueOnce(mockCV) // For ownership check (active CV)
        .mockResolvedValueOnce(remainingCV); // Find remaining CV to promote
      prismaMock.cV.delete.mockResolvedValue(mockCV);
      prismaMock.cV.update.mockResolvedValue({ ...remainingCV, isActive: true });

      const result = await deleteCVLogic(prismaMock, mockUserId, mockCV.id);

      expect(result.success).toBe(true);
      expect(result.promoted).toBe(remainingCV.id);

      // Should promote the remaining CV
      expect(prismaMock.cV.update).toHaveBeenCalledWith({
        where: { id: remainingCV.id },
        data: { isActive: true },
      });
    });

    it("does not promote when deleting inactive CV", async () => {
      prismaMock.cV.findFirst.mockResolvedValueOnce(mockCVInactive);
      prismaMock.cV.delete.mockResolvedValue(mockCVInactive);

      const result = await deleteCVLogic(prismaMock, mockUserId, mockCVInactive.id);

      expect(result.success).toBe(true);
      expect(result.promoted).toBeUndefined();

      // Should NOT check for CVs to promote
      expect(prismaMock.cV.findFirst).toHaveBeenCalledTimes(1);
    });

    it("throws error when CV not found", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      await expect(deleteCVLogic(prismaMock, mockUserId, "non-existent")).rejects.toThrow(
        "CV not found or access denied"
      );

      expect(prismaMock.cV.delete).not.toHaveBeenCalled();
    });

    it("throws error when CV belongs to different user", async () => {
      prismaMock.cV.findFirst.mockResolvedValue(null);

      await expect(deleteCVLogic(prismaMock, "other-user", mockCV.id)).rejects.toThrow(
        "CV not found or access denied"
      );
    });
  });
});

describe("CV Business Rules", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  it("enforces maximum of 5 CVs per user", async () => {
    prismaMock.cV.count.mockResolvedValue(5);

    await expect(createCVLogic(prismaMock, mockUserId, { name: "CV 6" })).rejects.toThrow(
      "Maximum of 5 CVs allowed"
    );
  });

  it("allows creating CV when under limit", async () => {
    prismaMock.cV.count.mockResolvedValue(4);
    prismaMock.cV.create.mockResolvedValue(mockCVInactive);

    const result = await createCVLogic(prismaMock, mockUserId, { name: "CV 5" });

    expect(result).toBeDefined();
  });

  it("first CV is always active regardless of isActive flag", async () => {
    prismaMock.cV.count.mockResolvedValue(0);
    prismaMock.cV.create.mockResolvedValue({ ...mockCV, isActive: true });

    await createCVLogic(prismaMock, mockUserId, {
      name: "First CV",
      isActive: false, // Even if false, first CV should be active
    });

    expect(prismaMock.cV.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isActive: true, // Should be true since it's the first CV
      }),
    });
  });

  it("only one CV can be active at a time", async () => {
    prismaMock.cV.count.mockResolvedValue(2);
    prismaMock.cV.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.cV.create.mockResolvedValue({ ...mockCV, isActive: true });

    await createCVLogic(prismaMock, mockUserId, {
      name: "New Active CV",
      isActive: true,
    });

    // Should unset existing active CVs before creating new active one
    expect(prismaMock.cV.updateMany).toHaveBeenCalledWith({
      where: { userId: mockUserId, isActive: true },
      data: { isActive: false },
    });
  });

  it("protects CVs from cross-user access on get", async () => {
    prismaMock.cV.findFirst.mockResolvedValue(null);

    const result = await getCVLogic(prismaMock, "attacker-user", mockCV.id);

    expect(result).toBeNull();
    expect(prismaMock.cV.findFirst).toHaveBeenCalledWith({
      where: { id: mockCV.id, userId: "attacker-user" },
    });
  });

  it("protects CVs from cross-user access on update", async () => {
    prismaMock.cV.findFirst.mockResolvedValue(null);

    const result = await updateCVLogic(prismaMock, "attacker-user", {
      id: mockCV.id,
      name: "Hacked",
    });

    expect(result).toBeNull();
    expect(prismaMock.cV.update).not.toHaveBeenCalled();
  });

  it("protects CVs from cross-user access on delete", async () => {
    prismaMock.cV.findFirst.mockResolvedValue(null);

    await expect(deleteCVLogic(prismaMock, "attacker-user", mockCV.id)).rejects.toThrow(
      "CV not found or access denied"
    );

    expect(prismaMock.cV.delete).not.toHaveBeenCalled();
  });
});
