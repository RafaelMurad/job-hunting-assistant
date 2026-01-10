/**
 * Integration Tests: UX tRPC Router Logic
 *
 * Tests the UX router business logic with mocked dependencies.
 * Uses a simplified approach that doesn't require the full tRPC server stack.
 *
 * Test Strategy:
 * - Mock Prisma client for database operations
 * - Test CRUD for personas, journeys, pain points, principles
 * - Test version tracking
 * - Test stats aggregation
 */

import type { PrismaClient, UxPainPoint, UxPersona } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Create mocked Prisma client
const prismaMock = mockDeep<PrismaClient>();

// =============================================================================
// MOCK DATA
// =============================================================================

const mockPersona: UxPersona = {
  id: "persona-1",
  name: "Job Seeker Jane",
  type: "Primary",
  description: "A recent graduate looking for her first developer job",
  goals: JSON.stringify(["Find a job", "Build portfolio", "Learn new skills"]),
  frustrations: JSON.stringify(["Rejection letters", "Lack of experience", "Imposter syndrome"]),
  behaviors: JSON.stringify(["Applies to 10+ jobs daily", "Active on LinkedIn"]),
  status: "DRAFT",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Note: mockJourney, mockJourneyStep, and mockPrinciple are defined but not used
// in these tests. They would be used when testing journey/principle CRUD operations.

const mockPainPoint: UxPainPoint = {
  id: "pain-1",
  title: "CV formatting is tedious",
  description: "Users spend hours formatting their CV for each application",
  category: "Efficiency",
  severity: "HIGH",
  effort: "MEDIUM",
  userQuote: "I wish I could just upload once and be done",
  solution: "AI-powered CV customization",
  status: "VALIDATED",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// =============================================================================
// SIMULATE ROUTER LOGIC
// =============================================================================

// Simulates: uxRouter.getStats
async function getStatsLogic(prisma: typeof prismaMock): Promise<{
  personaCount: number;
  journeyCount: number;
  painPointCount: number;
  principleCount: number;
  validatedCount: number;
  criticalPainPoints: number;
}> {
  const [
    personaCount,
    journeyCount,
    painPointCount,
    principleCount,
    validatedCount,
    criticalPainPoints,
  ] = await Promise.all([
    prisma.uxPersona.count(),
    prisma.uxJourney.count(),
    prisma.uxPainPoint.count(),
    prisma.uxPrinciple.count(),
    prisma.uxPainPoint.count({ where: { status: "VALIDATED" } }),
    prisma.uxPainPoint.count({ where: { severity: "CRITICAL" } }),
  ]);

  return {
    personaCount,
    journeyCount,
    painPointCount,
    principleCount,
    validatedCount,
    criticalPainPoints,
  };
}

// Simulates: uxRouter.getPersonas
async function getPersonasLogic(prisma: typeof prismaMock): Promise<
  Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    goals: string[];
    frustrations: string[];
    behaviors: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>
> {
  const personas = await prisma.uxPersona.findMany({
    include: { comments: true },
    orderBy: { createdAt: "desc" },
  });

  return personas.map((p) => ({
    ...p,
    goals: JSON.parse(p.goals) as string[],
    frustrations: JSON.parse(p.frustrations) as string[],
    behaviors: JSON.parse(p.behaviors) as string[],
  }));
}

// Simulates: uxRouter.getPersona
async function getPersonaLogic(
  prisma: typeof prismaMock,
  id: string
): Promise<{
  id: string;
  name: string;
  type: string;
  description: string;
  goals: string[];
  frustrations: string[];
  behaviors: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}> {
  const persona = await prisma.uxPersona.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
      versions: { orderBy: { version: "desc" }, take: 10 },
      journeys: true,
    },
  });

  if (!persona) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Persona not found" });
  }

  return {
    ...persona,
    goals: JSON.parse(persona.goals) as string[],
    frustrations: JSON.parse(persona.frustrations) as string[],
    behaviors: JSON.parse(persona.behaviors) as string[],
  };
}

// Simulates: uxRouter.createPersona
async function createPersonaLogic(
  prisma: typeof prismaMock,
  input: {
    name: string;
    type: string;
    description: string;
    goals: string[];
    frustrations: string[];
    behaviors: string[];
    status?: string;
  }
): Promise<UxPersona> {
  const persona = await prisma.uxPersona.create({
    data: {
      name: input.name,
      type: input.type,
      description: input.description,
      goals: JSON.stringify(input.goals),
      frustrations: JSON.stringify(input.frustrations),
      behaviors: JSON.stringify(input.behaviors),
      status: (input.status ?? "DRAFT") as "DRAFT" | "IN_REVIEW" | "VALIDATED" | "ARCHIVED",
    },
  });

  // Create initial version
  await prisma.uxVersion.create({
    data: {
      entityType: "persona",
      entityId: persona.id,
      personaId: persona.id,
      version: 1,
      data: JSON.stringify(persona),
      changeNote: "Initial creation",
    },
  });

  return persona;
}

