# Security Audit Report

**Date:** December 2025
**Version:** 1.0
**Prepared for:** Job Hunt AI Platform

---

## Executive Summary

This document identifies security vulnerabilities, data storage concerns, and architectural issues in the Job Hunt AI codebase. Issues are categorized by severity and include actionable remediation steps.

### Severity Levels

| Level        | Description                                             |
| ------------ | ------------------------------------------------------- |
| **CRITICAL** | Immediate action required. Exploitable vulnerabilities. |
| **HIGH**     | Should be addressed before production scaling.          |
| **MEDIUM**   | Plan remediation within next sprint.                    |
| **LOW**      | Address when convenient, technical debt.                |

---

## 1. Authentication & Authorization Issues

### 1.1 No Authentication System (CRITICAL)

**Current State:**

- Application has no user authentication
- All tRPC procedures use `publicProcedure`
- Single hardcoded user ID in some API routes
- Anyone can access any endpoint

**Evidence:**

```typescript
// lib/trpc/init.ts - Line 45
export const publicProcedure = t.procedure;
// FUTURE: Add protected procedure with auth middleware
// export const protectedProcedure = t.procedure.use(isAuthed);
```

**Risk:** Complete data exposure. Any user can read/modify any data.

**Remediation:**

1. Implement NextAuth.js or Clerk for authentication
2. Add session management to tRPC context
3. Create `protectedProcedure` middleware
4. Protect all sensitive endpoints

**Priority:** CRITICAL - Must fix before multi-user deployment

---

### 1.2 Admin Pages Unprotected (HIGH)

**Current State:**

- `/admin/flags` and `/admin/ux-planner` are accessible to anyone
- AdminGuard component created but depends on non-existent auth
- No server-side route protection

**Evidence:**

- Admin pages have client-side guards only
- No middleware.ts protecting `/admin/*` routes
- Guards rely on user being in database with correct role

**Risk:** Unauthorized access to admin functionality.

**Remediation:**

1. Add Next.js middleware to protect `/admin/*` routes
2. Implement server-side session validation
3. Use AdminGuard with actual authentication

**Priority:** HIGH

---

### 1.3 Owner Email Hardcoded (MEDIUM)

**Current State:**

```typescript
// lib/trpc/routers/admin.ts
const OWNER_EMAIL = process.env.OWNER_EMAIL || "rafael@example.com";
```

**Risk:** Default fallback email could be exploited if env var not set.

**Remediation:**

1. Remove default email fallback
2. Require OWNER_EMAIL in production
3. Validate email format on startup

**Priority:** MEDIUM

---

## 2. OAuth & Token Security Issues

### 2.1 OAuth Token Storage (HIGH)

**Current State:**

- OAuth access tokens encrypted with AES-256-GCM
- Encryption key from environment variable
- Development fallback key exists

**Evidence:**

```typescript
// lib/social/token-manager.ts
if (process.env.NODE_ENV === "development") {
  console.warn("[TokenManager] Warning: Using development encryption key...");
  return Buffer.alloc(KEY_LENGTH, "dev-key-do-not-use-in-production!");
}
```

**Risk:**

- Development key is predictable
- Tokens could be decrypted if database is compromised
- No key rotation mechanism

**Remediation:**

1. Never use fallback key - fail hard in production
2. Implement key rotation strategy
3. Consider using HSM or KMS for key management
4. Add token refresh mechanism for LinkedIn

**Priority:** HIGH

---

### 2.2 OAuth State Parameter Storage (MEDIUM)

**Current State:**

- OAuth state stored in HTTP-only cookie
- Cookie expires after 10 minutes
- No server-side state validation table

**Evidence:**

```typescript
// app/api/auth/github/route.ts
cookieStore.set("oauth_state", JSON.stringify({ state, userId, provider: "github" }), {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 10, // 10 minutes
});
```

**Risk:**

- State could be replayed within 10-minute window
- Cookie-based storage limits concurrent OAuth flows

**Remediation:**

1. Store state in database with single-use flag
2. Reduce state validity window
3. Implement PKCE for additional security

**Priority:** MEDIUM

---

