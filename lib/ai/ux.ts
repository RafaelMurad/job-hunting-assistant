/**
 * UX AI Module
 *
 * AI-powered analysis for UX research using Gemini 2.5 Pro via GCP credits.
 * Provides journey validation, pain point analysis, and contextual chat.
 */

import { AI_CONFIG } from "./config";

// =============================================================================
// TYPES
// =============================================================================

export interface UxAnalysisResult {
  summary: string;
  issues: Array<{
    type: "gap" | "friction" | "opportunity" | "inconsistency";
    description: string;
    severity: "low" | "medium" | "high";
    suggestion: string;
  }>;
  recommendations: string[];
  score?: number;
}

export interface UxChatResponse {
  content: string;
  suggestions?: string[];
  relatedEntities?: Array<{
    type: "persona" | "journey" | "painpoint" | "principle";
    id: string;
    name: string;
  }>;
}

// =============================================================================
// PROMPTS
// =============================================================================

const UX_SYSTEM_PROMPT = `You are an expert UX researcher and designer. You help analyze user experience data, identify issues, and suggest improvements.

You have deep knowledge of:
- User journey mapping and experience design
- Pain point identification and prioritization
- Persona development and validation
- UX principles and heuristics
- Accessibility and usability best practices

When analyzing, be specific and actionable. Cite concrete examples from the data provided.
When suggesting improvements, explain the rationale and expected impact.`;

const JOURNEY_VALIDATION_PROMPT = (journey: string, context: string): string => `
${UX_SYSTEM_PROMPT}

Analyze this user journey for completeness, friction points, and opportunities:

JOURNEY:
${journey}

ADDITIONAL CONTEXT:
${context}

Provide your analysis as JSON:
{
  "summary": "Brief overall assessment",
  "issues": [
    {
      "type": "gap|friction|opportunity|inconsistency",
      "description": "What the issue is",
      "severity": "low|medium|high",
      "suggestion": "How to address it"
    }
  ],
  "recommendations": ["Top 3 actionable improvements"],
  "score": 0-100
}
`;

const PAIN_POINT_ANALYSIS_PROMPT = (painPoints: string, context: string): string => `
${UX_SYSTEM_PROMPT}

Analyze these pain points for prioritization and solutions:

PAIN POINTS:
${painPoints}

CONTEXT (journeys, personas):
${context}

Provide your analysis as JSON:
{
  "summary": "Overall assessment of the pain point landscape",
  "issues": [
    {
      "type": "gap|friction|opportunity|inconsistency",
      "description": "Analysis of specific pain point",
      "severity": "low|medium|high",
      "suggestion": "Solution approach"
    }
  ],
  "recommendations": ["Prioritized list of what to address first and why"],
  "score": null
}
`;

const PERSONA_ENRICHMENT_PROMPT = (persona: string, context: string): string => `
${UX_SYSTEM_PROMPT}

Review this persona and suggest enrichments:

PERSONA:
${persona}

CONTEXT (journeys, pain points):
${context}

Provide your analysis as JSON:
{
  "summary": "Assessment of persona completeness",
  "issues": [
    {
      "type": "gap|opportunity",
      "description": "Missing or weak aspect",
      "severity": "low|medium|high",
      "suggestion": "How to enrich"
    }
  ],
  "recommendations": ["Specific additions to make persona more useful"],
  "score": 0-100
}
`;

const UX_CHAT_PROMPT = (question: string, context: string): string => `
${UX_SYSTEM_PROMPT}

The user is working on a job hunting assistant app. Here is the current UX research data:

${context}

User question: ${question}

Provide a helpful, specific answer. If referencing specific items from the data, mention them by name.
If suggesting actions, be concrete about what to do.
`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get Gemini model using GCP API key (for paid usage with credits)
 */
