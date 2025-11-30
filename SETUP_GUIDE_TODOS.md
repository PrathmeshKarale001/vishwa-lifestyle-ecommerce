# 🚀 Setup Guide - Remaining TODOs

**Date:** November 2024

---

## ✅ Completed Implementations

### 1. ✅ Skeleton Loaders
**Status:** Complete

**Added To:**
- ✅ Account page (`AccountPageSkeleton`)
- ✅ Addresses page (`AddressesPageSkeleton`)
- ✅ Orders page (`OrdersPageSkeleton`)
- ✅ Order detail page (`OrderDetailSkeleton`)

**Files:**
- `components/AccountSkeleton.tsx` - All account page skeletons
- All account pages now use skeletons instead of spinners

---

### 2. ✅ Form Validation Feedback
**Status:** Partially Complete

**Implemented:**
- ✅ `onBlur` mode for real-time validation
- ✅ Visual indicators (checkmarks for valid, X for invalid)
- ✅ Better error messages with icons
- ✅ Address form has improved validation feedback

**Files:**
- `components/FormField.tsx` - Reusable form field component with validation indicators
- `app/account/addresses/page.tsx` - Enhanced with visual feedback

**Remaining:**
- Apply to other forms (contact, register, login, checkout)

---

### 3. ✅ CSRF Protection
**Status:** Infrastructure Ready

**Created:**
- ✅ `lib/csrf.ts` - CSRF utilities
- ✅ `app/api/csrf/route.ts` - Token generation endpoint
- ✅ `hooks/useCsrfToken.tsx` - Client-side hook (already existed)

**Next Steps:**
- Add CSRF tokens to all forms
- Verify tokens in API routes

---

### 4. ✅ Sentry Integration
**Status:** Configuration Complete

**Created:**
- ✅ `sentry.client.config.ts` - Client-side Sentry config
- ✅ `sentry.server.config.ts` - Server-side Sentry config
- ✅ `sentry.edge.config.ts` - Edge runtime Sentry config
- ✅ `lib/sentry.ts` - Sentry utilities
- ✅ Integrated into `app/error.tsx`
- ✅ Integrated into `components/ErrorBoundary.tsx`

**Setup Required:**
1. Get Sentry DSN from [sentry.io](https://sentry.io)
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```
3. Run Sentry wizard (optional):
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

---

## 📋 Remaining Work

### High Priority

#### 1. Complete Form Validation Feedback
**Files to Update:**
- `app/contact/page.tsx` - Add visual indicators
- `app/auth/register/page.tsx` - Add visual indicators
- `app/auth/login/page.tsx` - Add visual indicators
- `app/checkout/page.tsx` - Add visual indicators

**Implementation:**
```typescript
// Use FormField component or add visual indicators
className={`... ${
  errors.field 
    ? "border-red-500 bg-red-50" 
    : touchedFields.field && !errors.field
    ? "border-green-500 bg-green-50"
    : "border-gray-200"
}`}
```

---

#### 2. Add CSRF Protection to Forms
**Forms to Protect:**
- Contact form
- Newsletter form
- Checkout form
- Address forms
- Profile forms

**Implementation:**
```typescript
// In form component
import { useCsrfToken, CsrfInput } from '@/hooks/useCsrfToken';

const csrfToken = useCsrfToken();

// In form
<form>
  <CsrfInput />
  {/* other fields */}
</form>

// In API route
import { verifyCsrfTokenServer } from '@/lib/csrf';

const csrfToken = request.headers.get('x-csrf-token');
const sessionToken = request.cookies.get('csrf_token')?.value;

if (!verifyCsrfTokenServer(csrfToken || '', sessionToken || '')) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

---

#### 3. Complete Sentry Setup
**Steps:**
1. Create Sentry account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Copy DSN
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
   ```
5. Test error tracking

---

## 🎯 Quick Wins

### Apply Form Validation to Contact Form
**Time:** 15 minutes

```typescript
// Add to contact form inputs
className={`... ${
  errors.name 
    ? "border-red-500 bg-red-50" 
    : touchedFields.name && !errors.name
    ? "border-green-500 bg-green-50"
    : "border-gray-200"
}`}
```

### Add CSRF to Contact Form
**Time:** 10 minutes

```typescript
import { useCsrfToken, CsrfInput } from '@/hooks/useCsrfToken';

const csrfToken = useCsrfToken();

// In form
<CsrfInput />

// In API
const csrfToken = request.headers.get('x-csrf-token');
// Verify token
```

---

## 📊 Progress Summary

- ✅ **Skeleton Loaders:** 100% Complete
- ⏳ **Form Validation:** 30% Complete (addresses done, others pending)
- ⏳ **CSRF Protection:** 20% Complete (infrastructure ready, forms pending)
- ⏳ **Sentry Integration:** 80% Complete (config done, DSN setup pending)

---

**All infrastructure is in place. Remaining work is applying to forms.**