### 2.3 Missing PKCE Implementation (MEDIUM)

**Current State:**

- OAuth flows use basic authorization code flow
- No PKCE (Proof Key for Code Exchange) implemented

**Risk:** Vulnerable to authorization code interception attacks.

**Remediation:**

1. Implement PKCE for both GitHub and LinkedIn
2. Store code_verifier securely
3. Validate code_challenge on callback

**Priority:** MEDIUM

---

## 3. Data Storage & Privacy Issues

### 3.1 LaTeX Compilation GDPR Risk (HIGH)

**Current State:**

- CV LaTeX compilation uses external service: `latexonline.cc`
- User CV data sent to third-party without DPA
- No data retention agreement

**Evidence:**

- Referenced in PRD as known risk
- User's personal CV data leaves controlled environment

**Risk:**

- GDPR compliance violation
- No control over data retention
- Third-party service availability risk

**Remediation:**

1. Self-host LaTeX compilation (Docker + Cloud Run)
2. Keep all user data within controlled infrastructure
3. Document data flow for compliance

**Priority:** HIGH - Before scaling to EU users

---

### 3.2 No Data Encryption at Rest (MEDIUM)

**Current State:**

- Database (PostgreSQL/Neon) stores sensitive data
- Only OAuth tokens are encrypted
- CV content, job descriptions, cover letters stored plain

**Risk:** Database breach exposes all user data.

**Remediation:**

1. Enable database-level encryption (Neon provides this)
2. Consider column-level encryption for PII
3. Document encryption strategy

**Priority:** MEDIUM

---

### 3.3 Vercel Blob Storage Public URLs (MEDIUM)

**Current State:**

```typescript
// lib/storage.ts
const blob = await put(`cv/${userId}/cv.pdf`, pdfBuffer, {
  access: "public",
  // ...
});
```

**Risk:**

- CV PDFs accessible via URL to anyone who has the link
- URLs may be leaked through logs or referrer headers

**Remediation:**

1. Use `access: "private"` for sensitive files
2. Implement signed URLs with expiration
3. Add access control layer

**Priority:** MEDIUM

---

### 3.4 No Data Retention Policy (LOW)

**Current State:**

- No automated data cleanup
- No user data export functionality
- No account deletion process

**Risk:** GDPR "right to be forgotten" compliance.

**Remediation:**

1. Implement data retention configuration
2. Add user data export (GDPR data portability)
3. Create account deletion flow
4. Schedule automated cleanup jobs

**Priority:** LOW - Before EU deployment

---

## 4. API Security Issues

### 4.1 No Rate Limiting (HIGH)

**Current State:**

- tRPC endpoints have no rate limiting
- API routes have no request throttling
- AI operations have no usage caps

**Risk:**

- Denial of service
- AI API cost explosion
- Abuse of resources

**Remediation:**

1. Implement rate limiting middleware (e.g., `@upstash/ratelimit`)
2. Add per-user quotas for AI operations
3. Implement request throttling at Vercel level
4. Add spending limits on AI providers

**Priority:** HIGH

---

### 4.2 No Input Sanitization for AI Prompts (MEDIUM)

**Current State:**

- Job descriptions sent directly to AI
- No filtering of potentially malicious prompts
- Cover letters generated without output validation

**Risk:** Prompt injection attacks.

**Remediation:**

1. Sanitize user input before AI calls
2. Implement output validation
3. Add content moderation layer
4. Log and monitor AI interactions

**Priority:** MEDIUM

---

### 4.3 Missing CORS Configuration (LOW)

**Current State:**

- Next.js default CORS settings
- No explicit allowed origins
- No preflight caching

**Risk:** Cross-origin request manipulation.

**Remediation:**

1. Configure explicit CORS policy in `next.config.ts`
2. Restrict origins to known domains
3. Set appropriate headers

**Priority:** LOW

---

## 5. Infrastructure Security Issues

### 5.1 Environment Variable Exposure Risk (MEDIUM)

**Current State:**

- `.env.example` documents all required variables
- Some variables use `NEXT_PUBLIC_` prefix
- No validation of required vars at startup

**Evidence:**

