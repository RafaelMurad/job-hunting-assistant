# Exercises: AI Resume Analyzer

## Exercise 1: Implement Streaming Fetch

**File:** `lib/features/ai-resume-analyzer/hooks/useResumeAnalysis.ts`

**Goal:** Complete the streaming response handling.

**Steps:**

1. Get the stream reader:
   ```typescript
   const reader = response.body.getReader();
   const decoder = new TextDecoder();
   ```

2. Implement the read loop:
   ```typescript
   let done = false;
   let fullText = '';

   setState({ status: 'streaming', text: '' });

   while (!done) {
     const { value, done: doneReading } = await reader.read();
     done = doneReading;

     if (value) {
       const chunk = decoder.decode(value, { stream: !done });
       fullText += chunk;
       setState({ status: 'streaming', text: fullText });
     }
   }

   setState({ status: 'complete', text: fullText });
   ```

**Test:** Upload a resume and watch the text appear character by character.

---

## Exercise 2: Enhanced Markdown Rendering

**File:** `lib/features/ai-resume-analyzer/components/StreamingText.tsx`

**Goal:** Properly render markdown with syntax highlighting.

**Steps:**

1. Install dependencies:
   ```bash
   npm install react-markdown remark-gfm
   ```

2. Update the component:
   ```tsx
   import ReactMarkdown from 'react-markdown';
   import remarkGfm from 'remark-gfm';

   export function StreamingText({ text, isStreaming }) {
     return (
       <div className="prose prose-nordic max-w-none">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>
           {text}
         </ReactMarkdown>
         {isStreaming && <span className="animate-pulse">▊</span>}
       </div>
     );
   }
   ```

---

## Exercise 3: File Upload Handling

**File:** `lib/features/ai-resume-analyzer/components/ResumeAnalyzer.tsx`

**Goal:** Support PDF file uploads.

**Option A: Client-side (pdf.js)**

```bash
npm install pdfjs-dist
```

```typescript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}
```

**Option B: Server-side API**

Create `/api/parse-resume` that accepts file uploads and returns text.

---

## Exercise 4: Implement Real LLM Integration

**File:** `app/api/analyze-resume/route.ts`

**Goal:** Connect to OpenAI API with streaming.

```typescript
if (openaiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  });

  // Transform SSE to plain text stream
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      const lines = text.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const json = line.replace('data: ', '');
        if (json === '[DONE]') continue;

        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        } catch {}
      }
    }
  });

  return new Response(response.body.pipeThrough(transformStream));
}
```

---

## Bonus Challenges

### Challenge A: Rate Limiting

Implement client-side rate limiting to prevent API abuse:
- Maximum 3 analyses per minute
- Show countdown timer

### Challenge B: Analysis History

Store previous analyses in localStorage:
- Show history sidebar
- Allow re-viewing past analyses

### Challenge C: Export Results

Add buttons to export analysis:
- Copy to clipboard
- Download as PDF
- Share link

---

## Solutions

Reference implementations in `exercises/solutions/`.
