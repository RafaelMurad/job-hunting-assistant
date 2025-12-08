# User Journeys

This document maps the end-to-end user flows for each major feature.

---

## Journey 1: First-Time User Setup

### Goal

New user uploads CV and sets up their profile.

### Flow

```
Landing Page → Profile Page → Upload CV → AI Extraction → Review/Edit → Save
```

### Steps

| Step | User Action             | System Response              | Pain Points               |
| ---- | ----------------------- | ---------------------------- | ------------------------- |
| 1    | Visits landing page     | Shows value proposition      | ⚠️ No clear CTA hierarchy |
| 2    | Clicks "Get Started"    | Navigates to /profile        |                           |
| 3    | Uploads CV (PDF/DOCX)   | Shows upload progress        | ⚠️ No drag-and-drop       |
| 4    | Waits for AI extraction | Spinner, then populates form | ⚠️ No progress indication |
| 5    | Reviews extracted data  | Form pre-filled              | ⚠️ Hard to spot errors    |
| 6    | Edits if needed         | Form updates                 |                           |
| 7    | Saves profile           | Success toast                | ✅ Works well             |

### Emotions

- **Start:** Curious, hopeful
- **During extraction:** Anxious (will it work?)
- **After:** Relieved or frustrated (depending on accuracy)

### Opportunities

- Add drag-and-drop upload
- Show extraction progress (parsing → extracting → done)
- Highlight AI-extracted fields for easy review

---

## Journey 2: Job Analysis

### Goal

User analyzes a job posting to see how well they match.

### Flow

```
Analyze Page → Paste Job Description → Submit → View Results → Generate Cover Letter
```

### Steps

| Step | User Action                    | System Response          | Pain Points                    |
| ---- | ------------------------------ | ------------------------ | ------------------------------ |
| 1    | Navigates to /analyze          | Shows empty textarea     |                                |
| 2    | Pastes job description         | Text appears             | ⚠️ Large textarea intimidating |
| 3    | Clicks "Analyze"               | Loading state            | ⚠️ No estimated time           |
| 4    | Views match score              | Score + breakdown        | ✅ Good visualization          |
| 5    | Reviews skills match/gaps      | Lists displayed          | ⚠️ No actionable advice        |
| 6    | Clicks "Generate Cover Letter" | Loading → letter appears | ✅ Works well                  |
| 7    | Copies or saves                | Toast confirmation       |                                |

### Emotions

- **Start:** Curious about fit
- **Seeing score:** Validated or disappointed
- **Cover letter:** Relieved (didn't have to write it)

### Opportunities

- Add "quick paste" button for clipboard
- Show estimated analysis time
- Provide actionable tips for gaps

---

## Journey 3: Application Tracking

### Goal

User tracks their job applications and updates status.

### Flow

```
Tracker Page → View Applications → Update Status → Add Notes → Check Dashboard
```

### Steps

| Step | User Action           | System Response        | Pain Points             |
| ---- | --------------------- | ---------------------- | ----------------------- |
| 1    | Navigates to /tracker | Shows application list | ⚠️ No sorting/filtering |
| 2    | Scans applications    | Table/cards displayed  | ⚠️ Dense information    |
| 3    | Clicks on application | Details expand/modal   |                         |
| 4    | Updates status        | Dropdown changes       | ✅ Simple               |
| 5    | Adds notes            | Text saved             |                         |
| 6    | Checks /dashboard     | Stats overview         | ⚠️ Limited insights     |

### Emotions

- **Viewing list:** Overwhelmed if many applications
- **Updating:** Sense of progress
- **Dashboard:** Wants motivation/insights

### Opportunities

- Add filtering by status
- Kanban view option
- Richer dashboard with trends

---

## Journey 4: CV Editor (Premium)

### Goal

User edits their CV using templates and downloads PDF.

### Flow

```
CV Page → Upload/Load CV → Choose Template → Edit LaTeX → Preview → Download PDF
```

### Steps

| Step | User Action                 | System Response        | Pain Points               |
| ---- | --------------------------- | ---------------------- | ------------------------- |
| 1    | Navigates to /cv            | Shows editor           |                           |
| 2    | Uploads CV or uses existing | AI extracts content    | ⚠️ Same as profile upload |
| 3    | Selects template            | Instant preview update | ✅ Great feature          |
| 4    | Edits in LaTeX editor       | Live preview           | ⚠️ LaTeX is intimidating  |
| 5    | Uses AI to modify           | Updates LaTeX          | ✅ Helpful                |
| 6    | Downloads PDF               | File downloads         | ⚠️ Compilation can fail   |

### Emotions

- **Start:** Wants professional CV
- **Editing:** Frustrated if unfamiliar with LaTeX
- **Download:** Satisfied or frustrated (compile errors)

### Opportunities

- Add WYSIWYG mode (hide LaTeX)
- Better error messages for compile failures
- Template preview gallery

---

## Journey 5: Returning User

### Goal

User returns to check applications or analyze new job.

### Flow

```
Landing Page → Dashboard → Quick Action (Analyze/Tracker/CV)
```

### Steps

| Step | User Action            | System Response | Pain Points          |
| ---- | ---------------------- | --------------- | -------------------- |
| 1    | Returns to site        | Landing page    | ⚠️ No "welcome back" |
| 2    | Navigates to dashboard | Stats shown     |                      |
| 3    | Takes action           | Depends on goal |                      |

### Opportunities

- Remember returning users
- Show recent activity on landing
- Quick actions from dashboard

---

## Summary of Key Pain Points

| Area       | Issue                    | Impact             | Priority  |
| ---------- | ------------------------ | ------------------ | --------- |
| Upload     | No drag-and-drop         | Friction           | 🟡 Medium |
| Extraction | No progress indication   | Anxiety            | 🟡 Medium |
| Analysis   | No actionable gap advice | Missed opportunity | 🔴 High   |
| Tracker    | No filtering/sorting     | Overwhelm          | 🔴 High   |
| CV Editor  | LaTeX intimidating       | Accessibility      | 🟡 Medium |
| Navigation | No clear user state      | Confusion          | 🟡 Medium |
