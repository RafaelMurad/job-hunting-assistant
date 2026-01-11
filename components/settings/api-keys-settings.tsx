"use client";

/**
 * API Keys Settings Component
 *
 * Allows users to manage their API keys for local mode (BYOK).
 * Only visible in local mode - hidden in demo mode.
 *
 * @module components/settings/api-keys-settings
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getAPIKey,
  maskAPIKey,
  PROVIDER_INFO,
  removeAPIKey,
  setAPIKey,
  testAPIKey,
  validateKeyFormat,
  type AIProvider,
} from "@/lib/ai";
import { isLocalMode } from "@/lib/storage/interface";
import { useEffect, useState, type JSX } from "react";

// ============================================
// Types
// ============================================

interface KeyState {
  value: string;
  isEditing: boolean;
  isTesting: boolean;
  testResult: { valid: boolean; error?: string } | null;
}

type KeyStates = Record<AIProvider, KeyState>;

// ============================================
// Component
// ============================================

/**
 * API Keys Settings component.
 * Renders nothing in demo mode.
 */
export function APIKeysSettings(): JSX.Element | null {
  const isLocal = isLocalMode();
  // Use lazy initialization to load from localStorage only on client
  const [keys, setKeys] = useState<KeyStates>(() => {
    // During SSR, return empty state
    if (typeof window === "undefined") {
      return {
        gemini: { value: "", isEditing: false, isTesting: false, testResult: null },
        openrouter: { value: "", isEditing: false, isTesting: false, testResult: null },
      };
    }
    // On client, load from localStorage immediately
    const geminiKey = getAPIKey("gemini");
    const openrouterKey = getAPIKey("openrouter");
    return {
      gemini: {
        value: geminiKey ?? "",
        isEditing: false,
        isTesting: false,
        testResult: null,
      },
      openrouter: {
        value: openrouterKey ?? "",
        isEditing: false,
        isTesting: false,
        testResult: null,
      },
    };
  });

  // Track hydration for conditional rendering
  const [isClient, setIsClient] = useState(false);

  // Use layoutEffect-like pattern: sync external state after hydration
  useEffect(() => {
    // This runs after hydration, signaling we're on the client
    // Using a callback to batch the update properly
    const timeoutId = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Don't render in demo mode or before hydration
  if (!isClient || !isLocal) {
    return null;
  }

  const handleEdit = (provider: AIProvider): void => {
    setKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isEditing: true, testResult: null },
    }));
  };

  const handleCancel = (provider: AIProvider): void => {
    const savedKey = getAPIKey(provider);
    setKeys((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        value: savedKey ?? "",
        isEditing: false,
        testResult: null,
      },
    }));
  };

  const handleSave = (provider: AIProvider): void => {
    const key = keys[provider].value.trim();
    if (key === "") {
      removeAPIKey(provider);
    } else {
      setAPIKey(provider, key);
    }
    setKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isEditing: false },
    }));
  };

  const handleTest = async (provider: AIProvider): Promise<void> => {
    const key = keys[provider].value.trim();
    if (!key) return;

    setKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isTesting: true, testResult: null },
    }));

    const result = await testAPIKey(provider, key);

    setKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], isTesting: false, testResult: result },
    }));
  };

  const handleRemove = (provider: AIProvider): void => {
    removeAPIKey(provider);
    setKeys((prev) => ({
      ...prev,
      [provider]: { value: "", isEditing: false, isTesting: false, testResult: null },
    }));
  };

  const renderProviderCard = (provider: AIProvider): JSX.Element => {
    const info = PROVIDER_INFO[provider];
    const state = keys[provider];
    const hasKey = state.value.length > 0;
    const isValid = hasKey && validateKeyFormat(provider, state.value);

    return (
      <div
        key={provider}
        className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{info.name}</h3>
              {hasKey && !state.isEditing && (
                <Badge variant={isValid ? "default" : "destructive"}>
                  {isValid ? "Configured" : "Invalid Format"}
                </Badge>
              )}
              {state.testResult && (
                <Badge variant={state.testResult.valid ? "default" : "destructive"}>
                  {state.testResult.valid ? "✓ Verified" : "✗ Failed"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{info.description}</p>
          </div>
        </div>

        {/* Key display or input */}
        {state.isEditing ? (
          <div className="space-y-2">
            <Input
              type="password"
              placeholder={info.placeholder}
              value={state.value}
              onChange={(e) =>
                setKeys((prev) => ({
                  ...prev,
                  [provider]: { ...prev[provider], value: e.target.value },
                }))
              }
              className="font-mono text-sm"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => handleSave(provider)}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCancel(provider)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleTest(provider)}
                disabled={!state.value.trim() || state.isTesting}
              >
                {state.isTesting ? "Testing..." : "Test Key"}
              </Button>
            </div>
            {state.testResult && !state.testResult.valid && (
              <p className="text-sm text-red-500 dark:text-red-400">{state.testResult.error}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {hasKey ? (
              <>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                  {maskAPIKey(state.value)}
                </code>
                <Button size="sm" variant="outline" onClick={() => handleEdit(provider)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleRemove(provider)}>
                  Remove
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => handleEdit(provider)}>
                Add Key
              </Button>
            )}
          </div>
        )}

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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Keys
          <Badge variant="outline" className="font-normal">
            Local Mode
          </Badge>
        </CardTitle>
        <CardDescription>
          Configure your own API keys to use AI features. Keys are stored locally in your browser
          and never sent to our servers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security notice */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Note:</strong> API keys stored in the browser are visible in DevTools. This is
            safe for personal use, but avoid sharing your screen while keys are visible.
          </p>
        </div>

        {/* Provider cards */}
        {renderProviderCard("gemini")}
        {renderProviderCard("openrouter")}
      </CardContent>
    </Card>
  );
}
