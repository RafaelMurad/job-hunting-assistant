# Job Hunt AI - Implementation Plan

**MVP Phase 1 Detailed Breakdown**

Version: 1.0
Date: November 17, 2025
Developer: Rafael Murad
Tech Stack: Next.js 14+, TypeScript, Prisma, PostgreSQL, TailwindCSS, Shadcn/ui, Claude API

---

## Overview

This implementation plan breaks down the MVP Phase 1 (8 weeks) into concrete, actionable tasks. Each task includes technical details, dependencies, and acceptance criteria.

**Total Estimated Time:** 8-10 weeks (part-time) or 6-8 weeks (full-time)

---

## Phase 1.1: Foundation Setup (Week 1-2)

**Goal:** Production-ready project foundation with core infrastructure

### Task 1.1.1: Next.js Project Initialization

**Priority:** Critical
**Estimated Time:** 2-3 hours
**Dependencies:** None

**Steps:**

```bash
# Create Next.js 14+ with TypeScript
npx create-next-app@latest job-hunt-ai --typescript --tailwind --app --eslint

# Project structure
job-hunt-ai/
├── src/
│   ├── app/              # Next.js 14 App Router
│   ├── components/       # React components
│   │   ├── ui/          # Shadcn components
│   │   └── features/    # Feature-specific components
│   ├── lib/             # Utilities
│   │   ├── api/         # API client
│   │   ├── db/          # Database client
│   │   └── utils/       # Helper functions
│   ├── server/          # tRPC routers
│   │   ├── routers/
│   │   └── trpc.ts
│   └── types/           # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
└── tests/
```

**Configuration Files:**

- `tsconfig.json` - Strict TypeScript settings
- `next.config.js` - Next.js configuration
- `.env.example` - Environment variables template
- `.eslintrc.json` - ESLint rules
- `prettier.config.js` - Code formatting

**Acceptance Criteria:**

- [x] Project runs with `npm run dev`
- [x] TypeScript strict mode enabled
- [x] ESLint and Prettier configured
- [x] Git initialized with proper `.gitignore`

---

### Task 1.1.2: Install Core Dependencies

**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Task 1.1.1

**Dependencies to Install:**

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.8.0",
    "@trpc/server": "^10.45.0",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@tanstack/react-query": "^5.17.0",
    "next-auth": "^5.0.0-beta.4",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "zustand": "^4.4.7",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.312.0",
    "@anthropic-ai/sdk": "^0.10.0",
    "date-fns": "^3.2.0"
  },
  "devDependencies": {
    "prisma": "^5.8.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.4",
    "tsx": "^4.7.0"
  }
}
```

**Acceptance Criteria:**

- [x] All dependencies installed
- [x] No security vulnerabilities
- [x] Package lock file committed

---

### Task 1.1.3: Prisma Setup with PostgreSQL

**Priority:** Critical
**Estimated Time:** 3-4 hours
**Dependencies:** Task 1.1.2

**Steps:**

1. **Initialize Prisma:**

```bash
npx prisma init
```

2. **Configure Database Connection:**

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/jobhuntai?schema=public"
```

3. **Create Initial Schema** (from your spec):

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// USER & AUTHENTICATION
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  avatarUrl         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  plan              Plan      @default(FREE)
  timezone          String    @default("UTC")
  communicationStyle String   @default("professional")
  defaultCVStyle    String    @default("modern")

  masterCV          MasterCV?
  jobAnalyses       JobAnalysis[]
  tailoredCVs       TailoredCV[]
  applications      Application[]

  @@index([email])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

// Add remaining models from your spec...
```

4. **Run Migration:**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Create Database Client:**

```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Database Options:**

- **Local Development:** PostgreSQL via Docker
- **Staging/Production:** Neon, Supabase, or Railway

**Docker Setup (Optional):**

```yaml
# docker-compose.yml
version: "3.8"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: jobhunt
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: jobhuntai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Acceptance Criteria:**

- [x] Prisma schema matches specification
- [x] Database migrations run successfully
- [x] Prisma Client generated
- [x] Database connection verified
- [x] Seed script created (optional)

---

### Task 1.1.4: Configure TailwindCSS and Shadcn/ui

**Priority:** High
**Estimated Time:** 2-3 hours
**Dependencies:** Task 1.1.1

**Steps:**

1. **Initialize Shadcn/ui:**

```bash
npx shadcn-ui@latest init
```

Configuration:

- Style: Default
- Base color: Slate
- CSS variables: Yes

2. **Install Base Components:**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add skeleton
```

