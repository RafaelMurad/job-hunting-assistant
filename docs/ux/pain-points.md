# Pain Points Analysis

This document catalogs current UI/UX issues identified through user journey mapping.

---

## Critical Issues (🔴)

### 1. No Filtering/Sorting in Tracker

**Location:** `/tracker`

**Problem:** Users with many applications can't find specific ones quickly.

**Impact:**

- Overwhelm with growing list
- Time wasted scrolling
- Missed follow-ups

**Solution Options:**

- Add status filter tabs
- Add search box
- Add sort by date/company/score
- Consider Kanban board view

---

### 2. No Actionable Advice for Skill Gaps

**Location:** `/analyze` results

**Problem:** We show skill gaps but don't suggest how to address them.

**Impact:**

- User knows the problem but not the solution
- Missed opportunity to add value
- Cover letter doesn't address gaps

**Solution Options:**

- Add "How to address this" tips
- Suggest learning resources
- Auto-include gap mitigation in cover letter
- Show similar jobs with better match

---

## Medium Issues (🟡)

### 3. No Drag-and-Drop Upload

**Location:** `/profile`, `/cv`

**Problem:** File upload requires clicking button, no visual drop zone.

**Impact:**

- Minor friction
- Feels outdated
- Mobile users unaffected

**Solution Options:**

- Add drop zone with visual feedback
- Show accepted file types
- Add paste from clipboard

---

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

### 5. LaTeX Editor Intimidating

**Location:** `/cv`

**Problem:** Non-technical users see raw LaTeX code.

**Impact:**

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

| Issue                  | Location      | Severity  | Effort | Priority |
| ---------------------- | ------------- | --------- | ------ | -------- |
| No tracker filtering   | /tracker      | 🔴 High   | Medium | P1       |
| No gap advice          | /analyze      | 🔴 High   | Medium | P1       |
| No drag-drop upload    | /profile, /cv | 🟡 Medium | Low    | P2       |
| No extraction progress | /profile      | 🟡 Medium | Medium | P2       |
| LaTeX intimidating     | /cv           | 🟡 Medium | High   | P2       |
| No user state          | All           | 🟡 Medium | Medium | P2       |
| Dense cards            | /tracker      | 🟢 Low    | Low    | P3       |
| Limited dashboard      | /dashboard    | 🟢 Low    | Medium | P3       |
| No confirmations       | Various       | 🟢 Low    | Low    | P3       |

---

## Next Steps

1. Address P1 issues in next sprint
2. Group P2 issues into "Polish" sprint
3. P3 issues as time permits
4. Validate with user testing after changes
