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
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, Settings, X } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type JSX } from "react";

// ============================================
// SHEET PRIMITIVES (Bottom Drawer Style)
// ============================================

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-900/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title?: string }
>(({ className, children, title = "Settings", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-2xl border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
        "max-h-[85vh] overflow-hidden",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        "duration-300",
        className
      )}
      {...props}
    >
      {/* Accessible title (visually hidden) */}
      <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
      {/* Drag Handle */}
      <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

// ============================================
// TYPES
// ============================================

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

interface MobileSettingsSheetProps {
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
  /** ATS score (if analyzed) */
  atsScore?: number | null | undefined;
  /** Whether controls are disabled */
  disabled?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mobile Settings Sheet
 *
 * Bottom drawer containing secondary settings for mobile:
 * - Template selector
 * - AI Model selector
 * - ATS Score display
 */
export function MobileSettingsSheet({
  models,
  selectedModel,
  onModelChange,
  templates,
  selectedTemplate,
  onTemplateChange,
  atsScore,
  disabled = false,
}: MobileSettingsSheetProps): JSX.Element {
  const getATSColor = (score: number): string => {
    if (score >= 80)
      return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400";
    if (score >= 60) return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400";
    return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>

      <SheetContent>
        <div className="flex flex-col gap-6 p-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Editor Settings
            </h3>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          {/* ATS Score (if available) */}
          {atsScore !== null && atsScore !== undefined && (
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl",
                getATSColor(atsScore)
              )}
            >
              <span className="text-sm font-medium">ATS Compatibility Score</span>
              <span className="text-2xl font-bold">{atsScore}</span>
            </div>
          )}

          {/* Template Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Template
            </label>
            <Select value={selectedTemplate} onValueChange={onTemplateChange} disabled={disabled}>
              <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              AI Model
            </label>
            <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
              <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
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

          {/* Done Button */}
          <div className="pt-2">
            <SheetClose asChild>
              <Button
                disabled={disabled}
                className="h-12 w-full gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 dark:bg-cyan-500 dark:hover:bg-cyan-400 shadow-none!"
              >
                <Check className="h-5 w-5" />
                Done
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
