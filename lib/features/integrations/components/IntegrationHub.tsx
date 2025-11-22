"use client";

import { useIntegrations } from "../hooks/useIntegrations";
import { IntegrationCard } from "./IntegrationCard";

export function IntegrationHub() {
  const { integrations, isLoading, connect, disconnect } = useIntegrations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nordic-neutral-900">
          Integrations
        </h1>
        <p className="mt-1 text-nordic-neutral-600">
          Connect your accounts to enhance your job search
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => connect(integration.id)}
            onDisconnect={() => disconnect(integration.id)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Setup Instructions */}
      <div className="rounded-lg border border-nordic-neutral-200 bg-white p-4">
        <h2 className="font-semibold text-nordic-neutral-900">
          Setup Required
        </h2>
        <p className="mt-1 text-sm text-nordic-neutral-600">
          To enable integrations, you need to configure OAuth credentials.
          See <code className="rounded bg-nordic-neutral-100 px-1">docs/features/integrations/API_SETUP.md</code> for instructions.
        </p>
      </div>
    </div>
  );
}
