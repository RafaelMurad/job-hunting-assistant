/**
 * API Key Test Endpoint
 *
 * Tests if an API key works by making a minimal API call.
 * Returns success/failure status without exposing the key.
 */

import { type NextRequest, NextResponse } from "next/server";

interface TestResult {
  valid: boolean;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<TestResult>> {
  const provider = request.nextUrl.searchParams.get("provider");

  if (!provider || (provider !== "gemini" && provider !== "openrouter")) {
    return NextResponse.json({ valid: false, error: "Invalid provider" }, { status: 400 });
  }

  try {
    if (provider === "gemini") {
      return NextResponse.json(await testGeminiKey());
    } 
      return NextResponse.json(await testOpenRouterKey());
    
  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : "Test failed",
    });
  }
}

async function testGeminiKey(): Promise<TestResult> {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return { valid: false, error: "GEMINI_API_KEY not configured" };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { method: "GET" }
    );

    if (response.ok) {
      return { valid: true };
    }

    const data = await response.json();
    return {
      valid: false,
      error: data.error?.message || `API returned ${response.status}`,
    };
  } catch {
    return {
      valid: false,
      error: "Network error - could not reach Gemini API",
    };
  }
}

async function testOpenRouterKey(): Promise<TestResult> {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    return { valid: false, error: "OPENROUTER_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    const data = await response.json();
    return {
      valid: false,
      error: data.error?.message || `API returned ${response.status}`,
    };
  } catch {
    return {
      valid: false,
      error: "Network error - could not reach OpenRouter API",
    };
  }
}
