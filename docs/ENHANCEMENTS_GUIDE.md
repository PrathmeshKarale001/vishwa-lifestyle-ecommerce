# 🚀 Vishwa Lifestyle - Enhancements Guide

This document describes all the new enhancements added to the e-commerce platform.

---

## ✅ Implemented Features

### 1. Abandoned Cart Recovery ✅

**What it does:**
- Tracks carts that users abandon before checkout
- Sends automated email reminders to recover sales
- Allows users to recover their cart with a single click

**Database:**
- `abandoned_carts` table stores cart data
- Tracks email send count and recovery status

**How it works:**
1. When user adds items to cart and leaves, cart is saved
2. After 24 hours, first reminder email is sent
3. Additional reminders sent (up to 3 total)
4. User clicks recovery link → cart is restored

**Files:**
- `lib/abandoned-cart.ts` - Cart tracking functions
- `app/api/abandoned-cart/remind/route.ts` - Email reminder API
- `lib/email.ts` - Abandoned cart email template

**Setup:**
1. Run `supabase/enhancements.sql` in Supabase
2. Set up cron job to call `/api/abandoned-cart/remind` daily
3. Cart tracking happens automatically when users leave checkout

---

### 2. Discount/Coupon System ✅

**What it does:**
- Create and manage discount coupons
- Validate coupons with rules (min order, usage limits, expiry)
- Apply discounts to orders
- Track coupon usage

**Database:**
- `coupons` table - Stores all coupon codes
- `coupon_usage` table - Tracks when coupons are used

**Features:**
- Percentage or fixed amount discounts
- Minimum order amount requirements
- Maximum discount limits
- Usage limits (total and per-user)
- Expiry dates
- Product/category specific coupons

**Files:**
- `lib/coupons.ts` - Coupon management functions
- `app/api/coupons/validate/route.ts` - Coupon validation API
- `store/cart.ts` - Updated to use database coupons

**Setup:**
1. Run `supabase/enhancements.sql` in Supabase
2. Sample coupons are created automatically
3. Admin can create new coupons via API or database

**Sample Coupons (created automatically):**
- `WELCOME10` - 10% off, min ₹500
- `FIRST100` - ₹100 off, min ₹999
- `VISHWA20` - 20% off, min ₹1500

---

### 3. Inventory Management ✅

**What it does:**
- Track product inventory levels
- Reserve inventory when orders are placed
- Deduct inventory when orders are confirmed
- Low stock alerts
- Out of stock handling

**Database:**
- `inventory` table - Stores product stock levels

**Features:**
- Real-time inventory tracking
- Reserved quantity for pending orders
- Low stock threshold alerts
- Automatic deduction on order confirmation
- Can disable tracking for unlimited stock items

**Files:**
- `lib/inventory.ts` - Inventory management functions
- Product pages can check stock before adding to cart

**Setup:**
1. Run `supabase/enhancements.sql` in Supabase
2. Sync products from Sanity to inventory table
3. Update inventory when orders are placed/confirmed

**Usage:**
```typescript
// Check if product is in stock
const inStock = await isInStock(productId, quantity);

// Reserve inventory when order is placed
await reserveInventory(productId, quantity);

// Deduct inventory when order is confirmed
await deductInventory(productId, quantity);
```

---

### 4. Analytics System ✅

**What it does:**
- Track all user events to database
- Page views, e-commerce events, user actions
- Sales analytics and reporting
- Product performance tracking

**Database:**
- `analytics_events` table - Stores all tracked events

**Features:**
- Page view tracking
- E-commerce event tracking (add to cart, purchase, etc.)
- User session tracking
- Custom event properties
- IP and user agent tracking

**Files:**
- `lib/analytics.ts` - Enhanced with database tracking
- `app/api/analytics/track/route.ts` - Event tracking API

**Events Tracked:**
- Page views
- Product views
- Add to cart
- Remove from cart
- Checkout steps
- Purchases
- Search queries
- User signups/logins

**Setup:**
1. Run `supabase/enhancements.sql` in Supabase
2. Analytics tracking happens automatically
3. View analytics in admin dashboard (coming soon)

---

### 5. Improved Admin Dashboard (In Progress)

**Planned Features:**
- Enhanced statistics with charts
- Abandoned cart recovery metrics
- Coupon usage analytics
- Inventory alerts
- Sales trends
- Product performance
- Customer analytics

---

## 📋 Setup Instructions

### Step 1: Run Database Migrations

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `supabase/rls-policies.sql` (if not already done)
3. Run `supabase/enhancements.sql` (new tables)

### Step 2: Verify Tables Created

Check that these tables exist:
- ✅ `abandoned_carts`
- ✅ `coupons`
- ✅ `coupon_usage`
- ✅ `inventory`
- ✅ `analytics_events`

### Step 3: Set Up Abandoned Cart Reminders

**Option A: Vercel Cron Jobs (Recommended)**

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/abandoned-cart/remind",
    "schedule": "0 10 * * *"
  }]
}
```

**Option B: External Cron Service**

Use a service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)

Set it to call: `https://yourdomain.com/api/abandoned-cart/remind` daily

