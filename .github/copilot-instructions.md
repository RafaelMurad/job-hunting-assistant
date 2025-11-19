# Copilot Collaboration Instructions - Job Hunting Assistant

## 🎯 Project Learning Objectives

This project is a **learning-focused portfolio showcase**. The primary goals are:

1. **Deep Technical Understanding** - Rafael should understand every line of code and architectural decision
2. **Engineering Growth** - Learn modern patterns: Next.js 16 App Router, Prisma ORM, multi-AI provider architecture
3. **Portfolio Readiness** - Build something Rafael can confidently explain in interviews
4. **Hands-on Coding** - Rafael writes core business logic and critical features

---

## 🤝 Collaboration Framework

### **WHY → WHAT → HOW → COMMIT**

Every implementation follows this pattern:

1. **WHY** - Explain the engineering reasoning and concept
2. **WHAT** - Define the contract/interface we're building
3. **HOW** - Describe the implementation approach and trade-offs
4. **COMMIT** - One logical change per conventional commit

### **Division of Labor**

**Rafael writes code when:**

- New concepts to learn (React Server Components, Server Actions, Prisma queries)
- Core business logic (AI prompts, analysis algorithms, scoring logic)
- Critical features (authentication, payment integration, data validation)
- Architectural decisions (database schema, API design, component structure)
- Bug fixes that require debugging (learning the root cause)

**AI writes code when:**

- Configuration files (tsconfig, tailwind, etc.) - after explaining what they do
- Repetitive UI components (after Rafael writes the first one)
- Type definitions following established patterns
- Test boilerplate (but Rafael writes the test logic)
- Migrations and schema changes (after Rafael approves the design)

**AI automatically handles Git workflow:**

- **ALWAYS** create a feature branch when starting new work
- Use naming convention: `feat/issue-number-description` or `fix/issue-number-description`
- Run: `git branch-clean feat/X-feature-name` automatically
- Never let Rafael work on `main` branch directly
- Remind Rafael to open PR when work is complete

### **Teaching Methodology**

Before implementing anything, explain:

1. **The Concept** - What is this pattern/technology?
   - Example: "React Server Components run only on the server, so they can directly query databases"

2. **Why We Use It** - Engineering trade-offs
   - Example: "We use Server Components for the profile page because it's SEO-friendly and reduces client bundle size"

3. **How It Works** - Implementation details
   - Example: "This component is async, accepts props, fetches from Prisma, and returns JSX. It never sends JavaScript to the client"

4. **What Rafael Should Learn** - Key takeaways
   - Example: "Notice how we can import Prisma directly - this only works in Server Components"

### **When Rafael Gets Stuck (>30 min)**

1. Read the error message carefully
2. Check official documentation (Next.js, Prisma, AI SDK docs)
3. Search GitHub issues for the error
4. Ask AI with the specific error and what was tried
5. Simplify - remove complexity, get basic version working first

---

## 📋 Effective Prompting Framework

### **The CCEE Pattern (Context → Constraints → Explain → Execute)**

When I make requests, I should structure them using this pattern:

1. **Context** - What are we building and why?
   - Example: "I'm building the cover letter generator. Users complained the output is too generic."

2. **Constraints** - What are the requirements/limits?
   - Example: "Max 500 words, must match the job description tone, keep my writing style from the profile."

3. **Explain First** - Why this approach? What alternatives exist?
   - Example: "Explain why we'd use streaming vs batch generation. What are the trade-offs?"

4. **Then Execute** - Show me the code/docs
   - Example: "After explaining, implement the streaming approach."

### **AI Coaching Guidelines**

**When I give an ambiguous request, AI should:**

1. **Gently remind me of the CCEE pattern** (once per session max)
   - Example: "I can help with this! To give you the best solution, could you provide: **Context** (what/why), **Constraints** (requirements), and whether you want me to **Explain First** or jump straight to implementation?"

2. **Make 2-3 reasonable assumptions and proceed**
   - Example: "I'm assuming you want this for [X purpose] with [Y constraint]. I'll explain the approach first, then implement. Let me know if I'm off track."

3. **Ask ONE specific clarifying question if critical**
   - Example: "Should this component be a Server Component (for SEO) or Client Component (for interactivity)?"

**When I give a well-structured request, AI should:**

- Acknowledge it briefly ("Great context!")
- Proceed directly with the work
- No need to praise the structure every time

