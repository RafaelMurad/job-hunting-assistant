# OAuth Setup for Vercel Deployment

This guide walks through configuring GitHub, Google, and LinkedIn OAuth for your Vercel deployment.

**Your Vercel URL:** `https://job-hunting-assistant.vercel.app`

## Step 1: Update GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "OAuth Apps" → Find your app
3. Update "Authorization callback URL":
   - **From:** `http://localhost:3000/api/auth/callback/github`
   - **To:** `https://job-hunting-assistant.vercel.app/api/auth/callback/github`

4. **Important (GitHub limitation):** GitHub OAuth Apps only support **one** callback URL per app.

   Recommended options:
   - **Best:** Create **separate OAuth Apps** for local dev and production.
   - **OK for quick testing:** Temporarily switch the callback URL when testing prod, then switch it back for local dev.

After updating, your callback URL should be:

```
https://job-hunting-assistant.vercel.app/api/auth/callback/github
```

Your credentials live in your environment variables:

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`

---

## Step 2: Update Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click it to edit
4. Update "Authorized redirect URIs":
   - Add: `https://job-hunting-assistant.vercel.app/api/auth/callback/google`
   - Keep existing: `http://localhost:3000/api/auth/callback/google`

Final URIs should be:

```
http://localhost:3000/api/auth/callback/google
https://job-hunting-assistant.vercel.app/api/auth/callback/google
```

Your credentials live in your environment variables:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

---

## Step 3: Update LinkedIn OAuth

1. Go to: https://www.linkedin.com/developers/apps
2. Find your app
3. Update "Authorized redirect URLs":
   - Add: `https://job-hunting-assistant.vercel.app/api/auth/callback/linkedin`
   - Keep existing: `http://localhost:3000/api/auth/callback/linkedin`

Final URIs should be:

```
http://localhost:3000/api/auth/callback/linkedin
https://job-hunting-assistant.vercel.app/api/auth/callback/linkedin
```

Your current credentials (check `.env` for):

- `AUTH_LINKEDIN_ID`
- `AUTH_LINKEDIN_SECRET`

---

## Step 4: Set NEXTAUTH_URL in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your `job-hunting-assistant` project
3. Go to **Settings** → **Environment Variables**
4. Add new environment variable:
   - **Name:** `NEXTAUTH_URL`
   - **Value:** `https://job-hunting-assistant.vercel.app`
   - **Environments:** Production, Preview, Development

5. Redeploy to apply: `git push` or redeploy from Vercel dashboard

---

## Step 5: Verify Environment Variables in Vercel

Make sure these are set in Vercel (same values as your `.env`):

- `AUTH_SECRET` ✓
- `AUTH_GITHUB_ID` ✓
- `AUTH_GITHUB_SECRET` ✓
- `AUTH_GOOGLE_ID` ✓
- `AUTH_GOOGLE_SECRET` ✓
- `AUTH_LINKEDIN_ID` ✓
- `AUTH_LINKEDIN_SECRET` ✓
- `DATABASE_URL` ✓
- `NEXTAUTH_URL` (new)

Tip: Keep `AUTH_SECRET` stable across deploys. If it changes, existing sessions become invalid.

---

## Testing

1. **Local dev:** `npm run dev` → http://localhost:3000/login (should work)
2. **Vercel production:** https://job-hunting-assistant.vercel.app/login
3. Click each OAuth button - you should be redirected to provider login, then back to your app

---

## Troubleshooting

### "Invalid redirect_uri"

- ✓ Check OAuth provider settings match exactly
- ✓ No trailing slashes
- ✓ Use `https://` on production

### "Invalid OAuth state"

- ✓ Set `NEXTAUTH_URL` in Vercel environment
- ✓ Redeploy after changing environment variables
- ✓ Wait 1-2 minutes for Vercel to fully deploy

### Stuck on /login after successful sign-in (production)

If `/api/auth/session` returns `200` but navigating to `/dashboard`/`/profile` redirects back to `/login`, the route-protection proxy may not be reading the secure session cookie.

Checklist:

- ✓ Confirm `AUTH_SECRET` and `NEXTAUTH_URL` are set correctly in Vercel (Production)
- ✓ Confirm you are using the correct HTTPS URL in `NEXTAUTH_URL`
- ✓ Deploy the latest `proxy.ts` changes (the proxy forces secure-cookie parsing in production)

### Local dev broken after changes

- ✓ `npm run dev` still works with `http://localhost:3000`
- ✓ OAuth providers support multiple callback URLs
- ✓ Make sure you added localhost URLs back after updating

---

## Code Changes Made

✅ Added `trustHost: true` to `lib/auth.ts` - allows NextAuth to work behind proxy (Vercel)

This ensures:

- NextAuth uses `X-Forwarded-Proto` header to detect HTTPS
- Works with Vercel's reverse proxy setup
- Supports preview deployments on `*.vercel.app`
