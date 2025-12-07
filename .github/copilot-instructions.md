# Job Hunting Assistant - AI Agent Instructions

## Project Overview

A **learning-focused portfolio project** for AI-powered job hunting: CV analysis, cover letter generation, and application tracking. Single-user MVP using Next.js 16 App Router.

**Status:** v1.0 MVP Complete - Deployed to Vercel with PostgreSQL (Neon)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn/ui
- **Backend:** tRPC v11 with React Query, Prisma ORM
- **Database:** PostgreSQL (Neon) with connection pooling
- **AI:** Multi-provider via `lib/ai.ts` — Gemini (free), OpenAI, Claude

## Architecture & Data Flow

```
app/page.tsx (landing) → app/profile/page.tsx (CV form)
                       → app/analyze/page.tsx (job analysis)
                       → app/tracker/page.tsx (applications list)
                       → app/dashboard/page.tsx (stats overview)

Custom Hooks (lib/hooks/):
  useUser()        → user profile CRUD, CV upload
  useAnalyze()     → job analysis, cover letter generation
  useApplications() → applications CRUD, stats

tRPC Routers (lib/trpc/routers/):
  user.ts         → get, upsert, uploadCV
  analyze.ts      → analyzeJob, generateCoverLetter
  applications.ts → list, create, update, delete

REST Endpoints (kept for specific use cases):
  POST /api/cv/upload → FormData CV upload (fallback for larger files)
```

## Key Patterns

### Custom Hooks Pattern (`lib/hooks/`)

Pages consume abstracted hooks instead of inline tRPC calls:

```typescript
// ✅ Use hooks for clean component code
const { user, loading, save, fieldErrors } = useUser();
const { analysis, analyze, analyzeState } = useAnalyze();
const { applications, stats, updateStatus } = useApplications(userId);
```

### tRPC Router Pattern (`lib/trpc/routers/`)

Type-safe API routes with Zod validation:

```typescript
// lib/trpc/routers/user.ts
export const userRouter = router({
  get: publicProcedure.query(async () => { ... }),
  upsert: publicProcedure.input(userSchema).mutation(async ({ input }) => { ... }),
});
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
4. **Hooks as service layer** — Pages use hooks (`lib/hooks/`), not inline tRPC
5. **tRPC for API** — All API calls via tRPC (`lib/trpc/routers/`)
6. **Component location** — Shadcn components in `components/ui/`, feature components in `components/`

## Code Quality Patterns

### React Imports (Qodana-compliant)

```typescript
// ✅ Use named imports, not namespace imports
import type { JSX, ReactNode, FormEvent } from "react";
import { forwardRef, useState, useCallback } from "react";

// ❌ Avoid - creates UMD global warnings
import * as React from "react";
```

### Promise Handling

```typescript
// ✅ Use void for intentionally ignored promises
useEffect(() => {
  void loadData();
}, []);

// ❌ Avoid - Qodana warns about ignored promises
useEffect(() => {
  loadData();
}, []);
```

### Dynamic Pages with Prisma

```typescript
// ✅ Force dynamic rendering for database pages
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
```

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
