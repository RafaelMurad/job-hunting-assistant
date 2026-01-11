# Building CareerPal: A Privacy-First Job Hunting Assistant

> How I built a dual-mode web app that runs entirely in the browser OR on a server—from the same codebase.

---

## The Problem

I was job hunting. Again. And like every developer who's been through the process, I found myself:

- Copy-pasting job descriptions into ChatGPT
- Manually tailoring my CV for each application
- Losing track of which version I sent where
- Worrying about my personal data sitting on random servers

I wanted a tool that could help me **analyze jobs, manage CVs, and track applications**—but I didn't want to:

1. Pay for yet another SaaS subscription
2. Trust a random startup with my career data
3. Build something that only I could use

So I built **CareerPal**: a job hunting assistant with a twist.

---

## The Solution: Dual-Mode Architecture

What if the same app could run in two completely different ways?

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Codebase                           │
├───────────────────────────┬─────────────────────────────────┤
│       LOCAL MODE          │          DEMO MODE               │
│   (Self-Hosted)           │   job-hunting-assistant.vercel   │
├───────────────────────────┼─────────────────────────────────┤
│   🔒 Privacy-First        │   🎭 Portfolio Showcase          │
│   Data: Browser only      │   Data: PostgreSQL               │
│   AI: User's own keys     │   AI: My keys (rate-limited)     │
│   Auth: None needed       │   Auth: OAuth sign-in            │
│   Deploy: Clone & run     │   Deploy: Vercel                 │
└───────────────────────────┴─────────────────────────────────┘
```

**Local Mode** is the "real" product—users clone the repo and run it locally. Your data literally never touches a server. You bring your own AI API keys.

**Demo Mode** is for my portfolio—recruiters can try it without setup. Data resets daily. Hosted on Vercel.

Same codebase. Same features. Zero liability.

---

## Technical Deep Dive

### 1. Storage Abstraction Layer

The key insight was creating a **storage adapter interface** that both modes implement:

```typescript
interface StorageAdapter {
  getUser(): Promise<User | null>;
  getCVs(): Promise<CV[]>;
  createApplication(data: Application): Promise<Application>;
  // ... etc
}
```

**Local mode** uses Dexie.js (IndexedDB wrapper):

```typescript
// lib/storage/local.ts
class LocalDatabase extends Dexie {
  users!: Table<User>;
  cvs!: Table<CV>;
  applications!: Table<Application>;
}
```

**Demo mode** wraps existing tRPC procedures:

```typescript
// lib/storage/server.ts
const serverAdapter: StorageAdapter = {
  async getCVs() {
    return trpc.cv.list.query();
  },
};
```

A React context provides the right adapter based on build-time environment:

```typescript
const adapter = isLocalMode() ? localStorageAdapter : serverStorageAdapter;
```

### 2. BYOK (Bring Your Own Key)

In local mode, users provide their own Gemini or OpenRouter API keys:

```typescript
// Stored in localStorage, never sent to server
function setAPIKey(provider: "gemini" | "openrouter", key: string) {
  localStorage.setItem(`careerpal_api_key_${provider}`, key);
}
```

The AI client resolves keys dynamically:

```typescript
function getAPIKeyForProvider(provider: AIProvider): string | undefined {
  // 1. Check localStorage (local mode)
  if (isLocalMode()) {
    const localKey = getAPIKey(provider);
    if (localKey) return localKey;
  }
  // 2. Fall back to env var (demo mode)
  return process.env[`${provider.toUpperCase()}_API_KEY`];
}
```

### 3. Demo Mode Protections

To prevent abuse, demo mode includes:

**Rate Limiting** with Upstash Redis:

```typescript
const DEMO_LIMITS = {
  ai: { limit: 5, window: 60_000 }, // 5 AI requests per minute
  upload: { limit: 3, window: 60_000 },
};
```

**Daily Reset** via Vercel Cron:

```typescript
// Runs at midnight UTC
export async function GET() {
  await prisma.application.deleteMany({});
  await prisma.cV.deleteMany({});
  await seedDemoData(); // Fresh sample data
}
```

### 4. Conditional UI

Components adapt based on mode:

```tsx
function UserMenu() {
  if (isLocalMode) {
    return <LocalUserIndicator />; // Green shield icon
  }
  return <SignInButton />; // Normal auth
}
```

The landing page shows different messaging:

| Element  | Local Mode                 | Demo Mode               |
| -------- | -------------------------- | ----------------------- |
| Headline | "Privacy-First Job Search" | "Your AI Job Companion" |
| CTA      | "Start Using CareerPal"    | "Get Started Free"      |
| Color    | Emerald                    | Cyan                    |

---

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Dexie.js** for IndexedDB
- **tRPC + Prisma** for server
- **Gemini / OpenRouter** for AI
- **Upstash Redis** for rate limiting
- **Vercel** for hosting

---

## What I Learned

### 1. Abstraction Pays Off

Creating the `StorageAdapter` interface took extra time upfront, but made the dual-mode switch trivial. Every new feature automatically works in both modes.

### 2. Build-Time > Runtime for Mode Detection

Using `NEXT_PUBLIC_MODE` at build time means:

- No runtime checks
- Dead code elimination
- Smaller bundles per deployment

### 3. localStorage is Fine for API Keys

For BYOK, localStorage is actually ideal:

- Keys never touch the server
- Persists across sessions
- User has full control

### 4. Daily Reset Simplifies Everything

Instead of complex data retention policies, just... reset daily. Users know what to expect, and I have zero liability.

---

## Try It Yourself

- **Demo**: [job-hunting-assistant.vercel.app](https://job-hunting-assistant.vercel.app) (sample data, rate-limited)
- **Run Locally** (recommended):
  ```bash
  git clone https://github.com/RafaelMurad/job-hunting-assistant.git
  cd job-hunting-assistant && npm install && npm run dev
  ```
- **GitHub**: [github.com/RafaelMurad/job-hunting-assistant](https://github.com/RafaelMurad/job-hunting-assistant)

---

## What's Next

- **Phase 7**: Data import/export for local mode
- **Phase 8**: PWA with offline support

The goal is a job hunting tool that's as private as a spreadsheet but as powerful as a SaaS.

---

_Questions? Find me on [LinkedIn](https://linkedin.com/in/rafaelmurad) or [GitHub](https://github.com/RafaelMurad)._

---

**Tags**: #nextjs #typescript #privacy #webdev #jobsearch #portfolio #react
