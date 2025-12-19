# 🛒 Vishwa Lifestyle - Checkout System & Admin Guide

## Table of Contents
1. [Checkout Flow](#checkout-flow)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Admin Interface Options](#admin-interface-options)
4. [Client Handover Guide](#client-handover-guide)
5. [Production Deployment](#production-deployment)

---

## 1️⃣ CHECKOUT FLOW

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. BROWSE & ADD TO CART                                                    │
│     └── User browses /shop                                                  │
│     └── Clicks "Add to Cart" on ProductCard                                 │
│     └── Cart stored in localStorage (Zustand)                               │
│     └── Cart drawer opens showing items                                     │
│                                                                             │
│  2. PROCEED TO CHECKOUT                                                     │
│     └── User clicks "Proceed to Checkout"                                   │
│     └── Redirected to /checkout                                             │
│     └── If not logged in → Redirect to /auth/login                          │
│                                                                             │
│  3. STEP 1: SHIPPING INFORMATION                                            │
│     └── User enters/selects shipping address                                │
│     └── Saved addresses loaded from Supabase                                │
│     └── Can add new address (saved to Supabase)                             │
│     └── Contact info: name, email, phone                                    │
│                                                                             │
│  4. STEP 2: SHIPPING METHOD                                                 │
│     └── Standard (5-7 days) - Free above ₹999                               │
│     └── Express (2-3 days) - ₹149                                           │
│     └── Shipping cost calculated                                            │
│                                                                             │
│  5. STEP 3: PAYMENT                                                         │
│     └── Order summary displayed                                             │
│     └── Apply promo code (optional)                                         │
│     └── Click "Pay Now"                                                     │
│     └── CCAvenue modal opens                                                │
│     └── User completes payment                                              │
│                                                                             │
│  6. ORDER CONFIRMATION                                                      │
│     └── CCAvenue sends success callback                                     │
│     └── Order created in Supabase                                           │
│     └── Order confirmation page shown                                       │
│     └── Confirmation email sent                                             │
│     └── Order visible in user's account                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technical Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │  API Routes  │    │   CCAvenue   │    │   Supabase   │
│  (Next.js)   │    │  (Next.js)   │    │   Gateway    │    │   Database   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │                   │
       │ 1. Checkout Init  │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 2. Create Order   │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 3. Order ID       │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │ 4. CCAvenue Modal │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 5. Payment        │                   │                   │
       │───────────────────────────────────────>                   │
       │                   │                   │                   │
       │ 6. Payment Success│                   │                   │
       │<──────────────────────────────────────│                   │
       │                   │                   │                   │
       │ 7. Verify Payment │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 8. Verify Signature                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 9. Save Order     │                   │
       │                   │───────────────────────────────────────>
       │                   │                   │                   │
       │ 10. Success Page  │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
```

---

## 2️⃣ DATA FLOW ARCHITECTURE

### Where Data is Stored

| Data Type | Storage Location | Access |
|-----------|------------------|--------|
| Products | Sanity CMS | Sanity Studio |
| Categories | Sanity CMS | Sanity Studio |
| User Accounts | Supabase Auth | Supabase Dashboard |
| User Profiles | Supabase (profiles table) | Supabase Dashboard |
| Addresses | Supabase (addresses table) | Supabase Dashboard |
| Orders | Supabase (orders table) | Supabase Dashboard |
| Cart | Browser localStorage | User's browser |
| Wishlist | Browser localStorage + Supabase | Both |
| Reviews | Supabase (reviews table) | Supabase Dashboard |
| Newsletter | Supabase (newsletter_subscribers) | Supabase Dashboard |
| Contact Forms | Supabase (contact_submissions) | Supabase Dashboard |

### Order Data Structure

When an order is placed, this data is saved to Supabase:

```json
{
  "id": "uuid-auto-generated",
  "order_number": "VL-20241128-001",
  "user_id": "user-uuid",
  "status": "processing",
  "items": [
    {
      "productId": "sanity-product-id",
      "name": "Agnihotra Kit",
      "price": 1499,
      "quantity": 2,
      "image": "https://cdn.sanity.io/..."
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "phone": "+91 98765 43210",
    "line1": "123 Main Street",
    "line2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001"
  },
  "subtotal": 2998,
  "discount": 0,
  "shipping": 0,
  "tax": 539.64,
  "total": 3537.64,
  "payment_method": "razorpay",
  "payment_id": "pay_xxx",
  "razorpay_order_id": "order_xxx",
  "promo_code": null,
  "tracking_number": null,
  "created_at": "2024-11-28T10:30:00Z",
  "updated_at": "2024-11-28T10:30:00Z"
}
```

---

## 3️⃣ ADMIN INTERFACE OPTIONS

### Option A: Use Existing Tools (Recommended for Start)

The client can manage everything using:

#### 1. **Sanity Studio** - For Products
- URL: `https://your-domain.com/studio` OR `https://your-project.sanity.studio`
- Manage: Products, Categories, Blog Posts
- Features: Add/Edit/Delete products, upload images, set prices

#### 2. **Supabase Dashboard** - For Orders & Users
- URL: `https://supabase.com/dashboard`
- Manage: Orders, Users, Addresses, Reviews
- Features: View orders, update status, see revenue

### Option B: Custom Admin Dashboard (Better UX)

If you want a dedicated admin panel, I can create one with:

```
/admin                    → Dashboard (Overview)
/admin/orders            → Order Management
/admin/orders/[id]       → Order Details
/admin/products          → Product Management (links to Sanity)
/admin/customers         → Customer List
/admin/analytics         → Sales Analytics
/admin/settings          → Store Settings
```

---

## 4️⃣ CLIENT HANDOVER GUIDE

### What the Client Needs to Do Daily

#### 📦 Checking New Orders

**Using Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Login with provided credentials
3. Select "Vishwa Lifestyle" project
4. Click **Table Editor** → **orders**
5. Sort by `created_at` (descending) to see newest first
6. Filter by `status = 'processing'` to see pending orders

**Quick Query (SQL Editor):**
```sql
-- Today's orders
SELECT 
  order_number,
  shipping_address->>'name' as customer_name,
  shipping_address->>'phone' as phone,
  total,
  status,
  created_at
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

#### 🔄 Updating Order Status

1. In Table Editor → orders
2. Click on the order row
3. Change `status` field:
   - `processing` → Order received, preparing
   - `shipped` → Order dispatched
   - `delivered` → Order delivered
   - `cancelled` → Order cancelled
4. Add `tracking_number` when shipped

#### 📊 Daily Revenue Check

```sql
-- Today's revenue
SELECT 
  COUNT(*) as order_count,
  SUM(total) as total_revenue
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE
AND status != 'cancelled';

-- This week's revenue
SELECT 
  COUNT(*) as order_count,
  SUM(total) as total_revenue
FROM orders 
WHERE created_at >= NOW() - INTERVAL '7 days'
AND status != 'cancelled';

-- This month's revenue
SELECT 
  DATE(created_at) as date,
  COUNT(*) as orders,
  SUM(total) as revenue
FROM orders 
WHERE created_at >= DATE_TRUNC('month', NOW())
AND status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY date;
```

#### 🛍️ Managing Products

1. Go to Sanity Studio: `https://your-domain.com/studio`
2. Login with Sanity credentials
3. Click **Products** in sidebar
4. To add: Click **+ Create** → Fill details → **Publish**
5. To edit: Click product → Make changes → **Publish**
6. To delete: Click product → **Delete** (caution!)

---

### Client Training Checklist

| Task | Tool | Frequency |
|------|------|-----------|
| Check new orders | Supabase | Daily |
| Update order status | Supabase | As orders ship |
| Add tracking numbers | Supabase | When shipped |
| View daily revenue | Supabase SQL | Daily |
| Add new products | Sanity Studio | As needed |
| Update product prices | Sanity Studio | As needed |
| Mark products out of stock | Sanity Studio | As needed |
| Check contact forms | Supabase | Daily |
| View newsletter signups | Supabase | Weekly |

---

## 5️⃣ PRODUCTION DEPLOYMENT

### Pre-Launch Checklist

#### Environment Variables (Vercel)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skxxx

# CCAvenue (LIVE keys - not test!)
NEXT_PUBLIC_CCAVENUE_MERCHANT_ID=xxx
CCAVENUE_ACCESS_CODE=xxx
CCAVENUE_WORKING_KEY=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# App URL
NEXT_PUBLIC_APP_URL=https://vishwalifestyle.com
```

####- **CCAvenue Config**: `NEXT_PUBLIC_CCAVENUE_MERCHANT_ID`, `CCAVENUE_ACCESS_CODE`, `CCAVENUE_WORKING_KEY`
- **Keys**: Obtain these from the CCAvenue Dashboard -> Settings -> API Keys.
- **Whitelisting**: Ensure your domain is whitelisted in CCAvenue settings.

#### CCAvenue Setup

1. Login to [CCAvenue Dashboard](https://dashboard.ccavenue.com)
2. Complete KYC verification
3. Get **LIVE** API keys (not test)
4. Set up webhook:
   - URL: `https://vishwalifestyle.com/api/webhook/ccavenue`
   - Events: `payment.captured`, `payment.failed`

#### Supabase Production

1. Enable **Row Level Security** on all tables
2. Set up **Database Backups** (automatic daily)
3. Configure **Email Templates** for auth
4. Test all authentication flows

#### Domain & SSL

1. Add custom domain in Vercel
2. Update DNS records
3. SSL is automatic with Vercel

---

### Deployment Steps

```bash
# 1. Push to GitHub
git add .
git commit -m "Production ready"
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import GitHub repository
# - Add environment variables
# - Deploy

# 3. Update URLs
# - Supabase: Add production URL to allowed redirects
# - CCAvenue: Add production URL to webhooks
# - Google OAuth: Add production callback URL
```

---

## 📱 ADMIN DASHBOARD (If Needed)

If you want a custom admin panel instead of using Supabase directly, here's what it would include:

### Dashboard Overview (`/admin`)
- Today's orders count
- Today's revenue
- Pending orders alert
- Low stock products
- Recent orders list

### Orders Page (`/admin/orders`)
- Table of all orders
- Filter by status, date
- Search by order number
- Bulk status update
- Export to CSV

### Order Detail (`/admin/orders/[id]`)
- Full order info
- Customer details
- Shipping address
- Payment info
- Status update dropdown
- Add tracking number
- Print invoice

### Analytics (`/admin/analytics`)
- Revenue charts (daily/weekly/monthly)
- Best selling products
- Customer growth
- Order trends

---

## 🎯 RECOMMENDED APPROACH FOR CLIENT

### Phase 1: Launch (Use Existing Tools)
1. **Products**: Sanity Studio
2. **Orders**: Supabase Dashboard
3. **Training**: 1-hour session with client

### Phase 2: Growth (Custom Admin - Optional)
- Build custom admin dashboard
- Better UX for non-technical users
- Mobile-friendly order management

---

## 📞 Support Contacts

| Issue | Contact |
|-------|---------|
| Website bugs | Developer |
| Payment issues | CCAvenue Support |
| Database issues | Supabase Support |
| Product images | Sanity Support |
| Domain/SSL | Vercel Support |

---

## Quick Reference Cards

### For Daily Order Management

```
📦 NEW ORDER RECEIVED
1. Open Supabase → Table Editor → orders
2. Check order details
3. Pack the order
4. Update status to "shipped"
5. Add tracking number
6. Customer gets notified (if email setup)

💰 CHECK DAILY REVENUE
1. Open Supabase → SQL Editor
2. Run: SELECT SUM(total) FROM orders WHERE DATE(created_at) = CURRENT_DATE;

🛍️ ADD NEW PRODUCT
1. Open Sanity Studio
2. Click "Products" → "Create"
3. Fill: Name, Price, Description, Images
4. Set inventory count
5. Click "Publish"
```

---

**Document Version:** 1.0
**Last Updated:** November 2024

