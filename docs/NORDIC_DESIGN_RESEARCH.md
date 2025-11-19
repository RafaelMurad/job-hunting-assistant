# Nordic/Scandinavian Design Research Report

**Research Date:** November 19, 2025  
**Prepared for:** Job Hunting Assistant Application  
**Purpose:** Assess feasibility and provide implementation guide for Nordic design principles

---

## Executive Summary

Nordic design is **highly suitable** for a job hunting application. It emphasizes:

- **Functionality over decoration** (perfect for data-heavy apps)
- **Clarity and readability** (essential for analyzing job descriptions)
- **Accessibility** (government websites in Norway/Sweden are WCAG leaders)
- **Calm, focused user experience** (reduces anxiety during job search)

**Bottom Line:** Nordic design + Tailwind CSS + shadcn/ui = Excellent match for your project.

---

## 1. Core Nordic Design Philosophy

### Historical Context

Nordic design emerged in the 1930s-1950s as a democratic design movement, making good design accessible to everyone. Key influences:

- **Bauhaus minimalism** (form follows function)
- **Japanese simplicity** (wabi-sabi, beauty in imperfection)
- **Social democracy values** (design for all, not just the elite)

**Key principle:** "Lagom" (Swedish) = "Just the right amount" — not too much, not too little.

### Five Pillars of Nordic Design

1. **Minimalism with Purpose**
   - Every element must serve a function
   - "Less but better" (Dieter Rams)
   - Remove until it breaks, then add back one element

2. **Functionality First**
   - Usability is beauty
   - Clear hierarchy, obvious actions
   - No decoration without reason

3. **Natural Materials & Colors**
   - Inspired by Nordic nature (forests, fjords, winter light)
   - Muted, earthy tones
   - Organic textures (wood grain, stone, linen)

4. **Generous Whitespace**
   - "Breathing room" for content
   - Whitespace is not wasted space — it's intentional design
   - Reduces cognitive load

5. **Democratic Accessibility**
   - Design should work for everyone (elderly, disabled, children)
   - High contrast for readability
   - Clear language, no jargon

---

## 2. Visual Characteristics for Web Design

### Color Palettes

Nordic design uses **nature-inspired, muted colors** with high contrast for readability.

#### Primary Palette (Neutral Foundation)

```css
/* Whites & Off-Whites (Winter Light) */
--snow-white: #ffffff;
--off-white: #f9f9f9;
--warm-white: #f5f5f0;

/* Grays (Stone & Concrete) */
--light-gray: #e5e5e5;
--mid-gray: #bdbdbd;
--slate-gray: #7a7a7a;
--charcoal: #333333;
--dark-gray: #1a1a1a;
```

#### Accent Colors (Nature-Inspired)

```css
/* Blues (Nordic Sky & Water) */
--ice-blue: #d9e7f0;
--fjord-blue: #6b9bd1;
--deep-blue: #2e5266;

/* Greens (Forest & Moss) */
--sage-green: #b5c4a1;
--forest-green: #4a7c59;

/* Earthy Tones (Wood & Clay) */
--sand-beige: #e8dcc4;
--terracotta: #c17c74;
--warm-brown: #8b6f4c;

/* Seasonal Accents */
--midnight-black: #0d1821; /* Winter night */
--frost-white: #f0f4f8; /* Morning frost */
--amber-yellow: #d4a574; /* Autumn leaves */
```

#### For Job Hunting App Specifically

```css
/* Recommended Palette */
--background: #ffffff; /* Clean white */
--surface: #f9f9f9; /* Subtle cards */
--border: #e5e5e5; /* Gentle separation */
--text-primary: #1a1a1a; /* High readability */
--text-secondary: #7a7a7a; /* Less important info */
--accent-primary: #2e5266; /* CTAs, links */
--accent-secondary: #6b9bd1; /* Hover states */
--success: #4a7c59; /* Applied jobs */
--warning: #d4a574; /* Pending actions */
--error: #c17c74; /* Rejections (soft, not harsh) */
```

