/**
 * Analyze tRPC Router
 *
 * Handles job analysis and cover letter generation.
 * Uses AI providers from lib/ai.ts.
 */

import { router, publicProcedure } from "@/lib/trpc/init";
import { analyzeJobSchema, generateCoverLetterSchema } from "@/lib/validations/analyze";
import { analyzeJob, generateCoverLetter } from "@/lib/ai";
import { TRPCError } from "@trpc/server";

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
  analyzeJob: publicProcedure.input(analyzeJobSchema).mutation(async ({ ctx, input }) => {
    // Get user's CV data
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found. Please set up your profile first.",
      });
    }

    // Build CV string and analyze
    const userCV = buildUserCV(user);
    const analysis = await analyzeJob(input.jobDescription, userCV);

    return analysis;
  }),

  /**
   * Generate a cover letter based on job analysis.
   */
  generateCoverLetter: publicProcedure
    .input(generateCoverLetterSchema)
    .mutation(async ({ ctx, input }) => {
      // Get user's CV data
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
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
