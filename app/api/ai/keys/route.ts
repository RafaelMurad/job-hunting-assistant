/**
 * API Keys Status Endpoint
 *
 * Returns which AI providers have API keys configured.
 * Does NOT return the actual keys - only boolean status.
 *
 * This allows the client-side Settings UI to show which keys are configured
 * without exposing the actual keys in the browser.
 */

import { NextResponse } from "next/server";

interface KeyStatus {
  gemini: {
    configured: boolean;
    envVar: string;
  };
  openrouter: {
    configured: boolean;
    envVar: string;
  };
}

export async function GET(): Promise<NextResponse<KeyStatus>> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  return NextResponse.json({
    gemini: {
      configured: !!geminiKey && geminiKey.length > 0,
      envVar: "GEMINI_API_KEY",
    },
    openrouter: {
      configured: !!openrouterKey && openrouterKey.length > 0,
      envVar: "OPENROUTER_API_KEY",
    },
  });
}
