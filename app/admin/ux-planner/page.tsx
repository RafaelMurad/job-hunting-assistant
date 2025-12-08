"use client";

import { type JSX, useState } from "react";
import Link from "next/link";

/**
 * UX Planner - Interactive Journey Exploration
 *
 * Tool for exploring user journeys, personas, and UX improvements.
 * Access at: /admin/ux-planner
 */

// User Journeys Data
const JOURNEYS = [
  {
    id: "first-time-setup",
    name: "First-Time Setup",
    description: "New user uploads CV and sets up profile",
    steps: [
      { name: "Visit Landing", page: "/", pain: null },
      { name: "Click Get Started", page: "/", pain: "No clear CTA hierarchy" },
      { name: "Upload CV", page: "/profile", pain: "No drag-and-drop" },
      { name: "Wait for AI", page: "/profile", pain: "No progress indication" },
      { name: "Review Data", page: "/profile", pain: "Hard to spot errors" },
      { name: "Save Profile", page: "/profile", pain: null },
    ],
    emotion: ["curious", "anxious", "relieved"],
  },
  {
    id: "job-analysis",
    name: "Job Analysis",
    description: "Analyze job posting and generate cover letter",
    steps: [
      { name: "Navigate to Analyze", page: "/analyze", pain: null },
      { name: "Paste Job Description", page: "/analyze", pain: "Large textarea intimidating" },
      { name: "Click Analyze", page: "/analyze", pain: "No estimated time" },
      { name: "View Match Score", page: "/analyze", pain: null },
      { name: "Review Gaps", page: "/analyze", pain: "No actionable advice" },
      { name: "Generate Cover Letter", page: "/analyze", pain: null },
      { name: "Copy/Save", page: "/analyze", pain: null },
    ],
    emotion: ["curious", "validated/disappointed", "relieved"],
  },
  {
    id: "application-tracking",
    name: "Application Tracking",
    description: "Track and manage job applications",
    steps: [
      { name: "Navigate to Tracker", page: "/tracker", pain: null },
      { name: "Scan Applications", page: "/tracker", pain: "No sorting/filtering" },
      { name: "Find Application", page: "/tracker", pain: "Dense information" },
      { name: "Update Status", page: "/tracker", pain: null },
      { name: "Add Notes", page: "/tracker", pain: null },
      { name: "Check Dashboard", page: "/dashboard", pain: "Limited insights" },
    ],
    emotion: ["overwhelmed", "progressing", "motivated"],
  },
  {
    id: "cv-editor",
    name: "CV Editor",
    description: "Edit CV with templates and download PDF",
    steps: [
      { name: "Navigate to CV", page: "/cv", pain: null },
      { name: "Upload/Load CV", page: "/cv", pain: "Same as profile upload" },
      { name: "Select Template", page: "/cv", pain: null },
      { name: "Edit LaTeX", page: "/cv", pain: "LaTeX is intimidating" },
      { name: "Use AI Modify", page: "/cv", pain: null },
      { name: "Download PDF", page: "/cv", pain: "Compilation can fail" },
    ],
    emotion: ["hopeful", "frustrated/confident", "satisfied"],
  },
];

// Personas
const PERSONAS = [
  {
    id: "tech-professional",
    name: "Alex - Senior Developer",
    description: "Experienced developer looking for next role",
    traits: ["Tech-savvy", "Values efficiency", "Applies to many jobs"],
    goals: ["Quick job analysis", "Track many applications", "Professional CV"],
    frustrations: ["Repetitive cover letters", "Losing track of applications"],
  },
  {
    id: "career-changer",
    name: "Jordan - Career Switcher",
    description: "Moving from different industry into tech",
    traits: ["Learning", "Uncertain about fit", "Needs guidance"],
    goals: ["Understand skill gaps", "Position experience well", "Build confidence"],
    frustrations: ["Don't know if qualified", "CV doesn't reflect potential"],
  },
  {
    id: "recent-grad",
    name: "Sam - Recent Graduate",
    description: "Just finished bootcamp, first job search",
    traits: ["Eager", "Limited experience", "Mobile-first"],
    goals: ["Stand out from competition", "Learn what employers want", "Stay organized"],
    frustrations: ["No experience to show", "Overwhelmed by process"],
  },
];

