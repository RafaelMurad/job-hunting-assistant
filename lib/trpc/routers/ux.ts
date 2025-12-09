/**
 * UX Research tRPC Router
 *
 * Handles all UX research operations including:
 * - CRUD for personas, journeys, pain points, principles
 * - Version tracking for all changes
 * - Comments/annotations
 * - AI analysis and chat
 */

import { router, adminProcedure } from "@/lib/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type UxSeverity, type UxEffort, type UxStatus } from "@prisma/client";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const uxStatusSchema = z.enum(["DRAFT", "IN_REVIEW", "VALIDATED", "ARCHIVED"]);
const uxSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const uxEffortSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const personaInputSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  goals: z.array(z.string()),
  frustrations: z.array(z.string()),
  behaviors: z.array(z.string()),
  status: uxStatusSchema.optional().default("DRAFT"),
});

const journeyStepSchema = z.object({
  stage: z.string().min(1),
  action: z.string().min(1),
  thinking: z.string().min(1),
  feeling: z.string().min(1),
  touchpoint: z.string().min(1),
  opportunity: z.string().optional(),
});

const journeyInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  personaId: z.string().optional(),
  steps: z.array(journeyStepSchema),
  status: uxStatusSchema.optional().default("DRAFT"),
});

const painPointInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  severity: uxSeveritySchema,
  effort: uxEffortSchema,
  userQuote: z.string().optional(),
  solution: z.string().optional(),
  status: uxStatusSchema.optional().default("DRAFT"),
});

const principleInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  rationale: z.string().min(1),
  examples: z.object({
    do: z.array(z.string()),
    dont: z.array(z.string()),
  }),
  priority: z.number().optional().default(0),
  status: uxStatusSchema.optional().default("DRAFT"),
});

const commentInputSchema = z.object({
  entityType: z.enum(["persona", "journey", "painpoint", "principle"]),
  entityId: z.string(),
  content: z.string().min(1),
  author: z.string().optional(),
});

const chatMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1),
  context: z.string().optional(),
});

// =============================================================================
// ROUTER
// =============================================================================

