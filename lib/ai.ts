/**
 * AI Provider Configuration
 * Supports: Google Gemini (free), OpenAI, Claude, OpenRouter (many free models)
 */

import {
  type CVTemplateId,
  type ExtractedCVContent,
  generateLatexFromContent,
} from "./cv-templates";

export type AIProvider = "gemini" | "openai" | "claude" | "openrouter";

/**
 * Available models for LaTeX CV extraction
 * Order determines dropdown display order (recommended testing order)
 */
export type LatexExtractionModel =
  | "gemini-2.5-flash" // Free, fast (default)
  | "gemini-2.5-pro" // Paid, best reasoning
  | "gemini-3-pro-preview" // Paid, best multimodal
  | "gemini-2.0-flash-or" // Free via OpenRouter, different rate limits
  | "nova-2-lite" // Free via OpenRouter, Amazon vision model
  | "mistral-small-3.1" // Free via OpenRouter, Mistral vision model
  | "gemma-3-27b" // Free via OpenRouter, Google Gemma
  | "gpt-4o" // Paid ~$0.01/CV
  | "claude-sonnet"; // Paid ~$0.05/CV

/**
 * Model metadata for UI display and availability checks
 */
export interface ModelInfo {
  id: LatexExtractionModel;
  name: string;
  provider: AIProvider;
  cost: string;
  description: string;
  openrouterModel?: string; // Model ID for OpenRouter API
}

export const LATEX_MODELS: ModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    cost: "Free",
    description: "Fast, good for most CVs",
  },
  {
    id: "gemini-2.0-flash-or",
    name: "Gemini 2.0 Flash (OpenRouter)",
    provider: "openrouter",
    cost: "Free",
    description: "Gemini 2.0 via OpenRouter - different rate limits",
    openrouterModel: "google/gemini-2.0-flash-exp:free",
  },
  {
    id: "nova-2-lite",
    name: "Amazon Nova 2 Lite",
    provider: "openrouter",
    cost: "Free",
    description: "Amazon vision model via OpenRouter",
    openrouterModel: "amazon/nova-2-lite-v1:free",
  },
  {
    id: "mistral-small-3.1",
    name: "Mistral Small 3.1",
    provider: "openrouter",
    cost: "Free",
    description: "Mistral 24B vision model via OpenRouter",
    openrouterModel: "mistralai/mistral-small-3.1-24b-instruct:free",
  },
  {
    id: "gemma-3-27b",
    name: "Google Gemma 3 27B",
    provider: "openrouter",
    cost: "Free",
    description: "Google's open Gemma model via OpenRouter",
    openrouterModel: "google/gemma-3-27b-it:free",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    cost: "Paid",
    description: "Best reasoning (requires billing enabled)",
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro (Preview)",
    provider: "gemini",
    cost: "Paid",
    description: "Best multimodal (requires billing enabled)",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    cost: "~$0.01",
    description: "OpenAI vision model",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "claude",
    cost: "~$0.05",
    description: "Anthropic vision model",
  },
];

export const AI_CONFIG = {
  // Default to Gemini (free tier)
  provider: (process.env.AI_PROVIDER as AIProvider) || "gemini",

  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  },

  models: {
    gemini: "gemini-2.5-flash", // Free tier: Stable 2.5 Flash model
    geminiPro: "gemini-2.5-pro", // Free tier: Best reasoning
    gemini3Pro: "gemini-3-pro-preview", // Free preview: Best multimodal
    openai: "gpt-4o", // Paid: ~$2.50 per 1M input tokens (vision)
    claude: "claude-sonnet-4-5-20250929", // Paid: $3 per 1M input tokens
  },

  // Default model for LaTeX extraction
  defaultLatexModel: "gemini-2.5-flash" as LatexExtractionModel,
};

/**
 * Check if a model is available (has API key configured)
 */
export function isModelAvailable(model: LatexExtractionModel): boolean {
  const modelInfo = LATEX_MODELS.find((m) => m.id === model);
  if (!modelInfo) return false;

  const apiKey = AI_CONFIG.apiKeys[modelInfo.provider];
  return !!apiKey && apiKey.length > 0;
}

