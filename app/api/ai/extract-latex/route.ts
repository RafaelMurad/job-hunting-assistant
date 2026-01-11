/**
 * AI LaTeX Extraction API Route
 *
 * WHY: Extract LaTeX from CV documents using AI without storing in database.
 * This enables local mode to use AI extraction while storing data in IndexedDB.
 *
 * WHAT: Receive PDF/DOCX/TEX file → Extract LaTeX with AI → Return LaTeX content
 *
 * HOW:
 * 1. Receive file via FormData
 * 2. Validate file type and size
 * 3. Extract LaTeX using AI (Gemini/OpenRouter)
 * 4. Return extracted LaTeX (no database storage)
 */

import {
  AI_CONFIG,
  extractLatexWithModel,
  extractWithTemplate,
  type LatexExtractionModel,
} from "@/lib/ai";
import { type CVTemplateId } from "@/lib/cv-templates";
import { parseAIError } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/extract-latex
 *
 * Extracts LaTeX from a CV file using AI.
 * Does NOT store anything in the database.
 * Works in both local and demo mode.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
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

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    // Extract LaTeX based on file type
    let latexContent: string;
    let modelUsed: LatexExtractionModel | null = null;
    let fallbackUsed = false;

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

    return NextResponse.json({
      success: true,
      latexContent,
      modelUsed,
      fallbackUsed,
      fileName: file.name,
    });
  } catch (error) {
    console.error("LaTeX extraction error:", error);

    // Parse AI-specific errors for better messages
    const aiErrorMessage = parseAIError(error);

    return NextResponse.json({ error: aiErrorMessage }, { status: 500 });
  }
}
