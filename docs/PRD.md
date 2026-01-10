# Product Requirements Document (PRD)

## Job Hunting Assistant

**Product Version:** v1.2 (Portfolio)  
**Last Updated:** January 4, 2026  
**Author:** Rafael Murad

---

## 1. Vision & Problem Statement

### The Problem

Job hunting is fragmented, tedious, and hard to track:

- **CV tailoring** — Updating your CV for each application is time-consuming
- **Cover letter writing** — Creating personalized letters is painful
- **Application tracking** — Remembering what you applied for is difficult
- **Context switching** — Using multiple tools fragments the experience

### The Solution

**Job Hunting Assistant** centralizes the job hunting experience:

- Analyze job descriptions and get match scores based on your CV
- Generate tailored cover letters with one click
- Edit CVs with a professional LaTeX editor
- Track all applications with status, notes, and history

### Vision Statement

> "An AI-powered job hunting tool that helps you apply smarter, not harder."

---

## 2. Target User

**Job seekers** who:

- Apply to multiple positions and struggle to keep track
- Find writing cover letters tedious or challenging
- Want to understand how well they match a job before applying
- Value having their job search organized in one place

---

## 3. Core Features

| Feature                     | Description                            | Status  |
| --------------------------- | -------------------------------------- | ------- |
| **CV Import**               | Upload PDF/DOCX → AI extracts to LaTeX | ✅ Done |
| **LaTeX CV Editor**         | Edit CVs with professional templates   | ✅ Done |
| **Job Analysis**            | Paste job → Get match score + insights | ✅ Done |
| **Cover Letter Generation** | AI-generated tailored letters          | ✅ Done |
| **Application Tracker**     | Track status, dates, notes             | ✅ Done |
| **Dashboard**               | Overview stats and quick actions       | ✅ Done |

---

## 4. Technical Architecture

### Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| **Framework** | Next.js 16 (App Router)                   |
| **Language**  | TypeScript                                |
| **Styling**   | TailwindCSS 4 + Shadcn/ui                 |
| **Database**  | PostgreSQL (Neon)                         |
| **ORM**       | Prisma                                    |
| **AI**        | Gemini 2.5 Flash + OpenRouter (free tier) |
| **Auth**      | Neon Auth (email/password + social)       |
| **Hosting**   | Vercel                                    |

### Data Models

**Canonical source:** `prisma/schema.prisma`

- `User` — Profile + CV content + auth metadata
- `Application` — Tracker data + analysis + cover letter

---

## 5. Design System

**Nordic Design** — Clean, professional, minimalist:

- Color palette: Fjord blue, Forest green, Clay amber, Nordic neutrals
- Typography: Clear hierarchy, readable
- Components: Consistent spacing, accessible

---

## 6. Out of Scope

Features intentionally excluded from portfolio scope:

- Social integrations (GitHub/LinkedIn data sync)
- Paid AI providers (OpenAI, Claude)
- Interview calendar integration
- Email notifications
- Mobile native app

---

## 7. Success Metrics

| Metric                | Target            |
| --------------------- | ----------------- |
| Core features working | 6/6 ✅            |
| Production deployment | Live on Vercel ✅ |
| Page load time        | < 3 seconds       |
| Mobile responsive     | All pages ✅      |
| Zero critical bugs    | Achieved ✅       |

---

_This is a portfolio project demonstrating full-stack TypeScript and AI integration skills._
