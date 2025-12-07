"use client";

import { useState, useEffect, type JSX } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface JobAnalysisResult {
  company: string;
  role: string;
  matchScore: number;
  topRequirements: string[];
  skillsMatch: string[];
  gaps: string[];
  redFlags: string[];
  keyPoints: string[];
}

// Button state types for inline feedback
type ButtonState = "idle" | "loading" | "success" | "error";

interface StatusMessage {
  type: "error" | "info";
  text: string;
}

export default function AnalyzePage(): JSX.Element {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [saving, setSaving] = useState(false);

  // Button states for inline feedback (replaces alerts)
  const [analyzeState, setAnalyzeState] = useState<ButtonState>("idle");
  const [coverLetterState, setCoverLetterState] = useState<ButtonState>("idle");
  const [saveState, setSaveState] = useState<ButtonState>("idle");
  const [copyState, setCopyState] = useState<ButtonState>("idle");

  // Inline error messages
  const [analyzeError, setAnalyzeError] = useState<StatusMessage | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<StatusMessage | null>(null);
  const [saveError, setSaveError] = useState<StatusMessage | null>(null);

  // Helper to reset button state after success
  const resetButtonState = (
    setter: React.Dispatch<React.SetStateAction<ButtonState>>,
    delay = 2000
  ): void => {
    setTimeout(() => setter("idle"), delay);
  };

  // Get user ID on mount
  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUserId(data.user?.id || ""))
      .catch(console.error);
  }, []);

  const handleAnalyze = async (): Promise<void> => {
    // Clear previous errors
    setAnalyzeError(null);

    if (!jobDescription.trim()) {
      setAnalyzeError({ type: "info", text: "Please enter a job description" });
      return;
    }

    setAnalyzing(true);
    setAnalyzeState("loading");
    setAnalysis(null);
    setCoverLetter("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userId }),
      });

      if (!res.ok) {
        setAnalyzeState("error");
        setAnalyzeError({
          type: "error",
          text: "Failed to analyze job. Make sure you've filled in your profile first.",
        });
        resetButtonState(setAnalyzeState, 3000);
        return;
      }

      const data = await res.json();
      setAnalysis(data);
      setAnalyzeState("success");
      resetButtonState(setAnalyzeState);
    } catch (error) {
      console.error("Error:", error);
      setAnalyzeState("error");
      setAnalyzeError({
        type: "error",
        text: "Network error. Please try again.",
      });
      resetButtonState(setAnalyzeState, 3000);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async (): Promise<void> => {
    if (!analysis) return;

    setCoverLetterError(null);
    setGeneratingCoverLetter(true);
    setCoverLetterState("loading");

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userId, analysis }),
      });

      if (!res.ok) {
        setCoverLetterState("error");
        setCoverLetterError({ type: "error", text: "Failed to generate cover letter" });
        resetButtonState(setCoverLetterState, 3000);
        return;
      }

      const data = await res.json();
      setCoverLetter(data.coverLetter);
      setCoverLetterState("success");
      resetButtonState(setCoverLetterState);
    } catch (error) {
      console.error("Error:", error);
      setCoverLetterState("error");
      setCoverLetterError({ type: "error", text: "Network error. Please try again." });
      resetButtonState(setCoverLetterState, 3000);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleSaveApplication = async (): Promise<void> => {
    if (!analysis) return;

    setSaveError(null);
    setSaving(true);
    setSaveState("loading");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          company: analysis.company,
          role: analysis.role,
          jobDescription,
          matchScore: analysis.matchScore,
          analysis: JSON.stringify(analysis),
          coverLetter: coverLetter || "",
          status: "saved",
        }),
      });

      if (!res.ok) {
        setSaveState("error");
        setSaveError({ type: "error", text: "Failed to save application" });
        resetButtonState(setSaveState, 3000);
        return;
      }

      setSaveState("success");
      // Redirect after brief success feedback
      setTimeout(() => router.push("/tracker"), 1000);
    } catch (error) {
      console.error("Error:", error);
      setSaveState("error");
      setSaveError({ type: "error", text: "Network error. Please try again." });
      resetButtonState(setSaveState, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopyState("success");
      resetButtonState(setCopyState);
    } catch {
      setCopyState("error");
      resetButtonState(setCopyState, 3000);
    }
  };

  // Button text and style helpers
  const getButtonText = (
    state: ButtonState,
    idle: string,
    loading: string,
    success: string,
    error: string
  ): string => {
    switch (state) {
      case "loading":
        return loading;
      case "success":
        return success;
      case "error":
        return error;
      default:
        return idle;
    }
  };

  const getButtonVariant = (
    state: ButtonState,
    defaultVariant: "default" | "outline" = "default"
  ): "default" | "outline" | "destructive" => {
    if (state === "error") return "destructive";
    return defaultVariant;
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analyze Job</h1>
            <p className="text-gray-600">Paste a job description to get AI-powered analysis</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            ← Back to Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the full job posting here</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setAnalyzeError(null); // Clear error when typing
                  }}
                  placeholder="Paste job description here..."
                  rows={20}
                  className="mb-4"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !jobDescription.trim()}
                  variant={getButtonVariant(analyzeState)}
                  className={`w-full transition-colors ${
                    analyzeState === "success" ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                >
                  {getButtonText(
                    analyzeState,
                    "Analyze with AI",
                    "Analyzing...",
                    "✓ Analysis Complete",
                    "Analysis Failed"
                  )}
                </Button>
                {/* Inline error/info message */}
                {analyzeError && (
                  <p
                    role={analyzeError.type === "error" ? "alert" : "status"}
                    className={`mt-2 text-sm ${
                      analyzeError.type === "error" ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    {analyzeError.text}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div>
            {analysis && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{analysis.company}</span>
                      <Badge className={getMatchColor(analysis.matchScore)}>
                        {analysis.matchScore}% Match
                      </Badge>
                    </CardTitle>
                    <CardDescription>{analysis.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Top Requirements */}
                    <div>
                      <Label className="text-base mb-2 block">Top Requirements</Label>
                      <ul className="space-y-1">
                        {analysis.topRequirements.map((req, i) => (
                          <li key={i} className="text-sm">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills Match */}
                    <div>
                      <Label className="text-base mb-2 block">Your Matching Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsMatch.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Gaps */}
                    {analysis.gaps.length > 0 && (
                      <div>
                        <Label className="text-base mb-2 block">Skills to Address</Label>
                        <div className="flex flex-wrap gap-2">
                          {analysis.gaps.map((gap, i) => (
                            <Badge key={i} variant="outline" className="bg-yellow-50">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Red Flags */}
                    {analysis.redFlags.length > 0 && (
                      <div>
                        <Label className="text-base mb-2 block text-red-600">Concerns</Label>
                        <ul className="space-y-1">
                          {analysis.redFlags.map((flag, i) => (
                            <li key={i} className="text-sm text-red-600">
                              ⚠️ {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 space-y-2">
                      <Button
                        onClick={handleGenerateCoverLetter}
                        disabled={generatingCoverLetter}
                        variant={getButtonVariant(coverLetterState)}
                        className={`w-full transition-colors ${
                          coverLetterState === "success" ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                      >
                        {getButtonText(
                          coverLetterState,
                          "Generate Cover Letter",
                          "Generating...",
                          "✓ Generated!",
                          "Generation Failed"
                        )}
                      </Button>
                      {coverLetterError && (
                        <p role="alert" className="text-sm text-red-600">
                          {coverLetterError.text}
                        </p>
                      )}
                      <Button
                        onClick={handleSaveApplication}
                        disabled={saving}
                        variant={getButtonVariant(saveState, "outline")}
                        className={`w-full transition-colors ${
                          saveState === "success"
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                            : ""
                        }`}
                      >
                        {getButtonText(
                          saveState,
                          "Save to Tracker",
                          "Saving...",
                          "✓ Saved! Redirecting...",
                          "Save Failed"
                        )}
                      </Button>
                      {saveError && (
                        <p role="alert" className="text-sm text-red-600">
                          {saveError.text}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cover Letter */}
                {coverLetter && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Cover Letter</CardTitle>
                      <CardDescription>Edit as needed before applying</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={12}
                        className="mb-4"
                      />
                      <Button
                        onClick={handleCopyToClipboard}
                        variant={getButtonVariant(copyState, "outline")}
                        className={`w-full transition-colors ${
                          copyState === "success"
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                            : ""
                        }`}
                      >
                        {getButtonText(
                          copyState,
                          "Copy to Clipboard",
                          "Copying...",
                          "✓ Copied!",
                          "Copy Failed"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!analysis && (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p>Paste a job description and click &quot;Analyze&quot; to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
