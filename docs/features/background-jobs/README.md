# Background Jobs

Job queue for async processing and scheduled tasks.

## What You'll Learn

- **Job Queues**: Async task processing
- **Retry Logic**: Exponential backoff
- **Scheduling**: Delayed execution
- **Idempotency**: Safe to retry

## Architecture

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────┐
│   Enqueue Job   │────>│   Job Queue   │────>│   Handler   │
└─────────────────┘     └───────────────┘     └─────────────┘
                              │                      │
                              │<─────────────────────┘
                              │   Result/Error
                              v
                        ┌───────────┐
                        │  Retry?   │
                        └───────────┘
```

## Files

| File | Purpose |
|------|---------|
| `utils/queue.ts` | Job queue with retry logic |
| `hooks/useJobs.ts` | React hook for job management |
| `components/JobScheduler.tsx` | Job creation form |
| `components/JobsList.tsx` | Job status display |

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { JobScheduler, JobsList } from "@/lib/features/background-jobs";

function Page() {
  const isEnabled = useFeatureFlag("background_jobs");
  if (!isEnabled) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <JobScheduler />
      <JobsList />
    </div>
  );
}
```

## Production Upgrade

Replace in-memory queue with:

**Vercel Cron** (simple):
```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 9 * * *"
  }]
}
```

**BullMQ + Redis** (robust):
```bash
npm install bullmq
```

```typescript
import { Queue, Worker } from 'bullmq';

const queue = new Queue('jobs', { connection: redis });
const worker = new Worker('jobs', handler, { connection: redis });
```

## Official Documentation

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [BullMQ](https://docs.bullmq.io/)
