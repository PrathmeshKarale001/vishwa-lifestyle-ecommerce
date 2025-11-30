# 🔒 Production Security Setup Guide

This guide walks you through implementing all production security measures.

---

## 📋 Overview

This setup implements:
1. ✅ **Role-Based Access Control (RBAC)** - Database-driven admin access
2. ✅ **Comprehensive RLS Policies** - Row-level security for all tables
3. ✅ **Audit Logging** - Track all admin actions
4. ✅ **Redis Rate Limiting** - Distributed rate limiting (optional but recommended)

---

## Step 1: Set Up Database Security (RLS Policies)

### 1.1 Run RLS Policies SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `supabase/rls-policies.sql` from this project
3. Copy the entire SQL file
4. Paste into Supabase SQL Editor
5. Click **Run**

This will create:
- `admin_users` table for RBAC
- `audit_logs` table for tracking
- Comprehensive RLS policies for all tables
- Helper functions

### 1.2 Create Your First Admin User

After running the SQL, you need to create your first admin user. You have two options:

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace with your email):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Then insert admin user (replace USER_ID_HERE with the ID from above)
INSERT INTO public.admin_users (user_id, email, role, permissions)
VALUES (
  'USER_ID_HERE',
  'your-admin-email@example.com',
  'super_admin',
  '{"orders": true, "products": true, "users": true, "settings": true}'::jsonb
);
```

**Option B: Using Service Role Key (Programmatic)**

Create a script `scripts/create-admin.ts`:

```typescript
import { createAdminUser } from '../lib/admin';

// This requires SUPABASE_SERVICE_ROLE_KEY
async function main() {
  const userId = 'USER_ID_FROM_AUTH_USERS';
  const email = 'admin@vishwalifestyle.com';
  
  const admin = await createAdminUser(userId, email, 'super_admin', {
    orders: true,
    products: true,
    users: true,
    settings: true,
  });
  
  console.log('Admin user created:', admin);
}

main();
```

### 1.3 Verify RLS is Working

1. Try accessing `/admin` with a non-admin account → Should be denied
2. Try accessing `/admin` with admin account → Should work
3. Check Supabase → **Table Editor** → `admin_users` → Should see your admin user

---

## Step 2: Update Application Code

The admin pages have been updated to use database-based checks. The code automatically:
- Checks `admin_users` table first
- Falls back to `NEXT_PUBLIC_ADMIN_EMAILS` if table doesn't exist
- Logs admin actions to `audit_logs`

**No code changes needed** - it's already implemented! Just run the SQL.

---

## Step 3: Set Up Redis Rate Limiting (Optional but Recommended)

### 3.1 Choose Your Redis Provider

**For Vercel:** Use Upstash (easiest)
**For VPS:** Use Redis Cloud
**For Vercel Pro:** Use Vercel KV

### 3.2 Follow Setup Guide

See `REDIS_SETUP.md` for complete instructions for your chosen provider.

### 3.3 Update Middleware

The guide includes code examples. After setup:
1. Install Redis package
2. Create `lib/rate-limit.ts`
3. Update `middleware.ts` to use Redis

---

## Step 4: Verify Everything Works

### 4.1 Test Admin Access

1. **Non-Admin User:**
   - Try accessing `/admin` → Should redirect to homepage
   - Try accessing `/admin/orders` → Should be denied

2. **Admin User:**
   - Access `/admin` → Should work
   - Access `/admin/orders` → Should work
   - Check browser console → Should see audit log entries

### 4.2 Test RLS Policies

1. **As Regular User:**
   - Can only see own orders
   - Can only see own addresses
   - Cannot see other users' data

2. **As Admin:**
   - Can see all orders
   - Can see all addresses
   - Can update orders

### 4.3 Test Rate Limiting (if Redis is set up)

1. Make 100+ rapid requests to `/api/contact`
2. Should receive 429 error after limit
3. Wait 1 minute, should work again

---

## Step 5: Production Checklist

Before going live:

- [ ] RLS policies SQL run in Supabase
- [ ] First admin user created
- [ ] Admin access tested (both admin and non-admin)
- [ ] RLS policies tested (user can only see own data)
- [ ] Redis rate limiting set up (optional)
- [ ] Audit logs working (check `audit_logs` table)
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` removed from production (use database instead)
- [ ] Service role key secured (never in client code)
- [ ] Database backups enabled in Supabase
- [ ] Supabase audit logs enabled

---

## 🔍 Monitoring & Maintenance

### View Audit Logs

```sql
-- View recent admin actions
SELECT * FROM public.audit_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- View actions by user
SELECT 
  au.email,
  al.action,
  al.resource_type,
  al.created_at
FROM public.audit_logs al
JOIN public.admin_users au ON al.user_id = au.user_id
ORDER BY al.created_at DESC;
```

### Manage Admin Users

```sql
-- List all admins
SELECT * FROM public.admin_users WHERE is_active = TRUE;

-- Deactivate an admin
UPDATE public.admin_users 
SET is_active = FALSE 
WHERE email = 'old-admin@example.com';

-- Change admin role
UPDATE public.admin_users 
SET role = 'moderator' 
WHERE email = 'user@example.com';
```

### Check RLS Policies

```sql
-- View all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🆘 Troubleshooting

### Admin Access Not Working

1. **Check if admin_users table exists:**
   ```sql
   SELECT * FROM public.admin_users LIMIT 1;
   ```

2. **Check if user is in admin_users:**
   ```sql
   SELECT * FROM public.admin_users 
   WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Check browser console** for errors

4. **Verify RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

### RLS Policies Not Working

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename = 'orders';
   ```

2. **Check policies exist:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'orders';
   ```

3. **Test as authenticated user** (not service role)

### Rate Limiting Not Working

1. Check Redis connection in logs
2. Verify environment variables are set
3. Check Redis dashboard for activity
4. Test with curl/Postman

---

## 📚 Additional Resources

- **Supabase RLS Docs:** https://supabase.com/docs/guides/auth/row-level-security
- **Upstash Redis:** https://upstash.com/docs
- **Security Best Practices:** See `SECURITY_CHECKLIST.md`

---

## 🎯 Next Steps

After completing this setup:

1. ✅ Test all security features
2. ✅ Set up monitoring (Sentry, etc.)
3. ✅ Document admin user management process
4. ✅ Train team on admin access
5. ✅ Set up regular security audits

---

**Last Updated:** November 2024
**Status:** Ready for production implementation

