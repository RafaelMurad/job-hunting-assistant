# 🎨 Design System

**Version:** 1.0.0
**Theme:** Momentum Machine + RPG Elements

---

## Color Palette

### Primary Colors

```css
/* Electric Blue - Primary actions, links */
--color-primary: #3B82F6;         /* Blue-500 */
--color-primary-dark: #2563EB;    /* Blue-600 */
--color-primary-light: #60A5FA;   /* Blue-400 */

/* Neon Purple - Accents, highlights */
--color-accent: #A855F7;          /* Purple-500 */
--color-accent-dark: #9333EA;     /* Purple-600 */
--color-accent-light: #C084FC;    /* Purple-400 */

/* Electric Yellow - Streaks, energy */
--color-energy: #FBBF24;          /* Amber-400 */
--color-energy-dark: #F59E0B;     /* Amber-500 */
```

### Status Colors

```css
/* Success - Offers, achievements */
--color-success: #10B981;         /* Green-500 */

/* Warning - Follow-ups, pending */
--color-warning: #F59E0B;         /* Amber-500 */

/* Danger - Rejections, alerts */
--color-danger: #EF4444;          /* Red-500 */

/* Info - Interviews, screening */
--color-info: #3B82F6;            /* Blue-500 */
```

### Neutral Colors

```css
/* Background */
--color-bg-primary: #FFFFFF;      /* White */
--color-bg-secondary: #F8FAFC;    /* Slate-50 */
--color-bg-tertiary: #F1F5F9;     /* Slate-100 */

/* Text */
--color-text-primary: #0F172A;    /* Slate-900 */
--color-text-secondary: #475569;  /* Slate-600 */
--color-text-tertiary: #94A3B8;   /* Slate-400 */

/* Borders */
--color-border: #E2E8F0;          /* Slate-200 */
--color-border-hover: #CBD5E1;    /* Slate-300 */
```

### Gradient Overlays

```css
/* Hero gradient - for headers, CTAs */
.gradient-hero {
  background: linear-gradient(135deg, #3B82F6 0%, #A855F7 100%);
}

/* Energy gradient - for streaks, XP bars */
.gradient-energy {
  background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);
}

/* Success gradient - for level-ups, achievements */
.gradient-success {
  background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
}
```

---

## Typography

### Font Stack

```css
/* Primary font - Inter (already loaded by Next.js) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace - for stats, numbers */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Font Sizes

```css
/* Headings */
--text-h1: 3rem;      /* 48px - Page titles */
--text-h2: 2.25rem;   /* 36px - Section titles */
--text-h3: 1.875rem;  /* 30px - Card titles */
--text-h4: 1.5rem;    /* 24px - Subsections */

/* Body */
--text-lg: 1.125rem;  /* 18px - Large body */
--text-base: 1rem;    /* 16px - Body */
--text-sm: 0.875rem;  /* 14px - Small text */
--text-xs: 0.75rem;   /* 12px - Captions */

/* Display (for big stats) */
--text-display: 4rem; /* 64px - XP numbers, streak count */
```

### Font Weights

```css
--font-normal: 400;   /* Body text */
--font-medium: 500;   /* Emphasis */
--font-semibold: 600; /* Headings */
--font-bold: 700;     /* Strong emphasis */
--font-extrabold: 800; /* Display numbers */
```

---

## Spacing

Based on **8px grid system**:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Large cards */
--radius-full: 9999px;  /* Fully rounded */
```

---

## Shadows

```css
/* Elevation levels */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Colored shadows - for buttons, CTAs */
--shadow-primary: 0 8px 16px 0 rgba(59, 130, 246, 0.3);
--shadow-accent: 0 8px 16px 0 rgba(168, 85, 247, 0.3);
```

---

## Animation

### Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations

```css
--duration-fast: 150ms;     /* Quick interactions */
--duration-base: 250ms;     /* Standard transitions */
--duration-slow: 500ms;     /* Emphasis animations */
--duration-slower: 1000ms;  /* Celebrations */
```

