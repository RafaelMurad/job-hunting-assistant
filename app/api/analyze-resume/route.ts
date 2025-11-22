/**
 * AI Resume Analysis API Route
 *
 * Analyzes resumes using LLM APIs with streaming responses.
 *
 * LEARNING EXERCISE: Implement actual LLM integration.
 */

import { NextRequest } from "next/server";

/**
 * TODO Exercise 4: Implement LLM Integration
 *
 * Choose one provider and implement streaming:
 *
 * OpenAI:
 * @see https://platform.openai.com/docs/api-reference/streaming
 *
 * Anthropic:
 * @see https://docs.anthropic.com/en/api/streaming
 *
 * Google AI:
 * @see https://ai.google.dev/gemini-api/docs/text-generation#streaming
 */

const ANALYSIS_PROMPT = `You are an expert resume reviewer. Analyze the following resume and provide detailed feedback.

Structure your response as follows:

## Overall Score: X/100

## Summary
Brief overview of the resume quality.

## Strengths
- Point 1
- Point 2

## Areas for Improvement
- Point 1
- Point 2

## Detailed Feedback

### Format & Structure
Analysis of layout, readability, and organization.

### Content Quality
Analysis of descriptions, achievements, and relevance.

### Keywords & ATS Optimization
Analysis of industry keywords and ATS compatibility.

### Impact & Metrics
Analysis of quantifiable achievements and results.

## Action Items
1. Specific action to take
2. Another specific action

---

Resume to analyze:
`;

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText) {
      return Response.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    // Build the prompt
    let prompt = ANALYSIS_PROMPT + resumeText;
    if (jobDescription) {
      prompt += `\n\n---\n\nJob Description to tailor analysis for:\n${jobDescription}`;
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const googleKey = process.env.GOOGLE_AI_API_KEY;

    // ============================================
    // TODO: Implement actual LLM streaming
    // ============================================

    // For now, return a mock streaming response
    if (!openaiKey && !anthropicKey && !googleKey) {
      return createMockStreamingResponse(resumeText);
    }

    // If you have an API key, implement the actual call:
    // Example with OpenAI:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${openaiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4o-mini',
    //     messages: [{ role: 'user', content: prompt }],
    //     stream: true,
    //   }),
    // });
    //
    // return new Response(response.body, {
    //   headers: { 'Content-Type': 'text/event-stream' },
    // });

    return createMockStreamingResponse(resumeText);
  } catch (error) {
    console.error("[analyze-resume] Error:", error);
    return Response.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}

/**
 * Creates a mock streaming response for development
 */
function createMockStreamingResponse(resumeText: string) {
  const encoder = new TextEncoder();
  const mockResponse = generateMockAnalysis(resumeText);

  const stream = new ReadableStream({
    async start(controller) {
      // Simulate streaming by sending chunks
      const words = mockResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? " " : "");
        controller.enqueue(encoder.encode(chunk));
        // Random delay between 20-80ms for realistic typing effect
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 60));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}

function generateMockAnalysis(resumeText: string): string {
  const wordCount = resumeText.split(/\s+/).length;
  const hasEmail = resumeText.includes("@");
  const hasMetrics = /\d+%|\$\d+|\d+ years/i.test(resumeText);

  return `## Overall Score: ${hasMetrics ? 78 : 65}/100

## Summary
This resume ${wordCount > 200 ? "provides comprehensive detail" : "could benefit from more detail"}. ${hasEmail ? "Contact information is present." : "Consider adding contact information."} ${hasMetrics ? "Good use of metrics and quantifiable achievements." : "Consider adding more quantifiable achievements."}

## Strengths
- ${wordCount > 100 ? "Good level of detail in descriptions" : "Concise presentation"}
- ${hasEmail ? "Clear contact information provided" : "Basic structure in place"}
- ${hasMetrics ? "Includes quantifiable achievements" : "Foundation for improvement is solid"}

## Areas for Improvement
- ${!hasMetrics ? "Add more quantifiable achievements (%, $, numbers)" : "Could add more industry-specific metrics"}
- Consider using stronger action verbs
- Ensure ATS compatibility with standard formatting

## Detailed Feedback

### Format & Structure
The resume ${wordCount > 300 ? "is well-structured with detailed sections" : "could benefit from more detailed sections"}. Consider using clear section headers and consistent formatting throughout.

### Content Quality
${hasMetrics ? "Good use of metrics to demonstrate impact." : "Consider adding specific numbers, percentages, and dollar amounts to quantify your achievements."} Use action verbs like "achieved," "implemented," "reduced," and "increased" to describe accomplishments.

### Keywords & ATS Optimization
Ensure your resume includes relevant industry keywords. Many companies use Applicant Tracking Systems (ATS) that scan for specific terms. Match keywords from job descriptions you're targeting.

### Impact & Metrics
${hasMetrics ? "Your resume includes some quantifiable achievements, which is excellent." : "Add metrics wherever possible. For example: 'Increased sales by 25%' or 'Managed team of 10 engineers'"}

## Action Items
1. ${!hasMetrics ? "Add at least 3 quantifiable achievements with specific numbers" : "Add more context to your metrics"}
2. Review job descriptions and incorporate relevant keywords
3. Use a consistent format for dates and locations
4. Consider adding a professional summary at the top
5. Ensure all contact information is up to date

---

*Note: This is a mock analysis. Connect an AI provider (OpenAI, Anthropic, or Google AI) for real analysis. See API_SETUP.md for instructions.*`;
}
