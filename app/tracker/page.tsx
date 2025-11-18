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

  useEffect(() => {
    // Get user first
    fetch("/api/user")
      .then((res) => res.json())
      .then((user) => {
        // Then load applications
        return fetch(`/api/applications?userId=${user.id}`);
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

  const getStatusBadgeVariant = (status: string): string => {
    const variants: Record<string, string> = {
      saved: "bg-gray-100 text-gray-800",
      applied: "bg-blue-100 text-blue-800",
      interviewing: "bg-purple-100 text-purple-800",
      offer: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return "text-green-600 font-semibold";
    if (score >= 60) return "text-blue-600 font-semibold";
    if (score >= 40) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
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
            <Button variant="outline" onClick={() => router.push("/")}>
              Profile
            </Button>
            <Button onClick={() => router.push("/analyze")}>+ Analyze New Job</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
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

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              {applications.length === 0
                ? "No applications yet"
                : `${applications.length} total applications`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No applications tracked yet</p>
                <Button onClick={() => router.push("/analyze")}>Analyze Your First Job →</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{app.company}</h3>
                        <p className="text-gray-600">{app.role}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getStatusBadgeVariant(app.status)}>{app.status}</Badge>
                          <span className={getMatchColor(app.matchScore)}>
                            {app.matchScore}% match
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
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
