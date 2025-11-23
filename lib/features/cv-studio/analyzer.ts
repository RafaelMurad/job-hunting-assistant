/**
 * CV Analyzer - AI-Powered Job Matching & Suggestions
 *
 * Analyzes CV against job descriptions using AI to:
 * - Calculate match scores
 * - Identify gaps and matches
 * - Generate improvement suggestions
 * - Create tailored cover letters
 *
 * @learning Streaming LLM responses, prompt engineering, structured outputs
 * @see https://sdk.vercel.ai/docs - Vercel AI SDK
 * @see https://ai.google.dev/docs - Google AI Studio
 */

import {
  CV,
  JobDescription,
  CVAnalysisResult,
  CVSuggestion,
  generateId,
} from "./types";

// ===================
// TYPES
// ===================

interface AnalysisOptions {
  /** Include cover letter generation */
  generateCoverLetter?: boolean;
  /** Target industry for suggestions */
  industry?: string;
  /** Writing style for suggestions */
  tone?: "professional" | "creative" | "technical";
  /** Stream responses */
  stream?: boolean;
  /** Callback for streaming updates */
  onProgress?: (progress: AnalysisProgress) => void;
}

interface AnalysisProgress {
  stage: "matching" | "analyzing" | "suggesting" | "cover_letter" | "complete";
  percentage: number;
  message: string;
}

// ===================
// MAIN ANALYZER
// ===================

/**
 * Analyze CV against job description
 *
 * @learning This is where AI magic happens
 *
 * TODO: Implement full AI analysis
 * - Connect to LLM API (Google Gemini, OpenAI, etc.)
 * - Use structured output for consistent results
 * - Implement streaming for better UX
 */
export async function analyzeCV(
  cv: CV,
  jobDescription: JobDescription,
  options: AnalysisOptions = {}
): Promise<CVAnalysisResult> {
  const { generateCoverLetter = true, onProgress } = options;

  // Stage 1: Keyword Matching
  onProgress?.({
    stage: "matching",
    percentage: 10,
    message: "Matching keywords...",
  });

  const matches = findMatches(cv, jobDescription);

  // Stage 2: Gap Analysis
  onProgress?.({
    stage: "analyzing",
    percentage: 30,
    message: "Identifying gaps...",
  });

  const gaps = findGaps(cv, jobDescription);

  // Stage 3: Calculate Scores
  const categoryScores = calculateScores(cv, jobDescription, matches, gaps);
  const overallScore = calculateOverallScore(categoryScores);

  // Stage 4: Generate AI Suggestions
  onProgress?.({
    stage: "suggesting",
    percentage: 50,
    message: "Generating AI suggestions...",
  });

  const suggestions = await generateSuggestions(cv, jobDescription, gaps);

  // Stage 5: Generate Cover Letter (optional)
  let coverLetter: string | undefined;
  if (generateCoverLetter) {
    onProgress?.({
      stage: "cover_letter",
      percentage: 80,
      message: "Writing cover letter...",
    });

    coverLetter = await generateCoverLetter_(cv, jobDescription);
  }

  onProgress?.({
    stage: "complete",
    percentage: 100,
    message: "Analysis complete!",
  });

  return {
    overallScore,
    categoryScores,
    matches,
    gaps,
    suggestions,
    coverLetter,
  };
}

// ===================
// KEYWORD MATCHING
// ===================

/**
 * Find matches between CV and job description
 *
 * @learning Text matching, keyword extraction
 */
