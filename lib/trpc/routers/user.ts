/**
 * User tRPC Router
 *
 * Handles user profile operations including CV upload.
 * MVP: Single user mode (no auth).
 */

import { router, publicProcedure } from "@/lib/trpc/init";
import { userSchema, cvUploadSchema } from "@/lib/validations/user";
import { TRPCError } from "@trpc/server";
import mammoth from "mammoth";

/**
 * Parsed CV data structure.
 */
interface ParsedCV {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

/**
 * Type for Gemini content parts.
 */
type GeminiPart = { inline_data: { mime_type: string; data: string } } | { text: string };

/**
 * The prompt for CV parsing.
 */
const CV_EXTRACTION_PROMPT = `You are a CV/Resume parser. Analyze this CV and extract the following information as a valid JSON object.

Required fields (use empty string "" if not found):
- name: Full name of the person
- email: Email address  
- phone: Phone number (include country code if present)
- location: City, Country or full address
- summary: Professional summary or objective (2-3 sentences). If not explicitly stated, create one based on their experience.
- experience: Work history formatted as "Company | Role (Start - End)\\n- Achievement 1\\n- Achievement 2\\n\\n" for each job. Most recent first.
- skills: Comma-separated list of skills, technologies, and tools mentioned

Return ONLY the JSON object, no markdown code blocks, no explanation.`;

/**
 * Call Gemini API and parse response.
 */
async function callGeminiAndParse(parts: GeminiPart[]): Promise<ParsedCV> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CV Upload] Gemini API error:", errorText);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to parse CV with AI",
    });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const jsonMatch = text.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    console.error("[CV Upload] Could not parse JSON from:", text);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not parse AI response",
    });
  }

  return JSON.parse(jsonMatch[0]) as ParsedCV;
}

/**
 * Parse PDF with Gemini vision.
 */
async function parseWithGeminiVision(base64Data: string): Promise<ParsedCV> {
  return callGeminiAndParse([
    { inline_data: { mime_type: "application/pdf", data: base64Data } },
    { text: CV_EXTRACTION_PROMPT },
  ]);
}

/**
 * Parse DOCX text with Gemini.
 */
async function parseWithGeminiText(cvText: string): Promise<ParsedCV> {
  return callGeminiAndParse([
    { text: `${CV_EXTRACTION_PROMPT}\n\nCV Text:\n${cvText.substring(0, 15000)}` },
  ]);
}

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
   */
  uploadCV: publicProcedure.input(cvUploadSchema).mutation(async ({ input }) => {
    const { contentBase64, mimeType } = input;

    try {
      let extractedData: ParsedCV;

      if (mimeType === "application/pdf") {
        // PDF: Send directly to Gemini vision
        extractedData = await parseWithGeminiVision(contentBase64);
      } else {
        // DOCX: Extract text first, then send to Gemini
        const buffer = Buffer.from(contentBase64, "base64");
        const result = await mammoth.extractRawText({ buffer });
        const docxText = result.value;

        if (!docxText || docxText.trim().length < 50) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not extract enough text from the DOCX file.",
          });
        }

        extractedData = await parseWithGeminiText(docxText);
      }

      return {
        success: true,
        extractedData,
        message: "CV parsed successfully. Please review the extracted data.",
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      console.error("[CV Upload] Processing error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to parse CV. Please try again or enter details manually.",
      });
    }
  }),
});
