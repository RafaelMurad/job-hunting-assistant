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

| Feature                       | Status  | Sprint   |
| ----------------------------- | ------- | -------- |
| Nordic Design System          | ✅ Done | Sprint 1 |
| Local SQLite Database         | ✅ Done | Sprint 1 |
| Prisma ORM Setup              | ✅ Done | Sprint 1 |
| Component Library (Shadcn/ui) | ✅ Done | Sprint 1 |

### NOT in v1.0 (Planned for v1.1+)

| Feature                   | Reason                                                       | Target   |
| ------------------------- | ------------------------------------------------------------ | -------- |
| **GitHub Integration**    | Core differentiator — adds real project context              | **v1.1** |
| **LinkedIn Integration**  | Core differentiator — automates tracking, detects mismatches | **v1.1** |
| PDF CV Export             | Can use browser print initially                              | v1.2     |
| Interview AI Helper       | Separate product vertical                                    | v2.0     |
| Multi-user Authentication | Solo use first                                               | v2.0     |

---

## 4. Feature Roadmap

### Sprint Schedule (1-week sprints)

```
Sprint 1: Foundation ✅ (Complete)
├── ✅ Nordic Design System
├── ✅ Local SQLite Database
├── ✅ Prisma Schema (User, Application models)
└── ✅ Component Library Setup

Sprint 2: Infrastructure (Week of Dec 9)
├── 📋 Production PostgreSQL (Neon)
├── 📋 Deploy to Vercel
├── 📋 Environment Configuration
└── 📋 CI/CD Pipeline Verification

Sprint 3: Profile & CV Import (Week of Dec 16)
├── 📋 User Profile API (CRUD)
├── 📋 CV Upload Endpoint
├── 📋 PDF/DOCX Text Extraction
├── 📋 AI Profile Data Extraction
└── 📋 Profile Page UI (functional)

Sprint 4: Job Analysis (Week of Dec 23)
├── 📋 Job Analysis API
├── 📋 Match Score Algorithm
├── 📋 Skills Gap Analysis
├── 📋 Analysis Results UI
└── 📋 Job Description Parser

Sprint 5: Cover Letters (Week of Dec 30)
├── 📋 Cover Letter Generation API
├── 📋 Prompt Engineering for Quality
├── 📋 Cover Letter UI
├── 📋 Edit & Regenerate Flow
└── 📋 Copy/Export Options

Sprint 6: Tracker + Launch (Week of Jan 6)
├── 📋 Application Tracker API
├── 📋 Tracker List UI
├── 📋 Status Management
├── 📋 Dashboard Overview
├── 📋 Final Polish
└── 🎉 v1.0 Launch!
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

## 7. Future Ideas (Post v1.0)

### v1.1 — Core Integrations (Priority)

- [ ] **GitHub OAuth** — Import repos, languages, contributions
- [ ] **LinkedIn OAuth** — Import profile, saved jobs, connections
- [ ] Application statistics/charts

### v1.2 — Enhancements

- [ ] PDF CV Export
- [ ] Email reminders for follow-ups
- [ ] Calendar Integration — Interview scheduling

### v2.0 — Advanced Features

- [ ] **Interview Prep Module** — AI-generated questions based on job + your GitHub projects
- [ ] **Salary Negotiation Helper** — Market data + scripts
- [ ] **Multi-user + Teams** — Share with career coaches
- [ ] **Browser Extension** — One-click save from job boards
- [ ] **Auto-apply suggestions** — "Based on your profile, apply to these 5 jobs"

---

## 8. Success Metrics

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

## 9. Open Questions

1. **CV parsing accuracy** — How do we handle poorly formatted CVs?
2. **AI cost management** — Rate limiting for Gemini free tier?
3. **Data privacy** — How long to retain job descriptions?
4. **Offline support** — Is it needed for v1.0?
5. **OAuth scopes** — What minimal permissions do we need for GitHub/LinkedIn?
6. **Rate limits** — How often can we sync from GitHub/LinkedIn APIs?
7. **Data freshness** — How often to re-sync external data?

---

## Changelog

| Date        | Version | Changes                                                      |
| ----------- | ------- | ------------------------------------------------------------ |
| Dec 6, 2025 | 0.1     | Initial draft                                                |
| Dec 6, 2025 | 0.2     | Elevated GitHub/LinkedIn to v1.1, added Data Sources section |

---

_This is a living document. Update as the product evolves._
