"use client";

/**
 * Resume Analyzer Component
 *
 * Main UI for uploading and analyzing resumes.
 *
 * LEARNING EXERCISE: Complete the file upload handling.
 */

import { useState, useCallback } from "react";
import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import { StreamingText } from "./StreamingText";

export function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { text, status, error, analyze, reset, isStreaming, isLoading } =
    useResumeAnalysis();

  /**
   * TODO Exercise 3: Implement file upload
   *
   * Handle PDF and DOCX file uploads:
   * 1. Read file as ArrayBuffer
   * 2. For PDF: Use pdf.js or send to server for parsing
   * 3. For DOCX: Use mammoth.js or send to server
   * 4. Set extracted text to resumeText state
   *
   * For this exercise, we'll support plain text (.txt) files.
   */
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Handle .txt files
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const text = await file.text();
        setResumeText(text);
        return;
      }

      // TODO: Handle PDF files
      // if (file.type === 'application/pdf') {
      //   const arrayBuffer = await file.arrayBuffer();
      //   // Send to server or use pdf.js
      // }

      // TODO: Handle DOCX files
      // if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      //   const arrayBuffer = await file.arrayBuffer();
      //   // Use mammoth.js: const result = await mammoth.extractRawText({ arrayBuffer });
      // }

      alert("Currently only .txt files are supported. PDF/DOCX coming soon!");
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    await analyze(resumeText, jobDescription || undefined);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nordic-neutral-900">
          AI Resume Analyzer
        </h1>
        <p className="mt-1 text-nordic-neutral-600">
          Get AI-powered feedback on your resume with real-time streaming
          analysis.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-nordic-neutral-700">
            Upload Resume
          </label>
          <div className="mt-1 flex items-center gap-4">
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-nordic-neutral-500
                file:mr-4 file:rounded-lg file:border-0
                file:bg-fjord-50 file:px-4 file:py-2
                file:text-sm file:font-medium file:text-fjord-700
                hover:file:bg-fjord-100"
            />
          </div>
          <p className="mt-1 text-xs text-nordic-neutral-500">
            Supported: .txt (PDF/DOCX support requires implementation)
          </p>
        </div>

        {/* Resume Text */}
        <div>
          <label className="block text-sm font-medium text-nordic-neutral-700">
            Or paste your resume
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-lg border border-nordic-neutral-300 px-4 py-2 text-sm focus:border-fjord-500 focus:outline-none focus:ring-1 focus:ring-fjord-500"
            placeholder="Paste your resume text here..."
          />
        </div>

        {/* Job Description (Optional) */}
        <div>
          <label className="block text-sm font-medium text-nordic-neutral-700">
            Job Description (optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-lg border border-nordic-neutral-300 px-4 py-2 text-sm focus:border-fjord-500 focus:outline-none focus:ring-1 focus:ring-fjord-500"
            placeholder="Paste the job description for targeted analysis..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!resumeText.trim() || isLoading || isStreaming}
            className="rounded-lg bg-fjord-600 px-6 py-2 font-medium text-white transition-colors hover:bg-fjord-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Starting..."
              : isStreaming
                ? "Analyzing..."
                : "Analyze Resume"}
          </button>
          {(text || error) && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-nordic-neutral-300 px-6 py-2 font-medium text-nordic-neutral-700 transition-colors hover:bg-nordic-neutral-50"
            >
              Clear Results
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {error && (
        <div className="rounded-lg border border-clay-300 bg-clay-50 p-4">
          <p className="text-clay-700">{error}</p>
        </div>
      )}

      {(text || isStreaming) && (
        <div className="rounded-lg border border-nordic-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-nordic-neutral-900">
            Analysis Results
            {isStreaming && (
              <span className="ml-2 text-sm font-normal text-fjord-600">
                (streaming...)
              </span>
            )}
          </h2>
          <StreamingText text={text} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  );
}
