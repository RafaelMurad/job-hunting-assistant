/**
 * User tRPC Router
 *
 * Handles user profile operations including CV upload.
 * All procedures require authentication.
 *
 * NOTE: Uses centralized AI config from lib/ai.ts for model version management.
 */

import { parseCVWithGeminiText, parseCVWithGeminiVision } from "@/lib/ai";
import { protectedProcedure, publicProcedure, router, uploadProcedure } from "@/lib/trpc/init";
import { changePasswordSchema, credentialsSignUpSchema } from "@/lib/validations/auth";
import { cvUploadSchema, userSchema } from "@/lib/validations/user";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import mammoth from "mammoth";

export const userRouter = router({
  /**
   * Create a new user with email/password (Credentials auth).
   * Public because the user is not authenticated yet.
   */
  signUpWithCredentials: publicProcedure
    .input(credentialsSignUpSchema)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();

      const existing = await ctx.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account already exists for this email.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email,
          name: input.name,
          passwordHash,
          passwordUpdatedAt: new Date(),
          image: null,
          location: "",
          summary: "",
          experience: "",
          skills: "",
          isVerified: false,
        },
        select: { id: true, email: true },
      });

      return { success: true, user };
    }),
  /**
   * Get current user's profile.
   * Returns the authenticated user's data.
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });
    return { user };
  }),

  /**
   * Update current user's profile.
   * Uses the authenticated user's ID from session.
   */
  upsert: protectedProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
    // Update user profile (user already exists from auth)
    const user = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        location: input.location,
        summary: input.summary,
        experience: input.experience,
        skills: input.skills,
      },
    });
    return { user, created: false };
  }),

  /**
   * Change the current user's password (Credentials accounts only).
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { passwordHash: true },
      });

      if (!user?.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This account does not have a password. Use social login instead.",
        });
      }

      const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!ok) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Current password is incorrect.",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          passwordHash,
          passwordUpdatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Upload and parse CV (base64 encoded).
   * Accepts PDF or DOCX files and extracts profile data using AI.
   * Uses centralized AI functions from lib/ai.ts
   */
  uploadCV: uploadProcedure.input(cvUploadSchema).mutation(async ({ input }) => {
    const { contentBase64, mimeType } = input;
    const buffer = Buffer.from(contentBase64, "base64");

    // Handle DOCX: Check text extraction before try-catch to avoid exception for control flow
    if (mimeType !== "application/pdf") {
      const result = await mammoth.extractRawText({ buffer });
      const docxText = result.value;

      if (!docxText || docxText.trim().length < 50) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not extract enough text from the DOCX file.",
        });
      }

      try {
        const extractedData = await parseCVWithGeminiText(docxText);
        return {
          success: true,
          extractedData,
          message: "CV parsed successfully. Please review the extracted data.",
        };
      } catch (error) {
        console.error("[CV Upload] DOCX processing error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse CV. Please try again or enter details manually.",
        });
      }
    }

    // Handle PDF
    try {
      const extractedData = await parseCVWithGeminiVision(buffer);
      return {
        success: true,
        extractedData,
        message: "CV parsed successfully. Please review the extracted data.",
      };
    } catch (error) {
      console.error("[CV Upload] PDF processing error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to parse CV. Please try again or enter details manually.",
      });
    }
  }),
});
