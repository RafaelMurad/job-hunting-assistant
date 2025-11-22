"use client";

/**
 * Resume Analysis Hook
 *
 * Handles streaming AI responses for resume analysis.
 *
 * LEARNING EXERCISE: Implement the streaming fetch logic.
 */

import { useCallback, useState } from "react";
import type { StreamState } from "../types";

interface UseResumeAnalysisOptions {
  endpoint?: string;
}

export function useResumeAnalysis({
  endpoint = "/api/analyze-resume",
}: UseResumeAnalysisOptions = {}) {
  const [state, setState] = useState<StreamState>({
    status: "idle",
    text: "",
  });

  /**
   * TODO Exercise 1: Implement streaming fetch
   *
   * Streaming responses allow you to show text as it's generated,
   * creating a "typewriter" effect that improves perceived performance.
   *
   * Steps:
   * 1. Make a POST request to the endpoint with the resume text
   * 2. Get the response body as a ReadableStream
   * 3. Create a reader and decoder
   * 4. Read chunks in a loop and update state
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
   */
  const analyze = useCallback(
    async (resumeText: string, jobDescription?: string) => {
      setState({ status: "loading", text: "" });

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Check if response is streaming
        if (!response.body) {
          // Non-streaming fallback
          const data = await response.json();
          setState({ status: "complete", text: data.analysis });
          return;
        }

        // ============================================
        // TODO: Implement streaming response handling
        // ============================================

        // Hint: Create a reader from the response body
        // const reader = response.body.getReader();
        // const decoder = new TextDecoder();

        // Hint: Read chunks in a loop
        // let done = false;
        // let fullText = '';
        //
        // setState({ status: 'streaming', text: '' });
        //
        // while (!done) {
        //   const { value, done: doneReading } = await reader.read();
        //   done = doneReading;
        //
        //   if (value) {
        //     const chunk = decoder.decode(value, { stream: !done });
        //     fullText += chunk;
        //     setState({ status: 'streaming', text: fullText });
        //   }
        // }
        //
        // setState({ status: 'complete', text: fullText });

        // PLACEHOLDER: Remove when implementing
        console.log("[useResumeAnalysis] TODO: Implement streaming");
        const text = await response.text();
        setState({ status: "complete", text });
      } catch (error) {
        setState({
          status: "error",
          text: "",
          error: error instanceof Error ? error.message : "Analysis failed",
        });
      }
    },
    [endpoint]
  );

  const reset = useCallback(() => {
    setState({ status: "idle", text: "" });
  }, []);

  return {
    ...state,
    analyze,
    reset,
    isLoading: state.status === "loading",
    isStreaming: state.status === "streaming",
    isComplete: state.status === "complete",
    isError: state.status === "error",
  };
}