/**
 * Get list of available models with availability status
 */
export function getAvailableModels(): Array<ModelInfo & { available: boolean }> {
  return LATEX_MODELS.map((model) => ({
    ...model,
    available: isModelAvailable(model.id),
  }));
}

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
 * Two-Pass Style Extraction Prompts
 *
 * Pass 1: Analyze visual style and extract metadata as JSON
 * Pass 2: Generate LaTeX using the style analysis + content
 */

const STYLE_ANALYSIS_PROMPT = `You are an expert document style analyst. Analyze this CV/Resume and extract its visual styling as a JSON object.

Examine EVERY visual detail carefully:

{
  "margins": {
    "top": "<exact value like '0.5in' or '1cm'>",
    "bottom": "<exact value>",
    "left": "<exact value>",
    "right": "<exact value>"
  },
  "typography": {
    "fontFamily": "serif|sans-serif|monospace",
    "bodyFontSize": "<like '10pt' or '11pt'>",
    "headerFontSize": "<like '24pt' for name>",
    "sectionFontSize": "<like '12pt'>"
  },
  "colors": {
    "primary": "<hex color like '#2E5090' or 'black'>",
    "secondary": "<hex or name>",
    "links": "<hex or name>",
    "text": "<hex or name, usually black>"
  },
  "sectionHeaders": {
    "style": "underlined|uppercase|bold|color-accent",
    "hasHorizontalRule": true|false,
    "ruleColor": "<color if has rule>",
    "alignment": "left|center"
  },
  "layout": {
    "columns": 1|2,
    "headerAlignment": "left|center",
    "dateAlignment": "right|inline",
    "bulletStyle": "disc|circle|dash|custom"
  },
  "spacing": {
    "lineHeight": "<like '1.15' or 'single'>",
    "sectionSpacing": "<like '12pt'>",
    "paragraphSpacing": "<like '6pt'>"
  },
  "specialElements": {
    "hasContactSeparators": true|false,
    "separatorStyle": "bullet|pipe|dash",
    "hasBorders": true|false,
    "hasIcons": true|false
  }
}

Return ONLY the JSON object, no markdown code blocks, no explanation.`;

/**
 * Prompt for generating LaTeX from style analysis + content
 */
const LATEX_FROM_STYLE_PROMPT = (
  styleJson: string
): string => `You are an expert LaTeX typesetter. Generate a COMPLETE, compilable LaTeX document that EXACTLY matches the following style specification:

## STYLE SPECIFICATION (from visual analysis):
${styleJson}

## CRITICAL REQUIREMENTS:

1. **COLORS**: If the style specifies colors (like blue headers), use \\definecolor and \\textcolor
   Example: \\definecolor{headerblue}{HTML}{2E5090}
   Then: \\textcolor{headerblue}{\\section{...}}

2. **FONTS**: Match the font family exactly
   - For sans-serif: \\renewcommand{\\familydefault}{\\sfdefault}
   - For specific fonts: \\usepackage{helvet} or \\usepackage{lmodern}

3. **MARGINS**: Use exact values from style spec in \\usepackage[...]{geometry}

4. **SECTION STYLING**: Match the section header style
   - If colored underline: use \\titleformat with \\color and \\titlerule
   - If bold only: \\titleformat{\\section}{\\Large\\bfseries}...

5. **HYPERLINKS**: If links are colored, use:
   \\hypersetup{colorlinks=true, urlcolor=<color>}

Now, looking at the CV content, generate the complete LaTeX document.

## OUTPUT:
- Start with \\documentclass
- End with \\end{document}
- Must compile without errors
- NO markdown code blocks
- NO explanations`;

/**
 * Prompt for extracting CV content as structured JSON
 * Used with template-based CV generation
 */
