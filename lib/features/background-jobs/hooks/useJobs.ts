"use client";

import { useCallback, useEffect, useState } from "react";
import { jobQueue, type Job } from "../utils/queue";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const refresh = useCallback(() => {
    setJobs(jobQueue.getAllJobs());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const enqueue = useCallback(
    (type: string, payload: Record<string, unknown>, scheduledFor?: Date) => {
      const job = jobQueue.enqueue(type, payload, { scheduledFor });
      refresh();
      return job;
    },
    [refresh]
  );

  const cancel = useCallback(
    (id: string) => {
      const result = jobQueue.cancel(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const cleanup = useCallback(() => {
    jobQueue.cleanup();
    refresh();
  }, [refresh]);

  return {
    jobs,
    enqueue,
    cancel,
    cleanup,
    refresh,
    pending: jobs.filter((j) => j.status === "pending").length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };
}
