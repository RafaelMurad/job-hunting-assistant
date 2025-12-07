/**
 * AI Provider Configuration
 * Supports: Google Gemini (free), OpenAI, Claude
 */

export type AIProvider = "gemini" | "openai" | "claude";

export const AI_CONFIG = {
  // Default to Gemini (free tier)
  provider: (process.env.AI_PROVIDER as AIProvider) || "gemini",

  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
  },

  models: {
    gemini: "gemini-2.5-flash", // Free tier: Stable 2.5 Flash model
    openai: "gpt-4o-mini", // Paid: ~$0.15 per 1M input tokens
    claude: "claude-sonnet-4-5-20250929", // Paid: $3 per 1M input tokens
  },
};

export interface JobAnalysisResult {
  company: string;
  role: string;
  matchScore: number;
  topRequirements: string[];
  skillsMatch: string[];
  gaps: string[];
  redFlags: string[];
  keyPoints: string[];
}

const ANALYSIS_PROMPT = (
  jobDescription: string,
  userCV: string
): string => `You are a job application expert. Analyze this job description against the candidate's CV.

Job Description:
${jobDescription}

Candidate CV:
${userCV}

Provide a JSON response with:
1. company: Company name (string)
2. role: Job title (string)
3. matchScore: 0-100 score (number)
4. topRequirements: Top 5 requirements from the job (array of strings)
5. skillsMatch: Skills the candidate has that match (array of strings)
6. gaps: Skills the candidate lacks (array of strings)
7. redFlags: Any concerns like timezone, visa, location issues (array of strings)
8. keyPoints: 3-5 points to emphasize in cover letter (array of strings)

IMPORTANT CONTEXT:
- Candidate is fluent English speaker (11 years in London) - English teams are NOT a concern
- Candidate is open to contract roles (12+ months) - Don't flag contracts as concerning
- Focus on technical fit and role alignment

Be honest about gaps but focus on strengths. Match score should be realistic.
Return ONLY valid JSON, no other text.`;

const COVER_LETTER_PROMPT = (
  analysis: JobAnalysisResult,
  userCV: string
): string => `Write a professional cover letter (max 250 words) for this job application.

Company: ${analysis.company}
Role: ${analysis.role}

Key points to emphasize:
${(analysis.keyPoints || []).map((point, i) => `${i + 1}. ${point}`).join("\n")}

Skills match:
${(analysis.skillsMatch || []).join(", ")}

Candidate CV:
${userCV}

Requirements:
- Direct, professional tone (no fluff)
- Max 250 words
- 3 paragraphs: Hook, fit, closing
- Address timezone/remote fit if relevant
- Be honest about any gaps
- Show genuine interest in the company

Return only the cover letter text, no subject line or "Dear Hiring Manager" (we'll add that).`;

// ============================================
// GEMINI PROVIDER (FREE)
// ============================================
async function analyzeWithGemini(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(ANALYSIS_PROMPT(jobDescription, userCV));
  const text = result.response.text();

  // Clean JSON from markdown code blocks if present
  const jsonText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(jsonText);
}

async function generateCoverLetterWithGemini(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(COVER_LETTER_PROMPT(analysis, userCV));
  return result.response.text().trim();
}

// ============================================
// OPENAI PROVIDER
// ============================================
async function analyzeWithOpenAI(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const { OpenAI } = await import("openai");

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! });

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    messages: [
      { role: "system", content: "You are a job application expert. Return only valid JSON." },
      { role: "user", content: ANALYSIS_PROMPT(jobDescription, userCV) },
    ],
    response_format: { type: "json_object" },
  });

  const firstChoice = completion.choices[0];
  if (!firstChoice?.message.content) {
    throw new Error("No response from OpenAI");
  }
  return JSON.parse(firstChoice.message.content);
}

async function generateCoverLetterWithOpenAI(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const { OpenAI } = await import("openai");

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! });

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    messages: [
      { role: "system", content: "You are a professional cover letter writer." },
      { role: "user", content: COVER_LETTER_PROMPT(analysis, userCV) },
    ],
  });

  const firstChoice = completion.choices[0];
  if (!firstChoice?.message.content) {
    throw new Error("No response from OpenAI");
  }
  return firstChoice.message.content.trim();
}

// ============================================
// CLAUDE PROVIDER
// ============================================
async function analyzeWithClaude(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const Anthropic = await import("@anthropic-ai/sdk");

  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  });

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: ANALYSIS_PROMPT(jobDescription, userCV),
      },
    ],
  });

  const content = response.content[0];
  if (!content) {
    throw new Error("No response from Claude");
  }
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonText = content.text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(jsonText);
}

async function generateCoverLetterWithClaude(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const Anthropic = await import("@anthropic-ai/sdk");

  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  });

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: COVER_LETTER_PROMPT(analysis, userCV),
      },
    ],
  });

  const content = response.content[0];
  if (!content) {
    throw new Error("No response from Claude");
  }
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text.trim();
}

// ============================================
// CV PARSING (SHARED FOR REST & TRPC)
// ============================================

/**
 * Parsed CV data structure.
 */
export interface ParsedCVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

/**
 * The prompt for CV parsing.
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
export async function parseCVWithGeminiVision(pdfBuffer: Buffer): Promise<ParsedCVData> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const base64Data = pdfBuffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
    CV_EXTRACTION_PROMPT,
  ]);

  const text = result.response.text();

  // Parse JSON from response (remove any markdown code blocks if present)
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as ParsedCVData;
}

/**
 * Parse CV using Gemini with extracted text (for DOCX files).
 */
