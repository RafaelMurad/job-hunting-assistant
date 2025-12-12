/**
 * Database Types
 *
 * Centralized exports for Prisma-backed enums/types, plus a few app-level
 * database-adjacent shapes.
 *
 * NOTE: This is a real module (not a .d.ts) so value imports like enums work
 * at runtime (e.g. in seed scripts).
 */

export {
  SocialProvider,
  SyncStatus,
  UserRole,
  UxEffort,
  UxSeverity,
  UxStatus,
} from "@prisma/client";

export type { User } from "@prisma/client";

/**
 * Application status values used in the tracker.
 *
 * Keep as string union to match UI + API payloads.
 */
export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

/**
 * Job application entity shape returned by tRPC (Date objects).
 */
export interface ApplicationEntity {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobDescription: string;
  jobUrl: string | null;
  matchScore: number;
  analysis: string;
  coverLetter: string;
  status: string;
  appliedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
