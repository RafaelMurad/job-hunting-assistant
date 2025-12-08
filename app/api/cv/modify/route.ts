/**
 * AI LaTeX Modification API Route
 *
 * WHY: Allow users to edit their CV using natural language instructions.
 *
 * WHAT: Receive LaTeX + user instruction → AI modifies LaTeX → Return updated LaTeX
 *
 * HOW: Uses lib/ai.ts modifyLatexWithAI function.
 */

import { NextRequest, NextResponse } from "next/server";
import { modifyLatexWithAI } from "@/lib/ai";

/**
 * POST /api/cv/modify
 *
 * Modify LaTeX CV based on natural language instruction.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { latexContent, instruction } = body;

    if (!latexContent || typeof latexContent !== "string") {
      return NextResponse.json({ error: "LaTeX content is required" }, { status: 400 });
    }

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
    }

    // Limit instruction length to prevent abuse
    if (instruction.length > 1000) {
      return NextResponse.json(
        { error: "Instruction too long. Maximum 1000 characters." },
        { status: 400 }
      );
    }

    try {
      const modifiedLatex = await modifyLatexWithAI(latexContent, instruction);

      return NextResponse.json({
        success: true,
        latexContent: modifiedLatex,
        message: "CV modified successfully.",
      });
    } catch (aiError) {
      console.error("[CV Modify] AI error:", aiError);
      return NextResponse.json(
        {
          error: aiError instanceof Error ? aiError.message : "AI modification failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[CV Modify] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Modification failed",
      },
      { status: 500 }
    );
  }
}
