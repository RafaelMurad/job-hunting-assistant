# Job Hunting Assistant - AI Agent Instructions

## Project Overview

A **learning-focused portfolio project** for AI-powered job hunting: CV analysis, cover letter generation, and application tracking. Built with Next.js 16 App Router.

**Status:** v1.2 Complete - Neon Auth deployed to Vercel

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn/ui
- **Backend:** tRPC v11 with React Query, Prisma ORM
- **Database:** PostgreSQL (Neon) with connection pooling
- **Auth:** Neon Auth (email/password + social OAuth)
- **AI:** Multi-provider via `lib/ai/` — Gemini (free), OpenAI, Claude

## Architecture & Data Flow

```
app/page.tsx (landing) → app/auth/[path]/page.tsx (Neon Auth sign-in/up)
                       → app/dashboard/page.tsx (stats overview)
                       → app/profile/page.tsx (CV form)
                       → app/analyze/page.tsx (job analysis)
                       → app/cv/page.tsx (LaTeX editor)
                       → app/tracker/page.tsx (applications list)
                       → app/account/[path]/page.tsx (Neon Auth account settings)
                       → app/admin/* (feature flags, UX planner)

Custom Hooks (lib/hooks/):
  useUser()         → user profile CRUD, CV upload
  useAnalyze()      → job analysis, cover letter generation
  useApplications() → applications CRUD, stats

tRPC Routers (lib/trpc/routers/):
  user.ts         → get, upsert, uploadCV
  analyze.ts      → analyzeJob, generateCoverLetter
  applications.ts → list, create, update, delete
  admin.ts        → trusted user management
  ux.ts           → UX research platform

Neon Auth (lib/auth/):
  neon-client.ts    → Client-side auth (useNeonSession, neonSignIn/Out)
  neon-server.ts    → Server-side auth (getNeonSession)
```

## Key Patterns

### Custom Hooks Pattern (`lib/hooks/`)

Pages consume abstracted hooks instead of inline tRPC calls:

```typescript
// ✅ Use hooks for clean component code
const { user, loading, save, fieldErrors } = useUser();
const { analysis, analyze, analyzeState } = useAnalyze();
const { applications, stats, updateStatus } = useApplications();
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

Neon Auth with cookie-based sessions. Use `getNeonSession()` in Server Components, `useNeonSession()` in client:

```typescript
// Server Component - use getNeonSession()
import { getNeonSession } from "@/lib/auth/neon-server";
const session = await getNeonSession();
const user = session?.data?.user;
if (!user) redirect("/auth/sign-in");

// Client Component - use useNeonSession()
import { useNeonSession, neonSignOut } from "@/lib/auth/neon-client";
const { data: session, isPending } = useNeonSession();
if (!session?.user) return <SignInPrompt />;

// API Route - use getNeonSession()
import { getNeonSession } from "@/lib/auth/neon-server";
const session = await getNeonSession();
if (!session?.data?.user?.id) return unauthorized();
```

### Feature Flags (`lib/feature-flags/`)

Custom client-side feature flag system with localStorage persistence and env var overrides.

## MCP Tools (ALWAYS USE THESE)

This project has MCP servers available. **Always prefer MCP tools over terminal commands:**

### Git Operations → GitKraken MCP ✅

```
mcp_gitkraken_git_status         # Instead of: git status
mcp_gitkraken_git_add_or_commit  # Instead of: git add/commit
mcp_gitkraken_git_branch         # Instead of: git branch
mcp_gitkraken_git_push           # Instead of: git push
mcp_gitkraken_git_log_or_diff    # Instead of: git log/diff
mcp_gitkraken_git_blame          # Instead of: git blame
```

### GitHub Operations → GitKraken + GitHub MCP ✅

```
mcp_gitkraken_pull_request_create      # Create PRs
mcp_gitkraken_pull_request_get_detail  # View PR details
mcp_gitkraken_issues_get_detail        # View issues
mcp_gitkraken_issues_add_comment       # Comment on issues
mcp_github-mcp-se_search_code          # Search code across GitHub
mcp_github-mcp-se_get_file_contents    # Get file from GitHub repo
mcp_github-mcp-se_list_commits         # List commits
```

### Not Available (npx-based MCPs don't work with Claude Agent)

- Postgres MCP → Use Prisma Studio or terminal
- Vercel MCP → Use Vercel dashboard or CLI
- Brave Search MCP → Use fetch_webpage tool
- Memory MCP → Not available

## Developer Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run validate         # lint + type-check + format + test (run before PR)
npx prisma generate      # Regenerate client after schema changes
npx prisma db push       # Push schema to database
npm run db:studio        # Open Prisma Studio GUI
git branch-clean feat/x  # Create clean feature branch from main
```

## Pre-PR Checklist (ALWAYS follow before creating PRs)

1. **Run validation:** `npm run validate` — Must pass lint, type-check, format, tests
2. **Check for unused variables:** Prefix with `_` if intentionally unused
3. **Check for missing awaits:** Use `void` or `.catch()` for intentional fire-and-forget
4. **Use type imports:** `import type { X }` for type-only imports
5. **No namespace imports:** Use `import { useState }` not `import * as React`
6. **No control-flow exceptions:** Use early returns or Result patterns

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

## Code Quality Patterns (Qodana-Compliant)

**IMPORTANT:** All code must pass Qodana static analysis. Follow these patterns to avoid introducing warnings.

### React Imports

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

// ✅ Or use .catch() for error handling
somePromise.catch(console.error);

// ❌ Avoid - Qodana warns about ignored promises
useEffect(() => {
  loadData();
}, []);
```

### Unused Variables

```typescript
// ✅ Prefix unused parameters with underscore
export async function GET(_request: NextRequest): Promise<NextResponse> {}

// ✅ Destructure only what you need
const { data: _unused, error } = result;

// ❌ Avoid - unused variables trigger warnings
export async function GET(request: NextRequest): Promise<NextResponse> {}
```

### Import Optimization

```typescript
// ✅ Use type imports for type-only imports
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";

// ✅ Combine type and value imports
import { prisma, type PrismaClient } from "@/lib/db";

// ❌ Avoid - importing types as values
import { User } from "@prisma/client"; // if only used as type
```

### Error Handling (No Exceptions for Control Flow)

```typescript
// ✅ Use Result pattern or early returns
function parseValue(input: string): number | null {
  const num = parseInt(input, 10);
  return isNaN(num) ? null : num;
}

// ❌ Avoid - using try/catch for expected cases
function parseValue(input: string): number {
  try {
    return parseInt(input, 10);
  } catch {
    return 0;
  }
}
```

### Avoid Code Duplication

```typescript
// ✅ Extract common patterns to shared utilities
const formatDate = (date: Date) => new Intl.DateTimeFormat("en-GB").format(date);

// ❌ Avoid - duplicating logic across files
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

# Authentication (Neon Auth)
NEON_AUTH_BASE_URL=     # Neon Auth endpoint (from Neon console)
                        # Format: https://ep-xxx.neonauth.c-X.region.aws.neon.tech/dbname/auth

# Admin
OWNER_EMAIL=            # Email for OWNER role assignment
```

## Out of Scope (v1.2)

Mark with `FUTURE:` — PDF CV export, email integration, job board scraping, mobile app, interview AI helper
