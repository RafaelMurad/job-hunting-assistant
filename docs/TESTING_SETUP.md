# Testing Strategy

## Overview

This project uses a **Testing Trophy** approach with comprehensive test coverage at all levels.

```
        /\          E2E Tests (25 tests)
       /  \         - Playwright with Chromium
      /----\        - User journey smoke tests
     /      \
    /--------\      Integration Tests (69 tests)
   /          \     - tRPC routers with mocked Prisma
  /------------\    - API route validation
 /              \
/----------------\  Unit Tests (210+ tests)
                    - Utilities, validation schemas, pure functions
                    - Component behavior
```

## Test Metrics

| Type        | Tests | Tool          | Coverage |
| ----------- | ----- | ------------- | -------- |
| Unit        | 210+  | Vitest        | 80%+     |
| Integration | 69    | Vitest + Mock | -        |
| E2E         | 25    | Playwright    | -        |
| Visual      | -     | Chromatic     | -        |
| **Total**   | 309+  | -             | 80%+     |

## Test Structure

```
__tests__/
├── setup/
│   └── test-utils.tsx       # Custom render with providers
├── helpers/
│   └── prisma-mock.ts       # Prisma mocking utilities
├── unit/
│   ├── utils.test.ts        # lib/utils.ts tests
│   ├── validations.test.ts  # lib/validations/* tests
│   ├── ai-config.test.ts    # AI provider config tests
│   └── ...                  # Other unit tests
├── integration/
│   ├── user-router.test.ts  # User tRPC router
│   ├── applications-router.test.ts  # Applications CRUD
│   ├── analyze-router.test.ts       # AI analysis
│   ├── admin-router.test.ts         # Admin authorization
│   └── ux-router.test.ts            # UX research entities
├── components/
│   ├── confirmation-dialog.test.tsx # Dialog component
│   ├── mobile-menu.test.tsx         # Mobile navigation
│   └── ui-components.test.tsx       # Input, Card, Badge
└── example.test.tsx         # Button component example

e2e/
├── landing.spec.ts          # Landing page tests
├── auth.spec.ts             # Authentication flows
├── dashboard.spec.ts        # Dashboard routes
├── profile.spec.ts          # Profile page
├── analyze.spec.ts          # Job analyzer
└── tracker.spec.ts          # Application tracker
```

## Running Tests

```bash
# Unit & Integration Tests (Vitest)
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:ui             # Interactive UI
npm run test:coverage       # With coverage report
npm run test:coverage:open  # Open coverage in browser
npm run test:ci             # CI mode (verbose)

# E2E Tests (Playwright)
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Interactive Playwright UI
npm run test:e2e:headed     # Run with visible browser
npm run test:e2e:debug      # Debug mode with inspector

# Full Validation
npm run validate            # lint + type-check + format + test
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

### E2E Tests (Playwright)

Test user journeys in a real browser.

```typescript
// e2e/my-page.spec.ts
import { expect, test } from "@playwright/test";

test.describe("My Page", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/my-page");
    await expect(page).toHaveURL("/my-page");
  });

  test("displays content", async ({ page }) => {
    await page.goto("/my-page");
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
```

## CI Pipeline

Tests run automatically on:

- Every push to `main`
- Every pull request to `main`

### Workflows

| Workflow         | Trigger  | Tests               |
| ---------------- | -------- | ------------------- |
| `test.yml`       | PR, push | Unit + Integration  |
| `playwright.yml` | PR, push | E2E with Playwright |
| `chromatic.yml`  | PR       | Visual regression   |
| `qodana.yml`     | PR       | Static analysis     |

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

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees/does
2. **Use `userEvent` over `fireEvent`** - More realistic user simulation
3. **Mock at module boundaries** - Mock external services, not internal functions
4. **Keep tests isolated** - Reset mocks in `beforeEach`
5. **Write descriptive test names** - `it("returns error when user not found")`
6. **Group related tests** - Use `describe` blocks logically
7. **Run validation before PR** - `npm run validate`

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

### E2E tests timing out

- Increase timeout in `playwright.config.ts`
- Use `await page.waitForLoadState("networkidle")`
- Check if dev server is running: `npm run dev`
