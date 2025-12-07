# Code Quality - ESLint & Clean Code

**Read time: 4 min**

---

## ESLint Cleanup Before Merging

Before merging to main, I ran `npm run lint` and got 6 errors:

### 1. Unused Variables

**Problem:** `const userId = '1'` assigned but never used.

**Fix:** Remove it or use it.

**Lesson:** Dead code looks sloppy in code reviews.

---

### 2. Shadcn Empty Interface Pattern

**ESLint error:**

```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
// ❌ "equivalent to its supertype"
```

**Why it exists:** Shadcn pattern allows future customization:

```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "ghost"; // Can add later
}
```

**Fix:**

```typescript
// Shadcn pattern: Empty interface allows future prop customization
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends ...
```

**Lesson:** Explain WHY you're disabling lint rules. Don't just suppress blindly.

---

### 3. CommonJS vs ES Modules

**Problem:** Diagnostic script used `require()`, project uses `import`.

**Trade-off:**

- Convert to ES modules → needs build step
- Disable rule for scripts → simpler

**Fix:**

```javascript
/* eslint-disable @typescript-eslint/no-require-imports */
// Diagnostic script uses CommonJS for simplicity (no build step)
require('dotenv').config(...)
```

**Lesson:** Pick one module system. If you must mix, document why.

---

## .env.example Pattern

**Problem:** `.env*` in `.gitignore` blocked `.env.example`.

**Fix:**

```gitignore
.env.local       # Secret values (gitignored)
!.env.example    # Template (committed)
```

**Lesson:** `.env.example` with fake values is industry standard.

---

## Technical Debt I'm Carrying (Intentionally)

### Single-User MVP

**What:** Hardcoded `userId: '1'`, no auth.

**Why:** The learning focus is AI integration, not authentication. The schema already supports multi-user (foreign keys exist).

**Interview answer:** "I prioritized learning the core AI features first. The database schema supports multi-user features (userId foreign keys, indexes), so adding NextAuth.js is a clear next step when needed."

---

### console.error() for Logging

**What:** Using `console.error()` in API routes.

**Why:** Need to see errors during development.

**Production plan:** Replace with Sentry or similar.

**Lesson:** Never log secrets, API keys, or PII.

---

### No Tests Yet

**Why:** Prioritized learning Next.js 16, Prisma, AI SDKs first.

**Next step:** Vitest + React Testing Library.

**Interview answer:** "I manually tested core flows. Testing is next on my learning roadmap."

---

## Qodana Code Quality Fixes (December 2024)

### Problem: UMD Global Variables

**Qodana warning:** "Referenced UMD global variable"

**Cause:** Using `import * as React from "react"` creates UMD global references when accessing `React.JSX.Element`, `React.ReactNode`, etc.

**Fix:** Use named imports:

```typescript
// ❌ Bad - creates UMD global warning
import * as React from "react";
function Component(): React.JSX.Element { ... }

// ✅ Good - direct imports
import type { JSX, ReactNode } from "react";
function Component(): JSX.Element { ... }
```

**Affected patterns:**

- `React.JSX.Element` → `JSX.Element` (import `type { JSX }`)
- `React.ReactNode` → `ReactNode` (import `type { ReactNode }`)
- `React.FormEvent` → `FormEvent` (import `type { FormEvent }`)
- `React.forwardRef` → `forwardRef` (import `{ forwardRef }`)
- `React.HTMLAttributes<T>` → `HTMLAttributes<T>` (import `type { HTMLAttributes }`)

---

### Problem: Ignored Promises

**Qodana warning:** "Promise returned from X is ignored"

**Cause:** Calling an async function without `await` or handling the promise.

**Fix:** Use `void` operator to explicitly mark intentionally ignored promises:

```typescript
// ❌ Bad - promise ignored
useEffect(() => {
  loadData(); // Warning: promise ignored
}, []);

// ✅ Good - explicitly ignored with void
useEffect(() => {
  void loadData(); // Clear intent: we don't need to await
}, []);
```

---

### Problem: Redundant Regex Escapes

**Qodana warning:** "Redundant character escape"

**Cause:** Escaping characters that don't need escaping in regex.

**Fix:** `\{` and `\}` don't need escaping outside character classes:

```typescript
// ❌ Bad - redundant escape
text.match(/\{[\s\S]*\}/);

// ✅ Good - braces don't need escaping here
text.match(/{[\s\S]*}/);
```

---

### Problem: Duplicated Code Fragments

**Qodana warning:** "Duplicated code fragment"

**Fix:** Extract shared logic into helper functions:

```typescript
// ❌ Bad - duplicated API call logic in two functions
async function parseWithVision() {
  /* 50 lines */
}
async function parseWithText() {
  /* 50 lines - same pattern */
}

// ✅ Good - shared logic extracted
async function callGeminiAndParse(parts: GeminiPart[]): Promise<ParsedCV> {
  // Shared API call and response parsing
}

async function parseWithVision(buffer: Buffer) {
  return callGeminiAndParse([{ inline_data: ... }]);
}

async function parseWithText(text: string) {
  return callGeminiAndParse([{ text: ... }]);
}
```

---

### Problem: Static Generation with Database

**Build error:** "Environment variable not found: DATABASE_URL" during `next build`

**Cause:** Next.js tries to prerender pages at build time. Pages using Prisma need the database, which isn't available in CI.

**Fix:** Force dynamic rendering for database pages:

```typescript
// app/dashboard/page.tsx
// Force dynamic rendering - this page uses Prisma
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
// ... rest of page
```

---

## Pattern Summary

| Issue             | Pattern          | Example                                  |
| ----------------- | ---------------- | ---------------------------------------- |
| UMD globals       | Named imports    | `import type { JSX } from "react"`       |
| Ignored promises  | void operator    | `void asyncFunction()`                   |
| Redundant escapes | Remove backslash | `/{pattern}/` not `/\{pattern\}/`        |
| Code duplication  | Extract helpers  | Shared logic in one function             |
| Build-time DB     | Force dynamic    | `export const dynamic = "force-dynamic"` |
