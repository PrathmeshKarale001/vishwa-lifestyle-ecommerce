# Vishwa Lifestyle - Complete Production Setup Guide

This guide will help you set up all the real services for your e-commerce store.

---

## 📋 Overview

| Service | Purpose | Where Data is Stored |
|---------|---------|---------------------|
| **Supabase** | User accounts, orders, addresses | Supabase PostgreSQL cloud database |
| **Sanity CMS** | Products, categories, blog posts | Sanity.io cloud |
| **Razorpay** | Payment processing | Razorpay servers (PCI compliant) |
| **Shiprocket** | Shipping & tracking | Shiprocket servers |

---

## 1️⃣ SUPABASE SETUP (Database & Authentication)

Supabase stores: **User accounts, orders, addresses, wishlists**

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - **Name**: `vishwa-lifestyle`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to India (Singapore or Mumbai)
4. Click "Create new project" and wait 2-3 minutes

### Step 2: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 3: Create Database Tables

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  type TEXT DEFAULT 'home' CHECK (type IN ('home', 'work', 'other')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  email TEXT NOT NULL,
  phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT DEFAULT 'razorpay',
  payment_id TEXT,
  razorpay_order_id TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  promo_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  product_image TEXT,
  product_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for wishlists
CREATE POLICY "Users can manage own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. Enable **Google** provider:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - **Configure OAuth Consent Screen:**
     - Go to **APIs & Services** → **OAuth consent screen**
     - Set **App name** to: `Vishwa Lifestyle`
     - Fill in all required fields (support email, etc.)
     - Save
   - **Create OAuth Credentials:**
     - Go to **APIs & Services** → **Credentials**
     - Create **OAuth 2.0 Client ID** (Web application)
     - Add authorized redirect URI: `https://YOUR_SUPABASE_URL/auth/v1/callback`
     - Copy **Client ID** and **Client Secret** to Supabase
   - **Important:** The app name "Vishwa Lifestyle" will show in the Google sign-in screen

4. Configure email templates in **Authentication** → **Email Templates**

---

## 2️⃣ SANITY CMS SETUP (Products)

Sanity stores: **Products, categories, blog posts, site settings**

### Step 1: Create Sanity Project

```bash
cd /Users/prathmeshkarale/Downloads/Vishwa-Lifestyle
npx sanity@latest init --project-name "Vishwa Lifestyle" --dataset production --template clean
```

Choose:
- **Project name**: Vishwa Lifestyle
- **Dataset**: production
- **Project output path**: ./sanity-studio

### Step 2: Get API Keys

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **API** tab
4. Copy **Project ID** → `NEXT_PUBLIC_SANITY_PROJECT_ID`
5. Create a new **Token** with Editor access → `SANITY_API_TOKEN`

### Step 3: Deploy Sanity Studio

```bash
cd sanity-studio
npx sanity deploy
```

This gives you a URL like: `https://vishwa-lifestyle.sanity.studio`

### Step 4: Add Products in Sanity Studio

1. Go to your Sanity Studio URL
2. Click **Product** → **Create new**
3. Fill in product details with images

---

## 3️⃣ RAZORPAY SETUP (Payments)

Razorpay handles: **Payment processing, refunds**

### Step 1: Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Complete KYC verification (required for live payments)
3. You'll get **Test Mode** keys immediately

### Step 2: Get API Keys

1. Go to **Settings** → **API Keys**
2. Generate keys:
   - **Key ID** → `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

### Step 3: Configure Webhooks

1. Go to **Settings** → **Webhooks**
2. Add new webhook:
   - **URL**: `https://YOUR_DOMAIN/api/webhook/razorpay`
   - **Events**: Select all payment events
   - Copy **Webhook Secret** → `RAZORPAY_WEBHOOK_SECRET`

### Step 4: Test vs Live Mode

- **Test Mode**: Use for development (fake payments)
- **Live Mode**: Enable after KYC for real payments

---

## 4️⃣ SHIPPING SETUP (Shiprocket)

### Step 1: Create Shiprocket Account

1. Go to [shiprocket.in](https://shiprocket.in) and sign up
2. Complete business verification
3. Add pickup address

### Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Generate API credentials
3. Save **Email** and **Password** for API calls

### Step 3: Integration (I'll add this to your code)

---

## 5️⃣ ENVIRONMENT CONFIGURATION

Create `.env.local` file in your project root:

```env
# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

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
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-25
SANITY_API_TOKEN=your_token_here

# ===========================================
# RAZORPAY (Payments)
# ===========================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ===========================================
# GOOGLE OAUTH (for social login)
# ===========================================
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ===========================================
# NEXTAUTH
# ===========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_32_char_string

# ===========================================
# SHIPROCKET (Shipping)
# ===========================================
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password

# ===========================================
# ANALYTICS (Optional)
# ===========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🔐 WHERE IS DATA STORED?

| Data Type | Storage Location | Access |
|-----------|-----------------|--------|
| User accounts (email, password hash) | Supabase Auth | Secure, encrypted |
| User profiles (name, phone) | Supabase Database | Row Level Security |
| Orders | Supabase Database | User can only see their orders |
| Addresses | Supabase Database | User can only see their addresses |
| Wishlist | Supabase Database | Private per user |
| Products | Sanity CMS | Public (read-only for customers) |
| Payment data | Razorpay servers | PCI DSS compliant, never stored on your server |
| Shipping data | Shiprocket | Secure API |

---

## 🚀 QUICK START CHECKLIST

- [ ] Create Supabase account and project
- [ ] Run database SQL to create tables
- [ ] Create Sanity project
- [ ] Create Razorpay account
- [ ] Create Shiprocket account (optional, for automated shipping)
- [ ] Fill in `.env.local` with all keys
- [ ] Add products in Sanity Studio
- [ ] Test payment flow in test mode
- [ ] Complete KYC on Razorpay for live payments
- [ ] Deploy to Vercel

---

## 📞 Need Help?

If you get stuck at any step, let me know and I'll help you through it!
