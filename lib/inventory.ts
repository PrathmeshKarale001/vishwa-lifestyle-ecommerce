import { supabase, createServerClient } from './supabase';

export interface InventoryItem {
  id: string;
  product_id: string;
  product_slug?: string;
  product_name: string;
  sku?: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  is_tracked: boolean;
  last_updated_at: string;
  created_at: string;
}

/**
 * Get inventory for a product
 */
export async function getInventory(productId: string): Promise<InventoryItem | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data as InventoryItem | null;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return null;
  }
}

/**
 * Get available quantity (quantity - reserved)
 */
export async function getAvailableQuantity(productId: string): Promise<number> {
  const inventory = await getInventory(productId);
  if (!inventory || !inventory.is_tracked) {
    return 999; // Assume in stock if not tracked
  }
  return Math.max(0, inventory.quantity - inventory.reserved_quantity);
}

/**
 * Check if product is in stock
 */
export async function isInStock(productId: string, quantity: number = 1): Promise<boolean> {
  const available = await getAvailableQuantity(productId);
  return available >= quantity;
}

/**
 * Reserve inventory (when order is placed)
 */
export async function reserveInventory(
  productId: string,
  quantity: number
): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    // 1. Fetch current inventory state
    const { data: current, error: fetchError } = await serverClient
      .from('inventory')
      .select('quantity, reserved_quantity, is_tracked')
      .eq('product_id', productId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking inventory for reservation:', fetchError);
      return false;
    }

    // If not tracked or not found, allow (business logic choice: don't block)
    if (!current || !current.is_tracked) {
      return true;
    }

    // 2. Check Availability
    if (current.quantity - current.reserved_quantity < quantity) {
      return false; // Out of stock
    }

    // 3. Update with Optimistic Concurrency Control (OCC)
    // We match on previous reserved_quantity to ensure no one else modified it in between
    const { error: updateError, count } = await serverClient
      .from('inventory')
      .update({
        reserved_quantity: current.reserved_quantity + quantity,
        last_updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .eq('reserved_quantity', current.reserved_quantity); // OCC Check

    if (updateError || count === 0) {
      // Update failed or race condition occurred
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error reserving inventory:', error);
    return false;
  }
}

/**
 * Release reserved inventory (when order is cancelled)
 */
export async function releaseInventory(
  productId: string,
  quantity: number
): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    const { data: current } = await serverClient
      .from('inventory')
      .select('reserved_quantity')
      .eq('product_id', productId)
      .single();

    if (current) {
      const newReserved = Math.max(0, (current.reserved_quantity || 0) - quantity);
      await serverClient
        .from('inventory')
        .update({
          reserved_quantity: newReserved,
          last_updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);
    }

    return true;
  } catch (error) {
    console.error('Error releasing inventory:', error);
    return false;
  }
}

/**
 * Deduct inventory (when order is confirmed/shipped)
 */
export async function deductInventory(
  productId: string,
  quantity: number
): Promise<boolean> {
  const serverClient = createServerClient();
  if (!serverClient) return false;

  try {
    const { error } = await serverClient.rpc('update_inventory', {
      product_id_text: productId,
      quantity_change: -quantity,
    });

    if (error) throw error;

    // Also release reserved quantity
    await releaseInventory(productId, quantity);

    return true;
  } catch (error) {
    console.error('Error deducting inventory:', error);
    return false;
  }
}

/**
 * Get low stock items
 */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  const serverClient = createServerClient();
  if (!serverClient) return [];

  try {
    const { data, error } = await serverClient
      .from('inventory')
      .select('*')
      .eq('is_tracked', true)
      .order('quantity', { ascending: true });

    if (error) throw error;

    // Filter low stock items in JavaScript
    const lowStockItems = (data || []).filter(
      (item: InventoryItem) => item.quantity <= (item.low_stock_threshold || 0)
    ) as InventoryItem[];

    return lowStockItems;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return [];
  }
}

/**
 * Update inventory (admin only)
 */
export async function updateInventory(
  productId: string,
  updates: {
    quantity?: number;
    reserved_quantity?: number;
    low_stock_threshold?: number;
    is_tracked?: boolean;
  }
): Promise<InventoryItem | null> {
  const serverClient = createServerClient();
  if (!serverClient) return null;

  try {
    const { data, error } = await serverClient
      .from('inventory')
      .update({
        ...updates,
        last_updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      // If inventory doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: created, error: createError } = await serverClient
          .from('inventory')
          .insert([{
            product_id: productId,
            quantity: updates.quantity || 0,
            reserved_quantity: updates.reserved_quantity || 0,
            low_stock_threshold: updates.low_stock_threshold || 10,
            is_tracked: updates.is_tracked !== false,
          }])
          .select()
          .single();

        if (createError) throw createError;
        return created as InventoryItem;
      }
      throw error;
    }

    return data as InventoryItem;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return null;
  }
}

