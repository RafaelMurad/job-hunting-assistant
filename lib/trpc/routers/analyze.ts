/**
 * Analyze tRPC Router
 *
 * Handles job analysis and cover letter generation.
 * All procedures require authentication.
 * Uses AI providers from lib/ai.ts.
 */

import { analyzeJob, generateCoverLetter } from "@/lib/ai";
import { protectedProcedure, router } from "@/lib/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Input schemas without userId (comes from session)
const analyzeJobInputSchema = z.object({
  jobDescription: z.string().min(1, "Job description is required"),
});

const generateCoverLetterInputSchema = z.object({
  jobDescription: z.string().min(1),
  analysis: z.object({
    company: z.string(),
    role: z.string(),
    matchScore: z.number(),
    topRequirements: z.array(z.string()),
    skillsMatch: z.array(z.string()),
    gaps: z.array(z.string()),
    redFlags: z.array(z.string()),
    keyPoints: z.array(z.string()),
  }),
});

/**
 * Build CV string from user data for AI analysis.
 */
function buildUserCV(user: {
  name: string;
  email: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}): string {
  return `
Name: ${user.name}
Email: ${user.email}
Location: ${user.location}

Professional Summary:
${user.summary}

Work Experience:
${user.experience}

Skills:
${user.skills}
  `.trim();
}

export const analyzeRouter = router({
  /**
   * Analyze a job description against user's CV.
   * Returns match score, requirements, gaps, etc.
   */
  analyzeJob: protectedProcedure.input(analyzeJobInputSchema).mutation(async ({ ctx, input }) => {
    // Get authenticated user's CV data
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found. Please set up your profile first.",
      });
    }

    // Build CV string and analyze
    const userCV = buildUserCV(user);

    return analyzeJob(input.jobDescription, userCV);
  }),

  /**
   * Generate a cover letter based on job analysis.
   */
  generateCoverLetter: protectedProcedure
    .input(generateCoverLetterInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Get authenticated user's CV data
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please set up your profile first.",
        });
      }

      // Build CV string and generate cover letter
      const userCV = buildUserCV(user);
      const coverLetter = await generateCoverLetter(input.analysis, userCV);

      return { coverLetter };
    }),
});
