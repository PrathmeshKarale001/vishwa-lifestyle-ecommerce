# ✅ Deployment Checklist

Use this checklist to ensure everything is ready for production deployment.

---

## 📦 Pre-Deployment

### Code Preparation
- [ ] All code is committed to GitHub
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] All tests pass (if any)

### Environment Setup
- [ ] Created `.env.example` file (✅ Done)
- [ ] Documented all environment variables
- [ ] Verified all required services are set up

---

## 🔧 Service Configuration

### Sanity CMS
- [ ] Sanity project created
- [ ] Production dataset configured
- [ ] API token generated with Editor permissions
- [ ] Categories created (`npm run setup:categories`)
- [ ] Products imported (`npm run import:products:images`)
- [ ] Images uploaded and working

### Supabase
- [ ] Supabase project created
- [ ] Database tables created (run SQL scripts)
- [ ] Row Level Security (RLS) enabled
- [ ] Auth providers configured (Email, Google OAuth)
- [ ] Redirect URLs configured for localhost
- [ ] Service role key generated

### Razorpay
- [ ] Razorpay account created
- [ ] KYC completed (for live mode)
- [ ] API keys generated
- [ ] Webhook configured (for localhost first)
- [ ] Test payments working

### Resend (Email)
- [ ] Resend account created
- [ ] API key generated
- [ ] Domain verified (or using default)
- [ ] Test emails sending successfully

### Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Redirect URIs configured

---

## 🚀 Vercel Deployment

### Initial Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported to Vercel
- [ ] Build settings verified (auto-detected Next.js)

### Environment Variables
- [ ] All environment variables added to Vercel
- [ ] Variables set for Production environment
- [ ] Variables set for Preview environment
- [ ] `NEXT_PUBLIC_APP_URL` set to Vercel URL initially

### First Deployment
- [ ] Initial deployment successful
- [ ] Build logs checked (no errors)
- [ ] Site accessible at Vercel URL

---

## 🔄 Post-Deployment Configuration

### Update Service URLs

#### Supabase
- [ ] Updated redirect URLs with Vercel URL
- [ ] Updated site URL in Supabase
- [ ] Tested authentication flow

#### Razorpay
- [ ] Updated webhook URL to Vercel URL
- [ ] Tested webhook (use Razorpay test mode)
- [ ] Verified payment flow

#### Google OAuth
- [ ] Updated authorized redirect URIs
- [ ] Tested Google sign-in

#### Environment Variables
- [ ] Updated `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Redeployed after URL update

---

## 🌐 Custom Domain (Optional)

### Domain Setup
- [ ] Domain purchased/configured
- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] Domain verified in Vercel
- [ ] SSL certificate active (automatic)

### Update URLs After Domain
- [ ] Updated `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Updated Supabase redirect URLs
- [ ] Updated Razorpay webhook URL
- [ ] Updated Google OAuth redirect URIs
- [ ] Redeployed with new URLs

---

## ✅ Functionality Testing

### Core Features
- [ ] Homepage loads correctly
- [ ] Products display from Sanity
- [ ] Product detail pages work
- [ ] Images load properly
- [ ] Search functionality works
- [ ] Category filtering works

### Authentication
- [ ] User registration works
- [ ] Email login works
- [ ] Google OAuth works
- [ ] Password reset works
- [ ] User profile updates work

### Shopping
- [ ] Add to cart works
- [ ] Cart persists across sessions
- [ ] Checkout flow works
- [ ] Address management works
- [ ] Payment processing works (test mode)
- [ ] Order confirmation emails sent

### Admin
- [ ] Admin dashboard accessible
- [ ] Only admin emails can access
- [ ] Orders visible in admin
- [ ] Analytics working

---

## 🔒 Security & Production

### Security Checks
- [ ] Using LIVE Razorpay keys (not test)
- [ ] All environment variables secure
- [ ] No sensitive data in code
- [ ] RLS policies active in Supabase
- [ ] CSP headers configured

### Performance
- [ ] Images optimized
- [ ] Build size reasonable
- [ ] Page load times acceptable
- [ ] Analytics tracking working

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Google Analytics configured
- [ ] Sentry error monitoring (optional)
- [ ] Error logs accessible

---

## 📊 Final Steps

### Content
- [ ] All products imported
- [ ] Product images uploaded
- [ ] Categories configured
- [ ] Homepage content updated

### Testing
- [ ] End-to-end test of purchase flow
- [ ] Test payment in test mode
- [ ] Verify email notifications
- [ ] Test on mobile devices
- [ ] Test on different browsers

### Documentation
- [ ] Deployment guide created (✅ Done)
- [ ] Environment variables documented
- [ ] Admin access documented
- [ ] Client handover prepared

---

## 🎉 Go Live!

- [ ] Switch Razorpay to LIVE mode (after KYC)
- [ ] Update to LIVE Razorpay keys
- [ ] Final production test
- [ ] Announce launch! 🚀

---

**Last Updated**: December 2024

