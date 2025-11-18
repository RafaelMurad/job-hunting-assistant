# Next.js 16 Patterns I'm Using

**Read time: 4 min**

---

## Server Components vs Client Components

**Server Components:**

- Run on server only
- Can directly query database
- No JavaScript sent to browser
- Example: Profile page showing data

**Client Components:**

- Run in browser
- Can use React hooks (useState, useEffect)
- Interactive (forms, buttons)
- Example: Analyze page with job description form

**Rule of thumb:**

- Default to Server Components
- Add `'use client'` only when you need interactivity

I'm still wrapping my head around this. The mental model differs from traditional React.

---

## API Route Pattern

```typescript
// app/api/analyze/route.ts
export async function POST(request: NextRequest) {
  const { jobDescription, userId } = await request.json();

  // Get user from DB
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Call AI
  const analysis = await analyzeJob(jobDescription, userCV);

  return NextResponse.json(analysis);
}
```

**Why this works:**

- Standard REST pattern
- Easy to test with curl/Postman
- Client code just does `fetch('/api/analyze', {...})`

**Future:** Might try Server Actions for mutations (simpler than API routes?)

---

## File Structure

```
app/
├── api/              # REST endpoints
├── analyze/          # Job analysis page
├── tracker/          # Application tracker
├── layout.tsx        # Root layout (nav)
└── page.tsx          # Home (profile)

lib/
├── ai.ts             # Multi-provider AI
├── db.ts             # Prisma client
└── utils.ts          # Helpers
```

**Pattern:** Keep business logic in `lib/`, UI in `app/`.
