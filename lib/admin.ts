import { supabase, createServerClient } from './supabase';

// ==========================================
// ADMIN ACCESS CONTROL (Database-Based)
// ==========================================

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: {
    orders?: boolean;
    products?: boolean;
    users?: boolean;
    settings?: boolean;
  };
  is_active: boolean;
}

/**
 * Check if current user is an admin (using database)
 * Falls back to email-based check if admin_users table doesn't exist
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const targetUserId = userId || user.id;

    // Try database-based check first
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('is_active, role')
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .single();

    if (!error && adminUser) {
      return true;
    }

    // Fallback to email-based check (for backward compatibility)
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (adminEmails.length > 0 && adminEmails.includes(user.email || '')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser(userId?: string): Promise<AdminUser | null> {
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const targetUserId = userId || user.id;

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .single();

    if (error || !adminUser) return null;

    return adminUser as AdminUser;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  permission: 'orders' | 'products' | 'users' | 'settings',
  userId?: string
): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  if (!adminUser) return false;

  // Super admins have all permissions
  if (adminUser.role === 'super_admin') return true;

  // Check specific permission
  return adminUser.permissions[permission] === true;
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get IP address and user agent from browser (if available)
    const ipAddress = typeof window !== 'undefined' 
      ? (await fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ ip: null }))).ip
      : null;
    
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : null;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    // Don't throw - audit logging should never break the app
    console.error('Error logging admin action:', error);
  }
}

/**
 * Create admin user (server-side only, requires service role)
 */
export async function createAdminUser(
  userId: string,
  email: string,
  role: 'admin' | 'super_admin' | 'moderator' = 'admin',
  permissions?: {
    orders?: boolean;
    products?: boolean;
    users?: boolean;
    settings?: boolean;
  }
): Promise<AdminUser | null> {
  const serverClient = createServerClient();
  if (!serverClient) {
    throw new Error('Service role key required to create admin users');
  }

  try {
    const defaultPermissions = {
      orders: true,
      products: true,
      users: false,
      settings: false,
      ...permissions,
    };

    const { data, error } = await serverClient
      .from('admin_users')
      .insert({
        user_id: userId,
        email,
        role,
        permissions: defaultPermissions,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AdminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
}

/**
 * Update admin user (server-side only)
 */
export async function updateAdminUser(
  adminUserId: string,
  updates: {
    role?: 'admin' | 'super_admin' | 'moderator';
    permissions?: {
      orders?: boolean;
      products?: boolean;
      users?: boolean;
      settings?: boolean;
    };
    is_active?: boolean;
  }
): Promise<AdminUser | null> {
  const serverClient = createServerClient();
  if (!serverClient) {
    throw new Error('Service role key required to update admin users');
  }

  try {
    const { data, error } = await serverClient
      .from('admin_users')
      .update(updates)
      .eq('id', adminUserId)
      .select()
      .single();

    if (error) throw error;
    return data as AdminUser;
  } catch (error) {
    console.error('Error updating admin user:', error);
    return null;
  }
}

/**
 * Get all admin users (server-side only)
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const serverClient = createServerClient();
  if (!serverClient) {
    throw new Error('Service role key required to list admin users');
  }

  try {
    const { data, error } = await serverClient
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as AdminUser[];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

