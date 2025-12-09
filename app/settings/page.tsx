"use client";

import { useState, type JSX } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { useFeatureFlag } from "@/lib/feature-flags/hooks";

/**
 * Settings Page
 *
 * User settings including social integrations (GitHub, LinkedIn),
 * profile preferences, and account management.
 */
export default function SettingsPage(): JSX.Element {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  // Feature flags
  const integrationsEnabled = useFeatureFlag("integrations");
  const githubEnabled = useFeatureFlag("github_integration");
  const linkedInEnabled = useFeatureFlag("linkedin_integration");

  // Get user
  const { data: userData, isLoading: userLoading } = trpc.user.get.useQuery();
  const userId = userData?.user?.id || "";

  // Get configured providers
  const { data: configuredProviders } = trpc.social.getConfiguredProviders.useQuery();

  // Get integrations status
  const {
    data: integrations,
    isLoading: _integrationsLoading,
    refetch: refetchIntegrations,
  } = trpc.social.getIntegrations.useQuery({ userId }, { enabled: !!userId });

  // Mutations
  const disconnectMutation = trpc.social.disconnect.useMutation({
    onSuccess: () => {
      refetchIntegrations();
    },
  });

  const syncMutation = trpc.social.sync.useMutation({
    onSuccess: () => {
      refetchIntegrations();
    },
  });

  // Local state
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  const handleConnect = (provider: "github" | "linkedin"): void => {
    if (!userId) return;
    // Redirect to OAuth endpoint
    window.location.href = `/api/auth/${provider}?userId=${userId}`;
  };

  const handleDisconnect = async (provider: "GITHUB" | "LINKEDIN"): Promise<void> => {
    if (!userId) return;
    await disconnectMutation.mutateAsync({ userId, provider });
  };

  const handleSync = async (provider: "GITHUB" | "LINKEDIN"): Promise<void> => {
    if (!userId) return;
    setSyncingProvider(provider);
    try {
      await syncMutation.mutateAsync({ userId, provider });
    } finally {
      setSyncingProvider(null);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  const githubStatus = integrations?.find((i) => i.provider === "github");
  const linkedInStatus = integrations?.find((i) => i.provider === "linkedin");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and integrations</p>
        </div>

        {/* Success/Error Messages */}
        {success && connected && (
          <div className="mb-6 rounded-lg border border-forest-300 bg-forest-50 p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-forest-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-2 font-medium text-forest-800">
                Successfully connected {connected === "github" ? "GitHub" : "LinkedIn"}!
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span className="ml-2 font-medium text-red-800">{decodeURIComponent(error)}</span>
            </div>
          </div>
        )}

        {/* Social Integrations */}
        {integrationsEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Social Integrations</CardTitle>
              <CardDescription>
                Connect your accounts to import your professional data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GitHub Integration */}
              {githubEnabled && configuredProviders?.github && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-900">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">GitHub</h3>
                      {githubStatus?.connected ? (
                        <p className="text-sm text-gray-600">
                          Connected as{" "}
                          <span className="font-medium">{githubStatus.username}</span>
                          {githubStatus.lastSyncAt && (
                            <span className="ml-2 text-gray-400">
                              Last synced:{" "}
                              {new Date(githubStatus.lastSyncAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Import repositories, languages, and contributions
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {githubStatus?.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync("GITHUB")}
                          disabled={syncingProvider === "GITHUB"}
                        >
                          {syncingProvider === "GITHUB" ? "Syncing..." : "Sync"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect("GITHUB")}
                          disabled={disconnectMutation.isPending}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleConnect("github")}>Connect GitHub</Button>
                    )}
                  </div>
                </div>
              )}

              {/* LinkedIn Integration */}
              {linkedInEnabled && configuredProviders?.linkedin && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0A66C2]">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">LinkedIn</h3>
                      {linkedInStatus?.connected ? (
                        <p className="text-sm text-gray-600">
                          Connected as{" "}
                          <span className="font-medium">{linkedInStatus.displayName}</span>
                          {linkedInStatus.lastSyncAt && (
                            <span className="ml-2 text-gray-400">
                              Last synced:{" "}
                              {new Date(linkedInStatus.lastSyncAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Import profile and sync saved jobs
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {linkedInStatus?.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync("LINKEDIN")}
                          disabled={syncingProvider === "LINKEDIN"}
                        >
                          {syncingProvider === "LINKEDIN" ? "Syncing..." : "Sync"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect("LINKEDIN")}
                          disabled={disconnectMutation.isPending}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleConnect("linkedin")}>Connect LinkedIn</Button>
                    )}
                  </div>
                </div>
              )}

              {/* No integrations configured */}
              {!configuredProviders?.github && !configuredProviders?.linkedin && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-amber-800">
                    No integrations are configured. Contact the administrator to set up OAuth
                    credentials.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Integrations disabled */}
        {!integrationsEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Social Integrations</CardTitle>
              <CardDescription>
                This feature is currently disabled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <h3 className="mb-2 font-semibold text-gray-900">Coming Soon</h3>
                <p className="text-gray-600">
                  Social integrations with GitHub and LinkedIn are in development.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Information</h3>
                  <p className="text-sm text-gray-500">
                    {userData?.user?.name} ({userData?.user?.email})
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
