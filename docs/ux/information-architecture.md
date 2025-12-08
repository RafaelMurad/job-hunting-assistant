# Information Architecture

This document defines the site structure and navigation hierarchy.

---

## Current Structure

```
/ (Landing)
├── /profile      - User profile & CV data
├── /analyze      - Job analysis & cover letter
├── /tracker      - Application tracking list
├── /dashboard    - Stats overview
├── /cv           - CV Editor (LaTeX)
└── /admin
    └── /flags    - Feature flags management
```

---

## Navigation Model

### Current: Flat Navigation

All pages accessible from top nav. No hierarchy.

```
[Home] [Profile] [Analyze] [Tracker] [Dashboard] [CV Editor]
```

**Pros:**

- Simple, everything one click away
- No deep nesting

**Cons:**

- Doesn't guide user through workflow
- No sense of "what to do next"
- CV Editor feels disconnected from Profile

---

## Proposed: Workflow-Based Navigation

### Option A: Progressive Workflow

Guide users through the natural flow:

```
Setup (Profile/CV) → Hunt (Analyze) → Track (Applications)
```

**Nav Structure:**

```
[Dashboard] [Setup ▼] [Hunt] [Track]
              ├── Profile
              └── CV Editor
```

### Option B: Two-Mode Navigation

Separate "Setup" mode from "Active Hunting" mode:

```
Mode: Setup           Mode: Hunting
├── Profile          ├── Analyze
├── CV Editor        ├── Tracker
└── Settings         └── Dashboard
```

### Option C: Keep Flat, Add Breadcrumbs

Maintain current structure but add contextual guidance:

```
[Profile] → "Next: Analyze a job to see your match"
[Analyze] → "Save this to your Tracker"
```

---

## Page Purposes

| Page          | Primary Purpose        | Secondary Actions         |
| ------------- | ---------------------- | ------------------------- |
| **Landing**   | Attract, explain value | Direct to Profile         |
| **Profile**   | Store user data for AI | Upload CV, edit info      |
| **Analyze**   | Evaluate job fit       | Generate cover letter     |
| **Tracker**   | Manage applications    | Update status, add notes  |
| **Dashboard** | Overview of progress   | Quick stats, motivation   |
| **CV Editor** | Create/edit CV         | Apply templates, download |

---

## Content Relationships

```
Profile ────────────┐
   │                │
   ▼                ▼
Analyze ───────► Tracker
   │                │
   │                ▼
   └────────────► Dashboard
                    │
CV Editor ◄─────────┘
(Uses same data)
```

**Key Relationships:**

- Profile feeds into Analyze (your skills vs job)
- Analyze creates Tracker entries (save application)
- Tracker feeds Dashboard (stats)
- CV Editor shares data with Profile

---

## Mobile Considerations

### Current Issues

- Horizontal nav overflows
- Tables hard to read
- LaTeX editor unusable

### Proposed Mobile Structure

```
[☰ Menu] [Logo] [Quick Action]

Bottom Nav:
[Dashboard] [Analyze] [Tracker] [More]
```

---

## URL Structure

### Current

```
/                   - Landing
/profile            - Profile
/analyze            - Job analysis
/tracker            - Application list
/dashboard          - Stats
/cv                 - CV Editor
/admin/flags        - Feature flags
```

### Proposed Additions

```
/tracker/[id]       - Single application detail
/cv/templates       - Template gallery
/settings           - User preferences
```

---

## Search & Discovery

### Current

- No search functionality
- No way to find past analyses

### Proposed

- Global search across applications, companies, notes
- Filter by date range, status, score
- Quick filters on Tracker page

---

## Recommendations

### Phase 1: Quick Wins

1. Add "Next Step" prompts on each page
2. Highlight current page in nav
3. Add breadcrumbs where relevant

### Phase 2: Structure Improvements

1. Combine Profile + CV Editor under "Setup"
2. Add single application detail page (/tracker/[id])
3. Mobile-optimized navigation

### Phase 3: Advanced

1. Global search
2. Quick filters
3. Keyboard shortcuts
