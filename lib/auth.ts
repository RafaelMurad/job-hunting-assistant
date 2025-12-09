/**
 * NextAuth.js Configuration
 *
 * Provides authentication via OAuth providers (GitHub, Google, LinkedIn).
 * Uses Prisma adapter for database-backed sessions.
 *
 * @see https://authjs.dev/getting-started/installation
 */

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { encryptToken } from "@/lib/social";
import type { UserRole } from "@prisma/client";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      isTrusted: boolean;
    };
  }

  interface User {
    role?: UserRole;
    isTrusted?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
      // Allow linking LinkedIn to existing account with same email
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      // Only request basic profile info for auth (not repo access)
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      // Allow linking GitHub to existing account with same email
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Allow linking Google to existing account with same email
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  // Use JWT strategy for better performance (no DB lookup on every request)
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page with error
  },

  callbacks: {
    /**
     * JWT callback - called when JWT is created or updated
     * Add user role and trust status to the token
     */
    async jwt({ token, user, trigger }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
        token.isTrusted = user.isTrusted ?? false;
      }

      // On session update, refresh user data from database
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isTrusted: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isTrusted = dbUser.isTrusted;
        }
      }

      return token;
    },

    /**
     * Session callback - called when session is checked
     * Expose user role and trust status to the client
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isTrusted = token.isTrusted as boolean;
      }
      return session;
    },

    /**
     * SignIn callback - validate user can sign in
     * Handles automatic account linking for same email
     * Creates/updates SocialProfile for GitHub users to enable data sync
     */
    async signIn({ user, account, profile: _profile }) {
      // Reject if no email
      if (!user.email) {
        return false;
      }

      // Check if user exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      let targetUserId: string | undefined;

      if (existingUser) {
        targetUserId = existingUser.id;

        // User exists - check if this OAuth provider is already linked
        const existingAccount = existingUser.accounts.find(
          (acc) => acc.provider === account?.provider
        );

        if (!existingAccount && account) {
          // Auto-link this new OAuth provider to existing user
          // This allows signing in with GitHub OR Google to same account
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              expires_at: account.expires_at ?? null,
            },
          });
        }

        // Update user image if they don't have one
        if (!existingUser.image && user.image) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { image: user.image },
          });
        }
      } else {
        // New user - create with required fields
        try {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? _profile?.name ?? "New User",
              image: user.image ?? null,
              location: "", // User should complete profile
              summary: "",
              experience: "",
              skills: "",
              role: "USER",
              isTrusted: false,
              isVerified: true, // OAuth users are email-verified
            },
          });
          targetUserId = newUser.id;
        } catch {
          // User might exist from race condition, that's OK
          const raceUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          });
          targetUserId = raceUser?.id;
        }
      }

      // Create/update SocialProfile for GitHub users
      // This stores the access token and enables enhanced data sync
      if (account?.provider === "github" && account.access_token && targetUserId) {
        const githubProfile = _profile as unknown as {
          id?: number;
          login?: string;
          name?: string;
          avatar_url?: string;
          html_url?: string;
          bio?: string;
          company?: string;
          location?: string;
          blog?: string;
          hireable?: boolean;
          public_repos?: number;
          public_gists?: number;
          followers?: number;
          following?: number;
          created_at?: string;
        };

        try {
          await prisma.socialProfile.upsert({
            where: {
              userId_provider: {
                userId: targetUserId,
                provider: "GITHUB",
              },
            },
            create: {
              userId: targetUserId,
              provider: "GITHUB",
              providerId: String(githubProfile?.id ?? account.providerAccountId),
              accessToken: encryptToken(account.access_token),
              scope: account.scope ?? null,
              username: githubProfile?.login ?? null,
              displayName: githubProfile?.name ?? githubProfile?.login ?? null,
              avatarUrl: githubProfile?.avatar_url ?? null,
              profileUrl: githubProfile?.html_url ?? null,
              bio: githubProfile?.bio ?? null,
              company: githubProfile?.company ?? null,
              location: githubProfile?.location ?? null,
              blog: githubProfile?.blog ?? null,
              hireable: githubProfile?.hireable ?? null,
              publicRepos: githubProfile?.public_repos ?? null,
              publicGists: githubProfile?.public_gists ?? null,
              followers: githubProfile?.followers ?? null,
              following: githubProfile?.following ?? null,
              accountCreatedAt: githubProfile?.created_at
                ? new Date(githubProfile.created_at)
                : null,
              lastSyncAt: new Date(),
              syncStatus: "COMPLETED",
            },
            update: {
              accessToken: encryptToken(account.access_token),
              scope: account.scope ?? null,
              username: githubProfile?.login ?? null,
              displayName: githubProfile?.name ?? githubProfile?.login ?? null,
              avatarUrl: githubProfile?.avatar_url ?? null,
              profileUrl: githubProfile?.html_url ?? null,
              bio: githubProfile?.bio ?? null,
              company: githubProfile?.company ?? null,
              location: githubProfile?.location ?? null,
              blog: githubProfile?.blog ?? null,
              hireable: githubProfile?.hireable ?? null,
              publicRepos: githubProfile?.public_repos ?? null,
              publicGists: githubProfile?.public_gists ?? null,
              followers: githubProfile?.followers ?? null,
              following: githubProfile?.following ?? null,
              accountCreatedAt: githubProfile?.created_at
                ? new Date(githubProfile.created_at)
                : null,
              lastSyncAt: new Date(),
              syncStatus: "COMPLETED",
            },
          });
        } catch (error) {
          // Log but don't fail auth if social profile creation fails
          console.warn("[Auth] Failed to create GitHub social profile:", error);
        }
      }

      return true;
    },
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
});
