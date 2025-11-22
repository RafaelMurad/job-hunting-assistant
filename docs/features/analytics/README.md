# Analytics Dashboard

Data visualization for job search metrics.

## What You'll Learn

- **Data Aggregation**: Transform raw data into metrics
- **Data Visualization**: Charts without heavy libraries
- **Metric Design**: What to measure and why
- **Time Series**: Grouping data by time periods

## Components

| Component | Purpose |
|-----------|---------|
| `AnalyticsDashboard` | Main dashboard layout |
| `FunnelChart` | Application stage funnel |
| `TimelineChart` | Applications over time |
| `MetricCard` | Key metric display |

## Key Metrics

1. **Total Applications**: Raw count
2. **Interview Rate**: Interviews / Applications
3. **Offer Rate**: Offers / Interviews
4. **Response Rate**: Non-pending / Total

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { AnalyticsDashboard } from "@/lib/features/analytics";

function Page() {
  const isEnabled = useFeatureFlag("analytics_dashboard");
  if (!isEnabled) return null;
  return <AnalyticsDashboard />;
}
```

## Upgrading to Recharts

```bash
npm install recharts
```

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function Chart({ data }) {
  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="applications" fill="#0284c7" />
    </BarChart>
  );
}
```

## Official Documentation

- [Recharts](https://recharts.org/)
- [Visx](https://airbnb.io/visx/)
- [D3.js](https://d3js.org/)
