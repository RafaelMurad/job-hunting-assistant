/**
 * CV Upload API Route
 *
 * WHY: Users shouldn't have to manually type their entire work history.
 * Uploading a CV and extracting data automatically provides a much better UX.
 *
 * WHAT: This endpoint accepts PDF/DOCX files, extracts text, and uses AI
 * to parse structured profile data (name, email, experience, skills, etc.)
 *
 * HOW:
 * 1. Receive file upload via FormData
 * 2. Validate file type and size
 * 3. Extract text using pdf-parse or mammoth
 * 4. Send text to AI for structured extraction
 * 5. Return extracted profile data for user review
 */

import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error - pdf-parse doesn't have proper ESM exports
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

// AI provider imports
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";

/**
 * Extract text from PDF buffer
 */
async function extractFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

/**
 * Extract text from DOCX buffer
 */
async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Use AI to extract structured profile data from CV text
 */
async function extractProfileWithAI(cvText: string): Promise<{
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}> {
  const prompt = `You are a CV/Resume parser. Extract the following information from this CV text and return it as a valid JSON object.

Required fields (use empty string "" if not found):
- name: Full name of the person
- email: Email address
- phone: Phone number
- location: City, Country or full address
- summary: Professional summary or objective (2-3 sentences). If not explicitly stated, create one based on their experience.
- experience: Work history formatted as "Company | Role (Start - End)\\n- Achievement 1\\n- Achievement 2\\n\\n" for each job
- skills: Comma-separated list of skills, technologies, and tools mentioned

Return ONLY the JSON object, no markdown, no explanation.

CV Text:
${cvText.substring(0, 8000)}`;

  if (AI_PROVIDER === "gemini") {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (remove any markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    return JSON.parse(jsonMatch[0]);
  }

  // Fallback for other providers - return empty structure
  throw new Error(`AI provider "${AI_PROVIDER}" not supported for CV extraction`);
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

    // Extract text based on file type
    let extractedText: string;
    try {
      if (file.type === "application/pdf") {
        extractedText = await extractFromPDF(buffer);
      } else {
        extractedText = await extractFromDOCX(buffer);
      }
    } catch (extractError) {
      console.error("[CV Upload] Text extraction error:", extractError);
      return NextResponse.json(
        { error: "Failed to extract text from file. Please ensure the file is not corrupted." },
        { status: 400 }
      );
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from the file. Please ensure it contains readable text.",
        },
        { status: 400 }
      );
    }

    // Extract profile data using AI
    try {
      const profileData = await extractProfileWithAI(extractedText);

      return NextResponse.json({
        success: true,
        data: profileData,
        message: "CV parsed successfully. Please review the extracted data.",
      });
    } catch (aiError) {
      console.error("[CV Upload] AI extraction error:", aiError);
      return NextResponse.json(
        {
          error: "Failed to parse CV with AI. Please try again or enter details manually.",
          rawText: extractedText.substring(0, 1000) + "...", // Return partial text for debugging
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
