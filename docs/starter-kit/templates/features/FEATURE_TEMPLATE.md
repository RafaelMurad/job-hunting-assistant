# Feature Template

Standard structure for new features.

## Directory Structure

```
lib/features/[feature-name]/
├── index.ts           # Public exports
├── types.ts           # TypeScript types
├── components/
│   ├── FeatureMain.tsx
│   └── FeatureItem.tsx
├── hooks/
│   └── useFeature.ts
├── utils/
│   └── helpers.ts
└── __tests__/
    └── feature.test.ts
```

## Step 1: Add Feature Flag

```typescript
// lib/feature-flags/flags.config.ts
{
  key: "my_feature",
  name: "My Feature",
  description: "What this feature does",
  defaultEnabled: false,
  category: "experimental",
}
```

## Step 2: Create Types

```typescript
// lib/features/my-feature/types.ts
export interface MyFeatureItem {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: Date;
}

export interface MyFeatureState {
  items: MyFeatureItem[];
  isLoading: boolean;
  error: string | null;
}
```

## Step 3: Create Index (Public API)

```typescript
// lib/features/my-feature/index.ts
export { MyFeatureMain } from "./components/MyFeatureMain";
export { MyFeatureItem } from "./components/MyFeatureItem";
export { useMyFeature } from "./hooks/useMyFeature";
export type { MyFeatureItem, MyFeatureState } from "./types";
```

## Step 4: Create Hook

```typescript
// lib/features/my-feature/hooks/useMyFeature.ts
"use client";

import { useState, useCallback } from "react";
import type { MyFeatureItem, MyFeatureState } from "../types";

export function useMyFeature() {
  const [state, setState] = useState<MyFeatureState>({
    items: [],
    isLoading: false,
    error: null,
  });

  const fetchItems = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/my-feature");
      const items = await res.json();
      setState({ items, isLoading: false, error: null });
    } catch (error) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Failed to fetch items",
      }));
    }
  }, []);

  const addItem = useCallback(async (data: Partial<MyFeatureItem>) => {
    const res = await fetch("/api/my-feature", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const newItem = await res.json();
    setState((s) => ({ ...s, items: [...s.items, newItem] }));
  }, []);

  return {
    ...state,
    fetchItems,
    addItem,
  };
}
```

## Step 5: Create Main Component

```typescript
// lib/features/my-feature/components/MyFeatureMain.tsx
"use client";

import { useEffect } from "react";
import { useMyFeature } from "../hooks/useMyFeature";
import { MyFeatureItem } from "./MyFeatureItem";

export function MyFeatureMain() {
  const { items, isLoading, error, fetchItems } = useMyFeature();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">My Feature</h2>
      {items.map((item) => (
        <MyFeatureItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Step 6: Use with Feature Flag

```tsx
// app/my-feature/page.tsx
"use client";

import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { MyFeatureMain } from "@/lib/features/my-feature";

export default function MyFeaturePage() {
  const isEnabled = useFeatureFlag("my_feature");

  if (!isEnabled) {
    return <div>This feature is not available yet.</div>;
  }

  return <MyFeatureMain />;
}
```

## Step 7: Add API Route

```typescript
// app/api/my-feature/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.myFeature.findMany();
  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const item = await prisma.myFeature.create({ data });
  return Response.json(item);
}
```
