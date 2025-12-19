# ⚡ Quick Deploy to Vercel

Fast-track deployment guide. For detailed instructions, see `VERCEL_DEPLOYMENT.md`.

---

## 🚀 5-Minute Deploy

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Select your repository
5. Click **"Deploy"**

### 3. Add Environment Variables
In Vercel → **Settings** → **Environment Variables**, add:

**Required (Minimum)**:
```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=Vishwa Lifestyle <noreply@vishwalifestyle.com>
ADMIN_EMAIL=admin@vishwalifestyle.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@vishwalifestyle.com
```

**Check both**: Production ✅ and Preview ✅

### 4. Update Service URLs
After first deployment, update:

1. **Supabase**: Add `https://your-project.vercel.app/auth/callback` to redirect URLs
2. **Razorpay**: Update webhook to `https://your-project.vercel.app/api/webhook/razorpay`
3. **Google OAuth**: Add redirect URI `https://your-project.vercel.app/auth/callback`

### 5. Redeploy
Vercel will auto-redeploy when you save environment variables.

---

## ✅ Done!

Your site is live at: `https://your-project.vercel.app`

---

## 📋 Full Checklist

See `DEPLOYMENT_CHECKLIST.md` for complete pre and post-deployment checklist.

---

## 📚 Need More Details?

- **Full Guide**: `VERCEL_DEPLOYMENT.md`
- **Environment Variables**: `env.example`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`

---

**That's it!** 🎉

