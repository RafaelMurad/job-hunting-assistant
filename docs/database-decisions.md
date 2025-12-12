# Database - Prisma & PostgreSQL (and the earlier SQLite → Postgres path)

**Read time: 3 min**

---

## Why Prisma?

**Type-safe queries:**

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
});
// ↑ Autocomplete in VS Code, catches typos at compile time
```

**vs raw SQL:**

```sql
SELECT * FROM User WHERE id = ?
-- ↑ No type safety, runtime errors
```

**Other benefits:**

- Automatic migrations
- Works well with PostgreSQL (locally and in production)
- Schema in one file (`prisma/schema.prisma`)

**Trade-off:** Prisma is easier but adds abstraction. For complex queries, sometimes raw SQL is clearer.

---

## PostgreSQL Today (v1.1)

**Current: PostgreSQL**

- The Prisma datasource is configured for PostgreSQL (see `prisma/schema.prisma`).
- Recommended: Neon (connection pooling for serverless + direct URL for migrations).

## Historical Context: SQLite → PostgreSQL

**Earlier: SQLite**

- Zero setup (single file: `prisma/dev.db`)
- Perfect for local development
- Git-ignored (in `.gitignore`)

**Now: PostgreSQL**

- Better for production (multi-user, concurrent writes)
- Required for Vercel deployment
- Migration: Just change connection string in `.env`

**Lesson:** Start simple when you can, but align early with production constraints (serverless + multi-user = PostgreSQL).

---

## Schema Design

```prisma
model User {
  id         String   @id @default(cuid())
  name       String
  email      String   @unique
  applications Application[]
}

model Application {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(...)
  company        String
  role           String
  status         String

  @@index([userId, status])
  @@index([userId, createdAt])
}
```

**Why indexes?**

- `[userId, status]` - Fast filtering by status ("show me applied jobs")
- `[userId, createdAt]` - Fast sorting by date

**Lesson:** Add indexes for common queries.
