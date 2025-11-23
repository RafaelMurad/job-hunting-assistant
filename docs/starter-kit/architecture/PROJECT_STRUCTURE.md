# Project Structure

Standard organization for all projects.

## Root Structure

```
project/
├── app/                    # Next.js App Router
├── components/             # Shared UI components
├── lib/                    # Business logic, utilities
│   ├── features/          # Feature modules
│   └── feature-flags/     # Feature flag system
├── packages/              # Monorepo packages (optional)
│   └── shared/            # Shared code (web + mobile)
├── mobile/                # React Native app (optional)
├── prisma/                # Database schema
├── public/                # Static assets
├── docs/                  # Documentation
└── tests/                 # Test utilities
```

## App Router Structure

```
app/
├── (auth)/                # Auth route group
│   ├── login/
│   └── register/
├── (dashboard)/           # Dashboard route group
│   ├── layout.tsx
│   └── page.tsx
├── api/                   # API routes
│   ├── user/
│   └── applications/
├── layout.tsx             # Root layout
├── page.tsx               # Home page
└── globals.css            # Global styles
```

## Feature Module Structure

```
lib/features/[feature-name]/
├── index.ts               # Public exports
├── types.ts               # TypeScript types
├── components/            # Feature UI
│   ├── FeatureMain.tsx
│   └── FeatureItem.tsx
├── hooks/                 # React hooks
│   └── useFeature.ts
├── utils/                 # Helper functions
│   └── helpers.ts
├── api/                   # API-related code
│   └── queries.ts
└── exercises/             # Learning exercises
    └── solutions/
```

## Component Structure

```
components/
├── ui/                    # Base UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
└── forms/                 # Form components
    ├── LoginForm.tsx
    └── ProfileForm.tsx
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase, use prefix | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | PascalCase | `User`, `ApplicationStatus` |
| Constants | SCREAMING_SNAKE | `API_BASE_URL` |
| CSS Classes | kebab-case | `user-profile-card` |
| Files | kebab-case (non-components) | `auth-utils.ts` |

## Import Order

```typescript
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. External packages
import { format } from 'date-fns';

// 3. Internal packages (@/)
import { Button } from '@/components/ui/Button';

// 4. Relative imports
import { UserCard } from './UserCard';

// 5. Types (separate)
import type { User } from '@/types';
```

## Key Principles

1. **Colocation**: Keep related code together
2. **Feature isolation**: Each feature is self-contained
3. **Clear boundaries**: Public API via index.ts
4. **Flat when possible**: Avoid deep nesting
5. **Consistent naming**: Follow conventions strictly
