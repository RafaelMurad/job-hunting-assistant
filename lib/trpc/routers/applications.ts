/**
 * Applications tRPC Router
 *
 * Handles CRUD operations for job applications.
 */

import { router, publicProcedure } from "@/lib/trpc/init";
import {
  applicationCreateSchema,
  applicationUpdateSchema,
  applicationListSchema,
  applicationDeleteSchema,
} from "@/lib/validations/application";

export const applicationsRouter = router({
  /**
   * List all applications for a user.
   */
  list: publicProcedure.input(applicationListSchema).query(async ({ ctx, input }) => {
    return ctx.prisma.application.findMany({
      where: { userId: input.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Create a new application.
   */
  create: publicProcedure.input(applicationCreateSchema).mutation(async ({ ctx, input }) => {
    return ctx.prisma.application.create({
      data: {
        userId: input.userId,
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
   */
  update: publicProcedure.input(applicationUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id, status, notes } = input;

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
   */
  delete: publicProcedure.input(applicationDeleteSchema).mutation(async ({ ctx, input }) => {
    await ctx.prisma.application.delete({
      where: { id: input.id },
    });

    return { success: true };
  }),
});
