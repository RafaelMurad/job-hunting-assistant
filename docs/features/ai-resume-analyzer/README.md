# AI Resume Analyzer

AI-powered resume analysis with streaming responses.

## What You'll Learn

- **Streaming Responses**: Fetch API with ReadableStream
- **LLM Integration**: OpenAI, Anthropic, or Google AI APIs
- **Prompt Engineering**: Structuring prompts for consistent output
- **File Handling**: Processing different document formats

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│     Browser     │         │     Server      │
│                 │  POST   │                 │
│  ResumeAnalyzer │────────>│ /api/analyze    │
│       ↓         │         │       ↓         │
│  useResumeAnalysis        │  LLM API Call   │
│       ↓         │<────────│  (streaming)    │
│  StreamingText  │  Stream │                 │
└─────────────────┘         └─────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `hooks/useResumeAnalysis.ts` | Streaming fetch logic |
| `components/ResumeAnalyzer.tsx` | Main UI component |
| `components/StreamingText.tsx` | Typewriter text display |
| `app/api/analyze-resume/route.ts` | API endpoint |

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { ResumeAnalyzer } from "@/lib/features/ai-resume-analyzer";

function AnalyzePage() {
  const isEnabled = useFeatureFlag("ai_resume_analyzer");

  if (!isEnabled) return <div>Feature not available</div>;

  return <ResumeAnalyzer />;
}
```

## Supported Providers

| Provider | Model | Docs |
|----------|-------|------|
| OpenAI | gpt-4o-mini | [Streaming](https://platform.openai.com/docs/api-reference/streaming) |
| Anthropic | claude-3-haiku | [Streaming](https://docs.anthropic.com/en/api/streaming) |
| Google | gemini-1.5-flash | [Streaming](https://ai.google.dev/gemini-api/docs/text-generation) |

## Environment Variables

```bash
# Choose one provider:
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
GOOGLE_AI_API_KEY=...
```
