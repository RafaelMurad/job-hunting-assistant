# Project Bootstrap Guide

Quick-start guide for spinning up new projects.

## Quick Start (5 Minutes)

### 1. Create Next.js Project

```bash
npx create-next-app@latest my-project --typescript --tailwind --eslint --app --src-dir=false
cd my-project
```

### 2. Install Core Dependencies

```bash
# Database & ORM
npm install prisma @prisma/client
npx prisma init

# UI & Styling
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Validation
npm install zod

# Authentication (choose one)
npm install next-auth@beta  # Auth.js
# OR
npm install @clerk/nextjs   # Clerk (easier)
```

### 3. Copy Starter Kit Files

Copy these directories from the starter kit:

```
lib/
├── feature-flags/     # Feature flag system
├── utils/             # Utility functions (cn, etc.)
└── prisma.ts          # Prisma client singleton

components/
├── ui/                # Base UI components
└── layout/            # Layout components
```

### 4. Configure Tailwind

Add Nordic design tokens to `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nordic Palette
        fjord: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36aaf5",
          500: "#0c8ee6",
          600: "#0070c4",
          700: "#01599f",
          800: "#064c83",
          900: "#0b406d",
          950: "#082849",
        },
        forest: {
          50: "#f0fdf5",
          100: "#dcfce8",
          200: "#bbf7d1",
          300: "#86efad",
          400: "#4ade7f",
          500: "#22c55d",
          600: "#16a349",
          700: "#15803c",
          800: "#166533",
          900: "#14532b",
          950: "#052e14",
        },
        clay: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5. Set Up Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 6. Create Environment File

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 7. Initialize Database

```bash
npx prisma db push
npx prisma generate
```

### 8. Run Development Server

```bash
npm run dev
```

## Project Structure Setup

Create these directories:

```bash
mkdir -p lib/features
mkdir -p lib/feature-flags
mkdir -p lib/utils
mkdir -p components/ui
mkdir -p components/layout
mkdir -p app/api
mkdir -p app/\(auth\)
mkdir -p app/\(dashboard\)
```

## Essential Files

### lib/utils/cn.ts

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### lib/prisma.ts

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "My App",
  description: "Built with the Freelance Starter Kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
```

## Optional Additions

### Add Mobile App (React Native)

```bash
# From project root
npx create-expo-app mobile --template tabs
cd mobile
npm install
```

See `docs/starter-kit/architecture/MOBILE.md` for monorepo setup.

### Add Background Jobs

```bash
npm install bullmq ioredis
```

See feature branch: `feat-background-jobs`

### Add Real-Time Features

See feature branch: `feat-real-time-notifications`

### Add Analytics

```bash
npm install recharts date-fns
```

See feature branch: `feat-analytics-dashboard`

## Deployment Checklist

Before deploying, ensure:

1. [ ] Environment variables configured
2. [ ] Database migrated (`prisma migrate deploy`)
3. [ ] Build passes (`npm run build`)
4. [ ] Tests pass (`npm test`)

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **AWS Amplify**: `amplify init && amplify push`

## Next Steps

1. Review [Architecture Docs](./architecture/)
2. Set up [Feature Flags](./architecture/FEATURE_FLAGS.md)
3. Follow [Development Workflow](./workflows/DEVELOPMENT.md)
4. Use [Code Review Checklist](./checklists/CODE_REVIEW.md)

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
