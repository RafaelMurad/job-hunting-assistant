"use client";

import { useState } from "react";
import { useJobs } from "../hooks/useJobs";

const JOB_TYPES = [
  { type: "send_reminder", label: "Send Reminder" },
  { type: "sync_data", label: "Sync Data" },
  { type: "generate_report", label: "Generate Report" },
];

export function JobScheduler() {
  const { enqueue } = useJobs();
  const [jobType, setJobType] = useState(JOB_TYPES[0].type);
  const [scheduleMinutes, setScheduleMinutes] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledFor =
      scheduleMinutes > 0
        ? new Date(Date.now() + scheduleMinutes * 60 * 1000)
        : undefined;

    enqueue(jobType, { timestamp: Date.now() }, scheduledFor);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-nordic-neutral-200 bg-white p-4">
      <h3 className="mb-4 font-semibold text-nordic-neutral-900">Schedule Job</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-nordic-neutral-700">
            Job Type
          </label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-nordic-neutral-300 px-3 py-2"
          >
            {JOB_TYPES.map((job) => (
              <option key={job.type} value={job.type}>
                {job.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-nordic-neutral-700">
            Schedule (minutes from now)
          </label>
          <input
            type="number"
            min="0"
            value={scheduleMinutes}
            onChange={(e) => setScheduleMinutes(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-nordic-neutral-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-nordic-neutral-500">
            0 = run immediately
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-fjord-600 px-4 py-2 font-medium text-white hover:bg-fjord-700"
        >
          Enqueue Job
        </button>
      </div>
    </form>
  );
}
