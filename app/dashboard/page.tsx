/**
 * Dashboard Page
 *
 * WHY: Users need a "home base" after entering the app - a place to see
 * their status at a glance and quickly navigate to common actions.
 *
 * WHAT: Overview page showing profile summary, application stats, and quick actions.
 *
 * HOW: Client Component that uses storage hooks for dual-mode support.
 * - Local mode: data from IndexedDB
 * - Demo mode: data from tRPC/PostgreSQL
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStorageUser, useStorageApplications } from "@/lib/hooks";
import Link from "next/link";
import type { JSX } from "react";

export default function DashboardPage(): JSX.Element {
  const { user, loading: userLoading, isProfileComplete } = useStorageUser();
  const { applications, stats, loading: appsLoading } = useStorageApplications();

  // Loading state
  if (userLoading || appsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get recent applications (last 5)
  const recentApplications = applications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calculate profile completion percentage
  const profileFields = [
    user?.name,
    user?.email,
    user?.location,
    user?.summary,
    user?.experience,
    user?.skills,
  ];
  const profileCompletionPercent = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Compact on mobile */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}!` : "Welcome to CareerPal"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Your command center for finding the perfect job.
          </p>
        </div>

        {/* Profile Completion Alert - Compact on mobile */}
        {!isProfileComplete && (
          <div className="mb-4 sm:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 shrink-0"
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
                  <h3 className="font-medium text-red-900 dark:text-red-100 text-sm sm:text-base">
                    Complete Your Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-0.5 sm:mt-1">
                    Your profile is {profileCompletionPercent}% complete. Fill in all fields to
                    unlock AI features.
                  </p>
                </div>
              </div>
              <Link href="/profile" className="self-end sm:self-auto">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  Complete Profile →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
          <Card className="p-0">
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Total Applications</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="p-0">
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Applied</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-sky-600">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="p-0">
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Interviewing</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-emerald-600">
                {stats.interviewing}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="p-0">
            <CardHeader className="p-3 sm:p-4 sm:pb-2">
              <CardDescription className="text-xs sm:text-sm">Offers</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-purple-600">{stats.offers}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Common tasks at your fingertips
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
              <Link href="/analyze" className="block">
                <Button className="w-full justify-start gap-2 h-11" variant="outline">
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
                <Button className="w-full justify-start gap-2 h-11" variant="outline">
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
                <Button className="w-full justify-start gap-2 h-11" variant="outline">
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
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Recent Applications</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your latest job applications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentApplications.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                          {app.role}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                          {app.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            app.status === "interviewing"
                              ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                              : app.status === "applied"
                                ? "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300"
                                : app.status === "offer"
                                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {app.status}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">
                          {app.matchScore}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3"
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
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                    No applications yet
                  </p>
                  <Link href="/analyze">
                    <Button className="h-11">Analyze Your First Job →</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary Card - Hidden on mobile (accessible via bottom nav) */}
        {user && isProfileComplete && (
          <Card className="mt-4 sm:mt-6 hidden sm:block">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Your Profile</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Summary of your professional background
                  </CardDescription>
                </div>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Contact
                  </h4>
                  <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {user.name}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    {user.email}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    {user.location}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skills
                      .split(",")
                      .slice(0, 8)
                      .map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs bg-sky-50 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-2 py-1 rounded"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    {user.skills.split(",").length > 8 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
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