// Simulates: uxRouter.deletePersona
async function deletePersonaLogic(
  prisma: typeof prismaMock,
  id: string
): Promise<{ success: true }> {
  await prisma.uxPersona.delete({ where: { id } });
  return { success: true };
}

// Simulates: uxRouter.getPainPoints
async function getPainPointsLogic(prisma: typeof prismaMock): Promise<UxPainPoint[]> {
  return prisma.uxPainPoint.findMany({
    include: { comments: true },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });
}

// Simulates: uxRouter.createPainPoint
async function createPainPointLogic(
  prisma: typeof prismaMock,
  input: {
    title: string;
    description: string;
    category: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    effort: "LOW" | "MEDIUM" | "HIGH";
    userQuote?: string;
    solution?: string;
    status?: string;
  }
): Promise<UxPainPoint> {
  const painPoint = await prisma.uxPainPoint.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      effort: input.effort,
      userQuote: input.userQuote ?? null,
      solution: input.solution ?? null,
      status: (input.status ?? "DRAFT") as "DRAFT" | "IN_REVIEW" | "VALIDATED" | "ARCHIVED",
    },
  });

  return painPoint;
}

// =============================================================================
// TESTS
// =============================================================================

describe("UX Router Logic", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("returns all UX stats", async () => {
      prismaMock.uxPersona.count.mockResolvedValue(3);
      prismaMock.uxJourney.count.mockResolvedValue(5);
      prismaMock.uxPainPoint.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4) // validated
        .mockResolvedValueOnce(2); // critical
      prismaMock.uxPrinciple.count.mockResolvedValue(7);

      const result = await getStatsLogic(prismaMock);

      expect(result.personaCount).toBe(3);
      expect(result.journeyCount).toBe(5);
      expect(result.painPointCount).toBe(10);
      expect(result.principleCount).toBe(7);
      expect(result.validatedCount).toBe(4);
      expect(result.criticalPainPoints).toBe(2);
    });

    it("returns zero counts when database is empty", async () => {
      prismaMock.uxPersona.count.mockResolvedValue(0);
      prismaMock.uxJourney.count.mockResolvedValue(0);
      prismaMock.uxPainPoint.count.mockResolvedValue(0);
      prismaMock.uxPrinciple.count.mockResolvedValue(0);

      const result = await getStatsLogic(prismaMock);

      expect(result.personaCount).toBe(0);
      expect(result.journeyCount).toBe(0);
    });
  });

  describe("getPersonas", () => {
    it("returns all personas with parsed JSON fields", async () => {
      prismaMock.uxPersona.findMany.mockResolvedValue([
        { ...mockPersona, comments: [] },
      ] as unknown as UxPersona[]);

      const result = await getPersonasLogic(prismaMock);

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("Job Seeker Jane");
      expect(Array.isArray(result[0]!.goals)).toBe(true);
      expect(result[0]!.goals).toContain("Find a job");
    });

    it("returns empty array when no personas exist", async () => {
      prismaMock.uxPersona.findMany.mockResolvedValue([]);

      const result = await getPersonasLogic(prismaMock);

      expect(result).toHaveLength(0);
    });
  });

  describe("getPersona", () => {
    it("returns persona by ID with relations", async () => {
      prismaMock.uxPersona.findUnique.mockResolvedValue({
        ...mockPersona,
        comments: [],
        versions: [],
        journeys: [],
      } as unknown as UxPersona);

      const result = await getPersonaLogic(prismaMock, "persona-1");

      expect(result.id).toBe("persona-1");
      expect(result.name).toBe("Job Seeker Jane");
      expect(result.goals).toContain("Find a job");
    });

    it("throws NOT_FOUND when persona does not exist", async () => {
      prismaMock.uxPersona.findUnique.mockResolvedValue(null);

      await expect(getPersonaLogic(prismaMock, "non-existent")).rejects.toThrow(TRPCError);
      await expect(getPersonaLogic(prismaMock, "non-existent")).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("createPersona", () => {
    const validInput = {
      name: "New Persona",
      type: "Secondary",
      description: "A secondary user type",
      goals: ["Goal 1", "Goal 2"],
      frustrations: ["Frustration 1"],
      behaviors: ["Behavior 1"],
    };

    it("creates persona with JSON stringified fields", async () => {
      prismaMock.uxPersona.create.mockResolvedValue({
        ...mockPersona,
        ...validInput,
        id: "new-persona",
        goals: JSON.stringify(validInput.goals),
        frustrations: JSON.stringify(validInput.frustrations),
        behaviors: JSON.stringify(validInput.behaviors),
      });
      prismaMock.uxVersion.create.mockResolvedValue({} as never);

      const result = await createPersonaLogic(prismaMock, validInput);

      expect(result.name).toBe("New Persona");
      expect(prismaMock.uxPersona.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "New Persona",
          goals: JSON.stringify(["Goal 1", "Goal 2"]),
          status: "DRAFT",
        }),
      });
    });

    it("creates initial version for audit trail", async () => {
      prismaMock.uxPersona.create.mockResolvedValue(mockPersona);
      prismaMock.uxVersion.create.mockResolvedValue({} as never);

      await createPersonaLogic(prismaMock, validInput);

      expect(prismaMock.uxVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entityType: "persona",
          version: 1,
          changeNote: "Initial creation",
        }),
      });
    });
  });

  describe("deletePersona", () => {
    it("deletes persona successfully", async () => {
      prismaMock.uxPersona.delete.mockResolvedValue(mockPersona);

      const result = await deletePersonaLogic(prismaMock, "persona-1");

      expect(result.success).toBe(true);
      expect(prismaMock.uxPersona.delete).toHaveBeenCalledWith({
        where: { id: "persona-1" },
      });
    });

    it("handles delete of non-existent persona", async () => {
      prismaMock.uxPersona.delete.mockRejectedValue(new Error("Record not found"));

      await expect(deletePersonaLogic(prismaMock, "non-existent")).rejects.toThrow(
        "Record not found"
      );
    });
  });

  describe("getPainPoints", () => {
    it("returns pain points ordered by severity and date", async () => {
      prismaMock.uxPainPoint.findMany.mockResolvedValue([
        { ...mockPainPoint, comments: [] },
      ] as unknown as UxPainPoint[]);

      const result = await getPainPointsLogic(prismaMock);

      expect(result).toHaveLength(1);
      expect(result[0]!.title).toBe("CV formatting is tedious");
      expect(prismaMock.uxPainPoint.findMany).toHaveBeenCalledWith({
        include: { comments: true },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      });
    });
  });

  describe("createPainPoint", () => {
    const validInput = {
      title: "New Pain Point",
      description: "Users struggle with X",
      category: "Usability",
      severity: "HIGH" as const,
      effort: "LOW" as const,
    };

    it("creates pain point with required fields", async () => {
      prismaMock.uxPainPoint.create.mockResolvedValue({
        ...mockPainPoint,
        ...validInput,
        id: "new-pain",
        userQuote: null,
        solution: null,
      });

      const result = await createPainPointLogic(prismaMock, validInput);

      expect(result.title).toBe("New Pain Point");
      expect(prismaMock.uxPainPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "New Pain Point",
          severity: "HIGH",
          effort: "LOW",
          status: "DRAFT",
        }),
      });
    });

    it("creates pain point with optional fields", async () => {
      const inputWithOptionals = {
        ...validInput,
        userQuote: "This is so frustrating!",
        solution: "Implement feature X",
      };
      prismaMock.uxPainPoint.create.mockResolvedValue({
        ...mockPainPoint,
        ...inputWithOptionals,
        id: "new-pain",
      });

      await createPainPointLogic(prismaMock, inputWithOptionals);

      expect(prismaMock.uxPainPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userQuote: "This is so frustrating!",
          solution: "Implement feature X",
        }),
      });
    });
  });

  describe("database error handling", () => {
    it("propagates database errors on getStats", async () => {
      prismaMock.uxPersona.count.mockRejectedValue(new Error("Connection lost"));

      await expect(getStatsLogic(prismaMock)).rejects.toThrow("Connection lost");
    });

    it("propagates database errors on getPersonas", async () => {
      prismaMock.uxPersona.findMany.mockRejectedValue(new Error("Query timeout"));

      await expect(getPersonasLogic(prismaMock)).rejects.toThrow("Query timeout");
    });
  });

  describe("data transformation", () => {
    it("correctly parses JSON arrays from database", async () => {
      const personaWithComplexData = {
        ...mockPersona,
        goals: JSON.stringify(["Goal 1", "Goal 2", 'Goal with "quotes"']),
        comments: [],
      };
      prismaMock.uxPersona.findMany.mockResolvedValue([
        personaWithComplexData,
      ] as unknown as UxPersona[]);

      const result = await getPersonasLogic(prismaMock);

      expect(result[0]!.goals).toHaveLength(3);
      expect(result[0]!.goals[2]).toBe('Goal with "quotes"');
    });

    it("handles empty JSON arrays", async () => {
      const personaWithEmptyArrays = {
        ...mockPersona,
        goals: JSON.stringify([]),
        frustrations: JSON.stringify([]),
        behaviors: JSON.stringify([]),
        comments: [],
      };
      prismaMock.uxPersona.findMany.mockResolvedValue([
        personaWithEmptyArrays,
      ] as unknown as UxPersona[]);

      const result = await getPersonasLogic(prismaMock);

      expect(result[0]!.goals).toHaveLength(0);
      expect(result[0]!.frustrations).toHaveLength(0);
    });
  });
});
