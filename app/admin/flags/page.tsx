"use client";

import { type JSX } from "react";

/**
 * Feature Flags Admin Panel
 *
 * Hidden admin page for toggling feature flags during development.
 * Access at: /admin/flags
 *
 * Note: In production, you may want to protect this route with authentication.
 */

import Link from "next/link";
import { useFeatureFlags, useFeatureFlagHydrated } from "@/lib/feature-flags/hooks";
import {
  FEATURE_FLAGS,
  getFlagsByCategory,
  type FeatureFlag,
} from "@/lib/feature-flags/flags.config";

export default function FeatureFlagsAdminPage(): JSX.Element {
  const { flags, toggle, resetAll } = useFeatureFlags();
  const isHydrated = useFeatureFlagHydrated();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-nordic-neutral-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-nordic-neutral-200" />
            <div className="mt-4 h-4 w-96 rounded bg-nordic-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  const categories: Array<{ key: FeatureFlag["category"]; label: string; color: string }> = [
    { key: "core", label: "Core Features", color: "bg-fjord-100 border-fjord-300" },
    { key: "experimental", label: "Experimental", color: "bg-forest-100 border-forest-300" },
    { key: "beta", label: "Beta", color: "bg-amber-100 border-amber-300" },
    { key: "deprecated", label: "Deprecated", color: "bg-clay-100 border-clay-300" },
  ];

  const enabledCount = Object.values(flags).filter(Boolean).length;
  const totalCount = FEATURE_FLAGS.length;

  return (
    <div className="min-h-screen bg-nordic-neutral-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Admin Navigation */}
        <div className="mb-4 flex gap-4 text-sm">
          <Link href="/admin/flags" className="font-medium text-fjord-600">
            Feature Flags
          </Link>
          <Link href="/admin/ux-planner" className="text-nordic-neutral-500 hover:text-fjord-600">
            UX Planner
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-nordic-neutral-900">Feature Flags</h1>
              <p className="mt-1 text-nordic-neutral-600">
                Toggle features on and off for development and testing
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-nordic-neutral-500">
                {enabledCount} of {totalCount} enabled
              </div>
              <button
                onClick={resetAll}
                className="mt-2 rounded-lg border border-nordic-neutral-300 bg-white px-4 py-2 text-sm font-medium text-nordic-neutral-700 shadow-sm transition-colors hover:bg-nordic-neutral-50"
              >
                Reset All to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Development Only</h3>
              <p className="mt-1 text-sm text-amber-700">
                Flag states are stored in localStorage. Changes only affect this browser. For
                production, use environment variables.
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryFlags = getFlagsByCategory(category.key);
            if (categoryFlags.length === 0) return null;

            return (
              <div key={category.key}>
                <h2 className="mb-3 text-lg font-semibold text-nordic-neutral-800">
                  {category.label}
                </h2>
                <div className="space-y-3">
                  {categoryFlags.map((flag) => (
                    <FlagToggle
                      key={flag.key}
                      flag={flag}
                      isEnabled={flags[flag.key] ?? false}
                      onToggle={() => toggle(flag.key)}
                      categoryColor={category.color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Copy Section */}
        <div className="mt-8 rounded-lg border border-nordic-neutral-200 bg-white p-6">
          <h3 className="mb-3 font-semibold text-nordic-neutral-800">
            Environment Variable Overrides
          </h3>
          <p className="mb-4 text-sm text-nordic-neutral-600">
            Add these to your <code className="rounded bg-nordic-neutral-100 px-1">.env.local</code>{" "}
            to enable flags server-side:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-nordic-neutral-900 p-4 text-sm text-nordic-neutral-100">
            {FEATURE_FLAGS.map(
              (flag) =>
                `NEXT_PUBLIC_FF_${flag.key.toUpperCase()}=${flags[flag.key] ? "true" : "false"}`
            ).join("\n")}
          </pre>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/" className="text-fjord-600 hover:text-fjord-700 hover:underline">
            &larr; Back to Application
          </Link>
        </div>
      </div>
    </div>
  );
}

interface FlagToggleProps {
  flag: FeatureFlag;
  isEnabled: boolean;
  onToggle: () => void;
  categoryColor: string;
}

function FlagToggle({ flag, isEnabled, onToggle, categoryColor }: FlagToggleProps): JSX.Element {
  return (
    <div
      className={`rounded-lg border ${categoryColor} p-4 transition-all ${
        isEnabled ? "ring-2 ring-fjord-500 ring-offset-2" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-nordic-neutral-900">{flag.name}</h3>
            <code className="rounded bg-nordic-neutral-200 px-1.5 py-0.5 text-xs text-nordic-neutral-600">
              {flag.key}
            </code>
          </div>
          <p className="mt-1 text-sm text-nordic-neutral-600">{flag.description}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-fjord-500 focus:ring-offset-2 ${
            isEnabled ? "bg-fjord-600" : "bg-nordic-neutral-300"
          }`}
          role="switch"
          aria-checked={isEnabled}
          aria-label={`Toggle ${flag.name}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
