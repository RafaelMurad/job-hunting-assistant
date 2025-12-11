"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

/**
 * UX Planner - AI-Powered UX Research Platform
 *
 * Interactive tool for exploring user journeys, personas, and pain points
 * with AI analysis and contextual chat support.
 *
 * Access at: /admin/ux-planner
 * Requires admin access.
 */

type Tab = "journeys" | "personas" | "pain-points" | "principles" | "implementations";
type UxAnalysisResult = {
  summary: string;
  issues: Array<{
    type: string;
    description: string;
    severity: string;
    suggestion: string;
  }>;
  recommendations: string[];
  score?: number;
};

export default function UXPlannerPage(): JSX.Element {
  return (
    <AdminGuard>
      <UXPlannerContent />
    </AdminGuard>
  );
}

function UXPlannerContent(): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("journeys");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId] = useState(() => `session-${Date.now()}`);
  const [analysisResult, setAnalysisResult] = useState<UxAnalysisResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all UX data
  const { data, isLoading } = trpc.ux.getAll.useQuery();
  const { data: stats } = trpc.ux.getStats.useQuery();
  const { data: implementations, refetch: refetchImplementations } =
    trpc.ux.listImplementations.useQuery();
  const { data: implStats } = trpc.ux.getImplementationStats.useQuery();
  const { data: chatHistory, refetch: refetchChat } = trpc.ux.getChatHistory.useQuery(
    { sessionId: chatSessionId },
    { enabled: chatOpen } // Only fetch when chat is open, no polling
  );

  // AI Mutations
  const analyzeJourneyMutation = trpc.ux.analyzeJourney.useMutation({
    onSuccess: (result) => setAnalysisResult(result),
  });
  const analyzePersonaMutation = trpc.ux.analyzePersona.useMutation({
    onSuccess: (result) => setAnalysisResult(result),
  });
  const analyzePainPointsMutation = trpc.ux.analyzePainPoints.useMutation({
    onSuccess: (result) => setAnalysisResult(result),
  });
  const chatMutation = trpc.ux.chat.useMutation({
    onSuccess: () => void refetchChat(),
    onError: (error) => console.error("Chat error:", error),
  });
  const updateImplementationMutation = trpc.ux.updateImplementation.useMutation({
    onSuccess: () => void refetchImplementations(),
  });
  const scanImplementationMutation = trpc.ux.scanImplementation.useMutation({
    onSuccess: () => void refetchImplementations(),
  });

  // Scroll chat to bottom when new messages arrive or when sending
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatMutation.isPending]);

  const handleChat = useCallback(async () => {
    if (!chatInput.trim()) return;
    const message = chatInput;
    setChatInput("");
    await chatMutation.mutateAsync({ sessionId: chatSessionId, message });
  }, [chatInput, chatSessionId, chatMutation]);

  const handleAnalyze = useCallback(() => {
    if (!selectedId) return;
    setAnalysisResult(null);

    if (activeTab === "journeys") {
      analyzeJourneyMutation.mutate({ journeyId: selectedId });
    } else if (activeTab === "personas") {
      analyzePersonaMutation.mutate({ personaId: selectedId });
    } else if (activeTab === "pain-points") {
      analyzePainPointsMutation.mutate();
    }
  }, [
    activeTab,
    selectedId,
    analyzeJourneyMutation,
    analyzePersonaMutation,
    analyzePainPointsMutation,
  ]);

  const isAnalyzing =
    analyzeJourneyMutation.isPending ||
    analyzePersonaMutation.isPending ||
    analyzePainPointsMutation.isPending;

  // Get selected item details
  const selectedJourney = data?.journeys.find((j) => j.id === selectedId);
  const selectedPersona = data?.personas.find((p) => p.id === selectedId);
  const selectedPainPoint = data?.painPoints.find((p) => p.id === selectedId);
  const selectedPrinciple = data?.principles.find((p) => p.id === selectedId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nordic-neutral-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-fjord-600 border-t-transparent" />
          <p className="text-nordic-neutral-600">Loading UX Research Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-nordic-neutral-50">
      {/* Main Content */}
      <div className={`flex-1 p-4 md:p-8 transition-all ${chatOpen ? "md:mr-96" : ""}`}>
        <div className="mx-auto max-w-6xl">
          {/* Admin Navigation */}
          <div className="mb-4 flex gap-4 text-sm">
            <Link href="/admin/flags" className="text-nordic-neutral-500 hover:text-fjord-600">
              Feature Flags
            </Link>
            <Link href="/admin/ux-planner" className="font-medium text-fjord-600">
              UX Planner
            </Link>
          </div>

          {/* Header with Stats */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-nordic-neutral-900">UX Research Platform</h1>
              <p className="text-nordic-neutral-600">
                AI-powered analysis of user journeys, personas, and pain points
              </p>
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                chatOpen
                  ? "bg-fjord-600 text-white"
                  : "bg-white text-nordic-neutral-700 hover:bg-nordic-neutral-100 border border-nordic-neutral-200"
              }`}
            >
              💬 {chatOpen ? "Close Chat" : "Open AI Chat"}
            </button>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <div className="rounded-lg bg-white p-4 border border-nordic-neutral-200">
                <div className="text-2xl font-bold text-fjord-600">{stats.personaCount}</div>
                <div className="text-sm text-nordic-neutral-500">Personas</div>
              </div>
              <div className="rounded-lg bg-white p-4 border border-nordic-neutral-200">
                <div className="text-2xl font-bold text-fjord-600">{stats.journeyCount}</div>
                <div className="text-sm text-nordic-neutral-500">Journeys</div>
              </div>
              <div className="rounded-lg bg-white p-4 border border-nordic-neutral-200">
                <div className="text-2xl font-bold text-fjord-600">{stats.painPointCount}</div>
                <div className="text-sm text-nordic-neutral-500">Pain Points</div>
              </div>
              <div className="rounded-lg bg-white p-4 border border-nordic-neutral-200">
                <div className="text-2xl font-bold text-red-600">{stats.criticalPainPoints}</div>
                <div className="text-sm text-nordic-neutral-500">Critical Issues</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
            {[
              {
                id: "journeys" as const,
                label: "User Journeys",
                icon: "🗺️",
                count: data?.journeys.length,
              },
              {
                id: "personas" as const,
                label: "Personas",
                icon: "👤",
                count: data?.personas.length,
              },
              {
                id: "pain-points" as const,
                label: "Pain Points",
                icon: "⚠️",
                count: data?.painPoints.length,
              },
              {
                id: "principles" as const,
                label: "Principles",
                icon: "📐",
                count: data?.principles.length,
              },
              {
                id: "implementations" as const,
                label: "Tracking",
                icon: "✅",
                count: implementations?.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedId(null);
                  setAnalysisResult(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-fjord-600 text-white"
                    : "bg-white text-nordic-neutral-700 hover:bg-nordic-neutral-100"
                }`}
              >
                {tab.icon} {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Panel - List */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-nordic-neutral-200 bg-white p-4">
                {activeTab === "journeys" && (
                  <>
                    <h2 className="mb-4 font-semibold text-nordic-neutral-900">Journeys</h2>
                    <div className="space-y-2">
                      {data?.journeys.map((j) => (
                        <button
                          key={j.id}
                          onClick={() => setSelectedId(j.id)}
                          className={`w-full rounded-lg p-3 text-left transition-colors ${
                            selectedId === j.id
                              ? "bg-fjord-50 border-fjord-200 border"
                              : "hover:bg-nordic-neutral-50"
                          }`}
                        >
                          <div className="font-medium text-nordic-neutral-900">{j.name}</div>
                          <div className="text-sm text-nordic-neutral-500 line-clamp-2">
                            {j.description}
                          </div>
                          <div className="mt-1 flex gap-2">
                            <span className="text-xs text-nordic-neutral-400">
                              {j.steps.length} steps
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                j.status === "VALIDATED"
                                  ? "bg-green-100 text-green-700"
                                  : j.status === "IN_REVIEW"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-nordic-neutral-100 text-nordic-neutral-600"
                              }`}
                            >
                              {j.status.toLowerCase()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "personas" && (
                  <>
                    <h2 className="mb-4 font-semibold text-nordic-neutral-900">Personas</h2>
                    <div className="space-y-2">
                      {data?.personas.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={`w-full rounded-lg p-3 text-left transition-colors ${
                            selectedId === p.id
                              ? "bg-fjord-50 border-fjord-200 border"
                              : "hover:bg-nordic-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            <div>
                              <div className="font-medium text-nordic-neutral-900">{p.name}</div>
                              <div className="text-xs text-nordic-neutral-500">{p.type}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "pain-points" && (
                  <>
                    <h2 className="mb-4 font-semibold text-nordic-neutral-900">Pain Points</h2>
                    <div className="space-y-2">
                      {data?.painPoints.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={`w-full rounded-lg p-3 text-left transition-colors ${
                            selectedId === p.id
                              ? "bg-fjord-50 border-fjord-200 border"
                              : "hover:bg-nordic-neutral-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-nordic-neutral-900">{p.title}</div>
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-medium ${
                                p.severity === "CRITICAL"
                                  ? "bg-red-100 text-red-700"
                                  : p.severity === "HIGH"
                                    ? "bg-orange-100 text-orange-700"
                                    : p.severity === "MEDIUM"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-green-100 text-green-700"
                              }`}
                            >
                              {p.severity.toLowerCase()}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-nordic-neutral-500">
                            {p.category} • Effort: {p.effort.toLowerCase()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "principles" && (
                  <>
                    <h2 className="mb-4 font-semibold text-nordic-neutral-900">
                      Design Principles
                    </h2>
                    <div className="space-y-2">
                      {data?.principles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={`w-full rounded-lg p-3 text-left transition-colors ${
                            selectedId === p.id
                              ? "bg-fjord-50 border-fjord-200 border"
                              : "hover:bg-nordic-neutral-50"
                          }`}
                        >
                          <div className="font-medium text-nordic-neutral-900">{p.name}</div>
                          <div className="text-sm text-nordic-neutral-500 line-clamp-2">
                            {p.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Implementations Tracking */}
                {activeTab === "implementations" && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold text-nordic-neutral-900">
                        Implementation Tracking
                      </h2>
                      {implStats && (
                        <span className="text-sm text-nordic-neutral-500">
                          {implStats.completionRate}% complete
                        </span>
                      )}
                    </div>

                    {/* Status Summary */}
                    {implStats && (
                      <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-nordic-neutral-100 p-2">
                          <div className="font-semibold">{implStats.notStarted}</div>
                          <div className="text-nordic-neutral-500">Todo</div>
                        </div>
                        <div className="rounded-lg bg-yellow-100 p-2">
                          <div className="font-semibold">{implStats.inProgress}</div>
                          <div className="text-nordic-neutral-500">Active</div>
                        </div>
                        <div className="rounded-lg bg-green-100 p-2">
                          <div className="font-semibold">{implStats.implemented}</div>
                          <div className="text-nordic-neutral-500">Done</div>
                        </div>
                        <div className="rounded-lg bg-fjord-100 p-2">
                          <div className="font-semibold">{implStats.verified}</div>
                          <div className="text-nordic-neutral-500">Verified</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {implementations?.map((impl) => (
                        <div
                          key={impl.id}
                          className="rounded-lg border border-nordic-neutral-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-nordic-neutral-900">
                                {impl.title}
                              </div>
                              {impl.painPoint && (
                                <div className="text-xs text-nordic-neutral-500">
                                  Pain Point: {impl.painPoint.title}
                                </div>
                              )}
                            </div>
                            <select
                              value={impl.status}
                              onChange={(e) =>
                                updateImplementationMutation.mutate({
                                  id: impl.id,
                                  status: e.target.value as
                                    | "NOT_STARTED"
                                    | "IN_PROGRESS"
                                    | "IMPLEMENTED"
                                    | "VERIFIED",
                                })
                              }
                              className={`rounded-md border px-2 py-1 text-xs font-medium ${
                                impl.status === "VERIFIED"
                                  ? "bg-fjord-100 text-fjord-700"
                                  : impl.status === "IMPLEMENTED"
                                    ? "bg-green-100 text-green-700"
                                    : impl.status === "IN_PROGRESS"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-nordic-neutral-100 text-nordic-neutral-700"
                              }`}
                            >
                              <option value="NOT_STARTED">Todo</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="IMPLEMENTED">Done</option>
                              <option value="VERIFIED">Verified</option>
                            </select>
                          </div>
                          {impl.aiNotes && (
                            <div className="mt-2 text-xs text-nordic-neutral-500 bg-nordic-neutral-50 p-2 rounded">
                              💡 {impl.aiNotes}
                            </div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => scanImplementationMutation.mutate({ id: impl.id })}
                              disabled={scanImplementationMutation.isPending}
                              className="text-xs text-fjord-600 hover:underline"
                            >
                              🔍 Scan
                            </button>
                            {impl.commit && (
                              <span className="text-xs text-nordic-neutral-500">
                                Commit: {impl.commit.slice(0, 7)}
                              </span>
                            )}
                            {impl.prNumber && (
                              <span className="text-xs text-nordic-neutral-500">
                                PR #{impl.prNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!implementations || implementations.length === 0) && (
                        <div className="text-center text-sm text-nordic-neutral-500 py-8">
                          No implementations tracked yet.
                          <br />
                          Use the AI chat to identify improvements to track.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Panel - Detail */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-nordic-neutral-200 bg-white p-6">
                {/* Journey Detail */}
                {activeTab === "journeys" && selectedJourney && (
                  <>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-nordic-neutral-900">
                          {selectedJourney.name}
                        </h2>
                        <p className="text-nordic-neutral-600">{selectedJourney.description}</p>
                        {selectedJourney.persona && (
                          <p className="mt-1 text-sm text-fjord-600">
                            Persona: {selectedJourney.persona.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="rounded-lg bg-fjord-600 px-4 py-2 text-sm font-medium text-white hover:bg-fjord-700 disabled:opacity-50"
                      >
                        {isAnalyzing ? "Analyzing..." : "🔍 AI Analyze"}
                      </button>
                    </div>

                    {/* Journey Steps */}
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-medium text-nordic-neutral-500">
                        Journey Steps
                      </h3>
                      <div className="space-y-3">
                        {selectedJourney.steps.map((step, i) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 rounded-lg border border-nordic-neutral-200 p-3"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fjord-100 text-xs font-medium text-fjord-600">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-nordic-neutral-900">
                                  {step.stage}
                                </span>
                                <span className="text-xs text-nordic-neutral-400">
                                  {step.touchpoint}
                                </span>
                              </div>
                              <p className="text-sm text-nordic-neutral-600">{step.action}</p>
                              <div className="mt-1 flex gap-4 text-xs">
                                <span className="text-nordic-neutral-500">
                                  💭 &ldquo;{step.thinking}&rdquo;
                                </span>
                                <span className="text-nordic-neutral-500">😊 {step.feeling}</span>
                              </div>
                              {step.opportunity && (
                                <p className="mt-1 text-xs text-green-600">💡 {step.opportunity}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Persona Detail */}
                {activeTab === "personas" && selectedPersona && (
                  <>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-nordic-neutral-900">
                          {selectedPersona.name}
                        </h2>
                        <p className="text-sm text-nordic-neutral-500">{selectedPersona.type}</p>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="rounded-lg bg-fjord-600 px-4 py-2 text-sm font-medium text-white hover:bg-fjord-700 disabled:opacity-50"
                      >
                        {isAnalyzing ? "Analyzing..." : "🔍 AI Analyze"}
                      </button>
                    </div>
                    <p className="mb-6 text-nordic-neutral-600">{selectedPersona.description}</p>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-nordic-neutral-500">Goals</h3>
                        <ul className="space-y-1">
                          {selectedPersona.goals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-green-500">✓</span>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-nordic-neutral-500">
                          Frustrations
                        </h3>
                        <ul className="space-y-1">
                          {selectedPersona.frustrations.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-red-500">✗</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="mb-2 text-sm font-medium text-nordic-neutral-500">
                          Behaviors
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPersona.behaviors.map((b, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-nordic-neutral-100 px-3 py-1 text-sm"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pain Point Detail */}
                {activeTab === "pain-points" && selectedPainPoint && (
                  <>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-nordic-neutral-900">
                          {selectedPainPoint.title}
                        </h2>
                        <div className="mt-1 flex gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              selectedPainPoint.severity === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : selectedPainPoint.severity === "HIGH"
                                  ? "bg-orange-100 text-orange-700"
                                  : selectedPainPoint.severity === "MEDIUM"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                          >
                            {selectedPainPoint.severity}
                          </span>
                          <span className="text-xs text-nordic-neutral-500">
                            {selectedPainPoint.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="rounded-lg bg-fjord-600 px-4 py-2 text-sm font-medium text-white hover:bg-fjord-700 disabled:opacity-50"
                      >
                        {isAnalyzing ? "Analyzing..." : "🔍 AI Analyze All"}
                      </button>
                    </div>

                    <p className="mb-4 text-nordic-neutral-600">{selectedPainPoint.description}</p>

                    {selectedPainPoint.userQuote && (
                      <blockquote className="mb-4 border-l-4 border-fjord-300 bg-fjord-50 p-3 text-sm italic text-nordic-neutral-600">
                        &ldquo;{selectedPainPoint.userQuote}&rdquo;
                      </blockquote>
                    )}

                    {selectedPainPoint.solution && (
                      <div className="rounded-lg bg-green-50 p-4">
                        <h3 className="mb-2 text-sm font-medium text-green-800">
                          💡 Proposed Solution
                        </h3>
                        <p className="text-sm text-green-700">{selectedPainPoint.solution}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Principle Detail */}
                {activeTab === "principles" && selectedPrinciple && (
                  <>
                    <h2 className="mb-2 text-xl font-semibold text-nordic-neutral-900">
                      {selectedPrinciple.name}
                    </h2>
                    <p className="mb-4 text-nordic-neutral-600">{selectedPrinciple.description}</p>
                    <p className="mb-6 text-sm text-nordic-neutral-500">
                      {selectedPrinciple.rationale}
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-green-50 p-4">
                        <h3 className="mb-2 text-sm font-medium text-green-800">✓ Do</h3>
                        <ul className="space-y-1 text-sm text-green-700">
                          {selectedPrinciple.examples.do.map((ex, i) => (
                            <li key={i}>• {ex}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-red-50 p-4">
                        <h3 className="mb-2 text-sm font-medium text-red-800">✗ Don&apos;t</h3>
                        <ul className="space-y-1 text-sm text-red-700">
                          {selectedPrinciple.examples.dont.map((ex, i) => (
                            <li key={i}>• {ex}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {/* No Selection */}
                {!selectedId && (
                  <div className="text-center py-12 text-nordic-neutral-500">
                    <p className="text-lg mb-2">Select an item from the list</p>
                    <p className="text-sm">
                      Choose a {activeTab.replace("-", " ")} to view details and run AI analysis
                    </p>
                  </div>
                )}

                {/* AI Analysis Results */}
                {analysisResult && (
                  <div className="mt-6 rounded-lg border-2 border-fjord-200 bg-fjord-50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fjord-800">
                      🤖 AI Analysis Results
                      {analysisResult.score && (
                        <span className="rounded-full bg-fjord-200 px-2 py-0.5 text-xs">
                          Score: {analysisResult.score}/100
                        </span>
                      )}
                    </h3>
                    <p className="mb-4 text-sm text-fjord-700">{analysisResult.summary}</p>

                    {analysisResult.issues.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 text-xs font-medium text-fjord-600">Issues Found</h4>
                        <div className="space-y-2">
                          {analysisResult.issues.map((issue, i) => (
                            <div
                              key={i}
                              className="rounded bg-white p-2 text-sm border border-fjord-200"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-xs ${
                                    issue.severity === "high"
                                      ? "bg-red-100 text-red-700"
                                      : issue.severity === "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {issue.type}
                                </span>
                                <span className="text-nordic-neutral-700">{issue.description}</span>
                              </div>
                              <p className="mt-1 text-xs text-fjord-600">💡 {issue.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.recommendations.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-medium text-fjord-600">Recommendations</h4>
                        <ul className="space-y-1 text-sm text-fjord-700">
                          {analysisResult.recommendations.map((rec, i) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar - Full screen on mobile, sidebar on desktop */}
      {chatOpen && (
        <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-96 border-l border-nordic-neutral-200 bg-white shadow-lg flex flex-col z-50">
          <div className="border-b border-nordic-neutral-200 p-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-nordic-neutral-900">🤖 UX Research Assistant</h3>
              <p className="text-xs text-nordic-neutral-500">
                Ask questions about your UX research data
              </p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-nordic-neutral-400 hover:text-nordic-neutral-600 p-1 rounded hover:bg-nordic-neutral-100"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(!chatHistory || chatHistory.length === 0) && (
              <div className="text-center text-sm text-nordic-neutral-500 py-8">
                <p className="mb-4">👋 Hi! I can help you with UX research questions.</p>
                <p className="text-xs">Try asking:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>&ldquo;What are the most critical pain points?&rdquo;</li>
                  <li>&ldquo;How can I improve the first-time setup journey?&rdquo;</li>
                  <li>&ldquo;What do our personas have in common?&rdquo;</li>
                </ul>
              </div>
            )}
            {chatHistory?.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-fjord-100 text-fjord-900 ml-8"
                    : "bg-nordic-neutral-100 text-nordic-neutral-900 mr-8 prose prose-sm prose-neutral max-w-none"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <Markdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-base font-bold mt-3 mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-sm font-medium mt-2 mb-1">{children}</h4>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="bg-nordic-neutral-200 px-1 py-0.5 rounded text-xs">
                          {children}
                        </code>
                      ),
                      hr: () => <hr className="my-3 border-nordic-neutral-300" />,
                    }}
                  >
                    {msg.content}
                  </Markdown>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="bg-nordic-neutral-100 rounded-lg p-3 text-sm mr-8 animate-pulse">
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-nordic-neutral-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void handleChat()}
                placeholder="Ask about your UX research..."
                className="flex-1 rounded-lg border border-nordic-neutral-200 px-3 py-2 text-sm focus:border-fjord-500 focus:outline-none"
                disabled={chatMutation.isPending}
              />
              <button
                onClick={() => void handleChat()}
                disabled={chatMutation.isPending || !chatInput.trim()}
                className="rounded-lg bg-fjord-600 px-4 py-2 text-sm font-medium text-white hover:bg-fjord-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
