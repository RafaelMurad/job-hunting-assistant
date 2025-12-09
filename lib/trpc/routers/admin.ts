/**
 * Admin tRPC Router
 *
 * Handles admin-only operations including trusted user management
 * and authorization checks.
 */

import { z } from "zod";
import { router, publicProcedure, adminProcedure, ownerProcedure } from "../init";
import { TRPCError } from "@trpc/server";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Owner email - has full access to all admin features
 * This should be your email (Rafael)
 */
const OWNER_EMAIL = process.env.OWNER_EMAIL || "rafael@example.com";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const addTrustedEmailSchema = z.object({
  email: z.string().email(),
  role: z.enum(["USER", "ADMIN"]).default("ADMIN"),
  note: z.string().optional(),
});

const removeTrustedEmailSchema = z.object({
  email: z.string().email(),
});

// =============================================================================
// AUTHORIZATION HELPERS
// =============================================================================

/**
 * Check if a user has admin access
 */
async function hasAdminAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  userId: string
): Promise<{ hasAccess: boolean; role: string | null; reason?: string }> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true, isTrusted: true },
  });

  if (!user) {
    return { hasAccess: false, role: null, reason: "User not found" };
  }

  // Owner always has access
  if (user.email === OWNER_EMAIL) {
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

// =============================================================================
// ROUTER
// =============================================================================

export const adminRouter = router({
  /**
   * Check if current user has admin access
   * Public because we need to check before showing admin UI
   */
  checkAccess: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      return { hasAccess: false, role: null, reason: "Not authenticated" };
    }
    return hasAdminAccess(ctx.prisma, ctx.session.user.id);
  }),

  /**
   * Get all trusted emails
   * Only accessible by admins
   */
  getTrustedEmails: adminProcedure.query(async ({ ctx }) => {
    const trustedEmails = await ctx.prisma.trustedEmail.findMany({
      orderBy: { createdAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return trustedEmails.map((entry: any) => ({
      id: entry.id,
      email: entry.email,
      role: entry.role,
      note: entry.note,
      addedBy: entry.addedBy,
      createdAt: entry.createdAt,
    }));
  }),

  /**
   * Add a trusted email
   * Only accessible by owners
   */
  addTrustedEmail: ownerProcedure.input(addTrustedEmailSchema).mutation(async ({ ctx, input }) => {
    // Check if email already exists
    const existing = await ctx.prisma.trustedEmail.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email is already in the trusted list",
      });
    }

    // Add trusted email (use session user's email as addedBy)
    const trustedEmail = await ctx.prisma.trustedEmail.create({
      data: {
        email: input.email,
        role: input.role,
        note: input.note ?? null,
        addedBy: ctx.user.email || ctx.user.id,
      },
    });

    // Also update user if they exist
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (user) {
      await ctx.prisma.user.update({
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
  }),

  /**
   * Remove a trusted email
   * Only accessible by owners
   */
  removeTrustedEmail: ownerProcedure
    .input(removeTrustedEmailSchema)
    .mutation(async ({ ctx, input }) => {
      // Don't allow removing owner email
      if (input.email === OWNER_EMAIL) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove owner from trusted list",
        });
      }

      // Remove from trusted list
      await ctx.prisma.trustedEmail
        .delete({
          where: { email: input.email },
        })
        .catch(() => {
          // Ignore if not found
        });

      // Update user if they exist
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (user) {
        await ctx.prisma.user.update({
          where: { email: input.email },
          data: {
            isTrusted: false,
            role: "USER",
          },
        });
      }

      return { success: true };
    }),

  /**
   * Update user role
   * Only accessible by owners
   */
  updateUserRole: ownerProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        role: z.enum(["USER", "ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the target user
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Don't allow changing owner role
      if (targetUser.email === OWNER_EMAIL) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change owner role",
        });
      }

      // Update role
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      return { success: true };
    }),

  /**
   * Get all users (admin only)
   */
  getUsers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return users.map((user: any) => ({
      ...user,
      isOwner: user.email === OWNER_EMAIL,
    }));
  }),

  /**
   * Get owner email (for display)
   */
  getOwnerEmail: publicProcedure.query(() => {
    return { email: OWNER_EMAIL };
  }),
});
