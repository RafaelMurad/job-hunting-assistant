/**
 * AI Resume Analyzer Feature
 *
 * Provides AI-powered resume analysis with streaming responses.
 * Uses LLM APIs (OpenAI, Anthropic, or Google) to provide feedback.
 *
 * @see docs/features/ai-resume-analyzer/README.md
 */

export { ResumeAnalyzer } from "./components/ResumeAnalyzer";
export { StreamingText } from "./components/StreamingText";
export { useResumeAnalysis } from "./hooks/useResumeAnalysis";
export type { AnalysisResult, AnalysisSection } from "./types";
