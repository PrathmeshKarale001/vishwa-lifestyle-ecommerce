# 🔧 Fix Admin Access Issue

If you're logged in but can't access the admin panel, follow these steps:

---

## Quick Fix Options

### Option 1: Add to Environment Variable (Easiest)

1. Open `.env.local` file
2. Add or update this line:
   ```bash
   NEXT_PUBLIC_ADMIN_EMAILS=eodonsocial@gmail.com
   ```
3. Restart your dev server:
   ```bash
   npm run dev
   ```
4. Try accessing `/admin` again

---

### Option 2: Add to Database (Recommended for Production)

This is the proper way - adds you to the `admin_users` table.

#### Step 1: Get Your User ID

1. Open browser console (F12)
2. Run this:
   ```javascript
   const { supabase } = await import('/lib/supabase');
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User ID:', user.id);
   console.log('Email:', user.email);
   ```

#### Step 2: Run SQL in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace with your email if different):

```sql
-- Add yourself as super admin
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
  permissions = '{"orders": true, "products": true, "users": true, "settings": true}'::jsonb;
```

3. Refresh the page and try `/admin` again

---

### Option 3: Use the Fix Script

1. Open browser console (F12) on your website
2. Run:
   ```javascript
   // Import the fix function
   import('/scripts/fix-admin-access').then(module => {
     module.fixAdminAccess('eodonsocial@gmail.com');
   });
   ```

---

## Debug: Check Current Status

Run this in browser console to see what's happening:

```javascript
// Check admin status
const { supabase } = await import('/lib/supabase');
const { isAdmin } = await import('/lib/admin');

// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.email);

// Check admin status
const isUserAdmin = await isAdmin();
console.log('Is admin:', isUserAdmin);

// Check admin_users table
const { data: adminUser } = await supabase
  .from('admin_users')
  .select('*')
  .eq('user_id', user?.id)
  .single();
console.log('Admin user record:', adminUser);

// Check environment variable (client-side, might not show)
console.log('NEXT_PUBLIC_ADMIN_EMAILS:', process.env.NEXT_PUBLIC_ADMIN_EMAILS);
```

---

## Common Issues

### Issue 1: `admin_users` table doesn't exist
**Solution:** Run `supabase/rls-policies.sql` in Supabase SQL Editor

### Issue 2: User not in `admin_users` table
**Solution:** Use Option 2 above to add yourself

### Issue 3: `NEXT_PUBLIC_ADMIN_EMAILS` not set
**Solution:** Add to `.env.local` and restart server

### Issue 4: Email mismatch
**Solution:** Make sure the email in Supabase Auth matches exactly (case-sensitive)

---

## Verify It Works

After fixing, you should:
1. Be able to access `/admin`
2. See the admin dashboard
3. Not get "Access denied" error

If it still doesn't work:
1. Check browser console for errors
2. Check Supabase logs
3. Verify you're logged in with the correct email
4. Make sure `admin_users` table exists and has your record

---

**Quick SQL to check your admin status:**

```sql
-- Check if you're in admin_users
SELECT au.*, u.email 
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'eodonsocial@gmail.com';
```

