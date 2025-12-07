/**
 * CV Upload API Route
 *
 * WHY: Users shouldn't have to manually type their entire work history.
 * Uploading a CV and extracting data automatically provides a much better UX.
 *
 * WHAT: This endpoint accepts PDF/DOCX files and uses AI to extract
 * structured profile data (name, email, experience, skills, etc.)
 *
 * HOW:
 * 1. Receive file upload via FormData
 * 2. Validate file type and size
 * 3. For PDFs: Use Gemini vision (native document understanding)
 * 4. For DOCX: Extract text with mammoth, then send to Gemini
 * 5. Return extracted profile data for user review
 *
 * NOTE: Uses centralized AI config from lib/ai.ts for model version management.
 */

import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { parseCVWithGeminiVision, parseCVWithGeminiText } from "@/lib/ai";

/**
 * Extract text from DOCX buffer using mammoth.
 * DOCX files aren't supported by Gemini vision, so we extract text first.
 */
async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * POST /api/cv/upload
 *
 * Accepts a CV file (PDF or DOCX) and returns extracted profile data.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      let profileData;

      if (file.type === "application/pdf") {
        // PDF: Use centralized Gemini vision function
        profileData = await parseCVWithGeminiVision(buffer);
      } else {
        // DOCX: Extract text first, then use centralized Gemini text function
        const docxText = await extractFromDOCX(buffer);

        if (!docxText || docxText.trim().length < 50) {
          return NextResponse.json(
            {
              error:
                "Could not extract enough text from the DOCX file. Please ensure it contains readable text.",
            },
            { status: 400 }
          );
        }

        profileData = await parseCVWithGeminiText(docxText);
      }

      return NextResponse.json({
        success: true,
        data: profileData,
        message: "CV parsed successfully. Please review the extracted data.",
      });
    } catch (extractError) {
      console.error("[CV Upload] Processing error:", extractError);
      return NextResponse.json(
        {
          error: "Failed to parse CV. Please try again or enter details manually.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[CV Upload] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
