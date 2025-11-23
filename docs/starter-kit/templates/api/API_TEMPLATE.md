# API Route Template

Standard patterns for Next.js API routes.

## Basic CRUD Route

```typescript
// app/api/items/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(items);
  } catch (error) {
    console.error("[GET /api/items]", error);
    return Response.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userId } = body;

    if (!name || !userId) {
      return Response.json(
        { error: "name and userId are required" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: { name, userId },
    });

    return Response.json(item, { status: 201 });
  } catch (error) {
    console.error("[POST /api/items]", error);
    return Response.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
```

## Dynamic Route (by ID)

```typescript
// app/api/items/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

// GET /api/items/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return Response.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return Response.json(item);
  } catch (error) {
    console.error("[GET /api/items/:id]", error);
    return Response.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();

    const item = await prisma.item.update({
      where: { id: params.id },
      data: body,
    });

    return Response.json(item);
  } catch (error) {
    console.error("[PATCH /api/items/:id]", error);
    return Response.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await prisma.item.delete({
      where: { id: params.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/items/:id]", error);
    return Response.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
```

## With Validation (Zod)

```typescript
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createItemSchema.parse(body);

    const item = await prisma.item.create({
      data: validated,
    });

    return Response.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    // ... handle other errors
  }
}
```

## Streaming Response

```typescript
// app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`data: ${i}\n\n`));
        await new Promise((r) => setTimeout(r, 100));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## Error Response Format

```typescript
// Consistent error format
interface ErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

// Usage
return Response.json(
  {
    error: "Item not found",
    code: "ITEM_NOT_FOUND"
  },
  { status: 404 }
);
```