export const uxRouter = router({
  // ===========================================================================
  // DASHBOARD / OVERVIEW
  // ===========================================================================

  /**
   * Get all UX data for dashboard overview
   */
  getAll: adminProcedure.query(async ({ ctx }) => {
    const [personas, journeys, painPoints, principles] = await Promise.all([
      ctx.prisma.uxPersona.findMany({
        orderBy: { createdAt: "desc" },
      }),
      ctx.prisma.uxJourney.findMany({
        include: {
          steps: { orderBy: { orderIndex: "asc" } },
          persona: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      ctx.prisma.uxPainPoint.findMany({
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      }),
      ctx.prisma.uxPrinciple.findMany({
        orderBy: { priority: "asc" },
      }),
    ]);

    // Transform JSON strings to arrays for client
    const transformedPersonas = personas.map((p) => ({
      ...p,
      goals: JSON.parse(p.goals) as string[],
      frustrations: JSON.parse(p.frustrations) as string[],
      behaviors: JSON.parse(p.behaviors) as string[],
    }));

    const transformedPrinciples = principles.map((p) => ({
      ...p,
      examples: JSON.parse(p.examples) as { do: string[]; dont: string[] },
    }));

    return {
      personas: transformedPersonas,
      journeys,
      painPoints,
      principles: transformedPrinciples,
    };
  }),

  /**
   * Get stats for UX research
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      personaCount,
      journeyCount,
      painPointCount,
      principleCount,
      validatedCount,
      criticalPainPoints,
    ] = await Promise.all([
      ctx.prisma.uxPersona.count(),
      ctx.prisma.uxJourney.count(),
      ctx.prisma.uxPainPoint.count(),
      ctx.prisma.uxPrinciple.count(),
      ctx.prisma.uxPainPoint.count({ where: { status: "VALIDATED" } }),
      ctx.prisma.uxPainPoint.count({ where: { severity: "CRITICAL" } }),
    ]);

    return {
      personaCount,
      journeyCount,
      painPointCount,
      principleCount,
      validatedCount,
      criticalPainPoints,
    };
  }),

  // ===========================================================================
  // PERSONAS
  // ===========================================================================

  getPersonas: adminProcedure.query(async ({ ctx }) => {
    const personas = await ctx.prisma.uxPersona.findMany({
      include: { comments: true },
      orderBy: { createdAt: "desc" },
    });

    return personas.map((p) => ({
      ...p,
      goals: JSON.parse(p.goals) as string[],
      frustrations: JSON.parse(p.frustrations) as string[],
      behaviors: JSON.parse(p.behaviors) as string[],
    }));
  }),

  getPersona: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const persona = await ctx.prisma.uxPersona.findUnique({
      where: { id: input.id },
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
  }),

  createPersona: adminProcedure.input(personaInputSchema).mutation(async ({ ctx, input }) => {
    const persona = await ctx.prisma.uxPersona.create({
      data: {
        name: input.name,
        type: input.type,
        description: input.description,
        goals: JSON.stringify(input.goals),
        frustrations: JSON.stringify(input.frustrations),
        behaviors: JSON.stringify(input.behaviors),
        status: input.status as UxStatus,
      },
    });

    // Create initial version
    await ctx.prisma.uxVersion.create({
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
  }),

  updatePersona: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: personaInputSchema.partial(),
        changeNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.uxPersona.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Persona not found" });
      }

      // Get current version number
      const latestVersion = await ctx.prisma.uxVersion.findFirst({
        where: { entityType: "persona", entityId: input.id },
        orderBy: { version: "desc" },
      });

      const updateData: Record<string, unknown> = {};
      if (input.data.name) updateData.name = input.data.name;
      if (input.data.type) updateData.type = input.data.type;
      if (input.data.description) updateData.description = input.data.description;
      if (input.data.goals) updateData.goals = JSON.stringify(input.data.goals);
      if (input.data.frustrations)
        updateData.frustrations = JSON.stringify(input.data.frustrations);
      if (input.data.behaviors) updateData.behaviors = JSON.stringify(input.data.behaviors);
      if (input.data.status) updateData.status = input.data.status as UxStatus;

      const persona = await ctx.prisma.uxPersona.update({
        where: { id: input.id },
        data: updateData,
      });

      // Create new version
      await ctx.prisma.uxVersion.create({
        data: {
          entityType: "persona",
          entityId: persona.id,
          personaId: persona.id,
          version: (latestVersion?.version ?? 0) + 1,
          data: JSON.stringify(persona),
          changeNote: input.changeNote ?? "Updated",
        },
      });

      return persona;
    }),

  deletePersona: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.uxPersona.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ===========================================================================
  // JOURNEYS
  // ===========================================================================

  getJourneys: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.uxJourney.findMany({
      include: {
        steps: { orderBy: { orderIndex: "asc" } },
        persona: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getJourney: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const journey = await ctx.prisma.uxJourney.findUnique({
      where: { id: input.id },
      include: {
        steps: { orderBy: { orderIndex: "asc" } },
        persona: true,
        comments: { orderBy: { createdAt: "desc" } },
        versions: { orderBy: { version: "desc" }, take: 10 },
      },
    });

    if (!journey) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Journey not found" });
    }

    return journey;
  }),

  createJourney: adminProcedure.input(journeyInputSchema).mutation(async ({ ctx, input }) => {
    const { steps, ...journeyData } = input;

    const journey = await ctx.prisma.uxJourney.create({
      data: {
        ...journeyData,
        personaId: journeyData.personaId ?? null,
        status: journeyData.status as UxStatus,
        steps: {
          create: steps.map((step, index) => ({
            ...step,
            opportunity: step.opportunity ?? null,
            orderIndex: index,
          })),
        },
      },
      include: { steps: true },
    });

    // Create initial version
    await ctx.prisma.uxVersion.create({
      data: {
        entityType: "journey",
        entityId: journey.id,
        journeyId: journey.id,
        version: 1,
        data: JSON.stringify(journey),
        changeNote: "Initial creation",
      },
    });

    return journey;
  }),

  updateJourney: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: journeyInputSchema.partial(),
        changeNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.uxJourney.findUnique({
        where: { id: input.id },
        include: { steps: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Journey not found" });
      }

      // Get current version number
      const latestVersion = await ctx.prisma.uxVersion.findFirst({
        where: { entityType: "journey", entityId: input.id },
        orderBy: { version: "desc" },
      });

      const { steps, ...updateFields } = input.data;

      // Update journey
      const journey = await ctx.prisma.uxJourney.update({
        where: { id: input.id },
        data: {
          ...(updateFields.name && { name: updateFields.name }),
          ...(updateFields.description && { description: updateFields.description }),
          ...(updateFields.personaId !== undefined && { personaId: updateFields.personaId }),
          ...(updateFields.status && { status: updateFields.status as UxStatus }),
        },
        include: { steps: true },
      });

      // If steps provided, replace all steps
      if (steps) {
        await ctx.prisma.uxJourneyStep.deleteMany({
          where: { journeyId: input.id },
        });
        await ctx.prisma.uxJourneyStep.createMany({
          data: steps.map((step, index) => ({
            ...step,
            opportunity: step.opportunity ?? null,
            journeyId: input.id,
            orderIndex: index,
          })),
        });
      }

      const updatedJourney = await ctx.prisma.uxJourney.findUnique({
        where: { id: input.id },
        include: { steps: { orderBy: { orderIndex: "asc" } } },
      });

      // Create new version
      await ctx.prisma.uxVersion.create({
        data: {
          entityType: "journey",
          entityId: journey.id,
          journeyId: journey.id,
          version: (latestVersion?.version ?? 0) + 1,
          data: JSON.stringify(updatedJourney),
          changeNote: input.changeNote ?? "Updated",
        },
      });

      return updatedJourney;
    }),

  deleteJourney: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.uxJourney.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ===========================================================================
  // PAIN POINTS
  // ===========================================================================

  getPainPoints: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.uxPainPoint.findMany({
      include: { comments: true },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });
  }),

  getPainPoint: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const painPoint = await ctx.prisma.uxPainPoint.findUnique({
      where: { id: input.id },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
        versions: { orderBy: { version: "desc" }, take: 10 },
      },
    });

    if (!painPoint) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Pain point not found" });
    }

    return painPoint;
  }),

  createPainPoint: adminProcedure.input(painPointInputSchema).mutation(async ({ ctx, input }) => {
    const painPoint = await ctx.prisma.uxPainPoint.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        severity: input.severity as UxSeverity,
        effort: input.effort as UxEffort,
        userQuote: input.userQuote ?? null,
        solution: input.solution ?? null,
        status: input.status as UxStatus,
      },
    });

    // Create initial version
    await ctx.prisma.uxVersion.create({
      data: {
        entityType: "painpoint",
        entityId: painPoint.id,
        painPointId: painPoint.id,
        version: 1,
        data: JSON.stringify(painPoint),
        changeNote: "Initial creation",
      },
    });

    return painPoint;
  }),

  updatePainPoint: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: painPointInputSchema.partial(),
        changeNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.uxPainPoint.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pain point not found" });
      }

      // Get current version number
      const latestVersion = await ctx.prisma.uxVersion.findFirst({
        where: { entityType: "painpoint", entityId: input.id },
        orderBy: { version: "desc" },
      });

      const painPoint = await ctx.prisma.uxPainPoint.update({
        where: { id: input.id },
        data: {
          ...(input.data.title && { title: input.data.title }),
          ...(input.data.description && { description: input.data.description }),
          ...(input.data.category && { category: input.data.category }),
          ...(input.data.severity && { severity: input.data.severity as UxSeverity }),
          ...(input.data.effort && { effort: input.data.effort as UxEffort }),
          ...(input.data.userQuote !== undefined && { userQuote: input.data.userQuote }),
          ...(input.data.solution !== undefined && { solution: input.data.solution }),
          ...(input.data.status && { status: input.data.status as UxStatus }),
        },
      });

      // Create new version
      await ctx.prisma.uxVersion.create({
        data: {
          entityType: "painpoint",
          entityId: painPoint.id,
          painPointId: painPoint.id,
          version: (latestVersion?.version ?? 0) + 1,
          data: JSON.stringify(painPoint),
          changeNote: input.changeNote ?? "Updated",
        },
      });

      return painPoint;
    }),

  deletePainPoint: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.uxPainPoint.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ===========================================================================
  // PRINCIPLES
  // ===========================================================================

  getPrinciples: adminProcedure.query(async ({ ctx }) => {
    const principles = await ctx.prisma.uxPrinciple.findMany({
      include: { comments: true },
      orderBy: { priority: "asc" },
    });

    return principles.map((p) => ({
      ...p,
      examples: JSON.parse(p.examples) as { do: string[]; dont: string[] },
    }));
  }),

  getPrinciple: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const principle = await ctx.prisma.uxPrinciple.findUnique({
      where: { id: input.id },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
        versions: { orderBy: { version: "desc" }, take: 10 },
      },
    });

    if (!principle) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Principle not found" });
    }

    return {
      ...principle,
      examples: JSON.parse(principle.examples) as { do: string[]; dont: string[] },
    };
  }),

  createPrinciple: adminProcedure.input(principleInputSchema).mutation(async ({ ctx, input }) => {
    const principle = await ctx.prisma.uxPrinciple.create({
      data: {
        name: input.name,
        description: input.description,
        rationale: input.rationale,
        examples: JSON.stringify(input.examples),
        priority: input.priority,
        status: input.status as UxStatus,
      },
    });

    // Create initial version
    await ctx.prisma.uxVersion.create({
      data: {
        entityType: "principle",
        entityId: principle.id,
        principleId: principle.id,
        version: 1,
        data: JSON.stringify(principle),
        changeNote: "Initial creation",
      },
    });

    return principle;
  }),

  updatePrinciple: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: principleInputSchema.partial(),
        changeNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.uxPrinciple.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Principle not found" });
      }

      // Get current version number
      const latestVersion = await ctx.prisma.uxVersion.findFirst({
        where: { entityType: "principle", entityId: input.id },
        orderBy: { version: "desc" },
      });

      const principle = await ctx.prisma.uxPrinciple.update({
        where: { id: input.id },
        data: {
          ...(input.data.name && { name: input.data.name }),
          ...(input.data.description && { description: input.data.description }),
          ...(input.data.rationale && { rationale: input.data.rationale }),
          ...(input.data.examples && { examples: JSON.stringify(input.data.examples) }),
          ...(input.data.priority !== undefined && { priority: input.data.priority }),
          ...(input.data.status && { status: input.data.status as UxStatus }),
        },
      });

      // Create new version
      await ctx.prisma.uxVersion.create({
        data: {
          entityType: "principle",
          entityId: principle.id,
          principleId: principle.id,
          version: (latestVersion?.version ?? 0) + 1,
          data: JSON.stringify(principle),
          changeNote: input.changeNote ?? "Updated",
        },
      });

      return principle;
    }),

  deletePrinciple: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.uxPrinciple.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ===========================================================================
  // COMMENTS
  // ===========================================================================

  addComment: adminProcedure.input(commentInputSchema).mutation(async ({ ctx, input }) => {
    // Build create data with proper typing
    const createData = {
      entityType: input.entityType,
      entityId: input.entityId,
      content: input.content,
      author: input.author ?? null,
      personaId: input.entityType === "persona" ? input.entityId : null,
      journeyId: input.entityType === "journey" ? input.entityId : null,
      painPointId: input.entityType === "painpoint" ? input.entityId : null,
      principleId: input.entityType === "principle" ? input.entityId : null,
    };

    return ctx.prisma.uxComment.create({ data: createData });
  }),

  resolveComment: adminProcedure
    .input(z.object({ id: z.string(), resolved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.uxComment.update({
        where: { id: input.id },
        data: { resolved: input.resolved },
      });
    }),

  deleteComment: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.uxComment.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ===========================================================================
  // VERSION HISTORY
  // ===========================================================================

  getVersions: adminProcedure
    .input(
      z.object({
        entityType: z.enum(["persona", "journey", "painpoint", "principle"]),
        entityId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.uxVersion.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        orderBy: { version: "desc" },
      });
    }),

  // ===========================================================================
  // CHAT
  // ===========================================================================

  getChatHistory: adminProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.uxChatMessage.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { createdAt: "asc" },
      });
    }),

  addChatMessage: adminProcedure.input(chatMessageSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.uxChatMessage.create({
      data: {
        sessionId: input.sessionId,
        role: "user",
        content: input.content,
        context: input.context ?? null,
      },
    });
  }),

  // AI analysis results are stored separately
  saveAiAnalysis: adminProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.string().optional(),
        prompt: z.string(),
        response: z.string(),
        model: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.uxAiAnalysis.create({
        data: {
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          prompt: input.prompt,
          response: input.response,
          model: input.model,
        },
      });
    }),

  // ===========================================================================
  // AI ANALYSIS
  // ===========================================================================

  analyzeJourney: adminProcedure
    .input(z.object({ journeyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { analyzeJourney } = await import("@/lib/ai/ux");

      const journey = await ctx.prisma.uxJourney.findUnique({
        where: { id: input.journeyId },
        include: { steps: { orderBy: { orderIndex: "asc" } } },
      });

      if (!journey) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Journey not found" });
      }

      // Get context data
      const [personas, painPoints] = await Promise.all([
        ctx.prisma.uxPersona.findMany({ select: { name: true, description: true } }),
        ctx.prisma.uxPainPoint.findMany({ select: { title: true, description: true } }),
      ]);

      const result = await analyzeJourney(
        {
          name: journey.name,
          description: journey.description,
          steps: journey.steps,
        },
        { personas, painPoints }
      );

      // Save analysis
      await ctx.prisma.uxAiAnalysis.create({
        data: {
          entityType: "journey",
          entityId: input.journeyId,
          prompt: `Analyze journey: ${journey.name}`,
          response: JSON.stringify(result),
          model: "gemini-2.5-pro",
        },
      });

      return result;
    }),

  analyzePainPoints: adminProcedure.mutation(async ({ ctx }) => {
    const { analyzePainPoints } = await import("@/lib/ai/ux");

    const painPoints = await ctx.prisma.uxPainPoint.findMany();
    const [journeys, personas] = await Promise.all([
      ctx.prisma.uxJourney.findMany({ select: { name: true, description: true } }),
      ctx.prisma.uxPersona.findMany({ select: { name: true, description: true } }),
    ]);

    const result = await analyzePainPoints(
      painPoints.map((p) => ({
        title: p.title,
        description: p.description,
        category: p.category,
        severity: p.severity,
        effort: p.effort,
        solution: p.solution,
      })),
      { journeys, personas }
    );

    // Save analysis
    await ctx.prisma.uxAiAnalysis.create({
      data: {
        entityType: "painpoint",
        entityId: null,
        prompt: "Analyze all pain points",
        response: JSON.stringify(result),
        model: "gemini-2.5-pro",
      },
    });

    return result;
  }),

  analyzePersona: adminProcedure
    .input(z.object({ personaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { analyzePersona } = await import("@/lib/ai/ux");

      const persona = await ctx.prisma.uxPersona.findUnique({
        where: { id: input.personaId },
      });

      if (!persona) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Persona not found" });
      }

      // Get context
      const [journeys, painPoints] = await Promise.all([
        ctx.prisma.uxJourney.findMany({ select: { name: true, description: true } }),
        ctx.prisma.uxPainPoint.findMany({ select: { title: true, description: true } }),
      ]);

      const result = await analyzePersona(
        {
          name: persona.name,
          type: persona.type,
          description: persona.description,
          goals: JSON.parse(persona.goals) as string[],
          frustrations: JSON.parse(persona.frustrations) as string[],
          behaviors: JSON.parse(persona.behaviors) as string[],
        },
        { journeys, painPoints }
      );

      // Save analysis
      await ctx.prisma.uxAiAnalysis.create({
        data: {
          entityType: "persona",
          entityId: input.personaId,
          prompt: `Analyze persona: ${persona.name}`,
          response: JSON.stringify(result),
          model: "gemini-2.5-pro",
        },
      });

      return result;
    }),

  chat: adminProcedure
    .input(
      z.object({
        sessionId: z.string(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatAboutUx } = await import("@/lib/ai/ux");

      // Save user message
      await ctx.prisma.uxChatMessage.create({
        data: {
          sessionId: input.sessionId,
          role: "user",
          content: input.message,
        },
      });

      // Get all UX data for context
      const [personas, journeys, painPoints, principles] = await Promise.all([
        ctx.prisma.uxPersona.findMany(),
        ctx.prisma.uxJourney.findMany({
          include: { steps: { orderBy: { orderIndex: "asc" } } },
        }),
        ctx.prisma.uxPainPoint.findMany(),
        ctx.prisma.uxPrinciple.findMany(),
      ]);

      // Transform data for AI
      const uxData = {
        personas: personas.map((p) => ({
          name: p.name,
          type: p.type,
          description: p.description,
          goals: JSON.parse(p.goals) as string[],
        })),
        journeys: journeys.map((j) => ({
          name: j.name,
          description: j.description,
          steps: j.steps.map((s) => ({
            stage: s.stage,
            action: s.action,
            feeling: s.feeling,
          })),
        })),
        painPoints: painPoints.map((p) => ({
          title: p.title,
          description: p.description,
          severity: p.severity,
          category: p.category,
        })),
        principles: principles.map((p) => ({
          name: p.name,
          description: p.description,
        })),
      };

      const response = await chatAboutUx(input.message, uxData);

      // Save assistant response
      await ctx.prisma.uxChatMessage.create({
        data: {
          sessionId: input.sessionId,
          role: "assistant",
          content: response,
          context: JSON.stringify({ dataSnapshot: "included" }),
        },
      });

      return { response };
    }),
});

export type UxRouter = typeof uxRouter;
