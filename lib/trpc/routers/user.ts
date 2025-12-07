/**
 * User tRPC Router
 *
 * Handles user profile operations including CV upload.
 * MVP: Single user mode (no auth).
 *
 * NOTE: Uses centralized AI config from lib/ai.ts for model version management.
 */

import { router, publicProcedure } from "@/lib/trpc/init";
import { userSchema, cvUploadSchema } from "@/lib/validations/user";
import { parseCVWithGeminiVision, parseCVWithGeminiText } from "@/lib/ai";
import { TRPCError } from "@trpc/server";
import mammoth from "mammoth";

export const userRouter = router({
  /**
   * Get user profile.
   * Returns the first (and only) user for MVP.
   */
  get: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst();
    return { user };
  }),

  /**
   * Create or update user profile.
   * Uses upsert pattern for MVP simplicity.
   */
  upsert: publicProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
    // Check if user exists
    const existingUser = await ctx.prisma.user.findFirst();

    if (existingUser) {
      // Update existing user
      const user = await ctx.prisma.user.update({
        where: { id: existingUser.id },
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
    } else {
      // Create new user
      const user = await ctx.prisma.user.create({
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
      return { user, created: true };
    }
  }),

  /**
   * Upload and parse CV (base64 encoded).
   * Accepts PDF or DOCX files and extracts profile data using AI.
   * Uses centralized AI functions from lib/ai.ts
   */
  uploadCV: publicProcedure.input(cvUploadSchema).mutation(async ({ input }) => {
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
