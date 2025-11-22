"use client";

import { useJobs } from "../hooks/useJobs";
import type { Job, JobStatus } from "../utils/queue";

const STATUS_STYLES: Record<JobStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  running: "bg-fjord-100 text-fjord-700 animate-pulse",
  completed: "bg-forest-100 text-forest-700",
  failed: "bg-clay-100 text-clay-700",
  retrying: "bg-purple-100 text-purple-700",
};

export function JobsList() {
  const { jobs, cancel, cleanup, pending, running, completed, failed } = useJobs();

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div className="rounded bg-amber-100 p-2">
          <div className="font-bold text-amber-700">{pending}</div>
          <div className="text-amber-600">Pending</div>
        </div>
        <div className="rounded bg-fjord-100 p-2">
          <div className="font-bold text-fjord-700">{running}</div>
          <div className="text-fjord-600">Running</div>
        </div>
        <div className="rounded bg-forest-100 p-2">
          <div className="font-bold text-forest-700">{completed}</div>
          <div className="text-forest-600">Done</div>
        </div>
        <div className="rounded bg-clay-100 p-2">
          <div className="font-bold text-clay-700">{failed}</div>
          <div className="text-clay-600">Failed</div>
        </div>
      </div>

      {/* Cleanup button */}
      {(completed > 0 || failed > 0) && (
        <button
          onClick={cleanup}
          className="text-sm text-nordic-neutral-500 hover:text-nordic-neutral-700"
        >
          Clear completed/failed jobs
        </button>
      )}

      {/* Jobs list */}
      <div className="space-y-2">
        {jobs.length === 0 ? (
          <p className="text-center text-nordic-neutral-500">No jobs</p>
        ) : (
          jobs.map((job) => (
            <JobItem key={job.id} job={job} onCancel={() => cancel(job.id)} />
          ))
        )}
      </div>
    </div>
  );
}

interface JobItemProps {
  job: Job;
  onCancel: () => void;
}

function JobItem({ job, onCancel }: JobItemProps) {
  return (
    <div className="rounded-lg border border-nordic-neutral-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-nordic-neutral-900">{job.type}</span>
          <span className={`ml-2 rounded px-2 py-0.5 text-xs ${STATUS_STYLES[job.status]}`}>
            {job.status}
          </span>
        </div>
        {job.status === "pending" && (
          <button
            onClick={onCancel}
            className="text-xs text-clay-600 hover:text-clay-700"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="mt-1 text-xs text-nordic-neutral-500">
        Attempt {job.attempts}/{job.maxAttempts}
        {job.scheduledFor && job.scheduledFor > new Date() && (
          <span className="ml-2">
            Scheduled: {job.scheduledFor.toLocaleTimeString()}
          </span>
        )}
        {job.error && <span className="ml-2 text-clay-600">{job.error}</span>}
      </div>
    </div>
  );
}