const CV_CONTENT_EXTRACTION_PROMPT = `You are a CV/Resume content extractor. Your task is to extract ALL content from this CV into a structured JSON format.

## TASK
Extract every piece of information from the uploaded CV and return it as valid JSON.

## OUTPUT FORMAT
Return ONLY valid JSON matching this exact structure (no markdown, no explanations):

{
  "name": "Full Name",
  "title": "Job Title / Professional Title",
  "contact": {
    "email": "email@example.com",
    "phone": "+1 234 567 8900",
    "location": "City, Country",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username",
    "website": "https://example.com"
  },
  "summary": "Professional summary or about section as a single paragraph...",
  "skills": [
    { "category": "Category Name", "items": "Skill 1, Skill 2, Skill 3" }
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "bullets": [
        "Achievement or responsibility as written in CV",
        "Another bullet point"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School/University Name",
      "startDate": "YYYY",
      "endDate": "YYYY"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "url": "https://github.com/user/project",
      "bullets": [
        "Description or achievement"
      ]
    }
  ],
  "certifications": [
    "Certification Name - Provider (Year)"
  ],
  "languages": [
    { "language": "English", "level": "Native/Professional/Basic" }
  ]
}

## EXTRACTION RULES
1. Extract ALL text exactly as written (don't summarize or modify)
2. Keep bullet points as separate array items
3. If a section doesn't exist, use empty array [] or omit optional fields
4. Parse dates into "Mon YYYY" or "YYYY" format when possible
5. Include full URLs for linkedin/github/website if present
6. Group skills by their labeled categories (e.g., "Frontend", "Testing")

## OUTPUT
Return ONLY the JSON object. No markdown code blocks. No explanations.`;

/**
 * Prompt for extracting LaTeX from PDF CV - AGGRESSIVE STYLE PRESERVATION
 */
const LATEX_EXTRACTION_PROMPT = `You are an expert LaTeX typesetter. Your task is to EXACTLY REPLICATE this CV/Resume as a LaTeX document, preserving every visual detail.

## CRITICAL: EXACT VISUAL REPLICATION

You must preserve:
1. **EXACT MARGINS** - Measure the margins precisely (top, bottom, left, right)
2. **EXACT FONTS** - Match the font family (serif, sans-serif, etc.) and sizes
3. **EXACT SPACING** - Line spacing, paragraph spacing, section spacing
4. **EXACT LAYOUT** - Column structure, alignment, indentation
5. **EXACT STYLING** - Bold, italic, underline patterns; line separators; bullet styles

## DOCUMENT STRUCTURE

Start with this template and CUSTOMIZE every value to match the original:

\\documentclass[10pt]{article}

% Page geometry - ADJUST THESE TO MATCH ORIGINAL EXACTLY
\\usepackage[
  letterpaper,
  top=0.5in,      % Adjust to match
  bottom=0.5in,   % Adjust to match
  left=0.6in,     % Adjust to match
  right=0.6in     % Adjust to match
]{geometry}

% Font packages - Choose based on original
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
% If sans-serif CV: \\renewcommand{\\familydefault}{\\sfdefault}
% If specific font needed, add appropriate package

% Essential packages
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{ragged2e}
\\usepackage{parskip}

% Hyperlink styling
\\hypersetup{colorlinks=true, linkcolor=black, urlcolor=black}

% Section formatting - CUSTOMIZE to match original exactly
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

## STYLE ANALYSIS CHECKLIST

Before generating LaTeX, analyze and note:
- [ ] What are the exact page margins?
- [ ] Is the font serif or sans-serif?
- [ ] What font size is used for body text? Headers?
- [ ] How are section headers styled? (underlined? bold? uppercase? color?)
- [ ] What is the spacing between sections?
- [ ] Are there horizontal lines/rules? Where?
- [ ] What bullet style is used? (•, -, ►, etc.)
- [ ] Is there a multi-column layout?
- [ ] How are dates aligned? (right-aligned? inline?)
- [ ] What is the exact header/name styling?

## BULLET LISTS - Use standard itemize with custom styling:

\\begin{itemize}[nosep, leftmargin=*, labelsep=0.5em]
  \\item Content here
\\end{itemize}

## OUTPUT REQUIREMENTS

1. Output MUST start with: \\documentclass
2. Output MUST end with: \\end{document}
3. Must compile with pdflatex without errors
4. NO markdown code blocks
5. NO explanations - ONLY LaTeX code
6. Include the COMPLETE document - do NOT truncate

The goal is that when compiled, the PDF should look IDENTICAL to the original.`;

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
 *
 * Uses retry logic with escalating token limits to handle long CVs.
 * Starts conservative (16K) to stay within free tier, escalates to 32K if needed.
 */
