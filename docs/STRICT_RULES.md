# 🔒 Strict Validation Rules

This project enforces **ZERO-TOLERANCE** code quality rules. Bad code **CANNOT** be committed or merged.

---

## 🛡️ Multi-Layer Defense System

### **Layer 1: Pre-Commit Hook (LOCAL)**

Runs automatically when you `git commit`:

1. **Prettier** - Auto-formats your code
2. **ESLint** - Checks for errors (zero warnings allowed)
3. **TypeScript** - Type checks all files

**If ANY check fails, your commit is BLOCKED.**

### **Layer 2: GitHub Actions (REMOTE)**

Runs on every PR and push to `main`:

1. **Format Check** - Ensures code is formatted
2. **ESLint** - Zero warnings allowed (`--max-warnings=0`)
3. **TypeScript** - Full type check (`tsc --noEmit`)

**If ANY check fails, PR cannot be merged.**

---

## ❌ Banned Patterns (Will Cause Commit Failure)

### **1. Unused Variables/Imports**

```typescript
// ❌ BLOCKED
const unusedVariable = "test";
import { UnusedComponent } from "./components";

// ✅ ALLOWED (prefix with underscore)
const _intentionallyUnused = "test";

// ✅ BEST (just remove it)
// Don't declare what you don't use
```

### **2. console.log()**

```typescript
// ❌ BLOCKED
console.log("Debugging message");

// ✅ ALLOWED (only warn/error)
console.warn("Warning message");
console.error("Error message");

// ✅ BEST (use proper debugging)
// Use debugger; or VS Code breakpoints
```

### **3. @ts-ignore**

```typescript
// ❌ BLOCKED
// @ts-ignore
const x: number = "string";

// ✅ ALLOWED (must explain)
// @ts-expect-error: Legacy API returns wrong type, fixing in v2
const y: number = legacyAPI();

// ✅ BEST (fix the actual issue)
const z: string = legacyAPI() as string;
```

### **4. Missing Return Types**

```typescript
// ❌ BLOCKED
function calculate(a: number, b: number) {
  return a + b;
}

// ✅ ALLOWED
function calculate(a: number, b: number): number {
  return a + b;
}

// ✅ ALLOWED (arrow functions with expressions)
const calculate = (a: number, b: number) => a + b;
```

### **5. No debugger Statements**

```typescript
// ❌ BLOCKED
debugger;

// ✅ ALLOWED
// Use VS Code breakpoints or console.error()
```

---

## 🔧 How to Fix Issues Locally

### **Quick Fix Workflow**

```bash
# 1. Try to commit (will fail if issues exist)
git commit -m "feat: add new feature"

# 2. Check what's wrong
npm run lint          # See ESLint errors
npm run type-check    # See TypeScript errors

# 3. Auto-fix what's possible
npm run format        # Format code
npm run lint:fix      # Fix ESLint auto-fixable issues

# 4. Manually fix remaining issues
# (unused vars, missing types, etc.)

# 5. Try commit again
git commit -m "feat: add new feature"
```

### **Run All Checks Manually**

```bash
npm run validate
```

This runs: `lint` → `type-check` → `format:check`

---

## 📋 TypeScript Strict Rules

The following TypeScript compiler flags are enforced:

| Flag                         | What It Does                        | Example Error                                   |
| ---------------------------- | ----------------------------------- | ----------------------------------------------- |
| `noUnusedLocals`             | Detects unused variables            | `const x = 1; // ❌ unused`                     |
| `noUnusedParameters`         | Detects unused function params      | `function f(a, b) { return a; } // ❌ b unused` |
| `noImplicitReturns`          | All code paths must return          | `if (x) return 1; // ❌ missing else return`    |
| `noFallthroughCasesInSwitch` | Switch cases must break             | `case 1: doThing(); // ❌ missing break`        |
| `noUncheckedIndexedAccess`   | Array access might be undefined     | `arr[0] // ❌ might be undefined`               |
| `exactOptionalPropertyTypes` | Optional props can't be `undefined` | `{ x?: number } = { x: undefined } // ❌`       |
| `noImplicitOverride`         | Must use `override` keyword         | `class B extends A { method() {} } // ❌`       |

