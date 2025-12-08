/**
 * AI LaTeX Utilities Tests
 *
 * Tests for LaTeX cleaning and validation.
 */

import { describe, it, expect } from "vitest";
import { cleanAndValidateLatex } from "@/lib/ai/utils";

describe("AI LaTeX Utilities", () => {
  describe("cleanAndValidateLatex", () => {
    const validLatex = String.raw`\documentclass[10pt]{article}
\usepackage[utf8]{inputenc}
\begin{document}
Hello, World!
\end{document}`;

    it("should pass through valid LaTeX unchanged", () => {
      const result = cleanAndValidateLatex(validLatex);
      expect(result).toContain("\\documentclass");
      expect(result).toContain("\\end{document}");
    });

    it("should trim whitespace from input", () => {
      const withWhitespace = `
      
      ${validLatex}
      
      `;
      const result = cleanAndValidateLatex(withWhitespace);
      expect(result.startsWith("\\documentclass")).toBe(true);
    });

    it("should remove markdown latex code blocks", () => {
      const withCodeBlock = "```latex\n" + validLatex + "\n```";
      const result = cleanAndValidateLatex(withCodeBlock);
      expect(result).not.toContain("```");
      expect(result).toContain("\\documentclass");
    });

    it("should remove markdown tex code blocks", () => {
      const withCodeBlock = "```tex\n" + validLatex + "\n```";
      const result = cleanAndValidateLatex(withCodeBlock);
      expect(result).not.toContain("```");
      expect(result).toContain("\\documentclass");
    });

    it("should remove plain markdown code blocks", () => {
      const withCodeBlock = "```\n" + validLatex + "\n```";
      const result = cleanAndValidateLatex(withCodeBlock);
      expect(result).not.toContain("```");
    });

    it("should extract LaTeX from text with preamble", () => {
      const withPreamble = "Here is the LaTeX document:\n\n" + validLatex + "\n\nThis is the end.";
      const result = cleanAndValidateLatex(withPreamble);
      expect(result.startsWith("\\documentclass")).toBe(true);
      expect(result.endsWith("\\end{document}")).toBe(true);
    });

    it("should trim content after end{document}", () => {
      const withSuffix = validLatex + "\n\nSome extra text after";
      const result = cleanAndValidateLatex(withSuffix);
      expect(result.endsWith("\\end{document}")).toBe(true);
      expect(result).not.toContain("extra text");
    });

    it("should throw on missing documentclass", () => {
      const noDocClass = String.raw`\begin{document}
Hello
\end{document}`;

      expect(() => cleanAndValidateLatex(noDocClass)).toThrow(
        "AI did not return valid LaTeX (missing \\documentclass)"
      );
    });

    it("should throw on missing end{document}", () => {
      const noEndDoc = String.raw`\documentclass{article}
\begin{document}
Hello`;

      expect(() => cleanAndValidateLatex(noEndDoc)).toThrow(
        "AI returned incomplete LaTeX (missing \\end{document})"
      );
    });

    it("should throw on empty input", () => {
      expect(() => cleanAndValidateLatex("")).toThrow("missing \\documentclass");
    });

    it("should throw on just whitespace", () => {
      expect(() => cleanAndValidateLatex("   \n\n   ")).toThrow("missing \\documentclass");
    });

    it("should throw on random text", () => {
      expect(() => cleanAndValidateLatex("This is not LaTeX")).toThrow("missing \\documentclass");
    });

    it("should handle complex LaTeX with many packages", () => {
      const complexLatex = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{titlesec}
\usepackage{enumitem}

\geometry{margin=0.5in}
\hypersetup{colorlinks=true,urlcolor=blue}

\begin{document}

\section{Experience}
\begin{itemize}
\item Did something
\item Did something else
\end{itemize}

\end{document}`;

      const result = cleanAndValidateLatex(complexLatex);
      expect(result).toContain("\\usepackage");
      expect(result).toContain("\\section{Experience}");
    });

    it("should handle LaTeX with special characters", () => {
      const withSpecialChars = String.raw`\documentclass{article}
\begin{document}
Special chars: \& \% \$ \# \_ \{ \}
Math: $x^2 + y^2 = z^2$
\end{document}`;

      const result = cleanAndValidateLatex(withSpecialChars);
      expect(result).toContain("\\&");
      expect(result).toContain("$x^2");
    });

    it("should handle case-insensitive code block markers", () => {
      const upperCase = "```LATEX\n" + validLatex + "\n```";
      const result = cleanAndValidateLatex(upperCase);
      expect(result).not.toContain("```");
      expect(result).toContain("\\documentclass");
    });

    it("should preserve nested braces", () => {
      const withNestedBraces = String.raw`\documentclass{article}
\begin{document}
\newcommand{\test}[1]{\textbf{#1}}
\test{Hello}
\end{document}`;

      const result = cleanAndValidateLatex(withNestedBraces);
      expect(result).toContain("\\newcommand");
      expect(result).toContain("{\\textbf{#1}}");
    });

    it("should handle multi-line document with environments", () => {
      const multiEnv = String.raw`\documentclass{article}
\begin{document}
\begin{center}
Title
\end{center}
\begin{tabular}{ll}
A & B \\
C & D \\
\end{tabular}
\end{document}`;

      const result = cleanAndValidateLatex(multiEnv);
      expect(result).toContain("\\begin{center}");
      expect(result).toContain("\\begin{tabular}");
      expect(result).toContain("\\end{tabular}");
    });
  });
});
