# Design System: Nordic Theme

A cohesive design language for consistent UI.

## Color Palette

### Primary: Fjord Blue
Professional, trustworthy, calm.

```css
--fjord-50: #f0f9ff;
--fjord-100: #e0f2fe;
--fjord-200: #bae6fd;
--fjord-300: #7dd3fc;
--fjord-400: #38bdf8;
--fjord-500: #0ea5e9;
--fjord-600: #0284c7;  /* Primary */
--fjord-700: #0369a1;
--fjord-800: #075985;
--fjord-900: #0c4a6e;
```

### Success: Forest Green
Growth, positive outcomes.

```css
--forest-50: #f0fdf4;
--forest-500: #22c55e;
--forest-600: #16a34a;  /* Primary */
--forest-700: #15803d;
```

### Danger: Clay Red
Warnings, errors, destructive actions.

```css
--clay-50: #fef2f2;
--clay-500: #ef4444;
--clay-600: #dc2626;  /* Primary */
--clay-700: #b91c1c;
```

### Neutral: Nordic Gray
Text, backgrounds, borders.

```css
--neutral-50: #f8fafc;   /* Background */
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;  /* Borders */
--neutral-500: #64748b;  /* Muted text */
--neutral-900: #0f172a;  /* Headings */
```

## Typography

### Font Stack
```css
font-family: 'Inter', system-ui, sans-serif;
```

### Scale (1.25 ratio)
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Weights
- **400**: Body text
- **500**: Emphasis
- **600**: Subheadings
- **700**: Headings

## Spacing

8px base unit:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

## Border Radius

```css
--radius-sm: 0.25rem;  /* 4px - buttons */
--radius-md: 0.5rem;   /* 8px - cards */
--radius-lg: 0.75rem;  /* 12px - modals */
--radius-full: 9999px; /* pills, avatars */
```

## Shadows

```css
/* Subtle */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);

/* Cards */
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);

/* Modals, dropdowns */
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

## Component Patterns

### Buttons
```tsx
// Primary
<button className="bg-fjord-600 text-white hover:bg-fjord-700">

// Secondary
<button className="border border-neutral-300 hover:bg-neutral-50">

// Danger
<button className="bg-clay-600 text-white hover:bg-clay-700">
```

### Cards
```tsx
<div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
```

### Badges
```tsx
// Success
<span className="rounded-full bg-forest-100 px-2 py-1 text-xs text-forest-700">

// Info
<span className="rounded-full bg-fjord-100 px-2 py-1 text-xs text-fjord-700">
```

## Mobile (React Native)

Same tokens, different format:

```typescript
const colors = {
  fjord: {
    600: '#0284c7',
  },
  // ...
};

const spacing = {
  sm: 8,
  md: 16,
  // Numbers, not strings
};
```

## Accessibility

- Contrast ratios meet WCAG AA
- Focus states on all interactive elements
- Consistent hover/active states
- Semantic color usage