async function getGeminiModel(): Promise<import("@google/generative-ai").GenerativeModel> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  // Use GCP key for paid tier (uses cloud credits)
  const apiKey = AI_CONFIG.apiKeys.geminiGcp || AI_CONFIG.apiKeys.gemini;
  if (!apiKey) {
    throw new Error("No Gemini API key configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use Gemini 2.5 Pro for best reasoning
  return genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
}

/**
 * Extract JSON from AI response text
 */
function extractJson<T>(text: string): T {
  // Remove markdown code blocks
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Validate a user journey for completeness and friction
 */
export async function analyzeJourney(
  journey: {
    name: string;
    description: string;
    steps: Array<{
      stage: string;
      action: string;
      thinking: string;
      feeling: string;
      touchpoint: string;
      opportunity?: string | null;
    }>;
  },
  context: {
    personas?: Array<{ name: string; description: string }>;
    painPoints?: Array<{ title: string; description: string }>;
  }
): Promise<UxAnalysisResult> {
  const model = await getGeminiModel();

  const journeyText = `
Name: ${journey.name}
Description: ${journey.description}
Steps:
${journey.steps
  .map(
    (s, i) => `  ${i + 1}. ${s.stage}
     Action: ${s.action}
     Thinking: ${s.thinking}
     Feeling: ${s.feeling}
     Touchpoint: ${s.touchpoint}
     ${s.opportunity ? `Opportunity: ${s.opportunity}` : ""}`
  )
  .join("\n")}
`;

  const contextText = `
Personas: ${context.personas?.map((p) => `${p.name}: ${p.description}`).join("\n") || "None provided"}

Known Pain Points: ${context.painPoints?.map((p) => `${p.title}: ${p.description}`).join("\n") || "None provided"}
`;

  const result = await model.generateContent(JOURNEY_VALIDATION_PROMPT(journeyText, contextText));
  return extractJson<UxAnalysisResult>(result.response.text());
}

/**
 * Analyze and prioritize pain points
 */
export async function analyzePainPoints(
  painPoints: Array<{
    title: string;
    description: string;
    category: string;
    severity: string;
    effort: string;
    solution?: string | null;
  }>,
  context: {
    journeys?: Array<{ name: string; description: string }>;
    personas?: Array<{ name: string; description: string }>;
  }
): Promise<UxAnalysisResult> {
  const model = await getGeminiModel();

  const painPointsText = painPoints
    .map(
      (p) => `
Title: ${p.title}
Description: ${p.description}
Category: ${p.category}
Current Severity: ${p.severity}
Effort: ${p.effort}
${p.solution ? `Proposed Solution: ${p.solution}` : "No solution proposed yet"}
`
    )
    .join("\n---\n");

  const contextText = `
Journeys: ${context.journeys?.map((j) => `${j.name}: ${j.description}`).join("\n") || "None"}
Personas: ${context.personas?.map((p) => `${p.name}: ${p.description}`).join("\n") || "None"}
`;

  const result = await model.generateContent(
    PAIN_POINT_ANALYSIS_PROMPT(painPointsText, contextText)
  );
  return extractJson<UxAnalysisResult>(result.response.text());
}

/**
 * Enrich a persona with suggestions
 */
export async function analyzePersona(
  persona: {
    name: string;
    type: string;
    description: string;
    goals: string[];
    frustrations: string[];
    behaviors: string[];
  },
  context: {
    journeys?: Array<{ name: string; description: string }>;
    painPoints?: Array<{ title: string; description: string }>;
  }
): Promise<UxAnalysisResult> {
  const model = await getGeminiModel();

  const personaText = `
Name: ${persona.name}
Type: ${persona.type}
Description: ${persona.description}

Goals:
${persona.goals.map((g) => `- ${g}`).join("\n")}

Frustrations:
${persona.frustrations.map((f) => `- ${f}`).join("\n")}

Behaviors:
${persona.behaviors.map((b) => `- ${b}`).join("\n")}
`;

  const contextText = `
Related Journeys: ${context.journeys?.map((j) => `${j.name}: ${j.description}`).join("\n") || "None"}
Known Pain Points: ${context.painPoints?.map((p) => `${p.title}: ${p.description}`).join("\n") || "None"}
`;

  const result = await model.generateContent(PERSONA_ENRICHMENT_PROMPT(personaText, contextText));
  return extractJson<UxAnalysisResult>(result.response.text());
}

// =============================================================================
// CHAT FUNCTION
// =============================================================================

/**
 * Answer UX questions with full context
 */
export async function chatAboutUx(
  question: string,
  uxData: {
    personas: Array<{ name: string; type: string; description: string; goals: string[] }>;
    journeys: Array<{
      name: string;
      description: string;
      steps: Array<{ stage: string; action: string; feeling: string }>;
    }>;
    painPoints: Array<{ title: string; description: string; severity: string; category: string }>;
    principles: Array<{ name: string; description: string }>;
  }
): Promise<string> {
  const model = await getGeminiModel();

  // Build context string with all UX data
  const context = `
## PERSONAS
${uxData.personas
  .map(
    (p) => `
### ${p.name} (${p.type})
${p.description}
Goals: ${p.goals.join(", ")}`
  )
  .join("\n")}

## USER JOURNEYS
${uxData.journeys
  .map(
    (j) => `
### ${j.name}
${j.description}
Steps: ${j.steps.map((s) => `${s.stage}: ${s.action} (${s.feeling})`).join(" → ")}`
  )
  .join("\n")}

## PAIN POINTS
${uxData.painPoints
  .map(
    (p) => `
### ${p.title} [${p.severity}] (${p.category})
${p.description}`
  )
  .join("\n")}

## DESIGN PRINCIPLES
${uxData.principles.map((p) => `- **${p.name}**: ${p.description}`).join("\n")}
`;

  const result = await model.generateContent(UX_CHAT_PROMPT(question, context));
  return result.response.text().trim();
}

// =============================================================================
// EXPORTS
// =============================================================================

export const uxAi = {
  analyzeJourney,
  analyzePainPoints,
  analyzePersona,
  chatAboutUx,
};
