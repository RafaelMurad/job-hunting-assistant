/**
 * NextAuth.js Configuration
 *
 * Provides authentication via OAuth providers (GitHub, Google).
 * Uses Prisma adapter for database-backed sessions.
 *
 * @see https://authjs.dev/getting-started/installation
 */

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
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
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      // Only request basic profile info for auth (not repo access)
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
     * Creates user profile fields if needed
     */
    async signIn({ user, profile: _profile }) {
      // Allow sign in
      if (!user.email) {
        return false; // Reject if no email
      }

      // Check if user exists - if so, ensure they have required fields
      // For new users, NextAuth's Prisma adapter creates them automatically
      // but our schema requires name/location/summary/experience/skills
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        // New user - we need to create with required fields
        // The adapter will try to create, but we need defaults
        // We'll handle this by creating the user ourselves
        try {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? _profile?.name ?? "New User",
              image: user.image ?? null,
              location: "", // Required field - user should complete profile
              summary: "",
              experience: "",
              skills: "",
              role: "USER",
              isTrusted: false,
              isVerified: true, // OAuth users are email-verified
            },
          });
        } catch {
          // User might already exist from race condition, that's OK
        }
      }

      return true;
    },
  },

  // Enable debug logging in development
  debug: process.env.NODE_ENV === "development",
});