### Step 4: Sync Inventory

You'll need to sync products from Sanity to the inventory table. Create a script or use the admin interface.

---

## 🔧 API Endpoints

### Coupons
- `POST /api/coupons/validate` - Validate coupon code
  ```json
  {
    "code": "WELCOME10",
    "subtotal": 1000,
    "user_id": "optional-user-id"
  }
  ```

### Analytics
- `POST /api/analytics/track` - Track event
  ```json
  {
    "event_type": "ecommerce",
    "event_name": "add_to_cart",
    "user_id": "optional",
    "session_id": "optional",
    "page_path": "/shop",
    "properties": {}
  }
  ```

### Abandoned Cart
- `POST /api/abandoned-cart/remind` - Send reminder emails
  ```json
  {
    "hours": 24,
    "maxEmails": 3
  }
  ```

---

## 📊 Database Schema

### Abandoned Carts
```sql
- id (UUID)
- user_id (UUID, nullable)
- email (TEXT, nullable)
- session_id (TEXT, nullable)
- items (JSONB)
- subtotal, discount, shipping, tax, total (NUMERIC)
- promo_code (TEXT, nullable)
- status (abandoned | recovered | expired)
- email_sent_count (INTEGER)
- last_email_sent_at (TIMESTAMP)
- recovered_at (TIMESTAMP)
```

### Coupons
```sql
- id (UUID)
- code (TEXT, unique)
- name, description (TEXT)
- type (percentage | fixed)
- value (NUMERIC)
- min_order_amount (NUMERIC)
- max_discount_amount (NUMERIC, nullable)
- usage_limit (INTEGER, nullable)
- usage_count (INTEGER)
- user_limit (INTEGER)
- is_active (BOOLEAN)
- valid_from, valid_until (TIMESTAMP)
- applicable_to (all | products | categories)
- applicable_ids (TEXT[])
```

### Inventory
```sql
- id (UUID)
- product_id (TEXT)
- product_slug, product_name (TEXT)
- sku (TEXT, unique)
- quantity (INTEGER)
- reserved_quantity (INTEGER)
- low_stock_threshold (INTEGER)
- is_tracked (BOOLEAN)
```

### Analytics Events
```sql
- id (UUID)
- event_type, event_name (TEXT)
- user_id (UUID, nullable)
- session_id (TEXT, nullable)
- page_path, page_title (TEXT, nullable)
- properties (JSONB)
- ip_address, user_agent (TEXT)
- created_at (TIMESTAMP)
```

---

## 🎯 Usage Examples

### Track Abandoned Cart
```typescript
import { trackCartAbandonment } from '@/lib/abandoned-cart';

// When user leaves checkout page
trackCartAbandonment({
  items: cartItems,
  subtotal: 1000,
  discount: 100,
  shipping: 99,
  tax: 162,
  total: 1161,
  promo_code: 'WELCOME10',
});
```

### Validate Coupon
```typescript
import { validateCoupon } from '@/lib/coupons';

const result = await validateCoupon('WELCOME10', 1000, userId);
if (result.valid) {
  console.log('Discount:', result.discount);
}
```

### Check Inventory
```typescript
import { isInStock, getAvailableQuantity } from '@/lib/inventory';

const available = await getAvailableQuantity(productId);
const canAdd = await isInStock(productId, quantity);
```

### Track Analytics
```typescript
import { trackPageViewToDB, trackEcommerceEventToDB } from '@/lib/analytics';

// Track page view
trackPageViewToDB('/shop', 'Shop Page');

// Track e-commerce event
trackEcommerceEventToDB('add_to_cart', {
  product_id: 'prod-123',
  product_name: 'Product Name',
  price: 999,
  quantity: 1,
});
```

---

## 🔐 Security

All new tables have Row Level Security (RLS) enabled:
- Users can only see their own data
- Admins can see all data
- Public data (inventory, active coupons) accessible to all

---

## 📈 Next Steps

1. **Admin Interface for Coupons**
   - Create/edit/delete coupons
   - View usage statistics
   - Generate coupon codes

2. **Admin Interface for Inventory**
   - View all inventory levels
   - Update stock quantities
   - Low stock alerts
   - Bulk import/export

3. **Enhanced Analytics Dashboard**
   - Sales charts
   - Product performance
   - Customer behavior
   - Conversion funnels

4. **Automated Inventory Sync**
   - Sync from Sanity products
   - Update on order placement
   - Low stock email alerts

---

## 🆘 Troubleshooting

### Coupons not working?
- Check if coupon is active in database
- Verify expiry date hasn't passed
- Check usage limits
- Ensure minimum order amount is met

### Abandoned cart emails not sending?
- Verify Resend API key is set
- Check cron job is running
- Verify email addresses in abandoned_carts table
- Check email_sent_count < maxEmails

### Inventory not updating?
- Verify inventory table has product entries
- Check is_tracked is true
- Ensure product_id matches Sanity product ID

---

**Last Updated:** November 2024  
**Status:** ✅ Core Features Implemented

