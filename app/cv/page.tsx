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
import { MobileAIBar } from "@/components/cv/mobile-ai-bar";
import { MobileSettingsSheet } from "@/components/cv/mobile-settings-sheet";
import { LaTeXEditor } from "@/components/latex-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload, type UploadProgress } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useStorageCV, type CVData } from "@/lib/hooks";
import { useStorage } from "@/lib/storage/provider";
import { cn } from "@/lib/utils";
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
type MobileViewMode = "pdf" | "latex";

// ============================================
// COMPONENT
// ============================================

export default function CVEditorPage(): JSX.Element {
  // Storage adapter for file operations (loading PDFs from IndexedDB)
  const storage = useStorage();

  // CV hook for data management (storage handles local/demo mode)
  const {
    cvs,
    activeCV,
    loading: cvsLoading,
    updating: cvUpdating,
    uploading: cvUploading,
    update: updateCV,
    setActive: setActiveCV,
    upload: uploadCV,
    canAddMore,
  } = useStorageCV();

  // CV switching state
  const [isSwitchingCV, setIsSwitchingCV] = useState(false);

  // Current CV being edited
  const [currentCV, setCurrentCV] = useState<CVData | null>(null);
  const [latexContent, setLatexContent] = useState<string>("");
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>("pdf");
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");

  // Template selection state
  const [availableTemplates, setAvailableTemplates] = useState<TemplateInfo[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tech-minimalist");
  const [extractedContent, _setExtractedContent] = useState<unknown>(null);

  // Loading states
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

    // Helper to load PDF blob from local storage
    const loadLocalPdf = async (localUrl: string): Promise<void> => {
      try {
        const blob = await storage.getFile(localUrl);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          setPreviewPdfUrl(blobUrl);
        } else {
          // PDF not found in storage, try to compile from LaTeX
          setPreviewPdfUrl(null);
        }
      } catch (error) {
        console.error("Failed to load PDF from local storage:", error);
        setPreviewPdfUrl(null);
      }
    };

    if (activeCV) {
      setCurrentCV(activeCV);
      setLatexContent(activeCV.latexContent ?? "");
      setHasUnsavedChanges(false);

      // Handle PDF URL based on type
      const pdfUrl = activeCV.pdfUrl;
      if (pdfUrl && pdfUrl.length > 0) {
        if (pdfUrl.startsWith("local://")) {
          // Local storage URL - load blob and create displayable URL
          void loadLocalPdf(pdfUrl);
        } else {
          // Remote URL (Vercel Blob) - use directly
          setPreviewPdfUrl(pdfUrl);
        }
      } else {
        setPreviewPdfUrl(null);
        // Auto-compile if we have LaTeX content but no PDF URL
        if (activeCV.latexContent) {
          void compileLatexForPreview(activeCV.latexContent);
        }
      }
    } else {
      setCurrentCV(null);
      setLatexContent("");
      setPreviewPdfUrl(null);
    }
  }, [cvsLoading, activeCV, storage]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewPdfUrl && previewPdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

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
        setUploadProgress({
          status: "processing",
          progress: 30,
          step: "Extracting LaTeX...",
          message: `Using ${availableModels.find((m) => m.id === selectedModel)?.name || selectedModel}`,
        });

        // Use the storage-aware upload method
        const result = await uploadCV(file, {
          model: selectedModel,
          template: selectedTemplate,
          cvId: currentCV?.id,
        });

        if (!result) {
          setUploadProgress({
            status: "error",
            progress: 0,
            step: "Failed",
            message: "Upload failed",
          });
          showToast("error", "Failed to upload CV");
          return;
        }

        // Success!
        setUploadProgress({
          status: "complete",
          progress: 100,
          step: "Complete!",
          message: result.modelUsed
            ? `Extracted successfully with ${result.modelUsed}`
            : "Extracted successfully",
        });

        setLatexContent(result.cv.latexContent ?? "");
        setAtsAnalysis(null);
        setHasUnsavedChanges(false);

        // Handle PDF URL based on type
        const pdfUrl = result.cv.pdfUrl;
        if (pdfUrl && pdfUrl.length > 0) {
          if (pdfUrl.startsWith("local://")) {
            // Local storage URL - load blob and create displayable URL
            try {
              const blob = await storage.getFile(pdfUrl);
              if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                setPreviewPdfUrl(blobUrl);
              } else {
                setPreviewPdfUrl(null);
              }
            } catch {
              setPreviewPdfUrl(null);
            }
          } else {
            // Remote URL (Vercel Blob) - use directly
            setPreviewPdfUrl(pdfUrl);
          }
        } else {
          setPreviewPdfUrl(null);
        }

        showToast(
          "success",
          result.fallbackUsed ? "CV uploaded! (Used fallback model)" : "CV uploaded successfully!"
        );
      } catch (error) {
        console.error("Upload error:", error);
        const errorMsg =
          error instanceof Error ? error.message : "Upload failed. Please try again.";
        showToast("error", errorMsg);
        setUploadProgress({ status: "error", progress: 0, message: errorMsg });
      } finally {
        setTimeout(() => {
          setUploadProgress({ status: "idle", progress: 0 });
        }, 2000);
      }
    },
    [selectedModel, selectedTemplate, currentCV, canAddMore, uploadCV, availableModels, storage]
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

  // Mobile: Compile, save, and switch to PDF view
  const handleMobileSaveAndView = async (): Promise<void> => {
    await handleCompile(true);
    setMobileViewMode("pdf");
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

  /**
   * Switch to a different CV
   */
  const handleCVSwitch = async (cvId: string): Promise<void> => {
    if (cvId === currentCV?.id) return;

    // Warn about unsaved changes
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Switch CV anyway? Changes will be lost."
      );
      if (!confirmed) return;
    }

    setIsSwitchingCV(true);
    try {
      const success = await setActiveCV(cvId);
      if (success) {
        // The useEffect will handle loading the new CV when activeCV changes
        setHasUnsavedChanges(false);
        showToast("success", "Switched to selected CV");
      } else {
        showToast("error", "Failed to switch CV");
      }
    } finally {
      setIsSwitchingCV(false);
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
  // RENDER: SHARED COMPONENTS
  // ============================================

  // Toast notification (shared between layouts)
  const toastElement = toast && (
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
        {toast.type === "error" && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
        {toast.type === "info" && <Loader2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
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
  );

  // Hidden file input (shared)
  const fileInput = (
    <Input
      id="cv-upload"
      type="file"
      accept=".pdf,.docx,.tex"
      className="hidden"
      onChange={handleUpload}
      disabled={cvUploading}
    />
  );

  // PDF Preview Panel (desktop)
  const pdfPreviewPanel = (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-full">
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
        {previewPdfUrl && previewPdfUrl.length > 0 ? (
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
            disabled={cvUploading}
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
  );

  // PDF Preview Panel (mobile - title only, no download button)
  const mobilePdfPreviewPanel = (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-full">
      <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center h-8">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            PDF Preview
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        {previewPdfUrl && previewPdfUrl.length > 0 ? (
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
            disabled={cvUploading}
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
  );

  // LaTeX Editor Panel (desktop - with Preview button)
  const latexEditorPanel = (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-full">
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
  );

  // LaTeX Editor Panel (mobile - Save only, switches to PDF after)
  const mobileLatexEditorPanel = (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-full">
      <CardHeader className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between h-8">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            LaTeX Source
          </CardTitle>
          <Button
            size="sm"
            onClick={() => void handleMobileSaveAndView()}
            disabled={compiling || !latexContent}
            className="h-8 px-4 text-sm bg-cyan-500 hover:bg-cyan-600 text-slate-900 dark:bg-cyan-500 dark:hover:bg-cyan-400 shadow-none!"
          >
            {compiling ? "Saving..." : "Save"}
          </Button>
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
  );

  // ============================================
  // RENDER: MAIN PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Toast Notification */}
      {toastElement}

      {/* Hidden file input */}
      {fileInput}

      {/* ============================================ */}
      {/* DESKTOP LAYOUT (md and above) - UNCHANGED */}
      {/* ============================================ */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-6 py-4">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 shrink-0">
                CV Editor
              </h1>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              {/* CV Selector Dropdown */}
              <Select
                value={currentCV?.id ?? ""}
                onValueChange={(id) => void handleCVSwitch(id)}
                disabled={isSwitchingCV || cvs.length === 0}
              >
                <SelectTrigger className="w-auto max-w-[200px] h-8 bg-transparent border-0 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 gap-1">
                  <span className="truncate text-sm font-medium">
                    {currentCV?.name ?? (cvs.length === 0 ? "No CVs" : "Select CV")}
                  </span>
                </SelectTrigger>
                <SelectContent align="start">
                  {cvs.map((cv, index) => (
                    <SelectItem key={cv.id} value={cv.id} className="py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          {index + 1}
                        </span>
                        <span className="truncate max-w-[180px]">{cv.name}</span>
                        {cv.isActive && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasUnsavedChanges && (
                <Badge className="bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-600/30 text-xs shrink-0">
                  Unsaved
                </Badge>
              )}
            </div>

            <Button
              onClick={() => document.getElementById("cv-upload")?.click()}
              disabled={cvUploading}
              className="h-10 text-sm px-4 shrink-0"
            >
              {cvUploading ? (
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
          </div>
        </header>

        {/* AI Input Bar */}
        <div className="px-6 pt-4 bg-slate-100 dark:bg-slate-900/50">
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

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
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
              disabled={cvUploading}
              isSaving={cvUpdating}
              onSave={() => void handleSaveCV()}
              hasUnsavedChanges={hasUnsavedChanges}
              className="border-0 pt-0"
            />
          </div>
        </div>

        {/* Main Editor Area */}
        <main className="flex-1 px-6 py-4 min-h-0">
          <div className="max-w-[1600px] mx-auto h-full">
            <div
              className={`grid gap-4 h-[calc(100vh-300px)] min-h-[500px] ${
                viewMode === "split" ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {(viewMode === "pdf" || viewMode === "split") && pdfPreviewPanel}
              {(viewMode === "latex" || viewMode === "split") && latexEditorPanel}
            </div>
          </div>
        </main>
      </div>

      {/* ============================================ */}
      {/* MOBILE LAYOUT (below md) - NEW OPTIMIZED */}
      {/* ============================================ */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Mobile Header - Minimal */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">CV Editor</h1>
            <Button
              onClick={() => document.getElementById("cv-upload")?.click()}
              disabled={cvUploading}
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-slate-600 dark:text-slate-400"
            >
              {cvUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Control Bar - CV Selector + View Toggle */}
        <div className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-3 py-2">
          <div className="flex items-center gap-2">
            {/* CV Selector - Flexible width */}
            <Select
              value={currentCV?.id ?? ""}
              onValueChange={(id) => void handleCVSwitch(id)}
              disabled={isSwitchingCV || cvs.length === 0}
            >
              <SelectTrigger className="flex-1 h-10 px-3 bg-slate-200 dark:bg-slate-800 border-0 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 gap-2">
                <span className="truncate text-sm font-medium">
                  {currentCV?.name ?? (cvs.length === 0 ? "No CVs" : "Select CV")}
                </span>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                )}
              </SelectTrigger>
              <SelectContent align="start">
                {cvs.map((cv, index) => (
                  <SelectItem key={cv.id} value={cv.id} className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <span className="truncate max-w-[160px]">{cv.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle - Fixed width */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-1 shrink-0">
              {(["pdf", "latex"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMobileViewMode(mode)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                    mobileViewMode === mode
                      ? "bg-cyan-500 text-slate-900"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  {mode === "pdf" ? "PDF" : "LaTeX"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Main Content - Full height panel */}
        <main className="flex-1 overflow-hidden pb-48">
          <div className="h-full p-2">
            {mobileViewMode === "pdf" ? mobilePdfPreviewPanel : mobileLatexEditorPanel}
          </div>
        </main>

        {/* Mobile Bottom AI Bar */}
        <MobileAIBar
          onApply={handleAIModify}
          onATSCheck={handleATSCheck}
          isModifying={modifying}
          isAnalyzing={analyzing}
          disabled={!latexContent.trim()}
          settingsTrigger={
            <MobileSettingsSheet
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
              atsScore={atsAnalysis?.score}
              disabled={cvUploading}
            />
          }
        />
      </div>
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
