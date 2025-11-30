import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WishlistItem } from '@/types';
import { trackAddToWishlist } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  clearWishlist: () => void;
  syncWithServer: (userId: string) => Promise<void>;
  itemCount: number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,

      addItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) return state;

          // Track analytics
          trackAddToWishlist({
            id: item.productId,
            name: item.name,
            price: item.price,
          });

          const newItems = [
            ...state.items,
            { ...item, addedAt: new Date().toISOString() },
          ];
          
          return { items: newItems, itemCount: newItems.length };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.productId !== productId);
          return { items: newItems, itemCount: newItems.length };
        });
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      toggleItem: (item) => {
        const isInList = get().isInWishlist(item.productId);
        if (isInList) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => {
        set({ items: [], itemCount: 0 });
      },

      // Sync wishlist with server for logged-in users
      syncWithServer: async (userId: string) => {
        if (!supabase || !userId) return;

        try {
          // Get server wishlist
          const { data: serverItems } = await supabase
            .from('wishlists')
            .select('*')
            .eq('user_id', userId);

          const localItems = get().items;
          
          // Merge local and server wishlists
          const mergedItems = [...localItems];
          
          if (serverItems) {
            for (const serverItem of serverItems) {
              const exists = mergedItems.some(
                (i) => i.productId === serverItem.product_id
              );
              if (!exists) {
                mergedItems.push({
                  id: serverItem.id,
                  productId: serverItem.product_id,
                  name: serverItem.product_name || '',
                  price: serverItem.price || 0,
                  image: serverItem.image || '',
                  slug: serverItem.slug || '',
                  addedAt: serverItem.created_at,
                });
              }
            }
          }

          // Update local state
          set({ items: mergedItems, itemCount: mergedItems.length });

          // Sync back to server
          for (const item of mergedItems) {
            const { data: existing } = await supabase
              .from('wishlists')
              .select('id')
              .eq('user_id', userId)
              .eq('product_id', item.productId)
              .single();

            if (!existing) {
              await supabase.from('wishlists').insert({
                user_id: userId,
                product_id: item.productId,
                product_name: item.name,
                price: item.price,
                image: item.image,
                slug: item.slug,
              });
            }
          }
        } catch {
          // Silent fail - continue with local wishlist
        }
      },
    }),
    {
      name: 'vishwa-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
