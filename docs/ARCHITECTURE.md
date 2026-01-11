# 🏗️ CareerPal Architecture

> A dual-mode job hunting assistant with privacy-first design

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Dual-Mode Architecture](#dual-mode-architecture)
3. [Storage Layer](#storage-layer)
4. [AI Integration](#ai-integration)
5. [Authentication](#authentication)
6. [Rate Limiting](#rate-limiting)
7. [Key Components](#key-components)
8. [Tech Stack](#tech-stack)
9. [Directory Structure](#directory-structure)
10. [Decision Log](#decision-log)

---

## Overview

CareerPal is a job hunting assistant that helps users:

- **Analyze job postings** with AI to understand requirements
- **Manage CVs** in LaTeX format with multiple versions
- **Generate cover letters** tailored to each job
- **Track applications** with status, match scores, and notes

### Core Value Proposition

**Privacy without compromise.** Users can choose:

- **Local Mode**: All data stays in the browser. Zero server liability.
- **Demo Mode**: Server storage with rate-limited AI for portfolio showcase.

---

## Dual-Mode Architecture

The application runs from a single codebase but adapts behavior based on `NEXT_PUBLIC_MODE`:

```
┌──────────────────────────────────────────────────────────────────┐
│                        Single Codebase                            │
│                   (job-hunting-assistant repo)                    │
├───────────────────────────┬──────────────────────────────────────┤
│       LOCAL MODE          │           DEMO MODE                   │
│  NEXT_PUBLIC_MODE=local   │    NEXT_PUBLIC_MODE=demo              │
├───────────────────────────┼──────────────────────────────────────┤
│  🔒 Privacy-First         │  🎭 Portfolio Showcase                │
│                           │                                       │
│  Storage: IndexedDB       │  Storage: PostgreSQL                  │
│  AI Keys: User BYOK       │  AI Keys: Server (rate-limited)       │
│  Auth: None               │  Auth: Neon Auth (OAuth)              │
│  Data: Browser only       │  Data: Resets daily                   │
│  Domain: careerpal.app    │  Domain: demo.careerpal.app           │
└───────────────────────────┴──────────────────────────────────────┘
```

### Mode Detection

```typescript
// lib/storage/interface.ts
export function isLocalMode(): boolean {
  return process.env.NEXT_PUBLIC_MODE === "local";
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_MODE !== "local";
}
```

Build-time detection via `NEXT_PUBLIC_*` ensures mode is baked into the client bundle.

---

## Storage Layer

### Storage Abstraction

A unified `StorageAdapter` interface allows seamless switching between storage backends:

```typescript
// lib/storage/interface.ts
export interface StorageAdapter {
  // User profile
  getUser(): Promise<User | null>;
  updateUser(data: Partial<User>): Promise<User>;

  // CVs
  getCVs(): Promise<CV[]>;
  createCV(data: CVInput): Promise<CV>;
  updateCV(id: string, data: Partial<CV>): Promise<CV>;
  deleteCV(id: string): Promise<void>;
  getActiveCV(): Promise<CV | null>;
  setActiveCV(id: string): Promise<void>;

  // Applications
  getApplications(): Promise<Application[]>;
  createApplication(data: ApplicationInput): Promise<Application>;
  updateApplication(id: string, data: Partial<Application>): Promise<Application>;
  deleteApplication(id: string): Promise<void>;

  // File storage
  uploadFile(file: File, path: string): Promise<string>;
  getFile(path: string): Promise<Blob | null>;
  deleteFile(path: string): Promise<void>;
}
```

### Local Storage (IndexedDB via Dexie)

```typescript
// lib/storage/local.ts
class LocalDatabase extends Dexie {
  users!: Table<User>;
  cvs!: Table<CV>;
  applications!: Table<Application>;
  files!: Table<FileRecord>;
}
```

**Why Dexie over RxDB?**

- Smaller bundle size (~15KB vs ~200KB)
- Simpler API for our use case
- No sync features needed (local-only)
- Better TypeScript integration

### Server Storage (tRPC + Prisma)

```typescript
// lib/storage/server.ts
export const serverStorageAdapter: StorageAdapter = {
  async getUser() {
    return trpc.user.get.query();
  },
  async getCVs() {
    return trpc.cv.list.query();
  },
  // ... wraps existing tRPC procedures
};
```

### Storage Provider

React context provides the appropriate adapter:

```typescript
// lib/storage/provider.tsx
export function StorageProvider({ children }: Props) {
  const adapter = useMemo(() => {
    return isLocalMode() ? localStorageAdapter : serverStorageAdapter;
  }, []);

  return (
    <StorageContext.Provider value={adapter}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): StorageAdapter {
  return useContext(StorageContext);
}
```

---

## AI Integration

### BYOK (Bring Your Own Key)

In local mode, users provide their own API keys stored in `localStorage`:

```typescript
// lib/ai/key-manager.ts
export function getAPIKey(provider: AIProvider): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`careerpal_api_key_${provider}`);
}

export function setAPIKey(provider: AIProvider, key: string): void {
  localStorage.setItem(`careerpal_api_key_${provider}`, key);
}
```

### Key Resolution Flow

```typescript
// lib/ai/config.ts
export function getAPIKeyForProvider(
  provider: AIProvider,
  options?: { geminiKey?: string; openrouterKey?: string }
): string | undefined {
  // 1. Explicit parameter (server-side calls)
  if (provider === "gemini" && options?.geminiKey) return options.geminiKey;

  // 2. User's stored key (local mode)
  if (isLocalMode()) {
    const localKey = getAPIKey(provider);
    if (localKey) return localKey;
  }

  // 3. Environment variable (demo mode)
  return AI_CONFIG.apiKeys[provider];
}
```

### Supported Providers

| Provider       | Models                              | Use Case             |
| -------------- | ----------------------------------- | -------------------- |
| **Gemini**     | gemini-2.5-flash                    | Primary (fast, free) |
| **OpenRouter** | qwen-2.5-vl, mistral-small, gemma-3 | Fallback options     |

---

## Authentication

### Local Mode

No authentication needed - users work directly with browser storage.

```typescript
// components/auth-provider.tsx
if (isLocalMode()) {
  return (
    <ThemeProvider>
      {children}  {/* No auth wrapper */}
    </ThemeProvider>
  );
}
```

### Demo Mode

Full OAuth authentication via Neon Auth:

```typescript
// components/auth-provider.tsx
return (
  <ThemeProvider>
    <NeonAuthUIProvider
      authClient={neonAuthClient}
      redirectTo="/dashboard"
    >
      {children}
    </NeonAuthUIProvider>
  </ThemeProvider>
);
```

### UI Adaptation

```typescript
// components/user-menu.tsx
if (isLocalMode) {
  return (
    <div className="flex items-center gap-2">
      <UserIcon className="text-emerald-600" />
      <span>Local User</span>
    </div>
  );
}

// Demo mode: normal auth UI
if (!session?.user) {
  return <Link href="/auth/sign-in">Sign In</Link>;
}
```

---

## Rate Limiting

### Demo Mode Protection

Upstash Redis-based rate limiting prevents abuse:

```typescript
// lib/rate-limit-redis.ts
export const DEMO_RATE_LIMITS = {
  ai: { limit: 5, window: 60_000 }, // 5 AI requests/min
  upload: { limit: 3, window: 60_000 }, // 3 uploads/min
  general: { limit: 20, window: 60_000 }, // 20 requests/min
  auth: { limit: 3, window: 900_000 }, // 3 auth attempts/15min
};
```

### tRPC Middleware

```typescript
// lib/trpc/middleware/rate-limit.ts
export const aiRateLimitMiddleware = async ({ ctx, next }) => {
  const limiter = isDemoMode() ? demoRateLimiters.ai : rateLimiters.ai;

  const result = await limiter.limit(identifier);
  if (!result.success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }
  return next();
};
```

### Daily Reset Cron

Demo data resets daily at midnight UTC:

```typescript
// app/api/cron/reset-demo/route.ts
export async function GET(request: Request) {
  if (!isDemoMode()) return error(403);

  // 1. Clear user data
  await prisma.application.deleteMany({});
  await prisma.cV.deleteMany({});

  // 2. Re-seed sample data
  await seedDemoData();

  return json({ success: true });
}
```

---

## Key Components

### Mode-Aware Components

```typescript
// components/mode-banner.tsx
export function ModeBanner({ variant }: Props) {
  const isLocal = useIsLocalMode();

  const content = isLocal
    ? { title: "Privacy Mode", icon: ShieldIcon, color: "emerald" }
    : { title: "Demo Mode", icon: InfoIcon, color: "amber" };

  return <Banner {...content} />;
}

// components/mode-gate.tsx
export function ModeGate({ showIn, children, fallback }: Props) {
  const isLocal = useIsLocalMode();
  const shouldShow = showIn === "local" ? isLocal : !isLocal;

  return shouldShow ? children : fallback;
}
```

### Landing Page Adaptation

The landing page shows different messaging per mode:

| Element   | Local Mode                 | Demo Mode                      |
| --------- | -------------------------- | ------------------------------ |
| Eyebrow   | "Privacy-First Job Search" | "Your AI Job Search Companion" |
| CTA       | "Start Using CareerPal"    | "Get Started Free"             |
| Secondary | "Configure AI Keys"        | "Analyze a Job"                |
| Color     | Emerald/Teal               | Cyan/Emerald                   |

---

## Tech Stack

### Frontend

- **Next.js 15** - App Router, Server Components
- **React 19** - Client components where needed
- **TypeScript 5.9** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library

### Backend

- **tRPC v11** - End-to-end type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Demo mode database (via Neon)

### Storage

- **Dexie.js** - IndexedDB wrapper for local mode
- **Vercel Blob** - File storage for demo mode

### AI

- **Google Gemini** - Primary AI provider
- **OpenRouter** - Multi-model fallback

### Infrastructure

- **Vercel** - Hosting (two projects)
- **Upstash Redis** - Rate limiting (demo mode)
- **Neon Auth** - Authentication (demo mode)

---

## Directory Structure

```
job-hunting-assistant/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── cron/          # Scheduled jobs
│   │   └── cv/            # CV processing
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Main app
│   └── settings/          # User settings
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── mode-banner.tsx    # Mode indicator
│   ├── mode-gate.tsx      # Conditional render
│   └── auth-provider.tsx  # Auth wrapper
├── lib/
│   ├── ai/               # AI integration
│   │   ├── config.ts     # Model configuration
│   │   ├── key-manager.ts # BYOK management
│   │   └── providers/    # Gemini, OpenRouter
│   ├── storage/          # Storage abstraction
│   │   ├── interface.ts  # StorageAdapter type
│   │   ├── local.ts      # Dexie implementation
│   │   ├── server.ts     # tRPC implementation
│   │   └── provider.tsx  # React context
│   ├── trpc/             # tRPC setup
│   └── rate-limit*.ts    # Rate limiting
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed-demo.ts      # Demo data
└── docs/                 # Documentation
```

---

## Decision Log

### ADR-001: Dexie over RxDB

**Context**: Need IndexedDB storage for local mode.

**Decision**: Use Dexie.js instead of RxDB.

**Rationale**:

- Bundle size: ~15KB vs ~200KB
- Simpler API for CRUD operations
- No sync/replication features needed
- Better TypeScript support

### ADR-002: Build-Time Mode Detection

**Context**: Need to switch between local and demo mode.

**Decision**: Use `NEXT_PUBLIC_MODE` environment variable.

**Rationale**:

- Simple boolean check at build time
- No runtime overhead
- Mode is deterministic per deployment
- Works in both client and server components

### ADR-003: Upstash Redis for Rate Limiting

**Context**: Demo mode needs abuse protection.

**Decision**: Use Upstash Redis with sliding window algorithm.

**Rationale**:

- Serverless-friendly (HTTP API)
- Generous free tier
- Built-in analytics
- Works across Vercel edge functions

### ADR-004: localStorage for API Keys

**Context**: BYOK needs secure client-side key storage.

**Decision**: Store API keys in localStorage.

**Rationale**:

- Never sent to server
- Persists across sessions
- Simple API
- User controls their own keys

### ADR-005: Daily Demo Reset via Cron

**Context**: Demo mode accumulates user data.

**Decision**: Daily cron job clears and re-seeds data.

**Rationale**:

- Reduces liability for user data
- Fresh demo experience daily
- Prevents storage bloat
- Simple Vercel cron integration

---

## Further Reading

- [DUAL_MODE_DEPLOYMENT.md](./DUAL_MODE_DEPLOYMENT.md) - Deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment
- [PRD.md](./PRD.md) - Product requirements
- [ROADMAP.md](../.planning/ROADMAP.md) - Development roadmap
