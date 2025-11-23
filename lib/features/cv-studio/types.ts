/**
 * CV Studio Types
 *
 * Comprehensive type definitions for CV data structures.
 * These types represent parsed CV data that can be edited and exported.
 *
 * @learning File API, structured data parsing
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_API
 */

// ===================
// CORE CV STRUCTURE
// ===================

export interface CV {
  id: string;
  /** Personal/contact information */
  personalInfo: PersonalInfo;
  /** Professional summary or objective */
  summary: string;
  /** Work experience entries */
  experience: Experience[];
  /** Education entries */
  education: Education[];
  /** Skills organized by category */
  skills: Skill[];
  /** Certifications and licenses */
  certifications: Certification[];
  /** Languages spoken */
  languages: Language[];
  /** Projects and portfolio items */
  projects: Project[];
  /** Additional sections (volunteer, publications, etc.) */
  customSections: CustomSection[];
  /** Metadata about the CV */
  metadata: CVMetadata;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  /** Additional links or profiles */
  additionalLinks: { label: string; url: string }[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  /** Bullet points for achievements */
  achievements: string[];
  /** Technologies or skills used */
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  achievements: string[];
}

export interface Skill {
  id: string;
  name: string;
  /** Skill category: technical, soft, language, tool, etc. */
  category: SkillCategory;
  /** Proficiency level 1-5 */
  level?: number;
}

export type SkillCategory =
  | "technical"
  | "soft"
  | "language"
  | "tool"
  | "framework"
  | "other";

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: "native" | "fluent" | "advanced" | "intermediate" | "basic";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: { label: string; value: string }[];
}

export interface CVMetadata {
  createdAt: Date;
  updatedAt: Date;
  /** Source file name if imported */
  sourceFile?: string;
  /** Source format */
  sourceFormat?: SupportedFormat;
  /** Parsing confidence score 0-100 */
  parsingConfidence?: number;
  /** Fields that may need manual review */
  flaggedFields: string[];
}

// ===================
// FILE HANDLING
// ===================

export type SupportedFormat = "pdf" | "docx" | "doc" | "txt" | "json" | "rtf";

export interface FileUploadResult {
  success: boolean;
  file?: File;
  format?: SupportedFormat;
  error?: string;
}

export interface ParseResult {
  success: boolean;
  cv?: Partial<CV>;
  rawText?: string;
  confidence: number;
  errors: ParseError[];
  warnings: string[];
}

export interface ParseError {
  field: string;
  message: string;
  suggestion?: string;
}

// ===================
// AI ANALYSIS
// ===================

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferredQualifications: string[];
  keywords: string[];
}

export interface CVAnalysisResult {
  /** Overall match score 0-100 */
  overallScore: number;
  /** Breakdown by category */
  categoryScores: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  /** Matching skills/keywords found */
  matches: {
    skills: string[];
    keywords: string[];
    experience: string[];
  };
  /** Missing but required items */
  gaps: {
    skills: string[];
    keywords: string[];
    experience: string[];
  };
  /** AI-generated suggestions for improvement */
  suggestions: CVSuggestion[];
  /** Generated cover letter */
  coverLetter?: string;
}

export interface CVSuggestion {
  id: string;
  section: keyof CV;
  type: "add" | "modify" | "remove" | "reorder";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  /** Original value if modifying */
  original?: string;
  /** Suggested new value */
  suggested?: string;
  /** Whether the suggestion was applied */
  applied: boolean;
}

// ===================
// EXPORT OPTIONS
// ===================

export interface ExportOptions {
  format: "pdf" | "docx" | "json";
  template: CVTemplate;
  includeCoverLetter: boolean;
  coverLetterText?: string;
  /** Custom styling options */
  styling: ExportStyling;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  /** Preview image URL */
  preview?: string;
  /** Layout type */
  layout: "single-column" | "two-column" | "modern" | "classic";
}

export interface ExportStyling {
  primaryColor: string;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  spacing: "compact" | "normal" | "spacious";
  showPhoto: boolean;
  showIcons: boolean;
}

// ===================
// STATE MANAGEMENT
// ===================

export interface CVStudioState {
  /** Current CV being edited */
  currentCV: CV | null;
  /** Job description for analysis */
  jobDescription: JobDescription | null;
  /** Analysis results */
  analysis: CVAnalysisResult | null;
  /** UI state */
  ui: {
    activeSection: string;
    isImporting: boolean;
    isAnalyzing: boolean;
    isExporting: boolean;
    showPreview: boolean;
  };
  /** Edit history for undo/redo */
  history: {
    past: CV[];
    future: CV[];
  };
}

// ===================
// HELPER FUNCTIONS
// ===================

/**
 * Create an empty CV structure
 */
export function createEmptyCV(): CV {
  return {
    id: generateId(),
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      additionalLinks: [],
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
    customSections: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      flaggedFields: [],
    },
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return [".pdf", ".docx", ".doc", ".txt", ".json", ".rtf"];
}

/**
 * Detect format from file
 */
export function detectFormat(file: File): SupportedFormat | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const formatMap: Record<string, SupportedFormat> = {
    pdf: "pdf",
    docx: "docx",
    doc: "doc",
    txt: "txt",
    json: "json",
    rtf: "rtf",
  };
  return formatMap[extension || ""] || null;
}
