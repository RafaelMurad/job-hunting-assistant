# Component Template

Standard structure for React components.

## Basic Component

```tsx
// components/MyComponent.tsx
"use client"; // Only if using hooks/events

import { useState } from "react";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function MyComponent({
  title,
  onAction,
  children
}: MyComponentProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onAction?.();
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        {title}
      </h2>
      <button
        onClick={handleClick}
        className="mt-2 rounded bg-fjord-600 px-4 py-2 text-white hover:bg-fjord-700"
      >
        {isActive ? "Active" : "Inactive"}
      </button>
      {children && (
        <div className="mt-4">{children}</div>
      )}
    </div>
  );
}
```

## Server Component (Default)

```tsx
// components/UserCard.tsx
import { prisma } from "@/lib/prisma";

interface UserCardProps {
  userId: string;
}

export async function UserCard({ userId }: UserCardProps) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return <div>User not found</div>;

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-neutral-500">{user.email}</p>
    </div>
  );
}
```

## With Loading State

```tsx
"use client";

import { useState, useEffect } from "react";

export function DataComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading data</div>;
  }

  return <div>{/* Render data */}</div>;
}
```

## Component with Variants (CVA)

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-fjord-600 text-white hover:bg-fjord-700",
        secondary: "border border-neutral-300 hover:bg-neutral-50",
        danger: "bg-clay-600 text-white hover:bg-clay-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

## Testing Template

```tsx
// components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("renders title", () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("calls onAction when clicked", () => {
    const onAction = vi.fn();
    render(<MyComponent title="Test" onAction={onAction} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onAction).toHaveBeenCalled();
  });
});
```
