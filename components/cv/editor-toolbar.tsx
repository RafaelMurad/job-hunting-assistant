"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import type { JSX } from "react";

interface ModelInfo {
  id: string;
  name: string;
  cost: string;
  available: boolean;
}

interface TemplateInfo {
  id: string;
  name: string;
}

type ViewMode = "pdf" | "latex" | "split";

interface EditorToolbarProps {
  /** Available AI models */
  models: ModelInfo[];
  /** Selected model ID */
  selectedModel: string;
  /** Called when model changes */
  onModelChange: (modelId: string) => void;
  /** Available templates */
  templates: TemplateInfo[];
  /** Selected template ID */
  selectedTemplate: string;
  /** Called when template changes */
  onTemplateChange: (templateId: string) => void;
  /** Current view mode */
  viewMode: ViewMode;
  /** Called when view mode changes */
  onViewModeChange: (mode: ViewMode) => void;
  /** ATS score (if analyzed) */
  atsScore?: number | null | undefined;
  /** Called when download is clicked */
  onDownload: () => void;
  /** Called when Open in Overleaf is clicked */
  onOpenOverleaf: () => void;
  /** Whether download is disabled */
  downloadDisabled?: boolean;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Whether saving is in progress */
  isSaving?: boolean;
  /** Called when save is clicked */
  onSave?: () => void;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Editor Toolbar Component
 *
 * Footer toolbar with secondary controls:
 * - Template and model selectors
 * - View mode toggle (PDF/Split/LaTeX)
 * - ATS score indicator
 * - Download and Overleaf buttons
 */
export function EditorToolbar({
  models,
  selectedModel,
  onModelChange,
  templates,
  selectedTemplate,
  onTemplateChange,
  viewMode,
  onViewModeChange,
  atsScore,
  onDownload,
  onOpenOverleaf,
  downloadDisabled = false,
  disabled = false,
  isSaving = false,
  onSave,
  hasUnsavedChanges = false,
  className,
}: EditorToolbarProps): JSX.Element {
  const getATSColor = (score: number): string => {
    if (score >= 80)
      return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400";
    if (score >= 60) return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400";
    return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400";
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      {/* Left: Selectors */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-500">Template:</span>
          <Select value={selectedTemplate} onValueChange={onTemplateChange} disabled={disabled}>
            <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-500">AI Model:</span>
          <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
            <SelectTrigger className="w-[180px] h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id} disabled={!model.available}>
                  {model.name} ({model.cost}){!model.available && " - no key"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          {(["pdf", "split", "latex"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === mode
                  ? "bg-cyan-500 text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {mode === "pdf" ? "PDF" : mode === "split" ? "Split" : "LaTeX"}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* ATS Score */}
        {atsScore !== null && atsScore !== undefined && (
          <>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                getATSColor(atsScore)
              )}
            >
              <span className="text-lg font-bold">{atsScore}</span>
              <span className="text-xs">ATS</span>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          </>
        )}

        {/* Save Button */}
        {onSave && hasUnsavedChanges && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving || disabled}
            className="h-9 border-slate-300 dark:border-slate-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        )}

        {/* Open in Overleaf */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenOverleaf}
          disabled={downloadDisabled || disabled}
          className="h-9 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Open in Overleaf</span>
          <span className="sm:hidden">Overleaf</span>
        </Button>

        {/* Download */}
        <Button onClick={onDownload} disabled={downloadDisabled || disabled} className="h-9">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
