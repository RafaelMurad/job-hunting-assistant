/**
 * AI Prompts
 *
 * Shared prompt templates used across providers.
 */

import type { JobAnalysisResult } from "./types";

// =============================================================================
// JOB ANALYSIS PROMPTS
// =============================================================================

export const ANALYSIS_PROMPT = (
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

export const COVER_LETTER_PROMPT = (
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

// =============================================================================
// CV PARSING PROMPTS
// =============================================================================

export const CV_EXTRACTION_PROMPT = `You are a CV/Resume parser. Analyze this CV and extract the following information as a valid JSON object.

Required fields (use empty string "" if not found):
- name: Full name of the person
- email: Email address  
- phone: Phone number (include country code if present)
- location: City, Country or full address
- summary: Professional summary or objective (2-3 sentences). If not explicitly stated, create one based on their experience.
- experience: Work history formatted as "Company | Role (Start - End)\\n- Achievement 1\\n- Achievement 2\\n\\n" for each job. Most recent first.
- skills: Comma-separated list of skills, technologies, and tools mentioned

Return ONLY the JSON object, no markdown code blocks, no explanation.`;

// =============================================================================
// STYLE ANALYSIS PROMPTS (Two-Pass LaTeX)
// =============================================================================

export const STYLE_ANALYSIS_PROMPT = `You are an expert document style analyst. Analyze this CV/Resume and extract its visual styling as a JSON object.

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

export const LATEX_FROM_STYLE_PROMPT = (
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

// =============================================================================
// LATEX EXTRACTION PROMPT
// =============================================================================

export const LATEX_EXTRACTION_PROMPT = `You are an expert LaTeX typesetter. Your task is to EXACTLY REPLICATE this CV/Resume as a LaTeX document, preserving every visual detail.

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

// =============================================================================
// LATEX MODIFICATION PROMPT
// =============================================================================

export const LATEX_MODIFY_PROMPT = (
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

// =============================================================================
// ATS ANALYSIS PROMPT
// =============================================================================

export const ATS_ANALYSIS_PROMPT = (
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

// =============================================================================
// CV CONTENT EXTRACTION PROMPT (Template-based)
// =============================================================================

export const CV_CONTENT_EXTRACTION_PROMPT = `You are a CV/Resume content extractor. Your task is to extract ALL content from this CV into a structured JSON format.

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
