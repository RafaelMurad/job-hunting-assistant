# What I Learned Building This - Rafael's Notes

> **Context:** I'm building this job hunting assistant to learn Next.js 16, Prisma, AI integration, and modern React patterns. This document is my personal learning log - written in my own words, not generated fluff.

---

## The Big Aha Moments

### 1. Gemini API Model Names Change (Nov 17, 2025)

**The Problem:** 
Spent 2 hours debugging `[404 Not Found] models/gemini-pro is not found`. Tried `gemini-1.5-flash`, `gemini-pro`, everything from the docs. All failed.

**What I Learned:**
Google deprecated `gemini-pro`. The working models are:
- `gemini-2.5-flash` (stable, free)
- `gemini-2.5-pro` (more capable, still free)
- `gemini-flash-latest` (auto-updates)

**How I Found Out:**
Curl'd the API directly:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
```

Saw the actual model names in the response. Docs were outdated.

**Takeaway:** When SDK docs fail, go straight to the API. REST endpoints don't lie.

---

### 2. Multi-Provider AI Architecture

**The Pattern:**
Instead of hardcoding Gemini everywhere, I built a provider abstraction in `lib/ai.ts`:

```typescript
export async function analyzeJob(jobDescription, userCV) {
  switch (AI_CONFIG.provider) {
    case 'gemini': return analyzeWithGemini(...)
    case 'openai': return analyzeWithOpenAI(...)
    case 'claude': return analyzeWithClaude(...)
  }
}
```

**Why This Works:**
- Change provider with one env var: `AI_PROVIDER=openai`
- Same interface for all providers
- Easy to add new providers later
- Can test different AIs without code changes

**Trade-off:**
- More upfront complexity
- Each provider has slightly different APIs (had to normalize)
- Worth it for flexibility

**What I'd Do Different:**
Maybe add provider-specific config (like rate limits, timeouts) per provider instead of global.

---

### 3. Defensive Coding for AI Responses

**The Bug:**
```
TypeError: Cannot read properties of undefined (reading 'map')
```

Cover letter generation crashed because `analysis.keyPoints` was sometimes undefined.

**The Fix:**
```typescript
${(analysis.keyPoints || []).map(...)}
```

**Why This Happened:**
AI responses aren't guaranteed to have all fields. Even with JSON schema prompts, sometimes fields are missing.

**Lesson:**
Never trust external APIs (even AI). Always have fallbacks:
- `|| []` for arrays
- `|| ''` for strings  
- `|| 0` for numbers

---

## Tech Stack Choices - Why?

### Next.js 16 App Router

**Why not Pages Router?**
App Router is the future. Learning the old way doesn't make sense in 2025.

**Server Components vs Client:**
- Server = runs on server, can directly query DB, no JS sent to browser
- Client = runs in browser, can use hooks, interactive

**When to use which:**
- Profile page (just showing data) → Server Component
- Analyze page (has form interactions) → Client Component

Still wrapping my head around this. The mental model is different from traditional React.

---

### Prisma vs Raw SQL

**Why Prisma?**
- Type-safe queries (autocomplete in VS Code)
- Automatic migrations (no manual SQL)
- Works with SQLite (dev) and PostgreSQL (prod)

**Example:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
})
```

vs raw SQL:
```sql
SELECT * FROM User WHERE id = ?
```

**Trade-off:**
Prisma is easier but adds abstraction. For complex queries, sometimes raw SQL is clearer.

---

### SQLite → PostgreSQL Path

**Current:** SQLite (`file:./dev.db`)
- Zero setup for local dev
- Single file database
- Perfect for MVP

**Future:** PostgreSQL
- Better for production (multi-user, concurrent writes)
- Required for deployment platforms like Vercel
- Prisma makes migration easy (just change connection string)

---

## Patterns I'm Using

### 1. API Route Pattern (REST-style)

```typescript
// app/api/analyze/route.ts
export async function POST(request: NextRequest) {
  const { jobDescription, userId } = await request.json()
  
  // Get user from DB
  const user = await prisma.user.findUnique(...)
  
  // Call AI
  const analysis = await analyzeJob(jobDescription, userCV)
  
  return NextResponse.json(analysis)
}
```

**Why this works:**
- Standard REST pattern
- Easy to test with curl/Postman
- Client-side code just does `fetch('/api/analyze', {...})`

---

### 2. Prompt Engineering for Job Analysis

**Key insight:** Be specific about what you DON'T want flagged.

**Example:**
```typescript
IMPORTANT CONTEXT:
- Candidate is fluent English speaker (11 years in London) - English teams are NOT a concern
- Candidate is open to contract roles (12+ months) - Don't flag contracts as concerning
- Focus on technical fit and role alignment
```

Without this, AI would flag "requires English" or "contract role" as red flags. Context matters.

---

## Mistakes I Made

### 1. Trusting Documentation Blindly

Spent hours using `gemini-pro` because that's what the docs said. Should've tested the API directly first.

**Lesson:** Docs lag behind reality. Always verify.

---

### 2. Not Adding Defensive Checks Early

Hit the `keyPoints.map()` error in production. Should've added `|| []` from the start.

**Lesson:** For any external data (AI, APIs, user input), assume it might be missing/malformed.

---

### 3. Dark Mode by Default

Initial UI was dark mode with poor contrast. Realized most job hunters use this during the day, not at night.

**Lesson:** Default to light mode for productivity tools. Add dark mode as option later.

---

## Next Learning Goals

1. **Streaming AI responses** - Show tokens as they come in (better UX)
2. **Testing** - Learn React Testing Library + Vitest
3. **Error boundaries** - Proper error handling in React
4. **Server Actions** - Simpler than API routes for mutations?
5. **Deployment** - Get this on Vercel, learn environment variables in prod

---

## Resources That Actually Helped

**Next.js:**
- Official App Router docs (best source)
- [Lee Robinson's YouTube](https://www.youtube.com/@leerob) - practical examples

**Prisma:**
- Official docs schema guide
- Played around in Prisma Studio (`npx prisma studio`) to understand relations

**AI:**
- Just read the SDK source code on GitHub when docs weren't clear
- Google's official Gemini playground to test prompts

---

**Last Updated:** Nov 17, 2025  
**Project Status:** MVP working, ready to clean up and add tests
