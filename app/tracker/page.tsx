"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Application {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  status: string;
  appliedAt: string | null;
  createdAt: string;
  notes: string | null;
}

const STATUS_OPTIONS = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const FILTER_OPTIONS = [{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS];

export default function TrackerPage(): React.JSX.Element {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which application is being deleted (for inline confirmation)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Track which status is being updated
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>("");
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  useEffect(() => {
    // Get user first, then load applications
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        // Then load applications
        return fetch(`/api/applications?userId=${data.user?.id}`);
      })
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading applications:", err);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string): Promise<void> => {
    setUpdatingStatusId(appId);

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          // Set appliedAt when status changes to "applied"
          ...(newStatus === "applied" && { appliedAt: new Date().toISOString() }),
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? {
                ...app,
                status: newStatus,
                appliedAt: newStatus === "applied" ? new Date().toISOString() : app.appliedAt,
              }
            : app
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (appId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== appId));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting application:", error);
      setDeletingId(null);
    }
  };

  const handleSaveNotes = async (appId: string): Promise<void> => {
    setSavingNotesId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, notes: notesDraft } : app))
      );
      setEditingNotesId(null);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSavingNotesId(null);
    }
  };

  // Filter applications by status
  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

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

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offers: applications.filter((a) => a.status === "offer").length,
    avgMatch:
      applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
        : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Application Tracker</h1>
            <p className="text-gray-600">Track all your job applications in one place</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button onClick={() => router.push("/analyze")}>+ Analyze New Job</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Applied</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Interviewing</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{stats.interviewing}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Offers</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.offers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Match</CardDescription>
              <CardTitle className="text-3xl">{stats.avgMatch}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-fjord-500"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              {applications.length === 0
                ? "No applications yet"
                : statusFilter === "all"
                  ? `${applications.length} total applications`
                  : `${filteredApplications.length} of ${applications.length} applications`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">
                  {applications.length === 0
                    ? "No applications tracked yet"
                    : "No applications match this filter"}
                </p>
                {applications.length === 0 && (
                  <Button onClick={() => router.push("/analyze")}>Analyze Your First Job →</Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "white",
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{
                            fontSize: "var(--text-heading-sm)",
                            lineHeight: "var(--leading-heading)",
                            color: "var(--color-nordic-neutral-900)",
                          }}
                        >
                          {app.company}
                        </h3>
                        <p
                          className="mb-3"
                          style={{
                            fontSize: "var(--text-body)",
                            color: "var(--color-nordic-neutral-600)",
                          }}
                        >
                          {app.role}
                        </p>
                        <div className="flex gap-3 items-center flex-wrap">
                          {/* Status Dropdown */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={updatingStatusId === app.id}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors cursor-pointer
                              ${getStatusBadgeVariant(app.status)}
                              ${updatingStatusId === app.id ? "opacity-50 cursor-wait" : "hover:border-gray-400"}
                              focus:outline-none focus:ring-2 focus:ring-fjord-500 focus:ring-offset-1`}
                            aria-label={`Change status for ${app.company} - ${app.role}`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <span className={getMatchColor(app.matchScore)}>
                            {app.matchScore}% match
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p
                          style={{
                            fontSize: "var(--text-small)",
                            color: "var(--color-nordic-neutral-500)",
                          }}
                        >
                          {app.appliedAt
                            ? `Applied ${format(new Date(app.appliedAt), "MMM d")}`
                            : `Saved ${format(new Date(app.createdAt), "MMM d")}`}
                        </p>

                        {/* Delete button with inline confirmation */}
                        {deletingId === app.id ? (
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-red-600">Delete?</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(app.id)}
                              className="h-7 px-2 text-xs"
                            >
                              Yes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingId(null)}
                              className="h-7 px-2 text-xs"
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(app.id)}
                            className="text-nordic-neutral-400 hover:text-red-500 transition-colors p-1"
                            aria-label={`Delete application for ${app.company}`}
                            title="Delete application"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {editingNotesId === app.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Add notes about this application..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fjord-500"
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
                          className="text-sm text-gray-500 hover:text-gray-700 text-left w-full"
                        >
                          {app.notes ? <p>{app.notes}</p> : <p className="italic">+ Add notes</p>}
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
