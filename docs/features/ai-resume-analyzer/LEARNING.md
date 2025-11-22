# Learning Guide: Streaming Responses

## Core Concepts

### 1. What is Streaming?

Instead of waiting for the entire response, streaming delivers data in chunks as it's generated. This is essential for LLM responses which can take several seconds.

**Benefits:**
- Better user experience (immediate feedback)
- Reduced perceived latency
- Memory efficient for large responses

### 2. Fetch API Streaming

Modern browsers support streaming through `Response.body` which returns a `ReadableStream`.

```typescript
const response = await fetch('/api/analyze');

// Get the stream reader
const reader = response.body.getReader();
const decoder = new TextDecoder();

// Read chunks
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value, { stream: true });
  console.log(text); // Process chunk
}
```

### 3. Server-Side Streaming

Next.js supports streaming responses via `ReadableStream`:

```typescript
export async function POST() {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('Hello'));
      await delay(100);
      controller.enqueue(new TextEncoder().encode(' World'));
      controller.close();
    }
  });

  return new Response(stream);
}
```

### 4. LLM API Streaming

Most LLM APIs support streaming. Here's the pattern:

**OpenAI:**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    stream: true, // Enable streaming
  }),
});

// Response is Server-Sent Events format
const reader = response.body.getReader();
// Parse SSE: data: {"choices":[{"delta":{"content":"Hello"}}]}
```

**Anthropic:**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  }),
});
```

## Prompt Engineering

### Structuring Output

Use clear formatting instructions:

```
Respond in the following format:

## Section 1
Content here

## Section 2
Content here

Use bullet points for lists:
- Item 1
- Item 2
```

### Few-Shot Examples

Provide examples of desired output:

```
Here's an example of the analysis format:

Input: "Software Engineer with 5 years experience..."
Output:
## Score: 75/100
## Summary: Strong technical background...
```

### Token Management

- Input tokens (your prompt) cost money
- Output tokens (LLM response) cost more
- Set `max_tokens` to limit output length
- Truncate long resumes if needed

## Common Issues

1. **CORS errors**: Make API calls from server, not client
2. **Rate limiting**: Implement retry logic with backoff
3. **Timeouts**: Set appropriate timeout values
4. **Incomplete chunks**: Use `{ stream: true }` in TextDecoder
