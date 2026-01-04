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

import { DiffView } from "@/components/cv/diff-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload, type UploadProgress } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHistory } from "@/lib/hooks/useHistory";
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

interface CVData {
  pdfUrl: string | null;
  latexUrl: string | null;
  latexContent: string | null;
  filename: string | null;
  uploadedAt: string | null;
  modelUsed?: string | null;
  fallbackUsed?: boolean;
  templateId?: string | null;
  extractedContent?: unknown; // JSON content for template switching
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
  // History hook for undo/redo functionality
  const {
    content: latexContent,
    previousContent,
    canUndo,
    canRedo,
    historyPosition,
    historyLength,
    setContent: setLatexContent,
    pushToHistory,
    undo,
    redo,
    reset: resetHistory,
  } = useHistory({ initialContent: "", enableKeyboardShortcuts: true });

  // State
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [aiInstruction, setAiInstruction] = useState<string>("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(false);

  // Advanced Mode toggle - hides LaTeX editor and AI tools by default
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState<boolean>(false);

  // Template selection state
  const [availableTemplates, setAvailableTemplates] = useState<TemplateInfo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tech-minimalist");
  const [extractedContent, setExtractedContent] = useState<unknown>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
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

  // Load existing CV data on mount only (not on dependency changes)
  useEffect(() => {
    void loadCVData();
    void loadAvailableModels();
    void loadAvailableTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const showToast = (type: Toast["type"], message: string): void => {
    setToast({ type, message });
    // Show errors longer (8s) than success/info (4s)
    const duration = type === "error" ? 8000 : 4000;
    setTimeout(() => setToast(null), duration);
  };

  const dismissToast = (): void => {
    setToast(null);
  };

  const loadAvailableModels = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cv/models");
      if (response.ok) {
        const result = await response.json();
        setAvailableModels(result.data.models);
        // Set default model to first available one
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

  /**
   * Handle template change - regenerates LaTeX from extracted content
   * This is instant (no AI call) if we have extractedContent
   */
  const handleTemplateChange = useCallback(
    async (newTemplateId: string): Promise<void> => {
      setSelectedTemplate(newTemplateId);

      // If we have extracted content, regenerate LaTeX with new template instantly
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
            // Push new content to history (previous content is auto-saved)
            pushToHistory(result.data.latexContent);
            showToast("success", `Switched to ${newTemplateId.replace("-", " ")} template`);

            // Clear preview to force recompile
            setPreviewPdfUrl(null);
          } else {
            showToast("error", "Failed to switch template");
          }
        } catch (error) {
          console.error("Template switch error:", error);
          showToast("error", "Failed to switch template");
        }
      }
      // If no extracted content yet, the template will be used on next upload
    },
    [extractedContent, pushToHistory]
  );

  const handleUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type - now supports PDF, DOCX, TEX
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
        const formData = new FormData();
        formData.append("file", file);
        formData.append("model", selectedModel);
        formData.append("template", selectedTemplate);

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
        // Reset history with new content (fresh start after upload)
        resetHistory(result.data.latexContent || "");
        setPreviewPdfUrl(result.data.pdfUrl);
        setAtsAnalysis(null); // Clear old analysis

        // Store extracted content for template switching
        if (result.data.extractedContent) {
          setExtractedContent(result.data.extractedContent);
        }

        // Track which model was used
        if (result.data.modelUsed) {
          setModelUsed(result.data.modelUsed);
          setFallbackUsed(result.data.fallbackUsed || false);

          if (result.data.fallbackUsed) {
            showToast(
              "info",
              `CV uploaded! Used ${result.data.modelUsed} (fallback from ${selectedModel})`
            );
          } else {
            showToast("success", `CV uploaded using ${result.data.modelUsed}!`);
          }
        } else {
          // TEX file - no model used
          setModelUsed(null);
          setFallbackUsed(false);
          showToast("success", "LaTeX file loaded!");
        }
      } catch (error) {
        console.error("Upload error:", error);
        showToast("error", "Upload failed. Please try again.");
        setUploadProgress({ status: "error", progress: 0, message: "Upload failed" });
      } finally {
        setUploading(false);
        // Reset progress after a delay
        setTimeout(() => {
          setUploadProgress({ status: "idle", progress: 0 });
        }, 2000);
      }
    },
    [selectedModel, selectedTemplate, resetHistory]
  );

  // Handler for FileUpload component (drag-and-drop)
  const handleFileSelect = useCallback(
    (file: File): void => {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const isTexFile = file.name.toLowerCase().endsWith(".tex");

      if (!validTypes.includes(file.type) && !isTexFile) {
        showToast("error", "Please upload a PDF, DOCX, or TEX file.");
        return;
      }

      // Create a synthetic event to reuse handleUpload logic
      const syntheticEvent = {
        target: {
          files: [file],
        },
      } as unknown as ChangeEvent<HTMLInputElement>;

      // Update progress
      setUploadProgress({ status: "uploading", progress: 30, step: "Uploading file..." });

      // Call the existing handler
      void handleUpload(syntheticEvent).then(() => {
        setUploadProgress({ status: "complete", progress: 100, step: "Done!" });
      });
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

      // Push new content to history (previous state is preserved for undo)
      pushToHistory(result.latexContent);
      setAiInstruction("");
      setShowDiff(true); // Show diff after AI modification
      showToast("success", "CV modified! Review changes below or click 'Preview'.");
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

  const handleOpenInOverleaf = (): void => {
    if (!latexContent.trim()) {
      showToast("error", "No LaTeX content to open.");
      return;
    }

    // Overleaf accepts URL-encoded LaTeX via snip parameter
    const encoded = encodeURIComponent(latexContent);
    const overleafUrl = `https://www.overleaf.com/docs?snip=${encoded}`;

    // Open in new tab
    window.open(overleafUrl, "_blank");
    showToast("info", "Opening in Overleaf. You can compile and download the PDF there.");
  };

  const handleDelete = async (): Promise<void> => {
    if (!cvData?.pdfUrl) {
      showToast("error", "No CV to delete.");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete your CV? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/cv/store", {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        showToast("error", result.error || "Failed to delete CV.");
        return;
      }

      // Clear local state
      setCvData(null);
      setLatexContent("");
      setPreviewPdfUrl(null);
      setAtsAnalysis(null);
      showToast("success", "CV deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Failed to delete CV. Please try again.");
    }
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
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md flex items-start gap-3 ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : toast.type === "error"
                ? "bg-red-50 text-red-800 border border-red-300"
                : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {/* Icon */}
          <span className="shrink-0 mt-0.5">
            {toast.type === "success" && (
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {toast.type === "info" && (
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </span>
          {/* Message */}
          <span className="flex-1 text-sm">{toast.message}</span>
          {/* Dismiss button */}
          <button
            onClick={dismissToast}
            className="shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">CV Editor</h1>
            <p className="text-muted-foreground">
              {advancedMode
                ? "Edit LaTeX source, use AI assistance, and check ATS compatibility."
                : "Upload your CV, choose a template, and download a polished PDF."}
            </p>
          </div>
          {/* Advanced Mode Toggle */}
          <Button
            variant={advancedMode ? "default" : "outline"}
            onClick={() => setAdvancedMode(!advancedMode)}
            className="shrink-0 w-full sm:w-auto"
          >
            {advancedMode ? "✓ Advanced Mode" : "⚡ Advanced Mode"}
          </Button>
        </div>
      </div>

      {/* Toolbar - Simplified for Simple Mode, Full for Advanced */}
      <Card className="mb-6">
        <CardContent className="py-4 space-y-4">
          {/* Row 1: Essential controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Template Selector - Always visible */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Template:</span>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={uploading}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-9">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Undo/Redo Controls - Always visible when there's content */}
            {latexContent && (
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Cmd+Z)"
                  className="h-11 sm:h-9 px-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Cmd+Shift+Z)"
                  className="h-11 sm:h-9 px-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                    />
                  </svg>
                </Button>
                {historyLength > 1 && (
                  <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
                    {historyPosition}/{historyLength}
                  </span>
                )}
              </div>
            )}

            {/* Model Selector - Only in Advanced Mode */}
            {advancedMode && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Model:</span>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={uploading}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11 sm:h-9">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id} disabled={!model.available}>
                        {model.name} ({model.cost}){!model.available && " - no key"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Spacer - hidden on mobile */}
            <div className="hidden sm:block flex-1" />

            {/* Upload Button */}
            <Button
              variant="default"
              disabled={uploading}
              onClick={() => document.getElementById("cv-upload")?.click()}
              className="w-full sm:w-auto h-11 sm:h-9"
            >
              {uploading ? "Extracting..." : "📄 Upload CV"}
            </Button>
            <Input
              id="cv-upload"
              type="file"
              accept=".pdf,.docx,.tex"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />

            {/* Download Button - Always visible when PDF available */}
            {previewPdfUrl && (
              <Button
                variant="secondary"
                onClick={handleDownload}
                className="w-full sm:w-auto h-11 sm:h-9"
              >
                ⬇️ Download PDF
              </Button>
            )}

            {/* Show Changes Button - Visible when there's history to compare */}
            {previousContent !== null && (
              <Button
                variant={showDiff ? "default" : "outline"}
                onClick={() => setShowDiff(!showDiff)}
                className="w-full sm:w-auto h-11 sm:h-9"
              >
                {showDiff ? "Hide Changes" : "Show Changes"}
              </Button>
            )}

            {/* View Mode Toggle - Only in Advanced Mode */}
            {advancedMode && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-full sm:w-auto justify-center">
                <Button
                  variant={viewMode === "pdf" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("pdf")}
                  className="h-9 sm:h-7 px-3 flex-1 sm:flex-none"
                >
                  PDF
                </Button>
                <Button
                  variant={viewMode === "split" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("split")}
                  className="h-9 sm:h-7 px-3 flex-1 sm:flex-none"
                >
                  Split
                </Button>
                <Button
                  variant={viewMode === "latex" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("latex")}
                  className="h-9 sm:h-7 px-3 flex-1 sm:flex-none"
                >
                  LaTeX
                </Button>
              </div>
            )}
          </div>

          {/* Row 2: File info (only shows when file is loaded) */}
          {cvData?.filename && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pt-2 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Current:</span>
                <span className="text-sm text-muted-foreground">{cvData.filename}</span>
                {modelUsed && (
                  <Badge variant={fallbackUsed ? "secondary" : "outline"} className="text-xs">
                    {modelUsed}
                    {fallbackUsed && " (fallback)"}
                  </Badge>
                )}
              </div>
              <div className="hidden sm:block flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 sm:h-7 w-full sm:w-auto"
              >
                Delete CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Editor Area */}
      <div
        className={`grid gap-6 mb-6 ${advancedMode && viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        {/* PDF Preview - Always visible in Simple Mode, conditional in Advanced Mode */}
        {(!advancedMode || viewMode === "pdf" || viewMode === "split") && (
          <Card className="min-h-[400px] md:min-h-[600px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">PDF Preview</CardTitle>
                {advancedMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!previewPdfUrl}
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="h-[350px] md:h-[calc(100%-60px)]">
              {previewPdfUrl ? (
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-full border rounded"
                  title="CV Preview"
                />
              ) : (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  progress={uploadProgress}
                  accept=".pdf,.docx,.tex"
                  maxSize={10 * 1024 * 1024}
                  disabled={uploading}
                  title="Upload your CV"
                  description="Drag and drop or click to browse (PDF, DOCX, or LaTeX)"
                  className="h-full"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* LaTeX Editor - Only in Advanced Mode */}
        {advancedMode && (viewMode === "latex" || viewMode === "split") && (
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleOpenInOverleaf}
                    disabled={!latexContent}
                    title="Open in Overleaf to compile (fallback if compilation fails)"
                  >
                    Open in Overleaf
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

      {/* AI Assistant - Only in Advanced Mode */}
      {advancedMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <CardDescription>
              Describe the changes you want to make and AI will modify your CV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                className="w-full sm:w-auto"
              >
                {modifying ? "Modifying..." : "Apply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff View - Shows changes after AI modification */}
      {showDiff && previousContent !== null && (
        <div className="mb-6">
          <DiffView
            before={previousContent}
            after={latexContent}
            onClose={() => setShowDiff(false)}
            title="AI Modification Changes"
          />
        </div>
      )}

      {/* ATS Analysis - Only in Advanced Mode */}
      {advancedMode && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                className="w-full sm:w-auto"
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
      )}
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
