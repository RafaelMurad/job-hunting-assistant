/**
 * LaTeX Compilation Service
 *
 * WHY: Convert LaTeX source to PDF without running a local TeX installation.
 * This enables the AI-powered CV editing workflow.
 *
 * WHAT: Uses latexonline.cc free API to compile LaTeX to PDF.
 *
 * HOW: Send LaTeX source to the API, receive compiled PDF buffer.
 *
 * NOTE: latexonline.cc is a free service with reasonable rate limits.
 * For production, consider self-hosting texlive or using a paid service.
 */

/**
 * LaTeX Online API endpoint
 * @see https://latexonline.cc/
 */
const LATEX_ONLINE_API = "https://latexonline.cc/compile";

/**
 * Compile LaTeX source to PDF using latexonline.cc
 *
 * @param latexSource - The complete LaTeX document source
 * @returns Buffer containing the compiled PDF
 * @throws Error if compilation fails
 */
export async function compileLatexToPdf(latexSource: string): Promise<Buffer> {
  // Use URL-encoded POST for the LaTeX source
  const params = new URLSearchParams();
  params.append("text", latexSource);

  const response = await fetch(LATEX_ONLINE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    // Try to get error message from response
    const errorText = await response.text();
    throw new LaTeXCompilationError(
      `LaTeX compilation failed: ${response.status} ${response.statusText}`,
      errorText
    );
  }

  // Check content type to ensure we got a PDF
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/pdf")) {
    const errorText = await response.text();
    throw new LaTeXCompilationError("LaTeX compilation returned non-PDF content", errorText);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Custom error class for LaTeX compilation errors
 */
export class LaTeXCompilationError extends Error {
  public readonly compilerOutput: string;

  constructor(message: string, compilerOutput: string) {
    super(message);
    this.name = "LaTeXCompilationError";
    this.compilerOutput = compilerOutput;
  }
}

/**
 * Validate LaTeX source before compilation
 *
 * @param latexSource - The LaTeX source to validate
 * @returns Object with validation result and any issues found
 */
export function validateLatexSource(latexSource: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for required elements
  if (!latexSource.includes("\\documentclass")) {
    issues.push("Missing \\documentclass declaration");
  }

  if (!latexSource.includes("\\begin{document}")) {
    issues.push("Missing \\begin{document}");
  }

  if (!latexSource.includes("\\end{document}")) {
    issues.push("Missing \\end{document}");
  }

  // Check for balanced braces (simple check)
  const openBraces = (latexSource.match(/{/g) || []).length;
  const closeBraces = (latexSource.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`);
  }

  // Check for common typos in commands
  const commonTypos = [
    { wrong: "\\documnetclass", right: "\\documentclass" },
    { wrong: "\\beign{", right: "\\begin{" },
    { wrong: "\\ned{", right: "\\end{" },
  ];

  for (const typo of commonTypos) {
    if (latexSource.includes(typo.wrong)) {
      issues.push(`Possible typo: "${typo.wrong}" should be "${typo.right}"`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Get a preview URL for LaTeX compilation (useful for client-side preview)
 *
 * Note: This creates a GET URL which has size limits.
 * For larger documents, use compileLatexToPdf instead.
 */
export function getLatexPreviewUrl(latexSource: string): string {
  const encoded = encodeURIComponent(latexSource);
  return `${LATEX_ONLINE_API}?text=${encoded}`;
}
