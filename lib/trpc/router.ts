/**
 * Root tRPC Router
 *
 * Combines all sub-routers into the main app router.
 * This is the single source of truth for the API shape.
 */

import { router } from "@/lib/trpc/init";
import { adminRouter } from "./routers/admin";
import { analyzeRouter } from "./routers/analyze";
import { applicationsRouter } from "./routers/applications";
import { cvRouter } from "./routers/cv";
import { socialRouter } from "./routers/social";
import { userRouter } from "./routers/user";
import { uxRouter } from "./routers/ux";

/**
 * Main application router.
 * All procedures are accessible via trpc.<router>.<procedure>
 */
export const appRouter = router({
  user: userRouter,
  analyze: analyzeRouter,
  applications: applicationsRouter,
  cv: cvRouter,
  ux: uxRouter,
  social: socialRouter,
  admin: adminRouter,
});

/**
 * Export type definition of the API.
 * Used by the client for type inference.
 */
export type AppRouter = typeof appRouter;