export async function extractLatexFromPDF(pdfBuffer: Buffer): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const base64Data = pdfBuffer.toString("base64");

  // Escalating token limits: start conservative, increase if truncated
  // Free tier consideration: 16K should handle most 2-3 page CVs
  const tokenLimits = [16384, 32768];

  for (const maxTokens of tokenLimits) {
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.models.gemini,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
      LATEX_EXTRACTION_PROMPT,
    ]);

    // Check if response was truncated due to token limit
    const finishReason = result.response.candidates?.[0]?.finishReason;
    const wasTruncated = finishReason === "MAX_TOKENS";

    let latex = result.response.text().trim();

    // Remove any markdown code blocks if present
    latex = latex.replace(/^```(?:latex|tex)?\n?/gi, "").replace(/\n?```$/gi, "");

    // Try to find the documentclass if it's not at the start
    const docClassIndex = latex.indexOf("\\documentclass");
    if (docClassIndex > 0) {
      latex = latex.substring(docClassIndex);
    }

    // Try to find \end{document} and trim anything after
    const endDocIndex = latex.indexOf("\\end{document}");
    if (endDocIndex > 0) {
      latex = latex.substring(0, endDocIndex + "\\end{document}".length);
    }

    // Validate it has required elements
    if (!latex.includes("\\documentclass")) {
      throw new Error(
        "AI did not return valid LaTeX (missing \\documentclass). Please try uploading again."
      );
    }

    // Check if complete
    const isComplete = latex.includes("\\end{document}");

    if (isComplete) {
      return latex;
    }

    // If truncated and we have more token limits to try, continue
    if (wasTruncated && maxTokens < tokenLimits[tokenLimits.length - 1]!) {
      console.warn(
        `[extractLatexFromPDF] Response truncated at ${maxTokens} tokens, retrying with more...`
      );
      continue;
    }

    // If not complete and no more retries, throw
    throw new Error(
      "AI returned incomplete LaTeX (missing \\end{document}). " +
        "Your CV may be too long. Try a shorter version or contact support."
    );
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("LaTeX extraction failed after all retry attempts.");
}

/**
 * Extract LaTeX from DOCX using AI
 *
 * Uses the same approach as PDF extraction - Gemini can process DOCX files.
 */
export async function extractLatexFromDocx(docxBuffer: Buffer): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);
  const base64Data = docxBuffer.toString("base64");

  // Use same token limits as PDF extraction
  const tokenLimits = [16384, 32768];

  for (const maxTokens of tokenLimits) {
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.models.gemini,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          data: base64Data,
        },
      },
      LATEX_EXTRACTION_PROMPT,
    ]);

    // Check if response was truncated due to token limit
    const finishReason = result.response.candidates?.[0]?.finishReason;
    const wasTruncated = finishReason === "MAX_TOKENS";

    let latex = result.response.text().trim();

    // Remove any markdown code blocks if present
    latex = latex.replace(/^```(?:latex|tex)?\n?/gi, "").replace(/\n?```$/gi, "");

    // Try to find the documentclass if it's not at the start
    const docClassIndex = latex.indexOf("\\documentclass");
    if (docClassIndex > 0) {
      latex = latex.substring(docClassIndex);
    }

    // Try to find \end{document} and trim anything after
    const endDocIndex = latex.indexOf("\\end{document}");
    if (endDocIndex > 0) {
      latex = latex.substring(0, endDocIndex + "\\end{document}".length);
    }

    // Validate it has required elements
    if (!latex.includes("\\documentclass")) {
      throw new Error(
        "AI did not return valid LaTeX (missing \\documentclass). Please try uploading again."
      );
    }

    // Check if complete
    const isComplete = latex.includes("\\end{document}");

    if (isComplete) {
      return latex;
    }

    // If truncated and we have more token limits to try, continue
    if (wasTruncated && maxTokens < tokenLimits[tokenLimits.length - 1]!) {
      console.warn(
        `[extractLatexFromDocx] Response truncated at ${maxTokens} tokens, retrying with more...`
      );
      continue;
    }

    // If not complete and no more retries, throw
    throw new Error(
      "AI returned incomplete LaTeX (missing \\end{document}). " +
        "Your document may be too long. Try a shorter version or contact support."
    );
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("LaTeX extraction failed after all retry attempts.");
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
    generationConfig: {
      maxOutputTokens: 16384, // Handle long CVs without truncation
    },
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

