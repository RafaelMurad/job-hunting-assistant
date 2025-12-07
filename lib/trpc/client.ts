/**
 * tRPC Client Configuration
 *
 * Creates the tRPC client and React Query integration.
 * Used by client components to call tRPC procedures.
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/lib/trpc/router";

/**
 * tRPC React hooks.
 * Usage: trpc.user.get.useQuery(), trpc.analyze.analyzeJob.useMutation()
 */
export const trpc = createTRPCReact<AppRouter>();
