# AI Integration - What Actually Worked

**Read time: 3 min**

---

## Gemini API Model Names Changed (Nov 17, 2025)

**Problem:** `[404 Not Found] models/gemini-pro is not found`

**Solution:** Google deprecated `gemini-pro`. Use:

- `gemini-2.5-flash` (stable, free)
- `gemini-2.5-pro` (more capable, free)
- `gemini-flash-latest` (auto-updates)

**How I found out:**
I called the API directly:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
```

I saw the actual model names in the response. The docs were outdated.

**Lesson:** When SDK docs fail, go straight to the API. REST endpoints don't lie.

---

## Defensive Coding for AI Responses

**Problem:** `TypeError: Cannot read properties of undefined (reading 'map')`

**Why:** AI responses don't guarantee all fields exist. Even with JSON schema prompts, fields sometimes go missing.

**Fix:**

```typescript
${(analysis.keyPoints || []).map(...)}  // Always provide fallback
```

**Pattern I use:**

- Arrays: `|| []`
- Strings: `|| ''`
- Numbers: `|| 0`

**Lesson:** Never trust external APIs, even AI ones. I always add fallbacks now.

---

## Multi-Provider Architecture

**Pattern:**

```typescript
// lib/ai.ts
export async function analyzeJob(jobDescription, userCV) {
  switch (AI_CONFIG.provider) {
    case 'gemini': return analyzeWithGemini(...)
    case 'openai': return analyzeWithOpenAI(...)
    case 'claude': return analyzeWithClaude(...)
  }
}
```

**Why:**

- Switch providers with one env var: `AI_PROVIDER=openai`
- Same interface everywhere
- Test different AIs without code changes

**Trade-off:** More upfront work, but worth it for flexibility.

---

## Prompt Engineering - Context Matters

**Key insight:** Be specific about what you DON'T want flagged.

```typescript
IMPORTANT CONTEXT:
- Candidate is a fluent English speaker (11 years in London) - English teams are NOT a concern
- Candidate is open to contract roles (12+ months) - Don't flag contracts as concerning
- Focus on technical fit and role alignment
```

Without this, AI would flag "requires English" or "contract role" as red flags. Context matters.
