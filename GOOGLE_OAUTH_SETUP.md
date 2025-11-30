# 🔐 Google OAuth Setup - Change App Name to "Vishwa Lifestyle"

The app name shown in Google sign-in is controlled by your Google Cloud Console OAuth app settings.

---

## 📝 Steps to Change App Name

### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one if you don't have one)

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. You'll see the current configuration

### Step 3: Update App Information

**For Testing (Development):**
1. Select **User Type**: External (for public use)
2. Click **Create** or **Edit**
3. Fill in:
   - **App name**: `Vishwa Lifestyle`
   - **User support email**: Your email (e.g., `eodonsocial@gmail.com`)
   - **App logo**: Upload your logo (optional)
   - **App domain**: Your website domain
   - **Developer contact information**: Your email

4. Click **Save and Continue**

**For Production:**
1. Complete all required fields
2. Add **Scopes** (if needed):
   - `email`
   - `profile`
   - `openid`
3. Add **Test users** (for testing before verification)
4. Submit for **Verification** (required for production)

### Step 4: Update OAuth Client

1. Go to **APIs & Services** → **Credentials**
2. Find your **OAuth 2.0 Client ID** (the one you're using)
3. Click **Edit** (pencil icon)
4. Update:
   - **Name**: `Vishwa Lifestyle` (optional, for your reference)
   - **Authorized redirect URIs**: Make sure it includes:
     ```
     https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback
     ```
5. Click **Save**

---

## ⚠️ Important Notes

### The App Name Shows Up When:
- User first signs in (consent screen)
- User sees "You're signing back in to [App Name]"

### If You See Supabase Project ID:
- This means Google is using the default name from Supabase
- You need to configure your own OAuth app in Google Cloud Console
- Then update Supabase to use YOUR OAuth credentials

---

## 🔄 Update Supabase to Use Your OAuth App

### Option 1: Use Your Own Google OAuth App (Recommended) ✅ DO THIS

1. **Create OAuth App in Google Cloud Console:**
   - ✅ Already done (you mentioned you set everything)
   - Get **Client ID** and **Client Secret** from Google Cloud Console

2. **Update Supabase (THIS IS THE KEY STEP):**
   - Go to **Supabase Dashboard** → **Authentication** → **Providers**
   - Click on **Google** provider
   - **Enable** the provider (toggle ON)
   - Enter your **Client ID** (from Google Cloud Console)
   - Enter your **Client Secret** (from Google Cloud Console)
   - **Important:** Make sure redirect URI in Google Console is:
     ```
     https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback
     ```
   - Click **Save**

3. **Verify Redirect URI in Google Console:**
   - Go to Google Cloud Console → Credentials → Your OAuth Client
   - Under "Authorized redirect URIs", make sure you have:
     ```
     https://tgzfwgkerivaqtptqvyn.supabase.co/auth/v1/callback
     ```
   - If not, add it and save

4. **Test:**
   - Go to your website
   - Click "Sign in with Google"
   - You should now see **"Vishwa Lifestyle"** instead of Supabase project ID!

**Note:** Environment variables are optional - Supabase handles OAuth internally. Only add them if you need them for other purposes.

### Option 2: Keep Using Supabase OAuth (Easier but Less Control)

If you want to keep using Supabase's OAuth app:
- The name will always show the Supabase project ID
- You can't change it to "Vishwa Lifestyle"
- This is a limitation of using Supabase's shared OAuth app

**Recommendation:** Create your own OAuth app for full control.

---

## ✅ Quick Checklist

- [ ] Created Google Cloud Console project
- [ ] Configured OAuth consent screen with "Vishwa Lifestyle" as app name
- [ ] Created OAuth 2.0 Client ID
- [ ] Added redirect URI: `https://YOUR_SUPABASE_URL/auth/v1/callback`
- [ ] Updated Supabase with your Client ID and Secret
- [ ] Added credentials to `.env.local`
- [ ] Tested sign-in - should show "Vishwa Lifestyle"

---

## 🎯 Expected Result

After setup, when users sign in with Google, they should see:
- **"You're signing back in to"**
- **"Vishwa Lifestyle"** (instead of the Supabase project ID)

---

## 🆘 Troubleshooting

### Still seeing Supabase project ID?
- Make sure you're using YOUR OAuth credentials in Supabase
- Check that the OAuth consent screen is configured correctly
- Verify the app name in Google Cloud Console

### OAuth not working?
- Check redirect URI matches exactly
- Verify Client ID and Secret are correct
- Make sure OAuth consent screen is published (for production)

---

**Last Updated:** November 2024

