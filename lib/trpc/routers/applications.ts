/**
 * Applications tRPC Router
 *
 * Handles CRUD operations for job applications.
 * All procedures require authentication.
 */

import { protectedProcedure, router } from "@/lib/trpc/init";
import { z } from "zod";

// Input schemas without userId (comes from session)
const applicationCreateSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().min(1),
  jobUrl: z.string().url().optional().nullable(),
  matchScore: z.number().min(0).max(100).optional(),
  analysis: z.string().optional(),
  coverLetter: z.string().optional(),
  status: z.enum(["saved", "applied", "interviewing", "offer", "rejected"]).optional(),
});

const applicationUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["saved", "applied", "interviewing", "offer", "rejected"]).optional(),
  notes: z.string().optional(),
});

const applicationDeleteSchema = z.object({
  id: z.string().min(1),
});

export const applicationsRouter = router({
  /**
   * List all applications for the authenticated user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.application.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Create a new application for the authenticated user.
   */
  create: protectedProcedure.input(applicationCreateSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.application.create({
      data: {
        userId: ctx.user.id,
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
  }),

  /**
   * Update an application (status, notes).
   * Verifies the application belongs to the authenticated user.
   */
  update: protectedProcedure.input(applicationUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id, status, notes } = input;

    // Verify ownership
    const application = await ctx.prisma.application.findFirst({
      where: { id, userId: ctx.user.id },
    });

    if (!application) {
      throw new Error("Application not found or access denied");
    }

    return ctx.prisma.application.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === "applied" && { appliedAt: new Date() }),
      },
    });
  }),

  /**
   * Delete an application.
   * Verifies the application belongs to the authenticated user.
   */
  delete: protectedProcedure.input(applicationDeleteSchema).mutation(async ({ ctx, input }) => {
    // Verify ownership
    const application = await ctx.prisma.application.findFirst({
      where: { id: input.id, userId: ctx.user.id },
    });

    if (!application) {
      throw new Error("Application not found or access denied");
    }

    await ctx.prisma.application.delete({
      where: { id: input.id },
    });

    return { success: true };
  }),
});
