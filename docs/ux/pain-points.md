# Pain Points Analysis

This document catalogs current UI/UX issues identified through user journey mapping.

**Last Updated:** Sprint 11 (December 2024)

---

## ✅ Resolved Issues

### 1. No Filtering/Sorting in Tracker ✅

**Status:** RESOLVED (Sprint 10)

**Location:** `/tracker`

**Solution Implemented:** Added status filter tabs and search functionality.

---

### 2. No Actionable Advice for Skill Gaps ✅

**Status:** RESOLVED (Sprint 11)

**Location:** `/analyze` results

**Solution Implemented:** Added "💡 Quick wins" section with actionable tips for each skill gap. Tips are context-aware for common technologies (Python, AWS, Docker, etc.) and provide specific learning resources.

---

### 3. No Drag-and-Drop Upload ✅

**Status:** RESOLVED (Sprint 11)

**Location:** `/cv`

**Solution Implemented:** Added FileUpload component with drag-and-drop zone in the CV Editor empty state. Shows visual feedback during drag and upload progress.

---

### 5. LaTeX Editor Intimidating ✅

**Status:** RESOLVED (Sprint 11)

**Location:** `/cv`

**Solution Implemented:** Added "Advanced Mode" toggle. By default, users see a simple PDF preview with upload/download. Advanced Mode reveals the LaTeX editor, AI Assistant, and ATS checker for power users.

---

## Medium Issues (🟡)

### 4. No Extraction Progress Indication

**Location:** `/profile` CV upload

**Problem:** User sees spinner but no sense of progress or what's happening.

**Impact:**

- Anxiety during wait
- Uncertainty if it's working
- Abandonment if slow

**Solution Options:**

- Show steps: "Uploading → Reading → Extracting → Done"
- Estimated time remaining
- Partial results as they come

---

- Feature feels inaccessible
- Fear of breaking things
- Underutilized AI modification

**Solution Options:**

- Add "Simple Mode" that hides LaTeX
- Form-based editing for common fields
- Better AI prompt suggestions
- Inline help/tooltips

---

### 6. No Clear User State

**Location:** All pages

**Problem:** App doesn't remember/show user context between sessions.

**Impact:**

- Landing page same for new vs returning users
- No "welcome back" experience
- Have to navigate to see what's new

**Solution Options:**

- Dashboard as home for returning users
- Recent activity on landing
- "Continue where you left off" prompt

---

## Low Issues (🟢)

### 7. Dense Application Cards

**Location:** `/tracker`

**Problem:** Each application card shows a lot of info at once.

**Solution Options:**

- Progressive disclosure (expand on click)
- Visual status indicators (color dots)
- Condensed view option

---

### 8. Limited Dashboard Insights

**Location:** `/dashboard`

**Problem:** Shows basic counts but no trends or actionable insights.

**Solution Options:**

- Add charts (applications over time)
- Success rate by role type
- Follow-up reminders
- Weekly summary

---

### 9. No Confirmation for Destructive Actions

**Location:** Various (delete application, etc.)

**Problem:** No "are you sure?" for irreversible actions.

**Solution Options:**

- Confirmation dialog
- Undo capability
- Soft delete with recovery

---

## Summary Matrix

| Issue                  | Location   | Severity  | Effort | Status      |
| ---------------------- | ---------- | --------- | ------ | ----------- |
| No tracker filtering   | /tracker   | 🔴 High   | Medium | ✅ RESOLVED |
| No gap advice          | /analyze   | 🔴 High   | Medium | ✅ RESOLVED |
| No drag-drop upload    | /cv        | 🟡 Medium | Low    | ✅ RESOLVED |
| LaTeX intimidating     | /cv        | 🟡 Medium | High   | ✅ RESOLVED |
| No extraction progress | /profile   | 🟡 Medium | Medium | Backlog     |
| No user state          | All        | 🟡 Medium | Medium | Backlog     |
| Dense cards            | /tracker   | 🟢 Low    | Low    | Backlog     |
| Limited dashboard      | /dashboard | 🟢 Low    | Medium | Backlog     |
| No confirmations       | Various    | 🟢 Low    | Low    | Backlog     |

---

## Sprint 11 Summary

**Resolved in Sprint 11:**

- ✅ Actionable skill gap advice with context-aware tips
- ✅ Drag-and-drop CV upload
- ✅ Advanced Mode toggle for CV Editor (LaTeX hidden by default)
- ✅ Mobile-responsive UX Planner
- ✅ 44px touch targets for accessibility
- ✅ UX Implementation tracking system

---

## Next Steps

1. ~~Address P1 issues in next sprint~~ ✅ DONE
2. Continue with remaining P2 issues (extraction progress, user state)
3. P3 issues as time permits
4. Validate with user testing after changes