export async function parseCVWithGeminiText(cvText: string): Promise<ParsedCVData> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(
    `${CV_EXTRACTION_PROMPT}\n\nCV Text:\n${cvText.substring(0, 15000)}`
  );

  const text = result.response.text();

  // Parse JSON from response (remove any markdown code blocks if present)
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as ParsedCVData;
}

// ============================================
// UNIFIED EXPORTS
// ============================================
export async function analyzeJob(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  switch (AI_CONFIG.provider) {
    case "gemini":
      return analyzeWithGemini(jobDescription, userCV);
    case "openai":
      return analyzeWithOpenAI(jobDescription, userCV);
    case "claude":
      return analyzeWithClaude(jobDescription, userCV);
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
  }
}

export async function generateCoverLetter(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  switch (AI_CONFIG.provider) {
    case "gemini":
      return generateCoverLetterWithGemini(analysis, userCV);
    case "openai":
      return generateCoverLetterWithOpenAI(analysis, userCV);
    case "claude":
      return generateCoverLetterWithClaude(analysis, userCV);
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
  }
}

// ============================================
// LATEX CV FUNCTIONS
// ============================================

/**
 * Prompt for extracting LaTeX from PDF CV
 */
const LATEX_EXTRACTION_PROMPT = `You are an expert LaTeX CV/Resume converter. Analyze this CV/Resume PDF and convert it to clean, compilable LaTeX code.

Requirements:
1. Use the \`article\` documentclass with reasonable margins
2. Preserve the visual structure: sections, bullet points, dates, formatting
3. Use standard LaTeX packages only (geometry, enumitem, titlesec, hyperref)
4. Format dates consistently (e.g., "Jan 2020 - Present")
5. Keep the same section order as the original
6. Ensure the output compiles without errors

Return ONLY the LaTeX code, starting with \\documentclass and ending with \\end{document}.
Do NOT include any markdown code blocks or explanations.`;

/**
 * Prompt for modifying LaTeX based on user instructions
 */
const LATEX_MODIFY_PROMPT = (
  currentLatex: string,
  instruction: string
): string => `You are a LaTeX CV editor. Modify the following LaTeX CV based on the user's instruction.

Current LaTeX:
${currentLatex}

User's instruction:
${instruction}

Requirements:
1. Make ONLY the changes requested by the user
2. Preserve all other content and formatting
3. Ensure the output compiles without errors
4. Keep the same overall structure

Return ONLY the modified LaTeX code, starting with \\documentclass and ending with \\end{document}.
Do NOT include any markdown code blocks or explanations.`;

/**
 * ATS Compliance analysis result
 */
export interface ATSAnalysisResult {
  score: number; // 0-100
  issues: Array<{
    severity: "error" | "warning" | "info";
    message: string;
    suggestion: string;
  }>;
  summary: string;
}

/**
 * Prompt for ATS compliance analysis
 */
const ATS_ANALYSIS_PROMPT = (
  latexContent: string
): string => `You are an ATS (Applicant Tracking System) compliance expert. Analyze this LaTeX CV for ATS compatibility.

LaTeX CV:
${latexContent}

Analyze for:
1. **Parsing issues**: Complex layouts, tables, columns that ATS can't parse
2. **Missing sections**: Contact info, work experience, education, skills
3. **Formatting problems**: Unusual characters, images, graphics
4. **Content issues**: Missing dates, unclear job titles, keyword optimization
5. **Structure**: Clear section headers, consistent formatting

Return a JSON object with this exact structure:
{
  "score": <0-100 integer>,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Brief overall assessment"
}

Return ONLY the JSON object, no markdown code blocks.`;

/**
 * Extract LaTeX from PDF using AI vision
 */
export async function extractLatexFromPDF(pdfBuffer: Buffer): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const base64Data = pdfBuffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
    LATEX_EXTRACTION_PROMPT,
  ]);

  let latex = result.response.text().trim();

  // Remove any markdown code blocks if present
  latex = latex.replace(/^```(?:latex|tex)?\n?/i, "").replace(/\n?```$/i, "");

  // Validate it starts with \documentclass
  if (!latex.includes("\\documentclass")) {
    throw new Error("AI did not return valid LaTeX (missing \\documentclass)");
  }

  return latex;
}

/**
 * Modify LaTeX CV based on user instructions using AI
 */
export async function modifyLatexWithAI(
  currentLatex: string,
  instruction: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(LATEX_MODIFY_PROMPT(currentLatex, instruction));

  let latex = result.response.text().trim();

  // Remove any markdown code blocks if present
  latex = latex.replace(/^```(?:latex|tex)?\n?/i, "").replace(/\n?```$/i, "");

  // Validate it starts with \documentclass
  if (!latex.includes("\\documentclass")) {
    throw new Error("AI did not return valid LaTeX (missing \\documentclass)");
  }

  return latex;
}

/**
 * Analyze LaTeX CV for ATS compliance
 */
export async function analyzeATSCompliance(latexContent: string): Promise<ATSAnalysisResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.models.gemini,
  });

  const result = await model.generateContent(ATS_ANALYSIS_PROMPT(latexContent));
  const text = result.response.text().trim();

  // Parse JSON from response
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error("Could not parse ATS analysis response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as ATSAnalysisResult;
}
