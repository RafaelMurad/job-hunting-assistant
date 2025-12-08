/**
 * CV Template System
 *
 * Pre-defined LaTeX templates for consistent CV styling.
 * Users select a template, AI extracts content to JSON, then fills the template.
 */

export type CVTemplateId = "tech-minimalist" | "modern-clean" | "contemporary-professional";

export interface CVTemplate {
  id: CVTemplateId;
  name: string;
  description: string;
  usage: string; // e.g., "90% of applications"
  preamble: string; // LaTeX document setup (packages, colors, formatting)
  structure: string; // LaTeX document body structure with placeholders
}

/**
 * Extracted CV content in structured JSON format.
 * AI extracts this from the uploaded document, then we fill templates with it.
 */
export interface ExtractedCVContent {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
  }[];
  projects?: {
    name: string;
    url?: string;
    bullets: string[];
  }[];
  certifications?: string[];
  languages?: {
    language: string;
    level: string;
  }[];
}

// =============================================================================
// TEMPLATE 1: TECH MINIMALIST
// =============================================================================
const TECH_MINIMALIST_PREAMBLE = `% === TECH MINIMALIST CV ===
% Maximum white space, ultra-clean, startup-friendly

\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}

% --- COLORS ---
\\definecolor{accentblue}{HTML}{3b82f6}
\\definecolor{textgray}{HTML}{1f2937}

% --- PAGE LAYOUT (WIDER MARGINS FOR WHITE SPACE) ---
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\setlength{\\parindent}{0in}
\\setlength{\\parskip}{0in}
\\setlength{\\voffset}{0.2in}
\\setlength{\\textheight}{9.0in}
\\setlength{\\textwidth}{6.0in}
\\setlength{\\topmargin}{0in}
\\setlength{\\headheight}{0in}
\\setlength{\\headsep}{0in}
\\setlength{\\hoffset}{0.25in}
\\setlength{\\oddsidemargin}{0in}
\\setlength{\\evensidemargin}{0in}

% --- SECTION FORMATTING (MINIMALIST) ---
\\titleformat{\\section}
  {\\Large\\bfseries\\color{accentblue}}
  {}{0em}
  {}
  [\\vspace{2pt}]
\\titlespacing*{\\section}{0pt}{16pt}{8pt}

% --- LISTS (EXTRA SPACING) ---
\\setlist[itemize]{leftmargin=*, itemsep=5pt, parsep=0pt, topsep=4pt}

% --- HYPERLINKS ---
\\hypersetup{
    colorlinks=true,
    linkcolor=accentblue,
    urlcolor=accentblue
}

\\begin{document}
`;

// =============================================================================
// TEMPLATE 2: MODERN CLEAN
// =============================================================================
const MODERN_CLEAN_PREAMBLE = `% === MODERN CLEAN CV ===
% Professional elegance meets contemporary design

\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}

% --- COLORS ---
\\definecolor{accentblue}{HTML}{2563eb}
\\definecolor{darkgray}{HTML}{374151}

% --- PAGE LAYOUT ---
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\setlength{\\parindent}{0in}
\\setlength{\\parskip}{0in}
\\setlength{\\voffset}{0.15in}
\\setlength{\\textheight}{9.2in}
\\setlength{\\textwidth}{6.5in}
\\setlength{\\topmargin}{0in}
\\setlength{\\headheight}{0in}
\\setlength{\\headsep}{0in}
\\setlength{\\hoffset}{0in}
\\setlength{\\oddsidemargin}{0in}
\\setlength{\\evensidemargin}{0in}

% --- SECTION FORMATTING ---
\\titleformat{\\section}
  {\\large\\bfseries\\color{accentblue}}
  {}{0em}
  {}
  [\\color{accentblue}\\titlerule\\vspace{2pt}]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

% --- LISTS ---
\\setlist[itemize]{leftmargin=*, itemsep=3pt, parsep=0pt, topsep=2pt}

% --- HYPERLINKS ---
\\hypersetup{
    colorlinks=true,
    linkcolor=accentblue,
    urlcolor=accentblue
}

\\begin{document}
`;