function findMatches(
  cv: CV,
  job: JobDescription
): CVAnalysisResult["matches"] {
  const matches: CVAnalysisResult["matches"] = {
    skills: [],
    keywords: [],
    experience: [],
  };

  // Extract all text from CV for searching
  const cvText = extractCVText(cv).toLowerCase();
  const cvSkills = cv.skills.map((s) => s.name.toLowerCase());

  // Match skills
  for (const skill of cvSkills) {
    const jobText =
      `${job.description} ${job.requirements.join(" ")} ${job.preferredQualifications.join(" ")}`.toLowerCase();
    if (jobText.includes(skill)) {
      matches.skills.push(skill);
    }
  }

  // Match keywords
  for (const keyword of job.keywords) {
    if (cvText.includes(keyword.toLowerCase())) {
      matches.keywords.push(keyword);
    }
  }

  // Match experience keywords (simplified)
  const experienceKeywords = [
    "led",
    "managed",
    "developed",
    "implemented",
    "designed",
    "architected",
    "optimized",
    "mentored",
  ];
  for (const exp of cv.experience) {
    const expText = `${exp.description} ${exp.achievements.join(" ")}`.toLowerCase();
    for (const keyword of experienceKeywords) {
      if (
        expText.includes(keyword) &&
        !matches.experience.includes(keyword)
      ) {
        matches.experience.push(keyword);
      }
    }
  }

  return matches;
}

/**
 * Find gaps - required items missing from CV
 */
function findGaps(
  cv: CV,
  job: JobDescription
): CVAnalysisResult["gaps"] {
  const gaps: CVAnalysisResult["gaps"] = {
    skills: [],
    keywords: [],
    experience: [],
  };

  const cvText = extractCVText(cv).toLowerCase();
  const cvSkills = cv.skills.map((s) => s.name.toLowerCase());

  // Find missing required skills
  const requiredSkills = extractSkillsFromText(job.requirements.join(" "));
  for (const skill of requiredSkills) {
    if (!cvSkills.includes(skill.toLowerCase())) {
      gaps.skills.push(skill);
    }
  }

  // Find missing keywords
  for (const keyword of job.keywords) {
    if (!cvText.includes(keyword.toLowerCase())) {
      gaps.keywords.push(keyword);
    }
  }

  // Find missing experience requirements
  const experienceYears = extractYearsRequired(job.requirements.join(" "));
  const cvYears = calculateTotalExperience(cv);
  if (experienceYears > cvYears) {
    gaps.experience.push(
      `${experienceYears} years of experience required (you have ${cvYears})`
    );
  }

  return gaps;
}

// ===================
// SCORING
// ===================

/**
 * Calculate category scores
 */
function calculateScores(
  cv: CV,
  job: JobDescription,
  matches: CVAnalysisResult["matches"],
  gaps: CVAnalysisResult["gaps"]
): CVAnalysisResult["categoryScores"] {
  // Skills score: matched / (matched + gaps)
  const skillsTotal = matches.skills.length + gaps.skills.length;
  const skillsScore = skillsTotal > 0
    ? Math.round((matches.skills.length / skillsTotal) * 100)
    : 50;

  // Keywords score
  const keywordsTotal = job.keywords.length;
  const keywordsScore = keywordsTotal > 0
    ? Math.round((matches.keywords.length / keywordsTotal) * 100)
    : 50;

  // Experience score (simplified)
  const experienceScore = cv.experience.length >= 2 ? 70 : 40;

  // Education score (simplified)
  const educationScore = cv.education.length >= 1 ? 80 : 50;

  return {
    skills: skillsScore,
    experience: experienceScore,
    education: educationScore,
    keywords: keywordsScore,
  };
}

/**
 * Calculate overall score from category scores
 */
function calculateOverallScore(
  scores: CVAnalysisResult["categoryScores"]
): number {
  // Weighted average
  const weights = {
    skills: 0.35,
    experience: 0.30,
    keywords: 0.20,
    education: 0.15,
  };

  return Math.round(
    scores.skills * weights.skills +
    scores.experience * weights.experience +
    scores.keywords * weights.keywords +
    scores.education * weights.education
  );
}

// ===================
// AI SUGGESTIONS
// ===================

/**
 * Generate AI-powered improvement suggestions
 *
 * @learning Prompt engineering, structured outputs
 *
 * TODO: Connect to actual LLM API
 * - Use system prompt for consistent format
 * - Request JSON output for structured suggestions
 * - Stream responses for better UX
 */
