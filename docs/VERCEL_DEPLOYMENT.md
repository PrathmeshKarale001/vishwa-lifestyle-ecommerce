# 🚀 Vercel Deployment Guide

Complete guide to deploy Vishwa Lifestyle website to Vercel with all integrations (Sanity, Supabase, Razorpay, etc.)

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with your code
- [ ] Vercel account (free tier works)
- [ ] Sanity project created
- [ ] Supabase project created
- [ ] Razorpay account (test mode for now)
- [ ] Resend account for emails
- [ ] Google OAuth credentials (if using social login)
- [ ] Domain name (optional, Vercel provides free subdomain)

---

## 🎯 Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 1.2 Verify Build Locally

```bash
# Test the production build
npm run build

# If build succeeds, you're ready!
```

---

## 🔧 Step 2: Connect to Vercel

### 2.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Vercel to access your repositories

### 2.2 Import Project

1. Click **"Add New Project"**
2. Select your **GitHub repository** (Vishwa-Lifestyle)
3. Vercel will auto-detect Next.js
4. Click **"Deploy"** (we'll add environment variables next)

---

## 🔐 Step 3: Configure Environment Variables

### 3.1 Access Environment Variables

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable below

### 3.2 Required Environment Variables

Copy and paste these into Vercel's environment variables:

```env
# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
# After adding custom domain, update this to: https://vishwalifestyle.com

# ===========================================
# SUPABASE (Database & Auth)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ===========================================
# SANITY CMS
# ===========================================
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-11-28
SANITY_API_TOKEN=your_sanity_token_here

# ===========================================
# RAZORPAY (Payments)
# ===========================================
# For production, use LIVE keys (not test!)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# ===========================================
# EMAIL SERVICE (Resend)
# ===========================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Vishwa Lifestyle <noreply@vishwalifestyle.com>
ADMIN_EMAIL=admin@vishwalifestyle.com

# ===========================================
# GOOGLE OAUTH (Social Login)
# ===========================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ===========================================
# ADMIN ACCESS
# ===========================================
NEXT_PUBLIC_ADMIN_EMAILS=admin@vishwalifestyle.com,another@vishwalifestyle.com

# ===========================================
# ANALYTICS (Optional)
# ===========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ===========================================
# SENTRY (Error Monitoring - Optional)
# ===========================================
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 3.3 Set Environment for Each Variable

- **Production**: ✅ Check this (for live site)
- **Preview**: ✅ Check this (for preview deployments)
- **Development**: ❌ Uncheck (only for local dev)

**Important**: Make sure to check **Production** and **Preview** for all variables!

---

## 🔄 Step 4: Update Service URLs

After deployment, you'll get a Vercel URL like: `https://vishwa-lifestyle.vercel.app`

### 4.1 Update Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```
4. Add to **Site URL**:
   ```
   https://your-domain.vercel.app
   ```

### 4.2 Update Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **Webhooks**
3. Update webhook URL to:
   ```
   https://your-domain.vercel.app/api/webhook/razorpay
   ```
4. Select events: `payment.captured`, `payment.failed`

### 4.3 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   ```
   https://your-domain.vercel.app/auth/callback
   ```

### 4.4 Update NEXT_PUBLIC_APP_URL

1. Go back to Vercel → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Redeploy (Vercel will auto-redeploy when you save)

---

## 🌐 Step 5: Add Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to **Settings** → **Domains**
2. Enter your domain: `vishwalifestyle.com`
3. Follow Vercel's DNS instructions

### 5.2 Update DNS Records

Add these records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Update Environment Variables

After domain is verified, update:
- `NEXT_PUBLIC_APP_URL` → `https://vishwalifestyle.com`
- Update all service redirect URLs (Supabase, Google OAuth, Razorpay)

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Your Site

1. Visit your Vercel URL
2. Check homepage loads
3. Test product pages
4. Test authentication (sign up/login)
5. Test checkout flow (use test mode first!)

### 6.2 Check Logs

1. Go to **Deployments** tab in Vercel
2. Click on latest deployment
3. Check **Functions** tab for any errors
4. Check **Logs** for runtime errors

### 6.3 Common Issues

**Issue**: Images not loading
- **Fix**: Check Sanity image URLs and `NEXT_PUBLIC_SANITY_PROJECT_ID`

**Issue**: Authentication not working
- **Fix**: Verify Supabase redirect URLs are correct

**Issue**: Payments failing
- **Fix**: Check Razorpay webhook URL and keys (use LIVE keys in production)

**Issue**: Emails not sending
- **Fix**: Verify Resend API key and domain verification

---

## 🔒 Step 7: Production Security Checklist

### 7.1 Enable Production Mode

- [ ] Switch Razorpay to **LIVE mode** (after KYC completion)
- [ ] Use **LIVE API keys** (not test keys)
- [ ] Verify all webhooks are using production URLs

### 7.2 Security Settings

- [ ] Enable **Row Level Security** in Supabase (should already be enabled)
- [ ] Review **CSP headers** in `middleware.ts`
- [ ] Enable **Vercel Analytics** (already included)
- [ ] Set up **Sentry** for error monitoring (optional)

### 7.3 Database Backups

- [ ] Enable **Supabase daily backups** (automatic on paid plans)
- [ ] Test backup restoration process

---

## 📊 Step 8: Post-Deployment Setup

### 8.1 Import Products

After deployment, import your products:

```bash
# Run locally (will connect to production Sanity)
npm run setup:categories
npm run import:products:images
```

### 8.2 Set Up Admin Users

1. Sign up with admin email on your site
2. Or run SQL in Supabase to add admin:

```sql
INSERT INTO admin_users (email, created_at)
VALUES ('admin@vishwalifestyle.com', NOW())
ON CONFLICT (email) DO NOTHING;
```

### 8.3 Test Everything

- [ ] User registration/login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Payment processing (test mode first!)
- [ ] Order confirmation emails
- [ ] Admin dashboard access

---

## 🔄 Step 9: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Push to `main` branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull requests** → Preview deployment with unique URL

### 9.1 Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Sends notification
```

---

## 📈 Step 10: Monitoring & Analytics

### 10.1 Vercel Analytics

- Already enabled via `@vercel/analytics`
- View in Vercel dashboard → **Analytics**

### 10.2 Google Analytics

- Already configured
- View in Google Analytics dashboard

### 10.3 Error Monitoring

- Sentry is configured (if you set up Sentry)
- View errors in Sentry dashboard

---

## 🆘 Troubleshooting

### Build Fails

**Error**: "Missing environment variable"
- **Fix**: Add missing variable in Vercel → Settings → Environment Variables

**Error**: "Module not found"
- **Fix**: Check `package.json` dependencies are committed

### Runtime Errors

**Error**: "Supabase not configured"
- **Fix**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Error**: "Sanity client error"
- **Fix**: Check `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_TOKEN`

### Performance Issues

- Check Vercel **Analytics** for slow pages
- Optimize images (already using Next.js Image)
- Enable **Vercel Edge Network** (automatic)

---

## 📝 Quick Reference

### Vercel Dashboard
- **URL**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Deployments**: View all deployments
- **Settings**: Configure environment variables
- **Analytics**: View site performance

### Important URLs to Update
1. Supabase redirect URLs
2. Razorpay webhook URL
3. Google OAuth redirect URI
4. `NEXT_PUBLIC_APP_URL` environment variable

---

## 🎉 You're Live!

Your website is now deployed and accessible worldwide!

**Next Steps**:
1. Test all functionality
2. Import products to Sanity
3. Complete Razorpay KYC for live payments
4. Monitor analytics and errors
5. Share your website! 🚀

---

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Sanity Docs**: [sanity.io/docs](https://sanity.io/docs)

---

**Last Updated**: December 2024

