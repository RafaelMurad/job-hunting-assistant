/**
 * CV Exporter - PDF Generation
 *
 * Generates professional PDF documents from CV data.
 * Supports multiple templates and styling options.
 *
 * @learning PDF generation, document layout, print stylesheets
 * @see https://react-pdf.org/ - React-PDF (recommended)
 * @see https://pdfmake.github.io/docs/ - PDFMake alternative
 */

import {
  CV,
  ExportOptions,
  CVTemplate,
  ExportStyling,
} from "./types";

// ===================
// CONSTANTS
// ===================

/**
 * Available CV templates
 */
export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional single-column layout, great for conservative industries",
    layout: "single-column",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Two-column layout with sidebar for skills and contact info",
    layout: "two-column",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, simple design focusing on content",
    layout: "single-column",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design with color accents, great for creative roles",
    layout: "modern",
  },
];

/**
 * Default styling options
 */
export const DEFAULT_STYLING: ExportStyling = {
  primaryColor: "#0070c4", // Fjord blue
  fontFamily: "Helvetica",
  fontSize: "medium",
  spacing: "normal",
  showPhoto: false,
  showIcons: true,
};

// ===================
// MAIN EXPORTER
// ===================

/**
 * Export CV to PDF
 *
 * @learning PDF generation approaches:
 * 1. React-PDF: React components to PDF (recommended)
 * 2. PDFMake: JSON-based document definition
 * 3. Print CSS: Window.print() with print stylesheets
 * 4. Canvas: HTML to Canvas to PDF
 *
 * TODO: Implement full PDF generation
 * ```bash
 * npm install @react-pdf/renderer
 * ```
 */
export async function exportToPDF(
  cv: CV,
  options: ExportOptions
): Promise<Blob> {
  const { template, styling, includeCoverLetter, coverLetterText } = options;

  // TODO: Implement with @react-pdf/renderer
  //
  // import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
  //
  // const styles = createStyles(styling);
  // const CVDocument = createCVDocument(cv, template, styles);
  //
  // const blob = await pdf(<CVDocument />).toBlob();
  // return blob;

  // Placeholder: Use HTML-to-PDF approach
  const html = generateCVHTML(cv, template, styling);
  const combinedHtml = includeCoverLetter && coverLetterText
    ? `${html}<div class="page-break"></div>${generateCoverLetterHTML(coverLetterText, cv, styling)}`
    : html;

  return await htmlToPDFBlob(combinedHtml);
}

/**
 * Export CV to DOCX
 *
 * @learning DOCX generation with docx library
 * @see https://docx.js.org/
 *
 * TODO: Implement DOCX export
 * ```bash
 * npm install docx
 * ```
 */
export async function exportToDOCX(
  cv: CV,
  options: ExportOptions
): Promise<Blob> {
  // TODO: Implement with docx library
  //
  // import { Document, Packer, Paragraph, TextRun } from 'docx';
  //
  // const doc = new Document({
  //   sections: [{ properties: {}, children: [...] }]
  // });
  //
  // return await Packer.toBlob(doc);

  throw new Error("DOCX export not yet implemented. Install docx: npm install docx");
}

/**
 * Export CV to JSON
 *
 * @learning JSON Resume format for interoperability
 * @see https://jsonresume.org/schema/
 */
export async function exportToJSON(cv: CV): Promise<Blob> {
  // Convert to JSON Resume format for compatibility
  const jsonResume = convertToJSONResume(cv);
  const json = JSON.stringify(jsonResume, null, 2);
  return new Blob([json], { type: "application/json" });
}

// ===================
// HTML GENERATION
// ===================

/**
 * Generate HTML from CV data
 *
 * This HTML can be:
 * - Printed using window.print()
 * - Converted to PDF using browser APIs
 * - Used for preview
 */
