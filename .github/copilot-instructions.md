# Job Hunting Assistant - AI Agent Instructions

## Project Overview

A **learning-focused portfolio project** for AI-powered job hunting: CV analysis, cover letter generation, and application tracking. Built with Next.js 16 App Router.

**Status:** v1.1 Complete - Auth & Social Integrations deployed to Vercel

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn/ui
- **Backend:** tRPC v11 with React Query, Prisma ORM
- **Database:** PostgreSQL (Neon) with connection pooling
- **Auth:** NextAuth.js v5 (beta) with GitHub, Google, LinkedIn OAuth
- **AI:** Multi-provider via `lib/ai/` — Gemini (free), OpenAI, Claude

## Architecture & Data Flow

```
app/page.tsx (landing) → app/login/page.tsx (OAuth sign-in)
                       → app/dashboard/page.tsx (stats overview)
                       → app/profile/page.tsx (CV form)
                       → app/analyze/page.tsx (job analysis)
                       → app/cv/page.tsx (LaTeX editor)
                       → app/tracker/page.tsx (applications list)
                       → app/settings/page.tsx (integrations)
                       → app/admin/* (feature flags, UX planner)

Custom Hooks (lib/hooks/):
  useUser()         → user profile CRUD, CV upload
  useAnalyze()      → job analysis, cover letter generation
  useApplications() → applications CRUD, stats

tRPC Routers (lib/trpc/routers/):
  user.ts         → get, upsert, uploadCV
  analyze.ts      → analyzeJob, generateCoverLetter
  applications.ts → list, create, update, delete
  social.ts       → OAuth integrations, profile sync
  admin.ts        → trusted user management
  ux.ts           → UX research platform

Social Integration (lib/social/):
  providers/github.ts   → GitHub OAuth + API (repos, contributions)
  providers/linkedin.ts → LinkedIn OAuth + API
  token-manager.ts      → AES-256-GCM token encryption
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

### Authentication Pattern

NextAuth.js v5 with JWT strategy. Use `auth()` in Server Components, `getToken()` in Edge middleware:

```typescript
// Server Component - use auth()
import { auth } from "@/lib/auth";
const session = await auth();
if (!session) redirect("/login");

// Middleware - use getToken() (edge-compatible, no Prisma)
import { getToken } from "next-auth/jwt";
const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? "" });
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
# Database
DATABASE_URL=           # Neon PostgreSQL pooled connection
DATABASE_URL_UNPOOLED=  # Direct connection for migrations

# AI Providers
AI_PROVIDER=gemini      # gemini | openai | claude
GEMINI_API_KEY=         # Free tier: 1500 req/day
OPENAI_API_KEY=         # Optional paid
ANTHROPIC_API_KEY=      # Optional paid

# Authentication (NextAuth.js v5)
AUTH_SECRET=            # Random string for JWT signing
AUTH_GITHUB_ID=         # GitHub OAuth App ID
AUTH_GITHUB_SECRET=     # GitHub OAuth App Secret
AUTH_GOOGLE_ID=         # Google OAuth Client ID
AUTH_GOOGLE_SECRET=     # Google OAuth Client Secret
AUTH_LINKEDIN_ID=       # LinkedIn OAuth App ID
AUTH_LINKEDIN_SECRET=   # LinkedIn OAuth App Secret

# Social Integration (optional, for enhanced data sync)
SOCIAL_ENCRYPTION_KEY=  # 32-byte hex key for token encryption
OWNER_EMAIL=            # Email for OWNER role assignment
```

## Out of Scope (v1.1)

Mark with `FUTURE:` — PDF CV export, email integration, job board scraping, mobile app, interview AI helper
