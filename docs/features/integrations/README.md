# Integration Hub (OAuth)

Third-party OAuth integrations.

## What You'll Learn

- **OAuth 2.0**: Authorization Code Flow
- **CSRF Protection**: State parameter usage
- **Token Management**: Secure storage
- **API Integration**: Working with external APIs

## OAuth 2.0 Flow

```
┌────────┐     1. Authorize     ┌───────────┐
│  User  │─────────────────────>│  Provider │
└────────┘                      └───────────┘
    │                                 │
    │                    2. Redirect with code
    │<────────────────────────────────┘
    │
    │         3. Exchange code          ┌────────┐
    └──────────────────────────────────>│ Server │
                                        └────────┘
                                             │
              4. Return access token         │
    <────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `utils/oauth.ts` | OAuth configuration and helpers |
| `hooks/useIntegrations.ts` | Integration state management |
| `components/IntegrationHub.tsx` | Main UI |
| `components/IntegrationCard.tsx` | Individual integration |

## Quick Start

```tsx
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { IntegrationHub } from "@/lib/features/integrations";

function Page() {
  const isEnabled = useFeatureFlag("integrations");
  if (!isEnabled) return null;
  return <IntegrationHub />;
}
```

## See Also

- [API_SETUP.md](./API_SETUP.md) - How to get OAuth credentials
- [OAuth 2.0](https://oauth.net/2/)
- [RFC 6749](https://tools.ietf.org/html/rfc6749)
