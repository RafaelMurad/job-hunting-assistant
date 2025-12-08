# Testing Strategy

## Overview

This project uses a **Test Pyramid** approach with Unit and Integration tests implemented now, and E2E tests deferred until UI/UX stabilizes.

```
        /\
       /  \       E2E (Deferred)
      /----\      - Playwright (post-UI stabilization)
     /      \
    /--------\    Integration Tests
   /          \   - tRPC routers with mocked Prisma
  /------------\  - API routes
 /              \
/----------------\ Unit Tests
                   - Utilities, validation schemas, pure functions
```

## Test Structure

```
__tests__/
├── setup/
│   └── test-utils.tsx       # Custom render with providers
├── helpers/
│   └── prisma-mock.ts       # Prisma mocking utilities
├── unit/
│   ├── utils.test.ts        # lib/utils.ts tests
│   └── validations.test.ts  # lib/validations/* tests
├── integration/
│   └── user-router.test.ts  # tRPC router tests
└── example.test.tsx         # Component test example
```

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Interactive UI
npm run test:ui

# With coverage report
npm run test:coverage

# Open coverage in browser
npm run test:coverage:open

# CI mode (verbose output, GitHub Actions reporter)
npm run test:ci
```

## Writing Tests

### Unit Tests

Test pure functions and utilities without side effects.

```typescript
// __tests__/unit/example.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/utils";

describe("myFunction", () => {
  it("returns expected result", () => {
    expect(myFunction("input")).toBe("expected");
  });
});
```

### Integration Tests (tRPC Routers)

Test tRPC procedures with mocked Prisma client.

```typescript
// __tests__/integration/my-router.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";

// Create mock BEFORE importing router
const prismaMock = mockDeep<PrismaClient>();

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

import { myRouter } from "@/lib/trpc/routers/my-router";

const createCaller = () => {
  return myRouter.createCaller({ prisma: prismaMock });
};

describe("myRouter", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("fetches data correctly", async () => {
    prismaMock.model.findFirst.mockResolvedValue({ id: "1" });

    const caller = createCaller();
    const result = await caller.get();

    expect(result).toEqual({ id: "1" });
  });
});
```

### Component Tests

Use the custom render function with providers.

```typescript
// __tests__/components/my-component.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/setup/test-utils";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

## CI Pipeline

Tests run automatically on:

- Every push to `main`
- Every pull request to `main`

See `.github/workflows/test.yml` for configuration.

### Coverage Thresholds

The project enforces **80% coverage** for:

- Lines
- Functions
- Branches
- Statements

PRs that drop coverage below thresholds will fail CI.

## Mocking Patterns

### Prisma Mock

```typescript
import { prismaMock, resetPrismaMock } from "@/__tests__/helpers/prisma-mock";

beforeEach(() => resetPrismaMock());

it("test", async () => {
  prismaMock.user.findFirst.mockResolvedValue({ id: "1", name: "Test" });
  // ... test code
});
```

### External APIs

```typescript
vi.mock("@/lib/ai", () => ({
  parseCVWithGeminiVision: vi.fn().mockResolvedValue({ name: "John" }),
}));
```

### Next.js Router

Already mocked globally in `vitest.setup.ts`. Access mocks via:

```typescript
import { vi } from "vitest";
import { useRouter } from "next/navigation";

it("navigates on click", async () => {
  const push = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ push } as any);

  // ... test navigation
  expect(push).toHaveBeenCalledWith("/dashboard");
});
```

## Future: E2E Testing

E2E tests with Playwright will be added after UI/UX stabilizes. The plan:

1. Install Playwright: `npm install -D @playwright/test`
2. Create `playwright.config.ts`
3. Add `e2e/` folder with smoke tests
4. Create `.github/workflows/e2e.yml`

See the deferred E2E plan in the project roadmap.

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees/does
2. **Use `userEvent` over `fireEvent`** - More realistic user simulation
3. **Mock at module boundaries** - Mock external services, not internal functions
4. **Keep tests isolated** - Reset mocks in `beforeEach`
5. **Write descriptive test names** - `it("returns error when user not found")`
6. **Group related tests** - Use `describe` blocks logically

## Troubleshooting

### "Cannot find module" errors

Ensure path aliases are configured in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./"),
  },
},
```

### Mock not working

Ensure mocks are defined BEFORE importing the module under test:

```typescript
// ✅ Correct order
vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
import { myRouter } from "@/lib/trpc/routers/my-router";

// ❌ Wrong order
import { myRouter } from "@/lib/trpc/routers/my-router";
vi.mock("@/lib/db", () => ({ prisma: prismaMock })); // Too late!
```

### Coverage not generating

Run with coverage flag:

```bash
npm run test:coverage
```

Check `vitest.config.ts` excludes are not too broad.
