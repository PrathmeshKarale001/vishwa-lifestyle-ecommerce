# ⚡ Quick Fix: OAuth Consent Screen Status

The most common reason "Vishwa Lifestyle" doesn't show is the **OAuth consent screen publishing status**.

---

## 🎯 The Fix (Most Likely Issue)

### Step 1: Check OAuth Consent Screen Status

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: **vishwa-lifestyle**
3. Go to **APIs & Services** → **OAuth consent screen**
4. Look at the top - what does it say?
   - ✅ **"Testing"** or **"In production"** → Good, continue to Step 2
   - ❌ **"Not published"** → This is the problem!

### Step 2: If Status is "Not Published"

**Option A: Set to Testing Mode (Easiest)**

1. On the OAuth consent screen page
2. Scroll down to **Test users** section
3. Click **+ ADD USERS**
4. Add your email: `eodonsocial@gmail.com`
5. Click **Add**
6. Scroll to top
7. Click **SAVE AND CONTINUE** (or just **Save**)
8. Make sure **Publishing status** shows **"Testing"**

**Option B: Publish (For Production)**

1. Complete all required fields in OAuth consent screen
2. Click **PUBLISH APP**
3. Confirm publishing

---

## 🔍 Verify Everything is Connected

### Check 1: OAuth Client is Using Correct Consent Screen

1. Go to **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. In the details, check:
   - **Application type**: Web application
   - **Authorized redirect URIs**: Should include `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`

### Check 2: Supabase Has Your Credentials

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Verify:
   - ✅ Toggle is **ON** (enabled)
   - ✅ **Client ID** field has YOUR Client ID (not empty)
   - ✅ **Client Secret** field has YOUR Client Secret (not empty)

### Check 3: Test in Incognito

1. Open **Incognito/Private window**
2. Go to your website
3. Click "Sign in with Google"
4. Check if it shows "Vishwa Lifestyle"

---

## 🐛 Still Not Working? Check These:

### Issue 1: Multiple OAuth Clients

**Problem:** You might have created multiple OAuth clients, and Supabase is using a different one.

**Fix:**
1. In Google Cloud Console → Credentials
2. List all your OAuth 2.0 Client IDs
3. Check which one is configured in Supabase
4. Make sure THAT client is linked to the "Vishwa Lifestyle" consent screen
5. Or update Supabase to use the correct Client ID

### Issue 2: Wrong Project

**Problem:** OAuth consent screen and OAuth client are in different projects.

**Fix:**
1. Check the project name in top bar of Google Cloud Console
2. Make sure you're in **"vishwa-lifestyle"** project for both:
   - OAuth consent screen
   - OAuth 2.0 Client ID

### Issue 3: Cached OAuth Settings

**Problem:** Browser or Google is caching old OAuth settings.

**Fix:**
1. Clear browser cache and cookies
2. Try incognito window
3. Wait 5-10 minutes (Google changes can take time to propagate)

---

## ✅ Final Verification

After fixing, test:

1. **Open incognito window**
2. Go to your website
3. Click "Sign in with Google"
4. You should see:
   - ✅ "You're signing back in to"
   - ✅ **"Vishwa Lifestyle"** (not the Supabase project ID)

---

## 📝 Quick Checklist

- [ ] OAuth consent screen status is "Testing" or "In production"
- [ ] If Testing, your email is added as test user
- [ ] OAuth 2.0 Client ID is created
- [ ] Redirect URI is correct: `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`
- [ ] Supabase has YOUR Client ID (not empty)
- [ ] Supabase has YOUR Client Secret (not empty)
- [ ] Tested in incognito window
- [ ] Waited 5-10 minutes if just changed

---

**Most Common Fix:** Add your email as a test user and set status to "Testing"!

