/**
 * LaTeX Compilation API Route
 *
 * WHY: Convert LaTeX source to PDF without client-side TeX installation.
 *
 * WHAT: Receive LaTeX → Compile via latexonline.cc → Return PDF or upload to Blob
 *
 * HOW: Uses lib/latex.ts for compilation, optionally stores result in Blob.
 */

import { NextRequest, NextResponse } from "next/server";
import { compileLatexToPdf, validateLatexSource, LaTeXCompilationError } from "@/lib/latex";
import { uploadCVPdf, uploadCVLatex } from "@/lib/storage";
import { prisma } from "@/lib/db";

// TODO: Replace DEFAULT_USER_ID with auth session user
// Auth is now available via: import { auth } from "@/lib/auth";
const DEFAULT_USER_ID = "cmiw9gfmv0000uj7ska14xors";

/**
 * POST /api/cv/compile
 *
 * Compile LaTeX to PDF. Optionally save to Blob and update user record.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { latexContent, save = false, userId = DEFAULT_USER_ID } = body;

    if (!latexContent || typeof latexContent !== "string") {
      return NextResponse.json({ error: "LaTeX content is required" }, { status: 400 });
    }

    // Validate LaTeX before compilation
    const validation = validateLatexSource(latexContent);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid LaTeX source",
          issues: validation.issues,
        },
        { status: 400 }
      );
    }

    try {
      // Compile LaTeX to PDF
      const pdfBuffer = await compileLatexToPdf(latexContent);

      if (save) {
        // Save both LaTeX and compiled PDF to Blob
        const [pdfUrl, latexUrl] = await Promise.all([
          uploadCVPdf(userId, pdfBuffer),
          uploadCVLatex(userId, latexContent),
        ]);

        // Update user record
        await prisma.user.update({
          where: { id: userId },
          data: {
            cvPdfUrl: pdfUrl,
            cvLatexUrl: latexUrl,
            cvUploadedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          saved: true,
          pdfUrl,
          latexUrl,
          message: "LaTeX compiled and saved successfully.",
        });
      }

      // Return PDF as base64 for preview (not saved)
      const pdfBase64 = pdfBuffer.toString("base64");

      return NextResponse.json({
        success: true,
        saved: false,
        pdfBase64,
        message: "LaTeX compiled successfully.",
      });
    } catch (compileError) {
      if (compileError instanceof LaTeXCompilationError) {
        return NextResponse.json(
          {
            error: "LaTeX compilation failed",
            compilerOutput: compileError.compilerOutput,
          },
          { status: 400 }
        );
      }
      throw compileError;
    }
  } catch (error) {
    console.error("[CV Compile] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Compilation failed",
      },
      { status: 500 }
    );
  }
}
