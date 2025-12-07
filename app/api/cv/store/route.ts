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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractLatexFromPDF } from "@/lib/ai";
import { uploadCVPdf, uploadCVLatex } from "@/lib/storage";

// FUTURE: Get user from auth session
const DEFAULT_USER_ID = "cm3m6n7z80000uy7k3xqvt8xy";

/**
 * POST /api/cv/store
 *
 * Uploads CV PDF, extracts LaTeX, stores both in Blob storage.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || DEFAULT_USER_ID;

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type - only PDF for LaTeX extraction
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported for the CV editor." },
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
    const pdfBuffer = Buffer.from(bytes);

    try {
      // Step 1: Extract LaTeX from PDF using AI
      const latexContent = await extractLatexFromPDF(pdfBuffer);

      // Step 2: Upload PDF to Blob
      const pdfUrl = await uploadCVPdf(userId, pdfBuffer, file.name);

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
        },
        message: "CV uploaded and LaTeX extracted successfully.",
      });
    } catch (extractError) {
      console.error("[CV Store] Processing error:", extractError);
      return NextResponse.json(
        {
          error:
            extractError instanceof Error
              ? extractError.message
              : "Failed to process CV. Please try again.",
        },
        { status: 500 }
      );
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
 * Retrieve stored CV data for a user.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || DEFAULT_USER_ID;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        cvPdfUrl: true,
        cvLatexUrl: true,
        cvFilename: true,
        cvUploadedAt: true,
      },
    });

    if (!user || !user.cvPdfUrl) {
      return NextResponse.json({ error: "No CV found for this user." }, { status: 404 });
    }

    // Fetch LaTeX content if URL exists
    let latexContent: string | null = null;
    if (user.cvLatexUrl) {
      try {
        const response = await fetch(user.cvLatexUrl);
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
        pdfUrl: user.cvPdfUrl,
        latexUrl: user.cvLatexUrl,
        latexContent,
        filename: user.cvFilename,
        uploadedAt: user.cvUploadedAt,
      },
    });
  } catch (error) {
    console.error("[CV Store] GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve CV data." }, { status: 500 });
  }
}