// =============================================================================
// TEMPLATE 3: CONTEMPORARY PROFESSIONAL
// =============================================================================
const CONTEMPORARY_PROFESSIONAL_PREAMBLE = `% === CONTEMPORARY PROFESSIONAL CV ===
% Traditional structure, modern execution

\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{charter}

% --- PAGE LAYOUT ---
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\setlength{\\parindent}{0in}
\\setlength{\\parskip}{0in}
\\setlength{\\voffset}{0.25in}
\\setlength{\\textheight}{9.0in}
\\setlength{\\textwidth}{6.5in}
\\setlength{\\topmargin}{0in}
\\setlength{\\headheight}{0in}
\\setlength{\\headsep}{0in}
\\setlength{\\hoffset}{0in}
\\setlength{\\oddsidemargin}{0in}
\\setlength{\\evensidemargin}{0in}

% --- SECTION FORMATTING (TRADITIONAL) ---
\\titleformat{\\section}{\\vspace{4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{1pt}]

% --- LISTS (TIGHT SPACING) ---
\\setlist[itemize]{leftmargin=*, noitemsep, nolistsep}

\\begin{document}
`;

// =============================================================================
// TEMPLATE DEFINITIONS
// =============================================================================
export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "tech-minimalist",
    name: "Tech Minimalist",
    description: "Maximum white space, Helvetica, subtle blue accents",
    usage: "90% - Startups, tech companies, remote roles",
    preamble: TECH_MINIMALIST_PREAMBLE,
    structure: "tech-minimalist", // Used as identifier for structure generation
  },
  {
    id: "modern-clean",
    name: "Modern Clean",
    description: "Balanced spacing, thin dividers, professional polish",
    usage: "5% - Product companies, design-focused teams",
    preamble: MODERN_CLEAN_PREAMBLE,
    structure: "modern-clean",
  },
  {
    id: "contemporary-professional",
    name: "Contemporary Professional",
    description: "Serif font, black only, traditional formal style",
    usage: "5% - Enterprise, banks, consultancies",
    preamble: CONTEMPORARY_PROFESSIONAL_PREAMBLE,
    structure: "contemporary-professional",
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: CVTemplateId): CVTemplate {
  const template = CV_TEMPLATES.find((t) => t.id === id);
  if (!template) {
    throw new Error(`Template not found: ${id}`);
  }
  return template;
}

/**
 * Escape special LaTeX characters in text
 */
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Generate Tech Minimalist body from extracted content
 */
