/**
 * Social Integration tRPC Router
 *
 * Handles social profile management, sync operations, and integration status.
 * Most procedures require authentication, except getConfiguredProviders.
 */

import {
  decryptToken,
  encryptToken,
  getConfiguredProviders,
  githubProvider,
  isProviderConfigured,
  isTokenExpired,
  linkedInProvider,
  type IntegrationStatus,
  type SyncResult,
} from "@/lib/social";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../init";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const providerSchema = z.enum(["GITHUB", "LINKEDIN"]);

const syncInputSchema = z.object({
  provider: providerSchema,
  syncType: z.enum(["profile", "repos", "jobs", "languages"]).optional(),
});

const disconnectInputSchema = z.object({
  provider: providerSchema,
});

// =============================================================================
// ROUTER
// =============================================================================

export const socialRouter = router({
  /**
   * Get all connected social integrations for the authenticated user
   */
  getIntegrations: protectedProcedure.query(async ({ ctx }): Promise<IntegrationStatus[]> => {
    const profiles = await ctx.prisma.socialProfile.findMany({
      where: { userId: ctx.user.id },
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
      const githubProfile = profiles.find((p) => p.provider === "GITHUB");
      statuses.push({
        provider: "github",
        connected: !!githubProfile,
        username: githubProfile?.username ?? undefined,
        displayName: githubProfile?.displayName ?? undefined,
        avatarUrl: githubProfile?.avatarUrl ?? undefined,
        lastSyncAt: githubProfile?.lastSyncAt ?? undefined,
        syncStatus:
          (githubProfile?.syncStatus?.toLowerCase() as
            | "pending"
            | "in_progress"
            | "completed"
            | "failed") ?? undefined,
      });
    }

    // LinkedIn
    if (configuredProviders.includes("linkedin")) {
      const linkedInProfile = profiles.find((p) => p.provider === "LINKEDIN");
      statuses.push({
        provider: "linkedin",
        connected: !!linkedInProfile,
        username: linkedInProfile?.username ?? undefined,
        displayName: linkedInProfile?.displayName ?? undefined,
        avatarUrl: linkedInProfile?.avatarUrl ?? undefined,
        lastSyncAt: linkedInProfile?.lastSyncAt ?? undefined,
        syncStatus:
          (linkedInProfile?.syncStatus?.toLowerCase() as
            | "pending"
            | "in_progress"
            | "completed"
            | "failed") ?? undefined,
      });
    }

    return statuses;
  }),

  /**
   * Get detailed social profile data for the authenticated user
   */
  getProfile: protectedProcedure
    .input(
      z.object({
        provider: providerSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.socialProfile.findUnique({
        where: {
          userId_provider: {
            userId: ctx.user.id,
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
   * Disconnect a social integration for the authenticated user
   */
  disconnect: protectedProcedure.input(disconnectInputSchema).mutation(async ({ ctx, input }) => {
    const profile = await ctx.prisma.socialProfile.findUnique({
      where: {
        userId_provider: {
          userId: ctx.user.id,
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
          userId: ctx.user.id,
          provider: input.provider,
        },
      },
    });

    // Log the disconnect
    await ctx.prisma.socialSync.create({
      data: {
        userId: ctx.user.id,
        provider: input.provider,
        syncType: "disconnect",
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return { success: true };
  }),

  /**
   * Sync data from a connected social provider for the authenticated user
   */
  sync: protectedProcedure
    .input(syncInputSchema)
    .mutation(async ({ ctx, input }): Promise<SyncResult> => {
      const profile = await ctx.prisma.socialProfile.findUnique({
        where: {
          userId_provider: {
            userId: ctx.user.id,
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
                tokenExpiry: newTokens.expiresAt ?? null,
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
          userId: ctx.user.id,
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

          // Fetch enhanced profile data
          const enhancedProfile = await githubProvider.fetchEnhancedProfile(accessToken);

          // Fetch organizations
          const organizations = await githubProvider.fetchOrganizations(accessToken);

          // Calculate contribution stats
          const contributionStats = await githubProvider.calculateContributionStats(
            accessToken,
            repos
          );

          // Store repositories with enhanced data
          for (const repo of repos) {
            await ctx.prisma.gitHubRepository.upsert({
              where: {
                userId_repoId: {
                  userId: ctx.user.id,
                  repoId: repo.id,
                },
              },
              create: {
                userId: ctx.user.id,
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
                isArchived: repo.archived ?? false,
                license: repo.license?.spdx_id ?? null,
                defaultBranch: repo.default_branch ?? null,
                pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
                repoCreatedAt: repo.created_at ? new Date(repo.created_at) : null,
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
                isArchived: repo.archived ?? false,
                license: repo.license?.spdx_id ?? null,
                defaultBranch: repo.default_branch ?? null,
                pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
                repoCreatedAt: repo.created_at ? new Date(repo.created_at) : null,
              },
            });
            itemsSynced++;
          }

          // Store organizations
          for (const org of organizations) {
            await ctx.prisma.gitHubOrganization.upsert({
              where: {
                userId_orgId: {
                  userId: ctx.user.id,
                  orgId: org.id,
                },
              },
              create: {
                userId: ctx.user.id,
                orgId: org.id,
                login: org.login,
                name: org.name ?? null,
                description: org.description,
                url: org.html_url,
                avatarUrl: org.avatar_url,
              },
              update: {
                login: org.login,
                name: org.name ?? null,
                description: org.description,
                url: org.html_url,
                avatarUrl: org.avatar_url,
              },
            });
          }

          // Update or create contribution stats
          await ctx.prisma.gitHubContributionStats.upsert({
            where: { userId: ctx.user.id },
            create: {
              userId: ctx.user.id,
              totalRepos: contributionStats.totalRepos,
              ownedRepos: contributionStats.ownedRepos,
              forkedRepos: contributionStats.forkedRepos,
              openSourceRepos: contributionStats.openSourceRepos,
              languageBytes: JSON.stringify(contributionStats.languageBytes),
              topLanguages: contributionStats.topLanguages.join(","),
              oldestRepoDate: contributionStats.oldestRepoDate
                ? new Date(contributionStats.oldestRepoDate)
                : null,
              newestRepoDate: contributionStats.newestRepoDate
                ? new Date(contributionStats.newestRepoDate)
                : null,
              lastPushDate: contributionStats.lastPushDate
                ? new Date(contributionStats.lastPushDate)
                : null,
              lastCalculated: new Date(),
            },
            update: {
              totalRepos: contributionStats.totalRepos,
              ownedRepos: contributionStats.ownedRepos,
              forkedRepos: contributionStats.forkedRepos,
              openSourceRepos: contributionStats.openSourceRepos,
              languageBytes: JSON.stringify(contributionStats.languageBytes),
              topLanguages: contributionStats.topLanguages.join(","),
              oldestRepoDate: contributionStats.oldestRepoDate
                ? new Date(contributionStats.oldestRepoDate)
                : null,
              newestRepoDate: contributionStats.newestRepoDate
                ? new Date(contributionStats.newestRepoDate)
                : null,
              lastPushDate: contributionStats.lastPushDate
                ? new Date(contributionStats.lastPushDate)
                : null,
              lastCalculated: new Date(),
            },
          });

          // Fetch aggregated languages
          const languages = await githubProvider.fetchAggregatedLanguages(accessToken, repos);

          // Update profile with enhanced data
          await ctx.prisma.socialProfile.update({
            where: { id: profile.id },
            data: {
              // Enhanced profile fields
              bio: enhancedProfile.bio,
              company: enhancedProfile.company,
              location: enhancedProfile.location,
              blog: enhancedProfile.blog,
              hireable: enhancedProfile.hireable,
              publicRepos: enhancedProfile.public_repos,
              publicGists: enhancedProfile.public_gists,
              followers: enhancedProfile.followers,
              following: enhancedProfile.following,
              accountCreatedAt: enhancedProfile.created_at
                ? new Date(enhancedProfile.created_at)
                : null,
              // Aggregated data in profileData JSON
              profileData: JSON.stringify({
                ...JSON.parse(profile.profileData || "{}"),
                languages,
                repoCount: repos.length,
                topLanguages: Object.entries(languages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([lang]) => lang),
                organizationCount: organizations.length,
                organizations: organizations.map((o) => o.login),
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
   * Get GitHub repositories for the authenticated user
   */
  getGitHubRepos: protectedProcedure.query(async ({ ctx }) => {
    const repos = await ctx.prisma.gitHubRepository.findMany({
      where: { userId: ctx.user.id },
      orderBy: { stars: "desc" },
    });

    return repos.map((repo) => ({
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
   * Get sync history for the authenticated user
   */
  getSyncHistory: protectedProcedure
    .input(
      z.object({
        provider: providerSchema.optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const syncs = await ctx.prisma.socialSync.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.provider ? { provider: input.provider } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return syncs.map((sync) => ({
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
