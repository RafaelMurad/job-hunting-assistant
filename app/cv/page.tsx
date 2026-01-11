/**
 * CV Editor Page
 *
 * WHY: Allow users to upload, view, edit, and download their CV.
 * Uses AI to extract and modify LaTeX source for full formatting control.
 *
 * WHAT: PDF viewer + LaTeX editor with AI assistance + ATS compliance checking.
 *
 * HOW:
 * 1. Upload PDF → AI extracts LaTeX → Creates CV record
 * 2. View PDF preview + edit LaTeX in split view
 * 3. AI-assisted modifications via prominent input bar
 * 4. Compile LaTeX → Download or save
 * 5. Check ATS compliance score
 */

"use client";

import { AIInputBar } from "@/components/cv/ai-input-bar";
import { EditorToolbar } from "@/components/cv/editor-toolbar";
import { LaTeXEditor } from "@/components/latex-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload, type UploadProgress } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { useCV, type CVItem } from "@/lib/hooks/useCV";
import { CheckCircle, Loader2, Upload, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useState, type ChangeEvent, type JSX } from "react";

// ============================================
// TYPES
// ============================================

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  cost: string;
  description: string;
  available: boolean;
}

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  usage: string;
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
  // CV hook for data management
  const {
    activeCV,
    loading: cvsLoading,
    updating: cvUpdating,
    update: updateCV,
    refetch: refetchCVs,
    canAddMore,
  } = useCV();

  // Current CV being edited
  const [currentCV, setCurrentCV] = useState<CVItem | null>(null);
  const [latexContent, setLatexContent] = useState<string>("");
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");

  // Template selection state
  const [availableTemplates, setAvailableTemplates] = useState<TemplateInfo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tech-minimalist");
  const [extractedContent, setExtractedContent] = useState<unknown>(null);

  // Loading states
  const [uploading, setUploading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
  });

  // ============================================
  // EFFECTS
  // ============================================

  // Load active CV when hook data is ready
  useEffect(() => {
    if (cvsLoading) return;

    if (activeCV) {
      setCurrentCV(activeCV);
      setLatexContent(activeCV.latexContent ?? "");
      setPreviewPdfUrl(activeCV.pdfUrl);
      setHasUnsavedChanges(false);

      // Auto-compile if we have LaTeX content but no PDF URL
      if (activeCV.latexContent && !activeCV.pdfUrl) {
        void compileLatexForPreview(activeCV.latexContent);
      }
    } else {
      setCurrentCV(null);
      setLatexContent("");
      setPreviewPdfUrl(null);
    }
  }, [cvsLoading, activeCV]);

  // Load models and templates on mount
  useEffect(() => {
    void loadAvailableModels();
    void loadAvailableTemplates();
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (currentCV && latexContent !== (currentCV.latexContent ?? "")) {
      setHasUnsavedChanges(true);
    }
  }, [latexContent, currentCV]);

  // ============================================
  // HELPERS
  // ============================================

  const showToast = (type: Toast["type"], message: string): void => {
    setToast({ type, message });
    const duration = type === "error" ? 8000 : 4000;
    setTimeout(() => setToast(null), duration);
  };

  const dismissToast = (): void => {
    setToast(null);
  };

  /**
   * Compile LaTeX content for preview (without saving).
   * Used to auto-generate PDF preview when loading CV with LaTeX but no PDF URL.
   */
  const compileLatexForPreview = async (latex: string): Promise<void> => {
    if (!latex.trim()) return;

    try {
      setCompiling(true);
      const response = await fetch("/api/cv/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexContent: latex, save: false }),
      });

      const result = await response.json();

      if (response.ok && result.pdfBase64) {
        const pdfBlob = base64ToBlob(result.pdfBase64, "application/pdf");
        const blobUrl = URL.createObjectURL(pdfBlob);
        setPreviewPdfUrl(blobUrl);
      }
    } catch (error) {
      console.error("Auto-compile preview error:", error);
      // Don't show toast for auto-compile - it's a background operation
    } finally {
      setCompiling(false);
    }
  };

  const loadAvailableModels = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cv/models");
      if (response.ok) {
        const result = await response.json();
        setAvailableModels(result.data.models);
        const firstAvailable = result.data.models.find((m: ModelInfo) => m.available);
        if (firstAvailable) {
          setSelectedModel(firstAvailable.id);
        }
      }
    } catch (error) {
      console.error("Failed to load available models:", error);
    }
  };

  const loadAvailableTemplates = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cv/template");
      if (response.ok) {
        const result = await response.json();
        setAvailableTemplates(result.data);
      }
    } catch (error) {
      console.error("Failed to load available templates:", error);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleTemplateChange = useCallback(
    async (newTemplateId: string): Promise<void> => {
      setSelectedTemplate(newTemplateId);

      if (extractedContent) {
        try {
          const response = await fetch("/api/cv/template", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: extractedContent,
              templateId: newTemplateId,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            setLatexContent(result.data.latexContent);
            showToast("success", `Switched to ${newTemplateId.replace("-", " ")} template`);
            setPreviewPdfUrl(null);
          } else {
            showToast("error", "Failed to switch template");
          }
        } catch (error) {
          console.error("Template switch error:", error);
          showToast("error", "Failed to switch template");
        }
      }
    },
    [extractedContent]
  );

  const handleUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!currentCV && !canAddMore) {
        showToast("error", "Maximum of 5 CVs reached. Please delete one before uploading.");
        return;
      }

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const isTexFile = file.name.toLowerCase().endsWith(".tex");

      if (!validTypes.includes(file.type) && !isTexFile) {
        showToast("error", "Please upload a PDF, DOCX, or TEX file.");
        return;
      }

      try {
        setUploading(true);

        // Get list of models to try (selected first, then others)
        const modelsToTry = [
          selectedModel,
          ...availableModels.filter((m) => m.available && m.id !== selectedModel).map((m) => m.id),
        ];

        let lastError: string | null = null;
        const totalModels = modelsToTry.length;

        // Try each model until one succeeds
        for (let i = 0; i < modelsToTry.length; i++) {
          const modelToTry = modelsToTry[i];
          if (!modelToTry) continue;

          const modelName = availableModels.find((m) => m.id === modelToTry)?.name || modelToTry;
          const attemptNumber = i + 1;

          // Update progress with model info
          setUploadProgress({
            status: "processing",
            progress: Math.round((attemptNumber / totalModels) * 50),
            step: `Extracting with ${modelName}...`,
            message:
              attemptNumber > 1
                ? `Attempt ${attemptNumber}/${totalModels} - Previous model was rate limited`
                : `Using ${modelName}`,
          });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("model", modelToTry);
          formData.append("template", selectedTemplate);

          if (currentCV) {
            formData.append("cvId", currentCV.id);
          }

          try {
            const response = await fetch("/api/cv/store", {
              method: "POST",
              body: formData,
            });

            const result = await response.json();

            if (response.ok) {
              // Success!
              setUploadProgress({
                status: "complete",
                progress: 100,
                step: "Complete!",
                message: `Extracted successfully with ${modelName}`,
              });

              setLatexContent(result.data.latexContent || "");
              setPreviewPdfUrl(result.data.pdfUrl);
              setAtsAnalysis(null);
              setHasUnsavedChanges(false);

              if (result.data.extractedContent) {
                setExtractedContent(result.data.extractedContent);
              }

              refetchCVs();
              const usedModel = result.data.modelUsed || modelToTry;
              showToast(
                "success",
                attemptNumber > 1
                  ? `CV uploaded! (Used ${usedModel} after ${attemptNumber - 1} retries)`
                  : "CV uploaded successfully!"
              );
              return;
            }

            // Check if we should retry with another model
            const errorMsg = result.error || "Upload failed";
            const errorLower = errorMsg.toLowerCase();

            // Retry on rate limits OR any server error (500s are often transient)
            const shouldRetry =
              response.status >= 500 ||
              errorLower.includes("rate limit") ||
              errorLower.includes("quota") ||
              errorLower.includes("429") ||
              errorLower.includes("exhausted") ||
              errorLower.includes("error occurred") ||
              errorLower.includes("try again");

            if (shouldRetry && i < modelsToTry.length - 1) {
              console.warn(
                `[Upload] ${modelToTry} failed (${response.status}): ${errorMsg}, trying next model...`
              );
              lastError = errorMsg;

              // Show retry feedback
              setUploadProgress({
                status: "processing",
                progress: Math.round(((i + 1) / totalModels) * 50),
                step: `${modelName} failed`,
                message: `Retrying with next model... (${i + 1}/${totalModels})`,
              });

              // Small delay before retry
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }

            // No more models to try or non-retryable error
            setUploadProgress({
              status: "error",
              progress: 0,
              step: "Failed",
              message: errorMsg,
            });
            showToast("error", errorMsg);
            return;
          } catch (fetchError) {
            console.error(`[Upload] Fetch error for ${modelToTry}:`, fetchError);
            lastError = "Network error";
            if (i < modelsToTry.length - 1) continue;
          }
        }

        // All models failed
        setUploadProgress({
          status: "error",
          progress: 0,
          step: "All models failed",
          message: "All AI models are rate limited",
        });
        showToast(
          "error",
          lastError || "All AI models are rate limited. Please wait and try again."
        );
      } catch (error) {
        console.error("Upload error:", error);
        showToast("error", "Upload failed. Please try again.");
        setUploadProgress({ status: "error", progress: 0, message: "Upload failed" });
      } finally {
        setUploading(false);
        setTimeout(() => {
          setUploadProgress({ status: "idle", progress: 0 });
        }, 2000);
      }
    },
    [selectedModel, selectedTemplate, currentCV, canAddMore, refetchCVs, availableModels]
  );

  const handleFileSelect = useCallback(
    (file: File): void => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const isTexFile = file.name.toLowerCase().endsWith(".tex");

      if (!validTypes.includes(file.type) && !isTexFile) {
        showToast("error", "Please upload a PDF, DOCX, or TEX file.");
        return;
      }

      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as ChangeEvent<HTMLInputElement>;

      setUploadProgress({ status: "uploading", progress: 10, step: "Starting upload..." });

      // Don't override progress - handleUpload manages its own progress state
      void handleUpload(syntheticEvent);
    },
    [handleUpload]
  );

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

  const handleAIModify = async (instruction: string): Promise<void> => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to modify. Upload a CV first.");
      return;
    }

    try {
      setModifying(true);
      const response = await fetch("/api/cv/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latexContent, instruction }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast("error", result.error || "Modification failed");
        return;
      }

      setLatexContent(result.latexContent);
      showToast("success", "CV modified! Preview will update shortly.");

      // Auto-compile after modification
      void handleCompile(false);
    } catch (error) {
      console.error("Modify error:", error);
      showToast("error", "Modification failed. Please try again.");
    } finally {
      setModifying(false);
    }
  };

  const handleATSCheck = async (): Promise<void> => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to analyze. Upload a CV first.");
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
      showToast("success", `ATS Score: ${result.data.score}/100`);
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
    link.download = currentCV?.name || "cv.pdf";
    link.click();
  };

  const handleOpenInOverleaf = (): void => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to open.");
      return;
    }

    const encoded = encodeURIComponent(latexContent);
    const overleafUrl = `https://www.overleaf.com/docs?snip=${encoded}`;
    window.open(overleafUrl, "_blank");
    showToast("info", "Opening in Overleaf...");
  };

  const handleSaveCV = async (): Promise<void> => {
    if (!currentCV || !hasUnsavedChanges) return;

    const result = await updateCV({
      id: currentCV.id,
      latexContent,
    });

    if (result) {
      setHasUnsavedChanges(false);
      showToast("success", "CV saved successfully!");
    } else {
      showToast("error", "Failed to save CV.");
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (cvsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading CV editor...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md flex items-start gap-3 animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700"
              : toast.type === "error"
                ? "bg-red-50 dark:bg-red-900/90 text-red-800 dark:text-red-100 border border-red-200 dark:border-red-700"
                : "bg-sky-50 dark:bg-sky-900/90 text-sky-800 dark:text-sky-100 border border-sky-200 dark:border-sky-700"
          }`}
        >
          <span className="shrink-0 mt-0.5">
            {toast.type === "success" && (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
            {toast.type === "error" && (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            {toast.type === "info" && (
              <Loader2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            )}
          </span>
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={dismissToast}
            className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CV Editor</h1>
            {currentCV && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">{currentCV.name}</span>
                {currentCV.isActive && (
                  <Badge className="bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-600/30 text-xs">
                    Active
                  </Badge>
                )}
                {hasUnsavedChanges && (
                  <Badge className="bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-600/30 text-xs">
                    Unsaved
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={() => document.getElementById("cv-upload")?.click()}
            disabled={uploading}
            className="h-10"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload CV
              </>
            )}
          </Button>
          <Input
            id="cv-upload"
            type="file"
            accept=".pdf,.docx,.tex"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      </header>

      {/* AI Input Bar */}
      <div className="px-4 sm:px-6 pt-4 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-[1600px] mx-auto">
          <AIInputBar
            onApply={handleAIModify}
            onATSCheck={handleATSCheck}
            isModifying={modifying}
            isAnalyzing={analyzing}
            disabled={!latexContent.trim()}
          />
        </div>
      </div>

      {/* Toolbar - Between AI input and editor */}
      <div className="px-4 sm:px-6 py-3 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto">
          <EditorToolbar
            models={availableModels.map((m) => ({
              id: m.id,
              name: m.name,
              cost: m.cost,
              available: m.available,
            }))}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            templates={availableTemplates.map((t) => ({ id: t.id, name: t.name }))}
            selectedTemplate={selectedTemplate}
            onTemplateChange={(id) => void handleTemplateChange(id)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            atsScore={atsAnalysis?.score}
            onDownload={handleDownload}
            onOpenOverleaf={handleOpenInOverleaf}
            downloadDisabled={!previewPdfUrl}
            disabled={uploading}
            isSaving={cvUpdating}
            onSave={() => void handleSaveCV()}
            hasUnsavedChanges={hasUnsavedChanges}
            className="border-0 pt-0"
          />
        </div>
      </div>

      {/* Main Editor Area */}
      <main className="flex-1 px-4 sm:px-6 py-4 min-h-0">
        <div className="max-w-[1600px] mx-auto h-full">
          <div
            className={`grid gap-4 h-[calc(100vh-340px)] sm:h-[calc(100vh-300px)] min-h-[400px] sm:min-h-[500px] ${
              viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* PDF Preview Panel */}
            {(viewMode === "pdf" || viewMode === "split") && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      PDF Preview
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!previewPdfUrl}
                      className="h-7 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden">
                  {previewPdfUrl ? (
                    <iframe
                      src={previewPdfUrl}
                      className="w-full h-full border border-slate-200 dark:border-slate-600 rounded-lg bg-white"
                      title="CV Preview"
                    />
                  ) : (
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      progress={uploadProgress}
                      accept=".pdf,.docx,.tex"
                      maxSize={10 * 1024 * 1024}
                      disabled={uploading}
                      title={
                        currentCV && !currentCV.latexContent
                          ? "Re-upload to enable editing"
                          : "Upload your CV"
                      }
                      description={
                        currentCV && !currentCV.latexContent
                          ? "This CV was imported without content. Upload the file again to edit it."
                          : "Drag and drop or click to browse (PDF, DOCX, or LaTeX)"
                      }
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* LaTeX Editor Panel */}
            {(viewMode === "latex" || viewMode === "split") && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      LaTeX Source
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleCompile(false)}
                        disabled={compiling || !latexContent}
                        className="h-7 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        {compiling ? "Compiling..." : "Preview"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => void handleCompile(true)}
                        disabled={compiling || !latexContent}
                        className="h-7 text-xs"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <LaTeXEditor
                    value={latexContent}
                    onChange={setLatexContent}
                    placeholder="Upload a CV to extract LaTeX, or paste your LaTeX source here..."
                    className="h-full border-0 rounded-none"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================
// UTILITIES
// ============================================

function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from({ length: byteCharacters.length }, (_, i) =>
    byteCharacters.charCodeAt(i)
  );
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
