# Product Requirements Document (PRD)

## Job Hunting Assistant

**Version:** 1.0 (Draft)  
**Last Updated:** December 6, 2025  
**Author:** Rafael Murad

---

## 1. Vision & Problem Statement

### The Problem

Job hunting is fragmented, tedious, and hard to track:

- **Boilerplate job descriptions** — Most don't accurately describe the role or get tech skills right
- **CV tailoring** — Updating your CV for each application is time-consuming
- **Cover letter writing** — Creating personalized letters is painful (especially if writing isn't your strength)
- **Application tracking** — Remembering what you applied for is difficult; LinkedIn's tools aren't helpful
- **Context switching** — Using multiple tools (LinkedIn, Google Docs, spreadsheets) fragments the experience

### The Solution

**Job Hunting Assistant** automates and enhances the job hunting experience by centralizing everything in one place:

- Analyze job descriptions and get match scores based on your actual experience
- Generate tailored cover letters with one click
- Import your CV and let AI extract your information
- Track all applications with status, notes, and history

### Vision Statement

> "An AI-powered job hunting platform that connects to your professional footprint (GitHub, LinkedIn, CV) to deeply understand your experience and help you apply smarter, not harder."

---

## 2. Target User

### Primary User (v1.0)

**Job seekers** who:

- Apply to multiple positions and struggle to keep track
- Find writing cover letters tedious or challenging
- Want to understand how well they match a job before applying
- Value having their job search organized in one place

### Initial User

- Rafael Murad (developer and sole user during MVP development)

### Future Users

- Developers seeking tech roles (leverage GitHub integration)
- Professionals with LinkedIn presence (leverage LinkedIn integration)
- Career changers needing help positioning their experience

---

## 3. v1.0 Feature Scope

### Core Features

| Feature                     | Description                                                 | Priority |
| --------------------------- | ----------------------------------------------------------- | -------- |
| **CV Import**               | Upload PDF/DOCX → AI extracts info → Populates profile      | P0       |
| **User Profile**            | Store and edit CV information (experience, skills, summary) | P0       |
| **Job Analysis**            | Paste job description → Get match score + insights          | P0       |
| **Cover Letter Generation** | Generate tailored cover letter based on profile + job       | P0       |
| **Application Tracker**     | Track applications: company, role, status, date, notes      | P0       |
| **Production Deployment**   | Deployed to Vercel with PostgreSQL database                 | P0       |

### Completed Features

| Feature                          | Status  | Sprint   |
| -------------------------------- | ------- | -------- |
| Nordic Design System             | ✅ Done | Sprint 1 |
| Prisma ORM Setup                 | ✅ Done | Sprint 1 |
| Component Library (Shadcn/ui)    | ✅ Done | Sprint 1 |
| Production PostgreSQL (Neon)     | ✅ Done | Sprint 2 |
| Deploy to Vercel                 | ✅ Done | Sprint 2 |
| CI/CD Pipeline (GitHub Actions)  | ✅ Done | Sprint 2 |
| User Profile API (CRUD)          | ✅ Done | Sprint 3 |
| CV Upload with AI Extraction     | ✅ Done | Sprint 3 |
| Profile Page UI                  | ✅ Done | Sprint 3 |
| Job Analysis API                 | ✅ Done | Sprint 4 |
| Match Score Algorithm            | ✅ Done | Sprint 4 |
| Analysis Results UI              | ✅ Done | Sprint 4 |
| Cover Letter Generation API      | ✅ Done | Sprint 5 |
| Cover Letter UI                  | ✅ Done | Sprint 5 |
| Application Tracker API          | ✅ Done | Sprint 6 |
| Tracker List UI                  | ✅ Done | Sprint 6 |
| Dashboard Overview               | ✅ Done | Sprint 6 |
| **v1.0 MVP Launch**              | 🎉 Done | Dec 2024 |
| CV LaTeX Editor                  | ✅ Done | Sprint 7 |
| CV Template System (3 templates) | ✅ Done | Sprint 7 |
| Multi-Model AI Selection         | ✅ Done | Sprint 7 |
| Instant Template Switching       | ✅ Done | Sprint 7 |

### NOT in v1.0 (Planned for v1.1+)

| Feature                  | Reason                                                       | Target   | Status  |
| ------------------------ | ------------------------------------------------------------ | -------- | ------- |
| **GitHub Integration**   | Core differentiator — adds real project context              | **v1.1** | ✅ Done |
| **LinkedIn Integration** | Core differentiator — automates tracking, detects mismatches | **v1.1** | ✅ Done |
| **Multi-user Auth**      | Enable multiple users with OAuth                             | **v1.1** | ✅ Done |
| PDF CV Export            | Can use browser print initially                              | v1.2     | Planned |
| Interview AI Helper      | Separate product vertical                                    | v2.0     | Planned |

---

## 4. Feature Roadmap

### Sprint Schedule (1-week sprints)

```
Sprint 1: Foundation ✅ (Complete)
├── ✅ Nordic Design System
├── ✅ Prisma Schema (User, Application models)
└── ✅ Component Library Setup

Sprint 2: Infrastructure ✅ (Complete)
├── ✅ Production PostgreSQL (Neon)
├── ✅ Deploy to Vercel
├── ✅ Environment Configuration
└── ✅ CI/CD Pipeline (GitHub Actions)

Sprint 3: Profile & CV Import ✅ (Complete)
├── ✅ User Profile API (CRUD)
├── ✅ CV Upload Endpoint
├── ✅ PDF/DOCX Text Extraction (Gemini Vision)
├── ✅ AI Profile Data Extraction
└── ✅ Profile Page UI (functional)

Sprint 4: Job Analysis ✅ (Complete)
├── ✅ Job Analysis API
├── ✅ Match Score Algorithm
├── ✅ Skills Gap Analysis
├── ✅ Analysis Results UI
└── ✅ Job Description Parser

Sprint 5: Cover Letters ✅ (Complete)
├── ✅ Cover Letter Generation API
├── ✅ Prompt Engineering for Quality
├── ✅ Cover Letter UI
├── ✅ Edit & Regenerate Flow
└── ✅ Copy/Export Options

Sprint 6: Tracker + Launch ✅ (Complete)
├── ✅ Application Tracker API
├── ✅ Tracker List UI
├── ✅ Status Management
├── ✅ Dashboard Overview
├── ✅ Final Polish
└── 🎉 v1.0 Launch! (December 2024)

Sprint 7: CV Editor & Templates ✅ (Complete)
├── ✅ CV LaTeX Editor with Live Preview
├── ✅ 3 Professional Templates (Tech Minimalist, Modern Clean, Contemporary Professional)
├── ✅ Multi-Model AI Selection (Gemini, OpenRouter free models, GPT-4o, Claude)
├── ✅ JSON Content Extraction for Template Flexibility
├── ✅ Instant Template Switching (no re-upload needed)
├── ✅ PDF/DOCX/LaTeX File Support
└── ✅ LaTeX Compilation to PDF

Sprint 8: UX Research & Planning ✅ (Complete)
├── ✅ UX Documentation (/docs/ux/)
│   ├── User Journeys (5 flows mapped)
│   ├── Pain Points Analysis (9 issues prioritized)
│   ├── Information Architecture
│   └── Design Principles
├── ✅ Interactive UX Planner (/admin/ux-planner)
│   ├── Journey Visualization
│   ├── Persona Exploration
│   └── Priority Matrix
├── ✅ Admin Navigation
└── ✅ Cloud Infrastructure Roadmap (PRD)

Sprint 9: Authentication & Social Integrations ✅ (Complete)
├── ✅ NextAuth.js v5 with JWT Strategy
│   ├── GitHub OAuth Provider
│   ├── Google OAuth Provider
│   └── LinkedIn OAuth Provider
├── ✅ User Role System (USER, ADMIN, OWNER)
├── ✅ Route Protection Middleware (edge-compatible)
├── ✅ Social Integration System
│   ├── GitHub: Repos, Languages, Contributions
│   ├── LinkedIn: Profile Sync (API limited)
│   └── Token Encryption (AES-256-GCM)
├── ✅ Settings Page with Integration Management
├── ✅ Feature Flags for Integrations
├── ✅ Admin Guard Component
└── ✅ Login Page with OAuth Buttons
```

---

## 5. Technical Architecture

### Stack Decisions

| Layer          | Technology                            | Why                                             |
| -------------- | ------------------------------------- | ----------------------------------------------- |
| **Framework**  | Next.js 16 (App Router)               | Server Components, Server Actions, great DX     |
| **Language**   | TypeScript                            | Type safety, better tooling, portfolio standard |
| **Styling**    | Tailwind CSS 4 + Shadcn/ui            | Rapid development, consistent design            |
| **Database**   | SQLite (dev) / PostgreSQL (prod)      | Zero-setup locally, scalable in production      |
| **ORM**        | Prisma                                | Type-safe queries, easy migrations              |
| **AI**         | Multi-provider (Gemini/OpenAI/Claude) | Flexibility, cost optimization                  |
| **Hosting**    | Vercel                                | Native Next.js support, free tier               |
| **DB Hosting** | Neon                                  | Serverless PostgreSQL, connection pooling       |

### Design System

**Nordic Design** — Clean, professional, minimalist:

- Color palette: Fjord blue, Forest green, Clay amber, Nordic neutrals
- Typography: Clear hierarchy, readable
- Components: Consistent spacing, accessible

### Data Models

```prisma
model User {
  id          String   @id
  name        String
  email       String   @unique
  phone       String?
  location    String
  summary     String   // Professional summary
  experience  String   // Work history
  skills      String   // Comma-separated
  applications Application[]
}

model Application {
  id             String   @id
  userId         String
  company        String
  role           String
  jobDescription String
  jobUrl         String?
  matchScore     Int      // 0-100
  analysis       String   // AI analysis
  coverLetter    String   // Generated letter
  status         String   // saved, applied, interviewing, rejected, offer
  appliedAt      DateTime?
  notes          String?
  user           User     @relation(...)
}
```

---

## 6. Data Sources & Context

The app's intelligence comes from understanding the user through multiple data sources:

### GitHub Integration (v1.1)

| Data Source    | What We Learn                       | How It Helps                                                 |
| -------------- | ----------------------------------- | ------------------------------------------------------------ |
| Repositories   | Actual projects built               | "You built X with React — mention it for this frontend role" |
| Languages      | Real tech stack (not self-reported) | Accurate skill matching vs job requirements                  |
| Contributions  | Activity patterns, open source      | Shows commitment, collaboration style                        |
| README quality | Communication skills                | Writing samples inform cover letter tone                     |
| Commit history | Work style, recent activity         | Demonstrates consistency and growth                          |

### LinkedIn Integration (v1.1)

| Data Source     | What We Learn               | How It Helps                           |
| --------------- | --------------------------- | -------------------------------------- |
| Profile         | Public professional persona | Detect CV ↔ LinkedIn mismatches       |
| Saved jobs      | Jobs user is interested in  | Auto-populate tracker candidates       |
| Connections     | Network at target companies | "You know 3 people at Company X"       |
| Recommendations | Social proof, endorsements  | Extract quotes for cover letters       |
| Activity/Posts  | Engagement style            | Match tone to their professional voice |

### CV Import (v1.0)

| Data Source    | What We Learn                | How It Helps                   |
| -------------- | ---------------------------- | ------------------------------ |
| Work history   | Roles, companies, dates      | Core experience for matching   |
| Skills section | Self-reported abilities      | Compare against GitHub reality |
| Education      | Degrees, certifications      | Qualification matching         |
| Summary        | How they describe themselves | Tone and positioning           |

### Multi-Source Intelligence

When all sources are connected, the app can:

- **Cross-validate skills** — GitHub shows React, CV says React, LinkedIn confirms React
- **Detect gaps** — "Your GitHub shows Python, but it's not on your CV"
- **Suggest improvements** — "Add your open-source contributions to LinkedIn"
- **Generate accurate content** — Cover letters based on real projects, not just claims

---

## 7. Cloud Infrastructure Roadmap

### Current State (MVP)

| Component           | Current Solution           | Status     | Risk Level |
| ------------------- | -------------------------- | ---------- | ---------- |
| **AI Extraction**   | Gemini Vision (AI Studio)  | ✅ Working | 🟢 Low     |
| **PDF Compilation** | latexonline.cc (3rd party) | ✅ Working | 🟡 Medium  |
| **File Storage**    | Vercel Blob                | ✅ Working | 🟢 Low     |
| **Hosting**         | Vercel Serverless          | ✅ Working | 🟢 Low     |

### Why This Matters

**latexonline.cc Risk:**

- No Data Processing Agreement (DPA)
- Unknown logging/retention policies
- Third-party dependency with no SLA
- **GDPR concern:** User CV data sent to uncontrolled service

**Current Decision:** Keep for development/testing. Replace before production launch with paying users.

### Cloud Migration Plan (When Scaling)

#### Phase 1: Self-Hosted LaTeX Compilation (Priority)

**Problem:** `latexonline.cc` is a GDPR risk and has no SLA.

**Solution:** Deploy `latex-online` Docker image to Google Cloud Run.

**Why Cloud Run:**

- Uses your £227 GCP credits (expires March 2026)
- Scales to zero (pay only for usage)
- Same API as latexonline.cc (drop-in replacement)
- Full control over data processing
- ~£5-10/month at moderate usage

**Implementation:**

```bash
# 1. Deploy the Docker image
gcloud run deploy latex-compiler \
  --image aslushnikov/latex-online \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 60

# 2. Update environment variable
LATEX_API_URL=https://latex-compiler-xxx.run.app
```

**Code Change Required:**

```typescript
// lib/latex-compiler.ts
const LATEX_COMPILE_API = process.env.LATEX_API_URL || "https://latexonline.cc/compile";
```

#### Phase 2: Vertex AI (If Rate Limited)

**Problem:** AI Studio free tier has 20 requests/day limit.

**Solution:** Switch to Vertex AI (uses GCP credits, no daily limit).

**When to migrate:**

- If you consistently hit 20 requests/day
- If you need higher rate limits for testing
- Before launching to multiple users

**Why Vertex AI over AI Studio:**

- Same Gemini models
- Pay-per-use (covered by credits)
- No daily request limits
- Enterprise SLA and support

**Cost Estimate:** ~£10-20/month for moderate CV processing.

#### Phase 3: Google Document AI (Optional)

**Problem:** Text extraction from complex CV layouts.

**Solution:** Document AI for structured text extraction.

**When to consider:**

- If Gemini Vision struggles with specific CV formats
- If you need better table/column extraction
- For enterprise-grade document processing

**Why Document AI:**

- Purpose-built for document understanding
- Better structure preservation (tables, columns)
- GDPR compliant (Google Cloud DPA)

**Cost Estimate:** ~£0.001/page (covered by credits).

### Decision Framework

| Trigger                              | Action                           |
| ------------------------------------ | -------------------------------- |
| Ready to launch premium features     | Deploy Cloud Run LaTeX service   |
| Hitting 20 requests/day on AI Studio | Switch to Vertex AI              |
| Complex CV extraction issues         | Evaluate Document AI             |
| AWS credits available                | Consider Textract as alternative |

### Google Cloud Credits Usage Plan

**Total Credits:** £227 (expires March 2026)

| Service            | Monthly Estimate | Priority             |
| ------------------ | ---------------- | -------------------- |
| Cloud Run (LaTeX)  | £5-10            | 🔴 High (GDPR)       |
| Vertex AI (Gemini) | £10-20           | 🟡 Medium            |
| Document AI        | £5-10            | 🟢 Low               |
| **Total**          | ~£20-40/month    | ~6-12 months covered |

### Alternative: AWS Services

If AWS credits become available:

| Service          | Use Case                          | Free Tier         |
| ---------------- | --------------------------------- | ----------------- |
| **AWS Textract** | Document text extraction          | 1,000 pages/month |
| **AWS Lambda**   | LaTeX compilation (via container) | 1M requests/month |
| **S3**           | File storage                      | 5GB               |

**Note:** AWS adds complexity (another cloud provider). Prefer GCP since credits are already available.

---

## 8. Future Ideas (Post v1.1)

### v1.2 — Optimization & Polish

- [ ] **PDF CV Export** — Native PDF generation (replace browser print)
- [ ] **Bundle Size Optimization** — Reduce AI SDK footprint
- [ ] **Design System Audit** — Component consistency review
- [ ] **AI Service Improvements** — Prompt optimization, caching
- [ ] Application statistics/charts

### v1.3 — Enhancements

- [ ] Email reminders for follow-ups
- [ ] Calendar Integration — Interview scheduling
- [ ] **Premium CV Editor** — Gate behind payment, use Cloud Run LaTeX

### v2.0 — Advanced Features

- [ ] **Interview Prep Module** — AI-generated questions based on job + your GitHub projects
- [ ] **Salary Negotiation Helper** — Market data + scripts
- [ ] **Multi-user + Teams** — Share with career coaches
- [ ] **Browser Extension** — One-click save from job boards
- [ ] **Auto-apply suggestions** — "Based on your profile, apply to these 5 jobs"
- [ ] **Direct Style Replication** — Premium feature using Pro AI models

---

## 9. Success Metrics

### v1.0 Launch Criteria

| Metric                | Target         |
| --------------------- | -------------- |
| Core features working | 6/6 complete   |
| Production deployment | Live on Vercel |
| Page load time        | < 3 seconds    |
| Mobile responsive     | All pages      |
| Zero critical bugs    | 0 blockers     |

### User Success

- [ ] Faster job applications (< 10 min per application)
- [ ] Better cover letter quality
- [ ] Never forget an application again
- [ ] Clear view of job search progress

---

## 10. Open Questions

1. **CV parsing accuracy** — How do we handle poorly formatted CVs?
2. **AI cost management** — Rate limiting for Gemini free tier?
3. **Data privacy** — How long to retain job descriptions?
4. **Offline support** — Is it needed for v1.0?
5. **OAuth scopes** — What minimal permissions do we need for GitHub/LinkedIn?
6. **Rate limits** — How often can we sync from GitHub/LinkedIn APIs?
7. **Data freshness** — How often to re-sync external data?

---

## Changelog

| Date        | Version | Changes                                                          |
| ----------- | ------- | ---------------------------------------------------------------- |
| Dec 6, 2025 | 0.1     | Initial draft                                                    |
| Dec 6, 2025 | 0.2     | Elevated GitHub/LinkedIn to v1.1, added Data Sources section     |
| Dec 7, 2025 | 1.0     | **MVP Complete** - All P0 features done, deployed to Vercel      |
| Dec 8, 2025 | 1.1     | **CV Editor** - LaTeX editor, 3 templates, multi-model AI        |
| Dec 8, 2025 | 1.2     | **Cloud Roadmap** - Added infrastructure roadmap for GCP/scaling |
| Dec 8, 2025 | 1.3     | **UX Research** - Added /docs/ux/ and /admin/ux-planner          |
| Dec 9, 2025 | 1.4     | **v1.1 Complete** - Auth, Social Integrations, GitHub/LinkedIn   |

---

_This is a living document. Update as the product evolves._
