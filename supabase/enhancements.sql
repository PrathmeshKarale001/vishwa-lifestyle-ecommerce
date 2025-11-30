-- ==========================================
-- ENHANCEMENTS: Abandoned Carts, Coupons, Inventory, Analytics
-- ==========================================
-- Run this SQL in Supabase SQL Editor after rls-policies.sql

-- ==========================================
-- 1. ABANDONED CARTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  session_id TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  promo_code TEXT,
  status TEXT DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'recovered', 'expired')),
  email_sent_count INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Users can view their own abandoned carts
CREATE POLICY "Users can view own abandoned carts" ON public.abandoned_carts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Anyone can insert abandoned carts
CREATE POLICY "Anyone can insert abandoned carts" ON public.abandoned_carts
  FOR INSERT WITH CHECK (true);

-- Users can update their own abandoned carts
CREATE POLICY "Users can update own abandoned carts" ON public.abandoned_carts
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all abandoned carts
CREATE POLICY "Admins can view all abandoned carts" ON public.abandoned_carts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user_id ON public.abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created_at ON public.abandoned_carts(created_at DESC);

-- ==========================================
-- 2. COUPONS/DISCOUNTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_limit INTEGER DEFAULT 1, -- How many times a single user can use
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'products', 'categories')),
  applicable_ids TEXT[], -- Product IDs or category IDs
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can view active coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons" ON public.coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Only admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
      AND (au.permissions->>'products' = 'true' OR au.role = 'super_admin')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

-- ==========================================
-- 3. COUPON USAGE TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  email TEXT,
  discount_amount NUMERIC(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own coupon usage
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can insert coupon usage (for tracking)
CREATE POLICY "Anyone can insert coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (true);

-- Admins can view all coupon usage
CREATE POLICY "Admins can view all coupon usage" ON public.coupon_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON public.coupon_usage(order_id);

-- ==========================================
-- 4. INVENTORY TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL, -- Sanity product ID
  product_slug TEXT,
  product_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- For pending orders
  low_stock_threshold INTEGER DEFAULT 10,
  is_tracked BOOLEAN DEFAULT TRUE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Anyone can view inventory (for product pages)
CREATE POLICY "Anyone can view inventory" ON public.inventory
  FOR SELECT USING (true);

-- Only admins can manage inventory
CREATE POLICY "Admins can manage inventory" ON public.inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() 
      AND au.is_active = TRUE
      AND (au.permissions->>'products' = 'true' OR au.role = 'super_admin')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON public.inventory(quantity);

-- ==========================================
-- 5. ANALYTICS EVENTS TABLE
-- ==========================================

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

-- Anyone can insert analytics events
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Users can view their own events
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = TRUE
    )
  );

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON public.analytics_events(page_path);

-- ==========================================
-- 6. HELPER FUNCTIONS
-- ==========================================

-- Function to check if coupon is valid
CREATE OR REPLACE FUNCTION public.is_coupon_valid(
  coupon_code TEXT,
  user_uuid UUID DEFAULT NULL,
  order_amount NUMERIC DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  coupon_record RECORD;
  usage_count INTEGER;
  user_usage_count INTEGER;
BEGIN
  -- Get coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = UPPER(coupon_code)
    AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW())
    AND valid_from <= NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Coupon not found or inactive');
  END IF;

  -- Check minimum order amount
  IF order_amount < coupon_record.min_order_amount THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'error', format('Minimum order amount of %s required', coupon_record.min_order_amount)
    );
  END IF;

  -- Check usage limit
  IF coupon_record.usage_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO usage_count
    FROM public.coupon_usage
    WHERE coupon_id = coupon_record.id;

    IF usage_count >= coupon_record.usage_limit THEN
      RETURN jsonb_build_object('valid', false, 'error', 'Coupon usage limit reached');
    END IF;
  END IF;

  -- Check user limit
  IF user_uuid IS NOT NULL AND coupon_record.user_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO user_usage_count
    FROM public.coupon_usage
    WHERE coupon_id = coupon_record.id AND user_id = user_uuid;

    IF user_usage_count >= coupon_record.user_limit THEN
      RETURN jsonb_build_object('valid', false, 'error', 'You have already used this coupon');
    END IF;
  END IF;

  RETURN jsonb_build_object('valid', true, 'coupon', to_jsonb(coupon_record));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate discount
CREATE OR REPLACE FUNCTION public.calculate_discount(
  coupon_code TEXT,
  subtotal_amount NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  coupon_record RECORD;
  discount_amount NUMERIC;
BEGIN
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = UPPER(coupon_code)
    AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF coupon_record.type = 'percentage' THEN
    discount_amount := subtotal_amount * (coupon_record.value / 100);
  ELSE
    discount_amount := coupon_record.value;
  END IF;

  -- Apply max discount limit if set
  IF coupon_record.max_discount_amount IS NOT NULL THEN
    discount_amount := LEAST(discount_amount, coupon_record.max_discount_amount);
  END IF;

  RETURN discount_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update inventory
CREATE OR REPLACE FUNCTION public.update_inventory(
  product_id_text TEXT,
  quantity_change INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = quantity + quantity_change,
      last_updated_at = NOW()
  WHERE product_id = product_id_text;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. TRIGGERS
-- ==========================================

-- Update updated_at for abandoned_carts
CREATE TRIGGER update_abandoned_carts_updated_at
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at for coupons
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 8. SAMPLE DATA (Optional)
-- ==========================================

-- Insert sample coupons
INSERT INTO public.coupons (code, name, description, type, value, min_order_amount, usage_limit, valid_until)
VALUES
  ('WELCOME10', 'Welcome Discount', '10% off on your first order', 'percentage', 10, 500, 100, NOW() + INTERVAL '1 year'),
  ('FIRST100', 'First Order Bonus', '₹100 off on orders above ₹999', 'fixed', 100, 999, 50, NOW() + INTERVAL '1 year'),
  ('VISHWA20', 'Vishwa Special', '20% off on orders above ₹1500', 'percentage', 20, 1500, NULL, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

