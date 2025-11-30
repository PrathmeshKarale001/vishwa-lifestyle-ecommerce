import { createServerClient } from './supabase';
import { redirect } from 'next/navigation';
import { requireAuth as requireApiAuth } from './api-auth';
import { NextRequest } from 'next/server';

/**
 * Get authenticated user on server-side using service role
 * This bypasses RLS, so use carefully
 * Returns null if not authenticated
 */
export async function getServerUser() {
  const serverClient = createServerClient();
  if (!serverClient) return null;

  try {
    // For server-side, we need to get user from the request
    // This is a simplified version - in production, extract from cookies/headers
    // For now, we'll use the service role to check admin status
    // The actual user check should be done client-side or via middleware
    return null; // Placeholder - will be implemented per route
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Check if a user ID is an admin (server-side)
 */
export async function isServerAdmin(userId: string): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    // Check admin_users table
    const { data: adminUser } = await serverClient
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (adminUser) {
      return true;
    }

    // Fallback: get user email and check against env
    const { data: user } = await serverClient.auth.admin.getUserById(userId);
    if (user?.user?.email) {
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      return adminEmails.includes(user.user.email);
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if user owns a resource (e.g., order, address)
 */
export async function requireResourceOwnership(
  request: NextRequest,
  resourceType: 'order' | 'address',
  resourceId: string
) {
  const user = await requireApiAuth(request);
  if (!user || typeof user === 'object' && 'error' in user) {
    throw new Error('Unauthorized');
  }
  const serverClient = createServerClient();
  if (!serverClient) {
    throw new Error('Server client not available');
  }

  try {
    if (resourceType === 'order') {
      const { data: order } = await serverClient
        .from('orders')
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      // Allow if user owns the order OR if user is admin
      if (order.user_id === user.id) {
        return user;
      }

      // Check if admin
      const { data: adminUser } = await serverClient
        .from('admin_users')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (adminUser) {
        return user;
      }

      throw new Error('Unauthorized');
    }

    if (resourceType === 'address') {
      const { data: address } = await serverClient
        .from('addresses')
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (!address) {
        throw new Error('Address not found');
      }

      if (address.user_id !== user.id) {
        throw new Error('Unauthorized');
      }

      return user;
    }
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    throw error;
  }
}

