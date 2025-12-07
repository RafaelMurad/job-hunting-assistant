/**
 * Root tRPC Router
 *
 * Combines all sub-routers into the main app router.
 * This is the single source of truth for the API shape.
 */

import { router } from "@/lib/trpc/init";
import { userRouter } from "./routers/user";
import { analyzeRouter } from "./routers/analyze";
import { applicationsRouter } from "./routers/applications";

/**
 * Main application router.
 * All procedures are accessible via trpc.<router>.<procedure>
 */
export const appRouter = router({
  user: userRouter,
  analyze: analyzeRouter,
  applications: applicationsRouter,
});

/**
 * Export type definition of the API.
 * Used by the client for type inference.
 */
export type AppRouter = typeof appRouter;
