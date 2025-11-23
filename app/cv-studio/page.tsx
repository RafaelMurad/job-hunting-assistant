/**
 * CV Studio Page
 *
 * Main page for the CV Studio feature.
 * Provides interface for importing, editing, analyzing, and exporting CVs.
 *
 * @feature cv_studio
 */

"use client";

import { useState, useCallback } from "react";
import { useFeatureFlag } from "@/lib/feature-flags";
import {
  CV,
  JobDescription,
  CVAnalysisResult,
  createEmptyCV,
  handleFileUpload,
  parseCV,
  analyzeCV,
  exportToPDF,
  downloadBlob,
  CV_TEMPLATES,
  DEFAULT_STYLING,
  createDropZoneHandlers,
} from "@/lib/features/cv-studio";
import { CVEditor } from "@/lib/features/cv-studio/components/CVEditor";

// ===================
// MAIN PAGE
// ===================

export default function CVStudioPage() {
  const isEnabled = useFeatureFlag("cv_studio");

  // State
  const [cv, setCV] = useState<CV | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);

  // UI State
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "analyze" | "export">("edit");

  // File upload handler
  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const uploadResult = await handleFileUpload(file);
      if (!uploadResult.success || !uploadResult.file || !uploadResult.format) {
        setError(uploadResult.error || "Upload failed");
        return;
      }

      const parseResult = await parseCV(uploadResult.file, uploadResult.format);
      if (!parseResult.success || !parseResult.cv) {
        setError(parseResult.errors[0]?.message || "Parsing failed");
        return;
      }

      setCV(parseResult.cv as CV);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Drag and drop handlers
  const dropHandlers = createDropZoneHandlers(handleFile, setIsDragging);

  // Analysis handler
  const handleAnalyze = useCallback(async () => {
    if (!cv || !jobDescription) return;

    setIsLoading(true);
    try {
      const result = await analyzeCV(cv, jobDescription);
      setAnalysis(result);
      setActiveTab("analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }, [cv, jobDescription]);

  // Export handler
  const handleExport = useCallback(async () => {
    if (!cv) return;

    setIsLoading(true);
    try {
      const blob = await exportToPDF(cv, {
        format: "pdf",
        template: CV_TEMPLATES[0],
        includeCoverLetter: !!analysis?.coverLetter,
        coverLetterText: analysis?.coverLetter,
        styling: DEFAULT_STYLING,
      });
      downloadBlob(blob, `${cv.personalInfo.firstName}_${cv.personalInfo.lastName}_CV.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsLoading(false);
    }
  }, [cv, analysis]);

  // Feature flag check
  if (!isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            CV Studio
          </h1>
          <p className="text-neutral-600">
            This feature is not yet enabled. Enable it in the{" "}
            <a href="/admin/flags" className="text-fjord-600 hover:underline">
              admin panel
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">CV Studio</h1>
            <p className="text-sm text-neutral-600">
              Import, edit, analyze, and export professional CVs
            </p>
          </div>
          <div className="flex gap-4">
            {cv && (
              <>
                <button
                  onClick={handleAnalyze}
                  disabled={!jobDescription || isLoading}
                  className="px-4 py-2 bg-forest-600 text-white rounded-lg
                    hover:bg-forest-700 disabled:opacity-50"
                >
                  Analyze
                </button>
                <button
                  onClick={handleExport}
                  disabled={isLoading}
                  className="px-4 py-2 bg-fjord-600 text-white rounded-lg
                    hover:bg-fjord-700 disabled:opacity-50"
                >
                  Export PDF
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-clay-50 border border-clay-200 rounded-lg text-clay-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-clay-500 hover:text-clay-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* No CV - Upload Interface */}
        {!cv && (
          <div
            {...dropHandlers}
            className={`
              border-2 border-dashed rounded-xl p-16 text-center
              transition-colors cursor-pointer
              ${isDragging
                ? "border-fjord-400 bg-fjord-50"
                : "border-neutral-300 hover:border-neutral-400"
              }
            `}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt,.json"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />

            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {isLoading ? "Processing..." : "Drop your CV here"}
            </h2>
            <p className="text-neutral-600 mb-4">
              or click to browse. Supports PDF, DOCX, TXT, JSON
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCV(createEmptyCV());
              }}
              className="text-fjord-600 hover:text-fjord-700 font-medium"
            >
              Or start from scratch
            </button>
          </div>
        )}

        {/* CV Loaded - Editor Interface */}
        {cv && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {(["edit", "analyze", "export"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
                      ${activeTab === tab
                        ? "bg-fjord-600 text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-100"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                {activeTab === "edit" && (
                  <CVEditor
                    initialData={cv}
                    onSave={setCV}
                    onAnalyze={() => setActiveTab("analyze")}
                  />
                )}

                {activeTab === "analyze" && (
                  <AnalysisTab
                    analysis={analysis}
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                  />
                )}

                {activeTab === "export" && (
                  <ExportTab
                    cv={cv}
                    analysis={analysis}
                    onExport={handleExport}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Sidebar - Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">CV Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Experience</span>
                    <span className="font-medium">{cv.experience.length} positions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Education</span>
                    <span className="font-medium">{cv.education.length} entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Skills</span>
                    <span className="font-medium">{cv.skills.length} skills</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Summary</span>
                    <span className="font-medium">
                      {cv.summary ? `${cv.summary.split(" ").length} words` : "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              {analysis && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Match Score</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-fjord-600 mb-2">
                      {analysis.overallScore}%
                    </div>
                    <p className="text-sm text-neutral-600">
                      Match with job description
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setCV(null);
                  setAnalysis(null);
                  setJobDescription(null);
                }}
                className="w-full py-2 text-neutral-600 hover:text-neutral-900
                  border border-neutral-200 rounded-lg hover:bg-neutral-50"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ===================
// ANALYSIS TAB
// ===================

interface AnalysisTabProps {
  analysis: CVAnalysisResult | null;
  jobDescription: JobDescription | null;
  onJobDescriptionChange: (jd: JobDescription) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

function AnalysisTab({
  analysis,
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  isLoading,
}: AnalysisTabProps) {
  const [jdText, setJdText] = useState("");

  const handleParseJobDescription = () => {
    // Simple parsing - in practice, use NLP
    const jd: JobDescription = {
      id: Date.now().toString(),
      title: "Position",
      company: "Company",
      description: jdText,
      requirements: [],
      preferredQualifications: [],
      keywords: jdText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [],
    };
    onJobDescriptionChange(jd);
  };

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Job Description</h3>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          rows={6}
          placeholder="Paste the job description here to analyze your CV against it..."
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg
            focus:ring-2 focus:ring-fjord-500 focus:border-transparent"
        />
        <button
          onClick={() => {
            handleParseJobDescription();
            onAnalyze();
          }}
          disabled={!jdText || isLoading}
          className="mt-3 px-4 py-2 bg-fjord-600 text-white rounded-lg
            hover:bg-fjord-700 disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : "Analyze Match"}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Scores */}
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(analysis.categoryScores).map(([category, score]) => (
              <div key={category} className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-fjord-600">{score}%</div>
                <div className="text-sm text-neutral-600 capitalize">{category}</div>
              </div>
            ))}
          </div>

          {/* Matches & Gaps */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-forest-700 mb-2">Matches</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.matches.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-forest-100 text-forest-700 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-clay-700 mb-2">Gaps</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.gaps.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-clay-100 text-clay-700 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">Suggestions</h4>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        suggestion.priority === "high"
                          ? "bg-clay-100 text-clay-700"
                          : suggestion.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {suggestion.priority}
                      </span>
                      <h5 className="font-medium mt-2">{suggestion.title}</h5>
                      <p className="text-sm text-neutral-600 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          {analysis.coverLetter && (
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Generated Cover Letter</h4>
              <div className="p-4 bg-neutral-50 rounded-lg whitespace-pre-line text-sm">
                {analysis.coverLetter}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===================
// EXPORT TAB
// ===================

interface ExportTabProps {
  cv: CV;
  analysis: CVAnalysisResult | null;
  onExport: () => void;
  isLoading: boolean;
}

function ExportTab({ cv, analysis, onExport, isLoading }: ExportTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Export Options</h3>
        <p className="text-neutral-600 text-sm mb-4">
          Choose your export format and template. PDF export includes your CV
          {analysis?.coverLetter ? " and cover letter" : ""}.
        </p>
      </div>

      {/* Templates */}
      <div>
        <h4 className="font-medium text-neutral-900 mb-3">Template</h4>
        <div className="grid grid-cols-2 gap-4">
          {CV_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="p-4 border-2 border-neutral-200 rounded-lg cursor-pointer
                hover:border-fjord-400 transition-colors"
            >
              <h5 className="font-medium">{template.name}</h5>
              <p className="text-sm text-neutral-600">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onExport}
          disabled={isLoading}
          className="flex-1 py-3 bg-fjord-600 text-white rounded-lg
            hover:bg-fjord-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? "Generating..." : "Export as PDF"}
        </button>
        <button
          disabled
          className="flex-1 py-3 border border-neutral-300 text-neutral-400
            rounded-lg cursor-not-allowed font-medium"
        >
          Export as DOCX (Coming Soon)
        </button>
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Tip: For best results, use Chrome or Edge for PDF export.
      </p>
    </div>
  );
}
