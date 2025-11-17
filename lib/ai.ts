/**
 * AI Provider Configuration
 * Supports: Google Gemini (free), OpenAI, Claude
 */

export type AIProvider = 'gemini' | 'openai' | 'claude'

export const AI_CONFIG = {
  // Default to Gemini (free tier)
  provider: (process.env.AI_PROVIDER as AIProvider) || 'gemini',
  
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
  },
  
  models: {
    gemini: 'gemini-2.5-flash', // Free tier: Stable 2.5 Flash model
    openai: 'gpt-4o-mini',      // Paid: ~$0.15 per 1M input tokens
    claude: 'claude-sonnet-4-5-20250929', // Paid: $3 per 1M input tokens
  },
}

export interface JobAnalysisResult {
  company: string
  role: string
  matchScore: number
  topRequirements: string[]
  skillsMatch: string[]
  gaps: string[]
  redFlags: string[]
  keyPoints: string[]
}

const ANALYSIS_PROMPT = (jobDescription: string, userCV: string) => `You are a job application expert. Analyze this job description against the candidate's CV.

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
Return ONLY valid JSON, no other text.`

const COVER_LETTER_PROMPT = (analysis: JobAnalysisResult, userCV: string) => `Write a professional cover letter (max 250 words) for this job application.

Company: ${analysis.company}
Role: ${analysis.role}

Key points to emphasize:
${(analysis.keyPoints || []).map((point, i) => `${i + 1}. ${point}`).join('\n')}

Skills match:
${(analysis.skillsMatch || []).join(', ')}

Candidate CV:
${userCV}

Requirements:
- Direct, professional tone (no fluff)
- Max 250 words
- 3 paragraphs: Hook, fit, closing
- Address timezone/remote fit if relevant
- Be honest about any gaps
- Show genuine interest in the company

Return only the cover letter text, no subject line or "Dear Hiring Manager" (we'll add that).`

// ============================================
// GEMINI PROVIDER (FREE)
// ============================================
async function analyzeWithGemini(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  
  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!)
  const model = genAI.getGenerativeModel({ 
    model: AI_CONFIG.models.gemini,
  })

  const result = await model.generateContent(ANALYSIS_PROMPT(jobDescription, userCV))
  const text = result.response.text()
  
  // Clean JSON from markdown code blocks if present
  const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(jsonText)
}

async function generateCoverLetterWithGemini(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  
  const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKeys.gemini!)
  const model = genAI.getGenerativeModel({ 
    model: AI_CONFIG.models.gemini,
  })

  const result = await model.generateContent(COVER_LETTER_PROMPT(analysis, userCV))
  return result.response.text().trim()
}

// ============================================
// OPENAI PROVIDER
// ============================================
async function analyzeWithOpenAI(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const { OpenAI } = await import('openai')
  
  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! })

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    messages: [
      { role: 'system', content: 'You are a job application expert. Return only valid JSON.' },
      { role: 'user', content: ANALYSIS_PROMPT(jobDescription, userCV) },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!)
}

async function generateCoverLetterWithOpenAI(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const { OpenAI } = await import('openai')
  
  const openai = new OpenAI({ apiKey: AI_CONFIG.apiKeys.openai! })

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.models.openai,
    messages: [
      { role: 'system', content: 'You are a professional cover letter writer.' },
      { role: 'user', content: COVER_LETTER_PROMPT(analysis, userCV) },
    ],
  })

  return completion.choices[0].message.content!.trim()
}

// ============================================
// CLAUDE PROVIDER
// ============================================
async function analyzeWithClaude(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const Anthropic = await import('@anthropic-ai/sdk')
  
  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  })

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: ANALYSIS_PROMPT(jobDescription, userCV),
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  const jsonText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(jsonText)
}

async function generateCoverLetterWithClaude(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  const Anthropic = await import('@anthropic-ai/sdk')
  
  const client = new Anthropic.default({
    apiKey: AI_CONFIG.apiKeys.claude!,
  })

  const response = await client.messages.create({
    model: AI_CONFIG.models.claude,
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: COVER_LETTER_PROMPT(analysis, userCV),
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text.trim()
}

// ============================================
// UNIFIED EXPORTS
// ============================================
export async function analyzeJob(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  switch (AI_CONFIG.provider) {
    case 'gemini':
      return analyzeWithGemini(jobDescription, userCV)
    case 'openai':
      return analyzeWithOpenAI(jobDescription, userCV)
    case 'claude':
      return analyzeWithClaude(jobDescription, userCV)
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`)
  }
}

export async function generateCoverLetter(
  analysis: JobAnalysisResult,
  userCV: string
): Promise<string> {
  switch (AI_CONFIG.provider) {
    case 'gemini':
      return generateCoverLetterWithGemini(analysis, userCV)
    case 'openai':
      return generateCoverLetterWithOpenAI(analysis, userCV)
    case 'claude':
      return generateCoverLetterWithClaude(analysis, userCV)
    default:
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`)
  }
}