// ============================================
// MULTI-MODEL LATEX EXTRACTION
// ============================================

/**
 * Result from LaTeX extraction including which model was used
 */
export interface LatexExtractionResult {
  latex: string;
  modelUsed: LatexExtractionModel;
  fallbackUsed: boolean;
}

/**
 * Clean and validate LaTeX output from any model
 */
function cleanAndValidateLatex(rawLatex: string): string {
  let latex = rawLatex.trim();

  // Remove any markdown code blocks if present
  latex = latex.replace(/^```(?:latex|tex)?\n?/gi, "").replace(/\n?```$/gi, "");

  // Try to find the documentclass if it's not at the start
  const docClassIndex = latex.indexOf("\\documentclass");
  if (docClassIndex > 0) {
    latex = latex.substring(docClassIndex);
  }

  // Try to find \end{document} and trim anything after
  const endDocIndex = latex.indexOf("\\end{document}");
  if (endDocIndex > 0) {
    latex = latex.substring(0, endDocIndex + "\\end{document}".length);
  }

  // Validate it has required elements
  if (!latex.includes("\\documentclass")) {
    throw new Error(
      "AI did not return valid LaTeX (missing \\documentclass). Please try uploading again."
    );
  }

  if (!latex.includes("\\end{document}")) {
    throw new Error(
      "AI returned incomplete LaTeX (missing \\end{document}). " +
        "Your document may be too long. Try a shorter version."
    );
  }

  return latex;
}

/**
 * Two-pass style extraction for Pro models
 * Pass 1: Extract visual style as JSON
 * Pass 2: Generate LaTeX using style + content
 */
async function extractLatexTwoPass(
  base64Data: string,
  mimeType: string,
  modelName: string,
  genAI: InstanceType<typeof import("@google/generative-ai").GoogleGenerativeAI>
): Promise<string> {
  // Pass 1: Extract style as JSON
  const styleModel = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 4096,
    },
  });

  const styleResult = await styleModel.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    STYLE_ANALYSIS_PROMPT,
  ]);

  let styleJson = styleResult.response.text().trim();

  // Clean up JSON response
  styleJson = styleJson.replace(/^```(?:json)?\n?/gi, "").replace(/\n?```$/gi, "");

  // Validate it's valid JSON
  try {
    JSON.parse(styleJson);
  } catch {
    console.warn("[Two-Pass] Style JSON invalid, falling back to single-pass");
    throw new Error("Style analysis returned invalid JSON");
  }

  // Style analysis logging (use warn since log is disallowed)
  console.warn("[Two-Pass] Style analysis complete:", styleJson.substring(0, 200) + "...");

  // Pass 2: Generate LaTeX using style + viewing the document again
  const latexModel = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 32768,
    },
  });

  const latexResult = await latexModel.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    LATEX_FROM_STYLE_PROMPT(styleJson),
  ]);

  return cleanAndValidateLatex(latexResult.response.text());
}

/**
 * Extract LaTeX using Gemini models (2.5 Pro, 2.5 Flash, 3 Pro)
 *
 * For Pro models (2.5 Pro, 3 Pro), uses two-pass extraction for better style preservation:
 * - Pass 1: Analyze visual style and extract as JSON
 * - Pass 2: Generate LaTeX using style analysis + content
 *
 * For Flash models, uses single-pass for speed.
 */
