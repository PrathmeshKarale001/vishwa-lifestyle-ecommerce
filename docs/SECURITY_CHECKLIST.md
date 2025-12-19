# 🔒 Security Checklist

This document tracks security measures implemented for the Vishwa Lifestyle website.

## ✅ Completed Security Measures

### 1. Admin Access Control
- ✅ **Status:** Implemented
- ✅ **Location:** `app/admin/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/orders/[id]/page.tsx`
- ✅ **Method:** Email-based access control via `NEXT_PUBLIC_ADMIN_EMAILS` environment variable
- ✅ **Behavior:** 
  - If admin emails are configured, only those emails can access admin routes
  - Non-admin users are redirected to homepage with error message
  - Console warning shown if admin emails not configured (development mode)

**To Enable:**
```bash
# Add to .env.local
NEXT_PUBLIC_ADMIN_EMAILS=admin@vishwalifestyle.com,owner@vishwalifestyle.com
```

### 2. Content Security Policy (CSP)
- ✅ **Status:** Implemented and tightened
- ✅ **Location:** `middleware.ts`
- ✅ **Features:**
  - Restricts script sources to self and trusted domains (Razorpay, Google Analytics)
  - Allows images only from trusted sources (Sanity, Supabase, Unsplash)
  - Blocks inline scripts except where necessary (Next.js, Razorpay)
  - Prevents object embedding
  - Restricts form submissions to self and Razorpay
  - Includes Resend API for email notifications

**CSP Directives:**
- `default-src 'self'` - Default to same origin
- `script-src` - Allows Next.js, Razorpay, Google Analytics
- `style-src` - Allows inline styles (required for Next.js) and Google Fonts
- `img-src` - Only trusted image sources (no http:, only https)
- `connect-src` - API connections to Razorpay, Supabase, Sanity, Resend
- `frame-src` - Only Razorpay payment iframes
- `object-src 'none'` - Blocks plugins
- `form-action` - Restricts form submissions