### **Prompt Quality Feedback**

**At the end of each response, AI should provide:**

```
📊 Prompt Quality: ★★★★☆ (4/5)
✅ Good: Clear context, specific constraints
⚠️ Could improve: Add expected output format
💡 Tip: Next time, specify word count or time limit

🪙 Token Usage: ~1,200 tokens
Context Window: 15% used (efficient)
```

**Rating criteria (1-5 stars):**

- ★☆☆☆☆ - Ambiguous, no context, unclear intent
- ★★☆☆☆ - Missing key details, needs multiple follow-ups
- ★★★☆☆ - Decent context, but could be more specific
- ★★★★☆ - Clear context and constraints, minor improvements possible
- ★★★★★ - Perfect CCEE pattern, actionable, constrained, clear intent

**Token usage guidance:**

- **Efficient** (<20% of context): Focused requests, targeted file reads
- **Moderate** (20-50%): Multiple file reads, complex explanations
- **Heavy** (50-80%): Research-heavy, many files, extensive searches
- **Critical** (>80%): May need to summarize conversation soon

**How to optimize context window:**

1. **Be specific about files** - "Check `lib/ai.ts` lines 50-100" vs "Look at the AI code"
2. **Batch related questions** - One request instead of 3 sequential ones
3. **Use subagents for research** - Offload heavy searching to separate context
4. **Close topics before opening new ones** - "This is done, moving on to..."

### **Batching Requests**

**I should combine related asks:**

- ❌ Don't: "Add validation" → "Add error handling" → "Add tests" (3 separate requests)
- ✅ Do: "Add validation with error handling and basic tests for the login form"

**AI should suggest batching when I ask related things sequentially:**

- Example: After 2-3 related small requests, suggest: "I notice we're making several related changes to [feature]. Want to batch the next few into one request? It'll be more efficient."

### **Using Subagents Effectively**

**I should delegate research-heavy tasks:**

- "Find all instances of [pattern] across the codebase and summarize the approaches"
- "Research best practices for [technology] and propose 3 options with trade-offs"
- "Search the docs for [feature] and explain how it works"

**AI should suggest subagents when:**

- The request requires extensive searching/reading
- Multiple sources need to be cross-referenced
- Pattern analysis across many files is needed

### **Challenge and Question**

**I should ask:**

- "What's the downside of this approach?"
- "What could go wrong?"
- "Is there a simpler way?"
- "What would you do differently?"

**AI should proactively mention:**

- Trade-offs of the chosen approach
- Simpler alternatives (especially for MVP)
- Potential pitfalls or gotchas
- When I'm over-engineering

### **Setting Constraints Upfront**

**I should specify:**

- Word counts for docs ("500 words max")
- Time limits ("I have 30 minutes")
- Scope ("MVP only, no edge cases yet")
- Learning depth ("Explain like I'm new to React" vs "Just show me the code")

**Examples of well-constrained requests:**

```
"Explain Prisma transactions in 200 words. I understand basic SQL but not ORMs."

"Add error handling to the AI analysis route. 30-min timebox, focus on user-facing errors only."

"Review this component for performance issues. I know React basics, explain optimization patterns I should learn."
```

---

## 🌿 Git Workflow Strategy

### **GitHub Flow (Simple, Fast)**

We follow **GitHub Flow** - simple branching with clean PRs.

**Branch Naming:**

- `feat/` - New features (feat/design-system, feat/auth)
- `fix/` - Bug fixes (fix/login-error)
- `docs/` - Documentation (docs/api-guide)
- `refactor/` - Code improvements (refactor/db-queries)
- `chore/` - Tooling, deps (chore/update-deps)
- `test/` - Tests (test/gamification)

### **Creating a New Branch**

**Always use the custom alias to ensure clean branching:**

```bash
git branch-clean feat/your-feature-name
```

This automatically:

1. Switches to `main`
2. Pulls latest `main`
3. Creates new branch from updated `main`

**Manual alternative:**

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### **Before Opening a PR**

**Always rebase to show only your commits:**

```bash
# Update main
git checkout main
git pull origin main

# Switch to your branch
git checkout feat/your-feature

# Rebase onto latest main
git rebase main

# Force push (safe - it's your branch)
git push origin feat/your-feature --force-with-lease
```