async function generateSuggestions(
  cv: CV,
  job: JobDescription,
  gaps: CVAnalysisResult["gaps"]
): Promise<CVSuggestion[]> {
  const suggestions: CVSuggestion[] = [];

  // TODO: Replace with actual AI call
  // This is placeholder logic that generates basic suggestions

  // Suggest adding missing skills
  for (const skill of gaps.skills.slice(0, 3)) {
    suggestions.push({
      id: generateId(),
      section: "skills",
      type: "add",
      priority: "high",
      title: `Add "${skill}" to your skills`,
      description: `This skill appears in the job requirements. If you have experience with ${skill}, make sure to include it.`,
      suggested: skill,
      applied: false,
    });
  }

  // Suggest incorporating keywords
  for (const keyword of gaps.keywords.slice(0, 3)) {
    suggestions.push({
      id: generateId(),
      section: "summary",
      type: "modify",
      priority: "medium",
      title: `Incorporate "${keyword}" in your summary`,
      description: `The job description mentions "${keyword}". Consider adding relevant experience or skills related to this term.`,
      suggested: keyword,
      applied: false,
    });
  }

  // Suggest summary improvements if missing
  if (!cv.summary || cv.summary.length < 100) {
    suggestions.push({
      id: generateId(),
      section: "summary",
      type: "modify",
      priority: "high",
      title: "Enhance your professional summary",
      description:
        "A compelling summary is crucial. Add 3-5 sentences highlighting your key achievements and career goals aligned with this role.",
      applied: false,
    });
  }

  // Suggest quantifying achievements
  const hasMetrics = cv.experience.some(
    (exp) =>
      exp.description.match(/\d+%/) ||
      exp.achievements.some((a) => a.match(/\d+/))
  );
  if (!hasMetrics && cv.experience.length > 0) {
    suggestions.push({
      id: generateId(),
      section: "experience",
      type: "modify",
      priority: "medium",
      title: "Add quantifiable achievements",
      description:
        'Numbers make your achievements more impactful. Add metrics like "increased sales by 20%" or "reduced load time by 50%".',
      applied: false,
    });
  }

  return suggestions;
}

/**
 * Generate AI-powered cover letter
 *
 * @learning Streaming text generation, prompt templates
 *
 * TODO: Implement with streaming
 * - Create compelling cover letter template
 * - Personalize based on CV and job
 * - Stream output for typewriter effect
 */
