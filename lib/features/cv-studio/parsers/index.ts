/**
 * CV Parsers - Multi-Format Document Parsing
 *
 * This module handles extracting text and structured data from various
 * document formats (PDF, DOCX, TXT, JSON).
 *
 * @learning Document parsing, text extraction, regex patterns
 * @see https://mozilla.github.io/pdf.js/ - PDF.js
 * @see https://github.com/mwilliamson/mammoth.js - Mammoth.js for DOCX
 */

import { CV, ParseResult, SupportedFormat, createEmptyCV } from "../types";
import { readFileAsArrayBuffer, readFileAsText } from "../file-upload";

// ===================
// MAIN PARSER
// ===================

/**
 * Parse CV from file
 *
 * Routes to appropriate parser based on format.
 *
 * @example
 * ```typescript
 * const result = await parseCV(file, 'pdf');
 * if (result.success) {
 *   setCVData(result.cv);
 * } else {
 *   showErrors(result.errors);
 * }
 * ```
 */
export async function parseCV(
  file: File,
  format: SupportedFormat
): Promise<ParseResult> {
  try {
    switch (format) {
      case "pdf":
        return await parsePDF(file);
      case "docx":
        return await parseDOCX(file);
      case "txt":
        return await parseTXT(file);
      case "json":
        return await parseJSON(file);
      case "rtf":
        return await parseRTF(file);
      default:
        return {
          success: false,
          confidence: 0,
          errors: [{ field: "format", message: `Unsupported format: ${format}` }],
          warnings: [],
        };
    }
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      errors: [
        {
          field: "parsing",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      ],
      warnings: [],
    };
  }
}

// ===================
// PDF PARSER
// ===================

/**
 * Parse PDF file
 *
 * @learning PDF.js for client-side PDF parsing
 * @see https://mozilla.github.io/pdf.js/
 *
 * TODO: Install and configure PDF.js
 * ```bash
 * npm install pdfjs-dist
 * ```
 *
 * TODO: Implement PDF text extraction
 * - Load PDF document
 * - Iterate through pages
 * - Extract text content from each page
 * - Combine into single string
 */
async function parsePDF(file: File): Promise<ParseResult> {
  const buffer = await readFileAsArrayBuffer(file);

  // TODO: Implement PDF parsing with pdfjs-dist
  //
  // import * as pdfjsLib from 'pdfjs-dist';
  //
  // // Set worker source (required)
  // pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  //
  // const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  // let fullText = '';
  //
  // for (let i = 1; i <= pdf.numPages; i++) {
  //   const page = await pdf.getPage(i);
  //   const textContent = await page.getTextContent();
  //   const pageText = textContent.items
  //     .map((item: any) => item.str)
  //     .join(' ');
  //   fullText += pageText + '\n';
  // }
  //
  // return extractCVData(fullText);

  // Placeholder until PDF.js is installed
  return {
    success: false,
    confidence: 0,
    errors: [
      {
        field: "pdf",
        message: "PDF parsing not yet implemented",
        suggestion: "Install pdfjs-dist: npm install pdfjs-dist",
      },
    ],
    warnings: ["PDF parsing requires pdfjs-dist package"],
  };
}

// ===================
// DOCX PARSER
// ===================

/**
 * Parse DOCX file
 *
 * @learning Mammoth.js for DOCX parsing
 * @see https://github.com/mwilliamson/mammoth.js
 *
 * TODO: Install mammoth.js
 * ```bash
 * npm install mammoth
 * ```
 *
 * TODO: Implement DOCX parsing
 * - Use mammoth.extractRawText() for plain text
 * - Or mammoth.convertToHtml() for formatted text
 */
async function parseDOCX(file: File): Promise<ParseResult> {
  const buffer = await readFileAsArrayBuffer(file);

  // TODO: Implement DOCX parsing with mammoth
  //
  // import mammoth from 'mammoth';
  //
  // const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  // const text = result.value;
  //
  // return extractCVData(text);

  // Placeholder until mammoth is installed
  return {
    success: false,
    confidence: 0,
    errors: [
      {
        field: "docx",
        message: "DOCX parsing not yet implemented",
        suggestion: "Install mammoth: npm install mammoth",
      },
    ],
    warnings: ["DOCX parsing requires mammoth package"],
  };
}