```bash
# .env.example contains:
GEMINI_API_KEY=
OPENAI_API_KEY=
DATABASE_URL=
```

**Risk:**

- Missing vars cause runtime failures
- Public vars exposed to client

**Remediation:**

1. Add startup validation for required vars
2. Audit `NEXT_PUBLIC_` vars - ensure no secrets
3. Use Vercel environment validation

**Priority:** MEDIUM

---

### 5.2 No Security Headers Audit (MEDIUM)

**Current State:**

- Some headers set in `vercel.json`
- Missing several recommended headers

**Evidence:**

```json
// vercel.json
"headers": {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

**Missing Headers:**

- Content-Security-Policy (CSP)
- Permissions-Policy
- Strict-Transport-Security (HSTS)

**Remediation:**

1. Add CSP header with strict policy
2. Configure Permissions-Policy
3. Enable HSTS with preload

**Priority:** MEDIUM

---

### 5.3 No Dependency Vulnerability Scanning (LOW)

**Current State:**

- No `npm audit` in CI pipeline
- No Dependabot or Snyk integration
- Package-lock not audited regularly

**Risk:** Known vulnerabilities in dependencies.

**Remediation:**

1. Add `npm audit` to CI pipeline
2. Enable GitHub Dependabot
3. Schedule regular dependency updates

**Priority:** LOW

---

## 6. Code Quality Security Issues

### 6.1 Console Logging in Production (LOW)

**Current State:**

- Some `console.error` and `console.warn` calls exist
- May leak sensitive information

**Remediation:**

1. Implement structured logging
2. Filter sensitive data from logs
3. Use log levels appropriately

**Priority:** LOW

---

### 6.2 Error Messages Expose Details (LOW)

**Current State:**

- Some API errors return raw error messages
- Stack traces may be exposed

**Remediation:**

1. Implement generic error responses
2. Log details server-side only
3. Return sanitized messages to client

**Priority:** LOW

---

## 7. Remediation Roadmap

### Phase 1: Critical (Immediate)

| Issue             | Action                  | Effort   |
| ----------------- | ----------------------- | -------- |
| No Authentication | Implement NextAuth.js   | 3-5 days |
| Admin Unprotected | Add middleware + guards | 1 day    |

### Phase 2: High Priority (Next Sprint)

| Issue         | Action                 | Effort |
| ------------- | ---------------------- | ------ |
| Rate Limiting | Add Upstash ratelimit  | 1 day  |
| Token Storage | Improve key management | 2 days |
| LaTeX GDPR    | Self-host compilation  | 3 days |

### Phase 3: Medium Priority (Future Sprint)

| Issue               | Action                | Effort |
| ------------------- | --------------------- | ------ |
| Security Headers    | Configure CSP, HSTS   | 1 day  |
| PKCE Implementation | Update OAuth flows    | 2 days |
| Private Blob URLs   | Implement signed URLs | 1 day  |

### Phase 4: Low Priority (Technical Debt)

| Issue               | Action              | Effort  |
| ------------------- | ------------------- | ------- |
| Dependency Scanning | Add npm audit to CI | 0.5 day |
| Structured Logging  | Implement logger    | 1 day   |
| Data Retention      | GDPR compliance     | 2 days  |

---

## 8. Compliance Checklist

### GDPR Readiness

- [ ] Data Processing Agreement for third parties
- [ ] User consent for data collection
- [ ] Data export functionality
- [ ] Account deletion process
- [ ] Privacy policy documentation
- [ ] Cookie consent (if applicable)

### Security Best Practices

- [ ] Authentication implemented
- [ ] Authorization for all routes
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Dependency scanning active
- [ ] Secrets management in place
- [ ] Logging and monitoring
- [ ] Incident response plan

---

## 9. Conclusion

The codebase shows solid engineering practices for an MVP but requires significant security hardening before production scaling. The most critical issues are:

1. **No authentication** - Must be addressed immediately
2. **LaTeX GDPR risk** - Required before EU users
3. **No rate limiting** - Required before public launch

With the recommended remediations, the platform can achieve production-ready security posture.

---

_This audit should be repeated after implementing recommended changes and before any major release._
