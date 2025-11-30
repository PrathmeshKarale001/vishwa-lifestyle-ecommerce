// Product recommendations utility

import { getProducts } from './sanity';

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  inventory?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
}

/**
 * Get product recommendations based on current product
 */
export async function getProductRecommendations(
  currentProduct: Product,
  limit: number = 4
): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    
    // Filter out current product
    const otherProducts = allProducts.filter((p: Product) => p._id !== currentProduct._id);
    
    // Score products based on similarity
    const scored = otherProducts.map((product: Product) => ({
      product,
      score: calculateSimilarityScore(currentProduct, product),
    }));
    
    // Sort by score (highest first)
    scored.sort((a: { product: Product; score: number }, b: { product: Product; score: number }) => b.score - a.score);
    
    // Return top recommendations
    return scored.slice(0, limit).map((item: { product: Product; score: number }) => item.product);
  } catch (error) {
    // Log error but don't break the page
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting recommendations:', error);
    }
    return [];
  }
}

/**
 * Calculate similarity score between two products
 */
function calculateSimilarityScore(product1: Product, product2: Product): number {
  let score = 0;
  
  // Same category = high score
  if (product1.category === product2.category) {
    score += 10;
  }
  
  // Similar tags = medium score
  if (product1.tags && product2.tags) {
    const commonTags = product1.tags.filter(tag => product2.tags?.includes(tag));
    score += commonTags.length * 3;
  }
  
  // Similar price range = small score
  const priceDiff = Math.abs(product1.price - product2.price);
  const avgPrice = (product1.price + product2.price) / 2;
  if (avgPrice > 0) {
    const priceSimilarity = 1 - (priceDiff / avgPrice);
    score += priceSimilarity * 2;
  }
  
  // Best sellers get bonus
  if (product2.isBestSeller) {
    score += 5;
  }
  
  // New products get small bonus
  if (product2.isNew) {
    score += 2;
  }
  
  return score;
}

/**
 * Get "Frequently bought together" recommendations
 * (For now, returns products from same category)
 */
export async function getFrequentlyBoughtTogether(
  currentProduct: Product,
  limit: number = 3
): Promise<Product[]> {
  try {
    const allProducts = await getProducts();
    
    // Get products from same category
    const sameCategory = allProducts
      .filter((p: Product) => p._id !== currentProduct._id && p.category === currentProduct.category)
      .slice(0, limit);
    
    return sameCategory;
  } catch (error) {
    // Log error but don't break the page
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting frequently bought together:', error);
    }
    return [];
  }
}

