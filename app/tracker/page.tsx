"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Application {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  status: string;
  appliedAt: string | null;
  createdAt: string;
}

export default function TrackerPage(): React.JSX.Element {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user first
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((user) => {
        if (!user || !user.id) {
          throw new Error("No user found");
        }
        // Then load applications
        return fetch(`/api/applications?userId=${user.id}`);
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch applications");
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setApplications(data);
        } else {
          setApplications([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading applications:", err);
        setError(err.message || "Failed to load applications");
        setLoading(false);
      });
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-nordic-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fjord-600 mx-auto mb-4"></div>
          <p className="text-nordic-neutral-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nordic-neutral-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-clay-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-clay-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-nordic-neutral-900 mb-2">Unable to Load Applications</h2>
          <p className="text-nordic-neutral-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={() => router.push("/profile")}>
              Go to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nordic-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-nordic-neutral-900 mb-2">Application Tracker</h1>
            <p className="text-nordic-neutral-600">Track all your job applications in one place</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button onClick={() => router.push("/analyze")}>+ Analyze New Job</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card className="border-nordic-neutral-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-nordic-neutral-600">Total</CardDescription>
              <CardTitle className="text-3xl text-nordic-neutral-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-fjord-200 bg-fjord-50/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-fjord-700">Applied</CardDescription>
              <CardTitle className="text-3xl text-fjord-600">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-forest-200 bg-forest-50/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-forest-700">Interviewing</CardDescription>
              <CardTitle className="text-3xl text-forest-600">{stats.interviewing}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-forest-300 bg-forest-100/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-forest-800">Offers</CardDescription>
              <CardTitle className="text-3xl text-forest-700">{stats.offers}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-nordic-neutral-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-nordic-neutral-600">Avg Match</CardDescription>
              <CardTitle className="text-3xl text-nordic-neutral-900">{stats.avgMatch}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Applications List */}
        <Card className="border-nordic-neutral-200 shadow-sm">
          <CardHeader className="bg-white border-b border-nordic-neutral-200">
            <CardTitle className="text-nordic-neutral-900">All Applications</CardTitle>
            <CardDescription className="text-nordic-neutral-600">
              {applications.length === 0
                ? "No applications yet"
                : `${applications.length} total applications`}
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white pt-6">
            {applications.length === 0 ? (
              <div className="text-center py-12 text-nordic-neutral-500">
                <p className="mb-4">No applications tracked yet</p>
                <Button onClick={() => router.push("/analyze")}>Analyze Your First Job →</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-nordic-neutral-200 p-6 hover:border-nordic-neutral-300 hover:shadow-sm transition-all duration-200 rounded-lg bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-lg text-nordic-neutral-900">
                          {app.company}
                        </h3>
                        <p className="mb-3 text-nordic-neutral-600">
                          {app.role}
                        </p>
                        <div className="flex gap-3 items-center">
                          <Badge className={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                          <span className={getMatchColor(app.matchScore)}>
                            {app.matchScore}% match
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-nordic-neutral-500">
                        <p>
                          {app.appliedAt
                            ? `Applied ${format(new Date(app.appliedAt), "MMM d")}`
                            : `Saved ${format(new Date(app.createdAt), "MMM d")}`}
                        </p>
                      </div>
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