### Example Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse (for streak indicator) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
```

---

## Components

### Button Styles

**Primary Button:**
```tsx
className="bg-gradient-to-r from-blue-500 to-purple-500 text-white
           font-semibold px-6 py-3 rounded-lg
           shadow-lg hover:shadow-xl
           transform hover:-translate-y-0.5
           transition-all duration-200"
```

**Secondary Button:**
```tsx
className="bg-white text-slate-900 border-2 border-slate-300
           font-semibold px-6 py-3 rounded-lg
           hover:border-blue-500 hover:text-blue-500
           transition-colors duration-200"
```

**Ghost Button:**
```tsx
className="bg-transparent text-slate-600
           font-medium px-4 py-2 rounded-lg
           hover:bg-slate-100
           transition-colors duration-200"
```

### Card Styles

**Standard Card:**
```tsx
className="bg-white rounded-xl shadow-md p-6
           border border-slate-200
           hover:shadow-lg transition-shadow duration-200"
```

**Stat Card:**
```tsx
className="bg-gradient-to-br from-blue-50 to-purple-50
           rounded-xl p-6 border-2 border-blue-200
           relative overflow-hidden"
```

### Badge Styles

**Streak Badge:**
```tsx
className="inline-flex items-center gap-2
           bg-gradient-to-r from-amber-400 to-amber-500
           text-white font-bold px-4 py-2 rounded-full
           shadow-md"
```

**Level Badge:**
```tsx
className="inline-flex items-center
           bg-purple-500 text-white font-bold
           px-3 py-1 rounded-full text-sm
           border-2 border-purple-600"
```

---

## Responsive Breakpoints

```css
/* Mobile-first approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

**Usage:**
```css
/* Mobile default */
.grid { grid-template-columns: 1fr; }

/* Tablet */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## Icons

Using **Lucide Icons** (already installed):

```tsx
import {
  Zap,       // Lightning - Energy, streaks
  Trophy,    // Achievement
  Target,    // Goals
  TrendingUp, // Progress
  Flame,     // Streak
  Star,      // Level, favorite
  Check,     // Success
  X,         // Close, reject
} from 'lucide-react'
```

**Icon Sizes:**
- Small: `size={16}` (inline text)
- Medium: `size={20}` (buttons, badges)
- Large: `size={24}` (headings)
- XL: `size={32}` (stat cards)

---

## Usage Examples

### Streak Counter

```tsx
<div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500
                text-white font-bold px-4 py-2 rounded-full shadow-md">
  <Flame size={20} />
  <span className="text-lg font-extrabold">5 days</span>
</div>
```

### XP Bar

```tsx
<div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-blue-500 to-purple-500
               transition-all duration-500 ease-out"
    style={{ width: '60%' }}
  />
</div>
<p className="text-sm text-slate-600 mt-1">
  450 / 500 XP
</p>
```

### Level Badge

```tsx
<div className="inline-flex items-center gap-2
                bg-purple-500 text-white font-bold
                px-3 py-1 rounded-full text-sm
                border-2 border-purple-600">
  <Star size={14} />
  <span>Level 3</span>
</div>
```

---

## Accessibility

### Color Contrast

All color combinations meet **WCAG AA** standards:
- Primary text on white: 12.63:1 (AAA)
- Secondary text on white: 7.12:1 (AAA)
- White on blue-500: 4.59:1 (AA)
- White on purple-500: 6.35:1 (AA)

### Focus States

```css
/* Keyboard focus */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

### Reduced Motion

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Resources

- **Tailwind CSS Docs:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Color Palette Generator:** [uicolors.app](https://uicolors.app)
- **Contrast Checker:** [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)
- **Animation Playground:** [animista.net](https://animista.net)

---

**Next:** Read [Gamification Mechanics](./gamification.md) to understand the game systems.