3. **Configure Custom Colors** (from your spec):

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563eb",
          "primary-dark": "#1e40af",
          "primary-light": "#3b82f6",
        },
        status: {
          applied: "#6b7280",
          screening: "#3b82f6",
          technical: "#8b5cf6",
          final: "#f59e0b",
          offer: "#10b981",
          rejected: "#ef4444",
          ghosted: "#6b7280",
        },
        match: {
          poor: "#ef4444",
          okay: "#f59e0b",
          good: "#3b82f6",
          excellent: "#10b981",
        },
      },
    },
  },
};
```

4. **Create Utility Functions:**

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Acceptance Criteria:**

- [x] Shadcn/ui installed and configured
- [x] All base components working
- [x] Custom colors applied
- [x] Typography system in place
- [x] Responsive design tested

---

### Task 1.1.5: Setup tRPC

**Priority:** High
**Estimated Time:** 3-4 hours
**Dependencies:** Task 1.1.2, Task 1.1.3

**Steps:**

1. **Create tRPC Context:**

```typescript
// src/server/trpc.ts
import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import superjson from "superjson";
import { prisma } from "@/lib/db/prisma";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    prisma,
    userId: null, // Will be populated by auth middleware
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
```

2. **Create Root Router:**

```typescript
// src/server/routers/_app.ts
import { createTRPCRouter } from "../trpc";
import { userRouter } from "./user";
import { cvRouter } from "./cv";
import { jobRouter } from "./job";
import { applicationRouter } from "./application";

export const appRouter = createTRPCRouter({
  user: userRouter,
  cv: cvRouter,
  job: jobRouter,
  application: applicationRouter,
});

export type AppRouter = typeof appRouter;
```

3. **Setup API Route:**

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

4. **Create Client:**

```typescript
// src/lib/api/client.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

export const trpc = createTRPCReact<AppRouter>();
```

5. **Provider Setup:**

```typescript
// src/app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from '@/lib/api/client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

**Acceptance Criteria:**

- [x] tRPC server configured
- [x] tRPC client configured
- [x] API routes working
- [x] Type safety verified
- [x] Error handling implemented

---

### Task 1.1.6: Authentication Setup (NextAuth.js)

**Priority:** High
**Estimated Time:** 4-5 hours
**Dependencies:** Task 1.1.3, Task 1.1.5

**Steps:**

1. **Install NextAuth v5:**

```bash
npm install next-auth@beta
npm install @auth/prisma-adapter
```

2. **Update Prisma Schema:**

```prisma
// Add to schema.prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Update User model
model User {
  // ... existing fields
  accounts      Account[]
  sessions      Session[]
}
```

3. **Run Migration:**

```bash
npx prisma migrate dev --name add_auth_models
```

4. **Configure NextAuth:**

```typescript
// src/lib/auth/auth.config.ts
import { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};
```

```typescript
// src/lib/auth/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
```

5. **API Route:**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;
```

6. **Session Provider:**

```typescript
// Update src/app/providers.tsx
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* ... tRPC providers */}
    </SessionProvider>
  )
}
```

7. **Environment Variables:**

```env
# .env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_ID=
GITHUB_SECRET=

EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@jobhuntai.com
```

**Acceptance Criteria:**

- [x] NextAuth configured with Prisma adapter
- [x] Google OAuth working
- [x] GitHub OAuth working
- [x] Email login working
- [x] Session management working
- [x] Protected routes working

---

## Phase 1.2: Master CV System (Week 3-4)

**Goal:** Complete Master CV builder and management system

### Task 1.2.1: Master CV Data Layer

**Priority:** Critical
**Estimated Time:** 4-5 hours
**Dependencies:** Task 1.1.3, Task 1.1.5

**tRPC Router:**

```typescript
// src/server/routers/cv.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cvRouter = createTRPCRouter({
  getMasterCV: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.masterCV.findUnique({
      where: { userId: ctx.userId },
      include: {
        experiences: {
          include: { bullets: true },
          orderBy: { order: "asc" },
        },
        projects: { orderBy: { order: "asc" } },
        education: true,
        certifications: true,
      },
    });
  }),

  createOrUpdateMasterCV: protectedProcedure
    .input(
      z.object({
        fullName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        location: z.string(),
        linkedIn: z.string().url().optional(),
        github: z.string().url().optional(),
        portfolio: z.string().url().optional(),
        summary: z.string(),
        skills: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.masterCV.upsert({
        where: { userId: ctx.userId },
        create: { ...input, userId: ctx.userId },
        update: input,
      });
    }),

  addExperience: protectedProcedure
    .input(
      z.object({
        company: z.string(),
        role: z.string(),
        location: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        current: z.boolean().default(false),
        bullets: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bullets, ...experienceData } = input;

      const masterCV = await ctx.prisma.masterCV.findUniqueOrThrow({
        where: { userId: ctx.userId },
      });

      return ctx.prisma.experience.create({
        data: {
          ...experienceData,
          masterCVId: masterCV.id,
          bullets: {
            create: bullets.map((content, index) => ({
              content,
              order: index,
            })),
          },
        },
        include: { bullets: true },
      });
    }),

  updateExperience: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        company: z.string().optional(),
        role: z.string().optional(),
        location: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        current: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.experience.update({
        where: { id },
        data,
        include: { bullets: true },
      });
    }),

  deleteExperience: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.experience.delete({
        where: { id: input.id },
      });
    }),

  // Similar endpoints for projects, education, certifications...
});
```

**Validation Schemas:**

```typescript
// src/lib/validations/cv.ts
import { z } from "zod";

