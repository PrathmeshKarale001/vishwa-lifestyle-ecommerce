// Recently viewed products utility

const STORAGE_KEY = 'vishwa_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  viewedAt: number;
}

/**
 * Add a product to recently viewed
 */
export function addToRecentlyViewed(product: {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getRecentlyViewed();
    
    // Remove if already exists (to move to top)
    const filtered = existing.filter(item => item.id !== product.id);
    
    // Add to beginning
    const updated: RecentlyViewedProduct[] = [
      {
        ...product,
        viewedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_ITEMS); // Keep only max items
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    // Ignore localStorage errors (private browsing, etc.)
    console.warn('Failed to save recently viewed:', error);
  }
}

/**
 * Get recently viewed products
 */
export function getRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const items: RecentlyViewedProduct[] = JSON.parse(stored);
    // Sort by viewedAt (most recent first)
    return items.sort((a, b) => b.viewedAt - a.viewedAt);
  } catch (error) {
    console.warn('Failed to load recently viewed:', error);
    return [];
  }
}

/**
 * Clear recently viewed
 */
export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear recently viewed:', error);
  }
}

/**
 * Remove a specific product from recently viewed
 */
export function removeFromRecentlyViewed(productId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter(item => item.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to remove from recently viewed:', error);
  }
}