// ===================
// TXT PARSER
// ===================

/**
 * Parse plain text file
 *
 * Simplest format - just extract text and parse structure.
 */
async function parseTXT(file: File): Promise<ParseResult> {
  const text = await readFileAsText(file);
  return extractCVData(text);
}

// ===================
// JSON PARSER
// ===================

/**
 * Parse JSON file
 *
 * Expects JSON Resume format or our CV format.
 *
 * @see https://jsonresume.org/schema/ - JSON Resume standard
 */
async function parseJSON(file: File): Promise<ParseResult> {
  const text = await readFileAsText(file);

  try {
    const data = JSON.parse(text);

    // Check if it's JSON Resume format
    if (data.basics || data.work || data.education) {
      return convertJSONResume(data);
    }

    // Check if it's our CV format
    if (data.personalInfo || data.experience) {
      return {
        success: true,
        cv: data as CV,
        rawText: text,
        confidence: 100,
        errors: [],
        warnings: [],
      };
    }

    return {
      success: false,
      confidence: 0,
      errors: [
        {
          field: "json",
          message: "Unrecognized JSON format",
          suggestion: "Use JSON Resume format or our CV format",
        },
      ],
      warnings: [],
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      errors: [
        {
          field: "json",
          message: "Invalid JSON",
        },
      ],
      warnings: [],
    };
  }
}

/**
 * Convert JSON Resume format to our CV format
 *
 * @see https://jsonresume.org/schema/
 */
function convertJSONResume(data: any): ParseResult {
  // TODO: Implement JSON Resume conversion
  // Map fields from JSON Resume schema to our CV type

  const cv = createEmptyCV();

  // Map basics
  if (data.basics) {
    cv.personalInfo.firstName = data.basics.name?.split(" ")[0] || "";
    cv.personalInfo.lastName =
      data.basics.name?.split(" ").slice(1).join(" ") || "";
    cv.personalInfo.email = data.basics.email || "";
    cv.personalInfo.phone = data.basics.phone || "";
    cv.personalInfo.location = data.basics.location?.city || "";
    cv.summary = data.basics.summary || "";

    // Map profiles
    if (data.basics.profiles) {
      for (const profile of data.basics.profiles) {
        if (profile.network?.toLowerCase() === "linkedin") {
          cv.personalInfo.linkedin = profile.url;
        } else if (profile.network?.toLowerCase() === "github") {
          cv.personalInfo.github = profile.url;
        }
      }
    }
  }

  // TODO: Map work experience
  // TODO: Map education
  // TODO: Map skills
  // TODO: Map other sections

  return {
    success: true,
    cv,
    confidence: 80,
    errors: [],
    warnings: ["Some fields may need manual verification"],
  };
}

// ===================
// RTF PARSER
// ===================

/**
 * Parse RTF file
 *
 * RTF is complex - consider using a library.
 */
async function parseRTF(file: File): Promise<ParseResult> {
  const text = await readFileAsText(file);

  // Basic RTF stripping - remove control words
  // This is very basic and loses formatting
  const plainText = text
    .replace(/\\[a-z]+\d* ?/gi, "") // Remove control words
    .replace(/[{}]/g, "") // Remove braces
    .replace(/\\\*/g, "") // Remove escaped asterisks
    .trim();

  return extractCVData(plainText);
}

// ===================
// TEXT EXTRACTION
// ===================

/**
 * Extract structured CV data from plain text
 *
 * @learning Regex patterns, NLP basics, heuristic parsing
 *
 * This is the core intelligence - identifying sections and extracting data.
 */
