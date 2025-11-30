# 🔍 Sentry Error Monitoring Setup

**Status:** ✅ Configuration Complete  
**Setup Required:** Add DSN to environment variables

---

## 📋 Quick Setup (5 minutes)

### Step 1: Create Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in
3. Create a new organization (if needed)

### Step 2: Create Project
1. Click "Create Project"
2. Select **Next.js** as platform
3. Name it "Vishwa Lifestyle" (or your choice)
4. Copy the DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

### Step 3: Add DSN to Environment
Add to `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Step 4: Test
1. Restart dev server
2. Trigger an error (e.g., visit a non-existent page)
3. Check Sentry dashboard for the error

---

## ✅ What's Already Configured

### Files Created:
- ✅ `sentry.client.config.ts` - Client-side error tracking
- ✅ `sentry.server.config.ts` - Server-side error tracking
- ✅ `sentry.edge.config.ts` - Edge runtime tracking
- ✅ `lib/sentry.ts` - Sentry utilities

### Integration:
- ✅ `app/error.tsx` - Captures page errors
- ✅ `components/ErrorBoundary.tsx` - Captures React errors

### Features:
- ✅ Automatic error capture
- ✅ User context tracking
- ✅ Breadcrumb logging
- ✅ Performance monitoring
- ✅ Session replay (optional)
- ✅ Sensitive data filtering (passwords, tokens removed)

---

## 🎯 Usage Examples

### Capture Exception
```typescript
import { captureException } from '@/lib/sentry';

try {
  // risky code
} catch (error) {
  captureException(error, { context: 'additional info' });
}
```

### Capture Message
```typescript
import { captureMessage } from '@/lib/sentry';

captureMessage('User performed important action', 'info');
```

### Set User Context
```typescript
import { setUserContext } from '@/lib/sentry';

setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

### Add Breadcrumb
```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb({
  message: 'User clicked checkout button',
  category: 'user-action',
  level: 'info',
});
```

---

## 🔒 Privacy & Security

### Data Filtering:
- Passwords are automatically removed
- CSRF tokens are filtered
- Authorization headers are removed
- Sensitive form data is excluded

### What's Tracked:
- Error messages and stack traces
- User ID (if set)
- Page paths
- Browser information
- IP addresses (can be anonymized)

### What's NOT Tracked:
- Passwords
- Payment information
- Personal sensitive data
- CSRF tokens

---

## 📊 Monitoring Dashboard

Once set up, you can:
- View real-time errors
- See error frequency
- Track error trends
- View user impact
- See performance metrics
- Replay user sessions (if enabled)

---

## 🐛 Troubleshooting

### Errors Not Appearing in Sentry

**Check:**
1. ✅ DSN is set in `.env.local`
2. ✅ Restarted dev server after adding DSN
3. ✅ DSN format is correct
4. ✅ Sentry project is active

### Too Many Events

**Adjust:**
- Lower `tracesSampleRate` in config files
- Add more errors to `ignoreErrors` array
- Use `beforeSend` to filter events

---

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Error Monitoring Best Practices](https://docs.sentry.io/product/issues/)

---

**Once DSN is added, Sentry will automatically start tracking errors!**