async function extractLatexWithGemini(
  base64Data: string,
  mimeType: string,
  modelId: "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-3-pro-preview"
): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);

  // Map model IDs to actual model names
  const modelName =
    modelId === "gemini-2.5-pro"
      ? AI_CONFIG.models.geminiPro
      : modelId === "gemini-3-pro-preview"
        ? AI_CONFIG.models.gemini3Pro
        : AI_CONFIG.models.gemini;

  // Use two-pass extraction for Pro models (better style preservation)
  const isProModel = modelId === "gemini-2.5-pro" || modelId === "gemini-3-pro-preview";

  if (isProModel) {
    try {
      return await extractLatexTwoPass(base64Data, mimeType, modelName, genAI);
    } catch (error) {
      console.warn(`[${modelId}] Two-pass extraction failed, falling back to single-pass:`, error);
      // Fall through to single-pass
    }
  }

  // Single-pass extraction (for Flash or as fallback)
  // Escalating token limits for long CVs
  const tokenLimits = [16384, 32768];

  for (const maxTokens of tokenLimits) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      LATEX_EXTRACTION_PROMPT,
    ]);

    const finishReason = result.response.candidates?.[0]?.finishReason;
    const wasTruncated = finishReason === "MAX_TOKENS";

    try {
      return cleanAndValidateLatex(result.response.text());
    } catch (error) {
      // If truncated and we have more limits to try, continue
      if (wasTruncated && maxTokens < tokenLimits[tokenLimits.length - 1]!) {
        console.warn(`[${modelId}] Response truncated at ${maxTokens} tokens, retrying...`);
        continue;
      }
      throw error;
    }
  }

  throw new Error("LaTeX extraction failed after all retry attempts.");
}

/**
 * Extract LaTeX using OpenAI GPT-4o vision
 */
async function extractLatexWithOpenAI(base64Data: string, mimeType: string): Promise<string> {
  const { OpenAI } = await import("openai");

  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! });

  // Convert mimeType for OpenAI (it expects image/* or application/pdf handled differently)
  // For PDFs, we need to use the file API or convert to images
  // GPT-4o supports direct image URLs but for PDF we'll pass as data URL
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: "high",
            },
          },
          {
            type: "text",
            text: LATEX_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return cleanAndValidateLatex(content);
}

/**
 * Extract LaTeX using Claude Sonnet vision
 */
async function extractLatexWithClaude(base64Data: string, _mimeType: string): Promise<string> {
  const Anthropic = await import("@anthropic-ai/sdk");

  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  });

  // Claude expects specific media types for documents
  // For PDFs, we use the document block type
  const mediaType = "application/pdf" as const;

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 16384,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: LATEX_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return cleanAndValidateLatex(textContent.text);
}

/**
 * Extract LaTeX using OpenRouter API (supports many free vision models)
 * Handles both images (via image_url) and PDFs (via file content type)
 */
async function extractLatexWithOpenRouter(
  base64Data: string,
  mimeType: string,
  openrouterModel: string
): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  // Build content array based on file type
  // PDFs use "file" content type, images use "image_url"
  const isPdf = mimeType === "application/pdf";

  interface ContentPart {
    type: string;
    text?: string;
    image_url?: { url: string };
    file?: { filename: string; file_data: string };
  }

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
  interface RequestBody {
    model: string;
    max_tokens: number;
    messages: Array<{ role: string; content: ContentPart[] }>;
    plugins?: Array<{ id: string; pdf: { engine: string } }>;
  }

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

  interface OpenRouterResponse {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  }

  const result = (await response.json()) as OpenRouterResponse;
  const responseContent = result.choices?.[0]?.message?.content?.trim() || "";

  if (!responseContent) {
    throw new Error("No content in OpenRouter response");
  }

  return cleanAndValidateLatex(responseContent);
}

/**
 * Main entry point: Extract LaTeX from document using specified model
 * with automatic fallback to Gemini 2.5 Pro on failure
 */
