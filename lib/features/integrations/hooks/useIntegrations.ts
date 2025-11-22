"use client";

import { useCallback, useState } from "react";
import { INTEGRATIONS, buildAuthorizationUrl, type Integration } from "../utils/oauth";

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback((integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    if (!integration) return;

    // Check if credentials are configured
    if (!integration.config.clientId) {
      alert(`${integration.name} is not configured. See API_SETUP.md for instructions.`);
      return;
    }

    // Redirect to authorization URL
    const authUrl = buildAuthorizationUrl(integration);
    window.location.href = authUrl;
  }, [integrations]);

  const disconnect = useCallback(async (integrationId: string) => {
    setIsLoading(true);

    try {
      // In production, call API to revoke token
      await new Promise((r) => setTimeout(r, 500));

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId ? { ...i, connected: false } : i
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    // In production, fetch connection status from API
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
  }, []);

  return {
    integrations,
    isLoading,
    connect,
    disconnect,
    refresh,
  };
}
