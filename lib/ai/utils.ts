/**
 * AI Module Utilities
 *
 * Shared utility functions for AI providers.
 * This file should not import from providers to avoid circular dependencies.
 */

// =============================================================================
// LATEX UTILITIES
// =============================================================================

/**
 * Clean and validate LaTeX output from any AI model.
 * Removes markdown code blocks and validates document structure.
 */
export function cleanAndValidateLatex(rawLatex: string): string {
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

// =============================================================================
// JSON UTILITIES
// =============================================================================

/**
 * Clean JSON response from AI models by removing markdown code blocks.
 */
export function cleanJsonResponse(response: string): string {
  return response
    .replace(/^```(?:json)?\n?/gi, "")
    .replace(/\n?```$/gi, "")
    .trim();
}

/**
 * Extract JSON object from text response.
 * Useful when AI returns JSON embedded in other text.
 */
export function extractJsonFromText(text: string): string | null {
  const match = text.match(/{[\s\S]*}/);
  return match ? match[0] : null;
}
