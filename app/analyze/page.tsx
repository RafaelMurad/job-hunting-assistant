"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAnalyze, useStorageApplications, type ButtonState } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useState, type Dispatch, type JSX, type SetStateAction } from "react";

export default function AnalyzePage(): JSX.Element {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Button states for save and copy (local to this page)
  const [saveState, setSaveState] = useState<ButtonState>("idle");
  const [copyState, setCopyState] = useState<ButtonState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Use abstracted hooks (auth handled by tRPC middleware)
  const {
    analysis,
    coverLetter,
    analyzeState,
    coverLetterState,
    analyzeError,
    coverLetterError,
    analyze,
    generateCoverLetter,
    setCoverLetter,
  } = useAnalyze();

  const { create: createApplication } = useStorageApplications();

  // Helper to reset button state after delay
  const resetButtonState = (setter: Dispatch<SetStateAction<ButtonState>>, delay = 2000): void => {
    setTimeout(() => setter("idle"), delay);
  };

  const handleAnalyze = (): void => {
    setInputError(null);

    if (!jobDescription.trim()) {
      setInputError("Please enter a job description");
      return;
    }

    analyze(jobDescription);
  };

  const handleGenerateCoverLetter = (): void => {
    if (!analysis) return;
    generateCoverLetter(jobDescription, analysis);
  };

  const handleSaveApplication = async (): Promise<void> => {
    if (!analysis) return;

    setSaveError(null);
    setSaveState("loading");

    const success = await createApplication({
      company: analysis.company,
      role: analysis.role,
      jobDescription,
      matchScore: analysis.matchScore,
      analysis: JSON.stringify(analysis),
      coverLetter: coverLetter || "",
      status: "saved",
    });

    if (success) {
      setSaveState("success");
      // Redirect after brief success feedback
      setTimeout(() => router.push("/tracker"), 1000);
    } else {
      setSaveState("error");
      setSaveError("Failed to save application");
      resetButtonState(setSaveState, 3000);
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
    if (score >= 80) return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200";
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200";
    if (score >= 40)
      return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200";
    return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200";
  };

  // Generate actionable tips for skill gaps
  const getSkillTip = (skill: string): string => {
    const skillLower = skill.toLowerCase();

    // Programming languages
    if (skillLower.includes("python")) {
      return "Complete a Python crash course on YouTube (4-6 hours), then build a small project like a CLI tool or web scraper.";
    }
    if (skillLower.includes("typescript") || skillLower.includes("javascript")) {
      return "Work through TypeScript basics on typescript-exercises.github.io, then add types to an existing JS project.";
    }
    if (skillLower.includes("react")) {
      return "Build a small React app with state management. The official React docs have excellent interactive tutorials.";
    }
    if (skillLower.includes("node")) {
      return "Create a simple REST API with Express.js. Focus on understanding async patterns and middleware.";
    }

    // Cloud & DevOps
    if (skillLower.includes("aws") || skillLower.includes("cloud")) {
      return "Start with AWS Free Tier - deploy a static site to S3 and set up CloudFront. AWS provides excellent free training.";
    }
    if (skillLower.includes("docker") || skillLower.includes("container")) {
      return "Containerize an existing project. Docker's official 'Get Started' guide walks you through in under 2 hours.";
    }
    if (skillLower.includes("kubernetes") || skillLower.includes("k8s")) {
      return "Try minikube locally, then deploy a simple app. Focus on understanding pods, services, and deployments.";
    }
    if (skillLower.includes("ci/cd") || skillLower.includes("pipeline")) {
      return "Set up GitHub Actions for an existing repo - start with a simple test + lint workflow.";
    }

    // Databases
    if (skillLower.includes("mongodb") || skillLower.includes("nosql")) {
      return "Build a small CRUD app with MongoDB Atlas (free tier). MongoDB University has excellent free courses.";
    }
    if (skillLower.includes("sql") || skillLower.includes("database")) {
      return "Practice on SQLZoo or LeetCode's database problems. Focus on JOINs, aggregations, and indexing.";
    }

    // Soft skills & methodologies
    if (skillLower.includes("agile") || skillLower.includes("scrum")) {
      return "Read the Agile Manifesto, then consider a Scrum certification. Contribute to open source to practice collaborative workflows.";
    }
    if (skillLower.includes("communication") || skillLower.includes("leadership")) {
      return "Start a technical blog or contribute to documentation. Lead code reviews or mentor junior developers.";
    }

    // AI/ML
    if (
      skillLower.includes("machine learning") ||
      skillLower.includes("ml") ||
      skillLower.includes("ai")
    ) {
      return "Start with fast.ai's practical deep learning course - it's free and project-focused.";
    }

    // Default tip
    return `Search for '${skill} crash course' on YouTube, or find a beginner project tutorial. Hands-on practice is the fastest path to competency.`;
  };

  // Combined error display (input error or analyze error)
  const displayError = inputError || analyzeError;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-4 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header - Compact on mobile, hide back button (use bottom nav) */}
        <div className="mb-4 sm:mb-8 flex justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-slate-100">
              Analyze Job
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Paste a job description to get AI-powered analysis
            </p>
          </div>
          {/* Hide on mobile - accessible via bottom nav */}
          <Button
            variant="outline"
            onClick={() => router.push("/profile")}
            className="hidden sm:inline-flex"
          >
            ← Back to Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Section */}
          <div>
            <Card>
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Job Description</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Paste the full job posting here
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setInputError(null); // Clear error when typing
                  }}
                  placeholder="Paste job description here..."
                  rows={12}
                  className="mb-3 sm:mb-4 text-sm sm:text-base min-h-[200px] sm:min-h-[300px]"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeState === "loading" || !jobDescription.trim()}
                  variant={getButtonVariant(analyzeState)}
                  className={`w-full h-11 transition-colors ${
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
                {displayError && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {displayError}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div>
            {analysis && (
              <div className="space-y-3 sm:space-y-4">
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-base sm:text-lg truncate">{analysis.company}</span>
                      <Badge
                        className={`${getMatchColor(analysis.matchScore)} shrink-0 self-start sm:self-auto`}
                      >
                        {analysis.matchScore}% Match
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {analysis.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
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
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Gaps with Actionable Tips */}
                    {analysis.gaps.length > 0 && (
                      <div>
                        <Label className="text-base mb-2 block">Skills to Address</Label>
                        <div className="space-y-3">
                          {analysis.gaps.map((gap, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 shrink-0"
                                >
                                  {gap}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                💡 <span className="font-medium">Quick wins:</span>{" "}
                                {getSkillTip(gap)}
                              </p>
                            </div>
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
                    <div className="pt-3 sm:pt-4 space-y-2">
                      <Button
                        onClick={handleGenerateCoverLetter}
                        disabled={coverLetterState === "loading"}
                        variant={getButtonVariant(coverLetterState)}
                        className={`w-full h-11 transition-colors ${
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
                          {coverLetterError}
                        </p>
                      )}
                      <Button
                        onClick={handleSaveApplication}
                        disabled={saveState === "loading"}
                        variant={getButtonVariant(saveState, "outline")}
                        className={`w-full h-11 transition-colors ${
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
                          {saveError}
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
                <CardContent className="py-12 text-center text-gray-500 dark:text-slate-400">
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
