/**
 * CV Editor Page
 *
 * WHY: Allow users to upload, view, edit, and download their CV.
 * Uses AI to extract and modify LaTeX source for full formatting control.
 *
 * WHAT: PDF viewer + LaTeX editor with AI assistance + ATS compliance checking.
 *
 * HOW:
 * 1. Upload PDF → AI extracts LaTeX
 * 2. View PDF preview + edit LaTeX in textarea
 * 3. AI-assisted modifications via natural language
 * 4. Compile LaTeX → Download or save
 * 5. Check ATS compliance score
 */

"use client";

import type { JSX, ChangeEvent } from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ============================================
// TYPES
// ============================================

interface CVData {
  pdfUrl: string | null;
  latexUrl: string | null;
  latexContent: string | null;
  filename: string | null;
  uploadedAt: string | null;
}

interface ATSIssue {
  severity: "error" | "warning" | "info";
  message: string;
  suggestion: string;
}

interface ATSAnalysis {
  score: number;
  issues: ATSIssue[];
  summary: string;
}

interface Toast {
  type: "success" | "error" | "info";
  message: string;
}

type ViewMode = "pdf" | "latex" | "split";

// ============================================
// COMPONENT
// ============================================

export default function CVEditorPage(): JSX.Element {
  // State
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [latexContent, setLatexContent] = useState<string>("");
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [aiInstruction, setAiInstruction] = useState<string>("");
  const [toast, setToast] = useState<Toast | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // ============================================
  // EFFECTS
  // ============================================

  // Load existing CV data on mount
  useEffect(() => {
    void loadCVData();
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const showToast = (type: Toast["type"], message: string): void => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const loadCVData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/cv/store");

      if (response.ok) {
        const result = await response.json();
        setCvData(result.data);
        setLatexContent(result.data.latexContent || "");
        setPreviewPdfUrl(result.data.pdfUrl);
      }
    } catch (error) {
      console.error("Failed to load CV data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("error", "Only PDF files are supported.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv/store", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        showToast("error", result.error || "Upload failed");
        return;
      }

      setCvData(result.data);
      setLatexContent(result.data.latexContent || "");
      setPreviewPdfUrl(result.data.pdfUrl);
      setAtsAnalysis(null); // Clear old analysis
      showToast("success", "CV uploaded and LaTeX extracted!");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleCompile = async (save: boolean): Promise<void> => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to compile.");
      return;
    }

    try {
      setCompiling(true);
      const response = await fetch("/api/cv/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexContent, save }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.issues
          ? `Compilation failed: ${result.issues.join(", ")}`
          : result.error || "Compilation failed";
        showToast("error", errorMsg);
        return;
      }

      if (save) {
        setPreviewPdfUrl(result.pdfUrl);
        showToast("success", "CV compiled and saved!");
      } else {
        // Create blob URL from base64 for preview
        const pdfBlob = base64ToBlob(result.pdfBase64, "application/pdf");
        const blobUrl = URL.createObjectURL(pdfBlob);
        setPreviewPdfUrl(blobUrl);
        showToast("info", "Preview updated. Click 'Save' to persist changes.");
      }
    } catch (error) {
      console.error("Compile error:", error);
      showToast("error", "Compilation failed. Please try again.");
    } finally {
      setCompiling(false);
    }
  };

  const handleAIModify = async (): Promise<void> => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to modify.");
      return;
    }

    if (!aiInstruction.trim()) {
      showToast("error", "Please enter an instruction for the AI.");
      return;
    }

    try {
      setModifying(true);
      const response = await fetch("/api/cv/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexContent, instruction: aiInstruction }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast("error", result.error || "Modification failed");
        return;
      }

      setLatexContent(result.latexContent);
      setAiInstruction("");
      showToast("success", "CV modified! Click 'Preview' to see changes.");
    } catch (error) {
      console.error("Modify error:", error);
      showToast("error", "Modification failed. Please try again.");
    } finally {
      setModifying(false);
    }
  };

  const handleATSCheck = async (): Promise<void> => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      const response = await fetch("/api/cv/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexContent }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast("error", result.error || "Analysis failed");
        return;
      }

      setAtsAnalysis(result.data);
      showToast("success", "ATS analysis complete!");
    } catch (error) {
      console.error("ATS check error:", error);
      showToast("error", "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = (): void => {
    if (!previewPdfUrl) {
      showToast("error", "No PDF to download. Compile first.");
      return;
    }

    const link = document.createElement("a");
    link.href = previewPdfUrl;
    link.download = cvData?.filename || "cv.pdf";
    link.click();
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading CV editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CV Editor</h1>
        <p className="text-muted-foreground">
          Upload your CV, edit with AI assistance, and download a polished PDF.
        </p>
      </div>

      {/* Upload / Status Bar */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="cv-upload" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={uploading} asChild>
                    <span>{uploading ? "Uploading..." : "Upload PDF"}</span>
                  </Button>
                  {cvData?.filename && (
                    <span className="text-sm text-muted-foreground">
                      Current: {cvData.filename}
                    </span>
                  )}
                </div>
              </Label>
              <Input
                id="cv-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "pdf" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("pdf")}
              >
                PDF Only
              </Button>
              <Button
                variant={viewMode === "split" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("split")}
              >
                Split View
              </Button>
              <Button
                variant={viewMode === "latex" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("latex")}
              >
                LaTeX Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Area */}
      <div className={`grid gap-6 mb-6 ${viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* PDF Preview */}
        {(viewMode === "pdf" || viewMode === "split") && (
          <Card className="h-[600px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">PDF Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!previewPdfUrl}
                >
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)]">
              {previewPdfUrl ? (
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-full border rounded"
                  title="CV Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground border rounded bg-muted/20">
                  Upload a PDF or compile LaTeX to see preview
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* LaTeX Editor */}
        {(viewMode === "latex" || viewMode === "split") && (
          <Card className="h-[600px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">LaTeX Source</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompile(false)}
                    disabled={compiling || !latexContent}
                  >
                    {compiling ? "Compiling..." : "Preview"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCompile(true)}
                    disabled={compiling || !latexContent}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)]">
              <Textarea
                value={latexContent}
                onChange={(e) => setLatexContent(e.target.value)}
                className="w-full h-full font-mono text-sm resize-none"
                placeholder="Upload a PDF to extract LaTeX, or paste your LaTeX source here..."
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Assistant */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <CardDescription>
            Describe the changes you want to make and AI will modify your CV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder='e.g., "Add a new skill: Kubernetes" or "Make the summary more concise"'
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleAIModify();
                }
              }}
            />
            <Button
              onClick={handleAIModify}
              disabled={modifying || !latexContent || !aiInstruction}
            >
              {modifying ? "Modifying..." : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ATS Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">ATS Compliance Check</CardTitle>
              <CardDescription>
                Analyze your CV for Applicant Tracking System compatibility.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleATSCheck}
              disabled={analyzing || !latexContent}
            >
              {analyzing ? "Analyzing..." : "Check ATS Score"}
            </Button>
          </div>
        </CardHeader>
        {atsAnalysis && (
          <CardContent>
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4">
                <div
                  className={`text-4xl font-bold ${
                    atsAnalysis.score >= 80
                      ? "text-green-600"
                      : atsAnalysis.score >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {atsAnalysis.score}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        atsAnalysis.score >= 80
                          ? "bg-green-500"
                          : atsAnalysis.score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${atsAnalysis.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground">{atsAnalysis.summary}</p>

              {/* Issues */}
              {atsAnalysis.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Issues Found:</h4>
                  {atsAnalysis.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        issue.severity === "error"
                          ? "bg-red-50 border-red-200"
                          : issue.severity === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Badge
                          variant={
                            issue.severity === "error"
                              ? "destructive"
                              : issue.severity === "warning"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {issue.severity}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{issue.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            💡 {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ============================================
// UTILITIES
// ============================================

function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
