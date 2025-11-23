# Tech Stack Decisions

Rationale behind every technology choice.

## Frontend

### Next.js 16 (App Router)

**Why:**
- Server Components reduce client JS
- File-based routing (intuitive)
- Built-in optimization (images, fonts)
- Excellent TypeScript support
- Vercel deployment is seamless

**Alternatives considered:**
- Remix: Great, but smaller ecosystem
- Vite + React Router: More manual setup
- Astro: Better for content sites

### TypeScript

**Why:**
- Catch errors at compile time
- Better IDE experience (autocomplete)
- Self-documenting code
- Refactoring confidence
- Industry standard

**Config philosophy:**
- Strict mode enabled
- `exactOptionalPropertyTypes: true`
- No `any` unless absolutely necessary

### Tailwind CSS v4

**Why:**
- Utility-first = fast prototyping
- No CSS file management
- Consistent design tokens
- Great with component libraries
- Small production bundle (purged)

**Patterns:**
- Design tokens in CSS variables
- Component variants with CVA
- Responsive-first approach

## Backend

### Prisma ORM

**Why:**
- Type-safe database queries
- Auto-generated types
- Visual Studio (Prisma Studio)
- Migration system
- Works with many databases

**Alternatives:**
- Drizzle: Lighter, but newer
- TypeORM: More traditional
- Raw SQL: More control, less safety

### PostgreSQL

**Why:**
- Battle-tested reliability
- JSON support for flexibility
- Full-text search built-in
- Scales well
- Free tiers available (Supabase, Neon)

## Testing

### Vitest

**Why:**
- Vite-native (fast)
- Jest-compatible API
- Built-in coverage
- Great DX with watch mode

**Strategy:**
- Unit tests for utilities
- Integration tests for API routes
- Component tests with Testing Library
- E2E with Playwright (when needed)

## Mobile

### Expo + React Native

**Why:**
- Share code with web (types, utils)
- OTA updates
- Managed workflow = less config
- Expo Router = familiar patterns

**When to eject:**
- Custom native modules needed
- Performance-critical apps
- Heavy native integrations

## Infrastructure

### Vercel

**Why:**
- Zero-config Next.js deployment
- Preview deployments per PR
- Edge functions
- Analytics built-in
- Generous free tier

**Alternatives:**
- AWS Amplify: More AWS integration
- Railway: Great for full-stack
- Render: Good for backends

### GitHub Actions

**Why:**
- Integrated with repo
- Large marketplace
- Free for public repos
- Matrix builds

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-01 | Next.js over Remix | Larger ecosystem, Vercel integration |
| 2024-01 | Tailwind over CSS Modules | Faster iteration, consistent tokens |
| 2024-01 | Prisma over Drizzle | More mature, better tooling |
| 2024-01 | Vitest over Jest | Faster, Vite ecosystem |
