"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import { useState, type JSX, type KeyboardEvent, type ReactNode } from "react";

interface MobileAIBarProps {
  /** Called when user submits an AI instruction */
  onApply: (instruction: string) => void;
  /** Called when user clicks ATS check */
  onATSCheck: () => void;
  /** Whether the AI is currently processing */
  isModifying?: boolean;
  /** Whether ATS check is in progress */
  isAnalyzing?: boolean;
  /** Whether the input should be disabled */
  disabled?: boolean;
  /** Settings trigger element (e.g., MobileSettingsSheet) */
  settingsTrigger?: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Mobile AI Bar Component
 *
 * Fixed bottom bar for mobile CV editing with:
 * - Compact AI input field
 * - Apply and ATS buttons
 * - Settings trigger slot
 * - Thumb-friendly positioning
 */
export function MobileAIBar({
  onApply,
  onATSCheck,
  isModifying = false,
  isAnalyzing = false,
  disabled = false,
  settingsTrigger,
  className,
}: MobileAIBarProps): JSX.Element {
  const [instruction, setInstruction] = useState("");

  const handleApply = (): void => {
    if (!instruction.trim() || isModifying || disabled) return;
    onApply(instruction);
    setInstruction("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-40", // bottom-16 to sit above MobileBottomNav
        "bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700",
        "shadow-lg shadow-slate-900/10 dark:shadow-slate-900/50",
        className
      )}
    >
      <div className="px-3 py-3 space-y-2">
        {/* AI Input Row - Input + Apply */}
        <div className="flex items-center gap-2">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI..."
            disabled={isModifying || disabled}
            className={cn(
              "flex-1 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
              "text-base placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:border-cyan-500 focus:ring-cyan-500/20"
            )}
          />

          {/* Apply Button - inline with input */}
          <Button
            onClick={handleApply}
            disabled={!instruction.trim() || isModifying || disabled}
            size="icon"
            className="h-11 w-11 shrink-0 bg-cyan-500 hover:bg-cyan-600 text-slate-900 dark:bg-cyan-500 dark:hover:bg-cyan-400 shadow-none!"
          >
            {isModifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Secondary Row - Settings + ATS Check (equal width grid) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Settings Trigger */}
          {settingsTrigger}

          <Button
            variant="outline"
            onClick={onATSCheck}
            disabled={isAnalyzing || disabled}
            className="h-10 border-cyan-600 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Check ATS"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
