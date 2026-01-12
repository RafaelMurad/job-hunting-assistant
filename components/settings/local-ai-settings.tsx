/**
 * Local AI Settings Component
 *
 * Displays and manages local AI model settings including:
 * - Model download status
 * - Storage usage
 * - Enable/disable options
 *
 * @module components/settings/local-ai-settings
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LOCAL_AI_MODELS } from "@/lib/ai/local";
import { useLocalAIContext } from "@/lib/hooks/useLocalAI";
import { useState, type JSX } from "react";

/**
 * Local AI settings panel.
 */
export function LocalAISettings(): JSX.Element {
  const { isReady, isLoading, loadProgress, statusMessage, error, initialize, modelSize } =
    useLocalAIContext();

  const [isClearing, setIsClearing] = useState(false);

  const handleInitialize = async (): Promise<void> => {
    await initialize();
  };

  const handleClearCache = async (): Promise<void> => {
    setIsClearing(true);
    try {
      // Clear IndexedDB cache for transformers.js models
      if (typeof window !== "undefined" && "indexedDB" in window) {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name?.includes("transformers") || db.name?.includes("onnx")) {
            window.indexedDB.deleteDatabase(db.name);
          }
        }
      }
      // Reload to reset state
      window.location.reload();
    } catch (err) {
      console.error("Failed to clear cache:", err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-cyan-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Local AI
          {isReady && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
              Ready
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Run AI features locally in your browser for instant, private analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
            <span
              className={`text-sm ${
                isReady
                  ? "text-green-600 dark:text-green-400"
                  : isLoading
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {isReady ? "Active" : isLoading ? "Loading..." : "Not loaded"}
            </span>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={loadProgress} className="h-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">{statusMessage}</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
        </div>

        {/* Model Info */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Embedding Model
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Model</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                {LOCAL_AI_MODELS.embeddings?.name ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Size</span>
              <span className="text-slate-700 dark:text-slate-300">{modelSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Dimensions</span>
              <span className="text-slate-700 dark:text-slate-300">
                {LOCAL_AI_MODELS.embeddings?.dimensions ?? "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Features Enabled
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <svg
                className={`h-4 w-4 ${isReady ? "text-green-500" : "text-slate-300 dark:text-slate-600"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-600 dark:text-slate-400">
                Instant match scoring on analyze page
              </span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className={`h-4 w-4 ${isReady ? "text-green-500" : "text-slate-300 dark:text-slate-600"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-600 dark:text-slate-400">
                Semantic search in application tracker
              </span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className={`h-4 w-4 ${isReady ? "text-green-500" : "text-slate-300 dark:text-slate-600"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-600 dark:text-slate-400">
                100% local processing (no API calls)
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!isReady && (
            <Button onClick={handleInitialize} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Downloading Model...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Model ({modelSize})
                </>
              )}
            </Button>
          )}

          {isReady && (
            <Button
              variant="outline"
              onClick={handleClearCache}
              disabled={isClearing}
              className="flex-1"
            >
              {isClearing ? "Clearing..." : "Clear Model Cache"}
            </Button>
          )}
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Models are cached in your browser and run entirely offline. No data is sent to external
          servers for local AI features.
        </p>
      </CardContent>
    </Card>
  );
}
