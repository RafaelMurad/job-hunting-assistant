# Job Hunting Assistant - AI Agent Instructions

## Project Overview

A **learning-focused portfolio project** for AI-powered job hunting: CV analysis, cover letter generation, and application tracking. Single-user MVP using Next.js 16 App Router.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn/ui
- **Backend:** Next.js API Routes (REST), Prisma ORM
- **Database:** PostgreSQL (Neon) with connection pooling
- **AI:** Multi-provider via `lib/ai.ts` — Gemini (free), OpenAI, Claude

## Architecture & Data Flow

```
app/page.tsx (landing) → app/profile/page.tsx (CV form)
                       → app/analyze/page.tsx (job analysis)
                       → app/tracker/page.tsx (applications list)
                       → app/dashboard/page.tsx (stats overview)

API Routes:
  POST /api/analyze      → lib/ai.ts (analyzeJob) → AI provider
  POST /api/cover-letter → lib/ai.ts (generateCoverLetter) → AI provider
  GET|PUT /api/user      → prisma (User table)
  GET|POST|PATCH|DELETE /api/applications → prisma (Application table)
```

## Key Patterns

### AI Provider Pattern (`lib/ai.ts`)

Switch providers via `AI_PROVIDER` env var. Each provider implements `analyzeJob()` and `generateCoverLetter()`:

```typescript
// Provider selection at runtime
const provider = process.env.AI_PROVIDER || "gemini"; // gemini | openai | claude
```

### Validation Pattern (`lib/validations/user.ts`)

Zod schemas used for both API validation and form validation. Export both schema and inferred type:

```typescript
export const userSchema = z.object({ ... });
export type UserInput = z.infer<typeof userSchema>;
```

### Single-User Mode

MVP assumes one user. Hardcoded user ID pattern throughout:

```typescript
// FUTURE: Get user from auth session
const userId = "cm3m6n7z80000uy7k3xqvt8xy";
```

### Feature Flags (`lib/feature-flags/`)

Custom client-side feature flag system with localStorage persistence and env var overrides.

## Developer Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run validate         # lint + type-check + format + test (run before PR)
npx prisma generate      # Regenerate client after schema changes
npx prisma db push       # Push schema to database
npm run db:studio        # Open Prisma Studio GUI
git branch-clean feat/x  # Create clean feature branch from main
```

## Git Workflow

- **Branch naming:** `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`
- **Always rebase before PR:** `git rebase main` then `git push --force-with-lease`
- **Conventional commits:** `feat(scope): description`
- **Pre-commit hook:** Runs `lint-staged` automatically

## Project Conventions

1. **FUTURE: comments** — Mark out-of-scope features: `// FUTURE: Add auth`
2. **Server Components by default** — Only use `"use client"` for interactivity
3. **Zod + TypeScript** — Runtime validation + compile-time types together
4. **API route structure** — `app/api/{resource}/route.ts` for REST endpoints
5. **Component location** — Shadcn components in `components/ui/`, feature components in `components/`

## Environment Variables

```bash
DATABASE_URL=           # Neon PostgreSQL pooled connection
DATABASE_URL_UNPOOLED=  # Direct connection for migrations
AI_PROVIDER=gemini      # gemini | openai | claude
GEMINI_API_KEY=         # Free tier: 1500 req/day
OPENAI_API_KEY=         # Optional paid
ANTHROPIC_API_KEY=      # Optional paid
```

## Out of Scope (MVP)

Mark with `FUTURE:` — Multi-user auth, PDF export, email integration, job board scraping, mobile app
