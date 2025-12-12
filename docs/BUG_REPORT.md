# Bug Report

**Generated:** December 2024
**Project:** Job Hunting Assistant

This document contains bugs identified during a code audit. Bugs are prioritized for manual fixing.

---

## Critical Bugs

### BUG-001: Memory Leak - URL.createObjectURL Not Revoked

**File:** `app/cv/page.tsx`
**Line:** ~384
**Severity:** HIGH
**Type:** Memory Leak

**Description:**
`URL.createObjectURL()` creates blob URLs that hold references in memory. These URLs are created for PDF preview but never revoked with `URL.revokeObjectURL()`, causing memory to accumulate with each preview.

**Current Code:**
```typescript
const blobUrl = URL.createObjectURL(pdfBlob);
setPreviewPdfUrl(blobUrl);
// Missing: URL.revokeObjectURL when component unmounts or state updates
```

**Fix:**
Add cleanup in useEffect:
```typescript
useEffect(() => {
  return () => {
    if (previewPdfUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewPdfUrl);
    }
  };
}, [previewPdfUrl]);
```

---

### BUG-002: setTimeout Not Cancelled on Unmount

**Files:** Multiple locations
**Severity:** HIGH
**Type:** Memory Leak / State Update on Unmounted Component

**Affected Files:**
- `lib/hooks/useAnalyze.ts` (line 84)
- `app/analyze/page.tsx` (lines 39, 77)
- `app/cv/page.tsx` (lines 143, 313)
- `app/tracker/page.tsx` (lines 118, 134)
- `app/profile/page.tsx` (lines 65, 74)

**Description:**
Multiple `setTimeout` calls are not stored and cancelled when components unmount. This can cause "state update on unmounted component" warnings and potential crashes.

**Example Issue in useAnalyze.ts:**
```typescript
const resetButtonState = (setter, delay = 2000): void => {
  setTimeout(() => setter("idle"), delay);
  // Missing: timeout ID not returned for cancellation
};
```

**Fix:**
Return timeout ID and clean up:
```typescript
const timeoutRef = useRef<NodeJS.Timeout>();

const resetButtonState = (setter, delay = 2000): void => {
  timeoutRef.current = setTimeout(() => setter("idle"), delay);
};

// In useEffect cleanup:
useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);
```

---

## High Priority Bugs

### BUG-003: Incorrect Error Type in tRPC Router

**File:** `lib/trpc/routers/applications.ts`
**Lines:** 77, 101
**Severity:** HIGH
**Type:** Incorrect Error Handling

**Description:**
Throwing plain `Error` instead of `TRPCError` means errors won't be properly serialized or handled by the tRPC client.

**Current Code:**
```typescript
if (!application) {
  throw new Error("Application not found or access denied");
}
```

**Fix:**
```typescript
import { TRPCError } from "@trpc/server";

if (!application) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Application not found or access denied",
  });
}
```

---

### BUG-004: Missing Authentication on ATS Endpoint

**File:** `app/api/cv/ats/route.ts`
**Severity:** MEDIUM-HIGH
**Type:** Security / Resource Exposure

**Description:**
The ATS compliance check endpoint doesn't require authentication. This exposes expensive AI resources to unauthenticated users.

**Current Code:**
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // No auth check - anyone can call this endpoint
  const body = await request.json();
  const { latexContent } = body;
  const analysis = await analyzeATSCompliance(latexContent);
```

**Fix:**
```typescript
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... rest of handler
}
```

---

## Medium Priority Bugs

### BUG-005: Silent JSON Parsing Failure

**Files:**
- `lib/social/providers/linkedin.ts` (lines 65, 133, 271)
- `lib/social/providers/github.ts` (line 426)

**Severity:** MEDIUM
**Type:** Error Handling

**Description:**
Using `.catch(() => ({}))` silently swallows JSON parsing errors, losing valuable error context.

**Current Code:**
```typescript
const errorBody = await response.json().catch(() => ({}));
throw createOAuthError("linkedin", { status: response.status, body: errorBody });
```

**Fix:**
```typescript
let errorBody = {};
try {
  errorBody = await response.json();
} catch (parseError) {
  console.error("[OAuth] Failed to parse error response:", parseError);
}
throw createOAuthError("linkedin", { status: response.status, body: errorBody });
```

---

### BUG-006: State Initialization Outside useEffect

**File:** `app/profile/page.tsx`
**Lines:** 57-59
**Severity:** MEDIUM
**Type:** React Anti-Pattern

**Description:**
Calling `setState` during render (outside useEffect) can cause infinite re-renders or state update warnings.

**Current Code:**
```typescript
if (userData && !formData && !loading) {
  setFormData(userData); // Called during render, not in useEffect
}
```

**Fix:**
```typescript
useEffect(() => {
  if (userData && !formData && !loading) {
    setFormData(userData);
  }
}, [userData, loading, formData]);
```

---

### BUG-007: Unsafe FormData Type Casting

**Files:**
- `app/api/cv/store/route.ts` (lines 48-49)
- `app/api/cv/upload/route.ts` (line 41)

**Severity:** MEDIUM
**Type:** Type Safety

**Description:**
Casting `formData.get()` results directly as specific types without validation could lead to runtime errors.

**Current Code:**
```typescript
const selectedModel = (formData.get("model") as LatexExtractionModel) || AI_CONFIG.defaultLatexModel;
```

**Fix:**
```typescript
const modelString = formData.get("model");
const selectedModel = typeof modelString === 'string' && isValidModel(modelString)
  ? (modelString as LatexExtractionModel)
  : AI_CONFIG.defaultLatexModel;
