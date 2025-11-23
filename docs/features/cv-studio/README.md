# CV Studio - Learning Guide

Complete CV management solution: import, edit, analyze with AI, and export professional PDFs.

## Overview

CV Studio is a comprehensive feature that combines multiple web technologies:

| Component | Technologies | Concepts |
|-----------|--------------|----------|
| File Upload | File API, Drag & Drop | Binary handling, validation |
| Document Parsing | PDF.js, Mammoth.js | Text extraction, regex patterns |
| Form Editor | React Forms | Controlled components, validation |
| AI Analysis | Streaming LLM | Prompt engineering, structured outputs |
| PDF Export | React-PDF | Document generation, layouts |

## Architecture

```
lib/features/cv-studio/
├── types.ts              # Type definitions
├── file-upload.ts        # File handling
├── parsers/
│   └── index.ts          # Multi-format parsing
├── analyzer.ts           # AI analysis
├── exporter.ts           # PDF generation
├── components/
│   └── CVEditor.tsx      # Form components
└── index.ts              # Public exports
```

## Learning Path

### Phase 1: File Handling (Week 1)

Learn browser file APIs and document parsing.

**Topics:**
- File API basics
- FileReader methods
- Drag and Drop API
- Binary data (ArrayBuffer)

**Resources:**
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN Drag and Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)

### Phase 2: Document Parsing (Week 2)

Extract text and structure from various formats.

**Topics:**
- PDF structure basics
- PDF.js library
- DOCX (ZIP with XML)
- Mammoth.js library
- Regex for data extraction