export async function extractLatexWithModel(
  buffer: Buffer,
  mimeType: string,
  model: LatexExtractionModel = AI_CONFIG.defaultLatexModel
): Promise<LatexExtractionResult> {
  const base64Data = buffer.toString("base64");

  // Check if requested model is available
  if (!isModelAvailable(model)) {
    console.warn(`[extractLatexWithModel] Model ${model} not available, using fallback`);
    model = "gemini-2.5-flash"; // Fallback to free model
  }

  try {
    let latex: string;

    switch (model) {
      case "gemini-2.5-pro":
      case "gemini-2.5-flash":
      case "gemini-3-pro-preview":
        latex = await extractLatexWithGemini(base64Data, mimeType, model);
        break;
      case "nova-2-lite":
      case "mistral-small-3.1":
      case "gemma-3-27b":
      case "gemini-2.0-flash-or": {
        const modelInfo = LATEX_MODELS.find((m) => m.id === model);
        if (!modelInfo?.openrouterModel) {
          throw new Error(`OpenRouter model not configured for ${model}`);
        }
        latex = await extractLatexWithOpenRouter(base64Data, mimeType, modelInfo.openrouterModel);
        break;
      }
      case "gpt-4o":
        latex = await extractLatexWithOpenAI(base64Data, mimeType);
        break;
      case "claude-sonnet":
        latex = await extractLatexWithClaude(base64Data, mimeType);
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    return {
      latex,
      modelUsed: model,
      fallbackUsed: false,
    };
  } catch (error) {
    // If not already using fallback, try Gemini 2.5 Flash (free)
    if (model !== "gemini-2.5-flash" && isModelAvailable("gemini-2.5-flash")) {
      console.error(
        `[extractLatexWithModel] ${model} failed, falling back to Gemini 2.5 Flash:`,
        error
      );

      try {
        const latex = await extractLatexWithGemini(base64Data, mimeType, "gemini-2.5-flash");
        return {
          latex,
          modelUsed: "gemini-2.5-flash",
          fallbackUsed: true,
        };
      } catch {
        // Fallback also failed, throw original error
        throw error;
      }
    }

    throw error;
  }
}

// =============================================================================
// TEMPLATE-BASED CV EXTRACTION (NEW)
// =============================================================================

/**
 * Result type for template-based extraction
 */
export interface TemplateExtractionResult {
  latex: string;
  content: ExtractedCVContent;
  templateId: CVTemplateId;
  modelUsed: LatexExtractionModel;
  fallbackUsed: boolean;
}

/**
 * Extract CV content as JSON using Gemini
 */
async function extractContentWithGemini(
  base64Data: string,
  mimeType: string,
  modelName: LatexExtractionModel
): Promise<ExtractedCVContent> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!);

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 16384,
    },
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    CV_CONTENT_EXTRACTION_PROMPT,
  ]);

  const responseText = result.response.text().trim();
  return parseExtractedContent(responseText);
}

/**
 * Extract CV content as JSON using OpenRouter
 */
async function extractContentWithOpenRouter(
  base64Data: string,
  mimeType: string,
  openrouterModel: string
): Promise<ExtractedCVContent> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const isPdf = mimeType === "application/pdf";

  interface ContentPart {
    type: string;
    text?: string;
    image_url?: { url: string };
    file?: { filename: string; file_data: string };
  }

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

  interface RequestBody {
    model: string;
    max_tokens: number;
    messages: Array<{ role: string; content: ContentPart[] }>;
    plugins?: Array<{ id: string; pdf: { engine: string } }>;
  }

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

  interface OpenRouterResponse {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  }

  const result = (await response.json()) as OpenRouterResponse;
  const responseContent = result.choices?.[0]?.message?.content?.trim() || "";

  if (!responseContent) {
    throw new Error("No content in OpenRouter response");
  }

  return parseExtractedContent(responseContent);
}

/**
 * Parse and validate extracted CV content JSON
 */
