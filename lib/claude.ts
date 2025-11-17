import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

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

export async function analyzeJob(
  jobDescription: string,
  userCV: string
): Promise<JobAnalysisResult> {
  const prompt = `You are a job application expert. Analyze this job description against the candidate's CV.

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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  // Extract JSON from response
  const text = content.text.trim()
  let jsonMatch = text.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    // Try parsing the whole response as JSON
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Failed to parse Claude response as JSON')
    }
  }

  return JSON.parse(jsonMatch[0])
}

export async function generateCoverLetter(
  jobDescription: string,
  userCV: string,
  analysis: JobAnalysisResult
): Promise<string> {
  const prompt = `Write a concise, professional cover letter (max 250 words) for this job.

Job Description:
${jobDescription}

Candidate CV:
${userCV}

Job Analysis:
- Company: ${analysis.company}
- Role: ${analysis.role}
- Match Score: ${analysis.matchScore}/100
- Key Points to Emphasize: ${analysis.keyPoints.join(', ')}
- Skills Match: ${analysis.skillsMatch.join(', ')}
${analysis.gaps.length > 0 ? `- Gaps to Address: ${analysis.gaps.join(', ')}` : ''}

Write the cover letter with:
- Direct, honest, professional tone (no fluff)
- Highlight 1-2 most relevant achievements
- Address any location/timezone concerns if relevant
- Maximum 250 words
- Professional but authentic voice

Return ONLY the cover letter text, no introduction or explanation.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text.trim()
}
