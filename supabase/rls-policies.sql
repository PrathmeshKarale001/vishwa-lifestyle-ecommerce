-- ==========================================
-- PRODUCTION SECURITY: ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Run this SQL in Supabase SQL Editor to enable comprehensive security
-- This replaces the basic RLS setup with production-grade policies

-- ==========================================
-- 1. ADMIN USERS TABLE (Role-Based Access Control)
-- ==========================================

-- Create admin_users table for role-based access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  permissions JSONB DEFAULT '{"orders": true, "products": true, "users": false, "settings": false}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users (using service role or specific policy)
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Only super_admins can insert/update/delete admin users
CREATE POLICY "Super admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.is_active = TRUE
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- ==========================================
-- 2. AUDIT LOG TABLE (Track Admin Actions)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Anyone can insert audit logs (for tracking)
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==========================================
-- 3. ENHANCED RLS POLICIES FOR EXISTING TABLES
-- ==========================================

-- Drop existing policies if they exist (to recreate with better security)
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Addresses
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Wishlists
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Admins can view all wishlists" ON public.wishlists;

-- Reviews
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;

-- Newsletter subscribers
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;

-- Contact submissions
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON public.contact_submissions;

-- Admin users (drop existing if any)
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;

-- ==========================================
-- PROFILES TABLE POLICIES
-- ==========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
      AND (au.permissions->>'users' = 'true' OR au.role = 'super_admin')
    )
  );

-- ==========================================
-- ADDRESSES TABLE POLICIES
-- ==========================================

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all addresses (for order fulfillment)
CREATE POLICY "Admins can view all addresses" ON public.addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- ==========================================
-- ORDERS TABLE POLICIES
-- ==========================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert orders (for checkout)
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
      AND (au.permissions->>'orders' = 'true' OR au.role = 'super_admin')
    )
  );

-- Admins can update orders (for status changes, tracking, etc.)
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
      AND (au.permissions->>'orders' = 'true' OR au.role = 'super_admin')
    )
  );

-- ==========================================
-- WISHLISTS TABLE POLICIES
-- ==========================================

-- Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view all wishlists (for analytics)
CREATE POLICY "Admins can view all wishlists" ON public.wishlists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- ==========================================
-- REVIEWS TABLE POLICIES
-- ==========================================

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can view reviews (public)
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Admins can delete reviews (moderation)
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
      AND (au.permissions->>'products' = 'true' OR au.role = 'super_admin')
    )
  );

-- ==========================================
-- NEWSLETTER SUBSCRIBERS TABLE POLICIES
-- ==========================================

-- Enable RLS if not already enabled
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON public.newsletter_subscribers
  FOR SELECT USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Admins can view all subscribers
CREATE POLICY "Admins can view all subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- ==========================================
-- CONTACT SUBMISSIONS TABLE POLICIES
-- ==========================================

-- Enable RLS if not already enabled
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.contact_submissions
  FOR SELECT USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Admins can view and update all submissions
CREATE POLICY "Admins can manage all submissions" ON public.contact_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- ==========================================
-- 4. HELPER FUNCTIONS
-- ==========================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = user_uuid AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.admin_users
    WHERE user_id = user_uuid AND is_active = TRUE
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_text TEXT,
  resource_type_text TEXT,
  resource_id_text TEXT DEFAULT NULL,
  details_json JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), action_text, resource_type_text, resource_id_text, details_json)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 6. INITIAL ADMIN USER SETUP
-- ==========================================
-- After running this, manually insert your first admin user:
-- 
-- INSERT INTO public.admin_users (user_id, email, role, permissions)
-- SELECT id, email, 'super_admin', '{"orders": true, "products": true, "users": true, "settings": true}'::jsonb
-- FROM auth.users
-- WHERE email = 'your-admin-email@example.com';

-- ==========================================
-- NOTES:
-- ==========================================
-- 1. After running this, you need to manually add your first admin user
-- 2. Use the service_role key to insert the first admin (bypasses RLS)
-- 3. After that, use the admin_users table for all admin access checks
-- 4. Update your application code to check admin_users table instead of NEXT_PUBLIC_ADMIN_EMAILS

