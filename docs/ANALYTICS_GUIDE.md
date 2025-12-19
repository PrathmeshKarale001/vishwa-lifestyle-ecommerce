# 📊 Analytics Implementation Guide

**Status:** ✅ Fully Implemented  
**Last Updated:** November 2024

---

## 🎯 Overview

Your website has **two analytics systems** running in parallel:

1. **Google Analytics 4 (GA4)** - Client-side tracking for Google Analytics dashboard
2. **Database Analytics** - Server-side tracking stored in Supabase for custom reporting

---

## 📈 What's Currently Implemented

### ✅ Google Analytics 4 (GA4)

**Status:** ✅ Configured and Active

**Features:**
- Automatic page view tracking
- E-commerce event tracking (view_item, add_to_cart, purchase, etc.)
- User engagement tracking
- Conversion tracking

**Files:**
- `components/Analytics.tsx` - GA4 initialization
- `components/Providers.tsx` - Loads GA4 component
- `lib/analytics.ts` - GA4 event tracking functions

**Setup Required:**
1. Get your GA4 Measurement ID from [Google Analytics](https://analytics.google.com)
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**View Analytics:**
- Go to [Google Analytics Dashboard](https://analytics.google.com)
- Select your property
- View real-time and historical data

---

### ✅ Database Analytics (Supabase)

**Status:** ✅ Fully Implemented

**Features:**
- All events stored in `analytics_events` table
- User session tracking
- IP address and user agent tracking
- Custom event properties (JSONB)
- Page view tracking
- E-commerce event tracking

**Database Table:**
```sql
analytics_events (
  id UUID PRIMARY KEY,
  event_type TEXT,        -- 'page_view', 'ecommerce', 'user_action'
  event_name TEXT,         -- 'page_view', 'add_to_cart', 'purchase', etc.
  user_id UUID,           -- Authenticated user (nullable)
  session_id TEXT,        -- Browser session ID
  page_path TEXT,         -- URL path
  page_title TEXT,        -- Page title
  properties JSONB,       -- Custom event data
  ip_address TEXT,        -- User IP
  user_agent TEXT,        -- Browser info
  created_at TIMESTAMP
)
```

**API Endpoint:**
- `POST /api/analytics/track` - Saves events to database

**Files:**
- `lib/analytics.ts` - Database tracking functions
- `app/api/analytics/track/route.ts` - API route handler

---

## 📊 Events Tracked

### Page Views
- ✅ Automatic page view tracking (GA4)
- ✅ Database page view tracking (via `trackPageViewToDB()`)

### E-commerce Events
- ✅ **View Product** - When user views a product page
- ✅ **Add to Cart** - When item added to cart
- ✅ **Remove from Cart** - When item removed
- ✅ **View Cart** - When cart drawer opens
- ✅ **Begin Checkout** - When checkout starts
- ✅ **Add Payment Info** - Payment method selected
- ✅ **Add Shipping Info** - Shipping address added
- ✅ **Purchase** - Order completed
- ✅ **Refund** - Order refunded

### User Actions
- ✅ **Sign Up** - User registration
- ✅ **Login** - User login
- ✅ **Newsletter Signup** - Newsletter subscription
- ✅ **Search** - Product search queries
- ✅ **Share** - Content sharing
- ✅ **Error** - JavaScript errors

---

## 🚀 Setup Instructions

### 1. Google Analytics 4 Setup

**Step 1: Create GA4 Property**
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property (or use existing)
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

**Step 2: Add Environment Variable**
```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Step 3: Verify Setup**
1. Restart your dev server
2. Visit your website
3. Check Google Analytics Real-Time reports
4. You should see page views appearing

**Step 4: Enable E-commerce Tracking**
- E-commerce events are automatically tracked
- View in GA4 under "Events" → "E-commerce"

---

### 2. Database Analytics Setup

**Step 1: Create Analytics Table**
The table is already created in `supabase/enhancements.sql`. Run it if not done:

```sql
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_path TEXT,
  page_title TEXT,
  properties JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events (for tracking)
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);
```

**Step 2: Verify Tracking**
- Events are automatically tracked when users interact
- Check Supabase dashboard → Table Editor → `analytics_events`

---

## 📊 Viewing Analytics Data

### Google Analytics Dashboard

**Access:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Select your property
3. View reports:
   - **Real-time** - Current visitors
   - **Engagement** - Page views, sessions
   - **Monetization** - E-commerce events, revenue
   - **User** - Demographics, acquisition

**Key Reports:**
- **E-commerce Overview** - Sales, revenue, conversion
- **Events** - All tracked events
- **User Acquisition** - Traffic sources
- **User Engagement** - Session duration, pages per session

---

### Database Analytics (Supabase)

**Option 1: Supabase Dashboard**
1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `analytics_events` table
4. View all events with filters

**Option 2: SQL Queries**

**Total Events:**
```sql
SELECT COUNT(*) as total_events
FROM analytics_events;
```

**Events by Type:**
```sql
SELECT 
  event_type,
  COUNT(*) as count
FROM analytics_events
GROUP BY event_type
ORDER BY count DESC;
```

**E-commerce Events:**
```sql
SELECT 
  event_name,
  COUNT(*) as count,
  SUM((properties->>'value')::numeric) as total_value
FROM analytics_events
WHERE event_type = 'ecommerce'
GROUP BY event_name
ORDER BY count DESC;
```

**Page Views (Last 7 Days):**
```sql
SELECT 
  page_path,
  COUNT(*) as views
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY page_path
ORDER BY views DESC
LIMIT 10;
```

**Conversion Funnel:**
```sql
SELECT 
  event_name,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
WHERE event_name IN ('view_item', 'add_to_cart', 'begin_checkout', 'purchase')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY 
  CASE event_name
    WHEN 'view_item' THEN 1
    WHEN 'add_to_cart' THEN 2
    WHEN 'begin_checkout' THEN 3
    WHEN 'purchase' THEN 4
  END;
```

**Top Products:**
```sql
SELECT 
  properties->>'item_name' as product_name,
  COUNT(*) as views,
  SUM((properties->>'value')::numeric) as total_value
FROM analytics_events
WHERE event_name = 'view_item'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY properties->>'item_name'
ORDER BY views DESC
LIMIT 10;
```

---

## 🎨 Admin Dashboard Analytics (Coming Soon)

**Status:** ⏳ Not Yet Implemented

**Planned Features:**
- Analytics overview widget
- Real-time visitor count
- Top pages
- Conversion funnel
- Revenue charts
- Product performance

**To Add:**
1. Create `app/admin/analytics/page.tsx`
2. Fetch data from `analytics_events` table
3. Display charts using a library like Recharts or Chart.js

---

## 🔧 Usage Examples

### Track Custom Event

```typescript
import { trackEventToDatabase } from '@/lib/analytics';

// Track a custom event
await trackEventToDatabase({
  event_type: 'user_action',
  event_name: 'button_click',
  page_path: '/shop',
  page_title: 'Shop',
  properties: {
    button_id: 'newsletter_signup',
    location: 'footer',
  },
});
```

### Track Page View

```typescript
import { trackPageViewToDB } from '@/lib/analytics';

// Track page view
trackPageViewToDB('/product/sacred-agnihotra-kit', 'Sacred Agnihotra Kit');
```

### Track E-commerce Event

```typescript
import { trackEcommerceEventToDB } from '@/lib/analytics';

// Track purchase
trackEcommerceEventToDB('purchase', {
  order_id: 'ORD-12345',
  value: 2999,
  currency: 'INR',
  items: [
    {
      id: 'prod-123',
      name: 'Sacred Agnihotra Kit',
      price: 2999,
      quantity: 1,
    },
  ],
});
```

---

## 📈 Key Metrics to Monitor

### Traffic Metrics
- **Page Views** - Total pages viewed
- **Unique Visitors** - Distinct users
- **Sessions** - User sessions
- **Bounce Rate** - Single-page sessions

### E-commerce Metrics
- **Conversion Rate** - Purchases / Sessions
- **Average Order Value** - Revenue / Orders
- **Cart Abandonment Rate** - Carts not purchased
- **Product Views** - Most viewed products
- **Add to Cart Rate** - Items added / Product views

### User Engagement
- **Session Duration** - Time on site
- **Pages per Session** - Navigation depth
- **Return Visitor Rate** - Repeat customers

---

## 🔒 Privacy & Compliance

### Cookie Consent
- ✅ Cookie consent banner implemented
- ✅ Analytics only loads after consent
- ✅ GDPR compliant

### Data Privacy
- IP addresses are stored (can be anonymized)
- User IDs only stored for authenticated users
- All data stored in Supabase (your control)

### Anonymization (Optional)
To anonymize IP addresses, modify the API route:

```typescript
// In app/api/analytics/track/route.ts
const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
// Anonymize last octet
const anonymizedIP = ipAddress.replace(/\.\d+$/, '.0');
```

---

## 🐛 Troubleshooting

### Google Analytics Not Working

**Check:**
1. ✅ `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in `.env.local`
2. ✅ Restart dev server after adding env variable
3. ✅ Check browser console for errors
4. ✅ Verify GA4 property is active
5. ✅ Check Google Analytics Real-Time reports

**Common Issues:**
- Ad blockers may block GA4
- Incorrect Measurement ID format
- Cookie consent not given

### Database Analytics Not Working

**Check:**
1. ✅ `analytics_events` table exists in Supabase
2. ✅ RLS policies allow INSERT
3. ✅ Check browser Network tab for `/api/analytics/track` requests
4. ✅ Check Supabase logs for errors

**Common Issues:**
- Table not created
- RLS policy blocking inserts
- API route errors (check server logs)

---

## 📚 Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Supabase Analytics Best Practices](https://supabase.com/docs/guides/analytics)

---

## ✅ Current Status

- ✅ Google Analytics 4 - Configured
- ✅ Database Analytics - Implemented
- ✅ E-commerce Tracking - Active
- ✅ Page View Tracking - Active
- ✅ User Action Tracking - Active
- ⏳ Admin Dashboard Analytics - Not yet implemented

---

**Need Help?** Check the troubleshooting section or review the code in:
- `components/Analytics.tsx`
- `lib/analytics.ts`
- `app/api/analytics/track/route.ts`