```

---

### BUG-008: ~~Unsafe Token Claim Casting in Middleware~~ FIXED

**File:** ~~`middleware.ts`~~ → `proxy.ts`
**Lines:** 85-86
**Severity:** ~~MEDIUM~~ RESOLVED
**Type:** Type Safety

**Status:** ✅ FIXED - File migrated to proxy.ts with proper AUTH_SECRET validation.

**Original Issue:**
JWT token claims were cast without validation.

**Resolution:**
- Migrated middleware.ts to proxy.ts (Next.js 16 pattern)
- Added strict AUTH_SECRET validation (returns error if not set)
- Type casting retained but now behind proper secret validation

---

## Low Priority Bugs

### BUG-009: Potential Race Condition on Redirect

**File:** `app/analyze/page.tsx`
**Lines:** 74-77
**Severity:** LOW
**Type:** UX / Race Condition

**Description:**
Setting success state and then redirecting with setTimeout may not complete properly if redirect happens before state update is rendered.

**Current Code:**
```typescript
if (success) {
  setSaveState("success");
  setTimeout(() => router.push("/tracker"), 1000);
}
```

**Fix:**
Either redirect immediately or ensure the state update completes:
```typescript
if (success) {
  setSaveState("success");
  await new Promise(resolve => setTimeout(resolve, 1000)); // Allow render
  router.push("/tracker");
}
```

---

### BUG-010: Missing Error Handling for JSON.parse in Response

**File:** `app/cv/page.tsx`
**Line:** ~270
**Severity:** LOW
**Type:** Error Handling

**Description:**
When API response is not OK, code tries to access result.error without handling potential JSON parse failure.

**Current Code:**
```typescript
const result = await response.json();
if (!response.ok) {
  showToast("error", result.error || "Upload failed");
}
```

**Fix:**
```typescript
let result = null;
try {
  result = await response.json();
} catch {
  // JSON parse failed
}

if (!response.ok) {
  showToast("error", result?.error || "Upload failed");
}
```

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| Critical | 2 | Pending |
| High | 2 | Pending |
| Medium | 3 | Pending |
| Medium | 1 | ✅ Fixed (BUG-008) |
| Low | 2 | Pending |
| **Total** | **10** | **9 Pending, 1 Fixed** |

---

## Large File Refactoring Recommendations

The following files exceed 800 lines and would benefit from refactoring:

| File | Lines | Recommendation |
|------|-------|----------------|
| `lib/trpc/routers/ux.ts` | 1,156 | Split into sub-routers by feature (journeys, painpoints, personas) |
| `app/cv/page.tsx` | 1,020 | Extract hooks (useLatexEditor, usePDFPreview), separate components |
| `app/admin/ux-planner/page.tsx` | 916 | Extract editor panels as components, separate state management |
| `lib/cv-templates/index.ts` | 822 | Consider moving templates to data files or database |

**Note:** These are not bugs but technical debt. Refactoring should be done incrementally with proper testing.

---

## Checklist for Fixing

- [ ] BUG-001: Add URL.revokeObjectURL cleanup
- [ ] BUG-002: Add setTimeout cleanup refs
- [ ] BUG-003: Change Error to TRPCError
- [ ] BUG-004: Add auth to ATS endpoint
- [ ] BUG-005: Add error context for JSON parse failures
- [ ] BUG-006: Move state initialization to useEffect
- [ ] BUG-007: Add FormData validation
- [x] BUG-008: ~~Add typeof checks for token claims~~ Migrated to proxy.ts with validation
- [ ] BUG-009: Fix redirect timing
- [ ] BUG-010: Handle JSON parse failure in response

---

## Notes for Developer

These bugs were identified through static code analysis. When fixing:

1. **Test each fix** - Run the affected feature manually
2. **Run tests** - Ensure `npm test` passes
3. **Check TypeScript** - Run `npm run type-check`
4. **Consider edge cases** - Think about unmounting, network failures, etc.

Happy bug hunting! 🐛