export const contactInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  linkedIn: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
});

export const experienceSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role is required"),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  current: z.boolean().default(false),
  bullets: z
    .array(z.string().min(10, "Bullet must be at least 10 characters"))
    .min(1, "Add at least one achievement"),
});

export const summarySchema = z.object({
  summary: z
    .string()
    .min(50, "Summary must be at least 50 characters")
    .max(500, "Summary must be less than 500 characters"),
  skills: z.array(z.string()).min(5, "Add at least 5 skills"),
});
```

**Acceptance Criteria:**

- [x] All CRUD operations for MasterCV
- [x] Experience management endpoints
- [x] Project management endpoints
- [x] Input validation with Zod
- [x] Error handling
- [x] Type safety verified

---

### Task 1.2.2: Master CV Builder UI - Onboarding Flow

**Priority:** Critical
**Estimated Time:** 8-10 hours
**Dependencies:** Task 1.2.1

**Steps:**

1. **Create Multi-Step Form Component:**

```typescript
// src/components/features/onboarding/OnboardingWizard.tsx
'use client'
import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { ContactInfoStep } from './steps/ContactInfoStep'
import { SummaryStep } from './steps/SummaryStep'
import { ExperienceStep } from './steps/ExperienceStep'
import { ProjectsStep } from './steps/ProjectsStep'
import { StylePreferencesStep } from './steps/StylePreferencesStep'

