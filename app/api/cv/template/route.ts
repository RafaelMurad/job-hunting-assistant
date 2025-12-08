/**
 * CV Template Switching API Route
 *
 * WHY: Allow instant template switching without re-uploading the CV.
 * When content has been extracted to JSON, we can regenerate LaTeX with any template.
 *
 * WHAT: Receive extracted content JSON + new template ID → Generate LaTeX
 */

import { NextRequest, NextResponse } from "next/server";
import { regenerateWithTemplate } from "@/lib/ai";
import { type CVTemplateId, type ExtractedCVContent, CV_TEMPLATES } from "@/lib/cv-templates";

/**
 * POST /api/cv/template
 *
 * Generate LaTeX from extracted content using a different template.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      content: ExtractedCVContent;
      templateId: CVTemplateId;
    };

    const { content, templateId } = body;

    // Validate inputs
    if (!content) {
      return NextResponse.json({ error: "Missing content parameter" }, { status: 400 });
    }

    if (!templateId) {
      return NextResponse.json({ error: "Missing templateId parameter" }, { status: 400 });
    }

    // Validate template ID
    const validTemplates: CVTemplateId[] = [
      "tech-minimalist",
      "modern-clean",
      "contemporary-professional",
    ];
    if (!validTemplates.includes(templateId)) {
      return NextResponse.json(
        { error: `Invalid templateId. Must be one of: ${validTemplates.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate LaTeX with new template
    const latex = regenerateWithTemplate(content, templateId);

    return NextResponse.json({
      success: true,
      data: {
        latexContent: latex,
        templateId,
      },
    });
  } catch (error) {
    console.error("[CV Template] Error:", error);
    return NextResponse.json({ error: "Failed to generate LaTeX with template" }, { status: 500 });
  }
}

/**
 * GET /api/cv/template
 *
 * List available templates.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: CV_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      usage: t.usage,
    })),
  });
}