**Resources:**
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Mammoth.js GitHub](https://github.com/mwilliamson/mammoth.js)
- [MDN Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

### Phase 3: React Forms (Week 3)

Build complex multi-section forms with validation.

**Topics:**
- Controlled vs uncontrolled components
- Form state management
- Zod validation
- Array fields (add/remove/reorder)

**Resources:**
- [React Forms Documentation](https://react.dev/reference/react-dom/components/input)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/) (alternative)

### Phase 4: AI Integration (Week 4)

Implement intelligent CV analysis with LLMs.

**Topics:**
- Prompt engineering
- Streaming responses
- Structured outputs
- Cover letter generation

**Resources:**
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Google AI Documentation](https://ai.google.dev/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

### Phase 5: PDF Generation (Week 5)

Create professional PDF documents.

**Topics:**
- Document layout design
- Print stylesheets
- React-PDF library
- HTML to PDF approaches

**Resources:**
- [React-PDF Documentation](https://react-pdf.org/)
- [PDFMake Documentation](https://pdfmake.github.io/docs/)
- [CSS Print Media](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print)

---

## Exercises

### Exercise 1: Magic Byte Validation

**Objective:** Validate file types using magic bytes (file signatures).

**Background:**
Magic bytes are the first few bytes of a file that identify its type:
- PDF: `%PDF` (0x25 0x50 0x44 0x46)
- DOCX: `PK..` (0x50 0x4B 0x03 0x04) - ZIP format
- PNG: `‰PNG` (0x89 0x50 0x4E 0x47)

**Task:**
```typescript
// In file-upload.ts

async function validateMagicBytes(file: File): Promise<{
  valid: boolean;
  detectedType: string | null;
}> {
  // TODO:
  // 1. Read first 4-8 bytes using FileReader + ArrayBuffer
  // 2. Convert to Uint8Array
  // 3. Compare against known signatures
  // 4. Return validation result
}
```

**Hints:**
- Use `file.slice(0, 8)` to get first 8 bytes
- Use `DataView` or `Uint8Array` to read bytes
- PDF signature: `[0x25, 0x50, 0x44, 0x46]`

**Expected Output:**
```typescript
const result = await validateMagicBytes(pdfFile);
// { valid: true, detectedType: 'pdf' }
```

---

### Exercise 2: Experience Section Parser

**Objective:** Extract work experience from plain text CV.

**Background:**
CVs typically have experience sections with patterns like:
```
EXPERIENCE
Software Engineer | TechCorp | Jan 2020 - Present
- Built microservices architecture
- Led team of 5 developers

Senior Developer | StartupXYZ | Mar 2018 - Dec 2019
```

**Task:**
```typescript
// In parsers/index.ts

function extractExperience(text: string): Experience[] {
  // TODO:
  // 1. Find experience section (headers: Experience, Work History, etc.)
  // 2. Split into individual entries
  // 3. Extract: position, company, dates, achievements
  // 4. Parse dates to standard format
}
```

**Hints:**
- Use regex to find section headers: `/experience|work\s*history|employment/i`
- Date patterns: `Jan 2020`, `2020-01`, `January 2020`
- Look for bullet points (-, *, •) for achievements

**Test Input:**
```
John Doe
john@email.com

EXPERIENCE

Software Engineer at Google
January 2020 - Present
• Developed new features for search
• Improved latency by 30%

Junior Developer at Startup
2018 - 2019
- Built mobile app
- Worked with React Native
```

---

### Exercise 3: Skills Extraction with NLP

**Objective:** Intelligently extract and categorize skills.

**Background:**
Skills appear in various forms:
- Explicit: "Skills: Python, JavaScript, React"
- Implicit: "Built applications using Python and React"
- Categorized: "Programming: Python, JS | Frameworks: React, Vue"

**Task:**
```typescript
// Create new file: parsers/skills.ts

interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft' | 'tool' | 'language' | 'other';
  confidence: number; // 0-1
  context?: string;   // Where it was found
}

function extractSkills(text: string): ExtractedSkill[] {
  // TODO:
  // 1. Create skill taxonomy (technical, soft skills, tools)
  // 2. Search for explicit skill sections
  // 3. Search for implicit mentions in experience
  // 4. Categorize and deduplicate
  // 5. Assign confidence scores
}
```

**Skill Taxonomy to Build:**
```typescript
const SKILL_TAXONOMY = {
  programming: ['JavaScript', 'TypeScript', 'Python', 'Java', ...],
  frameworks: ['React', 'Vue', 'Angular', 'Next.js', ...],
  databases: ['PostgreSQL', 'MongoDB', 'Redis', ...],
  cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', ...],
  soft: ['leadership', 'communication', 'problem-solving', ...],
};
```

---

### Exercise 4: Streaming AI Analysis

**Objective:** Implement streaming analysis with progress updates.

**Background:**
Streaming provides better UX for long-running operations:
- User sees immediate feedback
- Can show partial results
- Feels faster than waiting

**Task:**
```typescript
// In analyzer.ts

async function* streamAnalysis(
  cv: CV,
  job: JobDescription
): AsyncGenerator<AnalysisUpdate> {
  // TODO:
  // 1. Yield progress: "Analyzing skills..."
  // 2. Yield partial result: { skillMatch: 75 }
  // 3. Yield progress: "Generating suggestions..."
  // 4. Yield suggestions one by one
  // 5. Yield cover letter in chunks
}

// Usage:
for await (const update of streamAnalysis(cv, job)) {
  if (update.type === 'progress') {
    setProgress(update.message);
  } else if (update.type === 'suggestion') {
    setSuggestions(prev => [...prev, update.data]);
  }
}
```

**Bonus:** Implement with actual LLM API using streaming.

---

### Exercise 5: Two-Column PDF Template

**Objective:** Create a modern two-column CV layout.

**Background:**
Two-column layouts efficiently use space:
- Left column: Contact, skills, languages
- Right column: Experience, education, projects

**Task:**
```typescript
// In exporter.ts

function generateTwoColumnHTML(cv: CV, styling: ExportStyling): string {
  // TODO:
  // 1. Create CSS grid layout (1fr 250px)
  // 2. Left sidebar: contact, skills, certifications
  // 3. Right main: summary, experience, education
  // 4. Handle print media queries
  // 5. Add color accent to sidebar
}
```

**CSS Hints:**
```css
.two-column {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: var(--primary-color);
  color: white;
  padding: 30px;
}

@media print {
  .sidebar {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

---

### Exercise 6: Cover Letter Generator with Templates

**Objective:** Create customizable cover letter templates.

**Background:**
Cover letters should be tailored but follow patterns:
- Opening hook
- Why this company
- Why you're qualified
- Call to action

**Task:**
```typescript
// Create new file: cover-letter.ts

interface CoverLetterTemplate {
  id: string;
  name: string;
  tone: 'professional' | 'creative' | 'conversational';
  structure: TemplateSection[];
}

interface TemplateSection {
  type: 'opening' | 'body' | 'skills' | 'closing';
  prompt: string;
  maxLength: number;
}

function generateCoverLetter(
  cv: CV,
  job: JobDescription,
  template: CoverLetterTemplate
): Promise<string> {
  // TODO:
  // 1. Create prompts for each section
  // 2. Call LLM for each section
  // 3. Combine sections
  // 4. Format with proper spacing
}
```

**Template Example:**
```typescript
const professionalTemplate: CoverLetterTemplate = {
  id: 'professional',
  name: 'Professional',
  tone: 'professional',
  structure: [
    {
      type: 'opening',
      prompt: 'Write a professional opening paragraph expressing interest in {jobTitle} at {company}',
      maxLength: 100,
    },
    // ...
  ],
};
```

---

### Exercise 7: Undo/Redo for CV Editor

**Objective:** Implement edit history with undo/redo.

**Background:**
Undo/redo uses a history stack pattern:
- Past states: Stack of previous states
- Present: Current state
- Future states: Stack of undone states

**Task:**
```typescript
// Create new file: hooks/useHistory.ts

interface UseHistoryReturn<T> {
  state: T;
  set: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
  // TODO:
  // 1. Track past, present, future states
  // 2. On set: push present to past, set new present, clear future
  // 3. On undo: push present to future, pop past to present
  // 4. On redo: push present to past, pop future to present
  // 5. Limit history size
}
```

**Usage:**
```tsx
const { state: cv, set: setCV, undo, redo, canUndo } = useHistory(initialCV);

// Edit
setCV({ ...cv, summary: 'New summary' });

// Undo
if (canUndo) undo();
```

---

## Bonus Challenges

### Challenge 1: JSON Resume Import/Export

Support the [JSON Resume](https://jsonresume.org/) standard for interoperability.

### Challenge 2: LinkedIn Profile Import

Parse LinkedIn profile export data (requires understanding their data format).

### Challenge 3: Real-time Collaboration

Multiple users editing same CV using WebSockets or CRDT.

### Challenge 4: Version History

Track and restore previous versions of CV with diffs.

### Challenge 5: A/B Testing Templates

Track which templates get more responses (analytics integration).

---

## Dependencies to Install

```bash
# PDF parsing
npm install pdfjs-dist

# DOCX parsing
npm install mammoth

# PDF generation
npm install @react-pdf/renderer

# Alternative PDF generation
npm install jspdf html2canvas

# Form validation
npm install zod

# DOCX export
npm install docx
```

## Quick Start

1. Enable feature flag in admin panel
2. Navigate to `/cv-studio`
3. Upload a CV or start from scratch
4. Edit sections as needed
5. Add job description for analysis
6. Apply AI suggestions
7. Export to PDF

## File Structure After Completion

```
lib/features/cv-studio/
├── types.ts
├── file-upload.ts
├── index.ts
├── parsers/
│   ├── index.ts
│   ├── pdf.ts          # Exercise: PDF parsing
│   ├── docx.ts         # Exercise: DOCX parsing
│   └── skills.ts       # Exercise: Skills extraction
├── analyzer.ts
├── cover-letter.ts     # Exercise: Templates
├── exporter.ts
├── hooks/
│   └── useHistory.ts   # Exercise: Undo/redo
└── components/
    ├── CVEditor.tsx
    ├── FileUpload.tsx  # Exercise: Drag/drop UI
    ├── CVPreview.tsx   # Exercise: Live preview
    └── AnalysisPanel.tsx
```