const STEPS = [
  { id: 1, title: 'Contact Info', component: ContactInfoStep },
  { id: 2, title: 'Professional Summary', component: SummaryStep },
  { id: 3, title: 'Work Experience', component: ExperienceStep },
  { id: 4, title: 'Projects & Skills', component: ProjectsStep },
  { id: 5, title: 'Style Preferences', component: StylePreferencesStep },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})

  const progress = (currentStep / STEPS.length) * 100
  const CurrentStepComponent = STEPS[currentStep - 1].component

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = () => {
    // Save master CV and redirect to dashboard
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Build Your Master CV</h1>
        <p className="text-muted-foreground">
          This takes about 10 minutes. We'll use this to create tailored CVs for each job.
        </p>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
        </p>
      </div>

      <CurrentStepComponent
        onNext={handleNext}
        onBack={handleBack}
        initialData={formData}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === STEPS.length}
      />
    </div>
  )
}
```

2. **Step 1: Contact Info**

```typescript
// src/components/features/onboarding/steps/ContactInfoStep.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactInfoSchema } from '@/lib/validations/cv'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ContactInfoStep({ onNext, initialData }) {
  const form = useForm({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: initialData,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Rafael Murad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="rafael@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="São Paulo, Brazil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linkedIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="github"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Next Step</Button>
        </div>
      </form>
    </Form>
  )
}
```

3. **Step 3: Experience (Most Complex)**

```typescript
// src/components/features/onboarding/steps/ExperienceStep.tsx
'use client'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ExperienceStep({ onNext, onBack, initialData }) {
  const [experiences, setExperiences] = useState(initialData.experiences || [])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addExperience = (data) => {
    setExperiences([...experiences, data])
    setEditingIndex(null)
  }

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Work Experience</h2>
        <p className="text-muted-foreground">
          Add your work history. For each role, include 5-10 bullet points highlighting your achievements.
        </p>
      </div>

      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{exp.role}</h3>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </p>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.slice(0, 2).map((bullet, i) => (
                    <li key={i} className="text-sm">• {bullet}</li>
                  ))}
                  {exp.bullets.length > 2 && (
                    <li className="text-sm text-muted-foreground">
                      +{exp.bullets.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editingIndex === null ? (
        <Button
          variant="outline"
          onClick={() => setEditingIndex(experiences.length)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      ) : (
        <ExperienceForm
          onSubmit={addExperience}
          onCancel={() => setEditingIndex(null)}
        />
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => onNext({ experiences })}
          disabled={experiences.length === 0}
        >
          Next Step
        </Button>
      </div>
    </div>
  )
}

function ExperienceForm({ onSubmit, onCancel }) {
  // Similar form structure as ContactInfoStep
  // Include fields for company, role, dates, bullets (with dynamic array)
  return (
    <Card className="p-6">
      {/* Form implementation */}
    </Card>
  )
}
```

**Acceptance Criteria:**

- [x] 5-step onboarding wizard
- [x] Form validation on each step
- [x] Progress indicator
- [x] Can navigate back/forward
- [x] Data persists between steps
- [x] Auto-save draft (localStorage)
- [x] Responsive design
- [x] AI suggestions for bullets (optional)

---

### Task 1.2.3: Master CV Edit Page

**Priority:** Medium
**Estimated Time:** 4-5 hours
**Dependencies:** Task 1.2.2

**Dashboard-style editor:**

```typescript
// src/app/cv/edit/page.tsx
'use client'
import { trpc } from '@/lib/api/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContactSection } from '@/components/features/cv/sections/ContactSection'
import { SummarySection } from '@/components/features/cv/sections/SummarySection'
import { ExperienceSection } from '@/components/features/cv/sections/ExperienceSection'
import { ProjectsSection } from '@/components/features/cv/sections/ProjectsSection'

export default function EditMasterCV() {
  const { data: masterCV, isLoading } = trpc.cv.getMasterCV.useQuery()

  if (isLoading) return <div>Loading...</div>
  if (!masterCV) return <div>No CV found</div>

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Master CV</h1>
        <p className="text-muted-foreground">
          Keep this up to date. We'll use it to generate tailored CVs.
        </p>
      </div>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <ContactSection data={masterCV} />
        </TabsContent>

        <TabsContent value="summary">
          <SummarySection data={masterCV} />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceSection experiences={masterCV.experiences} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsSection projects={masterCV.projects} />
        </TabsContent>

        <TabsContent value="education">
          {/* Education section */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Acceptance Criteria:**

- [x] Tabbed interface for sections
- [x] Inline editing
- [x] Real-time updates
- [x] Add/remove items
- [x] Reorder items (drag & drop)
- [x] Preview mode

---

## Phase 1.3: Job Analysis (Week 5-6)

**Goal:** Claude API integration for job analysis

### Task 1.3.1: Claude API Integration

**Priority:** Critical
**Estimated Time:** 4-5 hours
**Dependencies:** Task 1.1.2

**Steps:**

1. **Install Anthropic SDK:**

```bash
npm install @anthropic-ai/sdk
```

2. **Create Claude Client:**

```typescript
// src/lib/ai/claude.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function analyzeJobDescription(
  jobDescription: string,
  masterCV: any
): Promise<JobAnalysisResult> {
  const prompt = `You are a job application expert. Analyze this job description and compare it to the candidate's CV.

Job Description:
${jobDescription}

Candidate CV:
Name: ${masterCV.fullName}
Summary: ${masterCV.summary}
Skills: ${masterCV.skills.join(", ")}
Experience:
${masterCV.experiences
  .map(
    (exp: any) => `
  ${exp.role} at ${exp.company}
  ${exp.bullets.map((b: any) => `- ${b.content}`).join("\n")}
`
  )
  .join("\n")}

Provide a JSON response with:
1. company: Company name (string)
2. role: Job title (string)
3. location: Job location (string or null)
4. remote: Is this remote? (boolean)
5. matchScore: 1-10 score (number)
6. requirements: Top 5 requirements (array of strings)
7. skillsMatch: Skills the candidate has that match (array of strings)
8. gaps: Skills the candidate lacks (array of strings)
9. redFlags: Any concerns (timezone, visa, etc.) (array of strings)
10. recommendedStyle: 'modern' | 'minimalist' | 'professional'
11. coverLetterHook: Opening paragraph for cover letter (string)
12. keyPoints: 3-5 points to emphasize in CV (array of strings)

Be honest about gaps but focus on strengths. Match score should be realistic.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  // Parse JSON response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Claude response");
  }

  return JSON.parse(jsonMatch[0]);
}

export interface JobAnalysisResult {
  company: string;
  role: string;
  location: string | null;
  remote: boolean;
  matchScore: number;
  requirements: string[];
  skillsMatch: string[];
  gaps: string[];
  redFlags: string[];
  recommendedStyle: "modern" | "minimalist" | "professional";
  coverLetterHook: string;
  keyPoints: string[];
}
```

3. **Create tRPC Endpoint:**

```typescript
// src/server/routers/job.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { analyzeJobDescription } from "@/lib/ai/claude";

export const jobRouter = createTRPCRouter({
  analyze: protectedProcedure
    .input(
      z.object({
        jobDescription: z.string().min(100, "Job description is too short"),
        jobUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's master CV
      const masterCV = await ctx.prisma.masterCV.findUniqueOrThrow({
        where: { userId: ctx.userId },
        include: {
          experiences: { include: { bullets: true } },
          projects: true,
        },
      });

      // Analyze with Claude
      const analysis = await analyzeJobDescription(input.jobDescription, masterCV);

      // Save to database
      return ctx.prisma.jobAnalysis.create({
        data: {
          userId: ctx.userId,
          jobDescription: input.jobDescription,
          jobUrl: input.jobUrl,
          company: analysis.company,
          role: analysis.role,
          location: analysis.location,
          remote: analysis.remote,
          matchScore: analysis.matchScore,
          requirements: analysis.requirements,
          skillsMatch: analysis.skillsMatch,
          gaps: analysis.gaps,
          redFlags: analysis.redFlags,
          recommendedStyle: analysis.recommendedStyle,
          coverLetterHook: analysis.coverLetterHook,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.jobAnalysis.findMany({
      where: { userId: ctx.userId },
      orderBy: { analyzedAt: "desc" },
      take: 20,
    });
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.jobAnalysis.findUniqueOrThrow({
      where: { id: input.id, userId: ctx.userId },
    });
  }),
});
```

**Environment Variables:**

```env
ANTHROPIC_API_KEY=your-api-key
```

**Acceptance Criteria:**

- [x] Claude API client configured
- [x] Job analysis prompt optimized
- [x] JSON parsing robust
- [x] Error handling for API failures
- [x] Rate limiting handled
- [x] Results saved to database

---

### Task 1.3.2: Job Analysis UI

**Priority:** Critical
**Estimated Time:** 6-8 hours
**Dependencies:** Task 1.3.1

**Main Analysis Page:**

```typescript
// src/app/jobs/analyze/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/api/client'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { AnalysisResults } from '@/components/features/jobs/AnalysisResults'

export default function AnalyzeJobPage() {
  const [jobInput, setJobInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const analyzeMutation = trpc.job.analyze.useMutation({
    onSuccess: (data) => {
      router.push(`/jobs/${data.id}`)
    },
  })

  const handleAnalyze = async () => {
    if (jobInput.length < 100) {
      alert('Please paste a longer job description')
      return
    }

    setIsAnalyzing(true)
    try {
      // Extract URL if present
      const urlMatch = jobInput.match(/https?:\/\/[^\s]+/)

      await analyzeMutation.mutateAsync({
        jobDescription: jobInput,
        jobUrl: urlMatch?.[0],
      })
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze job. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analyze Job</h1>
        <p className="text-muted-foreground">
          Paste the job description below. Include the URL if you have it.
        </p>
      </div>

      <Card className="p-6">
        <Textarea
          placeholder="Paste job description here..."
          value={jobInput}
          onChange={(e) => setJobInput(e.target.value)}
          rows={15}
          className="mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {jobInput.length} characters
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || jobInput.length < 100}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze with AI'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

**Analysis Results Component:**

```typescript
// src/components/features/jobs/AnalysisResults.tsx
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'

interface AnalysisResultsProps {
  analysis: {
    company: string
    role: string
    matchScore: number
    requirements: string[]
    skillsMatch: string[]
    gaps: string[]
    redFlags: string[]
    recommendedStyle: string
    keyPoints: string[]
  }
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const matchColor =
    analysis.matchScore >= 9 ? 'bg-match-excellent' :
    analysis.matchScore >= 7 ? 'bg-match-good' :
    analysis.matchScore >= 4 ? 'bg-match-okay' :
    'bg-match-poor'

  return (
    <div className="space-y-6">
      {/* Match Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{analysis.company}</h2>
            <p className="text-lg text-muted-foreground">{analysis.role}</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${matchColor} bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center`}>
              {analysis.matchScore}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Match Score</p>
          </div>
        </div>
      </Card>

      {/* Key Requirements */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Top Requirements
        </h3>
        <ul className="space-y-2">
          {analysis.requirements.map((req, i) => (
            <li key={i} className="flex items-start">
              <span className="text-brand-primary mr-2">•</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Skills Match */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
          Your Matching Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.skillsMatch.map((skill, i) => (
            <Badge key={i} variant="secondary" className="bg-green-100">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Gaps */}
      {analysis.gaps.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
            Skills to Address
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.gaps.map((gap, i) => (
              <Badge key={i} variant="secondary" className="bg-amber-100">
                {gap}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Be honest about these in your cover letter, but emphasize your ability to learn quickly.
          </p>
        </Card>
      )}

      {/* Red Flags */}
      {analysis.redFlags.length > 0 && (
        <Card className="p-6 border-red-200">
          <h3 className="font-semibold mb-4 flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Potential Concerns
          </h3>
          <ul className="space-y-2">
            {analysis.redFlags.map((flag, i) => (
              <li key={i} className="text-red-600">• {flag}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button size="lg" className="flex-1">
          Tailor CV & Apply
        </Button>
        <Button variant="outline" size="lg">
          Save for Later
        </Button>
        <Button variant="ghost" size="lg">
          Pass
        </Button>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**

- [x] Job description input (textarea)
- [x] URL extraction from paste
- [x] Loading state during analysis
- [x] Beautiful results display
- [x] Match score visualization
- [x] Requirements breakdown
- [x] Skills match/gaps shown
- [x] Red flags highlighted
- [x] Action buttons (Apply, Save, Pass)

---

## Phase 1.4: CV Generation & Application Tracking (Week 7-8)

**Goal:** Complete the application flow

### Task 1.4.1: CV Tailoring Logic

**Priority:** Critical
**Estimated Time:** 8-10 hours
**Dependencies:** Task 1.3.1

This is a large task involving Claude API prompting for CV tailoring. See original spec for detailed requirements.

**Key Components:**

- Bullet rewriting based on job requirements
- Skills reordering
- Summary customization
- Project selection

---

### Task 1.4.2: PDF Generation

**Priority:** Critical
**Estimated Time:** 6-8 hours
**Dependencies:** Task 1.4.1

**Options:**

1. **@react-pdf/renderer** - React-based PDF generation
2. **Puppeteer** - HTML to PDF (heavier)
3. **pdfkit** - Node.js PDF generation

**Recommended: @react-pdf/renderer**

**Create CV Templates:**

```typescript
// src/lib/pdf/templates/ModernCV.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  // ... more styles
})

export function ModernCV({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName}</Text>
          <Text>{data.email} | {data.phone}</Text>
          <Text>{data.location}</Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.text}>{data.summary}</Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experiences.map((exp, i) => (
            <View key={i} style={styles.experience}>
              <Text style={styles.jobTitle}>{exp.role}</Text>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.dates}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </Text>
              {exp.bullets.map((bullet, j) => (
                <Text key={j} style={styles.bullet}>• {bullet}</Text>
              ))}
            </View>
          ))}
        </View>

        {/* Skills, Projects, Education... */}
      </Page>
    </Document>
  )
}
```

---

### Task 1.4.3: Application Tracking System

**Priority:** Critical
**Estimated Time:** 6-8 hours
**Dependencies:** Task 1.4.2

**Natural Language Processing:**

```typescript
// src/lib/ai/context-extraction.ts
export async function extractApplicationContext(
  message: string,
  recentAnalyses: JobAnalysis[]
): Promise<ApplicationContext | null> {
  const lowerMessage = message.toLowerCase();

  // Check if user indicated they applied
  const appliedKeywords = [
    "i applied",
    "i've applied",
    "just applied",
    "applied to",
    "submitted application",
    "sent my application",
  ];

  const isApplication = appliedKeywords.some((kw) => lowerMessage.includes(kw));
  if (!isApplication) return null;

  // Use most recent analysis if no specific company mentioned
  let targetAnalysis = recentAnalyses[0];

  // Check if user mentioned specific company
  for (const analysis of recentAnalyses) {
    if (lowerMessage.includes(analysis.company.toLowerCase())) {
      targetAnalysis = analysis;
      break;
    }
  }

  return {
    jobAnalysisId: targetAnalysis.id,
    confidence: targetAnalysis === recentAnalyses[0] ? 0.9 : 1.0,
    needsConfirmation: recentAnalyses.length > 3,
  };
}
```

**tRPC Endpoint:**

```typescript
// src/server/routers/application.ts
export const applicationRouter = createTRPCRouter({
  track: protectedProcedure
    .input(
      z.object({
        message: z.string().optional(),
        jobAnalysisId: z.string().optional(),
        appliedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let jobAnalysisId = input.jobAnalysisId;

      // If no ID provided, extract from message
      if (!jobAnalysisId && input.message) {
        const recentAnalyses = await ctx.prisma.jobAnalysis.findMany({
          where: { userId: ctx.userId },
          orderBy: { analyzedAt: "desc" },
          take: 5,
        });

        const context = await extractApplicationContext(input.message, recentAnalyses);

        if (!context) {
          throw new Error("Could not determine which job you applied to");
        }

        jobAnalysisId = context.jobAnalysisId;
      }

      if (!jobAnalysisId) {
        throw new Error("Job analysis ID required");
      }

      // Get job analysis and tailored CV
      const jobAnalysis = await ctx.prisma.jobAnalysis.findUniqueOrThrow({
        where: { id: jobAnalysisId },
      });

      const tailoredCV = await ctx.prisma.tailoredCV.findFirst({
        where: { jobAnalysisId },
      });

      if (!tailoredCV) {
        throw new Error("No CV generated for this job");
      }

      // Create application
      return ctx.prisma.application.create({
        data: {
          userId: ctx.userId,
          jobAnalysisId,
          tailoredCVId: tailoredCV.id,
          company: jobAnalysis.company,
          role: jobAnalysis.role,
          jobUrl: jobAnalysis.jobUrl,
          appliedAt: input.appliedAt || new Date(),
          followUpDate: addDays(new Date(), 7),
          matchScore: jobAnalysis.matchScore,
          cvStyle: tailoredCV.style,
          cvFileUrl: tailoredCV.pdfUrl,
          coverLetterUrl: tailoredCV.coverLetterFileName || "",
          folderPath: `users/${ctx.userId}/applications/${jobAnalysis.company}-${format(new Date(), "MMMyyyy")}`,
          status: "APPLIED",
        },
      });
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["APPLIED", "SCREENING", "TECHNICAL", "FINAL", "OFFER", "REJECTED", "GHOSTED"])
          .optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.userId,
        ...(input.status && { status: input.status }),
      };

      const [applications, total] = await Promise.all([
        ctx.prisma.application.findMany({
          where,
          orderBy: { appliedAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.application.count({ where }),
      ]);

      return {
        applications,
        total,
        page: input.page,
        pages: Math.ceil(total / input.limit),
      };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "APPLIED",
          "SCREENING",
          "TECHNICAL",
          "FINAL",
          "OFFER",
          "REJECTED",
          "GHOSTED",
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, notes } = input;

      // Get current application
      const app = await ctx.prisma.application.findUniqueOrThrow({
        where: { id, userId: ctx.userId },
      });

      // Update application and create status update
      const [updatedApp] = await ctx.prisma.$transaction([
        ctx.prisma.application.update({
          where: { id },
          data: { status },
        }),
        ctx.prisma.statusUpdate.create({
          data: {
            applicationId: id,
            oldStatus: app.status,
            newStatus: status,
            notes,
          },
        }),
      ]);

      return updatedApp;
    }),
});
```

---

### Task 1.4.4: Dashboard UI

**Priority:** Critical
**Estimated Time:** 8-10 hours
**Dependencies:** Task 1.4.3

**Main Dashboard:**

```typescript
// src/app/dashboard/page.tsx
'use client'
import { trpc } from '@/lib/api/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanbanView } from '@/components/features/dashboard/KanbanView'
import { TableView } from '@/components/features/dashboard/TableView'
import { StatsCards } from '@/components/features/dashboard/StatsCards'

export default function Dashboard() {
  const { data: dashboardData } = trpc.dashboard.get.useQuery()
  const { data: applications } = trpc.application.getAll.useQuery({})

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Application Dashboard</h1>

        <StatsCards stats={dashboardData?.stats} />

        <Tabs defaultValue="kanban" className="mt-8">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanView applications={applications?.applications || []} />
          </TabsContent>

          <TabsContent value="table">
            <TableView applications={applications?.applications || []} />
          </TabsContent>

          <TabsContent value="calendar">
            {/* Calendar view */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
```

**Kanban Board:**

```typescript
// src/components/features/dashboard/KanbanView.tsx
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'bg-gray-200' },
  { id: 'SCREENING', title: 'Screening', color: 'bg-blue-200' },
  { id: 'TECHNICAL', title: 'Technical', color: 'bg-purple-200' },
  { id: 'FINAL', title: 'Final Round', color: 'bg-amber-200' },
  { id: 'OFFER', title: 'Offer', color: 'bg-green-200' },
]

export function KanbanView({ applications }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {COLUMNS.map((column) => {
        const columnApps = applications.filter(
          (app) => app.status === column.id
        )

        return (
          <div key={column.id} className="space-y-3">
            <div className={`${column.color} rounded-lg p-3`}>
              <h3 className="font-semibold">{column.title}</h3>
              <p className="text-sm text-muted-foreground">
                {columnApps.length} {columnApps.length === 1 ? 'app' : 'apps'}
              </p>
            </div>

            <div className="space-y-2">
              {columnApps.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ApplicationCard({ application }) {
  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
      <h4 className="font-semibold">{application.company}</h4>
      <p className="text-sm text-muted-foreground">{application.role}</p>
      <div className="mt-2 flex items-center justify-between">
        <Badge variant={getMatchBadgeVariant(application.matchScore)}>
          {application.matchScore}/10
        </Badge>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
        </p>
      </div>
    </Card>
  )
}
```

---

## Phase 1.5: Polish & Deploy (Week 8)

### Task 1.5.1: Error Handling & Loading States

- Implement error boundaries
- Add skeleton loaders
- Handle API failures gracefully
- Toast notifications for actions

### Task 1.5.2: Responsive Design

- Mobile-first approach
- Test on various screen sizes
- Touch-friendly interactions
- Mobile navigation

### Task 1.5.3: Environment Setup

- Staging environment (Vercel)
- Database (Neon/Supabase)
- S3/R2 for file storage
- Environment variables

### Task 1.5.4: Testing

- Unit tests for critical functions
- Integration tests for API
- E2E tests for key flows
- Manual QA checklist

### Task 1.5.5: Documentation

- README with setup instructions
- API documentation
- User guide
- Contribution guidelines

### Task 1.5.6: Deployment

- Deploy to Vercel
- Configure domain
- Set up monitoring (Sentry)
- Analytics (PostHog/Mixpanel)

---

## Success Criteria for MVP

**Technical:**

- [x] All features from Phase 1 working
- [x] <2s page load times
- [x] <5s job analysis
- [x] <10s CV generation
- [x] No critical bugs
- [x] Mobile responsive

**User Experience:**

- [x] Can complete onboarding in <10 minutes
- [x] Can analyze job in <1 minute
- [x] Can generate tailored CV in <2 minutes
- [x] Can track application with natural language
- [x] Dashboard shows clear pipeline view

**Business:**

- [x] Beta users can sign up
- [x] Payment integration (Stripe) ready
- [x] Analytics tracking events
- [x] User feedback mechanism

---

## Risk Management

**High-Risk Items:**

1. **Claude API Quality**
   - Risk: Poor analysis/tailoring
   - Mitigation: Extensive prompt engineering, fallback to GPT-4

2. **PDF Generation**
   - Risk: Formatting issues
   - Mitigation: Multiple template testing, manual override option

3. **Natural Language Context**
   - Risk: Wrong job tracked
   - Mitigation: Confirmation step, recent job list

4. **Performance**
   - Risk: Slow CV generation
   - Mitigation: Background jobs, caching, optimization

---

## Next Steps After MVP

**Phase 2 Features (Weeks 9-16):**

- Email notifications
- Calendar integration
- Advanced analytics
- Interview preparation
- Cover letter improvements
- Chrome extension (autofill)

**Phase 3 Features (Weeks 17-24):**

- Team accounts
- API for integrations
- Mobile app
- AI interview coach
- Network analysis

---

## Development Environment Setup

**Required:**

- Node.js 20+
- PostgreSQL 16
- Claude API key
- Git

**Optional:**

- Docker (for local PostgreSQL)
- Vercel CLI
- Postman/Insomnia (API testing)

**Commands:**

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

---

## Estimated Timeline Summary

| Phase             | Duration       | Deliverable                     |
| ----------------- | -------------- | ------------------------------- |
| 1.1 Foundation    | 1-2 weeks      | Project setup, auth, database   |
| 1.2 Master CV     | 1-2 weeks      | CV builder and editor           |
| 1.3 Job Analysis  | 1-2 weeks      | Claude integration, analysis UI |
| 1.4 CV Generation | 2-3 weeks      | Tailoring, PDF, tracking        |
| 1.5 Polish        | 1 week         | Testing, deployment             |
| **Total**         | **6-10 weeks** | **Working MVP**                 |

**Part-time (20h/week):** 10 weeks
**Full-time (40h/week):** 6-7 weeks

---

## Budget Considerations

**Development Costs:**

- $0 (self-developed)

**Monthly Infrastructure:**

- Vercel: $20/month (Pro)
- Neon/Supabase: $25/month (Pro)
- Cloudflare R2: ~$5/month (storage)
- Anthropic API: ~$50-100/month (usage-based)
- Resend: $20/month (email)
- **Total: ~$120-150/month**

**Annual:**

- Domain: $15/year
- Infrastructure: $1,800/year
- **Total: ~$1,815/year**

---

## Conclusion

This implementation plan provides a complete, step-by-step guide to building Job Hunt AI MVP. Each task includes technical details, acceptance criteria, and dependencies.

**Start with Phase 1.1 (Foundation) and work sequentially.**

Good luck! 🚀

---

**Document Version:** 1.0
**Created:** November 17, 2025
**Author:** Claude (Sonnet 4.5)