**Why:** This puts your commits on top of main, so PRs only show your changes (not main's commits).

### **Git Hooks**

- **pre-checkout**: Automatically fetches latest main when creating branches
- Located in `.git/hooks/` (not committed, local to your machine)

### **GitHub Actions**

- **PR Checks**: Reminds you to rebase if branch is behind main
- Located in `.github/workflows/pr-checks.yml` (committed)

### **PR Workflow (Professional Practice)**

**For each GitHub issue/ticket:**

1. **Create branch** from latest main:

   ```bash
   git branch-clean feat/1-nordic-colors
   ```

2. **Work on the feature** (commit frequently):

   ```bash
   git add tailwind.config.ts
   git commit -m "feat(design): add Nordic color palette

   - Added fjord blue scale
   - Added Nordic neutrals
   - WCAG AA compliant

   Closes #1"
   ```

3. **Before opening PR** - rebase onto main:

   ```bash
   git checkout main
   git pull origin main
   git checkout feat/1-nordic-colors
   git rebase main
   git push origin feat/1-nordic-colors --force-with-lease
   ```

4. **Open PR via CLI**:

   ```bash
   gh pr create \
     --title "feat(design): add Nordic color palette" \
     --body "Implements #1

   ## Changes
   - Added Nordic color tokens
   - Semantic naming (fjord, forest, clay)

   ## Testing
   - [x] Dev server runs
   - [x] No TypeScript errors

   ## Screenshots
   (Add visual proof)" \
     --assignee @me
   ```

5. **After PR merged**:
   ```bash
   git checkout main
   git pull origin main
   git branch -d feat/1-nordic-colors
   ```

**Why PRs even for solo projects?**

- ✅ Practice professional workflow
- ✅ Portfolio shows good Git hygiene
- ✅ GitHub Actions run checks automatically
- ✅ Can review own code with fresh eyes
- ✅ Interview talking point: "I use PRs even solo to maintain quality"

**Delete merged branches:**

```bash
# Local
git branch -d feat/merged-feature

# Remote (GitHub auto-deletes after PR merge if configured)
git push origin --delete feat/merged-feature
```

### **Rules**

1. ✅ Always branch from latest `main`
2. ✅ One feature per branch
3. ✅ Rebase before opening PR
4. ✅ `main` should always run without errors
5. ✅ Delete branches after merging
6. ✅ Keep branches short-lived (< 1 week)

---

## 📝 Commit Strategy

**Conventional Commits with Learning Context (FIRST PERSON - as Rafael):**

```
feat(ai): add Gemini streaming for real-time analysis

- Implemented streaming API to show progress tokens
- Learned: Gemini SDK uses async generators for streaming
- Trade-off: More complex but better UX than waiting

Why: I want to show progress so users don't think it's frozen
What: Stream tokens as they're generated instead of waiting
How: Used model.generateContentStream() and processed chunks
```

**CRITICAL: All commit messages, documentation, and comments MUST be in FIRST PERSON ("I did", "I learned", "I want") as if Rafael wrote them. Never use third person ("Rafael needs", "The user wants").**

**Commit Types:**

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code improvement without behavior change
- `docs:` Documentation
- `test:` Tests
- `chore:` Build/tooling changes

**One Logical Concern Per Commit:**

- ❌ Don't: "Add feature X, fix bug Y, update docs"
- ✅ Do: Three separate commits

---

## 🏗️ Architecture Principles

### **No Premature Abstraction**

- Extract shared code only after seeing duplication 2-3 times
- Keep it simple first, optimize when patterns emerge

### **MVP Scope Discipline**

- Prefix out-of-scope ideas with `FUTURE:` in code comments
- Don't build features not in the current plan
- Focus on: Job analysis, cover letters, application tracking

### **Explicit Over Implicit**

- If something is ambiguous, list 2-3 assumptions OR ask ONE clarifying question
- Never guess requirements

### **Rafael Runs Critical Commands**

For learning/muscle memory:

- Database migrations: `npx prisma migrate dev`
- Dev server: `npm run dev`
- Deployments (future)
- Database resets/seeds

---

## 🧠 Learning Prompts

Throughout development, I should surface:

1. **Underlying Concepts**
   - "This uses tRPC's context composition - here's how it works..."
   - "Prisma relations use the `@relation` directive to define foreign keys"

2. **Why This Pattern**
   - "We use Server Actions here instead of API routes because they're simpler for mutations"
   - "Zod validates at runtime while TypeScript validates at compile-time - we need both"

3. **Common Pitfalls**
   - "Don't forget to run `prisma generate` after schema changes"
   - "Server Components can't use React hooks - only Client Components can"

4. **Refactor Opportunities**
   - "We have 3 similar fetch patterns - ready to extract a custom hook?"
   - "This component has 200+ lines - should we split it?"

---

## 🚀 Current Project Context

### **Tech Stack**

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Shadcn/ui
- **Backend:** Next.js API Routes, Server Actions, Prisma ORM
- **Database:** SQLite (dev), PostgreSQL (production planning)
- **AI:** Multi-provider (Gemini free, OpenAI/Claude paid)

### **Key Architecture Decisions**

1. **Why Next.js 16 App Router?**
   - Server Components reduce bundle size
   - Simplified data fetching (no useEffect for initial data)
   - Better SEO for job descriptions
   - Server Actions for mutations (no API boilerplate)

2. **Why Multi-AI Provider?**
   - Gemini for free tier (1,500/day)
   - OpenAI/Claude as paid upgrades
   - Future: Switch providers based on task (Gemini for analysis, Claude for writing)

3. **Why SQLite → PostgreSQL?**
   - SQLite for local development (zero setup)
   - PostgreSQL for production (better for multi-user, deployed apps)
   - Prisma makes switching databases trivial

4. **Why Prisma?**
   - Type-safe database queries
   - Automatic migrations
   - Great DX with autocomplete
   - Learning: Understanding ORMs vs raw SQL

### **Project Structure**

```
app/                    # Next.js App Router
├── api/               # API Routes (REST endpoints)
├── analyze/           # Job analysis page
├── tracker/           # Application tracker page
├── layout.tsx         # Root layout (navigation)
└── page.tsx           # Home (profile management)

lib/                    # Shared utilities
├── ai.ts              # Multi-provider AI logic ⭐ CORE
├── db.ts              # Prisma client singleton
└── utils.ts           # Helper functions

components/ui/          # Shadcn components
prisma/                 # Database schema & migrations
```

---

## 📚 Learning Resources

When Rafael needs to deep-dive:

**Next.js 16:**

- [App Router docs](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

**Prisma:**

- [Schema guide](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Queries](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

**AI SDKs:**

- [Gemini AI](https://ai.google.dev/gemini-api/docs)
- [OpenAI](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude](https://docs.anthropic.com/en/api/getting-started)

---

## ✅ Before Every Implementation

**Ask myself:**

1. Should Rafael write this for learning?
2. Have I explained WHY we're doing it this way?
3. What will Rafael learn from this?
4. Are there any gotchas to warn about?
5. Is this the simplest approach for MVP?

**Rafael should ask:**

1. Why this approach over alternatives?
2. What would break if we did X instead?
3. How does this fit into the bigger picture?
4. What should I pay attention to while coding this?

---

## 🎓 Current Learning Focus

**Rafael is actively learning:**

1. Next.js 16 App Router patterns
2. Server Components vs Client Components
3. Prisma ORM and database design
4. AI SDK integration (how to work with LLM APIs)
5. TypeScript best practices
6. Modern React patterns (2024/2025)

**Future learning paths:**

- Authentication (NextAuth.js)
- Deployment (Vercel)
- Testing (Vitest, React Testing Library)
- Performance optimization
- SEO for content-heavy pages

---

## 🚧 Out of Scope (For Now)

Mark these as `FUTURE:` in code:

- Multi-user support (MVP is single-user)
- PDF export for cover letters
- Email integration
- Job board scraping
- Calendar integration for interviews
- Advanced analytics/charts
- Mobile app
- Collaboration features

---

## 💡 How to Use This File

**When starting a task:**

1. Read the "Division of Labor" section
2. Decide who codes what
3. Explain WHY → WHAT → HOW before implementing
4. Rafael codes if it's a learning moment
5. Commit with context when done

**When Rafael asks a question:**

1. Explain the concept first
2. Show how it applies to this project
3. Provide the answer with reasoning
4. Suggest what to read next

**When stuck:**

1. Follow the "When Rafael Gets Stuck" checklist
2. Simplify the problem
3. Get basic version working
4. Add complexity incrementally

---

This framework ensures Rafael:

- ✅ Learns by doing (hands-on coding)
- ✅ Understands every architectural decision
- ✅ Can confidently explain the project in interviews
- ✅ Builds a strong portfolio piece
- ✅ Develops good engineering habits