export function extractCVData(text: string): ParseResult {
  const cv = createEmptyCV();
  const errors: ParseResult["errors"] = [];
  const warnings: string[] = [];
  let confidence = 0;

  // Clean and normalize text
  const cleanedText = normalizeText(text);

  // TODO: Extract personal info
  const personalInfo = extractPersonalInfo(cleanedText);
  if (personalInfo) {
    cv.personalInfo = { ...cv.personalInfo, ...personalInfo };
    confidence += 20;
  } else {
    errors.push({
      field: "personalInfo",
      message: "Could not extract contact information",
      suggestion: "Please fill in your contact details manually",
    });
  }

  // TODO: Extract summary/objective
  const summary = extractSummary(cleanedText);
  if (summary) {
    cv.summary = summary;
    confidence += 10;
  }

  // TODO: Extract experience
  const experience = extractExperience(cleanedText);
  if (experience.length > 0) {
    cv.experience = experience;
    confidence += 25;
  } else {
    warnings.push("Could not extract work experience - please add manually");
  }

  // TODO: Extract education
  const education = extractEducation(cleanedText);
  if (education.length > 0) {
    cv.education = education;
    confidence += 20;
  }

  // TODO: Extract skills
  const skills = extractSkills(cleanedText);
  if (skills.length > 0) {
    cv.skills = skills;
    confidence += 15;
  }

  // TODO: Extract other sections
  // certifications, languages, projects, etc.

  cv.metadata.parsingConfidence = confidence;
  cv.metadata.sourceFormat = "txt";

  return {
    success: confidence >= 30,
    cv,
    rawText: text,
    confidence,
    errors,
    warnings,
  };
}

// ===================
// EXTRACTION HELPERS
// ===================

/**
 * Normalize text for parsing
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\t/g, " ") // Replace tabs with spaces
    .replace(/ +/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Extract personal/contact information
 *
 * @learning Regex for email, phone, URL patterns
 */
function extractPersonalInfo(
  text: string
): Partial<CV["personalInfo"]> | null {
  const info: Partial<CV["personalInfo"]> = {};

  // Email pattern
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  // Phone pattern (various formats)
  const phoneMatch = text.match(
    /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  );
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }

  // LinkedIn URL
  const linkedinMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i
  );
  if (linkedinMatch) {
    info.linkedin = linkedinMatch[0];
  }

  // GitHub URL
  const githubMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i
  );
  if (githubMatch) {
    info.github = githubMatch[0];
  }

  // Name extraction is tricky - often first line or after common headers
  // This is a simple heuristic
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If first line looks like a name (2-4 words, capitalized)
    const nameMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
    if (nameMatch) {
      const nameParts = nameMatch[1].split(" ");
      info.firstName = nameParts[0];
      info.lastName = nameParts.slice(1).join(" ");
    }
  }

  return Object.keys(info).length > 0 ? info : null;
}

/**
 * Extract summary/objective section
 */
function extractSummary(text: string): string | null {
  // Look for common summary headers
  const summaryPatterns = [
    /(?:summary|profile|objective|about\s*me)[:\s]*\n([\s\S]*?)(?:\n\n|\n(?=[A-Z]))/i,
  ];

  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract work experience
 *
 * @learning Section detection, date parsing
 */
function extractExperience(text: string): CV["experience"] {
  const experiences: CV["experience"] = [];

  // TODO: Implement experience extraction
  // 1. Find experience section (headers: Experience, Work History, Employment)
  // 2. Split into individual entries
  // 3. Extract: company, title, dates, description

  // Common date patterns
  // - Jan 2020 - Present
  // - 2020-2023
  // - January 2020 to December 2023

  return experiences;
}

/**
 * Extract education
 */
function extractEducation(text: string): CV["education"] {
  const education: CV["education"] = [];

  // TODO: Implement education extraction
  // Look for degree keywords: Bachelor, Master, PhD, B.S., M.S., etc.
  // Look for institution names
  // Extract graduation dates

  return education;
}

/**
 * Extract skills
 *
 * @learning Keyword extraction, skill taxonomies
 */
function extractSkills(text: string): CV["skills"] {
  const skills: CV["skills"] = [];

  // TODO: Implement skill extraction
  // 1. Find skills section
  // 2. Look for common skill keywords
  // 3. Categorize skills (technical, soft, etc.)

  // Common technical skills to look for
  const techSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "SQL",
    "Git",
    "AWS",
    "Docker",
  ];

  const lowercaseText = text.toLowerCase();
  for (const skill of techSkills) {
    if (lowercaseText.includes(skill.toLowerCase())) {
      skills.push({
        id: `skill-${skills.length}`,
        name: skill,
        category: "technical",
      });
    }
  }

  return skills;
}

// ===================
// EXPORTS
// ===================

export {
  parsePDF,
  parseDOCX,
  parseTXT,
  parseJSON,
  parseRTF,
  extractPersonalInfo,
  extractSummary,
  extractExperience,
  extractEducation,
  extractSkills,
};
