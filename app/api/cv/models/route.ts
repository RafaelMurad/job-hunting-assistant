/**
 * CV Models API Route
 *
 * WHY: Allow the frontend to discover which AI models are available
 * for LaTeX extraction based on configured API keys.
 *
 * WHAT: Return list of models with availability status and cost info.
 */

import { NextResponse } from "next/server";
import { getAvailableModels } from "@/lib/ai";

/**
 * GET /api/cv/models
 *
 * Returns list of available models for LaTeX extraction.
 */
export async function GET(): Promise<NextResponse> {
  const models = getAvailableModels();

  return NextResponse.json({
    success: true,
    data: {
      models,
      defaultModel: "gemini-2.5-flash",
    },
  });
}
