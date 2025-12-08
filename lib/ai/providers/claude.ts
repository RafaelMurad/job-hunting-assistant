/**
 * Claude (Anthropic) Provider
 *
 * Anthropic Claude integration for job analysis, cover letters, and LaTeX extraction.
 */

import { AI_CONFIG } from "../config";
import type { JobAnalysisResult } from "../types";
import { ANALYSIS_PROMPT, COVER_LETTER_PROMPT, LATEX_EXTRACTION_PROMPT } from "../prompts";

// =============================================================================
// JOB ANALYSIS
// =============================================================================

export async function analyzeWithClaude(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const Anthropic = await import("@anthropic-ai/sdk");

  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  });

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: ANALYSIS_PROMPT(jobDescription, userCV),
      },
    ],
  });

  const content = response.content[0];
  if (!content) {
    throw new Error("No response from Claude");
  }
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonText = content.text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(jsonText) as JobAnalysisResult;
}

// =============================================================================
// COVER LETTER GENERATION
// =============================================================================

export async function generateCoverLetterWithClaude(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const Anthropic = await import("@anthropic-ai/sdk");

  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  });

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: COVER_LETTER_PROMPT(analysis, userCV),
      },
    ],
  });

  const content = response.content[0];
  if (!content) {
    throw new Error("No response from Claude");
  }
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text.trim();
}

// =============================================================================
// LATEX EXTRACTION
// =============================================================================

/**
 * Extract LaTeX using Claude Sonnet vision
 */
export async function extractLatexWithClaude(
  base64Data: string,
  _mimeType: string
): Promise<string> {
  const Anthropic = await import("@anthropic-ai/sdk");

  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  });

  // Claude expects specific media types for documents
  // For PDFs, we use the document block type
  const mediaType = "application/pdf" as const;

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: LATEX_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return cleanLatexResponse(textContent.text);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Clean and validate LaTeX output
 */
function cleanLatexResponse(rawLatex: string): string {
  let latex = rawLatex.trim();

  // Remove any markdown code blocks if present
  latex = latex.replace(/^```(?:latex|tex)?\n?/gi, "").replace(/\n?```$/gi, "");

  // Try to find the documentclass if it's not at the start
  const docClassIndex = latex.indexOf("\\documentclass");
  if (docClassIndex > 0) {
    latex = latex.substring(docClassIndex);
  }

  // Try to find \end{document} and trim anything after
  const endDocIndex = latex.indexOf("\\end{document}");
  if (endDocIndex > 0) {
    latex = latex.substring(0, endDocIndex + "\\end{document}".length);
  }

  // Validate it has required elements
  if (!latex.includes("\\documentclass")) {
    throw new Error(
      "AI did not return valid LaTeX (missing \\documentclass). Please try uploading again."
    );
  }

  if (!latex.includes("\\end{document}")) {
    throw new Error(
      "AI returned incomplete LaTeX (missing \\end{document}). " +
        "Your document may be too long. Try a shorter version."
    );
  }

  return latex;
}
