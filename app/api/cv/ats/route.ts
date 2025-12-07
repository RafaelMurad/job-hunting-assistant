/**
 * ATS Compliance Analysis API Route
 *
 * WHY: Help users optimize their CV for Applicant Tracking Systems.
 *
 * WHAT: Analyze LaTeX CV for ATS compatibility issues and suggestions.
 *
 * HOW: Uses lib/ai.ts analyzeATSCompliance function.
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeATSCompliance } from "@/lib/ai";

/**
 * POST /api/cv/ats
 *
 * Analyze LaTeX CV for ATS compliance.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { latexContent } = body;

    if (!latexContent || typeof latexContent !== "string") {
      return NextResponse.json({ error: "LaTeX content is required" }, { status: 400 });
    }

    try {
      const analysis = await analyzeATSCompliance(latexContent);

      return NextResponse.json({
        success: true,
        data: analysis,
        message: "ATS analysis complete.",
      });
    } catch (aiError) {
      console.error("[CV ATS] AI error:", aiError);
      return NextResponse.json(
        {
          error: aiError instanceof Error ? aiError.message : "ATS analysis failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[CV ATS] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}
