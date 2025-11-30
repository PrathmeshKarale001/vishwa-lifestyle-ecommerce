# 🔐 Supabase OAuth Setup - Use Your Own Google App

After configuring Google OAuth in Google Cloud Console with "Vishwa Lifestyle" as the app name, you need to update Supabase to use YOUR OAuth credentials.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Created OAuth app in Google Cloud Console
- ✅ Set app name to "Vishwa Lifestyle" in OAuth consent screen
- ✅ Created OAuth 2.0 Client ID
- ✅ Added redirect URI: `https://YOUR_SUPABASE_URL/auth/v1/callback`
- ✅ Have your **Client ID** and **Client Secret** ready

---

## 🚀 Step-by-Step Instructions

### Step 1: Get Your Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (the one you created)
5. Click on it to view details
6. Copy:
   - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (click "Show" to reveal it)

---

### Step 2: Update Supabase Authentication

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`vishwa-lifestyle` or your project name)
3. Go to **Authentication** → **Providers** (in left sidebar)
4. Find **Google** in the list of providers
5. Click on **Google** to expand it

---

### Step 3: Configure Google Provider

1. **Enable the provider:**
   - Toggle **Enable Google provider** to ON

2. **Enter your credentials:**
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret

3. **Verify redirect URI:**
   - Make sure the redirect URI in Google Console matches:
     ```
     https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - Your Supabase URL is: `https://tgzfwgkerivaqtptqvyn.supabase.co`
   - So the redirect URI should be: `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`

4. **Save:**
   - Click **Save** at the bottom

---

### Step 4: Verify It Works

1. Go to your website
2. Click "Sign in with Google"
3. You should now see **"Vishwa Lifestyle"** instead of the Supabase project ID!

---

## 🔍 Troubleshooting

### Still seeing Supabase project ID?

**Check 1: Are you using your own OAuth app?**
- Go to Supabase → Authentication → Providers → Google
- Verify that Client ID and Client Secret are YOUR credentials (not Supabase's default)
- If they're empty or different, you're still using Supabase's default app

**Check 2: Is the redirect URI correct?**
- In Google Cloud Console → Credentials → Your OAuth Client
- Verify redirect URI includes: `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`
- Must match exactly (including `https://` and no trailing slash)

**Check 3: Is OAuth consent screen configured?**
- Go to Google Cloud Console → OAuth consent screen
- Verify **App name** is set to "Vishwa Lifestyle"
- Make sure it's **Published** (for production) or has test users (for testing)

**Check 4: Clear browser cache**
- Sometimes browsers cache OAuth settings
- Try incognito/private window
- Or clear cookies for your site

---

## 📝 Quick Checklist

- [ ] Google OAuth app created in Google Cloud Console
- [ ] App name set to "Vishwa Lifestyle" in OAuth consent screen
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI added: `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`
- [ ] Client ID and Secret copied
- [ ] Supabase → Authentication → Providers → Google updated
- [ ] Client ID entered in Supabase
- [ ] Client Secret entered in Supabase
- [ ] Saved in Supabase
- [ ] Tested sign-in - shows "Vishwa Lifestyle"

---

## 🎯 Expected Result

After completing these steps:

**Before:**
- "You're signing back in to"
- "tgzfwgkerivaqtptqvyn.supabase.co"

**After:**
- "You're signing back in to"
- **"Vishwa Lifestyle"** ✅

---

## 💡 Optional: Update Environment Variables

If you want to use the credentials in your code (for NextAuth or other purposes), add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Note:** Supabase handles OAuth internally, so you don't need these for basic Google sign-in. Only add them if you're using NextAuth or other libraries that need direct Google OAuth access.

---

## 🆘 Still Not Working? - MOST COMMON ISSUE

### ⚠️ OAuth Consent Screen Status (90% of issues)

**Check this first:**

1. Go to **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. Look at the **Publishing status** at the top
3. **If it says "Not published":**
   - Scroll down to **Test users** section
   - Click **+ ADD USERS**
   - Add your email: `eodonsocial@gmail.com`
   - Click **Save**
   - Status should now show **"Testing"**

**This is usually the problem!** If the consent screen is "Not published" and has no test users, Google won't use your app name.

### Other Checks:

1. **Double-check the redirect URI:**
   - Must be exactly: `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`
   - No trailing slash
   - Must be `https://` not `http://`

2. **Verify OAuth consent screen:**
   - App name must be "Vishwa Lifestyle"
   - Status must be "Testing" (with test users) or "In production"

3. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for any OAuth errors

4. **Test in incognito:**
   - Sometimes cached OAuth settings cause issues
   - Open incognito window and try again

5. **Wait for propagation:**
   - Google changes can take 5-10 minutes to propagate
   - Try again after a few minutes

---

**Last Updated:** November 2024

