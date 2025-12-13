# Product Roadmap

This roadmap is the execution-focused companion to the PRD.

- Current release: **v1.1** (shipped)
- Next release target: **v1.2** (draft)

---

## v1.2 (Draft) — Privacy, Reliability, Polish

### Milestone 1 — Replace LaTeX Third-Party Compiler (GDPR)

**Goal:** Stop sending CV LaTeX to `latexonline.cc` by default.

**Deliverables:**

- Deploy a self-hosted LaTeX compiler service (e.g., Docker on Cloud Run)
- Configure the app to use an environment variable for the compiler base URL
- Document data flow + retention expectations for compilation

**Definition of Done:**

- The compiler endpoint is controlled by us (self-hosted) in production
- Compilation works with the existing CV templates and common CV sizes
- A rollback switch exists (env var) if the self-hosted service is degraded

---

### Milestone 2 — Storage Privacy (CV Files)

**Goal:** Reduce accidental exposure risk for CV uploads/compiled PDFs.

**Deliverables:**

- Move sensitive CV blobs to private access (or equivalent)
- Provide time-limited signed URLs for downloads/previews

**Definition of Done:**

- CV files are not publicly accessible by default
- Users can still view/download their CV from the UI without regressions

---

### Milestone 3 — Security & Abuse Hardening

**Goal:** Ensure the app is safe to expose beyond a single-user portfolio.

**Deliverables:**

- Review all `publicProcedure` usage and lock down anything user-scoped
- Improve rate limiting strategy for distributed/serverless execution (if needed)
- Confirm production fails fast without required secrets (no insecure fallbacks)

**Definition of Done:**

- All user data routes require auth + are scoped to the authenticated user
- Rate limiting is enforced for AI + upload paths in production
- Missing production secrets cause startup/runtime failures rather than insecure defaults

---

### Milestone 4 — UX + Performance Polish

**Goal:** Make the core flow feel effortless on repeat usage.

**Deliverables:**

- Reduce friction in the “upload → extract → edit → analyze” loop
- Tighten UI consistency across pages (design-system audit)
- Bundle size / client JS audit to keep navigation snappy

**Definition of Done:**

- Primary user journey feels consistent and fast on mobile + desktop
- No regressions to existing v1.1 features

---

## v1.3 (Draft) — Enhancements

- Calendar integration for interviews
- Follow-up reminders
- Premium CV editor gating (requires v1.2 LaTeX migration)

---

## Notes

- For context and rationale, see the PRD: `docs/PRD.md`.
- For security backlog framing, see: `docs/SECURITY_AUDIT.md`.
