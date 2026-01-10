# Design Inspiration

> v1.3 Design & UX Overhaul reference document

**Last Updated:** January 2025  
**Stack:** Next.js 16, TailwindCSS 4, Shadcn/ui  
**Design Philosophy:** Nordic minimalism meets modern SaaS

---

## Table of Contents

1. [Design References](#design-references)
2. [Typography System](#typography-system)
3. [Color System](#color-system)
4. [Component Patterns](#component-patterns)
5. [Interaction Patterns](#interaction-patterns)
6. [Implementation Checklist](#implementation-checklist)

---

## Design References

### Primary Inspirations

| Product          | What to Learn                               | Reference                                    |
| ---------------- | ------------------------------------------- | -------------------------------------------- |
| **Vercel/Geist** | Typography, color scales, design tokens     | [vercel.com/geist](https://vercel.com/geist) |
| **Linear**       | Dark theme, sidebar navigation, issue cards | [linear.app](https://linear.app)             |
| **Raycast**      | Command palette, keyboard-first UX          | [raycast.com](https://raycast.com)           |
| **Radix UI**     | Accessible components, color philosophy     | [radix-ui.com](https://radix-ui.com)         |

### Design Systems to Study

| System              | Focus Area                   | URL                                   |
| ------------------- | ---------------------------- | ------------------------------------- |
| Geist Design System | Complete reference           | https://vercel.com/geist/introduction |
| Radix Colors        | 12-step color scales         | https://www.radix-ui.com/colors       |
| Shadcn/ui           | Component patterns           | https://ui.shadcn.com                 |
| Vercel Guidelines   | Web interface best practices | https://vercel.com/design/guidelines  |

---

## Typography System

### Font: Geist

**Geist Sans** and **Geist Mono** are Vercel's open-source typefaces designed specifically for developers and modern interfaces.

```bash
npm install geist
```

#### Configuration (Next.js)

```typescript
// app/layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

#### Tailwind Configuration

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
  mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
}
```

### Type Scale (Geist Pattern)

Based on Geist's typography system with three categories:

#### Headings (Single-line, display text)

| Token             | Size | Weight | Line Height | Usage           |
| ----------------- | ---- | ------ | ----------- | --------------- |
| `text-heading-32` | 32px | 600    | 1.2         | Page titles     |
| `text-heading-24` | 24px | 600    | 1.25        | Section headers |
| `text-heading-20` | 20px | 600    | 1.3         | Card titles     |
| `text-heading-16` | 16px | 600    | 1.4         | Small headings  |

#### Labels (UI elements, buttons, navigation)

| Token           | Size | Weight | Line Height | Usage                       |
| --------------- | ---- | ------ | ----------- | --------------------------- |
| `text-label-16` | 16px | 500    | 1           | Large buttons               |
| `text-label-14` | 14px | 500    | 1           | Default buttons, menu items |
| `text-label-13` | 13px | 500    | 1           | Secondary labels, tabs      |
| `text-label-12` | 12px | 500    | 1           | Badges, small labels        |

#### Copy (Multi-line, body text)

| Token          | Size | Weight | Line Height | Usage                       |
| -------------- | ---- | ------ | ----------- | --------------------------- |
| `text-copy-16` | 16px | 400    | 1.6         | Primary body text           |
| `text-copy-14` | 14px | 400    | 1.5         | Secondary body text         |
| `text-copy-13` | 13px | 400    | 1.5         | Compact views, descriptions |
| `text-copy-12` | 12px | 400    | 1.5         | Captions, helper text       |

### Font Features

```css
/* Tabular numbers for data alignment */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Monospace for code, IDs, technical content */
.font-mono {
  font-family: var(--font-geist-mono);
}
```

---

## Color System

### Nordic Palette Philosophy

Our color system follows Nordic design principles:

- **Cool undertones** (Slate gray scale)
- **High contrast** for accessibility
- **Muted accents** that feel calm, not aggressive
- **Semantic meaning** through consistent color usage

### Gray Scale: Slate

Using Slate (blue undertone) for a cool, Nordic feel:

| Step      | Hex       | HSL         | Usage                  |
| --------- | --------- | ----------- | ---------------------- |
| slate-50  | `#f8fafc` | 210 40% 98% | Subtle backgrounds     |
| slate-100 | `#f1f5f9` | 210 40% 96% | Card backgrounds       |
| slate-200 | `#e2e8f0` | 214 32% 91% | Borders (subtle)       |
| slate-300 | `#cbd5e1` | 213 27% 84% | Borders (default)      |
| slate-400 | `#94a3b8` | 215 20% 65% | Placeholder text       |
| slate-500 | `#64748b` | 215 16% 47% | Secondary text         |
| slate-600 | `#475569` | 215 19% 35% | Body text              |
| slate-700 | `#334155` | 215 25% 27% | Headings (dark mode)   |
| slate-800 | `#1e293b` | 217 33% 17% | Card bg (dark mode)    |
| slate-900 | `#0f172a` | 222 47% 11% | Background (dark mode) |
| slate-950 | `#020617` | 229 84% 5%  | Darkest background     |

### Accent Colors

#### Primary: Fjord Blue (Nordic waters)

| Step      | Hex       | Usage                |
| --------- | --------- | -------------------- |
| fjord-50  | `#eff6ff` | Hover backgrounds    |
| fjord-100 | `#dbeafe` | Selected state bg    |
| fjord-500 | `#3b82f6` | Interactive elements |
| fjord-600 | `#2563eb` | Primary buttons      |
| fjord-700 | `#1d4ed8` | Pressed state        |

#### Success: Forest Green (Nordic forests)

| Step       | Hex       | Usage              |
| ---------- | --------- | ------------------ |
| forest-50  | `#f0fdf4` | Success bg         |
| forest-500 | `#22c55e` | Success indicators |
| forest-600 | `#16a34a` | Success buttons    |

#### Warning: Amber (NEW)

| Step      | Hex       | Usage              |
| --------- | --------- | ------------------ |
| amber-50  | `#fffbeb` | Warning bg         |
| amber-500 | `#f59e0b` | Warning indicators |
| amber-600 | `#d97706` | Warning emphasis   |

#### Error: Clay Red

| Step     | Hex       | Usage            |
| -------- | --------- | ---------------- |
| clay-50  | `#fef2f2` | Error bg         |
| clay-500 | `#ef4444` | Error indicators |
| clay-600 | `#dc2626` | Error emphasis   |

### Application Status Colors

Semantic colors for job application tracking:

| Status       | Color      | Hex       | CSS Variable            |
| ------------ | ---------- | --------- | ----------------------- |
| Applied      | Blue       | `#3b82f6` | `--status-applied`      |
| Interviewing | Violet     | `#8b5cf6` | `--status-interviewing` |
| Offered      | Green      | `#22c55e` | `--status-offered`      |
| Rejected     | Red (soft) | `#f87171` | `--status-rejected`     |
| Withdrawn    | Gray       | `#94a3b8` | `--status-withdrawn`    |

### Dark Mode Strategy

```css
:root {
  --background: 0 0% 100%; /* white */
  --foreground: 222 47% 11%; /* slate-900 */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 221 83% 53%; /* fjord-600 */
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222 47% 11%; /* slate-900 */
  --foreground: 210 40% 98%; /* slate-50 */
  --card: 217 33% 17%; /* slate-800 */
  --card-foreground: 210 40% 98%;
  --primary: 217 91% 60%; /* fjord-500 */
  --primary-foreground: 222 47% 11%;
}
```

---

## Component Patterns

### Cards (Linear-style)

```
┌─────────────────────────────────────────────────┐
│  🏢 Company Name                    Applied ●   │
│  ───────────────────────────────────────────── │
│  Senior Software Engineer                       │
│  📍 Remote  •  💰 $150K-180K  •  📅 Jan 5      │
│                                                 │
│  [View]  [Edit]  [Archive]                      │
└─────────────────────────────────────────────────┘
```

**Characteristics:**

- Subtle border (`slate-200`)
- Hover: slight shadow + border color change
- Status badge in top-right
- Action buttons appear on hover (desktop)

### Navigation (Sidebar)

```
┌──────────────────────┐
│  🎯 Job Assistant    │
├──────────────────────┤
│  📊 Dashboard        │  ← Active: bg-slate-100, text-slate-900
│  👤 Profile          │
│  🔍 Analyze          │
│  📋 Tracker          │
├──────────────────────┤
│  ⚙️ Settings         │
└──────────────────────┘
```

**Characteristics:**

- Icons + labels for clarity
- Active state: background highlight + font weight
- Hover: subtle background change
- Collapsible on mobile

### Command Palette (Raycast/GitHub-style)

```
┌─────────────────────────────────────────────────┐
│  🔍 Type a command or search...            ⌘K  │
├─────────────────────────────────────────────────┤
│  Navigation                                     │
│    📊 Go to Dashboard                      g d  │
│    👤 Go to Profile                        g p  │
│    🔍 Go to Analyze                        g a  │
│    📋 Go to Tracker                        g t  │
├─────────────────────────────────────────────────┤
│  Actions                                        │
│    ➕ New Application                           │
│    📄 Analyze Job URL                           │
│    📤 Upload CV                                 │
├─────────────────────────────────────────────────┤
│  Press ? for keyboard shortcuts                 │
└─────────────────────────────────────────────────┘
```

**Keyboard Shortcuts (GitHub-style):**

- `⌘K` / `Ctrl+K` — Open command palette
- `?` — Show keyboard shortcuts help
- `Esc` — Close

### Stats Cards (Dashboard)

```
┌─────────────────────────────────────────────────┐
│  Applications This Week                         │
│                                                 │
│       12        ↑ 3 from last week             │
│                                                 │
│  ████████░░░░░░░░░░░  Goal: 20                 │
└─────────────────────────────────────────────────┘
```

### Forms

**Input Fields:**

- Top-aligned labels
- Clear placeholder text (ending with `...`)
- Error messages below field
- Focus ring using primary color

**Buttons:**
| Type | Usage | Style |
|------|-------|-------|
| Primary | Main CTA (1 per view) | Solid, fjord-600 |
| Secondary | Alternative actions | Outlined |
| Ghost | Cancel, navigation | Text only |
| Destructive | Delete actions | clay-600 |

---

## Interaction Patterns

### Vercel Web Interface Guidelines (Key Takeaways)

#### Keyboard

- **Keyboard works everywhere** — All flows are keyboard-operable
- **Clear focus** — Visible focus ring on every focusable element
- **Enter submits** — In single-input forms

#### Loading States

- **Loading buttons** — Show spinner, keep original label
- **Minimum loading duration** — 300-500ms to avoid flicker
- **Skeleton loaders** — Mirror final content layout exactly

#### Forms

- **Never block paste** — Always allow pasting in inputs
- **Don't pre-disable submit** — Allow submitting to show validation
- **Error placement** — Show next to field, focus first error on submit

#### Content

- **No dead ends** — Every screen offers a next step
- **All states designed** — Empty, sparse, dense, error
- **Tabular numbers** — Use `font-variant-numeric: tabular-nums` for data

#### Design

- **Layered shadows** — Mimic ambient + direct light
- **Nested radii** — Child radius ≤ parent radius
- **Interactions increase contrast** — Hover/active have more contrast

---

## Implementation Checklist

### Commit 1: Design Inspiration ✓

- [x] Create docs/design/INSPIRATION.md

### Commit 2: Typography System

- [ ] Install Geist font (`npm i geist`)
- [ ] Configure GeistSans/GeistMono in layout.tsx
- [ ] Add CSS variables for type scale
- [ ] Update Tailwind fontFamily config
- [ ] Run Lighthouse baseline comparison
- [ ] Add font loading tests

### Commit 3: Color System

- [ ] Add warning scale (amber) to globals.css
- [ ] Ensure Slate gray usage throughout
- [ ] Add --status-\* CSS variables
- [ ] Update shadcn theme variables
- [ ] Add CSS variable existence tests

### Commit 4: Shadcn Components

- [ ] Install: dropdown-menu, tabs, avatar
- [ ] Install: skeleton, tooltip, progress
- [ ] Install: command (for palette)
- [ ] Add render tests for each

### Commit 5: Command Palette

- [ ] Create components/command-palette.tsx
- [ ] Implement ⌘K/Ctrl+K trigger
- [ ] Add navigation commands
- [ ] Add action commands
- [ ] Create ? shortcuts help modal
- [ ] Add keyboard handling tests

### Commit 6: Dark Mode Toggle

- [ ] Install next-themes
- [ ] Create components/theme-toggle.tsx
- [ ] Add to settings page
- [ ] Add to navbar
- [ ] Persist user preference
- [ ] Add theme switching tests

### Commit 7: Navbar & Cards

- [ ] Add navigation icons
- [ ] Implement active route indication
- [ ] Replace gray-_ with slate-_
- [ ] Add card hover effects
- [ ] Add status badges to tracker
- [ ] Add related tests

---

## Resources

### Fonts

| Font             | Source                                                      |
| ---------------- | ----------------------------------------------------------- |
| Geist Sans/Mono  | `npm i geist` or [vercel.com/font](https://vercel.com/font) |
| Inter (fallback) | [Google Fonts](https://fonts.google.com/specimen/Inter)     |
| JetBrains Mono   | [jetbrains.com/mono](https://www.jetbrains.com/lp/mono/)    |

### Color Tools

| Tool            | URL                                             |
| --------------- | ----------------------------------------------- |
| Radix Colors    | https://www.radix-ui.com/colors                 |
| Tailwind Colors | https://tailwindcss.com/docs/customizing-colors |
| Realtime Colors | https://www.realtimecolors.com                  |
| APCA Contrast   | https://apcacontrast.com                        |

### Design Inspiration

| Source   | Focus                   |
| -------- | ----------------------- |
| Mobbin   | UI patterns, user flows |
| Dribbble | Visual inspiration      |
| Awwwards | Award-winning sites     |

---

_This document serves as the single source of truth for v1.3 design decisions._
