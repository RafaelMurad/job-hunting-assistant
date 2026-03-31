# Job Hunting Assistant

AI-powered job application tracker with CV editor, analysis tools, and multi-provider AI integration.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS 4.
tRPC v11, Prisma 6 (PostgreSQL via Neon), Neon Auth, Stripe.
`npm` for packages. Path alias: `@/*` → `./*` (project root, not `src/`).

## Development

```bash
npm run type-check      # must pass clean
npm run lint            # must pass clean (ESLint 9 flat config)
npm test                # vitest, 80% coverage threshold
npm run test:e2e        # playwright (chromium only)
npm run build           # verify before finishing
```

Non-obvious commands:
```bash
npm run db:migrate      # prisma migrate dev
npm run db:push         # prisma db push (no migration file)
npm run env:check       # validates required env vars
npm run validate        # lint + type-check + format:check + test
```

## Conventions

- tRPC routers in `lib/trpc/routers/`. Procedure types: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `ownerProcedure`, `aiProcedure`.
- Zod schemas for all inputs — validation in `lib/validations/`.
- AI providers abstracted in `lib/ai/` — supports Gemini, OpenAI, Claude via env config.
- Dual storage: server (Prisma/PostgreSQL) for authenticated users, local (Dexie/IndexedDB) for guests.
- shadcn/ui components in `components/ui/` (new-york style). Storybook stories co-located.
- Husky pre-commit: lint-staged (prettier + eslint + tsc). Pre-push on main: full validate + build.
