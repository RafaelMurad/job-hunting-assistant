/**
 * LaTeX Text Extraction Utilities
 *
 * Extracts plain text from LaTeX documents for semantic processing.
 *
 * @module lib/ai/local/latex-utils
 */

/**
 * Extract plain text content from LaTeX source.
 *
 * Strips LaTeX commands, environments, and comments to extract
 * the actual human-readable content for semantic analysis.
 *
 * @param latex - The raw LaTeX source code
 * @returns Plain text content suitable for embedding
 *
 * @example
 * ```typescript
 * const latex = "\\textbf{John Doe} \\\\ Software Engineer";
 * const text = extractTextFromLatex(latex);
 * // Returns: "John Doe Software Engineer"
 * ```
 */
export function extractTextFromLatex(latex: string): string {
  if (!latex) return "";

  let text = latex;

  // Remove comments (lines starting with %)
  text = text.replace(/%.*/g, "");

  // Remove document class and package declarations
  text = text.replace(/\\documentclass\[[^\]]*\]\{[^}]*\}/g, "");
  text = text.replace(/\\documentclass\{[^}]*\}/g, "");
  text = text.replace(/\\usepackage\[[^\]]*\]\{[^}]*\}/g, "");
  text = text.replace(/\\usepackage\{[^}]*\}/g, "");

  // Remove preamble commands (newcommand, renewcommand, etc.)
  text = text.replace(/\\(new|renew|provide)command\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}/g, "");
  text = text.replace(/\\(new|renew)environment\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}\{[^}]*\}/g, "");

  // Remove begin/end document
  text = text.replace(/\\begin\{document\}/g, "");
  text = text.replace(/\\end\{document\}/g, "");

  // Remove geometry, pagestyle, etc.
  text = text.replace(/\\geometry\{[^}]*\}/g, "");
  text = text.replace(/\\pagestyle\{[^}]*\}/g, "");
  text = text.replace(/\\thispagestyle\{[^}]*\}/g, "");
  text = text.replace(/\\setlength\{[^}]*\}\{[^}]*\}/g, "");

  // Remove hyperref setup
  text = text.replace(/\\hypersetup\{[^}]*\}/g, "");

  // Remove title formatting commands
  text = text.replace(
    /\\titleformat\{[^}]*\}(\[[^\]]*\])?\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}/g,
    ""
  );
  text = text.replace(/\\titlespacing\*?\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}/g, "");

  // Extract content from common text formatting commands
  // \textbf{content}, \textit{content}, \emph{content}, etc.
  text = text.replace(/\\text(bf|it|tt|sc|sl|sf|rm|normal)\{([^}]*)\}/g, "$2");
  text = text.replace(/\\emph\{([^}]*)\}/g, "$1");
  text = text.replace(/\\underline\{([^}]*)\}/g, "$1");

  // Extract section titles
  text = text.replace(/\\(section|subsection|subsubsection)\*?\{([^}]*)\}/g, "\n$2\n");

  // Extract href text (keep the display text)
  text = text.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1");
  text = text.replace(/\\url\{([^}]*)\}/g, "$1");

  // Remove minipage, hfill, vspace, hspace, etc.
  text = text.replace(
    /\\begin\{(minipage|center|flushleft|flushright)\}(\[[^\]]*\])?\{[^}]*\}/g,
    ""
  );
  text = text.replace(/\\end\{(minipage|center|flushleft|flushright)\}/g, "");
  text = text.replace(/\\(hfill|vfill|hspace|vspace)\*?(\{[^}]*\})?/g, " ");
  text = text.replace(
    /\\(small|large|Large|LARGE|huge|Huge|footnotesize|scriptsize|tiny|normalsize)/g,
    ""
  );

  // Remove itemize/enumerate environments but keep item content
  text = text.replace(/\\begin\{(itemize|enumerate|description)\}(\[[^\]]*\])?/g, "");
  text = text.replace(/\\end\{(itemize|enumerate|description)\}/g, "");
  text = text.replace(/\\item(\[[^\]]*\])?/g, "\n• ");

  // Remove tabular environments
  text = text.replace(/\\begin\{tabular\*?\}(\{[^}]*\})?\{[^}]*\}/g, "");
  text = text.replace(/\\end\{tabular\*?\}/g, "");
  text = text.replace(/\\hline/g, "");
  text = text.replace(/\\cline\{[^}]*\}/g, "");

  // Remove font size and other formatting
  text = text.replace(/\\fontsize\{[^}]*\}\{[^}]*\}/g, "");
  text = text.replace(/\\selectfont/g, "");

  // Remove line breaks and special spacing
  text = text.replace(/\\\\/g, " ");
  text = text.replace(/\\newline/g, " ");
  text = text.replace(/\\par/g, "\n");
  text = text.replace(/\\noindent/g, "");
  text = text.replace(/\\indent/g, "");

  // Remove remaining common commands
  text = text.replace(/\\(centering|raggedright|raggedleft)/g, "");
  text = text.replace(/\\(rule|hrule|vrule)(\[[^\]]*\])?\{[^}]*\}\{[^}]*\}/g, "");
  text = text.replace(/\\rule(\[[^\]]*\])?\{[^}]*\}\{[^}]*\}/g, "");

  // Remove color commands
  text = text.replace(/\\color\{[^}]*\}/g, "");
  text = text.replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, "$1");

  // Remove any remaining backslash commands (catch-all)
  text = text.replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, " ");

  // Remove curly braces that are left over
  text = text.replace(/[{}]/g, "");

  // Remove ampersands (table column separators)
  text = text.replace(/&/g, " ");

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, " "); // Multiple spaces to single
  text = text.replace(/\n\s*\n/g, "\n"); // Multiple newlines to single
  text = text.replace(/^\s+|\s+$/gm, ""); // Trim lines

  // Final cleanup
  text = text.trim();

  return text;
}

/**
 * Check if content appears to be LaTeX.
 *
 * @param content - The content to check
 * @returns True if the content appears to be LaTeX
 */
export function isLatexContent(content: string): boolean {
  if (!content) return false;

  // Check for common LaTeX indicators
  const latexPatterns = [
    /\\documentclass/,
    /\\usepackage/,
    /\\begin\{document\}/,
    /\\section\{/,
    /\\textbf\{/,
    /\\item/,
  ];

  return latexPatterns.some((pattern) => pattern.test(content));
}
