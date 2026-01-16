import { supabase, getURL } from './supabase';
import type { User } from '@supabase/supabase-js';

// Sign up with email and password
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getURL()}auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

// Update user profile
export async function updateProfile(updates: { name?: string; phone?: string; avatar_url?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }
}

// Get user profile
export async function getProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Get user addresses
export async function getAddresses() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Add address
export async function addAddress(address: {
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
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // If this is the default address, unset other defaults
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert([{ ...address, user_id: user.id }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Delete address
export async function deleteAddress(addressId: string) {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) {
    throw new Error(error.message);
  }
}

// Get user orders
export async function getOrders() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Get single order
export async function getOrder(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

