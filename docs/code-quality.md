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
