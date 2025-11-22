/**
 * AI Resume Analyzer Types
 */

export interface AnalysisSection {
  title: string;
  content: string;
  score?: number; // 0-100
  suggestions?: string[];
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  sections: {
    format: AnalysisSection;
    content: AnalysisSection;
    keywords: AnalysisSection;
    impact: AnalysisSection;
    improvements: AnalysisSection;
  };
  strengths: string[];
  weaknesses: string[];
  actionItems: string[];
}

export interface StreamState {
  status: "idle" | "loading" | "streaming" | "complete" | "error";
  text: string;
  error?: string;
}

/**
 * Provider configuration
 */
export type AIProvider = "openai" | "anthropic" | "google";

export interface AIConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
  maxTokens: 2000,
};
