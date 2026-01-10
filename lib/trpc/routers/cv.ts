/**
 * CV tRPC Router
 *
 * Handles CRUD operations for CV documents.
 * Users can have up to 5 CVs, with one marked as "active" for job analysis.
 *
 * NOTE: Prisma accessor is `ctx.prisma.cV` (not `cv`) because the model is named `CV`.
 * TODO: Consider renaming model to `Cv` for cleaner `prisma.cv` accessor.
 */

import { protectedProcedure, router } from "@/lib/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const MAX_CVS_PER_USER = 5;

// Input schemas
const cvCreateSchema = z.object({
  name: z.string().min(1).max(100),
  pdfUrl: z.string().url().optional(),
  latexUrl: z.string().url().optional(),
  latexContent: z.string().optional(),
  isActive: z.boolean().optional().default(false),
});

const cvUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  pdfUrl: z.string().url().optional().nullable(),
  latexUrl: z.string().url().optional().nullable(),
  latexContent: z.string().optional().nullable(),
});

const cvIdSchema = z.object({
  id: z.string().min(1),
});

export const cvRouter = router({
  /**
   * List all CVs for the authenticated user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.cV.findMany({
      where: { userId: ctx.user.id },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });
  }),

  /**
   * Get a single CV by ID.
   * Verifies the CV belongs to the authenticated user.
   */
  get: protectedProcedure.input(cvIdSchema).query(async ({ ctx, input }) => {
    const cv = await ctx.prisma.cV.findFirst({
      where: { id: input.id, userId: ctx.user.id },
    });

    if (!cv) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "CV not found or access denied",
      });
    }

    return cv;
  }),

  /**
   * Get the active CV for the authenticated user.
   * Returns null if no CV is marked as active.
   */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.cV.findFirst({
      where: { userId: ctx.user.id, isActive: true },
    });
  }),

  /**
   * Create a new CV.
   * Enforces maximum of 5 CVs per user.
   * If this is the first CV or isActive is true, sets it as active.
   */
  create: protectedProcedure.input(cvCreateSchema).mutation(async ({ ctx, input }) => {
    // Check CV count limit
    const existingCount = await ctx.prisma.cV.count({
      where: { userId: ctx.user.id },
    });

    if (existingCount >= MAX_CVS_PER_USER) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Maximum of ${MAX_CVS_PER_USER} CVs allowed. Please delete one before adding a new CV.`,
      });
    }

    // If this is the first CV or isActive is true, set as active
    const shouldBeActive = existingCount === 0 || input.isActive;

    // If setting as active, unset any existing active CV
    if (shouldBeActive) {
      await ctx.prisma.cV.updateMany({
        where: { userId: ctx.user.id, isActive: true },
        data: { isActive: false },
      });
    }

    return ctx.prisma.cV.create({
      data: {
        userId: ctx.user.id,
        name: input.name,
        pdfUrl: input.pdfUrl ?? null,
        latexUrl: input.latexUrl ?? null,
        latexContent: input.latexContent ?? null,
        isActive: shouldBeActive,
      },
    });
  }),

  /**
   * Update a CV's content (name, URLs, LaTeX).
   * Verifies the CV belongs to the authenticated user.
   */
  update: protectedProcedure.input(cvUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    // Verify ownership
    const cv = await ctx.prisma.cV.findFirst({
      where: { id, userId: ctx.user.id },
    });

    if (!cv) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "CV not found or access denied",
      });
    }

    // Build update data, only including provided fields
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;
    if (data.latexUrl !== undefined) updateData.latexUrl = data.latexUrl;
    if (data.latexContent !== undefined) updateData.latexContent = data.latexContent;

    return ctx.prisma.cV.update({
      where: { id },
      data: updateData,
    });
  }),

  /**
   * Set a CV as active (for job analysis).
   * Unsets any other active CV for this user.
   */
  setActive: protectedProcedure.input(cvIdSchema).mutation(async ({ ctx, input }) => {
    // Verify ownership
    const cv = await ctx.prisma.cV.findFirst({
      where: { id: input.id, userId: ctx.user.id },
    });

    if (!cv) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "CV not found or access denied",
      });
    }

    // Unset all other active CVs for this user
    await ctx.prisma.cV.updateMany({
      where: { userId: ctx.user.id, isActive: true },
      data: { isActive: false },
    });

    // Set the selected CV as active
    return ctx.prisma.cV.update({
      where: { id: input.id },
      data: { isActive: true },
    });
  }),

  /**
   * Delete a CV.
   * Verifies the CV belongs to the authenticated user.
   * If deleting the active CV and others exist, promotes the most recent one.
   */
  delete: protectedProcedure.input(cvIdSchema).mutation(async ({ ctx, input }) => {
    // Verify ownership
    const cv = await ctx.prisma.cV.findFirst({
      where: { id: input.id, userId: ctx.user.id },
    });

    if (!cv) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "CV not found or access denied",
      });
    }

    const wasActive = cv.isActive;

    // Delete the CV
    await ctx.prisma.cV.delete({
      where: { id: input.id },
    });

    // If we deleted the active CV, promote the most recent remaining one
    if (wasActive) {
      const remainingCV = await ctx.prisma.cV.findFirst({
        where: { userId: ctx.user.id },
        orderBy: { updatedAt: "desc" },
      });

      if (remainingCV) {
        await ctx.prisma.cV.update({
          where: { id: remainingCV.id },
          data: { isActive: true },
        });
      }
    }

    return { success: true };
  }),
});
