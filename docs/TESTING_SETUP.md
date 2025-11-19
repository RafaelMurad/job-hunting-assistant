# Testing Infrastructure - Industry Standards Implementation

## 🎯 What I Learned

### **Why These Testing Patterns Matter**

**1. Coverage Thresholds (80%+)**

- **What:** Enforces minimum test coverage across lines, functions, branches, and statements
- **Why:** Catches untested code paths before they become bugs in production
- **Trade-off:** Slows down initial development BUT prevents regressions and builds confidence
- **Industry standard:** Most professional codebases require 70-90% coverage

**2. Next.js Mocking (Router & Headers)**

- **What:** Pre-configured mocks for `next/navigation` and `next/headers` APIs
- **Why:** Next.js components use these extensively - tests fail without mocks
- **How:** Used Vitest's `vi.mock()` in `vitest.setup.ts` to stub router methods
- **Key learning:** Server Components need different mocking than Client Components

**3. Custom Test Utils (`test-utils.tsx`)**

- **What:** Centralized `render()` function that wraps components with providers
- **Why:** As the app grows, you'll need theme providers, router context, state management
- **Pattern:** Import from `@/__tests__/setup/test-utils` instead of `@testing-library/react`
- **Future:** When we add authentication, we'll update this file to wrap tests with auth context

**4. Co-located Tests + `__tests__` Folder**

- **What:** Tests can live next to source files OR in `__tests__/` folder
- **Why:** Flexibility - shared utilities in `__tests__/`, component tests co-located
- **Industry trend:** React Testing Library docs recommend co-location for components

**5. CI Coverage Reporting**

- **What:** GitHub Actions uploads coverage to Codecov and comments on PRs
- **Why:** Visual feedback on coverage changes directly in pull requests
- **Setup needed:** Sign up for Codecov (free for open source) and add `CODECOV_TOKEN` secret

## 📦 What Was Installed

```bash
@vitest/coverage-v8      # Coverage provider (industry standard)
vitest-mock-extended     # Advanced mocking utilities
@vitest/ui               # Interactive test UI (run with npm run test:ui)
```

## 🛠️ Configuration Files

### **vitest.config.ts** - Core Testing Setup

```typescript
// Key settings I added:
- coverage.provider: "v8"           // Fast coverage engine
- coverage.thresholds: 80%          // Enforce quality
- include: co-located tests         // Flexible test location
- exclude: .next, node_modules      // Ignore build artifacts
```

### **vitest.setup.ts** - Test Environment Initialization

```typescript
// What happens before each test:
1. Imports jest-dom matchers (toBeInTheDocument, toBeDisabled, etc.)
2. Mocks Next.js router (useRouter, usePathname, etc.)
3. Mocks Next.js headers (for Server Components)
4. Cleans up DOM after each test
```

### **package.json** - Test Scripts

```bash
npm test              # Run all tests once (CI mode)
npm run test:watch    # Watch mode - reruns on file changes
npm run test:ui       # Interactive browser UI
npm run test:coverage # Generate coverage report
npm run test:coverage:open # Open coverage HTML in browser
npm run test:ci       # CI-optimized (verbose, GitHub Actions reporter)
```

## ✅ What Changed from Original Setup

| Before                 | After                          | Why                                 |
| ---------------------- | ------------------------------ | ----------------------------------- |
| No coverage thresholds | 80% required                   | Industry standard for quality       |
| No Next.js mocks       | Router + headers mocked        | Tests would fail on real components |
| Basic test patterns    | Custom test utils              | Scales as app grows                 |
| Simple CI              | Coverage reports + PR comments | Better feedback loop                |
| No coverage provider   | v8 provider installed          | Coverage command would fail         |

## 🧪 Example Test Improvements

**Before:**

```tsx
it("renders button", () => {
  render(<Button>Click</Button>);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

**After (Industry Standard):**

```tsx
it("handles click events", async () => {
  const user = userEvent.setup(); // Modern user interaction API
  const handleClick = vi.fn(); // Mock function
  render(<Button onClick={handleClick}>Click</Button>);

  await user.click(screen.getByRole("button")); // Simulates real user
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

**Why better:**

- Uses `userEvent` (more realistic than `fireEvent`)
- Tests actual behavior (clicking) not just rendering
- Verifies callbacks work correctly

## 🚀 Next Steps

### **When Writing Tests:**

1. **Import from test-utils:**

   ```tsx
   import { render, screen } from "@/__tests__/setup/test-utils";
   ```

2. **Test user behavior, not implementation:**

   ```tsx
   // ✅ Good - tests what user sees
   expect(screen.getByRole("button")).toHaveTextContent("Submit");

   // ❌ Bad - tests implementation details
   expect(wrapper.find(".btn-submit").length).toBe(1);
   ```

3. **Use modern patterns:**
   ```tsx
   const user = userEvent.setup(); // Instead of fireEvent
   await user.click(button); // Simulates real interactions
   ```

### **Coverage Workflow:**

```bash
# Before pushing code
npm run test:coverage:open

# Check coverage report in browser
# Ensure new code has tests
# Green coverage = good to merge
```

### **CI Integration:**

When you push a PR:

1. Tests run automatically
2. Coverage report generated
3. PR comment shows coverage changes
4. Red if coverage drops below 80%

## 📚 Key Concepts I Should Remember

1. **Vitest vs Jest:** Vitest is faster, better ESM support, modern API
2. **happy-dom vs jsdom:** happy-dom is lighter, faster for most React tests
3. **Coverage types:**
   - **Lines:** % of code lines executed
   - **Functions:** % of functions called
   - **Branches:** % of if/else paths taken
   - **Statements:** % of statements executed
4. **Next.js testing challenges:** Router/headers need mocking, Server Components can't use hooks
5. **Test organization:** `__tests__/` for shared utilities, co-located for component tests

## 🎓 Interview Talking Points

"I set up a professional testing infrastructure with:

- **Vitest** for fast, modern test execution
- **80% coverage thresholds** enforced in CI
- **Custom test utilities** for scalable test patterns
- **Next.js-specific mocking** for router and Server Components
- **Automated coverage reporting** with PR comments

The setup follows industry standards from companies like Vercel, Shopify, and Stripe."

---

**Status:** ✅ All tests passing, ready to commit and merge!
