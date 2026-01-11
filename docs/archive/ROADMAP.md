# Product Roadmap

This roadmap is the execution-focused companion to the PRD.

- Current release: **v1.2** (in progress)
- Focus: Portfolio polish and simplification

---

## v1.2 — Portfolio Polish

### Milestone 1 — Neon Auth Migration ✅

**Goal:** Replace NextAuth.js with Neon Auth for simpler, more powerful authentication.

**Deliverables:**

- ✅ Migrate from NextAuth.js v5 to Neon Auth
- ✅ Add email/password authentication (built-in)
- ✅ Update auth UI pages (`/auth/sign-in`, `/auth/sign-up`)
- ✅ Replace custom proxy.ts with `neonAuthMiddleware`
- ✅ Update tRPC context for Neon Auth sessions
- ✅ Add ThemeProvider + navigate/Link for proper routing
- ✅ Update E2E tests for new auth flow

**Status:** Complete (PR #120)

---

### Milestone 2 — AI Simplification ✅

**Goal:** Use only free-tier AI models.

**Deliverables:**

- Remove OpenAI and Claude (paid) providers
- Keep Gemini 2.5 Flash (free)
- Keep OpenRouter free models (Gemma, Nova, Mistral)

**Status:** Complete

---

### Milestone 3 — UI Cleanup ✅

**Goal:** Clean navigation for portfolio demo.

**Deliverables:**

- Hide Admin from navigation (accessible by URL)
- Simplify Settings page (account only)
- Remove integrations UI

**Status:** Complete

---

### Milestone 4 — CV Editor Polish (Planned)

**Goal:** Make the LaTeX CV editor the star feature.

**Deliverables:**

- Add syntax highlighting (Monaco or CodeMirror)
- Improve error messages for LaTeX compilation
- Better mobile experience

**Status:** Planned

---

### Milestone 5 — Documentation (In Progress)

**Goal:** Portfolio-focused documentation.

**Deliverables:**

- ✅ Updated README with skills showcase
- ✅ Simplified PRD
- ✅ Updated copilot-instructions with auth patterns
- Screenshots of key flows

**Status:** In Progress

---

## Future Considerations

These features are out of scope for the portfolio but could be added later:

- PDF export improvements
- Interview calendar integration
- Job board integrations
- Account data export/deletion (GDPR)

---

## Notes

- For context and rationale, see the PRD: `docs/PRD.md`.
- This is a portfolio project, not a production SaaS.