function parseExtractedContent(responseText: string): ExtractedCVContent {
  // Clean up response - remove markdown code blocks if present
  const jsonText = responseText
    .replace(/^```(?:json)?\n?/gi, "")
    .replace(/\n?```$/gi, "")
    .trim();

  try {
    const content = JSON.parse(jsonText) as ExtractedCVContent;

    // Validate required fields
    if (!content.name || typeof content.name !== "string") {
      throw new Error("Missing or invalid 'name' field");
    }
    if (!content.title || typeof content.title !== "string") {
      throw new Error("Missing or invalid 'title' field");
    }
    if (!content.contact || typeof content.contact !== "object") {
      throw new Error("Missing or invalid 'contact' field");
    }
    if (!content.summary || typeof content.summary !== "string") {
      throw new Error("Missing or invalid 'summary' field");
    }
    if (!Array.isArray(content.skills)) {
      throw new Error("Missing or invalid 'skills' field");
    }
    if (!Array.isArray(content.experience)) {
      throw new Error("Missing or invalid 'experience' field");
    }
    if (!Array.isArray(content.education)) {
      throw new Error("Missing or invalid 'education' field");
    }

    return content;
  } catch (error) {
    console.error("[parseExtractedContent] Failed to parse JSON:", jsonText.substring(0, 500));
    throw new Error(
      `Failed to parse CV content JSON: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Main entry point: Extract CV content and generate LaTeX using template
 * This is the new template-based approach (preferred)
 */
export async function extractWithTemplate(
  buffer: Buffer,
  mimeType: string,
  templateId: CVTemplateId,
  model: LatexExtractionModel = AI_CONFIG.defaultLatexModel
): Promise<TemplateExtractionResult> {
  const base64Data = buffer.toString("base64");

  // Check if requested model is available
  if (!isModelAvailable(model)) {
    console.warn(`[extractWithTemplate] Model ${model} not available, using fallback`);
    model = "gemini-2.5-flash";
  }

  try {
    let content: ExtractedCVContent;

    switch (model) {
      case "gemini-2.5-pro":
      case "gemini-2.5-flash":
      case "gemini-3-pro-preview":
        content = await extractContentWithGemini(base64Data, mimeType, model);
        break;
      case "nova-2-lite":
      case "mistral-small-3.1":
      case "gemma-3-27b":
      case "gemini-2.0-flash-or": {
        const modelInfo = LATEX_MODELS.find((m) => m.id === model);
        if (!modelInfo?.openrouterModel) {
          throw new Error(`OpenRouter model not configured for ${model}`);
        }
        content = await extractContentWithOpenRouter(
          base64Data,
          mimeType,
          modelInfo.openrouterModel
        );
        break;
      }
      case "gpt-4o":
      case "claude-sonnet":
        // For now, fall back to Gemini for these - can add dedicated functions later
        content = await extractContentWithGemini(base64Data, mimeType, "gemini-2.5-flash");
        break;
      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    // Generate LaTeX from content using template
    const latex = generateLatexFromContent(content, templateId);

    return {
      latex,
      content,
      templateId,
      modelUsed: model,
      fallbackUsed: false,
    };
  } catch (error) {
    // Fallback to Gemini 2.5 Flash
    if (model !== "gemini-2.5-flash" && isModelAvailable("gemini-2.5-flash")) {
      console.error(
        `[extractWithTemplate] ${model} failed, falling back to Gemini 2.5 Flash:`,
        error
      );

      try {
        const content = await extractContentWithGemini(base64Data, mimeType, "gemini-2.5-flash");
        const latex = generateLatexFromContent(content, templateId);

        return {
          latex,
          content,
          templateId,
          modelUsed: "gemini-2.5-flash",
          fallbackUsed: true,
        };
      } catch {
        throw error;
      }
    }

    throw error;
  }
}

/**
 * Re-generate LaTeX from already-extracted content with a different template
 * This is instant since no AI call is needed
 */
export function regenerateWithTemplate(
  content: ExtractedCVContent,
  templateId: CVTemplateId
): string {
  return generateLatexFromContent(content, templateId);
}
