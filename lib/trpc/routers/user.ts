/**
 * User tRPC Router
 *
 * Handles user profile operations including CV upload.
 * All procedures require authentication.
 *
 * NOTE: Uses centralized AI config from lib/ai.ts for model version management.
 */

import { parseCVWithGeminiText, parseCVWithGeminiVision } from "@/lib/ai";
import { protectedProcedure, router } from "@/lib/trpc/init";
import { cvUploadSchema, userSchema } from "@/lib/validations/user";
import { TRPCError } from "@trpc/server";
import mammoth from "mammoth";

export const userRouter = router({
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
   * Upload and parse CV (base64 encoded).
   * Accepts PDF or DOCX files and extracts profile data using AI.
   * Uses centralized AI functions from lib/ai.ts
   */
  uploadCV: protectedProcedure.input(cvUploadSchema).mutation(async ({ input }) => {
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