function generateTechMinimalistBody(content: ExtractedCVContent): string {
  let body = "";

  // Header
  body += `% === HEADER (CENTERED, CLEAN) ===
\\begin{center}
    {\\LARGE\\bfseries ${escapeLatex(content.name)}} 
    
    \\vspace{8pt}
    
    {\\large ${escapeLatex(content.title)}}
    
    \\vspace{10pt}
    
    \\small
    \\href{mailto:${content.contact.email}}{${escapeLatex(content.contact.email)}} ~•~
    ${escapeLatex(content.contact.phone)} ~•~
    ${escapeLatex(content.contact.location)}
    
    \\vspace{4pt}
    
`;
  if (content.contact.linkedin) {
    body += `    \\href{${content.contact.linkedin}}{LinkedIn}`;
  }
  if (content.contact.github) {
    body += ` ~•~\n    \\href{${content.contact.github}}{GitHub}`;
  }
  if (content.contact.website) {
    body += ` ~•~\n    \\href{${content.contact.website}}{Website}`;
  }
  body += `
\\end{center}

\\vspace{12pt}

`;

  // Summary
  body += `% === SUMMARY ===
\\section{About}
${escapeLatex(content.summary)}

`;

  // Skills
  body += `% === TECHNICAL SKILLS ===
\\section{Technical Skills}

`;
  for (const skill of content.skills) {
    body += `\\textbf{${escapeLatex(skill.category)}:} ${escapeLatex(skill.items)}\n\n`;
  }

  // Experience
  body += `% === EXPERIENCE ===
\\section{Experience}

`;
  for (let i = 0; i < content.experience.length; i++) {
    const exp = content.experience[i]!;
    body += `\\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.startDate)} – ${escapeLatex(exp.endDate)} \\\\
\\textit{${escapeLatex(exp.company)}} \\hfill \\textit{${escapeLatex(exp.location)}}

\\begin{itemize}
`;
    for (const bullet of exp.bullets) {
      body += `    \\item ${escapeLatex(bullet)}\n`;
    }
    body += `\\end{itemize}

`;
    if (i < content.experience.length - 1) {
      body += `\\vspace{8pt}

`;
    }
  }

  // Projects
  if (content.projects && content.projects.length > 0) {
    body += `% === PERSONAL PROJECTS ===
\\section{Personal Projects}

`;
    for (let i = 0; i < content.projects.length; i++) {
      const proj = content.projects[i]!;
      body += `\\textbf{${escapeLatex(proj.name)}}`;
      if (proj.url) {
        body += ` \\hfill \\href{${proj.url}}{GitHub}`;
      }
      body += `

\\begin{itemize}
`;
      for (const bullet of proj.bullets) {
        body += `    \\item ${escapeLatex(bullet)}\n`;
      }
      body += `\\end{itemize}

`;
      if (i < content.projects.length - 1) {
        body += `\\vspace{6pt}

`;
      }
    }
  }

  // Education
  body += `% === EDUCATION ===
\\section{Education}

`;
  for (const edu of content.education) {
    body += `\\textbf{${escapeLatex(edu.degree)}} \\hfill ${escapeLatex(edu.startDate)} – ${escapeLatex(edu.endDate)} \\\\
\\textit{${escapeLatex(edu.institution)}}

`;
  }

  // Languages
  if (content.languages && content.languages.length > 0) {
    body += `% === LANGUAGES ===
\\section{Languages}

`;
    const langParts = content.languages.map(
      (l) => `\\textbf{${escapeLatex(l.language)}:} ${escapeLatex(l.level)}`
    );
    body += langParts.join(" \\hspace{20pt} ") + "\n\n";
  }

  // Certifications
  if (content.certifications && content.certifications.length > 0) {
    body += `% === CERTIFICATIONS ===
\\section{Certifications}

\\begin{itemize}
`;
    for (const cert of content.certifications) {
      body += `    \\item ${escapeLatex(cert)}\n`;
    }
    body += `\\end{itemize}

`;
  }

  body += `\\end{document}`;
  return body;
}

/**
 * Generate Modern Clean body from extracted content
 */
function generateModernCleanBody(content: ExtractedCVContent): string {
  let body = "";

  // Header
  body += `% === HEADER ===
\\begin{center}
    {\\huge\\bfseries ${escapeLatex(content.name)}} \\\\ 
    \\vspace{6pt}
    {\\Large ${escapeLatex(content.title)}} \\\\ 
    \\vspace{8pt}
    \\small
    ${escapeLatex(content.contact.phone)} ~|~
    \\href{mailto:${content.contact.email}}{${escapeLatex(content.contact.email)}} ~|~
    ${escapeLatex(content.contact.location)}
    
    \\vspace{4pt}
`;
  if (content.contact.linkedin) {
    body += `    \\href{${content.contact.linkedin}}{linkedin.com/in/${content.contact.linkedin.split("/").pop()}}`;
  }
  if (content.contact.github) {
    body += ` ~|~\n    \\href{${content.contact.github}}{github.com/${content.contact.github.split("/").pop()}}`;
  }
  body += `
\\end{center}

\\vspace{8pt}

`;

  // Summary
  body += `% === SUMMARY ===
\\section{Summary}
${escapeLatex(content.summary)}

`;

  // Skills
  body += `% === TECHNICAL SKILLS ===
\\section{Technical Skills}

`;
  for (const skill of content.skills) {
    body += `\\textbf{${escapeLatex(skill.category)}:} ${escapeLatex(skill.items)}\n\n`;
  }

  // Experience
  body += `% === EXPERIENCE ===
\\section{Experience}

`;
  for (let i = 0; i < content.experience.length; i++) {
    const exp = content.experience[i]!;
    body += `\\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.startDate)} – ${escapeLatex(exp.endDate)} \\\\
\\textit{${escapeLatex(exp.company)}} \\hfill \\textit{${escapeLatex(exp.location)}}

\\begin{itemize}
`;
    for (const bullet of exp.bullets) {
      body += `    \\item ${escapeLatex(bullet)}\n`;
    }
    body += `\\end{itemize}

`;
    if (i < content.experience.length - 1) {
      body += `\\vspace{6pt}

`;
    }
  }

  // Projects
  if (content.projects && content.projects.length > 0) {
    body += `% === PERSONAL PROJECTS ===
\\section{Personal Projects}

`;
    for (let i = 0; i < content.projects.length; i++) {
      const proj = content.projects[i]!;
      body += `\\textbf{${escapeLatex(proj.name)}}`;
      if (proj.url) {
        body += ` \\hfill \\href{${proj.url}}{GitHub}`;
      }
      body += `

\\begin{itemize}
`;
      for (const bullet of proj.bullets) {
        body += `    \\item ${escapeLatex(bullet)}\n`;
      }
      body += `\\end{itemize}

`;
      if (i < content.projects.length - 1) {
        body += `\\vspace{4pt}

`;
      }
    }
  }

  // Education
  body += `% === EDUCATION ===
\\section{Education}

`;
  for (const edu of content.education) {
    body += `\\textbf{${escapeLatex(edu.degree)}} \\hfill ${escapeLatex(edu.startDate)} – ${escapeLatex(edu.endDate)} \\\\
\\textit{${escapeLatex(edu.institution)}}

`;
  }

  // Languages
  if (content.languages && content.languages.length > 0) {
    body += `% === LANGUAGES ===
\\section{Languages}

`;
    const langParts = content.languages.map(
      (l) => `\\textbf{${escapeLatex(l.language)}:} ${escapeLatex(l.level)}`
    );
    body += langParts.join(" \\hspace{20pt} ") + "\n\n";
  }

  // Certifications
  if (content.certifications && content.certifications.length > 0) {
    body += `% === CERTIFICATIONS ===
\\section{Certifications}

\\begin{itemize}
`;
    for (const cert of content.certifications) {
      body += `    \\item ${escapeLatex(cert)}\n`;
    }
    body += `\\end{itemize}

`;
  }

  body += `\\end{document}`;
  return body;
}

