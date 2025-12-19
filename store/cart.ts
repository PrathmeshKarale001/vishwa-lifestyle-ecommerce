import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Cart } from '@/types';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics';

// Constants
const SHIPPING_THRESHOLD = 0; // Free shipping for all
const SHIPPING_COST = 0;
const TAX_RATE = 0.18; // 18% GST

interface CartState extends Cart {
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;

  // UI State
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Calculate cart totals
const calculateTotals = (items: CartItem[], discount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Always free shipping
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * TAX_RATE);
  const total = subtotal - discount + shipping + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, shipping, tax, total, itemCount };
};

// Legacy promo codes (kept for backward compatibility, but now uses database)
// The applyPromoCode function now validates against the database

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
      promoCode: undefined,
      isCartOpen: false,

      // Add item to cart
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);

          let newItems: CartItem[];
          const quantityToAdd = item.quantity || 1;

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + quantityToAdd,
              item.maxQuantity
            );
            newItems = state.items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQuantity } : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity: quantityToAdd }];
          }

          // Track analytics
          trackAddToCart({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: quantityToAdd,
          });

          const totals = calculateTotals(newItems, state.discount);
          return { items: newItems, ...totals, isCartOpen: true };
        });
      },

      // Remove item from cart
      removeItem: (productId) => {
        set((state) => {
          const removedItem = state.items.find((i) => i.productId === productId);
          const newItems = state.items.filter((i) => i.productId !== productId);

          // Track analytics
          if (removedItem) {
            trackRemoveFromCart({
              id: removedItem.productId,
              name: removedItem.name,
              price: removedItem.price,
              quantity: removedItem.quantity,
            });
          }

          const totals = calculateTotals(newItems, state.discount);
          return { items: newItems, ...totals };
        });
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const removedItem = state.items.find((i) => i.productId === productId);
            const newItems = state.items.filter((i) => i.productId !== productId);

            // Track analytics
            if (removedItem) {
              trackRemoveFromCart({
                id: removedItem.productId,
                name: removedItem.name,
                price: removedItem.price,
                quantity: removedItem.quantity,
              });
            }

            const totals = calculateTotals(newItems, state.discount);
            return { items: newItems, ...totals };
          }

          const newItems = state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i
          );
          const totals = calculateTotals(newItems, state.discount);
          return { items: newItems, ...totals };
        });
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
          promoCode: undefined,
        });
      },

      // Apply promo code (now validates against database)
      applyPromoCode: async (code) => {
        const state = get();

        try {
          // Get user ID if available
          const { supabase } = await import('@/lib/supabase');
          const { data: { user } } = await supabase?.auth.getUser() || { data: { user: null } };

          // Validate coupon via API
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: code.toUpperCase(),
              subtotal: state.subtotal,
              user_id: user?.id,
            }),
          });

          const result = await response.json();

          if (!result.success || !result.discount) {
            return false;
          }

          const discount = result.discount;
          const totals = calculateTotals(state.items, discount);
          set({ discount, promoCode: code.toUpperCase(), ...totals });
          return true;
        } catch (error) {
          console.error('Error applying promo code:', error);
          return false;
        }
      },

      // Remove promo code
      removePromoCode: () => {
        set((state) => {
          const totals = calculateTotals(state.items, 0);
          return { discount: 0, promoCode: undefined, ...totals };
        });
      },

      // UI Actions
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: 'vishwa-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
        promoCode: state.promoCode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate totals on rehydration
          const totals = calculateTotals(state.items, state.discount);
          Object.assign(state, totals);
        }
      },
    }
  )
);
