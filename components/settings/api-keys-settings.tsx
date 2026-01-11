"use client";

/**
 * API Keys Settings Component
 *
 * Shows the status of API keys configured via environment variables.
 * Fetches status from server API (keys are server-side only).
 * If keys are missing, displays clear instructions on how to add them.
 *
 * @module components/settings/api-keys-settings
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVIDER_INFO } from "@/lib/ai";
import type { AIProvider } from "@/lib/ai";
import { useEffect, useState, type JSX } from "react";

// ============================================
// Types
// ============================================

interface KeyStatus {
  configured: boolean;
  envVar: string;
}

interface KeyStatusResponse {
  gemini: KeyStatus;
  openrouter: KeyStatus;
}

interface TestResult {
  testing: boolean;
  result?: { valid: boolean; error?: string };
}

// ============================================
// Component
// ============================================

export function APIKeysSettings(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [keyStatus, setKeyStatus] = useState<KeyStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<AIProvider, TestResult>>({
    gemini: { testing: false },
    openrouter: { testing: false },
  });

  // Fetch key status from server
  useEffect(() => {
    async function fetchKeyStatus(): Promise<void> {
      try {
        const response = await fetch("/api/ai/keys");
        if (!response.ok) {
          setError("Failed to fetch key status");
          return;
        }
        const data = (await response.json()) as KeyStatusResponse;
        setKeyStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load key status");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchKeyStatus();
  }, []);

  const handleTest = async (provider: AIProvider): Promise<void> => {
    setTestResults((prev) => ({
      ...prev,
      [provider]: { testing: true },
    }));

    try {
      const response = await fetch(`/api/ai/keys/test?provider=${provider}`);
      const result = (await response.json()) as { valid: boolean; error?: string };

      setTestResults((prev) => ({
        ...prev,
        [provider]: { testing: false, result },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { testing: false, result: { valid: false, error: "Network error" } },
      }));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error || !keyStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription className="text-red-500">{error ?? "Failed to load"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasKeys = keyStatus.gemini.configured || keyStatus.openrouter.configured;

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
          API Keys
          {hasKeys ? (
            <Badge variant="default" className="hidden sm:inline-flex bg-emerald-600">
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Not Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          API keys are loaded from environment variables. Add them to your{" "}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">
            .env.local
          </code>{" "}
          file.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
        {/* Instructions if no keys */}
        {!hasKeys && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 space-y-3">
            <p className="font-medium text-amber-800 dark:text-amber-200">No API keys configured</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              To use AI features, add your API keys to{" "}
              <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">.env.local</code>{" "}
              in your project root:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm overflow-x-auto">
              <code>{`# .env.local

# Get your key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_key_here

# Get your key from: https://openrouter.ai/keys (optional)
OPENROUTER_API_KEY=your_openrouter_key_here`}</code>
            </pre>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              After adding the keys, restart the development server:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm">
              <code>npm run dev</code>
            </pre>
          </div>
        )}

        {/* Provider status cards */}
        {renderProviderCard("gemini", keyStatus.gemini, testResults.gemini, handleTest)}
        {renderProviderCard("openrouter", keyStatus.openrouter, testResults.openrouter, handleTest)}

        {/* Help text */}
        <div className="text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
          <p>
            <strong>Note:</strong> Environment variables are loaded at build time. After modifying{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">
              .env.local
            </code>
            , restart your development server to apply changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function renderProviderCard(
  provider: AIProvider,
  status: KeyStatus,
  testResult: TestResult,
  onTest: (provider: AIProvider) => Promise<void>
): JSX.Element {
  const info = PROVIDER_INFO[provider];

  return (
    <div
      key={provider}
      className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-2 sm:space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              {info.name}
            </h3>
            {status.configured ? (
              <Badge variant="default" className="bg-emerald-600 text-xs">
                ✓ Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500 text-xs">
                Not Set
              </Badge>
            )}
            {testResult.result && (
              <Badge
                variant={testResult.result.valid ? "default" : "destructive"}
                className="text-xs"
              >
                {testResult.result.valid ? "✓ Verified" : "✗ Failed"}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {info.description}
          </p>
        </div>
      </div>

      {/* Key status */}
      <div className="space-y-2">
        {/* Env var name - hidden on mobile */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Env Var:</span>
          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs">
            {status.envVar}
          </code>
        </div>

        {status.configured ? (
          <div className="flex items-center gap-2">
            {/* Hidden on mobile - just show Test button */}
            <code className="hidden sm:block text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded font-mono">
              ••••••••••••
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void onTest(provider)}
              disabled={testResult.testing}
              className="h-9 sm:h-8"
            >
              {testResult.testing ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
            Add{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
              {status.envVar}
            </code>{" "}
            to your{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env.local</code>{" "}
            file
          </p>
        )}

        {testResult.result && !testResult.result.valid && (
          <p className="text-xs sm:text-sm text-red-500 dark:text-red-400">
            {testResult.result.error}
          </p>
        )}
      </div>

      {/* Get key link */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Get your API key from{" "}
        <a
          href={info.getKeyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          {info.getKeyUrl.replace("https://", "")}
        </a>
      </p>
    </div>
  );
}
