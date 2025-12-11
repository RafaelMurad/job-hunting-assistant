# Implementation Plan v1.2 - Professional Polish & Security Hardening

**Date:** December 2025
**Version:** 1.2 (Sprint 10 & 11)
**Status:** In Progress

---

## Executive Summary

This plan addresses the remaining features, security hardening, and UX improvements needed to transform Job Hunt AI from MVP to production-ready product. All implementations will include comprehensive tests following the 80% coverage requirement.

### Project Status Analysis

✅ **Completed (v1.1):**
- NextAuth.js v5 authentication (GitHub, Google, LinkedIn OAuth)
- Social integrations with token encryption
- Nordic design system
- Mobile navigation menu
- Core features (CV upload, job analysis, cover letters, tracker, CV editor)
- Feature flags system
- 80% test coverage enforcement

🔴 **Critical Security Issues:**
- Admin routes unprotected (HIGH)
- No rate limiting (HIGH)
- Missing security headers (MEDIUM)

🟡 **High-Priority UX Issues:**
- No tracker filtering/sorting (P1)
- No skill gap actionable advice (P1)

---

## Dependencies Audit Results

### Security Audit: ✅ PASSED
- **Vulnerabilities:** 0 found in production dependencies
- **Trusted Packages:** All from verified sources
  - `@anthropic-ai/sdk` - Official Anthropic SDK
  - `@google/generative-ai` - Official Google SDK
  - `openai` - Official OpenAI SDK
  - `@prisma/client` - Trusted ORM
  - `@trpc/server` - Trusted RPC framework
  - `next-auth` - Trusted auth library
  - `@radix-ui/*` - Trusted UI primitives
  - `@vercel/blob` - Official Vercel SDK

### Outdated Packages (Non-Critical):
- `@anthropic-ai/sdk`: 0.69.0 → 0.71.2 (minor updates)
- `@google/generative-ai`: 0.21.0 → 0.24.1 (minor updates)
- `openai`: 4.104.0 → 6.10.0 (major update available, test before upgrading)
- `zod`: 3.25.76 → 4.1.13 (major update, breaking changes)
- `@prisma/client`: 6.19.0 → 7.1.0 (major update, review migration)

**Recommendation:** Update minor versions now, defer major version upgrades until after v1.2 stabilization.

---

## Sprint 10: Security Hardening & Critical UX

**Duration:** 1-2 weeks
**Focus:** Production readiness, security, and high-priority UX

### Phase 1: Security Hardening (3-4 days)

#### 1.1 Admin Route Protection [HIGH]
**Issue:** `/admin/*` routes accessible to anyone
**Files:**
- `middleware.ts` - Create/update to protect admin routes
- `lib/auth.ts` - Add admin role checking utility