function generateCVHTML(
  cv: CV,
  template: CVTemplate,
  styling: ExportStyling
): string {
  const cssVars = generateCSSVariables(styling);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${cssVars}
    ${getTemplateCSS(template)}
    ${getBaseCSS()}
  </style>
</head>
<body>
  <div class="cv-container ${template.layout}">
    ${generateHeader(cv)}
    ${generateSummary(cv)}
    ${generateExperience(cv)}
    ${generateEducation(cv)}
    ${generateSkills(cv)}
    ${cv.certifications.length > 0 ? generateCertifications(cv) : ""}
    ${cv.projects.length > 0 ? generateProjects(cv) : ""}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate cover letter HTML
 */
function generateCoverLetterHTML(
  content: string,
  cv: CV,
  styling: ExportStyling
): string {
  const cssVars = generateCSSVariables(styling);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${cssVars}
    ${getBaseCSS()}
    .cover-letter {
      max-width: 700px;
      margin: 0 auto;
      padding: 60px 40px;
      font-size: var(--font-size);
      line-height: 1.8;
    }
    .cover-letter-header {
      margin-bottom: 40px;
    }
    .cover-letter-body {
      white-space: pre-line;
    }
  </style>
</head>
<body>
  <div class="cover-letter">
    <div class="cover-letter-header">
      <h1>${cv.personalInfo.firstName} ${cv.personalInfo.lastName}</h1>
      <p>${cv.personalInfo.email} | ${cv.personalInfo.phone}</p>
      <p>${new Date().toLocaleDateString()}</p>
    </div>
    <div class="cover-letter-body">
      ${content}
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ===================
// HTML HELPERS
// ===================

function generateHeader(cv: CV): string {
  const { personalInfo } = cv;
  const links = [
    personalInfo.linkedin && `<a href="${personalInfo.linkedin}">LinkedIn</a>`,
    personalInfo.github && `<a href="${personalInfo.github}">GitHub</a>`,
    personalInfo.portfolio && `<a href="${personalInfo.portfolio}">Portfolio</a>`,
  ].filter(Boolean);

  return `
    <header class="cv-header">
      <h1>${personalInfo.firstName} ${personalInfo.lastName}</h1>
      <div class="contact-info">
        <span>${personalInfo.email}</span>
        <span>${personalInfo.phone}</span>
        <span>${personalInfo.location}</span>
      </div>
      ${links.length > 0 ? `<div class="links">${links.join(" | ")}</div>` : ""}
    </header>
  `;
}

function generateSummary(cv: CV): string {
  if (!cv.summary) return "";
  return `
    <section class="cv-section summary">
      <h2>Professional Summary</h2>
      <p>${cv.summary}</p>
    </section>
  `;
}

function generateExperience(cv: CV): string {
  if (cv.experience.length === 0) return "";
  return `
    <section class="cv-section experience">
      <h2>Experience</h2>
      ${cv.experience.map((exp) => `
        <div class="experience-item">
          <div class="item-header">
            <h3>${exp.position}</h3>
            <span class="dates">${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}</span>
          </div>
          <div class="company">${exp.company}${exp.location ? ` | ${exp.location}` : ""}</div>
          <p>${exp.description}</p>
          ${exp.achievements.length > 0 ? `
            <ul>
              ${exp.achievements.map((a) => `<li>${a}</li>`).join("")}
            </ul>
          ` : ""}
        </div>
      `).join("")}
    </section>
  `;
}

function generateEducation(cv: CV): string {
  if (cv.education.length === 0) return "";
  return `
    <section class="cv-section education">
      <h2>Education</h2>
      ${cv.education.map((edu) => `
        <div class="education-item">
          <div class="item-header">
            <h3>${edu.degree} in ${edu.field}</h3>
            <span class="dates">${formatDate(edu.endDate) || "Present"}</span>
          </div>
          <div class="institution">${edu.institution}</div>
          ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ""}
        </div>
      `).join("")}
    </section>
  `;
}

function generateSkills(cv: CV): string {
  if (cv.skills.length === 0) return "";

  // Group by category
  const grouped = cv.skills.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  return `
    <section class="cv-section skills">
      <h2>Skills</h2>
      <div class="skills-grid">
        ${Object.entries(grouped).map(([category, skills]) => `
          <div class="skill-category">
            <h4>${capitalizeFirst(category)}</h4>
            <p>${skills.join(", ")}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function generateCertifications(cv: CV): string {
  return `
    <section class="cv-section certifications">
      <h2>Certifications</h2>
      <ul>
        ${cv.certifications.map((cert) => `
          <li>${cert.name} - ${cert.issuer} (${formatDate(cert.date)})</li>
        `).join("")}
      </ul>
    </section>
  `;
}

function generateProjects(cv: CV): string {
  return `
    <section class="cv-section projects">
      <h2>Projects</h2>
      ${cv.projects.map((proj) => `
        <div class="project-item">
          <h3>${proj.name}</h3>
          <p>${proj.description}</p>
          ${proj.technologies.length > 0 ? `
            <div class="technologies">${proj.technologies.join(", ")}</div>
          ` : ""}
        </div>
      `).join("")}
    </section>
  `;
}

// ===================
// CSS GENERATION
// ===================

function generateCSSVariables(styling: ExportStyling): string {
  const fontSizes = {
    small: "10pt",
    medium: "11pt",
    large: "12pt",
  };

  const spacings = {
    compact: "8px",
    normal: "16px",
    spacious: "24px",
  };

  return `
    :root {
      --primary-color: ${styling.primaryColor};
      --font-family: ${styling.fontFamily}, sans-serif;
      --font-size: ${fontSizes[styling.fontSize]};
      --spacing: ${spacings[styling.spacing]};
    }
  `;
}

function getTemplateCSS(template: CVTemplate): string {
  const templates: Record<string, string> = {
    "single-column": `
      .cv-container { max-width: 700px; margin: 0 auto; }
    `,
    "two-column": `
      .cv-container {
        display: grid;
        grid-template-columns: 1fr 250px;
        gap: 30px;
        max-width: 900px;
        margin: 0 auto;
      }
      .cv-section.skills,
      .cv-section.certifications {
        grid-column: 2;
      }
    `,
    modern: `
      .cv-container { max-width: 800px; margin: 0 auto; }
      .cv-header { background: var(--primary-color); color: white; padding: 30px; }
    `,
    classic: `
      .cv-container { max-width: 700px; margin: 0 auto; }
    `,
  };

  return templates[template.layout] || templates["single-column"];
}

function getBaseCSS(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-family);
      font-size: var(--font-size);
      line-height: 1.5;
      color: #333;
    }
    .cv-container { padding: 40px; }
    .cv-header { text-align: center; margin-bottom: 30px; }
    .cv-header h1 { font-size: 24pt; margin-bottom: 10px; color: var(--primary-color); }
    .contact-info { font-size: 10pt; color: #666; }
    .contact-info span:not(:last-child)::after { content: " | "; }
    .links { margin-top: 8px; font-size: 10pt; }
    .links a { color: var(--primary-color); text-decoration: none; }
    .cv-section { margin-bottom: var(--spacing); }
    .cv-section h2 {
      font-size: 14pt;
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 4px;
      margin-bottom: 12px;
    }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .item-header h3 { font-size: 12pt; }
    .dates { font-size: 10pt; color: #666; }
    .company, .institution { font-weight: 500; color: #555; margin-bottom: 4px; }
    ul { margin-left: 20px; margin-top: 8px; }
    li { margin-bottom: 4px; }
    .skills-grid { display: grid; gap: 12px; }
    .skill-category h4 { font-size: 11pt; color: #555; }
    .experience-item, .education-item, .project-item { margin-bottom: 16px; }
    .page-break { page-break-after: always; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .cv-container { padding: 20px; }
    }
  `;
}

// ===================
// PDF CONVERSION
// ===================

/**
 * Convert HTML to PDF blob
 *
 * @learning Browser print APIs, html2canvas, jsPDF
 *
 * TODO: Implement proper PDF conversion
 * Options:
 * 1. window.print() - Simple, uses browser print dialog
 * 2. html2canvas + jsPDF - Client-side, no dependencies
 * 3. Puppeteer (server) - Best quality, requires API
 * 4. @react-pdf/renderer - React-native approach (recommended)
 */
async function htmlToPDFBlob(html: string): Promise<Blob> {
  // TODO: Implement with html2canvas + jsPDF
  //
  // import html2canvas from 'html2canvas';
  // import jsPDF from 'jspdf';
  //
  // const container = document.createElement('div');
  // container.innerHTML = html;
  // document.body.appendChild(container);
  //
  // const canvas = await html2canvas(container);
  // const imgData = canvas.toDataURL('image/png');
  //
  // const pdf = new jsPDF('p', 'mm', 'a4');
  // pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  //
  // document.body.removeChild(container);
  // return pdf.output('blob');

  // Placeholder: Return HTML as blob for now
  return new Blob([html], { type: "text/html" });
}

/**
 * Trigger browser print dialog
 *
 * @learning window.print() for simple PDF export
 */
export function printCV(cv: CV, template: CVTemplate, styling: ExportStyling) {
  const html = generateCVHTML(cv, template, styling);

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Download generated file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===================
// JSON RESUME
// ===================

/**
 * Convert to JSON Resume format
 *
 * @see https://jsonresume.org/schema/
 */
function convertToJSONResume(cv: CV): object {
  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`,
      email: cv.personalInfo.email,
      phone: cv.personalInfo.phone,
      summary: cv.summary,
      location: {
        city: cv.personalInfo.location,
      },
      profiles: [
        cv.personalInfo.linkedin && {
          network: "LinkedIn",
          url: cv.personalInfo.linkedin,
        },
        cv.personalInfo.github && {
          network: "GitHub",
          url: cv.personalInfo.github,
        },
      ].filter(Boolean),
    },
    work: cv.experience.map((exp) => ({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.current ? undefined : exp.endDate,
      summary: exp.description,
      highlights: exp.achievements,
    })),
    education: cv.education.map((edu) => ({
      institution: edu.institution,
      area: edu.field,
      studyType: edu.degree,
      startDate: edu.startDate,
      endDate: edu.current ? undefined : edu.endDate,
      gpa: edu.gpa,
    })),
    skills: cv.skills.map((skill) => ({
      name: skill.name,
      level: skill.level ? `${skill.level * 20}%` : undefined,
      keywords: [skill.category],
    })),
    certificates: cv.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      url: cert.credentialUrl,
    })),
    projects: cv.projects.map((proj) => ({
      name: proj.name,
      description: proj.description,
      url: proj.url,
      keywords: proj.technologies,
    })),
  };
}

// ===================
// UTILITIES
// ===================

function formatDate(date?: string): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return date;
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export {
  generateCVHTML,
  generateCoverLetterHTML,
  convertToJSONResume,
};