### 3. Security Headers
- ✅ **Status:** Implemented
- ✅ **Location:** `middleware.ts`
- ✅ **Headers Set:**
  - `Strict-Transport-Security` - Forces HTTPS
  - `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
  - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
  - `Referrer-Policy: origin-when-cross-origin` - Controls referrer information
  - `X-XSS-Protection: 1; mode=block` - XSS protection
  - `X-DNS-Prefetch-Control: on` - Performance optimization

### 4. Rate Limiting
- ✅ **Status:** Implemented
- ✅ **Location:** `middleware.ts`
- ✅ **Configuration:**
  - 100 requests per minute per IP for API routes
  - In-memory rate limiting (for production, consider Redis)
  - Automatic cleanup of old entries

### 5. Permissions Policy
- ✅ **Status:** Implemented
- ✅ **Location:** `middleware.ts`
- ✅ **Restrictions:**
  - Camera: Disabled
  - Microphone: Disabled
  - Geolocation: Disabled
  - Payment: Only allowed for Razorpay

### 6. Environment Variables Security
- ✅ **Status:** Protected
- ✅ **Measures:**
  - All sensitive keys in `.env.local` (not committed to Git)
  - `.env.local` in `.gitignore`
  - No hardcoded secrets in code

### 7. Authentication Security
- ✅ **Status:** Implemented via Supabase
- ✅ **Features:**
  - Secure password hashing (handled by Supabase)
  - OAuth with Google (secure token exchange)
  - Session management via Supabase Auth
  - CSRF protection via Supabase

### 8. API Security
- ✅ **Status:** Implemented
- ✅ **Measures:**
  - Rate limiting on API routes
  - Input validation on all API endpoints
  - Razorpay webhook signature verification
  - Error messages don't expose sensitive information

---

## ⚠️ Security Considerations for Production

### 1. Admin Access Control ✅ IMPLEMENTED
**Current:** Database-based RBAC with email fallback
**Status:** ✅ Production-ready implementation available

**What's Implemented:**
- ✅ `admin_users` table with roles (admin, super_admin, moderator)
- ✅ Permission-based access control
- ✅ Audit logging for admin actions
- ✅ Helper functions in `lib/admin.ts`
- ✅ Updated admin pages to use database checks

**Files Created:**
- `supabase/rls-policies.sql` - Complete RLS setup with admin_users table
- `lib/admin.ts` - Admin access control functions
- `REDIS_SETUP.md` - Redis rate limiting guide

**To Enable:**
1. Run `supabase/rls-policies.sql` in Supabase SQL Editor
2. Create first admin user (see SQL file comments)
3. Admin pages will automatically use database-based checks

### 2. Rate Limiting ✅ GUIDE CREATED
**Current:** In-memory (resets on server restart)
**For Production:** ✅ Complete Redis setup guide available

**What's Available:**
- ✅ `REDIS_SETUP.md` - Complete guide for Redis integration
- ✅ Three options: Upstash (recommended), Redis Cloud, Vercel KV
- ✅ Code examples for all options
- ✅ Different rate limits for admin, API, and general routes

**To Implement:**
1. Choose Redis provider (Upstash recommended for Vercel)
2. Follow `REDIS_SETUP.md` guide
3. Update `middleware.ts` with Redis rate limiter

### 3. Content Security Policy
**Current:** Uses `'unsafe-inline'` and `'unsafe-eval'` (required for Next.js)
**For Production:**
- Consider using nonces for inline scripts
- Further restrict script sources if possible
- Monitor CSP violations in production

### 4. API Keys
**Current:** Stored in environment variables
**For Production:**
- Use secret management service (Vercel Secrets, AWS Secrets Manager)
- Rotate keys regularly (every 3-6 months)
- Use different keys for development and production
- Never log API keys

### 5. Database Security ✅ COMPREHENSIVE RLS POLICIES CREATED
**Current:** Basic RLS enabled
**For Production:** ✅ Production-grade RLS policies available

**What's Implemented:**
- ✅ Complete RLS policies in `supabase/rls-policies.sql`
- ✅ Policies for all tables (profiles, orders, addresses, wishlists, reviews)
- ✅ Admin access policies
- ✅ Audit logging table and functions
- ✅ Helper functions for admin checks

**To Enable:**
1. Run `supabase/rls-policies.sql` in Supabase SQL Editor
2. This will:
   - Create `admin_users` table
   - Create `audit_logs` table
   - Set up comprehensive RLS policies
   - Add helper functions
3. Create your first admin user (see SQL file)

### 6. Payment Security
**Current:** Razorpay integration
**For Production:**
- Always verify webhook signatures
- Use Razorpay's test mode for development
- Switch to live keys only in production
- Monitor payment webhooks for suspicious activity
- Implement idempotency for payment processing

### 7. Email Security
**Current:** Resend API
**For Production:**
- Verify domain in Resend (prevents spoofing)
- Set up SPF/DKIM records
- Monitor email delivery rates
- Implement email rate limiting

---

## 🧪 Security Testing Checklist

Before going to production, test:

- [ ] **Admin Access Control**
  - [ ] Try accessing `/admin` without login → Should redirect to login
  - [ ] Try accessing `/admin` with non-admin email → Should redirect to homepage
  - [ ] Access `/admin` with admin email → Should work

- [ ] **CSP Violations**
  - [ ] Open browser console
  - [ ] Navigate through all pages
  - [ ] Check for CSP violation errors
  - [ ] Fix any violations found

- [ ] **Rate Limiting**
  - [ ] Make 100+ rapid requests to `/api/contact`
  - [ ] Should receive 429 error after limit
  - [ ] Wait 1 minute, should work again

- [ ] **Payment Security**
  - [ ] Test with Razorpay test mode
  - [ ] Verify webhook signature validation works
  - [ ] Test failed payment handling
  - [ ] Verify order status updates correctly

- [ ] **Input Validation**
  - [ ] Test contact form with malicious input
  - [ ] Test newsletter with invalid emails
  - [ ] Test checkout with invalid data
  - [ ] All should reject invalid input gracefully

- [ ] **HTTPS**
  - [ ] Verify site only accessible via HTTPS in production
  - [ ] Check SSL certificate is valid
  - [ ] Test HSTS header is working

---

## 📋 Production Security Checklist

Before deploying:

- [ ] Set `NEXT_PUBLIC_ADMIN_EMAILS` in production environment
- [ ] Enable Supabase RLS on all tables
- [ ] Review and test CSP in production
- [ ] Set up monitoring for security events
- [ ] Configure production rate limiting (Redis)
- [ ] Verify all API keys are production keys
- [ ] Enable Supabase audit logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Document incident response procedure

---

## 🆘 Security Incident Response

If you discover a security issue:

1. **Immediate Actions:**
   - Rotate affected API keys
   - Review access logs
   - Check for unauthorized access

2. **Assessment:**
   - Determine scope of issue
   - Check if data was compromised
   - Review affected systems

3. **Remediation:**
   - Fix the vulnerability
   - Update security measures
   - Notify affected users if necessary

4. **Prevention:**
   - Update security checklist
   - Review similar vulnerabilities
   - Improve monitoring

---

**Last Updated:** November 2024
**Status:** Security measures implemented, ready for production testing