/**
 * Generate Contemporary Professional body from extracted content
 */
function generateContemporaryProfessionalBody(content: ExtractedCVContent): string {
  let body = "";

  // Header
  body += `% === HEADER ===
\\begin{center}
    {\\Huge \\scshape ${escapeLatex(content.name)}} \\\\ \\vspace{8pt}
    {\\Large \\scshape ${escapeLatex(content.title)}} \\\\ \\vspace{10pt}
    \\small
    ${escapeLatex(content.contact.phone)}
    \\hspace{10pt} | \\hspace{10pt}
    \\href{mailto:${content.contact.email}}{${escapeLatex(content.contact.email)}}
    \\hspace{10pt} | \\hspace{10pt}
    ${escapeLatex(content.contact.location)}
`;
  if (content.contact.linkedin) {
    body += `    \\hspace{10pt} | \\hspace{10pt}
    \\href{${content.contact.linkedin}}{linkedin.com/in/${content.contact.linkedin.split("/").pop()}}`;
  }
  if (content.contact.github) {
    body += `
    \\hspace{10pt} | \\hspace{10pt}
    \\href{${content.contact.github}}{github.com/${content.contact.github.split("/").pop()}}`;
  }
  body += `
\\end{center}

`;

  // Summary
  body += `% === SUMMARY ===
\\section{Summary}
\\vspace{4pt}
${escapeLatex(content.summary)}

`;

  // Skills
  body += `% === TECHNICAL SKILLS ===
\\section{Technical Skills}
\\vspace{4pt}
\\begin{itemize}[leftmargin=1.2em]
`;
  for (const skill of content.skills) {
    body += `    \\item \\textbf{${escapeLatex(skill.category)}:} ${escapeLatex(skill.items)}\n`;
  }
  body += `\\end{itemize}

`;

  // Experience
  body += `% === EXPERIENCE ===
\\section{Experience}
\\vspace{4pt}
\\begin{itemize}
`;
  for (let i = 0; i < content.experience.length; i++) {
    const exp = content.experience[i]!;
    body += `    \\item \\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.startDate)} – ${escapeLatex(exp.endDate)}
    \\item \\textit{${escapeLatex(exp.company)}} \\hfill \\textit{${escapeLatex(exp.location)}}
    \\begin{itemize}
`;
    for (const bullet of exp.bullets) {
      body += `        \\item ${escapeLatex(bullet)}\n`;
    }
    body += `    \\end{itemize}
    
`;
    if (i < content.experience.length - 1) {
      body += `    \\vspace{6pt}
    
`;
    }
  }
  body += `\\end{itemize}

`;

  // Projects
  if (content.projects && content.projects.length > 0) {
    body += `% === PROJECTS ===
\\section{Personal Projects}
\\vspace{4pt}
\\begin{itemize}
`;
    for (const proj of content.projects) {
      body += `    \\item \\textbf{${escapeLatex(proj.name)}}`;
      if (proj.url) {
        body += ` \\hfill \\href{${proj.url}}{${proj.url.replace("https://", "")}}`;
      }
      body += `
    \\begin{itemize}
`;
      for (const bullet of proj.bullets) {
        body += `        \\item ${escapeLatex(bullet)}\n`;
      }
      body += `    \\end{itemize}
    
    \\vspace{6pt}
    
`;
    }
    body += `\\end{itemize}

`;
  }

  // Education & Languages side by side
  body += `% === EDUCATION & LANGUAGES ===
\\begin{tabular}[t]{@{}p{3.25in}}
    \\section{Education}
    \\vspace{4pt}
`;
  for (const edu of content.education) {
    body += `    \\textbf{${escapeLatex(edu.degree)}} \\hfill ${escapeLatex(edu.startDate)} – ${escapeLatex(edu.endDate)} \\\\
    \\textit{${escapeLatex(edu.institution)}}
`;
  }
  body += `\\end{tabular}
\\begin{tabular}[t]{@{}p{3.25in}}
    \\section{Languages}
    \\vspace{4pt}
`;
  if (content.languages && content.languages.length > 0) {
    for (const lang of content.languages) {
      body += `    \\textbf{${escapeLatex(lang.language)}:} ${escapeLatex(lang.level)} \\\\\n`;
    }
  }
  body += `\\end{tabular}

`;

  // Certifications
  if (content.certifications && content.certifications.length > 0) {
    body += `% === CERTIFICATIONS ===
\\section{Certifications}
\\vspace{4pt}
\\begin{itemize}[leftmargin=1.2em]
`;
    for (const cert of content.certifications) {
      body += `    \\item ${escapeLatex(cert)}\n`;
    }
    body += `\\end{itemize}

`;
  }

  body += `\\end{document}`;
  return body;
}

