/**
 * OpenRouter Provider
 *
 * OpenRouter integration for accessing multiple free vision models.
 */

import { AI_CONFIG } from "../config";
import type { ExtractedCVContent } from "../types";
import { extractedCVContentSchema } from "../schemas";
import { LATEX_EXTRACTION_PROMPT, CV_CONTENT_EXTRACTION_PROMPT } from "../prompts";
import { cleanAndValidateLatex, cleanJsonResponse, parseJsonOrThrow } from "../utils";

// =============================================================================
// TYPES
// =============================================================================

interface ContentPart {
  type: string;
  text?: string;
  image_url?: { url: string };
  file?: { filename: string; file_data: string };
}

interface RequestBody {
  model: string;
  max_tokens: number;
  messages: Array<{ role: string; content: ContentPart[] }>;
  plugins?: Array<{ id: string; pdf: { engine: string } }>;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// =============================================================================
// LATEX EXTRACTION
// =============================================================================

/**
 * Extract LaTeX using OpenRouter API (supports many free vision models)
 * Handles both images (via image_url) and PDFs (via file content type)
 */
export async function extractLatexWithOpenRouter(
  base64Data: string,
  mimeType: string,
  openrouterModel: string
): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  // Build content array based on file type
  // PDFs use "file" content type, images use "image_url"
  const isPdf = mimeType === "application/pdf";

  const messageContent: ContentPart[] = isPdf
    ? [
        {
          type: "file",
          file: {
            filename: "document.pdf",
            file_data: dataUrl,
          },
        },
        {
          type: "text",
          text: LATEX_EXTRACTION_PROMPT,
        },
      ]
    : [
        {
          type: "image_url",
          image_url: { url: dataUrl },
        },
        {
          type: "text",
          text: LATEX_EXTRACTION_PROMPT,
        },
      ];

  // Build request body - add pdf-text plugin for free PDF parsing
  const body: RequestBody = {
    model: openrouterModel,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
  };

  // Use free pdf-text engine for PDFs to avoid OCR costs
  if (isPdf) {
    body.plugins = [
      {
        id: "file-parser",
        pdf: {
          engine: "pdf-text", // Free! (mistral-ocr costs $2/1000 pages)
        },
      },
    ];
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_CONFIG.apiKeys.openrouter}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://job-hunt-ai.vercel.app",
      "X-Title": "Job Hunt AI - CV Editor",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as OpenRouterResponse;
  const responseContent = result.choices?.[0]?.message?.content?.trim() || "";

  if (!responseContent) {
    throw new Error("No content in OpenRouter response");
  }

  return cleanAndValidateLatex(responseContent);
}

// =============================================================================
// CV CONTENT EXTRACTION (for templates)
// =============================================================================

/**
 * Extract CV content as JSON using OpenRouter
 */
export async function extractContentWithOpenRouter(
  base64Data: string,
  mimeType: string,
  openrouterModel: string
): Promise<ExtractedCVContent> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const isPdf = mimeType === "application/pdf";

  const messageContent: ContentPart[] = isPdf
    ? [
        {
          type: "file",
          file: {
            filename: "document.pdf",
            file_data: dataUrl,
          },
        },
        {
          type: "text",
          text: CV_CONTENT_EXTRACTION_PROMPT,
        },
      ]
    : [
        {
          type: "image_url",
          image_url: { url: dataUrl },
        },
        {
          type: "text",
          text: CV_CONTENT_EXTRACTION_PROMPT,
        },
      ];

  const body: RequestBody = {
    model: openrouterModel,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: messageContent,
      },
    ],
  };

  if (isPdf) {
    body.plugins = [
      {
        id: "file-parser",
        pdf: {
          engine: "pdf-text",
        },
      },
    ];
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_CONFIG.apiKeys.openrouter}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://job-hunt-ai.vercel.app",
      "X-Title": "Job Hunt AI - CV Editor",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as OpenRouterResponse;
  const responseContent = result.choices?.[0]?.message?.content?.trim() || "";

  if (!responseContent) {
    throw new Error("No content in OpenRouter response");
  }

  return parseJsonOrThrow(
    cleanJsonResponse(responseContent),
    extractedCVContentSchema,
    "OpenRouter CV content extraction"
  );
}