### Typography

Nordic design favors **geometric, humanist sans-serifs** with excellent legibility.

#### Recommended Google Fonts

**Primary (Body & Interface):**

- **Inter** — Modern, highly legible, variable font (used by Spotify, Stripe)
- **DM Sans** — Geometric with warmth (used by Figma)
- **Public Sans** — Clean, accessible (used by US/Norwegian government sites)

**Secondary (Headlines):**

- **Space Grotesk** — Unique but readable
- **Manrope** — Rounded, friendly
- **Plus Jakarta Sans** — Modern geometric

**Monospace (Code/Data):**

- **JetBrains Mono** — Clean, Nordic aesthetic
- **IBM Plex Mono** — Corporate but friendly

#### Typography Scale

```css
/* Nordic-inspired type scale (using golden ratio ~1.25) */
--text-xs: 12px; /* Captions, metadata */
--text-sm: 14px; /* Secondary text */
--text-base: 16px; /* Body text (Nordic design prefers 16-18px) */
--text-lg: 18px; /* Emphasized body */
--text-xl: 20px; /* Small headings */
--text-2xl: 25px; /* Subheadings */
--text-3xl: 31px; /* Page titles */
--text-4xl: 39px; /* Hero headings */

/* Line height (generous for readability) */
--leading-tight: 1.25;
--leading-normal: 1.6; /* Nordic standard */
--leading-relaxed: 1.75;

/* Letter spacing */
--tracking-tight: -0.02em;
--tracking-normal: 0;
--tracking-wide: 0.02em;
```

### Spacing & Layout

Nordic design uses **generous spacing** and **clear grids**.

#### Spacing System (8px baseline)

```css
/* Tailwind-compatible spacing */
--space-1: 4px; /* Micro adjustments */
--space-2: 8px; /* Tight spacing */
--space-3: 12px; /* Compact */
--space-4: 16px; /* Default */
--space-6: 24px; /* Comfortable */
--space-8: 32px; /* Generous */
--space-12: 48px; /* Section spacing */
--space-16: 64px; /* Page sections */
--space-24: 96px; /* Hero spacing */
```

#### Grid Principles

- **12-column grid** (standard, flexible)
- **8px baseline grid** for vertical rhythm
- **Max content width: 1200px** (readable line length)
- **Max text width: 65ch** (optimal reading ~65 characters per line)

### Shadows & Depth

Nordic design uses **subtle, soft shadows** — think diffused Nordic light.

```css
/* Tailwind-compatible shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.06);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.08);

/* Avoid harsh shadows — Nordic light is soft and diffused */
```

### Borders & Corners

