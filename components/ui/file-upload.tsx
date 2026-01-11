"use client";

import { cn } from "@/lib/utils";
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type JSX } from "react";

/**
 * FileUpload Component
 *
 * Drag-and-drop file upload with progress indication.
 * UX improvements:
 * - Drag-and-drop zone with visual feedback
 * - Progress indication during upload
 * - Step-by-step status updates
 * - Error handling with retry
 */

export interface UploadProgress {
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  progress: number; // 0-100
  step?: string;
  message?: string;
}

interface FileUploadProps {
  /** Called when file is selected/dropped */
  onFileSelect: (file: File) => void;
  /** Current upload progress */
  progress?: UploadProgress;
  /** Accepted file types (e.g., ".pdf,.doc") */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Whether upload is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({
  onFileSelect,
  progress = { status: "idle", progress: 0 },
  accept = ".pdf,.doc,.docx",
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
  title = "Upload your file",
  description = "Drag and drop or click to browse",
}: FileUploadProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${formatFileSize(maxSize)}`;
      }

      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const fileMimeType = file.type.toLowerCase();

        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileExtension ||
            type === fileMimeType ||
            (type.endsWith("/*") && fileMimeType.startsWith(type.slice(0, -2)))
        );

        if (!isAccepted) {
          return `Please upload a file of type: ${accept}`;
        }
      }

      return null;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File): void => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const handleClick = useCallback((): void => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const isUploading = progress.status === "uploading" || progress.status === "processing";

  return (
    <div className={cn("w-full", className)}>
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200",
          isDragging
            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-gray-100 dark:hover:bg-gray-700",
          disabled && "cursor-not-allowed opacity-50",
          isUploading && "pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Upload Icon */}
        {progress.status === "idle" && (
          <div className="text-center">
            <svg
              className={cn(
                "mx-auto mb-4 h-12 w-12 transition-colors",
                isDragging ? "text-sky-600 dark:text-sky-400" : "text-gray-400 dark:text-gray-500"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-1 text-lg font-medium text-gray-700 dark:text-gray-200">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Accepted: {accept} (max {formatFileSize(maxSize)})
            </p>
          </div>
        )}

        {/* Progress State */}
        {isUploading && (
          <div className="w-full max-w-xs text-center">
            {/* Spinner */}
            <div className="mx-auto mb-4 h-12 w-12">
              <svg
                className="h-full w-full animate-spin text-sky-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            {/* Step indicator */}
            <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">
              {progress.step || "Processing..."}
            </p>

            {/* Progress bar */}
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>

            {/* Progress percentage */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress.progress}% complete
            </p>

            {/* Optional message */}
            {progress.message && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{progress.message}</p>
            )}
          </div>
        )}

        {/* Complete State */}
        {progress.status === "complete" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <svg
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mb-1 font-medium text-emerald-700 dark:text-emerald-300">
              Upload Complete!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress.message || "Your file has been processed successfully"}
            </p>
          </div>
        )}

        {/* Error State */}
        {progress.status === "error" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="mb-1 font-medium text-red-700 dark:text-red-300">Upload Failed</p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {progress.message || "Please try again"}
            </p>
            <button
              onClick={handleClick}
              className="mt-4 rounded-md bg-red-100 dark:bg-red-900/50 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Validation Error */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
