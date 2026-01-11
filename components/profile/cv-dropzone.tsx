"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Upload } from "lucide-react";
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type JSX } from "react";

interface CVDropzoneProps {
  /** Whether uploads are enabled */
  disabled?: boolean;
  /** Called when a file is selected */
  onFileSelect: (file: File) => void;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * CV Dropzone Component
 *
 * A drag-and-drop zone for uploading CV files.
 * Handles file selection and calls onFileSelect callback.
 */
export function CVDropzone({
  disabled = false,
  onFileSelect,
  isUploading = false,
  className,
}: CVDropzoneProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || isUploading;

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDisabled) {
        setIsDragging(true);
      }
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (validTypes.includes(file.type)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isDisabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0]) {
        processFile(files[0]);
      }
    },
    [isDisabled, processFile]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [processFile]
  );

  const handleClick = (): void => {
    if (!isDisabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
        !isDisabled && "cursor-pointer",
        isDragging
          ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
          : "border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-500",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={isDisabled}
      />

      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
            isDragging ? "bg-cyan-100 dark:bg-cyan-800" : "bg-slate-100 dark:bg-slate-800"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-7 h-7 text-cyan-600 dark:text-cyan-400 animate-spin" />
          ) : isDragging ? (
            <FileText className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          ) : (
            <Upload className="w-7 h-7 text-slate-500 dark:text-slate-400" />
          )}
        </div>

        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {isUploading
              ? "Processing your CV..."
              : isDragging
                ? "Drop your CV here"
                : "Upload your CV"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isUploading
              ? "Extracting information..."
              : "Drag & drop or click to browse • PDF, DOC, DOCX"}
          </p>
        </div>

        {!isUploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="mt-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select File
          </Button>
        )}
      </div>
    </div>
  );
}
