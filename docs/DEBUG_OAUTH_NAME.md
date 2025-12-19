# 🔍 Debug: Why "Vishwa Lifestyle" Not Showing

If you've configured everything but still see the Supabase project ID, check these:

---

## ✅ Checklist - Verify Each Step

### 1. OAuth Consent Screen Status

**Check in Google Cloud Console:**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Check the **Publishing status** at the top
3. It should be either:
   - **Testing** (with test users added)
   - **In production** (Published)

**If it says "Not published":**
- Add test users (your email: `eodonsocial@gmail.com`)
- Or publish it (requires verification for production)

**Action:** Make sure your email is added as a test user if in Testing mode.

---

### 2. OAuth Client is Linked to Correct Consent Screen

**Check in Google Cloud Console:**
1. Go to **APIs & Services** → **Credentials**
2. Click on your **OAuth 2.0 Client ID**
3. Check **OAuth 2.0 Client ID** section
4. Verify it shows the correct project and consent screen

**Common Issue:** If you have multiple OAuth clients, make sure you're using the one linked to the "Vishwa Lifestyle" consent screen.

---

### 3. Redirect URI Must Match Exactly

**In Google Cloud Console → Credentials → Your OAuth Client:**

The redirect URI must be **exactly**:
```
https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback
```

**Check:**
- ✅ Starts with `https://` (not `http://`)
- ✅ No trailing slash
- ✅ Exact domain: `tgzfwgkerivaqtptqvyn.supabase.co`
- ✅ Exact path: `/auth/v1/callback`

---

### 4. Supabase is Using YOUR Credentials

**Verify in Supabase:**
1. Go to **Authentication** → **Providers** → **Google**
2. Check the **Client ID** field
3. It should show YOUR Client ID (from Google Cloud Console)
4. It should NOT be empty
5. It should NOT be a Supabase default ID

**Test:** If you clear the Client ID and save, then re-enter it, does it save correctly?

---

### 5. Clear Browser Cache & Cookies

**Try:**
1. Open an **Incognito/Private window**
2. Go to your website
3. Try signing in with Google
4. Does it show "Vishwa Lifestyle" now?

**If yes:** It's a caching issue. Clear cookies for your site.

---

### 6. Check OAuth Consent Screen Project

**Verify:**
1. In Google Cloud Console, check the project name in the top bar
2. Make sure you're in the **same project** for:
   - OAuth consent screen
   - OAuth 2.0 Client ID
   - Both should be in "vishwa-lifestyle" project

---

### 7. Wait for Propagation

**Google changes can take time:**
- OAuth consent screen changes: Usually instant, but can take 5-10 minutes
- Try waiting a few minutes and test again

---

## 🔧 Quick Debug Steps

### Step 1: Verify OAuth Client Configuration

Run this in browser console on your site:
```javascript
// Check what OAuth client is being used
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### Step 2: Check Supabase Provider Settings

In Supabase Dashboard:
1. Go to **Authentication** → **Providers** → **Google**
2. Take a screenshot or note:
   - Is it enabled? (toggle should be ON)
   - What Client ID is shown? (should be YOURS, not empty)
   - Is there any error message?

### Step 3: Test OAuth Flow

1. Go to your website
2. Open browser DevTools (F12) → **Network** tab
3. Click "Sign in with Google"
4. Look for the OAuth request
5. Check the `client_id` parameter in the URL
6. Does it match YOUR Client ID from Google Console?

---

## 🎯 Most Common Issues

### Issue 1: OAuth Consent Screen Not Published/No Test Users

**Symptom:** Still shows Supabase project ID

**Fix:**
1. Go to **OAuth consent screen**
2. If status is "Testing":
   - Add your email (`eodonsocial@gmail.com`) to **Test users**
   - Save
3. If status is "Not published":
   - Either add test users and set to "Testing"
   - Or publish it (requires verification)

### Issue 2: Wrong OAuth Client Being Used

**Symptom:** Multiple OAuth clients, using wrong one

**Fix:**
1. Check which Client ID is in Supabase
2. Verify that Client ID is linked to the "Vishwa Lifestyle" consent screen
3. If not, either:
   - Use the correct Client ID
   - Or update the consent screen for the Client ID you're using

### Issue 3: Redirect URI Mismatch

**Symptom:** OAuth works but shows wrong name

**Fix:**
1. In Google Console → Credentials → Your OAuth Client
2. Check "Authorized redirect URIs"
3. Must have exactly: `https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback`
4. No typos, no extra characters

---

## 🧪 Test Script

Run this in browser console to debug:

```javascript
// Check current OAuth setup
const checkOAuth = async () => {
  const { supabase } = await import('/lib/supabase');
  
  // Try to get OAuth URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
    },
  });
  
  if (data?.url) {
    console.log('OAuth URL:', data.url);
    // Check the client_id in the URL
    const urlParams = new URL(data.url);
    const clientId = urlParams.searchParams.get('client_id');
    console.log('Client ID being used:', clientId);
  }
};

checkOAuth();
```

---

## 📞 Still Not Working?

**Share these details:**

1. **OAuth Consent Screen Status:**
   - Is it "Testing", "In production", or "Not published"?
   - Are test users added?

2. **Supabase Google Provider:**
   - Is it enabled?
   - What Client ID is shown? (first few characters)

3. **Google OAuth Client:**
   - How many OAuth clients do you have?
   - Which one is configured in Supabase?

4. **Test Result:**
   - What exactly shows in the Google sign-in screen?
   - Does it still say "tgzfwgkerivaqtptqvyn.supabase.co"?

---

**Most Likely Issue:** OAuth consent screen needs to be in "Testing" mode with test users, or published.

