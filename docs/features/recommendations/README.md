# Smart Job Recommendations

Job matching using similarity algorithms.

## What You'll Learn

- **TF-IDF**: Term Frequency-Inverse Document Frequency
- **Cosine Similarity**: Vector angle measurement
- **Text Processing**: Tokenization, normalization
- **Ranking Algorithms**: Sorting by relevance

## How It Works

```
User Profile          Job Posting
[React, TS, Node]    [React, TS, GraphQL]
      ↓                    ↓
   TF-IDF              TF-IDF
      ↓                    ↓
   Vector              Vector
      └────────┬───────────┘
               ↓
        Cosine Similarity
               ↓
          Score: 0.85
```

## Files

| File | Purpose |
|------|---------|
| `utils/similarity.ts` | TF-IDF, cosine similarity |
| `hooks/useRecommendations.ts` | Recommendation logic |
| `components/JobRecommendations.tsx` | UI component |

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { JobRecommendations } from "@/lib/features/recommendations";

function Page() {
  const isEnabled = useFeatureFlag("smart_recommendations");
  const userSkills = ["React", "TypeScript", "Node.js"];

  if (!isEnabled) return null;

  return (
    <JobRecommendations
      userSkills={userSkills}
      userExperience="5 years frontend development"
    />
  );
}
```

## Official Documentation

- [Wikipedia: TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [Wikipedia: Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
