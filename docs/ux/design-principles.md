# Design Principles

Guidelines for the UI revamp based on UX research.

---

## Core Principles

### 1. Progressive Disclosure

**"Show only what's needed, when it's needed."**

- Start simple, reveal complexity on demand
- Collapse advanced options behind "More" or settings
- Don't overwhelm on first visit

**Examples:**

- LaTeX editor: Hide code, show form by default
- Tracker: Summary cards, expand for details
- Analysis: Match score first, drill into breakdown

---

### 2. Guide the Journey

**"Always show the next step."**

- Users should never wonder "what now?"
- Each page should suggest the natural next action
- Celebrate completions and progress

**Examples:**

- After profile save: "Ready to analyze a job?"
- After analysis: "Save to Tracker" or "Generate Cover Letter"
- Empty tracker: "Start by analyzing your first job"

---

### 3. Reduce Anxiety

**"Show progress and explain waits."**

- AI operations take time; explain what's happening
- Show estimated time for long operations
- Provide fallbacks and error recovery

**Examples:**

- CV extraction: "Reading document... Extracting info... Almost done"
- Compilation: "Generating PDF (10-15 seconds)"
- Errors: Clear message + suggested action

---

### 4. Mobile-First Layouts

**"Design for thumb, scale up for mouse."**

- Touch targets 44px minimum
- Key actions reachable with one hand
- Tables → Cards on mobile
- Consider bottom navigation

---

### 5. Visual Hierarchy

**"Make the important things obvious."**

- Primary action should be visually dominant
- Use color sparingly for meaning
- Consistent iconography throughout

**Nordic Design Alignment:**

- Generous whitespace
- Subtle shadows for depth
- Fjord blue for primary actions
- Forest green for success states

---

## Component Guidelines

### Buttons

| Type        | Use Case              | Visual            |
| ----------- | --------------------- | ----------------- |
| Primary     | Main CTA (1 per view) | Solid, Fjord blue |
| Secondary   | Alternative actions   | Outlined          |
| Ghost       | Navigation, cancel    | Text only         |
| Destructive | Delete, remove        | Red accent        |

### Cards

- Consistent border-radius (8px)
- Subtle shadow on hover
- Click entire card, not just link
- Clear visual separation

### Forms

- Labels above inputs (not placeholder-only)
- Inline validation where possible
- Clear error states with messages
- Group related fields

### Loading States

- Skeleton screens for known layouts
- Spinner with text for operations
- Progress bar for multi-step
- Never leave user guessing

---

## Accessibility

### Requirements

- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader compatible
- Color not sole indicator

### Checklist

- [ ] All interactive elements focusable
- [ ] Focus visible styling
- [ ] Alt text for images
- [ ] ARIA labels where needed
- [ ] 4.5:1 contrast ratio minimum
- [ ] Error messages linked to inputs

---

## Animation & Motion

### Principles

- Subtle, purposeful animations
- Respect `prefers-reduced-motion`
- Use to indicate state changes
- Never delay critical actions

### Suggested Animations

| Action          | Animation       | Duration   |
| --------------- | --------------- | ---------- |
| Page transition | Fade            | 150ms      |
| Modal open      | Scale up + fade | 200ms      |
| Card hover      | Subtle lift     | 100ms      |
| Success         | Check bounce    | 300ms      |
| Loading         | Pulse           | Continuous |

---

## Typography

### Hierarchy

| Level | Use              | Size (Desktop) |
| ----- | ---------------- | -------------- |
| H1    | Page title       | 32px           |
| H2    | Section heading  | 24px           |
| H3    | Card heading     | 18px           |
| Body  | Main content     | 16px           |
| Small | Secondary info   | 14px           |
| Micro | Labels, metadata | 12px           |

### Rules

- Line height: 1.5 for body text
- Max line length: 65-75 characters
- Consistent font weights (400, 500, 700)

---

## Color Usage

Based on Nordic Design System:

| Color        | Use Case               | Hex     |
| ------------ | ---------------------- | ------- |
| Fjord Blue   | Primary actions, links | #3B82F6 |
| Forest Green | Success, positive      | #22C55E |
| Clay Amber   | Warning, attention     | #F59E0B |
| Nordic Gray  | Neutral, borders       | #6B7280 |
| Snow White   | Backgrounds            | #F9FAFB |
| Charcoal     | Text                   | #1F2937 |

### Rules

- Never rely solely on color for meaning
- Use color consistently across the app
- Ensure sufficient contrast

---

## Spacing System

Based on 4px grid:

| Token | Value | Use                |
| ----- | ----- | ------------------ |
| xs    | 4px   | Tight spacing      |
| sm    | 8px   | Related elements   |
| md    | 16px  | Standard spacing   |
| lg    | 24px  | Section separation |
| xl    | 32px  | Major sections     |
| 2xl   | 48px  | Page margins       |

---

## Implementation Priority

### P1: Foundation

- Loading states for all AI operations
- "Next step" prompts
- Mobile navigation

### P2: Polish

- Drag-and-drop upload
- Tracker filtering
- Skeleton screens

### P3: Delight

- Micro-animations
- Success celebrations
- Keyboard shortcuts