---

## 🚨 When Validation Fails

### **Pre-Commit Hook Failed**

```bash
✖ eslint --fix --max-warnings=0 failed to spawn:
Command failed with exit code 1
husky - pre-commit script failed (code 1)
```

**What to do:**

1. Read the error output (shows which file and line)
2. Fix the issue in your code
3. Try committing again

### **GitHub Actions Failed**

You'll see a ❌ on your PR with a comment:

```
❌ Strict Validation Failed

Your code has issues that must be fixed before merging.
```

**What to do:**

1. Click "Details" to see which check failed
2. Run `npm run validate` locally
3. Fix issues and push again

---

## 💡 Pro Tips

### **Intentionally Unused Variables**

Sometimes you need to declare a variable for destructuring but don't use it:

```typescript
// ❌ BLOCKED
const { data, error } = fetchAPI();
return data; // error is unused

// ✅ ALLOWED (prefix with _)
const { data, _error } = fetchAPI();
return data;

// ✅ BEST (use rest operator)
const { data, ...rest } = fetchAPI();
return data;
```

### **Debugging in Production**

```typescript
// ❌ BLOCKED
console.log("User data:", user);

// ✅ ALLOWED (will show in production logs)
console.error("User data:", user);

// ✅ BEST (proper logging)
if (process.env.NODE_ENV === "development") {
  console.warn("Debug:", user);
}
```

### **Dealing with Third-Party Types**

```typescript
// ❌ BLOCKED
// @ts-ignore
const data = badLibrary.getData();

// ✅ ALLOWED (explain the issue)
// @ts-expect-error: Library v1.0 types are wrong, fixed in v2.0
const data = badLibrary.getData();

// ✅ BEST (add proper types)
type LibraryData = { id: string; name: string };
const data = badLibrary.getData() as LibraryData;
```

---

## 🎯 Why So Strict?

### **Prevents Bugs Early**

- Unused variables = potential bugs
- Missing types = runtime errors
- console.log = forgotten debug code

### **Enforces Consistency**

- Everyone formats code the same way
- No debates about style
- Prettier handles it automatically

### **Catches Mistakes**

- TypeScript strict mode catches ~15% more bugs
- ESLint catches common mistakes
- You find issues locally, not in production

### **Learning Opportunity**

- Forces you to understand the code
- Can't hide issues with @ts-ignore
- Must think about types explicitly

---

## 📖 Configuration Files

| File                           | Purpose                     |
| ------------------------------ | --------------------------- |
| `.prettierrc.json`             | Prettier formatting rules   |
| `.prettierignore`              | Files Prettier should skip  |
| `eslint.config.mjs`            | ESLint rules and plugins    |
| `tsconfig.json`                | TypeScript compiler options |
| `.husky/pre-commit`            | Pre-commit hook script      |
| `package.json` → `lint-staged` | What runs in pre-commit     |
| `.github/workflows/ci.yml`     | GitHub Actions CI checks    |

---

## 🔥 Quick Reference

```bash
# Fix formatting
npm run format

# Check for errors (don't fix)
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Run ALL checks
npm run validate

# Bypass hook (EMERGENCY ONLY - don't do this)
git commit --no-verify -m "message"
```

---

## 🚫 DO NOT Bypass Validation

The hook can be bypassed with `--no-verify`, but **DON'T DO IT** unless:

1. You're fixing a critical production bug
2. The validation is objectively wrong (file a bug report)
3. You're about to fix it in the next commit (within 5 minutes)

**Every time you bypass validation, a kitten cries.** 🐱😢

---

## ✅ Summary

**Three Rules:**

1. ✅ **Format your code** (Prettier does this automatically)
2. ✅ **Fix all ESLint errors** (zero warnings allowed)
3. ✅ **Fix all TypeScript errors** (strict mode enabled)

**If you can commit locally, your PR will pass.** 🎉