async function generateCoverLetter_(
  cv: CV,
  job: JobDescription
): Promise<string> {
  // TODO: Replace with actual AI call
  // This is a placeholder template

  const fullName = `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`;
  const topSkills = cv.skills.slice(0, 3).map((s) => s.name).join(", ");

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in ${topSkills}, I am confident that I can make a significant contribution to your team.

${cv.summary || "Throughout my career, I have developed a strong foundation in my field."}

${
    cv.experience[0]
      ? `In my most recent role as ${cv.experience[0].position} at ${cv.experience[0].company}, I ${cv.experience[0].description.slice(0, 200)}...`
      : ""
  }

I am particularly drawn to this opportunity because of the chance to work on exciting challenges. My skills align well with your requirements, and I am eager to bring my expertise to ${job.company}.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team.

Sincerely,
${fullName}`;
}

// ===================
// STREAMING ANALYZER
// ===================

/**
 * Analyze CV with streaming responses
 *
 * @learning ReadableStream, async generators
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
 *
 * TODO: Implement streaming analysis
 * - Use async generator for streaming suggestions
 * - Yield partial results as they're generated
 * - Update UI progressively
 */
export async function* analyzeCV_Streaming(
  cv: CV,
  job: JobDescription
): AsyncGenerator<{
  type: "progress" | "suggestion" | "score" | "cover_letter";
  data: unknown;
}> {
  // Yield progress updates
  yield {
    type: "progress",
    data: { stage: "matching", percentage: 10 },
  };

  const matches = findMatches(cv, job);

  yield {
    type: "progress",
    data: { stage: "analyzing", percentage: 30 },
  };

  const gaps = findGaps(cv, job);
  const categoryScores = calculateScores(cv, job, matches, gaps);
  const overallScore = calculateOverallScore(categoryScores);

  yield {
    type: "score",
    data: { overallScore, categoryScores },
  };

  // TODO: Stream suggestions one by one
  yield {
    type: "progress",
    data: { stage: "suggesting", percentage: 50 },
  };

  // Simulate streaming suggestions
  const suggestions = await generateSuggestions(cv, job, gaps);
  for (const suggestion of suggestions) {
    yield {
      type: "suggestion",
      data: suggestion,
    };
  }

  // TODO: Stream cover letter generation
  yield {
    type: "progress",
    data: { stage: "cover_letter", percentage: 80 },
  };

  const coverLetter = await generateCoverLetter_(cv, job);
  yield {
    type: "cover_letter",
    data: coverLetter,
  };

  yield {
    type: "progress",
    data: { stage: "complete", percentage: 100 },
  };
}

// ===================
// HELPER FUNCTIONS
// ===================

/**
 * Extract all text from CV for searching
 */
function extractCVText(cv: CV): string {
  const parts = [
    cv.personalInfo.firstName,
    cv.personalInfo.lastName,
    cv.summary,
    ...cv.experience.flatMap((e) => [
      e.company,
      e.position,
      e.description,
      ...e.achievements,
      ...e.technologies,
    ]),
    ...cv.education.flatMap((e) => [e.institution, e.degree, e.field]),
    ...cv.skills.map((s) => s.name),
    ...cv.certifications.map((c) => c.name),
    ...cv.projects.flatMap((p) => [p.name, p.description, ...p.technologies]),
  ];

  return parts.filter(Boolean).join(" ");
}

/**
 * Extract skills from text (simplified)
 */
function extractSkillsFromText(text: string): string[] {
  // Common tech skills to look for
  const skillPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Next\.js|Node\.js|Express|Django|Flask|Spring)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CI\/CD)\b/gi,
    /\b(SQL|PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch)\b/gi,
    /\b(Git|Agile|Scrum|REST|GraphQL|Microservices)\b/gi,
  ];

  const skills = new Set<string>();
  for (const pattern of skillPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => skills.add(m));
    }
  }

  return Array.from(skills);
}

/**
 * Extract years of experience required
 */
function extractYearsRequired(text: string): number {
  const match = text.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Calculate total years of experience from CV
 */
function calculateTotalExperience(cv: CV): number {
  let totalMonths = 0;

  for (const exp of cv.experience) {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || new Date());

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  return Math.round(totalMonths / 12);
}

// ===================
// API ROUTE HELPERS
// ===================

/**
 * Create prompt for AI analysis
 *
 * @learning Prompt engineering best practices
 */
export function createAnalysisPrompt(cv: CV, job: JobDescription): string {
  return `You are an expert career coach and resume reviewer. Analyze the following CV against the job description and provide specific, actionable feedback.

## Job Description
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements.join(", ")}
Preferred: ${job.preferredQualifications.join(", ")}
Keywords: ${job.keywords.join(", ")}

## CV Summary
Name: ${cv.personalInfo.firstName} ${cv.personalInfo.lastName}
Summary: ${cv.summary}
Skills: ${cv.skills.map((s) => s.name).join(", ")}
Experience: ${cv.experience.map((e) => `${e.position} at ${e.company}`).join("; ")}
Education: ${cv.education.map((e) => `${e.degree} in ${e.field}`).join("; ")}

## Task
1. Calculate a match score (0-100)
2. List matching skills and keywords
3. List missing required skills
4. Provide 5 specific improvement suggestions
5. Generate a tailored cover letter

Respond in JSON format:
{
  "overallScore": number,
  "matches": { "skills": string[], "keywords": string[] },
  "gaps": { "skills": string[], "keywords": string[] },
  "suggestions": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }],
  "coverLetter": string
}`;
}

export { findMatches, findGaps, calculateScores };
