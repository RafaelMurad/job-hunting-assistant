/**
 * Social Integration tRPC Router
 *
 * Handles social profile management, sync operations, and integration status.
 */

import { z } from "zod";
import { router, publicProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import {
  githubProvider,
  linkedInProvider,
  decryptToken,
  isTokenExpired,
  encryptToken,
  isProviderConfigured,
  getConfiguredProviders,
  type IntegrationStatus,
  type SyncResult,
} from "@/lib/social";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const providerSchema = z.enum(["GITHUB", "LINKEDIN"]);

const syncInputSchema = z.object({
  userId: z.string().min(1),
  provider: providerSchema,
  syncType: z.enum(["profile", "repos", "jobs", "languages"]).optional(),
});

const disconnectInputSchema = z.object({
  userId: z.string().min(1),
  provider: providerSchema,
});

// =============================================================================
// ROUTER
// =============================================================================

export const socialRouter = router({
  /**
   * Get all connected social integrations for a user
   */
  getIntegrations: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }): Promise<IntegrationStatus[]> => {
      const profiles = await ctx.prisma.socialProfile.findMany({
        where: { userId: input.userId },
        select: {
          provider: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          lastSyncAt: true,
          syncStatus: true,
        },
      });

      // Get configured providers
      const configuredProviders = getConfiguredProviders();

      // Build status for all providers
      const statuses: IntegrationStatus[] = [];

      // GitHub
      if (configuredProviders.includes("github")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const githubProfile = profiles.find((p: any) => p.provider === "GITHUB");
        statuses.push({
          provider: "github",
          connected: !!githubProfile,
          username: githubProfile?.username ?? undefined,
          displayName: githubProfile?.displayName ?? undefined,
          avatarUrl: githubProfile?.avatarUrl ?? undefined,
          lastSyncAt: githubProfile?.lastSyncAt ?? undefined,
          syncStatus: (githubProfile?.syncStatus?.toLowerCase() as
            | "pending"
            | "in_progress"
            | "completed"
            | "failed") ?? undefined,
        });
      }

      // LinkedIn
      if (configuredProviders.includes("linkedin")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const linkedInProfile = profiles.find((p: any) => p.provider === "LINKEDIN");
        statuses.push({
          provider: "linkedin",
          connected: !!linkedInProfile,
          username: linkedInProfile?.username ?? undefined,
          displayName: linkedInProfile?.displayName ?? undefined,
          avatarUrl: linkedInProfile?.avatarUrl ?? undefined,
          lastSyncAt: linkedInProfile?.lastSyncAt ?? undefined,
          syncStatus: (linkedInProfile?.syncStatus?.toLowerCase() as
            | "pending"
            | "in_progress"
            | "completed"
            | "failed") ?? undefined,
        });
      }

      return statuses;
    }),

  /**
   * Get detailed social profile data
   */
  getProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        provider: providerSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.socialProfile.findUnique({
        where: {
          userId_provider: {
            userId: input.userId,
            provider: input.provider,
          },
        },
      });

      if (!profile) {
        return null;
      }

      // Parse profile data
      const profileData = profile.profileData
        ? (JSON.parse(profile.profileData) as Record<string, unknown>)
        : null;

      return {
        provider: profile.provider,
        providerId: profile.providerId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        lastSyncAt: profile.lastSyncAt,
        syncStatus: profile.syncStatus,
        profileData,
      };
    }),

  /**
   * Disconnect a social integration
   */
  disconnect: publicProcedure.input(disconnectInputSchema).mutation(async ({ ctx, input }) => {
    const profile = await ctx.prisma.socialProfile.findUnique({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: input.provider,
        },
      },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Social profile not found",
      });
    }

    // Try to revoke the token
    try {
      const accessToken = decryptToken(profile.accessToken);
      const provider = input.provider === "GITHUB" ? githubProvider : linkedInProvider;
      await provider.revokeToken(accessToken);
    } catch (error) {
      // Log but don't fail - token might already be invalid
      console.warn(`[Social] Failed to revoke ${input.provider} token:`, error);
    }

    // Delete the profile
    await ctx.prisma.socialProfile.delete({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: input.provider,
        },
      },
    });

    // Log the disconnect
    await ctx.prisma.socialSync.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        syncType: "disconnect",
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return { success: true };
  }),

  /**
   * Sync data from a connected social provider
   */
  sync: publicProcedure.input(syncInputSchema).mutation(async ({ ctx, input }): Promise<SyncResult> => {
    const profile = await ctx.prisma.socialProfile.findUnique({
      where: {
        userId_provider: {
          userId: input.userId,
          provider: input.provider,
        },
      },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Social profile not connected",
      });
    }

    // Decrypt access token
    const accessToken = decryptToken(profile.accessToken);

    // Check if token is expired
    if (isTokenExpired(profile.tokenExpiry, 5 * 60 * 1000)) {
      // For LinkedIn, try to refresh
      if (input.provider === "LINKEDIN" && profile.refreshToken) {
        try {
          const refreshToken = decryptToken(profile.refreshToken);
          const newTokens = await linkedInProvider.refreshToken(refreshToken);

          await ctx.prisma.socialProfile.update({
            where: { id: profile.id },
            data: {
              accessToken: encryptToken(newTokens.accessToken),
              refreshToken: newTokens.refreshToken
                ? encryptToken(newTokens.refreshToken)
                : profile.refreshToken,
              tokenExpiry: newTokens.expiresAt,
            },
          });
        } catch {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session expired. Please reconnect your LinkedIn account.",
          });
        }
      } else if (input.provider === "GITHUB") {
        // GitHub tokens don't expire but may be revoked
        const isValid = await githubProvider.validateToken(accessToken);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session expired. Please reconnect your GitHub account.",
          });
        }
      }
    }

    // Update sync status to in_progress
    await ctx.prisma.socialProfile.update({
      where: { id: profile.id },
      data: { syncStatus: "IN_PROGRESS" },
    });

    // Create sync record
    const syncRecord = await ctx.prisma.socialSync.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        syncType: input.syncType || "profile",
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    try {
      let itemsFound = 0;
      let itemsSynced = 0;

      if (input.provider === "GITHUB") {
        // Sync GitHub repositories
        const repos = await githubProvider.fetchRepositories(accessToken);
        itemsFound = repos.length;

        // Store repositories
        for (const repo of repos) {
          await ctx.prisma.gitHubRepository.upsert({
            where: {
              userId_repoId: {
                userId: input.userId,
                repoId: repo.id,
              },
            },
            create: {
              userId: input.userId,
              repoId: repo.id,
              name: repo.name,
              fullName: repo.full_name,
              description: repo.description,
              url: repo.html_url,
              homepage: repo.homepage,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              watchers: repo.watchers_count,
              openIssues: repo.open_issues_count,
              language: repo.language,
              topics: repo.topics?.join(","),
              isPrivate: repo.private,
              isFork: repo.fork,
              pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
            },
            update: {
              name: repo.name,
              fullName: repo.full_name,
              description: repo.description,
              url: repo.html_url,
              homepage: repo.homepage,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              watchers: repo.watchers_count,
              openIssues: repo.open_issues_count,
              language: repo.language,
              topics: repo.topics?.join(","),
              isPrivate: repo.private,
              isFork: repo.fork,
              pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
            },
          });
          itemsSynced++;
        }

        // Fetch aggregated languages
        const languages = await githubProvider.fetchAggregatedLanguages(accessToken, repos);

        // Update profile with aggregated data
        await ctx.prisma.socialProfile.update({
          where: { id: profile.id },
          data: {
            profileData: JSON.stringify({
              ...JSON.parse(profile.profileData || "{}"),
              languages,
              repoCount: repos.length,
              topLanguages: Object.entries(languages)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([lang]) => lang),
            }),
            lastSyncAt: new Date(),
            syncStatus: "COMPLETED",
          },
        });
      }

      // Update sync record
      await ctx.prisma.socialSync.update({
        where: { id: syncRecord.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          itemsFound,
          itemsSynced,
        },
      });

      return {
        success: true,
        syncType: input.syncType || "profile",
        itemsFound,
        itemsSynced,
      };
    } catch (error) {
      // Update sync record with error
      await ctx.prisma.socialSync.update({
        where: { id: syncRecord.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: error instanceof Error ? error.message : String(error),
        },
      });

      await ctx.prisma.socialProfile.update({
        where: { id: profile.id },
        data: { syncStatus: "FAILED" },
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Sync failed",
        cause: error,
      });
    }
  }),

  /**
   * Get GitHub repositories for a user
   */
  getGitHubRepos: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const repos = await ctx.prisma.gitHubRepository.findMany({
        where: { userId: input.userId },
        orderBy: { stars: "desc" },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        url: repo.url,
        homepage: repo.homepage,
        stars: repo.stars,
        forks: repo.forks,
        language: repo.language,
        topics: repo.topics?.split(",").filter(Boolean) || [],
        isPrivate: repo.isPrivate,
        isFork: repo.isFork,
        pushedAt: repo.pushedAt,
      }));
    }),

  /**
   * Get sync history for a user
   */
  getSyncHistory: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        provider: providerSchema.optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const syncs = await ctx.prisma.socialSync.findMany({
        where: {
          userId: input.userId,
          ...(input.provider ? { provider: input.provider } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return syncs.map((sync: any) => ({
        id: sync.id,
        provider: sync.provider,
        syncType: sync.syncType,
        status: sync.status,
        startedAt: sync.startedAt,
        completedAt: sync.completedAt,
        itemsFound: sync.itemsFound,
        itemsSynced: sync.itemsSynced,
        error: sync.error,
      }));
    }),

  /**
   * Check which providers are configured (have API credentials)
   */
  getConfiguredProviders: publicProcedure.query(() => {
    return {
      github: isProviderConfigured("github"),
      linkedin: isProviderConfigured("linkedin"),
    };
  }),
});