**Implementation:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has admin/trusted role
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { isTrusted: true }
    })

    if (!user?.isTrusted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
```

**Tests:**
- Unit test for admin role checking
- Integration test for middleware protection
- E2E test for unauthorized access rejection

---

#### 1.2 Rate Limiting [HIGH]
**Issue:** No protection against abuse or DoS
**Dependencies:** `@upstash/ratelimit`, `@upstash/redis`

**Implementation:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

// lib/trpc/middleware/rate-limit.ts
export const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const { success } = await rateLimiter.limit(ctx.session.user.id)

  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.'
    })
  }

  return next({ ctx })
})

// Apply to expensive operations
export const rateLimitedProcedure = protectedProcedure.use(rateLimitMiddleware)
```

**Rate Limits:**
- AI operations: 10 requests / 10 seconds per user
- File uploads: 5 requests / minute per user
- General API: 100 requests / minute per user

**Tests:**
- Unit test for rate limiter configuration
- Integration test for rate limit enforcement
- Test rate limit headers in responses

---

#### 1.3 Security Headers [MEDIUM]
**Issue:** Missing CSP, HSTS, Permissions-Policy
**Files:** `next.config.ts`, `vercel.json`

**Implementation:**
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

**Tests:**
- Integration test to verify headers are set
- Security scanner test (OWASP ZAP or similar)

---

### Phase 2: Critical UX Improvements (3-4 days)

#### 2.1 Tracker Filtering & Search [P1]
**Issue:** Users can't find applications in growing list
**Files:**
- `app/tracker/page.tsx` - Add filter UI
- `lib/hooks/useApplications.ts` - Add filter/search logic
- `components/tracker-filters.tsx` - New filter component

**Features:**
- Status filter tabs (All, Applied, Interview, Offer, Rejected)
- Search by company name or job title
- Sort by date, company, match score
- URL query params for shareable filters

**Implementation:**
```typescript
// components/tracker-filters.tsx
export function TrackerFilters() {
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'score'>('date')

  return (
    <div className="flex flex-col gap-4">
      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'applied', 'interview', 'offer', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              status === s
                ? "bg-fjord-600 text-white"
                : "bg-nordic-neutral-100 text-nordic-neutral-700 hover:bg-nordic-neutral-200"
            )}
          >
            {s === 'all' ? 'All' : capitalize(s)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search by company or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-nordic-neutral-400" />
      </div>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Most Recent</SelectItem>
          <SelectItem value="company">Company A-Z</SelectItem>
          <SelectItem value="score">Match Score</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

**Tests:**
- Unit tests for filter logic
- Component tests for filter UI interactions
- Integration tests for filtered data fetching
- E2E tests for filter persistence in URL

---

#### 2.2 Skill Gap Actionable Advice [P1]
**Issue:** Analysis shows gaps but no solutions
**Files:**
- `lib/ai/analyze.ts` - Enhance prompt for gap advice
- `app/analyze/page.tsx` - Display advice section
- `components/skill-gap-advice.tsx` - New component

**Features:**
- "How to address" tips for each missing skill
- Learning resource suggestions (Coursera, Udemy, etc.)
- Cover letter includes gap mitigation strategy
- Alternative roles with better match

**Implementation:**
```typescript
// lib/ai/analyze.ts
const ANALYZE_WITH_ADVICE_PROMPT = `
Analyze the job posting and provide:
1. Match score (0-100)
2. Skill gaps with actionable advice:
   - What's missing
   - How to quickly address it (courses, projects, etc.)
   - How to frame existing skills as transferable
3. Cover letter mitigation strategy
4. Similar roles where candidate has higher match
`

// components/skill-gap-advice.tsx
export function SkillGapAdvice({ gap }: { gap: SkillGap }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-clay-600" />
          {gap.skill}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-nordic-neutral-600 mb-2">
            Why it matters:
          </h4>
          <p className="text-sm text-nordic-neutral-700">{gap.importance}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-forest-600 mb-2">
            How to address:
          </h4>
          <ul className="text-sm space-y-2">
            {gap.advice.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-forest-600 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {gap.resources && (
          <div>
            <h4 className="font-semibold text-sm text-fjord-600 mb-2">
              Learning resources:
            </h4>
            <div className="flex flex-wrap gap-2">
              {gap.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1 bg-fjord-50 text-fjord-700 rounded-full hover:bg-fjord-100 transition-colors"
                >
                  {resource.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Tests:**
- Unit tests for advice generation logic
- Component tests for advice display
- Integration tests for AI prompt enhancement
- Snapshot tests for UI consistency

---

### Phase 3: Polish & Developer Experience (2-3 days)

#### 3.1 Confirmation Dialogs [P3]
**Issue:** No protection against accidental deletions
**Files:**
- `components/ui/dialog.tsx` - Enhance dialog component
- `components/confirmation-dialog.tsx` - Reusable confirmation

**Implementation:**
```typescript
// components/confirmation-dialog.tsx
export function ConfirmationDialog({
  title,
  description,
  onConfirm,
  onCancel,
  variant = 'destructive',
}: ConfirmationDialogProps) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'destructive' && (
              <AlertTriangle className="h-5 w-5 text-clay-600" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Usage:**
```typescript
// Example: Delete application
const handleDelete = () => {
  showConfirmation({
    title: 'Delete Application?',
    description: 'This action cannot be undone. Are you sure you want to delete this application?',
    onConfirm: async () => {
      await deleteApplication.mutate({ id: app.id })
    },
  })
}
```

**Tests:**
- Component tests for dialog interactions
- Integration tests for confirmation flow
- Accessibility tests for keyboard navigation

---

#### 3.2 Dependency Updates [MAINTENANCE]
**Goal:** Keep dependencies current and secure

**Safe Updates (Minor versions):**
```bash
npm update @anthropic-ai/sdk @google/generative-ai @types/node @types/react
npm update @vitejs/plugin-react @vitest/coverage-v8 @vitest/ui
npm update eslint-config-next next react react-dom
```

**Deferred Updates (Major versions - breaking changes):**
- `openai`: 4.x → 6.x (review API changes)
- `zod`: 3.x → 4.x (breaking schema changes)
- `@prisma/client`: 6.x → 7.x (review migration guide)

**Tests:**
- Run full test suite after each update
- Verify build succeeds
- Manual smoke testing of core features

---

## Sprint 11: Advanced UX & Testing

**Duration:** 1-2 weeks
**Focus:** Medium-priority UX improvements and test coverage

### Phase 4: Medium-Priority UX (3-4 days)

#### 4.1 Upload Progress Indication [P2]
**Feature:** Show steps during CV upload/extraction

**Implementation:**
```typescript
// components/upload-progress.tsx
const steps = [
  { id: 'upload', label: 'Uploading file', icon: Upload },
  { id: 'read', label: 'Reading document', icon: FileText },
  { id: 'extract', label: 'Extracting data', icon: Sparkles },
  { id: 'done', label: 'Complete', icon: Check },
]

export function UploadProgress({ currentStep }: { currentStep: string }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isComplete = steps.findIndex(s => s.id === currentStep) > index

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center h-10 w-10 rounded-full",
              isComplete && "bg-forest-100 text-forest-700",
              isActive && "bg-fjord-100 text-fjord-700 animate-pulse",
              !isActive && !isComplete && "bg-nordic-neutral-100 text-nordic-neutral-400"
            )}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className={cn(
              "font-medium",
              isActive && "text-fjord-700",
              isComplete && "text-forest-700",
              !isActive && !isComplete && "text-nordic-neutral-400"
            )}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

---

#### 4.2 Drag-and-Drop Upload [P2]
**Feature:** Visual drop zone for file uploads

**Implementation:**
```typescript
// components/file-dropzone.tsx
export function FileDropzone({ onDrop, accept }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file =>
      accept.includes(file.type)
    )

    if (validFiles.length > 0) {
      onDrop(validFiles[0])
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-all",
        isDragging
          ? "border-fjord-600 bg-fjord-50"
          : "border-nordic-neutral-300 hover:border-nordic-neutral-400"
      )}
    >
      <Upload className="h-12 w-12 mx-auto mb-4 text-nordic-neutral-400" />
      <p className="text-nordic-neutral-700 mb-2">
        Drag and drop your CV here, or click to browse
      </p>
      <p className="text-sm text-nordic-neutral-500">
        Supports PDF, DOCX (max 10MB)
      </p>
    </div>
  )
}
```

---

### Phase 5: Comprehensive Testing (2-3 days)

#### 5.1 Component Test Coverage
**Goal:** Increase component test coverage to 90%+

**Priority Components:**
- `TrackerFilters` - Filter and search logic
- `SkillGapAdvice` - Advice display and interactions
- `ConfirmationDialog` - Confirmation flow
- `FileDropzone` - Drag and drop interactions
- `UploadProgress` - Progress state management
- `MobileMenu` - Navigation interactions (✅ Already tested with creation)

**Test Template:**
```typescript
// __tests__/components/tracker-filters.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrackerFilters } from '@/components/tracker-filters'

describe('TrackerFilters', () => {
  it('renders all status tabs', () => {
    render(<TrackerFilters />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('Interview')).toBeInTheDocument()
  })

  it('filters applications by status', async () => {
    const onFilterChange = vi.fn()
    render(<TrackerFilters onFilterChange={onFilterChange} />)

    fireEvent.click(screen.getByText('Interview'))
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'interview' })
  })

  it('searches applications by query', async () => {
    const onSearchChange = vi.fn()
    render(<TrackerFilters onSearchChange={onSearchChange} />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'Google' } })

    expect(onSearchChange).toHaveBeenCalledWith('Google')
  })
})
```

---

#### 5.2 Integration Test Coverage
**Goal:** Test all new tRPC endpoints and middleware

**Tests:**
- Rate limiting middleware enforcement
- Admin route protection
- Tracker filtering queries
- Skill gap advice generation

**Test Template:**
```typescript
// __tests__/integration/rate-limit.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createCaller } from '@/lib/trpc/routers/_app'
import { mockSession } from '@/__tests__/helpers/auth-mock'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Reset rate limiter state
  })

  it('allows requests within limit', async () => {
    const caller = createCaller({ session: mockSession })

    for (let i = 0; i < 10; i++) {
      const result = await caller.analyze.analyzeJob({ url: 'test' })
      expect(result).toBeDefined()
    }
  })

  it('blocks requests exceeding limit', async () => {
    const caller = createCaller({ session: mockSession })

    // Make 10 requests (at limit)
    for (let i = 0; i < 10; i++) {
      await caller.analyze.analyzeJob({ url: 'test' })
    }

    // 11th request should fail
    await expect(
      caller.analyze.analyzeJob({ url: 'test' })
    ).rejects.toThrow('Rate limit exceeded')
  })
})
```

---

## Success Metrics

### Security Metrics
- [ ] 0 high/critical vulnerabilities in `npm audit`
- [ ] All admin routes require authentication
- [ ] Rate limiting enforced on all AI endpoints
- [ ] Security headers score A+ on securityheaders.com
- [ ] CSP violations monitored and resolved

### UX Metrics
- [ ] Tracker search/filter reduces time-to-find by 80%
- [ ] Users interact with skill gap advice on 70%+ of analyses
- [ ] Confirmation dialogs prevent 100% of accidental deletions
- [ ] File upload success rate >95% with progress indication

### Testing Metrics
- [ ] Maintain 80%+ code coverage
- [ ] 0 failing tests in CI
- [ ] All new features have unit + integration tests
- [ ] E2E smoke tests pass on staging

### Performance Metrics
- [ ] Tracker page loads in <1s with 100 applications
- [ ] Search/filter response time <100ms
- [ ] No layout shift during file upload
- [ ] Lighthouse score >90 on all metrics

---

## Risk Mitigation

### Technical Risks

**Risk:** Rate limiting breaks legitimate users
**Mitigation:**
- Start with generous limits (100 req/min)
- Monitor usage patterns
- Add user-facing rate limit info
- Implement request queuing for burst traffic

**Risk:** Major dependency upgrades cause breaking changes
**Mitigation:**
- Defer major upgrades until after v1.2
- Create upgrade branches for testing
- Comprehensive test suite catches regressions
- Maintain changelog of breaking changes

**Risk:** Security headers break functionality
**Mitigation:**
- Test CSP in staging thoroughly
- Use CSP report-only mode first
- Whitelist necessary external sources
- Monitor CSP violation reports

### Product Risks

**Risk:** UX changes confuse existing users
**Mitigation:**
- Add onboarding tooltips for new features
- Maintain previous behavior as default
- Gradual rollout with feature flags
- Collect user feedback early

---

## Timeline

### Week 1: Security & Infrastructure
- Day 1-2: Admin middleware + rate limiting
- Day 3: Security headers
- Day 4: Testing security features
- Day 5: Dependency updates

### Week 2: UX Improvements
- Day 1-2: Tracker filtering + search
- Day 3: Skill gap advice
- Day 4-5: Confirmation dialogs + upload progress

### Week 3: Testing & Polish
- Day 1-2: Component test coverage
- Day 3: Integration test coverage
- Day 4: E2E smoke tests
- Day 5: Documentation + deployment

---

## Post-Implementation

### Monitoring
- Set up Sentry for error tracking
- Monitor rate limit metrics in Upstash
- Track CSP violations
- Monitor API costs (AI providers)

### Documentation
- Update README with new features
- Document rate limits for users
- Update API documentation
- Create migration guide for v1.2

### Deployment
- Deploy to staging first
- Run full test suite
- Manual QA on all features
- Gradual rollout to production (canary deployment)
- Monitor error rates and rollback if needed

---

## Next Version (v1.3)

**Planned Features:**
- Email reminders for follow-ups
- Calendar integration
- Premium CV editor (self-hosted LaTeX)
- Analytics dashboard with charts
- PDF export (native, not browser print)

**Deferred:**
- E2E test suite (Playwright) - wait for UI stabilization
- Interview prep module - v2.0
- Multi-user/teams - v2.0
- Browser extension - v2.0

---

_This plan will be updated as implementation progresses and new requirements emerge._
