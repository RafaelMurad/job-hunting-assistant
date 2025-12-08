/**
 * LaTeX Compilation Service
 *
 * WHY: Convert LaTeX source to PDF without running a local TeX installation.
 * This enables the AI-powered CV editing workflow.
 *
 * WHAT: Uses latexonline.cc free API to compile LaTeX to PDF.
 *
 * HOW: For short documents, uses GET with text parameter.
 *      For long documents, creates a tarball and POSTs to /data endpoint.
 *
 * NOTE: latexonline.cc is a free service with reasonable rate limits.
 * For production, consider self-hosting texlive or using a paid service.
 */

import { gzipSync } from "zlib";

/**
 * LaTeX Online API endpoints
 * @see https://github.com/aslushnikov/latex-online
 */
const LATEX_COMPILE_API = "https://latexonline.cc/compile";
const LATEX_DATA_API = "https://latexonline.cc/data";

// URL length threshold - if exceeded, use tarball upload
const MAX_URL_LENGTH = 6000;

/**
 * Create a minimal tar archive with a single file
 * Returns gzip-compressed tarball (tar.gz format)
 *
 * TAR format: 512-byte header + file content padded to 512 bytes + 1024 bytes of zeros
 * Then compressed with gzip for the API
 */
function createTarball(filename: string, content: string): Buffer {
  const contentBuffer = Buffer.from(content, "utf-8");
  const fileSize = contentBuffer.length;

  // Create 512-byte header
  const header = Buffer.alloc(512, 0);

  // File name (bytes 0-99)
  header.write(filename, 0, 100, "utf-8");

  // File mode: 0644 in octal (bytes 100-107)
  header.write("0000644\0", 100, 8, "utf-8");

  // Owner UID: 0 (bytes 108-115)
  header.write("0000000\0", 108, 8, "utf-8");

  // Owner GID: 0 (bytes 116-123)
  header.write("0000000\0", 116, 8, "utf-8");

  // File size in octal (bytes 124-135)
  const sizeOctal = fileSize.toString(8).padStart(11, "0");
  header.write(sizeOctal + "\0", 124, 12, "utf-8");

  // Modification time: current time in octal (bytes 136-147)
  const mtime = Math.floor(Date.now() / 1000)
    .toString(8)
    .padStart(11, "0");
  header.write(mtime + "\0", 136, 12, "utf-8");

  // Typeflag: '0' for regular file (byte 156)
  header.write("0", 156, 1, "utf-8");

  // Calculate checksum (bytes 148-155) - sum of all header bytes with checksum field as spaces
  header.fill(" ", 148, 156); // Placeholder spaces for checksum calculation
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i]!;
  }
  const checksumOctal = checksum.toString(8).padStart(6, "0");
  header.write(checksumOctal + "\0 ", 148, 8, "utf-8");

  // Pad content to 512-byte boundary
  const paddedContentSize = Math.ceil(fileSize / 512) * 512 || 512;
  const paddedContent = Buffer.alloc(paddedContentSize, 0);
  contentBuffer.copy(paddedContent);

  // End-of-archive marker: two 512-byte blocks of zeros
  const endMarker = Buffer.alloc(1024, 0);

  // Combine: header + padded content + end marker
  const tarBuffer = Buffer.concat([header, paddedContent, endMarker]);

  // Compress with gzip
  return gzipSync(tarBuffer);
}

/**
 * Compile LaTeX source to PDF using latexonline.cc
 *
 * For short documents: Uses GET with text parameter (fast, cached)
 * For long documents: Tries tarball upload, falls back to splitting or error
 *
 * @param latexSource - The complete LaTeX document source
 * @returns Buffer containing the compiled PDF
 * @throws Error if compilation fails
 */
export async function compileLatexToPdf(latexSource: string): Promise<Buffer> {
  // Estimate URL length
  const estimatedUrlLength = LATEX_COMPILE_API.length + encodeURIComponent(latexSource).length + 50;

  // For short documents, use simple GET request (faster, cached)
  if (estimatedUrlLength < MAX_URL_LENGTH) {
    return compileViaGet(latexSource);
  }

  // For long documents, try tarball first, then fall back to GET anyway
  // (the server might accept longer URLs than we expect)
  try {
    return await compileViaTarball(latexSource);
  } catch (tarballError) {
    console.warn("[compileLatexToPdf] Tarball upload failed, trying GET:", tarballError);

    // Try GET anyway - some servers accept longer URLs
    try {
      return await compileViaGet(latexSource);
    } catch {
      // Both failed - throw a helpful error with Overleaf fallback
      throw new LaTeXCompilationError(
        "LaTeX compilation failed. The online compiler may be temporarily unavailable.",
        "Try again later, or use the 'Open in Overleaf' button to compile your CV in Overleaf (free). " +
          "You can then download the PDF from there."
      );
    }
  }
}

/**
 * Compile via GET request (for short documents)
 */
async function compileViaGet(latexSource: string): Promise<Buffer> {
  const url = new URL(LATEX_COMPILE_API);
  url.searchParams.set("text", latexSource);
  url.searchParams.set("command", "pdflatex");
  url.searchParams.set("force", "true");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/pdf",
    },
  });

  return handleCompileResponse(response);
}

/**
 * Compile via tarball POST to /data endpoint (for long documents)
 * Based on the laton CLI: curl -F file=@$tarball "$host/data?target=$target..."
 */
async function compileViaTarball(latexSource: string): Promise<Buffer> {
  // Create a gzip-compressed tarball with the LaTeX file
  const tarball = createTarball("main.tex", latexSource);

  // POST to /data endpoint with the tarball
  // The API expects multipart/form-data with 'file' field
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(tarball)], { type: "application/gzip" }),
    "archive.tar.gz"
  );

  // Use the /data endpoint on texlive2020.latexonline.cc
  const url = new URL(LATEX_DATA_API);
  url.searchParams.set("target", "main.tex");
  url.searchParams.set("command", "pdflatex");
  url.searchParams.set("force", "true");

  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });

  return handleCompileResponse(response);
}

/**
 * Handle compilation response (shared between GET and POST)
 */
async function handleCompileResponse(response: Response): Promise<Buffer> {
  if (!response.ok) {
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
  return `${LATEX_COMPILE_API}?text=${encoded}`;
}

/**
 * Get an "Open in Overleaf" URL for the LaTeX source
 *
 * This is a fallback when online compilation fails.
 * Overleaf will open the LaTeX in their editor where users can compile and download.
 *
 * @see https://www.overleaf.com/devs
 */
export function getOverleafUrl(latexSource: string): string {
  const encoded = encodeURIComponent(latexSource);
  return `https://www.overleaf.com/docs?snip=${encoded}`;
}
