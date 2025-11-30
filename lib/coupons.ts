import { supabase, createServerClient } from './supabase';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  user_limit: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  applicable_to: 'all' | 'products' | 'categories';
  applicable_ids?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Validate coupon code
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}> {
  if (!supabase) {
    return { valid: false, error: 'Service not available' };
  }

  try {
    // Use database function to validate
    const { data, error } = await supabase.rpc('is_coupon_valid', {
      coupon_code: code.toUpperCase(),
      user_uuid: userId || null,
      order_amount: subtotal,
    });

    if (error) throw error;

    if (!data || !data.valid) {
      return {
        valid: false,
        error: data?.error || 'Invalid coupon code',
      };
    }

    const coupon = data.coupon as Coupon;

    // Calculate discount
    const { data: discountData, error: discountError } = await supabase.rpc(
      'calculate_discount',
      {
        coupon_code: code.toUpperCase(),
        subtotal_amount: subtotal,
      }
    );

    if (discountError) throw discountError;

    const discount = Number(discountData) || 0;

    return {
      valid: true,
      coupon,
      discount: Math.min(discount, subtotal), // Can't discount more than subtotal
    };
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return {
      valid: false,
      error: error.message || 'Failed to validate coupon',
    };
  }
}

/**
 * Apply coupon to order (track usage)
 */
export async function applyCouponToOrder(
  couponId: string,
  orderId: string,
  userId: string | null,
  email: string,
  discountAmount: number
): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    // Record coupon usage
    await serverClient.from('coupon_usage').insert({
      coupon_id: couponId,
      user_id: userId || null,
      order_id: orderId,
      email: email,
      discount_amount: discountAmount,
    });

    // Increment usage count
    await serverClient
      .from('coupons')
      .update({
        usage_count: supabase.rpc('increment', { x: 1 }),
      })
      .eq('id', couponId);

    return true;
  } catch (error) {
    console.error('Error applying coupon to order:', error);
    return false;
  }
}

/**
 * Get all active coupons (for admin)
 */
export async function getAllCoupons(): Promise<Coupon[]> {
  const serverClient = createServerClient();
  if (!serverClient) return [];

  try {
    const { data, error } = await serverClient
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Coupon[];
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
}

/**
 * Create new coupon (admin only)
 */
export async function createCoupon(coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<Coupon | null> {
  const serverClient = createServerClient();
  if (!serverClient) return null;

  try {
    const { data, error } = await serverClient
      .from('coupons')
      .insert([{
        ...coupon,
        code: coupon.code.toUpperCase(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    return null;
  }
}

/**
 * Update coupon (admin only)
 */
export async function updateCoupon(
  couponId: string,
  updates: Partial<Coupon>
): Promise<Coupon | null> {
  const serverClient = createServerClient();
  if (!serverClient) return null;

  try {
    const { data, error } = await serverClient
      .from('coupons')
      .update(updates)
      .eq('id', couponId)
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  } catch (error) {
    console.error('Error updating coupon:', error);
    return null;
  }
}

/**
 * Delete coupon (admin only)
 */
export async function deleteCoupon(couponId: string): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    const { error } = await serverClient
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return false;
  }
}

