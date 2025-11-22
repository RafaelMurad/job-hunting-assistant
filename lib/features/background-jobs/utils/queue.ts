/**
 * Job Queue Implementation
 *
 * A simple in-memory job queue with retry logic.
 *
 * LEARNING EXERCISE: Understand job queue patterns.
 *
 * Production: Use Redis + BullMQ, or Vercel Cron
 */

export type JobStatus = "pending" | "running" | "completed" | "failed" | "retrying";

export interface Job {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
}

type JobHandler = (payload: Record<string, unknown>) => Promise<unknown>;

/**
 * Simple in-memory job queue
 */
class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private processing = false;

  /**
   * Register a job handler
   */
  register(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * TODO Exercise 1: Implement Job Scheduling
   *
   * Jobs should support:
   * - Immediate execution
   * - Scheduled execution (run at specific time)
   * - Retry logic with exponential backoff
   */
  enqueue(
    type: string,
    payload: Record<string, unknown>,
    options: { scheduledFor?: Date; maxAttempts?: number } = {}
  ): Job {
    const job: Job = {
      id: crypto.randomUUID(),
      type,
      payload,
      status: "pending",
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      createdAt: new Date(),
      scheduledFor: options.scheduledFor,
    };

    this.jobs.set(job.id, job);
    this.processQueue(); // Start processing

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: JobStatus): Job[] {
    return this.getAllJobs().filter((job) => job.status === status);
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      while (true) {
        const pendingJobs = this.getJobsByStatus("pending")
          .filter((job) => !job.scheduledFor || job.scheduledFor <= new Date())
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        if (pendingJobs.length === 0) break;

        const job = pendingJobs[0];
        await this.processJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * TODO Exercise 2: Implement Job Processing with Retry
   *
   * Handle job execution with:
   * - Status updates
   * - Error handling
   * - Retry with exponential backoff
   * - Max attempts limit
   */
  private async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);

    if (!handler) {
      job.status = "failed";
      job.error = `No handler registered for job type: ${job.type}`;
      return;
    }

    job.status = "running";
    job.attempts++;

    try {
      job.result = await handler(job.payload);
      job.status = "completed";
      job.completedAt = new Date();
    } catch (error) {
      if (job.attempts < job.maxAttempts) {
        job.status = "retrying";
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, job.attempts - 1) * 1000;
        job.scheduledFor = new Date(Date.now() + delay);
        job.status = "pending";
      } else {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Unknown error";
      }
    }
  }

  /**
   * Cancel a pending job
   */
  cancel(id: string): boolean {
    const job = this.jobs.get(id);
    if (job && job.status === "pending") {
      this.jobs.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Clear completed/failed jobs
   */
  cleanup(): void {
    for (const [id, job] of this.jobs) {
      if (job.status === "completed" || job.status === "failed") {
        this.jobs.delete(id);
      }
    }
  }
}

// Singleton instance
export const jobQueue = new JobQueue();

// Register default handlers
jobQueue.register("send_reminder", async (payload) => {
  console.log("[Job] Sending reminder:", payload);
  await new Promise((r) => setTimeout(r, 1000));
  return { sent: true };
});

jobQueue.register("sync_data", async (payload) => {
  console.log("[Job] Syncing data:", payload);
  await new Promise((r) => setTimeout(r, 2000));
  return { synced: true };
});

jobQueue.register("generate_report", async (payload) => {
  console.log("[Job] Generating report:", payload);
  await new Promise((r) => setTimeout(r, 3000));
  return { reportId: crypto.randomUUID() };
});
