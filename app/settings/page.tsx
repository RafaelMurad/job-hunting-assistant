"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APIKeysSettings } from "@/components/settings/api-keys-settings";
import { trpc } from "@/lib/trpc/client";
import type { JSX } from "react";

/**
 * Loading Skeleton for settings page
 */
function SettingsLoadingSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Settings Page
 *
 * Simplified settings with account management only.
 */
export default function SettingsPage(): JSX.Element {
  const { data: userData, isLoading: userLoading } = trpc.user.get.useQuery();

  if (userLoading) {
    return <SettingsLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-slate-100">Settings</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage your account</p>
        </div>

        {/* API Keys Settings (Local Mode Only) */}
        <APIKeysSettings />

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                    Profile Information
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {userData?.user?.name ?? "Not set"} ({userData?.user?.email ?? "No email"})
                  </p>
                </div>
                <Button variant="outline" onClick={() => (window.location.href = "/profile")}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