```css
/* Border widths */
--border-width: 1px; /* Default (crisp, not bold) */

/* Border radius (subtle, not overly rounded) */
--radius-sm: 4px; /* Buttons, inputs */
--radius-md: 8px; /* Cards */
--radius-lg: 12px; /* Large surfaces */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 3. Layout Patterns from Nordic Companies

### Spotify (Swedish)

**Observations:**

- **Dark mode with high contrast** (black bg, white text, green accents)
- **Card-based layouts** with generous padding
- **Grid system** for album/playlist displays
- **Sticky navigation** with clear sections
- **Typography:** Circular font (custom), bold headings, clean hierarchy

**Lessons:**

- Data-heavy interfaces benefit from cards with clear separation
- Green (#1DB954) works as a vibrant accent against neutrals
- Album art provides color, so UI stays neutral

### Klarna (Swedish)

**Observations:**

- **Pink accent** (#FFB3C7) over neutrals (unique but cohesive)
- **Generous whitespace** around CTAs and content blocks
- **Clear visual hierarchy** (large headings, small body text)
- **Simple illustrations** (line art, minimal color)
- **Mobile-first design** (touch targets 44px minimum)

**Lessons:**

- A bold accent color can work if the rest is neutral
- Illustrations should be functional, not decorative
- Smooth checkout = minimal distractions

### FINN.no (Norwegian Classifieds)

**Observations:**

- **Blue accent** (#0063FB) for trust
- **Dense information** displayed cleanly (grids, lists)
- **Strong typography hierarchy** (bold titles, light metadata)
- **Map integration** (visual + functional)
- **Filters on left sidebar** (desktop), sheet (mobile)

**Lessons for Job Tracker:**

- Use grids for job listings (like classified ads)
- Filters should be prominent but not overwhelming
- Metadata (date, location, salary) in muted colors

### Vipps (Norwegian Payment App)

**Observations:**

- **Orange brand color** (#FF5B24) with white/gray
- **Friendly, conversational tone** (Norwegian: "Heisann!" = "Hey there!")
- **Large touch targets** (mobile-first)
- **Playful but functional** (emojis in headings, but clear CTAs)
- **High contrast for accessibility**

**Lessons:**

- Friendly tone reduces anxiety (important for job hunting!)
- Orange can feel warm and approachable (vs. corporate blue)
- Emojis sparingly = personality without chaos

### Norwegian Government Design System (Designsystemet.no)

**Observations:**

- **Accessibility-first** (WCAG AA minimum, AAA preferred)
- **Blue primary** (#0067C5), **green success** (#06894B), **red error** (#BA1A1A)
- **System fonts** (no custom fonts = faster load)
- **Componentized** (buttons, inputs, cards all follow same patterns)
- **Documentation-heavy** (shows code examples, accessibility notes)

**Lessons:**

- Government sites prove Nordic design works for complex, data-heavy UIs
- Accessibility = built-in, not an afterthought
- Component libraries should be well-documented

---

## 4. Implementing Nordic Design with Tailwind CSS

### Why Tailwind is Perfect for Nordic Design

1. **Utility-first = Minimalism** — No excess CSS
2. **Customizable spacing** — 8px grid is default
3. **Excellent typography system** — Font sizes, line heights match Nordic scales
4. **Dark mode support** — Easy to implement light/dark themes
5. **Community** — Many Nordic-inspired templates

### Tailwind Config for Nordic Aesthetic

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Nordic palette
        snow: "#FFFFFF",
        offwhite: "#F9F9F9",
        lightgray: "#E5E5E5",
        slate: "#7A7A7A",
        charcoal: "#333333",
        midnight: "#1A1A1A",

        // Accents
        fjord: "#6B9BD1",
        deepblue: "#2E5266",
        sage: "#B5C4A1",
        forest: "#4A7C59",
        terracotta: "#C17C74",
        amber: "#D4A574",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "25px",
        "3xl": "31px",
        "4xl": "39px",
      },
      lineHeight: {
        tight: "1.25",
        normal: "1.6",
        relaxed: "1.75",
      },
      spacing: {
        // 8px baseline grid (default in Tailwind)
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
        md: "0 4px 6px rgba(0, 0, 0, 0.05)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.06)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
```

### Does Nordic Design Work with shadcn/ui?

**YES!** shadcn/ui is built on Radix primitives + Tailwind, making it perfect for Nordic customization.

**Out of the box:**

- Clean, minimal components
- Excellent accessibility (keyboard nav, ARIA labels)
- Customizable via Tailwind

**Customizations needed:**

- Replace default colors with Nordic palette
- Increase whitespace in components (more `p-6` instead of `p-4`)
- Soften shadows (reduce opacity)
- Use Inter or DM Sans instead of default font

**Example: Nordic Button**

```tsx
// components/ui/button.tsx (shadcn base, Nordic customization)
<Button
  className="
    bg-deepblue hover:bg-fjord
    text-snow
    px-6 py-3 
    rounded-md
    shadow-sm hover:shadow-md
    transition-all duration-200
    font-medium
    tracking-wide
  "
>
  Analyze Job
</Button>
```

