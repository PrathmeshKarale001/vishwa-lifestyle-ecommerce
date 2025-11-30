import { supabase, createServerClient } from './supabase';

export interface AbandonedCart {
  id: string;
  user_id?: string;
  email?: string;
  session_id?: string;
  items: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promo_code?: string;
  status: 'abandoned' | 'recovered' | 'expired';
  email_sent_count: number;
  last_email_sent_at?: string;
  recovered_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save abandoned cart
 */
export async function saveAbandonedCart(data: {
  user_id?: string;
  email?: string;
  session_id?: string;
  items: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promo_code?: string;
}): Promise<AbandonedCart | null> {
  if (!supabase) return null;

  try {
    // Check if cart already exists for this user/session
    const existingQuery = supabase
      .from('abandoned_carts')
      .select('id')
      .eq('status', 'abandoned')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data.user_id) {
      existingQuery.eq('user_id', data.user_id);
    } else if (data.session_id) {
      existingQuery.eq('session_id', data.session_id);
    } else if (data.email) {
      existingQuery.eq('email', data.email);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      // Update existing cart
      const { data: updated, error } = await supabase
        .from('abandoned_carts')
        .update({
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          shipping: data.shipping,
          tax: data.tax,
          total: data.total,
          promo_code: data.promo_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return updated as AbandonedCart;
    } else {
      // Create new abandoned cart
      const { data: created, error } = await supabase
        .from('abandoned_carts')
        .insert([{
          user_id: data.user_id || null,
          email: data.email || null,
          session_id: data.session_id || null,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          shipping: data.shipping,
          tax: data.tax,
          total: data.total,
          promo_code: data.promo_code,
        }])
        .select()
        .single();

      if (error) throw error;
      return created as AbandonedCart;
    }
  } catch (error) {
    console.error('Error saving abandoned cart:', error);
    return null;
  }
}

/**
 * Mark abandoned cart as recovered
 */
export async function recoverAbandonedCart(cartId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('abandoned_carts')
      .update({
        status: 'recovered',
        recovered_at: new Date().toISOString(),
      })
      .eq('id', cartId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error recovering abandoned cart:', error);
    return false;
  }
}

/**
 * Get abandoned carts that need email reminders
 */
export async function getAbandonedCartsForReminder(
  hoursSinceAbandonment: number = 24,
  maxEmails: number = 3
): Promise<AbandonedCart[]> {
  const serverClient = createServerClient();
  if (!serverClient) return [];

  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursSinceAbandonment);

    const { data, error } = await serverClient
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'abandoned')
      .lt('created_at', cutoffTime.toISOString())
      .or(`email_sent_count.lt.${maxEmails},email_sent_count.is.null`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as AbandonedCart[];
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    return [];
  }
}

/**
 * Mark email as sent for abandoned cart
 */
export async function markEmailSent(cartId: string): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    const { error } = await serverClient
      .from('abandoned_carts')
      .update({
        email_sent_count: supabase.rpc('increment', { x: 1 }), // Increment count
        last_email_sent_at: new Date().toISOString(),
      })
      .eq('id', cartId);

    if (error) {
      // Fallback: manual increment
      const { data: cart } = await serverClient
        .from('abandoned_carts')
        .select('email_sent_count')
        .eq('id', cartId)
        .single();

      if (cart) {
        await serverClient
          .from('abandoned_carts')
          .update({
            email_sent_count: (cart.email_sent_count || 0) + 1,
            last_email_sent_at: new Date().toISOString(),
          })
          .eq('id', cartId);
      }
    }

    return true;
  } catch (error) {
    console.error('Error marking email sent:', error);
    return false;
  }
}

/**
 * Track cart abandonment (call when user leaves checkout)
 */
export function trackCartAbandonment(cartData: {
  items: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promo_code?: string;
}) {
  // Get user info if available
  if (typeof window === 'undefined') return;

  const sessionId = sessionStorage.getItem('session_id') || 
                    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  if (!sessionStorage.getItem('session_id')) {
    sessionStorage.setItem('session_id', sessionId);
  }

  // Save to localStorage for recovery
  localStorage.setItem('abandoned_cart', JSON.stringify({
    ...cartData,
    session_id: sessionId,
    timestamp: Date.now(),
  }));

  // Also save to database (async, don't block)
  saveAbandonedCart({
    email: undefined, // Will be filled if user is logged in
    session_id: sessionId,
    ...cartData,
  }).catch(console.error);
}

