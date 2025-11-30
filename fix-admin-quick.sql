-- ==========================================
-- QUICK FIX: Add eodonsocial@gmail.com as Admin
-- ==========================================
-- Run this in Supabase SQL Editor

-- Option 1: If admin_users table exists
INSERT INTO public.admin_users (user_id, email, role, permissions, is_active)
SELECT 
  id, 
  email, 
  'super_admin', 
  '{"orders": true, "products": true, "users": true, "settings": true}'::jsonb,
  true
FROM auth.users
WHERE email = 'eodonsocial@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  is_active = true,
  role = 'super_admin',
  email = EXCLUDED.email,
  permissions = '{"orders": true, "products": true, "users": true, "settings": true}'::jsonb;

-- Verify it worked
SELECT 
  au.id,
  au.email,
  au.role,
  au.is_active,
  u.email as auth_email
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'eodonsocial@gmail.com';