/**
 * Generate complete LaTeX document from extracted content and template
 */
export function generateLatexFromContent(
  content: ExtractedCVContent,
  templateId: CVTemplateId
): string {
  const template = getTemplate(templateId);

  let body: string;
  switch (templateId) {
    case "tech-minimalist":
      body = generateTechMinimalistBody(content);
      break;
    case "modern-clean":
      body = generateModernCleanBody(content);
      break;
    case "contemporary-professional":
      body = generateContemporaryProfessionalBody(content);
      break;
    default:
      throw new Error(`Unknown template: ${templateId}`);
  }

  return template.preamble + body;
}

/**
 * JSON schema for AI content extraction prompt
 */
export const CV_CONTENT_JSON_SCHEMA = `{
  "name": "Full Name",
  "title": "Job Title",
  "contact": {
    "email": "email@example.com",
    "phone": "+1 234 567 8900",
    "location": "City, Country",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username",
    "website": "https://example.com"
  },
  "summary": "Professional summary paragraph...",
  "skills": [
    { "category": "Frontend", "items": "React, TypeScript, Next.js" },
    { "category": "Testing", "items": "Jest, React Testing Library" }
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "Jan 2023",
      "endDate": "Present",
      "bullets": [
        "Achievement or responsibility 1",
        "Achievement or responsibility 2"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "startDate": "2019",
      "endDate": "2023"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "url": "https://github.com/user/project",
      "bullets": [
        "What you built and technologies used",
        "Key achievement or feature"
      ]
    }
  ],
  "certifications": [
    "Certification Name - Provider (Year)"
  ],
  "languages": [
    { "language": "English", "level": "Native" },
    { "language": "Spanish", "level": "Professional" }
  ]
}`;