// Pain Points Summary
const PAIN_POINTS = [
  {
    id: 1,
    issue: "No tracker filtering",
    location: "/tracker",
    severity: "high",
    effort: "medium",
  },
  {
    id: 2,
    issue: "No actionable gap advice",
    location: "/analyze",
    severity: "high",
    effort: "medium",
  },
  { id: 3, issue: "No drag-drop upload", location: "/profile", severity: "medium", effort: "low" },
  {
    id: 4,
    issue: "No extraction progress",
    location: "/profile",
    severity: "medium",
    effort: "medium",
  },
  { id: 5, issue: "LaTeX intimidating", location: "/cv", severity: "medium", effort: "high" },
  { id: 6, issue: "No user state", location: "all", severity: "medium", effort: "medium" },
  { id: 7, issue: "Dense application cards", location: "/tracker", severity: "low", effort: "low" },
  { id: 8, issue: "Limited dashboard", location: "/dashboard", severity: "low", effort: "medium" },
];

type Tab = "journeys" | "personas" | "pain-points";

export default function UXPlannerPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("journeys");
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const journey = JOURNEYS.find((j) => j.id === selectedJourney);
  const persona = PERSONAS.find((p) => p.id === selectedPersona);

  return (
    <div className="min-h-screen bg-nordic-neutral-50 p-8">
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nordic-neutral-900">UX Planner</h1>
          <p className="text-nordic-neutral-600">
            Interactive tool for exploring user journeys and planning improvements
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { id: "journeys" as const, label: "User Journeys", icon: "🗺️" },
            { id: "personas" as const, label: "Personas", icon: "👤" },
            { id: "pain-points" as const, label: "Pain Points", icon: "⚠️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-fjord-600 text-white"
                  : "bg-white text-nordic-neutral-700 hover:bg-nordic-neutral-100"
              }`}
            >
              {tab.icon} {tab.label}
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
                    {JOURNEYS.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => setSelectedJourney(j.id)}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${
                          selectedJourney === j.id
                            ? "bg-fjord-50 border-fjord-200 border"
                            : "hover:bg-nordic-neutral-50"
                        }`}
                      >
                        <div className="font-medium text-nordic-neutral-900">{j.name}</div>
                        <div className="text-sm text-nordic-neutral-500">{j.description}</div>
                        <div className="mt-1 text-xs text-nordic-neutral-400">
                          {j.steps.length} steps • {j.steps.filter((s) => s.pain).length} pain
                          points
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
                    {PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPersona(p.id)}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${
                          selectedPersona === p.id
                            ? "bg-fjord-50 border-fjord-200 border"
                            : "hover:bg-nordic-neutral-50"
                        }`}
                      >
                        <div className="font-medium text-nordic-neutral-900">{p.name}</div>
                        <div className="text-sm text-nordic-neutral-500">{p.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "pain-points" && (
                <>
                  <h2 className="mb-4 font-semibold text-nordic-neutral-900">All Pain Points</h2>
                  <div className="space-y-2">
                    {PAIN_POINTS.map((p) => (
                      <div key={p.id} className="rounded-lg border border-nordic-neutral-200 p-3">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-nordic-neutral-900">{p.issue}</div>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              p.severity === "high"
                                ? "bg-red-100 text-red-700"
                                : p.severity === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {p.severity}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-nordic-neutral-500">
                          {p.location} • Effort: {p.effort}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Detail */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-nordic-neutral-200 bg-white p-6">
              {activeTab === "journeys" && journey && (
                <>
                  <h2 className="mb-2 text-xl font-semibold text-nordic-neutral-900">
                    {journey.name}
                  </h2>
                  <p className="mb-6 text-nordic-neutral-600">{journey.description}</p>

                  {/* Journey Visualization */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-medium text-nordic-neutral-500">
                      Journey Steps
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {journey.steps.map((step, i) => (
                        <div key={i} className="flex items-center">
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              step.pain
                                ? "border-2 border-amber-300 bg-amber-50"
                                : "bg-nordic-neutral-100"
                            }`}
                            title={step.pain || "No issues"}
                          >
                            <div className="font-medium">{step.name}</div>
                            <div className="text-xs text-nordic-neutral-500">{step.page}</div>
                            {step.pain && (
                              <div className="mt-1 text-xs text-amber-700">⚠️ {step.pain}</div>
                            )}
                          </div>
                          {i < journey.steps.length - 1 && (
                            <div className="mx-2 text-nordic-neutral-300">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emotional Journey */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-nordic-neutral-500">
                      Emotional Arc
                    </h3>
                    <div className="flex gap-4">
                      {journey.emotion.map((emotion, i) => (
                        <div key={i} className="text-center">
                          <div className="text-2xl">
                            {emotion.includes("anxious")
                              ? "😰"
                              : emotion.includes("frustrated")
                                ? "😤"
                                : emotion.includes("relieved")
                                  ? "😌"
                                  : emotion.includes("curious")
                                    ? "🤔"
                                    : emotion.includes("overwhelmed")
                                      ? "😵"
                                      : emotion.includes("validated")
                                        ? "✅"
                                        : emotion.includes("motivated")
                                          ? "💪"
                                          : "😊"}
                          </div>
                          <div className="text-xs text-nordic-neutral-500">{emotion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "personas" && persona && (
                <>
                  <h2 className="mb-2 text-xl font-semibold text-nordic-neutral-900">
                    {persona.name}
                  </h2>
                  <p className="mb-6 text-nordic-neutral-600">{persona.description}</p>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-nordic-neutral-500">Traits</h3>
                      <div className="flex flex-wrap gap-2">
                        {persona.traits.map((trait, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-fjord-100 px-3 py-1 text-sm text-fjord-700"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-medium text-nordic-neutral-500">Goals</h3>
                      <ul className="space-y-1">
                        {persona.goals.map((goal, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-forest-600">✓</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="mb-2 text-sm font-medium text-nordic-neutral-500">
                        Frustrations
                      </h3>
                      <ul className="space-y-1">
                        {persona.frustrations.map((frustration, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                            <span>✗</span>
                            {frustration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "pain-points" && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-nordic-neutral-900">
                    Priority Matrix
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1" />
                    <div className="text-center text-sm font-medium text-nordic-neutral-500">
                      Low Effort
                    </div>
                    <div className="text-center text-sm font-medium text-nordic-neutral-500">
                      High Effort
                    </div>

                    <div className="text-right text-sm font-medium text-nordic-neutral-500">
                      High Impact
                    </div>
                    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-3">
                      <div className="mb-1 text-xs font-medium text-green-700">DO FIRST</div>
                      {PAIN_POINTS.filter((p) => p.severity === "high" && p.effort === "low").map(
                        (p) => (
                          <div key={p.id} className="text-sm">
                            {p.issue}
                          </div>
                        )
                      )}
                      {PAIN_POINTS.filter((p) => p.severity === "high" && p.effort === "low")
                        .length === 0 && (
                        <div className="text-sm text-nordic-neutral-400">None</div>
                      )}
                    </div>
                    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
                      <div className="mb-1 text-xs font-medium text-amber-700">SCHEDULE</div>
                      {PAIN_POINTS.filter(
                        (p) =>
                          p.severity === "high" && (p.effort === "medium" || p.effort === "high")
                      ).map((p) => (
                        <div key={p.id} className="text-sm">
                          {p.issue}
                        </div>
                      ))}
                    </div>

                    <div className="text-right text-sm font-medium text-nordic-neutral-500">
                      Low Impact
                    </div>
                    <div className="rounded-lg border border-nordic-neutral-200 bg-nordic-neutral-50 p-3">
                      <div className="mb-1 text-xs font-medium text-nordic-neutral-500">
                        QUICK WINS
                      </div>
                      {PAIN_POINTS.filter((p) => p.severity !== "high" && p.effort === "low").map(
                        (p) => (
                          <div key={p.id} className="text-sm">
                            {p.issue}
                          </div>
                        )
                      )}
                    </div>
                    <div className="rounded-lg border border-nordic-neutral-200 bg-nordic-neutral-50 p-3">
                      <div className="mb-1 text-xs font-medium text-nordic-neutral-500">
                        CONSIDER LATER
                      </div>
                      {PAIN_POINTS.filter(
                        (p) =>
                          p.severity !== "high" && (p.effort === "medium" || p.effort === "high")
                      ).map((p) => (
                        <div key={p.id} className="text-sm">
                          {p.issue}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty States */}
              {activeTab === "journeys" && !journey && (
                <div className="py-12 text-center text-nordic-neutral-400">
                  ← Select a journey to explore
                </div>
              )}
              {activeTab === "personas" && !persona && (
                <div className="py-12 text-center text-nordic-neutral-400">
                  ← Select a persona to view details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 rounded-lg border border-nordic-neutral-200 bg-white p-4">
          <h3 className="mb-3 font-medium text-nordic-neutral-900">Documentation</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/RafaelMurad/job-hunting-assistant/blob/main/docs/ux/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fjord-600 hover:underline"
            >
              📄 UX README
            </a>
            <a
              href="https://github.com/RafaelMurad/job-hunting-assistant/blob/main/docs/ux/user-journeys.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fjord-600 hover:underline"
            >
              🗺️ User Journeys
            </a>
            <a
              href="https://github.com/RafaelMurad/job-hunting-assistant/blob/main/docs/ux/pain-points.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fjord-600 hover:underline"
            >
              ⚠️ Pain Points
            </a>
            <a
              href="https://github.com/RafaelMurad/job-hunting-assistant/blob/main/docs/ux/design-principles.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-fjord-600 hover:underline"
            >
              🎨 Design Principles
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
