import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid credentials
const hasValidCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://');

// Create Supabase client with proper auth configuration
export const supabase: SupabaseClient = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable hash fragment processing for OAuth
    },
  })
  : (null as unknown as SupabaseClient);

// Server-side client with service role key for admin operations
export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey || !hasValidCredentials) {
    if (!supabaseServiceKey) console.warn("createServerClient: SUPABASE_SERVICE_ROLE_KEY is missing!");
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
}

// ==========================================
// AUTH FUNCTIONS
// ==========================================

export async function signUp(email: string, password: string, name: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');

  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ==========================================
// PROFILE FUNCTIONS
// ==========================================

export async function getProfile(userId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  name?: string;
  phone?: string;
  avatar_url?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// ADDRESS FUNCTIONS
// ==========================================

export async function getAddresses(userId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addAddress(userId: string, address: {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  type?: 'home' | 'work' | 'other';
  is_default?: boolean;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  // If this is the default address, unset other defaults
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...address, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAddress(addressId: string, updates: Partial<{
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  type: 'home' | 'work' | 'other';
  is_default: boolean;
}>) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('addresses')
    .update(updates)
    .eq('id', addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAddress(addressId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) throw error;
}

// ==========================================
// ORDER FUNCTIONS
// ==========================================

export interface OrderData {
  order_number: string;
  user_id?: string;
  email: string;
  phone?: string;
  items: any[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: any;
  billing_address?: any;
  shipping_method?: string;
  promo_code?: string;
  razorpay_order_id?: string;
  status?: string;
  payment_status?: string;
}

export async function createOrder(order: OrderData) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrderByNumber(orderNumber: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrderById(orderId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

export async function getOrdersByUser(userId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string,
  details?: {
    payment_id?: string;
    payment_method?: string;
    payment_gateway_response?: any;
    failure_reason?: string;
  }
) {
  if (!supabase) throw new Error('Supabase not configured');

  const updates: any = { payment_status: paymentStatus };

  if (details?.payment_id) updates.payment_id = details.payment_id;
  if (details?.payment_method) updates.payment_method = details.payment_method;

  if (paymentStatus === 'paid') {
    updates.status = 'processing';
  }

  // Determine if searching by UUID id or human-readable order_number
  const filterColumn = orderId.startsWith('VL') ? 'order_number' : 'id';

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq(filterColumn, orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function updateOrderStatus(
  orderIdOrNumber: string,
  status: string,
  paymentStatus?: string,
  paymentId?: string
) {
  if (!supabase) throw new Error('Supabase not configured');

  const updates: any = { status };
  if (paymentStatus) updates.payment_status = paymentStatus;
  if (paymentId) updates.payment_id = paymentId;

  // Determine if searching by UUID id or human-readable order_number
  const filterColumn = orderIdOrNumber.startsWith('VL') ? 'order_number' : 'id';

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq(filterColumn, orderIdOrNumber)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderByRazorpayId(
  razorpayOrderId: string,
  updates: {
    status?: string;
    payment_status?: string;
    payment_id?: string;
    tracking_number?: string;
    tracking_url?: string;
  }
) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('razorpay_order_id', razorpayOrderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// WISHLIST FUNCTIONS (Server-side)
// ==========================================

export async function getWishlistItems(userId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addToWishlist(userId: string, product: {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image?: string;
  product_slug?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('wishlists')
    .insert({ ...product, user_id: userId })
    .select()
    .single();

  if (error && error.code !== '23505') throw error; // Ignore duplicate error
  return data;
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}

// ==========================================
// REVIEW FUNCTIONS
// ==========================================

export async function getProductReviews(productId: string) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addReview(review: {
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string;
  content: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// NEWSLETTER FUNCTIONS
// ==========================================

export async function subscribeToNewsletter(email: string, name?: string) {
  // Use createServerClient (service role) for reliable newsletter signups
  const serverClient = createServerClient();
  const client = serverClient || supabase;

  if (!client) throw new Error('Supabase not configured');

  const { error } = await client
    .from('newsletter_subscribers')
    .insert([{ email, name }]);

  if (error && error.code !== '23505') throw error;
  return true;
}

// ==========================================
// CONTACT FORM FUNCTIONS
// ==========================================

export async function submitContactForm(submission: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  // Use createServerClient (service role) for guaranteed delivery of contact messages
  const serverClient = createServerClient();
  const client = serverClient || supabase;

  if (!client) throw new Error('Supabase not configured');

  const { error } = await client
    .from('contact_submissions')
    .insert([submission]);

  if (error) throw error;
  return true;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VL${timestamp}${random}`;
}
