# Product Roadmap

This roadmap is the execution-focused companion to the PRD.

- Current release: **v1.2** (in progress)
- Focus: Portfolio polish and simplification

---

## v1.2 — Portfolio Polish

### Milestone 1 — Auth Simplification ✅

**Goal:** Simplify authentication to GitHub OAuth only.

**Deliverables:**

- Remove Google and LinkedIn OAuth providers
- Keep GitHub OAuth for developer-friendly sign-in
- Email/password auth (planned)

**Status:** Complete

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

- Updated README with skills showcase
- Simplified PRD
- Screenshots of key flows

**Status:** In Progress

---

## Future Considerations

These features are out of scope for the portfolio but could be added later:

- Email/password authentication
- PDF export improvements
- Interview calendar integration
- Job board integrations

---

## Notes

- For context and rationale, see the PRD: `docs/PRD.md`.
- This is a portfolio project, not a production SaaS.
