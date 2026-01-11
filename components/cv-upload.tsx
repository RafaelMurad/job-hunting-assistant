/**
 * CV Upload Component
 *
 * WHY: Provides a drag-and-drop interface for uploading CVs, making
 * the profile setup process much faster and more user-friendly.
 *
 * WHAT: A file upload zone that accepts PDF/DOCX files, shows upload
 * progress, and returns extracted profile data.
 *
 * HOW: Uses native File API with drag-and-drop events, sends to
 * /api/cv/upload, and calls onExtracted callback with parsed data.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type JSX } from "react";

interface ExtractedProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

// Export for use in other components
export type ExtractedCVData = ExtractedProfile;

interface CVUploadProps {
  onExtracted: (data: ExtractedProfile) => void;
  onCancel?: () => void; // Optional - used when embedded in a modal or cancelable flow
}

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function CVUpload({ onExtracted, onCancel }: CVUploadProps): JSX.Element {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or DOCX file.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum size is 5MB.");
        return;
      }

      setFileName(file.name);
      setError(null);
      setStatus("uploading");

      try {
        const formData = new FormData();
        formData.append("file", file);

        setStatus("processing");

        const response = await fetch("/api/cv/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Failed to process CV");
          setStatus("error");
          return;
        }

        setStatus("success");

        // Small delay to show success state
        setTimeout(() => {
          onExtracted(result.data);
        }, 500);
      } catch (err) {
        console.error("CV upload error:", err);
        setError(err instanceof Error ? err.message : "Failed to upload CV");
        setStatus("error");
      }
    },
    [onExtracted]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        void handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleRetry = (): void => {
    setStatus("idle");
    setError(null);
    setFileName(null);
  };

  return (
    <Card className="border-2 border-dashed border-slate-300 dark:border-gray-600">
      <CardContent className="p-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={status === "idle" ? handleClick : undefined}
          className={`
            relative flex flex-col items-center justify-center p-8 rounded-lg transition-all
            ${status === "idle" ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800" : ""}
            ${isDragOver ? "bg-sky-50 dark:bg-sky-900/30 border-sky-400 dark:border-sky-500" : ""}
            ${status === "error" ? "bg-red-50 dark:bg-red-900/30" : ""}
            ${status === "success" ? "bg-emerald-50 dark:bg-emerald-900/30" : ""}
          `}
        >
          {/* Idle State */}
          {status === "idle" && (
            <>
              <svg
                className="w-12 h-12 text-slate-400 dark:text-gray-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-slate-900 dark:text-gray-100 font-medium mb-1">
                Drop your CV here or click to browse
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Supports PDF and DOCX files up to 5MB
              </p>
            </>
          )}

          {/* Uploading/Processing State */}
          {(status === "uploading" || status === "processing") && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
              <p className="text-slate-900 dark:text-gray-100 font-medium mb-1">
                {status === "uploading" ? "Uploading..." : "Extracting profile data..."}
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-400">{fileName}</p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">
                {status === "processing" && "This may take a few seconds..."}
              </p>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <svg
                className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-4"
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
              <p className="text-emerald-900 dark:text-emerald-100 font-medium mb-1">
                CV processed successfully!
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Populating your profile...
              </p>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <svg
                className="w-12 h-12 text-red-600 dark:text-red-400 mb-4"
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
              <p className="text-red-900 dark:text-red-100 font-medium mb-1">Upload failed</p>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  Try Again
                </Button>
                {onCancel && (
                  <Button onClick={onCancel} variant="ghost" size="sm">
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Cancel button for idle state - only show if onCancel is provided */}
        {status === "idle" && onCancel && (
          <div className="mt-4 text-center">
            <Button onClick={onCancel} variant="ghost" size="sm">
              Cancel - I&apos;ll enter details manually
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