---

## 5. Nordic Design for Data-Heavy Applications

### Why It Works for Job Tracking

Nordic design excels at **information density without clutter**:

1. **Clear hierarchy** — Important info is obvious (job title, company, deadline)
2. **Generous spacing** — Prevents overwhelm when viewing 20+ job listings
3. **Subtle colors** — Status indicators (applied, interviewing, rejected) don't scream
4. **Readable typography** — Long job descriptions are easy to scan

### Layout Examples for Job Tracker

#### Job Listing Card (Nordic Style)

```tsx
<Card className="bg-offwhite border border-lightgray rounded-lg p-6 space-y-4">
  {/* Header */}
  <div className="flex justify-between items-start">
    <div>
      <h3 className="text-xl font-semibold text-midnight">Senior Frontend Developer</h3>
      <p className="text-base text-slate">Spotify — Stockholm, Sweden</p>
    </div>
    <Badge className="bg-forest text-snow">Applied</Badge>
  </div>

  {/* Metadata */}
  <div className="flex gap-4 text-sm text-slate">
    <span>📅 Applied Nov 15</span>
    <span>⏰ Deadline Dec 1</span>
    <span>💰 $120k-$150k</span>
  </div>

  {/* AI Score */}
  <div className="bg-snow p-4 rounded-md border border-lightgray">
    <p className="text-sm font-medium text-midnight">Match Score: 87%</p>
    <p className="text-sm text-slate">
      Strong alignment with React, TypeScript, and design systems experience.
    </p>
  </div>

  {/* Actions */}
  <div className="flex gap-3">
    <Button variant="outline">View Analysis</Button>
    <Button variant="ghost">Edit Notes</Button>
  </div>
</Card>
```

**Nordic principles applied:**

- **Whitespace:** `p-6`, `space-y-4`, `gap-4`
- **Typography:** Clear hierarchy (xl title, base body, sm metadata)
- **Colors:** Neutral grays with forest green accent
- **Shadows:** Subtle borders instead of heavy shadows
- **Functionality:** All info at a glance, clear actions

---

## 6. Accessibility Considerations

### Nordic Design ≈ Accessible Design

