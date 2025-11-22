# OAuth Setup Guide

How to configure OAuth credentials for integrations.

## LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URL: `http://localhost:3000/api/integrations/linkedin/callback`
4. Copy Client ID and Client Secret
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

**Required scopes:** `r_liteprofile`, `r_emailaddress`

## Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add redirect URL: `http://localhost:3000/api/integrations/google/callback`
7. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

**Required scopes:** `calendar.readonly`, `calendar.events`

## GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/api/integrations/github/callback`
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

**Required scopes:** `read:user`, `repo`

## Production URLs

Update redirect URLs when deploying:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Security Notes

- Never expose client secrets in frontend code
- Use HTTPS in production
- Implement token refresh logic
- Store tokens securely (encrypted, httpOnly cookies)
