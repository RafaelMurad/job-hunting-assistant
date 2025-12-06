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
 * 3. For PDFs: Send directly to Gemini (native document vision)
 * 4. For DOCX: Extract text with mammoth, then send to Gemini
 * 5. Return extracted profile data for user review
 *
 * LEARNING: Gemini has native PDF understanding - it can "see" the document
 * layout, not just extract text. This is more accurate than text extraction
 * libraries and works perfectly in serverless environments.
 */

import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

/**
 * Extract text from DOCX buffer using mammoth.
 * DOCX files aren't supported by Gemini vision, so we extract text first.
 */
async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * The prompt we send to Gemini for CV parsing.
 * Shared between PDF (with document) and DOCX (with text).
 */
const CV_EXTRACTION_PROMPT = `You are a CV/Resume parser. Analyze this CV and extract the following information as a valid JSON object.

Required fields (use empty string "" if not found):
- name: Full name of the person
- email: Email address  
- phone: Phone number (include country code if present)
- location: City, Country or full address
- summary: Professional summary or objective (2-3 sentences). If not explicitly stated, create one based on their experience.
- experience: Work history formatted as "Company | Role (Start - End)\\n- Achievement 1\\n- Achievement 2\\n\\n" for each job. Most recent first.
- skills: Comma-separated list of skills, technologies, and tools mentioned

Return ONLY the JSON object, no markdown code blocks, no explanation.`;

/**
 * Parse CV using Gemini with native PDF vision.
 * Sends the PDF directly to Gemini - no text extraction needed.
 */
async function parseWithGeminiVision(pdfBuffer: Buffer): Promise<{
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}> {
  const base64Data = pdfBuffer.toString("base64");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64Data,
                },
              },
              {
                text: CV_EXTRACTION_PROMPT,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CV Upload] Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse JSON from response (remove any markdown code blocks if present)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[CV Upload] Could not parse JSON from:", text);
    throw new Error("Could not parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Parse CV using Gemini with extracted text (for DOCX files).
 */
async function parseWithGeminiText(cvText: string): Promise<{
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${CV_EXTRACTION_PROMPT}\n\nCV Text:\n${cvText.substring(0, 15000)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CV Upload] Gemini API error:", errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[CV Upload] Could not parse JSON from:", text);
    throw new Error("Could not parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
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
        // PDF: Send directly to Gemini vision (native document understanding)
        profileData = await parseWithGeminiVision(buffer);
      } else {
        // DOCX: Extract text first, then send to Gemini
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

        profileData = await parseWithGeminiText(docxText);
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
