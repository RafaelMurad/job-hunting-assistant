/**
 * Dashboard Page
 *
 * WHY: Users need a "home base" after entering the app - a place to see
 * their status at a glance and quickly navigate to common actions.
 *
 * WHAT: Overview page showing profile summary, application stats, and quick actions.
 *
 * HOW: Server Component that fetches user data and renders cards.
 * Uses Server Components for initial data (no useEffect needed!).
 */

// Force dynamic rendering - this page uses Prisma which requires DATABASE_URL at runtime
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import Link from "next/link";
import type { JSX } from "react";

/**
 * Fetch dashboard data on the server.
 * This runs at request time (not build time) because we're reading from DB.
 */
async function getDashboardData(): Promise<{
  user: Awaited<ReturnType<typeof prisma.user.findFirst>>;
  recentApplications: Awaited<ReturnType<typeof prisma.application.findMany>>;
  stats: { total: number; saved: number; applied: number; interviewing: number };
}> {
  const user = await prisma.user.findFirst();

  if (!user) {
    return {
      user: null,
      recentApplications: [],
      stats: { total: 0, saved: 0, applied: 0, interviewing: 0 },
    };
  }

  // Run queries in parallel for efficiency
  const [recentApplications, total, saved, applied, interviewing] = await Promise.all([
    // Get recent applications for display
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Get accurate counts for stats (not limited to 5)
    prisma.application.count({ where: { userId: user.id } }),
    prisma.application.count({ where: { userId: user.id, status: "saved" } }),
    prisma.application.count({ where: { userId: user.id, status: "applied" } }),
    prisma.application.count({ where: { userId: user.id, status: "interviewing" } }),
  ]);

  return {
    user,
    recentApplications,
    stats: { total, saved, applied, interviewing },
  };
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const { user, recentApplications, stats } = await getDashboardData();

  // Check profile completion
  const isProfileComplete =
    user?.name &&
    user?.email &&
    user?.location &&
    user?.summary &&
    user?.experience &&
    user?.skills;

  const profileCompletionPercent = user
    ? Math.round(
        ([user.name, user.email, user.location, user.summary, user.experience, user.skills].filter(
          Boolean
        ).length /
          6) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-nordic-neutral-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nordic-neutral-900 dark:text-white mb-2">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}!` : "Welcome to Job Hunt AI"}
          </h1>
          <p className="text-nordic-neutral-600 dark:text-slate-400">
            Your command center for finding the perfect job.
          </p>
        </div>

        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <div className="mb-6 bg-clay-50 dark:bg-clay-900/20 border border-clay-200 dark:border-clay-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-clay-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-clay-900 dark:text-clay-100">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-clay-700 dark:text-clay-300 mt-1">
                    Your profile is {profileCompletionPercent}% complete. Fill in all fields to
                    unlock AI features.
                  </p>
                </div>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Complete Profile →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saved</CardDescription>
              <CardTitle className="text-3xl text-nordic-neutral-600">{stats.saved}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Applied</CardDescription>
              <CardTitle className="text-3xl text-fjord-600">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Interviewing</CardDescription>
              <CardTitle className="text-3xl text-forest-600">{stats.interviewing}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks at your fingertips</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/analyze" className="block">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Analyze a Job Posting
                </Button>
              </Link>
              <Link href="/tracker" className="block">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  View Application Tracker
                </Button>
              </Link>
              <Link href="/profile" className="block">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-nordic-neutral-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-nordic-neutral-900 dark:text-gray-100">
                          {app.role}
                        </p>
                        <p className="text-sm text-nordic-neutral-600 dark:text-gray-400">
                          {app.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            app.status === "interviewing"
                              ? "bg-forest-100 dark:bg-forest-900/50 text-forest-700 dark:text-forest-300"
                              : app.status === "applied"
                                ? "bg-fjord-100 dark:bg-fjord-900/50 text-fjord-700 dark:text-fjord-300"
                                : "bg-nordic-neutral-100 dark:bg-gray-700 text-nordic-neutral-700 dark:text-gray-300"
                          }`}
                        >
                          {app.status}
                        </span>
                        <span className="text-sm text-nordic-neutral-500 dark:text-gray-400">
                          {app.matchScore}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-nordic-neutral-300 dark:text-gray-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-nordic-neutral-600 dark:text-gray-400 mb-4">
                    No applications yet
                  </p>
                  <Link href="/analyze">
                    <Button>Analyze Your First Job →</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary Card */}
        {user && isProfileComplete && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Summary of your professional background</CardDescription>
                </div>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-nordic-neutral-500 dark:text-gray-400 mb-1">
                    Contact
                  </h4>
                  <p className="text-nordic-neutral-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-nordic-neutral-600 dark:text-gray-400 text-sm">{user.email}</p>
                  <p className="text-nordic-neutral-600 dark:text-gray-400 text-sm">
                    {user.location}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-nordic-neutral-500 dark:text-gray-400 mb-1">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skills
                      .split(",")
                      .slice(0, 8)
                      .map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs bg-fjord-50 dark:bg-fjord-900/50 text-fjord-700 dark:text-fjord-300 px-2 py-1 rounded"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    {user.skills.split(",").length > 8 && (
                      <span className="text-xs text-nordic-neutral-500 dark:text-gray-400">
                        +{user.skills.split(",").length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
