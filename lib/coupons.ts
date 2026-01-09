import { createServerClient, supabase } from "@/lib/supabase";
import { log } from "@/lib/logger";

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
  userId?: string,
  items: any[] = []
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}> {
  // Use Service Role client for validation to bypass RLS issues
  const serverClient = createServerClient();

  if (!serverClient) {
    log.warn("validateCoupon: Service Role Client NOT created. Falling back to Anon client. Check SUPABASE_SERVICE_ROLE_KEY.");
  }

  // Fallback or error if service role not available (shouldn't happen on server)
  const client = serverClient || supabase;
  if (!client) {
    log.error("validateCoupon: No Supabase client available.");
    return { valid: false, error: 'System error: Database client not available' };
  }

  try {
    // 1. Fetch Coupon
    const { data: couponData, error: fetchError } = await client
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError) {
      // Don't log "row not found" as error, it's a valid validation failure case
      if (fetchError.code !== 'PGRST116') {
        log.error("validateCoupon: Fetch Error", fetchError);
        return { valid: false, error: `System Error: ${fetchError.message}` };
      }
      return { valid: false, error: `Invalid coupon code` };
    }

    if (!couponData) {
      return { valid: false, error: `Invalid coupon code` };
    }

    const coupon = couponData as Coupon;

    // 2. Check Active Status
    if (!coupon.is_active) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // 3. Check Dates
    const now = new Date();
    if (new Date(coupon.valid_from) > now) {
      return { valid: false, error: 'This coupon is not yet valid' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // 4. Check Global Usage Limit
    if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'This coupon usage limit has been reached' };
    }

    // 5. Check User Limit
    if (coupon.user_limit != null && userId) {
      const { count, error: countError } = await client
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId);

      if (!countError && count !== null && count >= coupon.user_limit) {
        return { valid: false, error: 'You have already used this coupon' };
      }
    }

    // 6. Check Min Order Amount
    if (coupon.min_order_amount > 0 && subtotal < coupon.min_order_amount) {
      return { valid: false, error: `Minimum order amount of ₹${coupon.min_order_amount} required` };
    }

    // 7. Check Applicability & Calculate Discount
    let eligibleSubtotal = subtotal;

    // Logic for filtering eligible items
    if (coupon.applicable_to === 'categories') {
      const applicableCategories = coupon.applicable_ids || [];
      const eligibleItems = items.filter(item =>
        item.category && applicableCategories.includes(item.category)
      );

      if (eligibleItems.length === 0) {
        return { valid: false, error: 'This code is applied to specific categories but no matching items in cart.' };
      }
      eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else if (coupon.applicable_to === 'products') {
      const applicableProducts = coupon.applicable_ids || [];
      const eligibleItems = items.filter(item =>
        applicableProducts.includes(item.productId)
      );

      if (eligibleItems.length === 0) {
        return { valid: false, error: 'This code is applied to specific products but no matching items in cart.' };
      }
      eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Calculate Discount
    let calculatedDiscount = 0;
    if (coupon.type === 'percentage') {
      calculatedDiscount = (eligibleSubtotal * coupon.value) / 100;
    } else {
      calculatedDiscount = Math.min(coupon.value, eligibleSubtotal);
    }

    // Max Discount Limit
    if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
      calculatedDiscount = Math.min(calculatedDiscount, coupon.max_discount_amount);
    }

    // Ensure discount doesn't exceed total
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);

    return {
      valid: true,
      coupon,
      discount: Math.round(calculatedDiscount),
    };

  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return {
      valid: false,
      error: 'An unexpected error occurred during validation',
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

    // Increment usage count (Read-Modify-Write pattern)
    const { data: currentCoupon } = await serverClient
      .from('coupons')
      .select('usage_count')
      .eq('id', couponId)
      .single();

    if (currentCoupon) {
      await serverClient
        .from('coupons')
        .update({
          usage_count: (currentCoupon.usage_count || 0) + 1,
        })
        .eq('id', couponId);
    }

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
  if (!serverClient) {
    log.error("createCoupon: Service Role Client missing");
    throw new Error("Server configuration error: Missing Service Role Key");
  }

  log.info("createCoupon: Received data", coupon);

  try {
    const { data, error } = await serverClient
      .from('coupons')
      .insert([{
        ...coupon,
        code: coupon.code.toUpperCase(),
      }])
      .select()
      .single();

    if (error) {
      log.error("createCoupon: DB Insert Error", error);
      throw new Error(error.message);
    }
    return data as Coupon;
  } catch (error: any) {
    log.error('Error creating coupon:', error);
    throw error;
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