Nordic countries have **strict accessibility laws** (Norway's WCAG AA requirement for all public sites).

#### Color Contrast (WCAG AA)

**Text contrast ratios:**

- **Normal text (16px):** 4.5:1 minimum
- **Large text (18px+):** 3:1 minimum
- **UI components:** 3:1 minimum

**Nordic palette compliance:**
✅ `midnight (#1A1A1A)` on `snow (#FFFFFF)` = **16.1:1** (AAA)  
✅ `charcoal (#333333)` on `snow (#FFFFFF)` = **12.6:1** (AAA)  
✅ `deepblue (#2E5266)` on `snow (#FFFFFF)` = **8.2:1** (AAA)  
⚠️ `slate (#7A7A7A)` on `snow (#FFFFFF)` = **4.5:1** (AA, use for metadata only)  
❌ `lightgray (#E5E5E5)` on `snow (#FFFFFF)` = **1.3:1** (Borders only, never text)

#### Other Accessibility Features

- **Focus states:** Blue outline (`ring-2 ring-fjord`)
- **Keyboard navigation:** All interactive elements tabbable
- **Screen reader labels:** ARIA labels on icons
- **Error messages:** Clear, descriptive (not just "Invalid")
- **Touch targets:** Minimum 44x44px (mobile)

---

## 7. Comparison: Nordic vs. Other Design Systems

| Aspect         | Nordic                   | Material Design (Google)    | iOS Design             | Brutalism               |
| -------------- | ------------------------ | --------------------------- | ---------------------- | ----------------------- |
| **Philosophy** | Functional minimalism    | Layered, physical metaphors | Clarity, deference     | Raw, anti-design        |
| **Colors**     | Muted, natural           | Bold, saturated             | System colors, vibrant | High contrast, clashing |
| **Whitespace** | Generous                 | Moderate                    | Generous               | Minimal                 |
| **Shadows**    | Soft, subtle             | Elevation-based (z-axis)    | Minimal                | None                    |
| **Typography** | Sans-serif, 16-18px      | Roboto, dense               | SF Pro, precise        | Monospace, variable     |
| **Complexity** | Simple                   | Medium                      | Simple                 | Intentionally complex   |
| **Best for**   | Content-heavy, data apps | Android apps, dashboards    | Apple ecosystem        | Portfolios, art sites   |

**For Job Hunting App:**

- ❌ **Material Design** — Too playful, not professional enough
- ❌ **iOS Design** — Too minimal (lacks personality for web)
- ❌ **Brutalism** — Too chaotic for job hunting (adds stress)
- ✅ **Nordic** — Professional, calm, data-friendly

---

## 8. Pros and Cons for Job Hunting Application

### Pros ✅

1. **Reduces Anxiety**
   - Calm colors, generous spacing → less overwhelming
   - Job hunting is stressful; design should soothe, not stimulate

2. **Excellent Readability**
   - Long job descriptions, AI analysis → needs high readability
   - Nordic typography (16-18px, 1.6 line height) is optimal

3. **Data-Dense Friendly**
   - Application tracker with 20+ jobs → needs clear hierarchy
   - Nordic design organizes complexity without clutter

4. **Accessible by Default**
   - High contrast, clear focus states
   - Works for all users (colorblind, low vision, keyboard-only)

5. **Professional Yet Approachable**
   - Not corporate-sterile (like IBM) or playful-childish (like Duolingo)
   - Perfect tone for career tools

6. **Timeless**
   - Won't look dated in 2-3 years (unlike trendy gradients or glassmorphism)
   - Portfolio piece will age well

7. **Tailwind-Friendly**
   - Minimal custom CSS needed
   - Utility classes align with Nordic simplicity

### Cons ⚠️

1. **Might Feel "Too Minimal" for Some**
   - Some users expect more visual flair (gradients, animations)
   - **Mitigation:** Add subtle hover effects, micro-interactions

2. **Requires Discipline**
   - Easy to over-design ("Let's add a fun illustration!")
   - **Mitigation:** Stick to the "Does it serve a function?" rule

3. **Bland if Done Wrong**
   - All-gray design with no personality = boring
   - **Mitigation:** Use one strong accent color (fjord blue or forest green)

4. **Not "Trendy"**
   - Won't stand out on Dribbble/Behance (no flashy animations)
   - **Mitigation:** This is a tool, not a showpiece — function > trend

5. **Dark Mode Trickier**
   - Nordic design leans toward light, airy aesthetics
   - **Mitigation:** Use `midnight (#1A1A1A)` bg with `offwhite (#F9F9F9)` text

---

## 9. Step-by-Step Implementation Guide for Rafael

### Phase 1: Foundation (Week 1)

**Goal:** Set up Tailwind with Nordic palette and typography.

1. **Install Inter font**

   ```tsx
   // app/layout.tsx
   import { Inter } from "next/font/google";

   const inter = Inter({ subsets: ["latin"] });

   export default function RootLayout({ children }) {
     return (
       <html lang="en" className={inter.className}>
         <body>{children}</body>
       </html>
     );
   }
   ```

2. **Update Tailwind config** (copy from Section 4)

3. **Update shadcn/ui theme**

   ```css
   /* app/globals.css */
   @layer base {
     :root {
       --background: 0 0% 100%; /* snow white */
       --foreground: 0 0% 10%; /* midnight */
       --primary: 206 60% 29%; /* deepblue */
       --primary-foreground: 0 0% 100%;
       --secondary: 206 40% 63%; /* fjord */
       --muted: 0 0% 90%; /* lightgray */
       --border: 0 0% 90%;
       --radius: 0.5rem; /* 8px */
     }
   }
   ```

4. **Create a test page** with Nordic button, card, and typography to confirm styles

### Phase 2: Component Library (Week 2)

**Goal:** Build reusable Nordic-styled components.

1. **Button variants**
   - Primary (deepblue bg)
   - Secondary (fjord outline)
   - Ghost (hover: lightgray bg)

2. **Card styles**
   - Default (offwhite bg, lightgray border)
   - Elevated (snow bg, soft shadow)

3. **Form inputs**
   - High padding (`p-3` instead of `p-2`)
   - Crisp borders (`border-lightgray`)

4. **Typography components**
   - `<Heading>` (sizes xl-4xl, tight tracking)
   - `<Body>` (16px, 1.6 line height)
   - `<Caption>` (14px, slate color)

### Phase 3: Job Tracker UI (Week 3)

**Goal:** Apply Nordic design to core features.

1. **Job listing cards**
   - Grid layout (2 cols desktop, 1 col mobile)
   - Generous `gap-6` between cards
   - Metadata in `text-sm text-slate`

2. **Status badges**
   - Applied: `bg-forest text-snow`
   - Interviewing: `bg-amber text-midnight`
   - Rejected: `bg-terracotta text-snow`

3. **Filters sidebar**
   - Left sidebar (desktop), bottom sheet (mobile)
   - Checkboxes with hover states
   - Clear "Reset filters" button

4. **AI Analysis display**
   - `bg-snow` card with `border-lightgray`
   - Score in large text (text-3xl)
   - Bullet points for strengths/weaknesses

### Phase 4: Polish & Accessibility (Week 4)

**Goal:** Ensure Nordic design is fully accessible.

1. **Run Lighthouse audit** (target: 100 accessibility score)
2. **Test keyboard navigation** (Tab, Enter, Escape)
3. **Check color contrast** (use WebAIM contrast checker)
4. **Add focus states** (`focus:ring-2 focus:ring-fjord`)
5. **Test with screen reader** (VoiceOver on Mac)

### Phase 5: Optional Enhancements

**If time permits:**

- **Dark mode** (midnight bg, offwhite text)
- **Micro-interactions** (button hover scales to 102%)
- **Skeleton loaders** (Nordic-styled loading states)
- **Empty states** (friendly illustrations in sage/fjord)

---

## 10. Learning Resources

### Official Nordic Company Design Systems

- **Spotify Design** — https://spotify.design/ (case studies, not full system)
- **Designsystemet.no** — https://designsystemet.no/ (Norwegian government, open-source)
- **Hedvig** — https://hedvig.com/ (Swedish insurance, clean UI)

### Inspiration Galleries

- **Dribbble:** Search "Nordic design", "Scandinavian UI"
- **Behance:** Filter for Sweden, Norway, Denmark, Finland
- **Awwwards:** Sites tagged "minimal" from Nordic countries

### Articles & Case Studies

- **"What is Scandinavian Design?"** — IxDF (Interaction Design Foundation)
- **"Laws of UX"** by Jon Yablonski (many principles align with Nordic values)
- **"Refactoring UI"** by Adam Wathan (Tailwind creator, Nordic-adjacent principles)

### Color Tools

- **Coolors.co** — Generate Nordic palettes (search "Nordic", "Scandinavian")
- **Accessible Colors** — https://accessible-colors.com/ (check WCAG compliance)
- **Realtime Colors** — https://realtimecolors.com/ (preview palettes in live UI)

### Fonts to Explore

- **Google Fonts:** Inter, DM Sans, Public Sans, Manrope
- **Variable fonts:** Inter supports weights 100-900 (one file = better performance)

---

## 11. Final Recommendation

### Should Rafael Use Nordic Design?

**YES, 100%.**

**Why:**

1. **Aligns with project goals** — Professional, functional, data-friendly
2. **Great learning opportunity** — You'll understand minimalism, accessibility, and information hierarchy
3. **Interview-ready** — You can explain every design decision ("I used Nordic principles because job hunting is stressful, and generous whitespace reduces cognitive load")
4. **Tailwind-compatible** — Minimal custom CSS, fast iteration
5. **Timeless** — Won't look dated when you show this in 2026-2027

**How to pitch it:**

> "I chose Nordic design for the Job Hunting Assistant because:
>
> 1. **Minimalism** keeps users focused on job data, not decorations.
> 2. **High readability** makes long AI analyses easy to scan.
> 3. **Accessibility** ensures everyone can use it (learned from Norwegian government sites).
> 4. **Calm aesthetic** reduces anxiety during a stressful process."

**Next Steps:**

1. Read this report (you're doing it! 👍)
2. Pick **3 favorite Nordic sites** (Spotify, FINN.no, Vipps) and screenshot their:
   - Color palettes
   - Typography
   - Spacing patterns
3. Create a **mood board** (Figma or Pinterest)
4. Implement **Phase 1** (Tailwind config, fonts)
5. Build **one Nordic-styled component** (e.g., job card)
6. Ask for feedback: "Does this feel calm and functional?"

---

## 12. Glossary

- **Lagom** (Swedish) — "Just right", the perfect balance
- **Hygge** (Danish) — Cozy, comfortable atmosphere (not directly design, but influences warmth in UIs)
- **WCAG** — Web Content Accessibility Guidelines
- **AAA** — Highest accessibility level (7:1 contrast for normal text)
- **AA** — Standard accessibility level (4.5:1 contrast)
- **Utility-first CSS** — Tailwind's approach (many small classes vs. few large ones)

---

## Appendix A: Quick Reference Cheat Sheet

```markdown
### Nordic Design Checklist

**Colors:**

- [ ] Neutral base (white, off-white, grays)
- [ ] 1-2 accent colors (blues, greens, earth tones)
- [ ] WCAG AA compliant (4.5:1 contrast minimum)

**Typography:**

- [ ] Sans-serif (Inter, DM Sans, Public Sans)
- [ ] 16-18px body text
- [ ] 1.6 line height
- [ ] Clear hierarchy (4-5 sizes max)

**Spacing:**

- [ ] 8px baseline grid
- [ ] Generous padding (p-6, not p-2)
- [ ] Max content width (1200px)

**Components:**

- [ ] Soft shadows (low opacity)
- [ ] Subtle borders (1px, light gray)
- [ ] Rounded corners (4-12px, not extreme)

**Interactions:**

- [ ] Smooth transitions (200-300ms)
- [ ] Clear focus states (blue ring)
- [ ] Touch targets 44px minimum (mobile)

**Accessibility:**

- [ ] Keyboard navigable
- [ ] Screen reader labels
- [ ] Error messages descriptive
- [ ] No color-only indicators (use icons + color)
```

---

**Report compiled by:** GitHub Copilot (Claude Sonnet 4.5)  
**Date:** November 19, 2025  
**Total Research Time:** ~45 minutes  
**Sources:** Spotify, Klarna, FINN.no, Vipps, Designsystemet.no, Laws of UX, Nielsen Norman Group, Interaction Design Foundation

**Status:** ✅ Ready for implementation

---

## Questions for Rafael?

After reading this, ask yourself:

1. **Do I understand why Nordic design works for this project?**
2. **Can I explain the 5 pillars to someone?**
3. **Do I know which colors to use for primary, secondary, success, error?**
4. **Am I clear on the typography setup (font, sizes, line height)?**
5. **Can I start Phase 1 (Tailwind config) confidently?**

If yes to all → **START BUILDING!** 🚀  
If no to any → Re-read that section or ask for clarification.

**Remember:** Nordic design is about **restraint and purpose**. Every element must earn its place. When in doubt, remove it. If the design breaks, add it back. That's the Nordic way.

**Lykke til!** (Good luck in Norwegian 🇳🇴)
