/**
 * Script to fix admin access for a user
 * Run this in browser console or as a one-time script
 */

import { supabase, createServerClient } from '../lib/supabase';
import { createAdminUser } from '../lib/admin';

async function fixAdminAccess(email: string) {
  console.log('🔍 Checking admin access for:', email);

  // Step 1: Get user from auth
  if (!supabase) {
    console.error('❌ Supabase not configured');
    return;
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ User not logged in');
    return;
  }

  console.log('✅ User logged in:', user.email);
  console.log('   User ID:', user.id);

  // Step 2: Check if user is in admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (adminError && adminError.code !== 'PGRST116') {
    console.error('❌ Error checking admin_users:', adminError);
    return;
  }

  if (adminUser) {
    console.log('✅ User found in admin_users table');
    console.log('   Role:', adminUser.role);
    console.log('   Active:', adminUser.is_active);
    
    if (!adminUser.is_active) {
      console.log('⚠️  User is inactive. Activating...');
      const serverClient = createServerClient();
      if (serverClient) {
        await serverClient
          .from('admin_users')
          .update({ is_active: true })
          .eq('id', adminUser.id);
        console.log('✅ User activated!');
      }
    }
    return;
  }

  console.log('⚠️  User not found in admin_users table');

  // Step 3: Check environment variable
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  console.log('📧 Admin emails from env:', adminEmails);
  
  if (adminEmails.includes(user.email || '')) {
    console.log('✅ Email found in NEXT_PUBLIC_ADMIN_EMAILS');
    console.log('   This should work, but let\'s add to database for better security...');
  } else {
    console.log('❌ Email NOT found in NEXT_PUBLIC_ADMIN_EMAILS');
    console.log('   Add this to .env.local:');
    console.log(`   NEXT_PUBLIC_ADMIN_EMAILS=${user.email}`);
  }

  // Step 4: Try to create admin user in database
  console.log('\n🔧 Attempting to create admin user in database...');
  
  try {
    const serverClient = createServerClient();
    if (!serverClient) {
      console.error('❌ Service role key not configured. Cannot create admin user.');
      console.log('\n📝 Manual fix:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Run this SQL:');
      console.log(`   INSERT INTO public.admin_users (user_id, email, role, permissions, is_active)`);
      console.log(`   SELECT id, email, 'super_admin', '{"orders": true, "products": true, "users": true, "settings": true}'::jsonb, true`);
      console.log(`   FROM auth.users`);
      console.log(`   WHERE email = '${user.email}';`);
      return;
    }

    const newAdmin = await createAdminUser(
      user.id,
      user.email || email,
      'super_admin',
      {
        orders: true,
        products: true,
        users: true,
        settings: true,
      }
    );

    if (newAdmin) {
      console.log('✅ Admin user created successfully!');
      console.log('   You should now be able to access /admin');
    } else {
      console.error('❌ Failed to create admin user');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Export for use
export { fixAdminAccess };

// If running directly
if (typeof window !== 'undefined') {
  (window as any).fixAdminAccess = fixAdminAccess;
}

