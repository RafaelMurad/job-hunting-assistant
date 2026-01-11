"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplications, type ApplicationStatus } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState, type JSX } from "react";

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

  // Data fetching (auth handled by tRPC middleware)
  const { applications, stats, loading, updateStatus, updateNotes, remove } = useApplications();

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

  // Count by status for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    STATUS_OPTIONS.forEach(({ value }) => {
      counts[value] = applications.filter((app) => app.status === value).length;
    });
    return counts;
  }, [applications]);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus): void => {
    setUpdatingStatusId(appId);
    updateStatus(appId, newStatus);
    setTimeout(() => setUpdatingStatusId(null), 500);
  };

  const handleDelete = (appId: string): void => {
    remove(appId);
    setDeletingId(null);
  };

  const handleRequestDelete = (appId: string): void => {
    setDeletingId(appId);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNotes = (appId: string): void => {
    setSavingNotesId(appId);
    updateNotes(appId, notesDraft);
    setTimeout(() => {
      setSavingNotesId(null);
      setEditingNotesId(null);
    }, 500);
  };

  const getStatusBadgeVariant = (status: string): string => {
    const variants: Record<string, string> = {
      saved: "bg-nordic-neutral-100 text-nordic-neutral-700 border border-nordic-neutral-200",
      applied: "bg-fjord-50 text-fjord-700 border border-fjord-200",
      interviewing: "bg-forest-50 text-forest-700 border border-forest-200",
      offer: "bg-forest-100 text-forest-800 border border-forest-300",
      rejected: "bg-clay-100 text-clay-700 border border-clay-300",
    };
    return variants[status] || "bg-nordic-neutral-100 text-nordic-neutral-700";
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return "text-forest-700 font-semibold";
    if (score >= 60) return "text-fjord-600 font-semibold";
    if (score >= 40) return "text-clay-600 font-semibold";
    return "text-nordic-neutral-600 font-semibold";
  };

  const getMatchBgColor = (score: number): string => {
    if (score >= 80) return "bg-forest-100";
    if (score >= 60) return "bg-fjord-100";
    if (score >= 40) return "bg-clay-100";
    return "bg-nordic-neutral-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="animate-pulse">
            <div className="mb-8 h-10 w-64 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-6 grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
            <div className="h-96 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
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
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Application Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track all your job applications in one place
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button onClick={() => router.push("/analyze")}>+ Analyze New Job</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setStatusFilter("all")}
          >
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setStatusFilter("applied")}
          >
            <CardHeader className="pb-2">
              <CardDescription>Applied</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setStatusFilter("interviewing")}
          >
            <CardHeader className="pb-2">
              <CardDescription>Interviewing</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{stats.interviewing}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setStatusFilter("offer")}
          >
            <CardHeader className="pb-2">
              <CardDescription>Offers</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.offers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Match</CardDescription>
              <CardTitle className="text-3xl">{stats.avgMatchScore}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
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
                placeholder="Search by company, role, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-fjord-500 dark:focus:border-fjord-400 focus:outline-none focus:ring-2 focus:ring-fjord-500/20 dark:focus:ring-fjord-400/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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

            {/* Sort */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="sort-by"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sort by:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-fjord-500 dark:focus:border-fjord-400 focus:outline-none focus:ring-2 focus:ring-fjord-500/20 dark:focus:ring-fjord-400/20"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-fjord-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All ({statusCounts.all})
            </button>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === value
                    ? "bg-fjord-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {label} ({statusCounts[value] || 0})
              </button>
            ))}
          </div>
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
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
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
                    <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">
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
                    <p className="text-sm text-gray-400 dark:text-gray-500">
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
                    className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {app.company}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 truncate">{app.role}</p>
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
                            className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-fjord-500 focus:ring-offset-1
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {app.appliedAt
                            ? `Applied ${formatDate(new Date(app.appliedAt))}`
                            : `Saved ${formatDate(new Date(app.createdAt))}`}
                        </p>

                        {/* Delete button */}
                        <button
                          onClick={() => handleRequestDelete(app.id)}
                          className="p-1 text-gray-400 dark:text-gray-500 opacity-0 transition-opacity hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100"
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
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                      {editingNotesId === app.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Add notes about this application..."
                            rows={3}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-fjord-500 dark:focus:border-fjord-400 focus:outline-none focus:ring-2 focus:ring-fjord-500/20 dark:focus:ring-fjord-400/20"
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
                          className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {app.notes ? (
                            <p className="line-clamp-2">{app.notes}</p>
                          ) : (
                            <p className="italic text-gray-400 dark:text-gray-500">+ Add notes</p>
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
