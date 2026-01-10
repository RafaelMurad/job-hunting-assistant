/**
 * CV Storage API Route
 *
 * WHY: Store the original CV PDF and extracted LaTeX for editing.
 * This enables the AI-powered CV editing workflow.
 *
 * WHAT: Upload CV PDF → Extract LaTeX with AI → Store both in Blob → Return URLs
 *
 * HOW:
 * 1. Receive PDF upload via FormData
 * 2. Extract LaTeX from PDF using AI
 * 3. Store both PDF and LaTeX in Vercel Blob
 * 4. Update user record with file URLs
 * 5. Return the URLs for immediate use
 */

import {
  AI_CONFIG,
  extractLatexWithModel,
  extractWithTemplate,
  type LatexExtractionModel,
} from "@/lib/ai";
import { getNeonSession } from "@/lib/auth/neon-server";
import { type CVTemplateId } from "@/lib/cv-templates";
import { prisma } from "@/lib/db";
import { deleteCVFiles, uploadCVLatex, uploadCVPdf } from "@/lib/storage";
import { parseAIError } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/cv/store
 *
 * Uploads CV PDF, extracts LaTeX, stores both in Blob storage.
 * Requires authentication.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication via Neon Auth
    const session = await getNeonSession();
    const user = session?.data?.user;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = user.id;
    const selectedModel =
      (formData.get("model") as LatexExtractionModel) || AI_CONFIG.defaultLatexModel;
    const selectedTemplate = formData.get("template") as CVTemplateId | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Supported file types
    const supportedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "text/x-tex", // .tex
      "application/x-tex", // .tex (alternative MIME)
    ];
    const fileName = file.name.toLowerCase();
    const isTexFile = fileName.endsWith(".tex");
    const isDocxFile =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // Validate file type - PDF, DOCX, or TEX
    if (!supportedTypes.includes(file.type) && !isTexFile) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Please upload a PDF, DOCX, or TEX file.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    try {
      // Step 1: Extract or read LaTeX based on file type
      let latexContent: string;
      let modelUsed: LatexExtractionModel | null = null;
      let fallbackUsed = false;
      let extractedContent: unknown = null; // Store JSON content for template switching

      if (isTexFile) {
        // .tex files: use content directly (no AI needed)
        latexContent = fileBuffer.toString("utf-8");

        // Validate it's valid LaTeX
        if (!latexContent.includes("\\documentclass")) {
          return NextResponse.json(
            { error: "Invalid LaTeX file: missing \\documentclass" },
            { status: 400 }
          );
        }
      } else if (selectedTemplate) {
        // Template-based extraction: extract content to JSON, then apply template
        const mimeType = isDocxFile
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf";

        const result = await extractWithTemplate(
          fileBuffer,
          mimeType,
          selectedTemplate,
          selectedModel
        );
        latexContent = result.latex;
        modelUsed = result.modelUsed;
        fallbackUsed = result.fallbackUsed;
        extractedContent = result.content; // Save for potential template switching
      } else {
        // Legacy mode: extract LaTeX directly with AI (preserves original styling)
        const mimeType = isDocxFile
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/pdf";

        const result = await extractLatexWithModel(fileBuffer, mimeType, selectedModel);
        latexContent = result.latex;
        modelUsed = result.modelUsed;
        fallbackUsed = result.fallbackUsed;
      }

      // Step 2: Upload original file to Blob (for reference)
      const pdfUrl = await uploadCVPdf(userId, fileBuffer, file.name);

      // Step 3: Upload LaTeX to Blob
      const latexUrl = await uploadCVLatex(userId, latexContent);

      // Step 4: Update user record
      await prisma.user.update({
        where: { id: userId },
        data: {
          cvPdfUrl: pdfUrl,
          cvLatexUrl: latexUrl,
          cvFilename: file.name,
          cvUploadedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          pdfUrl,
          latexUrl,
          latexContent,
          filename: file.name,
          modelUsed,
          fallbackUsed,
          templateId: selectedTemplate,
          extractedContent, // Include JSON content for template switching
        },
        message: "CV uploaded and LaTeX extracted successfully.",
      });
    } catch (extractError) {
      console.error("[CV Store] Processing error:", extractError);

      // Parse the error into a user-friendly message
      const userMessage = parseAIError(extractError);

      return NextResponse.json({ error: userMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("[CV Store] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cv/store
 *
 * Retrieve stored CV data for the authenticated user.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication via Neon Auth
    const session = await getNeonSession();
    const neonUser = session?.data?.user;
    if (!neonUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = neonUser.id;

    const appUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        cvPdfUrl: true,
        cvLatexUrl: true,
        cvFilename: true,
        cvUploadedAt: true,
      },
    });

    if (!appUser || !appUser.cvPdfUrl) {
      // Return empty data instead of 404 for better UX
      return NextResponse.json({
        success: true,
        data: {
          pdfUrl: null,
          latexUrl: null,
          latexContent: null,
          filename: null,
          uploadedAt: null,
        },
      });
    }

    // Fetch LaTeX content if URL exists
    let latexContent: string | null = null;
    if (appUser.cvLatexUrl) {
      try {
        const response = await fetch(appUser.cvLatexUrl);
        if (response.ok) {
          latexContent = await response.text();
        }
      } catch {
        console.error("[CV Store] Failed to fetch LaTeX content");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl: appUser.cvPdfUrl,
        latexUrl: appUser.cvLatexUrl,
        latexContent,
        filename: appUser.cvFilename,
        uploadedAt: appUser.cvUploadedAt,
      },
    });
  } catch (error) {
    console.error("[CV Store] GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve CV data." }, { status: 500 });
  }
}

/**
 * DELETE /api/cv/store
 *
 * Delete stored CV data for the authenticated user.
 */
export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication via Neon Auth
    const session = await getNeonSession();
    const neonUser = session?.data?.user;
    if (!neonUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = neonUser.id;

    // Delete files from Blob storage
    await deleteCVFiles(userId);

    // Clear user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        cvPdfUrl: null,
        cvLatexUrl: null,
        cvFilename: null,
        cvUploadedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "CV deleted successfully.",
    });
  } catch (error) {
    console.error("[CV Store] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete CV." }, { status: 500 });
  }
}
