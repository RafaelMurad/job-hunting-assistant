/**
 * Account Management tRPC Router
 *
 * Provides account-level actions for the signed-in user:
 * - List sign-in methods
 * - Unlink OAuth providers (NextAuth Account rows)
 * - Export user data
 * - Delete account (DB + CV blobs)
 */

import { deleteCVFiles } from "@/lib/storage";
import { decryptToken, githubProvider, linkedInProvider } from "@/lib/social";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../init";

const unlinkProviderSchema = z.object({
  provider: z.string().min(1),
});

export const accountRouter = router({
  /**
   * Sign-in methods available for the current user.
   */
  getSignInMethods: protectedProcedure.query(async ({ ctx }) => {
    const [user, accounts] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { passwordHash: true },
      }),
      ctx.prisma.account.findMany({
        where: { userId: ctx.user.id },
        select: { provider: true },
      }),
    ]);

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const providers = Array.from(new Set(accounts.map((a) => a.provider))).sort();

    return {
      hasPassword: !!user.passwordHash,
      providers,
    };
  }),

  /**
   * Unlink an OAuth provider for the current user.
   *
   * Safety check: user must keep at least one sign-in method.
   */
  unlinkProvider: protectedProcedure
    .input(unlinkProviderSchema)
    .mutation(async ({ ctx, input }) => {
      const [user, accounts] = await Promise.all([
        ctx.prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: { passwordHash: true },
        }),
        ctx.prisma.account.findMany({
          where: { userId: ctx.user.id },
          select: { provider: true },
        }),
      ]);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const providers = Array.from(new Set(accounts.map((a) => a.provider)));
      const hasProvider = providers.includes(input.provider);

      if (!hasProvider) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Provider is not linked to this account",
        });
      }

      const remainingProviders = providers.filter((p) => p !== input.provider);
      const hasPassword = !!user.passwordHash;

      if (remainingProviders.length === 0 && !hasPassword) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must keep at least one sign-in method",
        });
      }

      await ctx.prisma.account.deleteMany({
        where: { userId: ctx.user.id, provider: input.provider },
      });

      return { success: true };
    }),

  /**
   * Export user data (privacy-safe; no tokens or password hashes).
   */
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [
      user,
      userAuth,
      accounts,
      applications,
      socialProfiles,
      githubRepos,
      githubStats,
      githubOrgs,
      linkedinJobs,
    ] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          summary: true,
          experience: true,
          skills: true,
          cvPdfUrl: true,
          cvLatexUrl: true,
          cvFilename: true,
          cvUploadedAt: true,
          role: true,
          isTrusted: true,
          isVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true, passwordUpdatedAt: true },
      }),
      ctx.prisma.account.findMany({
        where: { userId },
        select: {
          provider: true,
          providerAccountId: true,
          type: true,
        },
        orderBy: { provider: "asc" },
      }),
      ctx.prisma.application.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      ctx.prisma.socialProfile.findMany({
        where: { userId },
        select: {
          provider: true,
          providerId: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          profileUrl: true,
          bio: true,
          company: true,
          location: true,
          blog: true,
          hireable: true,
          publicRepos: true,
          publicGists: true,
          followers: true,
          following: true,
          accountCreatedAt: true,
          lastSyncAt: true,
          syncStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      ctx.prisma.gitHubRepository.findMany({
        where: { userId },
        orderBy: { pushedAt: "desc" },
      }),
      ctx.prisma.gitHubContributionStats.findUnique({
        where: { userId },
      }),
      ctx.prisma.gitHubOrganization.findMany({
        where: { userId },
        orderBy: { login: "asc" },
      }),
      ctx.prisma.linkedInSavedJob.findMany({
        where: { userId },
        orderBy: { savedAt: "desc" },
      }),
    ]);

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      exportedAt: new Date(),
      user,
      signIn: {
        oauthProviders: accounts,
        hasPassword: !!userAuth?.passwordHash,
        passwordUpdatedAt: userAuth?.passwordUpdatedAt ?? null,
      },
      applications,
      socialProfiles,
      github: {
        contributionStats: githubStats,
        repositories: githubRepos,
        organizations: githubOrgs,
      },
      linkedin: {
        savedJobs: linkedinJobs,
      },
    };
  }),

  /**
   * Permanently delete the current user account.
   *
   * Order is important:
   * - Delete CV blobs first (privacy)
   * - Delete non-related user tables explicitly (no FK relations)
   * - Delete User (cascades accounts/sessions/applications/social rows)
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const profiles = await ctx.prisma.socialProfile.findMany({
      where: { userId },
      select: { provider: true, accessToken: true },
    });

    // Best-effort token revocation; never block deletion.
    await Promise.all(
      profiles.map(async (profile) => {
        try {
          const accessToken = decryptToken(profile.accessToken);
          const provider = profile.provider === "GITHUB" ? githubProvider : linkedInProvider;
          await provider.revokeToken(accessToken);
        } catch {
          // ignore
        }
      })
    );

    try {
      await deleteCVFiles(userId);
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not delete your CV files. Please try again.",
      });
    }

    await ctx.prisma.$transaction(async (tx) => {
      await tx.gitHubRepository.deleteMany({ where: { userId } });
      await tx.gitHubOrganization.deleteMany({ where: { userId } });
      await tx.gitHubContributionStats.deleteMany({ where: { userId } });
      await tx.linkedInSavedJob.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return { success: true };
  }),
});
