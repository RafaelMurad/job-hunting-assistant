/**
 * Integration Hub Feature
 *
 * OAuth integrations with third-party services.
 *
 * @see docs/features/integrations/README.md
 */

export { IntegrationHub } from "./components/IntegrationHub";
export { IntegrationCard } from "./components/IntegrationCard";
export { useIntegrations } from "./hooks/useIntegrations";
export type { Integration, OAuthConfig } from "./utils/oauth";
