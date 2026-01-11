"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { useState, type JSX, type KeyboardEvent } from "react";

interface AIInputBarProps {
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
  /** Additional class names */
  className?: string;
}

/**
 * AI Input Bar Component
 *
 * Prominent, sticky input bar for AI-powered CV modifications.
 * Features:
 * - Large input field with placeholder suggestions
 * - Apply and ATS Check buttons
 * - Loading states with visual feedback
 * - Keyboard shortcut support (Enter to apply)
 */
export function AIInputBar({
  onApply,
  onATSCheck,
  isModifying = false,
  isAnalyzing = false,
  disabled = false,
  className,
}: AIInputBarProps): JSX.Element {
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
        "bg-white dark:bg-linear-to-r dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-lg",
        "flex flex-col sm:flex-row items-stretch sm:items-center gap-3",
        className
      )}
    >
      {/* AI Icon - Hidden on mobile */}
      <div className="hidden sm:flex w-10 h-10 bg-linear-to-br from-cyan-400 to-sky-500 rounded-lg items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
        {isModifying ? (
          <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5 text-slate-900" />
        )}
      </div>

      {/* Input Field */}
      <Input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask AI to modify your CV..."
        disabled={isModifying || disabled}
        className={cn(
          "flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "h-11 text-base",
          "focus:border-cyan-500 focus:ring-cyan-500/20",
          "transition-all duration-200"
        )}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleApply}
          disabled={!instruction.trim() || isModifying || disabled}
          className="h-11 px-4 sm:px-5 flex-1 sm:flex-none"
        >
          {isModifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Applying...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Apply Changes</span>
              <span className="sm:hidden">Apply</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onATSCheck}
          disabled={isAnalyzing || disabled}
          className="h-11 px-4 border-cyan-600 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 flex-1 sm:flex-none"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Checking...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Check ATS</span>
              <span className="sm:hidden">ATS</span>
            </>
          )}
        </Button>
      </div>

      {/* Keyboard Hint - Hidden on mobile */}
      <span className="hidden lg:flex items-center text-xs text-slate-500 ml-2">
        Press{" "}
        <kbd className="mx-1 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400 font-mono text-xs">
          Enter
        </kbd>{" "}
        to apply
      </span>
    </div>
  );
}
