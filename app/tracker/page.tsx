"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStorageApplications } from "@/lib/hooks";
import type { ApplicationStatus } from "@/types";
import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";

/**
 * Format a date using native Intl.DateTimeFormat
 * Replaces date-fns format() to save 38MB in node_modules
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Application Tracker Page
 *
 * UX Improvements Applied:
 * - Search functionality
 * - Tab-based status filtering
 * - Multiple sort options
 * - Better visual hierarchy
 * - Loading states
 */

const STATUS_OPTIONS = [
  { value: "saved", label: "Saved", emoji: "bookmark" },
  { value: "applied", label: "Applied", emoji: "send" },
  { value: "interviewing", label: "Interviewing", emoji: "calendar" },
  { value: "offer", label: "Offer", emoji: "star" },
  { value: "rejected", label: "Rejected", emoji: "x" },
] as const;

type SortOption = "newest" | "oldest" | "company" | "matchScore";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "company", label: "Company A-Z" },
  { value: "matchScore", label: "Best Match" },
];

/**
 * Scrollable pills with overflow detection
 */
function ScrollablePills({
  statusFilter,
  onFilterChange,
}: {
  statusFilter: string;
  onFilterChange: (value: string) => void;
}): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);
  const [showLeftFade, setShowLeftFade] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const hasOverflow = el.scrollWidth > el.clientWidth;
    const isScrolledLeft = el.scrollLeft > 0;
    const isScrolledRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    setShowLeftFade(isScrolledLeft);
    setShowRightFade(hasOverflow && !isScrolledRight);
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow]);

  return (
    <div className="relative">
      {/* Left fade */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkOverflow}
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange("all")}
            className={`h-8 rounded-full px-4 text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-cyan-500 text-slate-900"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={`h-8 rounded-full px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === value
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Right fade */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}

