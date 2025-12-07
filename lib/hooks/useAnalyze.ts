/**
 * useAnalyze Hook
 *
 * Abstracted hook for job analysis and cover letter generation.
 * Provides a clean interface for AI-powered job matching.
 *
 * WHY: Encapsulates tRPC complexity, button states, and error handling.
 * Pages only need to consume the clean interface.
 */

"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { getErrorMessage } from "@/lib/trpc/errors";

/**
 * Job analysis result from AI.
 */
export interface JobAnalysisResult {
  company: string;
  role: string;
  matchScore: number;
  topRequirements: string[];
  skillsMatch: string[];
  gaps: string[];
  redFlags: string[];
  keyPoints: string[];
}

/**
 * Button state for inline feedback.
 */
export type ButtonState = "idle" | "loading" | "success" | "error";

/**
 * Return type for useAnalyze hook.
 */
export interface UseAnalyzeReturn {
  // Data
  analysis: JobAnalysisResult | null;
  coverLetter: string;

  // Button states (for inline feedback)
  analyzeState: ButtonState;
  coverLetterState: ButtonState;

  // Error messages
  analyzeError: string | null;
  coverLetterError: string | null;

  // Actions
  analyze: (jobDescription: string, userId: string) => void;
  generateCoverLetter: (
    jobDescription: string,
    userId: string,
    analysis: JobAnalysisResult
  ) => void;
  setCoverLetter: (coverLetter: string) => void;
  reset: () => void;
}

/**
 * Hook for job analysis and cover letter generation.
 *
 * @example
 * const { analysis, analyze, analyzeState, coverLetter, generateCoverLetter } = useAnalyze();
 *
 * const handleAnalyze = () => {
 *   analyze(jobDescription, userId);
 * };
 */
export function useAnalyze(): UseAnalyzeReturn {
  // Result state
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Button states
  const [analyzeState, setAnalyzeState] = useState<ButtonState>("idle");
  const [coverLetterState, setCoverLetterState] = useState<ButtonState>("idle");

  // Error messages
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);

  // Helper to reset button state after delay
  const resetButtonState = (
    setter: React.Dispatch<React.SetStateAction<ButtonState>>,
    delay = 2000
  ): void => {
    setTimeout(() => setter("idle"), delay);
  };

  // tRPC mutation for job analysis
  const analyzeMutation = trpc.analyze.analyzeJob.useMutation({
    onSuccess: (data) => {
      setAnalysis(data);
      setAnalyzeState("success");
      setAnalyzeError(null);
      resetButtonState(setAnalyzeState);
    },
    onError: (err) => {
      setAnalyzeState("error");
      setAnalyzeError(
        getErrorMessage(
          err,
          "Failed to analyze job. Make sure you've filled in your profile first."
        )
      );
      resetButtonState(setAnalyzeState, 3000);
    },
  });

  // tRPC mutation for cover letter generation
  const coverLetterMutation = trpc.analyze.generateCoverLetter.useMutation({
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter);
      setCoverLetterState("success");
      setCoverLetterError(null);
      resetButtonState(setCoverLetterState);
    },
    onError: (err) => {
      setCoverLetterState("error");
      setCoverLetterError(getErrorMessage(err, "Failed to generate cover letter"));
      resetButtonState(setCoverLetterState, 3000);
    },
  });

  // Analyze job description
  const analyze = (jobDescription: string, userId: string): void => {
    setAnalyzeError(null);
    setAnalyzeState("loading");
    setAnalysis(null);
    setCoverLetter("");

    analyzeMutation.mutate({ jobDescription, userId });
  };

  // Generate cover letter
  const generateCoverLetter = (
    jobDescription: string,
    userId: string,
    analysisData: JobAnalysisResult
  ): void => {
    setCoverLetterError(null);
    setCoverLetterState("loading");

    coverLetterMutation.mutate({ jobDescription, userId, analysis: analysisData });
  };

  // Reset all state
  const reset = (): void => {
    setAnalysis(null);
    setCoverLetter("");
    setAnalyzeState("idle");
    setCoverLetterState("idle");
    setAnalyzeError(null);
    setCoverLetterError(null);
  };

  return {
    analysis,
    coverLetter,
    analyzeState,
    coverLetterState,
    analyzeError,
    coverLetterError,
    analyze,
    generateCoverLetter,
    setCoverLetter,
    reset,
  };
}