export default function TrackerPage(): JSX.Element {
  const router = useRouter();

  // Local state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>("");
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  // Data fetching (storage handles local/demo mode automatically)
  const { applications, stats, loading, updateStatus, updateNotes, remove } =
    useStorageApplications();

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.company.toLowerCase().includes(query) ||
          app.role.toLowerCase().includes(query) ||
          (app.notes && app.notes.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "company":
        result.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "matchScore":
        result.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    return result;
  }, [applications, statusFilter, searchQuery, sortBy]);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus): void => {
    setUpdatingStatusId(appId);
    void updateStatus(appId, newStatus);
    setTimeout(() => setUpdatingStatusId(null), 500);
  };

  const handleDelete = (appId: string): void => {
    void remove(appId);
    setDeletingId(null);
  };

  const handleRequestDelete = (appId: string): void => {
    setDeletingId(appId);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNotes = (appId: string): void => {
    setSavingNotesId(appId);
    void updateNotes(appId, notesDraft);
    setTimeout(() => {
      setSavingNotesId(null);
      setEditingNotesId(null);
    }, 500);
  };

  const getStatusBadgeVariant = (status: string): string => {
    const variants: Record<string, string> = {
      saved: "bg-slate-100 text-slate-700 border border-slate-200",
      applied: "bg-sky-50 text-sky-700 border border-sky-200",
      interviewing: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      offer: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      rejected: "bg-red-100 text-red-700 border border-red-300",
    };
    return variants[status] || "bg-slate-100 text-slate-700";
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return "text-emerald-700 font-semibold";
    if (score >= 60) return "text-sky-600 font-semibold";
    if (score >= 40) return "text-red-600 font-semibold";
    return "text-slate-600 font-semibold";
  };

  const getMatchBgColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-100";
    if (score >= 60) return "bg-sky-100";
    if (score >= 40) return "bg-red-100";
    return "bg-slate-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="animate-pulse">
            <div className="mb-8 h-10 w-64 rounded bg-gray-200 dark:bg-slate-700" />
            <div className="mb-6 grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200 dark:bg-slate-700" />
              ))}
            </div>
            <div className="h-96 rounded-lg bg-gray-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-4 sm:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setDeletingId(null);
          }}
          title="Delete application?"
          description="This action cannot be undone."
          variant="destructive"
          confirmText="Delete"
          onConfirm={() => {
            if (!deletingId) return;
            handleDelete(deletingId);
          }}
        />
        {/* Header - Compact on mobile */}
        <div className="mb-4 sm:mb-8 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-slate-100">
              Application Tracker
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
              Track all your job applications in one place
            </p>
          </div>
          {/* Hide Profile button on mobile - available via bottom nav */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="hidden sm:inline-flex"
            >
              Profile
            </Button>
            <Button onClick={() => router.push("/analyze")} className="flex-1 sm:flex-none h-11">
              + Analyze New Job
            </Button>
          </div>
        </div>

        {/* Stats Cards - 2x2 on mobile, hide Avg Match on small screens */}
        <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md p-0"
            onClick={() => setStatusFilter("all")}
          >
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Total</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md p-0"
            onClick={() => setStatusFilter("applied")}
          >
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Applied</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-blue-600">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md p-0"
            onClick={() => setStatusFilter("interviewing")}
          >
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Interviewing</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-purple-600">
                {stats.interviewing}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md p-0"
            onClick={() => setStatusFilter("offer")}
          >
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Offers</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-green-600">{stats.offers}</CardTitle>
            </CardHeader>
          </Card>
          {/* Avg Match - hidden on mobile */}
          <Card className="hidden lg:block">
            <CardHeader className="pb-2">
              <CardDescription>Avg Match</CardDescription>
              <CardTitle className="text-3xl">{stats.avgMatchScore}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6 space-y-3">
          {/* Search + Sort Row */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-8 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20"
                  title="Sort applications"
                >
                  <ArrowUpDown className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-white data-[state=checked]:text-cyan-600 dark:data-[state=checked]:text-cyan-400"
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Filter Pills - Horizontal scroll with overflow detection */}
          <ScrollablePills statusFilter={statusFilter} onFilterChange={setStatusFilter} />
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Applications</CardTitle>
                <CardDescription>
                  {applications.length === 0
                    ? "No applications yet"
                    : searchQuery || statusFilter !== "all"
                      ? `Showing ${filteredAndSortedApplications.length} of ${applications.length} applications`
                      : `${applications.length} total applications`}
                </CardDescription>
              </div>
              {filteredAndSortedApplications.length > 0 && searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedApplications.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-slate-400">
                {applications.length === 0 ? (
                  <>
                    <svg
                      className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mb-4 text-lg font-medium">No applications tracked yet</p>
                    <p className="mb-6 text-sm text-gray-400 dark:text-slate-500">
                      Start by analyzing a job to see how well you match
                    </p>
                    <Button onClick={() => router.push("/analyze")}>Analyze Your First Job</Button>
                  </>
                ) : (
                  <>
                    <svg
                      className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="mb-2 text-lg font-medium">No matching applications</p>
                    <p className="text-sm text-gray-400 dark:text-slate-500">
                      Try adjusting your search or filters
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedApplications.map((app) => (
                  <div
                    key={app.id}
                    className="group rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Match Score Badge */}
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getMatchBgColor(app.matchScore)}`}
                          >
                            <span className={`text-sm font-bold ${getMatchColor(app.matchScore)}`}>
                              {app.matchScore}%
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">
                              {app.company}
                            </h3>
                            <p className="text-gray-600 dark:text-slate-400 truncate">{app.role}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {/* Status Dropdown */}
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value as ApplicationStatus)
                            }
                            disabled={updatingStatusId === app.id}
                            className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1
                              ${getStatusBadgeVariant(app.status)}
                              ${updatingStatusId === app.id ? "cursor-wait opacity-50" : "hover:border-gray-400"}`}
                            aria-label={`Change status for ${app.company} - ${app.role}`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {app.appliedAt
                            ? `Applied ${formatDate(new Date(app.appliedAt))}`
                            : `Saved ${formatDate(new Date(app.createdAt))}`}
                        </p>

                        {/* Delete button */}
                        <button
                          onClick={() => handleRequestDelete(app.id)}
                          className="p-1 text-gray-400 dark:text-slate-500 opacity-0 transition-opacity hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100"
                          aria-label={`Delete application for ${app.company}`}
                          title="Delete application"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-4 border-t border-gray-100 dark:border-slate-700 pt-4">
                      {editingNotesId === app.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Add notes about this application..."
                            rows={3}
                            className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-sky-500 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-cyan-400/20"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(app.id)}
                              disabled={savingNotesId === app.id}
                            >
                              {savingNotesId === app.id ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingNotesId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNotesId(app.id);
                            setNotesDraft(app.notes || "");
                          }}
                          className="w-full text-left text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                        >
                          {app.notes ? (
                            <p className="line-clamp-2">{app.notes}</p>
                          ) : (
                            <p className="italic text-gray-400 dark:text-slate-500">+ Add notes</p>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
